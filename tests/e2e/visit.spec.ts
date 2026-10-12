// Visit types and specialty packs (spec E.4): a patient picks the visit type, the questions change with it, the general
// pack's care-team copy applies no criteria, and the demo, old links and legacy trees stay cardiology.
import type { Browser, Page } from "@playwright/test";
import { blankTree, demoTree } from "../../src/lib/demo";
import type { FamilyTree, Report } from "../../src/lib/types";
import { expect, expectNoSeriousA11y, gotoApp, instrumentContext, expectClean, MOBILE, noHorizontalOverflow, pdfPageCount, RELATIVE_PHONE, test } from "./fixtures";

const AT = "2026-10-01T15:20:00Z";
const PICK_TYPE = "Pick the kind of visit. You can change it later.";
const doc = (page: Page) => page.getByRole("article", { name: "Pre-visit family history summary" });
const h1 = (page: Page) => page.getByRole("heading", { level: 1 });

const rep = (personId: string, r: Partial<Report>, i: number): Report => ({
  id: `v${i}`,
  personId,
  kind: "condition",
  reportedBy: "Sam",
  reportedById: "self",
  source: "patient",
  reportedAt: AT,
  ...r,
});

/** Sam's primary-care tree with Mother's breast cancer at 45 (what test 1 builds by hand). */
function samTree(extra: (t: FamilyTree) => void = () => {}): FamilyTree {
  const t = blankTree("Sam", { specialty: "Primary care", date: "2026-10-20", type: "primary-care" });
  t.id = "t-sam";
  t.updatedAt = AT;
  t.reports = [rep("mom", { condition: "Breast cancer", ageAtOnset: 45 }, 1)];
  // invited already, so a reply from them imports (an invite counts once its link leaves the screen)
  t.invites = ["mom", "dad"].map((personId) => ({ id: `i-${personId}`, personId, token: `tok-${personId}`, createdAt: AT }));
  extra(t);
  return t;
}

async function seed(page: Page, tree: FamilyTree, path = "/tree") {
  await gotoApp(page, "/summary");
  await page.evaluate((t) => localStorage.setItem("fht:tree:v1", JSON.stringify(t)), tree);
  await gotoApp(page, path);
}

