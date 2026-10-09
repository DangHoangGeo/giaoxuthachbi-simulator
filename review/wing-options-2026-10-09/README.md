# Wing review evidence · 9 October 2026

**ENGINEERING HOLD.** The local review branch implements the owner's requested smaller brass chandelier appearance and wing wall-fan alternative. It does not contain an accepted all-criteria design. The [engineering decision record](../../docs/engineering/wing-review.md) owns assumptions, exact positions, alternatives, worst locations, unresolved trades and required product/site evidence. Main retains the previous design until this phase is accepted.

## Current issue

- Eight small brass chandelier concepts on L8, IDs L63–L70: four per wing, each with six candle lamps and a separate downward reading optic. Existing wing speakers are retained. The rear row moves inward to separate complete envelopes.
- Eight wall-fan concepts replace the four wing roof fans: F240–F243 plus F-WING-B-3/4 and F-WING-H-3/4, separate logical F5 via DB-1/FC-1. Outer mounts Y3.50 m, inner Y2.70 m; the stagger avoids the rejected flat arrangement's sampled swept-envelope overlaps.
- Six existing nave wall fans F244–F249 are visible by default, OFF in every built-in mode. Existing owner-edited/deleted equipment is preserved by a scoped, backed-up migration; a reserved-ID collision skips the affected wing.
- Matched issue: 326 simulator items plus five enclosures =331 current register equipment; 296 shown connected components; 343 current routes and 2,775 vertices. Four old roof-fan drops/12 vertices remain retired. No equipment IDs retired.
- [Reusable Python export](../../scripts/build_review_drawings.py) regenerates the current [A3 paper set](../../output/pdf/thach-bi-electrical-review-A3.pdf) from the source model and matched registers. The nine-stage 3D coordination walkthrough remains under Simulator → Wiring. Both are design-development review tools.

## What the numbers say

The full-service four-block wing comparison uses all 80 wing seats within 368 total receivers. With low wall-fan speed, light is 204.325–365.908 lux, air 0.234500–0.590859 m/s, peak noise 48.752893 dBA and minimum STI0.425676. Twelve wing seats miss 0.3 m/s; all 80 miss STI0.60 and exceed 45 dBA. The wing mean STI0.4999018 also misses the weaker 0.50 test mean before rounding. Forty wing seats exceed the preferred 300 lux light upper bound. An extra 20% light-output reduction leaves 12 wing seats below 200 lux.

The original roof-fan baseline covers 80/80 wing seats within the air range, peaks at 43.485 dBA and has minimum STI0.439196. Its old wing wall lights reach 210–707 lux. Staggered wall fans at speed 2 cover 80/80 but increase peak noise to 52.931 dBA and reduce minimum STI to 0.401824. No candidate meets all criteria. The held display choice follows the requested equipment forms while retaining those costs visibly; it is not a performance winner over the roof-fan baseline.

Whole-room effects remain: low-speed review noise 46.37–48.75 dBA exceeds 45 at all 368 four-block seats;36 seats have air below 0.3 m/s. Unchanged ambo/altar feedback margins remain 1.206/1.715 dB against 3 dB. The nominal whole-room light minimum 203.70 lux depends partly on the existing diffuse-room approximation; it is not measured resolution of earlier dim seats. Exhaust delivery/pressure, daylight/glare, installed products, concealment, supports, maintenance, physical controls and electrical sizing remain held.

## Reproducible evidence

