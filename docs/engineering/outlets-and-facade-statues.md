# Socket outlets, façade statues and their light · 9 October 2026

Status: **CONCEPT / ENGINEERING HOLD**. Implemented in the local simulator on branch `eng/11-outlets-facade-statues`; nothing here is approved to buy or build. Coordinates are metres in the shared model axes: X from axis 1 toward the sanctuary, Y up from the nave floor ±0.000, Z negative toward B and positive toward H.

**Owner requests, 9 October 2026 (`USER CONFIRMED` intent):** two socket outlets at the sanctuary, two at the middle of the church and two at the towers, the tower pair with a higher rating for outdoor events; the statue of the Assumption of the Blessed Virgin Mary in the central place between the two towers with a saint on each side; light on these three places; more realistic statues. Two clarifications followed the same day: **no visible lamps at the statues** (“the art of hiding and making art with the lights”), with **two candle lights on the base of each statue**; and **separate switches** for the statues, the towers and the open space (stage).

## 1. Socket outlets

| ID | Position X / Y / Z | Fixed to | Circuit · board | Provisional rating |
| --- | --- | --- | --- | --- |
| `P-SANCT-B`, `P-SANCT-H` | 43.890 / 0.850 / ∓7.250 | Nave-facing face of the axis-10 pier shaft; 0.70 m above the side platform (+0.150), 1.17 m above the wing floor (−0.320) | P1 (B), P2 (H) · DB-1 | Double 16 A 2P+E shuttered outlet |
| `P-NAVE-B`, `P-NAVE-H` | 22.830 / 0.450 / ∓7.250 | Inner face of the masonry side wall, between the window jamb (X 22.35) and the axis-6 pier base (X 23.06) | P1 (B), P2 (H) · DB-1 | Double 16 A 2P+E shuttered outlet |
| `P-TOWER-B`, `P-TOWER-H` | 0.450 / 1.300 / ∓7.850 | Inside the tower porch, on the inner face of the solid front pier of the tower's inner flank wall (pier X 0–0.85); 1.30 m above the tower floor ±0.000 | P3 (B), P4 (H) · DB-2 | Lockable weatherproof cabinet: one 32 A 2P+E industrial outlet (IEC 60309 pattern) and two 16 A outlets |

Source of the fixing surfaces: ray casts on the current model meshes `Side column base`, `Side column — illustrative shaft width`, `Inner C/G wall with opening` and `Tower stage 1 wall` (`MODEL TRANSCRIPTION`; the pier and wall sizes are themselves drawing transcriptions and are not surveyed).

### Why these places and circuits

- **One radial per side, not one per zone.** P1 follows the side-B wall band from DB-1 and serves the sanctuary point and then the mid-nave point; P2 does the same on side H. A circuit per zone would need a B and an H run to each zone: about 157 m of trunk against 103 m now, two more protective devices, and a trip would take both outlets of a zone. With one circuit per side, a trip leaves the opposite outlet at the same place live.
- **Nave points stay on DB-1.** DB-2 is nearer in plan, but its supply is the 80.683 m DB-1 → DB-2 feeder. Feeding the nave from DB-2 would put that feeder in series with a 36–47 m circuit and would take the nave outlets down whenever the feeder is isolated.
- **Sanctuary points on the axis-10 pier.** It is the only solid support at the junction of the sanctuary platform and each wing (choir on H, ministers on B), it stands directly under the existing wall-band route, and it is 3.5 m from the dais edge. The microphone lines run under the floor at Z ±1.4, 5.8 m away. Considered and not used: the timber shrine return panel (only a 0.09 m strip is visible beside the pier) and floor boxes on the dais (floor build-up unknown, wet cleaning).
- **Mid-nave points in the masonry wall, not in the structural pier.** The outer bench ends stand 0.44 m from the wall, so the outlet is reached along the space between two bench rows. Considered and not used: the pier face (0.13 m from the bench ends and structural concrete) and floor boxes at the timber columns in the side aisles (floor build-up unknown, wet cleaning, and the stone pedestals belong to the structural columns).
- **Tower points inside the porches.** The front pier hides the cabinet from the front elevation, the tower gives shelter, and the open arches let event cables reach the forecourt within about 1 m. A dedicated buried route from DB-2 (9.870 m to tower B, 16.470 m to tower H) replaces the usual climb to the +7.65 m entrance band and back down, which would add about 13 m to each high-load circuit.
- **Event points are off by default** in the model and are not part of any quick mode: they should be isolated and locked outside events. The indoor points stay live in every mode, including All off, so that cleaning equipment can be used.

### Route lengths (model centrelines, no allowance)

| Route | Length (m) | Home run to the point (m) |
| --- | ---: | ---: |
| P1 trunk DB-1 → side B → X 22.830 | 48.375 | — |
| P1 → `P-SANCT-B` / `P-NAVE-B` | 5.653 / 5.768 | 29.103 / 54.143 |
| P2 trunk DB-1 → side H → X 22.830 | 54.967 | — |
| P2 → `P-SANCT-H` / `P-NAVE-H` | 5.661 / 5.776 | 35.719 / 60.743 |
| P3 trunk + rise to `P-TOWER-B` | 8.300 + 1.570 | 9.870 |
| P4 trunk + rise to `P-TOWER-H` | 14.900 + 1.570 | 16.470 |

