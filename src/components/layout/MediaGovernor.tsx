"use client";

import { useEffect } from "react";
import { MOBILE_VIDEOS } from "@/lib/mobile-videos";

// Keeps video cheap without touching every component that renders one:
//  * small screens / Data Saver get the pre-encoded "-mobile" cut of a reel
//    (swapped before it starts downloading);
//  * weak devices (html[data-lite], see lib/lite.ts) never load video at all —
//    the poster / still under it stays;
//  * looping videos pause when they leave the screen or sit in a chapter that
//    is not on stage, and resume (if they autoplay) when they come back.
// Reel videos owned by CinematicStage (no `loop`) are only swapped/skipped, never
// paused here: the stage drives their playback itself.

const mobileOf = (src: string) => src.replace(/\.mp4$/, "-mobile.mp4");

export default function MediaGovernor() {
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const small = window.matchMedia("(max-width: 1023px)").matches || conn?.saveData === true;
    const lite = document.documentElement.hasAttribute("data-lite");

    const visible = new WeakMap<HTMLVideoElement, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          visible.set(e.target as HTMLVideoElement, e.isIntersecting);
          settle(e.target as HTMLVideoElement);
        }
      },
      { rootMargin: "80px" },
    );

    const onStage = (v: HTMLVideoElement) => {
      const pane = v.closest('[data-chapter-pane]');
      return !pane || pane.getAttribute("data-active") === "true";
    };

    function settle(v: HTMLVideoElement) {
      if (!v.loop || lite) return;
      const shouldPlay = visible.get(v) !== false && onStage(v) && !document.hidden;
      if (!shouldPlay && !v.paused) v.pause();
      else if (shouldPlay && v.paused && v.autoplay) v.play().catch(() => {});
    }

    const seen = new WeakSet<HTMLVideoElement>();
    const adopt = (v: HTMLVideoElement) => {
      const src = v.getAttribute("src");
      if (lite) {
        if (src) {
          v.removeAttribute("src");
          v.removeAttribute("autoplay");
          v.preload = "none";
          v.load();
        }
        return;
      }
      if (small && src && MOBILE_VIDEOS.has(src)) v.setAttribute("src", mobileOf(src));
      if (!seen.has(v)) {
        seen.add(v);
        io.observe(v);
      }
    };

    const scan = (root: ParentNode) => root.querySelectorAll("video").forEach(adopt);
    scan(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.target instanceof HTMLVideoElement) adopt(r.target);
        r.addedNodes.forEach((n) => {
          if (n instanceof HTMLVideoElement) adopt(n);
          else if (n instanceof Element) scan(n);
        });
        if (r.type === "attributes" && r.attributeName === "data-active") {
          (r.target as Element).querySelectorAll("video").forEach((v) => settle(v as HTMLVideoElement));
        }
      }
    });
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["src", "data-active"],
    });

    const onVis = () => document.querySelectorAll("video").forEach((v) => settle(v));
    document.addEventListener("visibilitychange", onVis);

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return null;
}
