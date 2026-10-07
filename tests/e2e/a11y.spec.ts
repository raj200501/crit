// P1: the design-system QA page and the P1-owned chrome pass axe (WCAG 2.2 A/AA: 0 serious, 0 critical),
// and reduced motion leaves nothing running (DESIGN §13.1 acceptance 2 and 6).
// Full-route axe gates live in each owning package's spec (tree, invite, summary, landing, site).
import { DESKTOP, expect, expectNoSeriousA11y, gotoApp, MOBILE, scrollThrough, test } from "./fixtures";

for (const [label, device] of [
  ["1440", DESKTOP],
  ["390", MOBILE],
] as const) {
  test.describe(`at ${label} px`, () => {
    test.use(device);

    test("/design-system: 0 serious or critical axe issues (paper and night sections)", async ({ page }) => {
      await gotoApp(page, "/design-system");
      await scrollThrough(page);
      await expectNoSeriousA11y(page);
    });

    test("AppShell header passes axe on /tree and /summary", async ({ page }) => {
      for (const route of ["/tree", "/summary"]) {
        await gotoApp(page, route);
        await expectNoSeriousA11y(page, { include: ['header[data-shell="app"]'] });
      }
    });

    test("SiteNav and SiteFooter pass axe on /", async ({ page }) => {
      await gotoApp(page, "/");
      await expectNoSeriousA11y(page, { include: ['header[data-shell="site"]', 'footer[data-shell="footer"]'] });
    });

    test("/practice header passes axe", async ({ page }) => {
      await gotoApp(page, "/practice");
      await expectNoSeriousA11y(page, { include: ['header[data-shell="practice"]'] });
    });

    test("P1 placeholder pages (/for-practices, /privacy, /pilot) pass axe", async ({ page }) => {
      for (const route of ["/for-practices", "/privacy", "/pilot"]) {
        await gotoApp(page, route);
        await scrollThrough(page);
        await expectNoSeriousA11y(page);
      }
    });
  });
}

test.describe("open states", () => {
  test("role menu popover and the design-system sheet pass axe", async ({ page }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("button", { name: "Viewing as Alex (patient)" }).click();
    await expectNoSeriousA11y(page, { include: ['header[data-shell="app"]', "[popover]"] });
    await page.keyboard.press("Escape");

    await gotoApp(page, "/design-system");
    await page.getByRole("button", { name: "Open sheet" }).first().click();
    await expect(page.getByRole("dialog", { name: "Example sheet (paper)" })).toBeVisible();
    await expectNoSeriousA11y(page, { include: ["dialog[open]"] });
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("/design-system has no running animations", async ({ page }) => {
    await gotoApp(page, "/design-system");
    await scrollThrough(page);
    await page.waitForTimeout(300);
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map((a) => {
          const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
          return `${(a as CSSAnimation).animationName ?? a.constructor.name} on ${t?.tagName.toLowerCase()}.${String(t?.getAttribute("class") ?? "").slice(0, 60)}`;
        }),
    );
    expect(running).toEqual([]);
  });

  test("/ has no running animations", async ({ page }) => {
    await gotoApp(page, "/");
    await scrollThrough(page);
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });
});

test.describe("404 page", () => {
  test.use({ allowHttpErrors: [/\/no-such-page/] });
  test("passes axe", async ({ page }) => {
    await page.goto("/no-such-page");
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await expectNoSeriousA11y(page);
  });
});
