# Thạch Bi Church — design simulator guide

**6 October 2026 · lights, fans, sound and decoration in the shared 3D model**

[Open the simulator](../Thach_Bi_Viewer/OPEN_CHURCH.html) → choose **Simulator** in the header.

The simulator turns the existing 3D model into a working test bench. You can place every light, fan, loudspeaker, microphone and decoration, and switch each one on or off. You can see the results as numbers and colour maps, and you can **hear** the loudspeakers from any seat. It starts with a recommended design that already meets most of the targets in the [interior and systems plan](interior-systems-plan.md), so the parish can judge changes against a good baseline.

All values are transparent engineering estimates for comparing options. They are not certified lighting, acoustic, airflow or electrical calculations. Confirm the final choices with the professional tools and site measurements listed at the end.

---

## 1. Is the model to scale? Why did the interior feel cramped?

The primary dimensions match the drawings. The crowded feeling came from three presentation problems in the earlier model, not from scale. All three are now fixed.

Measured on the vector PDFs (section sheet 4 = `giao-xu-thach-bi-06…pdf`, plan = `…04…pdf`) and compared with the model:

| Item | Drawing | Model | Status |
| **Tower stages** | **belfry (stage 4) clearly narrower than the stages below** | stages narrowed by only 0.15 m each | **corrected: 4.90 / 4.65 / 4.45 / 3.90 m; balcony and dome scaled to match** |
|---|---|---|---|
| Clear width between inner walls C–G | 14.50 m | 14.50 m | ✔ |
| Column rows D/E | ±3.60 m (7.20 m apart) | ±3.60 m | ✔ |
| Bay spacing along the nave | 4.50 m (9–10: 7.20 m) | same | ✔ |
| Column shaft width | ≈ 0.59–0.60 m (measured) | 0.58–0.64 m taper | ✔ |
| Column base | ≈ 0.84 m wide, 0.60 m high | 0.82 m, 0.60 m | ✔ |
| Column top | +9.40 m (8.802 m shaft on 0.600 m base) | +9.40 m | ✔ |
| Main eave / ridge | +7.13 m / +12.47 m | same | ✔ |
| **Main tie beam between D and E** | **+8.59 … +9.18 m (0.59 m deep)** | was 0.24 m deep at +9.1 m | **corrected** |
| **Side beams C→D and E→G** | **+6.66 … +7.00 m** | were missing | **added** |
| **Purlins** | **≈ 0.50 m apart (≈14 per slope)** | 5 per slope | **corrected** |
| King posts, diagonal braces, knee braces | **not on the drawing** | present | **moved to an optional "proposed bracing" layer, hidden** |
| **Entrance bay between the façade and axis 2′** | **terrace at +8.39 m carrying the three shrines (front elevation); main roof starts at axis 2 (side elevation)** | no roof: sky and the backs of the shrines showed above the main door | **terrace slab and nave gable wall added** (inferred from the elevations; confirm with CAD) |

Why it felt cramped:

1. **A very wide camera.** The walk camera used a 68° *vertical* field of view, about 100° horizontal on a laptop. Nearby columns were stretched at the screen edges and dominated the view. The default is now a natural **75° horizontal** lens, adjustable from 45° to 110° in *Simulator → Settings*. The before/after pair in `review/simulator-2026-10-06` shows the difference.
2. **Invented roof members.** Diagonal braces, king posts and two sets of knee braces filled the space above the nave, but they are not on section sheet 4. The roof now shows the frame as drawn. The earlier bracing can be switched back on for comparison.
3. **Walking speed and eye height.** Walking at 2.05 m/s (jogging pace) makes rooms feel smaller. It is now 1.4 m/s. The standing eye height is 1.60 m, which suits an average adult in Việt Nam; both are adjustable.

Real constraints remain. The columns really are about 0.6 m timber shafts on 0.84 m bases, 4.5 m apart. From the outer seats they block part of the view, as the earlier sightline study showed. A lighter timber tone (*Settings → Structural timber tone*) makes them visually lighter without changing the structure.

---

## 2. The recommended starting design

Every fixture hangs from, stands on or is fixed to something the model actually has; the checks cast a ray from every wall fixture and pendant anchor to prove it. No light shines through a spinning fan.

