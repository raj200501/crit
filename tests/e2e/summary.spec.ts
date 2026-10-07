// Contract for /summary (the patient's copy only), /view (the care-team copy from a link or the check-in QR) and /practice
// (the practice-side demo). Owner: P7. DESIGN §12.8 as amended by AMENDMENTS A1, §13.7 acceptance, §12.9 names.
import { readFile } from "node:fs/promises";
import type { Locator, Page } from "@playwright/test";
import { expect, expectNoSeriousA11y, gotoApp, MOBILE, noHorizontalOverflow, obscuredFocusStops, pdfPageCount, test } from "./fixtures";

const REVIEW = "I’ve checked this and it matches what my family told me.";
const CLINICIAN_REVIEW = "Mark reviewed by clinician (demo, this browser only)";
const CHART_HEADER = "Relation | Problem | Age at onset | Source | Comments";
/** Strings that may only ever appear on the care-team copy (criteria, their basis, guideline names). */
const CLINICIAN_ONLY = [/For clinician review/, /Basis:/, /Simon Broome/, /Dutch Lipid/, /ACC\/AHA/, /AHA\/ACC/, /APHRS/, /ESC 2025/];

async function review(page: Page) {
  const box = page.getByRole("checkbox").first();
  await box.check();
  await expect(box).toBeChecked();
}

