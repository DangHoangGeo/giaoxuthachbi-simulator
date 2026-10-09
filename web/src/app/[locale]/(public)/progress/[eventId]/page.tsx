import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDates } from "@/components/event-dates";
import { Freshness } from "@/components/freshness";
import { GalleryCard } from "@/components/gallery-card";
import { SiteShell } from "@/components/site-shell";
import { isLocale, localizedPath } from "@/lib/locales";
import { instantLabel, progressWords } from "@/lib/progress";
import { readPublicContent } from "@/lib/server/public-content";
import { publicVersion } from "@/lib/server/public-version";
// File-published releases are immutable for this build. Unknown stable IDs must return HTTP 404
// before a loading boundary can stream a 200 response. A new release requires a new build.
export const dynamicParams = false;
export function generateStaticParams() {
  const content = readPublicContent();
  return content.state === "published"
    ? content.release.events.map(({ id }) => ({ eventId: id }))
    : [];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; eventId: string }>;
}): Promise<Metadata> {
  const { locale, eventId } = await params;
  if (!isLocale(locale)) return {};
  const content = readPublicContent();
  const event =
    content.state === "published"
      ? content.release.events.find((item) => item.id === eventId)
      : null;
  return event ? { title: event.title[locale] } : {};
}
export default async function EventPage({
  params,
}: {
  params: Promise<{ locale: string; eventId: string }>;
}) {
  const { locale, eventId } = await params;
  if (!isLocale(locale)) notFound();
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  if (content.state !== "published") notFound();
  const event = content.release.events.find((item) => item.id === eventId);
  if (!event) notFound();
  const copy = progressWords[locale];
  const media = content.release.media.filter((item) => event.mediaIds.includes(item.id));
  return (
    <SiteShell
      locale={locale}
      path={`/progress/${event.id}`}
      publishedAt={content.release.publishedAt}
    >
      <article>
        <a className="nav-link mb-7 underline" href={localizedPath(locale, "/progress")}>
          ← {copy.back}
        </a>
        <p className="mb-5 text-sm font-semibold">
          {event.status === "withdrawn" ? copy.withdrawn : copy[event.evidence]}
        </p>
        <h1 className="max-w-[24ch] font-serif text-5xl leading-tight">{event.title[locale]}</h1>
        <p className="mt-8 max-w-[68ch] whitespace-pre-line text-lg leading-relaxed text-stone-700">
          {event.body[locale]}
        </p>
        <EventDates event={event} locale={locale} />
        <p className="mt-4 text-sm text-stone-600">{copy.zone}</p>
        <Freshness locale={locale} initial={publicVersion(content)} />
        {event.corrections.length > 0 && (
          <section className="my-10 max-w-[68ch] border-y border-stone-300 py-6">
            <h2 className="text-xl font-semibold">{copy.correction}</h2>
            <ol className="mt-4 grid gap-5">
              {event.corrections.map((change) => (
                <li key={change.previousReleaseId}>
                  <time className="text-sm" dateTime={change.changedAt}>
                    {instantLabel(change.changedAt, locale)}
                  </time>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">
                    {change.explanation[locale]}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {media.length ? (
          <div className="mt-12 grid grid-cols-[repeat(auto-fill,minmax(min(100%,20rem),1fr))] gap-10">
            {media.map((item, index) => (
              <GalleryCard key={item.id} media={item} locale={locale} priority={index === 0} />
            ))}
          </div>
        ) : (
          <p className="mt-10 border-t border-stone-300 pt-6 text-sm">{copy.noPhoto}</p>
        )}
      </article>
    </SiteShell>
  );
}
