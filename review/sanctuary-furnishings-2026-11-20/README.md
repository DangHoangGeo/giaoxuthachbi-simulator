# Sanctuary furnishings · 20 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công · CONCEPT.**

This folder records the first building stage of the [design excellence programme](../../docs/design-excellence.md): the altar, ambo, credence table and altar candlesticks (departures DX-01 to DX-04). See the [record of changes](../../docs/interior-finish.md#sanctuary-furnishings--20-november-2026).

## Captures

The before captures are `440b545`, served from the main checkout. That checkout also held the owner's uncommitted entrance-ramp study, which does not appear in these views. The after captures are the same commit with `sanctuary-furnishings.js`.

Both sets were rendered in headless desktop Chrome (Metal ANGLE) at 1600 × 900 and pixel ratio 1. The viewer ran in visit-only and presentation mode, with the default frame and four pew blocks, through the viewer's own `church.render()` export. The camera is the orbit camera with a 48° vertical field of view. Under **PUBLICATION HOLD H8**, the capture session blanked the eleven held Marian art textures (door reliefs, the M lunettes and the rose), so they show as plain stone. [Publication record](../../docs/open-source/publication-checklist.md)

| View | Light | Camera X / Y / Z (m) | Target X / Y / Z (m) | Comparison |
| --- | --- | --- | --- | --- |
| Altar | Day, evening | 40.9 / 1.55 / −0.9 | 44.2 / 1.45 / 0.1 | [Altar](compare-altar.jpg) |
| Ambo | Day | 38.9 / 1.65 / −1.0 | 41.25 / 1.55 / −2.6 | [Ambo and credence](compare-ambo-credence.jpg) |
| Credence table | Day | 45.3 / 1.55 / −0.3 | 46.15 / 1.45 / −2.6 | [Ambo and credence](compare-ambo-credence.jpg) |
| Sanctuary from the nave (V3) | Day, evening | 37 / 1.6 / 0 | 47 / 2.5 / 0 | [Sanctuary](compare-sanctuary.jpg) |

No render errors were reported in either run. The module reported 4 colonnettes, 6 candlesticks, 1 ambo, 1 credence table, 7 vessel parts and 8 new materials.

## What to look at

- **Altar.** The altar is still pale, as the owner asked on 3 November. It now reads as polished marble rather than plaster. The red colonnettes tie it to the columns and the reredos. The candlesticks lift the six candles into a proper altar set.
- **Ambo.** The green fall gives the ambo a liturgical role and a focus seen from the nave. In the evening the ambo key light paints it a lighter green. The colour is a display choice for the parish to confirm (question 3 in the programme).
- **Credence table.** The table now belongs to the red-and-gold furniture. The vessels are small but legible from the sanctuary. From the nave the table stays in the background behind the axis-10 column.

## Checks

See the commit message for the checks run on this revision and their results. These are software and visual checks only. They do not approve any stone, metal, fabric, fixing, weight or open flame.
