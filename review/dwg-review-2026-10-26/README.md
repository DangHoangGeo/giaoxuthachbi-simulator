# CAD PDF export and dimension-register review

Review date: **26 October 2026, Asia/Tokyo**. Source: DWG saved 23 October 2026, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Owner instruction in this session: use this DWG as the project design standard. **In development / Đang phát triển. Not for construction / Không dùng để thi công.**

## Scope and result

- Located the exact requested filename under `docs/layout_design/dwg-2026-10-23/`; its bytes match the already registered source copy. Original drawings are unchanged. The loose DWG alias is now ignored alongside the protected source directory, preserving publication hold H1.
- Produced 27 A2 full vector views and 37 A3 enlarged vector crops, individually and in bookmarked volumes. Every crop has its exact source drawing and model-space boundaries in the local export manifest. The two combined drawing volumes have 28 and 38 pages including their guides, with zero embedded raster images.
- Added 79 selected dimensions/levels/positions and 21 grid positions to a separate derived workbook and CSV, plus a 12-page dimension guide. The key selection includes grid distances, envelopes, tower heights, facade levels/radii/plan positions, nave columns, sanctuary floors/steps, window/door witnesses and steel/concrete arch-frame witnesses. The complete original register remains the source for all 726 DIMENSION records.
- Changed five literal text cells in the main dimension workbook: `Open items!F30`, `G30`, `I30`, `C31`, and `DWG sheets!A4`. The owner-selected project basis is explicit; construction issue remains ENGINEERING HOLD. ISSUE-R02's statement about the superseded model is corrected. Rows 30/31 are 120 points high to display the changed wrapped text.
- Preserved original source values, cell IDs, formulas/caches, styles, tables, filters, print settings and annotations. Artifact Tool authored the values and layout changes; a guarded ZIP-part patch applied only the selected text cells and row heights. Every other ZIP part is byte-identical to the backup; every other logical cell value is unchanged. The local backup and preservation report are under the ignored export folder.
- Regenerated `Thach_Bi_Viewer/construction-data.js` from the revised workbook. Its changed content is the workbook hash and ISSUE-R01/R02 text; no model geometry, material, equipment, circuit, route or analytical input changed. The electrical category registers and total report were already modified on entry and were preserved without refreshing them, because this review changes no equipment or line.

## Verification

| Check | Result / extent |
| --- | --- |
| DWG identity | Both local copies equal the registered SHA-256 |
| CAD measurement audit | All 726 DIMENSION handles, measured values and two endpoints agree with the existing CSV within its 0.1 mm rounding; all 726 workbook entries match that CSV |
| Existing supplementary registers | 79 level-label rows and 137 grid-check rows retained; existing 21 grid-centre coordinates reused without changes |
| Facade geometry | `python3 scripts/extract_dwg_revision.py facade`: 32 traced records checked against current CAD, tolerance 1.5 mm |
| Excel validation | New workbook values independently compared to generated JSON; formula-error scan found no errors; all three new sheets and changed existing rows rendered and visually inspected |
| Preservation | Five text cells and two row heights only; unchanged ZIP parts byte-identical, original dimensional/formula cells preserved |
| PDF validation | All 27 full views and 37 crops visually inspected in contact sheets; the dimension guide rendered; selected detailed pages inspected at larger size; both drawing volumes contain zero raster images |
| Construction check | `node scripts/verify_construction.cjs`: passed before and after; 102 grid spacings, 463 dimension records, 27 issue records, 12 phases |
| Web copy | `node scripts/prepare-viewer.mjs` and `npm run check:viewer`: 75 files copied with exact inventory/byte/hash match |
| Web boundary | `npm run check:boundary`: no forbidden markers; checks existing local build/trace plus current published viewer copy, not a fresh production build |
| Desktop visit-only | Opened `OPEN_CHURCH.html?visit`, Site view, grid and Checks tabs. Confirmed updated ISSUE-R01 text and retained R02-R05 holds; no Simulator panel in navigation, no issue-edit/import/save controls; no console errors captured. [Screenshot](desktop-visit.png) shows the decision and holds. |
| Syntax / whitespace | Python compilation, Node syntax check, `git diff --check` |

The desktop screenshot reflects the full working tree, including pre-existing uncommitted facade changes. This review does not claim to have authored or verified those changes. This is a records/export change; day/evening model appearance, equipment physics and hardware operation are outside its scope. Existing sound-feedback, wing-speech, lighting, ventilation and sightline limitations remain open; no simulation target was altered or reclassified.

## Outstanding decisions and limitations

- Within the DWG: 67,063.6 mm plan extent versus 67,149.4 mm longitudinal-section extent; +750 mm plan platform label versus +800 mm section; ridge at +12,396.4 mm versus +12,472 mm labels/longitudinal section; 6,324/6,325 mm cornice references. All original witnesses remain visible. Owner basis selection does not resolve these internal geometric conflicts.
- No roof plan is present. Local u/v details cannot establish global XYZ without a documented transform. Window/door witnesses do not establish an approved fabrication schedule; arch dimensions do not establish steel sections, reinforcement, connections or capacity.
- LibreDWG conversion, inferred millimetre units, CAD font substitution and manual drawing-frame inventory remain limitations. PDFs are fit-to-page; their scale is not calibrated. Native AutoCAD/ODA plot comparison and responsible designer review remain unverified.
- The DWG and PDF drawings stay local in ignored paths under H1. No file was uploaded, pushed or published; no publication or construction approval is implied.

## Reproduction and handover

See the [CAD package README](../../docs/layout_design/dwg-2026-10-23/README.md). `export_dwg_review.py` audits the source, renders vector sheets and crops, and builds the source JSON/CSV for the key register. The bundled Artifact Tool builds `Thach_Bi_Key_Dimensions.xlsx`; `apply_dwg_workbook_review.py` refuses to overwrite a main workbook changed since its local snapshot. `build_construction_data.py` refreshes the derived viewer data; `build_dwg_dimension_report.py` renders the readable guide.

`package_dwg_review.py` independently reopens both new workbook views, compares all 79 key records and 21 grid records to their generated source, reopens all PDF pages, checks notices and absence of raster images, then writes/tests the local ZIP. Delivery: 79 files, approximately 317.6 MB. SHA-256 hashes of every packaged file are in the local `delivery-sha256.json`.

Generated full drawings, raw vector intermediates, contact sheets, register previews, the original workbook backup and detailed logs are in `exports/dwg-review-2026-10-26/`. Source selection, derived CSV/workbook, tooling, updated main register and this evidence are committed together; publication-held PDFs remain local. Next responsible discipline: architect/designer to reconcile the conflicting witnesses and issue coordinated construction drawings; structural and building-services designers to check their respective details.

Working-tree boundary: existing viewer/electrical edits were present on entry. During this session some older PDF/PNG sources were also moved to an untracked `docs/layout_design/old/` directory by another actor. Those moves and other unrelated edits are not included in this review's commit; nothing was restored, removed or restaged on their behalf.

## Follow-up audit and replacement reading package

The later [23102026 audit](../dwg-vietnamese-23102026/README.md) supersedes the unit interpretation and displayed-number extraction in this historical record: native DWG/DXF `INSUNITS=1`, 23 displayed values corrected from cached CAD text, ISSUE-R06 added. The original exports remain local historical outputs. Use the audited Vietnamese vector package in `exports/23102026_vector/` for current review; original raw vector pages are retained as its graphics source. Construction confirmation remains outstanding.
