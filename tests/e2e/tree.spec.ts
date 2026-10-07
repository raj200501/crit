// Contract for /tree (owner: P5). DESIGN §12.1–12.5, §11.1–11.3, §13.5 acceptance; names per §12.9 (R2 chips, R7 sheet).
// Node lookups use the `{label}: {status}. {headline}` name pattern (e.g. /^Grandpa Luis:/), never /^Grandpa Luis/ (R2).
import type { Page } from "@playwright/test";
import { expect, expectNoSeriousA11y, gotoApp, MOBILE, noHorizontalOverflow, test } from "./fixtures";

const PEOPLE = ["self", "mom", "dad", "dev", "pgf", "pgm", "mgf", "mgm"];
const INVITE_TEXT =
  /^Hi, it's Alex\. I'm putting together our family health history and would love your help\. Here's a private link; you can answer, skip, or say no: (https?:\/\/\S+\/invite#\S+)$/;

/** A reply from Uncle Dev (invited in the demo) about his father, as /reply would receive it. */
function devReplyHash() {
  const at = new Date().toISOString();
  const payload = {
    v: 1,
    t: "demo",
    p: "dev",
    b: "Uncle Dev",
    at,
    reports: [
      {
        personId: "pgf",
        kind: "condition",
        condition: "Heart attack",
        ageAtOnset: 62,
        approximate: true,
        source: "relative",
        reportedBy: "Uncle Dev",
        reportedAt: at,
      },
    ],
  };
  return `/reply#${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

/** Waits for finite animations (panel entrances, crossfades) to finish, so axe measures the final colours. */
async function settle(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === "running" && Number.isFinite(Number(a.effect?.getComputedTiming().endTime))).length,
      ),
    )
    .toBe(0);
}

async function a11y(page: Page) {
  await settle(page);
  await expectNoSeriousA11y(page);
}

/** Rendered size of a node name: font-size × the canvas zoom (rendered width ÷ layout width). */
async function nameSizes(page: Page) {
  return page.locator('[role="group"][aria-label="Family health tree"] button[data-person-id]').evaluateAll((nodes) =>
    nodes.map((n) => {
      const el = n as HTMLElement;
      const k = el.getBoundingClientRect().width / el.offsetWidth;
      const name = el.querySelector("span span") as HTMLElement;
      return parseFloat(getComputedStyle(name).fontSize) * k;
    }),
  );
}

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
    // the header: the visit pill and the visit-ready ring (progress, never health)
    await expect(page.getByRole("heading", { level: 1, name: "Alex’s family" })).toBeVisible();
    await expect(page.getByRole("button", { name: /2 of 4 visit-ready/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Pre-visit summary" }).last()).toHaveAttribute("href", "/summary");
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

  test("a relative who passed away can't be asked directly; their conflict shows as two voices", async ({ page }) => {
    await page.getByRole("button", { name: /^Dad:/ }).click();
    const panel = page.locator('section[aria-label="Dad details"]');
    await expect(panel.getByRole("heading", { level: 2, name: "Dad" })).toBeFocused();
    await expect(panel.getByRole("button", { name: "Add what you know" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Ask Dad directly" })).toHaveCount(0);
    await expect(panel.getByRole("article", { name: "Mom said" })).toContainText("Heart attack · age 60");
    await expect(panel.getByRole("article", { name: "Uncle Dev said" })).toContainText("Angina · about age 58");
    await expect(panel).toContainText(/Both kept · names attached/i);
    // gaps link into the edit form
    await panel.getByRole("button", { name: "Add how he died" }).click();
    await expect(panel.getByRole("textbox", { name: "Cause, if known" })).toBeFocused();
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
    await expect(panel).toContainText("Heart attack or coronary artery disease · age 48");
  });

  test("answer form: radios are real, and an empty submit moves focus to the inline error", async ({ page }) => {
    await page.getByRole("button", { name: /^Grandpa Luis:/ }).click();
    const panel = page.locator('section[aria-label="Grandpa Luis details"]');
    await panel.getByRole("button", { name: "Add what you know" }).click();
    await panel.getByRole("button", { name: "Add to tree" }).click();
    await expect(panel.getByRole("alert")).toBeFocused();
    await panel.getByRole("radio", { name: "I don’t know" }).click();
    await expect(panel.getByRole("radio", { name: "I don’t know" })).toBeChecked();
    await panel.getByRole("button", { name: "Add a note" }).click();
    await panel.getByRole("textbox", { name: /Anything else, in your own words/ }).fill("Nobody ever said.");
    await panel.getByRole("button", { name: "Add to tree" }).click();
    await expect(page.locator('button[data-person-id="mgf"]')).toHaveAttribute("aria-label", /^Grandpa Luis: unknown\. No one knows yet/);
  });

  test("self panel: add your own history, then 'Remove this entry'", async ({ page }) => {
    await page.getByRole("button", { name: /^Alex \(you\):/ }).click();
    const panel = page.locator('section[aria-label="Alex (you) details"]');
    await panel.getByRole("button", { name: "Add your own history" }).click();
    await panel.getByRole("checkbox", { name: /Very high cholesterol/ }).check();
    await panel.getByRole("button", { name: "Add to tree" }).click();
    await expect(panel.getByRole("button", { name: "Remove this entry" }).first()).toBeVisible();
  });

  test("invite box: the exact no-health-info text with the full /invite# URL; Send…, Copy message → Copied, Preview link, Done", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.getByRole("button", { name: /^Grandpa Luis:/ }).click();
    const panel = page.locator('section[aria-label="Grandpa Luis details"]');
    await panel.getByRole("button", { name: "Ask Grandpa Luis directly" }).click();
    const message = await panel.getByLabel("Invite message").inputValue();
    expect(message).toMatch(/https?:\/\/\S+\/invite#\S+/);
    // AMENDMENTS A2: exactly this text; no specialty, no heart history, no time claim
    expect(message).toMatch(INVITE_TEXT);
    expect(message.replace(/https?:\/\/\S+/, "")).not.toMatch(/heart|cardio|minute/i);
    await expect(panel).toContainText("Alex asked for your help");
    await expect(panel.getByRole("button", { name: "Send…" })).toBeVisible();
    await expect(panel).toContainText(/Not sent yet/i);
    await panel.getByRole("button", { name: "Copy message" }).click();
    await expect(panel.getByRole("button", { name: "Copied" })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(message);
    await expect(page.getByRole("status")).toContainText("Copied");
    await expect(panel).toContainText(/Link created/i);
    const preview = panel.getByRole("link", { name: "Preview as Grandpa Luis" });
    await expect(preview).toHaveAttribute("target", "_blank");
    expect(await preview.getAttribute("href")).toMatch(/\/invite#/);
    await panel.getByRole("button", { name: "Done" }).click();
    await expect(panel.getByRole("button", { name: "Ask Grandpa Luis directly" })).toBeVisible();
    // the node now reads "invited, waiting"
    await expect(page.locator('[data-person-id="mgf"]')).toContainText(/Invited · waiting/i);
  });

  test("edit details: Save, Cancel and (for added relatives) Remove from tree", async ({ page }) => {
    await page.getByRole("button", { name: /^Uncle Dev:/ }).click();
    const panel = page.locator('section[aria-label="Uncle Dev details"]');
    await panel.getByRole("button", { name: "Edit details" }).click();
    await expect(panel.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(panel.getByRole("button", { name: "Remove from tree" })).toBeVisible();
    await expect(panel.getByRole("switch", { name: "Has passed away" })).toHaveAttribute("aria-checked", "false");
    await panel.getByRole("button", { name: "Cancel" }).click();
    await expect(panel.getByRole("button", { name: "Edit details" })).toBeVisible();
  });

  test("Still to confirm chips are named 'Open {label}' (R2) and open that relative", async ({ page }) => {
    await page.getByRole("button", { name: "Open Grandpa Luis" }).click();
    await expect(page.locator('section[aria-label="Grandpa Luis details"]')).toBeVisible();
  });

  test("the visit-ready checklist links into the right panel mode", async ({ page }) => {
    await page.getByRole("button", { name: /Note how anyone who passed away died/ }).click();
    const panel = page.locator('section[aria-label="Dad details"]');
    await expect(panel.getByRole("textbox", { name: "Cause, if known" })).toBeVisible();
  });

  test("keyboard: one tab stop on the canvas, arrows move between relatives, Enter opens", async ({ page }) => {
    const nodes = page.locator('[role="group"][aria-label="Family health tree"] button[data-person-id]');
    await expect(nodes.and(page.locator('[tabindex="0"]'))).toHaveCount(1);
    await page.locator('[data-person-id="self"]').focus();
    await page.keyboard.press("ArrowUp");
    const up = await page.evaluate(() => document.activeElement?.getAttribute("data-person-id"));
    expect(["dad", "mom"]).toContain(up);
    await page.locator('[data-person-id="dad"]').focus();
    await page.keyboard.press("ArrowLeft");
    await expect(page.locator('[data-person-id="dev"]')).toBeFocused();
    await expect(page.locator('[data-person-id="dev"]')).toHaveAttribute("tabindex", "0");
    await page.keyboard.press("ArrowUp");
    await expect(page.locator('[data-person-id="pgf"], [data-person-id="pgm"]').and(page.locator(":focus"))).toHaveCount(1);
    await page.keyboard.press("Enter");
    await expect(page.locator('section[aria-label$=" details"]')).toBeVisible();
  });

  test("toolbar: zoom in, zoom out, fit, center on me (and the keyboard shortcuts)", async ({ page }) => {
    const readout = () => page.getByRole("group", { name: "Canvas controls" }).innerText();
    const before = await readout();
    await page.getByRole("button", { name: "Zoom in" }).click();
    await expect.poll(readout).not.toBe(before);
    await page.getByRole("button", { name: "Fit" }).click();
    await page.getByRole("button", { name: "Center on me" }).click();
    await page.locator('[data-person-id="mom"]').focus();
    const k1 = await page.locator('[data-person-id="mom"]').evaluate((el) => el.getBoundingClientRect().width);
    await page.keyboard.press("+");
    await expect.poll(() => page.locator('[data-person-id="mom"]').evaluate((el) => el.getBoundingClientRect().width)).toBeGreaterThan(k1);
  });

  test("pan: dragging the canvas moves the tree; a drag that starts on a relative doesn't open them", async ({ page }) => {
    const dad = page.locator('[data-person-id="dad"]');
    const before = (await dad.boundingBox())!;
    const self = (await page.locator('[data-person-id="self"]').boundingBox())!;
    // start on empty canvas, below and left of "you"
    await page.mouse.move(self.x - 120, self.y + self.height + 30);
    await page.mouse.down();
    await page.mouse.move(self.x - 60, self.y + self.height + 10, { steps: 6 });
    await page.mouse.up();
    await expect.poll(async () => Math.round((await dad.boundingBox())!.x - before.x)).toBe(60);
    // a drag that begins on Mom pans instead of selecting her
    const mom = (await page.locator('[data-person-id="mom"]').boundingBox())!;
    await page.mouse.move(mom.x + 40, mom.y + 40);
    await page.mouse.down();
    await page.mouse.move(mom.x + 120, mom.y + 40, { steps: 6 });
    await page.mouse.up();
    await page.waitForTimeout(150);
    await expect(page.locator('section[aria-label="Mom details"]')).toHaveCount(0);
  });

  test("a legend chip toggles aria-pressed and dims non-matching relatives", async ({ page }) => {
    const chip = page.getByRole("list", { name: "Legend" }).getByRole("button", { name: /^Reports disagree/ });
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "true");
    const opacity = (id: string) => page.locator(`[data-person-id="${id}"]`).evaluate((el) => Number(getComputedStyle(el).opacity));
    await expect.poll(() => opacity("mom")).toBeLessThan(0.5);
    await expect.poll(() => opacity("dad")).toBe(1);
    await chip.click();
    await expect(chip).toHaveAttribute("aria-pressed", "false");
    await expect.poll(() => opacity("mom")).toBe(1);
  });

  test("ghost slot: add Dad's brother or sister, then their panel opens", async ({ page }) => {
    await page.getByRole("button", { name: "Add Dad’s brother or sister" }).click();
    const form = page.getByRole("group", { name: "Add your father’s brother or sister" });
    await form.getByRole("textbox", { name: "Name" }).fill("Aunt Priya");
    await form.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.locator('section[aria-label="Aunt Priya details"]')).toBeVisible();
    await expect(page.getByRole("button", { name: /^Aunt Priya: unknown\./ })).toBeVisible();
  });

  test("list view shows the same relatives by generation, with the same buttons", async ({ page }) => {
    await page.getByRole("button", { name: "List view" }).click();
    const group = page.getByRole("group", { name: "Family health tree" });
    for (const h of ["Grandparents", "Parents and their siblings", "You and siblings"]) await expect(group.getByRole("heading", { name: h })).toBeVisible();
    await group.getByRole("button", { name: /^Dad:/ }).click();
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
  });

  test("?person=dad opens Dad details; ?person=mgf&mode=invite opens the invite box; unknown ids are ignored", async ({ page }) => {
    await gotoApp(page, "/tree?person=dad");
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
    await expect(page).toHaveURL(/\/tree$/);
    await gotoApp(page, "/tree?person=mgf&mode=invite");
    const message = await page.locator('section[aria-label="Grandpa Luis details"]').getByLabel("Invite message").inputValue();
    expect(message).toMatch(/https?:\/\/\S+\/invite#\S+/);
    await gotoApp(page, "/tree?person=nobody");
    await expect(page.locator('section[aria-label$=" details"]')).toHaveCount(0);
  });

  test("the role menu's invite link works while already on /tree", async ({ page }) => {
    await page.getByRole("button", { name: "Viewing as Alex (patient)" }).click();
    await page.getByRole("link", { name: "Relative · Grandpa Luis's invite" }).click();
    await expect(page.locator('section[aria-label="Grandpa Luis details"]').getByLabel("Invite message")).toBeVisible();
  });

  test("axe: 0 serious with the panel closed, open, the answer form and the invite box", async ({ page }) => {
    await a11y(page);
    await page.getByRole("button", { name: /^Dad:/ }).click();
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
    await a11y(page);
    await page.getByRole("button", { name: "Add what you know" }).click();
    await page.getByRole("checkbox", { name: /^Irregular heartbeat/ }).check();
    await a11y(page);
    await gotoApp(page, "/tree?person=mgf&mode=invite");
    await expect(page.getByLabel("Invite message")).toBeVisible();
    await a11y(page);
  });
});

test.describe("tour", () => {
  test.use({ skipTour: false });

  test("shows on the first visit to the demo; Skip tour ends it for good", async ({ page }) => {
    await gotoApp(page, "/tree");
    const tour = page.getByRole("region", { name: "Demo tour" });
    await expect(tour).toBeVisible();
    await expect(tour).toContainText("1 / 4");
    await expect(tour).toContainText("Mom and Uncle Dev disagree about Dad.");
    await expect(page.locator('[data-person-id="dad"]')).toHaveAttribute("data-tour-anchor", "true");
    await tour.getByRole("button", { name: "Next" }).click();
    await expect(tour).toContainText("2 / 4");
    await expect(page.locator('[data-person-id="dev"]')).toHaveAttribute("data-tour-anchor", "true");
    await tour.getByRole("button", { name: "Skip tour" }).click();
    await expect(tour).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("fht:tour:v1"))).toBe("done");
    await page.reload();
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await expect(page.getByRole("region", { name: "Demo tour" })).toHaveCount(0);
  });

  test("the last stop asks Grandpa Luis (invite mode)", async ({ page }) => {
    await gotoApp(page, "/tree");
    const tour = page.getByRole("region", { name: "Demo tour" });
    for (let i = 0; i < 3; i++) await tour.getByRole("button", { name: "Next" }).click();
    await tour.getByRole("button", { name: "Ask Grandpa Luis" }).click();
    await expect(page.locator('section[aria-label="Grandpa Luis details"]').getByLabel("Invite message")).toBeVisible();
    await expect(tour).toHaveCount(0);
  });

  test("?tour=0 suppresses it", async ({ page }) => {
    await gotoApp(page, "/tree?tour=0");
    await page.waitForTimeout(400);
    await expect(page.getByRole("region", { name: "Demo tour" })).toHaveCount(0);
  });
});

test.describe("arrival", () => {
  test("a reply imported in another tab: toast with View, ripple, and a New tag on the activity row", async ({ page, context }) => {
    await gotoApp(page, "/tree");
    const other = await context.newPage();
    await gotoApp(other, devReplyHash());
    await other.getByRole("button", { name: "Add to my tree" }).click();
    await expect(other.locator("main")).toContainText(/Added 1 answer/);

    const toast = page.getByRole("status");
    await expect(toast).toContainText("Uncle Dev answered");
    await expect(toast).toContainText("About Grandpa Ray: heart attack, about age 62");
    await expect(page.locator('[data-person-id="pgf"] [data-ripple]').first()).toBeAttached();
    await expect(page.locator('[data-person-id="pgf"]')).toContainText("NEW");
    const activity = page.locator('section[aria-labelledby="activity-title"]');
    await expect(activity.getByText("New", { exact: true })).toBeVisible();
    await toast.getByRole("button", { name: "View" }).click();
    await expect(page.locator('section[aria-label="Grandpa Ray details"]')).toBeVisible();
  });

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("no ripple animation, but the toast still appears", async ({ page, context }) => {
      await gotoApp(page, "/tree");
      const other = await context.newPage();
      await gotoApp(other, devReplyHash());
      await other.getByRole("button", { name: "Add to my tree" }).click();
      await expect(page.getByRole("status")).toContainText("Uncle Dev answered");
      await expect(page.locator('[data-person-id="pgf"]')).toContainText("NEW");
      await expect(page.locator('[data-person-id="pgf"] [data-ripple]').first()).toBeHidden();
      const ripples = await page.evaluate(
        () => document.getAnimations().filter((a) => (a as CSSAnimation).animationName === "ripple" && a.playState === "running").length,
      );
      expect(ripples).toBe(0);
    });
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("/tree settles with no running animations, with the panel closed and open", async ({ page }) => {
    await gotoApp(page, "/tree");
    const running = () => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
    await expect.poll(running).toBe(0);
    await page.getByRole("button", { name: /^Dad:/ }).click();
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
    await expect.poll(running).toBe(0);
  });
});

test.describe("tree on phones", () => {
  test.use(MOBILE);

  test("tapping Dad shows 'Dad details' in a bottom sheet; Esc closes it and focus returns to the node", async ({ page }) => {
    await gotoApp(page, "/tree");
    await page.locator('button[aria-label^="Dad:"]').tap();
    const panel = page.locator('section[aria-label="Dad details"]');
    await expect(panel).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Dad" })).toBeVisible();
    await expect(panel.getByRole("heading", { level: 2, name: "Dad" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page.locator('[data-person-id="dad"]')).toBeFocused();
  });

  test("legibility: centred on you at k = 1, every node name ≥ 13 px, and no horizontal page overflow", async ({ page }) => {
    await gotoApp(page, "/tree");
    for (const size of await nameSizes(page)) expect(size).toBeGreaterThanOrEqual(13);
    const self = await page.locator('[data-person-id="self"]').boundingBox();
    const canvas = await page
      .locator('[role="group"][aria-label="Family health tree"]')
      .locator("xpath=ancestor::div[contains(@class,'group/vp')]")
      .boundingBox();
    expect(self && canvas).toBeTruthy();
    expect(Math.abs(self!.x + self!.width / 2 - (canvas!.x + canvas!.width / 2))).toBeLessThan(4);
    await noHorizontalOverflow(page);
  });

  test("Tree | List: the list view works and opens the sheet", async ({ page }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("group", { name: "Show the family as" }).getByRole("button", { name: "List" }).click();
    await page.getByRole("button", { name: /^Grandma Rosa:/ }).click();
    await expect(page.locator('section[aria-label="Grandma Rosa details"]')).toBeVisible();
    await noHorizontalOverflow(page);
  });

  test("no horizontal page overflow, and the checklist collapses under the canvas", async ({ page }) => {
    await gotoApp(page, "/tree");
    await noHorizontalOverflow(page);
    const toggle = page.getByRole("button", { name: /Checklist & activity/ });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(page.getByRole("heading", { name: "Get visit-ready" })).toBeVisible();
    await noHorizontalOverflow(page);
  });

  test("axe: 0 serious with the sheet closed, open, the answer form and the invite box", async ({ page }) => {
    await gotoApp(page, "/tree");
    await a11y(page);
    await page.locator('button[aria-label^="Dad:"]').tap();
    await expect(page.locator('section[aria-label="Dad details"]')).toBeVisible();
    await a11y(page);
    await page.getByRole("button", { name: "Add what you know" }).click();
    await a11y(page);
    await gotoApp(page, "/tree?person=mgf&mode=invite");
    await expect(page.getByLabel("Invite message")).toBeVisible();
    await a11y(page);
    await noHorizontalOverflow(page);
  });
});
