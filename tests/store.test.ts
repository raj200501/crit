// Store actions that edit the tree (remove and undo, change relationship), run against an in-memory localStorage.
// Run: npm test
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { demoTree } from "../src/lib/demo";
import { actions, FIXED_RELATIONS, getTree } from "../src/lib/store";

// store.ts reads window.localStorage at call time, so a minimal fake window is enough (each test file runs in its own process).
const data = new Map<string, string>();
const storage = {
  getItem: (k: string) => data.get(k) ?? null,
  setItem: (k: string, v: string) => void data.set(k, String(v)),
  removeItem: (k: string) => void data.delete(k),
};
Object.assign(globalThis, { window: { localStorage: storage, sessionStorage: storage, addEventListener() {}, removeEventListener() {} } });

beforeEach(() => {
  data.clear();
  actions.loadDemo();
});

test("you, your parents and your grandparents can't be removed", () => {
  for (const p of demoTree().people.filter((x) => FIXED_RELATIONS.includes(x.relation))) {
    assert.equal(actions.removePerson(p.id), undefined, p.label);
    assert.ok(getTree().people.some((x) => x.id === p.id), p.label);
  }
  assert.deepEqual([...FIXED_RELATIONS].sort(), ["father", "maternal-grandfather", "maternal-grandmother", "mother", "paternal-grandfather", "paternal-grandmother", "self"]);
});

test("Remove from tree, then Undo, restores the person in place with their reports and invites", () => {
  const before = getTree();
  const removed = actions.removePerson("dev");
  assert.ok(removed);
  const gone = getTree();
  assert.ok(!gone.people.some((p) => p.id === "dev"));
  assert.ok(!gone.reports.some((r) => r.personId === "dev"));
  assert.ok(!gone.invites.some((i) => i.personId === "dev"));
  // what Uncle Dev said about others stays: only reports about him go
  assert.ok(gone.reports.some((r) => r.reportedById === "dev" && r.personId === "dad"));

  actions.markReviewed(true);
  actions.restorePerson(removed);
  const back = getTree();
  assert.deepEqual(
    back.people.map((p) => p.id),
    before.people.map((p) => p.id),
  );
  assert.deepEqual(
    back.reports.filter((r) => r.personId === "dev"),
    before.reports.filter((r) => r.personId === "dev"),
  );
  assert.deepEqual(
    back.invites.filter((i) => i.personId === "dev"),
    before.invites.filter((i) => i.personId === "dev"),
  );
  assert.equal(back.reviewedAt, undefined, "a change to the tree asks for a fresh review");

  // a second Undo adds nothing twice
  actions.restorePerson(removed);
  assert.equal(getTree().people.filter((p) => p.id === "dev").length, 1);
  assert.equal(getTree().reports.length, before.reports.length);
  assert.equal(getTree().invites.length, before.invites.length);
});

test("Undo does nothing once the tree itself was replaced", () => {
  const removed = actions.removePerson("dev")!;
  actions.startBlank("Sam");
  actions.restorePerson(removed);
  assert.ok(!getTree().people.some((p) => p.id === "dev"));
});
