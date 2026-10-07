"use client";

import { Info, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { HEART_CHOICES, type Choice } from "@/lib/clinical";
import type { ReportKind } from "@/lib/types";
import { Button } from "./ui/Button";
import { cn } from "./ui/cn";
import { Input, Textarea } from "./ui/Input";
import { StickyActionBar } from "./ui/StickyActionBar";
import { Switch } from "./ui/Switch";
import { CheckboxCard } from "./ui/CheckboxCard";
import { RadioSegment } from "./ui/RadioSegment";

export interface Answer {
  kind: ReportKind;
  condition?: string;
  ageAtOnset?: number;
  approximate?: boolean;
  note?: string;
}

interface Props {
  /** "you" when the person answers for themself, otherwise their name. */
  subject: string;
  self?: boolean;
  /** Offer "rather not share" (only the person themself can decline). */
  allowDecline?: boolean;
  submitLabel?: string;
  compact?: boolean;
  onSubmit: (answers: Answer[]) => void;
  onCancel?: () => void;
  /** panel (default): the /tree inspector and sheet. page: 17 px base, 56 px CTAs, one column (the relative's phone flow). */
  variant?: "panel" | "page";
  /** Render the actions in a StickyActionBar (the relative's phone flow sets this). */
  stickyActions?: boolean;
  className?: string;
}

type Pick = { age: string; approx: boolean };
type Alt = "none" | "dont-know" | "declined";

// Presentation-only grouping of the existing HEART_CHOICES ids (DESIGN §12.4). Unknown ids fall into "Other".
const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Arteries & cholesterol", ids: ["mi", "fh", "stroke"] },
  { title: "Rhythm", ids: ["arrhythmia", "inherited-rhythm", "faint"] },
  { title: "Sudden events", ids: ["arrest", "sudden"] },
  { title: "Heart muscle & aorta", ids: ["cardiomyopathy", "aortic"] },
];

function groupedChoices(): { title: string; choices: Choice[] }[] {
  const byId = new Map(HEART_CHOICES.map((c) => [c.id, c]));
  const used = new Set<string>();
  const groups = GROUPS.map((g) => ({
    title: g.title,
    choices: g.ids.flatMap((id) => {
      const c = byId.get(id);
      if (!c) return [];
      used.add(id);
      return [c];
    }),
  })).filter((g) => g.choices.length);
  const rest = HEART_CHOICES.filter((c) => !used.has(c.id));
  return rest.length ? [...groups, { title: "Other", choices: rest }] : groups;
}
const GROUPED = groupedChoices();

const digits = (s: string) => s.replace(/\D/g, "").slice(0, 3);

function AgeRow({
  id,
  label,
  value,
  approx,
  onAge,
  onApprox,
}: {
  id: string;
  label: string;
  value: string;
  approx: boolean;
  onAge: (v: string) => void;
  onApprox: (v: boolean) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-5 gap-y-1">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-small font-medium text-fg">
          {label}
        </label>
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          placeholder="Age"
          value={value}
          onChange={(e) => onAge(digits(e.target.value))}
          className="w-24"
        />
      </div>
      <Switch checked={approx} onChange={onApprox} label="roughly" className="text-small text-fg-2" />
    </div>
  );
}

/**
 * The guided heart-history question (DESIGN §12.4): grouped checkbox cards with plain words and examples, an age row
 * revealed inside each ticked card, "Other answers" as real radios, an optional note. Logic is unchanged.
 */
