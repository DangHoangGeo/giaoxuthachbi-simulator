# Sanctuary wings: coordinated review, 9 October 2026

**Status: CONCEPT / ENGINEERING HOLD.** This branch develops the owner's requested smaller brass chandeliers and wall-mounted fans. It is a review configuration, not an accepted optimum, purchase schedule or construction issue. Neither fan appearance nor software verification establishes mounting strength, compliance, installed airflow or acoustic performance. Phase E2 remains unmerged while its acceptance criteria are unmet.

## Intent and source basis

The owner requested on 9 October that the six existing nave wall fans be visible by default, that the two sanctuary wings use hanging lights rather than their wall projectors, and that wall fans replace the two roof fans in each wing. The owner selected **smaller brass chandeliers matching the nave**. These are `USER CONFIRMED` appearance/design directions, not approval of ratings or exposed equipment under the earlier concealment requirement. The six nave wall fans are shown but remain **OFF** in built-in modes; visibility must not silently increase the operating noise.

Geometry is `MODEL TRANSCRIPTION`, not a new survey. The frozen [pre-review layout](../../review/wing-options-2026-10-09/baseline-layout.json) comes from the matched export before this change. The displayed wing gable in `Thach_Bi_Viewer/bundle.js` has centre X40.575 m, outer-wall centre Z±13.249 m and thickness 0.30 m; the modeled inner face is Z±13.099 m. Its window openings occupy X37.675–38.675 m and 42.475–43.475 m, with bottom Y0.850 m and top Y3.608 m. These endpoints are used only for a model-envelope screen. The wing floor is Y−0.320 m; axis 9–10 spans 7.200 m. The original dimension workbook and its unresolved survey/drawing conflicts are unchanged.

Coordinates are metres: X increases toward the sanctuary, Y is above nave finished floor, Z negative is B and positive is H. Model reference points are not bracket holes or terminal set-out points. Three decimals in exports do not establish millimetre accuracy. All anchors, restraint loads, substrate details, corrosion/weather protection, installation tolerances and maintenance provisions remain with the responsible designers.

## Lighting choice for review

L63–L70 retain their stable IDs and L8 circuit. Four small chandeliers per wing use X38.940/42.220 m × |Z|8.800/10.600 m, with the fixture reference at Y4.400 m. The modeled lowest body point is about Y3.160 m, approximately 3.480 m above the wing floor. Roof-derived suspension endpoints are visualization projections, not engineered supports. Existing wing pendant speakers S275–S278 keep their positions and settings.

The smaller brass envelope uses six arms at 0.60 m nominal radius, compared with 0.95 m for the eight-lamp nave type. Six 470 lm/4.5 W candle lamps give **2,820 lm and 27 W** using the existing catalog lamp assumption. The separate downward reading optic is an unverified **2,820 lm/24 W concept**, producing 5,640 lm/51 W total. The unchanged simulator splits flux equally between the decorative point emitter and downward spot. The review uses a 100° beam with the existing 1.6× field relation, 2700 K and full-service dim 1.00. None of these values comes from a selected manufacturer's IES/LDT or thermal design. A real integrated optic/driver and its ventilation, glare, flicker, dimming and service arrangement must be demonstrated.

Pure candle chandeliers were rejected as the only task lighting: all 80 wing receivers miss 200 lux in the final candle-only comparison. The initial hybrid row at |Z|11.250 m had overlapping complete envelopes with the existing speaker/support assemblies; it was rejected. Moving the rear row inward to 10.600 m preserves space for those assemblies. Lower/higher suspension, two/four fixtures per wing, beam angles and dim settings were compared without altering physics or receiver locations. No final product specification has been selected merely to reproduce these estimates.

## Calculation method and acceptance

[Coordinated comparison runner](../../scripts/study_wing_options.cjs) imports complete frozen layouts into the actual viewer/simulator. Import is necessary when changing product types so cached fixture geometry, emitter definitions and power calculations agree. The comparisons retain all 368 receiver positions, including 40 in each wing; the two- and four-block nave layouts both retain 80 wing samples. Seats are study receivers, not approved occupancy. Lighting is evaluated at the model book position 0.80 m above local floor, air at 0.60 m and noise/STI at 1.20 m. Summary XYZ identifies the seat floor; raw book offsets and the measurement plane must also be used to locate an instrument.

