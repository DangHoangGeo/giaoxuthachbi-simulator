# Church CAD revision, received 24 October 2026

The parish sent the AutoCAD file behind the drawing set on 24 October 2026: `MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg A.dwg`, AutoCAD 2007 format, created 27 October 2011, last saved 23 October 2026. This folder holds what was extracted from it. **Not survey data and not for construction.**

**USER CONFIRMED, 26 October 2026:** the owner selected `MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg` as the project design standard. The copy directly in this directory is byte-identical to the source copy (SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`). The different filename is an alias, not a later revision. Older PDF witnesses remain intact; internal DWG conflicts and construction engineering holds remain open. ISSUE-R01 now distinguishes the confirmed project basis from the responsible designer's construction issue.

## PDF views and key dimensions, 26 October 2026

The local, Git-ignored package is in `exports/dwg-review-2026-10-26/` from the repository root:

| Output | Contents |
| --- | --- |
| `01_All_Drawing_Views.pdf` | 27 vector drawing views on A2 sheets, plus an index; 28 pages |
| `02_Enlarged_Details.pdf` | 37 enlarged vector crops on A3 sheets, plus a guide; 38 pages |
| `03_Key_Dimensions_and_Guide.pdf` | 79 selected measurements/levels/positions, 21 grid coordinates, references and limitations; 12 pages |
| `04_Key_Dimensions.xlsx` | Copy of [Thach_Bi_Key_Dimensions.xlsx](Thach_Bi_Key_Dimensions.xlsx): key witnesses, grid positions and drawing index |
| `views/` and `details/` | An individual PDF for each of the 27 full views and 37 detail crops |
| `export-manifest.json` | Exact DWG crop boundaries and PDF paths, source hash and audit counts |
| `Thach_Bi_CAD_Review.zip` | The combined PDFs, individual PDFs, workbooks, source tables and manifest for local sharing/review |

PDF paths remain vectors; no raster image is embedded in either drawing volume. They are **fit-to-page, not calibrated plotting scales**. Use the recorded dimensions and endpoints rather than scaling a print. The original DIMENSION graphics are retained. Fonts/line styles can differ from a native AutoCAD plot; native-CAD comparison remains unverified. The source contains 2D plans, elevations, sections and details; no new 3D perspective is inferred.

[key-dimensions.csv](key-dimensions.csv) is generated from the curated [selection](key-dimension-selection.json), the existing source tables and the workbook's model grid. DIMENSION rows retain their two endpoints and CAD handles. Facade rows reference `facade.csv`, including its separate Z/X mapping for tower-end plans. Level rows distinguish printed levels from marker checks. The original complete workbook retains all 726 DIMENSION witnesses and the older PDF entries.

Reproduce with LibreDWG and the dependencies in `scripts/requirements-dwg.txt`, then use the bundled artifact runtime for Excel:

```bash
python3 scripts/export_dwg_review.py
node scripts/build_dwg_review_register.mjs
python3 scripts/apply_dwg_workbook_review.py
python3 scripts/build_construction_data.py
python3 scripts/build_dwg_dimension_report.py
python3 scripts/package_dwg_review.py
```

The exporter reuses existing `_raw/*.pdf` files in its local export directory. **For a different DWG hash or changed renderer/inventory, use a fresh export directory or remove only those generated raw PDFs before running.** This dated workflow is for the hash recorded above. `--audit-only` checks the source hash and all 726 dimensions/endpoints without rendering. `--package-only` recreates the full/crop PDFs from the existing raw vector pages. See the [review record](../../../review/dwg-review-2026-10-26/README.md) for checks and preservation details. The ZIP is a local delivery artifact; it does not grant publication permission.

## What is committed and what is not

The drawings belong to the church's designers and are under publication hold H1 ([checklist](../../open-source/publication-checklist.md)). So:

| Path | Content | In Git |
| --- | --- | --- |
| `source/thach-bi-church-2026-10-23.dwg` | Copy of the received DWG (SHA-256 in `sheets.json`) and its DXF conversion | No (ignored) |
| `images/` | One PNG per drawing, sorted into `01-plans`, `02-elevations`, `03-sections`, `04-details`, plus `00-overview_all-drawings.png` | No (ignored) |
| `sheets.json` | Drawing inventory: DWG sheet number, title, frame, model-axis mapping, PDF counterpart, image path | Yes |
| `dimensions.csv` | All 726 DIMENSION objects in the drawings, measured value, displayed value, both measuring points in model axes, same-value register IDs | Yes |
| `levels.csv` | All 79 level labels, checked against the apex of the level marker drawn under each | Yes |
| `grid-check.csv` | Grid centrelines drawn in each plan, section and elevation against the workbook's *Model grid* | Yes |
| `facade.csv` | The central facade the model follows: 32 traced levels, arcs, faces and the pier chain, checked against the DWG, and three model departures | Yes |
| `facade-plan.md` | The work plan written before the facade was built (24 Oct 2026) | Yes |
| `key-dimension-selection.json`, `key-dimensions.csv`, `Thach_Bi_Key_Dimensions.xlsx` | Curated important measurements and positions, with source references; 26 Oct review | Yes |

The same data is in the dimension workbook `../Thach_Bi_Church_Dimensions.xlsx` on the sheets *DWG sheets*, *DWG dimensions*, *DWG levels*, *DWG grid check*, *DWG findings* and *DWG facade*. The DWG is source file 10 on *Sources*, and five new rows ISSUE-R01 to ISSUE-R05 are on *Open items*. The initial extraction preserved existing entries. The 26 October review changes only five text cells and two row heights: ISSUE-R01's basis/status/reference, ISSUE-R02's outdated model-history wording and the DWG sheet caption. All dimensional values, formulas, caches and engineering-input cells are preserved.

## Reproduce

Copy the received file to `source/thach-bi-church-2026-10-23.dwg`, then from the repository root:

```bash
brew install libredwg
```

```bash
python3 -m pip install -r scripts/requirements-dwg.txt
```

```bash
python3 scripts/extract_dwg_revision.py extract --render
```

```bash
python3 scripts/extract_dwg_revision.py facade
```

```bash
python3 scripts/extract_dwg_revision.py workbook
```

```bash
python3 scripts/build_construction_data.py
```

`extract` converts the DWG with LibreDWG's `dwg2dxf` and reads it with ezdxf. `workbook` rewrites the DWG sheets and adds the source and open-item rows once; openpyxl drops formula results, so the script copies every formula cell's cached value back from the original file and refuses to save if any is lost. `build_construction_data.py` refreshes the viewer's Site view data.

## Drawings in the file

Model axes follow the workbook: X from axis 1 toward the sanctuary, Y up from the nave floor ±0.000, Z from the D/E midpoint, positive toward H/I. Origins come from the drawn centrelines and the ±0.000 marker. Drawings without a grid use local u/v millimetres from the frame corner.

| ID | DWG sheet | Drawing | Axes | PDF counterpart (register file) | Dimension objects |
| --- | --- | --- | --- | --- | --- |
| P05 | 5 | Ground-floor plan +0.00 | X/Z | 4 (printed sheet 6) | 22 |
| P14 | 14 | Plan at +6.324 m (body) and +8.390 m (tower end) | X/Z | none | 16 |
| PT08 | — | Tower plan at +8.390 m | local | none | 4 |
| PT10 | — | Tower-end plan at +10.128 m | local | none | 0 |
| PT15 | — | Tower-end plan at +15.840 m | local | none | 0 |
| PT15A, PT23, PT29 | — | Single-tower plans at +15.84, +23.14, +29.09 m | local | none | 2, 0, 0 |
| P28 | 28 | Plan of one window bay | local | 8 (sheet 12) | 74 |
| P33 | 33 | Plan of one doorway bay, axes 4–5 (no title) | local | 9 (sheet 13) | 53 |
| E01A | 1 | Twin-tower end elevation, variant A (cut through the nave roof) | Z/Y | 1 (sheet 1) | 23 |
| E01B | 1 | Twin-tower end elevation, variant B (full elevation) | Z/Y | 1 (sheet 1) | 36 |
| E02 | — | Side elevation (no title) | X/Y | 2 (sheet 2) | 0 |
| E03 | 3 | Gabled-end elevation | Z/Y | 3 (sheet 3) | 9 |
| EW | — | Side-wing end elevations, outside and inside | local | none | 0 |
| ET | — | Single tower elevation | local | none | 0 |
| E26 | 26 | Window-bay wall elevations | local | 8 (sheet 12) | 35 |
| E31 | 31 | Doorway-bay wall elevations | local | 9 (sheet 13) | 30 |
| S24 | 24 | Nave transverse section | Z/Y | 6 (sheet 4) | 38 |
| S25 | 25 | Sanctuary transverse section | Z/Y | 7 (sheet 5) | 42 |
| S45 | 45 | Longitudinal section A-A | X/Y | none | 24 |
| S27 | 27 | Window-bay section A-A | local | 8 (sheet 12) | 64 |
| S32 | 32 | Doorway-bay section A-A | local | 9 (sheet 13) | 57 |
| D29 | 29 | Window detail without leaves | local | 8 (sheet 12) | 62 |
| D34 | 34 | Doorway detail without leaves | local | 9 (sheet 13) | 90 |
| D46 | 46 | Steel arch frame, side wings on axes C and G | local | none | 30 |
| D47 | 47 | Reinforced-concrete arch frame, side wings on axes C and G | local | none | 15 |

Not in the file: the roof plan (register file 5, printed sheet 11) and the site plan, of which only the 23-item legend text survives. A note “Cột gỗ nối cũ và mới” (joining old and new timber columns) stands far from any drawing with nothing attached.

## Comparison with the PDF set and the model

- **Grid: unchanged.** Every axis drawn in P05, P14, E01A/B, E02, E03, S24, S25 and S45 is within 0.1 mm of the *Model grid*.
- **Levels: unchanged except the ridge.** Of the 79 level labels, 21 are plan labels or have no marker; 56 of the other 58 sit on their markers within 1 mm, including all tower levels (+8.390 to +36.920 m) and the side-wing levels +6.324, +9.830 and +15.187 m. The two exceptions are the “+12,472M” labels in sections S24 and S25, whose markers are at +12.396 m. The side elevation also draws its 45 m ridge line at +12.396 m, while section A-A draws the ridge at +12.472 m (ISSUE-R05, RFI-S01).
- **Central facade: a different design** (ISSUE-R02). DWG sheet 1 has one pedimented arched niche with a cross between crested parapets; PDF sheet 1 has three pinnacled gables. Since 24 October 2026 the model follows the DWG (below).
- **Sanctuary section: a different revision** (ISSUE-R03, ISSUE-R04). Platform 800 mm (PDF 750); side-opening chain 160 / 2,544 / 466 / 4,392 (PDF 150 / 2,554 / 396 / 4,462); inner heights 6,231 and 8,525 (PDF 6,301 and 8,452).
- **Ground plan: fewer dimensions.** The DWG plan carries 22 dimension objects; the opening chains and overall widths of PDF sheet 6 are not among them.
- New evidence for existing open items (EI02, RFI-S01 to S03, ISSUE-C01 to C03, C05, P05) is listed on the workbook's *DWG findings* sheet. Their statuses are left for the owner.

## Levels adopted by the owner

On 24 October 2026 the owner directed the model to follow this file. The workbook's *Model grid* now records the levels the model uses, with both sources named: sanctuary dais +0.800 (P049 750 in the PDF set; DWG0378), side floors +0.160 (P050/P052 150; DWG0373). The PDF values stay unchanged on *Dimensions*, and ISSUE-R04 stays open for the church. `extract_dwg_revision.py workbook` applies these rows once (`ADOPTED_LEVELS`). See [sanctuary-model.md](../../sanctuary-model.md) for what moved in the model.

## Central facade adopted by the owner

On 24 October 2026 the owner directed the model to follow this file's central facade as well. Above +8.45 m, `Thach_Bi_Viewer/facade.js` builds the upper storey, niches, cresting, pinnacles and the aedicule with its cross (+24.648 m) from drawing E01B and the tower-end plans at +10.128 and +15.840 m. `facade.csv` holds the values, and `extract_dwg_revision.py facade` finds each one in the DWG within 1.5 mm. The doors and ground storey were already in agreement and are kept. See [facade-model.md](../../facade-model.md). ISSUE-R02 stays open for the church; overlay checks are kept, not committed, under `images/05-facade-check/`.

## Limits

- Only DIMENSION objects and level labels are read as numbers; every other text is a title, axis label or material note. The DWG carries fewer dimensions than the PDF set, so a value printed on a PDF but absent here is not dimensioned in this file. E02, EW and ET have no dimension objects, and E02, ET and P33 have no title.
- The file sets no drawing units. Millimetres are inferred from the dimensions, which agree with the printed values.
- LibreDWG reads AutoCAD 2007 files with known gaps. The model space converted completely (148,675 entities; 22,529 block references and other content sit in unused block definitions), but a check in AutoCAD or ODA software is still advisable before the data governs construction.
- “Same-value register IDs” are matches by value on the corresponding PDF sheet only. They are candidates, not confirmed witnesses.
- Level markers are read by geometry: the marker apex lies 0.4837 × text height below the marker's top line on every marker size in the file.