export default function AnswerForm({
  subject,
  self,
  allowDecline,
  submitLabel = "Save",
  compact,
  onSubmit,
  onCancel,
  variant = "panel",
  stickyActions,
  className,
}: Props) {
  const id = useId();
  const page = variant === "page";
  const [picked, setPicked] = useState<Record<string, Pick>>({});
  const [other, setOther] = useState({ on: false, text: "", age: "", approx: false });
  const [alt, setAlt] = useState<Alt | null>(null);
  const [note, setNote] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Validation moves focus to the message (no shake).
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const anyPicked = Object.keys(picked).length > 0 || (other.on && other.text.trim().length > 0);

  const toggle = (cid: string, on: boolean) => {
    setAlt(null);
    setError(null);
    setPicked((p) => {
      const next = { ...p };
      if (!on) delete next[cid];
      else next[cid] = next[cid] ?? { age: "", approx: false };
      return next;
    });
  };

  const chooseAlt = (a: Alt) => {
    setAlt(a);
    setPicked({});
    setOther({ on: false, text: "", age: "", approx: false });
    if (a === "declined") setNote(""); // a decline carries nothing else
    setError(null);
  };

  const parseAge = (s: string) => {
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 && n <= 120 ? n : undefined;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedNote = note.trim() || undefined;
    if (alt) {
      onSubmit([{ kind: alt === "none" ? "no-history" : alt, note: alt === "declined" ? undefined : trimmedNote }]);
      return;
    }
    if (!anyPicked) {
      setError("Pick at least one, or choose “None of these” or “I don’t know”.");
      return;
    }
    const answers: Answer[] = HEART_CHOICES.filter((c) => picked[c.id]).map((c) => ({
      kind: "condition",
      condition: c.condition,
      ageAtOnset: parseAge(picked[c.id].age),
      approximate: picked[c.id].approx || undefined,
    }));
    if (other.on && other.text.trim()) {
      answers.push({ kind: "condition", condition: other.text.trim(), ageAtOnset: parseAge(other.age), approximate: other.approx || undefined });
    }
    if (trimmedNote && answers.length) answers[0].note = trimmedNote;
    onSubmit(answers);
  };

  const q = self ? "Have you ever had any of these?" : `Has ${subject} ever had any of these?`;
  const ageLabel = self ? "About how old were you?" : "About how old were they?";
  const cardSize = page ? "lg" : "md";
  const altOptions = [
    { value: "none", label: "None of these" },
    { value: "dont-know", label: "I don’t know" },
    ...(allowDecline ? [{ value: "declined", label: "I’d rather not share" }] : []),
  ];

  const actions = (
    <div className={cn("flex gap-2", page ? "flex-col-reverse sm:flex-row sm:justify-end" : "items-center justify-end")}>
      {onCancel ? (
        <Button variant="ghost" onClick={onCancel} size={page ? "lg" : "md"} className={cn(page && "h-14 sm:w-auto")} fullWidth={page}>
          Cancel
        </Button>
      ) : null}
      <Button type="submit" size={page ? "lg" : "md"} className={cn(page ? "h-14 sm:w-auto" : "min-w-32")} fullWidth={page}>
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <form className={cn("@container flex flex-col", page ? "gap-7 text-[17px]" : compact ? "gap-5" : "gap-6", className)} onSubmit={submit} noValidate>
      <fieldset className="flex min-w-0 flex-col gap-5">
        <legend className={cn("mb-1 font-strong text-fg", page ? "text-[1.5rem] leading-tight tracking-[-0.018em]" : "text-title")}>{q}</legend>
        <p className={cn("text-fg-3", page ? "text-body" : "text-small")}>Tick anything that fits, even if you&rsquo;re not sure of the details.</p>

        {GROUPED.map((g) => (
          <fieldset key={g.title} className="flex min-w-0 flex-col gap-2">
            <legend className="mb-2 font-mono text-eyebrow font-medium text-fg-3 uppercase">{g.title}</legend>
            <div className={cn("grid gap-2", !page && "@min-[40rem]:grid-cols-2")}>
              {g.choices.map((c) => {
                const pick = picked[c.id];
                return (
                  <CheckboxCard key={c.id} size={cardSize} checked={!!pick} onChange={(on) => toggle(c.id, on)} title={c.label} description={c.examples}>
                    {pick ? (
                      <AgeRow
                        id={`${id}-${c.id}-age`}
                        label={ageLabel}
                        value={pick.age}
                        approx={pick.approx}
                        onAge={(age) => setPicked((p) => ({ ...p, [c.id]: { ...p[c.id], age } }))}
                        onApprox={(approx) => setPicked((p) => ({ ...p, [c.id]: { ...p[c.id], approx } }))}
                      />
                    ) : null}
                  </CheckboxCard>
                );
              })}
            </div>
          </fieldset>
        ))}

        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="mb-2 font-mono text-eyebrow font-medium text-fg-3 uppercase">Something else</legend>
          <CheckboxCard
            size={cardSize}
            checked={other.on}
            onChange={(on) => {
              setAlt(null);
              setError(null);
              setOther((o) => ({ ...o, on }));
            }}
            title="Something else heart-related"
            description="Say it in your own words"
          >
            {other.on ? (
              <div className="flex flex-col gap-3">
                <Input
                  aria-label="Describe the condition"
                  placeholder="e.g. heart murmur, valve surgery"
                  value={other.text}
                  onChange={(e) => setOther((o) => ({ ...o, text: e.target.value.slice(0, 80) }))}
                />
                <AgeRow
                  id={`${id}-other-age`}
                  label={ageLabel}
                  value={other.age}
                  approx={other.approx}
                  onAge={(age) => setOther((o) => ({ ...o, age }))}
                  onApprox={(approx) => setOther((o) => ({ ...o, approx }))}
                />
              </div>
            ) : null}
          </CheckboxCard>
        </fieldset>
      </fieldset>

      <div className="flex flex-col gap-2">
        <p aria-hidden className="font-mono text-eyebrow font-medium text-fg-3 uppercase">
          Or
        </p>
        <RadioSegment
          name={`${id}-alt`}
          label="Other answers"
          options={altOptions}
          value={alt}
          onChange={(v) => chooseAlt(v as Alt)}
          size={page ? "lg" : "md"}
        />
      </div>

      {alt !== "declined" ? (
        noteOpen || note ? (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-note`} className="text-small font-medium text-fg">
              Anything else, in your own words <span className="font-normal text-fg-3">(optional)</span>
            </label>
            <Textarea
              ref={noteRef}
              id={`${id}-note`}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              placeholder="e.g. “He had chest pain in his late 50s, I think it was angina.”"
            />
          </div>
        ) : (
          <button
            type="button"
            aria-expanded={false}
            onClick={() => {
              setNoteOpen(true);
              requestAnimationFrame(() => noteRef.current?.focus());
            }}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start rounded-full px-1 text-small font-medium text-brand hover:text-brand-strong"
          >
            <Plus aria-hidden className="size-4" />
            Add a note
          </button>
        )
      ) : null}

      {error ? (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-2 rounded-md bg-danger-bg px-3.5 py-3 text-small font-medium text-danger outline-none"
        >
          <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}

      {stickyActions ? <StickyActionBar className="-mx-4 sm:-mx-6">{actions}</StickyActionBar> : actions}
    </form>
  );
}
