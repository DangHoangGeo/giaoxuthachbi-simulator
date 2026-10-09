import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import developmentRelease from "../../content/release.json" with { type: "json" };

const concepts = developmentRelease.media.filter((item) => item.category === "concept-art");
const originalConceptIds = [
  "concept-front-20261007",
  "concept-nave-20261007",
  "concept-sanctuary-20261007",
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
  await expect(page.getByText("Architectural ideas · Select an image to explore.")).toBeVisible();
  const filters = page.getByRole("navigation", { name: "Filter images" });
  await expect(filters.getByRole("link", { name: /^All/ })).toContainText("(16)");
  await expect(filters.getByRole("link", { name: /^Site photographs/ })).toContainText("(0)");
  await expect(filters.getByRole("link", { name: /^Design models/ })).toContainText("(0)");
  await expect(filters.getByRole("link", { name: /^Concepts/ })).toContainText("(16)");
  await expect(filters.getByRole("link", { name: /^References/ })).toContainText("(0)");

  await expect(page.locator("main figure")).toHaveCount(16);
  await expect(page.locator("main img")).toHaveCount(16);
  expect(concepts.map((item) => item.id)).toEqual(expect.arrayContaining(originalConceptIds));
  for (const concept of concepts) {
    const card = page.locator("main figure").filter({ hasText: concept.caption.en });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("img", { name: concept.alt.en })).toBeVisible();
    await expect(card.getByRole("heading", { level: 2 })).toHaveText(concept.caption.en);
    await expect(card.locator(":scope > p").first()).toHaveText("Concepts");
    const details = card.locator("details");
    await expect(details).not.toHaveAttribute("open", "");
    await details.getByText("Date, source and notes", { exact: true }).click();
    await expect(details).toHaveAttribute("open", "");
    await expect(details.locator("time")).toHaveAttribute("datetime", "2026-10-07");
    await expect(details.getByText("7 October 2026")).toBeVisible();
    await expect(details).toContainText(concept.attribution);
    await expect(details).toContainText("Concept image; not a photograph of completed work.");
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
  const concept = concepts[0];
  const card = page.locator("main figure").filter({ hasText: concept.caption.en });
  const opener = card.getByRole("link", { name: /Enlarge:/ });
  await opener.focus();
  await expect(opener).toBeFocused();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog", { name: concept.caption.en });
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
    await expect(page.locator("main figure")).toHaveCount(16);
    await expect(page.getByRole("heading", { name: concepts[0].caption.en })).toBeVisible();

    await page.getByRole("link", { name: "Tiếng Việt", exact: true }).click();
    await expect(page).toHaveURL(/\/vi\/design\?category=concept-art$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(
      page.getByRole("heading", {
        name: concepts[1].caption.vi,
      }),
    ).toBeVisible();
    await expect(page.getByText("Đang phát triển · Không dùng để thi công")).toBeVisible();
  } finally {
    await context.close();
  }
});
