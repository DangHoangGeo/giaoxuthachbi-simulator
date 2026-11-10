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
| 7 · Equipment dominates | Ceiling fan blades, canopy and rod take the roof-timber lacquer with an aged-brass motor; wall housings (fans, loudspeakers, sign bodies) take a warm ivory near the plaster | `simulator/catalog.js`, `simulator/engine.js` |
| 8 · Plastic timber | Column lacquer: an even deep red with faint brush drift and a stronger clear coat; pews and panels: fine straight joinery grain | `interior-finish.js` |
| 9 · Simple furnishings | Open five-petal blooms in every arrangement; turned paschal candle stand with drip pan; gilded fillet round the altar front; linen on the credence | `simulator/catalog.js`, `interior-finish.js` |
| 10 · Pedestals clash | Pedestal panels in deep red marble (were grey-green) | `interior-finish.js` |
| 11 · No atmosphere | Sanctuary lamp (red glass, flame) beside the tabernacle; two holy-water stoups by the centre door; brighter candle flames in the evening; banners hang in soft folds; a faint haze over distance | `interior-finish.js`, `simulator/catalog.js`, `display-finish.js` |
| 12 · Hard edges | Soft glow round lamps, flames and gilded highlights; fine noise against banding on plaster | `display-finish.js` |

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
- **Ornament proxies.** Skirting, cornice, fillets, rosettes, lamp and stoups have no fixing, substrate, section, weight, fire or maintenance design. The cornice sits between the station finials (+6.70) and the wall purlin's soffit (+6.96): a tight zone to confirm with the roof and electrical routes. Stone, lacquer, gilding and joinery are display finishes, not selected products or measured reflectances.
- **Fittings.** Fan and housing colours are display finishes; product finish availability is unconfirmed. Fans and their rods remain visible: concealment stays an open engineering item ([central view](engineering/central-view-constraint.md)). Exit-sign faces are unchanged.
- **Sanctuary lamp and stoups** are proposals for the parish to accept, move or omit. The lamp is a wax or oil lamp, not an electrical fitting, and appears in no register.
- **Not done in this revision:** a dado on the side walls (the window sills at +0.65 and the doors leave no continuous band), and any change to the blue niche fields, which follow the approved sanctuary concept. The banner folds keep the same outline and fixture envelope. Statues, shrine doors and fine sanctuary sculpture remain as in the [sanctuary record](sanctuary-model.md#limits).
- **Engineering holds** and the unmet lighting, sound and ventilation targets are unchanged.

## Documents and exports checked

[Finishes](decoration-finishes.md), [sanctuary](sanctuary-model.md), [renderings](church-view-renderings.md), [simulator limits](simulator/methods-and-limitations.md), [performance](simulator/performance.md), [public viewer](web/viewer.md), [central view](engineering/central-view-constraint.md), [hidden fittings](engineering/hidden-fittings.md), [register workflow](electrical-grid/register.md) and the [category index](electrical-grid/categories/README.md). No equipment ID, type, position, aim, load, circuit, route or control changed, so the category registers, the quantity summary and the plan and electrical exports encode no changed field and were not regenerated.

## Checks

Recorded in the [review folder](../review/interior-finish-2026-11-10/README.md).
