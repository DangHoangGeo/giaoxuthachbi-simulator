# Wing review verification — 9 October 2026

The final [headless check](headless-results.json) passes 170 conservative migration cases. The final [desktop check](desktop/results.json), recorded at `2026-10-08T22:23:51.148Z`, passes the actual Chrome storage/import/history checks and 32 desktop frames with zero console or page errors. Both records fingerprint the tested source files and the frozen [322-item baseline](../baseline-layout.json). The [output manifest](manifest.json) fingerprints the evidence files.

Run from the repository root:

```sh
node scripts/verify_wing_review.cjs
PLAYWRIGHT_MODULE=$PWD/web/node_modules/playwright HEADED=1 node scripts/verify_wing_review_browser.cjs
```

The headless runner checks all original L63–L70/F240–F249 IDs, four appended F-WING IDs, exact unrelated equipment, full unchanged-wing import, actual cached fixture types, electrical route/type presence, input immutability, repeated idempotence and import undo/redo. Deleted, moved, renamed, retuned, hidden, switched, aimed, annotated or recircuited items preserve their affected whole wing. Each reserved appended-ID collision also preserves that whole wing. Customized optional nave fans retain their own records.

The browser runner uses the offline viewer in isolated temporary Chrome contexts. It checks a durable backup before startup migration, revision persistence, unchanged reload, actual UI layout download, file import, undo/redo, explicit edited-layout import, custom items/scenes/notes, a reserved-ID collision and refusal to migrate when backup storage fails. Every editable equipment field, setting and custom scene is compared. Only the export timestamp and analysis-derived microphone `feedbackMargin` are excluded from editable-layout comparisons; the original backup is also compared byte-for-byte across reloads. The controlled backup failure produces its expected warning. Chrome's Canvas2D readback performance advice is retained in the warning record.

The visual phase preserves all 326 equipment records, settings, scenes, equipment history and the complete electrical export. Instrumented editing/scene APIs receive no calls during the display actions. All 368 receivers remain, and each capture confirms that the completed analysis has the active seating coordinates. The eight chandeliers and eight wall-fan roots remain visible; all four wing roof fans are absent. The gable frames independently place the four actual fan centres in the camera frustum. [Inventory and preservation evidence](desktop/visual-inventory.json) records these checks. This original suite verifies F5 assignments and electrical export preservation; it does **not** click the F5 circuit filter or exercise FC-1 controls.

The parent task's separate [focused browser runner](check-f5-controls.cjs) passes the actual F5 selector → eight fans plus DB-1/FC-1 context → Controls F5 → Off → Low flow. Its [result](f5-controls.json) records zero browser errors and restoration of the original editable equipment state after Low. These are simulator controls; no physical FC-1 hardware was tested. Run this separate check with `node review/wing-options-2026-10-09/verification/check-f5-controls.cjs` from the repository root.

| Frames | Display coverage | Representative evidence |
| --- | --- | --- |
| 01–12 | Both wings; 1.10, 1.20 and 1.65 m eye heights above the actual −0.32 m wing floor; four seating blocks; roof on; day/evening | [B low](desktop/01-wing-B-eye-1.10-four-day.png), [H standing](desktop/12-wing-H-eye-1.65-four-evening.png) |
| 13–24 | Both wings; seated and overview with two blocks/roof open; gable with four blocks/roof on; day/evening | [B gable](desktop/14-wing-B-gable-four-day.png), [H gable](desktop/23-wing-H-gable-four-evening.png), [H overview](desktop/24-wing-H-overview-two-open-evening.png) |
| 25–32 | Entrance, sanctuary, choir and exterior; roof on; four blocks by day/two by evening | [Entrance](desktop/25-entrance-to-sanctuary-day.png), [sanctuary](desktop/28-sanctuary-to-nave-evening.png), [choir](desktop/29-choir-to-sanctuary-day.png), [exterior](desktop/31-exterior-wing-B-day.png) |

Every frame is 1600 × 1000 pixels from actual headed Chrome with the full preview drawing buffer. Camera coordinates, target, eye level, roof, seating, day/evening mode and fixture projection are recorded per frame. Overview cameras are display viewpoints, not occupied measurement planes. OrbitControls' numerical camera roundoff is bounded to `1e-10 m`; no geometry, physics or engineering acceptance threshold was changed.

Representative visual inspection shows the brass chandelier bodies, wall-fan guards and staggered fan heights. Pew backs obscure parts of the low wing views, columns obstruct parts of the choir view, and a foreground palm crosses the selected sanctuary view. Wider views still show exposed fans. Root visibility and centre-frustum tests do not establish full fixture visibility, unobstructed worship views or the owner's all-hidden fan requirement. Screenshots and footer KPIs are visual evidence, not a lighting, sound, ventilation, mounting or construction approval. The coordinated calculations and unresolved holds remain in [the owning wing review](../../../docs/engineering/wing-review.md).

[storage-results.json](desktop/storage-results.json) is the earlier storage-only result from before the final reserved-ID guard; use `desktop/results.json` for the final source. The [camera-roundoff archive](harness-development/camera-roundoff/README.md) retains an earlier strict-equality harness failure and is not an active viewer failure. The separate [frozen-baseline fan rerun](../fan-sweep/frozen-baseline-rerun/README.md) reproduces the historical 31 flat-height cases; it does not evaluate or approve the final staggered arrangement.

Documents checked for this test-only package: [AGENTS.md](../../../AGENTS.md), [fan brief](../../../docs/systems/fans.md), [lighting brief](../../../docs/systems/lighting.md), [central-view constraint](../../../docs/engineering/central-view-constraint.md), [simulator limitations](../../../docs/simulator/methods-and-limitations.md) and [wing review](../../../docs/engineering/wing-review.md). The runners change no primary model, physics, registers or exports. The parent task owns the coordinated source/document/export changes and their commit.
