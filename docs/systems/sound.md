# Sound system · Thạch Bi church

> **Historical schedule:** the future-dated version label below does not establish recency. Its quantities, electrical allowances and passing feedback figures are stale. The fresh [7 October calculation audit](../../review/performance-2026-10-07/simulator-resources.log) retains low ambo/altar feedback margins (1.2/1.7 dB) and wing speech clarity (minimum STI 0.439, average 0.510). Use the [current sound register](../electrical-grid/categories/sound/register.xlsx) and [electrical summary](../electrical-grid/summary-report.md) for the maintained default equipment record. These remain design-development estimates.

> Generated from the simulator's recommended design (version `2026-10-15-system-review`) and its analysis engine on 2026-10-15.
> Values are engineering estimates for comparing options, not certified calculations; confirm with a licensed engineer and the chosen manufacturer's data before purchase.
> Coordinates: x along the nave toward the altar (axis 3 = 9.975 m … axis 10 = 44.175 m), z negative = left side B, positive = right side H, y = height above the nave floor (wings −0.32 m).

## 1. Design targets
- Speech intelligibility STI ≥ 0.60 (‘good’, IEC 60268-16) at as many seats as possible; no seat below 0.45.
- Speech level 68–76 dBA, even coverage; no late arrivals (echo) ≥ 50 ms within 10 dB.
- Feedback margin ≥ 3 dB at the ambo and altar microphones.

## 2. Room acoustics (model)

- Volume 7,456 m³, surface 3,467 m², occupancy 60 %, doors and windows open, mixed timber/acoustic roof lining, slatted panels on the entrance wall.
- Reverberation time T (s) by octave 125 Hz–8 kHz: 1.99, 1.55, 1.20, 1.10, 1.08, 1.07, 0.92; mid-frequency T = 1.15 s.

## 3. Loudspeaker types and specifications

| Type | Coverage (−6 dB, 2 kHz) H × V | Sensitivity 1 W / 1 m | Rated power | Description | Quantity |
|---|---|---|---|---|---|
| Slim wall column · 0.6 m, wall colour | 130° × 40° | 89 dB | 60 W | 4 × 2.5" drivers in a 6 cm-wide case painted to match the plaster; 130° × 30° (2 kHz), 89 dB 1 W/1 m, 60 W. For a discreet distributed system along the walls. | **14** |
| Pendant loudspeaker · 6" | 110° × 110° | 89 dB | 30 W | 110° cone, 89 dB 1 W/1 m, 30 W (100 V line). Verandas and overflow areas. | **8** |
| Outdoor horn · 30 W | 60° × 40° | 108 dB | 30 W | 60° × 40°, 108 dB 1 W/1 m. Courtyard overflow at festivals; narrow, bright sound. | **8** |

## 4. Schedule (level re the model's nominal, delay from automatic alignment)

| Circuit | Group | Type | Qty | Axis / position | Height (m) | Level | Delay (ms) | Default |
|---|---|---|---|---|---|---|---|---|
| A1 | Wall speaker | Slim wall column · 0.6 m, wall colour | 12 | 4; 5; 6; 7; 8; 9 | 3.45 | -6 dB | 24.2–89.9 | on |
| A5 | Wall speaker | Slim wall column · 0.6 m, wall colour | 2 | x 2.66 (entrance wall piers, z ±3.05) | 3.6 | -9 dB | 98.6–100.1 | off |
| A1 | Wing speaker | Pendant loudspeaker · 6" | 4 | x 38.94; x 42.22 | 3 | -10 dB | 23.8–40.4 | on |
| A2 | Veranda fill | Pendant loudspeaker · 6" | 4 | x 12.22; x 25.73 | 3.9 | -7 dB | 54.4–95.8 | on |
| A3 | Courtyard horn | Outdoor horn · 30 W | 2 | x -0.14 | 6.2 | -4 dB | 103.1–104.0 | off |
| A3 | Tower horn | Outdoor horn · 30 W | 2 | x -0.14 | 6.2 | -4 dB | 94.9–95.8 | off |
| A3 | Side courtyard horn | Outdoor horn · 30 W | 4 | 5; 8 | 5.6 | -6 dB | 28.3–69.8 | off |

