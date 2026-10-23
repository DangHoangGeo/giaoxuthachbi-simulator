# Site view: grid, layers, phases and dimension checks

**Added 14 October 2026. Design in development, not for construction · Đang phát triển, không dùng để thi công.**

The **Site** button in the viewer's header opens a construction manager's view of the same model. It is meant for Father and the site team to check positions and sizes against the drawings, look at the building layer by layer, and see which phase comes next and which open questions affect it. It is a display and record-keeping tool. It does not change geometry, equipment, routes, calculations or the simulator layout.

Owner request, 14 October 2026: the drawing grid could hardly be seen, and Father needs to check grid positions, widths, heights and positions of each part, and to manage the work layer by layer and phase by phase, like professional construction software.

## Why the old grid was hard to see

The viewer's original **Drawing grid** switch (View settings) draws one-pixel lines at Y = −2.04 m, the courtyard level, under the plinth, with labels at −1.70 m at 32 % opacity. Inside the church the floor hides them; outside they are under the ground plane. The switch is unchanged. The site view replaces it while open with:

- **Grid lines on the floors**: 7 cm red bands that follow each floor level (verandas −0.320, nave ±0.000, sanctuary +0.150/+0.750, courtyard −2.080), sampled every 0.25 m with the viewer's own floor-height function. **See grid through walls** draws them on top of everything.
- **Axis bubbles** at both ends of every axis (1–12 including 2′, A–I). Axes closer than a bubble (2 and 2′, 0.575 m apart) get a staggered bubble with a leader line.
- **Dimension chains** in millimetres between consecutive axes on side B (4 900 · 575 · 4 500 … 7 200 · 4 500 · 4 341, overall 53 016) and at the altar end (2 835 · 3 054 · 3 760 · 7 200 …), from the model grid.
- **Crossing tags** painted on the floor at each axis crossing inside the building (for example `5·D`), readable while walking.
- **Level staff** with every level in the workbook's *Model grid* sheet. It stands beside the tower end, or beside the active section cut.

## What the panel contains

| Tab | Purpose |
| --- | --- |
| **Grid / Lưới trục** | Display switches; plan cut height (floor plan at +1.20 m, above eaves at +8.00 m, or any height); every axis with its model coordinate and spacing, with **Section** to cut the model on that axis; every level, with a cut 1.20 m above it. |
| **Layers / Lớp** | Fourteen construction layers, each **Show / Ghost / Hide / Only**. A bar shows how many parts of the layer come from the drawings and how many are schematic or concept shapes. Presets: all, structure only, shell without ornament. |
| **Phases / Giai đoạn** | A **proposed** twelve-phase sequence (`docs/construction/phases.json`). The slider shows the church up to a phase: earlier phases normal, the chosen phase amber, later phases ghosted or hidden. **Play** runs through the sequence. Each phase lists the open records (workbook issues and ENG holds) that affect it, and can be given a status: not recorded, not started, in progress, built, checked on site. **Next to build** is the first phase not recorded as built. |
| **Check / Kiểm tra** | The dimension workbook's 463 records, searchable, filterable (grid spacings, levels, unresolved, measured on site). Grid spacings show the model's value beside the drawing value. A record can be shown in the model. Outside the public visit, a measured value and date can be entered per record; with a tolerance set by the engineer, each is shown within or outside it. The workbook's 27 open dimension items are listed (ISSUE-R01 to ISSUE-R05 added 24 October 2026 from the church's CAD file). |

Toolbar: **Inspect** (default), **Measure**, **Clear**; views **Plan**, **Front**, **Side B**, **Side H**, **3D**. Drawing views are fitted into the area beside the panel by offsetting the projection; the camera and orbit target are not moved.

- **Inspect**: click any part. The card gives its layer, evidence status and what it means, its bounding size along X, along Z and in height (1 mm), bottom and top level, its centre's grid reference ("on 5", "D − 0.300 m toward C") and the clicked point. Parts marked SCHEMATIC or CONCEPT say plainly that dimensions must not be taken from the model.
- **Measure**: two clicks; snaps to a mesh corner within 15 cm or a grid crossing within 20 cm. Gives distance, horizontal distance, ΔX, ΔZ and height difference.

