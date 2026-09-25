"use client";

import { useEffect } from "react";
import { getTier, setTier, type Tier } from "@/lib/perf-tier";

// Corrects the before-first-paint tier guess (lib/lite.ts) with what the
// device actually does. It only ever steps DOWN — high → mid → low — never up
// within a visit, so the page doesn't flicker between looks.
//
//  1. GPU check, once: no WebGL at all, or a software renderer (SwiftShader,
//     llvmpipe, "Microsoft Basic Render") means every blur and gradient is
//     drawn by the CPU — that machine goes straight to low.
//  2. Frame watchdog: every ~8s it samples requestAnimationFrame for 2s. A
//     window counts as bad when a quarter of its frames took longer than 50ms
//     (visible stutter) or it averaged under 20fps. Two bad windows in a row
//     step the tier down one level. A steady 30fps (iPhone Low Power Mode caps
//     rAF there) is NOT a stutter and doesn't trigger it — only uneven,
//     dropping frames do.
//     Sampling in bursts, not with a permanent rAF loop, because a loop that
//     never stops forces the browser to paint 60 frames a second forever —
//     the very cost this is here to cut.
//
// A downgrade is written to sessionStorage (the same midAuto/liteAuto keys the
// head snippet reads), so the next page of the visit starts at the lower tier
// with no flash. `?lite=0` / `?mid=0` (forced normal, for testing) switch the
// governor off.

const SAMPLE_MS = 2000;
const GAP_MS = 8000;
const FIRST_DELAY_MS = 2500;

function softwareGpu(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl") || c.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return true;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

function stepDown(to: Tier) {
  setTier(to);
  try {
    sessionStorage.setItem(to === "low" ? "liteAuto" : "midAuto", "1");
  } catch {}
}

export default function PerfGovernor() {
  useEffect(() => {
    try {
      if (localStorage.getItem("lite") === "0" || localStorage.getItem("mid") === "0") return;
    } catch {}
    if (getTier() === "low") return;

    if (softwareGpu()) {
      stepDown("low");
      return;
    }

    let raf = 0;
    let timer = 0;
    let badStreak = 0;
    let stopped = false;

    const sample = () => {
      if (stopped) return;
      if (document.hidden) {
        timer = window.setTimeout(sample, GAP_MS);
        return;
      }
      const start = performance.now();
      let prev = start;
      let frames = 0;
      let long = 0;
      const tick = (now: number) => {
        // A tab that went to the background mid-sample returns one huge gap —
        // throw that window away rather than read it as a stutter.
        if (document.hidden) {
          timer = window.setTimeout(sample, GAP_MS);
          return;
        }
        const dt = now - prev;
        prev = now;
        if (dt > 0) {
          frames += 1;
          if (dt > 50) long += 1;
        }
        if (now - start < SAMPLE_MS) {
          raf = requestAnimationFrame(tick);
          return;
        }
        const fps = (frames * 1000) / (now - start);
        const bad = frames > 0 && (long / frames >= 0.25 || fps < 20);
        badStreak = bad ? badStreak + 1 : 0;
        if (badStreak >= 2) {
          badStreak = 0;
          const tier = getTier();
          stepDown(tier === "high" ? "mid" : "low");
          if (getTier() === "low") {
            stopped = true;
            return;
          }
        }
        timer = window.setTimeout(sample, GAP_MS);
      };
      raf = requestAnimationFrame((t) => {
        prev = t;
        raf = requestAnimationFrame(tick);
      });
    };

    timer = window.setTimeout(sample, FIRST_DELAY_MS);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
