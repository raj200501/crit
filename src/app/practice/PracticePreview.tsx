"use client";

// PLACEHOLDER (P1) for the practice-side demo. P7 owns and rebuilds it per AMENDMENTS A1.
import { Lockup } from "@/components/brand/Lockup";
import SummaryDocument from "@/components/SummaryDocument";
import { Badge } from "@/components/ui/Badge";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HonestyRibbon } from "@/components/ui/HonestyRibbon";
import { HONESTY } from "@/content/site";
import { shareableTree } from "@/lib/redact";
import { useTree } from "@/lib/store";

export default function PracticePreview() {
  const tree = useTree();
  return (
    <div className="min-h-dvh bg-mist print:min-h-0 print:bg-white">
      <header data-shell="practice" className="bg-surface print:hidden">
        <HonestyRibbon />
        <div className="container-page flex h-14 items-center">
          <Lockup href="/" size={26} />
        </div>
      </header>
      <main id="main" className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 sm:py-12 print:p-0!">
        <div className="flex flex-wrap items-end justify-between gap-4 print:hidden">
          <div>
            <Eyebrow>Practice view · demo</Eyebrow>
            <h1 className="mt-2 font-display text-display-m font-book">Cardiology Associates (demo)</h1>
          </div>
          <Badge>{HONESTY.docChip}</Badge>
        </div>
        <p className="mt-4 max-w-[68ch] text-small text-fg-2 print:hidden">
          In a pilot, this arrives through the practice link or the check-in QR, not from the patient&rsquo;s browser.
        </p>
        <div className="mt-6 print:mt-0">
          <SummaryDocument tree={shareableTree(tree)} audience="clinician" />
        </div>
      </main>
    </div>
  );
}
