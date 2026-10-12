# Quick-start guide for the parish priest (Vietnamese)

**Hướng dẫn xem mô hình 3D nhà thờ Thạch Bi trên máy tính.** Design in development · Not for construction · Đang phát triển · Không dùng để thi công.

A step-by-step guide, in Vietnamese, for Father to download the repository as a ZIP file from GitHub, open the local viewer and explore the 3D model, the settings, the quick controls, the estimate read-outs and the suggested art. It exists as a web page and as a narrated video made from the same scenes.

| Piece | File | In Git |
| --- | --- | --- |
| Guide page with narration, written steps and a slide-by-slide player | [index.html](index.html) (open it in Chrome or Edge) | yes |
| Scenes: the text that is both narration and caption, and the highlight boxes | [scenes.js](scenes.js) | yes |
| Narration and sentence timings | `audio/*.m4a`, [timings.js](timings.js) | yes |
| Screenshots | `assets/*.jpg` | yes |
| Three short screen clips (orbit, walk, film) | `clips/*.mp4` | yes |
| Narrated video, about 5 minutes, 1920 × 1080 | `huong-dan-xem-mo-hinh-3d.mp4` here and in `exports/sharing/` | **no** (large; ignored) |

On the website the page is published at `/guide/index.html` and linked from the 3D visit page; see [the web document](../../web/guide.md).

## What it covers

1. Open the GitHub page. 2. **Code → Download ZIP** (about 500 MB). 3. Extract it to a folder. 4. Open `Thach_Bi_Viewer/OPEN_CHURCH.html`. 5. Explore: orbit, **Go inside** and walking, **Settings** (Day/Evening and 2 or 4 bench blocks, roof on or off), the statistics strip, the **Controls** dock (scenes, DB-1, towers, fans, sound), **Simulator**, the cinematic tour and the four technical tours. Then the suggested art: **References**, and the sixteen-view gallery page. It ends with the not-for-construction notice.

## Facts it relies on, and where they come from

- ZIP size: `git archive` of `origin/dev` on 10 October 2026 gave 517,506,109 bytes (about 494 MiB); GitHub's own ZIP was not downloaded. The viewer folder alone is about 106 MB.
- The Download ZIP file is named after the default branch (`giaoxuthachbi-simulator-dev.zip` on 10 October 2026), so the guide shows the name as a pattern, not a promise.
- The viewer opens from a plain file path (checked by loading `Thach_Bi_Viewer/OPEN_CHURCH.html` as a `file://` page in desktop Chrome on 10 October 2026), without a server.
- Statistic meanings and targets are those in the tooltips of [Thach_Bi_Viewer/simulator/ui.js](../../../Thach_Bi_Viewer/simulator/ui.js) (book light at 0.8 m excluding daylight; STI target 0.60; air 0.3 to 0.8 m/s; noise at or below 40 dBA; equipment power as modelled load). They are simulator estimates ([methods and limitations](../../simulator/methods-and-limitations.md)).
- The Controls dock changes only the model; nothing operates equipment in the church ([controls](../../electrical-grid/controls.md)).

## How it was made

Everything below runs from the repository root. Chrome, `ffmpeg` and macOS `say` are required; the screenshots and clips were captured from the real viewer in desktop Chrome at 1920 × 1080 (viewer opened as a file, so the user's saved layouts were not touched).

```bash
node scripts/father_guide/tts.mjs                              # narration + docs/guides/father-quick-start/timings.js
node scripts/father_guide/build.mjs --frames <dir with orbit/ walk/ tour/>   # the narrated video
```

`tts.mjs` uses the macOS Vietnamese voice "Linh" and respells English button names in Vietnamese sounds so that the voice reads them naturally (the on-screen caption keeps the original spelling). `build.mjs` renders each caption with `index.html?frame=<scene>&k=<sentence>`, so page and video always agree. The 30 frame-per-second clip frames were recorded by driving the viewer over the Chrome DevTools protocol; the capture scripts are in [scripts/father_guide](../../../scripts/father_guide).

## Revision of 11 October 2026: stale pictures and video

On 11 October 2026 the viewer's **Short film** was removed and four **Technical tours** (Lights, Fans, Sound, Wiring) were added to the Discover menu, at the owner's request. In this guide:

- **Updated:** the one sentence that named the short film (scene `s5f` in [scenes.js](scenes.js)) now introduces the technical tours (four of them since the wiring tour was added the same day), and its narration `audio/s5f.m4a` and its entry in [timings.js](timings.js) were regenerated with `node scripts/father_guide/tts.mjs s5f`. No other narration was touched. The phonetic respelling for “Technical tours” was not listened to critically.
- **STALE, not refreshed:** every viewer screenshot that shows the Discover menu (`assets/v-*.jpg`, `assets/orbit.jpg`, `assets/walk.jpg`) and the clips `clips/orbit.mp4` and `clips/walk.mp4` still show the old menu, with the **Short film · 2 min 15** button and without the **Technical tours** row. The highlight box of scene `s5e` was drawn for that old menu. The narrated video `huong-dan-xem-mo-hinh-3d.mp4` (not in Git) still speaks the old sentence.
- **To refresh:** `node scripts/father_guide/capture.mjs viewer <dir>` and `capture.mjs frames <dir>` (desktop Chrome, 1920 × 1080), replace the pictures and clips, adjust the `s5e` box in `scenes.js`, then `node scripts/father_guide/build.mjs --frames <dir>` for the video.

## Limits and open items

- **Narration voice (hold H7):** the audio is synthesized with an Apple system voice. Its terms for redistribution have not been checked. See the [publication checklist](../../open-source/publication-checklist.md). Replace the narration with a human recording, or confirm the terms, before the owner promotes this to the public website.
- **Pronunciation not reviewed by a Vietnamese speaker.** The voice and the phonetic respellings were not listened to critically; have a native speaker check the audio.
- The cover image is a generated concept, labelled on the cover as an illustration, not a photograph of the site.
- GitHub screenshots show GitHub's interface on 10 October 2026 and will age. The viewer's button names are English; the guide keeps them in bold.
- The page and the video are desktop only. They explain how to open and look at the model; they say nothing about construction approval.
