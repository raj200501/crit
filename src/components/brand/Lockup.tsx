import Link from "next/link";
import { cn } from "../ui/cn";
import { LogoMark } from "./LogoMark";
import { Wordmark } from "./Wordmark";

export interface LockupProps {
  /** Mark size in px (default 28); the wordmark scales with it (17 px at 28). */
  size?: number;
  tone?: "paper" | "night";
  /** When set, the lockup is a link (aria-label "Family Health Tree home"). */
  href?: string;
  className?: string;
}

/** Mark 28 px, 8 px gap, wordmark. */
export function Lockup({ size = 28, tone, href, className }: LockupProps) {
  const inner = (
    <>
      <LogoMark size={size} tone={tone} />
      <Wordmark size={Math.round((size * 17) / 28)} tone={tone} />
    </>
  );
  const classes = cn("group/lockup inline-flex items-center gap-2 rounded-sm", className);
  if (href) {
    return (
      <Link href={href} aria-label="Family Health Tree home" className={classes}>
        {inner}
      </Link>
    );
  }
  return <span className={classes}>{inner}</span>;
}
