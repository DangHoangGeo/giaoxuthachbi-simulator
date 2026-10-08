import { describe, expect, it } from "vitest";
import type { PublicVersion } from "../../src/lib/public-version-shape";
import { parsePublicVersion, retryDelay, versionKey } from "../../src/lib/public-version-shape";
import { publicReleaseHash } from "../../src/lib/server/public-validation";
import { publicVersion, versionResponse } from "../../src/lib/server/public-version";
import { syntheticRelease } from "../fixtures/public-release";

const noStore = "no-store, max-age=0";

function publishedContent() {
  const release = syntheticRelease();
  release.fixtureOnly = false;
  return { state: "published" as const, release };
}

describe("public version contract", () => {
  it("parses only the exact published and unpublished response allowlist", () => {
    const published: PublicVersion = {
      state: "published",
      releaseId: "synthetic-release-one",
      sha256: "a".repeat(64),
      publishedAt: "2026-03-02T01:00:00Z",
      latestEventAt: null,
    };
    const unpublished: PublicVersion = {
      state: "unpublished",
      releaseId: null,
      sha256: null,
      publishedAt: null,
      latestEventAt: null,
    };

    expect(parsePublicVersion(published)).toEqual(published);
    expect(parsePublicVersion(unpublished)).toEqual(unpublished);
    expect(versionKey(published)).toBe(published.sha256);
    expect(versionKey(unpublished)).toBe("unpublished");

    const invalid: unknown[] = [
      null,
      [],
      "published",
      { ...published, unexpected: "private synthetic field" },
      { ...published, sha256: "not-a-checksum" },
      { ...published, releaseId: "../private" },
      { ...published, publishedAt: "2026-03-02T01:00:00" },
      { ...unpublished, latestEventAt: "2026-03-02T01:00:00Z" },
      { state: "unknown", releaseId: null, sha256: null, publishedAt: null, latestEventAt: null },
    ];
    for (const value of invalid) expect(parsePublicVersion(value)).toBeNull();
  });

  it("returns only version metadata with a content hash ETag and no-store headers", async () => {
    const content = publishedContent();
    const expected = publicVersion(content);
    const response = versionResponse(content, null);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("ETag")).toBe(`"${publicReleaseHash(content.release)}"`);
    expect(response.headers.get("Cache-Control")).toBe(noStore);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(body).toEqual(expected);
    expect(Object.keys(body as Record<string, unknown>).sort()).toEqual(
      ["latestEventAt", "publishedAt", "releaseId", "sha256", "state"].sort(),
    );
    expect(parsePublicVersion(body)).toEqual(expected);
  });

  it("uses the latest event update and represents a published empty history as null", async () => {
    const content = publishedContent();
    const first = structuredClone(content.release.events[0]);
    first.updatedAt = "2026-03-01T02:00:00Z";
    const latest = structuredClone(first);
    latest.id = "synthetic-event-later";
    latest.slug = "synthetic-event-later";
    latest.updatedAt = "2026-03-01T03:00:00Z";
    content.release.events = [latest, first];

    expect(publicVersion(content).latestEventAt).toBe(latest.updatedAt);

    content.release.events = [];
    const emptyHistoryVersion = publicVersion(content);
    expect(emptyHistoryVersion.latestEventAt).toBeNull();
    const response = versionResponse(content, null);
    expect(parsePublicVersion(await response.json())).toEqual(emptyHistoryVersion);
  });

  it("supports weak and multiple If-None-Match validators", async () => {
    const content = publishedContent();
    const etag = `"${publicReleaseHash(content.release)}"`;
    const response = versionResponse(content, `"an-older-version", W/${etag}, "another"`);

    expect(response.status).toBe(304);
    expect(response.headers.get("ETag")).toBe(etag);
    expect(response.headers.get("Cache-Control")).toBe(noStore);
    expect(await response.text()).toBe("");
  });

  it("returns an unpublished empty version and honors its validator", async () => {
    const content = { state: "unpublished" as const };
    const response = versionResponse(content, null);
    const body: unknown = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("ETag")).toBe('"unpublished"');
    expect(response.headers.get("Cache-Control")).toBe(noStore);
    expect(parsePublicVersion(body)).toEqual({
      state: "unpublished",
      releaseId: null,
      sha256: null,
      publishedAt: null,
      latestEventAt: null,
    });

    const notModified = versionResponse(content, '"older", W/"unpublished"');
    expect(notModified.status).toBe(304);
    expect(notModified.headers.get("ETag")).toBe('"unpublished"');
  });

  it("returns a non-cacheable generic 503 when public content is unavailable", async () => {
    const response = versionResponse({ state: "unavailable" }, '"anything"');

    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe(noStore);
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("ETag")).toBeNull();
    expect(await response.json()).toEqual({ state: "unavailable" });
  });
});

describe("public version retry schedule", () => {
  it("uses bounded 60, 120, 240, then 300 second retry delays", () => {
    expect(retryDelay(1)).toBe(60_000);
    expect(retryDelay(2)).toBe(120_000);
    expect(retryDelay(3)).toBe(240_000);
    expect(retryDelay(4)).toBe(300_000);
    expect(retryDelay(5)).toBe(300_000);
    expect(retryDelay(100)).toBe(300_000);
  });
});
