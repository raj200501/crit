"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SITE } from "@/content/site";
import { Lockup } from "../brand/Lockup";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { IconButton } from "../ui/IconButton";
import { Sheet } from "../ui/Sheet";
import { useGlide } from "../ui/useGlide";
import { HonestyPill } from "./HonestyPill";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-practices", label: "For practices" },
  { href: "/privacy", label: "Privacy" },
  { href: "/research", label: "Research" },
] as const;
const MENU_LINKS = [...LINKS, { href: "/pilot", label: "Pilot" }] as const;

const subscribeScroll = (cb: () => void) => {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
};

/**
 * Floating pill nav for marketing routes. Transparent at the top; glass after 40 px, narrowing to 920 px (≥ 1024 px).
 * Turns into night glass over any band marked data-nav-theme="night". Phones: Lockup, "Demo" and a Menu sheet.
 */
export function SiteNav() {
  const pathname = usePathname();
  const underline = useRef<HTMLSpanElement>(null);
  useGlide("site-nav-underline", underline, pathname);
  const scrolled = useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > 40,
    () => false,
  );
  const [theme, setTheme] = useState<"paper" | "night">("paper");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  // Night awareness: which [data-nav-theme] band sits under the nav (top 5% of the viewport)?
  useEffect(() => {
    const under = new Set<Element>();
    let raf = 0;
    const recompute = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let best: Element | null = null;
        let bestTop = -Infinity;
        under.forEach((el) => {
          const top = el.getBoundingClientRect().top;
          if (top >= bestTop) {
            bestTop = top;
            best = el;
          }
        });
        const t = (best as HTMLElement | null)?.dataset.navTheme === "night" ? "night" : "paper";
        setTheme(t);
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? under.add(e.target) : under.delete(e.target)));
        recompute();
      },
      { rootMargin: "0px 0px -95% 0px" },
    );
    const observed = new WeakSet<Element>();
    const observeAll = () =>
      document.querySelectorAll("[data-nav-theme]").forEach((el) => {
        if (observed.has(el)) return;
        observed.add(el);
        io.observe(el);
      });
    observeAll();
    const mo = new MutationObserver((muts) => {
      if (muts.some((mu) => mu.type === "childList")) observeAll();
      recompute();
    });
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-nav-theme"] });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header data-shell="site" data-theme={theme} className="pointer-events-none fixed inset-x-0 top-0 z-(--z-nav) px-3 pt-3 print:hidden">
      <nav
        aria-label="Main"
        className={cn(
          "pointer-events-auto mx-auto flex h-14 max-w-[1240px] items-center gap-2 rounded-full border pr-1.5 pl-3 text-fg max-lg:[--wordmark-size:15px] sm:gap-3 sm:pl-4",
          "transition-[max-width,background-color,border-color,box-shadow] duration-(--dur-panel) ease-out-quart motion-reduce:transition-none",
          scrolled || menuOpen ? "glass border-line shadow-sm lg:max-w-[920px]" : "border-transparent",
        )}
      >
        <Lockup href="/" className="max-lg:[&_svg]:size-6" />
        <HonestyPill size="sm" />
        <ul data-glide-scope="" className="ml-auto hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative inline-flex h-9 items-center rounded-full px-3 text-small font-medium whitespace-nowrap transition-colors duration-(--dur-hover)",
                    active ? "text-fg" : "text-fg-2 hover:text-fg",
                  )}
                >
                  {l.label}
                  {active ? <span ref={underline} aria-hidden className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <Button href={SITE.demoHref} size="sm" className="hidden shrink-0 whitespace-nowrap lg:inline-flex">
          Try the demo family
        </Button>
        <IconButton
          ref={menuButton}
          label="Menu"
          icon={<Menu />}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
          className="ml-auto lg:hidden"
        />
      </nav>
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} side="bottom" label="Menu" snap={[0.7]} returnFocusTo={menuButton}>
        <ul className="flex flex-col py-2">
          {MENU_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
                className="flex min-h-13 items-center border-b border-line text-lead font-medium text-fg aria-[current=page]:text-brand"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <Button href={SITE.demoHref} size="lg" fullWidth className="mt-4" onClick={() => setMenuOpen(false)}>
          Try the demo family
        </Button>
      </Sheet>
    </header>
  );
}
