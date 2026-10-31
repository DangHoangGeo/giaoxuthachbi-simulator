# Plan: central facade between the towers, following the CAD file

Status 24 October 2026: **built** the same day; the record is [docs/facade-model.md](../../facade-model.md). This plan is kept as written. Plan written before the work: Branch `eng/15-dwg-revision-2026-10-23`, after commits `bc6b0b8` (DWG extraction, register sheets, ISSUE-R01–R05) and `d56554e` (dais +0.80, side floors +0.16). Owner direction: on this branch the model follows the church's CAD file of 23 October 2026 (ISSUE-R02 records the facade difference; the church has not yet confirmed which set governs, ISSUE-R01).

## What the CAD file shows (sheet 1, drawings E01A and E01B)

Twin towers unchanged. Between them, on the D–E bay (7.200 m, Z ±3.6) and the C–D / E–G bays:

- ground storey: main arched door in the central bay, arched side doors in C–D and E–G, carved spandrel panels, two cornice bands with Greek-key friezes;
- upper storey at about +8.39: triple-arched window with a rose above it in the central bay, a smaller arched aedicule with a pedestal (empty niche) in each side bay;
- a balustrade of fleur-de-lis cresting over the side bays at about +15.84;
- a single pedimented arched niche with a pedestal, flanked by pinnacled piers, carrying a cross on a disc, over the central bay;
- small pinnacles on the piers at the bay lines.

The current model follows PDF sheet 1: a taller screen of three pinnacled gables. Readable CAD dimensions on E01B: 621 / 5958.8 / 621 across the central bay, 343, 4900, 2189, 3054, 3760, 27254 overall; 2371, 1197, 949, 792, 183, 224, 193, 540, 68 on the upper aedicules and rose; 2979 / 4900 / 3985 / 3756 on the doors; levels +8.390, +15.840, 7450 and 8390 chains (see `dimensions.csv`, drawing E01B, and `levels.csv`).

## Where the model builds it now

- `Thach_Bi_Viewer/bundle.js`: `function V0(s, e, t)` (≈ line 40388 to ≈ 41630), group "Tower-end central facade — traced from supplied elevation", positioned at world X 2.43, rotated −90° about Y (local x runs along world Z). `userData.traceLevels` (central shrine base 11, side shrine base 9.43, canopy crown 18.3, cross top 21.72, side finials 16.45), `entranceCentersWorldZ [-5.48, 0, 5.48]`, clear entrance widths [2.15, 3.1, 2.15]. Added to the exterior group at ≈ line 44813: `Os.add(V0(Ec, ce, ti))`.
- `realism.js` receives that exterior group (`exterior: Os`) in `prepare`, already re-hangs the traced main doors (≈ line 295) and adds evening facade spotlights (≈ lines 706–715, aimed at X 2.4–2.45, Y 9–19). It calls `CHURCH_SANCTUARY.prepare`.
- Dependents to check: `simulator/design.js` facade lighting (tower floods, "Central gable flood · B/H" ≈ line 305, `facadeStatueRevision` statues and their concealed lights ≈ line 520, façade wash), `simulator/engine.js`, `cinematic-tour.js` (film shots of the front; the owner accepted the five-minute film, so hash it before and after and report any change), `construction.js` layer assignment (every mesh needs a known layer), `references.js`, `i18n-vi.js`, place notes ("The central facade follows a tracing of the supplied elevation", bundle ≈ 39140, 39211, 39242), `scripts/verify_model.cjs` and `verify_simulator.cjs` facade assertions.

## Approach

1. **Measure the CAD facade.** Extend the extraction tooling to dump E01B's lines and arcs in model axes (Z, Y) for the central and side bays: cornice levels, pier lines, opening outlines (springing, crown, width), niche, pediment, cross, cresting and pinnacle heights. Render E01B crops with a model-coordinate grid for checking. Record the derived dimensions in a facade table (CSV in this folder and a workbook sheet) with DWG handles, marked TRACED / DERIVED.
2. **Compare with the model.** List each facade element in `V0` with its current position and size against the CAD values. Keep what already agrees (doors, ground storey, piers) and identify what must be replaced (upper screen, gables, pinnacles, niches, cross, balustrade).
3. **Build in a readable module.** New `Thach_Bi_Viewer/facade.js` (`CHURCH_FACADE.prepare`), called from `realism.prepare` beside the sanctuary module and loaded in `OPEN_CHURCH.html` and in the file lists of the verify scripts. It removes the superseded upper-screen meshes of `V0` by name and builds the CAD design from the facade table with the existing material set and the `carving.js` generators (cresting, pinnacles, rosette, scrollwork). Depths and carving relief stay illustrative and labelled. No change to the towers, grid or doors unless the CAD file differs there.
4. **Coordinate the dependents.** Re-aim or reposition facade lights that targeted the old gables (layout migration with revision gate and backup if any saved fitting moves; a fitting the user moved stays). Check the facade statues still have a niche and support; if the CAD design has empty niches with pedestals, keep the owner's statues only where a niche exists and ask before removing any. Update the construction-layer mapping, place notes, Vietnamese strings and film shots that frame the old screen.
5. **Verify.** `verify_model.cjs` with new assertions (key CAD levels, central bay chain, no old gable meshes); `verify_simulator.cjs --report --estimates` compared with the previous commit; `--electrical --export-electrical`, register workflow, safety review if any fitting moves; `verify_construction.cjs`; `verify_cinematic.cjs` and the film hash; web `check:viewer` and `check:boundary`; browser inspection by day and evening, front, oblique and visit-only, and a side-by-side image against the CAD elevation kept under the ignored `images/` folder.
6. **Document and commit.** Facade section in `docs/church-view-renderings.md` or a new `docs/facade-model.md`, DWG README, ISSUE-R02 evidence, cache-version bumps, one commit per coherent step (measurement data; model and dependents).

## Constraints to keep

- The DWG and its images stay out of Git (hold H1); only derived numbers and documents are committed.
- Prefer drawn geometry over stray labels; record conflicts, do not hide them.
- Owner preferences: hidden or finish-matched fittings, red-and-gold sanctuary (interior), one UI language at a time, desktop only.
- The disk has only about 370 MB free: keep renders small, no second checkout; use `git stash` for baseline comparisons.
- Bump `?v=` strings for every edited script (`OPEN_CHURCH.html`, `startup.js` for the bundle).
