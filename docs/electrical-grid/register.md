# Equipment and electrical-line Excel registers

[Open the registers by usage category](categories/README.md). Maintain lighting, sound, fans/ventilation, exit signs, decoration/furnishings and distribution/control boards in separate Excel files, using the same stable IDs as the coordinated layout. Each file has the same four-sheet structure below. Current coverage is every simulator-managed item, hidden alternative and board/control enclosure. Building fabric and structural members remain in their architectural/structural schedules.

The category files, reviewed **7 October 2026**, together contain **327 equipment/enclosure records**, **329 routes** and **1,904 route vertices** from the recommended design. The 327 records include 322 simulator items and five enclosures; they are not 327 installed electrical loads. The wiring study has 286 shown connected components. See the [summary report](summary-report.md) for quantities, usage estimates, route-length bases and completeness by category. The original combined workbook is preserved in [archive](archive/README.md) and is no longer edited or refreshed.

## Category ownership

Assign ordinary light fixtures to lighting, E1 signs to exit-signs, speakers/microphones to sound, fans/exhaust units to air-system, and decorative/furnishing items to decoration. All five board/control enclosures and their shared supply feeders belong to distribution-controls. A local/drop route follows its destination's usage; its upstream trunk and ordered vertices stay in the same category. Shared board origins are cross-references to distribution-controls, not duplicate equipment rows. Mixed-category branches require an explicit design decision before export. Empty categories retain the same sheet headers; decoration currently has no shown connected electrical route.

## Workbook sheets

| Sheet | Content |
| --- | --- |
| Read me | Scope, coordinate convention, editable fields, source files and their SHA-256 fingerprints, current/retired counts and release status. |
| Equipment | Stable ID, name/category, board/circuit, current X/Y/Z, mounting, visibility, command state, model envelope, planning specifications, provisional rating, aim, manufacturer/model, approved specifications and source, physical control ID/group, proposed X/Y/Z, notes, record state and local/drop route IDs. |
| Electrical Lines | Stable route ID, source and destination IDs, board/circuit, function, calculated route length, upstream/full home-run length, separately entered allowance, planned length, planning specification, installation proposal, final cable designation, cores, cross-section, containment, product, terminal/control reference, approval and notes. |
| Route Points | Ordered X/Y/Z vertices for every route and calculated segment lengths. These coordinates drive the geometric route length. |

Use the header filters and frozen ID columns. Metres use the shared model axes: +X toward the sanctuary from axis 1, +Y up from nave floor ±0.000, −Z toward B and +Z toward H. Three decimal places aid coordination; they do not establish millimetre survey accuracy. Model envelopes are in millimetres and are not approved product dimensions.

**Amber columns hold engineering inputs.** Enter selected products, approved specifications with source/revision, control IDs, allowances and notes there. Blank means pending. Keep provisional catalogue specifications distinct from approved product data. The provisional watts column can include passive-speaker audio ratings, so it must not be summed as mains demand.

**Source and formula columns refresh from the coordinated model.** Do not rename IDs, insert substitute IDs or change imported coordinates/route vertices directly to revise the design. Preserve IDs through moves and never reuse a retired ID. Track newly modeled items here when the coordinated layout is exported. Until an item exists in the model, record it as an open design requirement; do not invent a position or connection.

The category workbooks are the editable engineering registers; the paired [layout JSON](equipment-layout.json) and [systems JSON](electrical-systems.json) supply the model geometry. The generated summary reports their combined results. This is an explicit export/refresh workflow, not a live Excel connection to the viewer or installed hardware.

## Refresh from the recommended model

