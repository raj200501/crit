// The /research tabs: the write-up (/research) and the interviews (/research/interviews) are real routes joined by a small
// tab bar (nav "Research sections", aria-current="page"). The interviews tab is anonymous: interview IDs and roles only.
// Runs against `next start`. The generic content-page checks (title, h1, honesty scan, axe at 1440/390, overflow at
// 375/320, reduced motion) cover both routes through site.spec.ts PAGES.
import type { Page } from "@playwright/test";
import { INTERVIEW_RESEARCH } from "../../src/content/interviews";
import { axe, expect, gotoApp, MOBILE, noHorizontalOverflow, scrollThrough, test, waitForApp } from "./fixtures";

const tabBar = (page: Page) => page.getByRole("navigation", { name: "Research sections" });
const interviewList = (page: Page) => page.getByRole("list", { name: "All 21 interviews" });

test.describe("/research tabs", () => {
  test("/research shows the tab bar with Write-up current; Interviews opens /research/interviews with 21 entries and the anonymity note", async ({ page }) => {
    await gotoApp(page, "/research");
    const tabs = tabBar(page);
    // the nav is a zero-height rail on the hero's edge (like SubNav); its pill of links is what shows
    await expect(tabs.getByRole("list")).toBeVisible();
    await expect(tabs.getByRole("link")).toHaveText(["Write-up", "Interviews (21)"]);
    await expect(tabs.getByRole("link", { name: "Write-up" })).toHaveAttribute("aria-current", "page");
    await expect(tabs.getByRole("link", { name: "Interviews (21)" })).not.toHaveAttribute("aria-current");
    // the write-up tab is the write-up, unchanged
    await expect(page.getByRole("heading", { level: 1, name: "The research behind Stemma", exact: true })).toBeVisible();
    await expect(page.locator("main")).toContainText(/124 sources\s*·\s*\d+ min read\s*·\s*Updated Oct 2026/i);
    await expect(page.locator("main article")).toHaveCount(1);

    await tabs.getByRole("link", { name: "Interviews (21)" }).click();
    await expect(page).toHaveURL(/\/research\/interviews$/);
    await waitForApp(page);
    await expect(page).toHaveTitle("Interviews · Stemma");
    await expect(tabBar(page).getByRole("link", { name: "Interviews (21)" })).toHaveAttribute("aria-current", "page");
    await expect(tabBar(page).getByRole("link", { name: "Write-up" })).not.toHaveAttribute("aria-current");
    // the main nav still marks Research
    await expect(page.locator('header[data-shell="site"]').getByRole("link", { name: "Research", exact: true }).first()).toHaveAttribute("aria-current", "page");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "All 21 interviews" })).toBeVisible();
    await expect(interviewList(page).getByRole("listitem")).toHaveCount(21);
    await expect(page.getByRole("note").filter({ hasText: INTERVIEW_RESEARCH.note })).toBeVisible();
    await expect(page.locator("main")).toContainText("Paraphrased from the team's interview notes. Participants are identified by interview ID only.");

    await tabBar(page).getByRole("link", { name: "Write-up" }).click();
    await expect(page).toHaveURL(/\/research$/);
    await expect(tabBar(page).getByRole("link", { name: "Write-up" })).toHaveAttribute("aria-current", "page");
  });

  test("keyboard: the tabs take focus with a visible ring, and Enter switches tabs", async ({ page }) => {
    await gotoApp(page, "/research");
    let name = "";
    for (let i = 0; i < 40 && name !== "Write-up"; i++) {
      await page.keyboard.press("Tab");
      name = await page.evaluate(() => (document.activeElement?.closest('nav[aria-label="Research sections"]') ? (document.activeElement?.textContent ?? "") : ""));
    }
    expect(name, "Tab reaches the Write-up tab").toBe("Write-up");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toHaveText("Interviews (21)");
    const ring = await focused.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
    });
    expect(ring.style).not.toBe("none");
    expect(ring.width).toBeGreaterThanOrEqual(2);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/research\/interviews$/);
  });
});

