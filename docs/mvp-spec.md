# Family Health Tree: MVP build spec

Build spec for the working prototype, hosted free on Vercel. As of 2 October 2026. The reasoning and sources behind each decision are in [`research.md`](./research.md); section numbers below refer to it.

**One-sentence scope:** a patient builds a three-generation family heart-history tree with guided questions, relatives fill in their own branch through a link, every fact keeps its status and source, a relative can share one condition from a sandbox "MyChart", and the patient reviews and prints a one-page pre-visit summary for the cardiology practice. All data is synthetic, there is no backend, and the cost is $0.

---

## 1. Decisions

| Question | Decision | Why |
| --- | --- | --- |
| Hosting | **Vercel Hobby (free)**, from a repo under a **personal** GitHub account (`raj200501/crit`) | Free, zero config for Next.js. Hobby allows non-commercial personal use only, has no BAA, and its terms bar hosting health information without written approval. So the app must hold **synthetic data only** (research §2.6) |
| Database | **None.** The tree lives in the browser (`localStorage`); invite, reply and summary links carry their data after `#` | Free database tiers (Neon Free, Supabase Free) sign no BAA. A server that never receives family data has nothing to breach, needs no accounts, and keeps the FTC Health Breach Notification Rule exposure near zero. It also keeps the demo working with no keys or setup. Trade-offs: links can't be revoked or expired, and relatives on another device must send a reply link back. Both are acceptable for synthetic data only |
| Auth | **None** | No server state to protect. Relatives never need accounts, in the prototype or later |
| "Connect MyChart" | **Real SMART on FHIR standalone launch** (OAuth 2 + PKCE, `fhirclient` 3.0.0) against the **public SMART Health IT sandbox**, labeled "MyChart (SMART sandbox)". Optional backup: Epic's own sandbox (free registration, up to 1 hour to sync) | The SMART launcher accepts unregistered clients and any redirect URI, so it works on Vercel preview URLs too. Its R4 server has synthetic patients with atrial fibrillation (e.g. `7099b4c5-6f47-4293-9690-f2afb23b9dd6`, onset 2016). No sandbox has FamilyMemberHistory data, so family history is seeded synthetically (research §1.6) |
| Box | **Not used in the prototype.** At most a disabled "Send to practice's Box (pilot)" button that explains why | Box signs a BAA only on Enterprise tiers, and it stores files, not a relational tree. The pilot role for Box is dropping the summary PDF into a practice's own Box Enterprise (research §2.5) |
| PDF | **Browser print** with print CSS (`@page` letter size, `break-inside: avoid`) | Free, no server CPU. Server-side PDF (`@react-pdf/renderer`) only if a Box upload is ever demoed |
| Pedigree drawing | **Custom SVG** (existing `src/lib/layout.ts`, `TreeView.tsx`) with NSGC-style symbols | A fixed three-generation grid of about 25 nodes is simple. `pedigreejs` is GPL-3.0, which would create copyleft obligations for a product |
| Alerts | **Clinician-facing only**, rule-based, each citing its guideline and year, in three tiers (section 7) | FDA: recommendations aimed at patients are a device. Clinician alerts stay non-device only if transparent (research §3.5) |

---

## 2. Stack (pinned)

| Package | Version | Notes |
| --- | --- | --- |
| `next` | **16.3.8** (App Router) | Latest stable on npm as of 2026-10-02. Vercel says **one critical and one high vulnerability are still pending an upstream fix**: upgrade to 16.3.9 or later the day it ships, and before demo day. The repo uses none of `next/og`, `next/image` remote patterns, `'use cache'` or `draftMode`, which most 2026 advisories hit. Read `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`) |
| `react`, `react-dom` | 19.2.8 | Includes the July 2026 RSC denial-of-service fix |
| `typescript` | 5.9.3 | Next 16.3 supports TypeScript 7 for builds, but stay on 5.9.3 until after the demo |
| `fhirclient` | 3.0.0 | Browser `authorize()` / `ready()`. Released 2026-09-18; check its changelog when upgrading |
| `qrcode` | 1.5.4 | QR for the read-only summary link |
| `eslint` / `eslint-config-next` | 9.39.5 / 16.3.8 | |
| `tsx` | ^4.23 | Runs `tests/*.test.ts` with `node --test` |
| Styling | CSS modules + `globals.css`; fonts through `next/font/google` (self-hosted at build, so no third-party requests at runtime) | |
| Runtime | Node `>=20` (`engines`). Vercel's default Node 24.x is fine. Every route is static | |

**Not included, on purpose:** database, ORM, auth library, email or SMS provider, analytics, error-tracking SDKs, LLM calls, and any third-party script.

---

## 3. Routes

