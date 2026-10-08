import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("published home retains the development notice across locales and supports keyboard use", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(
    page.getByText("Đang phát triển · Không dùng để thi công", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Cùng xây dựng nhà thờ Thạch Bi",
  );
  await expect(page.getByText(/chưa phải hồ sơ được phép dùng để thi công/)).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.getByText("Đến nội dung chính", { exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("link", { name: "Về trang này", exact: true }).click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about-this-site$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About this site");
  await expect(
    page.getByText("In development · Not for construction", { exact: true }),
  ).toBeVisible();
  await page.reload();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("published site content and language navigation work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en");
    await expect(
      page.getByText("In development · Not for construction", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Building Thạch Bi Church together",
    );
    await expect(page.getByText(/not construction-approved documents/)).toBeVisible();
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Tiếng Việt", exact: true })
      .click();
    await expect(page).toHaveURL(/\/vi$/);
    await expect(
      page.getByText("Đang phát triển · Không dùng để thi công", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Cùng xây dựng nhà thờ Thạch Bi",
    );
  } finally {
    await context.close();
  }
});

test("unimplemented routes expose no protected content", async ({ request }) => {
  for (const route of [
    "/vi/review",
    "/en/review/documents",
    "/vi/site",
    "/en/sign-in",
    "/vi/unknown",
    "/fr",
    "/docs/electrical-grid/equipment-layout.json",
  ]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(404);
    expect(await response.text()).not.toContain("ENGINEERING_PRIVATE_CANARY");
  }
});
