# Review evidence · exhaust ventilation in three circuits · 18 October 2026

Evidence for the [circuit split](../../docs/electrical-grid/routing.md#exhaust-ventilation-in-three-circuits--18-october-2026) on branch `eng/13-split-exhaust-circuit`, answering finding 9 of the [electrical walk-round](../../docs/electrical-grid/safety-efficiency-review.md). Status: **CONCEPT / ENGINEERING HOLD**. Simulator circuits and comparison screens, not a board, protection or cable design.

## What changed

The nine exhaust fans were one circuit V1. They are now V1 front gable (F252–F255), V2 wing gables (F256–F259) and V3 service room (F260). V2 and V3 are appended to `CIRCUITS` in `Thach_Bi_Viewer/simulator/engine.js`, so no existing band height moves; every quick mode gives them V1's value. Saved layouts are migrated once by `exhaustSplitRevision` `2026-10-18-exhaust-split-1` in `simulator/design.js`. Script versions in `OPEN_CHURCH.html`: `20261018-exhaust-split-1` (engine, design, electrical, ui) and `-2` (controls, cinematic tour).

## Browser checks

Desktop pane, 1280 × 800 viewport, scratch origin `127.0.0.1:8765` served from this worktree. The owner's `localhost:8765` layout was not opened.

- The scratch origin held a saved layout from before the split (354 items, all nine exhaust fans on V1, design version `2026-10-16-tower-board`). On load it was migrated once: F256–F259 → V2, F260 → V3, 354 items kept, backup `thachbi.simulator.v1.before-exhaust-split` written, revision saved. No console errors.
- A real click on the V3 breaker switched only F260 off; after a reload F260 stayed off (no second migration). The quick mode *Christmas & festivals* then set all three circuits to speed 2: V1 440 W, V2 440 W, V3 110 W. Each zone shows a 6 A comparison breaker.
- *Air* tour rehearsal: 3.5 air changes an hour on Low and 5.2 on Normal, 25,900 m³/h, the same as before the split.
- `OPEN_CHURCH.html?visit`: visit-only, Simulator not reachable, no console errors; the recommended design shows V1/V2/V3 and no visit-side backup is written.

| File | Content |
| --- | --- |
| [controls-db1-fans-rail.jpg](controls-db1-fans-rail.jpg) | Controls → DB-1, fans rail: V1, V2, V3 listed together between F2 and F5. |
| [air-tour-exhaust-panel.jpg](air-tour-exhaust-panel.jpg) | Fans and air tour, scene 5 *Exhaust fans: air changes*, step Normal: the live panel has one row per zone. |
| [sound-tour-fans-panel.jpg](sound-tour-fans-panel.jpg) | Sound tour, *Fan noise against speech*, step High: six rows, the most the panel takes. |

## Not verified

GPU rendering on other machines, the web build beyond `npm run check:viewer`, and any physical control. FC-1 channels, speed controls, protection and cables are not designed.
