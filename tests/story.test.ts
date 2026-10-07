// Hero story model and the Clearing's scroll mapping (DESIGN §9.5). Run: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { demoTree } from "../src/lib/demo";
import { viewTree } from "../src/lib/status";
import { CHAPTER_COLUMN, CLEAR, clearingBootScript, frameAt, PLATE_SHEET, PLATE_STAGE, slotGeometry, stagePlateFor } from "../src/components/hero/clearing-constants";
import { BEAM } from "../src/components/hero/OneFactBeam";
import { receiptLink, receiptText } from "../src/components/hero/ReceiptCard";
import { buildStory, chapters, keyframeAt, receiptsAt, storyFromClearing, storyTimeFromProgress, VIEW } from "../src/components/hero/story";

const tree = demoTree();
const model = buildStory(tree);

// ---------- D3's five ----------

test("final keyframe matches the product's own status logic", () => {
  const last = model.keyframes.at(-1)!;
  for (const v of viewTree(tree)) {
    const asked = tree.reports.some((r) => r.personId === v.person.id);
    const expected = v.person.relation === "self" ? "known" : asked ? v.status : "pending";
    assert.equal(last.states[v.person.id], expected, v.person.label);
  }
  assert.equal(last.states.dad, "conflicting");
  assert.equal(last.states.pgm, "declined");
  assert.equal(last.states.mgf, "pending"); // Grandpa Luis: nobody asked
  assert.equal(last.fromRecord.dev, true);
});

test("Dad is known after Mom answers, then conflicting once Uncle Dev disagrees", () => {
  const seq = model.keyframes.map((k) => k.states.dad);
  const firstKnown = seq.indexOf("known");
  const firstConflict = seq.indexOf("conflicting");
  assert.ok(firstKnown > 0 && firstConflict > firstKnown, seq.join(","));
});

test("scroll mapping is monotonic and covers the whole story", () => {
  let prev = -1;
  for (let p = 0; p <= 1.0001; p += 0.01) {
    const s = storyTimeFromProgress(model, p);
    assert.ok(s >= prev - 1e-9);
    prev = s;
  }
  assert.equal(storyTimeFromProgress(model, 0), 0);
  assert.equal(storyTimeFromProgress(model, 1), model.t.end);
  assert.equal(keyframeAt(model, model.t.end), model.keyframes.length - 1);
});

test("every relative fits inside the poster/camera box with label room", () => {
  for (const n of model.nodes) {
    assert.ok(Math.abs(n.pos[0]) < VIEW.w / 2 - 0.4, `${n.label} x=${n.pos[0]}`);
    assert.ok(Math.abs(n.pos[1]) < VIEW.h / 2 - 0.5, `${n.label} y=${n.pos[1]}`);
  }
});

test("no duplicate filaments", () => {
  const keys = model.links.map((l) => [...l.a, ...l.b].map((v) => v.toFixed(3)).join(","));
  assert.equal(new Set(keys).size, keys.length);
  assert.equal(model.links.length, 10); // 4 descents + 6 couple half-lines for the demo family
});

// ---------- §9.5: the four new ones ----------

test("the final finding set is {dad, dev, mgm} and equals viewTree() filtered by cardiac && not declined", () => {
  const last = model.keyframes.at(-1)!;
  const finding = Object.keys(last.finding).filter((id) => last.finding[id]).sort();
  assert.deepEqual(finding, ["dad", "dev", "mgm"]);
  const expected = viewTree(tree)
    .filter((v) => v.cardiac && v.status !== "declined")
    .map((v) => v.person.id)
    .sort();
  assert.deepEqual(finding, expected);
  assert.equal(last.finding.mom, false, "Mom is a hollow known ring: no heart history");
  assert.equal(model.keyframes[0].finding.dad, false, "nothing is filled before anyone answers");
});

test("storyFromClearing is 0 until the window has expanded, nondecreasing, and ends the story at the flatten", () => {
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000;
    if (p <= CLEAR.expandEnd) assert.equal(storyFromClearing(model, p), 0, `p=${p}`);
    if (p >= CLEAR.flattenEnd) assert.equal(storyFromClearing(model, p), model.t.end, `p=${p}`);
  }
  let prev = 0;
  for (let i = 140; i <= 900; i++) {
    const s = storyFromClearing(model, i / 1000);
    assert.ok(s >= prev - 1e-9, `p=${i / 1000} went back: ${s} < ${prev}`);
    prev = s;
  }
});

