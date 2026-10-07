import { readFileSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { ArrowRight, Building, Check, Link2, Smartphone, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import SummaryDocument from "@/components/SummaryDocument";
import { DEMO, report } from "@/components/content/demoFamily";
import { Finding } from "@/components/content/Finding";
import { PageHero } from "@/components/content/PageHero";
import { ProductSteps } from "@/components/content/ProductSteps";
import { renderResearch } from "@/components/content/researchHtml";
import { ResponsiveTable } from "@/components/content/ResponsiveTable";
import { SubNav } from "@/components/content/SubNav";
import { Button } from "@/components/ui/Button";
import { Cite } from "@/components/ui/Cite";
import { cn } from "@/components/ui/cn";
import { Container } from "@/components/ui/Container";
import { FlowDiagram } from "@/components/ui/FlowDiagram";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SourceChip } from "@/components/ui/SourceChip";
import { FLOW, SITE } from "@/content/site";

export const metadata: Metadata = {
  title: "How it works",
  description: "The product in four steps, then the research behind each choice: patient portals, privacy, clinical criteria and the business.",
};

// Every string below is fact-checked against docs/research.md (five research tracks, October 2026). The arrays and the
// prose are verbatim from the pre-revamp page; tests/fixtures/how-it-works-facts.json + site.spec.ts keep it that way.

const bottomLine = [
  {
    k: "The problem is measurable",
    v: "Self-reports caught only 57.6% of heart attacks in parents and siblings (25,302 Swedes, 2026). Only 28% of offspring reports that Dad had a heart attack before 55 were confirmed by records (Framingham). Only about 11% of charted entries name both the relative and the age.",
    cite: [87, 32, 89],
  },
  {
    k: "Guided trees fix the structure",
    v: "With MeTree, a guided side-of-family tool, 99.8% of pedigrees met quality criteria, against under 4% of chart records. Lineage was recorded for 100% of relatives, against 28.4%.",
    cite: [84],
  },
  {
    k: "HIPAA starts when practices pay",
    v: "A patient-chosen app isn't covered by HIPAA; the FTC Health Breach Notification Rule and state laws are. Once a practice pays and summaries feed its chart, the team is a business associate and needs BAAs with every practice and vendor.",
    cite: [33, 36, 35],
  },
  {
    k: "Box is the wrong home for the tree",
    v: "Box signs a BAA only on Enterprise plans and stores files, not relational data. Keep the tree in a BAA-covered Postgres database; use Box at most to drop the summary PDF into a practice's own Box.",
    cite: [55, 56, 57],
  },
  {
    k: "MyChart works for one fact, not the whole history",
    v: "A free, read-only Epic app can reach a relative's own problem list. Epic's family-history API isn't part of USCDI, so each health system must approve it by hand. A portal date can be when a problem was listed, not diagnosed.",
    cite: [5, 7, 10, 8],
  },
  {
    k: "Alerts go to the clinician, never the patient",
    v: "Under FDA's January 2026 decision-support guidance, recommendations shown to patients make software a device. Clinician alerts stay outside device rules when they're rule-based, cite the guideline and show every source and gap.",
    cite: [95],
  },
] as const;
const finding = (k: string) => bottomLine.find((b) => b.k === k)!;

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

const roles = [
  {
    label: "Patient · free",
    icon: UserRound,
    steps: [
      "Gets the link with the practice’s new-patient paperwork.",
      "Builds the tree by side of family, with guided heart questions.",
      "Invites relatives once there’s something useful to show.",
      "Reviews, then prints or shares the summary.",
    ],
  },
  {
    label: "Relative · free, no account",
    icon: Smartphone,
    steps: [
      "Opens a single-purpose link and sees who asked and why.",
      "Answers for themself, or declines. Only they can decline.",
      "Optionally logs into their own MyChart and ticks one fact.",
      "Adds what they know about their own parents and siblings.",
    ],
  },
  {
    label: "Practice · pays",
    icon: Building,
    steps: [
      "Gets one page: guideline criteria matched, then gaps and conflicts.",
      "Sees every fact with who said it and when.",
      "Decides what matters. A “reviewed by clinician” state locks the version in the chart.",
    ],
  },
];

const say = [
  "“Built to operate as a HIPAA business associate, using only vendors that sign BAAs.”",
  "“From <health system>’s record, retrieved <date>.”",
  "“Does not diagnose. A clinician decides what matters.”",
];
const notThat = [
  "“HIPAA certified” or a HIPAA badge (no such certification exists; see the FTC’s GoodRx case).",
  "“HIPAA-compliant cloud (Box)” or “verified diagnosis”.",
  "“GINA protects you from insurers” without the life, disability and LTC caveat.",
];

const SECTIONS = [
  { id: "product", label: "The product" },
  { id: "data", label: "Where data goes" },
  { id: "portals", label: "Patient portals" },
  { id: "privacy", label: "Privacy" },
  { id: "clinical", label: "Clinical criteria" },
  { id: "business", label: "Business" },
  { id: "risks", label: "Riskiest assumptions" },
] as const;

/** A page band under the sticky sub-nav: anchors land below both navs. */
function Band({ id, tone = "paper", children, className }: { id: string; tone?: "paper" | "white"; children: ReactNode; className?: string }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-theme="paper"
      data-nav-theme="paper"
      className={cn("scroll-mt-16 py-20 text-fg lg:py-28", tone === "white" ? "bg-white" : "bg-paper", className)}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** Hero aside: the five research tracks behind the page, each linking into the write-up. */
function ResearchTracks() {
  const sources = renderResearch(readFileSync(path.join(process.cwd(), "docs", "research.md"), "utf8")).sources;
  const tracks = [
    { label: "MyChart and EHR connections", href: "/research#16-how-a-mychart-connection-would-really-work" },
    { label: "Privacy and compliance", href: "/research#2-privacy-and-compliance" },
    { label: "Clinical content", href: "/research#3-clinical-content" },
    { label: "Business model", href: "/research#4-business" },
    { label: "Free hosting, and what changes in a pilot", href: "/research#15-where-data-lives-at-each-stage" },
  ];
  return (
    <div className="mx-auto max-w-[30rem] lg:mr-0">
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-lg">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-paper px-6 py-4">
          <p className="font-mono text-eyebrow text-fg-2 uppercase">The research</p>
          <p className="font-mono text-eyebrow text-fg-3 uppercase tabular-nums">{sources} numbered sources</p>
        </div>
        <ol>
          {tracks.map((t, i) => (
            <li key={t.href} className="border-b border-line last:border-b-0">
              <a
                href={t.href}
                className="group flex min-h-14 items-center gap-4 px-6 py-3 transition-colors duration-(--dur-hover) hover:bg-paper focus-visible:-outline-offset-2"
              >
                <span className="font-mono text-caption text-brand tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1 text-ui font-medium text-fg">{t.label}</span>
                <ArrowRight aria-hidden className="size-4 text-fg-3 transition-transform duration-(--dur-hover) group-hover:translate-x-0.5 group-hover:text-brand" />
              </a>
            </li>
          ))}
        </ol>
        <p className="border-t border-line bg-paper px-6 py-3.5 text-small text-fg-2">Each track was fact-checked against primary sources by an independent reviewer.</p>
      </div>
    </div>
  );
}

function SubHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn("text-title font-strong text-fg", className)}>{children}</h3>;
}

