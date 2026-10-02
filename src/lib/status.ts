import type { FamilyTree, Person, Report, Status } from "./types";

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
  /** Any report mentions a heart condition. */
  cardiac: boolean;
  /** The condition reports that drove the status. */
  conditions: Report[];
}

const SYNONYMS: Record<string, string> = {
  afib: "atrial fibrillation",
  "a-fib": "atrial fibrillation",
  "a fib": "atrial fibrillation",
  "irregular heartbeat": "arrhythmia",
  "heart attack": "heart attack",
  mi: "heart attack",
  "myocardial infarction": "heart attack",
  "high cholesterol": "high cholesterol",
  hcm: "hypertrophic cardiomyopathy",
};

export function normalizeCondition(name: string | undefined): string {
  const n = (name ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  return SYNONYMS[n] ?? n;
}

const CARDIAC_TERMS = [
  "heart",
  "cardi",
  "arrhythm",
  "fibrillation",
  "afib",
  "angina",
  "coronary",
  "bypass",
  "stent",
  "qt",
  "brugada",
  "sudden death",
  "died suddenly",
  "faint",
  "syncope",
  "cholesterol",
  "aneurysm",
  "pacemaker",
  "defibrillator",
  "valve",
  "stroke",
];

export function isCardiac(condition: string | undefined): boolean {
  const c = (condition ?? "").toLowerCase();
  return CARDIAC_TERMS.some((t) => c.includes(t));
}

function byTime(a: Report, b: Report) {
  return a.reportedAt.localeCompare(b.reportedAt);
}

export function formatCondition(r: Report): string {
  const name = r.condition ?? "Condition";
  if (r.ageAtOnset == null) return name;
  return `${name}, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}`;
}

function capitalize(s: string) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Derive what the tree should say about one person from everything reported about them. */
export function viewPerson(tree: FamilyTree, person: Person): PersonView {
  const reports = tree.reports.filter((r) => r.personId === person.id).sort(byTime);
  const base = { person, reports, verified: false, cardiac: false, conditions: [] as Report[] };

  if (person.relation === "self") {
    return { ...base, status: "known", headline: tree.visit ? `${tree.visit.specialty} visit` : "You" };
  }

  // Only the person themself can decline; respect their latest word.
  const own = reports.filter((r) => r.source === "self" || r.source === "record");
  const latestOwn = own[own.length - 1];
  if (latestOwn?.kind === "declined") {
    return { ...base, status: "declined", headline: "Declined to share" };
  }

  const conditions = reports.filter((r) => r.kind === "condition");
  const noHistory = reports.filter((r) => r.kind === "no-history");
  const cardiac = conditions.some((r) => isCardiac(r.condition));
  const records = conditions.filter((r) => r.source === "record");

  if (conditions.length === 0 && noHistory.length === 0) {
    const askedAround = reports.some((r) => r.kind === "dont-know");
    return { ...base, status: "unknown", headline: askedAround ? "No one knows yet" : "Not asked yet" };
  }

  // A portal record is the strongest source; show it as known and keep the rest as context.
  if (records.length > 0) {
    const r = records[records.length - 1];
    return {
      ...base,
      status: "known",
      verified: true,
      cardiac,
      conditions: records,
      headline: formatCondition(r),
      reason: `From ${r.record?.system ?? "a patient portal"}`,
    };
  }

  // Firsthand answers outrank secondhand ones.
  const firsthand = reports.filter((r) => r.source === "self" && (r.kind === "condition" || r.kind === "no-history"));
  const pool = firsthand.length > 0 ? firsthand : [...conditions, ...noHistory];
  const poolConditions = pool.filter((r) => r.kind === "condition");
  const poolNoHistory = pool.filter((r) => r.kind === "no-history");

  const reporters = new Set(pool.map((r) => r.reportedBy));
  const names = new Set(poolConditions.map((r) => normalizeCondition(r.condition)));
  const ages = poolConditions.map((r) => r.ageAtOnset).filter((a): a is number => a != null);
  const ageSpread = ages.length > 1 ? Math.max(...ages) - Math.min(...ages) : 0;

  // Disagreement = different reporters say different things (not one reporter listing two conditions).
  const perReporter = new Map<string, Set<string>>();
  for (const r of pool) {
    const key = r.kind === "no-history" ? "__none__" : normalizeCondition(r.condition);
    if (!perReporter.has(r.reportedBy)) perReporter.set(r.reportedBy, new Set());
    perReporter.get(r.reportedBy)!.add(key);
  }
  const reporterSets = [...perReporter.values()].map((s) => [...s].sort().join("|"));
  const reportersDisagree = reporters.size > 1 && new Set(reporterSets).size > 1;
  const conflicting = (poolConditions.length > 0 && poolNoHistory.length > 0) || reportersDisagree || (names.size === 1 && ageSpread > 2);

  if (conflicting) {
    const first = poolConditions[0];
    const headline = first ? `${capitalize(formatCondition(first).replace(/, (about )?age /, " at "))}?` : "Reports disagree";
    return {
      ...base,
      status: "conflicting",
      cardiac,
      conditions: poolConditions,
      headline,
      reason: `${pool.length} reports disagree`,
    };
  }

  if (poolConditions.length > 0) {
    const latest = poolConditions[poolConditions.length - 1];
    return {
      ...base,
      status: "known",
      cardiac,
      conditions: poolConditions,
      headline: formatCondition(latest),
      reason: reporters.size > 1 ? `${reporters.size} relatives agree` : `Reported by ${latest.reportedBy}`,
    };
  }

  return {
    ...base,
    status: "known",
    headline: "No heart history",
    reason: `Reported by ${poolNoHistory[poolNoHistory.length - 1].reportedBy}`,
  };
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
