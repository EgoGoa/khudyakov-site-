"use client";

import { useEffect, useRef } from "react";

// GPU fluid simulation (Navier-Stokes on a staggered-free grid, solved with
// jacobi pressure iterations) driven by the pointer. The cursor injects both
// velocity and dye; advection carries the dye along the velocity field,
// vorticity confinement re-injects the small curls the low-res grid would
// otherwise smear away, and dissipation fades everything back to black in a
// couple of seconds.
//
// Composited with mix-blend-mode: screen over an OPAQUE black canvas — screen
// against black is a no-op, so the page shows through everywhere the dye is
// absent, and we never have to deal with premultiplied-alpha edge cases.
//
// Desktop only, by design: touch devices have no persistent pointer and the
// simulation is the single most expensive thing on the page.

const SIM_RESOLUTION = 192;
const DYE_RESOLUTION = 1024;
const DENSITY_DISSIPATION = 1.5;
const VELOCITY_DISSIPATION = 0.1;
const PRESSURE = 0.8;
const PRESSURE_ITERATIONS = 20;
const CURL = 60;
const SPLAT_RADIUS = 0.00269;
// Ceiling the dye can approach but not exceed, so the plume stays a
// translucent wave over the page instead of a solid fill.
const DYE_CAP = 0.408;
// Extra jittered splats around each pointer sample — the wispiness lever.
const SATELLITES_PER_MOVE = 1;
// How far off the pointer path satellites may land, as a fraction of the
// viewport. A plain UV distance, deliberately independent of SPLAT_RADIUS.
const SPLAT_SPREAD = 0.0605;
// How much of each satellite's impulse is rotational rather than along the
// direction of travel. Raise it for more obvious curls, lower it for a
// straighter trail.
const SWIRL_STRENGTH = 1.05;
const SPLAT_FORCE = 6000;
const BLOOM_ITERATIONS = 6;
const BLOOM_RESOLUTION = 256;
const BLOOM_INTENSITY = 0.35;
const BLOOM_THRESHOLD = 0.132;
const BLOOM_SOFT_KNEE = 0.7;

// After the pointer goes quiet the field still needs time to dissipate; once
// it has, the rAF loop parks itself instead of burning GPU on a black frame.
const IDLE_GRACE_MS = 3200;

const BASE_VERTEX = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const COPY_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
void main () { gl_FragColor = texture2D(uTexture, vUv); }`;

const CLEAR_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;
void main () { gl_FragColor = value * texture2D(uTexture, vUv); }`;

const SPLAT_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
uniform float cap;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture2D(uTarget, vUv).xyz;
  vec3 result = base + splat;
  if (cap > 0.0) {
    // Headroom that shrinks as the cell fills, so dragging back and forth
    // over one spot deepens the plume instead of clipping it to white.
    result = base + splat * max(1.0 - base / cap, 0.0);
  }
  gl_FragColor = vec4(result, 1.0);
}`;

const ADVECTION_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
void main () {
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
  vec4 result = texture2D(uSource, coord);
  float decay = 1.0 + dissipation * dt;
  gl_FragColor = result / decay;
}`;

const DIVERGENCE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).x;
  float R = texture2D(uVelocity, vR).x;
  float T = texture2D(uVelocity, vT).y;
  float B = texture2D(uVelocity, vB).y;
  vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) { L = -C.x; }
  if (vR.x > 1.0) { R = -C.x; }
  if (vT.y > 1.0) { T = -C.y; }
  if (vB.y < 0.0) { B = -C.y; }
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;

const CURL_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uVelocity, vL).y;
  float R = texture2D(uVelocity, vR).y;
  float T = texture2D(uVelocity, vT).x;
  float B = texture2D(uVelocity, vB).x;
  float vorticity = R - L - T + B;
  gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}`;

const VORTICITY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
void main () {
  float L = texture2D(uCurl, vL).x;
  float R = texture2D(uCurl, vR).x;
  float T = texture2D(uCurl, vT).x;
  float B = texture2D(uCurl, vB).x;
  float C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * dt;
  velocity = min(max(velocity, -1000.0), 1000.0);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const PRESSURE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (L + R + B + T - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}`;

const GRADIENT_SUBTRACT_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
void main () {
  float L = texture2D(uPressure, vL).x;
  float R = texture2D(uPressure, vR).x;
  float T = texture2D(uPressure, vT).x;
  float B = texture2D(uPressure, vB).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity.xy -= vec2(R - L, T - B);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}`;

const BLOOM_PREFILTER_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec3 curve;
uniform float threshold;
void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  float br = max(c.r, max(c.g, c.b));
  float rq = clamp(br - curve.x, 0.0, curve.y);
  rq = curve.z * rq * rq;
  c *= max(rq, br - threshold) / max(br, 0.0001);
  gl_FragColor = vec4(c, 0.0);
}`;

