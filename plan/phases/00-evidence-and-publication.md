# Phase 00 — Evidence and publication boundary

**Owner update, 8 October 2026:** showing our project work is now authorized with permanent development/not-for-construction notes. The [selected public scope](../../docs/web/publication-permission.md) supersedes earlier blanket permission holds for that scope. Full parish-operation/real-host checks remain open; historical evidence is unchanged.

Status: **independent preparation complete on an unmerged phase branch; G0 held**, 8 October 2026. The detailed evidence/checklist/handover is preserved at [`web/00-evidence`, commit `84edc9e`](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/84edc9e/plan/phases/00-evidence-and-publication.md). Actual public asset/model permissions and named parish publication owners remain missing. Phase 01 may perform the independent local fixture/framework work permitted by package 6 below. Read the [roadmap](../README.md), [data contracts](../data-and-publication.md) and [decision register](../decisions-and-sources.md).

## Outcome

A checked starting point for web delivery: what is built/reported/planned, which material can be public, what belongs behind authentication, and who can publish or approve each class of information. Start collecting the Father's inspection data now because construction is underway.

## Inputs

- Existing model, source drawings, dimension workbook, reference manifests, category Excel registers and simulator limitations.
- Owner-confirmed February 2026 start and foundation completion as of 7 October; no exact completion date assumed.
- Parish content contact, source permissions, proposed device/network, hosting owner and budget. Obtain only the missing input required for the next deliverable.

## Work packages, in order

1. **Inventory the current source revision.** Record Git commit, dirty work belonging to others, asset sizes, model initialization dependencies, browser globals, mutation/persistence paths and existing test results. Measure actual initial requests and a representative navigation path; keep file-directory size separate from transferred payload. Record engineering baseline failures without weakening tests.
2. **Classify publication.** Inventory documents, photographs, renders, model profiles, identifiers and source history. Give each an owner, provenance, visibility (`public`, `invited-review`, `site-manager`, `unpublished`) and permission status. Default uncertain material to unpublished. Review Git history before any future public-repository conversion; propose a migration rather than deleting or rewriting it automatically.
3. **Establish content facts.** Draft church introduction and a minimal timeline with partial/as-of dates. Identify real site photos separately from concept/reference art. Record image permissions and exact source before selecting launch media. Name a parish reviewer and a maintainer who can publish outside the app.
4. **Define release contracts.** Specify schemas and fixtures for release envelopes, public media/events, protected documents, equipment/routes and semantic object records. Include missing/conflicting values, stale data and retired IDs. Decide how the canonical source revision produces both public and private profiles.
5. **Inventory the construction inspector.** With the site team, choose one next-work package and its applicable drawings. Sample a member, opening, equipment mounting and electrical route when available. List missing stable IDs, dimension endpoints, source approvals and verified site measurements. Do not infer the completed foundation's dimensions from completion status.
6. **Resolve enabling choices.** Confirm language reviewer, auth/storage cost constraints, hosting/domain custody, source licenses and target device. Record the decision or its blocking scope. Local schema/content/viewer prototypes can continue with safe fixtures while those choices are pending.

Commit the inventory/classification, contracts/fixtures and measured baseline as separate verified logical changes. Keep private inventories/evidence in an approved private location; the public repository receives only sanitized summaries and safe fixtures.

## Planned deliverables

- `docs/web/baseline.md`: current implementation, actual payload/device measurements, tests and limitations.
- A publication inventory with visibility, permission, owner and source revision; restricted details stored privately.
- `docs/web/content-workflow.md`: contributors, review, publication, correction and removal responsibilities.
- Proposed schemas under `web/src/lib/contracts/` once phase 01 introduces the package; before that, document contracts without installing a framework.
- A source/evidence matrix for the phase 06 pilot, and updated decisions in `plan/decisions-and-sources.md`.

## Checks and exit gate G0

- [ ] Every launch asset has an explicit visibility and rights decision; private originals cannot enter public fixtures.
- [ ] Timeline preserves month/as-of precision and distinguishes reported progress from verified work.
- [ ] The source inventory identifies editable legacy paths and required read-only boundaries.
- [ ] Representative object/equipment/route references resolve to the owning source; missing information is explicit.
- [ ] Device/network baseline and relevant existing checks are recorded with revisions and unresolved failures.
- [ ] Named owners exist for publication and launch decisions, or dependent cloud/publication work remains held.

## Risks and handover

If source permissions or engineering evidence are incomplete, release only cleared material and keep unsupported objects on hold. A lack of photo rights does not block framework work using synthetic fixtures. No source migration, license selection, public GitHub publication or cloud purchase is silently authorized by completing an inventory.

Record the [standard handover](../README.md) and the next ready package in phase 01. G0 can approve a limited public profile while other evidence remains private; its scope must be explicit.
