# Web architecture and framework decision

Status: architecture proposed 7 October 2026; local Web01 shell/read boundaries implemented 8 October. The public 3D development visit is now implemented as a reviewed GLB derivative with its own lifecycle. The shared-password architectural preview is implemented and hosting is connected; broader engineering access and release acceptance remain open; see [development](../docs/web/development.md) and [delivery status](../docs/web/deployment.md). Return to the [roadmap](README.md). Cross-cutting data and security requirements apply to every phase.

## Decision: Next.js, with a small client-side 3D viewer

Choose Next.js App Router and TypeScript under `web/`. Use server-rendered public text and metadata, client components only for interactive controls and WebGL, and server-only access functions for private records. Use Vercel's Next.js preset and the default supported Node runtime. At implementation, select a supported stable framework/runtime pair, pin dependencies and commit one lockfile. Do not adopt preview runtime features without a demonstrated need.

| Consideration | Next.js | Vite + React |
| --- | --- | --- |
| Public church pages and sharing | Integrated routing, server rendering and metadata conventions | Good static client app; add a routing/prerendering solution for the same publishing goals |
| Private documents and object data | Server route handlers and a data-access boundary in the same app | Viable, but requires a separate backend or a higher-level full-stack framework |
| Existing WebGL work | Client island with explicit browser lifecycle | Straightforward client integration |
| Volunteer maintenance | One application deployment and documented conventions | Attractive for a public-only viewer; more decisions for the complete requested scope |

