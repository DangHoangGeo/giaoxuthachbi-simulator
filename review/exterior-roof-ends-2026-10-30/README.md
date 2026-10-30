# Wing and sanctuary-end roof review · 30 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The [coordinated record](../../docs/exterior-23102026/rear-and-roofline.md) explains the measured model overrun, the display-only clipping and remaining design questions. Desktop visit-only views: [B wing](side-b-day.jpg), [H wing](side-h-day.jpg), [sanctuary end by day](rear-day.jpg) and [by evening](rear-evening.jpg). Trees were turned off to expose the elevation. The remaining visible red roof behind the end parapets is not evidence that all intersections or roof detailing are solved. The lower wing and rear ornament remains simplified compared with the drawings. No third-party drawing is reproduced here.

The captures use `6106c38` plus this roof change and the pre-existing uncommitted working tree, which includes the entrance-wall, simulator and electrical revisions. The commit alone cannot reproduce the complete scene. Source hashes at capture:

| File | SHA-256 |
| --- | --- |
| `Thach_Bi_Viewer/roofline.js` | `8d4f111c16e81a0a0f6a9122933f33218c4dab345cc35e9a69c27036e9107dbf` |
| `Thach_Bi_Viewer/realism.js` | `00a17084794a81d1533770c42e211fab7202e9abd4498e2c803b5cfc056da17a` |
| `Thach_Bi_Viewer/facade.js` | `8fcedea771123edb0cd917d371e8aa8f2020af6ca7cca4493287c85a3867507c` |
| `Thach_Bi_Viewer/simulator/design.js` | `bea15fbf1d241adeaf28ef91a513b14975a01f26a9275a10f43f5ca946983f52` |
| `Thach_Bi_Viewer/simulator/engine.js` | `fe0db981bce354b86009a2c3ddba47473748bab975442df73517dce958312f12` |

Actual assembled roof endpoint checks, `verify_model.cjs --plan`, `verify_exterior_dwg.cjs`, `verify_simulator.cjs --electrical`, `verify_simulator.cjs --report --estimates` and `verify_cinematic.cjs` passed. The website viewer inventory/bytes check passed; its boundary check examined the existing build, not a new production build. No console errors were observed in the local and visit-only sessions. The calculation audit retains unmet targets: 87% of seats reach 200 lux, minimum wing lighting is 97 lux, wing STI is 0.411 minimum / 0.486 average, feedback margins are 0.9 / 1.4 dB, and the estimated exhaust ventilation is about 3.5 ACH against the model's 4–6 comfort target. Software checks and model estimates do not establish construction approval.
