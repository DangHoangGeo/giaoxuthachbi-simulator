import { type NextRequest, NextResponse } from "next/server";
import { accessDenied, checkReviewAccess, privateHeaders } from "@/lib/server/review/access";
export async function proxy(request: NextRequest) {
  const denied = await checkReviewAccess(request.headers);
  if (denied) return accessDenied(denied, !request.nextUrl.pathname.endsWith("/access"));
  const response = NextResponse.next();
  for (const [key, value] of Object.entries(privateHeaders)) response.headers.set(key, value);
  return response;
}
export const config = { matcher: ["/vi/review/:path*", "/en/review/:path*"] };