**Language:** the panel, toolbar and inspector show one language at a time, Vietnamese by default, with a **VI | EN** switch in the panel header (owner request, 14 October 2026). The choice is remembered in that browser under `thachbi.site.lang`. The rest of the viewer remains in English. The Vietnamese wording has not been reviewed by a Vietnamese-speaking engineer.

## Layers

Parts are assigned by `layerOf()` in `Thach_Bi_Viewer/construction.js` from their model group, name and evidence status. In the browser on 14 October 2026 the model's 48 493 architectural parts gave: plinth/stairs 722, floors 20, columns 240, walls 1 390, timber frame 288, roof 140, openings 6 160, ornament 16 427, floor finishes 18, sanctuary 3 655, furniture 2 681, trees 16 752. Counts include both alternatives where the model holds two (open and closed doors, two timber-frame styles, two seating layouts). The headless check builds the model without the simulator, which adds the timber frames and some sanctuary parts at start-up, so its counts differ; it classifies those parts by name instead. Lights, fans, sound, outlets and statues are the simulator's placed items; cable routes are the simulator's wiring layer. These two layers can be shown or hidden, not ghosted.

The layers are a sorting aid for viewing, not a quantity take-off or a work breakdown agreed with a contractor. **Foundations, reinforcement, slab build-up and concealed services are not modelled.**

To show a layer without copying geometry, `render-batches.js` now orders the parts of each display batch by layer and records each layer's index range. The site view draws those ranges through draw groups (amber for the current phase) and a ghost copy that shares the same buffers. Normal viewing ignores the ranges. The headless check confirms that each batch holds the same indices and the same vertex positions as before.

## Proposed phases and their gates

`docs/construction/phases.json` (revision SITE-PHASES-01) is the source. It is a conventional order for a masonry church with a timber roof, written to organise the model. **The contractor, structural engineer and architect must set the real programme, temporary works and hold points.** Each phase lists the open records that affect it, from the workbook's *Open items* sheet and `docs/engineering/issues.md`. The lists are not a complete list of approvals, and a phase status recorded in the viewer is not an approval.

## Records and the public visit

Phase statuses, measured values and the tolerance are kept in that browser only, under `thachbi.construction.v1`, and can be exported (JSON, CSV) and imported. In the public visit (`OPEN_CHURCH.html?visit`, the website) the site view is available read-only: no record is read or written, and status and measurement fields are disabled. The site view never reads or writes `thachbi.simulator.v1`.

Exports are personal working records. Do not commit them with names, phone numbers or other personal details (see AGENTS.md).

## Data and regeneration

`Thach_Bi_Viewer/construction-data.js` is generated; do not edit it by hand.

```bash
python3 scripts/build_construction_data.py
```

It reads the workbook's *Dimensions*, *Model grid*, *Open items* and *Sources* sheets (cached cell values, standard library only) and `phases.json`, and refuses phases that name unknown gates. The *DWG …* sheets added from the CAD file of 23 October 2026 are not read; see [`docs/layout_design/dwg-2026-10-23/`](../layout_design/dwg-2026-10-23/README.md). `--check` fails when the file is stale. The workbook itself is not changed.

## Checks

```bash
node scripts/verify_construction.cjs
```

Checks that the data is current; that every architectural mesh has a known layer and named reference parts land where expected; that display batches keep the same geometry and their layer ranges tile them exactly; that the workbook's model grid equals the viewer's grid and every grid spacing in the register agrees with it; that every layer belongs to a phase; and that records are only read or written outside the public visit.

Results on 14 October 2026 are in the commit that added this document. These are software checks. They do not verify a dimension on site, approve a phase or certify anything for construction.

## Limits and open items

- Bounding sizes are the model's. For SCHEMATIC and CONCEPT parts they are illustrative. Every value must be checked against the drawing sheet and on site.
- The model grid agrees with the workbook to the millimetre; the workbook's own open items (for example ISSUE-P01's 58 mm roof-length difference, RFI-S01's 76 mm height difference) remain unresolved.
- Clipping shows cut parts hollow (no section fill).
- Desktop only, as scoped by the owner on 8 October 2026.
- Not yet done: progress photos per phase, issue pins placed in 3D, a printable set-out sheet, sharing records between computers.
