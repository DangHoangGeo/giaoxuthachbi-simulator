# Church web app roadmap

Planning baseline: **7 October 2026**. Execution update: **8 October 2026 — local phase-01 foundation verified**. Phase 00 preparation is pushed and unmerged at [`84edc9e`](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/tree/84edc9e); real publication rights/owners remain held. No cloud account or deployment is created. Read [AGENTS.md](../AGENTS.md) before executing any phase.

**Execution priority, 8 October 2026:** the [building-systems engineering roadmap](engineering/README.md) comes first. Its six phases cover the baseline, joint light/sound/microphone/dynamic-air optimisation, concealment, routes, boards/controls and coordinated registers/handover. The engineer approved execution on 8 October 2026. Then follow the web order below, applying phase 07 before each launch. If engineering work is blocked on external input, its roadmap defines which independent packages can continue without treating an unfinished design as approved.

Build a welcoming public account of Thạch Bi Church and its ongoing construction, a lightweight virtual visit, and reliable private tools for reviewing the design and inspecting construction information. Protect the community's limited time and resources by delivering useful parts early and keeping engineering evidence visible.

**Usage update, 8 October 2026:** the engineer confirmed desktop-only use and no phone UI/UX testing. Apply the desktop acceptance scope in [quality gates](quality-and-release.md); retain accessibility, network fallback and read-only/data protections.

## Confirmed brief

- Construction began in **February 2026**; the foundation is finished and construction is underway, as reported by the owner on 7 October 2026. Exact start day, foundation completion date and verified as-built geometry are not supplied.
- The public site introduces the church, shows labeled design artwork and real site photographs, and provides a dated construction timeline.
- The public 3D visit is lighter than the existing simulator. Its atmosphere follows the visitor's local time, with a manual day/night override.
- Password-protected views expose advanced analysis, simulations and project documents/data. **The published web app cannot edit project data or operate physical equipment.**
- A later view helps Father, as project manager, find upcoming work and inspect layers, layouts, positions, dimensions and specifications by object.
- Existing priorities continue: coordinate lights, sound and fans, then electrical routes, boards and manual/quick modes. A website launch must not be mistaken for resolution of the engineering holds.

## Recommended implementation

Use **Next.js App Router with TypeScript**, in a future `web/` directory, deployed on Vercel. Keep the offline viewer working. Publish versioned, deliberately selected data and model assets into the web app; do not copy the entire working repository into a public directory. See the [architecture decision](architecture.md).

Start with reviewed files and a maintainer publishing workflow. Use invited individual password accounts for private readers; the proposed managed provider is Clerk, subject to the cost/ownership gate. A shared church password is not the default because individual access needs to be revoked independently. No content editor, drawing editor or construction-status editor is planned inside the app.

## Roadmap and dependencies

Phase 00 independent preparation is complete on its unmerged branch; its publication gate remains held. Phase 01 has passed its local foundation gate using the independent work permitted by phase 00 package 6; cloud setup remains pending. Phase 02 local content/gallery preparation is in progress; parish wording/media review remains held. Phases 03–07 remain not started. Effort depends on available photographs, source reconciliation and desktop measurements; there are no promised calendar completion dates.

