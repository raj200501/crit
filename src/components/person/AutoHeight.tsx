"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Animates its height when `step` changes (the panel's mode switches, DESIGN §12.3: 220 ms). Other content changes
 * (an age row revealing inside the form) just flow. Between animations it is height:auto with visible overflow, so focus
 * rings and popovers are never clipped. Reduced motion: no animation.
 */
export function AutoHeight({ step, children, className }: { step: string; children: ReactNode; className?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  // Track the settled height, so a step change knows where it starts from.
  useEffect(() => {
    const i = inner.current;
    if (!i) return;
    last.current = i.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (!outer.current?.getAnimations().length) last.current = i.offsetHeight;
    });
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    const from = last.current;
    if (!o || !i || from == null || typeof o.animate !== "function") return;
    const to = i.offsetHeight;
    last.current = to;
    if (Math.abs(to - from) < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    o.style.overflow = "hidden";
    const a = o.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" });
    const done = () => o.style.removeProperty("overflow");
    a.onfinish = done;
    a.oncancel = done;
    return () => a.cancel();
  }, [step]);

  return (
    <div ref={outer} className={className}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
