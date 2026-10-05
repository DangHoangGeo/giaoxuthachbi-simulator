/* Thạch Bi simulator · stand-alone control panel and live stats (bottom right).
 * The panel is the equipment people actually touch: the scene keypad, the two
 * distribution boards (DB-1 behind the altar, DB-2 inside the main doors),
 * the fan regulators and the sound mixer. It has a fixed size and switches are
 * updated in place, so nothing moves while you use it. The stats strip above it
 * is always visible.
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
  let tab = 'scenes', open = false;
  try { tab = localStorage.getItem('ctlTab') || tab; open = localStorage.getItem('ctlOpen') === '1'; } catch (e) { /* storage unavailable */ }

  const root = document.createElement('div');
  root.className = 'ctl-dock';
  root.innerHTML = `
    <div class="ctl-panel" id="ctlPanel" ${open ? '' : 'hidden'}>
      <div class="ctl-tabs">${TABS.map(([k, l]) => `<button data-tab="${k}">${l}</button>`).join('')}</div>
      <div class="ctl-body" id="ctlBody"></div>
    </div>
    <button class="ctl-toggle" id="ctlToggle" aria-expanded="${open}" title="Control panel">⚡ Controls</button>`;
  const stats = document.createElement('div');
  stats.className = 'ctl-stats'; stats.id = 'ctlStats';
  document.body.append(root, stats);
  const body = root.querySelector('#ctlBody'), panel = root.querySelector('#ctlPanel'), toggle = root.querySelector('#ctlToggle');

  /* ------------------------------------------------------------ stats */
  let last = null;
  function renderStats() {
    const s = last?.seats, p = SIM.powerSummary();
    const cell = (k, v, u, ok) => `<div class="ctl-stat${ok === false ? ' bad' : ''}"><b>${v}</b><small>${u}</small><span>${k}</span></div>`;
    stats.innerHTML =
      cell('Light', s?.lux ? fmt(s.lux.avg) : '…', 'lux', s?.lux ? s.lux.avg >= 200 : undefined) +
      cell('Speech', s?.sti ? fmt(s.sti.avg, 2) : '–', 'STI', s?.sti ? s.sti.avg >= 0.6 : undefined) +
      cell('Air', s?.air ? fmt(s.air.avg, 2) : '…', 'm/s', s?.air ? s.air.avg >= 0.3 : undefined) +
      cell('Noise', s?.noise ? fmt(s.noise.avg, 0) : '…', 'dBA', s?.noise ? s.noise.avg <= 45 : undefined) +
      cell('Power', fmt(p.total / 1000, 1), 'kW') +
      cell('Cost', fmt(p.costMonth / 1000, 0) + 'k', '₫/mo');
  }

  /* ------------------------------------------------------------ panel */
  const breaker = c => `<button class="ctl-breaker" data-act="breaker" data-circuit="${c}"><span class="ctl-lever"><b></b></span><span class="ctl-code">${c}</span></button>`;
  const rail = (label, list) => list.length ? `<div class="ctl-rail"><div class="ctl-rail-label">${label}</div><div class="ctl-rail-row">${list.map(breaker).join('')}</div></div>` : '';
  const onBoard = (bd, f) => present().filter(c => (SIM.CIRCUITS[c].board || 'DB1') === bd && f(SIM.CIRCUITS[c]));
  function boardHtml(bd) {
    const B = SIM.BOARDS[bd];
    const areas = [...new Set(onBoard(bd, x => x.cat === 'light').map(c => SIM.CIRCUITS[c].area || 'Other'))];
    const head = bd === 'DB1'
      ? `<div class="ctl-rail"><div class="ctl-rail-label">Feeder</div><div class="ctl-rail-row"><button class="ctl-breaker ctl-feeder" data-act="feeder" title="DB-2 feeder (C32) · cuts the whole towers board"><span class="ctl-lever"><b></b></span><span class="ctl-code">DB-2</span></button></div></div>`
      : `<div class="ctl-dead" data-show="dead">No power (feeder off at DB-1)</div>
         <div class="ctl-keys">${Object.keys(TOWERS).map(k => `<button class="ctl-key" data-act="towers" data-mode="${k}" title="Towers ${k}"><i></i>${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>`;
    return `<div class="ctl-board" data-board="${bd}"><div class="ctl-where" title="${esc(B.where)}"><span data-board-load="${bd}"></span></div>${head}
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
      html = `<div class="ctl-reg-row">${present().filter(c => SIM.CIRCUITS[c].cat === 'fan').map(c => `<div class="ctl-regulator">
        <button class="ctl-knob" data-act="knob" data-circuit="${c}"><b></b></button>
        <div class="ctl-ticks" data-ticks="${c}"><span>0</span><span>1</span><span>2</span><span>3</span></div>
        <div class="ctl-reg-label" title="${esc(SIM.CIRCUITS[c].label)} · ${items(c).length} fans">${c}</div></div>`).join('')}</div>`;
    } else {
      html = `<div class="ctl-strips">${present().filter(c => SIM.CIRCUITS[c].cat === 'speaker').map(c => `<div class="ctl-strip" data-strip="${c}" title="${esc(SIM.CIRCUITS[c].label)}"><div class="ctl-strip-name">${c}</div>
        <div class="ctl-meter"><i></i></div>
        <input type="range" class="ctl-fader" min="-20" max="6" step="1" data-act="fader" data-circuit="${c}" aria-label="${esc(SIM.CIRCUITS[c].label)} level">
        <div class="ctl-db"></div><button class="ctl-mute" data-act="mute" data-circuit="${c}"></button>
        </div>`).join('')}</div>`;
    }
    body.innerHTML = html;
    root.querySelectorAll('.ctl-tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    sync();
  }
  // Update every control in place: classes and small texts only, no re-layout.
  function sync() {
    const p = SIM.powerSummary(), byC = Object.fromEntries(p.byCircuit.map(c => [c.circuit, c]));
    body.querySelectorAll('[data-act=scene]').forEach(b => b.classList.toggle('active', SIM.state.scene === b.dataset.scene));
    body.querySelectorAll('[data-act=breaker]').forEach(b => {
      const c = b.dataset.circuit, x = byC[c] || {};
      b.classList.toggle('on', items(c).some(i => i.on));
      b.title = `${SIM.CIRCUITS[c].label}\n${items(c).length} fittings · C${x.mcb || 6} breaker · ${fmt(x.amps || 0, 1)} A now`;
    });
    body.querySelectorAll('[data-act=feeder]').forEach(b => b.classList.toggle('on', fed()));
    body.querySelectorAll('[data-board-load]').forEach(el => {
      const w = p.byCircuit.filter(c => (SIM.CIRCUITS[c.circuit]?.board || 'DB1') === el.dataset.boardLoad).reduce((t, c) => t + c.watts, 0);
      el.textContent = `${fmt(w / 1000, 2)} kW`;
    });
    const db2 = body.querySelector('[data-board=DB2]');
    if (db2) { db2.classList.toggle('ctl-unpowered', !fed()); db2.querySelector('[data-show=dead]').hidden = fed(); }
    body.querySelectorAll('[data-act=towers]').forEach(b => {
      const want = TOWERS[b.dataset.mode];
      b.classList.toggle('active', ['L6', 'L7', 'L9'].every(c => items(c).some(i => i.on) === want.includes(c)));
    });
    body.querySelectorAll('[data-act=knob]').forEach(k => {
      const c = k.dataset.circuit, on = items(c).filter(i => i.on), sp = on.length ? Math.round(on.reduce((t, i) => t + (i.speed ?? 2), 0) / on.length) : 0;
      k.style.setProperty('--rot', `${-120 + sp * 80}deg`);
      body.querySelectorAll(`[data-ticks="${c}"] span`).forEach((s, i) => s.classList.toggle('on', i === sp));
    });
    body.querySelectorAll('[data-strip]').forEach(st => {
      const c = st.dataset.strip, l = items(c), on = l.some(i => i.on), lvl = l.length ? l.reduce((t, i) => t + (i.level ?? 0), 0) / l.length : 0;
      st.classList.toggle('muted', !on);
      st.querySelector('.ctl-meter i').style.height = (on ? Math.max(8, Math.min(100, 70 + lvl * 4)) : 0) + '%';
      const f = st.querySelector('.ctl-fader'); if (document.activeElement !== f) f.value = Math.round(lvl);
      st.querySelector('.ctl-db').textContent = `${lvl > 0 ? '+' : ''}${Math.round(lvl)} dB`;
      const m = st.querySelector('.ctl-mute'); m.textContent = on ? 'ON' : 'MUTE'; m.classList.toggle('on', !on);
    });
    renderStats();
  }

  /* ------------------------------------------------------------ actions */
  const sub = () => Object.keys(SIM.CIRCUITS).filter(c => SIM.CIRCUITS[c].board === 'DB2');
  const blocked = c => !fed() && SIM.CIRCUITS[c]?.board === 'DB2';
  function setCircuit(c, on) { for (const i of items(c)) SIM.update(i.id, { on, ...(on && CAT.byId[i.type].light && !(i.dim > 0) ? { dim: 1 } : {}) }, { record: false }); }
  root.addEventListener('click', e => {
    const t = e.target.closest('[data-tab]');
    if (t && root.contains(t) && t.closest('.ctl-tabs')) { tab = t.dataset.tab; try { localStorage.setItem('ctlTab', tab); } catch (_) {} build(); return; }
    if (e.target.closest('#ctlToggle')) {
      open = panel.hidden; panel.hidden = !open; toggle.setAttribute('aria-expanded', open);
      try { localStorage.setItem('ctlOpen', open ? '1' : '0'); } catch (_) {}
      if (open) build(); return;
    }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const c = el.dataset.circuit;
    switch (el.dataset.act) {
      case 'scene': SIM.applyScene(el.dataset.scene); break;
      case 'breaker': if (blocked(c)) return; { const on = !items(c).some(i => i.on); setCircuit(c, on); SIM.commit((on ? 'Switch on ' : 'Switch off ') + SIM.CIRCUITS[c].label); } break;
      case 'towers': if (!fed()) return; { const want = TOWERS[el.dataset.mode]; for (const x of ['L6', 'L7', 'L9']) setCircuit(x, want.includes(x)); SIM.commit('Towers: ' + el.dataset.mode); } break;
      case 'feeder': {
        const st = SIM.state.settings, was = fed();
        if (was) { st.db2Memory = {}; for (const x of sub()) for (const i of items(x)) { st.db2Memory[i.id] = i.on; SIM.update(i.id, { on: false }, { record: false }); } }
        else for (const x of sub()) for (const i of items(x)) SIM.update(i.id, { on: !!st.db2Memory?.[i.id] }, { record: false });
        st.db2Feed = !was; SIM.commit(was ? 'DB-2 feeder off' : 'DB-2 feeder on'); break;
      }
      case 'knob': {
        const on = items(c).filter(i => i.on), cur = on.length ? Math.round(on.reduce((t, i) => t + (i.speed ?? 2), 0) / on.length) : 0, next = (cur + 1) % 4;
        for (const i of items(c)) SIM.update(i.id, next ? { on: true, speed: Math.min(next, CAT.byId[i.type].fan.speeds.length) } : { on: false }, { record: false });
        SIM.commit(`${SIM.CIRCUITS[c].label}: speed ${next}`); break;
      }
      case 'mute': { const on = !items(c).some(i => i.on); for (const i of items(c)) SIM.update(i.id, { on }, { record: false }); SIM.commit((on ? 'Unmute ' : 'Mute ') + c); break; }
      default: return;
    }
    sync();
  });
  root.addEventListener('change', e => {
    const f = e.target.closest('[data-act=fader]');
    if (!f) return;
    // Move the whole zone; each loudspeaker keeps its own tuned offset.
    const l = items(f.dataset.circuit), v = Number(f.value), avg = l.reduce((t, i) => t + (i.level ?? 0), 0) / (l.length || 1);
    for (const i of l) SIM.update(i.id, { level: Math.max(-30, Math.min(6, (i.level ?? 0) + v - avg)) }, { record: false });
    SIM.commit(`${f.dataset.circuit} level ${f.value} dB`); sync();
  });

  const refresh = () => { if (!panel.hidden) sync(); else renderStats(); };
  SIM.on('analysis', r => { last = r; renderStats(); });
  for (const ev of ['items', 'history', 'scene']) SIM.on(ev, refresh);
  const start = () => { if (SIM.ready) { if (open) build(); renderStats(); } else setTimeout(start, 300); };
  start();
})();
