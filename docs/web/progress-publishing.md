# Public progress publishing

**Current development release, 8 October 2026:** [development-content-20261008-two](../../web/content/release.json) selects a limited introduction, two owner-reported milestones and sixteen AI concepts as application inputs. The owner permits showing this project-created work with prominent “In development / Đang phát triển” and “Not for construction / Không dùng để thi công” notes; see [permission and scope](publication-permission.md). Actual hosting, real-site-photo and operating checks remain open.

The selected pointer/release is now application input on `web/03-timeline`; `main` remains `dd2538d`. This is not a confirmed cloud deployment, and full G0/G2/G3 remain held. The two selected milestones retain the owner's report: a February 2026 construction start (month only) and foundation completion/construction continuing as of 7 October (completion day unknown). They are explicitly owner-reported, not independently verified or as-built records. No completion percentage, planned opening date or site photograph is invented.

## Contract and history

`web/src/lib/contracts/public-content.ts` requires explicit `Asia/Ho_Chi_Minh`, a nullable `occurredOn`, nullable `occurredUntil`, and a separate nullable `reportedAsOf`. A month stays a month. Internal first/last-day bounds only reject impossible intervals; they never become displayed occurrence dates. Intervals that overlap an uncertain month retain that uncertainty. Future occurrences require `planned`, a date basis and a reviewed evidence reference. Report dates cannot follow release publication. Verification requires an evidence reference; the reference alone cannot prove truth.

The schema-1 interval/timezone refinement preceded this selected release. Both selected events already include `occurredUntil: null` and the explicit timezone. Older private candidates must add those fields, then be reviewed and rehashed. Stable `/progress/{eventId}` links use IDs, never titles or slugs.

`validatePublicHistory` compares strict prior/next releases. A new release advances publication time and retains retired IDs; deleted pages/media must be retired. An event stays at its ID as a sanitized withdrawn record, with no media links. Corrections preserve original `publishedAt`, advance `updatedAt`, append a bilingual notice referencing the preceding release and retain earlier notices. Changed occurrence dates or promotion to verified evidence need a new evidence reference. Renaming a slug never changes the stable route. Editorial review must detect attempts to create a new ID for the same real-world event; software cannot infer semantic identity.

## Maintainer staging and review

Use the pinned runtime in [development](development.md). From `web/`:

```sh
node scripts/prepare-content.ts --first /private/path/candidate.json /private/path/new-review-directory
node scripts/prepare-content.ts /private/path/previous-release.json /private/path/candidate.json /private/path/new-review-directory
```

Use `--first` only when no publication history exists. Subsequent development revisions must compare against the selected release, preserving its event IDs and history. Keep originals, previous releases and approval records in the agreed restricted archive. The script validates history and refuses fixtures, future publication timestamps, existing output directories and output inside `web/`. It writes a reviewed-shape `release.json` and checksum-pinned `current.json` into a **new private staging directory**. It does not copy images, edit application content, publish, deploy or prove rights. Errors omit input text and private paths. If a filesystem failure leaves a partial staging directory, retain it for diagnosis and use a new directory after resolving the error; never activate a partial pair.

The contributor supplies originals/date precision/context; the reviewer clears text, translation, people/privacy, rights and evidence category. The maintainer prepares image derivatives with the [media workflow](public-content.md#private-media-preparation), verifies the exact preview and records the applicable permission/review. The owner's permission already covers the selected development work; its pointer/release pair and declared derivatives are application inputs. Continue provenance, privacy and output review for additions within that permission; material outside its scope needs its own rights decision. Keep each selected pair and derivative set together in a reviewed change. `npm run check:content` verifies schema, fixture exclusion, ID and canonical checksum; `npm run check:media` verifies every byte/type/dimension/metadata and the exact public inventory. Both run before the build. Run the remaining build/boundary/browser checks for that exact release and hosting target.

The public app has no upload, editor or status-write API. Git CI is unprivileged and cannot deploy this content. The owner handles the existing hosting project's GitHub connection; no deployed URL or configured settings are confirmed. Named operating contributors/reviewers/publishers and a trained backup, their private intake channel and the actual-host handover remain open. The selected owner-authorized development example does not complete the parish operating rehearsal or real-site-photo gate.

## Correction, withdrawal and rollback

Prepare a new release against the last published release. Correct the same event ID, append a plain-language notice and preserve original publication time. For withdrawal, sanitize the public title/body and all historical explanations to avoid repeating sensitive information; set withdrawn, remove its media references and retire unused media. Retain necessary audit evidence privately. A validator checks chronology, not whether the wording exposes a person.

A privacy removal requires removing affected derivatives from all retained public deployments, storage and CDN caches, including old URLs; replacing the current pointer alone does not erase them. Do not restore a release containing material withdrawn for privacy or revoked rights. Rehearse purge and backup policies with the selected host before launch.

For a factual/content rollback, prepare a new corrected release restoring the safe facts with a visible explanation, rather than reusing the old release ID or losing correction history. Retired media IDs cannot be reused; reviewed replacement media needs new IDs. A technical deployment rollback may target a previously checked complete artifact only after checking later removals and compatibility. Hosting/pointer rollback remains an untested operational hold until the actual hosting target is selected. No in-browser switch activates a release.

The historical local CLI/history checks used synthetic records outside production inputs. Their results do not establish a real operator rehearsal or actual-host behavior for the selected development release. The required real contributor → reviewed preview → publish → correction → withdrawal/restore rehearsal and backup-publisher training remain outstanding. Record human collection/review/build time separately from origin-to-client refresh latency.

References: [Node TypeScript execution and explicit extensions](https://nodejs.org/api/typescript.html), [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers). Version reads and desktop freshness evidence are recorded with the timeline implementation, not claimed as a deployed service.
