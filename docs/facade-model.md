# Central facade between the towers

**Revision 24 October 2026 (`2026-10-24-cad-facade-1`).** Above the ground-storey cornice, the central facade between the twin towers now follows the church's CAD file of 23 October 2026. The owner directed on 24 October 2026 that this branch follows that file. The church has not yet confirmed which drawing set governs, so ISSUE-R01 and ISSUE-R02 stay open in the [dimension register](layout_design/Thach_Bi_Church_Dimensions.xlsx). **Not for construction.**

## What changed

| | Before (PDF sheet 1, traced in the bundle) | Now (CAD file, DWG sheet 1, drawing E01B) |
| --- | --- | --- |
| Above the doors | Broad entablature +9.4 to +11.0, open screen | Full upper storey to +15.840 between the towers |
| Central bay | Pinnacled gable with a niche, cross top +21.72 | Great arch (r 2.27 about +12.677) over a triple window with louvred lights and a rose; above +15.840 an aedicule with an arched niche on a pedestal, a raked pediment, a cross on a disc to **+24.648** |
| Side bays | Pinnacled gables with niches, finials +16.45 | Great arch (r 1.936 about +12.960) framing an aedicule with an arched niche on a pedestal (+10.391); fleur-de-lis cresting on a balustrade over the +15.840 entablature |
| Piers between the bays | Detached ornamental piers | Fluted pilasters with foliate capitals up to the entablature, and pinnacles with fleur-de-lis finials to +20.55 |
| Depth | One plane, schematic | Stepped faces from the tower-end plans at +10.128 and +15.840 m: piers X 2.30, central wall X 2.94, side walls X 4.02, aedicule X 3.81–3.92, all behind the entrance front (X 2.43 at ground) |

Kept unchanged below +8.45 m, where the CAD file agrees with the traced elevation: the three arched doors, their fanlights, the spandrel carving, the ground-storey piers and the side-bay cornice. The towers are not part of this change.

The overlay of the DWG linework on a straight-on render of the model matches within a few centimetres at every arch, cornice and pier ([evidence](#evidence)).

## Sources and how the numbers are held

- **Elevation:** DWG sheet 1, drawing E01B (variant B, full elevation). Model axes: Z = −(x − 1,666,600.3), Y = y + 515,946.8 (DWG mm), as in [`sheets.json`](layout_design/dwg-2026-10-23/sheets.json).
- **Depths:** tower-end plans at +10.128 m (PT10) and +15.840 m (PT15). They have no model origin. Axis 1 and the D/E midpoint are read from their drawn centrelines (`PLAN_AXES` in `scripts/extract_dwg_revision.py`).
- **Facade table:** [`facade.csv`](layout_design/dwg-2026-10-23/facade.csv) lists 32 traced values: levels, arc centres and radii, faces and the 621 / 5,958.8 / 621 pier chain. `python3 scripts/extract_dwg_revision.py facade` finds every one of them in the DWG geometry within 1.5 mm. The same table is on the workbook sheet *DWG facade*. Three further rows record where the model departs from the drawing or adds to it (D01–D03).
- **Model:** `Thach_Bi_Viewer/facade.js` (`CHURCH_FACADE.spec` holds the values). It runs inside `realism.prepare`, before the plaster maps are projected. It removes the bundle's facade parts that lie wholly above +8.45 m, and the central cornice, then builds the new storey from boxes, extruded arch outlines and the shared `carving.js` generators.

## Status of each part

| Part | Status |
| --- | --- |
| Levels, arch centres and radii, widths, faces in plan | `DRAWING SHOWN`, traced (facade.csv F01–F32) |
| Moulding profiles, relief depths, capitals, cresting, carved crests, fleurs-de-lis | Illustrative shapes following the drawn outlines (`TRACED CAD ELEVATION / ILLUSTRATIVE CARVING`) |
| Side bays continued from ±7.128 to ±7.5 m to meet the model's towers | Model adjustment (D01). The drawing's tower pilasters stand at ±7.13; the model's towers are narrower. |
| Room behind the triple window (X 3.67–4.72) | Shown in plan; the model draws a dark closed backing behind the louvres, not the room |
| Statues in the three niches | The drawing shows empty niches with pedestals. The owner's statues (9 October 2026) stand on the drawn pedestals (D03). |
| Structure, materials, fixings, drainage of the terraces at +9.741 and +15.840, access for maintenance | Not designed: `ENGINEERING HOLD` |

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
| Corner pinnacles | Fleur-de-lis pinnacles on the balustrade corners to about +31.6 | Crocketed pinnacles with fleur-de-lis finials on the existing corner pedestals |

**Departure kept on purpose:** plan sheet 5 draws the stage-1 front wall about 0.5 m further forward than the model's (X −0.5 against X 0). The model keeps its wall plane, so the stages above and the fittings on the +8.39 m cornice keep their places; the piers and entablature project in front of it as drawn. Each tower now has a door from the rear corner of the nave (inner side, X 3.4–4.4 m, 2.3 m high) into its ground-floor room; the walking map blocks the old passage. The old onion cap, cone, urns and cap rosettes are removed. The festival strands on the tower corners move onto the pier fronts. An overlay of E01B on the model after the change is kept, uncommitted, as `layout_design/dwg-2026-10-23/images/05-facade-check/E01B-overlay_towers-after_2026-10-25.png`. Structure, reinforcement and the real pier sections remain on engineering hold.

## Open questions

- **ISSUE-R01 / ISSUE-R02** (church and designer): which set governs, and whether this central facade is the one to be built.
- **Front-gable exhaust fans, ENG-036** (mechanical engineer): the four V1 exhaust fans (F252–F255, +9.1 to +9.7 m) discharge through the nave gable on axis 2′. The CAD upper storey now stands 0.1–0.2 m in front of that gable, so the fans blow into a narrow slot. The calculation does not model this obstruction. The designer must route the discharge, for example into the room behind the triple window and out through its louvres, or move the fans. See [engineering issues](engineering/issues.md).
- **Statue size in the central niche:** the Assumption (1.42 m across the raised hands) just fits the 1.422 m niche. A real figure must be sized to the niche, or the niche to the figure (sculptor, architect).
- **Simulator occlusion:** the analysis geometry has no facade or tower walls, so exterior façade lights reach the front seats in the calculation (on average 0.6 lux, at most 3.8 lux). This limitation existed before this change (ENG-008).

## Evidence

Checks run for this revision: `verify_model.cjs` (new facade assertions: levels, faces, arcs, the pier chain, cross top, nothing of the traced gables left above the cut, the parts stay between the towers, triangle budget), `verify_simulator.cjs --report --estimates` (statue niches, the migration test, facade light coverage sampled on the new faces), `--electrical --export-electrical`, the register workflow, the safety review, `verify_construction.cjs`, `verify_cinematic.cjs`, and the `facade` check of the extraction script. A desktop browser check covered day, evening and visit-only mode.

Overlay pictures of the DWG on the model are kept with the CAD images in the ignored folder `layout_design/dwg-2026-10-23/images/05-facade-check/`, because they reproduce the designers' drawing (publication hold H1).
