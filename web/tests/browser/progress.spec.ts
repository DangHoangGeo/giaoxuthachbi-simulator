import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("empty timeline, version conditional request, stable missing link and no writes", async ({
  page,
  request,
}) => {
  await page.goto("/en/progress");
  await expect(
    page.getByRole("heading", { name: "Construction updates", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("No reviewed updates have been published for this selection."),
  ).toBeVisible();
  await expect(page.getByText(/Last successful check:/)).toBeVisible();
  const response = await request.get("/api/public/version");
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({
    state: "unpublished",
    releaseId: null,
    sha256: null,
    publishedAt: null,
    latestEventAt: null,
  });
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(
    (
      await request.get("/api/public/version", {
        headers: { "If-None-Match": response.headers().etag },
      })
    ).status(),
  ).toBe(304);
  expect((await request.post("/api/public/version", { data: { publish: true } })).status()).toBe(
    405,
  );
  expect((await request.get("/en/progress/not-a-published-event")).status()).toBe(404);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
test("timeline filters and language work with JavaScript disabled", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/progress?sort=oldest");
    await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
    await expect(page).toHaveURL(/\/vi\/progress\?sort=oldest$/);
    await expect(
      page.getByRole("heading", { name: "Tiến trình xây dựng", exact: true }),
    ).toBeVisible();
    await expect(page.locator("noscript p")).toBeVisible();
    await expect(page.locator("noscript p")).toHaveText(
      "Nếu tắt JavaScript, tải lại trang để kiểm tra cập nhật.",
    );
  } finally {
    await context.close();
  }
});
