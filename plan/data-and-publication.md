# Data, evidence and publication contracts

Status: schema requirements for later implementation, not new live records. Return to the [roadmap](README.md). Define and validate these contracts in phase 00/01 before building dependent screens.

## Ownership and source authority

| Information | Owning source | Web representation |
| --- | --- | --- |
| Story and progress | Owner/parish-approved text and dated site evidence | Reviewed public content and timeline |
| Architectural dimensions | Original drawings, [dimension register](../docs/layout_design/Thach_Bi_Church_Dimensions.xlsx), reconciled survey and responsible designer's decisions | Source-backed object properties with explicit status |
| Geometry and views | Coordinated offline model and its documented revision | Generated public/private release assets |
| Equipment, lines and route points | [Category registers](../docs/electrical-grid/categories/README.md), coordinated model and [refresh workflow](../docs/electrical-grid/register.md) | Generated immutable tables/overlays retaining the same IDs |
| Calculation methods/results | [Simulator methods](../docs/simulator/methods-and-limitations.md), versioned inputs and executed checks | Published scenarios, results, limitations and failed targets |
| Manual boards and quick modes | [Control brief](../docs/electrical-grid/controls.md) and approved mapping when available | Read-only diagrams and scenario previews |
| Upcoming work and completion | Dated work packages maintained by site manager/responsible engineers outside the app | Published dependencies/status with evidence links |

Do not create an independently editable web inventory. Existing spreadsheets retain their discipline ownership and editable engineering fields. Register refreshes must preserve entered specifications and retired IDs. A release fails validation when equipment/route references or coordinate revisions disagree; show the previous complete release until reconciliation is finished.

## Release envelope

Each immutable release needs `releaseId`, `schemaVersion`, source Git commit, `modelRevision`, layout/scenario revision, export-tool version, units, coordinate frame/transform, creation and publication timestamps, responsible publisher, visibility, content checksums and asset/resource IDs. Store a separate approval/evidence status, not an ambiguous `approved: true`.

An authoritative server-side pointer identifies the current release. Every request involved in one inspection is pinned to that release, including model, object registry, drawings, schedules and results. Upload and validate all artifacts before switching the pointer. Keep previous compatible releases for rollback. If a new release appears during a session, offer a refresh; never silently combine old geometry and new dimensions.

Public and private manifests have different schemas/allowlists. Public metadata must not reveal private storage paths, unpublished event names, private staff details or document listings. Keep model/design releases distinct from construction-content releases, which may update more often; an event can reference a design release without claiming that design is as-built.

## Object and dimension registry

The existing equipment/route IDs remain unchanged. Introduce structural/architectural IDs only after an inventory; do not use array indexes or display names as permanent IDs. Existing timber IDs must be reused where present. Keep a retirement/alias record when a member is split, replaced or renamed; never silently reuse an ID.

| Record | Minimum fields and behavior |
| --- | --- |
| Identity | Object ID, type, Vietnamese/English label, discipline, layer, level, zone/grid, parent/assembly, model/instance selector and release ID |
| Position | X/Y/Z in metres in the repository frame; reference point (center, insertion point, end or mounting point), rotation convention, mounting/finish datum and source |
| Dimension | Named dimension, value or `null`, unit, direction, explicit endpoints/basis, tolerance if established, source reference and evidence status |
| Specification | Material/product/finish, selected versus provisional status, manufacturer/source revision where available; discipline-specific fields from the owning register |
| Evidence | File/document ID, printed sheet/page or workbook cell, revision/date, source type, reviewer/role, review date, conflicts and open-item IDs |
| Construction | Work-package ID, planned/reported/verified status, evidence date, installation or inspection references and dependencies |
| Geometry mapping | Model-to-registry mapping and export transform; route/line endpoint relationships when applicable |

Use the existing model frame: +X entrance axis 1 toward sanctuary, +Y up from nave finished floor, −Z toward B and +Z toward H. Display a plain legend in plans. Distinguish centerline, exterior dimension, clear opening, finish level and bearing elevation. A rendered bounding box is not a drawing dimension; an arbitrary picked-point distance is labeled **model-derived** and cannot replace a checked dimension.

Allow separate values for design, model transcription and verified as-built evidence. Show unresolved disagreements together and prevent the inspector from presenting one as a settled construction value. Use the evidence vocabulary in [AGENTS.md](../AGENTS.md): `USER CONFIRMED`, `DRAWING SHOWN`, `MODEL TRANSCRIPTION`, `DERIVED`, `CONCEPT`, `ENGINEERING HOLD`, plus explicit surveyed/engineer-approved evidence where available. Owner-reported completion alone does not approve structural adequacy or establish as-built dimensions.

