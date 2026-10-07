import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { PILOT } from "@/content/site";

interface Plan {
  id: string;
  name: string;
  /** The big figure. */
  figure: string;
  figureNote?: string;
  price: ReactNode;
  get: ReactNode;
  never: ReactNode;
  featured?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "patients",
    name: "Patients and relatives",
    figure: "Free",
    price: (
      <>
        <strong className="font-strong text-fg">Free.</strong> No ads. No data sales.
      </>
    ),
    get: "Tree, invites, one-page summary, print, QR and FHIR",
    never: (
      <>
        <span aria-hidden>—</span>
        <span className="sr-only">Not applicable</span>
      </>
    ),
  },
  {
    id: "pilot",
    name: "Pilot practice",
    figure: "$500–1,000",
    figureNote: "flat",
    price: (
      <>
        <strong className="font-strong text-fg">$500–1,000 flat</strong> for 8–12 weeks, credited toward an annual contract
      </>
    ),
    get: "An intake link with your new-patient paperwork, care-team summaries, and metrics agreed up front",
    never: <strong className="font-strong text-fg">Never priced per referral, new patient or booking</strong>,
    featured: true,
  },
  {
    id: "after",
    name: "After the pilot",
    figure: "$99–149",
    figureNote: "per cardiologist per month · hypothesis",
    price: (
      <>
        Flat annual subscription per cardiologist. Hypothesis: <strong className="font-strong text-fg">$99–149 per cardiologist per month</strong>, which
        the pilot tests
      </>
    ),
    get: "The same, plus expiring share links and a “reviewed by clinician” lock",
    never: "Same",
  },
];

const ROWS = [
  { key: "price", label: "Price" },
  { key: "get", label: "You get" },
  { key: "never", label: "Never" },
] as const;

/**
 * DESIGN §10.3: three offers side by side (rows aligned with subgrid) from 1024 px and in print, stacked on phones.
 * Each column is a card with a <dt> label per cell; the pilot column wears the PROPOSED PILOT stamp.
 */
export function PricingTable({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_auto] lg:gap-x-4 lg:gap-y-0 print:grid-cols-3 print:gap-2", className)}>
      {PLANS.map((p) => (
        <div
          key={p.id}
          role="group"
          aria-labelledby={`plan-${p.id}`}
          className={cn(
            "relative flex min-w-0 flex-col rounded-xl border p-6 sm:p-7 lg:row-span-4 lg:grid lg:grid-rows-subgrid print:row-span-4 print:grid print:grid-rows-subgrid print:rounded-md print:px-2.5 print:py-2",
            p.featured ? "border-brand/40 bg-surface shadow-lg ring-1 ring-brand/15 print:shadow-none" : "border-line bg-surface/70 shadow-xs",
          )}
        >
          <header className="flex flex-col gap-3 pb-5 print:gap-0.5 print:pb-1">
            <div className="flex min-h-7 flex-wrap items-center gap-2">
              <h3 id={`plan-${p.id}`} className="text-ui font-strong text-fg print:text-[12px]">
                {p.name}
              </h3>
              {p.featured ? (
                <Badge tone="brand" className="print:hidden">
                  Now recruiting
                </Badge>
              ) : null}
            </div>
            {p.featured ? (
              <span className="absolute -top-3.5 right-5 -rotate-4 rounded-xs border-[3px] border-double border-brand bg-surface px-2.5 py-1 font-mono text-eyebrow font-medium text-brand-strong uppercase shadow-sm print:static print:w-fit print:rotate-0 print:shadow-none">
                {PILOT.stamp}
              </span>
            ) : null}
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-display text-[2.75rem] leading-none font-book tracking-[-0.03em] text-fg tabular-nums lining-nums print:text-[17px]">
                {p.figure}
              </span>
              {p.figureNote ? <span className="text-small text-fg-3 print:text-[10px]">{p.figureNote}</span> : null}
            </p>
          </header>
          {ROWS.map((r) => (
            <dl key={r.key} className="border-t border-line py-4 print:py-1">
              <dt className="font-mono text-eyebrow text-fg-3 uppercase print:text-[9px]">{r.label}</dt>
              <dd className="mt-1.5 text-small text-fg-2 print:mt-0 print:text-[10.5px] print:leading-snug">{p[r.key]}</dd>
            </dl>
          ))}
        </div>
      ))}
    </div>
  );
}
