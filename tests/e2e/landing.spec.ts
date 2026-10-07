// Contract for "/" (owner: P3; DESIGN §8 and §13.3, AMENDMENTS A1).
// Runs against `next start` (production CSP). The embedded SummaryDocuments (P7) render with headingLevel={3}, so their
// headings sit inside the page outline (title h3 under the section's h2, then h4/h5).
import { FAQ, HONESTY, INTERVIEWS, PROTOTYPE_VS_PILOT, STATS } from "../../src/content/site";
import {
  DESKTOP,
  expect,
  expectNoSeriousA11y,
  gotoApp,
  instrumentContext,
  expectClean,
  MOBILE,
  noHorizontalOverflow,
  scrollThrough,
  storedTree,
  test,
} from "./fixtures";
import type { Page } from "@playwright/test";

const DOC = 'article[aria-label="Pre-visit family history summary"]';

const H1 = "Turn “heart problems run in the family” into who, what, and at what age.";
// §8 order (§8.11 "What we heard" and the hero's chapter list carry visually hidden h2s).
const H2S = [
  "How it works, in four chapters", // the hero's chapter cards (sr-only h2 over their h3s)
  "“It runs in the family” is where most family histories stop.",
  "This is the real app. Go ahead, click Dad.",
  "Guided questions, not a blank box.",
  "Every answer keeps its receipt.",
  "Grandpa answers from his phone. No app, no account.",
  "A paper trail, not a data trail.",
  "You see facts and questions. Your cardiologist sees the criteria.",
  "Family history that arrives before the patient does.",
  "What we heard",
  "Straight answers.",
  "Walk in knowing who, what, and at what age.",
];

/** Every heading in main (the embedded summary documents included), as [level, text]. */
async function outline(page: Page) {
  return page.locator("main").evaluate((main) => {
    return (
      [...main.querySelectorAll("h1, h2, h3, h4, h5, h6")]
        // TextReveal headings carry one sr-only sentence plus aria-hidden word spans: read the sentence
        .map((h) => [Number(h.tagName[1]), ((h.querySelector(":scope > .sr-only") ?? h).textContent ?? "").replace(/\s+/g, " ").trim()] as [number, string])
    );
  });
}

