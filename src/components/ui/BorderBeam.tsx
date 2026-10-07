"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "./cn";

export interface BorderBeamProps {
  children?: ReactNode;
  /** false: a plain hairline border, no beam. */
  active?: boolean;
  /** loop: rotates while in view. once: one 2.4 s lap, then a static gradient border. */
  mode?: "loop" | "once";
  /** Outer radius in px (the content gets radius − 1). */
  radius?: number;
  className?: string;
  /** Classes for the inner surface that holds `children`. */
  contentClassName?: string;
}

/**
 * The compositor-only beam border (D1 recipe C). Used in exactly two places: the landing "two readers"
 * sheet (loop) and the reviewed /summary sheet (once). Reduced motion shows a static gradient border.
 */
export function BorderBeam({ children, active = true, mode = "loop", radius = 20, className, contentClassName }: BorderBeamProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [lapDone, setLapDone] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active || mode !== "loop" || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setInView(entries.some((e) => e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, [active, mode]);

  const beamStyle: CSSProperties =
    mode === "once"
      ? { animationDuration: "2.4s", animationIterationCount: 1, animationFillMode: "forwards", animationTimingFunction: "var(--ease-in-out-sine)" }
      : { animationPlayState: inView ? "running" : "paused" };
  const showStatic = active && mode === "once" && lapDone;

  return (
    <div
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden p-px",
        active ? (showStatic ? "bg-[linear-gradient(135deg,var(--color-lumen),var(--color-evergreen-600)_55%,var(--color-lumen))]" : "bg-line") : "bg-line",
        className,
      )}
      style={{ borderRadius: radius }}
    >
      {active && !showStatic ? <div aria-hidden className="beam-sweep" style={beamStyle} onAnimationEnd={() => setLapDone(true)} /> : null}
      <div className={cn("relative h-full bg-surface", contentClassName)} style={{ borderRadius: Math.max(0, radius - 1) }}>
        {children}
      </div>
    </div>
  );
}
