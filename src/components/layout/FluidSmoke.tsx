"use client";

import { useEffect, useRef } from "react";

// Pointer-driven smoke: soft like the real thing, but with every curl
// readable.
//
// A GPU fluid (Navier-Stokes, jacobi pressure, vorticity confinement) is
// stirred by the cursor, and a density field ("dye") is carried by it. What
// makes it read as structured smoke rather than as a soft «пушок»:
//
//  - Dye is laid down as a few THIN streams along the cursor path (small
//    gaussian sprites every couple of pixels, spaced by path length, not
//    once per frame) — thin sheets are what the flow can visibly fold.
//  - Next to the path the cursor drops spinning impulses, alternating side
//    and direction (a Kármán street). The sheets wind around them into
//    spirals, and because momentum decays slowly the eddies keep turning
//    for a moment after the cursor has passed, the way real smoke does.
//  - Spin and eddy size scale with cursor speed: a lazy drag leaves small
//    tight curls, a flick throws big open ones.
//  - No bloom. Display adds a faint highlight on density gradients — the
//    folded edges of a sheet glow a touch brighter, like backlit smoke —
//    and a soft shoulder instead of a hard clip.
//
// Emission is spaced by path LENGTH and the path is re-drawn as a spline, so
// a slow browser (Safari) gets the same smooth trail as a fast one instead
// of piling everything into one blob at the few frames it manages to draw.
//
// Composited with mix-blend-mode: screen over an OPAQUE black canvas — screen
// against black is a no-op, so the page shows through everywhere else.
//
// Desktop only, by design: touch devices have no persistent pointer.

// ── Fluid ────────────────────────────────────────────────────────────────
const SIM_RESOLUTION = 256;
const DYE_RESOLUTION = 900;
// How fast momentum dies. Low enough that eddies keep turning ~1.5s after
// the cursor leaves them, high enough that they don't drift off on their own.
const VELOCITY_DISSIPATION = 2.2;
// How fast the smoke itself fades.
const DENSITY_DISSIPATION = 9;
const PRESSURE = 0.8;
const PRESSURE_ITERATIONS = 20;
// Vorticity confinement: keeps small curls from being smeared by the grid.
const CURL = 14;
// Gaussian radius of the push along the path (UV², before aspect fix).
const SPLAT_RADIUS = 0.0001;
// The cursor is a hand moving through smoke: it shoves the air in front of
// it at close to its own speed, so the fresh smoke is driven AHEAD of the
// cursor and rolls up at the front instead of being left behind as a tail.
const FOLLOW = 0.9;
// Smoke appears this far ahead of the cursor along its direction of travel
// (css px), further on a fast move.
const LEAD = 5;
const LEAD_FAST = 14;
// Cursor speed (css px/s) beyond which a flick stops getting stronger.
const MAX_SPEED = 3000;
const SPLAT_SPACING = 8;
// Eddies: one every VORTEX_SPACING px of travel, just off the path,
// alternating side and spin. Radius in css px grows with speed.
const VORTEX_SPACING = 27;
const VORTEX_GAIN = 0.8;
const VORTEX_RADIUS = 8;
const VORTEX_RADIUS_FAST = 14;
const VORTEX_OFFSET = 0.85;

// ── Smoke emission ───────────────────────────────────────────────────────
// Parallel thin streams, css px apart, each with its own slow weave.
const STREAMS = 3;
const STREAM_GAP = 2;
const STREAM_WOBBLE = 1.25;
const EMIT_SPACING = 2;
// Gaussian sigma of one dye sprite, css px — slow and fast.
const EMIT_SIGMA = 2.2;
const EMIT_SIGMA_FAST = 2.9;
const EMIT_STRENGTH = 0.068;
// Display: overall exposure, and how strongly the soft top light shapes
// the smoke into volume (0 = flat).
const EXPOSURE = 1.5;
const SHADING = 0.35;

// ── Air ──────────────────────────────────────────────────────────────────
// What keeps the smoke alive and unpredictable after the cursor has gone:
// warm smoke drifts up (buoyancy, sim texels/s² per unit density) and slow,
// ever-changing air currents (curl noise, only where there is smoke) nudge
// every curl somewhere slightly different each time.
const BUOYANCY = 10;
const TURBULENCE = 9;
// Size of the air currents, css px, and how fast they morph.
const TURBULENCE_SCALE = 90;
const TURBULENCE_DRIFT = 0.22;

