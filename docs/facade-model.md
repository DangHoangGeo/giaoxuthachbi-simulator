# Central facade between the towers

> **Entrance equipment follow-up, 1 November 2026:** The main exit sign is now on the nave side of the X 5.475 m inner wall face, with a conceptual clip back to the fixed transom. Entrance reading lights and loudspeakers use the inside wall; a backed-up scoped saved-layout migration repairs known obsolete wall positions while preserving independent edits. The rearmost pew row and the two entrance palms are removed. Clip, visibility, door clearance, emergency power and electrical containment remain ENGINEERING HOLD.

**Revision 24 October 2026 (`2026-10-24-cad-facade-1`).** Above the ground-storey cornice, the central facade between the twin towers now follows the church's CAD file of 23 October 2026. The owner directed on 24 October 2026 that this branch follows that file. The owner confirmed this DWG as the project design basis on 26 October 2026; designer-issued construction coordination remains held in ISSUE-R01 and ISSUE-R02 in the [dimension register](layout_design/Thach_Bi_Church_Dimensions.xlsx). **Not for construction.**

## Kiểm tra ngoại thất ngày 26/10/2026

Lượt [đối chiếu phiên bản 23102026](exterior-23102026/README.md) sửa các mặt cửa tháp, đường chỏm/đèn lồng, vòng hoa hồng, phào/vòm đầu hồi và cửa sổ theo đối tượng CAD có handle. Phần kéo dài mặt tiền D01 đến |Z|7,500 m được bỏ, trở về |Z|7,128 m; trụ tháp hiện có phủ mối nối. Các phần dưới ghi lịch sử lượt dựng ngày 24–25/10; mốc chính xác và những phần còn giữ chờ của mô hình hiện hành nằm trong hồ sơ mới. Đơn vị ISSUE-R06, hướng gương ENG-027 và xung đột dải cửa/biển thoát hiểm ENG-039 và nhận dạng ET/hoa hồng mặt sau tháp ENG-040 vẫn mở. Cả 18 mặt bên/trong/sau tầng trên cũ đã được thay; mặt ngoài theo E02, mặt trong/sau lặp DERIVED chờ xác nhận. [Lan can tháp](exterior-23102026/tower-balcony.md) đã đổi sang 17 ô bậc/mặt; ENG-041 ghi chiều sâu/tiết diện và che chùm đèn chỏm.

## What changed

| | Before (PDF sheet 1, traced in the bundle) | Now (CAD file, DWG sheet 1, drawing E01B) |
| --- | --- | --- |
| Above the doors | Broad entablature +9.4 to +11.0, open screen | Full upper storey to +15.840 between the towers |
| Central bay | Pinnacled gable with a niche, cross top +21.72 | Great arch (r 2.27 about +12.677) over a triple window with louvred lights and a rose; above +15.840 an aedicule with an arched niche on a pedestal, a raked pediment, a cross on a disc to **+24.648** |
| Side bays | Pinnacled gables with niches, finials +16.45 | Great arch (r 1.936 about +12.960) framing an aedicule with an arched niche on a pedestal (+10.391); fleur-de-lis cresting on a balustrade over the +15.840 entablature |
| Piers between the bays | Detached ornamental piers | Fluted pilasters with foliate capitals up to the entablature, and pinnacles with fleur-de-lis finials to +20.55 |
| Depth | One plane, schematic | Stepped faces from the tower-end plans at +10.128 and +15.840 m: piers X 2.30, central wall X 2.94, side walls X 4.02, aedicule X 3.81–3.92, all behind the entrance front (X 2.43 at ground) |

