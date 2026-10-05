# Lighting system · Thạch Bi church

> Generated from the simulator's recommended design (version `2026-10-15-system-review`) and its analysis engine on 2026-10-15.
> Values are engineering estimates for comparing options, not certified calculations; confirm with a licensed engineer and the chosen manufacturer's data before purchase.
> Coordinates: x along the nave toward the altar (axis 3 = 9.975 m … axis 10 = 44.175 m), z negative = left side B, positive = right side H, y = height above the nave floor (wings −0.32 m).

## 1. Design targets
- Reading light on the books (0.8 m above the seat floor, maintained, maintenance factor 0.8): ≥ 200 lux for full services, ≥ 150 lux weekday Mass, ≈ 50 lux prayer.
- No light may shine through spinning fan blades (strobe); exterior lights are fixed high on the building, nothing on the ground in walkways.
- Colour: 2700–3000 K warm white, CRI ≥ 90 inside.

## 2. Fitting types and technical specifications

| Type | Description | Luminous flux (catalogue) | Power | CCT | CRI | Beam / field | Quantity |
|---|---|---|---|---|---|---|---|
| LED projector · medium 36° | 6 000 lm, 3000 K CRI 90, 36° beam, 50 W. Reading light from the tie beams. | 6,000 lm | 50 W | 3000 K | 90 | 36° / 58° | **80** |
| Roof uplight · wide flood | 4 000 lm, 2700 K, 100° flood, 32 W. Sits on a tie beam and washes the timber roof. | 4,000 lm | 32 W | 2700 K | 90 | 100° / 150° | **10** |
| Brass candle chandelier · 8 lamps | 8 × 470 lm candle LEDs, 2700 K, Ø 1.9 m. Sparkle and character; not a reading light. | 3,760 lm | 36 W | 2700 K | 90 | diffuse | **3** |
| Grand chandelier · 12 lamps | 12 × 470 lm candle LEDs, 2700 K, Ø 2.5 m. For the crossing or sanctuary. | 5,640 lm | 54 W | 2700 K | 90 | diffuse | **1** |
| Brass candle sconce · 2 lamps | 2 × 470 lm candle LEDs, 2700 K. Wall rhythm and evening atmosphere. | 940 lm | 9 W | 2700 K | 90 | diffuse | **18** |
| Accent spotlight · 15° | 2 500 lm, 3000 K CRI 95, 15° beam, 22 W. Altar, ambo, crucifix and statues. | 2,500 lm | 22 W | 3000 K | 95 | 15° / 26° | **8** |
| Pendant lantern · opal | 1 500 lm, 2700 K, 14 W. Verandas and porches. | 1,500 lm | 14 W | 2700 K | 90 | diffuse | **18** |
| Exit sign (maintained) | 3 W self-contained exit sign. Shown for location only; emergency lighting needs its own design. | 20 lm | 3 W | 6500 K | – | diffuse | **5** |
| Wall lantern | 900 lm, 2700 K, 9 W. Veranda piers and side doors. | 900 lm | 9 W | 2700 K | 90 | diffuse | **6** |
| Façade floodlight | 9 000 lm, 3000 K, 30° beam, 70 W, IP66. Towers and façade. | 9,000 lm | 70 W | 3000 K | 80 | 30° / 50° | **18** |
| Festival bulb string (outdoor) | Warm 2200 K LED bulbs, ~1 W each, IP65. For ridges, eaves, gables and tower edges on big feasts. | 0 lm | 0 W per m | 2200 K | – | diffuse | **24** |
| Votive candle stand · 7 |  | 84 lm | 0 W | 1900 K | – | diffuse | **2** |
| Paschal candle |  | 12 lm | 0 W | 1900 K | – | diffuse | **1** |

**Total light fittings: 194.** Projector outputs are set per position (column ‘Set flux’ below).

## 3. Schedule by circuit