The existing project criteria remain visible: maintained book light 200–300 lux, local air 0.3–0.8 m/s, STI0.60 throughout, existing weaker wing test floor 0.45/mean 0.50, fan background comparison ceiling 45 dBA, feedback margin 3 dB. These are not established Vietnamese statutory requirements; see the [acceptance matrix](acceptance-matrix.md) and [design basis](design-basis.md). Lux minima alone do not establish uniformity/glare, and a passing calculation audit does not mean the design passed.

The existing maintenance factor 0.80, occupancy 0.60, ambient 40 dBA, temperature 28 °C, relative humidity 75%, opening scalar 1.0, absorption and catalog fan/speaker assumptions are unchanged. The fan method combines empirical oscillating jets by root-sum-square with the existing seated allowance; it is neither a pressure-network calculation nor time-resolved CFD. Octave-band direct/reverberant fan noise feeds STI. Fan flow ratings do not establish outdoor-air delivery, and no reduction of noise ratings, thresholds or seat sampling was used to improve a result.

The extra 20% light-output case is a sensitivity, in addition to the existing maintenance factor; it is not an invented product rating or a changed pass criterion. Exact raw values, layouts and source hashes are retained in [review evidence](../../review/wing-options-2026-10-09/README.md).

## Compared outcomes and the held review choice

All numbers below are modeled full-service values over all 80 wing receivers; no receiver is removed for failing. The [final raw comparison](../../review/wing-options-2026-10-09/final/summary.json) retains unrounded values and each seat. Ranges are minima–maxima, not confidence intervals.

| Alternative | Book light, lux | Seats at 0.3–0.8 m/s | Air range, m/s | Maximum noise, dBA | Minimum STI | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| Frozen wall-projector / four roof-fan baseline | 210.0–707.1 | 80/80 | 0.315–0.786 | 43.48 | 0.439 | Best air/noise among these cases, but does not meet the owner's wing appearance direction; excessive preferred light range and speech remain unresolved |
| Small candle chandeliers only + staggered low wall fans | 78.3–100.8 | 68/80 | 0.234–0.591 | 48.75 | 0.426 | Rejected as sole task lighting:80/80 below 200 lux |
| Hybrid chandeliers + staggered low wall fans | 204.3–365.9 | 68/80 | 0.234–0.591 | 48.75 | 0.426 | **Held display configuration** matching the requested equipment forms; no all-criteria pass |
| Same layout, wall-fan speed 2 | 204.3–365.9 | 80/80 | 0.303–0.784 | 52.93 | 0.402 | Air target met nominally, speech/noise worsened; not default |
| Same low-speed layout,20% less chandelier output | 173.7–303.4 | 68/80 | 0.234–0.591 | 48.75 | 0.426 |12/80 wing seats below 200 lux; product/maintenance margin unresolved |

The hybrid low-speed case has mean wing light 295.46 lux and minimum/mean uniformity 0.692;40/80 receivers exceed the preferred 300 lux upper bound. Low-speed wing STI averages **0.4999018**, still below the weaker 0.50 test target even though it rounds to 0.500. The comparison must not round this into a pass. In the two-block layout the minimum STI is 0.424812 and mean 0.498902; all 80 wing receivers remain below the 0.60 brief. Ambo/altar feedback margins remain 1.206/1.715 dB in four-block mode, below 3 dB.

The changed fan noise affects the whole model room, not only the wings: all 368 four-block receivers exceed 45 dBA in the low-speed review, with noise 46.37–48.75 dBA;36/368 have air below 0.3 m/s. The nominal whole-church book minimum rises to 203.70 lux, partly through the unchanged approximate diffuse-room contribution of the added light output. That estimate does not prove the four formerly dim nave seats are physically resolved. Selected photometry, reflections and measurements remain required.

