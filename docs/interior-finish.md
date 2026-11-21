# Interior finish and display study · 10 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner asked for the interior to look and feel finished: a warm, believable, reverent church instead of a CAD model. The [baseline review](../review/interior-baseline-2026-11-10/README.md) ranked twelve shortcomings from screenshots. This revision answers all twelve in the viewer. The [after captures](../review/interior-finish-2026-11-10/README.md) use the same six views.

Everything here is a display finish or an ornament proxy. No wall, member, seat, fitting position, circuit, route or control changed, and no analysis input changed: lux, STI, air and power figures are the same as before. Owner review of the appearance is pending.

## What changed

| Baseline item | Change | Where |
| --- | --- | --- |
| 1 · No shadow or gradient | Contact shading: creases and contacts darken within about 0.9 m, from the depth of the drawn picture | `Thach_Bi_Viewer/display-finish.js` |
| 2 · Evening over-exposed | Highlight roll-off before the tone curve: brightly lit stone keeps shape and colour, lacquer stays red | `display-finish.js` |
| 3 · Daylight does not enter | By day each side window or door bay and the centre entrance acts as a small patch of sky, brightening nearby floor and column flanks | `simulator/persistent-lighting.js`, `realism.js` |
| 4 · Blank floor | Paving on the existing 0.90 m module: legible joints, slab-to-slab tone, veining and a honed sheen | `interior-finish.js` |
| 5 · Bare walls | Honed-stone skirting (0.14 m + cap) on the nave side walls, round the piers and along the solid parts of the entrance wall; three-step plaster cornice at +6.76 to +6.93 between the piers, wrapped round each pier as a capital band and carried across the entrance wall | `interior-finish.js` |
| 6 · Flat ceiling | Lacquered cross fillets divide each purlin bay of the lining into three panels; gilded rosettes mark alternate panels (364 fillets, 274 rosettes, axes 2′–9) | `interior-finish.js` |
| 7 · Equipment dominates | **Owner decision, 10 November 2026:** no red lacquer on the fans and no black-and-white mix: keep them all white, and put the effort into the sanctuary and the timber ceiling. Ceiling fans are now white throughout: canopy, motor, hub, blade irons, blades and rod (they were dark timber, bronze and a bronze rod before this study). The first trial, roof-lacquer fans and ivory wall housings, was reverted; wall fans, loudspeakers and sign bodies keep their original white | `simulator/catalog.js`, `simulator/engine.js` |
| 8 · Plastic timber | Column lacquer: an even deep red with faint brush drift and a stronger clear coat; pews and panels: fine straight joinery grain | `interior-finish.js` |
| 9 · Simple furnishings | Open five-petal blooms in every arrangement; turned paschal candle stand with drip pan; gilded fillet round the altar front; linen on the credence | `simulator/catalog.js`, `interior-finish.js` |
| 10 · Pedestals clash | Pedestal panels in deep red marble (were grey-green) | `interior-finish.js` |
| 11 · No atmosphere | Sanctuary lamp (red glass, flame) beside the tabernacle; two holy-water stoups by the centre door; brighter candle flames in the evening; banners hang in soft folds; a faint haze over distance | `interior-finish.js`, `simulator/catalog.js`, `display-finish.js` |
| 12 · Hard edges | Soft glow round lamps, flames and gilded highlights; fine noise against banding on plaster | `display-finish.js` |

## Second pass · sanctuary and timber ceiling

**Owner direction, 10 November 2026:** after the first review the owner set the focus on the sanctuary and the timber ceiling, with the fans left plain white. Captures: [review/sanctuary-ceiling-2026-11-10](../review/sanctuary-ceiling-2026-11-10/README.md). Revision `2026-11-10-interior-finish-2`.