/** An invite link for Grandpa Luis from another device, built like src/lib/share.ts buildInvite() (invite.spec.ts). */
function luisInvite(over: Record<string, unknown> = {}) {
  const payload = {
    v: 1,
    t: "demo",
    n: "Alex",
    p: "mgf",
    l: "Grandpa Luis",
    r: "maternal-grandfather",
    s: "cardiology visit",
    a: [
      { id: "mom", l: "Mom (your child)" },
      { id: "mgm", l: "Grandma Rosa (your spouse)" },
    ],
    ...over,
  };
  return `/invite#${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

/** Opens the visit pill's popover (the header button names the visit). */
async function openPill(page: Page, current: RegExp) {
  await page.getByRole("button", { name: current }).first().click();
  const form = page.locator("form").filter({ has: page.getByText("Your upcoming visit", { exact: true }) });
  await expect(form.getByRole("radio").first()).toBeVisible();
  return form;
}

async function answerFor(page: Page, id: string) {
  await gotoApp(page, `/tree?person=${id}&mode=answer`);
  const form = page.locator("form").filter({ has: page.getByRole("button", { name: "Add to tree" }) });
  await expect(form).toBeVisible();
  return form;
}

for (const [label, device] of [
  ["desktop", null],
  ["phone", MOBILE],
] as const) {
  test.describe(`primary care, end to end (${label})`, () => {
    if (device) test.use(device);

    test("start a primary-care tree, answer with the general questions, see None on the list", async ({ page }) => {
      await gotoApp(page, "/tree");
      if (device) await page.getByRole("button", { name: /Checklist & activity/ }).click();
      await page.getByRole("button", { name: "Start my own tree" }).click();
      await page.getByRole("textbox", { name: "Your first name" }).fill("Sam");
      const start = page.locator("form").filter({ has: page.getByRole("button", { name: "Start", exact: true }) });
      await expect(start.locator("legend", { hasText: "Visit type" })).toBeVisible();
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await expect(page.getByRole("alert").filter({ hasText: PICK_TYPE })).toBeVisible();
      await expect(page.getByRole("radio", { name: "Cardiology" })).toBeFocused();
      await page.getByRole("radio", { name: "Primary care or wellness visit" }).check();
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await expect(page.getByRole("button", { name: /^Primary care/ }).first()).toBeVisible();

      // the general questions
      let form = await answerFor(page, "mom");
      await expect(form.getByRole("radiogroup", { name: "Other answers" }).getByRole("radio", { name: "None of these" })).toBeVisible();
      await expect(form.getByRole("radiogroup", { name: "Other answers" }).getByRole("radio", { name: "I don’t know" })).toBeVisible();
      for (const g of ["Heart & circulation", "Diabetes", "Cancer"]) await expect(form.getByRole("group", { name: g, exact: true })).toBeVisible();
      for (const c of ["High blood pressure", "Diabetes", "Breast cancer", "Another cancer", "Something else not listed"])
        await expect(form.getByRole("checkbox", { name: new RegExp(`^${c}`) })).toBeVisible();
      for (const c of [/Type 2 diabetes/, /^Heart muscle disease/, /Something else heart-related/]) await expect(form.getByRole("checkbox", { name: c })).toHaveCount(0);
      await form.getByRole("checkbox", { name: /^Breast cancer/ }).check();
      await form.getByRole("textbox", { name: "About how old were they?" }).fill("45");
      await form.getByRole("button", { name: "Add to tree" }).click();
      await expect(page.getByText("Breast cancer · age 45").first()).toBeVisible();

      // "What kind?" on Another cancer
      form = await answerFor(page, "dad");
      await form.getByRole("checkbox", { name: /^Another cancer/ }).check();
      await form.getByRole("textbox", { name: "What kind? (optional)" }).fill("prostate");
      await form.getByRole("button", { name: "Add to tree" }).click();
      await expect(page.getByText("Other cancer: prostate").first()).toBeVisible();

      // None of these, read back in the general pack's words, whole on the node
      form = await answerFor(page, "pgf");
      await form.getByRole("radio", { name: "None of these" }).check();
      await form.getByRole("button", { name: "Add to tree" }).click();
      await gotoApp(page, "/tree");
      const node = page.locator('[data-person-id="pgf"]').first();
      await expect(node).toHaveAttribute("aria-label", /None on the list/);
      if (!device) {
        await expect(node).toContainText("None on the list");
        expect(await node.locator("span").evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 0.5).map((e) => e.textContent))).toEqual([]);
      }
      await expect(page.getByRole("list", { name: "Legend" }).getByRole("button", { name: /Condition reported/ })).toBeVisible();
    });
  });
}

test("general summary: the patient copy has facts and questions, never criteria", async ({ page }) => {
  await seed(page, samTree((t) => t.reports.push(rep("pgf", { kind: "no-history", condition: undefined, source: "self", reportedBy: "Father's father", reportedById: "pgf", pack: "general" }, 2))), "/summary");
  const d = doc(page);
  await expect(d).toContainText("Pre-visit family health history");
  await expect(d).toContainText("Breast cancer, age 45");
  await expect(d).toContainText("None on the list");
  await expect(d.getByRole("heading", { name: "Questions you could ask" })).toBeVisible();
  for (const banned of [/Basis:/, /guideline/i, /criteri/i, /For clinician review/]) await expect(d).not.toContainText(banned);
  const care = page.getByText(/^Your care team gets a separate version through the practice link or the check-in QR\./).first();
  await expect(care).toContainText("It lists the same facts, laid out for your clinician.");
  await expect(care).not.toContainText(/criteri/i);
  await expectNoSeriousA11y(page);
});

test("general care-team copy: no count, no criteria, reported conditions first-degree first, the coverage footer", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  // a sister (added last) plus seven more relatives with a condition: the sister still makes the first six
  const tree = samTree((t) => {
    let i = 10;
    for (const id of ["pgf", "pgm", "mgf", "mgm"]) t.reports.push(rep(id, { condition: "Diabetes" }, i++));
    for (const n of [0, 1, 2]) {
      t.people.push({ id: `au${n}`, relation: "maternal-aunt-uncle", label: `Aunt ${n}`, sex: "female" });
      t.reports.push(rep(`au${n}`, { condition: "High blood pressure" }, i++));
    }
    t.people.push({ id: "sis", relation: "sibling", label: "Sister", sex: "female" });
    t.reports.push(rep("sis", { condition: "Breast cancer", ageAtOnset: 41 }, i++));
  });
  await seed(page, tree, "/practice?patient=self");
  await expect(h1(page)).toHaveText("Demo practice");
  const d = doc(page);
  await expect(d.getByRole("heading", { name: "For clinician review", exact: true })).toBeVisible();
  await expect(d).toContainText("No guideline criteria are applied for this visit type yet.");
  await expect(d).toContainText("Reported conditions · no criteria applied");
  await expect(d).toContainText("Mother (mother's side). Breast cancer, age 45");
  await expect(d).toContainText("Asked about: heart attack or blocked arteries");
  await expect(d).toContainText("Relatives covered: parents, siblings, grandparents, aunts and uncles; not the patient’s children, nieces, nephews or cousins.");
  await expect(d).not.toContainText("Basis:");
  const band = d.locator("section").filter({ hasText: "Reported conditions · no criteria applied" });
  const lines = await band.getByRole("listitem").allInnerTexts();
  expect(lines).toHaveLength(6);
  expect(lines.some((l) => l.startsWith("Sister."))).toBe(true);
  await expect(band).toContainText("And 3 more relatives in the table below.");

  await page.getByRole("button", { name: "Copy as chart text" }).click();
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text.trimEnd()).toMatch(/No guideline criteria applied for this visit type\. Asked about: heart attack or blocked arteries, .*another cancer\.$/);
  await expectNoSeriousA11y(page);

  // the same copy through the read-only /view link
  await gotoApp(page, "/summary");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Make a link for the practice" }).click();
  const link = await page.getByRole("textbox", { name: "Read-only summary link" }).inputValue();
  await gotoApp(page, link);
  await expect(doc(page)).toContainText("No guideline criteria are applied for this visit type yet.");
  await expect(doc(page)).not.toContainText("Basis:");
});

/** The relative's phone: opens a link in a fresh context. */
async function relative(browser: Browser, baseURL: string | undefined, url: string) {
  const ctx = await browser.newContext(RELATIVE_PHONE);
  const report = await instrumentContext(ctx, baseURL);
  const page = await ctx.newPage();
  await gotoApp(page, url);
  return { ctx, report, page };
}

async function previewHref(page: Page, id: string, name: string) {
  await gotoApp(page, `/tree?person=${id}&mode=invite`);
  return (await page.getByRole("link", { name: `Preview as ${name}` }).getAttribute("href"))!;
}

test("other specialist: name it, invite a relative, import the reply; GI keeps its capitals; a cardiologist gets heart questions", async ({ page, browser, baseURL }) => {
  await seed(page, samTree((t) => (t.reports = [])));
  let form = await openPill(page, /^Primary care/);
  await form.getByRole("radio", { name: "Other specialist" }).check();
  await expect(form.getByText("For example, dermatology or GI. Relatives you invite will see this.")).toBeVisible();
  await expect(form.getByText("The questions change with the visit type.", { exact: false })).toHaveCount(0); // primary care → other: same questions
  await form.getByRole("button", { name: "Save" }).click();
  await expect(form.getByRole("alert")).toHaveText("Name the specialist, like dermatology.");
  await expect(form.getByRole("textbox", { name: "Which specialist?" })).toBeFocused();
  await expectNoSeriousA11y(page);
  await form.getByRole("textbox", { name: "Which specialist?" }).fill("Dermatology");
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: /^Dermatology/ }).first()).toBeVisible();

  const rel = await relative(browser, baseURL, await previewHref(page, "mom", "Mother"));
  const m = rel.page;
  await expect(m.getByText("Sam is getting ready for a dermatology visit and is asking about the family’s health history.", { exact: false })).toBeVisible();
  await expect(m.getByText("Sam, and Sam’s dermatology team if Sam shares the summary.")).toBeVisible();
  await m.getByText("See the questions").click();
  for (const q of ["Diabetes", "Something else not listed"]) await expect(m.getByRole("listitem").filter({ hasText: new RegExp(`^${q}$`) })).toBeVisible();
  await expectNoSeriousA11y(m);
  await m.getByRole("checkbox", { name: /18 or older/ }).check();
  await m.getByRole("button", { name: "Start", exact: true }).click();
  await m.getByRole("radio", { name: "None of these" }).click();
  await m.getByRole("button", { name: "Next", exact: true }).click();
  await m.getByRole("button", { name: "Review and send" }).click();
  await expect(m.getByRole("region", { name: "Mother (you)" })).toContainText("None on the list");
  await m.getByRole("checkbox", { name: /Share these answers with Sam/ }).check();
  await m.getByRole("button", { name: /Send to Sam/ }).click();
  await expect(m.locator("main")).toContainText("If Sam shares a summary with their doctor, your answers are on it with your name.");
  const reply = await m.evaluate(() => {
    const key = Object.keys(sessionStorage).find((k) => k.startsWith("fht:invite:"));
    return key ? (JSON.parse(sessionStorage.getItem(key) ?? "{}").link as string) : "";
  });
  expectClean(rel.report);
  await rel.ctx.close();

  await gotoApp(page, reply);
  await page.getByRole("button", { name: "Add to my tree" }).click();
  await expect(page.locator("main")).toContainText(/Added \d+ answers? to your tree/);
  await gotoApp(page, "/tree");
  await expect(page.locator('[data-person-id="mom"]').first()).toHaveAttribute("aria-label", /None on the list/);

  // GI keeps its capitals on the relative's page
  form = await openPill(page, /^Dermatology/);
  await form.getByRole("textbox", { name: "Which specialist?" }).fill("GI");
  await form.getByRole("button", { name: "Save" }).click();
  const gi = await relative(browser, baseURL, await previewHref(page, "dad", "Father"));
  await expect(gi.page.getByText("for a GI visit", { exact: false })).toBeVisible();
  await expect(gi.page.getByText("Sam’s GI team", { exact: false })).toBeVisible();
  await gi.ctx.close();

  // a cardiologist typed under Other gets the heart questions
  form = await openPill(page, /^GI/);
  await form.getByRole("textbox", { name: "Which specialist?" }).fill("cardiologist");
  await expect(form.getByText("That’s cardiology, so the heart questions are used.")).toBeVisible();
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("button", { name: /^Cardiology/ }).first()).toBeVisible();
  const answer = await answerFor(page, "pgm");
  await expect(answer.getByRole("checkbox", { name: /^Heart muscle disease/ })).toBeVisible();
});

test("a general invite built by hand: general cards, record picker suggestions, and its own drafts", async ({ page }) => {
  // the same tab opens a cardiology invite first and answers; the general invite must not resume those drafts
  await gotoApp(page, luisInvite());
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await page.getByRole("radio", { name: "None of these" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(h1(page)).toContainText("people you might know better");

  await gotoApp(page, luisInvite({ s: "primary care visit", k: "general" }));
  await expect(h1(page)).toHaveText("Alex asked for your help.");
  await expect(page.getByText("for a primary care visit and is asking about the family’s health history", { exact: false })).toBeVisible();
  await page.getByText("See the questions").click();
  await expect(page.getByRole("listitem").filter({ hasText: /^Breast cancer$/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /^Heart muscle disease$/ })).toHaveCount(0);
  await page.getByRole("checkbox", { name: /18 or older/ }).check();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(page.getByText("Your answer so far")).toHaveCount(0);
  await page.getByRole("button", { name: /Use a simulated record/ }).click();
  await expect(page.getByText("Suggested for this visit")).toBeVisible();
  for (const c of ["Atrial fibrillation", "Essential hypertension"]) {
    const box = page.getByRole("checkbox", { name: new RegExp(`^${c}`) });
    await expect(box).toBeVisible();
    await expect(box).not.toBeChecked();
  }
});

test("old links and legacy trees stay cardiology", async ({ page }) => {
  // an invite made before visit types (no k): the heart questions
  await gotoApp(page, luisInvite());
  await page.getByText("See the questions").click();
  await expect(page.getByRole("listitem").filter({ hasText: /^Heart attack or blocked arteries$/ })).toBeVisible();
  await expect(page.getByRole("listitem").filter({ hasText: /^Something else heart-related$/ })).toBeVisible();

  // a tree saved before visit types, with a specialty that isn't cardiology and no type: still cardiology
  const legacy = demoTree();
  legacy.visit = { specialty: "Dermatology", date: "2026-10-14" };
  await seed(page, legacy);
  const answer = await answerFor(page, "pgm");
  await expect(answer.getByRole("checkbox", { name: /^Heart muscle disease/ })).toBeVisible();
  await gotoApp(page, "/summary");
  await page.getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Make a link for the practice" }).click();
  const link = await page.getByRole("textbox", { name: "Read-only summary link" }).inputValue();
  await gotoApp(page, link);
  await expect(doc(page)).toContainText("Basis:");

  // a reply whose "none" has no question set imports as "No heart history"
  const reply = { v: 1, t: "demo", p: "mom", b: "Mom", at: AT, reports: [{ personId: "mgm", kind: "no-history", reportedBy: "Mom", source: "relative", reportedAt: AT }] };
  await gotoApp(page, `/reply#${Buffer.from(JSON.stringify(reply)).toString("base64url")}`);
  await page.getByRole("button", { name: "Add to my tree" }).click();
  await expect(page.locator("main")).toContainText(/Added \d+ answers? to your tree/);
  await gotoApp(page, "/tree");
  await expect(page.locator('[data-person-id="mgm"]').first()).toHaveAttribute("aria-label", /No heart history/);
});

