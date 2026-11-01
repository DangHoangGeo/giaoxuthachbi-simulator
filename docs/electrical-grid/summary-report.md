# Equipment quantities, usage and quality report

Generated 1 November 2026 from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Lighting | 276 | 276 | 0 | 276 | 250 | 299 | 2242 |
| Sound | 44 | 44 | 0 | 44 | 34 | 54 | 330 |
| Fans and ventilation | 45 | 45 | 0 | 45 | 27 | 58 | 410 |
| Exit signs | 5 | 5 | 0 | 5 | 5 | 7 | 68 |
| Decoration and furnishings | 37 | 22 | 15 | 0 | 22 | 0 | 0 |
| Distribution and controls | 12 | 12 | 0 | 6 | 4 | 15 | 109 |
| **Total** | 419 | 404 | 15 | 376 | 342 | 433 | 3159 |

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **37 equipment, 120 routes**.

## Usage and energy estimate

Saved scene: **Full service · evening**. Service duration **1.5 h**, **40 services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **available in the saved model**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
| Lighting | 4,120.8 | 6.181 | 247.25 | L1, L10, L2, L3, L4, L5, L6, L7, L8, L9, LA, LS |
| Sound | 193.4 | 0.290 | 11.60 | A1, A2, A3, A5, MIC |
| Fans and ventilation | 1,156.0 | 1.734 | 69.36 | F1, F2, F4, F5, V1, V2, V3 |
| Exit signs | 15.0 | 0.023 | 0.90 | E1 |
| Decoration and furnishings | 0.0 | 0.000 | 0.00 | DECOR, X1 |
| Distribution and controls | 0.0 | 0.000 | 0.00 | P1, P2, P3, P4 |
| **Total modeled usage** | **5,485.1** | **8.228** | **329.11** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
| Lighting | 3,285.223 | 3,285.223 | 0.000 | 0.000 |
| Sound | 765.922 | 0.000 | 2,362.560 | 566.077 |
| Fans and ventilation | 979.901 | 979.901 | 0.000 | 0.000 |
| Exit signs | 165.967 | 165.967 | 0.000 | 0.000 |
| Decoration and furnishings | 0.000 | 0.000 | 0.000 | 0.000 |
| Distribution and controls | 263.923 | 263.923 | 0.000 | 0.000 |
| **Total by length basis** | **5,460.937** | **4,695.014** | **2,362.560** | **566.077** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. 0/423 non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
| Lighting | 0/276 | 0/276 | 0/299 |
| Sound | 0/44 | 0/44 | 0/54 |
| Fans and ventilation | 0/45 | 0/45 | 0/58 |
| Exit signs | 0/5 | 0/5 | 0/7 |
| Decoration and furnishings | 0/37 | 0/0 | 0/0 |
| Distribution and controls | 0/12 | 0/6 | 0/15 |
| **Total** | **0/419** | **0/376** | **0/433** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The held wing review of 9 October 2026 retains four small brass chandeliers (L63/L65/L67/L69), four F5 above-window wall fans (F240–F243, extended bracket proxy), and two entrance-facing wing wall speakers (S276/S278). Four light IDs, four appended fan IDs and S275/S277 are retired; sixteen F2 nave wall fans (eight per side, extended bracket proxy) remain shown/OFF. Four unpowered Peter/Paul pictures are decoration records with no electrical routes. Task lighting, airflow, noise, speech/feedback, glare, concealment, product and mounting holds remain; see [wing comparison](../engineering/wing-review.md). The seating-cache correction is independently verified, not design approval. The outlet and façade-statue issue of 9 October 2026 adds six socket-outlet points on P1–P4 (four indoor double outlets from DB-1, two lockable tower event points from DB-2, owned by distribution-controls), three façade statues as unpowered decoration records, and fifteen L10 lighting records for them (nine concealed light lines and six candle lights). Socket rated values are planning allowances per circuit, not equipment loads, and add nothing to the operating estimate while no test load is entered. The electrical walk-round review of 9 October 2026 moves the origin of the seven E1 exit-sign routes from LC-1 to DB-1, so that the signs do not depend on the lighting-control enclosure; the seven earlier route IDs are retired and the signs, their positions and their 15 W are unchanged. See the [safety and efficiency review](safety-efficiency-review.md). Supply, feeder, protection, accessories, slots and fixings remain held; see [outlets and façade statues](../engineering/outlets-and-facade-statues.md). Register refresh does not resolve performance failures. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

The 25 October [door-head/sign and sconce follow-up](../engineering/doorheads-and-sconces.md) retires fourteen nave wall sconces and their sixteen routes, while retaining all five E1 signs on DB-1 at 15 W. Sign cases sit below coloured glass on fixed door heads; leads follow jambs and headers. Original sign IDs, life-safety holds and retired-input records are preserved.


The 25 October [open-porch review](../engineering/open-porch-light-sound.md) replaces 18 hanging lanterns with wall path heads, adds 36 arch floods, replaces four A2 pendants with 18 wall fills, and lowers nave/entrance speaker references to 2.5 m. Existing IDs/circuits remain and 50 named equipment/drop IDs are added. Porch light, feedback, wing clarity, weather protection, product selection, fixings, physical controls and commissioning remain held. Earlier A3 electrical drawings remain stale.


- [Layout snapshot](equipment-layout.json), SHA-256: 7ee13834bb3d8210ad07f356770ca8d2de3d727cbb28db523c532d7ab6a30636.
- [Electrical snapshot](electrical-systems.json), SHA-256: b17fa43381f4c5adf1ca27428454166d89dff26a780e0b6da8b55fa8d54dbe0e.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run `node scripts/build_equipment_register.mjs --verify-workflow` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.

## Lan can tháp theo DWG — đối chiếu ngày 26/10/2026

