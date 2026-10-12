# Maker Day 2 pitch: Stemma, the family health tree

Team 709 · Section 7 · TECH 5900 Product Studio · Maker Day 2, Oct 16, 2026 (slides as one PDF by 5:00 pm Oct 16)
Raj Kashikar · Viha Srinivas · Unser Jaffry · Final deck of Oct 12, 2026 (renamed Stemma on Oct 7; revised on Oct 12 so the PDF stands alone without presenters)

**The deck is the source of truth.** The final deck is the Google Slides file `1JGhz-94qJGlWLe-9ZmBesYhjJp6ZIuggMYgFx6BK6kM` ("Team709_MakerDay2_Stemma"): 9 main slides, a divider, and backup A0 to A12. This file copies every slide's text and speaker notes from it word for word (read live on Oct 12, 2026, revision `tLDff4ET2Ki_Mw`). If the deck and this file ever differ, the deck wins; update this file.

**How to read this.** `[n]` = numbered source in `../research.md` (the deck links them at stemmahealth.vercel.app/research). `[S#]` = source opened for the pitch work; the full list with URLs is at the end of this file and in `value-creation-analysis.md`. Interview IDs (ID001–ID020, D021) match the Team Hub "Interview Logs"; the site's anonymized /research/interviews tab lists the same 21. "(notes)" = the note-taker's wording. Canvas tags: **[N]** new, **[N/O]** done elsewhere, new here, **[O]** old (Phreesia or a competitor does it). On-slide text is in `code` spans, one span per paragraph; the speaker notes are in text blocks, and the quoted paragraph at the top of each is the script.

**Honesty rules (the same as the deck).**
- The prototype uses synthetic data only. Everyone shown is a synthetic demo family.
- Never say "HIPAA compliant" or "certified". When a practice pays, we become a HIPAA business associate under signed BAAs.
- Status words, exactly: Known · Reports disagree · Unknown · Chose not to share · Not asked yet.
- Nobody uploads medical records. A relative can share one condition, read-only, from their own patient portal (a public test server today).
- Interviews: 21 logged; 0 practice managers, 0 cardiologists, 0 relatives.
- Price: $1,000 for a 12-week pilot, credited to year one, then $500 per cardiologist a year; free to patients. $99 a month is a higher price we test on the same card. A4 also models $149 a month (our first guess); it is not on the price card.
- Positioning: the wedge is 3 independent NYC cardiology groups; the vision is any doctor who needs a family history, one specialty at a time. The product works for any doctor's visit (a general question set, no criteria); clinician criteria exist for cardiology only. Never "criteria for any physician".

**Deck look.** The deck has its own look, not the website's: white slides and a dark #1F2937 cover; Cambria bold navy titles; a 10 pt orange-red (#C2410C) caps kicker; Calibri body; "Team 709" at 9.5 pt top right on every slide except the cover; an 8 pt page counter bottom right ("2 / 9  ·  Customer and problem" on the main slides, "Backup A3  ·  Net benefit" in the backup); 7.5 pt gray footers. Status chips are drawn in the deck only on slide 1. The only things taken from the website are the screenshots on slides 4–6 and A12 (`public/pitch/`), in plain frames, and the slide 9 QR code; the screenshots show the app's own status labels, so no deck-colored legend sits next to them.

