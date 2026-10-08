import type { Locale } from "@/lib/locales";
import { dateLabel, instantLabel, type PublicEvent, progressWords } from "@/lib/progress";
export function EventDates({ event, locale }: { event: PublicEvent; locale: Locale }) {
  const copy = progressWords[locale];
  return (
    <dl className="mt-6 grid gap-3 text-sm leading-relaxed text-stone-700">
      <div>
        <dt className="font-semibold">{copy.occurred}</dt>
        <dd>
          {event.occurredOn ? (
            <>
              <time dateTime={event.occurredOn.value}>{dateLabel(event.occurredOn, locale)}</time>
              {event.occurredUntil && (
                <>
                  {" "}
                  –{" "}
                  <time dateTime={event.occurredUntil.value}>
                    {dateLabel(event.occurredUntil, locale)}
                  </time>
                </>
              )}
            </>
          ) : (
            copy.unknown
          )}
        </dd>
      </div>
      {event.reportedAsOf && (
        <div>
          <dt className="font-semibold">{copy.reported}</dt>
          <dd>
            <time dateTime={event.reportedAsOf}>
              {dateLabel({ precision: "day", value: event.reportedAsOf }, locale)}
            </time>
          </dd>
        </div>
      )}
      <div>
        <dt className="font-semibold">{copy.published}</dt>
        <dd>
          <time dateTime={event.publishedAt}>{instantLabel(event.publishedAt, locale)}</time>
        </dd>
      </div>
      {event.status !== "published" && (
        <div>
          <dt className="font-semibold">{copy.updated}</dt>
          <dd>
            <time dateTime={event.updatedAt}>{instantLabel(event.updatedAt, locale)}</time>
          </dd>
        </div>
      )}
    </dl>
  );
}
