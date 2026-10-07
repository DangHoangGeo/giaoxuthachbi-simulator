# Workbook source inventory, 8 October 2026

This is a read-only inventory of the saved dimension workbook, six category registers and their paired saved snapshots. It preserves source strings, exact cells, units, basis/status labels, formulas and saved caches. It does not resolve source conflicts or assess engineering adequacy. No workbook was edited, rendered, recalculated or exported, and no simulator or network operation was run.

The extraction used the bundled Python runtime with standard-library ZIP/XML reads. An independent check used bundled `openpyxl` 3.1.5 in read-only mode. The sources remained unchanged by SHA-256. The starting branch was `eng/01-baseline`, HEAD `daadc10`; this delegated inventory made no Git mutations.

## Saved dimensions

[The dimension workbook](../../../docs/layout_design/Thach_Bi_Church_Dimensions.xlsx) contains these inventoried table records:

| Sheet | Records | Exact table locations |
| --- | ---: | --- |
| Dimensions | 463 | Header A7:M7; records A8:M470 |
| Model grid | 51 | Header A7:H7; records A8:H58 |
| Open items | 22 | Header A7:I7; records A8:I29 |
| Sources | 9 drawing sources | Header A7:E7; records A8:E16 |

Dimension IDs comprise 213 P records, 85 E records and 165 S records. Their original basis labels count 391 `Ghi trên bản vẽ / Explicit`, 57 `Tính từ bản vẽ / Derived`, and 15 `Cần xác nhận / Unresolved`. Source-unit cells contain `mm` for 360 records, `m` for 46 and blank for 57. Blank source values and units are retained as null in JSON.

The Open items status cells F8:F29 contain 20 `Chưa xác nhận / Open`, one `Giả thiết / Assumption` (F27) and one `Còn một phần / Partial` (F28). All 22 confirmation-value cells H8:H29 and all 22 new-reference cells I8:I29 are blank. Source conflicts, missing roof/member/column/finish/opening information and confirmation requests remain exactly as saved.

Sources A8:B16 map file numbers 1–9 to printed sheets **1, 2, 3, 6, 11, 4, 5, 12, 13**. Original filenames are preserved in D8:D16 and PDF page values in E8:E16. Convention notes in A20:C32 are preserved separately from the nine drawing-source rows. The original drawing pixels were not inspected in this extraction.

## Cells for the primary review

The following locators are inventory observations, not proposed replacements. `open-item-source-links.json` links every open-item source ID to its complete dimension record, including endpoints and basis.

| Subject | Saved cell evidence to inspect |
| --- | --- |
| Longitudinal grid/bays | Dimensions D8/E8/F8 = 1→2, 4900 mm; D10/E10/F10 = 2′→3, 4500 mm; D17/E17/F17 = 9→10, 7200 mm. Source references J8/J10/J17 are printed sheet 6, file 4. Model grid B8/E8 = axis 1, 0 m; B17/E17 = axis 9, 36.975 m; B18/E18 = axis 10, 44.175 m. |
| Centered transverse grid | Dimensions D23/E23/F23 = D→E, 7200 mm. Model grid B31/E31 = D, −3.6 m; B32/E32 = E, +3.6 m. Sources C25/C27 preserve the centering convention. |
| Roof length conflict already recorded | Dimensions E180/F180 = 54736 mm and E181/F181 = 54794 mm, with endpoints D180/D181 and notes M180/M181. Open items A8/C8/D8/E8/F8/G8 retain ISSUE-P01, its source IDs, saved 58 mm difference and Open status. |
| Main roof, courtyard and section height | Dimensions E306/F306 = +12.472 m, E310/F310 = −2.08 m, E311/F311 = 14476 mm; derived cache G448 = 14552 mm. Open items A15/C15/D15/E15/F15/G15 retain RFI-S01 and the saved 76 mm discrepancy. Model grid E51/F51 = 12.472 m/E049. |
| Roof pitch and side-wing ridges | Dimensions C218/F218 = slope_angle/mm with E218 blank; C219/E219/I219/M219 retain ridge_elevations, blank value, Unresolved basis and the main-ridge cross-reference. Open items C19/G19 (RFI-S05) and C26/G26 (ISSUE-C02) preserve the requests. The source unit in F218 is retained literally. |
| Cornice references | Dimensions E308/F308 = 6.325 m; G453 is the saved 6325 mm derived cache. Model grid E49 = 6.324 m and E56 = 6.325 m remain separate. Open items C16/D16/E16/F16/G16 preserve RFI-S02. |
| Wall profiles and opening identity | Dimensions E217/I217/M217 preserve blank wall/pier profile dimensions and Unresolved basis; E220/I220/M220 preserve blank opening heights with detail cross-references. Open items C18/G18 (inner/outer door heads), C24/G24 (inner/outer window identity), C28/F28/G28 (opening-type mapping, Partial) and C29/G29 (widths by witness) retain the source questions. |
| Column and foundation details | Dimensions A467/C467/E467/I467/M467 retain S162/RFI-S07, blank engineering dimensions and Unresolved basis. Open items A21/C21/D21/F21/G21 preserve the column/footing request. |
| Roof/floor/finish notes | Dimensions E328/F328 = 130 mm veranda-roof note; E350/F350 = 80 mm floor note; E385/F385 = 80 mm; E386/F386 = 130 mm. Open items C22/G22 preserve RFI-S08 and pending finish thicknesses. |
| Other recorded conflicts/assumptions | Open items rows 9–14, 17–18 and 25–29 retain opening-bay, wing-envelope, drawing-revision, sanctuary-feature, tower/facade, doorway, plan/elevation, ridge, symmetry, opening-type and width-by-witness records. Source strings, saved differences and statuses are in `open-items.csv`; no item was closed. |

