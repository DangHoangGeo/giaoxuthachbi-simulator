# Phase 04 — Lightweight virtual church visit

Status: **in progress; G4 remains open and branch unmerged**. The desktop development visit and separate full-detail sharing export are implemented; see [delivery/profile](../../docs/web/viewer.md) and [checks/evidence](../../review/web-visit-2026-10-08/README.md). Depends on phase 01 and the public-model approval from phase 00. Can proceed while phase 03 content is being collected. Read [architecture](../architecture.md) and [performance/verification criteria](../quality-and-release.md).

## Outcome

A calm public `/visit` experience that works on the agreed desktop: look around or walk through the church, choose a few viewpoints and see day/night atmosphere based on local time. It is clearly a digital design model, not a live camera or measured lighting prediction.

## Inputs

An explicitly cleared public model profile; actual renderer/network baseline; coordinated scene units/axes; navigation/collision geometry and selected visitor viewpoints. The legacy scripts and full simulator are reference implementations, not a ready embeddable component.

## Work packages, in order

1. **Prove an export/adapter path.** Compare a generated GLB/glTF public export with a thin procedural scene adapter using one representative nave/sanctuary section. Measure compressed transfer, decode time, GPU memory proxies, draw calls, frame time, materials, lights and coordinate fidelity. Record the chosen approach and unsupported features; do not rewrite the whole model or hand-maintain duplicate geometry.
2. **Define viewer lifecycle and capabilities.** Implement initialize/load/dispose, camera/viewpoint, day/night and quality interfaces. Load only the public profile after “Enter 3D”; no analysis/editor/catalog/audio stack or private schedule data. Keep one render loop, dispose resources on navigation, suspend when hidden and handle WebGL context loss.
3. **Build visitor navigation.** Provide walk/orbit, reset, exterior/nave/sanctuary viewpoints, keyboard/pointer controls and readable help. Reuse verified collision/walk constraints where appropriate and allow easy escape from a stuck camera. Avoid motion-heavy auto tours, mandatory device orientation and autoplay sound. Offer a static gallery/2D overview for WebGL failure or motion sensitivity.
4. **Implement atmosphere.** Default to `Auto`: use the browser's reported IANA timezone and local clock, with day from 06:00 inclusive to 18:00 exclusive and night otherwise. These are presentation defaults, not sunrise/sunset calculations. Resolve time before starting the scene; SSR shows a stable poster. Re-evaluate at the boundary and on tab resume/timezone change. Offer `Auto`, `Day`, `Night`, explain the detected local time, and retain only this display preference in a new namespaced key. If time detection fails, choose a labeled daytime fallback with manual control. No geolocation permission is needed. [Browser timezone API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions).
5. **Optimize the selected representation.** Simplify ornamental detail only in the public render profile; use instancing, texture budgets, level of detail, limited dynamic shadows and device-pixel-ratio caps based on measurements. Preserve architectural proportions, accepted appearance, navigation clearances and source model coordinates. Public artistic light settings never modify physical photometry, published scenarios or engineering outputs.
6. **Inspect and document.** Compare exterior, nave, sanctuary, openings and selected details with the source revision in day/night and low/high quality. Record any omitted ornaments or approximated materials. Test on real target devices and low bandwidth; retain the readable fallback when budgets cannot be met.

Suggested commit boundaries: export/adapter proof and decision; viewer lifecycle/capability tests; navigation; timezone preference/tests; measured asset optimizations with corresponding model documentation where required.

## Planned deliverables

- `web/src/lib/viewer/` public adapter and `/visit` route.
- Reproducible public export profile with manifest, checksums, units and source revision.
- `docs/web/viewer.md`: supported features, omissions, licenses, performance measurements and fallback behavior.
- Public-safe visual comparison evidence and deterministic date/time fixtures.

## Checks and exit gate G4

- [ ] Public visit assets contain only approved public geometry/materials and no private records or full simulator bundle.
- [ ] Old legacy localStorage layouts cannot load, migrate or change the published scene; no mutation functions are exposed.
- [ ] Test timezone extremes, midnight, DST, 05:59/06:00/17:59/18:00, manual override, browser restart and tab resume. Site timeline dates remain unaffected.
- [ ] Pointer/keyboard users can enter, navigate, reset and leave the visit; fallback remains available at all times.
- [ ] Repeated route entry/disposal does not accumulate render loops, listeners, workers or GPU assets.
- [ ] Actual network/frame-time/device results meet the agreed budgets, with degradations documented rather than hidden.
- [ ] Model/appearance comparisons and relevant existing model checks pass; documentation reflects any changed model behavior.

## Risks and handover

If compression or a format export breaks artistic materials, use a simpler measured adapter until fidelity is proven. A public asset can be downloaded; never put restricted detail in it. Prepare increment B for phase 07 and pass the tested read-only adapter pattern to phase 05 without assuming its public geometry suffices for engineering inspection.

## Development handover, 8 October 2026

Implementation `cbc1672` provides the lighter public profile and separate full-detail sharing export. Local tests, source-coordinate checks and a ten-minute headed desktop session passed; [evidence](../../review/web-visit-2026-10-08/README.md) retains the discovered/repaired hydration and no-JavaScript defects. The same source model and engineering holds remain. G4 is still open for a measured adapter comparison, agreed parish desktop/network and full navigation/acceptance review. This branch stays unmerged. The owner-connected hosting target/URL and actual parish desktop profile are the outstanding owner inputs; no credentials should be sent in chat.