| System | What is installed | Why |
|---|---|---|
| Reading light, central blocks (L1) | 14 twin-head LED projectors (2 × 2 300 lm, 28°, 3000 K, CRI 90) under the main tie beams (axes 3–9, z ±2.6 m), heads tilted ±8° along the nave | Even light on books under the beams and mid-bay; narrow beams stay off the fan blades |
| Reading light, outer blocks (L2) | 14 twin-head projectors (2 × 2 300 lm, 36°) under the side beams (z ±5.6 m) | Covers the outer benches between bays |
| Rear rows and entrance | 2 twin-head brackets inside the entrance façade: one head for the last rows (5 500 lm), one for the centre seats and the entrance aisle (3 300 lm) | Bay 2′–3 has no tie beam, and the nave is open back to the façade; this was the darkest corner |
| Sanctuary (L3) | Altar key lights at ~45° from the axis-9 beam (with shadows); ambo key light; step fill; crucifix, tabernacle and statue accents | Faces and liturgy lit from the front, not from above |
| Roof uplight (LA) | 8 wide uplights hidden on top of the tie beams | Warm timber roof in the evening; the nave feels taller |
| Decorative (LD) | 3 brass chandeliers on chains from the ridge over the crossings; a 12-lamp chandelier at the 9–10 crossing; 14 brass sconces | The character of the reference images |
| Verandas, steps, façade (L4–L6) | 18 lanterns (2 000 lm), one at every veranda pier; brass sconces beside the main door; lanterns on the tower fronts over the platform and steps; side-door lanterns; tower uplights and façade washes on the +8.39 m tower ledges | Nothing stands on the courtyard, platform or steps where people walk; every exterior light is fixed to the building |
| Air (F1) | 12 ceiling fans (1.42 m) mid-bay over the two side aisles, between the centre and outer blocks | Where parishes really hang fans: nothing over the processional aisle, quiet at speed 2, ~0.33 m/s at the seats |
| Festival exterior (L7, off except at feasts) | Warm bulb strings along the roof ridge, the main and veranda eaves, the rear gable, the front terrace and the corners of the three lower tower stages; floods on the +23.14 m tower ledges (belfry and dome), on the terrace (central shrine) and on the rear veranda roofs (rear gable) | The church outlined in light for Christmas and feasts; switched on by the *Christmas & festivals* scene |
| Sound (A1–A3) | 12 slim 0.6 m wall columns, painted the wall colour, on the side-wall pilasters (axes 4–9) at 3.35 m, between the Stations of the Cross plaques and the sconces, turned toward the back; 4 veranda pendants; 2 courtyard horns on the tower fronts (off) | Barely visible and nothing on the timber columns; each speaker covers the rows behind it, time-aligned to the priest's voice |
| Microphones | Ambo and altar gooseneck mics | The system runs at about 67 dBA, which keeps both microphones more than 3 dB inside the stability allowance |
| Décor | Statues of Our Lady (left) and Saint Joseph (right) in the side alcoves either side of the crucifix, flowers, votive candle stands, Paschal candle, palms, banners. Christmas tree, nativity grotto, star, red lanterns, pennants and an aisle carpet are ready but hidden | Matches the reference interior; seasonal items are one switch away |
| Roof underside | Timber lining with about 50 % slotted acoustic boards | Speech clarity *and* support for singing |
| Entrance hall | Timber slat acoustic panels (≈ 75 m²) under the terrace and along the top of the entrance wall | The wall facing the loudspeakers: no late reflection back to the sanctuary, and a shorter reverberation for the whole room |

The **Full service · evening** scene gives these results at the 300 sampled seats (60 % occupancy, doors open, 28 °C):

