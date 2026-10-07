// Pure, framework-free story model for the hero scene. No three.js and no DOM here, so it runs in node --test and is
// built on the SERVER (the landing page passes it to HeroStage as plain JSON, so src/lib never ships for the hero).
// Statuses are never hand-written: every keyframe re-runs the product's own viewTree() on the reports known at that
// moment, so the animation cannot drift from the app.

import type { FamilyTree, Person, Report, Status } from "../../lib/types";
import { formatCondition, viewTree } from "../../lib/status";
import { layoutTree, NODE_H, NODE_W } from "../../lib/layout";
import { CLEAR } from "./clearing-constants";

export type Shape = "circle" | "square" | "diamond"; // NSGC pedigree: female, male, sex unknown
export type NodeState = Status | "pending"; // pending = slot exists, nobody asked yet

export interface SceneNode {
  id: string;
  label: string;
  /** Short name for narrow screens ("Ray" for "Grandpa Ray"); the full label stays the accessible name. */
  short: string;
  /** Name without "(you)", for sentences ("Open Alex in the demo"). */
  name: string;
  shape: Shape;
  gen: 0 | 1 | 2;
  /** World units. x: paternal left, maternal right (pedigree convention). y: up. */
  pos: [number, number, number];
  deceased: boolean;
  isSelf: boolean;
}

export type Vec3 = [number, number, number];

export interface SceneLink {
  /** Quadratic Bezier: a -> b with control point ctrl. a is the end nearer to "you" (growth starts there). */
  a: Vec3;
  ctrl: Vec3;
  b: Vec3;
  /** descent: child up to its parents' union knot. couple: union knot out to one parent. */
  kind: "descent" | "couple";
  /** 0..1 order in which the skeleton grows (mother's side first, as in the app). */
  delay: number;
  /** People this filament belongs to, for hover/focus highlighting. */
  people: string[];
}

export interface Pulse {
  from: string | "record"; // "record" = off-stage patient portal (SMART sandbox in the demo)
  to: string;
  kind: "invite" | "report" | "record" | "self";
  /** Story time (seconds) at which the pulse leaves and arrives. */
  start: number;
  end: number;
}

export interface Keyframe {
  at: number; // story time (s) when these states take effect
  states: Record<string, NodeState>;
  /** Story time at which each node last changed state (drives the arrival ripple, also when scrubbing). */
  changedAt: Record<string, number>;
  headlines: Record<string, string>;
  fromRecord: Record<string, boolean>;
  /** Heart condition reported (NSGC "affected": the glyph core fills). Same rule as PedigreeGlyph and the tree. */
  finding: Record<string, boolean>;
  caption: string; // DOM caption, also used for the reduced-motion step list
  /** Whose state this keyframe changed (the caption's glyph); null for the opening fog. */
  subject: string | null;
}

/** One line on a relative's receipt card: who said what, and how they know. */
export interface ReceiptEntry {
  personId: string;
  /** First keyframe in which this answer is known. */
  k: number;
  /** Who said it ("Mom", "Uncle Dev"). */
  who: string;
  /** What they said ("Heart attack, age 60", "No heart history", "Chose not to share"). */
  text: string;
  /** Their own words, if any. */
  note?: string;
  /** For SourceChip: self-reported, told by a relative, or from a portal record. */
  source: "self" | "relative" | "patient" | "record";
  /** ISO date for the chip (the report date; for a portal record, the date it went on the problem list). */
  date: string;
  /** Portal records: the year it went on the problem list. */
  since?: string;
}

export interface Chapter {
  id: "build" | "invite" | "answers" | "page";
  /** Segmented-control label. */
  label: string;
  title: string;
  body: string;
  /** Story seconds. */
  from: number;
  to: number;
}