### Conditional voltage-drop comparison

Method and constants of the existing [cable comparison](../electrical-grid/cable-load-review.md): `ΔU ≤ 2 I (R + X) L`, `R = 23.7/S Ω/km` (copper), `X = 0.08 Ω/km`, 230 V single phase, the whole circuit rating at the far point. This is an upper-bound comparison with unconfirmed supply data, **not a cable selection**.

| Circuit, far point | Current | 2.5 mm² | 4 mm² | 6 mm² | 10 mm² |
| --- | ---: | ---: | ---: | ---: | ---: |
| P1 mid-nave B, 54.14 m | 16 A | 7.2 % | 4.5 % | 3.0 % | — |
| P2 mid-nave H, 60.74 m | 16 A | 8.1 % | 5.1 % | 3.4 % | — |
| P3 tower B, 9.87 m (from DB-2) | 32 A | — | — | 1.1 % | 0.7 % |
| P4 tower H, 16.47 m (from DB-2) | 32 A | — | — | 1.8 % | 1.1 % |

Finding: a common 2.5 mm² socket cable does not keep a 16 A load at the mid-nave points within a 5 % comparison budget; the comparison points to 6 mm² on side H, or to a lower circuit rating. The designer must decide with the real supply and installation data.

**The DB-2 feeder is the main open item.** Both event points at full rating add 64 A to about 13 A of known lighting and fan load at DB-2 (2 721 W). On the 80.683 m feeder the same single-phase comparison gives 5.6 % with 25 mm², 4.1 % with 35 mm² and 3.0 % with 50 mm², before the final circuits. A balanced three-phase feeder with one event point per phase gives 2.8 % with 10 mm² and 1.8 % with 16 mm². The simulator's 63 A main-switch graphic also cannot carry the fixed equipment (47 A connected) together with 96 A of socket allowance. None of this is designed: supply capacity, phases, the feeder, discrimination and the event-power arrangement are questions Q42–Q44.

### How the simulator treats an outlet

A socket has no load of its own. The operating estimate uses the **test load** entered for a point (0 W by default), so the full-service estimate does not change because of the outlets. The rated value is that point's share of its circuit rating at 230 V and power factor 0.9 (1 656 W per indoor point, 6 624 W per event point): a planning allowance, not a product load. The Analysis tab reports the 96 A socket allowance separately from fixed equipment and warns when a test load exceeds a circuit rating.

## 2. Façade statues

| ID | Subject | Base position X / Y / Z | Modelled size | Status |
| --- | --- | --- | --- | --- |
| `D-FACADE-C` | Assumption of Our Lady | 2.290 / 11.800 / 0 | 2.20 m figure on a 0.26 m cloud, 2.75 m to the fingertips; 0.72 m deep, 1.42 m wide | Subject and place `USER CONFIRMED`; form `CONCEPT` |
| `D-FACADE-B` | Saint Peter (keys, book) | 2.290 / 10.080 / −5.480 | 1.78 m figure; 0.61 m deep, 0.64 m wide | Subject **proposed, not confirmed** |
| `D-FACADE-H` | Saint Paul (sword, book) | 2.290 / 10.080 / +5.480 | 1.78 m figure; 0.61 m deep, 0.64 m wide | Subject **proposed, not confirmed** |

The figures stand on the pedestal tops of the niches already traced from elevation sheet 1 (`FACADE-DRAWING-02`: central base +11.00, side bases +9.43; pedestals 0.80 and 0.65 m high). That sheet shows **empty niches with pedestals**. The statues are therefore removable simulator decoration records, not a change to the traced façade: hide them in **Simulator → Décor** to see the façade as drawn. Niche depths in the model are illustrative, so the fit in depth (central figure back at X 2.68 against a niche back at X 2.70) is not a measured clearance.

Peter and Paul are a proposal: the owner asked for “two saints” without naming them. They follow the pair already chosen for the wings. Changing a subject means changing the figure type of that record; position, light and circuit stay.

All figures in the model are generated shapes. Sculptor, material, real size, weight, wind and seismic fixing to the pedestal, lightning bonding and maintenance access at +10 to +15 m are not designed. No load is assumed on the pedestals or the niche.

## 3. Light on the statues: hidden sources and candles

Circuit **L10 · Façade statues & candles**, DB-2, 15 records, 34 W connected.

| Per niche | Type | Where | Output in the model |
| --- | --- | --- | --- |
| 1 hidden arch line (`L-STATUE-*-ARCH`) | Linear LED in a slot behind a matching lip under the arch crown, aimed at the face | Central X 2.130 / Y 15.640; sides Y 12.620 | 440 lm central, 300 lm sides, 60° |
| 2 hidden jamb lines (`L-STATUE-*-JAMB-1/2`) | Upright linear LED behind a matching lip at the front edge of each jamb, aimed across and back | 20 mm inside each jamb face; 2.0 m long central, 1.3 m sides | 260 lm central, 140 lm sides, 80° |
| 2 candle lights (`L-STATUE-*-CANDLE-1/2`) | Electric candle in a brass holder, 0.46 m tall, on the pedestal top at the statue's feet | Central Z ±0.47; sides ±0.31 from the niche centre | about 40 lm, 1 W each |

