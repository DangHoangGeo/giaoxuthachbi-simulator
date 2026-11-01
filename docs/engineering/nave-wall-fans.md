# Nave side-wall fans · 9 October 2026

**USER CONFIRMED:** eight wall-mounted hanging fans on each nave side, **sixteen total**, visible by default. This supersedes the earlier seven-per-side request and the six-fan nave comparison. Sanctuary wings retain two wall fans each. Visibility is separate from operation: F2 remains OFF in every built-in mode. These are **CONCEPT / ENGINEERING HOLD**, not selected products or installation specifications.

## Positions, identifiers and support basis

The first-six IDs F244–F249 stay at axes 4/6/8; ten additions use F-NAVE-B/H-2P/3/5/7/9. No original equipment is renumbered or retired. Each side has one fan at axes **2′, 3, 4, 5, 6, 7, 8, 9**:

| Drawing axis | Model X (m) | B ID | H ID |
| --- | ---: | --- | --- |
| 2′ | 5.475 | F-NAVE-B-2P | F-NAVE-H-2P |
| 3 | 9.975 | F-NAVE-B-3 | F-NAVE-H-3 |
| 4 | 14.475 | F244 | F245 |
| 5 | 18.975 | F-NAVE-B-5 | F-NAVE-H-5 |
| 6 | 23.475 | F246 | F247 |
| 7 | 27.975 | F-NAVE-B-7 | F-NAVE-H-7 |
| 8 | 32.475 | F248 | F249 |
| 9 | 36.975 | F-NAVE-B-9 | F-NAVE-H-9 |

**Update, 25 October 2026:** the parish priest asked for the wall fans lower; all sixteen now hang at **Y 4.100 m** (IDs, axes, Z, yaw and tilt unchanged), and the column sconces moved up to +5.00 m to leave room. `scripts/verify_nave_fan_clearance.cjs` now screens the envelope against the actual window and door openings instead of a fixed +4.311 m band ([meeting record](parish-meeting-2026-10-25.md)). The text below is the 9 October record.

All positions had **Y5.550 m**, **Z−7.070 m (B) / +7.070 m (H)**. Mount/centre yaw +90° B / −90° H faces inward; tilt −38°. Coordinates are MODEL TRANSCRIPTION / DERIVED from `bundle.js` longitudinal axes, the side-column proxy centered Z±7.36 with 0.58 m shaft width, and `engine.js::computeGeometry` C/G wall openings. The fan mounting plane is the modeled column inner face ±7.07. Typical spacing is 4.50 m. Model opening crown Y4.311 and side-beam underside Y6.66 are screening references. Original drawing/workbook conflicts and survey tolerances remain unresolved; software coordinates are not drilling instructions.

The old short `fanWall` bracket permits actual modeled guard/head penetration into the column during oscillation. It is rejected for this displayed layout. New `fanNaveWall` keeps the same 45 cm fan ratings, using the existing extended-bracket proxy from the wing review: pivot outreach **0.40 m instead of 0.14 m**. Actual transformed nozzles change accordingly; no flow/noise/power value is improved. Selected guard dimensions, bracket strength, vibration, anchor/substrate capacity, corrosion, real movement/service clearances and high-level maintenance access remain unknown. Mesh clearance does not approve the fixing.

[Geometry evidence](../../review/nave-wall-fans-2026-10-09/geometry/README.md) compares short and extended brackets (all sixteen short-bracket fans enter the modeled column face, up to 0.241 m; the extended bracket does not; reproduce with `node scripts/verify_nave_fan_clearance.cjs [--short-bracket]`), examines column/wall/opening and nearby equipment envelopes, and records the limitations. Exposed side-wall fans do **not** satisfy the earlier all-hidden requirement. The owner explicitly requests these visible fans for the review; permanent concealment, sightlines and unobstructed inlet/outlet paths still need coordinated agreement. The nave roof-fan concepts and wing equipment are unchanged.

## Loads, routes and operating state

