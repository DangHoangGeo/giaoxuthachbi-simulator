# Church material and carving review · 19 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.**

These are renders from the desktop viewer. The before version is `1e631a7` plus the owner's in-progress entrance approach study in `entrance-approach.js`, `viewer.css` and `OPEN_CHURCH.html`. Both renders use that approach study for an equal comparison. The entrance study is separate from this finish revision.

The comparison uses Chrome at 1360 × 820, 1× pixel density, visit-only mode, default frame and four seating blocks. The inputs are camera and target coordinates in the model's X/Y/Z metres. For the walking frame, `setWalkPosition(8.3, 0, 0, .09)` sets the walk pose. The development notices and labels are added beneath the captured pixels. For these evidence images, the screenshot session temporarily neutralizes the door and window textures recorded under **PUBLICATION HOLD H8**. [Publication record](../../docs/open-source/publication-checklist.md)

| View | Mode | Camera | Target | Capture |
| --- | --- | --- | --- | --- |
| Nave aisle, eye level | Evening · Walk | X 8.3, Z 0 | Yaw 0, pitch 0.09 rad | [Comparison](compare-walk.jpg) |
| Column capital and joint | Day | 23.8 / 5.2 / 0.25 | 23.475 / 8.4 / 3.5 | [Comparison](compare-capital.jpg) |
| Sanctuary and niches | Evening | 38.3 / 1.62 / −0.75 | 48.9 / 4.4 / 0.15 | [Comparison](compare-sanctuary.jpg) · [Full view](sanctuary.jpg) |
| Altar and shrine | Day | 42.1 / 1.8 / 1.8 | 48 / 3.1 / −0.4 | [Comparison](compare-altar.jpg) |
| Courtyard and façade | Day | −56 / 1.6 / −17 | 4 / 14 / 0.5 | [Comparison](compare-courtyard.jpg) · [Full view](courtyard.jpg) |
| Niches and stone relief | Day | −5.4 / 4.1 / 3.7 | 3.1 / 8.5 / 2.98 | [Comparison](compare-stone.jpg) |
| Towers and side elevation | Evening | −39 / 7 / −49 | 14 / 13.1 / 1.5 | [Full view](three-quarter.jpg) |

## Checks

- `verify_model.cjs --plan` passed. The central façade has 237,536 triangles within its 240,000 budget. The niche shells face the courtyard and their crown dimensions and spandrel offsets pass. The regenerated plan data is byte-identical. The static model batches total 7,195,075 triangles, up 0.57% from 7,154,007.
- The site view and the timber reference package passed their existing checks. The tower check passed 600 traced endpoint comparisons on the front and 600 on the outer side faces.
- Electrical checks and fresh default exports reconciled with the baseline and the checked-in schedules. There are 374 installed simulator components and 435 selectable runs. Equipment layout differs only by the export timestamp, so the register inputs and quantity summary carry no changes from this pass.
- The simulator calculation audit passed, including the equipment mount and operating tour checks. The modeled ambo and altar feedback margins remain low at 0.9 dB and 1.4 dB. Wing STI remains below target at a 0.410 minimum and 0.484 average. The full-service estimate reaches 200 lux at all sampled seats. Ventilation is still estimated at 3.5 air changes per hour against the 4–6 target.
- Checked the offline viewer and visit-only mode in desktop Chrome, including day/evening, Walk, the two-block/reference-frame settings and light graphics. The staged viewer also opened and rendered on its own. The viewer copy and output-boundary checks passed. The 116 web unit tests and four desktop visit tests passed. Next.js compiled and generated local pages, then the build command stopped on its existing dependency security advisory. The visit tests used the compiled local pages and separately prepared viewer copy.
- The generated mural is a concept. The master, exact prompt and embedded WebP provenance are in the [artwork record](../../Thach_Bi_Viewer/references/02-sanctuary/sky-study/provenance.json).

The model still depicts visible fans and supports pending the engineering response to the [central view requirement](../../docs/engineering/central-view-constraint.md). Existing analysis and approval limits apply. Earlier presentation screenshots, GLB exports and decorative detail prints predate this study. The artist and architect need to review the revised appearance and detail the physical finishes and fixings. [Interior finish record](../../docs/interior-finish.md) · [Façade record](../../docs/facade-model.md)
