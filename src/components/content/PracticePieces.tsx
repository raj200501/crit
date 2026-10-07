// /for-practices building blocks (DESIGN §10.1): how the page arrives, the two text messages, and the regulatory line.
import { Ban, Check, Download, Flag, Link2, Printer, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import { SmsBubble } from "@/components/site/SmsBubble";
import { cn } from "@/components/ui/cn";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { toFhirBundle } from "@/lib/fhir";
import { DEMO, inviteFragment, inviteMessage, PRACTICE_SMS_PREFIX, SITE_HOST } from "./demoFamily";
import { DocPreview } from "./DocPreview";

/* ---------- How it arrives ---------- */

const clip = (s: string, n = 64) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** An excerpt of the real FHIR export for Dad (two voices, both kept), from src/lib/fhir.ts. */
function fhirExcerpt(): string {
  const entry = toFhirBundle(DEMO).entry.find((e) => (e.resource as { id?: string }).id === "fmh-dad");
  const r = entry?.resource as {
    resourceType: string;
    status: string;
    relationship: { coding: { code: string; display: string }[] };
    condition?: { code: { text: string }; onsetAge?: { value: number }; note?: { text: string }[] }[];
    note?: { text: string }[];
  };
  // Real field paths, short lines (≤ 40 characters, so a phone card never wraps mid-token).
  const q = (s: unknown) => JSON.stringify(s);
  const conditions = (r.condition ?? []).map(
    (c) => `    { "code": { "text": ${q(c.code.text)} },\n      "onsetAge": { "value": ${c.onsetAge?.value} } }`,
  );
  return [
    "{",
    `  "resourceType":`,
    `    ${q(r.resourceType)},`,
    `  "status": ${q(r.status)},`,
    `  "relationship": {`,
    `    "coding": [{ "code": ${q(r.relationship.coding[0].code)} }] },`,
    `  "condition": [`,
    conditions.join(",\n"),
    "  ],",
    `  "note": [{ "text":`,
    `    ${q(clip(r.note?.[0]?.text ?? "", 30))} }]`,
    "}",
  ].join("\n");
}

/** Minimal JSON colouring: keys ink, strings evergreen, numbers cobalt. */
function HighlightedJson({ json }: { json: string }) {
  const out: ReactNode[] = [];
  const re = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?)/g;
  let at = 0;
  for (let m = re.exec(json); m; m = re.exec(json)) {
    if (m.index > at) out.push(json.slice(at, m.index));
    if (m[1] && m[2]) out.push(<span key={m.index} className="text-fg">{m[1]}</span>, m[2]);
    else if (m[1]) out.push(<span key={m.index} className="text-known-ink">{m[1]}</span>);
    else out.push(<span key={m.index} className="text-record">{m[3]}</span>);
    at = m.index + m[0].length;
  }
  out.push(json.slice(at));
  return <>{out}</>;
}

function ArrivalCard({ icon: Icon, title, children, stage }: { icon: typeof Printer; title: string; children: ReactNode; stage: ReactNode }) {
  return (
    <li className="min-w-0">
      <SpotlightCard className="h-full overflow-hidden shadow-xs">
        <div className="flex h-full flex-col">
          <div className="bg-dots relative flex h-64 items-center justify-center overflow-hidden border-b border-line bg-canvas [--dots-size:18px]">{stage}</div>
          <div className="flex flex-1 flex-col gap-2 p-6">
            <h3 className="flex items-center gap-2.5 text-title font-strong text-fg">
              <Icon aria-hidden className="size-5 text-brand" strokeWidth={1.75} />
              {title}
            </h3>
            <div className="text-small text-fg-2">{children}</div>
          </div>
        </div>
      </SpotlightCard>
    </li>
  );
}

