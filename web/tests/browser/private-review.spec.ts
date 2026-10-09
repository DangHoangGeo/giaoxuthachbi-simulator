import { expect, test } from "@playwright/test";

test("anonymous review and model reads are challenged without private metadata", async ({
  request,
}) => {
  for (const locale of ["vi", "en"]) {
    for (const suffix of ["", "/model", "?_rsc=denial-check", "/model?path=review/access.json"]) {
      const response = await request.get(`/${locale}/review${suffix}`);
      expect(response.status()).toBe(401);
      expect(response.headers()["www-authenticate"]).toContain("Basic");
      expect(response.headers()["cache-control"]).toContain("no-store");
      const body = await response.text();
      expect(body).not.toMatch(
        /credentialSha256|private-full-detail|decodedSha256|125105044|BLOB_/,
      );
    }
  }
});
test("HEAD, Range and mutation attempts authenticate before answering", async ({ request }) => {
  for (const method of ["GET", "HEAD", "POST", "OPTIONS"]) {
    const response = await request.fetch("/vi/review/model", {
      method,
      headers: { Range: "bytes=0-1023", "If-None-Match": '"known"' },
    });
    expect(response.status()).toBe(401);
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers()["content-range"]).toBeUndefined();
  }
});
test("public visit works independently while private polling fails closed", async ({
  request,
  page,
}) => {
  const denied = await request.get("/vi/review/access");
  expect(denied.status()).toBe(401);
  expect(denied.headers()["www-authenticate"]).toBeUndefined();
  await page.goto("/en/visit");
  await expect(page.getByRole("button", { name: "Enter 3D", exact: true })).toBeEnabled();
  expect(await page.content()).not.toContain("review/model");
});
