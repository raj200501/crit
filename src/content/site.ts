// src/content/site.ts — shared copy and data. Owned by P1. Change it only through DESIGN.md.
export const SITE = {
  name: "Family Health Tree",
  demoHref: "/tree",
  // The founders set NEXT_PUBLIC_PILOT_EMAIL in Vercel. If it's empty, pilot CTAs link to /pilot#contact.
  pilotEmail: process.env.NEXT_PUBLIC_PILOT_EMAIL ?? "",
} as const;

export function pilotHref(): string {
  if (!SITE.pilotEmail) return "/pilot#contact";
  const subject = encodeURIComponent("Family Health Tree pilot");
  const body = encodeURIComponent("Practice name:\nEHR you use:\nNumber of cardiologists:\nBest time to talk:\n");
  return `mailto:${SITE.pilotEmail}?subject=${subject}&body=${body}`; // a plain link, not a form, so CSP form-action doesn't apply
}

/**
 * The primary B2B call to action. With a contact address it asks for the conversation (mailto). Without one
 * (NEXT_PUBLIC_PILOT_EMAIL unset at build time) a "Request" button would lead nowhere, so it says what it really is:
 * the pilot brief. `contact` is false then, and pages already on /pilot hide it.
 */
export function pilotCta(): { href: string; label: string; contact: boolean } {
  return SITE.pilotEmail
    ? { href: pilotHref(), label: "Request a pilot conversation", contact: true }
    : { href: "/pilot", label: "See the pilot brief", contact: false };
}

export const HONESTY = {
  navChip: "Synthetic demo",
  navChipShort: "Demo",
  navChipLabel: "Synthetic demo: made-up family, no real health data",
  heroPill: "Student prototype · synthetic demo family · no real health data",
  heroPillShort: "Student prototype · made-up demo family", // < 640 px, so the pill stays one line
  windowBadge: "Synthetic demo family",
  ribbon: "Prototype with a made-up demo family. Please don't enter real health information.",
  docChip: "Synthetic demo data",
  footer: "Not a medical device. Doesn't diagnose or score risk. Synthetic demo data only; please don't enter real health information.",
  team: "Team 709 (Raj Kashikar, Viha Srinivas, Unser Jaffry) · Product Studio · New York City",
} as const;

// research.md l.13, l.200, l.239–243, l.344
export const STATS = [
  { id: "self-report", value: 57.6, decimals: 1, suffix: "%", bar: true,
    label: "of heart attacks in parents and siblings were caught by self-report.", source: "SWEDEN · 25,302 PEOPLE", cite: 87 },
  { id: "dad-before-55", value: 28, decimals: 0, suffix: "%", bar: true,
    label: "of offspring reports that Dad had a heart attack before 55 were confirmed by medical records.", source: "FRAMINGHAM", cite: 32 },
  { id: "relative-and-age", value: 11, decimals: 0, prefix: "~", suffix: "%", bar: true,
    label: "of positive heart family-history entries in UK primary-care records named both the relative and the age at onset.", source: "UK · 1.5M PATIENTS", cite: 89 },
  { id: "minutes", value: 2.5, decimals: 1, prefix: "<", suffix: " min", bar: false,
    label: "is what primary-care physicians spend on family history, and they discuss it in only 51% of new visits.", source: "PRIMARY CARE", cite: 117 },
] as const;
// Never: "patients are right only 28% of the time" (research §2.7). Never user counts or growth metrics.

// research.md l.13, l.219, l.243
export const PROOF_POINTS = [
  { text: "The 2024 AHA/ACC hypertrophic cardiomyopathy guideline names a three-generation family history as the standard for everyone evaluated for HCM.", cite: 72 },
  { text: "A three-generation pedigree takes 15–30 minutes by hand.", cite: 83 },
  { text: "With a guided tool, 99.8% of pedigrees met quality criteria, against under 4% of charts.", cite: 84 },
] as const;