| Route | Audience | Purpose | Data in / out |
| --- | --- | --- | --- |
| `/` | Anyone | Landing page: problem, how it works, what we heard (21 interviews) | None |
| `/tree` | Patient | Tree builder and person panel: guided questions, invite, edit, reset demo | Reads/writes `localStorage` key `fht:tree:v1` |
| `/invite#<payload>` | Relative | Answer for yourself, optionally connect "MyChart", add what you know about others, review, send back | Payload after `#`; draft progress in `localStorage` key `fht:invite:<tree>:<person>` |
| `/connect/callback` | Relative | SMART OAuth redirect handler. Completes the login, reads Patient + Condition, stashes the list in `sessionStorage`, returns to `/invite` | `sessionStorage` only; the full list is discarded after one item is picked |
| `/reply#<payload>` | Patient | Import a relative's answers into the tree (de-duplicated, sanitized) | Payload after `#` → `localStorage` |
| `/summary` | Patient | **Patient review view** (facts, gaps, generic questions to ask, review checkbox) plus actions: print, make read-only link/QR, download FHIR | Reads `localStorage` |
| `/view#<payload>` | Practice | Read-only **clinician document** opened from the link or QR | Deflate + base64url payload after `#` (redacted by `shareableTree`) |
| `/how-it-works` | Anyone | Plain-language summary of `docs/research.md` | None |

No API routes and no Server Actions. If any are ever added, they are public endpoints: re-check permissions inside every one.

---

## 4. Data model

The model already exists in `src/lib/types.ts`. Items marked **(add)** are new in this spec.

```ts
// Every fact is a Report with a source. Status is DERIVED from reports, never stored or typed.

export type Sex = "female" | "male" | "unknown"; // sex assigned at birth: drives sex-specific cutoffs

export type Relation =
  | "self" | "mother" | "father" | "sibling"
  | "paternal-grandfather" | "paternal-grandmother"
  | "maternal-grandfather" | "maternal-grandmother"
  | "paternal-aunt-uncle" | "maternal-aunt-uncle";
// Side of family is implied by Relation, so the layout cannot put a relative on the wrong side.

/** Derived. "pending" is NOT a fifth status: an invited, unanswered relative is "unknown" with reason "Invited, waiting". */
export type Status = "known" | "conflicting" | "unknown" | "declined";

/** Who produced the report. "record" = pulled from a patient portal via FHIR. */
export type SourceKind = "patient" | "relative" | "self" | "record";

/** (add) How the reporter knows. Drives the confidence badge. */
export type HowKnown = "records" | "told-me" | "family-story";

export type ReportKind =
  | "condition"   // a specific condition, optional age at onset
  | "no-history"  // pertinent negative: "as far as I know, no heart problems"
  | "declined"    // only the person themself can decline
  | "dont-know";  // reporter doesn't know (stored, so "nobody knows" differs from "not asked")

export interface RecordProvenance {
  system: string;            // "MyChart (SMART sandbox)"
  reference: string;         // "Condition/abc123" (dropped from shared links)
  code?: { system: string; code: string; display: string }; // SNOMED / ICD-10-CM
  recordedDate?: string;     // shown as "on problem list since <year>", never as diagnosis date
  retrievedAt?: string;      // (add) ISO date-time of the pull
  verificationStatus?: "confirmed" | "provisional"; // (add) provisional = outside record, lower confidence
}

export interface Report {
  id: string;
  personId: string;          // who the report is about
  kind: ReportKind;
  condition?: string;        // stored in the reporter's words or the guided-choice label
  choiceId?: string;         // (add) id from HEART_CHOICES when picked from the guided list
  ageAtOnset?: number;
  approximate?: boolean;     // "about"
  ageBefore?: number;        // (add) when exact age unknown: "younger than 55" -> 55
  note?: string;             // reporter's own words
  howKnown?: HowKnown;       // (add)
  reportedBy: string;        // display name ("Mom", "Uncle Dev", "Alex")
  reportedById?: string;     // person id when the reporter is in the tree
  source: SourceKind;
  reportedAt: string;        // ISO date-time
  record?: RecordProvenance; // present iff source === "record"
}

export interface Person {
  id: string;
  relation: Relation;
  label: string;             // what the patient calls them; no full names in the prototype
  sex: Sex;
  deceased?: boolean;
  ageAtDeath?: number;
  causeOfDeath?: string;
  suddenDeath?: boolean;                     // (add) "Was it sudden or unexpected?"
  autopsy?: "yes" | "no" | "unknown";        // (add)
  biologicalHistoryUnavailable?: boolean;    // (add) adopted / donor-conceived / parent unknown
}

export interface Invite {
  id: string;
  personId: string;
  token: string;             // opaque; prototype only (pilot: 256-bit, stored hashed)
  createdAt: string;
  answeredAt?: string;
  revokedAt?: string;        // (add) UI can mark revoked; real revocation needs a server (pilot)
}

export interface FamilyTree {
  id: string;
  patientName: string;       // first name only
  visit?: { specialty: string; date: string; practice?: string };
  people: Person[];
  reports: Report[];
  invites: Invite[];
  reviewedAt?: string;       // cleared by ANY edit to people or reports
  sharedAt?: string;
  synthetic: boolean;        // always true in the prototype; shown as a watermark
  updatedAt: string;
}

// ---- Derived (src/lib/status.ts, src/lib/clinical.ts) ----

export interface PersonView {
  person: Person;
  status: Status;
  headline: string;          // short line on the tree node
  reason?: string;           // why ("2 reports disagree", "From MyChart (SMART sandbox)", "Invited, waiting")
  reports: Report[];
  verified: boolean;         // >= 1 condition from a portal record (UI label: "from a portal record")
  cardiac: boolean;
  conditions: Report[];      // what reaches the summary (excludes secondhand reports about a decliner)
}

/** (add) Three tiers. Only "guideline" may be called a guideline criterion. */
export type FlagTier = "guideline" | "noted" | "clarify";

export interface Flag {
  personId: string;
  tier: FlagTier;            // (add)
  title: string;
  detail: string;            // relative, side, age, source
  basis?: string;            // (add) "ACC/AHA 2018 cholesterol guideline" etc. Required for tier "guideline"
}
```

