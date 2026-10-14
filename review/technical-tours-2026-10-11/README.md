# Technical tours · review record, 11 and 13 October 2026

**Design in development · Not for construction · Đang phát triển · Không dùng để thi công.**

Owner's request, 11 October 2026 (`USER CONFIRMED` intent): remove the 2 min 15 s short film, and add separate technical tours that introduce the lights, the fans and the sound system with the simulator, each with a plain explanation. After the first three were shown, the owner asked the same day to keep reviewing and improving them and to include the electrical grid (wiring) as well; that message ended at “with”, so any further condition it carried is not known.

Three changes were made:

1. **Short film removed** from the viewer (button, shot list, bell and toccata score, checks). The five-minute cinematic tour is unchanged: its score, shot list and the camera pose and black level sampled every 0.5 s were compared before and after and are identical.
2. **Three technical tours added**: Lighting, Fans and air, Sound. Each is 1 min 52 s in seven scenes. Implementation: `Thach_Bi_Viewer/cinematic-tour.js` and `cinematic-tour.css`, three buttons in `OPEN_CHURCH.html`. Use and limits: `docs/simulator/guide.md`, section "Technical tours".

3. **Second round, same day**: a fourth tour, **Electrical grid** (button **Wiring**), also 1 min 52 s in seven scenes, built on the simulator's wiring-only view and its system filters; and corrections from a review of the first three (see "Second round" below).

These are display features. They change no dimension, equipment position, circuit, scene, setting, schedule or calculation, so no drawing register, equipment register, route export or summary report was affected. Documents checked for that conclusion: `docs/electrical-grid/controls.md` (circuit and scene names used in the captions), `docs/engineering/nave-wall-fans.md` and `docs/engineering/central-view-constraint.md` (status of the wall fans, clear central view), `docs/systems/lighting.md`, `fans.md`, `sound.md` (aims and open items), `docs/simulator/methods-and-limitations.md`.

## Third round, 13 October 2026: the tours demonstrate how the systems work

Owner's request, 13 October 2026 (`USER CONFIRMED` intent): "continue to work on the technical tours, I want more direct and specific detail than just moving around like that, including the lights system and how it works rather than the position of objects (simulator turning on and off things then the calculation showing the changing stats)". The first two rounds were fly-throughs that showed where equipment is and quoted figures for the scene that was open. This round replaces most of them with demonstrations: the tour switches circuits on and off, dims them, changes the mixer level or cuts the DB-2 feeder in the simulator, the simulator calculates again, and a live panel lists the circuits and shows the figures that change.

What changed:

- **`CHURCH_SIMULATOR.rehearsal`** (new, `simulator/engine.js`): a tour borrows the switches in memory. `begin / scene / circuits / feeder / setting / reset / end`. While it lasts the simulator saves nothing and records no history step; `end()` restores every switch, the scene name, the feeder and the borrowed settings exactly. `analysis.run(kinds, { now: true })` (new, `simulator/analysis.js`) runs the analysis to the end in one go so that the figures belong to the switches as they are. No calculation, input, threshold or catalogue value was changed.
- **The tours** (`Thach_Bi_Viewer/cinematic-tour.js`, `.css`): each scene may carry a `demo` (live panel with up to six circuit rows and four figures, and timed steps with a one-line action and an explanation in both languages, 32 words or fewer, steps at least 7 s apart). Lights, Fans and Sound are 2 min 40 s; Wiring is 2 min 56 s. All four were rewritten; the camera routes and music are those of the earlier rounds, with plan views moved so that the panel does not cover them. The five-minute cinematic tour is unchanged (same comparison as before).
- **Wording and numbers**: every step of every tour is in [demonstrations.json](demonstrations.json) (value of every figure, the rows, the action), taken from `CHURCH_CINEMA.rehearseAll(film)` on the recommended design. Pictures: [demonstrations-1.jpg](demonstrations-1.jpg) (wiring: lighting circuits with current and breaker; fan circuits; sound: fan noise against speech; air: wall fans on the map) and [demonstrations-2.jpg](demonstrations-2.jpg) (lighting: switching on L8 on the light map; the DB-2 feeder cut with the façade dark; sound: circuits of the sound system; wiring: fan current on High). All are frames drawn by the viewer's own recording path (`CHURCH_CINEMA.still`), 1920 × 1080.
- **Pacing** was a finding of this round: a first version had steps 6 s apart with 45-word notes, which cannot be read. The final version holds each step 7 to 9 s with 32 words or fewer, and `verify_cinematic.cjs` rejects a step that asks for more than 4.8 words a second.