Run from the repository root:

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
```

The first command checks electrical routing and exports the default layout, systems JSON and flat CSV. It does not read a browser's saved edits. The second reads all category workbooks, checks matching IDs/circuits/coordinates, verifies route lengths from their vertices, and refreshes the six files and summary report. It requires the bundled `@oai/artifact-tool` Node runtime; `THACHBI_WORKSPACE_MODULES` may point to another installed module directory. No package installation in this repository is needed in the configured Codex workspace.

Refresh retains the **values in the named amber columns by stable ID**, including when an item legitimately changes usage category. Missing items/routes and their vertices remain as `Retired`; reappearing IDs recover their retained inputs. Duplicate IDs across files or missing category files stop refresh. Each previous workbook is backed up to a temporary path printed by the script and replaced only after its validation/export succeeds. The manifest and summary are written after all six exports succeed; an interrupted refresh must be completed before using a mixed set. Keep a durable revision copy before a design issue. Close all workbooks before refreshing; do not overwrite unsaved Excel edits. Do not add custom sheets, rename columns or rely on changed formatting/formulas surviving this generator; extend its schema deliberately when needed.

For a browser-edited configuration, export **layout JSON** and **systems JSON** from the same unchanged viewer state, retain them as a matched revision, then supply both:

```sh
node scripts/build_equipment_register.mjs \
  --layout /absolute/path/to/layout.json \
  --systems /absolute/path/to/systems.json \
  --verify-workflow
```

Use `--category-dir /absolute/path/to/study/categories` for a separate six-file study set; copy the existing category directory there first to carry current inputs. The summary is written beside that directory. The older `--workbook /absolute/path/to/revision.xlsx` option supports a separate combined study workbook and does not update the category set or its summary. Reconcile the chosen design into the project's owning sources and paired snapshots before returning to the default refresh command; otherwise that command intentionally restores recommended-model geometry.

## Propose positions in Excel

1. Enter all three **Proposed X / Y / Z (m)** values for an equipment item. Leave all three blank when no change is proposed. Add a reason in Engineering notes.
2. Save the workbook, then export a separate draft against its recorded layout snapshot:

   ```sh
   node scripts/build_equipment_register.mjs --export-layout /tmp/thachbi-proposed-layout.json
   ```

   By default this combines proposed coordinates from all category files. Include the same `--layout`, `--systems` and `--category-dir` paths for a separate study. Use `--workbook` with one category workbook to export only its proposed moves. The export rejects incomplete coordinates, retired records and a mismatched layout fingerprint. Enclosure locations require changes to the model's board-source definitions and cannot be moved through item layout import.
3. Import the draft in the viewer. Check mounting anchors, aim, supports, blade/door clearances, occupied-seat results, rerouted lines and manual-control grouping. A proposed position alone does not update those engineering decisions.
4. Export matching layout/systems JSON after review and refresh the register from them. Clear accepted or rejected Proposed coordinates deliberately and record the disposition; refresh preserves them until cleared.

## Lengths and installation specifications

- **Route length** is the sum of ordered 3D centreline segments. It excludes slack, terminations, spare and installation allowances.
- **Full home run** adds the drop and its upstream shared-path distance once. The shared audio/microphone bundle remains a route for mapping/containment; do not buy it again as a separate cable run.
- **Planned length** stays blank until an allowance is entered, including an explicit zero when justified. It remains blank for shared home-run bundles. There is deliberately no grand cable-purchasing total across these different length bases.
- A path segment is not automatically one approved cable or conduit. Final conductor count, cross-section, insulation, segregation, containment, protection and terminal assignments must follow the checked electrical design. Add a separate approved cable schedule when the relationship between modeled paths and actual cables is established.
- Equipment and circuit IDs can look similar (for example an equipment ID `L1` and circuit `L1`); always identify the field as well as the value. Find local/drop connections by Equipment.Route IDs, upstream paths by Electrical Lines.Trunk ID, and enclosure-origin routes by Source ID.

Before issuing a revision, reconcile the category files and summary against both 2D and 3D routes, check counts/status and source fingerprints, review retained inputs affected by moved equipment, and record the responsible designer's disposition. The manifest fingerprints show which saved workbooks the summary used; later Excel edits require another refresh. See [agent rules](../../AGENTS.md), [routing basis](routing.md) and [manual/quick controls](controls.md).
