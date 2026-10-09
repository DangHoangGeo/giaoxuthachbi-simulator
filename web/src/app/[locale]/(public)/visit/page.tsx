import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { Visit } from "@/components/visit";
import { imageChoices } from "@/lib/gallery";
import { isLocale } from "@/lib/locales";
import { readPublicContent } from "@/lib/server/public-content";
export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = readPublicContent();
  if (content.state !== "published") notFound();
  const poster =
    content.release.media.find((m) => m.id === "concept-nave-20261007") ?? content.release.media[0];
  if (!poster) notFound();
  return (
    <SiteShell locale={locale} path="/visit" publishedAt={content.release.publishedAt}>
      <div className="mb-5 flex items-end justify-between gap-8">
        <h1 className="font-serif text-4xl">
          {locale === "vi" ? "Khám phá mô hình 3D" : "Explore the 3D model"}
        </h1>
        <p className="max-w-[48ch] text-sm text-stone-600">
          {locale === "vi"
            ? "Cùng mô hình thiết kế mà dự án đang dùng, ở chế độ tham quan. Công cụ mô phỏng để chỉnh sửa có trong kho mã nguồn."
            : "The same design model the project works on, in visit mode. The editing simulator is in the source repository."}
        </p>
      </div>
      <Visit
        locale={locale}
        poster={imageChoices(poster).largest.path}
        src="/viewer/OPEN_CHURCH.html"
      />
    </SiteShell>
  );
}
