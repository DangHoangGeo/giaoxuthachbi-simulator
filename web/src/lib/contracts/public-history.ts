import { type PublicRelease, publicReleaseSchema } from "./public-content.ts";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object")
    return `{${Object.entries(value)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
const equal = (a: unknown, b: unknown) => canonical(a) === canonical(b);
type Event = PublicRelease["events"][number];
function substance({ updatedAt: _updated, corrections: _corrections, ...event }: Event) {
  return event;
}

// Trusted maintainer preflight; public requests do not accept a prior release from readers.
// These checks establish coherent history, never the truth/permission of editorial claims.
export function validatePublicHistory(previousInput: unknown, nextInput: unknown): string[] {
  const parsed = publicReleaseSchema.safeParse(nextInput);
  if (!parsed.success) return ["Invalid next public release"];
  const next = parsed.data;
  if (previousInput === null) {
    return next.events.some((event) => event.status !== "published" || event.corrections.length > 0)
      ? ["Initial release cannot refer to missing event history"]
      : [];
  }
  const prior = publicReleaseSchema.safeParse(previousInput);
  if (!prior.success) return ["Invalid previous public release"];
  const previous = prior.data;
  const errors: string[] = [];
  const fail = (message: string) => errors.push(message);
  if (next.releaseId === previous.releaseId) fail("Release IDs are immutable");
  if (next.fixtureOnly !== previous.fixtureOnly) fail("Fixture/public history cannot be mixed");
  if (Date.parse(next.publishedAt) <= Date.parse(previous.publishedAt))
    fail("Publication must advance");
  if (previous.retiredIds.some((id) => !next.retiredIds.includes(id)))
    fail("Retirement history was dropped");
  const oldKinds = new Map([
    ...previous.pages.map(({ id }) => [id, "page"] as const),
    ...previous.media.map(({ id }) => [id, "media"] as const),
    ...previous.events.map(({ id }) => [id, "event"] as const),
  ]);
  const newKinds = new Map([
    ...next.pages.map(({ id }) => [id, "page"] as const),
    ...next.media.map(({ id }) => [id, "media"] as const),
    ...next.events.map(({ id }) => [id, "event"] as const),
  ]);
  for (const [id, kind] of oldKinds) {
    if (newKinds.has(id) && newKinds.get(id) !== kind) fail(`ID changed record type: ${id}`);
    if (!newKinds.has(id) && kind !== "event" && !next.retiredIds.includes(id))
      fail(`Removed record must be retired: ${id}`);
  }
  const nextEvents = new Map(next.events.map((event) => [event.id, event]));
  for (const old of previous.events) {
    const current = nextEvents.get(old.id);
    if (!current) {
      fail(`Event needs a stable withdrawn record: ${old.id}`);
      continue;
    }
    if (current.publishedAt !== old.publishedAt) fail(`Original publication changed: ${old.id}`);
    const changed = !equal(substance(old), substance(current));
    if (!changed) {
      if (current.updatedAt !== old.updatedAt || !equal(current.corrections, old.corrections))
        fail(`History changed without a correction: ${old.id}`);
      continue;
    }
    const last = current.corrections.at(-1);
    if (
      current.status === "published" ||
      Date.parse(current.updatedAt) <= Date.parse(old.updatedAt) ||
      Date.parse(current.updatedAt) <= Date.parse(previous.publishedAt) ||
      current.corrections.length !== old.corrections.length + 1 ||
      !equal(current.corrections.slice(0, -1), old.corrections) ||
      last?.previousReleaseId !== previous.releaseId ||
      last.changedAt !== current.updatedAt
    )
      fail(`Changed event needs an appended, dated correction: ${old.id}`);
    const dateChanged =
      !equal(current.occurredOn, old.occurredOn) ||
      !equal(current.occurredUntil, old.occurredUntil);
    const strongerEvidence = current.evidence === "verified" && old.evidence !== "verified";
    if (
      (dateChanged || strongerEvidence) &&
      (!current.evidenceRef || current.evidenceRef === old.evidenceRef)
    )
      fail(`Date/evidence change needs a new review reference: ${old.id}`);
  }
  const previousIds = new Set(previous.events.map((event) => event.id));
  for (const event of next.events) {
    if (
      !previousIds.has(event.id) &&
      (event.status !== "published" ||
        event.corrections.length > 0 ||
        Date.parse(event.publishedAt) <= Date.parse(previous.publishedAt))
    )
      fail(`New event has invalid publication history: ${event.id}`);
  }
  return errors;
}
