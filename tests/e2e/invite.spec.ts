// Contract for the relative flow: /invite, /reply, /connect/callback (owner: P6). DESIGN §12.6–12.7, §13.6.
// Transcribed from scratchpad e2e.cjs / e2e2.cjs / m3.js, with the §12.9 renames applied: R3 (others are <h3>), R4 (nothing
// pre-ticked; "Share {n} fact(s) with {asker}"), R5 ("Sent. Thank you, {name}.").
import fs from "node:fs";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Locator, type Page } from "@playwright/test";
import { HONESTY } from "../../src/content/site";
import {
  blockSandbox,
  expect,
  expectClean,
  expectNoSeriousA11y,
  gotoApp,
  instrumentContext,
  MOBILE,
  noHorizontalOverflow,
  RELATIVE_PHONE,
  SANDBOX_LAUNCH,
  test,
  waitForApp,
} from "./fixtures";

/** Patient asks someone directly; returns the invite URL from the "Invite message" box. */
async function inviteUrlFor(page: Page, node: RegExp, buttonName: string) {
  await gotoApp(page, "/tree");
  await page.getByRole("button", { name: node }).click();
  await page.getByRole("button", { name: buttonName }).click();
  const msg = await page.getByLabel("Invite message").inputValue();
  const url = msg.match(/https?:\/\/\S+/)?.[0];
  expect(url).toMatch(/\/invite#/);
  return url!;
}

async function relativeDevice(browser: Browser, baseURL: string | undefined) {
  const ctx = await browser.newContext(RELATIVE_PHONE);
  const report = await instrumentContext(ctx, baseURL);
  return { ctx, report };
}

async function readReplyLink(page: Page) {
  return page.evaluate(() => {
    const key = Object.keys(sessionStorage).find((k) => k.startsWith("fht:invite:"));
    return key ? (JSON.parse(sessionStorage.getItem(key) ?? "{}").link as string) : "";
  });
}

/** An invite link for Grandpa Luis from another device (no `d`), built like src/lib/share.ts buildInvite(). */
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

const h1 = (page: Page) => page.getByRole("heading", { level: 1 });

test.describe("relative flow (cross-device)", () => {
  let rel: { ctx: BrowserContext; report: Awaited<ReturnType<typeof instrumentContext>> };
  test.beforeEach(async ({ browser, baseURL }) => {
    rel = await relativeDevice(browser, baseURL);
  });
  test.afterEach(async () => {
    expectClean(rel.report);
    await rel.ctx.close();
  });

  test("Mom answers about herself and Dad; the patient imports the reply", async ({ page }) => {
    const url = await inviteUrlFor(page, /^Mom:/, "Ask Mom directly");

    const m = await rel.ctx.newPage();
    await gotoApp(m, url);
    await expect(h1(m)).toHaveText("Alex asked for your help.");
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("radio", { name: "None of these" }).click();
    await m.getByRole("button", { name: "Next", exact: true }).click();

    // others step: one <h3> per relative (R3)
    await expect(m.getByText(/^Dad \(Alex's father\)$/)).toBeVisible();
    expect(await m.getByRole("heading", { level: 3 }).allInnerTexts()).toEqual(["Dad (Alex's father)", "Grandpa Luis (your father)", "Grandma Rosa (your mother)"]);
    await m.getByRole("button", { name: "Add what I know" }).first().click();
    await m.getByRole("checkbox", { name: /Heart attack or blocked arteries/ }).check();
    await m.getByPlaceholder("Age").first().fill("60");
    await m.getByRole("button", { name: "Save", exact: true }).click();
    await expect(m.getByRole("button", { name: "Change" }).first()).toBeVisible();
    await m.getByRole("button", { name: "Review and send" }).click();

    // check answers: you first, then Dad, each with a Change link
    await expect(h1(m)).toHaveText("Here’s what Alex will see");
    await expect(m.getByRole("region", { name: "Mom (you)" })).toContainText("No heart history");
    await expect(m.getByRole("region", { name: "Dad (Alex's father)" })).toContainText("Heart attack or coronary artery disease, age 60");
    await expect(m.getByRole("button", { name: "Change answers about Dad (Alex's father)" })).toBeVisible();

    await expect(m.getByRole("button", { name: /Send to Alex/ })).toBeDisabled();
    await m.getByRole("checkbox", { name: /Share these answers with Alex/ }).check();
    await m.getByRole("button", { name: /Send to Alex/ }).click();
    await expect(m.locator("main")).toContainText(/Thank you/);
    await expect(h1(m)).toHaveText("Sent. Thank you, Mom.");
    await expect(m.locator("main")).not.toContainText(/Your answers are in/); // different device
    await expect(m.getByRole("button", { name: "Send my answers to Alex" })).toBeVisible();

    const reply = await readReplyLink(m);
    expect(reply).toMatch(/\/reply#/);
    await m.reload();
    await waitForApp(m);
    await expect(m.locator("main")).toContainText(/Thank you/);

    // the patient opens the reply link: who answered, what changes (read-only), then the import
    const r = await page.context().newPage();
    await gotoApp(r, reply);
    await expect(h1(r)).toHaveText("2 answers from Mom");
    const changes = r.getByRole("region", { name: "What changes in your tree" });
    await expect(changes.getByRole("heading", { level: 3, name: "Dad" })).toBeVisible();
    await expect(changes).toContainText("Reports disagree");
    await r.getByRole("button", { name: "Add to my tree" }).click();
    await expect(r.locator("main")).toContainText(/Added \d+ answers? to your tree/);
    await expect(r.getByRole("link", { name: "Open my tree" })).toHaveAttribute("href", "/tree?person=mom");

    await page.reload();
    await waitForApp(page);
    await page.getByRole("button", { name: /^Dad:/ }).click();
    await expect(page.locator('section[aria-label="Dad details"]')).toContainText("Mom");
  });

  test("a forged reply from someone who wasn't invited is blocked", async ({ page, baseURL }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("button", { name: /^Mom:/ }).click();
    await page.getByRole("button", { name: "Ask Mom directly" }).click(); // saves the tree in this browser
    const payload = {
      v: 1,
      t: "demo",
      p: "mgm",
      b: "X",
      at: "2026-01-01",
      reports: [{ personId: "dad", kind: "condition", condition: "Forged", source: "record", reportedBy: "X", reportedAt: "2026-01-01" }],
    };
    const forged = `${baseURL}/reply#${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
    await gotoApp(page, forged);
    await expect(page.locator("main")).toContainText(/haven.t invited/);
    await expect(page.getByRole("button", { name: "Add to my tree" })).toHaveCount(0);
  });

  test("decline: 'I'd rather not share' goes straight to review", async ({ page }) => {
    const url = await inviteUrlFor(page, /^Grandpa Luis:/, "Ask Grandpa Luis directly");
    const m = await rel.ctx.newPage();
    await gotoApp(m, url);
    await expect(m.getByRole("button", { name: "Start", exact: true })).toBeDisabled();
    await expect(m.getByText("Confirm you’re 18 or older to start.")).toBeVisible();
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("radio", { name: /rather not share/ }).click();
    await m.getByRole("button", { name: "Next", exact: true }).click();
    await expect(m.getByRole("button", { name: /Send to Alex/ })).toBeVisible();
    await expect(m.locator("main")).toContainText("Got it. Alex will see that you’d rather not share. Nothing else is sent.");
    await expect(m.getByRole("button", { name: "Start over" })).toBeVisible();
  });

  test("sandbox offline: Connect MyChart → Use a simulated record → share a fact", async ({ page }) => {
    await blockSandbox(rel.ctx);
    const url = await inviteUrlFor(page, /^Grandpa Luis:/, "Ask Grandpa Luis directly");
    const m = await rel.ctx.newPage();
    await gotoApp(m, url);
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("button", { name: "Connect MyChart" }).click();
    await expect(m.locator("main").getByRole("alert")).toContainText("Couldn’t reach the sandbox.");
    await m.getByRole("button", { name: "Use a simulated record (sandbox offline)" }).click();
    await expect(m.locator("main")).toContainText("A record date is often when a problem was added");
    await expect(m.locator("main")).toContainText("Simulated record (the sandbox is offline, so this is made-up data)");
    await expect(m.getByRole("button", { name: /^(Show|Hide) \d+ other conditions? in the record$/ })).toBeVisible();
    await expect(m.getByRole("button", { name: "Answer myself instead" })).toBeVisible();

    // R4: nothing is pre-ticked; the share button counts live and names the asker
    const boxes = m.getByRole("checkbox");
    for (const box of await boxes.all()) await expect(box).not.toBeChecked();
    await expect(m.getByRole("button", { name: "Share 0 facts with Alex" })).toBeDisabled();
    await expect(m.getByText("Tick what you want to share.")).toBeVisible();
    await m.getByRole("checkbox", { name: /^Atrial fibrillation/ }).check();
    const age = m.getByRole("textbox", { name: /^Age when .+ started$/ }).first();
    await expect(age).toBeVisible();
    await expect(age).toHaveValue("34");
    await m.getByRole("button", { name: /Share \d+ facts?/ }).click();
    await expect(m.getByRole("button", { name: "Review and send" })).toBeVisible();
    await m.getByRole("button", { name: "Review and send" }).click();
    const you = m.getByRole("region", { name: "Grandpa Luis (you)" });
    await expect(you).toContainText("Atrial fibrillation, age 34");
    await expect(you).toContainText(/Simulated record \(made-up\)/i);
    await expect(m.locator("main")).not.toContainText(/verified/i);
  });
});

test.describe("relative flow (same browser)", () => {
  test("Preview as Grandpa Luis opens the flow in a new tab; answers land in the patient's tree", async ({ page, context }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("button", { name: /^Grandpa Luis:/ }).click();
    await page.getByRole("button", { name: "Ask Grandpa Luis directly" }).click();
    const [m] = await Promise.all([context.waitForEvent("page"), page.getByRole("link", { name: "Preview as Grandpa Luis" }).click()]);
    await waitForApp(m);
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("checkbox", { name: /Heart attack or blocked arteries/ }).check();
    await m.getByPlaceholder("Age").first().fill("70");
    await m.getByRole("button", { name: "Next", exact: true }).click();
    await m.getByRole("button", { name: "Review and send" }).click();
    await m.getByRole("checkbox", { name: /Share these answers with Alex/ }).check();
    await m.getByRole("button", { name: /Send to Alex/ }).click();
    await expect(m.locator("main")).toContainText(/Thank you/);
    await expect(m.locator("main")).toContainText(/Your answers are in Alex.s tree/);
    await expect(m.getByRole("link", { name: /Open Alex.s tree/ })).toHaveAttribute("href", "/tree?person=mgf");
  });
});

test.describe("the phone flow: Back, Change, copy", () => {
  test.use(MOBILE);

  test("Back works on every step and never loses answers; Change on check-answers returns to review", async ({ page }) => {
    await gotoApp(page, luisInvite());
    const back = page.getByRole("button", { name: "Back", exact: true });
    await expect(back).toHaveCount(0); // hidden on welcome
    await page.getByRole("checkbox", { name: /18 or older/ }).check();
    await page.getByRole("button", { name: "Start", exact: true }).click();

    await expect(h1(page)).toHaveText("About you");
    await expect(page.getByText("Step 1 of 4")).toBeVisible();
    await page.getByRole("checkbox", { name: /Heart attack or blocked arteries/ }).check();
    await page.getByPlaceholder("Age").first().fill("70");
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await expect(page.getByText("Step 3 of 4")).toBeVisible();
    await page.getByRole("button", { name: "Add what I know about Mom" }).click();
    await page.getByRole("radio", { name: "None of these" }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: "Review and send" }).click();

    await expect(page.getByText("Step 4 of 4")).toBeVisible();
    await expect(page.getByRole("region", { name: "Grandpa Luis (you)" })).toContainText("Heart attack or coronary artery disease, age 70");
    await expect(page.getByRole("region", { name: "Mom (your child)" })).toContainText("No heart history");

    // Back, step by step, to the welcome: nothing is lost on the way
    await back.click();
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: "Mom (your child)" })).toContainText("No heart history");
    await back.click();
    await expect(h1(page)).toHaveText("About you");
    await expect(page.locator("main")).toContainText("Your answer so far: Heart attack or coronary artery disease, age 70");
    await back.click();
    await expect(h1(page)).toHaveText("Alex asked for your help.");
    await expect(page.getByRole("checkbox", { name: /18 or older/ })).toBeChecked();

    // forward again without retyping
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.getByRole("button", { name: "Keep it and continue" }).click();
    await page.getByRole("button", { name: "Review and send" }).click();
    await expect(page.getByRole("region", { name: "Grandpa Luis (you)" })).toContainText("age 70");
    await expect(page.getByRole("region", { name: "Mom (your child)" })).toContainText("No heart history");

    // GOV.UK "Change": opens Mom's answers, and saving returns straight to check-answers
    await page.getByRole("button", { name: "Change answers about Mom (your child)" }).click();
    await expect(page.getByText("Step 3 of 4")).toBeVisible();
    await page.getByRole("radio", { name: /I don.t know/ }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Step 4 of 4")).toBeVisible();
    await expect(page.getByRole("region", { name: "Mom (your child)" })).toContainText("Doesn’t know");

    // the step's heading gets focus after a step change (screen readers start at the new question)
    await expect(h1(page)).toBeFocused();
  });

  test("the welcome names the visit without a time estimate (AMENDMENTS A2)", async ({ page }) => {
    await gotoApp(page, luisInvite());
    const main = page.locator("main");
    await expect(main).toContainText(
      "Alex is getting ready for a cardiology visit and is asking about the family’s heart health. A few questions about you and a few relatives. Skip anything.",
    );
    await expect(main).toContainText("Who sees it: Alex, and Alex’s cardiology team if Alex shares the summary.");
    await expect(main).not.toContainText(/minute/i);
    await page.getByText("See the questions").click();
    await expect(main.getByRole("listitem").filter({ hasText: "Very high cholesterol" })).toBeVisible();
  });
});

// The sticky CTA, 44 px targets and no sideways scroll, on every step the flow owns, at two phone sizes (DESIGN §13.6 #2).
for (const viewport of [
  { width: 390, height: 844 },
  { width: 360, height: 740 },
]) {
  test.describe(`phone layout at ${viewport.width}×${viewport.height}`, () => {
    test.use({ ...MOBILE, viewport });

    test("every step's primary action is on screen without scrolling; targets ≥ 44 px; no overflow; axe clean", async ({ page }) => {
      const check = async (cta: Locator) => {
        await page.evaluate(() => window.scrollTo(0, 0));
        await expect(cta).toBeInViewport({ ratio: 1 });
        await noHorizontalOverflow(page);
        const small = await page.locator("main").evaluate((main) =>
          [...main.querySelectorAll<HTMLElement>("button, a[href], input:not([type=hidden]), summary")]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              return r.width > 2 && r.height > 2 && getComputedStyle(el).visibility !== "hidden";
            })
            .filter((el) => el.getBoundingClientRect().height < 43.5)
            .map((el) => `${el.tagName} "${el.textContent?.trim().slice(0, 40)}" ${Math.round(el.getBoundingClientRect().height)}px`),
        );
        expect(small, "tap targets under 44 px").toEqual([]);
        await expectNoSeriousA11y(page);
      };

      await gotoApp(page, luisInvite());
      await check(page.getByRole("button", { name: "Start", exact: true }));
      await page.getByRole("checkbox", { name: /18 or older/ }).check();
      await page.getByRole("button", { name: "Start", exact: true }).click();

      await expect(h1(page)).toHaveText("About you");
      await noHorizontalOverflow(page);
      await page.getByRole("button", { name: "Use a simulated record (sandbox offline)" }).click();
      await page.getByRole("checkbox", { name: /^Atrial fibrillation/ }).check();
      await check(page.getByRole("button", { name: "Share 1 fact with Alex" }));
      await page.getByRole("button", { name: "Share 1 fact with Alex" }).click();

      await check(page.getByRole("button", { name: "Review and send" }));
      await page.getByRole("button", { name: "Review and send" }).click();

      await check(page.getByRole("button", { name: "Send to Alex" }));
      await page.getByRole("checkbox", { name: /Share these answers with Alex/ }).check();
      await page.getByRole("button", { name: "Send to Alex" }).click();

      await expect(h1(page)).toHaveText("Sent. Thank you, Grandpa Luis.");
      await check(page.getByRole("button", { name: "Send my answers to Alex" }));
    });
  });
}

// The self step's answer form (P5's AnswerForm with `variant="page"` and `stickyActions`, DESIGN §11.4) sits under the
// portal card. Once the form is on screen, its Next stays pinned to the bottom of the viewport while the rest of the long
// form is still below the fold.
test.describe("phone layout: the self step", () => {
  test.use(MOBILE);
  test("the answer form's Next sticks to the bottom of the screen", async ({ page }) => {
    await gotoApp(page, luisInvite());
    await page.getByRole("checkbox", { name: /18 or older/ }).check();
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await page.getByRole("heading", { name: "Or answer yourself" }).evaluate((el) => el.scrollIntoView({ block: "start" }));
    const formBottom = await page.locator("main form").first().evaluate((f) => f.getBoundingClientRect().bottom);
    expect(formBottom, "the form runs past the fold").toBeGreaterThan(MOBILE.viewport.height);
    await expect(page.getByRole("button", { name: "Next", exact: true })).toBeInViewport({ ratio: 1 });
  });
});

test.describe("step transitions", () => {
  /** Counts view-transition animations that run during the next ~700 ms (sampled every frame). */
  async function sampleViewTransitions(page: Page) {
    await page.evaluate(() => {
      const w = window as unknown as { __vt?: Promise<number> };
      w.__vt = new Promise((resolve) => {
        let max = 0;
        const start = performance.now();
        const tick = () => {
          const running = document
            .getAnimations()
            .filter((a) => a.playState === "running" && ((a.effect as KeyframeEffect | null)?.pseudoElement ?? "").startsWith("::view-transition"));
          max = Math.max(max, running.length);
          if (performance.now() - start < 700) requestAnimationFrame(tick);
          else resolve(max);
        };
        requestAnimationFrame(tick);
      });
    });
  }
  const sampled = (page: Page) => page.evaluate(() => (window as unknown as { __vt: Promise<number> }).__vt);

  test("slide between steps (x 24 px + fade)", async ({ page }) => {
    await gotoApp(page, luisInvite());
    await page.getByRole("checkbox", { name: /18 or older/ }).check();
    await sampleViewTransitions(page);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(h1(page)).toHaveText("About you");
    expect(await sampled(page)).toBeGreaterThan(0);
  });

  test.describe("reduced motion", () => {
    test.use({ contextOptions: { reducedMotion: "reduce" } });
    test("step changes are instant", async ({ page }) => {
      await gotoApp(page, luisInvite());
      await page.getByRole("checkbox", { name: /18 or older/ }).check();
      await sampleViewTransitions(page);
      await page.getByRole("button", { name: "Start", exact: true }).click();
      await expect(h1(page)).toHaveText("About you");
      expect(await sampled(page)).toBe(0);
    });
  });
});

test.describe("accessibility (axe) on every screen", () => {
  test("invite steps at 1440 px: welcome, self, portal, others (+ form), review, sent", async ({ page }) => {
    await gotoApp(page, luisInvite());
    await expectNoSeriousA11y(page);
    await page.getByText("See the questions").click();
    await page.getByRole("checkbox", { name: /18 or older/ }).check();
    await expectNoSeriousA11y(page);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(h1(page)).toHaveText("About you");
    await expectNoSeriousA11y(page);
    await page.getByRole("button", { name: "Use a simulated record (sandbox offline)" }).click();
    await page.getByRole("checkbox", { name: /^Atrial fibrillation/ }).check();
    await expectNoSeriousA11y(page);
    await page.getByRole("button", { name: /Share 1 fact/ }).click();
    await expectNoSeriousA11y(page);
    await page.getByRole("button", { name: "Add what I know about Mom" }).click();
    await expectNoSeriousA11y(page);
    await page.getByRole("radio", { name: "None of these" }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.getByRole("button", { name: "Review and send" }).click();
    await expectNoSeriousA11y(page);
    await page.getByRole("checkbox", { name: /Share these answers with Alex/ }).check();
    await page.getByRole("button", { name: "Send to Alex" }).click();
    await expect(page.locator("main")).toContainText("Thank you");
    await expectNoSeriousA11y(page);
  });

  test("/connect/callback: error and loading states", async ({ page, context }) => {
    await gotoApp(page, "/connect/callback");
    await expect(page.getByRole("heading", { name: "Couldn’t connect" })).toBeVisible();
    await expectNoSeriousA11y(page);

    // Loading: hold back the lazy fhirclient chunk so the exchange never finishes.
    const p = await context.newPage();
    await p.route("**/_next/static/chunks/**", async (route) => {
      const res = await route.fetch();
      const body = await res.text();
      if (body.includes("No state found")) return; // never answered
      await route.fulfill({ response: res, body });
    });
    await gotoApp(p, "/connect/callback");
    await expect(p.getByRole("heading", { name: "Reading your record from the sandbox…" })).toBeVisible();
    await expect(p.locator("main")).toContainText("Nothing is saved yet.");
    await expectNoSeriousA11y(p);
  });

  test("/reply: success and both guard states", async ({ page, baseURL }) => {
    await gotoApp(page, "/tree");
    await page.getByRole("button", { name: /^Mom:/ }).click();
    await page.getByRole("button", { name: "Ask Mom directly" }).click();
    const reply = (over: Record<string, unknown>) =>
      `${baseURL}/reply#${Buffer.from(
        JSON.stringify({
          v: 1,
          t: "demo",
          p: "mom",
          b: "Mom",
          at: "2026-10-01T12:00:00Z",
          reports: [{ personId: "mgf", kind: "condition", condition: "Atrial fibrillation", ageAtOnset: 66, source: "relative", reportedBy: "Mom", reportedAt: "2026-10-01T12:00:00Z" }],
          ...over,
        }),
      ).toString("base64url")}`;

    await gotoApp(page, reply({}));
    await expect(page.getByRole("region", { name: "What changes in your tree" })).toContainText("Before: Not asked yet. After: Known, Atrial fibrillation, age 66.");
    await expectNoSeriousA11y(page);
    await page.getByRole("button", { name: "Add to my tree" }).click();
    await expect(page.locator("main")).toContainText("Added 1 answer to your tree");
    await expectNoSeriousA11y(page);

    await gotoApp(page, reply({ p: "pgf" }));
    await expect(page.locator("main")).toContainText(/haven.t invited/);
    await expectNoSeriousA11y(page);

    await gotoApp(page, reply({ t: "someone-else" }));
    await expect(page.locator("main")).toContainText("different tree");
    await expectNoSeriousA11y(page);
  });
});

test.describe("callback and incomplete links", () => {
  test("/connect/callback without an OAuth state shows 'Couldn't connect' and Go back", async ({ page }) => {
    await gotoApp(page, "/connect/callback");
    await expect(page.getByRole("heading", { name: "Couldn’t connect" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Go back" })).toBeVisible();
  });

  test("/invite and /reply without a payload explain the link is incomplete", async ({ page }) => {
    await gotoApp(page, "/invite");
    await expect(page.locator("main")).toContainText(/link doesn.t look complete/);
    await gotoApp(page, "/reply");
    await expect(page.locator("main")).toContainText(/link is incomplete/);
  });

  // DESIGN §13.6 #6: the minimal Lockup + HonestyRibbon header in every state, one main#main.
  for (const route of ["/invite", "/connect/callback"]) {
    test(`${route} without a payload keeps the honesty ribbon in <header>`, async ({ page }) => {
      await gotoApp(page, route);
      await expect(page.locator("header [role=note]")).toContainText(HONESTY.ribbon);
      await expect(page.getByRole("link", { name: "Family Health Tree home" })).toBeVisible();
      await expect(page.locator("main#main")).toHaveCount(1);
    });
  }
});

test("ConnectCallback and ReplyImport carry no inline styles (DESIGN §13.6 #5)", () => {
  for (const file of ["ConnectCallback.tsx", "ReplyImport.tsx"]) {
    const src = fs.readFileSync(path.resolve(__dirname, "../../src/components", file), "utf8");
    expect(src, file).not.toMatch(/style=\{/);
  }
});

test.describe("public SMART sandbox @sandbox", () => {
  test.setTimeout(120_000);

  // Runs only with E2E_SANDBOX=1 (needs the internet). Its own Chromium goes through the HTTPS proxy; localhost stays direct.
  test("Connect MyChart → sandbox consent → Pick what to share → back on /invite", async ({ baseURL }) => {
    const browser = await chromium.launch(SANDBOX_LAUNCH);
    try {
      const patient = await browser.newContext();
      const patientReport = await instrumentContext(patient, baseURL);
      const page = await patient.newPage();
      const url = await inviteUrlFor(page, /^Grandpa Luis:/, "Ask Grandpa Luis directly");
      const { ctx, report } = await relativeDevice(browser, baseURL);
      const m = await ctx.newPage();
      await gotoApp(m, url);
      await m.getByRole("checkbox", { name: /18 or older/ }).check();
      await m.getByRole("button", { name: "Start", exact: true }).click();
      await m.getByRole("button", { name: "Connect MyChart" }).click();
      const local = new URL(baseURL!).origin;
      await m.waitForURL((u) => u.origin !== local, { timeout: 45_000 }); // left for the sandbox
      for (let i = 0; i < 3 && /smarthealthit/.test(m.url()); i++) {
        const approve = m.getByRole("button", { name: /Approve|Authorize|Allow|Continue|Launch/i }).first();
        if (!(await approve.count())) break;
        await approve.click();
        await m.waitForTimeout(2000);
      }
      await m.waitForURL((u) => u.origin === local && u.pathname === "/invite", { timeout: 60_000 });
      await waitForApp(m);
      await expect(m.getByRole("button", { name: /Share \d+ facts?/ })).toBeVisible();
      expectClean(report);
      expectClean(patientReport);
    } finally {
      await browser.close();
    }
  });
});
