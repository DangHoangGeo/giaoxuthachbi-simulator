# Main/sub-board manual controls and quick modes

Owner's priority, recorded 7 October 2026. **Design brief:** optimize equipment placement, coordinate wiring in 2D/3D, and provide understandable physical manual controls and quick modes with the same intended behavior as the web app. Hardware selection and installation approval remain pending.

## Shared equipment and control map

Every controllable light, fan and audio function needs a stable equipment ID mapped to its location, supply circuit, board, control channel and operator label. Agree explicitly which items need independent physical control and which may operate as a group. A software switch does not prove that the proposed wiring allows independent switching.

Use one mapping to drive the route maps, schedules, board-face labels, web controls and scene matrix. Record at least:

| Field | Required content |
| --- | --- |
| Equipment | Stable ID, type, plain-language name, area, X/Y/Z, mounting and aim. |
| Supply | DB-1/DB-2, supply circuit, feeder relationship and connected/operating load basis. |
| Routes | Power, signal and control route IDs; endpoints and required containment. Separate these functions even when they share a coordinated route corridor. |
| Manual control | Board/panel location, label, independent item or group, channel/address, and on/off/dim/speed/level/mute function as appropriate. |
| Quick modes | Scene membership, requested state/setpoint and any manual-override rule. |
| State and evidence | Commanded state, supply availability, actual feedback if available, fault/restart rule, product/source revision and design status. |

Maintain this mapping in the [category Excel equipment and line registers](categories/README.md), following their [refresh workflow](register.md). Keep shared enclosure/feeder records in distribution-controls and link to them by ID from each usage file. Unknown physical channels, terminals and addresses stay pending. Extend the shared register schema when additional approved fields are needed; do not fill it with invented hardware details.

## Current simulator arrangement

The source of circuit membership and scene values is [engine.js](../../Thach_Bi_Viewer/simulator/engine.js); compact controls are in [controls.js](../../Thach_Bi_Viewer/simulator/controls.js). The following groups include catalogue options that may be hidden or absent from a particular layout.

| Board / panel | Current function and groups | Physical design to develop |
| --- | --- | --- |
| DB-1, service room | Main distribution reference and DB-2 feeder. Interior lights L1/L2/L3/L8/LA/LD, circulation/path lights L4/L5, exit-sign group E1, fans F1/F2/F3/V1, audio groups A1–A5/MIC and seasonal X1. | Checked distribution diagram and circuit schedule; clearly labeled routine controls by area; service access, isolation, supply indication and main/sub-board identification. |
| DB-2, inside main entrance | Sub-board for L6 façade/towers, L7 festival exterior, L9 stage/central door and F4 trial entrance circulators. Fed from DB-1. | Local manual control for those groups, feeder-availability indication and tower quick-mode buttons. Confirm physical enclosure size and installation details. |
| LC-1 / lighting operator controls | Lighting groups and scene functions. | Required individual/group on/off and dimming channels; main scene keypad and any agreed local repeat controls. |
| FC-1 / fan operator controls | Fan/exhaust groups and speed selection. | Compatible controls for the selected motors; independent/group operation and clear Off/Low/Medium/High or product-specific labels. |
| AV-1 / audio operator controls | Signal routing reference, speaker zones and microphones. | Zone level/mute, agreed microphone access and rack power sequencing. Audio zones and passive-speaker lines are not separate mains circuits merely because the web app lists them as “circuits.” |

Keep protective devices, routine operator controls and control logic distinct in the physical drawings. The web app's breaker graphics and provisional ratings are a functional interface, not a construction board design. The electrical designer must select the appropriate switching/control devices and interfaces.

## Manual control behavior to specify

