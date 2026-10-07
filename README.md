# Family Health Tree

Team 709 · Product Studio prototype. **Live demo: https://family-health-tree-raj-s-projects12.vercel.app**

Turn "heart problems run in the family" into **who, what, and at what age**, before the cardiology visit. A patient builds a three-generation family health tree, relatives fill in their own branches, every answer keeps its source and its uncertainty, and the patient walks in with a one-page summary the clinician can act on.

> Student prototype with a made-up demo family. It is not a medical device, it does not diagnose, and it must not be used with real health information.

## What's in the app

| Route | What it does |
| --- | --- |
| `/` | Landing page: the three.js "Night Window" hero and its scroll story, the problem, the live product tour, the relative's phone flow, privacy, two readers, practices, what we heard |
| `/tree` | The patient's tree. Tap a relative to add what you know (guided cardiac questions with examples), invite them, or edit them. Statuses are derived, never typed: **known**, **conflicting**, **unknown**, **declined** |
| `/invite#…` | What a relative sees on their phone: answer for themselves, optionally share one fact from MyChart, add what they know about others, then send it back |
| `/connect/callback` | SMART on FHIR redirect handler for the MyChart demo |
| `/reply#…` | The patient opens a relative's reply link and adds the answers to their tree |
| `/summary` | The patient's own one-page summary (facts, gaps, questions to ask; no criteria, no alerts). Review checkbox, print/PDF of the patient copy, the practice link and check-in QR, FHIR export |
| `/view#…` | Read-only **care-team** summary for the practice (opened from the link or QR). It lists guideline family-history criteria in three tiers (matched / also noted / to clarify), each with its guideline basis |
| `/practice` | The practice-side demo: upcoming new-patient visits and the care-team document for this browser's tree (print, copy as chart text, FHIR) |
| `/for-practices`, `/pilot` | The buyer's page (the annotated care-team page, how it arrives, intake) and the proposed pilot with an ROI calculator |
| `/privacy` | Security and privacy: what stays in the browser, the CSP, portal records, what changes before real data |
| `/how-it-works` | Research summary: MyChart access, privacy and compliance, clinical criteria, business model, riskiest assumptions |
| `/research` | The full fact-checked research write-up (`docs/research.md`) with numbered sources |
| `/design-system` | Internal QA gallery of the design-system primitives (noindex) |

### Try the demo

1. Open `/tree`. You see Alex's synthetic family: Uncle Dev's AFib came from a portal record, Mom and Uncle Dev disagree about Dad, Grandpa Ray is unknown, and Grandma June declined.
2. Tap **Grandpa Luis**, then **Ask Grandpa Luis directly**, then **Preview as Grandpa Luis**.
3. In the new tab, tap **Start**, then **Connect MyChart**. Approve the sandbox consent screen. Pick the AFib record, confirm the age, then send it back. Your tree updates, because the demo runs in the same browser.
4. Open **Pre-visit summary**, tick the review box, then print it or make a link for the practice.

## How data is handled in the prototype

- **No server storage.** The tree lives in the browser (`localStorage`). There is no database, account or analytics.
- **Links carry their own data.** Invite, reply and summary links put their payload after the `#`. Browsers never send that part of a URL to a server, and the app sets `Referrer-Policy: no-referrer`.
- **MyChart demo.** This is a real SMART on FHIR standalone patient launch (OAuth 2 with PKCE, `fhirclient` 3.0.0) against the public [SMART Health IT sandbox](https://launch.smarthealthit.org), which serves synthetic Synthea patients. The relative sees their conditions and ticks the single fact to share. The full chart never leaves the page.
- **Honest labels.** A portal fact is shown as "from a portal record", not "verified". A record date can be when a problem was listed, not when it was diagnosed, so the relative confirms the age.
- **FHIR export.** The summary exports as FamilyMemberHistory resources. Statuses map to `status` and `dataAbsentReason`, and every reported condition keeps who said it.
- **Validation.** Everything arriving from a link or from storage is validated (`src/lib/sanitize.ts`). Replies are accepted only from invited relatives, only about themselves and the people they were asked about.
- **Content-Security-Policy.** Scripts load only from this site, and the browser may connect only to this site and the SMART sandboxes.
- **Clinician alerts, not patient alerts.** Under FDA's 2026 clinical decision support guidance, recommendations shown to patients make software a device. The patient sees facts and generic questions; guideline criteria appear only on the care-team document, each with its guideline and year.

What changes before any real patient data (see `docs/research.md`): BAA-covered hosting and storage, a BAA with each paying practice, audit logging, a breach-response plan (FTC Health Breach Notification Rule), an explicit consent flow for relatives, and production Epic app registration. **Never describe this as "HIPAA certified".** No such certification exists.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all routes are static)
npm run lint
npm run typecheck
npm test         # logic, design tokens, hero story model, research transforms
npm run build && npx next start -p 3100 &   # e2e always runs against the production server
E2E_PORT=3100 npx playwright test           # e2e contract, axe, CSP, print (E2E_SANDBOX=1 adds the live SMART sandbox test)
```

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 (tokens in `src/app/globals.css`; CSS modules only for the summary's print rules, the hero stage and the `/research` prose), `motion`, `three` (lazy-loaded hero), Lenis, `fhirclient`, `qrcode`. No backend.

## Deploy (free, Vercel Hobby)

Deployed as the Vercel project `family-health-tree` at https://family-health-tree-raj-s-projects12.vercel.app. Every push to `claude/platform-demo-gif-mnpouw` (the production branch) redeploys. Vercel Authentication covers preview deployments only, so the production URL stays public for relatives and practices opening links.

To set it up again elsewhere:

1. Install the Vercel GitHub app on the repo: https://github.com/apps/vercel/installations/new
2. Import the repo at https://vercel.com/new. The framework is detected as Next.js and needs no settings or environment variables.

Vercel Hobby is for non-commercial use and has no BAA. That is fine for this synthetic-data prototype and not fine for real patient data.

## Repo layout

```
src/app/           routes (see table above)
src/components/    ui/ (design-system primitives), brand/, site/ (marketing chrome), hero/ (three.js),
                   landing/, content/, tree/ + person/ (workspace), relative/ (invite flow),
                   summary/ (summary, care-team view, practice demo)
src/content/       the shared copy deck (site.ts)
src/lib/           data model, status derivation, pedigree layout, clinical flags,
                   share links, SMART client, FHIR export, local store
demo/              the animated demo (HTML) and its GIF/MP4 renders for slides
slides/            the "What we heard" slide (.pptx/.png) and its generator
docs/              research write-up (also at /research) and MVP spec
tests/             unit tests (node:test + tsx) and tests/e2e (Playwright)
```
