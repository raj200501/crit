import type { Metadata } from "next";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { FamilyHistoryMark, InterviewList } from "@/components/content/InterviewList";
import { ResearchHero, ResearchTabs } from "@/components/content/ResearchHero";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { INTERVIEW_RESEARCH, INTERVIEW_ROLES, interviewCountsLine } from "@/content/interviews";

export const metadata: Metadata = {
  title: "Interviews",
  description:
    "What 15 patients and 6 clinicians told Team 709 about how a diagnosis comes together, and where family history came up. Paraphrased from interview notes, identified by interview ID only.",
};

const R = INTERVIEW_RESEARCH;
const byId = new Map<string, (typeof R.interviews)[number]>(R.interviews.map((iv) => [iv.id, iv]));
const familyHistory = R.interviews.filter((iv) => iv.familyHistory);
/** A theme drawn only from the interviews that touched on family history gets the same marker as those rows. */
const isFamilyHistoryTheme = (ids: readonly string[]) => ids.every((id) => byId.get(id)?.familyHistory);

function BandHeading({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="max-w-[26ch] font-display text-display-m font-book text-fg">
        {title}
      </h2>
      {children}
    </div>
  );
}

// The second /research tab. Static: everything comes from src/content/interviews.ts.
export default function InterviewsPage() {
  const total = R.interviews.length;
  return (
    <main id="main">
      <ResearchHero
        lead="What patients and clinicians told us about how a diagnosis comes together, and where family history came up."
        meta={[
          ...interviewCountsLine(R.counts)
            .split(" · ")
            .map((part) => (
              <span key={part} className="tabular-nums">
                {part}
              </span>
            )),
          <span key="period" className="whitespace-nowrap">
            {R.period}
          </span>,
        ]}
      />
      <ResearchTabs current="interviews" />

      <Section theme="paper" aria-labelledby="interviews-title" className="py-14 lg:py-24">
        <Container>
          {/* What we heard: the story, and how far it reaches */}
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <BandHeading id="interviews-title" eyebrow={`Interviews · ${R.period}`} title={`What we heard in ${total} interviews`} />
              <p className="mt-6 max-w-[64ch] text-body text-fg-2 sm:text-lead">{R.intro}</p>
            </div>
            <aside aria-label="Reach of these interviews" className="lg:col-span-5 lg:pt-10">
              <div className="rounded-lg border border-line bg-surface p-6 shadow-xs sm:p-8">
                <p className="flex items-baseline gap-3">
                  <span className="font-display text-display-m font-book text-brand-strong tabular-nums">
                    {familyHistory.length} of {total}
                  </span>
                  <span className="text-small text-fg-2">touched on family history</span>
                </p>
                <ul aria-label="Interviews that touched on family history" className="mt-3 flex flex-wrap gap-1.5">
                  {familyHistory.map((iv) => (
                    <li key={iv.id}>
                      <IdChip id={iv.id} />
                    </li>
                  ))}
                </ul>
                <h3 className="mt-6 border-t border-line pt-5 font-mono text-eyebrow font-medium text-fg-3 uppercase">Who we talked to</h3>
                <ul className="mt-2 flex flex-col text-small text-fg-2">
                  {INTERVIEW_ROLES.map((r) => (
                    <li key={r.key} className="flex items-baseline gap-3 py-0.5">
                      <span className="w-6 shrink-0 text-right font-mono font-medium text-fg tabular-nums">{R.counts[r.key]}</span>
                      <span>{r.label}</span>
                    </li>
                  ))}
                </ul>
                <h3 className="mt-5 font-mono text-eyebrow font-medium text-fg-3 uppercase">Not in these {total}</h3>
                <p className="mt-1.5 text-small text-fg-2">{R.gaps}</p>
              </div>
            </aside>
          </div>

          {/* Themes */}
          <section aria-labelledby="themes-title" className="mt-20 lg:mt-28">
            <BandHeading id="themes-title" eyebrow="Across the interviews" title={`${R.themes.length} themes`} />
            <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {R.themes.map((t) => {
                const fh = isFamilyHistoryTheme(t.ids);
                return (
                  <li
                    key={t.title}
                    className={cn(
                      "flex flex-col rounded-lg border border-line p-6 shadow-xs",
                      fh ? "bg-evergreen-50 md:col-span-2" : "bg-surface",
                    )}
                  >
                    {fh ? <FamilyHistoryMark className="mb-4 self-start bg-surface" /> : null}
                    <h3 className="text-title font-strong text-fg">{t.title}</h3>
                    <p className={cn("mt-3 text-body text-fg-2", fh && "lg:max-w-[64ch]")}>{t.summary}</p>
                    <div className="mt-auto pt-5">
                      <p className="font-mono text-eyebrow text-fg-3 uppercase">Heard in {t.ids.length} interviews</p>
                      <ul aria-label={`Interviews behind “${t.title}”`} className="mt-2 flex flex-wrap gap-1.5">
                        {t.ids.map((id) => (
                          <li key={id}>
                            <IdChip id={id} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Every interview */}
          <section aria-labelledby="all-title" className="mt-20 lg:mt-28">
            <BandHeading id="all-title" eyebrow="Interview by interview" title={`All ${total} interviews`}>
              <p role="note" className="mt-1 flex max-w-[72ch] items-start gap-2.5 text-body font-medium text-fg">
                <Info aria-hidden className="mt-1 size-4 shrink-0 text-brand" />
                <span>{R.note}</span>
              </p>
              <p className="flex flex-wrap items-center gap-2 text-small text-fg-2">
                <FamilyHistoryMark />
                <span>
                  marks the {familyHistory.length} interviews that touched on family history.
                </span>
              </p>
            </BandHeading>
            <InterviewList interviews={R.interviews} label={`All ${total} interviews`} className="mt-10" />
          </section>
        </Container>
      </Section>
    </main>
  );
}

/** An interview ID that jumps to its row in the list below. */
function IdChip({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="inline-flex h-7 items-center rounded-full bg-sunken px-2.5 font-mono text-caption font-medium text-fg-2 tabular-nums transition-colors duration-(--dur-hover) hover:bg-mist-2 hover:text-fg"
    >
      {id}
    </a>
  );
}
