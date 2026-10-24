# Updated model image delivery · 24 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner requested multiple viewpoints of the updated church model, edited with the native image generator, and authorized added decorative realism. The [offline gallery](../../Thach_Bi_Viewer/references/00-overview/2026-10-24/index.html) contains six selected native PNGs: front day, front corner day, opposite corner evening, façade detail day, nave day and sanctuary evening.

## Source and generation

- [Capture record](model-inputs/capture.json): HEAD `fd6c7bb` plus the owner's existing uncommitted CAD façade/model changes, with exact viewer source hashes. The commit alone does not reproduce the captures. Six 1920 × 1080 actual WebGL canvas captures from headed desktop Chrome in visit-only mode; no page or console errors. Display cameras, roof/grid visibility and day/evening setting only. No model-file edits or engineering-layout import/export.
- [Initial prompts](prompts.json): one built-in `image_gen.imagegen` edit per source capture. No CLI/API fallback and no third-party drawing or photograph inputs.
- [Corrections](corrections.json): Assumption pose in wide daylight views; removal of an invented ground-floor statue in the evening image; removal of two invented upper nave windows.
- [Further evening correction](evening-correction.json): the first evening edit introduced a different ground-floor statue, which was removed. Neither discarded evening candidate is a final deliverable.
- [Nave exit-sign correction](nave-exit-sign-correction.json): restore the two near-door green signs omitted by the initial generation. The final concept retains the source's visible life-safety signs.
- [Selection](selection.json) and [asset manifest](../../Thach_Bi_Viewer/references/00-overview/2026-10-24/manifest.json): selected generator identifiers, source associations, dimensions, hashes, licence and limitations. Cache identifiers in these records are provenance; rejected intermediates need not be present in the repository.

All selected outputs are native **1672 × 941**, without cropping, resampling or enlargement. Each includes the bilingual development/construction-status footer. The six PNGs in `masters/` are byte-identical copies of their selected generated outputs.

## Review and scope

Visual comparison checked the major façade composition, three louver stages per tower, new triple window, upper Assumption niche, front doors, roofs, stairs, interior column rows and beams, red-and-gold sanctuary, clear aisle, obvious generated artifacts and readable development labels. The generated views are approximate and independent: moulding proportions, saint attributes, column bases, relief, paving, trees and distant landscape may differ. The site context is invented. Twilight tree illumination is artwork, not an electrical equipment proposal.

The nave omits visible fan blades and hangers to illustrate the owner's all-hidden brief. This does not hide or move equipment in the actual model, solve concealment, approve a physical enclosure or validate airflow, noise or maintenance. The original capture preserves the actual visible fan arrangement. Existing safety signs are retained in the final artwork; their pictograms are illustrative rather than a compliance assertion.

Documents checked: `docs/facade-model.md`, `docs/layout_design/dwg-2026-10-23/facade-plan.md`, `docs/sanctuary-model.md`, `docs/church-view-renderings.md`, `docs/engineering/central-view-constraint.md`, `docs/web/publication-permission.md`, `Thach_Bi_Viewer/references/manifest.json`, `Thach_Bi_Viewer/references/coverage.json` and `NOTICE.md`. No 3D geometry, physical positions, quantities, settings, electrical lines or engineering claims change, so no equipment/line register refresh is needed. The rendering document is updated in this delivery. No old reference asset is overwritten and no website content release is changed.

Remaining holds include the source drawing-set conflict, façade structure/drainage/service access, central statue/niche fit, front-gable fan discharge obstruction, and the existing lighting, speech/feedback, airflow and sightline limitations. Artwork review does not resolve them. No new engineering calculations are claimed.

## Reproduction

From the repository root, with the recorded working model and the existing Playwright dependency:

```sh
HEADED=1 node review/church-views-2026-10-24/capture.cjs
node review/church-views-2026-10-24/build-gallery.cjs
```

Capture regeneration uses the current working model and replaces only this delivery's source captures; it does not recreate a historical working tree or regenerate AI artwork. Preserve the capture hashes if making a new revision. Image generation is nondeterministic. `build-gallery.cjs` rebuilds the HTML and manifest from the saved native images without transforming them.

Project-created images are shared under CC BY 4.0 to the extent rights are held, subject to [NOTICE](../../NOTICE.md). Retain concept/development/construction labels when sharing. No deployment or push was requested.

## Verification results

- Actual model capture: headed desktop Chrome, 1920 × 1080, visit-only, day/evening views; no page/console errors in [capture.json](model-inputs/capture.json).
- Gallery: headed desktop Chrome, 1440 × 1000; all six native images and all six source-comparison panels loaded with no page/console errors. [Results](gallery-check.json), [desktop evidence](gallery-desktop.jpg). The saved gallery screenshot was visually inspected.
- Native/output and source hash checks: six native 1672 × 941 PNGs, twelve source/output hashes verified; no resampling; all gallery and delivery-README local links resolved.
- `node review/church-views-2026-10-24/build-gallery.cjs`: passed; metadata/HTML only, no image transformation.
- `node web/scripts/prepare-viewer.mjs` and `node web/scripts/check-viewer.mjs`: passed, 68 existing published-viewer files, 71,947,645 bytes, exact inventory/size/hash. The standalone new art gallery is not selected into the public web export.
- `node scripts/check-build-boundary.mjs` from `web/`: passed against the existing build `2kr-HZYsjDtdIBlECZSH0`, zero forbidden-marker/path failures. This is a boundary check on that saved build, not a new web build or deployment.
- `git diff --check`: passed. No model or simulator change was made in this delivery, so unrelated engineering simulations were not rerun and no existing target failure is claimed resolved.

The owner's pre-existing model, façade module, engineering documents, dimension workbook, category registers and export/script edits remain outside this image delivery's commit.
