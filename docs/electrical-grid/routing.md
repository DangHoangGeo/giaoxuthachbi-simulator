# Electrical routing study

> **25 October door-head/sign follow-up:** removal of the fourteen nave sconces retires fourteen LD drops and two trunks. Five E1 sign drops keep their IDs and now follow jambs and fixed door heads below coloured glazing (`door-head` method), rather than dropping across a fanlight. Connected components 386 → 372; routes 445 → 429. Frame containment, fixings and life-safety design remain held. [Coordinated record](../engineering/doorheads-and-sconces.md).

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

## Connection inspector and review snapshots · 9 October 2026

Selecting an equipment row opens its connection inspector above the layer filters. Each drop/local connection lists its upstream supply feeders, shared trunk context and individual branch with stable route links. Audio and microphone branches are labeled as signals, separately from the AV rack's mains supply (microphone arrows point back toward the rack; geometric route coordinates start at the rack); an active loudspeaker has separate mains and signal entries. Clicking a route promotes its details to the top. Filter changes clear a selected route if it is no longer in view. Physical control channels, cables and protection remain explicitly pending.

**Fit review / Fit connected routes** frames all route vertices in the current review; **Show route** frames the whole selected run instead of one middle vertex. Camera placement uses a sphere containing the route and related source-enclosure bounding box, the smaller camera field of view and reserved space for desktop panels. This is display geometry, not a route redesign, installation clearance or concealment proof. Source coordinates and analysis remain unchanged.

**Export this review** downloads `thach-bi-electrical-review.json`, a separate, labeled design-development snapshot: current filters, selected equipment/route/source IDs, their matching component records, source enclosures and route vertices/specification holds. Shared trunks are included as context without adding sibling equipment. Route length is not installed cable quantity, and no new cable allowance or physical hardware specification is inferred. The full systems JSON and legacy schedule CSV remain available with the scopes described above. Do not import this filtered review as a complete simulator layout or use it to replace the category registers.

[Verification, screenshots and example snapshot](../../review/electrical-review-navigation-2026-10-09/README.md) record the source revision and preservation checks. Existing matched workbook quantities and engineering holds remain unchanged.

## Paper drawings and installation review

See the [reusable Python drawing workflow](print-drawings.md) for scaled A3 plans, height projections and companion route vertices. The local Wiring tab adds a read-only nine-stage 3D walkthrough. It filters existing geometry and keeps electrical settings unchanged. Pending wing changes require fresh calculation, routes and register reconciliation before a new issue.


## Historical four-fixture wing route revision · 9 October 2026

The following quantities and arrangement describe the earlier comparison. The two-light/saints-clearance revision below supersedes them in the current model and exports.

The [wing review](../engineering/wing-review.md) retains L63–L70 and replaces their wall-projector routing with pendant feeds to smaller chandelier concepts. F240–F243 change from roof-mounted F1 fans to wall-mounted F5 concepts; four additional F-WING IDs complete the eight-fan comparison. The six previously hidden F2 nave wall-fan concepts are now shown, adding their route context while keeping them OFF in built-in modes. Source enclosures and DB-1/DB-2 feeder topology are unchanged; F5 is supplied through FC-1.

That earlier export had 296 connected components, 343 routes and 2,775 ordered vertices. Four former roof-fan drop paths remain Retired in the registers, with their 12 vertices; stable equipment IDs retain all entered fields. New/changed route lengths are model polylines, not installed cable orders. Fan oscillation, source-product clearances, structural anchors, service access, containment capacity/separation, fire stopping, physical controls and cable/protection sizing remain on hold. The 2D printable and 3D review views do not establish buildability.

## Wing downlights · 1 November 2026