test("the demo stays cardiology", async ({ page }) => {
  await gotoApp(page, "/tree");
  await expect(page.getByRole("button", { name: /^Cardiology/ }).first()).toContainText(/Oct 14/i);
  const answer = await answerFor(page, "pgm");
  await expect(answer.getByRole("checkbox", { name: /^Heart muscle disease/ })).toBeVisible();
  await expect(answer.getByRole("checkbox", { name: /^Something else heart-related/ })).toBeVisible();
  await gotoApp(page, "/practice");
  await expect(h1(page)).toHaveText("Cardiology Associates (demo)");
  await expect(doc(page)).toContainText("Family-history criteria named in cardiology guidelines");
  await expect(doc(page)).toContainText("Basis:");
});

test("switching visit type keeps old words and invents no disagreement", async ({ page }) => {
  await seed(page, demoTree());
  let form = await openPill(page, /^Cardiology/);
  await form.getByRole("radio", { name: "Primary care or wellness visit" }).check();
  await expect(form.getByText("The questions change with the visit type. Answers already in the tree stay as they are.")).toBeVisible();
  await form.getByRole("button", { name: "Save" }).click();
  await expect(page.locator('[data-person-id="mom"]').first()).toHaveAttribute("aria-label", /^Mom: known\. No heart history/);
  const answer = await answerFor(page, "mom");
  await answer.getByRole("checkbox", { name: /^Breast cancer/ }).check();
  await answer.getByRole("button", { name: "Add to tree" }).click();
  await gotoApp(page, "/tree");
  await expect(page.locator('[data-person-id="mom"]').first()).toHaveAttribute("aria-label", /^Mom: known\./);
  await gotoApp(page, "/practice?patient=self");
  await expect(doc(page)).toContainText("No guideline criteria are applied for this visit type yet.");
  await expect(doc(page)).not.toContainText("Basis:");

  await gotoApp(page, "/tree");
  form = await openPill(page, /^Primary care/);
  await form.getByRole("radio", { name: "Cardiology" }).check();
  await form.getByRole("button", { name: "Save" }).click();
  await gotoApp(page, "/practice?patient=self");
  await expect(doc(page)).toContainText("Basis:");
  await expect(doc(page)).not.toContainText("None on the list");
});

