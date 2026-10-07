"use client";

import { ClipboardList, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/Toast";
import type { FamilyTree } from "@/lib/types";
import { CHART_COLUMNS, chartText } from "./chartText";
import { copyText, downloadFhir } from "./files";

export const CLINICIAN_REVIEW_LABEL = "Mark reviewed by clinician (demo, this browser only)";
export const LINK_EXPIRY = "Prototype links don’t expire. Pilot links will expire and can be revoked.";

export interface CareTeamActionsProps {
  /** The care-team copy (already shareableTree'd: from the link, or the practice demo). */
  tree: FamilyTree;
  reviewedAt: string | null;
  onReviewed: (reviewed: boolean) => void;
  /** row: the /view context band. stack: the /practice rail. */
  layout?: "row" | "stack";
  className?: string;
}

/** The care-team actions (DESIGN §12.8b): Print · Copy as chart text · Download FHIR, and the demo clinician review switch. */
export function CareTeamActions({ tree, reviewedAt, onReviewed, layout = "row", className }: CareTeamActionsProps) {
  const copyChart = async () => {
    const text = chartText(tree);
    const ok = await copyText(text);
    toast(
      ok
        ? { title: "Chart text copied", body: `${CHART_COLUMNS.join(" | ")}, one line per row. Paste it into the note.`, tone: "brand" }
        : { title: "Couldn’t copy", body: "Your browser blocked the clipboard. Print or download the FHIR file instead." },
    );
  };
  const stack = layout === "stack";
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className={cn("flex gap-2", stack ? "flex-col" : "flex-wrap items-center")}>
        <Button size={stack ? "md" : "sm"} fullWidth={stack} iconLeft={<Printer />} onClick={() => window.print()} className={cn(!stack && "max-md:h-11")}>
          Print
        </Button>
        <Button
          size={stack ? "md" : "sm"}
          fullWidth={stack}
          variant="secondary"
          iconLeft={<ClipboardList />}
          onClick={copyChart}
          className={cn(!stack && "max-md:h-11")}
        >
          Copy as chart text
        </Button>
        <Button
          size={stack ? "md" : "sm"}
          fullWidth={stack}
          variant={stack ? "ghost" : "secondary"}
          iconLeft={<Download />}
          onClick={() => downloadFhir(tree)}
          className={cn(!stack && "max-md:h-11", stack && "justify-start px-3")}
        >
          Download FHIR
        </Button>
      </div>
      <Switch checked={!!reviewedAt} onChange={onReviewed} label={CLINICIAN_REVIEW_LABEL} className="text-small" />
    </div>
  );
}
