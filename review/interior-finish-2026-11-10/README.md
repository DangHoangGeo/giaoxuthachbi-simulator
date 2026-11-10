# Interior finish and display study · after captures · 10 November 2026

**ACTUAL MODEL SCREENSHOTS · CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

These twelve captures show the viewer after the [interior finish study](../../docs/interior-finish.md), in the same six views as the [baseline](../interior-baseline-2026-11-10/README.md). Owner review of the appearance is pending: the owner asked for the changes to be made first and looked at together afterwards.

## Captures

Source: the commit that adds this folder, **plus the owner's uncommitted `entrance-approach.js`, `viewer.css` and the two unrelated hunks of `OPEN_CHURCH.html`**. Visit-only mode (`OPEN_CHURCH.html?visit`), presentation mode, drawn frame, four pew blocks, walking camera at 1.60 m, canvas rendered at 1600 × 900, JPEG quality 0.9.

| View | X, Z (m) | Yaw, pitch (rad) | Day | Evening |
| --- | --- | --- | --- | --- |
| Entrance toward the altar | 3, 0 | 0, 0.03 | [day](01-entrance-to-altar-day.jpg) | [evening](01-entrance-to-altar-evening.jpg) |
| Mid-nave | 22, 0 | 0, 0.05 | [day](02-mid-nave-day.jpg) | [evening](02-mid-nave-evening.jpg) |
| Sanctuary | 37, 0 | 0, 0.07 | [day](03-sanctuary-day.jpg) | [evening](03-sanctuary-evening.jpg) |
| Side aisle (B side) | 10, −4.5 | 0, 0.03 | [day](04-side-aisle-day.jpg) | [evening](04-side-aisle-evening.jpg) |
| Ceiling and trusses | 18, 0 | 0, 0.80 | [day](05-ceiling-trusses-day.jpg) | [evening](05-ceiling-trusses-evening.jpg) |
| Back toward the entrance | 35, 0 | π, 0.045 | [day](06-back-to-entrance-day.jpg) | [evening](06-back-to-entrance-evening.jpg) |

**The two sets are not pixel-comparable.** The baseline was taken in the desktop app's browser pane; these were taken in headless Chrome (ANGLE Metal, Apple M1 Pro) because the pane was in use. The walking camera's field of view follows the window, so these frames are wider (vertical field of view 42.6° at a 16:9 window; the baseline pane gave a narrower view). Positions and directions are the same. Doors and shutters are open in both lighting modes, as the walking camera opens them.

## Checks

- `node scripts/verify_model.cjs`: passed, with `interior-finish.js` loaded.
- `node scripts/verify_simulator.cjs --estimates`: passed as a calculation audit; the established unmet targets remain (ambo/altar feedback margin 0.9/1.4 dB, wing clarity minimum 0.410, average 0.484).
- **Before/after audit comparison:** `verify_simulator.cjs --report --estimates` run in clean checkouts of `0041619` (before) and `6d3739a` (after the first pass). The two outputs are identical except the build time: no lux, STI, air, noise, power, route or electrical figure changed. The second pass changes only display geometry and the display pass.
- `node scripts/build_equipment_register.mjs --verify-workflow`: passed; it re-stamped the generation date and re-packed the workbooks without any data change, so those files were restored rather than committed.
- `node scripts/verify_construction.cjs` and `node scripts/verify_cinematic.cjs`: passed.
- `web/`: `npm run build` passed and `tests/browser/visit.spec.ts` passed (4 tests, local Chrome).
- `web/`: `node scripts/prepare-viewer.mjs` and `npm run check:viewer` passed (98 files, exact inventory, bytes and hashes).
- Headless desktop inspection, day and evening, of the six views plus the entrance wall, the tabernacle and a side wall: the display pass reported active with no WebGL error; skirting, cornice, ceiling panels, stoups, sanctuary lamp, flowers and fan finishes were seen in place.
- Display pass cost, 1600 × 900 evening nave, headless: 146 ms per frame without, 156 ms with.
- `git diff --check` passed.

Not checked: GPU rendering on other machines, the website's gallery tests, and performance on weak hardware. Screen brightness is not lux; no lighting, sound or air result changed or was re-validated.
