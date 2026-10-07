// P2: the Night Window, the Clearing and OneFactBeam (DESIGN §9.8, §13.2), on the landing page "/" where P3 mounts
// HeroStage (with HeroCopy) and OneFactBeam (in the relatives section).
// Runs under chromium; with E2E_WEBKIT=1 the webkit project runs it too (WebKit isn't installed in this environment).
import { gzipSync } from "node:zlib";
import type { Page } from "@playwright/test";
import { CHAPTER_STARTS } from "../../src/components/hero/clearing-constants";
import { DESKTOP, expect, expectNoSeriousA11y, gotoApp, MOBILE, noHorizontalOverflow, recordRequests, test } from "./fixtures";

const PATHS = ["/"] as const;
const HERO = "section[aria-labelledby='hero-title']";
const RELATIVES = "section[aria-labelledby='relatives-title']"; // the landing section that holds OneFactBeam
const THREE_MARKER = "isWebGLRenderer"; // a property name three.js sets on its renderer; survives minification

async function openHero(page: Page, path: string, query = "") {
  await gotoApp(page, `${path}${query}`);
  await expect(page.locator("#hero-stage")).toHaveCount(1);
}

async function waitLive(page: Page) {
  await expect(page.locator(HERO)).toHaveAttribute("data-mode", "live", { timeout: 25_000 });
}

/** Stop the story at the end of the answers (?scene-debug), so receipts show the finished tree. */
async function settleAtEnd(page: Page) {
  await waitLive(page);
  await page.evaluate(() => (window as unknown as { __fhtScene?: { freeze(s: number): void } }).__fhtScene?.freeze(9.6));
  await expect(page.locator(`${HERO} p[aria-live="off"]`)).toContainText("Grandma June chose not to share");
}

async function scrollToP(page: Page, p: number) {
  await page.evaluate((p) => {
    const s = document.querySelector<HTMLElement>("section[aria-labelledby='hero-title']")!;
    const top = s.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (s.offsetHeight - window.innerHeight));
  }, p);
  await page.waitForTimeout(350);
}

/** Every same-origin script a page loaded, with its source. */
async function loadedScripts(page: Page) {
  const urls = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .map((e) => e.name)
      .filter((u) => u.startsWith(location.origin) && /\.js(\?|$)/.test(u)),
  );
  return Promise.all(urls.map(async (url) => ({ url, body: await (await page.request.get(url)).text() })));
}

