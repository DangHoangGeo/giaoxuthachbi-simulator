# Outer porch wall, larger inner windows and Marian art, 8 November 2026

**Status: owner direction (`USER CONFIRMED`) from a site photo and the church's concept pictures; design development only. Đang phát triển · Không dùng để thi công / In development · Not for construction.** The artwork is `CONCEPT` and on **PUBLICATION HOLD H8** ([publication checklist](../open-source/publication-checklist.md)).

## What the owner passed on

The owner relayed an update from the church on 8 November 2026, with four pictures:

1. **A site photo of the side wall as built** (brick, under bamboo scaffolding). Each window bay has two round-arched openings on a concrete transom line, with a round blind recess above them. A stair bay has one larger arch with concentric brick rings. The openings are empty: the inner wall's concrete frame shows through them. The photo is not committed. It shows no people.
2. **Silver M monogram lunette** on a white ground. The owner says it is "the part above the inner windows".
3. **"Hoa hồng Đức Mẹ"**, a 60 cm round stained-glass window: an M with a cross, twelve stars and eight roses. The owner says the roses are "placed on the outer wall like the picture".
4. **"Đường hành hương Đức Mẹ"**: nine relief lunettes from the life of Our Lady over the doors, with the main door in the middle.

The owner's words: the outer wall in the model does not match the building; the windows and doors are in the inner wall, but the outer wall looks like the design file; the inner windows are bigger than in the model; a relief lunette goes over each door.

## How the model reads it (owner's choices, 8 November 2026)

| Question | Owner's choice |
| --- | --- |
| Outer porch wall B/H | Replace the 25 October Gothic column arcade with the drawn outer wall of sheets 12/13 (DWG E26/D29). Openings stay open, with no glass or leaves. Keep the porch slab, the pointed cross arches C–B / G–H and the drawn entablature and parapet. |
| Inner C/G windows | One 2.25 m opening per bay, as the inside elevation draws it: sill +0.65 m, 2.301 m to a 0.22 m head band, then a **semicircular** head (1.125 m rise) holding the silver M lunette. The drawing shows a 1.14 m trefoil; the owner chose the semicircle to match the picture. |
| Door reliefs | Nine scenes over the nine outside doors: 3 front, 4 nave side (bays 4–5, 8–9) and 2 service room (bay 11–12). They run as a pilgrimage from the front door on the H side round to the main door. |
| Artwork source | Crops of the church's pictures used as textures, recorded as church-supplied `CONCEPT`, licence unknown, **PUBLICATION HOLD** until the parish confirms. |

Door → scene (`Thach_Bi_Viewer/marian-art.js`, `DOORS`). Left and right follow the site and the drawings. The viewer is a mirror image of the drawings (ENG-027), so the H side appears on the right in the viewer.

| No. | Scene | Door |
| ---: | --- | --- |
| 1 | Truyền Tin · The Annunciation (Lc 1,26-38) | Front side door, H side (left on site) |
| 2 | Mẹ Thăm Viếng · The Visitation (Lc 1,39-56) | G wall, bay 4–5 |
| 3 | Giáng Sinh · The Nativity (Lc 2,1-20) | G wall, bay 8–9 |
| 4 | Dâng Chúa trong Đền Thờ · The Presentation (Lc 2,22-35) | G wall, bay 11–12 (service room) |
| 5 | Tiệc Cưới Cana · The Wedding at Cana (Ga 2,1-11) | C wall, bay 11–12 (service room) |
| 6 | Mẹ dưới chân Thập Giá · Mary at the foot of the Cross (Ga 19,25-27) | C wall, bay 8–9 |
| 7 | Mẹ giữa Hội Thánh sơ khai · Mary with the early Church (Cv 1,12-14) | C wall, bay 4–5 |
| 8 | Mẹ được rước về trời · The woman clothed with the sun (Kh 12,1) | Front side door, B side |
| 9 | Đức Mẹ Hồn Xác Lên Trời · The Assumption (Kh 12,1-2) | Main centre door |

The concept sheet's small facade shows ten doors in one elevation, and its caption says nine. The model has nine outside doors, so the mapping above is the owner's choice and does not come from the sheet.

## What changed in the model

