# Timber finish on doors, windows and pews · 20 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The viewer uses two photographed grains for its red-brown door timber, muted umber shutter and frame timber, and walnut-brown pew finish. Rail, seat and bench-back grain runs along the board. The door and shutter panels run vertically. The original carving profiles and the geometry of the openings and seating are retained. [Finish decision](../../docs/decoration-finishes.md#timber-finish-on-doors-windows-and-pews--20-november-2026) · [Texture sources and CC0 credits](../../Thach_Bi_Viewer/references/materials/provenance.json)

[Before and after](before-after.jpg) · [Day and evening](day-evening.jpg)

The captures used desktop Chrome at 1360 × 820 and 1× scale. The before views use `74f84be`. Both revisions use the same camera and scene lighting for each pair. The coordinates are viewer X, Y, Z in metres. The capture session neutralized the Marian picture textures under H8. [Publication holds](../../docs/open-source/publication-checklist.md)

| Comparison | Lighting | Camera position | Target |
| --- | --- | --- | --- |
| Closed main doors | Day | (0.25, 2.45, 1.70) | (5.30, 2.45, 0) |
| Closed side doors | Evening | (14.90, 1.68, −4.90) | (16.55, 1.80, −7.36) |
| Closed nave shutters | Day and evening | (18.30, 1.80, −4.90) | (21.225, 2.55, −7.36) |
| Open nave shutters | Day | (18.54, 2.11, −8.62) | (21.225, 2.40, −7.50) |
| 4.65 m pew backs and rails | Day and evening | (7.00, 1.38, −1.20) | (8.75, 0.66, −3.50) |
| Seats from the aisle | Day | (12.10, 1.77, −0.50) | (10.40, 0.63, −3.00) |
| Four short pew blocks | Evening | (6.30, 1.75, 0) | (35.00, 3.40, 0) |

## Checks

- Desktop offline and `?visit` renders passed with zero console errors and zero HTTP requests. All four photographic maps decoded, at 768 × 768 in standard graphics and 384 × 384 in light graphics. Neutral finish mode cleared the timber maps, and reference mode restored the same map objects and colours. The opening switch, automatic walk opening, both seating arrangements, frame styles, glass modes, and day/evening controls were exercised.
- `verify_model.cjs --plan` and `verify_construction.cjs` passed. The regenerated plan is byte-identical. The finish study modifies the timber's UVs and display materials. Door positions, bench clearances, equipment and analytical inputs retain the existing values.
- `verify_simulator.cjs --electrical --export-electrical` passed for 374 installed components and 435 selectable runs. The schedule and systems JSON were byte-identical and the equipment layout differed only in the export timestamp. There are no equipment or line fields to refresh.
- Local web build, viewer-copy inventory, production boundary and four desktop visit tests passed. The build reported its existing Next.js dependency advisory. The existing engineering holds remain in effect. [Engineering baseline and scope](../../docs/engineering/central-view-constraint.md)
