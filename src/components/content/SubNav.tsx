"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/components/ui/cn";
import { useGlide } from "@/components/ui/useGlide";
import { useScrollSpy } from "./useScrollSpy";

export interface SubNavProps {
  items: readonly { id: string; label: string }[];
  /** The nav's accessible name. */
  label: string;
  className?: string;
}

/**
 * Sticky in-page navigation under the site nav (DESIGN §10.4): a glass pill of section links with a gliding active
 * pill (scroll-spy, aria-current="location"). On narrow screens it scrolls sideways and keeps the current link in view.
 */
export function SubNav({ items, label, className }: SubNavProps) {
  const active = useScrollSpy(
    items.map((i) => i.id),
    160,
  );
  const track = useRef<HTMLUListElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  useGlide("subnav-pill", pill, active);

  // Keep the current link visible in the sideways-scrolling track (scrolls the track only, never the page).
  useEffect(() => {
    const el = track.current;
    const link = active ? el?.querySelector<HTMLElement>(`a[href="#${CSS.escape(active)}"]`) : null;
    if (!el || !link || el.scrollWidth <= el.clientWidth) return;
    const target = link.offsetLeft - (el.clientWidth - link.offsetWidth) / 2;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: Math.max(0, target), behavior: reduce ? "auto" : "smooth" });
  }, [active]);

  return (
    // Zero-height sticky rail: the pill straddles the edge above it, and once stuck its top sits 8 px under the site nav.
    <nav aria-label={label} className={cn("sticky top-[102px] z-(--z-sticky) h-0 print:hidden", className)}>
      <div className="glass mx-auto w-fit max-w-full -translate-y-1/2 rounded-full border border-line p-1 shadow-md">
        <ul
          ref={track}
          data-glide-scope=""
          data-lenis-prevent
          className="flex snap-x gap-0.5 overflow-x-auto overscroll-x-contain [mask-image:linear-gradient(90deg,transparent,#000_16px,#000_calc(100%-16px),transparent)] [scrollbar-width:none] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it) => {
            const current = active === it.id;
            return (
              <li key={it.id} className="snap-start">
                <a
                  href={`#${it.id}`}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    "relative isolate inline-flex h-11 items-center rounded-full px-3.5 text-small font-medium whitespace-nowrap transition-colors duration-(--dur-hover) md:h-9",
                    current ? "text-cta-fg" : "text-fg-2 hover:bg-sunken hover:text-fg",
                  )}
                >
                  {current ? <span ref={pill} aria-hidden className="absolute inset-0 -z-10 rounded-full bg-cta shadow-sm" /> : null}
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
