# Open-porch lighting and nave-speaker review

25 October 2026. **In development / Đang phát triển. Not for construction / Không dùng để thi công.**

[Coordinated issue](../../docs/engineering/open-porch-light-sound.md) describes the owner's request, implemented defaults, stable IDs, routes, controls and remaining engineering holds. These are project-created model/calculation records, with no selected product data or personal parish information. No appearance, acoustic capacity or construction approval is claimed.

## Inputs and comparisons

- `baseline-layout.json`: frozen default layout before this review; not a user's browser storage. It includes the concurrent entrance-door working changes, which are preserved separately from this commit. `nave-height-study.json` records input-source hashes at the time of that comparison.
- `nave-height-study.json` / `.log`: five height/tilt cases on the original 368 indoor receivers. Baseline Y 3.45, −22°; four cases at Y 2.5, −8/−14/−20/−26°. Reproduce with `node scripts/review_nave_speaker_height.cjs`; the script reads and never replaces the before snapshot.
- `porch-comparison.json` / `.log`: before and selected −16 dB plus −15/−12/−9 dB porch gain alternatives. Each case retains the same 162 walking/ear probes and 108 arch-surface probes across B/H. The direct outdoor figures exclude reverberation and crowd/wind noise. The arch probes intersect actual mouldings, but lux uses existing simplified occluders rather than full ray-traced reflections. Reproduce with `node scripts/review_open_porches.cjs`.
- `sensitivity.json` / `.log`: Full service, Weekday Mass and courtyard overflow in both original seating layouts, with unchanged receivers/criteria. Reproduce with `node scripts/review_porch_sensitivity.cjs`.

All commands run from the repository root. Heights use metres above nave floor; porch floor −0.32 m, ear Y 0.88 m, direct floor-light plane Y −0.30 m. Generic catalogue optics/acoustics are comparison inputs, not manufacturer IES/LDT/directivity. Feedback, wing clarity, the porch 100-lux trial target and existing engineering/air/sightline holds remain open. Overflow feedback becomes negative in both seating layouts. The 2.5 m nave speaker reference leaves the tilted cabinet's lower edge at approximately 2.197 m.

## Checks

- `porch-check.log`: `node scripts/verify_open_porches.cjs` — counts, actual masonry mounting rays, fixture-envelope overlaps, lower edges, scoped matching, custom tuning/anchors/optics, deletion preservation and selective delay alignment.
- `reload-check.log`: `node scripts/verify_porch_reload.cjs` — actual startup with synthetic in-memory saved layouts; full backup, durable revision, reload/deletion preservation, backup rejection and final-save rollback. The two synthetic failure warnings are expected. No browser storage is read or changed.
- `model-check.log`: `node scripts/verify_model.cjs`.
- `simulator-check.log`: `node scripts/verify_simulator.cjs --report --estimates` — calculation/software audit with unmet design targets retained. Rehearsal restores derived microphone readouts; its exact state test settles the post-import calculation before taking its snapshot instead of relying only on a fixed delay.
- `electrical-export.log`: `node scripts/verify_simulator.cjs --electrical --export-electrical` — matched current-working-layout schedules and concealed-routing checks.
- `register-check.log`: bundled Node runs `scripts/build_equipment_register.mjs --verify-workflow` — all six category books, retired IDs, keyed entered fields, source hashes, formula/error and geometry-length reconciliation. Representative changed equipment rows were inspected/rendered using the bundled spreadsheet runtime; existing four-sheet layout and styling retained. Previously entered product/approval fields for the repurposed IDs were blank.
- `safety-refresh.log`: `python3 scripts/build_electrical_safety_review.py` — conditional electrical screens, not device or cable approval.
- `web-check.log` / `web-unit.log`: public viewer preparation, exact inventory/byte/hash check and `viewer-files` unit test. The same offline viewer is packaged with the visit-only entry. No browser visual or audio check is claimed.
- `cinematic-check.log`: `node scripts/verify_cinematic.cjs` — existing tour paths, scene/score definitions and technical captions against the stand-in model.
- `staged-model.log`, `staged-electrical.log`, `staged-register.log`, `staged-simulator.log`, `staged-safety.log`: disposable snapshot of the staged sources over HEAD, excluding the separate uncommitted entrance-door edits. Its own schedules and six books are regenerated from that source before staging. Current working exports/books retain the concurrent door changes. They can differ in entrance-related positions, routes and fingerprints. The safety exporter reads the original repository's Git revision via explicit `GIT_DIR`/`GIT_WORK_TREE`; no shared branch is changed.

The conservative migration keeps exact older entrance-wall defaults at their own X/Z while lowering them, so this issue does not adopt the other door revision. Known source hashes and the Git commit identify the applicable calculation revision; future changes require a new refresh.

## Desktop review

The local viewer is open, but CUA observation is denied by a saved permission for `http://127.0.0.1:8765`. A direct observation attempt on this pass returned that denial. No alternate surface or indirect browser access was used. Day/evening appearance, desktop controls, GPU lighting, console and listening review remain unverified. On 25 October 2026 the owner answered **“Authorize headless verification and local commit”** for this separate equipment pass. This records the explicit exception to AGENTS.md's desktop-review requirement; it does not establish visual, product, engineering or construction approval.
