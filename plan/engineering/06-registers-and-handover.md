# Phase 06 — Registers, verification and design handover

Status: **not started**. Branch: `eng/06-registers-and-handover`, from current main. Depends on E1–E5 accepted evidence and responsible design reviewers. Read [AGENTS.md](../../AGENTS.md), the [register workflow](../../docs/electrical-grid/register.md), [category ownership](../../docs/electrical-grid/categories/README.md), [summary report](../../docs/electrical-grid/summary-report.md) and [web publication contracts](../data-and-publication.md).

## Outcome

One coherent, traceable design issue whose geometry, performance, concealed installation, electrical calculations, controls, Excel schedules and usage/completeness report agree. The issue states exactly what is approved, what remains held and which site tests remain to be witnessed. This phase reconciles the ongoing registers; it is not the first time they are updated.

## Inputs

Accepted E1–E5 revisions, selected-product evidence and calculations, specialist review comments/dispositions, full-scale trial evidence where needed to close design assumptions, six editable category workbooks and engineering inputs, survey/drawing sources, parish operator/maintenance contacts and site programme.

## Work packages, in order

1. **Freeze the issue candidate.** Record code/model/product/scenario/drawing revisions, source hashes, accepted scope and every outstanding hold. Resolve cross-discipline review comments against the owning records. No mixed snapshot or provisional specification may acquire approval merely through export.
2. **Reconcile equipment and lines.** Back up all category workbooks and preserve entered specifications, sources, physical controls, allowances, notes and retired IDs. Re-export the accepted recommended layout and systems together, or use the documented matched pair for a separately reviewed browser configuration. Review Excel proposed coordinates through the model; explicitly disposition accepted/rejected proposals. Validate unique category ownership, endpoint/vertex ordering, positions/aim, route lengths and actual cable/terminal mapping.
3. **Rebuild and inspect the issue outputs.** Generate the six **Read me / Equipment / Electrical Lines / Route Points** workbooks, CSV/JSON, matching 2D/3D maps and summary from the frozen candidate. Reconcile quantities by installed/hidden/retired/non-electrical/enclosure categories without duplicating shared boards. Report geometry lengths separately from full audio home runs, bundles, conductor multiplicity and allowances. Visually inspect representative workbook sheets for clipping, units, formulas, filters and status labels.
4. **Complete usage and quality reporting.** Show connected ratings, simultaneous-demand basis and operating energy by adopted scenario, including assumptions and omitted loads/time periods. Keep passive-speaker audio watts and commanded state separate from mains demand and measured operation. Report per-discipline data completeness, source/approval coverage, failing criteria, stale/missing fields and worst receivers. Filled fields are not engineering approval; no single green score hides missing evidence. Compare lifecycle costs only over the agreed horizon and priced scope.
5. **Verify the whole package and review trial evidence.** Run relevant geometry/calculation/strict/full simulator/electrical/register/timber checks and fresh actual-viewer inspections for changed behavior. Verify independent specialist results and representative full-scale trials of lighting/finishes, speech with fans on, airflow/noise and hidden installation/access where needed. Record calibrated instruments, methods, uncertainty, measured locations and reviewers for real tests; no synthetic measurement stands in for absent evidence. Resolve failures or retain a blocked issue.
6. **Prepare construction/commissioning and operation records.** Assemble source-backed drawings/specs, product submittals/equivalents criteria, checked single-line/cable/terminal schedules, support/penetration details and hold points for the engineer's issue decision. Provide commissioning forms for maintained/night/day lux and faces, glare/flicker, speech/STIPA/RT/noise/feedback, occupied-zone air/T/RH/CO₂/outdoor-air delivery, electrical tests, controls and failure/offline behavior. Define responsible witnesses and acceptance criteria. Include as-built updates, training, isolation, cleaning/replacement access, local spares, backups, maintenance intervals, extreme-heat response and seasonal rechecks with named owners.
7. **Issue and hand off.** Record the responsible engineer's disposition for a coordinated design-development issue versus a construction issue; identify permitted uses per sheet/package. Only mark a scope issued for construction/ready to purchase after its checked calculations, selected products, coordinated details and explicit authorization exist. Deliver an immutable engineering release with hold/source/status fields for later web review, then continue the [web roadmap](../README.md) in its suggested order. Site commissioning remains an identified later activity until it actually occurs.

Suggested commit boundaries: issue reconciliation and preserved register refresh; review/trial corrections with all synchronized outputs; final issue manifest, summary and operating/commissioning handover. Do not split a model correction from the required records to make a smaller commit.

## Planned deliverables

- Updated `docs/electrical-grid/categories/` workbooks/manifest, paired layout/systems JSON and schedule CSV, `summary-report.md`, route maps, control/board drawings and calculation references.
- `docs/engineering/handover.md`: issue manifest, scope/status, responsible approvals, open holds, acceptance evidence, operating/maintenance/commissioning responsibilities and next site actions.
- Revisioned reproducibility, register preservation, workbook/desktop inspection and specialist/trial evidence under `review/`; signed/checked external evidence referenced with its proper access status.
- An engineering release contract for web phases 00/05/06, retaining private/public classification, stable IDs, units, source precision, limitations and immutable revision matching.

## Checks and exit gate E6

- [ ] All E1–E5 accepted scope and review dispositions reconcile; no unresolved required performance target or critical design calculation is hidden by the issue summary. Outstanding scope/field work is explicit and cannot inherit construction status.
- [ ] All six category files retain the four required sheets, engineering inputs and retired IDs; every equipment/route/vertex belongs once, shared boards are referenced, and source/workbook fingerprints match the final summary.
- [ ] Independent route/quantity/load/energy checks agree with the source and length bases; unknown values stay pending, assumptions and installation allowances are explicit, and no passive audio rating is summed as mains demand.
- [ ] Applicable model, estimates, strict/full simulator, electrical, register preservation and timber checks have recorded outcomes on the issue candidate. Every required phase check passes; known failures outside an accepted limited scope remain named and cannot be waived silently.
- [ ] Workbook rendering and relevant desktop day/evening/seating/frame/control inspections pass; measured, specialist, browser and headless evidence are separately labeled.
- [ ] The responsible engineer accepts the stated design-issue scope and limitations. A construction/purchase claim is blocked until all its required calculations, products, coordinated details and approvals exist; a design-development issue stays labeled accordingly.
- [ ] Commissioning, as-built updates, training, maintenance/spares, backup/recovery and seasonal checks have explicit procedures, criteria and responsible owners. Planned future tests are not marked passed.
- [ ] Final manifest, documentation links, staged diff checks, local/remote commit refs and Git status are checked; completed verified work is committed and pushed.

## Risks and handover

An immaculate register cannot cure missing field data, failed targets or an unapproved mounting detail. If E6 is blocked, retain the phase branch unmerged, provide the precise outstanding evidence/decision list and continue only independent web work under the roadmap's dependency rules. Once E6 passes, merge/push and give the [standard handover](README.md#execution-delegation-and-handover). The future protected viewer may show design-development evidence with holds; the site inspector must never present an unresolved value as construction authority.
