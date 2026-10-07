# UI cards review · 6 October 2026

The noise/sound meters now dock in the bottom-left corner. The walking control shares the stats' center line and sits 12 px above them. “At your position” and the other floating cards use the same transparent glass tint, 20 px backdrop blur, border, corner radius and shadow, with matching day/evening text colors.

Discover remains near the top left and scrolls its complete contents on short screens. Location stays in the right column. Controls keep one size across all five tabs; on short screens the right column scrolls to show the opened Controls header. Portrait Simulator uses a bottom drawer, with the HUD above it; short landscape uses a side panel with a sticky header. Physical distribution-board faces retain their equipment styling.

The changes are in `Thach_Bi_Viewer/ui-cards.css`, the viewer HTML, simulator HUD/control layout code and the simulator guide. This request changes presentation and menu scrolling; it does not change equipment data or estimate formulas.

## Verification

- **14 rendered UI states, 191 checks passed.** Sizes: 1336×988, 390×844, 360×640, 320×568, 844×390, 667×375 and 568×320. Checked day/evening, Explore/Walk, open Controls and open Simulator. Measurements were taken after responsive layout updates settled.
- Checked meter placement, centered movement/stats, spacing, header clearance, right-aligned location, Simulator clearance and identical glass styles across visible cards. See [browser measurements](browser-checks.json) and [summary](verification-summary.json).
- All five desktop Controls tabs remain **224×440 px**. See [tab dimensions](controls-tab-checks.json).
- Dragged the centered joystick: the visible minimap position moved, and the knob returned to center on release. See [movement check](movement-check.json).
- Visually reviewed settings, architecture details, help/references dialogs, Wiring and Analysis, including evening status colors and input/button states.
- JavaScript syntax checks passed for `simulator/ui.js` and `simulator/controls.js`; `git diff --check` passed. No browser console errors were reported.

The viewer was left in the normal desktop overview, Day/Explore, with Discover, Controls and Simulator closed. Equipment settings were preserved.

## Screenshots

- [Desktop walking view](desktop-walk-day-final.jpg)
- [Desktop evening view](desktop-walk-evening-final.jpg)
- [Evening Simulator](desktop-simulator-evening-final.jpg)
- [Phone walking view](phone-walk-day-final.jpg)
- [Phone Simulator](phone-small-simulator-final.jpg)
- [Landscape Simulator](landscape-simulator-final.jpg)
- [Narrow landscape Simulator](landscape-narrow-simulator-final.jpg)
- [Help dialog](help-evening-final.jpg) and [references](references-evening-final.jpg)
