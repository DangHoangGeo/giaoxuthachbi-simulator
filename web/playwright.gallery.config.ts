import { defineConfig } from "@playwright/test";

// Presentation-only synthetic app in a disposable directory. Production never imports it.
export default defineConfig({
  testDir: "tests/harness",
  testMatch: "gallery.spec.ts",
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3120",
    viewport: { width: 1440, height: 900 },
    channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
    headless: process.env.HEADED !== "1",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/harness/run-gallery.mjs",
    url: "http://127.0.0.1:3120/en/design",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
