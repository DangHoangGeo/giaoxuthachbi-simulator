# Interior baseline before the realism work · 10 November 2026

**ACTUAL MODEL SCREENSHOTS · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner asked for the interior to look and feel more finished: warm, believable and reverent. These twelve captures record the starting point, and the ranked list below says what most holds the picture back. Nothing in the viewer, model, equipment, routes or registers changed.

## Captures

Source: `ce7d310` **plus the owner's uncommitted `OPEN_CHURCH.html`, `entrance-approach.js` and `viewer.css`**; HEAD alone cannot reproduce them. Desktop viewer in visit-only mode (`OPEN_CHURCH.html?visit`), Vietnamese default, presentation mode (no panels), drawn frame, four pew blocks. Each frame is the viewer canvas rendered at 1600 × 900, pixel ratio 1, walking camera at eye height 1.60 m, vertical field of view 48°, JPEG quality 0.9. No error-level console entries after the run.

| View | X, Z (m) | Yaw, pitch (rad) | Day | Evening |
| --- | --- | --- | --- | --- |
| Entrance toward the altar | 3, 0 | 0, 0.03 | [day](01-entrance-to-altar-day.jpg) | [evening](01-entrance-to-altar-evening.jpg) |
| Mid-nave | 22, 0 | 0, 0.05 | [day](02-mid-nave-day.jpg) | [evening](02-mid-nave-evening.jpg) |
| Sanctuary | 37, 0 | 0, 0.07 | [day](03-sanctuary-day.jpg) | [evening](03-sanctuary-evening.jpg) |
| Side aisle (B side) | 10, −4.5 | 0, 0.03 | [day](04-side-aisle-day.jpg) | [evening](04-side-aisle-evening.jpg) |
| Ceiling and trusses | 18, 0 | 0, 0.80 | [day](05-ceiling-trusses-day.jpg) | [evening](05-ceiling-trusses-evening.jpg) |
| Back toward the entrance | 35, 0 | π, 0.045 | [day](06-back-to-entrance-day.jpg) | [evening](06-back-to-entrance-evening.jpg) |

Scene figures read from the running page: 15 real-time lights, of which 3 cast shadows (the sun and two spots at X 37.1 m); the rest is a hemisphere light, one fill sun, four point lights and six unshadowed spots, all between X 28 and 41 m. The nave west of that has no local real-time light. Of 888 materials, 50 carry a colour texture and 34 a normal or bump map. About 3.95 million triangles in 636 draw calls.

## What makes the interior look unrealistic or plain, most important first

1. **No shadow or light gradient in the nave.** Pews, column pedestals and steps do not darken the floor beneath them, corners between wall, floor and ceiling have the same brightness as open wall, and columns throw nothing. Everything looks pasted on. This is the largest single difference from the 9 November concept image, and it affects every view.
2. **Evening is over-exposed and uniform.** The floor, altar and walls clip to pure white; there are no pools of light under the lamps, no falloff toward the aisles and no darker roof. The sanctuary does not stand out as the brightest, warmest place, so the evening has no reverent mood. Lacquer turns orange-red where it clips.
3. **Daylight does not enter the building.** No sun patches cross the floor or columns, the windows and open doors do not glow, and the view through the west door is a blank white (day) or flat navy (evening) rectangle. Day and evening differ in tint only.
4. **Floor is a blank ivory sheet.** No stone joints, no tile module, no border along the aisles, no sheen or reflection of columns and altar. The two small roundels are the only event in 40 m of aisle. The sanctuary floor shows a faint chequer too weak to read as paving.
5. **Walls are bare flat plaster.** No dado or skirting, no pilasters marking the bays, no cornice where wall meets roof, no mouldings round door and window heads. The reliefs, M lunettes and station plaques float on a blank surface. The entrance wall is the emptiest in the church.
6. **Ceiling is flat stripes.** Between the rafters the lining is one untextured cream plane; the concept shows framed panels with rosettes. Seen from below, the roof reads as a diagram, and the gilded carving of the ties is too small to carry it.
7. **Equipment dominates the view.** Ceiling fans on long rods, white wall fans, column loudspeakers, spot heads and green exit signs are the most legible objects in the upper half of every frame, in black and white against red and ivory. (Fan concealment is an open engineering item in `docs/engineering/central-view-constraint.md`; the display could at least finish-match what stays.)
8. **Timber and lacquer look like plastic.** Column shafts carry a large blotchy grain with one broad highlight; pews are a uniform stretched stripe with sharp box edges and bright yellow crosses; doors are dark slabs. No edge wear, no varied sheen, no gilding sparkle.
9. **Sanctuary furnishings are simple shapes.** Flower arrangements are white balls, the paschal candle stand is a plain cone, the ambo top is a red slab, the credence a white box, the chairs are blocks, the altar front is nearly blank. The blue niches are a saturated flat gradient that looks like a screen rather than a painted recess. This matches the limits already listed in `docs/sanctuary-model.md`.
10. **Column pedestals do not fit the scheme.** White boxes with dark green panels meet the red turned bases abruptly; in the side-aisle view they are the nearest object to the eye.
11. **No signs of use or atmosphere.** No sanctuary lamp glow, candle flames barely register, no holy-water stoups, hymn boards, kneeler cushions, altar cloth folds, or soft haze in the roof at evening. Banners are flat white cards.
12. **Edges are hard and slightly aliased.** Rafters and pew ends shimmer at distance; a little bloom on lamps and gilding and better edge smoothing would soften the whole picture.

Items 1–3 are rendering changes that leave geometry, equipment and calculated results untouched. Items 4–6 and 8–11 are display finishes and ornament. Item 7 touches the equipment model and must follow the register and central-view rules.

## Limits

This is a visual assessment of screenshots, not a lighting calculation: screen brightness is not lux, and the simulator's analysis uses its own reflectance schedule. Existing engineering holds and unmet lighting, sound and ventilation targets are unchanged. No model, simulation or web checks were run because no runtime file changed.