Kept unchanged below +8.45 m, where the CAD file agrees with the traced elevation: the three arched doors, their fanlights, the ground-storey piers and the side-bay cornice. Since 2 November 2026 the spandrel carving over the three ground arches is the traced T12 leaf at its E01B positions ([spandrel review](exterior-23102026/tower-spandrel-review.md#further-placements--2-november-2026)), replacing the bundle's flat sprays. The towers are not part of this change.

The overlay of the DWG linework on a straight-on render of the model matches within a few centimetres at every arch, cornice and pier ([evidence](#evidence)).

## Sources and how the numbers are held

- **Elevation:** DWG sheet 1, drawing E01B (variant B, full elevation). Model axes: Z = −(x − 1,666,600.3), Y = y + 515,946.8 (DWG mm), as in [`sheets.json`](layout_design/dwg-2026-10-23/sheets.json).
- **Depths:** tower-end plans at +10.128 m (PT10) and +15.840 m (PT15). They have no model origin. Axis 1 and the D/E midpoint are read from their drawn centrelines (`PLAN_AXES` in `scripts/extract_dwg_revision.py`).
- **Facade table:** [`facade.csv`](layout_design/dwg-2026-10-23/facade.csv) lists 35 traced values: levels, arc centres and radii, faces, the 621 / 5,958.8 / 621 pier chain and, since 31 October 2026, the tower front column bases (F33–F35). `python3 scripts/extract_dwg_revision.py facade` finds every one of them in the DWG geometry within 1.5 mm. The same table is on the workbook sheet *DWG facade*. Three further rows record where the model departs from the drawing or adds to it (D01–D03).
- **Model:** `Thach_Bi_Viewer/facade.js` (`CHURCH_FACADE.spec` holds the values). It runs inside `realism.prepare`, before the plaster maps are projected. It removes the bundle's facade parts that lie wholly above +8.45 m, and the central cornice, then builds the new storey from boxes, extruded arch outlines and the shared `carving.js` generators.

## Status of each part

| Part | Status |
| --- | --- |
| Levels, arch centres and radii, widths, faces in plan | `DRAWING SHOWN`, traced (facade.csv F01–F35) |
| Moulding profiles, relief depths, capitals, cresting, carved crests, fleurs-de-lis | Illustrative shapes following the drawn outlines (`TRACED CAD ELEVATION / ILLUSTRATIVE CARVING`) |
| Side bays end at ±7.128 m (corrected 26 October 2026) | Former D01 extension to ±7.5 removed; the rebuilt tower inner rear pier begins at ±7.103, giving 25 mm model overlap. |
| Ground-storey central piers (owner review 31 October 2026) | Rebuilt on the axis of the upper piers (±2.979): E01B shaft Z ±2.489–3.469 with three flutes, P05 front X 1.561 (wall 2.225), and a stepped pedestal to +1.848 with the tower piers' projections; only its four lowest band levels differ (0.18 / 0.24 / 0.348 / 0.408). A rosette panel sits on the die (+0.54–0.90). The cornice-level frieze block and capital now break forward with the pier. The bundle's 0.44 m pilasters at ±3.6 are removed. The main-door lanterns L137/L138 move from \|Z\| 2.40 to 2.30 m to clear the piers. The pedestal profile is illustrative; the cyma mouldings are one mean step. The pilasters at ±7.1–7.6 beside the towers are kept but not checked. |
| Room behind the triple window (X 3.67–4.72) | Shown in plan; the model draws a dark closed backing behind the louvres, not the room |
| Statues in the three niches | The drawing shows empty niches with pedestals. The owner's statues (9 October 2026) stand on the drawn pedestals (D03). |
| Structure, materials, fixings, drainage of the terraces at +9.741 and +15.840, access for maintenance | Not designed: `ENGINEERING HOLD` |

## Entrance on the axis-2 line and the front steps · 1 November 2026

**2 November 2026 follow-up:** The broad forecourt stair now returns along both sides, and an H-side ramp footprint is shown as a partial concept. The owner subsequently requested a compact switchback ending at the tower rear and an outside handrail only; the concept reaches the forecourt from the lower courtyard but does not provide a continuous accessible route into the church; the inferred 160 mm risers and existing 230 mm entrance treads require accessibility review. See [entrance approach](exterior-23102026/entrance-approach.md).

The owner's review of 1 November 2026: the main door belongs to the body of the church, on the axis-2 line, not between axes 1 and 2; and between the towers the pier bases stood clear of the steps below them. This also completes the parish priest's wish of 25 October 2026 (doors on the towers' rear pier line).

| Part | Before | Now | Source in the CAD file (model metres) |
| --- | --- | --- | --- |
| Door wall | doors in the front arches at X ≈ 2.5 | a wall at **X 5.035–5.475** up to the hall ceiling (+8.39), with the three doorways; leaves, fanlights and transoms moved back 2.63 m; the front arches are an open entrance porch | Plan P05: jamb faces D7BF88/D7C117 at X 5.035, rebates to 5.145, inner face D7BF80/D7C10F on axis 2′ (5.475) |
| Main doorway | Z ±1.55 | Z ±1.55, as drawn | P05 D7BF85/D7C114 |
| Side doorways | \|Z\| 4.41–6.55 | **\|Z\| 4.275–6.415** (leaves, fanlights and transoms shifted 0.135 m toward the axis; 2.14 m wide) | P05: \|Z\| 4.275–6.425 |
| Entrance steps | four 0.12 m risers from X 0.99 | **three 0.16 m risers at X 1.321, 1.551, 1.781**, from the −0.48 forecourt to ±0 | Section A-A D7E712–D7E716 |
| Central pier bases | stood at ±0 over the lower treads, with a gap beneath | a plinth course under each pedestal down to the −0.48 forecourt | Section A-A D7E717–D7E71B: the base runs down through the steps |
| Tower front plinth | 0.22 m ledge in front of the corner piers (front X −1.2) | front face flush with the corner-pier plinth (X −0.984), so the pier bases run straight down to −0.48 | Elevation E01B: pier bases continue below ±0 to the forecourt |

Coordinated: walking heights (`realism.js`: the steps and the door wall, passage through the doorways only), the simulator's entrance wall and interior boundary (`engine.js`), and the fittings on the inner face of the entrance wall (exit sign, entrance circulators and speakers; the four rear reading lights were subsequently moved to the side walls on 2 November 2026), which move with the wall in `design.js`; saved layouts move them once through the parish-meeting table (revision 7). Not for construction: door, wall and step construction, thresholds, drainage and accessible entry remain open; the subsequent H-side concept and its incomplete church-floor connection are described above.

## Coordinated changes

- **Statues and their lights** (simulator, circuit L10): the three statues, six hidden jamb lines, three hidden arch lines and six candles moved back and up with their niches. The side niches have their pedestal tops at +10.391 m, statues at X 4.15, Z ±5.35. The central niche has its pedestal top at +16.683 m, statue at X 4.08. The central pedestal is narrower than the old one, so its candles moved from beside the feet to the front corners. The positions are in `facadeNiches` in `simulator/design.js`. See [outlets and façade statues](engineering/outlets-and-facade-statues.md).
- **Upper façade washes** (`Central crown wash · B/H`, L6): re-aimed at the aedicule face (target X 3.85, Y 19.6, Z 0, was X 2.2, Y 18.6). The lower pair (`Central gable flood`) keeps its aim on the upper storey and keeps its name.
- **Saved layouts** migrate once (`facadeCadRevision`, backup `.before-cad-facade`). A fitting still at its previous recommended place and aim moves; one the user moved or re-aimed stays, and a deleted one stays deleted.
- **Interior/exterior test:** the simulator and the electrical safety review now count the space above the entrance hall (+8.39 m) in front of the nave gable (X < 5.17) as outside. The niche fittings stand there, and they are open to the weather.
- **Electrical:** the L10 runs are longer (the niches are higher and further back). Exports, the six category registers, the summary and the safety review were regenerated from the model.
- **Film:** the five-minute film's facade shots keep their camera path. The caption ("three doors, with Our Lady of the Assumption between them") still holds. The facade itself looks different in those shots.

## Towers, 25 October 2026

At the owner's direction after the parish priest's meeting (point 5: closed tower fronts with a decorative arch; base, top and ornament as in the new drawings), `Thach_Bi_Viewer/towers.js` rebuilds both towers' ground storey, adds the corner piers of every stage and replaces the tops, from E01B traced in model axes and plan sheet 5:

| Part | CAD (H tower, model Z) | Model |
| --- | --- | --- |
| Corner piers, stage 1 | Z 7.0–8.2 and 12.1–13.4; pedestals to +1.85; fluted shafts to +7.4; foliate capital band to +7.85; cornice to +8.39 | t = ±1.95 to ±3.2 from the tower centre (Z 10.153), X −0.72 to 1.0 (front) and 3.9 to 5.1 (back), with plinth, pedestal die and cap, three flutes on each exposed face |
| Closed front | Archivolt springing +4.0, radius 1.95; inner blind arch on colonnettes springing +2.85, radius 0.8–1.15; cartouche; spandrel sprays | As drawn; the inner arch is a 0.2 m blind recess, the wall behind it is closed |
| Entablature | Architrave, dentils +7.15–7.35, Greek-key frieze +7.42–7.78, cornice +7.85–8.39 | As drawn; between the piers the cornice keeps the old 0.38 m lip so the tower floods stand where they were |
| Upper stages | Corner piers ±1.8–3.05 (stages 2, 3), ±1.75–2.6 (belfry), pedestal blocks, capital bands, dentilled cornices | Same, 0.45 m in front of and behind the model's stage walls |
| Dome | Ribbed dome +30.05 to +32.75, half-width 1.7, rosette at +31.8 | Lathe profile on the CAD outline, eight ribs, four rosettes |
| Lantern and cross | Plinth +32.75–33.05, lantern +33.05–33.95, open acanthus crown to +35.0, ball, trefoil cross to +36.92 | As drawn; the crown's leaves are illustrative carving |
| Corner pinnacles | Fleur-de-lis pinnacles on the balustrade corners to about +31.6 | The shared E01B pinnacle crown (since 2 Nov 2026; crocketed pinnacles before), scaled to the native base and apex on the existing corner pedestals |

**Departure kept on purpose:** plan sheet 5 draws the stage-1 front wall about 0.5 m further forward than the model's (X −0.5 against X 0). The model keeps its wall plane, so the stages above and the fittings on the +8.39 m cornice keep their places; the piers and entablature project in front of it as drawn. Each tower now has a door from the rear corner of the nave (inner side, X 3.4–4.4 m, 2.3 m high) into its ground-floor room; the walking map blocks the old passage. The old onion cap, cone, urns and cap rosettes are removed. Since the owner's review of 25 October 2026 the grey stone plinth under each tower is widened (X −1.2 to 5.4 m, |Z| 6.75 to 13.62 m, from the courtyard at −2.08 m to +0.00) so the corner piers no longer overhang it; before, the front piers stood 0.48 m above the forecourt paving with a gap beneath. The festival strands on the tower corners move onto the pier fronts. An overlay of E01B on the model after the change is kept, uncommitted, as `layout_design/dwg-2026-10-23/images/05-facade-check/E01B-overlay_towers-after_2026-10-25.png`. Structure, reinforcement and the real pier sections remain on engineering hold.

## Roofline, 25 October 2026

The parish priest asked that the roof and its heights follow the new drawings (point 4); the owner then directed the side elevation. The roof planes already matched sections 24/25 (ridge +12.472, main eaves +7.13, porch eaves +6.325) and are unchanged. `Thach_Bi_Viewer/roofline.js` adds what the elevations draw on the roofline:

- **Porch parapets (E02):** a balustrade +6.35 to +7.05 on the porch cornice of both runs (2′–9, 10–12), with a pedestal and a fleur-de-lis pinnacle to +8.0 on every axis. It replaces the small eave crest and hides most of the tiled porch roof from below.
- **9–10 side gables (E02):** wall raised to the CAD silhouette; outer piers with pinnacles to +10.75; inner piers with pinnacles to +12.9; stepped raking cornices with Greek key, dentils and leaf crest; a rose at +7.55; a crowning niche aedicule with volutes, ball and trefoil cross to +15.2. The old schematic gable is removed.
- **Rear gable on axis 12 (E03):** gable wall raised to the CAD silhouette; corner, C/G and D/E piers with pinnacles (+10.2, +11.5, +14.65); crested parapets over the porch ends; a band between the D/E piers at +7.6 to +8.55; lower and upper raking cornices with leaf crests; a rose at +10.0; a crowning aedicule with its cross at +17.829. The ground storey of the end wall is kept.

The festival strands on the porch eaves move to the cornice lip in front of the balustrade, and the rear-gable strand follows the new lower rake. Overlay of E03 on the model: `layout_design/dwg-2026-10-23/images/05-facade-check/E03-overlay_rear-gable-after_2026-10-25.png` (uncommitted). ISSUE-R05 (ridge label +12.472 against the drawn +12.396) stays open; the model keeps +12.472.

## Open questions

- **ISSUE-R01 / ISSUE-R02** (designer): the owner selected the DWG project basis on 26 October 2026; a coordinated construction issue is still required.
- **Front-gable exhaust fans, ENG-036** (mechanical engineer): the four V1 exhaust fans (F252–F255, +9.1 to +9.7 m) discharge through the nave gable on axis 2′. The CAD upper storey now stands 0.1–0.2 m in front of that gable, so the fans blow into a narrow slot. The calculation does not model this obstruction. The designer must route the discharge, for example into the room behind the triple window and out through its louvres, or move the fans. See [engineering issues](engineering/issues.md).
- **Statue size in the central niche:** the Assumption (1.42 m across the raised hands) just fits the 1.422 m niche. A real figure must be sized to the niche, or the niche to the figure (sculptor, architect).
- **Simulator occlusion:** the analysis geometry has no facade or tower walls, so exterior façade lights reach the front seats in the calculation (on average 0.6 lux, at most 3.8 lux). This limitation existed before this change (ENG-008).

## Evidence

Checks run for this revision: `verify_model.cjs` (new facade assertions: levels, faces, arcs, the pier chain, cross top, nothing of the traced gables left above the cut, the parts stay between the towers, triangle budget), `verify_simulator.cjs --report --estimates` (statue niches, the migration test, facade light coverage sampled on the new faces), `--electrical --export-electrical`, the register workflow, the safety review, `verify_construction.cjs`, `verify_cinematic.cjs`, and the `facade` check of the extraction script. A desktop browser check covered day, evening and visit-only mode.

Overlay pictures of the DWG on the model are kept with the CAD images in the ignored folder `layout_design/dwg-2026-10-23/images/05-facade-check/`, because they reproduce the designers' drawing (publication hold H1).

## Ground-storey entablature between the towers · 2 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.** Owner request: the centre part should follow the drawing as the towers already do.

- **Side bays (E01B C45C07–C45C3F).** The drawing continues the tower-base entablature across both side bays at the tower's levels: dentils +7.163 to +7.363 (0.0663 m wide, 0.1326 m pitch, the same as the tower front), Greek key +7.563 to +7.755, and a cornice up to +8.39. The bundle's corbel cornice (`Corbel capital`, `Tapered cornice corbel`, `Corbel drop`, `Cornice dentil`) is removed there. It is replaced by `Side bay architrave / dentil / frieze / Greek-key frieze / cornice`, using `towers.js` `spec.entablature` levels, projections and `meanderGeo`, between the central ground piers (|Z| 3.469) and the tower piers (6.988). The wall face X 1.975 is **DERIVED** from the bundle.
- **Centre bay.** It now has a bed moulding at +8.157–8.207 (C4508A/C4508B, previously missing). Dentils are 0.20 m tall at +8.405 to +8.605 (were 0.10 m at +8.42 to +8.52), on the drawn 0.1326 m pitch. The Greek key sits at +8.833 to +9.025 inside the +8.773–9.073 frieze (was the full frieze height) and uses the towers' `meanderGeo`. The separate fillet is dropped because the dentils now reach the corona. Depths are unchanged.
- **Gaps closed (owner review of the same day).** Over each central ground pier the corona (+8.605–8.773) and crown band (+9.073–9.115) now break forward with the pier (`Central pier corona break`, `Central pier crown band break`). E01B draws their lines across the pier, and before this they stopped at X 2.06, leaving recessed slots above and below the foliate capital. Between each side bay's end (|Z| 7.128, where E01B ends it) and the tower's inner wall (7.563), an open 0.39 × 0.44 m slot in front of the tower's stage-2 rear pier is closed from +9.741 to +15.84 (`Tower inner infill beside the central facade`, in `towers.js`). Its depth is **DERIVED**, and its face sits 63 mm behind the bay face to clear the tower's inner window surround.
- **Unchanged and open.** The festival light string on the front terrace (L219, X 2.115–2.185, Y 8.45–8.49) crossed the taller centre dentils; it was later retired on the owner's request (see below). Moulding profiles, the key pattern's proportions, relief and fixings remain illustrative. The +8.39 junction with the upper terrace is as before.

**Checks:** `verify_model.cjs` (façade guard 182,752 < 200,000), `verify_construction.cjs`, `verify_simulator.cjs --report --estimates`, web `check:viewer`; desktop day views captured headless (front, side bay, centre close-up). Exports in `output/pdf*` are stale for the front.

### Festival string removed · 2 November 2026

At the owner's request the festival bulb string across the front terrace between the towers (**L219**, circuit L7, 14.8 m at +8.5 m) is retired. It ran 15 mm in front of the traced central dentil course and cut across it. The ID is never reassigned, and `recommended()` keeps its slot so later IDs keep their numbers. Saved layouts drop it once (`festivalTerraceRevision`), only if it is still the untouched default; a moved or retuned string is kept. The electrical exports, the six category registers, the summary report and the electrical safety review were regenerated from the same model: lighting has 289 items and 314 routes, 389 connected components. Feast-day lighting of the central front now relies on the remaining L7 tower-corner strands and the L6 central floods; no replacement is proposed.

### Centre cornice profile matched to the side bays · 2 November 2026

The owner asked that the cornice above the centre door read like the side bays and towers (E01B: dentil course, a pair of fillets, then the Greek key). The former 0.54 m deep corona between the dentils and the key is replaced by the drawn fillets at +8.605–8.653, +8.653–8.725 and +8.725–8.773. The profile now follows the towers' and side bays' relation to a frieze face at X 2.19: bed moulding to X 2.13, dentils 0.16 m proud (X 2.13–2.29), and the frieze and key on X 2.19. The Greek key fills the +8.773–9.073 frieze, as the towers' and side bays' keys fill theirs. E01B draws a 0.192 m key band (+8.833–9.025, kept as `spec.cornice.key`), but the shared `meanderGeo` uses fixed 35 mm bars and does not read at that height. This proportion is a display choice, not a source dimension. The pier breaks are unchanged.

### Upper aedicule piers and the shared pinnacle crown · 2 November 2026

The owner marked the upper central aedicule (E01B, +15.84 to the cross) as not matching the drawing. Compared with the DXF:

- **Pinnacle tops.** E01B draws each aedicule pier pinnacle as a gablet (half-width 0.289, 0.213 high) carrying two colonnettes (C4A086–C4A092, C49F98–C4A054). Each colonnette carries a small fleur, and a tapered spire between them carries a cap and the big fleur, 1.68 m in all. The lower central pier pinnacles repeat the same crown 2.066 m lower (C4A330–C4A344). The model had a flat cap on the colonnettes, a fleur on it and, on the lower piers, a metal rod. These are replaced by `pinnacleCrown()` in `exterior-ornament.js`, which follows the drawn offsets. In 3D the crown has a square core with a colonnette on each corner; E01B shows only the front pair. At the owner's direction, the spire runs from the core top to the cap as one piece, and a turned neck carries the fleur. The drawn inner gablet sits inside the spire. Owner, 2 Nov 2026: the same crown tops every pier pinnacle around the church. It is scaled uniformly to each envelope: tower corner pinnacles (native base and apex), wing and rear gable piers, aedicules, and porch parapet pedestals. The crown's gablet base stays on the model's existing pinnacle levels (+18.85 lower, +21.05 aedicule). Those are about 0.06–0.075 m below the E01B bases, because the lower tiers are unchanged.
- **Flutes.** The three flutes on the aedicule piers and the front pier pinnacles were dark painted stripes. They are now cut through a raised field as drawn: r 25 mm, 110 mm apart, with round ends. On the aedicule piers the field is ±0.2225 and +16.50–20.273, with flutes +16.60–20.173. On the pinnacles the field is ±0.235 and +16.05–17.168, with flutes +16.12–17.068. The field depth (30 mm) is DERIVED. The other piers followed the same day (next section).
- **Capitals.** The aedicule pier capital foliage is traced from E01B (C49F71–C4A15A, 181 rows, without the necking lines and abacus edge) in `facade-crest-profile.js` as `pierCapital`. It is drawn with the T12 contour tube on a bell and abacus, and lowered 0.04 m to sit under the model's abacus at +20.65. The outline is mirror-symmetric, so one profile serves both piers. Relief depth is a CONCEPT. `scripts/verify_facade_crest_source.py` checks the rows against the DXF.
- **Not changed.** The niche columns keep their round carved capitals, because the drawn capital is a flat outline of a round column. The concave base under the cross ball is still a pyramid.

The façade triangle budget in `verify_model.cjs` rises from 200k to 230k: the traced capitals take about 11k triangles each, and each crown about 2.2k. The crown family adds about 120k triangles across the whole church (porch parapets 49k, gables 45k, tower corners 18k, façade 13k).

### Fluted field on every pier · 2 November 2026

At the owner's request, the remaining painted-stripe flutes are replaced by the same cut flutes. E01B draws every fluted pier the same way: three round-ended flutes, r 25 mm and 110 mm apart, inside a field outlined by vertical lines. Its flute-end arcs and field lines give each set:

| Piers | Flutes (end centres) | Field half-width |
| --- | --- | --- |
| Central ground piers ±2.979 | +1.973 to +8.480 | 0.27 |
| Central bay piers ±2.979 | +10.526 to +14.768 | 0.235 |
| Upper pier pinnacles ±2.979 | +16.145 to +17.043 | 0.235 |
| Aedicule piers ±1.662 | +16.625 to +20.148 | 0.223 |
| Tower corner piers, ground | +1.973 to +7.238 | 0.275 |
| Tower corner piers, stage 1 | +9.175 to +14.768 | 0.235 |
| Tower corner piers, stage 2 | +16.625 to +22.098 | 0.225 |
| Tower corner piers, stage 3 | +23.925 to +28.288 | 0.2245 |

`flutedField()` in `exterior-ornament.js` builds the field and its groove beds. `towers.spec.flutes` holds the tower values. In the model the field stands 30 mm proud (DERIVED) and runs 0.1 m beyond the flute ends, clamped to the shaft. Two things are DERIVED rather than drawn:

- **Tower side faces.** E02 shows no flute ends, so the tower piers repeat the front set on their side faces.
- **Gable piers.** EW and E03 draw no flutes on the wing and rear gable piers. At the owner's direction ("all piers") they get the same field, narrowed to the pier. The owner confirmed on 3 November 2026 that they stay: USER CONFIRMED, not DRAWING SHOWN.

The flute positions follow the model's pier centres, so they inherit the existing tower-pier offsets from the drawing.

## Central front decoration traced from E01B · 3 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.** Owner direction: keep improving the decoration of the central front so that it follows the CAD design. The model was compared with E01B in full view and close up. The procedural carving that still stood in for drawn ornament is replaced as follows. Traced outlines are in `Thach_Bi_Viewer/detail-front-profile.js` (`window.CHURCH_DETAIL_PROFILE_FRONT`, E01B: u = (1666600.3 − x)/1000 less the origin given, v = world Y, handedness −1). They are drawn with the shared contour tube `towerSpandrel()`, placed just in front of their face. `scripts/verify_detail_front_source.py` checks every row against the DXF, and every row matches within 1e-6. `DWG_SOURCE_DIR` points it at another checkout's ignored source folder.

| Element | Source (E01B handles) | Model | Status |
| --- | --- | --- | --- |
| Rose tracery in the tympanum (Ø 0.8 m, centre +13.709) | `rose`: C49977–C49A3E, 200 rows (twelve interlaced foils, hub, twelve spokes and ties), inside the ring circles C49973–C49976 | 12 mm tube, 6 sides, on the rose disc. The disc now takes the wall finish so that the trim tracery reads against it. It replaces the procedural `K.bloom`. | Outline DRAWN; relief, disc finish and whether the field is pierced or blind are CONCEPT |
| Central bay pier capitals (±2.979, +15.035 to +15.333) | `bayCapital`: C49000–C490C1, 194 arcs (necking, abacus and entablature step lines dropped), u from Z 2.979 | 10 mm light tube on a plain bell (±0.51) that runs up to the entablature. The procedural `pilasterCapital` foliage and the separate abacus block are removed. | Outline DRAWN; bell depth DERIVED; relief CONCEPT |
| Ground central pier capitals (±2.979, +8.774 to +9.07) | `groundCapital`: C4586D–C45929, 161 arcs, u from Z 2.979 | Same treatment, with the bell widened to ±0.55 to carry the drawn ±0.56 foliage under the crown-band break | Outline DRAWN; relief CONCEPT |
| Ground pier pedestal rosette (centre +0.72) | `pedestalRosette`: C44804–C4481C, 25 arcs (quatrefoil and boss) | 6 mm light tube in the existing panel frames; replaces `K.bloom` | Outline DRAWN; relief CONCEPT |
| Cross pedestal rosette (centre +21.787, 0.61 m wide) | `crossRosette`: C49E85–C49EB0, 43 arcs | 10 mm tube on the pedestal die (X 3.95); replaces the bloom and two leaves | Outline DRAWN; relief CONCEPT |
| Concave foot under the disc (+22.364 to +22.734) | C49E27–C49E2A: outer arcs centre ±0.4407, +22.5728, r 0.2583 (±0.289 at the base to ±0.182); inner arcs 62 mm inside; blocks C49E0B–C49E26 at +22.572 / 22.606 / 22.653 / 22.693 / 22.734 (±0.197, 0.224, 0.183, 0.157); gablet lines C49E04–C49E0A | A faceted concave foot on a square plan with 62 mm corner chamfers, four chamfered blocks, and a gablet on each face (outer rake extended to ±0.213 at the base, inner triangle raised 15 mm). It replaces the pyramid and the turned neck. | Elevation DRAWN; square plan, chamfer reading and gablet depth DERIVED |
| Triple-window supports | C4989A/C4989C/C49854/C49852 (centre pair, shaft ±0.165 about ±0.595 with three 0.11 m faces), C49898/C498AB/C498A9 (outer pair, ±0.11 about ±1.73), bands C49858–C498B0 at +11.781–11.851, caps +12.101–12.171 (±0.195 / 0.14) and +12.171–12.241 (±0.245 / 0.18), from C49855 onward | Square pilasters with a band and a two-step plain cap, as drawn. They replace the round colonnettes, which had carved capitals (18k triangles). The middle face of the centre pilasters stands 30 mm forward. | Elevation DRAWN; 0.10 m projection DERIVED (the old colonnettes' depth); middle-face projection CONCEPT |

**Not changed and still open:**

- **Cresting over the side bays.** Rebuilt in a second commit the same day (next section).
- **Ball.** E01B draws the ball as a disc with a rim (r 0.2134 and an inner circle r 0.183). The model keeps a sphere.
- **Other carving.** The side-niche and central-niche round column capitals stay procedural (see 2 November). The pedestal panel's three nested frames are still two square frames.
- **Statues, glass art, lighting and equipment.** These are untouched. No equipment clash was found: the new pilasters occupy the old colonnettes' envelope.

**Checks:** `verify_model.cjs` (façade 227,244 triangles < 230,000; the budget is unchanged because the removed colonnette capitals offset the traces), `verify_construction.cjs`, `verify_simulator.cjs --report --estimates` (exit 0; known unmet targets remain), `verify_detail_front_source.py`, `git diff --check`. Desktop day views were captured headless: whole front, rose, both capital types, pedestal rosette, triple window, and the cross top front and oblique. Exports in `output/pdf*` are stale for the front.

### Side-bay cresting rebuilt from E01B · 3 November 2026

The cresting over the side bays had its rhythm reversed against the drawing. The model had tall blocks with big fleurs on the post positions and turned balusters with small fleurs between them. E01B (H side, C4AFC6–C4B1C9 and the post lines about Z 4.405 and 4.716) draws the following:

- **Narrow posts** on the `spec.crest.posts` positions: shaft ±0.0685, a ring at +16.165–16.195, and a stepped cap to +16.383 (±0.083 / 0.10 / 0.116 / 0.132). Each carries the **big fleur** on a plinth and collar (+16.98–17.10), up to about +17.41.
- **Wide posts** midway between them: shaft ±0.085, rings at +16.385–16.42 and +16.515–16.54, and a cap to +16.66 (±0.13 / 0.145 / 0.166). Each carries an urn and the **small fleur** (+16.79 to about +17.09).
- **Curved ribs.** Lower ribs spring from each narrow cap out to the wide caps, and upper ribs run from the wide posts up to the big fleur's base. Together they leave a pointed opening over every narrow post. The model closes the 12 traced rib arcs (`crestRib` in `detail-front-profile.js`, u from Z 4.40455, C4B19B/C4B19D/C4B19C/C4B1C3/C4B1C2/C4B155 and their mirrors C4B1C5/C4B1C7/C4B1C6/C4B1C9/C4B1C8/C4B1C4) into two plates, extrudes them 0.12 m, and repeats them on every narrow post on both sides.

Status: the levels, widths and rib outlines are DRAWN. The square plan of the posts, the rib thickness and the urn profile are DERIVED. The fleurs keep the shared carved `fleur()` shape, scaled to the drawn height and width, and their ornate drawn outline is not reproduced (CONCEPT). The base rail, back upstand and end posts are unchanged. At the outer ends the ribs meet the pinnacle pedestal (Z ±3.54) and the tower pier (±7.10) about 20–40 mm inside them, where they are hidden.

**Budget:** the façade has 229,316 triangles. The guard in `verify_model.cjs` rises from 230k to 240k, so that the shared crown and fleur geometry, which other passes edit, keeps some headroom.

**Checks:** `verify_model.cjs`, `verify_construction.cjs`, `verify_simulator.cjs --report --estimates` (exit 0), `verify_detail_front_source.py` (`crestRib` 12 rows), `git diff --check`. Headless desktop day views were captured: cresting front and oblique, and the whole front.
