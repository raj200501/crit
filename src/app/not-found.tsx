import type { Metadata } from "next";
import { Lockup } from "@/components/brand/Lockup";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { HonestyRibbon } from "@/components/ui/HonestyRibbon";

// Any unmatched URL (and notFound()). Owned by P1: the minimal header (honesty ribbon + lockup), one <main id="main">.
export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header data-shell="minimal" className="bg-surface">
        <HonestyRibbon />
        <div className="border-b border-line">
          <div className="container-page flex h-[60px] items-center">
            <Lockup href="/" size={26} surface="white" />
          </div>
        </div>
      </header>
      <main id="main" className="container-page flex flex-1 flex-col items-start justify-center gap-5 py-20">
        <Eyebrow>404</Eyebrow>
        <h1 className="max-w-[22ch] font-display text-display-m font-book">Page not found</h1>
        <p className="max-w-[60ch] text-lead text-fg-2">There&rsquo;s nothing at this address. The link may be mistyped or cut short.</p>
        <Button href="/">Back to the start</Button>
      </main>
    </div>
  );
}