// A pause longer than this (ms) ends the stroke, so the next movement does
// not join the old path with a straight chord.
const STROKE_BREAK_MS = 220;
// How quickly smoke softens as it ages (per second): fresh smoke is crisp
// and bright, and within a fraction of a second it has blurred into haze
// and faded — no long trail.
const DIFFUSION = 6;
// After the pointer goes quiet the field still needs time to fade; once it
// has, the rAF loop parks itself instead of burning GPU on a black frame.
const IDLE_GRACE_MS = 1400;

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
uniform vec2 force;
uniform vec2 point;
uniform float radius;
void main () {
  vec2 p = vUv - point.xy;
  p.x *= aspectRatio;
  vec2 base = texture2D(uTarget, vUv).xy;
  // Drag, not add: the air near the cursor is pulled TOWARD the cursor's
  // velocity. Adding would stack every overlapping impulse along the path
  // into one over-pressured bubble whose rim reads as a hard bright shell.
  gl_FragColor = vec4(mix(base, force, 0.5 * exp(-dot(p, p) / radius)), 0.0, 1.0);
}`;

// A spinning impulse: tangential velocity around \`point\`, peaking at ~0.7R
// and gone by ~2R. Works in css px so the eddy is round on any aspect.
const VORTEX_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget;
uniform vec2 viewport;
uniform vec2 point;
uniform float radius;
uniform float spin;
void main () {
  vec2 p = (vUv - point) * viewport;
  float q = dot(p, p) / (radius * radius);
  vec2 base = texture2D(uTarget, vUv).xy;
  vec2 v = vec2(-p.y, p.x) / radius * exp(-q) * spin;
  gl_FragColor = vec4(base + v, 0.0, 1.0);
}`;

// Semi-Lagrangian advection. \`texelSize\` is always the VELOCITY grid's, so
// dye and momentum travel at the same speed and the smoke actually follows
// the eddies it sits in.
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
  gl_FragColor = texture2D(uSource, coord) / (1.0 + dissipation * dt);
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

// Dye emission: one small gaussian sprite per instance, blended additively
// straight into the dye texture — any number of them in a single draw.
const SPRITE_VERTEX = `#version 300 es
precision highp float;
layout(location = 0) in vec4 aSprite; // x, y (css px), sigma (css px), strength
uniform vec2 uViewport;
out vec2 vLocal;
out float vStrength;
void main () {
  int v = gl_VertexID;
  vec2 corner = vec2(v == 1 || v == 2 || v == 4 ? 1.0 : -1.0, v >= 2 && v != 3 ? 1.0 : -1.0);
  vec2 local = corner * 3.0;
  vec2 p = aSprite.xy + local * aSprite.z;
  vLocal = local;
  vStrength = aSprite.w;
  gl_Position = vec4(p.x / uViewport.x * 2.0 - 1.0, 1.0 - p.y / uViewport.y * 2.0, 0.0, 1.0);
}`;

const SPRITE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vLocal;
in float vStrength;
uniform vec3 uColor;
out vec4 outColor;
void main () {
  float g = exp(-0.5 * dot(vLocal, vLocal));
  outColor = vec4(uColor * g * vStrength, 1.0);
}`;

// Output is opaque: the canvas is screen-blended over the page, and screen
// against black leaves the page untouched.
// Buoyancy + curl-noise air currents, applied to the velocity field only
// where smoke actually is (so fresh smoke still leaves the cursor cleanly).
const AIR_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uDye;
uniform vec2 viewport;
uniform float time;
uniform float dt;
uniform float buoyancy;
uniform float turbulence;
uniform float scale;
float hash (vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise (vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
// Two octaves sliding in different directions, so the pattern morphs
// instead of just translating.
float field (vec2 p) {
  return noise(p + vec2(time * 0.7, -time)) * 0.65
       + noise(p * 2.03 + vec2(-time * 1.3, time * 0.4) + 17.0) * 0.35;
}
void main () {
  vec2 v = texture2D(uVelocity, vUv).xy;
  float d = texture2D(uDye, vUv).b;
  float mask = smoothstep(0.0, 0.12, d);
  vec2 p = vUv * viewport / scale;
  float e = 0.05;
  float nx = field(p + vec2(0.0, e)) - field(p - vec2(0.0, e));
  float ny = field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0));
  vec2 curlNoise = vec2(nx, -ny) / (2.0 * e);
  v += dt * (curlNoise * turbulence * mask + vec2(0.0, buoyancy * d));
  gl_FragColor = vec4(v, 0.0, 1.0);
}`;

