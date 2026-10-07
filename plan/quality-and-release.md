# Quality gates and release evidence

These are planned acceptance criteria, not passing results. Return to the [roadmap](README.md). Each phase must record the exact commit, release IDs, test environment and outcome. Follow [AGENTS.md](../AGENTS.md) for tests, documentation synchronization and small commits.

## Performance and usability budgets

The following are initial project budgets. Phase 00 must identify one modest Android phone, an iPhone/iPad available to Father and a desktop browser, record OS/GPU/browser versions, and measure real devices as well as repeatable lab profiles. Use a provisional cold-cache lab network of 10 Mbps downstream, 1 Mbps upstream and 100 ms RTT, plus a 1 Mbps failure/fallback check. Revise budgets only with recorded measurements and a reason.

| Surface | Proposed acceptance |
| --- | --- |
| Public content | Core Web Vitals target at the 75th percentile when field data exists: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1; before launch, repeated lab traces and interaction tests are provisional evidence |
| Home/gallery first view | ≤1.5 MB transferred before interaction on the baseline viewport; responsive images; no 3D, simulator or private-data chunk loaded |
| Initial non-3D JavaScript | ≤200 KB compressed app/vendor transfer per initial public route, measured with production build and cache disabled |
| Public visit | Explicit “Enter 3D” loads ≤10 MB compressed initial scene/assets; remaining optional detail on demand; interactive within 12 s on the baseline network/device |
| 3D motion | 95th-percentile frame time ≤33 ms during a fixed 60-second navigation path on the baseline phone; record stalls, GPU context loss and thermal behavior in a 10-minute session |
| 3D fallback | Low-quality mode, cancel/retry and an immediate static gallery/2D alternative; WebGL failure must not block the rest of the site |
| Private object lookup | A visible loading state immediately; selected object's already-loaded card updates within 300 ms, otherwise a network status appears; measured private fetch target ≤2 s under baseline conditions |
| Published updates | Active online client notices an origin-published update within two minutes in the controlled test; last successful check/capture/publication times remain distinguishable |

