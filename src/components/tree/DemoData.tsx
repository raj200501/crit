"use client";

import { useId, useRef, useState } from "react";
import { actions } from "@/lib/store";
import type { FamilyTree } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { focusVisitType, VisitTypeField, visitFromChoice, type VisitChoice } from "./VisitTypeField";

/** The tree lives only in this browser, so replacing it is permanent: ask first unless it is the demo. (Unchanged.) */
export function confirmReplace(tree: FamilyTree) {
  if (tree.id === "demo") return true;
  const pending = tree.invites.filter((i) => !i.answeredAt).length;
  return window.confirm(
    `This replaces your tree in this browser (${tree.people.length} people, ${tree.reports.length} answers${pending ? `, ${pending} pending invites` : ""}). It can't be undone, and replies to earlier invites won't import. Continue?`,
  );
}

/** "Start my own tree" (inline form: first name and the visit type, which picks the questions) and the always-visible
 *  demo-data controls (DESIGN §12.1). Names and confirm() unchanged. */
export function DemoData({ tree }: { tree: FamilyTree }) {
  const id = useId();
  const [starting, setStarting] = useState(false);
  const [name, setName] = useState("");
  const [choice, setChoice] = useState<VisitChoice>({ type: null, other: "" });
  const [error, setError] = useState<"type" | "other" | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);
  const demo = tree.synthetic && tree.id === "demo";
  const cancel = () => {
    setStarting(false);
    setChoice({ type: null, other: "" });
    setError(null);
  };
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
          ref={formRef}
          noValidate
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const r = visitFromChoice(choice);
            if ("error" in r) {
              setError(r.error);
              requestAnimationFrame(() => (r.error === "other" ? otherRef.current?.focus() : focusVisitType(formRef.current)));
              return;
            }
            if (!confirmReplace(tree)) return;
            actions.startBlank(name, { ...r.visit, date: "" });
            cancel();
            setName("");
          }}
        >
          {/* A visible label now that the form has a second field with its own legend. */}
          <Field label="Your first name" htmlFor={`${id}-name`}>
            <Input id={`${id}-name`} value={name} autoFocus autoComplete="given-name" onChange={(e) => setName(e.target.value.slice(0, 40))} className="min-w-0" />
          </Field>
          <VisitTypeField
            id={`${id}-visit`}
            value={choice}
            onChange={(next) => {
              setChoice(next);
              setError(null);
            }}
            error={error}
            otherRef={otherRef}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" className="max-lg:h-11">
              Start
            </Button>
            <Button variant="ghost" size="sm" onClick={cancel} className="max-lg:h-11">
              Cancel
            </Button>
          </div>
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
