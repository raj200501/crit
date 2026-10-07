"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface InViewProps {
  /**
   * once: an element that mounts below the fold is armed (data-state="armed") and plays once when it scrolls in
   *       (data-state="shown"). SSR, no-JS, reduced motion and above-the-fold mounts keep the final state.
   * pause: toggles data-offscreen while the element is out of view, so CSS loops can pause there.
   */
  mode?: "once" | "pause";
  as?: ElementType;
  className?: string;
  id?: string;
  children?: ReactNode;
  "aria-labelledby"?: string;
}

/**
 * A tiny IntersectionObserver island. Children style themselves with group-data-[state=…]/inview or
 * group-data-offscreen/inview, so nothing re-renders and SSR always shows the finished state.
 */
export function InView({ mode = "once", as: Tag = "div", className, children, ...rest }: InViewProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (mode === "pause") {
      const io = new IntersectionObserver((entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (visible) delete el.dataset.offscreen;
        else el.dataset.offscreen = "";
      });
      io.observe(el);
      return () => io.disconnect();
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already in view: never armed
    el.dataset.state = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // one frame in the armed state, so the transition has a start value
        requestAnimationFrame(() => (el.dataset.state = "shown"));
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);
  return (
    <Tag ref={ref} className={cn("group/inview", className)} {...rest}>
      {children}
    </Tag>
  );
}
