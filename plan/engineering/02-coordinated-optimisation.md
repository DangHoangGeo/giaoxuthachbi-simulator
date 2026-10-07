# Phase 02 — Coordinated optimisation and dynamic air

Status: **not started**. Branch: `eng/02-coordinated-optimisation`, from current main. Depends on E1 and adopted criteria/evidence for the evaluated scope. Read the [comparison contract](README.md#shared-comparison-and-concealment-contract), [lighting](../../docs/systems/lighting.md), [sound](../../docs/systems/sound.md), [fans](../../docs/systems/fans.md) and [methods](../../docs/simulator/methods-and-limitations.md); historical tables are not current results.

## Outcome

A defensible joint choice of equipment positions, technical specifications and operating settings, with alternatives, worst-location evidence and remaining holds. Concealment, support, route and control feasibility constrain the search from the start. No sequence of isolated lighting, sound and fan “wins” substitutes for an integrated result.

## Inputs

E1's frozen baseline, target/scenario/receiver matrix and issue references; traceable product candidates and envelopes; IES/LDT photometry, speaker/microphone response and directivity, fan pressure/flow/noise/power data and available room/site measurements. Unknown product or environmental inputs require bounded sensitivity studies and a hold on dependent performance claims.

## Work packages, in order

1. **Define the joint search.** Keep the unchanged baseline and compare at least three meaningfully different strategies: a minimally changed distributed arrangement, concealed architectural integration, and an alternative coordinated distribution/air-path arrangement. Reject infeasible strategies with reasons before selection. Each strategy includes lights, speakers, microphone/talker geometry, circulation/exhaust/make-up air, operating modes and control grouping. Set allowed mounting zones, aim/height limits, product envelopes, electrical demand, maintenance and cost constraints from evidence; preserve IDs for moved items.
2. **Make the calculations adequate for the question.** The primary agent audits photometry/occlusion, absorption/directivity/delay/feedback and fan/noise models. Add missing relevant obstacles only with provenance and independently verified behavior. Validate any equation or numerical change against analytical cases, selected-product data or an appropriate specialist tool; rerun the original baseline and all candidates after such a change. Record old/new methods and sensitivity, never tune an approximation solely to reach a target.
3. **Develop the dynamic air proposal.** Separate occupied-zone movement, outdoor-air delivery and heat control. Calculate actual fan operating points from product curves and path losses, including grilles/screens, ducts, intake/exhaust free area, make-up air and discharge recirculation. Check hot/still, wet/restricted-opening, cool and peak cases. Evaluate ankle/torso/head and standing receivers, airspeed variation/dwell where validated, fan sweep envelope and noise at microphones/ears. Nominal ACH and animated blades are not time-resolved ventilation evidence. Define proposed local schedules/occupancy/environment inputs, speed/opening/exhaust sequences, delays/hysteresis and failure states with sourced limits; sensor hardware and closed-loop control stay proposed until designed and commissioned. Include an extreme-heat operating response.
4. **Run integrated comparisons.** For each strategy and relevant scene, change positions, aim, product parameters, light output/dimming, speaker gain/delay/zones, microphone position/pattern and fan speed/oscillation/exhaust settings together. Keep fan noise in speech and feedback assessments, light/blade interference in lighting, and airflow away from microphones/pages/candles. Evaluate energy, access, support/route feasibility and preliminary concealment at the same time. Bounded candidate sweeps may be delegated using fixed inputs and separate output directories; primary engineering decisions remain with the primary agent.
5. **Compare robustness and select.** Report baseline and candidate per-zone distributions, worst receiver IDs/coordinates, failing counts, margins and sensitivity to occupancy, weather/openings, finishes, product tolerances and microphone use. Show non-dominated choices and why one wins; no weighted average may conceal a failed hard constraint. Compare capital, energy, maintenance, replacement and spare availability over the agreed horizon. If there is no feasible option, state that result and the specific physical/brief change required; do not declare a winner by changing thresholds.
6. **Integrate the accepted design-development choice.** Update the owning design/catalogue/settings and analytical geometry where justified, with specs/source status and per-item operating modes. Preserve saved edits/deletions through versioned, backed-up migrations. Update discipline/method docs, reroute and refresh matched exports and six registers/summary in the same logical changes. Record provisional envelopes explicitly; selected-product/specialist evidence required for a performance claim cannot be deferred as an invisible assumption.

Suggested commit boundaries: calculation/method corrections with independent evidence; comparison harness and immutable candidate data; each accepted coordinated equipment/settings revision with all affected documents/exports/registers. Keep rejected trials separate from the recommended default.

## Planned deliverables

- `docs/engineering/options.md`: full alternative comparison, constraints, decision rationale and unresolved trade-offs, linked to repeatable candidate inputs/results.
- `docs/engineering/dynamic-air.md`: air paths, duty-point/loss basis, operating sequence, noise interaction, uncertainty and validation/measurement plan.
- Coordinated equipment-position/aim/product/setting schedule in owning sources and category registers; per-seat/per-zone/scenario result maps and worst-location tables.
- Updated methods, discipline docs, electrical snapshots, category workbooks and summary, with remaining engineering holds.

## Checks and exit gate E2

- [ ] Baseline plus at least three integrated strategies are reproducible with identical comparison criteria and sample coverage; rejected options and primary selection rationale are retained.
- [ ] Adopted light, speech/feedback, air/noise and usage criteria pass for the selected declared scope, including worst locations and unfavorable scenarios. Unresolved required criteria or failures block that scope and keep the phase unmerged.
- [ ] Every accepted position/setting/spec has source and evidence status; manufacturer/specialist validation supports engineering claims. Empirical-only findings are labeled and cannot close an outdoor-air or compliance requirement.
- [ ] Dynamic-air path, noise, fan/light/microphone interactions, physical envelopes and credible concealment/access/route options are coordinated; critical geometry or support assumptions are held.
- [ ] `verify_model`, `verify_estimates`, strict `verify_simulator`, full `--report --estimates` and `--electrical` checks run as applicable, with independent cases for changed calculations. No threshold/sample relaxation or new software failure remains.
- [ ] Desktop/phone, day/evening, relevant seating/frame modes and move/delete/reload/undo/import/export behavior are inspected. A physical product trial or specialist result is identified separately from a browser check.
- [ ] Changed model, docs, plans, matched exports, category workbooks and summary reconcile; register preservation and diff checks pass.

## Risks and handover

Hiding current ceiling fans or enlarging concealed speaker output may prove incompatible with airflow, speech or maintenance. Show the conflicting options and required decision. Missing product data may permit a comparative study but cannot pass a gate whose result depends on that data. Keep the branch unmerged if E2 is blocked and continue independent concealment prototypes, route/control schemas or tests under the [blocked-work rule](README.md#blocked-work-and-phase-completion). E3 must rerun E2 if concealment alters performance or placement.