/** Reviews, then makes the practice link: from the rail on desktop, from the Share sheet under 1024 px. */
async function makeLink(page: Page) {
  await review(page);
  const share = page.getByRole("button", { name: "Share", exact: true });
  if (await share.isVisible()) await share.click();
  await page.getByRole("button", { name: "Make a link for the practice" }).click();
  const input = page.getByRole("textbox", { name: "Read-only summary link" });
  await expect(input).toHaveValue(/\/view#/);
  return input.inputValue();
}

/** Lets one-shot motion finish (the review beam lap, the link block fading in) so axe measures final colours. */
async function settle(page: Page) {
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running"), null, { timeout: 5_000 });
}

/** WCAG contrast of an element's text against its own background colour. */
async function contrastOf(loc: Locator) {
  return loc.evaluate((el) => {
    const rgb = (c: string) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const cs = getComputedStyle(el);
    const [a, b] = [lum(rgb(cs.color)), lum(rgb(cs.backgroundColor))].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
  });
}

test.describe("/summary: the patient's copy", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page, "/summary");
  });

  test("the review checkbox is the first checkbox; Print, Show at check-in and Make link wait for it", async ({ page }) => {
    const box = page.getByRole("checkbox").first();
    await expect(box).toHaveAccessibleName(REVIEW);
    await expect(box).not.toBeChecked();
    const gated = ["Print or save as PDF", "Show at check-in", "Make a link for the practice"].map((name) => page.getByRole("button", { name }));
    for (const b of gated) await expect(b).toBeDisabled();
    await expect(page.getByText("Review the summary first.").first()).toBeVisible();
    await box.check();
    for (const b of gated) await expect(b).toBeEnabled();
    // the sheet's header stamps the review
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toContainText(/Reviewed by you/i);
  });

  test("the document is an article named 'Pre-visit family history summary', with a pedigree and its legend", async ({ page }) => {
    const doc = page.getByRole("article", { name: "Pre-visit family history summary" });
    await expect(doc).toBeVisible();
    await expect(doc.getByRole("img", { name: /Family pedigree/ })).toBeVisible();
    await expect(doc.getByRole("list", { name: "Legend" })).toBeVisible();
    for (const h of ["What we know", "Still to confirm", "Questions you could ask"]) await expect(doc.getByRole("heading", { name: h })).toBeVisible();
  });

  test("A1: no audience control, no care-team preview, and no criteria anywhere in the page", async ({ page }) => {
    for (const name of ["Care-team version", "My summary", "Preview the care-team version", "Back to my summary"]) {
      await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0);
    }
    await expect(page.getByRole("group", { name: "Who reads it" })).toHaveCount(0);
    await expect(page.getByText(/^Your care team gets a separate version through the practice link or the check-in QR\./).first()).toBeVisible();
    const html = await page.content();
    for (const re of CLINICIAN_ONLY) expect(html, String(re)).not.toMatch(re);
  });

  test("Make a link for the practice → read-only /view# link, Copy, QR; the link opens the care-team view", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const link = await makeLink(page);
    await expect(page.locator('img[alt^="QR code"]')).toBeVisible();
    await page.getByRole("button", { name: "Copy", exact: true }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/view#/);
    await expect(page.getByRole("status").getByText("Link copied")).toBeVisible();

    const view = await context.newPage();
    await gotoApp(view, link);
    const doc = view.getByRole("article", { name: "Pre-visit family history summary" });
    await expect(doc).toBeVisible();
    await expect(doc.getByRole("heading", { name: /For clinician review/ })).toBeVisible();
    await expect(doc).toContainText("Basis:");
    await expect(view.getByRole("button", { name: "Print", exact: true })).toBeVisible();
  });

  test("Download as FHIR (FamilyMemberHistory) gives a Bundle of FamilyMemberHistory entries", async ({ page }) => {
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download as FHIR (FamilyMemberHistory)" }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.fhir\.json$/);
    const json = JSON.parse(await readFile((await download.path())!, "utf8"));
    expect(json.resourceType).toBe("Bundle");
    expect(json.entry.length).toBeGreaterThan(0);
    for (const e of json.entry) expect(e.resource.resourceType).toBe("FamilyMemberHistory");
  });

  test("Show at check-in opens the boarding pass with a large QR, and Esc closes it back to the trigger", async ({ page }) => {
    await review(page);
    const trigger = page.getByRole("button", { name: "Show at check-in" });
    await trigger.click();
    const pass = page.getByRole("dialog", { name: /Alex · Cardiology/ });
    await expect(pass).toBeVisible();
    await expect(pass.locator('img[alt^="QR code"]')).toBeVisible();
    await expect(pass).toContainText("Ask the front desk to scan");
    const size = await pass.locator('img[alt^="QR code"]').boundingBox();
    expect(size!.width).toBeGreaterThanOrEqual(300);
    await settle(page);
    await expectNoSeriousA11y(page, { include: ["dialog[open]"] });
    await page.keyboard.press("Escape");
    await expect(pass).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("a source chip opens its provenance: who said it, when, and their own words", async ({ page }) => {
    const doc = page.getByRole("article", { name: "Pre-visit family history summary" });
    await doc.getByRole("button", { name: /^TOLD BY UNCLE DEV/ }).first().click();
    const pop = page.getByRole("group", { name: /Where this came from/ });
    await expect(pop).toBeVisible();
    await expect(pop).toContainText("I think it was chest pain");
    await expect(pop).toContainText(/Added/);
    await page.keyboard.press("Escape");
    await expect(pop).toBeHidden();
  });

  test("axe: 0 serious or critical (not reviewed, then reviewed with a link)", async ({ page }) => {
    await expectNoSeriousA11y(page);
    await makeLink(page);
    await settle(page);
    await expectNoSeriousA11y(page);
  });

  test("'Synthetic demo data' on the sheet is at least 4.5:1", async ({ page }) => {
    const chip = page.getByRole("article", { name: "Pre-visit family history summary" }).getByText("Synthetic demo data", { exact: true });
    expect(await contrastOf(chip)).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("/summary on phones", () => {
  test.use(MOBILE);

  test("the document comes first; the review checkbox is still the first checkbox; Share opens steps ②–④", async ({ page }) => {
    await gotoApp(page, "/summary");
    const box = page.getByRole("checkbox").first();
    await expect(box).toHaveAccessibleName(REVIEW);
    const docFirst = await page.evaluate(() => {
      const doc = document.querySelector('article[aria-label="Pre-visit family history summary"]')!;
      const firstBox = [...document.querySelectorAll('input[type="checkbox"]')].find((el) => (el as HTMLElement).offsetParent !== null)!;
      return !!(doc.compareDocumentPosition(firstBox) & Node.DOCUMENT_POSITION_FOLLOWING) && !doc.querySelector('input[type="checkbox"]');
    });
    expect(docFirst).toBe(true);
    await box.check();
    await page.getByRole("button", { name: "Share", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Bring and share your summary" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByText(/^Your care team gets a separate version/)).toBeVisible();
    await sheet.getByRole("button", { name: "Make a link for the practice" }).click();
    await expect(sheet.getByRole("textbox", { name: "Read-only summary link" })).toHaveValue(/\/view#/);
    await expect(sheet.locator('img[alt^="QR code"]')).toBeVisible();
    await settle(page);
    await expectNoSeriousA11y(page, { include: ["dialog[open]"] });
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
  });

  test("axe: 0 serious or critical", async ({ page }) => {
    await gotoApp(page, "/summary");
    await expectNoSeriousA11y(page);
  });

  test("every Tab stop stays clear of the review strip and the tab bar (WCAG 2.4.11)", async ({ page }) => {
    await gotoApp(page, "/summary");
    expect(await obscuredFocusStops(page, 45)).toEqual([]);
  });

  test("Share sheet: the FHIR download wraps instead of clipping, and 'Link copied' shows above the sheet", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await gotoApp(page, "/summary");
    await page.getByRole("checkbox").first().check();
    await page.getByRole("button", { name: "Share", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Bring and share your summary" });
    const fhir = sheet.getByRole("button", { name: "Download as FHIR (FamilyMemberHistory)" });
    await expect(fhir).toBeVisible();
    expect(await fhir.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await sheet.getByRole("button", { name: "Make a link for the practice" }).click();
    await sheet.getByRole("button", { name: /^Copy/ }).first().click();
    const toast = page.getByRole("status").filter({ hasText: /copied/i });
    await expect(toast).toBeVisible();
    const onTop = await toast.locator("li").first().evaluate((li) => {
      const r = li.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && li.contains(hit);
    });
    expect(onTop).toBe(true);
  });

  test("the pedigree opens at its left edge, legible (≥ 12 px notes), and scrolls sideways", async ({ page }) => {
    await gotoApp(page, "/summary");
    const scroller = page.getByRole("region", { name: "Pedigree (scrolls sideways)" });
    await expect(scroller).toBeVisible();
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(scroller).toHaveAttribute("data-more", "right");
    const sizes = await scroller.locator("svg text").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
  });
});

test.describe("/view: the care-team copy", () => {
  test("without a #payload: the minimal header with the honesty note, and 'This link is incomplete'", async ({ page }) => {
    await gotoApp(page, "/view");
    await expect(page.locator("header [role=note]")).toBeVisible();
    await expect(page.getByRole("link", { name: "Stemma home", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "This link is incomplete" })).toBeVisible();
    await expect(page.locator("main#main")).toHaveCount(1);
    await expectNoSeriousA11y(page);
  });

  test("context chips, Copy as chart text, Download FHIR, and the demo clinician review", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await gotoApp(page, "/summary");
    const link = await makeLink(page);
    await gotoApp(page, link);
    await expect(page.locator("header [role=note]")).toBeVisible();

    const chips = page.getByRole("list", { name: "About this summary" }).getByRole("listitem");
    await expect(chips).toHaveCount(4);
    await expect(chips.nth(0)).toContainText("Shared by Alex");
    await expect(chips.nth(1)).toHaveText("Reviewed by patient");
    await expect(chips.nth(2)).toHaveText("Read-only");
    await expect(chips.nth(3)).toHaveText("Synthetic demo data");
    await expect(page.getByText("Prototype links don’t expire. Pilot links will expire and can be revoked.")).toBeVisible();

    await page.getByRole("button", { name: "Copy as chart text" }).click();
    const text = await page.evaluate(() => navigator.clipboard.readText());
    const lines = text.split("\n");
    expect(lines).toContain(CHART_HEADER);
    expect(lines[0]).toMatch(/^Family history \(patient-reported\) · Alex/);
    expect(text).toMatch(/^Father \(Dad, deceased\) \| Heart attack \| 60 \| Reported by Mom \|/m);
    expect(text).toMatch(/^Paternal uncle \(Uncle Dev\) \| Atrial fibrillation \| 34 \| Portal record \(on problem list since 2009\)/m);

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download FHIR" }).click()]);
    const json = JSON.parse(await readFile((await download.path())!, "utf8"));
    for (const e of json.entry) expect(e.resource.resourceType).toBe("FamilyMemberHistory");

    const doc = page.getByRole("article", { name: "Pre-visit family history summary" });
    const sw = page.getByRole("switch", { name: CLINICIAN_REVIEW });
    await expect(sw).toHaveAttribute("aria-checked", "false");
    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await expect(doc).toContainText(/Reviewed by clinician/i);
    expect(await page.evaluate(() => Object.keys(localStorage).some((k) => k.startsWith("fht:clinician-reviewed:")))).toBe(true);
    await page.reload();
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await expect(page.getByRole("switch", { name: CLINICIAN_REVIEW })).toHaveAttribute("aria-checked", "true");

    // provenance on the care-team table
    await doc.getByRole("button", { name: /^Portal record/ }).click();
    const pop = page.getByRole("group", { name: /Where this came from: Uncle Dev/ });
    await expect(pop).toContainText("on the problem list since 2009");
    await expect(pop).not.toContainText(/verified/i);
    await page.keyboard.press("Escape");

    await settle(page);
    await expectNoSeriousA11y(page);
    expect(await contrastOf(doc.getByText("Synthetic demo data", { exact: true }))).toBeGreaterThanOrEqual(4.5);
  });
});

test.describe("/practice: the practice-side demo (A1)", () => {
  test("header, visits (Alex live + 3 labelled demo rows), and the care-team document with 'For clinician review'", async ({ page }) => {
    await gotoApp(page, "/practice");
    await expect(page.locator("header [role=note]")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: "Cardiology Associates (demo)" })).toBeVisible();
    await expect(page.getByText("Practice view · Demo")).toBeVisible();

    const rows = page.getByRole("table", { name: /Upcoming new-patient visits/ }).getByRole("row");
    await expect(rows).toHaveCount(5); // header + Alex + 3 demo rows
    await expect(rows.nth(1)).toContainText("Alex");
    await expect(rows.nth(1)).toContainText("Wed, Oct 14");
    await expect(rows.nth(1)).toContainText(/In progress · \d+ of 7 relatives answered/);
    for (const i of [2, 3, 4]) await expect(rows.nth(i)).toContainText("Demo row");
    await expect(rows.nth(2).getByRole("button")).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(/\d\s?%/);

    await expect(page.getByRole("heading", { name: /For clinician review/ })).toBeVisible();
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
    await expect(page.getByText("In a pilot, this arrives through the practice link or the check-in QR, not from the patient’s browser.")).toBeVisible();
  });

  test("the patient's review shows up as 'Summary reviewed'", async ({ page }) => {
    await gotoApp(page, "/summary");
    await review(page);
    await gotoApp(page, "/practice");
    await expect(page.getByRole("table", { name: /Upcoming new-patient visits/ }).getByRole("row").nth(1)).toContainText("Summary reviewed");
  });

  test("Copy as chart text, Download FHIR and Mark reviewed by clinician", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await gotoApp(page, "/practice");
    await page.getByRole("button", { name: "Copy as chart text" }).click();
    expect((await page.evaluate(() => navigator.clipboard.readText())).split("\n")).toContain(CHART_HEADER);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download FHIR" }).click()]);
    expect(JSON.parse(await readFile((await download.path())!, "utf8")).resourceType).toBe("Bundle");
    await page.getByRole("switch", { name: CLINICIAN_REVIEW }).click();
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toContainText(/Reviewed by clinician/i);
  });

  test("axe: 0 serious or critical", async ({ page }) => {
    await gotoApp(page, "/practice");
    await expectNoSeriousA11y(page);
  });
});

test.describe("/practice on phones", () => {
  test.use(MOBILE);

  test("visits are cards; tapping Alex reveals the care-team document; ?patient=self opens it directly", async ({ page }) => {
    await gotoApp(page, "/practice");
    const doc = page.getByRole("article", { name: "Pre-visit family history summary" });
    await expect(doc).toBeHidden();
    const cards = page.getByRole("list", { name: "Upcoming new-patient visits" }).getByRole("listitem");
    await expect(cards).toHaveCount(4);
    await expect(cards.filter({ hasText: "Demo row" })).toHaveCount(3);
    await page.getByRole("button", { name: /Alex: open the care-team summary/ }).click();
    await expect(doc).toBeVisible();
    await expect(page.getByRole("heading", { name: /For clinician review/ })).toBeVisible();
    await expect(page).toHaveURL(/\?patient=self$/);
    await settle(page);
    await expectNoSeriousA11y(page);

    await gotoApp(page, "/practice?patient=self");
    await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("reviewing, making a link and opening check-in leave nothing running", async ({ page }) => {
    await gotoApp(page, "/summary");
    await makeLink(page);
    await page.getByRole("button", { name: "Show at check-in" }).click();
    await expect(page.getByRole("dialog", { name: /Alex · Cardiology/ })).toBeVisible();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });
});

test.describe("no sideways scroll at 375 and 390 px", () => {
  for (const width of [375, 390]) {
    test(`/summary, /view and /practice at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await gotoApp(page, "/summary");
      await noHorizontalOverflow(page);
      const link = await makeLink(page);
      await gotoApp(page, link);
      await noHorizontalOverflow(page);
      await gotoApp(page, "/view");
      await noHorizontalOverflow(page);
      await gotoApp(page, "/practice?patient=self");
      await noHorizontalOverflow(page);
    });
  }
});

test.describe("print (DESIGN §14: each copy is one Letter page)", () => {
  test("/summary, the /view care-team link and /practice each print on one Letter page", async ({ page, context }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await gotoApp(page, "/summary");
    await review(page);
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
