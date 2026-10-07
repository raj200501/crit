"use client";

import { Check, Copy, Download, Link2, Lock, Printer, QrCode } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { ReviewCheck } from "./ReviewCheck";

export type StepId = "review" | "care" | "bring" | "share";

export interface StepperRailProps {
  steps: StepId[];
  /** Prefix for DOM ids (the rail and the phone sheet can both be in the document). */
  idPrefix: string;
  reviewed: boolean;
  onReview: (checked: boolean) => void;
  printed: boolean;
  onPrint: () => void;
  onCheckIn: () => void;
  link: string | null;
  qr: string | null;
  making: boolean;
  onMakeLink: () => void;
  copied: boolean;
  onCopy: () => void;
  onDownload: () => void;
  className?: string;
}

export const CARE_TEAM_COPY =
  "Your care team gets a separate version through the practice link or the check-in QR. It adds family-history criteria from cardiology guidelines for your clinician to review. It doesn’t diagnose anyone.";

/**
 * The /summary stepper (DESIGN §12.8a as amended by A1): ① Review · ② What your care team gets · ③ Bring it · ④ Share
 * with the practice. Numbered bubbles joined by a thread that fills evergreen as steps are done.
 */
export function StepperRail(props: StepperRailProps) {
  const { steps, idPrefix, reviewed, printed, link, className } = props;
  const done: Record<StepId, boolean> = { review: reviewed, care: reviewed, bring: printed, share: !!link };
  const all: StepId[] = ["review", "care", "bring", "share"];
  const current = all.find((s) => steps.includes(s) && !done[s]);
  const hintId = `${idPrefix}-review-first`;
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((s, i) => (
        <Step key={s} n={all.indexOf(s) + 1} done={done[s]} current={current === s} last={i === steps.length - 1} title={TITLES[s]} id={`${idPrefix}-${s}`}>
          {s === "review" ? <ReviewBody {...props} /> : null}
          {s === "care" ? <p className="text-small text-fg-2">{CARE_TEAM_COPY}</p> : null}
          {s === "bring" ? <BringBody {...props} hintId={hintId} /> : null}
          {s === "share" ? <ShareBody {...props} hintId={hintId} /> : null}
        </Step>
      ))}
    </ol>
  );
}

const TITLES: Record<StepId, string> = {
  review: "Review it",
  care: "What your care team gets",
  bring: "Bring it",
  share: "Share with the practice",
};

function Step({ n, done, current, last, title, id, children }: { n: number; done: boolean; current: boolean; last: boolean; title: string; id: string; children: ReactNode }) {
  return (
    <li aria-labelledby={id} className={cn("relative grid grid-cols-[28px_minmax(0,1fr)] gap-x-4", !last && "pb-6")}>
      {!last ? (
        <span aria-hidden className="absolute top-9 bottom-2 left-[13px] w-0.5 overflow-hidden rounded-full bg-line">
          <span
            className={cn(
              "absolute inset-0 origin-top rounded-full bg-evergreen-600 transition-transform duration-(--dur-reveal) ease-out-expo motion-reduce:transition-none",
              done ? "scale-y-100" : "scale-y-0",
            )}
          />
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          "relative z-1 grid size-7 place-items-center rounded-full border font-mono text-eyebrow font-medium transition-[background-color,border-color,color,box-shadow] duration-(--dur-ui)",
          done
            ? "border-evergreen-600 bg-evergreen-600 text-white"
            : current
              ? "border-ink bg-surface text-ink shadow-[0_0_0_4px_var(--color-evergreen-50)]"
              : "border-line-strong bg-surface text-fg-3",
        )}
      >
        {done ? <Check className="size-3.5" strokeWidth={3} /> : n}
      </span>
      <div className="min-w-0 pt-0.5">
        <h3 id={id} className="font-sans text-ui font-strong text-fg">
          <span className="sr-only">Step {n}: </span>
          {title}
          {done ? <span className="sr-only"> (done)</span> : null}
        </h3>
        <div className="mt-2.5 flex flex-col gap-2.5">{children}</div>
      </div>
    </li>
  );
}

