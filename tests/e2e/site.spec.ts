// Contract for the content pages (owner after P1: P4). Green against today's pages inside the (site) layout.
// P4 replaces P1's placeholder /for-practices, /privacy and /pilot and adds the §13.4 checks (TOC, #source-N anchors, 1-page /pilot print).
import { expect, gotoApp, MOBILE, noHorizontalOverflow, test } from "./fixtures";

const PAGES = [
  { path: "/how-it-works", title: "How it works · Family Health Tree", h1: /./ },
  { path: "/research", title: "Research · Family Health Tree", h1: /./ },
];

for (const p of PAGES) {
  test(`${p.path}: one main, one h1, the right <title>, site nav and footer`, async ({ page }) => {
    await gotoApp(page, p.path);
    await expect(page).toHaveTitle(p.title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(p.h1);
    await expect(page.locator('header[data-shell="site"]')).toBeVisible();
    await expect(page.locator('footer[data-shell="footer"]')).toBeVisible();
  });
}

test("/research renders the markdown write-up with external links in new tabs", async ({ page }) => {
  await gotoApp(page, "/research");
  const external = page.locator('main a[href^="http"]');
  expect(await external.count()).toBeGreaterThan(5);
  await expect(external.first()).toHaveAttribute("target", "_blank");
  await expect(external.first()).toHaveAttribute("rel", "noopener noreferrer");
});

test.describe("on phones", () => {
  test.use(MOBILE);
  test("/research has no horizontal overflow", async ({ page }) => {
    await gotoApp(page, "/research");
    await noHorizontalOverflow(page);
  });
  test("/how-it-works has no horizontal overflow", async ({ page }) => {
    await gotoApp(page, "/how-it-works");
    await noHorizontalOverflow(page);
  });
});

test("/how-it-works has no horizontal overflow at 375 px without mobile viewport emulation", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await gotoApp(page, "/how-it-works");
  await noHorizontalOverflow(page);
});