Web Vitals thresholds come from [web.dev](https://web.dev/articles/vitals); download, frame-time and lookup budgets are project proposals, not engineering standards. Test the actual phone rather than assuming desktop emulation predicts GPU performance. Do not reduce analytical geometry or move emitters to meet rendering budgets.

Target [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) for content and controls. Test keyboard navigation, focus, screen-reader names/status, text resizing, contrast, reflow, reduced motion and sign-in. Provide a meaningful text/2D alternative to the spatial viewer. Target 44 CSS px touch controls for site use as a project usability preference. Automated accessibility scans alone do not establish conformance.

## Required verification matrix

| Risk | Test/evidence required before release |
| --- | --- |
| Broken public journeys | Home → design → progress event → visit, deep links, refresh, unknown routes, language switch, slow images and no-JavaScript reading of public text |
| Invented/misleading progress | Partial dates, date ranges, publication after capture, equal dates, corrections, missing photo, old update, withdrawn media and no percentage without an agreed quantity basis |
| Day/night confusion | Fixed clock/timezone tests around 06:00 and 18:00, midnight, DST transitions, timezone change, manual override and unavailable timezone; atmosphere never changes analytical inputs |
| Private content leaks | Anonymous/revoked/wrong-role requests to page HTML, RSC/prefetch payloads, APIs, direct files, thumbnails, range/HEAD requests and old deployment URLs; inspect build output, public bundles and source maps |
| Cache crossover | Anonymous request after authorized request, two roles/accounts, logout/back/refresh, CDN/framework/browser caches and protected image delivery; responses cannot replay another user's private payload |
| Broken read-only promise | No editor/import/save/upload/status-write endpoints; mutation API unavailable; old localStorage cannot restore edits; project checksums unchanged after every permitted interaction |
| Broken identity/geometry | Unique IDs, complete object/instance mapping for supported scope, consistent 2D/3D coordinates/endpoints, mirrored-axis fixture, retired-ID handling, missing-source and conflicting-dimension display |
| Stale/mixed release | Model A + registry B rejected; missing/checksum-invalid asset rejected; client refresh pins a complete revision; pointer rollback restores a compatible complete set |
| Wrong simulation | Approved published scenario fixtures equal the offline calculation results within declared numerical tolerances; failures/limitations still visible; no web-specific threshold relaxation |
| Poor viewer lifecycle | Repeat mount/unmount and route switching, dispose geometries/textures/workers/listeners/audio, no duplicate render loops, context loss and background/resume behavior |
| Unsafe content handling | Untrusted captions/Markdown cannot run scripts; media type/size validation, bounded asset lookup, traversal/URL injection checks, exact allowed image origins and sensible security headers |
| Recovery and continuity | Missing content store/auth provider, invalid release, network loss, cost limit, rollback, account revocation and backup restore rehearsals |

Use Vitest (or an equivalent established test runner) for contracts, dates and pure adapter functions; Playwright for browser and authorization journeys; accessibility automation plus manual checks; production bundle reports and device traces for performance. These are planned tools, not installed dependencies or runnable commands today.

For implementation, establish `web/` scripts for lint, type checking, unit tests, production build and browser checks, then document their exact commands. Keep secrets out of output and browser recordings. Use synthetic private documents in CI; security evidence must not leak actual protected content.

## Existing engineering verification

When affected, run the owning repository checks as well as new web tests:

```sh
node scripts/verify_model.cjs
node scripts/verify_estimates.cjs
node scripts/verify_simulator.cjs --report --estimates
node scripts/verify_simulator.cjs --electrical
python3 docs/beams-roof-connections/validate.py
```

Use `node scripts/verify_simulator.cjs` before claiming the strict design targets pass. Its documented baseline contains unresolved failures. The 7 October documentation records low ambo/altar feedback margins, wing speech-clarity shortfall and other lighting/ventilation limitations. Display those alongside results. A web port must not convert a “calculation audit passed” into “design approved.”

Follow the [Excel workflow](../docs/electrical-grid/register.md) for affected equipment/line changes and its preservation tests. A read-only export with no model changes needs source/release consistency checks, not invented new engineering results. Documentation-only work checks links, paths, facts, formatting and diffs instead of rerunning unrelated simulations.

## Release gate record

Each launch needs a record with scope/routes, owner, code commit, content/model release IDs, checks and exceptions, test accounts/roles, device evidence, publication rights, known engineering holds, production target/environment, backup and rollback reference. Mark each check passed/failed/not applicable with a reason. No unresolved authorization leak, accidental write, wrong-object dimension or mixed-release display may be accepted as a launch exception.

A public-only release may proceed while private capabilities remain disabled and inaccessible. The private viewer may open for design review with conspicuous engineering holds; a construction-use claim requires the responsible discipline's authorization for the particular information. Do not use a generic green badge or overall “quality percentage” to imply whole-building approval.

## Operation over years

Name an owner and backup for content, engineering releases, accounts, hosting/domain billing and incident response. Proposed rhythm: review failed publications and actionable errors when notified; check backups and account access monthly; review dependencies and costs monthly; rehearse restore and staff handover quarterly; review the inspection dataset whenever site work changes. The owner may adjust these intervals to local capacity.

Track actual storage, media egress, image transformations, function usage and auth costs. Estimate normal days and festival traffic before selecting a paid plan; do not promise free hosting indefinitely. Prefer pre-generated image sizes, explicit model loading, public CDN caching and conditional timeline fetches. Private material remains protected even when caching would be cheaper.

Back up source evidence, immutable releases, manifests and identity/access configuration separately from deployment artifacts. Keep checksums and an offline copy accessible to the responsible maintainer. A hosting rollback does not automatically roll back an external content pointer, revoke a user or erase a published photograph; the runbook must handle each separately.
