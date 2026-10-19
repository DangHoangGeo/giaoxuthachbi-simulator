# Hidden reading lights, tower lights and corner loudspeakers · 19 October 2026

Status: **CONCEPT / ENGINEERING HOLD**. Implemented in the local simulator; nothing here is approved to buy or build. Coordinates are metres in the shared model axes: X from axis 1 toward the sanctuary, Y up from the nave floor ±0.000, Z negative toward B and positive toward H. Positions taken from the model are ray casts on the current meshes (`MODEL TRANSCRIPTION`); pier widths, cornice depths and moulding profiles are themselves illustrative transcriptions, not survey.

**Owner requests, 19 October 2026 (`USER CONFIRMED` intent):**

1. The reading lights get a better position and the colour of the timber, so that they are in keeping with the beams and look hidden.
2. The floodlights around the towers should hardly be noticed: not black, and not where they were.
3. The loudspeakers move off the concrete columns into the corners where the columns meet the walls, for a more open look.

This follows the owner's earlier direction for decorative and statue light (9 October: hide the source, show the light) and the concealment item ENG-011.

## 1. Reading lights on the beams

| Records | Type | Where | Finish |
| --- | --- | --- | --- |
| L3–L30 (L1, central blocks) | `readingProjector`, side bracket | Sanctuary-facing face of each tie beam, axes 3–9: X axis + 0.15, bracket centre Y +8.77, Z ±2.48 and ±2.72 (either side of the gilded band at ±2.60) | Beam lacquer |
| L31–L58 (L2, outer blocks) | `readingProjector`, side bracket | Sanctuary-facing face of each side beam: X axis + 0.11, Y +6.84, Z ±4.84 and ±6.09 (either side of the gilded cartouche, about ±4.96–6.00) | Beam lacquer |
| L59–L62 (L1, rear rows) | `readingProjector`, side bracket | Unchanged places on the inside of the entrance wall | Wall plaster |

- **Hidden by the beam.** The head stands beside the beam face; only its glare cowl reaches the soffit (lowest point 1–2 cm below it). From most seats behind a beam the beam itself screens the body; seats right under a beam look steeply up and see a small red head against the red beam. The old black projectors hung about 0.3 m below the soffit and were seen from everywhere.
- **Same colour as the timber.** The fitting draws with the model's own beam material, so it changes with **Settings → Structural timber tone** (red lacquer, natural, light oak, dark). The four entrance-wall heads use the plaster material. Both are proposals for a powder-coat match to real samples (Q50).
- **Same light.** Output, optics (28° central, 36° outer), tilt ±8° along the nave and aim points are kept. The tie-beam head aimed toward the sanctuary takes the inner place (Z ±2.48): in the outer place it sat 0.12 m nearer the side-aisle fan ahead of it and the analysis reported about 33 lux of blade flicker; the inner place removes that warning.
- **Cable.** The lead runs over the beam as before and drops down the sanctuary face in the finish-matched removable cover to the bracket plate. No drilling or notching of the timber is assumed.
- The **reference frame** comparison (no low tie beam) shows these heads where the drawn beams would be; they are drawn for the as-drawn frame only.

### 1.1 Sanctuary accent heads on the same beams (follow-up, 19 October 2026)

The twelve L3 accent heads that hang from the axis-9 tie and side beams were left black (projectors) and bronze (spotlights) above, so the last tie showed black heads beside the red reading lights. They now take the same beam lacquer. **Finish only**: type, body, place, aim, beam, output and circuit are unchanged, and the light, sound, air and electrical results are identical (`verify_simulator.cjs --report --estimates` gives the same figures as section 5; only the number of cached fitting prototypes grows by two). This is a proposed follow-up of the owner's 19 October request for the reading lights; the owner has not yet confirmed it for these accent heads.

| Records | Type | Fittings | Finish |
| --- | --- | --- | --- |
| L98–L105 | `projector24`, `spot15`, `projector36` | Altar key lights B/H, ambo key light, sanctuary step fills B/H, presider chair light, sanctuary frame washes B/H, under the axis-9 tie | Black / bronze → beam lacquer |
| L115–L118 | `spot15`, `projector36` | Statue accents and shrine washes B/H, under the axis-9 side beams | Bronze / black → beam lacquer |

- `projector24`, `projector36` and `spot15` gain a **Finish** setting (black or bronze as before, or *Beam timber*); the timber finish draws with the model's own beam material, follows **Settings → Structural timber tone**, and the pendant stem and canopy take the same lacquer. Every other head of these types keeps its metal finish, including the chamber heads behind the frame (crucifix, reredos, tabernacle) and the held wing projectors.
- Saved layouts: one-time revision `beamAccentFinishRevision = 2026-10-19-beam-accent-finish-1` (backup `.before-beam-accent-finish`). It changes only the finish of these twelve heads where each is still the same type at its default place and aim and still in its metal finish; a moved, re-aimed, re-typed or deleted head stays as the user left it. The pre-review wing comparison treats the new default black finish as untouched.
- Open, as for the reading heads (Q50): a powder-coat or lacquer match to a real sample, lens glare, and heat on a dark finish at the 22–50 W heads. The bronze roof uplight on top of the tie is unchanged. Evidence: [review/beam-accent-finish-2026-10-19](../../review/beam-accent-finish-2026-10-19/README.md).

