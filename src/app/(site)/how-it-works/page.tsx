import type { Metadata } from "next";
import Link from "next/link";
import styles from "./how.module.css";

export const metadata: Metadata = { title: "How it works" };

// Summary of docs/research.md (five research tracks, each fact-checked against primary sources,
// as of October 2026). The full write-up with numbered sources is at /research.

const bottomLine = [
  {
    k: "The problem is measurable",
    v: "Self-reports caught only 57.6% of heart attacks in parents and siblings (25,302 Swedes, 2026). Only 28% of offspring reports that Dad had a heart attack before 55 were confirmed by records (Framingham). Only about 11% of charted entries name both the relative and the age.",
  },
  {
    k: "Guided trees fix the structure",
    v: "With MeTree, a guided side-of-family tool, 99.8% of pedigrees met quality criteria, against under 4% of chart records. Lineage was recorded for 100% of relatives, against 28.4%.",
  },
  {
    k: "HIPAA starts when practices pay",
    v: "A patient-chosen app isn't covered by HIPAA; the FTC Health Breach Notification Rule and state laws are. Once a practice pays and summaries feed its chart, the team is a business associate and needs BAAs with every practice and vendor.",
  },
  {
    k: "Box is the wrong home for the tree",
    v: "Box signs a BAA only on Enterprise plans and stores files, not relational data. Keep the tree in a BAA-covered Postgres database; use Box at most to drop the summary PDF into a practice's own Box.",
  },
  {
    k: "MyChart works for one fact, not the whole history",
    v: "A free, read-only Epic app can reach a relative's own problem list. Epic's family-history API isn't part of USCDI, so each health system must approve it by hand. A portal date can be when a problem was listed, not diagnosed.",
  },
  {
    k: "Alerts go to the clinician, never the patient",
    v: "Under FDA's January 2026 decision-support guidance, recommendations shown to patients make software a device. Clinician alerts stay outside device rules when they're rule-based, cite the guideline and show every source and gap.",
  },
];

const dataStages = [
  ["Tree", "In the browser only", "Postgres (Neon Scale, HIPAA on) behind Vercel Pro + BAA add-on", "Plus field-level encryption for notes"],
  ["Invites and replies", "Data after the # in the link", "Server records behind hashed, expiring, revocable tokens", "Same"],
  [
    "Portal fact",
    "Public SMART sandbox, synthetic patients",
    "Epic production app, read-only USCDI scopes, auto-distributed",
    "Plus aggregator or TEFCA partner",
  ],
  ["Summary to practice", "Print/PDF, read-only link, FHIR file", "PDF, SMART Health Link, fax from a BAA-covered backend", "Plus Direct messaging, EHR app"],
  ["Who could be harmed", "Nobody (synthetic data)", "Real families: BAAs, audit log, MFA, breach plan", "Same, at scale"],
];

const criteria = [
  ["Early heart disease (heart attack, stent, bypass, angina)", "Parent or sibling", "Men < 55, women < 65", "ACC/AHA 2018; 2026 dyslipidemia"],
  ["Very high cholesterol / familial hypercholesterolemia", "First- or second-degree", "Any age", "Dutch Lipid Clinic, Simon Broome; ACC/AHA 2026"],
  ["Cardiomyopathy (HCM, DCM)", "Parent or sibling, or 2+ relatives", "Any age", "AHA/ACC 2024; ESC 2025"],
  ["Aortic aneurysm or dissection", "Parent or sibling", "Any age", "ACC/AHA 2022"],
  ["Named inherited arrhythmia (long QT, Brugada, CPVT)", "First- or second-degree", "Any age", "Diagnostic criteria (score not computed)"],
  ["Sudden unexplained death or cardiac arrest", "Any relative", "Before 40", "APHRS/HRS 2020"],
  ["Atrial fibrillation in a relative", "—", "—", "No verified criterion: shown as “also noted”"],
];

const market = [
  ["US independent cardiology", "7,699 cardiologists × $1,188–1,788/yr", "$9.1M – $13.8M"],
  ["At FamGenix's $500/yr anchor", "7,699 × $500", "$3.8M"],
  ["NYC independent", "280–320 × $1,800", "$0.50M – $0.58M"],
];