| Measure | Result | Brief target |
|---|---|---|
| Maintained light on books | 330 lux average · 99 % of seats ≥ 200 lux (lowest 171) · uniformity 0.52 | 200–300 lux |
| Light on the aisle floors | ≈ 85 lux at the main-door threshold, 133–290 lux along the centre, side and cross aisles; entrance hall 59–215 lux | ≈ 100 lux on circulation |
| Light on the veranda floors | ≈ 36–45 lux average, at least 24 lux | ≈ 100 lux trial (see below) |
| Speech intelligibility | STI 0.63 average · 0.46 minimum · 80 % of seats ≥ 0.60 | ≥ 0.60 at every seat |
| Speech level | 67 dBA, 90 % of seats within ± 1.5 dB | ±3 dB |
| Microphone feedback | 3.5 dB (ambo) and 3.7 dB (altar) beyond a 6 dB stability allowance | stable with gooseneck microphones |
| Background noise | 42 dBA (fans + outdoor + people) | ≈ 35 dBA where practicable |
| Seated air speed | 0.33 m/s average (central 0.30, outer 0.35), up to ≈ 0.45 m/s at fan speed 3 | 0.3–0.8 m/s trial |
| Reverberation time (500–1000 Hz) | 1.22 s | choose with the acoustician |
| Electrical load | ≈ 3.4 kW · 5 kWh per 1.5 h service (festival exterior off) | measure after installation |

The verandas are the one place the lanterns do not reach the brief's 100 lux trial. About 40 lux is enough to walk safely and suits the arcade at night. If the verandas will seat overflow worshippers at festivals, add downlights to the veranda roof for those days. You can test this with *Add → LED projector*.

What each decision is worth, from the same simulator:

| Variant | RT mid | STI avg | Seats ≥ 0.60 | STI min | Noise |
|---|---|---|---|---|---|
| **Recommended** (½ acoustic roof lining, slatted entrance hall, 60 % full, doors open) | 1.22 s | **0.62** | **81 %** | 0.56 | 41 dBA |
| Entrance hall left as plaster | 1.33 s | 0.61 | 63 % | 0.54 | 41 dBA |
| Plain timber roof lining (earlier proposal) | 2.18 s | 0.52 | 0 % | 0.46 | 42 dBA |
| Tile underside as drawn (no lining) | 2.16 s | 0.52 | 0 % | 0.47 | 42 dBA |
| Acoustic roof lining throughout | 0.81 s | 0.71 | 100 % | 0.63 | 41 dBA |
| Recommended, weekday (25 % full) | 1.32 s | 0.60 | 51 % | 0.54 | 41 dBA |
| Recommended, festival (100 % full) | 1.12 s | 0.65 | 96 % | 0.58 | 41 dBA |
| Recommended, doors and openings closed | 1.44 s | 0.59 | 29 % | 0.52 | 41 dBA |
| + 12 wall fans on the piers (common column fans) | 1.22 s | 0.53 | 1 % | 0.46 | 52 dBA |
| Loudspeaker delays not aligned | – | 0.58 | 32 % | 0.49 | 80 seats with echo risk |

Four conclusions for the parish:

- **Room acoustics matter more than speaker count.** A hard timber or tile ceiling keeps the reverberation around 2.2 s, and no loudspeaker layout then reaches STI 0.60. Treating about half the roof lining with slotted acoustic boards is the single most effective change, and still leaves a lively room for singing. A fully absorptive ceiling is clearer but too dry for congregational singing. Slatted panels in the entrance hall, on the wall that faces the loudspeakers, add the next step: seats at STI ≥ 0.60 rise from 63 % to 81 %.
- **Ceiling fans should be large, slow and quiet.** The common wall-mounted column fans add about 10 dB of noise and wipe out the gain from good loudspeakers.
- **Time alignment is essential.** Without aligned delays, 80 seats hear the front loudspeakers as an echo.
- **Run speech a little quieter rather than near feedback.** At 67 dBA the lectern microphones kept only about 2 dB of margin. One decibel less gives a stable system and costs almost no clarity (about 0.003 STI).

---

## 3. Using the simulator

Open **Simulator** (header). The panel has six tabs:

**Lights · Fans · Sound · Décor.** Every object is listed by circuit, each with its own switch. Circuit switches and dimmers act on a whole group. Click a row to edit it:

- **Position:** X along the nave, Z across, height; the drawing axis is shown.
- **Aim:** direction and tilt for projectors, spotlights, speakers and wall fans.
- **Lights:** lumens (with watts), dimmer, colour temperature, beam angle, shadows.
- **Fans:** speed (with airflow, rpm, watts and noise at that speed), oscillation.
- **Loudspeakers:** level trim, delay, steerable beam opening, and amplifier load with an overdrive warning.
- **Buttons:** *Show* (flies the camera to it), *Duplicate*, *Mirror B ↔ H*, *Repeat on bays* (copies onto axes 3–9), *Hide* (keep it as an alternative) and *Delete*.

