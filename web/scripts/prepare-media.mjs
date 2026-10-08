import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const webRoot = await realpath(fileURLToPath(new URL("..", import.meta.url)));
const inside = (root, target) => target === root || target.startsWith(`${root}${path.sep}`);

// Maintainer-only preparation. Never publishes, changes originals or clears rights/privacy.
async function prepare(inputPath, outputPath) {
  const stat = await lstat(inputPath);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 50_000_000)
    throw new Error("Expected one regular image file no larger than 50 MB");
  const input = await readFile(inputPath);
  if (input.length > 50_000_000) throw new Error("Source grew beyond the input limit");
  const output = path.join(await realpath(path.dirname(outputPath)), path.basename(outputPath));
  if (inside(webRoot, output)) throw new Error("Staging must be outside the web application");
  const options = { limitInputPixels: 40_000_000, failOn: "warning", animated: false };
  const metadata = await sharp(input, options).metadata();
  if (
    !["jpeg", "png", "webp", "avif", "heif"].includes(metadata.format) ||
    (metadata.format === "heif" && metadata.compression !== "av1") ||
    (metadata.pages ?? 1) !== 1 ||
    !metadata.width ||
    !metadata.height ||
    metadata.width > 40_000_000 / metadata.height
  )
    throw new Error("Expected one bounded, still JPEG, PNG, WebP or AVIF image");

  const files = new Map();
  const derivatives = [];
  for (const bound of [640, 1280, 1920]) {
    for (const format of ["webp", "jpeg"]) {
      // Apply EXIF orientation before stripping metadata. Never call keep/withMetadata.
      let pipeline = sharp(input, options)
        .autoOrient()
        .resize({ width: bound, height: bound, fit: "inside", withoutEnlargement: true })
        .toColourspace("srgb");
      pipeline =
        format === "webp"
          ? pipeline.webp({ quality: 82, effort: 5 })
          : pipeline.flatten({ background: "#f7f5ef" }).jpeg({ quality: 85, mozjpeg: true });
      const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
      const check = await sharp(data).metadata();
      if (
        check.exif ||
        check.xmp ||
        check.iptc ||
        check.icc ||
        check.orientation ||
        (check.comments?.length ?? 0) > 0
      )
        throw new Error("Derivative unexpectedly contains source metadata");
      if (data.length > 20_000_000 || info.width > 1920 || info.height > 1920)
        throw new Error("Derivative exceeds publication dimensions or size");
      const sha256 = hash(data);
      const filename = `${sha256}.${format === "jpeg" ? "jpg" : format}`;
      if (!files.has(filename)) {
        files.set(filename, data);
        derivatives.push({
          path: `/media/${filename}`,
          sha256,
          width: info.width,
          height: info.height,
          bytes: data.length,
        });
      }
    }
  }
  const manifest = {
    schemaVersion: 1,
    kind: "private-media-staging",
    publication: "unpublished",
    sourceSha256: hash(input),
    sourceBytes: input.length,
    sourceFormat: metadata.format,
    sourceStoredWidth: metadata.width,
    sourceStoredHeight: metadata.height,
    sourceOrientation: metadata.orientation ?? null,
    pipeline: { sharp: sharp.versions.sharp, vips: sharp.versions.vips, bounds: [640, 1280, 1920] },
    rightsReview: null,
    privacyReview: null,
    capturedOn: null,
    note: "Pixel content still requires human review. Dates and rights are never inferred from EXIF.",
    derivatives,
  };
  // Exclusive new directory: no existing exports or original files can be overwritten.
  await mkdir(output);
  try {
    for (const [filename, bytes] of files)
      await writeFile(path.join(output, filename), bytes, { flag: "wx" });
    await writeFile(path.join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, {
      flag: "wx",
    });
  } catch (error) {
    await rm(output, { recursive: true, force: true });
    throw error;
  }
  return { derivatives: derivatives.length, sourceSha256: manifest.sourceSha256 };
}

if (process.argv.length !== 4) {
  console.error(
    "Usage: node scripts/prepare-media.mjs <original-image> <new-private-staging-directory>",
  );
  process.exitCode = 1;
} else {
  try {
    const result = await prepare(path.resolve(process.argv[2]), path.resolve(process.argv[3]));
    console.log(JSON.stringify({ ...result, publication: "unpublished" }));
  } catch {
    // Do not print private original paths or embedded metadata to CI/terminal logs.
    console.error(
      "Media preparation failed; check file type, limits and a new staging directory outside web.",
    );
    process.exitCode = 1;
  }
}
