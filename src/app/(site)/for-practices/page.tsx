import type { Metadata } from "next";
import { ArrowRight, Printer } from "lucide-react";
import SummaryDocument from "@/components/SummaryDocument";
import { AnnotatedDocument } from "@/components/content/AnnotatedDocument";
import { DEMO, report } from "@/components/content/demoFamily";
import { DocPreview } from "@/components/content/DocPreview";
import { IntakeTimeline } from "@/components/content/IntakeTimeline";
import { PageHero } from "@/components/content/PageHero";
import { ArrivalCards, PatientMessages, RegulatoryLine } from "@/components/content/PracticePieces";
import { PilotCard } from "@/components/site/PilotCard";
import { ProofList } from "@/components/site/ProofList";
import { StatGrid } from "@/components/site/StatGrid";
import { Button } from "@/components/ui/Button";
import { Cite } from "@/components/ui/Cite";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ProductFrame } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SourceChip } from "@/components/ui/SourceChip";
import { StatusPill } from "@/components/ui/StatusPill";
import { FDA_LINE, PILOT, pilotHref } from "@/content/site";

export const metadata: Metadata = {
  title: "For practices",
  description:
    "For cardiology practices: one link with your new-patient paperwork, and a one-page, source-labeled family history summary before the visit. Synthetic demo data.",
};

