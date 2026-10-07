import Link from "next/link";
import type { ReactNode } from "react";
import { HONESTY } from "@/content/site";
import { cn } from "../ui/cn";

export interface HonestyPillProps {
  /** sm: the nav chip ("Synthetic demo", phones "Demo"). md: the hero pill. */
  size?: "sm" | "md";
  href?: string;
  children?: ReactNode;
  className?: string;
}

/** Hairline pill with a 6 px brand dot. The synthetic-demo notice, designed as brand. */
export function HonestyPill({ size = "md", href = "/privacy#prototype", children, className }: HonestyPillProps) {
  const dot = <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand" />;
  if (size === "sm") {
    return (
      <Link
        href={href}
        aria-label={HONESTY.navChipLabel}
        className={cn(
          "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-2.5 text-caption font-medium whitespace-nowrap text-fg-2 transition-colors hover:bg-sunken hover:text-fg",
          className,
        )}
      >
        {dot}
        <span className="max-sm:hidden">{HONESTY.navChip}</span>
        <span className="sm:hidden">{HONESTY.navChipShort}</span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-8 items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-small text-fg-2 transition-colors hover:bg-surface hover:text-fg",
        className,
      )}
    >
      {dot}
      {children ? (
        <span>{children}</span>
      ) : (
        <>
          <span className="max-sm:hidden">{HONESTY.heroPill}</span>
          <span className="sm:hidden">{HONESTY.heroPillShort}</span>
        </>
      )}
    </Link>
  );
}
