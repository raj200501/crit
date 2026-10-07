"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

export interface Intent {
  person?: string;
  mode?: "view" | "answer" | "invite";
  /** ?tour=0 suppresses the demo tour (e2e). */
  noTour?: boolean;
}

const KEYS = ["person", "mode", "tour"];

/**
 * Reads /tree?person={id}&mode=invite|answer and ?tour=0 (DESIGN §11.1), hands them to the workspace, then drops them
 * from the URL with history.replaceState. Mounted inside <Suspense>, so the rest of /tree still prerenders.
 * Re-runs on client navigations (e.g. the role menu's "Relative · Grandpa Luis's invite" while already on /tree).
 */
export function UrlIntent({ onIntent }: { onIntent: (intent: Intent) => void }) {
  const params = useSearchParams();
  const cb = useRef(onIntent);
  useLayoutEffect(() => {
    cb.current = onIntent;
  });
  useEffect(() => {
    if (!KEYS.some((k) => params.has(k))) return;
    const mode = params.get("mode");
    cb.current({
      person: params.get("person") ?? undefined,
      mode: mode === "invite" || mode === "answer" || mode === "view" ? mode : undefined,
      noTour: params.get("tour") === "0",
    });
    const url = new URL(window.location.href);
    KEYS.forEach((k) => url.searchParams.delete(k));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [params]);
  return null;
}