To **add** something, press *Add*, pick a product from the catalogue, then click a beam, ceiling, wall, column or floor in the 3D view. Hanging items snap to the tie beams and get a rod up to the structure above. Shift-click places several. To **move** something, click it once to select it, then drag; it slides along its beam, wall or floor. Shift-drag changes the height. **Ctrl+Z / Ctrl+Shift+Z** undo and redo, **Delete** removes, **Ctrl+D** duplicates and **Esc** cancels.

The **scenes** (top of the panel) follow the plan's operating scenes: *Full service · evening*, *Weekday Mass*, *Prayer & adoration*, *Christmas & festivals*, *Cleaning*, *Night security* and *All off*. *Save scene…* stores your own.

**Analysis.** Colour the plan with *Light*, *Speech level*, *Clarity (STI)*, *Air speed* or *Noise*, then use *Plan view (roof off)* to see it from above. Hover the plan for values. In Walk mode, live chips at the bottom show the values where you stand: light on a book at the seats, or light on the floor in aisles and verandas, where the brief's circulation target applies. The tab also shows:

- results at the 300 sampled seats against the brief targets;
- reverberation time per octave with controls for congregation size, open doors, roof finish, entrance hall finish and outdoor noise;
- **design checks:**
  - light shining through fan blades (strobe)
  - fan and chandelier clearances
  - low chandeliers
  - items in aisles
  - microphone feedback margin
  - loudspeakers past their rating
  - fans blowing at microphones or candles
  - echo risk
  - dim seats
- an electricity estimate per circuit with monthly kWh and cost (edit hours, services and tariff);
- download of the layout (.json) and the fixture schedule (.csv), opening a saved layout, and saving a picture.

The layout is also saved automatically in the browser.

**Sound → Listen in the church.** Use headphones. Pick a test signal:

- Vietnamese or English speech
- an organ chorale
- the STIPA speech-test signal
- pink noise
- a hand clap (to hear the reverberation)
- a sine sweep
- **your own recording** (for example a homily recorded in the old church)
- **your live microphone**

Press Play and walk or sit. Each loudspeaker reaches you with its real distance delay (343 m/s) and DSP delay, its coverage pattern, distance loss and HRTF direction, followed by reverberation synthesised from this room's octave-band reverberation times. You can add the priest's own unamplified voice, the running fans and background noise. The panel shows the predicted level, STI and which loudspeaker you hear first. *Align delays* time-aligns every loudspeaker to the talker at the microphone plus 12 ms, so the voice still seems to come from the altar or ambo.

**Settings.** Walking lens, eye height, walking speed, eye adaptation (fixed for fair comparisons, or automatic like the eye), lamp glow, how many lights are drawn individually (*High / Balanced / Fast*; the analysis always uses every light; if walking stutters the simulator steps down to a lighter setting by itself), the earlier proposed truss bracing, structural timber tone, roof underside, entrance hall finish, maintenance factor, drag and snap options, and *Restore the recommended design*.

---

## 4. How the numbers are calculated, and their limits

**Light.** Each luminaire is converted from lumens to candela using the same cone shape the 3D renderer uses, so the picture and the numbers agree. Illuminance is inverse-square with the cosine law. The 18 timber shafts, their bases and the inner C/G walls (with their arched openings) block light. Inter-reflected light comes from an integrating-sphere estimate based on the room's surface areas and reflectances, and values are shown *maintained* (× 0.8). Not included: real IES/LDT photometry, pew-back shadows, glare (UGR) and daylight. Use DIALux or Relux with manufacturer files before ordering.

**Room acoustics.** The volume (≈ 7 450 m³, including the entrance hall that opens into the nave) and surface schedule come from the model. Absorption coefficients are typical published values for plaster, stone, timber, glass, open doorways, empty or occupied pews, the roof finishes and slatted acoustic panels. Reverberation is calculated by Eyring per octave with ISO 9613-1 air absorption at 28 °C and 75 % RH. Reflected energy follows Barron's revised theory. Energy a loudspeaker aims straight at the congregation is partly absorbed at first incidence, which favours directional speakers aimed at people. Speakers in the verandas reach the nave through its openings.

