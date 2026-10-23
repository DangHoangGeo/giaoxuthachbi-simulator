# Church CAD revision, received 24 October 2026

The parish sent the AutoCAD file behind the drawing set on 24 October 2026: `MẶT BẰNG NHÀ THỜ GIÁO XỨ THẠCH BI.dwg A.dwg`, AutoCAD 2007 format, created 27 October 2011, last saved 23 October 2026. This folder holds what was extracted from it. **Not survey data and not for construction.**

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

The same data is in the dimension workbook `../Thach_Bi_Church_Dimensions.xlsx` on the sheets *DWG sheets*, *DWG dimensions*, *DWG levels*, *DWG grid check* and *DWG findings*. The DWG is source file 10 on *Sources*, and five new rows ISSUE-R01 to ISSUE-R05 are on *Open items*. No existing workbook entry, value or status was changed.

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
- **Central facade: a different design** (ISSUE-R02). DWG sheet 1 has one pedimented arched niche with a cross between crested parapets; PDF sheet 1, which the model follows, has three pinnacled gables.
- **Sanctuary section: a different revision** (ISSUE-R03, ISSUE-R04). Platform 800 mm (PDF 750); side-opening chain 160 / 2,544 / 466 / 4,392 (PDF 150 / 2,554 / 396 / 4,462); inner heights 6,231 and 8,525 (PDF 6,301 and 8,452).
- **Ground plan: fewer dimensions.** The DWG plan carries 22 dimension objects; the opening chains and overall widths of PDF sheet 6 are not among them.
- New evidence for existing open items (EI02, RFI-S01 to S03, ISSUE-C01 to C03, C05, P05) is listed on the workbook's *DWG findings* sheet. Their statuses are left for the owner.

## Limits

- Only DIMENSION objects and level labels are read as numbers; every other text is a title, axis label or material note. The DWG carries fewer dimensions than the PDF set, so a value printed on a PDF but absent here is not dimensioned in this file. E02, EW and ET have no dimension objects, and E02, ET and P33 have no title.
- The file sets no drawing units. Millimetres are inferred from the dimensions, which agree with the printed values.
- LibreDWG reads AutoCAD 2007 files with known gaps. The model space converted completely (148,675 entities; 22,529 block references and other content sit in unused block definitions), but a check in AutoCAD or ODA software is still advisable before the data governs construction.
- “Same-value register IDs” are matches by value on the corresponding PDF sheet only. They are candidates, not confirmed witnesses.
- Level markers are read by geometry: the marker apex lies 0.4837 × text height below the marker's top line on every marker size in the file.
