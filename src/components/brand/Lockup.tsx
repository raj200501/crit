import Link from "next/link";
import { cn } from "../ui/cn";
import { LogoMark, type MarkSurface } from "./LogoMark";
import { Descriptor, Wordmark } from "./Wordmark";

export interface LockupProps {
  /** Mark size in px (default 28); the wordmark scales with it (20 px at 28). */
  size?: number;
  tone?: "paper" | "night";
  /** The color the lockup sits on, for the mark's knockout (see LogoMark). */
  surface?: MarkSurface;
  /**
   * "THE FAMILY HEALTH TREE" under the name: `true` always, `"lg"` from 1024 px up. Leave it off in tight places
   * (app headers on phones, small marks).
   */
  descriptor?: boolean | "lg";
  /** When set, the lockup is a link (aria-label "Stemma home"). */
  href?: string;
  className?: string;
}

/** Mark, 8 px gap, "Stemma" (and the descriptor under it where there is room). */
export function Lockup({ size = 28, tone, surface, descriptor = false, href, className }: LockupProps) {
  const name = <Wordmark size={Math.round((size * 20) / 28)} tone={tone} />;
  const inner = (
    <>
      <LogoMark size={size} tone={tone} surface={surface} />
      {descriptor ? (
        <span className="flex flex-col items-start gap-[5px]">
          {name}
          <Descriptor tone={tone} className={descriptor === "lg" ? "max-lg:hidden" : undefined} />
        </span>
      ) : (
        name
      )}
    </>
  );
  const classes = cn("group/lockup inline-flex items-center gap-2 rounded-sm", className);
  if (href) {
    return (
      <Link href={href} aria-label="Stemma home" className={classes}>
        {inner}
      </Link>
    );
  }
  return <span className={classes}>{inner}</span>;
}
