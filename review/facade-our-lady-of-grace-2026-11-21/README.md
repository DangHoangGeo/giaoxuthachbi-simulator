# Our Lady of Grace on the globe · 21 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner found that the face and hair of the central façade statue, the Assumption, did not balance the body. They asked for the square pedestal to become the globe, so that Our Lady stands above the earth and can be larger. They then gave a painted statue of Our Lady of Grace as the reference and chose that subject. The record is in [outlets and façade statues](../../docs/engineering/outlets-and-facade-statues.md#5-more-realistic-statues) and the [façade model](../../docs/facade-model.md#central-niche-our-lady-of-grace-on-the-globe--21-november-2026).

| Sheet | Panels, left to right |
| --- | --- |
| [Our Lady of Grace](our-lady-of-grace.jpg) | Frontal, day · face and veil, day · frontal, evening |
| [Courtyard](courtyard.jpg) | Façade from the courtyard, day · the same view in the evening |

The view before this change is the middle panel of [the Assumption sheet](../facade-statues-2026-11-21/assumption.jpg).

[bounds-after.json](bounds-after.json) freezes the new catalogue envelope in metres, in the figure's own frame. `node scripts/verify_sculpture.cjs` checks it, and `--record` rewrites it after an intended change. The five other statues were checked byte-identical to `main` by geometry fingerprint.

## Capture

Desktop Chrome in the Claude app's browser pane, `OPEN_CHURCH.html?visit` on the `127.0.0.1` scratch origin. That origin's saved layout took the `facadeGraceRevision` migration. Frames were rendered at 1920 × 1200 with `church.render()`, with the page panels hidden, and then reduced into these sheets.

| View | Position X, Y, Z (m) | Target X, Y, Z (m) | Vertical FOV |
| --- | --- | --- | --- |
| Frontal (day and evening) | −9, 18.0, 0.8 | 4, 17.75, 0 | 24° |
| Face and veil | −0.4, 19.0, 0.8 | 4.1, 18.95, −0.1 | 18° |
| Courtyard (day and evening) | −22, 9, 2 | 3, 15, 0 | 30° |

The figure is a generated approximation for viewing distance, not a sculptor's model. No Marian artwork under publication hold H8 is in frame.
