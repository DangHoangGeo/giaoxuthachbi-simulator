# Review evidence · loudspeaker separation, routing revision `2026-10-18-concealed-2` · 18 October 2026

Evidence for the [routing change](../../docs/electrical-grid/routing.md#loudspeaker-separation--routing-revision-2026-10-18-concealed-2--18-october-2026) on branch `eng/12-electrical-review`. Status: **CONCEPT / ENGINEERING HOLD**. Route centre lines in the routing study, not a containment or installation design.

## What changed

`Thach_Bi_Viewer/simulator/electrical.js`: loudspeaker bands step down from +5.55 m instead of up with the circuit's position in the list (they had reached +5.69–5.73 m, 0.17–0.21 m below the +5.90 m lighting band), and loudspeaker home runs from AV-1 rise on the H side of the niche (Z +2.24 / rear wall Z +3.30) instead of on the mains riser line (Z −2.24 / −3.30). Mains routes, equipment, IDs and circuits are unchanged. Script version in `OPEN_CHURCH.html`: `electrical.js?v=20261018-audio-band-1`.

## Pictures

Simulator → Wiring → Systems only, default layout on the scratch origin `127.0.0.1:8765` (not the owner's saved layout), desktop pane 720 × 450 canvas. Line thickness is a display convention.

| File | Content |
| --- | --- |
| [nave-wall-band-side-b.jpg](nave-wall-band-side-b.jpg) | Side-B wall band from inside the nave near axis 6: DB-2 feeder (red) and the mains stack (amber lighting, brown fans, teal sockets) above; the loudspeaker band (blue) now runs separately below. Compare picture 04 of the [9 October walk-round](../electrical-safety-2026-10-09/README.md). |
| [service-room-rear-wall-risers.jpg](service-room-rear-wall-risers.jpg) | Service room from the sanctuary side: mains and the DB-2 feeder rise on side B (left), the loudspeaker home runs on side H (right); they cross once on the rear wall. |

## Results

| Quantity | Before | After |
| --- | ---: | ---: |
| Loudspeaker route within 0.30 m of a mains route | 632 m of 720 m | 254 m of 700 m |
| Of which on the same line (within 0.05 m) | 262 m | 188 m |
| In the shared raceway over the 9–10 wing bay | not separated | 80 m |
| Drawn route length, all routes | 5,008.066 m | 4,987.773 m |
| Complete loudspeaker home runs | 1,790.080 m | 1,716.603 m |
| Routes / vertices | 370 / 2,928 | 370 / 2,928 (34 loudspeaker routes changed) |

Separation sampled every 0.25 m by `scripts/build_electrical_safety_review.py` from the exported centre lines.

## Checks

| Command | Result |
| --- | --- |
| `node scripts/verify_simulator.cjs --electrical --export-electrical` | passed: 317 components, 370 routes; concealed-routing checks passed |
| `node scripts/build_equipment_register.mjs --verify-workflow` | passed: 359 current records, 370 routes, 2,928 vertices; 10 retired equipment and 21 retired routes kept |
| `python3 scripts/build_electrical_safety_review.py` and `--check` | built; matches the model |
| `node scripts/verify_simulator.cjs --report --estimates` | calculation checks passed; unmet design targets unchanged from 9 October: feedback margins 0.9 / 1.3 dB, 11 % of seats below 200 lux, 65 % of seats at STI ≥ 0.60 |
| `web/`: `node scripts/prepare-viewer.mjs`, `npm run check:viewer` | passed: exact inventory, bytes, hash |
| Desktop viewer, `?r=1018` and `?visit&r=1018` on `127.0.0.1:8765` | new revision loaded, Systems-only view inspected, visit-only mode starts; no console errors |

Not run: the web lint/typecheck/Playwright suites (no web source changed), `build_review_drawings.py` and `build_electrical_budget.py` (ReportLab not installed). The A3 drawings and `output/electrical-review/` remain stale and now also predate this routing revision.