## 2. Tower and façade lights on the cornice ledges

The black floods on 0.5 m arms (18 tower washes) and the black stand floods on the inner tower cornices (10 façade and stage floods) are replaced by fittings in the model's own cornice-moulding finish:

- `ledgeBar` · a low linear flood, about 0.09–0.11 m high, lying along a cornice lip with its optic 0.06 m beyond the lip. Its two light points sit in the bays either side of the central mullion of the stage above.
- `ledgeFlood` · a compact flood about 0.14 m high, used where one point is needed.

Measured ledge lines (tower B; H mirrored):

| Ledge top | Front lip / wall above | Side lip / wall above (|Z| − 10.153) |
| --- | --- | --- |
| +8.39 | X −0.38 / −0.05 | 2.83 / 2.465 |
| +15.84 | X −0.29 / +0.05 | 2.705 / 2.365 |
| +23.14 | X −0.19 / +0.335 | 2.605 / 2.09 |
| +29.09 (top cornice, in front of the balcony plinth) | X about +0.08 / +0.25 | — |

| Fittings per tower | Type | Place | Output |
| --- | --- | --- | --- |
| Stage 2, stage 3, belfry: front and side washes (6) | `ledgeBar`, 2.0 / 2.0 / 1.8 m | Along the lip of the cornice below each stage | Unchanged (7 000 / 6 000 / 4 500 front; 5 000 / 4 000 / 3 000 side); belfry optics 30° (were 40°) |
| Lower front and side washes over the porch (2) | `ledgeFlood` | Free end of the +8.39 lip, 1.3 m off the face centre (outer side / rear), head 0.08 m beyond the lip | Unchanged (3 500 / 2 500 lm) |
| Dome front wash (1) | `ledgeFlood` | +29.09 ledge on the face centre, head 0.06 m beyond the lip | **4 000 lm (was 2 500)** |
| Façade wash, central gable flood (2) | `ledgeFlood` | Inner corner of the +8.39 cornice, Z ±7.40 (across the inner lip) and ±7.70 (set back) | Unchanged |
| Central crown wash (1) | `ledgeFlood` | Inner corner of the +15.84 cornice, Z ±7.70 | Unchanged |
| Front stage floods (2, L9) | `ledgeFlood` | +8.39 front lip at Z ±(10.153 ± 1.7), head 0.07 m beyond | Unchanged |

**Why at the lip and not further back.** A first version laid the upward bars well behind the lip (0.09–0.24 m from the wall above). They were hidden even better, but they lit the wall at a grazing angle: the projecting columns and the louvres went dark at night. At the lip, with the optic just in front of the engaged columns, the night view matches the old arm floods (see the evening comparison below) while the bar is only 0.11 m high and the colour of the cornice. Two earlier façade floods stood inside the stage-2 corner pilaster plinths; the new positions are on open ledge.

**Dome.** Behind the balustrade the drum leaves no room at the centre; at 1.2 m to the side there is room, but from there the flood put a median of 0 lux on the visible face of the dome. The final flood sits on the top cornice in front of the balcony plinth, no higher than its step. Being lower and closer than the old arm head, it takes 4 000 lm for a median about 90 % of before. From this height the balustrade rail will shade the lowest band of the dome; the light calculation does not include the balustrade.

**Calculated façade light**, evening, direct vertical illuminance on the wall planes (four points across each face per height, both towers), the old arm layout rebuilt as real fittings in the same model. Average / median lux:

| Face | Before | After |
| --- | --- | --- |
| Stage 1 front / side (over the porch) | 177 / 46 · 114 / 33 | 198 / 43 · 146 / 29 |
| Stage 2 front / side | 89 / 55 · 68 / 44 | 251 / 53 · 169 / 43 |
| Stage 3 front / side | 84 / 65 · 57 / 46 | 257 / 65 · 159 / 46 |
| Belfry front / side | 106 / 87 · 71 / 60 | 122 / 98 · 82 / 66 |
| Dome, 44 points of its face visible from the forecourt | 414 / 208 | 254 / 190 |

Medians across the faces are about the same; the higher averages come from bright bands just above each bar. The physics module has no tower geometry as occluder, so shading by columns, cornices and the balustrade is not counted in either column. The central façade coverage check (`facadeCoverage` in `verify_simulator.cjs`) passes.

## 3. Loudspeakers in the pier–wall corners

| Records | Before | After |
| --- | --- | --- |
| S261–S272 · Wall speaker · axis 4–9 · B/H (A1) | On the pier face, X axis, Z ±7.07, Y +3.45, tilt −18° | On the masonry wall, X axis − 0.43, Z ±7.25, Y +3.45, tilt **−22°**; turned 50° toward the back as before |

