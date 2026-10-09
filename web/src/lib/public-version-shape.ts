export type PublicVersion = {
  state: "published" | "unpublished";
  releaseId: string | null;
  sha256: string | null;
  publishedAt: string | null;
  latestEventAt: string | null;
};
export function versionKey(version: PublicVersion) {
  return version.sha256 ?? "unpublished";
}
// Small public wire allowlist; avoids shipping server schemas/hash code to readers.
export function parsePublicVersion(input: unknown): PublicVersion | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const value = input as Record<string, unknown>;
  const fields = ["state", "releaseId", "sha256", "publishedAt", "latestEventAt"];
  if (Object.keys(value).length !== fields.length || fields.some((key) => !(key in value)))
    return null;
  if (value.state === "unpublished")
    return fields.slice(1).every((key) => value[key] === null) ? (value as PublicVersion) : null;
  const instant = (v: unknown) =>
    typeof v === "string" &&
    v.length <= 40 &&
    /(?:Z|[+-]\d{2}:\d{2})$/.test(v) &&
    Number.isFinite(Date.parse(v));
  if (
    value.state !== "published" ||
    typeof value.releaseId !== "string" ||
    !/^[a-z][a-z0-9-]{2,79}$/.test(value.releaseId) ||
    typeof value.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.sha256) ||
    !instant(value.publishedAt) ||
    (value.latestEventAt !== null && !instant(value.latestEventAt))
  )
    return null;
  return value as PublicVersion;
}
export const POLL_MS = 60_000;
export function retryDelay(failures: number) {
  return Math.min(300_000, POLL_MS * 2 ** Math.min(Math.max(failures - 1, 0), 3));
}
