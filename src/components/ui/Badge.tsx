import type { ReactNode } from "react";
import { cn } from "./cn";

const TONE = {
  neutral: "bg-sunken text-fg-2",
  brand: "bg-known-bg text-known-ink dark:bg-lumen/12 dark:text-lumen",
  record: "bg-record-bg text-record dark:bg-record/15",
  danger: "bg-danger-bg text-danger",
} as const;

export interface BadgeProps {
  tone?: keyof typeof TONE;
  mono?: boolean;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** A 24 px pill chip. `mono` = uppercase Geist Mono (12 px eyebrow size). */
export function Badge({ tone = "neutral", mono, icon, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 whitespace-nowrap [&_svg]:size-3.5",
        mono ? "font-mono text-eyebrow font-medium uppercase" : "text-caption font-medium",
        TONE[tone],
        className,
      )}
    >
      {icon ? <span aria-hidden className="inline-flex">{icon}</span> : null}
      {children}
    </span>
  );
}
