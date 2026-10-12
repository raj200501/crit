"use client";

import { useEffect, useId, useRef, useState } from "react";
import { actions, FIXED_RELATIONS, MOVABLE_RELATIONS } from "@/lib/store";
import type { PersonView } from "@/lib/status";
import type { Relation } from "@/lib/types";
import { RELATION_TEXT } from "@/components/tree/model";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { toast } from "@/components/ui/Toast";

/**
 * Name, relationship (only among a brother or sister and an aunt or uncle on either side), sex and "has passed away" with
 * age, cause and "sudden or unexpected", plus a danger zone for Remove from tree, which can be undone (DESIGN §12.3).
 */
export function EditPerson({
  view,
  onDone,
  onRemoved,
  focusField,
}: {
  view: PersonView;
  onDone: () => void;
  onRemoved: () => void;
  /** Opened from a "Still unknown" gap: focus that field. */
  focusField?: "age" | "cause";
}) {
  const p = view.person;
  const id = useId();
  const [label, setLabel] = useState(p.label);
  const [sex, setSex] = useState(p.sex);
  const movable = MOVABLE_RELATIONS.includes(p.relation);
  const [relation, setRelation] = useState<Relation>(p.relation);
  const [deceased, setDeceased] = useState(!!p.deceased || !!focusField);
  const [ageAtDeath, setAgeAtDeath] = useState(p.ageAtDeath != null ? String(p.ageAtDeath) : "");
  const [cause, setCause] = useState(p.causeOfDeath ?? "");
  const [sudden, setSudden] = useState(!!p.suddenDeath);
  // you, your parents and your grandparents are fixed slots: a missing ancestor stays a visible gap
  const removable = !FIXED_RELATIONS.includes(p.relation);
  const ageRef = useRef<HTMLInputElement>(null);
  const causeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!focusField) return;
    const raf = requestAnimationFrame(() => (focusField === "age" ? ageRef : causeRef).current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [focusField]);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const age = Number.parseInt(ageAtDeath, 10);
        actions.updatePerson(p.id, {
          label: label.trim() || p.label,
          relation: movable ? relation : p.relation,
          sex,
          deceased: deceased || undefined,
          ageAtDeath: deceased && Number.isFinite(age) && age >= 0 && age < 130 ? age : undefined,
          causeOfDeath: deceased ? cause.trim() || undefined : undefined,
          suddenDeath: deceased && sudden ? true : undefined,
        });
        onDone();
      }}
    >
      <h3 className="text-title font-strong text-fg">Edit details</h3>
      <Field label="Name" htmlFor={`${id}-name`}>
        <Input id={`${id}-name`} value={label} onChange={(e) => setLabel(e.target.value.slice(0, 40))} />
      </Field>
      {movable ? (
        <Field label="Relationship" htmlFor={`${id}-relation`} hint="Their answers stay with them.">
          <Select id={`${id}-relation`} value={relation} onChange={(e) => setRelation(e.target.value as Relation)}>
            {MOVABLE_RELATIONS.map((r) => (
              <option key={r} value={r}>
                {RELATION_TEXT[r]}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}
      <Field label="Sex" htmlFor={`${id}-sex`} hint="Used only for age cutoffs on the summary (e.g. early heart disease).">
        <Select id={`${id}-sex`} value={sex} onChange={(e) => setSex(e.target.value as typeof sex)}>
          <option value="unknown">Not set</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </Select>
      </Field>
      <div className="flex flex-col gap-3 rounded-md border border-line bg-paper p-4">
        <Switch checked={deceased} onChange={setDeceased} label="Has passed away" />
        {deceased ? (
          <div className="grid gap-4">
            <Field label="Age at death" htmlFor={`${id}-age`}>
              <Input
                ref={ageRef}
                id={`${id}-age`}
                inputMode="numeric"
                placeholder="e.g. 66"
                value={ageAtDeath}
                onChange={(e) => setAgeAtDeath(e.target.value.replace(/\D/g, "").slice(0, 3))}
                className="max-w-32"
              />
            </Field>
            <Field label="Cause, if known" htmlFor={`${id}-cause`} hint="e.g. heart attack, cancer, accident. Was it sudden? Use the switch below.">
              <Input
                ref={causeRef}
                id={`${id}-cause`}
                placeholder="In your own words"
                value={cause}
                onChange={(e) => setCause(e.target.value.slice(0, 80))}
              />
            </Field>
            <Switch checked={sudden} onChange={setSudden} label="It was sudden or unexpected" />
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" className="min-w-28">
          Save
        </Button>
      </div>
      {removable ? (
        <div className="flex flex-col items-start gap-3 rounded-md border border-danger/25 p-4">
          <div>
            <p className="text-small font-strong text-fg">Remove {p.label}</p>
            <p className="text-small text-fg-2">Takes them and everything said about them off this tree. You can undo right after.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            className="max-lg:h-11"
            onClick={() => {
              const removed = actions.removePerson(p.id);
              onRemoved();
              if (!removed) return;
              toast({
                title: `Removed ${p.label}`,
                // the Remove button is gone with the person: focus goes to Undo instead of the page body
                focusAction: true,
                action: {
                  label: "Undo",
                  onClick: () => {
                    actions.restorePerson(removed);
                    // the Undo button goes away with its toast: focus moves to the person who came back
                    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-person-id="${CSS.escape(p.id)}"]`)?.focus({ preventScroll: true }));
                  },
                },
              });
            }}
          >
            Remove from tree
          </Button>
        </div>
      ) : null}
    </form>
  );
}
