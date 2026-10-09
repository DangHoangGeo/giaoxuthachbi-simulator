# Electrical connection review · 9 October 2026

Owner direction: improve the local engineering review. Source main `e3aa616`; branch `eng/08-review-navigation`. Scope is display, navigation and an explicitly filtered review export. This does not adopt a held layout or close engineering phases E2–E6.

## Implemented behavior

- Equipment selection opens a connection inspector above the layer filters. Each actual drop/local route links its upstream feeder(s), shared trunk and individual branch. Selecting a linked route brings its detailed inspector to the top. Filter changes clear excluded selected routes/enclosures.
- Power, loudspeaker audio and microphone signal are labeled separately. A passive speaker has no invented mains branch; an active speaker retains separate signal and local mains entries. Microphone arrows point from the microphone to AV-1; the geometric route record still starts at AV-1, as explained in the inspector.
- **Fit review / Fit connected routes** frames the current review. **Show route** frames the complete selected run and its related source enclosure envelopes, replacing the former fixed offset around a middle vertex. The algorithm encloses route/enclosure bounds in a sphere, reserves horizontal space for desktop panels, and uses `distance = radius / sin(smaller half field-of-view) × 1.1`. The 0.25 m camera-envelope padding and 0.7 m minimum radius are display choices, not installation clearances or changes to engineering geometry.
- **Export this review** downloads a detached JSON snapshot with the exact selected equipment, route and source records, stable IDs, filter state, existing routing revision and unresolved specifications. Shared trunks remain context, not duplicate loads or cable quantities. The complete design export and legacy CSV keep their existing scopes. This file is not a complete layout import, category register replacement or purchase schedule.

The [example L78 review file](desktop/chandelier-review.json) was produced by the actual browser download button. It contains one chandelier, three related routes and two source enclosures. No full-design record is modified by creating or editing the detached snapshot.

## Verification and primary review

| Check | Evidence / outcome |
| --- | --- |
| `node scripts/verify_review_navigation.cjs` | Passed ten review-export scopes, all 286 installed component traces, nine camera cases, empty/invalid inputs, stale-selection clearing and full layout/export preservation. An isolated synthetic active speaker verifies separate audio/mains entries and is removed before final preservation comparison. |
| Camera projection | All 2,681 default route vertices fit the independent THREE perspective camera. Long DB-2 feeder, short vertical branch and local service-panel branch are covered. Source enclosure corners also fit. These are display checks, not a visibility/concealment survey. |
| `HEADED=1 PLAYWRIGHT_MODULE=<installed Playwright path> node scripts/verify_review_navigation_browser.cjs <evidence directory>` | Actual desktop Chrome, 1600 × 1000, standard graphics, isolated file:// profile. Passed actual camera frustum checks, inspector navigation, real JSON download and record comparison, microphone direction/meaning, day/evening display and building restoration. No console/page errors. |
| Existing `verify_review_layers_browser.cjs` | Seven desktop selections, 2D/3D identity agreement, controls navigation, vertex table, restoration and reload passed. The route locator now explicitly chooses the run-list instance because the inspector intentionally provides another link to the same route. |
| `node scripts/verify_model.cjs` | Passed existing geometry/navigation package checks. |
| `node scripts/verify_simulator.cjs --electrical` | Passed 286 connected components and 329 routes, including existing concealed-routing software assertions. |
| `node scripts/verify_simulator.cjs --report --estimates` | Calculation audit passed; existing unmet targets remain in the output. No physics/input/threshold/sampling changes. |
| Documentation and diff | Changed local links and referenced files checked; `git diff --check` passed before commit. |

Primary review inspected the implementation, independent agent test, actual exported JSON and the captured [lighting fit](desktop/01-lighting-fit.png), [chandelier connection](desktop/02-chandelier-connections.png), [short feeder and both boards](desktop/03-feeder-fit.png), [microphone connection](desktop/04-microphone-connections.png), [evening inspector](desktop/05-evening-inspector.png) and [restored building](desktop/06-restored-building.png). [Browser results](desktop/results.json) and adjacent compressed logs record the checks. Desktop only, as directed. Actual microphone playback and physical installation were not tested.

## Data and engineering status

Equipment IDs, positions, aim, operating settings, route vertices/lengths, catalogue specifications, analysis inputs and full electrical exports are unchanged. Reviewed the owning [routing](../../docs/electrical-grid/routing.md), [controls](../../docs/electrical-grid/controls.md), [register preservation rules](../../docs/electrical-grid/register.md), [category index](../../docs/electrical-grid/categories/README.md), [summary](../../docs/electrical-grid/summary-report.md) and [simulator guide](../../docs/simulator/guide.md). No equipment/line/register refresh is necessary: the matched baseline remains 327 equipment/enclosure register records, 286 connected components, 329 routes and 2,681 vertices. Existing Excel inputs and saved user layouts were not overwritten.

The audit still reports ambo/altar feedback margins around 1.2/1.7 dB versus the 3 dB target, wing STI minimum 0.439 versus the 0.45 test floor, and four of 368 seats below the 200 lux brief. The broader STI brief remains separate. Supply/earthing/fault level, product data, cable/protection sizing, independent physical controls, mounting/access and all-viewpoint concealment remain held; see [baseline](../../docs/engineering/baseline.md) and [input requests](../../docs/engineering/issues.md). The hosted architectural GLBs remain stale and were not republished in this local package.
