import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { PrivateReview } from "@/components/private-review";
import { imageChoices } from "@/lib/gallery";
import { isLocale } from "@/lib/locales";
import { readPublicContent } from "@/lib/server/public-content";
import { checkReviewAccess } from "@/lib/server/review/access";
import { readReviewModel } from "@/lib/server/review/model";
export const dynamic = "force-dynamic";
export default async function ReviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale) || (await checkReviewAccess(await headers()))) notFound();
  const vi = locale === "vi";
  try {
    const model = await readReviewModel();
    const content = readPublicContent();
    const image =
      content.state === "published"
        ? content.release.media.find((m) => m.id === "concept-nave-20261007")
        : undefined;
    const poster = image ? imageChoices(image).largest.path : "/icon.svg";
    return (
      <main className="mx-auto max-w-[1600px] px-8 py-6">
        <p className="mb-4 border-b border-stone-300 pb-3 text-sm">
          {vi
            ? "Xem riêng của giáo xứ · Đang phát triển · Không dùng để thi công"
            : "Private parish review · In development · Not for construction"}
        </p>
        <h1 className="font-serif text-4xl">
          {vi ? "Mô hình nhà thờ đầy đủ chi tiết" : "Full-detail church model"}
        </h1>
        <p className="my-4 max-w-[90ch] text-sm">
          {vi
            ? "Giữ nguyên hình học và ảnh vật liệu gốc. Bản xem kiến trúc; không phải mô phỏng kỹ thuật hay hồ sơ thi công được duyệt. Tải khoảng 53 MB khi mở; nên dùng máy tính và Wi-Fi. Ánh sáng chỉ để minh họa."
            : "Original geometry and texture images. Architectural review; not the engineering simulator or approved construction documents. About 53 MB on entry; use a desktop and Wi-Fi. Lighting is illustrative."}
        </p>
        <PrivateReview
          poster={poster}
          locale={locale}
          asset={{
            path: `/${locale}/review/model`,
            bytes: model.bytes,
            decodedBytes: model.decodedBytes,
            sha256: model.sha256,
            decodedSha256: model.decodedSha256,
            sourceRevision: model.sourceRevision,
          }}
        />
        <p className="mt-5 text-sm">
          {vi ? "Bản mô hình" : "Model release"}: {model.releaseId} ·{" "}
          {model.sourceRevision.slice(0, 7)}
        </p>
        <p className="mt-3 text-sm">
          {vi
            ? "Nên mở bằng cửa sổ riêng tư và đóng toàn bộ cửa sổ riêng tư khi xong. Trình duyệt có thể nhớ mật khẩu; nút Đóng 3D chỉ đóng mô hình. Liên hệ người quản trị để đổi mật khẩu dùng chung."
            : "Use a private browsing window and close all private windows when finished. Your browser may remember the password; Close 3D only closes the model. Ask the administrator to rotate the shared password."}
        </p>
        <a className="nav-link mt-4 inline-block underline" href={`/${locale}/visit`}>
          {vi ? "Về bản xem nhẹ công khai" : "Public lightweight visit"}
        </a>
      </main>
    );
  } catch {
    return (
      <main className="p-10">
        <h1>{vi ? "Chưa mở được bản xem riêng" : "Private review unavailable"}</h1>
        <p>
          {vi
            ? "Vui lòng thử lại sau hoặc liên hệ người quản trị."
            : "Please retry later or contact the administrator."}
        </p>
      </main>
    );
  }
}
