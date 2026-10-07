"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { stillToConfirm } from "@/lib/clinical";
import { getTree, useTree } from "@/lib/store";
import { viewTree } from "@/lib/status";
import PersonPanel from "./PersonPanel";
import TreeView, { type TreeViewHandle } from "./TreeView";
import { Inspector, PanelSheet } from "./person/PanelContainer";
import { ActivityTimeline } from "./tree/ActivityTimeline";
import { DemoData } from "./tree/DemoData";
import { AddRelative } from "./tree/GhostNodes";
import { LegendFilter } from "./tree/LegendFilter";
import { ListView } from "./tree/ListView";
import { generationOf, legendCounts, visitReady, type Highlight } from "./tree/model";
import { StillToConfirm } from "./tree/StillToConfirm";
import { markTourDone, Tour, TOUR_STOPS, tourDone } from "./tree/Tour";
import { useArrivals } from "./tree/useArrivals";
import { UrlIntent, type Intent } from "./tree/UrlIntent";
import { ReadyRing, VisitReadyCard } from "./tree/VisitReady";
import { VisitPill } from "./tree/VisitPill";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";
import { Eyebrow } from "./ui/Eyebrow";
import { SegmentedControl } from "./ui/SegmentedControl";
import { useMediaQuery } from "./ui/useMediaQuery";

type Selection = { id: string; mode?: "view" | "answer" | "invite"; edit?: "age" | "cause"; nonce: number };

const WIDE = "(min-width: 1024px)";

/**
 * The /tree workspace (DESIGN §12.1): a header with the visit and the visit-ready ring, the legend as a filter, a
 * pan/zoom canvas (or a list by generation) and a right column with the inspector, or the checklist, the relatives still
 * to confirm, the activity and the demo data. Phones get the canvas, then a collapsible "Checklist & activity", and the
 * person panel in a bottom sheet. All state machines, actions.* calls and storage are unchanged.
 */