export interface StoryModel {
  nodes: SceneNode[];
  links: SceneLink[];
  pulses: Pulse[];
  keyframes: Keyframe[];
  receipts: ReceiptEntry[];
  patientName: string;
  /** Captions for the beats before the first answer lands (keyframe 0). */
  phaseCaptions: { fog: string; grow: string; invite: string };
  /** "OCT 14" style visit date, if the tree has one. */
  visit: { specialty: string; date: string } | null;
  /** Story time markers (seconds). */
  t: { condense: [number, number]; grow: [number, number]; invite: [number, number]; answers: [number, number]; summary: [number, number]; end: number };
}

const SCALE = 1 / 105; // layout px -> world units
/** World-space box that the camera and the SVG poster both fit ("meet") to the plate. */
export const VIEW = { x: -4.6, y: -2.1, w: 9.2, h: 4.6 } as const; // 2:1; a little more room below for the labels
/** World-space point at the centre of VIEW (SVG y runs down, world y up). The camera aims here. */
export const VIEW_CENTER = { x: VIEW.x + VIEW.w / 2, y: -(VIEW.y + VIEW.h / 2) } as const;
/** How much room each relative's label has at a given plate: full names from ~58 px per world unit (relatives sit
 *  2 units apart), status lines from ~80. */
export function labelDensity(plate: { pw: number; ph: number }, w: number, h: number): { names: boolean; states: boolean } {
  const plateW = Math.min((plate.pw / 100) * w, (plate.ph / 100) * h * (VIEW.w / VIEW.h));
  const ppu = plateW / VIEW.w;
  return { names: ppu >= 58, states: ppu >= 80 };
}
/** A world position as fractions of VIEW from its centre (x right, y down): the poster and the DOM labels use these. */
export function viewFraction(pos: readonly [number, number, number]): { x: number; y: number } {
  return { x: (pos[0] - VIEW_CENTER.x) / VIEW.w, y: (VIEW_CENTER.y - pos[1]) / VIEW.h };
}

function shapeOf(p: Person): Shape {
  return p.sex === "female" ? "circle" : p.sex === "male" ? "square" : "diamond";
}

function genOf(p: Person): 0 | 1 | 2 {
  if (p.relation === "self" || p.relation === "sibling") return 2;
  if (p.relation.includes("grand")) return 0;
  return 1;
}

const DEPTH: Record<0 | 1 | 2, number> = { 0: -1.6, 1: 0, 2: 1.2 };

function receiptFor(r: Report, k: number): ReceiptEntry {
  const who = r.reportedBy;
  const base = { personId: r.personId, k, who, note: r.note };
  if (r.kind === "declined") return { ...base, text: "Chose not to share", source: "self", date: r.reportedAt };
  if (r.kind === "dont-know") return { ...base, text: "Doesn’t know", source: r.source === "patient" ? "patient" : "relative", date: r.reportedAt };
  if (r.kind === "no-history") return { ...base, text: "No heart history", source: r.source === "self" ? "self" : r.source === "patient" ? "patient" : "relative", date: r.reportedAt };
  if (r.source === "record") {
    const since = r.record?.recordedDate?.slice(0, 4);
    return { ...base, who: `${who}’s portal record`, text: formatCondition(r), source: "record", date: r.record?.recordedDate ?? r.reportedAt, since };
  }
  const source = r.source === "self" || r.reportedById === r.personId ? "self" : r.source === "patient" ? "patient" : "relative";
  return { ...base, text: formatCondition(r), source, date: r.reportedAt };
}

