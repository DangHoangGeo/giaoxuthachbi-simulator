# Nave joints and ceiling appearance study · 9 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner requested a current screenshot followed by image-generation improvements to the generic-looking column/beam spaces and roof underside. Two native **1586 × 992** PNG concepts were created with the built-in `image_gen.imagegen`. They are new appearance proposals for owner review, not replacements for approved references or changes to the model.

## Actual model captures

- [Nave, daylight](current-nave-day.jpg): Discover → Nave; four pew blocks, drawn frame.
- [Columns and roof, daylight](current-columns-roof-day.jpg): View settings → Columns & roof, oblique upward view.
- [Columns and roof, evening](current-columns-roof-evening.jpg): same detail preset with evening lighting; a source/context capture, not a generated evening proposal.

The captures use the actual desktop viewer in visit-only mode, 1600 × 1000, full resolution. Their app overlays and visible fans remain as captured. The [capture record](capture.json) includes hashes and the source revision: `06625eb` **plus pre-existing uncommitted viewer HTML, entrance-approach and CSS changes**. HEAD alone cannot reproduce the source scene. No error-level console entries were returned after inspection; this is not an automated browser regression result. Navigation and language/display preferences were used; no engineering layout was imported, edited or saved.

## Generated proposals

| View | Appearance proposal |
| --- | --- |
| [Column, beam and ceiling detail](concepts/columns-beams-ceiling.png) | Deeply layered red-lacquer foliate capitals and corbels; selective gilded edges; recessed beam panels and floral cartouches; pierced curved upper collars; warm ivory ceiling panels with mouldings, restrained rosettes and shallow relief. |
| [Nave interior](concepts/nave-interior.png) | The same overall design vocabulary viewed down the processional aisle, with a raised gaze revealing the roof and repeated frames. Calm lacquered shafts, ivory outer walls and the recognizable Crucifix/blue-niche sanctuary balance the ornament. |

The existing generated [full-width timber frame](../../docs/beams-roof-connections/images/07-full-width-frame-concrete-sides.png) and [column-head study](../../docs/beams-roof-connections/images/02-column-head-three-quarter.png) supplied carving references; their natural-brown palette did not override the current red lacquer/gold direction. These are project-generated references, recorded in the [timber manifest](../../docs/beams-roof-connections/image-manifest.json). No third-party photograph or drawing was submitted to generation for this delivery.

The [generation record](generation-record.json) preserves both exact prompts, ordered inputs/roles, input/output SHA-256 hashes, native dimensions and generator filenames. Both native PNGs are copied without resampling; cache originals remain intact. Attribution: Thạch Bi Church design simulator project with OpenAI image generation, 9 November 2026. Project-created work is shared under CC BY 4.0 to the extent rights are held; see [NOTICE](../../NOTICE.md).

## Visual review and limits

Both generated views were visually inspected for coherent carving, legible ceiling hierarchy, red/ivory/gold balance, clear aisle, recognizable sanctuary and visible bilingual development/construction notices. Fans and their rods are absent from the artwork to illustrate the [all-hidden appearance intent](../../docs/engineering/central-view-constraint.md). This is not a concealment installation or evidence of ventilation performance. The source screenshots retain actual visible equipment.

These images are independently generated and are not a metrically coordinated multi-view set. The nave has a higher gaze than its source; bay proportions, ornament density, ceiling panel divisions, fixture depiction and small sanctuary details vary. The wide concept introduces decorated centre uprights in the upper frames: the current 9 November model deliberately omits the centre post because a roof uplight stands there. **Do not transfer those uprights into the model without lighting and route coordination.** Safety-sign-like details in the art do not validate the actual signs or emergency lighting.

No member section, bearing, joinery, residual carved section, fixing, weight, fire/moisture performance, lighting result or maintenance clearance is established by pixels. Added ceiling panels and carving require architectural, structural, electrical, acoustic and ventilation review, including access to cable covers and existing fixtures. The wider bay 9–10 transition remains separate. Existing feedback/speech, lighting, airflow, sightline and concealment failures/holds remain unresolved. Owner appearance approval is pending; construction and purchasing remain held.

## Source and documentation impact

Checked: `docs/church-view-renderings.md`, `docs/sanctuary-model.md`, `docs/beams-roof-connections/SPECIFICATION.md` (including the 8–9 November frame revisions), its image manifest, `Thach_Bi_Viewer/references/manifest.json`, `coverage.json`, `docs/engineering/central-view-constraint.md`, `docs/web/publication-permission.md`, `CONTRIBUTING.md` and `NOTICE.md`. The rendering document links this new study.

This delivery changes **no viewer code, 3D geometry, material, visibility, equipment position/settings, quantity, route, circuit, control or simulator input**. The concepts are kept under review rather than installed as current viewer references. Existing reference selections, source drawings and uncommitted owner work remain intact. No plan/electrical export, category Excel or summary regeneration is needed for image-only proposals; any later model/equipment implementation must follow the coordinated register/export work cycle. No deployment, push or shared-history action is included.

## Verification

- Desktop source inspection: nave day and column/roof day/evening; drawn frame, four-block seating, visit-only mode. Error-level console log empty at the end of source inspection.
- Two generated outputs visually reviewed; native PNG dimensions and hashes verified against the preserved generator files. No resampling.
- Capture hashes, all recorded generation inputs, documentation links and referenced repository paths verified; exact prompts retained.
- `git diff --check` and staged whitespace checks passed before the local commit.
- Model/simulation and web build checks are not applicable: this is an image/document delivery with no runtime change. No new calculation or engineering acceptance is claimed.
