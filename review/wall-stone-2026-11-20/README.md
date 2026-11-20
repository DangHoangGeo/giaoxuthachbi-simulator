# Continuous stone-grey walls · 20 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner requested a continuous stone colour throughout the church and matching columns, and reported dusty shadows along the front and interior walls. In a fixed front view, suppressing the display contact shading removed the uneven gray streaks beside the flutes. Removing the bump map alone left those streaks visible. The previous dark trim also served as the backing behind timber louvres, which produced ochre stripes.

| Desktop comparison | Views |
| --- | --- |
| [Màu tường trong và ngoài nhà thờ](mau-tuong.jpg) | Final interior cream and exterior stone-grey in daylight |
| [Column correction](columns.jpg) | Intermediate white-pier scheme and final matched finish in the same façade and nave views |
| [Front and tower](front.jpg) | Matched entrance and upper-tower views in daylight |
| [Interior](interior.jpg) | Matched nave wall in daylight and inside entrance wall in evening |
| [Around the church](around-the-church.jpg) | Rear gable, both side elevations, sanctuary wall, evening entrance and nave |

## Materials and display

The exterior walls and piers use warm stone grey (`#c1beb4`). The nave-facing wall surfaces, nave supports and sanctuary plaster use light yellow cream (`#f4e4bd`). Shared entrance, nave, wing and rear wall meshes select the interior tint by face orientation. Both finishes are continuous, with no colour map, drawn joints or block pattern. Very fine surface relief still catches grazing light. The drawing-colour switch neutralizes the tints and reference mode restores them. The mouldings use a closely matched stone tint (`#c5c1b7`), the caps use `#c8c4b9` and carved accents use muted sandstone (`#a48f77`). The red timber and gilding retain their separate material identities. The shutter backing uses the timber finish of its frame. The viewer generates the trim bedding locally.

The half-resolution contact pass now samples paired directions consistently along a straight join. It discounts depth changes smaller than a display pixel, capped at 0.03 m, and limits the blur to 0.036 m on each axis. This retains local shadow where mouldings project. Evening uplights still produce conspicuous bright pools on the tower caps. Equipment settings and illumination calculations belong to the simulator.

## Verification and scope

Desktop Chrome, 1360 × 820 at 1×. The comparison holds the camera, model, glazing display and lighting mode fixed within each pair. The previous views use commit `5329cfa`. The revised views use that same checkout plus the final exterior stone-grey and interior yellow-cream revision. The left column of the column-correction sheet records the intermediate wall-only colour, before matching the supports. Captures neutralized the embedded Marian textures under publication hold H8 in the review session. The opening-head panels in these images therefore differ from an ordinary visit. The paired images and the overview sheet are resized and labelled from the desktop captures. [Publication record](../../docs/open-source/publication-checklist.md)

| Camera | Position X, Y, Z (m) | Target X, Y, Z (m) |
| --- | --- | --- |
| Entrance detail | −12, 6, −3 | 2.8, 10.5, 0 |
| Tower | −12, 23, −17 | 2, 25, −9 |
| Nave wall | 18.3, 2.4, −1.3 | 15.7, 4, −7.25 |
| Entrance from inside | 13, 2.8, 1.8 | 5.48, 4.4, 1.2 |

The desktop pixel check samples roughly 8 cm of the wall field, down to one pixel at long range. A fixed 11 × 11 patch at 100 m also sampled neighbouring trim. Ray checks identified a clear lower stone field at (2.21, 5.12, 3.88) m and side stone at (18.2, 4.15, −10.474) m. On a straight synthetic join, the darkest median contact was 28 levels deep and the largest within-column 5th-to-95th percentile spread was one level. These are image comparisons, independent of estimated illumination.

The model, exterior-DWG, construction and reference/neutral finish checks passed. Local desktop and visit-only captures completed without browser errors. The web suite passed 116 unit tests, four visit-browser tests and the viewer byte-inventory and production-boundary checks. Next.js compiled and generated the site pages, then stopped the final release command on its existing dependency security advisory. The browser tests exercised those compiled pages on a local standalone server.

The recorded drawing lines, model geometry, collision shapes, structural materials, simulator inputs, equipment quantities and electrical routes have no changed design fields. The plan and equipment registers therefore require no new export. The colour expresses an appearance preference. Wall construction, fire, acoustic and moisture performance and final finish samples remain for the responsible designers. [Façade](../../docs/facade-model.md) · [Towers](../../docs/exterior-23102026/towers.md) · [Interior](../../docs/interior-finish.md)
