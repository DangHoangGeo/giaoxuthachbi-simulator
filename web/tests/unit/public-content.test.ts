import { describe, expect, it } from "vitest";
import { calendarDay, instant, occurrenceDate } from "../../src/lib/contracts/common";
import { publicReleaseSchema } from "../../src/lib/contracts/public-content";
import { publicReleaseHash, resolvePublicContent } from "../../src/lib/server/public-validation";
import canary from "../fixtures/private-canary.json";
import { syntheticRelease } from "../fixtures/public-release";

describe("date evidence", () => {
  it.each(["2026-02-29", "2026-04-31", "2026-00-01", "2026-13-01", "2026-01-00", "2026-1-1"])(
    "rejects impossible day %s",
    (value) => {
      expect(calendarDay.safeParse(value).success).toBe(false);
    },
  );
  it("keeps month-only and unknown occurrence separate from an as-of day", () => {
    expect(calendarDay.parse("2024-02-29")).toBe("2024-02-29");
    const data = syntheticRelease();
    expect(publicReleaseSchema.parse(data).events[0].occurredOn).toEqual({
      precision: "month",
      value: "2026-02",
    });
    data.events[0].occurredOn = null;
    const event = publicReleaseSchema.parse(data).events[0];
    expect(event.occurredOn).toBeNull();
    expect(event.reportedAsOf).toBe("2026-03-01");
    expect(occurrenceDate.safeParse({ precision: "day", value: "2026-02" }).success).toBe(false);
  });
  it.each(["2026-02-30T12:00:00Z", "2026-03-01T12:00:00", "2026-03-01T25:00:00Z"])(
    "rejects invalid/unzoned instant %s",
    (value) => {
      expect(instant.safeParse(value).success).toBe(false);
    },
  );
});

describe("publication boundary", () => {
  it.each(["", "/", "bad", "../private.png", "javascript:alert(1)", "/media/../../private.png"])(
    "safely rejects malformed asset path %s",
    (path) => {
      const data = syntheticRelease();
      data.media[0].derivatives[0].path = path;
      expect(publicReleaseSchema.safeParse(data).success).toBe(false);
    },
  );
  it("rejects fixtures in production even with matching release and checksum", () => {
    const fixture = syntheticRelease();
    const pointer = {
      schemaVersion: 1,
      state: "published",
      releaseId: fixture.releaseId,
      sha256: publicReleaseHash(fixture),
    };
    expect(resolvePublicContent(pointer, fixture)).toEqual({ state: "unavailable" });
  });
  it("checks an immutable release without depending on key insertion order", () => {
    // Exercise production shape only in memory. This does not clear any real content for publication.
    const sample = { ...syntheticRelease(), fixtureOnly: false };
    const reordered = Object.fromEntries(Object.entries(sample).reverse());
    expect(publicReleaseHash(publicReleaseSchema.parse(reordered))).toBe(publicReleaseHash(sample));
    const pointer = {
      schemaVersion: 1,
      state: "published",
      releaseId: sample.releaseId,
      sha256: publicReleaseHash(sample),
    };
    expect(resolvePublicContent(pointer, sample)).toEqual({ state: "published", release: sample });
    expect(resolvePublicContent({ ...pointer, releaseId: "another-release" }, sample)).toEqual({
      state: "unavailable",
    });
    expect(resolvePublicContent({ ...pointer, sha256: "0".repeat(64) }, sample)).toEqual({
      state: "unavailable",
    });
    expect(resolvePublicContent(pointer, { ...sample, reviewRef: "different-review" })).toEqual({
      state: "unavailable",
    });
  });
  it("requires a genuinely empty unpublished pointer and redacts errors", () => {
    const pointer = { schemaVersion: 1, state: "unpublished", releaseId: null, sha256: null };
    expect(resolvePublicContent(pointer, null)).toEqual({ state: "unpublished" });
    expect(resolvePublicContent(pointer, syntheticRelease())).toEqual({ state: "unavailable" });
    expect(
      resolvePublicContent({ ...pointer, publishedAt: "2026-01-01T00:00:00Z", ...canary }, null),
    ).toEqual({ state: "unavailable" });
    expect(resolvePublicContent(null, null)).toEqual({ state: "unavailable" });
  });
  it("rejects extra fields at nested serialization boundaries", () => {
    const data = syntheticRelease();
    const variants = [
      { ...data, privateCanary: canary.privateCanary },
      { ...data, pages: [{ ...data.pages[0], privatePath: canary.storageKey }] },
      {
        ...data,
        pages: [
          { ...data.pages[0], title: { ...data.pages[0].title, secret: canary.privateCanary } },
        ],
      },
      { ...data, events: [{ ...data.events[0], privateNotes: canary.privateCanary }] },
      {
        ...data,
        events: [
          {
            ...data.events[0],
            occurredOn: { ...data.events[0].occurredOn, sourcePath: canary.storageKey },
          },
        ],
      },
      { ...data, media: [{ ...data.media[0], originals: [canary.storageKey] }] },
      {
        ...data,
        media: [
          {
            ...data.media[0],
            derivatives: [{ ...data.media[0].derivatives[0], sourcePath: canary.storageKey }],
          },
        ],
      },
    ];
    for (const variant of variants)
      expect(publicReleaseSchema.safeParse(variant).success).toBe(false);
  });
  it("rejects draft/uncleared media, invalid paths, references and retired IDs", () => {
    const data = syntheticRelease();
    const variants = [
      { ...data, publication: "draft" },
      { ...data, media: [{ ...data.media[0], rights: "pending" }] },
      {
        ...data,
        media: [
          {
            ...data.media[0],
            derivatives: [
              { ...data.media[0].derivatives[0], path: "https://example.com/image.jpg" },
            ],
          },
        ],
      },
      {
        ...data,
        media: [
          {
            ...data.media[0],
            derivatives: [{ ...data.media[0].derivatives[0], sha256: "b".repeat(64) }],
          },
        ],
      },
      { ...data, events: [{ ...data.events[0], mediaIds: ["missing-image"] }] },
      { ...data, events: [{ ...data.events[0], evidence: "verified" }] },
      { ...data, retiredIds: [data.events[0].id] },
      { ...data, pages: [data.pages[0], data.pages[0]] },
      { ...data, events: [{ ...data.events[0], updatedAt: "2027-01-01T00:00:00Z" }] },
      { ...data, events: [{ ...data.events[0], status: "withdrawn" }] },
    ];
    for (const variant of variants)
      expect(publicReleaseSchema.safeParse(variant).success).toBe(false);
  });
});
