# Thạch Bi Church — interior and building systems plan

**Working design brief · 5 October 2026, simulator update 6 October 2026 · for parish, architect and engineering review**

[Open the interactive plan](../Thach_Bi_Viewer/planning/index.html) · [Open the 3D simulator](../Thach_Bi_Viewer/OPEN_CHURCH.html) · [Simulator guide and results](simulator/guide.md)

## 1. Decisions and design basis

**Current work priority (7 October 2026):** optimize light, loudspeaker, microphone and fan positions together, coordinate their 2D/3D wiring maps, and develop main/sub-board manual controls and quick modes. See the [electrical grid and control workstream](electrical-grid/README.md) and [control-design brief](electrical-grid/controls.md). Maintain all equipment and electrical routes in the [category Excel registers](electrical-grid/categories/README.md), using the same IDs and positions as the layout and following the [register workflow](electrical-grid/register.md).

The intended result is a church where people can see the liturgy, understand speech, read comfortably, stay comfortable without air conditioning, and operate the building with simple, measurable controls.

The parish confirmed two alternatives: **two wider seating blocks with longer benches**, one each side of the centre aisle, or **four blocks with shorter benches**. The site is **756G+GFV, Nam Đồng, Ninh Bình, Vietnam**, and the entrance faces **east**. There will be **no air conditioning**. These site facts come from the owner; the [provided map link](https://maps.app.goo.gl/6kiSfCkEtHbMFMP6A) did not resolve in the research tool. Survey the exact azimuth, surroundings and openings before solar or wind analysis. Attendance, service schedule, budget, electrical service capacity and single-/three-phase supply remain unknown.

Use the original plans and dimension workbook for the envelope. Use the consolidated reference images for appearance. The interior furnishings, column diameters, equipment and this systems layout remain proposals. The planning map is a coordination drawing, not a construction drawing or a prediction of lux, acoustic coverage or airflow.

**Recommended direction:** compare two wide blocks against four short-bench blocks for sightlines, comfort, circulation and usable capacity before choosing. The long-bench proposal leaves row breaks around the existing columns and cross aisles. Longer benches do not remove column obstructions from the view, and neither proposal establishes approved capacity.

| Basis from the current model | Value / status |
|---|---|
| Main internal clear width | 14.50 m between inner wall faces |
| Main structural column rows | D/E, at ±3.60 m; 7.20 m centre-to-centre |
| Main column axes | 3–11; nine columns per row, 18 total |
| Typical longitudinal spacing | 4.50 m; axes 9–10 are 7.20 m apart |
| Main shaft diameter | 0.58–0.64 m taper in the model; section sheet 4 measures ≈0.60 m. **Confirm on site** |
| Column bases | 0.82 m square in the model; section sheet 4 measures ≈0.84 m wide, 0.60 m high. **Confirm on site** |
| Wider section at axes 9–10 | Both sides project; retained in both layouts |
| Sanctuary floor | +0.750 m relative to nave ±0.000 m |
| Roof ridge / main eave | +12.472 / +7.130 m |
| Seating row pitch | 1.13 m, an existing furnishing proposal |

Source files: `docs/layout_design/04-top-view.png`, `06-slide-cut-inside-church.png`, `07-slid-cut-of-the-atlar.png`, `Thach_Bi_All_Views.png`, and `Thach_Bi_Church_Dimensions.xlsx`.

## 2. Why the columns feel crowded

There is a physical reason and a presentation reason. From the outer seats, the line toward the sanctuary crosses a row of structural columns. The repeated 4.50 m bays overlap in perspective. Dark timber finishes and the earlier 68° vertical walking camera (about 100° horizontal on a laptop) made the foreground columns visually prominent. The previous standing camera at 1.65 m also did not represent a seated congregation.

The 6 October scale audit found the main dimensions correct and fixed three presentation problems. The walking camera now uses a natural 75° horizontal lens, walks at 1.4 m/s and stands at 1.60 m. The roof frame now follows section sheet 4: 0.59 m-deep tie beams at +8.59 m, side beams at +6.66 m and purlins about 0.5 m apart. King posts, diagonal braces and knee braces are not on the drawing; they are now an optional, hidden comparison layer. The entrance hall behind the main doors had no roof in the model. It now has the +8.39 m terrace slab shown on the front elevation and a gable wall on axis 2′ above it; both are inferred from the elevations and need CAD confirmation. See the [simulator guide](simulator/guide.md#1-is-the-model-to-scale-why-did-the-interior-feel-cramped).

The simulator now offers **2 wide blocks / 4 short-bench blocks** and **seated views near the centre aisle / near the side aisle at 1.15 m eye height**. Switching layouts changes the furniture and its walking collisions, while keeping the source column grid. These camera points are proposed seated eye positions, not an anthropometric standard.

### Initial sightline audit

The audit uses the actual model geometry with THREE.Raycaster. It tests the 18 main shafts, bases/collars and the sanctuary piers. Each proposed long bench has eight sample positions; each short bench has three. Positions are spaced 0.55 m apart, using a nominal usable length equal to bench length minus 0.075 m. Rays are sent from a 1.15 m eye height to one point on each of the altar, ambo speaker position and crucifix. The chosen target locations are also proposed model locations.

| Alternative | Rows / benches | Sample positions | Altar point blocked | Ambo point blocked | Crucifix point blocked |
|---|---:|---:|---:|---:|---:|
| Two wide blocks, 4.65 m benches | 18 / 36 | 288 | 102 | 107 | 122 |
| Four blocks, 1.73–1.86 m benches | 24 / 96 | 288 | 86 | 85 | 92 |

Both alternatives include **two additional complete rows in each of bays 2–3 and 4–5, and one in bay 8–9**: five added rows per layout. The second added row in bay 8–9 (X 35.790 m), the front row of the nave, was removed on 7 October 2026 as too close to the sanctuary; 3.97 m now stays clear between the front benches and the first sanctuary step. The audit targets also follow the 7 October sanctuary: the ambo point is 2.3 m in front of the altar and the crucifix point is inside its niche. The added benches are outlined in the interactive map. Existing rows are retained. The following added-row coordinates are measured along the numbered drawing axes, in metres from axis 1:

| Drawing bay | Added row positions X | Addition in two-block layout | Addition in four-block layout |
|---|---|---:|---:|
| 2–3 | 6.490, 7.620 m | 4 long benches | 8 short benches |
| 4–5 | 15.610, 17.790 m | 4 long benches | 8 short benches |
| 8–9 | 33.610 m | 2 long benches | 4 short benches |

This audit supersedes all earlier sample counts, including the incorrect two-block interpretation that simply removed the outer benches. Its totals are not a conclusion about the maximum capacity of either arrangement.

**These are sample counts, not approved seating capacity or a guarantee of a complete sanctuary view.** The audit excludes people, pew backs, other furniture, flowers, lectern bodies and most decoration. A ray reaching the altar centre does not establish visibility of the whole altar. The interactive map allows switching targets and inspecting each sampled seat.

Next, test target areas rather than single points: the altar top and celebrant, the ambo reader, sanctuary steps and crucifix. Include seated, standing and kneeling people, shorter occupants and wheelchair users; compare front/middle/rear rows. Use full-scale tape/chair mock-ups at representative blocked seats. If a structural change is still desired, the structural engineer must verify the actual column sections, loads, foundations and roof system first.

### Seating and circulation corrections to study

- In the two-block proposal, each bench is **4.65 m long**, centred at ±3.625 m across the nave. There are now 18 rows, with gaps around the columns and across the doorway bays. Intermediate supports are shown as a furniture concept, not a structural specification.
- The two-block model retains **at least 2.40 m clear at the centre aisle and 1.20 m beside each outer wall**, checked against actual furniture bounds. Confirm the required aisle widths through the occupancy and evacuation design.
- In the four-block proposal, central benches are 1.86 m long and outer benches 1.73 m, across 24 rows. Its centre aisle is about 2.44 m between nominal bench lengths, reduced by end profiles. The outer-wall gap is only about 0.40 m before end projections; **do not count that gap as a circulation aisle.** These outer benches need a compliant route from their inner ends.
- Eight places per long bench or three per short bench at 0.55 m spacing are sampling assumptions. Final usable seating length, end details and accessible positions must be checked.
- A 1.13 m row pitch minus the current conservative 0.965 m furniture/collision footprint leaves only about 0.165 m between those envelopes with kneelers down. This is not an acceptable assumption for unobstructed row circulation. Resolve folding kneelers, end profiles and row pitch in the furniture mock-up; any increased pitch reduces capacity.
- To fit the added rows in doorway bays 4–5 and 8–9, the model now reserves **1.20 m cross aisles** at X 16.225–17.425 m and 34.225–35.425 m. The former 2.40 m cross-aisle allowance is reduced. Furniture and collision bounds were checked against these corridors in both layouts. The doorway locations, veranda landings and exterior stairs are unchanged. Confirm these narrower routes against the final occupancy/access design before adopting the seating; this is a model proposal, not an egress approval.
- Reserve wheelchair and companion positions with accessible routes and useful sightlines before freezing capacity. Check access from the courtyard up to the raised floor; the present visual stair model is not an accessible-route design.

Have the local design team verify occupancy classification, exit quantity/width, travel distances, door operation and accessibility against the applicable approvals. Relevant starting documents are [QCVN 06:2022/BXD](https://vanban.chinhphu.vn/?classid=1&docid=207059&pageid=27160&typegroupid=6), its [2023 amendment record](https://vbpl.vn/TW/Pages/vbpq-vanbanlienquan.aspx?ItemID=162885), and [QCVN 10:2024/BXD](https://vbpl.vn/bothongtin/Pages/vbpq-print.aspx?ItemID=169517). Confirm current applicability and amendments for this specific project; this brief does not certify compliance.

## 3. Lighting: illuminate people, books, paths and architecture separately

Use dimmable, serviceable luminaires with verified photometric files and accessible drivers. Decorative chandeliers can remain, but their appearance should not dictate all reading or sanctuary light. Keep illumination warm and consistent with the reference materials; test a **3000 K, CRI ≥90 interior palette** as a design preference. Check driver flicker across dimming levels and against any video camera shutter settings.

The following numbers are **initial design targets proposed for the brief, not values quoted from Vietnamese code or a verified lighting calculation**. The lighting designer should reconcile them with applicable requirements, parish preferences and the current IES worship-space guidance.

| Zone | Initial maintained-light brief | Control / verification |
|---|---|---|
| L1/L2 central and outer congregation blocks | Trial 200–300 lux on books at a defined reading plane, initially 0.80 m | Separate block/daylight zones; check minimum/average and shadows from columns |
| L3 altar and ambo | Trial 300–500 lux on task surfaces; assess faces vertically | Independent key/fill aiming, shield sources from congregation; agree camera needs separately |
| L4 nave circulation and side verandas | Trial 100 lux on circulation surfaces | Avoid sudden dark transitions; illuminate thresholds |
| L5 front platform, side landings and exterior paths | Trial 20–50 lux on ordinary walking surfaces, with explicit step-edge checks | Shielded downward light; verify glare, wet surfaces and neighbouring property spill |
| L6 façade / tower accents | Mock-up-led brightness and restrained highlights | Separate time schedule; façade lights can switch off while safe access lighting remains |
| E1 emergency / exit lighting | A separate code-based design | Independent emergency provisions, testing and loss-of-supply operation |

The **east-facing entrance** needs morning-glare review; the west sanctuary end needs afternoon solar-gain and glare review. Side daylight zones should respond independently. The two rows of trees are landscape intent, not a substitute for a solar-shading calculation.

Model the actual luminaires using IES/LDT files, surface reflectance assumptions, maintenance factors, furniture and multiple daylight scenes. Produce lux grids, glare checks, vertical face illumination and external spill calculations. The [IES Lighting Library](https://ies.org/standards/lighting-library/) includes worship-space guidance and maintained-illuminance recommendations; [DIALux](https://www.dialux.com/en-GB/ldt-editor/) supports importing IES/LDT photometry, with [scene and furniture calculation options](https://www.dialux.com/en-GB/dialux-for-interior-lighting/module-4-calculation). The simulator scales its lights from lumens and calculates lux with a simplified point-source model. That is useful for comparing options, but it is not photometric evidence.

**Control proposal:** wired DALI-2 for dimmable lighting, wall scene buttons at the sacristy and entrance, and local operation during internet failure. Require certified compatible components. Occupancy and light sensors are covered by [DALI Parts 303 and 304](https://www.dali-alliance.org/dali/sensors.html). Use a service-mode hold so still, seated people do not trigger lights-off. Energy reporting under [Part 252 is optional for DALI-2 and mandatory for D4i drivers](https://www.dali-alliance.org/dali/data.html); specify the feature explicitly and reconcile it with circuit meters. Luminaire telemetry does not replace a billing meter.

## 4. Sound: speech clarity before loudness

A long, hard-surfaced church can have strong reverberation. A loudspeaker power rating or attractive 3D speaker symbol cannot establish intelligibility. Measure background noise and octave-band reverberation with fans off and at the intended service setting. Model absorption using the actual roof lining, walls, floor, seating and occupancy.

Start the design study with directional loudspeakers at the sanctuary aimed toward the congregation, plus individually delayed fills only where coverage and direct-to-reverberant sound need them. The map marks **study zones**, not a final speaker count or beam pattern. Compare central and outer blocks, the wider wings and places behind columns. Avoid aiming sound into the roof, rear wall or open microphones. Consider an assistive listening system with the parish.

Provide lectern and celebrant microphones, a restrained choir/monitor system, DSP routing/EQ/delay/limiting and simple locked presets. Put technical adjustments behind an installer interface; the operator needs “Speech”, “Choir” and service-volume controls. Sequence rack power according to equipment instructions, normally amplifiers on last and off first. Keep protective earthing intact; solve noise with proper balanced wiring, routing and isolation methods.

**Proposed acceptance brief:** STI ≥0.60 at the agreed occupied-seat test grid under normal service background noise; review every failing seat, rather than relying only on a room average. This is a project target, not a claimed statutory threshold. Agree a level-uniformity target, initially ±3 dB over ordinary seating, and a service-mode background-noise target, initially around 35 dBA where practicable. Confirm suitability after the survey. Do not choose an RT60 target until volume, music priorities and occupied/unoccupied conditions are defined.

[IEC 60268-16:2020](https://webstore.iec.ch/en/publication/26771), including its [2025 corrigendum](https://webstore.iec.ch/en/publication/107581), defines STI methods. [NTi Audio's STIPA measurement guidance](https://www.nti-audio.com/en/download/speech-intelligibility-stipa-4) provides an example of professional commissioning instrumentation. A generic WebAudio reverb/convolver can demonstrate an effect, but cannot predict this church's acoustic field. The simulator's listening mode uses real loudspeaker delays and this room's estimated octave-band reverberation, so it is a better comparison aid, but it is still not a prediction. Model in a room-acoustics tool and verify on site with calibrated measurements.

## 5. No-AC comfort: fans plus a real ventilation path

Fans move air over people; they do not lower the room's dry-bulb temperature or deliver outdoor air by themselves. A high roof and open doors also do not guarantee adequate occupied-zone ventilation. Coordinate three separate tasks:

1. **Reduce heat gain:** investigate roof insulation/radiant conditions, a ventilated roof build-up, shaded openings and west-end protection, without changing the approved façade casually.
2. **Provide outdoor air:** survey which windows/doors can actually open and their effective free area. Study cross-flow through the two long verandas and a protected high-level discharge path. Check still-air, wind-driven rain, noise, insects, security and crowded-service cases. If natural ventilation fails, assess quiet, controlled high-level exhaust with sufficient make-up air. New roof vents or penetrations require architectural and structural coordination.
3. **Provide local air movement:** compare several independently controlled medium fans over seating zones with a small number of larger fans. The roof trusses, chandeliers, column spacing and maintenance access may favour zoned units. Select using measured air-speed maps and sound/power data, not diameter or advertised airflow alone.

The [CBE fan design tool](https://cbe.berkeley.edu/research/advanced-ceiling-fan-design-tool/) draws on full-scale fan measurements; its [design guidance](https://cbe-berkeley.gitbook.io/fans-guidebook/practitioner-summary/design-tools) combines thermal-comfort and fan-layout tools. For the first mock-up, trial adjustable occupied-seat air speeds around **0.3–0.8 m/s** in warm conditions, then adjust from comfort feedback and measured temperature, humidity and radiant conditions. This range is a proposed test brief, not a guarantee for hot/humid extremes. Fans-only operation needs an agreed extreme-heat response if comfort cannot be maintained.

Locate fan test zones between structural bays. Verify manufacturer clearances, mounting loads, safety restraints, blade-to-light separation and fan/beam/chandelier interference. Do not blow directly onto microphones, altar candles or loose pages. Select a quiet service speed that still meets comfort targets. Compare fan noise and speech performance together; raising PA volume to mask noisy fans is a poor trade.

Install representative temperature/RH/CO₂ sensors near occupied areas, away from direct breath, sun, doors and fan discharge; include an outdoor reference and, if useful, one high-level temperature point. CO₂ is a ventilation diagnostic with limitations, not a complete IAQ or health certificate. Set ventilation-control thresholds through the design calculation and commissioning rather than adopting an unexplained universal 1000 ppm limit. See [ASHRAE's 2025 indoor CO₂ position document](https://www.ashrae.org/file%20library/about/position%20documents/pd-on-indoor-carbon-dioxide-english.pdf).

For Ninh Bình, obtain representative hourly weather and local wind/obstruction information before predicting annual comfort. The [World Bank Vietnam climate profile](https://climateknowledgeportal.worldbank.org/sites/default/files/2021-04/15077-Vietnam%20Country%20Profile-WEB.pdf) supplies regional context, not a church-site wind study. Test hot/still, wet, cool and peak-attendance conditions. Cool-season control should reduce or stop circulation fans while retaining the required outdoor-air provision.

## 6. Electrical distribution, measurement and controls

### Proposed architecture

```text
Utility supply → main protective distribution → main interval meter
                      ├─ Interior lighting submeter → protected circuits → DALI drivers
                      ├─ Exterior lighting submeter → protected circuits → lighting controls
                      ├─ Fans / ventilation submeter → protected circuits → approved fan controls
                      ├─ AV submeter → protected AV circuits → sequencer / DSP / amplifiers
                      ├─ Other loads submeter → sockets / ancillary equipment
                      └─ Required life-safety supplies and emergency provisions

Main meter + submeters ── wired Modbus/BACnet gateway ── local historian/dashboard
Light / presence / temperature / RH / CO₂ sensors ──── local scene controller
Wall buttons + service schedule ────────────────────── local scene controller
Local scene controller ── approved interfaces ──────── lighting / fans / ventilation
```

This is a functional architecture. A meter does not provide overcurrent protection, and a dashboard does not replace breakers or safety interlocks. Never shed emergency systems or disable required ventilation to hit an energy target. Physical manual controls must remain usable if the network or server fails; the engineer must define safe states and restart behaviour for each circuit.

Before sizing anything, record the service voltage/phases, main rating, earthing arrangement, available capacity and fault level, existing wiring, lightning/surge protection and expansion needs. The electrical engineer must design cable sizes, voltage drop, protection/selectivity, isolation, RCD requirements, driver/motor inrush, leakage, harmonics, phase balancing and emergency power. [QCVN 12:2014/BXD](https://vbpl.vn/TW/Pages/vbpq-toanvan.aspx?ItemID=111843) is a relevant published electrical-installation reference; confirm the current applicable provisions. Meter/CT installation belongs to a qualified electrician.

### What to record

| Measurement | Purpose / proposed record |
|---|---|
| Main and subsystem cumulative kWh | Reconcile the bill and locate consumption; maintain counter continuity across resets |
| True active W/kW | Actual load at each scene; do not substitute rated watts or dimmer percentage |
| Interval demand | Save 1-minute averages and 15-minute energy/demand aggregates; use the utility's interval if different |
| Voltage, current, apparent power and power factor | Check loading and, if three-phase, imbalance; distinguish kW from kVA |
| THD and event data where justified | Investigate LED-driver/fan-controller power-quality issues with suitable instruments |
| Temperature, RH, CO₂, sensor quality | Link energy to occupied comfort and ventilation conditions |
| Scene, occupancy estimate, device state and alarms | Explain why the system ran; flag missing/stale readings |

Use meters with documented accuracy, correct CT range/orientation and an accessible protocol/register map. [Schneider Electric's Modbus measurement documentation](https://productinfo.se.com/comx/5a14eb0d46e0fb00018c2ad4/Com%27X%20210%20user%20manual/English/Bookmap_ComX210UserManual_0000158936.xml/%24/C_DeviceSettings_ModbusMeterMeasurements_0000157289) illustrates the available quantities; it is a capability example, not a product selection. Vendor-neutral interfaces allow an installer to propose equivalent equipment.

Log locally with clock synchronization, quality flags, daily backups and CSV export. Separate the control network from guest Wi-Fi; use installer/operator roles, authenticated access and an audited remote-access path. Do not expose Modbus directly to the public internet. The first integration should be **read-only metering**, followed by controlled commissioning of physical outputs.

### Operating scenes

| Scene | Lighting | Fans / ventilation | Sound |
|---|---|---|---|
| Small weekday service | Occupied central zones, sanctuary task light, safe routes | Occupied zones at quiet comfort setting; outdoor air for occupancy | Speech preset |
| Full service | Both seating areas, sanctuary and circulation | All occupied zones; verify peak ventilation and noise | Calibrated full-coverage preset |
| Cleaning | Appropriate task light in the working zone | As needed for workers and ventilation | Off |
| Night security | Necessary paths/entrances; timed façade accents | Site-specific unoccupied ventilation strategy | Off |
| Fault / loss of mains | Required emergency operation | Engineer-defined safe state | Emergency functions, if specified, separate from ordinary AV |

Start with schedules, manual scene buttons, daylight adjustment and unused-zone reduction. Add demand alerts after obtaining a baseline. Defer discretionary façade lighting first if necessary; preserve service functions, safe paths and air quality. A fan speed setting is not a power reading; obtain the real speed–W curve. Likewise a 50% light command is not necessarily 50% input power.

**Energy and cost:** `kWh = Σ(active watts × hours) / 1000`. Calculate cost with the actual contracted tariff, time bands, taxes and any demand charges. The interactive page has a clearly labelled example calculator; it is not live metering or a quotation. Do not set a church-wide breaker rating from that example.

Measure at least a representative month, including quiet days and full services. Track kWh/service, kWh/occupied hour, peak kW, after-hours load and comfort/air-quality exceptions. Normalize comparisons for attendance, duration and weather. Compare a baseline with a changed control sequence under comparable conditions, following the logic of [DOE metering guidance](https://www.energy.gov/cmei/femp/metering-federal-buildings) and [measurement and verification options](https://www.energy.gov/cmei/femp/measurement-and-verification-options-federal-energy-and-water-saving-projects). Do not promise a savings percentage before measurement. Assess solar/storage only after the load profile, roof/heritage constraints, tariffs and utility interconnection are known.

## 7. Delivery map and acceptance gates

| Stage | Owner and output | Gate to proceed |
|---|---|---|
| A · Confirm brief and survey | Parish + architect: attendance, service schedule, accessible seating, measured columns/openings, precise orientation, utility survey | One signed basis drawing and an unresolved-items list |
| B · Seating and sightlines | Architect: two/four layouts, real bench/kneeler dimensions, occupied sightline map and exit/access checks | Parish selects a layout; engineer verifies circulation/capacity |
| C · Coordinate systems | Lighting, acoustic, ventilation and electrical designers: equipment data, calculations, circuit/control schedule and clash review | Lux/glare, speech, airflow/noise and electrical calculations reviewed together |
| D · Full-scale trial | Suppliers/designers: one typical bay plus sanctuary light and speaker trials | Parish accepts reading, faces, sound and fan comfort at representative seats |
| E · Tender and construction | Coordinated drawings, quantity/load schedules, maintenance access and approved equipment equivalents | Installation follows signed engineering design; no purchases from illustrative model quantities |
| F · Commission | Recorded lux grids, STIPA/RT/noise, airflow/T/RH/CO₂, electrical tests, scene and failure tests | Every agreed target has a measured result or a documented corrective action |
| G · Operate and refine | Local dashboard, staff training, maintenance log, seasonal review | Representative-month baseline, then verified control improvements |

Commission lighting at night and with daylight; test emergency operation separately. Test sound with the normal fans running and validate occupied performance. Record airflow at seated ankle/torso/head levels and standing positions, including outer seats and wings. Verify local switches with network/internet disconnected, restoration after power failure, alarm handling, and that quiet worship does not cause occupancy sensors to turn systems off. Repeat comfort checks in a different season.

### Simulator implementation status

- **Implemented (5 October):** two wide blocks with long benches / four blocks with short benches; matching active furniture collisions; seated viewpoints near the centre and side aisles; source-derived floor-plan map; single-point structural sightline audit; planning layers and an example energy worksheet.
- **Implemented (6 October), design simulator:** every light, fan, loudspeaker, microphone and decoration is an object with its own switch, circuit and settings (lumens, dimmer, colour temperature, beam, fan speed, speaker level, delay and beam opening). The simulator also provides:
  - catalogue placement on the drawn structure, the operating scenes from section 6, undo and saved layouts;
  - lux, speech-level, STI, air-speed and noise maps, with results at 288 sampled nave seats;
  - design checks and a per-circuit energy estimate;
  - spatial listening with real delays, HRTF direction and this room's estimated reverberation.

  The earlier 262 lux / STI 0.62 / 0.46 m/s summary is historical. The 7 October review of the current sanctuary layout samples 368 seats and retains low ambo/altar microphone feedback margins, a wing speech-clarity shortfall and lighting/ventilation limitations. Results, revision context and methods: [simulator documentation](simulator/README.md).
- **Next model refinements:** adjustable real bench/kneeler geometry, wheelchair spaces, populated sightlines, confirmed column sections, IES/LDT photometry import, and equipment models replaced by the selected products.
- **Engineering work still required:** the simulator's lighting, acoustic and airflow figures are planning estimates. Certified photometric calculations, acoustic prediction and commissioning, ventilation/thermal analysis, structural review and electrical design are still required. There are no live meter connections or real device commands in this simulator.

The older `docs/simulator/old/Simulator_Test.md` contains illustrative circuit caps and simplified audio assumptions. Its 1800/2400/1200 W circuit numbers are not design ratings. A generic convolver is not a geometry-based echo calculation, and visual light-cone overlap does not establish illuminance. Use this brief and the commissioned engineering documents for subsequent decisions.

### Immediate information to collect

Expected normal/maximum attendance; number and duration of weekly services; chair/pew and kneeler preference; wheelchair/choir needs; measured column sizes; opening dimensions and operability; roof build-up; current power bill and supply rating; existing equipment/nameplates; neighbourhood noise constraints; budget and construction programme. These inputs determine the next revision rather than silently becoming assumptions.
