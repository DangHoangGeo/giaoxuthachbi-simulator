# Painted façade statues · 21 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner found the three façade statues too small, and Our Lady not yet lifelike, with no hair and no colour. They gave a painted image of the Assumption as the reference: a white robe, a blue mantle with a gold edge, a white veil over brown hair, a gold girdle, open arms and an upturned face. The figures are now larger and painted. The record is in [outlets and façade statues](../../docs/engineering/outlets-and-facade-statues.md#6-checks-results-and-what-remains).

| Sheet | Panels, left to right |
| --- | --- |
| [Assumption](assumption.jpg) | Before: ivory, 2.20 m (after the niche-column fix of the same day) · after: painted, 2.42 m, same camera · after: face and veil |
| [Saints and street views](saints-and-street.jpg) | Saint Peter · Saint Paul · façade from the courtyard, day · the same view in the evening |

[bounds-after.json](bounds-after.json) freezes the new catalogue envelopes in metres, in each figure's own frame. `scripts/verify_sculpture.cjs` checks the figures against it; the interior figures keep the October baseline.

## Capture

Desktop Chrome in the Claude app's browser pane, `OPEN_CHURCH.html?visit` on the `127.0.0.1` scratch origin with the recommended design. Frames were rendered at 1× with `church.render()` and then resized into these sheets. The cameras are:

| View | Position X, Y, Z (m) | Target X, Y, Z (m) | Vertical FOV |
| --- | --- | --- | --- |
| Assumption, frontal | −9, 18.2, 0.8 | 4, 17.8, 0 | 24° |
| Face and veil | −0.6, 19.0, 0.9 | 4.1, 18.8, −0.1 | 22° |
| Saint Peter | −4.5, 11.3, −4.9 | 4, 11.3, −5.35 | 26° |
| Saint Paul | −4.5, 11.3, 4.9 | 4, 11.3, 5.35 | 26° |
| Courtyard (day and evening) | −22, 9, 2 | 3, 15, 0 | 30° |

The figures are generated approximations for viewing distance, not a sculptor's model. No Marian artwork under publication hold H8 is in frame.
