# Façade grandeur, first pass · 20 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công · CONCEPT.**

The owner found the front still too flat. This pass changes depth, light and tone only. Every measure is recorded in the [programme](../../docs/design-excellence.md#façade-grandeur).

The before captures are `c3b9400`, served from a detached worktree. The after captures are the same commit with this pass. Both were rendered in headless desktop Chrome at 1600 × 900, in visit-only and presentation mode, through `church.render()`. The eleven Marian art textures on **PUBLICATION HOLD H8** were blanked during capture.

| View | Light | Camera X / Y / Z (m) | Target X / Y / Z (m) | Sheet |
| --- | --- | --- | --- | --- |
| Front from the courtyard | Day | −40 / 4 / −6 | 4 / 13 / 0 | [Front](compare-front.jpg) |
| Three-quarter view | Day | −38 / 6 / −40 | 6 / 14 / −2 | [Front](compare-front.jpg) |
| Front | Evening | −40 / 4 / −6 | 4 / 13 / 0 | [Front](compare-front.jpg) |
| Portal and spandrel leaves | Day | −6 / 2.2 / −3.5 | 2.2 / 6.5 / 0 | [Detail](compare-detail.jpg) |
| Central cornice and Greek key | Day | −4 / 6 / −4 | 2.3 / 9.3 / 0 | [Detail](compare-detail.jpg) |
| Tower stages | Day | −14 / 14 / −20 | 2 / 22 / −9 | [Detail](compare-detail.jpg) |
| Nave (control) | Day | 22 / 1.6 / 0 | 40 / 3.5 / 0 | [Nave](compare-nave-unchanged.jpg) |

What changed visibly: the portal leaves and capitals cast their own shadows, the central cornice throws a shadow line, the piers cast raking shadows across the portal wall, and the carving reads warmer than the wall. The evening view and the nave are effectively unchanged, as intended.

What is not done yet: archivolt orders inside the entrance arches, larger pinnacles with crockets, deeper louvre reveals, tracery seen from outside, and the rear elevation.

## Second pass: entrance archivolts

The before column is `443cc39` (the first pass); the after column adds the archivolt orders. The cameras are the central portal by day from (−7, 2.0, −5) looking at (2.2, 4.2, 0), the side portal by day from (−5, 1.8, −9) looking at (2.0, 3.8, −5.5), and the central portal in the evening from the same point as by day. [Comparison](compare-archivolts.jpg)

Each arch now steps back in four orders, 70 mm apart. The arch outlines in elevation and the clear openings are unchanged.

Crockets on the pinnacle crowns were rendered and rejected: the crowns are clusters of small spires, and the leaves floated between them. They are not in this revision.

## Pinnacle spires (DX-06)

The owner asked for the pinnacle crowns to be redrawn. The before column is the same build with `?crowns=drawn` (the traced E01B crown); the after column shows the crocketed spire. The cameras are the gable pier pinnacle up close from (−1.5, 18.6, −5) looking at (2.75, 19.4, −2.98), the tower corner pinnacles from (−6, 29, −16) looking at (2.4, 31, −10), and the gable by day from (−8, 16, −7) looking at (3, 19, 0). The wide views are the front by day and the gable and towers in the evening from (−30, 8, −14) looking at (3, 18, 0).

[Close comparison](compare-spires.jpg) · [Wide comparison](compare-spires-wide.jpg)

The base and apex of every pinnacle are unchanged. The crockets are small at courtyard distance; they read in the close and evening views.

## Triple window orders and tower louvres

The before column is `7bcd08b`; the after column steps the triple window's orders and sets the tower louvres at the back of the wall. The cameras are the triple window by day and in the evening from (−4, 10.2, −3) looking at (3.2, 11.6, 0), the tower louvres from (−5, 10.6, −14) looking at (0, 10.9, −10.15), and the tower stages from (−12, 14, −16) looking at (0, 15, −10). [Comparison](compare-window-louvres.jpg)

The louvres now sit in deep, shadowed reveals behind the traced tracery. The triple window's change is smaller: about 10 cm of added projection, which reads best in raking light.
