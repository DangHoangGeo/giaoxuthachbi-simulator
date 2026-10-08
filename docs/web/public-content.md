# Homepage and gallery preparation

Phase 02 starts from main `dd2538d`. This is local preparation; G2 remains held for parish review and cleared media. [Framework handover](../../review/web-framework-2026-10-08/delivery/README.md), [publication rules](../../plan/data-and-publication.md).

## Text for parish review

The [bilingual draft](public-copy-draft.json) develops the project owner's [account](../../README.md) and the [Web00 private editorial draft](https://github.com/DangHoangGeo/giaoxuthachbi-simulator/blob/84edc9e/docs/web/content-draft.json). It stays under private project documentation, outside application content imports. Reviewer, publisher and publication time remain `null`. Neither the project story nor a software check approves the parish's final public wording.

The proposed order is church/community introduction, dated construction report, volunteer design work, invitation for technical review, then clearly categorized design images. The February start remains month-only; foundation completion is reported as of 7 October with its exact day unknown. No percentage, opening date, Mass schedule, address or official contact is invented. Personal recollections are attributed to the project owner. Specific historical/administrative claims are omitted pending parish confirmation.

The design gallery will distinguish site photographs, model renders, generated concepts and reference material. Each published item requires caption/alt text in both languages, creator/credit, precise known date or explicit unknown date, rights disposition and a checked derivative. There are currently **zero cleared public items**. Existing concept approval governs design intent, not automatic permission to publish source assets. No stock or invented site photograph fills that gap.

## Inputs still needed

The parish reviewer must approve or correct the exact bilingual draft and the church's public name, then identify the publication owner and backup. Any public image requires its original source, category, creator, known capture/creation date and permission/privacy decision. Approved public contact/help links are optional and remain absent until supplied. Site photographs are not interchangeable with generated designs.

Hosting domain/team and actual desktop/network remain later release inputs. Until public text/media and a deployment are authorized, `web/content/current.json` stays unpublished and search indexing stays disabled. Independent gallery software, accessibility and delivery work can proceed using isolated synthetic tests, with no fixture accepted by the production reader.

## Private media preparation

The maintainer runs the following from `web/` using the pinned Node/npm runtime. Both paths are explicit local paths; the output must be a **new directory outside `web/`**, with an existing parent. This tool creates private staging only; it never updates a release or copies an image into the site.

```sh
node scripts/prepare-media.mjs /private/source/original.jpg /private/staging/media-review-001
```

Inputs are one still JPEG, PNG, WebP or AVIF image, at most 50 MB and 40 million decoded pixels. SVG, animation, symlink inputs and existing output directories reject. The original is read without modification. Sharp 0.35.5 applies EXIF orientation, converts to sRGB and generates WebP (quality 82) plus JPEG (quality 85) at maximum edges 640, 1280 and 1920 pixels, preserving aspect ratio without enlargement. Identical small-image outputs are deduplicated. JPEG transparency is composited onto the site's cream background `#f7f5ef`; inspect transparency/color and detail before approving a derivative. These quality/size choices are delivery defaults, not evidence of suitability for every source.

The exporter strips source EXIF/GPS, XMP, IPTC and ICC metadata; it verifies their absence in output. A private manifest records source hash/bytes/stored dimensions/orientation, tool versions and each derivative's hash, bytes and dimensions. It does not retain an original filename, infer capture time, or grant rights. Capture date, privacy review and rights review remain `null`. Review actual pixels for people, identifying information, source-category truth, cropping, orientation and legibility; metadata removal cannot make a photograph privacy-safe by itself. Preserve the original, manifest and review privately. Re-export is deterministic for identical input and pinned tool/platform, but cross-platform byte identity is not promised.

Only after editorial/privacy/rights review may the maintainer select the hash-named files for `web/public/media/` and reference them in the immutable public release. Never copy the staging manifest or originals there. Public filenames must be `/media/<sha256>.<format>` and match their bytes. `npm run check:media` runs before Next in the supported `npm run build` command: it rejects undeclared/missing files, symlinks, checksum/byte/dimension/type mismatches, source metadata, animation and failed full image decoding. With the current unpublished pointer, `public/` must contain no files. Full release-schema/pointer validation also runs when Next builds the public pages; the media preflight alone is not a content approval or complete contract validator.

There are still no cleared real media files. Synthetic image tests run in disposable directories and never enter application inputs. The exporter and preflight add no web upload or image editing endpoint.

Implementation references checked 8 October 2026: [Sharp output and metadata policy](https://sharp.pixelplumbing.com/api-output/) and [orientation operations](https://sharp.pixelplumbing.com/api-operation/#autoorient).

## Gallery and narrative presentation

Phase 02 adds `/vi/design` and `/en/design`. The real reader still receives an unpublished pointer and `null`, so the gallery truthfully shows zero cleared images. Four category filters distinguish site photographs, model renders, concepts and references; ordinary links work without JavaScript and preserve the selected category when changing languages. Unknown or malformed filters resolve to All. Captions, alt text, category-specific status, author/source and known date precision remain visible; month-only dates never show an invented day.

Published homepage presentation uses the public release's ordered `pages`: first entry is the introduction, subsequent entries are narrative sections. At least one entry is required. All text is escaped plain text, with paragraph breaks preserved. The private bilingual draft is not imported or activated. No progress/visit/contact entry is advertised before that feature or approved link exists. Future phase 03 adds latest progress once its consumer is ready.

Image cards use pre-generated local AVIF/WebP sources when supplied and a JPEG/PNG fallback when supplied by the exporter. Declared dimensions reserve space, images fit without cropping, the first card is eager, later cards are lazy, and enlargement fetches its large image only when opened. The native dialog has an explicit close button, Escape dismissal, modal focus and focus return. Without JavaScript, the same image link opens the large derivative. A failed image leaves the caption/date/credit readable. Only immutable local media paths accepted by the public schema enter these components.

`web/tests/harness/prepare-gallery.mjs` creates an **isolated temporary app copy** for positive presentation checks with conspicuously labeled synthetic color swatches. Its fixture remains `fixtureOnly: true`; a test-only reader in that copy parses the same public schema but deliberately bypasses publication acceptance. The production reader has no fixture switch. Test builds use Webpack and linked test dependencies; they prove component/presentation behavior, not publication, deployment, permissions, real-photo quality or production artifact isolation. The real app's separate production build and boundary scan must pass; the scanner now also rejects the synthetic gallery banner/credit markers. Temporary harness directories are removed when the runner stops. No originals or project engineering sources enter the harness.

Route titles/descriptions are localized; a published homepage description is the first 180 characters of its approved introductory text after whitespace normalization. Indexing remains disabled. Canonical domain, parish-approved social image, public sitemap and substantive structured data remain held until real public content/domain and publication approval exist. No address, Mass schedule, geographical claim or completion percentage is inferred.