### 4.1 Status derivation (keep the existing rules in `src/lib/status.ts`)

1. **declined**: the person's own latest firsthand report (`source` `self` or `record`) is `declined`. Only what the patient knows firsthand stays on the summary; other relatives' secondhand reports about them are dropped.
2. **unknown**: no `condition` and no `no-history` reports. The reason is "Not asked yet", "Invited, waiting", or "No one knows yet" (when a `dont-know` exists).
3. **conflicting**: any of these:
   - a firsthand "no heart history" alongside someone's reported condition;
   - two reporters whose condition sets don't overlap (after synonym normalization). A portal record never counts as a contradiction, because it holds only what was chosen to share;
   - the same condition with ages more than 2 years apart.
   The node shows the firsthand claim (or the first one) with a "?" and "N reports disagree". **All reports are kept; nothing is merged.**
4. **known**: otherwise. Headline priority: portal record > self-report > latest relative report. The reason shows the source ("From MyChart (SMART sandbox)", "2 relatives agree", "Reported by Mom").

### 4.2 FHIR export (`src/lib/fhir.ts`, already built)

| Status | FamilyMemberHistory |
| --- | --- |
| known | `status: completed`; each condition with `onsetAge` and a note naming the reporter and date (or "Retrieved from <system>") |
| conflicting | `status: partial`; every condition kept separately with its reporter; resource note "Reports disagree (…). All reports kept." |
| unknown | `status: health-unknown`, `dataAbsentReason: unable-to-obtain` (spec addition: `deferred` when invited and unanswered; `subject-unknown` when `biologicalHistoryUnavailable`) |
| declined | `status: health-unknown`, `dataAbsentReason: withheld`; no secondhand conditions |

Profile tag: US Core 9 FamilyMemberHistory. Bundle tagged `synthetic-demo`. Known limit: FHIR's `health-unknown` and `dataAbsentReason` describe the whole relative, so per-fact states live in notes.

---

## 5. Features in scope

P0 = needed for demo day. P1 = should have if time allows.

### F1. Tree builder with guided cardiac questions (P0)

- The tree starts as a fixed skeleton: you, mother, father, four grandparents. Siblings and parents' siblings are added per side ("Add Mom's brother or sister"). The patient never picks a side from a dropdown; the side comes from where they tap.
- The person panel asks the guided questions from `HEART_CHOICES` (`src/lib/clinical.ts`). Each choice has a plain label plus examples ("Heart attack or blocked arteries: stent, bypass surgery, angina…"). Answers: pick any / "No heart problems that I know of" / "I don't know" / (self only) "Prefer not to say". Age is exact or "about"; **(add, P1)** if no age is given, ask the sex-specific threshold question ("Was he younger than 55?").
- **(add, P1)** For deceased relatives: age at death, cause (chips), "Was it sudden or unexpected?", autopsy yes/no/unknown. Cause of death gets its own step, because MeTree recorded it in only 58.9% of pedigrees.
- **(add, P1)** "How do you know?" (saw records / they told me / family story) on each Yes.
- **(add, P1)** An "adopted / biological history unknown" toggle that renders as an explicit line, never a blank.
- Acceptance: Alex can add a paternal aunt, record "Heart attack, about 50" for her, and see the node update with a status and source. Nothing asks for full names, dates of birth or contact details.

### F2. Relative invite link flow (P0)

