"use client";

import { Info } from "lucide-react";
import { type Ref } from "react";
import { isCardiologyText, VISIT_TYPES, type VisitType } from "@/lib/packs";
import type { FamilyTree } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { RadioSegment } from "@/components/ui/RadioSegment";

export const PICK_TYPE_ERROR = "Pick the kind of visit. You can change it later.";
export const NAME_SPECIALIST_ERROR = "Name the specialist, like dermatology.";

export interface VisitChoice {
  type: VisitType | null;
  /** What the patient typed under "Other specialist". */
  other: string;
}

/** The visit to store for a choice, or the error to show. A typed specialty that is cardiology gets the heart questions. */
export function visitFromChoice(c: VisitChoice): { visit: { type: VisitType; specialty: string } } | { error: "type" | "other" } {
  if (!c.type) return { error: "type" };
  if (c.type !== "other") return { visit: { type: c.type, specialty: VISIT_TYPES.find((t) => t.id === c.type)!.specialty! } };
  const text = c.other.trim();
  if (!text) return { error: "other" };
  if (isCardiologyText(text)) return { visit: { type: "cardiology", specialty: "Cardiology" } };
  return { visit: { type: "other", specialty: text } };
}

/** The radio to preselect for a stored visit. A visit saved before visit types has no `type`: read its name. No visit
 *  at all: nothing picked (the patient chooses). */
export function choiceFromVisit(visit: FamilyTree["visit"]): VisitChoice {
  if (!visit) return { type: null, other: "" };
  if (visit.type) return { type: visit.type, other: visit.type === "other" ? visit.specialty : "" };
  if (isCardiologyText(visit.specialty)) return { type: "cardiology", other: "" };
  if (/^\s*primary care\s*$/i.test(visit.specialty)) return { type: "primary-care", other: "" };
  return { type: "other", other: visit.specialty };
}

/** Focus the checked radio of a visit-type group, else its first radio (a radiogroup div itself can't take focus). */
export function focusVisitType(root: HTMLElement | null) {
  const radios = root?.querySelectorAll<HTMLInputElement>('input[type="radio"]');
  const target = [...(radios ?? [])].find((r) => r.checked) ?? radios?.[0];
  target?.focus();
}

/**
 * Visit type: Cardiology · Primary care or wellness visit · Other specialist, as real radios under a visible legend, and
 * "Which specialist?" for Other. Shared by the visit pill and the start form.
 */
export function VisitTypeField({
  id,
  value,
  onChange,
  error,
  hint,
  otherRef,
}: {
  id: string;
  value: VisitChoice;
  onChange: (next: VisitChoice) => void;
  /** Set after a save attempt. */
  error?: "type" | "other" | null;
  /** A note under the group (announced politely), e.g. that the questions change. */
  hint?: string | null;
  otherRef?: Ref<HTMLInputElement>;
}) {
  const typeErrorId = `${id}-type-error`;
  const cardiologyText = value.type === "other" && isCardiologyText(value.other.trim());
  const note = cardiologyText ? "That’s cardiology, so the heart questions are used." : (hint ?? "");
  return (
    <div className="flex min-w-0 flex-col">
      <fieldset className="flex min-w-0 flex-col gap-1.5" aria-describedby={error === "type" ? typeErrorId : undefined}>
        <legend className="mb-1.5 text-small font-medium text-fg">Visit type</legend>
        <RadioSegment
          name={`${id}-type`}
          label="Visit type"
          options={VISIT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
          value={value.type}
          onChange={(v) => onChange({ ...value, type: v as VisitType })}
          className="flex-col"
        />
        {error === "type" ? (
          <p id={typeErrorId} role="alert" className="flex items-start gap-1.5 text-small font-medium text-danger dark:text-danger-night">
            <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
            <span>{PICK_TYPE_ERROR}</span>
          </p>
        ) : null}
      </fieldset>
      {value.type === "other" ? (
        <Field
          label="Which specialist?"
          htmlFor={`${id}-other`}
          hint="For example, dermatology or GI. Relatives you invite will see this."
          error={error === "other" ? NAME_SPECIALIST_ERROR : undefined}
          announceError
          className="mt-3"
        >
          <Input ref={otherRef} id={`${id}-other`} autoComplete="off" value={value.other} onChange={(e) => onChange({ ...value, other: e.target.value.slice(0, 40) })} />
        </Field>
      ) : null}
      <p aria-live="polite" className="text-small text-fg-2 not-empty:mt-2.5">
        {note}
      </p>
    </div>
  );
}