Unknown widths, heights, lengths, specifications, tolerances and dates stay `null`/pending. Display appropriate precision based on the source. Never round an uncertain mesh measurement into a seemingly exact installation instruction.

## Equipment and electrical data

Preserve the same six usage categories in the protected UI and exports: lighting, sound, air, exit signs, decoration, distribution/controls. Each category exposes the same Equipment / Electrical Lines / Route Points structure. Shared boards are referenced once; route vertices carry their owning line ID and sequence.

Every line preserves ID, category, usage (power/signal/control), endpoints, ordered 3D vertices, length method, geometric length, separate allowance/installed length when established, cable/specification status and source revision. Derive the 2D projection and 3D route from those same vertices. Missing cable sizes and control channels remain pending. Passive speaker ratings are not mains power; connected rating is not operating energy. Show the current [summary report](../docs/electrical-grid/summary-report.md) with its date and completeness rather than retyping totals into web pages.

## Photographs, artwork and timeline events

| Record | Required fields |
| --- | --- |
| Media | Stable media ID; `site-photo`, `design-render`, `concept-art` or `reference`; original private source reference; publication-safe derivative paths and dimensions; checksum; photographer/creator; attribution/license/permission status; caption and alt text; capture date with precision/timezone; privacy review and reviewer |
| Event | Stable event ID and slug; title/body; phase/work-package reference; occurrence date or interval plus precision; status/evidence source; linked media IDs; reporter/reviewer; `publishedAt`, `updatedAt`, visibility and correction history |
| Work package | Stable ID; scope/zone and object IDs; prerequisite packages; planned sequence and dates if agreed; reported/verified completion; engineer/site review holds; responsible role and evidence references |

Store actual instants with offsets/UTC when known. Store month-only dates as month precision, not an invented midnight/day. Church construction dates display in `Asia/Ho_Chi_Minh`; visitor-local time affects 3D atmosphere, not the historical date of a site event.

Initial admissible facts: construction started in **2026-02** (month precision); foundation reported complete **as of 2026-10-07**, exact completion date unknown; construction reported ongoing as of that date. Do not label 7 October as the foundation completion day. Do not invent a completion percentage, planned opening date, photograph or event between those facts.

No verified publication-ready site-photo timeline was identified in this planning review. Existing reference photos and generated concepts must retain their recorded category until actual site provenance is confirmed. Obtain images from the owner/parish through an authorized source; do not scrape Facebook or hotlink it as a permanent content backend.

## Publishing workflow outside the app

1. A designated parish contributor provides originals and a short dated account through an agreed private channel. Preserve originals with restricted access; record who supplied them.
2. The content maintainer checks capture date/precision, location/context, consent/privacy, rights and attribution. Crop/redact publication copies where needed; remove unnecessary EXIF/GPS metadata. Public content avoids private phone numbers, personal documents and identifiable vulnerable people without appropriate permission.
3. Produce responsive derivatives and bilingual captions; validate event/media references and distinguish designs from actual construction. Review the exact preview before publication.
4. Publish an immutable content version using a reviewed maintainer script/PR. For the first release, a repository manifest plus deployment is sufficient. No photo-upload or edit UI is added to the church app.
5. When update frequency justifies it, move the same contract to object storage or a separate editorial system. A signed, replay-protected publishing webhook can invalidate public content caches after validation. Publish only complete versions and retain correction history.
6. Visitors fetch the latest published manifest. A visible tab may poll at a provisional 60-second interval with conditional requests/backoff; pause while hidden/offline. Preserve the current image/scroll position and announce new updates accessibly. A fetch error keeps the last successful version labeled with its timestamp.

“Latest published update” and “photographed on” must both be visible. Do not call a delayed photo live. Initial target: once an approved version is available at the origin, an online active visitor sees its update indication within two minutes under the agreed test network. Contributor delay, review time and initial Git build/deploy time are shown separately and have no promised SLA. No continuous camera feed or streaming infrastructure is required for this version.

Correct or retract an event by an explicit published revision. Keep its stable link and an appropriate correction notice. Privacy removals also purge derived public assets/CDN entries through the maintainer process; retaining audit evidence does not require retaining sensitive images publicly.
