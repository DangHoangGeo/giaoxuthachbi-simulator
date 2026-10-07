# Decisions, missing inputs and sources

Reviewed 7 October 2026. Return to the [roadmap](README.md). This register distinguishes user requirements from proposed implementation choices. Unresolved inputs block only the dependent deliverable.

## Decision register

| ID | Decision/status | Reason or next action |
| --- | --- | --- |
| D01 | Confirmed: February 2026 start, foundation finished, ongoing construction | Owner's update; exact milestone dates and verified as-built evidence still needed |
| D02 | Confirmed: public story, artwork/site photos, timeline and light 3D visit | Deliver public increments without waiting for the full simulator port |
| D03 | Confirmed: protected technical views and future Father's inspector are read-only | Camera/layers/published scenarios may change locally; project inputs/status may not |
| D04 | Recommended: Next.js App Router + TypeScript in `web/` on Vercel | One public/private application; pin supported versions during phase 01 |
| D05 | Proposed: Vietnamese default, English secondary | Parish language and community review; translations require human review |
| D06 | Proposed: Clerk invited password accounts, reviewer and site-manager grants | Confirm cost, production features, account ownership and recovery before phase 05; alternative documented in architecture |
| D07 | Proposed: public/private object stores with immutable releases | No private originals in public Git, static output or public asset URLs |
| D08 | Proposed: maintainer-reviewed manifests first; external publishing integration later | Enables frequent progress without an in-app editor or immediate CMS dependency |
| D09 | Proposed: local 06:00–18:00 daytime atmosphere, manual Auto/Day/Night | Predictable no-location-permission behavior; aesthetic mode, not astronomical daylight analysis |
| D10 | Proposed: pilot one checked work package for Father before whole-building coverage | Prevents incomplete object semantics being presented as complete construction information |
| D11 | Open: project/source licenses and public repository scope | Owner/source-rights review before public GitHub release; existing mixed-provenance assets cannot be relicensed by assumption |
| D12 | Open: named operators, account/domain ownership and recurring budget | Needed before provisioning/launch; prototype work can use safe local fixtures |

## Inputs to obtain at the relevant phase

| Needed input | Responsible person/role to identify | Needed by | Safe work while absent |
| --- | --- | --- | --- |
| Parish-approved name/history/contact/public links and language review | Owner/parish representative | 02 content acceptance | Use existing story as a labeled draft; no invented Mass schedule or contact details |
| Site photographs, capture dates, permission and contributor channel | Parish photographer/content maintainer | 02 gallery and 03 media launch | Build with synthetic fixtures; publish factual text only if approved |
| Exact site milestones and next planned work packages | Father/site manager | 03 richer timeline and 06 pilot | Preserve month/as-of facts without fabricated dates or completion percentages |
| Drawing revisions, dimension conflicts, survey checks and permitted publication | Responsible designer/site engineer | 00 classification, 06 checked dimensions | Provide source inventory and explicit pending fields |
| Public/private classification for each source/model profile | Owner and responsible source owners | G0 and before public publishing | Keep unpublished evidence restricted; generate synthetic public test data |
| Auth provider account, invitation list, recovery owner and role policy | Owner/security maintainer | 05 | Build against mock identities in local tests, never a production bypass |
| Vercel project/team, domain, spending limit and production-release authorization | Owner/hosting maintainer | 01 cloud setup and each G7 | Local builds and documented preview configuration |
| Target site device, network conditions and physical usage trial | Father/site user and developer | 00 baseline and 06 acceptance | Define reproducible lab tests; mark field validation pending |

## Current-work observations supporting the plan

- The [offline viewer](../Thach_Bi_Viewer/OPEN_CHURCH.html) and [engine](../Thach_Bi_Viewer/simulator/engine.js) load procedural/global-script behavior and editable persistent layouts. No Next.js/Vite application was present at this planning baseline.
- The [planning layer](../Thach_Bi_Viewer/planning.js) has some scene metadata. Full architectural/structural object-to-source coverage has not been established; inventory it rather than assuming every mesh is a semantic construction object.
- [Reference provenance](../Thach_Bi_Viewer/references/manifest.json), the [timber image manifest](../docs/beams-roof-connections/image-manifest.json), [dimension sources](../docs/layout_design/) and [equipment categories](../docs/electrical-grid/categories/README.md) already provide source structures to extend.
- [Simulator limitations](../docs/simulator/methods-and-limitations.md), [control design](../docs/electrical-grid/controls.md) and the [quantity/usage report](../docs/electrical-grid/summary-report.md) prevent the website from presenting unfinished engineering as validated installation data.
- No publication-ready real-site photo collection or current work-package schedule was verified in this review. This is a missing-input observation, not a claim that the parish has no photographs or schedule.

## Technical references checked for this plan

Recheck these primary documentation sources when implementation begins; API names, supported versions, quotas and pricing may change. They support platform choices, not construction approval.

| Source | Used for |
| --- | --- |
| [Next.js authentication](https://nextjs.org/docs/app/guides/authentication) | Server-side authorization close to data; route interception alone is insufficient |
| [Vite SSR](https://vite.dev/guide/ssr) | Alternative framework comparison and additional SSR integration responsibility |
| [Vercel Git deployments](https://vercel.com/docs/git) | Preview/production branch behavior and deployment root selection |
| [Vercel environment variables](https://vercel.com/docs/environment-variables/manage-across-environments) | Separate development, preview and production configuration |
| [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection) | Environment protection, distinct from application roles |
| [Private Blob storage](https://vercel.com/docs/vercel-blob/private-storage) and [Blob SDK](https://vercel.com/docs/vercel-blob/using-blob-sdk) | Authenticated server delivery; verify size/range/cache support during implementation |
| [Clerk access controls](https://clerk.com/docs/guides/secure/restricting-access) | Invite-only access and provider-managed account administration |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Accessibility target for public pages, sign-in and inspection controls |
| [Web Vitals](https://web.dev/articles/vitals) | Public-page performance thresholds and field/lab distinction |
| [MDN resolvedOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions) | Browser timezone for the local-time presentation preference |

No project-specific legal/code-compliance determination is made here. Use the existing engineering source/review rules when a future web feature exposes construction decisions.