test.describe("/research/interviews", () => {
  test("every interview shows its ID, role, topic and paraphrase; quotes and family-history markers match the data", async ({ page }) => {
    await gotoApp(page, "/research/interviews");
    const items = interviewList(page).getByRole("listitem");
    await expect(items).toHaveCount(INTERVIEW_RESEARCH.interviews.length);
    // desktop: a table-like grid under one header row
    await expect(page.locator("[data-list-head]")).toBeVisible();
    await expect(page.locator("[data-list-head]")).toHaveText(/Interview\s*Topic\s*What we learned \(paraphrased\)/);
    for (const [i, iv] of INTERVIEW_RESEARCH.interviews.entries()) {
      const item = items.nth(i);
      await expect(item).toHaveAttribute("id", iv.id);
      await expect(item).toContainText(iv.id);
      await expect(item).toContainText(iv.role);
      await expect(item).toContainText(iv.topic);
      await expect(item).toContainText(iv.learned);
      await expect(item.getByText("Family history", { exact: true })).toHaveCount(iv.familyHistory ? 1 : 0);
      await expect(item.locator("blockquote")).toHaveCount("quote" in iv ? 1 : 0);
    }
    // the intro, the gaps line and the five themes
    await expect(page.locator("main")).toContainText(INTERVIEW_RESEARCH.intro);
    await expect(page.locator("main")).toContainText(INTERVIEW_RESEARCH.gaps);
    for (const t of INTERVIEW_RESEARCH.themes) await expect(page.getByRole("heading", { level: 3, name: t.title })).toBeVisible();
    // a theme's interview chip jumps to that interview. Scroll the chip in first and let a frame pass: Lenis (fine pointer)
    // learns the scroll position from the scroll event, which fires a frame after Playwright's own scroll-into-view.
    const chip = page.getByRole("list", { name: /Interviews behind “Family history is vague/ }).getByRole("link", { name: "ID007" });
    await chip.scrollIntoViewIfNeeded();
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))));
    await chip.click();
    await expect(page).toHaveURL(/#ID007$/);
    await expect(page.locator('li[id="ID007"]')).toBeInViewport();
  });

  test("anonymous: no names, gendered pronouns or relatives' titles on the page", async ({ page }) => {
    await gotoApp(page, "/research/interviews");
    const text = (await page.locator("main").textContent()) ?? "";
    expect(text).not.toMatch(/\b(he|she|his|her|hers|him)\b/i);
    expect(text).not.toMatch(/\b(mother|father|mom|dad|uncle|aunt|brother|sister|husband|wife|Mr|Mrs|Ms|Dr)\b/);
    expect(text).not.toMatch(/evidence ?lines?|NOT FOR DISPLAY/i);
  });

  test("axe finds no violations (any impact)", async ({ page }) => {
    await gotoApp(page, "/research/interviews");
    await scrollThrough(page);
    const { all } = await axe(page);
    expect(all.map((v) => `${v.impact} ${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
  });

  for (const width of [375, 320]) {
    test(`no horizontal overflow at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      for (const path of ["/research", "/research/interviews"]) {
        await gotoApp(page, path);
        await scrollThrough(page, 900);
        await noHorizontalOverflow(page);
      }
      // the tab bar fits on one line
      const box = await tabBar(page).getByRole("list").boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    });
  }

  test.describe("on phones", () => {
    test.use(MOBILE);
    test("the list becomes stacked cards, each labeled, with no header row", async ({ page }) => {
      await gotoApp(page, "/research/interviews");
      const items = interviewList(page).getByRole("listitem");
      await expect(items).toHaveCount(21);
      await expect(page.locator("[data-list-head]")).toBeHidden();
      const first = items.first();
      await expect(first.getByText("What we learned (paraphrased)")).toBeVisible();
      // cards stack: each card spans the column and sits below the previous one
      const [a, b] = [await items.nth(0).boundingBox(), await items.nth(1).boundingBox()];
      expect(b!.y).toBeGreaterThanOrEqual(a!.y + a!.height);
      expect(Math.abs(a!.width - b!.width)).toBeLessThan(1);
      await noHorizontalOverflow(page);
    });
  });
});
