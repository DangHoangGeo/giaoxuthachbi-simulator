# Equipment quantities, usage and quality report

Generated 1 November 2026 from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Lighting | 272 | 272 | 0 | 272 | 246 | 295 | 2236 |
| Sound | 44 | 44 | 0 | 44 | 34 | 54 | 334 |
| Fans and ventilation | 45 | 45 | 0 | 45 | 27 | 58 | 410 |
| Exit signs | 5 | 5 | 0 | 5 | 5 | 7 | 68 |
| Decoration and furnishings | 37 | 22 | 15 | 0 | 22 | 0 | 0 |
| Distribution and controls | 12 | 12 | 0 | 6 | 4 | 15 | 109 |
| **Total** | 415 | 400 | 15 | 372 | 338 | 429 | 3157 |

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **33 equipment, 116 routes**.

## Usage and energy estimate

Saved scene: **Full service · evening**. Service duration **1.5 h**, **40 services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **available in the saved model**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
| Lighting | 4,184.8 | 6.277 | 251.09 | L1, L10, L2, L3, L4, L5, L6, L7, L8, L9, LA, LS |
| Sound | 193.4 | 0.290 | 11.60 | A1, A2, A3, A5, MIC |
| Fans and ventilation | 1,156.0 | 1.734 | 69.36 | F1, F2, F4, F5, V1, V2, V3 |
| Exit signs | 15.0 | 0.023 | 0.90 | E1 |
| Decoration and furnishings | 0.0 | 0.000 | 0.00 | DECOR, X1 |
| Distribution and controls | 0.0 | 0.000 | 0.00 | P1, P2, P3, P4 |
| **Total modeled usage** | **5,549.1** | **8.324** | **332.95** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
| Lighting | 3,248.659 | 3,248.659 | 0.000 | 0.000 |
| Sound | 768.994 | 0.000 | 2,365.631 | 571.727 |
| Fans and ventilation | 955.646 | 955.646 | 0.000 | 0.000 |
| Exit signs | 168.600 | 168.600 | 0.000 | 0.000 |
| Decoration and furnishings | 0.000 | 0.000 | 0.000 | 0.000 |
| Distribution and controls | 263.923 | 263.923 | 0.000 | 0.000 |
| **Total by length basis** | **5,405.821** | **4,636.828** | **2,365.631** | **571.727** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. 0/419 non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
| Lighting | 0/272 | 0/272 | 0/295 |
| Sound | 0/44 | 0/44 | 0/54 |
| Fans and ventilation | 0/45 | 0/45 | 0/58 |
| Exit signs | 0/5 | 0/5 | 0/7 |
| Decoration and furnishings | 0/37 | 0/0 | 0/0 |
| Distribution and controls | 0/12 | 0/6 | 0/15 |
| **Total** | **0/415** | **0/372** | **0/429** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The held wing review of 9 October 2026 retains four small brass chandeliers (L63/L65/L67/L69), four F5 above-window wall fans (F240–F243, extended bracket proxy), and two entrance-facing wing wall speakers (S276/S278). Four light IDs, four appended fan IDs and S275/S277 are retired; sixteen F2 nave wall fans (eight per side, extended bracket proxy) remain shown/OFF. Four unpowered Peter/Paul pictures are decoration records with no electrical routes. Task lighting, airflow, noise, speech/feedback, glare, concealment, product and mounting holds remain; see [wing comparison](../engineering/wing-review.md). The seating-cache correction is independently verified, not design approval. The outlet and façade-statue issue of 9 October 2026 adds six socket-outlet points on P1–P4 (four indoor double outlets from DB-1, two lockable tower event points from DB-2, owned by distribution-controls), three façade statues as unpowered decoration records, and fifteen L10 lighting records for them (nine concealed light lines and six candle lights). Socket rated values are planning allowances per circuit, not equipment loads, and add nothing to the operating estimate while no test load is entered. The electrical walk-round review of 9 October 2026 moves the origin of the seven E1 exit-sign routes from LC-1 to DB-1, so that the signs do not depend on the lighting-control enclosure; the seven earlier route IDs are retired and the signs, their positions and their 15 W are unchanged. See the [safety and efficiency review](safety-efficiency-review.md). Supply, feeder, protection, accessories, slots and fixings remain held; see [outlets and façade statues](../engineering/outlets-and-facade-statues.md). Register refresh does not resolve performance failures. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

The 25 October [door-head/sign and sconce follow-up](../engineering/doorheads-and-sconces.md) retires fourteen nave wall sconces and their sixteen routes, while retaining all five E1 signs on DB-1 at 15 W. Sign cases sit below coloured glass on fixed door heads; leads follow jambs and headers. Original sign IDs, life-safety holds and retired-input records are preserved.


The 25 October [open-porch review](../engineering/open-porch-light-sound.md) replaces 18 hanging lanterns with wall path heads, adds 36 arch floods, replaces four A2 pendants with 18 wall fills, and lowers nave/entrance speaker references to 2.5 m. Existing IDs/circuits remain and 50 named equipment/drop IDs are added. Porch light, feedback, wing clarity, weather protection, product selection, fixings, physical controls and commissioning remain held. Earlier A3 electrical drawings remain stale.


- [Layout snapshot](equipment-layout.json), SHA-256: 7958b4809b6199a78823ea47abdd37329f78f9de03404b0f973483495d74be9e.
- [Electrical snapshot](electrical-systems.json), SHA-256: de942b6ea94208f140cd0ec1bb6d7282f467a001cb150dd4c584a870ba9c4c2b.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run `node scripts/build_equipment_register.mjs --verify-workflow` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.

## Lan can tháp theo DWG — đối chiếu ngày 26/10/2026

Hình học lan can mới có 17 ô thủng bậc mỗi mặt, thay con tiện cũ; không đổi thiết bị, ID, tuyến, hướng, công suất hoặc các sổ Excel theo danh mục. [ENG-041](../engineering/issues.md#lan-can-tháp-và-che-chùm-đèn-chỏm--eng-041) giữ việc phối hợp L164/L175: tia tim từ đầu đèn cố định đi qua ô giữa, nhưng 30/49 hướng thử trong nón hình học 36° gặp phần lan can. Đây là tập tia không có trọng số, **không phải tỷ lệ quang thông bị mất hoặc kết quả IES/LDT**. Phép tính lux hiện hành chưa tính che bởi tường/lan can tháp, nên không lấy các số đó làm nghiệm thu chỏm. Người thiết kế chiếu sáng/kiến trúc cần phối hợp tiết diện, quang học, gá, bảo trì và thử ban đêm; không tự dời đèn hoặc sửa số tính để che xung đột. Các tổng số điện và dữ liệu nhập có trước trong báo cáo được giữ nguyên.

## Trụ góc tháp theo E01B/E02 — 31/10/2026

Theo [ENG-043](../engineering/issues.md), các trụ góc tháp lấy đúng bề rộng và chiều sâu trên bản vẽ. Mười hai dây đèn lễ trên mặt trụ tầng 1–3 (L202–L207, L213–L218) dời theo, vẫn cách mặt trụ 60 mm. Không đổi ID, mạch, công suất hay chiều dài dây. Tổng chiều dài tuyến chiếu sáng tăng 1,840 m, từ 3 246,819 lên 3 248,659 m, vì tuyến tới các dây này theo mặt trụ mới. Bố trí đã lưu trong trình duyệt được chuyển một lần (`towerPierRevision`): chỉ dây còn ở chỗ đề xuất cũ mới dời theo.
