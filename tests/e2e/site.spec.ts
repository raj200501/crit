// Contract for the content pages (owner: P4; DESIGN §10 and §13.4, AMENDMENTS A1/A2). Runs against `next start`.
//   /how-it-works · /research · /for-practices · /privacy · /pilot
import { readFileSync } from "node:fs";
import path from "node:path";
import { FDA_LINE, HONESTY, PILOT, pilotHref, PROOF_POINTS, STATS } from "../../src/content/site";
import { DESKTOP, expect, expectNoSeriousA11y, gotoApp, MOBILE, noHorizontalOverflow, pdfPageCount, scrollThrough, test } from "./fixtures";
import type { Page } from "@playwright/test";

// Playwright runs from the repo root (playwright.config.ts); import.meta would switch this file to ESM.
const ROOT = process.cwd();

const PAGES = [
  { path: "/how-it-works", title: "How it works · Family Health Tree", h1: "How it works, and how it would really work." },
  { path: "/research", title: "Research · Family Health Tree", h1: "The research behind Family Health Tree" },
  { path: "/for-practices", title: "For practices · Family Health Tree", h1: "Family history that arrives before the patient does." },
  { path: "/privacy", title: "Security & privacy · Family Health Tree", h1: "Security & privacy" },
  { path: "/pilot", title: "Pilot · Family Health Tree", h1: "A paid 8–12 week pilot for independent NYC cardiology practices." },
] as const;

/** Text with typographic quotes, non-breaking spaces and runs of whitespace flattened, for verbatim comparisons. */
const norm = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();

const mainText = (page: Page) => page.locator("main").evaluate((m) => (m as HTMLElement).textContent ?? "");

test.describe("every content page", () => {
  for (const p of PAGES) {
    test(`${p.path}: one main, one h1, the right <title>, site nav, footer and the synthetic notice`, async ({ page }) => {
      await gotoApp(page, p.path);
      await expect(page).toHaveTitle(p.title);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main#main")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1, name: p.h1, exact: true })).toBeVisible();
      await expect(page.locator('header[data-shell="site"]')).toBeVisible();
      await expect(page.locator('header[data-shell="site"]')).toContainText(/Synthetic demo|Demo/);
      await expect(page.locator('footer[data-shell="footer"]')).toContainText(HONESTY.footer);
    });

    test(`${p.path}: honesty scan (no certification claims, no "verified", no time-to-complete claims, care-team links go to /practice)`, async ({ page }) => {
      await gotoApp(page, p.path);
      let text = norm(await mainText(page));
      if (p.path !== "/research") {
        // Quoting a banned phrase to refuse it is allowed ("There's no such thing as "HIPAA certified"", never "verified").
        text = text.replace(/"[^"]*(verified|HIPAA[ -](certified|compliant))[^"]*"/gi, "").replace(/No verified criterion/g, "");
        expect(text).not.toMatch(/\bverified\b/i);
        expect(text).not.toMatch(/HIPAA[ -](certified|compliant)/i);
      }
      expect(text).not.toMatch(/trusted by/i);
      // no user counts or growth metrics about us (/research quotes study populations)
      if (p.path !== "/research") expect(text).not.toMatch(/\b\d[\d,]* (users|patients onboarded|practices use)\b/i);
      // no time-to-complete claims for our product (AMENDMENTS A2); /research quotes sourced study times
      if (p.path !== "/research") expect(text).not.toMatch(/(about|takes|only|in) \d+ minutes?\b(?! saved)/i);
      expect(await page.locator('main a[href*="view=care-team"]').count()).toBe(0);
    });
  }
});

