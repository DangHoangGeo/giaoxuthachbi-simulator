# Estimate stats audit · 6 October 2026

The six displayed estimates now use consistent measurement planes, source references and units. The corrections expose some design shortfalls. They do not establish the accuracy of the representative equipment data against an installed church.

## Corrections

| Reading | Calculation and scope | Correction |
|---|---|---|
| Book / floor light, lux | Direct inverse-square/cosine illuminance plus a room-bounce approximation, multiplied by maintenance. Book height 0.8 m; circulation floor height 0.02 m. | Book offsets match the seat samples. Interior diffuse light stops at the building envelope; courtyard readings use floor light. |
| Speech clarity, STI | Approximate octave-band modulation transfer calculation including direct arrivals, delays, reverberation and background noise. Seated ears at 1.2 m; walking uses camera ear height. | Every speaker's direct on-axis level at 1 m matches its stated overall dBA after response and line-source normalization. Courtyard receivers no longer inherit indoor reverberation. |
| Speech level, dBA | Sum source energy within each octave, then A-weight and sum bands. Church average is `10 log10(mean(10^(L/10)))`. | Decibels use an energy mean. Analysis shows the actual interpolated P05–P95 interval, rather than a falsely symmetric interval around the average. |
| Fan air speed, m/s | Empirical fan jets sampled at 0.6 m, combined by root sum of squares. | Point, seat and plan calculations share the same 0.85 seating obstruction allowance. Solid walls block direct jets. Stopped fan properties show zero operating load and airflow. |
| Background noise, dBA | Energy sum of the assumed ambient level, running fan direct sound and the coupled room field. | Solid walls attenuate direct fan sound; outdoor receivers exclude indoor room noise. Seating averages use acoustic energy. HUD and Analysis use the same preferred noise threshold. |
| Equipment power, kW | Sum operational watts across visible modeled items, divided by 1000. | Switched-off active speakers contribute zero watts. Festival strings count the actual rendered bulbs, including spacing, at the assumed 1 W per bulb. Zero-lumen strings no longer have an invalid lumen/power slider. |

Feedback compares the talker and returning sound in the same octave bands, with the existing 6 dB stability allowance. The former broadband-versus-band comparison overstated the margin. Setting imports and edits now constrain finite values and catalogue parameter ranges. The cooling estimate is labeled as an empirical interpolation; it does not calculate SET.

Book-light status follows the displayed 200–300 lux target. The HUD identifies seated estimates being updated after equipment changes. Monthly cost stays out of the bottom stats. Analysis retains a service-only calculator: `equipment W / 1000 × hours/service × services/month × VND/kWh`.

## Reference model results

These values come from the isolated recommended starting design: 308 items, 380 sampled seats, 60% occupancy, open doors, 28 °C, 75% relative humidity and 40 dBA assumed ambient noise. The saved browser configuration can have different equipment settings and results. Each sampled seat has equal weight; occupancy changes room absorption rather than excluding selected seats from the average.

| Measure | Before audit | Corrected |
|---|---:|---:|
| Maintained book light, average / minimum | 346 / 193 lux | 346 / 193 lux |
| Seats reaching 200 lux | 99% | 99% |
| STI, average / minimum | 0.605 / 0.452 | 0.611 / 0.437 |
| Seats reaching STI 0.60 | 63% | 64% |
| Speech, seating average | 67.0 dBA | 68.7 dBA |
| Speech P95–P05 span | 2.6 dB | 2.6 dB |
| Noise, seating average / maximum | 43.8 / 43.9 dBA | 43.3 / 43.5 dBA |
| Air, average / minimum / maximum | 0.40 / 0.26 / 0.79 m/s | 0.39 / 0.26 / 0.79 m/s |
| Seats within 0.3–0.8 m/s | 95% | 94% |
| Modeled equipment load | 5512 W | 5512 W |
| Energy per 1.5-hour service | 8.3 kWh | 8.3 kWh |
| Mid-frequency reverberation | 1.15 s | 1.15 s |
| Ambo / altar feedback margin | 3.1 / 3.4 dB | 1.5 / 1.8 dB |