| Evidence | Files / method |
| --- | --- |
| Frozen pre-review model | [baseline-layout.json](baseline-layout.json); preserves the prior matched exported layout |
| Original 31-case fan sweep | [summary](fan-sweep/summary.csv), [raw cases](fan-sweep/cases.json), [repeat record](fan-sweep/repeat-verification.json), [frozen-baseline rerun](fan-sweep/frozen-baseline-rerun/README.md); exact parity with full receiver analysis for baseline and a converted case. These flat-height results are historical comparisons, not the current staggered choice |
|26 bounded light alternatives | [inputs](lighting-comparison-cases.json), [summary](lighting/summary.json), [manifest](lighting/manifest.json); two/four chandeliers, candle-only/hybrid, heights/beam/dim, and speaker-envelope correction |
|10 fan-clearance alternatives | [inputs](fan-clearance-cases.json), [summary](fan-clearance/summary.json), [manifest](fan-clearance/manifest.json); staggering versus distributed higher mounts |
|2 horizontal-spacing alternatives | [inputs](fan-spacing-cases.json), [summary](fan-spacing/summary.json), [manifest](fan-spacing/manifest.json) |
|6 final coordinated cases | [inputs](final-cases.json), [summary](final/summary.json), [manifest](final/manifest.json); each case retains full layout, all seat results, fan origins, microphones, power and warnings |
|24 current default scenes/sensitivities, repeated from fresh load | [manifest](default-scenarios/manifest.json); uses the unchanged [baseline scenario definitions](../engineering-baseline-2026-10-08/study-inputs/scenarios.json), exact equality across fresh model loads |
|Geometry screen | [result](clearance/geometry.json), [log](clearance.log), [script](../../scripts/verify_wing_clearance.cjs);17 fan yaw samples, complete envelopes, window extents, floor-height and main task-beam checks |
|Rejected geometry | [overlap](clearance/rejected-overlap.json); flat neighbouring fans overlap by about 44 mm in the conservative X envelope. `rejected-flat-coordinated/` and `rejected-flat-scenarios/` are explicitly superseded |
|Calculation/package audit | [audit](calculation-audit.log), [model](model.log), [walkthrough](installation-review.log); software results retain unmet design targets |
|Migration and actual desktop | [verification](verification/README.md);170 migration cases,32 settled desktop frames, isolated storage, changed/deleted records, undo/import/reload and viewpoint evidence. Separate [F5 control check](verification/f5-controls.json) verifies circuit isolation, upstream board context and actual Off/Low simulator controls |
|Registers/PDF | [print evidence](print/); preservation/reconciliation, source hashes, all-page rendering and changed sheets |

Study methods import complete layouts so cached fixture types agree with the changed catalog types. No physics, threshold or receiver-sampling code was changed. Receiver summary coordinates are seat-floor XYZ; the measurement-plane/offset metadata must be applied when locating a field instrument. Baseline/proposal parameters remain concept/model inputs rather than survey or manufacturer evidence.

Historical studies retain their original source hashes. `historical-sources/` and the fan sweep's `initial-run/` retain earlier runner/model revisions needed to explain those hashes; they are not runtime modules and must not be loaded by the viewer. Rejected intermediate layouts are retained for traceability. The final/default manifests and current exports are the current issue; chronological filenames alone do not establish acceptance.

## Commands

Run from the repository root. Use a new output directory for `study_systems.cjs`, which refuses to overwrite an existing issue.

```sh
node scripts/study_wing_options.cjs /tmp/wing-final-repeat review/wing-options-2026-10-09/final-cases.json
node scripts/study_wing_fans.cjs /tmp/wing-original-fan-repeat
node scripts/study_systems.cjs review/engineering-baseline-2026-10-08/study-inputs/scenarios.json /tmp/wing-scenes-repeat --repeat
node scripts/verify_wing_clearance.cjs
node scripts/verify_wing_review.cjs
node scripts/verify_simulator.cjs --report --estimates
node scripts/verify_model.cjs --plan
node scripts/verify_installation_review.cjs
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
python3 scripts/build_review_drawings.py
python3 scripts/verify_review_drawings.py
```

Desktop checks use an isolated Chrome profile; see `scripts/verify_wing_review_browser.cjs`. No phone UI/UX checks or physical installation tests were performed. Positive geometry gaps (minimum 0.331 m chandelier/speaker and 0.168 m sampled fan/fan envelopes) are not manufacturer service clearances, continuous-motion proof or anchor design. The ordinary view shows visible equipment honestly; concealment remains unresolved.