## 5. Zones and circuits

| Circuit | Fittings | Running now (full service) | Connected load | Breaker |
|---|---|---|---|---|
| A1 · Main & delay loudspeakers | 16 | 97 W | 280 W (1.4 A) | C6 |
| A2 · Veranda fill | 4 | 24 W | 40 W (0.2 A) | C6 |
| A3 · Courtyard | 8 | 0 W | 80 W (0.4 A) | C6 |
| A5 · Rear fill (crowded feasts) | 2 | 0 W | 40 W (0.2 A) | C6 |
| Microphones | 2 | 0 W | 0 W (0.0 A) | C6 |

## 6. Scenes

| Scene | A1 | A2 | A3 | A4 | A5 | MIC |
|---|---|---|---|---|---|---|
| Full service · evening | on | on | off | on | off | on |
| Weekday Mass | on | off | off | off | off | on |
| Prayer & adoration | off | off | off | off | off | on |
| Christmas & festivals | on | on | off | on | off | on |
| Festival · courtyard overflow | on | on | on | on | on | on |
| Cleaning | off | off | off | off | off | off |
| Night security | off | off | off | off | off | off |
| All off | off | off | off | off | off | off |

## 7. Test results (simulated, talker 62 dBA at 1 m into the ambo microphone)

| Scene | Avg STI | Min STI | Seats STI ≥ 0.60 | Speech level | Echo seats | Feedback |
|---|---|---|---|---|---|---|
| Full service · evening | 0.605 | 0.452 | 63 % | 67.0 dBA | 0 | Ambo 3.1 dB; Altar 3.4 dB |
| Weekday Mass | 0.610 | 0.459 | 62 % | 66.7 dBA | 0 | Ambo 3.3 dB; Altar 3.6 dB |
| Prayer & adoration | – | – | – | – | 0 | – |
| Christmas & festivals | 0.596 | 0.442 | 58 % | 67.0 dBA | 0 | Ambo 3.1 dB; Altar 3.4 dB |
| Festival · courtyard overflow | 0.564 | 0.420 | 28 % | 68.6 dBA | 227 | Ambo 1.9 dB; Altar 2.2 dB |
| Cleaning | – | – | – | – | 0 | – |
| Night security | – | – | – | – | 0 | – |
| All off | – | – | – | – | 0 | – |

Per block, full service: central (150 seats): avg 0.63, min 0.54 · outer (150 seats): avg 0.61, min 0.46 · wing (80 seats): avg 0.54, min 0.45.

## 8. Findings and limits
- Nave: 79 % of seats reach STI ≥ 0.60; the remaining seats are 0.46–0.60 (‘fair’), mostly in the outer blocks by the open side walls.
- Wings: two pendants per wing bring the choir and ministers to ≈ 0.54 average. A louder speaker there costs feedback margin at the altar microphones; a headset microphone for the celebrant would allow more level everywhere.
- Courtyard horns (A3) are only in the scene ‘Festival · courtyard overflow’: their sound returns through the open windows 40–80 ms late and blurs speech inside.
- The model excludes the talker's own unamplified voice (conservative) and uses statistical reflections, not ray tracing.

## Current listening implementation · 7 October 2026

The performance update changes browser resource handling, not the equipment design
or acoustic equations. Reverberation and STIPA-like sample generation yield during
long loops; exact sample parity is checked against the prior implementation.
Unchanged listener/source/room propagation results are cached, while head rotation,
fan motion, mute/play state and analysis readouts remain live. Playback loading can
be canceled, late microphone permissions release their tracks, and retired speaker
chains disconnect from the programme bus. Muted speakers release their chains
after their delay contents drain; quick mute/unmute retains the delay line. Only
switched-on speakers allocate chains at startup. Hidden tabs suspend audio processing.

See [performance methods and tests](../simulator/performance.md#listening-mode).
Speaker positions, aiming, gain/delay settings, specifications, routes and sound
register inputs are unchanged by this listening-runtime update. It does not resolve
the feedback/wing targets above or validate a physical installation.
