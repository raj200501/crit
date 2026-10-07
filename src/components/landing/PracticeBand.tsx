import { ArrowRight } from "lucide-react";
import { PilotCard } from "@/components/site/PilotCard";
import { ProofList } from "@/components/site/ProofList";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pilotCta } from "@/content/site";

/** §8.10 For cardiology practices: the evidence, the proposed pilot, and the way in. */
export function PracticeBand() {
  const cta = pilotCta();
  return (
    <Section id="practices" theme="white" aria-labelledby="practices-title" className="overflow-x-clip">
      <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="practices-title"
          eyebrow="For cardiology practices"
          title="Family history that arrives before the patient does."
          lead="Send one link with your new-patient paperwork. Patients and their relatives fill it in. You get a one-page, source-labeled summary, built to be read in about a minute. That's a target we're testing with clinicians, not a result."
        />
        <div className="mt-12 grid items-start gap-12 lg:mt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <Reveal className="flex flex-col gap-10">
            <ProofList />
            <div className="flex flex-col gap-5">
              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button href={cta.href} size="lg">
                  {cta.label}
                </Button>
                {/* AMENDMENTS A1: the care-team view is the practice-side demo at /practice */}
                <Button href="/practice" variant="secondary" size="lg">
                  See the care-team view
                </Button>
                {cta.contact ? (
                  <Button href="/pilot" variant="link" iconRight={<ArrowRight />} className="self-center sm:ml-2">
                    Pilot details
                  </Button>
                ) : null}
              </div>
              <p className="font-mono text-eyebrow text-fg-3 uppercase">8–12 weeks · flat fee · you see results before any annual contract</p>
            </div>
          </Reveal>
          <Reveal delay={0.08} className="relative lg:sticky lg:top-28">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(207_245_231/0.8),transparent)] blur-2xl"
            />
            <PilotCard ctas={false} className="relative" />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
