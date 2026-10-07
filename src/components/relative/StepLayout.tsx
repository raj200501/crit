import { ViewTransition, type ReactNode } from "react";
import { cn } from "../ui/cn";
import { Eyebrow } from "../ui/Eyebrow";
import { StickyActionBar } from "../ui/StickyActionBar";

/** Transition types the flow tags its step changes with (React addTransitionType). */
export const STEP_FORWARD = "step-forward";
export const STEP_BACK = "step-back";

// The step slide (x 24 px + fade) is styled in globals.css (view-transition pseudo-elements can't take utilities).
const CLASSES = { [STEP_FORWARD]: "fht-step-fwd", [STEP_BACK]: "fht-step-back", default: "none" };

/**
 * One screen of the flow. Keyed by step, so a step change (inside startTransition, tagged STEP_FORWARD or STEP_BACK)
 * slides the old screen out and the new one in. Untagged updates (typing, ticking) never animate.
 */
export function StepTransition({ step, children }: { step: string; children: ReactNode }) {
  return (
    <ViewTransition key={step} enter={CLASSES} exit={CLASSES} default="none">
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}

/** The h1 gets focus after each step change (data-step-heading), so screen readers start at the new question. */
export function StepTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      tabIndex={-1}
      data-step-heading=""
      className={cn("font-display text-[1.875rem] leading-[1.12] font-book tracking-[-0.018em] text-fg outline-none", className)}
    >
      {children}
    </h1>
  );
}

export interface StepLayoutProps {
  title: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  /** The step's primary action(s), in a bar that sticks to the bottom of the screen. */
  actions?: ReactNode;
  className?: string;
}

export function StepLayout({ title, eyebrow, lead, children, actions, className }: StepLayoutProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className={cn("flex flex-col gap-6 pt-6 pb-8 sm:pt-7", className)}>
        <div className="flex flex-col gap-2.5">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <StepTitle>{title}</StepTitle>
          {lead ? <p className="text-fg-2">{lead}</p> : null}
        </div>
        {children}
      </div>
      {actions ? <StepActions>{actions}</StepActions> : null}
    </div>
  );
}

/** The sticky bottom CTA bar, full-bleed inside the column (the column pads 16 px, 24 px from 640 px). */
export function StepActions({ children }: { children: ReactNode }) {
  return <StickyActionBar className="-mx-4 mt-auto gap-2.5 sm:-mx-6 sm:px-6">{children}</StickyActionBar>;
}

/** A hint under a disabled primary action, wired with aria-describedby. */
export function ActionHint({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="text-center text-small text-fg-3">
      {children}
    </p>
  );
}