// research.md l.19, l.343–344, l.389–399
export const PILOT = {
  stamp: "Proposed pilot",
  headline: "Now recruiting 1–3 independent NYC cardiology practices",
  terms: ["8–12 weeks", "$500–1,000 flat, credited toward an annual contract"],
  never: "Never priced per referral, new patient or booking.",
  free: "Free for patients and relatives. No ads. No data sales.",
  after: "After the pilot: a flat annual subscription per cardiologist. Our working hypothesis is $99–149 per cardiologist per month, and the pilot is how we test it.",
  metrics: [
    "Share of invited new patients who complete before the visit (target ≥ 40%)",
    "Share with at least one relative's contribution (target ≥ 25%)",
    "Staff minutes per new patient on family history, before vs during the pilot (target: 5–10 minutes saved)",
    "Share of summaries opened before the visit, and clinician usefulness (target ≥ 4 out of 5)",
    "Share of patients with a guideline criterion matched, and share leading to an action",
    "Accuracy on 20 audited charts, including mother's-side and father's-side errors",
    "Whether the practice signs an annual contract",
  ],
  goNoGo: "We continue only if at least 1 of 3 practices converts to paid and at least 40% of invited patients complete before the visit.",
  beforeRealData: "Real patient data requires BAA-covered hosting, a BAA with your practice and an audit log first. The demo you see uses synthetic data.",
  roiAssumptions: { minutesSaved: 10, staffCostPerHour: 30 }, // labeled "assumption" wherever shown (research l.344)
  roiCaveat: "Saved minutes become money only if they free up capacity.",
} as const;

export const FLOW = {
  viewBox: "0 0 160 90",
  nodes: [
    { id: "relative", label: "Relative", sub: "text link", icon: "Smartphone", x: 16, y: 22 },
    { id: "portal", label: "Their portal", sub: "one fact · sandbox", icon: "Link2", x: 16, y: 68 },
    { id: "tree", label: "Your tree", sub: "this browser", icon: "Network", x: 56, y: 45 },
    { id: "summary", label: "One-page summary", sub: "you review", icon: "FileText", x: 110, y: 45 },
    { id: "practice", label: "Practice", sub: "read-only link or QR", icon: "QrCode", x: 146, y: 22 },
    { id: "chart", label: "Chart", sub: "FHIR FamilyMemberHistory", icon: "Download", x: 146, y: 68 },
  ],
  edges: [
    { from: "relative", to: "tree", label: "told by Mom" },
    { from: "portal", to: "tree", label: "1 fact · sandbox" },
    { from: "tree", to: "summary", label: "you review" },
    { from: "summary", to: "practice", label: "read-only" },
    { from: "summary", to: "chart", label: "FHIR" },
  ],
  caption:
    "Relatives answer from a text link and can share one fact from their own patient portal (demo sandbox). Both feed your tree, which stays in this browser. You review a one-page summary. The practice gets a read-only link or QR code, and a FHIR FamilyMemberHistory file for the chart.",
} as const;

export const MECHANISMS = [
  { icon: "ShieldCheck", title: "Nothing stored on a server.", body: "Your tree lives in this browser. The prototype has no account and no database." },
  { icon: "Link2", title: "Links carry their own data.", body: "Everything after the # in an invite or summary link stays in the browser and is never sent to a server. Pages send no referrer." },
  { icon: "Lock", title: "A strict content security policy.", body: "Scripts load only from this site. The browser may connect only to this site and two public FHIR sandboxes (SMART Health IT, plus Epic’s as a backup)." },
  { icon: "EyeOff", title: "No analytics, ads or data sales.", body: "No third-party scripts, no tracking, nothing to sell." },
] as const;

export const PROTOTYPE_VS_PILOT = {
  today: ["Made-up demo family only", "Data stays in this browser", "Links carry their own data after the #", "No accounts, no database"],
  pilot: [
    "BAA-covered hosting",
    "A BAA with every practice and every vendor that touches the data",
    "Audit log, MFA and encryption from day one",
    "Consent records for every relative who answers",
    "A breach-response plan",
  ],
  refusal: "There's no such thing as “HIPAA certified”, so we'll never say it.",
} as const;