- **More open piers.** Each pier face now carries only its Station of the Cross (+2.6 m) and its sconce (+4.6 m). The column sits within the pier's 0.18 m projection; its tilted top end stands about 35 mm proud of the pier face (it stood 0.20 m proud on the pier).
- **Why the entrance side.** The columns face the rows behind them. In the corner on the entrance side the pier is at the column's back; on the sanctuary side the pier would stand in front of it.
- **Why 22°.** Off the pier the columns are 0.18 m further from the outer seats. At the old tilt nave clarity fell (81 % of nave seats at STI 0.60, was 83 %); tilting 4° further down brings it to 84 %. No aim found by search keeps every figure at or above the baseline: turning the axis-9 pair toward the wings helps the wings and costs the nave more.
- **Fit.** Tilted 22° and turned 50°, the lower end swings toward the pier; at X axis − 0.43 it clears the pier side by about 20 mm (0.58 m pier width is illustrative). The model's simple tilt bracket (pivot 0.09 m from the wall) lets the lower end pass about 17 mm into the wall plane; on the pier it passed about 5 mm into the pier face. A real bracket needs more stand-off (Q52).
- Delays are aligned to the talker as before (`Align all`); the move changes them by about 1 ms.

## 4. Saved layouts

Revision `hiddenFittingsRevision = 2026-10-19-hidden-fittings-1` in `simulator/design.js`, applied once by `simulator/engine.js` with a backup under `.before-hidden-fittings`. A fitting moves only if it is still at its previous default type, place and aim (`hiddenFittingsBefore`); it takes the new type, mount, place, aim and finish, and keeps its ID, switching, dimmer, output, beam, level, delay and circuit. A fitting the user moved, re-aimed or deleted stays as it is; nothing is added. Checked in `verify_simulator.cjs` and on a scratch browser copy (100 of 100 untouched fittings moved, migrated layout identical to the new default).

## 5. Calculated results against unchanged `dev`

`node scripts/verify_simulator.cjs --report --estimates`, scene Full service · evening, run on this change and on an untouched copy of `dev` (c08ab66):

| Figure | `dev` | This change |
| --- | --- | --- |
| Seats ≥ 200 lux | 89.1 % | 90.2 % |
| Seat lux average / lowest 10 % | 312 / 199 | 305 / 212 |
| Wing minimum | 121.6 lux | 121.6 lux |
| Nave clarity: seats ≥ 0.60 / minimum | 83.0 % / 0.522 | 84.0 % / 0.536 |
| Wing clarity minimum / average | 0.422 / 0.490 | 0.409 / 0.483 |
| Feedback margin ambo / altar | 0.9 / 1.3 dB | 0.9 / 1.4 dB |
| Design warnings | feedback (2), dim seats 11 % | feedback (2) |
| Full-service estimate | 5 587 W | 5 610 W (L6 919 → 942 W: the two dome washes) |

Unmet design targets are the ones `dev` already misses (feedback margins below 3 dB, 95 % of seats at 200 lux, wing light and wing clarity). The wing clarity minimum is 0.013 lower than on `dev`.

## 6. Checks and evidence

- `node scripts/verify_model.cjs`, `node scripts/verify_cinematic.cjs`: passed.
- `node scripts/verify_simulator.cjs --report --estimates`: calculation checks passed; design targets as in section 5. New assertions: reading heads on the sanctuary face of their beam, sharing the beam material and lighting from below the soffit; entrance-wall heads in the plaster material; tower and façade ledge fittings on a cornice, at most 0.17 m high, no arm, optic clear of the masonry and beyond the lip for the up-washes, in the cornice material; wall speakers on the wall beside each pier, within 40 mm of its face plane; the migration. The old arm-projection assertions are replaced by these.
- `scripts/verify_concealed_routes.cjs` accepts a side-bracket fitting touching its beam face where the lead enters its plate (as it already accepted an uplight on the top of its beam), and treats fittings above +29.0 m (was +29.09) as dome-level for the cap routing.
- Desktop viewer, day and evening, recommended design and visit-only mode: no console errors. Before/after pictures: [review/hidden-fittings-2026-10-19](../../review/hidden-fittings-2026-10-19/README.md).

**Out of date after this change:** the A3 review drawings in `output/pdf/` and `output/pdf-vi/`, the cable and budget reports in `output/electrical-review/` and the hosted web snapshot until the next build. ReportLab is not installed on this machine, so they were not rebuilt; the Vietnamese product names for the three new types are added in `scripts/review_drawings_i18n.py`.

## 7. Open items

Questions **Q50–Q52** in the [question register](questions-for-parish-and-designers.json) and ENG-034 in [issues](issues.md): fixing brackets into the lacquered beams without notching, lacquer and plaster colour samples, glare from the cowls; fixing, weathering, drainage and lightning bonding of the ledge fittings, asymmetric wall-wash optics, balustrade shading of the dome and safe access at +8.4 to +29.1 m; real pier width, speaker tilt bracket stand-off, masonry fixing and an on-site speech and feedback test. A night mock-up of one tower face and one nave bay should precede any purchase.