| Phase | Outcome | Depends on | Release gate |
| --- | --- | --- | --- |
| [00 — Evidence and publication boundary](phases/00-evidence-and-publication.md) | Approved scope of public material, source inventory, construction baseline and open decisions | Existing repository and owner/site input | G0: public/private classification and named owners |
| [01 — Framework and delivery foundation](phases/01-framework-and-delivery.md) | Reproducible Next.js shell, route boundaries, CI and Vercel preview setup | 00 | G1: deployable shell with safe sample data |
| [02 — Church homepage and gallery](phases/02-homepage-and-gallery.md) | Vietnamese-first introduction, design gallery and real construction photos | 01; cleared content from 00 | G2: parish content and accessibility review |
| [03 — Construction timeline](phases/03-construction-timeline.md) | Honest dated progress, photo publication workflow and freshness indicators | 02; evidence/media contracts | G3: publication, correction and stale-data tests |
| [04 — Lightweight virtual visit](phases/04-lightweight-visit.md) | Desktop walk/orbit experience and local-time atmosphere | 01; public model approval from 00 | G4: performance, visual and read-only tests |
| [05 — Protected engineering review](phases/05-protected-review.md) | Invited password access to immutable scenarios, documents and system maps | 01; release contracts from 00; viewer isolation proven in 04 | G5: security and calculation-parity tests |
| [06 — Father's construction inspector](phases/06-construction-inspector.md) | Layer/layout navigation, source-backed object inspection and upcoming work | 05; site evidence and object registry pilot | G6: site-user trial and traceability acceptance |
| [07 — Release and long-term operation](phases/07-release-and-operations.md) | Controlled launch, backups, rollback, maintenance and handover | Relevant feature gates | G7: repeat for each release below |

Suggested execution order is 00 → 01 → 02 → 03 → 04 → 05 → 06. Apply phase 07 **before each public or private launch**, not only at the end. Phase 04 can proceed after 01 if content collection is delayed. Gather the phase 06 object/site evidence during phase 00 because construction is already underway; do not delay urgent engineering coordination until the inspector is built.

| Increment | Minimum scope | Must pass |
| --- | --- | --- |
| A: public construction story | Homepage, gallery, timeline; no advertised unfinished routes | G0–G3 and the relevant G7 checks |
| B: virtual visit | Increment A plus lightweight 3D and accessible fallback | G4 and repeat G7 |
| C: invited technical review | Protected analysis and documentation, independent of public rendering | G5 and repeat G7 |
| D: site pilot, then expansion | Father's inspector for one checked work package, then verified packages | G6 and repeat G7 |

## Product routes and access

Proposed routes use `/[locale]`, with `vi` and `en`. `/` initially redirects to `/vi`; a visible language switch preserves the equivalent page. Parish-reviewed Vietnamese is the launch priority. Do not invent English translations of technical terms or publish unreviewed historical claims.

| Route after locale | Audience | Behavior |
| --- | --- | --- |
| `/` | Everyone | Church story, construction status, latest update and entry to the visit |
| `/design` | Everyone | Clearly distinguish concepts, model renders and real site photos |
| `/progress` and `/progress/[eventId]` | Everyone | Timeline and stable links to published evidence |
| `/visit` | Everyone | Walk/orbit, viewpoints, day/night; no engineering editor |
| `/sign-in` | Invited users | Password sign-in/recovery through the chosen provider |
| `/review` | Reviewer or site manager | Published release, scenarios, limitations and unresolved findings |
| `/review/simulator`, `/review/electrical`, `/review/documents` | Reviewer or site manager | Read-only analysis, coordinated 2D/3D routes and authorized records |
| `/site` and `/site/objects/[objectId]` | Site manager (including Father) | Upcoming work, layer/layout inspector and stable object links |

Private assets and data endpoints have the same authorization as their pages. A page password does not protect an unguarded file URL. Site-manager accounts include review access; reviewer accounts do not automatically include site-management information. Public visitors need no account.

## Shared contracts and execution instructions

Read [architecture](architecture.md), [data and publication](data-and-publication.md), [quality gates](quality-and-release.md), and [decisions and sources](decisions-and-sources.md), then the phase file. Proposed output paths in these documents are future deliverables, not existing commands or features.

1. Check current Git status, the phase dependencies and the exact source revision. Reconfirm provider APIs and supported versions when implementing.
2. Select one numbered work package from the phase. Record acceptance evidence and unresolved inputs. Use fixtures while content is missing; keep fixtures out of production.
3. Implement the smallest complete change with its documentation. Any model/equipment/route change also follows the existing model/document and Excel synchronization rules.
4. Run relevant checks, inspect the result and make a small local commit. Do not declare a phase complete because its UI exists; meet its exit criteria.
5. Update the phase status with commit hashes, tests, preview evidence where authorized, remaining holds and the next package. An implementation request does not by itself authorize paid services, making the repository public or production deployment.

The engineer's 8 October instruction authorizes Git pushes on phase branches and main. Follow the [shared branch, commit, delegation and handover workflow](engineering/README.md#execution-delegation-and-handover): branch each phase from current main, push verified commits, merge/push only after its exit gate passes, give a short handover and start the next ready phase without waiting. Leave blocked phases unmerged and proceed only with independent work. Do not force-push or rewrite shared history. This Git authorization does not resolve the specific publication, account/cost or production-release decisions above.

Use this handover record in the completed phase: `status; source/model/data revisions; commit hashes; checks and results; visual/device evidence; unresolved items with owner; next package`. Keep this roadmap current when a dependency or scope changes.

## Scope boundaries

This plan does not add live cameras, site sensors, donations, public comments, in-app editing, automatic engineering approval, physical light/fan/audio control, or augmented-reality site alignment. Those require separate briefs. “Real time” initially means the latest **published** information with its capture and publication dates, not a continuous verified feed from the building.
