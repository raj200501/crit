"use client";

import { Check, Copy, ScanLine } from "lucide-react";
import { useId } from "react";
import { LogoMark } from "@/components/brand/LogoMark";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import type { FamilyTree } from "@/lib/types";
import { fmtDay } from "./model";

export interface CheckInSheetProps {
  open: boolean;
  onClose: () => void;
  tree: FamilyTree;
  link: string | null;
  qr: string | null;
  copied: boolean;
  onCopy: () => void;
}

/**
 * Check-in mode (DESIGN §12.8a): the app's single dark moment. A full-screen night scrim with a white boarding pass:
 * who and when, a QR as large as the screen allows (min(88vw, 72svh, 560px)), and a Copy link fallback.
 * Esc closes and focus returns to the trigger (Sheet). Reduced motion: no scale.
 */
export function CheckInSheet({ open, onClose, tree, link, qr, copied, onCopy }: CheckInSheetProps) {
  const titleId = useId();
  const visit = tree.visit;
  const date = fmtDay(visit?.date);
  return (
    <Sheet open={open} onClose={onClose} side="full" tone="night" labelledBy={titleId} className="text-ivory">
      <div className="flex min-h-full flex-col items-center justify-center bg-night/70 px-3 py-14 sm:px-6">
        <div data-theme="paper" className="relative w-full max-w-[600px] overflow-hidden rounded-xl bg-white text-ink shadow-[0_40px_100px_-30px_rgb(127_230_197/0.35),0_12px_32px_-12px_rgb(0_0_0/0.6)]">
          {/* stub: who and when */}
          <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-7 sm:pt-6">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-eyebrow font-medium text-ink-3 uppercase">
                <LogoMark size={18} surface="white" />
                Read-only summary
              </p>
              <h2 id={titleId} className="mt-2 font-display text-[1.875rem] leading-tight font-book tracking-[-0.015em] text-ink">
                {tree.patientName === "You" ? "Family history" : tree.patientName}
                {visit ? <span className="text-ink-3"> · {visit.specialty}</span> : null}
              </h2>
              <p className="mt-1 font-mono text-eyebrow text-ink-2 uppercase">
                {[date, visit?.practice].filter(Boolean).join(" · ") || "Pre-visit family history"}
              </p>
            </div>
            {tree.synthetic ? (
              <span className="mt-0.5 hidden shrink-0 rounded-full bg-mist px-2.5 py-1 text-caption font-medium text-ink-2 min-[420px]:inline">Synthetic demo data</span>
            ) : null}
          </div>
          {/* perforation */}
          <div aria-hidden className="relative my-4 h-5">
            <span className="absolute top-0 -left-2.5 size-5 rounded-full bg-night" />
            <span className="absolute top-0 -right-2.5 size-5 rounded-full bg-night" />
            <span className="absolute inset-x-5 top-1/2 border-t-2 border-dashed border-line-strong" />
          </div>
          {/* the code */}
          <div className="flex flex-col items-center px-4 pb-5 sm:px-7">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- a generated data: URL
              <img
                src={qr}
                alt="QR code that opens a read-only copy of this summary at the front desk"
                width={560}
                height={560}
                className="aspect-square size-[min(84vw,calc(100svh_-_22rem),540px)] min-h-56 min-w-56"
              />
            ) : (
              <p className="max-w-[40ch] py-10 text-center text-small text-ink-2">
                This summary is too long for one QR code. Copy the link and send it through the practice’s portal instead.
              </p>
            )}
            <p className="mt-3 flex items-center gap-2 text-ui font-strong text-ink">
              <ScanLine aria-hidden className="size-4 text-evergreen-600" />
              Ask the front desk to scan
            </p>
            <p className="mt-1 text-center text-caption text-ink-3">Opens the care-team version. Read-only; nothing is stored on a server.</p>
            {link ? (
              <Button variant="secondary" size="md" iconLeft={copied ? <Check /> : <Copy />} onClick={onCopy} className="mt-4">
                {copied ? "Link copied" : "Copy link"}
              </Button>
            ) : null}
          </div>
        </div>
        <p className="mt-5 hidden text-caption text-ivory-2 pointer-fine:block">Press Esc or Close to go back.</p>
      </div>
    </Sheet>
  );
}
