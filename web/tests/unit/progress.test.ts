import { describe, expect, it } from "vitest";
import type { OccurrenceDate } from "../../src/lib/contracts/common";
import type { PublicEvent } from "../../src/lib/progress";
import {
  dateLabel,
  eventBasis,
  PAGE_SIZE,
  progressQuery,
  progressWords,
  timeline,
  timelineQuery,
} from "../../src/lib/progress";
import { syntheticRelease } from "../fixtures/public-release";

function eventAt(id: string, occurredOn: OccurrenceDate | null, publishedAt: string): PublicEvent {
  const event = structuredClone(syntheticRelease().events[0]);
  return {
    ...event,
    id,
    slug: id,
    occurredOn,
    occurredUntil: null,
    reportedAsOf: "2026-03-01",
    publishedAt,
    updatedAt: publishedAt,
  };
}

describe("progress date labels and timeline basis", () => {
  it("formats month and day precision without inventing a day for month-only evidence", () => {
    expect(dateLabel({ precision: "month", value: "2026-02" }, "en")).toBe("February 2026");
    expect(dateLabel({ precision: "day", value: "2026-02-20" }, "en")).toBe("20 February 2026");
    expect(dateLabel({ precision: "month", value: "2026-02" }, "vi")).toBe("tháng 2 năm 2026");
  });

  it("uses the interval endpoint for ordering and keeps unknown occurrence visibly unknown", () => {
    const intervalStart: OccurrenceDate = { precision: "day", value: "2026-02-20" };
    const interval = eventAt("interval-example", intervalStart, "2026-03-01T01:00:00Z");
    const intervalEnd: OccurrenceDate = { precision: "day", value: "2026-03-02" };
    interval.occurredUntil = intervalEnd;
    expect(eventBasis(interval)).toBe("2026-03-02");
    expect(dateLabel(intervalStart, "en")).toBe("20 February 2026");
    expect(dateLabel(intervalEnd, "en")).toBe("2 March 2026");

    const unknown = eventAt("unknown-example", null, "2026-03-01T01:00:00Z");
    expect(eventBasis(unknown)).toBe("2026-03-01");
    expect(progressWords.en.unknown).toBe("Exact occurrence date unknown");
  });

  it("breaks same-day ties deterministically by ID in either sort direction", () => {
    const sameDay = { precision: "day", value: "2026-02-20" } as const;
    const events = [
      eventAt("tie-b", sameDay, "2026-03-01T02:00:00Z"),
      eventAt("tie-a", sameDay, "2026-03-01T01:00:00Z"),
    ];
    const oldest = timeline(events, { sort: "oldest", year: "", page: 1 });
    const newest = timeline(events, { sort: "newest", year: "", page: 1 });

    expect(oldest.groups.flatMap((group) => group.events.map((event) => event.id))).toEqual([
      "tie-a",
      "tie-b",
    ]);
    expect(newest.groups.flatMap((group) => group.events.map((event) => event.id))).toEqual([
      "tie-b",
      "tie-a",
    ]);
  });

  it("orders by occurrence rather than upload/publication time", () => {
    const earlyOccurrence = eventAt(
      "occurrence-early",
      { precision: "day", value: "2026-01-10" },
      "2026-03-01T03:00:00Z",
    );
    const laterOccurrence = eventAt(
      "occurrence-later",
      { precision: "day", value: "2026-02-10" },
      "2026-02-11T03:00:00Z",
    );

    const newest = timeline([earlyOccurrence, laterOccurrence], {
      sort: "newest",
      year: "",
      page: 1,
    });
    expect(newest.groups.flatMap((group) => group.events.map((event) => event.id))).toEqual([
      "occurrence-later",
      "occurrence-early",
    ]);
  });

  it("paginates more than two pages, clamps the requested page, and leaves source events unchanged", () => {
    const events = Array.from({ length: 45 }, (_, index) =>
      eventAt(
        `progress-${String(index).padStart(2, "0")}`,
        { precision: "day", value: "2026-02-20" },
        "2026-03-01T01:00:00Z",
      ),
    );
    const original = events.map((event) => ({ id: event.id, title: structuredClone(event.title) }));

    const first = timeline(events, { sort: "newest", year: "", page: 1 });
    const second = timeline(events, { sort: "newest", year: "", page: 2 });
    const third = timeline(events, { sort: "newest", year: "", page: 3 });
    const clamped = timeline(events, { sort: "newest", year: "", page: 9999 });

    expect(PAGE_SIZE).toBe(20);
    expect(first.total).toBe(45);
    expect(first.pageCount).toBe(3);
    expect(first.groups.flatMap((group) => group.events)).toHaveLength(20);
    expect(second.groups.flatMap((group) => group.events)).toHaveLength(20);
    expect(third.groups.flatMap((group) => group.events)).toHaveLength(5);
    expect(clamped.page).toBe(3);
    expect(clamped.groups).toEqual(third.groups);
    expect(events.map((event) => ({ id: event.id, title: event.title }))).toEqual(original);
  });

  it("accepts supported years and normalizes hostile query values", () => {
    const events = [
      eventAt("year-2026", { precision: "month", value: "2026-02" }, "2026-03-01T01:00:00Z"),
      eventAt("year-2025", null, "2025-12-31T01:00:00Z"),
      eventAt("year-2024", { precision: "day", value: "2024-06-15" }, "2026-03-01T01:00:00Z"),
    ];
    events[1].reportedAsOf = "2025-12-31";

    const all = timeline(events, timelineQuery({}));
    expect(all.years).toEqual(["2026", "2025", "2024"]);
    expect(timeline(events, timelineQuery({ year: "2025" })).total).toBe(1);
    expect(timeline(events, timelineQuery({ year: "1900" })).total).toBe(0);

    expect(timelineQuery({ sort: "oldest", year: "../../2026", page: "0002" })).toEqual({
      sort: "oldest",
      year: "",
      page: 1,
    });
    expect(timelineQuery({ sort: ["oldest"], year: ["2026"], page: ["2"] })).toEqual({
      sort: "newest",
      year: "",
      page: 1,
    });
    expect(timelineQuery({ year: "2026", page: "9999" })).toEqual({
      sort: "newest",
      year: "2026",
      page: 9999,
    });
    expect(progressQuery({ sort: "oldest", year: "2026", page: 2 })).toBe(
      "?sort=oldest&year=2026&page=2",
    );
  });
});
