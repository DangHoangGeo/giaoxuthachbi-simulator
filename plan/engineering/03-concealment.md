# Phase 03 — Concealment and installation access

Status: **blocked; independent package committed and pushed, branch unmerged**. Branch: `eng/03-concealment`, from main `703268a`. Depends on E2's accepted candidate and reliable architectural/product envelopes. Read the [concealment contract](README.md#shared-comparison-and-concealment-contract), [routing proposals](../../docs/electrical-grid/routing.md), [sanctuary](../../docs/sanctuary-model.md), [timber specification](../../docs/beams-roof-connections/SPECIFICATION.md) and [art/reference status](../../docs/church-view-renderings.md).

[Branch evidence at a9e6515](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/a9e6515/docs/engineering/concealment.md). Baseline viewpoint evidence is complete; concealment and performance/access acceptance remain held. Apply the [central-view constraint](../../docs/engineering/central-view-constraint.md).

## Outcome

People attending inside or approaching outside cannot see the specified equipment, cable runs or boards from the agreed occupied viewpoints, while performance and service access remain adequate. Any unavoidable exception has an explicit engineer/parish decision. Model invisibility alone is not concealment.

## Inputs

E2 equipment envelopes/poses, selected product limits, performance results, preliminary air paths and circuit interfaces; current source geometry and unresolved void/mounting details. E1 viewpoint matrix covers seated/standing/shorter/wheelchair observers, sanctuary, choir, entrances and exterior approaches, including local-floor heights and field of view.

## Work packages, in order

1. **Inventory visibility and conflicts.** Map every installed-study light, speaker, microphone, fan, board, cable, connector, bracket, driver and proposed sensor/control face to hiding strategy and maintenance route. Include exterior lanterns, pendants/chandeliers, tower equipment, moving blades and furniture connections. Identify which existing decorative intent conflicts with the all-hidden brief. Do not quietly exempt microphone heads, decorative fittings or required visible emergency signs/devices.
2. **Compare physical details.** Study recesses, cornices, removable finish panels, furniture passages and suitable acoustic/airflow grilles using actual available space. Detail emitter/output position separately from the enclosure. Resolve L100 capital contact, roof/tie/rafter approaches, chamber voids and tower cornices against their owning open items. No structural drilling/notching or assumed cavity in a solid member; supports and access openings require discipline review.
3. **Prove visual coverage.** Check rays to equipment envelopes/surfaces, not just centres, and inspect actual full-building renders while equipment is on. Sample movement routes and head/eye ranges, side/upward/rearward views, open entrance/service doors during normal use, both relevant seating layouts, day/evening and exterior oblique approaches. Record visibility of apertures/grilles/cover seams separately from bodies. Disable inspection highlights for appearance evidence but keep physical systems present; also capture the inspection view showing their actual positions.
4. **Prove performance with concealment in place.** Compare the same unscreened and concealed configurations for beam cutoff/loss/glare/reflections, acoustic insertion loss/directivity/feedback, airflow free area/pressure/noise and driver/motor/rack heat dissipation. Recheck fan-blade travel, vibrations, clearances, moisture/rain/insect paths and fire/material compatibility. Missing optical/acoustic/airflow/thermal data is a hold, not an assumed transparent screen. Feed any position/product/setting change back through E2.
5. **Design service and operator access.** Show how each product can be isolated, cleaned, adjusted, removed and replaced, with tools, working space, lifting/access equipment and removable panel envelopes. Coordinate board/rack ventilation and access outside congregant views; concealment must not prevent local manual operation or emergency identification. Do not invent approved working clearances or mounting capacity.
6. **Resolve and record the trade-offs.** Give the engineer a viewpoint-specific conflict sheet with options, performance changes, visible extent, access/cost consequences and responsible designer. Unresolved conflicts block acceptance. Record the exact scope and authority of any approved exception; appearance acceptance does not approve engineering performance. Update geometry, collisions/occlusion, documents, routes and registers together.

Suggested commit boundaries: viewpoint/visibility inventory and evidence tooling; one coordinated concealment-detail family with its performance/access checks; resolved exceptions and accepted full-view matrix. Prefer readable geometry modules and preserve the offline viewer.

## Planned deliverables

- `docs/engineering/concealment.md`: item/detail/viewpoint matrix, support/void references, screen losses/thermal/access evidence and explicit exceptions or holds.
- Revisioned viewpoint coordinates, visibility results, desktop day/evening captures, detail sections and removal/access drawings under `review/`.
- Owning model/specification changes and refreshed affected plan/electrical/register outputs at the same revision.

## Checks and exit gate E3

- [ ] Every installed item and associated visible connection/support has an evidence-backed concealment treatment or an explicit, scoped engineer/parish exception; missing decisions keep E3 blocked.
- [ ] The agreed seated, standing, shorter, wheelchair, sanctuary, choir, entry and exterior view matrix is fully recorded, including routes between viewpoints and relevant lighting/seating modes.
- [ ] Visibility tests and full-model inspection agree; neither hidden objects nor simplified analysis masquerades as a physical enclosure/screen.
- [ ] Concealed performance still meets E2 criteria without material degradation beyond an agreed tolerance; before/after losses and any compensation are explicit. No blocked light/sound, starved airflow, uncontrolled heat or inaccessible item remains in accepted scope. Relevant specialist/product tests support those claims.
- [ ] Supports, service voids, movement/removal clearances, fire/weather protection and board/manual-control access have coordinated evidence; construction-critical uncertainties remain held rather than modeled as approved.
- [ ] Model, estimates, strict/full simulator, electrical and timber checks run where affected; actual browser views/console and saved-layout regression pass. Existing failures remain explicit.
- [ ] Required documents, matched exports, plans, category registers/summary, preservation checks and `git diff --check` reconcile to the accepted model.

## Risks and handover

The current wire-concealment study is useful input, not proof that all equipment can be hidden. If the brief is physically incompatible with a required function, present the specific trade-off and leave that decision pending. Do not conceal life-safety identification or sacrifice ventilation to satisfy appearance. On E3 acceptance, hand the exact envelopes, service/access zones and loss assumptions to E4 and E5; later route/control changes must preserve them.
