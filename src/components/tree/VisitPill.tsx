"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";
import { actions } from "@/lib/store";
import type { FamilyTree } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { formatVisitDate } from "./model";
import { useOnPopoverOpen } from "./usePopoverOpen";

/** The existing visit editor (fields and logic unchanged), as a popover. */
function VisitForm({ tree, onDone }: { tree: FamilyTree; onDone: () => void }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const firstRef = useRef<HTMLInputElement>(null);
  const [specialty, setSpecialty] = useState(tree.visit?.specialty ?? "Cardiology");
  const [date, setDate] = useState(tree.visit?.date ?? "");
  useOnPopoverOpen(formRef, () => {
    setSpecialty(tree.visit?.specialty ?? "Cardiology");
    setDate(tree.visit?.date ?? "");
    requestAnimationFrame(() => firstRef.current?.focus());
  });
  return (
    <form
      ref={formRef}
      className="flex w-[min(18rem,calc(100vw-40px))] flex-col gap-3 p-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        actions.setVisit({ specialty: specialty.trim() || "Cardiology", date, practice: tree.visit?.practice });
        onDone();
      }}
    >
      <p className="text-ui font-strong text-fg">Your upcoming visit</p>
      <Field label="Visit" htmlFor={`${id}-visit`}>
        <Input ref={firstRef} id={`${id}-visit`} value={specialty} onChange={(e) => setSpecialty(e.target.value.slice(0, 40))} />
      </Field>
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
