# How Stemma would actually work

Team 709, Cornell Product Studio (NYC). Research as of 2 October 2026.

This write-up combines five research tracks: MyChart/EHR connections, privacy and compliance, clinical content, business model, and free hosting. An independent fact-checker reviewed each track against primary sources. Only confirmed or corrected findings appear here, and corrected findings use the corrected wording. Items that could not be verified are marked **(unverified)** or left out. Sources are numbered in brackets and listed at the end.

The interview base is 21 logged interviews: 15 patients, 2 PAs, an ER doctor, a genetics counselor, an internist and an RN.

---

## Bottom line

- **The problem is real and measurable.** In a 2026 Swedish study of 25,302 people, self-reports caught only 57.6% of heart attacks in parents and siblings, and early-onset cases were the most often misreported [87]. Only 28% of offspring reports that Dad had a heart attack before 55 were confirmed by medical records [32]. The Surgeon General's My Family Health Portrait tool matched a genetic counselor's heart-disease risk call for only 68% of people [88]. In UK primary-care records, only about 11% of positive heart family-history entries named both the relative and the age at onset [89]. A guided, side-of-family tree fixes most of the structure problems (MeTree: 99.8% of pedigrees met quality criteria, against under 4% of charts) [84].
- **The free prototype has to stay synthetic and serverless.** Vercel Hobby is free but limited to non-commercial use. Vercel signs no BAA on Hobby and its terms bar hosting health information without written approval [58][59][60]. The repo already fits this: no backend, tree data in the browser, a real SMART on FHIR login against a public sandbox, and a print-to-PDF summary. Once real patient data is involved, budget roughly $400–550 a month for a lean stack covered by BAAs (Vercel Pro plus the BAA add-on, Neon Scale, Amazon SES) [61][63][68].
- **Drop "store it in Box as a HIPAA-compliant cloud."** No HIPAA certification exists [55]. While the app is purely patient-directed, HIPAA does not govern it; the FTC Health Breach Notification Rule and state health-data laws do [33][36]. Once practices pay and summaries flow into their charts, the team becomes a HIPAA business associate [35]. Box signs a BAA only on Enterprise-tier plans, and it stores files, not a family tree [55][56][57]. Keep the tree in Postgres. Use Box, if at all, to deliver the summary PDF into a practice's own Box Enterprise account.
- **"Verified from MyChart" works for problem-list conditions, but not for family history.** A read-only app that asks only for USCDI data can self-register at fhir.epic.com for free and is distributed automatically to Epic customers that have auto-download turned on [5]. Epic's FamilyMemberHistory API is not part of USCDI, so requesting it means each health system must approve the app by hand [7][10]. The relative has to log in and authorize; the patient cannot. Label the result "from <health system>'s record, retrieved <date>", not "verified".
- **Get the summary to the practice as a PDF first.** Next comes a SMART Health Link QR code, then fax for the pilot. EHR write-back is product-stage, and Epic has no API for creating family-history entries [10][27].
- **Alerts belong to clinicians, never to patients.** Under the FDA's January 2026 guidance, decision support aimed at patients is a medical device [95]. Clinician alerts can stay outside device rules if they are rule-based, cite the guideline, show where each fact came from and what is missing, and offer options rather than orders [95]. The patient sees facts, education and "questions to ask". In a trial, tailored risk messages to patients *reduced* cholesterol screening (OR 0.34) [94].
- **The business is a small wedge, and price is the riskiest assumption.** No billing code pays for collecting family history [103]. Independent US cardiology at $99–149 per cardiologist per month is worth about $9–14M a year; NYC is worth at most about $0.5–0.6M [99]. FamGenix publishes a $500 per year clinician license with a cardiology add-on [111]. Run a paid 8–12 week pilot with 1–3 independent NYC groups, and treat price as one of the things being tested.

---

## 1. How it works end to end

### 1.1 The three people involved

| Person | Role | Pays? | Account? |
| --- | --- | --- | --- |
| Patient (e.g. Alex, new cardiology patient) | Builds the tree, invites relatives, reviews and shares the summary | No, free forever | Prototype: none (browser only). Pilot: email magic link |
| Relative (Mom, Uncle Dev, a grandparent) | Answers for themself, optionally shares one fact from their own patient portal, adds what they know about others | No | Never. They use a single-purpose invite link |
| Clinician / practice (cardiologist, PA, genetics counselor; the practice manager holds the budget) | Reads the one-page summary, checks it, decides what matters | Yes (the practice) | Pilot: practice staff accounts with MFA |

### 1.2 Patient flow

1. **Entry.** In the pilot, the practice sends the link with its new-patient paperwork. Practice-sent invitations drive engagement: a practice-sent pre-visit chatbot reached 64.2% engagement and 89.4% completion, averaging 15.4 minutes [92]. In the IGNITE rollout across four health systems, 58% of providers but only 7.8% of eligible patients enrolled [91]. The interviewed genetics counselor reports about 20% return on paper questionnaires.
2. **Build the skeleton by side of family.** "Let's start with your mother's side." The app creates fixed slots for parents, grandparents, siblings and the parents' siblings. A fixed layout prevents the "wrong side of the family" errors the genetics counselor worried about: with MeTree, relatives' lineage was recorded for 100% of relatives, against 28.4% in charts [84].
3. **Guided cardiac questions for each relative.** Questions use plain words and examples, not a blank form (script in section 3.3). Every answer is Yes / No / Not sure / Prefer not to say, with age at onset given as exact, "about", or a range.
4. **Invite relatives only after the patient has a usable summary.** In one family-history app, 29% of users dropped out at the "invite" step [93]. The invite goes from the patient's own phone through the share sheet, with a "Copy link" fallback. The message text contains no health information.
5. **Review.** The patient checks the facts, sees what is still unknown or conflicting, and confirms. Any edit clears the confirmation.
6. **Share.** The patient prints the page or saves it as a PDF, or gives the practice a read-only link or QR code.

### 1.3 Relative flow

