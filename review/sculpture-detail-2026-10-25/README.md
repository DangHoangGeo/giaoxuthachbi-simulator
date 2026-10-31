# Sculpture and altar detail review · 25 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

Status: **automated checks passed; desktop visual review blocked by browser permissions; local commit authorized under the owner's verification exception.** The owner asked for continued minor visual improvements, especially sanctuary decoration and statues, in the established northern Vietnamese Catholic direction. This record follows [decoration and finishes](../../docs/decoration-finishes.md), the [sanctuary model](../../docs/sanctuary-model.md) and the [façade statue record](../../docs/engineering/outlets-and-facade-statues.md). No sculpture or fixing is approved for fabrication.

## Appearance basis and changes

The [approved sanctuary concept](../../Thach_Bi_Viewer/references/02-sanctuary/concepts/09-sanctuary-approved-concept.png) supplies the polychrome saints, red/gold setting and pale carved altar direction. The existing [appearance hierarchy](../../docs/church-view-renderings.md) and façade statue brief preserve ivory exterior figures and their existing attributes. No external photograph, scan or new raster artwork is copied. Shapes are generated in the project's own JavaScript; they remain sculptural approximations.

Implemented locally:

- All six catalogue statue types have carved eyelids. Painted interior figures have smaller irises, restrained lips and curved eyebrows. Exterior figures retain an ivory face rather than gaining painted eyes.
- Beards taper through modelled jaw/chin sections with shallow grooves, keeping the lips visible. Praying, holding and key-hand fingers curve gently and have rounded tips. Raised/open/sword contours remain unchanged to retain coordinated extents.
- The Child Jesus has a fuller head with the crown at the previous height and Joseph's carrying-hand anchor unchanged. It remains a generated devotional figure, not a claim of anatomical or sculptural accuracy.
- Our Lady and Saint Joseph have narrow gilded mantle edges following the existing cloth openings. Their paint, subjects, poses, bases and placement stay as before.
- Peter and Paul have layered book covers, recessed pages and spine bands within the former book-block corners. Keys and sword remain, and their façade subject selection remains proposed.
- The pale altar front has two shallow floral medallions with foliate sprigs/stems outside a clear central cross field. These use the existing carving vocabulary. They sit within the panel outline and behind the cross face, without changing the mensa, base, altar placement or analytical boundary. Their attachment, stonework and actual carving design remain pending.

No station narrative artwork, crucifix corpus, saint identity, side assignment, electrical layout or lighting output changes. ENG-027 is unaffected: the owner clarified that “mirror things” means minor visual details.

## Reproducible checks and register impact

`bounds-before.json` was generated from the catalogue at HEAD `bd62560` before source edits; `bounds-after.json` records the refined geometry. `scripts/verify_sculpture.cjs` uses the actual bundled THREE implementation and catalogue builders without a GPU. It checks finite position/normal buffers, valid indices, deterministic geometry/transforms, no generated lights, a 70,000-triangle limit per statue, and retained min/max extents for every figure. Its 0.000001 m comparison tolerance is software precision only. It does not represent survey accuracy or fabrication tolerance. See `sculpture-check.json`.

`scripts/verify_model.cjs` checks the complete working model, with added altar panel/forward-plane limits, parent attachment and a clear central cross field. `scripts/verify_simulator.cjs --report --estimates` checks current niche fit, deletion/move preservation, routes, controls and calculation invariants while retaining the unmet design targets. No test target is reduced.

A disposable `/tmp` copy of the current source generated default electrical/layout/schedule exports with `--electrical --export-electrical`. The electrical systems JSON and CSV matched the owning files; layout records matched after excluding only `savedAt`. All six statue envelopes, IDs, positions, catalogue specifications, circuits and routes therefore retain their register values. No equipment/line/vertex change requires a workbook or plan update; concurrent category workbooks and their entered fields are preserved. `export-comparison.json` records this comparison.

Passed: `node scripts/verify_sculpture.cjs`; `node scripts/verify_model.cjs`; `node scripts/verify_simulator.cjs --report --estimates`; and the disposable export snapshot's `--electrical --export-electrical` run. Web prepare-viewer/check-viewer passed for 73 files / 71,216,973 bytes; `npm exec vitest run tests/unit/viewer-files.test.ts` from `web/` passed one test. `source.json` freezes source hashes and check status. Documentation local links, JavaScript syntax and `git diff --check` passed.

The calculation audit retains the existing 0.9/1.4 dB ambo/altar feedback margins, about 11% of seats below the 200 lux brief, wing clarity minimum/average about 0.409/0.483 and local air minimum about 0.05 m/s. Passing the audit verifies calculations, not these unmet design targets.

## Desktop review blocker

The owner authorized browser review, opened the viewer and replied “ready” after being asked to enable the local origin. The browser tool still returned a saved permission denial for `http://127.0.0.1:8765`; the user-opened `file://` URL was also blocked by URL policy. No alternate browser surface or indirect screenshot method was used to bypass that denial. There are no new desktop screenshots and no claim that the refined faces, hands, beard transitions or carving have been visually inspected.

**USER CONFIRMED, 25 October 2026:** the owner answered **“Authorize this pass and commit”** when asked to allow source/headless verification only for this pass and the required local commit. This is the explicit exception permitted by AGENTS.md when required verification cannot run. Desktop inspection remains pending, and this exception does not authorize pushing, merging, fabrication or later unreviewed visual changes. Existing feedback, lighting, speech, airflow, concealment, access and structural/product holds remain. Automated checks cannot approve their engineering performance or these sculptures' artistic quality.
