# Church view renderings · 7 October 2026

Status: **CONCEPT — visually reviewed artwork**, not construction approval. The [dated gallery](../Thach_Bi_Viewer/references/00-overview/2026-10-07/index.html) contains sixteen views: the original nine exterior/interior/connection concepts, five additional side-entrance, window/wall and rear views, and two overhead views with and without the roof. Daylight and evening appearances are included. Each selected image has a preserved native original and a 1920 × 1080 export.

## Reference hierarchy and owner corrections

1. Original drawings, the dimension register and checked engineering govern dimensional or construction decisions. An attractive rendering does not resolve a drawing conflict.
2. The [model captures](../review/church-views-2026-10-07/model-inputs/capture.json) at commit `93e9a1e` supply overall proportions, layout, supports, openings and camera composition. Captures are actual viewer screenshots, separate from generated artwork.
3. At the recorded capture revisions, the owner clarified that the model had not fully incorporated the latest sanctuary or column/beam connection art. Use the [approved sanctuary concept](../Thach_Bi_Viewer/references/02-sanctuary/concepts/09-sanctuary-approved-concept.png) for the red lacquer, gilded layered sanctuary, central Crucifix in a blue recess, and elevated Marian/Joseph shrines. Use the [full-width timber frame](beams-roof-connections/images/07-full-width-frame-concrete-sides.png), [carved column head](beams-roof-connections/images/02-column-head-three-quarter.png) and [longitudinal beam study](beams-roof-connections/images/08-longitudinal-beams-two-frames.png) for decorative form. Simplified model collars and sanctuary meshes must not override those art references. Approval of appearance does not validate a structural connection.
4. **USER CONFIRMED:** the statue between the two front towers is the Assumption of the Blessed Virgin Mary. The new images interpret it as an ivory statue with upturned face, open raised arms, flowing robes and a cloud plinth in the tall central niche. Exact statue design, scale, fixings and niche fit remain proposed; this does not update the facade model automatically. On 9 October 2026 the local simulator gained a removable generated Assumption figure in that niche, with proposed Saint Peter and Saint Paul figures in the side niches: see the model follow-up at the end.

The visual direction combines the existing Catholic composition with northern Vietnamese lacquer and foliate timber craftsmanship, ivory concrete/plaster, terracotta roofs and stone paving. It is a project-specific art proposal, not evidence that every decorative motif is a documented local tradition.

## What the artwork can and cannot establish

Use it to discuss composition, finish, iconography, sanctuary richness and carved relief at different distances. Fine sculpture, gilding patterns, finish colors, reflections and lighting are interpretations and may vary across viewpoints. The images are generated independently, so they are not a metrically consistent multi-view model or fabrication set.

The approved concepts supply decorative form; natural-brown timber studies may be interpreted in the model's red-brown lacquer and sanctuary gilding. Keep the two central timber rows and concrete outer supports. Proposed ornament does not define residual timber sections, concealed joinery, fixings, capacity, fire behavior or maintenance clearances. Richer carvings must be coordinated and reviewed before later mesh changes or construction.

The connection close-up is an art study derived directly from the timber and sanctuary references, with a corrected plain upper wall background. It has no matching model camera capture and must not be used to infer an as-modeled connection. The other fifteen views each retain their associated model capture. The richer sanctuary relief and deep column-head/haunch carvings in views 05–09 remain visual proposals for later model work.

Do not measure equipment positions, cable routes, lamp output, lux, dimensions or quantities from these pictures. Use the model registers and governing documents. This image delivery changes no 3D geometry, simulator parameters, equipment IDs, Excel registers or engineering results. Its captures describe the recorded model revisions, not later concurrent model edits. See the model follow-up below for separately implemented changes.

## Side entrances, windows and rear views

Views **10–14** add exterior and interior side-entrance details, a close look at wall/window decoration, the straight sanctuary-end rear elevation and an evening rear/side view. Their [actual model captures](../review/church-views-2026-10-07/model-inputs-additions/capture.json) use revision `e64143e` for openings, supports, roof footprint and camera composition. The image set predates later concurrent model edits.

**USER CONFIRMED appearance intent:** view **11** governs the side-window shutter design: paired solid warm dark-brown timber leaves with long carved foliate panels and restrained gilding. Views **10, 12 and 14** were revised to use that appearance outside as well. Earlier wide views remain earlier design studies and may show superseded shutter treatments; use these new details when coordinating future model changes.

Keep the different opening types distinct. Side entrance double doors retain their round floral panels; tower louvers remain louvers; the five rear lower windows remain a separate glazing type. View **13** governs the rear elevation's opening count and appearance. The evening oblique view stylizes reflections and colored glazing; it is not a fabrication drawing. Side stair flights run parallel to the long walls, with no new doorway or stair flight across the rear end wall. The Assumption statue remains at the front facade only.

## Top-down roof and column connections

Views **15–16** show the roof/site layout and a roof-hidden interior cutaway. [Overhead capture metadata](../review/church-views-2026-10-07/model-inputs-additions/capture-top-down.json) records the camera and visibility settings at revision `e64143e`. In these images the entrance/towers are on the **right** and the sanctuary on the **left**. Shrine canopies and vaults are shown from above; a frontal sacred portrait must not be interpreted as floor decoration.

The owner's question about connections along a column row corresponds to **longitudinal column-line beams (B03)** and their **J04** connection family in the [structural specification](beams-roof-connections/SPECIFICATION.md). They run along model **X**, between successive transverse frames, connecting the columns of each of the two nave rows. Thus they run left-to-right in this overhead composition, perpendicular to the transverse ties. “Vertical in the picture” describes screen orientation; these are lengthwise beams rather than upright columns.