/** "Questions you could ask" on the patient's summary (and the Clearing's page). Generic: never a recommendation. */
export const PATIENT_QUESTIONS = [
  "Does my family history change which tests I should have?",
  "Should anyone else in my family be checked?",
  "Would it help to see a genetic counselor?",
  "Is there anything I should ask my relatives before my next visit?",
] as const;

export const NEVER = [
  "Sell or rent your data, or share it with insurers, employers, advertisers or brokers.",
  "Show patients risk scores or alerts.",
  "Call this “HIPAA certified”. No such certification exists.",
  "Call a portal fact “verified”. It's labeled “from a portal record”.",
  "Price per referral, new patient or booking.",
] as const;

export const FDA_LINE = {
  text: "Why two versions? Under the FDA's 2026 guidance, recommendations shown to patients count as a medical device. So guideline criteria appear only on the care-team page, for a clinician to judge.",
  cite: 95,
} as const;

// research.md l.7, l.62. The PA line on today's site is NOT verbatim in research.md, so it's excluded until it's verified in Team Hub.
export const INTERVIEWS = {
  base: "21 interviews · 15 patients · 2 PAs · an ER doctor · a genetics counselor · an internist · an RN",
  quote: { text: "There has to be a human in the loop to make the judgment about what matters.", who: "Genetics counselor, interviewed by Team 709" },
  learnedTitle: "What we learned (paraphrased from interview notes)",
  learned: [
    { text: "Knowing “heart disease” was in the family was much less useful than knowing exactly what happened and when.", who: "Patient with palpitations" },
    { text: "Family history from Epic, a chatbot and paper forms is typed into a pedigree tool by hand, one relative at a time.", who: "Genetics counselor" },
    { text: "In the ER, a flagged, scannable summary is more realistic than a full chart review.", who: "Emergency medicine doctor" },
  ],
} as const;

// Words from src/lib/clinical.ts HEART_CHOICES examples (display only)
export const CHIP_EXAMPLES = [
  "Heart attack", "Stent", "Bypass surgery", "Angina", "AFib", "Pacemaker", "Cardiac arrest", "ICD",
  "Sudden death", "Cardiomyopathy", "Long QT", "Brugada", "Unexplained fainting", "Very high cholesterol",
  "Aortic aneurysm", "Stroke or TIA", "Not sure", "I'd rather not share",
] as const;

export const FAQ = [
  { q: "Is this a medical device?", a: "No. It organizes what your family reports, with sources. It doesn't diagnose or score risk. Guideline criteria appear only on the care-team page, for a clinician to judge." },
  { q: "Where is my data stored?", a: "In this prototype, only in your browser. Invite, reply and summary links carry their data after the #, which browsers never send to a server. There's no account and no database." },
  { q: "Is it HIPAA compliant?", a: "There's no such thing as HIPAA certification, and the prototype holds only made-up data. In a pilot, we will operate as a HIPAA business associate: we'll sign BAAs with practices and use only vendors that sign BAAs with us." },
  { q: "Does the patient-portal connection really work?", a: "Yes, as a demo. It's a real SMART on FHIR sign-in against a public sandbox with made-up patients. The relative picks one fact to share, and everything else is discarded on the page. Shared facts are labeled “from a portal record”, never “verified”." },
  { q: "What if a relative says no?", a: "Then that's the answer. “Chose not to share” shows on the tree and the summary, and only that person can decline for themselves." },
  { q: "Who pays?", a: "Cardiology practices, at a flat fee that's never tied to referrals or new patients. Patients and relatives never pay. No ads, no data sales." },
  { q: "Why not just a form?", a: "Forms flatten “I think it was 58?” into a checkbox. We keep who said it, how they know and what nobody knows yet, and relatives answer for themselves." },
] as const;
