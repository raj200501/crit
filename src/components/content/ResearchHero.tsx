import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { INTERVIEW_RESEARCH } from "@/content/interviews";

export interface ResearchHeroProps {
  /** The tab's own lead under the shared H1. */
  lead: ReactNode;
  /** The mono meta line, joined with dots. Each item is already a <span> (so it can be tabular or nowrap). */
  meta: readonly ReactNode[];
}

/**
 * The night hero shared by the /research tabs: one H1 ("The research behind Stemma", id research-title) on both, with
 * each tab's own lead and meta line. A component rather than research/layout.tsx because a layout can't take per-page
 * props, and the write-up's lead and "sources · min read" line belong to the write-up only.
 */
export function ResearchHero({ lead, meta }: ResearchHeroProps) {
  return (
    <Section theme="night" grain aria-labelledby="research-title" className="relative overflow-hidden pt-36 pb-16 lg:pt-44 lg:pb-24">
      {/* a faint lumen pool behind the title: light is earned, the write-up is the finished thing */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.14),transparent)]"
      />
      <Container className="relative">
        <Eyebrow>Research</Eyebrow>
        <h1 id="research-title" className="mt-5 max-w-[20ch] font-display text-display-xl font-book text-fg">
          The research behind Stemma
        </h1>
        <p className="mt-6 max-w-[60ch] text-lead text-fg-2">{lead}</p>
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-eyebrow text-fg-2 uppercase">
          {meta.map((m, i) => (
            <Fragment key={i}>
              {i > 0 ? (
                <span aria-hidden className="text-fg-3">
                  ·
                </span>
              ) : null}
              {m}
            </Fragment>
          ))}
        </p>
      </Container>
    </Section>
  );
}

export type ResearchTab = "write-up" | "interviews";

const TABS = [
  { id: "write-up", href: "/research", label: "Write-up" },
  { id: "interviews", href: "/research/interviews", label: `Interviews (${INTERVIEW_RESEARCH.interviews.length})` },
] as const satisfies readonly { id: ResearchTab; href: string; label: string }[];

/**
 * The /research tab bar: real routes as links (aria-current="page" on the open one), styled as a quiet segmented
 * control. It sits on the seam under the night hero (a zero-height rail, the pill pulled up half its height), so it
 * reads as part of both the hero and the page. Server-rendered: each page says which tab it is.
 */
export function ResearchTabs({ current, className }: { current: ResearchTab; className?: string }) {
  return (
    <nav aria-label="Research sections" className={cn("relative z-10 h-0 print:hidden", className)}>
      <Container>
        <ul className="inline-flex max-w-full -translate-y-1/2 gap-0.5 rounded-full border border-line bg-sunken p-1 shadow-md">
          {TABS.map((t) => {
            const active = t.id === current;
            return (
              <li key={t.id} className="min-w-0">
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-11 items-center rounded-full px-4 text-small font-medium whitespace-nowrap tabular-nums transition-colors duration-(--dur-ui) md:h-9",
                    active ? "bg-surface text-fg shadow-sm" : "text-fg-2 hover:bg-surface/60 hover:text-fg",
                  )}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}
