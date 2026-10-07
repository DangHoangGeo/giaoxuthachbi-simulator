# Frozen study results

Generated from the 24 cases in [study-results/manifest.json](study-results/manifest.json); every case samples all 368 receivers. Numbers are rounded here only; raw JSON retains full precision, settings, equipment, checks and location IDs. When no speech source exists, raw STI failure lists are empty because no STI is evaluated. The table shows both STI and its failure count as **n/a**, not a pass.

| Case | Minimum book lux | Below scene target | Minimum STI | Below .60 | Air below .30 m/s | Ambo / altar margin dB |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| [full-4](study-results/full-4.json) | 196.803 | 4 | 0.4392 | 123 | 18 | 1.21 / 1.71 |
| [weekday-4](study-results/weekday-4.json) | 139.986 | 4 | 0.4436 | 124 | 18 | 1.39 / 1.90 |
| [prayer-4](study-results/prayer-4.json) | 46.015 | 6 | n/a | n/a | 302 | n/a / n/a |
| [festival-4](study-results/festival-4.json) | 196.803 | 4 | 0.4356 | 125 | 18 | 1.21 / 1.71 |
| [overflow-4](study-results/overflow-4.json) | 196.803 | 4 | 0.4207 | 250 | 18 | -0.44 / 0.08 |
| [cleaning-4](study-results/cleaning-4.json) | 173.944 | 0 | n/a | n/a | 302 | n/a / n/a |
| [security-4](study-results/security-4.json) | 0.060 | n/a | n/a | n/a | 368 | n/a / n/a |
| [off-4](study-results/off-4.json) | 0.000 | n/a | n/a | n/a | 368 | n/a / n/a |
| [full-2](study-results/full-2.json) | 201.045 | 0 | 0.4382 | 109 | 8 | 1.18 / 1.68 |
| [weekday-2](study-results/weekday-2.json) | 145.166 | 2 | 0.4426 | 105 | 8 | 1.36 / 1.87 |
| [prayer-2](study-results/prayer-2.json) | 46.901 | 2 | n/a | n/a | 186 | n/a / n/a |
| [festival-2](study-results/festival-2.json) | 201.045 | 0 | 0.4346 | 110 | 8 | 1.18 / 1.68 |
| [overflow-2](study-results/overflow-2.json) | 201.045 | 0 | 0.4197 | 224 | 8 | -0.47 / 0.04 |
| [cleaning-2](study-results/cleaning-2.json) | 178.692 | 0 | n/a | n/a | 186 | n/a / n/a |
| [security-2](study-results/security-2.json) | 0.065 | n/a | n/a | n/a | 368 | n/a / n/a |
| [off-2](study-results/off-2.json) | 0.000 | n/a | n/a | n/a | 368 | n/a / n/a |
| [sensitivity-hot-still-4](study-results/sensitivity-hot-still-4.json) | 196.803 | 4 | 0.4436 | 122 | 18 | 1.22 / 1.73 |
| [sensitivity-wet-restricted-4](study-results/sensitivity-wet-restricted-4.json) | 197.972 | 4 | 0.4160 | 175 | 18 | 0.43 / 0.88 |
| [sensitivity-cool-4](study-results/sensitivity-cool-4.json) | 196.803 | 4 | 0.4368 | 124 | 18 | 1.20 / 1.70 |
| [sensitivity-peak-occupied-4](study-results/sensitivity-peak-occupied-4.json) | 196.803 | 4 | 0.4663 | 95 | 18 | 2.11 / 2.69 |
| [sensitivity-sparse-4](study-results/sensitivity-sparse-4.json) | 196.803 | 4 | 0.4068 | 220 | 18 | 0.04 / 0.47 |
| [sensitivity-openings-closed-4](study-results/sensitivity-openings-closed-4.json) | 198.366 | 4 | 0.4065 | 210 | 18 | 0.19 / 0.61 |
| [sensitivity-noisy-4](study-results/sensitivity-noisy-4.json) | 196.803 | 4 | 0.4164 | 149 | 18 | 1.21 / 1.71 |
| [sensitivity-talker-far-4](study-results/sensitivity-talker-far-4.json) | 196.803 | 4 | 0.4392 | 123 | 18 | -2.32 / -1.81 |

Air lower-bound counts for unoccupied/off/cool modes are descriptive, not a claim that fans should run in those modes. Occupancy-zone and seasonal acceptance remain pending. The source files determine every computed value; the runner does not change physics, sample density or thresholds.

Fresh model load repeated every case exactly after removing only export timestamps. Both layouts retain 288 nave plus 80 wing receivers, with different nave positions. This is not approved capacity. The exported default matches every saved layout item and setting; existing independent audit summary values agree at their published rounding.
