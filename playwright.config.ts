import { defineConfig, devices } from "@playwright/test";

// e2e contract suite (DESIGN §13.1). Runs against `next start` (production CSP), never `next dev`.
//   npm run e2e                         build + start on E2E_PORT (default 3100), then test
//   E2E_PORT=3217 npm run e2e           reuse a server already running on that port
//   E2E_BASE_URL=https://… npm run e2e  test a deployed preview (no local server)
//   E2E_SANDBOX=1                       also run @sandbox tests against the public SMART sandbox (needs internet)
//   E2E_WEBKIT=1                        add the WebKit project for hero.spec (WebKit isn't preinstalled here)
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

// @playwright/test is pinned to 1.56.1 so it matches the preinstalled Chromium (AMENDMENTS A5); never `playwright install`.
const chromiumPath = process.env.E2E_CHROMIUM_PATH;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : [["list"]],
  grepInvert: process.env.E2E_SANDBOX === "1" ? undefined : /@sandbox/,
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: chromiumPath ? { executablePath: chromiumPath } : undefined,
  },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run start -- -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        stdout: "ignore",
        stderr: "pipe",
      },
  projects: [
    {
      name: "chromium",
      // Desktop 1440×900 by default; specs switch to MOBILE (390×844) from tests/e2e/fixtures.ts where they need it.
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    ...(process.env.E2E_WEBKIT === "1"
      ? [{ name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } }, testMatch: /hero\.spec/ }]
      : []),
  ],
});
