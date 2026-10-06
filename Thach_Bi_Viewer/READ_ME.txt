THẠCH BI CHURCH — EASY-OPEN VIEWER

1. Download and extract the whole ZIP file.
2. Open OPEN_CHURCH.html in your web browser.
3. Wait for the church model to appear, then choose Go inside.

Keep all files and the references folder together. Do not open the HTML inside
a ZIP archive or a document preview. The interactive model needs JavaScript
and WebGL 2. It works without installing a server or downloading dependencies.

If the 3D view cannot start, the page shows a recovery message and reference images.
Try the lighter graphics option to reduce graphics-memory use.

Explore: drag to orbit, scroll/pinch to zoom, right-drag to pan.
Walk: W A S D / arrow keys to move, drag to look; touch joystick on phones.
Esc leaves Walk mode. References opens the nine retained reference images.

The original architectural drawings and measurement workbook govern dimensions.
Finishes, furniture and lighting are visual proposals.


UPDATED 5 OCTOBER 2026
- Ivory plaster, terracotta tiles, gray rubble stone and matching dark timber
  doors/tower shutters. All material maps are local; no network assets needed.
- Side doors at the outer wall; six landings and eight parallel flights. The
  first doorway has opposed flights. There are no rear end-wall stairs.
- Flat front platform before the stairs, within the 27.254 m facade width and
  1.600 m above the courtyard. Tower front portals remain open to rear walls.
- Plan plinth witnesses: body 22.489 m, projecting wings 28.158 m. Structural
  grids, source levels and roof topology remain the shared model reference.
- Carved door panels, stone balustrades, exposed timber and the sanctuary's
  three-lobed arch. Two rows of eight trees, with a Show trees switch.
- View settings contains Side stair & door and Wider section 9–10 checkpoints.
  Front facade opens the entrance decoration close-up. Evening lights both
  exterior and interior. Doors open in Walk mode and close in Explore mode.

Exact ornamental profiles, stair tread count, furnishings, lighting and the
sanctuary arch's longitudinal placement remain visual proposals. The workbook
retains unresolved drawing dimensions. This viewer is not a construction model.

Maintainable refinement: realism.js. References: references.js and
references/manifest.json. Original runtime backup: ../review/original.
Geometry checks: ../scripts/verify_model.cjs (run with Node.js).

INTERIOR AND SYSTEMS STUDY — 5 OCTOBER 2026
View settings → Seating layout: 2 wide blocks with 4.65 m long benches,
or 4 blocks with 1.73–1.86 m short benches. These are furniture proposals.
Both options add two complete rows in each bay 2–3, 4–5 and 8–9.
Totals: 2 blocks = 19 rows / 38 benches; 4 blocks = 25 rows / 100 benches.
Door-bay cross aisles are now proposed at 1.20 m; final access review is pending.
The switch updates furniture, walk collisions, minimap and exported geometry.
Seated: near centre aisle / near side aisle compares positions at 1.15 m eye height.
Open planning/index.html for the interactive plan, system zones and example
energy worksheet. Full researched brief: planning/brief.html; editable source:
../docs/interior-systems-plan.md. Site: Nam Đồng, Ninh Bình; east-facing entrance;
no air conditioning, as confirmed by the owner. Attendance/supply rating pending.
Seat samples are not approved capacity. Sightline rays only check structural
columns/piers against one point per target; people and other obstructions are
excluded. Light, sound and airflow estimates: see DESIGN SIMULATOR below.
Rebuild geometry-derived plan data: node ../scripts/verify_model.cjs --plan.


DESIGN SIMULATOR — 6 OCTOBER 2026
Header → Simulator opens a test bench for lights, fans, loudspeakers,
microphones and decoration. Every object has its own on/off switch; circuits,
dimmers and scenes (Full service, Weekday Mass, Prayer, Christmas, Cleaning,
Night security, All off) switch groups. Click an object to edit its position,
aim, lumens, colour temperature, beam, fan speed, speaker level, delay and
beam opening. Add products from the catalogue by clicking a beam, ceiling,
wall, column or floor; click once to select, then drag to move (Shift-drag
changes height). Ctrl+Z / Ctrl+Shift+Z undo and redo. The layout is saved in
this browser and can be downloaded as .json (layout) or .csv (schedule).

