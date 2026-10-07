"use client";

import { useLayoutEffect, type DependencyList, type RefObject } from "react";

/**
 * Plays a short entrance on the element whenever `deps` change (Web Animations API, so it never waits for the lazily
 * loaded motion features and never leaves content hidden). Reduced motion keeps only the fade.
 */
export function useEnter(ref: RefObject<HTMLElement | null>, opts: { x?: number; duration?: number }, deps: DependencyList) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof el.animate !== "function") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from: Keyframe = { opacity: 0 };
    if (opts.x && !reduce) from.transform = `translateX(${opts.x}px)`;
    const a = el.animate([from, { opacity: 1, transform: "none" }], { duration: opts.duration ?? 160, easing: "cubic-bezier(0.2, 0, 0, 1)" });
    return () => a.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
