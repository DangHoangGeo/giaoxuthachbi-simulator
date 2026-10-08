import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { isLocale, words } from "@/lib/locales";
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = words[locale];
  return (
    <SiteShell locale={locale} path="/about-this-site">
      <article className="max-w-[65ch]">
        <h1 className="font-serif text-4xl leading-tight">{copy.aboutTitle}</h1>
        <p className="mt-8 text-lg leading-relaxed text-stone-700">{copy.aboutBody}</p>
        <p className="mt-6 text-lg leading-relaxed text-stone-700">{copy.aboutDetail}</p>
      </article>
    </SiteShell>
  );
}