function ReviewBody({ reviewed, onReview, idPrefix }: StepperRailProps) {
  return (
    <>
      <ReviewCheck checked={reviewed} onChange={onReview} describedBy={`${idPrefix}-review-note`} />
      <p id={`${idPrefix}-review-note`} className="text-caption text-fg-3">
        Changing the tree clears this, so what you share is never out of date.
      </p>
    </>
  );
}

function ReviewFirst({ id, reviewed }: { id: string; reviewed: boolean }) {
  return reviewed ? null : (
    <p id={id} className="flex items-center gap-1.5 text-caption text-fg-3">
      <Lock aria-hidden className="size-3.5" />
      Review the summary first.
    </p>
  );
}

function BringBody({ reviewed, onPrint, onCheckIn, hintId }: StepperRailProps & { hintId: string }) {
  return (
    <>
      <Button fullWidth iconLeft={<Printer />} disabled={!reviewed} aria-describedby={reviewed ? undefined : hintId} onClick={onPrint}>
        Print or save as PDF
      </Button>
      <Button fullWidth variant="secondary" iconLeft={<QrCode />} disabled={!reviewed} aria-describedby={reviewed ? undefined : hintId} onClick={onCheckIn}>
        Show at check-in
      </Button>
      <ReviewFirst id={hintId} reviewed={reviewed} />
    </>
  );
}

function ShareBody({ reviewed, link, qr, making, onMakeLink, copied, onCopy, onDownload, hintId, idPrefix }: StepperRailProps & { hintId: string }) {
  const block = useRef<HTMLDivElement>(null);
  // a new link: bring it into view inside the (scrollable) rail
  useEffect(() => {
    if (!link) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    block.current?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [link]);
  return (
    <>
      {link ? null : (
        <Button
          fullWidth
          variant="secondary"
          iconLeft={<Link2 />}
          loading={making}
          disabled={!reviewed}
          aria-describedby={reviewed ? undefined : `${hintId}-share`}
          onClick={onMakeLink}
        >
          Make a link for the practice
        </Button>
      )}
      {!reviewed ? <ReviewFirst id={`${hintId}-share`} reviewed={reviewed} /> : null}
      {link ? (
        <div ref={block} className="flex flex-col gap-3 rounded-md border border-line bg-sunken/60 p-3 motion-safe:animate-fade-up">
          <p className="flex items-center gap-1.5 text-caption font-medium text-evergreen-700">
            <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
            Link ready · opens a read-only copy
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              aria-label="Read-only summary link"
              aria-describedby={`${idPrefix}-link-note`}
              onFocus={(e) => e.currentTarget.select()}
              className="h-10 min-w-0 flex-1 truncate rounded-sm border border-line-strong bg-surface px-3 font-mono text-[0.8125rem] text-fg-2 focus-visible:outline-2 focus-visible:outline-offset-1"
            />
            <Button size="sm" variant={copied ? "secondary" : "primary"} iconLeft={copied ? <Check /> : <Copy />} onClick={onCopy} className="h-10 min-w-[5.75rem]">
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          {qr ? (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- a generated data: URL, not a static asset */}
              <img
                src={qr}
                alt="QR code that opens a read-only copy of this summary"
                width={96}
                height={96}
                className="size-24 shrink-0 rounded-sm border border-line bg-white"
              />
              <p className="text-caption text-fg-2">
                Scan to open the care-team copy. At the front desk, <span className="font-medium text-fg">Show at check-in</span> makes it bigger.
              </p>
            </div>
          ) : (
            <p className="text-caption text-fg-2">This summary is too long for one QR code, so share the link instead.</p>
          )}
          <p id={`${idPrefix}-link-note`} className="flex gap-1.5 border-t border-line pt-2.5 text-caption text-fg-3">
            <Lock aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            <span>
              The summary rides in the link after the #, so it never reaches our server. A production version would use encrypted SMART Health Links that
              expire.
            </span>
          </p>
        </div>
      ) : null}
      {/* wraps to two lines in a narrow sheet instead of clipping (the accessible name is unchanged, §12.9) */}
      <Button fullWidth variant="ghost" iconLeft={<Download />} onClick={onDownload} className="h-auto min-h-11 justify-start rounded-lg px-3 py-2 text-left whitespace-normal">
        Download as FHIR (FamilyMemberHistory)
      </Button>
    </>
  );
}
