# Electrical grid and controls

## Main goal

First optimize light, loudspeaker, microphone and fan positions and settings together. Develop matching **2D and 3D electrical route maps**, then a coordinated **main/sub-board design with manual controls for each controllable part and quick operating modes** matching the web app's intended behavior.

This folder is the home for that work:

- [Routing study and map behavior](routing.md)
- [Manual boards and quick-mode design brief](controls.md)
- [Separate equipment and line Excel registers by usage category](categories/README.md)
- [Total quantities, usage and quality report](summary-report.md)
- [Register fields, refresh and Excel position proposals](register.md)
- [Conditional route-load/cable review and confirmation questions](cable-load-review.md)
- [Japanese supplier shortlist and separate budget review](../budget/README.md)
- [Matching simulator layout JSON](equipment-layout.json)
- [Systems JSON: sources, routes, equipment and quantities](electrical-systems.json)
- [Board/component and route schedule CSV](electrical-schedule.csv)
- [Simulator methods and limitations](../simulator/methods-and-limitations.md)
- [Lighting](../systems/lighting.md), [sound](../systems/sound.md), [fans and ventilation](../systems/fans.md)

## Delivery order

| Stage | Reviewable output |
| --- | --- |
| 1. Optimize positions | Versioned equipment layout with mounting/aiming, seat and zone results, trade-offs, remaining shortfalls and selected-product inputs still needed. |
| 2. Coordinate routes | The same equipment and route IDs in plan, 3D and schedules; board/feed origin, endpoints, elevations, power/signal distinction, lengths and unresolved penetrations/supports. |
| 3. Design control boards | Main/sub-board functional diagram, physical control-face proposal, item-to-control schedule, circuit/zone labels and per-item or agreed group operation. |
| 4. Define quick modes | One scene/control matrix covering physical buttons and web controls, manual overrides, unavailable supply and restart behavior. |
| 5. Verify and hand over | Reconciled maps/schedules, simulator checks, coordinated engineer review, mock-up and commissioning plan, then installation/operating documentation at its approved status. |

Route feasibility can require another placement iteration. Preserve lighting, intelligibility, comfort, safe access and maintenance before optimizing cable length or cost.

## Current implementation and export baseline

The local offline HTML viewer implements selectable 2D/3D routes, circuit and item controls, DB-1/DB-2 board views, the DB-2 feeder, fan speed controls, sound-zone level/mute controls and quick scenes. Its Wiring tab now filters by discipline, circuit, board or individual equipment and retains the related upstream feeds; see the [local review workflow](routing.md#local-engineering-review-layers--8-october-2026). The hosted architectural GLB preview does not contain this simulator or its controls. The physical board faces are schematic. Final wiring, switching hardware, control addresses, enclosure layouts and protective-device design are still pending; see [controls](controls.md).

Exports regenerated on **9 October 2026** from the [held wing review](../engineering/wing-review.md): **296 connected components, 343 selectable routes and 2,775 vertices**. The routing revision identifier remains `2026-10-07-concealed-1`; it names the routing method, not the latest equipment issue. Feeds follow wall bands, roof lining/covered soffits and beam tops; microphones return below the floor. The preceding 7 October baseline had 286 components/329 routes. See the [routing basis and installation holds](routing.md#concealment-revision-7-october-2026) and [review record](../../review/concealed-wiring-2026-10-07/README.md). A browser's saved edits form a different configuration and must be exported separately.

The six category registers include **331 equipment/enclosure records** (all 326 simulator items plus five enclosures), including hidden alternatives and non-electrical furnishings. Every file has matching Equipment, Electrical Lines and Route Points sheets plus Read me. Together they manage specifications, positions, IDs and control mapping without duplicate ownership. Keep them and the [summary report](summary-report.md) coordinated using the [register workflow](register.md).

Run from the repository root:

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
```

The first command checks the implemented electrical route layer and writes layout JSON, systems JSON and the CSV into this folder. The second refreshes all six category workbooks and the summary while preserving engineering-input values by ID. These checks do not verify every control interaction or certify installation design. Keep physical-control addresses, final cable sizes, protection and product selections pending until designed and checked. Update this baseline note when regenerating from a changed design.

## Printable review set and 3D installation planning

The [Python export workflow](print-drawings.md) builds matched English and Vietnamese A3 circuit plans, height projections, coordinates and a unique route index from a fresh default-model snapshot. **Simulator → Wiring → Start 3D walkthrough** provides the matching nine-stage review with explicit holds. The current paper set includes the held wing redesign. The [separate Python load/budget workflow](cable-load-review.md) adds all-route conditional calculations, quantity CSVs and two Vietnamese reports. It checks existing register hashes and does not overwrite approved/input fields. All outputs are design-development aids; none are approved to purchase or build.
