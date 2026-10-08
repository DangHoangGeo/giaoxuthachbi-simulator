# Printable electrical review drawings and 3D sequence

Implemented 9 October 2026 for the **local default model**. These are design-development review sheets, not approved installation, fabrication, procurement or construction documents. The current sheets include the [held wing lighting/fan review](../engineering/wing-review.md), with matched equipment, routes and category registers. The wing proposal remains on the engineering branch because noise, speech, air, photometry and physical installation criteria are unresolved.

## Rebuild the paper set

The reusable [Python program](../../scripts/build_review_drawings.py) generates [the English A3 PDF](../../output/pdf/thach-bi-electrical-review-A3.pdf) and [the Vietnamese A3 PDF](../../output/pdf-vi/thach-bi-electrical-review-A3-vi.pdf), each with its own sheet index, equipment coordinates, route vertices, complete model snapshot and SHA-256 manifest. It invokes the small [Node adapter](../../scripts/export_print_model.cjs) to evaluate the actual viewer geometry, catalogue, default equipment and electrical routing. It does not scrape an old screenshot, read browser storage or edit workbooks.

From the project root, with Python 3 and Node.js installed:

```sh
python3 -m pip install -r scripts/requirements-drawings.txt
python3 scripts/build_review_drawings.py
python3 scripts/build_review_drawings.py --language vi
```

The dependency file includes ReportLab for generation and pypdf/pdfplumber for verification. The same command may use a configured Python runtime with these packages already installed. `--language en` is the default and writes to `output/pdf/`; `--language vi` writes to `output/pdf-vi/`. `--output /absolute/folder` selects a different output folder. A folder containing the other language's PDF or manifest is refused before writing. Generated named files are replaced after successful validation/build; unrelated files are preserved. A failed model, register, font or translation validation leaves the previous set intact. Keep each PDF and its companion manifest/CSVs together.

The [Vietnamese translation module](../../scripts/review_drawings_i18n.py) translates titles, drawing labels, equipment names/categories, notes and all nine coordination tasks and holds. It uses local [Noto Sans fonts and their license](../../scripts/fonts/README.md), subset-embedded with Unicode mappings; no font download or installed system font is required. Vietnamese accents are retained. Missing translations or missing glyphs stop publication. Stable equipment, route, circuit, board, grid and revision identifiers, units and exact source-file references retain their form. The full source snapshot and numeric CSVs preserve the canonical source language and machine-readable column names for audit; they are identical in both language folders. No translation changes coordinates, lengths, quantities, product status, manual-control status or engineering holds.

