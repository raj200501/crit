// P1: every route renders under the production CSP with 0 securitypolicyviolation events, and nothing is
// requested from another origin (fonts are self-hosted by next/font). The SMART sandbox is excluded and not
// exercised here (see invite.spec @sandbox). DESIGN §13.1 acceptance 4.
// The fixtures also fail any test that sees a same-origin HTTP ≥ 400 (e.g. a nav link whose prefetch 404s).
import { expect, gotoApp, recordRequests, ROUTES, SANDBOX_HOSTS, scrollThrough, test } from "./fixtures";

for (const route of ROUTES) {
  test(`${route}: no CSP violations and no third-party requests`, async ({ page, baseURL, cspViolations }) => {
    const origin = new URL(baseURL!).origin;
    const urls = recordRequests(page);
    await gotoApp(page, route);
    await scrollThrough(page);
    await page.waitForTimeout(250);
    const foreign = urls.filter((u) => /^https?:/.test(u) && new URL(u).origin !== origin && !SANDBOX_HOSTS.test(new URL(u).hostname));
    expect(foreign).toEqual([]);
    expect(urls.filter((u) => /fonts\.(googleapis|gstatic)\.com/.test(u))).toEqual([]);
    expect(cspViolations).toEqual([]);
  });
}

test("fonts are served from our origin", async ({ page, baseURL }) => {
  const urls = recordRequests(page);
  await gotoApp(page, "/design-system");
  await page.evaluate(() => document.fonts.ready);
  const fonts = urls.filter((u) => u.endsWith(".woff2"));
  expect(fonts.length).toBeGreaterThan(0);
  for (const u of fonts) expect(new URL(u).origin).toBe(new URL(baseURL!).origin);
  const families = await page.evaluate(() => [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/['"]/g, "")));
  expect(families.some((f) => /Geist/i.test(f))).toBe(true);
  expect(families.some((f) => /Newsreader/i.test(f))).toBe(true);
});

test("the production CSP header is the one in next.config.ts", async ({ request }) => {
  const res = await request.get("/");
  const csp = res.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("font-src 'self'");
  expect(csp).not.toContain("unsafe-eval");
  expect(res.headers()["referrer-policy"]).toBe("no-referrer");
  expect(res.headers()["x-frame-options"]).toBe("DENY");
});
