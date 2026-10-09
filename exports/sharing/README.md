# Thạch Bi Church — detailed model for direct sharing

**Design development · Not for construction.** Prepared 8 October 2026 from source revision `c151c71c1f81ec327701c705822dc6dee252eaa6`.

`Thach-Bi-full-detail-2026-10-08.glb` is the architectural display model with native generated texture resolution, embedded textures, no mesh simplification and no position quantization. Size: **125,105,044 bytes**. SHA-256: `a8968ba5368da66f46083321ebc586c151ffa72a8c823bbfb09d9d769509e341`.

Open the GLB in a glTF 2.0-compatible viewer. Materials may differ between viewers; optional `EXT_materials_bump` support is required for its bump detail. A GLB is an architectural exchange file, not the engineering simulator or an approved drawing. The source offline tool in `Thach_Bi_Viewer/OPEN_CHURCH.html` retains the complete simulator, original modules, layouts and calculation capabilities.

The profile shows four pew blocks and open doors. Dynamic engineering overlays, equipment controls, source drawings, schedules and private metadata are excluded. Their absence does not establish successful concealment. Coordinates are metres: X toward sanctuary, Y up from nave finished floor, Z centred D/E (negative toward B, positive toward H). Ornament remains a visualization proxy. Existing lighting, speech/feedback, airflow, concealment and engineering-review holds remain unresolved.

The separate web copy uses reduced textures and compressed geometry; the detailed file above is not served by the website. The GLB and its ZIP are local sharing deliverables excluded from Git because of their size. Preserve them in the project's separate artifact backup. The tracked source manifest records exact input hashes, export settings and diagnostics; it includes build-root counts, which also count invisible alternatives and must not be mistaken for exported quantities.

To regenerate, install the pinned web dependencies and run `node scripts/web/export-visit.mjs /absolute/new/staging/directory full` from the repository root. Use a new directory; the exporter refuses overwriting an existing one. See `docs/web/viewer.md` for the web profile and verification.
