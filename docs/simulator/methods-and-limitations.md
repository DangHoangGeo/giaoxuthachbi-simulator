# Simulator methods and limitations

Consolidated 7 October 2026 from the implementation, the [calculation audit](../../review/stats-audit-2026-10-06/README.md), the [guide](guide.md) and the [sanctuary revision](../sanctuary-model.md).

These methods produce planning estimates for comparing layouts. They do not certify structural, lighting, acoustic, ventilation or electrical performance. The web app does not measure the room or command installed devices.

## Calculation basis

| Result | Implemented method | Main limits and required validation |
| --- | --- | --- |
| Light, lux | Lumens converted to candela with the configured source distribution; inverse-square and cosine relationships; modeled wall/column/sanctuary occlusion; approximate room bounce and maintenance factor. | Representative distributions, reflectances and bounce. No manufacturer IES/LDT import, complete furniture shadows, validated glare calculation or daylight calculation. Beams, carved capitals, haunches and the lengthwise column-line beams are not occluders. Validate selected products, maintained minima, glare and faces in a specialist lighting study and a site mock-up. |
| Reverberation | Model-derived room volume and surface schedule; representative octave-band absorption; Eyring decay with temperature/humidity-dependent air absorption. Reflected energy uses a statistical room model. | Actual finishes, openings and occupied absorption are unmeasured. It is not a geometric reflection simulation. Calibrate against material data and measured room decay. |
| Speech level and STI | Octave-band speaker directivity, source normalization, distance loss, screening, arrival/DSP delays and reflected energy. Approximate modulation transfer, noise and masking determine STI. Levels are combined and averaged by acoustic energy. | Representative speaker data and statistical reflections. Minimum and per-seat results matter; a good average can hide poor wings or rear seats. Confirm with specialist prediction and calibrated speech-intelligibility tests under normal fan/background-noise conditions. |
| Microphone feedback | Estimated direct and reverberant speaker return compared with the assumed talker/microphone geometry, including the model's stability allowance. | A comparative estimate, not a stability guarantee. Verify actual microphones, placement, gains, DSP and room conditions. Existing low margins remain unresolved. |
| Fan air speed and comfort | Empirical ceiling down-jets/floor jets and tilted wall-fan jets, oscillation averaging, seating allowance and direct-jet blocking by solid walls. | No CFD or natural-wind prediction. Cooling is an empirical estimate, not a full thermal-comfort calculation. Catalogue exhaust flow divided by volume is a nominal ACH estimate; actual outdoor-air delivery needs openings, pressure losses and make-up air. Verify occupied-zone air speed, temperature, humidity and ventilation on site. |
| Background noise | Acoustic energy sum of assumed ambient noise, fan source estimates and room coupling. Outdoor receivers exclude the enclosed-room field. | Unmeasured ambient and fan spectra; not microphone monitoring. Check actual fan duty points and background noise with the sound system design. |
| Power and service energy | Estimated LED/driver loads, festival bulb counts, fan-speed curves and amplifier allowances. Service kWh = operating W × hours / 1000. | Excludes unmodeled building loads and use between services. Passive-speaker audio ratings are not mains watts. Circuit ratings, utility capacity and installation design are unverified. Cost depends on entered tariff/use assumptions. |
| 2D/3D wire routes | Shared route vertices and equipment endpoints provide selectable paths and geometric lengths. | Routes are a containment proposal, not individual conductors or an approved single-line diagram. Lengths exclude installation allowances; see [routing basis](../electrical-grid/routing.md). |

## Measurement planes and configuration

- Model coordinates are metres in the common X/Y/Z frame defined in [AGENTS.md](../../AGENTS.md). Heights below are above the local floor.
- Book light uses the configured seating plane, initially 0.80 m. Circulation light uses a near-floor plane at 0.02 m. Acoustic seat samples use ears at 1.20 m; walking readings use the camera's ear height. Fan air speed uses 0.60 m.
- The default study uses 60% occupancy, open openings, 28 °C, 75% RH, 40 dBA assumed ambient noise and a 0.8 light maintenance factor. These are inputs, not surveyed conditions. Record any overrides.
- The current sanctuary/seating revision samples 288 nave seats and 80 wing seats. Seat samples are not approved capacity. Occupancy changes room absorption; it does not remove particular sampled seats from the reported average.
- Keep the recommended default layout and a user's browser-saved layout separate. Record the code/design revision, active scene, seating/frame option and equipment configuration with every comparison.

## What the picture and listening mode establish

Every active lamp contributes from its actual modeled position. Native and texture-backed light paths share physical shading; the same two shadow sources are retained across simulator quality modes. A conservative spatial list skips only spots that cannot illuminate a surface cell. The separate View settings resolution control can reduce framebuffer size for smoother navigation. Explicit light graphics also disables antialiasing and preview shadow maps. These display options do not change analytical results. See [performance methods and checks](performance.md). Room bounce follows surface location. Fixed evening exposure is the default; optional eye adaptation changes perceived brightness.

This keeps the display consistent when moving around or changing graphics quality. It does not establish agreement with measured illuminance: rendering and analysis use different approximations, and most lamps have no individual shadow map. Never use camera exposure to disguise a lighting shortfall.

Listening mode uses speaker direction, propagation/DSP delays and synthesized room reverberation. Headphone output depends on playback hardware and volume. Digital output dBFS is separate from predicted acoustic dBA. Playing a STIPA sample does not perform a calibrated STIPA measurement.

## Comparing design options

1. Define the agreed targets and hold the comparison scenario constant. Save/export the baseline before editing.
2. Change identified fixtures or settings, then rerun all affected light, speech, air, noise and power analyses. Inspect individual seats, wings, paths and sanctuary targets, not just averages.
3. Recheck mounting, blade/light interference, obstructions, access and cable routes. Include quiet, peak, overflow and unfavorable weather/opening scenarios where relevant.
4. Retain failed targets and uncertainty. Verify formula changes against independent known cases; validate major design decisions with selected-product data, specialist calculations and full-scale trials.
5. Save the chosen layout and regenerate its route maps, schedules and control mapping together. Record why it improves the agreed brief and what still requires engineering resolution.

`node scripts/verify_estimates.cjs` verifies independent formula cases. `node scripts/verify_simulator.cjs --report --estimates` checks the integrated model and reports unmet design targets. A passing audit is not a passing design. Headless checks also do not establish GPU, audio-device or physical-control behavior.

Implementation owners: [physics](../../Thach_Bi_Viewer/simulator/physics.js), [analysis](../../Thach_Bi_Viewer/simulator/analysis.js), [engine](../../Thach_Bi_Viewer/simulator/engine.js), [audio](../../Thach_Bi_Viewer/simulator/audio.js), [electrical routes](../../Thach_Bi_Viewer/simulator/electrical.js) and [control UI](../../Thach_Bi_Viewer/simulator/controls.js).
