import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import sharp from "sharp";

const root = fileURLToPath(new URL("..", import.meta.url));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function regularFiles(directory, prefix = "") {
  const stat = await lstat(directory).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  if (stat === null) return [];
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Invalid asset directory");
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory())
      files.push(...(await regularFiles(path.join(directory, entry.name), relative)));
    else if (entry.isFile()) files.push(relative);
    else throw new Error("Invalid asset entry");
  }
  return files;
}

try {
  const pointer = JSON.parse(await readFile(path.join(root, "content/current.json"), "utf8"));
  const release = JSON.parse(await readFile(path.join(root, "content/release.json"), "utf8"));
  const assets = new Map();
  if (pointer.state === "unpublished") {
    if (release !== null) throw new Error("Unpublished release mismatch");
  } else if (
    pointer.state === "published" &&
    release?.fixtureOnly === false &&
    Array.isArray(release.media)
  ) {
    for (const media of release.media) {
      for (const asset of media.derivatives) {
        const match = /^\/media\/([a-f0-9]{64})\.(avif|webp|jpg|png)$/.exec(asset.path);
        if (!match || match[1] !== asset.sha256) throw new Error("Invalid asset path");
        const previous = assets.get(asset.path);
        if (
          previous &&
          ["sha256", "width", "height", "bytes"].some((key) => previous[key] !== asset[key])
        )
          throw new Error("Conflicting asset descriptions");
        assets.set(asset.path, asset);
      }
    }
  } else throw new Error("Invalid release state");
  const visit = await readFile(path.join(root, "content/visit.json"), "utf8")
    .then(JSON.parse)
    .catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
  if (visit !== null) {
    if (
      pointer.state !== "published" ||
      Object.keys(visit).sort().join(",") !== "bytes,decodedBytes,path,sha256,sourceRevision" ||
      !/^[a-f0-9]{7,40}$/.test(visit.sourceRevision) ||
      !/^[a-f0-9]{64}$/.test(visit.sha256) ||
      visit.path !== `/models/${visit.sha256}.glb.gz` ||
      !Number.isInteger(visit.bytes) ||
      visit.bytes < 1 ||
      visit.bytes > 10_000_000 ||
      !Number.isInteger(visit.decodedBytes) ||
      visit.decodedBytes < 20 ||
      visit.decodedBytes > 150_000_000
    )
      throw new Error("Invalid model manifest");
    const filename = path.join(root, "public", visit.path);
    const stat = await lstat(filename);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size !== visit.bytes)
      throw new Error("Invalid model file");
    const packed = await readFile(filename);
    if (sha256(packed) !== visit.sha256) throw new Error("Model checksum mismatch");
    const glb = gunzipSync(packed, { maxOutputLength: 150_000_000 });
    if (
      glb.length !== visit.decodedBytes ||
      glb.readUInt32LE(0) !== 0x46546c67 ||
      glb.readUInt32LE(4) !== 2 ||
      glb.readUInt32LE(8) !== glb.length ||
      glb.readUInt32LE(16) !== 0x4e4f534a
    )
      throw new Error("Invalid GLB");
    const text = glb.subarray(20, 20 + glb.readUInt32LE(12)).toString("utf8");
    const data = JSON.parse(text);
    if (/Thach_Bi_Viewer|docs\/|\/Users\/|ENGINEERING_PRIVATE|localStorage/.test(text))
      throw new Error("Private model metadata");
    function check(node) {
      if (!node || typeof node !== "object") return;
      if (Object.hasOwn(node, "extras") || Object.hasOwn(node, "uri"))
        throw new Error("Unexpected external model resource or metadata");
      for (const value of Object.values(node)) check(value);
    }
    check(data);
    if (data.asset?.version !== "2.0" || !data.nodes?.length || !data.meshes?.length)
      throw new Error("Empty model");
  }
  const files = await regularFiles(path.join(root, "public"));
  if (
    files.length !== assets.size + (visit ? 1 : 0) ||
    files.some((file) => !assets.has(file) && file !== visit?.path)
  )
    throw new Error("Public files disagree with release");
  for (const [name, asset] of assets) {
    const filename = path.join(root, "public", name);
    const stat = await lstat(filename);
    if (
      !stat.isFile() ||
      stat.isSymbolicLink() ||
      stat.size !== asset.bytes ||
      stat.size > 20_000_000
    )
      throw new Error("Invalid asset file");
    const bytes = await readFile(filename);
    if (sha256(bytes) !== asset.sha256) throw new Error("Asset checksum mismatch");
    const metadata = await sharp(bytes, {
      limitInputPixels: 40_000_000,
      failOn: "warning",
    }).metadata();
    const expected = { jpg: "jpeg", png: "png", webp: "webp", avif: "heif" }[name.split(".").pop()];
    if (
      metadata.format !== expected ||
      (expected === "heif" && metadata.compression !== "av1") ||
      metadata.width !== asset.width ||
      metadata.height !== asset.height ||
      (metadata.pages ?? 1) !== 1 ||
      metadata.exif ||
      metadata.xmp ||
      metadata.iptc ||
      metadata.icc ||
      metadata.orientation ||
      (metadata.comments?.length ?? 0) > 0
    )
      throw new Error("Invalid image encoding, dimensions or metadata");
    // Force a complete decode too: metadata alone can accept a truncated pixel stream.
    await sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" }).stats();
  }
  console.log(
    JSON.stringify({
      publicAssets: assets.size,
      checks: "bytes, hash, type, dimensions, metadata, decode, exact file inventory",
    }),
  );
} catch {
  // Build logs must not disclose original filenames, internal paths or metadata.
  console.error(
    "Public media validation failed. Check the release and its exact reviewed derivatives.",
  );
  process.exitCode = 1;
}