| Check | How | Result |
| --- | --- | --- |
| Rehearsal on the real engine | `node scripts/verify_simulator.cjs --estimates` (new section): begin, scene, circuits, dim, feeder, setting, `commit`, a wait for the save timer, `end` | Items, settings, scene, history and the stored layout identical to before; zero storage writes during and after; a circuit behind a dead feeder cannot be switched on |
| Every step of the four tours on the real engine | same script, `CHURCH_CINEMA.rehearseAll` | 17 + 15 + 14 + 12 steps: every quoted figure is read; the explanations' claims hold (each circuit adds light and power; dimming saves a smaller share of power than of light; High adds little comfort for much noise; 6 dB of mixer level moves the margin 6 dB; the DB-2 feeder off leaves the nave lit; the wings are much stiller than the nave with ceiling fans only; load by scene rises; current is power ÷ 230 V ÷ 0.9; each circuit shown is below its breaker); the tours put everything back and write nothing |
| Shot lists, panels, steps, reading pace, captions and figures, aims against the simulator's targets, calls the module makes | `node scripts/verify_cinematic.cjs` | Passed: Lights, Fans, Sound 6 / 7 / 6 scenes, 160 s, 40 bars; Wiring 9 scenes, 176 s, 44 bars. The only simulator calls are readings, the map, the wiring view, the frame update and `rehearsal.*` |
| Five-minute film unchanged | sha256 comparison of its score, shots and sampled poses with the baseline from 11 October (ignoring the internal `stay` flag) | Identical |
| Camera clearance | `CHURCH_CINEMA.audit({ film })` for the four tours | Nearest 0.59 m (vestment wardrobe, service room, as before); every other scene at least 1.15 m |
| Run to the end, and stopped part-way | Wiring tour run from the feeder scene to its end; sound tour stopped with `stopTour()` in the middle of a demonstration | Items, settings, scene, history, stored layout, wiring view, light and roof identical to before; `rehearsal.active` false |
| Public visit mode | `OPEN_CHURCH.html?visit`: sound tour stepped to the fan scene | Works; Simulator panel stays closed; `thachbi.simulator.v1` untouched |
| Scenes on screen | Live playback in the Browser pane at 1440 × 810 (panel, map key and caption do not overlap after two fixes: a one-line panel heading and the map key moved down) and recorded frames at 1920 × 1080 | As intended |
| Frame export path | `CHURCH_CINEMA.still(t)` for scenes with a panel | The panel is drawn into the frame and its numbers are those of the step at that time (the analysis is run in one go, so the export does not depend on timing) |
| Website | `node scripts/prepare-viewer.mjs`, `prepare-guide.mjs`, `npm run check:viewer`, `check:guide`, `npm test`, lint, type check, build, `PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/browser/visit.spec.ts` | 62 viewer files and 43 guide files, exact inventory and hash; 116 of 116 unit tests; lint and types clean; build passes; 4 of 4 visit tests |

Documents checked and changed for this round: `docs/simulator/guide.md` (the technical tours section, rewritten), `docs/web/viewer.md`, `docs/electrical-grid/README.md`, `docs/electrical-inspection-guide.md` and `.vi.md`, `Thach_Bi_Viewer/READ_ME.txt` and the page's help text and button tooltips, `scripts/film_export/README.md` (a tour is now over X's 2 min 20 s limit), and the quick-start guide sentence `s5f` with its narration clip (`docs/guides/father-quick-start/`, regenerated and **not listened to**). `docs/simulator/methods-and-limitations.md`, `docs/electrical-grid/controls.md` and the registers were read and need no change: no equipment, position, specification, circuit, scene or calculation changed.

Not verified in this round: the wording and the Vietnamese, which the owner has not read and no designer or electrical engineer has checked; a whole tour recorded to a video file (frames were drawn and checked, the file was not made); the sound of the new quick-start narration; edited layouts and scenes other than the ones the steps themselves set.

## Pictures from the first two rounds

These four sheets were taken before the demonstrations: fly-through scenes that show where equipment is. They are kept as evidence of the earlier version; the scenes they show were replaced or shortened in the third round.

Four frames of each tour, drawn by the viewer's own frame export (`CHURCH_CINEMA.still`, 1920 × 1080, captions, map key and rings painted into the picture) on the recommended design in the scene "Full service · evening":

| File | Frames |
| --- | --- |
| [lighting-tour.jpg](lighting-tour.jpg) | reading projectors with rings (20 s) · light map (36 s) · the wings on the map (52 s) · sanctuary accents (66 s) |
| [fans-and-air-tour.jpg](fans-and-air-tour.jpg) | ceiling fans with rings (20 s) · air-speed map (36 s) · the wings on the map (52 s) · nave wall fans (68 s) |
| [sound-tour.jpg](sound-tour.jpg) | wall loudspeakers with rings (30 s) · speech-level map (44 s) · speech-clarity map (60 s) · wings and microphones (76 s) |
| [electrical-grid-tour.jpg](electrical-grid-tour.jpg) | DB-1, LC-1 and FC-1 in the service room (20 s) · the wiring on its own (36 s) · lighting routes (52 s) · sound lines to AV-1 (84 s) |

