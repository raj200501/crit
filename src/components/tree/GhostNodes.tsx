"use client";

import { Plus } from "lucide-react";
import { useId, useRef, useState } from "react";
import { actions } from "@/lib/store";
import type { Person, Relation } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Field } from "@/components/ui/Field";
import { Input, Select } from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { useOnPopoverOpen } from "./usePopoverOpen";

type AddRelation = Extract<Relation, "paternal-aunt-uncle" | "maternal-aunt-uncle" | "sibling">;

const TITLE: Record<AddRelation, string> = {
  sibling: "Add your brother or sister",
  "paternal-aunt-uncle": "Add your father’s brother or sister",
  "maternal-aunt-uncle": "Add your mother’s brother or sister",
};

/** The existing add-relative form (labels and logic unchanged), now inside a popover. */
function AddRelativeForm({ relation, onDone }: { relation: AddRelation; onDone: (id?: string) => void }) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [label, setLabel] = useState("");
  const [sex, setSex] = useState<Person["sex"]>("unknown");
  useOnPopoverOpen(formRef, () => {
    setLabel("");
    setSex("unknown");
    requestAnimationFrame(() => nameRef.current?.focus());
  });
  return (
    <form
      ref={formRef}
      className="flex w-[min(18rem,calc(100vw-40px))] flex-col gap-3 p-2.5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!label.trim()) return;
        onDone(actions.addPerson(relation, label.trim(), sex));
      }}
    >
      <p className="text-ui font-strong text-fg">{TITLE[relation]}</p>
      <Field label="Name" htmlFor={`${id}-name`}>
        <Input
          ref={nameRef}
          id={`${id}-name`}
          placeholder="What you call them, e.g. Aunt Priya"
          value={label}
          onChange={(e) => setLabel(e.target.value.slice(0, 40))}
        />
      </Field>
      <Field label="Sex (optional)" htmlFor={`${id}-sex`} hint="Used only for age cutoffs on the summary.">
        <Select id={`${id}-sex`} value={sex} onChange={(e) => setSex(e.target.value as Person["sex"])}>
          <option value="unknown">Not set</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </Select>
      </Field>
      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={() => onDone()} className="max-lg:h-11">
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={!label.trim()} className="max-lg:h-11">
          Add
        </Button>
      </div>
    </form>
  );
}

export interface AddRelativeProps {
  relation: AddRelation;
  /** "Dad’s brother or sister" */
  label: string;
  /** ghost: a dashed slot on the canvas. row: a list-view row. */
  variant?: "ghost" | "row";
  onAdded: (id: string) => void;
}

/** A dashed "+" slot (or list row) that opens the add-relative form in a popover (DESIGN §12.1 ghost nodes). */
export function AddRelative({ relation, label, variant = "ghost", onAdded }: AddRelativeProps) {
  return (
    <Popover
      align={variant === "row" ? "start" : "center"}
      label={TITLE[relation]}
      trigger={{
        variant: "ghost",
        size: "sm",
        "aria-label": `Add ${label}`,
        className: cn(
          variant === "ghost"
            ? "size-full flex-col gap-1.5 rounded-md border border-dashed border-ink-4/55 bg-surface/40 px-3 text-center text-caption leading-tight font-medium whitespace-normal text-fg-2 hover:border-brand hover:bg-surface hover:text-brand"
            : "h-14 w-full justify-start rounded-none px-4 text-small text-fg-2 hover:text-brand",
        ),
        label: (
          <span className={cn("flex items-center", variant === "ghost" ? "flex-col gap-1.5" : "gap-3")}>
            <span
              aria-hidden
              className={cn(
                "grid shrink-0 place-items-center rounded-full border border-current/35 transition-transform duration-(--dur-hover) group-hover/btn:scale-110 motion-reduce:group-hover/btn:scale-100",
                variant === "ghost" ? "size-6" : "size-8",
              )}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className={cn(variant === "ghost" && "max-w-[12ch] text-balance")}>{label}</span>
          </span>
        ),
      }}
    >
      {({ close }) => (
        <AddRelativeForm
          relation={relation}
          onDone={(id) => {
            close();
            if (id) onAdded(id);
          }}
        />
      )}
    </Popover>
  );
}