L63/L65/L67/L69 and their four `drop:LC1:L8:light:-1:L…` routes are Retired in the lighting register (IDs never reused). Eight downlights `L-WING-B-FI/FO/RI/RO` and `L-WING-H-FI/FO/RI/RO` take their place on L8 with new `drop:LC1:L8:light:-1:L-WING-…` routes and the two L8 trunks, same DB-1 origin and concealed roof/soffit approach, each ending at the roof-timber canopy. Route lengths are model polylines, not cable orders. Current totals: 419 equipment/enclosure records, 433 routes, 3,169 vertices (37 equipment, 120 routes retired). See [lighting.md](../systems/lighting.md#nave-centre-and-wing-lighting--1-november-2026).

## Two-light / saints-clearance wing revision · 9 October 2026

The [current coordinated wing review](../engineering/wing-review.md) supersedes the earlier four-chandelier/four-fan arrangement. L63/L65/L67/L69 connect to L8, F240–F243 (`fanWingWall` extended-bracket proxy) to F5 via FC-1/DB-1, and S276/S278 to A1/AV-1. The two speakers face −X and are raised to Y4.85 for sampled fan/return-wall clearance. Retired light/fan/speaker IDs remain in registers, with no current route endpoints. Four new Peter/Paul pictures are unpowered DECOR records; they have no power or signal routes. The matched export contains 296 wired components, 343 routes and 2,779 ordered vertices (including individual DB-1 → FC-1 → F2 drops for the sixteen [nave wall fans](../engineering/nave-wall-fans.md)); 10 retired equipment IDs and 14 retired routes stay in the registers. Exact source geometry and lengths come from the matched generated schedules; route length still excludes installed allowance. Physical cables, protection, channels, support/maintenance/concealment and supply remain held.

Saved browser layouts may retain earlier equipment. Wiring now displays separate live lights/fans, sound and art comparisons, obsolete IDs and scoped backup/Undo actions. Migration history alone is not current-layout evidence. The all-hidden requirement is still unmet by exposed equipment; route graphics do not certify any installation.

## Socket outlets and façade statue light · 9 October 2026

The [coordinated record](../engineering/outlets-and-facade-statues.md) owns positions, reasons, alternatives, conditional voltage-drop comparisons and holds. The matched export has **317 wired components, 370 routes and 2,928 ordered vertices**; no existing route ID, vertex or equipment position changed.

- **Indoor outlets, P1 (side B) and P2 (side H).** New route kind `power`, drawn teal. Source DB-1 directly, not LC-1 or FC-1. Each trunk uses the existing side-wall band and the covered wing-roof crossing, at its own band height (+6.108 and +6.116 m). The sanctuary outlet on the axis-10 pier connects down that pier line (X 44.175) instead of from the roof crossing beside it; the mid-nave outlet drops in the masonry wall at X 22.830. Method `side-wall`. No chase into a structural pier is implied: box and conduit details are pending.
- **Tower event points, P3 and P4.** New method `underfloor-event`: from DB-2 down to 0.12 m below the entrance-hall floor and the tower plinth top, along the inside of the façade wall to the tower's inner flank wall line (Z ±7.70), then up inside its solid front pier to the cabinet. 9.870 m to tower B and 16.470 m to tower H. The 0.12 m depth is a routing-study allowance, as for the microphone runs. Duct size, depth, draw pits, water sealing, separation and the passage under the main-door threshold are pending. The route is used only for an outlet on a DB-2 circuit at a tower base; an outlet placed elsewhere takes the ordinary wall routing.
- **Façade statue light, L10.** Fifteen drops from two DB-2 trunks (12.1 and 18.7 m) by the existing `entrance-wall` method: entrance band at +7.65 m, then inside the wall to the height of the niche and through to the fitting. Home runs are 17.9 to 32.5 m. The passage through the façade wall into each niche, the slots for the hidden light lines, driver positions and weather sealing are not designed. The central shrine rises above the +12.5 m wall of the analysis model; its masonry is assumed solid at the route.
- **Review layers.** *Socket outlets* is a new system choice in **Wiring → Review layers**. The nine-stage walkthrough is unchanged: outlets appear in its all-system steps.

The three façade statues are unpowered decoration records without routes.

## Exit signs from DB-1 and the walk-round review · 9 October 2026

The [walk-round safety and efficiency review](safety-efficiency-review.md) found the five exit signs routed from LC-1 like ordinary lighting. A life-safety function should not depend on the lighting and scene-control enclosure, so the E1 trunks and drops now start at DB-1 (`trunk:DB1:E1:light:±1`, five `drop:DB1:E1:…`). They follow the same wall bands; the sign positions and the 15 W group are unchanged. Drawn E1 length is 145.936 m (was 147.736 m). The seven earlier route IDs are retired in the exit-signs register. Protection, the emergency supply, its duration and emergency escape lighting remain undesigned (Q14).

The same review measured route sharing from the model centre lines: 632 m of the 720 m of loudspeaker route lies within 0.30 m of a mains route (262 m on the same line), because the loudspeaker trunks follow the wall bands of the lighting trunks and the DB-2 feeder, while the microphone lines keep their own under-floor route (0.46 m of 24.0 m within 0.30 m). About 987 m of mains route lies on timber beam tops, the boarded roof lining or the chamber lining. Compartments, separation, containment and fire performance for these shared and timber routes are open (Q05, Q09, Q48). No route other than E1 was changed.

## Loudspeaker separation · routing revision `2026-10-18-concealed-2` · 18 October 2026

The walk-round review found 632 m of the 720 m of loudspeaker route within 0.30 m of a mains route. Two causes were in the route generator (`Thach_Bi_Viewer/simulator/electrical.js`), not in the design intent:

- **Band heights.** Every band was stepped up by 8 mm per position of its circuit in the circuit list. Loudspeaker circuits come late in that list, so their bands sat at +5.694 to +5.726 m, only 0.17–0.21 m below the lighting bands (+5.900 m and up). Loudspeaker bands now step **down** from +5.550 m (A1 +5.550, A2 +5.542, A3 +5.534, A4 +5.526, A5 +5.518 m); mains bands are unchanged. Along the walls the two systems are now at least 0.35 m apart. The side-wall openings top out at +4.31 m, so the lower bands keep 1.2 m above them.
- **Service-room riser.** Loudspeaker home runs left AV-1, crossed to the B side of the niche and rose on the same line as the mains risers and the DB-1 → DB-2 feeder (X 48.735, Z −2.24, then the rear wall at Z −3.30). They now rise on the H side (Z +2.24, rear wall at Z +3.30) and cross the mains riser once at the rear wall, at right angles. The niche clearance and the +4.33 m line above the service-room ceiling are unchanged.

Result, sampled every 0.25 m from the exported centre lines by the [safety review](safety-efficiency-review.md): **254 m of 700 m** within 0.30 m of mains (was 632 m of 720 m) and 188 m on the same line (was 262 m). Of the remainder, 80 m is the covered raceway over the open 9–10 wing bay, which every wall-band trunk follows on one line, and most of the rest is where drops of nearby fittings cross the band or share a pier, the courtyard horns on the tower walls and the entrance band. These need a segregated compartment or separate containment and right-angle crossings in the installation design (Q48); the route centre lines cannot show that.

34 routes changed: 8 loudspeaker trunks and 26 loudspeaker drops. No equipment, route ID, circuit or mains route moved; the vertex count stays 2,928. Drawn route length 5,008.066 → 4,987.773 m; complete loudspeaker home runs 1,790.080 → 1,716.603 m; shared bundle paths 583.921 → 562.897 m. Equipment positions and analysis inputs are unchanged, so no lighting, sound or air result changes. The registers were refreshed by the workflow: entered fields and retired IDs are kept. `verify_concealed_routes.cjs` passes on the new paths. The A3 drawings and `output/electrical-review/` were already stale (they predate the socket outlets) and now also predate this revision.

### Options calculated, not adopted

Comparison screens with the review's method and case S1 (230 V, PF 0.9, `ΔU ≤ 2 I (R + X) L`, R = 23.7/S Ω/km, X = 0.08 Ω/km). Each changes building work that is not designed, so each is a decision for the electrical engineer and the parish, not a model change.

| Option | Model basis | Effect | Cost and holds |
| --- | --- | --- | --- |
| P1/P2 socket radials in a floor duct along the inside of each side wall, instead of up to the +6.1 m band and over the wing-bay roof at +9.3 m | DB-1 down to 0.12 m below the floor, east of the microphone risers (X 49.75), across to Z ±7.0, west to each outlet, rise in the wall or the axis-10 pier line. About 36 m (B) and 40 m (H) to the mid-nave outlets, against 54.1 and 60.7 m | Drop at 2.5 mm² with 16 A at the far outlet: about 4.8 % and 5.3 % (now 7.2 % and 8.1 %); still above the 4 % screen, so 4 mm² would still be needed. Loop allowance for a C16 at 2.5 mm²: about 0.6 Ω (now 0.21 Ω). Takes two 16 A circuits out of the bunched wall band and off the timber-lined wing-bay roof | Floor build-up, duct, wet cleaning, passage under the service-room and sanctuary walls: the same holds that led to the wall route on 9 October ([record](../engineering/outlets-and-facade-statues.md)). Q44 |
| DB-1 → DB-2 feeder in a floor duct along the nave instead of the side-B wall band, the wing-bay raceway and the entrance riser | About 50–56 m against 80.7 m (plan distance 46.2 m plus rises and the turn to DB-2) | All feeder drops fall by about a third: three phases with events at 25 mm², 1.5 % → about 1.0 %. Takes the heaviest cable out of the shared wall band and off the timber-lined raceway | Same floor holds, a draw pit at each end, and separation from the microphone home runs at the sanctuary. Q42 |

The third option first calculated here, splitting V1, was adopted on 18 October 2026: see the next section.

## Exhaust ventilation in three circuits · 18 October 2026

The [safety review](safety-efficiency-review.md) (finding 9) found all nine exhaust fans on V1: 1,530 W connected and an 86.0 m path from FC-1, at 74 % of a 10 A comparison breaker in case S1 and needing 10 mm² in S2. They are now three circuits from FC-1:

| Circuit | Fans | Connected | Longest path | Comparison screen, S1 and S2 |
| --- | --- | ---: | ---: | --- |
| V1 · Exhaust · front gable | F252–F255 | 680 W | 86.0 m | 6 A, 2.5 mm² |
| V2 · Exhaust · wing gables | F256–F259 | 680 W | 45.3 m | 6 A, 2.5 mm² |
| V3 · Exhaust · service room | F260 | 170 W | 26.7 m | 6 A, 2.5 mm² |

V1 keeps its ID and its two trunks, which keep their paths and now serve only the front gable. V2 and V3 are appended to the circuit list, so no existing band height moves; their bands are at +6.148 and +6.156 m, above the highest earlier mains band (L10, +6.140 m). New routes: `trunk:FC1:V2:fan:-1` (31.714 m), `trunk:FC1:V2:fan:1` (38.314 m) and `trunk:FC1:V3:fan:-1` (16.407 m). The five drops of F256–F260 are re-issued under V2/V3 with the same lengths (F260 10.320 m, was 10.200 m) and their five `drop:FC1:V1:…` IDs are retired in the air-system register. Routes 370 → 373; vertices 2,928 → 2,964; drawn route length 4,987.773 → 5,074.327 m, all of it the fan category (826.041 → 912.595 m): the wing-gable and service-room cables no longer share the V1 trunk, so the drawn length rises by the length of their new trunks. Loudspeaker home runs and shared bundle paths are unchanged.

Equipment positions, speeds and every quick-mode value are unchanged (each mode gives V2 and V3 the value of V1), so no lighting, sound or air result changes. Saved layouts change once through `exhaustSplitRevision`; see [controls](controls.md#exhaust-ventilation-by-zone--18-october-2026). FC-1 channels, speed controls, protection and cables are not designed. The A3 drawings and `output/electrical-review/` remain stale.

## Beam-face reading lights, tower ledge fittings and corner speakers · 19 October 2026

The [hidden-fittings revision](../engineering/hidden-fittings.md) moves 100 fittings without changing circuits, boards or IDs.

- **Reading lights (L1, L2).** Each head is now fixed by a side bracket to the sanctuary face of its tie or side beam (`anchorY` still names the beam soffit, so the route is recognised as a beam feed). The lead still runs over the beam, then drops down that face inside the finish-matched removable cover to the bracket plate, square to the face. `verify_concealed_routes.cjs` accepts that terminal contact with the beam face, as it already accepted an uplight touching the top of its beam; any other contact with a timber core still fails.
- **Towers.** The ledge fittings keep the stepped riser routes in the solid tower corners. The dome washes now stand on the top cornice at +29.09 m, so the cap routing (behind the top cornice at +29.03 m) applies to fittings above +29.0 m (was +29.09 m).
- **Loudspeakers (A1).** The wall columns move 0.43 m along the wall to the pier corners; their home runs keep the separated band of 18 October.

Totals after the change: 373 routes, 2 936 vertices; lighting route segments 3 016.6 m (3 046.9 m before), loudspeaker full home runs 1 719.6 m (1 716.6 m). Safety-review screens: L6 at 76 % of its comparison breaker (74 %), fixed equipment 9 285 W (9 262 W) with the brighter dome washes.

## Fan hangers on the column-line beams · 19 October 2026

The 12 side-aisle ceiling fans now hang under the column-line beams ([record](../engineering/fans-on-column-beams.md)). Their F1 leads use the new method `beam-hanger`: over the nave lining to a point 0.95 m from mid-span (clear of the gilded cartouche), down the beam's outer face in the removable finish-matched cover, under the soffit to the hanger and inside the downrod. `verify_concealed_routes.cjs` checks that the run beside and under the beam is covered, that no timber core is crossed and that the lead enters the downrod just under its beam; the safety review counts these routes as cable on timber. Totals: 373 routes, 2 960 vertices, fans and ventilation 925.2 m of route (912.6 m before).

## Open-porch issue · 25 October 2026

The [coordinated review](../engineering/open-porch-light-sound.md) adds 36 L4 arch floods and 14 A2 fills, replaces 18 L4 pendant geometries with wall path heads, replaces four A2 pendants with wall fills and lowers fourteen nave/entrance speakers. Stable existing IDs, boards and circuits remain. Default connected components increase 336 → 386; routes 395 → 445. Inner-wall drops use existing separated wall bands. Exterior arch leads follow the outer-column route above the porch roof lining and down the column line to their wall plates; no new ground crossings are proposed. These are routing proxies. Weatherproof entries, segregated mains/audio containment, covers, structural chases, access and installation approval remain held. The category registers and JSON/CSV exports own the current lengths. Earlier A3 drawings and `output/electrical-review/` remain stale.
