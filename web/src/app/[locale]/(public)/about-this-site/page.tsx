import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { isLocale, words } from "@/lib/locales";
import { readPublicContent } from "@/lib/server/public-content";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: words[locale].aboutTitle } : {};
}
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = words[locale];
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  return (
    <SiteShell
      locale={locale}
      path="/about-this-site"
      publishedAt={content.state === "published" ? content.release.publishedAt : undefined}
    >
      <article className="max-w-[65ch]">
        <h1 className="font-serif text-4xl leading-tight">{copy.aboutTitle}</h1>
        <p className="mt-8 text-lg leading-relaxed text-stone-700">
          {content.state === "published" ? copy.aboutPublished : copy.aboutBody}
        </p>
        <p className="mt-6 text-lg leading-relaxed text-stone-700">{copy.aboutDetail}</p>
        <section className="mt-10 border-t border-stone-300 pt-7">
          <h2 className="text-2xl font-semibold">{copy.limitationsTitle}</h2>
          <p className="mt-5 text-lg leading-relaxed text-stone-700">{copy.limitations}</p>
          <p className="mt-5 text-lg leading-relaxed text-stone-700">{copy.centralView}</p>
        </section>
      </article>
    </SiteShell>
  );
}
