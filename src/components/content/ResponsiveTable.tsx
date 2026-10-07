import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface ResponsiveTableColumn {
  label: string;
  /** Keep the header for screen readers only (e.g. the empty corner cell, "Stage"). */
  srOnly?: boolean;
}

export interface ResponsiveTableRow {
  /** The row header (first column). */
  head: ReactNode;
  cells: ReactNode[];
  /** Plain-text key (defaults to the head when it's a string). */
  key?: string;
}

export interface ResponsiveTableProps {
  /** Accessible name of the table (a visible caption when `showCaption`). */
  caption: string;
  showCaption?: boolean;
  /** Every column, the row-header column first. */
  columns: readonly ResponsiveTableColumn[];
  rows: readonly ResponsiveTableRow[];
  /** Column index (1-based among `cells`) to tint, e.g. the column a reader should compare against. */
  emphasize?: number;
  className?: string;
}

/**
 * DESIGN §10 table rule: a real table from 640 px (inside a keyboard-scrollable, overflow-x-auto wrapper), and below
 * 640 px the same rows as stacked cards with a <dt> label per cell, so phones never scroll sideways.
 */
export function ResponsiveTable({ caption, showCaption, columns, rows, emphasize, className }: ResponsiveTableProps) {
  const [headCol, ...cellCols] = columns;
  return (
    <div className={cn("min-w-0", className)}>
      <div
        role="group"
        aria-label={caption}
        tabIndex={0}
        className="hidden overflow-x-auto overscroll-x-contain rounded-lg border border-line bg-surface shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus sm:block"
      >
        <table className="w-full min-w-[36rem] border-collapse text-left text-small">
          <caption className={showCaption ? "border-b border-line px-5 py-3 text-left font-mono text-eyebrow text-fg-3 uppercase" : "sr-only"}>{caption}</caption>
          <thead>
            <tr className="bg-sunken">
              {columns.map((c, i) => (
                <th
                  key={c.label}
                  scope="col"
                  className={cn(
                    "px-4 py-3 align-bottom text-caption font-strong text-fg first:pl-5 last:pr-5",
                    i === 0 && "min-w-40",
                    emphasize === i && "bg-evergreen-50 text-known-ink",
                  )}
                >
                  {c.srOnly ? <span className="sr-only">{c.label}</span> : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={r.key ?? (typeof r.head === "string" ? r.head : ri)} className="border-t border-line transition-colors duration-(--dur-hover) hover:bg-paper">
                <th scope="row" className="px-4 py-3.5 pl-5 align-top font-strong text-fg">
                  {r.head}
                </th>
                {r.cells.map((cell, ci) => (
                  <td key={ci} className={cn("px-4 py-3.5 align-top text-fg-2 last:pr-5", emphasize === ci + 1 && "bg-evergreen-50/60 text-fg")}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* < 640 px: one card per row, each cell labeled */}
      <ul aria-label={caption} className="flex flex-col gap-3 sm:hidden">
        {rows.map((r, ri) => (
          <li key={r.key ?? (typeof r.head === "string" ? r.head : ri)} className="rounded-lg border border-line bg-surface p-4 shadow-xs">
            <p className="text-ui font-strong text-fg">
              {headCol.srOnly ? <span className="sr-only">{headCol.label}: </span> : null}
              {r.head}
            </p>
            <dl className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
              {r.cells.map((cell, ci) => (
                <div key={ci} className="min-w-0">
                  <dt className="font-mono text-eyebrow text-fg-3 uppercase">{cellCols[ci]?.label}</dt>
                  <dd className="mt-0.5 text-small text-fg-2">{cell}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
