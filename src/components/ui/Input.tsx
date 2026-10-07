import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export const inputClasses =
  "w-full min-h-11 rounded-sm border border-input bg-surface px-3 py-2 text-body text-fg shadow-xs transition-[border-color,box-shadow] duration-(--dur-hover) " +
  "placeholder:text-fg-3 hover:border-fg-2 focus:border-brand focus-visible:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-invalid:border-danger dark:aria-invalid:border-danger-night";

export function Input({ className, ref, ...props }: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={cn(inputClasses, "read-only:bg-sunken", className)} {...props} />;
}

export function Textarea({ className, ref, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> }) {
  return <textarea ref={ref} className={cn(inputClasses, "min-h-24 leading-normal read-only:bg-sunken", className)} {...props} />;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>;
  /** Classes for the wrapper that positions the chevron. Put width limits here (e.g. "max-w-48"), not on className. */
  wrapperClassName?: string;
}

/** Native <select> with a themed chevron (a real icon, so it follows night bands; a data-URI stroke can't). */
export function Select({ className, wrapperClassName, ref, children, ...props }: SelectProps) {
  return (
    <span className={cn("relative block", wrapperClassName)}>
      <select ref={ref} className={cn(inputClasses, "cursor-pointer appearance-none pr-10", className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-3" />
    </span>
  );
}
