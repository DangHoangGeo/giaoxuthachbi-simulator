# Electrical routing study

See the [electrical grid index](README.md) for the current work priority and [manual boards and quick modes](controls.md) for the control-design brief. This document describes the implemented routing study; physical installation design remains pending.

Open `Thach_Bi_Viewer/OPEN_CHURCH.html` and choose **Simulator → Wiring → Systems only**. The building, roof, furnishings and grounds disappear; boards, wiring and connected equipment remain. **Restore building** restores the architectural visibility, including the previous roof state. **View settings → Electrical systems only** offers the same isolation switch.

In the building view, feeds follow concealed routes and proposed finish-matched covers. Cable display diameter is 6 mm; Systems only enlarges it to 48 mm (64 mm feeders) and uses system colours. These are display conventions, not specified cable/conduit sizes. A selected green route deliberately shows through walls for inspection. The same vertices and lengths are used in both views and in the flat plan/export.

Select a physical enclosure or wire in 3D, a route in the flat plan, or an individual run in the list. The selected route highlights green and reports its source, destination, circuit, length and height range. **Edit component** opens the existing fixture controls. Changes to location, product parameters, circuit, visibility, additions, removal, undo and imported layouts regenerate the wiring. Overlapping runs remain individually selectable through the run list. Filters select DB-1, DB-2, power or audio routes.

The recommended design checked on **7 October 2026 has 286 connected components and 329 selectable runs**. Counts reflect that layout; hidden alternatives are excluded from installed-study totals and retained separately in the exported component schedule. Lights switched off are still connected. Non-electrical furnishings and candles are excluded. Electrically illuminated seasonal models are retained as equipment when shown.

## Retained equipment locations

The independent electrical models replace the static service-room equipment at its original positions. Coordinates are metres, world X / elevation / Z.

| Equipment | Position | Model envelope X / Y / Z | Function |
|---|---|---|---|
| DB-1 | 48.895 / 1.750 / −1.550 | 200 / 1100 / 800 mm | Main distribution, feeds DB-2, lighting controls, fan controls and audio equipment |
| LC-1 | 48.895 / 1.850 / −0.550 | 200 / 900 / 800 mm | Existing lighting and scene-control enclosure |
| FC-1 | 48.895 / 1.950 / 0.400 | 200 / 700 / 600 mm | Existing fan speed-control enclosure |
| AV-1 | 49.275 / 0.950 / 1.400 | 800 / 1600 / 620 mm | Existing amplifier, mixer and microphone rack |
| DB-2 | 2.730 / 1.500 / −3.300 | 160 / 620 / 460 mm | Entrance, towers, front stage and festival circuits |

These envelopes reproduce the planning geometry, not approved products. The enclosure switch faces are schematic, not the actual internal breaker or rack-module layout.

The two existing 600 × 600 × 30 mm service-room ceiling panels are now selectable simulator fixtures on L3. Their 3000 lm / 30 W / 4000 K category values are provisional. Existing saved layouts receive these panels once through an additive migration; other saved fixture edits are preserved. After migration, a deliberate removal stays removed.

## Routing basis

Power circuits use a shared trunk with individually selectable component drops. Lighting originates at LC-1, fans at FC-1, and entrance circuits at DB-2. Local feeders join each control enclosure to DB-1. The DB-2 feeder is a single continuous path through the church perimeter. Service-room lights have local ceiling routes.

Main side-wall bands follow the modeled ±7.360 m wall centres above the door and window openings. Drops shift to solid piers beside openings. The open 9–10 wing interrupts those walls: feeds rise in the end piers and follow the wing roof in proposed removable soffit containment. They no longer cross the open wing at wall-band height. Exterior arcade and wing fittings receive roof-level feeds and local wall descents. Entrance routes cross above the main door. Tower runs follow solid corner piers and change position at the stage ledges, avoiding louver openings. Dome washes approach behind the top cornice finish with a short local rise, not a horizontal span in front of the dome. The cornice service space remains unresolved.

Main-beam lights approach above the ivory roof lining, offset behind the rafter cores, then return around the joint onto the top of the tie. Short removable timber-tone covers conceal the joint return and the rear-face drop to the fitting. Side-beam feeds run above the beam top. No route assumes drilling or notching a structural timber. Roof-suspended fixtures continue through their existing stems; local connectors and the passage into each canopy remain product-dependent. Portable floor equipment uses proposed underfloor conduit and a local termination. Roof decoration feeds finish at the modeled component connection; strand entry-point details remain pending.

Audio and microphone connections originate at AV-1. Their trunks represent bundles of individual home runs, not speakers connected directly to a mains breaker or an assumed speaker bus. Active speaker types receive a separate DB-1 power connection as well as signal. The actual amplifier outputs, speaker impedance, line voltage, signal connectors and channel allocation remain to be designed.

