import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDates } from "@/components/event-dates";
import { Freshness } from "@/components/freshness";
import { SiteShell } from "@/components/site-shell";
import { isLocale, localizedPath } from "@/lib/locales";
import {
  dateLabel,
  eventPath,
  instantLabel,
  progressQuery,
  progressWords,
  timeline,
  timelineQuery,
} from "@/lib/progress";
import { readPublicContent } from "@/lib/server/public-content";
import { publicVersion } from "@/lib/server/public-version";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? { title: progressWords[locale].title } : {};
}
export default async function Progress({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const content = readPublicContent();
  if (content.state === "unavailable") throw new Error("Public content unavailable");
  const release = content.state === "published" ? content.release : null;
  const copy = progressWords[locale],
    query = timelineQuery(await searchParams);
  const result = timeline(release?.events ?? [], query);
  const latest = release?.events.reduce<string | null>(
    (date, event) =>
      !date || Date.parse(event.updatedAt) > Date.parse(date) ? event.updatedAt : date,
    null,
  );
  const path = (page: number) =>
    `${localizedPath(locale, "/progress")}${progressQuery({ ...query, page })}`;
  return (
    <SiteShell
      locale={locale}
      path="/progress"
      equivalentQuery={progressQuery(query)}
      publishedAt={release?.publishedAt}
    >
      <div className="max-w-4xl">
        <h1 className="font-serif text-5xl leading-tight">{copy.title}</h1>
        <p className="mt-8 max-w-[68ch] text-lg leading-relaxed text-stone-700">{copy.intro}</p>
        {latest && (
          <p className="mt-6 text-sm">
            {copy.latest}: <time dateTime={latest}>{instantLabel(latest, locale)}</time>
          </p>
        )}
        <Freshness locale={locale} initial={publicVersion(content)} />
        <form
          action={localizedPath(locale, "/progress")}
          className="my-10 flex flex-wrap items-end gap-6 border-y border-stone-300 py-5"
          aria-label={copy.filters}
        >
          <label className="grid gap-2 text-sm">
            {copy.order}
            <select
              name="sort"
              defaultValue={query.sort}
              className="min-h-11 border border-stone-400 bg-transparent px-3"
            >
              <option value="newest">{copy.newest}</option>
              <option value="oldest">{copy.oldest}</option>
            </select>
          </label>
          {result.years.length > 0 && (
            <label className="grid gap-2 text-sm">
              {copy.year}
              <select
                name="year"
                defaultValue={query.year}
                className="min-h-11 border border-stone-400 bg-transparent px-3"
              >
                <option value="">{copy.allYears}</option>
                {result.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button className="min-h-11 cursor-pointer border border-current px-5" type="submit">
            {copy.apply}
          </button>
        </form>
        <p className="mb-8 text-sm leading-relaxed text-stone-600">
          {copy.dateNote} {copy.zone}
        </p>
        {result.total === 0 ? (
          <p className="py-8 text-lg">{copy.empty}</p>
        ) : (
          result.groups.map((group) => (
            <section key={group.month} className="mb-12">
              <h2 className="mb-7 font-serif text-3xl">
                {dateLabel({ precision: "month", value: group.month }, locale)}
              </h2>
              <ol className="grid gap-8">
                {group.events.map((event) => (
                  <li key={event.id} className="border-l-2 border-stone-300 pl-6">
                    <p className="text-sm font-semibold">
                      {event.status === "withdrawn" ? copy.withdrawn : copy[event.evidence]}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold">
                      <a
                        className="underline decoration-stone-400 underline-offset-4"
                        href={eventPath(locale, event.id)}
                      >
                        {event.title[locale]}
                      </a>
                    </h3>
                    <p className="mt-4 max-w-[65ch] leading-relaxed text-stone-700">
                      {event.body[locale].length > 280
                        ? `${event.body[locale].slice(0, 280)}…`
                        : event.body[locale]}
                    </p>
                    <EventDates event={event} locale={locale} />
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
        {result.pageCount > 1 && (
          <nav
            aria-label={copy.page}
            className="flex items-center gap-8 border-t border-stone-300 pt-6"
          >
            {result.page > 1 && (
              <a className="nav-link underline" href={path(result.page - 1)}>
                {copy.previous}
              </a>
            )}
            <span>
              {copy.page} {result.page} / {result.pageCount}
            </span>
            {result.page < result.pageCount && (
              <a className="nav-link underline" href={path(result.page + 1)}>
                {copy.next}
              </a>
            )}
          </nav>
        )}
      </div>
    </SiteShell>
  );
}