The default design's low feedback margins now produce warnings. The nave reaches STI 0.60 at 81.7% of seats, with a 0.476 minimum. Wing clarity averages 0.509, but its 0.437 minimum is below the previous 0.45 design check. Across both areas, 64% of seats reach the brief's 0.60 target. Ventilation is approximately 3.5 air changes per hour at the default exhaust speed. These results are retained; no gains, equipment or assumptions were changed to make the checks pass.

The current saved browser configuration was also checked independently of that baseline: its HUD and Analysis agreed on 345 lux, 0.57 STI, 65 dBA speech, 0.42 m/s fan air, 50 dBA background noise and 6.2 kW equipment power (6171 W in Analysis). The model flags its speech clarity shortfall. Those are estimates for the saved configuration at the time of review.

## Verification

- `node scripts/verify_estimates.cjs`: 24 independent formula and consistency checks. Expected values include closed-form inverse-square and cosine calculations, 3.0103/6.0206 dB energy/distance changes, one-metre source references, interpolated percentiles, discrete fan power, string bulb counts and service-energy arithmetic. Controlled point, seat and plan samples agree.
- `node scripts/verify_simulator.cjs --report --estimates`: passed the full bundled geometry, fixture mounts, electrical selection, persistent illumination, all 380 seats and all four plan grids (3959 light/air samples and 1059 clarity/noise samples each); point/seat agreement, acoustic mean reconciliation, circuit/energy totals, scene undo and layout round trip. Audit mode records unmet design targets while keeping calculation assertions active.
- The strict command without `--estimates` retains the design-target requirements and reports a failure for the newly exposed low microphone feedback margins. See `initial-audit.log`; this is a design-target failure, not hidden by the calculation audit.
- The All off scene passed: five maintained exit signs use 15 W; other circuits draw zero; fan airflow is zero; noise is the assumed 40 dBA ambient; speech/STI are unavailable. Residual maintained light is approximately 0.038 lux.

Machine-readable formula results are in `formula-checks.json`; the full model output is in `verified.json` and `verified.log`, with the earlier baseline in `baseline.log`. Browser evidence is recorded separately in `browser-checks.json`: 30 checks across eight reviewed states. Desktop and 390 × 844 phone layouts retain all six stats; the HUD, Analysis and noise/speech meters agree. The festival ridge string shows 80 bulbs / 80 W rated, and a stopped entrance fan shows 0 W with no fan airflow/noise. JavaScript syntax and Git whitespace checks also pass.

The board CSV/JSON schedules were regenerated with `node scripts/verify_simulator.cjs --electrical --export-electrical`. String specifications now show bulb counts, the assumed W/bulb and missing lumen data, and their connected ratings reconcile with the engine. See `electrical-checks.log`.

## Accuracy limits and sources

Light excludes daylight, manufacturer IES/LDT photometry, detailed pew shadows and festival bulbs without known lumens. Airflow excludes natural wind and is not CFD. Fan spectra, acoustic finishes, room coupling and amplifier/driver consumption are representative assumptions. Noise is estimated from the ambient input; the application does not measure the room microphone. STI and feedback are planning approximations. Power excludes other building loads, and service cost excludes preparation, cleaning, continuous loads, tariff tiers and taxes.

Actual product photometry, power/speed/noise curves, speaker polar and frequency-response data, acoustic material data and site readings are needed to calibrate these estimates. Installed speech clarity should be measured under the intended operating/background-noise conditions, as described by [NTi Audio's STI measurement guide](https://www.nti-audio.com/en/support/know-how/how-do-we-measure-speech-intelligibility-sti).

The illuminance checks follow the [CIE photometric distance law](https://cie.co.at/eilvterm/17-25-104). The acoustic checks use energy addition as explained in [Brüel & Kjær's Environmental Noise booklet](https://www.bksv.com/media/doc/br1626.pdf). These sources support the physical relationships, not the unmeasured catalogue values.