const risks = [
  [
    "A practice manager will pay for a tool that bills nothing",
    "5 manager interviews with a price card; ask for a paid pilot letter ($500–1,000)",
    "≥ 1 signed paid pilot",
  ],
  [
    "Patients finish the tree before the visit",
    "Moderated usability sessions with a fictional family",
    "Median ≤ 15 min, no wrong-side errors; pilot ≥ 40% completion",
  ],
  ["Relatives respond", "Fake-door invite that collects nothing; count opens in 72 hours", "≥ 25% get one relative contribution"],
  ["Clinicians trust a patient-built summary", "Show the synthetic one-pager to 5 clinicians; time the scan", "≥ 4/5 usefulness; scan < 1 minute"],
  ["Regulatory lines hold", "FTC Mobile Health Apps tool; law clinic consult; recheck NY bill", "No patient-facing recommendations; BAA template ready"],
];

export default function HowItWorks() {
  return (
    <main id="main" className={styles.main}>
      {/* Spacer for the fixed SiteNav until P4 rebuilds this page. */}
      <div aria-hidden className="h-16" />
        <header className={styles.hero}>
          <p className="kicker">How it would really work</p>
          <h1>From a free prototype to something a practice would pay for</h1>
          <p className={styles.lead}>
            Five research tracks (MyChart access, privacy law, clinical guidelines, the business, and free hosting), each checked against primary sources by an
            independent reviewer as of October 2026. <Link href="/research">Read the full write-up with 120+ numbered sources →</Link>
          </p>
        </header>

        <section className={styles.section}>
          <h2>Bottom line</h2>
          <div className={styles.cards}>
            {bottomLine.map((b) => (
              <div key={b.k} className={styles.card}>
                <h3>{b.k}</h3>
                <p>{b.v}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Who does what</h2>
          <div className={styles.cols}>
            <div>
              <p className={styles.role}>Patient · free</p>
              <ol>
                <li>Gets the link with the practice&rsquo;s new-patient paperwork.</li>
                <li>Builds the tree by side of family, with guided heart questions.</li>
                <li>Invites relatives once there&rsquo;s something useful to show.</li>
                <li>Reviews, then prints or shares the summary.</li>
              </ol>
            </div>
            <div>
              <p className={styles.role}>Relative · free, no account</p>
              <ol>
                <li>Opens a single-purpose link and sees who asked and why.</li>
                <li>Answers for themself, or declines. Only they can decline.</li>
                <li>Optionally logs into their own MyChart and ticks one fact.</li>
                <li>Adds what they know about their own parents and siblings.</li>
              </ol>
            </div>
            <div>
              <p className={styles.role}>Practice · pays</p>
              <ol>
                <li>Gets one page: guideline criteria matched, then gaps and conflicts.</li>
                <li>Sees every fact with who said it and when.</li>
                <li>Decides what matters. A &ldquo;reviewed by clinician&rdquo; state locks the version in the chart.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Where the data lives</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Prototype (now, $0)</th>
                  <th scope="col">Paid pilot (1–3 practices)</th>
                  <th scope="col">Product</th>
                </tr>
              </thead>
              <tbody>
                {dataStages.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row">{r[0]}</th>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            A lean BAA-covered stack (Vercel Pro with the HIPAA add-on, Neon Scale, Amazon SES) costs roughly $400–550 a month before any revenue.
            Vercel&rsquo;s free Hobby plan is non-commercial and signs no BAA, which is why this prototype holds made-up data only.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Privacy and compliance</h2>
          <div className={styles.split}>
            <div>
              <h3>When HIPAA applies</h3>
              <ul className={styles.list}>
                <li>
                  <b>Patient uses the app on their own:</b> not HIPAA. FTC Health Breach Notification Rule, FTC Act, and state laws (WA, CA, CT, NV; NY passed
                  both houses, not yet signed).
                </li>
                <li>
                  <b>Relative shares a portal fact:</b> their own right of access; once released to the app it leaves HIPAA.
                </li>
                <li>
                  <b>Practice pays and summaries feed its chart:</b> the team is a business associate. BAAs with every practice and vendor, a risk analysis, MFA
                  and encryption.
                </li>
                <li>
                  <b>Family history is genetic information</b> (GINA). It protects against health insurers and employers, not life, disability or long-term-care
                  insurers. No insurer or employer channels, no data sales, ever.
                </li>
              </ul>
            </div>
            <div>
              <h3>Say this, not that</h3>
              <ul className={styles.say}>
                <li className={styles.yes}>&ldquo;Built to operate as a HIPAA business associate, using only vendors that sign BAAs.&rdquo;</li>
                <li className={styles.yes}>&ldquo;From &lt;health system&gt;&rsquo;s record, retrieved &lt;date&gt;.&rdquo;</li>
                <li className={styles.yes}>&ldquo;Does not diagnose. A clinician decides what matters.&rdquo;</li>
                <li className={styles.no}>&ldquo;HIPAA certified&rdquo; or a HIPAA badge (no such certification exists; see the FTC&rsquo;s GoodRx case).</li>
                <li className={styles.no}>&ldquo;HIPAA-compliant cloud (Box)&rdquo; or &ldquo;verified diagnosis&rdquo;.</li>
                <li className={styles.no}>&ldquo;GINA protects you from insurers&rdquo; without the life, disability and LTC caveat.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>What the cardiologist sees</h2>
          <p className={styles.note}>
            Family-history criteria named in current guidelines. The app matches what was reported against these and lists them for the clinician to interpret.
            It never computes a risk score and never shows these to the patient as a recommendation.
          </p>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Pattern in a relative</th>
                  <th scope="col">Who counts</th>
                  <th scope="col">Cutoff</th>
                  <th scope="col">Basis</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row">{r[0]}</th>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <h2>The business</h2>
          <div className={styles.split}>
            <div>
              <h3>Who pays, and for what</h3>
              <ul className={styles.list}>
                <li>
                  <b>Free for patients and relatives</b>, with no ads and no data sales written into the terms.
                </li>
                <li>
                  <b>Independent cardiology practices pay</b> a flat fee per cardiologist ($99–149/month to start). Never priced per referral or new patient
                  (anti-kickback risk).
                </li>
                <li>
                  <b>No billing code pays for family history</b> (96160 risk assessment: $3.01; genetic counseling is bundled). The value is staff time saved
                  and relatives identified for screening.
                </li>
                <li>
                  <b>Competition:</b> we found no patient-facing cardiology family-tree product combining relative-filled branches, per-fact sources, a portal
                  fact and a cardiology one-pager. Lab-funded tools are mostly cancer-focused; FamGenix ($500/yr, with a cardio add-on) deserves a hands-on
                  look.
                </li>
              </ul>
            </div>
            <div>
              <h3>Market size, with the math</h3>
              <div className={styles.tableWrap}>
                <table>
                  <tbody>
                    {market.map((r) => (
                      <tr key={r[0]}>
                        <th scope="row">{r[0]}</th>
                        <td>{r[1]}</td>
                        <td>
                          <b>{r[2]}</b>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.note}>
                NYC is a pilot market, not a revenue market; 76–79% of NYC cardiologists sit inside large health systems that already run Epic. Growth would
                come from larger groups, health systems, primary care (the Medicare wellness visit requires family history) and genetics programs.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Riskiest assumptions, and the cheapest test for each</h2>
          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Assumption</th>
                  <th scope="col">Cheapest test</th>
                  <th scope="col">Pass mark</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((r) => (
                  <tr key={r[0]}>
                    <th scope="row">{r[0]}</th>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            <b>Pilot:</b> 8–12 weeks with 1–3 independent NYC groups, $500–1,000 flat, credited to an annual contract. Continue if at least 1 of 3 practices
            converts to paid and at least 40% of invited patients complete the tree before the visit.
          </p>
        </section>

        <footer className={styles.end}>
          <Link className="btn btn-primary" href="/research">
            Full research write-up and sources
          </Link>
          <Link className="btn btn-secondary" href="/tree">
            Try the demo
          </Link>
        </footer>
    </main>
  );
}
