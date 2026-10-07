"use client";

import { Check } from "lucide-react";
import { useId } from "react";
import { cn } from "@/components/ui/cn";

export const REVIEW_LABEL = "I’ve checked this and it matches what my family told me.";

export interface ReviewCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** card: the rail's CheckboxCard look. strip: the compact phone bar (no card chrome). */
  variant?: "card" | "strip";
  describedBy?: string;
  className?: string;
}

/**
 * The review checkbox (e2e contract: the first checkbox on /summary, named exactly REVIEW_LABEL). The CheckboxCard look
 * and hit-testing (the real input covers the whole label, transparent), plus a compact chrome-less "strip" variant for
 * the phone bar, which CheckboxCard doesn't have.
 */
export function ReviewCheck({ checked, onChange, variant = "card", describedBy, className }: ReviewCheckProps) {
  const id = useId();
  const strip = variant === "strip";
  return (
    <div
      data-checked={checked || undefined}
      className={cn(
        "group/review relative rounded-md text-fg transition-[background-color,border-color,box-shadow] duration-(--dur-ui)",
        "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-focus",
        strip
          ? "data-checked:bg-evergreen-50/80"
          : "border border-line-strong bg-surface hover:border-fg/30 data-checked:border-brand data-checked:bg-evergreen-50 data-checked:shadow-[inset_0_0_0_0.5px_var(--ui-brand)] data-checked:hover:border-brand",
        className,
      )}
    >
      <label htmlFor={id} className={cn("relative flex cursor-pointer items-start gap-3", strip ? "min-h-11 px-2.5 py-2" : "min-h-14 p-4")}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 z-1 m-0 size-full cursor-pointer appearance-none rounded-md opacity-0 focus-visible:outline-none"
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-input bg-surface transition-[background-color,border-color,scale] duration-(--dur-ui) ease-out-quart",
            "group-hover/review:border-fg/60",
            checked && "scale-105 border-brand bg-brand text-white group-hover/review:border-brand",
          )}
        >
          {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span className={cn("min-w-0 font-strong text-fg", strip ? "text-small leading-snug" : "text-ui")}>{REVIEW_LABEL}</span>
      </label>
    </div>
  );
}
