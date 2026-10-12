import { capitalize, formatCondition, isCardiac, normalizeCondition } from "./conditions";
import { noneLabel, nonePhrase, packFor } from "./packs";
import type { FamilyTree, Person, Report, Status } from "./types";

export { formatCondition, isCardiac, normalizeCondition } from "./conditions";

export interface PersonView {
  person: Person;
  status: Status;
  /** Short line shown on the tree node. */
  headline: string;
  /** Why the status is what it is ("2 reports disagree"). */
  reason?: string;
  reports: Report[];
  /** At least one condition came from a portal record. */
  verified: boolean;
  /** Any report mentions a heart condition (isCardiac, whatever the visit). The landing and hero demo read it. */
  cardiac: boolean;
  /** Any report is a finding for this tree's question set (fills the pedigree symbol). For cardiology it equals `cardiac`. */
  finding: boolean;
  /** Every condition report that should reach the summary and red flags (all of them, except
   *  secondhand reports about someone who declined). */
  conditions: Report[];
}

function byTime(a: Report, b: Report) {
  return a.reportedAt.localeCompare(b.reportedAt);
}

const FIRSTHAND = new Set(["self", "record"]);

/** Derive what the tree should say about one person from everything reported about them. */
export function viewPerson(tree: FamilyTree, person: Person): PersonView {
  const pack = packFor(tree);
  const reports = tree.reports.filter((r) => r.personId === person.id).sort(byTime);
  const base = { person, reports, verified: false, cardiac: false, finding: false, conditions: [] as Report[] };

  if (person.relation === "self") {
    return { ...base, status: "known", headline: tree.visit ? `${tree.visit.specialty} visit` : "You" };
  }

  // Only the person themself can decline; respect their latest word. What the patient already
  // knows stays on their summary, but other relatives' reports about this person do not.
  const own = reports.filter((r) => FIRSTHAND.has(r.source));
  const latestOwn = own[own.length - 1];
  if (latestOwn?.kind === "declined") {
    const mine = reports.filter((r) => r.kind === "condition" && r.source === "patient");
    return {
      ...base,
      status: "declined",
      headline: "Declined to share",
      conditions: mine,
      cardiac: mine.some((r) => isCardiac(r.condition)),
      finding: mine.some((r) => pack.isFinding(r.condition)),
      reason: mine.length ? "Declined; you added what you know" : undefined,
    };
  }

  const conditions = reports.filter((r) => r.kind === "condition");
  const noHistory = reports.filter((r) => r.kind === "no-history");
  const cardiac = conditions.some((r) => isCardiac(r.condition));
  const finding = conditions.some((r) => pack.isFinding(r.condition));
  const records = conditions.filter((r) => r.source === "record");
  const withAll = { ...base, cardiac, finding, conditions, verified: records.length > 0 };

  if (conditions.length === 0 && noHistory.length === 0) {
    const askedAround = reports.some((r) => r.kind === "dont-know");
    return { ...base, status: "unknown", headline: askedAround ? "No one knows yet" : "Not asked yet" };
  }

  // --- Does anything disagree? ---------------------------------------------------------
  const reasons: string[] = [];
  const firsthandAnswers = reports.filter((r) => FIRSTHAND.has(r.source) && (r.kind === "condition" || r.kind === "no-history"));
  const latestFirst = firsthandAnswers[firsthandAnswers.length - 1];

  // A "none" vs a reported condition. A firsthand "none" contradicts anyone's condition;
  // a secondhand "none" only contradicts other secondhand reports (a record or the person outranks it).
  if (latestFirst?.kind === "no-history" && conditions.length) reasons.push(`${latestFirst.reportedBy} says ${nonePhrase(latestFirst)}`);
  if (!latestFirst) {
    const noneBy = new Set(noHistory.map((r) => r.reportedBy));
    if (conditions.some((r) => !noneBy.has(r.reportedBy)) && noHistory.length) reasons.push("no history vs. a reported condition");
  }

  // Two reporters whose condition lists share nothing (Mom: heart attack, Uncle: angina). A portal
  // record shows only the facts someone chose to share, so it never counts as a contradiction.
  const sets = new Map<string, Set<string>>();
  for (const r of conditions.filter((x) => x.source !== "record")) {
    if (!sets.has(r.reportedBy)) sets.set(r.reportedBy, new Set());
    sets.get(r.reportedBy)!.add(normalizeCondition(r.condition));
  }
  const lists = [...sets.values()];
  const disjoint = lists.some((a, i) => lists.slice(i + 1).some((b) => ![...a].some((x) => b.has(x))));
  if (disjoint) reasons.push("different conditions reported");

  // Same condition, ages more than 2 years apart.
  const byName = new Map<string, number[]>();
  for (const r of conditions) {
    if (r.ageAtOnset == null) continue;
    const k = normalizeCondition(r.condition);
    byName.set(k, [...(byName.get(k) ?? []), r.ageAtOnset]);
  }
  if ([...byName.values()].some((a) => a.length > 1 && Math.max(...a) - Math.min(...a) > 2)) reasons.push("ages differ");

  const reporters = new Set([...conditions, ...noHistory].map((r) => r.reportedBy));

  if (reasons.length) {
    const lead = conditions.find((r) => FIRSTHAND.has(r.source)) ?? conditions[0];
    const headline = lead ? `${capitalize(formatCondition(lead).replace(/, (about )?age /, " at "))}?` : "Reports disagree";
    return { ...withAll, status: "conflicting", headline, reason: `${reporters.size} reports disagree` };
  }

  // --- Agreement: pick the strongest source for the headline. -----------------------------
  if (records.length) {
    const r = records[records.length - 1];
    return { ...withAll, status: "known", headline: formatCondition(r), reason: `From ${r.record?.system ?? "a patient portal"}` };
  }
  if (conditions.length) {
    const lead = [...conditions].reverse().find((r) => r.source === "self") ?? conditions[conditions.length - 1];
    return {
      ...withAll,
      status: "known",
      headline: formatCondition(lead),
      reason: reporters.size > 1 ? `${reporters.size} relatives agree` : `Reported by ${lead.reportedBy}`,
    };
  }
  const lastNone = noHistory[noHistory.length - 1];
  return { ...withAll, status: "known", headline: noneLabel(lastNone), reason: `Reported by ${lastNone.reportedBy}` };
}

export function viewTree(tree: FamilyTree): PersonView[] {
  return tree.people.map((p) => viewPerson(tree, p));
}

export function counts(views: PersonView[]) {
  const relatives = views.filter((v) => v.person.relation !== "self");
  return {
    relatives: relatives.length,
    known: relatives.filter((v) => v.status === "known").length,
    conflicting: relatives.filter((v) => v.status === "conflicting").length,
    unknown: relatives.filter((v) => v.status === "unknown").length,
    declined: relatives.filter((v) => v.status === "declined").length,
  };
}