Intent: the niche glows and the figure stands in soft relief; from the forecourt only the light and the candles are seen. The model draws each hidden line as its finish-matched lip, without lens or lamp body. An earlier version of this revision used visible spotlights at the feet and head; the owner rejected them and they were removed before issue.

Direct maintained illuminance from the simulator's photometry, scene Full service · evening, no occlusion by the niche or the figure (the façade is not in the analysis geometry):

| Point | L10 alone (lux) | With the L6 façade floods (lux) |
| --- | ---: | ---: |
| Assumption: face / chest front / flank / knee front | 105 / 17 / 168–230 / 7 | 131 / 67 / 245–314 / 55 |
| Assumption: niche wall beside / above the figure | 37 / 47 | 94 / 130 |
| Saint Peter: face / chest / flank / niche wall | 57 / 61 / 163 / 101 | 159 / 200 / 197 / 237 |

The front of the lower drapery receives little from the niche lines, because no hidden source can stand in front of the figure; it is carried by the façade floods when they are on and stays dark when L10 is on alone. These are planning estimates. Real niche depths, the lip and slot, glare from oblique views, the finish of the statue and selected-product photometry must be tried on a mock-up at night.

## 4. Separate switches at the front

| Circuit at DB-2 | Controls | Quick modes |
| --- | --- | --- |
| **L10** | Statue light lines and candles | On in Full service, Christmas and Festival; 60 % in Weekday Mass and Prayer; off in Cleaning, Night security and All off |
| **L6** | Tower and façade floods | Unchanged |
| **L9** | Front stage (open space) and central door | Unchanged |
| **L7** | Festival strings and floods | Unchanged |
| **P3, P4** | Event power points | In no quick mode; manual only |

Each is its own switch on **Controls → Towers**. The Off / Evening / Festival keys there now include L10 in Evening and Festival. All depend on the DB-1 feeder. Physical switch positions, labels, channels and protective devices are not designed; see [controls](../electrical-grid/controls.md).

## 5. More realistic statues

`Thach_Bi_Viewer/simulator/catalog.js` now builds figures from a lofted body with drapery folds, a modelled head (brow, eye sockets, nose, lips, chin), veil or hair and beard, sleeves, and hands with fingers. It replaces the earlier lathe-and-sphere figures of Our Lady, Saint Joseph (now carrying the Child) and the Sacred Heart, and adds the three façade figures. Positions, IDs and saved layouts are unchanged. The crucifix corpus is part of the building model and was **not** changed. These are generated approximations for viewing distance, not scans or sculptor's models.

## 6. Checks, results and what remains

Software checks on the final source, 9 October 2026 (not construction approval):

- `node scripts/verify_model.cjs`, `node scripts/verify_estimates.cjs`: passed.
- `node scripts/verify_simulator.cjs --report --estimates`: calculation checks passed; **unmet design targets are unchanged**: ambo/altar feedback margins 0.9/1.3 dB, 89.1 % of seats at 200 lux (wing minimum 121.6 lux), wing clarity minimum 0.422.
- `node scripts/verify_simulator.cjs --electrical --export-electrical`: 317 connected components, 370 routes, 2 928 vertices. Every wall-mounted item, including the hidden lines and outlets, has a model surface behind it.
- `node scripts/build_equipment_register.mjs --verify-workflow`: 359 equipment/enclosure records (354 items + 5 enclosures); 10 retired equipment IDs and 14 retired routes preserved.
- `verify_installation_review`, `verify_review_layers`, `verify_review_navigation`, `verify_wing_art`, `verify_nave_fans`, clearance, texture, performance and light-grid checks: passed. `verify_wing_revision`, `verify_wing_review` and `verify_wing_sound` still assert the 320-item inventory of an earlier revision and already failed before this change (330 items).
- Desktop viewer inspection, day and evening, at the three niches and both sanctuary shrines; pictures in [review evidence](../../review/outlets-statues-2026-10-09/README.md). Not checked: GPU performance on other machines, and the browser tests that need Playwright (not installed here).

Full-service operating estimate: **5 586.950 W** (5 552.950 W before; +34 W for L10).

**Out of date after this change:** the A3 review drawings in `output/pdf/` and `output/pdf-vi/`, the cable and budget reports in `output/electrical-review/`, their manifests, and the hosted web and GLB snapshots. They do not contain P1–P4, L10 or the statues. ReportLab is not installed on this machine, so they were not rebuilt; the Vietnamese drawing labels for the new names also need adding in `scripts/review_drawings_i18n.py` first.

Open items: questions **Q42–Q46** in the [question register](questions-for-parish-and-designers.json); supply and feeder design; accessory types and heights; fixing into piers and walls without weakening structure; buried duct, draw pits and water sealing at the towers; slots and lips in the niches; statue design, weight and fixing; a night mock-up.