- From a relative's panel: "Ask <name> directly". This builds `/invite#<payload>` with tree id, patient first name, the invited person, and the people this relative can speak about (labels from *their* point of view, e.g. "Grandpa Ray (your father)").
- Sharing uses `navigator.share` when available, with **Copy link** always shown, because Web Share isn't in every browser. Suggested text contains **no health information**: "Alex is putting together family health history for a doctor's visit. Could you add what you know? <link>"
- The relative's steps:
  1. **Welcome / consent**: who asked; what is asked; who will see the answers ("Alex and Alex's cardiology team"); "This is a demo with made-up data. Don't enter real health information." **(add)** an "I'm 18 or older" checkbox. A clear **Prefer not to share** button that records `declined` and goes straight to sending.
  2. **About you**: the same guided questions (`source: "self"`).
  3. **Optional: Connect MyChart** (F4).
  4. **About others**: one card per relative they can speak about (`source: "relative"`, `reportedBy: <their label>`), each with "I don't know".
  5. **Review**: everything that will be sent, editable; **(add)** an explicit "Share these answers with Alex" confirmation.
  6. **Send back**: builds `/reply#<payload>` to send through the share sheet or Copy link. In the same browser (the demo), answers merge straight into the tree.
- `/reply`: the patient sees who answered and what, then taps **Add to my tree**. Imports are sanitized (`src/lib/sanitize.ts`) and accepted only from an invited relative, only about themself and the people they were asked about. Only the person themself can decline. A relative's newest answers about a person replace their older ones, so re-importing the same reply doesn't duplicate.
- Acceptance: Grandpa Luis's invite opens on a phone-width screen, completes in under 3 minutes with synthetic answers, and the reply shows up on the tree with "Reported by Grandpa Luis (self)".

### F3. Statuses and source tracking (P0)

- Four statuses with consistent color and text badges on tree nodes, in the panel and on the summary: **known**, **conflicting**, **unknown**, **declined**. Color is never the only signal.
- Each fact shows its source badge: *You reported* / *<Relative> reported* / *Self-reported* / *From a portal record (<system>, on problem list since <year>, retrieved <date>)*, plus the date. The word "verified" never appears on its own.
- Conflicts show both claims side by side ("Mom: heart attack at 60 · Uncle Dev: angina at about 58") with a "Worth clarifying" prompt. They are never auto-resolved.
- Acceptance: the unit tests in `tests/logic.test.ts` cover every status rule in section 4.1 and pass with `npm test`.

### F4. Demo "Connect MyChart" (P0)

- Inside the relative flow, the **Connect MyChart** button calls `authorize()` against `https://launch.smarthealthit.org/v/r4/sim/<encoded>/fhir` with:
  - client id `family-health-tree-demo` (unregistered; the launcher allows this);
  - scopes `openid fhirUser launch/patient patient/Patient.read patient/Condition.read` (**read only, nothing else**);
  - redirect `${origin}/connect/callback`; PKCE enabled.
- The launcher is preset to the synthetic AFib patient, skips the fake login, and **keeps the consent screen** so the audience sees an authorization step.
- The callback reads Patient and Condition in the browser and lists conditions, heart-related first. The relative ticks **one**. The app stores only `{display, code, recordedDate, system, reference, retrievedAt}` as a `source: "record"` report. It then asks "How old were you when this was diagnosed?", pre-filled from the record and editable, because the record date may be when it was listed rather than diagnosed. The rest of the list is cleared from `sessionStorage`.
- Labels on every screen: "MyChart (SMART sandbox): synthetic test patient". The app never writes to the sandbox, which is publicly writable.
- **P1 backup:** an Epic sandbox client (register free at fhir.epic.com, patient audience, Condition + Patient read, redirect `https://<prod-domain>/connect/callback`; wait up to 1 hour to sync; log in as `fhirderrick` / `epicepic1`). The client ID is public (not a secret) and goes in `NEXT_PUBLIC_EPIC_CLIENT_ID`.
- **Fallback if the sandbox is down on demo day:** a clearly labeled "Simulated record (sandbox offline)" button that injects the seeded AFib record with `system: "Simulated portal record"`.
- Acceptance: on the production URL, Connect → consent → pick "Atrial fibrillation" → confirm age → the fact shows on the tree with the portal badge, in under 60 seconds.

### F5. Patient review step (P0)

- `/summary` shows the **patient view**: each relative with what was reported, status and source; what is still unknown, declined or conflicting; the patient's own history; and generic **questions to ask your cardiologist** (static education, the same for everyone: "Should anyone else in my family be checked?", "Does my family history change which tests I need?", "Would a genetic counselor help?").
- The patient view shows **no** alert tiers, risk words, percentages or traffic lights.
- The checkbox "I've checked this and it matches what my family told me" sets `reviewedAt`. **Any** later edit clears it. Print and Make-link stay disabled until it is ticked.
- Acceptance: editing any report after review un-ticks the box and disables sharing.

### F6. One-page printable pre-visit summary (clinician document) (P0)

