# Value Creation Analysis: Family Health Tree

Team 709 · Section 7 · TECH 5900 Product Studio · Milestone 4 (oral review Oct 12–23, PDF due Oct 23, 2026)
Raj Kashikar · Viha Srinivas · Unser Jaffry · Draft of Oct 6, 2026 (revised after review)

**How to read this.** `[n]` is a numbered source in `docs/research.md`. `[S#]` is a source opened for the pitch work (Oct 6, 2026). Both lists, with URLs, are at the end. Interview IDs (ID002, ID006, ID007, ID010, D021) match the Team Hub "Interview Logs". "(note)" means the note-taker's wording; words in quotation marks are only those the Team Hub notes put in quotation marks. **Assumption** marks our own estimate, with its math. Tags follow the course: **N** = new, **O** = old, **N/O** = some of each.

**The product in one line.** A patient builds a three-generation family health tree before a first cardiology visit. Relatives fill in their own branches from a text link (and can share one fact from their own patient portal). Every answer keeps its source and status (known, conflicting, unknown, declined). The patient reviews a one-page summary, and the practice gets a care-team copy the clinician can act on. Free for patients; cardiology practices pay. Live prototype, synthetic data only: https://family-health-tree-raj-s-projects12.vercel.app

---

## At a glance (for the top of the Miro board)

| | |
| --- | --- |
| **Step 4 verdict: Will people buy it?** | **Use: yes, if the practice sends the link. Buy: not yet shown.** Patients gain the most against what they use today, and clinic-sent pre-visit tools get finished (57% of 95,166 invited finished one [92]). No practice manager, cardiologist or relative is among our 21 logged interviews, so payment and clinician value are unproven. |
| **Step 5 verdict: Can we make it?** | **Yes at pilot scale, from about January 2027; not yet a business that pays salaries.** The patient-to-clinician flow runs today on synthetic data; the pilot backend is next. Running it under BAAs costs about $689–834 a month. At $500 per cardiologist per year, 17–21 paying cardiologists cover that; one salary (wage only) needs about 290, roughly every independent cardiologist in NYC. Founder support time (1–2 hours per practice a month) is unpaid and not in that cost. |
| **People will buy it because…** | cardiology practices need which relative, what condition and what age, their intake forms take it from memory, and a link they send gets those details, each with its source, into the chart before visit one. |
| **We can make it because…** | the patient side already runs on public standards, a PDF reaches any chart, and a pilot on vendors that sign BAAs costs under $850 a month, which about ten two-cardiologist practices cover with founders unpaid. |
| **Configuration most likely to succeed** | Independent NYC cardiology groups (2–10 cardiologists) pay; their adult new patients use it free; relatives answer by link; the care-team page reaches the practice by read-only link or fax, as a PDF; a $1,000 12-week founding pilot credited to year one, then $500 per cardiologist per year. |
| **Wedge** | 3 independent NYC cardiology groups (2–10 cardiologists); all adult new patients (one link in the new-patient paperwork), sharpest for palpitations, fainting, chest pain or high cholesterol. Success: at least 40% of invited new patients whose first visit falls in pilot weeks 2–12 have a patient-reviewed summary in the chart before that visit (read at weeks 6 and 12). |
| **Riskiest claim and its test** | A practice manager will pay. Test by Oct 23: 5 practice-manager conversations with a one-page price card. Pass = 3 of 5 name the budget owner and accept $500/yr in principle, and 1 signs a non-binding letter of intent naming a target start month. The paid letter follows once we have a company, a BAA template and insurance. |

---

## Step 1. Business Model Canvas

Every Post-it has a rank (order of preference inside its sub-group; ranks restart at 1 in each sub-group), its text (10 words or fewer) and its Step 3 tag. The "why" column is for the analysis around the canvas, not for the sticky.

**Miro tips.** One sticky per row, written as `sub-group rank [tag] text`, for example `Who pays 1 [O] Independent NYC cardiology groups, 2–10 cardiologists` and `Who uses 1 [O] Adult new patients, in the weeks before visit one`. Use three sticky colors for N, O and N/O and put a legend in the corner. Put a small dot on any sticky that rests on an untested assumption (Customer Segments: Who pays 1–2; Revenue Streams: From practices 1–3; Key Partnerships 1), so the coach sees what is a hypothesis.

### Customer Segments

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **Who pays (in order of preference)** | | |
| 1 | Independent NYC cardiology groups, 2–10 cardiologists | O | About 19–20 cardiology-focused groups of this size in NYC once hospital-linked ones are removed [S27]; decisions made on site |
| 2 | Practice manager holds budget; owner cardiologist signs | O | Milestone 1 buyer hypothesis (Team Hub). Untested: 0 of 21 interviews |
| 3 | Next: large independent and PE cardiology groups | O | CVAUSA 557+ physicians and APPs [102]; PE owned 1.5% of Northeast clinics [101] |
| 4 | Later: solo cardiologists, at a lower price | O | 83 of 122 small NYC organizations have one cardiologist [S27] |
| 5 | Later: health-system cardiogenetics, lipid and HCM clinics | O | Most pain per patient; two in three hospital executives say selecting a digital tool takes 6+ months [S46] |
| 6 | Later: primary care running Medicare wellness visits | O | The Annual Wellness Visit requires family history [104] |
| | **Who uses it (free)** | | |
| 1 | Adult new patients, in the weeks before visit one | O | 33-day average new-patient cardiology wait, 15 metros [S2] |
| 2 | Sharpest: palpitations, fainting, chest pain, high cholesterol | O | Where guideline family-history criteria apply [72][74][76][78]; ID007; ID010 |
| 3 | Adult relatives who answer for their own branch | N/O | Genealogy sites and FamGenix let relatives share [S31][S39]; sourced, per-relative answers in a pre-visit flow are new |
| 4 | Readers: cardiologists, PAs and NPs at the visit | O | ID010: a flagged, scannable summary would be more realistic (note). No cardiologist asked yet |
| | **Who validates** | | |
| 1 | Genetics counselors: reviewers to recruit; referral channel later | O | D021 builds pedigrees by hand in Progeny; she has not agreed to review |
| | **Not customers** | | |
| 1 | Never: ER, insurers, employers, wellness vendors, data buyers | O | Our inference for the ER: ID010 sees much higher value outside the ED (note); GINA gaps [51]; Illinois GIPA [52] |

### Value Propositions

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **For the patient (free)** | | |
| 1 | Who, what, what age, before the cardiology visit | N/O | ID007 recommends prompting for condition, relative, approximate age before specialist visits (note) |
| 2 | Guided questions with examples; side of family built in | O | ID006 (note); MeTree lineage 100% vs 28.4% in charts [84]; Progeny and MeTree already guide |
| 3 | Relatives answer for themselves by link, no account | N/O | No-account links are old (Calendly, DocuSign [S34][S36]); for relatives' health facts, new |
| 4 | Every fact marked known, conflicting, unknown or declined | N | No competitor documents per-fact status [research §4.5]; FHIR has it per relative only [17] |
| 5 | Every fact shows who said it, and when | N/O | Audit trails are old (DocuSign certificate [S37]); per-fact source in family history is new |
| 6 | One condition shared from a relative's own portal | N/O | Patient-access APIs are old [1]; a relative sharing into someone else's tree is new, untested |
| 7 | Patients see facts, gaps, questions; never risk scores | N/O | FDA CDS guidance [95]; tailored risk messages lowered cholesterol screening, OR 0.34 [94] |
| 8 | Free for patients and relatives; no ads, no data sales | O | Same as Zocdoc and OpenTable for consumers [S32][S40] |
| | **For the clinician** | | |
| 1 | Clinician gets one page: criteria, gaps, conflicts, pedigree | N/O | ID010: a flagged, scannable summary is more realistic (note). Scan < 1 min is a target, untested |
| 2 | Guideline criteria cited with year, for clinician review | N/O | D021: "There has to be a human in the loop to make the judgment about what matters" (she doubts patients can build pedigrees, note); CancerIQ does this for cancer [110] |
| 3 | Relatives who may need screening, flagged for clinician | N/O | Cascade screening guidance [74][72][80]; never priced on |
| 4 | FHIR FamilyMemberHistory export (validation pending) | N/O | US Core 9 profile is voluntary from Aug 29, 2026 [15][16]; not yet run through the validator |
| | **For the practice (payer)** | | |
| 1 | More family history in the chart before visit one | O | Emailed questionnaire + EHR upload, Toronto primary care: new family history documented within 30 days of the visit, 16.1% vs 0.2% [S10] |
| 2 | Fewer "go ask your family" loops (to measure) | O | ID007's cardiologist sent them home to ask (note) |
| 3 | Staff minutes saved: unproven, we will measure | O | A 2026 trial found no difference in counseling time [S9] |

### Channels

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **Reach patients (in order)** | | |
| 1 | Practice texts our link with new-patient paperwork | O | Clinic-sent link with 2 reminders: 64.2% engaged, 89.4% of them finished, 57% of invited [92]; 7.8% when offered as a consented research study [91]; Phreesia works this way [S43] |
| 2 | Front desk hands a QR card at booking | O | Same practice-sent trigger, offline |
| 3 | Free side door: patients find it themselves | O | Low uptake alone: only 15.2% of adults report actively collecting family history [S1] |
| | **Reach relatives** | | |
| 1 | Patient texts each relative a link from own phone | N/O | No health information in the text [research §1.2]; 29% drop-off at invite in a similar app [93] |
| | **Get the page to the practice (in order)** | | |
| 1 | Practice opens the care-team page by link or QR | O | Read-only link and QR are built [S28]; keeps guideline criteria addressed to the practice (research §3.5) |
| 2 | Fax from a BAA-covered backend (pilot) | O | About $0.045 a page [30]; vendor BAA to confirm |
| 3 | Patient uploads or brings the PDF (counsel first) | O | $0, works with every practice [research §1.7]; a care-team page carried by the patient is a counsel question (research open question 5) |
| 4 | SMART Health Link QR the practice scans (pilot) | N/O | New standard; CMS lists EHRs able to receive [27][29]; non-IAL2 app untested |
| 5 | EHR app or write-back (product stage) | O | Epic has no family-history create API [10] |
| | **Reach buyers (in order)** | | |
| 1 | Founders call and visit NYC practice managers | O | Target list from the CMS clinician file [99][S27] |
| 2 | Warm intros: interviewed clinicians, advisor, counselors | O | Ask ID002, ID009, ID014 which cardiology group they refer to (an ask, not a yes) |

### Customer Relationships

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **Practice (in order)** | | |
| 1 | Paid 12-week founding pilot, metrics agreed upfront | O | Tests payment and value in one step [research §5] |
| 2 | Annual contract after pilot; we set up the link | O | Setup is one link in existing paperwork (target: days, assumption) |
| 3 | Week-6 and week-12 report with the practice's numbers | O | Completion, relative replies, clinician use, staff minutes |
| | **Patient and relative** | | |
| 1 | Help line for patients and older relatives | O | MeTree: 26% needed help, 77% of them over 60 [90] |
| 2 | Patients: self-serve guided flow, tree kept for later visits | O | ID007: family history should be easy to update over time (note) |
| 3 | Relatives: one-time link to answer, decline, correct, delete | N/O | Per-person consent comes from privacy law [41][44]; intake has no second person |
| | **Clinician** | | |
| 1 | Clinician 'reviewed' lock; report wrong alerts back | N/O | Sign-off is old; locking a patient-built record is new for intake |

