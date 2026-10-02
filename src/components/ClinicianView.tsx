"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { unpackJson } from "@/lib/compress";
import { cleanTree } from "@/lib/sanitize";
import type { FamilyTree } from "@/lib/types";
import { useHash } from "@/lib/useHash";
import { Logo } from "./icons";
import SummaryDocument from "./SummaryDocument";

export default function ClinicianView() {
  const hash = useHash();
  const [unpacked, setUnpacked] = useState<{ hash: string; tree: FamilyTree | null } | null>(null);

  useEffect(() => {
    if (!hash) return;
    let live = true;
    unpackJson<unknown>(hash).then((t) => {
      if (live) setUnpacked({ hash, tree: cleanTree(t) });
    });
    return () => {
      live = false;
    };
  }, [hash]);

  // undefined = still loading, null = missing or broken link
  const tree: FamilyTree | null | undefined = hash === null ? undefined : hash === "" ? null : unpacked?.hash === hash ? unpacked.tree : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-2)" }}>
      <header
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 24px",
          background: "#fff",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <Link href="/" style={{ display: "inline-flex", gap: 8, alignItems: "center", fontWeight: 700, textDecoration: "none" }}>
          <Logo size={20} /> Family Health Tree
        </Link>
        <span className="chip">Read-only · shared by the patient</span>
      </header>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px 64px" }}>
        {tree === undefined ? <p className="muted">Opening summary…</p> : null}
        {tree === null ? (
          <div className="card" style={{ padding: 24 }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>This link is incomplete</h1>
            <p className="muted">Ask the patient to share the whole link again, including everything after the #.</p>
          </div>
        ) : null}
        {tree ? (
          <>
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                Print
              </button>
            </div>
            <SummaryDocument tree={tree} audience="clinician" />
          </>
        ) : null}
      </main>
    </div>
  );
}
