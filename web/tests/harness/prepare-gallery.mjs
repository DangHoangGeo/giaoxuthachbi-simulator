// Isolated presentation test build. Never run as a publication/deployment command.
import { createHash } from "node:crypto";
import { cp, mkdir, readFile, realpath, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const web = await realpath(fileURLToPath(new URL("../..", import.meta.url)));
if (process.argv.length !== 3)
  throw new Error("Pass a new temporary harness directory outside web");
const target = path.join(
  await realpath(path.dirname(path.resolve(process.argv[2]))),
  path.basename(process.argv[2]),
);
if (target === web || target.startsWith(`${web}${path.sep}`))
  throw new Error("Harness must be outside web");
await mkdir(target);
for (const item of [
  "src",
  "tsconfig.json",
  "next-env.d.ts",
  "postcss.config.mjs",
  "next.config.ts",
  "package.json",
]) {
  await cp(path.join(web, item), path.join(target, item), { recursive: true });
}
const config = path.join(target, "next.config.ts");
await writeFile(config, (await readFile(config, "utf8")).replace('output: "standalone",', ""));
await symlink(path.join(web, "node_modules"), path.join(target, "node_modules"), "dir");
await mkdir(path.join(target, "content"));
await mkdir(path.join(target, "public/media"), { recursive: true });
const media = [];
for (const [index, category] of [
  "site-photo",
  "design-render",
  "concept-art",
  "reference",
].entries()) {
  const derivatives = [];
  for (const width of [640, 1280]) {
    for (const format of ["webp", "jpeg"]) {
      const bytes = await sharp({
        create: {
          width,
          height: (width * 3) / 4,
          channels: 3,
          background: ["#315b45", "#996d3e", "#715673", "#536d86"][index],
        },
      })
        .toFormat(format)
        .toBuffer();
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      const filename = `${sha256}.${format === "jpeg" ? "jpg" : format}`;
      await writeFile(path.join(target, "public/media", filename), bytes);
      derivatives.push({
        path: `/media/${filename}`,
        sha256,
        width,
        height: (width * 3) / 4,
        bytes: bytes.length,
      });
    }
  }
  media.push({
    id: `synthetic-${category}`,
    category,
    caption: {
      vi: `Ví dụ kiểm thử ${index + 1} — không phải hình nhà thờ`,
      en: `Synthetic example ${index + 1} — no church evidence`,
    },
    alt: { vi: "Mảng màu kiểm thử", en: "Synthetic solid color test swatch" },
    attribution: "Synthetic test generator; no parish image",
    capturedOn:
      index === 0
        ? { precision: "month", value: "2026-02" }
        : index === 1
          ? { precision: "day", value: "2026-03-04" }
          : null,
    rights: "cleared",
    rightsRef: "synthetic-rights-ref",
    derivatives,
  });
}
const fixture = {
  schemaVersion: 1,
  kind: "public-content",
  fixtureOnly: true,
  releaseId: "synthetic-gallery-release",
  sourceRevision: "synthetic-source",
  locales: ["vi", "en"],
  createdAt: "2026-03-01T01:00:00Z",
  publishedAt: "2026-03-05T01:00:00Z",
  publication: "published",
  reviewRef: "synthetic-review",
  pages: [
    {
      id: "synthetic-intro",
      slug: "introduction",
      title: { vi: "Nội dung kiểm thử", en: "Synthetic presentation test" },
      body: {
        vi: "Không phải thông tin giáo xứ. <script>window.harnessInjection=1</script>",
        en: "No parish facts. <script>window.harnessInjection=1</script>",
      },
    },
  ],
  media,
  events: [],
  retiredIds: [],
};
// Deliberately synthetic history, including imprecise dates and a retained withdrawal.
fixture.events = Array.from({ length: 45 }, (_, index) => ({
  id: `synthetic-event-${String(index + 1).padStart(3, "0")}`,
  slug: `synthetic-update-${String(index + 1).padStart(3, "0")}`,
  title: { vi: `Cập nhật kiểm thử ${index + 1}`, en: `Synthetic update ${index + 1}` },
  body: {
    vi: "Nội dung kiểm thử, không phải dữ kiện công trường.",
    en: "Synthetic presentation data, not a site construction fact.",
  },
  occurredOn:
    index === 0
      ? { precision: "month", value: "2026-02" }
      : index === 1
        ? null
        : { precision: "day", value: `2026-02-${String((index % 28) + 1).padStart(2, "0")}` },
  occurredUntil: null,
  timeZone: "Asia/Ho_Chi_Minh",
  reportedAsOf: "2026-03-01",
  evidence: "owner-reported",
  evidenceRef: null,
  mediaIds: index === 0 ? [media[0].id] : [],
  workPackageRef: null,
  designReleaseRef: null,
  publishedAt: "2026-03-02T01:00:00Z",
  updatedAt: index === 2 ? "2026-03-04T01:00:00Z" : "2026-03-02T01:00:00Z",
  status: index === 2 ? "withdrawn" : "published",
  corrections:
    index === 2
      ? [
          {
            previousReleaseId: "synthetic-before-withdrawal",
            changedAt: "2026-03-04T01:00:00Z",
            explanation: {
              vi: "Rút nội dung kiểm thử để minh họa.",
              en: "Synthetic withdrawal notice for presentation testing.",
            },
          },
        ]
      : [],
}));
await writeFile(path.join(target, "content/release.json"), JSON.stringify(fixture));
await writeFile(
  path.join(target, "src/lib/server/public-content.ts"),
  `import "server-only";\nimport fixture from "../../../content/release.json";\nimport { publicReleaseSchema } from "../contracts/public-content";\nimport type { PublicContentResult } from "./public-validation";\n// TEST COPY ONLY: bypass publication reader for isolated presentation coverage.\nexport function readPublicContent(): PublicContentResult { return { state: "published", release: publicReleaseSchema.parse(fixture) }; }\n`,
);
const layout = path.join(target, "src/app/[locale]/layout.tsx");
await writeFile(
  layout,
  (await readFile(layout, "utf8")).replace(
    "<body>{children}</body>",
    '<body><aside aria-label="Synthetic test build"><p style={{padding: "8px", background: "#fff", color: "#000"}}>SYNTHETIC TEST BUILD — NO CHURCH EVIDENCE</p></aside>{children}</body>',
  ),
);
console.log(
  JSON.stringify({
    kind: "isolated-synthetic-gallery-harness",
    fixtureOnly: true,
    images: media.length,
    target,
  }),
);
