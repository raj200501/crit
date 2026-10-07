import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { HonestyPill } from "@/components/site/HonestyPill";
import { Button } from "@/components/ui/Button";
import { TextReveal } from "@/components/ui/TextReveal";
import { SITE } from "@/content/site";

const H1 = "Turn “heart problems run in the family” into who, what, and at what age.";
const ACCENT = "“heart problems run in the family”";
const MARK = "at what age.";

// Staggered entrance for the supporting copy (CSS only, so it runs at first paint). The H1 never fades: it is the LCP.
const enter = (ms: number) => ({ animationDelay: `${ms}ms` }) satisfies CSSProperties;

/** A hand-drawn evergreen underline under "at what age" (aria-hidden; draws once, 900 ms after a 400 ms delay). */
function Underline() {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 300 14"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -bottom-[0.06em] left-[0.02em] h-[0.2em] w-[calc(100%-0.42em)] overflow-visible text-brand"
    >
      <path
        d="M3 9.5C46 5.2 92 3.4 141 4.1c47.5.7 96 3.6 153 6.6"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="[stroke-dasharray:1] motion-safe:animate-draw"
        style={{ animationDelay: "400ms" }}
      />
    </svg>
  );
}

/** The hero's copy column (Server Component), rendered by HeroStage (P2) as its children. */
export function HeroCopy() {
  return (
    <div className="flex max-w-[36rem] flex-col items-start">
      <HonestyPill className="motion-safe:animate-fade-up" />
      <TextReveal
        as="h1"
        id="hero-title"
        text={H1}
        accent={{ text: ACCENT, style: "italic-muted" }}
        animate="after-accent"
        mark={{ text: MARK, decoration: <Underline /> }}
        className="mt-6 font-display text-display-xl font-book text-fg sm:mt-7"
      />
      <p className="mt-6 max-w-[34rem] text-lead text-fg-2">
        Build your family&rsquo;s heart history before your cardiology visit. Relatives fill in their own branch from one text link, and every answer keeps who
        said it and how sure they are.
      </p>
      <div
        className="mt-8 flex w-full flex-col items-stretch gap-3 motion-safe:animate-fade-up sm:w-auto sm:flex-row sm:items-center sm:gap-6"
        style={enter(380)}
      >
        <Button
          href={SITE.demoHref}
          size="lg"
          iconRight={
            <ArrowRight className="transition-transform duration-(--dur-hover) ease-out-quart group-hover/btn:translate-x-0.5 motion-reduce:transition-none" />
          }
        >
          Try the demo family
        </Button>
        <Button href="#two-readers" variant="link" size="lg" className="self-center sm:self-auto">
          See what your cardiologist gets
        </Button>
      </div>
      <p className="mt-8 font-mono text-eyebrow text-fg-3 uppercase motion-safe:animate-fade-up" style={enter(480)}>
        Made-up family&nbsp;<span className="px-1 text-brand">·</span> Runs in your browser&nbsp;<span className="px-1 text-brand">·</span> No account
      </p>
    </div>
  );
}
