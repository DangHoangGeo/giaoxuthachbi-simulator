import { createHash, randomBytes } from "node:crypto";
import { gzipSync } from "node:zlib";
import type { GetBlobResult } from "@vercel/blob";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { blobGet } = vi.hoisted(() => ({ blobGet: vi.fn<typeof import("@vercel/blob").get>() }));
vi.mock("server-only", () => ({}));
vi.mock("@vercel/blob", () => ({ get: blobGet }));

import { accessDenied, checkReviewAccess } from "../../src/lib/server/review/access";
import { serveReviewModel } from "../../src/lib/server/review/model";

const now = "2026-10-08T12:00:00.000Z";
// Synthetic test credentials, created independently of any deployment secret.
const password = randomBytes(32).toString("base64url");
const credentials = `parish:${password}`;
const authorization = `Basic ${Buffer.from(credentials).toString("base64")}`;
const decoded = Buffer.from("synthetic architectural model transport fixture");
const encoded = gzipSync(decoded, { level: 9 });
const sha256 = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const policy = {
  schemaVersion: 1,
  enabled: true,
  credentialSha256: sha256(credentials),
  expiresAt: "2026-10-09T12:00:00Z",
};
const manifest = {
  schemaVersion: 1,
  releaseId: "synthetic-private-review",
  sourceRevision: "a".repeat(40),
  sha256: sha256(encoded),
  decodedSha256: sha256(decoded),
  bytes: encoded.byteLength,
  decodedBytes: decoded.byteLength,
};
const modelPath = `review/models/${manifest.sha256}.glb.gz`;

function blob(
  bytes: Uint8Array,
  size = bytes.byteLength,
): Extract<GetBlobResult, { statusCode: 200 }> {
  return chunkedBlob([bytes], size);
}

function chunkedBlob(
  chunks: readonly Uint8Array[],
  size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0),
): Extract<GetBlobResult, { statusCode: 200 }> {
  return {
    statusCode: 200,
    stream: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(chunk);
        controller.close();
      },
    }),
    headers: new Headers(),
    blob: {
      size,
      contentType: "application/octet-stream",
      url: "https://synthetic.private.blob.vercel-storage.com/unit-fixture",
      downloadUrl: "https://synthetic.private.blob.vercel-storage.com/unit-fixture?download=1",
      pathname: "unit-fixture",
      contentDisposition: "inline",
      cacheControl: "public, max-age=86400",
      uploadedAt: new Date(now),
      etag: '"synthetic-storage-etag"',
    },
  };
}

function jsonBlob(value: unknown) {
  return blob(new TextEncoder().encode(JSON.stringify(value)));
}

function allowPolicy(value: unknown = policy) {
  blobGet.mockResolvedValueOnce(jsonBlob(value));
}

function allowManifest(value: unknown = manifest) {
  blobGet.mockResolvedValueOnce(jsonBlob(value));
}

function request(
  options: { method?: string; url?: string; auth?: string | null; headers?: HeadersInit } = {},
) {
  const headers = new Headers(options.headers);
  if (options.auth !== null) headers.set("Authorization", options.auth ?? authorization);
  return new Request(options.url ?? "https://church.example/vi/review/model", {
    method: options.method ?? "GET",
    headers,
  });
}

function expectPrivateHeaders(response: Response) {
  // Keep expected security values independent of the source header object.
  expect(response.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
  expect(response.headers.get("CDN-Cache-Control")).toBe("no-store");
  expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe("no-store");
  expect(response.headers.get("Pragma")).toBe("no-cache");
  expect(response.headers.get("Expires")).toBe("0");
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
  expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("ETag")).toBeNull();
  expect(response.headers.get("Last-Modified")).toBeNull();
}

function calledPaths() {
  return blobGet.mock.calls.map(([path]) => path);
}

