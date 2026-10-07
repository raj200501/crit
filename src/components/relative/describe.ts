// Presentation helpers for the relative's flow (/invite) and the patient's import screen (/reply). No logic lives here.
import type { Report } from "@/lib/types";

/** A report before it has an id: what the invite flow drafts and what a reply link carries. */
export type Draft = Omit<Report, "id">;

/** One plain line for an answer, e.g. "Atrial fibrillation, age 34" or "Doesn’t know". */
export function describeAnswer(d: Draft): string {
  if (d.kind === "declined") return "Chose not to share";
  if (d.kind === "dont-know") return "Doesn’t know";
  if (d.kind === "no-history") return "No heart history";
  return `${d.condition}${d.ageAtOnset != null ? `, ${d.approximate ? "about " : ""}age ${d.ageAtOnset}` : ""}`;
}

/** "a cardiology visit" / "an …" (the invite carries the visit as "cardiology visit"). */
export function withArticle(phrase: string): string {
  return `${/^[aeiou]/i.test(phrase) ? "an" : "a"} ${phrase}`;
}

/** "Alex’s cardiology team" from the invite's visit phrase; "Alex’s care team" when there is none. */
export function teamOf(asker: string, visit?: string): string {
  const specialty = visit?.replace(/\s*visit$/i, "").trim();
  return `${asker}’s ${specialty ? `${specialty} team` : "care team"}`;
}

/** The year a portal record dates a fact from (record date or onset). */
export function recordYear(d: Draft): string | undefined {
  return (d.record?.recordedDate ?? "").slice(0, 4) || undefined;
}
