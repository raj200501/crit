"use client";

import { useLayoutEffect, type RefObject } from "react";

// The active-item indicators (segmented pills, nav underlines, the TOC rule) glide between items with a tiny FLIP on
// the Web Animations API instead of motion's layout feature, so the root LazyMotion only needs `domAnimation` (the
// layout/drag bundle was ~42 KB gzip of first-load JS on every route). Positions are kept per indicator id at module
// level, so an indicator that remounts (a new page under the same nav) still glides from where it was.
const last = new Map<string, { x: number; y: number; w: number; h: number }>();

function rectIn(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const scope = el.closest<HTMLElement>("[data-glide-scope]")?.getBoundingClientRect();
  return { x: r.left - (scope?.left ?? 0), y: r.top - (scope?.top ?? 0), w: r.width, h: r.height };
}

/**
 * Call in the component that renders the indicator inside the active item. `key` is the active value; the indicator is
 * the element in `ref` (absolutely positioned inside the active item). Reduced motion: no glide.
 */
export function useGlide(id: string, ref: RefObject<HTMLElement | null>, key: unknown) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !el.isConnected) return;
    const next = rectIn(el);
    const prev = last.get(id);
    last.set(id, next);
    if (!prev || window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof el.animate !== "function") return;
    const dx = prev.x - next.x;
    const dy = prev.y - next.y;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(prev.w - next.w) < 1 && Math.abs(prev.h - next.h) < 1) return;
    if (next.w === 0 || next.h === 0) return; // hidden at this breakpoint
    el.animate(
      [
        { translate: `${dx}px ${dy}px`, width: `${prev.w}px`, height: `${prev.h}px` },
        { translate: "0px 0px", width: `${next.w}px`, height: `${next.h}px` },
      ],
      { duration: 340, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [id, ref, key]);
}