test.describe("visit type: keyboard, accessibility and narrow screens", () => {
  test("the group has a visible legend; arrows change the radio; Enter saves", async ({ page }) => {
    await seed(page, samTree());
    const form = await openPill(page, /^Primary care/);
    await expect(form.locator("legend", { hasText: "Visit type" })).toBeVisible();
    await expect(form.getByRole("radio", { name: "Primary care or wellness visit" })).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(form.getByRole("radio", { name: "Cardiology" })).toBeChecked();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /^Cardiology/ }).first()).toBeVisible();
  });

  for (const size of [
    { width: 320, height: 720 },
    { width: 375, height: 812 },
  ]) {
    test(`no sideways scroll and no serious axe issues at ${size.width} px`, async ({ page }) => {
      await page.setViewportSize(size);
      await seed(page, samTree());
      const form = await openPill(page, /^Primary care/);
      await form.getByRole("radio", { name: "Other specialist" }).check();
      await form.getByRole("button", { name: "Save" }).click();
      await noHorizontalOverflow(page);
      await expectNoSeriousA11y(page);
      await page.keyboard.press("Escape");

      const answer = await answerFor(page, "mom");
      await answer.getByRole("checkbox", { name: /^Another cancer/ }).check();
      await expect(answer.getByRole("textbox", { name: "What kind? (optional)" })).toBeVisible();
      await noHorizontalOverflow(page);
      await expectNoSeriousA11y(page);

      for (const path of ["/summary", "/practice?patient=self"]) {
        await gotoApp(page, path);
        await noHorizontalOverflow(page);
        await expectNoSeriousA11y(page);
      }

      await gotoApp(page, luisInvite({ s: "primary care visit", k: "general" }));
      await noHorizontalOverflow(page);
      await expectNoSeriousA11y(page);
      await page.getByRole("checkbox", { name: /18 or older/ }).check();
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await page.getByRole("checkbox", { name: /^Another cancer/ }).check();
      await noHorizontalOverflow(page);
      await expectNoSeriousA11y(page);
    });
  }

  test("the start form's error is announced and passes axe", async ({ page }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("button", { name: "Start my own tree" }).click();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: PICK_TYPE })).toBeVisible();
    await expectNoSeriousA11y(page);
  });
});

