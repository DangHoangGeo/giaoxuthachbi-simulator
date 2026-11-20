# Wing-gable lighting, service-room doors and porch-side supports · 7 November 2026

Owner requests of 7 November 2026, read from a marked screenshot of the H-side wing gable and the sanctuary porch (`USER CONFIRMED` intent; appearance only). The changes are design-development proposals in the viewer and simulator, **not for construction**.

## 1. Wing gables: uplights and candles at the statue place

- **Request.** Uplights (*đèn hắt*) on the outside of both wing gables, and two candle lights at the places kept for statues.
- **Reading confirmed in chat.** No statues yet; candles wait for them. After a first version the owner asked that the inner-pier feet get **no pedestals and no candles**, and that the uplights move **out to the two sides** for a more balanced look. The statue place that remains is the pedestal already modelled in the aedicule niche at the top of each gable (`roofline.js`, EW trace, pedestal top +10.380 m).
- **Model.** New circuit **LW · Wing gables · uplights & statue candles** on DB-1, appended after LS so existing trunk bands do not move. Per gable (B and H):
  - `L-WING-GABLE-{B|H}-{F|R}`: one compact cornice-colour ledge flood at each side, on the ground-storey cornice ledge (+6.324 m, 0.10 m in front of the gable face, between the inner and corner piers at ±3.15 m from the wing axis X 40.575), optic 0.06 m forward, aimed up and inward at ±1.4 m / +11.6 m; 3 000 lm, 60° beam, 3 000 K (planning values).
  - `L-WING-STATUE-{B|H}-N-{1|2}`: two `nicheCandle` electric candles on the niche pedestal at ±0.30 m, 0.14 m in front of the gable face.
  - 8 items in all, about 2 × 70 W category floods per side in the existing ledge-flood catalogue entry plus 4 × 1 W candles; these are catalogue placeholders, not selected products.
- **Scenes.** LW follows L10's levels (Full service and festivals 1; weekday, rear-bays-off and prayer 0.6; cleaning, night security and all off 0).
- **Saved layouts.** `wingGableLightsRevision` (`2026-11-07-wing-gable-lights-1`) backs up the layout to `.before-wing-gable-lights` and adds the missing LW items once, switched as the current scene sets LW. Deleted LW items stay deleted.
- **Holds.** Product, photometry, glare toward the porch and walkway, weatherproofing, fixing on the cornice, cable entry and safe access at +6.3 m and +10.4 m: `ENGINEERING HOLD`. The ledge floods sit behind the cornice lip and are coloured like it ([hidden fittings](hidden-fittings.md)); the hot spot at the foot of each wash is visible in the evening view.

## 2. Red support showing in the porch

- **Fault.** The 3 November red-and-gold cladding skinned all four faces of the four concrete supports on axes 10 and 11 (`sanctuary.js`). The supports stand in the C/G wall line and project 0.18 m into the porch (|Z| 7.47–7.65), so a red carved pilaster showed outside.
- **Fix.** Only faces seen indoors are clad: the nave-facing face (carved), at axis 10 the face toward the wing (carved), the side faces from the inner face to the wall's inside face |Z| 7.25 (plain lacquer), and at axis 10 the part of the porch face inside the wing up to its closing wall (X ≤ 44.015, plain). The porch faces keep the wall plaster. 14 skins and 8 carved panels (were 16 and 20). Cores, sizes and bearing unchanged.
- **Not changed.** The grey stone column bases (`Side column base`, |Z| 6.94–7.78) still show at the foot of the supports in the porch; they were not part of the request.

## 3. Service room (sacristy) doors instead of windows

- **Request.** The service room has no windows; two doors lead into it from outside. Owner chose **one door on each side** (B and H).
- **Model.** Bay 11–12 of the inner C/G wall becomes a door bay like 4–5 and 8–9 (`bundle.js` door-bay set, `realism.js` door joinery, `engine.js` analysis wall openings): 2.25 m opening, timber leaves, 220 mm head band, coloured fanlight; the paired windows, their E02 colonnettes and roundel go. Walk routes pass through the doorway (|X − 50.846| < 0.85). `doorhead-review.js` now expects six head bands.
- **Not added.** No lanterns or exit signs at these doors (the lantern list is ID-ordered and the porch path light of bay 11–12 already lights the doorway). Whether these doors are escape routes from the service room, their exit signage, threshold step (+0.000 room / −0.320 porch), accessibility and security are open for the architect and fire reviewer.

## Checks

Recorded in the commit body. Model, simulator, electrical export, registers and the safety review were regenerated from the same revision. The printed A3 system packages (`output/pdf*`) list circuits by package and are **stale** for LW until rebuilt.
