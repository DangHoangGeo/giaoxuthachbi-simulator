export const ATMOSPHERE_PREFERENCE_KEY = "thachbi.public-visit.atmosphere.v1";

export type AtmosphereMode = "auto" | "day" | "night";
export type AtmospherePeriod = "day" | "night";

export type ResolvedAtmosphere = {
  mode: AtmosphereMode;
  period: AtmospherePeriod;
  hour: number | null;
  timeZone: string | null;
  fallback: boolean;
};

function localClock(date: Date, timeZone: string | null) {
  if (!timeZone) return { hour: null, timeZone: null };

  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone,
      hour: "2-digit",
      hourCycle: "h23",
    });
    if (!Number.isFinite(date.getTime())) return { hour: null, timeZone };

    const hour = Number(formatter.formatToParts(date).find((part) => part.type === "hour")?.value);
    return Number.isInteger(hour) && hour >= 0 && hour <= 23
      ? { hour, timeZone }
      : { hour: null, timeZone };
  } catch {
    return { hour: null, timeZone: null };
  }
}

export function resolveAtmosphere(
  mode: AtmosphereMode,
  date: Date,
  timeZone: string | null,
): ResolvedAtmosphere {
  const selectedMode: AtmosphereMode = mode === "day" || mode === "night" ? mode : "auto";
  const local = localClock(date, timeZone);
  const fallback = selectedMode === "auto" && local.hour === null;
  const period: AtmospherePeriod =
    selectedMode === "day" || fallback
      ? "day"
      : selectedMode === "night"
        ? "night"
        : local.hour !== null && local.hour >= 6 && local.hour < 18
          ? "day"
          : "night";

  return {
    mode: selectedMode,
    period,
    hour: local.hour,
    timeZone: local.timeZone,
    fallback,
  };
}