The **clinician document** is what prints (print stylesheet) and what `/view` renders. It fits on one US-letter page for the demo family. Order:

1. Header: patient first name, visit (specialty, date, practice), "3 generations · N relatives", "Reviewed by patient <date>", **"Synthetic demo data"** watermark.
2. **For clinician review**, in three labeled tiers (rules in section 7):
   - *Guideline family-history criteria matched*: each line gives relative, side, age, source and basis ("ACC/AHA 2018").
   - *Also noted (no guideline family-history criterion)*.
   - *To clarify*: conflicts, unknown first- or second-degree relatives, declined relatives, missing age at onset or death.
   If nothing matches: "No guideline family-history criteria matched what was reported. Gaps below may still matter."
3. By relative: a table of relative, what was reported, status, source.
4. **(P1)** A compact NSGC-style pedigree (squares, circles, diamond for unknown sex, slash for deceased, shading for heart condition, arrow for the patient).
5. **(P1)** Completeness against MeTree's 8 criteria: three generations, side, sex, up to date, pertinent negatives, age of onset, age at death, cause of death.
6. Footer: "Patient-reported family history for clinician review. Not a diagnosis or a risk score. Criteria: [guidelines with years]. Generated <date>. Synthetic demo data."

Sharing actions on `/summary`:
- **Print or save as PDF** (browser print).
- **Make a link for the practice**: `/view#<deflate+base64url>` of `shareableTree(tree)` (no invites, no FHIR references, nothing secondhand about a relative who declined), with a QR code when the URL is under about 2,300 characters. Label: "Read-only. The data is in the link after #, so it never reaches our server. Anyone with the link can read it, and it can't be revoked. A real version would use encrypted SMART Health Links."
- **Download FHIR** (`FamilyMemberHistory` bundle).
- A disabled **Send to practice's Box folder (pilot)** button with an explanation of the BAA requirement.

Acceptance: printing the demo family from Chrome produces one page; the `/view` link opens on a phone and shows the same clinician document.

### F7. Reset and local data controls (P0)

- "Reset demo family" and "Start my own tree (stays in this browser)". **(add, P1)** "Delete everything stored in this browser", which clears all `fht:*` keys in `localStorage` and `sessionStorage`.

---

## 6. Out of scope (prototype)

- Any real patient data, real MyChart or production Epic access, or real practice pilots.
- Database, server storage, accounts, login, MFA, email or SMS sending.
- Payments, ads, pricing pages, or anything that makes the Hobby deployment commercial.
- Analytics, session replay, tracking pixels, error-reporting SDKs.
- Real link revocation or expiry, server-side invites, multi-device sync.
- SMART Health Links with hosted encrypted payloads, fax, Direct messaging, Box upload, EHR write-back.
- FamilyMemberHistory pulls from portals (no sandbox has the data, and the API is non-USCDI).
- Risk scores, polygenic data, genetic-variant interpretation, the Schwartz or Shanghai scores, any LLM-generated medical text, any patient-facing alert.
- Children and grandchildren generations, half-sibling detail, consanguinity drawing (P2).
- Languages other than English; native apps.

---

## 7. Clinician alert rules v1

These rules replace the single list in `src/lib/clinical.ts → flagsFor` with three tiers. Only rules checked against guideline text are in the **guideline** tier (research §3.1). Every flag names the relative, side, age (or "age not known"), source, and for guideline flags the basis.

| Tier | Rule | Basis shown |
| --- | --- | --- |
| guideline | Heart attack / coronary disease / angina / stent / bypass in a **parent or sibling** before 55 (male) or 65 (female). If sex is unknown and age is 55–64, move it to *noted* with "sex not recorded" | ACC/AHA 2018 cholesterol guideline (premature ASCVD); still a risk enhancer in the 2026 ACC/AHA dyslipidemia guideline |
| guideline | "Very high cholesterol" / familial hypercholesterolemia / LDL ≥ 190 / cholesterol treated from a young age, in a first- or second-degree relative | Dutch Lipid Clinic / Simon Broome criteria; 2026 ACC/AHA cascade screening |
| guideline | Cardiomyopathy (HCM, DCM, "enlarged / thick / weak heart") in a **first-degree** relative, or in **2 or more** first- or second-degree relatives | AHA/ACC 2024 HCM; ESC 2025 DCM family consensus |
| guideline | Aortic aneurysm or dissection in a **first-degree** relative | ACC/AHA 2022 aortic disease guideline |
| guideline | Named inherited arrhythmia (long QT, Brugada, CPVT) or a known heart-gene result in a first- or second-degree relative | Inherited-arrhythmia diagnostic criteria count family history (score not computed) |
| guideline | Sudden unexplained death or survived cardiac arrest in any relative **before age 40** | APHRS/HRS 2020 sudden unexplained death consensus |
| noted | Sudden or unexplained death at 40 or older, or age unknown ("Ask age, circumstances, autopsy") | APHRS/HRS 2020 lists what to record |
| noted | Atrial fibrillation or another arrhythmia before 60 in any relative | No verified family-history criterion |
| noted | Stroke in a parent or sibling before 55 (male) or 65 (female); unexplained fainting before 40; high cholesterol before 40; cardiomyopathy or aortic disease in a single second- or third-degree relative | No verified family-history criterion |
| clarify | Conflicting reports about a cardiac condition ("Mom: heart attack at 60 · Uncle Dev: angina at about 58") | |
| clarify | Unknown or declined parent, sibling or grandparent; a deceased first-degree relative with no age or cause of death | |

