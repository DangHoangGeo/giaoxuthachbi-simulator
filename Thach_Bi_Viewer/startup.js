(() => {
  const screen = document.getElementById('startupScreen');
  const title = document.getElementById('startupTitle');
  const message = document.getElementById('startupMessage');
  const errorText = document.getElementById('startupError');
  const actions = document.getElementById('startupActions');
  const previews = document.getElementById('startupPreviews');
  let complete = false;
  let failed = false;
  let timer;

  function fail(text, detail = '') {
    if (failed) return;
    failed = true;
    clearTimeout(timer);
    screen.hidden = false;
    screen.classList.add('has-error');
    title.textContent = 'The 3D view could not start';
    message.textContent = text;
    errorText.textContent = detail;
    errorText.parentElement.hidden = !detail;
    actions.hidden = false;
    previews.hidden = false;
    screen.setAttribute('aria-busy', 'false');
  }

  document.getElementById('retryViewer').addEventListener('click', () => location.reload());
  document.getElementById('lighterViewer').addEventListener('click', () => {
    const url = new URL(location.href);
    url.searchParams.set('graphics', 'light');
    location.href = url.href;
  });

  window.addEventListener('error', event => {
    if (!complete && event.message) {
      fail('The model encountered a startup problem. Try lighter graphics, or use the images below to view the church.', event.message);
    }
  });
  window.addEventListener('unhandledrejection', event => {
    if (!complete) fail('The viewer could not finish opening. Please retry or try lighter graphics.', String(event.reason?.message || event.reason || 'Startup did not complete.'));
  });

  function finish() {
    if (!window.church?.ready) {
      if (!failed) fail('The page loaded, but the 3D model did not finish starting. Try lighter graphics or reopen this page in a full browser.');
      return;
    }
    complete = true;
    clearTimeout(timer);
    screen.hidden = true;
    screen.setAttribute('aria-busy', 'false');
    window.church.renderer.domElement.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      failed = false;
      fail('The browser lost its 3D graphics connection. Retry with lighter graphics to reduce graphics-memory use.');
    });
  }

  function start() {
    let context;
    try {
      const probe = document.createElement('canvas');
      context = probe.getContext('webgl2');
      if (context) context.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {}
    if (!context) {
      fail('WebGL 2 is unavailable in this browser session. Open this page in a full browser with 3D graphics enabled. The church images below remain available.');
      return;
    }
    message.textContent = 'Preparing the church model. This may take a few seconds on the first visit.';
    const script = document.createElement('script');
    script.src = 'bundle.js?v=20261006-3';
    script.onload = finish;
    script.onerror = () => fail('The model file could not be loaded. Retry the page. If you downloaded the viewer, extract the whole ZIP and keep its files together.');
    document.body.append(script);
    timer = setTimeout(() => {
      if (!complete && !failed) {
        message.textContent = 'The model is taking longer to open. Keep this tab open, or try lighter graphics.';
        actions.hidden = false;
      }
    }, 20000);
  }

  // Let the loading message paint before the synchronous geometry assembly starts.
  requestAnimationFrame(() => requestAnimationFrame(start));
})();
