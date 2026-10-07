"use client";

import { useId, useState } from "react";
import { actions } from "@/lib/store";
import type { FamilyTree } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/** The tree lives only in this browser, so replacing it is permanent: ask first unless it is the demo. (Unchanged.) */
export function confirmReplace(tree: FamilyTree) {
  if (tree.id === "demo") return true;
  const pending = tree.invites.filter((i) => !i.answeredAt).length;
  return window.confirm(
    `This replaces your tree in this browser (${tree.people.length} people, ${tree.reports.length} answers${pending ? `, ${pending} pending invites` : ""}). It can't be undone, and replies to earlier invites won't import. Continue?`,
  );
}

/** "Start my own tree" (inline form) and the always-visible demo-data controls (DESIGN §12.1). Names and confirm() unchanged. */
export function DemoData({ tree }: { tree: FamilyTree }) {
  const id = useId();
  const [starting, setStarting] = useState(false);
  const [name, setName] = useState("");
  const demo = tree.synthetic && tree.id === "demo";
  return (
    <section aria-labelledby={`${id}-title`} className="rounded-lg border border-line bg-mist/70 p-4">
      <h2 id={`${id}-title`} className="font-mono text-eyebrow font-medium text-fg-3 uppercase">
        {demo ? "Demo data" : "Your data"}
      </h2>
      <p className="mt-1.5 text-small text-fg-2">
        {demo ? "You’re viewing Alex’s made-up demo family. " : ""}Everything stays in this browser: no account, no server.
      </p>
      {starting ? (
        <form
          className="mt-3 flex flex-wrap items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!confirmReplace(tree)) return;
            actions.startBlank(name);
            setStarting(false);
            setName("");
          }}
        >
          <Input
            aria-label="Your first name"
            placeholder="Your first name"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value.slice(0, 40))}
            className="min-w-0 flex-1 basis-40"
          />
          <Button type="submit" size="sm" className="max-lg:h-11">
            Start
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStarting(false)} className="max-lg:h-11">
            Cancel
          </Button>
        </form>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setStarting(true)} className="mt-3 max-lg:h-11">
          Start my own tree
        </Button>
      )}
      <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
        <Button variant="ghost" size="sm" onClick={() => confirmReplace(tree) && actions.loadDemo()} className="max-lg:h-11">
          {tree.id === "demo" ? "Reset demo family" : "Load the demo family"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => window.confirm("Delete everything this app stored in this browser? This can't be undone.") && actions.clearAll()}
          className="max-lg:h-11"
        >
          Delete everything stored here
        </Button>
      </div>
    </section>
  );
}
