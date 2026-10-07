# Maker Day 2 pitch: Stemma, the family health tree

Team 709 · Section 7 · TECH 5900 Product Studio · Maker Day 2, Oct 16, 2026 (slides as one PDF by 5:00 pm Oct 16)
Raj Kashikar · Viha Srinivas · Unser Jaffry · Draft of Oct 6, 2026 (revised after review; renamed Stemma on Oct 7)

**How to read this.** `[n]` = numbered source in `../research.md`. `[S#]` = source opened for the pitch work; the full list with URLs is at the end of this file and in `vca.md`. Interview IDs match the Team Hub "Interview Logs". "(note)" = the note-taker's wording; quotation marks only where the Team Hub notes have them. **Assumption** = our estimate, with its math. Canvas tags: **N** new, **O** old, **N/O** some of each.

**Deck look.** The deck has its own look and does not follow the website. Use the Team 709 theme from Maker Day 1: white background; headline in the dark navy bold display face used for the Maker Day 1 title (now set as "STEMMA"); body text in dark gray; orange as the one accent color; the small "Team 709" mark top right and a page counter bottom right ("2 / 8"). The deck's status colors (**known** = green outline, **conflicting** = orange outline, **unknown** = gray dashed outline, **declined** = gray fill) appear only on slide 1, which is drawn natively. The only things the deck takes from the website are the screenshots on slides 3–5 and backup A12, placed in plain gray browser or phone frames. The deck is not restyled to match them, and slide 3 has no deck-colored legend: the app's own status labels, visible in the screenshot, carry the statuses. Every slide except 3–5 and backup A12 can be built now.

**Main deck: 8 slides, 4:49 of talk** (11 seconds of slack before the 5:00 hard stop; the script is about 665 words, 4:26 at 150 words a minute). Raj 1:51 (slides 1, 2, 8), Viha 1:20 (slides 3–5), Unser 1:38 (slides 6–7), handoffs included in the incoming speaker's time.

| # | Element | Story title | Speaker | Seconds | Clock at end |
| --- | --- | --- | --- | ---: | ---: |
| 1 | Opens 1 | Stemma turns "it runs in the family" into facts. | Raj | 18 | 0:18 |
| 2 | 1 Customer and problem | Patients know heart trouble runs in the family, not who. | Raj | 44 | 1:02 |
| 3 | 2 Mockup | The patient builds the tree by side of family, uncertainty included. | Viha | 23 | 1:25 |
| 4 | 2 Mockup | Relatives answer for themselves, on their phone, with no account. | Viha | 25 | 1:50 |
| 5 | 2 Mockup | The patient walks in with one page the cardiologist can act on. | Viha | 32 | 2:22 |
| 6 | 3 Will people buy it? | People use it when the practice sends the link; no practice has agreed to pay yet. | Unser | 47 | 3:09 |
| 7 | 4 Can you make it? | We can pilot by January; salaries need a bigger market. | Unser | 51 | 4:00 |
| 8 | 5 Central business logic and wedge | Start with three NYC cardiology groups, then grow into primary care. | Raj | 49 | **4:49** |

---

## Main deck

### Slide 1 · Title

- **Story title:** Stemma turns "it runs in the family" into facts.
- **Speaker / time:** Raj · 18 s
- **On-slide text:**
  - Top strip (small caps): `TEAM 709 · SECTION 7 · PRODUCT STUDIO · MAKER DAY 2 · OCT 16, 2026`
  - Headline: `STEMMA`
  - Descriptor (small caps, directly under the headline): `THE FAMILY HEALTH TREE`
  - Subhead: `"Heart problems run in the family" → who, what, at what age. Before the first cardiology visit.`
  - Line: `Free for patients · cardiology practices pay`
  - Names: `Raj Kashikar · Viha Srinivas · Unser Jaffry`
  - Footer (small): `Prototype uses synthetic data only.`
