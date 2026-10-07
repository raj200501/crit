"use client";

// /practice (AMENDMENTS A1): what a paying cardiology practice sees. Upcoming new-patient visits (the first row is the demo
// patient from this browser's tree; three clearly labeled made-up demo rows), and the care-team document of
// shareableTree(tree) with Print · Copy as chart text · Download FHIR · Mark reviewed by clinician. No metrics, totals or
// percentages anywhere.
import { CalendarDays, Check, ChevronLeft, ChevronRight, CircleDashed, Info, Send } from "lucide-react";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { shareableTree } from "@/lib/redact";
import { counts, viewTree } from "@/lib/status";
import { useTree } from "@/lib/store";
import { HONESTY } from "@/content/site";
import { Lockup } from "../brand/Lockup";
import SummaryDocument from "../SummaryDocument";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { Eyebrow } from "../ui/Eyebrow";
import { HonestyRibbon } from "../ui/HonestyRibbon";
import { CareTeamActions, LINK_EXPIRY } from "./CareTeamActions";
import { contentHash, fmtWeekday } from "./model";
import { useClinicianReview } from "./useClinicianReview";

type Intake = { kind: "reviewed" | "progress" | "sent"; text: string };
type Visit = { id: string; name: string; date: string | null; reason: string; intake: Intake; live: boolean };

const PILOT_NOTE = "In a pilot, this arrives through the practice link or the check-in QR, not from the patient’s browser.";

/** Three made-up weekdays in the same week as the demo visit (Mon–Fri, never the demo patient's day). */
function sameWeek(date: string | undefined): string[] {
  const [y, m, d] = (date ?? "2026-10-14").split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d));
  const dow = (day.getUTCDay() + 6) % 7; // Mon = 0
  const monday = new Date(day.getTime() - dow * 86_400_000);
  const days = [0, 1, 2, 3, 4].filter((i) => i !== dow).map((i) => new Date(monday.getTime() + i * 86_400_000).toISOString().slice(0, 10));
  return [days[0], days[1], days[2]];
}

const noopSubscribe = () => () => {};
function useQueryFlag(name: string, value: string) {
  return useSyncExternalStore(
    noopSubscribe,
    () => new URLSearchParams(window.location.search).get(name) === value,
    () => false,
  );
}

