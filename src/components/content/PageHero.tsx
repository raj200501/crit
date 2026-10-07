import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { TextReveal } from "@/components/ui/TextReveal";

/** The evergreen hand-drawn underline (same gesture as the landing H1). Draws once; static under reduced motion. */
export function HandUnderline({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 12" preserveAspectRatio="none" focusable="false" className={cn("pointer-events-none absolute -bottom-[0.06em] left-0 h-[0.2em] w-full overflow-visible text-brand", className)}>
      <path
        d="M3 8.5C48 3.2 112 2.6 197 6.4"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className="[stroke-dasharray:1] motion-safe:animate-draw motion-safe:[animation-delay:500ms]"
      />
    </svg>
  );
}

export interface PageHeroProps {
  eyebrow: ReactNode;
  /** The H1 sentence (focus-pulls word by word). */
  title: string;
  /** A phrase inside the title that gets the hand-drawn underline. */
  underline?: string;
  lead?: ReactNode;
  /** CTAs and microcopy under the lead. */
  children?: ReactNode;
  /** Right column (≥ 1024 px); stacks under the copy on smaller screens. */
  aside?: ReactNode;
  /** Word-by-word focus-pull (default). false renders a plain h1 whose text content is exactly `title`. */
  reveal?: boolean;
  /** Display size of the H1: xl (default) or l for long sentences. */
  size?: "xl" | "l";
  id?: string;
  className?: string;
}

const h1Base = "mt-5 font-display font-book text-fg print:text-[30px] print:[&_span]:animate-none!";

/** Content-page hero: paper + aurora + grain, padded for the floating SiteNav. One H1 per page. */
export function PageHero({ eyebrow, title, underline, lead, children, aside, reveal = true, size = "xl", id = "page-title", className }: PageHeroProps) {
  const h1Class = cn(h1Base, size === "xl" ? "text-display-xl" : "text-display-l");
  return (
    <section
      aria-labelledby={id}
      data-theme="paper"
      data-nav-theme="paper"
      className={cn("aurora grain relative overflow-hidden pt-32 pb-16 text-fg sm:pt-36 lg:pt-44 lg:pb-24 print:bg-transparent print:bg-none print:pt-0 print:pb-3", className)}
    >
      <Container className={cn("relative grid items-center gap-12 lg:gap-16 print:gap-0 print:px-0", aside && "lg:grid-cols-12")}>
        <div className={cn("flex min-w-0 flex-col items-start", aside ? "lg:col-span-6" : "max-w-[52rem]")}>
          <Eyebrow>{eyebrow}</Eyebrow>
          {reveal ? (
            <TextReveal
              as="h1"
              id={id}
              text={title}
              mark={underline ? { text: underline, decoration: <HandUnderline /> } : undefined}
              className={h1Class}
            />
          ) : (
            <h1 id={id} className={h1Class}>
              {title}
            </h1>
          )}
          {lead ? <p className="mt-6 max-w-[36rem] text-lead text-fg-2 print:mt-1 print:max-w-none print:text-[11.5px]">{lead}</p> : null}
          {children}
        </div>
        {aside ? <div className="min-w-0 lg:col-span-6">{aside}</div> : null}
      </Container>
    </section>
  );
}