Both microphone home runs now descend at AV-1, remain below the lowest modeled floor along their path, and rise locally through the altar/ambo furniture to the microphone base. The rule applies to microphones independently of absolute mounting height. The earlier tabletop microphones at +1.90/+1.88 m incorrectly received long exposed horizontal drops. Floorboxes, accessible furniture passages, final slab/floor buildup and separation from power are still design inputs. An edited microphone position stays where the user put it; a new local riser must be coordinated with that position.

At the ambo, the local path follows the pedestal centre and the sloped desk interior. Proposed hollow neck/socket fittings close the existing furniture-to-desk and desk-to-microphone gaps without moving the mic. This avoids the short exposed cable that a straight rise at the off-centre microphone X would leave beside the tapered pedestal. The export includes `furnitureConnection` and `furniturePoints`; the [sanctuary record](../sanctuary-model.md) gives their proposed geometry and limitations.

### Concealment revision, 7 October 2026

Route revision `2026-10-07-concealed-1` replaces schematic below-beam, below-lining and head-height paths. Equipment locations, aiming, ratings, circuit IDs and analytical inputs are unchanged. The building model now explicitly reserves a service void behind the sanctuary chamber lining; it does not disguise a cable inside a solid timber slab.

| Route/space | Model basis and proposal | Remaining decision |
| --- | --- | --- |
| Main ties and side beams | `engine.js` beam envelopes: tie top +9.180 m, side top +7.000 m. Route centreline is 55 mm above each top. `bundle.js` schematic/visible rafters and `carving.js` capital cores are checked separately. | Rafter/tie bearing gap, fixings, cable separation, access and actual containment section. R01/B03 engineering holds remain; these meshes do not establish an approved support. |
| Roof approaches | Main roof surface ridge +12.472 m/eave +7.130 m; route 90 mm below that surface, above the modeled lining 190 mm below it. Source dimensions S001/S002 in `docs/layout_design/Thach_Bi_Church_Dimensions.xlsx`, printed section sheet 4. Wing/veranda route follows actual source roof triangles 180 mm below the surface in a proposed removable finish-matched cover. | Actual roof build-up, waterproofing and accessible containment. Wing ridge +9.45 m is a model proxy; dimension/open-item records P212, ISSUE-C02, RFI-S05/S08 remain unresolved. No implied roof-slab chase. |
| Service room | Horizontal runs moved above the ceiling's +4.270 m top to +4.330 m. Wall riser avoids the crucifix niche. | Ceiling penetration, fire stopping, panel entry and access details. |
| Sanctuary chamber | Same outer enclosure/visible faces, X 44.49–48.42 m and absolute Z 3.30–3.75 m. Two 40 mm visualization skins reserve a cavity at absolute Z 3.34–3.71 m; feeds occupy its centre at 3.525 m. Explicitly `CONCEPT`, unapproved. | Skin/backing thickness, removable panels, fire performance, entry points, structural coordination and cable segregation. The 40 mm value is not a timber specification. |
| Microphones | Separate AV-1 home runs, minimum sampled floor elevation minus 120 mm, then a local furniture rise. Metres, shared world coordinates. | Floor build-up, floorbox and removable furniture passage. The 120 mm offset is a routing-study allowance, not an approved embedment depth. |
| Towers | Solid front/side corner lanes, stage returns and local leads. Dome-front feeds traverse at +29.030 m behind the cornice finish. | Dome/belfry cornice service cavities are `REVIEW REQUIRED`; current trim geometry does not provide a designed cavity or access. |

The ambo key light `L100` already contacts the axis-9 capital at its canopy. Its optical position is preserved, and its route ends at a proposed entry within the actual lamp-body envelope instead of running through the abacus. The route exports that explicit termination and marks the mounting conflict `REVIEW REQUIRED`. This is not a resolved mounting design.

Removable covers use a 52 mm visualization diameter and finish matching. They are containment proposals attached to route metadata (`coverPaths`), not added equipment or a purchasing quantity. They are merged by finish for drawing, while stable route IDs remain individually selectable. No installed containment length, cable capacity or compliance is inferred from these proxies.

Independent checks in `scripts/verify_concealed_routes.cjs` use the actual timber/roof/lining geometry, verify local microphone moves and restoration, and reject the former exposed spans. See the [review record](../../review/concealed-wiring-2026-10-07/README.md) for screenshots, register reconciliation and remaining holds. Visual concealment is checked against the as-drawn frame; the alternative reference frame is not a second coordinated installation design.

This is a routing proposal based on the current visualization geometry. It has not been verified against construction details, wall reinforcement or an electrical survey. Some model wall thicknesses and roof details are themselves unconfirmed. The layer models routes rather than individual live, neutral and protective-earth conductors. Wire colours identify systems; they are not conductor insulation colours.

