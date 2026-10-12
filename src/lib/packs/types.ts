// A specialty pack is everything that changes with the kind of visit: the questions, the clinician's review list and
// the words that name what the questions cover. The tree, sources, links and status words never change with it.
import type { FamilyTree } from "../types";
import type { PersonView } from "../status";

export type PackId = "cardiology" | "general";
export type VisitType = "cardiology" | "primary-care" | "other";

export interface Choice {
  id: string;
  label: string;
  examples: string;
  /** Condition name stored in the report. */
  condition: string;
  /** Ask "What kind?" when ticked; stored as `${condition}: ${text}` (blank text stores `condition`). */
  detail?: { label: string; placeholder: string };
  /** Where this card comes from. Docs and tests only, never rendered. */
  source?: string;
}

/** guideline = a family-history criterion named in a guideline (cardiology only); noted = reported, no verified
 *  criterion; clarify = gaps and disagreements worth asking about. */
export type Tier = "guideline" | "noted" | "clarify";

export interface Flag {
  personId: string;
  tier: Tier;
  title: string;
  detail: string;
  /** Guideline (with year) the rule comes from; shown on the clinician document. */
  basis?: string;
}

/** Every user-visible string that differs between packs, keyed by where it renders. */
export interface PackWords {
  /** Summary eyebrow. */
  docEyebrow: string;
  /** Relative's welcome: "…is asking about {topic}." */
  topic: string;
  /** Person panel, the patient's own section. */
  ownHeading: string;
  ownEmpty: string;
  /** Person panel gap link ("Still unknown: …"). */
  gap: string;
  /** Legend label for a filled symbol (summary, embeds). */
  findingLegend: string;
  /** Legend filter chip on /tree. */
  findingFilter: string;
  /** Last sentence of the pedigree's accessible name. */
  pedigreeNote: string;
  /** Relative's record picker. */
  suggested: string;
  suggestedEmpty: string;
  /** Sent screen: "…shares a summary with {clinician}…". */
  clinician: string;
  /** Edit details: the hint under Sex. */
  sexHint: string;
  /** /summary rail, step "What your care team gets". */
  careTeam: string;
}

/** The care-team band, the clinician footer and "Copy as chart text". */
export interface CareTeamCopy {
  /** "(n)" after "For clinician review". */
  showCount: boolean;
  reviewNote: string;
  /** Empty state of the review band. */
  noneMatched: string;
  notedHeading: string;
  /** Cap the noted list, then "And n more relatives in the table below." */
  notedLimit?: number;
  /** Appended to the clinician footer (leading space kept). */
  footer: string;
  /** Last line of "Copy as chart text". */
  chartLine: string;
}

export interface SpecialtyPack {
  id: PackId;
  choices: readonly Choice[];
  groups: readonly { title: string; ids: readonly string[] }[];
  /** The free-text card. */
  other: { title: string; description: string; placeholder: string };
  notePlaceholder: string;
  words: PackWords;
  careTeam: CareTeamCopy;
  /** Fills the pedigree glyph (NSGC "affected"), counts for the legend filter, orders the summary. */
  isFinding(condition: string | undefined): boolean;
  /** Puts a portal problem-list entry under "Suggested" in the relative's record picker. */
  isSuggested(condition: string | undefined): boolean;
  /** The care-team review list. A pack with `criteria: false` never returns tier "guideline" or a `basis`. */
  reviewItems(tree: FamilyTree, views: PersonView[]): Flag[];
  /** Guideline criteria are applied (cardiology only). */
  criteria: boolean;
}
