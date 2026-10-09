# Owner-authorized development display

8 October 2026. Branch `web/03-timeline`, parent `581d381`; the containing commit records the implementation. This is a locally verified development preview prepared for the owner's existing hosting project's GitHub connection, not evidence of a cloud deployment.

Release `development-content-20261008-one` selects three project-generated AI concepts, two owner-reported construction milestones and a limited bilingual introduction. Every public content page retains “In development · Not for construction” / “Đang phát triển · Không dùng để thi công”. The About page and captions preserve engineering limitations and the exclusion of exposed centreline fans. Native artwork remains outside the app; 18 metadata-stripped, hash-named JPEG/WebP derivatives are included. [Permission](../../docs/web/publication-permission.md) and [source provenance](../../docs/web/development-publication-assets.json) record the scope. Both construction reports retain their supplied date uncertainty and do not claim independent verification.

## Verification

- Production build `oT1CH6lG1eRFtvqP9unlz`: content and media validation passed. Lint/typecheck and **113 unit tests** passed.
- **8 production and 8 synthetic headed desktop Chrome journeys** passed: bilingual reading, permanent notice, actual concepts/credits/dates, keyboard dialog/focus, no-JavaScript access, owner-reported date precision, conditional version reads, denied writes/missing IDs, synthetic corrections/withdrawals/pagination and refresh/error behavior. Build/unit log whitespace is normalized for Git; adjacent `.log.gz` files preserve their exact captured bytes. See [logs](logs/production-browser.log) and [synthetic checks](logs/synthetic-browser.log).
- The [build boundary scan](logs/boundary.log) inspected 2,170 entries, 59,653,699 bytes and 3,929 trace references, with zero failures for its nine known markers. This is a bounded canary/path check, not a universal secret detector.
- [Desktop captures and measurements](desktop/summary.md) record the exact source/build, requests, environment and limitations. Primary visually inspected the English gallery, Vietnamese home, foundation detail and About page. No phone tests. Lab measurements are not field performance or parish-device acceptance.
- Capture correction found in primary review: `en-foundation-detail-fullpage.png` is a duplicate 1440×900 viewport capture. Its as-run metadata says full-page, but `saveShot` does not pass that option to Playwright. It is not evidence of the entire scrollable page; the browser tests separately check the article text. Raw capture records are retained unchanged.
- Three native source hashes match the provenance record; all 18 derivative hashes/byte counts match the release. The production media preflight separately verifies actual decoding, dimensions, metadata and exact public inventory.
- All **59 engineering source fingerprints are unchanged**. No physical geometry, equipment positions/settings, circuits, routes, registers, physics, sampling or thresholds changed. Existing lighting, speech/feedback, air, concealment and engineering-approval holds remain unresolved.

The simultaneously published milestone records share a publication timestamp; the homepage's stable ID tie-break is not a claim about the most recent physical work. Historical evidence directories retain their original empty/synthetic release and hashes. This record supersedes their empty-gallery performance figures for the current release.

## Hosting handover and remaining gates

Use **Root Directory `web`**, Next.js preset, `npm ci`, `npm run build`, framework-default output. The development content is on **`web/03-timeline`**; `main` remains `dd2538d` with the verified framework foundation. [Hosting settings and remaining checks](../../docs/web/deployment.md) distinguish selected application content from an online release. The owner is connecting the existing hosting project; no URL has been supplied or tested.

G2/G3 stay unmerged for remaining parish/operator review, real site photographs, intended desktop/network, actual-host update/recovery tests, contributor/publisher/backup rehearsal and training. Development display permission is already granted and does not need to be requested again. No private review, site inspector or physical equipment commands are exposed. Full building-system design and later web phases are not complete.

Run `python3 review/web-development-display-2026-10-08/verify.py` at this revision for source/evidence hashes, unchanged engineering files and local links. Historical manifests intentionally become stale after later source changes; do not rewrite them to claim new verification.
