// Visit types through the store: startBlank, setVisit and a relative's reply keep the question set (spec E.2.5).
// Run: npm test
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { packFor } from "../src/lib/packs";
import { buildInvite } from "../src/lib/share";
import { actions, getTree } from "../src/lib/store";

// store.ts reads window.localStorage at call time, so a minimal fake window is enough (each test file runs in its own process).
const data = new Map<string, string>();
const storage = {
  getItem: (k: string) => data.get(k) ?? null,
  setItem: (k: string, v: string) => void data.set(k, String(v)),
  removeItem: (k: string) => void data.delete(k),
};
Object.assign(globalThis, { window: { localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {} } });

/** Read back through cleanTree, as a reload would (the in-memory cache would skip it). */
const reload = () => {
  const raw = data.get("fht:tree:v1")!;
  data.set("fht:tree:v1", `${raw} `);
  return getTree();
};

beforeEach(() => {
  data.clear();
  actions.loadDemo();
});

test("startBlank without a visit is unchanged: no visit, cardiology", () => {
  actions.startBlank("Sam");
  const t = reload();
  assert.equal(t.visit, undefined);
  assert.equal(packFor(t).id, "cardiology");
});

test("startBlank with a primary-care visit persists through cleanTree and picks the general questions", () => {
  actions.startBlank("Sam", { specialty: "Primary care", type: "primary-care", date: "" });
  const t = reload();
  assert.deepEqual(t.visit, { specialty: "Primary care", date: "", practice: undefined, type: "primary-care" });
  assert.equal(packFor(t).id, "general");
  const mom = t.people.find((p) => p.id === "mom")!;
  assert.equal(buildInvite(t, mom).k, "general");
});

test("setVisit switches the question set and clears the patient's review; old answers keep their words", () => {
  actions.markReviewed(true);
  actions.setVisit({ specialty: "Dermatology", type: "other", date: "2026-10-20" });
  const t = reload();
  assert.equal(t.reviewedAt, undefined);
  assert.equal(packFor(t).id, "general");
  assert.ok(t.reports.every((r) => !("pack" in r)), "the demo's reports keep their cardiology shape");
});

test("a relative's general 'None of these' keeps its question set through importReply", () => {
  actions.startBlank("Sam", { specialty: "Primary care", type: "primary-care", date: "" });
  const t = getTree();
  actions.createInvite("mom");
  const res = actions.importReply({
    v: 1,
    t: t.id,
    p: "mom",
    b: "Mother",
    at: "2026-10-12T16:00:00Z",
    reports: [
      { personId: "mom", kind: "no-history", pack: "general", reportedBy: "Mother", source: "self", reportedAt: "2026-10-12T16:00:00Z" },
      { personId: "mgf", kind: "no-history", reportedBy: "Mother", source: "relative", reportedAt: "2026-10-12T16:00:00Z" },
    ],
  });
  assert.equal(res.added, 2);
  const after = reload();
  assert.equal(after.reports.find((r) => r.personId === "mom")!.pack, "general");
  assert.ok(!("pack" in after.reports.find((r) => r.personId === "mgf")!), "a reply without a pack stays cardiology");
});
