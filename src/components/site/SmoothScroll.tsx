"use client";

import { useEffect } from "react";

/**
 * Lenis smooth scroll on (site) routes only, and only with a fine pointer and motion allowed.
 * Loaded with a dynamic import after mount, so it never blocks first paint. Inner scroll panes opt out with data-lenis-prevent.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroyed = false;
    let lenis: { destroy(): void } | undefined;
    import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;
      lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.12 });
    });
    return () => {
      destroyed = true;
      lenis?.destroy();
    };
  }, []);
  return null;
}