test("frameAt is continuous: no plate field jumps by more than 0.5 between p steps of 0.001", () => {
  // Slots measured at 1440×900 and 1024×768 (the smallest pinned viewport).
  for (const slot of [
    { cx: 71.5, cy: 47.2, pw: 33.2, ph: 30.9 },
    { cx: 73.4, cy: 47.6, pw: 36.1, ph: 27 },
  ]) {
    let prev = frameAt(0, slot);
    assert.deepEqual(prev.plate, slot, "p = 0 is exactly the slot");
    for (let i = 1; i <= 1000; i++) {
      const f = frameAt(i / 1000, slot);
      for (const k of ["cx", "cy", "pw", "ph"] as const) assert.ok(Math.abs(f.plate[k] - prev.plate[k]) <= 0.5, `p=${f.p} ${k}: ${prev.plate[k]} → ${f.plate[k]}`);
      prev = f;
    }
  }
  const slot = { cx: 71.5, cy: 47.2, pw: 33.2, ph: 30.9 };
  assert.deepEqual(frameAt(CLEAR.expandEnd, slot).plate, PLATE_STAGE);
  assert.deepEqual(frameAt(CLEAR.flattenEnd, slot).plate, PLATE_SHEET);
});

test("the fitted stage plate keeps every relative's label clear of the chapter card, at 1024 and 1440 px", () => {
  for (const [w, h] of [
    [1024, 768],
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ]) {
    const plate = stagePlateFor(w, h);
    const plateW = Math.min((plate.pw / 100) * w, (plate.ph / 100) * h * (VIEW.w / VIEW.h));
    const cx = (plate.cx / 100) * w;
    const xs = model.nodes.map((n) => cx + ((n.pos[0] - (VIEW.x + VIEW.w / 2)) / VIEW.w) * plateW);
    const cardRight = CHAPTER_COLUMN.left(w) + CHAPTER_COLUMN.width;
    assert.ok(Math.min(...xs) - 60 > cardRight, `${w}: leftmost label at ${Math.min(...xs) - 60} under the card (ends ${cardRight})`);
    assert.ok(Math.max(...xs) + 60 < w - 40, `${w}: rightmost label runs into the dots`);
    assert.ok(plate.pw <= PLATE_STAGE.pw + 1e-9);
    // and the glide from the slot stays continuous with the fitted plate
    let prev = frameAt(0, { cx: 72, cy: 47, pw: 33, ph: 31 }, plate);
    for (let i = 1; i <= 1000; i++) {
      const f = frameAt(i / 1000, { cx: 72, cy: 47, pw: 33, ph: 31 }, plate);
      for (const k of ["cx", "cy", "pw", "ph"] as const) assert.ok(Math.abs(f.plate[k] - prev.plate[k]) <= 0.5, `${w} p=${f.p} ${k}`);
      prev = f;
    }
  }
});

test("the chapter index is −1 outside [0.14, 0.9], and 0..3 in order inside", () => {
  const slot = { cx: 74, cy: 46, pw: 34, ph: 36 };
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000;
    const c = frameAt(p, slot).chapter;
    if (p < CLEAR.expandEnd || p > CLEAR.flattenEnd) assert.equal(c, -1, `p=${p}`);
    else assert.ok(c >= 0 && c <= 3, `p=${p} → ${c}`);
  }
  const seen = [0.15, 0.4, 0.62, 0.86].map((p) => frameAt(p, slot).chapter);
  assert.deepEqual(seen, [0, 1, 2, 3]);
});

// ---------- extras: the copy and the data the hero shows ----------

test("chapter copy is the §8.2 deck, and chapters tile the story", () => {
  const c = chapters(model);
  assert.deepEqual(
    c.map((x) => x.title),
    ["Start with your mother’s side.", "One text link per relative. No app, no account.", "Every answer keeps its source.", "Walk in with one page."],
  );
  assert.equal(c[0].from, 0);
  for (let i = 1; i < c.length; i++) assert.equal(c[i].from, c[i - 1].to);
  assert.equal(c.at(-1)!.to, model.t.end);
  assert.match(c[1].body, /carries no health information/);
});

