import type { Metadata } from "next";
import { Lockup } from "@/components/brand/Lockup";
import { HonestyRibbon } from "@/components/ui/HonestyRibbon";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Gallery } from "./Gallery";

// Internal QA page: every P1 primitive, in a paper and a night section. Not linked from the site.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false, nocache: true },
};

export default function DesignSystemPage() {
  return (
    <>
      <header className="sticky top-0 z-(--z-nav) bg-surface/90 backdrop-blur-md print:hidden">
        <HonestyRibbon />
        <div className="border-b border-line">
          <div className="mx-auto flex h-14 w-full max-w-[1240px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <Lockup href="/" size={26} surface="white" descriptor="lg" />
            <span className="rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-eyebrow font-medium text-fg-2 uppercase">Design system</span>
          </div>
        </div>
      </header>
      <main id="main">
        <div className="mx-auto w-full max-w-[1240px] px-4 pt-12 pb-8 sm:px-6 lg:px-8">
          <Eyebrow>Internal QA · noindex</Eyebrow>
          <h1 className="mt-3 font-display text-display-l font-book">“Clearing” primitives</h1>
          <p className="mt-4 max-w-[60ch] text-lead text-fg-2">
            Every shared component from <code className="font-mono text-[0.9em]">src/components/ui</code>, <code className="font-mono text-[0.9em]">brand</code> and{" "}
            <code className="font-mono text-[0.9em]">site</code>, shown on paper and inside a night band. Hover and focus states are drawn statically.
          </p>
        </div>
        <Gallery tone="paper" />
        <Gallery tone="night" />
      </main>
    </>
  );
}
