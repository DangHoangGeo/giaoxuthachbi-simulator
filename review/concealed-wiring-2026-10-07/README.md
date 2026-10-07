# Concealed wiring review · 7 October 2026

User review of the nave exposed a routing defect: coloured paths crossed below
the beams, and the two tabletop microphones had long feeds at microphone height.
Baseline: `6c7f528`. Implemented routing/service revision:
`2026-10-07-concealed-1`. This is a coordinated visualization proposal, not an
installation or construction release.

## What changed

- Main-beam feeds approach above the roof lining, outside the actual rafter
  cores, then follow beam tops with short covered returns to fittings. The final
  iteration removed the first attempt's visible loops beside the capitals.
- Side beams, wall bands, wing/veranda roof paths, service ceiling and tower
  corners replace exposed cross-room paths. Tower dome feeds traverse behind
  the cornice finish; its physical service cavity remains unresolved.
- Microphones use separate AV-1 home runs below the floor. The ambo path rises
  at the pedestal centre and follows the sloped desk. Hollow furniture neck and
  socket proposals close the existing gaps while retaining the microphone pose.
- The sanctuary chamber has explicit removable lining shells/service voids,
  retaining its visible faces, external envelope and analytical boundaries.
- Normal-view cables use a 6 mm display diameter and finished cover proposals.
  Systems-only retains enlarged, coloured routes. Green selection is an x-ray
  inspection highlight. These displays use identical route vertices/lengths.
- Equipment locations, IDs, circuits, aiming, physical simulation inputs,
  source boards and saved-layout behavior are preserved.

No length or power saving is claimed as an engineered outcome. The changed
geometry alters the study lengths; installed cable topology, allowances and
specifications remain pending.

## Source review and limitations

Checked the electrical [routing basis](../../docs/electrical-grid/routing.md),
[controls](../../docs/electrical-grid/controls.md),
[register workflow](../../docs/electrical-grid/register.md),
[systems brief](../../docs/interior-systems-plan.md),
[sanctuary model](../../docs/sanctuary-model.md),
[sound brief](../../docs/systems/sound.md),
[timber package](../../docs/beams-roof-connections/SPECIFICATION.md), dimension
workbook and actual source meshes in `bundle.js`, `sanctuary.js`, `carving.js`
and simulator `engine.js`. Drawing dimensions, model transcriptions, concept
geometry and engineering holds are distinguished in the routing document.

Luna 6 and Sol 6.1 agents independently gathered source geometry, reviewed
resource lifetime and added source-geometry regression checks. Review found
the capital-loop, tower-cap and furniture-gap issues addressed in the final
iteration. Primary implementation and integration were checked separately.

Outstanding details: rafter/tie bearing and roof build-up; supports and removable
access; power/signal segregation; floorboxes and furniture passages; chamber
lining backing/fire performance; tower cornice cavities; product cable entries,
weathering and penetration details. `L100` retains its pre-existing
canopy/abacus mounting contact. Its cable now terminates at a proposed lamp-body
entry, with an explicit mounting hold. The reference-frame alternative is
visually checked but is not a separate coordinated installation design.

## Verification

All commands ran from the repository root. Logs are retained alongside this file.

| Check | Result |
| --- | --- |
| `node scripts/verify_model.cjs --plan` | Pass; architectural/navigation checks, unchanged generated plan data. |
| `node scripts/verify_estimates.cjs` | Pass; reproducible calculation invariants. |
| `node scripts/verify_simulator.cjs --report --estimates` | Pass in calculation-audit mode; unmet design targets retained below. |
| `node scripts/verify_simulator.cjs --electrical --export-electrical` | Pass; matched systems/layout JSON and CSV refreshed. |
| `node scripts/verify_simulator.cjs --electrical` | Pass after the final narrow socket-clearance regression. |
| `node scripts/build_equipment_register.mjs --verify-workflow` | Pass in bundled artifact runtime; all six workbooks recalculated/exported, lengths reconciled, no formula errors. |
| `node scripts/verify_viewer_controls.cjs <output-directory>` | Pass; real browser light/fan/sound actions, fan movement, isolation, undo, moved/dimmed/deleted items through reload and import. |
| `node scripts/verify_wiring_viewer.cjs <output-directory>` | Pass; desktop/phone, day/evening, both frame/seating modes, filtering, hide/show, selection, roof-state restoration, unchanged vertices and reusable geometry. No console/page errors. |
| `git diff --check` | Pass. |

