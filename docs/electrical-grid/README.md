# Electrical grid and controls

## Main goal

First optimize light, loudspeaker, microphone and fan positions and settings together. Develop matching **2D and 3D electrical route maps**, then a coordinated **main/sub-board design with manual controls for each controllable part and quick operating modes** matching the web app's intended behavior.

This folder is the home for that work:

- [Routing study and map behavior](routing.md)
- [Manual boards and quick-mode design brief](controls.md)
- [Separate equipment and line Excel registers by usage category](categories/README.md)
- [Total quantities, usage and quality report](summary-report.md)
- [How to inspect the systems in the 3D model: simple guide for the priest and local engineer](../electrical-inspection-guide.md) ([tiếng Việt](../electrical-inspection-guide.vi.md))
- [Socket outlets, façade statues and their light: positions, basis and holds](../engineering/outlets-and-facade-statues.md)
- [Register fields, refresh and Excel position proposals](register.md)
- [Conditional route-load/cable review and confirmation questions](cable-load-review.md)
- [Walk-round safety and efficiency review: zones, circuit screens, supply scenarios and energy](safety-efficiency-review.md)
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

The local offline HTML viewer implements selectable 2D/3D routes, circuit and item controls, DB-1/DB-2 board views, the DB-2 feeder, fan speed controls, sound-zone level/mute controls and quick scenes. Since 11 October 2026 **Discover → Technical tours → Wiring** plays a tour of under two minutes through the boards and the wiring-only view, one system at a time ([guide](../simulator/guide.md#technical-tours--11-october-2026)); it is a presentation of this routing study and changes nothing in it. Its Wiring tab now filters by discipline, circuit, board or individual equipment and retains the related upstream feeds; see the [local review workflow](routing.md#local-engineering-review-layers--8-october-2026). The hosted architectural GLB preview does not contain this simulator or its controls. The physical board faces are schematic. Final wiring, switching hardware, control addresses, enclosure layouts and protective-device design are still pending; see [controls](controls.md).

Exports regenerated on **9 October 2026** for the [socket-outlet and façade-statue issue](../engineering/outlets-and-facade-statues.md): **317 connected components, 370 selectable routes and 2,928 vertices**. The preceding `7216da8` snapshot ([eight-per-side nave fan review](../engineering/nave-wall-fans.md), retaining the [held wing review](../engineering/wing-review.md)) had 296 components, 343 routes and 2,779 vertices; `614222c` had 286, 333 and 2,749. The routing revision remains `2026-10-07-concealed-1`; it names the route method, not the latest equipment issue. Feeds follow wall bands, roof lining/covered soffits and beam tops; microphones return below the floor. See the [routing basis and installation holds](routing.md#concealment-revision-7-october-2026). Saved browser edits form a separate configuration.

The six category registers include **359 current equipment/enclosure records** (354 simulator items plus five enclosures), including hidden alternatives and non-electrical furnishings. Socket outlets and their P1–P4 routes are owned by distribution-controls. Ten retired equipment IDs, 21 retired routes and 100 retired vertices remain preserved; seven of those routes are the earlier LC-1 origins of the E1 exit-sign routes, which leave DB-1 directly since the [walk-round review](safety-efficiency-review.md) of 9 October 2026 (same 370 routes and 2,928 vertices; drawn length 5,008.066 m). Every file has matching Equipment, Electrical Lines and Route Points sheets plus Read me. Keep them and the [summary](summary-report.md) coordinated using the [register workflow](register.md).


Run from the repository root:

```sh
node scripts/verify_simulator.cjs --electrical --export-electrical
node scripts/build_equipment_register.mjs --verify-workflow
python3 scripts/build_electrical_safety_review.py
python3 scripts/build_electrical_safety_review.py --check
```

The first command checks the implemented electrical route layer and writes layout JSON, systems JSON and the CSV into this folder. The second refreshes all six category workbooks and the summary while preserving engineering-input values by ID. The third command rebuilds the [safety and efficiency review](safety-efficiency-review.md) and its evidence from the same model (Python 3 standard library only); `--check` recomputes it and fails when the saved result no longer matches the model. These checks do not verify every control interaction or certify installation design. Keep physical-control addresses, final cable sizes, protection and product selections pending until designed and checked. Update this baseline note when regenerating from a changed design.

## Printable review set and 3D installation planning

The [Python export workflow](print-drawings.md) builds matched English and Vietnamese A3 circuit plans, height projections, coordinates and a unique route index from a fresh default-model snapshot. **Simulator → Wiring → Start 3D walkthrough** provides the matching nine-stage review with explicit holds. The current paper set includes the held wing redesign but **predates the socket outlets, circuit L10 and the façade statues: it is stale for those items** and was not rebuilt (ReportLab is not installed on the machine used, and the new names need Vietnamese drawing labels). The same applies to the load/budget outputs below. The [separate Python load/budget workflow](cable-load-review.md) adds all-route conditional calculations, quantity CSVs and two Vietnamese reports. It checks existing register hashes and does not overwrite approved/input fields. All outputs are design-development aids; none are approved to purchase or build.
