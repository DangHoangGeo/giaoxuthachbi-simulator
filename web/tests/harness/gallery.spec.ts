import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("filters synthetic gallery records and labels dates, categories, credits and publication", async ({
  page,
}) => {
  await page.goto("/en/design");
  await expect(
    page.getByText("SYNTHETIC TEST BUILD — NO CHURCH EVIDENCE", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Images and design");
  await expect(
    page.locator("header").getByText("In development · Not for construction", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("footer")).toContainText("Published:");
  const cards = page.locator("figure");
  await expect(cards).toHaveCount(4);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const examples = [
    {
      slug: "site-photo",
      filter: /Site photographs/,
      category: "Site photographs",
      caption: "Synthetic example 1 — no church evidence",
      dateTime: "2026-02",
      date: "February 2026",
      note: "Photograph recorded on site.",
    },
    {
      slug: "design-render",
      filter: /Design models/,
      category: "Design models",
      caption: "Synthetic example 2 — no church evidence",
      dateTime: "2026-03-04",
      date: "4 March 2026",
      note: "Model image; does not establish what has been built.",
    },
    {
      slug: "concept-art",
      filter: /Concepts/,
      category: "Concepts",
      caption: "Synthetic example 3 — no church evidence",
      dateTime: null,
      date: "Capture / creation date unknown",
      note: "Concept image; not a photograph of completed work.",
    },
    {
      slug: "reference",
      filter: /References/,
      category: "References",
      caption: "Synthetic example 4 — no church evidence",
      dateTime: null,
      date: "Capture / creation date unknown",
      note: "Reference material; does not show the current church.",
    },
  ];
  const navigation = page.getByRole("navigation", { name: "Filter images" });
  for (const example of examples) {
    await navigation.getByRole("link", { name: example.filter }).click();
    await expect(page).toHaveURL(new RegExp(`/en/design\\?category=${example.slug}$`));
    await expect(page.locator("figure")).toHaveCount(1);
    const card = page.locator("figure").first();
    await expect(card.locator(":scope > p").first()).toHaveText(example.category);
    await expect(card.getByRole("heading", { level: 2 })).toHaveText(example.caption);
    await expect(card).toContainText(example.note);
    await expect(card).toContainText("Creator / source:");
    await expect(card).toContainText("Synthetic test generator; no parish image");
    await expect(card).toContainText(example.date);
    if (example.dateTime)
      await expect(card.locator("time")).toHaveAttribute("datetime", example.dateTime);
    else await expect(card.locator("time")).toHaveCount(0);
    await expect(navigation.getByRole("link", { name: example.filter })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
  await navigation.getByRole("link", { name: /^All/ }).click();
  await expect(page.locator("figure")).toHaveCount(4);
});

test("opens the native image dialog with keyboard focus, traps focus, and restores focus", async ({
  page,
}) => {
  await page.goto("/en/design");
  const opener = page.getByRole("link", {
    name: "Enlarge: Synthetic example 1 — no church evidence",
  });
  await opener.focus();
  await page.keyboard.press("Enter");

  const dialog = page.getByRole("dialog");
  const close = dialog.getByRole("button", { name: "Close image" });
  await expect(dialog).toBeVisible();
  await expect(close).toBeFocused();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await expect
    .poll(() =>
      dialog.evaluate(
        (element) => element instanceof HTMLDialogElement && element.matches(":modal"),
      ),
    )
    .toBe(true);
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(dialog).toBeVisible();
  await close.click();
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
});

test("shows the card caption and source when a synthetic media request fails", async ({ page }) => {
  await page.route("**/media/**", (route) => route.abort());
  await page.goto("/en/design");
  const card = page.locator("figure").first();
  await expect(
    card.getByText("The image could not load. Its caption and source remain below.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(card.getByRole("heading", { level: 2 })).toHaveText(
    "Synthetic example 1 — no church evidence",
  );
  await expect(card).toContainText("Synthetic test generator; no parish image");
});

test("works without JavaScript and opens the full-size image anchor", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3120",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/design");
    await expect(page.locator("figure")).toHaveCount(4);
    await expect(page.locator("figure").first()).toContainText(
      "Synthetic example 1 — no church evidence",
    );
    const imageLink = page.getByRole("link", {
      name: "Enlarge: Synthetic example 1 — no church evidence",
    });
    const href = await imageLink.getAttribute("href");
    expect(href).toMatch(/^\/media\/[a-f0-9]{64}\.jpg$/);
    if (!href) throw new Error("Expected a full-size image link");
    const response = await page.request.get(new URL(href, page.url()).toString());
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/jpeg");

    await Promise.all([page.waitForURL(/\/media\/[a-f0-9]{64}\.jpg$/), imageLink.click()]);
    expect(page.url()).toMatch(/\/media\/[a-f0-9]{64}\.jpg$/);
  } finally {
    await context.close();
  }
});

test("renders harness script text as text without executing it", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByText("SYNTHETIC TEST BUILD — NO CHURCH EVIDENCE", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).toContainText("<script>window.harnessInjection=1</script>");
  expect(
    await page.evaluate(() => (window as Window & { harnessInjection?: number }).harnessInjection),
  ).toBeUndefined();
  await expect(page.locator("main script")).toHaveCount(0);
});
