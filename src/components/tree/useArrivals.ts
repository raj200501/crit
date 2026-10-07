"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getTree } from "@/lib/store";
import { formatCondition } from "@/lib/status";
import type { FamilyTree, Report } from "@/lib/types";
import { toast } from "@/components/ui/Toast";

// The arrival moment (DESIGN §11.3). Report ids this tab has already shown live in sessionStorage
// (`fht:seen-reports:{treeId}`). A relative's answer that lands while /tree is open (the `storage` event from another
// tab: /reply, or the relative's flow in the same browser) or since this tab last showed the tree (an import on /reply
// in this tab) ripples their node once, lights the path to "you", toasts, and tags the activity row "New".
// The patient's own entries never count as arrivals.

const TREE_KEY = "fht:tree:v1";
const seenKey = (treeId: string) => `fht:seen-reports:${treeId}`;

function readSeen(treeId: string): Set<string> | null {
  try {
    const raw = window.sessionStorage.getItem(seenKey(treeId));
    const list = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(list) ? new Set(list.filter((x): x is string => typeof x === "string")) : null;
  } catch {
    return null;
  }
}

function writeSeen(treeId: string, ids: Set<string>) {
  try {
    window.sessionStorage.setItem(seenKey(treeId), JSON.stringify([...ids]));
  } catch {
    /* storage unavailable: arrivals still show for this page */
  }
}

/**
 * Called just before this tab imports a reply (/reply's "Add to my tree", or the relative's flow writing straight into
 * the tree in the demo browser). If this tab has never shown the tree, its baseline is the tree *before* the import, so
 * the /tree it opens next plays the arrival (ripple, toast, NEW) instead of counting the new answers as already seen.
 * An existing baseline is left alone.
 */
export function seedArrivalBaseline(tree: FamilyTree) {
  if (readSeen(tree.id)) return;
  writeSeen(tree.id, new Set(tree.reports.map((r) => r.id)));
}

const fromRelative = (r: Report) => r.reportedById !== "self" && r.source !== "patient";

function bodyFor(r: Report, nameOf: (id: string) => string): string {
  const aboutSelf = r.reportedById === r.personId;
  const fact =
    r.kind === "condition"
      ? `${formatCondition(r)}${r.source === "record" ? ", from a portal record (demo)" : ""}`
      : r.kind === "no-history"
        ? "No heart history"
        : r.kind === "declined"
          ? "Chose not to share"
          : "Doesn’t know";
  return aboutSelf ? fact : `About ${nameOf(r.personId)}: ${fact.charAt(0).toLowerCase()}${fact.slice(1)}`;
}

export interface Arrivals {
  /** People whose node should ripple (the subjects of the new answers). */
  people: Set<string>;
  /** Report ids that get a "New" tag in the activity timeline. */
  reports: Set<string>;
}

const EMPTY: Arrivals = { people: new Set(), reports: new Set() };

export function useArrivals(tree: FamilyTree, onView: (personId: string) => void) {
  const [arrivals, setArrivals] = useState<Arrivals>(EMPTY);
  const seen = useRef<{ treeId: string; ids: Set<string> } | null>(null);
  const viewRef = useRef(onView);
  useLayoutEffect(() => {
    viewRef.current = onView;
  });

  useEffect(() => {
    const check = () => {
      const t = getTree();
      if (!seen.current || seen.current.treeId !== t.id) {
        const stored = readSeen(t.id);
        if (!stored) {
          // first look at this tree in this tab: everything already here counts as seen
          seen.current = { treeId: t.id, ids: new Set(t.reports.map((r) => r.id)) };
          writeSeen(t.id, seen.current.ids);
          setArrivals(EMPTY);
          return;
        }
        seen.current = { treeId: t.id, ids: stored };
      }
      const ids = seen.current.ids;
      const fresh = t.reports.filter((r) => !ids.has(r.id));
      if (!fresh.length) return;
      fresh.forEach((r) => ids.add(r.id));
      writeSeen(t.id, ids);
      const incoming = fresh.filter(fromRelative);
      if (!incoming.length) return;

      setArrivals((a) => ({
        people: new Set([...a.people, ...incoming.map((r) => r.personId)]),
        reports: new Set([...a.reports, ...incoming.map((r) => r.id)]),
      }));
      const nameOf = (id: string) => t.people.find((p) => p.id === id)?.label ?? "Someone";
      const byReporter = new Map<string, Report[]>();
      for (const r of incoming) byReporter.set(r.reportedBy, [...(byReporter.get(r.reportedBy) ?? []), r]);
      for (const [who, list] of byReporter) {
        const lead = list.find((r) => r.reportedById === r.personId) ?? list[0];
        const more = list.length - 1;
        toast({
          title: `${who} answered`,
          body: `${bodyFor(lead, nameOf)}${more ? ` · and ${more} more` : ""}`,
          tone: "brand",
          action: { label: "View", onClick: () => viewRef.current(lead.personId) },
        });
      }
    };
    const raf = requestAnimationFrame(check);
    const onStorage = (e: StorageEvent) => {
      if (e.key === TREE_KEY || e.key === null) requestAnimationFrame(check);
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Local changes (the patient's own answers, a reset) are folded into "seen" so they never toast later.
  useEffect(() => {
    const s = seen.current;
    if (!s || s.treeId !== tree.id) return;
    let changed = false;
    for (const r of tree.reports) {
      if (!s.ids.has(r.id) && !fromRelative(r)) {
        s.ids.add(r.id);
        changed = true;
      }
    }
    if (changed) writeSeen(tree.id, s.ids);
  }, [tree]);

  /** Opening a person counts as seeing their arrival (their NEW tag and ripple go). */
  const markSeen = (personId: string) =>
    setArrivals((a) => {
      if (!a.people.has(personId)) return a;
      const people = new Set(a.people);
      people.delete(personId);
      return { ...a, people };
    });

  return { arrivals, markSeen };
}
