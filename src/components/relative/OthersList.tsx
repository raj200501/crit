import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import AnswerForm, { type Answer } from "../AnswerForm";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { describeAnswer, type Draft } from "./describe";

export interface OthersListProps {
  people: { id: string; l: string }[];
  /** Ids already answered (including "Don't know"). */
  done: string[];
  drafts: Draft[];
  onAnswer: (personId: string, answers: Answer[]) => void;
  /** Open this person's form on arrival (a "Change" from the check-answers screen). */
  initialOpen?: string | null;
  /** Spread onto AnswerForm: P5's `variant="page"` once its API lands (DESIGN §11.4). */
  formProps?: Record<string, unknown>;
}

/** "Others you know": one card per relative with an h3 (DESIGN §12.9 R3), 48 px actions and the inline answer form. */
export function OthersList({ people, done, drafts, onAnswer, initialOpen, formProps }: OthersListProps) {
  const [open, setOpen] = useState<string | null>(initialOpen ?? null);
  return (
    <ul className="flex flex-col gap-3">
      {people.map((o) => (
        <OtherPerson
          key={o.id}
          label={o.l}
          answered={done.includes(o.id)}
          summary={drafts.filter((d) => d.personId === o.id && d.source === "relative")}
          open={open === o.id}
          focusOnOpen={initialOpen === o.id}
          onOpen={(on) => setOpen(on ? o.id : null)}
          onAnswer={(a) => onAnswer(o.id, a)}
          form={(close) => (
            <AnswerForm
              {...formProps}
              subject={o.l.split(" (")[0]}
              compact
              submitLabel="Save"
              onSubmit={(a) => {
                close();
                onAnswer(o.id, a);
              }}
              onCancel={close}
            />
          )}
        />
      ))}
    </ul>
  );
}

function OtherPerson({
  label,
  answered,
  summary,
  open,
  focusOnOpen,
  onOpen,
  onAnswer,
  form,
}: {
  label: string;
  answered: boolean;
  summary: Draft[];
  open: boolean;
  focusOnOpen: boolean;
  onOpen: (open: boolean) => void;
  onAnswer: (a: Answer[]) => void;
  form: (close: () => void) => ReactNode;
}) {
  const first = label.split(" (")[0];
  const lines = summary.map(describeAnswer);
  return (
    <li
      className={cn(
        "rounded-lg border bg-surface transition-[border-color,box-shadow] duration-(--dur-ui)",
        open ? "border-line-strong shadow-md" : answered ? "border-brand/30 shadow-xs" : "border-line shadow-xs",
      )}
    >
      <div className="flex items-start gap-3.5 p-4">
        <span
          aria-hidden
          className={cn(
            "relative grid size-10 shrink-0 place-items-center rounded-full font-display text-[1.125rem] leading-none transition-colors duration-(--dur-ui)",
            answered ? "bg-evergreen-50 text-evergreen-700" : "bg-mist text-fg-2",
          )}
        >
          {first.replace(/^(Grandpa|Grandma|Uncle|Aunt|Cousin)\s+/i, "").slice(0, 1).toUpperCase()}
          {answered ? (
            <span className="absolute -right-0.5 -bottom-0.5 grid size-4.5 place-items-center rounded-full bg-evergreen-600 text-white ring-2 ring-surface">
              <Check className="size-3" strokeWidth={3} />
            </span>
          ) : null}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 data-step-focus={focusOnOpen ? "" : undefined} tabIndex={focusOnOpen ? -1 : undefined} className="text-ui font-strong text-fg outline-none">
            {label}
          </h3>
          {answered && lines.length ? (
            <p className="text-small text-fg-2">{lines.join(" · ")}</p>
          ) : (
            <p className="text-small text-fg-3">{answered ? "Answered" : "Not answered yet"}</p>
          )}
        </div>
      </div>
      {open ? (
        <div className="border-t border-line px-4 pt-4 pb-4">{form(() => onOpen(false))}</div>
      ) : (
        <div className="flex gap-2 px-4 pb-4">
          <Button variant="secondary" onClick={() => onOpen(true)} className={cn("h-12 px-5", !answered && "flex-1")}>
            {answered ? "Change" : "Add what I know"}
            <span className="sr-only"> about {first}</span>
          </Button>
          {!answered ? (
            <Button variant="ghost" onClick={() => onAnswer([{ kind: "dont-know" }])} className="h-12 px-4 text-fg-2">
              Don&rsquo;t know<span className="sr-only"> about {first}</span>
            </Button>
          ) : null}
        </div>
      )}
    </li>
  );
}