| Part | Change | Where |
| --- | --- | --- |
| Red lacquer (columns, chamber, reredos frame, roof timbers) | The first pass drew faint vertical brush strokes in the colour and sheen maps; on the round columns and chamber walls they read as velvet curtain folds. Both maps now carry only soft, directionless clouding; the clear coat and the shared roughness are unchanged | `interior-finish.js` |
| Blue niches (crucifix, Our Lady, Saint Joseph) | A painted sky replaces the smooth gradient: the same three blues and light centre as before, with soft clouds banked low and round the light, a deeper rim toward the reveal, fresco grain, and faint gilded stars in the upper field (12 behind the crucifix, 22 in the shrines). Drawn in metres on the niche, so clouds stay round | `interior-finish.js` |
| Altar | The pale stone altar stays (owner, 3 November 2026). A two-step bed moulding with a gilded bead under the mensa overhang, a two-step base moulding over the foot, the cloth falling 0.42 m over both ends, and a gilded embroidered border on all four falls | `interior-finish.js` |
| Sanctuary chairs | Arms with gilded knobs, a gilded frame round the upholstered back, a carved arched crest with gilded finials, and a gilded cross on the presider's crest. Seats, backs, legs and footprints are unchanged; the crest adds 0.20 m (presider) and 0.11 m (other chair) | `interior-finish.js` |
| Statue pedestals | Red lacquer with gilded base and cornice mouldings and a gilded frame and rosette on each face, in place of plain marble. Same 1.0 m height, 0.62 m top and 0.7 m footprint | `simulator/catalog.js` |
| Roof lining panels | Every one of the 546 panels between purlins and fillets carries a fine leaf-gilt bead 0.07 m in from its edges; the rosettes on alternate panels (274) are larger (0.10 m) and sit on a red lacquer roundel (0.15 m) with a gilded ring, so they read from the floor | `interior-finish.js` |

## Display pass

`display-finish.js` draws the scene once into a floating-point picture with its depth, then applies three steps on the way to the screen.

- **Contact shading.** For each visible point, six directions are searched in six steps for the highest surface within reach above the point's own plane. Reach 0.9 m, strength 1.2, darkest multiplier 0.4, fading out between 45 and 90 m from the eye. It is applied after the tone curve, so a crease reads on bright stone as well as on dark timber.
- **Highlight roll-off.** Above a knee (scene radiance 0.4 in the evening, 1.0 by day) luminance is compressed toward knee + range (0.8 evening, 2.2 day) with the hue kept. The simulator's exposure setting (`adaptLux`, 160 lux) and the tone curve are unchanged.
- **Glow.** Radiance above 4.0 (evening) or 1.5 (day) spreads softly at strength 0.30 / 0.22.
- **Haze.** Distant surfaces drift toward a warm veil in the evening (strength 0.10) and a pale one by day (0.05), half reached at 55 m from the eye. The sky seen through doors is untouched.

It is off with `?graphics=light` or `?finish=off`, for orthographic drawing views, and when the browser cannot draw to a floating-point target; any error switches it off and the plain picture continues. On the development machine (Apple M1 Pro, 1600 × 900, evening nave) one frame took 146 ms without and 156 ms with the pass in headless Chrome: about 7 % more.

## Limits and what remains

