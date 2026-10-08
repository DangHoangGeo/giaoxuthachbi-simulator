import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { galleryPath, imageChoices } from "@/lib/gallery";
import { isLocale, localizedPath, words } from "@/lib/locales";
import { eventPath, instantLabel, progressWords } from "@/lib/progress";
import { readPublicContent } from "@/lib/server/public-content";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  const introduction = content.state === "published" ? content.release.pages[0] : undefined;
  return introduction
    ? {
        title: introduction.title[locale],
        description: introduction.body[locale].replace(/\s+/g, " ").slice(0, 180),
      }
    : {};
}
export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  const copy = words[locale];
  if (content.state === "published") {
    const introduction = content.release.pages[0];
    const front =
      content.release.media.find((item) => item.id === "concept-front-20261007") ??
      content.release.media[0];
    const latest = [...content.release.events].sort(
      (a, b) =>
        Date.parse(b.updatedAt) - Date.parse(a.updatedAt) ||
        (b.reportedAsOf ?? "").localeCompare(a.reportedAsOf ?? "") ||
        b.id.localeCompare(a.id),
    )[0];
    const vi = locale === "vi";
    return (
      <SiteShell locale={locale} publishedAt={content.release.publishedAt}>
        <section className="home-intro">
          <div>
            <p className="text-xs uppercase tracking-[.16em] text-stone-600">
              {vi ? "Một công trình chung của cộng đoàn" : "A shared parish project"}
            </p>
            <h1 className="mt-3 max-w-[19ch] font-serif text-5xl leading-tight">
              {introduction?.title[locale] ?? copy.title}
            </h1>
          </div>
          <div className="flex flex-col items-start gap-3">
            <a className="primary-link" href={localizedPath(locale, "/visit")}>
              {vi ? "Khám phá mô hình 3D" : "Explore the 3D model"} ↗
            </a>
            <a className="nav-link text-sm" href={galleryPath(locale)}>
              {content.release.media.length} {vi ? "hình ý tưởng" : "design ideas"} →
            </a>
          </div>
        </section>
        {front && (
          <figure className="home-hero">
            <a
              href={galleryPath(locale)}
              aria-label={vi ? "Xem bộ hình ý tưởng" : "Browse the design ideas"}
            >
              {/* biome-ignore lint/performance/noImgElement: Pre-generated hashed responsive derivatives. */}
              <img
                src={imageChoices(front).fallback.path}
                srcSet={imageChoices(front).srcSet}
                sizes="(min-width:1280px) 1216px, 100vw"
                width={1672}
                height={941}
                alt={front.alt[locale]}
                fetchPriority="high"
                className="w-full object-contain"
              />
            </a>
            <figcaption className="mt-2 flex justify-between text-xs text-stone-600">
              <span>
                {vi ? "Ý tưởng mặt tiền · Hình tạo bằng AI" : "Facade concept · AI-generated image"}
              </span>
              <span>07.10.2026</span>
            </figcaption>
          </figure>
        )}
        <div className="mt-10 grid grid-cols-2 gap-16 border-t border-stone-300 pt-7">
          <section>
            <h2 className="font-serif text-2xl">
              {vi ? "Thiết kế đang hoàn thiện" : "A design in progress"}
            </h2>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-stone-700">
              {vi
                ? "Mô hình, hình ý tưởng và phép tính chưa phải hồ sơ được phép dùng để thi công."
                : "Models, concepts and calculations are not construction-approved documents."}
            </p>
            <a
              className="nav-link mt-2 text-sm underline"
              href={localizedPath(locale, "/about-this-site")}
            >
              {vi ? "Các việc đang kiểm tra" : "Work still being checked"} →
            </a>
          </section>
          {latest && (
            <section>
              <h2 className="text-sm font-semibold">{progressWords[locale].latest}</h2>
              <a className="nav-link mt-2 font-serif text-2xl" href={eventPath(locale, latest.id)}>
                {latest.title[locale]}
              </a>
              <p className="mt-2 text-xs text-stone-600">
                <time dateTime={latest.updatedAt}>{instantLabel(latest.updatedAt, locale)}</time> ·{" "}
                {latest.status === "withdrawn"
                  ? progressWords[locale].withdrawn
                  : progressWords[locale][latest.evidence]}
              </p>
            </section>
          )}
        </div>
      </SiteShell>
    );
  }
  return (
    <SiteShell locale={locale}>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] items-start gap-20">
        <section>
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-[14ch] font-serif text-5xl leading-[1.15] tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-stone-700">
            {copy.introduction}
          </p>
          <a
            className="mt-10 inline-flex min-h-12 items-center border-b border-current text-sm font-semibold"
            href={localizedPath(locale, "/about-this-site")}
          >
            {copy.next}
            <span aria-hidden="true" className="ml-4">
              →
            </span>
          </a>
        </section>
        <aside className="mt-16 border-t border-stone-400 pt-8">
          <h2 className="text-xl font-semibold">{copy.aside}</h2>
          <p className="mt-5 max-w-[36ch] text-base leading-relaxed text-stone-700">
            {copy.asideBody}
          </p>
        </aside>
      </div>
    </SiteShell>
  );
}
