# Phase 02 — Public church homepage and gallery

Status: **not started**. Depends on phase 01 and content cleared in phase 00. Read [data/publication rules](../data-and-publication.md) and [quality gates](../quality-and-release.md).

## Outcome

A respectful, readable public introduction to the church, its community and current construction. Visitors can distinguish what exists on site from design proposals and understand why this volunteer project matters.

## Inputs

The [project story](../../README.md), parish-approved name/history, confirmed construction facts, approved contact/public links if supplied, publication-safe real photos, model renders/concepts and their provenance. Do not assume reference photographs depict this construction site.

## Work packages, in order

1. **Edit the narrative.** Prepare Vietnamese-first content with reviewed English equivalents: church introduction; February 2026 construction start/foundation status with as-of date; community contributions; the remote volunteer/AI design effort; invitation for constructive engineering review. Attribute personal recollections. Verify or soften historical claims rather than inventing exact dates, official endorsements or visitor information.
2. **Design the page hierarchy.** Lead with the church and community, then current status, latest published progress, design exploration and community-help link. Use legible type and calm imagery appropriate to worship. Do not add donation/payment, comments or contact forms without a separate brief. Hide the visit entry until its route is ready or provide a clearly labeled static design gallery.
3. **Build media presentation.** Implement `/design` filters for concept art, model renders and actual site photographs. Show caption, capture/creation date precision, author/credit and status. Provide keyboard-operable enlargement with focus return and an explicit close action. Never label an AI concept as a photograph of completed work.
4. **Optimize delivery.** Produce responsive thumbnails/hero sizes, stable aspect ratios and modern formats with suitable fallback. Lazy-load below-the-fold media, not the primary visible image. Permit only reviewed image origins. Do not place high-resolution archives or restricted originals under `public/`.
5. **Add discoverability.** Use meaningful public titles/descriptions, parish-approved social preview imagery, canonical locale links and public-only sitemap. Add only substantiated structured data; no invented address, service schedule or opening hours. Private routes/assets remain outside indexing and public navigation.

Suggested commit boundaries: approved content/manifests; homepage; accessible gallery/media pipeline; metadata and measured performance refinements.

## Planned deliverables

- Public homepage and `/design` routes with locale content under `web/content/`.
- Validated public media manifest and responsive derivative generation workflow.
- `docs/web/public-content.md`: content owners, provenance and translation status.
- Desktop, keyboard and reduced-motion review evidence under a dated `review/web/` folder with public-safe screenshots only.

## Checks and exit gate G2

- [ ] Parish/owner review confirms church identity, wording and public images; uncertain historical details are not stated as fact.
- [ ] Each gallery entry has correct type, attribution, permission and date precision; missing images have a readable fallback.
- [ ] No public photo exposes unapproved personal information or unnecessary EXIF/GPS metadata.
- [ ] Public text and navigation work at narrow widths, large text, keyboard and screen-reader focus order.
- [ ] The page meets the proposed public payload budgets or has a measured, reviewed remediation plan before launch.
- [ ] The homepage loads no 3D/simulator code and no private engineering data.
- [ ] SEO previews, sitemap and localization contain only approved public content.

## Risks and handover

If real photos are not cleared, a text-and-design release may be prepared, but label the real-photo requirement as incomplete. Keep placeholders and stock images out of the construction record. Pass event/media IDs and public components to phase 03; launch only after the relevant phase 07 gate.
