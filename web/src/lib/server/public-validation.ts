import { createHash } from "node:crypto";
import {
  type PublicRelease,
  publicPointerSchema,
  publicReleaseSchema,
} from "../contracts/public-content.ts";

// Defined here, rather than JSON.stringify key insertion order, for reproducible maintainer hashes.
// Input is schema-validated JSON: no undefined, non-finite numbers, prototypes or cycles.
function orderedJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(orderedJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${orderedJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
export function publicReleaseHash(release: PublicRelease): string {
  return createHash("sha256")
    .update(orderedJson(publicReleaseSchema.parse(release)))
    .digest("hex");
}
export type PublicContentResult =
  | { state: "unpublished" }
  | { state: "unavailable" }
  | { state: "published"; release: PublicRelease };

// Pure validation, no I/O, paths, auth or logging. Invalid data never enters the response.
export function resolvePublicContent(
  pointerInput: unknown,
  releaseInput: unknown,
): PublicContentResult {
  const pointer = publicPointerSchema.safeParse(pointerInput);
  if (!pointer.success) return { state: "unavailable" };
  if (pointer.data.state === "unpublished") {
    return releaseInput === null ? { state: "unpublished" } : { state: "unavailable" };
  }
  const candidate = publicReleaseSchema.safeParse(releaseInput);
  if (
    !candidate.success ||
    candidate.data.fixtureOnly ||
    candidate.data.releaseId !== pointer.data.releaseId ||
    publicReleaseHash(candidate.data) !== pointer.data.sha256
  )
    return { state: "unavailable" };
  return { state: "published", release: candidate.data };
}