export function buildStory(tree: FamilyTree): StoryModel {
  const layout = layoutTree(tree.people);
  const byId = new Map(tree.people.map((p) => [p.id, p]));
  const cx = layout.width / 2;
  const cy = (Math.max(...layout.nodes.map((n) => n.y)) + NODE_H) / 2;

  const nodes: SceneNode[] = layout.nodes.map((n, i) => {
    const p = byId.get(n.id)!;
    const gen = genOf(p);
    const x = (n.x + NODE_W / 2 - cx) * SCALE;
    const y = -(n.y + NODE_H / 2 - cy) * SCALE;
    // Slight alternating depth so pointer parallax reveals the 3D structure.
    const z = DEPTH[gen] + (i % 2 ? 0.35 : -0.35) * (gen === 2 ? 0 : 1);
    const name = p.label.replace(/\s*\(you\)$/, "");
    const short = name.replace(/^(Grandpa|Grandma|Grandmother|Grandfather|Uncle|Aunt)\s+/i, "");
    return { id: p.id, label: p.label, short, name, shape: shapeOf(p), gen, pos: [x, y, z], deceased: !!p.deceased, isSelf: p.relation === "self" };
  });

  const rel = (r: Person["relation"]) => tree.people.filter((p) => p.relation === r).map((p) => p.id);
  const at = new Map(nodes.map((n) => [n.id, n.pos]));
  const links: SceneLink[] = [];
  // Pedigree-style unions: children hang from a knot on their parents' couple line, so siblings
  // (Dad and Uncle Dev) never cross each other's filaments.
  // Trim filament ends by the glyph radius so light never runs through a node.
  const trim = (p: Vec3, toward: Vec3, r = 0.26): Vec3 => {
    const d = [toward[0] - p[0], toward[1] - p[1], toward[2] - p[2]];
    const len = Math.hypot(d[0], d[1], d[2]) || 1;
    return [p[0] + (d[0] / len) * r, p[1] + (d[1] / len) * r, p[2] + (d[2] / len) * r];
  };
  const family = (childIds: string[], p: string | undefined, q: string | undefined, delay: number) => {
    const pp = p ? at.get(p) : undefined,
      qq = q ? at.get(q) : undefined;
    if ((!pp && !qq) || childIds.length === 0) return; // no children: no knot, no duplicate couple line
    const a = pp ?? qq!,
      b = qq ?? pp!;
    const knot: Vec3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - 0.12, (a[2] + b[2]) / 2];
    childIds.forEach((c, i) => {
      const cp = at.get(c);
      if (!cp) return;
      const ctrl: Vec3 = [cp[0], knot[1] - 0.05, (cp[2] + knot[2]) / 2]; // rounded elbow, like a pedigree drop line
      links.push({ a: trim(cp, ctrl), ctrl, b: knot, kind: "descent", delay: delay + i * 0.12, people: [c, ...([p, q].filter(Boolean) as string[])] });
    });
    for (const [id, pos] of [
      [p, pp],
      [q, qq],
    ] as const) {
      if (!id || !pos) continue;
      const ctrl: Vec3 = [(knot[0] + pos[0]) / 2, (knot[1] + pos[1]) / 2 + 0.1, (knot[2] + pos[2]) / 2];
      links.push({ a: knot, ctrl, b: trim(pos, ctrl), kind: "couple", delay: delay + 0.1, people: [id] });
    }
  };
  // Mother's side first ("Let's start with your mother's side"), then father's.
  family(rel("self"), rel("mother")[0], rel("father")[0], 0.0);
  family(rel("mother"), rel("maternal-grandfather")[0], rel("maternal-grandmother")[0], 0.25);
  family(rel("maternal-aunt-uncle"), rel("maternal-grandfather")[0], rel("maternal-grandmother")[0], 0.35);
  family([...rel("father"), ...rel("paternal-aunt-uncle")], rel("paternal-grandfather")[0], rel("paternal-grandmother")[0], 0.5);
  const self = rel("self")[0];

  // Timeline (seconds). Autoplay stops at answers[1] + 0.2; the summary is reached only by scrolling or the chapter control.
  const t = { condense: [0.4, 2.6], grow: [1.2, 3.2], invite: [3.0, 4.4], answers: [4.6, 9.4], summary: [10, 11.5], end: 11.5 } as StoryModel["t"];

  const pulses: Pulse[] = tree.invites.map((inv, i) => ({ from: self, to: inv.personId, kind: "invite", start: t.invite[0] + i * 0.25, end: t.invite[0] + i * 0.25 + 0.9 }));

  // One keyframe per report, in the order they were actually reported.
  const reports = [...tree.reports].sort((a, b) => a.reportedAt.localeCompare(b.reportedAt));
  const span = t.answers[1] - t.answers[0];
  const step = span / Math.max(reports.length, 1);
  const keyframes: Keyframe[] = [];
  const receipts: ReceiptEntry[] = [];

  const snapshot = (at: number, cutoff: string | null, caption: string, subject: string | null): Keyframe => {
    const visible = cutoff ? tree.reports.filter((r) => r.reportedAt <= cutoff) : [];
    const views = viewTree({ ...tree, reports: visible });
    const states: Record<string, NodeState> = {};
    const headlines: Record<string, string> = {};
    const fromRecord: Record<string, boolean> = {};
    const finding: Record<string, boolean> = {};
    for (const v of views) {
      const asked = visible.some((r) => r.personId === v.person.id);
      states[v.person.id] = v.person.relation === "self" ? "known" : asked ? v.status : "pending";
      headlines[v.person.id] = v.headline;
      fromRecord[v.person.id] = v.verified;
      finding[v.person.id] = asked && v.cardiac && v.status !== "declined";
    }
    const prev = keyframes[keyframes.length - 1];
    const changedAt: Record<string, number> = {};
    for (const id of Object.keys(states)) changedAt[id] = prev && prev.states[id] !== states[id] ? at : (prev?.changedAt[id] ?? -10);
    return { at, states, changedAt, headlines, fromRecord, finding, caption, subject };
  };

  keyframes.push(snapshot(0, null, "“Heart problems run in the family.” Nobody knows who, what, or when.", null));
  reports.forEach((r, i) => {
    const leave = t.answers[0] + i * step;
    const arrive = leave + Math.min(0.9, step * 0.9);
    const kind: Pulse["kind"] = r.source === "record" ? "record" : r.reportedById === r.personId || r.source === "self" ? "self" : "report";
    const from = kind === "record" ? "record" : (r.reportedById ?? r.personId);
    pulses.push({ from, to: r.personId, kind, start: leave, end: arrive });
    const who = byId.get(r.personId)?.label ?? "Someone";
    const reporter = r.reportedById ? byId.get(r.reportedById) : undefined;
    const self_ = reporter?.sex === "female" ? "herself" : reporter?.sex === "male" ? "himself" : "themself";
    const their = reporter?.sex === "female" ? "her" : reporter?.sex === "male" ? "his" : "their";
    const caption =
      r.kind === "declined"
        ? `${who} chose not to share. That choice is kept.`
        : r.kind === "dont-know"
          ? `${r.reportedBy} doesn’t know about ${who}. The gap stays visible.`
          : r.source === "record"
            ? `${r.reportedBy} shares one fact from ${their} own patient portal (demo sandbox).`
            : r.personId === r.reportedById
              ? `${r.reportedBy} answers for ${self_}.`
              : `${r.reportedBy} answers about ${who}.`;
    keyframes.push(snapshot(arrive, r.reportedAt, caption, r.personId));
    receipts.push(receiptFor(r, keyframes.length - 1));
  });

  const visit = tree.visit
    ? { specialty: tree.visit.specialty, date: new Date(`${tree.visit.date}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) }
    : null;
  const invited = tree.invites.map((i) => byId.get(i.personId)?.label).filter(Boolean) as string[];
  const list = invited.length > 1 ? `${invited.slice(0, -1).join(", ")} and ${invited.at(-1)}` : (invited[0] ?? "relatives");
  const phaseCaptions = {
    fog: keyframes[0].caption,
    grow: "Mother’s side first: a slot for every parent and grandparent, before anyone answers.",
    invite: `One text link each to ${list}. The text carries no health information.`,
  };
  return { nodes, links, pulses, keyframes, receipts, patientName: tree.patientName, phaseCaptions, visit, t };
}

/** Index of the keyframe in effect at story time s (binary search not needed: < 10 frames). */
export function keyframeAt(model: StoryModel, s: number): number {
  let k = 0;
  for (let i = 0; i < model.keyframes.length; i++) if (model.keyframes[i].at <= s) k = i;
  return k;
}

/** The four chapters of the story (DESIGN §8.2). Each gets an equal share of scroll distance. */
export function chapters(model: StoryModel): readonly Chapter[] {
  const { t } = model;
  return [
    {
      id: "build",
      label: "Build",
      title: "Start with your mother’s side.",
      body: "Fixed slots for parents and grandparents, so nobody lands on the wrong side of the family.",
      from: 0,
      to: t.grow[1],
    },
    {
      id: "invite",
      label: "Invite",
      title: "One text link per relative. No app, no account.",
      body: "The text itself carries no health information. Relatives answer for themselves, and they can say no.",
      from: t.grow[1],
      to: t.invite[1],
    },
    {
      id: "answers",
      label: "Answers",
      title: "Every answer keeps its source.",
      body: "Mom says heart attack at 60. Uncle Dev says angina at about 58. Both are kept, with names. Grandma June chose not to share, and that choice is kept.",
      from: t.invite[1],
      to: t.answers[1] + 0.2,
    },
    {
      id: "page",
      label: "Page",
      title: "Walk in with one page.",
      body: "Facts, gaps and questions for you. A separate care-team version for your cardiologist.",
      from: t.answers[1] + 0.2,
      to: t.end,
    },
  ] as const;
}

/** Map 0..1 progress to story seconds, piecewise so every chapter gets equal scroll. */
export function storyTimeFromProgress(model: StoryModel, p: number): number {
  const c = chapters(model);
  const x = Math.min(1, Math.max(0, p)) * c.length;
  const i = Math.min(c.length - 1, Math.floor(x));
  return c[i].from + (c[i].to - c[i].from) * (x - i);
}

/**
 * Pinned hero: scroll progress p → story seconds. 0 while the window expands (the finished tree dissolves back into
 * fog), chapters 1–3 over [expandEnd, storyEnd], chapter 4 (flatten) over [storyEnd, flattenEnd], then the end.
 */
export function storyFromClearing(model: StoryModel, p: number): number {
  const c = chapters(model);
  if (p <= CLEAR.expandEnd) return 0;
  if (p < CLEAR.storyEnd) {
    const x = ((p - CLEAR.expandEnd) / (CLEAR.storyEnd - CLEAR.expandEnd)) * 3,
      i = Math.min(2, Math.floor(x));
    return c[i].from + (c[i].to - c[i].from) * (x - i);
  }
  const x = Math.min(1, (p - CLEAR.storyEnd) / (CLEAR.flattenEnd - CLEAR.storyEnd));
  return c[3].from + (c[3].to - c[3].from) * x;
}

export type Phase = "fog" | "grow" | "invite" | "answers" | "summary";
export function phaseAt(model: StoryModel, s: number): Phase {
  const { t } = model;
  return s < t.grow[0] ? "fog" : s < t.invite[0] ? "grow" : s < t.answers[0] ? "invite" : s < t.summary[0] ? "answers" : "summary";
}

/** Receipt lines known about a person at keyframe k. */
export function receiptsAt(model: StoryModel, id: string, k: number): ReceiptEntry[] {
  return model.receipts.filter((r) => r.personId === id && r.k <= k);
}

export const STATUS_CODE: Record<NodeState | "self", number> = { known: 0, conflicting: 1, unknown: 2, declined: 3, pending: 4, self: 5 };
export const SHAPE_CODE: Record<Shape, number> = { circle: 0, square: 1, diamond: 2 };