- **Visual:** Left half: the text above, in the Maker Day 1 layout. Right half, built natively in Slides (not a screenshot): a gray speech bubble reading "Heart problems run in the family." with an orange arrow to three status chips stacked vertically, in the deck's status colors: green-outline chip `Uncle Dev · atrial fibrillation at 34 · his answer + his portal record`; orange-outline chip `Dad · heart attack at 60? or angina at ~58?`; gray-dashed chip `Grandpa Ray · unknown`. This previews the whole idea in one picture. It is the only slide with deck-colored status chips.
- **Logo files:** `public/brand/stemma-lockup-1200.png` (mark + "Stemma" + descriptor in ink and evergreen, transparent, for white slides) and `public/brand/stemma-lockup-night-1200.png` (ivory and lumen, transparent, for a dark #1F2937 slide); the mark alone is `stemma-mark-512.png` / `stemma-mark-night-512.png`. If the logo goes on the slide, it sits above or beside the headline; the headline stays text.
- **Script (Raj):** "We're Team 709, and this is Stemma. In ancient Greece, medicine was a family business. Stemma brings the family back into it: it turns 'heart problems run in the family' into who had what, at what age, before the first cardiology visit." (18 s; the slide's "Free for patients · cardiology practices pay" line is no longer read aloud.)
- **Why the name (for Q&A, not read aloud):** a *stemma* (Greek στέμμα) is the ancient family-tree diagram; Roman households displayed stemmata of their ancestors. The mark is a pedigree couple whose descent line becomes the Rod of Asclepius, the Greek god of medicine's staff with one snake (not the two-snake caduceus). Medicine was a family business: Asclepius's children included Hygieia, Iaso and Aceso, and Greek doctors called themselves Asclepiads, "of the family of Asclepius". Before using the name beyond the class, see open item 15 (trademark).
- **Evidence notes:** Uncle Dev's portal record gives the condition and the date it went on his problem list (2009); the age, 34, is his own answer [8] (`src/lib/demo.ts`).

### Slide 2 · Customer and problem

- **Story title:** Patients know heart trouble runs in the family, not who.
- **Speaker / time:** Raj · 44 s
- **On-slide text:**
  - Kicker: `CUSTOMER AND PROBLEM`
  - Column 1 header `WHO`: `Patient: adult booked for a first cardiology visit (33-day average wait [S2])` · `Payer: the independent practice; the manager holds the budget`
  - Column 2 header `WHAT THEY USE TODAY`: `Patient: memory, then calling relatives after the visit` · `Practice: intake form (yes/no "Heart Disease?" + a few lines for details), then a quick question in the room`
  - Column 3 header `THE GAP`: stat `1 in 7` + label `US adults have actively collected their family health history (15.2%; CDC/NCHS survey, 2024 data, published 2026) [S1]`; stat `11%` + label `of positive heart family-history entries in UK GP records named relative and age (1.5M patients, 1998–2008) [89]`
  - Footer strip: `ID007: knew heart problems ran in the family, not who or when (paraphrase of notes).`
- **Visual:** Three columns. Column 1: a simple person icon with a calendar showing "visit in 3 weeks" over the patient line, a small building icon over the payer line. Column 2: a tight crop of the family-history grid on page 3 of a posted cardiology new-patient form (rows Father, Mother, Brother(s), Sister(s), Son(s), Daughter(s), Other(s); columns including "Heart Disease?"), including the free-text detail lines under it, with an orange box around the "Heart Disease?" column. Caption under it, small: `Health-system example (2016 version). Independent practices' forms not yet collected [S5]`. Column 3: the two stat tiles, large numerals in navy.
- **Script (Raj):** "Our user is an adult booked for a first visit at an independent cardiology practice, and that practice pays. One patient we interviewed knew heart problems ran in the family, but not who, what, or when. The cardiologist sent them home to ask, and they learned an uncle had a rhythm problem young. Today it's memory, a yes-or-no heart disease grid on the intake form with a few lines for details, and a quick question in the room. Only one in seven American adults says they've collected their family history. Viha will show you what our made-up patient, Alex, does instead."
- **Evidence notes:** ID007 (Team Hub note; the only words in quotation marks there are "heart problems run in the family"). The form [S5] (Weill Cornell Medicine Cardiology, ver. 2-7-16) asks "Heart Disease?" per relative, then asks for type and age of onset on free-text lines and about sudden death; it has no side of family and no "not sure". Independent practices' forms and EHR check-ins are not yet collected (open item 9; athenahealth's check-in can show family-history questions [S52]). "Quick question in the room": family history was discussed in 51% of new-patient visits, under 2.5 minutes (US family physicians, Acheson et al. 2000, via [117]); spoken only. [S1]: NCHS Rapid Surveys System, Jan–Feb 2024, published 2026. [89]: UK THIN records, 1,504,535 patients registered 1998–2008.

### Slide 3 · Mockup 1: the patient builds the tree

- **Story title:** The patient builds the tree by side of family, uncertainty included.
- **Speaker / time:** Viha · 23 s (includes the handoff)
- **On-slide text:**
  - Kicker: `MOCKUP · 1 OF 3 · THE PATIENT`
  - Caption: `Alex builds the tree, one side at a time`
  - Callouts: `① Mother's side and father's side are fixed slots` · `② "Not sure" is a real answer` · `③ Every person shows a status in words: Known · Reports disagree · Unknown · Declined to share · Not asked yet` (copy the exact labels from the final screenshot)
  - Small caption under the frame: `Statuses as shown in the app`
- **Visual:** Screenshot of the redesigned **tree view** with the demo family loaded, captured from the production URL at desktop width, 2× scale, cropped to the tree area with the app's own status labels (or legend) inside the frame, in a plain gray browser frame. No deck-colored legend row: two color codes for the same statuses on one slide would contradict each other. Callouts are navy circles with white numerals, not orange, so they don't read as a status. Expected nodes: Mom (known), Dad (reports disagree), Uncle Dev (known, from a portal record), Grandma Rosa (known), Grandpa Ray (unknown), Grandma June (declined to share), Grandpa Luis (not asked yet). Callout ① on the mother's-side / father's-side grouping, ② on one "Not sure" / "Doesn't know" answer, ③ on a status label. Optional inset (bottom right, phone-sized): the guided question card showing plain-word examples and the "Not sure" option.
- **Script (Viha):** "Alex builds the tree one side of the family at a time, so nobody lands on the wrong side. Each relative gets plain questions with examples, and 'not sure' is a real answer. Every person gets a status in plain words: known, reports disagree, unknown, chose not to share, or not asked yet."
- **Evidence notes:** D021 expects most patients would make structural errors, such as wrong side of family or wrong relationship type (note), and favored a guided flow that builds the pedigree (note); ID006 would have answered differently with a specific question (note); a guided tool recorded lineage in 100% of MeTree pedigrees vs 28.4% of chart pedigrees [84]. Status words above are from the redesign's current build (`shots/desktop-5-answers-end.png`); if the final labels differ, change the callout and the script to match.

### Slide 4 · Mockup 2: a relative answers

- **Story title:** Relatives answer for themselves, on their phone, with no account.
- **Speaker / time:** Viha · 25 s
- **On-slide text:**
  - Kicker: `MOCKUP · 2 OF 3 · THE RELATIVE`
  - Callout 1: `Grandpa Luis opens Alex's link.` No account and no app; he sees who asked and who will read his answers, and "I'd rather not share" is always an option.
  - Callout 2: `He shares one condition from his own portal.` A real SMART on FHIR launch: he ticks atrial fibrillation, labeled "on your problem list since 2016", and confirms the age (69) himself. Nothing else leaves the page.
  - Footnote (small): `Sandbox: Willis Crona is a made-up patient on the public SMART on FHIR test server, not a real MyChart. The invite text Alex sends carries no health information.`
- **Visual:** Two plain gray phone frames side by side (390 × 844 captures at 2–3× scale). **Phone A:** the redesigned **relative invite screen** (who asked, who will see the answers, "Prefer not to share", the 18+ check, the made-up-data notice). Outline on the "who will see" line and the decline button. **Phone B:** the **MyChart sandbox pick screen** ("Pick what to share" after the SMART sandbox launch) with exactly one condition ticked, ideally "Atrial fibrillation · on the problem list since 2009", and the age-to-confirm field. Outline on the ticked condition and its source label. If the sandbox patient shows different conditions, use the labeled "Simulated portal record" fallback, which lists atrial fibrillation, and keep its label visible.
- **Script (Viha):** "Then Alex texts each relative a link. Here's Grandpa Luis, Mom's dad, on his phone. No account. He sees who asked and who will read his answers, and he can decline. He answers for himself. He can also log in to his own patient portal and share one condition, labeled with where it came from."
- **Evidence notes:** The deck uses Grandpa Luis (not asked yet in the demo) because the real sandbox record (made-up patient Willis Crona: atrial fibrillation on the problem list since 2016, age 69) fits him; Uncle Dev's portal fact (atrial fibrillation at 34, mirroring ID007's uncle) is already in the tree and shows on slide 5. The portal label says "on your problem list since <year>", never "verified", because Epic's onset date can be the date the problem was listed [8]; the relative confirms the age. The sandbox launcher preselects a synthetic patient and skips the login screen (`src/lib/smart.ts`). The invite message carries no health information (fixed in the redesign).

### Slide 5 · Mockup 3: the one page

- **Story title:** The patient walks in with one page the cardiologist can act on.
- **Speaker / time:** Viha · 32 s
- **On-slide text:**
  - Kicker: `MOCKUP · 3 OF 3 · THE VISIT`
  - Title: `One page the cardiologist can act on`
  - Label over left image: `Alex's copy: facts, gaps, questions`
  - Label over right image: `Care-team copy (the practice files it)`
  - Three highlight tags on the right image: `Family-history item in the Simon Broome FH criteria, for clinician review` · `To clarify: reports disagree` · `Source on every line`
  - Footer: `Alex's copy shows facts, gaps and questions, never risk scores. Guideline criteria appear only on the care-team copy, written for the clinician to review.`
- **Visual:** Left, about one third of the width: the redesigned **pre-visit summary, patient view** (facts, "Still to confirm", "Questions you could ask your cardiologist", the "I've checked this" box), shrunk. Right, two thirds: the **care-team summary** as the practice opens it, cropped to its top half so text is readable, with the synthetic-data watermark visible. Three highlights: (1) Grandma Rosa, mother's side, very high cholesterol around 35, reported by Mom; (2) Dad: Mom reports heart attack at 60, Uncle Dev reports angina at about 58; (3) a source tag on any line ("from a portal record" on Uncle Dev's atrial fibrillation is best). Plain gray frames.
- **Script (Viha):** "Alex checks it and brings it in. Alex's copy shows facts, gaps and questions. The care-team copy, the one the practice gets by link or QR, adds a block for the cardiologist: Grandma Rosa, Mom's mother, very high cholesterol around 35, reported by Mom. That's a family-history item in the Simon Broome criteria for inherited high cholesterol, for the cardiologist to review. To clarify: Mom says Dad had a heart attack at 60; Uncle Dev says angina at about 58. Unser?"
- **Evidence notes:** Grandma Rosa is a second-degree relative. Dutch Lipid Clinic family-history points count first-degree relatives only; Simon Broome counts a first- or second-degree adult relative with total cholesterol > 290 mg/dL [77]. Mom reports "very high cholesterol", not a measured value, so the line is a family-history item for review, not a match. The current build labels it "Dutch Lipid Clinic / Simon Broome; 2026 ACC/AHA dyslipidemia guideline (cascade screening)" (`src/lib/clinical.ts`), and the 2026 cascade-screening line is about screening children [74][75]; fix the label before the screenshot (open item 8). Also on the page: one "also noted" item (Uncle Dev, atrial fibrillation at 34: condition from his portal record, age from his answer; atrial fibrillation in a relative has no verified family-history criterion [79]) and Dad's disagreeing reports under "to clarify". The current build prints the care-team copy for the patient and lets the patient preview it; whether a patient-carried care-team page changes the FDA analysis is a question for counsel (research §3.5, open question 5), so the redesign should print the patient copy and send the care-team copy to the practice by link or fax (open item 8). FDA line: [95]. If the redesign changes the demo family or labels, rewrite this script to match the screenshot.

### Slide 6 · Will people buy it?

- **Story title:** People use it when the practice sends the link; no practice has agreed to pay yet.
- **Speaker / time:** Unser · 47 s (includes the handoff)
- **On-slide text:**
  - Kicker: `WILL PEOPLE BUY IT?`
  - Table (4 rows):

    | Who | Today | Gain with us | Net |
    | --- | --- | --- | --- |
    | Patient (free) | Memory + intake form | Relatives answer; one page to bring | **+** if the practice asks |
    | Relative (free) | A phone call | Answer once, for yourself; can decline | **0**, unproven |
    | Cardiologist | Quick question in the visit | Who, what, what age, source | **+?** if < 1 min scan (none asked yet) |
    | Practice (pays) | Its form or EHR check-in · free intake · FamGenix | More history in the chart before visit one | **?** not proven |

  - Tile 1: `99.8% vs < 4%` · `pedigrees meeting quality criteria: guided tool vs charts [84]`
  - Tile 2: `57%` · `of 95,166 invited finished a clinic-sent pre-visit chatbot (cancer risk, women's health, lab-funded) [92]`
  - Tile 3 (orange outline): `0 of 21` · `interviews were practice managers. Riskiest claim: a manager pays. Next test: 5 NYC managers by Oct 23.`
