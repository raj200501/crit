// "Copy as chart text" (DESIGN §12.8b): plain text a medical assistant can paste into the chart, one line per row,
// in the order Epic's family-history table uses. Built read-only from viewTree; nothing here changes the tree.
import { CRITERIA_FOOTNOTE } from "@/lib/clinical";
import { viewTree } from "@/lib/status";
import type { FamilyTree } from "@/lib/types";
import { familyRows, fmtDay } from "./model";

export const CHART_COLUMNS = ["Relation", "Problem", "Age at onset", "Source", "Comments"] as const;

const cell = (s: string) => s.replace(/\s*\|\s*/g, " / ").replace(/\s+/g, " ").trim();

export function chartText(tree: FamilyTree): string {
  const rows = familyRows(tree, viewTree(tree));
  const visit = tree.visit
    ? [tree.visit.specialty, fmtDay(tree.visit.date), tree.visit.practice].filter(Boolean).join(", ")
    : "Upcoming visit";
  const lines = [
    `Family history (patient-reported) · ${tree.patientName} · ${visit}${tree.synthetic ? " · Synthetic demo data" : ""}`,
    CHART_COLUMNS.join(" | "),
    ...rows.map((r) =>
      [`${r.relation} (${r.name}${r.view.person.deceased ? ", deceased" : ""})`, r.problem, r.age, r.source, r.comments || "—"].map(cell).join(" | "),
    ),
    "",
    `Patient-reported family history for clinician review. Not a diagnosis or a risk score. Criteria versions: ${CRITERIA_FOOTNOTE}.`,
  ];
  return lines.join("\n");
}