Wording: titles are descriptive ("Early heart disease in a parent or sibling"), never imperative or diagnostic. No "high risk", no "you", no percentages. The tier heading reads "Family-history criteria named in cardiology guidelines, matched to what was reported. For the clinician to interpret; not a diagnosis or a risk score."

---

## 8. Synthetic demo family

Already in `src/lib/demo.ts`. Every name is made up, and `synthetic: true`. Visit: Cardiology, 2026-10-14, "Cardiology Associates (demo)".

| Person | Relation | Reports (source, date) | Derived status | Tree headline / reason |
| --- | --- | --- | --- | --- |
| **Alex** | Patient | — | (self) | "Cardiology visit" |
| **Mom** | Mother | `no-history`, self-reported (2026-09-27) | **known** | "No heart history" · Reported by Mom |
| **Dad** (deceased) | Father | Mom: heart attack, age 60 (relative, 09-27). Uncle Dev: angina, **about** 58, note "I think it was chest pain, not a full heart attack" (relative, 09-28) | **conflicting** | "Heart attack at 60?" · 2 reports disagree |
| **Uncle Dev** | Father's brother | Atrial fibrillation, onset age 34, `source: record`, MyChart (demo sandbox), SNOMED 49436004, record date 2009-04-02 (shown as "on problem list since 2009") | **known**, portal badge | "Atrial fibrillation, age 34" · From MyChart (demo sandbox) |
| **Grandpa Ray** (deceased) | Paternal grandfather | Uncle Dev: "don't know", note "He passed before I was old enough to ask" | **unknown** | "No one knows yet" |
| **Grandma June** | Paternal grandmother | `declined`, self (09-29) | **declined** | "Declined to share" |
| **Grandpa Luis** | Maternal grandfather | — (used for the live invite + MyChart demo) | **unknown** | "Not asked yet" |
| **Grandma Rosa** | Maternal grandmother | — | **unknown** | "Not asked yet" |

**Expected clinician document under the v1 rules:**
- *Guideline criteria matched*: **none.** Dad's ages (60 and about 58) are at or above the male cutoff of 55. Show the "No guideline family-history criteria matched" line.
- *Also noted*: "Irregular heartbeat at a young age: Uncle Dev (father's brother), atrial fibrillation, age 34, from a portal record (on problem list since 2009)."
- *To clarify*: "Reports disagree: Dad. Mom says heart attack at 60; Uncle Dev says angina at about 58." · "Dad (deceased): age and cause of death not recorded." · "Grandpa Ray: unknown." · "Grandma June: declined to share."

This changes the current test expectation in `tests/logic.test.ts` (which today puts "Irregular heartbeat at a young age" in the single flag list). Update the test to assert the tiers above. To show a guideline match live, add a synthetic sibling with "Heart attack, age 48" during the demo, which triggers the premature-ASCVD rule.

**Live demo script (about 3 minutes):** open `/tree` → tap Grandpa Luis → **Ask Grandpa Luis directly** → **Preview as Grandpa Luis** → Start → **Connect MyChart** → approve the sandbox consent → tick "Atrial fibrillation" → confirm age → send back → the tree updates → **Pre-visit summary** → tick review → Print, or Make a link and scan the QR with a phone.

---

## 9. Guardrails (non-negotiable for the prototype)

1. **Synthetic-data banner** on every page, including `/invite` and `/view`: "Prototype with a made-up demo family. Please don't enter real health information." The summary carries a "Synthetic demo data" watermark, and the FHIR bundle is tagged `synthetic-demo`.
2. **No real PHI.** No database, no server logs of payloads (never `console.log` tree, reply or portal data), no analytics or third-party scripts, `robots: noindex`.
3. **Not a diagnosis.** Footer on every summary; alerts only in the clinician document and only in the three tiers above; nothing personalized or imperative in the patient view.
4. **Links:** data only after `#`; `Referrer-Policy: no-referrer`; no condition names in URL paths or page titles. **(add)** A Content-Security-Policy in `next.config.ts`: `default-src 'self'; connect-src 'self' https://launch.smarthealthit.org https://fhir.epic.com; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`. Check the Next 16 CSP guide in `node_modules/next/dist/docs/` first: static pages can't use nonces, so `'unsafe-inline'` for scripts is the price of staying static. Keep the existing `X-Frame-Options: DENY`, `nosniff` and `Permissions-Policy`.
5. **Sandbox only:** read-only scopes; never write to the public SMART server; label every portal screen as a sandbox with synthetic patients.
6. **Adults only:** the relative's 18+ checkbox; no invites addressed to minors.
7. **Honest words:** "from a portal record", never "verified"; never "HIPAA compliant" or "HIPAA certified" anywhere in the app or README.
8. **Hobby rules:** no payments, ads, paid pilots or practice logins on this deployment.

