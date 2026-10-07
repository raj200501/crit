"use client";

import { m } from "motion/react";
import { BookOpen, ChevronDown, FileText, Network } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useTree } from "@/lib/store";
import { Lockup } from "./brand/Lockup";
import { cn } from "./ui/cn";
import { HonestyRibbon } from "./ui/HonestyRibbon";
import { SPRING } from "./ui/motion";
import { Popover } from "./ui/Popover";

type Active = "tree" | "summary" | "how";

const NAV = [
  { key: "tree", href: "/tree", label: "Tree", short: "Tree", icon: Network },
  { key: "summary", href: "/summary", label: "Pre-visit summary", short: "Summary", icon: FileText },
  { key: "how", href: "/how-it-works", label: "How it works", short: "How it works", icon: BookOpen },
] as const;

/**
 * App chrome for /tree, /summary and /reply. The header holds the honesty ribbon and a 60 px glass bar:
 * Lockup + PROTOTYPE chip, the "Main" nav (a segmented pill ≥ 768 px; a fixed bottom tab bar on phones) and the role menu.
 * The header is 92 px tall on desktop (--app-header-h); on phones content is padded for the tab bar.
 */
export default function AppShell({ children, active }: { children: ReactNode; active?: Active }) {
  const pathname = usePathname();
  const current: Active | undefined = active ?? NAV.find((n) => pathname === n.href || pathname?.startsWith(`${n.href}/`))?.key;

  return (
    <div className="min-h-dvh bg-bg text-fg [--app-header-h:92px] print:min-h-0 print:bg-white">
      <header data-shell="app" className="relative z-(--z-nav) md:sticky md:top-0 print:hidden">
        <HonestyRibbon />
        <div className="relative flex h-[60px] items-center gap-3 px-4 md:px-6">
          <div aria-hidden className="glass absolute inset-0 -z-10 border-b border-line" />
          <div className="flex min-w-0 items-center gap-2.5 max-md:[--wordmark-size:16px]">
            <Lockup href="/" size={26} />
            <span className="hidden rounded-xs bg-sunken px-1.5 py-0.5 font-mono text-eyebrow font-medium text-fg-2 uppercase min-[400px]:inline md:max-lg:hidden">Prototype</span>
          </div>
          <nav
            aria-label="Main"
            className={cn(
              "md:mx-auto md:rounded-full md:bg-sunken md:p-1",
              // phones: opaque, not frosted. The backdrop blur doesn't composite here, and page text showed through under the labels.
              "max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-(--z-nav) max-md:border-t max-md:border-line max-md:bg-surface max-md:pb-[env(safe-area-inset-bottom)]",
            )}
          >
            <ul className="flex max-md:h-16 md:gap-0.5">
              {NAV.map((n) => {
                const on = current === n.key;
                const Icon = n.icon;
                return (
                  <li key={n.key} className="max-md:flex-1">
                    <Link
                      href={n.href}
                      aria-current={on ? "page" : undefined}
                      aria-label={n.key === "summary" ? "Pre-visit summary" : undefined}
                      className={cn(
                        "relative isolate flex items-center justify-center font-medium whitespace-nowrap transition-colors duration-(--dur-ui)",
                        "max-md:h-full max-md:flex-col max-md:gap-1 max-md:rounded-lg max-md:text-caption max-md:focus-visible:-outline-offset-4",
                        "md:h-9 md:rounded-full md:px-4 md:text-small",
                        on ? "text-fg max-md:text-brand" : "text-fg-2 hover:text-fg",
                      )}
                    >
                      {on ? (
                        <m.span layoutId="appshell-nav-pill" transition={SPRING.glide} aria-hidden className="absolute inset-0 -z-10 rounded-full bg-surface shadow-sm max-md:hidden" />
                      ) : null}
                      {on ? <span aria-hidden className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-brand md:hidden" /> : null}
                      <Icon aria-hidden className="size-5 md:hidden" strokeWidth={1.75} />
                      <span className="md:hidden">{n.short}</span>
                      <span className="max-md:hidden">{n.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="ml-auto md:ml-0">
            <RoleMenu pathname={pathname} />
          </div>
        </div>
      </header>
      <div className="max-md:pb-[calc(64px+env(safe-area-inset-bottom))]">{children}</div>
    </div>
  );
}

/** "Viewing as {patient} (patient)": jump between the demo's three points of view. */
function RoleMenu({ pathname }: { pathname: string | null }) {
  const tree = useTree();
  const name = tree.patientName || "you";
  const mgf = tree.people.find((p) => p.id === "mgf");
  const items = [
    { role: "Patient", what: "family tree", href: "/tree" },
    { role: "Patient", what: "pre-visit summary", href: "/summary" },
    ...(mgf ? [{ role: "Relative", what: `${mgf.label}'s invite`, href: "/tree?person=mgf&mode=invite" }] : []),
    { role: "Practice", what: "care-team view", href: "/practice" },
  ];
  return (
    <Popover
      align="end"
      label="Switch the demo's point of view"
      trigger={{
        variant: "ghost",
        size: "sm",
        className: "max-lg:size-11 max-lg:px-0 lg:pr-2.5 lg:pl-1.5",
        label: (
          <>
            <span aria-hidden className="grid size-7 place-items-center rounded-full bg-ink text-caption font-strong text-white">
              {name.slice(0, 1).toUpperCase()}
            </span>
            <span className="max-lg:sr-only lg:ml-2">Viewing as {name} (patient)</span>
            <ChevronDown aria-hidden className="ml-1 size-4 text-fg-3 max-lg:hidden" />
          </>
        ),
      }}
    >
      {({ close }) => (
        <div className="w-64">
          <p className="px-3 pt-2 pb-1.5 font-mono text-eyebrow text-fg-3 uppercase">Demo · switch view</p>
          <ul className="flex flex-col">
            {items.map((it) => {
              const here = pathname === it.href;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={close}
                    aria-current={here ? "page" : undefined}
                    className="flex min-h-11 items-center gap-1 rounded-sm px-3 py-2 text-ui text-fg transition-colors hover:bg-sunken aria-[current=page]:bg-sunken"
                  >
                    <span className="text-fg-3">{it.role} ·</span> <span>{it.what}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Popover>
  );
}

export { AppShell };
