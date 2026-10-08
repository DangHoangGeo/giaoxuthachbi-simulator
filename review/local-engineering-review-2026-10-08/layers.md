# Local electrical review layers · 8 October 2026

**Purpose:** owner-directed local HTML engineering review, following the brighter finish/chandelier audit in [appearance.md](appearance.md). Source main `dd2538d`, appearance commit `87e53e1`, branch `eng/07-local-review-layers`. This is independent display/selection maintenance; it does not complete or merge held engineering phases E2–E6.

## Implemented and inspected

Open [OPEN_CHURCH.html](../../Thach_Bi_Viewer/OPEN_CHURCH.html), then **Simulator → Wiring → Lights → Systems only**. The system, circuit, board and equipment filters coordinate fixture bodies, source enclosures, route runs, 2D plan and displayed quantities. Choose an equipment row to trace one item. Select a route for its source, circuit, geometric length, heights and X/Y/Z vertices. **Controls · circuit** opens the existing simulator controls without operating a switch. **Restore building** restores ordinary fixture visibility; filters are session-only.

Dependency traversal retains the selected device's branch, shared trunk and upstream supplies. It does not add sibling loads to quantities. DB-2 lighting retains DB-1 and the DB-2 feeder. Sound includes microphones and the AV rack supply; an active-speaker regression retains both mains and audio connections. Physical control channels/terminals remain pending, as labeled in the panel. Distribution shows proposed supply connections, not a checked single-line diagram.

[Desktop results](layers/results.json) record seven actual UI selections and their IDs; screenshots include [lighting](layers/01-lighting.png), [DB-2 lighting](layers/03-db2-lighting.png), [DB-2 board only](layers/03b-db2-board-only.png), [sound](layers/04-sound.png), [air](layers/05-air.png), [single chandelier](layers/06-chandelier-trace.png), [route vertices](layers/vertices-L78.png), [controls](layers/controls-L1.png) and [restored evening model](layers/07-restored-evening.png). Primary review inspected these captures and the sanctuary day/evening appearance. Headed Chrome, standard graphics, 1600 × 1000, isolated file:// storage. Desktop only, as requested. No console/page errors in the successful runs.

An initial actual-browser check found the compact controls hidden by the open simulator drawer. Navigation now closes that drawer before opening the relevant control tab. The harness also waits for the scheduled 2D redraw before comparing IDs and selects the route by its stable data ID. A final review also found the legacy board-only DB-2 view hiding DB-1 while retaining its feeder route. Both feeder endpoint enclosures now remain visible; added headless and desktop regressions cover that case. These changes did not weaken engineering thresholds.

## Verification

| Command | Result |
| --- | --- |
| `node scripts/verify_review_layers.cjs` | Passed 11 selection cases, invalid/hidden inputs, frame persistence, building restoration and unchanged layout/full electrical exports. Includes a temporary active speaker in isolated test state, removed and checked before completion. |
| `HEADED=1 PLAYWRIGHT_MODULE=<installed Playwright path> node scripts/verify_review_layers_browser.cjs <evidence directory>` | Passed seven desktop selections; 2D/3D equipment and board identity agreement; controls navigation, route vertex display, evening restoration and reload; unchanged full JSON export. |
| `PLAYWRIGHT_MODULE=<installed Playwright path> node scripts/verify_viewer_controls.cjs <evidence directory>` | Passed existing circuit notifications, fan motion, sound mute, moved/dimmed/deleted equipment persistence, undo and import/export. Headless desktop Chrome, 1280 × 800. |
| `node scripts/verify_simulator.cjs --electrical` | Passed 286 connected components / 329 routes and existing concealed-routing assertions. This is a geometry/software audit, not proof of physical concealment or electrical compliance. |
| `node scripts/verify_simulator.cjs` | **Known baseline failure retained:** ambo/altar feedback margin approximately 1.2/1.7 dB versus 3 dB target. No threshold or input changes. |
| `git diff --check` and changed-document local link/path checks | Passed before commit. |

Raw logs are adjacent gzip files; [control regression results](controls-regression.json) retain the existing checks. The preceding appearance commit includes model and full `--report --estimates` logs. No physics, photometry, sample grid or analytical input changed in this layer package.

## Calculation and data preservation

For every route, independently recomputed centreline length as `sum(sqrt(dx² + dy² + dz²))` from consecutive metre vertices. Maximum difference from stored lengths was `1.7763568394002505e-15 m`, numerical round-off only; the check tolerance is `1e-9 m`, not a survey tolerance. Example `drop:LC1:LD:light:-1:L78` is 16.276314927469798 m (display 16.28 m), with five vertices shown in its screenshot. This is drawn route length, excluding slack, terminations and installation allowances. Audio full home-run lengths remain separate from shared bundle lengths.

Every equipment position, circuit, specification, operating setting and route vertex is unchanged by filtering. Hidden/deleted equipment is not restored. Full JSON exports remain invariant. CSV retains the existing mixed scope: equipment for the selected board, routes for the current filters; the UI and routing guide now state this explicitly. It is not an isolated-layer purchase list.

Reviewed [routing](../../docs/electrical-grid/routing.md), [controls](../../docs/electrical-grid/controls.md), [register rules](../../docs/electrical-grid/register.md), [category ownership](../../docs/electrical-grid/categories/README.md), [summary](../../docs/electrical-grid/summary-report.md), [sanctuary](../../docs/sanctuary-model.md) and the [simulator guide](../../docs/simulator/guide.md). Registers and generated schedules were not regenerated because no equipment/line design data changed. The matched baseline remains 327 equipment/enclosure register records, 286 connected components, 329 routes and 2,681 route vertices. No workbook input was overwritten.

## Remaining engineering and web holds

- Baseline feedback margins remain ambo **1.206 dB**, altar **1.715 dB**. Wing STI minimum **0.439** misses the existing 0.45 test floor; the broader 0.60 brief remains distinct. **Four of 368** seat samples remain below 200 lux, worst **196.803 lux**. See [baseline](../../docs/engineering/baseline.md) and [input requests](../../docs/engineering/issues.md).
- Supply/phases/earthing/fault level, selected-product loads and inrush, cable derating/voltage drop/protection, control channels, mounting, access and full viewpoint concealment remain unverified. No proposed conductor/protection values were invented. Local geometry and visible routes are design-development proposals.
- The local four central chandeliers already occupy their correct bay midpoints. The earlier hosted GLB contains legacy chandelier geometry and lacks the local simulator. That web export has **not** been rebuilt or republished here; it also predates the brighter local finish. Use the local HTML for engineering review.
- Next engineering work remains coordinated option review with the responsible designers and recorded site/product inputs, followed by route/board coordination. Software checks do not authorize construction or purchase.