---

## 10. Deploying free on Vercel

1. **Keep the repo personal.** `github.com/raj200501/crit` is on a personal account. Hobby cannot deploy private repos owned by a GitHub organization, so don't transfer it to an org. On Hobby, only the account owner's commits reliably trigger deployments of a private repo. Have the owner merge PRs, or make the repo public, and test one teammate push early.
2. **Upgrade Next.js** to the newest 16.3.x patch (16.3.9+ when it ships) and commit the lockfile.
3. **Check locally:**
   ```bash
   npm ci
   npm run lint
   npm test
   npm run build   # every route should be static
   ```
4. **Import:** go to https://vercel.com/new while signed in with the repo owner's GitHub, import `raj200501/crit`, and keep the detected settings (Framework: Next.js; build `next build`; no environment variables; default region `iad1`; default Node 24.x). Deploy. Or from a terminal: `npx vercel` (preview), then `npx vercel --prod`.
5. **Production branch:** merging to `main` deploys production at `https://<project>.vercel.app`. Other branches get preview URLs.
6. **Protect previews:** Project → Settings → Deployment Protection → **Vercel Authentication: Standard Protection** (previews only). Production must stay public, because relatives and the practice open links without Vercel accounts. To show a protected preview to a teammate or professor, use a **Shareable Link** (included on Hobby).
7. **Smoke test on the production URL:** `/tree` loads the demo family; run the live demo script from section 8 (the SMART launcher accepts any redirect URI, so no registration is needed); print the summary; open the `/view` link on a phone; confirm the response headers (`Referrer-Policy`, CSP) with the browser dev tools.
8. **Optional Epic backup:** register the production callback URL on fhir.epic.com at least a day before the demo (sync takes up to an hour), and set `NEXT_PUBLIC_EPIC_CLIENT_ID` in Vercel → Settings → Environment Variables.
9. **Usage:** a demo uses a tiny fraction of Hobby's limits (1M function invocations and 100 GB transfer a month; static pages use almost none). Runtime logs are kept for 1 hour.
10. **Stop here** if anyone proposes charging a practice, running a pilot with real patients, or adding a pricing page. That needs Vercel Pro and everything in section 12 first. If it's unclear whether something counts as commercial, ask Vercel Support in writing.

---

## 11. Optional Phase B (only if testers must contribute from their own phones over several days, still synthetic)

