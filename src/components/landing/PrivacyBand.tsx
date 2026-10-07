import { ArrowRight, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FlowDiagram } from "@/components/ui/FlowDiagram";
import { iconFor } from "@/components/ui/iconMap";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FLOW, MECHANISMS, PROTOTYPE_VS_PILOT } from "@/content/site";

/** §8.8 The night band: where every fact travels (lumen beams, two cycles then still), how, and what a pilot adds first. */
export function PrivacyBand() {
  return (
    <Section id="privacy" theme="night" grain aria-labelledby="privacy-title" className="relative overflow-hidden">
      {/* a lamp of lumen light over the heading */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[min(70rem,140%)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.16),rgb(47_143_122/0.08)_45%,transparent)]"
      />
      <div className="relative mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="privacy-title"
          eyebrow="Privacy by design"
          title="A paper trail, not a data trail."
          lead="Every fact carries where it came from. In this prototype, nothing else leaves your browser."
        />

        <Reveal className="mt-14 rounded-xl border border-line bg-white/[.02] p-5 shadow-raise-night sm:p-8 lg:mt-16 lg:p-10 [&_figure>div:first-child]:-my-[8%]">
          <FlowDiagram {...FLOW} />
        </Reveal>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MECHANISMS.map((m, i) => {
            const Icon = iconFor(m.icon);
            return (
              <Reveal as="li" key={m.title} delay={i * 0.07} className="h-full">
                <Card
                  tier="section"
                  className="flex h-full flex-col gap-3 bg-night-900/80 p-5 shadow-raise-night transition-colors duration-(--dur-hover) hover:border-lumen/25"
                >
                  {Icon ? (
                    <span aria-hidden className="grid size-10 place-items-center rounded-md border border-lumen/20 bg-lumen/10 text-lumen">
                      <Icon className="size-5" strokeWidth={1.75} />
                    </span>
                  ) : null}
                  <h3 className="text-ui font-strong text-fg">{m.title}</h3>
                  <p className="text-small text-fg-2">{m.body}</p>
                </Card>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-16 grid gap-10 border-t border-line pt-12 md:grid-cols-2 md:gap-12">
          <div>
            <h3 className="font-mono text-eyebrow text-fg-3 uppercase">Prototype today</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {PROTOTYPE_VS_PILOT.today.map((t) => (
                <li key={t} className="flex items-start gap-3 text-body text-fg">
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-lumen" strokeWidth={2.5} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-mono text-eyebrow text-fg-3 uppercase">Before any real patient data</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {PROTOTYPE_VS_PILOT.pilot.map((t) => (
                <li key={t} className="flex items-start gap-3 text-body text-fg-2">
                  <Clock aria-hidden className="mt-1 size-4 shrink-0 text-fg-3" strokeWidth={2} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal className="mt-14 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[36ch] font-display text-[1.5rem] leading-[1.3] font-light text-fg italic">{PROTOTYPE_VS_PILOT.refusal}</p>
          <Button href="/privacy" variant="link" iconRight={<ArrowRight />}>
            Security &amp; privacy
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}
