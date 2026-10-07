// P1: app chrome, site chrome, skip link and present mode (DESIGN §13.1 acceptance 5 and 7).
import { HONESTY } from "../../src/content/site";
import { axe, DESKTOP, expect, gotoApp, MOBILE, noHorizontalOverflow, pdfPageCount, ROUTES, test } from "./fixtures";

const APP_ROUTES = ["/tree", "/summary"] as const;
const MAIN_LINKS = ["Tree", "Pre-visit summary", "How it works"] as const;

for (const [label, device] of [
  ["1440", DESKTOP],
  ["390", MOBILE],
] as const) {
  test.describe(`AppShell at ${label} px`, () => {
    test.use(device);

    for (const route of APP_ROUTES) {
      test(`${route}: one "Main" navigation with Tree, Pre-visit summary, How it works`, async ({ page }) => {
        await gotoApp(page, route);
        const nav = page.getByRole("navigation", { name: "Main", exact: true });
        await expect(nav).toHaveCount(1);
        for (const name of MAIN_LINKS) await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
        await expect(nav.getByRole("link", { name: route === "/tree" ? "Tree" : "Pre-visit summary", exact: true })).toHaveAttribute("aria-current", "page");
      });

      test(`${route}: honesty ribbon is inside <header>; axe "region" passes`, async ({ page }) => {
        await gotoApp(page, route);
        const ribbon = page.locator('header[data-shell="app"] [role="note"]');
        await expect(ribbon).toBeVisible();
        await expect(ribbon).toContainText("Prototype with a made-up demo family. Please don't enter real health information.");
        const { all } = await axe(page, { rules: ["region"] });
        expect(all, all.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`).join("\n")).toEqual([]);
      });
    }

    test("no horizontal overflow on /tree and /summary", async ({ page }) => {
      for (const route of APP_ROUTES) {
        await gotoApp(page, route);
        await noHorizontalOverflow(page);
      }
    });
  });
}

test.describe("AppShell on phones", () => {
  test.use(MOBILE);
  test("the Main nav is a bottom tab bar with visible labels; Summary is named Pre-visit summary", async ({ page }) => {
    await gotoApp(page, "/tree");
    const nav = page.getByRole("navigation", { name: "Main", exact: true });
    const box = await nav.boundingBox();
    expect(box).not.toBeNull();
    expect(Math.round(box!.y + box!.height)).toBeGreaterThanOrEqual(844 - 1);
    expect(await nav.getByRole("link", { name: "Pre-visit summary" }).innerText()).toBe("Summary");
  });
});

test.describe("AppShell role menu", () => {
  test("opens, lists the demo's points of view, and closes with Esc back to the trigger", async ({ page }) => {
    await gotoApp(page, "/tree");
    const trigger = page.getByRole("button", { name: "Viewing as Alex (patient)" });
    await trigger.click();
    const menu = page.getByRole("group", { name: "Switch the demo's point of view" });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link", { name: "Patient · family tree" })).toHaveAttribute("href", "/tree");
    await expect(menu.getByRole("link", { name: "Patient · pre-visit summary" })).toHaveAttribute("href", "/summary");
    await expect(menu.getByRole("link", { name: "Relative · Grandpa Luis's invite" })).toHaveAttribute("href", "/tree?person=mgf&mode=invite");
    await expect(menu.getByRole("link", { name: "Practice · care-team view" })).toHaveAttribute("href", "/practice");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe("SiteNav", () => {
  test("doesn't wrap at 375 px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await gotoApp(page, "/");
    const nav = page.locator('header[data-shell="site"]').getByRole("navigation", { name: "Main", exact: true });
    const box = await nav.boundingBox();
    expect(box!.height).toBeLessThanOrEqual(56);
    const fits = await nav.evaluate((el) => el.scrollWidth <= el.clientWidth + 1);
    expect(fits).toBe(true);
    await expect(nav.getByRole("link", { name: "Synthetic demo: made-up family, no real health data" })).toBeVisible();
    await expect(nav.getByRole("button", { name: "Menu" })).toBeVisible();
    await noHorizontalOverflow(page);
  });

  test("desktop links, CTA and the honesty chip", async ({ page }) => {
    await gotoApp(page, "/how-it-works");
    const nav = page.locator('header[data-shell="site"]').getByRole("navigation", { name: "Main", exact: true });
    for (const name of ["How it works", "For practices", "Privacy", "Research"]) await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "How it works", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: "Try the demo family" })).toHaveAttribute("href", "/tree");
    await expect(nav.getByRole("link", { name: "Synthetic demo: made-up family, no real health data" })).toBeVisible();
  });

  test("turns into night glass over a night band (including one added later), and back", async ({ page }) => {
    await gotoApp(page, "/");
    const header = page.locator('header[data-shell="site"]');
    await expect(header).toHaveAttribute("data-theme", "paper");
    // A tall night band, inserted after load like a client island would (the nav must notice it).
    await page.evaluate(() => {
      const band = document.createElement("section");
      band.setAttribute("data-theme", "night");
      band.setAttribute("data-nav-theme", "night");
      band.id = "test-night-band";
      band.style.height = "150vh";
      document.querySelector("main")!.append(band);
    });
    const scrollIntoBand = () =>
      page.evaluate(() => {
        const band = document.getElementById("test-night-band")!;
        window.scrollTo(0, band.getBoundingClientRect().top + window.scrollY + 40);
      });
    await scrollIntoBand();
    await expect(header).toHaveAttribute("data-theme", "night");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).toHaveAttribute("data-theme", "paper");
    // A band that flips its own data-nav-theme (the hero does this while expanded) is followed too.
    await page.evaluate(() => document.getElementById("test-night-band")!.setAttribute("data-nav-theme", "paper"));
    await scrollIntoBand();
    await page.waitForTimeout(200);
    await expect(header).toHaveAttribute("data-theme", "paper");
    await page.evaluate(() => document.getElementById("test-night-band")!.setAttribute("data-nav-theme", "night"));
    await expect(header).toHaveAttribute("data-theme", "night");
  });

  test("phone menu opens a sheet with every link and closes with Esc", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoApp(page, "/");
    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    for (const name of ["How it works", "For practices", "Privacy", "Research", "Pilot"]) await expect(sheet.getByRole("link", { name, exact: true })).toBeVisible();
    await expect(sheet.getByRole("link", { name: "Try the demo family" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(menuButton).toBeFocused();
  });

  test("footer carries the legal line and the team line", async ({ page }) => {
    await gotoApp(page, "/");
    const footer = page.locator('footer[data-shell="footer"]');
    await expect(footer).toContainText("Not a medical device. Doesn't diagnose or score risk. Synthetic demo data only; please don't enter real health information.");
    await expect(footer).toContainText("Team 709 (Raj Kashikar, Viha Srinivas, Unser Jaffry) · Product Studio · New York City");
    await expect(footer.getByRole("link", { name: "Care-team view" })).toHaveAttribute("href", "/practice");
  });
});

test.describe("Skip link", () => {
  for (const route of ["/", "/tree", "/design-system"]) {
    test(`${route}: first Tab reaches "Skip to content", Enter focuses main`, async ({ page }) => {
      await gotoApp(page, route);
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: "Skip to content" });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect.poll(() => page.evaluate(() => document.activeElement?.tagName)).toBe("MAIN");
      await expect(page.locator("main")).toHaveCount(1);
    });
  }
});

test.describe("Present mode", () => {
  test("?present sets html[data-present] before first paint, survives navigation, and ?present=0 clears it", async ({ page }) => {
    // Record whether the attribute was already there when <body> was inserted (that precedes first paint).
    await page.addInitScript(() => {
      const w = window as unknown as { __presentAtBody?: boolean };
      const mo = new MutationObserver(() => {
        if (document.body && w.__presentAtBody === undefined) {
          w.__presentAtBody = document.documentElement.hasAttribute("data-present");
          mo.disconnect();
        }
      });
      mo.observe(document, { childList: true, subtree: true });
    });
    await gotoApp(page, "/?present");
    expect(await page.evaluate(() => (window as unknown as { __presentAtBody?: boolean }).__presentAtBody)).toBe(true);
    await gotoApp(page, "/tree");
    await expect(page.locator("html")).toHaveAttribute("data-present", "");
    await gotoApp(page, "/tree?present=0");
    await expect(page.locator("html")).not.toHaveAttribute("data-present", "");
  });

  test("Shift+P toggles it (but not while typing)", async ({ page }) => {
    await gotoApp(page, "/tree");
    const html = page.locator("html");
    await expect(html).not.toHaveAttribute("data-present", "");
    await page.keyboard.press("Shift+P");
    await expect(html).toHaveAttribute("data-present", "");
    expect(await page.evaluate(() => sessionStorage.getItem("fht:present"))).toBe("1");
    await page.getByRole("button", { name: "Start my own tree" }).click();
    await page.getByRole("textbox", { name: "Your first name" }).press("Shift+P");
    await expect(html).toHaveAttribute("data-present", "");
    await page.getByRole("textbox", { name: "Your first name" }).blur();
    await page.keyboard.press("Shift+P");
    await expect(html).not.toHaveAttribute("data-present", "");
    expect(await page.evaluate(() => sessionStorage.getItem("fht:present"))).toBeNull();
  });
});

test.describe("Placeholder routes (P1 → P4)", () => {
  test("every SiteNav, menu and footer link resolves, and the in-page targets exist", async ({ page }) => {
    await gotoApp(page, "/");
    const hrefs = await page.locator('header[data-shell="site"] a[href^="/"], footer[data-shell="footer"] a[href^="/"]').evaluateAll((as) => [
      ...new Set(as.map((a) => (a as HTMLAnchorElement).getAttribute("href")!.split("#")[0])),
    ]);
    for (const href of [...hrefs, "/pilot", "/for-practices", "/privacy"]) {
      const res = await page.request.get(href);
      expect(res.status(), href).toBe(200);
    }
    await gotoApp(page, "/privacy");
    await expect(page.locator("#prototype")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Security & privacy");
    await gotoApp(page, "/pilot");
    await expect(page.locator("#contact")).toBeVisible();
    await gotoApp(page, "/for-practices");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  });

  test("the /pilot placeholder prints on one Letter page (DESIGN §14)", async ({ page }) => {
    await page.setViewportSize({ width: 1360, height: 900 });
    await gotoApp(page, "/pilot");
    expect(pdfPageCount(await page.pdf({ format: "Letter", printBackground: true }))).toBe(1);
  });
});

test.describe("404 page", () => {
  test.use({ allowHttpErrors: [/\/no-such-page/] });
  test("is branded: honesty ribbon in <header>, one <main id=main>, a way home", async ({ page }) => {
    const res = await page.goto("/no-such-page");
    expect(res?.status()).toBe(404);
    await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
    await expect(page.locator("header [role=note]")).toContainText(HONESTY.ribbon);
    await expect(page.locator("main#main")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1, name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to the start" })).toHaveAttribute("href", "/");
    await expect(page).toHaveTitle(/Page not found/);
  });
});

// Hard rule 3 (DESIGN §5.3): a visible synthetic-demo notice on every route — the app ribbon (role="note") or the
// marketing nav chip. Payload-less /invite, /connect/callback and /view render the minimal Lockup + HonestyRibbon header.
test.describe("Honesty notice on every route", () => {
  test.use({ allowHttpErrors: [/\/no-such-page/] });
  for (const route of [...ROUTES, "/no-such-page"]) {
    test(`${route} shows the synthetic-demo notice`, async ({ page }) => {
      test.info().annotations.push({ type: "route", description: route });
      await page.goto(route);
      await page.locator("html[data-hydrated]").waitFor({ state: "attached" });
      const notice = page.locator('[role="note"]').or(page.getByRole("link", { name: HONESTY.navChipLabel }));
      await expect(notice.first()).toBeVisible();
    });
  }
});

test.describe("Toasts are visible, not only announced", () => {
  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    test(`with reducedMotion: ${reducedMotion}`, async ({ browser, baseURL }) => {
      const context = await browser.newContext({ baseURL, reducedMotion, viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      await gotoApp(page, "/design-system");
      await page.getByRole("button", { name: "Toast", exact: true }).first().click();
      const item = page.getByRole("status").getByRole("listitem").first();
      await expect(item).toBeVisible();
      await expect(item).toContainText("Copied");
      await expect.poll(() => item.evaluate((el) => getComputedStyle(el).opacity), { timeout: 2_000 }).toBe("1");
      await expect.poll(() => item.evaluate((el) => getComputedStyle(el).transform), { timeout: 2_000 }).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
      await context.close();
    });
  }
});

test.describe("/design-system never scrolls sideways", () => {
  for (const width of [320, 375, 768, 1024, 1280, 1440]) {
    test(`at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoApp(page, "/design-system");
      await noHorizontalOverflow(page);
    });
  }
});

// FlowDiagram (SVG layout from 1280 px): no edge label is covered by a node ("YOU REVIEW" used to tuck under the summary).
test.describe("FlowDiagram edge labels are never covered by a node", () => {
  for (const [path, width] of [
    ["/design-system", 1280],
    ["/design-system", 1440],
    ["/how-it-works", 1280],
    ["/how-it-works", 1440],
    ["/", 1440],
  ] as const) {
    test(`${path} at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoApp(page, path);
      const fig = page.locator("figure:has(svg) [data-flow-edge-label]").first();
      await fig.scrollIntoViewIfNeeded();
      const overlaps = await page.evaluate(() => {
        const out: string[] = [];
        for (const label of document.querySelectorAll<HTMLElement>("[data-flow-edge-label]")) {
          const l = label.getBoundingClientRect();
          if (!l.width) continue;
          const scope = label.closest("figure") ?? document;
          for (const node of scope.querySelectorAll<HTMLElement>("[data-flow-node]")) {
            const n = node.getBoundingClientRect();
            const x = Math.min(l.right, n.right) - Math.max(l.left, n.left);
            const y = Math.min(l.bottom, n.bottom) - Math.max(l.top, n.top);
            if (x > 1 && y > 1) out.push(`${label.textContent?.trim()} under ${node.textContent?.trim().slice(0, 24)} (${Math.round(x)}px)`);
          }
        }
        return out;
      });
      expect(overlaps).toEqual([]);
    });
  }
});
