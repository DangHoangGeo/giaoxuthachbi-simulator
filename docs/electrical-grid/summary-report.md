# Equipment quantities, usage and quality report

Generated 7 October 2026 from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Lighting | 220 | 220 | 0 | 220 | 194 | 241 | 2050 |
| Sound | 32 | 32 | 0 | 32 | 22 | 42 | 302 |
| Fans and ventilation | 35 | 29 | 6 | 29 | 27 | 35 | 234 |
| Exit signs | 5 | 5 | 0 | 5 | 5 | 7 | 54 |
| Decoration and furnishings | 30 | 15 | 15 | 0 | 15 | 0 | 0 |
| Distribution and controls | 5 | 5 | 0 | 0 | 0 | 4 | 41 |
| **Total** | 327 | 306 | 21 | 286 | 263 | 329 | 2681 |

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **0 equipment, 0 routes**.

## Usage and energy estimate

Saved scene: **Full service · evening**. Service duration **1.5 h**, **40 services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **available in the saved model**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
| Lighting | 4,328.5 | 6.493 | 259.71 | L1, L2, L3, L4, L5, L6, L7, L8, L9, LA, LD |
| Sound | 121.3 | 0.182 | 7.28 | A1, A2, A3, A5, MIC |
| Fans and ventilation | 1,152.0 | 1.728 | 69.12 | F1, F2, F4, V1 |
| Exit signs | 15.0 | 0.023 | 0.90 | E1 |
| Decoration and furnishings | 0.0 | 0.000 | 0.00 | DECOR, X1 |
| Distribution and controls | 0.0 | 0.000 | 0.00 | Shared board feeders |
| **Total modeled usage** | **5,616.9** | **8.425** | **337.01** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
| Lighting | 2,937.717 | 2,937.717 | 0.000 | 0.000 |
| Sound | 764.858 | 0.000 | 1,891.275 | 583.921 |
| Fans and ventilation | 591.868 | 591.868 | 0.000 | 0.000 |
| Exit signs | 147.736 | 147.736 | 0.000 | 0.000 |
| Decoration and furnishings | 0.000 | 0.000 | 0.000 | 0.000 |
| Distribution and controls | 92.443 | 92.443 | 0.000 | 0.000 |
| **Total by length basis** | **4,534.622** | **3,769.763** | **1,891.275** | **583.921** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. 0/319 non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
| Lighting | 0/220 | 0/220 | 0/241 |
| Sound | 0/32 | 0/32 | 0/42 |
| Fans and ventilation | 0/35 | 0/29 | 0/35 |
| Exit signs | 0/5 | 0/5 | 0/7 |
| Decoration and furnishings | 0/30 | 0/0 | 0/0 |
| Distribution and controls | 0/5 | 0/0 | 0/4 |
| **Total** | **0/327** | **0/286** | **0/329** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The engineering review recorded on 7 October 2026 still identifies low ambo/altar microphone feedback margins, wing speech clarity below the test target, and lighting/ventilation limitations. This register refresh does not rerun or resolve those performance studies. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

- [Layout snapshot](equipment-layout.json), SHA-256: 43d938ca7f8fb8bab04793528cf39b516a7cfa3e6f752cefca7203bfeafa0aac.
- [Electrical snapshot](electrical-systems.json), SHA-256: a162fc27119841a75190b0bc0153cc17495a8bc432ad574a535e8a6799eb9a3d.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run `node scripts/build_equipment_register.mjs --verify-workflow` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.
