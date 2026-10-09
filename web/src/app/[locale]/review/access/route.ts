import { accessDenied, checkReviewAccess, privateHeaders } from "@/lib/server/review/access";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const denied = await checkReviewAccess(request.headers);
  return denied
    ? accessDenied(denied, false)
    : new Response(null, { status: 204, headers: privateHeaders });
}
