# Phase 01 — Baseline and design basis

Status: **not started; plan approval required**. Branch: `eng/01-baseline`, from current main. Depends on approval of the [engineering roadmap](README.md). Read [AGENTS.md](../../AGENTS.md), the [systems brief](../../docs/interior-systems-plan.md), [methods](../../docs/simulator/methods-and-limitations.md), [controls](../../docs/electrical-grid/controls.md) and [register workflow](../../docs/electrical-grid/register.md).

## Outcome

A reproducible starting design and one traceable acceptance/evidence matrix for all systems. It must distinguish numerical validity, unmet project targets, unverified source data and construction approvals. Baseline documentation can pass this phase while the design still fails performance targets.

## Inputs

- Current Git/model revision, recommended layout and separately backed-up browser layouts; matched electrical snapshots, six category workbooks and their fingerprints.
- [Dimension workbook](../../docs/layout_design/Thach_Bi_Church_Dimensions.xlsx), its four governing sheets, printed drawings, [sanctuary](../../docs/sanctuary-model.md), [timber package](../../docs/beams-roof-connections/SPECIFICATION.md), reference provenance and discipline documents.
- Engineer/parish brief: actual attendance and service patterns, choir/accessible seating, concealment intent, budget and service-life/maintenance responsibilities. Survey, utility, environmental and product data to the extent available; gaps are inputs to request, not guessed values.

## Work packages, in order

1. **Freeze and reproduce the baseline.** Record commit, source/export hashes, saved-layout status, seating/frame mode, occupancy, openings, environment, maintenance factor, all equipment/settings and analysis planes. Run model, estimates, full audit, strict simulator and electrical checks. Save exit codes and raw reports, including failures; identify which checks are numerical, functional or performance checks. The integration checks recorded while planning do not replace this phase's full scenario inventory.
2. **Audit geometry and sources.** Trace affected supports, roof/lining/cornice voids, walls/openings, furniture, service spaces and coordinate transformations to drawing sheets/workbook cells and code. Identify display-only beams/carving omitted from occlusion and each uncertain mounting envelope, including L100. Preserve the common metre axes, typical 4.50 m bays and 7.20 m bay 9–10. Reference existing dimension/structural open items; do not change source drawings to match the mesh.
3. **Reconcile targets.** List every metric, scenario/zone, numerical criterion, plane, sample set, statistic, tolerance, uncertainty, evidence class and responsible approver. Expose conflicts between the systems brief, old schedules and executable checks: for example STI 0.60 at occupied seats versus test coverage/floors, the 200 lux brief versus 95% coverage, and differing noise proposals. Retain all original criteria until the engineer resolves their intended scope; an unknown acceptance value remains pending. Do not relax an existing test to resolve a conflict.
4. **Establish the design basis and scenarios.** Identify site jurisdiction, occupancy, approving authority, applicable Vietnamese requirements and exact editions/amendments/clauses through official sources and responsible designers before making any compliance claim. Separate statutory requirements, engineer-adopted criteria and study preferences. Define full/weekday worship, quiet prayer, choir where required, peak/festival, courtyard overflow, cleaning, night/security and emergency/fault scenarios. Cover day/evening, open/partly closed/rain-restricted openings, hot/still, humid/wet and cooler conditions. Record occupancy distribution, receiver locations and local floor heights; sample seats are not approved capacity.
5. **Audit the dynamic air system and coupled methods.** Document current empirical jets, oscillation treatment, exhaust-rating ACH, room absorption/noise and control animation separately. Identify what evidence is needed for actual outdoor-air paths, thermal comfort, transient/control response and product losses; decide which questions require specialist analysis or measurement. Catalogue absent IES/LDT data, speaker/mic data, fan curves/noise, finish absorption, electrical supply/fault/earthing data and mount/access details.
6. **Record failures, stale outputs and requests.** Give each failure a stable issue reference, worst receiver IDs/coordinates, current value/criterion, affected objects, consequence and owner. Reconcile stale discipline schedules against current source and registers, marking historical tables rather than promoting them. Issue a prioritized request list tied to blocked decisions and current construction work. Specify representative full-scale trial locations and measurement responsibilities early.

Suggested commit boundaries: frozen baseline and fresh evidence; design-basis/scenario/target matrix; source/issue audit and corrected historical-status notes. These are documentation/data packages unless a separately verified defect fix is necessary; no optimisation is hidden inside the baseline.

## Planned deliverables

- `docs/engineering/baseline.md` and revisioned baseline inputs/raw per-location results under a phase-specific `review/` directory.
- `docs/engineering/design-basis.md` and `docs/engineering/acceptance-matrix.md`, including scenarios, visibility viewpoints, exact criteria and pending decisions.
- `docs/engineering/issues.md`, linking owning dimension/structural records; input requests with responsible discipline and blocking scope.
- Corrected status/cross-references in affected systems/simulator documents. Refresh registers only if equipment/line source data actually changes.

## Checks and exit gate E1

- [ ] A second run from recorded inputs reproduces significant baseline results within declared numerical tolerances; no missing scenario/input silently takes an undocumented default.
- [ ] Model, independent estimate, full audit, strict simulator and electrical outcomes are recorded. Every observed target failure remains visible; a strict baseline failure is not mislabeled as a software success.
- [ ] Coordinate conventions, dimensional provenance, uncertain service voids/supports and display/analysis mismatches have exact source references.
- [ ] Existing targets and proposed acceptance criteria are separately recorded, conflicts assigned, and unsupported engineering values remain pending. The matrix states exactly which E2 comparisons may proceed and which need a decision.
- [ ] Worst locations, lighting shortfalls, feedback/wing clarity, ventilation/sightline/access limitations and stale schedules are covered in the issue index.
- [ ] Source fingerprints/IDs agree across the baseline model and saved records, or an explicitly identified stale set is excluded from accepted downstream use.
- [ ] Documentation links, commands, Markdown and `git diff --check` pass; required source documents and raw evidence accompany the commits.

## Risks and handover

The user is the project engineer, but site facts, parish preferences, supplier data and specialist evidence still need actual records. Request a precise survey, opening state, supply/nameplate, product file or criterion decision only for the work it blocks. Continue baseline inventory and bounded method checks while waiting. Handover E1 as **baseline established**, never **design passed**, using the [standard record](README.md#execution-delegation-and-handover); proceed to the unblocked E2 packages.
