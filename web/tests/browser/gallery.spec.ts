import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const concepts = [
  {
    caption: "Front elevation — daylight concept",
    alt: "Concept of the church with twin towers, a central Marian statue and three timber entrances.",
  },
  {
    caption: "Nave interior concept; equipment coordination and concealment remain unresolved",
    alt: "Concept view along the central aisle toward the sanctuary, with pews and timber columns; fans, speakers and lights remain visible.",
  },
  {
    caption: "Sanctuary — evening concept, not a lighting prediction",
    alt: "Concept of a red-and-gold carved sanctuary, central crucifix, altar and statues to either side.",
  },
];

test("published concepts identify category, date and AI source; site-photo remains empty", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/en/design");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Images and design");
  await expect(
    page.getByText("Explore site photographs, design models, concepts and references."),
  ).toBeVisible();
  const filters = page.getByRole("navigation", { name: "Filter images" });
  await expect(filters.getByRole("link", { name: /^All/ })).toContainText("(3)");
  await expect(filters.getByRole("link", { name: /^Site photographs/ })).toContainText("(0)");
  await expect(filters.getByRole("link", { name: /^Design models/ })).toContainText("(0)");
  await expect(filters.getByRole("link", { name: /^Concepts/ })).toContainText("(3)");
  await expect(filters.getByRole("link", { name: /^References/ })).toContainText("(0)");

  await expect(page.locator("main figure")).toHaveCount(3);
  await expect(page.locator("main img")).toHaveCount(3);
  for (const concept of concepts) {
    const card = page.locator("main figure").filter({ hasText: concept.caption });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("img", { name: concept.alt })).toBeVisible();
    await expect(card).toContainText("Concepts");
    await expect(card).toContainText("7 October 2026");
    await expect(card).toContainText(/AI-generated concept \(image_gen\), 2026-10-07/);
    await expect(card).toContainText("Concept image; not a photograph of completed work.");
  }

  await page.goto("/en/design?category=site-photo");
  await expect(filters.getByRole("link", { name: /^Site photographs/ })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(page.getByText("No cleared images in this category yet.")).toBeVisible();
  await expect(page.getByText("Images will appear after parish publication review.")).toBeVisible();
  await expect(page.locator("main img")).toHaveCount(0);
  await expect(page.locator('main a[href^="/media/"]')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
});

test("a published concept opens from the keyboard and returns focus on close", async ({ page }) => {
  await page.goto("/en/design?category=concept-art");
  const card = page.locator("main figure").filter({ hasText: concepts[0].caption });
  const opener = card.getByRole("link", { name: /Enlarge:/ });
  await opener.focus();
  await expect(opener).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: concepts[0].caption });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "Close image" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("published gallery content, empty site-photo fallback and language navigation work without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/design?category=site-photo");
    await expect(page.getByText("No cleared images in this category yet.")).toBeVisible();
    await expect(page.locator("main img")).toHaveCount(0);
    await page.getByRole("link", { name: /^Concepts/ }).click();
    await expect(page).toHaveURL(/\/en\/design\?category=concept-art$/);
    await expect(page.locator("main figure")).toHaveCount(3);
    await expect(page.getByRole("heading", { name: concepts[0].caption })).toBeVisible();

    await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
    await expect(page).toHaveURL(/\/vi\/design\?category=concept-art$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(
      page.getByRole("heading", {
        name: "Gian chính — ý tưởng nội thất; thiết bị còn phải phối hợp và che giấu",
      }),
    ).toBeVisible();
    await expect(page.getByText("Đang phát triển · Không dùng để thi công")).toBeVisible();
  } finally {
    await context.close();
  }
});
