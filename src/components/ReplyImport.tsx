"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { decodePayload, type ReplyPayload } from "@/lib/share";
import { actions, useTree } from "@/lib/store";
import { useHash } from "@/lib/useHash";
import { Check } from "./icons";

function describe(r: ReplyPayload["reports"][number]) {
  if (r.kind === "declined") return "Prefers not to share";
  if (r.kind === "dont-know") return "Doesn’t know";
  if (r.kind === "no-history") return "No heart history";
  return `${r.condition}${r.ageAtOnset != null ? `, ${r.approximate ? "about " : ""}age ${r.ageAtOnset}` : ""}${r.source === "record" ? " (from portal record)" : ""}`;
}

export default function ReplyImport() {
  const tree = useTree();
  const hash = useHash();
  const reply = useMemo<ReplyPayload | null | undefined>(() => {
    if (hash === null) return undefined;
    const r = decodePayload<ReplyPayload>(hash);
    return r && r.v === 1 && Array.isArray(r.reports) ? r : null;
  }, [hash]);
  const [added, setAdded] = useState<number | null>(null);

  const nameOf = (id: string) => tree.people.find((p) => p.id === id)?.label ?? "Someone not in your tree";
  const matches = reply ? reply.t === tree.id : false;
  const already = reply ? reply.reports.every((r) => tree.reports.some((x) => x.personId === r.personId && x.reportedAt === r.reportedAt && x.kind === r.kind)) : false;

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
          <p className="kicker">Answers from {reply.b}</p>
          <h1 style={{ fontSize: 30 }}>{reply.b} answered your questions</h1>
          <ul className="card" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {reply.reports.map((r, i) => (
              <li key={i} style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, padding: "12px 16px", borderBottom: "1px solid var(--line)", fontSize: 15 }}>
                <b>{nameOf(r.personId)}</b>
                <span>{describe(r)}</span>
              </li>
            ))}
          </ul>
          {!matches ? (
            <p className="card" style={{ padding: 16, fontSize: 14 }}>
              These answers belong to a different tree than the one in this browser. Open the link on the device where you built your tree.
            </p>
          ) : added != null || already ? (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span className="chip chip-known">
                <Check size={12} /> Added to your tree
              </span>
              <Link className="btn btn-primary" href="/tree">
                Open my tree
              </Link>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => {
                setAdded(actions.addReports(reply.reports));
                actions.markInviteAnswered(reply.p);
              }}
            >
              Add to my tree
            </button>
          )}
        </>
      ) : null}
    </main>
  );
}
