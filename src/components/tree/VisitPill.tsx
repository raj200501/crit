"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";
import { packIdForVisit, VISIT_TYPES } from "@/lib/packs";
import { actions } from "@/lib/store";
import type { FamilyTree } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { formatVisitDate } from "./model";
import { useOnPopoverOpen } from "./usePopoverOpen";
import { choiceFromVisit, focusVisitType, VisitTypeField, visitFromChoice, type VisitChoice } from "./VisitTypeField";

/** The visit editor, as a popover: the visit type (which picks the questions) and the date. */
function VisitForm({ tree, onDone }: { tree: FamilyTree; onDone: () => void }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const otherRef = useRef<HTMLInputElement>(null);
  const [choice, setChoice] = useState<VisitChoice>(() => choiceFromVisit(tree.visit));
  const [date, setDate] = useState(tree.visit?.date ?? "");
  const [error, setError] = useState<"type" | "other" | null>(null);
  useOnPopoverOpen(formRef, () => {
    setChoice(choiceFromVisit(tree.visit));
    setDate(tree.visit?.date ?? "");
    setError(null);
    requestAnimationFrame(() => focusVisitType(formRef.current));
  });
  const picked = VISIT_TYPES.find((t) => t.id === choice.type);
  const changes = picked && picked.pack !== packIdForVisit(tree.visit);
  return (
    <form
      ref={formRef}
      noValidate
      className="flex w-[min(20rem,calc(100vw-40px))] flex-col gap-3 p-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        const r = visitFromChoice(choice);
        if ("error" in r) {
          setError(r.error);
          requestAnimationFrame(() => (r.error === "other" ? otherRef.current?.focus() : focusVisitType(formRef.current)));
          return;
        }
        // The practice belongs to the visit it was set for (the demo's "Cardiology Associates (demo)"): a different
        // specialty drops it, so a primary-care visit never names a cardiology practice.
        const practice = r.visit.specialty === tree.visit?.specialty ? tree.visit?.practice : undefined;
        actions.setVisit({ ...r.visit, date, practice });
        onDone();
      }}
    >
      <p className="text-ui font-strong text-fg">Your upcoming visit</p>
      <VisitTypeField
        id={id}
        value={choice}
        onChange={(next) => {
          setChoice(next);
          setError(null);
        }}
        error={error}
        otherRef={otherRef}
        hint={changes ? "The questions change with the visit type. Answers already in the tree stay as they are." : null}
      />
      <Field label="Date" htmlFor={`${id}-date`}>
        <Input id={`${id}-date`} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onDone} className="max-lg:h-11">
          Cancel
        </Button>
        <Button type="submit" size="sm" className="max-lg:h-11">
          Save
        </Button>
      </div>
    </form>
  );
}

/** "Cardiology · Oct 14 ▾": the editable visit pill in the workspace header (DESIGN §12.1). */
export function VisitPill({ tree }: { tree: FamilyTree }) {
  return (
    <Popover
      align="start"
      label="Your upcoming visit"
      trigger={{
        variant: "secondary",
        size: "sm",
        className: "max-lg:h-11 pr-2.5 pl-3",
        label: (
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden className="size-4 text-brand" />
            {tree.visit ? (
              <span className="flex items-center gap-1.5">
                <span>{tree.visit.specialty}</span>
                <span aria-hidden className="text-fg-3">
                  ·
                </span>
                <span className="font-mono text-caption tracking-normal text-fg-2 uppercase">{formatVisitDate(tree.visit.date)}</span>
                <span className="sr-only">. Edit your visit</span>
              </span>
            ) : (
              <span>Add your upcoming visit</span>
            )}
            <ChevronDown aria-hidden className="size-4 text-fg-3" />
          </span>
        ),
      }}
    >
      {({ close }) => <VisitForm tree={tree} onDone={close} />}
    </Popover>
  );
}
