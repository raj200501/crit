import type { ReactNode } from "react";
import { cn } from "./cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** role="switch" button; the visible label names it. */
export function Switch({ checked, onChange, label, description, disabled, id, className }: SwitchProps) {
  return (
    <label className={cn("inline-flex min-h-11 cursor-pointer items-center gap-3 text-ui text-fg", disabled && "cursor-not-allowed text-fg-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-(--dur-ui) disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "border-brand bg-brand" : "border-input bg-sunken",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-(--dur-ui) ease-out-quart",
            checked ? "translate-x-[18px]" : "translate-x-[2px]",
          )}
        />
      </button>
      <span className="flex flex-col">
        <span>{label}</span>
        {description ? <span className="text-small text-fg-3">{description}</span> : null}
      </span>
    </label>
  );
}
