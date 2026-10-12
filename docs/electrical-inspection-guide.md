# How to inspect the electrical systems in the 3D model

For the parish priest and the local engineer · 9 October 2026 · [Bản tiếng Việt](electrical-inspection-guide.vi.md)

This guide shows how to look at every light, fan, loudspeaker, microphone, socket outlet and cable route in the church model, one system at a time. No special software is needed.

**What the model is.** A design-development tool. Positions, routes and numbers are proposals and estimates for discussion. **It is not an approved construction or wiring drawing.** Nothing in it switches real equipment. Cable sizes, breakers, the supply and every fixing still need the responsible electrical and structural engineers.

## 1. Open the model

1. Use a desktop or laptop computer with Chrome or Edge. No internet is needed.
2. Open the folder `Thach_Bi_Viewer` and double-click **`OPEN_CHURCH.html`**. Wait until the church appears.
3. **Explore** (top centre) lets you turn the church with the mouse. **Walk** lets you walk inside with the arrow keys.
4. Click **Simulator** (top right). A panel opens with these tabs: **Lights, Fans, Sound, Décor, Power, Wiring, Analysis, Settings**.
5. The **Controls** button at the bottom right opens the switch panel: **Scenes, DB-1, Towers, Fans, Sound**.

Your changes are saved automatically in this browser on this computer only. To keep or send a version, use **Settings → Save & share → Download layout (.json)**. Please do not use a reset button unless you intend to lose your changes.

## 2. A ten-minute look (for Father)

| Step | Do this | What you see |
| --- | --- | --- |
| 1 | **Controls → Scenes → Full service · evening**, and set the view to evening | The church as it would be lit for an evening Mass |
| 2 | Try **Weekday Mass**, **Prayer & adoration**, **Christmas & festivals**, **All off** | How each quick mode changes lights, fans and sound together |
| 3 | **Controls → Towers** | The front of the church: see section 6 |
| 4 | **Walk** to a bench, then **Simulator → Sound** and press **▶ Play** | The loudspeakers as heard from that seat (use headphones) |
| 5 | **Simulator → Analysis** | The list **Design checks**: what is still not good enough, in plain words |
| 6 | Left menu **Discover → Technical tours → Lights, Fans, Sound, Wiring** (added 11 October 2026) | Four short films of under two minutes each that explain one system at a time, with the model's own maps and its wiring view. **Esc** stops a film |

## 3. Look at one system at a time

Each tab lists its equipment by circuit. Click a row to select the item; the **⌖** button shows it in 3D. The switch at the left of a row turns that one item on or off in the model. The switch on the group heading turns the whole circuit.

| Tab | What to inspect | Useful numbers |
| --- | --- | --- |
| **Lights** | Every lamp, its circuit (L1, L2, L3 …), aim, output and dimmer | lumens, watts, beam angle, height |
| **Fans** | Ceiling, wall and exhaust fans; speed Off / 1 / 2 / 3 | airflow, watts and noise at each speed |
| **Sound** | Loudspeakers and the two microphones; level and delay | level at 1 m, feedback margin of each microphone |
| **Power** | The six socket outlets: section 5 | circuit rating, test load |
| **Décor** | Statues, flowers, candles, festival items (no cables unless lit) | — |

**Analysis** shows the results. Under **Show on the plan** choose **Light, Speech level, Clarity (STI), Air speed** or **Noise** to colour the floor. **Plan view (roof off)** gives a view from above. The table **At the sampled seats** compares the results with the brief. **Service electricity estimate** lists the watts of each circuit that is switched on.

## 4. Follow the cables (Wiring tab)

1. **Simulator → Wiring → Systems only.** The building disappears. Boards, cables and equipment remain. **Restore building** brings it back.
2. Under **Review layers** choose one system: **Lights, Sound & microphones, Fans & ventilation, Socket outlets, Exit signs, Powered decoration** or **Distribution only**.
3. Choose one **circuit** to see only that circuit with its supply. Choose one **equipment** row to trace that single item back to its board.
4. Click any cable in 3D, in the flat plan or in the list. It turns green and shows its **source, destination, circuit, length, height range** and the **X / Y / Z of every corner**.
5. **Fit review** frames everything in the current selection. **Show route** frames the selected cable.
6. **Controls · circuit** opens the matching switch in the Controls panel. It does not switch anything by itself.
7. **Start 3D walkthrough** goes through the installation review in nine steps, each with its open questions.
8. **Export systems JSON**, **Export schedule CSV** and **Export this review** save what you are looking at.

