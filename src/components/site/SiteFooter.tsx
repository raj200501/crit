import Link from "next/link";
import { BRAND_LINE, HONESTY, SITE } from "@/content/site";
import { Lockup } from "../brand/Lockup";
import { Container } from "../ui/Container";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: SITE.demoHref, label: "Try the demo" },
      { href: "/summary", label: "Pre-visit summary" },
    ],
  },
  {
    title: "For practices",
    links: [
      { href: "/for-practices", label: "For practices" },
      { href: "/pilot", label: "Pilot" },
      { href: "/practice", label: "Care-team view" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/research", label: "Research" },
    ],
  },
] as const;

/** Night footer with grain: the lockup and the brand line, link columns, the legal line, the team line and a giant (aria-hidden) wordmark. */
export function SiteFooter() {
  return (
    <footer data-shell="footer" data-theme="night" data-nav-theme="night" className="grain relative overflow-hidden bg-bg text-fg print:hidden">
      <Container className="grid gap-12 pt-20 pb-12 lg:grid-cols-[1fr_2fr]">
        <div className="max-w-[22rem]">
          <Lockup href="/" size={34} descriptor />
          <p className="mt-5 text-small text-fg-2">{BRAND_LINE}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="min-w-0">
              <h2 className="font-mono text-eyebrow text-fg-3 uppercase">{col.title}</h2>
              <ul className="mt-4 flex flex-col gap-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-9 items-center text-small text-fg-2 transition-colors hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </Container>
      <Container className="pb-8">
        {/* the hairline sits inside the gutters, so it lines up with the text above and below */}
        <div className="flex flex-col gap-2 border-t border-line pt-6 text-small text-fg-2">
          <p>{HONESTY.footer}</p>
          <p>{HONESTY.team}</p>
        </div>
      </Container>
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.18em] bg-linear-to-b from-ivory/22 to-transparent to-80% bg-clip-text text-center font-display text-[clamp(5rem,24vw,22rem)] leading-[0.95] font-light tracking-[-0.04em] whitespace-nowrap text-transparent select-none"
      >
        Stemma
      </p>
    </footer>
  );
}
