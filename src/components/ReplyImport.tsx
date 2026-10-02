"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cleanReport } from "@/lib/sanitize";
import { decodePayload, type ReplyPayload } from "@/lib/share";
import { actions, useTree, type ImportResult } from "@/lib/store";
import type { Report } from "@/lib/types";
import { useHash } from "@/lib/useHash";
import { Check } from "./icons";

function describe(r: Omit<Report, "id">) {
  if (r.kind === "declined") return "Prefers not to share";
  if (r.kind === "dont-know") return "Doesn’t know";
  if (r.kind === "no-history") return "No heart history";
  return `${r.condition}${r.ageAtOnset != null ? `, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}` : ""}${r.source === "record" ? " (from portal record)" : ""}`;
}

const note = { padding: 16, fontSize: 14 } as const;

export default function ReplyImport() {
  const tree = useTree();
  const hash = useHash();
  const reply = useMemo<ReplyPayload | null | undefined>(() => {
    if (hash === null) return undefined;
    const r = decodePayload<ReplyPayload>(hash);
    return r && r.v === 1 && typeof r.t === "string" && typeof r.p === "string" && Array.isArray(r.reports) ? r : null;
  }, [hash]);
  const shown = useMemo(() => (reply ? reply.reports.map(cleanReport).filter((r): r is Omit<Report, "id"> => !!r) : []), [reply]);
  const [result, setResult] = useState<ImportResult | null>(null);

  const nameOf = (id: string) => tree.people.find((p) => p.id === id)?.label ?? "Someone not in your tree";
  const from = reply ? (tree.people.find((p) => p.id === reply.p)?.label ?? String(reply.b ?? "A relative").slice(0, 60)) : "";
  const matches = reply ? reply.t === tree.id : false;
  const invited = reply ? tree.invites.some((i) => i.personId === reply.p) : false;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 64px", display: "grid", gap: 16 }}>
      {reply === undefined ? <p className="muted">Opening answers…</p> : null}
      {reply === null ? (
        <div className="card" style={{ padding: 24, display: "grid", gap: 8 }}>
          <h1 style={{ fontSize: 26 }}>This link is incomplete</h1>
          <p className="muted">Ask your relative to send the whole link again, including everything after the #.</p>
        </div>
      ) : null}
      {reply ? (
        <>
          <p className="kicker">Answers from {from}</p>
          <h1 style={{ fontSize: 30 }}>{from} answered your questions</h1>
          <ul className="card" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {shown.map((r, i) => (
              <li
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: 12,
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line)",
                  fontSize: 15,
                }}
              >
                <b>{nameOf(r.personId)}</b>
                <span>{describe(r)}</span>
              </li>
            ))}
          </ul>
          {!matches ? (
            <p className="card" style={note}>
              These answers belong to a different tree than the one in this browser. Open the link on the device where you built your tree.
            </p>
          ) : !invited ? (
            <p className="card" style={note}>
              You haven&rsquo;t invited {from} from this tree, so these answers can&rsquo;t be added. Send them an invite first.
            </p>
          ) : result?.error ? (
            <p className="card" style={note}>
              These answers couldn&rsquo;t be added.
            </p>
          ) : result ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="chip chip-known">
                <Check size={12} /> Added {result.added} {result.added === 1 ? "answer" : "answers"} to your tree
              </span>
              <Link className="btn btn-primary" href="/tree">
                Open my tree
              </Link>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => setResult(actions.importReply(reply))}>
              Add to my tree
            </button>
          )}
        </>
      ) : null}
    </main>
  );
}
