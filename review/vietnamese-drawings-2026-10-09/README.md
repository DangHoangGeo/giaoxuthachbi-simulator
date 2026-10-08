# Vietnamese A3 electrical drawing review

Source default model commit `eefc2712fde7e5f788ca8dad7c10adc016d7988e`, branch `eng/10-wing-review`. Implemented and reviewed on 9 October 2026. The owner requested a Vietnamese version of the existing 44-page paper set while retaining its reusable Python exporter. This delivery changes display language and export/verification tooling. Equipment, model geometry, aim, states, route vertices, physics, targets, registers and source documents are preserved.

## Delivered scope

- [Vietnamese PDF](../../output/pdf-vi/thach-bi-electrical-review-A3-vi.pdf): 44 landscape A3 pages, comprising the cover, 23 circuit/distribution scopes, equipment tables, unique route index and nine installation-coordination stages on three sheets. Counts remain 296 connected items, 343 unique routes and 2,775 vertices. Plan 1:200; longitudinal height projection 1:500. The calibration segment remains 100 mm.
- [English PDF](../../output/pdf/thach-bi-electrical-review-A3.pdf) and manifest refreshed from the same source commit. Its PDF is byte-for-byte identical to the original exporter when both use the same fresh snapshot. The previously delivered snapshot named `f9f4b5c`; the current snapshot names `eefc271`, explaining the changed English footer/hash without a drawing behavior change.
- [Exporter](../../scripts/build_review_drawings.py), [translation module](../../scripts/review_drawings_i18n.py), [independent verifier](../../scripts/verify_review_drawings.py) and [rebuild workflow](../../docs/electrical-grid/print-drawings.md). `--language en|vi` selects separate default output folders. Existing opposite-language manifests/PDFs are refused before writing. Translation or glyph omissions stop publication.
- [Local Noto Sans fonts](../../scripts/fonts/README.md), unmodified from runtime 26.909.12148 with their copyright and full SIL Open Font License 1.1. Vietnamese regular/bold fonts are subset-embedded and include Unicode mappings; installed system fonts/network access are unnecessary.

Titles, labels, equipment names/categories, reading notes, lookup/control notes, all stage tasks and all engineering holds are Vietnamese. Stable equipment/board/circuit/route/grid IDs, revision codes, source filenames, unit symbols and technical format/product acronyms such as LED, PDF, CSV and 3D retain their form. Some stable route IDs contain English words; these are identifiers. The canonical source snapshot and coordinate/vertex CSVs retain their source-language descriptive fields and schema, identically in both language folders, for audit and downstream compatibility.

## Checks and visual evidence

Using the bundled Python runtime with ReportLab, pypdf and pdfplumber:

```sh
python3 scripts/build_review_drawings.py --language en
python3 scripts/build_review_drawings.py --language vi
python3 scripts/verify_review_drawings.py --language en
python3 scripts/verify_review_drawings.py --language vi --compare-language output/pdf
```

[English log](verify-en.txt) and [Vietnamese log](verify-vi.txt) report zero failures and zero layout warnings. The checks independently reconcile every printed ID, equipment description/name, coordinate, route length and home-run length; all 2,775 lossless vertices; source/output/workbook hashes; page scopes and dimensions; titles/footers/holds; all nine complete stage tasks and holds; and embedded Vietnamese font mappings. They reject nine stale/invalid source/register cases, an opposite-language output directory and three missing-translation cases. Delivered files remain untouched during verification.

[QA results](qa-results.json) record:

- Original versus updated English exporter PDF byte equivalence using the same snapshot.
- Repeated fresh builds of all six delivered files in each language, byte-for-byte identical, including the manifests.
- Identical English/Vietnamese source snapshots and numeric CSVs, equipment/route identities, page scopes, counts, scales and engineering source revision.
- Every final raster's SHA-256 and the PDF hashes below.

Poppler rendered all 44 Vietnamese pages at 110 dpi. All 11 contact sheets were inspected, starting at [contact 01](pdf/contact-01.jpg) and ending at [contact 11](pdf/contact-11.jpg). Full-size detail inspection covered the [cover](pdf/page-01.png), [held F5 plan](pdf/page-16.png), [concept chandelier rows](pdf/page-26.png), [brass/sanctuary rows](pdf/page-27.png), [fan rows](pdf/page-31.png), [speaker/microphone rows](pdf/page-32.png), [signal home runs](pdf/page-41.png) and [all](pdf/page-42.png) [nine](pdf/page-43.png) [stages](pdf/page-44.png). Vietnamese accents, labels, columns, calibration, legends and engineering holds were legible, with no clipping, visible glyph failures or text overlap.

After wording refinements for brass, opal, fan location qualifiers and the audio home-run heading, all pages were rendered again. Thirty page rasters were unchanged. The 14 changed pages were reinspected in updated contact sheets and relevant detail views. The audio heading covers both speaker and microphone home runs. A physical printer was not available; the paper scaling/measurement procedure still needs an actual 100% A3 print check.

Documentation links and `git diff --check` were checked. Governing sources inspected include `AGENTS.md`, the previous print review, print workflow, electrical README/routing/controls, central-view constraint, wing review, model adapter and the matched snapshot/export manifests. The controls and physical/concealment limitations are retained. No viewer behavior or equipment/register change is made, so unrelated model/GPU/scene tests and register refresh are not warranted by this translation; the builder enforces their existing matched fingerprints.

## Hashes and limitations

English PDF SHA-256: `53edc4cb0d4bb8f3fb6062d09296d98daf47cb1ab6c5eea450a295d7ecb2bb04`.

Vietnamese PDF SHA-256: `da16e876336af21aa748cfd5a444e53975fc5ca5984f711303e3115285643761`.

All existing selected-product, physical control/channel, supply/phase/earthing/fault level, cable/protection, structural mounting, installation/maintenance access, sound/feedback, air/noise, concealment and life-safety holds remain. The nine steps are a proposed coordination sequence, not a method statement or authorization to install, conceal, energize or commission. This is design development, not construction approval.

The original source cover/stage text includes a historical four-seat lighting shortfall. The current [wing review](../../docs/engineering/wing-review.md#compared-outcomes-and-the-held-review-choice) reports a nominal full-service minimum of 203.70 lux, while keeping those formerly dim seats physically unverified; other scenes and sensitivity cases still fail. This translation preserves the original stage text and does not update its numerical claims. Current scenario results must come from the coordinated engineering record, not the inherited baseline sentence.

[Changed file list](changed-files.txt) identifies this translation's exact modified/new files and excludes unrelated work and the separate `exports/` folder.
