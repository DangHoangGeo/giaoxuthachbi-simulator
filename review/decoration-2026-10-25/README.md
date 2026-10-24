# Decoration review · 25 October 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.**

This review covers the [decoration and finish revision](../../docs/decoration-finishes.md): exterior plaster/roof highlights, interior stone, sanctuary lacquer/gilding and shallow foliate station surrounds. The initial checkout already contained concurrent façade, navigation, simulator and electrical-register edits. Those were preserved; `baseline.json` freezes the initial viewer hashes and HEAD. This change is not an approval or handover of that separate engineering work.

## Actual desktop captures

Browser: Codex in-app desktop browser, standard graphics, 1070 × 988 CSS-pixel viewport. Final detailed captures use Full resolution (1605 × 1482 drawing buffer). No phone testing. These are actual viewer screenshots, without image generation or retouching.

- [Exterior daylight](exterior-day.png): ivory façade, terracotta roof and stone base.
- [Sanctuary daylight](sanctuary-day.png) and [evening](sanctuary-evening.png): retained red, gold and blue composition, softer surface response.
- [Nave evening](nave-evening.png): four-block seating, as-drawn frame, stations and timber.
- [Reference frame, neutral display, two blocks](reference-frame-neutral-two-blocks.png): alternative frame/seating/display combination.
- [Normal-mode sanctuary](normal-mode-sanctuary.png): existing browser engineering layout retained; its equipment estimates differ from the recommended visit layout. No scene import, reset or equipment edit was performed.
- [Generated public-visit copy](published-visit-sanctuary.png): sanctuary rendered from the byte-verified website copy, with development notice and no Simulator entry.
- [Initial sanctuary](sanctuary-before.png): initial working-tree appearance at automatic reduced preview resolution. This is context, **not** a matched-resolution pixel comparison.

The source viewer was inspected in both normal and `?visit` modes. Day/evening, reference/neutral materials, two/four blocks and both frame styles rendered. Normal mode retained the Simulator entry; `?visit` and the generated `web/public/viewer/` copy did not expose it. Console error/warning reads returned empty lists in normal and visit modes. Controls were used only for display/navigation; these are software previews. See `capture.json` for final source hashes and screenshot hashes.

## Checks

- `node scripts/verify_model.cjs`: passed, including new finish-restoration and station-envelope checks. The initial check found that the roof timber roughness no longer matched the column lacquer; the finish layer was corrected and the complete model check rerun successfully. New leaves and mouldings fit the previous station outline and 85 mm relief projection.
- `node scripts/verify_simulator.cjs --electrical`: passed on the final finish module; 336 installed components and 395 selectable runs in this working-tree baseline. Counts are software records, not approved installed quantities.
- `node scripts/verify_simulator.cjs --report --estimates`: passed the final calculation audit; its log retains the unmet design targets. The verifier now loads the new decoration module just as the browser does.
- `node web/scripts/prepare-viewer.mjs` and `node web/scripts/check-viewer.mjs`: passed; 73 files, 71,211,525 bytes, exact inventory/bytes/hash. The new module is included by the existing script inventory.
- `npm exec vitest run tests/unit/viewer-files.test.ts` from `web/`: passed, one test.
- JavaScript syntax, affected Markdown local links and `git diff --check`: passed.
- A separate `/tmp` snapshot of the staged viewer/scripts also passed the complete model check (`staged-model-check.log`). This verifies the decoration commit independently of the preserved, unstaged façade/navigation edits.

The full verifier's strict design-target path still reports the established 0.9 dB ambo / 1.4 dB altar feedback margins and roughly 11% of seats below the 200 lux brief. In the full-service estimate the worst wing book point is about 100 lux, wing speech clarity minimum/average about 0.409/0.483, and local air minimum about 0.05 m/s. These are model estimates and existing unmet targets, not measurements. Appearance refinement does not resolve them. No test threshold or calculation input was relaxed.

## Remaining work

Station narrative artworks, fine statue sculpture and detailed regional motifs still need artist/parish review. Existing visible fans, concealment, access, structural and product/fixing holds remain. The possible left/right drawing/model reflection (ENG-027) is unchanged pending clarification. This review neither resolves it nor applies a reflection to equipment or routes. Electrical category files and the summary already had unrelated uncommitted changes; none was staged for this decoration commit. No new equipment/line/vertex means no register or electrical/plan export update for this revision.
