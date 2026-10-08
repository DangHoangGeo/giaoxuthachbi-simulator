# Phase 03 — Construction timeline and fresh updates

Status: **independent local software in progress; G3 held**, 8 October 2026, branch `web/03-timeline` from main `dd2538d`. Explicit `-x` cherry-picks reuse verified phase-02 software (`173a4d2`, `afff2df`, `d8d645d`) without merging its held publication gate. Read the event/media/work-package [contracts](../data-and-publication.md) and [maintainer runbook](../../docs/web/progress-publishing.md).

## Outcome

Visitors can follow dated site progress, open individual updates and understand how recent the information is. Updates come through a trusted publishing workflow outside the church app.

## Inputs

Reviewed events and photos with dates/precision, rights and work-package references; a named contributor and publisher; current construction facts. Initial records can describe the February start and foundation completion reported by 7 October without inventing their exact days.

## Work packages, in order

1. **Implement event validation.** Validate IDs, occurrence date or interval, precision, timezone, media references, public status, publication time and correction history. Preserve stable IDs when titles/slugs change. Restrict future scheduled entries to approved public plans explicitly labeled planned.
2. **Build `/progress` and event pages.** Start with a newest-first, accessible list grouped by month/phase, with a chronological option. Add filters only for supported data (year/phase); paginate or progressively load photographs. Each card shows what happened, evidence status, when photographed/reported and when published. A blank period means no published update, not stopped construction.
3. **Publish through reviewed files.** A maintainer validates a manifest and derivatives, reviews a preview and deploys an approved version. Provide correction/removal steps and a content rollback. The public app has no upload, editing or “mark complete” UI/API.
4. **Make freshness honest.** Show latest published update and last successful check. Implement conditional fetch with the provisional 60-second visible-tab polling interval, backoff and offline/hidden pause. Reconcile cache TTL and revalidation with the two-minute origin-publication target. New items should not jump a reader's scroll position or interrupt assistive technology.
5. **Add external publishing only when needed.** If Git/deployment turnaround is too slow, preserve the schema and move the current-version pointer to a suitable store. A separate trusted publisher validates and activates the version; a signed webhook may trigger cache invalidation. Protect against replay/duplicate publication and incomplete media upload. Do not require WebSockets or a CMS for the first release.
6. **Rehearse the parish workflow.** A contributor supplies a real approved sample; the maintainer publishes, corrects and retracts it in preview. Record the human review time separately from technical refresh latency. Train a backup publisher.

Suggested commit boundaries: event contract/tests; timeline UI; publication tooling/runbook; refresh/stale handling; optional external integration only after a separate decision.

## Planned deliverables

- Timeline and event detail routes, public event schema and fixtures.
- Validated release/publishing tooling and `docs/web/progress-publishing.md`.
- A dated demonstration of publish → visitor update → correction → rollback/removal.

## Checks and exit gate G3

- [ ] February remains month-only; the foundation's unknown completion day is not replaced with the report date.
- [ ] Test same-day events, out-of-order upload, corrections, unknown dates, missing/retracted media, empty history and long lists.
- [ ] A captured-on date cannot be confused with a published-on timestamp; construction dates use church-local time.
- [ ] The latest update is visible within the agreed refresh budget after origin publication; build/review delays are separately documented.
- [ ] Hidden/offline tabs stop polling; errors retain timestamped last-known content and retry without flooding the origin.
- [ ] No engineering completion percentage appears unless its scope, denominator and evidence have been agreed.
- [ ] The contributor/publisher workflow works without in-app editing or production credentials in a reader's browser.

## Risks and handover

Without a contributor, the software cannot create real-time site evidence. Show the last update date honestly and avoid a misleading “live” badge. Prepare public increment A for phase 07 while phase 04 continues. Later private work packages may publish sanitized public events, but never expose private source records automatically.