/** §10.1.3 Three cards: Print · QR or read-only link at check-in · FHIR FamilyMemberHistory (+ Copy as chart text). */
export function ArrivalCards({ careTeamDoc, className }: { careTeamDoc: ReactNode; className?: string }) {
  const visit = DEMO.visit!;
  const date = new Date(`${visit.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return (
    <ul className={cn("grid gap-4 md:grid-cols-3 lg:gap-5", className)}>
      <ArrivalCard
        icon={Printer}
        title="Print"
        stage={
          <div className="relative">
            <div className="h-[264px] w-[204px] translate-y-6 rotate-[-2deg] overflow-hidden rounded-[3px] bg-white shadow-paper transition-transform duration-(--dur-panel) ease-out-quart group-hover/spot:translate-y-4 group-hover/spot:rotate-0 motion-reduce:transition-none">
              <div className="w-[816px] origin-top-left scale-25">
                <DocPreview heightClassName="h-[1056px]">{careTeamDoc}</DocPreview>
              </div>
            </div>
            <span className="absolute -right-6 bottom-2 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-eyebrow text-fg-2 uppercase shadow-sm">
              1 / 1 · Letter
            </span>
          </div>
        }
      >
        One Letter page, ink only, with every source and the legend. Print it or save it as a PDF.
      </ArrivalCard>
      <ArrivalCard
        icon={QrCode}
        title="QR or read-only link at check-in"
        stage={
          <div className="w-60 rounded-lg bg-white p-4 text-ink shadow-paper ring-1 ring-line transition-transform duration-(--dur-panel) ease-out-quart group-hover/spot:-translate-y-1 motion-reduce:transition-none">
            <p className="font-mono text-eyebrow text-ink-3 uppercase">Read-only summary</p>
            <p className="mt-1 text-ui font-strong">
              {DEMO.patientName} · {visit.specialty} · <span className="whitespace-nowrap">{date}</span>
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-dashed border-line-strong pt-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-sm border border-line bg-paper text-ink">
                <QrCode aria-hidden className="size-11" strokeWidth={1.25} />
              </span>
              <span className="text-caption text-ink-2">Ask the front desk to scan</span>
            </div>
          </div>
        }
      >
        The patient shows a QR code at the front desk, or the practice opens a read-only link. Prototype links don&rsquo;t expire; pilot links will
        expire and can be revoked.
      </ArrivalCard>
      <ArrivalCard
        icon={Download}
        title="FHIR FamilyMemberHistory"
        stage={
          <figure className="mx-4 w-full max-w-[22rem] overflow-hidden rounded-md border border-line bg-white shadow-sm transition-transform duration-(--dur-panel) ease-out-quart group-hover/spot:-translate-y-1 motion-reduce:transition-none">
            <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-eyebrow text-ink-3 uppercase">
              <span>FHIR example · Dad · excerpt</span>
              <span>R4</span>
            </figcaption>
            <pre className="max-h-52 overflow-hidden px-3 py-2 font-mono text-caption leading-[1.45] whitespace-pre text-ink-3 [mask-image:linear-gradient(to_bottom,#000_75%,transparent)]">
              <HighlightedJson json={fhirExcerpt()} />
            </pre>
          </figure>
        }
      >
        <p>One resource per relative, with who reported each condition. Or use Copy as chart text:</p>
        <p className="mt-2 rounded-sm bg-sunken px-2.5 py-1.5 font-mono text-caption text-fg">Relation | Problem | Age at onset | Source | Comments</p>
      </ArrivalCard>
    </ul>
  );
}

/* ---------- What your patients receive ---------- */

function LinkToken() {
  return (
    <span className="inline-flex translate-y-px items-center gap-1 rounded-full bg-white px-2 py-px align-baseline font-mono text-caption text-record ring-1 ring-line">
      <Link2 aria-hidden className="size-3" strokeWidth={2.25} />
      link
    </span>
  );
}

function Thread({ who, initials, meta, children, caption }: { who: string; initials: string; meta: string; children: ReactNode; caption: string }) {
  return (
    <figure className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-md">
      <div className="flex items-center gap-3 border-b border-line bg-paper px-5 py-3.5">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-mist-2 text-small font-strong text-fg-2">
          {initials}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-ui font-strong text-fg">{who}</span>
          <span className="text-caption text-fg-3">{meta}</span>
        </span>
      </div>
      <div data-theme="paper" className="flex flex-1 flex-col justify-end gap-3 bg-white px-5 pt-10 pb-6">
        {children}
      </div>
      <figcaption className="border-t border-line px-5 py-3 font-mono text-eyebrow text-fg-3 uppercase">{caption}</figcaption>
    </figure>
  );
}

/** §10.1.5 + AMENDMENTS A2: the practice's text and the real invite format. No health information, no time estimate. */
export function PatientMessages({ className }: { className?: string }) {
  const { fragment } = inviteFragment("mom");
  return (
    <div className={cn("grid gap-5 md:grid-cols-2", className)}>
      <Thread who="Cardiology Associates" initials="CA" meta="Demo practice · text to Alex" caption="Practice → patient">
        <SmsBubble from="them" preview={{ title: "Family health history", site: "Cardiology Associates (demo)" }}>
          {PRACTICE_SMS_PREFIX} <LinkToken />
        </SmsBubble>
      </Thread>
      <Thread who="Mom" initials="M" meta="Text from Alex’s phone" caption="Patient → relative">
        <SmsBubble from="me" preview={{ title: "Family health history", site: SITE_HOST }}>
          {inviteMessage(DEMO.patientName, `${SITE_HOST}/invite#${fragment.slice(0, 8)}…`)}
        </SmsBubble>
      </Thread>
    </div>
  );
}

