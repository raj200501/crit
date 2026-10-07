"use client";

import { ArrowRight, ArrowUpRight, MousePointerClick } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import TreeView from "@/components/TreeView";
import { Button } from "@/components/ui/Button";
import { ProductFrame } from "@/components/ui/ProductFrame";
import { StatusLegend } from "@/components/ui/StatusLegend";
import type { PersonView } from "@/lib/status";
import { FadeSwap } from "./FadeSwap";
import { LandingReceipt } from "./LandingReceipt";
import type { PersonReceipt } from "./receipts";

type Tab = "tree" | "summary" | "practice";
// AMENDMENTS A1: the care-team copy is "Practice view" here and links to /practice, never /summary?view=care-team.
const TABS = [
  { id: "tree", label: "Tree" },
  { id: "summary", label: "My summary" },
  { id: "practice", label: "Practice view" },
] as const;

export interface ProductTourProps {
  /** viewTree(demoTree()), computed on the server. The embed never reads or writes the visitor's stored tree. */
  views: PersonView[];
  receipts: Record<string, PersonReceipt>;
  /** Server-rendered <SummaryDocument audience="patient"> and "clinician" (so the document code never ships here). */
  patientDoc: ReactNode;
  clinicianDoc: ReactNode;
}

function DocPane({ caption, action, children }: { caption: string; action: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-full bg-mist px-3 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto flex max-w-[816px] flex-wrap items-center justify-between gap-x-4 gap-y-1 pb-4">
        <p className="font-mono text-eyebrow text-fg-3 uppercase">{caption}</p>
        {action}
      </div>
      <div className="mx-auto max-w-[816px]">{children}</div>
    </div>
  );
}

/** §8.4 "This is the real app. Go ahead, click Dad." The working tree, the patient's page and the practice's page in one frame. */
export function ProductTour({ views, receipts, patientDoc, clinicianDoc }: ProductTourProps) {
  const [tab, setTab] = useState<Tab>("tree");
  const [switched, setSwitched] = useState(false);
  const [selected, setSelected] = useState<string | undefined>();
  const receiptRef = useRef<HTMLDivElement>(null);
  const person = selected ? receipts[selected] : undefined;

  const select = (id: string) => {
    setSelected(id);
    // On narrow frames the receipt sits under the tree: bring it into the pane's view.
    requestAnimationFrame(() => {
      const el = receiptRef.current;
      if (!el || window.matchMedia("(min-width: 1024px)").matches) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  };

  return (
    <div>
      <ProductFrame
        title="stemma · demo"
        tabs={TABS}
        value={tab}
        onChange={(v) => {
          setSwitched(true);
          setTab(v as Tab);
        }}
        aspect="16/9"
        mobileAspect="3/4"
        actions={
          <Button href="/tree" variant="link" size="sm" iconRight={<ArrowUpRight />} className="max-md:hidden">
            Open the full demo
          </Button>
        }
      >
        {/* the scroller fills the frame's fixed-aspect pane, so each view can stretch to its full height */}
        <FadeSwap id={tab} animate={switched} className="absolute inset-0 overflow-auto overscroll-contain">
          <>
            {tab === "tree" ? (
              <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="bg-dots relative flex min-w-0 flex-col bg-canvas px-3 pt-4 pb-6 [--dots-size:20px] sm:px-6 sm:pt-6">
                  <p className="mb-3 inline-flex items-center gap-2 self-start rounded-full border border-line bg-surface/90 px-3 py-1 text-caption text-fg-2 shadow-xs">
                    <MousePointerClick aria-hidden className="size-3.5 text-brand" />
                    Select anyone to see who said what
                  </p>
                  <div className="my-auto py-2">
                    <TreeView mode="embed" views={views} selectedId={selected} onSelect={select} />
                  </div>
                </div>
                <div ref={receiptRef} aria-live="polite" className="scroll-mt-4 border-t border-line bg-surface p-5 sm:p-6 lg:border-t-0 lg:border-l">
                  {person ? (
                    <FadeSwap id={person.id} animate>
                      <LandingReceipt person={person} />
                    </FadeSwap>
                  ) : (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <p className="font-mono text-eyebrow text-fg-3 uppercase">Receipts</p>
                        <p className="text-title font-strong text-fg">Every answer keeps who said it.</p>
                        <p className="text-small text-fg-2">Pick a relative in the tree. Dad is a good start: two people remember it differently.</p>
                      </div>
                      <Button variant="secondary" onClick={() => select("dad")} iconRight={<ArrowRight />} className="self-start">
                        Show Dad&rsquo;s answers
                      </Button>
                      <StatusLegend compact className="border-t border-line pt-4" />
                    </div>
                  )}
                </div>
              </div>
            ) : tab === "summary" ? (
              <DocPane caption="My summary · what Alex reviews" action={<OpenLink href="/summary">Open my summary</OpenLink>}>
                {patientDoc}
              </DocPane>
            ) : (
              <DocPane caption="Practice view · what the cardiologist gets" action={<OpenLink href="/practice">Open the practice view</OpenLink>}>
                {clinicianDoc}
              </DocPane>
            )}
          </>
        </FadeSwap>
      </ProductFrame>
      <Button href="/tree" variant="link" iconRight={<ArrowUpRight />} className="mt-3 md:hidden">
        Open the full demo
      </Button>
    </div>
  );
}

function OpenLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button href={href} variant="link" size="sm" iconRight={<ArrowUpRight />} className="max-md:h-11">
      {children}
    </Button>
  );
}
