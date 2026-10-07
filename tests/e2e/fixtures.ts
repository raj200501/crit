// Shared e2e helpers (DESIGN §13.1). Owned by P1: other packages import from here and never edit it;
// ask for additions through a "foundation follow-up" PR.
import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";

export { expect };

/** iPhone-13-sized Chromium (WebKit isn't installed here). Use with test.use(MOBILE) or browser.newContext(MOBILE). */
export const MOBILE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } as const;
export const DESKTOP = { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false } as const;
/** The relative's phone in the cross-device invite flow (matches the original e2e scripts). */
export const RELATIVE_PHONE = { viewport: { width: 400, height: 860 }, isMobile: true, hasTouch: true } as const;

/**
 * Every route the app serves (csp.spec, the honesty scan and the overflow checks walk this list).
 * /for-practices, /privacy and /pilot are P1 placeholders until P4 replaces them; /practice is P1's placeholder for P7.
 */
export const ROUTES = [
  "/",
  "/how-it-works",
  "/research",
  "/for-practices",
  "/privacy",
  "/pilot",
  "/tree",
  "/summary",
  "/view",
  "/invite",
  "/reply",
  "/connect/callback",
  "/design-system",
  "/practice",
] as const;

/** Tests that need the public SMART sandbox run only with E2E_SANDBOX=1 (and are tagged @sandbox). */
export const SANDBOX = process.env.E2E_SANDBOX === "1";
/** Chromium launch options for @sandbox tests: outbound HTTPS goes through the proxy; localhost stays direct. */
export const SANDBOX_LAUNCH = process.env.HTTPS_PROXY
  ? { args: [`--proxy-server=${process.env.HTTPS_PROXY}`, "--proxy-bypass-list=localhost;127.0.0.1"] }
  : {};
export const SANDBOX_HOSTS = /(^|\.)smarthealthit\.org$|(^|\.)fhir\.epic\.com$/;

export interface CspViolation {
  page: string;
  blockedURI: string;
  violatedDirective: string;
  sourceFile: string;
}

type Fixtures = {
  /** Set localStorage['fht:tour:v1']="done" before every page loads (default true). Opt out: test.use({ skipTour: false }). */
  skipTour: boolean;
  /** Fail the test on any uncaught page error or same-origin HTTP ≥ 400 response (default true). */
  failOnPageError: boolean;
  /** Same-origin HTTP error responses a test expects (e.g. [/\/no-such-page/] for the 404 page). Default []. */
  allowHttpErrors: RegExp[];
  /** Every securitypolicyviolation on our origin in this test's context (all pages, across navigations). */
  cspViolations: CspViolation[];
  /** Uncaught page errors and same-origin HTTP ≥ 400 responses (e.g. a link prefetch that 404s). */
  pageErrors: string[];
};

const IGNORED_ERRORS = [/ResizeObserver loop/];

/**
 * Wires a browser context for the contract: tour skipped (optional), CSP violations, uncaught page errors and
 * same-origin HTTP ≥ 400 responses collected from every page, across navigations. The fixtures use it for the default
 * context; call it yourself for extra contexts (e.g. the relative's phone) and assert on the returned lists.
 */
export async function instrumentContext(
  context: BrowserContext,
  baseURL: string | undefined,
  opts: { skipTour?: boolean; allowHttpErrors?: RegExp[] } = {},
) {
  const origin = new URL(baseURL ?? "http://localhost").origin;
  const csp: CspViolation[] = [];
  const errors: string[] = [];
  await context.exposeBinding("__fhtReportCsp", ({ page }, v: Omit<CspViolation, "page">) => {
    const url = page.url();
    if (url.startsWith(origin)) csp.push({ page: url, ...v });
  });
  await context.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => {
      const w = window as unknown as { __fhtReportCsp?: (v: unknown) => void };
      w.__fhtReportCsp?.({ blockedURI: e.blockedURI, violatedDirective: e.violatedDirective, sourceFile: e.sourceFile });
    });
  });
  if (opts.skipTour ?? true) {
    await context.addInitScript(() => {
      try {
        localStorage.setItem("fht:tour:v1", "done");
      } catch {
        // storage blocked: the tour may show
      }
    });
  }
  const watch = (p: Page) =>
    p.on("pageerror", (err) => {
      if (p.url().startsWith(origin) && !IGNORED_ERRORS.some((re) => re.test(String(err)))) errors.push(`${p.url()}: ${err}`);
    });
  context.pages().forEach(watch);
  context.on("page", watch);
  // A response listener, not a console one: the sandbox-offline tests abort external requests on purpose, and those log console errors.
  context.on("response", (r) => {
    const url = r.url();
    if (url.startsWith(origin) && r.status() >= 400 && !(opts.allowHttpErrors ?? []).some((re) => re.test(url))) errors.push(`HTTP ${r.status()} ${url}`);
  });
  return { csp, errors };
}

export function expectClean(report: { csp: CspViolation[]; errors: string[] }) {
  expect(report.csp, `CSP violations:\n${report.csp.map((v) => `${v.violatedDirective} <- ${v.blockedURI} (${v.page})`).join("\n")}`).toEqual([]);
  expect(report.errors, `Uncaught page errors / HTTP errors:\n${report.errors.join("\n")}`).toEqual([]);
}

type Internal = { /** Internal: collected CSP violations and page errors, asserted after each test. */ contractReport: { csp: CspViolation[]; errors: string[] } };

