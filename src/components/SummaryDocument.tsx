// The one-page pre-visit summary (DESIGN §12.8a/b, AMENDMENTS A1). Two readers, one sheet:
// - patient: facts with sources, what's still to confirm, questions to ask. No criteria, no review band.
// - clinician: the "For clinician review" band (guideline criteria with their basis), gaps and conflicts, the pedigree
//   and the relative table in Epic order. Only ever rendered on /view and /practice (and the marketing embeds).
// Server-renderable: the only client code is the provenance popover island. Print rules live in the CSS module and
// keep each copy on one Letter page.
import { Flag as FlagIcon } from "lucide-react";
import { useId, type ReactNode } from "react";
import { CRITERIA_FOOTNOTE, reviewItems, stillToConfirm, type Flag } from "@/lib/clinical";
import { formatCondition, viewTree, type PersonView } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";
import { HONESTY } from "@/content/site";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";
import { PedigreeGlyph, shapeForSex } from "./ui/PedigreeGlyph";
import { SourceChip, sourceChipText } from "./ui/SourceChip";
import { StatusLegend, type LegendItem } from "./ui/StatusLegend";
import { StatusPill } from "./ui/StatusPill";
import { CenterScroll } from "./summary/CenterScroll";
import { Pedigree } from "./summary/Pedigree";
import { ProvenancePopover } from "./summary/ProvenancePopover";
import { ReviewStamp } from "./summary/ReviewStamp";
import {
  chipWho,
  documentOrder,
  familyRows,
  fmtDay,
  fmtStamp,
  generations,
  hasFinding,
  nodeStatus,
  notAsked,
  provenance as provEntries,
  relationName,
  type Audience,
  type FamilyRow,
} from "./summary/model";
import styles from "./SummaryDocument.module.css";

export interface SummaryDocumentProps {
  tree: FamilyTree;
  audience?: Audience;
  /** Sources open provenance popovers (who, when, their words, the record date). Screen only; off for static embeds. */
  provenance?: boolean;
  /** The demo "Mark reviewed by clinician" stamp (/view, /practice). */
  clinicianReviewedAt?: string | null;
  className?: string;
}

const LEGEND: LegendItem[] = ["known", "conflicting", "unknown", "pending", "declined", "finding", "deceased", "record", "proband"];

const QUESTIONS = [
  "Does my family history change which tests I should have?",
  "Should anyone else in my family be checked?",
  "Would it help to see a genetic counselor?",
  "Is there anything I should ask my relatives before my next visit?",
];

