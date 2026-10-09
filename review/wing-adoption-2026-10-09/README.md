# Explicit wing lights/fans adoption review, 9 October 2026

Status: software/display verification passed; design remains ENGINEERING HOLD. This change does not alter default equipment positions, ratings, physics, thresholds, receivers or routes. The existing matched equipment/line schedules still describe those defaults.

The owner opens `Thach_Bi_Viewer/OPEN_CHURCH.html` directly. A saved old Weekday mode alone retains the old lights/roof fans under the conservative whole-wing comparison. The migration marker records history, not actual content. Wiring now shows each side’s actual visible equipment, mismatching IDs and a focused adoption action. Other simulator tabs link to it.

The explicit action changes only known B/H light/fan IDs. It preserves other equipment, custom scenes/settings, light ON/dim and entered notes. New fans use the held low/off mode; current sides are not actuated. It writes a full previous export first, saves the changed layout as one Undo transaction, and rolls back on failed current-layout persistence. ID conflicts block replacement. [Governing review](../../docs/engineering/wing-review.md#saved-layouts).

## Verification

- `node scripts/verify_wing_review.cjs review/wing-adoption-2026-10-09/headless`: 170 conservative migration cases, stable IDs, exact imports, fixture/electrical coherence, Undo/Redo.
- `HEADED=1 node scripts/verify_wing_adoption_browser.cjs`: actual isolated desktop Chrome, B/H actions/backups, unrelated/custom preservation, notes and light overrides, route endpoints, Undo/Redo, no-op current sides, exact reload, blocked backup/save and reserved-ID conflict. [Raw results and source fingerprints](results.json): zero browser errors; existing Canvas2D performance advisories remain. Root inspected all six day/evening frames. This test never uses the owner’s browser profile.
- Model verification and independent estimates passed. [Full calculation audit](calculation-audit.txt) passed with existing design failures retained: wing speech/feedback, low-speed air and fan noise, lighting sensitivity, concealment and product/structure/electrical holds are not resolved by a UI update.
- `git diff --check` passed. Default records remain exact in the headless preservation check; no default quantity/route update is required for this action-only change.

The archived heading-case test-harness failure predates the final pass: CSS capitalizes H3 rendered text. The test was corrected to compare case-insensitively; model/API assertions were not weakened. The in-app browser cannot open `file:` URLs. Desktop evidence comes from the repository’s isolated regression test and its screenshots.

Screenshots establish actual GPU rendering and readable controls only. They do not approve performance, concealment, fixings, construction or purchase.
