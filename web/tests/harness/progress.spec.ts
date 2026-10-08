import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("timeline dates, pagination, persistent language and withdrawn stable links", async ({
  page,
}) => {
  await page.goto("/en/progress?sort=oldest");
  await expect(
    page.getByRole("heading", { name: "Construction updates", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Page 1 / 3", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
  await expect(page).toHaveURL(/\/vi\/progress\?sort=oldest&page=2/);
  await page.goto("/en/progress/synthetic-event-001");
  await expect(page.locator("dl").getByText("February 2026", { exact: true })).toBeVisible();
  await expect(
    page.locator("figcaption").getByText("Photograph recorded on site.", { exact: true }),
  ).toBeVisible();
  await page.goto("/en/progress/synthetic-event-002");
  await expect(page.getByText("Exact occurrence date unknown", { exact: true })).toBeVisible();
  await expect(page.getByText("1 March 2026", { exact: true })).toBeVisible();
  await page.goto("/en/progress/synthetic-event-003");
  await expect(page.getByText("Withdrawn update", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Synthetic withdrawal notice for presentation testing."),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("poll notices a changed version without replacing the viewed event; failures retain content", async ({
  page,
}) => {
  await page.clock.install();
  let count = 0;
  await page.route("**/api/public/version", async (route) => {
    count++;
    if (count === 1) return route.continue();
    if (count === 2)
      return route.fulfill({
        status: 200,
        headers: { ETag: `"${"b".repeat(64)}"` },
        json: {
          state: "published",
          releaseId: "synthetic-next",
          sha256: "b".repeat(64),
          publishedAt: "2026-03-06T01:00:00Z",
          latestEventAt: "2026-03-06T01:00:00Z",
        },
      });
    return route.fulfill({ status: 503, json: { state: "unavailable" } });
  });
  await page.goto("/en/progress/synthetic-event-002");
  await expect(page.getByText(/Last successful check:/)).toBeVisible();
  await page.clock.fastForward(60_001);
  await expect(page.getByRole("status")).toHaveText("A different published version is available.");
  await expect(page.getByRole("button", { name: "Load the latest version" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Synthetic update 2", exact: true }),
  ).toBeVisible();
  const checked = await page
    .locator("aside[aria-label='Last successful check'] time")
    .getAttribute("datetime");
  await page.clock.fastForward(60_001);
  await expect(page.getByRole("status")).toContainText("could not be checked");
  expect(
    await page.locator("aside[aria-label='Last successful check'] time").getAttribute("datetime"),
  ).toBe(checked);
  await expect(
    page.getByRole("heading", { name: "Synthetic update 2", exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(60_001);
  await expect.poll(() => count).toBe(4);
  await page.clock.fastForward(60_001);
  expect(count).toBe(4);
  await page.clock.fastForward(60_001);
  await expect.poll(() => count).toBe(5);
});
test("hidden/offline states pause requests and resume safely", async ({ page }) => {
  await page.clock.install();
  let requests = 0;
  page.on("request", (r) => {
    if (r.url().endsWith("/api/public/version")) requests++;
  });
  await page.goto("/en/progress");
  await expect(page.getByText(/Last successful check:/)).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = requests;
  await page.clock.fastForward(180_001);
  expect(requests).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => false });
    window.dispatchEvent(new Event("offline"));
  });
  await expect(page.getByRole("status")).toContainText("Offline");
  await page.clock.fastForward(180_001);
  expect(requests).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "onLine", { configurable: true, get: () => true });
    window.dispatchEvent(new Event("online"));
  });
  await expect.poll(() => requests).toBe(hidden + 1);
  await expect(page.getByRole("status")).toHaveText("");
});
