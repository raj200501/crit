"use client";

import { useRef, type CSSProperties, type ElementType, type PointerEvent, type ReactNode } from "react";
import { cn } from "./cn";

export interface SpotlightCardProps {
  children?: ReactNode;
  className?: string;
  /** Surface wash alpha (default .08; night uses .10). */
  intensity?: number;
  as?: ElementType;
}

/**
 * A card whose surface and hairline light up under the mouse (D1 recipe D). The pointer position goes into
 * CSS vars, so there is no React re-render. Touch is ignored; keyboard focus inside lights it from the top.
 */
export function SpotlightCard({ children, className, intensity = 0.08, as: Tag = "div" }: SpotlightCardProps) {
  const ref = useRef<HTMLElement>(null);
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || !window.matchMedia("(hover: hover)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={ref}
      onPointerMove={onPointerMove}
      style={{ "--spot-a": intensity } as CSSProperties}
      className={cn(
        "group/spot relative isolate rounded-lg border border-line bg-surface text-fg [--spot-rgb:14_107_87] [--x:50%] [--y:0%] dark:[--spot-a:0.10] dark:[--spot-rgb:127_230_197]",
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(420px_circle_at_var(--x)_var(--y),rgb(var(--spot-rgb)/var(--spot-a)),transparent_60%)] opacity-0 transition-opacity duration-300 group-focus-within/spot:opacity-100 group-hover/spot:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [background:radial-gradient(260px_circle_at_var(--x)_var(--y),rgb(var(--spot-rgb)/0.55),transparent_70%)] group-focus-within/spot:opacity-100 group-hover/spot:opacity-100"
      />
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}
