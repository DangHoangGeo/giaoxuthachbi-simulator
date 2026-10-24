# Decoration and finish development · 25 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

Owner brief: improve exterior, interior and sanctuary decoration and visual realism in the northern Vietnamese Catholic tradition. This revision refines the existing approved composition rather than treating newly invented ornament as historic evidence. The drawing-controlled envelope, liturgical arrangement and parish meeting decisions remain the basis.

## Sources and cultural direction

- [Project appearance hierarchy](church-view-renderings.md): ivory mineral plaster, terracotta roofs, stone paving, carved red lacquer and parcel gilding. The selected [sanctuary concept](../Thach_Bi_Viewer/references/02-sanctuary/concepts/09-sanctuary-approved-concept.png) governs the blue crucifix and saint recesses, layered gilding and lacquer. These remain concepts, not measured finishes.
- [Sanctuary model](sanctuary-model.md), section sheet 5 and the [25 October meeting](engineering/parish-meeting-2026-10-25.md) govern the sanctuary's arrangement. [Façade model](facade-model.md) and CAD E01B govern exterior geometry; this revision changes no dimensions or roof silhouettes.
- [Timber specification](beams-roof-connections/SPECIFICATION.md) and its approved concept references govern existing foliate carving. The station sprigs repeat that project's leaf vocabulary. No claim is made that every individual leaf pattern is a documented regional motif.
- Cultural corroboration: the [Archdiocese of Hanoi's cathedral account](https://www.tonggiaophanhanoi.org/giao-xu-chinh-toa-ha-noi/), consulted 25 October 2026, describes carved timber screens and red lacquer/gilding in the sanctuary and side altars. This supports the finish direction; it does not approve a Thạch Bi ornament or prescribe all northern churches' appearance. No third-party photograph or artwork is copied into the viewer.

## Implemented in the viewer

`Thach_Bi_Viewer/decoration.js`, revision `2026-10-25-decoration-1`, runs after the sanctuary builder, before display batching. Four shared 256 × 256 procedural data maps use a separate fixed seed, local canvas generation and the existing texture-memory policy. No network asset or external library is required. Colour textures are unchanged; new roughness/height textures use linear data colour space.

| Surface | Display change | Limit |
| --- | --- | --- |
| Exterior plaster, mouldings and ivory roof lining | Fine mineral grain and periodic trowel clouds; subdued highlights | Proposed finish; no moisture staining, damage or construction mix inferred |
| Nave floor and sanctuary pale stone | Shallower bump shading and honed roughness | Existing tile/vein artwork retained; no slip-resistance or selected stone claim |
| Terracotta roofs | Softer specular highlights | Roof geometry and tile artwork retained |
| Sanctuary and station gilding | Fine roughness variation and faint leaf-overlap seams | Proposed gold-leaf appearance; no gold grade, foil size, cost or application specification |
| Red lacquer, column carving and roof timbers | Softer clear coat and satin highlights; roof timbers keep the same reference lacquer roughness as columns | Owner-selected red retained; natural timber tone colour/grain palette remains available |
| Sanctuary scrollwork and relief plates | Bump factor reduced from 0.4 to 0.003 to avoid inflated surface shading | Shader parameter only, not an actual measured carving depth; existing relief meshes retained |

`stations.js`, revision `2026-10-25-stations-2`, adds raised inner pointed mouldings and four small gilded leaf sprigs per station. These remain inside the existing panel outline and relief projection, above the openings and clear of candles and exit signs. The fourteen positions, I–XIV numbering, finial crosses and plaques stay as recorded in the meeting. **The identical cross motifs are still placeholders for fourteen commissioned narrative artworks.** The new surround does not make the art complete or approved. It adds two batched meshes, not fourteen independently rendered assemblies.

## Coordination and registers

No equipment record, equipment position/aim, light output, circuit, route endpoint, route vertex or physical control changes in this revision. No acoustic material input, analytical boundary, ventilation setting, collision shape, structure, walking route or seating arrangement changes. The shallow frame ornament stays inside the previous station envelope. The electrical/decoration register has no new or retired item or specification to export. Its existing category workbooks and summary were inspected and left intact; concurrent equipment/register edits belong to their own work session. No Excel coordinate proposal is made.

The model plan and electrical schedules do not encode these finish maps or frame surface details, so no changed plan/schedule export is required for this finish revision. Existing generated concept galleries are earlier artwork, not renders of this revision; their sources and selections are preserved. Desktop screenshots in the [review record](../review/decoration-2026-10-25/README.md) document this viewer revision instead.

The [central-view constraint](engineering/central-view-constraint.md), [public viewer boundary](web/viewer.md) and [publication permission](web/publication-permission.md) were checked. No fan is hidden as a decorative fix. Existing visible equipment and unresolved light, feedback, speech, airflow, access and concealment issues remain open. Appearance parameters are not measured optical data and cannot establish lux or glare compliance.

## Outstanding review

**USER CONFIRMED, 25 October 2026:** “mirror things” means **minor visual details** in this decoration request. It is not a request to reflect the model. ENG-027, the separate possible drawing/model left-right mirror, remains open. This finish revision applies no global reflection and changes no saint, tower-board, stair or station side assignment. A coordinate reflection needs its own coordinated geometry, winding, navigation, equipment, route and register migration.

Parish/artist review is still required for the station narratives, statue sculpture, precise regional motifs and final finish samples. Structural support, fixing, fire behaviour, service access, humidity durability and cleaning methods require the relevant designers. The present textures provide no product performance or purchasing approval.