test.describe("/research", () => {
  test("every TOC link resolves, the cited sources and §2 anchor exist, and the meta line is computed", async ({ page }) => {
    await gotoApp(page, "/research");
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll('nav[aria-label="On this page"] a[href^="#"]')]
        .map((a) => decodeURIComponent((a as HTMLAnchorElement).hash.slice(1)))
        .filter((id) => !document.getElementById(id)),
    );
    expect(missing).toEqual([]);
    expect(await page.locator('nav[aria-label="On this page"] a[href^="#"]').count()).toBeGreaterThan(30);
    for (const n of [32, 72, 83, 84, 87, 89, 95, 117]) {
      await expect(page.locator(`li#source-${n}`)).toHaveCount(1);
      expect((await page.locator(`li#source-${n}`).textContent())?.length ?? 0).toBeGreaterThan(20);
    }
    await expect(page.locator('[id="2-privacy-and-compliance"]')).toHaveText("2. Privacy and compliance");
    await expect(page.locator("main")).toContainText(/121 sources\s*·\s*\d+ min read\s*·\s*Updated Oct 2026/i);
    // [87] links to its source and is never nested in another link or code
    await expect(page.locator('main a.cite[href="#source-87"]').first()).toHaveText("[87]");
    expect(await page.locator("main a a.cite, main code a.cite, main pre a.cite").count()).toBe(0);
    // the "<health system>" placeholder survives as text
    await expect(page.locator("main")).toContainText("from <health system>'s record");
  });

  test("site.ts citations land on real sources", async ({ page }) => {
    await gotoApp(page, "/research");
    for (const n of new Set([...STATS.map((s) => s.cite), ...PROOF_POINTS.map((p) => p.cite), FDA_LINE.cite])) {
      await expect(page.locator(`li#source-${n}`)).toHaveCount(1);
    }
  });

  test("external links open in a new tab without a referrer", async ({ page }) => {
    await gotoApp(page, "/research");
    const external = page.locator('main a[href^="http"]');
    expect(await external.count()).toBeGreaterThan(100);
    await expect(external.first()).toHaveAttribute("target", "_blank");
    await expect(external.first()).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("scroll-spy marks the section in view with aria-current=location", async ({ page }) => {
    await gotoApp(page, "/research#2-privacy-and-compliance");
    const toc = page.getByRole("navigation", { name: "On this page" });
    await expect(toc.locator('a[href="#2-privacy-and-compliance"]')).toHaveAttribute("aria-current", "location");
    await page.evaluate(() => document.getElementById("4-business")?.scrollIntoView({ block: "start" }));
    await expect(toc.locator('a[aria-current="location"]')).toHaveCount(1);
    await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#4-business");
  });

  test.describe("on phones", () => {
    test.use(MOBILE);
    test("the TOC is an 'On this page' disclosure that names the section and closes when a link is chosen", async ({ page }) => {
      await gotoApp(page, "/research");
      const details = page.locator("details", { has: page.locator("summary", { hasText: "On this page" }) });
      await expect(details).toBeVisible();
      await details.locator("summary").click();
      await expect(details).toHaveAttribute("open", "");
      await details.getByRole("link", { name: /Privacy and compliance/ }).click();
      await expect(details).not.toHaveAttribute("open", "");
      await expect(details.locator("summary")).toContainText("Privacy and compliance");
    });
  });
});

test.describe("/how-it-works", () => {
  test("every fact-checked string from the pre-revamp page is still there, verbatim", async ({ page }) => {
    const facts = JSON.parse(readFileSync(path.join(ROOT, "tests/fixtures/how-it-works-facts.json"), "utf8")) as {
      arrays: { bottomLine: { k: string; v: string }[]; dataStages: string[][]; criteria: string[][]; market: string[][]; risks: string[][] };
      prose: string[];
    };
    const strings = [
      ...facts.arrays.bottomLine.flatMap((b) => [b.k, b.v]),
      ...facts.arrays.dataStages.flat(),
      ...facts.arrays.criteria.flat(),
      ...facts.arrays.market.flat(),
      ...facts.arrays.risks.flat(),
      ...facts.prose,
    ];
    expect(strings.length).toBeGreaterThan(100);
    await gotoApp(page, "/how-it-works");
    const text = norm(await mainText(page));
    const lost = strings.filter((s) => !text.includes(norm(s)));
    expect(lost, `missing from /how-it-works:\n${lost.join("\n")}`).toEqual([]);
  });

  test("sub-nav: seven sections, each resolves, scroll-spy follows; the data table's first header is named; the Box note moved here", async ({ page }) => {
    await gotoApp(page, "/how-it-works");
    const sub = page.getByRole("navigation", { name: "Sections on this page" });
    const links = sub.getByRole("link");
    await expect(links).toHaveText(["The product", "Where data goes", "Patient portals", "Privacy", "Clinical criteria", "Business", "Riskiest assumptions"]);
    for (const id of await links.evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).hash.slice(1)))) {
      await expect(page.locator(`[id="${id}"]`)).toHaveCount(1);
    }
    await page.evaluate(() => document.getElementById("business")?.scrollIntoView({ block: "start" }));
    await expect(sub.getByRole("link", { name: "Business" })).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#data table thead th").first()).toHaveText("Stage");
    await expect(page.locator("main")).toContainText("Sending the summary into a practice’s own Box Enterprise folder needs a signed BAA");
    await expect(page.locator("main")).toContainText("Alex’s family is made up.");
  });
});

