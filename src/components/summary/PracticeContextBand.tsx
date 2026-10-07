"use client";

import { Check, Eye, Info, Send } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/components/ui/cn";
import { HONESTY } from "@/content/site";
import type { FamilyTree } from "@/lib/types";
import { CareTeamActions, LINK_EXPIRY } from "./CareTeamActions";
import { fmtStamp } from "./model";

export interface PracticeContextBandProps {
  tree: FamilyTree;
  reviewedAt: string | null;
  onReviewed: (reviewed: boolean) => void;
  className?: string;
}

/**
 * /view's practice context (DESIGN §12.8b): who shared it and when, whether the patient reviewed it, read-only, synthetic;
 * then Print · Copy as chart text · Download FHIR and the demo clinician review.
 */
export function PracticeContextBand({ tree, reviewedAt, onReviewed, className }: PracticeContextBandProps) {
  const shared = fmtStamp(tree.updatedAt);
  return (
    <section aria-label="Practice context" className={cn("border-b border-line bg-mist print:hidden", className)}>
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:px-8">
        <div className="min-w-0">
          <p className="font-mono text-eyebrow font-medium text-ink-3 uppercase">Care-team view · shared by the patient</p>
          <ul aria-label="About this summary" className="mt-2.5 flex flex-wrap gap-2">
            <li>
              <Badge icon={<Send />} className="bg-surface">
                Shared by {tree.patientName}
                {shared ? (
                  <>
                    {" · "}
                    <time dateTime={tree.updatedAt} suppressHydrationWarning>
                      {shared}
                    </time>
                  </>
                ) : null}
              </Badge>
            </li>
            <li>
              {tree.reviewedAt ? (
                <Badge tone="brand" icon={<Check />}>
                  Reviewed by patient
                </Badge>
              ) : (
                <Badge className="bg-surface">Not reviewed</Badge>
              )}
            </li>
            <li>
              <Badge icon={<Eye />} className="bg-surface">Read-only</Badge>
            </li>
            <li>
              <Badge className="bg-surface">{HONESTY.docChip}</Badge>
            </li>
          </ul>
          <p className="mt-3 flex items-start gap-1.5 text-caption text-ink-3">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {LINK_EXPIRY}
          </p>
        </div>
        <CareTeamActions tree={tree} reviewedAt={reviewedAt} onReviewed={onReviewed} className="lg:items-end" />
      </div>
    </section>
  );
}
