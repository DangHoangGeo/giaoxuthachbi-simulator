import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { get } from "@vercel/blob";
import { z } from "zod";

export const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
  Expires: "0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};
const policySchema = z
  .object({
    schemaVersion: z.literal(1),
    enabled: z.boolean(),
    credentialSha256: z.string().regex(/^[a-f0-9]{64}$/),
    expiresAt: z.iso.datetime(),
  })
  .strict();

export async function readPrivateJson(path: string) {
  const result = await get(path, {
    access: "private",
    useCache: false,
    abortSignal: AbortSignal.timeout(8000),
    headers: { "Accept-Encoding": "identity" },
  });
  if (result?.statusCode !== 200 || result.blob.size > 16384) {
    if (result?.statusCode === 200) await result.stream.cancel();
    throw Error("Private configuration unavailable");
  }
  let size = 0;
  const bounded = result.stream.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        size += chunk.length;
        if (size > 16384) throw Error("Private configuration too large");
        controller.enqueue(chunk);
      },
    }),
  );
  return new Response(bounded).json() as Promise<unknown>;
}

export async function checkReviewAccess(headers: Headers): Promise<401 | 503 | null> {
  const authorization = headers.get("authorization") ?? "";
  if (!/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization) || authorization.length > 512)
    return 401;
  const credentials = Buffer.from(authorization.slice(6), "base64").toString("utf8");
  // Only the maintainer-generated 256-bit shared password is accepted; no weak-password setup.
  if (!/^parish:[A-Za-z0-9_-]{43}$/.test(credentials)) return 401;
  try {
    const policy = policySchema.parse(await readPrivateJson("review/access.json"));
    if (!policy.enabled || Date.parse(policy.expiresAt) <= Date.now()) return 401;
    const actual = createHash("sha256").update(credentials).digest();
    return timingSafeEqual(actual, Buffer.from(policy.credentialSha256, "hex")) ? null : 401;
  } catch {
    return 503;
  }
}
export function accessDenied(status: 401 | 503, challenge = true) {
  return new Response(
    status === 401
      ? "Private parish review. Sign in with the parish credentials."
      : "Private review is temporarily unavailable.",
    {
      status,
      headers: {
        ...privateHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        ...(status === 401 && challenge
          ? { "WWW-Authenticate": 'Basic realm="Thach Bi private review", charset="UTF-8"' }
          : {}),
      },
    },
  );
}