The pictures are project-created views of the model (CC BY 4.0, see `NOTICE.md`). They show proposals and simulator estimates. The new pictures of the third round are in the same terms.

## What was checked

| Check | How | Result |
| --- | --- | --- |
| Shot lists, camera paths, scene changes, captions, figures, map and circuit names, cards, scores, simulator calls | `node scripts/verify_cinematic.cjs` | Passed. Cinematic tour: 19 scenes, 308 s, 77 bars, 1061 notes (as before). Each technical tour: 7 scenes, 112 s, 28 bars, 175 notes. Fastest camera 2.5 / 3.4 / 2.2 m/s (lighting / fans / sound), none faster than 3.2 m/s indoors |
| Five-minute film unchanged | sha256 of its score, shots and sampled poses before and after both changes | Identical (the only addition is an internal `stay: false` flag on each scene) |
| Camera clear of the model and fittings | `CHURCH_CINEMA.audit({ film })` in the open viewer, 0.25 s steps, 1.5 m reach | Nearest approaches: 1.33 m to column 6/E under the roof (lighting), 1.15 m to the door frame on entering (sound); nothing within 1.5 m in the fans tour. Full list in [capture.json](capture.json) |
| Every scene on screen | Frame export at one or two moments of every scene of each tour; live playback of the lighting tour started by a real click | Framing, captions, map keys and rings as intended; plan views keep the church clear of the caption |
| Scene by scene state | Fans tour stepped through in the viewer | Light, roof and map follow the shot list: map `air` only in the two scenes from above; rings in the scenes that mark a circuit; key hidden under the cards |
| Running to the end, and stopping part-way | Fans tour run to its end; lighting tour stopped with Esc in the map scene after the user's own map (`sti`) had been switched on | At the end: previous light and roof, map `none`, no history entry. On stopping: the user's `sti` map is back; the toast names the evening light and hidden roof left on, as for the cinematic tour |
| Saved layout untouched | `thachbi.simulator.v1` compared before and after a whole tour and after the stopped one (ignoring the save time) | Identical |
| Public visit mode | `OPEN_CHURCH.html?visit`: buttons present, sound tour stepped through all scenes, closing card | Works; `thachbi.simulator.v1` unchanged, only `thachbi.visit.v1` written; Simulator panel stays closed |
| Layout at 1280 × 800 | Element boxes read in the viewer; screenshot of the Discover menu | Caption (58–698 px) and map key (838–1222 px) do not overlap; the three tour buttons fit the Discover menu without scrolling (384 px of 384 px) |
| Music | Real click, `CHURCH_CINEMA.musicOutput()` | Sound clock drives the picture; about −29 to −27 dBFS RMS, peaks about −20 to −18 dBFS: quiet, no clipping. Digital level only |
| Console | Every load and run above | No errors |
| Existing model checks | `node scripts/verify_model.cjs`; `node scripts/verify_simulator.cjs --estimates` | Both exit 0, run after the tours were added. `--estimates` means the calculation checks passed while the design targets already recorded as unmet stay unmet |
| Website copy | `web`: `node scripts/prepare-viewer.mjs`, `npm run check:viewer` | 62 files, exact inventory, bytes and hash. The website's lint, unit and browser tests were not re-run: no file under `web/` changed |

## Second round: the electrical grid tour and a review of the first three

**Electrical grid tour.** Scenes: title over the lit church; the main board and the control enclosures in the service room; the wiring on its own; lighting routes; fan routes; sound lines; modelled loads and what needs an engineer. Sources for the wording: `Thach_Bi_Viewer/simulator/electrical.js` (enclosures, route kinds and their colours, the exit signs leaving DB-1 directly, audio home-run bundles, microphone lines below the floor), `docs/electrical-grid/routing.md` (display thickness is a convention, not a cable size), `docs/electrical-grid/controls.md` (DB-2 scope, per-group fan speed), `docs/electrical-grid/safety-efficiency-review.md` (it is not a wiring design; supply, earthing, cable sizes and protection are unknown).

