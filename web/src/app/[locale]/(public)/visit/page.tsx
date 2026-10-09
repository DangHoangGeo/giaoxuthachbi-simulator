import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { Visit } from "@/components/visit";
import { imageChoices } from "@/lib/gallery";
import { isLocale } from "@/lib/locales";
import { readPublicContent } from "@/lib/server/public-content";
import asset from "../../../../../content/visit.json";
export default async function VisitPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = readPublicContent();
  if (content.state !== "published" || !asset) notFound();
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
            ? "Mô hình thiết kế · ánh sáng minh họa. Mô phỏng kỹ thuật đầy đủ vẫn ở công cụ riêng."
            : "Design model · illustrative lighting. The full engineering simulator remains a separate tool."}
        </p>
      </div>
      <Visit locale={locale} asset={asset} poster={imageChoices(poster).largest.path} />
    </SiteShell>
  );
}
