# Final wing outputs — 9 October 2026

The frozen default model has two chandeliers, two above-window fans, one wall column speaker and a Peter/Paul pair per wing. All outputs are design development, with engineering and purchasing holds retained. Saved browser layouts are separate configurations.

Final correction: the stale installation-stage claim that four sampled seats miss the lighting brief was replaced with a reference to the matching per-seat calculation report. The current reading-point failures are 40 total, including 36 in the wings. The exact Vietnamese wording was updated. No physics, positions, ratings, IDs or settings changed. The source owner separately checks the actual offline viewer.

The builders recorded base Git revision `cbf47dad34bf680ff71e905965539e44aa653a0c`; the actual uncommitted source bytes identify this coordinated revision. [source-hashes.json](source-hashes.json) records **54 source / 42 output hashes** and all four verified owning manifests. Every captured hash matched at final inspection.

| Current output | Count |
| --- | ---: |
| Layout items + board enclosures / current register equipment | 320 + 5 / 325 |
| Shown / hidden / wired / commanded on | 310 / 15 / 286 / 261 |
| Current routes / vertices | 333 / 2,749 |
| Retired equipment / routes / vertices | 10 / 14 / 46 |
| EN / VI A3 pages | 44 / 44 |
| VI cable / Japan budget pages | 14 / 10 |
| Open engineering questions | 41 |

Owning outputs: [default schedules](../../../docs/electrical-grid/electrical-systems.json), [layout](../../../docs/electrical-grid/equipment-layout.json), [category manifest](../../../docs/electrical-grid/categories/manifest.json), [summary](../../../docs/electrical-grid/summary-report.md), [EN manifest](../../../output/pdf/manifest.json), [VI manifest](../../../output/pdf-vi/manifest.json), and [cable/budget manifest](../../../output/electrical-review/manifest.json). Compared with the committed schedule at the base revision, layout items change from 326 to 320 (ten removed, four unpowered pictures added), and routes from 343 to 333 (ten drops removed). Retired rows remain in the registers.

## Commands and results

Ran from the repository root using bundled Node **v24.19.0**, Python **3.12.14**, `@oai/artifact-tool`, and repository Noto Sans fonts. No alternate XLSX writer or duplicate operation marker was used.

```sh
THACHBI_NODE=/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node
THACHBI_PYTHON=/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
THACHBI_WORKSPACE_MODULES=/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules
THACHBI_MARKED=/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/marked/lib/marked.esm.js
THACHBI_REVIEW_EXPORTS=review/wing-revision-2026-10-09/exports
THACHBI_REVIEW_TOOLS=/tmp/thachbi-wing-register-review.UrtKe4
PATH=/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override:/Users/danghoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH

"$THACHBI_NODE" scripts/verify_simulator.cjs --electrical --export-electrical
THACHBI_WORKSPACE_MODULES="$THACHBI_WORKSPACE_MODULES" "$THACHBI_NODE" scripts/build_equipment_register.mjs --verify-workflow
"$THACHBI_NODE" "$THACHBI_REVIEW_TOOLS/snapshot-registers.mjs" . "$THACHBI_REVIEW_EXPORTS/registers/after-registers.json"
"$THACHBI_NODE" "$THACHBI_REVIEW_TOOLS/compare-registers.mjs" "$THACHBI_REVIEW_TOOLS/before-registers.json" "$THACHBI_REVIEW_EXPORTS/registers/after-registers.json" "$THACHBI_REVIEW_EXPORTS/register-preservation.json"
"$THACHBI_PYTHON" scripts/build_review_drawings.py
"$THACHBI_PYTHON" scripts/build_review_drawings.py --language vi
"$THACHBI_PYTHON" scripts/verify_review_drawings.py
"$THACHBI_PYTHON" scripts/verify_review_drawings.py --language vi --compare-language output/pdf
"$THACHBI_PYTHON" scripts/build_electrical_budget.py
"$THACHBI_PYTHON" scripts/verify_electrical_budget.py
```

[Electrical checks](electrical-export.log) passed **286 components / 333 routes**, including concealed routing. [Six-register workflow](register-refresh.log) passed populated keyed-input retention, retirement, complete XYZ draft handling and invalid-proposal rejection. [EN](drawings-en-verify.log) and [VI](drawings-vi-verify.log) each passed with **0 failures / 0 layout warnings**: exact coordinates, vertices, IDs, 3D lengths, A3 geometry, 13 invalid/stale-input refusals and unchanged delivered files. Language comparison confirmed identical snapshots, coordinate/vertex CSVs, scopes, scales and source revision.

[Cable/budget verification](cable-budget-verify.log) passed source/output/register freshness; independent load/current/ampacity/drop/path calculations; **333 routes / 323 cable pieces**; analytical cases; ten invalid-input refusals; pack/currency/hidden/100 V exclusions; all 41 questions; route IDs, Vietnamese glyphs, bounds and holds; and failed-PDF preservation. These software checks do not constitute engineering approval.

The prior frozen pass also ran `verify_model.cjs --plan`, `build_planning.cjs "$THACHBI_MARKED"` and the register builder with `--verify-workflow --preview-dir "$THACHBI_REVIEW_EXPORTS/registers"`. Plan and brief builds passed; existing sightline limitations remain. The final text-only refresh did not require new geometry or optional screenshots.

## Preservation