| Part | Change | Source / status |
| --- | --- | --- |
| Outer wall B/H, `porches.js` | The pointed arcade spandrels and the guard balustrade are removed. A plastered wall now stands between the E02 piers, from the porch face (−0.18 m from axis B/H) to the spandrel face (+0.06 m), so the piers still project 0.15 m. **Window bays** (2′–3, 3–4, 5–6, 6–7, 7–8, 11–12): two open round arches at ±1.015 m, 1.0 m wide, sill +0.85, spring +3.1005, crown +3.6005, with archivolt bands at the native radii 500–828 mm. Each opening has an E02 colonnette on both sides (the outer colonnettes were held back on the inner wall until now), and each arch has the 850 mm panel zone below its sill. A rose window sits above each pair. **Stair bays** (4–5, 8–9, 10–11): one open 2.25 m arch from the porch floor, spring +3.1005, radius 1.125 m, with the D29 radii 1 125–1 625 mm and a colonnette each side. The E02 corner leaves, entablature, pier breaks, parapet, slab and cross arches are unchanged. 30 openings, 60 colonnettes, 12 roses. | Sheets 12/13 outer elevations, DWG E26/D29 radii, side elevation (door-type arches in bays 4–5, 8–9 and 10–11). Site photo for "open, no glass". Depths are `DERIVED`; wall thickness, reinforcement and transom are on `ENGINEERING HOLD`. |
| Rose windows | 12 roses, centre +4.645 m (the E02 roundel position), 0.60 m stained glass glazed at mid-wall, ring frame to 0.837 m overall. They take the place of the roundel carved on the inner wall since 3 November. The rose follows the viewer's clear/stained glass and day/evening settings. | Church picture (60 cm); E02 roundel centre; sheet 12 rosette 837 mm. `CONCEPT`, H8. |
| Inner C/G windows, `realism.js` | The 12 window bays (six per side, including 10–11) change from two 1.0 m windows to one 2.25 m window. The wall hole runs from +0.65 m to a crown at +4.296 m; the glass body runs from +0.65 to +2.951 m, then the 0.22 m head band, then the M lunette on both faces. Two panelled timber shutters swing out to the porch, and a stone sill is added. The E02 colonnettes, panels and roundel go to the outer wall. On the nave face, the window crown (+4.296) stays 0.42 m below the station candles (+4.72) and the Stations of the Cross (from +5.0). | Sheet 12 inside elevation (DWG sheet 26): 650 / 2 301 / 220 / 1 140, width 2 250. Simulator analysis openings already used 2.25 × 0.65–4.31 m, so they are unchanged. |
| Door reliefs, `realism.js`, `facade.js` | The 9 door fanlights (six in the side doors, three in the front doors) carry the relief textures. Each relief has a second face indoors, read the right way round. The glazing bars of the front fanlights are removed. `facade.js` moves the renamed front reliefs with the doors. | Church concept sheet. `CONCEPT`, H8. |
| Walk boundary, `realism.js` | Walkers cross the B/H line only through the three stair-bay arches on each side. | Model behaviour. |
| Simulator, `engine.js` | The outer walls are added to the light occluders as `GEO.porchWalls`, solid between rectangles round each opening. The rose glass counts as solid. They are kept out of `GEO.walls`, so the cable routes do not change. No equipment moves, and no layout migration is needed. | See results below. |

### Equipment checked

None of the fittings on the inner C/G wall falls inside a new 2.25 m opening. The checked fittings are the porch path lights and fill speakers at 1.82 m from the bay centre, the reading projectors, wall speakers, exit signs, lanterns, station candles and wall fans. The new opening reaches ±1.125 m and its porch-face surround ±1.285 m. The 36 porch arch washes stay on the pier faces (|Z| 10.654). They now wash the outer wall face round the openings and roses instead of a pointed arch. Their saved note still says "onto its pointed arch", so that wording is stale. No position, aim or output changed.

## Results and checks

The simulator audit (`verify_simulator.cjs --report --estimates`, exit 0) was run on this change and on the previous commit `2b22822`, in a separate worktree. Every figure is unchanged except two small drops caused by the new outer wall occluders:

| Full service, recommended design | Before | After |
| --- | ---: | ---: |
| Seats ≥ 200 lux; average / minimum | 100 %; 340 / 212 lux | unchanged |
| STI average / minimum | 0.62 / 0.41 | unchanged |
| Sound level average | 69.2 dBA | 69.1 dBA |
| Local air speed, lowest seat | 0.05 m/s | 0.04 m/s |

The wall now blocks a few direct paths that used to cross the B/H line, so both drops are physical effects of the wall, not tuning. The air target and the wing speech target were already unmet (ENG-005/006); nothing was raised to hide the change. The electrical check (`--electrical --export-electrical`) passed with the same 435 routes. The only change in the exports was the save timestamp, which was reverted. The equipment registers did not change.

Other checks: `verify_model`, `verify_construction`, `verify_side_dwg` (it already failed on the baseline because it predates the 7 November service-room doors; it now checks the outer wall's native crowns and the single inner opening), `verify_open_porches`, `verify_doorhead_signs`, `build_marian_art_textures.py --check`, and the web `check:viewer`. The viewer was inspected on the desktop by day and in the evening, outside, in the porch, in the nave and in visit-only mode (`?visit`), with no console errors.

## Open questions and holds

- **ENG-045** in [issues.md](issues.md): the outer wall needs structural design (thickness, reinforcement, the concrete transom seen in the photo, lintels, the rose opening and the colonnette fixings). The photo shows brick, while the model shows a plastered finish as drawn. The designer must confirm the finish.
- The inner window head is drawn as a 1.14 m trefoil but modelled as a semicircle, at the owner's choice. The designer must confirm the shape, the lunette material and whether it is glazed, pierced or solid (it affects daylight and air through the head).
- The porch guard is withdrawn. The window-bay wall below the sill is 1.17 m above the porch floor. The stair-bay arches are open to the outside stairs, as before. Guarding rules still need the code check (ENG-001, ENG-013).
- The artwork pictures have no recorded author or licence: **H8**. Carving depth, timber, glass type, leading, frames, fixings and weathering are not specified.
- The relief pictures are stretched about 14 % vertically to fit the 2:1 semicircle.

## Superseded

- [Parish meeting, 25 Oct 2026](parish-meeting-2026-10-25.md), point 2: "no outer wall, only concrete columns with pointed arches" is superseded for the B/H line. The rest of point 2 still applies: doors and windows in the inner wall, no door from the sanctuary sides, a concrete porch roof.
- [sides.md](../exterior-23102026/sides.md), 3 November 2026: the paired outside window type in the C/G wall and the E02 dressing of the inner windows are superseded. The type now stands in the outer wall.
