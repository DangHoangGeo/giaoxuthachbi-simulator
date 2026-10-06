/* Discover disclosure: keep one small button available when the menu is hidden. */
(() => {
  'use strict';
  const dock = document.querySelector('.place-dock');
  const toggle = document.getElementById('discoverToggle');
  const contents = document.getElementById('discoverContents');
  if (!dock || !toggle || !contents) return;
  let expanded = true;
  try { expanded = localStorage.getItem('discoverOpen') !== '0'; } catch { /* private mode */ }

  function setExpanded(value, save = true) {
    expanded = value;
    contents.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.title = expanded ? 'Hide Discover' : 'Expand Discover';
    dock.classList.toggle('is-collapsed', !expanded);
    if (save) {
      try { localStorage.setItem('discoverOpen', expanded ? '1' : '0'); } catch { /* private mode */ }
    }
  }
  toggle.addEventListener('click', () => setExpanded(!expanded));
  dock.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || !expanded) return;
    e.preventDefault(); e.stopPropagation();
    setExpanded(false);
    toggle.focus();
  });
  setExpanded(expanded, false);
})();