beforeEach(() => {
  blobGet.mockReset();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(now));
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("private review access", () => {
  it.each([
    ["missing", null],
    ["empty", ""],
    ["different authentication scheme", "Bearer synthetic-token"],
    ["invalid base64 alphabet", "Basic %%%"],
    ["extra scheme whitespace", `Basic  ${Buffer.from(credentials).toString("base64")}`],
    ["wrong username", `Basic ${Buffer.from(`admin:${password}`).toString("base64")}`],
    ["weak short password", `Basic ${Buffer.from("parish:short").toString("base64")}`],
    [
      "42-character password",
      `Basic ${Buffer.from(`parish:${"a".repeat(42)}`).toString("base64")}`,
    ],
    [
      "44-character password",
      `Basic ${Buffer.from(`parish:${"a".repeat(44)}`).toString("base64")}`,
    ],
    [
      "extra credential component",
      `Basic ${Buffer.from(`${credentials}:extra`).toString("base64")}`,
    ],
    [
      "non-ASCII password",
      `Basic ${Buffer.from(`parish:é${password.slice(1)}`).toString("base64")}`,
    ],
    ["oversized header", `Basic ${"A".repeat(513)}`],
  ])("rejects %s before any private-storage read", async (_label, auth) => {
    const response = await serveReviewModel(request({ auth }));
    expect(response.status).toBe(401);
    expect(blobGet).not.toHaveBeenCalled();
    expectPrivateHeaders(response);
    expect(response.headers.get("WWW-Authenticate")).toBe(
      'Basic realm="Thach Bi private review", charset="UTF-8"',
    );
    expect(await response.text()).toBe(
      "Private parish review. Sign in with the parish credentials.",
    );
  });

  it("rejects a correctly shaped wrong password without reading the model manifest or bytes", async () => {
    allowPolicy();
    const wrong = `Basic ${Buffer.from(`parish:${"x".repeat(43)}`).toString("base64")}`;
    const response = await serveReviewModel(request({ auth: wrong }));
    expect(response.status).toBe(401);
    expect(calledPaths()).toEqual(["review/access.json"]);
    expectPrivateHeaders(response);
  });

  it("accepts the generated 256-bit credential and checks policy directly at origin", async () => {
    expect(password).toHaveLength(43);
    allowPolicy();
    expect(
      await checkReviewAccess(request({ auth: authorization.replace("Basic", "basic") }).headers),
    ).toBeNull();
    expect(calledPaths()).toEqual(["review/access.json"]);
    expect(blobGet.mock.calls[0][1]).toMatchObject({ access: "private", useCache: false });
    expect(blobGet.mock.calls[0][1].headers).toEqual({ "Accept-Encoding": "identity" });
    expect(blobGet.mock.calls[0][1].abortSignal).toBeInstanceOf(AbortSignal);
    expect(blobGet.mock.calls[0][1].abortSignal?.aborted).toBe(false);
  });

  it.each([
    ["disabled", { ...policy, enabled: false }],
    ["expired", { ...policy, expiresAt: "2026-10-08T11:59:59.999Z" }],
    ["exact expiry boundary", { ...policy, expiresAt: now }],
  ])("rejects %s policy before model reads", async (_label, value) => {
    allowPolicy(value);
    const response = await serveReviewModel(request());
    expect(response.status).toBe(401);
    expect(calledPaths()).toEqual(["review/access.json"]);
    expectPrivateHeaders(response);
  });

  it.each([
    ["unknown private fields", { ...policy, privateValue: "synthetic-sensitive-policy" }],
    ["wrong schema", { ...policy, schemaVersion: 2 }],
    ["malformed digest", { ...policy, credentialSha256: "not-a-digest" }],
    ["missing expiry", { ...policy, expiresAt: undefined }],
    ["unzoned expiry", { ...policy, expiresAt: "2026-10-09T12:00:00" }],
  ])("fails closed with a generic 503 for %s", async (_label, value) => {
    allowPolicy(value);
    const response = await serveReviewModel(request());
    expect(response.status).toBe(503);
    expect(calledPaths()).toEqual(["review/access.json"]);
    expectPrivateHeaders(response);
    expect(response.headers.get("WWW-Authenticate")).toBeNull();
    expect(await response.text()).toBe("Private review is temporarily unavailable.");
  });

  it.each(["missing", "storage rejection", "unexpected conditional response", "invalid JSON"])(
    "fails closed when the access policy is %s",
    async (failure) => {
      if (failure === "missing") blobGet.mockResolvedValueOnce(null);
      if (failure === "storage rejection")
        blobGet.mockRejectedValueOnce(Error("synthetic-storage-secret"));
      if (failure === "unexpected conditional response") {
        blobGet.mockResolvedValueOnce({
          ...jsonBlob(policy),
          statusCode: 304,
          stream: null,
          blob: { ...jsonBlob(policy).blob, size: null, contentType: null },
        });
      }
      if (failure === "invalid JSON")
        blobGet.mockResolvedValueOnce(blob(new TextEncoder().encode("not JSON")));
      const response = await serveReviewModel(request());
      expect(response.status).toBe(503);
      expect(calledPaths()).toEqual(["review/access.json"]);
      expectPrivateHeaders(response);
      expect(await response.text()).toBe("Private review is temporarily unavailable.");
    },
  );

  it("cancels an oversized policy stream and does not read protected model data", async () => {
    const result = blob(new Uint8Array(), 16_385);
    const cancel = vi.spyOn(result.stream, "cancel");
    blobGet.mockResolvedValueOnce(result);
    const response = await serveReviewModel(request());
    expect(response.status).toBe(503);
    expect(cancel).toHaveBeenCalledOnce();
    expect(calledPaths()).toEqual(["review/access.json"]);
    expectPrivateHeaders(response);
  });

  it("rejects oversized streamed policy bytes even when storage metadata reports a small size", async () => {
    // Otherwise-valid JSON plus legal whitespace would be accepted without the
    // cumulative stream bound. Every individual chunk is below the 16 KiB cap.
    const json = new TextEncoder().encode(JSON.stringify(policy));
    const bytes = new TextEncoder().encode(`${JSON.stringify(policy)}${" ".repeat(16_385)}`);
    blobGet.mockResolvedValueOnce(
      chunkedBlob(
        [bytes.subarray(0, 8000), bytes.subarray(8000, 16000), bytes.subarray(16000)],
        json.byteLength,
      ),
    );
    const response = await serveReviewModel(request());
    expect(response.status).toBe(503);
    expect(calledPaths()).toEqual(["review/access.json"]);
    expect(blobGet.mock.calls[0][1].headers).toEqual({ "Accept-Encoding": "identity" });
    expectPrivateHeaders(response);
    expect(await response.text()).toBe("Private review is temporarily unavailable.");
  });

  it("rechecks revocation on every request instead of caching a successful policy", async () => {
    allowPolicy();
    allowPolicy({ ...policy, enabled: false });
    expect(await checkReviewAccess(request().headers)).toBeNull();
    expect(await checkReviewAccess(request().headers)).toBe(401);
    expect(calledPaths()).toEqual(["review/access.json", "review/access.json"]);
    for (const [, options] of blobGet.mock.calls) expect(options.useCache).toBe(false);
  });

  it("applies cache isolation to unavailable responses and an explicitly suppressed challenge", async () => {
    const response = accessDenied(401, false);
    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toBeNull();
    expectPrivateHeaders(response);
  });
});

describe("protected model delivery", () => {
  it("authorizes first, then streams only the server-selected hash path with private headers", async () => {
    allowPolicy();
    allowManifest();
    blobGet.mockResolvedValueOnce(
      chunkedBlob([encoded.subarray(0, 7), encoded.subarray(7, 33), encoded.subarray(33)]),
    );
    const input = request();
    const response = await serveReviewModel(input);
    expect(response.status).toBe(200);
    expect(calledPaths()).toEqual(["review/access.json", "review/model.json", modelPath]);
    expect(blobGet.mock.calls[1][1]).toMatchObject({ access: "private", useCache: false });
    expect(blobGet.mock.calls[0][1].headers).toEqual({ "Accept-Encoding": "identity" });
    expect(blobGet.mock.calls[1][1].headers).toEqual({ "Accept-Encoding": "identity" });
    expect(blobGet.mock.calls[2][1]).toMatchObject({
      access: "private",
      abortSignal: input.signal,
    });
    expect(blobGet.mock.calls[2][1].headers).toEqual({ "Accept-Encoding": "identity" });
    expect(response.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(response.headers.get("Content-Length")).toBe(String(encoded.byteLength));
    expect(response.headers.get("Content-Disposition")).toBe(
      'inline; filename="thach-bi-full-detail.glb.gz"',
    );
    expect(response.headers.get("Accept-Ranges")).toBe("none");
    // The app decodes the gzip explicitly; the HTTP layer must not auto-decode it.
    expect(response.headers.get("Content-Encoding")).toBeNull();
    expectPrivateHeaders(response);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(encoded));
  });

  it("returns authorized HEAD metadata with no body or model-byte fetch", async () => {
    allowPolicy();
    allowManifest();
    const response = await serveReviewModel(request({ method: "HEAD" }));
    expect(response.status).toBe(200);
    expect(response.body).toBeNull();
    expect(response.headers.get("Content-Length")).toBe(String(manifest.bytes));
    expect(response.headers.get("Accept-Ranges")).toBe("none");
    expect(calledPaths()).toEqual(["review/access.json", "review/model.json"]);
    expectPrivateHeaders(response);
  });

  it.each(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])(
    "rejects authorized %s before the manifest or model is read",
    async (method) => {
      allowPolicy();
      const response = await serveReviewModel(request({ method }));
      expect(response.status).toBe(405);
      expect(response.headers.get("Allow")).toBe("GET, HEAD");
      expect(calledPaths()).toEqual(["review/access.json"]);
      expectPrivateHeaders(response);
    },
  );

  it.each(["bytes=0-10", "bytes=-10", "bytes=0-1,3-4", "nonsense", ""])(
    "rejects the Range header %s without reading model metadata",
    async (range) => {
      allowPolicy();
      const response = await serveReviewModel(request({ headers: { Range: range } }));
      expect(response.status).toBe(416);
      expect(calledPaths()).toEqual(["review/access.json"]);
      expectPrivateHeaders(response);
    },
  );

  it.each([
    "?url=https%3A%2F%2Fattacker.invalid%2Fprivate.glb.gz",
    "?path=..%2Faccess.json",
    "?releaseId=other-review",
    "?sha256=attacker",
  ])("rejects caller-controlled query %s before reading model metadata", async (query) => {
    allowPolicy();
    const response = await serveReviewModel(
      request({ url: `https://church.example/vi/review/model${query}` }),
    );
    expect(response.status).toBe(416);
    expect(calledPaths()).toEqual(["review/access.json"]);
    expectPrivateHeaders(response);
  });

  it.each([
    { method: "HEAD", headers: { Range: "bytes=0-1" } },
    { method: "DELETE" },
    { url: "https://church.example/vi/review/model?path=private" },
  ])("checks credentials before method, range or URL metadata is considered", async (input) => {
    const response = await serveReviewModel(request({ ...input, auth: null }));
    expect(response.status).toBe(401);
    expect(blobGet).not.toHaveBeenCalled();
    expectPrivateHeaders(response);
  });

  it("ignores caller host, pathname, storage headers and cache validators when selecting the private model", async () => {
    allowPolicy();
    allowManifest();
    blobGet.mockResolvedValueOnce(blob(encoded));
    const response = await serveReviewModel(
      request({
        url: "https://attacker.invalid/other-store/access.json",
        headers: {
          "X-Blob-Url": "https://attacker.invalid/hidden.glb.gz",
          "X-Review-Release": "attacker-release",
          "If-None-Match": "*",
          "If-Modified-Since": "Thu, 08 Oct 2026 12:00:00 GMT",
          "Accept-Encoding": "br, gzip",
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(calledPaths()).toEqual(["review/access.json", "review/model.json", modelPath]);
    for (const [path, options] of blobGet.mock.calls) {
      expect(path).not.toContain("attacker");
      expect(options.headers).toEqual({ "Accept-Encoding": "identity" });
      expect(options.ifNoneMatch).toBeUndefined();
    }
    expectPrivateHeaders(response);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array(encoded));
  });

  it.each([
    ["unlisted storage URL", { ...manifest, url: "https://attacker.invalid/private" }],
    ["invalid source revision", { ...manifest, sourceRevision: "latest" }],
    ["invalid release ID", { ...manifest, releaseId: "../other" }],
    ["URL as model digest", { ...manifest, sha256: "https://attacker.invalid/model.glb.gz" }],
    ["invalid decoded digest", { ...manifest, decodedSha256: "invalid" }],
    ["zero size", { ...manifest, bytes: 0 }],
    ["compressed-size limit", { ...manifest, bytes: 80_000_001 }],
    ["decoded-size limit", { ...manifest, decodedBytes: 160_000_001 }],
  ])("rejects %s in the manifest without reading model bytes", async (_label, value) => {
    allowPolicy();
    allowManifest(value);
    const response = await serveReviewModel(request());
    expect(response.status).toBe(503);
    expect(calledPaths()).toEqual(["review/access.json", "review/model.json"]);
    expectPrivateHeaders(response);
    expect(await response.text()).toBe("Private review is temporarily unavailable.");
  });

  it("fails closed when the authorized manifest is unavailable", async () => {
    allowPolicy();
    blobGet.mockRejectedValueOnce(Error("synthetic-secret-manifest-path"));
    const response = await serveReviewModel(request());
    expect(response.status).toBe(503);
    expect(calledPaths()).toEqual(["review/access.json", "review/model.json"]);
    expectPrivateHeaders(response);
    expect(await response.text()).toBe("Private review is temporarily unavailable.");
  });

  it.each(["missing", "storage rejection", "unexpected conditional response"])(
    "fails closed with a generic unavailable response when model storage is %s",
    async (failure) => {
      allowPolicy();
      allowManifest();
      if (failure === "missing") blobGet.mockResolvedValueOnce(null);
      if (failure === "storage rejection")
        blobGet.mockRejectedValueOnce(Error("synthetic-storage-secret"));
      if (failure === "unexpected conditional response") {
        blobGet.mockResolvedValueOnce({
          ...blob(encoded),
          statusCode: 304,
          stream: null,
          blob: { ...blob(encoded).blob, size: null, contentType: null },
        });
      }
      const response = await serveReviewModel(request());
      expect(response.status).toBe(503);
      expect(calledPaths()).toEqual(["review/access.json", "review/model.json", modelPath]);
      expectPrivateHeaders(response);
      expect(response.headers.get("WWW-Authenticate")).toBeNull();
      expect(await response.text()).toBe("Private review is temporarily unavailable.");
    },
  );

  it.each([0, manifest.bytes - 1, manifest.bytes + 1])(
    "cancels a model whose storage size %s disagrees with the release",
    async (size) => {
      allowPolicy();
      allowManifest();
      const result = blob(encoded, size);
      const cancel = vi.spyOn(result.stream, "cancel");
      blobGet.mockResolvedValueOnce(result);
      const response = await serveReviewModel(request());
      expect(response.status).toBe(503);
      expect(cancel).toHaveBeenCalledOnce();
      expectPrivateHeaders(response);
      expect(await response.text()).toBe("Private review is temporarily unavailable.");
    },
  );

  it.each(["truncated", "overlong", "corrupt"])(
    "rejects a %s model stream even when metadata matches the manifest",
    async (failure) => {
      allowPolicy();
      allowManifest();
      let bytes: Uint8Array;
      if (failure === "truncated") bytes = encoded.subarray(0, encoded.byteLength - 1);
      else if (failure === "overlong") bytes = Uint8Array.from([...encoded, 0xaa]);
      else {
        bytes = Uint8Array.from(encoded);
        bytes[Math.floor(bytes.byteLength / 2)] ^= 0xff;
      }
      const split = Math.floor(bytes.byteLength / 2);
      blobGet.mockResolvedValueOnce(
        chunkedBlob([bytes.subarray(0, split), bytes.subarray(split)], manifest.bytes),
      );
      const response = await serveReviewModel(request());
      // Streaming has already committed headers; integrity failure must abort
      // the body rather than return a successfully completed corrupt download.
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Length")).toBe(String(manifest.bytes));
      expect(calledPaths()).toEqual(["review/access.json", "review/model.json", modelPath]);
      expect(blobGet.mock.calls[2][1].headers).toEqual({ "Accept-Encoding": "identity" });
      expectPrivateHeaders(response);
      await expect(response.arrayBuffer()).rejects.toThrow(
        failure === "overlong"
          ? "Private model length mismatch"
          : "Private model integrity mismatch",
      );
    },
  );
});
