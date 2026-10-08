import { readPublicContent } from "@/lib/server/public-content";
import { versionResponse } from "@/lib/server/public-version";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return versionResponse(readPublicContent(), request.headers.get("If-None-Match"));
}
