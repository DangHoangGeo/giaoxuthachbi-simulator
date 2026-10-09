# Equipment quantities, usage and quality report

Generated 9 October 2026 from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Lighting | 231 | 231 | 0 | 231 | 205 | 254 | 2115 |
| Sound | 30 | 30 | 0 | 30 | 20 | 40 | 304 |
| Fans and ventilation | 45 | 45 | 0 | 45 | 27 | 55 | 350 |
| Exit signs | 5 | 5 | 0 | 5 | 5 | 7 | 54 |
| Decoration and furnishings | 37 | 22 | 15 | 0 | 22 | 0 | 0 |
| Distribution and controls | 11 | 11 | 0 | 6 | 4 | 14 | 105 |
| **Total** | 359 | 344 | 15 | 317 | 283 | 370 | 2928 |

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **10 equipment, 21 routes**.

## Usage and energy estimate

Saved scene: **Full service · evening**. Service duration **1.5 h**, **40 services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **available in the saved model**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
| Lighting | 4,306.5 | 6.460 | 258.39 | L1, L10, L2, L3, L4, L5, L6, L7, L8, L9, LA, LD |
| Sound | 109.4 | 0.164 | 6.57 | A1, A2, A3, A5, MIC |
| Fans and ventilation | 1,156.0 | 1.734 | 69.36 | F1, F2, F4, F5, V1 |
| Exit signs | 15.0 | 0.023 | 0.90 | E1 |
| Decoration and furnishings | 0.0 | 0.000 | 0.00 | DECOR, X1 |
| Distribution and controls | 0.0 | 0.000 | 0.00 | P1, P2, P3, P4 |
| **Total modeled usage** | **5,587.0** | **8.380** | **335.22** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
| Lighting | 3,046.922 | 3,046.922 | 0.000 | 0.000 |
| Sound | 744.183 | 0.000 | 1,790.080 | 583.921 |
| Fans and ventilation | 826.041 | 826.041 | 0.000 | 0.000 |
| Exit signs | 145.936 | 145.936 | 0.000 | 0.000 |
| Decoration and furnishings | 0.000 | 0.000 | 0.000 | 0.000 |
| Distribution and controls | 244.983 | 244.983 | 0.000 | 0.000 |
| **Total by length basis** | **5,008.066** | **4,263.883** | **1,790.080** | **583.921** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. 0/360 non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
| Lighting | 0/231 | 0/231 | 0/254 |
| Sound | 0/30 | 0/30 | 0/40 |
| Fans and ventilation | 0/45 | 0/45 | 0/55 |
| Exit signs | 0/5 | 0/5 | 0/7 |
| Decoration and furnishings | 0/37 | 0/0 | 0/0 |
| Distribution and controls | 0/11 | 0/6 | 0/14 |
| **Total** | **0/359** | **0/317** | **0/370** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The held wing review of 9 October 2026 retains four small brass chandeliers (L63/L65/L67/L69), four F5 above-window wall fans (F240–F243, extended bracket proxy), and two entrance-facing wing wall speakers (S276/S278). Four light IDs, four appended fan IDs and S275/S277 are retired; sixteen F2 nave wall fans (eight per side, extended bracket proxy) remain shown/OFF. Four unpowered Peter/Paul pictures are decoration records with no electrical routes. Task lighting, airflow, noise, speech/feedback, glare, concealment, product and mounting holds remain; see [wing comparison](../engineering/wing-review.md). The seating-cache correction is independently verified, not design approval. The outlet and façade-statue issue of 9 October 2026 adds six socket-outlet points on P1–P4 (four indoor double outlets from DB-1, two lockable tower event points from DB-2, owned by distribution-controls), three façade statues as unpowered decoration records, and fifteen L10 lighting records for them (nine concealed light lines and six candle lights). Socket rated values are planning allowances per circuit, not equipment loads, and add nothing to the operating estimate while no test load is entered. The electrical walk-round review of 9 October 2026 moves the origin of the seven E1 exit-sign routes from LC-1 to DB-1, so that the signs do not depend on the lighting-control enclosure; the seven earlier route IDs are retired and the signs, their positions and their 15 W are unchanged. See the [safety and efficiency review](safety-efficiency-review.md). Supply, feeder, protection, accessories, slots and fixings remain held; see [outlets and façade statues](../engineering/outlets-and-facade-statues.md). Register refresh does not resolve performance failures. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

- [Layout snapshot](equipment-layout.json), SHA-256: 0a6cf2aa5294b46ad1ca267ef78dada74d793fdb4a83f39e392746594b74ba7c.
- [Electrical snapshot](electrical-systems.json), SHA-256: e25c59374b1948a67cdb0ee5bed0beb9884da65931cb92b8dc2af738d4ae1e28.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run `node scripts/build_equipment_register.mjs --verify-workflow` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.
