"use client";

import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE } from "@/components/ui/motion";

/**
 * Same place, different content: when `id` changes, the new content fades in over 220 ms (opacity only, so nothing
 * moves near clinical content). The first render never starts hidden (SSR and no-JS show it), and reduced motion swaps
 * instantly.
 *
 * Why not React's <ViewTransition>: Chromium aborts a view transition whose DOM update misses its 4 s deadline (seen
 * under parallel e2e load), and React reports that as an uncaught TimeoutError, which fails the e2e page-error gate.
 */
export function FadeSwap({ id, animate, className, children }: { id: string; animate: boolean; className?: string; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      key={id}
      initial={animate && !reduce ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.ui, ease: EASE.outQuart }}
      className={className}
    >
      {children}
    </m.div>
  );
}
