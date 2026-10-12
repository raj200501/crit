// Store actions that edit the tree (remove and undo, change relationship), run against an in-memory localStorage.
// Run: npm test
import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { demoTree } from "../src/lib/demo";
import { actions, FIXED_RELATIONS, getTree, MOVABLE_RELATIONS } from "../src/lib/store";

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

test("a relationship changes only among brother or sister and aunt or uncle, and answers stay with the person", () => {
  const before = getTree();
  actions.updatePerson("dev", { relation: "maternal-aunt-uncle" });
  assert.equal(getTree().people.find((p) => p.id === "dev")!.relation, "maternal-aunt-uncle");
  assert.deepEqual(
    getTree().reports.filter((r) => r.personId === "dev"),
    before.reports.filter((r) => r.personId === "dev"),
  );
  assert.deepEqual(
    getTree().invites.filter((i) => i.personId === "dev"),
    before.invites.filter((i) => i.personId === "dev"),
  );
  actions.updatePerson("dev", { relation: "sibling" });
  assert.equal(getTree().people.find((p) => p.id === "dev")!.relation, "sibling");

  // a stray or forged patch can't make anyone a parent or grandparent, or move a fixed slot
  actions.updatePerson("dev", { relation: "father", label: "Dev" });
  assert.equal(getTree().people.find((p) => p.id === "dev")!.relation, "sibling");
  assert.equal(getTree().people.find((p) => p.id === "dev")!.label, "Dev", "the rest of the patch still applies");
  actions.updatePerson("mom", { relation: "maternal-aunt-uncle" });
  actions.updatePerson("pgf", { relation: "sibling" });
  assert.equal(getTree().people.find((p) => p.id === "mom")!.relation, "mother");
  assert.equal(getTree().people.find((p) => p.id === "pgf")!.relation, "paternal-grandfather");
  assert.deepEqual([...MOVABLE_RELATIONS].sort(), ["maternal-aunt-uncle", "paternal-aunt-uncle", "sibling"]);
});

test("Undo right after Remove gives back the patient's review; any change in between asks for a fresh one", () => {
  actions.markReviewed(true);
  const reviewedAt = getTree().reviewedAt;
  assert.ok(reviewedAt);
  const removed = actions.removePerson("dev")!;
  assert.equal(getTree().reviewedAt, undefined);
  actions.restorePerson(removed);
  assert.equal(getTree().reviewedAt, reviewedAt, "the tree is back to the one that was reviewed");
  // a second Undo changes nothing, so it can't take the review away again
  actions.restorePerson(removed);
  assert.equal(getTree().reviewedAt, reviewedAt);

  const again = actions.removePerson("dev")!;
  actions.updatePerson("mom", { label: "Mama" });
  actions.restorePerson(again);
  assert.ok(getTree().people.some((p) => p.id === "dev"));
  assert.equal(getTree().reviewedAt, undefined);
});

test("Undo does nothing once the tree itself was replaced", () => {
  const removed = actions.removePerson("dev")!;
  actions.startBlank("Sam");
  actions.restorePerson(removed);
  assert.ok(!getTree().people.some((p) => p.id === "dev"));
});
