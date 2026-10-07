// Contract for the relative flow: /invite, /reply, /connect/callback (owner after P1: P6).
// Transcribed from scratchpad e2e.cjs / e2e2.cjs / m3.js. Green against today's UI. P6 applies R3, R4, R5 (DESIGN §12.9) here.
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";
import {
  blockSandbox,
  expect,
  expectClean,
  gotoApp,
  instrumentContext,
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
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("radio", { name: "None of these" }).click();
    await m.getByRole("button", { name: "Next", exact: true }).click();

    // others step: today the relative labels are <b> (R3 turns them into <h3>)
    await expect(m.getByText(/^Dad \(Alex's father\)$/)).toBeVisible();
    await m.getByRole("button", { name: "Add what I know" }).first().click();
    await m.getByRole("checkbox", { name: /Heart attack or blocked arteries/ }).check();
    await m.getByPlaceholder("Age").first().fill("60");
    await m.getByRole("button", { name: "Save", exact: true }).click();
    await expect(m.getByRole("button", { name: "Change" }).first()).toBeVisible();
    await m.getByRole("button", { name: "Review and send" }).click();

    await expect(m.getByRole("button", { name: /Send to Alex/ })).toBeDisabled();
    await m.getByRole("checkbox", { name: /Share these answers with Alex/ }).check();
    await m.getByRole("button", { name: /Send to Alex/ }).click();
    await expect(m.locator("main")).toContainText(/Thank you/);
    await expect(m.locator("main")).not.toContainText(/Your answers are in/); // different device
    await expect(m.getByRole("button", { name: "Send my answers to Alex" })).toBeVisible();

    const reply = await readReplyLink(m);
    expect(reply).toMatch(/\/reply#/);
    await m.reload();
    await waitForApp(m);
    await expect(m.locator("main")).toContainText(/Thank you/);

    // the patient opens the reply link
    const r = await page.context().newPage();
    await gotoApp(r, reply);
    await r.getByRole("button", { name: "Add to my tree" }).click();
    await expect(r.locator("main")).toContainText(/Added \d+ answers? to your tree/);
    await expect(r.getByRole("link", { name: "Open my tree" })).toBeVisible();

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
  });

  test("decline: 'I'd rather not share' goes straight to review", async ({ page }) => {
    const url = await inviteUrlFor(page, /^Grandpa Luis:/, "Ask Grandpa Luis directly");
    const m = await rel.ctx.newPage();
    await gotoApp(m, url);
    await expect(m.getByRole("button", { name: "Start", exact: true })).toBeDisabled();
    await m.getByRole("checkbox", { name: /18 or older/ }).check();
    await m.getByRole("button", { name: "Start", exact: true }).click();
    await m.getByRole("radio", { name: /rather not share/ }).click();
    await m.getByRole("button", { name: "Next", exact: true }).click();
    await expect(m.getByRole("button", { name: /Send to Alex/ })).toBeVisible();
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
    await m.getByRole("button", { name: "Use a simulated record (sandbox offline)" }).click();
    await expect(m.locator("main")).toContainText("A record date is often when a problem was added");
    await expect(m.getByRole("textbox", { name: /^Age when .+ started$/ }).first()).toBeVisible();
    await expect(m.getByRole("button", { name: /^(Show|Hide) \d+ other conditions in the record$/ })).toBeVisible();
    await expect(m.getByRole("button", { name: "Answer myself instead" })).toBeVisible();
    // Today heart items are pre-ticked (R4 makes nothing pre-ticked; P6 ticks one here first).
    const share = m.getByRole("button", { name: /Share \d+ facts?/ });
    if (await share.isDisabled()) await m.getByRole("checkbox").first().check();
    await share.click();
    await expect(m.getByRole("button", { name: "Review and send" })).toBeVisible();
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
    await expect(m.getByRole("link", { name: /Open Alex.s tree/ })).toBeVisible();
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
