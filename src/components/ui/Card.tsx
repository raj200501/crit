import type { ElementType, ReactNode } from "react";
import { cn } from "./cn";

export type CardTier = "section" | "floating" | "overlay" | "document" | "window";

const TIER: Record<CardTier, string> = {
  section: "rounded-lg border border-line bg-surface text-fg shadow-xs",
  floating: "rounded-lg border border-line bg-surface text-fg shadow-md",
  overlay: "rounded-lg border border-line bg-raised text-fg shadow-lg",
  document: "rounded-paper bg-white text-ink shadow-paper",
  window: "overflow-hidden rounded-xl bg-bg text-fg shadow-window",
};
// Inner radius = outer radius (28) − bezel padding (8).
const BEZEL_INNER: Partial<Record<CardTier, string>> = { section: "rounded-[20px]", floating: "rounded-[20px]", overlay: "rounded-[20px]", window: "rounded-[20px]" };

export interface CardProps {
  tier?: CardTier;
  /** Wraps the card in a translucent outer shell (double bezel). */
  bezel?: boolean;
  /** Lifts −2 px with a deeper shadow on hover and focus-within. */
  interactive?: boolean;
  as?: ElementType;
  className?: string;
  /** Classes for the outer bezel shell. */
  bezelClassName?: string;
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
}

export function Card({ tier = "section", bezel, interactive, as: Tag = "div", className, bezelClassName, children, ...rest }: CardProps) {
  // A document is always paper (even inside a night band); a window is always night.
  const theme = tier === "document" ? "paper" : tier === "window" ? "night" : undefined;
  const card = (
    <Tag
      data-theme={theme}
      className={cn(
        TIER[tier],
        interactive &&
          "transition-[translate,box-shadow] duration-(--dur-hover) ease-out-quart hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:focus-within:translate-y-0",
        bezel && BEZEL_INNER[tier],
        className,
      )}
      {...(bezel ? {} : rest)}
    >
      {children}
    </Tag>
  );
  if (!bezel) return card;
  return (
    <div className={cn("rounded-xl border border-line bg-white/70 p-2 dark:bg-white/[.03]", bezelClassName)} {...rest}>
      {card}
    </div>
  );
}
