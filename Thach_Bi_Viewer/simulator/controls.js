/* Thạch Bi simulator · fixed equipment dock.
 * Circuit switches, direct fan speeds and sound levels update in place.
 * Each tab scrolls inside the same panel, without moving the dock.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR, CAT = window.CHURCH_SIM_CATALOG;
  if (!SIM) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (v, d = 0) => Number.isFinite(v) ? v.toFixed(d) : '–';
  const short = c => SIM.CIRCUITS[c].label.replace(/^\w+ · /, '');
  const items = c => SIM.state.items.filter(i => i.circuit === c && !i.hidden);
  const present = () => Object.keys(SIM.CIRCUITS).filter(c => items(c).length);
  const fed = () => SIM.state.settings.db2Feed !== false;
  const TOWERS = { off: [], evening: ['L6', 'L9'], festival: ['L6', 'L7', 'L9'] };
  const TABS = [['scenes', 'Scenes'], ['DB1', 'DB-1'], ['DB2', 'Towers'], ['fans', 'Fans'], ['sound', 'Sound']];
  const TITLES = { scenes: ['Scenes', 'Set lights, fans and sound together.'], DB1: ['Interior circuits', 'Switch a circuit by area.'], DB2: ['Towers & façade', 'Powered by the DB-1 feeder.'], fans: ['Fan speed', 'Choose a speed for each group.'], sound: ['Sound zones', 'Adjust the level or mute a zone.'] };
  const SPEEDS = ['Off', 'Low', 'Med', 'High'];
  let tab = 'scenes', open = false;
  try { tab = localStorage.getItem('ctlTab') || tab; open = localStorage.getItem('ctlOpen') === '1'; } catch (e) { /* storage unavailable */ }
  if (!TABS.some(([k]) => k === tab)) tab = 'scenes';

  const root = document.createElement('div');
  root.className = 'ctl-dock';
  root.innerHTML = `
    <aside class="ctl-panel" id="ctlPanel" aria-label="Equipment controls" ${open ? '' : 'hidden'}>
      <header class="ctl-head"><strong>Controls</strong><button class="ctl-close" data-act="close" aria-label="Close controls"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button></header>
      <nav class="ctl-tabs" role="tablist" aria-label="Equipment type">${TABS.map(([k, l]) => `<button id="ctl-tab-${k}" data-tab="${k}" role="tab" aria-controls="ctlBody">${l}</button>`).join('')}</nav>
      <section class="ctl-body" id="ctlBody" role="tabpanel"></section>
    </aside>
    <button class="ctl-toggle" id="ctlToggle" aria-controls="ctlPanel" aria-expanded="${open}" title="Equipment controls"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></svg><span>Controls</span><svg class="ctl-chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 14 5-5 5 5"/></svg></button>`;
  document.querySelector('.right-rail').append(root);
  const body = root.querySelector('#ctlBody'), panel = root.querySelector('#ctlPanel'), toggle = root.querySelector('#ctlToggle');
  document.body.classList.toggle('controls-open', open);
  function revealControls() {
    const rail = root.parentElement;
    if (open && root.offsetHeight && rail.scrollHeight > rail.clientHeight + 1) rail.scrollTop = root.offsetTop;
  }
  function setOpen(value) {
    open = value; panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('controls-open', open);
    try { localStorage.setItem('ctlOpen', open ? '1' : '0'); } catch (_) {}
    if (open) { build(); requestAnimationFrame(revealControls); }
    else root.parentElement.scrollTop = 0;
  }
  window.addEventListener('resize', () => requestAnimationFrame(revealControls));

  /* ------------------------------------------------------------ panel */
  const breaker = c => `<button class="ctl-breaker" data-act="breaker" data-circuit="${c}" aria-label="${esc(SIM.CIRCUITS[c].label)}"><span class="ctl-lever" aria-hidden="true"><b></b></span><span class="ctl-breaker-copy"><b class="ctl-code">${c}</b><span class="ctl-name">${esc(short(c))}</span></span><span class="ctl-state"></span></button>`;
  const rail = (label, list) => list.length ? `<div class="ctl-rail"><div class="ctl-rail-label">${label}</div><div class="ctl-rail-row">${list.map(breaker).join('')}</div></div>` : '';
  const onBoard = (bd, f) => present().filter(c => (SIM.CIRCUITS[c].board || 'DB1') === bd && f(SIM.CIRCUITS[c]));
  function boardHtml(bd) {
    const B = SIM.BOARDS[bd];
    const areas = [...new Set(onBoard(bd, x => x.cat === 'light').map(c => SIM.CIRCUITS[c].area || 'Other'))];
    const head = bd === 'DB1'
      ? `<div class="ctl-rail"><div class="ctl-rail-label">Feeder</div><div class="ctl-rail-row"><button class="ctl-breaker ctl-feeder" data-act="feeder" aria-label="Tower board power" title="DB-2 feeder (C32) · cuts the whole towers board"><span class="ctl-lever" aria-hidden="true"><b></b></span><span class="ctl-breaker-copy"><b class="ctl-code">DB-2</b><span class="ctl-name">Tower board power</span></span><span class="ctl-state"></span></button></div></div>`
      : `<div class="ctl-dead" data-show="dead">No power (feeder off at DB-1)</div>
         <div class="ctl-keys">${Object.keys(TOWERS).map(k => `<button class="ctl-key" data-act="towers" data-mode="${k}" title="Towers ${k}"><i></i>${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>`;
    return `<div class="ctl-board" data-board="${bd}"><div class="ctl-where" title="${esc(B.where)}"><span>${bd === 'DB1' ? 'DB-1' : 'DB-2'}</span><b data-board-load="${bd}"></b></div>${head}
      ${areas.map(a => rail(a, onBoard(bd, x => x.cat === 'light' && (x.area || 'Other') === a))).join('')}
      ${rail('Fans', onBoard(bd, x => x.cat === 'fan'))}${rail('Decoration', onBoard(bd, x => x.cat === 'decor'))}</div>`;
  }
  function build() {
    let html = '';
    if (tab === 'scenes') {
      const names = [...Object.keys(SIM.SCENES), ...SIM.state.customScenes.map(x => x.name)];
      html = `<div class="ctl-keys">${names.map(n => `<button class="ctl-key" data-act="scene" data-scene="${esc(n)}"><i></i>${esc(n)}</button>`).join('')}</div>`;
    } else if (tab === 'DB1' || tab === 'DB2') html = boardHtml(tab);
    else if (tab === 'fans') {
      html = `<div class="ctl-reg-row">${present().filter(c => SIM.CIRCUITS[c].cat === 'fan').map(c => `<div class="ctl-regulator" data-regulator="${c}">
        <div class="ctl-reg-label"><b>${c}</b> ${esc(short(c))}<small>${items(c).length} fans <span data-speed-status="${c}"></span></small></div>
        <div class="ctl-speed-options" role="group" aria-label="${esc(short(c))} speed">${SPEEDS.map((label, speed) => `<button data-act="speed" data-circuit="${c}" data-speed="${speed}" aria-label="${esc(short(c))}: ${label === 'Med' ? 'Medium' : label}" aria-pressed="false">${label}</button>`).join('')}</div>
        </div>`).join('')}</div>`;
    } else {
      html = `<div class="ctl-strips">${present().filter(c => SIM.CIRCUITS[c].cat === 'speaker').map(c => `<div class="ctl-strip" data-strip="${c}" title="${esc(SIM.CIRCUITS[c].label)}"><div class="ctl-strip-name"><b>${c}</b> ${esc(short(c))}</div>
        <input type="range" class="ctl-fader" min="-20" max="6" step="1" data-act="fader" data-circuit="${c}" aria-label="${esc(SIM.CIRCUITS[c].label)} level">
        <div class="ctl-strip-foot"><div class="ctl-db"></div><button class="ctl-mute" data-act="mute" data-circuit="${c}"></button></div>
        </div>`).join('')}</div>`;
    }
    body.innerHTML = `<div class="ctl-section-title"><h2>${TITLES[tab][0]}</h2><p>${TITLES[tab][1]}</p></div>` + html;
    body.scrollTop = 0;
    body.setAttribute('aria-labelledby', `ctl-tab-${tab}`);
    root.querySelectorAll('.ctl-tabs button').forEach(b => {
      const active = b.dataset.tab === tab;
      b.classList.toggle('active', active); b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1;
    });
    sync();
  }
  // Update every control in place: classes and small texts only, no re-layout.
  function sync() {
    const p = SIM.powerSummary(), byC = Object.fromEntries(p.byCircuit.map(c => [c.circuit, c]));
    body.querySelectorAll('[data-act=scene]').forEach(b => { const active = SIM.state.scene === b.dataset.scene; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); });
    body.querySelectorAll('[data-act=breaker]').forEach(b => {
      const c = b.dataset.circuit, x = byC[c] || {};
      const on = items(c).some(i => i.on);
      b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.disabled = blocked(c);
      b.querySelector('.ctl-state').textContent = on ? 'On' : 'Off';
      b.title = `${SIM.CIRCUITS[c].label}\n${items(c).length} fittings · C${x.mcb || 6} breaker · ${fmt(x.amps || 0, 1)} A now`;
    });
    body.querySelectorAll('[data-act=feeder]').forEach(b => { b.classList.toggle('on', fed()); b.setAttribute('aria-pressed', String(fed())); b.querySelector('.ctl-state').textContent = fed() ? 'On' : 'Off'; });
    body.querySelectorAll('[data-board-load]').forEach(el => {
      const w = p.byCircuit.filter(c => (SIM.CIRCUITS[c.circuit]?.board || 'DB1') === el.dataset.boardLoad).reduce((t, c) => t + c.watts, 0);
      el.textContent = `${fmt(w / 1000, 2)} kW`;
    });
    const db2 = body.querySelector('[data-board=DB2]');
    if (db2) { db2.classList.toggle('ctl-unpowered', !fed()); db2.querySelector('[data-show=dead]').hidden = fed(); }
    body.querySelectorAll('[data-act=towers]').forEach(b => {
      const want = TOWERS[b.dataset.mode];
      const active = ['L6', 'L7', 'L9'].every(c => items(c).some(i => i.on) === want.includes(c));
      b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); b.disabled = !fed();
    });
    body.querySelectorAll('[data-regulator]').forEach(reg => {
      const c = reg.dataset.regulator, speeds = items(c).map(i => i.on ? (i.speed ?? 2) : 0), sp = speeds.every(s => s === speeds[0]) ? speeds[0] : null;
      reg.querySelector('[data-speed-status]').textContent = `· ${sp === null ? 'Mixed speeds' : SPEEDS[sp] === 'Med' ? 'Medium' : SPEEDS[sp]}`;
      reg.querySelectorAll('[data-act=speed]').forEach(b => {
        const active = Number(b.dataset.speed) === sp;
        b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); b.disabled = blocked(c);
      });
    });
    body.querySelectorAll('[data-strip]').forEach(st => {
      const c = st.dataset.strip, l = items(c), on = l.some(i => i.on), lvl = l.length ? l.reduce((t, i) => t + (i.level ?? 0), 0) / l.length : 0;
      st.classList.toggle('muted', !on);
      const f = st.querySelector('.ctl-fader'); if (document.activeElement !== f) f.value = Math.round(lvl);
      st.querySelector('.ctl-db').textContent = `${lvl > 0 ? '+' : ''}${Math.round(lvl)} dB`;
      const m = st.querySelector('.ctl-mute'); m.textContent = on ? 'On' : 'Muted'; m.classList.toggle('on', !on);
      m.setAttribute('aria-pressed', String(!on)); m.setAttribute('aria-label', `${on ? 'Mute' : 'Unmute'} ${short(c)}`); m.disabled = blocked(c);
      f.disabled = blocked(c);
    });
  }

  /* ------------------------------------------------------------ actions */
  const sub = () => Object.keys(SIM.CIRCUITS).filter(c => SIM.CIRCUITS[c].board === 'DB2');
  const blocked = c => !fed() && SIM.CIRCUITS[c]?.board === 'DB2';
  function setCircuit(c, on) { for (const i of items(c)) SIM.update(i.id, { on, ...(on && CAT.byId[i.type].light && !(i.dim > 0) ? { dim: 1 } : {}) }, { record: false }); }
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]');
    if (t && root.contains(t) && t.closest('.ctl-tabs')) { tab = t.dataset.tab; try { localStorage.setItem('ctlTab', tab); } catch (_) {} build(); return; }
    if (e.target.closest('#ctlToggle')) {
      setOpen(panel.hidden); return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const c = el.dataset.circuit;
    switch (el.dataset.act) {
      case 'close': setOpen(false); toggle.focus(); return;
      case 'scene': SIM.applyScene(el.dataset.scene); break;
      case 'breaker': if (blocked(c)) return; { const on = !items(c).some(i => i.on); setCircuit(c, on); SIM.commit((on ? 'Switch on ' : 'Switch off ') + SIM.CIRCUITS[c].label); } break;
      case 'towers': if (!fed()) return; { const want = TOWERS[el.dataset.mode]; for (const x of ['L6', 'L7', 'L9']) setCircuit(x, want.includes(x)); SIM.commit('Towers: ' + el.dataset.mode); } break;
      case 'feeder': {
        const st = SIM.state.settings, was = fed();
        if (was) { st.db2Memory = {}; for (const x of sub()) for (const i of items(x)) { st.db2Memory[i.id] = i.on; SIM.update(i.id, { on: false }, { record: false }); } }
        else for (const x of sub()) for (const i of items(x)) SIM.update(i.id, { on: !!st.db2Memory?.[i.id] }, { record: false });
        st.db2Feed = !was; SIM.commit(was ? 'DB-2 feeder off' : 'DB-2 feeder on'); break;
      }
      case 'speed': {
        if (blocked(c)) return;
        const next = Number(el.dataset.speed);
        for (const i of items(c)) SIM.update(i.id, next ? { on: true, speed: Math.min(next, CAT.byId[i.type].fan.speeds.length) } : { on: false }, { record: false });
        SIM.commit(`${SIM.CIRCUITS[c].label}: speed ${next}`); break;
      }
      case 'mute': if (blocked(c)) return; { const on = !items(c).some(i => i.on); for (const i of items(c)) SIM.update(i.id, { on }, { record: false }); SIM.commit((on ? 'Unmute ' : 'Mute ') + c); } break;
      default: return;
    }
    sync();
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { e.preventDefault(); e.stopPropagation(); setOpen(false); toggle.focus(); return; }
    const t = e.target.closest('.ctl-tabs [data-tab]');
    if (!t || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    const index = TABS.findIndex(([k]) => k === tab);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
    root.querySelector(`#ctl-tab-${TABS[next][0]}`).click();
    root.querySelector(`#ctl-tab-${TABS[next][0]}`).focus();
  });
  root.addEventListener('change', e => {
    const f = e.target.closest('[data-act=fader]');
    if (!f || blocked(f.dataset.circuit)) return;
    // Move the whole zone; each loudspeaker keeps its own tuned offset.
    const l = items(f.dataset.circuit), v = Number(f.value), avg = l.reduce((t, i) => t + (i.level ?? 0), 0) / (l.length || 1);
    for (const i of l) SIM.update(i.id, { level: Math.max(-30, Math.min(6, (i.level ?? 0) + v - avg)) }, { record: false });
    SIM.commit(`${f.dataset.circuit} level ${f.value} dB`); sync();
  });

  const refresh = () => { if (!panel.hidden) sync(); };
  for (const ev of ['items', 'history', 'scene']) SIM.on(ev, refresh);
  const start = () => { if (SIM.ready) { if (open) { build(); requestAnimationFrame(revealControls); } } else setTimeout(start, 300); };
  start();
})();
