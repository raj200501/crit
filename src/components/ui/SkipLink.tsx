"use client";

import { usePathname } from "next/navigation";
import { useEffect, type MouseEvent } from "react";

// The skip link targets #main. Pages that predate the revamp render a <main> without that id, so after
// hydration (and after each client navigation) the first <main> gets id="main" if nothing else has it.
// On activation, focus moves into <main> explicitly (a fragment jump alone doesn't move focus everywhere).
export function SkipLink() {
  const pathname = usePathname();
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (document.getElementById("main")) return;
      const main = document.querySelector("main");
      if (main && !main.id) main.id = "main";
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("main") ?? document.querySelector("main");
    if (!target) return;
    e.preventDefault();
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "start" });
  };
  return (
    <a
      href="#main"
      onClick={onClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
    >
      Skip to content
    </a>
  );
}
