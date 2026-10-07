import type { InputHTMLAttributes, ReactNode, Ref } from "react";
import { cn } from "./cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/** A native 20 px checkbox with a brand check, and its label. */
export function Checkbox({ label, className, ref, ...props }: CheckboxProps) {
  return (
    <label className={cn("inline-flex min-h-11 cursor-pointer items-center gap-3 text-ui text-fg has-disabled:cursor-not-allowed has-disabled:opacity-50", className)}>
      <input ref={ref} type="checkbox" className="size-5 shrink-0 cursor-pointer accent-brand" {...props} />
      <span>{label}</span>
    </label>
  );
}
