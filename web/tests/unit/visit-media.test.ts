import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const validator = path.join(webRoot, "scripts/check-media.mjs");
const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

type RunResult = {
  status: number | null;
  stdout: string;
  stderr: string;
  error: Error | undefined;
};

type VisitManifest = {
  bytes: number;
  decodedBytes: number;
  path: string;
  sha256: string;
  sourceRevision: string;
  [key: string]: unknown;
};

let scratchRoot: string;

beforeAll(async () => {
  scratchRoot = await mkdtemp(path.join(os.tmpdir(), "thach-bi-visit-media-tests-"));
});

afterAll(async () => {
  await rm(scratchRoot, { recursive: true, force: true });
});

function makeGlbDocument(options: { extras?: boolean; externalUri?: boolean } = {}) {
  const node: { mesh: number; extras?: { privateMarker: string } } = { mesh: 0 };
  const buffer: { byteLength: number; uri?: string } = { byteLength: 42 };
  const document = {
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [node],
    meshes: [
      {
        primitives: [{ attributes: { POSITION: 0 }, indices: 1 }],
      },
    ],
    buffers: [buffer],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: 36, target: 34962 },
      { buffer: 0, byteOffset: 36, byteLength: 6, target: 34963 },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [0, 0, 0],
        max: [1, 1, 0],
      },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    ],
  };

  if (options.extras) {
    document.nodes[0].extras = { privateMarker: "synthetic-private-extra-canary" };
  }
  if (options.externalUri) {
    document.buffers[0].uri = "synthetic-private-resource-canary.bin";
  }
  return document;
}

function makeEmbeddedGlb(document = makeGlbDocument()) {
  const json = Buffer.from(JSON.stringify(document));
  const jsonLength = Math.ceil(json.length / 4) * 4;
  const jsonChunk = Buffer.alloc(jsonLength, 0x20);
  json.copy(jsonChunk);

  const binaryChunk = Buffer.alloc(44);
  const positions = [0, 0, 0, 1, 0, 0, 0, 1, 0];
  positions.forEach((value, index) => {
    binaryChunk.writeFloatLE(value, index * 4);
  });
  [0, 1, 2].forEach((value, index) => {
    binaryChunk.writeUInt16LE(value, 36 + index * 2);
  });

  const totalLength = 12 + 8 + jsonChunk.length + 8 + binaryChunk.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4);
  const binaryHeader = Buffer.alloc(8);
  binaryHeader.writeUInt32LE(binaryChunk.length, 0);
  binaryHeader.writeUInt32LE(0x004e4942, 4);
  return Buffer.concat([header, jsonHeader, jsonChunk, binaryHeader, binaryChunk]);
}

async function makeApp(pointerState: "published" | "unpublished" = "published") {
  const root = await mkdtemp(path.join(scratchRoot, "app-"));
  await mkdir(path.join(root, "content"), { recursive: true });
  await mkdir(path.join(root, "public"), { recursive: true });
  await mkdir(path.join(root, "scripts"), { recursive: true });
  await copyFile(validator, path.join(root, "scripts/check-media.mjs"));
  await symlink(path.join(webRoot, "node_modules"), path.join(root, "node_modules"), "dir");

  const pointer =
    pointerState === "published"
      ? {
          schemaVersion: 1,
          state: "published",
          releaseId: "synthetic-visit-release",
          sha256: "a".repeat(64),
        }
      : { schemaVersion: 1, state: "unpublished", releaseId: null, sha256: null };
  await writeFile(path.join(root, "content/current.json"), `${JSON.stringify(pointer)}\n`);
  await writeFile(
    path.join(root, "content/release.json"),
    pointerState === "published"
      ? `${JSON.stringify({ fixtureOnly: false, media: [] })}\n`
      : "null\n",
  );
  return root;
}

async function installVisit(
  root: string,
  options: {
    document?: ReturnType<typeof makeGlbDocument>;
    packed?: Buffer;
    manifestPatch?: Partial<VisitManifest>;
    extraManifest?: Record<string, unknown>;
  } = {},
) {
  const glb = makeEmbeddedGlb(options.document);
  const packed = options.packed ?? gzipSync(glb);
  const sha256 = digest(packed);
  const manifest: VisitManifest = {
    bytes: packed.length,
    decodedBytes: glb.length,
    path: `/models/${sha256}.glb.gz`,
    sha256,
    sourceRevision: "c151c71",
    ...options.manifestPatch,
    ...options.extraManifest,
  };
  const modelFile = path.join(root, "public", manifest.path.slice(1));
  await mkdir(path.dirname(modelFile), { recursive: true });
  await writeFile(modelFile, packed);
  await writeFile(path.join(root, "content/visit.json"), `${JSON.stringify(manifest)}\n`);
  return { glb, packed, manifest, modelFile };
}