The original 31-case fan sweep found no all-air-target case within its flat-height search. Subsequent geometry-led comparisons add staggered heights, wider above-window spacing and a 100 mm horizontal-spacing adjustment. The flat low layout was rejected for overlapping swept envelopes. Wider high mounts reduce noise modestly but leave more low-air seats; horizontal spacing alone still lacks service/product tolerance and reduces low-speed coverage to 64/80. The outer-high stagger retains 68/80 low-speed coverage with lower peak noise than the rejected flat case, and removes sampled envelope intersections. This is a reason to display it for review, not a claim that it beats the roof-fan baseline on engineering performance. No wall-fan arrangement tested satisfies air, noise, speech and concealment together.

The [24-scene/sensitivity issue](../../review/wing-options-2026-10-09/default-scenarios/manifest.json) repeats exactly from a fresh model load. Four-block weekday mode still misses its 150 lux target at two wing receivers (minimum 149.615 lux); prayer mode has adequate modeled wing book light for its 50 lux target but peak fan background 48.514 dBA and minimum air 0.224714 m/s. Courtyard-overflow operation reduces minimum wing STI to 0.412016. Restricted/closed-opening sensitivity reduces it to 0.404554/0.395634, and sparse occupancy to 0.396543. These failures remain. PA-off modes report STI **null/not applicable**, not a successful intelligibility result. Climate/opening changes do not alter the empirical local-jet velocity model, so unchanged air results do not establish hot/still or wet-season robustness.

## Wall-fan positions and worst locations

Each side has the following concept mounting references; use negative Z for B and positive Z for H. The model derives nozzle positions from the actual bracket/head transform, so mounting XYZ must not be substituted for nozzle XYZ in calculations.

| Fan in each wing | B / H equipment ID | Mount X, Y, abs(Z) (m) | Aim target X, Y, abs(Z) (m) |
| --- | --- | --- | --- |
|1 · outer front | F240 / F242 |39.150,3.500,13.060 |38.940,0.280,11.500 |
|2 · inner front | F241 / F243 |39.950,2.700,13.060 |38.940,0.280,9.000 |
|3 · inner rear | F-WING-B-3 / F-WING-H-3 |41.200,2.700,13.060 |42.220,0.280,9.000 |
|4 · outer rear | F-WING-B-4 / F-WING-H-4 |42.000,3.500,13.060 |42.220,0.280,11.500 |

All use the unchanged 45 cm oscillating wall-fan catalog proxy:80° total sweep; speed 1=0.45 m³/s,35 W,47 dBA at 1 m; speed 2=0.60 m³/s,45 W,52 dBA at 1 m. These are concept assumptions without a selected installed duty/noise curve. Mount heights above wing floor are 3.820/3.020 m. The eight fans use 280 W at low speed and 440 W maximum connected catalog rating, versus 136 W running for the four replaced roof fans. L8 rises from 260 W to 408 W at full dim. The combined full-service increase is 292 W; no energy saving is claimed.

Representative worst **measurement** positions in four-block low-speed mode:

- Book minimum 204.325 lux: seat floor X38.110,Y−0.320,Z±11.950; book is X38.110,Y0.480,Z±11.700 (the model offset points toward the nave).
- Air minimum 0.234500 m/s: X39.210,Y0.280,Z±10.150.
- Noise maximum 48.752893 dBA: X41.390,Y0.880,Z±11.950.
- STI minimum 0.425676: B-side X43.040,Y0.880,Z−11.950. Keep H-side and all other locations in the raw record, not just this worst example.

## Physical and concealment review

The ordinary 3D model must show equipment that is present. Hiding its mesh cannot satisfy the all-hidden physical requirement. The new brass fixtures and wall-fan guards remain visible concepts; moving fans from the roof to the perimeter improves the requested roof appearance but does not approve their appearance from the sanctuary, choir, wheelchair/shorter seated positions or exterior approaches. Product-sized mock-ups and the parish/architect's explicit resolution of the visibility/performance conflict are required.

A [geometry screen](../../scripts/verify_wing_clearance.cjs) checks complete chandelier/speaker envelopes, sampled fan sweep envelopes, window-opening extents, above-floor height and the main task beam. It samples 17 yaw positions across±40°, retaining guard geometry. Sampling is not proof of the continuous motion envelope or a manufacturer's required clearance. Wide field tails and decorative candle light can still reach blades even where the main 100° task cone clears them; flicker remains unverified. Full-scale test and selected fan/driver data are required. Positive envelope separation is not a maintenance-access approval.

