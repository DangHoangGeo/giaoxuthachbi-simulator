import { expect, test } from "@playwright/test";

test("the visit page links to the Vietnamese quick-start guide", async ({ page }) => {
  for (const locale of ["vi", "en"]) {
    await page.goto(`/${locale}/visit`);
    await expect(page.locator('a[href="/guide/index.html"]')).toBeVisible();
  }
});

test("the guide opens, shows every step and plays its narration captions", async ({ page }) => {
  const failed: string[] = [];
  page.on("response", (response) => {
    // The full narrated video is a large local file and is not published with the site.
    if (response.status() >= 400 && !response.url().endsWith(".mp4")) failed.push(response.url());
  });
  await page.goto("/guide/index.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Xem mô hình 3D");
  await expect(page.getByText("In development · Not for construction")).toBeVisible();
  const steps = page.locator("article.step");
  expect(await steps.count()).toBeGreaterThan(15);
  await expect(page.locator("#videobox")).toBeHidden();
  await page.getByRole("button", { name: /Phát có tiếng/ }).click();
  await expect(page.locator("#pwrap .txt")).toContainText("video hướng dẫn ngắn", {
    timeout: 15000,
  });
  await page.getByRole("button", { name: /Phát có tiếng|Tạm dừng/ }).click();
  await page.locator("#dots button").nth(6).click();
  await expect(page.locator("#pwrap video")).toBeVisible();
  expect(failed).toEqual([]);
});
