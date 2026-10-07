"use client";

// /view: the care-team copy a practice opens from the patient's link or the check-in QR (DESIGN §12.8b). Read-only.
// Unpacking, cleanTree and the error states are unchanged; every state has the minimal Lockup + HonestyRibbon header.
import { Link2Off } from "lucide-react";
import { useEffect, useState } from "react";
import { unpackJson } from "@/lib/compress";
import { cleanTree } from "@/lib/sanitize";
import type { FamilyTree } from "@/lib/types";
import { useHash } from "@/lib/useHash";
import { Lockup } from "./brand/Lockup";
import SummaryDocument from "./SummaryDocument";
import { contentHash } from "./summary/model";
import { PracticeContextBand } from "./summary/PracticeContextBand";
import { useClinicianReview } from "./summary/useClinicianReview";
import { Button } from "./ui/Button";
import { HonestyRibbon } from "./ui/HonestyRibbon";

export default function ClinicianView() {
  const hash = useHash();
  const [unpacked, setUnpacked] = useState<{ hash: string; tree: FamilyTree | null } | null>(null);

  useEffect(() => {
    if (!hash) return;
    let live = true;
    unpackJson<unknown>(hash).then((t) => {
      if (live) setUnpacked({ hash, tree: cleanTree(t) });
    });
    return () => {
      live = false;
    };
  }, [hash]);

  // undefined = still loading, null = missing or broken link
  const tree: FamilyTree | null | undefined = hash === null ? undefined : hash === "" ? null : unpacked?.hash === hash ? unpacked.tree : undefined;
  const [clinicianReviewedAt, setClinicianReviewed] = useClinicianReview(tree && hash ? contentHash(hash) : null);

  return (
    <div className="min-h-dvh bg-bg text-fg print:min-h-0 print:bg-white">
      <header data-shell="view" className="relative z-(--z-nav) bg-surface print:hidden">
        <HonestyRibbon />
        <div className="flex h-[60px] items-center justify-between gap-3 border-b border-line px-4 md:px-6">
          <Lockup href="/" size={26} surface="white" />
          <span className="hidden rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-eyebrow font-medium text-fg-2 uppercase min-[400px]:inline">
            Read-only
          </span>
        </div>
      </header>
      <main id="main" className="print:p-0">
        {tree === undefined ? <Opening /> : null}
        {tree === null ? <Incomplete /> : null}
        {tree ? (
          <>
            <PracticeContextBand tree={tree} reviewedAt={clinicianReviewedAt} onReviewed={setClinicianReviewed} />
            <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-16 sm:px-6 sm:pt-10 lg:px-8 print:max-w-none print:p-0">
              <div className="mx-auto max-w-[816px] rounded-paper shadow-paper print:max-w-none print:shadow-none">
                <SummaryDocument tree={tree} audience="clinician" provenance clinicianReviewedAt={clinicianReviewedAt} />
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

function Opening() {
  return (
    <div className="mx-auto w-full max-w-[816px] px-4 py-10 sm:px-6" aria-busy="true">
      <p className="sr-only" role="status">
        Opening summary…
      </p>
      <div aria-hidden className="flex flex-col gap-4 rounded-paper bg-white p-10 shadow-paper motion-safe:animate-pulse">
        <div className="h-3 w-48 rounded-full bg-mist" />
        <div className="h-9 w-40 rounded-md bg-mist" />
        <div className="h-3 w-80 max-w-full rounded-full bg-mist" />
        <div className="mt-4 h-px bg-ink/80" />
        <div className="mt-4 h-28 rounded-md bg-mist" />
        <div className="h-44 rounded-md bg-mist/70" />
      </div>
    </div>
  );
}

function Incomplete() {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-16 text-center sm:py-24">
      <span aria-hidden className="grid size-14 place-items-center rounded-full bg-mist text-ink-2">
        <Link2Off className="size-6" />
      </span>
      <h1 className="mt-6 font-display text-display-m font-book text-ink">This link is incomplete</h1>
      <p className="mt-3 max-w-[46ch] text-body text-fg-2">
        Ask the patient to share the whole link again, including everything after the #. The summary travels inside the link, so a cut-off link
        can’t be opened.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/practice" variant="secondary">
          See the practice demo
        </Button>
        <Button href="/" variant="ghost">
          What is Stemma?
        </Button>
      </div>
    </div>
  );
}
