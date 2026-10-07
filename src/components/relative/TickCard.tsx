"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "../ui/cn";
import { DUR, EASE } from "../ui/motion";

export interface TickCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The accessible name starts with this (e2e contract), followed by the description. */
  title: ReactNode;
  description?: ReactNode;
  /** Revealed under the label while checked (e.g. the age row). */
  children?: ReactNode;
  className?: string;
}

/**
 * The P1 CheckboxCard look (56 px, evergreen when ticked), but the real checkbox covers the whole label, transparent, so a
 * finger, a keyboard, assistive tech and a test runner's click all land on the input itself. (CheckboxCard's sr-only input
 * can't be hit-tested, so Playwright's `check()` fails on it; see the P6 follow-ups.)
 */
export function TickCard({ checked, onChange, title, description, children, className }: TickCardProps) {
  const id = useId();
  const reduce = useReducedMotion();
  return (
    <div
      data-checked={checked || undefined}
      className={cn(
        "rounded-md border border-line-strong bg-surface text-fg transition-[background-color,border-color,box-shadow] duration-(--dur-ui)",
        "hover:border-fg/30 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus",
        "data-checked:border-brand data-checked:bg-evergreen-50 data-checked:shadow-[inset_0_0_0_0.5px_var(--ui-brand)] data-checked:hover:border-brand",
        className,
      )}
    >
      <label htmlFor={id} className="relative flex min-h-14 cursor-pointer items-start gap-3 p-4">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 z-1 m-0 size-full cursor-pointer appearance-none rounded-md opacity-0 focus-visible:outline-none"
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-input bg-surface transition-[background-color,border-color,scale] duration-(--dur-ui) ease-out-quart",
            checked && "scale-105 border-brand bg-brand text-white",
          )}
        >
          {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-ui font-strong text-fg">{title}</span>
          {description ? <span className="text-small text-fg-2">{description}</span> : null}
        </span>
      </label>
      <AnimatePresence initial={false}>
        {checked && children ? (
          <m.div
            key="reveal"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : DUR.ui, ease: EASE.emph }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-12">{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