1. Opens the invite link. It covers one tree and one person, needs no account, and in the pilot it expires and can be revoked.
2. Sees who asked, why, and exactly who will see their answers (the patient and the patient's cardiology team). They can decline outright; only the person themselves can decline.
3. Answers for themselves using the same guided questions.
4. **Optional: connect their own patient portal** (section 1.5) and tick one condition to share.
5. Optionally adds what they know about others they are related to (for example, Uncle Dev about his own parents).
6. Reviews and sends. Each fact is stored with who said it, when, and how they know it.

### 1.4 Clinician flow

The clinician gets one page, in this order:

1. **Guideline criteria matched**, labeled "for clinician review": each line names the relative, side, age, source and guideline with its year.
2. **What is unknown, declined or conflicting**, for example "Father's side: grandfather unknown" or "Mom says heart attack at 60; Uncle Dev says angina at about 58".
3. A compact three-generation pedigree in NSGC 2022 style [85].
4. A table of every relative with status and source badges: patient-reported, relative self-reported, or from a portal record with its date.
5. A completeness score against MeTree's 8 quality criteria [84].
6. Footer: "Patient-reported family history for clinician review. Not a diagnosis. Rules based on [guideline, version]. Generated [date]."

A "Reviewed by clinician" state locks the version that goes into the chart. That is the human in the loop the genetics counselor asked for ("There has to be a human in the loop to make the judgment about what matters").

### 1.5 Where data lives at each stage

| Stage | Tree data | Invites and replies | Portal fact | Summary to practice | Who can be harmed if it leaks |
| --- | --- | --- | --- | --- | --- |
| **Prototype (now)** | Browser `localStorage` only | Data packed into the link after `#`, which browsers never send to a server | Fetched in the browser from a public synthetic sandbox; only the ticked fact is kept | Print/PDF, or a read-only link with data after `#` | Nobody, as long as the data is synthetic |
| **Pilot** | Postgres (Neon Scale with HIPAA turned on, under a BAA) behind Vercel Pro with the BAA add-on | Server-stored records behind an opaque, hashed, expiring, revocable token | Fetched in the browser, then only the single chosen item is sent to the server | PDF; SMART Health Link; fax from a BAA-covered backend | Real families, so BAAs, audit log, MFA, breach plan |
| **Product** | Same, plus field-level encryption for notes and longer backups | Same | Plus aggregator or TEFCA options | Plus Direct messaging and EHR integration where the practice's EHR supports it | Same, at scale |

### 1.6 How a MyChart connection would really work

**What the federal rules guarantee.** Certified EHR patient APIs must support US Core 6.1.0 (USCDI v3) and SMART App Launch 2.0, including standalone patient apps [1]. ONC used enforcement discretion to push the compliance date to February 28, 2026 [3]. Under 45 CFR 170.404, the EHR developer must publish patient-access endpoints for free and enable a patient-chosen app within a fixed timeline: it may verify the app's authenticity within 10 business days, then must enable it within 5 business days. It may charge app developers only for value-added services [2]. **That guarantee covers only certified USCDI data.** It does not force any health system to approve non-USCDI APIs such as FamilyMemberHistory [2].

**The realistic flow (Epic, which covers most large NYC systems):**

1. The team registers a patient-facing app at fhir.epic.com. Registration is self-service, free, and issues both a sandbox and a production client ID [5].
2. The app asks only for read-only USCDI scopes: Patient and Condition (Problems and Encounter Diagnosis). That keeps it eligible for **automatic distribution**: Epic organizations with auto-download enabled receive the client ID on a rolling cycle of about 12 hours, with no hospital sponsor and no fee [5][6][11]. Auto-distribution has further conditions. The app must only read data; adding any Create API disqualifies it. It may not use refresh tokens unless a client secret is uploaded for each organization. And the organization must license USCDI APIs and not have turned auto-download off [5]. A production app record cannot be edited, so the scope list must be final before marking it ready [5].
3. The relative picks their hospital from a list built from Epic's **Brands** endpoint bundle (822 endpoints), not the older R4 list (479). Northwell Health, for example, appears only in the Brands bundle, with a live R4 endpoint [12][13].
4. The relative logs into their own MyChart through a SMART standalone launch: public client, PKCE S256, and SMART 2.0 scopes that let the patient untick categories [1]. Epic's sandbox advertises all of these [5]. Only the relative can authorize this, because it is their own right of access [34].
5. The relative's browser fetches their problem list directly. CORS preflights returned open headers at Epic's sandbox and at Northwell. The relative ticks one condition. The app keeps only `{code, display, "on problem list since <date>", health system, retrieved-at, resource id}` and discards the rest without logging it. With a public client there is no refresh token, so the relative logs in again for any later pull, which is fine for a one-time share.
6. Before any real use, the team fills in Epic's Data Use Questionnaire and publishes a privacy policy. Otherwise MyChart shows the patient a warning on the authorization screen [5].

**The catches to design around:**

| Catch | Why it matters | What to do |
| --- | --- | --- |
| Epic's `FamilyMemberHistory` API exists for patient apps (relationship, condition, onsetAge, deceased) but is **not USCDI** [7][10] | Requesting it ends automatic distribution, and each health system must approve the app by hand | For the pilot, register a second app that requests it, and offer it only to a partner health system that agrees to approve it. Treat that approval as a favor, not an entitlement [2] |
| Epic Condition `onsetDateTime` holds the date the problem was **added to the list** (Feb 2024+ versions), not necessarily the diagnosis date [8] | "Atrial fibrillation, 2009" may really mean "listed in 2009" | Show "on problem list since 2009" and ask the relative to confirm age at diagnosis. Flag `verificationStatus = provisional` (outside records) as lower confidence [8] |
| Epic's **Medical History** API (past medical history) is non-USCDI and not auto-distributed [9] | A relative's old heart attack or bypass recorded only there is invisible to a USCDI-only app | "Not found in the record" must never display as "did not happen" |
| No public sandbox has FamilyMemberHistory data: Epic's test patients have none, and the SMART server has 0 [6][19] | The demo cannot pull family history | Seed family history synthetically and demo the Condition pull |
| No family-history write-back: Epic has no create API for FamilyMemberHistory, and any write API breaks auto-distribution [10][5] | Cannot push the tree into Epic's structured family history | PDF or SMART Health Link to the practice instead |
| Relatives on non-Epic portals | Needs separate registrations; Oracle Health provisioning is **(unverified)** | Epic first; add others when pilot relatives need them |

**Standards are moving toward this product, slowly.** Family Health History became a USCDI data element in v6 (July 2025) and has a US Core 9 profile. Using them is **voluntary** under ONC's 2026 Standards Version Advancement Process from August 29, 2026, not required [14][15][16]. Even in US Core 9, age at onset is not "Must Support", so the age that defines "premature" heart disease may not come through [16]. Meanwhile, ONC's HTI-5 proposal (December 2025, still not final) would *remove* the EHR certification criterion for family health history from January 2027 [4]. Both points support a patient-held tool. Store the tree so it exports cleanly to US Core 9 FamilyMemberHistory with provenance.

**Options beyond direct Epic, for later:**

| Option | Status (Oct 2026) | Fit |
| --- | --- | --- |
| TEFCA Individual Access Services (one login, many portals) | Requires IAL2 identity proofing before first use and AAL2 login, under the IAS Exchange Purpose SOP v3 (effective Aug 3, 2026) [21]. Epic answers IAS only for confidential clients with a JWK Set URL [20] | Product stage, through a partner. A browser-only app cannot use it |
| Flexpa | Startup tier $20,000/yr including 1,000 IAL2 verifications; free test-mode keys [22][23] | Product stage. Test mode is free to try |
| Fasten Connect | Free test-mode keys with Epic sandbox logins; live pricing not published [24] | Ask for a startup price before the pilot |
| 1upHealth Patient Connect | Shut down September 30, 2026 [25] | Do not use |
| Apple Health Records | Native iOS (HealthKit) only; no family-history record type [26] | Skip |
| CMS "Kill the Clipboard" / CMS-aligned apps | Practices receive SMART Health Link QR codes; Epic, athenahealth, eClinicalWorks, MEDITECH, NextGen and others are listed as able to receive now. The guide expects IAL2/AAL2 identity verification, and family history is not mentioned [27][28] | Strong pitch story ("the family-history piece CMS leaves out"); becoming CMS-aligned is product stage |

### 1.7 How the summary reaches the practice

| Channel | Stage | Cost | Works with | Caveats |
| --- | --- | --- | --- | --- |
| PDF the patient prints, uploads or sends as a portal message | Prototype onward | $0 | Every practice | Staff may still re-key it |
| Read-only link or QR with the data after `#` | Prototype only | $0 | Any browser | Anyone with the link can read it, and it cannot be revoked. Synthetic data only |
| SMART Health Link QR: encrypted FHIR Bundle (FamilyMemberHistory plus the PDF as a DocumentReference) [29] | Pilot | Needs BAA-covered hosting for the encrypted file | EHRs that CMS lists as able to receive [27] | Not purely client-side: the link must point to hosted ciphertext, and passcode links need server enforcement [29]. EHRs may file only the PDF. Whether a practice accepts links from a non-IAL2 app is untested |
| Fax through an API | Pilot | About $0.045/page [30] | Every practice | A BAA is not confirmed on the vendor's page; needs a BAA-covered backend |
| Drop into the practice's own Box Enterprise | Pilot, only if the practice already uses Box | Practice's own Box BAA | Box shops | Ask Box in writing whether API usage is in BAA scope |
| Direct secure messaging | Product | Needs a contract with a Direct messaging provider (HISP) | Only 24 of 200 sampled NYC cardiology NPIs list any endpoint [31] | Low reach |
| EHR app or write-back | Product | Epic Connection Hub listing $500 per app per year, needs a live connection [11] | Epic shops | No FamilyMemberHistory create API; DocumentReference write is non-USCDI [10] |

---

## 2. Privacy and compliance

### 2.1 When HIPAA applies

HIPAA applies only to covered entities and their business associates. An app the patient chooses for themself is not a business associate, even when it pulls the patient's own records through an API. Once a covered entity sends data to an app the patient directed it to, that data "would no longer be subject to HIPAA" (HHS guidance, as quoted in [33][34]; hhs.gov blocked direct access, so the quotes come from secondary sources). An app becomes a business associate when a covered entity contracts for it and directs it to create, receive, maintain or transmit health information on the entity's behalf [35]. HHS's own example: a developer contracted by a provider to build an app whose patient input is sent into the provider's EHR is a business associate [33].

| Mode | Who directs the data | HIPAA? | What governs |
| --- | --- | --- | --- |
| Patient finds the app, builds the tree, downloads the PDF | Patient | No | FTC Act Section 5 (deception), FTC Health Breach Notification Rule, state health-data laws |
| Relative connects their own MyChart and shares one fact | Relative (right of access) | Not once released to the app | Same as above, plus the relative's own consent |
| **Practice pays, invites its patients, and summaries feed its chart** | Practice | **Yes: the team is a business associate** | HIPAA Privacy, Security and Breach rules; a BAA with every practice and every vendor that touches the data. The FTC says a business associate that also offers a consumer health record "may be subject to both" rules [36] |

**Plan to be a business associate as soon as practices pay.** That means a BAA template for practices, a documented Security Rule risk analysis, a register of vendor BAAs, and MFA plus encryption from day one. HHS's proposed Security Rule update, which would mandate MFA and encryption, is not final and is now projected for 2027 at the earliest [71]. Practices' security questionnaires will ask for both anyway. Have counsel decide whether the consumer side can sit outside HIPAA (a hybrid model) or whether everything should simply be treated as protected health information.

### 2.2 FTC and state law (applies even without HIPAA)

**FTC Health Breach Notification Rule** (16 CFR 318, amended July 2024). It covers vendors of personal health records: records that can draw information from multiple sources and are managed by or for the individual. Health apps are explicitly covered, and the definition includes genetic information [36][37]. A "breach" includes disclosure without the user's authorization, such as an analytics pixel, not only hacking. Notice to individuals is due within 60 days, with the FTC notified at the same time if 500 or more people are affected. Penalties are up to $53,088 per violation; the FTC left the amount unchanged for 2026 [36][38]. The FTC withdrew its 2021 policy statement on health apps on September 9, 2026, so cite the rule itself, not the statement [40]. The first enforcement case, GoodRx, ended in a $1.5M penalty, and the complaint included a seal that falsely suggested HIPAA compliance [39].

| Law | Who it reaches | What it requires | Consequence for this product |
| --- | --- | --- | --- |
| **NY Health Information Privacy Act** (S9269/A10357) | Any entity processing NY residents' (or people in NY) health information. No size threshold. HIPAA data is exempt only where a business associate maintains it like PHI | Processing must be "strictly necessary" for a product the person requested, or have a separate authorization. An authorization is per category, lasts at most one year, is signed by **the person the data is about**, and cannot be re-requested for 9 months after a refusal. Sale is unlawful even with consent. Access and deletion requests get a 30-day response. AG enforcement, up to $15,000 per violation. Takes effect 6 months after signing [41][42] | **Passed both houses on June 3–4, 2026, but has not been delivered to the Governor** (she vetoed the earlier version in December 2025) [41]. Build to it now: it is the strictest standard and the most likely to apply to NYC users. Its authorization rule raises a real question about relatives' entries |
| NY breach law (GBL 899-aa) | Any business holding NY residents' computerized data | Medical and health-insurance information count as private information; notify within **30 days** of discovering a breach, and also notify state agencies [43] | The breach clock is 30 days, shorter than the FTC's 60 |
| Washington My Health My Data Act | Entities doing business in WA or targeting WA consumers; covers WA residents and data collected in WA, with no revenue threshold. Private right of action; first class action filed February 2025 [44][45] | Consent to collect unless necessary for a product **the consumer requested**; separate consent to share | Once you invite Aunt in Seattle, she is a WA consumer who never requested the product. She needs her own opt-in |
| California CMIA, Civil Code 56.06(b) | Any business offering software "designed to maintain medical information" | Treated as a health-care provider for confidentiality; $1,000 nominal damages without proof of harm [46][47] | One California user brings CMIA in from day one |
| Connecticut CTDPA (as amended by PA 25-113, effective July 1, 2026) | Any controller processing any CT consumer's sensitive data, health data included, at any volume [49] | Consent to process; separate consent to sell | One CT user brings the full CTDPA in |
| Nevada (NRS 603A) | No thresholds | Affirmative consent to collect, separate consent to share, written authorization to sell [48] | Same consent-first design covers it |

The NY Attorney General already enforces health-data leaks under existing law. NewYork-Presbyterian paid $300,000 partly because condition names in page URLs reached ad-tech vendors [53]. **Keep condition names out of URLs and page titles, and put no third-party analytics or ad pixels on any page that shows tree data.**

### 2.3 GINA: family history is genetic information

In federal law, family medical history *is* "genetic information" [50][35]. GINA bars health insurers from using it and bars employers with 15 or more employees from requesting it. It does **not** cover life, disability or long-term-care insurance, or employers with fewer than 15 staff [51]. Illinois's Genetic Information Privacy Act uses the same definition, with a private right of action ($2,500 per negligent violation, $15,000 willful) and an active wave of class actions against employers who ask about family history [52].

So: no employer, wellness or insurer channels, and no data sales, ever. Tell users plainly that life, disability and long-term-care insurers can legally ask about family history and that the app never shares with them. Do not say "GINA protects you from insurers" without that caveat.

### 2.4 Consent for relatives, minors and the deceased

- **Each relative owns their branch.** What a relative contributes is shared onward only with their explicit, separate opt-in. They can view, correct, mark "prefer not to say", or delete it. A "declined" relative's wish wins: the summary keeps only what the patient knows firsthand and drops other relatives' secondhand reports about them.
- **What the patient enters about relatives stays minimal:** relationship, side, sex at birth, condition and age. No relative contact details, date of birth or full name unless the relative joins. Label it "reported by Alex, <date>".
- **The portal pull is authorized by the relative, not the patient.** Request the narrowest scope. The relative's consent screen must mention that the app briefly receives the full problem list, because that counts as "processing" under NYHIPA, MHMDA and the FTC rule. Never log it, and delete it immediately.
- **Adults only (18+) for accounts and invites.** Amended COPPA rules apply to under-13s (full compliance from April 22, 2026) [120], and New York's Child Data Protection Act covers known users under 18 [54]. A parent enters a minor's information, kept minimal.
- **Deceased relatives get no practical exemption.** Their history is genetic information about living relatives, so treat it the same way.
- **Breaches spread across linked relatives.** 23andMe paid an $18M, 42-state settlement (July 2026) and a £2.31M UK fine, and regulators cited missing MFA, missing breached-password checks and missing rate limiting [115][116]. Require MFA for staff, give least-privilege views, and put in the terms that data is never sold or transferred, even in bankruptcy or acquisition, without fresh consent.

### 2.5 The Box plan: what it covers and what it doesn't

| Box covers | Box does not cover |
| --- | --- |
| A signed BAA on **Enterprise, Enterprise Plus and Enterprise Advanced** accounts, requested in the Admin Console; Box's FAQ says the BAA should be in place before any PHI is stored [55] | Free, Business Starter, Business or Business Plus plans: no BAA [55][56] |
| Encrypted file storage for documents: summary PDFs, uploaded records | A family-tree database. The tree is relational data (people, relationships, conditions, per-fact status and source, concurrent edits). In Box it would become JSON files with no queries and no transactions, on a metered budget of 100,000 API calls a month for Enterprise and 1,000 requests per minute per user [56][57] |
| Delivery into a practice's **own** Box Enterprise, under the practice's BAA | The consumer side of the product. The FTC rule and state laws apply whatever the storage vendor |
| | "HIPAA compliance" by itself. Box says no official HIPAA certification exists and customers must configure Box compliantly [55] |
| | Clarity on whether API usage and service accounts ("App Users") fall inside the BAA. The public docs don't say [55] |

Cost if the team owns a tenant: business plans need at least 3 users. Enterprise appears only as self-serve "Buy now" with no listed price; third-party trackers estimate about $35 per user per month, roughly $1,260 a year at minimum **(price unverified)** [56].

**Recommendation:** use Postgres for the tree. Keep Box as an optional channel that drops the summary PDF into the practice's own Box, and only after Box confirms API coverage in writing.

### 2.6 Vendors that will sign a BAA (for the pilot)

| Need | Free tier signs a BAA? | Cheapest option that does |
| --- | --- | --- |
| Hosting | Vercel Hobby: no, and non-commercial use only [58] | Vercel Pro $20 per seat per month plus HIPAA BAA add-on $350/month [61]. Vercel's guide says to keep health data out of preview and test environments [62]. Vercel Blob is not named among covered services, so get that in writing |
| Database | Neon Free, Supabase Free: no | Neon Scale with HIPAA enabled: self-serve BAA, no surcharge today, usage-based. About $40/month always-on, less with scale-to-zero. Enabling HIPAA is irreversible, and health data must never appear in table or column names or logs [63][64]. Supabase: Team plan from $599/month plus a paid add-on [65] |
| Auth | Clerk: BAA on Enterprise only [66] | Better Auth (open source, MIT), storing users in your own covered database |
| Email | Resend cannot sign a BAA [67] | Amazon SES under the AWS BAA [68], or keep all health information out of emails |
| SMS | Twilio: BAA only on Security or Enterprise Edition [69] | Have the patient send invites from their own phone, with no health information in the text |

### 2.7 Wording for slides

**Use:**
- "Prototype uses synthetic data only."
- "Patient-controlled: nothing is shared without the patient's, and each relative's, explicit OK."
- "Built to operate as a HIPAA business associate: we sign BAAs with practices and use only infrastructure vendors that sign BAAs with us."
- "Designed for the FTC Health Breach Notification Rule and state health-privacy laws (WA, CA, CT, NV; NY pending)."
- "Does not diagnose. A clinician decides what matters."
- "From <health system>'s record, retrieved <date>" (for portal facts).
- "Only 28% of offspring reports that Dad had a heart attack before 55 were confirmed by medical records" (Framingham, PMID 15023709) [32].

**Avoid:**
- "HIPAA certified", "HIPAA-compliant cloud (Box)", any HIPAA badge or seal (see GoodRx [39]).
- "HIPAA protects your data in our app" (untrue in consumer mode).
- "Verified diagnosis" or "clinically verified".
- "GINA protects you from insurers" (it doesn't cover life, disability or LTC).
- "Patients are right only 28% of the time" (the figure is a positive predictive value for one question) [32].
- Quoting HHS FAQs 510/511 on family history as verified (they could not be opened).
- "Most of Particle's antitrust claims were dismissed": the core Sherman Act claims survived.

Run the FTC's free Mobile Health Apps Interactive Tool and cite it as the team's compliance self-check [70].

---

## 3. Clinical content

### 3.1 What cardiology needs from a family history

For each blood relative: relationship and **side**, **sex assigned at birth** (cutoffs are sex-specific), the condition, **age at onset** (exact, "about", or a range), living or deceased, **age at death and cause**, whether the death was **sudden or unexpected**, and **autopsy** status. The 2024 AHA/ACC hypertrophic cardiomyopathy (HCM) guideline names a three-generation family history as the standard for everyone evaluated for HCM [72]. AAFP pedigree guidance and MeTree's 8 quality criteria list the same fields [83][84]. NSGC's 2022 nomenclature records sex assigned at birth separately from gender identity [85].

**Family-history criteria in current guidelines (checked against the guideline text):**

| Pattern in a relative | Who counts | Cutoff | Guideline | Note |
| --- | --- | --- | --- | --- |
| Premature atherosclerotic heart disease (heart attack, stent, bypass, angina) | Parent or sibling | Men < 55, women < 65 | 2018 ACC/AHA cholesterol guideline [76]; still a named risk enhancer in the 2026 ACC/AHA dyslipidemia guideline [74] | The exact 2026 cutoffs are **unverified**, so cite 2018 for the ages |
| Familial hypercholesterolemia (FH) signals | First- and second-degree | Dutch Lipid Clinic: first-degree premature heart disease (men < 55, women < 60) or LDL above the 95th percentile. Simon Broome: heart attack < 60 in a first-degree or < 50 in a second-degree relative; total cholesterol > 290 mg/dL in an adult relative [77] | 2026 guideline: Class 1 universal lipid screening at ages 9–11; cascade screening from age 2 when a first- or second-degree relative has premature heart disease or severe hypercholesterolemia; Lp(a) at least once in every adult, plus first-ever Lp(a) cascade screening [74][75] | About 90% of FH is undiagnosed [75] |
| HCM | First-degree | Any age, triggering clinical screening (echo every 1–2 years in children, 3–5 in adults); cascade genetic testing only if the patient has a pathogenic variant [72] | 2024 AHA/ACC HCM | "Sudden death ≤ 50 in a first-degree or close relative" is a criterion for an implanted defibrillator in people who **already have** HCM, not a screening trigger [73] |
| Dilated cardiomyopathy | ≥ 2 first- or second-degree relatives with it, **or** a first-degree relative with autopsy-proven DCM or sudden death < 50 | — | 2025 ESC consensus: ECG plus imaging advised for every first-degree relative [80] | |
| Aortic root or ascending aneurysm, or dissection | First-degree | Any age | 2022 ACC/AHA aortic guideline: screen relatives with genetic testing and imaging [81] | Bicuspid valve and Marfan are not in the verified text, so ask about them but don't alert on them yet |
| Named inherited arrhythmia (long QT, Brugada, CPVT) or a known pathogenic variant | Any | — | Diagnostic scores give points for family history but also need an ECG finding [82] | Never compute these scores for patients |
| Sudden unexplained death or cardiac arrest | Any | Record age, circumstances (exercise, swimming, sleep, alarm), autopsy | 2020 APHRS/HRS consensus: record drownings in good swimmers, unexplained crashes, SIDS and late fetal demise. Its text uses "< 40" for genetic evaluation; a "Class 1, < 45" cutoff is **unverified**. After cardiac arrest, a three-generation pedigree by "a practitioner knowledgeable in the genetics of cardiovascular disease... is mandatory" [78] | That "mandatory" line is why a patient-built tree supports expert review but never replaces it |
| Atrial fibrillation in a relative | — | — | **No verified family-history criterion.** The 2023 ACC/AHA AF guideline's Class 2b genetic-testing recommendation concerns a patient's **own** AF before 45 [79] | Show as "also noted", not as a guideline alert |

### 3.2 Why patient report alone isn't enough, and what helps

| Finding | Number | Source |
| --- | --- | --- |
| Absence of disease is reported more accurately than presence; first-degree relatives more accurately than distant ones | 41-study systematic review | [86] |
| Self-reported heart attack in parents and siblings vs national registers (25,302 Swedes) | Sensitivity 57.6%, PPV 73.9%; early-onset cases misreported more; men and people without a university degree less accurate | [87] |
| Offspring reports of paternal heart attack before 55, confirmed by records | 28% (PPV; positive likelihood ratio 8.6) | [32] |
| My Family Health Portrait (Surgeon General's tool, built by NIH) vs genetic-counselor pedigree, coronary disease risk | 68% agreement (94–99% for diabetes and cancers). Causes: missing relatives; heart failure or valve problems reported as coronary disease; stroke and heart attack confused | [88] |
| UK primary-care records: positive heart family-history entries naming relative **and** age at onset | About 11% (1.5M patients, 1998–2008) | [89] |
| MeTree guided tool vs charts | 99.8% vs < 4% high-quality pedigrees; lineage 100% vs 28.4%; age of onset 72.1% vs 18.2%; **but cause of death 58.9% vs 98.1%** | [84] |
| MeTree completion | 27.1 minutes average; 26% needed help, 77% of them over 60 | [90] |
| Tailored family-history risk messages to patients (randomized trial, 41 practices) | **Lower** cholesterol screening (OR 0.34); small diet and activity gains | [94] |

Design consequences: make side of family structural; give cause of death its own required step; store "no heart history" separately from "I don't know"; attach a source and a confidence badge to every "yes"; let relatives upgrade facts by answering for themselves or sharing a portal record; give older adults a help path; keep risk messaging away from patients.

### 3.3 Guided question script

**Part A: build the tree (the layout prevents wrong-side errors).**
"Let's start with your mother's side." Add Mother, her parents, and her brothers and sisters. Then Father's side. Then your siblings ("Same two parents?" decides full or half sibling), then your children. For each person ask:

- What do you call them? (first name or nickname)
- Sex assigned at birth (gender identity optional)
- Year born or current age (exact / about / don't know)
- Living? If not: age at death (exact / range / "Was it before 50?"), cause (heart attack, stroke, heart failure, sudden or unexpected, cancer, accident, other, don't know), "Was it sudden or unexpected?", "Was there an autopsy?"
- Flags: adopted, donor-conceived, biological parent unknown. Each becomes an explicit "biological history unavailable" line, never a blank.

**Part B: heart questions for each relative.** Answers are Yes / No / Not sure / Prefer not to say, with examples in plain words:

1. Heart attack or blocked heart arteries? (stent, "balloon", bypass, chest-pain hospital stay). Then age at first event; if unknown, "Was he younger than 55?" / "Was she younger than 65?"
2. Stroke or mini-stroke (TIA)? (explain it is different from a heart attack)
3. Very high cholesterol? (cholesterol pills in their 20s–30s, told it was "genetic" or "familial", LDL over 190, fatty bumps on knuckles, heels, elbows or eyelids, told their Lp(a) was high)
4. Died suddenly or unexpectedly? (no warning, found in bed, drowned though a good swimmer, unexplained single-car crash, SIDS, late stillbirth, collapsed during sport). Then age, autopsy and result.
5. Fainting or seizures never explained? (during exercise or swimming, when startled by an alarm or phone; "epilepsy" that didn't respond to medicine)
6. Heart rhythm problem? (AFib, racing or irregular heartbeat, pacemaker, defibrillator/ICD, long QT, Brugada, WPW). Then age diagnosed.
7. Heart muscle problem or heart failure? (enlarged heart, thick heart walls/HCM, weak heart/DCM, transplant, heart failure before 60)
8. Problem with the aorta or a heart valve? (aneurysm, tear/dissection, Marfan, bicuspid valve, heart surgery as a baby)
9. Has anyone had a heart genetic test? (gene name if known, e.g. MYBPC3 or LDLR; upload the letter)
10. For each Yes: "How do you know?" (saw records / they told me / family story) and "Who told you, and when?"
11. Pertinent negative: "As far as you know, no heart problems" is stored separately from "I don't know their health."

**Patient-level questions:** ancestry (the 2026 guideline lists high-risk ancestry such as South Asian or Filipino as a risk enhancer; store the answer, not a flag) [121]; whether parents are related by blood; the patient's own heart diagnoses.

Only after the core tree is done: "Who could fill in Dad's side?" as an optional invite.

### 3.4 Data model: every fact is an assertion

Store each fact as an assertion: subject relative, field, value, reporter, how they know (self / relative / portal / family story), timestamp, confidence. Derive the displayed status; never type it in by hand.

| App status | Meaning | FHIR R4 FamilyMemberHistory export (US Core 9 shape) |
| --- | --- | --- |
| **known** | At least one answer, no disagreement (includes "no heart history") | `status = completed`. Each condition carries `onsetAge` (or `onsetRange` for "in her 40s") and a note naming reporter and date |
| **conflicting** | Sources disagree on condition or age (Mom: heart attack at 60; Uncle Dev: angina at about 58) | `status = partial`. **Every** reported condition kept as its own entry with its reporter; an app-level conflict note. Never merged or silently resolved |
| **unknown** | Nobody knows, or not asked yet | `status = health-unknown`; `dataAbsentReason = unable-to-obtain`, or `subject-unknown` when the biological relative is unknown (adoption) |
| ↳ invited, no answer yet | Sub-state of unknown | `dataAbsentReason = deferred` |
| **declined** | The person said "prefer not to share" (only they can) | `status = health-unknown`; `dataAbsentReason = withheld`. Others' secondhand reports dropped |

Caveats: in FHIR, `status = health-unknown` and `dataAbsentReason` describe the **whole relative**, not one condition, so per-fact states need the app's own model plus notes or extensions [17]. US Core 9 requires `status`, `patient` and `relationship`, and lists the recorder (provenance) extension as an additional USCDI requirement [16]. Use SNOMED CT or ICD-10-CM codes on export, but keep the person's own words in notes.

### 3.5 Safety lines (FDA)

| Feature | FDA position | Source |
| --- | --- | --- |
| Building, storing and sharing the tree; recording data to share with a clinician; patient education; "questions to ask your doctor" | Not a device | [96] |
| Patient-specific screening suggestions from well-known authorities based on age, sex and behavioral risk factors | Enforcement discretion (family history is not named, so only arguably covered) | [96] |
| **Any recommendation shown to patients or caregivers** ("you are at high risk", "you may have FH", "you need genetic testing", risk percentages, traffic-light meters) | **A device** | [95] |
| Clinician-facing alerts (FDA's own example: software that uses family history to recommend a clinician *consider* more frequent mammography) | Can be non-device if the clinician can independently review the basis: state the intended user, show inputs and their quality, cite the guideline with its version, show what is unknown or missing, and prioritize what matters for the decision | [95] |
| Using information that cannot be verified to generate a **specific diagnostic** recommendation; adding genomic variants without established relevance; time-critical uses | A device | [95] |

**Product rules that follow:**
1. **Two views.** The patient sees facts, gaps, education and generic questions to ask. The clinician document carries the "guideline criteria matched" block. The patient prints or forwards the clinician page but is not its audience. Whether a printed clinician page in the patient's hands is acceptable is an **open question for regulatory counsel**.
2. Alerts are deterministic, cited and versioned, and offered as options ("consider lipid evaluation or genetics referral per [guideline]"), never as orders or a single diagnosis.
3. No risk scores, no polygenic or raw-variant inputs, and no free-text LLM medical advice. An LLM, if used at all, only maps the person's words to terms ("weak heart" → cardiomyopathy?) and the person confirms each mapping.
4. Write a one-paragraph intended-use statement: "organizes patient- and relative-reported family health history and shares it with the patient's clinician; flags guideline-defined family-history criteria for clinician review; does not diagnose or give treatment recommendations to patients." Use FDA's Q-Submission process before adding any risk model.

---

## 4. Business

### 4.1 Segments and who pays

| Segment | Role | Why they'd care | Notes |
| --- | --- | --- | --- |
| Patients | Users, free | Walk in prepared; stop guessing | No ads, no data sales, in the terms |
| Relatives | Contributors, free | Asked by family; control their own branch | No account needed |
| **Independent cardiology practices** (practice manager holds the budget) | **First payers** | Staff and clinician time spent reconstructing family history; relatives who need screening identified | 30.7% of cardiologists are in private practice, the lowest of any specialty (AMA 2024) [98] |
| Large independent and private-equity cardiology groups | Better early enterprise buyers | One contract covers many cardiologists | e.g. CVAUSA reports 557+ physicians and APPs at 160+ locations [102]. Some large independent groups exceed 100 clinicians [99] |
| Genetics programs and counselors | Validators and channel | Pedigrees built by hand today | Thin reimbursement: genetic counseling (96041) is bundled for Medicare [103], and counselors can't bill Medicare directly; S.3607 has sat in the Senate Finance Committee since January 2026 [119] |
| Primary care | Later market | The Medicare Annual Wellness Visit **requires** family history (parents, siblings, children) [104] | G0438 pays $174.35, G0439 $137.61 nationally [103] |
| Health systems | Later, enterprise | Lipid, cardiogenetics and HCM clinics | Epic shops; already have MyChart questionnaires |
| CMS ACCESS Model participants | Later channel | Began July 5, 2026 with 160+ organizations; heart failure track from April 1, 2027 [106] | Outcome-aligned payments, not a code |
| **Avoid** | Life insurers, employers, wellness vendors, data buyers | — | GINA, Illinois GIPA, 23andMe lessons [51][52][115] |

### 4.2 Why there's no billing code to lean on

From the 2026 Medicare fee schedule (October release, national non-facility rates) [103]:

| Code | What | 2026 Medicare |
| --- | --- | --- |
| 96160 | Patient-focused health risk assessment | $3.01 |
| 96041 | Genetic counseling | Bundled (status B) |
| G0438 / G0439 | Initial / subsequent Annual Wellness Visit | $174.35 / $137.61 |
| 99204 | New patient visit, moderate complexity | $177.36 |
| 93306 | Transthoracic echo | $196.73 |

Since 2021, history-taking no longer sets the office-visit level; complexity of decision-making or total time does [105]. A richer family history therefore does not raise the bill. The pitch is **time saved and better decisions**, plus relatives who need screening. A relative who becomes a new patient (99204 + 93306 ≈ $374 under Medicare) is the strongest ROI story, but **pricing must never be tied to referrals or new patients** (anti-kickback and fee-splitting risk; have a lawyer review any volume-linked pricing).

### 4.3 Pricing hypothesis

- Patients and relatives: free forever, no ads, no data sales.
- Practices: a flat fee per cardiologist on an annual contract. The starting hypothesis is $99–149 per cardiologist per month, or $300–500 a month for a solo or small group. This is **high next to the anchors**: FamGenix lists $500 per clinician per year [111], IntakeQ forms cost $54.90 a month [114], Phreesia's full intake platform is free through December 31, 2026 [112], and labs give pedigree tools away [107]. Price is something the pilot must test.
- ROI math, with the staff cost as an **assumption**: 10 minutes saved × about $30/hour loaded staff cost ≈ $5 per new patient. At $150 per cardiologist per month, that needs about 30 completed summaries per cardiologist per month to break even. Saved staff minutes only become cash if they free up capacity. (Benchmarks: a three-generation pedigree takes 15–30 minutes [83]; primary-care physicians spend under 2.5 minutes on family history and discuss it in only 51% of new visits [117].)
- Hosting cost to cover in the price: about $400–550 a month for the lean BAA stack (section 2.6), before any revenue.

### 4.4 Market size, with the math

| Market | Cardiologists | × price per year | = annual value |
| --- | --- | --- | --- |
| US independent cardiology (CMS clinician file, Aug 2026: 7,699 of 29,847 cardiology clinicians are in organizations of 100 or fewer) [99] | 7,699 | $1,188 ($99/mo) to $1,788 ($149/mo) | **$9.1M – $13.8M** |
| Upper bound (AJMC: about 10,000 independent cardiologists) [100] | 10,000 | $1,788 | $17.9M |
| At the FamGenix price anchor [111] | 7,699 | $500 | $3.8M |
| NYC independent (about 280–320 of about 1,359 NYC cardiology clinicians; 76–79% sit inside NYU, Columbia, Mount Sinai, Northwell, Montefiore and Weill Cornell) [99] | 280–320 | $1,800 | **$0.50M – $0.58M** |

Organization size of 100 or fewer is only a proxy for independence; it leaves out some large independent groups [99]. Private equity owned only 2.9% of US cardiology clinics through September 2023, and just 1.5% in the Northeast [101]. Conclusion: NYC is a **pilot market, not a revenue market**, and independent cardiology alone is a wedge, not a venture-scale market. Growth has to come from larger groups, health systems, primary care (AWV) and genetics programs.

### 4.5 Competitors

| Product | Who it's for | Focus | Price / status (Oct 2026) | Relatives fill in their own branch | Per-fact status and source | Portal import |
| --- | --- | --- | --- | --- | --- | --- |
| My Family Health Portrait (built by NIH/NHGRI for the Surgeon General; now an NCI copy) | Patients | General | Free. Original host offline April 13, 2026; data stays on the user's device; no feature development since March 2025 [97] | No (download or print a file) | No | No |
| **FamGenix** | Clinicians, plus a patient app | Cancer **and cardio** (QRisk add-on) | Free (20 pedigrees); Individual $500/yr; Premium tiered [111]. Last iOS update February 2025 | Patient app shares with family | Not documented | Not documented |
| Progeny (used by the interviewed genetics counselor) | Genetic counselors | Hereditary disease, mostly cancer | 30-day trial (no longer free); pre-visit patient questionnaires that auto-fill pedigrees; EHR pedigree integration; direct Ambry test ordering [108] | No | No | No |
| Invitae Family History Tool (Labcorp) | Providers | Cancer and hereditary | Free; patient e-questionnaire; exports PDF/PNG/XML/CSV; "does not integrate with EMRs"; tied to test ordering [107] | No | No | No |
| Ambry CARE (Tempus) | Health systems | Breast and hereditary cancer | EHR-integrated; price not disclosed [109] | No | No | No |
| CancerIQ | Health systems | Cancer | 275+ clinics; claims 8.9x average ROI (self-reported); price not public [110] | No | No | No |
| MeTree (Duke) | Research | General | Research platform [84] | No | No | No |
| Phreesia | Practices | General intake | Free through December 31, 2026; standard pricing from 2027 [112][113] | No | No | No |
| IntakeQ | Small practices | Forms | $54.90/month [114] | No | No | No |

**Why this instead of them.** We found no product that combines four things: branches contributed by the relatives themselves; a status and source on every fact (known / unknown / declined / conflicting, who said it, when); a single condition shared from a relative's own patient portal; and a cardiology-specific one-page summary with guideline-cited alerts for the clinician. Most lab-funded tools are cancer-centric and tied to one lab's test ordering; this one is patient-owned and lab-neutral. Phrase it as "we found no...", not "there is no...". The competitor scan may be incomplete, and FamGenix in particular deserves a hands-on look.

---

## 5. Risks, riskiest assumptions, and the cheapest test for each

| # | Assumption | Why it's risky | Cheapest test | Pass mark |
| --- | --- | --- | --- | --- |
| 1 | **A practice manager will pay** for a tool that bills nothing | Labs give tools away; FamGenix $500/yr; Phreesia free in 2026 | 5 practice-manager interviews with a one-page price card and a request for a **paid** pilot letter ($500–1,000, credited to an annual contract) | ≥ 1 signed paid pilot |
| 2 | Patients complete the tree **before** the visit | IGNITE reached 7.8% of eligible patients [91]; paper questionnaires about 20% | Moderated usability sessions (fictional family, or the participant's own on a lab device wiped afterwards; check Cornell IRB first). Measure time, wrong-side errors and drop-off points | Median ≤ 15 min; no wrong-side errors; in the pilot, ≥ 40% of invited new patients complete |
| 3 | **Relatives respond** | 29% dropped out at "invite" in a similar app [93] | Fake door: participants send a no-health-data invite to a relative, linking to a page that only explains the study and collects nothing. Count opens within 72 hours | ≥ 25% of patients get at least one relative contribution in the pilot |
| 4 | **Clinicians trust and use** a patient-built summary | Genetics counselor is skeptical; PAs want something scannable | Show the synthetic one-pager to 5 clinicians (cardiologists, PAs, the counselor). Time the scan; ask what they would do | ≥ 4/5 usefulness rating; they act on ≥ 1 alert; scan < 1 minute |
| 5 | **Portal facts are useful** | Onset date = date listed; past medical history invisible to USCDI apps; grandparents may lack MyChart | Register a free Epic sandbox app; pull fhirderrick's conditions. In the pilot, count the share of relatives who connect and the share of facts with a usable date | ≥ 1 in 5 relatives connect; most shared facts need only an age confirmation |
| 6 | **The practice can take it in** | Independent practices run various EHRs; SMART Health Link acceptance untested | Ask each practice manager which EHR they use; test a PDF upload and a SMART Health Link at one practice | Lands in the chart in < 2 minutes of staff time |
| 7 | **Regulatory lines hold** | Patient-facing alerts = device; practice channel = business associate; NYHIPA pending | FTC Mobile Health Apps Interactive Tool [70]; a Cornell law clinic consult; recheck NYHIPA status before each pitch | No patient-facing recommendations; BAA template ready before the pilot |
| 8 | **Alert fatigue** | In a 2020 MeTree study, 76.4% of completers got at least one recommendation and 46% met hereditary or familial-level risk criteria [118] | Count alerts per summary across 20 synthetic and pilot families | ≤ 2 alerts on a typical summary; every alert specific |

**Pilot design (8–12 weeks, 1–3 independent NYC groups, $500–1,000 flat).** Set these metrics in advance:

1. Share of invited new patients who complete before the visit (target ≥ 40%).
2. Share with at least one relative contribution (≥ 25%).
3. Staff minutes per new patient on family history, baseline vs pilot, by time-and-motion observation (≥ 5–10 minutes saved).
4. Share of summaries opened before the visit, and clinician usefulness rating (≥ 4/5).
5. Share of patients with a specific guideline criterion matched, and share leading to an action (lipids/Lp(a), echo, genetics referral).
6. Accuracy on 20 audited charts, including maternal/paternal side errors.
7. Whether the practice signs an annual contract.

**Go/no-go:** continue if at least 1 of 3 practices converts to paid and completion is at least 40%. If completion is high but nobody pays, switch buyers: health-system cardiogenetics or lipid clinics, primary care (AWV), or a disclosed sponsor model.

---

## 6. What to build now vs later

| | **Prototype (now, $0)** | **Pilot (paid, 1–3 practices)** | **Product** |
| --- | --- | --- | --- |
| Hosting | Vercel Hobby, personal GitHub repo, synthetic data only | Vercel Pro + HIPAA BAA add-on | Same, or Enterprise |
| Data | Browser `localStorage`; links carry data after `#` | Neon Scale (HIPAA on), server records behind hashed, expiring, revocable tokens; append-only audit log | Plus field-level encryption for notes; longer backups |
| Accounts | None | Patients: magic link (Better Auth) via a BAA-covered email service; practice staff: MFA; relatives: no account | SSO for practices |
| Tree builder | Fixed 3-generation layout, guided cardiac questions, statuses derived from reports | Plus cause-of-death step, ancestry, adoption flags, completeness score | Multi-language; accessibility audit |
| Relatives | Invite and reply links (same-browser demo) | Server-side invites; per-relative consent and withdrawal; 18+ only | Proxy / caregiver flows |
| Portal fact | SMART Health IT sandbox (no registration) [18]; optional Epic sandbox backup [6] | Epic production app (USCDI-only, auto-distributed); second FamilyMemberHistory app for one partner system | Aggregator or TEFCA IAS through a partner; other EHR vendors |
| Summary | Print/PDF; read-only link and QR; FHIR export | Patient view without alerts vs clinician document; SMART Health Link; fax from BAA backend; "reviewed by clinician" lock | Direct messaging; EHR app or document write-back |
| Alerts | Rule-based, cited, labeled for clinician review | Only verified rules; versioned rules page; intended-use statement | FDA Q-Sub before any risk model |
| Compliance | Synthetic-data banner; no analytics; no condition names in URLs | BAA with each practice; risk analysis; vendor BAA register; breach runbook (30-day NY, 60-day FTC); Epic Data Use Questionnaire; privacy policy | Counsel-reviewed hybrid model; NYHIPA authorizations if signed |

The detailed build spec for the prototype is in [`mvp-spec.md`](./mvp-spec.md).

### Open questions to take to the next interviews

1. Which EHR does each target practice use (Epic through a hospital's Community Connect, athenahealth, eClinicalWorks, NextGen, ModMed)? This decides intake format and who approves apps.
2. Will a practice accept a SMART Health Link from an app that isn't IAL2-verified, and does its EHR file structured family history or only the PDF?
3. How many grandparents have MyChart, or proxy access held by an adult child?
4. When practices pay, is the whole app a business associate, or only the practice channel? (Needs counsel.)
5. Does a printed clinician page in the patient's hands change the FDA analysis? (Needs counsel.)
6. Is NYHIPA signed or vetoed? Does its authorization rule cover what a patient enters about a relative?
7. What do Fasten and Flexpa charge a startup? Does Box's Enterprise BAA cover API usage and service accounts?
8. Is a pre-revenue student project "commercial" under Vercel's Hobby rules? Ask Vercel Support in writing before any practice pilot.

---

## Sources

**Interoperability and EHR access**
1. 45 CFR 170.215, eCFR as of 2026-09-30: https://www.ecfr.gov/api/versioner/v1/full/2026-09-30/title-45.xml?part=170&section=170.215
2. 45 CFR 170.404, eCFR as of 2026-09-01: https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-45.xml?part=170&section=170.404
3. ONC enforcement discretion notices: https://healthit.gov/certification-health-it/enforcement-discretion-notices/
4. HTI-5 proposed rule, 90 FR 60970 (Dec 29, 2025): https://www.govinfo.gov/content/pkg/FR-2025-12-29/html/2025-23896.htm
5. Epic, patient-facing FHIR apps: https://fhir.epic.com/Documentation?docId=patientfacingfhirapps
6. Epic, sandbox test patients: https://fhir.epic.com/Documentation?docId=testpatients
7. Epic, FamilyMemberHistory.Search (R4): https://fhir.epic.com/Specifications/Api?id=10159
8. Epic, Condition.Search (Problems) R4: https://fhir.epic.com/Specifications/Api?id=953
9. Epic, Condition.Search (Medical History): https://fhir.epic.com/Specifications/Api?id=10314
10. Epic API catalog: https://fhir.epic.com/Specifications/Selections
11. Epic, Getting Started with open.epic: https://vendorservices.epic.com/Resources/OEC09
12. Epic Brands endpoint bundle: https://open.epic.com/Endpoints/Brands
13. Northwell Health SMART configuration: https://call.api.northwell.io/epic-proxy/api/fhir/R4/.well-known/smart-configuration
14. ONC Standards Bulletin 2025-2 (USCDI v6): https://healthit.gov/standards-and-technology/onc-standards-bulletin/onc-standards-bulletin-2025-2
15. ONC, 2026 SVAP approved standards: https://healthit.gov/blog/standards/advancements-in-health-it-oncs-2026-approved-svap-standards/
16. US Core 9 FamilyMemberHistory profile: https://hl7.org/fhir/us/core/STU9/StructureDefinition-us-core-familymemberhistory.html
17. FHIR R4 FamilyMemberHistory: https://hl7.org/fhir/R4/familymemberhistory.html
18. SMART launcher README: https://raw.githubusercontent.com/smart-on-fhir/smart-launcher-v2/main/README.md
19. SMART R4 sandbox, atrial fibrillation conditions: https://r4.smarthealthit.org/Condition?code=http://snomed.info/sct|49436004&_summary=count
20. Epic, TEFCA Individual Access Services: https://open.epic.com/Home/Interoperate/TEFCA/IAS
21. RCE, IAS Exchange Purpose SOP v3: https://rce.sequoiaproject.org/wp-content/uploads/2026/07/SOP-IAS-XP-v3_June2026_Clean_-5081.pdf
22. Flexpa pricing: https://www.flexpa.com/pricing
23. Flexpa Portal (test mode): https://flexpa.com/docs/portal
24. Fasten Connect quickstart: https://docs.connect.fastenhealth.com/quickstart
25. 1upHealth Patient Connect sunset: https://docs.1up.health/help-center/Content/en-US/connect-patient/patient-connect.html
26. Apple HKClinicalTypeIdentifier: https://developer.apple.com/documentation/healthkit/hkclinicaltypeidentifier
27. CMS Provider Kill the Clipboard Guide: https://www.cms.gov/initiatives/health-technology-ecosystem/overview/health-tech-ecosystem-categories/provider-kill-clipboard-guide
28. CMS Health Tech Ecosystem categories: https://www.cms.gov/initiatives/health-technology-ecosystem/overview/health-tech-ecosystem-categories
29. SMART Health Links specification: https://build.fhir.org/ig/HL7/smart-health-cards-and-links/links-specification.html
30. Sinch Fax API: https://sinch.com/products/apis/fax-api/
31. NPPES registry query, NYC cardiovascular disease: https://npiregistry.cms.hhs.gov/api/?version=2.1&taxonomy_description=Cardiovascular%20Disease&city=New%20York&state=NY&limit=200
32. Murabito et al., Ann Intern Med 2004 (Framingham Offspring), PMID 15023709: https://pubmed.ncbi.nlm.nih.gov/15023709/

**Privacy and compliance**
33. Hunton, HHS guidance on health apps: https://www.hunton.com/privacy-and-cybersecurity-law-blog/hhs-releases-guidance-on-health-apps-and-hipaa-security-rule-crosswalk
34. Mondaq, HHS API FAQs for app developers: https://webiis08.mondaq.com/unitedstates/healthcare/803488/new-hipaa-guidance-for-medical-app-developers
35. 45 CFR 160.103: https://www.law.cornell.edu/cfr/text/45/160.103
36. FTC, Complying with the Health Breach Notification Rule: https://www.ftc.gov/business-guidance/resources/complying-ftcs-health-breach-notification-rule-0
37. 16 CFR 318.2: https://www.law.cornell.edu/cfr/text/16/318.2
38. FTC civil penalty notice (FR Doc. 2026-18853): https://public-inspection.federalregister.gov/2026-18853.pdf
39. FTC, GoodRx enforcement action: https://www.ftc.gov/news-events/news/press-releases/2023/02/ftc-enforcement-action-bar-goodrx-sharing-consumers-sensitive-health-info-advertising
40. FTC withdraws obsolete policy statement (Sept 2026): https://www.ftc.gov/news-events/news/press-releases/2026/09/ftc-withdraws-obsolete-policy-statement
41. NY Senate Bill S9269: https://www.nysenate.gov/legislation/bills/2025/S9269
42. S9269 bill text: https://legislation.nysenate.gov/pdf/bills/2025/S9269
43. NY General Business Law 899-AA: https://www.nysenate.gov/legislation/laws/GBS/899-AA
44. Washington RCW 19.373.030: https://app.leg.wa.gov/RCW/default.aspx?cite=19.373.030
45. WilmerHale, first MHMDA lawsuit: https://www.wilmerhale.com/en/insights/blogs/wilmerhale-privacy-and-cybersecurity-law/20250220-first-lawsuit-filed-under-washingtons-my-health-my-data-act
46. California Civil Code 56.06: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=56.06
47. California Civil Code 56.36: https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=56.36
48. Nevada NRS 603A: https://www.leg.state.nv.us/nrs/nrs-603a.html
49. Hunton, Connecticut amends the CTDPA: https://www.hunton.com/privacy-and-cybersecurity-law-blog/connecticut-amends-the-connecticut-data-privacy-act
50. 29 CFR 1635.3: https://www.law.cornell.edu/cfr/text/29/1635.3
51. NHGRI, Genetic Discrimination: https://www.genome.gov/about-genomics/policy-issues/Genetic-Discrimination
52. Inside Privacy, Illinois GIPA litigation: https://www.insideprivacy.com/data-privacy/employers-beware-new-wave-of-illinois-genetic-information-privacy-act-litigation/
53. NY AG, NewYork-Presbyterian settlement: https://ag.ny.gov/press-release/2023/attorney-general-james-secures-300000-newyork-presbyterian-hospital-failing
54. NY AG, Child Data Protection Act guidance: https://ag.ny.gov/child-data-protection-act-guidance
55. Box HIPAA and HITECH FAQ: https://support.box.com/hc/en-us/articles/360044194833-Box-HIPAA-and-HITECH-Overview-and-FAQ
56. Box pricing: https://www.box.com/pricing
57. Box API rate limits: https://developer.box.com/guides/api-calls/permissions-and-errors/rate-limits/
58. Vercel Hobby plan: https://vercel.com/docs/plans/hobby
59. Vercel fair use guidelines: https://vercel.com/docs/limits/fair-use-guidelines
60. Vercel terms of service: https://vercel.com/legal/terms
61. Vercel pricing: https://vercel.com/pricing
62. Vercel HIPAA compliance guide: https://vercel.com/kb/guide/hipaa-compliance-guide-vercel
63. Neon HIPAA: https://neon.com/docs/security/hipaa
64. Neon pricing: https://neon.com/pricing
65. Supabase pricing: https://supabase.com/pricing
66. Clerk pricing: https://clerk.com/pricing
67. Resend security: https://resend.com/security/gdpr
68. AWS HIPAA-eligible services: https://aws.amazon.com/compliance/hipaa-eligible-services-reference/
69. Twilio HIPAA editions: https://www.twilio.com/docs/iam/twilio-editions/hippa
70. FTC Mobile Health Apps Interactive Tool: https://www.ftc.gov/business-guidance/resources/mobile-health-apps-interactive-tool
71. Paubox, HIPAA Security Rule update pushed to 2027: https://www.paubox.com/blog/hhs-pushes-final-hipaa-security-rule-update-to-2027

**Clinical**
72. ACC, 2024 HCM guideline ten points: https://www.acc.org/Latest-in-Cardiology/ten-points-to-remember/2024/05/06/15/12/2024-hypertrophic-cardiomyopathy-gl
73. Review of HCM sudden-death risk criteria (Eur Heart J QCCO): https://europepmc.org/article/PMC/PMC12587277
74. ACC, 2026 dyslipidemia guideline overview: https://www.acc.org/latest-in-cardiology/articles/2026/07/01/01/prioritizing-health
75. ACC, "No Child Left Behind" (2026 pediatric lipid recommendations): https://www.acc.org/Latest-in-Cardiology/Articles/2026/05/19/15/49/No-Child-Left-Behind
76. ACC, "Power of the Pedigree" (2018 premature ASCVD definition): https://www.acc.org/latest-in-cardiology/articles/2021/01/05/13/15/power-of-the-pedigree
77. Family Heart Foundation, FH diagnostic criteria: https://familyheart.org/diagnosing-familial-hypercholesterolemia/clinical-diagnostic-criteria-for-healthcare-providers
78. APHRS/HRS expert consensus on sudden unexplained death: https://europepmc.org/article/PMC/PMC8207384
79. 2023 ACC/AHA/ACCP/HRS AF guideline: https://pmc.ncbi.nlm.nih.gov/articles/PMC11095842/
80. ESC 2025 consensus on DCM family members: https://europepmc.org/article/PMC/PMC12614981
81. ACC/AHA 2022 aortic disease guideline: https://www.acc.org/About-ACC/Press-Releases/2022/11/02/18/18/ACC-AHA-Issue-Aortic-Disease-Guideline
82. 2026 J-wave syndromes expert consensus (J Arrhythm): https://europepmc.org/article/PMC/PMC12928126
83. AAFP, three-generation pedigree: https://www.aafp.org/pubs/afp/issues/2005/0801/p441.html
84. MeTree pedigree quality, BMC Fam Pract 2014: https://europepmc.org/article/PMC/PMC3937044
85. NSGC 2022 pedigree nomenclature (Bennett et al.): https://pubmed.ncbi.nlm.nih.gov/36106433/
86. Wilson et al., Ann Intern Med 2009: https://europepmc.org/article/MED/19884616
87. SCAPIS, Eur J Epidemiol 2026 (PMID 42142221): https://pubmed.ncbi.nlm.nih.gov/42142221/
88. Facio et al., Genet Med 2010 (My Family Health Portrait validation): https://pmc.ncbi.nlm.nih.gov/articles/PMC3258571/
89. Dhiman et al., PLoS One 2014: https://europepmc.org/article/PMC/PMC3886986
90. MeTree implementation, BMC Fam Pract 2013: https://europepmc.org/article/PMC/PMC3765729
91. IGNITE rollout, Genet Med 2019: https://europepmc.org/article/PMC/PMC6281814
92. Nazareth et al., Obstet Gynecol 2021: https://europepmc.org/article/PMC/PMC8594498
93. ItRunsInMyFamily, Health Informatics J 2024: https://europepmc.org/article/PMC/PMC11391477
94. Family Healthware Impact Trial: https://europepmc.org/article/PMC/PMC3022039
95. FDA, Clinical Decision Support Software guidance (Jan 2026): https://www.fda.gov/media/109618/download
96. FDA, Policy for Device Software Functions and Mobile Medical Applications: https://www.fda.gov/media/80958/download
97. My Family Health Portrait (NCI copy) and commit history: https://cbiit.github.io/FHH/html/index.html ; https://github.com/CBIIT/FHH/commits/master

**Business**
98. AMA, 2024 physician practice characteristics: https://www.ama-assn.org/system/files/2024-prp-pp-characteristics.pdf
99. CMS Doctors and Clinicians national file (modified 2026-08-18; team analysis via the API): https://data.cms.gov/provider-data/dataset/mj5m-pzi6
100. AJMC, private cardiology practice (March 2026): https://www.ajmc.com/view/navigating-the-evolving-landscape-of-private-cardiology-practice
101. HealthDay on JACC, private-equity cardiology acquisitions: https://www.healthday.com/healthpro-news/cardiovascular-diseases/342-cardiology-clinics-acquired-by-private-equity-firms-in-2013-to-2023
102. CVAUSA: https://www.cvausa.com/
103. CMS, 2026 RVU file (October release): https://www.cms.gov/files/zip/rvu26d.zip
104. 42 CFR 410.15 (Annual Wellness Visit): https://www.ecfr.gov/api/versioner/v1/full/2026-09-01/title-42.xml?part=410&section=410.15
105. MGMA, 2021 E/M changes: https://www.mgma.com/articles/preparing-your-practice-for-2021-e-m-changes
106. CMS Innovation Center, ACCESS Model: https://www.cms.gov/priorities/innovation/innovation-models/access
107. Invitae Family History Tool: https://www.invitae.com/familyhistory/
108. Progeny Cloud trial: https://progenygenetics.com/clinical/trial/
109. Ambry CARE 2026 award: https://www.ambrygen.com/company/press-release/161/ambry-genetics-care-program-wins-2026-medtech-breakthrough-award
110. CancerIQ: https://www.canceriq.com/
111. FamGenix licensing: https://famgenix.com/licensing/
112. Phreesia free Intake offer: https://www.phreesia.com/?p=262
113. Phreesia FY2026 results: https://www.sec.gov/Archives/edgar/data/1412408/000141240826000074/phr-ex991q4fy26.htm
114. IntakeQ pricing: https://intakeq.com/pricing
115. HIPAA Journal, 23andMe multistate settlement: https://www.hipaajournal.com/23andme-settlement-multistate-data-breach-lawsuit/
116. UK ICO, 23andMe fine: https://ico.org.uk/about-the-ico/media-centre/news-and-blogs/2025/06/23andme-fined-for-failing-to-protect-uk-users-genetic-data/
117. Acheson et al., family history in primary care (CCJM): https://www.ccjm.org/content/ccjom/79/5/331.full.pdf
118. MeTree in the IGNITE network, BMC Health Serv Res 2020: https://pmc.ncbi.nlm.nih.gov/articles/PMC7648301/
119. S.3607 bill status (Access to Genetic Counselor Services Act): https://www.govinfo.gov/bulkdata/BILLSTATUS/119/s/BILLSTATUS-119s3607.xml
120. FTC, COPPA final rule amendments: https://www.ftc.gov/legal-library/browse/federal-register-notices/16-cfr-part-312-coppa-final-rule-amendments
121. Razavi and Blumenthal, AJPC 2026 (summary of 2026 dyslipidemia risk enhancers): https://europepmc.org/article/PMC/PMC13326120
