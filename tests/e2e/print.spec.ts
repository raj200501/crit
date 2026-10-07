// DESIGN §13.7 acceptance 2 (owner: P7): every copy of the summary prints on exactly one Letter page, for the demo family
// as shipped and after Grandpa Luis's simulated-record reply has been imported (the demo's fullest state).
import type { Page } from "@playwright/test";
import { demoTree } from "../../src/lib/demo";
import type { FamilyTree, Report } from "../../src/lib/types";
import { expect, gotoApp, pdfPageCount, test } from "./fixtures";

const AT = "2026-10-01T15:20:00Z";

/** demoTree() after Luis answers: one fact from his (simulated) portal record, plus what he knows about Mom and Grandma Rosa. */
function afterLuisReplies(): FamilyTree {
  const t = demoTree();
  const luis = (r: Omit<Report, "id" | "reportedBy" | "reportedById" | "reportedAt">, id: string): Report => ({
    ...r,
    id,
    reportedBy: "Grandpa Luis",
    reportedById: "mgf",
    reportedAt: AT,
  });
  return {
    ...t,
    reports: [
      ...t.reports,
      luis(
        {
          personId: "mgf",
          kind: "condition",
          condition: "Atrial fibrillation",
          ageAtOnset: 34,
          source: "record",
          record: {
            system: "Simulated portal record",
            reference: "Condition/simulated-afib",
            code: { system: "http://snomed.info/sct", code: "49436004", display: "Atrial fibrillation" },
            recordedDate: "2009-04-02",
            retrievedAt: AT,
          },
        },
        "r-luis-record",
      ),
      luis(
        { personId: "mgm", kind: "condition", condition: "Very high cholesterol", ageAtOnset: 35, approximate: true, note: "On pills for it since her thirties.", source: "relative" },
        "r-luis-rosa",
      ),
      luis({ personId: "mom", kind: "no-history", source: "relative" }, "r-luis-mom"),
    ],
    invites: [...t.invites, { id: "i-mgf", personId: "mgf", token: "demo-mgf", createdAt: "2026-09-30T20:00:00Z", answeredAt: AT }],
    updatedAt: AT,
  };
}

async function useTree(page: Page, tree: FamilyTree | null) {
  await gotoApp(page, "/summary");
  await page.evaluate((t) => {
    if (t) localStorage.setItem("fht:tree:v1", JSON.stringify(t));
    else localStorage.removeItem("fht:tree:v1");
  }, tree);
}

const pages = async (page: Page) => pdfPageCount(await page.pdf({ format: "Letter", printBackground: true }));

for (const [label, make] of [
  ["the demo family", () => null],
  ["after Grandpa Luis's simulated-record reply", afterLuisReplies],
] as const) {
  test(`one Letter page each: /summary, /view and /practice, ${label}`, async ({ page, context }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await useTree(page, make());
    await gotoApp(page, "/summary");
    if (label.startsWith("after")) await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toContainText("Grandpa Luis");
    await page.getByRole("checkbox").first().check();
    expect(await pages(page), "/summary (patient copy)").toBe(1);

    await page.getByRole("button", { name: "Make a link for the practice" }).click();
    const link = await page.getByRole("textbox", { name: "Read-only summary link" }).inputValue();
    const view = await context.newPage();
    await view.setViewportSize({ width: 1360, height: 900 });
    await gotoApp(view, link);
    await expect(view.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
    expect(await pages(view), "/view (care-team copy)").toBe(1);

    await gotoApp(view, "/practice");
    await expect(view.getByRole("heading", { name: /For clinician review/ })).toBeVisible();
    expect(await pages(view), "/practice (care-team copy)").toBe(1);

    // a narrow window prints the same single page (print layout doesn't depend on the screen width)
    await view.setViewportSize({ width: 390, height: 844 });
    await gotoApp(view, "/practice");
    expect(await pages(view), "/practice from a phone-width window").toBe(1);
  });
}

test("the printout is the document only: no app chrome, rail, buttons or popovers", async ({ page }) => {
  await gotoApp(page, "/summary");
  await page.emulateMedia({ media: "print" });
  for (const sel of ['header[data-shell="app"]', 'nav[aria-label="Main"]', 'aside[aria-label="Review and share"]']) {
    await expect(page.locator(sel).first()).toBeHidden();
  }
  await expect(page.getByRole("article", { name: "Pre-visit family history summary" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to tree" })).toBeHidden();
});
