# Roof finish desktop review · 30 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

**Evidence caution, later 30 October:** a later check found that this browser could reuse a cached `realism.js` when the script URL did not change. These original captures cannot establish that the revised tile texture was loaded, despite the source hashes below. A [later daylight roof detail](../grounds-2026-10-30/roof-detail.jpg) uses a fresh origin and versioned script URL; the historical images remain rather than being represented as definitive after-change evidence.

Desktop visit-only viewer, standard graphics, showing the local procedural tile finish in [daylight](day.jpg), [a closer daylight view](detail.jpg) and [evening](evening.jpg). The roof is much darker at night under the existing lighting; these images are visual checks, not illumination measurements. The image follows the project's concept appearance, not a selected tile or surveyed condition. No private reference drawing is included.

The screenshots and checks used `c88fc6d` plus the existing uncommitted working tree and this roof finish change; the commit alone does not reproduce the complete scenes. In particular, the entrance wall, simulator and electrical changes were already in progress and are outside this roof pass. At capture the SHA-256 hashes were:

| File | SHA-256 |
| --- | --- |
| `Thach_Bi_Viewer/realism.js` | `00a17084794a81d1533770c42e211fab7202e9abd4498e2c803b5cfc056da17a` |
| `Thach_Bi_Viewer/facade.js` | `8fcedea771123edb0cd917d371e8aa8f2020af6ca7cca4493287c85a3867507c` |
| `Thach_Bi_Viewer/simulator/design.js` | `bea15fbf1d241adeaf28ef91a513b14975a01f26a9275a10f43f5ca946983f52` |
| `Thach_Bi_Viewer/simulator/engine.js` | `fe0db981bce354b86009a2c3ddba47473748bab975442df73517dce958312f12` |

The [finish record](../../docs/decoration-finishes.md#roof-surface-follow-up--30-october-2026) describes the change, affected documentation and remaining engineering holds. Browser console reported no errors in the visited local and visit-only views. `verify_model.cjs`, `verify_texture_memory.cjs`, `verify_simulator.cjs --report --estimates`, website viewer-copy, unit, lint and type checks passed against the same working tree; these do not certify construction or resolve the known design targets. The calculation audit reported 87% of sampled seats at 200 lux, wing minimum 97 lux, wing STI minimum 0.411 and average 0.486, and microphone feedback margins of 0.9/1.4 dB. Estimated exhaust ventilation was about 3.5 ACH against the model's 4–6 comfort target. These are model estimates with the established limitations, not measurements or compliance decisions.
