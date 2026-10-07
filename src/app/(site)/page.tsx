import SummaryDocument from "@/components/SummaryDocument";
import { FaqSection } from "@/components/landing/FaqSection";
import { FinalCta } from "@/components/landing/FinalCta";
import { GuidedChips } from "@/components/landing/GuidedChips";
import { HeroCopy } from "@/components/landing/HeroCopy";
import { HeroPlaceholder } from "@/components/landing/HeroPlaceholder";
import { PracticeBand } from "@/components/landing/PracticeBand";
import { PrivacyBand } from "@/components/landing/PrivacyBand";
import { ProblemStats } from "@/components/landing/ProblemStats";
import { ProductTour } from "@/components/landing/ProductTour";
import { receiptsFor } from "@/components/landing/receipts";
import { ReceiptsBento } from "@/components/landing/ReceiptsBento";
import { RelativesSection } from "@/components/landing/RelativesSection";
import { TwoReaders } from "@/components/landing/TwoReaders";
import { WhatWeHeard } from "@/components/landing/WhatWeHeard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { demoTree } from "@/lib/demo";
import { viewTree } from "@/lib/status";

// "/" (DESIGN §8). A Server Component: the synthetic demo family is built here and handed to the client islands as
// plain JSON (views, receipts) or as server-rendered slots (the two SummaryDocuments), so lib/* and the document code
// never ship to the browser for the landing. Nothing here reads or writes the visitor's stored tree.
export default function Home() {
  const tree = demoTree();
  const views = viewTree(tree);
  const receipts = receiptsFor(tree);
  const patientDoc = <SummaryDocument tree={tree} audience="patient" />;
  const clinicianDoc = <SummaryDocument tree={tree} audience="clinician" />;

  return (
    <main id="main">
      {/* §8.1–8.2. When P2 merges: <HeroStage model={buildStory(tree)}><HeroCopy /></HeroStage> */}
      <HeroPlaceholder receipts={receipts}>
        <HeroCopy />
      </HeroPlaceholder>
      <ProblemStats example={receipts.mgm} />
      <Section theme="white" aria-labelledby="product-title" className="overflow-hidden">
        <div className="mx-auto w-full max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="product-title"
            eyebrow="The product, live"
            title="This is the real app. Go ahead, click Dad."
            lead="Alex's family is made up. Every node, chip and page below is the working prototype, running in your browser."
          />
          <Reveal className="mt-12 lg:mt-16">
            <ProductTour views={views} receipts={receipts} patientDoc={patientDoc} clinicianDoc={clinicianDoc} />
          </Reveal>
        </div>
      </Section>
      <GuidedChips />
      <ReceiptsBento receipts={receipts} />
      <RelativesSection />
      <PrivacyBand />
      <TwoReaders patientDoc={patientDoc} clinicianDoc={clinicianDoc} />
      <PracticeBand />
      <WhatWeHeard />
      <FaqSection />
      <FinalCta receipts={receipts} />
    </main>
  );
}
