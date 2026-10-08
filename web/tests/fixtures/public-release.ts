import type { PublicRelease } from "../../src/lib/contracts/public-content";

// Invented records, unrelated to church facts. Production rejects fixtureOnly: true.
export function syntheticRelease(): PublicRelease {
  const text = { vi: "Ví dụ kiểm thử", en: "Synthetic test example" };
  const hash = "a".repeat(64);
  return {
    schemaVersion: 1,
    kind: "public-content",
    fixtureOnly: true,
    releaseId: "synthetic-release-one",
    sourceRevision: "synthetic-source-one",
    locales: ["vi", "en"],
    createdAt: "2026-03-01T01:00:00Z",
    publishedAt: "2026-03-02T01:00:00Z",
    publication: "published",
    reviewRef: "synthetic-review-one",
    pages: [{ id: "synthetic-page", slug: "introduction", title: text, body: text }],
    media: [
      {
        id: "synthetic-image",
        category: "concept-art",
        caption: text,
        alt: text,
        attribution: "Synthetic test fixture, no site photograph",
        capturedOn: null,
        rights: "cleared",
        rightsRef: "synthetic-rights-ref",
        derivatives: [
          { path: `/media/${hash}.webp`, sha256: hash, width: 80, height: 60, bytes: 12 },
        ],
      },
    ],
    events: [
      {
        id: "synthetic-event",
        slug: "synthetic-event",
        title: text,
        body: text,
        occurredOn: { precision: "month", value: "2026-02" },
        reportedAsOf: "2026-03-01",
        evidence: "owner-reported",
        evidenceRef: null,
        mediaIds: ["synthetic-image"],
        workPackageRef: null,
        designReleaseRef: null,
        publishedAt: "2026-03-01T01:00:00Z",
        updatedAt: "2026-03-01T01:00:00Z",
        status: "published",
        corrections: [],
      },
    ],
    retiredIds: ["synthetic-retired-item"],
  };
}
