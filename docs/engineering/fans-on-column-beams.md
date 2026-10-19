# Side-aisle fans on the column-line beams · 19 October 2026

Status: **CONCEPT / ENGINEERING HOLD**. Implemented in the local simulator on branch `eng/14-fans-on-column-beams` (on top of the hidden-fittings and sanctuary-lacquer work); nothing here is approved to buy or build. Model axes as in [hidden fittings](hidden-fittings.md).

**Owner request, 19 October 2026 (`USER CONFIRMED` intent):** for safety, hang the ceiling fans from the beams that join the columns, which the owner expects to be more stable and to balance the air better. Shown the trade-offs, the owner asked to move them anyway, and then to hang them a little higher.

## 1. What changed

| Records | Before | After |
| --- | --- | --- |
| 12 side-aisle ceiling fans, bays 3–4 to 8–9 (F1) | Purlin bracket under the lining (+9.03 m) at Z ±4.40; hub +3.90 m, blades +3.73 m; downrod 5.13 m | Hanger under the column-line beam B03 (soffit +8.73 m) at mid-span, on the D/E column lines Z ±3.60; hub +4.20 m, blades +4.03 m; downrod 4.53 m |
| 2 ceiling fans, bay 2′–3 | As above | No column-line beam in this bay: same purlin brackets at Z ±4.40, hub raised to +4.20 m (downrod 4.83 m) |
| 24 tie-beam reading heads aimed toward a bay with a beam-hung fan (L1) | Tilted 8° along the nave, 28° optic | Tilted 5°, 24° optic; output unchanged (2 300 lm) |

Height: of the hub positions tried (+0, +0.3, +0.5, +0.8, +1.1 m) every step costs seated air; +0.30 m keeps the blades below 4.2 m, where the analysis starts reporting that small fans hung higher lose seated air speed.

Reading heads: on the column lines the fans sit 0.8 m nearer the tie-beam reading heads, and 24 of them shone through the blades (about 180–205 lux of flicker on the books, all rated errors). Searching aim and optic, 5° with a 24° optic removes every flicker warning and keeps the share of seats at 200 lux unchanged; aiming all heads straight down also removes it but drops that share to 87 %.

Cable: each fan lead comes over the lining, down the outer face of its column-line beam 0.95 m from mid-span (clear of the gilded cartouche) in a removable cover, under the soffit to the hanger and inside the downrod (route method `beam-hanger`). No timber core is crossed.

## 2. Trade-offs, calculated

`node scripts/verify_simulator.cjs --report --estimates`, scene Full service · evening, compared with the same design before this change (commit 54fd513):

| Figure | Fans on purlins | Fans on column-line beams, +0.30 m |
| --- | --- | --- |
| Seats with air 0.3–0.8 m/s | 80 % | **60 %** |
| Air average / minimum (m/s) | 0.33 / 0.06 | 0.32 / 0.07 |
| Centre blocks: air average | 0.33 | 0.39 |
| Outer blocks: air average | 0.38 | **0.31** |
| Blade flicker warnings | 0 | 0 (24 errors before the reading heads were re-aimed) |
| Seats ≥ 200 lux / lowest 10 % | 90.2 % / 212 lux | 90.2 % / 212 lux |
| Centre blocks: seat lux average | 322 | 353 |
| Speech clarity, noise, power | — | unchanged (STI 0.60 average; 45.2 dBA; 5 610 W) |

**Air is not more balanced.** On the column lines the fans move 0.8 m toward the centre blocks: those gain air, the outer blocks next to the walls lose it, and raising the fans 0.30 m lowers air everywhere. The share of seats in the comfortable band falls from 80 % to 60 %. Of the heights tried, staying at the old hub height would have given 70 %.

**Stability.** The real stability question is the rod length, not the support alone: the rods are 4.53 m (4.83 m in bay 2′–3), against 5.13 m before. Whether a hanger under B03 is stiffer and stronger than a purlin bracket depends on the beam's real section and its joints at the columns, which are not designed: B03 is a visualization proxy (0.24 × 0.45 m) on ENGINEERING HOLD. Each fan needs a rated hanger, anti-sway restraint and a secondary safety cable, checked for the fan's mass, running torque and out-of-balance vibration.

**Central view.** The blades now reach Z ±2.89 m, 0.8 m nearer the processional aisle, over the outer seats of the centre blocks. They remain off the centreline (the excluded scheme in [central-view constraint](central-view-constraint.md)), but they are more visible from the aisle than before.

## 3. Saved layouts

Revision `fanBeamRevision = 2026-10-19-fans-on-column-beams-1`, applied once with a backup under `.before-fans-on-beams`: a ceiling fan still at its old default place (hub +3.90 m at Z ±4.40) takes its new place and anchor and keeps its ID, speed, switching and oscillation; a tie-beam reading head still in its place with the earlier 8°/28° aim takes the new aim and optic and keeps its output and switching. A moved, re-aimed or deleted fitting stays as it is.

## 4. Checks and evidence

- `verify_simulator.cjs --report --estimates`: calculation checks passed; design targets as before (feedback margins 0.9/1.4 dB, 90.2 % of seats at 200 lux, wing light and clarity). New assertions: fans at +4.20 m, under their column-line beam at mid-span (bay 2′–3 on its purlins), blades between 2.4 and 4.2 m; 24 reading heads at 24°; both migrations. `verify_concealed_routes.cjs` checks the new beam-hanger leads (in cover beside and under the beam, entering the downrod just under the beam).
- `verify_model`, `verify_estimates`, `verify_cinematic`, electrical export, register workflow, safety review `--check`, timber package `validate.py`: passed.
- Pictures: [review/fans-on-column-beams-2026-10-19](../../review/fans-on-column-beams-2026-10-19/README.md).

## 5. Open items

Question **Q53** and ENG-035: B03 section, end joints and fan loads (mass, torque, vibration); hanger, anti-sway restraint and safety cable; access for maintenance at +8.7 m; a trial of one fan on site measuring air at the outer seats; the owner's acceptance of the lower share of seats in the comfortable air band.
