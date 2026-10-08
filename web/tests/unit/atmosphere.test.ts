import { describe, expect, it } from "vitest";
import { ATMOSPHERE_PREFERENCE_KEY, resolveAtmosphere } from "../../src/lib/viewer/atmosphere";

describe("resolveAtmosphere", () => {
  it.each([
    ["05:59", 5, "night"],
    ["06:00", 6, "day"],
    ["17:59", 17, "day"],
    ["18:00", 18, "night"],
  ] as const)("uses the inclusive 06:00–18:00 UTC daylight window at %s", (clock, hour, period) => {
    const result = resolveAtmosphere("auto", new Date(`2026-10-08T${clock}:00Z`), "UTC");
    expect(result).toEqual({
      mode: "auto",
      period,
      hour,
      timeZone: "UTC",
      fallback: false,
    });
  });

  it("uses the explicitly supplied timezone even at opposite date-line extremes", () => {
    const instant = new Date("2026-01-01T16:30:00Z");
    expect(resolveAtmosphere("auto", instant, "Pacific/Kiritimati")).toMatchObject({
      period: "day",
      hour: 6,
      timeZone: "Pacific/Kiritimati",
      fallback: false,
    });
    expect(resolveAtmosphere("auto", instant, "Pacific/Pago_Pago")).toMatchObject({
      period: "night",
      hour: 5,
      timeZone: "Pacific/Pago_Pago",
      fallback: false,
    });
  });

  it("uses a 24-hour local clock at midnight", () => {
    expect(resolveAtmosphere("auto", new Date("2026-01-01T17:00:00Z"), "Asia/Ho_Chi_Minh")).toEqual(
      {
        mode: "auto",
        period: "night",
        hour: 0,
        timeZone: "Asia/Ho_Chi_Minh",
        fallback: false,
      },
    );
  });

  it("follows local wall time across the spring DST jump", () => {
    const beforeJump = resolveAtmosphere(
      "auto",
      new Date("2026-03-08T06:59:00Z"),
      "America/New_York",
    );
    const afterJump = resolveAtmosphere(
      "auto",
      new Date("2026-03-08T07:00:00Z"),
      "America/New_York",
    );

    expect(beforeJump).toMatchObject({ hour: 1, period: "night", fallback: false });
    expect(afterJump).toMatchObject({ hour: 3, period: "night", fallback: false });
  });

  it("labels invalid time or timezone as a daytime auto fallback", () => {
    expect(resolveAtmosphere("auto", new Date("invalid date"), "UTC")).toEqual({
      mode: "auto",
      period: "day",
      hour: null,
      timeZone: "UTC",
      fallback: true,
    });
    expect(resolveAtmosphere("auto", new Date("2026-10-08T12:00:00Z"), "Invalid/Zone")).toEqual({
      mode: "auto",
      period: "day",
      hour: null,
      timeZone: null,
      fallback: true,
    });
    expect(resolveAtmosphere("auto", new Date("2026-10-08T12:00:00Z"), null)).toEqual({
      mode: "auto",
      period: "day",
      hour: null,
      timeZone: null,
      fallback: true,
    });
  });

  it("preserves manual day/night choices without labeling them as fallbacks", () => {
    const date = new Date("2026-10-08T22:00:00Z");
    expect(resolveAtmosphere("day", date, "UTC")).toEqual({
      mode: "day",
      period: "day",
      hour: 22,
      timeZone: "UTC",
      fallback: false,
    });
    expect(resolveAtmosphere("night", date, "Invalid/Zone")).toEqual({
      mode: "night",
      period: "night",
      hour: null,
      timeZone: null,
      fallback: false,
    });
  });

  it("exports only the new namespaced atmosphere preference key", () => {
    expect(ATMOSPHERE_PREFERENCE_KEY).toBe("thachbi.public-visit.atmosphere.v1");
  });
});
