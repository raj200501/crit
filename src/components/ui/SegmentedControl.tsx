"use client";

import { useId, useRef } from "react";
import { cn } from "./cn";
import { useGlide } from "./useGlide";

export interface SegmentedControlProps<T extends string = string> {
  /** The group's accessible name. */
  label: string;
  options: readonly { value: T; label: string; ariaLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  /** md 44 px (touch). sm 28 px, desktop toolbars only. auto: md under 768 px, sm from 768 px (CSS, so no hydration shift). */
  size?: "sm" | "md" | "auto";
  fullWidth?: boolean;
  className?: string;
}

/**
 * A row of toggle buttons (aria-pressed, not radios: the e2e contract uses `button`) with a gliding pill.
 * md is 44 px tall (touch); sm is 28 px and is for desktop toolbars only; auto switches at 768 px (ProductFrame tabs).
 */
const SIZE = {
  sm: "h-7 px-3 text-caption",
  md: "h-11 px-4 text-small",
  auto: "h-11 px-3.5 text-small md:h-7 md:px-3 md:text-caption",
} as const;

export function SegmentedControl<T extends string = string>({ label, options, value, onChange, size = "md", fullWidth, className }: SegmentedControlProps<T>) {
  const pill = useId();
  const indicator = useRef<HTMLSpanElement>(null);
  useGlide(`seg-${pill}`, indicator, value);
  return (
    <div role="group" aria-label={label} data-glide-scope="" className={cn("inline-flex rounded-full bg-sunken p-1", fullWidth && "flex w-full", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            aria-label={o.ariaLabel}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative isolate inline-flex cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap transition-colors duration-(--dur-ui)",
              SIZE[size],
              fullWidth && "flex-1",
              active ? "text-fg" : "text-fg-2 hover:text-fg",
            )}
          >
            {active ? <span ref={indicator} className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
