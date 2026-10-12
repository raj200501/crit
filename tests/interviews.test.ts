// /research/interviews data (src/content/interviews.ts): the 21 interviews are complete, consistent with their counts and
// with the home page, and stay anonymous (no pronouns, no gendered words, no capitalized word that could be a name).
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { INTERVIEW_RESEARCH, INTERVIEW_ROLES, interviewCountsLine } from "../src/content/interviews";
import { INTERVIEWS } from "../src/content/site";

const R = INTERVIEW_RESEARCH;
const EXPECTED_IDS = [...Array.from({ length: 20 }, (_, i) => `ID${String(i + 1).padStart(3, "0")}`), "D021"];

/** Every string in the shipped data, with where it came from. */
function strings(v: unknown, at = "INTERVIEW_RESEARCH"): { at: string; text: string }[] {
  if (typeof v === "string") return [{ at, text: v }];
  if (Array.isArray(v)) return v.flatMap((x, i) => strings(x, `${at}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => strings(x, `${at}.${k}`));
  return [];
}
const TEXT = strings(R);

describe("the 21 interviews", () => {
  test("21 entries with unique IDs ID001–ID020 and D021, in order", () => {
    assert.equal(R.interviews.length, 21);
    const ids = R.interviews.map((iv) => iv.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(ids, EXPECTED_IDS);
  });

  test("role counts match `counts`, and the roles table covers every role", () => {
    assert.equal(R.counts.total, R.interviews.length);
    const tally = new Map<string, number>();
    for (const iv of R.interviews) tally.set(iv.role, (tally.get(iv.role) ?? 0) + 1);
    for (const r of INTERVIEW_ROLES) assert.equal(tally.get(r.role) ?? 0, R.counts[r.key], r.role);
    assert.deepEqual([...tally.keys()].sort(), INTERVIEW_ROLES.map((r) => r.role).sort());
    assert.equal(
      INTERVIEW_ROLES.reduce((n, r) => n + R.counts[r.key], 0),
      R.counts.total,
    );
  });

  test("the counts line is the home page's line", () => {
    assert.equal(interviewCountsLine(R.counts), INTERVIEWS.base);
  });

  test("every theme cites real interviews; the family-history theme cites exactly the flagged five", () => {
    const ids = new Set<string>(EXPECTED_IDS);
    for (const t of R.themes) for (const id of t.ids) assert.ok(ids.has(id), `${t.title}: ${id}`);
    const flagged: string[] = R.interviews.filter((iv) => iv.familyHistory).map((iv) => iv.id);
    assert.equal(flagged.length, 5); // the intro says family history came up in five
    const fh = R.themes.filter((t) => t.ids.every((id) => flagged.includes(id)));
    assert.equal(fh.length, 1);
    assert.deepEqual([...fh[0].ids].sort(), [...flagged].sort());
  });

  test("ships only display fields (no evidence line numbers or internal notes)", () => {
    assert.deepEqual(Object.keys(R).sort(), ["counts", "gaps", "interviews", "intro", "note", "period", "themes"]);
    for (const iv of R.interviews) {
      for (const k of Object.keys(iv)) assert.ok(["id", "role", "topic", "learned", "familyHistory", "quote"].includes(k), `${iv.id}.${k}`);
    }
    assert.ok(!TEXT.some((s) => /NOT FOR DISPLAY|evidence ?lines?/i.test(s.text)));
  });

  test("labels itself as paraphrased and identified by interview ID only", () => {
    assert.equal(R.note, "Paraphrased from the team's interview notes. Participants are identified by interview ID only.");
  });
});

describe("anonymity", () => {
  test("no gendered pronouns", () => {
    const bad = TEXT.filter((s) => /\b(he|she|his|her|hers|him|himself|herself)\b/i.test(s.text));
    assert.deepEqual(bad, []);
  });

  test("no gendered or family-role words that point at a person", () => {
    const re = /\b(mr|mrs|ms|miss|dr|man|woman|men|women|male|female|boy|girl|mother|father|mom|dad|uncle|aunt|brother|sister|son|daughter|husband|wife|grand(mother|father|ma|pa)|niece|nephew)\b/i;
    assert.deepEqual(
      TEXT.filter((s) => re.test(s.text)),
      [],
    );
  });

  // A capitalized word is either a sentence opener, a role or a term we have checked. Anything new (a first name, a
  // hospital, a vendor) fails here until someone reads it and adds it on purpose.
  const ALLOWED = new Set(
    (
      // sentence openers and title words
      "A Across After Among At Back Before Between Breathlessness Clinicians Diagnosis During Each Ear Episodes Everyone " +
      "Everything Family Fatigue Follow-up Frequent Gathering How In It Months Nausea Nobody Normal Pain Paraphrased " +
      "Participants Patients Recurring Repeat Results Sinus Specific Symptoms The Those Tiredness Tracking Trust " +
      "Understanding We What When Who " +
      // roles
      "Patient Internist Registered Physician Emergency Genetics ER PA " +
      // terms
      "ID September Stemma"
    ).split(" "),
  );

  test("no capitalized words outside the allowlist (interview IDs aside)", () => {
    const found = TEXT.flatMap((s) =>
      [...s.text.replace(/\b(?:ID\d{3}|D\d{3})\b/g, "").matchAll(/\b[A-Z][\p{L}’'-]*/gu)].map((m) => ({ at: s.at, word: m[0] })),
    );
    assert.ok(found.length > 20);
    assert.deepEqual(
      found.filter((f) => !ALLOWED.has(f.word)),
      [],
    );
  });

  test("interview IDs only ever appear in the IDs' own shape", () => {
    for (const s of TEXT) for (const m of s.text.matchAll(/\b[A-Z]{1,2}\d{2,}\b/g)) assert.ok(EXPECTED_IDS.includes(m[0]), `${s.at}: ${m[0]}`);
  });
});
