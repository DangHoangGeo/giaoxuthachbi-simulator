# Electrical routing study

Open `Thach_Bi_Viewer/OPEN_CHURCH.html` and choose **Simulator → Wiring → Systems only**. The building, roof, furnishings and grounds disappear; boards, wiring and connected equipment remain. **Restore building** restores the architectural visibility, including the previous roof state. **View settings → Electrical systems only** offers the same isolation switch.

Select a physical enclosure or wire in 3D, a route in the flat plan, or an individual run in the list. The selected route highlights green and reports its source, destination, circuit, length and height range. **Edit component** opens the existing fixture controls. Changes to location, product parameters, circuit, visibility, additions, removal, undo and imported layouts regenerate the wiring. Overlapping runs remain individually selectable through the run list. Filters select DB-1, DB-2, power or audio routes.

The initial recommended design has **274 connected components and 317 selectable runs**. Counts reflect the current layout; hidden alternatives are excluded from installed-study totals and retained separately in the exported component schedule. Lights switched off are still connected. Non-electrical furnishings and candles are excluded. Electrically illuminated seasonal models are retained as equipment when shown.

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

Main side-wall bands follow the modeled ±7.360 m wall centres above the door and window openings. Drops shift to solid piers beside openings. At the 9–10 wings, routes follow the outer gable and returns; connections across the open veranda portion require proposed ceiling containment. Entrance routes cross above the main door. Tower runs change position at the modeled stage ledges. Suspended fittings use beam/column routes or follow the pitched lining to their anchors. Portable floor equipment uses proposed underfloor conduit and a local flexible termination. Roof decoration feeds finish at the modeled component anchor; string entry-point and connector details are pending product selection.

Audio and microphone connections originate at AV-1. Their trunks represent bundles of individual home runs, not speakers connected directly to a mains breaker or an assumed speaker bus. Active speaker types receive a separate DB-1 power connection as well as signal. The actual amplifier outputs, speaker impedance, line voltage, signal connectors and channel allocation remain to be designed.

This is a routing proposal based on the current visualization geometry. It has not been verified against construction details, wall reinforcement or an electrical survey. Some model wall thicknesses and roof details are themselves unconfirmed. The layer models routes rather than individual live, neutral and protective-earth conductors. Wire colours identify systems; they are not conductor insulation colours.

## Flat schedules and exports

The Wiring panel includes a clickable top projection, functional circuit blocks and grouped quantities by product category, circuit and specification. Click a category to edit its first example; use the run list for each individual component. DB-1's schedule includes equipment controlled by LC-1, FC-1 and AV-1.

- [Systems JSON](electrical-systems.json): enclosure locations, every route's 3D vertices and length, individual component records, grouped bill of materials, and unresolved specifications.
- [Schedule CSV](electrical-schedule.csv): individual component IDs, quantities, circuit/board allocation, model dimensions, category specs, provisional loads, hidden alternatives and route records.
- **Export systems JSON** and **Export board schedule CSV** in the viewer regenerate from the current edited layout. The CSV respects the selected board and cable-type filters for route rows; component rows cover the selected board.

Component dimensions describe the procedural model's local envelope, excluding pendant rods. These are not manufacturer dimensions. Passive loudspeaker wattages are audio ratings, not electrical mains demand. Powered decorations with no known electrical rating report their load as pending.

Route lengths are centreline geometry lengths. They exclude spare, termination lengths, slack and installation allowances. For audio drops the full home-run length includes the upstream bundle distance. Do not add bundle lengths again to those full home-run lengths. The existing simulator's energy-panel cable comparison remains its older rough estimate; the wiring exports contain the geometry-derived lengths.

Conductor types and cross-sections, conduit sizes, supply phases, earthing/bonding, protective devices, amplifier configuration, product dimensions and enclosure capacities remain **pending electrical design**. The flat schedule is ready for those inputs; it is not a fabrication drawing or an approved single-line diagram.

## Verification

`node scripts/verify_simulator.cjs --electrical` checks unique selection identities, every installed equipment connection, endpoint continuity, connection to shared trunks, physical board ray picking, separate active-speaker power/signal, dynamic rerouting and removal, and reversible architectural isolation. The full simulator checks include these assertions alongside the existing lighting, acoustic, airflow, placement and history checks.

Regenerate the saved JSON/CSV with `node scripts/verify_simulator.cjs --electrical --export-electrical`. The saved documents reflect the recommended default design, not any browser-specific saved edits.