export const test = base.extend<Fixtures & Internal>({
  skipTour: [true, { option: true }],
  failOnPageError: [true, { option: true }],
  allowHttpErrors: [[], { option: true }],
  contractReport: [
    async ({ context, baseURL, skipTour, failOnPageError, allowHttpErrors }, provide) => {
      const report = await instrumentContext(context, baseURL, { skipTour, allowHttpErrors });
      await provide(report);
      expect(report.csp, `CSP violations:\n${report.csp.map((v) => `${v.violatedDirective} <- ${v.blockedURI} (${v.page})`).join("\n")}`).toEqual([]);
      if (failOnPageError) expect(report.errors, `Uncaught page errors / HTTP errors:\n${report.errors.join("\n")}`).toEqual([]);
    },
    { auto: true },
  ],
  cspViolations: async ({ contractReport }, provide) => provide(contractReport.csp),
  pageErrors: async ({ contractReport }, provide) => provide(contractReport.errors),
});

/** Navigate and wait until React has hydrated (html[data-hydrated], set by the root layout). */
export async function gotoApp(page: Page, path: string, opts?: { waitUntil?: "load" | "domcontentloaded" | "commit" }) {
  const res = await page.goto(path, { waitUntil: opts?.waitUntil ?? "load" });
  await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 15_000 });
  return res;
}

/** Waits for hydration on a page that navigated by itself (e.g. a popup or a link click). */
export async function waitForApp(page: Page) {
  await page.waitForLoadState("load");
  await page.locator("html[data-hydrated]").waitFor({ state: "attached", timeout: 15_000 });
}

/** Scroll to the bottom in steps so IntersectionObserver-driven content (reveals, tickers, lazy islands) runs. */
export async function scrollThrough(page: Page, step = 600) {
  await page.evaluate(async (dy) => {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.documentElement.scrollHeight; y += dy) {
      window.scrollTo(0, y);
      await delay(60);
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await delay(120);
  }, step);
}

export type AxeOptions = {
  /** CSS selectors to limit the scan to. */
  include?: string[];
  exclude?: string[];
  disableRules?: string[];
  /** Run only these rules (e.g. ["region"]); overrides the WCAG tag filter. */
  rules?: string[];
};

/** Hides the `grain` noise overlay: axe can't compute contrast through a pseudo-element, so it would report every node in a
 *  grain band (night footer, night sections) as "incomplete" instead of checking it. Returns a function that restores it. */
export async function hideGrain(page: Page): Promise<() => Promise<void>> {
  const tag = await page.addStyleTag({ content: ".grain::after{display:none!important}" });
  return async () => {
    await tag.evaluate((el) => (el as Element).remove()).catch(() => {});
  };
}

/** axe-core with WCAG 2.2 A/AA tags. Returns serious + critical violations (the gate) and everything else.
 *  Grain overlays are hidden while it runs (see hideGrain); build your own AxeBuilder only together with hideGrain. */
export async function axe(page: Page, opts: AxeOptions = {}) {
  let builder = new AxeBuilder({ page });
  builder = opts.rules ? builder.withRules(opts.rules) : builder.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"]);
  for (const sel of opts.include ?? []) builder = builder.include(sel);
  for (const sel of opts.exclude ?? []) builder = builder.exclude(sel);
  if (opts.disableRules?.length) builder = builder.disableRules(opts.disableRules);
  const restoreGrain = await hideGrain(page);
  const result = await builder.analyze().finally(restoreGrain);
  const serious = result.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  const summary = serious
    .map((v) => `${v.impact} ${v.id}: ${v.help}\n${v.nodes.slice(0, 6).map((n) => `    ${n.target.join(" ")} ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`).join("\n")}`)
    .join("\n");
  return { serious, all: result.violations, summary };
}

/** The accessibility gate: 0 serious and 0 critical violations. */
export async function expectNoSeriousA11y(page: Page, opts: AxeOptions = {}) {
  const { serious, summary } = await axe(page, opts);
  expect(serious, `axe found serious/critical issues:\n${summary}`).toEqual([]);
}

/** No horizontal page scroll (scrollWidth ≤ innerWidth). */
export async function noHorizontalOverflow(page: Page) {
  const [scrollWidth, innerWidth] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(scrollWidth, `page is ${scrollWidth}px wide in a ${innerWidth}px viewport`).toBeLessThanOrEqual(innerWidth);
}

/** Number of pages in a PDF produced by page.pdf() (reads the page tree's /Count, falling back to counting /Type /Page). */
export function pdfPageCount(pdf: Buffer | Uint8Array): number {
  const text = Buffer.from(pdf).toString("latin1");
  const counts = [...text.matchAll(/\/Type\s*\/Pages\b[^>]*?\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  if (counts.length) return Math.max(...counts);
  return (text.match(/\/Type\s*\/Page\b(?!s)/g) ?? []).length;
}

/** All requests a page makes, for "nothing leaves the origin" checks. */
export function recordRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  return urls;
}

/** Block the public SMART sandbox (and Epic) so the "sandbox offline" fallback is deterministic in CI. */
export async function blockSandbox(context: BrowserContext) {
  await context.route(/https:\/\/([a-z0-9-]+\.)*(smarthealthit\.org|fhir\.epic\.com)\//, (route) => route.abort("internetdisconnected"));
}

/** Copy the stored tree out of localStorage (to assert something did or didn't write it). */
export async function storedTree(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    try {
      return localStorage.getItem("fht:tree:v1");
    } catch {
      return null;
    }
  });
}
