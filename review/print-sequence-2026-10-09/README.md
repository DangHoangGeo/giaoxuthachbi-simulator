# Printable routes and 3D sequence review

Source main `3890bfe`; branch `eng/09-print-and-sequence`. Owner requested printable engineering drawings and a 3D step sequence, then explicitly required a reusable Python exporter. This is a bounded review-tool delivery, not completion of held engineering phases E2-E6. The later request to redesign wing lighting/fans is tracked separately: this PDF is the pre-wing-review baseline.

## Delivered

[Python generator](../../scripts/build_review_drawings.py) and [workflow](../../docs/electrical-grid/print-drawings.md). Forty-two A3 landscape pages: cover; 21 circuit/distribution scopes; equipment naming tables; unique route index; nine proposed installation-coordination stages on three sheets. Default-plan scale 1:200, height projection 1:500; 100 mm print-calibration line. Counts: 286 connected items, 329 routes and 2,681 vertices. Hidden alternatives and non-electrical furnishings are excluded from the printed installed-study schedule, retained in source registers.

The Python program invokes the actual model through Node, validates source/system/workbook fingerprints and full JSON equality, and recomputes centreline lengths before publication. It fails without replacing delivered files if the fresh model/register set disagrees. Companion CSVs retain full numerical coordinates; the PDF rounds for display. Rebuilding after coordinated additions/removals updates counts, scopes, pages and labels automatically. Browser-edited layouts require the separate adoption/register workflow.

Local **Simulator → Wiring → Start 3D walkthrough** provides Previous, Next review step, Reset stage view and End walkthrough. It filters and frames existing geometry without physical commands. Each step states a task and unresolved hold. End restores the prior electrical filters/mode and architecture; the last review camera remains. Stage text is the same source used in the PDF.

## Checks

- `python3 scripts/verify_review_drawings.py`: 42 A3 pages, exact equipment/route identities and ownership, printed coordinate/length correspondence, 2,681 lossless CSV vertices, independent Euclidean length sums, manifest/source/output hashes, all footers/holds and sheet index. Nine invalid snapshot/source/register probes rejected; delivered files untouched. No off-page glyphs, undersized text or overlap warnings.
- Rendered all 42 final pages using Poppler with a writable temporary font cache. Primary inspected all seven [contact sheets](pdf/contact-1.jpg) plus representative full-page plan and route-index views. Labels, tables, scale bars and holds are legible; no clipping seen. Print dimensions are verified mathematically; no physical printer was available.
- `node scripts/verify_model.cjs`: passed.
- `node scripts/verify_simulator.cjs --report --estimates`: passed software/calculation audit including electrical routing; existing unmet targets retained. Compressed logs are adjacent.
- `node scripts/verify_installation_review.cjs`: passed 51 transitions across three entry states, invalid inputs, exact item/settings/history/export preservation and restoration; no mutation APIs called.
- `HEADED=1 PLAYWRIGHT_MODULE=<installed Playwright> node scripts/verify_installation_review_browser.cjs`: actual desktop Chrome passed all nine stages, Previous/Reset/End, reload, day/evening and 1600 × 1000 / 1366 × 768 controls. Seventeen snapshots; zero console/page errors. Primary inspected the distribution, lighting, evening air and restored views in [desktop evidence](desktop/results.json).
- Changed local links/path references and `git diff --check`: checked before commit.

No equipment IDs, dimensions, positions, aim, operating states, analytical inputs, circuit allocation or route vertices were changed by this package. Reviewed electrical routing/controls/register/category/summary docs and simulator guide. Existing register set remains matched, so no workbook refresh is warranted for these display/print tools. Full export equality and workbook hashes are enforced by the builder.

## Unresolved

Baseline feedback margins remain about 1.2/1.7 dB vs 3 dB; wing STI minimum .439 vs .45 test floor and .60 brief; four of 368 receivers miss 200 lux. Air/noise, concealed installation, structure/access, selected-product data, actual supply/earthing/fault level, cable/protection, physical control mapping and life-safety design remain held. A view step or a printed line is not an approved installation procedure. No web deployment or stale hosted-GLB repair is included.
