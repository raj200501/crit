"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scroll on (site) routes only, and only with a fine pointer and motion allowed.
 * Loaded with a dynamic import after mount, so it never blocks first paint. Inner scroll panes opt out with data-lenis-prevent.
 *
 * Lenis's own `autoRaf` re-queues requestAnimationFrame forever (the main thread wakes at 60 Hz on an idle page), so the
 * loop here runs only while Lenis is moving: input or a scroll kicks it, and it stops once Lenis settles.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroyed = false;
    let cleanup: (() => void) | undefined;
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.12 });
      let id = 0;
      const loop = (t: number) => {
        lenis.raf(t);
        id = lenis.isScrolling ? requestAnimationFrame(loop) : 0;
      };
      const kick = () => {
        if (id) return;
        lenis.time = 0; // the first frame after a rest advances by 0 ms, not by the whole idle gap
        id = requestAnimationFrame(loop);
      };
      const opts = { passive: true } as const;
      const events = ["wheel", "touchstart", "keydown", "pointerdown", "click", "scroll"] as const;
      events.forEach((e) => window.addEventListener(e, kick, opts));
      const off = lenis.on("scroll", kick);
      kick();
      cleanup = () => {
        events.forEach((e) => window.removeEventListener(e, kick));
        off?.();
        cancelAnimationFrame(id);
        lenis.destroy();
      };
    });
    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, []);
  return null;
}
