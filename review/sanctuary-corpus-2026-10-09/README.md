# Review evidence · carved corpus and red-and-gold sanctuary finishes · 9 October 2026

Evidence for the [sanctuary record](../../docs/sanctuary-model.md#carved-corpus-and-red-and-gold-finishes--9-october-2026). Source: branch `eng/11-outlets-facade-statues`, on top of `370d958`. These are viewer pictures and software checks of a design-development model, not approval of a sculpture, a finish or a fixing.

## Pictures

Taken in the local desktop viewer (`OPEN_CHURCH.html` served from `Thach_Bi_Viewer/`, standard graphics, as-drawn frame, recommended layout, 1280 × 800 view saved at 800 × 500). Use them to check form and composition. Screen colour is not a paint sample and screen brightness is not a lux value.

| File | Shows |
| --- | --- |
| [before-jointed-proxy-brown-cross.jpg](before-jointed-proxy-brown-cross.jpg) | Before: the jointed proxy figure on the brown cross. |
| [before-niche-boards-reading-brown.jpg](before-niche-boards-reading-brown.jpg) | Before the finish change, with the new figure: the niche boards and the cross read as brown wood beside the gilding. |
| [crucifix-day-carved-corpus-red-cross.jpg](crucifix-day-carved-corpus-red-cross.jpg) | After, by day: carved corpus, gilded cloth, red lacquer cross and niche boards. |
| [crucifix-evening.jpg](crucifix-evening.jpg) | After, evening lighting state (Full service · evening). The accents fall on a lighter cross than before; the balance was not retuned. |
| [sanctuary-day-red-and-gold.jpg](sanctuary-day-red-and-gold.jpg) | After, by day from the front of the nave: title board, red cross, red chairs. |
| [sanctuary-evening-red-and-gold.jpg](sanctuary-evening-red-and-gold.jpg) | The same view in the evening lighting state. |
| [altar-and-chairs-day.jpg](altar-and-chairs-day.jpg) | Altar, gilded emblem, chairs and flower stand. Taken before the satin red was toned by 0.84 and before the flower stands were changed: the chairs are a little brighter here than in the final source. |
| [detail-face-before-recolour.jpg](detail-face-before-recolour.jpg), [detail-hand-before-recolour.jpg](detail-hand-before-recolour.jpg), [detail-feet-before-recolour.jpg](detail-feet-before-recolour.jpg) | Close views of the carving. The figure is as in the final source except for a smaller ankle joint and thumb; the cross is still brown in these three. |

Not captured: the wings and shrines, views from the wing benches, the evening view with a night sky, and final close views with the red cross.

## Colour samples

Read from the rendered day view with `gl.readPixels` (9 × 9 pixel means, sRGB), camera at (38, 2.2, 0) looking at (47, 4.6, 0):

| Surface | R / G / B |
| --- | --- |
| Column 10/D shaft | 91 / 42 / 42 |
| Column 10/E shaft | 110 / 45 / 43 |
| Cross upright | 122 / 53 / 42 |
| Crossarm | 121 / 52 / 42 |
| Niche arch board | 109 / 60 / 36 |
| Base step (top lit) | 119 / 80 / 50 |

## Checks run on the final source

| Command | Result |
| --- | --- |
| `node scripts/verify_model.cjs` | passed, with new assertions: one carved corpus of more than 20,000 triangles on the face of the cross, proxy parts removed, hands at the crossarm and feet above the base, cloth/hair/nails/title finishes, satin red lacquer on cross, niche boards, base and furniture, and no brown joinery left between axis 10 and the niche |
| `node scripts/verify_estimates.cjs` | passed |
| `node scripts/verify_simulator.cjs --report --estimates` | calculation checks passed (including the carved-ornament clash check against fittings); unmet design targets unchanged: feedback margins 0.9 / 1.3 dB, 11 % of seats below 200 lux, 65 % of seats at STI ≥ 0.60 |
| `node scripts/verify_cinematic.cjs` | passed: 19 scenes, path, scene and score checks |
| `git diff --check` | clean |

Not run: the `*_browser` checks (Playwright is not installed on this machine). `verify_wing_revision`, `verify_wing_review` and `verify_wing_sound` still fail on their fixed 320-item inventory, as before this change.

Documents checked and left unchanged: `docs/systems/lighting.md` (no lamp or target changed), `docs/electrical-grid/*` and the six category registers (no equipment, circuit or route changed; the two flower stands keep their records and only change finish), `Thach_Bi_Viewer/planning/model-plan-data.js` (no seating or sightline target changed).