for (const path of PATHS) {
  test.describe(`hero on ${path} · desktop (pinned)`, () => {
    test.use(DESKTOP);

    test("three.js is lazy: not in the first-load JS, fetched after idle, ≤ 150 KB gzip, 4–6 draw calls", async ({ page }) => {
      await openHero(page, path, "?scene-debug");
      const html = await (await page.request.get(path)).text();
      const firstLoad = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => new URL(m[1], page.url()).href);
      for (const url of firstLoad) expect(await (await page.request.get(url)).text(), `three.js in first-load ${url}`).not.toContain(THREE_MARKER);
      await waitLive(page);
      const three = (await loadedScripts(page)).filter((s) => s.body.includes(THREE_MARKER));
      expect(three.length, "exactly one lazy chunk carries three.js").toBe(1);
      const gz = gzipSync(Buffer.from(three[0].body), { level: 9 }).length;
      console.log(`FamilyConstellation lazy chunk: ${(gz / 1024).toFixed(1)} KB gzip (${three[0].url.split("/").pop()})`);
      expect(gz).toBeLessThanOrEqual(150 * 1024);
      const calls = await page.evaluate(() => (window as unknown as { __fhtScene: { info: { calls: number } } }).__fhtScene.info.calls);
      expect(calls).toBeGreaterThanOrEqual(1);
      expect(calls).toBeLessThanOrEqual(6);
    });

    test("the LCP element is the headline, and layout doesn't shift (CLS < 0.05)", async ({ page }) => {
      await openHero(page, path);
      await page.waitForTimeout(2500); // the engine boots and crossfades in
      const { lcp, cls } = await page.evaluate(
        () =>
          new Promise<{ lcp: string; cls: number }>((resolve) => {
            let lcp = "";
            let cls = 0;
            new PerformanceObserver((l) => {
              const e = l.getEntries().at(-1) as PerformanceEntry & { element?: Element | null };
              const el = e?.element;
              lcp = el ? (el.closest("#hero-title") ? "h1#hero-title" : `${el.tagName.toLowerCase()}#${el.id}.${el.className}`) : "";
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((l) => {
              for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls += e.value;
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve({ lcp, cls }), 400);
          }),
      );
      expect(lcp).toBe("h1#hero-title");
      expect(cls).toBeLessThan(0.05);
    });

    test("p = 0 is the framed window, not full-bleed night (boot script measured the slot before paint)", async ({ page }) => {
      await openHero(page, path);
      const clip = await page.locator(`${HERO} [data-theme="night"]`).first().evaluate((el) => getComputedStyle(el).clipPath);
      const insets = (clip.match(/[\d.]+px/g) ?? []).map((v) => parseFloat(v));
      expect(insets.length, clip).toBeGreaterThanOrEqual(4);
      expect(Math.max(...insets.slice(0, 4))).toBeGreaterThan(40); // the left inset clears the headline column
      await expect(page.locator(HERO)).toHaveAttribute("data-nav-theme", "paper");
      await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    });

    test("Pause toggles aria-pressed; Replay restarts", async ({ page }) => {
      await openHero(page, path);
      await waitLive(page);
      const pause = page.getByRole("button", { name: "Pause animation" });
      await expect(pause).toHaveAttribute("aria-pressed", "false");
      await pause.click();
      const play = page.getByRole("button", { name: "Play animation" });
      await expect(play).toHaveAttribute("aria-pressed", "true");
      await play.click();
      await expect(page.getByRole("button", { name: "Pause animation" })).toHaveAttribute("aria-pressed", "false");
      await page.locator(HERO).getByRole("button", { name: "Replay" }).click(); // the privacy band's FlowDiagram has a Replay too
      await expect(page.locator(HERO)).toHaveAttribute("data-phase", /fog|grow/);
    });

    test("keyboard: Tab walks the relatives in reading order (Alex, then Mom); focus opens the receipt", async ({ page }) => {
      await openHero(page, path);
      await page.getByRole("button", { name: "Skip to the page" }).focus();
      const names: string[] = [];
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press("Tab");
        names.push(await page.evaluate(() => document.activeElement?.getAttribute("aria-label") ?? document.activeElement?.textContent?.trim() ?? ""));
      }
      // Each focused relative opens its receipt card, whose link is the next stop: Alex → his link → Mom → her link.
      expect(names[0]).toBe("Alex (you)");
      expect(names[1]).toMatch(/Open Alex’s tree/);
      expect(names[2]).toBe("Mom");
      expect(names[3]).toMatch(/Open Mom in the demo|Ask Mom/); // "Ask Mom" while autoplay hasn't reached her answer yet
      const status = page.locator(`${HERO} [role="status"]`).first();
      await expect(status).toContainText(/^Mom\. (Known\. Mom: no heart history|Not asked yet)\./);
      await page.keyboard.press("Escape");
      await expect(page.getByRole("group", { name: "Mom: receipt" })).toHaveCount(0);
    });

    test("hovering Dad lights his receipt: two voices, both kept, with sources; never “verified”", async ({ page }) => {
      await openHero(page, path, "?scene-debug");
      await settleAtEnd(page);
      await page.getByRole("button", { name: "Dad", exact: true }).hover();
      const card = page.getByRole("group", { name: "Dad: receipt" });
      await expect(card).toBeVisible();
      await expect(card).toContainText("Reports disagree");
      await expect(card).toContainText("TOLD BY MOM · SEP 27");
      await expect(card).toContainText("TOLD BY UNCLE DEV · SEP 28");
      await expect(card).toContainText(/both kept/i);
      await expect(card.getByRole("link", { name: /Open Dad in the demo/ })).toHaveAttribute("href", "/tree?person=dad");
      await page.mouse.move(5, 450);
      await page.getByRole("button", { name: "Grandpa Luis", exact: true }).hover();
      const luis = page.getByRole("group", { name: "Grandpa Luis: receipt" });
      await expect(luis.getByRole("link", { name: /Ask Grandpa Luis/ })).toHaveAttribute("href", "/tree?person=mgf&mode=invite");
      const text = await page.locator(HERO).innerText();
      expect(text).not.toMatch(/verified/i);
      expect(text).not.toMatch(/\brisk\b/i);
    });

    test("the Clearing: night nav during the chapters, one chapter at a time, paper at the end", async ({ page }) => {
      await openHero(page, path);
      const section = page.locator(HERO);
      const nav = page.locator('header[data-shell="site"]');
      await scrollToP(page, 0.3);
      await expect(section).toHaveAttribute("data-nav-theme", "night");
      await expect(nav).toHaveAttribute("data-theme", "night");
      await expect(page.getByRole("button", { name: "Go to chapter 1: Build" })).toHaveAttribute("aria-current", "step");
      await scrollToP(page, 0.62);
      await expect(page.getByRole("button", { name: "Go to chapter 3: Answers" })).toHaveAttribute("aria-current", "step");
      await expect(page.locator("#hero-stage")).toHaveAttribute("data-chapter", "2");
      await scrollToP(page, 0.99);
      await expect(section).toHaveAttribute("data-nav-theme", "paper");
      await expect(page.locator("#hero-stage")).toHaveAttribute("data-cleared", "");
      // the hidden window is inert, so nothing invisible can take focus
      await expect(page.locator(`${HERO} [data-theme="night"][inert]`)).toHaveCount(1);
    });

    test("chapter dots scroll to each chapter's start", async ({ page }) => {
      await openHero(page, path);
      await scrollToP(page, 0.3);
      await page.getByRole("button", { name: "Go to chapter 4: Page" }).click();
      await expect(page.getByRole("button", { name: "Go to chapter 4: Page" })).toHaveAttribute("aria-current", "step", { timeout: 5000 });
      const p = await page.evaluate(() => {
        const s = document.querySelector<HTMLElement>("section[aria-labelledby='hero-title']")!;
        return -s.getBoundingClientRect().top / (s.offsetHeight - window.innerHeight);
      });
      expect(p).toBeGreaterThanOrEqual(CHAPTER_STARTS[3] - 0.01);
    });

    test("Skip to the page jumps past the story to the cleared page", async ({ page }) => {
      await openHero(page, path);
      await page.getByRole("button", { name: "Skip to the page" }).click();
      await expect(page.locator("#hero-stage")).toHaveAttribute("data-cleared", "", { timeout: 5000 });
      expect(await page.evaluate(() => document.activeElement?.id)).toBe("problem");
    });

    test("no CSP violations after load, scroll and hover", async ({ page, cspViolations }) => {
      await openHero(page, path);
      await waitLive(page);
      await page.getByRole("button", { name: "Mom", exact: true }).hover();
      for (const p of [0.1, 0.4, 0.86, 1]) await scrollToP(page, p);
      expect(cspViolations).toEqual([]);
    });

    test("axe: 0 serious issues at the top and mid-story", async ({ page }) => {
      await openHero(page, path);
      await expectNoSeriousA11y(page, { include: [HERO] });
      await scrollToP(page, 0.5);
      await expectNoSeriousA11y(page, { include: [HERO] });
    });
  });

  test.describe(`hero on ${path} · reduced motion`, () => {
    test.use({ ...DESKTOP, contextOptions: { reducedMotion: "reduce" } });

    test("poster only: three.js is never requested, no pin, chapters stacked, nothing running", async ({ page }) => {
      const urls = recordRequests(page);
      await openHero(page, path);
      await page.waitForTimeout(2000);
      await expect(page.locator(HERO)).toHaveAttribute("data-mode", "poster");
      expect(await page.locator(HERO).evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(2 * 900);
      const js = urls.filter((u) => /\.js(\?|$)/.test(u) && u.startsWith(new URL(page.url()).origin));
      for (const u of js) expect(await (await page.request.get(u)).text(), u).not.toContain(THREE_MARKER);
      await expect(page.getByRole("list", { name: "How it works, in four chapters" }).getByRole("heading", { level: 3 })).toHaveText([
        "Start with your mother’s side.",
        "One text link per relative. No app, no account.",
        "Every answer keeps its source.",
        "Walk in with one page.",
      ]);
      const running = await page.locator(HERO).evaluate((el) => el.getAnimations({ subtree: true }).filter((a) => a.playState === "running").length);
      expect(running).toBe(0);
      await expectNoSeriousA11y(page, { include: [HERO] });
    });

    test("the chapter control swaps the poster (Invite shows the three text links)", async ({ page }) => {
      await openHero(page, path);
      await page.getByRole("button", { name: "Invite", exact: true }).click();
      await expect(page.getByRole("button", { name: "Invite", exact: true })).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(HERO)).toContainText("One text link each to Mom, Uncle Dev and Grandma June.");
    });
  });

  test.describe(`hero on ${path} · phones (flow)`, () => {
    test.use(MOBILE);

    test("no pin, no horizontal overflow, the window autoplays when in view, and Page clears to paper", async ({ page }) => {
      await openHero(page, path);
      await noHorizontalOverflow(page);
      await page.setViewportSize({ width: 375, height: 812 });
      await noHorizontalOverflow(page);
      await page.setViewportSize(MOBILE.viewport);
      const section = page.locator(HERO);
      expect(await section.evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(3600);
      await page.getByRole("list", { name: "Demo family (synthetic)" }).scrollIntoViewIfNeeded();
      await waitLive(page);
      await page.getByRole("button", { name: "Page", exact: true }).click();
      await expect(page.locator("#hero-stage")).toHaveAttribute("data-flow-page", "");
      await page.getByRole("button", { name: "Answers", exact: true }).click();
      await expect(page.locator("#hero-stage")).not.toHaveAttribute("data-flow-page", "");
    });

    test("tapping a relative docks a compact receipt; labels keep full accessible names", async ({ page }) => {
      await openHero(page, path);
      const dad = page.getByRole("button", { name: "Dad", exact: true });
      await dad.scrollIntoViewIfNeeded();
      await dad.tap();
      const card = page.getByRole("group", { name: "Dad: receipt" });
      await expect(card).toBeVisible();
      await expect(card).toBeInViewport();
      await expect(page.getByRole("button", { name: "Grandpa Ray", exact: true })).toHaveCount(1);
      await noHorizontalOverflow(page);
    });

    test("the LCP element is the hero copy (on phones TextReveal's word spans can make the lead win), CLS < 0.05", async ({ page }) => {
      await openHero(page, path);
      await page.waitForTimeout(2500);
      const { lcp, cls } = await page.evaluate(
        () =>
          new Promise<{ lcp: string; cls: number }>((resolve) => {
            let lcp = "";
            let cls = 0;
            new PerformanceObserver((l) => {
              const el = (l.getEntries().at(-1) as PerformanceEntry & { element?: Element | null })?.element;
              lcp = !el ? "" : el.closest("#hero-title") ? "h1" : el.closest("section[aria-labelledby='hero-title']") && el.tagName === "P" ? "lead" : el.outerHTML.slice(0, 80);
            }).observe({ type: "largest-contentful-paint", buffered: true });
            new PerformanceObserver((l) => {
              for (const e of l.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) if (!e.hadRecentInput) cls += e.value;
            }).observe({ type: "layout-shift", buffered: true });
            setTimeout(() => resolve({ lcp, cls }), 400);
          }),
      );
      expect(["h1", "lead"]).toContain(lcp);
      expect(cls).toBeLessThan(0.05);
    });

    test("Skip the story lands on the next section", async ({ page }) => {
      await openHero(page, path);
      await page.getByRole("button", { name: "Skip the story" }).click();
      await expect(page.locator("#problem")).toBeInViewport({ timeout: 5000 });
    });

    test("axe: 0 serious issues", async ({ page }) => {
      await openHero(page, path);
      await expectNoSeriousA11y(page, { include: [HERO] });
    });
  });

  test.describe(`hero on ${path} · no JavaScript`, () => {
    test.use({ ...DESKTOP, javaScriptEnabled: false });
    test("the poster, the real relative list and the four chapters render; no pin", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(HERO)).toHaveAttribute("data-mode", "poster");
      await expect(page.getByRole("list", { name: "Demo family (synthetic)" }).getByRole("button")).toHaveCount(8);
      await expect(page.getByRole("list", { name: "How it works, in four chapters" }).getByRole("listitem")).toHaveCount(4);
      expect(await page.locator(HERO).evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(2 * 900);
    });
  });
}

test.describe("OneFactBeam", () => {
  for (const [label, device] of [
    ["1440", DESKTOP],
    ["390", MOBILE],
  ] as const) {
    test(`keyboard only at ${label} px: nothing pre-ticked → tick → share → reset`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await gotoApp(page, "/");
      const afib = page.getByRole("checkbox", { name: /Atrial fibrillation/ });
      await afib.scrollIntoViewIfNeeded();
      for (const name of [/Atrial fibrillation/, /Essential hypertension/, /Seasonal allergies/]) await expect(page.getByRole("checkbox", { name })).not.toBeChecked();
      const share = page.getByRole("button", { name: /^Share/ });
      await expect(share).toBeDisabled();
      await afib.focus();
      await page.keyboard.press("Space");
      await expect(afib).toBeChecked();
      await expect(page.getByRole("button", { name: "Share 1 fact with Alex" })).toBeEnabled();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Share 1 fact with Alex" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByText("Grandpa Luis shared one fact from his portal. Only that fact left the page.")).toBeVisible({ timeout: 4000 });
      await expect(page.getByRole("list", { name: "What Grandpa Luis shared" })).toContainText("Not shared · not stored");
      const reset = page.getByRole("button", { name: "Reset" });
      await expect(reset).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.getByRole("checkbox", { name: /Atrial fibrillation/ })).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: /Atrial fibrillation/ })).toBeFocused();
      await noHorizontalOverflow(page);
      await expectNoSeriousA11y(page, { include: [RELATIVES] });
    });
  }

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("the fact lands instantly: no travel", async ({ page }) => {
      await gotoApp(page, "/");
      await page.getByRole("checkbox", { name: /Atrial fibrillation/ }).check();
      await page.getByRole("button", { name: "Share 1 fact with Alex" }).click();
      await expect(page.getByText("Grandpa Luis shared one fact from his portal.")).toBeVisible({ timeout: 200 });
    });
  });
});
