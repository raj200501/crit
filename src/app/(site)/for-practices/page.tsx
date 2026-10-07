// PLACEHOLDER created by P1 so SiteNav, SiteFooter and the pilot CTAs never 404 (and Next's link prefetch stays clean).
// P4 owns this route (DESIGN §10.1) and replaces this file.
import type { Metadata } from "next";
import { PilotCard } from "@/components/site/PilotCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowDiagram } from "@/components/ui/FlowDiagram";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FLOW, pilotHref } from "@/content/site";

export const metadata: Metadata = { title: "For practices" };

export default function ForPracticesPage() {
  return (
    <main id="main">
      {/* room for the fixed SiteNav */}
      <div aria-hidden className="h-20 print:hidden" />
      <Container className="pt-12 pb-16 lg:pt-16 lg:pb-24">
        <SectionHeading
          as="h1"
          eyebrow="For cardiology practices"
          title="Family history that arrives before the patient does."
          lead="Send one link with your new-patient paperwork. Patients and their relatives fill it in. You get a one-page, source-labeled summary, a read-only link for check-in, and a FHIR file for the chart."
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button href={pilotHref()}>Request a pilot conversation</Button>
          <Button href="/practice" variant="secondary">
            Open the care-team view
          </Button>
        </div>
      </Container>
      <Container className="pb-16 lg:pb-24">
        <FlowDiagram {...FLOW} />
      </Container>
      <Container className="pb-20 lg:pb-32">
        <PilotCard headingAs="h2" className="max-w-[640px]" />
      </Container>
    </main>
  );
}