### Revenue Streams

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **From practices (in order)** | | |
| 1 | $1,000 founding pilot, 12 weeks, credited to year one | O | Top of research range $500–1,000 [research §5]; fallback $500 for 8 weeks |
| 2 | Then $500 per cardiologist per year | O | FamGenix Individual license anchor [111]; staff-time savings unproven [S9], so they don't set the price |
| 3 | Tested on same card: $99 per cardiologist per month | O | Low end of the original hypothesis [research §4.3] |
| 4 | Per completed summary, volume tiers (after legal review) | O | Volume-linked pricing needs counsel [research §4.2] |
| 5 | Later: enterprise license for large groups, health systems | O | One contract, many cardiologists [102] |
| 6 | Later: primary care wellness-visit module | O | AWV requires family history [104] |
| 7 | Last resort: disclosed, non-exclusive lab sponsor | O | Labs funded the chatbot in [92]; GINA and FTC risk [51][36] |
| | **Never** | | |
| 1 | Never: patient fees, ads, data sales, per-referral pricing | O | Anti-kickback and fee-splitting risk [research §4.2]; Zocdoc's per-booking model is what we avoid [S32] |

### Key Resources

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| 1 | Data model: every fact stores status and source | N | What no competitor documents [research §4.5]; enables conflicts, declines, portal facts |
| 2 | Cardiology rule set, cited and versioned by guideline year | N/O | Rule upkeep is old in cancer genetics [110]; cardiology set from [72]–[81] is new |
| 3 | Working prototype with real SMART on FHIR sandbox launch | O | Routes live, 10/10 logic tests pass, Oct 6 [S28] |
| 4 | Clinical reviewers to recruit: a cardiologist, a genetics counselor | O | Gap: no cardiologist yet; D021 (cancer genetics) has not agreed to review |
| 5 | 21 logged interviews; 1 target patient; no buyers yet | O | Team Hub: 15 patients from September diagnosis research (ID007 the only cardiology patient), 6 clinicians |
| 6 | BAA template, risk analysis, vendor BAA register | O | Needed before any real data [35][36][43] |
| 7 | Epic patient-app registration, read-only USCDI scopes | O | Free, auto-distributed when USCDI-only [5] |
| 8 | Three founders: Raj, Viha, Unser | O | Unpaid in year 1 |

### Key Activities

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **(next 3 months first)** | | |
| 1 | Sell paid pilots to practice managers | O | Riskiest assumption [research §5, row 1] |
| 2 | Measure completion, relative replies, staff minutes, clinician use | O | Pilot metrics [research §5] |
| 3 | Keep each relative's consent, declines and deletions straight | N/O | Duties from privacy law [41][44]; per relative inside one tree is new |
| 4 | Keep guideline rules current; clinician signs each version | O | Versioned rules page (mvp-spec §7) |
| 5 | Usability-test questions with adults over 60 | O | [90] |
| 6 | Get each summary into the practice's chart workflow | O | Which EHR? Ask on every call [research open question 1] |
| 7 | Operate as business associate: BAAs, MFA, audit, breach plan | O | [35][36][43]; NY breach notice 30 days |

### Key Partnerships

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **(in order of preference)** | | |
| 1 | 1–3 independent NYC cardiology groups as pilot sites | O | Unblocks every open question in Steps 4 and 5 |
| 2 | Clinical reviewers to recruit: a cardiologist, a genetics counselor | O | Sign off the rule table before any pilot; none agreed yet |
| 3 | Epic: free self-registered patient app | O | [5][11] |
| 4 | BAA vendors: Vercel Pro, Neon, Amazon SES | O | [61][63][68] |
| 5 | Law clinic: BAA template, privacy policy, FDA line | O | Cost unknown; ask a Cornell clinic first |
| 6 | SMART Health Links and CMS-aligned receiving EHRs | N/O | New standard, old CMS machinery [27][29] |
| 7 | Advisor looking for Weill Cornell admin contacts; none yet | O | Advisor suggested a departmental pilot with a BAA and will look into admin and CTL contacts (Team Hub, 9/9/26) |
| 8 | Later: Fasten or Flexpa for non-Epic portals | O | Flexpa startup tier $20,000/yr [22] |
| 9 | Labs only as disclosed, non-exclusive partners, if ever | O | Lab tools tie to test ordering [107] |

### Cost Structure

| # | Post-it (≤ 10 words) | Tag | Why / evidence |
| ---: | --- | :---: | --- |
| | **Now** | | |
| 1 | Now: founders' time, no salaries | O |  |
| 2 | Now: prototype hosting $0, synthetic data only | O | Vercel Hobby, non-commercial [58] |
| | **Pilot, per month once real data flows** | | |
| 1 | Hosting + database under BAAs: $411–457 a month | O | Vercel Pro $20–60 + HIPAA add-on $350 [61]; Neon Scale ≈ $41–47 [64][S18] |
| 2 | Cyber + tech E&O insurance: about $255–305 a month | O | Insureon medians $129–179 + $126 [S21][S22]; estimate |
| 3 | Email, storage, domain, team inbox: $23–72 a month | O | SES [S19]; Workspace prices secondary [S25] |
| 4 | Total about $689–834 a month; per-practice cash ≈ 0 | O | Sum of the three lines above; the real variable cost is founder support time (next Post-it) |
| 5 | Founder support: 1–2 h per practice monthly, unpaid | O | Estimate from [90] help rate; ≈ $65–131 a month at the BLS median wage [S23], against $83 a month from a 2-cardiologist practice |
| | **One-time** | | |
| 1 | Legal review of BAA and privacy policy: amount unknown | O | No figure verified |
| 2 | Form a company before any BAA or invoice | O | NY LLC: $50 certificate of publication plus notices in two newspapers within 120 days [S53]; filing and newspaper costs to confirm |
| | **Later** | | |
| 1 | Later: Epic listing $500/app/yr; Flexpa $20,000/yr | O | [11][22]; both optional |
| 2 | Cost-down: AWS BAA instead of $350 Vercel add-on | O | AWS lists BAA in Artifact, no fee stated [68][S20] |


---

## Step 2. Points of comparison

### 2a. Our customers' next best option

| Customer | Next best option today | What it costs them | Evidence |
| --- | --- | --- | --- |
| **Patient** (free user) | Memory, plus the practice's intake form or EHR check-in; in Epic health systems, the MyChart eCheck-In family-history questionnaire; calling relatives after the clinician asks | Free, but the details that count (which relative, which side, what age) rarely come through | A posted health-system cardiology form (Weill Cornell, 2016 version) has a "Heart Disease?" column for parents, siblings and children plus an "Other(s)" row, then a few free-text lines for type and age of onset; no side of family and no "not sure" [S5]. Independent practices' forms not yet collected. eCheck-In opens up to 7 days before the visit [S4]. ID007 learned of an uncle's young-onset arrhythmia only after the cardiologist sent them to ask (note) |
| Patient, free tool | My Family Health Portrait (NCI copy) | Free; data stays on the device | Original CDC host offline since April 13, 2026; no feature work since March 2025 [97][S7]. Matched a genetic counselor's coronary-risk call for 68% of people [88] |
| **Relative** (free contributor) | A phone call from the patient; nothing recorded | Minutes; memories differ; medical terms unknown | ID007: relatives remembered events differently and did not always know the medical terms (note) |
| **Clinician** (reader) | Asking in the visit; the EHR family-history box | Minutes per patient, often incomplete | Discussed in 51% of new-patient visits, under 2.5 minutes (US family physicians, Acheson et al. 2000, via [117]). Only about 11% of positive heart family-history entries named both relative and age [89]. 0 of 390 US charts had three generations [84] |
| **Practice manager** (payer) | In order: the family-history questions in its own EHR's patient check-in, already paid for (athenahealth's Enhanced Self Check-in can show family-history questions to patients [S52]); keep the current form; digital intake (Phreesia intake free through at least Dec 31, 2026 [112]; IntakeQ $54.90 a month [114]; Jotform HIPAA tier $99 a month billed yearly [S41]); free lab pedigree tools [107]; FamGenix (free up to 20 pedigrees; Individual license $500 a year; patient questionnaires and its QRisk cardio model listed at an additional fee [111]) | $0 for the EHR check-in it already has; $0 to about $130 a month for forms; $500+ per clinician per year for FamGenix | See Step 4. Test 1 asks each manager to show us the form and the EHR check-in |
| Genetics programs (later) | Progeny, filled in by hand from Epic, a chatbot and paper forms | Staff time; about 20% questionnaire return | D021 (note) |
| Health-system clinics (later) | MyChart questionnaires plus cancer-risk vendors | Already licensed | [109][110] |
| Primary care wellness visits (later) | EHR template; the AWV requires family history | Inside the visit | [104] |

### 2b. The organization whose operations are closest to ours: Phreesia

We need to run seven operations. Who already runs them (Y yes, P partly, N no, ? not checked):

| Operation | **Phreesia** | CancerIQ | Progeny | CancerGene Connect | Zocdoc | FamGenix |
| --- | --- | --- | --- | --- | --- | --- |
| A. Sells to outpatient practices; the practice pays | **Y** [S29] | P (health systems, clinics) [110] | P (genetics programs) [108] | P (genetics clinics; now part of a lab) [S16] | Y (per booking) [S32] | P ($500 per clinician per year) [111] |
| B. Practice-sent link; patient answers before the visit | **Y** ("a few days before your appointment") [S43] | P [110] | P (questionnaire) [108] | Y [S16] | N | P (patient app) [S31] |
| C. Answers land in the practice's chart | **Y** ("integrate with most major" EMR and PM systems) [S29] | Y [110] | Y [108] | P [S16] | ? | ? |
| D. Clinical rules flag patients for the clinician | ? | Y [110] | P (cancer) [108] | Y [S16] | N | P (shows risk to patients) [S31] |
| E. Family history specifically | P (general intake) | Y | Y | Y | N | Y |
| F. Relatives contribute | N | N | N | N | N | Y [S31] |
| G. Proven at scale, with public numbers | **Y**: about 180M patient visits a year; FY2026 revenue $480.6M from 4,514 average clients [S29][113] | P: 275+ clinics (self-reported) [110] | ? | P: 12,000+ cases, sold for about $6M in stock (2017) [S16] | Y | N: 15 App Store ratings, last iOS update Feb 2025 [S31] |

**Pick: Phreesia.** It runs A, B, C and G, the operations that decide whether this works as a business: selling to practices, getting patients to finish before the visit, landing data in the chart, and doing it at scale. The parts it doesn't run (D, E, F) are our product.

