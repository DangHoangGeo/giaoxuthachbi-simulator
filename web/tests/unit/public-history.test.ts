import { describe, expect, it } from "vitest";
import type { PublicRelease } from "../../src/lib/contracts/public-content";
import { publicReleaseSchema } from "../../src/lib/contracts/public-content";
import { validatePublicHistory } from "../../src/lib/contracts/public-history";
import { syntheticRelease } from "../fixtures/public-release";

const hour = 60 * 60 * 1000;
const exampleText = { vi: "Nội dung kiểm thử", en: "Synthetic test content" };

function advance(previous: PublicRelease): PublicRelease {
  const next = structuredClone(previous);
  const publishedMs = Date.parse(previous.publishedAt) + 24 * hour;
  next.releaseId = `${previous.releaseId}-next`;
  next.sourceRevision = `${previous.sourceRevision}-next`;
  next.reviewRef = `${previous.reviewRef}-next`;
  next.createdAt = new Date(publishedMs - hour).toISOString();
  next.publishedAt = new Date(publishedMs).toISOString();
  return next;
}

function correctEvent(
  previous: PublicRelease,
  change: (event: PublicRelease["events"][number]) => void,
): PublicRelease {
  const next = advance(previous);
  const event = next.events[0];
  change(event);
  event.status = "corrected";
  event.updatedAt = new Date(Date.parse(previous.publishedAt) + 12 * hour).toISOString();
  event.corrections = [
    ...structuredClone(previous.events[0].corrections),
    {
      previousReleaseId: previous.releaseId,
      changedAt: event.updatedAt,
      explanation: exampleText,
    },
  ];
  return next;
}

function withInvalidEvent(
  release: PublicRelease,
  change: (event: Record<string, unknown>) => void,
) {
  const value = structuredClone(release);
  change(value.events[0] as unknown as Record<string, unknown>);
  return value;
}