The boards are: **DB-1** main board, **LC-1** lighting controls, **FC-1** fan controls and **AV-1** sound rack, all in the service room behind the altar; and **DB-2** inside the main doors for the towers, façade and front stage. One feeder cable joins DB-1 to DB-2.

Colours show the system, not the wire insulation: amber lights, brown fans, blue sound, violet microphones, teal socket outlets, red feeders. Cable thickness on screen is enlarged for viewing; it is not a cable size. A route length is measured along the centre of the route and has no allowance for slack or terminations.

## 5. Socket outlets (Power tab)

| ID | Place | Circuit and board | Provisional rating |
| --- | --- | --- | --- |
| P-SANCT-B, P-SANCT-H | Each side of the sanctuary, on the axis-10 pier, 0.70 m above the side platform | P1 (side B), P2 (side H) · DB-1 | double 16 A outlet on a 16 A circuit |
| P-NAVE-B, P-NAVE-H | Middle of the church, each side wall beside the axis-6 pier, 0.45 m above the floor | P1 (side B), P2 (side H) · DB-1 | double 16 A outlet on a 16 A circuit |
| P-TOWER-B, P-TOWER-H | Inside each tower porch, on the front pier, 1.3 m above the tower floor | P3, P4 · DB-2 | lockable outdoor cabinet: one 32 A and two 16 A outlets on its own 32 A circuit |

- Select an outlet and move **Plugged-in load to test (W)** to try an appliance, for example 1 500 W for a cleaning machine. **Test load now** shows the amperes on that circuit and turns red if the circuit would be overloaded.
- The two tower points are for outdoor events (stage sound, lighting, stalls). They are **switched off in the model by default** and should be kept isolated and locked outside events.
- All socket circuits are planned with a 30 mA residual-current device. Ratings are planning values, not a finished design. The supply to the church, the main switch and the DB-1 → DB-2 feeder have **not** been sized for the two tower points yet: see the [engineering record](engineering/outlets-and-facade-statues.md).

## 6. The front of the church: three separate switches

Open **Controls → Towers**. Each button is a separate switch at DB-2:

| Switch | What it lights |
| --- | --- |
| **L10 · Façade statues & candles** | The Assumption between the towers and the two saints: hidden light lines in each niche and two candle lights on each base |
| **L6 · Façade & towers** | Floodlights on the towers and the façade |
| **L9 · Front stage & central door** | The open space in front of the church and the central door |
| **L7 · Festival exterior** | Bulb strings and festival floods, for feasts |
| **P3 / P4 · Event power** | The two tower socket cabinets |

**Off / Evening / Festival** set several of these together; each switch can still be changed afterwards. If the feeder to DB-2 is off at **Controls → DB-1 → Tower board power**, nothing at the front can be switched on.

## 7. Check list for the local engineer

1. In **Wiring → Review layers**, go through each system and each circuit. Compare every item's place and height with the building.
2. Open the [Excel registers](electrical-grid/categories/README.md), one file per system. Each has the sheets **Equipment**, **Electrical Lines** and **Route Points** with the same IDs as the model. The **amber columns** are for your entries: selected product, approved specification, cable, control label. Blank means not decided.
3. Read the [summary report](electrical-grid/summary-report.md) for totals, and the [routing notes](electrical-grid/routing.md) for how each kind of route is meant to be hidden.
4. Read the [open questions](engineering/questions-for-parish-and-designers.json). The first ones concern the supply: voltage, phases, earthing and fault level. Cables and breakers cannot be chosen before they are answered.
5. Read the words on each item and route: **CONCEPT** means an idea to review; **ENGINEERING HOLD** means do not build or buy until an engineer has checked it; **REVIEW REQUIRED** means a known conflict.
6. Results that still miss the brief are listed in **Analysis → Design checks**, including some dim seats, speech clarity in the wings and low microphone feedback margins.
7. Record site measurements and corrections against the equipment ID and route ID, so that the model and registers can be updated together.
8. Read the [walk-round safety and efficiency review](electrical-grid/safety-efficiency-review.md): what was found zone by zone, the comparison table for every circuit, the supply question for the event points, and where energy can be saved. Its numbers are comparisons for your own design, not a design.

## 8. What the model cannot tell you

- Whether a wall, beam or pier can carry a fitting, or where a hole or chase may be cut.
- The real light, sound and air: these need the selected products' data and measurements on site.
- Emergency lighting, lightning protection, earthing and fire stopping: each needs its own design.
- The printed A3 drawings and the cable and budget reports in `output/` were made before the socket outlets and façade statue lights were added. They are out of date for those items until they are rebuilt.
