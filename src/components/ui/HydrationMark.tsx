"use client";

import { useEffect } from "react";

/**
 * Sets html[data-hydrated] once React has hydrated the page (the root's effects run after the whole tree commits).
 * e2e tests wait for it before clicking client-rendered controls. It changes nothing visible.
 */
export function HydrationMark() {
  useEffect(() => {
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);
  return null;
}
