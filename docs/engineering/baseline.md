# Coordinated systems baseline

**Baseline established, 8 October 2026; performance design has not passed.** E1 follows the approved [roadmap](../../plan/engineering/README.md). Model source is `daadc10`; the unchanged recommended default matches all 322 items and every setting in the saved electrical layout. The label `2026-10-16-tower-board` is a version string, not a chronological approval date.

## Reproducible evidence

- [Raw checks](../../review/engineering-baseline-2026-10-08/README.md): model, 24 independent estimate cases, two full calculation audits, electrical and timber-package consistency pass. Strict simulator exits **1** at the low-feedback warning gate. Both audits agree exactly on 182 numeric leaves after runtime/timestamp exclusion.
- [24-case results](../../review/engineering-baseline-2026-10-08/study-summary.md), [inputs](../../review/engineering-baseline-2026-10-08/study-inputs/scenarios.json), [fingerprints](../../review/engineering-baseline-2026-10-08/study-results/manifest.json), [cross-check](../../review/engineering-baseline-2026-10-08/study-verification.json): 8,832 seat evaluations repeated from a fresh model with exact JSON equality excluding only export timestamps. 19 source files and 25 result files hash-checked; nine independent-audit rounded comparisons agree.
- [Dimension/register inventory](../../review/engineering-baseline-2026-10-08/source-inventory/README.md): 463 dimension rows, 51 model-grid rows, 22 open items; 327 equipment/enclosures, 329 routes and 2,681 vertices. All 118 saved fingerprint/count comparisons agree. Approved-specification, physical-control and cable/allowance input fields remain blank; original workbooks unchanged.

Reproduce into a **new empty directory** from this source revision:

```sh
node scripts/study_systems.cjs review/engineering-baseline-2026-10-08/study-inputs/scenarios.json /tmp/thachbi-baseline-repeat --repeat
```

The [adapter](../../scripts/lib/study_model.cjs) loads actual geometry and simulator modules using the existing verifier's headless browser/GPU substitutions. The [runner](../../scripts/study_systems.cjs) changes only in-memory settings and seating selection. User storage, defaults, physics, thresholds, source samples and electrical exports are untouched. Exclusive file creation prevents overwriting existing evidence; changed source/input hashes during a run prevent publication.

All receivers are sampled in every mode; occupancy changes room assumptions, not selected seats. Both layouts have 288 nave plus 80 wing receivers, with different nave positions. IDs derive from layout, pew, block and exact coordinates; they are study IDs, not approved capacity or equipment IDs. No active speech source yields **null** STI/SPL, not zero or a passing result.

## Starting performance and worst locations

Full-service evening, four blocks: occupancy .60, openings 1, 28 °C/75% RH, ambient 40 dBA, maintenance .80, mixed roof/slatted entrance, talker 62 dBA at .40 m. These are **DERIVED simulator estimates**, not measured conditions. Receiver positions below are X / local-floor Y / Z in metres. Books are at local floor +.80 m with per-seat offset (default X +.25 m); ears +1.20 m; air +.60 m. Decimal precision does not establish uncertainty or survey accuracy.

| Measure | Result and shortfall | Worst receiver / raw locator in [full-4 JSON](../../review/engineering-baseline-2026-10-08/study-results/full-4.json) |
| --- | --- | --- |
| Book light | Mean ~349 lux; minimum **196.803**; **4/368 below 200**. Weaker 95%-coverage regression passes. | `R4-55b0e9b61f9c11c8`, central B added bay 2–3, (6.535, 0, −1.600), `metrics.lux.lowest[0]`. Highest ~707 lux at choir wing; upper-band/glare interpretation pending. |
| Speech clarity | Mean ~.612; minimum **.439196**; **123/368 below .60**, four below .45. | `R4-ce9f2062283c8cf7`, ministers wing row 5, (43.040, −.320, −11.950), `metrics.sti.lowest[0]`. Wing mean ~.510 cannot erase its minimum. |
| Speech level | Minimum **66.920 dBA**, maximum 69.969; mean ~68.7. | `R4-78e59870525d9cb7`, outer H added bay 2–3, (6.535, 0, 5.985), `metrics.spl.lowest[0]`. Compare individual values with the 68–76 brief. |
| Background | Mean ~43.3 dBA; maximum **43.485**. Above 35/40 proposals; below 45 proposal. | `R4-ffcd355d46cc8d54`, choir wing row 3, (39.760, −.320, 10.150), `metrics.noise.highest[0]`. Criterion conflict unresolved. |
| Local movement | Mean ~.40 m/s; minimum **.256784**, maximum .786156; **18/368 below .30**, none above .80. | Same receiver as minimum lux, `metrics.air.lowest[0]`. Empirical occupied-speed estimate, not ventilation/heat-stress validation. |
| Mic feedback | S291 ambo **1.206 dB**; S292 altar **1.715 dB** vs 3 dB. | `microphones`; absolute capsule positions (41.370, 2.260, −2.620) and (44.740, 2.240, .450). |
| Exhaust | Nominal 25,920 m³/h / 7,456.449 m³ = **~3.48 ACH**, below 4–6 brief. | Nine exhaust units at speed 1; catalogue-flow sum excludes installed losses and make-up path. |
| Usage | Model total ~5,617 W / ~8.4 kWh per assumed 1.5 h service. | `power`; provisional loads/usage, not metered demand or final mains sizing. Passive-speaker audio ratings are separate. |

