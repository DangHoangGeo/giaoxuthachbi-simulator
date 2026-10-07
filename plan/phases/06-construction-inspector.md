# Phase 06 — Father's construction inspector

Status: **not started; future capability**. Depends on phase 05 and a source-backed pilot work package prepared with the site team. Read [object/data contracts](../data-and-publication.md) and [AGENTS.md](../../AGENTS.md).

## Outcome

Father can open the next construction package on a phone/tablet, filter layers and layouts, select a real project object, and see its position, width, height, other relevant dimensions and specifications with evidence. He can recognize what is checked, proposed, conflicting or missing without searching a paper drawing first.

“Real time” means current published revision and immediate object lookup. It does not mean live survey, automatic detection of work on site or continuous construction verification. This view remains read-only and never instructs workers to build an unresolved detail.

## Inputs

One agreed next-work package, responsible site/designer contacts, authoritative drawings/specifications, actual site checks where relevant, stable object IDs and model mappings, coordinate/level conventions, selected device and a field trial. Foundation completion is already reported, but its survey/as-built information must be obtained separately.

## Work packages, in order

1. **Select the pilot and define supported scope.** Choose a contained package with the site team based on current work, not a guessed construction sequence. Identify every object needed for that package, prerequisite work, required inspections and engineering holds. Initially show other areas as outside the verified pilot. Do not publish an AI-generated construction method or schedule as an approved sequence.
2. **Build the semantic registry.** Reuse existing equipment/member/route IDs. Add stable architectural IDs with ownership and retirement rules. Link each rendered object or instance to its record, source document/page/cell, reference point, dimension endpoints, status and revision. Separate design/model/as-built values; maintain known conflicts. Preserve unknowns and source precision.
3. **Build coordinated 2D/3D navigation.** Provide layer toggles for architecture, structure, roof, lighting, sound, air and electrical categories, plus levels/zones/grids. Use the same dataset for both views. Support isolate, hide, section/cutaway and reset where tested; hidden or clipped objects must not steal selection. Selection from a list/2D map highlights the same ID in 3D, and vice versa.
4. **Create the object card.** Lead with plain name/ID, location/grid/level and status. Show position with datum/reference point, explicitly named width/height/length, material/product specification, relevant route/equipment links, and source date/revision. Expand to evidence, tolerances and unresolved conflicts. A missing value says “not verified”; an empty field never becomes zero. Show a source excerpt or authorized document link for checking without making paper navigation mandatory.
5. **Add next-work navigation.** The `/site` overview shows published current and next packages, dependencies, completed/reported/verified distinctions and hold reasons. Link a package to its objects and relevant installation/control documents. Date any planned sequence; do not imply a delayed data update means work stopped. Publication and status changes remain with the external site/engineering workflow.
6. **Make revision changes safe.** Pin geometry, cards, drawings and schedules to one release. When a new checked version is published, show a refresh prompt and a concise revision summary. A removed/replaced object deep link resolves to its retirement record, not a different reused ID. Weak-network failures show the last fetched revision and stale status; private offline caching is disabled initially.
7. **Run the site trial, then expand.** Ask Father/site users to find the next package, locate an object, read a dimension, open its source, identify a hold and return to the overall layout. Use bright outdoor conditions, one-handed touch and the actual network/device. A responsible engineer compares the displayed values to the source and site evidence. Fix errors before adding more packages.

Suggested commit boundaries: pilot registry and validation; 2D/3D selection mapping; object card/source evidence; work-package navigation; revision handling; site-trial fixes. Model/ID changes include their required documents/registers in the same commit.

## Planned deliverables

- `/site` and `/site/objects/[objectId]` protected routes.
- Versioned semantic registry, view/layer definitions and work-package mappings.
- Validation for complete pilot coverage, source references, dimension basis and instance selection.
- `docs/web/site-inspector.md`: supported scope, device guide, source status, change workflow and trial evidence.

## Checks and exit gate G6

- [ ] Every pilot object is selectable by stable ID and has required sources/status; every construction-critical displayed value has the applicable checked authority. Unsupported values remain on hold.
- [ ] Independent checks catch wrong axis/sign/unit, local-versus-world transform, width/clear-span confusion, rotated objects and erroneous bounding-box dimensions.
- [ ] 2D/3D, layer/section visibility and instance picking identify the same source object; overlapping objects can be disambiguated through the list.
- [ ] At least one member, opening, equipment mounting and line/route example is tested where included in the pilot; explicitly record exclusions.
- [ ] A changed/retired ID, missing source, conflicted dimension, stale package and release mismatch are demonstrated without misleading fallback values.
- [ ] Father/site users complete the six trial tasks without developer coaching after the short introduction; record timing, mistakes and feedback, not a fabricated usability score.
- [ ] The responsible site/designer reviewer accepts the pilot's information for its stated purpose; this does not approve the whole structure or future packages.
- [ ] No in-app edits, approvals or installed-equipment commands are possible.

## Risks and handover

A visually complete mesh may have incomplete engineering semantics. Expand only when registry/source coverage catches up. If field evidence conflicts with drawings, flag the object and route the question to the responsible designer; do not “fix” dimensions from photographs. Private offline use, QR labels on site and augmented reality may be separate future enhancements after evidence, device security and maintenance needs are agreed.

Prepare increment D for phase 07. Keep the ordinary checked drawings and site review process available while the inspector is piloted; the app is an access tool, not the issuing authority.
