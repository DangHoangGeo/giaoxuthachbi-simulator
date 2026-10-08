# Church building-systems engineering roadmap

Planning baseline: **8 October 2026**. Status: **execution approved by the engineer on 8 October 2026**. Read [AGENTS.md](../../AGENTS.md) and the [controls brief](../../docs/electrical-grid/controls.md). This plan is a work programme, not approval to purchase or construct.

Finish the coordinated design of lighting, loudspeakers, microphones, fans and the dynamic air system, then their concealed electrical routes, DB-1/DB-2 distribution, physical controls and quick modes. Position, specification and operation are one design problem. The engineer's 8 October instruction makes concealment inside and outside the church a requirement, including equipment bodies and cables. The [web roadmap](../README.md) follows this engineering track.

**Owner clarifications, 8 October 2026:** desktop-only use; no further phone UI/UX testing. Keep the central church view clear of visible fans/supports and exclude exposed centreline schemes. [Governing brief](../../docs/engineering/central-view-constraint.md). These instructions supersede the earlier device scope without relaxing engineering targets.

## Approval and starting revision

- The requested integration is complete: `6ecd7fb` merges all 21 commits from `codex/church-web-roadmap` into `main`, without rewriting history. Both branches were pushed to origin.
- Plan proposal `cf8ddd8` was committed/pushed on `eng/00-plan`, branched from that main revision. The engineer approved it in this chat on 8 October 2026: “Sure, approved it”.
- Approval was recorded in `5edd115` and merged/pushed to main as `daadc10`; `eng/01-baseline` starts there. There is no further routine phase-start approval: complete each exit gate, merge/push, report the handover and continue automatically.
- Plan approval authorizes the workflow. It does not approve unresolved dimensions, acceptance criteria, product selections, concealment exceptions, physical hardware or construction release. Request only the specific missing decision when it becomes necessary.

## Roadmap and dependencies

E1 is **complete: baseline established**, with [evidence and remaining design failures](../../docs/engineering/baseline.md). E2–E5 are **blocked and unmerged**: [E2 options 8274191](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/8274191/docs/engineering/options.md), [E3 concealment a9e6515](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/a9e6515/docs/engineering/concealment.md), [E4 route maps e6a3dcd](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/e6a3dcd/docs/electrical-grid/route-maps/README.md), and [E5 controls ae18c68](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/ae18c68/review/engineering-controls-2026-10-08/README.md). These references do not adopt their software or held layouts into main. E6 is next for independent reconciliation/handover work. Phase files use the same format as [web phases](../phases/00-evidence-and-publication.md). `E` gates are engineering gates; `G` gates belong to the web track. No calendar completion dates are promised before surveys, product data and review availability are known.

| Phase / branch | Outcome | Depends on | Exit gate |
| --- | --- | --- | --- |
| [01 — Baseline and design basis](01-baseline.md) / `eng/01-baseline` | Reproducible baseline, unmet-target register, source/geometry audit, scenarios, criteria and assigned information requests | Approved plan and current main | E1: evidence is reproducible; unresolved criteria/data explicitly bound the next work |
| [02 — Coordinated optimisation and dynamic air](02-coordinated-optimisation.md) / `eng/02-coordinated-optimisation` | Compared multi-system candidates and a justified design-development choice, with worst locations and uncertainty | E1; adopted criteria and sufficient evidence for each claimed result | E2: selected scope meets its adopted performance criteria and calculation checks; unsupported claims remain held |
| [03 — Concealment and installation access](03-concealment.md) / `eng/03-concealment` | Equipment and cable concealment from occupied viewpoints, with performance, supports and maintenance preserved | E2 candidate; architectural/product envelopes | E3: visibility and installation evidence accepted; any exception explicitly decided |
| [04 — Coordinated 2D/3D routes](04-routes.md) / `eng/04-routes` | Common route vertices, endpoints, sections and installation constraints; coordinated power/signal/control paths | E2/E3 accepted geometry and connection needs | E4: both maps, routes and registers reconcile; no unresolved physical clash in the accepted scope |
| [05 — Boards, circuits and operating controls](05-boards-and-controls.md) / `eng/05-boards-and-controls` | DB-1/DB-2 functional design, electrical calculations, physical faces and channel map, quick/dynamic-air operating sequences | E2 settings, E3 access, E4 routes; supply and selected interface data | E5: checked design and control behavior meet the agreed scope, including failure/offline cases |
| [06 — Registers, verification and design handover](06-registers-and-handover.md) / `eng/06-registers-and-handover` | Matched issue package, six Excel registers, quantities/usage/completeness report, specialist review and commissioning plan | E1–E5 evidence and responsible designers | E6: reconciled design issue accepted for its stated purpose; construction release separately authorized |

