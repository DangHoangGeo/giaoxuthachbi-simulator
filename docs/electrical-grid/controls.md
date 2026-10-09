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
| DB-1, service room | Main distribution reference and DB-2 feeder. Interior lights L1/L2/L3/L8/LA/LD, circulation/path lights L4/L5, exit-sign group E1, fans F1/F2/F3/F5/V1, audio groups A1–A5/MIC, seasonal X1 and indoor socket circuits P1/P2. | Checked distribution diagram and circuit schedule; clearly labeled routine controls by area; service access, isolation, supply indication and main/sub-board identification. |
| DB-2, inside main entrance | Sub-board for L6 façade/towers, L7 festival exterior, L9 stage/central door, L10 façade statues and candles, F4 trial entrance circulators and event power P3/P4. Fed from DB-1. | Local manual control for those groups, feeder-availability indication and tower quick-mode buttons. Confirm physical enclosure size and installation details. |
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
- Required emergency functions and ventilation constraints take precedence over discretionary scenes. The simulator's **All off** keeps E1 exit signs on, and since 9 October 2026 the E1 routes leave DB-1 directly instead of the LC-1 lighting-control enclosure, so that no scene control stands between the main board and the signs. This does not establish a compliant emergency supply or duration. Define the real life-safety design separately.
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

DB-2 also has **Towers Off / Evening / Festival**: the current Evening button requests L6 + L9 + L10, Festival requests L6 + L7 + L9 + L10, and Off clears those four groups. These buttons do not operate F4. All remain dependent on the DB-1 feeder.

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


## Held wing control group · 9 October 2026

The [wing review](../engineering/wing-review.md) introduces logical **F5 · Wing wall fans · held review** for four small wall fans through **DB-1 → FC-1 → F5**. The 14 remaining nave ceiling fans stay on F1. The sixteen nave wall fans on F2 (eight per side) are shown by default but OFF in every built-in mode; their visibility does not enable them. Manual simulator operation remains available for comparison. L63/L65/L67/L69 remain four chandelier items on L8; four former light IDs and four appended fan IDs are retired. S276/S278 are the two wing wall speakers on A1, facing −X toward the entrance; S275/S277 are retired. Microphones and DB-1/DB-2 feeder logic are unchanged. Four unpowered Peter/Paul pictures are decoration records without circuits to energize or electrical routes.

| Built-in review mode | L8 dim | F5 | F2 |
| --- | --- | --- | --- |
| Full service / Christmas / courtyard festival | 1.00 | Low (1) | OFF |
| Weekday Mass | 0.75 | Low (1) | OFF |
| Prayer & adoration | 0.25 | Low (1) | OFF |
| Cleaning | 1.00 | Low (1) | OFF |
| Night security / All off | 0 | OFF | OFF |

These states are reproducible comparison inputs. Quiet-prayer noise, thermal comfort, light minima, speech and physical concealment remain held; the matrix is not an approved operating policy. F5 has no assigned physical control/channel/terminal or protective device. FC-1 capacity, regulation compatibility, inrush, restart/isolation and safe commissioning require the electrical/mechanical designers. Generated routes and drawings express logical connectivity only. The Wiring tab labels the proposal ENGINEERING HOLD and compares each side’s actual equipment content and visible counts with the source review. The saved migration marker is history only. Explicit per-side lights/fans adoption writes a full backup first and supports Undo/Redo while retaining unrelated edits; current-layout or backup persistence failure blocks the update. This is a local model edit, not a physical command. See the [saved-layout workflow](../engineering/wing-review.md#saved-layouts).


## Nave wall-fan quantity revision · 9 October 2026

[Eight wall fans per side](../engineering/nave-wall-fans.md) means sixteen F2 items through DB-1 → FC-1 → F2, visible by default and OFF in every built-in scene. Six old IDs remain and ten named IDs are appended; all receive matching drop routes. Representative maximum F2 mains proxy is880W; the simulator breaker graphic is not an approved protective-device selection. Product motor loads/inrush, physical channels, regulation compatibility, restart/isolation and actual cable/protection remain pending. Per-side adoption in Wiring changes model geometry/visibility with durable backups and Undo, preserving existing operating overrides and unrelated equipment. It issues no physical hardware command.

## Separate front switches, statue light and socket circuits · 9 October 2026

Owner requirement (`USER CONFIRMED`, 9 October 2026): the light on the statues, the light on the towers and the light on the open space (stage) must each have their own switch. In the simulator these are three separate DB-2 circuits, each with its own switch on **Controls → Towers**:

| Circuit | Operator label | Content |
| --- | --- | --- |
| L10 | Façade statues & candles | Nine hidden light lines and six candle lights in the three façade niches |
| L6 | Façade & towers | Tower and façade floods |
| L9 | Front stage & central door | The open space in front of the church and the central door |

L7 (festival exterior) and the event power circuits P3/P4 are further separate switches on the same board.

| Built-in mode | L10 |
| --- | --- |
| Full service · evening / Christmas & festivals / Festival · courtyard overflow | 1.00 |
| Weekday Mass / Prayer & adoration | 0.60 |
| Cleaning / Night security / All off | OFF |

Socket circuits are in **no** quick mode. P1/P2 (indoor, DB-1) stay as they are set, including in All off, so cleaning equipment can be used; P3/P4 (tower event points, DB-2) are OFF by default and are meant to be isolated and locked outside events. Like every DB-2 circuit they cannot be switched on while the DB-1 feeder is off, and the feeder switch restores their previous state when it is turned back on: review that restart rule for event power before any physical design.

Provisional planning ratings: P1/P2 16 A and P3/P4 32 A, each with 30 mA residual-current protection. The simulator shows these ratings on the board graphics in place of its usual load-derived breaker size. They are not selected devices. Physical switch positions, labels, lockable isolation, channels, protection, discrimination with the feeder and the supply itself remain pending; see the [coordinated record](../engineering/outlets-and-facade-statues.md) and questions Q42–Q46. These states are comparison inputs, not an approved operating policy.
