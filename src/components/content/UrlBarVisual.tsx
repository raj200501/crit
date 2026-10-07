"use client";

import { ArrowDown, Globe, Monitor, Server } from "lucide-react";
import { useState } from "react";
import { cn } from "@/components/ui/cn";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

export interface UrlBarVisualProps {
  /** Shortened host, e.g. "family-health-tree…vercel.app". */
  host: string;
  path: string;
  /** The real base64url fragment (without "#"). */
  fragment: string;
  /** What that fragment decodes to (shown as a short excerpt). */
  decoded: Record<string, unknown>;
}

type View = "browser" | "server";
// Short visible labels (they fit a 320 px screen); the accessible names keep the full question and contain the visible text.
const VIEWS = [
  { value: "browser", label: "Your browser", ariaLabel: "In your browser" },
  { value: "server", label: "The server", ariaLabel: "What the server gets" },
] as const;

// What each key of an invite payload means (src/lib/share.ts InvitePayload).
const KEY_MEANING: Record<string, string> = {
  v: "version",
  t: "tree",
  n: "who's asking",
  p: "who's invited",
  l: "their label",
  r: "relation",
  s: "visit",
  a: "they can tell us about",
  d: "browser id",
};

/** Compact, one-line-per-key excerpt of the decoded payload (arrays shown by length). */
function excerpt(obj: Record<string, unknown>): [string, string, string][] {
  return Object.entries(obj).map(([k, v]) => [k, KEY_MEANING[k] ?? "", Array.isArray(v) ? `${v.length} relatives` : JSON.stringify(v)]);
}

/**
 * DESIGN §10.2: a glass address bar with the #fragment highlighted. Toggle between what this browser holds and the
 * request the server actually receives (the path only; no fragment, no referrer).
 */
export function UrlBarVisual({ host, path, fragment, decoded }: UrlBarVisualProps) {
  const [view, setView] = useState<View>("browser");
  const server = view === "server";
  return (
    <figure className="overflow-hidden rounded-xl border border-line bg-surface shadow-md">
      <div className="flex flex-col gap-4 border-b border-line bg-paper p-4 sm:p-6">
        <SegmentedControl label="Who sees the link" options={VIEWS} value={view} onChange={setView} fullWidth className="sm:w-auto sm:self-start" />
        {/* the address bar */}
        <div className="glass flex h-12 min-w-0 items-center gap-2.5 rounded-full border border-line-strong px-4 font-mono text-small shadow-xs">
          <Globe aria-hidden className="size-4 shrink-0 text-fg-3" strokeWidth={1.75} />
          <span className="min-w-0 truncate text-fg-2">{host}</span>
          <span className="-ml-2.5 shrink-0 text-fg">{path}</span>
          <span
            className={cn(
              "-ml-2.5 shrink-0 rounded-xs px-1 transition-[color,background-color,box-shadow] duration-(--dur-ui)",
              server ? "bg-transparent text-fg-3 line-through decoration-fg-3" : "bg-aurora-mint text-known-ink ring-1 ring-known/40",
            )}
          >
            #{fragment.slice(0, 3)}…
          </span>
        </div>
        <p className="flex items-start gap-2 text-small text-fg">
          <ArrowDown aria-hidden className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2} />
          <span>
            <span className="font-strong">Everything after # stays in your browser.</span> It&rsquo;s never sent to a server.
          </span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2">
        <div className={cn("flex min-w-0 flex-col gap-3 p-4 shadow-[inset_0_2px_0_transparent] transition-[background-color,box-shadow] duration-(--dur-ui) sm:p-6", !server && "bg-evergreen-50/60 shadow-[inset_0_2px_0_var(--color-evergreen-600)]")}>
          <p className="flex items-center gap-2 font-mono text-eyebrow text-fg-2 uppercase">
            <Monitor aria-hidden className="size-4 text-brand" strokeWidth={1.75} />
            Stays in this tab
          </p>
          <p className="text-small text-fg-2">The invite&rsquo;s data, decoded here and nowhere else:</p>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 rounded-md bg-surface p-3 ring-1 ring-line">
            {excerpt(decoded).map(([k, meaning, v]) => (
              <div key={k} className="contents">
                <dt className="text-caption whitespace-nowrap text-fg-3">
                  <span className="font-mono text-fg-2">{k}</span> {meaning}
                </dt>
                <dd className="truncate text-right font-mono text-caption text-fg">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-caption text-fg-3">Who&rsquo;s asking, who&rsquo;s invited, the visit type. No answers, no conditions.</p>
        </div>
        <div className={cn("flex min-w-0 flex-col gap-3 border-t border-line p-4 shadow-[inset_0_2px_0_transparent] transition-[background-color,box-shadow] duration-(--dur-ui) sm:border-t-0 sm:border-l sm:p-6", server && "bg-evergreen-50/60 shadow-[inset_0_2px_0_var(--color-evergreen-600)]")}>
          <p className="flex items-center gap-2 font-mono text-eyebrow text-fg-2 uppercase">
            <Server aria-hidden className="size-4 text-brand" strokeWidth={1.75} />
            Sent to the server
          </p>
          <p className="text-small text-fg-2">The whole request for that page:</p>
          <pre className="rounded-md bg-sunken p-3 font-mono text-caption leading-relaxed whitespace-pre-wrap text-fg [overflow-wrap:anywhere]">
            {`GET ${path}\nHost: ${host}\nReferer: (none)`}
          </pre>
          <p className="text-caption text-fg-3">
            Pages send <span className="font-mono">Referrer-Policy: no-referrer</span>, so the next site can&rsquo;t see where you came from either.
          </p>
        </div>
      </div>
    </figure>
  );
}