test.describe("structure", () => {
  test("one main, one h1 with the headline, the demo CTA and the title", async ({ page }) => {
    await gotoApp(page, "/");
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("main#main")).toHaveCount(1);
    const h1s = (await outline(page)).filter(([l]) => l === 1);
    expect(h1s).toEqual([[1, H1]]);
    await expect(page.locator("h1#hero-title")).toBeVisible();
    await expect(page.getByRole("link", { name: /Try the demo family/ }).first()).toHaveAttribute("href", "/tree");
    await expect(page).toHaveTitle("Family Health Tree");
  });

  test("the h2s follow DESIGN §8, every section is labelled, and no heading level is skipped", async ({ page }) => {
    await gotoApp(page, "/");
    const heads = await outline(page);
    expect(heads.filter(([l]) => l === 2).map(([, t]) => t)).toEqual(H2S);
    // the two-readers sheet's document is titled at h3 under its section (SummaryDocument headingLevel={3})
    expect(heads).toContainEqual([3, "Alex"]);
    for (let i = 1; i < heads.length; i++) expect(heads[i][0] - heads[i - 1][0], `after "${heads[i - 1][1]}"`).toBeLessThanOrEqual(1);
    const unlabelled = await page
      .locator("main > section")
      .evaluateAll((els) =>
        els
          .filter((s) => !s.getAttribute("aria-labelledby") || !document.getElementById(s.getAttribute("aria-labelledby")!))
          .map((s) => s.outerHTML.slice(0, 80)),
      );
    expect(unlabelled).toEqual([]);
  });

  test("exactly one <blockquote>, and it is the verbatim interview quote", async ({ page }) => {
    await gotoApp(page, "/");
    await expect(page.locator("blockquote")).toHaveCount(1);
    await expect(page.locator("blockquote")).toHaveText(INTERVIEWS.quote.text);
  });

  test("care-team links go to /practice (AMENDMENTS A1); the hero's second CTA lands on #two-readers", async ({ page }) => {
    await gotoApp(page, "/");
    await expect(page.locator('a[href*="view=care-team"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See the care-team view" })).toHaveAttribute("href", "/practice");
    await expect(page.getByRole("button", { name: "Practice view" })).toBeVisible();
    await expect(page.getByRole("link", { name: "See what your cardiologist gets" })).toHaveAttribute("href", "#two-readers");
    await expect(page.locator("section#two-readers")).toHaveCount(1);
  });
});

test.describe("honesty", () => {
  test("hero pill, nav chip and footer legal line are present", async ({ page }) => {
    await gotoApp(page, "/");
    await expect(page.getByRole("link", { name: HONESTY.heroPill })).toBeVisible();
    await expect(page.getByRole("link", { name: HONESTY.navChipLabel })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(HONESTY.footer);
    await expect(page.getByText(HONESTY.windowBadge).first()).toBeVisible();
  });

  test("the rendered page makes no banned claims (both readers of the sheet included)", async ({ page }) => {
    await gotoApp(page, "/");
    await scrollThrough(page);
    const allowed = [
      PROTOTYPE_VS_PILOT.refusal,
      ...FAQ.flatMap((f) => [f.q, f.a]),
      "Labeled with where it came from. Never “verified”.", // the receipts bento's portal tile
    ];
    const scan = async () => {
      // Every rendered string, including closed accordions and inactive phone screens, but not the RSC <script> payload.
      let text = await page.evaluate(() => {
        const clone = document.body.cloneNode(true) as HTMLElement;
        clone.querySelectorAll("script, style, template, noscript").forEach((n) => n.remove());
        return clone.textContent ?? "";
      });
      for (const s of allowed) text = text.split(s).join(" ");
      expect(text).not.toMatch(/HIPAA[ -](certified|compliant)/i);
      expect(text).not.toMatch(/\bverified\b/i);
      expect(text).not.toMatch(/trusted by|revolutionary|AI-powered/i);
      expect(text).not.toMatch(/[★☆]|\bstars?\b/i);
    };
    await scan();
    await page.getByRole("button", { name: "What your cardiologist sees" }).click();
    await expect(page.locator("#two-readers").getByRole("heading", { name: "For clinician review" })).toBeVisible();
    await scan();
    // no logos or customer marks anywhere in the page
    await expect(page.locator('main img[alt*="logo" i], main [aria-label*="logo" i]')).toHaveCount(0);
  });

  test("guideline criteria appear only on the care-team (clinician) copy", async ({ page }) => {
    await gotoApp(page, "/");
    const sheet = page.locator("#two-readers");
    await expect(sheet.getByRole("button", { name: "What you see" })).toHaveAttribute("aria-pressed", "true");
    await expect(sheet.locator(DOC)).toBeVisible();
    await expect(sheet.getByRole("heading", { name: "For clinician review" })).toHaveCount(0);
    await expect(sheet.locator(DOC)).not.toContainText("Basis:");
    await sheet.getByRole("button", { name: "What your cardiologist sees" }).click();
    await expect(sheet.getByRole("button", { name: "What your cardiologist sees" })).toHaveAttribute("aria-pressed", "true");
    await expect(sheet.getByRole("heading", { name: "For clinician review" })).toBeVisible();
  });
});

test("stats: the server renders each final value and its /research source link (no JavaScript)", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ ...DESKTOP, javaScriptEnabled: false });
  const report = await instrumentContext(context, baseURL);
  const page = await context.newPage();
  await page.goto("/");
  const fmt = (v: number, d: number) => new Intl.NumberFormat("en-US", { minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
  for (const s of STATS) {
    const prefix = "prefix" in s ? s.prefix : "";
    const stat = page.locator("#problem figure").filter({ hasText: s.source });
    await expect(stat).toHaveCount(1);
    await expect(stat.locator(".sr-only")).toHaveText(`${prefix}${fmt(s.value, s.decimals)}${s.suffix}`);
    await expect(stat.locator('[aria-hidden="true"]').first()).toContainText(fmt(s.value, s.decimals)); // the visible numeral, not 0
    await expect(stat.locator(`a[href="/research#source-${s.cite}"]`)).toHaveCount(1);
  }
  await context.close();
  expectClean(report);
});

test.describe("layout", () => {
  for (const width of [375, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoApp(page, "/");
      await scrollThrough(page);
      await noHorizontalOverflow(page);
    });
  }

  test.describe("on phones", () => {
    test.use(MOBILE);
    test("the headline is above the fold, the hero pill is the short one, and nothing overflows", async ({ page }) => {
      await gotoApp(page, "/");
      await expect(page.locator("h1#hero-title")).toBeInViewport();
      await expect(page.getByRole("link", { name: HONESTY.heroPillShort })).toBeVisible();
      await scrollThrough(page);
      await noHorizontalOverflow(page);
    });
  });
});

for (const [label, device] of [
  ["1440", DESKTOP],
  ["390", MOBILE],
] as const) {
  test.describe(`axe at ${label} px`, () => {
    test.use(device);
    test("0 serious or critical issues on the whole page", async ({ page }) => {
      await gotoApp(page, "/");
      await scrollThrough(page);
      await expectNoSeriousA11y(page);
    });
    test("0 serious or critical issues with the receipt open, the practice view and the clinician sheet", async ({ page }) => {
      await gotoApp(page, "/");
      await page.locator('[data-person-id="dad"]').click();
      await expect(page.getByRole("heading", { name: "Dad", level: 3 })).toBeVisible();
      await page.getByRole("button", { name: "What your cardiologist sees" }).click();
      await scrollThrough(page);
      await expectNoSeriousA11y(page);
      await page.getByRole("button", { name: "Practice view" }).click();
      await expect(page.getByRole("link", { name: "Open the practice view" })).toBeVisible();
      await expectNoSeriousA11y(page);
    });
  });
}

