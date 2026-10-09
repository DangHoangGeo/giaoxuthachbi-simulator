# The quick-start guide on the website

**Added 10 October 2026. Design in development, not for construction.**

**Owner instruction, 10 October 2026 (USER CONFIRMED):** put the Vietnamese guide for the parish priest, which explains how to download the repository ZIP and explore the viewer, on the public website as well.

## How it works

- The source is [docs/guides/father-quick-start](../guides/father-quick-start/README.md): one HTML page, its scenes, narration, screenshots and three short screen clips. Nothing is rewritten for the website.
- [web/scripts/guide-files.mjs](../../web/scripts/guide-files.mjs) is the single definition of what is published: `index.html`, `scenes.js`, `timings.js`, `assets/*.jpg`, `audio/*.m4a` and `clips/*.mp4`. The full narrated video is a large local file and is not published; the page hides its video block when the file is absent.
- [web/scripts/prepare-guide.mjs](../../web/scripts/prepare-guide.mjs) copies those files byte for byte to `web/public/guide/` before `npm run dev` and `npm run build`. The folder is generated and ignored by Git.
- [web/scripts/check-guide.mjs](../../web/scripts/check-guide.mjs) runs in every build and fails unless the copy has exactly that file list and those bytes. `check-media.mjs` skips `/guide/` the same way it skips `/viewer/`.
- The page is at `/guide/index.html`. The 3D visit page (`/vi/visit` and `/en/visit`) links to it. The site's usual headers apply, including `X-Frame-Options: DENY` and `X-Robots-Tag: noindex`.
- The guide is in Vietnamese only. The English visit page says so beside the link.

## Limits and open items

- Narration voice terms are unverified (hold H7 in the [publication checklist](../open-source/publication-checklist.md)).
- The guide shows GitHub's interface and the viewer's English buttons as of 10 October 2026.
- Desktop only, as the owner scoped on 8 October 2026.
- A change under `docs/guides/father-quick-start/` becomes a public website change once it reaches `main`.