| Check | How | Result |
| --- | --- | --- |
| Automated | `node scripts/verify_cinematic.cjs` | Passed for four tours: electrical grid 7 scenes, 112 s, fastest camera 4.0 m/s (outside, above the building). New checks: wiring filters, enclosures and route kinds exist in `electrical.js`; changes of wiring view happen under black; wiring figures from a stand-in model; nothing is quoted for light or air when nothing is on; the exact list of simulator calls, now including the wiring view |
| Five-minute film | same hash comparison as before | Identical |
| Every scene on screen | Frame export of all seven scenes; live playback from a real click in visit-only mode to the wiring-only scene | As intended; sound running, about −28 dBFS RMS |
| Camera clearance | `CHURCH_CINEMA.audit({ film: 'grid' })` | Nearest 0.59 m, to the vestment wardrobe in the service room (the room is small); nothing within 1.5 m elsewhere. In the wiring-only scenes the building is hidden but the audit still tests against it |
| Wiring view restored | Stopped with Esc in a wiring-only scene; and started from the user's own wiring-only view filtered to sound, run to the end | The whole view object (layer, mode, filters, selection) is identical afterwards in both cases; light and roof as for the other tours |
| Saved layout | `thachbi.simulator.v1` before and after | Identical; no history entry |
| Visit-only mode | Wiring tour started by a real click on `OPEN_CHURCH.html?visit`, stopped with Esc | Works; engineering layout untouched; Simulator panel stays closed |
| Four buttons | Element boxes at 1280 × 800 | Each 34 px wide with 32 px of text; Discover menu still fits without scrolling (384 of 384 px) |

**Review of the first three tours.** Things found by trying other states, and what was done:

- Started in **All off**, the tours quoted zeros as results ("the seats average 0 lux", "With these fans running … 40 dBA"). Light figures are now left out while no lamp is lit, and air and noise figures while no fan is running, so those captions use their plain wording. The air captions now say how many fans are running.
- **Prayer & adoration** and the **2-block seating** were read through in all tours: figures follow the state and nothing malformed appears (values in [capture.json](capture.json)).
- **Save as video** was started for a tour and gives a correctly named MP4; a whole tour was still not recorded.
- The **web check** in CI has failed on every run since 9 October 2026, on `dev` and `main` as well, for two reasons older than this work. First, the workflow did not check out the quick-start guide folder; that is fixed in `.github/workflows/web-checks.yml`, and lint, type check, unit tests, audit, build and the boundary check now pass in CI. Second, the browser test that opens the viewer in the 3D visit runs out of time under CI's software renderer (it already did when the public viewer was merged); see the pull request for the state of that.

## What the tours say about unmet aims

The captions quote the simulator's own results and name the aims they miss. On this run, recommended design, scene "Full service · evening" (values in [capture.json](capture.json)):

- Light on the book: 312 lux average; 89 % of 368 seats at 200 lux or more; lowest seat 122 lux, in the wings (wing average 214 lux).
- Air speed at the seats: 0.33 m/s average; 80 % of seats within 0.3 to 0.8 m/s; wings 0.22 m/s average, stillest seat 0.06 m/s. Nine exhaust fans, about 25,900 m³/h, about 3.5 air changes an hour against an aim of 4 to 6.
- Speech: 69 dBA average, 2.8 dB between the 5th and 95th percentile seats; STI 0.60 average, 65 % of seats at 0.60 or more, lowest seat 0.42, wings 0.49 average. Margin before feedback 0.9 and 1.3 dB at the two microphones against an aim of 3 dB.

None of these is resolved or re-judged by this work. They agree in kind with the baseline in `AGENTS.md` (low feedback margins, wing speech clarity, seats under the lighting brief, ventilation below its aim); the exact values are today's and differ from older tables in `docs/systems/`, which those documents already mark as historical.

## Limits and what is not verified

- **Wording not yet reviewed.** The captions, card texts and the Vietnamese translation were written for this request. The owner has not yet read them, and no lighting, mechanical or sound designer has checked the explanations.
- **Other layouts.** The figures follow whatever layout and scene are open. Viewed: the recommended design in the full-service scene. Captions read through, pictures not viewed: All off, Prayer & adoration, and the 2-block seating. Edited layouts and the other scenes were not tried.
- **Rings** use the simulator's wall and column geometry, not the full model: a fitting hidden by a beam, a pew or an ornament can still get a ring.
- **Frame rate, real-time recording and frame-by-frame export** of the tours were not timed or run to a finished video file. **Save as video** was started and stopped after a few seconds for one tour.
- **Electrical statements** in the wiring tour repeat the project's own documents and the simulator; no electrical engineer has checked them. The loads are modelled values on the simulator's assumptions (230 V, catalogue allowances), not a supply calculation.
- **Desktop only**, one browser (Chromium in the Claude desktop pane), one computer. The graphics card's real-time picture was seen for parts of the lighting and wiring tours only.
- The unmerged local branch `web/08-teaser-film` builds on the removed short film (bells, wiring-only scenes) and will conflict with this work.
- The Vietnamese quick-start guide (`docs/guides/father-quick-start/`) has its one sentence and narration clip updated; see its README for what is stale.
