"use client";

// Local-first store: the tree lives only in this browser (localStorage).
// Nothing about a family is sent to our servers in the prototype.

import { useSyncExternalStore } from "react";
import { blankTree, demoTree } from "./demo";
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
      cache = JSON.parse(raw) as FamilyTree;
      cacheRaw = raw;
      return cache;
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

const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export const actions = {
  loadDemo() {
    write(demoTree());
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
  addReports(reports: Omit<Report, "id">[]) {
    const t = read();
    const known = new Set(t.people.map((p) => p.id));
    const withIds = reports.filter((r) => known.has(r.personId)).map((r) => ({ ...r, id: uid("r") }));
    write({ ...t, reports: [...t.reports, ...withIds], reviewedAt: undefined });
    return withIds.length;
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
