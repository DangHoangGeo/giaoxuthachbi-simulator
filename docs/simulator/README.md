# Simulator documentation

The simulator supports the project's first priority: optimize the locations and settings of lights, sound equipment and fans, then coordinate their wiring and manual/quick controls.

- [User guide and revision history](guide.md)
- [Viewer performance and memory](performance.md)
- [Calculation methods and limitations](methods-and-limitations.md)
- [Coordinated baseline, scenarios and unresolved targets](../engineering/baseline.md)
- [Electrical grid, 2D/3D routes and control boards](../electrical-grid/README.md)
- [Equipment/line Excel register and layout revision workflow](../electrical-grid/register.md)
- [Interior and systems brief](../interior-systems-plan.md)
- [Current sanctuary geometry and results](../sanctuary-model.md)
- [Recorded calculation audit](../../review/stats-audit-2026-10-06/README.md)
- [Open the viewer](../../Thach_Bi_Viewer/OPEN_CHURCH.html)
- [Superseded simulator sketch](old/Simulator_Test.md) — retained as historical context; not a current specification.

## Working sequence

1. Record a reproducible baseline: layout, seating, occupancy, openings, environment, equipment settings and target values.
2. Compare coordinated light/sound/fan positions and aiming at occupied seats, the sanctuary, circulation areas and outdoor overflow. Preserve mounting, access and sightline constraints.
3. Update the shared 2D/3D route geometry and quantities from the same equipment IDs and positions.
4. Map each controllable item to the main/sub-board design, its manual control and the quick modes described in the [control brief](../electrical-grid/controls.md).

Repeat the comparison if routes, supports or controls force equipment to move. Performance, installation feasibility and usability must be reviewed together.

## Validation status

The 7 October 2026 review passed geometry, 24 independent estimate checks, the timber reference package and the simulator calculation audit. The strict simulator check still fails on low microphone feedback margins; the audit also retains a wing speech-clarity shortfall. Some seats miss the lighting brief. These are unresolved design results.

Run `node scripts/verify_estimates.cjs` for calculation changes and `node scripts/verify_simulator.cjs --report --estimates` for a full audit. Run the strict `node scripts/verify_simulator.cjs` before claiming its design targets pass. See [AGENTS.md](../../AGENTS.md) for checks by change type.

Review screenshots and raw audit records remain under `review/`. The viewer's [opening instructions](../../Thach_Bi_Viewer/READ_ME.txt) remain beside the offline application. Older tables in the guide describe previous revisions and are not current acceptance evidence.


## Nave fans · 9 October 2026

The [current nave review](../engineering/nave-wall-fans.md) displays eight F2 wall fans per side by default. F2 remains OFF in every built-in mode. Saved edits are retained with a separate per-side adoption workflow; displayed geometry and actual quantity are checked independently of migration history. Extended fan brackets are visualization proxies. The [current evidence](../../review/nave-wall-fans-2026-10-09/README.md) records preservation, geometry, desktop controls and calculations; baseline design failures and physical/electrical approvals remain held.