// Each frame blends the dye a little toward its neighbours' average, so
// the older a wisp is, the softer it gets.
const DIFFUSE_SHADER = `
precision mediump float;
precision mediump sampler2D;
varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uTexture;
uniform float amount;
void main () {
  vec4 c = texture2D(uTexture, vUv);
  vec4 avg = 0.25 * (texture2D(uTexture, vL) + texture2D(uTexture, vR)
                   + texture2D(uTexture, vT) + texture2D(uTexture, vB));
  gl_FragColor = mix(c, avg, amount);
}`;

// Output is opaque: the canvas is screen-blended over the page, and screen
// against black leaves the page untouched.
//
// Volume without hard edges: the density's own gradient (sampled wide, so
// it is smooth) acts as a surface normal lit softly from above-left. Thin
// wisps stay a translucent brand cyan, thick folds go paler toward white —
// the way dense smoke scatters more light.
const DISPLAY_SHADER = `
precision highp float;
precision highp sampler2D;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uTexture;
uniform float exposure;
uniform float shading;
void main () {
  float d = texture2D(uTexture, vUv).b;
  float gx = texture2D(uTexture, vR).b - texture2D(uTexture, vL).b;
  float gy = texture2D(uTexture, vT).b - texture2D(uTexture, vB).b;
  vec3 n = normalize(vec3(-gx * 6.0, -gy * 6.0, 1.0));
  float light = 1.0 + shading * dot(n, normalize(vec3(-0.45, 0.6, 0.65)) - vec3(0.0, 0.0, 0.65));
  float thick = 1.0 - exp(-d * exposure);
  vec3 thin = vec3(0.12, 0.78, 1.0);
  vec3 dense = vec3(0.55, 0.9, 1.0);
  vec3 c = mix(thin, dense, smoothstep(0.35, 1.0, thick)) * thick * max(light, 0.0);
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

type Sample = { x: number; y: number; t: number };

// Max dye sprites per frame; a huge jump beyond this just keeps the tail.
const MAX_SPRITES = 6000;

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

    const baseVertex = compile(gl.VERTEX_SHADER, BASE_VERTEX);

    function program(fragmentSource: string, vertex: WebGLShader = baseVertex) {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, vertex);
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

    const clearProgram = program(CLEAR_SHADER);
    const splatProgram = program(SPLAT_SHADER);
    const vortexProgram = program(VORTEX_SHADER);
    const advectionProgram = program(ADVECTION_SHADER);
    const divergenceProgram = program(DIVERGENCE_SHADER);
    const curlProgram = program(CURL_SHADER);
    const vorticityProgram = program(VORTICITY_SHADER);
    const pressureProgram = program(PRESSURE_SHADER);
    const gradientSubtractProgram = program(GRADIENT_SUBTRACT_SHADER);
    const displayProgram = program(DISPLAY_SHADER);
    const airProgram = program(AIR_SHADER);
    const diffuseProgram = program(DIFFUSE_SHADER);
    const spriteProgram = program(SPRITE_FRAGMENT, compile(gl.VERTEX_SHADER, SPRITE_VERTEX));
    if (!gl.getProgramParameter(spriteProgram.program, gl.LINK_STATUS)) return;

    // Fullscreen quad for the solver passes lives on the default VAO.
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    const quadIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quadIndices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // Dye sprites get their own VAO: one vec4 per instance.
    const spriteData = new Float32Array(MAX_SPRITES * 4);
    const spriteVao = gl.createVertexArray();
    gl.bindVertexArray(spriteVao);
    const spriteBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, spriteBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, spriteData.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(0, 1);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);

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
      gl!.clearColor(0, 0, 0, 0);
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

    function initFramebuffers() {
      // A resize restarts the field — a moment of calm, never a visible jump
      // worth the complexity of resampling smoke that fades in seconds anyway.
      const simRes = resolution(SIM_RESOLUTION);
      const dyeRes = resolution(DYE_RESOLUTION);
      dye = createDoubleFBO(dyeRes.width, dyeRes.height, gl!.RGBA16F, gl!.RGBA, HALF_FLOAT, gl!.LINEAR);
      velocity = createDoubleFBO(simRes.width, simRes.height, gl!.RG16F, gl!.RG, HALF_FLOAT, gl!.LINEAR);
      divergence = createFBO(simRes.width, simRes.height, gl!.R16F, gl!.RED, HALF_FLOAT, gl!.NEAREST);
      curlFBO = createFBO(simRes.width, simRes.height, gl!.R16F, gl!.RED, HALF_FLOAT, gl!.NEAREST);
      pressure = createDoubleFBO(simRes.width, simRes.height, gl!.R16F, gl!.RED, HALF_FLOAT, gl!.NEAREST);
    }

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      gl!.useProgram(airProgram.program);
      gl!.uniform1i(airProgram.uniforms.uVelocity!, velocity.read.attach(0));
      gl!.uniform1i(airProgram.uniforms.uDye!, dye.read.attach(1));
      gl!.uniform2f(airProgram.uniforms.viewport!, window.innerWidth, window.innerHeight);
      gl!.uniform1f(airProgram.uniforms.time!, (performance.now() / 1000) * TURBULENCE_DRIFT);
      gl!.uniform1f(airProgram.uniforms.dt!, dt);
      gl!.uniform1f(airProgram.uniforms.buoyancy!, BUOYANCY);
      gl!.uniform1f(airProgram.uniforms.turbulence!, TURBULENCE);
      gl!.uniform1f(airProgram.uniforms.scale!, TURBULENCE_SCALE);
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

      gl!.uniform1i(advectionProgram.uniforms.uVelocity!, velocity.read.attach(0));
      gl!.uniform1i(advectionProgram.uniforms.uSource!, dye.read.attach(1));
      gl!.uniform1f(advectionProgram.uniforms.dissipation!, DENSITY_DISSIPATION);
      blit(dye.write);
      dye.swap();

      gl!.useProgram(diffuseProgram.program);
      gl!.uniform2f(diffuseProgram.uniforms.texelSize!, dye.texelSizeX, dye.texelSizeY);
      gl!.uniform1i(diffuseProgram.uniforms.uTexture!, dye.read.attach(0));
      gl!.uniform1f(diffuseProgram.uniforms.amount!, Math.min(DIFFUSION * dt, 0.8));
      blit(dye.write);
      dye.swap();
    }

    function render() {
      gl!.disable(gl!.BLEND);
      gl!.useProgram(displayProgram.program);
      gl!.uniform2f(displayProgram.uniforms.texelSize!, dye.texelSizeX * 3, dye.texelSizeY * 3);
      gl!.uniform1i(displayProgram.uniforms.uTexture!, dye.read.attach(0));
      gl!.uniform1f(displayProgram.uniforms.exposure!, EXPOSURE);
      gl!.uniform1f(displayProgram.uniforms.shading!, SHADING);
      blit(null);
    }

    function splat(x: number, y: number, fx: number, fy: number, radius: number) {
      // The gaussian works in UV space, which is anisotropic on a wide
      // viewport — widen it by the aspect ratio so the impulse stays round.
      const aspectRatio = canvas!.width / canvas!.height;
      gl!.useProgram(splatProgram.program);
      gl!.uniform1i(splatProgram.uniforms.uTarget!, velocity.read.attach(0));
      gl!.uniform1f(splatProgram.uniforms.aspectRatio!, aspectRatio);
      gl!.uniform2f(splatProgram.uniforms.point!, x, y);
      gl!.uniform2f(splatProgram.uniforms.force!, fx, fy);
      gl!.uniform1f(splatProgram.uniforms.radius!, aspectRatio > 1 ? radius * aspectRatio : radius);
      blit(velocity.write);
      velocity.swap();
    }

    function vortex(x: number, y: number, radius: number, spin: number) {
      gl!.useProgram(vortexProgram.program);
      gl!.uniform1i(vortexProgram.uniforms.uTarget!, velocity.read.attach(0));
      gl!.uniform2f(vortexProgram.uniforms.viewport!, window.innerWidth, window.innerHeight);
      gl!.uniform2f(vortexProgram.uniforms.point!, x, y);
      gl!.uniform1f(vortexProgram.uniforms.radius!, radius);
      gl!.uniform1f(vortexProgram.uniforms.spin!, spin);
      blit(velocity.write);
      velocity.swap();
    }

    // Brand cyan (#00d2ff, --glow) leaning a touch toward --glow-pale, so
    // the densest folds read as light rather than as saturated paint.
    const smokeColor: [number, number, number] = [0.18, 0.84, 1.0];

    let spriteCount = 0;
    function flushSprites() {
      if (!spriteCount) return;
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, dye.read.fbo);
      gl!.viewport(0, 0, dye.width, dye.height);
      gl!.useProgram(spriteProgram.program);
      gl!.uniform2f(spriteProgram.uniforms.uViewport!, window.innerWidth, window.innerHeight);
      gl!.uniform3f(spriteProgram.uniforms.uColor!, smokeColor[0], smokeColor[1], smokeColor[2]);
      gl!.enable(gl!.BLEND);
      gl!.blendFunc(gl!.ONE, gl!.ONE);
      gl!.bindVertexArray(spriteVao);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, spriteBuffer);
      gl!.bufferSubData(gl!.ARRAY_BUFFER, 0, spriteData, 0, spriteCount * 4);
      gl!.drawArraysInstanced(gl!.TRIANGLES, 0, 6, spriteCount);
      gl!.bindVertexArray(null);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, quad);
      gl!.disable(gl!.BLEND);
      spriteCount = 0;
    }

    // ── Pointer path → impulses + smoke emission ──────────────────────────
    const samples: Sample[] = [];
    const win: Sample[] = [];
    let pathDist = 0;
    let emitCarry = 0;
    let splatCarry = 0;
    let vortexCarry = 0;
    let vortexSide = 1;
    let vortexGap = VORTEX_SPACING;
    const streamOffset: number[] = [];
    const streamWobble: { freq: number; phase: number; gain: number; width: number }[] = [];
    for (let s = 0; s < STREAMS; s += 1) {
      // Stream 0 (the wide body) runs down the middle, wisps either side.
      streamOffset.push(s === 0 ? 0 : (s % 2 ? -1 : 1) * Math.ceil(s / 2) * STREAM_GAP * (0.7 + Math.random() * 0.6));
      streamWobble.push({
        freq: 0.01 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        gain: s === 0 ? 0.6 : 0.45,
        // Layers of different thickness read as depth: one soft wide body,
        // the rest thin wisps.
        width: s === 0 ? 2.2 : 0.8,
      });
    }

    // Walks one straight chord of the (already smoothed) cursor path. The
    // carries hold the distance walked since the last drop, so spacing stays
    // even across chords and across frames.
    function walk(ax: number, ay: number, bx: number, by: number, speed: number) {
      const dx = bx - ax;
      const dy = by - ay;
      const len = Math.hypot(dx, dy);
      if (len < 0.001) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const ux = dx / len;
      const uy = dy / len;
      const energy = speed / MAX_SPEED;

      // Faster = a wider but thinner-per-pixel stream, so a flick does not
      // lay down a thick bright bar.
      const sigma = EMIT_SIGMA + (EMIT_SIGMA_FAST - EMIT_SIGMA) * energy;
      const strength = EMIT_STRENGTH * (1 - 0.35 * energy);
      const lead = LEAD + (LEAD_FAST - LEAD) * energy;
      let lastEmit = -1;
      for (let d = EMIT_SPACING - emitCarry; d <= len; d += EMIT_SPACING) {
        const px = ax + ux * (d + lead);
        const py = ay + uy * (d + lead);
        for (let s = 0; s < STREAMS && spriteCount < MAX_SPRITES; s += 1) {
          const wob = streamWobble[s];
          const off = streamOffset[s] + STREAM_WOBBLE * Math.sin((pathDist + d) * wob.freq + wob.phase);
          const o = spriteCount * 4;
          spriteData[o] = px - uy * off;
          spriteData[o + 1] = py + ux * off;
          spriteData[o + 2] = sigma * wob.width;
          spriteData[o + 3] = strength * wob.gain;
          spriteCount += 1;
        }
        lastEmit = d;
      }
      emitCarry = lastEmit < 0 ? emitCarry + len : len - lastEmit;

      // Fluid units: sim texels per second. The sim grid is square in
      // pixels, so one factor serves both axes.
      const toSim = velocity.width / w;
      let lastSplat = -1;
      for (let d = SPLAT_SPACING - splatCarry; d <= len; d += SPLAT_SPACING) {
        const along = speed * FOLLOW * toSim;
        // Screen y points down, UV y points up.
        splat((ax + ux * d) / w, 1 - (ay + uy * d) / h, ux * along, -uy * along, SPLAT_RADIUS * (0.6 + energy));
        lastSplat = d;
      }
      splatCarry = lastSplat < 0 ? splatCarry + len : len - lastSplat;

      // Irregular on purpose: a fixed rhythm of identical eddies reads as an
      // ornament, not as smoke. Each gap, side, size and spin is re-rolled.
      let lastVortex = -1;
      for (let d = vortexGap - vortexCarry; d <= len; d = lastVortex + vortexGap) {
        if (Math.random() < 0.75) vortexSide = -vortexSide;
        const r = (VORTEX_RADIUS + (VORTEX_RADIUS_FAST - VORTEX_RADIUS) * energy) * (0.7 + Math.random() * 0.6);
        const off = r * VORTEX_OFFSET * vortexSide * (0.6 + Math.random() * 0.8);
        // Dropped ahead of the cursor, among the fresh smoke it is pushing,
        // so the curls form at the front and the cursor drives them on.
        const x = ax + ux * (d + lead) - uy * off;
        const y = ay + uy * (d + lead) + ux * off;
        // Opposite spin on opposite sides, the way a pushed front rolls up
        // into a pair of counter-rotating curls.
        const spin = -speed * VORTEX_GAIN * toSim * vortexSide * (0.5 + Math.random() * 0.8);
        vortex(x / w, 1 - y / h, r, spin);
        lastVortex = d;
        vortexCarry = 0;
        vortexGap = VORTEX_SPACING * (0.55 + Math.random() * 0.9);
      }
      vortexCarry = lastVortex < 0 ? vortexCarry + len : len - lastVortex;

      pathDist += len;
    }

    // Raw pointer samples arrive as a polyline (sparse when the browser is
    // busy). The path is re-drawn as a Catmull-Rom spline through them, one
    // sample behind, so a fast curve stays a round curve instead of turning
    // into a polygon of straight chords.
    function consumePath() {
      if (!samples.length) return;
      for (const s of samples) {
        const prev = win[win.length - 1];
        if (!prev || s.t - prev.t > STROKE_BREAK_MS) {
          win.length = 0;
          win.push(s);
          emitCarry = EMIT_SPACING;
          splatCarry = SPLAT_SPACING;
          vortexCarry = VORTEX_SPACING * 0.5;
          continue;
        }
        if (Math.hypot(s.x - prev.x, s.y - prev.y) < 1) continue;
        win.push(s);
        if (win.length > 4) win.shift();
        if (win.length < 3) continue;

        const n = win.length;
        const p1 = win[n - 3];
        const p2 = win[n - 2];
        const p3 = win[n - 1];
        const p0 = n === 4 ? win[0] : p1;
        const chord = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const speed = Math.min((chord / Math.max(p2.t - p1.t, 4)) * 1000, MAX_SPEED);
        const steps = Math.max(1, Math.ceil(chord / 2));
        let ax = p1.x;
        let ay = p1.y;
        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps;
          const t2 = t * t;
          const t3 = t2 * t;
          const bx = 0.5 * (2 * p1.x + (p2.x - p0.x) * t
            + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2
            + (3 * p1.x - p0.x - 3 * p2.x + p3.x) * t3);
          const by = 0.5 * (2 * p1.y + (p2.y - p0.y) * t
            + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2
            + (3 * p1.y - p0.y - 3 * p2.y + p3.y) * t3);
          walk(ax, ay, bx, by, speed);
          ax = bx;
          ay = by;
        }
      }
      samples.length = 0;
    }

    let lastActivity = 0;
    let running = false;
    let raf = 0;
    let lastTime = performance.now();

    function frame() {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 1 / 30);
      lastTime = now;

      if (resizeCanvas()) initFramebuffers();
      consumePath();
      step(dt);
      // Fresh smoke goes in AFTER advection, so the newest part of the trail
      // sits exactly on the cursor path instead of one step downstream.
      flushSprites();
      render();

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
      // Coalesced events carry every hardware sample between frames, so a
      // fast curve keeps its shape.
      const list = typeof e.getCoalescedEvents === "function" ? e.getCoalescedEvents() : [];
      if (list.length) {
        for (const c of list) samples.push({ x: c.clientX, y: c.clientY, t: c.timeStamp });
      } else {
        samples.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      }
      wake();
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        running = false;
        win.length = 0;
      }
    };

    const onResize = () => wake();

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
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
      // z-[130]: above everything, the intro splash (z-120) and modals
      // (z-100) included — the smoke follows the cursor over any element.
      // pointer-events-none + screen blend keep it purely visual.
      className="pointer-events-none fixed inset-0 z-[130] hidden h-full w-full sm:block"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