| Phreesia does | We copy | We don't copy |
| --- | --- | --- |
| The practice sends a link before the appointment [S43] | The trigger, and the practice's name on the message | Timing: we need weeks, not days, to reach relatives, so ask practices to send at booking |
| Direct sales; healthcare sales cycles of "three to twelve months" [S29] | Founder-led selling; a paid pilot to start sooner | |
| "Most practices go live in as little as six weeks" [112] | Make go-live a selling point (ours is one link) | |
| Subscription revenue (46% of FY2026 revenue) plus life-sciences "network solutions" (29%) [113] (our math from reported lines) | A practice-paid subscription | Pharma or lab money on family data (GINA, FTC rule, GoodRx precedent [51][36][39]) |
| Spends 20.9% of revenue on sales and marketing [113] (our math) | Budget real selling time | |
| Free intake through at least the end of 2026 to win practices [112] | A first period that lowers the buyer's risk (pilot fee credited to year one) | Free-to-practice pricing: we can't fund it |

**Runner-up for the clinical half: CancerIQ** (with Progeny and CancerGene Connect). These collect family history, keep guideline rules current and flag patients inside the EHR [110][108][S16]. The lesson: they sell to health systems and lean on cancer, where genetic testing pays for the workflow. CancerGene Connect, a pre-visit family-history tool with 12,000+ cases, sold to a lab for about $6M in stock in 2017 [S16]. Labs are the natural owners of these tools, which is why our buyer is the practice and we stay lab-neutral.

**Why not FamGenix here:** it is the closest *product* (invited relatives share and update their own data in its app [S31]; Individual license $500 a year [111]), so it belongs in 2a as a next best option, but its operations are small and mostly undocumented.

### 2c. Other industries where this business model already works

| Business | Free side | Paying side | Mechanism like ours | What we take | What we refuse |
| --- | --- | --- | --- | --- | --- |
| **Calendly** | Invitees: "meeting invitees do not require a seat" [S34] | Hosts, per seat [S34] | A link that works with no account; a success page invites the invitee to sign up [S35] | Relative's link must work with no account and show value at once; after answering, offer "start a tree for your own visit" | |
| **DocuSign** | Signers: recipients "do not need an account to sign" [S36] | Senders, per user [S36] | Every signer's name, time and IP on a certificate [S37] | The record of who said what, and when, is part of what the buyer pays for | |
| **OpenTable** | Diners | Restaurants: a monthly fee plus per-cover fees (third-party summary) [S40] | Consumer tool, business pays | Charge the side that runs the operation and feels the gap | Per-diner pricing (per new patient for us: kickback risk) |
| **Zocdoc** | Patients | Independent practices pay a per-booking fee [S32]; $35–110 per booking at the 2019 switch [S33] | Patient-facing, practice-paid, NYC-based | Independent practices do pay for patient-facing tools; give them a fixed, capped price | Per-new-patient fees [research §4.2] |
| **Jotform / IntakeQ** | Form respondents | Form owners: Jotform HIPAA tier $99 a month billed yearly [S41]; IntakeQ $54.90 a month [114] | Practice-built forms sent to patients | Sets the ceiling for "just a form" at about $55–130 a month; any higher price must rest on what a form can't do | Competing on form building |
| **Doximity** (counter-example) | Clinicians: free [S42] | Mainly pharmaceutical manufacturers and health systems [S42] | Free users, third party pays | | A pharma payer on family history, which is genetic information under GINA [50][51] |

**Mechanisms we borrow from businesses with a different payer** (not our business model, so not in the table): Ancestry and MyHeritage, where invited relatives add to one tree with set roles [S38][S39] (we take: design for one motivated builder; we refuse: accounts for relatives and DNA-style linking, after the 23andMe breach [115]); TurboTax, a guided interview that imports from an official source and then asks the user to confirm [S44] (we take: import a portal fact, then ask the relative to confirm the age).

**One line for the board:** we copy Calendly's no-account link, DocuSign's audit trail and Phreesia's practice-paid, practice-sent intake; we refuse Zocdoc's per-new-patient fee and Doximity's pharma payer.

---

## Step 3. What's new and what's old

**Tagging rule.** O = the closest operations (Phreesia, CancerIQ, Progeny) or a direct competitor already does it this way. N = none of our points of comparison does it. N/O = done in another industry or another clinical area (usually cancer genetics) but new in pre-visit cardiology family history, or an old part used in a new way.

| Box | N | N/O | O | Total |
| --- | ---: | ---: | ---: | ---: |
| Customer Segments | 0 | 1 | 11 | 12 |
| Value Propositions | 1 | 9 | 5 | 15 |
| Channels | 0 | 2 | 9 | 11 |
| Customer Relationships | 0 | 2 | 5 | 7 |
| Revenue Streams | 0 | 0 | 8 | 8 |
| Key Resources | 1 | 1 | 6 | 8 |
| Key Activities | 0 | 1 | 6 | 7 |
| Key Partnerships | 0 | 1 | 8 | 9 |
| Cost Structure | 0 | 0 | 11 | 11 |
| **All** | **2** | **17** | **69** | **88** |

