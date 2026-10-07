"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "./cn";

export interface MarqueeProps {
  items: readonly string[];
  /** The list's accessible name. */
  label: string;
  /** Seconds per loop (default 48). */
  duration?: number;
  className?: string;
}

/**
 * Chip marquee with a real pause control (WCAG 2.2.2). Pauses on hover, focus-within, offscreen and with the button.
 * Reduced motion: a static wrapped row, no duplicates, no button.
 */
export function Marquee({ items, label, duration = 48, className }: MarqueeProps) {
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setOffscreen(!entries.some((e) => e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const stopped = paused || offscreen;
  return (
    <div className={cn("relative", className)}>
      <div
        ref={ref}
        data-paused={stopped ? "" : undefined}
        className="group/marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <ul
          aria-label={label}
          className="flex w-max motion-safe:animate-marquee group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] group-data-paused/marquee:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:gap-y-3"
        >
          {[...items, ...items].map((t, i) => (
            <li
              key={i}
              aria-hidden={i >= items.length || undefined}
              className={cn(
                "mr-3 shrink-0 rounded-full border border-line bg-surface px-4 py-2 text-ui whitespace-nowrap text-fg shadow-xs",
                i >= items.length && "motion-reduce:hidden",
              )}
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="mt-4 inline-flex h-11 items-center gap-2 rounded-full px-3 text-small font-medium text-fg-2 transition-colors hover:bg-sunken hover:text-fg motion-reduce:hidden [&_svg]:size-4"
      >
        {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        Pause examples
      </button>
    </div>
  );
}