const BLOOM_BLUR_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
void main () {
  vec4 sum = texture2D(uTexture, vL) + texture2D(uTexture, vR)
           + texture2D(uTexture, vT) + texture2D(uTexture, vB);
  gl_FragColor = sum * 0.25;
}`;

const BLOOM_FINAL_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
uniform float intensity;
void main () {
  vec4 sum = texture2D(uTexture, vL) + texture2D(uTexture, vR)
           + texture2D(uTexture, vT) + texture2D(uTexture, vB);
  gl_FragColor = sum * 0.25 * intensity;
}`;

// Output is opaque: the canvas is screen-blended over the page, and screen
// against black leaves the page untouched.
const DISPLAY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform sampler2D uBloom;
// The dye's own filament carries most of the visible energy and the bloom
// mip chain only adds a tight halo around it, so the trail reads as defined
// curling lines rather than as diffuse vapour.
const float CORE_WEIGHT = 0.75;
void main () {
  vec3 c = texture2D(uTexture, vUv).rgb * CORE_WEIGHT;
  c += texture2D(uBloom, vUv).rgb;
  gl_FragColor = vec4(c, 1.0);
}`;

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

export default function FluidSmoke() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    // Half-float render targets are what make the whole solver work at all —
    // 8-bit targets quantise the velocity field into visible stair-stepping.
    if (!gl.getExtension("EXT_color_buffer_float")) return;

    const HALF_FLOAT = gl.HALF_FLOAT;

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vertexShader = compile(gl.VERTEX_SHADER, BASE_VERTEX);

    function program(fragmentSource: string) {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, vertexShader);
      gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fragmentSource));
      gl!.linkProgram(p);
      const uniforms: Record<string, WebGLUniformLocation | null> = {};
      const count = gl!.getProgramParameter(p, gl!.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < count; i += 1) {
        const name = gl!.getActiveUniform(p, i)!.name;
        uniforms[name] = gl!.getUniformLocation(p, name);
      }
      return { program: p, uniforms };
    }

    const copyProgram = program(COPY_SHADER);
    const clearProgram = program(CLEAR_SHADER);
    const splatProgram = program(SPLAT_SHADER);
    const advectionProgram = program(ADVECTION_SHADER);
    const divergenceProgram = program(DIVERGENCE_SHADER);
    const curlProgram = program(CURL_SHADER);
    const vorticityProgram = program(VORTICITY_SHADER);
    const pressureProgram = program(PRESSURE_SHADER);
    const gradientSubtractProgram = program(GRADIENT_SUBTRACT_SHADER);
    const bloomPrefilterProgram = program(BLOOM_PREFILTER_SHADER);
    const bloomBlurProgram = program(BLOOM_BLUR_SHADER);
    const bloomFinalProgram = program(BLOOM_FINAL_SHADER);
    const displayProgram = program(DISPLAY_SHADER);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const quadIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    function blit(target: FBO | null) {
      if (target === null) {
        gl!.viewport(0, 0, gl!.drawingBufferWidth, gl!.drawingBufferHeight);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      } else {
        gl!.viewport(0, 0, target.width, target.height);
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, target.fbo);
      }
      gl!.drawElements(gl!.TRIANGLES, 6, gl!.UNSIGNED_SHORT, 0);
    }

    function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
      gl!.activeTexture(gl!.TEXTURE0);
      const texture = gl!.createTexture()!;
      gl!.bindTexture(gl!.TEXTURE_2D, texture);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, param);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

      const fbo = gl!.createFramebuffer()!;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
      gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, texture, 0);
      gl!.viewport(0, 0, w, h);
      gl!.clear(gl!.COLOR_BUFFER_BIT);

      return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        attach(id: number) {
          gl!.activeTexture(gl!.TEXTURE0 + id);
          gl!.bindTexture(gl!.TEXTURE_2D, texture);
          return id;
        },
      };
    }

    function createDoubleFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO {
      let fbo1 = createFBO(w, h, internalFormat, format, type, param);
      let fbo2 = createFBO(w, h, internalFormat, format, type, param);
      return {
        width: w,
        height: h,
        texelSizeX: 1 / w,
        texelSizeY: 1 / h,
        get read() { return fbo1; },
        set read(value: FBO) { fbo1 = value; },
        get write() { return fbo2; },
        set write(value: FBO) { fbo2 = value; },
        swap() { const temp = fbo1; fbo1 = fbo2; fbo2 = temp; },
      };
    }

    function resizeFBO(target: FBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      const next = createFBO(w, h, internalFormat, format, type, param);
      gl!.useProgram(copyProgram.program);
      gl!.uniform1i(copyProgram.uniforms.uTexture!, target.attach(0));
      blit(next);
      return next;
    }

    function resizeDoubleFBO(target: DoubleFBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number) {
      if (target.width === w && target.height === h) return target;
      target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
      target.write = createFBO(w, h, internalFormat, format, type, param);
      target.width = w;
      target.height = h;
      target.texelSizeX = 1 / w;
      target.texelSizeY = 1 / h;
      return target;
    }

    function resolution(target: number) {
      let aspectRatio = gl!.drawingBufferWidth / gl!.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1 / aspectRatio;
      const min = Math.round(target);
      const max = Math.round(target * aspectRatio);
      return gl!.drawingBufferWidth > gl!.drawingBufferHeight
        ? { width: max, height: min }
        : { width: min, height: max };
    }

    let dye: DoubleFBO;
    let velocity: DoubleFBO;
    let divergence: FBO;
    let curlFBO: FBO;
    let pressure: DoubleFBO;
    let bloomFBO: FBO;
    const bloomMips: FBO[] = [];

    function initFramebuffers() {
      const simRes = resolution(SIM_RESOLUTION);
      const dyeRes = resolution(DYE_RESOLUTION);
      const rgba = { internalFormat: gl!.RGBA16F, format: gl!.RGBA };
      const rg = { internalFormat: gl!.RG16F, format: gl!.RG };
      const r = { internalFormat: gl!.R16F, format: gl!.RED };
      const filtering = gl!.LINEAR;

      dye = dye
        ? resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, HALF_FLOAT, filtering)
        : createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, HALF_FLOAT, filtering);

      velocity = velocity
        ? resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, HALF_FLOAT, filtering)
        : createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, HALF_FLOAT, filtering);

      divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, HALF_FLOAT, gl!.NEAREST);
      curlFBO = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, HALF_FLOAT, gl!.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, HALF_FLOAT, gl!.NEAREST);

      // Bloom mip chain: the wide soft halo around the bright core comes from
      // these successive downsample+blur levels summed back onto the dye.
      const bloomRes = resolution(BLOOM_RESOLUTION);
      bloomFBO = createFBO(bloomRes.width, bloomRes.height, rgba.internalFormat, rgba.format, HALF_FLOAT, filtering);
      bloomMips.length = 0;
      for (let i = 0; i < BLOOM_ITERATIONS; i += 1) {
        const w = bloomRes.width >> (i + 1);
        const h = bloomRes.height >> (i + 1);
        if (w < 2 || h < 2) break;
        bloomMips.push(createFBO(w, h, rgba.internalFormat, rgba.format, HALF_FLOAT, filtering));
      }
    }

    let dpr = 1;
    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas!.width !== w || canvas!.height !== h) {
        canvas!.width = w;
        canvas!.height = h;
        return true;
      }
      return false;
    }

    resizeCanvas();
    initFramebuffers();

    function applyBloom(source: FBO, destination: FBO) {
      if (bloomMips.length < 2) return;
      let last = destination;

      gl!.disable(gl!.BLEND);
      gl!.useProgram(bloomPrefilterProgram.program);
      const knee = BLOOM_THRESHOLD * BLOOM_SOFT_KNEE + 0.0001;
      gl!.uniform3f(
        bloomPrefilterProgram.uniforms.curve!,
        BLOOM_THRESHOLD - knee,
        knee * 2,
        0.25 / knee,
      );
      gl!.uniform1f(bloomPrefilterProgram.uniforms.threshold!, BLOOM_THRESHOLD);
      gl!.uniform1i(bloomPrefilterProgram.uniforms.uTexture!, source.attach(0));
      blit(last);

      gl!.useProgram(bloomBlurProgram.program);
      for (let i = 0; i < bloomMips.length; i += 1) {
        const dest = bloomMips[i];
        gl!.uniform2f(bloomBlurProgram.uniforms.texelSize!, last.texelSizeX, last.texelSizeY);
        gl!.uniform1i(bloomBlurProgram.uniforms.uTexture!, last.attach(0));
        blit(dest);
        last = dest;
      }

      gl!.blendFunc(gl!.ONE, gl!.ONE);
      gl!.enable(gl!.BLEND);
      for (let i = bloomMips.length - 2; i >= 0; i -= 1) {
        const baseTex = bloomMips[i];
        gl!.uniform2f(bloomBlurProgram.uniforms.texelSize!, last.texelSizeX, last.texelSizeY);
        gl!.uniform1i(bloomBlurProgram.uniforms.uTexture!, last.attach(0));
        blit(baseTex);
        last = baseTex;
      }

      gl!.disable(gl!.BLEND);
      gl!.useProgram(bloomFinalProgram.program);
      gl!.uniform2f(bloomFinalProgram.uniforms.texelSize!, last.texelSizeX, last.texelSizeY);
      gl!.uniform1i(bloomFinalProgram.uniforms.uTexture!, last.attach(0));
      gl!.uniform1f(bloomFinalProgram.uniforms.intensity!, BLOOM_INTENSITY);
      blit(destination);
    }

    function step(dt: number) {
      gl!.disable(gl!.BLEND);

      gl!.useProgram(curlProgram.program);
      gl!.uniform2f(curlProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(curlProgram.uniforms.uVelocity!, velocity.read.attach(0));
      blit(curlFBO);

      gl!.useProgram(vorticityProgram.program);
      gl!.uniform2f(vorticityProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(vorticityProgram.uniforms.uVelocity!, velocity.read.attach(0));
      gl!.uniform1i(vorticityProgram.uniforms.uCurl!, curlFBO.attach(1));
      gl!.uniform1f(vorticityProgram.uniforms.curl!, CURL);
      gl!.uniform1f(vorticityProgram.uniforms.dt!, dt);
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(divergenceProgram.program);
      gl!.uniform2f(divergenceProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(divergenceProgram.uniforms.uVelocity!, velocity.read.attach(0));
      blit(divergence);

      gl!.useProgram(clearProgram.program);
      gl!.uniform1i(clearProgram.uniforms.uTexture!, pressure.read.attach(0));
      gl!.uniform1f(clearProgram.uniforms.value!, PRESSURE);
      blit(pressure.write);
      pressure.swap();

      gl!.useProgram(pressureProgram.program);
      gl!.uniform2f(pressureProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(pressureProgram.uniforms.uDivergence!, divergence.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i += 1) {
        gl!.uniform1i(pressureProgram.uniforms.uPressure!, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
      }

      gl!.useProgram(gradientSubtractProgram.program);
      gl!.uniform2f(gradientSubtractProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      gl!.uniform1i(gradientSubtractProgram.uniforms.uPressure!, pressure.read.attach(0));
      gl!.uniform1i(gradientSubtractProgram.uniforms.uVelocity!, velocity.read.attach(1));
      blit(velocity.write);
      velocity.swap();

      gl!.useProgram(advectionProgram.program);
      gl!.uniform2f(advectionProgram.uniforms.texelSize!, velocity.texelSizeX, velocity.texelSizeY);
      const velocityId = velocity.read.attach(0);
      gl!.uniform1i(advectionProgram.uniforms.uVelocity!, velocityId);
      gl!.uniform1i(advectionProgram.uniforms.uSource!, velocityId);
      gl!.uniform1f(advectionProgram.uniforms.dt!, dt);
      gl!.uniform1f(advectionProgram.uniforms.dissipation!, VELOCITY_DISSIPATION);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform2f(advectionProgram.uniforms.texelSize!, dye.texelSizeX, dye.texelSizeY);
      gl!.uniform1i(advectionProgram.uniforms.uVelocity!, velocity.read.attach(0));
      gl!.uniform1i(advectionProgram.uniforms.uSource!, dye.read.attach(1));
      gl!.uniform1f(advectionProgram.uniforms.dissipation!, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();
    }

    function render() {
      applyBloom(dye.read, bloomFBO);
      gl!.disable(gl!.BLEND);
      gl!.useProgram(displayProgram.program);
      gl!.uniform1i(displayProgram.uniforms.uTexture!, dye.read.attach(0));
      gl!.uniform1i(displayProgram.uniforms.uBloom!, bloomFBO.attach(1));
      blit(null);
    }

    function splat(
      x: number,
      y: number,
      dx: number,
      dy: number,
      color: [number, number, number],
      radiusScale = 1,
    ) {
      gl!.useProgram(splatProgram.program);
      gl!.uniform1i(splatProgram.uniforms.uTarget!, velocity.read.attach(0));
      gl!.uniform1f(splatProgram.uniforms.aspectRatio!, canvas!.width / canvas!.height);
      gl!.uniform2f(splatProgram.uniforms.point!, x, y);
      gl!.uniform3f(splatProgram.uniforms.color!, dx, dy, 0);
      // The gaussian in the splat shader works in UV space, which is
      // anisotropic on a wide viewport — widen the radius by the aspect ratio
      // so the injected blob stays round instead of squashing vertically.
      const aspectRatio = canvas!.width / canvas!.height;
      const base = SPLAT_RADIUS * radiusScale;
      const radius = aspectRatio > 1 ? base * aspectRatio : base;
      gl!.uniform1f(splatProgram.uniforms.radius!, radius);
      gl!.uniform1f(splatProgram.uniforms.cap!, 0);
      blit(velocity.write);
      velocity.swap();

      gl!.uniform1i(splatProgram.uniforms.uTarget!, dye.read.attach(0));
      gl!.uniform3f(splatProgram.uniforms.color!, color[0], color[1], color[2]);
      gl!.uniform1f(splatProgram.uniforms.cap!, DYE_CAP);
      blit(dye.write);
      dye.swap();
    }

    // Cyan family only — #00d2ff is the brand's --glow, the paler tint is
    // --glow-pale. Randomising inside that band keeps the plume alive without
    // ever drifting off-brand into green or violet.
    function splatColor(): [number, number, number] {
      const pale = Math.random() < 0.3;
      const k = 0.084 + Math.random() * 0.042;
      return pale
        ? [0.64 * k, 0.96 * k, 0.99 * k]
        : [0.0, 0.82 * k, 1.0 * k];
    }

    const pointer = {
      x: 0,
      y: 0,
      prevX: 0,
      prevY: 0,
      moved: false,
      down: false,
    };
    let lastActivity = 0;
    let running = false;
    let raf = 0;
    let lastTime = performance.now();

    function correctDelta(delta: number, axis: "x" | "y") {
      const aspectRatio = canvas!.width / canvas!.height;
      if (axis === "x" && aspectRatio < 1) return delta * aspectRatio;
      if (axis === "y" && aspectRatio > 1) return delta / aspectRatio;
      return delta;
    }

    function applyPointer() {
      if (!pointer.moved) return;
      pointer.moved = false;
      const dx = correctDelta(pointer.x - pointer.prevX, "x") * SPLAT_FORCE;
      const dy = correctDelta(pointer.y - pointer.prevY, "y") * SPLAT_FORCE;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;

      splat(pointer.x, pointer.y, dx, dy, splatColor());

      for (let i = 0; i < SATELLITES_PER_MOVE; i += 1) {
        const jx = (Math.random() - 0.5) * 2 * SPLAT_SPREAD;
        const jy = (Math.random() - 0.5) * 2 * SPLAT_SPREAD;
        const along = 0.3 + Math.random() * 0.45;
        const spin = (i % 2 === 0 ? 1 : -1) * (0.45 + Math.random() * 0.5) * SWIRL_STRENGTH;
        const color = splatColor();
        splat(
          pointer.x + jx,
          pointer.y + jy,
          dx * along - dy * spin,
          dy * along + dx * spin,
          [color[0] * 0.6, color[1] * 0.6, color[2] * 0.6],
          0.45 + Math.random() * 0.8,
        );
      }
    }

    function frame() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      if (resizeCanvas()) initFramebuffers();
      applyPointer();
      step(dt);
      render();

      // Nothing has been injected for a while and the dye has had time to
      // dissipate — park the loop instead of rendering black frames forever.
      if (now - lastActivity > IDLE_GRACE_MS) {
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(frame);
    }

    function wake() {
      lastActivity = performance.now();
      if (running || document.hidden) return;
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(frame);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      if (!pointer.moved) {
        pointer.prevX = pointer.x;
        pointer.prevY = pointer.y;
      }
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
      wake();
    };

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX / window.innerWidth;
      pointer.y = 1 - e.clientY / window.innerHeight;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        running = false;
      }
    };

    const onResize = () => wake();

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onEnter, { passive: true });
    document.addEventListener("pointerenter", onEnter, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onEnter);
      document.removeEventListener("pointerenter", onEnter);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
      // Deliberately NOT calling WEBGL_lose_context here. If the canvas node
      // outlives the effect — React's dev double-invoke, or an HMR update —
      // the next run calls getContext() on the very element whose context we
      // just killed and gets the dead one back, so the simulation silently
      // renders nothing. Dropping the component drops the canvas, and the
      // context goes with it.
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // z-[70] sits above the page chrome (header z-50, VibeRail z-65) but
      // below CenterModal (z-100), so dialogs stay clean.
      className="pointer-events-none fixed inset-0 z-[70] hidden h-full w-full sm:block"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
