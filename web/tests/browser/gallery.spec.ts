import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("production gallery stays empty and retains filters across locale, reload and keyboard use", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/en/design?category=concept-art");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Images and design");
  await expect(page.getByText("No cleared images in this category yet.")).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator('main a[href^="/media/"]')).toHaveCount(0);
  const filter = page.getByRole("navigation", { name: "Filter images" });
  await expect(filter.getByRole("link", { name: /Concepts/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  for (const category of ["All", "Site photographs", "Design models", "Concepts", "References"])
    await expect(filter.getByRole("link", { name: new RegExp(category) })).toContainText("(0)");

  const vietnameseLink = page.getByRole("link", { name: "Tiếng Việt", exact: true });
  await expect(vietnameseLink).toHaveAttribute("href", "/vi/design?category=concept-art");
  await vietnameseLink.click();
  await expect(page).toHaveURL(/\/vi\/design\?category=concept-art$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(
    page.getByRole("navigation", { name: "Lọc hình ảnh" }).getByRole("link", {
      name: /Ý tưởng/,
    }),
  ).toHaveAttribute("aria-current", "page");
  await page.reload();
  await expect(page).toHaveURL(/\/vi\/design\?category=concept-art$/);
  await expect(page.getByText("Chưa có hình ảnh đã duyệt trong mục này.")).toBeVisible();

  await page.goto("/en/design");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  const references = page
    .getByRole("navigation", { name: "Filter images" })
    .getByRole("link", { name: /References/ });
  await references.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/en\/design\?category=reference$/);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("production gallery category navigation works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/en/design");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Images and design");
    await expect(page.getByText("No cleared images in this category yet.")).toBeVisible();
    const reference = page
      .getByRole("navigation", { name: "Filter images" })
      .getByRole("link", { name: /References/ });
    await reference.click();
    await expect(page).toHaveURL(/\/en\/design\?category=reference$/);
    await expect(
      page
        .getByRole("navigation", { name: "Filter images" })
        .getByRole("link", { name: /References/ }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator("main img")).toHaveCount(0);
    await expect(page.getByText("No cleared images in this category yet.")).toBeVisible();
  } finally {
    await context.close();
  }
});
