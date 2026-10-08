import "server-only";
import { createHash } from "node:crypto";
import { get } from "@vercel/blob";
import { z } from "zod";
import { accessDenied, checkReviewAccess, privateHeaders, readPrivateJson } from "./access";

const manifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    releaseId: z.string().regex(/^[a-z0-9-]{1,80}$/),
    sourceRevision: z.string().regex(/^[a-f0-9]{40}$/),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    decodedSha256: z.string().regex(/^[a-f0-9]{64}$/),
    bytes: z.number().int().positive().max(80000000),
    decodedBytes: z.number().int().positive().max(160000000),
  })
  .strict();
export async function readReviewModel() {
  return manifestSchema.parse(await readPrivateJson("review/model.json"));
}
export async function serveReviewModel(request: Request) {
  const denial = await checkReviewAccess(request.headers);
  if (denial) return accessDenied(denial);
  if (!["GET", "HEAD"].includes(request.method))
    return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: "GET, HEAD" } });
  // No caller-controlled storage path, URL or release ID is accepted.
  if (new URL(request.url).search || request.headers.has("range"))
    return new Response(null, { status: 416, headers: privateHeaders });
  try {
    const model = await readReviewModel();
    const headers = {
      ...privateHeaders,
      "Content-Type": "application/octet-stream",
      "Content-Disposition": 'inline; filename="thach-bi-full-detail.glb.gz"',
      "Content-Length": String(model.bytes),
      "Accept-Ranges": "none",
    };
    if (request.method === "HEAD") return new Response(null, { headers });
    const result = await get(`review/models/${model.sha256}.glb.gz`, {
      access: "private",
      abortSignal: request.signal,
      headers: { "Accept-Encoding": "identity" },
    });
    if (result?.statusCode !== 200 || result.blob.size !== model.bytes) {
      if (result?.statusCode === 200) await result.stream.cancel();
      throw Error("Private model unavailable");
    }
    let streamed = 0;
    const digest = createHash("sha256");
    const verified = result.stream.pipeThrough(
      new TransformStream<Uint8Array, Uint8Array>({
        transform(chunk, controller) {
          streamed += chunk.byteLength;
          if (streamed > model.bytes) throw Error("Private model length mismatch");
          digest.update(chunk);
          controller.enqueue(chunk);
        },
        flush() {
          if (streamed !== model.bytes || digest.digest("hex") !== model.sha256)
            throw Error("Private model integrity mismatch");
        },
      }),
    );
    return new Response(verified, { headers });
  } catch {
    return accessDenied(503, false);
  }
}