- **Not a lighting result.** Contact shading, roll-off, glow and the daylight term act on pixels and display shading. They are not shadows cast by lamps, not a daylight calculation and not lux. The porches shade the side openings; the daylight gain was set by eye. Lamp light still casts shadows only from the fittings that already did.
- **Screen-space shading** cannot see what is hidden from the eye, so shading changes slightly as the view moves and is weak where a surface is seen edge-on.
- **Ornament proxies.** Skirting, cornice, fillets, beads, roundels, rosettes, altar mouldings and cloth, chair arms and crests, pedestal mouldings, lamp and stoups have no fixing, substrate, section, weight, fire or maintenance design. The cornice sits between the station finials (+6.70) and the wall purlin's soffit (+6.96): a tight zone to confirm with the roof and electrical routes. Stone, lacquer, gilding and joinery are display finishes, not selected products or measured reflectances.
- **Fittings.** Fan colours are display finishes; product finish availability is unconfirmed. Fans and their rods remain visible: concealment stays an open engineering item ([central view](engineering/central-view-constraint.md)). Exit-sign faces are unchanged.
- **Sanctuary lamp and stoups** are proposals for the parish to accept, move or omit. The lamp is a wax or oil lamp, not an electrical fitting, and appears in no register.
- **Not done in this revision:** a dado on the side walls (the window sills at +0.65 and the doors leave no continuous band). The blue niche fields keep the approved concept's blues; the painted clouds and stars are a display interpretation for the artist to confirm or replace. The presider's chair crest is not in the seat sightline study; it stands at the side of the sanctuary, away from the lines to the altar and the crucifix. The banner folds keep the same outline and fixture envelope. Statues, shrine doors and fine sanctuary sculpture remain as in the [sanctuary record](sanctuary-model.md#limits).
- **Engineering holds** and the unmet lighting, sound and ventilation targets are unchanged.

## Documents and exports checked

[Finishes](decoration-finishes.md), [sanctuary](sanctuary-model.md), [renderings](church-view-renderings.md), [simulator limits](simulator/methods-and-limitations.md), [performance](simulator/performance.md), [public viewer](web/viewer.md), [central view](engineering/central-view-constraint.md), [hidden fittings](engineering/hidden-fittings.md), [register workflow](electrical-grid/register.md) and the [category index](electrical-grid/categories/README.md). No equipment ID, type, position, aim, load, circuit, route or control changed, so the category registers, the quantity summary and the plan and electrical exports encode no changed field and were not regenerated.

## Checks

Recorded in the [first review folder](../review/interior-finish-2026-11-10/README.md) and, for the second pass, the [sanctuary and ceiling folder](../review/sanctuary-ceiling-2026-11-10/README.md).

## Material depth and carved ornament · 18–19 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.** The appearance study follows the existing red lacquer, gilt timber, ivory stone and blue sanctuary palette. The [desktop review](../review/material-depth-2026-11-19/README.md) compares the same model views before and after.

| Part | Visual development | Model source |
| --- | --- | --- |
| Lacquer and gilding | A fixed daylight panorama places reflections at the nave window bays. Glossier lacquer retains its oxblood base, and satin lacquer stays on broad boards and the crucifix. Evening uses the viewer's existing environment. | `interior-finish.js` |
| Timber columns | Burnished beads fit in the turned feet. The two axis-10 columns carry five repeats of a climbing lotus on the nave-facing side, between the existing bands at +3.05 and +7.95 m. The foliage follows the current tapered shafts. Palmettes, fine gilt veins and rolled haunch tips give the beam junctions more legible layers. | `sanctuary.js`, `carving.js`, `simulator/engine.js` |
| Altar | Two raised pale-stone foliate sprays sit on a warmer honed inset. The four linen falls have pinned tops, loose folds and a woven gilt-vine border. | `sanctuary.js`, `interior-finish.js` |
| Sanctuary recesses | The blue fields behind the crucifix and two shrine statues use separate crops of one painted sky. The viewer embeds a reduced WebP for offline use and retains the procedural sky while the artwork decodes. The preserved original, exact generation prompt and export details are recorded with the artwork. | [Sky artwork and provenance](../Thach_Bi_Viewer/references/02-sanctuary/sky-study/provenance.json) |
| Exterior | Cut-stone bedding, a more oblique display sun, and thin high cloud help the moulding relief read. The three statue niches now show inward-facing, fluted hoods. Raised stone fills the enclosed lobes of the drawn T12 spandrel sprays. | [Façade record](facade-model.md#stone-finish-and-relief--1819-november-2026) |

The reflections are a fixed display approximation from axis 6. The reflected windows repeat across materials and do not track viewer position, shutters or real daylight. The artist and architect still need to review lacquer sheen, leafing, mural crops and the carved profiles at full scale. Source dimensions, analytical reflectances and light outputs follow the existing project inputs. Structural member, fixing, fire and maintenance reviews remain on engineering hold. Fan concealment remains an open design item. [Central view constraint](engineering/central-view-constraint.md)

## Façade contact shading · 19 November 2026

The contact pass now fetches depth and reconstructs the eye-space position at the same integer texel. This matters when half-resolution contact pixels land between full-resolution depth samples. Previously, a mismatch could make a flat wall appear tilted and shade it as if it had a raised neighbour. Depth differences at real joints still produce contact shading.

Contact reach is 0.18 m and the blur samples within 0.09 m along each axis. Strength is 0.75 and the darkest multiplier is 0.72. The shorter reach and world-space blur keep shade close to raised work and mouldings. The far-distance fade, highlight roll-off, glow, haze and base lighting use their previous settings. This is the same display pass in the local and public viewers. Geometry, fixture schedules and analytical lighting inputs carry no changed fields. [Day and evening review](../review/facade-contact-2026-11-19/README.md)

## Nave, entrance and sanctuary walls · 20 November 2026

The nave-facing walls, entrance wall, sanctuary spandrel and sanctuary back wall have a light yellow-cream paint tint (#f4e4bd). The mineral-finished nave columns match. The exterior elevations retain the cream-grey stone palette. On 21 November the owner extended the nave cream across both verandas, including the inner walls, column bases, arch mouldings and soffits. [Veranda finish](decoration-finishes.md#veranda-columns-and-overhead-plaster--21-november-2026) The lacquer, devotional artwork and gilding retain their own finishes. In the display pass, paired sample directions and a blur reach of 0.036 m per axis reduce uneven gray shading beside narrow relief. [Interior comparison and finish basis](../review/wall-stone-2026-11-20/README.md)

## Sanctuary furnishings · 20 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.** This is the first stage of building work under the [design excellence programme](design-excellence.md). The altar, ambo and credence were the most important objects in the church, yet they were still simple shapes. They now carry the sanctuary's own pale stone, red lacquer and gilt vocabulary. The departures are DX-01 to DX-04 in the programme's register. [Desktop before and after](../review/sanctuary-furnishings-2026-11-20/README.md)

| Part | Visual development | Unchanged |
| --- | --- | --- |
| Altar (DX-01) | The base, mensa, foot and both mouldings are polished pale marble with soft veining, mapped at one world scale on every face. Four engaged red-marble colonnettes stand at the corners, with gilded bases, capitals and leaves, below the gilded bead. Gilded frames and a rosette are on the two end faces. | Pale stone kept by the owner on 3 Nov 2026. The honed front field, its foliate sprays, gilt cross and fillet, the linen and the footprint are unchanged. |
| Ambo (DX-02) | The foot and the hexagonal pedestal are the same marble, with gilded bands at the top and bottom. A green silk damask fall for Ordinary Time hangs 0.36 m from the nave edge of the desk. It has a gold galloon border, an embroidered cross, a gilded cord and a bullion fringe. | The pedestal geometry, the concealed microphone passage, the microphone, the cross, the position and the sight-line target are unchanged. The fall stays clear of the microphone socket. |
| Credence (DX-03) | The two stone posts are replaced by four turned red-lacquer legs with gilded collars. The table also has a lacquered apron with gilded fillets and rosettes, and a lower shelf with a gilded edge. On the linen are a chalice with paten and pall, a purificator, a ciborium, two glass cruets (water and wine) on a gilded tray, a lavabo bowl and a towel. | The top, the linen cloth, the footprint and the navigation box are unchanged. |
| Altar candlesticks (DX-04) | The six altar candles stand on turned brass candlesticks 0.24 m high, so each candle, cup and flame rises by that height. | The positions in plan are unchanged. The two tabernacle candles are not altered. |

All parts live in `Thach_Bi_Viewer/sanctuary-furnishings.js`, which loads after `interior-finish.js`. They are display finishes and ornament proxies. They do not define a stone, lacquer system, metal, fabric, weight, fixing or product. Open flames on the altar need the parish's fire safety review. The ambo fall shows green by default. The colour of the season, and whether the parish uses a fall at all, is question 3 in the programme.

No simulator equipment ID, type, position, aim, load, circuit, route or control changed, so the category registers, the quantity summary and the electrical exports were not regenerated. The furnishings are bundle display parts, not simulator fixtures. The documents checked were [design excellence](design-excellence.md), [sanctuary model](sanctuary-model.md), [decoration finishes](decoration-finishes.md), the [register procedure](electrical-grid/register.md) and the [public viewer contract](web/viewer.md).

## Roof hidden · 21 November 2026

With the roof hidden, the roof-lining ornament (fillets, gilded beads, lacquer roundels and rosettes) floated in the air, and the 14 side beams from the columns to the wall piers disappeared. The lining ornament now belongs to the roof assembly and hides with the lining. The side beams, with their carving and truss posts, now belong to the frame and stay visible (`interior-finish.js`, `simulator/engine.js`). Nothing moved or changed shape. [Before and after](../review/roof-off-2026-11-21/README.md)
