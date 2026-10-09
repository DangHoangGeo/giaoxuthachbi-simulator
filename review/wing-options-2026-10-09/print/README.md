# Wing review print/export checks

Checked 9 October 2026 against the held wing design. These are model-data and
print checks, not product approval, performance validation or construction
authorization. The [44-sheet A3 PDF](../../../output/pdf/thach-bi-electrical-review-A3.pdf)
and every title block remain **DESIGN DEVELOPMENT / NOT FOR CONSTRUCTION**.

The final snapshot contains 326 simulator items and five enclosures: 331 current
equipment/enclosure register records, 296 shown connected components, 343 current
routes and 2,775 current vertices. The workbooks also retain four former wing
ceiling-fan drop routes and their 12 original vertices as Retired (347 line rows
and 2,787 point rows in total). No equipment IDs were retired. The exact retired
IDs are recorded in [preservation-check.json](preservation-check.json).

The reviewed configuration has eight small chandelier concepts L63–L70, eight
F5 wing wall fans (four mounts at +3.500 m and four at +2.700 m), six F2 nave wall
fans shown and Off, and 14 F1 nave ceiling fans. Existing airflow, noise, speech,
lighting, concealment, mounting and maintenance holds remain; see the
[owning wing review](../../../docs/engineering/wing-review.md).

## Reproducible checks

Run from the repository root with the bundled Node/Python and artifact runtime:

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow \
  --preview-dir review/wing-options-2026-10-09/print/registers
python3 scripts/build_review_drawings.py
python3 scripts/verify_review_drawings.py
FONTCONFIG_FILE=/tmp/thachbi-fonts.conf pdftoppm -png \
  -scale-to-x 1350 -scale-to-y -1 \
  output/pdf/thach-bi-electrical-review-A3.pdf \
  review/wing-options-2026-10-09/print/pages/sheet
```

- [Electrical export log](electrical-export.log): routing checks passed, 296
  installed components and 343 selectable routes.
- [Register refresh log](register-refresh.log): all six workbooks refreshed;
  preservation/retirement/position-proposal checks passed, geometry formulas
  recalculated, no formula errors found. Prior workbook backups are listed.
- [Preservation check](preservation-check.json): every old equipment/route ID
  retained, named amber fields unchanged, all retired coordinates retained,
  frozen sources unchanged and the three unrelated `exports/` files untouched.
  The actual old named amber fields were blank; the workflow test also exercised
  an entered value and a proposed move in memory.
- [Generated-data audit](generated-audit.json): independent XLSX XML checks for
  exact current equipment/route/vertex ID coverage and geometry; all 343 cached
  Excel route lengths; six workbook hashes; 21 PDF source hashes; five PDF
  companion hashes; 54 generated local links.
- [PDF verification](pdf-verify.log): all 44 pages are landscape A3; exact
  equipment and route IDs, CSV endpoint/vertex coordinates and independent 3D
  lengths agree. Nine stale-input probes were refused without changing the
  delivered set. No off-page/tiny-text warnings were found.
- [Render log](pdf-render.log) and [raster summary](contact-render.log): all 44
  pages rendered at 1,350 × 955 pixels using the requested Fontconfig file; no
  blank pages. Four PDF contact sheets were inspected. The L8, F1, F5 and F2
  circuit sheets and installation sequence sheet SQ-02 were also viewed at full
  raster width. All six workbook sheet formats were inspected from previews,
  including changed lighting/fan rows and the four retired route rows. No
  blocking clipping, table collision or missing-sheet defects were found.

## Snapshot binding

The complete source list and output hashes are in
[the PDF manifest](../../../output/pdf/manifest.json). The Git base is
`f9f4b5c4708afccbd1ba43522710cb09bd275876`; source hashes bind the reviewed working tree captured before its commit.

| File | SHA-256 |
| --- | --- |
| `Thach_Bi_Viewer/simulator/design.js` | `95ab9cdc750b49f32c5e7331d5606f9acd17d3d38012cb53a6d06ad69907b81e` |
| `docs/electrical-grid/equipment-layout.json` | `53ff13ffefd2679cbf8d12a1e21bde566f40af08275ae4f0ff95823f70ea1b77` |
| `docs/electrical-grid/electrical-systems.json` | `c883a38876b1d2b04788046ec5e1d87651113aa8dbfeb0f5415ba0b829f004ab` |
| `output/pdf/thach-bi-electrical-review-A3.pdf` | `41328d7a20463400ae6f8a6ef8c22bf4bdd7104a62d2e02027c14f1b6e593ddc` |

Files with `-superseded` in their name record the paused provisional export
before the fan-height correction. They are retained as history. The current
`preservation-before.json` binds the final corrected source before refreshing
the existing workbooks. `registers-before/` shows their prior sheet format.

The drawings use model-grid context and procedural equipment reference points.
Projected lines may overlap; use the printed coordinate tables, stable route
index and lossless CSV vertices to trace the same route in the viewer. The
checks do not validate every rendered vector segment, physical supports,
selected products, field dimensions or installation readiness.