- **Visual:** The table across the top two thirds, "Net" column in bold with + in green, 0 in gray, +? and ? in orange. Three tiles across the bottom, the third outlined in orange. No verdict bar: the title carries the verdict.
- **Script (Unser):** "Against what each person uses today, patients gain the most. Duke's MeTree got high-quality family trees for 99.8 percent of patients, against under 4 percent of charts. Use depends on who sends the link: when women's health clinics texted a cancer-risk chatbot before visits, 57 percent of everyone invited finished it. The cost: about half an hour on average, and asking family. The practice pays, and its options are cheap or free. So our riskiest claim is that a practice manager will pay. None of our 21 interviews was one yet. Verdict: use is likely if the practice sends the link; payment is unproven."
- **Replace the riskiest-claim lines with whatever is true on Oct 16:** if calls happened, "We asked [N] practice managers; [M] named a budget owner and [K] would sign a letter of intent." Tile 3 becomes `[M] of [N] managers named a budget`. If the clinician scan test (VCA test 2) has run, replace "none asked yet" with its result. Never say calls are "booked" unless they are.
- **Evidence notes:** Net labels follow the scored table in `vca.md` Step 4.2 (quality of what reaches the visit counted double: patient +2, relative 0, clinician +3 with a < 1 min scan, practice −2 plus unmeasured staff time). [84] MeTree, US primary care, 1,184 vs 390 pedigrees. [92] 64.2% of 95,166 invited engaged and 89.4% of them finished, so 57% of everyone invited (61,070 × 0.894 / 95,166); the link went about 5 days before the visit with reminders at 72 and 24 hours, for a 15-minute cancer-risk chatbot that labs funded [S54]; a weeks-ahead tree that depends on relatives should expect less. "Half an hour": MeTree averaged 27.1 minutes [90]. "Cheap or free": the EHR check-in the practice already has [S52], Phreesia intake free through at least Dec 31, 2026 [112], lab tools free [107], FamGenix free up to 20 pedigrees and $500 a year for an Individual license, with questionnaires and the cardio model extra [111]. Interview count: Team Hub logs 21, none a manager, cardiologist or relative.

### Slide 7 · Can we make it?

- **Story title:** We can pilot by January; salaries need a bigger market.
- **Speaker / time:** Unser · 51 s
- **On-slide text:**
  - Kicker: `CAN WE MAKE IT?`
  - Block 1 `TECHNICAL · runs today (synthetic data)`: `Tree → relative link → sandbox portal launch → one page → FHIR export` · `Epic can't write family history → we send a PDF` · `Next build: pilot backend (storage, logins, MFA, audit log)`
  - Block 2 `OPERATIONAL · when a practice pays`: `We become its HIPAA business associate (BAAs, breach plan)` · `Each relative consents for their own branch` · `Guideline criteria on the clinician's copy only (FDA CDS guidance, 2026)`
  - Block 3 `FINANCIAL · cheap to run, small to earn`: table

    | | |
    | --- | --- |
    | Cost to run, real data | **$689–834 / month** |
    | Break-even at $500/cardiologist/yr | **17–21 cardiologists** (≈ 10 groups) |
    | One salary (wage only) | ~290 ≈ all NYC independents |

  - Verdict bar: `Verdict: yes at pilot scale, from about January 2027; not yet salaries. Main risk: price.`
  - Footnote (small): `Price pages Oct 6, 2026; insurance estimated. Founders unpaid; support and sales time not counted.`
- **Visual:** Three columns of equal width with the headers above; the financial mini-table in column 3 with the first two rows bold. A thin flow diagram in column 1 (five small boxes with arrows) and the "next build" line under it. Navy verdict bar at the bottom.
- **Script (Unser):** "Yes, at pilot scale. What you just saw runs today on synthetic data, with a real SMART on FHIR launch against a public test server. Portals only have to share problem lists, not family history, and Epic can't write it in, so the page goes in as a PDF. Next we build a standard backend with two-factor login and audit logs. Once a practice pays, we become its HIPAA business associate under signed BAAs. Running it costs about 690 to 830 dollars a month. At 500 dollars per cardiologist a year, about ten practices cover that. One salary would take about 145 practices, roughly every independent cardiologist in New York. So New York is our pilot, not our market."
- **Evidence notes:** live prototype checks Oct 6 [S28]; the sandbox launcher preselects a synthetic patient and skips the login screen (`src/lib/smart.ts`); today a relative's answers come back as a reply link the relative texts to the patient, and nothing is stored on our servers (`InviteFlow.tsx`), so the pilot backend (server storage, logins, staff MFA, expiring invite tokens, audit log) is the next build. FamilyMemberHistory is not USCDI and Epic has no create API [7][10]; business associate [35]; FDA CDS guidance [95]. Costs: Vercel Pro + HIPAA add-on [61], Neon Scale [64][S18], SES [S19], insurance medians [S21][S22]. Salary: BLS median wage $135,980, before payroll taxes and benefits [S23]. NYC independent cardiologists 285–320 (re-run Oct 6) [S27]. Earliest pilot start about January 2027, after a company, counsel review, a signed rule table, the backend, and the BAA stack with insurance (critical path in `vca.md` 5.2). Founder support time, 1–2 hours per practice a month, is worth $65–131 a month at the BLS median wage, against $83 a month from a 2-cardiologist practice (A4). Break-even math in Appendix A4.

### Slide 8 · Central business logic and wedge

- **Story title:** Start with three NYC cardiology groups, then grow into primary care.
- **Speaker / time:** Raj · 49 s (includes the handoff)
- **On-slide text:**
  - Kicker: `CENTRAL BUSINESS LOGIC · WEDGE`
  - Card 1: `People will buy it because cardiology practices need which relative, what condition and what age, their intake forms take it from memory, and a link they send gets those details, each with its source, into the chart before visit one.`
  - Card 2: `We can make it because the patient side already runs on public standards, a PDF reaches any chart, and a pilot on vendors that sign BAAs costs under $850 a month, which about ten two-cardiologist practices cover with founders unpaid.`
  - Left column `WEDGE · NOW`: `3 independent NYC cardiology groups · all adult new patients · $1,000, 12-week pilot · goal: 4 in 10 have a reviewed page in the chart before visit one`
  - Right column `VISION · LATER`: `Larger groups → genetics and lipid clinics → primary care`
  - Ask (orange): `Our ask: introductions to NYC cardiology practice managers.`
  - Corner: QR code + `stemmahealth.vercel.app · synthetic data only`
- **Visual:** Two full-width sentence cards stacked at the top (navy text, "People will buy it because" and "We can make it because" in bold). Below, two columns joined by an orange arrow: a small narrow box "WEDGE · NOW" on the left, a wider box "VISION · LATER" on the right, so the wedge is visibly smaller than the vision. Ask line under them. Bottom right: the QR code and the URL as text. No website thumbnail: the closing slide stays in the deck's own look.
- **Script (Raj), reads both cards word for word:** "People will buy it because cardiology practices need which relative, what condition and what age, their intake forms take it from memory, and a link they send gets those details, each with its source, into the chart before visit one. We can make it because the patient side already runs on public standards, a PDF reaches any chart, and a pilot on vendors that sign BAAs costs under 850 dollars a month, which about ten two-cardiologist practices cover with founders unpaid. We start with three independent New York cardiology groups in a paid 12-week pilot. Success: four in ten new patients have a reviewed page in the chart before visit one. Our ask: introductions to practice managers."
- **Evidence notes:** each clause is traced in `vca.md` (Central business logic table). "Take it from memory": the form asks yes or no per relative, then leaves a few lines for details, with no side of family and no room for "not sure" [S5]. Wedge: R5 scoring (Appendix A6), research §5 pilot design, 39 NYC groups with 2+ independent cardiologists, about 19–20 cardiology-focused once hospital-linked groups are removed [S27]. "About ten two-cardiologist practices": 9–11 at $500 per cardiologist per year (A4). Success metric: of invited new patients whose first visit falls in pilot weeks 2–12, the share with a patient-reviewed summary in the chart before that visit (A11). Primary care: the Annual Wellness Visit requires family history [104].