## Category registers and saved snapshots

Each register has exactly **Read me / Equipment / Electrical Lines / Route Points**. All inventoried equipment, routes and vertices have `Current` record state.

| Category | Equipment/enclosures | Routes | Vertices |
| --- | ---: | ---: | ---: |
| Lighting | 220 | 241 | 2050 |
| Sound | 32 | 42 | 302 |
| Air system | 35 | 35 | 234 |
| Exit signs | 5 | 7 | 54 |
| Decoration | 30 | 0 | 0 |
| Distribution/controls | 5 | 4 | 41 |
| Total | 327 | 329 | 2681 |

The 327 records reconcile to **322 saved layout items plus five enclosure sources**. Saved counts are 306 shown records, 21 hidden alternatives, 286 connected components and 263 shown model items commanded on. There are no duplicate equipment IDs, route IDs or ordered route/vertex pairs, no retired IDs/vertices, and no equipment or route ID-set differences against the paired saved snapshots.

All **114 named retained engineering-input columns** were inspected across the six files. Every populated-record input cell is blank: manufacturers, product models, approved specifications, datasheet/approval references, manual-control IDs/groups, proposed XYZ, allowances, final cable/cores/cross-sections/containment, product/control/terminal/approval references and engineering notes. Completeness remains **0/327** specification-plus-source records, **0/286** physical-control mappings, **0/329** cable-plus-approval records and **0/319** non-bundle allowances. No complete or partial proposed XYZ is present. Imported planning specifications are preserved separately and are not counted as entered approved specifications.

For each workbook, primary source fingerprints are in **Read me B14/B15**, source paths in **B17/B18**, source version in **B16**, counts in **B5/B6**, retained-count text in **B7** and release status in **B23**. Equipment input headers occupy **Q6:Z6**; line inputs use **M6** and **Q6:X6**. `engineering-input-columns.csv` records the exact populated-record data range for every input column, including categories with empty line tables.

All **118 saved fingerprint/count comparisons match**: workbook SHA-256 values against the category manifest, layout/systems fingerprints against both the manifest and workbook Read me cells, category/total counts, and summary-report fingerprints/quantity rows. This records agreement of the saved files; it does not independently refresh the summary’s performance or energy estimates.

## Inventory files and checks

- `dimensions-workbook.json`: complete observed dimension-workbook cells, metadata and labelled table records.
- `dimensions-focus.json`: overlapping literal-source groups for grids/bays, levels, roofs, walls/openings and columns/supports; all model-grid, open-item and drawing-source records.
- `dimensions-summary.json` and the four dimension CSV files: counts, original status labels, unresolved records, exact cells and source strings.
- `open-item-source-links.json`: all 22 open records with the dimension rows named by their source IDs.
- `category-registers.json`, `register-id-index.csv`, `category-register-records.json`, `category-counts.csv` and `engineering-input-columns.csv`: sheet metadata, exact record cells/IDs/values/formulas, counts, inputs, duplicates and retirement inventory.
- `snapshot-comparison.json`, `source-fingerprints.json`, `inventory-method.json`, `verification.json`: saved-file comparisons, unchanged-source evidence, method and check results.
- `extract_inventory.py` and `verify_inventory.py`: repeatable read-only extraction and independent comparison, using the bundled runtime.

Checks passed: seven XLSX ZIP CRC checks, **43,057 independent cell-value comparisons**, **4,710 exact saved-formula comparisons**, all 118 saved fingerprint/count comparisons, CSV record counts and 15 source-file fingerprint rechecks. Primary integration normalised CSV record endings to LF and checked parsed-cell equality before/after; the extractor now writes LF. Saved formula caches were not recalculated. The owning documents checked were `docs/electrical-grid/register.md`, `docs/electrical-grid/categories/README.md`, `docs/electrical-grid/summary-report.md`, the saved manifest, and the register generator’s input schema; no model or owning-source changes are part of this inventory.

For a focused evidence review, use `focused-evidence-set.txt`. Primary integration retains that compact set. Four full extraction dumps repeat the unchanged source workbooks, snapshots and compact inventories and are excluded by the local `.gitignore`; regenerate them with `extract_inventory.py` before running `verify_inventory.py` in a fresh checkout. No source workbook was removed or changed.
