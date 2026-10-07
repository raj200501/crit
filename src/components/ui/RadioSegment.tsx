import type { ChangeEvent } from "react";
import { cn } from "./cn";

export interface RadioSegmentProps {
  name: string;
  /** The radiogroup's accessible name. */
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null | undefined;
  onChange: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

/** Real radio inputs (keeps getByRole('radio')) styled as a segmented row; one column under 400 px. */
export function RadioSegment({ name, label, options, value, onChange, className }: RadioSegmentProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex gap-1 rounded-md bg-sunken p-1 max-[400px]:flex-col", className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-sm px-3 py-2 text-center text-ui font-medium text-fg-2 transition-[background-color,color,box-shadow] duration-(--dur-ui) hover:text-fg has-checked:bg-surface has-checked:text-fg has-checked:shadow-sm has-focus-visible:outline-2 has-focus-visible:outline-offset-1 has-focus-visible:outline-focus"
        >
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={(e) => onChange(o.value, e)} className="sr-only" />
          {o.label}
        </label>
      ))}
    </div>
  );
}
