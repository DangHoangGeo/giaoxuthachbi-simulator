import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results/production",
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:3100",
    viewport: { width: 1440, height: 900 },
    channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
    headless: process.env.HEADED !== "1",
    // GPU-less CI exercises functionality through Chromium's explicit software
    // driver. Hardware/frame-time acceptance is measured separately on desktop.
    launchOptions: process.env.CI
      ? { args: ["--use-gl=angle", "--use-angle=swiftshader", "--disable-gpu-watchdog"] }
      : undefined,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --port 3100",
    url: "http://127.0.0.1:3100/vi",
    reuseExistingServer: false,
    timeout: 60000,
  },
});