test.describe("/for-practices", () => {
  test("hero CTAs (A1: the care-team view is /practice), annotated sheet, how it arrives, intake, FDA line, evidence, pilot", async ({ page }) => {
    await gotoApp(page, "/for-practices");
    await expect(page.getByRole("link", { name: "Request a pilot conversation" }).first()).toHaveAttribute("href", pilotHref());
    await expect(page.getByRole("link", { name: /Open the care-team view/ })).toHaveAttribute("href", "/practice");
    const callouts = page.getByRole("list", { name: "What's on the care-team page" }).getByRole("button");
    await expect(callouts).toHaveCount(5);
    await expect(callouts.first()).toHaveAttribute("aria-pressed", "true");
    await callouts.nth(1).click();
    await expect(callouts.nth(1)).toHaveAttribute("aria-pressed", "true");
    await expect(callouts.first()).toHaveAttribute("aria-pressed", "false");
    await callouts.nth(3).focus();
    await expect(callouts.nth(3)).toHaveAttribute("aria-pressed", "true");
    // the annotated sheet is the real, readable document, titled at h3 under the section's h2
    const sheet = page.locator("#on-the-page").getByRole("article", { name: "Pre-visit family history summary" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("heading", { level: 3, name: "Alex" })).toBeVisible();
    await expect(sheet.getByRole("heading", { level: 4, name: /For clinician review/ })).toBeVisible();
    for (const t of ["Print", "QR or read-only link at check-in", "FHIR FamilyMemberHistory"]) await expect(page.getByRole("heading", { level: 3, name: t, exact: true })).toBeVisible();
    await expect(page.locator("main")).toContainText("Built to be read in about a minute. That’s a target we’re testing with clinicians, not a result.");
    await expect(page.locator("main")).toContainText(FDA_LINE.text);
    await expect(page.locator(`main a[href="/research#source-${FDA_LINE.cite}"]`).first()).toBeAttached();
    await expect(page.locator("main")).toContainText("Guideline criteria appear only on the care-team page, each with its basis, inputs and what’s missing.");
    await expect(page.locator("main")).toContainText(PILOT.never);
  });

  test("AMENDMENTS A2: the two texts carry no health information and no time estimate", async ({ page }) => {
    await gotoApp(page, "/for-practices");
    const practice = norm((await page.locator("figure", { hasText: "Practice → patient" }).locator("p").first().textContent()) ?? "");
    expect(practice).toBe("Cardiology Associates: before your visit on Oct 14, you can put together your family history here: link");
    const invite = norm((await page.locator("figure", { hasText: "Patient → relative" }).locator("p").first().textContent()) ?? "");
    expect(invite).toMatch(/^Hi, it's Alex\. I'm putting together our family health history and would love your help\. Here's a private link; you can answer, skip, or say no: \S+\/invite#eyJ\S*$/);
    for (const t of [practice, invite]) expect(t).not.toMatch(/heart|cardio(?!logy Associates)|minute|\bmin\b/i);
  });

  test("evidence numerals are static and server-rendered (no tickers)", async ({ request }) => {
    const html = await (await request.get("/for-practices")).text();
    for (const s of STATS) expect(html).toContain(`/research#source-${s.cite}`);
    expect(html).toContain("57.6");
    expect(html).toMatch(/~(<!-- -->)?11/);
  });
});

test.describe("/privacy", () => {
  test("every section anchor exists; #prototype stays for the HonestyPill", async ({ page }) => {
    await gotoApp(page, "/privacy");
    for (const id of ["prototype", "mychart", "relatives", "pilot", "never", "delete"]) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Read the research on privacy and compliance" })).toHaveAttribute("href", "/research#2-privacy-and-compliance");
    await expect(page.locator("main")).toContainText("Life, disability and long-term-care insurers can legally ask about family history. We never share with them.");
  });

  test("the CSP shown on the page is the CSP the server sends", async ({ page }) => {
    const res = await gotoApp(page, "/privacy");
    const header = (await res!.headerValue("content-security-policy")) ?? "";
    const sent = header.split(";").map((d) => d.trim().replace(/\s+/g, " ")).filter(Boolean);
    const shown = await page.locator("[data-csp] dt").evaluateAll((dts) => dts.map((dt) => (dt.textContent ?? "").trim().replace(/\s+/g, " ")));
    expect(shown).toEqual(sent);
  });

  test("the address bar shows the #fragment and toggles to what the server receives", async ({ page }) => {
    await gotoApp(page, "/privacy");
    await expect(page.locator("main")).toContainText("#eyJ…");
    const server = page.getByRole("button", { name: "What the server gets" });
    await server.click();
    await expect(server).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("main")).toContainText("Referer: (none)");
  });
});

test.describe("/pilot", () => {
  test("pricing, metrics, go/no-go, the ROI calculator (assumptions labeled) and #contact", async ({ page }) => {
    await gotoApp(page, "/pilot");
    await expect(page.locator("#pricing")).toContainText(PILOT.stamp, { ignoreCase: true });
    await expect(page.locator("#pricing")).toContainText("Never priced per referral, new patient or booking");
    await expect(page.locator("#pricing")).toContainText("$99–149 per cardiologist per month");
    await expect(page.locator("#pricing")).toContainText(PILOT.beforeRealData);
    for (const m of PILOT.metrics) await expect(page.locator("#metrics")).toContainText(m);
    await expect(page.locator("#metrics")).toContainText(PILOT.goNoGo);

    const out = page.locator("#roi output");
    await expect(out).toHaveAttribute("aria-live", "polite");
    await expect(out).toContainText("≈ $200");
    await expect(out).toContainText("of staff time per month");
    await expect(page.locator("#roi").getByText("Assumption", { exact: true })).toHaveCount(2);
    await expect(page.locator("#roi").getByText("Assumption", { exact: true }).first()).toBeVisible();
    await page.getByLabel("New patients per month").fill("120");
    await expect(out).toContainText("≈ $600");
    await page.getByLabel("Loaded staff cost per hour").fill("");
    await expect(out).toContainText("≈ $0");
    await page.getByRole("button", { name: "Reset to the defaults" }).click();
    await expect(out).toContainText("≈ $200");
    await expect(page.locator("#roi")).toContainText(PILOT.roiCaveat);

    await expect(page.locator("#contact")).toBeVisible();
    await expect(page.locator("#contact").getByRole("button", { name: "Print this brief" })).toBeVisible();
  });

  test("prints on exactly one Letter page", async ({ page }) => {
    for (const width of [1360, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await gotoApp(page, "/pilot");
      expect(pdfPageCount(await page.pdf({ format: "Letter", printBackground: true })), `at ${width} px`).toBe(1);
    }
  });
});

test.describe("layout and accessibility", () => {
  for (const [label, device] of [
    ["1440", DESKTOP],
    ["390", MOBILE],
  ] as const) {
    test.describe(`at ${label} px`, () => {
      test.use(device);
      for (const p of PAGES) {
        test(`${p.path}: no horizontal overflow; 0 serious or critical axe issues`, async ({ page }) => {
          await gotoApp(page, p.path);
          await scrollThrough(page);
          await noHorizontalOverflow(page);
          await expectNoSeriousA11y(page);
        });
      }
    });
  }

  test("no horizontal overflow at 375 px without mobile emulation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    for (const p of PAGES) {
      await gotoApp(page, p.path);
      await scrollThrough(page, 900);
      await noHorizontalOverflow(page);
    }
  });

  test("open states pass axe: research TOC on phones, privacy server view, a chosen callout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, "/research");
    await page.locator("summary", { hasText: "On this page" }).click();
    await expectNoSeriousA11y(page, { include: ["details[open]"] });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/privacy");
    await page.getByRole("button", { name: "What the server gets" }).click();
    await expectNoSeriousA11y(page, { include: ["#prototype"] });
    await gotoApp(page, "/for-practices");
    await page.getByRole("list", { name: "What's on the care-team page" }).getByRole("button").nth(4).click();
    await expectNoSeriousA11y(page, { include: ["#on-the-page"] });
  });

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("nothing keeps running on any content page", async ({ page }) => {
      for (const p of PAGES) {
        await gotoApp(page, p.path);
        await scrollThrough(page, 1200);
        await page.waitForTimeout(300);
        const running = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((a) => a.playState === "running")
            .map((a) => `${(a as CSSAnimation).animationName ?? a.constructor.name} on ${((a.effect as KeyframeEffect | null)?.target as Element | null)?.tagName}`),
        );
        expect(running, p.path).toEqual([]);
      }
    });
  });
});
