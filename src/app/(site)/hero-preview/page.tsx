// Internal QA page for the hero package (P2): the Night Window, the Clearing and OneFactBeam, mounted exactly as the
// landing page mounts them (DESIGN §8), with a stand-in for P3's HeroCopy. Not linked from the site; noindex.
// tests/e2e/hero.spec.ts runs here (and on "/" once the landing mounts HeroStage).
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroStage from "@/components/hero/HeroStage";
import OneFactBeam from "@/components/hero/OneFactBeam";
import { buildStory } from "@/components/hero/story";
import { HonestyPill } from "@/components/site/HonestyPill";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TextReveal } from "@/components/ui/TextReveal";
import { demoTree } from "@/lib/demo";

export const metadata: Metadata = {
  title: "Hero preview",
  robots: { index: false, follow: false, nocache: true },
};

const H1 = "Turn “heart problems run in the family” into who, what, and at what age.";

/** Stand-in for P3's landing/HeroCopy (§8.1 copy, verbatim). */
function PreviewHeroCopy() {
  return (
    <div className="flex flex-col items-start">
      <HonestyPill />
      <TextReveal
        as="h1"
        id="hero-title"
        text={H1}
        accent={{ text: "“heart problems run in the family”", style: "italic-muted" }}
        animate="after-accent"
        mark={{
          text: "at what age.",
          decoration: (
            <svg aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-[0.08em] left-0 h-[0.16em] w-[96%] overflow-visible text-brand">
              <path d="M2 8 C 50 3, 120 2, 198 6" pathLength={1} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeDasharray="1" className="motion-safe:animate-draw [animation-delay:400ms]" />
            </svg>
          ),
        }}
        className="mt-6 font-display text-display-xl font-book text-fg"
      />
      <p className="mt-6 max-w-[34rem] text-lead text-fg-2">
        Build your family’s heart history before your cardiology visit. Relatives fill in their own branch from one text link, and every answer keeps who said it and how sure they are.
      </p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-6">
        <Button href="/tree" size="lg" iconRight={<ArrowRight />} className="max-sm:w-full">
          Try the demo family
        </Button>
        <Button href="#two-readers" variant="link" size="lg" className="max-sm:self-center">
          See what your cardiologist gets
        </Button>
      </div>
      <p className="mt-8 font-mono text-eyebrow font-medium tracking-[0.08em] text-fg-3 uppercase">Made-up family · runs in your browser · no account</p>
    </div>
  );
}

export default function HeroPreviewPage() {
  const model = buildStory(demoTree());
  return (
    <main id="main">
      <HeroStage model={model}>
        <PreviewHeroCopy />
      </HeroStage>

      {/* The landing's next band is #problem (the hero's skip controls land there). */}
      <Section id="problem" theme="white" aria-labelledby="beam-title">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <SectionHeading
              id="beam-title"
              eyebrow="One fact, one beam"
              title="He shares one fact from his own portal. Nothing else leaves."
              lead="Tick a problem in Grandpa Luis’s made-up record and share it. Only what you tick travels to the tree; everything else is discarded on the page."
            />
          </div>
          <div className="lg:col-span-7">
            <OneFactBeam />
          </div>
        </div>
        <p className="container-page mt-10 font-mono text-eyebrow font-medium tracking-[0.08em] text-fg-3 uppercase">
          Demo: a real SMART on FHIR sign-in against a public sandbox with made-up patients
        </p>
      </Section>

      <Section id="two-readers" theme="paper" aria-labelledby="qa-title" className="py-16 lg:py-20">
        <div className="container-page">
          <Eyebrow>Internal QA · noindex</Eyebrow>
          <h2 id="qa-title" className="mt-3 font-display text-display-m font-book">
            Hero package preview
          </h2>
          <p className="mt-3 max-w-[60ch] text-body text-fg-2">
            This page mounts the hero stage and the one-fact beam the way the landing page does, so they can be tested on their own. The landing page itself is at{" "}
            <Link href="/">the home page</Link>.
          </p>
        </div>
      </Section>
    </main>
  );
}
