# Door-head exit signs and removal of nave sconces

25 October 2026. **In development / Đang phát triển. Not for construction / Không dùng để thi công.**

The owner requested removal of the lights above the hanging fans, then explicitly confirmed **the wall sconces above the wall fans** (`USER CONFIRMED`, chat, 25 October 2026). The owner also requested the green exit boxes directly above the doors instead of above the coloured glass. This issue implements that appearance direction while retaining life-safety functions and unresolved engineering holds.

## Model and sources

- **L82–L95**, fourteen `Sconce · axis 3–9 · B/H` items, are removed from the recommended default. Their original allocation calls remain so no later ID shifts; the equipment and corresponding routes remain Retired in the category registers. No fan, reading projector, roof uplight, wing light or sanctuary chandelier is moved or removed. Existing fan-concealment and performance holds remain.
- **L156–L159**, the four side-door signs, keep their IDs/type/circuit/aim. Their centres move from +4.60 m to **+3.061 m**, at X 16.725 / 34.725, Z approximately ±7.440. The 170 mm-high case fits on the existing 220 mm fixed head band from Y 2.951 to 3.171, about 25 mm above the leaves and below the coloured glass. The case back meets the band's nave face. Source: `bundle.js` mesh **Inner door head band 220 mm**, with the corresponding **Exterior timber door leaf** and **Inner doorway coloured oval** meshes refined in `realism.js`, derived in world metres by `doorhead-review.js`. These are model transcriptions, not surveyed tolerances or selected-product dimensions.
- **L155**, the main-door sign, moves from +6.95 m to a centre at **+4.7625 m**. Its case top is +4.8475, below the central coloured fanlight bottom +4.900. A small inside-face clip reaches the actual **Entrance transom**; the case hangs below that rail and projects into the nave clear of the outward-opening leaves. It therefore occupies the upper doorway aperture, with its lower edge at about **+4.6775 m**. This is not a statement that the whole original aperture remains unobstructed. Source: `realism.js` entrance joinery and fanlight geometry, with `facade.js` applying the concurrent rear-pier door relocation in the working model. The clip's reach is 80 mm; its rise is derived from the actual rail. Fixing, strength, final product size and access remain **CONCEPT / ENGINEERING HOLD**.

The main sign is X approximately 5.1425 m with the separate, uncommitted door-relocation geometry; on the isolated commit's preceding front-door geometry it follows the same actual rail at X approximately 2.680 m. This issue calculates each position from the fixed frame, so it does not adopt or discard the separate architectural change. The prior doorway heights are from the model's existing CAD-transcribed joinery, not generated art.

The side-head mesh's existing provenance says **EXPLICIT HEIGHT · Door detail file 9 / sheet 13**. This pass derives coordinates from that mesh and does not claim a new drawing measurement or survey. Final fitting/installation tolerances still require the responsible designers.

All five signs keep their original 380 × 170 × 50 mm case and generic **3 W each**, **E1 → DB-1** directly, **15 W total**. The case is below, and does not cover, coloured glazing in the geometry check. Main-door clips meet the rail; the sign cases clear both modeled leaf states. Product viewing distance, pictogram/direction, luminance, shorter/wheelchair occupants' views, smoke conditions, emergency supply/duration, continuity and commissioning remain for the responsible fire/electrical designers (**Q14**). Location success is not emergency-lighting approval.

## Routes, controls and saved layouts

Sign leads now descend beside the glazing on a solid jamb and turn along the fixed head/transom to the case; the main sign's final lead follows its clip. The five stable E1 drop IDs remain with method `door-head`. A 6 mm cable-envelope screen against actual glazing boxes checks that these routes avoid glass. Head-frame containment, removable covers, transitions, maintenance and anchors remain proposals; do not chase structural members or drill joinery by this model alone.

Removing fourteen sconces also removes their fourteen LD drops and two LD trunks: default connected components **386 → 372**, routes **445 → 429**. LD retains its identifier for customized layouts but is empty in the default. Existing quick modes and the DB-1/DB-2 feeder logic remain. E1 stays on in **All off** and its feed does not pass through LC-1. The six category workbooks, matched JSON/CSV exports, summary and conditional safety review are refreshed from the same model. Older A3 electrical drawings and `output/electrical-review/` remain stale.

Revision `2026-10-25-doorheads-no-sconces-1` writes a full browser backup at `thachbi.simulator.v1.before-doorheads-no-sconces` before adopting exact prior defaults. A moved, hidden, re-aimed or reconfigured sconce/sign is preserved. Sign switching/dimmer/note values survive adoption; missing signs are not recreated. Repeated startup leaves subsequent deletions alone. Failed persistence restores the prior equipment and marker. Custom layouts may therefore still show their custom sconces or old sign positions; this is intentional preservation, not evidence of adoption. Public `?visit` uses the current default without reading an engineering layout.

## Calculation consequence

Same original 368 receiver positions per layout, Full service · evening, 60% occupancy and unchanged physics/targets. These are generic catalogue estimates. Sconce removal reduces modeled running load **5,675.13 → 5,549.13 W** (126 W); it does not establish measured energy savings or justify a cable/protection change.

| Lighting metric | Before | After |
| --- | ---: | ---: |
| Four-block all-seat mean / minimum | 319.12 / 99.75 lx | 313.02 / 97.14 lx |
| Four-block all seats at 200 lx | 89.13% | 86.96% |
| Four-block nave minimum / seats at 200 lx | 203.89 lx / 100% | 198.20 lx / 97.22% |
| Two-block all-seat mean / minimum | 295.89 / 99.85 lx | 289.93 / 97.24 lx |
| Two-block all seats at 200 lx | 88.59% | 88.59% |
| Two-block nave minimum | 159.26 lx | 154.16 lx |

The existing lighting shortfall worsens; no lumen output or target is changed to hide it. Sound, fans and microphones retain their physical settings; existing feedback, wing clarity, air, central-view and other engineering holds remain. [Evidence and reproducible commands](../../review/doorheads-no-sconces-2026-10-25/README.md) distinguish the combined working geometry from the isolated commit.

## Verification and limitation

Actual case/door/glass geometry, maintained E1 load, jamb/header routes, migration idempotence, preserved edits/deletions, durable backup/reload and failed-save rollback are checked headless. Applicable model, full calculation audit, electrical/export, register and public-viewer checks are recorded with the issue. Desktop browser observation remains denied by the saved local-origin permission. This follows the owner's source/headless-verification and local-commit exception approved earlier in the same equipment-review session; no new desktop or listening inspection is claimed. Physical sign visibility and emergency operation remain unverified.