export default function TreeWorkspace() {
  const tree = useTree();
  const views = useMemo(() => viewTree(tree), [tree]);
  const wide = useMediaQuery(WIDE);
  const [sel, setSel] = useState<Selection | null>(null);
  // the sheet keeps showing the last person while it slides away
  const [sheetSel, setSheetSel] = useState<Selection | null>(null);
  const [list, setList] = useState(false);
  const [highlight, setHighlight] = useState<Highlight>(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const treeRef = useRef<TreeViewHandle>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const nonce = useRef(0);
  const noTour = useRef(false);
  const readyTitle = useRef<HTMLButtonElement>(null);

  const pendingIds = useMemo(() => new Set(tree.invites.filter((i) => !i.answeredAt).map((i) => i.personId)), [tree.invites]);
  const todo = stillToConfirm(views);
  const ready = visitReady(tree);
  const readyDone = ready.filter((r) => r.done).length;
  const counts = legendCounts(views, pendingIds);
  const generations = new Set(tree.people.map((p) => generationOf(p.relation))).size;
  const relatives = tree.people.filter((p) => p.relation !== "self").length;
  const father = tree.people.find((p) => p.relation === "father");
  const mother = tree.people.find((p) => p.relation === "mother");

  const selectRef = useRef<(id: string, opts?: { mode?: Selection["mode"]; edit?: Selection["edit"] }) => void>(() => {});
  const { arrivals, markSeen } = useArrivals(tree, (id) => selectRef.current(id));

  const select = (id: string, opts?: { mode?: Selection["mode"]; edit?: Selection["edit"] }) => {
    if (!getTree().people.some((p) => p.id === id)) return; // unknown ids are ignored
    nonce.current += 1;
    const next = { id, mode: opts?.mode, edit: opts?.edit, nonce: nonce.current };
    setSel(next);
    setSheetSel(next);
    markSeen(id);
    if (window.matchMedia(WIDE).matches) treeRef.current?.centerOn(id);
  };
  useLayoutEffect(() => {
    selectRef.current = select;
  });

  const close = () => {
    const id = sel?.id;
    setSel(null);
    if (!id) return;
    // Focus returns to the relative's node (the sheet does it after its exit; the inspector right away).
    returnFocus.current = document.querySelector<HTMLElement>(`[data-person-id="${CSS.escape(id)}"]`);
    if (window.matchMedia(WIDE).matches) requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
  };

  // The demo tour: demo tree, first visit (fht:tour:v1), not suppressed by ?tour=0.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const suppressed = noTour.current || new URLSearchParams(window.location.search).get("tour") === "0";
      if (!suppressed && getTree().id === "demo" && !tourDone()) setTourIndex(0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  const stops = TOUR_STOPS.filter((s) => views.some((v) => v.person.id === s.personId));
  const tourOn = tourIndex !== null && tree.id === "demo" && stops.length > 0 && !list;
  const anchorId = tourOn ? stops[Math.min(tourIndex, stops.length - 1)].personId : undefined;
  useEffect(() => {
    // phones: the tour card sits over the bottom of the canvas, so keep the anchor above it
    if (anchorId) treeRef.current?.reveal(anchorId, window.matchMedia(WIDE).matches ? 72 : 230);
  }, [anchorId]);

  // An answer that arrives is the demo's best beat: if it lands off screen (and no panel is open), pan to it.
  const arrivedCount = useRef(0);
  const panelOpen = !!sel;
  useEffect(() => {
    const ids = [...arrivals.people];
    const grew = ids.length > arrivedCount.current;
    arrivedCount.current = ids.length;
    if (grew && !panelOpen) treeRef.current?.reveal(ids[ids.length - 1], window.matchMedia(WIDE).matches ? 72 : 180);
  }, [arrivals.people, panelOpen]);

  const endTour = () => {
    markTourDone();
    setTourIndex(null);
  };

  const onIntent = (i: Intent) => {
    if (i.noTour) {
      noTour.current = true;
      setTourIndex(null);
    }
    if (i.person) select(i.person, { mode: i.mode });
  };

  const showChecklist = () => {
    if (window.matchMedia(WIDE).matches) {
      close();
      requestAnimationFrame(() => document.getElementById("ready-title")?.scrollIntoView({ block: "nearest" }));
    } else {
      setSideOpen(true);
      requestAnimationFrame(() => readyTitle.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
    }
  };

  const selView = sel ? views.find((v) => v.person.id === sel.id) : undefined;
  const sheetView = sheetSel ? views.find((v) => v.person.id === sheetSel.id) : undefined;
  const panelFor = (s: Selection, v: (typeof views)[number]) => (
    <PersonPanel
      key={`${s.id}:${s.nonce}`}
      view={v}
      tree={tree}
      focusOnOpen
      initialMode={s.mode}
      initialEdit={s.edit}
      pending={pendingIds.has(v.person.id) && v.status === "unknown"}
      onClose={close}
    />
  );

  const title = tree.patientName === "You" ? "Your family" : `${tree.patientName}’s family`;

  return (
    <main
      id="main"
      className="mx-auto flex w-full max-w-[1680px] flex-col px-4 pt-5 pb-10 sm:px-6 lg:h-[calc(100svh-var(--app-header-h))] lg:min-h-[680px] lg:pt-6 lg:pb-6"
    >
      <Suspense fallback={null}>
        <UrlIntent onIntent={onIntent} />
      </Suspense>

      {/* Header (phones: compact, the Tree | List switch beside the title, the visit and ring in one scroll row) */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0 max-lg:w-full">
          <Eyebrow className="max-lg:hidden">Your family health tree</Eyebrow>
          <div className="flex items-center justify-between gap-3 lg:mt-1.5">
            <h1 className="min-w-0 truncate font-display text-display-m font-book text-fg">{title}</h1>
            <SegmentedControl
              label="Show the family as"
              options={[
                { value: "tree", label: "Tree" },
                { value: "list", label: "List" },
              ]}
              value={list ? "list" : "tree"}
              onChange={(v) => setList(v === "list")}
              className="shrink-0 lg:hidden"
            />
          </div>
          <div className="-mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0">
            <VisitPill tree={tree} />
            <button
              type="button"
              onClick={showChecklist}
              className="group inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface pr-3.5 pl-2 text-small font-medium whitespace-nowrap text-fg shadow-xs transition-[border-color,background-color] duration-(--dur-hover) hover:border-line-strong hover:bg-sunken lg:h-9"
            >
              <ReadyRing done={readyDone} total={ready.length} />
              <span>
                {readyDone} of {ready.length} <span className="max-lg:hidden">visit-</span>ready
              </span>
              <span className="sr-only">. Show the checklist</span>
            </button>
            <span className="shrink-0 px-1 text-small whitespace-nowrap text-fg-3 max-lg:hidden">
              {relatives} relatives · {generations} generations
            </span>
          </div>
        </div>
        <Button href="/summary" iconRight={<ArrowRight />} className="max-lg:hidden">
          Pre-visit summary
        </Button>
      </div>

      <LegendFilter className="mt-3 lg:mt-5" counts={counts} value={highlight} onChange={setHighlight} />

      <div className="mt-3 grid min-h-0 flex-1 gap-5 lg:mt-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        <section aria-label="Tree" className="relative flex min-h-0 min-w-0 flex-col gap-3">
          <div className={cn("relative min-h-0", list ? "lg:flex-1" : "h-[max(360px,calc(100svh-24.5rem))] lg:h-auto lg:flex-1")}>
            {list ? (
              <ListView
                views={views}
                selectedId={sel?.id}
                onSelect={(id) => select(id)}
                pendingIds={pendingIds}
                arrivedIds={arrivals.people}
                highlight={highlight}
                onShowTree={() => setList(false)}
                addRows={(gen) =>
                  gen === 1 ? (
                    <>
                      {father ? (
                        <li>
                          <AddRelative
                            variant="row"
                            relation="paternal-aunt-uncle"
                            label={`${father.label}’s brother or sister`}
                            onAdded={(id) => select(id)}
                          />
                        </li>
                      ) : null}
                      {mother ? (
                        <li>
                          <AddRelative
                            variant="row"
                            relation="maternal-aunt-uncle"
                            label={`${mother.label}’s brother or sister`}
                            onAdded={(id) => select(id)}
                          />
                        </li>
                      ) : null}
                    </>
                  ) : (
                    <li>
                      <AddRelative variant="row" relation="sibling" label="Your brother or sister" onAdded={(id) => select(id)} />
                    </li>
                  )
                }
              />
            ) : (
              <TreeView
                ref={treeRef}
                mode="workspace"
                views={views}
                selectedId={sel?.id}
                onSelect={(id) => select(id)}
                pendingIds={pendingIds}
                arrivedIds={arrivals.people}
                highlight={highlight}
                anchorId={anchorId}
                onShowList={() => setList(true)}
                renderGhost={(g) => <AddRelative relation={g.relation} label={g.label} onAdded={(id) => select(id)} />}
              />
            )}
          </div>
          {tourOn && tourIndex !== null ? (
            <Tour
              index={Math.min(tourIndex, stops.length - 1)}
              stops={stops}
              onNext={() => setTourIndex((i) => Math.min((i ?? 0) + 1, stops.length - 1))}
              onBack={() => setTourIndex((i) => Math.max((i ?? 0) - 1, 0))}
              onSkip={endTour}
              onAsk={() => {
                endTour();
                select("mgf", { mode: "invite" });
              }}
            />
          ) : null}
          <Button href="/summary" iconRight={<ArrowRight />} fullWidth className="mt-1 lg:hidden">
            Pre-visit summary
          </Button>
        </section>

        <div className="min-h-0 min-w-0 lg:-mr-2 lg:overflow-y-auto lg:overscroll-contain lg:pr-2 lg:pb-2">
          {wide && sel && selView ? (
            <Inspector personId={sel.id}>{panelFor(sel, selView)}</Inspector>
          ) : (
            <>
              <button
                ref={readyTitle}
                type="button"
                aria-expanded={sideOpen}
                aria-controls="tree-side"
                onClick={() => setSideOpen((o) => !o)}
                className="flex min-h-14 w-full cursor-pointer scroll-mt-4 items-center justify-between gap-3 rounded-lg border border-line bg-surface px-4 text-left shadow-xs lg:hidden"
              >
                <span className="text-ui font-strong text-fg">Checklist &amp; activity</span>
                <span className="flex items-center gap-2 text-small text-fg-2">
                  <ReadyRing done={readyDone} total={ready.length} size={22} />
                  {readyDone}/{ready.length}
                  <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-(--dur-ui)", sideOpen && "rotate-180")} />
                </span>
              </button>
              <div id="tree-side" className={cn("flex flex-col gap-6 max-lg:mt-4", !sideOpen && "max-lg:hidden")}>
                <VisitReadyCard tree={tree} items={ready} onOpen={(id, mode, field) => select(id, mode === "edit" ? { edit: field ?? "cause" } : { mode })} />
                <StillToConfirm todo={todo} pendingIds={pendingIds} onOpen={(id) => select(id)} />
                <ActivityTimeline
                  tree={tree}
                  views={views}
                  pendingIds={pendingIds}
                  newIds={arrivals.reports}
                  onStart={() => {
                    if (mother) select(mother.id, { mode: "answer" });
                  }}
                />
                <DemoData tree={tree} />
              </div>
            </>
          )}
        </div>
      </div>

      {!wide ? (
        <PanelSheet open={!!sel && !!selView} onClose={close} titleId={sheetSel ? `person-${sheetSel.id}-title` : undefined} returnFocusTo={returnFocus}>
          {sheetSel && sheetView ? panelFor(sheetSel, sheetView) : null}
        </PanelSheet>
      ) : null}
    </main>
  );
}
