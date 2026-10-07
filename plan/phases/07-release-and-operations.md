# Phase 07 — Release, handover and long-term operation

Status: **not started**. Apply this phase before **each** public/private release, starting with public increment A. Depends on the feature gates for that increment, not on completion of all future phases. Read [quality/release requirements](../quality-and-release.md).

## Outcome

A release the parish can operate, update and recover without depending on one developer. Every launch identifies which features and engineering information it covers, who maintains them and how to undo a faulty publication.

## Inputs

Passing feature evidence, publication permission, explicit deployment authorization, owner-controlled hosting/domain/auth/storage accounts, release IDs, budget and named primary/backup operators. Before public GitHub publication, the source/history/license review is a separate required input.

## Work packages, in order

1. **Assemble the release record.** State included routes, excluded unfinished routes, code commit, public content revision, private engineering revision if applicable, checks/results, accessibility/device evidence, publication rights and unresolved engineering holds. Verify the exact deployment target/team/environment and production configuration. Never include credentials in the record.
2. **Rehearse on a representative preview.** Test every included journey, direct/deep links, failures and access roles with preview-safe data. If private features exist, exercise the full security matrix with synthetic protected canaries. Measure asset transfer and field-device behavior. Verify that a public-only release cannot accidentally reach unfinished private features.
3. **Prepare recovery.** Back up manifests/artifacts/configuration and document current/previous release pointers. Restore a copy in a separate safe environment. Rehearse code rollback, content-pointer rollback, broken model release, bad image removal and compromised-account revocation. Do not assume reverting code reverts separately stored data.
4. **Prepare ownership and cost controls.** Name the domain renewal/billing owner, backup administrator, content publisher, engineering release reviewer and incident contact. Estimate storage/egress/auth/function/image costs with measured typical and festival-traffic assumptions. Set agreed alerts/limits and response actions. Document export/migration paths so the project can move hosts/providers later.
5. **Deploy the authorized increment.** Confirm that approval covers the actual reviewed commit, content and environment. Use the documented production path; account for Vercel's Git auto-deployment policy. Check public URLs, private denial/access, HTTPS, metadata, freshness and core navigation after release. Record evidence and roll back if a release gate regresses.
6. **Train and hand over.** The parish publisher rehearses a dated update/correction; the backup operator rehearses recovery. Father receives a concise Vietnamese inspector guide when increment D launches. Explain reported versus checked dimensions, stale data and how to request a correction outside the app.
7. **Maintain the service.** Follow the agreed review rhythm for dependency security, access, backups, costs and model/data updates. Review evidence freshness after construction changes. Keep a dated change log and update this plan when a deferred feature becomes active. Evaluate real device performance and user feedback before adding heavier features.

Suggested commit boundaries: release/runbook templates; recovery and cost documentation; deployment configuration updates if required; post-launch evidence and operator guide. Deployment is a separately authorized action, not implied by a documentation commit.

## Planned deliverables

- `docs/web/releases/`: per-release evidence records without private content/secrets.
- `docs/web/operations.md`: owners/roles, publishing, backups, rollback, revocation, incident handling and costs; personal contact details belong in the private operations copy.
- `docs/web/user-guide-vi.md`: public/private/site tasks and limits for the delivered increment.
- A sanitized repository-publication checklist and license/attribution decision if GitHub publication is authorized later.

## Checks and exit gate G7

- [ ] Every included feature gate passes; deferred scope is inaccessible or clearly omitted from public navigation.
- [ ] The exact reviewed code/content is deployed only to the authorized target and verified after release.
- [ ] Public Git/history and public assets have cleared rights/privacy review before public repository publication; secrets are rotated if prior exposure is discovered.
- [ ] Private content, where delivered, remains protected across production URLs, previous deployments, direct assets and caches.
- [ ] Backup restore and both code/content rollback have been demonstrated; incomplete/mixed releases are rejected.
- [ ] Primary and backup operators can publish/recover; billing/domain custody and spending limits are recorded.
- [ ] Users see current revision/date, limitations and relevant engineering holds; no whole-building approval claim is implied.

## Risks and handover

If a security, wrong-object-data or accidental-write defect appears, disable the affected private route/data release and restore the last valid version; keep safe public information available. Handle an exposed photograph through asset/cache removal as well as page correction. Communicate the specific incident and recovery through the agreed owner process.

Completion of this phase closes one release, not maintenance forever. Record the next review and responsible role. Do not create automatic schedules or send messages merely because this plan describes an operating rhythm; those actions need their own authorization.
