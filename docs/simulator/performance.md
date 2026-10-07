# Viewer performance and memory

The 7 October 2026 optimization preserves the design geometry, all equipment IDs,
positions and settings, materials, emitter physics, collision model, source notes,
and analytical samples. It changes display storage and runtime work. It does not
resolve the documented lighting, feedback, wing clarity, ventilation or sightline
shortfalls.

## Geometry storage

[render-batches.js](../../Thach_Bi_Viewer/render-batches.js) builds indexed display
buffers directly from source meshes, one material per original top-level group.
It retains the original vertices, normal/UV seams and triangle order; it does not
weld, decimate or remove carving. Previously the viewer expanded every indexed
triangle into three independent vertices, then kept transformed copies of every
part until the final material buffer was assembled. Fixture prototypes now use
the same direct indexed merger. The original object hierarchy remains available
for source inspection, GLB export, picking and verification.

The group-to-display mapping still governs roofs, openings, seating and timber
variants. Only the static display meshes skip unnecessary local matrix updates.

Run `node scripts/verify_model.cjs` to verify source/batch triangle counts,
transformed positions, normals, UVs and buffer memory reduction, alongside the
existing geometry and navigation checks. Run `node scripts/verify_simulator.cjs
--report --estimates` for equipment and calculation consistency. Browser evidence
is recorded in [the performance review](../../review/performance-2026-10-07/README.md).

No equipment, electrical route, control mapping or specification changed in this
rendering work. The existing category workbooks, plan data, schedules and summary
retain their owning design revision; regenerating them would only change export
metadata. Governing documents checked: [sanctuary](../sanctuary-model.md),
[systems brief](../interior-systems-plan.md), [lighting](../systems/lighting.md),
[simulator methods](methods-and-limitations.md), [controls](../electrical-grid/controls.md)
and [register workflow](../electrical-grid/register.md).
