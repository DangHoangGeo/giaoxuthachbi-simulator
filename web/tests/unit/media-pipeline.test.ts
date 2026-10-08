import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const prepareScript = path.join(webRoot, "scripts/prepare-media.mjs");
const checkMediaScript = path.join(webRoot, "scripts/check-media.mjs");
const sha256 = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

let scratchRoot: string;

beforeAll(async () => {
  scratchRoot = await mkdtemp(path.join(os.tmpdir(), "thach-bi-media-tests-"));
});

afterAll(async () => {
  await rm(scratchRoot, { recursive: true, force: true });
});

function tempDir(prefix: string) {
  return mkdtemp(path.join(scratchRoot, `${prefix}-`));
}

function runNode(script: string, args: string[], cwd = webRoot) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    timeout: 60_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

function expectRedactedFailure(
  result: ReturnType<typeof runNode>,
  root: string,
  privateTokens: string[] = [],
) {
  const output = `${result.stdout}${result.stderr}`;
  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
  expect(result.stderr).toContain("failed");
  expect(output).not.toContain(root);
  for (const token of privateTokens) expect(output).not.toContain(token);
}

async function syntheticPng(width = 24, height = 12) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 180, g: 95, b: 42 } },
  })
    .png()
    .toBuffer();
}

async function syntheticLargePng(width = 2400, height = 1200) {
  return sharp({
    create: { width, height, channels: 3, background: { r: 72, g: 116, b: 164 } },
  })
    .png()
    .toBuffer();
}

function meanRgb(
  pixels: Buffer,
  info: { width: number; channels: number },
  startY: number,
  endY: number,
) {
  const sums = [0, 0, 0];
  let count = 0;
  for (let y = startY; y < endY; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      for (let channel = 0; channel < 3; channel += 1) sums[channel] += pixels[offset + channel];
      count += 1;
    }
  }
  return sums.map((sum) => sum / count);
}

async function syntheticAnimatedWebp() {
  const width = 8;
  const pageHeight = 8;
  const pixels = Buffer.alloc(width * pageHeight * 2 * 3);
  for (let y = 0; y < pageHeight * 2; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 3;
      pixels[offset] = y < pageHeight ? 255 : 0;
      pixels[offset + 1] = 24;
      pixels[offset + 2] = y < pageHeight ? 0 : 255;
    }
  }
  return sharp(pixels, {
    raw: { width, height: pageHeight * 2, channels: 3, pageHeight },
  })
    .webp({ loop: 0, delay: [100, 100] })
    .toBuffer();
}