**Where the new sits.**
- **N (2):** per-fact status on every answer (Value Propositions, patient 4) and the data model behind it (Key Resource 1). We found no competitor that documents per-fact known/conflicting/unknown/declined [research §4.5]; FHIR has these states only for a whole relative [17].
- **N/O (17), the main ones:** relatives answering for themselves (genealogy and FamGenix let relatives share [S38][S39][S31]; sourced answers per relative in a pre-visit flow are new); a relative sharing one portal fact into someone else's tree (patient-access APIs are old [1]); guideline criteria on the clinician's copy only (rule flags are old in cancer genetics [110]); the patient-sends-relatives channel (no-account links are old [S34][S36]); per-relative consent and the "reviewed by clinician" lock.
- **O (69):** every channel to the practice, every revenue stream and every cost line copies models that already work (Phreesia, IntakeQ, FamGenix, Zocdoc's buyer).

**What the tags tell us:** what we sell is new; how we sell it is old. The new parts are exactly the ones that need evidence: relatives answering (29% dropped out at the invite step in a similar app [93]), portal facts (untested), and clinicians trusting a patient-built page (no cardiologist interviewed). The old parts lower the risk of the business model but also mean the buyer already has cheap substitutes, which is why price is the riskiest assumption.

---

## Step 4. Will people buy it?

### 4.1 Net benefit against each stakeholder's next best option

| Who | Next best option today | What they gain with us | What it costs them | Net |
| --- | --- | --- | --- | --- |
| **Patient** (free) | Memory, a call to Mom, a yes/no family-history grid with a few lines for details | Guided questions by side of family; relatives answer for themselves; one page to review and bring; easy to update (ID007) | About half an hour on average (MeTree 27.1 min [90]; a shorter clinic-sent chatbot 15.4 min [92]); asking family; privacy worry | **+** when the practice asks |
| **Relative** (free) | A phone call from the patient | Answer once, for yourself; "not sure" and "prefer not to say" are real answers; see who reads it; decline; optional portal fact | A few minutes; trusting a health link; grief and family burden after a sudden death [S14]; GINA doesn't cover life, disability or long-term-care insurance [51] | **0**, unproven: a favor to family (no relative interviewed) |
| **Clinician** (reader) | Asking in the visit; the EHR box | One page: who, what, what age, how sure, with guideline criteria for review. ID010: a flagged, scannable summary would be more realistic (note). D021 (cancer genetics) doubts patients can build pedigrees and expects low engagement; she favored a guided flow that builds the pedigree, which is what we built (note). No cardiologist has seen the page | One more document; self-report is imperfect (57.6% sensitivity for parents' and siblings' heart attacks [87]); alert fatigue (76.4% of MeTree completers got a recommendation [118]) | **+?** if it scans in under a minute with at most two specific alerts (no cardiologist asked yet) |
| **Practice** (pays) | Its EHR check-in or current form [S52][S5]; Phreesia intake free through at least 2026 [112]; free lab tools [107]; FamGenix Individual $500/yr [111] | More family history reaches the chart (new family history documented within 30 days of the visit for 16.1% vs 0.2%, with an emailed questionnaire plus EHR upload, in Canadian primary care [S10]); guideline-relevant findings surfaced (28.5% of completers met counseling criteria in a 2026 cancer trial [S9]); fewer "go ask your family" loops | A new fee against free substitutes; a workflow change (one link, file one page); a BAA and security review; vendor risk; no billing code pays for it (96160 pays $3.01 [103]) and history-taking no longer sets the visit level [105] | **? not proven** |

### 4.2 Scored version (team judgment, +2 to −2 against each stakeholder's next best option)

| Factor | Patient | Relative | Clinician | Practice |
| --- | --- | --- | --- | --- |
| Quality of what reaches the visit (counts double) | +2 | +1 | +2 | +1 |
| Time and effort | −1 | −1 | +1 if < 1 min scan | ? (unmeasured; contested [S9]) |
| Money | 0 (free) | 0 | 0 | −2 (new fee vs free substitutes) |
| Trust and privacy | −1 | −1 | −1 (self-report) | −1 (BAA, vendor risk) |
| Switching cost | 0 | 0 | −1 (new document) | −1 (workflow change) |
| Sum, unweighted | 0 | −1 | +1 (with < 1 min scan) | −3 + unmeasured time |
| **Sum, quality counted double** | **+2** | **0** | **+3** (with < 1 min scan) | **−2 + unmeasured time** |
| **Net** | **+** when the practice asks | **0**, unproven | **+?** until a cardiologist scans it | **? not proven**: negative unless the pilot shows staff time saved or clinical value |

**Why quality counts double.** Better information at the visit is the only reason anyone uses the product; the other four rows are what it costs to get it. Unweighted, the patient only breaks even, which is why the practice's ask matters so much (57% of invited patients finished when clinics sent the link [92]; 15.2% of adults collect family history on their own [S1]).

### 4.3 Evidence

| Finding | Number | Source | Use |
| --- | --- | --- | --- |
| People say it matters but don't collect it | 94.8% say it's important; 15.2% have actively collected it; 66.5% find it hard | CDC/NCHS survey, JABFM 2026 [S1] | The problem is common |
| Memory misses heart attacks, early ones most | Sensitivity 57.6% | 25,302 Swedes, register-checked [87] | Why every fact needs a source |
| Charts lack who and when | ~11% of positive heart family-history entries name relative and age | UK GP records, 1.5M patients, 1998–2008 [89] | The gap |
| Guided tool vs charts | 99.8% vs under 4% of pedigrees meet quality criteria; lineage recorded in 100% vs 28.4% of pedigrees; age at onset 72.1% vs 18.2%; **cause of death 58.9% vs 98.1%** | MeTree, 1,184 vs 390 pedigrees [84] | Guided works (be honest about cause of death) |
| Clinic-sent tools get done | 64.2% of 95,166 invited engaged; 89.4% of them finished, so 57% of everyone invited; link sent about 5 days ahead with reminders at 72 and 24 hours; a 15-minute cancer-risk chatbot, lab-funded | Women's health clinics [92][S54] | Channel choice (our tree needs weeks and relatives, so expect less) |
| Research-consent invitations get little uptake | 7.8% of eligible patients enrolled when offered MeTree electronically before a primary-care visit, as a consented study | IGNITE, four health systems [91] | Don't read 7.8% as "self-found"; it was an invited research study |
| Closest cardiology benchmark | 48.9% of new cardiology patients answered a no-login pre-visit link | Korea, JMIR Med Inform 2026 [S12] | Completion target is plausible |
| Value depends on the clinician acting | Referral 44.4% when providers discussed results vs 5.9% | IGNITE [S11] | Why the clinician page matters |
| Time saved is contested | No difference in counseling duration with a pre-visit tool | Vanderbilt trial, JAMA Netw Open 2026 [S9] | Don't claim time savings |
| Details change decisions | Premature parental cardiovascular disease: 8-year offspring CVD odds ratio 2.0 in men (95% CI 1.2–3.1); 1.7 in women, not significant (0.9–3.1) | Framingham [S3] | The age is what makes it count |
| Crude yes/no adds little | Net reclassification −2% overall | EPIC-Norfolk [S8] | Why we capture who and when, not yes/no |
| Interviews | ID007 (cardiac, the core story), ID006 (specific questions surface history), ID010 (flagged, scannable summary; family history matters more outside the ED, note), ID002 (family history among most important factors), D021 (manual Progeny entry; ~20% questionnaire return; doubts patients can build pedigrees, note; "There has to be a human in the loop to make the judgment about what matters") | Team Hub | Who has the problem; what the clinician needs |
| **Gap** | The 21 logged interviews come from our September diagnosis research: 15 patients (ID007 is the only cardiology patient) and 6 clinicians. 0 practice managers, 0 cardiologists, 0 relatives | Team Hub | The verdict can't say "yes" for payment or for clinician value |

**Willingness-to-pay signals.** For: FamGenix sells a $500/yr clinician license with a cardiology add-on [111]; Progeny Clinical lists from $2,500 one-time [S15]; practices pay for intake (IntakeQ [114]; Phreesia's subscription line [113]). Against: free intake and lab tools [112][107]; labs fund pre-visit chatbots themselves [92]; no billing code [103][105]; no buyer evidence of our own.

**ROI a manager could count (assumption, weak).** If 10 staff minutes are saved per completed summary (unproven; a 2026 trial found no difference in counseling time [S9]) × $30 an hour ≈ $5 per summary [research §4.3]. New patients: the Medicare fee-for-service median is about 4 new-patient office visits per cardiologist per month (51 a year, team analysis [S17]); × 5 for all payers ≈ 21 a month (our guess; every manager call asks for the real number). At 40% completion: 21 × 0.4 × $5 ≈ $42 per cardiologist per month, about $500 a year. So at $500 a year a practice only breaks even, and only if the time saving is real. **Time savings therefore do not set our price.** $500 a year matches the only public per-clinician anchor (FamGenix Individual [111]); we treat $99 a month as a test, and the pilot measures staff minutes.

### 4.4 What is still unproven (ranked)

1. A practice will pay (no buyer interviews, letters or pilots).
2. Staff time is saved (contested [S9]).
3. Patients finish before the visit when a US cardiology practice sends the link (benchmarks: 7.8% enrolled when offered as a consented research study [91]; 48.9% of new cardiology patients answered a no-login link in Korea [S12]; 57% of invited finished a short clinic-sent chatbot [92]).
4. Relatives respond (29% invite drop-off elsewhere [93]).
5. Cardiologists trust and act on the page (none interviewed; D021, a genetics counselor, doubts patient-built pedigrees).
6. The page fits the practice's EHR workflow (EHRs unknown).
7. Our four differences beat FamGenix enough to matter (no hands-on test yet).

### 4.5 Verdict

**Use: yes, if the practice sends the link. Buy: not yet shown.** Patients will use it **if the practice sends the link** with new-patient paperwork; relatives and clinicians are unproven (none interviewed), and the page must scan in under a minute. Payment turns to "yes" when one practice manager commits to a price (a letter of intent now, a paid pilot once we can sign a BAA).

**Cheapest tests, in order:**

| # | Test | Pass mark | When |
| --- | --- | --- | --- |
| 1 | Price card ($500/yr and $99/mo) to 5 independent NYC practice managers. Ask: "Show us your new-patient form and your EHR check-in. Does either ask which side, which relative, what age?"; minutes spent on family history; new patients per cardiologist per month, by payer; which EHR; who approves a purchase | 3 of 5 name the budget owner and accept $500/yr in principle, and 1 signs a non-binding letter of intent naming a target start month. The paid letter follows once we have a company, a BAA template and insurance | Start now; report by Oct 23 |
| 2 | Clinician scan test: synthetic one-pager to 5 clinicians, at least 2 cardiologists or cardiology PAs | Scan < 1 min; ≥ 4 of 5 rate it useful; act on ≥ 1 alert | Before Oct 16; result goes on slide 6 |
| 3 | Patient timing: 5 moderated sessions with a fictional family | Median ≤ 15 min; no wrong-side errors | Before Oct 23 |
| 4 | Relative fake door: participants send a no-health-data invite to a page that collects nothing | ≥ 25% opened within 72 hours | Before Oct 23 |
| 5 | FamGenix hands-on: build one synthetic cardiac family in its free tier | A written list of what we do that it doesn't | Before Oct 16 |
| 6 | Target-user interviews: 5 adults who had a first cardiology visit in the past year (log as ID022 onward) | Report what the form asked, whether they were sent to ask relatives, and whether they'd answer a practice link | Before Oct 16 |
| 7 | Intake forms: download posted new-patient forms from 5 independent NYC cardiology groups on the [S27] list | Report what they ask (for example "k of 5 ask age, 0 of 5 ask side"); reword the first business-logic clause if the forms differ from [S5] | Before Oct 16 |

---

## Step 5. Can we make it?

### 5.1 Technical feasibility

**Built and live (checked Oct 6, 2026, synthetic data only [S28]):**

| Capability | Status |
| --- | --- |
| Three-generation tree, side of family fixed by layout, guided cardiac questions | Built |
| Statuses derived from reports (known / conflicting / unknown / declined); each fact keeps who said it and when | Built; 10 of 10 logic tests pass |
| Relative invite and reply by link, no account; replies accepted only from invited relatives | Built (today the relative's answers come back as a reply link the relative texts to the patient; nothing is stored on our servers) |
| "Connect MyChart": real SMART on FHIR standalone launch (OAuth 2 + PKCE), read-only Patient and Condition scopes, against the public SMART Health IT sandbox; relative ticks one condition, labeled "on problem list since <year>" | Built (sandbox) [18] |
| Patient view with no alerts; care-team document with guideline criteria, "also noted" and "to clarify" tiers, each citing guideline and year | Built. Two fixes before screenshots: printing currently produces the care-team copy and the patient can preview it, and a second-degree relative's reported high cholesterol is labeled with Dutch Lipid Clinic criteria, which count first-degree relatives only (open items) |
| Print/PDF, read-only link and QR; FHIR R4 FamilyMemberHistory export | Built (export not yet run through the HL7 validator) |

**What's hard, and the workaround:**

| # | Hard or unknown | Why | Workaround or test |
| --- | --- | --- | --- |
| 1 | Pilot backend not built (server storage, magic-link login, staff MFA, expiring invite tokens, audit log) | Prototype is serverless by design | Build on synthetic data on free tiers; switch to the BAA stack only when a pilot is signed (mvp-spec §11–12) |
| 2 | Portals don't have to share family history | FamilyMemberHistory is not in USCDI; requesting it ends Epic auto-distribution [7][10][2] | Relatives answer for themselves; the portal step only upgrades one problem-list fact [5] |
| 3 | No write-back into Epic family history | Epic has no create API for FamilyMemberHistory [10] | PDF first; fax from a BAA backend; SMART Health Link in the pilot [27][29] |
| 4 | Where the page lands in each practice's EHR | Independent practices run different EHRs | Ask on every call; test a PDF upload at one practice (target < 2 min staff time) |
| 5 | Older relatives on phones | MeTree: 26% needed help, 77% of them over 60 [90] | Usability sessions with adults over 60; a help line |
| 6 | Clinical rules must be right | Two cutoffs still unverified [research §3.1] | Rules cite verified text only; a cardiologist signs the rule table before any pilot |

**Technical verdict: Yes.** Nothing on the list needs new technology. Next build: the pilot backend (row 1), still on synthetic data, before any real patient.

### 5.2 Operational feasibility

| Stage | What governs us | What we must have |
| --- | --- | --- |
| Prototype (now) | Synthetic data only; Vercel Hobby signs no BAA and is non-commercial [58] | Synthetic-data banner; no analytics; no condition names in URLs. No paid pilot on Hobby |
| Patient uses it alone | Not HIPAA; FTC Health Breach Notification Rule (60-day notice) and state laws (WA, CA, CT, NV; NY pending) [33][36][41][44] | Consent-first design; breach runbook; no pixels |
| **Practice pays and summaries reach its chart** | **We become a HIPAA business associate** [35]; NY breach notice within 30 days [43] | BAA with each practice and each vendor; Security Rule risk analysis; vendor-BAA register; MFA; audit log; breach plan |

- **Consent:** each relative owns their branch, can decline, correct or delete; a decline wins over others' secondhand reports; adults 18+ only [research §2.4].
- **Clinical safety line:** patients see facts, gaps and questions; guideline criteria appear only on the care-team copy, addressed to the clinician, cited and versioned, as options not orders (FDA CDS guidance, Jan 2026 [95]). The current build lets the patient preview and print the care-team copy; whether a care-team page carried by the patient changes the FDA analysis is an open question for counsel (research §3.5 rule 1, open question 5). Planned fix: the patient prints their own copy, and the care-team copy reaches the practice by read-only link or fax.
- **Wording we use:** "Prototype uses synthetic data only." "Built to operate as a HIPAA business associate." Never "HIPAA compliant" or "certified" [55][39].
- **Onboarding one practice:** pilot letter + BAA → security questionnaire → which EHR, pick PDF channel → practice adds our link to new-patient paperwork → staff accounts with MFA → baseline staff minutes → weekly check-in.
- **Support load (assumption):** a 2-cardiologist practice ≈ 42 invites a month (21 × 2), ≈ 17 completions at 40%; if 26% need help [90], about 4–11 help requests, at 10 minutes each ≈ 1–2 founder hours per practice per month. At the BLS median wage the VCA uses ($135,980 ÷ 2,080 h ≈ $65 an hour [S23]), that is $65–131 a month, against $83 a month from a 2-cardiologist practice at $500 per cardiologist per year.
- **Who does what (proposed, Team Hub doesn't record roles):** tech lead (backend, Epic registration, security controls, FHIR validation); clinical and user lead (rule-table sign-off, usability with older adults, consent wording, help line); business lead (practice-manager calls, letters of intent, company formation, BAA with counsel, insurance quotes).
- **Critical path to a January pilot (proposed dates; names to assign, open item 4):**

| By | Step | Owner (role) |
| --- | --- | --- |
| Oct 23 | 5 practice-manager conversations; 1 letter of intent (test 1) | Business lead |
| Nov 15 | Company formed, so a business signs the BAA and sends the invoice [S53] | Business lead |
| Dec 1 | Counsel reviews the BAA template, privacy policy and the care-team page question | Business lead |
| Dec 15 | A cardiologist signs the rule table | Clinical and user lead |
| Dec 15 | Pilot backend running on synthetic data | Tech lead |
| Jan 5 | BAA stack and insurance live; first practice signs a BAA | Tech lead and business lead |

**Operational verdict: Yes for 1–3 practices, if** we form a company, take on business-associate duties before any real data, and a cardiologist signs off on the rule table (critical path above).

### 5.3 Financials: revenue against operating costs

**Operating cost per month, once real patient data flows** (vendor price pages opened Oct 6, 2026):

| Line | Low | High | Source and math |
| --- | ---: | ---: | --- |
| Vercel Pro developer seats (1–3) | $20 | $60 | $20 per seat per month [61] |
| Vercel HIPAA BAA add-on | $350 | $350 | $350 per month [61] |
| Neon Scale, HIPAA on, smallest always-on compute + 1 GB | $41 | $47 | 0.25 CU × 730 h × $0.222 + 1 GB × $0.35; high case adds the 15% HIPAA surcharge Neon says will come [64][63][S18] |
| Amazon SES email + S3 storage | $1 | $5 | $0.10 per 1,000 emails [S19]; storage is an assumption |
| Domain | $1 | $1 | about $10.46 a year (secondary tracker) [S26] |
| Team inbox under a BAA (3 users) | $21 | $66 | BAA accepted in the Admin console [S24]; $7–22 per user from a secondary source [S25] |
| Cyber insurance | $129 | $179 | Insureon small-business and IT-business medians [S21]; **estimate** |
| Tech E&O insurance | $126 | $126 | Insureon SaaS median [S22]; **estimate** |
| Epic registration and auto-distribution; SMS (patient sends invites from own phone); founders | $0 | $0 | Free [5]; by design; unpaid |
| **Total** | **$689** | **$834** | Cash cost per extra practice is close to zero; the real variable cost is support time (below) |

**Not in the cash cost: founder support time (unpaid now).** 1–2 hours per practice per month (Step 5.2); at $65 an hour (BLS median $135,980 ÷ 2,080 h [S23]) that is $65–131 a month, against $83 a month from a 2-cardiologist practice at $500 per cardiologist per year. Founder sales time per signed practice is not counted either; the pilot measures both.

**Revenue options (in order of preference):**

| Option | Price | Per cardiologist per month | Per 2-cardiologist practice per month |
| --- | --- | ---: | ---: |
| Founding pilot | $1,000 flat for 12 weeks, credited to year one | n/a | n/a |
| **A (lead)** | **$500 per cardiologist per year** | $41.67 | $83 |
| B (tested on the same card) | $99 per cardiologist per month | $99 | $198 |
| C (original hypothesis, high end) | $149 per cardiologist per month | $149 | $298 |

**Break-even** (operating cost ÷ revenue; rounded up):

| | A: $500/yr | B: $99/mo | C: $149/mo |
| --- | ---: | ---: | ---: |
| Paying cardiologists to cover $689–834 a month | **17–21** | 7–9 | 5–6 |
| Same, in 2-cardiologist practices | **9–11** | 4–5 | 3 |
| Plus one salary (BLS median wage for a software developer, $135,980/yr = $11,332/mo, before payroll taxes and benefits [S23]) | ~290 cardiologists (~146 practices) | ~123 (~62) | ~82 (~41) |
| Plus three salaries | ~836 cardiologists | ~352 | ~234 |

Why 2 cardiologists per practice: in the CMS clinician file, organizations of 100 or fewer clinicians that include an independent cardiologist have a median of 2 cardiologists (team analysis [S27]). NYC's 39 groups with 2 or more independent cardiologists hold 144 cardiologists: median 2 per group; the mean of 3.7 is pulled up by two hospital-linked groups (28 and 13 cardiologists), and the other 37 average 2.8 [S27].

**Year 1 (Oct 2026 to Sep 2027), chosen offer (assumptions):** synthetic data and $0 cash through December; the BAA stack runs January to September (9 × $689–834 = **$6,201–7,506**); pilots start January after a BAA is signed; annual fees are billed upfront and the $1,000 pilot fee is credited to year one (so a 2-cardiologist group pays $1,000 in total for year one).

| Scenario | What happens | Year-1 revenue | Net (cost $6,201–7,506) |
| --- | --- | ---: | ---: |
| Low | 1 pilot, converts at 2 cardiologists | $1,000 | −$5,201 to −$6,506 |
| Mid | 3 pilots; 2 convert at 2 cardiologists each (credit covers their year one) | $3,000 | −$3,201 to −$4,506 |
| High | 3 pilots convert at 4 cardiologists each ($2,000 year one, $1,000 already paid) | $6,000 | −$201 to −$1,506 |

**Three 12-week pilots** bring $3,000 against about $1,900–2,300 of BAA-stack cost for those 12 weeks (2.76 months × $689–834), so the pilot pays for itself; the year does not. Worst-case cash need for year 1 is about $6,500, with founders unpaid.

**Market check.** US independent cardiology (7,699 cardiologists in organizations of 100 or fewer clinicians, a proxy that includes some hospital practices [99]) is worth **$3.8M a year at $500**, or $9.1–13.8M at $99–149 a month [research §4.4]. NYC's 285–320 independent cardiologists (re-run Oct 6 [S27]) are worth $142–160k a year at $500. NYC is a pilot market, independent cardiology is a wedge, and growth has to come from larger groups, health-system clinics and primary care.

**Financial verdict:** cheap to run, small to earn. Cash break-even needs 17–21 paying cardiologists at our lead price (about ten 2-cardiologist groups), and one salary (wage only) needs about every independent cardiologist in NYC. At $500 a year a small practice pays for its own support time and little more, so support has to fall under 1 hour a month per practice (practice staff answer first-line questions; in-app help) or the price has to rise. The pilot measures support minutes and founder sales hours per signed practice.

### 5.4 Step 5 verdict

**Yes at pilot scale (1–3 practices, from about January 2027); not yet a business that pays salaries.** Technology: yes, with the pilot backend still to build. Operations: yes, once we form a company and take on business-associate duties before any real data. Financials: the pilot covers its own cost; a business needs larger groups, health systems or primary care. **The main risk is price, not technology.**

---

## Central business logic

> **People will buy it because** cardiology practices need which relative, what condition and what age, their intake forms take it from memory, and a link they send gets those details, each with its source, into the chart before visit one.
>
> **We can make it because** the patient side already runs on public standards, a PDF reaches any chart, and a pilot on vendors that sign BAAs costs under $850 a month, which about ten two-cardiologist practices cover with founders unpaid.

The same two sentences appear on the slide 8 cards and in Raj's script, word for word. "Take it from memory" means: the form asks yes or no per relative, then leaves a few lines for details, with no side of family and no room for "not sure" [S5].

| Clause | Evidence | Status |
| --- | --- | --- |
| "cardiology practices need which relative, what condition and what age" | Premature heart disease counts in a parent or sibling, men < 55, women < 65 [76][74]; sudden-death, cardiomyopathy and aortic rules depend on degree and age [78][80][81]; three-generation history is the HCM standard [72] | Shown (guideline text) |
| "their intake forms take it from memory" | [S5] asks "Heart Disease?" per relative, then free-text type and age of onset; no side of family, no "not sure"; charts still name relative and age in about 11% of positive entries [89]. EHR check-ins can show family-history questions too [S52] | Shown for one health-system form (2016 version); independent practices' forms and EHR check-ins not yet collected (test 7) |
| "a link they send gets those details" | 64.2% engaged and 57% of invited finished when clinics sent a link with reminders [92]; 7.8% when the invite came as a research study needing consent [91]. Relatives' own answers are untested: 29% invite drop-off in a similar app [93] | Shown elsewhere for patients; not yet in a US cardiology practice. Relatives: **untested** (pilot target ≥ 25% of patients get one relative's answer) |
| "each with its source" | Every fact stores who said it and when; built and tested [S28] | Built (synthetic data) |
| "into the chart before visit one" | 33-day average cardiology wait [S2]; eCheck-In opens 7 days before [S4]; more family history reached charts with a questionnaire plus EHR upload [S10]; ID007 (note) | Timing shown; filing at one practice still to test |
| "the patient side already runs on public standards" | SMART on FHIR launch, FHIR export, live routes, tests [S28] | Shown (synthetic data); the pilot backend is not built yet (Step 5.1) |
| "a PDF reaches any chart" | PDF works with every practice, by link, fax or upload; staff may still re-key [research §1.7] | Shown in principle; test at one practice |
| "under $850 a month, which about ten two-cardiologist practices cover with founders unpaid" | $689–834 (Step 5.3); 9–11 two-cardiologist practices at $500 per cardiologist per year | Shown from price pages; insurance is an estimate; founder support time not counted |

Say aloud after the two sentences: "Payment is our next test."

---

## The configuration most likely to succeed

| Canvas box | Chosen configuration | Other options, in order |
| --- | --- | --- |
| Customer segments | **Payer:** independent NYC cardiology groups with 2–10 cardiologists (manager budgets, owner signs). **Users:** their adult new patients, sharpest for palpitations, fainting, chest pain, high cholesterol or a relative's heart event. **Contributors:** adult relatives | Large independent and PE groups; solo cardiologists; health-system cardiogenetics and lipid clinics; primary care (AWV); consumers directly (free side door) |
| Value propositions | **Clinician:** one page with who, what, what age, source and status for every fact, plus guideline criteria for review. **Practice:** more family history in the chart before visit one. **Patient:** walk in prepared. **Relative:** answer once, for yourself; decline any time | Relatives who may need screening, flagged for the clinician (never priced on); staff time saved (measure, don't claim) |
| Channels | **Practice sends the link with new-patient paperwork; patient texts relatives from own phone; the care-team page reaches the practice as a PDF by read-only link or fax; founder-led sales** | Patient upload (after counsel); SMART Health Link QR (pilot); EHR app (product stage) |
| Customer relationships | **Founder-led setup, week-6 and week-12 reports, help line; each relative consents to their own branch** | Self-serve onboarding once the playbook is written |
| Revenue streams | **$1,000 12-week founding pilot, credited to year one; then $500 per cardiologist per year; free for patients and relatives** | $99 per cardiologist per month (tested); per completed summary; never per referral or new patient |
| Key resources | **Prototype; per-fact data model; versioned rule table signed by a cardiologist; a company that can sign BAAs; BAA and privacy documents** | Production Epic app (USCDI-only); pilot outcome data |
| Key activities | **Sell pilots; measure; keep rules current; operate as a business associate** | EHR integrations, only when a paying practice needs one |
| Key partners | **1–3 pilot groups; a cardiologist reviewer; BAA vendors (Vercel Pro, Neon, SES); a law clinic** | AWS-only stack to drop the $350 add-on; fax vendor with a BAA |
| Cost structure | **$689–834 a month once real data flows; founders unpaid; per-practice cash ≈ 0, but 1–2 founder hours of support per practice a month** | Cost-down after the pilot: AWS move, Neon scale-to-zero, bundled insurance |

**Why these choices fit together.** Practice-sent links fix completion, the weakest step for tools patients find alone (64% engaged when clinics sent a link with reminders [92]; 15.2% of adults collect family history on their own [S1]). A practice payer fixes the "nobody pays" problem of going direct to consumers. A PDF means no integration project, so the sale stays small-practice length (45-day average for SMB digital health, a16z survey [S45]). Flat per-cardiologist pricing stays clear of referral-linked pricing [research §4.2]. Keeping guideline criteria on the care-team copy only is designed to keep the patient side outside FDA device rules [95]; whether a patient-carried care-team page changes that is an open question for counsel (research §3.5), which is why the care-team page goes to the practice by link or fax. **The weak joint is the same in every box: no practice has said it will pay.**

---

## The wedge: where we start

### Scoring (1 = bad for us, 5 = good for us; team judgment with the reason in the source memo)

| Wedge | Pain | Access | Sales cycle | Burden (5 = light) | Evidence | Expansion | **Total /30** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **(a) Independent NYC cardiology groups** | 3 | 4 | 4 | 3 | 3 | 4 | **21** |
| (e) Primary care wellness visits | 2 | 3 | 3 | 3 | 3 | 5 | 19 |
| (f) Direct to consumer | 3 | 1 | 5 | 4 | 2 | 2 | 17 |
| (b) Cardiogenetics clinics | 5 | 2 | 1 | 2 | 2 | 3 | 15 |
| (c) Lipid / FH cascade clinics | 4 | 2 | 2 | 2 | 1 | 4 | 15 |
| (d) Sports pre-participation | 2 | 2 | 2 | 1 | 1 | 2 | 10 |

Reasons in short: (a) criteria hinge on relative and age [76][72][78], 285–320 independent NYC cardiologists [S27], small practices decide fast [S45], business-associate load is manageable, ID007 is a cardiology case, and the same product sells to large groups later [102]. (b) and (c) have the most pain but sit inside NYU Langone, Mount Sinai and Columbia [S47][S48][S49], and two in three hospital executives said selecting a digital tool takes 6+ months (2022 survey of 100 executives [S46]). (e) is the biggest later market, but family history is a small part of a wellness visit (team judgment). (f) has no payer, and few adults collect family history on their own (15.2% [S1]). (d) pre-participation screening often covers people aged 12–25, many of them minors [S51]; our product is adults only.

**Does the ranking hold?** (a) stays first when pain, evidence, expansion, or access and cycle count double, and (e) is always second. But these are team judgments made before any manager call: if Access is 2 instead of 4, (a) scores 19 and ties primary care. Our deciding reason is that cardiology criteria need exactly the fields we capture, which relative and what age [76][72], and one practice manager can say yes. Our ER interviewee pointed to primary care as the bigger user of family history (ID010, note); we agree, and it is our expansion market.

### The wedge, made specific

- **Who:** 3 independent NYC cardiology groups, 2–10 cardiologists, cardiology at least half the clinicians, a manager with a software budget, about 20+ adult new patients a month, an EHR that accepts a PDF, willing to sign a BAA. Mix: different EHRs, at least one outside Manhattan, at least one with a prevention or lipid focus.
- **Pool:** 39 NYC organizations with 2+ independent cardiologists; 22 are cardiology-focused, and about 19–20 remain once hospital-linked groups are removed (team analysis of the CMS file [S27]; check each by phone).
- **Why not solo practices first:** too few new patients for a 12-week pilot to read a completion rate (at ~21 a month per cardiologist, assumption, a 3-cardiologist group sends ~60 invites a month; at 60 invites a 40% rate is known to about ±12 points).
- **First offer ("founding practice pilot"):** one link added to new-patient paperwork; one page per patient before the visit; set-up in one call; baseline staff-minute count; help line; week-6 and week-12 reports. **$1,000 flat for 12 weeks, credited in full to year one; then $500 per cardiologist per year.** BAA first, no patient data before it. No auto-renew. Never priced per referral or new patient. Fallback: $500 for 8 weeks.
- **Users:** all adult new patients (one link in the new-patient paperwork; a practice can't easily filter by referral reason); value is sharpest for palpitations, fainting, chest pain and high cholesterol.
- **Earliest start:** about January 2027, after we form a company, the BAA stack and insurance are live, counsel has reviewed the BAA template and privacy policy, a cardiologist has signed the rule table and the pilot backend runs (critical path in Step 5.2). Letters of intent can be signed now.
- **Metric zero (by Oct 23):** 5 practice-manager conversations; 3 name the budget owner and accept $500/yr in principle; 1 signs a non-binding letter of intent naming a target start month.
- **Pilot metric 1:** of invited adult new patients whose first visit falls in pilot weeks 2–12, the share with a patient-reviewed summary in the chart **before that visit**. Target **≥ 40%**, read at week 6 and week 12. On day 1 the practice also texts patients who are already booked, so the early weeks have visits (the average new-patient wait is 33 days [S2], so patients invited at booking in week 1 are seen around week 5). Checks at week 6: clinician opens it and rates it ≥ 4/5, scan < 60 s; ≥ 25% of patients get one relative's answer; staff minutes, baseline vs pilot (report, don't promise); ≤ 2 specific alerts per summary.
- **Go/no-go at week 12:** go if pilot metric 1 ≥ 40% and ≥ 1 of 3 practices signs an annual contract. High completion but nobody pays: switch buyers (health-system cardiogenetics or lipid clinics, or primary care). Completion under 20%: fix the patient flow before selling more.

### Expansion path

| Stage | Who | Trigger to move on |
| --- | --- | --- |
| 1. Pilot (from about Jan 2027) | 3 NYC independent groups | ≥ 40% completion and ≥ 1 annual contract |
| 2. Fill the city, then larger groups | The rest of the ~19–20 NYC groups; large independent and PE groups (CVAUSA [102]) | 10+ paying practices; a repeatable onboarding playbook |
| 3. Health-system specialty clinics | Cardiogenetics and lipid programs [S47][S48][S49] | Pilot outcome data; a clinician champion; a production Epic app [5] |
| 4. Primary care | Practices running Medicare Annual Wellness Visits [104] | A non-cardiac summary template; help flows for older users [90] |
| Side door (any time) | Patients whose practice isn't a customer | None; free, prints a page |

---

## Mockup screens (for the board, right of the canvas)

Captured from the production URL after the redesign, synthetic-data banner visible, in plain gray frames (the board, like the deck, does not take the website's look). One line under each screen names what it shows and the canvas Post-its it carries (sub-group and rank, as on the canvas).

| # | Screen | Caption for the board | Shows |
| ---: | --- | --- | --- |
| 1 | Tree view, demo family | Built one side of the family at a time; every person shows a status in words | Value Propositions, patient 2 and 4 |
| 2 | Guided question card | Plain questions with examples; "Not sure" is a real answer | Value Propositions, patient 2 |
| 3 | Relative invite on a phone | No account; who will see the answers; decline | Value Propositions, patient 3; Customer Relationships, patient and relative 3 |
| 4 | Portal pick screen (SMART sandbox) | One condition shared, labeled with where it came from | Value Propositions, patient 6 |
| 5 | Patient pre-visit summary | Facts, gaps and questions; never risk scores | Value Propositions, patient 1 and 7 |
| 6 | Care-team page | Guideline criteria for clinician review, "to clarify", a source on every line | Value Propositions, clinician 1 and 2 |

If the redesign is not on production by end of day Oct 13, capture these from the current production build that day (open item 8).

---

## Choices made where the research memos disagreed

| Topic | Options in the memos | Our choice and why |
| --- | --- | --- |
| Price | $99–149 per cardiologist per month (research §4.3, R3 lead case) vs $500 per year (R2 ROI, R5) | **$500 per cardiologist per year after a $1,000 pilot; $99/mo tested on the same card.** $500/yr is the only public per-clinician anchor [111]. Staff-time savings are unproven [S9], so they don't set the price; the pilot measures them |
| "We can make it because…" | R3: "…three paying practices cover that cost" | Dropped; true only at $149/mo. R5's sentence holds at any price |
| Delivery order | R4: SMART Health Link before fax; earlier draft: patient upload first | **Read-only link or QR the practice opens, then fax, then patient upload (after counsel), then SMART Health Link.** Keeps the care-team page, with its guideline criteria, addressed to the practice (research §3.5); SHL acceptance from a non-IAL2 app is untested |
| Intake-form wording | R1: "one blank box", "no grandparents, aunts or uncles"; an earlier draft: "intake forms ask yes or no" | We opened the form [S5]: after the yes/no "Heart Disease?" grid it asks for type and age of onset on free-text lines, and asks about sudden death. Accurate claim: the form takes family history from memory, with no side of family and no room for "not sure". It is a 2016 health-system form; independent practices' forms are test 7 |
| Business-logic wording | Reviewers asked to name the buyer, drop "ask yes or no", and stop claiming the whole loop runs | One wording for the slide, script and board (Central business logic). Relatives' answers stay in the value proposition, not the sentence, because they are untested |
| Phreesia free period | research [112]: through Dec 31, 2026; R4: page now says spring 2027 | The page says both (re-opened Oct 6). We say "free through at least the end of 2026" |
| Year-1 financials | R3 scenarios mixed prices and didn't apply the pilot credit | Recomputed for the chosen offer (Step 5.3) |

---

## Open items only the team can close

1. **Interview count.** The earlier "What we heard" slide (`slides/build-what-we-heard.cjs` in the repo) still says 30; Team Hub logs 21 (15 patients; internist ID002, RN ID008, PAs ID009 and ID014, ER doctor ID010, genetics counselor D021), all from the September diagnosis research. Log the other 9 with IDs and notes, or change that slide to 21 before it goes into any PDF.
2. **Buyer evidence.** Milestone 1 promised at least 3 practice owner or manager interviews, 10–15 eligible patients, and a measure of whether relatives contribute (Team Hub). Logged so far: 1 eligible patient (ID007), 0 managers, 0 cardiologists, 0 relatives. Run tests 1, 2 and 6 and put the results, whatever they are, on the board.
3. **A cardiologist reviewer** for the rule table and the one-pager (Key Resource 4). D021 has not agreed to review.
4. **Roles and names** for Step 5.2 and the critical path (Team Hub doesn't record them).
5. **Insurance quotes, legal cost and company formation** (estimates or unknown; NY LLC publication rules [S53]).
6. **FHIR export validation** against US Core 9 before calling it conformant.
7. Use **D021** (not ID021) for the genetics counselor and keep her first name off the board.
8. **Product fixes before screenshots** (redesign): (a) the patient's Print button prints the patient's copy, the patient-side care-team preview goes, and the care-team copy reaches the practice only by read-only link, QR or fax; otherwise ask counsel before showing a patient carrying it. (b) In `src/lib/clinical.ts`, label a second-degree relative's reported high cholesterol "Simon Broome criteria (first- or second-degree adult relative with total cholesterol > 290 mg/dL; level not reported)" and use Dutch Lipid Clinic only for first-degree relatives. (c) Invite text: no health information and no "about 2 minutes" claim. Screenshot cutoff: if the redesign is not on production by end of day Oct 13, capture from the current build that day.
9. **Five independent practices' intake forms** (test 7), so the first business-logic clause rests on the wedge's own forms, not one health-system form.

---

## Sources

**From `docs/research.md`** (fact-checked research, Oct 2, 2026; same numbers):

- [1] 45 CFR 170.215, eCFR as of 2026-09-30: https://www.ecfr.gov/api/versioner/v1/full/2026-09-30/title-45.xml?part=170&section=170.215
- [2] 45 CFR 170.404, eCFR as of 2026-09-01: https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-45.xml?part=170&section=170.404
- [5] Epic, patient-facing FHIR apps: https://fhir.epic.com/Documentation?docId=patientfacingfhirapps
- [7] Epic, FamilyMemberHistory.Search (R4): https://fhir.epic.com/Specifications/Api?id=10159
- [10] Epic API catalog: https://fhir.epic.com/Specifications/Selections
- [11] Epic, Getting Started with open.epic: https://vendorservices.epic.com/Resources/OEC09
- [15] ONC, 2026 SVAP approved standards: https://healthit.gov/blog/standards/advancements-in-health-it-oncs-2026-approved-svap-standards/
- [16] US Core 9 FamilyMemberHistory profile: https://hl7.org/fhir/us/core/STU9/StructureDefinition-us-core-familymemberhistory.html
- [17] FHIR R4 FamilyMemberHistory: https://hl7.org/fhir/R4/familymemberhistory.html
- [18] SMART launcher README: https://raw.githubusercontent.com/smart-on-fhir/smart-launcher-v2/main/README.md
- [22] Flexpa pricing: https://www.flexpa.com/pricing
- [27] CMS Provider Kill the Clipboard Guide: https://www.cms.gov/initiatives/health-technology-ecosystem/overview/health-tech-ecosystem-categories/provider-kill-clipboard-guide
- [29] SMART Health Links specification: https://build.fhir.org/ig/HL7/smart-health-cards-and-links/links-specification.html
- [30] Sinch Fax API: https://sinch.com/products/apis/fax-api/
- [33] Hunton, HHS guidance on health apps: https://www.hunton.com/privacy-and-cybersecurity-law-blog/hhs-releases-guidance-on-health-apps-and-hipaa-security-rule-crosswalk
- [35] 45 CFR 160.103: https://www.law.cornell.edu/cfr/text/45/160.103
- [36] FTC, Complying with the Health Breach Notification Rule: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
- [39] FTC, GoodRx enforcement action: https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising
- [41] NY Senate Bill S9269: https://www.nysenate.gov/legislation/bills/2025/S9269
- [43] NY General Business Law 899-AA: https://www.nysenate.gov/legislation/laws/GBS/899-AA
- [44] Washington RCW 19.373.030: https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.030
- [50] 29 CFR 1635.3: https://www.law.cornell.edu/cfr/text/29/1635.3
- [51] NHGRI, Genetic Discrimination: https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination
- [52] Inside Privacy, Illinois GIPA litigation: https://www.insideprivacy.com/data-privacy/employers-beware-new-wave-of-illinois-genetic-information-privacy-act-litigation/
- [55] Box HIPAA and HITECH FAQ: https://support.box.com/hc/en-us/articles/360044194833-Box-HIPAA-and-HITECH-Overview-and-FAQ
- [58] Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- [61] Vercel pricing: https://vercel.com/pricing
- [63] Neon HIPAA: https://neon.com/docs/security/hipaa
- [64] Neon pricing: https://neon.com/pricing
- [68] AWS HIPAA-eligible services: https://aws.amazon.com/compliance/hipaa-eligible-services-reference/
- [72] ACC, 2024 HCM guideline ten points: https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2024/05/06/15/12/2024-hypertrophic-cardiomyopathy-gl
- [73] Review of HCM sudden-death risk criteria (Eur Heart J QCCO): https://europepmc.org/article/PMC/PMC12587277
- [74] ACC, 2026 dyslipidemia guideline overview: https://www.acc.org/latest-in-cardiology/articles/2026/07/01/01/prioritizing-health
- [75] ACC, "No Child Left Behind" (2026 pediatric lipid recommendations): https://www.acc.org/Latest-in-Cardiology/Articles/2026/05/19/15/49/No-Child-Left-Behind
- [76] ACC, "Power of the Pedigree" (2018 premature ASCVD definition): https://www.acc.org/latest-in-cardiology/articles/2021/01/05/13/15/power-of-the-pedigree
- [77] Family Heart Foundation, FH diagnostic criteria: https://familyheart.org/diagnosing-familial-hypercholesterolemia/clinical-diagnostic-criteria-for-healthcare-providers
- [78] APHRS/HRS expert consensus on sudden unexplained death: https://europepmc.org/article/PMC/PMC8207384
- [79] 2023 ACC/AHA/ACCP/HRS AF guideline: https://pmc.ncbi.nlm.nih.gov/articles/PMC11095842/
- [80] ESC 2025 consensus on DCM family members: https://europepmc.org/article/PMC/PMC12614981
- [81] ACC/AHA 2022 aortic disease guideline: https://www.acc.org/About-ACC/Press-Releases/2022/11/02/18/18/ACC-AHA-Issue-Aortic-Disease-Guideline
- [84] MeTree pedigree quality, BMC Fam Pract 2014: https://europepmc.org/article/PMC/PMC3937044
- [87] SCAPIS, Eur J Epidemiol 2026 (PMID 42142221): https://pubmed.ncbi.nlm.nih.gov/42142221/
- [88] Facio et al., Genet Med 2010 (My Family Health Portrait validation): https://pmc.ncbi.nlm.nih.gov/articles/PMC3258571/
- [89] Dhiman et al., PLoS One 2014: https://europepmc.org/article/PMC/PMC3886986
- [90] MeTree implementation, BMC Fam Pract 2013: https://europepmc.org/article/PMC/PMC3765729
- [91] IGNITE rollout, Genet Med 2019: https://europepmc.org/article/PMC/PMC6281814
- [92] Nazareth et al., Obstet Gynecol 2021: https://europepmc.org/article/PMC/PMC8594498
- [93] ItRunsInMyFamily, Health Informatics J 2024: https://europepmc.org/article/PMC/PMC11391477
- [94] Family Healthware Impact Trial: https://europepmc.org/article/PMC/PMC3022039
- [95] FDA, Clinical Decision Support Software guidance (Jan 2026): https://www.fda.gov/media/109618/download
- [97] My Family Health Portrait (NCI copy) and commit history: https://cbiit.github.io/FHH/html/index.html ; https://github.com/CBIIT/FHH/commits/master
- [99] CMS Doctors and Clinicians national file (modified 2026-08-18; team analysis via the API): https://data.cms.gov/provider-data/dataset/mj5m-pzi6
- [101] HealthDay on JACC, private-equity cardiology acquisitions: https://www.healthday.com/healthpro-news/cardiovascular-diseases/342-cardiology-clinics-acquired-by-private-equity-firms-in-2013-to-2023
- [102] CVAUSA: https://www.cvausa.com/
- [103] CMS, 2026 RVU file (October release): https://www.cms.gov/files/zip/rvu26d.zip
- [104] 42 CFR 410.15 (Annual Wellness Visit): https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-42.xml?part=410&section=410.15
- [105] MGMA, 2021 E/M changes: https://www.mgma.com/articles/preparing-your-practice-for-2021-e-m-changes
- [107] Invitae Family History Tool: https://www.invitae.com/familyhistory/
- [108] Progeny Cloud trial: https://progenygenetics.com/clinical/trial/
- [109] Ambry CARE 2026 award: https://www.ambrygen.com/company/press-release/161/ambry-genetics-care-program-wins-2026-medtech-breakthrough-award
- [110] CancerIQ: https://www.canceriq.com/
- [111] FamGenix licensing: https://famgenix.com/licensing/
- [112] Phreesia free Intake offer: https://www.phreesia.com/?p=262
- [113] Phreesia FY2026 results: https://www.sec.gov/Archives/edgar/data/1412408/000141240826000074/phr-ex991q4fy26.htm
- [114] IntakeQ pricing: https://intakeq.com/pricing
- [115] HIPAA Journal, 23andMe multistate settlement: https://www.hipaajournal.com/23andme-settlement-multistate-data-breach-lawsuit/
- [117] Acheson et al., family history in primary care (CCJM): https://www.ccjm.org/content/ccjom/79/5/331.full.pdf
- [118] MeTree in the IGNITE network, BMC Health Serv Res 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7648301/

**Opened for the pitch work** (Oct 6, 2026 unless dated otherwise; "re-checked" = opened again by the lead writer):

- [S1] Kava CM, Julian AK, Vahratian A, Fletcher MR, Rim SH. "Knowledge, Perceptions, and Barriers to Collection of Family Health History Data." J Am Board Fam Med, 2026 (CDC/NCHS authors; NCHS Rapid Surveys System, Jan–Feb 2024). PMID 42049503. https://www.jabfm.org/content/knowledge-perceptions-and-barriers-collection-family-health-history-data (abstract re-checked via Europe PMC, Oct 6, 2026)
- [S2] AMN Healthcare, "New Survey Shows Physician Appointment Wait Times Surge: 19% Since 2022, 48% Since 2004," press release, May 27, 2025 (1,391 offices, 15 metros; cardiology 33 days). https://ir.amnhealthcare.com/2025-05-27-New-Survey-Shows-Physician-Appointment-Wait-Times-Surge-19-Since-2022,-48-Since-2004 (re-checked Oct 6, 2026)
- [S3] Lloyd-Jones DM et al. "Parental cardiovascular disease as a risk factor for cardiovascular disease in middle-aged adults." JAMA 2004;291(18):2204–11. PMID 15138242. https://pubmed.ncbi.nlm.nih.gov/15138242/
- [S4] Atlantic Health System, "MyChart Tips: eCheck-In" (Epic MyChart patient guide, undated; opened Oct 6, 2026). https://mychart.atlantichealth.org/MyChart/en-us/docs/MyCharteCheckIn.pdf
- [S5] Weill Cornell Medicine Cardiology, "New Patient Visit Questionnaire," ver. 2-7-16, page 3 (family history grid and free-text lines). https://cardiology.weill.cornell.edu/sites/default/files/new_patient_visit_questionnaire.pdf (opened and read Oct 6, 2026)
- [S7] CDC, "PHGKB Application Offline" (My Family Health Portrait's original host; offline since April 13, 2026), last reviewed Sept 9, 2026. https://phgkb.cdc.gov/FHH/html/index.html
- [S8] Sivapalaratnam S et al. "Family history of premature coronary heart disease and risk prediction in the EPIC-Norfolk prospective population study." Heart 2010;96(24):1985–9. PMID 20962344. https://pubmed.ncbi.nlm.nih.gov/20962344/
- [S9] Orlando LA et al. "Streamlining Inherited Cancer Identification via an EMR-Integrated Risk Assessment Platform: A Nonrandomized Clinical Trial." JAMA Network Open, 2026. PMID 42054024. https://europepmc.org/article/MED/42054024
- [S10] Carroll JC et al. "An Innovative Strategy for Collecting Family Health History: An Effectiveness-Implementation Trial in Primary Care Clinics." Annals of Family Medicine, 2025. PMID 40983547. https://europepmc.org/article/MED/40983547
- [S11] Wu RR et al. "Implementation-effectiveness trial of systematic family health history based risk assessment…" BMC Health Services Research, 2022. PMID 36474257. https://europepmc.org/article/MED/36474257
- [S12] Choi E et al. "Implementation and Evaluation of a Social Networking Service-Based Mobile Patient-Generated Health Data System With Direct Electronic Medical Record Integration." JMIR Medical Informatics, 2026. PMID 42335468. https://europepmc.org/article/MED/42335468
- [S14] Dellefave-Castillo L et al. "Family Leaders Navigate Burden to Communicate Risk during Cascade Screening after Sudden Cardiac Death in the Young." Public Health Genomics, 2026. PMID 42268778. https://europepmc.org/article/MED/42268778
- [S15] Capterra (Gartner), "Progeny Clinical" listing, updated Oct 5, 2026 (third-party listing). https://www.capterra.com/p/80513/Progeny-Clinical/
- [S16] Inside Precision Medicine, "Invitae Acquires CancerGene Connect Developer," June 12, 2017. https://www.insideprecisionmedicine.com/topics/oncology/invitae-acquires-cancergene-connect-developer
- [S17] CMS, Medicare Physician & Other Practitioners by Provider and Service, 2024 data year (data.cms.gov). Team analysis Oct 6, 2026: cardiology, codes 99203–99205, office setting, 13,087 cardiologists; median 51 new-patient visits a year. https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicare-physician-other-practitioners-by-provider-and-service
- [S18] Neon, Plans documentation (smallest compute 0.25 CU; HIPAA listed as an additional charge), opened Oct 6, 2026. https://neon.com/docs/introduction/plans
- [S19] Amazon Web Services, Amazon SES pricing ($0.10 per 1,000 emails), opened Oct 6, 2026. https://aws.amazon.com/ses/pricing/
- [S20] Amazon Web Services, HIPAA Compliance (BAA accepted in AWS Artifact; no fee stated), opened Oct 6, 2026. https://aws.amazon.com/compliance/hipaa-compliance/
- [S21] Insureon, "Cyber insurance cost" (small businesses $129/month average; IT businesses $179/month), updated Apr 24, 2026. https://www.insureon.com/business-insurance/cyber-liability/cost (re-checked Oct 6, 2026)
- [S22] Insureon, "SaaS business insurance cost" (tech E&O $126/month), updated Jun 24, 2026. https://insureon.com/technology-business-insurance/saas-companies/cost (re-checked Oct 6, 2026)
- [S23] US Bureau of Labor Statistics, Occupational Outlook Handbook, Software Developers (median annual wage $135,980, May 2025). https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm (re-checked Oct 6, 2026)
- [S24] Google, Workspace Admin Help, "HIPAA compliance with Google Workspace and Cloud Identity," opened Oct 6, 2026. https://knowledge.workspace.google.com/admin/compliance/hipaa-compliance-with-google-workspace-and-cloud-identity
- [S25] AccountableHQ (secondary), "Google Workspace HIPAA cost," found Oct 6, 2026 ($7/$14/$22 per user per month; not confirmed on Google's page). https://www.accountablehq.com/post/google-workspace-hipaa-cost-pricing-baa-requirements-and-plan-options
- [S26] domainoffer.net (secondary tracker), Cloudflare .com pricing, May 2026 ($10.46/year). https://domainoffer.net/tld/com/cloudflare
- [S27] Team analysis of the CMS Doctors and Clinicians national file [99], pulled Oct 2 and re-run Oct 6, 2026: 7,699 of 29,847 cardiologists in organizations of 100 or fewer (a proxy for independent; it includes some hospital practices); 2,152 such organizations with a median of 2 cardiologists; NYC 285–320 independent cardiologists (research.md's Oct 2 figure was 280–320), 122 small organizations (83 with one cardiologist), 39 organizations with 2+ independent cardiologists (144 cardiologists; median 2 per group; the mean of 3.7 is pulled up by two groups with 28 and 13), 22 where cardiologists are at least half the clinicians. The 39 include hospital-linked organizations (for example Maimonides Cardiology FPP, TBHC Medical Services PC of The Brooklyn Hospital Center, Icahn School of Medicine at Mount Sinai, and the Hospital for Special Surgery's legal entity); about 19–20 cardiology-focused groups remain after removing them (to confirm by phone). https://data.cms.gov/provider-data/dataset/mj5m-pzi6
- [S28] Live prototype checks, Oct 6, 2026: routes /, /tree, /summary, /invite, /view, /research, /how-it-works return HTTP 200; 10 of 10 logic tests pass; SMART launcher responds; CSP and Referrer-Policy headers present. https://family-health-tree-raj-s-projects12.vercel.app
- [S29] Phreesia, Form 10-K for fiscal 2026 (about 180 million patient visits; direct sales; sales cycles of three to twelve months; integrates with most major EMR and PM systems). https://www.sec.gov/Archives/edgar/data/1412408/000141240826000079/phr-20260131.htm
- [S31] FamGenix Family Health History, Apple App Store listing (seller FamHis, Inc; "Invite and share data with other family members"; version 4.0.0, Feb 11, 2025; 15 ratings), opened Oct 6, 2026. https://apps.apple.com/us/app/famgenix-family-health-history/id1483520084
- [S32] Zocdoc, "Pay-per-booking fees explained," The Paper Gown, Dec 17, 2025. https://thepapergown.zocdoc.com/facts/pay-per-booking-fees-explained/
- [S33] The Healthcare Technology Report, "Zocdoc Changes Payment Model, Begins Charging Per Booking," Aug 1, 2019. https://thehealthcaretechnologyreport.com/zocdoc-changes-payment-model-begins-charging-per-booking/
- [S34] Calendly, pricing page ("meeting invitees do not require a seat"), opened Oct 6, 2026. https://calendly.com/pricing
- [S35] Pendo and Calendly (Tyson Brown), "Going viral: Product-led principles to drive product virality and growth," conference deck, undated. https://go.pendo.io/rs/185-LQW-370/images/4.%20Track%202_Calendly%20%2B%20Pendo_Going%20viral.pdf
- [S36] DocuSign, eSignature plans and pricing (recipients "do not need an account to sign"), opened Oct 6, 2026. https://ecom.docusign.com/plans-and-pricing/esignature
- [S37] University of Texas at Austin, "Verifying Signatures | DocuSign" (Certificate of Completion records signer, time, IP). https://docusign.utexas.edu/verifying-signatures
- [S38] Ancestry Support, sharing a family tree (roles guest, contributor, editor; free account needed). Page returned 403; read from search-result text Oct 6, 2026. https://help-redir.ancestry.com/hc/en-ca/articles/53933335357843
- [S39] MyHeritage Education, "How To Get the Most Out Of Your Family Site," undated. https://education.myheritage.com/article/how-to-get-the-most-out-of-your-family-site/
- [S40] Eat App (Elana Kroon), "OpenTable pricing," Apr 24, 2026 (a competitor's summary; OpenTable's own page returned 503). https://restaurant.eatapp.co/blog/opentable-pricing
- [S41] Jotform, pricing page (HIPAA features from the Gold tier, $99/month billed yearly), opened Oct 6, 2026. https://www.jotform.com/pricing/
- [S42] Doximity, Form 10-K for fiscal 2026 (free for US medical professionals; customers primarily pharmaceutical manufacturers and health systems). https://www.sec.gov/Archives/edgar/data/0001516513/000151651326000025/docs-20260331.htm
- [S43] Pediatrix Medical Group, "Phreesia FAQs" (patient page: "Your doctor's office will send you an e-mail/text message from Phreesia a few days before your appointment"). https://www.pediatrix.com/pay-my-bill/patient-tools/phreesia-faqs
- [S44] Intuit TurboTax Support, "How do I import or enter my W-2?", updated July 7, 2026. https://ttlc.intuit.com/turbotax-support/en-us/help-article/import-export-data-files/import-enter-w-2/L55HzdeDr_US_en_US
- [S45] Wolf D, Yoo J, Collins A. "Selling to SMBs: A Founder's Playbook." Andreessen Horowitz, Dec 13, 2022 (33 digital health companies; 45-day average sales cycle). https://a16z.com/selling-to-smbs-a-founders-playbook/
- [S46] Southwick R. "Many hospital executives don't have a digital strategy: report." Chief Healthcare Executive, Apr 26, 2022 (Sage Growth Partners survey of 100 hospital executives: 31% say 6–9 months, 15% 9–12, 20% over a year to select a digital tool). https://www.chiefhealthcareexecutive.com/view/many-hospital-executives-don-t-have-a-digital-strategy-report
- [S47] NYU Langone Health, "Inherited Arrhythmia Program," opened Oct 6, 2026. https://nyulangone.org/care-services/inherited-arrhythmia-program
- [S48] Mount Sinai, "Cardiovascular Genetics Program," opened Oct 6, 2026. https://www.mountsinai.org/care/heart/services/cardiovascular-genetics
- [S49] Columbia University Division of Cardiology, "Clinics: CardioGenetics and Preventive Cardiology," opened Oct 6, 2026. https://www.columbiacardiology.org/node/2382
- [S51] Maron BJ et al. "Assessment of the 12-lead ECG as a screening test… in healthy general populations of young people (12–25 years of age)." Circulation 2014. PMID 25223981. https://europepmc.org/article/MED/25223981
- [S52] athenahealth Help, "Family History" (practice setting that shows family-history questions to patients in Enhanced Self Check-in), opened Oct 6, 2026. https://help.athenahealth.com/Ohelp/Content/C_Family_History_PH.htm
- [S53] New York Department of State, "Certificate of Publication for Domestic Limited Liability Company" ($50 filing fee; publish in two newspapers within 120 days of formation, LLC Law §206), opened Oct 6, 2026. https://dos.ny.gov/certificate-publication-domestic-limited-liability-company-0
- [S54] Nazareth S et al. "Hereditary Cancer Risk Using a Genetic Chatbot Before Routine Care Visits." Obstet Gynecol 2021 (full text: link sent "typically 5 days before an upcoming appointment"; reminders at 72 and 24 hours; funded by Ambry, Invitae and Progenity). Same study as research [92]; full text re-read Oct 6, 2026. https://europepmc.org/article/PMC/PMC8594498

**Other evidence:** Team Hub export (interview logs ID001–ID020 and D021; Milestone 1 track decision; advisor notes of Sept 9, 2026); `docs/mvp-spec.md`; prototype code (`src/lib/demo.ts`, `src/lib/clinical.ts`).
