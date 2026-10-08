import { z } from "zod";

export const publicId = z.string().regex(/^[a-z][a-z0-9-]{2,79}$/);
export const checksum = z.string().regex(/^[a-f0-9]{64}$/);
export const plainText = z
  .string()
  .min(1)
  .max(12000)
  .refine((s) => s.trim().length > 0);
export const localizedText = z.strictObject({ vi: plainText, en: plainText });
export const calendarDay = z
  .string()
  .regex(/^[1-9]\d{3}-\d{2}-\d{2}$/)
  .refine((value) => {
    const time = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value;
  });
export const calendarMonth = z.string().regex(/^[1-9]\d{3}-(0[1-9]|1[0-2])$/);
export const occurrenceDate = z.discriminatedUnion("precision", [
  z.strictObject({ precision: z.literal("month"), value: calendarMonth }),
  z.strictObject({ precision: z.literal("day"), value: calendarDay }),
]);
export type OccurrenceDate = z.infer<typeof occurrenceDate>;
export function earliestDay(date: OccurrenceDate) {
  return `${date.value}${date.precision === "month" ? "-01" : ""}`;
}
export function latestDay(date: OccurrenceDate) {
  if (date.precision === "day") return date.value;
  // Refinements may still run after a nested regex error. Keep safeParse non-throwing.
  if (!calendarMonth.safeParse(date.value).success) return date.value;
  const [year, month] = date.value.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}
export function churchDay(timestamp: string) {
  if (!Number.isFinite(Date.parse(timestamp))) return null;
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(timestamp));
  const part = (type: string) => parts.find((entry) => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export const instant = z.iso
  .datetime({ offset: true })
  .refine(
    (value) =>
      calendarDay.safeParse(value.slice(0, 10)).success && Number.isFinite(Date.parse(value)),
  );
export const uniqueIds = z
  .array(publicId)
  .max(10000)
  .refine((ids) => new Set(ids).size === ids.length);