Analysis colours the plan by light (lux), speech level, clarity (STI), air
speed or noise, lists results at 300 sampled seats against the brief, shows
reverberation time per octave and runs design checks: light through fan
blades, clearances, low chandeliers, items in aisles, microphone feedback,
overdriven speakers, fans at candles or microphones, echo and dim seats.
It also estimates electricity per circuit and per month.

Sound → Listen in the church plays Vietnamese or English speech, organ, STIPA,
pink noise, a clap, a sweep, your own recording or your microphone through
every loudspeaker, with real distance delays, coverage, HRTF direction and
this room's computed reverberation. Use headphones and walk or sit.

The model opens with a recommended design (projectors under the tie beams,
three large slow fans, steerable column loudspeakers with aligned delays,
half acoustic roof lining, timber acoustic slats in the entrance hall).
Settings → Restore the recommended design.
Full service, evening: about 262 lux on books (99 % of seats ≥ 200 lux),
STI 0.62 (min 0.56, 81 % of seats ≥ 0.60), 66 dBA speech with stable
microphones, 41 dBA background, 0.46 m/s seated air, 4.2 kW.
No design check warnings.
Verandas: a lantern at every pier, about 40 lux on the floor.

Scale: the main dimensions match the drawings. Tie beams, side beams and
purlins now follow section sheet 4; roof bracing that is not on the drawings
is hidden (Settings → Show earlier proposed truss bracing). The walking lens
is a natural 75° horizontal (adjustable), 1.4 m/s at 1.60 m eye height.
The entrance hall behind the main doors had no roof; it now has the +8.39 m
terrace slab from the front elevation and a gable wall on axis 2′ above it
(inferred from the elevations; confirm with CAD).

All results are engineering estimates for comparing options. They are not
certified lighting, acoustic, airflow or electrical design and do not control
real devices. Guide and results: ../docs/simulator-guide.md.
Checks: node ../scripts/verify_simulator.cjs --report

ELECTRICAL ROUTING STUDY — 5 OCTOBER 2026
Simulator → Wiring → Systems only hides the building and retains selectable
boards, cables and connected equipment. Restore building restores visibility.
The existing service-room main board, lighting controls, fan controls and audio
rack are retained; DB-2 remains inside the main doors. Every wire can be selected
in 3D, in the flat route plan or in the individual run list. Routes update when
components move, change circuits, are added, removed, hidden, or restored.
The default study has 254 connected components and 297 selectable runs.
Flat board schedules show grouped quantities, model sizes and category specs.
JSON/CSV export the current layout. Cable sizing and final product specifications
are pending; routes, enclosures and internal arrangements are planning proposals.
Documentation and saved default exports: ../docs/systems/electrical.md.
Wiring checks: node ../scripts/verify_simulator.cjs --electrical.

LIGHTING REVIEW — 5 OCTOBER 2026
All six exterior side doors now have two matching lanterns. Only the middle
front door has a decorative pair; both service-room doors also have pairs.
The towers have matching warm washes on their front and outer faces, belfries
and domes, with projecting arms keeping the heads clear of the masonry.
Every switched-on lamp retains illumination and reflections at every distance.
Additional surface lighting is drawn from real lamp positions, never from
midpoints near speakers. Switches, dimmers and layout edits update all effects.
Simulator → Settings → Rendering quality keeps full resolution, illumination,
reflections and the same shadow sources. Room brightness follows surfaces,
not camera location. Fixed exposure is the default; automatic eye adaptation
is optional and deliberately changes brightness while moving.
Saved layouts receive only the reviewed lights once; other edits are retained.
Lighting schedule: ../docs/systems/lighting.md.
