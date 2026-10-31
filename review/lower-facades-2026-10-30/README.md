# Lower exterior façades · 30 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The [design record](../../docs/exterior-23102026/rear-and-roofline.md) gives the CAD handles, model coordinates, departures and unresolved issues. Desktop visit-only review with landscape hidden to expose the walls: [B side](side-b-day.jpg), [H side](side-h-day.jpg), [sanctuary end](rear-day.jpg), [front/overall](front-day.jpg), [rear oblique day](rear-oblique-day.jpg) and [rear oblique evening](rear-oblique-evening.jpg). These are model views, not the source drawing or proof that all sculptural detail matches it. The rear is dark in the existing evening scene; neither the appearance nor this review validates lighting performance.

The images use `3e7afea` plus this lower-façade change and the pre-existing uncommitted working tree, which includes the entrance-wall and simulator/electrical revisions. The commit alone cannot reproduce the full scene. Script URLs were versioned to avoid the cache issue noted in the earlier roof review. SHA-256 at capture:

| File | SHA-256 |
| --- | --- |
| `Thach_Bi_Viewer/OPEN_CHURCH.html` | `b60ea4394c49eff6db80d91fc1faaa3a1c24f2ffec3b33afaaef0b340dc28f5d` |
| `Thach_Bi_Viewer/roofline.js` | `d2490e1b48aea21508a3e7aa411d2dea728c0eca1ff94561c0f1dc2a7132c551` |
| `Thach_Bi_Viewer/realism.js` | `c17b677321be6cafa22c187f76071eb9435fcce3b4ba72526d0f36e2c3564834` |
| `Thach_Bi_Viewer/facade.js` | `8fcedea771123edb0cd917d371e8aa8f2020af6ca7cca4493287c85a3867507c` |
| `Thach_Bi_Viewer/simulator/design.js` | `bea15fbf1d241adeaf28ef91a513b14975a01f26a9275a10f43f5ca946983f52` |
| `Thach_Bi_Viewer/simulator/engine.js` | `fe0db981bce354b86009a2c3ddba47473748bab975442df73517dce958312f12` |

Twenty CAD line witnesses were reread from the local conversion; the native CAD unit conflict remains open. The assembled-mesh check covers the eight new shafts, their openings and plinth footprints, and screens 409 fixture AABBs and 429 route centrelines against their envelopes with no intersections. This is not a screen of cable diameters, attachment, lamp beams, maintenance access, drainage, weather protection or load capacity. `verify_model.cjs --plan`, the exterior-source geometry check, roof-end, electrical and cinematic checks, website viewer-copy and `verify_simulator.cjs --report --estimates` passed. The calculation audit still reports 87% of seats at 200 lux, 97 lux minimum in the wings, wing STI 0.411 minimum / 0.486 average and 0.9 / 1.4 dB microphone feedback margins; exhaust ventilation was estimated at about 3.5 ACH against the model's 4–6 target. These are estimates, not measurements or approval. No console errors were observed in local or visit-only views.

The exterior and full calculation checks started before final metadata-only changes that distinguish the conceptual pedestal from the traced shaft and update the model revision and assumptions; geometry and analysis inputs did not change afterward. The model/plan and dedicated pilaster/fixture/route checks were rerun after those changes.
