"use client";

import { useEffect } from "react";
import { MOBILE_VIDEOS } from "@/lib/mobile-videos";
import { getTier, isSlowNet, onTierChange } from "@/lib/perf-tier";

// Keeps video cheap without touching every component that renders one:
//  * small screens, Data Saver and 2G connections get the
//    pre-encoded "-mobile" cut of a reel
//    (swapped before it starts downloading);
//  * weak devices (html[data-lite], see lib/lite.ts) never load video at all —
//    the poster / still under it stays;
//  * mid-range devices (html[data-mid]) keep video, but only ONE looping clip
//    decodes at a time — several autoplay backgrounds decoding together (the
//    welcome cards play four at once) is what pushed mid-range phones into
//    the crash-and-reload loop lite mode exists to catch. The most recently
//    revealed clip wins; the rest sit on their poster frame, paused, and
//    resume the moment they become the newest one on screen again;
//  * looping videos pause when they leave the screen or sit in a chapter that
//    is not on stage, and resume (if they autoplay) when they come back.
// Reel videos owned by CinematicStage (no `loop`) are only swapped/skipped, never
// paused here: the stage drives their playback itself.

const mobileOf = (src: string) => src.replace(/\.mp4$/, "-mobile.mp4");

export default function MediaGovernor() {
  useEffect(() => {
    const small = window.matchMedia("(max-width: 1023px)").matches || isSlowNet();
    // Read live, not once: PerfGovernor can step the tier down mid-visit.
    let lite = getTier() === "low";
    let mid = getTier() === "mid";

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

    // Один играющий looping-ролик за раз на data-mid: список — очередь
    // недавно проигранных, самый свежий остаётся жить, остальные ставятся на
    // паузу без выгрузки src (чтобы мгновенно возобновились, когда снова
    // станут самыми свежими).
    let nowPlaying: HTMLVideoElement | null = null;

    function settle(v: HTMLVideoElement) {
      if (!v.loop) return;
      if (lite) {
        if (!v.paused) v.pause();
        return;
      }
      const shouldPlay = visible.get(v) !== false && onStage(v) && !document.hidden;
      if (!shouldPlay) {
        if (!v.paused) v.pause();
        if (nowPlaying === v) nowPlaying = null;
        return;
      }
      if (mid && nowPlaying && nowPlaying !== v) {
        if (!nowPlaying.paused) nowPlaying.pause();
      }
      if (v.paused && v.autoplay) v.play().catch(() => {});
      if (mid) nowPlaying = v;
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
      if (small && src && MOBILE_VIDEOS.has(src)) {
        v.setAttribute("src", mobileOf(src));
        // Swapping the source restarts loading; make sure an autoplay
        // background actually resumes on browsers that don't do it themselves.
        if (v.autoplay) v.play().catch(() => {});
      }
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

    // A live downgrade: already-loaded clips are paused (lite) or thinned to
    // one at a time (mid) rather than unloaded — their bytes are spent.
    const stopTierWatch = onTierChange((tier) => {
      lite = tier === "low";
      mid = tier === "mid";
      nowPlaying = null;
      onVis();
    });

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stopTierWatch();
    };
  }, []);

  return null;
}
