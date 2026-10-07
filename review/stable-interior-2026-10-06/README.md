# Stable interior lighting · 6 October 2026

All active lamps now contribute both diffuse light and physical reflections at every distance. Texture-backed lamps call the same Three.js `RE_Direct` function as native lamps, including GGX, Fresnel energy conservation, clearcoat and sheen. Native light-budget changes therefore retain the same material response.

The two shadow slots stay assigned to the same fixtures at every viewpoint and rendering quality. In the default layout these are the paired altar key lights. Switching a lamp off leaves its own shadow slot empty instead of selecting another light. The complete lamp coverage, switches and dimmers are retained.

Indirect warm room lighting follows the surface position within the nave and wings. It no longer changes across the model when the camera enters, leaves or the roof is hidden. Saved layouts receive fixed exposure once; automatic eye adaptation remains an optional setting that deliberately changes brightness while moving. Original canvas resolution is retained.

- `nave.jpg` and `sanctuary.jpg`: final evening views from two positions inside the church.
- `verification.log`: simulator checks, including unchanged shadow IDs, ambient intensity/colour, fixed exposure and complete lamp coverage at near/far interior/exterior viewpoints and High/Balanced/Fast settings. The full lighting, acoustic, airflow, electrical routing and history/import checks also pass.
- `gpu-results.json`: all 60 GPU comparisons passed with zero measured channel difference, including metal reflection in the texture-only path.
- `gpu-check.html`: actual GPU regression scene comparing native and texture-backed shading for plaster, wood, metal, clearcoat and sheen at 4, 9 and 20 m. The same front-facing surface point is measured across four native/texture splits. It uses an isolated canvas and the viewer's bundled Three.js runtime.

This is real-time approximate lighting. Additional sources do not acquire individual shadow maps, and the model is not a ray-traced or manufacturer-photometry installation study. Reflections can change naturally with viewing angle; physical surface illumination no longer pops as lamps receive or lose native rendering slots.
