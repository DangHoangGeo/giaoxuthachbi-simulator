# Phase 05 — Protected engineering review

Status: **retired by owner decision, 10 October 2026.** The owner no longer needs a private version; the shared-password preview and its code were removed and the public visit serves the project's own viewer ([access control](../../docs/web/access-control.md), [viewer](../../docs/web/viewer.md)). The plan below is kept for reference should a private feature be wanted again. Earlier status: **in progress; full G5 remains open**. The owner requested a shared-password full-detail architectural preview on 8 October 2026; see [scope and access controls](../../docs/web/access-control.md). [The scoped preview is deployed and verified](../../review/web-private-review-2026-10-08/delivery.md). This is an explicit scoped exception to the individual-account proposal, not completion of the engineering-review workspace. Depends on phase 01, phase 00 release contracts and phase 04's proven viewer isolation. Read [architecture](../architecture.md), [data contracts](../data-and-publication.md) and the [security/quality matrix](../quality-and-release.md).

## Outcome

Invited reviewers and the site manager sign in with individual passwords to inspect published model scenarios, calculation results, documents, Excel-derived tables and electrical layouts. They cannot modify project records in the web app.

## Inputs

Chosen provider and authorized account ownership/budget; invitation/role list managed privately; separate safe preview environment; immutable engineering release with source revisions; category registers and documented calculation limitations. Resolve provider decisions before implementing provider-specific flows.

## Work packages, in order

1. **Implement sign-in and access.** Configure invite-only password access with the selected maintained provider, recovery, logout and administrator revocation outside the app. Use exact callback origins, secure sessions and shared abuse protection. Record idle/absolute session limits and maximum effective revocation delay. No open registration, default credentials, client-side password comparison or home-made token system.
2. **Enforce authorization at data reads.** Create a central server-only session/role/resource check for `/review`, `/site` and every protected endpoint. A reviewer can read review resources; a site manager can also read site packages. Resource IDs resolve through an allowlist with classification and release ID. Unknown/unauthorized resources return safe responses without revealing private names. Auth outage denies protected access.
3. **Deliver protected assets.** Retrieve private documents, images, model data and thumbnails through authenticated endpoints with no shared caching. Validate MIME type, size and disposition. Test range, conditional and HEAD requests; every path checks authorization before returning bytes or metadata. Do not send raw store credentials to the browser or pass private thumbnails to a shared public image optimizer.
4. **Build the release/document workspace.** Show source date/revision, current versus superseded state, evidence status and engineering holds. Index only documents the user can access. Convert Excel content to validated read-only tables retaining units/category/IDs; downloadable approved files may be allowed by resource policy. Downloading a permitted copy does not grant web editing, and downloaded files cannot be revoked remotely.
5. **Add read-only analysis.** Load isolated engine/math modules or generated results through the private profile. Start with published result tables; add on-device recalculation in a worker only after parity tests pass. Let readers choose published scenarios, layers, measurement points and overlays. Keep free-form parameter/layout edits, imports, saving, custom scene creation and hardware commands absent. Simulated quick modes display recorded settings and unresolved control limitations.
6. **Coordinate electrical views.** Show usage-category equipment/line/route-point tables, IDs, endpoints, geometric lengths, specification status and main/sub-board relationships. The 2D map and 3D overlay share vertices and selection. Link objects to their register row/source and the current summary; do not invent a construction-ready single-line diagram or physical channel mapping.
7. **Exercise access failure and persistence.** Test valid/expired/revoked users, wrong roles, auth-provider failure and logout/back-navigation. Clear private view/worker state on logout and do not persist protected project data offline. Test a preloaded legacy layout and tampered role/resource identifiers. Verify checksums of project records before/after all allowed interactions.

Suggested commit boundaries: identity/access enforcement and tests; private asset delivery; release/documents viewer; analysis parity/adapters; electrical coordination; operational security evidence and runbook.

## Planned deliverables

- `/sign-in`, `/review` and its simulator/electrical/documents routes.
- Server-only permission and private-asset access modules with route/security tests.
- Immutable scenario manifests, generated authorized document/table views and worker parity tests if used.
- `docs/web/access-control.md`: invite/revoke/recovery, sessions, role/resource policy and incident steps; no credentials in the document.

## Checks and exit gate G5

- [ ] Anonymous, expired, revoked and wrong-role users cannot read protected pages, RSC/API responses, documents, thumbnails, worker inputs or old deployment URLs.
- [ ] Cache tests show no private response shared across users/roles or replayed to anonymous clients.
- [ ] Public bundles/build artifacts/source maps contain no restricted canary, record or storage credential.
- [ ] No project-write API/action exists; hidden controls, console calls and old localStorage cannot mutate or restore project data.
- [ ] Published scenario results match the offline implementation within documented tolerances; existing design failures remain visible.
- [ ] All displayed equipment/line IDs and route lengths match their release's category registers and 2D/3D geometry.
- [ ] Missing or mixed-revision inputs fail explicitly; screenshots/exports identify revision and estimate status.
- [ ] An invited reviewer can recover access and an administrator can revoke it within the recorded policy.

## Risks and handover

Passwords protect only assets kept out of public Git/history and public delivery. Anything deliberately released publicly remains public. If full engine isolation is not ready, a secure read-only results/documents release may be useful, but mark the advanced simulator phase scope incomplete. Prepare increment C for phase 07 and pass the permission/release/object interfaces to phase 06.
