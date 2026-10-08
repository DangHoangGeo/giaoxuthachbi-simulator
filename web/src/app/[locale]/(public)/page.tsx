import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { galleryPath, galleryWords } from "@/lib/gallery";
import { isLocale, localizedPath, words } from "@/lib/locales";
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
    const [introduction, ...sections] = content.release.pages;
    return (
      <SiteShell locale={locale} publishedAt={content.release.publishedAt}>
        <article className="max-w-[68ch]">
          <p className="mb-7 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
            {copy.name}
          </p>
          <h1 className="font-serif text-5xl leading-tight">
            {introduction?.title[locale] ?? copy.title}
          </h1>
          <p className="mt-8 whitespace-pre-line text-lg leading-relaxed text-stone-700">
            {introduction?.body[locale] ?? copy.introduction}
          </p>
          {sections.map((section) => (
            <section key={section.id} className="mt-12 border-t border-stone-300 pt-8">
              <h2 className="font-serif text-3xl leading-tight">{section.title[locale]}</h2>
              <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-stone-700">
                {section.body[locale]}
              </p>
            </section>
          ))}
          <a
            className="nav-link mt-10 border-b border-current text-sm font-semibold"
            href={galleryPath(locale)}
          >
            {galleryWords[locale].title} →
          </a>
        </article>
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