function Note({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("max-w-[68ch] text-small text-fg-2", className)}>{children}</p>;
}

export default function HowItWorks() {
  const dev = report("r-dev-record");
  return (
    <main id="main">
      <PageHero
        eyebrow="How it works"
        title="How it works, and how it would really work."
        underline="really"
        lead="The product in four steps, then the research behind each choice: patient portals, privacy, clinical criteria and the business."
        aside={<ResearchTracks />}
      >
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button href={SITE.demoHref} size="lg" iconRight={<ArrowRight />} className="max-sm:w-full">
            Try the demo family
          </Button>
          <Button href="/research" variant="link" size="lg" iconRight={<ArrowRight />}>
            Read the full research
          </Button>
        </div>
      </PageHero>

      <div className="relative">
        <SubNav items={SECTIONS} label="Sections on this page" className="px-4" />

        {/* 1. The product */}
        <Band id="product" tone="white" className="pt-24 lg:pt-32">
          <SectionHeading
            id="product-title"
            eyebrow="The product"
            title="The product in four steps."
            lead="Alex’s family is made up. Each step below is a piece of the working prototype, with the same people and the same answers."
          />
          <ProductSteps className="mt-12" patientDoc={<SummaryDocument tree={DEMO} audience="patient" headingLevel={4} />} />

          <div className="mt-24">
            <Reveal className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <SubHeading className="font-display text-display-m font-book">Who does what</SubHeading>
              <p className="max-w-[40ch] text-body text-fg-2">Three people, three different jobs. Only one of them pays.</p>
            </Reveal>
            <ul className="mt-8 grid gap-4 md:grid-cols-3">
              {roles.map((r) => (
                <li key={r.label} className="flex min-w-0 flex-col rounded-lg border border-line bg-paper p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-sm border border-line bg-surface text-brand shadow-xs">
                      <r.icon className="size-5" strokeWidth={1.75} />
                    </span>
                    <p className="font-mono text-eyebrow text-fg-2 uppercase">{r.label}</p>
                  </div>
                  <ol className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
                    {r.steps.map((s, i) => (
                      <li key={s} className="flex gap-3 text-body text-fg-2">
                        <span aria-hidden className="mt-px font-mono text-caption text-fg-3 tabular-nums">
                          {i + 1}
                        </span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-24">
            <SubHeading className="font-display text-display-m font-book">Why it&rsquo;s built this way</SubHeading>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[finding("The problem is measurable"), finding("Guided trees fix the structure")].map((b) => (
                <Finding key={b.k} title={b.k} cite={b.cite}>
                  {b.v}
                </Finding>
              ))}
            </div>
          </div>
        </Band>

        {/* 2. Where data goes */}
        <Band id="data">
          <SectionHeading
            id="data-title"
            eyebrow="Where data goes"
            title="Where the data lives."
            lead="In this prototype the tree never leaves your browser. Links carry their own data after the #, and the practice gets a read-only copy."
          />
          <div className="mt-12 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-8 lg:px-12 lg:py-10 xl:px-24">
            <FlowDiagram {...FLOW} />
          </div>
          <div className="mt-16 flex flex-col gap-5">
            <SubHeading>Prototype, pilot, product</SubHeading>
            <ResponsiveTable
              caption="Where the data lives at each stage"
              columns={[{ label: "Stage", srOnly: true }, { label: "Prototype (now, $0)" }, { label: "Paid pilot (1–3 practices)" }, { label: "Product" }]}
              rows={dataStages.map((r) => ({ head: r[0], cells: r.slice(1) }))}
              emphasize={1}
            />
            <Note>
              A lean BAA-covered stack (Vercel Pro with the HIPAA add-on, Neon Scale, Amazon SES) costs roughly $400–550 a month before any revenue.
              Vercel&rsquo;s free Hobby plan is non-commercial and signs no BAA, which is why this prototype holds made-up data only.
              <Cite n={[61, 63, 68, 58]} />
            </Note>
            <aside aria-label="Sending to a practice's Box folder" className="mt-4 flex max-w-[68ch] gap-4 rounded-lg border border-line bg-mist p-5">
              <span aria-hidden className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-sm bg-surface text-fg-2">
                <Building className="size-4" strokeWidth={1.75} />
              </span>
              <p className="text-small text-fg-2">
                <span className="font-strong text-fg">Box, later. </span>
                Sending the summary into a practice&rsquo;s own Box Enterprise folder needs a signed BAA, so it&rsquo;s planned for the paid pilot, not this
                prototype.
                <Cite n={[55, 57]} />
              </p>
            </aside>
          </div>
        </Band>

        {/* 3. Patient portals */}
        <Band id="portals" tone="white">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                id="portals-title"
                eyebrow="Patient portals"
                title="One fact from a relative’s own portal."
                lead="A relative can sign in to their own patient portal and tick one condition to share. Everything else is discarded on that page."
              />
            </div>
            <div className="flex min-w-0 flex-col gap-4 lg:col-span-7 lg:pt-10">
              {[finding("MyChart works for one fact, not the whole history")].map((b) => (
                <Finding key={b.k} title={b.k} cite={b.cite}>
                  {b.v}
                </Finding>
              ))}
              <figure className="rounded-lg border border-line bg-paper p-5 sm:p-6">
                <figcaption className="font-mono text-eyebrow text-fg-3 uppercase">How a shared fact reads (demo)</figcaption>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-line bg-surface px-4 py-3 shadow-xs">
                  <span className="text-ui font-strong text-fg">
                    Uncle Dev · {dev.condition}, age {dev.ageAtOnset}
                  </span>
                  <SourceChip kind="record" date={dev.record?.recordedDate} />
                </div>
                <p className="mt-4 flex items-start gap-2 text-small text-fg-2">
                  <Link2 aria-hidden className="mt-0.5 size-4 shrink-0 text-record" strokeWidth={2} />
                  <span>
                    Labeled &ldquo;from a portal record&rdquo; with &ldquo;on problem list since 2009&rdquo;, never &ldquo;verified&rdquo;: a record date is
                    often when a problem was added to the list, not when it was diagnosed.
                  </span>
                </p>
              </figure>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Button href="/privacy#mychart" variant="link" iconRight={<ArrowRight />}>
                  How the portal demo works
                </Button>
                <Button href="/research#16-how-a-mychart-connection-would-really-work" variant="link" iconRight={<ArrowRight />}>
                  The research on MyChart
                </Button>
              </div>
            </div>
          </div>
        </Band>

        {/* 4. Privacy */}
        <Band id="privacy">
          <SectionHeading
            id="privacy-title"
            eyebrow="Privacy"
            title="Privacy and compliance"
            lead="Who is covered by what, and the words we will and won’t use."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[finding("HIPAA starts when practices pay"), finding("Box is the wrong home for the tree")].map((b) => (
              <Finding key={b.k} title={b.k} cite={b.cite}>
                {b.v}
              </Finding>
            ))}
          </div>
          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SubHeading>When HIPAA applies</SubHeading>
              <ul className="mt-5 flex flex-col divide-y divide-line border-y border-line">
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Patient uses the app on their own:</strong> not HIPAA. FTC Health Breach Notification Rule, FTC
                  Act, and state laws (WA, CA, CT, NV; NY passed both houses, not yet signed).
                  <Cite n={[33, 36]} />
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Relative shares a portal fact:</strong> their own right of access; once released to the app it
                  leaves HIPAA.
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Practice pays and summaries feed its chart:</strong> the team is a business associate. BAAs with
                  every practice and vendor, a risk analysis, MFA and encryption.
                  <Cite n={35} />
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Family history is genetic information</strong> (GINA). It protects against health insurers and
                  employers, not life, disability or long-term-care insurers. No insurer or employer channels, no data sales, ever.
                </li>
              </ul>
            </div>
            <div className="lg:col-span-6">
              <SubHeading>Say this, not that</SubHeading>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-known/30 bg-known-bg/50 p-5">
                  <p className="font-mono text-eyebrow text-known-ink uppercase">Say this</p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {say.map((s) => (
                      <li key={s} className="flex gap-2.5 text-small text-fg">
                        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-known" strokeWidth={2.5} />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-line bg-surface p-5">
                  <p className="font-mono text-eyebrow text-fg-3 uppercase">Not that</p>
                  <ul className="mt-3 flex flex-col gap-3">
                    {notThat.map((s) => (
                      <li key={s} className="flex gap-2.5 text-small text-fg-3">
                        <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-fg-3" />
                        <span className="line-through decoration-fg-3/70">
                          <span className="sr-only">Don&rsquo;t say: </span>
                          {s}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <Button href="/privacy" variant="link" iconRight={<ArrowRight />} className="mt-6">
                Security &amp; privacy in this prototype
              </Button>
            </div>
          </div>
        </Band>

        {/* 5. Clinical criteria */}
        <Band id="clinical" tone="white">
          <SectionHeading
            id="clinical-title"
            eyebrow="Clinical criteria"
            title="What the cardiologist sees"
            lead="Guideline family-history criteria appear only on the care-team page, for a clinician to judge. The patient sees facts, gaps and questions."
          />
          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:self-start lg:sticky lg:top-36">
              {[finding("Alerts go to the clinician, never the patient")].map((b) => (
                <Finding key={b.k} title={b.k} cite={b.cite} className="h-auto">
                  {b.v}
                </Finding>
              ))}
            </div>
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">
              <Note className="text-body">
                Family-history criteria named in current guidelines. The app matches what was reported against these and lists them for the clinician to
                interpret. It never computes a risk score and never shows these to the patient as a recommendation.
              </Note>
              <ResponsiveTable
                caption="Family-history criteria in current guidelines"
                columns={[{ label: "Pattern in a relative" }, { label: "Who counts" }, { label: "Cutoff" }, { label: "Basis" }]}
                rows={criteria.map((r) => ({ head: r[0], cells: r.slice(1) }))}
              />
              <Button href="/practice" variant="link" iconRight={<ArrowRight />} className="self-start">
                Open the care-team view
              </Button>
            </div>
          </div>
        </Band>

        {/* 6. Business */}
        <Band id="business">
          <SectionHeading id="business-title" eyebrow="Business" title="The business" lead="Who pays, what it’s worth, and why the first market is small on purpose." />
          <div className="mt-12 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SubHeading>Who pays, and for what</SubHeading>
              <ul className="mt-5 flex flex-col divide-y divide-line border-y border-line">
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Free for patients and relatives</strong>, with no ads and no data sales written into the terms.
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Independent cardiology practices pay</strong> a flat fee per cardiologist ($99–149/month to
                  start). Never priced per referral or new patient (anti-kickback risk).
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">No billing code pays for family history</strong> (96160 risk assessment: $3.01; genetic
                  counseling is bundled). The value is staff time saved and relatives identified for screening.
                  <Cite n={103} />
                </li>
                <li className="py-4 text-body text-fg-2">
                  <strong className="font-strong text-fg">Competition:</strong> we found no patient-facing cardiology family-tree product combining
                  relative-filled branches, per-fact sources, a portal fact and a cardiology one-pager. Lab-funded tools are mostly cancer-focused; FamGenix
                  ($500/yr, with a cardio add-on) deserves a hands-on look.
                  <Cite n={111} />
                </li>
              </ul>
            </div>
            <div className="flex min-w-0 flex-col gap-5 lg:col-span-6">
              <SubHeading>Market size, with the math</SubHeading>
              <ResponsiveTable
                caption="Market size, with the math"
                columns={[{ label: "Segment" }, { label: "The math" }, { label: "Per year" }]}
                rows={market.map((r) => ({ head: r[0], cells: [r[1], <strong key="v" className="font-strong whitespace-nowrap text-fg tabular-nums">{r[2]}</strong>] }))}
              />
              <Note>
                NYC is a pilot market, not a revenue market; 76–79% of NYC cardiologists sit inside large health systems that already run Epic. Growth would
                come from larger groups, health systems, primary care (the Medicare wellness visit requires family history) and genetics programs.
                <Cite n={[99, 104]} />
              </Note>
              <Button href="/pilot" variant="link" iconRight={<ArrowRight />} className="self-start">
                The proposed pilot
              </Button>
            </div>
          </div>
        </Band>

        {/* 7. Riskiest assumptions */}
        <Band id="risks" tone="white">
          <SectionHeading
            id="risks-title"
            eyebrow="Riskiest assumptions"
            title="Riskiest assumptions, and the cheapest test for each"
            lead="What has to be true for this to work, and how we would find out cheaply."
          />
          <ResponsiveTable
            className="mt-12"
            caption="Riskiest assumptions, the cheapest test and the pass mark"
            columns={[{ label: "Assumption" }, { label: "Cheapest test" }, { label: "Pass mark" }]}
            rows={risks.map((r) => ({ head: r[0], cells: r.slice(1) }))}
          />
          <p className="mt-6 max-w-[68ch] rounded-lg border border-line bg-paper p-5 text-small text-fg-2">
            <strong className="font-strong text-fg">Pilot:</strong> 8–12 weeks with 1–3 independent NYC groups, $500–1,000 flat, credited to an annual
            contract. Continue if at least 1 of 3 practices converts to paid and at least 40% of invited patients complete the tree before the visit.
          </p>
        </Band>
      </div>

      <section aria-labelledby="hiw-cta" data-theme="paper" data-nav-theme="paper" className="aurora grain border-t border-line py-20 text-fg lg:py-28">
        <Container className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="hiw-cta" className="max-w-[18ch] font-display text-display-l font-book text-fg">
              See it with the demo family.
            </h2>
            <p className="mt-4 max-w-[52ch] text-lead text-fg-2">Alex, Mom, Uncle Dev and the rest are made up. Every screen is the working prototype.</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Button href={SITE.demoHref} size="lg" iconRight={<ArrowRight />}>
              Try the demo family
            </Button>
            <Button href="/for-practices" variant="link" size="lg" iconRight={<ArrowRight />}>
              For practices
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