async function makePublishedApp() {
  const root = await tempDir("media-check-app");
  await mkdir(path.join(root, "content"), { recursive: true });
  await mkdir(path.join(root, "public"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await copyFile(checkMediaScript, path.join(root, "scripts/check-media.mjs"));
  await symlink(path.join(webRoot, "node_modules"), path.join(root, "node_modules"), "dir");
  return root;
}

async function installAsset(
  root: string,
  bytes: Buffer,
  extension: "jpg" | "png" | "webp" = "webp",
  options: { writeFile?: boolean; width?: number; height?: number } = {},
) {
  const metadata = await sharp(bytes).metadata();
  const digest = sha256(bytes);
  const filename = `${digest}.${extension}`;
  const asset = {
    path: `/media/${filename}`,
    sha256: digest,
    width: options.width ?? metadata.width ?? 0,
    height: options.height ?? metadata.height ?? 0,
    bytes: bytes.length,
  };
  const publicMedia = path.join(root, "public/media");
  await mkdir(publicMedia, { recursive: true });
  if (options.writeFile !== false) await writeFile(path.join(publicMedia, filename), bytes);
  await writeFile(
    path.join(root, "content/current.json"),
    `${JSON.stringify({ schemaVersion: 1, state: "published", releaseId: "synthetic-release" })}\n`,
  );
  await writeFile(
    path.join(root, "content/release.json"),
    `${JSON.stringify({ fixtureOnly: false, media: [{ derivatives: [asset] }] })}\n`,
  );
  return { asset, filename, filePath: path.join(publicMedia, filename) };
}

function runMediaCheck(root: string) {
  return runNode(path.join(root, "scripts/check-media.mjs"), [], root);
}

describe("private media preparation CLI", () => {
  it("auto-rotates synthetic EXIF input, strips metadata, and deduplicates small derivatives", async () => {
    const testRoot = await tempDir("prepare-oriented");
    const sourcePath = path.join(testRoot, "synthetic-oriented.jpg");
    const outputPath = path.join(testRoot, "staging");
    const width = 24;
    const height = 12;
    const pixels = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 3;
        const isLeftHalf = x < width / 2;
        pixels[offset] = isLeftHalf ? 240 : 20;
        pixels[offset + 1] = isLeftHalf ? 24 : 40;
        pixels[offset + 2] = isLeftHalf ? 20 : 240;
      }
    }
    const source = await sharp(pixels, { raw: { width, height, channels: 3 } })
      .withMetadata({ orientation: 6 })
      .withExif({
        IFD0: { Artist: "synthetic metadata test only" },
        // Invented coordinates exist only to prove that the complete EXIF block is removed.
        IFD3: {
          GPSLatitude: "1/1,2/1,3/1",
          GPSLongitude: "4/1,5/1,6/1",
        },
      })
      .withXmp("<x:xmpmeta>synthetic fixture, no personal data</x:xmpmeta>")
      .withIccProfile("srgb")
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
      .toBuffer();
    const sourceMetadata = await sharp(source).metadata();
    expect(sourceMetadata.format).toBe("jpeg");
    expect(sourceMetadata.orientation).toBe(6);
    expect(sourceMetadata.exif).toBeDefined();
    expect(sourceMetadata.xmp).toBeDefined();
    expect(sourceMetadata.icc).toBeDefined();
    expect(sourceMetadata.autoOrient).toEqual({ width: 12, height: 24 });
    await writeFile(sourcePath, source);
    const beforeHash = sha256(await readFile(sourcePath));

    const result = runNode(prepareScript, [sourcePath, outputPath]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toMatchObject({ publication: "unpublished", derivatives: 2 });

    const manifest = JSON.parse(await readFile(path.join(outputPath, "manifest.json"), "utf8"));
    expect(manifest.sourceSha256).toBe(beforeHash);
    expect(manifest.sourceBytes).toBe(source.length);
    expect(manifest.sourceFormat).toBe("jpeg");
    expect(manifest.sourceStoredWidth).toBe(24);
    expect(manifest.sourceStoredHeight).toBe(12);
    expect(manifest.sourceOrientation).toBe(6);
    expect(manifest.pipeline.bounds).toEqual([640, 1280, 1920]);
    expect(manifest.publication).toBe("unpublished");
    expect(manifest.derivatives).toHaveLength(2);
    expect(
      manifest.derivatives.map((asset: { path: string }) => path.extname(asset.path)).sort(),
    ).toEqual([".jpg", ".webp"]);

    for (const asset of manifest.derivatives as Array<{
      path: string;
      sha256: string;
      width: number;
      height: number;
      bytes: number;
    }>) {
      const filename = path.basename(asset.path);
      const bytes = await readFile(path.join(outputPath, filename));
      expect(filename).toBe(`${asset.sha256}${path.extname(filename)}`);
      expect(sha256(bytes)).toBe(asset.sha256);
      expect(bytes.length).toBe(asset.bytes);
      expect(bytes.length).toBeLessThanOrEqual(20_000_000);
      expect(asset.width).toBe(12);
      expect(asset.height).toBe(24);
      expect(asset.width).toBeLessThanOrEqual(24);
      expect(asset.height).toBeLessThanOrEqual(24);
      const derivative = await sharp(bytes).metadata();
      expect(derivative.width).toBe(asset.width);
      expect(derivative.height).toBe(asset.height);
      expect(derivative.format).toBe(path.extname(filename) === ".jpg" ? "jpeg" : "webp");
      expect(derivative.pages ?? 1).toBe(1);
      // EXIF contains the GPS IFD too; the source fixture's invented coordinates must not survive.
      expect(derivative.exif).toBeUndefined();
      expect(derivative.xmp).toBeUndefined();
      expect(derivative.iptc).toBeUndefined();
      expect(derivative.icc).toBeUndefined();
      expect(derivative.orientation).toBeUndefined();
      await sharp(bytes).stats();
      const decoded = await sharp(bytes).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const topMean = meanRgb(decoded.data, decoded.info, 0, decoded.info.height / 2);
      const bottomMean = meanRgb(
        decoded.data,
        decoded.info,
        decoded.info.height / 2,
        decoded.info.height,
      );
      expect(topMean[0]).toBeGreaterThan(topMean[2] + 60);
      expect(bottomMean[2]).toBeGreaterThan(bottomMean[0] + 60);
    }
    expect((await readdir(outputPath)).sort()).toEqual(
      [
        "manifest.json",
        ...manifest.derivatives.map((asset: { path: string }) => path.basename(asset.path)),
      ].sort(),
    );
    expect(sha256(await readFile(sourcePath))).toBe(beforeHash);
  });

  it("downscales a large source to all three bounds without changing its aspect ratio", async () => {
    const testRoot = await tempDir("prepare-large-source");
    const sourcePath = path.join(testRoot, "synthetic-large.png");
    const outputPath = path.join(testRoot, "staging");
    await writeFile(sourcePath, await syntheticLargePng());

    const result = runNode(prepareScript, [sourcePath, outputPath]);
    expect(result.status).toBe(0);
    const manifest = JSON.parse(await readFile(path.join(outputPath, "manifest.json"), "utf8"));
    expect(manifest.derivatives).toHaveLength(6);
    for (const bound of [640, 1280, 1920]) {
      const atBound = manifest.derivatives.filter(
        (asset: { width: number }) => asset.width === bound,
      );
      expect(atBound).toHaveLength(2);
      for (const asset of atBound) {
        expect(asset.width).toBe(bound);
        expect(asset.height).toBe(bound / 2);
        expect(asset.width).toBeLessThanOrEqual(2400);
        expect(asset.height).toBeLessThanOrEqual(1200);
        expect(Math.abs(asset.width / asset.height - 2)).toBeLessThan(0.001);
      }
    }
  });

  it("rejects an existing staging directory without changing its contents", async () => {
    const testRoot = await tempDir("prepare-existing-output");
    const sourcePath = path.join(testRoot, "synthetic.png");
    const outputPath = path.join(testRoot, "already-staged");
    const markerPath = path.join(outputPath, "keep.txt");
    await writeFile(sourcePath, await syntheticPng());
    await mkdir(outputPath);
    await writeFile(markerPath, "preserve this synthetic marker\n");

    const result = runNode(prepareScript, [sourcePath, outputPath]);
    expectRedactedFailure(result, testRoot, [sourcePath, outputPath, "keep.txt"]);
    expect(await readFile(markerPath, "utf8")).toBe("preserve this synthetic marker\n");
    expect(await readdir(outputPath)).toEqual(["keep.txt"]);
  });

  it.each(["SVG", "non-image bytes", "animated WebP", "symbolic link", "oversize sparse file"])(
    "rejects %s without creating staging output or disclosing its path",
    async (kind) => {
      const testRoot = await tempDir("prepare-rejected-input");
      const inputPath = path.join(testRoot, `synthetic-${kind.replaceAll(" ", "-")}.bin`);
      const outputPath = path.join(testRoot, "staging");

      if (kind === "SVG") {
        await writeFile(
          inputPath,
          '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#c65"/></svg>\n',
        );
      } else if (kind === "non-image bytes") {
        await writeFile(inputPath, "synthetic bytes that are not an image\n");
      } else if (kind === "animated WebP") {
        const bytes = await syntheticAnimatedWebp();
        expect((await sharp(bytes).metadata()).pages).toBe(2);
        await writeFile(inputPath, bytes);
      } else if (kind === "symbolic link") {
        const targetPath = path.join(testRoot, "synthetic-real-image.png");
        await writeFile(targetPath, await syntheticPng());
        await symlink(targetPath, inputPath);
        expect((await lstat(inputPath)).isSymbolicLink()).toBe(true);
      } else {
        const handle = await open(inputPath, "w");
        await handle.truncate(50_000_001);
        await handle.close();
        expect((await lstat(inputPath)).size).toBeGreaterThan(50_000_000);
      }

      const result = runNode(prepareScript, [inputPath, outputPath]);
      expectRedactedFailure(result, testRoot, [inputPath, "synthetic-real-image.png"]);
      await expect(lstat(outputPath)).rejects.toMatchObject({ code: "ENOENT" });
    },
  );

  it("refuses staging inside the web application", async () => {
    const testRoot = await tempDir("prepare-in-web");
    const sourcePath = path.join(testRoot, "synthetic.png");
    const outputPath = path.join(webRoot, `.media-staging-test-${randomUUID()}`);
    await writeFile(sourcePath, await syntheticPng());

    const result = runNode(prepareScript, [sourcePath, outputPath]);
    expectRedactedFailure(result, testRoot, [sourcePath, outputPath]);
    await expect(lstat(outputPath)).rejects.toMatchObject({ code: "ENOENT" });
  });
});

describe("public media byte preflight", () => {
  it("accepts an unpublished release with no public assets", async () => {
    const root = await makePublishedApp();
    await mkdir(path.join(root, "public/media"), { recursive: true });
    await writeFile(
      path.join(root, "content/current.json"),
      '{"schemaVersion":1,"state":"unpublished","releaseId":null,"sha256":null}\n',
    );
    await writeFile(path.join(root, "content/release.json"), "null\n");

    const result = runMediaCheck(root);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).publicAssets).toBe(0);
    expect(result.stderr).toBe("");
    expect(result.stdout).not.toContain(root);
  });

  it("accepts a synthetic prepared derivative with exact bytes, checksum and dimensions", async () => {
    const testRoot = await tempDir("preflight-positive");
    const sourcePath = path.join(testRoot, "synthetic-source.png");
    const stagingPath = path.join(testRoot, "staging");
    await writeFile(sourcePath, await syntheticPng(32, 20));
    const prepared = runNode(prepareScript, [sourcePath, stagingPath]);
    expect(prepared.status).toBe(0);
    const manifest = JSON.parse(await readFile(path.join(stagingPath, "manifest.json"), "utf8"));
    const derivative = manifest.derivatives.find((asset: { path: string }) =>
      asset.path.endsWith(".webp"),
    );
    expect(derivative).toBeDefined();
    const bytes = await readFile(path.join(stagingPath, path.basename(derivative.path)));
    const root = await makePublishedApp();
    const installed = await installAsset(root, bytes, "webp");
    expect(installed.asset.width).toBe(derivative.width);
    expect(installed.asset.height).toBe(derivative.height);
    expect(installed.asset.sha256).toBe(derivative.sha256);

    const result = runMediaCheck(root);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout).publicAssets).toBe(1);
    expect(result.stderr).toBe("");
    expect(result.stdout).not.toContain(root);
  });

  it.each([
    "extra file",
    "missing file",
    "hash mismatch",
    "dimension mismatch",
    "type mismatch",
    "symbolic link entry",
    "EXIF metadata",
    "truncated pixel stream",
  ])("fails closed on %s with a generic error that does not reveal filenames", async (kind) => {
    const root = await makePublishedApp();
    let bytes = await sharp({
      create: { width: 18, height: 10, channels: 3, background: { r: 20, g: 130, b: 210 } },
    })
      .webp()
      .toBuffer();
    let extension: "jpg" | "png" | "webp" = "webp";
    if (kind === "type mismatch") {
      // A valid WebP payload is deliberately named with a JPEG extension.
    } else if (kind === "EXIF metadata") {
      bytes = await sharp({
        create: { width: 18, height: 10, channels: 3, background: { r: 20, g: 130, b: 210 } },
      })
        .withExif({ IFD0: { Artist: "synthetic fixture only" } })
        .jpeg()
        .toBuffer();
      extension = "jpg";
      expect((await sharp(bytes).metadata()).exif).toBeDefined();
    } else if (kind === "truncated pixel stream") {
      const width = 64;
      const height = 64;
      const pixels = Buffer.alloc(width * height * 3);
      for (let index = 0; index < pixels.length; index += 1)
        pixels[index] = (index * 97 + 31) % 256;
      const complete = await sharp(pixels, { raw: { width, height, channels: 3 } })
        .png({ compressionLevel: 0 })
        .toBuffer();
      bytes = complete.subarray(0, complete.length - 20);
      const readableMetadata = await sharp(bytes, { failOn: "warning" }).metadata();
      expect(readableMetadata.width).toBe(width);
      expect(readableMetadata.height).toBe(height);
      extension = "png";
    }
    const installed = await installAsset(
      root,
      bytes,
      kind === "type mismatch" ? "jpg" : extension,
      {
        writeFile: kind !== "missing file" && kind !== "symbolic link entry",
        width: kind === "dimension mismatch" ? 19 : undefined,
      },
    );

    if (kind === "extra file") {
      await writeFile(
        path.join(root, "public/media/synthetic-private-filename-canary.txt"),
        "synthetic extra asset\n",
      );
    } else if (kind === "hash mismatch") {
      const altered = Buffer.from(bytes);
      altered[altered.length - 1] ^= 0xff;
      await writeFile(installed.filePath, altered);
      expect(altered.length).toBe(bytes.length);
    } else if (kind === "symbolic link entry") {
      const targetPath = path.join(root, "synthetic-private-target-canary.webp");
      await writeFile(targetPath, bytes);
      await symlink(targetPath, installed.filePath);
      expect((await lstat(installed.filePath)).isSymbolicLink()).toBe(true);
    }

    const result = runMediaCheck(root);
    expectRedactedFailure(result, root, [
      installed.filename,
      "synthetic-private-filename-canary.txt",
      "synthetic-private-target-canary.webp",
    ]);
    expect(result.stderr).toContain("Public media validation failed.");
  });
});
