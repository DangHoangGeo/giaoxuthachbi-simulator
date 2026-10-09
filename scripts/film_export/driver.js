/* Frame-by-frame export of a cinematic film, for a smooth video on any computer.
 *
 * The viewer's own "Save as video" records in real time, so its frame rate is
 * whatever the graphics card manages (about 8 frames a second at 1920 × 1080
 * on the computer this was written on). This driver instead draws the paused
 * film one frame at a time at an exact rate and sends each picture, and one
 * real-time sound recording, to scripts/film_export/receiver.py on this
 * computer. build.sh then joins them with ffmpeg. See README.md here.
 *
 * Paste into the browser console of the open viewer after clicking once in
 * the page (sound needs a click), or run it from an automation tool:
 *   exportFilm('short')            the 2 min 15 s film, sound and frames
 *   exportFilm('full')             five-minute film
 *   exportFilm('short', { sound: false })   frames only, keep an earlier sound file
 * Progress: window.filmExport. Nothing leaves this computer.
 */
window.exportFilm = async function exportFilm(film = 'short', { base = 'http://127.0.0.1:8799', fps = 30, sound = true, quality = 0.93 } = {}) {
  const cinema = window.CHURCH_CINEMA, church = window.church;
  const reel = cinema.films[film];
  const state = window.filmExport = { film, fps, phase: 'starting', frames: 0, total: Math.round(reel.length * fps), seconds: 0, soundLead: null, recoveries: 0, errors: [], done: false };
  const put = async (name, body) => {
    const response = await fetch(`${base}/${name}`, { method: 'PUT', body });
    if (response.status !== 201) throw new Error(`${name}: ${response.status}`);
  };
  try {
    if (sound) {
      state.phase = 'sound';
      // The film's clock advances on drawn frames; keep it moving if the window is hidden.
      const keepMoving = setInterval(() => { if (cinema.state().running) cinema.frame(0.033); }, 40);
      const video = await new Promise(resolve => {
        window.addEventListener('church-cinema-video', event => resolve(event.detail), { once: true });
        cinema.play(film, { record: true, save: false });
      });
      clearInterval(keepMoving);
      state.soundLead = video.soundLead;
      // A sound recording shorter than the film means it was stopped part-way: do not use it.
      if (!cinema.video || Math.abs(cinema.state().time - reel.length) > 1) throw new Error('the sound pass was interrupted; run the export again');
      await put(`${film}-sound.${video.type === 'video/mp4' ? 'mp4' : 'webm'}`, video.blob);
    }
    state.phase = 'frames';
    // Pause the film at its start. The viewer's own drawing loop is stopped too:
    // it would only compete for the graphics card.
    const arm = () => { if (cinema.state().running) church.stopTour(); cinema.play(film); cinema.setPaused(true); church.pause(); };
    arm();
    const began = performance.now();
    for (let i = 0; i < state.total; i++) {
      let canvas = cinema.still(i / fps);
      if (!canvas) {
        // A click or key in the page resumed or stopped the film. Start it again,
        // replay the last frames unseen so that fading text is where it was, and go on.
        if (++state.recoveries > 30) throw new Error(`interrupted too often at frame ${i}`);
        arm();
        for (let k = Math.max(0, i - 20); k < i; k++) cinema.still(k / fps);
        canvas = cinema.still(i / fps);
        if (!canvas) throw new Error(`no picture for frame ${i}`);
      }
      // toDataURL encodes at once; toBlob waits for idle time that never comes with the loop paused.
      const text = atob(canvas.toDataURL('image/jpeg', quality).split(',')[1]), bytes = new Uint8Array(text.length);
      for (let k = 0; k < text.length; k++) bytes[k] = text.charCodeAt(k);
      await put(`${film}-frames/${String(i).padStart(5, '0')}.jpg`, bytes);
      state.frames = i + 1; state.seconds = Math.round((performance.now() - began) / 1000);
      if (state.stop) break;
    }
    await put(`${film}-export.json`, JSON.stringify({ film, fps, frames: state.frames, filmSeconds: reel.length, soundLead: state.soundLead, made: new Date().toISOString() }));
    state.phase = 'finished';
  } catch (error) {
    state.errors.push(String(error)); state.phase = 'failed';
  } finally {
    church.resume();
    if (cinema.state().running) church.stopTour();
    state.done = true;
  }
  return state;
};