export default function SummaryDocument({ tree, audience = "patient", provenance = false, clinicianReviewedAt, className }: SummaryDocumentProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const views = viewTree(tree);
  const relatives = documentOrder(views);
  const clinician = audience === "clinician";
  const visitDate = fmtDay(tree.visit?.date);
  const title = tree.patientName === "You" ? "Family history" : tree.patientName;
  const meta = [
    tree.visit?.specialty ?? "Upcoming visit",
    visitDate,
    tree.visit?.practice,
    `${generations(tree.people)} generations`,
    `${relatives.length} relative${relatives.length === 1 ? "" : "s"}`,
  ].filter(Boolean) as string[];
  const ctx: Ctx = { tree, audience, provenance };

  return (
    <article
      aria-label="Pre-visit family history summary"
      data-theme="paper"
      data-audience={audience}
      data-sheet={uid}
      className={cn(styles.sheet, "rounded-paper bg-white px-5 pt-6 pb-7 text-ink sm:px-10 sm:pt-10 sm:pb-9 lg:px-14 lg:pt-12", className)}
    >
      <header className={cn(styles.head, "grid grid-cols-1 gap-x-6 sm:grid-cols-[minmax(0,1fr)_auto]")}>
        <div className="min-w-0">
          <p className={cn(styles.eyebrow, "font-mono text-eyebrow font-medium text-ink-3 uppercase")}>
            Pre-visit family heart history <span aria-hidden>·</span> {clinician ? "For the care team" : "Your copy"}
          </p>
          <h1 className={cn(styles.title, "mt-3 font-display text-[2.5rem] leading-[1.02] font-book tracking-[-0.02em] text-ink sm:text-[2.75rem]")}>
            {title}
          </h1>
        </div>
        <div className={cn(styles.stamps, "mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mt-0 sm:flex-col sm:items-end sm:pt-px")}>
          {tree.synthetic ? <Badge className={cn(styles.badge, "sm:order-first")}>{HONESTY.docChip}</Badge> : null}
          <ReviewStamp reviewedAt={tree.reviewedAt} by={clinician ? "patient" : "you"} />
          {clinician ? <ReviewStamp reviewedAt={clinicianReviewedAt} by="clinician" /> : null}
        </div>
        <p className={cn(styles.meta, "mt-3 flex flex-wrap gap-x-2 font-mono text-eyebrow tracking-[0.03em] text-ink-2 uppercase sm:col-span-2")}>
          {meta.map((m, i) => (
            <span key={i} className="whitespace-nowrap">
              {m}
              {i < meta.length - 1 ? (
                <span aria-hidden className="ml-2 text-ink-3">
                  ·
                </span>
              ) : null}
            </span>
          ))}
        </p>
        <div aria-hidden className={cn(styles.rule, "mt-5 h-[1.5px] bg-ink sm:col-span-2")} />
      </header>

      <LinkedHighlight uid={uid} ids={views.map((v) => v.person.id)} />
      {clinician ? <ClinicianBody ctx={ctx} views={views} uid={uid} /> : <PatientBody ctx={ctx} views={views} relatives={relatives} uid={uid} />}

      <footer className={cn(styles.foot, "mt-8 flex flex-col gap-1.5 border-t border-line pt-4 text-caption text-ink-3")}>
        <p>
          {clinician
            ? "Shared by the patient, read-only. Patient-reported family history for clinician review. Not a diagnosis or a risk score. "
            : "Patient-reported family history to support the conversation with your care team. It shows what your family said, with sources, and doesn’t diagnose anyone. "}
          “Portal record” items came from the relative’s own patient portal, shared with their consent; a record date can be when a problem was
          listed, not when it was diagnosed.
          {clinician ? ` Criteria: ${CRITERIA_FOOTNOTE}.` : ""}
        </p>
        <p className="font-mono text-eyebrow text-ink-3 uppercase">
          Family Health Tree · student prototype by Team 709 · prepared{" "}
          <time dateTime={tree.updatedAt} suppressHydrationWarning>
            {fmtStamp(tree.updatedAt, { year: true })}
          </time>
          {tree.synthetic ? " · synthetic demo data" : ""}
        </p>
      </footer>
    </article>
  );
}

type Ctx = { tree: FamilyTree; audience: Audience; provenance: boolean };

/**
 * Pointing at (or focusing into) a person's row lights their symbol in the pedigree: CSS :has(), no JS, so it works in the
 * server-rendered embeds too. Ids come from links, so only plain [A-Za-z0-9_-] ids get a rule.
 */
function LinkedHighlight({ uid, ids }: { uid: string; ids: string[] }) {
  const safe = ids.filter((id) => /^[A-Za-z0-9_-]{1,64}$/.test(id));
  const css = safe
    .map((id) => `[data-sheet="${uid}"]:has([data-row="${id}"]:is(:hover,:focus-within)) [data-node="${id}"] [data-halo]{opacity:.55}`)
    .join("");
  return css ? <style>{css}</style> : null;
}

function SectionTitle({ id, children, className }: { id: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn(styles.h2, "flex items-center gap-3 font-mono text-eyebrow font-medium text-ink-2 uppercase", className)}>
      <span className="shrink-0">{children}</span>
      <span aria-hidden className="h-px flex-1 bg-line" />
    </h2>
  );
}