`fanNaveWall` is a geometry alias, with all `fanWall` catalog assumptions unchanged: diameter0.45 m, oscillation80°, low0.45 m³/s35W47dBA@1m, medium0.60 m³/s45W52dBA, high0.75 m³/s55W57dBA. These are representative, unverified data. Sixteen fans imply **560 / 720 / 880 W** at low/medium/high. The previous six-fan maximum was330W: this quantity change adds **550 W** to the known modeled maximum mains subset. Default operating F2 demand stays0W. Whole-installation/nameplate maximum is still unknown.

All sixteen map to **DB-1 → FC-1 → F2** and individual stable drop routes. Physical channels, regulator compatibility, inrush, protection, actual supply/earthing, derating and cable sizes remain pending. The existing graphical F2 breaker rating is a provisional simulator control, not an approval for880W of motors. Updated route lengths, conditional currents and quantities are in the matched [summary](../electrical-grid/summary-report.md), [air register](../electrical-grid/categories/air-system/register.xlsx) and printable review outputs. Conditional sizes must not enter approved fields.

Current default analyses keep these fans OFF; unchanged default performance must not be mistaken for sufficient airflow from sixteen running fans. The [review record](../../review/nave-wall-fans-2026-10-09/README.md) includes default and manual low-speed comparisons, all receivers and worst points. There is no claim that adding units solves noise, air speed, speech or feedback. No physics, targets or sampling were tuned.

## Saved layouts and adoption

An ordinary saved six-fan layout migrates per side only if its existing fan geometry/name/visibility/notes are untouched and no reserved new ID is already occupied. Existing operating states and speed overrides survive; new units are OFF. The six surviving fans adopt the extended bracket type. A full old-layout backup and durable new state are required; a write failure retains the old layout.

Moved, hidden, deleted, renamed, annotated or retuned fans block automatic changes on that side. **Simulator → Wiring → Nave wall fans → Use reviewed nave fans · B/H** explicitly adopts only that side's sixteen-layout IDs with a full backup and Undo/Redo. Existing on/off, speed and notes survive; unrelated equipment, custom scenes and settings remain. Renamed/custom conflicts block adoption. Migration markers are history only: current status uses actual geometry and visibility, independently of on/off. Once reviewed, a later deletion remains deleted across reload rather than reappearing.

## Release status

The implementation, coordinates and route exports are reviewable. Physical equipment selection, concealment, inclusive sightlines, maintenance, structural fixings and electrical design require the responsible designers. Baseline wing task-light, speech, feedback, occupied-air and noise failures remain visible. This branch stays unmerged until the engineering phase exit criteria are met.

## Axis-2′ pair and the clearance screen · 1 November 2026

With the main doors moved onto the axis-2 line (door wall X 5.035–5.475, [facade-model.md](../facade-model.md)) and the tower corner piers at their CAD depth (ENG-043), the two axis-2′ wall fans (F-NAVE-B-2P, F-NAVE-H-2P) at X 5.475 intersected the door wall, the moved fanlights and the towers' inner rear pier shaft. They now stand **0.62 m along the wall, at X 6.095** (same height +4.10, same aim and bracket). That is the only position between the pier shaft and the bay 2′–3 window pair (opening X 6.60–8.85) where the oscillating envelope clears both; checked by `node scripts/verify_nave_fan_clearance.cjs`, which now expects the axis-2′ pair at that offset. Saved layouts move them once (`entranceFitRevision`, backup `.before-entrance-fit`, `node scripts/verify_entrance_fit_reload.cjs`); a fan the user moved stays where it is.

The same screen also flagged F-NAVE-B-9 against "Wing lower pilaster": a false positive. roofline.js merges each ornament part across the whole church, so that mesh's box spans x 36.3–44.8 and |z| ≤ 13.7; its nearest vertex to the axis-9 fan is 6.49 m away. Roofline meshes are now tested by their vertices instead of their boxes. The screen passes for all sixteen fans. It remains a geometry screen, not a service-clearance or mounting approval.

The axis-2′ fans no longer sit on a side column (the other fans bolt to the column face at |z| 7.07). A plastered backing pad, 0.40 × 0.56 m, brings the C/G wall out from 7.25 to 7.07 behind each (`facade.js` `spec.entrance.fanPad`), so the bracket is the same as on the other axes. Pad construction and fixing are a proposal on ENGINEERING HOLD.
