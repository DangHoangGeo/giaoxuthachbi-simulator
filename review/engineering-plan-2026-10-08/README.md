# Engineering plan preparation and roadmap integration · 8 October 2026

Scope: merge the previously committed work into main and prepare the [engineering roadmap](../../plan/engineering/README.md) for the engineer's approval. **No engineering phase has started.** The new work changes planning documents only; it does not change equipment, routes, physics, specifications or thresholds.

## Revision and source review

The clean starting branch was `codex/church-web-roadmap` at `f2605256c5ed317334d678d8f6f75f1c42e7aa61`. A fresh fetch confirmed main/origin main at `2faa61b`, 21 commits behind the roadmap; the roadmap itself had 14 local commits not yet on origin. Those commits were pushed, then integrated into main by merge `6ecd7fb`. `git diff --exit-code main codex/church-web-roadmap` confirmed identical trees. Main was pushed, and proposal branch `eng/00-plan` was created from it. No history was rewritten.

Read AGENTS.md, the web roadmap/phase format and access/publication/quality contracts, electrical controls/routing/register/category/summary documents, systems brief/discipline documents, simulator methods, sanctuary and relevant timber coordination records, and the prior concealed-wiring review. Traced `design.js`, `engine.js`, `physics.js`, `analysis.js`, `controls.js` and verification scripts for their source ownership and relevant implementation. The actual model/dimension/product audit remains phase 01 work; this planning review does not certify the source drawings or workbook dimensions.

The primary agent authored the plan and made the integration/gate decisions. Luna 6 max performed a read-only inventory of existing phase formatting, dependencies and references. Sol 6.1 max checked local links, phase formatting and source consistency; no optimisation, physics change, substantive engineering review or merge was delegated.

## Fresh integration checks

Commands ran from the repository root against source `f260525` before the merge, using Node v22.22.2 and Python 3.13.4. Since merge `6ecd7fb` has the identical tree, this is also evidence for its source contents. These are software/package checks, not physical performance validation or completion of E1.

| Command | Exit / result | Raw evidence |
| --- | --- | --- |
| `node scripts/verify_model.cjs` | 0; model/navigation/source-geometry assertions pass | [model.log](model.log) |
| `node scripts/verify_estimates.cjs` | 0; 24 independent calculation checks pass | [estimates.log](estimates.log) |
| `node scripts/verify_simulator.cjs --report --estimates` | 0; calculation audit passes and retains unmet design targets; embedded electrical/concealed-route checks pass | [audit.log](audit.log) |
| `node scripts/verify_simulator.cjs` | 1; established microphone-feedback design failure, not a new merge regression | [strict.log](strict.log) |
| `python3 docs/beams-roof-connections/validate.py` | 0; package validation passes, no structural capacity verified | [timber.log](timber.log) |
| `git diff main..codex/church-web-roadmap --check` before merge | 0 | Checked source diff; no model changes during integration |

The fresh audit retains ambo/altar feedback margins **1.2/1.7 dB**, wing STI minimum **0.439** against the current **0.45** test floor (average **0.510**), and minimum light **197 lux** with **98.9%** reaching 200 lux. The current sanctuary record identifies four failing seats. Model air speed is average **0.40**, minimum **0.26**, maximum **0.79 m/s**, with **95%** in the model's comfort band. These estimates do not resolve ventilation, thermal comfort, sightlines or accessibility. Current electrical checks count **286 connected components / 329 routes**; construction approval remains false.

No exports or workbooks were regenerated: the integration preserves already matched model/register changes, and the new plan changes none of their owning data. Reviewed [register workflow](../../docs/electrical-grid/register.md), [category index](../../docs/electrical-grid/categories/README.md), [summary](../../docs/electrical-grid/summary-report.md) and [controls](../../docs/electrical-grid/controls.md). Their quantities and engineering-input fields remain unchanged.

## Plan verification and limits

Document verification passed for nine Markdown files: 101 local links to 50 unique paths, eight heading anchors, six phase templates and their branch/dependency references, and ten distinct runnable commands across six existing scripts. Planned future paths remain explicitly future. Baseline quantities/results match their owning sources. Primary review checked the full plan and staged diff, clarified E4-to-E5 sizing feedback without a circular gate, prohibited scope reduction to hide failures, and required explicit before/after concealment losses. Working and staged diff checks passed. Final commit/ref status is recorded in the handover.

The 3 dB microphone-feedback criterion and 0.3–0.8 m/s air-speed band come from the owning [analysis module](../../Thach_Bi_Viewer/simulator/analysis.js) and discipline briefs, rather than being inferred from the raw audit's reported values. No visual or interactive implementation changes were made, so no new browser/device or audio trial is claimed. Existing visual evidence remains tied to its recorded source revision.

The plan stays **proposed** and every phase **not started**. The engineer explicitly requested the approval stop before execution. The plan branch is committed/pushed for review and remains unmerged until approval. Current geometry, product, code-basis, supply, concealment and performance holds remain open; plan approval alone cannot close them.
