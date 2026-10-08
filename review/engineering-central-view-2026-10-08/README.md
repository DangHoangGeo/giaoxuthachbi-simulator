# Frozen fan locations and unmerged E2 centreline candidates

This is a read-only location inventory for the then-current `eng/05-boards-and-controls` checkout (`HEAD 5bbd09f20f7336b85c046fab1c3ddf3b361210c2`) and the separate E2 branch (`eng/02-coordinated-optimisation` at `8274191bb9be59620cd9738c6e02bdda8c1691c6`). The current checkout already had unrelated E5 working-tree changes; none were edited. E2's tip is not an ancestor of current HEAD. Candidate files below were read with `git show` from that branch.

The frozen E5 layout is `Full service · evening`, `sceneOverride=false`, with 322 items and 35 fan records. The complete record for every current fan—including exact ID, type, x/y/z, hidden/on, speed, circuit, catalogue size, source line and JSON pointer—is in [fan-inventory.csv](fan-inventory.csv). The candidate patches, input hashes, exact per-ID JSON pointers and line references are in [candidate-inventory.json](candidate-inventory.json).

Coordinates follow [AGENTS.md:40](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/5bbd09f/AGENTS.md#L40) and [fans.md:7](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/5bbd09f/docs/systems/fans.md#L7): Z is centered between D/E; negative is side B, positive is side H. Here `z=0` means only that model coordinate. This inventory does not set or estimate a protected-view corridor width.

## Baseline versus E2 candidate centreline placements

| Layout | Fan positions and nominal model envelope | Exact z=0 status | Recorded disposition and source |
| --- | --- | --- | --- |
| Current saved full-service layout | F226–F239 are 14 visible/on F1 ceiling fans, Ø1.42 m, in seven paired rows at Y 3.9 m, Z ±4.4 m, X 7.725, 12.225, 16.725, 21.225, 25.725, 30.225 and 34.725 m. F240–F243 are four visible/on F1 wing fans, same Ø1.42 m, at Y 3.3 m, Z ±10.15 m and X 39.3/41.85 m. | No F226–F259 ceiling/wall fan center is exactly z=0. The two front-gable exhaust fans F253/F254 are at z=−0.8/+0.8 m; F252/F255 are at −2.4/+2.4 m. F260 is exactly z=0 at X 53.12 m in the service room, not in the nave fan rows. | Current working layout: `docs/electrical-grid/equipment-layout.json` (`F226` begins line 5075, `/items/225`; all 35 indexed in the CSV). Design-source comments place F1 over the two side aisles and say none hangs over the processional aisle (`design.js:237–249`). |
| A — adjusted distributed | F226/F227 move to X 6.85, Y 3.9, Z ±3.6 m; F228–F239 retain their baseline X rows but move to Z ±3.9 m. Type remains `fanCeiling`, catalogue Ø1.42 m. Four wing fans F240–F243 are not patched. | No exact z=0 fan. Closest proposed fan-center row is at Z ±3.6 m. | Input says `CONCEPT — not adopted; no construction/product approval`. E2 disposition rejects A (`options.md:3,14,70`). Exact per-ID input lines and `/equipment/N/patch` pointers are in the candidate JSON. |
| B — higher integration zones | F226–F239 retain baseline X and Z ±4.4 m, with Y raised to 6.1 m; F240–F243 retain wing X and Z ±10.15 m, with Y raised to 5.4 m. Type remains `fanCeiling`, catalogue Ø1.42 m. | No exact z=0 fan. | Input says `CONCEPT — not adopted; no construction/product approval`. E2 disposition rejects B (`options.md:3,15,72`). Exact per-ID input lines and pointers are in the candidate JSON. |
| C — fewer large fans / directional sound | F226–F231 change to `fanHVLS`, catalogue Ø3.0 m, at Y 5.0 m, Z 0, X 7.8, 13.4, 19.0, 24.6, 30.2 and 35.0 m. F232–F239 are patched hidden/off; F240–F243 remain at baseline wing positions. The candidate uses `spreader:false`; its input reason says support/load and moving-envelope review remain held. | Six exact centerline placements: F226–F231, all z=0. | Input says `CONCEPT — not adopted; no construction/product approval`. E2 documents reject C before selection and record fan/pendant clashes F228/L78, F229/L79 and F231/L80 (`options.md:3,16,74`). Exact per-ID lines and pointers are in the candidate JSON. |

The catalog records nominal diameters of 1.42 m, 0.45 m, 0.90 m, 0.50 m and 3.0 m (`catalog.js:652–667`), and rotor drops of 0.17 m and 0.42 m for the two ceiling types. E2 inputs identify the catalogue basis as generic, unvalidated proxies with no manufacturer claims; `fans.md:3–6` marks its older schedule/results historical and the estimates uncertified. These dimensions are viewer/catalogue proxies; bracket, guard, duct, fixing, vibration and installation-clearance extents are not selected-product data.

## Source provenance

- Current coordinates/states: `docs/electrical-grid/equipment-layout.json`; use each CSV `source_line` plus the per-field JSON-pointer columns such as `position_json_pointer`, `on_json_pointer`, and `circuit_json_pointer`.
- Default-position intent and installation notes: `Thach_Bi_Viewer/simulator/design.js:237–273`. This is a source comment/model definition, not an approval. It labels side-aisle ceiling fans, optional hidden F2 wall fans, off F4 entrance trials and the V1 gable/service-room exhaust locations; the F1 note says the support requires structural-engineer verification.
- Type sizes/model proxies: `Thach_Bi_Viewer/simulator/catalog.js:652–667` and geometry builders `:258–340`.
- E2 candidates and recorded rejection status: branch `eng/02-coordinated-optimisation@8274191bb9be59620cd9738c6e02bdda8c1691c6`, `review/engineering-options-2026-10-08/inputs/{a-distributed,b-high-integration,c-large-directional}.json`; disposition in `docs/engineering/options.md:3,14–16,70–74`.

No engineering choice is made here. No candidate position has been applied to the current layout.

## Primary integration

The [owner clarification](../../docs/engineering/central-view-constraint.md) excludes visible centreline fans and records desktop-only usage. This inventory preserves the earlier source hashes; it is not a claim that E5 code is merged into main. Primary comparison confirms every one of its 35 fan IDs, types, positions, requested/hidden states and circuits equals main `703268a`. The E5 layout has different control metadata and a different file hash, while its fan records remain identical. No model or workbook changed in this brief clarification.

All five frozen source hashes are recoverable from committed E5 revision `ae18c68`; its item geometry equals main. The copied CSV uses LF line endings for repository consistency; its rows and values are unchanged. [Primary verification](verification.json) records source recovery, the main comparison, local links and untouched model/register bytes.
