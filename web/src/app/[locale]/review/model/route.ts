import { serveReviewModel } from "@/lib/server/review/model";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const GET = serveReviewModel;
export const HEAD = serveReviewModel;
export const POST = serveReviewModel;