Normal order: **01 → 02 → 03 → 04 → 05 → 06 → web 00 → 01 → 02 → 03 → 04 → 05 → 06**, with **web 07 before every launch**. Concealment, route space and manual-control feasibility constrain candidates already in 02; phases 03–05 deepen those checks. Any later change to placement, specification, openings, screens or setpoints returns to the affected performance and concealment gates before acceptance. Registers and exports update with every relevant change, not only in 06.

### Blocked work and phase completion

Finish all independent packages on a blocked phase branch, verify/commit/push them, mark the phase **blocked**, and leave it **unmerged**. Record the exact missing input/decision, affected IDs, acceptance evidence, responsible person/discipline and what it prevents. Unknowns remain `null`/pending. Do not claim completion by checking a software test while a required exit criterion fails.

Move to the next unblocked package on a new branch from current main. An incomplete predecessor cannot supply an approved downstream design. Use clearly labeled independent fixtures, schemas, test harnesses or surveyed inputs; do not silently cherry-pick a blocked candidate or fabricate a route/product value. Record which predecessor revision must later be integrated and reverified. If none of the remaining engineering packages can proceed, continue only independent web packages permitted by the existing web dependencies, using safe fixtures and no construction-ready claims. Engineering coordination resumes first when its input arrives.

E1 can finish while performance targets fail, because its outcome is an honest baseline. E2–E5 require their stated design-development criteria to pass in the declared scope; they do not certify the building. Scope includes the required systems, occupied zones and scenarios identified in E1; do not shrink it to exclude a failed target. Any proposed scope exception requires an explicit engineer decision and retains the omitted requirement as a hold. E6 cannot declare construction readiness with unresolved construction-critical calculations, details or approvals. Installation and commissioning measurements occur at the appropriate site stage; a commissioning plan is never recorded as a witnessed test.

## Evidence already found

The [plan-preparation review](../../review/engineering-plan-2026-10-08/README.md) records fresh integration checks on source `f260525`, whose tree is identical to merged `6ecd7fb`. These checks support merging existing work; they do not complete E1's scenario, criteria, survey or product-data work.

| Finding | Evidence and consequence for the plan |
| --- | --- |
| Ambo/altar feedback margins 1.2/1.7 dB against the existing 3 dB test brief | Strict simulator fails; microphone geometry, speaker coverage/gain/delay and fan noise must be compared together in 02. |
| Wing STI minimum 0.439 against the current 0.45 test floor; average 0.510 | Calculation audit retains the failure. The broader brief seeks STI 0.60 at occupied seats; reconcile the brief, test floor and coverage percentages in 01, without weakening any existing test. |
| Four sampled seats below 200 lux; minimum 197 lux | The existing 95%-coverage test passes while these seats miss the brief. Preserve the full seat results and exact worst IDs; evaluate sanctuary task/face and circulation planes separately. |
| Empirical air-speed result: average 0.40, minimum 0.26 m/s; 95% within the model's 0.3–0.8 m/s band | This is a comparative estimate. Exhaust-rating/volume ACH does not establish outdoor-air delivery, and animation does not establish time-resolved airflow. |
| Concealed wiring revision exists; L100 canopy/capital contact and service-space details remain open | [Routing](../../docs/electrical-grid/routing.md) and [sanctuary](../../docs/sanctuary-model.md) record holds. Existing wire screenshots do not establish concealment of all lights, speakers, microphones, fans and boards. |
| Current saved registers: 327 equipment/enclosure records, 286 connected components, 329 routes, 2,681 vertices | [Summary](../../docs/electrical-grid/summary-report.md) records zero filled approved-spec/source, physical-control and approved-cable populations. Counts are a source snapshot, not an installed quantity or purchase schedule. |
| Custom-scene path lacks the built-in scene's DB-2 feeder check | [Controls brief](../../docs/electrical-grid/controls.md) and `applyScene` in `engine.js`; audit all edit/import/restore paths in 05. No hardware behavior is inferred. |

Earlier system schedules contain future-looking version labels and stale results. Resolve their facts from source revision and fresh evidence in 01. Keep the documented ventilation, sightline, accessibility and structural limitations visible throughout.

## Shared comparison and concealment contract

Each candidate record must identify the code/model/product revisions, scenario, immutable baseline, changed equipment IDs and positions/aim/settings, calculation method and uncertainty. Retain rejected candidates and rejection reasons. Use the same target definitions and reference sample locations across comparisons; add missing samples when justified and rerun every candidate on the expanded grid. Never remove a bad seat, alter physics, lower a threshold or change occupancy to manufacture a pass.