Browser scripts use an isolated Chrome context and `PLAYWRIGHT_MODULE` pointing
to the installed Playwright dependency. They do not change the user's browser
storage. Tests inspect a viewport, not a physical phone or a low-spec PC benchmark.

The independent concealment check covers **329 runs**, **35 main/side/longitudinal
beam cores**, **14 capital cores**, **36 source rafters**, **43 above-lining beam
approaches**, **19,243 roof samples**, **11 chamber feeds**, the ambo's actual
service bores, two tower cap crossings, and microphone edits/restoration. The
test checks default paths and explicit mutations; it cannot approve arbitrary
user equipment placements or all possible installation conflicts.

There are **149 reusable source covers**, drawn in **two finish batches**.
Eight unchanged browser rebuilds preserve both route and cover geometry IDs.
Source covers remain hidden; filters and mode changes keep the batch count
bounded. No new continuous animation or allocation loop was added.

Retained engineering shortfalls from the full audit: ambo/altar feedback margins
**1.2/1.7 dB**, wing STI minimum **0.439** (target 0.45; average 0.510), and four
seats below the 200 lux brief (minimum **197 lux**). Ventilation and sightline
limitations remain. Calculation-audit success does not erase these failures.

## Registers and exports

**327 equipment/enclosure records, 286 connected components, 329 routes and
2,681 vertices.** Stable equipment and route IDs are unchanged. The layout JSON
diff contains only its saved timestamp. The six registers retain their four
sheets, all equipment cells, engineering input values, styles and frozen panes;
see [preservation checks](register-preservation.json). Recalculation reconciles
every route length to the source vertices. The summary and manifest fingerprints
match the newly exported files. No engineering specifications or allowances
were invented.

| Example | Before | After | Length basis |
| --- | ---: | ---: | --- |
| Reading-light `L3` drop | 7.005 m | 8.727 m | Drop geometry, without its shared power trunk |
| Ambo mic `S291` | 51.479 m | 15.494 m | Full individual home run, including upstream path |
| Altar mic `S292` | See prior snapshot | 8.545 m | Full individual home run, including upstream path |

All drawn paths total 4,534.622 m, compared with 4,684.509 m before. This includes
shared corridors and mixed length bases and **is not a cable-purchasing total**.
See the generated [summary](../../docs/electrical-grid/summary-report.md) for the
separate ordinary-path, full-home-run and shared-bundle totals.

Representative saved workbook ranges were inspected/rendered before and after:
Lighting Electrical Lines H10:P11, Sound H46:P47, and Route Points A6:G14 in both.
Text and values fit the existing styles. `register-lighting.png`,
`register-sound.png` and `register-points.png` retain final previews. Excel-native
interactive recalculation was not exercised; the bundled artifact engine and
saved XLSX contents were verified.

## Visual evidence

All building screenshots keep the wiring layer enabled. Normal-view concealment
is therefore geometry/containment based, not the Hide wiring switch.

- [Nave looking up](nave-up.jpg) and [back toward entrance](nave-back.jpg).
- [Ambo](ambo.jpg), [altar](altar.jpg), [wing](wing.jpg),
  [veranda](veranda.jpg), [service room](service.jpg),
  [tower cornice](tower-cornice.jpg).
- [Evening](nave-evening.jpg), [reference frame](nave-reference-frame.jpg),
  [two seating blocks](nave-two-blocks.jpg).
- [Phone wiring controls](phone-sanctuary.jpg) and [phone isolation](phone-systems.jpg).
- [Browser assertions](browser-checks.json) and [operating controls](controls/checks.json).
- [Selected original defective routes](before-routes.json) are historical evidence.
