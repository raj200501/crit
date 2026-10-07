"use client";

import { ChevronRight, List } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { layoutTree } from "@/lib/layout";
import type { PersonView } from "@/lib/status";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { PedigreeGlyph, shapeForSex } from "@/components/ui/PedigreeGlyph";
import { StatusPill } from "@/components/ui/StatusPill";
import { generationOf, hasFinding, matchesHighlight, nodeAriaDetail, nodeDetail, nodeStatus, statusWord, type Highlight } from "./model";

const GROUPS = [
  { gen: 0, title: "Grandparents" },
  { gen: 1, title: "Parents and their siblings" },
  { gen: 2, title: "You and siblings" },
] as const;

export interface ListViewProps {
  views: PersonView[];
  selectedId?: string;
  onSelect: (id: string) => void;
  pendingIds: Set<string>;
  arrivedIds: Set<string>;
  highlight: Highlight;
  /** Desktop: the toolbar's "List view" toggle, pressed (switches back to the canvas). */
  onShowTree?: () => void;
  /** Add-relative rows for a generation (1: aunts and uncles, 2: brothers and sisters). */
  addRows?: (gen: 1 | 2) => ReactNode;
}

/** Relatives grouped by generation: the same buttons and the same `onSelect` as the canvas (DESIGN §12.1). */
export function ListView({ views, selectedId, onSelect, pendingIds, arrivedIds, highlight, onShowTree, addRows }: ListViewProps) {
  // paternal side first, as on the canvas
  const order = useMemo(() => {
    const xs = new Map(layoutTree(views.map((v) => v.person)).nodes.map((n) => [n.id, n.x]));
    return [...views].sort((a, b) => (xs.get(a.person.id) ?? 0) - (xs.get(b.person.id) ?? 0));
  }, [views]);
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
      {onShowTree ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 max-lg:hidden">
          <p className="font-mono text-eyebrow text-fg-3 uppercase">{views.length} people · by generation</p>
          <Button variant="ghost" size="sm" aria-pressed iconLeft={<List />} onClick={onShowTree} className="aria-pressed:bg-sunken">
            List view
          </Button>
        </div>
      ) : null}
      <div role="group" aria-label="Family health tree" className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {GROUPS.map(({ gen, title }) => {
          const rows = order.filter((v) => generationOf(v.person.relation) === gen);
          if (!rows.length) return null;
          return (
            <section key={gen} aria-labelledby={`gen-${gen}`} className="border-b border-line last:border-b-0">
              <h3
                id={`gen-${gen}`}
                className="sticky top-0 z-1 bg-surface/95 px-4 pt-4 pb-2 font-mono text-eyebrow font-medium text-fg-3 uppercase backdrop-blur-sm"
              >
                {title}
              </h3>
              <ul>
                {rows.map((v) => {
                  const p = v.person;
                  const isSelf = p.relation === "self";
                  const pending = pendingIds.has(p.id) && v.status === "unknown";
                  const ns = nodeStatus(v, pending);
                  const dim = !!highlight && !isSelf && !matchesHighlight(v, ns, highlight);
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        data-person-id={p.id}
                        aria-pressed={selectedId === p.id}
                        aria-label={`${p.label}: ${isSelf ? "you" : v.status}. ${isSelf ? v.headline : nodeAriaDetail(v)}`}
                        onClick={() => onSelect(p.id)}
                        className={cn(
                          "group flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-[background-color,opacity] duration-(--dur-ui)",
                          "hover:bg-sunken focus-visible:-outline-offset-2 aria-pressed:bg-evergreen-50",
                          // the legend filter fades the glyph only; text stays readable (WCAG 1.4.3)
                          dim && "[&>span:first-child]:opacity-35",
                        )}
                      >
                        <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", isSelf ? "bg-ink" : "bg-canvas")}>
                          <PedigreeGlyph
                            shape={shapeForSex(p.sex)}
                            status={ns}
                            finding={hasFinding(v)}
                            deceased={p.deceased}
                            record={v.verified}
                            proband={isSelf}
                            size={28}
                            tone={isSelf ? "night" : "paper"}
                          />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className={cn("flex items-center gap-2 text-ui font-strong", dim ? "text-fg-3" : "text-fg")}>
                            <span className="truncate">{p.label}</span>
                            {arrivedIds.has(p.id) ? (
                              <span className="rounded-xs bg-evergreen-50 px-1.5 font-mono text-eyebrow leading-5 text-evergreen-700 ring-1 ring-evergreen-600/30">
                                NEW
                              </span>
                            ) : null}
                          </span>
                          <span className={cn("truncate text-small", dim ? "text-fg-3" : "text-fg-2")}>{nodeDetail(v, ns, pending)}</span>
                        </span>
                        {/* StatusPill's own A3 label; only an invited relative gets the "Invited · waiting" word */}
                        {ns !== "self" ? <StatusPill status={ns} size="sm" label={ns === "pending" && pending ? statusWord(ns, pending) : undefined} /> : null}
                        <ChevronRight
                          aria-hidden
                          className="size-4 shrink-0 text-fg-3 transition-transform duration-(--dur-hover) group-hover:translate-x-0.5"
                        />
                      </button>
                    </li>
                  );
                })}
                {gen > 0 && addRows ? addRows(gen as 1 | 2) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
