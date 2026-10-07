"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cn } from "./cn";

export interface RevealProps {
  children?: ReactNode;
  /** Seconds. */
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
}

/**
 * Section reveal that never hides content from SSR, no-JS or reduced-motion users.
 * Only an element that mounts below the viewport is "armed" (opacity .001, y 16 px); it eases in once it is seen.
 */
export function Reveal({ children, delay = 0, as: Tag = "div", className, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return; // already in (or above) view: never armed
    el.dataset.reveal = "armed";
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.reveal = "shown";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      id={id}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
      className={cn(
        "transition-[opacity,translate] duration-(--dur-reveal) ease-out-expo",
        "data-[reveal=armed]:translate-y-4 data-[reveal=armed]:opacity-[0.001] data-[reveal=armed]:transition-none",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
