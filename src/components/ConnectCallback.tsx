"use client";

import { useEffect, useState } from "react";
import { completeMyChartConnect, stashPortalResult } from "@/lib/smart";

// The OAuth code can be exchanged only once; guard against effects running twice.
let started = false;

export default function ConnectCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (started) return;
    started = true;
    completeMyChartConnect()
      .then(({ result, returnTo }) => {
        stashPortalResult(result);
        window.location.replace(returnTo);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
      {error ? (
        <div style={{ maxWidth: 420, display: "grid", gap: 12 }}>
          <h1 style={{ fontSize: 24 }}>Couldn&rsquo;t connect</h1>
          <p className="muted">{error}</p>
          <button className="btn btn-primary" onClick={() => history.back()}>
            Go back
          </button>
        </div>
      ) : (
        <p className="muted">Reading your record from the sandbox…</p>
      )}
    </main>
  );
}
