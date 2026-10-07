import { cn } from "../ui/cn";

export interface LogoMarkProps {
  /** Pixels (default 28). */
  size?: number;
  /** Omit to follow the surrounding theme (ink + evergreen on paper, ivory + lumen on night). */
  tone?: "paper" | "night";
  className?: string;
  title?: string;
}

/**
 * "Lineage": the smallest real pedigree. Father (square) and mother (circle), a couple line, a descent line,
 * and you as the proband diamond. Only the diamond is colored.
 */
export function LogoMark({ size = 28, tone, className, title }: LogoMarkProps) {
  const ink = tone === "night" ? "text-ivory" : tone === "paper" ? "text-ink" : undefined;
  const diamond = tone === "night" ? "var(--color-lumen)" : tone === "paper" ? "var(--color-evergreen-600)" : "var(--ui-brand, #0E6B57)";
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", ink, className)}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <rect x="3.5" y="4.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="23.5" cy="9" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12.5 9H19M16 9v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M16 18.5l5.5 5.5-5.5 5.5-5.5-5.5z"
        fill={diamond}
        className="transition-[filter] duration-(--dur-hover) group-hover/lockup:[filter:drop-shadow(0_0_6px_var(--color-lumen))] motion-reduce:transition-none"
      />
    </svg>
  );
}