function PedigreeFigure({ views, ctx, uid }: { views: PersonView[]; ctx: Ctx; uid: string }) {
  return (
    <figure aria-labelledby={`${uid}-ped`} className={styles.pedigree}>
      <h2 id={`${uid}-ped`} className="sr-only">
        Pedigree
      </h2>
      <div
        className={cn(
          styles.pedFrame,
          "bg-dots flex flex-col gap-4 rounded-md border border-line bg-canvas/60 px-3 py-4 [--dots-size:18px] sm:px-5 md:flex-row md:items-center md:gap-6 md:py-5",
        )}
      >
        <div className={cn(styles.pedViewport, "relative min-w-0 md:flex-1")}>
          <CenterScroll label="Pedigree (scrolls sideways)" className={cn(styles.pedScroll, "overflow-x-auto overscroll-x-contain rounded-sm")}>
            <Pedigree views={views} className={cn(styles.pedSvg, "mx-auto max-h-[230px] min-w-[520px] md:min-w-0")} />
          </CenterScroll>
          {/* phones: the pedigree scrolls sideways (it opens centred); fades on both edges say there's more */}
          <div aria-hidden className={cn(styles.pedFade, "pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-canvas to-transparent md:hidden")} />
          <div aria-hidden className={cn(styles.pedFade, "pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-canvas to-transparent md:hidden")} />
        </div>
        <figcaption className={cn(styles.legend, "md:w-48 md:shrink-0 md:border-l md:border-line md:pl-5")}>
          <StatusLegend
            compact
            items={LEGEND}
            context={ctx.audience === "clinician" ? "clinical" : "patient"}
            className="md:flex-col md:flex-nowrap md:items-start md:gap-y-1.5"
          />
          <p className={cn(styles.pedHint, "mt-2 text-caption text-ink-3 md:hidden")}>Scroll sideways to see both sides of the family.</p>
        </figcaption>
      </div>
    </figure>
  );
}

