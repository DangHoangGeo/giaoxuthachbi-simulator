import { expect, test } from "@playwright/test";

test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) {
    console.error(
      "Visit failure state:",
      await page
        .locator("main")
        .innerText()
        .catch(() => "Page unavailable"),
    );
  }
});

test("Enter waits for hydration on a slow script connection", async ({ page }) => {
  let releaseScripts: () => void = () => {};
  const ready = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await ready;
    await route.continue();
  });
  await page.goto("/en/visit", { waitUntil: "domcontentloaded" });
  const enter = page.getByRole("button", { name: "Enter 3D", exact: true });
  await expect(enter).toBeDisabled();
  await expect(page.getByRole("link", { name: /Browse the design images/ })).toBeVisible();
  releaseScripts();
  await expect(enter).toBeEnabled();
});

test("3D loads only on entry, stays read-only and disposes on close", async ({ page }) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const modelRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/models/")) modelRequests.push(r.url());
  });
  await page.addInitScript(() => {
    localStorage.setItem("church-simulator-layout", "untouched-test-layout");
  });
  await page.goto("/en/visit");
  await expect(page.getByRole("heading", { name: "Explore the 3D model" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(modelRequests).toHaveLength(0);
  await page.getByRole("button", { name: "Enter 3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "Nave", exact: true })).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator("canvas")).toHaveCount(1);
  expect(modelRequests).toHaveLength(1);
  await page.getByRole("button", { name: "Nave", exact: true }).click();
  await page.getByRole("button", { name: "Forward along aisle", exact: true }).click();
  await page.getByRole("button", { name: "Hide roof", exact: true }).click();
  await expect(page.getByRole("button", { name: "Hide roof", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("combobox", { name: "Atmosphere" }).selectOption("night");
  expect(await page.evaluate(() => localStorage.getItem("church-simulator-layout"))).toBe(
    "untouched-test-layout",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("thachbi.public-visit.atmosphere.v1")),
  ).toBe("night");
  expect(await page.evaluate(() => "church" in window || "CHURCH_SIMULATOR" in window)).toBe(false);
  await expect(page.getByRole("button", { name: /save|import|upload|delete/i })).toHaveCount(0);
  await page.getByRole("button", { name: "Close 3D", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Enter 3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "Close 3D", exact: true })).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator("canvas")).toHaveCount(1);
  await page.getByRole("button", { name: "Close 3D", exact: true }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("unavailable model keeps a retry and static gallery", async ({ page }) => {
  await page.route("**/models/**", (r) => r.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/en/visit");
  await page.getByRole("button", { name: "Enter 3D", exact: true }).click();
  await expect(page.getByRole("button", { name: "Retry", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Browse the design images/ })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
test("visit fallback works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/visit");
    await expect(page.getByRole("link", { name: /Browse the design images/ })).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.getByRole("link", { name: /Browse the design images/ }).click();
    await expect(page.locator("figure")).toHaveCount(16);
  } finally {
    await context.close();
  }
});
