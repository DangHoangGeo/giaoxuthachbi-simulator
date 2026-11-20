# Roof hidden: floating lining ornament and missing side beams · 21 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.**

The owner found that, with the roof hidden, some roof parts stayed in the air and the horizontal beams connecting the columns to the walls disappeared.

Causes:
- The lining ornament (`Roof lining panel fillet`, `… gilded bead`, `… lacquer roundel`, `… gilded rosette`, from `interior-finish.js`) was attached to the building instead of to the roof assembly. It stayed when the lining hid.
- The 14 side beams (`Side beam 0.30 × 0.46 m`) and their bands, borders, cartouches, haunches, pier brackets and truss posts were built inside the roof assembly (`simulator/engine.js`). The main tie beams and column-line beams were already moved to the frame; the side beams were not.

Fix: the lining ornament now goes into the roof assembly, and the side beams move to an always-visible frame group in the building. Geometry, names, positions and materials are unchanged. With the roof shown, the view is the same as before.

The cameras are the side view from (16, 14, −22) looking at (22, 7, 0), the view over the nave from (20, 26, −16) looking at (24, 5, 0), and the aisle view from (14, 9.5, −4) looking at (20, 7.5, 5). All are by day with the roof hidden. Headless desktop Chrome, 1600 × 900. [Comparison](compare-roof-off.jpg)

Ceiling-fan downrods stay visible with the roof hidden. They are equipment, and the plan view hides the roof precisely to show equipment.