- Neon Free Postgres through the Vercel Marketplace (injects `DATABASE_URL`), `drizzle-orm`, `@neondatabase/serverless`, `better-auth` 1.7.7 (magic link, hashed tokens) for the **patient** only, `resend` on the free tier (**needs a domain the team owns**; a `*.vercel.app` subdomain can't be verified), `@upstash/ratelimit` on Upstash Free, and `zod` for input validation.
- Tables: `users`, `trees`, `persons`, `reports` (status inputs, `source_person_id`, `reported_at`, `origin`), `invites` (`token_hash`, `tree_id`, `person_id`, `expires_at`, `revoked_at`), `audit_events`.
- Relatives still have no account. Invite tokens are 32 random bytes, stored as a SHA-256 hash, limited to one tree and one branch, expire in 14 days, are revocable and rate-limited. **Opening the link lands on a page with a Continue button that POSTs; only then is the token used**, so email scanners and chat link previews can't burn it. Apply the same rule to magic links (Better Auth verifies on GET, consuming the token on first use).
- Don't enable open email-and-password sign-up alongside magic links (account pre-registration takeover advisory GHSA-qq9h-g4jm-xgf3; fixed in 1.6.22, still bad practice).
- All permission checks go in one server-only data-access layer (`canRead(treeId, personId, actor)`). Proxy (formerly middleware) does only optimistic checks.
- Still synthetic only. Free tiers sign no BAA.

---

## 12. Changes required before any real patient data (pilot)

| Area | Change |
| --- | --- |
| Contracts | BAA with each paying practice (the team becomes a business associate); BAAs with every vendor that touches the data; a vendor/BAA register |
| Hosting | Vercel **Pro** ($20 per seat per month) plus the **HIPAA BAA add-on** ($350/month). Keep health data out of preview and test environments; get Vercel Blob coverage in writing before using it |
| Database | **Neon Scale with HIPAA enabled** (self-serve BAA; irreversible per project; pgaudit preloaded). No health data in table or column names, query logs or error messages. Don't use Neon's managed auth or Data API for health data. Backups longer than the free 6-hour window |
| Data flow | Replace data-in-link payloads with server-stored records behind opaque, hashed, expiring, revocable tokens. Relatives' replies go to the server, not through the patient's chat |
| Auth | Better Auth in the covered database; magic links for patients (POST-to-confirm); **MFA for practice staff**; relatives stay account-free with scoped invite sessions |
| Messaging | Email through Amazon SES under the AWS BAA, or no health data in any email. Invites keep going from the patient's own phone. If the app ever sends SMS, Twilio Security or Enterprise Edition with a BAA |
| Consent | Per-relative opt-in and withdrawal; view, correct, decline, delete; 18+ only; a separate authorization for anything beyond running the service (research, analytics), built to NYHIPA's format (per category, at most 1 year, signed by the person the data is about, no re-ask for 9 months). No sale of data, ever, including in bankruptcy or acquisition |
| Security | Append-only audit log of every view, edit, share and export; encryption at rest; field-level encryption for free-text notes; rate limits; CSP; dependency patching on a schedule |
| Compliance | Documented HIPAA Security Rule risk analysis and policies; breach runbook (**30 days** for NY residents under GBL 899-aa, 60 days FTC/HIPAA); privacy policy; run the FTC Mobile Health Apps tool; counsel review of the hybrid consumer + business-associate model; recheck NYHIPA status |
| MyChart | Production Epic app with **read-only USCDI scopes only** (Patient, Condition), so it auto-distributes; fill in Epic's Data Use Questionnaire; hospital picker built from Epic's Brands bundle; scopes locked before "Ready for Production" (records can't be edited). A separate FamilyMemberHistory-enabled app only for a partner health system that agrees to approve it |
| Summary delivery | PDF plus a SMART Health Link (encrypted bundle hosted in BAA-covered storage) plus fax through an API from the covered backend; Box only into the practice's own Box Enterprise after written confirmation of API coverage |
| Clinical | Patient view vs clinician document confirmed with regulatory counsel; intended-use statement published; rules page versioned with guideline years; "Reviewed by clinician" lock; verify the 2026 dyslipidemia cutoffs before relying on them |
| Cost to plan for | About $400–550/month on the lean stack (Vercel Pro + BAA, Neon Scale, SES), before any revenue |

---

## 13. Gaps between the current repo and this spec

**Status, 2 October 2026:** the P0 gaps below are closed. Alerts come in three tiers with guideline bases, and only on the care-team document. The patient view has no alerts. The CSP header is in place. The relative flow has an 18+ check and a share confirmation. Next.js is on 16.3.8, the latest release, and `npm audit` finds nothing. `/how-it-works` summarizes this research, and `/research` renders it in full. These P1 items are also done: "on problem list since" wording with `retrievedAt`, `deferred` for pending invites, age and cause of death for deceased relatives, "Delete everything stored here", and a labeled sandbox-offline fallback. Still open: the threshold question when age is unknown, "How do you know?", the adoption flag, the completeness score, and NSGC pedigree symbols.


| Gap | Where | Priority |
| --- | --- | --- |
| Alerts are one list labeled "for clinician review" and appear in the patient's `/summary` view; AF in a relative is presented as a guideline criterion | `src/lib/clinical.ts`, `src/components/SummaryDocument.tsx`, `SummaryPage.tsx` | P0: split into tiers (section 7); patient view without alerts; clinician document for print and `/view` |
| No Content-Security-Policy | `next.config.ts` | P0 |
| No 18+ confirmation or explicit "share with Alex" confirmation in the relative flow | `src/components/InviteFlow.tsx` | P0 |
| Next.js critical/high fixes pending upstream | `package.json` | P0 on release |
| `/how-it-works` still says "Research in progress" | `src/app/how-it-works/page.tsx` | P0: summarize `docs/research.md` |
| Cause-of-death / sudden / autopsy capture; "How do you know?"; threshold question when age unknown; adoption flag | `AnswerForm.tsx`, `PersonPanel.tsx`, `types.ts` | P1 |
| Portal facts lack `retrievedAt` and "on problem list since" wording | `src/lib/smart.ts`, `InviteFlow.tsx` | P1 |
| `deferred` / `subject-unknown` in FHIR export | `src/lib/fhir.ts` | P1 |
| Completeness score; NSGC symbols on the printed pedigree | `SummaryDocument.tsx` | P1 |
| "Delete everything stored in this browser" | `TreeWorkspace.tsx`, `store.ts` | P1 |
| Sandbox-offline fallback button | `InviteFlow.tsx` | P1 |
