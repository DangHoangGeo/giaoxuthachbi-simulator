# Review evidence · electrical walk-round, safety and efficiency · 9 October 2026

Evidence for the [safety and efficiency review](../../docs/electrical-grid/safety-efficiency-review.md). Source: branch `eng/11-outlets-facade-statues`, on top of `e79da66`. Everything here is a comparison on unconfirmed supply, product and installation data: not a wiring design and not approval to buy, build or energise.

## Files

| File | Content |
| --- | --- |
| [safety-efficiency-review.json](safety-efficiency-review.json) | Complete result: assumptions, the nine zones, the 22 mains circuits in both comparison cases, fans, points within reach, weather exposure, signal/mains proximity per route, route lengths by type, life-safety states per quick mode, supply scenarios with the three-phase example, and energy. Includes the model Git revision and the source file hashes. |
| [circuit-screens.csv](circuit-screens.csv) | One row per circuit and comparison case: design current, comparison breaker, loading, longest path, comparison area, voltage drop and the far-end earth-fault screen. |
| [zone-walk.csv](zone-walk.csv) | The walk by zone: counts, circuits, connected and full-service watts, reach and exposure counts. |
| [walk-01-plan-all-systems.jpg](walk-01-plan-all-systems.jpg) | Simulator → Wiring → Systems only, from above: boards at the right (service room), towers at the left. |
| [walk-02-sanctuary-wing-b-service-room.jpg](walk-02-sanctuary-wing-b-service-room.jpg) | Sanctuary, wing B and the service-room boards; the violet lines are the two microphone runs under the floor, apart from the mains routes. |
| [walk-03-entrance-towers-event-routes.jpg](walk-03-entrance-towers-event-routes.jpg) | Entrance, DB-2 and the towers; the teal lines at the bottom are the two buried event-power routes. |
| [walk-04-nave-wall-band-shared-corridor.jpg](walk-04-nave-wall-band-shared-corridor.jpg) | Nave wall band: lighting (amber), fan (brown), loudspeaker (blue) trunks and the DB-2 feeder (red) stacked on one line. This is the shared corridor measured by the separation screen. |

The pictures are reduced screen captures of the default layout taken before the exit-sign routes were moved to DB-1; on screen that change only moves the start of the E1 lines from LC-1 to DB-1, 1 m away on the same wall. Line thickness is a display convention, not a cable size.

## Rebuild and check

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
python3 scripts/build_electrical_safety_review.py
python3 scripts/build_electrical_safety_review.py --check
```

The builder reads the default model through `scripts/export_electrical_loads.cjs` (which refuses to run when the model, the exports and the six registers disagree) and `scripts/export_electrical_safety.cjs`, and reuses the formulas and tables of `scripts/electrical_review.py`.

## Hand checks of the method

Recomputed by hand from the published inputs, independent of the script:

| Quantity | Hand calculation | Script |
| --- | --- | --- |
| Fixed equipment, S1 planning current | 9,261.5 W × 1.25 ÷ (230 V × 0.9) = 55.93 A | 55.9 A |
| P2 drop at 2.5 mm², 16 A, 60.743 m | 2 × 16 × (23.7 ÷ 2.5 + 0.08) × 0.060743 = 18.58 V = 8.08 % of 230 V | 8.08 % |
| L1 far-end fault at 1.5 mm², 85.699 m | loop 2 × 23.7 × 0.085699 ÷ 1.5 = 2.708 Ω; 0.95 × 230 ÷ 2.708 = 80.7 A | 81 A |
| DB-2 feeder, three phases, 10 mm² | 80.43 A ÷ 3 = 26.81 A; 26.81 × (2.37 + 0.08) × 0.080683 = 5.30 V = 2.30 % | 2.30 % |
| Interior lighting density | 2,386.6 W ÷ 811.3 m² = 2.94 W/m² | 2.94 W/m² |
| Exit signs, continuous | 15 W × 8,760 h = 131.4 kWh a year | 131 kWh |

## Checks run on the final source

| Command | Result |
| --- | --- |
| `node scripts/verify_simulator.cjs --electrical --export-electrical` | passed: 317 connected components, 370 selectable routes; concealed-routing checks passed |
| `node scripts/build_equipment_register.mjs --verify-workflow` | passed: 359 current records, 370 routes, 2,928 vertices; 10 retired equipment and 21 retired routes preserved (seven are the earlier LC-1 origins of E1) |
| `python3 scripts/build_electrical_safety_review.py` and `--check` | built; the saved result matches the current model |
| `node scripts/verify_model.cjs`, `node scripts/verify_estimates.cjs`, `node scripts/verify_cinematic.cjs` | passed |
| `node scripts/verify_simulator.cjs --report --estimates` | calculation checks passed; unmet design targets unchanged: feedback margins 0.9 / 1.3 dB, 11 % of seats below 200 lux, 65 % of seats at STI ≥ 0.60 |
| `verify_installation_review`, `verify_review_layers`, `verify_review_navigation`, `verify_concealed_routes`, `verify_nave_fans`, `verify_wing_art`, `verify_wing_clearance`, `verify_nave_fan_clearance`, `verify_light_grid`, `verify_texture_memory`, `verify_viewer_performance` | passed |
| `python3 docs/beams-roof-connections/validate.py` | passed (no structural capacity verified) |
| Desktop viewer, saved layout at `localhost:8765` | 354 items, 370 routes, the seven E1 routes start at DB-1, no console errors |

Not run: the `*_browser` checks (Playwright is not installed here), and `build_electrical_budget.py` / `build_review_drawings.py` (ReportLab is not installed). The A3 drawings, the cable report and the budget in `output/` therefore still predate the socket outlets, circuit L10 and now the E1 origin; they are stale for those items. `verify_wing_revision`, `verify_wing_review` and `verify_wing_sound` still fail on their fixed 320-item inventory, as before.
