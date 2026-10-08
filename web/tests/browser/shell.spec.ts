import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("desktop routes, equivalent language link and keyboard", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await page.keyboard.press("Tab");
  await expect(page.getByText("Đến nội dung chính", { exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("link", { name: "Về trang này", exact: true }).click();
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about-this-site$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About this site");
  await page.reload();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});
test("public reading without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3100/en");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("A place");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "About this site", exact: true })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About this site");
  await context.close();
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
