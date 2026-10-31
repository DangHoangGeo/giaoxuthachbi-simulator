# Door-head signs and removal of nave sconces

25 October 2026. **In development / Đang phát triển. Not for construction / Không dùng để thi công.**

Owner direction recorded 25 October; final verification and local handover completed 26 October 2026 (Asia/Tokyo).

[Coordinated issue](../../docs/engineering/doorheads-and-sconces.md) records the owner's confirmation that “lights above hanging fans” means the fourteen wall sconces above the nave wall fans. Five E1 signs move below coloured glazing. Their IDs, generic case/output, direct DB-1 feed and maintained operation remain.

`baseline-layout.json` is the frozen preceding default model, not browser user storage. It includes the separate entrance-door working geometry. The isolated commit candidate excludes that unrelated work and derives its main sign from its own actual transom. Generated working files and the staged files can therefore differ in main-door coordinates, routes and fingerprints. No originals or other contributors' edits are discarded.

Run these commands from the repository root:

- `node scripts/verify_doorhead_signs.cjs`: actual case vertices, fixed-band/transom contact, clear glazing, both leaf states, 6 mm cable-envelope/glass screen, fourteen retired default sconces, preservation/idempotence and All off retaining five signs / 15 W. `sign-check.log` records the result.
- `node scripts/verify_doorhead_reload.cjs`: real startup with synthetic in-memory storage, full backup, durable revision, deletion on second reload and rollback after rejected save. The synthetic save warning in `reload-check.log` is expected. No browser engineering storage is accessed.
- `node scripts/review_doorhead_lighting.cjs`: same original 368 receivers, both seating layouts and Full service · evening; no target/output/physics change. `lighting-comparison.json` / `.log` retain the before/after figures. The 126 W reduction worsens light minima and four-block coverage, as reported in the coordinated issue.
- `node scripts/verify_model.cjs`: `model-check.log`.
- `node scripts/verify_simulator.cjs --report --estimates`: `simulator-check.log`, with unmet design criteria retained.
- `node scripts/verify_simulator.cjs --electrical --export-electrical`: `electrical-export.log`, including concealed-route checks and matched default JSON/CSV exports.
- Bundled Node: `scripts/build_equipment_register.mjs --verify-workflow`: `register-check.log`; all six category books, retired records/keyed inputs, matched source hashes and formula/route-length checks. Lighting and exit-sign equipment rows were inspected and rendered before/after using the bundled spreadsheet runtime; four-sheet layout/styles retained.
- `python3 scripts/build_electrical_safety_review.py`: `safety-refresh.log`, conditional engineering screens only.
- In `web/`: viewer preparation, `npm run check:viewer` and `npm test -- viewer-files`: `web-check.log` / `web-unit.log`. Public visit remains read-only.

`staged-model.log`, `staged-sign-check.log`, `staged-electrical.log`, `staged-register.log`, `staged-simulator.log` and `staged-safety.log` check the disposable HEAD-based source snapshot and its own regenerated exports/books, excluding the prior door edits. `revisions.json` fingerprints both source configurations. These software/data checks cannot approve the physical sign product, viewing distance, luminance, pictogram, emergency supply/duration, clip strength or installation. Q14 and other engineering holds remain.

Desktop observation is still denied by the saved local-origin browser permission. This follow-up uses the owner's headless-verification/local-commit exception approved earlier in the same equipment-review session. No day/evening GPU, live console, visual sign-legibility or listening inspection is claimed. No alternate browser surface or indirect access bypasses that denial.
