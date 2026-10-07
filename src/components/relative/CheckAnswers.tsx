import { Link2, Lock, Pencil } from "lucide-react";
import { cn } from "../ui/cn";
import { describeAnswer, recordYear, type Draft } from "./describe";

export interface CheckAnswersProps {
  /** The invitee's id and label (they come first, as "you"). */
  selfId: string;
  me: string;
  people: { id: string; l: string }[];
  drafts: Draft[];
  /** Jump back to the step that holds this person's answers. */
  onChange: (personId: string) => void;
}

/**
 * GOV.UK "check answers": one card per person (you first), a row per fact, and a Change link with hidden context.
 * Portal facts say where they came from ("from your portal record"), never "verified".
 */
export function CheckAnswers({ selfId, me, people, drafts, onChange }: CheckAnswersProps) {
  const ids = [selfId, ...people.map((p) => p.id)].filter((id, i, all) => all.indexOf(id) === i);
  const groups = ids
    .map((id) => ({ id, label: id === selfId ? `${me} (you)` : (people.find((p) => p.id === id)?.l ?? "Relative"), rows: drafts.filter((d) => d.personId === id) }))
    .filter((g) => g.rows.length);
  return (
    <div className="flex flex-col gap-3">
      {groups.map((g) => (
        <section key={g.id} aria-label={g.label} className="overflow-clip rounded-lg border border-line bg-surface shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-mist/60 py-1 pr-1.5 pl-4">
            <h2 className="min-w-0 truncate text-ui font-strong text-fg">{g.label}</h2>
            <button
              type="button"
              onClick={() => onChange(g.id)}
              className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-small font-medium text-brand underline decoration-brand/35 underline-offset-[3px] transition-colors hover:bg-white hover:text-brand-strong hover:decoration-current"
            >
              <Pencil aria-hidden className="size-3.5" />
              Change<span className="sr-only"> answers about {g.id === selfId ? "you" : g.label}</span>
            </button>
          </div>
          <ul className="divide-y divide-line">
            {g.rows.map((d, i) => (
              <li key={i} className="flex flex-col gap-1 px-4 py-3">
                <p className={cn("flex items-baseline gap-2 text-fg", d.kind === "declined" && "text-declined-ink")}>
                  {d.kind === "declined" ? <Lock aria-hidden className="size-4 shrink-0 self-center" /> : null}
                  {describeAnswer(d)}
                </p>
                {d.source === "record" ? (
                  <p className="flex items-center gap-1.5 font-mono text-eyebrow font-medium text-record uppercase">
                    <Link2 aria-hidden className="size-3.5" strokeWidth={2.25} />
                    {d.record?.system === "Simulated portal record" ? "Simulated record (made-up)" : "From your portal record"}
                    {recordYear(d) ? ` · since ${recordYear(d)}` : ""}
                  </p>
                ) : null}
                {d.note && d.kind !== "declined" ? <q className="text-small text-fg-2 italic">{d.note}</q> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
