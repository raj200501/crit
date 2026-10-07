// TEMPORARY (DESIGN §13 merge order): stands in for P2's <HeroStage model={…}>{children}</HeroStage> until P2 merges.
// The integrator swaps it in src/app/(site)/page.tsx and deletes this file and NightPoster.tsx (FinalCta then uses
// P2's HeroPoster theme="night").
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { HONESTY } from "@/content/site";
import { NightPoster } from "./NightPoster";
import type { PersonReceipt } from "./receipts";

function tally(receipts: Record<string, PersonReceipt>) {
  const rel = Object.values(receipts).filter((r) => r.status !== "self");
  const n = (s: PersonReceipt["status"]) => rel.filter((r) => r.status === s).length;
  return [
    [n("known"), "known"],
    [n("conflicting"), "reports disagree"],
    [n("unknown"), "unknown"],
    [n("declined"), "chose not to share"],
    [n("pending"), "not asked yet"],
  ].filter(([k]) => Number(k) > 0) as [number, string][];
}

/** The hero band: paper + aurora + grain, the copy on the left and a framed Night Window on the right (stacked on phones). */
export function HeroPlaceholder({ receipts, children }: { receipts: Record<string, PersonReceipt>; children: ReactNode }) {
  return (
    <section aria-labelledby="hero-title" data-theme="paper" data-nav-theme="paper" className="aurora grain relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1240px] items-center gap-12 px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:min-h-[min(100svh,960px)] lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-28 lg:pb-20">
        <div className="lg:col-span-6 lg:pr-4">{children}</div>
        <figure className="relative lg:col-span-6" aria-label="Alex's family, a synthetic demo">
          {/* mint light spilling from the window's top-left */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-[radial-gradient(closest-side,rgb(127_230_197/0.55),transparent)] blur-2xl"
          />
          <Card tier="window" bezel bezelClassName="relative shadow-lg" className="relative">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
              <p className="font-mono text-eyebrow text-fg-3 uppercase">Alex&rsquo;s family · synthetic demo</p>
              <span aria-hidden className="flex gap-1.5">
                <span className="size-1.5 rounded-full bg-lumen/70" />
                <span className="size-1.5 rounded-full bg-fg/20" />
                <span className="size-1.5 rounded-full bg-fg/20" />
              </span>
            </div>
            <NightPoster receipts={receipts} className="mx-auto max-w-[36rem] px-2 pb-10 sm:px-6" />
            <figcaption className="flex flex-col gap-3 border-t border-line px-4 py-4 sm:px-5">
              <p className="text-small text-fg-2">
                {tally(receipts).map(([k, word], i) => (
                  <Fragment key={word}>
                    {i ? <span className="px-1.5 text-fg-3">·</span> : null}{" "}
                    <span className="whitespace-nowrap">
                      <span className="font-strong text-fg tabular-nums">{k}</span> {word}
                    </span>{" "}
                  </Fragment>
                ))}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="brand">{HONESTY.windowBadge}</Badge>
                <Link
                  href="/tree"
                  className="group/open -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-full text-small font-medium text-brand transition-colors hover:text-brand-strong"
                >
                  Open in the demo
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-(--dur-hover) group-hover/open:translate-x-0.5 motion-reduce:transition-none"
                  />
                </Link>
              </div>
            </figcaption>
          </Card>
        </figure>
      </div>
    </section>
  );
}
