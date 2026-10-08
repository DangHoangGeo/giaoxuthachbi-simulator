# Central view and fan placement

**Owner clarification, 8 October 2026 — USER CONFIRMED intent.** The engineer objected to fans in the middle of the church because they would damage the view. Keep the nave's central view, processional axis and view toward the sanctuary clear of visible fans, downrods, guards and supporting equipment. This develops the already approved all-hidden brief; side placement is not an exemption from concealment. This is an architectural requirement, not product, structural or ventilation approval.

The engineer also clarified that this project is used on desktop and requires **no phone UI/UX testing**. Desktop rendering, controls, navigation and saved-state behavior remain required. Completed earlier phone evidence may be retained as history; do not spend further work on phone-specific testing or adjustments under this brief.

## What is actually in the studies

The [location inventory](../../review/engineering-central-view-2026-10-08/README.md) freezes exact IDs, coordinates, source pointers and hashes. No equipment is relocated, deleted, hidden or accepted by this clarification.

| Source | Fan arrangement | Disposition |
| --- | --- | --- |
| Main's failing comparison baseline | F226–F239: fourteen 1.42 m catalogue ceiling-fan proxies in side-aisle rows at Z ±4.4 m, Y 3.9 m. Four wing fans F240–F243 remain visible at Z ±10.15 m, Y 3.3 m. | These are exposed model concepts, not an accepted concealed installation. Nonzero Z does not prove the view is clear. |
| E2 candidate C, commit `8274191` | F226–F231: six 3.0 m catalogue proxies at Z 0, Y 5.0 m, X 7.8 / 13.4 / 19.0 / 24.6 / 30.2 / 35.0 m. | Already rejected for clashes and failed coordinated targets. Also excluded by the central-view requirement, regardless of a future improvement in an average airflow result. Do not carry it forward as the preferred layout. |
| Existing service-room exhaust F260 | X 53.12 m, Y 3.3 m, Z 0, behind the sanctuary in the model. | Its Z coordinate alone does not make it a nave ceiling fan. Interior/exterior visibility, duct/opening paths and performance still require review. |

The six centreline fans were never adopted into the saved default layout or six category registers. The [E2 comparison](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/8274191/docs/engineering/options.md) records three fan/pendant clash pairs and 144 of 368 full-service four-block receivers below 0.30 m/s for C; these are model estimates, not installed measurements. UI tests also used an isolated five-step fan solely to exercise controls. A test fixture is not a placement proposal.

## Revised search and acceptance

1. Exclude exposed fans on the central nave axis from new candidates. Check the entire moving and stationary envelope, including brackets, guards, downrods, wiring and maintenance access. Do not invent a narrow numeric exclusion strip just to make a candidate fit.
2. Develop concealed side/perimeter locations with the architect and mechanical designer. Compare distributed side circulation with remote fan/duct and side-discharge arrangements where real voids, routes and removal access permit them. Neither strategy is selected yet. Selected-product throw/directivity, pressure/flow/noise data and surveyed voids are missing; the present ceiling-fan equation cannot validate a duct outlet.
3. Treat every grille or aperture as part of the appearance review. Check shorter seated occupants, wheelchair users, standing occupants, entrance-to-sanctuary views, sanctuary-to-nave views, choir, side seats and exterior approaches. Include both seating layouts, eye-height ranges, upward/oblique views and day/evening conditions. Side fans that remain visible or interrupt the roof/art/sanctuary view still fail the brief.
4. Recalculate light, sound, microphone feedback and air together for every viable arrangement. Preserve the original receiver set and targets. Include the worst seats, blade/light conflicts, mic wind/noise, inlet starvation, screen/duct pressure loss, recirculation, heat, support loads and safe cleaning/replacement access. A higher or boxed-in free-air fan is not automatically a concealed working solution.
5. Present any conflict between concealment and required performance explicitly. Keep the candidate held when the existing model, survey or product data cannot establish the result. Do not hide a mesh, switch a fan off in analysis, accept a visible side fan silently or claim that nominal ACH proves comfort.

The exact protected-view envelope and permitted architectural details remain to be checked with real geometry and viewpoint evidence; the intent to keep the central view clear is already established. Any later proposed exception needs an explicit engineer decision and retains its performance and appearance consequences.

## Source and register impact

This is a brief clarification only. Source coordinates, catalogue values, scene settings, physics, receivers, electrical routes and workbook cells remain unchanged; existing failures remain visible. Any later accepted fan move or product change must return through E2/E3 and update its supports, loads, E4 routes, E5 controls, six-category registers and summary in the same logical change. Construction and purchasing remain held.
