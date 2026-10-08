import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const ownerEvidence = "Reported by the owner — not independently verified";

test("published owner-reported milestones retain occurrence and report-date uncertainty", async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/en/progress");
  await expect(
    page.getByRole("heading", { name: "Construction updates", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Construction began in February 2026" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Owner report: foundation complete, construction continuing",
    }),
  ).toBeVisible();
  await expect(page.getByText(ownerEvidence)).toHaveCount(2);
  await expect(page.locator('time[datetime="2026-02"]')).toHaveText("February 2026");
  await expect(page.getByText("Exact occurrence date unknown")).toBeVisible();

  await page.goto("/en/progress/construction-start-2026");
  await expect(
    page.getByRole("heading", { name: "Construction began in February 2026" }),
  ).toBeVisible();
  await expect(page.locator('time[datetime="2026-02"]')).toHaveText("February 2026");
  await expect(page.locator('time[datetime="2026-10-07"]')).toHaveText("7 October 2026");
  await expect(page.getByText(ownerEvidence)).toBeVisible();
  await expect(page.locator("article img")).toHaveCount(0);

  await page.goto("/en/progress/foundation-owner-report-2026");
  await expect(
    page.getByRole("heading", {
      name: "Owner report: foundation complete, construction continuing",
    }),
  ).toBeVisible();
  await expect(page.getByText("Exact occurrence date unknown")).toBeVisible();
  await expect(page.locator('time[datetime="2026-10-07"]')).toHaveText("7 October 2026");
  await expect(page.getByText("No cleared photograph accompanies this update.")).toBeVisible();
  await expect(page.locator("article img")).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);

  const response = await request.get("/api/public/version");
  expect(response.status()).toBe(200);
  const version = await response.json();
  expect(Object.keys(version).sort()).toEqual(
    ["latestEventAt", "publishedAt", "releaseId", "sha256", "state"].sort(),
  );
  expect(version.state).toBe("published");
  expect(version.releaseId).toBe("development-content-20261008-one");
  expect(version.sha256).toMatch(/^[a-f0-9]{64}$/);
  expect(version.publishedAt).toBe("2026-10-08T11:48:24Z");
  expect(version.latestEventAt).toBe("2026-10-08T11:48:24Z");
  expect(response.headers().etag).toBe(`"${version.sha256}"`);
  expect(response.headers()["cache-control"]).toContain("no-store");

  const notModified = await request.get("/api/public/version", {
    headers: { "If-None-Match": response.headers().etag },
  });
  expect(notModified.status()).toBe(304);
  expect(notModified.headers().etag).toBe(response.headers().etag);
  expect((await request.post("/api/public/version", { data: { publish: true } })).status()).toBe(
    405,
  );
  expect((await request.get("/en/progress/not-a-published-event")).status()).toBe(404);
});

test("timeline content, query navigation and language work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/progress?sort=oldest");
    await expect(
      page.getByRole("link", { name: "Construction began in February 2026" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", {
        name: "Owner report: foundation complete, construction continuing",
      }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
    await expect(page).toHaveURL(/\/vi\/progress\?sort=oldest$/);
    await expect(
      page.getByRole("heading", { name: "Tiến trình xây dựng", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Khởi công trong tháng 2 năm 2026" }),
    ).toBeVisible();
    await expect(page.getByText("Đang phát triển · Không dùng để thi công")).toBeVisible();
    await expect(page.locator("noscript p")).toBeVisible();
    await expect(page.locator("noscript p")).toHaveText(
      "Nếu tắt JavaScript, tải lại trang để kiểm tra cập nhật.",
    );
  } finally {
    await context.close();
  }
});