After a coordinated equipment addition, removal, move or specification change in the **owning default model**, first complete its engineering/software checks and refresh the matched sources:

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
python3 scripts/build_review_drawings.py
python3 scripts/build_review_drawings.py --language vi
python3 scripts/verify_review_drawings.py
python3 scripts/verify_review_drawings.py --language vi --compare-language output/pdf
```

The register command needs the artifact runtime described in the [preservation workflow](register.md). It preserves engineering inputs and retired IDs; never replace a workbook by hand to bypass that workflow. Review the generated diffs and counts. The Python program refuses fresh-model versus saved-JSON differences, stale source fingerprints, unsupported units/schema, stale register manifests and changed workbooks. It independently recomputes every 3D centreline length and checks unique IDs, equipment connections and drawing coverage. The verifier also checks printed equipment descriptions, all stage tasks/holds, Unicode font embedding, source/geometry equivalence between languages and refusal to overwrite the other language. No threshold or physics parameter is adjusted by printing.

**Browser-edited layouts are separate.** Export and reconcile them using the register workflow before adopting them into the default design. Running the Python command does not capture an unsaved browser edit. The manifest states this scope; importing arbitrary JSON into this builder is intentionally unsupported.

## Read and print

Print **A3 landscape, 100%, no fit-to-page** and measure the 100 mm calibration bar on the cover. The current full-model plan is 1:200 and the height projection 1:500. Scales are computed from source bounds and may increase for a larger future model; each sheet states its actual scale. A resized A4 print has a different scale.

Each populated circuit/zone gets a sheet, plus a distribution sheet. Long equipment lists continue onto additional sheets. Top views show X/Z and height views show X/Y with all Z superimposed. These are **grid-based electrical projections**, not complete architectural floor plans or structural support drawings. Original drawing/workbook dimensions and outstanding survey conflicts remain governed by `docs/layout_design/`; the snapshot retains the model grid's source, revision, assumptions and unresolved records.

Equipment labels, source enclosures and trunk/feeder references link to the coordinate table and unique route index. Branch references beside each equipment coordinate identify its route-index entry. `R001` style references are local to that issue; the full route and equipment IDs are the stable identities. Circles mark equipment, squares mark enclosures; power is solid, audio dashed and microphones dotted. Crossing/overlapping projections do not establish junctions. Use ordered CSV vertices and the 3D inspector to disambiguate height and connectivity.

Coordinates are model reference points, not terminal/anchor set-out points. Three decimals are display precision, not surveyed accuracy. Drawn lengths exclude spares, terminations and installation allowance. Shared context repeats across sheets but the route index owns every route once. Full audio home runs already include their own upstream path; adding shared bundle lengths again would double-count. No conductor size, protective rating, cable quantity or terminal is invented.

## Step-by-step 3D review

Open [OPEN_CHURCH.html](../../Thach_Bi_Viewer/OPEN_CHURCH.html), then **Simulator → Wiring → Start 3D walkthrough**. Previous/Next review step changes the selected system and camera. Reset stage view restores the current stage after exploring an individual circuit. End walkthrough restores the prior electrical filters, mode and architectural visibility; camera position is left at the last review view.

The nine stages cover survey/coordination, distribution, concealed containment, lighting, sound/microphones, fans/ventilation, exit functions, powered decoration, and inspection/commissioning/handover. Each stage has its task and an explicit engineering hold. The same [stage source](../../Thach_Bi_Viewer/simulator/installation-review.js) supplies the PDF sequence sheets; its reviewed Vietnamese translation is maintained in the translation module without editing viewer source text. Containment is an all-system coordination view; it does not simulate actual pulling order or isolate individual conductors. Empty stages are legitimate where no equipment of that class is installed.

This is a **proposed coordination sequence**. It does not mark work complete, release holds, operate switches, authorize energization, choose fixings, or constitute a contractor's approved method statement. Keep equipment/route inspection and simulator controls separate. Physical construction requires checked design and the responsible professionals' installation and commissioning procedures.

## Status and verification

Each current language set has 44 A3 landscape sheets, 296 connected items, 343 current routes and 2,775 current route vertices; 331 current equipment/enclosure register records include hidden alternatives and non-electrical objects outside the print scope. The earlier baseline was 286/329/2,681 with 327 register records. The printing/walkthrough tools themselves change no positions, physics, operating states, route geometry or registers; the separate wing design revision supplies the changed source data. All lighting, feedback, wing-clarity, air/noise, concealment, supply/product, mounting/access and life-safety holds remain in [issues](../engineering/issues.md).

**Inherited baseline note:** the cover and original walkthrough stage text retain the earlier lighting shortfall statement, including four sampled seats on `SQ-02`. This describes the pre-wing-review comparison. The [current wing review](../engineering/wing-review.md#compared-outcomes-and-the-held-review-choice) reports a nominal whole-church minimum of 203.70 lux in its full-service case, while explicitly leaving those formerly dim seats physically unverified. Other scenes and light-output sensitivity still miss targets. The Vietnamese version translates the source stages without revising their numerical claims; use the current coordinated calculation record for current scenario results. Neither language set establishes that the lighting design is accepted.

The earlier English delivery and desktop viewer evidence are recorded in the [print/sequence review record](../../review/print-sequence-2026-10-09/README.md). Current bilingual checks, deterministic rebuild checks and rendered inspection of every sheet are recorded in the [Vietnamese drawing review](../../review/vietnamese-drawings-2026-10-09/README.md). The private/public architectural web viewer is unchanged; these tools belong to the local full simulator.