## Flat schedules and exports

The Wiring panel includes a clickable top projection, functional circuit blocks and grouped quantities by product category, circuit and specification. Click a category to edit its first example; use the run list for each individual component. DB-1's schedule includes equipment controlled by LC-1, FC-1 and AV-1.

- [Systems JSON](electrical-systems.json): enclosure locations, every route's 3D vertices and length, individual component records, grouped bill of materials, and unresolved specifications.
- [Schedule CSV](electrical-schedule.csv): individual component IDs, quantities, circuit/board allocation, model dimensions, category specs, provisional loads, hidden alternatives and route records.
- [Category Excel registers](categories/README.md): equipment/enclosure IDs, positions/specifications, electrical-line IDs/lengths/specifications and route points in matching files by usage; see the [register workflow](register.md) and [summary report](summary-report.md).
- [Matching layout JSON](equipment-layout.json): complete simulator item positions/settings for reconciliation and layout import.
- **Export systems JSON** and **Export schedule CSV** in the viewer regenerate from the current edited layout. The JSON contains the complete design. The CSV respects all current review filters for route rows; component rows contain all equipment for the selected board, including hidden alternatives. It is a mixed-scope legacy export, not an isolated-layer bill of materials.

Component dimensions describe the procedural model's local envelope, excluding pendant rods. These are not manufacturer dimensions. Passive loudspeaker wattages are audio ratings, not electrical mains demand. Powered decorations with no known electrical rating report their load as pending.

Route lengths are centreline geometry lengths. They exclude spare, termination lengths, slack and installation allowances. For audio drops the full home-run length includes the upstream bundle distance. Do not add bundle lengths again to those full home-run lengths. The existing simulator's energy-panel cable comparison remains its older rough estimate; the wiring exports contain the geometry-derived lengths.

Conductor types and cross-sections, conduit sizes, supply phases, earthing/bonding, protective devices, amplifier configuration, product dimensions and enclosure capacities remain **pending electrical design**. The flat schedule is ready for those inputs; it is not a fabrication drawing or an approved single-line diagram.

## Verification

`node scripts/verify_simulator.cjs --electrical` checks unique selection identities, every installed equipment connection, endpoint continuity, connection to shared trunks, physical board ray picking, separate active-speaker power/signal, dynamic rerouting and removal, and reversible architectural isolation. The full simulator checks include these assertions alongside the existing lighting, acoustic, airflow, placement and history checks.

Regenerate the saved layout/systems JSON and CSV in `docs/electrical-grid/` with `node scripts/verify_simulator.cjs --electrical --export-electrical`, then refresh Excel with `node scripts/build_equipment_register.mjs --verify-workflow`. These defaults reflect the recommended design; follow the [register workflow](register.md) for browser-specific saved edits.

## Local engineering review layers · 8 October 2026

In the **local `OPEN_CHURCH.html` viewer**, choose **Simulator → Wiring → Review layers**, then a discipline and **Systems only**. Lights, sound/microphones, fans/ventilation, exit signs, powered decoration and distribution are separate choices. Select a circuit to review its equipment, or choose an equipment row to trace only that item. **Restore building** restores the ordinary equipment visibility; **Clear review filters** restores the complete routing view. These are viewing operations, not switch commands or physical concealment.

The same equipment, route and enclosure IDs drive the 2D plan, 3D bodies, route list and displayed bill of materials. Upstream supplies are retained: DB-2 circuits and the board-only DB-2 view include the DB-1 → DB-2 feeder with both endpoint enclosures; LC-1/FC-1/AV-1 connections include their DB-1 supply. A selected device retains its shared trunk as context without showing all sibling equipment. An active loudspeaker retains both its signal and mains routes. Shared context does not duplicate quantities or imply that a trunk length equals an installed cable quantity.

Select a route to inspect its geometric length, source, circuit, height range and X/Y/Z vertex table. Source coordinates are retained in exports; displayed three-decimal coordinates are not survey accuracy. Audio home-run length remains the branch plus its own upstream path, not the entire group bundle. **Controls · circuit** opens the matching existing simulator controls without switching any load. Physical channels, terminals, protection, final cables and product interfaces remain pending; the schematic boards are not installation drawings.

These filters do not change equipment IDs, positions, on/off settings, analytical samples, route vertices or the complete JSON export. CSV route rows reflect the view as described above. Their state is session-only. Existing category workbooks and generated route schedules remain unchanged. The previous public/private web architectural viewer does not implement these tools and contains stale legacy chandelier geometry; use the local model for this review. See [verification and limitations](../../review/local-engineering-review-2026-10-08/layers.md).
