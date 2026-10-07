"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { useId, type ChangeEvent, type ReactNode, type Ref } from "react";
import { cn } from "./cn";
import { DUR, EASE } from "./motion";

export interface CheckboxCardProps {
  checked: boolean;
  onChange: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** The accessible name starts with this (e2e contract), followed by the description. */
  title: ReactNode;
  description?: ReactNode;
  /** Revealed under the card while it is checked (e.g. the age row). Kept outside the <label>. */
  children?: ReactNode;
  name?: string;
  value?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  /** md: 44 px (panels). lg: 56 px with a 16 px title (the relative's phone flow, the page form). */
  size?: "md" | "lg";
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
}

/**
 * A large tappable checkbox. The real checkbox covers the whole label, transparent, so a finger, a keyboard, assistive
 * tech and a test runner's click (Playwright `check()`) all land on the input itself. Focus rings the whole card. The
 * revealed row grows in over 220 ms (instantly under reduced motion).
 */
export function CheckboxCard({ checked, onChange, title, description, children, name, value, id, disabled, required, size = "md", className, inputRef }: CheckboxCardProps) {
  const auto = useId();
  const reduce = useReducedMotion();
  const inputId = id ?? `cbc-${auto}`;
  return (
    <div
      data-checked={checked || undefined}
      className={cn(
        "rounded-md border border-line-strong bg-surface text-fg transition-[background-color,border-color,box-shadow] duration-(--dur-ui)",
        // only the card's own checkbox rings the card (not an input in the revealed row)
        "has-[>label>input:focus-visible]:outline-2 has-[>label>input:focus-visible]:outline-offset-2 has-[>label>input:focus-visible]:outline-focus",
        !disabled && "hover:border-fg/30",
        "data-checked:border-brand data-checked:bg-evergreen-50 data-checked:shadow-[inset_0_0_0_0.5px_var(--ui-brand)] data-checked:hover:border-brand dark:data-checked:bg-lumen/10",
        disabled && "opacity-50",
        className,
      )}
    >
      <label htmlFor={inputId} className={cn("relative flex cursor-pointer items-start gap-3", size === "lg" ? "min-h-14 p-4" : "min-h-11 p-3.5", disabled && "cursor-not-allowed")}>
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          name={name}
          value={value}
          checked={checked}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.checked, e)}
          className={cn(
            "peer absolute inset-0 z-1 m-0 size-full cursor-pointer appearance-none rounded-md opacity-0 focus-visible:outline-none",
            disabled && "cursor-not-allowed",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[5px] border-[1.5px] border-input bg-surface transition-[background-color,border-color,scale] duration-(--dur-ui) ease-out-quart",
            checked && "scale-105 border-brand bg-brand text-white dark:text-ink",
          )}
        >
          {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={cn("font-strong text-fg", size === "lg" ? "text-body" : "text-ui")}>{title}</span>
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
            <div className={cn(size === "lg" ? "px-4 pb-4 pl-12" : "px-3.5 pb-3.5 pl-11.5")}>{children}</div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
