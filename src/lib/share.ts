// Invite and reply links carry their data in the URL fragment (#...), which browsers
// never send to a server. The relative's answers travel back the same way.

import type { FamilyTree, Person, Relation, Report } from "./types";

export interface InvitePayload {
  v: 1;
  /** Tree id the answers belong to. */
  t: string;
  /** Patient's first name. */
  n: string;
  /** Invited person id + how the patient labels them. */
  p: string;
  l: string;
  r: Relation;
  /** Visit context shown to the relative. */
  s?: string;
  /** Other relatives the invitee can speak about: id, label from the invitee's point of view. */
  a: { id: string; l: string }[];
  /** Random id of the patient's browser, so the demo can tell "same browser" apart from another device. */
  d?: string;
}

export interface ReplyPayload {
  v: 1;
  t: string;
  /** Who answered (person id + label). */
  p: string;
  b: string;
  at: string;
  reports: Omit<Report, "id">[];
}

function toBase64Url(text: string) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodePayload(obj: unknown): string {
  return toBase64Url(JSON.stringify(obj));
}

export function decodePayload<T>(hash: string): T | null {
  try {
    const clean = hash.replace(/^#/, "");
    if (!clean) return null;
    return JSON.parse(fromBase64Url(clean)) as T;
  } catch {
    return null;
  }
}

/** How an invitee would describe each other relation (from their point of view). */
const ROLE: Partial<Record<Relation, Partial<Record<Relation, string>>>> = {
  "paternal-aunt-uncle": {
    father: "your sibling",
    "paternal-grandfather": "your father",
    "paternal-grandmother": "your mother",
    "paternal-aunt-uncle": "your sibling",
  },
  "maternal-aunt-uncle": {
    mother: "your sibling",
    "maternal-grandfather": "your father",
    "maternal-grandmother": "your mother",
    "maternal-aunt-uncle": "your sibling",
  },
  father: {
    "paternal-grandfather": "your father",
    "paternal-grandmother": "your mother",
    "paternal-aunt-uncle": "your sibling",
    mother: "{pn}'s mother",
  },
  mother: {
    "maternal-grandfather": "your father",
    "maternal-grandmother": "your mother",
    "maternal-aunt-uncle": "your sibling",
    father: "{pn}'s father",
  },
  "paternal-grandfather": { father: "your child", "paternal-aunt-uncle": "your child", "paternal-grandmother": "your spouse" },
  "paternal-grandmother": { father: "your child", "paternal-aunt-uncle": "your child", "paternal-grandfather": "your spouse" },
  "maternal-grandfather": { mother: "your child", "maternal-aunt-uncle": "your child", "maternal-grandmother": "your spouse" },
  "maternal-grandmother": { mother: "your child", "maternal-aunt-uncle": "your child", "maternal-grandfather": "your spouse" },
  sibling: {
    father: "your father",
    mother: "your mother",
    sibling: "your sibling",
    "paternal-grandfather": "your grandfather",
    "paternal-grandmother": "your grandmother",
    "maternal-grandfather": "your grandfather",
    "maternal-grandmother": "your grandmother",
    "paternal-aunt-uncle": "your aunt or uncle",
    "maternal-aunt-uncle": "your aunt or uncle",
  },
};

/** How the invited relative would describe another person in the tree. */
export function labelFor(invitee: Relation, other: Person, patientName: string): string {
  const role = ROLE[invitee]?.[other.relation]?.replace("{pn}", patientName);
  return role ? `${other.label} (${role})` : other.label;
}

/** People an invitee is likely to know about: anyone they have a direct family role to. */
export function askAbout(tree: FamilyTree, invitee: Person): { id: string; l: string }[] {
  const roles = ROLE[invitee.relation] ?? {};
  return tree.people
    .filter((p) => p.id !== invitee.id && p.relation !== "self" && roles[p.relation] !== undefined)
    .map((p) => ({ id: p.id, l: labelFor(invitee.relation, p, tree.patientName) }));
}

export function buildInvite(tree: FamilyTree, person: Person, device?: string | null): InvitePayload {
  return {
    v: 1,
    t: tree.id,
    n: tree.patientName,
    p: person.id,
    l: person.label,
    r: person.relation,
    s: tree.visit ? `${tree.visit.specialty.toLowerCase()} visit` : undefined,
    a: askAbout(tree, person),
    d: device ?? undefined,
  };
}

export function inviteUrl(origin: string, payload: InvitePayload) {
  return `${origin}/invite#${encodePayload(payload)}`;
}

export function replyUrl(origin: string, payload: ReplyPayload) {
  return `${origin}/reply#${encodePayload(payload)}`;
}