| Compare together | Required evidence |
| --- | --- |
| Lighting | Maintained task/floor/vertical-face minima, average, uniformity, glare/reflections, daylight, dimming/flicker, blade interaction and external spill, using traceable selected-product photometry for engineering validation. |
| Speech and microphones | Per-seat STI, speech level/uniformity, late arrivals, feedback at each microphone and occupied/unoccupied behavior with each relevant fan state; actual directivity, microphone/talker geometry, room absorption and assistive-listening needs. |
| Air and noise | Local movement separate from outdoor-air delivery and heat control; fan curves/duty points, opening free areas and losses, make-up/discharge paths, short-circuit risks, noise and oscillation/transients where validated. No-AC brief retained. |
| Concealment and feasibility | Full equipment/connector/support envelopes, normal occupied sightlines, roof/wall/cornice voids, structural attachments, fire/weather protection, removal/cleaning/isolation access and control usability. |
| Usage and lifetime | Connected ratings, simultaneous demand and operating energy kept distinct; scenario hours/attendance, capital/energy/maintenance/replacement cost and local spares over an explicitly agreed horizon, with unpriced items pending. |

For each zone/scenario, show minima/maxima, distribution or relevant percentiles, failing count/denominator, worst seat/receiver IDs with coordinates and applicable plane, and both baseline-to-candidate and uncertainty comparisons. Overall averages or weighted scores cannot compensate for a failed safety or hard acceptance condition. The primary agent makes and explains the trade-off decision.

Check seated and standing observers, shorter occupants, wheelchair users, sanctuary ministers, choir, entrances, verandas, courtyard and exterior approaches, looking toward and away from the sanctuary and upward. Record eye height above local floor, position, orientation and field of view as explicit assumptions until agreed. Sample routes through occupied spaces, not a few favorable still images. Include day/evening and relevant seating/frame modes. The as-drawn frame is the coordinated design basis; the alternative reference frame remains a separately labeled study unless independently coordinated.

Concealment means real geometry/details hide the equipment while it operates. Rendering visibility toggles, x-ray suppression, colour matching alone or hiding equipment from analysis do not pass. Compare unscreened and concealed performance using real baffles/grilles/voids, with explicit before/after changes and no material degradation beyond an agreed tolerance. Passing an absolute target alone does not approve a concealment loss. Unresolved visibility/performance/access conflicts stay on hold and are shown to the engineer; do not choose an exception silently. Existing decorative chandeliers/lanterns, microphone heads, required visible signs and emergency devices need explicit disposition where the all-hidden brief conflicts with their function or established appearance.

## Source ownership and evidence records

Use the existing sources; this roadmap does not create a competing dimensional truth:

- [Dimension workbook](../../docs/layout_design/Thach_Bi_Church_Dimensions.xlsx): **Dimensions**, **Model grid**, **Open items**, **Sources**; preserve original drawings. Cite printed sheet/page or cell, revision, units, endpoints, datum and evidence class.
- [Systems brief](../../docs/interior-systems-plan.md), [discipline documents](../../docs/systems/README.md), [sanctuary](../../docs/sanctuary-model.md), [timber specification](../../docs/beams-roof-connections/SPECIFICATION.md) and [art status](../../docs/church-view-renderings.md).
- [Methods and limitations](../../docs/simulator/methods-and-limitations.md); owning readable modules: [design](../../Thach_Bi_Viewer/simulator/design.js), [catalogue](../../Thach_Bi_Viewer/simulator/catalog.js), [engine](../../Thach_Bi_Viewer/simulator/engine.js), [physics](../../Thach_Bi_Viewer/simulator/physics.js), [analysis](../../Thach_Bi_Viewer/simulator/analysis.js), [electrical](../../Thach_Bi_Viewer/simulator/electrical.js) and [controls](../../Thach_Bi_Viewer/simulator/controls.js).
- [Electrical routing](../../docs/electrical-grid/routing.md), [control contract](../../docs/electrical-grid/controls.md), [category workbooks](../../docs/electrical-grid/categories/README.md), [preservation workflow](../../docs/electrical-grid/register.md) and [summary](../../docs/electrical-grid/summary-report.md).

The [engineering baseline](../../docs/engineering/baseline.md) links the design basis, scenario/target matrix and issue references. Candidate comparisons and concealment evidence are added during their phases. Geometry questions stay in the existing workbook **Open items**; timber questions remain in the structural package. The issue index links those owning records without duplicating or closing them by assumption. Each new issue needs stable ID, affected objects/scenarios, evidence, responsible discipline, required response, blocking scope and disposition.

