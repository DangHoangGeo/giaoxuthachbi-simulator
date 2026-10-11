# Technical tours · review record, 11 October 2026

**Design in development · Not for construction · Đang phát triển · Không dùng để thi công.**

Owner's request, 11 October 2026 (`USER CONFIRMED` intent): remove the 2 min 15 s short film, and add separate technical tours that introduce the lights, the fans and the sound system with the simulator, each with a plain explanation.

Two changes were made:

1. **Short film removed** from the viewer (button, shot list, bell and toccata score, checks). The five-minute cinematic tour is unchanged: its score, shot list and the camera pose and black level sampled every 0.5 s were compared before and after and are identical.
2. **Three technical tours added**: Lighting, Fans and air, Sound. Each is 1 min 52 s in seven scenes. Implementation: `Thach_Bi_Viewer/cinematic-tour.js` and `cinematic-tour.css`, three buttons in `OPEN_CHURCH.html`. Use and limits: `docs/simulator/guide.md`, section "Technical tours".

These are display features. They change no dimension, equipment position, circuit, scene, setting, schedule or calculation, so no drawing register, equipment register, route export or summary report was affected. Documents checked for that conclusion: `docs/electrical-grid/controls.md` (circuit and scene names used in the captions), `docs/engineering/nave-wall-fans.md` and `docs/engineering/central-view-constraint.md` (status of the wall fans, clear central view), `docs/systems/lighting.md`, `fans.md`, `sound.md` (aims and open items), `docs/simulator/methods-and-limitations.md`.

## Pictures

Four frames of each tour, drawn by the viewer's own frame export (`CHURCH_CINEMA.still`, 1920 × 1080, captions, map key and rings painted into the picture) on the recommended design in the scene "Full service · evening":

| File | Frames |
| --- | --- |
| [lighting-tour.jpg](lighting-tour.jpg) | reading projectors with rings (20 s) · light map (36 s) · the wings on the map (52 s) · sanctuary accents (66 s) |
| [fans-and-air-tour.jpg](fans-and-air-tour.jpg) | ceiling fans with rings (20 s) · air-speed map (36 s) · the wings on the map (52 s) · nave wall fans (68 s) |
| [sound-tour.jpg](sound-tour.jpg) | wall loudspeakers with rings (30 s) · speech-level map (44 s) · speech-clarity map (60 s) · wings and microphones (76 s) |

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

## What the tours say about unmet aims

The captions quote the simulator's own results and name the aims they miss. On this run, recommended design, scene "Full service · evening" (values in [capture.json](capture.json)):

- Light on the book: 312 lux average; 89 % of 368 seats at 200 lux or more; lowest seat 122 lux, in the wings (wing average 214 lux).
- Air speed at the seats: 0.33 m/s average; 80 % of seats within 0.3 to 0.8 m/s; wings 0.22 m/s average, stillest seat 0.06 m/s. Nine exhaust fans, about 25,900 m³/h, about 3.5 air changes an hour against an aim of 4 to 6.
- Speech: 69 dBA average, 2.8 dB between the 5th and 95th percentile seats; STI 0.60 average, 65 % of seats at 0.60 or more, lowest seat 0.42, wings 0.49 average. Margin before feedback 0.9 and 1.3 dB at the two microphones against an aim of 3 dB.

None of these is resolved or re-judged by this work. They agree in kind with the baseline in `AGENTS.md` (low feedback margins, wing speech clarity, seats under the lighting brief, ventilation below its aim); the exact values are today's and differ from older tables in `docs/systems/`, which those documents already mark as historical.

## Limits and what is not verified

- **Wording not yet reviewed.** The captions, card texts and the Vietnamese translation were written for this request. The owner has not yet read them, and no lighting, mechanical or sound designer has checked the explanations.
- **Other layouts.** The figures follow whatever layout and scene are open. Checked here: the recommended design in the full-service scene, and the fallback wording through the automated check. Other scenes, the 2-block seating and edited layouts were not viewed.
- **Rings** use the simulator's wall and column geometry, not the full model: a fitting hidden by a beam, a pew or an ornament can still get a ring.
- **Frame rate, real-time recording and frame-by-frame export** of the tours were not timed or run to a finished video file. **Save as video** was not exercised for a tour beyond the frame export used for the pictures above.
- **Desktop only**, one browser (Chromium in the Claude desktop pane), one computer. The graphics card's real-time picture was seen for the lighting tour only.
- The unmerged local branch `web/08-teaser-film` builds on the removed short film (bells, wiring-only scenes) and will conflict with this work.
- The Vietnamese quick-start guide (`docs/guides/father-quick-start/`) is updated separately; see its README for what is stale.
