"use client";

import { animate } from "motion/react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "./cn";
import { EASE, DUR } from "./motion";
import { SourceTag } from "./SourceTag";

export interface StatTickerProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  source: string;
  cite: number;
  /** Draws a 0–100% range bar with 10% ticks, filled to the value. */
  bar?: boolean;
  /** false renders the static numeral (no count-up). */
  animated?: boolean;
  className?: string;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A cited stat (D1 recipe F). The server renders the real value. Only a stat that mounts below the viewport
 * resets to 0 (offscreen, so nobody sees it) and counts up once when it scrolls in. Reduced motion: final value.
 * Print always shows the final value and a full bar (CSS only, so it holds for page.pdf() too, which fires no beforeprint).
 */
export function StatTicker({ value, decimals = 0, prefix = "", suffix = "", label, source, cite, bar, animated = true, className }: StatTickerProps) {
  const num = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const fmt = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const final = fmt.format(value);

  useIsoLayoutEffect(() => {
    const el = num.current;
    const barEl = fill.current;
    if (!animated || !el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // visible at mount: keep the real value
    const f = new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    el.textContent = f.format(0);
    if (barEl) barEl.style.transform = "scaleX(0)";
    let stop: (() => void) | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const c = animate(0, value, { duration: DUR.count, ease: EASE.outExpo, onUpdate: (v) => (el.textContent = f.format(v)) });
        stop = () => c.stop();
        if (barEl) {
          barEl.style.transition = `transform ${DUR.count}s var(--ease-out-expo)`;
          barEl.style.transform = "scaleX(1)";
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
      el.textContent = f.format(value);
      if (barEl) barEl.style.transform = "";
    };
  }, [animated, value, decimals]);

  const pct = Math.max(0, Math.min(100, value));
  // Word units (" min") are set smaller than the numeral so a four-column row never wraps.
  const wordUnit = /[a-z]/i.test(suffix);
  const unit = suffix ? <span className={wordUnit ? "ml-[0.08em] text-[0.42em] tracking-normal" : undefined}>{wordUnit ? suffix.trim() : suffix}</span> : null;
  return (
    <figure className={cn("flex flex-col gap-4 border-t border-line pt-6", className)}>
      <p className="font-display text-stat font-book whitespace-nowrap text-fg tabular-nums lining-nums">
        <span className="sr-only">
          {prefix}
          {final}
          {suffix}
        </span>
        <span aria-hidden className="print:hidden">
          {prefix}
          <span ref={num}>{final}</span>
          {unit}
        </span>
        <span aria-hidden className="hidden print:inline">
          {prefix}
          {final}
          {unit}
        </span>
      </p>
      {bar ? (
        <span aria-hidden className="relative block h-1.5 overflow-hidden rounded-full bg-sunken">
          <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_calc(10%-1px),var(--ui-line-strong)_calc(10%-1px),var(--ui-line-strong)_10%)]" />
          <span ref={fill} className="absolute inset-y-0 left-0 origin-left rounded-full bg-brand print:[transform:none]!" style={{ width: `${pct}%` }} />
        </span>
      ) : (
        // Same rhythm as a stat with a bar, so captions in a row share a baseline
        <span aria-hidden className="block h-1.5 max-sm:hidden" />
      )}
      <figcaption className="flex flex-col gap-3">
        <span className="max-w-[34ch] text-body text-fg-2">{label}</span>
        <SourceTag cite={cite}>{source}</SourceTag>
      </figcaption>
    </figure>
  );
}