[Original before rows](baseline/before-registers.json), [final after rows](registers/after-registers.json), [preservation result](register-preservation.json) and [read-only helpers](tools/) are retained. Original workbook snapshots remain in `/tmp/thachbi-wing-register-review.UrtKe4/`; builder backup paths are in the refresh log.

The model-change comparison preserved **6,433 input cells exactly** (ten equipment fields and nine line fields per prior ID). Actual prior inputs were blank/pending; the separate workflow check exercised populated fields. Manufacturer/model/specification/approval, manual control/group, proposed coordinates, cable/containment/terminal/allowance and notes were neither inferred nor overwritten.

The [final text-refresh comparison](text-refreeze-preservation.json) preserved **6,473 input cells**, including the four new pictures’ 40 input fields. Every Equipment, Electrical Lines and Route Points table value across all six workbooks is identical to the first accepted pass. Default layout items, electrical components and routes are also identical as JSON values. Category ownership and complete retired records are preserved.

Retired equipment: `L64/L66/L68/L70`, `S275/S277`, and `F-WING-B-3/B-4/H-3/H-4`. Four earlier F1 wing drops plus their ten removed drops give 14 retired routes and 46 retained vertices; exact IDs are in the preservation JSON. S276/S278 and F240–F243 remain current. The four Peter/Paul records are unpowered decoration, board `null`, circuit `DECOR`, no route IDs and no lines. Every workbook retains **Read me / Equipment / Electrical Lines / Route Points**.

## Visual review and text delta

Before refresh, affected sound/light/air workbook ranges were rendered read-only. The first accepted pass retained normal six-workbook previews plus focused sound **54**, lighting **90**, air **106** and decoration **30** ranges. Full-size images inspected included S276 position/specification, S278 parameters, retired S275, sound line 14 lengths and retired line 47; L63 and retired L64; F240 and retired F-WING-B-3; and Peter’s position/specification. Pending fields are amber, retired rows grey. The final repeat comparison proves all these table values unchanged.

**Display limitation:** sound Equipment **AC22** contains S278’s full long JSON parameters, clipped within the existing row height in its PNG preview. The full value remains available by cell selection/export and in the after snapshot. Production row height and data were not shortened.

All **112 PDF pages** were rendered at 120 dpi and visually screened in **14 contact sheets** during the accepted numeric pass. Its byte-identical owning outputs, logs and PDF review evidence are archived under [before-installation-note-refreeze/](before-installation-note-refreeze/). Full-size sheets inspected included VI E-005, E-015, E-019, EQ-07, RI-08 and EN E-019; cable pages 1/9/10/11; budget pages 1/4/5/6/10. IDs, coordinates, route tails, 0.45 m wing-fan diameter, picture/column quantities, price scope, Q41 and printed holds were readable. No new blank/overflow PDF pages were observed.

[Final PDF delta check](text-refreeze-pdf-review.json) confirms that **only page 43 (SQ-02) text changed** in EN/VI. Both fresh [EN stage](pdf/en-SQ-02.png) and [VI stage](pdf/vi-SQ-02.png) images were inspected; the corrected lighting hold fits clearly. Other PDF text pages match the reviewed baseline. Cable and budget PDFs are **byte-identical** to their reviewed prior copies. Current render indexes explicitly link the earlier visual baseline and final page delta; the old contact sheets are historical geometry review evidence.

The final two page renders used `pdftoppm -f 43 -l 43 -singlefile -png -r 120` for each language, with `FONTCONFIG_FILE=/tmp/thachbi-wing-register-review.UrtKe4/fonts.conf`. A temporary font cache avoids changing global font settings. Renderers and workbook snapshotters checked unchanged source bytes. The retained helper code records the baseline range and contact-sheet methods.

## Loads, budget and remaining holds

Known modeled maximum mains proxy is **8,677.517626 W**; with 25% comparison reserve **10,846.897033 W**. Operating estimate is **5,552.950015 W**, **8.329425 kWh** per 1.5 h service / **333.177001 kWh** per 40 services. Cable centreline is **5,707.071892 m**, conditional quote **6,923.779081 m**, shared bundle excluded **583.921042 m**. No cable route or containment purchase length is approved.

DB2 feeder remains **80.683130 m**; comparison areas **35/50 mm²**, protection **20 A**, path drops **0.861891/0.775438%** from DB1. Actual supply, installation conditions, AV rack maximum, products, faults/PE/protection and complete demand remain pending.

Japan priced subset remains **JPY 895,996**: 16 Yamaha VXL1B-8 references × JPY 52,250 plus two audio-technica PRO49QL × JPY 29,998. Its JPY 104,500 increase follows two added column comparisons. Existing verified Japan observations were reused; full project costs and product fit remain unapproved.

The first VI build refused missing `held` translation without replacing delivered files; [failure evidence](drawings-vi-build-failure.txt) is retained. After source-owner repair, both languages were rebuilt. Earlier partial electrical export evidence is superseded by the final export. No PDF was built during the offline texture packaging pause.

Lighting minima, sound/feedback, air/noise, artwork dimensions/fixings, mounting, access and electrical/product approvals remain with the responsible specialists. No threshold, pending value or approval was changed to make checks pass. This output work did not reset browser storage, alter original drawings or unrelated user `exports/`, or perform Git mutations. The source owner handles the final logical commit.