**Loudspeakers and STI.** Each speaker has −6 dB coverage angles per octave, a front-to-back ratio, sensitivity, rated power, frequency response, and (for columns) line-array near-field behaviour. Columns and walls screen high frequencies. STI follows IEC 60268-16 (male weighting): an MTF from the energy-time response of every arrival (direct plus exponential reverberant tail, with each arrival's delay), times the signal-to-noise factor, auditory masking and reception threshold. This is a statistical model, not ray tracing. Confirm the design in EASE/ODEON/CATT and by STIPA measurement on site.

**Feedback.** Each loudspeaker's direct and reverberant sound returning to a cardioid microphone is compared with the talker 0.4 m away, with a 6 dB stability margin. A headset microphone gains roughly 12–18 dB.

**Air.** Ceiling fans are modelled as a down-jet that spreads with distance, plus a radial floor jet whose momentum depends on fan flow and height. Wall and pedestal fans are tilted jets, time-averaged over their oscillation. The cooling effect is an approximate SET-based figure for sedentary people in light clothing. Fans move air but do not lower its temperature or replace ventilation. Use the CBE fan tool and a full-scale trial.

**Electricity.** Rated watts × dimmer, fan speed curves and average amplifier draw. It is a planning estimate, not breaker sizing and not metered data.

**3D picture.** Lights are in physical units (candela) and rendered with an eye-adaptation exposure (default 110 lux). On weaker computers some neighbouring lights are combined for drawing. The analysis still uses every source.

---

## 5. Next steps with professionals

1. Lighting designer: photometric layout with real products (IES files), glare and vertical illuminance on faces, emergency lighting design.
2. Acoustician: measure reverberation and background noise in the existing building; specify the roof lining treatment; predict and commission the loudspeaker system (STIPA at the agreed seat grid).
3. Structural engineer: tie beams and spreaders for the slow fans, chandelier chains from the ridge, loudspeaker and projector brackets.
4. Electrical engineer: circuits, protection, DALI control, metering, as in section 6 of the plan.
5. Full-scale trial of one bay: reading light, one slow fan, one column loudspeaker, with parishioners seated.

## Files

- `Thach_Bi_Viewer/simulator/`: `physics.js` (calculations), `catalog.js` (products and 3D models), `engine.js` (scene, fixtures, placement, scenes, storage), `design.js` (recommended design), `analysis.js` (maps, seat results, checks), `audio.js` (spatial audio), `ui.js` (panel), `samples.js` (embedded test speech), `simulator.css`.
- `scripts/verify_simulator.cjs`: headless checks of the as-drawn frame, every catalogue model, that every wall fixture sits on a surface and every pendant hangs from structure, the recommended design, scenes, undo and layout round trip. Run `node scripts/verify_simulator.cjs --report`.
- `review/simulator-2026-10-06/`: screenshots and the verification report.

> **Update:** the recommended loudspeakers are now a distributed wall system (see the table in section 2); the variant table above was calculated with the earlier column loudspeakers, so its absolute STI values differ slightly, but the comparisons between room finishes still hold.

## Sanctuary layout (October 2026 revision)

- The plaster three-lobed frame now stands on axis 11 as the back wall of the
  sanctuary. The axis-10 timber columns stand free in front of it, on stone
  bases on the +0.75 m dais, as in the reference interior.
- The full-width reredos with the crucifix stays in the centre bay. The two
  smaller lobed arches beside it are deep, warm-lit alcoves (about 1.4 m).
  Our Lady stands in the left alcove (B) and Saint Joseph in the right (H),
  each on a stone plinth with flowers. This follows the reference interior.
- Benches stand in the two projecting wings between axes 9 and 10, facing the nave, five rows in two blocks:
  - choir on the right (H), with a keyboard at the front
  - ministers and servers on the left (B)
- The service room (sacristy) is behind the back wall, between the D and E
  grids. It is entered through a door in the inner side wall of each statue
  alcove. It holds:
  - the vestment wardrobe and vesting counter
  - the main electrical board, the lighting (L1–L7) and fan control cabinets,
    and the sound rack (amplifiers, DSP, wireless microphones)
- View settings → Reference checkpoints has two new views, "Altar & choir"
  and "Service room".
- All of this is a layout proposal. Room walls, doors, niche sizes and bench
  lengths need confirming against CAD.

## Window glass

View settings → Window glass switches between clear glass and stained glass.
In the stained option:
- Each nave-wall arch shows a saint under a Gothic canopy, with a name band:
  - left: Thánh Micae, Antôn, Phêrô, Gioan, Đức Mẹ Maria, Têrêsa
  - right: Thánh Anrê Dũng Lạc, Gioan Baotixita, Phaolô, Giuse, Thánh Tâm, Chúa Chiên Lành
- Window and door fanlights show a gold sunburst around a symbol: dove,
  chalice, IHS, Chi-Rho, cross, Alpha–Omega, Sacred Heart, Marian M.
- The round façade windows are a rose with the dove at the centre.

The artwork is drawn by the viewer (glass-art.js). It is a placeholder for
commissioned windows.

## Timber frame: two versions

View settings → Timber frame, or Simulator → Settings → Structure.

- **As drawn (PDF section 4).** Round shafts and a 0.30 × 0.59 m tie beam
  across the nave at +8.59 m on every axis.
- **Reference image (05-interior-day).** The structure is:
  - square timber posts (0.56 m) on 1.1 m carved stone plinths, rising to the
    rafters
  - a collar beam at +10.9 m, a short upper collar at +11.75 m and a king strut
  - curved arch braces from each post into the collar
  - queen posts, and longitudinal plates with curved brackets along the post
    heads

  The nave is open up to the arch braces (+7.6 m at the posts, about +10.8 m
  in the centre).

Lights that hang from the drawn tie beam hang from the arch brace above them
in the reference version. Their position and the analysis are unchanged.

Structural note: dropping the low tie is not automatically stronger. The arch
braces and collar share load well and stiffen the joint at the post head.
Without a tie at wall-plate level, though, the rafters push outward on the
posts and walls. A structural engineer has to size the members and the
pegged or bolted joints, and decide how that thrust is resisted. Options are
a slim steel tie rod at plate level, steel flitch plates in the joints, or
moment-resisting post heads. Member sections in this version are visual.

## Fans, ventilation, speakers and tower lighting (October 2026 revision)

Fans and ventilation:
- **Ceiling fans (F1).** A pair in the back bay by the towers (2′–3) and two in
  each 9–10 wing over the benches, in addition to the side-aisle fans.
- **Wall fans (F2, optional, hidden).** Six small oscillating fans on the
  side-wall pilasters at axes 4, 6 and 8, above the sconces. Show them for
  very hot days. Tested at low speed, they lift seated air speed from 0.36 to
  0.38 m/s, but raise background noise to about 46 dBA. Seats reaching STI
  0.60 then fall from 77 % to 66 %.
- **Entrance circulators (F4, trial, off).** Two 90 cm wall circulators on
  the inside of the entrance wall, blowing down the nave. Test result:
  - at medium speed: average seated air 0.41 m/s (from 0.36), noise 50 dBA,
    STI ≥ 0.60 at only about 45 % of seats
  - at low speed: air 0.39 m/s, STI ≥ 0.60 at 66 % of seats

  Use them before and after Mass, not during speech.
- **Exhaust ventilation (V1).** The fans draw out the hot air under the roof;
  fresh air enters through the open doors and windows. At low speed they move
  about 26 000 m³/h, roughly 3.5 air changes per hour of the hall. Fan
  positions:
  - four high in the front gable
  - two in each wing gable
  - one in the service room

Speakers:
- **Rear fill (A5, off by default).** Two slim columns on the inside of the
  entrance wall by the towers, for crowded feasts. With them on, clarity in
  the nave drops by several points, because they add reverberant sound.
- **Outdoor (A3, festivals).** A second horn on each tower front, and two
  horns on each side's outer arcade piers (axes 5 and 8).

Exterior lighting (L6):
- **Fittings.** Each tower stage has one wide centred flood from the cornice
  below it: stage 2 from +8.39 m, stage 3 from +15.84 m, and the belfry and
  dome from +23.14 m. Each tower also has a warm belfry glow inside and a
  wash on its outer side face. The central gable is lit from the inner tower
  corners.
- **Light budget.** The viewer gives its limited light budget to the side
  you are looking from: the exterior floods when the camera is outside, the
  interior lights when inside. The analysis always counts every light.

## Stage lighting, controls and navigation (October 2026 revision)

- **Exterior downlights (L5).** All are fixed high on the building:
  - four wide floods on the tower cornices light the front stage for events
  - path lights on the outer arcade piers (axes 4, 6, 11), the wing gables
    and the rear wall light the walkways around the church
- **Christmas tree and Nativity grotto.** Both now stand on the front stage
  in front of the towers. They stay hidden until Christmas; the Christmas
  scene shows them.
- **Simulator → Controls.** The equipment in the service room, drawn like the
  real thing:
  - a scene keypad
  - distribution board DB-1, with one breaker per circuit showing its current
  - fan regulators (0–1–2–3)
  - a sound mixer with a fader, meter and mute key per zone

  Every control changes the model and the analysis, and Ctrl+Z undoes it.
- **Explore mode movement.** W A S D or the arrow keys move forward, back
  and sideways; Q and E go down and up; Shift moves faster. Dragging still
  orbits, and scrolling still zooms.

### Balanced side-wall fittings (2026-10-14)
Every side pilaster (axes 3–9) now carries the same ordered column of fittings, with clear gaps between them:
- Station of the Cross plaque: 2.2–2.9 m
- Slim speaker: 3.45 m. This is the highest position that still keeps 75 % of seats at STI ≥ 0.60.
- Brass sconce: 4.6 m. A sconce was added at axis 9, so the sconce row now matches the seven Stations on each side.
- Optional wall fan: 5.55 m at axes 4, 6 and 8, tilted 38° down. It now sits about 0.5 m clear of the candles instead of touching them.

## System review (2026-10-15) · work in progress
Changes so far (not yet re-verified with the full check scripts):
- **Accuracy:** the reverberation time (Eyring) and the reflected-sound term (Barron) now use the speed of sound at the set temperature instead of the 20 °C constants. Power totals no longer show "NaN" when festival strings are on, and fan watts use the same default speed as the airflow.
- **Wings (choir and ministers):** the 80 wing seats are now part of the analysis. Each wing gets reading lights (new circuit L8) on its end gable: high heads for the back rows, and heads below the fan blades for the front rows, so no light passes through the blades. Each wing also gets two small pendant speakers, one over each bench block behind the fans, just below blade level and aimed at the front rows. A louder speaker facing the nave would have cost the altar microphones their feedback margin.
- **Outdoor speakers:** delays are now aligned to the indoor system at the nearest doors and windows, so they don't arrive inside as a late echo.
- **Scenes:**
  - Weekday Mass lights the outer blocks at 60 % and runs the fans at speed 2.
  - Prayer gives about 50 lux for reading.
  - Cleaning no longer runs the trial entrance fans.
  - The "Dim seats" check now uses each scene's own light target.
- **Electrical:** each breaker shows a C-curve MCB rating, sized for its full load at ≤ 80 % (230 V, power factor 0.9). The checks warn when a circuit exceeds 16 A or the board exceeds the 63 A main switch.

Still to do:
- re-run `scripts/verify_simulator.cjs`
- tune the outdoor horn levels (Christmas feedback margin was ~2.4 dB)
- confirm the wing speech clarity and light levels

**Verified 2026-10-15 (full service):**
- **Nave:** 79 % of seats at STI ≥ 0.60 (was 76 %), worst seat 0.46.
- **Wings:** speech clarity averages 0.54, worst seat 0.45 (was 0.40 with no wing speakers). Every wing seat gets at least 200 lux (front-row heads 4000 lm, back-row heads 3800 lm).
- **Feedback margin:** at least 3 dB at both microphones.
- **Echo:** no echo seats.
- **Checks:** `verify_simulator.cjs` now checks the nave and the wings separately.
- **Entrance façade added to the sound and light model**, with its main door and two side doors as openings. Before this, the tower horns and the exterior floods reached the nave straight through the solid façade. The front-row seats now come out a little darker (the darkest at about 194 lux); that is the accurate figure.
- **Christmas & festivals now runs indoors only:** courtyard horns off, rear fill off, ceiling fans at speed 2. Result: no echo seats, at least 3.1 dB feedback margin, 58 % of seats at STI ≥ 0.60 (was 0 %).
- **New scene "Festival · courtyard overflow"** switches the courtyard horns on. Use it only when people are standing outside: the horns' sound returns through the open windows late enough to blur speech for those inside.
