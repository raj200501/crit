import type { CSSProperties } from "react";
import { StatGrid } from "@/components/site/StatGrid";
import { cn } from "@/components/ui/cn";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PedigreeGlyph } from "@/components/ui/PedigreeGlyph";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SourceChip } from "@/components/ui/SourceChip";
import { InView } from "./InView";
import type { PersonReceipt } from "./receipts";

// Each piece resolves after the strike (blur + rise), once. Armed only below the fold; SSR shows it resolved.
const RESOLVE =
  "transition-[opacity,filter,translate] duration-(--dur-reveal) ease-out-expo group-data-[state=armed]/inview:translate-y-1 group-data-[state=armed]/inview:opacity-[0.001] group-data-[state=armed]/inview:blur-[6px] group-data-[state=armed]/inview:transition-none";
const after = (ms: number): CSSProperties => ({ transitionDelay: `${ms}ms` });

/**
 * §8.3 "Family memory is lossy". A kinetic strike draws through the vague phrase once it scrolls in, then the precise
 * questions resolve under it and a real answer from the demo family fills in beside it. SSR, no-JS and reduced motion
 * show everything already drawn.
 */
export function ProblemStats({ example }: { example?: PersonReceipt }) {
  const line = example?.lines.find((l) => l.kind !== "record" && l.fact !== "Doesn't know");
  return (
    <Section id="problem" theme="paper" aria-labelledby="problem-title" className="overflow-x-clip">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <InView className="grid items-center gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Eyebrow>The problem</Eyebrow>
            <h2 id="problem-title" className="max-w-[24ch] font-display text-display-l font-book text-fg">
              <span className="relative inline-block">
                <span className="font-light text-fg-3 italic">&ldquo;It runs in the family&rdquo;</span>
                <span
                  aria-hidden
                  className="absolute top-[55%] right-[-0.04em] left-[-0.04em] h-px origin-left bg-fg-3 transition-transform duration-[600ms] ease-out-expo group-data-[state=armed]/inview:scale-x-0 group-data-[state=armed]/inview:transition-none"
                />
              </span>{" "}
              is where most family histories stop.
            </h2>
            <p className={cn("font-mono text-small tracking-[0.06em] text-brand uppercase", RESOLVE)} style={after(450)}>
              <span aria-hidden>→ </span>Who · What · At what age · Says who
            </p>
            <p className="mt-2 max-w-[60ch] text-lead text-fg-2">
              That isn&rsquo;t the patient&rsquo;s fault. Families pass down stories, not records, and a visit has minutes, not hours, to sort them out.
            </p>
          </div>

          {example && line ? (
            <figure className="relative">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-[radial-gradient(closest-side,rgb(207_245_231/0.7),transparent)] blur-2xl"
              />
              <div className="relative rounded-xl border border-line bg-white/70 p-2 shadow-md">
                <div className="rounded-[20px] border border-line bg-surface p-5 sm:p-6">
                  <figcaption className="flex items-center justify-between gap-3 border-b border-line pb-4">
                    <span className="font-mono text-eyebrow text-fg-3 uppercase">One answer, kept whole</span>
                    <span className="font-mono text-eyebrow text-fg-3 uppercase">Demo family</span>
                  </figcaption>
                  <dl className="mt-1 divide-y divide-line">
                    {[
                      {
                        k: "Who",
                        v: (
                          <span className="flex items-center gap-3">
                            <PedigreeGlyph shape={example.shape} status={example.glyph} finding={example.finding} deceased={example.deceased} size={26} />
                            <span className="flex flex-col">
                              {example.label}
                              <span className="text-small font-normal text-fg-3">{example.relation}</span>
                            </span>
                          </span>
                        ),
                      },
                      { k: "What", v: line.fact },
                      { k: "At what age", v: line.age ?? "Not reported" },
                      { k: "Says who", v: <SourceChip kind={line.kind} who={line.who} date={line.date} /> },
                    ].map((row, i) => (
                      <div
                        key={row.k}
                        className={cn("grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-3 py-3.5 sm:grid-cols-[7.5rem_minmax(0,1fr)]", RESOLVE)}
                        style={after(650 + i * 110)}
                      >
                        <dt className="font-mono text-eyebrow text-brand uppercase">{row.k}</dt>
                        <dd className="text-ui font-strong text-fg">{row.v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </figure>
          ) : null}
        </InView>
        <Reveal className="mt-16 lg:mt-24">
          {/* hovering or focusing a stat underlines its source link */}
          <StatGrid className="[&_figure:focus-within_sup_a]:underline [&_figure:hover_sup_a]:underline" />
        </Reveal>
      </div>
    </Section>
  );
}