- Operators can identify and control each agreed item/group without using the web app. Lighting, fan speed and audio level/mute have distinct labels; avoid one ambiguous switch for unrelated functions.
- A quick mode applies its stored settings. A subsequent manual adjustment creates a clearly indicated override; define when it resets. Recalling a scene must have an explicit, predictable effect on overrides.
- An open feeder or protective isolation prevents downstream operation. Quick buttons, saved/custom scenes, direct item edits and imported layouts must not imply that unavailable equipment is energized. Distinguish “requested on” from “supply unavailable.”
- The current compact DB-2 controls and built-in scene path check feeder availability. Audit custom-scene, direct-edit and import paths before claiming the same protection across all entry points; the custom-scene path currently has no equivalent feeder check in `applyScene`.
- The current simulator restores DB-2's saved item switch states when its feeder is turned back on. Review whether that is appropriate for each physical load; specify restart behavior per system and test it. Do not transfer simulator behavior to installed equipment without that review.
- Required emergency functions and ventilation constraints take precedence over discretionary scenes. The simulator's **All off** keeps E1 exit signs on; this does not establish a compliant emergency supply or duration. Define the real life-safety design separately.
- Local operation must remain available without internet. Define controller/network failure behavior, safe manual recovery, authorized access and any actual-state feedback. Do not display a command as measured confirmation.

## Quick modes

Use these existing web-app names as the starting operator vocabulary. Final setpoints and physical button locations are a coordinated design decision. Exact simulator values remain in `SCENES` in `engine.js`; validate them against current performance rather than copying historical tables.

| Mode | Intended use |
| --- | --- |
| Full service · evening | Full congregation lighting, normal speech and quiet fan/ventilation operation. |
| Weekday Mass | Reduced occupied zones while retaining required sanctuary, circulation and air provision. |
| Prayer & adoration | Quiet, subdued lighting with the agreed reading and ventilation needs. |
| Christmas & festivals | Indoor festival service and decorative lighting; courtyard horns remain off in the current preset. |
| Festival · courtyard overflow | Explicit outdoor overflow operation, including courtyard horns; review its effect on indoor speech. |
| Cleaning | Task lighting and suitable ventilation; sound off. |
| Night security | Agreed access/security lighting and unoccupied operating state. |
| All off | Discretionary systems off; required maintained/emergency provisions remain subject to the life-safety design. |

DB-2 also has **Towers Off / Evening / Festival**: the current Evening button requests L6 + L9, Festival requests L6 + L7 + L9, and Off clears those three groups. These buttons do not operate F4. All remain dependent on the DB-1 feeder.

## Required design outputs and acceptance

1. A coordinated equipment-position schedule and per-zone light/sound/air results, with known failures visible.
2. Matching 2D and 3D route maps: stable IDs, board origins, endpoint continuity, mounting heights, power/signal/control distinctions and separately stated cable allowances. Moving an item must update both maps and schedules.
3. A main/sub-board functional diagram, proposed physical control-face layouts and the item-to-control schedule above. Provide an engineered single-line diagram and terminal/cable schedules before installation release.
4. A scene matrix with manual override, feeder-off, power restoration, controller failure and emergency behavior. Keep physical and web labels aligned; flag unsupported functions.
5. Witnessed tests for individual/group operation, dimming/speed/mute, each quick mode, downstream loss of supply, custom scenes, manual overrides, restart and offline operation. Test with real products during commissioning; software tests alone cannot validate hardware.

The present Excel register and JSON/CSV exports provide route and equipment data. The Excel register includes editable physical-control and approved-specification fields. They do not yet contain final physical control channels, an installation-ready board layout or a complete physical/web scene matrix. Those are explicit deliverables of this workstream.

## Local 3D review navigation · 8 October 2026

The local Wiring tab now filters by usage system, board, circuit or one equipment ID and retains the required upstream enclosure/feeder context. **Controls · circuit** opens the existing simulator dock at the corresponding board, fan regulator or sound strip. Opening this dock does not operate a circuit. Return through **Simulator → Wiring** to the retained view. This is a traceable review aid; unknown physical addresses and independent control capability remain pending. See [review layers](routing.md#local-engineering-review-layers--8-october-2026).

The 9 October connection inspector shows feeder/trunk/branch relationships above the local review filters and links each route to its details. It keeps AV rack power separate from microphone/loudspeaker signals. **Controls · circuit** still opens the existing simulator control without actuating it; the inspector does not assign physical terminals, channels or protective devices. Its filtered JSON snapshot is a review aid, not a physical board drawing.
