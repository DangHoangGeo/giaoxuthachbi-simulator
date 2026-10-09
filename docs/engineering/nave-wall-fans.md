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

All positions have **Y5.550 m**, **Z−7.070 m (B) / +7.070 m (H)**. Mount/centre yaw +90° B / −90° H faces inward; tilt −38°. Coordinates are MODEL TRANSCRIPTION / DERIVED from `bundle.js` longitudinal axes, the side-column proxy centered Z±7.36 with 0.58 m shaft width, and `engine.js::computeGeometry` C/G wall openings. The fan mounting plane is the modeled column inner face ±7.07. Typical spacing is 4.50 m. Model opening crown Y4.311 and side-beam underside Y6.66 are screening references. Original drawing/workbook conflicts and survey tolerances remain unresolved; software coordinates are not drilling instructions.

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
