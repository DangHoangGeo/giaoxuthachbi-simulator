# Technical tours · review record, 11 October 2026

**Design in development · Not for construction · Đang phát triển · Không dùng để thi công.**

Owner's request, 11 October 2026 (`USER CONFIRMED` intent): remove the 2 min 15 s short film, and add separate technical tours that introduce the lights, the fans and the sound system with the simulator, each with a plain explanation. After the first three were shown, the owner asked the same day to keep reviewing and improving them and to include the electrical grid (wiring) as well; that message ended at “with”, so any further condition it carried is not known.

Three changes were made:

1. **Short film removed** from the viewer (button, shot list, bell and toccata score, checks). The five-minute cinematic tour is unchanged: its score, shot list and the camera pose and black level sampled every 0.5 s were compared before and after and are identical.
2. **Three technical tours added**: Lighting, Fans and air, Sound. Each is 1 min 52 s in seven scenes. Implementation: `Thach_Bi_Viewer/cinematic-tour.js` and `cinematic-tour.css`, three buttons in `OPEN_CHURCH.html`. Use and limits: `docs/simulator/guide.md`, section "Technical tours".

3. **Second round, same day**: a fourth tour, **Electrical grid** (button **Wiring**), also 1 min 52 s in seven scenes, built on the simulator's wiring-only view and its system filters; and corrections from a review of the first three (see "Second round" below).

These are display features. They change no dimension, equipment position, circuit, scene, setting, schedule or calculation, so no drawing register, equipment register, route export or summary report was affected. Documents checked for that conclusion: `docs/electrical-grid/controls.md` (circuit and scene names used in the captions), `docs/engineering/nave-wall-fans.md` and `docs/engineering/central-view-constraint.md` (status of the wall fans, clear central view), `docs/systems/lighting.md`, `fans.md`, `sound.md` (aims and open items), `docs/simulator/methods-and-limitations.md`.

## Pictures

Four frames of each tour, drawn by the viewer's own frame export (`CHURCH_CINEMA.still`, 1920 × 1080, captions, map key and rings painted into the picture) on the recommended design in the scene "Full service · evening":

| File | Frames |
| --- | --- |
| [lighting-tour.jpg](lighting-tour.jpg) | reading projectors with rings (20 s) · light map (36 s) · the wings on the map (52 s) · sanctuary accents (66 s) |
| [fans-and-air-tour.jpg](fans-and-air-tour.jpg) | ceiling fans with rings (20 s) · air-speed map (36 s) · the wings on the map (52 s) · nave wall fans (68 s) |
| [sound-tour.jpg](sound-tour.jpg) | wall loudspeakers with rings (30 s) · speech-level map (44 s) · speech-clarity map (60 s) · wings and microphones (76 s) |
| [electrical-grid-tour.jpg](electrical-grid-tour.jpg) | DB-1, LC-1 and FC-1 in the service room (20 s) · the wiring on its own (36 s) · lighting routes (52 s) · sound lines to AV-1 (84 s) |

The pictures are project-created views of the model (CC BY 4.0, see `NOTICE.md`). They show proposals and simulator estimates.

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
