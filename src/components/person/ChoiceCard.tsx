"use client";

import { Check } from "lucide-react";
import { useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface ChoiceCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** The accessible name starts with this (e2e contract), followed by the description. */
  title: ReactNode;
  description?: ReactNode;
  /** Revealed inside the card while it is checked (the age row). Kept outside the <label>. */
  children?: ReactNode;
  size?: "md" | "lg";
  className?: string;
}

/**
 * A large tappable checkbox card for the guided question. Same look as the P1 CheckboxCard, but the real checkbox covers
 * the whole label (transparent), so a pointer, a test runner's click and assistive tech all land on the input itself.
 * The revealed row grows in over 220 ms (no animation under reduced motion).
 */
export function ChoiceCard({ checked, onChange, title, description, children, size = "md", className }: ChoiceCardProps) {
  const id = useId();
  const reveal = useRef<HTMLDivElement>(null);
  const open = checked && !!children;

  useLayoutEffect(() => {
    const el = reveal.current;
    if (!open || !el || typeof el.animate !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = el.animate(
      [
        { height: "0px", opacity: 0 },
        { height: `${el.scrollHeight}px`, opacity: 1 },
      ],
      { duration: 220, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    );
    return () => a.cancel();
  }, [open]);

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
      <label htmlFor={id} className={cn("relative flex cursor-pointer items-start gap-3", size === "lg" ? "min-h-14 p-4" : "min-h-11 p-3.5")}>
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
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-input bg-surface transition-colors duration-(--dur-ui)",
            checked && "border-brand bg-brand text-white",
          )}
        >
          {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("font-strong text-fg", size === "lg" ? "text-body" : "text-ui")}>{title}</span>
          {description ? <span className="text-small text-fg-2">{description}</span> : null}
        </span>
      </label>
      {open ? (
        <div ref={reveal} className="overflow-hidden">
          <div className={cn("pb-3.5", size === "lg" ? "px-4 pl-12" : "px-3.5 pl-11.5")}>{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export interface ChoiceSegmentProps {
  name: string;
  /** The radiogroup's accessible name. */
  label: string;
  options: readonly { value: string; label: string }[];
  value: string | null | undefined;
  onChange: (value: string) => void;
  size?: "md" | "lg";
  className?: string;
}

/**
 * Real radios styled as a segmented row (the look of the P1 RadioSegment; one column under 400 px). Each transparent
 * input covers its whole segment, so clicks land on the radio itself.
 */
export function ChoiceSegment({ name, label, options, value, onChange, size = "md", className }: ChoiceSegmentProps) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex gap-1 rounded-md bg-sunken p-1 max-[400px]:flex-col", className)}>
      {options.map((o) => (
        <label
          key={o.value}
          className={cn(
            "relative flex flex-1 cursor-pointer items-center justify-center rounded-sm px-3 py-2 text-center font-medium text-fg-2",
            "transition-[background-color,color,box-shadow] duration-(--dur-ui) hover:text-fg",
            "has-checked:bg-surface has-checked:text-fg has-checked:shadow-sm",
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-1 has-[input:focus-visible]:outline-focus",
            size === "lg" ? "min-h-13 text-body" : "min-h-11 text-ui",
          )}
        >
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="absolute inset-0 z-1 m-0 size-full cursor-pointer appearance-none rounded-sm opacity-0 focus-visible:outline-none"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
