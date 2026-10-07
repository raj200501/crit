import type { PersonView } from "@/lib/status";
import { PedigreeGlyph, shapeForSex } from "@/components/ui/PedigreeGlyph";
import { hasFinding, nodeStatus } from "./model";

/** Relatives whose answers are missing or disagree. Each chip opens that person (`Open {label}`, DESIGN §12.9 R2). */
export function StillToConfirm({ todo, pendingIds, onOpen }: { todo: PersonView[]; pendingIds: Set<string>; onOpen: (id: string) => void }) {
  if (!todo.length) return null;
  return (
    <section aria-labelledby="todo-title">
      <h2 id="todo-title" className="font-mono text-eyebrow font-medium text-fg-3 uppercase">
        Still to confirm · {todo.length}
      </h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {todo.map((v) => {
          const pending = pendingIds.has(v.person.id);
          const reason = pending && v.status === "unknown" ? "Invited · waiting" : (v.reason ?? v.headline);
          const reasonId = `todo-${v.person.id}-reason`;
          return (
            <li key={v.person.id}>
              <button
                type="button"
                aria-label={`Open ${v.person.label}`}
                aria-describedby={reasonId}
                onClick={() => onOpen(v.person.id)}
                className="group inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface py-1 pr-3.5 pl-1.5 text-small shadow-xs transition-[border-color,box-shadow,translate] duration-(--dur-hover) ease-out-quart hover:-translate-y-px hover:border-line-strong hover:shadow-sm lg:min-h-10 motion-reduce:hover:translate-y-0"
              >
                <span className="grid size-7 place-items-center rounded-full bg-canvas">
                  <PedigreeGlyph
                    shape={shapeForSex(v.person.sex)}
                    status={nodeStatus(v, pending)}
                    finding={hasFinding(v)}
                    deceased={v.person.deceased}
                    size={22}
                  />
                </span>
                <span className="font-medium text-fg">{v.person.label}</span>
                <span id={reasonId} className="text-fg-3">
                  {reason}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