test("receipts keep who said it, and the hero never says “verified”", () => {
  const last = model.keyframes.length - 1;
  const dad = receiptsAt(model, "dad", last);
  assert.deepEqual(
    dad.map((r) => r.who),
    ["Mom", "Uncle Dev"],
  );
  const node = (id: string) => model.nodes.find((n) => n.id === id)!;
  const dadText = receiptText({ node: node("dad"), state: "conflicting", entries: dad });
  assert.match(dadText, /Dad\. Reports disagree\. Mom: heart attack, age 60\. Uncle Dev: angina, about age 58\. Both kept/);
  const dev = receiptsAt(model, "dev", last);
  assert.equal(dev[0].source, "record");
  assert.equal(dev[0].since, "2009");
  assert.match(receiptText({ node: node("dev"), state: "known", entries: dev }), /portal record: atrial fibrillation, age 34, on problem list since 2009/);
  // Before Uncle Dev answers, Dad's receipt has only Mom's line.
  const k = model.keyframes.findIndex((f) => f.states.dad === "known");
  assert.deepEqual(
    receiptsAt(model, "dad", k).map((r) => r.who),
    ["Mom"],
  );
  assert.equal(receiptLink(node("mgf"), "pending").href, "/tree?person=mgf&mode=invite");
  assert.equal(receiptLink(node("mgf"), "pending").text, "Ask Grandpa Luis");
  assert.equal(receiptLink(node("dad"), "conflicting").text, "Open Dad in the demo");
  // someone who passed away is never "asked", even before anyone has answered about them
  assert.equal(receiptLink(node("dad"), "pending").text, "Open Dad in the demo");
  assert.equal(receiptLink(node("dad"), "pending").href, "/tree?person=dad");
  assert.equal(receiptLink(node("pgf"), "pending").href, "/tree?person=pgf");
  const all = JSON.stringify(model) + model.nodes.map((n) => receiptText({ node: n, state: model.keyframes[last].states[n.id], entries: receiptsAt(model, n.id, last) })).join(" ");
  assert.doesNotMatch(all, /verified/i);
  assert.doesNotMatch(all, /risk/i);
});

test("the inline boot script computes exactly what slotGeometry() computes", () => {
  const stage = { left: 0, top: 0, width: 1440, height: 900 };
  const slot = { left: 744, top: 171, width: 572, height: 458 };
  const props = new Map<string, string>();
  const el = (r: typeof stage) => ({ getBoundingClientRect: () => ({ ...r, right: r.left + r.width, bottom: r.top + r.height }) });
  const html = { hasAttribute: () => true, style: { setProperty: (k: string, v: string) => props.set(k, v) } };
  runInNewContext(clearingBootScript("s", "o"), {
    document: { documentElement: html, getElementById: (id: string) => (id === "s" ? el(stage) : el(slot)) },
    matchMedia: () => ({ matches: true }),
    Math,
    String,
  });
  const g = slotGeometry(stage, slot);
  assert.equal(parseFloat(props.get("--hero-clip-t")!), g.clip.t);
  assert.equal(parseFloat(props.get("--hero-clip-r")!), g.clip.r);
  assert.equal(parseFloat(props.get("--hero-clip-b")!), g.clip.b);
  assert.equal(parseFloat(props.get("--hero-clip-l")!), g.clip.l);
  for (const k of ["cx", "cy", "pw", "ph"] as const) assert.ok(Math.abs(parseFloat(props.get(`--hero-${k}`)!) - g.plate[k]) < 1e-9, k);
});

test("OneFactBeam uses the demo family's names", () => {
  const labels = tree.people.map((p) => p.label);
  assert.ok(labels.includes(BEAM.relative));
  assert.equal(tree.patientName, BEAM.asker);
  assert.equal(model.keyframes.at(-1)!.states.mgf, "pending", "Grandpa Luis starts as not asked yet");
});
