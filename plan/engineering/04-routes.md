# Phase 04 — Coordinated 2D/3D routes

Status: **blocked; independent package committed and pushed, branch unmerged**. Branch: `eng/04-routes`, from main `703268a`. Depends on E2/E3 accepted equipment, access and connection geometry. Read [routing](../../docs/electrical-grid/routing.md), [controls](../../docs/electrical-grid/controls.md), [register preservation](../../docs/electrical-grid/register.md) and the [shared verification matrix](README.md#checks-and-synchronized-changes).

[Branch evidence at e6a3dcd](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/e6a3dcd/docs/electrical-grid/route-maps/README.md). The independent map package is verified; accepted concealed equipment/installation geometry remains missing.

## Outcome

One versioned route dataset drives matching 2D plans/sections, 3D paths, electrical schedules and Excel vertices. Each controllable item has traceable power/signal/control connection needs, with realistic concealed containment and access constraints. Geometric study lengths remain separate from installation cable quantities.

## Inputs

Accepted equipment poses/product entry points and concealment envelopes; source boards DB-1/DB-2 and LC-1/FC-1/AV-1; required interfaces and preliminary circuit grouping; architecture/structure and installation separation/fire/weather requirements. Final conductor/protection decisions require E5 supply/product calculations and iterate back here.

## Work packages, in order

1. **Establish topology and identity.** Reuse stable equipment/route IDs, distinguish display labels DB-1/DB-2 from source IDs DB1/DB2, and preserve DB-1 feeding DB-2. Map each device's actual required power, signal and control functions; passive speaker audio ratings do not create mains circuits. Shared trunks represent physical corridors or defined bundles, not an invented circuit topology.
2. **Route through verified available spaces.** Start from E3's accepted voids/supports and service zones. Draw continuous trunk/drop/home-run paths with enclosure and product terminations, mounting elevations, bend/access allowances and panel/floorbox locations. Check roof/beam/capital crossings, doors/windows, wing interruptions, furniture passages, tower cornices, moving equipment and maintenance extraction. Do not bury an unresolved penetration or reinforcement conflict in a coordinate.
3. **Coordinate power, audio and controls.** Define required segregation, containment occupancy, crossings, earthing/bonding, fire stopping, wet/exterior entries and spare capacity using the applicable checked basis. E4 needs an evidence-backed topology and space envelope sufficient to establish the routes. If missing control/product data could change that topology or make the envelope infeasible, hold the affected routes. Detailed conductor/terminal sizing belongs to E5; do not invent it here. Reconcile actual parallel cable counts and final containment capacity after E5 and before the E6 issue.
4. **Generate matching maps and lengths.** Produce plans by zone/level, relevant sections and the selectable 3D overlay from identical ordered vertices. Show grid/datum, heights, source/destination, circuit/function, direction/legend, equipment/control IDs, detail references and revision/status. Length equals the sum of centreline segments in metres; record full home runs, shared bundle paths and installed cable/containment allowances separately. Do not double-count audio bundles as purchased cable.
5. **Exercise change and persistence.** Move, re-aim where termination changes, remove, undo, reload and import/export representative equipment. Assert continuity, correct source board, regenerated 2D/3D endpoints and preserved IDs/retirement. Handle user-saved layouts independently of the recommended layout and retain one-time migration backups.
6. **Prepare E5 and reconcile the registers.** Refresh paired layout/systems JSON, CSV, all affected category workbooks and summary using the owning generator. Inspect route/vertex ownership, source fingerprints, retained amber fields and status of stale exports. Hand E5 the route lengths and evidenced installation envelopes. If its board/channel/cable decisions later change the route, reopen the affected E3/E4 checks and rerun relevant performance comparisons before the E6 issue; do not create a circular requirement for E5 completion before E4's route-coordination gate.

Suggested commit boundaries: topology/endpoint corrections with tests; coordinated zone route/detail changes with full synchronized outputs; matched 2D/3D export and mutation/retirement verification. Each change includes its own register refresh; do not defer Excel to phase 06.

## Planned deliverables

- Updated `docs/electrical-grid/routing.md`, matched `equipment-layout.json`, `electrical-systems.json`, `electrical-schedule.csv`, category files and summary.
- Revisioned 2D route plans/sections and 3D inspection evidence with identical IDs, endpoints, lengths and status; future files under `docs/electrical-grid/route-maps/`.
- Route-to-installation relationship schedule: individual cables/containment, shared paths, allowances, unresolved interfaces, penetrations/supports/access and responsible discipline.

## Checks and exit gate E4

- [ ] Every accepted connected item has all required functions mapped to the right board/rack and route; DB-2 feeder logic and active-speaker power/signal separation are preserved.
- [ ] Every route has unique ID, ordered continuous vertices, valid endpoints and category ownership; no unapproved structural penetration, visible span or access clash remains in the accepted scope.
- [ ] 2D plans/sections and 3D paths use the same dataset and revision; independent length recomputation agrees within documented numeric tolerance, distinct from survey accuracy.
- [ ] Geometric length, shared paths, actual cable multiplicity and installed allowances are separately stated. Unknown final sizes/allowances are pending, not zero; no purchasing grand total mixes these bases.
- [ ] `node scripts/verify_simulator.cjs --electrical` and applicable model/estimate/full/strict checks pass their required scope with retained design failures reported. Dynamic reroute, removal, undo, import/reload and selection are checked.
- [ ] Real desktop route selection/filtering/isolation, normal concealed appearance and restoration of building/roof state are inspected without console errors; relevant day/evening/frame/seating modes are covered.
- [ ] Electrical exports and `build_equipment_register.mjs --verify-workflow` reconcile; inputs, retired IDs and all six workbook structures survive; affected docs/plans and diff checks pass.

## Risks and handover

E4 coordinates design routes; it does not establish cable capacity, protection or an approved single-line diagram. No final cable order follows from centreline totals alone. Missing structural cavities or critical endpoint/interface decisions block the affected scope and the phase merge; independent map/schema checks can continue. Provide E5 with exact route lengths, proposed installation conditions and every remaining sizing input; no silent default from older provisional breaker tables.
