# Fans and ventilation

> **Current review, 9 October 2026:** sixteen nave side-wall fans, eight per side, are visible by default but OFF in all built-in modes. Four wing wall fans remain, two per wing. The 14 nave ceiling fans, two entrance circulators and nine exhaust units are unchanged. The nave uses an extended-bracket geometry proxy with unchanged 45 cm fan ratings; bracket/fixings, airflow/noise/speech, concealment and maintenance remain held. See [nave fan review](../engineering/nave-wall-fans.md), [wing review](../engineering/wing-review.md) and the [matched air register](../electrical-grid/categories/air-system/register.xlsx).

Current inventory: **14 ceiling fans, 20 small wall fans (16 nave +4 wing), 2 entrance circulators and 9 exhaust units**. F2 is logical DB-1/FC-1 nave control; F5 serves wings. Physical channels, regulators, cable/protection and selected products are pending. Sixteen F2 proxies total560/720/880W at low/medium/high; default F2 demand0W. These are model assumptions, not motor nameplates or approved circuit capacity.

**Historical schedules below:** retained original options/results predate the current coordinated reviews; old counts, hidden/default states, breaker values and performance tables are not current installation specifications. Use the linked current sources above.

## 1. Design targets
- Seated air speed 0.3–0.8 m/s (cooling ≈ 1–2.5 °C in a hot, humid climate) without lifting pages or candle flames.
- Fan noise low enough for speech (background ≤ ~45 dBA at the seats).
- Blades ≥ 2.4 m above the floor, ≥ 0.3 m from columns, no light shining through blades.
- Ventilation: exhaust fans remove hot air under the roof; target 4–6 air changes per hour with people.

## 2. Fan types and specifications

| Type | Diameter | Speed steps: airflow / power / noise at 1 m / rpm | Quantity installed |
|---|---|---|---|
| Ceiling fan · 1.42 m (56") | 1.42 m | 1: 1.3 m³/s (4,680 m³/h) · 18 W · 32 dBA · 110 rpm<br>2: 2 m³/s (7,200 m³/h) · 34 W · 38 dBA · 170 rpm<br>3: 2.8 m³/s (10,080 m³/h) · 60 W · 45 dBA · 240 rpm | **18** |
| Wall fan · oscillating 45 cm | 0.45 m | 1: 0.45 m³/s (1,620 m³/h) · 35 W · 47 dBA · 900 rpm<br>2: 0.6 m³/s (2,160 m³/h) · 45 W · 52 dBA · 1100 rpm<br>3: 0.75 m³/s (2,700 m³/h) · 55 W · 57 dBA · 1300 rpm | **6** |
| Large wall circulator · 90 cm | 0.9 m | 1: 2.2 m³/s (7,920 m³/h) · 160 W · 52 dBA · 450 rpm<br>2: 3.2 m³/s (11,520 m³/h) · 260 W · 58 dBA · 650 rpm<br>3: 4.2 m³/s (15,120 m³/h) · 380 W · 64 dBA · 850 rpm | **2** |
| Exhaust (ventilation) fan · 50 cm | 0.5 m | 1: 0.8 m³/s (2,880 m³/h) · 60 W · 40 dBA · 900 rpm<br>2: 1.2 m³/s (4,320 m³/h) · 110 W · 46 dBA · 1300 rpm<br>3: 1.6 m³/s (5,760 m³/h) · 170 W · 52 dBA · 1700 rpm | **9** |

## 3. Schedule

| Circuit | Group | Type | Qty | Axis / position | Height (m) | Default state |
|---|---|---|---|---|---|---|
| F1 | Ceiling fan | Ceiling fan · 1.42 m (56") | 18 | x 12.22; x 16.73; x 21.23; x 25.73; x 30.23; x 34.73; x 39.30; x 41.85; x 7.72 | 3.3, 3.9 | speed 2 |
| F2 | Wall fan | Wall fan · oscillating 45 cm | 6 | 4; 6; 8 | 5.55 | hidden (optional) |
| F4 | Entrance circulator | Large wall circulator · 90 cm | 2 | x 2.66 (entrance wall piers, z ±3.05) | 6.0 | off (trial) |
| V1 | Exhaust fan | Exhaust (ventilation) fan · 50 cm | 9 | 12; 2′ (z ±0.8, ±2.4); x 39.70; x 41.45 | 3.3, 7.6, 9.4 | speed 1 |

## 4. Circuits and electrical load

| Circuit | Fittings | Running now (full service) | Connected load | Breaker |
|---|---|---|---|---|
| F1 · Ceiling fans | 18 | 612 W | 1,080 W (5.2 A) | C10 |
| F2 · Wall fans | 6 | 0 W | 0 W (0.0 A) | C6 |
| F4 · Entrance circulators (trial) | 2 | 0 W | 760 W (3.7 A) | C6 |
| V1 · Exhaust ventilation | 9 | 540 W | 1,530 W (7.4 A) | C10 |

## 5. Scenes

| Scene | F1 | F2 | F3 | F4 | V1 |
|---|---|---|---|---|---|
| Full service · evening | speed 2 | speed 2 | off | off | speed 1 |
| Weekday Mass | speed 2 | off | off | off | speed 1 |
| Prayer & adoration | speed 1 | off | off | off | speed 1 |
| Christmas & festivals | speed 2 | speed 3 | speed 3 | off | speed 2 |
| Festival · courtyard overflow | speed 2 | speed 3 | speed 3 | off | speed 2 |
| Cleaning | speed 1 | off | off | off | speed 2 |
| Night security | off | off | off | off | off |
| All off | off | off | off | off | off |

## 6. Test results (simulated)

| Scene | Avg air speed | Min | Max | Seats 0.3–0.8 m/s | Background noise |
|---|---|---|---|---|---|
| Full service · evening | 0.40 m/s | 0.26 | 0.79 | 95 % | 43.8 dBA |
| Weekday Mass | 0.40 m/s | 0.26 | 0.79 | 95 % | 43.8 dBA |
| Prayer & adoration | 0.26 m/s | 0.17 | 0.51 | 19 % | 42.5 dBA |
| Christmas & festivals | 0.40 m/s | 0.26 | 0.79 | 95 % | 46.1 dBA |
| Festival · courtyard overflow | 0.40 m/s | 0.26 | 0.79 | 95 % | 46.1 dBA |
| Cleaning | 0.26 m/s | 0.17 | 0.51 | 19 % | 45.3 dBA |
| Night security | 0.00 m/s | 0.00 | 0.00 | 0 % | 40.0 dBA |
| All off | 0.00 m/s | 0.00 | 0.00 | 0 % | 40.0 dBA |

Per block, full service: central (150 seats): avg 0.34, min 0.26 · outer (150 seats): avg 0.39, min 0.28 · wing (80 seats): avg 0.53, min 0.32.

Ventilation, full service: 9 exhaust fans move ≈25,920 m³/h ≈ 3.5 air changes per hour (comfort target in a hot climate with people: 4–6).

## 7. Findings
- The optional wall fans (F2) and the two entrance circulators (F4, trial) raise background noise enough to hurt speech; keep them for hot days without preaching or for cleaning.
- Exhaust fans at speed 1 give ≈ 3.5 air changes/h, below the 4–6 target; speed 2 reaches ≈ 5.2/h but costs speech clarity (76 % → 64 % of seats). Open doors and windows add natural ventilation that the model does not count.
- Room volume used: 7,456 m³.