describe("public release history", () => {
  it("accepts a valid first release and an unchanged advancing release", () => {
    const first = syntheticRelease();
    expect(validatePublicHistory(null, first)).toEqual([]);

    const next = advance(first);
    expect(validatePublicHistory(first, next)).toEqual([]);
  });

  it("rejects malformed previous and next releases, including missing required event fields", () => {
    const valid = syntheticRelease();
    const invalidNext = withInvalidEvent(valid, (event) => {
      event.timeZone = "UTC";
    });
    expect(validatePublicHistory(null, invalidNext)).toContain("Invalid next public release");

    const missingInterval = withInvalidEvent(valid, (event) => {
      delete event.occurredUntil;
    });
    expect(publicReleaseSchema.safeParse(missingInterval).success).toBe(false);

    const missingTimezone = withInvalidEvent(valid, (event) => {
      delete event.timeZone;
    });
    expect(publicReleaseSchema.safeParse(missingTimezone).success).toBe(false);

    const invalidPrevious = withInvalidEvent(valid, (event) => {
      event.timeZone = "UTC";
    });
    expect(validatePublicHistory(invalidPrevious, advance(valid))).toContain(
      "Invalid previous public release",
    );
  });

  it("requires a new immutable release ID and a strictly advancing publication time", () => {
    const previous = syntheticRelease();

    const reusedId = advance(previous);
    reusedId.releaseId = previous.releaseId;
    expect(validatePublicHistory(previous, reusedId)).toContain("Release IDs are immutable");

    const sameTime = advance(previous);
    sameTime.publishedAt = previous.publishedAt;
    sameTime.createdAt = previous.createdAt;
    expect(validatePublicHistory(previous, sameTime)).toContain("Publication must advance");
  });

  it("preserves retired IDs and requires removed media to be retired", () => {
    const previous = syntheticRelease();
    const droppedRetirement = advance(previous);
    droppedRetirement.retiredIds = [];
    expect(validatePublicHistory(previous, droppedRetirement)).toContain(
      "Retirement history was dropped",
    );

    const removedMedia = correctEvent(previous, (event) => {
      event.mediaIds = [];
    });
    removedMedia.media = [];
    expect(publicReleaseSchema.safeParse(removedMedia).success).toBe(true);
    expect(validatePublicHistory(previous, removedMedia)).toContain(
      `Removed record must be retired: ${previous.media[0].id}`,
    );

    removedMedia.retiredIds.push(previous.media[0].id);
    expect(validatePublicHistory(previous, removedMedia)).toEqual([]);
  });

  it("requires removed events to remain as stable withdrawn tombstones", () => {
    const previous = syntheticRelease();
    const next = advance(previous);
    next.events = [];

    expect(publicReleaseSchema.safeParse(next).success).toBe(true);
    expect(validatePublicHistory(previous, next)).toContain(
      `Event needs a stable withdrawn record: ${previous.events[0].id}`,
    );

    const tombstone = correctEvent(previous, (event) => {
      event.mediaIds = [];
    });
    tombstone.events[0].status = "withdrawn";
    tombstone.media = [];
    tombstone.retiredIds.push(previous.media[0].id);
    expect(publicReleaseSchema.safeParse(tombstone).success).toBe(true);
    expect(validatePublicHistory(previous, tombstone)).toEqual([]);
  });

  it("does not allow a withdrawn event to retain media", () => {
    const previous = syntheticRelease();
    const withdrawn = correctEvent(previous, (event) => {
      event.status = "withdrawn";
    });
    withdrawn.events[0].status = "withdrawn";

    expect(withdrawn.events[0].mediaIds).toEqual([previous.media[0].id]);
    expect(publicReleaseSchema.safeParse(withdrawn).success).toBe(false);
    expect(validatePublicHistory(previous, withdrawn)).toContain("Invalid next public release");
  });

  it("allows same-ID title and slug corrections with an appended notice and stable original publication", () => {
    const previous = syntheticRelease();
    const corrected = correctEvent(previous, (event) => {
      event.title = { vi: "Tiêu đề đã sửa", en: "Corrected synthetic title" };
      event.slug = "synthetic-event-revised";
    });

    expect(corrected.events[0].id).toBe(previous.events[0].id);
    expect(corrected.events[0].publishedAt).toBe(previous.events[0].publishedAt);
    expect(corrected.events[0].corrections).toHaveLength(1);
    expect(corrected.events[0].corrections[0].previousReleaseId).toBe(previous.releaseId);
    expect(validatePublicHistory(previous, corrected)).toEqual([]);
  });

  it("requires each correction to append a notice without rewriting the correction prefix", () => {
    const firstCorrection = correctEvent(syntheticRelease(), (event) => {
      event.title = { vi: "Tiêu đề thứ nhất", en: "First corrected title" };
    });
    const secondCorrection = correctEvent(firstCorrection, (event) => {
      event.body = { vi: "Nội dung thứ hai", en: "Second corrected body" };
    });
    expect(validatePublicHistory(firstCorrection, secondCorrection)).toEqual([]);

    const rewrittenPrefix = structuredClone(secondCorrection);
    rewrittenPrefix.events[0].corrections[0].explanation.en = "Rewritten old notice";
    expect(validatePublicHistory(firstCorrection, rewrittenPrefix)).toContain(
      `Changed event needs an appended, dated correction: ${firstCorrection.events[0].id}`,
    );

    const changedWithoutNotice = advance(syntheticRelease());
    changedWithoutNotice.events[0].title = { vi: "Không thông báo", en: "No notice" };
    expect(validatePublicHistory(syntheticRelease(), changedWithoutNotice)).toContain(
      `Changed event needs an appended, dated correction: ${changedWithoutNotice.events[0].id}`,
    );
  });

  it("keeps the event's original publishedAt immutable", () => {
    const previous = syntheticRelease();
    const next = advance(previous);
    const changedPublication = new Date(Date.parse(previous.publishedAt) + 6 * hour).toISOString();
    next.events[0].publishedAt = changedPublication;
    next.events[0].updatedAt = changedPublication;

    expect(publicReleaseSchema.safeParse(next).success).toBe(true);
    expect(validatePublicHistory(previous, next)).toContain(
      `Original publication changed: ${previous.events[0].id}`,
    );
  });

  it("requires a new evidence reference when occurrence precision changes or evidence is promoted", () => {
    const previous = syntheticRelease();
    previous.events[0].evidenceRef = "synthetic-old-evidence";

    const sameReferenceForDateChange = correctEvent(previous, (event) => {
      event.occurredOn = { precision: "day", value: "2026-02-12" };
    });
    expect(validatePublicHistory(previous, sameReferenceForDateChange)).toContain(
      `Date/evidence change needs a new review reference: ${previous.events[0].id}`,
    );

    const newReferenceForDateChange = correctEvent(previous, (event) => {
      event.occurredOn = { precision: "day", value: "2026-02-12" };
      event.evidenceRef = "synthetic-date-review";
    });
    expect(validatePublicHistory(previous, newReferenceForDateChange)).toEqual([]);

    const sameReferenceForPromotion = correctEvent(previous, (event) => {
      event.evidence = "verified";
    });
    expect(validatePublicHistory(previous, sameReferenceForPromotion)).toContain(
      `Date/evidence change needs a new review reference: ${previous.events[0].id}`,
    );

    const newReferenceForPromotion = correctEvent(previous, (event) => {
      event.evidence = "verified";
      event.evidenceRef = "synthetic-verification-review";
    });
    expect(validatePublicHistory(previous, newReferenceForPromotion)).toEqual([]);
  });

  it("rejects unsupported occurrence precision instead of silently promoting it", () => {
    const previous = syntheticRelease();
    const malformed = withInvalidEvent(advance(previous), (event) => {
      event.occurredOn = { precision: "year", value: "2026" };
    });

    expect(publicReleaseSchema.safeParse(malformed).success).toBe(false);
    expect(validatePublicHistory(previous, malformed)).toContain("Invalid next public release");
  });

  it("orders reports, occurrences, intervals, and month-only uncertainty without inventing a day", () => {
    const sameDay = syntheticRelease();
    sameDay.events[0].occurredOn = { precision: "day", value: "2026-03-02" };
    sameDay.events[0].reportedAsOf = "2026-03-02";
    sameDay.events[0].publishedAt = "2026-03-02T00:30:00Z";
    sameDay.events[0].updatedAt = sameDay.events[0].publishedAt;
    sameDay.publishedAt = "2026-03-02T01:00:00Z";
    sameDay.createdAt = "2026-03-02T00:00:00Z";
    expect(publicReleaseSchema.safeParse(sameDay).success).toBe(true);

    const delayedReport = syntheticRelease();
    delayedReport.events[0].occurredOn = { precision: "day", value: "2026-02-20" };
    delayedReport.events[0].reportedAsOf = "2026-03-01";
    expect(publicReleaseSchema.safeParse(delayedReport).success).toBe(true);

    const occurrenceAfterReport = structuredClone(delayedReport);
    occurrenceAfterReport.events[0].occurredOn = { precision: "day", value: "2026-03-02" };
    expect(publicReleaseSchema.safeParse(occurrenceAfterReport).success).toBe(false);

    const intervalAfterReport = structuredClone(delayedReport);
    intervalAfterReport.events[0].occurredUntil = { precision: "day", value: "2026-03-02" };
    expect(publicReleaseSchema.safeParse(intervalAfterReport).success).toBe(false);

    const reversedInterval = structuredClone(delayedReport);
    reversedInterval.events[0].occurredOn = { precision: "day", value: "2026-02-22" };
    reversedInterval.events[0].occurredUntil = { precision: "day", value: "2026-02-21" };
    expect(publicReleaseSchema.safeParse(reversedInterval).success).toBe(false);

    const knownMonth = structuredClone(delayedReport);
    knownMonth.events[0].occurredOn = { precision: "month", value: "2026-03" };
    knownMonth.events[0].reportedAsOf = "2026-03-02";
    expect(publicReleaseSchema.safeParse(knownMonth).success).toBe(true);

    const monthAfterReport = structuredClone(knownMonth);
    monthAfterReport.events[0].reportedAsOf = "2026-02-28";
    expect(publicReleaseSchema.safeParse(monthAfterReport).success).toBe(false);
  });

  it("rejects future non-planned events but accepts a dated plan with reviewed evidence", () => {
    const future = syntheticRelease();
    future.events[0].occurredOn = { precision: "day", value: "2026-03-10" };
    future.events[0].reportedAsOf = "2026-03-02";
    expect(publicReleaseSchema.safeParse(future).success).toBe(false);

    const planned = structuredClone(future);
    planned.events[0].evidence = "planned";
    planned.events[0].evidenceRef = "synthetic-plan-review";
    expect(publicReleaseSchema.safeParse(planned).success).toBe(true);
    expect(validatePublicHistory(null, planned)).toEqual([]);
  });

  it("does not mix fixture and live history", () => {
    const fixture = syntheticRelease();
    const mixed = advance(fixture);
    mixed.fixtureOnly = false;
    expect(validatePublicHistory(fixture, mixed)).toContain(
      "Fixture/public history cannot be mixed",
    );

    const liveFirst = syntheticRelease();
    liveFirst.fixtureOnly = false;
    const liveNext = advance(liveFirst);
    expect(validatePublicHistory(null, liveFirst)).toEqual([]);
    expect(validatePublicHistory(liveFirst, liveNext)).toEqual([]);
  });

  it("rejects duplicate IDs and reusing IDs already marked retired", () => {
    const previous = syntheticRelease();

    const duplicate = advance(previous);
    duplicate.pages.push({ ...duplicate.pages[0], id: duplicate.pages[0].id, slug: "second-page" });
    expect(publicReleaseSchema.safeParse(duplicate).success).toBe(false);
    expect(validatePublicHistory(previous, duplicate)).toContain("Invalid next public release");

    const reusedRetired = advance(previous);
    reusedRetired.media.push({
      ...structuredClone(reusedRetired.media[0]),
      id: reusedRetired.retiredIds[0],
    });
    expect(publicReleaseSchema.safeParse(reusedRetired).success).toBe(false);
    expect(validatePublicHistory(previous, reusedRetired)).toContain("Invalid next public release");
  });

  it("rejects changing an existing record's type while preserving its public ID", () => {
    const previous = syntheticRelease();
    previous.pages.push({
      id: "synthetic-second-page",
      slug: "second-page",
      title: exampleText,
      body: exampleText,
    });
    const next = advance(previous);
    next.pages = [structuredClone(previous.pages[1])];
    const hash = "b".repeat(64);
    next.media.push({
      ...structuredClone(previous.media[0]),
      id: previous.pages[0].id,
      derivatives: [
        { path: `/media/${hash}.webp`, sha256: hash, width: 80, height: 60, bytes: 12 },
      ],
    });

    expect(publicReleaseSchema.safeParse(next).success).toBe(true);
    expect(validatePublicHistory(previous, next)).toContain(
      `ID changed record type: ${previous.pages[0].id}`,
    );
  });
});

it("rejects malformed interval strings without throwing and retains overlap uncertainty", () => {
  const release = syntheticRelease();
  release.events[0].occurredUntil = { precision: "month", value: "invalid" };
  expect(() => publicReleaseSchema.safeParse(release)).not.toThrow();
  expect(publicReleaseSchema.safeParse(release).success).toBe(false);
  release.events[0].occurredOn = { precision: "day", value: "2026-02-20" };
  release.events[0].occurredUntil = { precision: "month", value: "2026-02" };
  expect(publicReleaseSchema.safeParse(release).success).toBe(true);
});
