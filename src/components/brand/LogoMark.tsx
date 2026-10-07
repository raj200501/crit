import { cn } from "../ui/cn";

/** Named surfaces the mark's knockout can match; any other CSS color string is used as is (e.g. "var(--color-mist)"). */
export type MarkSurface = "paper" | "white" | "night" | (string & {});

export interface LogoMarkProps {
  /** Pixels (default 28). */
  size?: number;
  /** Omit to follow the surrounding theme (ink + evergreen on paper, ivory + lumen on night). */
  tone?: "paper" | "night";
  /**
   * The color the mark sits on. The snake's knockout strokes are drawn in it, so the staff breaks where the snake passes in
   * front and the snake breaks where it passes behind. Defaults to the tone's background (paper or night), or the theme's
   * background when there is no tone. Pass "white" on white cards and headers.
   */
  surface?: MarkSurface;
  className?: string;
  title?: string;
}

const SURFACES: Record<string, string> = { paper: "var(--color-paper)", white: "var(--color-white)", night: "var(--color-night)" };

/** The snake: one coil up the staff, from the tail (lower left) to the head (upper right). Same path as the brand SVGs. */
const SNAKE =
  "M11.60 29.20C11.81 29.00 12.16 28.40 12.89 28.00C13.62 27.60 14.96 27.20 16.00 26.80C17.04 26.40 18.38 26.00 19.11 25.60" +
  "C19.84 25.20 20.40 24.80 20.40 24.40C20.40 24.00 19.84 23.60 19.11 23.20C18.38 22.80 17.04 22.40 16.00 22.00" +
  "C14.96 21.60 13.62 21.20 12.89 20.80C12.16 20.40 11.60 20.00 11.60 19.60C11.60 19.20 12.16 18.80 12.89 18.40" +
  "C13.62 18.00 14.96 17.60 16.00 17.20C17.04 16.80 18.48 16.27 19.11 16.00C19.75 15.73 19.69 15.67 19.81 15.60";

/**
 * "Rod and Lineage": a pedigree couple (square = father, circle = mother) joined by the couple line, whose descent line
 * continues down as the Rod of Asclepius, with one snake coiling up it. The snake passes in front of the staff at the
 * bottom crossing, behind it at the middle crossing (the staff is redrawn over a knockout) and in front at the top; the
 * head is at the upper right. Only the snake is colored.
 */
export function LogoMark({ size = 28, tone, surface, className, title }: LogoMarkProps) {
  const ink = tone === "night" ? "text-ivory" : tone === "paper" ? "text-ink" : undefined;
  const accent = tone === "night" ? "var(--color-lumen)" : tone === "paper" ? "var(--color-evergreen-600)" : "var(--ui-brand, #0E6B57)";
  const ground = surface ?? (tone === "night" ? "night" : tone === "paper" ? "paper" : "var(--ui-bg, var(--color-paper))");
  const knockout = SURFACES[ground] ?? ground;
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0 overflow-visible", ink, className)}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <rect x="4.5" y="2.5" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="2" />
      <circle cx="24" cy="6" r="3.6" stroke="currentColor" strokeWidth="2" />
      <path d="M11.5 6h8.9M16 6v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d={SNAKE} style={{ stroke: knockout }} strokeWidth="4.5" strokeLinecap="round" />
      <path d={SNAKE} style={{ stroke: accent }} strokeWidth="2.3" strokeLinecap="round" />
      {/* the middle crossing: the staff is redrawn over the snake, so the snake goes behind it */}
      <path d="M16 20.10V23.90" style={{ stroke: knockout }} strokeWidth="4" />
      <path d="M16 19.60V24.40" stroke="currentColor" strokeWidth="2" />
      <ellipse
        cx="19.81"
        cy="15.60"
        rx="2.2"
        ry="1.55"
        transform="rotate(-31.7 19.81 15.60)"
        style={{ fill: accent }}
        className="transition-[filter] duration-(--dur-hover) group-hover/lockup:[filter:drop-shadow(0_0_6px_var(--color-lumen))] motion-reduce:transition-none"
      />
    </svg>
  );
}
