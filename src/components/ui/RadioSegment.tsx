import type { ChangeEvent } from "react";
import { cn } from "./cn";

export interface RadioSegmentProps {
  name: string;
  /** The radiogroup's accessible name. */
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null | undefined;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** md: 44 px. lg: 52 px with 16 px labels (the page form). */
  size?: "md" | "lg";
  className?: string;
}

/**
 * Real radio inputs (keeps getByRole('radio')) styled as a segmented row; one column under 400 px. Each transparent
 * input covers its whole segment, so pointers, assistive tech and a test runner's click land on the radio itself.
 */
export function RadioSegment({ name, label, options, value, onChange, size = "md", className }: RadioSegmentProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex gap-1 rounded-md bg-sunken p-1 max-[400px]:flex-col", className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            "relative flex flex-1 cursor-pointer items-center justify-center rounded-sm px-3 py-2 text-center font-medium text-fg-2",
            "transition-[background-color,color,box-shadow] duration-(--dur-ui) hover:text-fg",
            "has-checked:bg-surface has-checked:text-fg has-checked:shadow-sm",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus",
            size === "lg" ? "min-h-13 text-body" : "min-h-11 text-ui",
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={(e) => onChange(o.value, e)}
            className="absolute inset-0 z-1 m-0 size-full cursor-pointer appearance-none rounded-sm opacity-0 focus-visible:outline-none"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
