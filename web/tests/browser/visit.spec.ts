import { expect, test } from "@playwright/test";

const viewer = "/viewer/OPEN_CHURCH.html";

test("Enter waits for hydration on a slow script connection", async ({ page }) => {
  let releaseScripts: () => void = () => {};
  const ready = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/static/**/*.js", async (route) => {
    await ready;
    await route.continue();
  });
  await page.goto("/en/visit", { waitUntil: "domcontentloaded" });
  const enter = page.getByRole("button", { name: "Enter 3D", exact: true });
  await expect(enter).toBeDisabled();
  await expect(page.getByRole("link", { name: /Browse the design images/ })).toBeVisible();
  releaseScripts();
  await expect(enter).toBeEnabled();
});

test("the viewer loads only on entry, in visit-only mode, and closes", async ({ page }) => {
  test.setTimeout(180000);
  const viewerRequests: string[] = [];
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/viewer/")) viewerRequests.push(r.url());
  });
  await page.goto("/en/visit");
  await expect(page.getByRole("heading", { name: "Explore the 3D model" })).toBeVisible();
  await expect(
    page.getByText("In development · Not for construction", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(viewerRequests).toHaveLength(0);

  await page.getByRole("button", { name: "Enter 3D", exact: true }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", viewer);
  const frame = page.frameLocator("iframe");
  await expect(frame.locator("html")).toHaveClass(/visit-only/);
  // The viewer starts from its own animation frame; allow for software rendering in CI.
  await expect
    .poll(
      () =>
        page
          .frames()
          .find((f) => f.url().endsWith(viewer))
          ?.evaluate(() =>
            Boolean((window as unknown as { church?: { ready?: boolean } }).church?.ready),
          ),
      { timeout: 150000 },
    )
    .toBe(true);
  await expect(frame.locator("#simulatorButton")).toBeHidden();
  await expect(frame.locator("#simPanel")).toBeHidden();
  await expect(frame.getByText(/Not for construction/)).toBeVisible();
  const state = await page
    .frames()
    .find((f) => f.url().endsWith(viewer))
    ?.evaluate(() => {
      const sim = (
        window as unknown as {
          CHURCH_SIMULATOR: { visitOnly: boolean; ui: { setOpen(open: boolean): void } };
        }
      ).CHURCH_SIMULATOR;
      sim.ui.setOpen(true);
      return {
        visitOnly: sim.visitOnly,
        editing: document.body.classList.contains("sim-open"),
        engineeringLayout: localStorage.getItem("thachbi.simulator.v1"),
      };
    });
  expect(state).toEqual({ visitOnly: true, editing: false, engineeringLayout: null });

  await page.getByRole("button", { name: "Close 3D", exact: true }).click();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("the viewer may be framed only by this site", async ({ request }) => {
  const entry = await request.get(viewer);
  expect(entry.status()).toBe(200);
  expect(entry.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(await entry.text()).toContain('<html lang="en" class="visit-only">');
  const page = await request.get("/en/visit");
  expect(page.headers()["x-frame-options"]).toBe("DENY");
  for (const removed of ["/models/", "/en/review", "/vi/review/model"])
    expect((await request.get(removed)).status(), removed).toBe(404);
});

test("visit fallback works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:3100",
  });
  try {
    const page = await context.newPage();
    await page.goto("/en/visit");
    await expect(page.getByRole("link", { name: /Browse the design images/ })).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
    await page.getByRole("link", { name: /Browse the design images/ }).click();
    await expect(page.locator("figure")).toHaveCount(16);
  } finally {
    await context.close();
  }
});
