"use client";

import { m, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from "motion/react";
import { ClipboardList, FileText, MessageSquare, QrCode } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui/cn";
import { SPRING } from "@/components/ui/motion";

const STEPS = [
  { title: "Send with new-patient paperwork.", detail: "One link, next to the forms your front desk already sends.", icon: ClipboardList },
  { title: "The patient builds and reviews; relatives answer from a text.", detail: "Each relative can answer, skip or say no.", icon: MessageSquare },
  { title: "The summary arrives before or at check-in.", detail: "A read-only link, or a QR code at the front desk.", icon: QrCode },
  { title: "Into the chart (print, PDF, FHIR).", detail: "One Letter page, or a FHIR FamilyMemberHistory file.", icon: FileText },
] as const;

/** How many steps the thread has reached at scroll progress v (0–1). */
const stepFor = (v: number) => Math.min(STEPS.length, Math.floor(v * (STEPS.length - 1) + 1.0001));

/**
 * DESIGN §10.1.4: four steps, horizontal from 1024 px and vertical below. An evergreen thread fills in as the timeline
 * scrolls through the viewport and each step lights when the thread reaches it. Reduced motion: drawn and lit.
 */
export function IntakeTimeline({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const progress = useSpring(scrollYProgress, SPRING.scroll);
  // Server render and no-JS: every step lit. After hydration it follows the scroll.
  const [reached, setReached] = useState<number>(STEPS.length);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce) setReached(stepFor(v));
  });
  // Once after hydration: light only the steps the page has already scrolled past.
  useEffect(() => {
    if (reduce) return;
    const raf = requestAnimationFrame(() => setReached(stepFor(scrollYProgress.get())));
    return () => cancelAnimationFrame(raf);
  }, [reduce, scrollYProgress]);
  const lit = (i: number) => reduce || i < reached;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* the track and its evergreen fill: across on desktop, down on phones */}
      <span aria-hidden className="absolute top-5 bottom-5 left-5 w-px bg-line-strong lg:top-5 lg:right-[calc(25%-44px)] lg:bottom-auto lg:left-5 lg:h-px lg:w-auto" />
      <m.span
        aria-hidden
        style={reduce ? undefined : { scaleY: progress }}
        className="absolute top-5 bottom-5 left-5 w-px origin-top bg-brand lg:hidden"
      />
      <m.span
        aria-hidden
        style={reduce ? undefined : { scaleX: progress }}
        className="absolute top-5 right-[calc(25%-44px)] left-5 hidden h-px origin-left bg-brand lg:block"
      />
      <ol className="relative grid gap-9 lg:grid-cols-4 lg:gap-8">
      {STEPS.map((s, i) => (
        <li key={s.title} className="relative flex gap-5 lg:flex-col lg:gap-6">
          <span
            className={cn(
              "relative z-10 grid size-10 shrink-0 place-items-center rounded-full border font-mono text-small tabular-nums transition-[background-color,border-color,color,box-shadow] duration-(--dur-panel)",
              lit(i) ? "border-brand bg-surface text-known-ink shadow-[0_0_0_5px_rgb(127_230_197/0.28)]" : "border-line-strong bg-surface text-fg-3",
            )}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="flex min-w-0 flex-col gap-2 pt-1.5 lg:pt-0 lg:pr-4">
            <s.icon aria-hidden className={cn("size-5 transition-colors duration-(--dur-panel)", lit(i) ? "text-brand" : "text-ink-4")} strokeWidth={1.75} />
            <h3 className="text-ui font-strong text-pretty text-fg">{s.title}</h3>
            <p className="text-small text-fg-2">{s.detail}</p>
          </div>
        </li>
      ))}
      </ol>
    </div>
  );
}