test.describe("interaction", () => {
  test("ProductTour: Enter on a relative opens the receipt; two voices for Dad; the embed never writes storage", async ({ page }) => {
    await gotoApp(page, "/");
    const before = await storedTree(page);
    const keys = await page.evaluate(() => Object.keys(localStorage).sort());
    const dad = page.locator('[data-person-id="dad"]');
    await dad.focus();
    await page.keyboard.press("Enter");
    const receipt = page.locator('article[aria-labelledby="receipt-dad"]');
    await expect(receipt).toBeVisible();
    await expect(receipt).toContainText("Both kept");
    await expect(receipt).toContainText("TOLD BY MOM · SEP 27");
    await expect(receipt).toContainText("TOLD BY UNCLE DEV · SEP 28");
    await expect(receipt.getByRole("link", { name: "Open Dad in the demo" })).toHaveAttribute("href", "/tree?person=dad");
    await page.locator('[data-person-id="mgf"]').click();
    await expect(page.getByRole("link", { name: "Ask Grandpa Luis" }).first()).toBeVisible();
    for (const tab of ["My summary", "Practice view", "Tree"]) {
      await page.getByRole("button", { name: tab }).click();
      await expect(page.getByRole("button", { name: tab })).toHaveAttribute("aria-pressed", "true");
    }
    expect(await storedTree(page)).toBe(before);
    expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual(keys);
  });

  test("the relative's phone switches screens from its thumbnails (no autoplay)", async ({ page }) => {
    await gotoApp(page, "/");
    const phone = page.getByRole("group", { name: /Grandpa Luis's phone/ });
    await expect(phone).toHaveAccessibleName(/screen 1 of 5/);
    await page.waitForTimeout(1500);
    await expect(phone).toHaveAccessibleName(/screen 1 of 5/); // still on Welcome: nothing advances by itself
    await page.getByRole("group", { name: "Relative's screens" }).getByRole("button", { name: "Sent" }).click();
    await expect(phone).toHaveAccessibleName(/screen 5 of 5/);
    await expect(phone.getByText("Sent. Thank you, Grandpa Luis.")).toBeVisible();
  });

  test("one fact from the portal: nothing pre-ticked, share one, then reset", async ({ page }) => {
    await gotoApp(page, "/");
    const afib = page.getByRole("checkbox", { name: /Atrial fibrillation/ });
    await expect(afib).not.toBeChecked();
    await expect(page.getByRole("button", { name: "Share with Alex" })).toBeDisabled(); // P2's OneFactBeam: nothing ticked yet
    await afib.check();
    await page.getByRole("button", { name: "Share 1 fact with Alex" }).click();
    await expect(page.getByText("Grandpa Luis shared one fact from his portal. Only that fact left the page.")).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(afib).not.toBeChecked();
  });

  test("keyboard: every tab, segmented control, bento action, thumbnail, accordion item and the marquee Pause is reachable, with a visible ring", async ({
    page,
  }) => {
    await gotoApp(page, "/");
    const wanted = new Set([
      "Tree",
      "My summary",
      "Practice view",
      "Show Dad’s answers",
      "Pause examples",
      "Ask Grandpa Luis",
      "Welcome",
      "Choose",
      "Pick",
      "Check",
      "Sent",
      "What you see",
      "What your cardiologist sees",
      ...FAQ.map((f) => f.q),
    ]);
    const seen = new Map<string, string>();
    await page.locator("body").focus();
    for (let i = 0; i < 260 && seen.size < wanted.size; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const name = (el.getAttribute("aria-label") ?? el.textContent ?? "").replace(/\s+/g, " ").trim();
        const cs = getComputedStyle(el);
        return { name, ring: cs.outlineStyle !== "none" && cs.outlineWidth !== "0px" };
      });
      if (!info) continue;
      const key = [...wanted].find((w) => info.name === w || info.name.startsWith(`${w} `));
      if (key && !seen.has(key)) seen.set(key, info.ring ? "ring" : "no ring");
    }
    expect(
      [...wanted].filter((w) => !seen.has(w)),
      "not reached by Tab",
    ).toEqual([]);
    expect(
      [...seen].filter(([, r]) => r !== "ring").map(([k]) => k),
      "no visible focus ring",
    ).toEqual([]);
  });
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });
  test("static marquee, final stat values, static beams, nothing running", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoApp(page, "/");
    await expect(page.getByRole("button", { name: "Pause examples" })).toBeHidden();
    await expect(page.getByRole("list", { name: "Examples the questions use" }).locator("li:visible")).toHaveCount(
      (await page.getByRole("list", { name: "Examples the questions use" }).locator("li").count()) / 2,
    );
    await page.locator("#problem").scrollIntoViewIfNeeded();
    for (const s of STATS) {
      const final = new Intl.NumberFormat("en-US", { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals }).format(s.value);
      await expect(page.locator("#problem figure").filter({ hasText: s.source }).locator('[aria-hidden="true"]').first()).toContainText(final);
    }
    await scrollThrough(page);
    await expect(page.locator("#privacy path[data-beam]").first()).toBeHidden();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length)).toBe(0);
  });
});
