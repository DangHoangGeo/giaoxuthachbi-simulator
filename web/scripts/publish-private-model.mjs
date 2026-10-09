// Maintainer-only command. Never imported by an application route.
import { createHash, randomBytes } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

const root = path.resolve("..");
const record = JSON.parse(
  await readFile(path.join(root, "exports/private-review/manifest.json"), "utf8"),
);
const packed = await readFile(path.join(root, record.package.file));
const hash = (data) => createHash("sha256").update(data).digest("hex");
if (packed.length !== record.package.bytes || hash(packed) !== record.package.sha256)
  throw Error("Package mismatch");
const secretFile = path.join(root, ".env.private-review-access");
let credentials;
try {
  credentials = JSON.parse(await readFile(secretFile, "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  credentials = {
    username: "parish",
    password: randomBytes(32).toString("base64url"),
    expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
  };
  await writeFile(secretFile, `${JSON.stringify(credentials, null, 2)}\n`, {
    mode: 0o600,
    flag: "wx",
  });
}
await chmod(secretFile, 0o600);
if (credentials.username !== "parish" || !/^[A-Za-z0-9_-]{43}$/.test(credentials.password))
  throw Error("Invalid credential file");
const policy = {
  schemaVersion: 1,
  enabled: true,
  credentialSha256: hash(`${credentials.username}:${credentials.password}`),
  expiresAt: credentials.expiresAt,
};
const manifest = {
  schemaVersion: 1,
  releaseId: record.releaseId,
  sourceRevision: record.sourceCommit,
  sha256: record.package.sha256,
  decodedSha256: record.source.sha256,
  bytes: record.package.bytes,
  decodedBytes: record.source.bytes,
};
const modelPath = `review/models/${manifest.sha256}.glb.gz`;
await put(modelPath, packed, {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/octet-stream",
  multipart: true,
});
const readback = await get(modelPath, { access: "private", useCache: false });
if (readback?.statusCode !== 200) throw Error("Upload readback unavailable");
const remote = new Uint8Array(await new Response(readback.stream).arrayBuffer());
if (remote.length !== manifest.bytes || hash(remote) !== manifest.sha256)
  throw Error("Upload readback mismatch");
await put("review/model.json", JSON.stringify(manifest), {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
});
await put("review/access.json", JSON.stringify(policy), {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
});
console.log(
  JSON.stringify(
    {
      published: manifest.releaseId,
      bytes: manifest.bytes,
      sha256: manifest.sha256,
      readbackVerified: true,
      credentialsFile: secretFile,
      passwordPrinted: false,
      expiresAt: policy.expiresAt,
    },
    null,
    2,
  ),
);