### Timekeeper checkpoints and cut list

The teammate not speaking holds a phone stopwatch where the speaker can see it.

| Checkpoint | Who should be talking | If more than 10 s late, cut this |
| --- | --- | --- |
| 1:02 | Viha starts slide 3 | Viha drops "Each relative gets plain questions with examples" (the slide shows it) |
| 2:22 | Unser starts slide 6 | Unser drops the MeTree sentence; keeps the 57 percent line and the riskiest claim |
| 3:09 | Unser starts slide 7 | Unser drops the salary sentence; says "about ten practices cover the cost; price is the risk" |
| 4:00 | Raj starts slide 8 | **Hard rule:** by 4:04 Unser hands over mid-sentence if needed. Raj keeps both sentences word for word, the wedge and the ask; drops the success line (it stays on the slide) |

Handoff lines: Raj → Viha: "Viha will show you what our made-up patient, Alex, does instead." / "Alex builds the tree one side of the family at a time…". Viha → Unser: "…Uncle Dev says angina at about 58. Unser?" / "Against what each person uses today…". Unser → Raj: "…New York is our pilot, not our market." (turns to Raj) / "People will buy it because…". Stand in speaking order (Raj, Viha, Unser), pass one clicker, never say "next slide".

No live demo inside the five minutes: the PDF is what gets graded and uploaded, and the relative path leaves our site for the sandbox launch. Keep the production `/tree` page open on one laptop for Q&A only.

---

## Appendix: backup slides (after a divider slide titled "Backup for questions"; not presented)

These also serve the Milestone 4 PDF. Full detail is in `vca.md`.

### A1 · Business Model Canvas

- **Story title:** A new product inside an old, proven business model.
- **On-slide:** the standard 9-box canvas grid. Top 3–5 Post-its per box, each as `sub-group rank [tag] text` (ranks restart at 1 in each sub-group); footer `88 Post-its: 2 N · 17 N/O · 69 O. Full canvas on the Miro board.`

| Box | Post-its shown on the slide |
| --- | --- |
| Key Partnerships | 1 [O] 1–3 independent NYC cardiology groups as pilot sites · 2 [O] Clinical reviewers to recruit: a cardiologist, a genetics counselor · 4 [O] BAA vendors: Vercel Pro, Neon, Amazon SES · 6 [N/O] SMART Health Links and CMS-aligned receiving EHRs |
| Key Activities | 1 [O] Sell paid pilots to practice managers · 2 [O] Measure completion, relative replies, staff minutes, clinician use · 3 [N/O] Keep each relative's consent, declines and deletions straight · 7 [O] Operate as business associate: BAAs, MFA, audit, breach plan |
| Key Resources | 1 [N] Data model: every fact stores status and source · 2 [N/O] Cardiology rule set, cited and versioned by guideline year · 3 [O] Working prototype with real SMART on FHIR sandbox launch · 5 [O] 21 logged interviews; 1 target patient; no buyers yet |
| Value Propositions | Patient 1 [N/O] Who, what, what age, before the cardiology visit · Patient 3 [N/O] Relatives answer for themselves by link, no account · Patient 4 [N] Every fact marked known, conflicting, unknown or declined · Clinician 1 [N/O] Clinician gets one page: criteria, gaps, conflicts, pedigree · Practice 1 [O] More family history in the chart before visit one |
| Customer Relationships | Practice 1 [O] Paid 12-week founding pilot, metrics agreed upfront · Patient and relative 1 [O] Help line for patients and older relatives · Patient and relative 3 [N/O] Relatives: one-time link to answer, decline, correct, delete |
| Channels | Patients 1 [O] Practice texts our link with new-patient paperwork · Relatives 1 [N/O] Patient texts each relative a link from own phone · Page 1 [O] Practice opens the care-team page by link or QR · Buyers 1 [O] Founders call and visit NYC practice managers |
| Customer Segments | Pays 1 [O] Independent NYC cardiology groups, 2–10 cardiologists · Pays 2 [O] Practice manager holds budget; owner cardiologist signs · Users 1 [O] Adult new patients, in the weeks before visit one · Users 3 [N/O] Adult relatives who answer for their own branch |
| Cost Structure | Pilot 1 [O] Hosting + database under BAAs: $411–457 a month · Pilot 2 [O] Cyber + tech E&O insurance: about $255–305 a month · Pilot 4 [O] Total about $689–834 a month; per-practice cash ≈ 0 · Pilot 5 [O] Founder support: 1–2 h per practice monthly, unpaid |
| Revenue Streams | Practices 1 [O] $1,000 founding pilot, 12 weeks, credited to year one · Practices 2 [O] Then $500 per cardiologist per year · Practices 3 [O] Tested on same card: $99 per cardiologist per month · Never 1 [O] Never: patient fees, ads, data sales, per-referral pricing |

- **Visual:** canvas grid in the deck theme; sticky color by tag (pick three colors and show the legend).
- **If asked (notes):** "Every sub-group is ranked from 1. The new parts are all in what we sell; the way we sell copies Phreesia."

### A2 · Points of comparison

- **Story title:** We copy Phreesia's operations and refuse pharma money.
- **On-slide:** three panels.
  - **Next best option:** Patient: memory + the intake form; Relative: a phone call; Clinician: a quick question; Practice: its own EHR check-in [S52] or form, Phreesia intake free through at least 2026 [112], IntakeQ $54.90/mo [114], free lab tools [107], FamGenix (free up to 20 pedigrees; $500/yr; questionnaires and cardio model extra) [111].
  - **Closest operations: Phreesia.** Sells to practices; practice-sent link "a few days before your appointment" [S43]; lands in the chart; ~180M visits a year, FY2026 revenue $480.6M [S29][113]. Runner-up for the clinical half: CancerIQ (cancer, health systems) [110].
  - **Where the model already works:** Calendly (no-account link) [S34] · DocuSign (audit trail) [S36][S37] · Zocdoc (consumer free, independent practice pays) [S32]. Refuse: Zocdoc's per-new-patient fee, Doximity's pharma payer [S42]. **Also borrowed (different payer):** Ancestry/MyHeritage (relatives add to one tree) [S38][S39] · TurboTax (guided interview, import then confirm) [S44].
- **Visual:** three columns with small logos replaced by plain text labels (no third-party logos needed).

### A3 · Net benefit vs next best option

- **Story title:** Patients gain most; the practice is unproven.
- **On-slide table:**

| Who | Next best option | Gain | Cost | Net |
| --- | --- | --- | --- | --- |
| Patient | Memory, a call to Mom, the intake form | Guided by side of family; relatives answer; one page | About half an hour on average [90]; asking family | + when the practice asks |
| Relative | A phone call | Answer once, for yourself; can decline | Minutes; trusting a health link | 0, unproven |
| Clinician | Asking in the visit; EHR box | Who, what, what age, how sure; criteria for review | One more document; self-report 57.6% sensitive [87] | +? if < 1 min scan (no cardiologist asked yet) |
| Practice | EHR check-in or form; free intake and lab tools; FamGenix $500/yr | More history reaches the chart: new family history documented for 16.1% vs 0.2% (emailed questionnaire + EHR upload, Toronto primary care, within 30 days of the visit) [S10] | Fee vs free; workflow; BAA; no billing code [103][105] | ? not proven |

- **Score line:** `Scores (VCA 4.2, quality of what reaches the visit counted double): patient +2 · relative 0 · clinician +3 with a < 1 min scan · practice −2 + unmeasured staff time.`
- **Verdict line:** `Use: yes, if the practice sends the link. Buy: not yet shown.`
- **ROI footnote (assumption):** `If 10 staff minutes are saved (unproven; [S9] found no time difference) × $30/h ≈ $5 per summary; Medicare FFS median ≈ 4 new patients per cardiologist per month [S17] × 5 for all payers (our guess, to check on manager calls) ≈ 21 × 40% ≈ $42/month ≈ $500/yr. At $500/yr the practice only breaks even, so time savings don't set our price; FamGenix's $500/yr [111] does.`

### A4 · Financials

- **Story title:** The pilot pays for itself; a salary needs a bigger market.
- **On-slide:** two tables.

