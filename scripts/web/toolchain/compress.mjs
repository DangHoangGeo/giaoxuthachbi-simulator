// Authoring-only display derivative. Never change analytical/source geometry.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, textureCompress } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder } from "meshoptimizer";
import sharp from "sharp";
const [sourcePath, outputPath] = process.argv.slice(2);
if (!sourcePath || !outputPath)
	throw Error("Usage: compress.mjs source.glb new-private-output-directory");
const publicRoot = path.resolve(import.meta.dirname, "../../../web");
const output = path.resolve(outputPath);
if (output === publicRoot || output.startsWith(publicRoot + path.sep))
	throw Error("Use private staging outside web");
await mkdir(output); // Keep earlier evidence intact.
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO()
	.registerExtensions(ALL_EXTENSIONS)
	.registerDependencies({
		"meshopt.decoder": MeshoptDecoder,
		"meshopt.encoder": MeshoptEncoder,
	});
const textureDoc = await io.read(sourcePath);
await textureDoc.transform(
	textureCompress({
		encoder: sharp,
		targetFormat: "webp",
		quality: 80,
		lossless: false,
		nearLossless: false,
	}),
);
const texturePath = path.join(output, "webp.glb");
await io.write(texturePath, textureDoc);
const modelDoc = await io.read(texturePath);
await modelDoc.transform(
	meshopt({
		encoder: MeshoptEncoder,
		level: "high",
		quantizePosition: 16,
		quantizeNormal: 14,
		quantizeTexcoord: 16,
	}),
);
const modelPath = path.join(output, "web.glb");
await io.write(modelPath, modelDoc);
const bytes = await readFile(modelPath);
// Match the original artifact's Python/zlib compressor; record its runtime below.
const packed = execFileSync(
	"python3",
	[
		"-c",
		"import gzip,sys; sys.stdout.buffer.write(gzip.compress(sys.stdin.buffer.read(),compresslevel=9,mtime=0))",
	],
	{ input: bytes, maxBuffer: 150_000_000 },
);
const sha256 = createHash("sha256").update(packed).digest("hex");
await writeFile(path.join(output, `${sha256}.glb.gz`), packed);
const result = {
	bytes: packed.length,
	decodedBytes: bytes.length,
	sha256,
	compressionRuntime: execFileSync(
		"python3",
		[
			"-c",
			"import sys,zlib; print(sys.version.split()[0] + ' / zlib ' + zlib.ZLIB_RUNTIME_VERSION)",
		],
		{ encoding: "utf8" },
	).trim(),
	knownOmission:
		"Optional EXT_materials_bump is not preserved. No mesh simplification.",
};
await writeFile(
	path.join(output, "compression.json"),
	JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result));
