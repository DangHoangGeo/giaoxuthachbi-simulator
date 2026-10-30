# Surrounding landscape review · 30 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

Desktop visit-only views of the [daylight](day.jpg), [roof detail](roof-detail.jpg) and [evening](evening.jpg) model, using the fresh local origin and updated script-version URLs. The lawn and tree-bed soil are illustrative, not a surveyed site, grading, planting or drainage plan. The forecourt and modeled side approaches remain visually unplanted; this is not an access compliance check. See the [finish record](../../docs/decoration-finishes.md) for locations and limits. The existing landscape switch was checked on/off, and its English and Vietnamese labels were inspected. No console errors were observed in the session.

The images use `a37f357` plus the landscape changes and the existing uncommitted working tree. Entrance-wall and simulator changes were already in progress; the commit alone cannot reproduce the full scene. SHA-256 at capture:

| File | SHA-256 |
| --- | --- |
| `Thach_Bi_Viewer/OPEN_CHURCH.html` | `fc11926352d91f6b3df0b003e003c280fadf2f47660ce4091a183e53652cb490` |
| `Thach_Bi_Viewer/i18n-vi.js` | `d2cfe6d1c618350857ad71693a9a843f6b93a9143e00deca27603b0dd752b2b2` |
| `Thach_Bi_Viewer/realism.js` | `c17b677321be6cafa22c187f76071eb9435fcce3b4ba72526d0f36e2c3564834` |
| `Thach_Bi_Viewer/roofline.js` | `8d4f111c16e81a0a0f6a9122933f33218c4dab345cc35e9a69c27036e9107dbf` |
| `Thach_Bi_Viewer/facade.js` | `8fcedea771123edb0cd917d371e8aa8f2020af6ca7cca4493287c85a3867507c` |
| `Thach_Bi_Viewer/simulator/design.js` | `bea15fbf1d241adeaf28ef91a513b14975a01f26a9275a10f43f5ca946983f52` |

`verify_landscape.cjs`, `verify_model.cjs --plan`, `verify_simulator.cjs --report --estimates`, texture policy, website viewer-copy, lint, type and unit checks passed. The calculation audit retains unmet targets: 87% of seats reach 200 lux, wing minimum lighting is 97 lux, wing STI is 0.411 minimum / 0.486 average, feedback margins are 0.9 / 1.4 dB, and estimated exhaust ventilation is about 3.5 ACH versus the model's 4–6 comfort target. These checks and modeled estimates are not approval of the landscape, lighting or building.