/** demoTree() after Grandpa Luis answers (print.spec.ts), as a primary-care visit. */
function afterLuisRepliesPrimaryCare(): FamilyTree {
  const t = demoTree();
  const luis = (r: Omit<Report, "id" | "reportedBy" | "reportedById" | "reportedAt">, id: string): Report => ({ ...r, id, reportedBy: "Grandpa Luis", reportedById: "mgf", reportedAt: AT });
  return {
    ...t,
    visit: { ...t.visit!, specialty: "Primary care", type: "primary-care" },
    reports: [
      ...t.reports,
      luis(
        {
          personId: "mgf",
          kind: "condition",
          condition: "Atrial fibrillation",
          ageAtOnset: 34,
          source: "record",
          record: { system: "Simulated portal record", reference: "Condition/simulated-afib", recordedDate: "2009-04-02", retrievedAt: AT },
        },
        "r-luis-record",
      ),
      luis({ personId: "mgm", kind: "condition", condition: "Very high cholesterol", ageAtOnset: 35, approximate: true, note: "On pills for it since her thirties.", source: "relative" }, "r-luis-rosa"),
      luis({ personId: "mom", kind: "no-history", source: "relative", pack: "general" }, "r-luis-mom"),
    ],
    invites: [...t.invites, { id: "i-mgf", personId: "mgf", token: "demo-mgf", createdAt: "2026-09-30T20:00:00Z", answeredAt: AT }],
    updatedAt: AT,
  };
}

test("a primary-care visit's patient and care-team copies each print on one Letter page", async ({ page }) => {
  await page.setViewportSize({ width: 1360, height: 900 });
  await seed(page, afterLuisRepliesPrimaryCare(), "/summary");
  await expect(doc(page)).toContainText("Pre-visit family health history");
  await page.getByRole("checkbox").first().check();
  expect(pdfPageCount(await page.pdf({ format: "Letter", printBackground: true })), "/summary").toBe(1);
  await gotoApp(page, "/practice?patient=self");
  await expect(doc(page)).toContainText("No guideline criteria are applied for this visit type yet.");
  expect(pdfPageCount(await page.pdf({ format: "Letter", printBackground: true })), "/practice?patient=self").toBe(1);
});
