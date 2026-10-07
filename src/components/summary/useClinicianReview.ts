"use client";

import { useCallback, useSyncExternalStore } from "react";

// "Mark reviewed by clinician (demo, this browser only)" (DESIGN §11.2): localStorage fht:clinician-reviewed:{contentKey}.
// Presentation-only state; every access is wrapped, with an in-memory fallback when storage is blocked.
const PREFIX = "fht:clinician-reviewed:";
const listeners = new Set<() => void>();
/** Fallback when storage is blocked (private mode, sandboxed previews): the switch still works for this page view. */
const memory = new Map<string, string>();

function read(key: string | null): string | null {
  if (!key) return null;
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(PREFIX)) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** [reviewedAt ISO or null, set(reviewed)] for this exact content. */
export function useClinicianReview(contentKey: string | null): [string | null, (reviewed: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(contentKey),
    () => null,
  );
  const set = useCallback(
    (reviewed: boolean) => {
      if (!contentKey) return;
      try {
        if (reviewed) window.localStorage.setItem(PREFIX + contentKey, new Date().toISOString());
        else window.localStorage.removeItem(PREFIX + contentKey);
      } catch {
        if (reviewed) memory.set(contentKey, new Date().toISOString());
        else memory.delete(contentKey);
      }
      listeners.forEach((l) => l());
    },
    [contentKey],
  );
  return [value, set];
}