/** A source: a static chip, or (provenance on) a chip that opens who/when/their words. */
function Source({ r, ctx, subject }: { r: Report; ctx: Ctx; subject: string }) {
  const who = chipWho(r, ctx.audience, ctx.tree.patientName);
  const date = r.source === "record" ? r.record?.recordedDate : r.reportedAt;
  if (!ctx.provenance) return <SourceChip kind={r.source} who={who} date={date} className={styles.chip} />;
  return (
    <ProvenancePopover
      label={sourceChipText(r.source, who, date)}
      subject={subject}
      kind={r.source}
      entries={provEntries([r], ctx.audience, ctx.tree.patientName)}
      className={styles.chip}
    />
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Patient copy: what we know (with sources), still to confirm, questions. Never criteria, never "risk".

function PatientBody({ ctx, views, relatives, uid }: { ctx: Ctx; views: PersonView[]; relatives: PersonView[]; uid: string }) {
  const withInfo = relatives.filter((v) => v.status !== "unknown");
  const todo = stillToConfirm(views);
  // three or more people nobody has asked yet read better as one line than as a column of "Not asked yet."
  const groupNotAsked = todo.filter(notAsked).length >= 3;
  const own = views.find((v) => v.person.relation === "self")?.reports.filter((r) => r.kind === "condition" || r.kind === "no-history") ?? [];
  return (
    <div className={cn(styles.body, styles.patientBody, "mt-8 flex flex-col gap-9")}>
      <PedigreeFigure views={views} ctx={ctx} uid={uid} />

      <section aria-labelledby={`${uid}-know`} className={styles.know}>
        <SectionTitle id={`${uid}-know`}>What we know</SectionTitle>
        {withInfo.length ? (
          <ul className="mt-2">
            {withInfo.map((v) => (
              <KnownRow key={v.person.id} v={v} ctx={ctx} />
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-md bg-mist px-4 py-4 text-small text-ink-2">
            <p>No one has answered yet. Start with your mother’s side.</p>
            <Button href="/tree" variant="secondary" size="sm" className="mt-3 print:hidden">
              Add what you know
            </Button>
          </div>
        )}
      </section>

      {todo.length ? (
        <section aria-labelledby={`${uid}-todo`} className={styles.todo}>
          <SectionTitle id={`${uid}-todo`}>Still to confirm</SectionTitle>
          <ul className="mt-3 flex flex-col gap-3">
            {(groupNotAsked ? todo.filter((v) => !notAsked(v)) : todo).map((v) => (
              <li key={v.person.id} data-row={v.person.id} className={cn(styles.todoItem, "grid grid-cols-[22px_1fr] items-start gap-x-3 text-small text-ink-2")}>
                <Glyph v={v} size={22} />
                <p>
                  <span className="font-strong text-ink">{v.person.label}</span>
                  <span className="text-ink-3"> · {relationName(v.person)}</span>
                  <br />
                  {toConfirm(v)}
                </p>
              </li>
            ))}
            {groupNotAsked ? (
              <li className={cn(styles.todoItem, "grid grid-cols-[22px_1fr] items-start gap-x-3 text-small text-ink-2")}>
                <PedigreeGlyph shape="circle" status="pending" size={22} className={styles.glyph} />
                <p>
                  <span className="font-strong text-ink">Not asked yet</span>
                  <br />
                  {todo
                    .filter(notAsked)
                    .map((v) => v.person.label)
                    .join(", ")}
                  . You can invite them from the tree, or add what you know.
                </p>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {own.length ? (
        <section aria-labelledby={`${uid}-own`} className={styles.own}>
          <SectionTitle id={`${uid}-own`}>Your own history</SectionTitle>
          <ul className="mt-3 flex flex-col gap-2 text-small">
            {own.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-ink">{r.kind === "condition" ? formatCondition(r) : "No heart history"}</span>
                <Source r={r} ctx={ctx} subject="You" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby={`${uid}-ask`} className={styles.ask}>
        <SectionTitle id={`${uid}-ask`}>Questions you could ask</SectionTitle>
        <ol className={cn(styles.askList, "mt-3 grid gap-x-8 gap-y-2.5 text-small text-ink-2 sm:grid-cols-2")}>
          {QUESTIONS.map((q, i) => (
            <li key={q} className="grid grid-cols-[1.75rem_1fr] items-baseline">
              <span aria-hidden className="font-mono text-eyebrow text-ink-3">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{q}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Glyph({ v, size }: { v: PersonView; size: number }) {
  return (
    <PedigreeGlyph
      shape={shapeForSex(v.person.sex)}
      status={nodeStatus(v)}
      finding={hasFinding(v)}
      deceased={v.person.deceased}
      record={v.verified}
      size={size}
      className={styles.glyph}
    />
  );
}

function KnownRow({ v, ctx }: { v: PersonView; ctx: Ctx }) {
  const p = v.person;
  const declined = v.status === "declined";
  const facts = declined ? v.conditions : v.reports.filter((r) => r.kind === "condition" || r.kind === "no-history");
  const ns = nodeStatus(v);
  return (
    <li data-row={p.id} className={cn(styles.knownRow, "grid grid-cols-[22px_1fr] gap-x-3 border-b border-line py-3.5 last:border-b-0 sm:grid-cols-[22px_minmax(0,11rem)_1fr_auto] sm:gap-x-4")}>
      <Glyph v={v} size={22} />
      <p className="min-w-0 text-small">
        <span className="font-strong text-ink">{p.label}</span>
        <span className="block text-caption text-ink-3">
          {relationName(p)}
          {p.deceased ? " · passed away" : ""}
        </span>
      </p>
      <div className="col-start-2 mt-1.5 flex min-w-0 flex-col gap-2 sm:col-start-auto sm:mt-0">
        {declined ? <p className="text-small text-ink-2">Chose not to share.{facts.length ? " What you know yourself:" : ""}</p> : null}
        {facts.map((r) => (
          <div key={r.id} className="flex min-w-0 flex-col gap-1">
            {/* a div, not a p: the provenance popover renders a <div popover>, which a <p> can't contain */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-ink">
              <span>{r.kind === "condition" ? formatCondition(r) : "No heart history"}</span>
              <Source r={r} ctx={ctx} subject={`${p.label} · ${relationName(p)}`} />
            </div>
            {r.note ? <q className={cn(styles.note, "text-caption text-ink-2 italic")}>{r.note}</q> : null}
          </div>
        ))}
      </div>
      <div className="col-start-2 mt-2 sm:col-start-auto sm:mt-0">
        <StatusPill status={ns === "self" ? "known" : ns} size="sm" className={styles.pill} />
      </div>
    </li>
  );
}

/** Plain words for a gap or a disagreement (patient side): who said what, never what it means. */
function toConfirm(v: PersonView): ReactNode {
  if (v.status === "conflicting") {
    const said = [...v.conditions, ...v.reports.filter((r) => r.kind === "no-history")].map(
      (r) => `${r.reportedBy} says ${r.kind === "no-history" ? "no heart history" : formatCondition(r).toLowerCase().replace(", about age ", " at about ").replace(", age ", " at ")}`,
    );
    return `Reports disagree. ${said.join("; ")}. Both are kept until someone can say which.`;
  }
  const dk = v.reports.filter((r) => r.kind === "dont-know");
  if (!dk.length) return "Not asked yet.";
  const notes = dk.filter((r) => r.note);
  return (
    <>
      No one knows yet.
      {notes.map((r) => (
        <span key={r.id}>
          {" "}
          {r.reportedBy}: <q className="italic">{r.note}</q>
        </span>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Care-team copy (D4 §5.2 order): For clinician review → gaps and conflicts → pedigree → the relative table.

function ClinicianBody({ ctx, views, uid }: { ctx: Ctx; views: PersonView[]; uid: string }) {
  const items = reviewItems(ctx.tree, views);
  const guideline = items.filter((i) => i.tier === "guideline");
  const noted = items.filter((i) => i.tier === "noted");
  const clarify = items.filter((i) => i.tier === "clarify");
  const shown = guideline.slice(0, 3);
  const more = guideline.slice(3);
  const byId = new Map(views.map((v) => [v.person.id, v]));
  const rows = familyRows(ctx.tree, views);
  return (
    <div className={cn(styles.body, styles.clinicianBody, "mt-8 flex flex-col gap-9")}>
      <section aria-labelledby={`${uid}-review`} className={cn(styles.review, "rounded-r-md border-l-[3px] border-ink bg-mist px-5 py-4 sm:px-6 sm:py-5")}>
        <h2 id={`${uid}-review`} className={cn(styles.reviewTitle, "flex items-center gap-2 font-sans text-ui font-strong text-ink")}>
          <FlagIcon aria-hidden className="size-4" strokeWidth={2.25} />
          For clinician review <span className="font-mono text-eyebrow font-medium text-ink-2">({guideline.length})</span>
        </h2>
        <p className={cn(styles.reviewNote, "mt-1 text-caption text-ink-2")}>
          Family-history criteria named in cardiology guidelines, matched to what was reported. For the clinician to interpret; not a diagnosis or a
          risk score.
        </p>
        {shown.length ? (
          <ol className="mt-3 flex flex-col">
            {shown.map((f, i) => (
              <li key={f.personId + f.title} className={cn(styles.criterion, "grid grid-cols-[1.75rem_1fr] gap-x-2 border-t border-ink/12 py-3")}>
                <span aria-hidden className="pt-0.5 font-mono text-eyebrow text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <p className="text-ui font-strong text-ink">{f.title}</p>
                  <p className="mt-0.5 text-small text-ink-2">{f.detail}</p>
                  {f.basis ? <p className={cn(styles.basis, "mt-1.5 font-mono text-eyebrow text-ink-3")}>Basis: {f.basis}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 border-t border-ink/12 pt-3 text-small text-ink-2">
            No guideline family-history criteria matched what was reported. Gaps below may still matter.
          </p>
        )}
        {more.length ? (
          <p className="mt-1 text-small text-ink-2">
            Also matched: {more.map((f) => `${f.title} (${byId.get(f.personId)?.person.label ?? "relative"})`).join("; ")}.
          </p>
        ) : null}
        {noted.length ? (
          <div className={cn(styles.noted, "mt-2 border-t border-ink/12 pt-3")}>
            <h3 className="font-mono text-eyebrow font-medium text-ink-3 uppercase">Also noted · no guideline criterion</h3>
            <ul className="mt-1.5 flex flex-col gap-1 text-small text-ink-2">
              {noted.map((f) => (
                <li key={f.personId + f.title}>
                  <span className="font-medium text-ink">{f.title}.</span> {f.detail}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {clarify.length ? (
        <section aria-labelledby={`${uid}-gaps`} className={styles.gaps}>
          <SectionTitle id={`${uid}-gaps`}>Gaps and conflicts</SectionTitle>
          <ul className={cn(styles.gapList, "mt-3 flex flex-col gap-2.5")}>
            {clarify.map((f) => (
              <GapRow key={f.personId + f.title} f={f} v={byId.get(f.personId)} />
            ))}
          </ul>
        </section>
      ) : null}

      <PedigreeFigure views={views} ctx={ctx} uid={uid} />

      <section aria-labelledby={`${uid}-table`} className={styles.tableWrap}>
        <SectionTitle id={`${uid}-table`}>Family history, in chart order</SectionTitle>
        <FamilyTable rows={rows} ctx={ctx} />
      </section>
    </div>
  );
}

function GapRow({ f, v }: { f: Flag; v?: PersonView }) {
  const conflict = f.title.startsWith("Reports disagree");
  return (
    <li data-row={f.personId} className={cn(styles.gap, "grid grid-cols-[22px_1fr] items-start gap-x-3 text-small text-ink-2")}>
      {v ? <Glyph v={v} size={22} /> : <span />}
      <p>
        <span className="font-strong text-ink">{f.title}.</span> {conflict ? <span className="font-medium text-ink">{f.detail}</span> : f.detail}
        {conflict ? " Both kept." : ""}
      </p>
    </li>
  );
}

function FamilyTable({ rows, ctx }: { rows: FamilyRow[]; ctx: Ctx }) {
  const groups: FamilyRow[][] = [];
  for (const r of rows) {
    if (r.first) groups.push([r]);
    else groups[groups.length - 1].push(r);
  }
  return (
    <table className={cn(styles.chart, "mt-3 w-full border-collapse text-left text-small")}>
      <caption className="sr-only">Family history by relative: relation, problem, age at onset, source and comments</caption>
      <thead>
        <tr className="border-b border-ink/25 font-mono text-eyebrow text-ink-3 uppercase">
          <th scope="col" className="w-[24%] py-2 pr-3 font-medium">
            Relation
          </th>
          <th scope="col" className="w-[20%] py-2 pr-3 font-medium">
            Problem
          </th>
          <th scope="col" className="w-[9%] py-2 pr-3 font-medium whitespace-nowrap">
            Age at onset
          </th>
          <th scope="col" className="w-[19%] py-2 pr-3 font-medium">
            Source
          </th>
          <th scope="col" className="py-2 font-medium">
            Comments
          </th>
        </tr>
      </thead>
      {groups.map((g) => {
        const v = g[0].view;
        const subject = `${g[0].name} · ${g[0].relation}`;
        return (
          <tbody key={g[0].personId} data-row={g[0].personId} className={cn(styles.group, "border-b border-line")}>
            {g.map((r, i) => (
              <tr key={i} className="align-top">
                {r.first ? (
                  <th scope="rowgroup" rowSpan={r.span} className={cn(styles.relCell, "py-3 pr-3 font-normal")}>
                    <span className="flex items-start gap-2.5">
                      <Glyph v={v} size={20} />
                      <span className="min-w-0">
                        <span className={cn(styles.relLabel, "block font-strong text-ink")}>{r.relation}</span>
                        <span className={cn(styles.relName, "block text-caption text-ink-3")}>
                          {r.name}
                          {v.person.deceased ? " · deceased" : ""}
                        </span>
                      </span>
                    </span>
                  </th>
                ) : null}
                <td className={cn(styles.problem, "py-3 pr-3 text-ink", (r.problem === "Unknown" || r.problem === "Declined to share") && "text-ink-2")}>
                  {r.problem}
                </td>
                <td data-empty={r.age === "—" || undefined} className={cn(styles.age, "py-3 pr-3 font-mono text-[0.8125rem] text-ink tabular-nums")}>
                  {r.age}
                </td>
                <td data-label="Source" className={cn(styles.src, "py-3 pr-3 text-ink-2")}>
                  {ctx.provenance && r.reports.length ? (
                    <ProvenancePopover variant="text" label={r.source} subject={subject} entries={provEntries(r.reports, "clinician", ctx.tree.patientName)} />
                  ) : (
                    <span>{r.source}</span>
                  )}
                </td>
                <td data-empty={!r.comments || undefined} className={cn(styles.comments, "py-3 text-caption text-ink-2")}>{r.comments || <span className="text-ink-3">—</span>}</td>
              </tr>
            ))}
          </tbody>
        );
      })}
    </table>
  );
}
