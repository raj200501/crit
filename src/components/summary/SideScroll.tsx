"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A sideways-scrolling box for the pedigree when the column is narrower than its legible size (phones). It opens at the
 * left edge (a crop in the middle of a word reads like a rendering bug), and fades only the edge that has more to show
 * (`data-more`), so the crop reads as "scroll for more". Only while it actually overflows is it a focusable, labelled
 * region (so a keyboard can scroll it).
 */
export function SideScroll({ children, className, label }: { children: ReactNode; className?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflows(max > 1);
      const left = el.scrollLeft > 1;
      const right = el.scrollLeft < max - 1;
      el.dataset.more = left && right ? "both" : left ? "left" : right ? "right" : "";
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    el.addEventListener("scroll", check, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", check);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      {...(overflows ? { tabIndex: 0, role: "region", "aria-label": label } : {})}
    >
      {children}
    </div>
  );
}
