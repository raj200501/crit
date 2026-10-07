"use client";

// /summary: the patient's page only (AMENDMENTS A1). The sheet comes first at every width; a sticky stepper rail on
// desktop, and on phones a sticky review strip with a Share sheet. Logic as before: the review flag, the read-only
// /view# link (shareableTree, packed after the #), the QR and the FHIR download.
import { ChevronLeft, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { packJson } from "@/lib/compress";
import { shareableTree } from "@/lib/redact";
import { actions, useTree } from "@/lib/store";
import SummaryDocument from "./SummaryDocument";
import { CheckInSheet } from "./summary/CheckInSheet";
import { copyText, downloadFhir, qrDataUrl } from "./summary/files";
import { fmtDay, fmtStamp } from "./summary/model";
import { ReviewCheck } from "./summary/ReviewCheck";
import { StepperRail } from "./summary/StepperRail";
import { BorderBeam } from "./ui/BorderBeam";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";
import { Sheet } from "./ui/Sheet";
import { useStickyInset } from "./ui/StickyActionBar";
import { toast } from "./ui/Toast";

type Shared = { key: string; link: string; qr: string | null };

export default function SummaryPage() {
  const tree = useTree();
  const reviewed = !!tree.reviewedAt;
  const [shared, setShared] = useState<Shared | null>(null);
  const [making, setMaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [checkIn, setCheckIn] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  // Bumped when the patient ticks the review in this session: the sheet's border beam runs one lap.
  const [lap, setLap] = useState(0);
  const copiedTimer = useRef<number | undefined>(undefined);
  const stripRef = useRef<HTMLDivElement>(null);
  useStickyInset(stripRef);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);

  // A link is only shown while the content it was made from is unchanged.
  const contentKey = `${tree.id}|${tree.reports.map((r) => r.id).join()}|${tree.people.map((p) => `${p.id}${p.label}${p.sex}${p.deceased}`).join()}|${tree.reviewedAt}|${tree.visit?.date}`;
  const link = shared?.key === contentKey ? shared.link : null;
  const qr = shared?.key === contentKey ? shared.qr : null;

  const makeLink = useCallback(async () => {
    const key = contentKey;
    setMaking(true);
    try {
      const packed = await packJson(shareableTree(tree));
      const url = `${window.location.origin}/view#${packed}`;
      const code = await qrDataUrl(url);
      setShared({ key, link: url, qr: code });
      actions.markShared();
      return url;
    } finally {
      setMaking(false);
    }
  }, [contentKey, tree]);

  const onReview = (checked: boolean) => {
    actions.markReviewed(checked);
    if (checked) setLap((n) => n + 1);
  };

  const onCopy = async () => {
    if (!link) return;
    const ok = await copyText(link);
    if (ok) {
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
      toast({ title: "Link copied", body: "Send it to the practice. It opens a read-only copy for your care team.", tone: "brand" });
    } else {
      toast({ title: "Couldn’t copy the link", body: "Select it in the box and copy it yourself." });
    }
  };

  const onPrint = () => {
    setPrinted(true);
    window.print();
  };

  const onCheckIn = async () => {
    if (!link) await makeLink();
    setCheckIn(true);
  };

  const stepProps = {
    reviewed,
    onReview,
    printed,
    onPrint,
    onCheckIn,
    link,
    qr,
    making,
    onMakeLink: () => void makeLink(),
    copied,
    onCopy,
    onDownload: () => downloadFhir(tree),
  };
  const visitDate = fmtDay(tree.visit?.date, { year: false });

  return (
    <main id="main" className="relative isolate min-h-[calc(100dvh-92px)] bg-mist pb-10 print:min-h-0 print:bg-white print:p-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(48%_70%_at_28%_0%,rgb(207_245_231/0.7),transparent_72%),radial-gradient(30%_50%_at_88%_4%,rgb(214_233_255/0.6),transparent_70%)] print:hidden"
      />
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8 print:max-w-none print:p-0">
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <Button href="/tree" variant="ghost" size="sm" iconLeft={<ChevronLeft />} className="-ml-2.5 max-md:h-11">
            Back to tree
          </Button>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,816px)_minmax(320px,360px)] lg:items-start lg:justify-center lg:gap-10 xl:gap-12">
          {/* the sheet, first at every width */}
          <div className="relative mx-auto w-full max-w-[816px] print:max-w-none">
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-[8%] -bottom-10 -z-10 h-40 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.55),transparent)] blur-2xl transition-opacity duration-(--dur-reveal) print:hidden",
                reviewed ? "opacity-100" : "opacity-0",
              )}
            />
            <BorderBeam
              key={lap}
              active={reviewed}
              mode="once"
              radius={6}
              className="shadow-paper print:overflow-visible print:bg-transparent print:p-0 print:shadow-none print:[&>[aria-hidden]]:hidden"
              contentClassName="bg-white print:rounded-none"
            >
              <SummaryDocument tree={tree} audience="patient" provenance />
            </BorderBeam>
            <p className="mt-4 flex items-center justify-center gap-2 font-mono text-eyebrow text-ink-3 uppercase print:hidden">
              <span aria-hidden className={cn("size-1.5 rounded-full transition-colors duration-(--dur-ui)", reviewed ? "bg-evergreen-600" : "bg-ink-4")} />
              Your copy · prints on one Letter page
            </p>
          </div>

          {/* desktop rail */}
          <aside aria-label="Review and share" className="hidden lg:sticky lg:top-[calc(var(--app-header-h)+24px)] lg:block print:hidden">
            <div className="max-h-[calc(100dvh-var(--app-header-h)-48px)] overflow-y-auto rounded-lg border border-line bg-surface shadow-md [scrollbar-width:thin]">
              <div className="border-b border-line px-6 pt-5 pb-4">
                <p className="font-mono text-eyebrow font-medium text-ink-3 uppercase">
                  Before your visit{visitDate ? ` · ${visitDate}` : ""}
                </p>
                <h2 className="mt-1 font-display text-title font-book text-ink">Get it to your care team</h2>
              </div>
              <StepperRail steps={["review", "care", "bring", "share"]} idPrefix="rail" className="px-6 pt-5 pb-6" {...stepProps} />
              {tree.sharedAt ? (
                <p className="border-t border-line px-6 py-3 font-mono text-eyebrow text-ink-3 uppercase">
                  Link last made <span suppressHydrationWarning>{fmtStamp(tree.sharedAt, { time: true })}</span>
                </p>
              ) : null}
            </div>
          </aside>
        </div>

        {/* phones and tablets: a sticky review strip + Share (the review box stays the first checkbox in the DOM) */}
        <div
          ref={stripRef}
          data-sticky-actions=""
          className="sticky bottom-[calc(76px+env(safe-area-inset-bottom))] z-(--z-sticky) mx-auto mt-5 max-w-[816px] md:bottom-4 lg:hidden print:hidden"
        >
          <div className="glass flex items-center gap-2 rounded-lg border border-line p-1.5 shadow-lg">
            <ReviewCheck variant="strip" checked={reviewed} onChange={onReview} className="min-w-0 flex-1" />
            <Button variant={reviewed ? "primary" : "secondary"} iconLeft={<Send />} onClick={() => setShareOpen(true)} aria-haspopup="dialog" className="shrink-0">
              Share
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={shareOpen} onClose={() => setShareOpen(false)} side="auto" label="Bring and share your summary" snap={[0.72, 0.94]}>
        <div className="pb-2">
          <p className="pr-12 font-mono text-eyebrow font-medium text-ink-3 uppercase">Before your visit{visitDate ? ` · ${visitDate}` : ""}</p>
          <h2 className="mt-1 mb-5 font-display text-title font-book text-ink">Get it to your care team</h2>
          <StepperRail steps={["care", "bring", "share"]} idPrefix="sheet" {...stepProps} />
        </div>
      </Sheet>

      <CheckInSheet open={checkIn} onClose={() => setCheckIn(false)} tree={tree} link={link} qr={qr} copied={copied} onCopy={onCopy} />
    </main>
  );
}
