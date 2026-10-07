"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "./cn";
import { SegmentedControl } from "./SegmentedControl";
import { useMediaQuery } from "./useMediaQuery";

export interface ProductFrameProps {
  title: string;
  tabs?: readonly { id: string; label: string }[];
  value?: string;
  onChange?: (id: string) => void;
  /** rotateX 14° → 0 and scale .95 → 1 as it scrolls in (≥ 768 px, motion allowed). */
  tilt?: boolean;
  /** CSS aspect ratio at ≥ 768 px (default "16/10"). */
  aspect?: string;
  /** CSS aspect ratio on phones (default "4/5"). */
  mobileAspect?: string;
  actions?: ReactNode;
  className?: string;
  /** Classes for the content pane (it scrolls with data-lenis-prevent). */
  contentClassName?: string;
  children?: ReactNode;
}

/** The real product in a window frame (D1 recipe H). Fixed aspect ratio, so CLS stays 0. */
export function ProductFrame({ title, tabs, value, onChange, tilt = true, aspect = "16/10", mobileAspect = "4/5", actions, className, contentClassName, children }: ProductFrameProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const tilted = tilt && wide && !reduce;

  return (
    <div ref={ref} className={cn("[perspective:1400px]", className)}>
      <m.div style={tilted ? { rotateX, scale, transformOrigin: "50% 0%" } : undefined}>
        <Card tier="floating" bezel className="edge-highlight overflow-hidden">
          {/* One window bar from 640 px up: the title truncates first (and, next to tabs in a bar under 36rem, steps aside)
              and the tabs scroll before anything wraps. Phones may wrap the tabs onto a second row. */}
          <div className="@container flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2 sm:flex-nowrap">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-fg/15" />
              <span className="size-2.5 rounded-full bg-fg/15" />
              <span className="size-2.5 rounded-full bg-fg/15" />
            </span>
            <span className={cn("min-w-0 flex-1 truncate font-mono text-caption text-fg-3", tabs?.length && "sm:@max-xl:hidden")}>{title}</span>
            {tabs && tabs.length ? (
              <SegmentedControl
                size="auto"
                label={`${title} views`}
                options={tabs.map((t) => ({ value: t.id, label: t.label }))}
                value={value ?? tabs[0].id}
                onChange={(v) => onChange?.(v)}
                // never wider than the frame (WCAG reflow at 320 px); the group's p-1 leaves room for the focus ring
                className="ml-auto max-w-full min-w-0 overflow-x-auto [scrollbar-width:none]"
              />
            ) : null}
            {actions ? <div className={cn("flex shrink-0 items-center gap-2", !tabs?.length && "ml-auto")}>{actions}</div> : null}
          </div>
          <div
            data-lenis-prevent
            data-theme="paper"
            style={{ "--frame-aspect": aspect, "--frame-aspect-sm": mobileAspect } as CSSProperties}
            className={cn("relative aspect-(--frame-aspect-sm) overflow-auto overscroll-contain bg-surface text-fg md:aspect-(--frame-aspect)", contentClassName)}
          >
            {children}
          </div>
        </Card>
      </m.div>
    </div>
  );
}