| Operating cost per month (real data) | Low | High |
| --- | ---: | ---: |
| Hosting + database under BAAs (Vercel Pro + $350 HIPAA add-on, Neon Scale) [61][64] | $411 | $457 |
| Email, storage, domain, team inbox [S19][S25] | $23 | $72 |
| Cyber + tech E&O insurance (estimate) [S21][S22] | $255 | $305 |
| Epic registration, SMS, founders | $0 | $0 |
| **Total** | **$689** | **$834** |

| Price per cardiologist | $500/yr (lead) | $99/mo (tested) | $149/mo |
| --- | ---: | ---: | ---: |
| Break-even, paying cardiologists | 17–21 | 7–9 | 5–6 |
| Break-even, 2-cardiologist groups | 9–11 | 4–5 | 3 |
| One salary (BLS median wage $135,980, before payroll taxes and benefits [S23]), cardiologists | ~290 | ~123 | ~82 |

- **Support line:** `Founder support time (unpaid now): 1–2 h per practice per month; at $65/h (BLS median $135,980 ÷ 2,080 h [S23]) that is $65–131 a month, against $83 a month from a 2-cardiologist practice at $500/yr.`
- **Year 1 line:** `Three $1,000 pilots ($3,000) cover 12 weeks of the BAA stack (~$1,900–2,300). Year 1 (Oct 2026–Sep 2027) nets −$200 to −$6,500 depending on uptake; founders unpaid.`
- **Verdict:** `Cheap to run, small to earn. Yes at pilot scale; not yet salaries. Support must fall under 1 hour per practice a month, or the price must rise.`

### A5 · What's new and what's old

- **Story title:** What we sell is new; how we sell it is old.
- **On-slide:** bar or tally: `N 2 · N/O 17 · O 69 (88 Post-its)`. Two lists: `New: per-fact status · the data model behind it` / `Some of each: relatives answer for themselves · one portal fact from a relative · guideline criteria on the clinician's copy only · patient-sent relative links · per-relative consent · "reviewed" lock`. Footer: `The new parts are the ones that need evidence: relatives answering [93], portal facts, clinicians trusting a patient-built page.`

### A6 · Wedge scoring

- **Story title:** Independent cardiology scores highest, by our judgment.
- **On-slide table:**

| Wedge | Pain | Access | Cycle | Burden | Evidence | Expansion | Total /30 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Independent NYC cardiology** | 3 | 4 | 4 | 3 | 3 | 4 | **21** |
| Primary care wellness visits | 2 | 3 | 3 | 3 | 3 | 5 | 19 |
| Direct to consumer | 3 | 1 | 5 | 4 | 2 | 2 | 17 |
| Cardiogenetics clinics | 5 | 2 | 1 | 2 | 2 | 3 | 15 |
| Lipid / FH cascade clinics | 4 | 2 | 2 | 2 | 1 | 4 | 15 |
| Sports pre-participation | 2 | 2 | 2 | 1 | 1 | 2 | 10 |

- Footer: `Team judgment, 1–5, before any manager call. If access is 2 instead of 4, primary care ties. Our deciding reason: cardiology criteria need which relative and what age [76][72].`

### A7 · Competitors

- **Story title:** We found no product that does all four.
- **On-slide table** (from research §4.5; "not documented" means the vendor's public pages don't say):

| | Relatives answer for themselves | Per-fact status and source | Fact from a relative's portal | Cardiology one-pager for the clinician | Price |
| --- | --- | --- | --- | --- | --- |
| Stemma | Yes | Yes | Yes (sandbox) | Yes | $500/cardiologist/yr (to test) |
| FamGenix | Partly: invited relatives share and update their own data in its app [S31] | Not documented | Not documented | Cardio risk model (QRisk) at an extra fee [111] | Free up to 20 pedigrees; Individual $500/yr; questionnaires and cardio model extra [111] |
| My Family Health Portrait | No | No | No | No | Free; original host offline Apr 2026 [97][S7] |
| Invitae Family History Tool | No | No | No | Cancer focus | Free [107] |
| Phreesia / IntakeQ | No | No | No | General intake | Free through at least 2026 [112] / $54.90/mo [114] |
| MyChart eCheck-In | No (patient alone) | No | n/a | Inside Epic | Health system; opens up to 7 days before the visit [S4] |

- Footer: `Say "we found no", not "there is no". FamGenix is the closest product.` Run the FamGenix hands-on test (open item 12) before Oct 16.

### A8 · Evidence and interviews