This is a project-fit decision, not a claim that Vite cannot do SSR. Vite documents its native SSR interface as a low-level integration API; Next.js documents server-side authorization and a data access layer. [Vite SSR](https://vite.dev/guide/ssr), [Next.js authentication](https://nextjs.org/docs/app/guides/authentication).

## Existing implementation and migration boundary

The current [HTML viewer](../Thach_Bi_Viewer/OPEN_CHURCH.html) loads global scripts and a bundled procedural model. Its [simulator engine](../Thach_Bi_Viewer/simulator/engine.js) supports add/update/remove/import, saved layouts, migrations and localStorage. It is not an existing read-only React component. Reference artwork, high-resolution sources and ZIP archives also live beside it.

A filesystem inventory on 7 October counted approximately **122 MB** in `Thach_Bi_Viewer/`, including reference archives and source art. This is a directory size, **not a measured initial network payload**. Phase 00 measures actual requests and GPU behavior before choosing optimizations.

Preserve offline authoring and its existing tests. Extract explicit scene/data interfaces in small steps; avoid rebuilding the entire simulator inside the framework in one change. Do not deploy the complete legacy HTML behind a hidden toolbar and call it lightweight or read-only.

Proposed repository organization:

```text
web/                         Next.js app, its package manifest and lockfile
  src/app/[locale]/          public and protected routes
  src/components/            public content, visit, review and inspector components
  src/lib/server/            authenticated reads, release lookup, private asset access
  src/lib/contracts/         schema definitions and safe response types
  src/lib/viewer/            scene lifecycle and capability adapters
  content/                   reviewed PUBLIC text/manifests only
  public/                    explicitly public assets only
  tests/                     contract, route, security, browser and accessibility tests
scripts/                     existing checks plus future release/export tooling
docs/web/                    future operational runbooks and release evidence index
plan/                        roadmap, decisions and implementation phase status
Thach_Bi_Viewer/              retained offline design/authoring application
```

Start with a single web package, not a monorepo toolchain. The model export process can read existing sources from the repository root in a trusted authoring environment, then produce a checksummed release. The Vercel build for `web/` must consume only its allowlisted public inputs and approved server integrations; do not enable unrestricted repository copying. Private files are retrieved at runtime after authorization, not bundled into static output.

## Read-only capability model

| Capability | Public visit | Protected review | Site inspector | Offline authoring |
| --- | --- | --- | --- | --- |
| Camera, zoom, layers, selection | Curated visitor controls | Yes | Yes | Yes |
| Day/night, language, text size | Yes | Yes where relevant | Yes | Yes |
| Select a published scenario | Curated atmosphere only | Yes | Approved work-package views | Yes |
| Recompute results from immutable published inputs | No | Yes, when parity is verified | Show published results | Yes |
| Edit/move/delete objects, change ratings, import layouts | No | No | No | Existing behavior |
| Save project data, publish status, upload photos | No | No | No | Separate reviewed publication workflow |
| Operate installed equipment | No | No | No | Not implemented; separate engineering scope |

Browser preferences may store language, quality, camera or day/night mode. They must not store or restore an engineering layout. Published quick modes are **simulated previews** of recorded presets; they do not edit the published preset or send hardware commands. Analysis controls select existing cases/overlays; arbitrary what-if input editing is outside this brief.

Enforce capabilities inside the adapter and data interfaces as well as the UI. Published mode must not call legacy layout restoration/migrations or expose mutation functions through globals. Auth session creation, password recovery, bounded security logs and a trusted publishing webhook are infrastructure operations; they do not grant readers project-write access. Domain-data mutation endpoints and writable Server Actions are absent.

## Model delivery

Phase 04 benchmarks a public export (prefer glTF/GLB with supported compression and simplified textures) against a thin procedural renderer adapter. Choose after proving visual and coordinate parity, lifecycle cleanup and download budgets. Record the decision; neither an existing GLB nor a clean exporter is assumed.

Use separate public and engineering release profiles. Public assets contain only approved appearance, navigation/collision proxies and necessary identifiers. Keep engineering details, private source documents, route schedules and object specifications outside that profile. Visitors can download any bytes delivered to their browser; a public model cannot be made confidential through the UI.

The private profile preserves stable object IDs and links to its exact release registry. Merged/instanced geometry needs a tested instance-to-object map; optimization must not make selection return another member's specifications. Reuse the same model coordinates and export transform in 2D, 3D, route maps and object cards. Do not let a second hand-edited web model become the dimensional source of truth.

## Authentication and private delivery

**Owner exception, 8 October 2026:** the initial full-detail architectural preview uses one shared parish password, as explicitly chosen by the owner. Standard HTTP Basic authentication, private-origin policy checks and private model streaming are documented in [access-control.md](../docs/web/access-control.md). The individual-account design below remains the proposal for broader engineering/site work; this increment does not claim those role/session features. **Retired 10 October 2026:** the owner no longer needs a private version, and this preview and its code were removed; see [access control](../docs/web/access-control.md).

Proposed default: **Clerk with invited individual email/password accounts**, no open registration, with `reviewer` and `site_manager` grants maintained outside the app by the designated administrator. This avoids building password storage and recovery for a volunteer project. Provider cost, production availability, data handling and account ownership are phase 00 decisions. Clerk supports invite-only access; verify password, recovery and revocation settings against the selected production plan. [Clerk access controls](https://clerk.com/docs/guides/secure/restricting-access).

If that provider is unsuitable, record an alternative decision before phase 05. Better Auth with managed Postgres is a viable ownership-oriented option but adds database migrations, backups, email delivery and shared rate-limit storage. Do not run two auth stacks or invent a shared-password/JWT mechanism as a shortcut.

Verify the session and resource permission on every protected server data read, page payload, asset endpoint and worker-data request. Keep this check in a server-only data access layer. Route interception provides early redirects; it does not replace the checks at the data source. Roles must come from trusted server/provider records, never URL parameters or user-editable metadata. [Next.js authorization guidance](https://nextjs.org/docs/app/guides/authentication).

Proposed storage: separate public and private object stores. Public derivatives use immutable hash-based paths. Private documents/model data are served through authorized application endpoints accepting a release/resource ID resolved against an allowlist; never accept an arbitrary storage path or external URL. Vercel Blob private storage supports server-side retrieval; benchmark current transfer limits and cost before committing to large-file delivery. [Private Blob delivery](https://vercel.com/docs/vercel-blob/private-storage).

Private responses use explicit private/no-store behavior through browser, framework and CDN layers. No private records in static generation, public source maps, sitemap, search indexes, Open Graph previews, shared image optimization, public service-worker caches or diagnostic logs. Private thumbnails require private delivery too. Do not put secrets in `NEXT_PUBLIC_*`. Authentication failure or provider outage must fail closed for private data while public pages continue working.

Use HTTPS, provider-managed secure sessions and recovery, request-origin/CSRF defenses for auth operations, login abuse protection across instances, exact allowed callback origins, and bounded logging without document contents. Set a session/revocation policy and test the effective behavior; a stale role token must not retain access indefinitely. Sign-out clears private UI/worker state. Disable private browser offline persistence initially.

Vercel Deployment Protection can restrict preview environments, but does not define the application's reviewer/site-manager roles. Confirm feature availability before relying on it. [Deployment Protection](https://vercel.com/docs/deployment-protection).

## Publication and deployment boundaries

Trusted maintainer tooling validates and publishes release artifacts; readers only fetch them. Application runtime access should be read-only to project records, with narrower credentials than the separate publisher wherever supported. Publish public and private manifests separately. CI for community pull requests receives synthetic data and no production secrets or protected originals.

Use Vercel Git previews for reviewed branches, separate Preview/Production variables, and an explicit production-release policy. Connecting `main` to Vercel commonly enables automatic production deployment on merge; document that consequence before connection and protect the branch. A public launch remains a distinct authorized action. [Vercel Git deployment](https://vercel.com/docs/git), [environment separation](https://vercel.com/docs/environment-variables/manage-across-environments).

Before making this repository public, inspect both files **and Git history** for private drawings, people, credentials and licensing. Anything kept in a public repository is public regardless of application passwords. Move genuinely restricted records into a separately access-controlled source/store through a reviewed migration; do not assume `.gitignore` removes tracked files or history. This plan authorizes no history rewriting or publication.
