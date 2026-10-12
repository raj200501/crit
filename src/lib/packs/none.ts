// How a "None of these" answer reads. A "none" covers only the questions it was asked, so its words come from the
// report's own question set, never from the tree's: Mom's "No heart history" stays that after a switch to primary care.
import type { Report } from "../types";
import { askedAbout, GENERAL_CHOICES } from "./choices";

interface NoneWords {
  /** The stored fact, as a label ("No heart history"). 16 characters, so the tree node's third line shows it whole. */
  label: string;
  /** In a sentence ("Mom says no heart history"). */
  phrase: string;
  /** Under a pedigree symbol. */
  abbr: string;
  /** The FHIR note ("Mom reported … on 2026-09-27."). */
  fhir: string;
}

const NONE: { cardiology: NoneWords; general: NoneWords } = {
  cardiology: { label: "No heart history", phrase: "no heart history", abbr: "no heart hx", fhir: "no heart history" },
  general: {
    label: "None on the list",
    phrase: "none of the conditions on the list",
    abbr: "none listed",
    fhir: `none of the conditions asked about (${askedAbout(GENERAL_CHOICES)})`,
  },
};

/** Total on purpose: drafts restored from sessionStorage skip cleanReport, so a forged `pack` must neither throw nor
 *  print "undefined". Anything but "general" is cardiology, the question set of every report made before visit types. */
export const noneOf = (r: Pick<Report, "pack">): NoneWords => NONE[r.pack === "general" ? "general" : "cardiology"];
export const noneLabel = (r: Pick<Report, "pack">) => noneOf(r).label;
export const nonePhrase = (r: Pick<Report, "pack">) => noneOf(r).phrase;
export const noneAbbr = (r: Pick<Report, "pack">) => noneOf(r).abbr;
export const noneFhir = (r: Pick<Report, "pack">) => noneOf(r).fhir;
