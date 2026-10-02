"use client";

// Local-first store: the tree lives only in this browser (localStorage).
// Nothing about a family is sent to our servers in the prototype.

import { useSyncExternalStore } from "react";
import { blankTree, demoTree } from "./demo";
import { cleanReport, cleanTree } from "./sanitize";
import { askAbout, type ReplyPayload } from "./share";
import type { FamilyTree, Invite, Person, Relation, Report } from "./types";

const KEY = "fht:tree:v1";
const listeners = new Set<() => void>();
let cache: FamilyTree | null = null;
let cacheRaw: string | null = null;

function read(): FamilyTree {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (raw && raw === cacheRaw && cache) return cache;
  if (raw) {
    try {
      const clean = cleanTree(JSON.parse(raw));
      if (clean) {
        cache = clean;
        cacheRaw = raw;
        return cache;
      }
    } catch {
      // fall through to demo
    }
  }
  if (!cache) cache = demoTree();
  return cache;
}

function write(tree: FamilyTree) {
  const next = { ...tree, updatedAt: new Date().toISOString() };
  cache = next;
  try {
    cacheRaw = JSON.stringify(next);
    window.localStorage.setItem(KEY, cacheRaw);
  } catch {
    cacheRaw = null;
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cacheRaw = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const SERVER_SNAPSHOT = demoTree();

export function useTree(): FamilyTree {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
}

export function getTree(): FamilyTree {
  return read();
}

/** True only when this browser actually saved a tree (not the in-memory demo fallback). */
export function hasSavedTree(): boolean {
  try {
    return window.localStorage.getItem(KEY) != null;
  } catch {
    return false;
  }
}

const DEVICE_KEY = "fht:device";

/** A random per-browser id, used to tell whether an invite is opened in the patient's own browser. */
export function deviceId(): string | null {
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `d-${crypto.randomUUID()}`;
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

export type ImportResult = { added: number; error?: "different-tree" | "not-invited" };

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const actions = {
  loadDemo() {
    write(demoTree());
  },
  /** Remove everything this app stored in this browser, then fall back to the demo. */
  clearAll() {
    for (const store of [window.localStorage, window.sessionStorage]) {
      try {
        Object.keys(store)
          .filter((k) => k.startsWith("fht:") || k === "SMART_KEY")
          .forEach((k) => store.removeItem(k));
      } catch {
        /* storage unavailable */
      }
    }
    cache = null;
    cacheRaw = null;
    listeners.forEach((l) => l());
  },
  startBlank(name: string) {
    write(blankTree(name.trim() || "You"));
  },
  setVisit(visit: FamilyTree["visit"]) {
    write({ ...read(), visit, reviewedAt: undefined });
  },
  setPatientName(name: string) {
    const t = read();
    write({
      ...t,
      patientName: name,
      people: t.people.map((p) => (p.relation === "self" ? { ...p, label: `${name} (you)` } : p)),
    });
  },
  addPerson(relation: Relation, label: string, sex: Person["sex"]) {
    const t = read();
    const person: Person = { id: uid("p"), relation, label, sex };
    write({ ...t, people: [...t.people, person], reviewedAt: undefined });
    return person.id;
  },
  updatePerson(id: string, patch: Partial<Person>) {
    const t = read();
    write({ ...t, people: t.people.map((p) => (p.id === id ? { ...p, ...patch, id } : p)), reviewedAt: undefined });
  },
  removePerson(id: string) {
    const t = read();
    const p = t.people.find((x) => x.id === id);
    if (!p || ["self", "mother", "father"].includes(p.relation)) return;
    write({
      ...t,
      people: t.people.filter((x) => x.id !== id),
      reports: t.reports.filter((r) => r.personId !== id),
      invites: t.invites.filter((i) => i.personId !== id),
      reviewedAt: undefined,
    });
  },
  /** Reports the patient enters themself (about a relative, or about their own history). */
  addReports(reports: Omit<Report, "id">[]) {
    const t = read();
    const known = new Set(t.people.map((p) => p.id));
    const withIds = reports
      .map(cleanReport)
      .filter((r): r is Omit<Report, "id"> => !!r && known.has(r.personId))
      .map((r) => ({ ...r, id: uid("r") }));
    write({ ...t, reports: [...t.reports, ...withIds], reviewedAt: undefined });
    return withIds.length;
  },
  /**
   * A relative's answers, from a reply link or the same-browser demo. Only an invited person can
   * reply, only about themself and the relatives they were asked about. Their newest answers about
   * a person replace their older ones.
   */
  importReply(reply: ReplyPayload): ImportResult {
    const t = read();
    if (reply.t !== t.id) return { added: 0, error: "different-tree" };
    const invitee = t.people.find((p) => p.id === reply.p);
    if (!invitee || !t.invites.some((i) => i.personId === invitee.id)) return { added: 0, error: "not-invited" };
    const allowed = new Set([invitee.id, ...askAbout(t, invitee).map((a) => a.id)]);
    const at = new Date().toISOString();
    const incoming = (Array.isArray(reply.reports) ? reply.reports : [])
      .map(cleanReport)
      .filter((r): r is Omit<Report, "id"> => !!r && allowed.has(r.personId))
      .flatMap((r): Omit<Report, "id">[] => {
        const aboutSelf = r.personId === invitee.id;
        if (!aboutSelf && r.kind === "declined") return []; // only the person themself can decline
        const source = aboutSelf ? (r.source === "record" && r.record ? "record" : "self") : "relative";
        return [{ ...r, source, record: source === "record" ? r.record : undefined, reportedBy: invitee.label, reportedById: invitee.id, reportedAt: at }];
      });
    const touched = new Set(incoming.map((r) => r.personId));
    const kept = t.reports.filter((r) => !(r.reportedById === invitee.id && r.source !== "patient" && touched.has(r.personId)));
    write({
      ...t,
      reports: [...kept, ...incoming.map((r) => ({ ...r, id: uid("r") }))],
      invites: t.invites.map((i) => (i.personId === invitee.id && !i.answeredAt ? { ...i, answeredAt: at } : i)),
      reviewedAt: undefined,
    });
    return { added: incoming.length };
  },
  removeReport(id: string) {
    const t = read();
    write({ ...t, reports: t.reports.filter((r) => r.id !== id), reviewedAt: undefined });
  },
  createInvite(personId: string): Invite {
    const t = read();
    const existing = t.invites.find((i) => i.personId === personId && !i.answeredAt);
    if (existing) return existing;
    const invite: Invite = { id: uid("i"), personId, token: uid("tok"), createdAt: new Date().toISOString() };
    write({ ...t, invites: [...t.invites, invite] });
    return invite;
  },
  markInviteAnswered(personId: string) {
    const t = read();
    write({
      ...t,
      invites: t.invites.map((i) => (i.personId === personId && !i.answeredAt ? { ...i, answeredAt: new Date().toISOString() } : i)),
    });
  },
  markReviewed(reviewed: boolean) {
    write({ ...read(), reviewedAt: reviewed ? new Date().toISOString() : undefined });
  },
  markShared() {
    write({ ...read(), sharedAt: new Date().toISOString() });
  },
};
