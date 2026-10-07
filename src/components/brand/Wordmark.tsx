import { cn } from "../ui/cn";

/** "Family Health Tree" in Geist 590, tracking −0.022em. Never set in the serif. A parent can override the size with --wordmark-size. */
export function Wordmark({ size = 17, tone, className }: { size?: number; tone?: "paper" | "night"; className?: string }) {
  return (
    <span
      className={cn("font-sans leading-none font-strong tracking-[-0.022em] whitespace-nowrap", tone === "night" ? "text-ivory" : tone === "paper" ? "text-ink" : "text-fg", className)}
      style={{ fontSize: `var(--wordmark-size, ${size}px)` }}
    >
      Family Health Tree
    </span>
  );
}