Existing analytical occluders do not represent all carving, structural elements, occupants or fixtures. The structural support/capacity, daylight/glare, complete sightline, hidden-air-intake/free-area, heat, acoustic-screening and commissioning holds remain. No cavity is assumed adequate merely because the model routes a cable through it.

## Electrical and operating consequences

L8 retains eight light items, now concept chandelier assemblies. The separate new logical group **F5 · Wing wall fans · held review** maps to DB-1 via FC-1; it has no assigned physical channel, terminal, cable size, breaker, regulator product or commissioning authorization. F1 retains the 14 nave ceiling fans. F2 retains the six nave wall fans, now visible and OFF in every built-in mode; a user may operate them explicitly for a simulator comparison. F4 entrance circulators and V1 exhaust remain separate.

F5 is set to low speed in occupied/cleaning review modes and OFF for Night security/All off. This is a comparison state, not an approved operating instruction: quiet-prayer noise and hot-weather comfort remain unresolved. L8 keeps the existing scene dim values 1.00/full and festivals,0.75/weekday,0.25/prayer,1.00/cleaning and 0/security/off. The scene study reports failures instead of treating these levels as sufficient. No physical equipment commands are implemented by this work.

Full-service wing fan operating power, maximum connected loads, changed route IDs and retained/retired records must be read from the matched [category registers](../electrical-grid/categories/README.md) and [summary](../electrical-grid/summary-report.md). Shared DB-1/DB-2 feeder logic is retained. Passive speaker audio ratings are not mains demand. Geometric route lengths exclude installed slack/spares/termination allowances; no cable purchase total or conductor/protection selection is issued.

## Saved layouts

The overall design version is not bumped. A one-time scoped migration first writes `.before-wing-review` in browser storage, then changes only a completely untouched wing that matches the frozen baseline. A deleted, moved, renamed, hidden or retuned fitting, or a collision with a reserved new fan ID, prevents automatic changes to that entire wing. Unrelated/custom equipment and notes remain untouched. Untouched optional nave wall fans become visible and OFF. New additional wing IDs are appended without renumbering existing items. A failed backup leaves the saved layout unchanged. Already migrated, imported or subsequently edited layouts are not repeatedly overwritten.

The exact local entry point is `Thach_Bi_Viewer/OPEN_CHURCH.html`. A source update does not establish that a saved browser layout adopted it. Selecting an older Weekday/Prayer/Cleaning mode changes operating fields and can conservatively retain the old wing even when its positions were never edited. The saved migration marker records an attempt/history; it is not a current equipment-content check.

**Simulator → Wiring** now compares each side's actual type, mount, position, aim, emitter settings and visibility against the held source review. Counts include visible equipment even when OFF. A retained-layout notice in other simulator tabs links here. **Use reviewed lights and fans · B/H** explicitly replaces only that side's stable light/fan IDs and appends its missing extra fans; it preserves unrelated equipment, custom scenes/settings and existing light ON/dim values. Fans take the held F5 low/off state for the current built-in mode rather than inheriting roof-fan speed. Already current layouts are not actuated by this action. A conflicting reserved fan ID blocks adoption. A full layout backup is written first under `thachbi.simulator.v1.before-wing-adoption.<unique number>`; unavailable backup or failed current-layout persistence leaves the active layout/history unchanged. Undo/Redo restore the preceding/following equipment records. The marker remains history after Undo; the live comparison reports what is actually present.

The original baseline JSON remains available for an explicit offline comparison. Imports and reset use the existing undo mechanism. Default exports/printed sheets describe the branch's review model; a preserved customized browser layout can differ and requires its own matched export/register process.

## Inputs needed before accepting the design

The parish and responsible designers need to supply selected chandelier photometry/driver/flicker/thermal data; a quieter wall-fan shortlist with installed airflow/noise/dimension/oscillation data; verified gable/roof support and access details; and the agreed concealment treatment. Then repeat occupied light, speech/feedback/noise and local-air studies with the actual products, review full-scale appearance/maintenance and record calibrated commissioning evidence. Supply, earthing/fault level, approved protection and physical controls remain independent electrical holds.
