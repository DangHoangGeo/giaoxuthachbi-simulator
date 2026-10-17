# Vietnamese / English display language · 18 October 2026

Branch `web/11-vi-en-language`, cut from `eng/13-split-exhaust-circuit` (f716aaa). Not pushed.
Scratch origin used for all browser checks: `http://127.0.0.1:8765` (desktop, 1280 × 800). The owner's `localhost:8765` was not touched.

## Screenshots

| File | What it shows |
| --- | --- |
| `01-explore-vi-simulator-open.jpg` | Normal viewer, Vietnamese (default), simulator panel open. Status bar, tabs, scene list and meters in Vietnamese. |
| `02-explore-en-simulator-open.jpg` | Same page after the header switch is set to EN: everything returns to English. |
| `03-visit-vi.jpg` | `OPEN_CHURCH.html?visit&lang=vi`: visit-only mode, Simulator button hidden, VI | EN switch shown, notice kept bilingual on purpose. |
| `04-visit-en.jpg` | `OPEN_CHURCH.html?visit&lang=en`: the same visit in English. |

Known residue in these shots: equipment and catalogue names in the simulator (for example "Reading light · axis 3 · B central") are still English, by design (see below).

## Checks run

- `node scripts/verify_model.cjs`: pass.
- `node scripts/verify_cinematic.cjs`: pass.
- `node scripts/verify_construction.cjs`: pass.
- `node scripts/verify_simulator.cjs`: fails with the same first assertion as the baseline before this work (ambo/altar feedback margins 0.9 / 1.3 dB, and seats below 200 lux). Unchanged.
- `node scripts/verify_simulator.cjs --electrical`: pass (373 routes, 317 installed components).
- `node scripts/verify_simulator.cjs --report --estimates`: exit 0; report printed, unmet design targets as before.
- Web (in `web/`, Node 22.22.2, `npm_config_engine_strict=false`): `prepare-viewer`, `check:viewer`, lint, typecheck, unit tests, build, Playwright (`PLAYWRIGHT_CHANNEL=chrome`) and the gallery config: all pass.
- Browser, scratch origin: the browser pane's console showed no errors during these checks (normal and `?visit` pages, both languages). The site view's VI | EN and the header switch update each other.

## Still in one language or English

- Simulator equipment and catalogue item names, circuit descriptions in list rows composed from values, and the long engineering prose in the Wiring and installation-review panels.
- Composed review notices (wing and nave review adoption messages) and some detail sentences built from numbers in the Analysis tab.
- The planning brief (`planning/index.html`) and its sources.
- Owner content in `web/content/release.json` (captions and alt text already bilingual; the `attribution` line is one mixed string and is shown as stored).