export function PracticeView() {
  const tree = useTree();
  const care = useMemo(() => shareableTree(tree), [tree]);
  const c = counts(viewTree(tree));
  const fromUrl = useQueryFlag("patient", "self");
  const [picked, setPicked] = useState(false);
  const selected = picked || fromUrl;
  const docTitle = useRef<HTMLHeadingElement>(null);
  const [reviewedAt, setReviewed] = useClinicianReview(useMemo(() => contentHash(JSON.stringify(care)), [care]));

  const answered = c.relatives - c.unknown;
  const [d1, d2, d3] = sameWeek(tree.visit?.date);
  const visits: Visit[] = [
    {
      id: "self",
      name: tree.patientName === "You" ? "You (this browser)" : tree.patientName,
      date: tree.visit?.date ?? null,
      reason: `${tree.visit?.specialty ?? "Cardiology"} · new patient`,
      intake: tree.reviewedAt
        ? { kind: "reviewed", text: "Summary reviewed" }
        : { kind: "progress", text: `In progress · ${answered} of ${c.relatives} relatives answered` },
      live: true,
    },
    { id: "demo-1", name: "Priya S.", date: d1, reason: "Cardiology · new patient", intake: { kind: "sent", text: "Link sent · not started" }, live: false },
    { id: "demo-2", name: "Marcus T.", date: d2, reason: "Cardiology · new patient", intake: { kind: "progress", text: "In progress · 2 of 6 relatives" }, live: false },
    { id: "demo-3", name: "Dana K.", date: d3, reason: "Cardiology · new patient", intake: { kind: "reviewed", text: "Summary reviewed" }, live: false },
  ];
  const self = visits[0];

  const open = () => {
    setPicked(true);
    try {
      window.history.replaceState(window.history.state, "", "?patient=self");
    } catch {
      /* ignore */
    }
    requestAnimationFrame(() => {
      const el = document.getElementById("care-team-doc");
      el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      docTitle.current?.focus({ preventScroll: true });
    });
  };

  return (
    <div className="min-h-dvh bg-bg text-fg print:min-h-0 print:bg-white">
      <header data-shell="practice" className="relative z-(--z-nav) bg-surface print:hidden">
        <HonestyRibbon />
        <div className="flex h-[60px] items-center gap-3 border-b border-line px-4 md:px-6">
          <Lockup href="/" size={26} surface="white" />
          <span className="hidden rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-eyebrow font-medium text-fg-2 uppercase min-[420px]:inline">Practice</span>
          <Button href="/summary" variant="ghost" size="sm" className="ml-auto max-md:h-11">
            Patient view
          </Button>
        </div>
      </header>

      <main id="main" className="print:p-0">
        {/* page header */}
        <section aria-labelledby="practice-title" className="relative isolate overflow-hidden print:hidden">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(40%_90%_at_12%_0%,rgb(207_245_231/0.75),transparent_70%),radial-gradient(30%_70%_at_92%_0%,rgb(214_233_255/0.6),transparent_70%)]"
          />
          <div className="mx-auto w-full max-w-[1240px] px-4 pt-8 pb-6 sm:px-6 sm:pt-12 lg:px-8">
            <Eyebrow>Practice view · Demo</Eyebrow>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 id="practice-title" className="font-display text-display-m font-book text-ink">
                Cardiology Associates (demo)
              </h1>
              <Badge>{HONESTY.docChip}</Badge>
            </div>
            <p className="mt-3 max-w-[60ch] text-body text-fg-2">
              New-patient visits this week. Family history arrives before the patient does: who, what, at what age, and who said so.
            </p>
          </div>
        </section>

        {/* visits */}
        <section aria-labelledby="visits-title" className="mx-auto w-full max-w-[1240px] px-4 pb-10 sm:px-6 lg:px-8 print:hidden">
          <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-4">
              <h2 id="visits-title" className="flex items-center gap-2 font-sans text-ui font-strong text-ink">
                <CalendarDays aria-hidden className="size-4 text-ink-3" />
                Upcoming new-patient visits
              </h2>
              <p className="font-mono text-eyebrow text-ink-3 uppercase">This week · made-up rows are labeled</p>
            </div>

            {/* desktop: a table */}
            <table className="hidden w-full text-left md:table">
              <caption className="sr-only">Upcoming new-patient visits. The first row is the demo patient from this browser; the others are made-up demo rows.</caption>
              <thead>
                <tr className="border-b border-line font-mono text-eyebrow text-ink-3 uppercase">
                  <th scope="col" className="py-2.5 pr-4 pl-5 font-medium">
                    Patient
                  </th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">
                    Visit
                  </th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">
                    Visit type
                  </th>
                  <th scope="col" className="py-2.5 pr-4 font-medium">
                    Family history
                  </th>
                  <th scope="col" className="py-2.5 pr-5 text-right font-medium">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr
                    key={v.id}
                    className={cn(
                      "relative border-b border-line last:border-b-0",
                      v.live && "transition-colors duration-(--dur-hover) hover:bg-evergreen-50/60 lg:bg-evergreen-50/50",
                      v.live && selected && "bg-evergreen-50/60",
                    )}
                  >
                    <th scope="row" className={cn("py-3.5 pr-4 pl-5 font-normal", v.live && "lg:shadow-[inset_3px_0_0_var(--color-evergreen-600)]")}>
                      <span className="flex items-center gap-3">
                        <Avatar name={v.name} live={v.live} />
                        <span className="min-w-0">
                          <span className="block text-ui font-strong text-ink">{v.name}</span>
                          <span className="block text-caption text-ink-3">{v.live ? "Demo patient · from this browser" : "Demo row"}</span>
                        </span>
                      </span>
                    </th>
                    <td className="py-3.5 pr-4 text-small whitespace-nowrap text-ink tabular-nums">{v.date ? fmtWeekday(v.date) : "Not scheduled"}</td>
                    <td className="py-3.5 pr-4 text-small text-ink-2">{v.reason}</td>
                    <td className="py-3.5 pr-4">
                      <IntakeBadge intake={v.intake} />
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      {v.live ? (
                        <button
                          type="button"
                          onClick={open}
                          aria-controls="care-team-doc"
                          className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-small font-medium whitespace-nowrap text-brand transition-colors after:absolute after:inset-0 after:content-[''] hover:text-brand-strong"
                        >
                          Open summary
                          <ChevronRight aria-hidden className="size-4" />
                        </button>
                      ) : (
                        <Badge mono>Demo row</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* phones: cards */}
            <ul aria-label="Upcoming new-patient visits" className="divide-y divide-line md:hidden">
              {visits.map((v) => {
                const body = (
                  <>
                    <Avatar name={v.name} live={v.live} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-ui font-strong text-ink">{v.name}</span>
                        {v.live ? null : <Badge mono>Demo row</Badge>}
                      </span>
                      <span className="mt-0.5 block text-small text-ink-2">
                        {v.date ? fmtWeekday(v.date) : "Not scheduled"} · {v.reason}
                      </span>
                      <span className="mt-2 block">
                        <IntakeBadge intake={v.intake} />
                      </span>
                    </span>
                  </>
                );
                return (
                  <li key={v.id}>
                    {v.live ? (
                      <button
                        type="button"
                        onClick={open}
                        aria-controls="care-team-doc"
                        aria-label={`${v.name}: open the care-team summary`}
                        className={cn("flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-evergreen-50/60", selected && "bg-evergreen-50/60")}
                      >
                        {body}
                        <ChevronRight aria-hidden className="mt-2.5 size-5 shrink-0 text-ink-3" />
                      </button>
                    ) : (
                      <div className="flex items-start gap-3 px-4 py-4">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* the care-team document */}
        <section
          id="care-team-doc"
          aria-labelledby="doc-title"
          className={cn("scroll-mt-4 border-t border-line bg-mist print:block print:border-0 print:bg-white", selected ? "block" : "max-lg:hidden")}
        >
          <div className="mx-auto w-full max-w-[1240px] px-4 pt-8 pb-16 sm:px-6 lg:px-8 lg:pt-10 print:max-w-none print:p-0">
            {selected ? (
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<ChevronLeft />}
                onClick={() => document.getElementById("visits-title")?.scrollIntoView({ block: "start" })}
                className="-ml-2.5 mb-3 h-11 lg:hidden print:hidden"
              >
                Back to visits
              </Button>
            ) : null}
            <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
              <div>
                <Eyebrow>Care-team document</Eyebrow>
                <h2 id="doc-title" ref={docTitle} tabIndex={-1} className="mt-1 font-display text-title font-book text-ink focus:outline-none">
                  {self.name} · {self.reason.replace(" · new patient", "")}
                  {self.date ? ` · ${fmtWeekday(self.date)}` : ""}
                </h2>
              </div>
            </div>
            <p className="mt-3 flex items-start gap-2 text-small text-ink-2 print:hidden">
              <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" />
              {PILOT_NOTE}
            </p>

            <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,816px)_minmax(260px,300px)] lg:items-start lg:justify-center lg:gap-10 print:mt-0 print:block">
              <aside aria-label="Actions" className="lg:sticky lg:top-6 lg:order-2 print:hidden">
                <div className="rounded-lg border border-line bg-surface p-4 shadow-sm lg:p-5">
                  <CareTeamActions tree={care} reviewedAt={reviewedAt} onReviewed={setReviewed} layout="stack" className="max-lg:hidden" />
                  <CareTeamActions tree={care} reviewedAt={reviewedAt} onReviewed={setReviewed} layout="row" className="lg:hidden" />
                  <p className="mt-4 border-t border-line pt-3 text-caption text-ink-3">{LINK_EXPIRY}</p>
                  <ul aria-label="How it arrives" className="mt-3 flex flex-col gap-1.5 text-caption text-ink-2 max-lg:hidden">
                    <li className="flex items-center gap-2">
                      <Send aria-hidden className="size-3.5 text-ink-3" />
                      Practice link or check-in QR (read-only)
                    </li>
                    <li className="flex items-center gap-2">
                      <Check aria-hidden className="size-3.5 text-ink-3" />
                      FHIR FamilyMemberHistory file for the chart
                    </li>
                  </ul>
                </div>
              </aside>
              <div className="min-w-0 lg:order-1">
                <div className="mx-auto max-w-[816px] rounded-paper shadow-paper print:max-w-none print:shadow-none">
                  <SummaryDocument tree={care} audience="clinician" provenance clinicianReviewedAt={reviewedAt} headingLevel={3} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Avatar({ name, live }: { name: string; live: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full text-caption font-strong",
        live ? "bg-ink text-white shadow-[0_0_0_3px_var(--color-evergreen-50)]" : "bg-mist text-ink-2",
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function IntakeBadge({ intake }: { intake: Intake }) {
  if (intake.kind === "reviewed")
    return (
      <Badge tone="brand" icon={<Check />}>
        {intake.text}
      </Badge>
    );
  return <Badge icon={intake.kind === "sent" ? <Send /> : <CircleDashed />}>{intake.text}</Badge>;
}