Hình học lan can mới có 17 ô thủng bậc mỗi mặt, thay con tiện cũ; không đổi thiết bị, ID, tuyến, hướng, công suất hoặc các sổ Excel theo danh mục. [ENG-041](../engineering/issues.md#lan-can-tháp-và-che-chùm-đèn-chỏm--eng-041) giữ việc phối hợp L164/L175: tia tim từ đầu đèn cố định đi qua ô giữa, nhưng 30/49 hướng thử trong nón hình học 36° gặp phần lan can. Đây là tập tia không có trọng số, **không phải tỷ lệ quang thông bị mất hoặc kết quả IES/LDT**. Phép tính lux hiện hành chưa tính che bởi tường/lan can tháp, nên không lấy các số đó làm nghiệm thu chỏm. Người thiết kế chiếu sáng/kiến trúc cần phối hợp tiết diện, quang học, gá, bảo trì và thử ban đêm; không tự dời đèn hoặc sửa số tính để che xung đột. Các tổng số điện và dữ liệu nhập có trước trong báo cáo được giữ nguyên.

## Trụ góc tháp theo E01B/E02 — 31/10/2026

Theo [ENG-043](../engineering/issues.md), các trụ góc tháp lấy đúng bề rộng và chiều sâu trên bản vẽ. Mười hai dây đèn lễ trên mặt trụ tầng 1–3 (L202–L207, L213–L218) dời theo, vẫn cách mặt trụ 60 mm. Không đổi ID, mạch, công suất hay chiều dài dây. Tổng chiều dài tuyến chiếu sáng tăng 1,840 m, từ 3 246,819 lên 3 248,659 m, vì tuyến tới các dây này theo mặt trụ mới. Bố trí đã lưu trong trình duyệt được chuyển một lần (`towerPierRevision`): chỉ dây còn ở chỗ đề xuất cũ mới dời theo.

## Trụ tầng trệt mặt tiền giữa — 31/10/2026

Hai trụ hai bên cửa chính được dựng lại theo E01B/P05: cùng tim với trụ tầng trên (±2,979 m) và chân bệ bậc như trụ tháp. Hai đèn lồng cửa chính L137/L138 dời 0,10 m về phía cửa (|Z| 2,40 → 2,30 m), để khỏi chạm trụ mới. Không đổi ID, mạch hay công suất. Bố trí đã lưu được chuyển một lần, cùng revision `towerPierRevision` (`2026-10-31-tower-pier-depth-2`).

## Đèn gian giữa và đèn cánh ngang — 01/11/2026

Theo yêu cầu của chủ đầu tư: (1) phần giữa nhà thờ hơi tối vì các đèn đọc sách trên xà ngang đặt sát nhau gần Z ±2,6 m; (2) hai cánh toà thánh dùng đèn chiếu từ trên xuống thay vì hai đèn chùm mỗi bên. 28 đèn đọc sách trên xà (L3–L30) giữ nguyên ID, mạch (L1/L2) và 2 300 lm, nhưng dời sang Z ±0,90 m (đèn hướng về toà thánh, quang học 36°) và ±2,48 m (đèn hướng ra cửa, 28°). Bốn đèn chùm L63/L65/L67/L69 được cho nghỉ (ID không dùng lại) và thay bằng tám đèn chiếu xuống `L-WING-{B,H}-{F,R}{I,O}` trên mạch L8: 2 100 lm, 17,5 W, 24°, gắn sát gỗ mái cánh ngang, cùng màu sơn gỗ. Kết quả mô phỏng: lối giữa nhà thờ từ khoảng 62 lên 208–299 lux; ghế khối giữa trung bình 285 lux (nhỏ nhất 208); ghế cánh ngang trung bình 260 lux (nhỏ nhất 226, trước đó 97); mọi ghế đạt 200 lux (trước đó 87,5 %). Công suất L8 140 W (trước 204 W). Đây là số ước tính từ mô phỏng, chưa có số liệu IES/LDT, chói, nhấp nháy hay chi tiết gá vào gỗ mái (ENGINEERING HOLD). Chi tiết: [lighting.md](../systems/lighting.md#nave-centre-and-wing-lighting--1-november-2026). Bố trí đã lưu được chuyển một lần (`naveWingLightingRevision`, `2026-11-01-nave-wing-lighting-1`); đèn người dùng đã dời, chỉnh hướng hoặc xoá được giữ nguyên. Báo cáo tải cáp và ngân sách chưa tạo lại trong lần này.

## Cửa chính trên trục 2 — 01/11/2026

Theo ý chủ đầu tư ngày 01/11/2026 (và cha xứ ngày 25/10/2026), tường cửa chính nằm trên trục 2 (X 5,035–5,475; [facade-model.md](../facade-model.md)). Các thiết bị gắn mặt trong tường cửa dời theo tường: hai đèn đọc hàng ghế cuối, hai đèn giữa hàng cuối, biển thoát hiểm cửa chính (L155), hai quạt đối lưu lối vào (F250/F251) và hai loa tường sảnh (S273/S274). Hai đèn giữa hàng cuối hạ từ +5,95 xuống +3,90 m và chiếu vào giữa hai hàng ghế cuối (8,6; 0,8; ±2,0) để không chiếu xuyên cánh quạt ô 2′–3 và giữ hàng ghế X 11,05 trên 200 lux. Không đổi ID, mạch, công suất hay chế độ. Riêng thay đổi này làm tổng chiều dài tuyến tăng khoảng 38,8 m (đo trên nhánh trước khi gộp với phần đèn gian giữa và cánh ngang: 5 406,021 → 5 444,804 m), vì các tuyến đi tới tường mới. Bố trí đã lưu trong trình duyệt chuyển một lần qua bảng họp giáo xứ (bản 7).
