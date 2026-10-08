import { z } from "zod";
import {
  calendarDay,
  checksum,
  instant,
  localizedText,
  occurrenceDate,
  plainText,
  publicId,
  uniqueIds,
} from "./common";

const derivative = z
  .strictObject({
    path: z.string().regex(/^\/media\/[a-f0-9]{64}\.(avif|webp|jpg|png)$/),
    sha256: checksum,
    width: z.number().int().min(1).max(8192),
    height: z.number().int().min(1).max(8192),
    bytes: z.number().int().min(1).max(20000000),
  })
  .refine((asset) => /^\/media\/([a-f0-9]{64})\./.exec(asset.path)?.[1] === asset.sha256, {
    message: "Asset path and checksum disagree",
  });

const media = z.strictObject({
  id: publicId,
  category: z.enum(["site-photo", "design-render", "concept-art", "reference"]),
  caption: localizedText,
  alt: localizedText,
  attribution: plainText,
  capturedOn: occurrenceDate.nullable(),
  rights: z.literal("cleared"),
  rightsRef: publicId,
  derivatives: z.array(derivative).min(1).max(12),
});
const event = z
  .strictObject({
    id: publicId,
    slug: publicId,
    title: localizedText,
    body: localizedText,
    occurredOn: occurrenceDate.nullable(),
    reportedAsOf: calendarDay.nullable(),
    evidence: z.enum(["planned", "owner-reported", "verified"]),
    evidenceRef: publicId.nullable(),
    mediaIds: uniqueIds,
    workPackageRef: publicId.nullable(),
    designReleaseRef: publicId.nullable(),
    publishedAt: instant,
    updatedAt: instant,
    status: z.enum(["published", "corrected", "withdrawn"]),
    corrections: z
      .array(
        z.strictObject({
          previousReleaseId: publicId,
          changedAt: instant,
          explanation: localizedText,
        }),
      )
      .max(100),
  })
  .superRefine((item, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });
    if (item.evidence === "verified" && item.evidenceRef === null)
      issue("Verification needs evidence");
    if (item.occurredOn === null && item.reportedAsOf === null) issue("A date basis is required");
    if (Date.parse(item.updatedAt) < Date.parse(item.publishedAt))
      issue("Update precedes publication");
    if (item.status !== "published" && item.corrections.length === 0)
      issue("A correction notice is required");
    for (const change of item.corrections) {
      if (
        Date.parse(change.changedAt) < Date.parse(item.publishedAt) ||
        Date.parse(change.changedAt) > Date.parse(item.updatedAt)
      )
        issue("Correction outside event history");
    }
  });

export const publicReleaseSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    kind: z.literal("public-content"),
    fixtureOnly: z.boolean(),
    releaseId: publicId,
    sourceRevision: publicId,
    locales: z.tuple([z.literal("vi"), z.literal("en")]),
    createdAt: instant,
    publishedAt: instant,
    publication: z.literal("published"),
    reviewRef: publicId,
    pages: z
      .array(
        z.strictObject({ id: publicId, slug: publicId, title: localizedText, body: localizedText }),
      )
      .max(100),
    media: z.array(media).max(1000),
    events: z.array(event).max(10000),
    retiredIds: uniqueIds,
  })
  .superRefine((release, ctx) => {
    const issue = (message: string) => ctx.addIssue({ code: "custom", message });
    const live = [...release.pages, ...release.media, ...release.events].map((record) => record.id);
    if (new Set(live).size !== live.length) issue("Duplicate public ID");
    if (release.retiredIds.some((id) => live.includes(id))) issue("Retired ID reused");
    for (const records of [release.pages, release.events]) {
      if (new Set(records.map((record) => record.slug)).size !== records.length)
        issue("Duplicate slug");
    }
    if (Date.parse(release.createdAt) > Date.parse(release.publishedAt))
      issue("Publication precedes creation");
    const mediaIds = new Set(release.media.map((record) => record.id));
    for (const item of release.events) {
      if (item.mediaIds.some((id) => !mediaIds.has(id))) issue("Unknown media reference");
      if (Date.parse(item.updatedAt) > Date.parse(release.publishedAt))
        issue("Event newer than release");
      if (item.corrections.some((c) => c.previousReleaseId === release.releaseId))
        issue("Self correction reference");
    }
  });
export type PublicRelease = z.infer<typeof publicReleaseSchema>;

export const publicPointerSchema = z.discriminatedUnion("state", [
  z.strictObject({
    schemaVersion: z.literal(1),
    state: z.literal("unpublished"),
    releaseId: z.null(),
    sha256: z.null(),
  }),
  z.strictObject({
    schemaVersion: z.literal(1),
    state: z.literal("published"),
    releaseId: publicId,
    sha256: checksum,
  }),
]);