/* ---------- The regulatory line ---------- */

function PageCard({ eyebrow, title, rows, extra, className }: { eyebrow: string; title: string; rows: string[]; extra: ReactNode; className?: string }) {
  return (
    <div data-theme="paper" className={cn("flex min-w-0 flex-col rounded-lg bg-white p-5 text-ink shadow-paper sm:p-6", className)}>
      <p className="font-mono text-eyebrow text-ink-3 uppercase">{eyebrow}</p>
      <p className="mt-1 font-display text-[1.5rem] leading-tight font-book">{title}</p>
      <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
        {rows.map((r) => (
          <li key={r} className="flex gap-2.5 text-small text-ink-2">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-known" strokeWidth={2.5} />
            {r}
          </li>
        ))}
      </ul>
      <div className="mt-4">{extra}</div>
    </div>
  );
}

/** §10.1.6 Two pages, one line between them: what the patient's page holds, and what only the care team's page adds. */
export function RegulatoryLine({ className }: { className?: string }) {
  const patient = ["Facts, with who said them and when", "Gaps and conflicts, in plain words", "Questions you could ask"];
  const careTeam = ["The same facts, gaps and conflicts", "A three-generation pedigree with a legend", "The relative table, a source on every fact"];
  return (
    <div className={cn("relative grid items-stretch gap-10 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6", className)}>
      <PageCard
        eyebrow="Patient's page"
        title="Alex's summary"
        rows={patient}
        extra={
          <p className="flex items-center gap-2 rounded-sm bg-mist px-3 py-2 text-small text-ink-2">
            <Ban aria-hidden className="size-4 shrink-0 text-ink-3" strokeWidth={2} />
            No guideline criteria. No risk scores.
          </p>
        }
      />
      <div aria-hidden className="relative flex items-center justify-center md:w-14 md:flex-col">
        <span className="absolute inset-x-0 top-1/2 h-0 border-t-2 border-dashed border-lumen/60 md:inset-x-auto md:inset-y-0 md:top-0 md:left-1/2 md:h-auto md:w-0 md:border-t-0 md:border-l-2" />
        <span className="relative rounded-full border border-lumen/40 bg-night px-3 py-1 font-mono text-eyebrow whitespace-nowrap text-lumen uppercase md:-rotate-90">
          The line
        </span>
      </div>
      <PageCard
        eyebrow="Care team's page"
        title="Pre-visit summary"
        rows={careTeam}
        extra={
          <p className="flex gap-2.5 rounded-sm border-l-[3px] border-ink bg-mist px-3 py-2.5 text-small text-ink">
            <Flag aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <span>
              <span className="font-strong">For clinician review:</span> guideline criteria, each with its basis, inputs and what&rsquo;s missing.
            </span>
          </p>
        }
      />
    </div>
  );
}
