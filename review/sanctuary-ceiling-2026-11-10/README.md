# Sanctuary and timber ceiling refinement · 10 November 2026

**ACTUAL MODEL SCREENSHOTS · CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

After reviewing the [interior finish study](../interior-finish-2026-11-10/README.md), the owner set the focus on the sanctuary and the timber ceiling. This pass is recorded in [docs/interior-finish.md](../../docs/interior-finish.md#second-pass--sanctuary-and-timber-ceiling). Owner review of the appearance is pending.

## Captures

Source: commit `f747341` (before) and the commit that adds this folder (after), each **plus the owner's uncommitted `entrance-approach.js`, `viewer.css` and the two unrelated hunks of `OPEN_CHURCH.html`**. Headless Chrome (ANGLE Metal, Apple M1 Pro), visit-only mode, presentation mode, walking camera at 1.60 m, canvas 1200 × 675, JPEG quality 0.9. Fans are all white in both sets.

| View | X, Z (m) | Yaw, pitch (rad) | Before | After |
| --- | --- | --- | --- | --- |
| Sanctuary from the front pews, evening | 38.5, 0 | 0, 0.12 | [before](before-01-sanctuary-evening.jpg) | [after](after-01-sanctuary-evening.jpg) |
| Side passage toward Our Lady's door, evening | 42, −2.5 | −0.9, 0.12 | [before](before-02-shrine-passage-evening.jpg) | [after](after-02-shrine-passage-evening.jpg) |
| Nave ceiling, evening | 14, 0 | 0, 0.55 | [before](before-03-ceiling-evening.jpg) | [after](after-03-ceiling-evening.jpg) |
| Ceiling and column head close up, evening | 18.2, −1.5 | −0.5, 0.75 | [before](before-04-ceiling-close-evening.jpg) | [after](after-04-ceiling-close-evening.jpg) |
| Altar top and reredos, evening | 42.2, −1.2 | 0.35, −0.05 | — | [after](after-05-altar-evening.jpg) |
| Presider's chair, evening | 43.6, 3.6 | −0.6, 0 | — | [after](after-06-presider-chair-evening.jpg) |
| Sanctuary from mid-nave, day | 30, 0 | 0, 0.10 | — | [after](after-07-sanctuary-day.jpg) |
| Nave ceiling, day | 14, 0 | 0, 0.55 | — | [after](after-08-ceiling-day.jpg) |

Points to look at: the column in the side-passage view no longer reads as a velvet curtain; the blue niches have painted clouds and, in the shrines, faint stars; the statue pedestals are red and gold; the altar cloth falls over both ends with a gilded border; the presider's chair has arms and a crest with a cross; every ceiling panel is framed with a gilded bead and alternate panels carry a red-and-gold roundel.

## Checks

- `node scripts/verify_model.cjs`: passed.
- `node scripts/verify_simulator.cjs --estimates`: passed as a calculation audit; the established unmet targets remain (ambo/altar feedback margin 0.9/1.4 dB).
- `web/`: `node scripts/prepare-viewer.mjs` and `npm run check:viewer` passed.
- Headless desktop inspection, day and evening, of the views above: display pass active, no WebGL error; 546 framed ceiling panels, 274 roundels, 2 painted niche skies, 1 altar and 2 chairs refined.
- `git diff --check` passed.

Not checked: GPU rendering on other machines, the website's gallery tests, and whether the crest of the presider's chair (0.20 m higher than before) crosses any sightline in the seat study; it stands at the side of the sanctuary, away from the lines to the altar and the crucifix. Screen brightness is not lux; no lighting, sound or air result changed.
