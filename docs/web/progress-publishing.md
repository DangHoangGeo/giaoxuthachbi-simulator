# Public progress publishing

8 October 2026. Local software preparation only; no church update is activated, no cloud deployment is made, and G0/G2/G3 remain held. The owner reported a February 2026 construction start (month only) and foundation completion as of 7 October (completion day unknown). These facts remain in private review material until the parish approves the exact public copy. No completion percentage, planned opening date or site photograph is invented.

## Contract and history

`web/src/lib/contracts/public-content.ts` requires explicit `Asia/Ho_Chi_Minh`, a nullable `occurredOn`, nullable `occurredUntil`, and a separate nullable `reportedAsOf`. A month stays a month. Internal first/last-day bounds only reject impossible intervals; they never become displayed occurrence dates. Intervals that overlap an uncertain month retain that uncertainty. Future occurrences require `planned`, a date basis and a reviewed evidence reference. Report dates cannot follow release publication. Verification requires an evidence reference; the reference alone cannot prove truth.

This is a pre-publication refinement of schema 1: there are no activated records to migrate. Existing private candidates must add `occurredUntil: null` and the explicit timezone, then be reviewed and rehashed. Stable `/progress/{eventId}` links use IDs, never titles or slugs.

`validatePublicHistory` compares strict prior/next releases. A new release advances publication time and retains retired IDs; deleted pages/media must be retired. An event stays at its ID as a sanitized withdrawn record, with no media links. Corrections preserve original `publishedAt`, advance `updatedAt`, append a bilingual notice referencing the preceding release and retain earlier notices. Changed occurrence dates or promotion to verified evidence need a new evidence reference. Renaming a slug never changes the stable route. Editorial review must detect attempts to create a new ID for the same real-world event; software cannot infer semantic identity.

## Maintainer staging and review

Use the pinned runtime in [development](development.md). From `web/`:

```sh
node scripts/prepare-content.ts --first /private/path/candidate.json /private/path/new-review-directory
node scripts/prepare-content.ts /private/path/previous-release.json /private/path/candidate.json /private/path/new-review-directory
```

Use `--first` only when no publication history exists. Keep originals, previous releases and approval records in the agreed restricted archive. The script validates history and refuses fixtures, future publication timestamps, existing output directories and output inside `web/`. It writes a reviewed-shape `release.json` and checksum-pinned `current.json` into a **new private staging directory**. It does not copy images, edit application content, publish, deploy or prove rights. Errors omit input text and private paths. If a filesystem failure leaves a partial staging directory, retain it for diagnosis and use a new directory after resolving the error; never activate a partial pair.

The contributor supplies originals/date precision/context; the reviewer clears text, translation, people/privacy, rights and evidence category. The maintainer prepares image derivatives with the [media workflow](public-content.md#private-media-preparation), verifies the exact preview and records approval. Only after publication authorization should the exact approved pointer/release pair and declared derivatives enter the app inputs in one reviewed change. `npm run check:content` verifies schema, fixture exclusion, ID and canonical checksum; `npm run check:media` verifies every byte/type/dimension/metadata and the exact public inventory. Both run before the build. Run the remaining build/boundary/browser checks before an authorized deployment.

The public app has no upload, editor or status-write API. Git CI is unprivileged and cannot deploy this content. A named contributor, reviewer, publisher and trained backup, their private intake channel, hosting/domain ownership and real approved sample remain missing.

## Correction, withdrawal and rollback

Prepare a new release against the last published release. Correct the same event ID, append a plain-language notice and preserve original publication time. For withdrawal, sanitize the public title/body and all historical explanations to avoid repeating sensitive information; set withdrawn, remove its media references and retire unused media. Retain necessary audit evidence privately. A validator checks chronology, not whether the wording exposes a person.

A privacy removal requires removing affected derivatives from all retained public deployments, storage and CDN caches, including old URLs; replacing the current pointer alone does not erase them. Do not restore a release containing material withdrawn for privacy or revoked rights. Rehearse purge and backup policies with the selected host before launch.

For a factual/content rollback, prepare a new corrected release restoring the safe facts with a visible explanation, rather than reusing the old release ID or losing correction history. Retired media IDs cannot be reused; reviewed replacement media needs new IDs. A technical deployment rollback may target a previously checked complete artifact only after checking later removals and compatibility. Hosting/pointer rollback remains an untested operational hold until the actual hosting target is selected. No in-browser switch activates a release.

The local tests use synthetic records only, outside production inputs. The required real contributor → reviewed preview → publish → correction → withdrawal/restore rehearsal and backup-publisher training remain outstanding. Record human collection/review/build time separately from origin-to-client refresh latency.

References: [Node TypeScript execution and explicit extensions](https://nodejs.org/api/typescript.html), [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers). Version reads and desktop freshness evidence are recorded with the timeline implementation, not claimed as a deployed service.