View **16** adds the two proposed nave-row beams from the [approved longitudinal frame study](beams-roof-connections/images/08-longitudinal-beams-two-frames.png). Their presence in the artwork does not establish that B03 members are implemented in the captured model. Roof purlins/ridge members are separate elements and must not be mistaken for column-head beams.

**ENGINEERING HOLD:** actual member sections, support/bearing levels, end joints, continuity and load paths need coordinated structural design. The cutaway does not fully resolve the wider **7.20 m bay 9–10 transition to the sanctuary frame**; do not treat it as a complete framing layout. Future model work must represent the checked bearings and interfaces explicitly rather than merely drawing a continuous mesh. No structural capacity, hidden joinery or construction approval is inferred from this image.

## Resolution, provenance and selection

The built-in image generator produced **1672 × 941** originals despite the Full HD request. The owner expressly authorized local **1920 × 1080 resampled copies** while preserving those originals. Native masters are byte-identical copies; exports use centered LANCZOS resampling to 16:9 with a sub-pixel edge crop. Enlargement does not add native detail.

The [asset manifest](../Thach_Bi_Viewer/references/00-overview/2026-10-07/manifest.json) records dimensions, hashes, generator file IDs and source-capture associations. The [generation record](../review/church-views-2026-10-07/generation-record.json) preserves the original exact prompts, input references and rejection reasons. The [additional generation record](../review/church-views-2026-10-07/generation-additions-final.json) records fourteen further jobs, their seven final selections and replacement lineage. A generator-cache candidate identifier is provenance metadata, not a missing repository image.

Only selected images enter the reference set. Earlier outputs lacking the requested statue, using obsolete sanctuary/connection art, or adding invented windows/background features stay outside the repository reference folders. Superseded gallery thumbnails have been removed from the numbered reference folders at the owner’s request. Timber studies still used for coordination are preserved in the engineering package; exact earlier facade inputs remain in the review source folder. Native selected masters are intentionally retained alongside their Full HD copies.

Visual review covers silhouette, visible openings, roof continuity, recognizable sacred figures, carved form, obvious generation defects and consistency with the stated concept. It is not an engineering acceptance test. Before public use, label these as generated concepts and keep them distinct from dated site photographs in the construction timeline.

## Model follow-up

The paragraphs above describe the image delivery, when no geometry had changed. Revision 5 of the [sanctuary model](sanctuary-model.md) now transfers this art into the viewer in steps, as generated carving that approximates the pictures:

1. Columns: turned bases on panelled stone pedestals, carved capitals, junction blocks and dies with gilded lotus panels; clear-coated lacquer.
2. Beams and connections: lengthwise beams on the column lines (a visual proxy on engineering hold), carved haunches under the tie, side and lengthwise beams, gilded cartouches on the beam faces and carved tie-beam ends. The curved upper rail of the timber concept and the haunches at axis 9 are left out because fittings stand there; see the [beam specification](beams-roof-connections/SPECIFICATION.md).
3. Sanctuary: gilded scrollwork and relief finishes on the reredos, chamber, shrines and front frame; glowing blue niches; crocketed pinnacles and leaf crestings; a carved wooden corpus with a gilded cloth; a gilded, domed tabernacle.

Still simpler in the model than in the art: the statues, the closed and panelled shrine doors, the carved altar front, the depth of the relief (a generated pattern with a height map) and the curved upper rail over the tie beams. Parts not listed here are still as described above. The art remains the reference for appearance only. Dimensions, structure, equipment and calculated results keep their own sources.

## Wing Saint Peter and Saint Paul concepts · 9 October 2026

The owner requested a Peter/Paul pair between the two end-gable windows in **each** sanctuary wing. [Two native1024×1536 artworks](../Thach_Bi_Viewer/references/10-wing-saints/README.md), generated with `image_gen.imagegen`, serve four local3D frames and appear in the reference manifest. Exact prompts, source paths, hashes and native status are retained; no resampling or copied-room rendering establishes dimensions. Peter carries keys/book; Paul carries book/downward symbolic sword. Root visual review confirms the paired composition; final artwork/product approval remains pending.

The model uses unpowered stable decoration IDs `D-WING-B/H-PETER/PAUL`, frame proxy1.12×1.62 m atY2.20, between modeled windows. Actual picture/frame size, height, substrate/glass, fixing, moisture/glare and service details remain unknown. These pictures do not add electrical demand, light emitters or acoustic absorption assumptions. [Wing coordination](engineering/wing-review.md) reserves the wall strip and retains the lighting/sound/air/structural/concealment failures; the source image cannot approve any capacity or installation.

## Façade statues in the model · 9 October 2026

The owner asked for the Assumption in the central place between the two towers with a saint on each side, lit without visible lamps and with two candle lights on each base. The local simulator now has three removable decoration records on the drawn niche pedestals (`D-FACADE-C/B/H`) and circuit L10 with hidden light lines and electric candles. The Assumption follows the description in point 4 above: ivory, upturned face, open raised arms, flowing robes, cloud plinth. The side saints are **proposed** as Peter and Paul and await the owner's choice. Elevation sheet 1 shows empty niches; the traced façade is unchanged and the figures can be hidden. Figures are generated shapes, not the generated artwork of the views and not a sculptor's design. Positions, sizes, light levels and all holds are in the [coordinated record](engineering/outlets-and-facade-statues.md).