/** Hero visual: the real care-team sheet in a window, with two receipts floating off it (desktop). */
function HeroWindow() {
  const mom = report("r-dad-mom");
  const dev = report("r-dad-dev");
  return (
    <div className="relative lg:pl-4">
      <ProductFrame title="Care-team summary · demo" aspect="1/1" mobileAspect="4/5" contentClassName="overflow-hidden bg-mist">
        <div className="absolute inset-x-4 top-4 rounded-paper bg-white shadow-paper sm:inset-x-6 sm:top-6">
          {/* a tighter sheet margin than the full page, so the window shows the header and the review band */}
          <DocPreview heightClassName="h-[40rem]" className="[&_article]:px-6! [&_article]:pt-7! sm:[&_article]:px-8!">
            <SummaryDocument tree={DEMO} audience="clinician" />
          </DocPreview>
        </div>
      </ProductFrame>
      {/* receipts that float off the sheet: decorative copies of what the sheet already says */}
      <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-12 hidden w-[17.5rem] xl:block">
        <Reveal delay={0.15} className="rounded-lg border border-line bg-surface p-4 shadow-lg">
          <div className="flex items-center justify-between gap-3">
            <span className="text-small font-strong text-fg">Dad</span>
            <StatusPill status="conflicting" size="sm" />
          </div>
          <div className="mt-3 flex flex-col gap-2.5 border-t border-line pt-3">
            {[
              { what: "Heart attack · 60", r: mom },
              { what: "Angina · about 58", r: dev },
            ].map(({ what, r }) => (
              <div key={r.id} className="flex flex-col items-start gap-1">
                <span className="text-small whitespace-nowrap text-fg">{what}</span>
                <SourceChip kind="relative" who={r.reportedBy} date={r.reportedAt} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
      <div aria-hidden className="pointer-events-none absolute -top-5 -right-3 hidden xl:block">
        <Reveal delay={0.3} className="flex items-center gap-2 rounded-full border border-line bg-surface py-2 pr-4 pl-2.5 shadow-md">
          <span className="grid size-7 place-items-center rounded-full bg-evergreen-50 text-known-ink">
            <Printer className="size-4" strokeWidth={1.75} />
          </span>
          <span className="text-small font-medium text-fg">Prints on one Letter page</span>
        </Reveal>
      </div>
    </div>
  );
}

export default function ForPracticesPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="For cardiology practices"
        title="Family history that arrives before the patient does."
        underline="before"
        lead="Send one link with your new-patient paperwork. Patients and their relatives fill it in. You get a one-page, source-labeled summary, a read-only link for check-in, and a FHIR file for the chart."
        aside={<HeroWindow />}
      >
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={pilotHref()} size="lg" className="max-sm:w-full">
            Request a pilot conversation
          </Button>
          <Button href="/practice" variant="secondary" size="lg" iconRight={<ArrowRight />} className="max-sm:w-full">
            Open the care-team view
          </Button>
        </div>
        <p className="mt-8 font-mono text-eyebrow text-fg-3 uppercase">One link in · one page out · FHIR for the chart</p>
      </PageHero>

      {/* 2. What's on the page */}
      <Section theme="white" id="on-the-page" aria-labelledby="on-the-page-title">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              id="on-the-page-title"
              eyebrow="The care-team page"
              title="What’s on the page, and why."
              lead="This is the real document for Alex’s made-up family. Pick a number to see what each part is for."
            />
            <Button href="/practice" variant="link" iconRight={<ArrowRight />} className="shrink-0 self-start lg:self-end">
              Open it in the practice demo
            </Button>
          </div>
          <AnnotatedDocument
            className="mt-14"
            label="The care-team page for Alex’s made-up family: the clinician review band, gaps and conflicts, the relative table and a source on every fact."
          >
            <SummaryDocument tree={DEMO} audience="clinician" />
          </AnnotatedDocument>
        </Container>
      </Section>

      {/* 3. How it arrives */}
      <Section theme="paper" aria-labelledby="arrives-title">
        <Container>
          <SectionHeading
            id="arrives-title"
            eyebrow="How it arrives"
            title="On paper, at the front desk, or in the chart."
            lead="The same page in three forms. Nothing to install at the practice."
          />
          <ArrivalCards className="mt-12" careTeamDoc={<SummaryDocument tree={DEMO} audience="clinician" />} />
        </Container>
      </Section>

      {/* 4. How it fits your intake */}
      <Section theme="mist" aria-labelledby="intake-title">
        <Container>
          <SectionHeading
            id="intake-title"
            eyebrow="How it fits your intake"
            title="One more link in the paperwork you already send."
          />
          <IntakeTimeline className="mt-14" />
          <p className="mt-12 max-w-[60ch] border-t border-line-strong pt-5 text-small text-fg-2">
            Built to be read in about a minute. That&rsquo;s a target we&rsquo;re testing with clinicians, not a result.
          </p>
        </Container>
      </Section>

      {/* 5. What your patients receive */}
      <Section theme="white" aria-labelledby="receive-title">
        <Container>
          <SectionHeading
            id="receive-title"
            eyebrow="What your patients receive"
            title="Two short texts. No health information in either."
            lead="Your practice sends one. The patient sends one to each relative. The private page explains who is asking and why; the texts don’t."
          />
          <PatientMessages className="mt-12" />
        </Container>
      </Section>

      {/* 6. The regulatory line */}
      <Section theme="night" grain aria-labelledby="line-title" className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 h-80 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.12),transparent)]"
        />
        <Container className="relative grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow>Built for the regulatory line</Eyebrow>
            <h2 id="line-title" className="mt-4 max-w-[16ch] font-display text-display-l font-book text-fg">
              Criteria for the clinician. Facts for the patient.
            </h2>
            <p className="mt-6 max-w-[52ch] text-lead text-fg-2">
              {FDA_LINE.text}
              <Cite n={FDA_LINE.cite} />
            </p>
            <p className="mt-4 max-w-[52ch] text-body text-fg">
              Guideline criteria appear only on the care-team page, each with its basis, inputs and what&rsquo;s missing.
            </p>
          </div>
          <RegulatoryLine className="lg:col-span-7 lg:self-center" />
        </Container>
      </Section>

      {/* 7. Evidence */}
      <Section theme="paper" aria-labelledby="evidence-title">
        <Container>
          <SectionHeading
            id="evidence-title"
            eyebrow="Evidence"
            title="Family history, as it’s collected today."
            lead="Families pass down stories, not records, and a visit has minutes, not hours, to sort them out."
          />
          <StatGrid animated={false} className="mt-14" />
          <div className="mt-20 grid gap-8 lg:grid-cols-12">
            <h3 className="font-display text-display-m font-book text-fg lg:col-span-4">Why a guided pedigree</h3>
            <ProofList className="lg:col-span-8" />
          </div>
        </Container>
      </Section>

      {/* 8. Pilot */}
      <Section theme="mist" aria-labelledby="pilot-title" className="relative overflow-hidden">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Eyebrow>Proposed pilot</Eyebrow>
            <h2 id="pilot-title" className="mt-4 max-w-[16ch] font-display text-display-l font-book text-fg">
              Start with a paid pilot.
            </h2>
            <p className="mt-6 max-w-[48ch] text-lead text-fg-2">{PILOT.after}</p>
            <p className="mt-6 font-mono text-eyebrow text-fg-3 uppercase">8–12 weeks · flat fee · you see results before any annual contract</p>
            <Button href="/pilot" variant="link" iconRight={<ArrowRight />} className="mt-4">
              Pricing, metrics and the go/no-go
            </Button>
          </div>
          <PilotCard headingAs="h3" className="lg:col-span-6" />
        </Container>
      </Section>
    </main>
  );
}
