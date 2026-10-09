# Equipment quantities, usage and quality report

Generated 9 October 2026 from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Lighting | 216 | 216 | 0 | 216 | 190 | 237 | 2030 |
| Sound | 30 | 30 | 0 | 30 | 20 | 40 | 304 |
| Fans and ventilation | 35 | 35 | 0 | 35 | 27 | 45 | 320 |
| Exit signs | 5 | 5 | 0 | 5 | 5 | 7 | 54 |
| Decoration and furnishings | 34 | 19 | 15 | 0 | 19 | 0 | 0 |
| Distribution and controls | 5 | 5 | 0 | 0 | 0 | 4 | 41 |
| **Total** | 325 | 310 | 15 | 286 | 261 | 333 | 2749 |

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **10 equipment, 14 routes**.

## Usage and energy estimate

Saved scene: **Full service · evening**. Service duration **1.5 h**, **40 services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **available in the saved model**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
| Lighting | 4,272.5 | 6.409 | 256.35 | L1, L2, L3, L4, L5, L6, L7, L8, L9, LA, LD |
| Sound | 109.4 | 0.164 | 6.57 | A1, A2, A3, A5, MIC |
| Fans and ventilation | 1,156.0 | 1.734 | 69.36 | F1, F2, F4, F5, V1 |
| Exit signs | 15.0 | 0.023 | 0.90 | E1 |
| Decoration and furnishings | 0.0 | 0.000 | 0.00 | DECOR, X1 |
| Distribution and controls | 0.0 | 0.000 | 0.00 | Shared board feeders |
| **Total modeled usage** | **5,553.0** | **8.329** | **333.18** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
| Lighting | 2,876.292 | 2,876.292 | 0.000 | 0.000 |
| Sound | 744.183 | 0.000 | 1,790.080 | 583.921 |
| Fans and ventilation | 800.521 | 800.521 | 0.000 | 0.000 |
| Exit signs | 147.736 | 147.736 | 0.000 | 0.000 |
| Decoration and furnishings | 0.000 | 0.000 | 0.000 | 0.000 |
| Distribution and controls | 92.443 | 92.443 | 0.000 | 0.000 |
| **Total by length basis** | **4,661.176** | **3,916.992** | **1,790.080** | **583.921** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. 0/323 non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
| Lighting | 0/216 | 0/216 | 0/237 |
| Sound | 0/30 | 0/30 | 0/40 |
| Fans and ventilation | 0/35 | 0/35 | 0/45 |
| Exit signs | 0/5 | 0/5 | 0/7 |
| Decoration and furnishings | 0/34 | 0/0 | 0/0 |
| Distribution and controls | 0/5 | 0/0 | 0/4 |
| **Total** | **0/325** | **0/286** | **0/333** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The held wing review of 9 October 2026 retains four small brass chandeliers (L63/L65/L67/L69), four F5 above-window wall fans (F240–F243, extended bracket proxy), and two entrance-facing wing wall speakers (S276/S278). Four light IDs, four appended fan IDs and S275/S277 are retired; six F2 nave wall fans remain shown/OFF. Four unpowered Peter/Paul pictures are decoration records with no electrical routes. Task lighting, airflow, noise, speech/feedback, glare, concealment, product and mounting holds remain; see [wing comparison](../engineering/wing-review.md). The seating-cache correction is independently verified, not design approval. Register refresh does not resolve performance failures. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

- [Layout snapshot](equipment-layout.json), SHA-256: d4067e8bb027f3bb435cc6fee67c0fc1d0e462a2d8802a6ada0bb37df793ab52.
- [Electrical snapshot](electrical-systems.json), SHA-256: e2130aeffb518d934149fa35c32d858856db06e804d9cb98aac4f1896cd3b761.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run `node scripts/build_equipment_register.mjs --verify-workflow` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.
