"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/** The URL fragment without "#", or null while rendering on the server. */
export function useHash(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => window.location.hash.replace(/^#/, ""),
    () => null,
  );
}