| Circuit | Group | Type | Qty | Axis / position | Height (m) | Set flux each | Beam |
|---|---|---|---|---|---|---|---|
| L1 | Reading light | LED projector · medium 36° | 28 | 3; 4; 5; 6; 7; 8; 9 | 8.58 | 2,300 lm | 28° |
| L2 | Reading light | LED projector · medium 36° | 28 | 3; 4; 5; 6; 7; 8; 9 | 6.66 | 2,300 lm | 36° |
| L1 | Rear rows light | LED projector · medium 36° | 2 | x 2.65 | 3.45 | 6,000 lm | 44° |
| L1 | Rear centre light | LED projector · medium 36° | 2 | x 2.65 | 5.95 | 3,300 lm | 50° |
| L8 | Wing light | LED projector · medium 36° | 8 | x 40.26; x 40.86 | 2.92, 4.15 | 3,800 lm, 4,000 lm | 36°, 50° |
| LA | Roof uplight | Roof uplight · wide flood | 8 | 10; 3; 4; 5; 6; 7; 8; 9 | 9.18 | 4,000 lm | – |
| LD | Chandelier | Brass candle chandelier · 8 lamps | 3 | x 16.73; x 25.73; x 34.73 | 6.3 | 3,760 lm | – |
| LD | Grand chandelier | Grand chandelier · 12 lamps | 1 | x 40.58 | 7.2 | 5,640 lm | – |
| LD | Sconce | Brass candle sconce · 2 lamps | 18 | 11; 3; 4; 5; 6; 7; 8; 9; x 2.65 | 3, 4.3, 4.6 | 940 lm | – |
| L3 | Altar key light | Accent spotlight · 15° | 2 | 9 | 8.58 | 3,500 lm | 24° |
| L3 | Ambo key light | Accent spotlight · 15° | 1 | 9 | 8.58 | 2,500 lm | 15° |
| L3 | Sanctuary step fill | LED projector · medium 36° | 2 | 9 | 8.58 | 4,000 lm | – |
| L3 | Crucifix accent | Accent spotlight · 15° | 2 | 10 | 6.6 | 1,200 lm | 15° |
| L3 | Tabernacle accent | Accent spotlight · 15° | 1 | 10 | 4.6 | 900 lm | 10° |
| L3 | Statue accent | Accent spotlight · 15° | 2 | 9 | 6.66 | 1,800 lm | 12° |
| L4 | Veranda lantern | Pendant lantern · opal | 18 | 10; 11; 3; 4; 5; 6; 7; 8; 9 | 4.55 | 2,000 lm | – |
| E1 | Exit sign | Exit sign (maintained) | 5 | x 16.73; x 2.65; x 34.73 | 4.6, 6.95 | 20 lm | – |
| L5 | Tower lantern | Wall lantern | 4 | x -0.16; x -0.37 | 2.6 | 900 lm | – |
| L5 | Side door lantern | Wall lantern | 2 | x 15.30 | 2.25 | 900 lm | – |
| L6 | Tower stage 2 flood | Façade floodlight | 2 | x -0.08 | 8.4 | 9,000 lm | 32° |
| L6 | Tower stage 3 flood | Façade floodlight | 2 | x 0.01 | 15.88 | 8,000 lm | 30° |
| L6 | Belfry & dome flood | Façade floodlight | 2 | x 0.15 | 23.2 | 8,000 lm | 30° |
| L6 | Belfry glow | Roof uplight · wide flood | 2 | x 2.45 | 23.2 | 2,500 lm | – |
| L6 | Tower side wash | Façade floodlight | 2 | x 2.45 | 8.4 | 5,000 lm | 30° |
| L6 | Façade wash | Façade floodlight | 2 | x -0.08 | 8.4 | 6,000 lm | 50° |
| L5 | Stage flood | Façade floodlight | 4 | x -0.08 | 8.4 | 9,000 lm | 45° |
| L5 | Path light | LED projector · medium 36° | 10 | 11; 12; 4; 6; x 40.58 | 5.2, 5.9, 6.2 | 2,500 lm, 3,000 lm | 50°, 55° |
| L7 | Festival lights | Festival bulb string (outdoor) | 24 | 11; x -0.21; x -0.31; x -0.40; x 2.15; x 21.35; x 29.16; x 53.45 | 4.2, 6.47, 7.32, 8.5, 10, 12.12, 12.69, 19.49 | 0 lm | – |
| L7 | Festival flood | Façade floodlight | 2 | x 52.60 | 6.55 | 9,000 lm | 40° |
| L6 | Central gable flood | Façade floodlight | 2 | x -0.08 | 8.4 | 4,500 lm | 26° |
| DECOR | Votive candles | Votive candle stand · 7 | 2 | x 48.10 | 0.15 | 84 lm | – |
| DECOR | Paschal candle | Paschal candle | 1 | x 42.05 | 0.75 | 12 lm | – |