function runValidator(root: string): RunResult {
  const result = spawnSync(process.execPath, [path.join(root, "scripts/check-media.mjs")], {
    cwd: root,
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
    timeout: 30_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

function expectRedactedFailure(result: RunResult, root: string, privateTokens: string[] = []) {
  const output = `${result.stdout}${result.stderr}`;
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr).toBe(
    "Public media validation failed. Check the release and its exact reviewed derivatives.\n",
  );
  expect(output).not.toContain(root);
  for (const token of privateTokens) expect(output).not.toContain(token);
}

describe("public visit model preflight", () => {
  it("accepts a gzip-compressed GLB with embedded geometry and no public media derivatives", async () => {
    const root = await makeApp();
    const fixture = await installVisit(root);
    expect(fixture.glb.readUInt32LE(0)).toBe(0x46546c67);
    expect(fixture.glb.readUInt32LE(4)).toBe(2);
    expect(fixture.glb.readUInt32LE(16)).toBe(0x4e4f534a);
    const binaryHeaderOffset = fixture.glb.length - 52;
    expect(fixture.glb.readUInt32LE(binaryHeaderOffset)).toBe(44);
    expect(fixture.glb.readUInt32LE(binaryHeaderOffset + 4)).toBe(0x004e4942);
    expect(
      JSON.parse(await readFile(path.join(root, "content/release.json"), "utf8")).media,
    ).toEqual([]);

    const result = runValidator(root);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({ publicAssets: 0 });
    expect(result.stderr).toBe("");
    expect(`${result.stdout}${result.stderr}`).not.toContain(root);
  });

  it.each([
    {
      name: "nested private extras",
      document: makeGlbDocument({ extras: true }),
      token: "synthetic-private-extra-canary",
    },
    {
      name: "external buffer URI",
      document: makeGlbDocument({ externalUri: true }),
      token: "synthetic-private-resource-canary.bin",
    },
  ])("rejects $name without disclosing model details", async ({ document, token }) => {
    const root = await makeApp();
    await installVisit(root, { document });
    expectRedactedFailure(runValidator(root), root, [token]);
  });

  it.each([
    {
      name: "invalid gzip bytes",
      install: async (root: string) => installVisit(root, { packed: Buffer.from("not gzip") }),
      tokens: [],
    },
    {
      name: "model checksum mismatch",
      install: async (root: string) => {
        const incorrectHash = "b".repeat(64);
        return installVisit(root, {
          manifestPatch: {
            sha256: incorrectHash,
            path: `/models/${incorrectHash}.glb.gz`,
          },
        });
      },
      tokens: [],
    },
    {
      name: "compressed byte-length mismatch",
      install: async (root: string) =>
        installVisit(root, { manifestPatch: { bytes: makeEmbeddedGlb().length + 1 } }),
      tokens: [],
    },
    {
      name: "decoded byte-length mismatch",
      install: async (root: string) =>
        installVisit(root, { manifestPatch: { decodedBytes: makeEmbeddedGlb().length + 4 } }),
      tokens: [],
    },
  ])("rejects $name", async ({ install, tokens }) => {
    const root = await makeApp();
    await install(root);
    expectRedactedFailure(runValidator(root), root, tokens);
  });

  it("rejects a model when the public pointer is unpublished", async () => {
    const root = await makeApp("unpublished");
    const fixture = await installVisit(root);
    expect(fixture.manifest.path).toMatch(/^\/models\/[a-f0-9]{64}\.glb\.gz$/);
    expectRedactedFailure(runValidator(root), root);
  });

  it("rejects unreviewed files in the public directory", async () => {
    const root = await makeApp();
    await installVisit(root);
    const extra = "synthetic-public-extra-canary.bin";
    await writeFile(path.join(root, "public", extra), Buffer.from("synthetic extra"));
    expectRedactedFailure(runValidator(root), root, [extra]);
  });

  it("rejects unknown visit manifest keys without disclosing their values", async () => {
    const root = await makeApp();
    await installVisit(root, {
      extraManifest: { sourcePath: "synthetic-private-source-canary.glb" },
    });
    expectRedactedFailure(runValidator(root), root, ["synthetic-private-source-canary.glb"]);
  });
});
