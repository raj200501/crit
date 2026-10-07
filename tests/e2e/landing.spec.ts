// Contract for "/" (owner after P1: P3). Green against today's (un-restyled) landing inside the (site) layout.
// P3 extends it per DESIGN §13.3 (H2 order, SSR stat values, one <blockquote>, hero pill, Lighthouse budgets).
import { expect, gotoApp, MOBILE, noHorizontalOverflow, test } from "./fixtures";

test("one main, one h1 with the headline, and the demo CTA", async ({ page }) => {
  await gotoApp(page, "/");
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("main#main")).toHaveCount(1);
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toContainText("who, what, and at what age");
  await expect(page.getByRole("link", { name: /Try the demo family/ }).first()).toHaveAttribute("href", "/tree");
  await expect(page).toHaveTitle("Family Health Tree");
});

test("honesty: the nav chip and the footer legal line are present; no banned claims", async ({ page }) => {
  await gotoApp(page, "/");
  await expect(page.getByRole("link", { name: "Synthetic demo: made-up family, no real health data" })).toBeVisible();
  await expect(page.locator("footer")).toContainText("Not a medical device. Doesn't diagnose or score risk.");
  const text = await page.locator("body").innerText();
  expect(text).not.toMatch(/trusted by/i);
  expect(text).not.toMatch(/HIPAA (certified|compliant)/i);
  expect(text).not.toMatch(/revolutionary|AI-powered/i);
});

for (const width of [375, 390, 1440]) {
  test(`no horizontal overflow at ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/");
    await noHorizontalOverflow(page);
  });
}

test.describe("on phones", () => {
  test.use(MOBILE);
  test("the headline is visible above the fold", async ({ page }) => {
    await gotoApp(page, "/");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  });
});
