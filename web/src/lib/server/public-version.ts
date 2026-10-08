import type { PublicVersion } from "../public-version-shape";
import { type PublicContentResult, publicReleaseHash } from "./public-validation";
export function publicVersion(
  content: Exclude<PublicContentResult, { state: "unavailable" }>,
): PublicVersion {
  if (content.state === "unpublished")
    return {
      state: "unpublished",
      releaseId: null,
      sha256: null,
      publishedAt: null,
      latestEventAt: null,
    };
  const { release } = content;
  return {
    state: "published",
    releaseId: release.releaseId,
    sha256: publicReleaseHash(release),
    publishedAt: release.publishedAt,
    latestEventAt: release.events.reduce<string | null>(
      (latest, event) =>
        !latest || Date.parse(event.updatedAt) > Date.parse(latest) ? event.updatedAt : latest,
      null,
    ),
  };
}
export function versionResponse(content: PublicContentResult, ifNoneMatch: string | null) {
  const headers = { "Cache-Control": "no-store, max-age=0", "X-Content-Type-Options": "nosniff" };
  if (content.state === "unavailable")
    return Response.json({ state: "unavailable" }, { status: 503, headers });
  const version = publicVersion(content),
    etag = `"${version.sha256 ?? "unpublished"}"`;
  if (
    ifNoneMatch
      ?.split(",")
      .map((tag) => tag.trim().replace(/^W\//, ""))
      .includes(etag)
  )
    return new Response(null, { status: 304, headers: { ...headers, ETag: etag } });
  return Response.json(version, { headers: { ...headers, ETag: etag } });
}