## Checks and synchronized changes

Run from the repository root. Apply checks to the change; the listed commands are existing checks, not promises that they validate every new criterion. Extend meaningful verification where current coverage is insufficient, and record independent reference cases for any physics change.

| Change/evidence | Required command or method |
| --- | --- |
| Geometry, seating, sanctuary or navigation | `node scripts/verify_model.cjs` |
| Equations, equipment power, statistics or measurement planes | `node scripts/verify_estimates.cjs` plus independently derived cases/specialist comparison |
| Equipment/simulator/shared model | `node scripts/verify_simulator.cjs` and `node scripts/verify_simulator.cjs --report --estimates`; retain strict failures separately from calculation-audit passes |
| Electrical routing | `node scripts/verify_simulator.cjs --electrical` (includes the existing concealment checks) |
| Equipment/line changes | `node scripts/verify_simulator.cjs --electrical --export-electrical`, then `node scripts/build_equipment_register.mjs --verify-workflow` with the bundled artifact runtime |
| Changed plans/HTML brief | `node scripts/verify_model.cjs --plan`; `node scripts/build_planning.cjs` with its documented `marked` dependency |
| Timber/reference package | `python3 docs/beams-roof-connections/validate.py` |
| Visual/interactive behavior | Actual desktop views, day/evening, relevant seating/frame modes, affected controls, console errors, reload/undo/import/export; record viewport emulation separately from a physical-device trial |
| Documentation only | Local links/anchors, source facts, paths/commands, Markdown structure and `git diff --check`; no unrelated simulation reruns |

Each equipment/line/model change includes its owning documents, matched JSON/CSV, affected plans, all affected category workbooks, manifest and summary in the same logical commit. Preserve named engineering-input fields, retired IDs and user layouts. Back up workbooks; handle Excel proposed coordinates through model review and re-export. Each ID/route/vertex belongs to exactly one category; shared boards are referenced, not counted again. Six files retain **Read me / Equipment / Electrical Lines / Route Points**. Browser layouts require their own unchanged matched export pair.

## Execution, delegation and handover

1. Fetch origin, inspect status/recent changes and confirm current main. Branch each phase from main using the names above, or `web/00-evidence` and corresponding `web/NN-*` names for the later web phases. Preserve other work; no force-push or shared-history rewrite.
2. The primary agent handles optimisation choices, physics/calculation changes, cross-discipline trade-offs, substantive reviews and all merges. Delegate only bounded repetitive work to **Sol 6.1 max** or **Luna 6 max**: candidate sweeps using a fixed protocol, exports/register refresh, document synchronization, link/consistency checks or screenshot capture. Give each a self-contained brief, frozen inputs, exact owned files/output directory, checks and stop conditions; no overlapping writers, unsupervised engineering approval or delegated merge.
3. Make a small commit after each coherent verified change; inspect staged diff and `git diff --cached --check`. Push every commit to origin as authorized. Failed required verification leaves the affected change uncommitted unless the engineer explicitly authorizes an exception; established baseline failures remain documented and are not disguised as new passes.
4. Complete the phase checklist and primary review, record evidence, then merge to main without rewriting history and push main. If main changed, integrate normally and rerun affected checks before merging. A blocked phase remains unmerged under the rule above.
5. Give a short handover and start the next ready package without waiting: `status/scope; source/model/product/data revisions; branch and commit/merge hashes; checks and results; worst-location targets still failing; visual/device/specialist evidence; open decisions with exact requested input and responsible person; next package`.

Before reporting completion, check Git status, local and remote refs, commits and `git diff --check`. Distinguish **implemented**, **calculated**, **visually inspected**, **measured** and **engineer-approved**. A passed phase gate never upgrades an unverified product or detail silently.

## Handoff to the web track

Publish immutable evidence from the accepted engineering revision through the [web data contracts](../data-and-publication.md), with the [read-only architecture](../architecture.md) and [release gates](../quality-and-release.md). Preserve the offline viewer and its editable design workflow. Public visits and protected review/site views allow navigation, display choices and published-scenario selection only; no project editing/import/saving/upload or physical commands. Enforce private access at server-side data reads and keep private source material out of public bundles/assets.

Use the existing suggested web order, including its allowed independent packages when inputs are missing. Push authorization covers Git; existing specific decisions on publication rights, provider/account costs and actual deployment scope remain in the [web decision register](../decisions-and-sources.md). The web app may display a clearly labeled design-development issue with its holds; it cannot convert that issue into construction approval.
