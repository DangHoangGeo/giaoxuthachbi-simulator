/* Thạch Bi viewer · display language.
 * One language at a time, Vietnamese by default. The header VI | EN switch, the
 * site view switch and the ?lang= address parameter all share one preference
 * (localStorage 'thachbi.lang'). The older site-view key 'thachbi.site.lang' is
 * read once, moved to the shared key and removed.
 *
 * Usage: t('English text') returns the Vietnamese text from i18n-vi.js when
 * Vietnamese is shown, otherwise the English source. Markup that a module writes in
 * English is shown in the chosen language with adopt(root), which matches its text
 * nodes and attributes against the same table; text composed with values is wrapped
 * in t(). Engineering identifiers, units, circuit codes and register contents are not
 * translated.
 */
(() => {
  'use strict';
  const KEY = 'thachbi.lang', LEGACY_KEY = 'thachbi.site.lang';
  const LANGS = ['vi', 'en'];
  const TRANSLATED_ATTRIBUTES = ['title', 'aria-label', 'placeholder', 'alt'];
  const listeners = new Set();
  const originalText = new WeakMap(), originalAttributes = new WeakMap(), originalBlocks = new WeakMap();
  const table = () => (window.THACH_VI && typeof window.THACH_VI === 'object' ? window.THACH_VI : {});
  const blocks = () => (window.THACH_VI_BLOCKS && typeof window.THACH_VI_BLOCKS === 'object' ? window.THACH_VI_BLOCKS : {});
  const valid = value => (LANGS.includes(value) ? value : null);

  function storage() {
    try { return window['local' + 'Storage']; } catch { return null; }
  }

  // The stored preference. The site view's older key is moved once and then removed.
  function stored() {
    const store = storage();
    if (!store) return null;
    try {
      let value = valid(store.getItem(KEY));
      const legacy = valid(store.getItem(LEGACY_KEY));
      if (legacy) {
        if (!value) { value = legacy; store.setItem(KEY, legacy); }
        store.removeItem(LEGACY_KEY);
      }
      return value;
    } catch { return null; }
  }

  // ?lang= wins for this page load only; it is not saved, so a visitor's own choice remains.
  const fromAddress = valid(new URLSearchParams(location.search).get('lang'));
  let current = fromAddress || stored() || 'vi';

  function save(value) {
    const store = storage();
    if (!store) return;
    try { store.setItem(KEY, value); } catch { /* storage unavailable: the choice lasts for this page only */ }
  }

  // Adopted nodes are English source text written by the page or a module. They are
  // translated by exact match against the table and refreshed when the language changes.
  // Nodes that have left the document are dropped on each pass, so re-rendered panels
  // do not accumulate. Text built with composed values is translated in code with t().
  let staticTexts = [], staticElements = [], staticBlocks = [];
  const SKIP = 'script, style, canvas, noscript';

  function refreshText(node) {
    const source = originalText.get(node);
    const trimmed = source.trim();
    const target = current === 'vi' && trimmed ? table()[trimmed] : undefined;
    const next = target ? source.replace(trimmed, target) : source;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  // An attribute that a module has set since the last pass (for example a live meter label) is
  // kept as it is and becomes the new English source only if that module wrote English.
  function refreshAttributes(element) {
    const saved = originalAttributes.get(element);
    for (const name of Object.keys(saved)) {
      const entry = saved[name];
      const shown = element.getAttribute(name);
      if (shown !== entry.shown) { entry.source = shown; entry.shown = shown; continue; }
      const target = current === 'vi' ? table()[entry.source.trim()] : undefined;
      entry.shown = target || entry.source;
      if (shown !== entry.shown) element.setAttribute(name, entry.shown);
    }
  }

  function refreshBlock(element) {
    const source = originalBlocks.get(element);
    const target = current === 'vi' ? blocks()[element.dataset.i18n] : undefined;
    const next = target || source;
    if (element.innerHTML !== next) element.innerHTML = next;
  }

  function refreshAll() {
    staticTexts = staticTexts.filter(node => node.isConnected);
    staticElements = staticElements.filter(element => element.isConnected);
    staticBlocks = staticBlocks.filter(element => element.isConnected);
    for (const element of staticBlocks) refreshBlock(element);
    for (const node of staticTexts) refreshText(node);
    for (const element of staticElements) refreshAttributes(element);
  }

  // Registers the English text under root (root included) and shows it in the current language.
  function adopt(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    for (const element of [root, ...root.querySelectorAll('[data-i18n]')]) {
      if (element.dataset?.i18n !== undefined && !originalBlocks.has(element)) {
        originalBlocks.set(element, element.innerHTML);
        staticBlocks.push(element);
      }
    }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue.trim() || originalText.has(node) || node.parentElement?.closest(`[data-i18n], ${SKIP}`)) continue;
      originalText.set(node, node.nodeValue);
      staticTexts.push(node);
    }
    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (element.closest(SKIP) || originalAttributes.has(element)) continue;
      const names = TRANSLATED_ATTRIBUTES.filter(name => element.hasAttribute(name));
      if (!names.length) continue;
      const saved = {};
      for (const name of names) saved[name] = { source: element.getAttribute(name), shown: element.getAttribute(name) };
      originalAttributes.set(element, saved);
      staticElements.push(element);
    }
    refreshAll();
  }

  // The first call adopts the static markup; later calls only refresh what is adopted.
  let registered = false;
  function translate(root = document.body) {
    if (!root) return;
    if (!registered) { registered = true; adopt(root); return; }
    refreshAll();
  }

  const originalTitle = document.title;
  function apply() {
    document.documentElement.lang = current;
    document.title = current === 'vi' ? (table()[originalTitle] || originalTitle) : originalTitle;
    translate();
    for (const button of document.querySelectorAll('[data-lang-choice]')) {
      const active = button.dataset.langChoice === current;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }

  const api = {
    get: () => current,
    set(next) {
      const value = valid(next) || 'vi';
      save(value);
      if (value === current) return;
      current = value;
      apply();
      for (const listener of listeners) listener(current);
    },
    // Vietnamese text for an English UI string, or the English string itself.
    t(text) {
      if (current !== 'vi') return text;
      return table()[text] ?? text;
    },
    // Picks one of two inline texts for the current language.
    pick: (en, vi) => (current === 'vi' ? vi : en),
    // Readouts follow the language: 1.65 in English, 1,65 in Vietnamese. Drawing identifiers are not passed here.
    number: (value, digits) => {
      const text = Number(value).toFixed(digits);
      return current === 'vi' ? text.replace('.', ',') : text;
    },
    onChange(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    translate,
    adopt,
    apply,
  };

  window.THACH_I18N = api;
  document.documentElement.lang = current;
  // Static text is translated once the markup is parsed.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply, { once: true });
  else apply();

  // Header switch: one button per language, shown in normal and visit-only mode.
  document.addEventListener('click', event => {
    const button = event.target.closest?.('[data-lang-choice]');
    if (button) api.set(button.dataset.langChoice);
  });
})();
