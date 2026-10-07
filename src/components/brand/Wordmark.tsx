import { cn } from "../ui/cn";

/**
 * "Stemma" in the display face (Newsreader) at 590, tracking −0.022em: the name the stemma, the ancient family-tree
 * diagram, gave the product. A parent can override the size with --wordmark-size.
 */
export function Wordmark({ size = 20, tone, className }: { size?: number; tone?: "paper" | "night"; className?: string }) {
  return (
    <span
      className={cn(
        "font-display leading-none font-strong tracking-[-0.022em] whitespace-nowrap",
        tone === "night" ? "text-ivory" : tone === "paper" ? "text-ink" : "text-fg",
        className,
      )}
      style={{ fontSize: `var(--wordmark-size, ${size}px)` }}
    >
      Stemma
    </span>
  );
}

/** The descriptor under the name in a lockup: "THE FAMILY HEALTH TREE" in Geist Mono at eyebrow size. */
export function Descriptor({ tone, className }: { tone?: "paper" | "night"; className?: string }) {
  return (
    <span
      className={cn(
        "font-mono text-eyebrow leading-none whitespace-nowrap uppercase",
        tone === "night" ? "text-ivory-3" : tone === "paper" ? "text-ink-3" : "text-fg-3",
        className,
      )}
    >
      The family health tree
    </span>
  );
}