## 4. Circuits and electrical load

| Circuit | Fittings | Running now (full service) | Connected load | Breaker |
|---|---|---|---|---|
| L1 · Central seating | 32 | 692 W | 692 W (3.3 A) | C6 |
| L2 · Outer seating | 28 | 537 W | 537 W (2.6 A) | C6 |
| L3 · Sanctuary | 10 | 211 W | 211 W (1.0 A) | C6 |
| L4 · Circulation & verandas | 18 | 336 W | 336 W (1.6 A) | C6 |
| LA · Roof uplight | 8 | 256 W | 256 W (1.2 A) | C6 |
| LD · Chandeliers & sconces | 22 | 324 W | 324 W (1.6 A) | C6 |
| L5 · Steps & paths | 20 | 559 W | 559 W (2.7 A) | C6 |
| L8 · Wings · choir & ministers | 8 | 260 W | 260 W (1.3 A) | C6 |
| L6 · Façade & towers | 14 | 670 W | 670 W (3.2 A) | C6 |
| L7 · Festival exterior (strings & tower floods) | 26 | 0 W | 698 W (3.4 A) | C6 |
| E1 · Exit signs | 5 | 15 W | 15 W (0.1 A) | C6 |

## 5. Scenes (keypad)

| Scene | L1 | L2 | L3 | L4 | LA | LD | L5 | L8 | L6 | L7 | E1 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Full service · evening | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | off | 100% |
| Weekday Mass | 75% | 60% | 80% | 50% | 40% | 60% | 100% | 75% | off | off | 100% |
| Prayer & adoration | 20% | 20% | 45% | 25% | 50% | 35% | 100% | 25% | off | off | 100% |
| Christmas & festivals | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| Festival · courtyard overflow | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| Cleaning | 100% | 100% | 50% | 100% | off | off | off | 100% | off | off | 100% |
| Night security | off | off | off | 30% | off | off | 100% | off | off | off | 100% |
| All off | off | off | off | off | off | off | off | off | off | off | 100% |

## 6. Test results (simulated, every seat: 380 seats)

| Scene | Avg lux | Min lux | Seats ≥ 200 lux | Lighting + all loads |
|---|---|---|---|---|
| Full service · evening | 344 | 193 | 99 % | 5,133 W |
| Weekday Mass | 236 | 136 | 67 % | 3,549 W |
| Prayer & adoration | 78 | 45 | 0 % | 2,282 W |
| Christmas & festivals | 344 | 193 | 99 % | 6,280 W |
| Festival · courtyard overflow | 344 | 193 | 99 % | 6,341 W |
| Cleaning | 319 | 171 | 97 % | 3,265 W |
| Night security | 1 | 0 | 0 % | 689 W |
| All off | 0 | 0 | 0 % | 15 W |

Per seating block, full service: central (150 seats): avg 322, min 194 · outer (150 seats): avg 344, min 193 · wing (80 seats): avg 385, min 203.

## 7. Design notes
- Reading projectors hang under the tie beams (central blocks, 28°) and side beams (outer blocks, 36°), twin heads tilted ±8° along the nave.
- Bay 2′–3 has no tie beam: brackets on the inner face of the entrance façade light the last rows.
- Wings (L8): heads on the solid centre of each end gable; the front-row heads sit below the fan blades so no light passes through the blades.
- Exterior (L5, L6): tower and façade floods, stage floods and path lights are all wall- or cornice-mounted.
- Exit signs (E1) show location only; emergency lighting needs its own design to the local code.
