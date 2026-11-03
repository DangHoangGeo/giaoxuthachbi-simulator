# First decoration review: tower-front spandrel leaf

**2 November 2026 · In development / Đang phát triển · Not for construction / Không dùng để thi công.** This review identifies the first component, its source and the limits of the implemented outline.

## Drawing and current model

The source is the 23 October 2026 DWG, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`: E01B, printed CAD sheet 1, H-tower front. Local volume 11 page 14 identifies the paired spandrel decoration as T12; it is a locator to the same CAD, not independent evidence. The right/left compositions frame the arch; the T12 guide requests an architect's full-size pattern, material and relief depth. Do not measure the PDF.

A local read of the converted DXF identifies 75 ARC/LINE entities on layer `01`, handles `C44A60`–`C44AAA`, for one of the H-front corner compositions. Their combined 2D extent is approximately 1.295 m horizontally and 1.162 m vertically, Y +5.428 to +6.590 m. The extent is derived from the drawn lines, not a dimension printed by the architect. Transform E01B with `Z = -(x - 1666600.3)/1000`, `Y = (y + 515946.8)/1000`; model centre |Z| 10.153 m. ISSUE-R06 (interpreted mm versus `INSUNITS=1`) remains open. The enclosing great arch has spring +3.985 m and outer R1.955 m, handle `C449BD` in [tower witnesses](tower-witnesses.json).

Before this revision, the `Tower front spandrel spray` instances in [`towers.js`](../../Thach_Bi_Viewer/towers.js) are two procedural sprays per corner from [`exterior-ornament.js`](../../Thach_Bi_Viewer/exterior-ornament.js). They suggested the horizontal and descending arms, but their leaf and scroll contours were illustrative. The source is a single interwoven corner composition, with smaller inner details and a visibly different outline. Its second front corner should be checked against its own CAD entities before treating a mirror as exact; E02 outer-side ornament needs separate review. Depth, material, attachment, manufacture and the hidden face cannot be derived from the front elevation.

## Permission for this detail

[Publication checklist H1](../open-source/publication-checklist.md) keeps the designers' DWG and rendered sheets out of Git, and states that only dimensions, levels and grid checks extracted from that DWG are committed. Reproducing the complete curved detail as model coordinates would commit more than those permitted extracts, and the viewer is copied to the public website. The [owner's display permission](../web/publication-permission.md) covers project-created development work but explicitly leaves third-party drawing rights unresolved. On 2 November 2026 the owner confirmed that the parish and designer permit reproduction of this detail in the public model. This scoped confirmation authorizes its source-derived profile; the original grant document was not supplied or independently verified. H1 remains open for the source DWG, sheet images and other details.

## Implemented component and review

`CHURCH_EXTERIOR_ORNAMENT.create(...).towerSpandrel(profile)` renders the two independently extracted H-front corner profiles (75 entities each, 150 in total) as a single reusable component per corner. The B-front counterparts repeat the corresponding H profiles and are **DERIVED** pending their own source comparison. For each source ARC the center, radius and angular span are transcribed and tessellated with a maximum 0.2 mm chord sagitta; LINE endpoints are retained. The visually represented 8 mm contour radius and stand-off are **CONCEPT**, not measured carving depth. The lines show the drawn 2D pattern; they do not establish the filled carved surfaces, material, fixing or fabrication. Object names and equipment placement remain unchanged. The other tower faces and other decorative families were not changed.

`verify_tower_spandrel_source.py` checks all 150 source objects and numeric parameters against the same local DWG-derived DXF, and `verify_tower_spandrel.cjs` checks 600 source-curve endpoints against the actual assembled mesh on both towers. Source rounding is below 0.000001 mm or degree; the largest endpoint-to-rendered-surface distance is 8.001 mm, which includes the intentional 8 mm illustrative contour radius. These are software checks, not construction tolerances or independent CAD validation. The remaining discrepancy from the true 3D ornament is unknown.

Desktop day/evening front views were inspected; the viewer rendered with no console errors. See the overall verification in the session record; full-size material, close visual review by the designer, drainage, attachment and long-term maintenance remain open. This revision changes no equipment positions, circuit or routes. Existing PDF/model exports are stale for the tower ornament and are not construction documents. ISSUE-R06, ENG-027, ENG-039–041, all design-performance and structural holds remain open. The change is a design-development transcription, not approval to construct.

## Further placements · 2 November 2026

The owner asked for the leaf to be bolder and used wherever the new design draws it. A search of the whole converted DXF for copies of the 73 T12 arcs (any position, mirror or scale) found it only at full size, in these places:

| Place | Drawing | Origin (u = 0) and hand | Omitted source objects | Model |
| --- | --- | --- | --- | --- |
| Tower fronts | E01B | Z ±10.153 | none | existing |
| Tower outer sides | E02 | X 2.450 | none | `Tower side spandrel spray · E02` |
| Central portal arch | E01B, witness arc C4491B / C45124 | Z ±0.534, Y +1.335, outward | C44AAA | `Facade arch spandrel leaf · E01B T12` |
| Side-bay arches, centre side | E01B, C44B3A / C4532A | Z ±5.424, toward the centre | none | same |
| Side-bay arches, tower side | E01B, C44B84 / C45374 | Z ±5.276, outward | C44A87, C44AA0, C44AA8 | same |

The B side mirrors H within 0.1 mm. These placements reuse the already-permitted T12 coordinates; no other detail is reproduced. They replace the bundle's flat sprays (`Spandrel foliate branch`, `Spandrel hanging foliage` and their fleur tufts), which `facade.js` now removes over the three ground arches. The contour radius is 18 mm (was 8 mm) and arcs use a 1 mm chord tolerance; both are display choices, not carving dimensions. The wall face behind the façade leaves is taken as X 1.975 from the removed sprays (DERIVED). Depth, material, fixing and fabrication remain open, as above.

## Niche crests · 2 November 2026

On the owner's confirmation that the parish and designer permit the upper-front details ([H1](../open-source/publication-checklist.md)), the crests over the three upper niches are transcribed from E01B into `Thach_Bi_Viewer/facade-crest-profile.js`, in the same row format as T12 (u from the niche axis, v = world Y).

| Crest | Source objects | Model |
| --- | --- | --- |
| Side-bay aedicule, H | 205 ARC/LINE, C48E1C–C48EE8, niche axis Z 5.35 | `Facade niche crest · E01B` |
| Side-bay aedicule, B | C48EEA–C48FB6: the same outline translated to Z −5.35 (not mirrored; within 0.1 mm) | same, profile repeated |
| Central aedicule | 183 ARC/LINE, C49BF8–C49CC4, axis Z 0 | same |

Selection: entities outside the niche's outer moulding ring (R 0.986 side, 1.112 central), excluding the concentric niche and great-arch rings, the pier capitals and the pediment lines. Plots of the selection were checked against the raw E01B vector sheet. The outline is not symmetric about its axis, which is why the B copy is a translation. `verify_facade_crest_source.py` checks every row against the DXF (H and central exact to 5×10⁻¹⁰; B copy 0.1 mm). The crests replace the procedural `crown` and arch `leaf cresting`. They use the T12 contour tube (18 mm, 1 mm chord), set on the wall face behind (side X 4.017, central 3.915). Relief, material, fixing and fabrication are **CONCEPT**. The façade triangle guard in `verify_model.cjs` rises from 150,000 to 200,000 for these traced details (180,640 now).