**Main deck: 9 slides, about 4:45 of talk** (4:39 of speech at 0.43 s per spoken word, the team's own rate, with numbers counted as spoken, plus three handoffs of about 2 s; about 15 s of slack before the 5:00 hard stop). Raj 1:46 (slides 1, 2, 9), Viha 1:25 (slides 3–6), Unser 1:28 (slides 7–8). Every member presents. The clock column includes each handoff.

| # | Slide (element id) | Title on the slide | Speaker | Seconds | Clock at end |
| ---: | --- | --- | --- | ---: | ---: |
| 1 | Title (`s01_pg`) | Stemma | Raj | 19 | 0:19 |
| 2 | Customer and problem (`s02_pg`) | Patients know heart trouble runs in the family, not who or when. | Raj | 39 | 1:00 |
| 3 | How Stemma works (`s02b_pg`, new) | The practice sends the patient a link; relatives answer; the practice gets a page. | Viha | 20 | 1:20 |
| 4 | Mockup 1, the patient (`s03_pg`) | The patient builds the tree by side of family, uncertainty included. | Viha | 19 | 1:39 |
| 5 | Mockup 2, the relative (`s04_pg`) | Relatives answer for themselves, on their phone, with no account. | Viha | 15 | 1:54 |
| 6 | Mockup 3, the visit (`s05_pg`) | The patient reviews one page; the cardiologist gets a care-team copy. | Viha | 31 | 2:27 |
| 7 | Will people buy it? (`s06_pg`) | Patients use tools their practice sends; no practice has agreed to pay us yet. | Unser | 46 | 3:13 |
| 8 | Can we make it? (`s07_pg`) | We can pilot by January 2027; salaries need a bigger market. | Unser | 42 | 3:57 |
| 9 | Central business logic and wedge (`s08_pg`) | 3 NYC cardiology groups first, then other specialties, one at a time. | Raj | 48 | **4:45** |

**Cut from the script to make room** (each is still on the slide or in the notes): slide 2's "with a few lines for details"; slide 5's "He sees who asked and who will read his answers" (screen 1 shows it); slide 7's spoken verdict (the title says it) and a longer chatbot sentence; slide 8's "What you saw runs today on synthetic data…" (the checklist shows it); slide 9's reason for cardiology first (the wedge box says it).

---

## Main deck

### Slide 1 · Title (`s01_pg`)

- **Title on the slide:** Stemma
- **Speaker / time:** Raj · 19 s (clock 0:19)
- **On-slide text:**
  - Top strip: `TEAM 709 · SECTION 7 · PRODUCT STUDIO · MAKER DAY 2 · OCT 16, 2026`
  - Headline: `Stemma`
  - Descriptor: `THE FAMILY HEALTH TREE`
  - Subhead: `“Heart problems run in the family” → who, what, and at what age, before the first cardiology visit.`
  - Model line: `Free for patients  ·  practices pay  ·  cardiology first`
  - Names: `Raj Kashikar, Viha Srinivas, Unser Jaffry`
  - Footer: `Prototype uses synthetic data only.`
  - Page counter: `1 / 9`
  - Speech bubble: `“Heart problems run in the family.”`
  - Status chip 1:
    - `Uncle Dev · atrial fibrillation at 34`
    - `Known · his answer + his patient-portal record`
  - Status chip 2:
    - `Dad · heart attack at 60? angina at ~58?`
    - `Reports disagree · Mom and Uncle Dev`
  - Status chip 3:
    - `Grandpa Ray`
    - `Unknown · no one knows yet`
- **Visual:** dark cover (#1F2937). Left: the text above and the Stemma mark (`public/pitch/mark-night.png`). Right, drawn natively in Slides: the speech bubble, an arrow, and the three status chips stacked. Slide 1 is the only slide with deck-drawn status chips. Logo files for other uses: `public/brand/stemma-lockup-1200.png` (white slides) and `public/brand/stemma-lockup-night-1200.png` (dark slides).
- **Speaker notes** (word for word from the deck):

  ```text
  RAJ (19 s)
  "We're Team 709, and this is Stemma. In ancient Greece, medicine was a family business. Stemma brings the family back into it: it turns 'heart problems run in the family' into who had what, at what age, before the first cardiology visit."

  Evidence: Uncle Dev's condition and its 2009 problem-list date come from his portal record; the age, 34, is his own answer. Everyone shown is a synthetic demo family. If asked about the name: a stemma is the ancient family-tree diagram; the logo is the Rod of Asclepius, the Greek god of medicine.
  ```

### Slide 2 · Customer and problem (`s02_pg`)

- **Title on the slide:** Patients know heart trouble runs in the family, not who or when.
- **Speaker / time:** Raj · 39 s (clock 1:00, with the handoff to Viha)
- **On-slide text:**
  - Kicker: `CUSTOMER AND PROBLEM`
  - Column 1 header: `WHO`
  - Column 1:
    - `Patient`
    - `An adult booked for a first visit at an independent cardiology practice, our first market. Average wait: 33 days, time to ask relatives.`
    - `Payer`
    - `That practice; its manager holds the budget (untested).`
  - Column 2 header: `WHAT THEY USE TODAY`
  - Column 2:
    - `Patient: memory, then calling relatives.`
    - `Practice: a yes/no intake grid and a quick question in the room.`
  - Column 2 grid (recreated from the 2016 form [S5], drawn as a table):

    | Relative | Heart disease? |
    | --- | --- |
    | Father | Y  /  N |
    | Mother | Y  /  N |
    | Brother(s), sister(s) | Y  /  N |

  - Grid caption: `A “Y” can't show if it came before 55, the age guidelines count.`
  - Column 3 header: `THE GAP`
  - Stat tile `1 in 7`: `US adults have collected their family health history (15.2%)`
  - Stat tile `11%`: `of family heart-history entries in UK charts named relative and age`
  - Quote strip: `Cardiac patient, our interview notes: knew heart problems ran in the family, not who or when. The cardiologist sent them home to ask.`
  - Footer: `Sources: CDC/NCHS survey, Kava et al., 2026 · AMN Healthcare wait-time survey, 2025 · Weill Cornell cardiology new-patient form, 2016 (grid recreated) · UK records study, Dhiman et al., 2014 · ACC/AHA cholesterol guideline, 2018.`
  - Page counter: `2 / 9  ·  Customer and problem`
- **Visual:** three columns. Column 2 shows the recreated yes/no grid with a highlight box; column 3 has the two stat tiles; the quote strip runs across the bottom.
- **Speaker notes** (word for word from the deck):

  ```text
  RAJ (39 s)
  "Our user is an adult booked for a first visit at an independent cardiology practice, and that practice pays. One patient we interviewed knew heart problems ran in the family, but not who, what, or when. The cardiologist sent them home to ask. Today it's memory, a yes-or-no grid on the intake form, and a quick question in the room. But a yes alone can't say if Dad's heart attack came before 55, the age the guideline counts. Viha will show you what our made-up patient, Alex, does instead."

  Saved for Q&A: 'and they learned an uncle had a rhythm problem young', 'a few lines for details' (the form has free-text lines after the grid) and 'Only one in seven American adults...' (the slide shows it). Evidence: 2018 ACC/AHA guideline, premature heart disease in a parent or sibling, men < 55, women < 65 [76]. Intake grid recreated from Weill Cornell's 2016 form [S5]. 'Quick question in the room': family history discussed in 51% of new-patient visits, under 2.5 minutes (Acheson, via [117]). 33-day wait: AMN Healthcare, 1,391 offices in 15 metros, May 2025 [S2]. 1 in 7 = 15.2% [S1]. 'Its manager holds the budget' is marked untested on the slide: 0 of 21 interviews were managers.
  ```

### Slide 3 · How Stemma works (`s02b_pg`, new in the final deck)

- **Title on the slide:** The practice sends the patient a link; relatives answer; the practice gets a page.
- **Speaker / time:** Viha · 20 s (clock 1:20)
- **On-slide text:**
  - Kicker: `HOW STEMMA WORKS`
  - Step 1 arrow: `1  Practice sends a link`
  - Step 1 text: `With the new-patient paperwork, at booking.`
  - Step 2 arrow: `2  Patient builds tree`
  - Step 2 text: `Mom's side and Dad's side, then a link to each relative.`
  - Step 3 arrow: `3  Relatives answer`
  - Step 3 text: `On their phone, with no account. They can decline, or share one condition from their portal.`
  - Step 4 arrow: `4  Practice opens page`
  - Step 4 text: `The patient reviews it; the practice opens its own copy by link or QR.`
  - Comparison strip: `Compared with 23andMe's family tree: there, you type in relatives' conditions and only you can see them. Here, relatives can answer for themselves, every fact keeps who said it, and the practice gets a page.`
  - Price bar: `Practice pays: $1,000 for a 12-week pilot, credited to year one, then $500 per cardiologist a year. Free to patients.`
  - Footer: `Prototype with synthetic data only. Patient portal = the website where a person sees their own medical record; the portal step runs on a public test server today. 23andMe: help article, Oct 11, 2026.`
  - Page counter: `3 / 9  ·  How it works`
- **Visual:** four arrow shapes in a row (a home plate, then three chevrons), each with its line of text under it; below them the full-width comparison strip and the full-width price bar.
- **Speaker notes** (word for word from the deck):

  ```text
  VIHA (20 s)
  "Here's how it works. Alex's cardiology practice texts a link with the new-patient paperwork. Alex builds the tree and texts each relative. Relatives can answer for themselves; on 23andMe, you type in their conditions yourself. Then the practice opens its own copy, and the practice pays."

  New slide. Leave the price on the slide; say it only if ahead of time. Don't say 'upload their medical records': a relative shares one condition, read-only, from a public test server today. If asked what we're taking from 23andMe: their editing tools (add a relative from any person, change a relationship, undo a removal) shipped on Oct 12 and are live on stemmahealth.vercel.app/tree (synthetic data only). Their help page also tells users to get a living relative's permission before entering that relative's health information; our relative link asks the relative directly instead. If asked when the link goes out: with the new-patient paperwork when the visit is booked (average cardiology wait 33 days, slide 2); how far ahead is up to each practice.
  ```

### Slide 4 · Mockup 1: the patient (`s03_pg`)

- **Title on the slide:** The patient builds the tree by side of family, uncertainty included.
- **Speaker / time:** Viha · 19 s (clock 1:39)
- **On-slide text:**
  - Kicker: `MOCKUP  ·  1 OF 3  ·  THE PATIENT`
  - Browser bar: `stemmahealth.vercel.app/tree`
  - Markers on the screenshot: `1` `2` `3`
  - Callout `1`: `Fixed slots for Mom's side and Dad's side, so nobody lands on the wrong side.`
  - Callout `2`: `“Not sure” is a real answer. Grandpa Ray shows Unknown, never “no history”.`
  - Callout `3`: `Every person has a status in words: Known · Reports disagree · Unknown · Chose not to share · Not asked yet.`
  - Footer: `Live prototype, synthetic demo family; labels as the app shows them. RECORD = shared from that relative's own patient portal.`
  - Page counter: `4 / 9  ·  Mockup: the patient`
- **Visual:** screenshot of the live `/tree` page with the synthetic demo family (`public/pitch/slide3-tree.png`) in a plain browser frame, with the app's own status labels; numbered markers on the screenshot match the three callouts beside it.
- **Speaker notes** (word for word from the deck):

  ```text
  VIHA (19 s)
  "Alex fills in Mom's side and Dad's side in fixed slots, so nobody lands on the wrong side, and 'not sure' is a real answer. Every person gets a status in plain words: known, reports disagree, unknown, chose not to share, or not asked yet."

  Saved: 'Each relative gets plain questions with examples' (the slide shows it). Evidence: D021 expects structural errors such as the wrong side of the family (notes); ID006 would have answered differently with a specific question (notes); a guided tool recorded lineage in 100% of MeTree family trees vs 28.4% of charts [84].
  ```

### Slide 5 · Mockup 2: the relative (`s04_pg`)

- **Title on the slide:** Relatives answer for themselves, on their phone, with no account.
- **Speaker / time:** Viha · 15 s (clock 1:54)
- **On-slide text:**
  - Kicker: `MOCKUP  ·  2 OF 3  ·  THE RELATIVE`
  - Markers on the screens: `1` `2`
  - Callout `1`:
    - `Grandpa Luis (Mom's dad) opens Alex's link.`
    - `No account and no app. He sees who asked and who will read his answers, and “I'd rather not share” is always an option.`
  - Callout `2`:
    - `He can share one condition from his own portal.`
    - `A real SMART on FHIR login (the standard way apps read a patient portal): he ticks one condition and confirms the age himself. Nothing else leaves the page.`
  - Footer: `Screen 2 logs in to a public test server, so the record shown (atrial fibrillation since 2016, age 69) is a made-up test patient's, not Grandpa Luis's. In the demo tree on slides 4 and 6 he is still Not asked yet; Uncle Dev's atrial fibrillation came in this way. The invite text has no health information.`
  - Page counter: `5 / 9  ·  Mockup: the relative`
- **Visual:** two phone frames side by side: screen 1 is the relative's invite page (`public/pitch/slide4-relative.png`), screen 2 the portal pick screen after the SMART on FHIR login on the public test server (`public/pitch/slide4-portal.png`).
- **Speaker notes** (word for word from the deck):

  ```text
  VIHA (15 s)
  "Here's Grandpa Luis, Mom's dad, on his phone. No account, and he can decline. He can also log in to his own patient portal and share one condition, labeled with where it came from."

  Saved: 'He sees who asked and who will read his answers' (screen 1 shows it) and 'Then Alex texts each relative a link' (now on slide 3). If asked about the screenshot: screen 2 logs in to a public test server, so the record shown belongs to a made-up test patient and its date (2016) and age (69) are that patient's; in the demo tree Luis is still Not asked yet, and Uncle Dev's atrial fibrillation came in this way. The label says 'on your problem list since <year>', never 'verified', because a problem-list date can be when it was listed, not diagnosed [8].
  ```

### Slide 6 · Mockup 3: the visit (`s05_pg`)

- **Title on the slide:** The patient reviews one page; the cardiologist gets a care-team copy.
- **Speaker / time:** Viha · 31 s (clock 2:27, with the handoff to Unser)
- **On-slide text:**
  - Kicker: `MOCKUP  ·  3 OF 3  ·  THE VISIT`
  - Label over the left screenshot: `ALEX'S COPY · FACTS, GAPS, QUESTIONS`
  - Label over the right screenshot: `CARE-TEAM COPY · THE PRACTICE OPENS IT`
  - Markers on the screenshots: `1` `2` `3`
  - Callout 1: `For clinician review: Grandma Rosa's “very high cholesterol” (no number) is a possible Simon Broome item (inherited high cholesterol).`
  - Callout 2: `Source on every line: Uncle Dev's diagnosis is “from a portal record”.`
  - Callout 3: `To clarify: Mom says heart attack at 60; Uncle Dev, angina (chest pain) at ~58. Both kept.`
  - Footer: `Criteria go only on the care-team copy, which the practice opens by link or QR: under FDA guidance (Jan 2026), any recommendation shown to patients is a device. The patient's copy shows facts, gaps and questions.`
  - Page counter: `6 / 9  ·  Mockup: the visit`
- **Visual:** two framed screenshots: Alex's copy (`public/pitch/slide5-patient.png`) on the left, the care-team copy as the practice opens it (`public/pitch/slide5-care.png`) on the right.
- **Speaker notes** (word for word from the deck):

  ```text
  VIHA (31 s)
  "Alex reviews a one-page summary: facts, gaps and questions. The practice opens its own care-team copy, which adds a block for the cardiologist: Grandma Rosa, Mom's mother, very high cholesterol around 35, reported by Mom. That may count toward the Simon Broome criteria for inherited high cholesterol, for the cardiologist to review. To clarify: Mom says Dad had a heart attack at 60; Uncle Dev says angina at about 58. Unser?"

  Evidence: Simon Broome counts a first- or second-degree adult relative with total cholesterol > 290 mg/dL [77]; Mom reported 'very high', not a number, so it is an item for review, not a match. Atrial fibrillation in a relative has no verified family-history criterion [79], so the page lists it as 'also noted'. Why criteria stay off the patient's copy: under FDA's Jan 2026 guidance, any recommendation shown to patients is a device [95]. The patient's Print button prints Alex's copy; the care-team copy reaches the practice only by read-only link or check-in QR.
  ```

### Slide 7 · Will people buy it? (`s06_pg`)

- **Title on the slide:** Patients use tools their practice sends; no practice has agreed to pay us yet.
- **Speaker / time:** Unser · 46 s (clock 3:13)
- **On-slide text:**
  - Kicker: `WILL PEOPLE BUY IT?`
  - Table:

    | Who | Today (next best option) | Gain with us | Net vs today |
    | --- | --- | --- | --- |
    | Patient (free) | Memory + intake form | Relatives answer; one page to review | Gains if the practice asks |
    | Relative (free) | A phone call | Answer once, for yourself; can decline | Even; relatives untested |
    | Cardiologist | Quick question in the visit | Who, what, what age, and the source | Gains if read in < 1 min |
    | Practice (pays) | Its form; free intake apps; FamGenix $500/clinician/yr | Who, what, what age, with sources, in the chart before visit one | Worse unless a pilot shows time saved or clinical value |

  - Tile `16.1% vs 0.2%`: `of patients got new family history in their chart in 30 days: emailed form, filed automatically, vs usual care (not ours)`
  - Tile `57%`: `of 95,166 patients their clinics invited finished a 15-min cancer-risk chatbot (lab-funded; not ours)`
  - Tile `0 of 21`: `interviews were practice managers. Riskiest claim: a practice pays $500 per cardiologist a year despite free intake tools.`
  - Footer: `Sources: Carroll et al., 2025 (Toronto family practices); Nazareth et al., 2021 (64.2% started, 89.4% of them finished = 57% of invited); FamGenix (family-tree software) price page, 2026. Interviews: our course log, 21. Net = our judgment (A3).`
  - Page counter: `7 / 9  ·  Will people buy it?`
- **Visual:** the table across the top, three number tiles across the bottom; the third tile carries the riskiest claim. No separate verdict bar: the title carries the verdict.
- **Speaker notes** (word for word from the deck):

  ```text
  UNSER (46 s)
  "Against what each person uses today, patients gain the most, if their practice sends the link. When clinics sent a cancer-risk chatbot link before visits, 57 percent of everyone invited finished it. In a Toronto trial, an emailed family-history form got new family history into 16 percent of charts, against almost none without it. Those are other tools, not ours. The practice pays, its options are cheap or free, and it comes out behind unless a pilot shows time saved or clinical value. Our riskiest claim: a practice pays 500 dollars per cardiologist a year. None of our 21 interviews was a practice manager yet."

  Cut for time: the spoken verdict (the title says it). Only if calls happen before Oct 16, replace the riskiest-claim lines with 'We asked [N] practice managers; [M] named a budget owner and [K] would sign a letter of intent', and change tile 3 to match. Never say calls are 'booked' unless they are. Evidence: [92] women's health clinics sent the link by text or email about 5 days ahead, with reminders at 72 and 24 h, for a 15-minute lab-funded chatbot [S54]; a tree that depends on relatives should expect less. [S10] 93 of 576 vs 5 of 2,203 within 30 days (Toronto family practices; emailed questionnaire with answers filed into the chart automatically, vs matched usual care). If asked about Toronto: 'Their form filed itself into the chart; ours arrives as a PDF the practice opens.' Cheap or free: EHR check-in [S52], Phreesia intake free through at least 2026 [112], lab tools free [107], FamGenix $500 a year per clinician [111]. If asked 'why pay?': free tools ask yes or no; we get which relative and what age, with sources, into the chart. At $500 a year, saved staff time only breaks even (A3), so FamGenix's license sets our price, and the pilot has to show time saved or clinical value.
  ```

### Slide 8 · Can we make it? (`s07_pg`)

- **Title on the slide:** We can pilot by January 2027; salaries need a bigger market. (line break after the semicolon)
- **Speaker / time:** Unser · 42 s (clock 3:57, with the handoff to Raj)
- **On-slide text:**
  - Kicker: `CAN WE MAKE IT?`
  - Column 1 header: `TECHNICAL`
  - Column 1 subhead: `Runs today, on synthetic data`
  - Column 1 checklist: `✓  Patient builds the tree` · `✓  Relative opens a link` · `✓  Shares one portal fact (test server)` · `✓  One page, reviewed` · `✓  PDF + data export`
  - Column 1 text:
    - `Epic can't write family history from apps into the chart, so we send a PDF.`
    - `Next: a pilot server with secure logins.`
  - Column 2 header: `OPERATIONAL`
  - Column 2 subhead: `When a practice pays`
  - Column 2 text:
    - `We sign BAAs: the HIPAA contract with the practice and with each vendor that handles patient data.`
    - `Staff add our link to new-patient texts and open each page by link or QR.`
    - `Guideline criteria go on the care-team copy only (FDA guidance, Jan 2026).`
    - `A cardiologist signs off the rules before any pilot.`
  - Column 3 header: `FINANCIAL`
  - Column 3 subhead: `Cheap to run, small to earn`
  - Figure `$689–834 / mo`: `to run once real patient data flows`
  - Figure `17–21 cardiologists`: `at $500 a year cover it: 9–11 groups of two`
  - Figure `~290 cardiologists`: `would also cover one developer's wage: about every independent cardiologist in NYC`
  - Verdict bar: `Verdict: yes at pilot scale from about January 2027, not yet salaries. NYC is a pilot, not our market.`
  - Footer: `Costs: vendor price pages, Oct 6, 2026 (Vercel, Neon, Amazon SES); insurance: Insureon medians (estimate). Founders unpaid; support and sales time not counted. One developer = median US software-developer wage, $135,980 (BLS).`
  - Page counter: `8 / 9  ·  Can we make it?`
- **Visual:** three columns (technical, operational, financial) with the checklist in column 1 and three figures in column 3; the verdict bar runs across the bottom.
- **Speaker notes** (word for word from the deck):

  ```text
  UNSER (42 s)
  "Yes, at pilot scale. Epic charts can't take family history from apps, so the page goes in as a PDF. Next we build a pilot server with secure logins. Once a practice pays, we sign the HIPAA contracts, called BAAs, with it and every vendor. Running it costs about 690 to 830 dollars a month, so 17 to 21 cardiologists paying 500 dollars a year cover it. Adding one developer's pay takes about 290, roughly every independent cardiologist in New York. So New York is our pilot, not our market."

  Cut for time: 'What you saw runs today on synthetic data, including a real portal login on a public test server' (the checklist on the slide shows it) and 'Portals only have to share problem lists, not family history' (Q&A). Evidence: family history is not a required portal data class and Epic has no API to create it [7][10]; business associate [35]; costs from vendor price pages Oct 6 [61][64][S19], insurance medians [S21][S22]; one developer = BLS median $135,980 [S23]; NYC independent cardiologists 285-320 [S27]. Earliest pilot about January 2027, after a company, counsel review, a signed rule table, the backend, and hosting and insurance under BAAs. Founder support of 1-2 h per practice a month is worth $65-131, against $83 a month from a 2-cardiologist practice (A4). If asked about market size: US independent cardiology is about $3.8M a year at $500 (slide 9, A9), so growth means more specialties.
  ```

### Slide 9 · Central business logic and wedge (`s08_pg`)

- **Title on the slide:** 3 NYC cardiology groups first, then other specialties, one at a time.
- **Speaker / time:** Raj · 48 s (clock 4:45)
- **On-slide text:**
  - Kicker: `CENTRAL BUSINESS LOGIC  ·  WEDGE`
  - Card 1: `People will buy it because cardiology guidelines need which relative and what age, intake forms take it from memory, and for $500 per cardiologist a year a practice-sent link puts those details, sourced, in the chart before visit one.`
  - Card 2: `We can make it because the patient side already runs on open health standards, a PDF reaches any chart, and a pilot on vendors that sign HIPAA contracts costs under $850 a month, which 17–21 paying cardiologists cover, founders unpaid.`
  - Wedge box (left, smaller):
    - `WEDGE · NOW`
    - `3 independent NYC cardiology groups. Why cardiology first: its guidelines count grandparents, aunts and uncles, by side and age.`
    - `Goal: 4 in 10 invited new patients have a reviewed page in the chart before visit one.`
  - Vision box (right, wider):
    - `VISION · LATER`
    - `Any doctor who needs a family history, one specialty at a time: the rest of NYC's ~20 cardiology groups → larger groups → genetics and lipid clinics → primary care wellness visits. US independent cardiology alone: 7,699 cardiologists, $3.8M a year at $500. Markets beyond it are not yet sized.`
  - Ask: `Our ask: introductions to NYC cardiology practice managers.`
  - Corner text, beside the QR code:
    - `Try it: stemmahealth.vercel.app  ·  synthetic data only`
    - `Sources: ACC/AHA 2018 and AHA/ACC 2024 guidelines, Simon Broome criteria · market: CMS clinician file (A9) · costs: A4`
  - Page counter: `9 / 9  ·  Business logic and wedge`
- **Visual:** the two sentence cards stacked full width at the top; below them the small wedge box and the wider vision box joined by an arrow, so the wedge is visibly smaller than the vision; the ask line; bottom right, the URL line and the QR code (`public/pitch/qr-stemmahealth.png`) to stemmahealth.vercel.app.
- **Speaker notes** (word for word from the deck):

  ```text
  RAJ (48 s)
  "People will buy it because cardiology guidelines need which relative and what age, intake forms take it from memory, and for 500 dollars per cardiologist a year a practice-sent link puts those details, sourced, in the chart before visit one. We can make it because the patient side already runs on open health standards, a PDF reaches any chart, and a pilot on vendors that sign HIPAA contracts costs under 850 dollars a month, which 17 to 21 paying cardiologists cover, founders unpaid. We start with three New York cardiology groups, then add other specialties one at a time. Our ask: introductions to New York cardiology practice managers."

  Read both cards word for word (update the VCA central business logic and the Miro board to these exact words before Oct 23). If Raj starts after 4:07, drop the 'We start...' sentence; the slide says it. If asked why cardiology first: its guidelines need more detail than primary care (grandparents, aunts and uncles, by side and age), and one manager can say yes (wedge card, A6). If asked 'shouldn't this be for any doctor?' (about 20 s): 'For the patient, it already does: pick primary care or another specialist and you get a general question set, with no clinician criteria. Only cardiology adds criteria so far, because criteria need a clinician's sign-off. But a wedge needs one buyer who can say yes. Cardiology needs more detail than primary care: which relative, which side, what age, while Medicare's wellness visit requires, at minimum, only parents, siblings and children. And we haven't spoken to a single practice manager yet. If cardiology managers don't name a budget owner, primary care is our next call list.' If asked about price: $1,000 for a 12-week pilot, credited to year one, then $500 per cardiologist a year; $99 a month is a higher price we test on the same card (the website shows the same). Evidence: [76][77][72]; Medicare wellness visit rule [104]; 39 NYC groups with 2+ independent cardiologists, about 19-20 cardiology-focused [S27]; 17-21 and $689-834 from A4; 7,699 US independent cardiologists, $3.8M a year at $500 (A9).
  ```

### Timekeeper checkpoints and cut list

The member not speaking holds a phone stopwatch where the speaker can see it. Agree the cuts in a timed run-through before Oct 16.

| Clock | Who should be talking | If more than 10 s late, cut this |
| ---: | --- | --- |
| 1:00 | Viha starts slide 3 (How it works) | Viha skips the 23andMe sentence on slide 3 (the comparison strip shows it). |
| 2:27 | Unser starts slide 7 (Will people buy it?) | Unser drops the Toronto sentence; keeps the 57% line, "not ours", what the pilot must show, and the riskiest claim. |
| 3:13 | Unser starts slide 8 (Can we make it?) | Unser drops the developer sentence and says "17 to 21 paying cardiologists cover the cost; New York is our pilot, not our market." |
| 3:57 | Raj starts slide 9 (business logic) | **Hard rule:** by 4:07 Unser hands over mid-sentence. Raj keeps both cards word for word and the ask; drops "We start with three New York cardiology groups…" (the slide says it). |

Handoff lines: Raj → Viha: "…Viha will show you what our made-up patient, Alex, does instead." / "Here's how it works." Viha → Unser: "…Uncle Dev says angina at about 58. Unser?" / "Against what each person uses today…". Unser → Raj: "…So New York is our pilot, not our market." / "People will buy it because…". Stand in speaking order (Raj, Viha, Unser), pass one clicker, never say "next slide".

No live demo inside the five minutes: the PDF is what gets graded and uploaded, and the relative's portal step leaves our site for the public test server. Keep the production `/tree` page open on one laptop for Q&A only.

---

## Appendix: backup slides (after the divider "Backup for questions"; not presented)

These pages also serve the Milestone 4 PDF; full detail is in `value-creation-analysis.md`. Pages A0 to A12 each carry "Team 709" top right and a "Backup A#" page counter; the divider has no counter.

### Divider · Backup for questions (`s09_pg`)

- **On-slide text:**
  - Kicker: `APPENDIX  ·  ALSO OUR MILESTONE 4 VALUE CREATION ANALYSIS`
  - Title: `Backup for questions`
  - Subtitle:
    - `Start with A0: how to read these pages, and the words we use.`
    - `A1 business model · A2 comparisons · A3 net benefit · A4 financials · A5 new vs old · A6 why cardiology · A7 competitors · A8 evidence · A9 market · A10 privacy · A11 pilot · A12 care-team page`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. Jump here during Q&A. A0 (next page) explains the markers, prices and terms.
  ```

### A0 · How to read the backup (`a00_pg`, new in the final deck)

- **Title:** How to read the backup, and the words we use.
- **On-slide text:**
  - Kicker: `A0  ·  HOW TO READ THE BACKUP`
  - Card 1, header: `HOW TO READ`
  - Card 1:
    - `Markers: [n] = research source, linked at stemmahealth.vercel.app/research (#source-n). [S#] = source opened for this pitch, named in each page's footer.`
    - `Prices: $500 per cardiologist a year is our price, after a $1,000 12-week pilot credited to year one. $99 a month is a higher price we test.`
    - `Tags (A1, A5): [O] old: Phreesia or a competitor does it · [N/O] done elsewhere, new here · [N] new.`
    - `Net (slide 7, A3): gains, even or worse against the person's next best option today. A3's net score sums five factors, each +2 to −2, quality counted twice. Our judgment.`
    - `Interviews: ID001–ID020 and D021, our 21 logged interviews. “(notes)” = the note-taker's words.`
    - `Status words: Known · Reports disagree · Unknown · Chose not to share · Not asked yet.`
  - Card 2, header: `HEALTH WORDS`
  - Card 2:
    - `Atrial fibrillation (AF): an irregular heartbeat.`
    - `Angina: chest pain from reduced blood flow to the heart. MI: heart attack.`
    - `Pedigree: a medical family-tree diagram.`
    - `First-degree relatives: parents, siblings, children. Second-degree: grandparents, aunts, uncles.`
    - `Premature heart disease: in a parent or sibling before 55 (men) or 65 (women), the ages the 2018 ACC/AHA guideline counts [76].`
    - `Simon Broome criteria: a checklist for inherited very high cholesterol (familial hypercholesterolemia, FH) [77].`
    - `Cardiogenetics clinic: a clinic for inherited heart disease.`
    - `Sensitivity 57.6%: self-report caught about 58 of 100 parents' and siblings' heart attacks [87].`
  - Card 3, header: `SYSTEMS, LAW AND BUYERS`
  - Card 3:
    - `Chart / EHR: the practice's electronic medical record. Epic: a large EHR vendor; MyChart is its patient portal.`
    - `Patient portal: the website where you see your own record. Problem list: the diagnoses in it.`
    - `FHIR: the standard format for health data. SMART on FHIR: the standard way an app reads a portal after you log in and agree. Sandbox: a public test server with made-up patients.`
    - `HIPAA: US health-privacy law. BAA: the contract HIPAA requires with any vendor handling patient data (a business associate).`
    - `GINA: US law against genetic discrimination in health insurance and jobs; not life, disability or long-term-care insurance [51].`
    - `E&O: errors-and-omissions insurance. Independent practice: owned by its doctors, not a hospital.`
  - Footer: `All people shown are a synthetic demo family. Definitions are ours, in plain words, from the sources cited on the backup pages; [n] sources link from stemmahealth.vercel.app/research, [S#] sources are named in each page's footer.`
  - Page counter: `Backup A0  ·  How to read`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. For readers of the PDF; point to it if a term or a price comes up in Q&A. Prices: $500 per cardiologist a year is our price, after a $1,000 12-week pilot credited to year one; $99 a month is a higher price we test on the same card (the website shows the same). A4 also models $149, our first guess.
  ```

### A1 · Business Model Canvas (`a01_pg`)

- **Title:** A new product inside an old, proven business model.
- **On-slide text** (the nine canvas boxes, each starting with its header):
  - Kicker: `A1  ·  BUSINESS MODEL CANVAS`
  - Key Partners:
    - `KEY PARTNERS`
    - `[O] 1–3 NYC cardiology groups as pilot sites`
    - `[O] Reviewers to recruit: a cardiologist, a genetics counselor`
    - `[O] Vendors that sign BAAs: Vercel, Neon, Amazon`
    - `[N/O] Health-record QR links (SMART Health Links)`
  - Key Activities:
    - `KEY ACTIVITIES`
    - `[O] Sell paid pilots to practice managers`
    - `[O] Measure completion, replies, staff minutes`
    - `[N/O] Keep each relative's consent and deletions straight`
  - Key Resources:
    - `KEY RESOURCES`
    - `[N] Data model: every fact has status + source`
    - `[N/O] Cited rule packs; cardiology first`
    - `[O] Prototype with a real portal login (test server)`
  - Value Propositions:
    - `VALUE PROPOSITIONS`
    - `[N/O] Patient: who, what, what age, before the visit`
    - `[N/O] Relatives answer for themselves, no account`
    - `[N] Every fact: Known, Reports disagree, Unknown, Chose not to share or Not asked yet`
    - `[N/O] Clinician: one page of criteria, gaps, conflicts`
    - `[O] Practice: more history in the chart before visit one`
  - Customer Relationships:
    - `CUSTOMER RELATIONSHIPS`
    - `[O] Paid 12-week pilot, metrics agreed upfront`
    - `[N/O] Relatives: one link to answer, decline, delete`
  - Channels:
    - `CHANNELS`
    - `[O] Practice texts our link with new-patient paperwork`
    - `[N/O] Patient texts each relative a link`
    - `[O] Practice opens the care-team page by link or QR`
  - Customer Segments:
    - `CUSTOMER SEGMENTS`
    - `[O] Pays: NYC cardiology groups, 2–10 cardiologists`
    - `[O] Manager holds budget; owner signs (untested)`
    - `[O] Uses: adult new patients before visit one`
    - `[N/O] Adult relatives answer for their branch`
  - Cost Structure:
    - `COST STRUCTURE`
    - `[O] Hosting + database under BAAs: $411–457/mo`
    - `[O] Email, storage, domain, inbox: $23–72/mo`
    - `[O] Cyber + errors-and-omissions insurance: ~$255–305/mo`
    - `[O] Total ~$689–834/mo; founder support unpaid`
  - Revenue Streams:
    - `REVENUE STREAMS`
    - `[O] $1,000 founding pilot, 12 weeks, credited to year one`
    - `[O] Then $500 per cardiologist per year; we also test a higher $99/mo`
    - `[O] Never: patient fees, ads, data sales, per-referral fees`
  - Legend:
    - `[N] new · [N/O] done elsewhere, new here · [O] old: Phreesia or a competitor does it.`
    - `88 canvas notes: 2 N · 17 N/O · 69 O; top items shown.`
  - Page counter: `Backup A1  ·  Business Model Canvas`
- **Visual:** the standard nine-box canvas grid; full canvas (88 notes, ranked within each sub-group) on the Miro board.
- **Speaker notes** (word for word from the deck):

  ```text
  Every sub-group is ranked from 1 on the Miro board. The new parts are all in what we sell; the way we sell copies Phreesia. Untested assumptions: who pays (1-2), revenue (1-3), key partnership 1.
  ```

### A2 · Points of comparison (`a02_pg`)

- **Title:** We sell like Phreesia does, but take no pharma money.
- **On-slide text** (three panels):
  - Kicker: `A2  ·  POINTS OF COMPARISON`
  - Panel 1, header: `NEXT BEST OPTION`
  - Panel 1:
    - `Patient: memory and the intake form`
    - `Relative: a phone call`
    - `Clinician: a quick question in the visit`
    - `Practice: its EHR check-in or form [S52]; Phreesia intake, free through at least 2026 [112]; IntakeQ forms $54.90/mo [114]; free lab tools [107]; FamGenix family-tree software, free up to 20 trees, $500/yr per clinician [111]`
  - Panel 2, header: `CLOSEST OPERATIONS: PHREESIA`
  - Panel 2:
    - `Sells to practices; the practice sends the patient a link a few days before the appointment [S43].`
    - `Answers land in the chart; direct sales, 3–12 month cycles [S29].`
    - `~180M visits a year; FY2026 revenue $480.6M, 29% of it from life-sciences (pharma) clients (our math) [S29][113].`
    - `Clinical runner-up: CancerIQ (cancer, health systems) [110].`
  - Panel 3, header: `WHERE THE MODEL ALREADY WORKS`
  - Panel 3:
    - `Calendly: invitees need no account [S34]`
    - `DocuSign: no-account signers, audit trail [S36][S37]`
    - `Zocdoc: free for the consumer, the practice pays [S32]`
    - `Borrowed: Ancestry/MyHeritage relatives add to one tree [S38][S39]; TurboTax imports a form, then you confirm [S44]`
    - `Refuse: Zocdoc's per-new-patient fee; Doximity's pharma payer [S42]`
  - Footer: `[S29] Phreesia 10-K, FY2026 · [S32] Zocdoc fee explainer · [S34] Calendly pricing · [S36][S37] DocuSign pricing, certificate · [S38] Ancestry help · [S39] MyHeritage · [S42] Doximity 10-K · [S43] Phreesia patient FAQ · [S44] TurboTax help · [S52] athenahealth help. [n]: stemmahealth.vercel.app/research. Opened Oct 6, 2026.`
  - Page counter: `Backup A2  ·  Points of comparison`
- **Speaker notes** (word for word from the deck):

  ```text
  Closest operations = Phreesia: practice-sent pre-visit links, delivery into the chart, direct sales. Copy its playbook; our product differs (relatives answer, per-fact source, cardiology page).
  ```

### A3 · Net benefit (`a03_pg`)

- **Title:** Patients gain; the paying practice scores −2 so far.
- **On-slide text:**
  - Kicker: `A3  ·  NET BENEFIT (MILESTONE 4, STEP 4)`
  - Table:

    | Who | Next best option | Gain | Cost | Net score |
    | --- | --- | --- | --- | --- |
    | Patient | Memory, a call to Mom, the intake form | Guided by side of family; relatives answer; one page | MeTree took ~27 min [90]; asking family | +2 when the practice asks |
    | Relative | A phone call | Answer once, for yourself; can decline | Minutes; trusting a health link | 0; relatives untested |
    | Clinician | Asking in the visit; the chart's family-history box | Who, what, what age, how sure; criteria for review | Extra page; self-report misses ~4 in 10 family MIs [87] | +3 if read in < 1 min |
    | Practice | EHR check-in or form; free tools; FamGenix $500/clinician/yr | New family history in the chart: 16.1% vs 0.2% (Toronto trial) [S10] | Fee vs free; workflow; BAA; insurers don't pay [103][105] | −2 plus unmeasured staff time |

  - Verdict bar: `Verdict: use, yes, if the practice sends the link. Buy: not shown. Riskiest: a practice pays $500 per cardiologist a year.`
  - Footer: `Can saved staff time pay for it? Only break-even (assumption, weak): 10 staff minutes saved × $30/h ≈ $5 per summary × ~21 new patients per cardiologist a month (our guess) × 40% ≈ $500 a year, and a 2026 trial found no shorter counseling time [S9]. So FamGenix's $500/yr license [111] sets our price; the pilot must show time saved or clinical value. Net score: five factors, each +2 to −2, quality counted double; team judgment. [S9] Orlando 2026 · [S10] Carroll 2025 · [87] SCAPIS 2026 · [90] MeTree 2013 · [103] CMS fee file 2026 · [105] MGMA.`
  - Page counter: `Backup A3  ·  Net benefit`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. Q&A owner: Unser. If asked 'your own score for the payer is negative, why would they pay?': 'Because free tools ask yes or no, and cardiology criteria turn on which relative and what age. We priced at FamGenix's $500 clinician license, not at saved time, which is unproven. The score stays negative unless the pilot shows time saved or clinical value; the pilot measures staff minutes, and if managers won't pay, we switch buyers.'
  ```

### A4 · Financials (`a04_pg`)

- **Title:** Three pilots pay their way; year one and salaries don't.
- **On-slide text:**
  - Kicker: `A4  ·  FINANCIALS (MILESTONE 4, STEP 5)`
  - Table 1 header: `OPERATING COST PER MONTH, REAL DATA`

    | Line | Low | High |
    | --- | --- | --- |
    | Hosting + database under BAAs [61][64] | $411 | $457 |
    | Email, storage, domain, inbox [S19][S25] | $23 | $72 |
    | Cyber + tech E&O insurance (est.) [S21][S22] | $255 | $305 |
    | Epic registration, SMS, founders | $0 | $0 |
    | Total | $689 | $834 |

  - Table 2 header: `BREAK-EVEN: OUR PRICE VS HIGHER PRICES`

    |   | $500/yr (our price) | $99/mo (higher) | $149/mo (higher) |
    | --- | --- | --- | --- |
    | Paying cardiologists | 17–21 | 7–9 | 5–6 |
    | 2-cardiologist groups | 9–11 | 4–5 | 3 |
    | + one developer [S23] | ~290 | ~123 | ~82 |

  - Year 1 box: `Three pilots: $3,000 vs ~$1,900–2,300 of running costs for their 12 weeks. Year 1 (costs Jan–Sep, 9 × $689–834): revenue $1,000 (1 pilot) to $6,000 (3 convert at 4 cardiologists each); net −$201 to −$6,506.`
  - Verdict bar: `Verdict: yes at pilot scale, not yet salaries. Support time must drop below 1 hour per practice a month, or the price must rise.`
  - Footer: `Price pages checked Oct 6, 2026: [61] Vercel · [64] Neon · [S19] Amazon SES · [S25] Google Workspace (secondary). Insurance: Insureon medians [S21][S22] (estimate). [S23] BLS median software-developer wage $135,980, before payroll taxes and benefits. Year 1 = Oct 2026 to Sep 2027; real-data costs start with the pilots in January. Founders unpaid; their support (1–2 h per practice a month) is not in costs: ≈ $65–131/mo at that wage vs $83/mo from a 2-cardiologist practice.`
  - Page counter: `Backup A4  ·  Financials`
- **Speaker notes** (word for word from the deck):

  ```text
  Founder support time: 1-2 h per practice per month at $65/h = $65-131/month, against $83/month from a 2-cardiologist practice at $500/yr. That is why support time must fall or price must rise.
  ```

### A5 · New vs old (`a05_pg`)

- **Title:** What we sell is new; how we sell it is old.
- **On-slide text:**
  - Kicker: `A5  ·  NEW VS OLD (MILESTONE 4, STEP 3)`
  - Bar label (under a three-part N / N/O / O bar): `N 2   ·   N/O 17   ·   O 69   of 88 canvas notes (A1)`
  - List 1 header: `NEW (N)`
  - List 1:
    - `A status in words on every fact: Known · Reports disagree · Unknown · Chose not to share · Not asked yet.`
    - `The data model behind it.`
  - List 2 header: `SOME OF EACH (N/O)`
  - List 2:
    - `Relatives answer for themselves.`
    - `One portal fact from a relative.`
    - `Guideline criteria on the care-team copy only.`
    - `Patient-sent relative links.`
    - `Per-relative consent; a clinician's “reviewed” lock.`
  - Takeaway box: `The new parts are the ones that need evidence: relatives answering (29% dropped at the invite step in a similar app [93]), portal facts, and clinicians trusting a patient-built page.`
  - Footer: `Tagging rule: O = our closest operations (Phreesia) or a competitor already does it; N = none of our points of comparison does; N/O = done in another industry or clinical area. [93] ItRunsInMyFamily app study, Health Informatics J 2024.`
  - Page counter: `Backup A5  ·  New vs old`
- **Speaker notes** (word for word from the deck):

  ```text
  The old parts lower business-model risk but also mean the buyer has cheap substitutes, which is why price is the riskiest assumption.
  ```

### A6 · Wedge (`a06_pg`)

- **Title:** Why cardiology first: need plus a buyer who can say yes.
- **On-slide text:**
  - Kicker: `A6  ·  WEDGE`
  - Table:

    | Wedge | Pain | Access | Cycle | Burden | Evidence | Expansion | Total /30 |
    | --- | --- | --- | --- | --- | --- | --- | --- |
    | Independent NYC cardiology | 3 | 4 | 4 | 3 | 3 | 4 | 21 |
    | Primary care wellness visits | 2 | 3 | 3 | 3 | 3 | 5 | 19 |
    | Direct to consumer | 3 | 1 | 5 | 4 | 2 | 2 | 17 |
    | Cardiogenetics clinics | 5 | 2 | 1 | 2 | 2 | 3 | 15 |
    | Lipid (cholesterol) clinics | 4 | 2 | 2 | 2 | 1 | 4 | 15 |
    | Sports screening (many minors) | 2 | 2 | 2 | 1 | 1 | 2 | 10 |

  - Note: `Deciding reason: cardiology criteria need which relative, which side and what age, out to grandparents, aunts and uncles [76][77][72]; Medicare's wellness visit requires, at minimum, only parents, siblings and children [104]. One practice manager can say yes. If access were 2 instead of 4, primary care would tie, so the 5 manager calls on A11 decide.`
  - Footer: `Team judgment before any buyer call; each column 1–5, 5 = good for us (Burden: 5 = light). [76] ACC/AHA 2018 · [77] Simon Broome · [72] AHA/ACC 2024 · [104] 42 CFR 410.15.`
  - Page counter: `Backup A6  ·  Wedge scoring`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. Q&A owner: Raj. Use the 'any doctor' answer in slide 9's notes. Cardiology does not win on Pain (cardiogenetics and lipid clinics score higher); it wins on Access and Cycle: one practice manager can say yes. Decision rule from any-physician.md: if fewer than 3 of 5 cardiology practice managers name a budget owner by Oct 23, run the same five calls with primary care practice managers before choosing the pilot.
  ```

### A7 · Competitors (`a07_pg`)

- **Title:** We found no product that does all four.
- **On-slide text:**
  - Kicker: `A7  ·  COMPETITORS`
  - Table:

    |   | Relatives answer for themselves | Per-fact status + source | Fact from a relative's portal | Cardiology page for the clinician | Price |
    | --- | --- | --- | --- | --- | --- |
    | Stemma | Yes | Yes | Yes (test server) | Yes | $500 per cardiologist/yr after a $1,000 pilot |
    | FamGenix | Partly [S31] | Not documented | Not documented | Heart model, extra fee | 20 trees free; $500/clinician/yr [111] |
    | 23andMe family health tree | No: you type them in | Not documented | Not documented | No: private to you | Not checked |
    | Invitae Family History Tool | No | No | No | Cancer focus | Free [107] |
    | Phreesia / IntakeQ | No | No | No | General intake | Free through 2026 [112] / $54.90/mo [114] |
    | Epic MyChart check-in | No (patient alone) | No | n/a | Inside Epic | Health system; opens up to 7 days before [S4] |

  - Footer: `“Not documented” = the vendor's pages don't say; we say “we found no”, not “there is no”. FamGenix is closest; not yet tested hands-on. My Family Health Portrait (free US tool; original CDC host offline since Apr 2026 [S7]) does none of the four. 23andMe: help article, Oct 11, 2026. [S4] MyChart guide · [S31] FamGenix app listing.`
  - Page counter: `Backup A7  ·  Competitors`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. Q&A owner: Viha. If asked 'how is this different from 23andMe?': 'On 23andMe's family health tree you type in your relatives' conditions yourself, and only you can see them. In Stemma relatives can answer for themselves, every fact keeps who said it, and the practice gets a page.' If the FamGenix hands-on test happens before Oct 16, replace the footer's 'not yet tested hands-on' with what we found.
  ```

### A8 · Evidence (`a08_pg`)

- **Title:** Similar tools get used; payment has no evidence yet.
- **On-slide text:**
  - Kicker: `A8  ·  EVIDENCE`
  - Column 1 header: `INTERVIEWS (OUR COURSE LOG)`
  - Column 1:
    - `21 logged: 15 patients, an internist, a nurse, 2 physician assistants, an ER doctor (ID010), a genetics counselor (D021).`
    - `ID007, cardiac patient: the core story (notes).`
    - `ID006: a specific question surfaced a mother's condition (notes).`
    - `ID010: wants a flagged, scannable summary; more value in primary care (notes).`
    - `D021: types every relative into Progeny (pedigree software) by hand; ~20% questionnaire return. “There has to be a human in the loop to make the judgment about what matters.”`
  - Gap box: `Gap: 0 practice managers · 0 cardiologists · 0 relatives`
  - Column 2 header: `LITERATURE`
  - Figure `57.6%`: `of parent/sibling heart attacks caught by self-report [87]`
  - Figure `48.9%`: `of new cardiology patients answered a no-login pre-visit link (Korea) [S12]`
  - Figure `99.8% vs <4%`: `family trees meeting quality criteria: guided tool vs charts [84]`
  - Figure `57%`: `of invited patients finished a short clinic-sent chatbot (cancer risk) [92]`
  - Figure `7.8%`: `of eligible patients enrolled when invited to a consented research study (vs 57% above) [91]`
  - Footer: `(notes) = our note-taker's wording; quotation marks only where the log has them. [84] Wu, MeTree, BMC Fam Pract 2014 · [87] SCAPIS, Eur J Epidemiol 2026 · [91] IGNITE, Genet Med 2019 · [92] Nazareth, Obstet Gynecol 2021 · [S12] Choi, JMIR Med Inform 2026.`
  - Page counter: `Backup A8  ·  Evidence and interviews`
- **Speaker notes** (word for word from the deck):

  ```text
  Not presented. Q&A owner: Raj. 21 logged interviews (ID001-ID020 and D021); only ID007 is a cardiology patient; 0 managers, 0 cardiologists, 0 relatives. Use 21; never 30. If calls or a clinician scan test happen before Oct 16, update the Gap box.
  ```

### A9 · Market and expansion (`a09_pg`)

- **Title:** NYC cardiology first; growth adds specialties.
- **On-slide text:**
  - Kicker: `A9  ·  MARKET AND EXPANSION`
  - Market tile `7,699`:
    - `US independent cardiologists [99]`
    - `$3.8M/yr at $500 · $9.1–13.8M at the higher prices on A4`
  - Market tile `285–320`:
    - `NYC independent cardiologists [S27]`
    - `$142–160k a year at $500: a pilot market, not a business`
  - Path (five arrow shapes, left to right): `3 pilot groups` → `~20 NYC cardiology groups` → `Larger and investor-owned groups` → `Genetics and lipid clinics` → `Primary care wellness visits [104]`
  - Note:
    - `Each step reuses the tree, relative links and sources; a new specialty adds its own questions and clinician criteria, signed off by that specialty (cardiology's are built, not yet signed off; other visits get a general question set, no criteria). Markets beyond independent cardiology are not yet sized.`
    - `“Independent” = organizations of ≤100 clinicians (includes some hospital practices). Of NYC's 285–320, 144 work in the 39 groups with 2+ independent cardiologists (median 2); about 19–20 of those groups are cardiology-focused once hospital-linked ones are removed (to confirm by phone).`
  - Footer: `[99] CMS Doctors and Clinicians national file; [S27] our analysis of it, Oct 2 and Oct 6, 2026. [104] 42 CFR 410.15: the Medicare Annual Wellness Visit requires family history.`
  - Page counter: `Backup A9  ·  Market`
- **Speaker notes** (word for word from the deck):

  ```text
  If asked 'isn't the market tiny?': independent cardiology alone, yes. It's the wedge; growth is larger groups, then genetics and lipid clinics, then primary care (slide 9).
  ```

### A10 · Privacy and safety (`a10_pg`)

- **Title:** Synthetic now; a business associate the day practices pay.
- **On-slide text** (five rows, label then text):
  - Kicker: `A10  ·  PRIVACY AND SAFETY`
  - Row `Today`: `Synthetic data only. Links carry their data after the #, which browsers never send to a server.`
  - Row `When a practice pays`: `We become a HIPAA business associate: signed BAAs with practices and vendors, two-step login, an access log, a breach plan (30 days NY, 60 FTC) [35][36][43].`
  - Row `Relatives`: `Each relative can answer or decline today; correcting or deleting a sent answer comes with the pilot.`
  - Row `Clinical line`: `Patients see facts, gaps and questions. Guideline criteria appear only on the care-team copy, addressed to the clinician (FDA clinical decision-support guidance, Jan 2026) [95].`
  - Row `Never`: `No ads, data sales, or insurer and employer channels (GINA, the genetic-bias law, has gaps [51]). We claim no HIPAA certification: none exists [55].`
  - Footer: `[35] 45 CFR 160.103 (HIPAA definitions). [36] FTC Health Breach Notification Rule. [43] NY Gen. Bus. Law 899-AA. [51] NHGRI. [55] Box HIPAA FAQ. [95] FDA decision-support software guidance, Jan 2026.`
  - Page counter: `Backup A10  ·  Privacy and safety`
- **Speaker notes** (word for word from the deck):

  ```text
  Is this a medical device? Patients see facts, gaps and questions, never risk scores. Criteria appear only on the care-team copy, each citing guideline and year. The care-team copy goes to the practice by link or QR, not through the patient's printer.
  ```

### A11 · Pilot design (`a11_pg`)

- **Title:** Completion before visit one decides the pilot.
- **On-slide text** (four cards, label then text, and two lines under them):
  - Kicker: `A11  ·  PILOT DESIGN`
  - Card `BY OCT 23`: `5 practice-manager conversations. 3 name the budget owner and accept $500/yr in principle; 1 signs a non-binding letter of intent.`
  - Card `THE OFFER`: `$1,000 flat for 12 weeks, credited to year one; then $500 per cardiologist per year. BAA first; no auto-renew.`
  - Card `THE METRIC`: `≥ 40% of invited adult new patients (first visit in weeks 2–12) have a reviewed summary in the chart before the visit. Benchmarks (A8): 48.9% (cardiology, Korea); 57% (short chatbot).`
  - Card `GO / NO-GO, WEEK 12`: `Go only if the metric is ≥ 40% and 1 of 3 signs annual. High completion but no payer: switch buyer (lipid or cardiogenetics clinics, or primary care). Under 20%: fix the flow.`
  - Checks line: `Also measured: clinician rating ≥ 4/5 with a scan under 60 s · ≥ 25% get a relative's answer · staff minutes · ≤ 2 alerts per summary (alert fatigue) · founder support minutes`
  - Critical path line: `Critical path (proposed): company Nov 15 · counsel reviews BAA and privacy policy Dec 1 · cardiologist signs rule table Dec 15 · pilot backend Dec 15 · hosting under BAAs and insurance Jan 5`
  - Page counter: `Backup A11  ·  Pilot design`
- **Speaker notes** (word for word from the deck):

  ```text
  Day 1 of the pilot: also text patients already booked, so the first weeks produce data.
  ```

### A12 · The full care-team page (`a12_pg`)

- **Title:** The full care-team page, as the practice gets it.
- **On-slide text:**
  - Kicker: `A12  ·  THE FULL CARE-TEAM PAGE`
  - Footer: `One printed page, shown as two halves; open stemmahealth.vercel.app/practice to read it. Synthetic demo family. On this copy “Declined to share” means Chose not to share.`
  - Page counter: `Backup A12  ·  Care-team page`
- **Visual:** the full care-team page for the synthetic demo family (`public/pitch/a12-care-full.png`) in a plain frame.
- **Speaker notes** (word for word from the deck):

  ```text
  The practice view (/practice) shows this page for the demo patient, with Print, Copy as chart text, Download FHIR and a clinician-review switch. In a pilot it arrives by the read-only link or the check-in QR.
  ```

---

## Q&A bank

One person answers, in about 20 seconds, then stops. Default owners: Raj (problem, interviews, privacy, safety, technical), Viha (product, relatives, competitors), Unser (buyers, price, costs, market). The backup page to jump to is in the last column.

| # | Question | Answer | Owner · page |
| --- | --- | --- | --- |
| 1 | Why would a practice pay when intake tools and lab family-tree tools are free? | Maybe it won't; that's our riskiest claim: a practice pays $500 per cardiologist a year despite free intake tools, and none of our 21 interviews was a practice manager. Free tools ask yes or no; we get which relative and what age, with sources, into the chart before visit one. We priced at FamGenix's $500 clinician license [111], not at saved time, which only breaks even (A3). The practice's score stays negative unless the pilot shows time saved or clinical value; if managers won't pay, we switch buyers (lipid or cardiogenetics clinics, or primary care). | Unser · slide 7, A3, A11 |
| 2 | How is this different from FamGenix, My Family Health Portrait or MyChart's check-in? | We found no product that does all four: relatives answer for themselves, every fact has a status and a source, one fact can come from a relative's own portal (a test server today), and the clinician gets a cardiology page. FamGenix comes closest: relatives can partly share in its app [S31]; we haven't tested it hands-on yet. MyChart's check-in is the patient alone, opening up to 7 days before the visit [S4]. My Family Health Portrait does none of the four; its original CDC host has been offline since April 2026 [S7]. | Viha · A7 |
| 3 | Isn't self-reported family history unreliable? | Often, yes: self-report caught about 58 of 100 heart attacks in parents and siblings (sensitivity 57.6% [87]). That's why every fact shows who said it and a status in words, relatives answer for themselves, and the clinician decides what matters. | Viha · A0, A8 |
| 4 | What if relatives don't answer, or grandparents can't use a phone? | The tree still works: a gap shows as Unknown or Not asked yet, never "no history". Relatives are our least-tested step: 29% dropped at the invite step in a similar app [93], and we haven't interviewed a relative yet. The pilot measures it: at least 25% of patients should get a relative's answer. In MeTree, 26% of users needed help, most of them over 60 [90], so the pilot has a help line. | Viha · slide 4, A5, A11 |
| 5 | Is it HIPAA compliant? What about relatives' privacy? | There's no HIPAA certification, and we claim none [55]. Today the prototype holds synthetic data only, and links carry their data after the #, which browsers never send to a server. When a practice pays, we become a HIPAA business associate: signed BAAs with practices and vendors, two-step login, an access log and a breach plan [35][36][43]. Each relative can answer or decline today; correcting or deleting a sent answer comes with the pilot. | Raj · A10 |
| 6 | Is this a medical device? Are you giving medical advice? | Patients see facts, gaps and questions, never risk scores. Guideline criteria appear only on the care-team copy, addressed to the clinician, each citing its guideline and year: under FDA's January 2026 guidance, any recommendation shown to patients is a device [95]. The care-team copy goes to the practice by read-only link or check-in QR, not through the patient's printer. The clinician decides. | Raj · slide 6, A10 |
| 7 | Does it pull family history from MyChart? How does it get into Epic? | No. Portals don't have to share family history, so a relative shares one condition from their own problem list, read-only, with their own login [7][10]. Today that runs on the public SMART Health IT test server, not Epic's. Epic can't write family history from apps into the chart, so the page goes in as a PDF. | Raj · slide 8 |
| 8 | Isn't the market tiny? | Independent cardiology alone, yes: 7,699 US independent cardiologists, about $3.8M a year at $500 [99], and New York is a pilot, not our market. It's the wedge; growth is larger groups, then genetics and lipid clinics, then primary care (slide 9). Markets beyond independent cardiology are not yet sized, so we don't quote a number for them. | Unser · A9 |
| 9 | Shouldn't this be for any doctor? | (About 20 s; the words in slide 9's notes.) "For the patient, it already does: pick primary care or another specialist and you get a general question set, with no clinician criteria. Only cardiology adds criteria so far, because criteria need a clinician's sign-off. But a wedge needs one buyer who can say yes. Cardiology needs more detail than primary care: which relative, which side, what age, while Medicare's wellness visit requires, at minimum, only parents, siblings and children. And we haven't spoken to a single practice manager yet. If cardiology managers don't name a budget owner, primary care is our next call list." Evidence: [76][77][72]; the wellness visit rule [104]. If pushed on market size, use row 8 and don't quote a primary-care number. The decision rule behind it (A6 notes): if fewer than 3 of 5 cardiology practice managers name a budget owner by Oct 23, we run the same five calls with primary care practice managers before choosing the pilot. | Raj · slide 9, A6 |
| 10 | Why independent cardiology, not Weill Cornell, the ER or primary care? | Cardiology guidelines need which relative, which side and what age, out to grandparents, aunts and uncles [76][77][72], and one practice manager can say yes. The ER doctor we interviewed sees more value in primary care (ID010, notes); it's on our path and our fallback buyer. Hospital clinics buy slowly: two in three hospital executives said selecting a digital tool takes six months or more (2022 survey [S46]). | Raj · A6 |
| 11 | How many people did you talk to? Any cardiologists or practice managers? | 21 logged interviews: 15 patients, an internist, a nurse, 2 physician assistants, an ER doctor and a genetics counselor. One patient (ID007) was a cardiology patient. No practice manager, cardiologist or relative yet; the 5 manager calls due Oct 23 start to close that gap. | Raj · A8, A11 |
| 12 | What did you take from 23andMe? | The core difference stays: on 23andMe's family health tree you type in relatives' conditions yourself, and only you see them. In Stemma, relatives can answer for themselves, share one condition from their own portal, and every fact keeps who said it. What we took: four editing patterns from their help article, shipped together with two clinical fixes from the same audit. All six are live on stemmahealth.vercel.app since Oct 12, on synthetic data. From 23andMe: undo after "Remove from tree", and the grandparent slots can't be removed; change an added relative's relationship without losing their answers; "Add a relative to {name}" from any person; and an ask-first note with "Send {name} a link instead", which turns their advice to get a living relative's permission into a button. From our audit: a "sudden or unexpected" switch on a death that feeds the sudden-death rule, and Marfan or bicuspid valve listed as "also noted", not as a guideline item. None of this is on the slides. | Viha · slide 3, A7 |

Three more if there's time: **"Does it save the practice time?"** Unproven: a 2026 trial found no shorter counseling time with a pre-visit tool [S9]. At $500 a year, saved staff time only breaks even (A3), so we don't claim it; the pilot measures staff minutes (Unser). **"When does the link go out?"** With the new-patient paperwork when the visit is booked (average cardiology wait 33 days [S2]); how far ahead is up to each practice (Viha). **"Who built it, and can you maintain it?"** Be direct: the code was written with an AI coding assistant (the git history shows it), the team member who owns the code explains the architecture, and the logic tests pass (code owner).

---

## Open items for the team (facts only you can confirm)

1. **Interview count.** The earlier "What we heard" slide (`slides/build-what-we-heard.cjs`, `.pptx`, `.png` in the repo) still says 30; Team Hub logs 21 (ID001–ID020 and D021), and the deck says 21 everywhere (A8's notes: "Use 21; never 30"). Log the other 9 with IDs and notes, or change that slide to 21, before it goes into any PDF.
2. **Practice-manager calls.** Team Hub records none, and Milestone 1 promised at least 3 owner or manager interviews. If any happen before 5 pm Oct 16, update slide 7's tile 3 and riskiest-claim line with the template in slide 7's notes ("We asked [N] practice managers; [M] named a budget owner and [K] would sign a letter of intent") and A8's Gap box. Never say "booked" unless booked. The ask is a non-binding letter of intent until we have a company, a BAA template and insurance. Decision rule (A6 notes): if fewer than 3 of 5 name a budget owner by Oct 23, run the same five calls with primary care practice managers.
3. **Any cardiologist** who has seen the care-team page? Run the clinician scan test (VCA test 2) with at least 2 cardiologists or cardiology PAs before Oct 16 and put the result on slide 7 and in A8's Gap box.
4. **Target-user interviews.** Only ID007 is a cardiology patient. Interview 5 adults who had a first cardiology visit in the past year: what the form asked, whether they were sent to ask relatives, whether they'd answer a practice link. Log them as ID022 onward.
5. **Grading criteria.** The four criteria (Analysis, Mockup, Central business logic, Execution and participation) are in `maker-day-2-rubric.md`, transcribed from the course site.
6. **Speaker split (final in the deck notes).** Raj 1, 2, 9; Viha 3–6; Unser 7–8. Name the code owner for Q&A, who can explain the architecture and the AI-assisted build without notes.
7. **Demo family (fixed).** Alex is the patient. Mom's side: Mom, Grandma Rosa (very high cholesterol around 35, reported by Mom), Grandpa Luis (Not asked yet). Dad's side: Dad (Reports disagree: Mom says heart attack at 60, Uncle Dev says angina at about 58), Grandpa Ray (Unknown), Grandma June (Chose not to share), Uncle Dev (atrial fibrillation at 34: condition from his portal record, age from his answer). The care-team screenshots on slide 6 and A12 show the app's clinical label "Declined to share"; A12's footer says it means Chose not to share. After Oct 16, align the app's clinical labels with the five status words and rename the app's portal label "MyChart (SMART sandbox)" to "Patient portal (SMART sandbox)", since the test server is not Epic's.
8. **Product fixes.** Done Oct 7, 2026, before the screenshots: the patient's Print button prints the patient's copy and the care-team copy reaches the practice only by read-only link or QR; a second-degree relative's reported high cholesterol is labeled with Simon Broome criteria (Dutch Lipid Clinic only for first-degree relatives), with no cascade-screening line for adults; the invite text carries no health information and no time claim. Done Oct 12, 2026, live on production: the six tree changes in Q&A 12. None of them changes a status word, the demo family or a deck screenshot, and the deck doesn't present them.
9. **Intake forms.** Slide 2 recreates the yes/no grid from Weill Cornell's 2016 cardiology form [S5] and credits it in the footer. Before Oct 16, download posted new-patient forms from 5 independent NYC cardiology groups on the [S27] list, report what they ask (for example "k of 5 ask age, 0 of 5 ask side"), and reword the "intake forms take it from memory" clause if they differ. Ask each practice manager for their own form and EHR check-in.
10. **Presenting setup.** From the uploaded PDF on a course machine, or your own laptop? Clicker available? Upload the PDF by noon on Oct 16 and open it on another device to check fonts and crops: slide 3's arrow labels and price bar, slide 7's tiles, slide 9's wedge box and QR code, A0's first card, A1's cost box and A4's Year 1 box.
11. **Screenshots.** Slides 4–6 and A12 use production captures of Oct 7 (`public/pitch/`). Keep uncropped versions for the Milestone 4 PDF (the six screens in `value-creation-analysis.md`, "Mockup screens").
12. **FamGenix hands-on** (free tier, one synthetic cardiac family) before Oct 16, so the comparison isn't from its marketing pages and app-store listing. If it happens, replace A7's "not yet tested hands-on" with what we found.
13. **Company and counsel.** A practice will expect a company, not three students, to sign the BAA and send the invoice (NY LLC publication rules [S53]). Agree who forms it and when (proposed Nov 15, as on A11), and book a Cornell law clinic for the BAA template, the privacy policy and the care-team page question.
14. **Label the genetics counselor D021** (not ID021) and keep her first name off slides. She has not agreed to review anything; don't list her as a reviewer.
15. **Name and trademark.** "Stemma" is fine as a class-project name, but there is a pending US trademark application for **STEMMAMD** (Stemma Inc, filed Aug 25, 2026, classes 9 and 38, patient medical-information software), close to our name and our field. Ask counsel (item 13) for a clearance search before incorporating, registering a domain or filing under the name, and keep a fallback name ready. The plain word STEMMA is also a live US registration (Teradata US, Inc., Serial 90801129, class 42, data-catalog software): a different field, but the clearance search should cover it.
16. **The website behind the slide 9 QR code.** Checked Oct 12: the home page, /for-practices, /how-it-works and /pilot show the deck's price ($1,000 for a 12-week pilot, credited to year one, then $500 per cardiologist a year, with $99 a month as a price we also test), and the "Why cardiology?" FAQ is live. Check again before exporting the PDF on Oct 16.
17. **The VCA and the Miro board.** `value-creation-analysis.md` now uses slide 9's words (both business-logic sentences, the wedge, the vision), the riskiest claim from slides 7 and A3, and the deck's price. On the Miro board, replacement frames with the same words (header, central business logic, configuration, wedge and riskiest claim) were created on Oct 12, but a person still has to delete the old frames, drag the new ones into place and hand-edit the old lines left in other frames, all listed in `miro-kit/README.md`, before Oct 23 (slide 9's notes).

---

## Choices made where the research memos disagreed

| Topic | Memos | Choice |
| --- | --- | --- |
| Deck look | R1 said build in the website's visual language; R2–R6 and the user said the deck is separate | **The deck keeps the Team 709 theme.** Only the screenshots on slides 4–6 and A12 and the slide 9 QR code come from the site. No deck-colored legend next to a screenshot |
| Price | Research and R3: $99–149 per cardiologist a month; R2 and R5: $500 a year | **$1,000 for a 12-week pilot, credited to year one, then $500 per cardiologist a year; $99 a month is a higher price we test on the same card.** $500 a year is the only public per-clinician anchor [111], and saved staff time only breaks even at that price [S9], so it doesn't set the price. A4 also models $149 a month, our first guess |
| "People will buy it because…" | Earlier drafts: "intake forms ask yes or no…", then "cardiology practices need which relative, what condition and what age…"; reviewers: name the buyer and the price, match the form | **"…cardiology guidelines need which relative and what age, intake forms take it from memory, and for $500 per cardiologist a year a practice-sent link puts those details, sourced, in the chart before visit one."** Same words on slide 9, in the script, in the VCA and on the board |
| "We can make it because…" | R3: "three paying practices cover that cost" (true only at $149 a month); an earlier draft: "about ten two-cardiologist practices" | **"…which 17–21 paying cardiologists cover, founders unpaid."** Slide 8 gives the same number as 9–11 groups of two |
| How it works | The earlier deck had no overview, so a reader of the PDF couldn't tell who sends what to whom | **New slide 3 ("How Stemma works")** with the four steps, the 23andMe comparison and the price, plus **A0** for the terms and markers |
| Relative on slide 5 | R6: Grandpa Luis; an earlier draft: Uncle Dev | **Grandpa Luis**, because the real test-server record (atrial fibrillation since 2016, age 69) fits him. The footer says the record belongs to a made-up test patient, that Luis is still Not asked yet in the demo tree, and that Uncle Dev's atrial fibrillation came in this way |
| Slide 2 numbers | R6: "4 in 10 heart attacks missed" + 11%; R1: CDC 15.2% | **1 in 7 (15.2%) and 11% (UK records)** on the slide; 57.6% in A0, A8 and Q&A 3 |
| What the form shows | R1: one blank box, no grandparents, aunts or uncles | We opened the form [S5]: a yes/no grid per relative, then free-text lines for type and age of onset, and a question about sudden death. The slide recreates the grid, and its caption says a "Y" can't show if it came before 55 |
| Slide 7 tiles | An earlier "64% → 89%" read as a rise; MeTree's 99.8% | **16.1% vs 0.2%** (Toronto trial [S10]) and **57% of invited finished** [92], both labeled "not ours"; 99.8% moved to A8 |
| "Staff retype it" (R6 slide 2) | Rests on D021, a cancer genetics program | Replaced with "a quick question in the room" [117] |
| Pilot terms | R6: 1–3 groups, $500–1,000, 8–12 weeks; R5: $1,000, 12 weeks | **$1,000 for 12 weeks, credited to year one; then $500 per cardiologist a year.** A non-binding letter of intent first. No second pilot price |
| Scope: any physician or cardiology | Raj (Oct 12): "should be for any physician"; the memos: one specialty | **Vision: any doctor who needs a family history, one specialty at a time; wedge: 3 independent NYC cardiology groups.** A wedge needs one buyer who can say yes. Cardiology's questions and criteria are built, and a general question set (no criteria) covers other visits. Never "criteria for any physician" |
| Phreesia free period | Research: through Dec 31, 2026; R4: spring 2027 | The page says both; we say "free through at least 2026" |

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
- [S12] Choi E et al. "Implementation and Evaluation of a Social Networking Service-Based Mobile Patient-Generated Health Data System With Direct Electronic Medical Record Integration." JMIR Medical Informatics, 2026. PMID 42335468. https://europepmc.org/article/MED/42335468
- [S19] Amazon Web Services, Amazon SES pricing ($0.10 per 1,000 emails), opened Oct 6, 2026. https://aws.amazon.com/ses/pricing/
- [S21] Insureon, "Cyber insurance cost" (small businesses $129/month average; IT businesses $179/month), updated Apr 24, 2026. https://www.insureon.com/business-insurance/cyber-liability/cost (re-checked Oct 6, 2026)
- [S22] Insureon, "SaaS business insurance cost" (tech E&O $126/month), updated Jun 24, 2026. https://insureon.com/technology-business-insurance/saas-companies/cost (re-checked Oct 6, 2026)
- [S23] US Bureau of Labor Statistics, Occupational Outlook Handbook, Software Developers (median annual wage $135,980, May 2025). https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm (re-checked Oct 6, 2026)
- [S25] AccountableHQ (secondary), "Google Workspace HIPAA cost," found Oct 6, 2026 ($7/$14/$22 per user per month; not confirmed on Google's page). https://www.accountablehq.com/post/google-workspace-hipaa-cost-pricing-baa-requirements-and-plan-options
- [S27] Team analysis of the CMS Doctors and Clinicians national file [99], pulled Oct 2 and re-run Oct 6, 2026: 7,699 of 29,847 cardiologists in organizations of 100 or fewer (a proxy for independent; it includes some hospital practices); 2,152 such organizations with a median of 2 cardiologists; NYC 285–320 independent cardiologists (research.md's Oct 2 figure was 280–320), 122 small organizations (83 with one cardiologist), 39 organizations with 2+ independent cardiologists (144 cardiologists; median 2 per group; the mean of 3.7 is pulled up by two groups with 28 and 13), 22 where cardiologists are at least half the clinicians. The 39 include hospital-linked organizations (for example Maimonides Cardiology FPP, TBHC Medical Services PC of The Brooklyn Hospital Center, Icahn School of Medicine at Mount Sinai, and the Hospital for Special Surgery's legal entity); about 19–20 cardiology-focused groups remain after removing them (to confirm by phone). https://data.cms.gov/provider-data/dataset/mj5m-pzi6
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

**Named in the deck without a marker** (slide 3's footer and A7's footer):

- 23andMe Customer Care, "How to Build and Edit your 23andMe Family Tree", updated Oct 11, 2026 (opened Oct 12, 2026 for the tree audit): https://support.23andme.org/hc/en-150/articles/42963469462167-How-to-Build-and-Edit-your-23andMe-Family-Tree

**Other evidence:** Team Hub export (interview logs ID001–ID020 and D021; Milestone 1 track decision; advisor notes of Sept 9, 2026); `docs/mvp-spec.md`; prototype code (`src/lib/demo.ts`, `src/lib/clinical.ts`, `src/lib/store.ts`, `src/components/PersonPanel.tsx`, `src/components/person/EditPerson.tsx`); the live site, checked Oct 12, 2026.