- **Story title:** Our evidence is strong for use and empty for payment.
- **On-slide:** `21 logged interviews from our September diagnosis research: 15 patients; internist, RN, 2 PAs, ER doctor, genetics counselor. Target-user interviews: 1 (ID007).` Five spoke to family history: ID007 (cardiac; the core story), ID006 (a specific question surfaced a mother's condition), ID002 (family history among the most important factors), ID010 (a flagged, scannable summary; much higher value outside the ED, such as primary care, note), D021 (types every relative into Progeny by hand; ~20% questionnaire return; doubts patients can build pedigrees and favors a guided flow, note; "There has to be a human in the loop to make the judgment about what matters"). `Gap: 0 practice managers · 0 cardiologists · 0 relatives.` Key literature tiles: 57.6% [87] · 11% (UK GP records) [89] · 99.8% vs < 4% [84] · 64.2% engaged; 89.4% of them finished (57% of invited) [92] · 7.8% enrolled (research consent) [91].

### A9 · Market and expansion

- **Story title:** NYC is our pilot; growth comes from bigger buyers.
- **On-slide:** `US independent cardiology: 7,699 cardiologists [99] → $3.8M/yr at $500; $9.1–13.8M at $99–149/mo` · `NYC independent: 285–320 cardiologists (re-run Oct 6) [S27] → $142–160k/yr at $500` · both tiles note `(organizations of ≤ 100 clinicians, a proxy; includes some hospital practices)` · Path: `3 pilot groups → rest of ~19–20 NYC groups → large independent and PE groups → health-system genetics and lipid clinics → primary care wellness visits [104]`.

### A10 · Privacy and safety lines

- **Story title:** Synthetic now; a business associate the day practices pay.
- **On-slide:** `Prototype uses synthetic data only.` · `When a practice pays: we become a HIPAA business associate; BAAs with practices and vendors; MFA; audit log; breach plan (30 days NY, 60 days FTC) [35][36][43]` · `Each relative owns their branch: decline, correct, delete` · `Patients see facts, gaps, questions. Guideline criteria appear only on the care-team copy, addressed to the clinician (FDA CDS guidance, Jan 2026) [95]; a care-team page carried by the patient is a question for counsel` · `No ads, no data sales, no insurer or employer channels (GINA gaps [51])`.

### A11 · Pilot design

- **Story title:** One number decides the pilot: completion before visit one.
- **On-slide:** Offer: `$1,000 flat, 12 weeks, credited to year one; then $500 per cardiologist per year; BAA first; no auto-renew`. Metric zero (by Oct 23): `5 manager conversations · 3 name the budget owner and accept $500/yr in principle · 1 signs a non-binding letter of intent with a target start month (paid letter once we have a company, BAA template and insurance)`. Pilot metric 1: `Of invited adult new patients whose first visit falls in weeks 2–12, ≥ 40% have a patient-reviewed summary in the chart before that visit; read at weeks 6 and 12 (day 1: also text patients already booked)`. Checks: `clinician rating ≥ 4/5, scan < 60 s · ≥ 25% get a relative's answer · staff minutes measured · ≤ 2 alerts per summary · founder support minutes per practice`. Go/no-go week 12: `go if metric 1 ≥ 40% and ≥ 1 of 3 signs annual; high completion but no payer → switch buyer; < 20% → fix the flow`. Critical path (proposed): `company formed Nov 15 · counsel reviews BAA and privacy policy Dec 1 · cardiologist signs rule table Dec 15 · pilot backend on synthetic data Dec 15 · BAA stack and insurance live Jan 5` (owners by role in `vca.md` 5.2; names to assign).

### A12 · The full care-team page

- **Story title:** The whole page, for anyone who wants to read it.
- **Visual:** full uncropped care-team summary for the demo family (redesigned site), with the synthetic-data watermark visible, in a plain gray frame.

---

## Q&A bank

One person answers, in about 20 seconds, then stops. Default owners: Raj (problem, interviews, privacy, safety, technical), Viha (product, relatives, competitors), Unser (buyers, price, costs, market).

| # | Question | Answer | Owner · backup |
| --- | --- | --- | --- |
| 1 | Why would a practice pay when intake tools and lab pedigree tools are free? | Maybe it won't; that's our riskiest claim and our next test. Free tools don't have relatives answering for themselves, a source on every fact, or a cardiology page, and FamGenix's patient questionnaire and cardio model cost extra on top of its $500 [111]. If managers say no but patients finish, we switch buyers to genetics and lipid clinics or primary care. | Unser · A3, A11 |
| 2 | How is this different from FamGenix, the government's free tool, or MyChart's questionnaire? | We found no product that does all four: relatives answer for themselves, every fact keeps its source and status, one fact can come from a relative's own portal, and the clinician gets a cardiology one-pager. FamGenix comes closest: invited relatives can share their own data in its app [S31]. MyChart's eCheck-In is the patient alone, from memory, up to 7 days before the visit [S4]. | Viha · A7 |
| 3 | Isn't self-reported family history unreliable? | Often, yes: self-reports caught only 57.6% of heart attacks in parents and siblings [87]. That's why every fact shows who said it and how, relatives answer for themselves, and the clinician decides what matters. | Viha · A8 |
| 4 | What if relatives don't answer, or grandparents can't use a phone? | The tree still works; gaps show as unknown, never as "no history". We ask for relatives only after the patient has a usable page, because that's where people drop off (29% in a similar app [93]), and we'll run a help line for older relatives. | Viha · A11 |
| 5 | Is it HIPAA compliant? What about relatives' privacy? | There's no HIPAA certification [55]. Today the prototype holds synthetic data only. When practices pay, we become a business associate with BAAs, two-factor login and audit logs [35], and each relative controls and can delete their own branch. | Raj · A10 |
| 6 | Is this a medical device? Are you giving medical advice? | Patients see facts, gaps and questions, never risk scores. Guideline criteria appear only on the care-team copy, addressed to the clinician, each citing its guideline and year, following FDA's January 2026 decision-support guidance [95]. The clinician decides. Whether a printed care-team page in the patient's hands changes that is a question we're taking to counsel, so the care-team copy goes to the practice by link or fax. | Raj · A10 |
| 7 | Does it pull family history from MyChart? How does it get into Epic? | No. Portals aren't required to share family history, so a relative shares one condition from their own problem list with their own login [7][10]. Epic has no API to write family history, so the page goes in as a PDF first. | Raj · A10 |
| 8 | Isn't the market tiny? | Independent cardiology alone, yes: about $3.8M a year in the US at $500 per cardiologist, and New York is a pilot, not a market [99]. It's the wedge; growth is larger groups, health-system clinics and primary care, where the Medicare wellness visit requires family history [104]. | Unser · A9 |
| 9 | Why independent cardiology, not Weill Cornell, the ER or primary care? | Cardiology guidelines are written in our fields: which relative, what condition, what age [76][72]. The ER doctor we interviewed said family history matters there only for a few red flags, and pointed us to primary care as the bigger user (ID010, note). We agree; it's our expansion market. We start in cardiology because the guideline criteria need exactly the fields we capture, and one practice manager can say yes. Two in three hospital executives said selecting a digital tool takes six months or more (2022 survey [S46]). | Raj · A6 |
| 10 | How many people did you talk to? Any cardiologists or practice managers? | 21 logged interviews from our September diagnosis research: 15 patients and 6 clinicians. One patient was a cardiology patient (ID007); five interviews touched family history. No cardiologist, practice manager or relative yet. That's the gap we're closing before our Milestone 4 review. | Raj · A8 |

Two more if there's time: **"Does it save the practice time?"** Unproven; a 2026 trial found no difference in counseling time with a pre-visit tool [S9], so we'll measure staff minutes in the pilot instead of claiming it, and time savings don't set our price (Unser). **"Who built it, and can you maintain it?"** Be direct: the code was written with an AI coding assistant (the git history shows it), the team member who owns the code explains the architecture, and the logic tests pass (code owner).

---

## Open items for the team (facts only you can confirm)

1. **Interview count.** The earlier "What we heard" slide (`slides/build-what-we-heard.cjs`, `.pptx`, `.png` in the repo) still says 30; Team Hub logs 21 (ID001–ID020 and D021). Log the other 9 with IDs and notes before Oct 16, or change that slide to 21 and keep it out of the backup and the Milestone 4 PDF until then. The script above says 21.
2. **Practice-manager calls.** Has any practice shown interest? Team Hub records none, and Milestone 1 promised at least 3 owner or manager interviews. Results of any calls before Oct 16 go on slide 6 (template lines provided). Never say "booked" unless booked. The ask is a non-binding letter of intent until we have a company, a BAA template and insurance.
3. **Any cardiologist** who has seen the one-pager? Run the clinician scan test (VCA test 2) with at least 2 cardiologists or cardiology PAs before Oct 16 and put the result on slide 6 and A8.
4. **Target-user interviews.** Only ID007 is a cardiology patient. Interview 5 adults who had a first cardiology visit in the past year: what the form asked, whether they were sent to ask relatives, whether they'd answer a practice link. Log them as ID022 onward.
5. **Grading criteria.** The four criteria (Analysis, Mockup, Central business logic, Execution and participation) are in `maker-day-2-rubric.md`, transcribed from the course site.
6. **Speaker split.** Default: Raj 1, 2, 8; Viha 3–5; Unser 6–7. If the code owner should present slide 7, swap Raj and Unser on slides 7 and 8. Decide by Oct 12. Name the code owner for Q&A, who can explain the architecture and the AI-assisted build without notes.
7. **Demo family after the redesign.** Scripts use Alex, Mom, Dad, Uncle Dev (atrial fibrillation at 34: condition from his portal record, age from his answer), Grandma Rosa (very high cholesterol about 35), Grandpa Ray (unknown), Grandma June (declined to share), Grandpa Luis (not asked yet), and the redesign's status words (Known, Reports disagree, Unknown, Declined to share, Not asked yet). Update scripts if the redesign changes names, ages or labels.
8. **Product fixes before the screenshots (redesign).** (a) **Care-team copy:** today printing produces the care-team copy and the patient can preview it (`SummaryPage.tsx`). Make the patient's Print button print the patient's copy, remove the patient-side care-team preview, and send the care-team copy only by the read-only link or QR the practice opens (or fax). If that can't ship, ask counsel before showing a patient carrying the care-team page, and keep slide 5's wording ("the one the practice files"). (b) **Grandma Rosa's label** (`src/lib/clinical.ts`, `BASIS.fh` and the `explicit && (first || second)` rule): for second-degree relatives use "Simon Broome criteria (first- or second-degree adult relative with total cholesterol > 290 mg/dL; level not reported)"; use Dutch Lipid Clinic only for first-degree relatives; drop the cascade-screening line for adults. (c) **Invite text** (`PersonPanel.tsx`): no health information ("heart history", the visit specialty) and no "It takes about 2 minutes" (unmeasured). Suggested: "Hi, it's {patientName}. I'm putting together our family health history and would love your help. Here's a private link; you can answer, skip, or say no: {url}". (d) **Screenshot cutoff:** if the redesign is not on production by end of day Oct 13, capture slides 3–5 and A12 from the current production build that day and update the scripts to match its labels (item 7).
9. **The intake-form crop.** OK to show a named institution's public form with credit? If not, rebuild a neutral grid captioned "Example intake grid" and keep [S5] in the footnote. Before Oct 16, download posted new-patient forms from 5 independent NYC cardiology groups on the [S27] list, report what they ask (for example "k of 5 ask age, 0 of 5 ask side"), use one of them for the slide 2 crop if it fits, and reword the first business-logic clause if they differ. Ask each practice manager for their own form and EHR check-in.
10. **Presenting setup.** From the uploaded PDF on a course machine, or your own laptop? Clicker available? Upload the PDF by noon on Oct 16 and open it on another device to check fonts and crops.
11. **Screenshots.** Capture from the production URL (no dev badge), reset the demo family first, keep the synthetic-data banner in at least one shot per slide, put them in plain gray frames, and save uncropped versions for the Milestone 4 PDF (the six screens listed in `vca.md`, "Mockup screens").
12. **FamGenix hands-on** (free tier, one synthetic cardiac family) before Oct 16, so the comparison isn't from its marketing pages and app-store listing.
13. **Company and counsel.** A practice will expect a company, not three students, to sign the BAA and send the invoice (NY LLC publication rules [S53]). Agree who forms it and when (proposed Nov 15), and book a Cornell law clinic for the BAA template, privacy policy and the care-team page question.
14. **Label the genetics counselor D021** (not ID021) and keep her first name off slides. She has not agreed to review anything; don't list her as a reviewer.
15. **Name and trademark.** "Stemma" is fine as a class-project name, but there is a pending US trademark application for **STEMMAMD** (Stemma Inc, filed Aug 25, 2026, classes 9 and 38, patient medical-information software), close to our name and our field. Ask counsel (item 13) for a clearance search before incorporating, registering a domain or filing under the name, and keep a fallback name ready. The plain word STEMMA is also a live US registration (Teradata US, Inc., Serial 90801129, class 42, data-catalog software): a different field, but the clearance search should cover it.

---

## Choices made where the research memos disagreed

| Topic | Memos | Choice |
| --- | --- | --- |
| Deck look | R1 said build in the website's visual language; R2–R6 and the user said the deck is separate | **Deck keeps the Maker Day 1 theme**; only the screenshots on slides 3–5 and A12 come from the site. No deck-colored legend next to a screenshot and no website thumbnail on slide 8 |
| Lead price | Research and R3: $99–149/cardiologist/month; R2 and R5: $500/yr | **$500/yr after a $1,000 pilot; $99/mo tested.** $500/yr is the only public per-clinician anchor [111]; staff-time savings are unproven [S9], so they don't set the price |
| "People will buy it because…" | Earlier draft: "intake forms ask yes or no… gets relatives' own answers"; reviewers: name the buyer, match the form, drop the untested clause | **"…cardiology practices need which relative, what condition and what age, their intake forms take it from memory, and a link they send gets those details, each with its source, into the chart before visit one."** Same words on slide, script and board |
| "We can make it because…" | R3: "three paying practices cover that cost"; earlier draft: "the core loop already runs" | Dropped R3's (true only at $149/mo). Now "the patient side already runs", since the pilot backend is not built, plus "about ten two-cardiologist practices cover with founders unpaid" |
| Relative on slide 4 | R6: Grandpa Luis | **Uncle Dev**: in the demo data he is the one with a portal fact, he is also the source of the conflicting report about Dad, and his early atrial fibrillation mirrors ID007's uncle |
| Slide 2 numbers | R6: "4 in 10 heart attacks missed" + 11%; R1: CDC 15.2% | **1 in 7 (15.2%, 2024 data) and 11% (UK, 1998–2008)** on the slide; 57.6% held for Q&A 3 |
| What the form shows | R1: one blank box, no grandparents/aunts/uncles | Opened the form [S5]: after the yes/no grid it asks for type and age of onset on free-text lines, and about sudden death. Slide says what holds: a yes/no grid plus a few lines for details, no side of family, no "not sure". It is a 2016 health-system form |
| Slide 6 tile 2 | Earlier draft "64% → 89%" read as a rise | **57% of invited finished** [92], with the setting on the label |
| "Staff retype it" (R6 slide 2) | Rests on D021, a cancer genetics program | Replaced with "a quick question in the room" [117] |
| Pilot terms | R6: 1–3 groups, $500–1,000, 8–12 weeks; R5: $1,000, 12 weeks | **$1,000 for 12 weeks**, fallback $500 for 8 weeks; a letter of intent first |
| Phreesia free period | Research: through Dec 31, 2026; R4: spring 2027 | Page says both; we say "free through at least 2026" |

---

## Sources used in this file

**From `../research.md`** (fact-checked research, Oct 2, 2026; same numbers):

- [7] Epic, FamilyMemberHistory.Search (R4): https://fhir.epic.com/Specifications/Api?id=10159
- [8] Epic, Condition.Search (Problems) R4: https://fhir.epic.com/Specifications/Api?id=953
- [10] Epic API catalog: https://fhir.epic.com/Specifications/Selections
- [35] 45 CFR 160.103: https://www.law.cornell.edu/cfr/text/45/160.103
- [36] FTC, Complying with the Health Breach Notification Rule: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- [43] NY General Business Law 899-AA: https://www.nysenate.gov/legislation/laws/GBS/899-AA
- [51] NHGRI, Genetic Discrimination: https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination
- [55] Box HIPAA and HITECH FAQ: https://support.box.com/hc/en-us/articles/360044194833-Box-HIPAA-and-HITECH-Overview-and-FAQ
- [61] Vercel pricing: https://vercel.com/pricing
- [64] Neon pricing: https://neon.com/pricing
- [72] ACC, 2024 HCM guideline ten points: https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2024/05/06/15/12/2024-hypertrophic-cardiomyopathy-gl
- [74] ACC, 2026 dyslipidemia guideline overview: https://www.acc.org/latest-in-cardiology/articles/2026/07/01/01/prioritizing-health
- [75] ACC, "No Child Left Behind" (2026 pediatric lipid recommendations): https://www.acc.org/Latest-in-Cardiology/Articles/2026/05/19/15/49/No-Child-Left-Behind
- [76] ACC, "Power of the Pedigree" (2018 premature ASCVD definition): https://www.acc.org/latest-in-cardiology/articles/2021/01/05/13/15/power-of-the-pedigree
- [77] Family Heart Foundation, FH diagnostic criteria: https://familyheart.org/diagnosing-familial-hypercholesterolemia/clinical-diagnostic-criteria-for-healthcare-providers
- [79] 2023 ACC/AHA/ACCP/HRS AF guideline: https://pmc.ncbi.nlm.nih.gov/articles/PMC11095842/
- [84] MeTree pedigree quality, BMC Fam Pract 2014: https://europepmc.org/article/PMC/PMC3937044
- [87] SCAPIS, Eur J Epidemiol 2026 (PMID 42142221): https://pubmed.ncbi.nlm.nih.gov/42142221/
- [89] Dhiman et al., PLoS One 2014: https://europepmc.org/article/PMC/PMC3886986
- [90] MeTree implementation, BMC Fam Pract 2013: https://europepmc.org/article/PMC/PMC3765729
- [91] IGNITE rollout, Genet Med 2019: https://europepmc.org/article/PMC/PMC6281814
- [92] Nazareth et al., Obstet Gynecol 2021: https://europepmc.org/article/PMC/PMC8594498
- [93] ItRunsInMyFamily, Health Informatics J 2024: https://europepmc.org/article/PMC/PMC11391477
- [95] FDA, Clinical Decision Support Software guidance (Jan 2026): https://www.fda.gov/media/109618/download
- [97] My Family Health Portrait (NCI copy) and commit history: https://cbiit.github.io/FHH/html/index.html ; https://github.com/CBIIT/FHH/commits/master
- [99] CMS Doctors and Clinicians national file (modified 2026-08-18; team analysis via the API): https://data.cms.gov/provider-data/dataset/mj5m-pzi6
- [103] CMS, 2026 RVU file (October release): https://www.cms.gov/files/zip/rvu26d.zip
- [104] 42 CFR 410.15 (Annual Wellness Visit): https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-42.xml?part=410&section=410.15
- [105] MGMA, 2021 E/M changes: https://www.mgma.com/articles/preparing-your-practice-for-2021-e-m-changes
- [107] Invitae Family History Tool: https://www.invitae.com/familyhistory/
- [110] CancerIQ: https://www.canceriq.com/
- [111] FamGenix licensing: https://famgenix.com/licensing/
- [112] Phreesia free Intake offer: https://www.phreesia.com/?p=262
- [113] Phreesia FY2026 results: https://www.sec.gov/Archives/edgar/data/1412408/000141240826000074/phr-ex991q4fy26.htm
- [114] IntakeQ pricing: https://intakeq.com/pricing
- [117] Acheson et al., family history in primary care (CCJM): https://www.ccjm.org/content/ccjom/79/5/331.full.pdf

**Opened for the pitch work** (Oct 6, 2026 unless dated otherwise; "re-checked" = opened again by the lead writer):

- [S1] Kava CM, Julian AK, Vahratian A, Fletcher MR, Rim SH. "Knowledge, Perceptions, and Barriers to Collection of Family Health History Data." J Am Board Fam Med, 2026 (CDC/NCHS authors; NCHS Rapid Surveys System, Jan–Feb 2024). PMID 42049503. https://www.jabfm.org/content/knowledge-perceptions-and-barriers-collection-family-health-history-data (abstract re-checked via Europe PMC, Oct 6, 2026)
- [S2] AMN Healthcare, "New Survey Shows Physician Appointment Wait Times Surge: 19% Since 2022, 48% Since 2004," press release, May 27, 2025 (1,391 offices, 15 metros; cardiology 33 days). https://ir.amnhealthcare.com/2025-05-27-New-Survey-Shows-Physician-Appointment-Wait-Times-Surge-19-Since-2022,-48-Since-2004 (re-checked Oct 6, 2026)
- [S4] Atlantic Health System, "MyChart Tips: eCheck-In" (Epic MyChart patient guide, undated; opened Oct 6, 2026). https://mychart.atlantichealth.org/MyChart/en-us/docs/MyCharteCheckIn.pdf
- [S5] Weill Cornell Medicine Cardiology, "New Patient Visit Questionnaire," ver. 2-7-16, page 3 (family history grid and free-text lines). https://cardiology.weill.cornell.edu/sites/default/files/new_patient_visit_questionnaire.pdf (opened and read Oct 6, 2026)
- [S7] CDC, "PHGKB Application Offline" (My Family Health Portrait's original host; offline since April 13, 2026), last reviewed Sept 9, 2026. https://phgkb.cdc.gov/FHH/html/index.html
- [S9] Orlando LA et al. "Streamlining Inherited Cancer Identification via an EMR-Integrated Risk Assessment Platform: A Nonrandomized Clinical Trial." JAMA Network Open, 2026. PMID 42054024. https://europepmc.org/article/MED/42054024
- [S10] Carroll JC et al. "An Innovative Strategy for Collecting Family Health History: An Effectiveness-Implementation Trial in Primary Care Clinics." Annals of Family Medicine, 2025. PMID 40983547. https://europepmc.org/article/MED/40983547
- [S17] CMS, Medicare Physician & Other Practitioners by Provider and Service, 2024 data year (data.cms.gov). Team analysis Oct 6, 2026: cardiology, codes 99203–99205, office setting, 13,087 cardiologists; median 51 new-patient visits a year. https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicare-physician-other-practitioners-by-provider-and-service
- [S18] Neon, Plans documentation (smallest compute 0.25 CU; HIPAA listed as an additional charge), opened Oct 6, 2026. https://neon.com/docs/introduction/plans
- [S19] Amazon Web Services, Amazon SES pricing ($0.10 per 1,000 emails), opened Oct 6, 2026. https://aws.amazon.com/ses/pricing/
- [S21] Insureon, "Cyber insurance cost" (small businesses $129/month average; IT businesses $179/month), updated Apr 24, 2026. https://www.insureon.com/business-insurance/cyber-liability/cost (re-checked Oct 6, 2026)
- [S22] Insureon, "SaaS business insurance cost" (tech E&O $126/month), updated Jun 24, 2026. https://insureon.com/technology-business-insurance/saas-companies/cost (re-checked Oct 6, 2026)
- [S23] US Bureau of Labor Statistics, Occupational Outlook Handbook, Software Developers (median annual wage $135,980, May 2025). https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm (re-checked Oct 6, 2026)
- [S25] AccountableHQ (secondary), "Google Workspace HIPAA cost," found Oct 6, 2026 ($7/$14/$22 per user per month; not confirmed on Google's page). https://www.accountablehq.com/post/google-workspace-hipaa-cost-pricing-baa-requirements-and-plan-options
- [S27] Team analysis of the CMS Doctors and Clinicians national file [99], pulled Oct 2 and re-run Oct 6, 2026: 7,699 of 29,847 cardiologists in organizations of 100 or fewer (a proxy for independent; it includes some hospital practices); 2,152 such organizations with a median of 2 cardiologists; NYC 285–320 independent cardiologists (research.md's Oct 2 figure was 280–320), 122 small organizations (83 with one cardiologist), 39 organizations with 2+ independent cardiologists (144 cardiologists; median 2 per group; the mean of 3.7 is pulled up by two groups with 28 and 13), 22 where cardiologists are at least half the clinicians. The 39 include hospital-linked organizations (for example Maimonides Cardiology FPP, TBHC Medical Services PC of The Brooklyn Hospital Center, Icahn School of Medicine at Mount Sinai, and the Hospital for Special Surgery's legal entity); about 19–20 cardiology-focused groups remain after removing them (to confirm by phone). https://data.cms.gov/provider-data/dataset/mj5m-pzi6
- [S28] Live prototype checks, Oct 6, 2026: routes /, /tree, /summary, /invite, /view, /research, /how-it-works return HTTP 200; 10 of 10 logic tests pass; SMART launcher responds; CSP and Referrer-Policy headers present. Now at https://stemmahealth.vercel.app (checked at the earlier address, https://family-health-tree-raj-s-projects12.vercel.app, which still works)
- [S29] Phreesia, Form 10-K for fiscal 2026 (about 180 million patient visits; direct sales; sales cycles of three to twelve months; integrates with most major EMR and PM systems). https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm
- [S31] FamGenix Family Health History, Apple App Store listing (seller FamHis, Inc; "Invite and share data with other family members"; version 4.0.0, Feb 11, 2025; 15 ratings), opened Oct 6, 2026. https://apps.apple.com/us/app/famgenix-family-health-history/id1483520084
- [S32] Zocdoc, "Pay-per-booking fees explained," The Paper Gown, Dec 17, 2025. https://thepapergown.zocdoc.com/facts/pay-per-booking-fees-explained/
- [S34] Calendly, pricing page ("meeting invitees do not require a seat"), opened Oct 6, 2026. https://calendly.com/pricing
- [S36] DocuSign, eSignature plans and pricing (recipients "do not need an account to sign"), opened Oct 6, 2026. https://ecom.docusign.com/plans-and-pricing/esignature
- [S37] University of Texas at Austin, "Verifying Signatures | DocuSign" (Certificate of Completion records signer, time, IP). https://docusign.utexas.edu/verifying-signatures
- [S38] Ancestry Support, sharing a family tree (roles guest, contributor, editor; free account needed). Page returned 403; read from search-result text Oct 6, 2026. https://help-redir.ancestry.com/hc/en-ca/articles/53933335357843
- [S39] MyHeritage Education, "How To Get the Most Out Of Your Family Site," undated. https://education.myheritage.com/article/how-to-get-the-most-out-of-your-family-site/
- [S42] Doximity, Form 10-K for fiscal 2026 (free for US medical professionals; customers primarily pharmaceutical manufacturers and health systems). https://www.sec.gov/Archives/edgar/data/0001516513/000151651326000025/docs-20260331.htm
- [S43] Pediatrix Medical Group, "Phreesia FAQs" (patient page: "Your doctor's office will send you an e-mail/text message from Phreesia a few days before your appointment"). https://www.pediatrix.com/pay-my-bill/patient-tools/phreesia-faqs
- [S44] Intuit TurboTax Support, "How do I import or enter my W-2?", updated July 7, 2026. https://ttlc.intuit.com/turbotax-support/en-us/help-article/import-export-data-files/import-enter-w-2/L55HzdeDr_US_en_US
- [S46] Southwick R. "Many hospital executives don't have a digital strategy: report." Chief Healthcare Executive, Apr 26, 2022 (Sage Growth Partners survey of 100 hospital executives: 31% say 6–9 months, 15% 9–12, 20% over a year to select a digital tool). https://www.chiefhealthcareexecutive.com/view/many-hospital-executives-don-t-have-a-digital-strategy-report
- [S52] athenahealth Help, "Family History" (practice setting that shows family-history questions to patients in Enhanced Self Check-in), opened Oct 6, 2026. https://help.athenahealth.com/Ohelp/Content/C_Family_History_PH.htm
- [S53] New York Department of State, "Certificate of Publication for Domestic Limited Liability Company" ($50 filing fee; publish in two newspapers within 120 days of formation, LLC Law §206), opened Oct 6, 2026. https://dos.ny.gov/certificate-publication-domestic-limited-liability-company-0
- [S54] Nazareth S et al. "Hereditary Cancer Risk Using a Genetic Chatbot Before Routine Care Visits." Obstet Gynecol 2021 (full text: link sent "typically 5 days before an upcoming appointment"; reminders at 72 and 24 hours; funded by Ambry, Invitae and Progenity). Same study as research [92]; full text re-read Oct 6, 2026. https://europepmc.org/article/PMC/PMC8594498

**Other evidence:** Team Hub export (interview logs ID001–ID020 and D021; Milestone 1 track decision; advisor notes of Sept 9, 2026); `docs/mvp-spec.md`; prototype code (`src/lib/demo.ts`, `src/lib/clinical.ts`).
