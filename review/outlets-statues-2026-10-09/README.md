# Review evidence · socket outlets, façade statues and hidden light · 9 October 2026

Evidence for the [coordinated record](../../docs/engineering/outlets-and-facade-statues.md). Source: branch `eng/11-outlets-facade-statues`, on top of `7216da8`. These are software checks and viewer pictures of a design-development model, not construction approval.

## Pictures

Taken in the local desktop viewer (`OPEN_CHURCH.html` served from `Thach_Bi_Viewer/`, standard graphics, as-drawn frame, recommended layout). They are screen captures at reduced size: use them to check composition, not colour, lux or dimensions.

| File | Shows |
| --- | --- |
| [facade-evening-hidden-light-candles.jpg](facade-evening-hidden-light-candles.jpg) | Evening lighting with L6 and L10 on: the Assumption between the towers and the two side figures in glowing niches, two candle lights on each base, no visible lamp. The sky in this capture is the day background; only the lighting state is evening. |
| [central-niche-day-no-visible-lamps.jpg](central-niche-day-no-visible-lamps.jpg) | Central niche by day before the candle lights were added: the hidden light lines appear only as thin lips in the wall finish. |
| [shrine-our-lady-day.jpg](shrine-our-lady-day.jpg) | Sculpted Our Lady in the side-B shrine. |
| [shrine-saint-joseph-day.jpg](shrine-saint-joseph-day.jpg) | Sculpted Saint Joseph carrying the Child in the side-H shrine. |

Not captured: the socket outlets, the Controls → Towers panel, and a night sky view.

## Checks run on the final source

| Command | Result |
| --- | --- |
| `node scripts/verify_model.cjs` | passed |
| `node scripts/verify_estimates.cjs` | passed |
| `node scripts/verify_simulator.cjs --report --estimates` | calculation checks passed, including the new outlet, statue, hidden-light and saved-layout checks; unmet design targets unchanged (feedback 0.9/1.3 dB, 89.1 % of seats ≥ 200 lux, wing minimum 121.6 lux, wing clarity minimum 0.422) |
| `node scripts/verify_simulator.cjs --electrical --export-electrical` | 317 connected components, 370 routes |
| `node scripts/build_equipment_register.mjs --verify-workflow` | 359 current records, 370 routes, 2,928 vertices; retired records preserved |
| `verify_installation_review`, `verify_review_layers`, `verify_review_navigation`, `verify_wing_art`, `verify_nave_fans`, `verify_wing_clearance`, `verify_nave_fan_clearance`, `verify_texture_memory`, `verify_viewer_performance`, `verify_light_grid` | passed |
| `verify_wing_revision`, `verify_wing_review`, `verify_wing_sound` | fail on their fixed 320-item inventory; they failed the same way before this change (330 items) |
| `verify_wiring_viewer`, `verify_viewer_controls` and the `*_browser` checks | not run: Playwright is not installed on this machine |

`verify_installation_review.cjs` was updated so that its independent classifier knows the new socket category; no threshold or sample was changed.

## Not verified

GPU rendering on other computers, the printed drawings and reports (stale, not rebuilt), real niche depths, structure, products, photometry and anything on site.
