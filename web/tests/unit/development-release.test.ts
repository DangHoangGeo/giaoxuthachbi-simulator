import { describe, expect, it } from "vitest";
import currentPointer from "../../content/current.json";
import developmentRelease from "../../content/release.json";
import { publicPointerSchema, publicReleaseSchema } from "../../src/lib/contracts/public-content";
import { publicReleaseHash, resolvePublicContent } from "../../src/lib/server/public-validation";

describe("owner-authorized development release", () => {
  it("matches its pointer and validates as the current published release", () => {
    const pointer = publicPointerSchema.parse(currentPointer);
    const release = publicReleaseSchema.parse(developmentRelease);

    expect(pointer.state).toBe("published");
    expect(pointer.releaseId).toBe(release.releaseId);
    expect(release.fixtureOnly).toBe(false);
    expect(publicReleaseHash(release)).toBe(pointer.sha256);
    expect(resolvePublicContent(pointer, developmentRelease)).toMatchObject({
      state: "published",
      release: { releaseId: pointer.releaseId, fixtureOnly: false },
    });
  });

  it("contains sixteen dated concepts, preserves the original three IDs, and has no site photographs or private source paths", () => {
    const release = publicReleaseSchema.parse(developmentRelease);

    expect(release.media).toHaveLength(16);
    expect(release.media.every((item) => item.category === "concept-art")).toBe(true);
    expect(release.media.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        "concept-front-20261007",
        "concept-nave-20261007",
        "concept-sanctuary-20261007",
      ]),
    );
    expect(release.media.filter((item) => item.category === "site-photo")).toHaveLength(0);
    for (const item of release.media) {
      expect(item.capturedOn).toEqual({ precision: "day", value: "2026-10-07" });
      expect(item.attribution).toContain("AI-generated concept");
      expect(item.derivatives.length).toBeGreaterThan(0);
      for (const asset of item.derivatives)
        expect(asset.path).toMatch(/^\/media\/[a-f0-9]{64}\.(avif|webp|jpg|png)$/);
    }
    expect(JSON.stringify(release)).not.toMatch(/(?:\/Users\/|\/private\/|file:\/\/)/i);
  });

  it("keeps both milestones owner-reported with their supplied uncertainty and no invented media", () => {
    const release = publicReleaseSchema.parse(developmentRelease);
    const events = new Map(release.events.map((event) => [event.id, event]));
    const constructionStart = events.get("construction-start-2026");
    const foundationReport = events.get("foundation-owner-report-2026");

    expect(release.events).toHaveLength(2);
    expect(constructionStart).toBeDefined();
    expect(constructionStart).toMatchObject({
      occurredOn: { precision: "month", value: "2026-02" },
      occurredUntil: null,
      timeZone: "Asia/Ho_Chi_Minh",
      reportedAsOf: "2026-10-07",
      evidence: "owner-reported",
      mediaIds: [],
    });
    expect(foundationReport).toBeDefined();
    expect(foundationReport).toMatchObject({
      occurredOn: null,
      occurredUntil: null,
      timeZone: "Asia/Ho_Chi_Minh",
      reportedAsOf: "2026-10-07",
      evidence: "owner-reported",
      mediaIds: [],
    });
    expect(release.events.every((event) => event.evidence === "owner-reported")).toBe(true);
    expect(release.events.some((event) => event.evidence === "verified")).toBe(false);
    expect(release.retiredIds).toEqual([]);
  });
});