Raw JSON retains all receivers, full precision, block statistics, ten lowest/highest points per metric, every failing receiver ID, mic values, equipment/settings and warnings. No average or worst-ten list replaces the full failing set.

## Scenario findings

Two-block full service clears the 200-lux minimum at unchanged sample positions (201.045 lux minimum), but retains 109 seats below STI .60, eight below .30 m/s and low mic margins. It is not a coordinated winner or approved seating choice.

Weekday/prayer miss their own reading targets: four-block minima 139.986 / 46.015 lux versus 150 / 50; two-block minima 145.166 / 46.901. Quiet scenes have no amplified speech source; null STI is not successful intelligibility. Cleaning passes the sampled book-plane target, but actual floor/task checks remain necessary.

Overflow worsens indoor speech: four-block minimum STI .4207, 250 seats below .60 and ambo margin −.44 dB. At .60 m talker distance, full-service margins become −2.32 / −1.81 dB. Sparse occupancy and reduced opening absorption also worsen clarity/margins. Operating strategy and coordinated placement require review; higher output alone cannot resolve this.

Weather/opening sensitivities do not establish outdoor-air performance: empirical local air is unchanged by those inputs, and the opening scalar does not move windows or solve airflow. Daylight, measured weather, dedicated accessible/choir/outdoor grids, emergency and fault evidence remain gaps in the [acceptance matrix](acceptance-matrix.md).

## Dimensional and analytical limits

[Drawing spot review](../../review/engineering-baseline-2026-10-08/drawings/README.md) verifies filename 04 = printed sheet 6, filename 06 = sheet 4, filename 07 = sheet 5. Governing cells include Dimensions E10/F10 (4,500 mm), E17/F17 (7,200 mm), Model grid E17/E18 (X 36.975/44.175), E31/E32 (Z −3.6/+3.6), and Dimensions E306/F306 (+12.472 m). Grid endpoints, clear/exterior dimensions and floor/bearing/roof levels are distinct.

The workbook retains ISSUE-P01's 58 mm roof-length conflict, RFI-S01's 76 mm height discrepancy, RFI-S05 roof inputs and RFI-S07 column/foundation questions. Wall profiles, openings and cavities remain unresolved. Confirmation cells are blank; no drawing was rewritten to agree with the mesh.

[engine.js](../../Thach_Bi_Viewer/simulator/engine.js), `GEO.occluders`, represents simplified walls/openings, columns/bases and sanctuary forms. Displayed capitals/haunches, ties/side beams and B03 longitudinal proxies are not equivalent analytical obstructions. B03 sections are not verified mounting supports. Review those omissions before concealment/coverage claims. L100's capital contact and axis-10 restraint remain open.

Route checks verify software continuity using proposed covers, not surveyed cavities, separation/fire stopping, installation/access or concealment. Existing point sightlines omit occupants and furnishings. Accessible places and kneeler/row circulation need architectural resolution; support, cable and control details remain held in [issues](issues.md).

## E1 decision and next work

Baseline source consistency and reproducibility are established. Target conflicts are explicit in the [acceptance matrix](acceptance-matrix.md); code applicability and missing evidence are held in the [design basis](design-basis.md). E2 may audit model adequacy and compare bounded integrated concepts using unchanged targets/receivers. Its design gate cannot pass until required evidence and worst-location performance pass, or the engineer explicitly changes the approved scope.

No construction/purchasing release is made. Engineer/parish input requests are in the [issue register](issues.md); independent study and functional-map work continues while they are pending.
