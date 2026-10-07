// Contract for /tree (owner after P1: P5). Green against today's UI; P5 updates it in the same PR as any rename (DESIGN §12.9).
// Node lookups use the `{label}: {status}. {headline}` name pattern (e.g. /^Grandpa Luis:/), never /^Grandpa Luis/ (R2).
import { expect, gotoApp, MOBILE, noHorizontalOverflow, test } from "./fixtures";

const PEOPLE = ["self", "mom", "dad", "dev", "pgf", "pgm", "mgf", "mgm"];

test.describe("tree", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/tree");
  });

  test("renders every relative as a button in the 'Family health tree' group, plus the legend", async ({ page }) => {
    const group = page.getByRole("group", { name: "Family health tree" });
    await expect(group).toBeVisible();
    for (const id of PEOPLE) await expect(group.locator(`button[data-person-id="${id}"]`)).toHaveCount(1);
    await expect(page.getByRole("button", { name: /^Mom:/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Dad: conflicting\./ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Grandpa Luis: unknown\. Not asked yet/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Alex \(you\): you\./ })).toBeVisible();
    await expect(page.getByRole("list", { name: "Legend" })).toBeVisible();
  });

  test("overview: start-my-own-tree form, reset and delete", async ({ page }) => {
    await page.getByRole("button", { name: "Start my own tree" }).click();
    await expect(page.getByRole("textbox", { name: "Your first name" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Start", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("textbox", { name: "Your first name" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /^(Reset demo family|Load the demo family)$/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete everything stored here" })).toBeVisible();
  });

  test("person panel: open Mom, focus the heading, actions, close returns focus to the node", async ({ page }) => {
    await page.getByRole("button", { name: /^Mom:/ }).click();
    const panel = page.locator('section[aria-label="Mom details"]');
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { level: 2, name: "Mom" })).toBeFocused();
    await expect(panel.getByRole("button", { name: "Add what you know" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Ask Mom directly" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Edit details" })).toBeVisible();
    await panel.locator('button[aria-label="Close"]').click();
    await expect(panel).toHaveCount(0);
    await expect(page.locator('[data-person-id="mom"]')).toBeFocused();
  });

  test("a relative who passed away can't be asked directly", async ({ page }) => {
    await page.getByRole("button", { name: /^Dad:/ }).click();
    const panel = page.locator('section[aria-label="Dad details"]');
    await expect(panel.getByRole("heading", { level: 2, name: "Dad" })).toBeFocused();
    await expect(panel.getByRole("button", { name: "Add what you know" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Ask Dad directly" })).toHaveCount(0);
  });

  test("answer form: guided checkboxes, age, other answers, add to tree", async ({ page }) => {
    await page.getByRole("button", { name: /^Grandma June:/ }).click();
    const panel = page.locator('section[aria-label="Grandma June details"]');
    await panel.getByRole("button", { name: "Add what you know" }).click();
    const radios = panel.getByRole("radiogroup", { name: "Other answers" });
    await expect(radios.getByRole("radio", { name: "None of these" })).toBeVisible();
    await expect(radios.getByRole("radio", { name: "I don’t know" })).toBeVisible();
    await panel.getByRole("checkbox", { name: /^Heart attack or blocked arteries/ }).check();
    await expect(panel.getByText("About how old were they?")).toBeVisible();
    await panel.getByPlaceholder("Age").first().fill("48");
    await panel.getByRole("checkbox", { name: /^Something else heart-related/ }).check();
    await expect(panel.getByRole("textbox", { name: "Describe the condition" })).toBeVisible();
    await panel.getByRole("checkbox", { name: /^Something else heart-related/ }).uncheck();
    await panel.getByRole("button", { name: "Add to tree" }).click();
    await expect(page.locator('button[data-person-id="pgm"]')).toHaveAttribute("aria-label", /^Grandma June:/);
  });

  test("self panel: add your own history, then 'Remove this entry'", async ({ page }) => {
    await page.getByRole("button", { name: /^Alex \(you\):/ }).click();
    const panel = page.locator('section[aria-label="Alex (you) details"]');
    await panel.getByRole("button", { name: "Add your own history" }).click();
    await panel.getByRole("checkbox", { name: /Very high cholesterol/ }).check();
    await panel.getByRole("button", { name: "Add to tree" }).click();
    await expect(panel.getByRole("button", { name: "Remove this entry" }).first()).toBeVisible();
  });

  test("invite box: message carries the full /invite# URL; Send…, Copy message → Copied, Preview link opens a new tab, Done", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: /^Grandpa Luis:/ }).click();
    const panel = page.locator('section[aria-label="Grandpa Luis details"]');
    await panel.getByRole("button", { name: "Ask Grandpa Luis directly" }).click();
    const message = await panel.getByLabel("Invite message").inputValue();
    expect(message).toMatch(/https?:\/\/\S+\/invite#\S+/);
    await expect(panel.getByRole("button", { name: "Send…" })).toBeVisible();
    await panel.getByRole("button", { name: "Copy message" }).click();
    await expect(panel.getByRole("button", { name: "Copied" })).toBeVisible();
    const preview = panel.getByRole("link", { name: "Preview as Grandpa Luis" });
    await expect(preview).toHaveAttribute("target", "_blank");
    expect(await preview.getAttribute("href")).toMatch(/\/invite#/);
    await panel.getByRole("button", { name: "Done" }).click();
    await expect(panel.getByRole("button", { name: "Ask Grandpa Luis directly" })).toBeVisible();
  });

  test("edit details: Save, Cancel and (for added relatives) Remove from tree", async ({ page }) => {
    await page.getByRole("button", { name: /^Uncle Dev:/ }).click();
    const panel = page.locator('section[aria-label="Uncle Dev details"]');
    await panel.getByRole("button", { name: "Edit details" }).click();
    await expect(panel.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Remove from tree" })).toBeVisible();
    await panel.getByRole("button", { name: "Cancel" }).click();
    await expect(panel.getByRole("button", { name: "Edit details" })).toBeVisible();
  });
});

test.describe("tree on phones", () => {
  test.use(MOBILE);

  test("tapping Dad shows 'Dad details'", async ({ page }) => {
    await gotoApp(page, "/tree");
    await page.locator('button[aria-label^="Dad:"]').tap();
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
  });

  test("no horizontal page overflow", async ({ page }) => {
    await gotoApp(page, "/tree");
    await noHorizontalOverflow(page);
  });
});
