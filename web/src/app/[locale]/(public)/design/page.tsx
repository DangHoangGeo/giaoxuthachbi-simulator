import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryCard } from "@/components/gallery-card";
import { SiteShell } from "@/components/site-shell";
import { galleryCategories, galleryCategory, galleryPath, galleryWords } from "@/lib/gallery";
import { isLocale } from "@/lib/locales";
import { readPublicContent } from "@/lib/server/public-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale)
    ? { title: galleryWords[locale].title, description: galleryWords[locale].introduction }
    : {};
}
export default async function Design({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const category = galleryCategory((await searchParams).category);
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  const copy = galleryWords[locale];
  const media = content.state === "published" ? content.release.media : [];
  const filtered = category === "all" ? media : media.filter((item) => item.category === category);
  return (
    <SiteShell
      locale={locale}
      path="/design"
      galleryFilter={category}
      publishedAt={content.state === "published" ? content.release.publishedAt : undefined}
    >
      <div className="max-w-[65ch]">
        <h1 className="font-serif text-4xl leading-tight">{copy.title}</h1>
        <p className="mt-3 text-sm text-stone-600">
          {locale === "vi"
            ? "Ý tưởng kiến trúc · Chọn hình để xem lớn."
            : "Architectural ideas · Select an image to explore."}
        </p>
      </div>
      <nav
        aria-label={copy.filter}
        className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-y border-stone-300 py-3"
      >
        {galleryCategories.map((item) => (
          <a
            key={item}
            href={galleryPath(locale, item)}
            aria-current={category === item ? "page" : undefined}
            className="nav-link gap-2 text-sm"
          >
            {copy.categories[item]}{" "}
            <span className="text-stone-600">
              (
              {item === "all"
                ? media.length
                : media.filter((image) => image.category === item).length}
              )
            </span>
          </a>
        ))}
      </nav>
      <p className="mt-4 text-xs text-stone-600">
        {filtered.length} {locale === "en" && filtered.length === 1 ? "image" : copy.count}
      </p>
      {filtered.length ? (
        <div className="mt-4 grid grid-cols-2 items-start gap-x-7 gap-y-10">
          {filtered.map((item, index) => (
            <GalleryCard key={item.id} media={item} locale={locale} priority={index === 0} />
          ))}
        </div>
      ) : (
        <section className="my-12 max-w-[52ch] border-l-2 border-stone-400 py-3 pl-8">
          <h2 className="text-xl font-semibold">{copy.empty}</h2>
          <p className="mt-4 leading-relaxed text-stone-700">{copy.pending}</p>
        </section>
      )}
    </SiteShell>
  );
}
