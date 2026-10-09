# Film export, frame by frame

The viewer's **Save as video** button records a film in real time. That is the quick way, and its frame rate is whatever the computer's graphics card manages while it also records: about 8 frames a second at 1920 × 1080 on the Mac this was written on, which is too jerky to post.

This folder holds the slower way that gives a smooth file on any computer. The film is paused and drawn one frame at a time at exactly 30 frames a second; the sound is recorded once in real time; `ffmpeg` joins the two.

Nothing leaves the computer: the page sends its pictures to a small receiver on `127.0.0.1`.

## Steps

1. Start the receiver from the repository root:

   ```bash
   python3 scripts/film_export/receiver.py exports/film-export
   ```

2. Open `Thach_Bi_Viewer/OPEN_CHURCH.html` in Chrome (over `http://localhost`, as for normal use) and click once anywhere in the page, so that the browser allows sound.
3. Open the browser console, paste the whole of `driver.js`, then run:

   ```js
   exportFilm('short')   // two-minute film; 'full' for the five-minute film
   ```

   The film plays once for the sound, then the picture steps through frame by frame. `window.filmExport` shows progress. Allow about 10 minutes for the short film.
4. Join the files:

   ```bash
   scripts/film_export/build.sh exports/film-export short exports/sharing/thach-bi-short-film.mp4
   ```

The result is H.264 + AAC at 1920 × 1080, 30 frames a second, which X and Instagram accept. X limits ordinary posts to 2 min 20 s; the short film is 2 min.

## What the film shows

It shows the layout that is open in the viewer, with the captions and figures of `Thach_Bi_Viewer/cinematic-tour.js`. The figures in the short film (routes, circuits, connected kW, numbers of lamps, fans and loudspeakers) are read from the open model when the film starts. They are simulator estimates of a design-development model, and the closing card says the design is not approved for construction.

## Requirements and limits

- `python3`, `ffmpeg` and a Chromium browser. Tested with Chrome 152 (the Claude desktop browser pane) and ffmpeg from Homebrew on macOS.
- The pictures are the 3D view cropped to 16:9. A window narrower than 16:9 loses a band at the top and bottom, as the film's black bars already hide.
- Vertical (9:16) output is not provided.
