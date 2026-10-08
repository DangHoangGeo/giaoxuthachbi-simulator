# Phase 05 — Boards, circuits and operating controls

Status: **blocked; independent package committed and pushed, branch unmerged**. Branch: `eng/05-boards-and-controls`, from main `703268a`. Depends on E2 settings, E3 concealment/access, E4 routes and the necessary verified supply/product/interface data. Read the [owning control brief](../../docs/electrical-grid/controls.md), [electrical index](../../docs/electrical-grid/README.md), [systems brief](../../docs/interior-systems-plan.md) and [web capability boundary](../architecture.md#read-only-capability-model).

[Branch evidence at ae18c68](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/ae18c68/review/engineering-controls-2026-10-08/README.md). The independent software/control map and six-register package is verified. Physical supply/product/interface design remains held. Its software is on the phase branch, not in this main checkout.

## Outcome

A coordinated DB-1/DB-2 and LC-1/FC-1/AV-1 design, with checked circuit/load/protection decisions, usable concealed physical control locations, explicit item/group channels and predictable operating modes. Physical manual operation works without internet by design; software controls remain a simulation until a separate engineered hardware commissioning scope is authorized.

## Inputs

Surveyed supply voltage/phases/capacity/earthing/fault level; selected product loads, driver/motor inrush, dimming/speed/audio interfaces, environmental limits; E4 route lengths/installation conditions; occupancy/life-safety design and responsible electrical/AV/air designers. Agree which items have independent controls and which may share a group; a simulator switch cannot prove independent physical wiring.

## Work packages, in order

1. **Calculate the electrical design.** Separate rated connected load, justified demand/diversity, apparent power, operating watts and service energy. Include control/driver/amplifier auxiliaries and unmodeled building-load interfaces explicitly. Check feeder logic, phase balance, ampacity/derating, voltage drop, fault protection/disconnection, selectivity, inrush/leakage, isolation, earthing/bonding, surge/lightning, emergency supply and containment capacity against verified project requirements. Unknown inputs stop sizing; older C6/C10 symbols are not approved devices.
2. **Design boards and faces.** Produce functional and checked single-line diagrams, board/circuit schedules, enclosure thermal/space/access assessment, proposed operator faces and installer-only protective/control separation. Keep DB-2 fed from DB-1. Coordinate routine controls at concealed but reachable locations with legible labels and maintenance isolation. Select compatible dimming, fan speed/drive and AV sequencing hardware only with product/interface evidence; update E3/E4 if sizes/routes change.
3. **Complete one equipment-to-control map.** Map every controllable item/function to equipment ID/name/position, supply board/circuit/feeder, power/signal/control route, physical panel/control label, independent/group membership, channel/address/terminal, supported command, scene membership and evidence status. Maintain it through the shared register schema; extend the generator deliberately and preserve existing amber fields/retired IDs. Shared enclosures/feeders remain owned by distribution-controls. Functional audio zones and microphone channels remain distinct from mains circuits.
4. **Define quick and dynamic-air modes.** Use the existing names: Full service · evening, Weekday Mass, Prayer & adoration, Christmas & festivals, Festival · courtyard overflow, Cleaning, Night security and All off; include Towers Off/Evening/Festival and their F4 exclusion. Store explicit item/group setpoints and supported transitions, manual-override priority/reset, startup/ramp/AV sequence and requested-versus-available state. Integrate E2 air demand/schedule/opening sequences and any proposed sensor quality, hysteresis and dwell behavior. Preserve required ventilation/life-safety functions during discretionary energy reduction; do not assume a universal sensor threshold.
5. **Specify and test failure behavior.** Cover DB-2 feeder unavailable/restored, individual isolation, local mains restoration, controller/network/internet failure, invalid/stale/missing sensor feedback, communication loss, scene/manual conflict and emergency operation. Specify safe restart by load; current restoration of saved states is a behavior to review, not a physical default. Distinguish command, supply availability and measured feedback; missing telemetry never means confirmed operation. Local operation must have a defined recovery path.
6. **Align the simulator and future web contract.** Correct feeder protection across built-in/custom scenes, direct item edits, imports, undo/reload and restoration as needed; test independently of compact UI controls. Keep labels/setpoints consistent with the physical proposal, indicate unsupported/pending hardware functions, and preserve E1–E4 performance. The future published web app displays immutable scenarios and control maps only; it cannot issue physical commands or expose the offline editor.
7. **Prepare and review the witness procedure.** Specify individual/group dim/speed/level/mute, all modes, manual overrides, network-disconnected operation, feeder/power loss/restoration, controller/sensor failures and life-safety tests using the selected products. Have responsible designers check drawings/calculations. Mark software tests, bench product tests and site-witnessed tests separately; do not claim installation behavior from a mock.

Suggested commit boundaries: supply/load/calculation and board design package; shared mapping/schema with preservation tests; each coordinated control-behavior correction and mode matrix; witness procedure and reviewed design updates. Refresh electrical/register outputs whenever equipment, route, control mapping or specifications change.

## Planned deliverables

- Updated `docs/electrical-grid/controls.md`; proposed `board-design.md`, calculation references, single-line/functional drawings, board faces, circuit/cable/terminal schedules and interface records in that directory.
- Machine-readable control mapping and scene/state-transition matrix maintained through the owning exports/register workflow, including dynamic-air operation and state quality.
- Software regression evidence and a product/site witness procedure; operating, failure/restart and isolation instructions at their verified status.

## Checks and exit gate E5

- [ ] Supply/product/installation inputs needed by the accepted electrical design are verified; calculations and drawings have responsible electrical review. Missing construction-critical inputs block acceptance of sizing/protection, rather than becoming plausible catalogue choices.
- [ ] Every controllable function has an agreed physical independent/group mapping, route, label and supported interface; unresolved critical channels/terminals cannot be called installation-ready.
- [ ] DB-1/DB-2 feeder, LC-1/FC-1/AV-1 relationships, enclosure/access/thermal constraints and power-versus-audio distinctions reconcile to E3/E4 and registers.
- [ ] Every quick mode and dynamic-air transition has an explicit setpoint/priority/override/failure/restart definition; required emergency and ventilation functions are protected.
- [ ] Tests cover all simulator entry paths, feeder loss/restoration, overrides and persistence; command is never mistaken for supply or measured feedback. Product/site tests remain separately identified until witnessed.
- [ ] Applicable model, estimates, strict/full simulator and electrical checks, actual desktop controls and saved-layout checks run; numerical/performance regressions are resolved without relaxed targets.
- [ ] Single-source mappings, docs, matched exports, six register structures/retained inputs and summary reconcile; `--verify-workflow` and diff checks pass. Public/protected web boundaries remain read-only.

## Risks and handover

Without actual supply/fault data and product interfaces, finish the functional diagram, labels, schemas and test procedures, record exact requests, and leave the phase unmerged. Do not buy or energize hardware through this software task. Physical connection/commissioning requires the separate engineered plan and site authorization. Handover E5 with checks, product/calculation revisions, remaining witness work and exact limitations for E6.
