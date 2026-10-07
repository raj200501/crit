// Contract for /summary, /view and /practice (owner after P1: P7). Green against today's UI.
// P7 applies AMENDMENTS A1 (no audience control on /summary; the care-team copy lives on /practice) and R6 here.
import { readFile } from "node:fs/promises";
import { expect, gotoApp, MOBILE, pdfPageCount, test } from "./fixtures";

test.describe("summary", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/summary");
  });

  test("the review checkbox is the first checkbox; Print and Make link wait for it", async ({ page }) => {
    const review = page.getByRole("checkbox").first();
    await expect(review).toHaveAccessibleName("I’ve checked this and it matches what my family told me.");
    await expect(review).not.toBeChecked();
    const print = page.getByRole("button", { name: "Print or save as PDF" });
    const make = page.getByRole("button", { name: "Make a link for the practice" });
    await expect(print).toBeDisabled();
    await expect(make).toBeDisabled();
    await review.check();
    await expect(print).toBeEnabled();
    await expect(make).toBeEnabled();
  });

  test("the document is an article named 'Pre-visit family history summary'", async ({ page }) => {
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" }).first()).toBeVisible();
  });

  test("Make a link for the practice → read-only /view# link, Copy, QR; the link opens the care-team view", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Make a link for the practice" }).click();
    const input = page.getByRole("textbox", { name: "Read-only summary link" });
    await expect(input).toHaveValue(/\/view#/);
    await expect(page.locator('img[alt^="QR code"]')).toBeVisible();
    await page.getByRole("button", { name: "Copy", exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/view#/);

    const link = await input.inputValue();
    const view = await context.newPage();
    await gotoApp(view, link);
    const doc = view.getByRole("article", { name: "Pre-visit family history summary" });
    await expect(doc).toBeVisible();
    await expect(doc).toContainText("For clinician review");
    await expect(view.getByRole("button", { name: "Print" })).toBeVisible();
  });

  test("Download as FHIR (FamilyMemberHistory) gives a Bundle of FamilyMemberHistory entries", async ({ page }) => {
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as FHIR (FamilyMemberHistory)" }).click()]);
    const json = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(json.resourceType).toBe("Bundle");
    expect(json.entry.length).toBeGreaterThan(0);
    for (const e of json.entry) expect(e.resource.resourceType).toBe("FamilyMemberHistory");
  });

  test("today's audience toggle (A1 removes it from /summary; the care-team copy moves to /practice)", async ({ page }) => {
    const toggle = page.getByRole("button", { name: "Preview the care-team version" });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(page.getByRole("button", { name: "Back to my summary" })).toHaveAttribute("aria-pressed", "true");
  });
});

test.describe("print (DESIGN §14: the care-team copy is one Letter page)", () => {
  test("/summary, the /view care-team link and /practice each print on one Letter page", async ({ page, context }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await gotoApp(page, "/summary");
    await page.getByRole("checkbox").first().check();
    expect(pdfPageCount(await page.pdf({ format: "Letter", printBackground: true })), "/summary").toBe(1);

    await page.getByRole("button", { name: "Make a link for the practice" }).click();
    const link = await page.getByRole("textbox", { name: "Read-only summary link" }).inputValue();
    const view = await context.newPage();
    await view.setViewportSize({ width: 1360, height: 900 });
    await gotoApp(view, link);
    await expect(view.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
    expect(pdfPageCount(await view.pdf({ format: "Letter", printBackground: true })), "/view").toBe(1);

    await gotoApp(view, "/practice");
    await expect(view.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
    expect(pdfPageCount(await view.pdf({ format: "Letter", printBackground: true })), "/practice").toBe(1);
  });
});

test.describe("practice view (A1)", () => {
  test("/practice shows the care-team document with 'For clinician review'", async ({ page }) => {
    await gotoApp(page, "/practice");
    await expect(page.getByRole("heading", { name: "For clinician review" })).toBeVisible();
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
    await expect(page.locator("header [role=note]")).toBeVisible();
  });
});

test.describe("summary on phones", () => {
  test.use(MOBILE);
  test("the review checkbox is still the first checkbox", async ({ page }) => {
    await gotoApp(page, "/summary");
    await expect(page.getByRole("checkbox").first()).toHaveAccessibleName("I’ve checked this and it matches what my family told me.");
  });
});
