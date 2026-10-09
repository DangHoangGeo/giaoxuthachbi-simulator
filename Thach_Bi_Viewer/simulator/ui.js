/* Thạch Bi simulator · panel UI. Lists every light, fan, loudspeaker,
 * microphone and decoration with its own switch; edits position, aim and
 * product data; scenes, analysis overlays, checks, energy, listening and
 * camera settings. Talks to the engine only through window.CHURCH_SIMULATOR.
 */
(() => {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR;
  const CAT = window.CHURCH_SIM_CATALOG;
  const P = window.CHURCH_SIM_PHYSICS;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (v, d = 0) => Number.isFinite(v) ? v.toFixed(d) : '–';
  let tab = 'light', panel, body, picking = null, collapsed = new Set(), lastAnalysis = null, hereTimer = 0;
  let noiseSegments = [], soundSegments = [], speechValue = null, noiseTimer = 0;
  const TABS = [
    { id: 'light', label: 'Lights', cat: 'light' },
    { id: 'fan', label: 'Fans', cat: 'fan' },
    { id: 'speaker', label: 'Sound', cat: 'speaker' },
    { id: 'decor', label: 'Décor', cat: 'decor' },
    { id: 'wiring', label: 'Wiring' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'settings', label: 'Settings' }
  ];

  SIM.on('ready', init);

  function init() {
    const actions = document.querySelector('.header-actions');
    const btn = document.createElement('button');
    btn.id = 'simulatorButton'; btn.className = 'text-button sim-launch'; btn.setAttribute('aria-expanded', 'false');
    btn.title = 'Lights, fans, sound and decoration simulator';
    btn.setAttribute('aria-label', 'Simulator');
    btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6m-5 3h4M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z"/></svg><span>Simulator</span>';
    actions.prepend(btn);
    btn.addEventListener('click', () => setOpen(!document.body.classList.contains('sim-open')));

    panel = document.createElement('aside');
    panel.id = 'simPanel'; panel.className = 'sim-panel'; panel.hidden = true;
    panel.setAttribute('aria-label', 'Design simulator');
    panel.innerHTML = `
      <header class="sim-head">
        <div><span class="sim-eyebrow">Design simulator · estimates</span><strong>Lights, fans, sound &amp; décor</strong></div>
        <div class="sim-head-actions">
          <button class="sim-icon" data-act="undo" title="Undo (Ctrl+Z)" aria-label="Undo">↶</button>
          <button class="sim-icon" data-act="redo" title="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷</button>
          <button class="sim-icon sim-close" data-act="close" title="Close" aria-label="Close simulator">×</button>
        </div>
      </header>
      <div class="sim-scene">
        <label for="simScene">Scene</label>
        <select id="simScene"></select>
        <button data-act="save-scene" class="sim-small">Save scene…</button>
      </div>
      <div class="sim-kpis" id="simKpis" aria-live="polite"></div>
      <nav class="sim-tabs" role="tablist">${TABS.map(t => `<button role="tab" data-tab="${t.id}" aria-selected="${t.id === tab}">${t.label}</button>`).join('')}</nav>
      <section class="sim-body" id="simBody"></section>`;
    document.body.append(panel);
    body = $('simBody');
    const extras = document.createElement('div');
    extras.innerHTML = `
      <div id="simReadout" class="sim-readout" hidden></div>
      <div id="simPlacing" class="sim-placing" hidden><span></span><button data-act="cancel-place">Done</button></div>
      <div id="simLegend" class="sim-legend" hidden></div>
      <div id="simNoise" class="sim-noise" role="group" aria-label="Noise and sound levels" hidden>
        <div class="sim-level-row">
          <div class="sim-level-label"><span>Noise estimate</span><b id="simNoiseValue">– dBA</b></div>
          <div id="simNoiseMeter" class="sim-level-track" role="meter" aria-label="Background noise estimate" aria-valuemin="25" aria-valuemax="85">
            <div class="sim-level-segments" aria-hidden="true">${Array.from({ length: 28 }, () => '<i></i>').join('')}</div><i class="sim-level-limit" aria-hidden="true"></i>
          </div>
        </div>
        <div class="sim-level-row">
          <div class="sim-level-label"><span id="simSoundLabel">Sound estimate</span><b id="simSoundValue">– dBA</b></div>
          <div id="simSoundMeter" class="sim-level-track" role="meter" aria-label="Speech level estimate" aria-valuemin="30" aria-valuemax="90">
            <div class="sim-level-segments" aria-hidden="true">${Array.from({ length: 28 }, () => '<i></i>').join('')}</div><i class="sim-level-limit" aria-hidden="true"></i><i class="sim-level-peak" aria-hidden="true" hidden></i>
          </div>
        </div>
      </div>
      <div id="simHere" class="sim-here" hidden>
        <div class="sim-stats"><div id="simStatsScope" class="sim-stats-scope"></div><div id="simHereValues" class="sim-here-values"></div></div>
      </div>`;
    document.body.append(...extras.children);
    noiseSegments = [...$('simNoiseMeter').querySelectorAll('.sim-level-segments i')];
    soundSegments = [...$('simSoundMeter').querySelectorAll('.sim-level-segments i')];
    new ResizeObserver(() => {
      document.body.style.setProperty('--stats-height', `${Math.ceil($('simHere').getBoundingClientRect().height)}px`);
    }).observe($('simHere'));
    $('simPlacing').addEventListener('click', e => { if (e.target.dataset.act === 'cancel-place') SIM.cancelPlacement(); });

    panel.addEventListener('click', onClick);
    panel.addEventListener('keydown', e => {
      if (!['Enter', ' '].includes(e.key)) return;
      const el = e.target.closest('.electrical-plan [data-act]');
      if (el) { e.preventDefault(); SIM.electrical?.action(el); }
    });
    panel.addEventListener('input', onInput);
    panel.addEventListener('change', onChange);
    $('simScene').addEventListener('change', e => { if (e.target.value) { SIM.applyScene(e.target.value); toast('Scene: ' + e.target.value); } });

    SIM.on('items', () => scheduleRender());
    SIM.on('select', id => {
      // Selecting in 3D opens that item's tab so its properties are visible.
      if (id) { const cat = CAT.byId[SIM.item(id).type].cat; if (tab !== cat && TABS.some(t => t.id === cat)) tab = cat; }
      scheduleRender(true);
    });
    SIM.on('history', () => updateUndo());
    SIM.on('electrical-selection', () => { tab = 'wiring'; setOpen(true); scheduleRender(true); });
    SIM.on('electrical', () => { if (tab === 'wiring') scheduleRender(true); });
    SIM.on('analysis', r => { lastAnalysis = r; renderKpis(); if (tab === 'analysis') renderBody(); renderLegend(); });
    SIM.on('analysis-start', () => panel.classList.add('sim-busy'));
    SIM.on('analysis', () => panel.classList.remove('sim-busy'));
    SIM.on('scene', () => renderScenes());
    SIM.on('placing', t => {
      const el = $('simPlacing');
      el.hidden = !t;
      if (t) el.querySelector('span').textContent = `Placing: ${t.name}. Click a ${t.mounts.map(m => ({ pendant: 'beam or ceiling', wall: 'wall or column', floor: 'floor' }[m])).join(' / ')}. Shift-click to place several.`;
    });
    SIM.on('placed', it => toast(`Placed ${it.name} at axis ${SIM.axisName(it.pos[0])}`));
    SIM.on('toast', toast);
    SIM.on('readout', r => showReadout(r));
    SIM.on('frame', ({ mode, camera }) => {
      if (!SIM.analysis || document.body.classList.contains('presentation')) {
        $('simHere').hidden = true; $('simNoise').hidden = true; return;
      }
      const now = performance.now();
      if (now - hereTimer >= 400) { hereTimer = now; showHere(camera, mode); }
      if (!$('simHere').hidden && now - noiseTimer >= 50 && !document.hidden) {
        noiseTimer = now; updateSoundMeter();
      }
    });
    renderScenes(); renderKpis(); renderBody(); updateUndo(); renderMapMarkers();
    SIM.on('items', () => renderMapMarkers());
    SIM.on('select', () => renderMapMarkers());
    if (sessionStorageGet('simOpen') === '1') setOpen(true);
  }

  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } }
  function setOpen(open) {
    panel.hidden = !open;
    document.body.classList.toggle('sim-open', open);
    $('simulatorButton').setAttribute('aria-expanded', String(open));
    $('simulatorButton').classList.toggle('active', open);
    sessionStorageSet('simOpen', open ? '1' : '0');
    renderMapMarkers();
    if (!open) { SIM.cancelPlacement(); SIM.select(null); }
    window.dispatchEvent(new Event('resize'));
  }
  function toast(text) {
    const t = $('toast');
    if (!t) return;
    t.textContent = text; t.classList.add('visible');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('visible'), 2600);
  }
  let renderQueued = false, renderKeepScroll = false;
  function scheduleRender(keep = true) {
    renderKeepScroll ||= keep;
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(() => { renderQueued = false; renderBody(); renderKpis(); renderLegend(); });
  }
  function updateUndo() {
    panel.querySelector('[data-act=undo]').disabled = !SIM.state.history.length;
    panel.querySelector('[data-act=redo]').disabled = !SIM.state.future.length;
  }
  function renderScenes() {
    const sel = $('simScene');
    const names = [...Object.keys(SIM.SCENES), ...SIM.state.customScenes.map(s => s.name)];
    sel.innerHTML = `<option value="">${SIM.state.scene ? 'Current: ' + esc(SIM.state.scene) : 'Choose a scene…'}</option>` + names.map(n => `<option value="${esc(n)}">${esc(n)}</option>`).join('');
  }

  /* ----------------------------------------------------------------- KPIs */
  function kpiClass(kind, v) {
    if (!Number.isFinite(v)) return '';
    if (kind === 'lux') return v >= 200 && v <= 300 ? 'good' : v >= 150 && v <= 500 ? 'fair' : 'poor';
    if (kind === 'sti') return v >= 0.6 ? 'good' : v >= 0.5 ? 'fair' : 'poor';
    if (kind === 'air') return v >= 0.3 && v <= 0.8 ? 'good' : v >= 0.2 && v <= 1.0 ? 'fair' : 'poor';
    if (kind === 'noise') return v <= 40 ? 'good' : v <= 46 ? 'fair' : 'poor';
    return '';
  }
  function renderKpis() {
    const s = SIM.analysis?.results?.seats;
    const pw = SIM.powerSummary();
    const k = (kind, icon, value, unit, label) => `<button class="sim-kpi ${kpiClass(kind, value)}" data-overlay="${kind}" title="${esc(label)} — show on the plan"><span>${icon}</span><strong>${value === null ? '–' : esc(fmt(value, kind === 'sti' ? 2 : kind === 'air' ? 2 : 0))}</strong><small>${unit}</small></button>`;
    $('simKpis').innerHTML = [
      k('lux', '☀', s?.lux?.avg ?? null, 'lux', 'Average maintained light on books at the seats'),
      k('sti', '◉', s?.sti?.avg ?? null, 'STI', 'Average speech intelligibility at the seats'),
      k('air', '≋', s?.air?.avg ?? null, 'm/s', 'Average seated air speed'),
      k('noise', '♪', s?.noise?.avg ?? null, 'dBA', 'Background noise at the seats (fans + ambient)'),
      `<button class="sim-kpi" data-tab-jump="analysis" title="Electrical load of everything switched on"><span>⚡</span><strong>${fmt(pw.total / 1000, 1)}</strong><small>kW</small></button>`
    ].join('');
  }

  /* ----------------------------------------------------------------- body */
  function retainedWingNotice() {
    const retained = SIM.wingReviewStatus?.().sides.filter(s => !s.current) || [];
    if (!retained.length) return '';
    return `<div class="sim-card"><h3>Wing layout retained</h3><p class="sim-hint">Wing ${retained.map(s => esc(s.side)).join(' / ')} uses preserved or custom lights and fans. Compare its equipment with the held review in Wiring.</p><button data-tab-jump="wiring">Review wing layout in Wiring</button></div>`;
  }
  function retainedWingSoundNotice() {
    const retained = SIM.wingSoundStatus?.().sides.filter(s => !s.current) || [];
    if (!retained.length) return '';
    return `<div class="sim-card"><h3>Wing speaker layout retained</h3><p class="sim-hint">Wing ${retained.map(s => esc(s.side)).join(' / ')} uses preserved or custom speakers. Compare its equipment with the held sound review in Wiring.</p><button data-act="wing-sound-review">Review wing speakers in Wiring</button></div>`;
  }
  function retainedWingArtNotice() {
    const retained = SIM.wingArtStatus?.().sides.filter(s => !s.current) || [];
    if (!retained.length) return '';
    return `<div class="sim-card"><h3>Wing picture layout retained</h3><p class="sim-hint">Wing ${retained.map(s => esc(s.side)).join(' / ')} uses preserved or custom saints' pictures. Compare its pictures with the concept review in Wiring.</p><button data-act="wing-art-review">Review wing saints in Wiring</button></div>`;
  }
  function renderBody() {
    const scroll = body.scrollTop;
    for (const b of panel.querySelectorAll('[data-tab]')) b.setAttribute('aria-selected', String(b.dataset.tab === tab));
    const t = TABS.find(x => x.id === tab);
    let html = '';
    if (t.cat) html = renderCategory(t.cat);
    else if (tab === 'analysis') html = renderAnalysis();
    else if (tab === 'wiring') html = SIM.electrical?.renderPanel() || '';
    else html = renderSettings();
    body.innerHTML = (tab !== 'wiring' ? retainedWingNotice() + retainedWingSoundNotice() + retainedWingArtNotice() : '') + html;
    if (renderKeepScroll) body.scrollTop = scroll; else body.scrollTop = 0;
    renderKeepScroll = false;
    if (tab === 'wiring') {
      const key = [SIM.electrical?.view.item, SIM.electrical?.view.selected].join('|');
      if (key !== renderBody.lastElectricalSelection) body.scrollTop = 0;
      renderBody.lastElectricalSelection = key;
    }
    if (tab === 'speaker') SIM.audio?.renderPanel?.(body.querySelector('#simAudio'));
    if (SIM.state.selectedId !== renderBody.lastSelected) {
      renderBody.lastSelected = SIM.state.selectedId;
      body.querySelector('.sim-props')?.scrollIntoView({ block: 'nearest' });
    }
  }

  const circuitItems = c => SIM.state.items.filter(i => i.circuit === c && !i.hidden);

  function itemMeta(it) {
    const t = CAT.byId[it.type];
    const parts = [];
    if (t.light) {
      const lm = it.lumens ?? t.light.lumens;
      parts.push(t.light.wattsPerBulb ? `${CAT.bulbCount(it.params)} bulbs · lumen data needed` : `${Math.round(lm).toLocaleString('en')} lm`, `${it.cct ?? t.light.cct} K`);
      if (t.light.beam) parts.push(`${it.beam ?? t.light.beam}°`);
      if (it.on && (it.dim ?? 1) < 1) parts.push(`${Math.round((it.dim ?? 1) * 100)} %`);
    }
    if (t.fan) parts.push(t.fan.diameter + ' m', it.on && it.speed > 0 ? `speed ${it.speed}/${t.fan.speeds.length}` : 'off');
    if (t.speaker) parts.push(`${fmt(t.speaker.nominal + (it.level ?? 0) + SIM.state.settings.mixerDb)} dBA @1 m`, `${fmt(it.delayMs, 1)} ms`);
    if (t.mic && Number.isFinite(it.feedbackMargin)) parts.push(`feedback margin ${fmt(it.feedbackMargin, 1)} dB`);
    parts.push(`axis ${SIM.axisName(it.pos[0])}`, `${fmt(it.pos[1], 2)} m`);
    const w = SIM.itemWatts(it);
    if (w > 0.5) parts.push(`${fmt(w)} W`);
    return parts.join(' · ');
  }
  function renderCategory(cat) {
    const items = SIM.state.items.filter(it => CAT.byId[it.type]?.cat === cat);
    const groups = new Map();
    for (const it of items) { if (!groups.has(it.circuit)) groups.set(it.circuit, []); groups.get(it.circuit).push(it); }
    const sel = SIM.state.selectedId && SIM.item(SIM.state.selectedId);
    let html = '';
    if (sel && CAT.byId[sel.type].cat === cat) html += renderProps(sel);
    if (cat === 'speaker') html += `<div id="simAudio" class="sim-card sim-audio"></div>`;
    html += `<div class="sim-toolbar"><button class="sim-primary" data-act="add" data-cat="${cat}">＋ Add ${cat === 'light' ? 'a light' : cat === 'fan' ? 'a fan' : cat === 'speaker' ? 'a loudspeaker or mic' : 'a decoration'}</button>
      <span class="sim-count">${items.filter(i => !i.hidden).length} in the model${items.some(i => i.hidden) ? ` · ${items.filter(i => i.hidden).length} hidden alternatives` : ''}</span></div>`;
    if (picking === cat) html += renderPicker(cat);
    const order = Object.keys(SIM.CIRCUITS);
    for (const circuit of [...groups.keys()].sort((a, b) => order.indexOf(a) - order.indexOf(b))) {
      const list = groups.get(circuit);
      const info = SIM.CIRCUITS[circuit] || { label: circuit };
      const anyOn = list.some(i => i.on && !i.hidden);
      const watts = list.reduce((s, i) => s + SIM.itemWatts(i), 0);
      const isCollapsed = collapsed.has(cat + circuit);
      const lights = list.filter(i => CAT.byId[i.type].light);
      const dim = lights.length ? Math.round(100 * lights.reduce((s, i) => s + (i.dim ?? 1), 0) / lights.length) : null;
      html += `<div class="sim-group${isCollapsed ? ' collapsed' : ''}" data-circuit="${circuit}">
        <div class="sim-group-head">
          <label class="sim-switch" title="Switch the whole circuit"><input type="checkbox" data-act="circuit" data-circuit="${circuit}" ${anyOn ? 'checked' : ''}><span></span></label>
          <button class="sim-group-title" data-act="collapse" data-key="${cat + circuit}"><strong>${esc(info.label)}</strong><small>${list.length} · ${fmt(watts)} W</small></button>
          ${dim !== null && cat === 'light' ? `<input type="range" min="0" max="100" value="${dim}" data-act="circuit-dim" data-circuit="${circuit}" aria-label="Dim ${esc(info.label)}" title="Dim level ${dim} %">` : ''}
        </div>
        <div class="sim-rows">${list.map(renderRow).join('')}</div>
      </div>`;
    }
    if (!items.length) html += `<p class="sim-empty">Nothing here yet. Use “Add” and click in the church to place one.</p>`;
    return html;
  }
  function renderRow(it) {
    const selected = it.id === SIM.state.selectedId;
    return `<div class="sim-row${selected ? ' selected' : ''}${it.on ? '' : ' off'}${it.hidden ? ' hidden-item' : ''}" data-id="${it.id}">
      <label class="sim-switch" title="${it.hidden ? 'Hidden alternative' : 'On / off'}"><input type="checkbox" data-act="toggle" ${it.on && !it.hidden ? 'checked' : ''}><span></span></label>
      <button class="sim-row-main" data-act="select"><span class="sim-row-name">${esc(it.name)}${it.hidden ? ' <em>hidden</em>' : ''}</span><span class="sim-row-meta">${esc(itemMeta(it))}</span></button>
      <button class="sim-icon" data-act="focus" title="Show in 3D" aria-label="Show ${esc(it.name)} in 3D">⌖</button>
    </div>`;
  }
  function renderPicker(cat) {
    const types = CAT.types.filter(t => t.cat === cat);
    const fam = new Map();
    for (const t of types) { if (!fam.has(t.family)) fam.set(t.family, []); fam.get(t.family).push(t); }
    return `<div class="sim-picker"><div class="sim-picker-head"><strong>Choose, then click in the church</strong><button class="sim-icon" data-act="close-picker" aria-label="Close">×</button></div>
      ${[...fam.entries()].map(([f, list]) => `<h4>${esc(f)}</h4><div class="sim-picker-grid">${list.map(t => `<button data-act="place" data-type="${t.id}"><strong>${esc(t.name)}</strong><small>${esc(t.desc || '')}</small></button>`).join('')}</div>`).join('')}
    </div>`;
  }

  /* --------------------------------------------------------- properties */
  function field(label, html, wide = false) { return `<label class="sim-field${wide ? ' wide' : ''}"><span>${label}</span>${html}</label>`; }
  function num(key, value, step = 0.05, min, max) { return `<input type="number" data-prop="${key}" value="${fmt(value, step < 0.1 ? 2 : step < 1 ? 1 : 0)}" step="${step}" ${min !== undefined ? `min="${min}"` : ''} ${max !== undefined ? `max="${max}"` : ''}>`; }
  function range(key, value, min, max, step, out) { return `<span class="sim-range"><input type="range" data-prop="${key}" value="${value}" min="${min}" max="${max}" step="${step}"><output>${out}</output></span>`; }
  function renderProps(it) {
    const t = CAT.byId[it.type];
    const fy = SIM.floorY(it.pos[0], it.pos[2]);
    let html = `<div class="sim-card sim-props" data-id="${it.id}">
      <div class="sim-props-head"><input class="sim-name" data-prop="name" value="${esc(it.name)}" aria-label="Name"><button class="sim-icon" data-act="deselect" aria-label="Close properties">×</button></div>
      <p class="sim-type"><strong>${esc(t.name)}</strong> ${esc(t.desc || '')}</p>
      ${it.note ? `<p class="sim-note">${esc(it.note)}</p>` : ''}
      <div class="sim-fields">`;
    html += field('Axis', `<output class="sim-static">${esc(SIM.axisName(it.pos[0]))}</output>`);
    html += field('Circuit', `<select data-prop="circuit">${Object.entries(SIM.CIRCUITS).filter(([, c]) => c.cat === t.cat || (t.cat === 'decor' && c.cat === 'decor') || (t.light && c.cat === 'light')).map(([k, c]) => `<option value="${k}" ${k === it.circuit ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select>`);
    html += field('X along nave (m)', num('x', it.pos[0], 0.05));
    html += field('Z across (m)', num('z', it.pos[2], 0.05));
    html += field(it.mount === 'pendant' ? 'Height of fixture (m above floor)' : it.mount === 'floor' ? 'Base height (m)' : 'Mounting height (m above floor)', num('h', it.pos[1] - (it.mount === 'floor' ? 0 : fy), 0.05));
    if (it.mount === 'pendant') html += field('Hangs from', `<output class="sim-static">${fmt(it.anchorY, 2)} m · ${fmt((it.anchorY ?? it.pos[1]) - it.pos[1], 2)} m rod</output>`);
    if (t.aim || t.fan?.kind === 'jet' || t.speaker) {
      html += field('Aim · direction (°)', range('yaw', Math.round(it.yaw), -180, 180, 1, Math.round(it.yaw) + '°'));
      html += field('Aim · tilt (°)', range('tilt', Math.round(it.tilt), -90, 90, 1, Math.round(it.tilt) + '°'));
    } else if (it.mount !== 'pendant' || t.cat === 'decor') {
      html += field('Rotation (°)', range('yaw', Math.round(it.yaw), -180, 180, 1, Math.round(it.yaw) + '°'));
    }
    if (t.light) {
      const L = t.light, lm = it.lumens ?? L.lumens;
      if (L.lumens > 0) html += field('Output (lumens)', range('lumens', lm, Math.round(L.lumens * 0.25), Math.round(L.lumens * 2), Math.max(10, Math.round(L.lumens / 100)), `${Math.round(lm)} lm · ${fmt(L.watts * lm / L.lumens)} W`), true);
      else if (L.wattsPerBulb) html += field('String load', `<output class="sim-static">${CAT.bulbCount(it.params)} bulbs · ${fmt(SIM.itemWatts(it, true))} W rated</output>`, true);
      html += field('Dimmer', range('dim', Math.round((it.dim ?? 1) * 100), 0, 100, 1, Math.round((it.dim ?? 1) * 100) + ' %'));
      html += field('Colour temperature', `<select data-prop="cct">${[1900, 2200, 2700, 3000, 3500, 4000, 5000].map(k => `<option value="${k}" ${(it.cct ?? L.cct) === k ? 'selected' : ''}>${k} K${k === 2700 ? ' · warm' : k === 3000 ? ' · warm white' : k === 4000 ? ' · neutral' : ''}</option>`).join('')}</select>`);
      if (L.beam) html += field('Beam angle', `<select data-prop="beam">${[...new Set([...(L.optics || []), L.beam, it.beam ?? L.beam, 60, 80, 100])].sort((a, b) => a - b).map(b => `<option value="${b}" ${(it.beam ?? L.beam) === b ? 'selected' : ''}>${b}°</option>`).join('')}</select>`);
      if (L.beam && t.shadow !== undefined) html += field('Cast shadows', `<input type="checkbox" data-prop="shadow" ${it.shadow ? 'checked' : ''}>`);
    }
    if (t.fan) {
      html += field('Speed', `<span class="sim-seg">${['Off', ...t.fan.speeds.map((_, i) => String(i + 1))].map((l, i) => `<button data-act="speed" data-speed="${i}" class="${(it.on ? it.speed : 0) === i ? 'active' : ''}">${l}</button>`).join('')}</span>`, true);
      const running = it.on && !it.hidden && it.speed > 0;
      const sp = t.fan.speeds[Math.max(0, (it.speed || 1) - 1)];
      html += field('At this speed', `<output class="sim-static">${running ? `${fmt(sp.flow * 60)} m³/min · ${sp.rpm} rpm · ${sp.watts} W · ${sp.dBA} dBA @1 m` : 'Stopped · 0 W · no fan airflow or noise'}</output>`, true);
      if (t.fan.oscillate) html += field('Oscillate', `<input type="checkbox" data-prop="oscillate" ${it.oscillate !== false ? 'checked' : ''}>`);
    }
    if (t.speaker) {
      const S = t.speaker, lvl = S.nominal + (it.level ?? 0) + SIM.state.settings.mixerDb;
      const w = Math.pow(10, (lvl + 10 - S.sensitivity) / 10);
      html += field('Level trim', range('level', it.level ?? 0, -30, 12, 0.5, `${fmt(it.level ?? 0, 1)} dB → ${fmt(lvl)} dBA @1 m`), true);
      html += field('Delay', `<span class="sim-inline">${num('delayMs', it.delayMs ?? 0, 0.5, 0, 400)}<button data-act="align" class="sim-small">Align all</button></span>`);
      html += field('Amplifier peak', `<output class="sim-static ${!S.active && w > S.ratedW ? 'bad' : ''}">${fmt(w)} W of ${S.ratedW} W${S.active ? ' (self-powered)' : ''}</output>`);
    }
    for (const [k, p] of Object.entries(t.params || {})) {
      const v = it.params?.[k] ?? p.value;
      if (p.options) html += field(p.label, `<select data-param="${k}">${Object.entries(p.options).map(([ov, ol]) => `<option value="${ov}" ${ov === v ? 'selected' : ''}>${esc(ol)}</option>`).join('')}</select>`);
      else if (p.type === 'bool') html += field(p.label, `<input type="checkbox" data-param="${k}" ${v ? 'checked' : ''}>`);
      else html += field(p.label, range('param:' + k, v, p.min, p.max, p.step, String(v)));
    }
    html += `</div><div class="sim-actions">
      <button data-act="focus-selected">Show</button>
      <button data-act="duplicate">Duplicate</button>
      <button data-act="mirror">Mirror B ↔ H</button>
      <button data-act="repeat" title="Copy onto the same position in every bay 3…9">Repeat on bays</button>
      <button data-act="hide">${it.hidden ? 'Show in model' : 'Hide'}</button>
      <button data-act="delete" class="danger">Delete</button>
    </div><p class="sim-hint">Drag it in the 3D view to slide it along its beam, wall or floor (click once to select, then drag). Shift-drag changes the height.</p></div>`;
    return html;
  }

  /* -------------------------------------------------------------- analysis */
  function renderAnalysis() {
    const A = SIM.analysis, r = A?.results || {}, s = r.seats;
    const ov = SIM.state.settings.overlay;
    const room = SIM.room();
    const kinds = [['none', 'Off'], ['lux', 'Light'], ['spl', 'Speech level'], ['sti', 'Clarity (STI)'], ['air', 'Air speed'], ['noise', 'Noise']];
    let html = `<div class="sim-card"><h3>Show on the plan</h3>
      <div class="sim-seg wide">${kinds.map(([k, l]) => `<button data-act="overlay" data-kind="${k}" class="${ov === k ? 'active' : ''}">${l}</button>`).join('')}</div>
      ${ov !== 'none' ? legendHtml(ov) : '<p class="sim-hint">Colour the floor plan with predicted values. Hover it to read a value; in Walk mode the value under you appears at the bottom.</p>'}
      <div class="sim-actions"><button data-act="plan-view">Plan view (roof off)</button><button data-act="perspective-view">Cutaway view</button><button data-act="recompute">Recalculate</button></div></div>`;
    if (s) {
      const row = (label, value, target, cls) => `<tr><th>${label}</th><td class="${cls || ''}">${value}</td><td>${target}</td></tr>`;
      html += `<div class="sim-card"><h3>At the ${s.n} sampled seats</h3><table class="sim-table"><tr><th></th><th>Result</th><th>Brief target</th></tr>
        ${row('Light on books (maintained)', `${fmt(s.lux.avg)} lux avg · ${fmt(s.lux.min)} min`, '200–300 lux', kpiClass('lux', s.lux.avg))}
        ${row('Seats ≥ 200 lux', `${fmt(s.luxOk)} %`, 'all', s.luxOk > 90 ? 'good' : s.luxOk > 70 ? 'fair' : 'poor')}
        ${row('Uniformity (min / avg)', fmt(s.lux.u0, 2), '≥ 0.4 suggested', s.lux.u0 >= 0.4 ? 'good' : 'fair')}
        ${s.sti ? row('Speech clarity STI', `${fmt(s.sti.avg, 2)} avg · ${fmt(s.sti.min, 2)} min · ${P.stiRating(s.sti.avg)}`, '≥ 0.60 every seat', kpiClass('sti', s.sti.avg)) : row('Speech clarity STI', 'no speech source on', '≥ 0.60', 'poor')}
        ${s.sti ? row('Seats ≥ 0.60 / ≥ 0.50', `${fmt(s.stiOk)} % / ${fmt(s.stiFair)} %`, '100 %', s.stiOk > 90 ? 'good' : s.stiOk > 60 ? 'fair' : 'poor') : ''}
        ${s.spl ? row('Speech level (energy average)', `${fmt(s.spl.avg)} dBA · ${fmt(s.spl.p05, 1)}–${fmt(s.spl.p95, 1)} dBA at 90 % of seats`, '90 % seat span ≤ 6 dB', s.splSpread <= 6 ? 'good' : 'fair') : ''}
        ${row('Background noise', `${fmt(s.noise.avg)} dBA`, '≈35 dBA where practicable', kpiClass('noise', s.noise.avg))}
        ${row('Seated air speed', `${fmt(s.air.avg, 2)} m/s avg · ${fmt(s.air.min, 2)} min`, '0.3–0.8 m/s trial', kpiClass('air', s.air.avg))}
        ${row('Seats in 0.3–0.8 m/s', `${fmt(s.airOk)} %`, 'most seats', s.airOk > 80 ? 'good' : s.airOk > 50 ? 'fair' : 'poor')}
        ${row('Feels cooler by', `≈ ${fmt(s.cooling.avg, 1)} °C`, 'empirical warm/seated estimate', '')}
      </table>${Object.keys(s.blocks).length ? `<p class="sim-hint">${Object.entries(s.blocks).map(([b, v]) => `${b} block: ${fmt(v.lux.avg)} lux, STI ${v.sti ? fmt(v.sti.avg, 2) : '–'}, ${fmt(v.air.avg, 2)} m/s`).join(' · ')}</p>` : ''}
      <p class="sim-hint">Design estimates use representative equipment data. Light excludes daylight and bulb strings with no lumen data; air speed covers fan airflow at 0.6 m, excluding natural wind. Speech and noise use energy averages at seated ear height (1.2 m). Confirm the model with actual product data and site readings.</p></div>`;
    } else html += `<div class="sim-card"><p>Calculating…</p></div>`;
    html += `<div class="sim-card"><h3>Room acoustics</h3>
      <div class="sim-rt">${room.T.map((t, b) => `<div><span style="height:${Math.min(100, t / 5 * 100)}%"></span><small>${P.OCTAVES[b] >= 1000 ? P.OCTAVES[b] / 1000 + 'k' : P.OCTAVES[b]}</small><b>${fmt(t, 1)}</b></div>`).join('')}</div>
      <p class="sim-hint">Reverberation time (s) per octave, Eyring with air absorption. Volume ${fmt(room.V)} m³. Mid-frequency ${fmt(room.Tmid, 2)} s — ${room.Tmid > 2 ? 'very reverberant: speech needs directional loudspeakers and absorption' : room.Tmid > 1.6 ? 'reverberant: good for singing, demanding for speech' : room.Tmid > 1.0 ? 'balanced for speech and congregational singing' : 'dry: clear speech, less support for singing'}.</p>
      <div class="sim-fields">
        ${field('Congregation', `<span class="sim-range"><input type="range" data-setting="occupancy" min="0" max="1" step="0.05" value="${SIM.state.settings.occupancy}"><output>${fmt(SIM.state.settings.occupancy * 100)} %</output></span>`, true)}
        ${field('Doors & side openings', `<span class="sim-range"><input type="range" data-setting="openings" min="0" max="1" step="0.1" value="${SIM.state.settings.openings}"><output>${fmt(SIM.state.settings.openings * 100)} % open</output></span>`, true)}
        ${field('Roof underside', `<select data-setting="roofFinish">${Object.entries(P.ROOF_FINISHES).map(([k, f]) => `<option value="${k}" ${SIM.state.settings.roofFinish === k ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>`, true)}
        ${field('Entrance hall finish', `<select data-setting="entranceFinish">${Object.entries(P.ENTRANCE_FINISHES).map(([k, f]) => `<option value="${k}" ${SIM.state.settings.entranceFinish === k ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>`, true)}
        ${field('Outdoor & people noise', `<span class="sim-range"><input type="range" data-setting="ambientDbA" min="25" max="55" step="1" value="${SIM.state.settings.ambientDbA}"><output>${SIM.state.settings.ambientDbA} dBA</output></span>`, true)}
      </div></div>`;
    const checks = A?.checks || [];
    html += `<div class="sim-card"><h3>Design checks</h3>${checks.length ? `<ul class="sim-checks">${checks.map(c => `<li class="${c.level}"><strong>${esc(c.title)}</strong><span>${esc(c.detail)}</span>${c.ids.length ? `<button class="sim-small" data-act="select-id" data-id="${esc(c.ids[0])}">Show</button>` : ''}</li>`).join('')}</ul>` : '<p class="sim-hint">No issues found.</p>'}</div>`;
    const pw = SIM.powerSummary(), st = SIM.state.settings;
    html += `<div class="sim-card"><h3>Service electricity estimate</h3>
      <table class="sim-table compact">${pw.byCircuit.filter(c => c.watts > 0.5 || c.rated > 0).map(c => `<tr><th>${esc(c.label)}</th><td>${fmt(c.watts)} W</td><td>${c.on}/${c.count} on</td></tr>`).join('')}
      <tr class="total"><th>Everything switched on now</th><td>${fmt(pw.total)} W</td><td></td></tr></table>
      <div class="sim-fields">
        ${field('Hours per service', `<input type="number" data-setting="serviceHours" min="0.25" max="12" step="0.25" value="${st.serviceHours}">`)}
        ${field('Services per month', `<input type="number" data-setting="servicesPerMonth" min="1" max="120" step="1" value="${st.servicesPerMonth}">`)}
        ${field('Tariff (VND/kWh)', `<input type="number" data-setting="tariff" min="0" max="10000" step="50" value="${st.tariff}">`)}
      </div>
      <p class="sim-result">${fmt(pw.kWhService, 1)} kWh per service · ${fmt(pw.kWhMonth)} kWh per month · ≈ ${Math.round(pw.costMonth).toLocaleString('vi-VN')} ₫ per month for services</p>
      <p class="sim-hint">Uses the equipment currently on for every service. Enter your service count, hours and tariff above. Preparation, cleaning and other use between services are excluded.</p>
      <p class="sim-hint">Uses LED output and driver allowances, string bulb counts, fan speed curves and amplifier estimates. Confirm with actual equipment ratings and metered data.</p></div>`;
    html += `<div class="sim-card"><h3>Save &amp; share</h3><div class="sim-actions">
      <button data-act="export-json">Download layout (.json)</button>
      <button data-act="import-json">Open layout…</button>
      <button data-act="export-csv">Fixture schedule (.csv)</button>
      <button data-act="screenshot">Save picture</button></div>
      <input type="file" id="simImportFile" accept="application/json,.json" hidden>
      <p class="sim-hint">Your design is also saved automatically in this browser.</p></div>`;
    return html;
  }
  function legendHtml(kind) {
    const K = SIM.analysis.KINDS[kind];
    const stops = K.stops;
    const grad = stops.map((s, i) => `${s[1]} ${(i / (stops.length - 1) * 100).toFixed(0)}%`).join(',');
    return `<div class="sim-legend-bar"><span style="background:linear-gradient(90deg,${grad})"></span><div>${stops.map(s => `<small>${kind === 'sti' || kind === 'air' ? s[0] : Math.round(s[0])}</small>`).join('')}</div></div>
      <p class="sim-hint">${esc(K.label)} (${K.unit}) at ${K.height} m above each floor${kind === 'lux' ? `, maintained (×${SIM.state.settings.maintenance})` : ''}. Target ${K.target[0]}${K.target[1] < 100 && kind !== 'noise' ? '–' + K.target[1] : kind === 'noise' ? '' : '+'} ${K.unit}${kind === 'noise' ? ' or quieter' : ''}.</p>`;
  }
  function renderLegend() {
    const ov = SIM.state.settings.overlay, el = $('simLegend');
    if (!el) return;
    el.hidden = ov === 'none' || !SIM.analysis?.KINDS[ov];
    if (!el.hidden) el.innerHTML = `<strong>${esc(SIM.analysis.KINDS[ov].label)}</strong>${legendHtml(ov)}`;
  }

  /* -------------------------------------------------------------- settings */
  function renderSettings() {
    const s = SIM.state.settings;
    const sw = (key, label, hint = '') => `<label class="switch-row"><span>${label}${hint ? `<small>${hint}</small>` : ''}</span><input type="checkbox" data-setting="${key}" ${s[key] ? 'checked' : ''}></label>`;
    const rng = (key, label, min, max, step, out) => field(label, `<span class="sim-range"><input type="range" data-setting="${key}" min="${min}" max="${max}" step="${step}" value="${s[key]}"><output>${out}</output></span>`, true);
    return `<div class="sim-card"><h3>How the church looks</h3>
      ${rng('lensDeg', 'Walking lens (horizontal field of view)', 45, 110, 1, s.lensDeg + '°')}
      <p class="sim-hint">75° is close to natural perspective on a laptop or monitor. The earlier 68° vertical lens (≈100° horizontal) stretched near columns and made the nave feel crowded.</p>
      ${rng('eyeHeight', 'Standing eye height', 1.3, 1.85, 0.01, fmt(s.eyeHeight, 2) + ' m')}
      ${rng('walkSpeed', 'Walking speed', 0.8, 2.5, 0.1, fmt(s.walkSpeed, 1) + ' m/s')}
      ${rng('adaptLux', 'Eye adaptation (evening)', 40, 500, 10, s.adaptLux + ' lux')}
      ${sw('autoExposure', 'Automatic eye adaptation', 'Adapts to the light where you stand, like the eye. Off keeps room brightness fixed when moving.')}
      ${rng('halos', 'Lamp glow', 0, 2, 0.1, fmt(s.halos, 1) + '×')}
      ${field('Rendering quality', `<select data-setting="quality">${Object.entries(SIM.QUALITY).map(([k, q]) => `<option value="${k}" ${s.quality === k ? 'selected' : ''}>${esc(q.label)}</option>`).join('')}</select>`, true)}
      ${sw('autoQuality', 'Automatically reduce rendering work when walking stutters')}
      <p class="sim-hint">${(() => { const p = SIM.poolStats(); return p ? `All ${p.emitters} active light sources illuminate surfaces at every distance. View settings → Preview resolution can adapt image size for slower computers. This light budget keeps illumination, reflections and shadow sources. Analysis always uses every source.` : ''; })()}</p>
      </div>
      <div class="sim-card"><h3>Structure &amp; finishes</h3>
      ${field('Timber frame', `<select data-setting="frameStyle"><option value="drawn" ${s.frameStyle !== 'reference' ? 'selected' : ''}>As drawn (PDF section 4)</option><option value="reference" ${s.frameStyle === 'reference' ? 'selected' : ''}>Reference image (open collar truss)</option></select>`, true)}
      ${sw('showTruss', 'Show earlier proposed truss bracing', 'King posts, diagonals and knee braces are not on section sheet 4.')}
      ${field('Structural timber tone', `<select data-setting="timberTone"><option value="reference" ${s.timberTone === 'reference' ? 'selected' : ''}>Red lacquer and gold (as the sanctuary)</option><option value="natural" ${s.timberTone === 'natural' ? 'selected' : ''}>Natural timber (medium)</option><option value="light" ${s.timberTone === 'light' ? 'selected' : ''}>Light oak</option><option value="dark" ${s.timberTone === 'dark' ? 'selected' : ''}>Dark stained</option></select>`, true)}
      ${field('Roof underside', `<select data-setting="roofFinish">${Object.entries(P.ROOF_FINISHES).map(([k, f]) => `<option value="${k}" ${s.roofFinish === k ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>`, true)}
      ${field('Entrance hall finish', `<select data-setting="entranceFinish">${Object.entries(P.ENTRANCE_FINISHES).map(([k, f]) => `<option value="${k}" ${s.entranceFinish === k ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}</select>`, true)}
      ${rng('maintenance', 'Lighting maintenance factor', 0.6, 1, 0.05, fmt(s.maintenance, 2))}
      </div>
      <div class="sim-card"><h3>Editing</h3>
      ${sw('edit', 'Drag fixtures in the 3D view')}
      ${sw('snap', 'Snap hanging fixtures to the beams')}
      <div class="sim-actions"><button data-act="reset-design">Restore the recommended design</button><button data-act="clear-storage" class="danger">Forget saved changes</button></div>
      <p class="sim-hint">Keyboard: Delete removes the selected item, Ctrl+D duplicates, Ctrl+Z / Ctrl+Shift+Z undo and redo, Esc cancels.</p></div>`;
  }

  /* ---------------------------------------------------------------- events */
  function itemFromEvent(e) { const row = e.target.closest('[data-id]'); return row ? SIM.item(row.dataset.id) : null; }
  function onClick(e) {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) { tab = tabBtn.dataset.tab; picking = null; renderBody(); renderMapMarkers(); return; }
    const kpi = e.target.closest('[data-overlay]');
    if (kpi) { SIM.setOverlay(kpi.dataset.overlay); tab = 'analysis'; renderBody(); renderLegend(); return; }
    const jump = e.target.closest('[data-tab-jump]');
    if (jump && TABS.some(t => t.id === jump.dataset.tabJump)) { tab = jump.dataset.tabJump; picking = null; renderBody(); renderMapMarkers(); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act, it = itemFromEvent(e);
    if (act.startsWith('electrical-') && el.tagName === 'SELECT') return;
    if (act.startsWith('electrical-')) { SIM.electrical?.action(el); return; }
    switch (act) {
      case 'close': setOpen(false); break;
      case 'undo': { const l = SIM.undo(); if (l) toast('Undo: ' + l); break; }
      case 'redo': { const l = SIM.redo(); if (l) toast('Redo: ' + l); break; }
      case 'wing-sound-review': tab = 'wiring'; picking = null; renderBody(); renderMapMarkers(); break;
      case 'wing-art-review': tab = 'wiring'; picking = null; renderBody(); renderMapMarkers(); break;
      case 'wing-adopt': {
        const side = el.dataset.side;
        if (el.disabled || !['B', 'H'].includes(side)) break;
        try {
          const status = SIM.wingReviewStatus?.().sides.find(s => s.side === side);
          if (!status || !SIM.adoptWingReview) throw new Error('Wing review is unavailable.');
          if (status.conflictIds.length) throw new Error('Resolve conflicting equipment IDs: ' + status.conflictIds.join(', '));
          if (status.current) { toast(`Wing ${side} already uses the reviewed layout.`); break; }
          const result = SIM.adoptWingReview(side);
          renderBody(); updateUndo();
          toast(result.changedIds.length ? `Wing ${side} review adopted. Full browser backup saved; use Undo.` : `Wing ${side} already uses the reviewed layout.`);
        } catch (err) {
          renderBody();
          toast(`Could not apply wing ${side} review: ${err.message || String(err)}`);
        }
        break;
      }
      case 'wing-sound-adopt': {
        const side = el.dataset.side;
        if (el.disabled || !['B', 'H'].includes(side)) break;
        try {
          const status = SIM.wingSoundStatus?.().sides.find(s => s.side === side);
          if (!status || !SIM.adoptWingSound) throw new Error('Wing sound review is unavailable.');
          if (status.current) { toast(`Wing ${side} already uses the reviewed speaker.`); break; }
          const result = SIM.adoptWingSound(side);
          renderBody(); updateUndo();
          toast(result.changedIds.length || result.retiredIds.length ? `Wing ${side} speaker review adopted. Full browser backup saved; use Undo.` : `Wing ${side} already uses the reviewed speaker.`);
        } catch (err) {
          renderBody();
          toast(`Could not apply wing ${side} speaker review: ${err.message || String(err)}`);
        }
        break;
      }
      case 'wing-art-adopt': {
        const side = el.dataset.side;
        if (el.disabled || !['B', 'H'].includes(side)) break;
        try {
          const status = SIM.wingArtStatus?.().sides.find(s => s.side === side);
          if (!status || !SIM.adoptWingArt) throw new Error('Wing saints review is unavailable.');
          if (status.conflictIds.length) throw new Error('Resolve conflicting picture IDs: ' + status.conflictIds.join(', '));
          if (status.current) { toast(`Wing ${side} already uses the reviewed saints' pictures.`); break; }
          const result = SIM.adoptWingArt(side);
          renderBody(); updateUndo();
          toast(result.changedIds.length ? `Wing ${side} saints review adopted. Full browser backup saved; use Undo.` : `Wing ${side} already uses the reviewed saints' pictures.`);
        } catch (err) {
          renderBody();
          toast(`Could not apply wing ${side} saints review: ${err.message || String(err)}`);
        }
        break;
      }
      case 'save-scene': { const n = prompt('Name this scene (for example “Sunday 6 pm Mass”):'); if (n) { SIM.saveScene(n.trim()); renderScenes(); toast('Saved scene ' + n); } break; }
      case 'select': if (it) { SIM.select(it.id === SIM.state.selectedId ? null : it.id); } break;
      case 'deselect': SIM.select(null); break;
      case 'focus': if (it) { SIM.select(it.id); SIM.focusItem(it.id); } break;
      case 'focus-selected': SIM.focusItem(SIM.state.selectedId); break;
      case 'collapse': { const k = el.dataset.key; collapsed.has(k) ? collapsed.delete(k) : collapsed.add(k); renderBody(); break; }
      case 'add': picking = picking === el.dataset.cat ? null : el.dataset.cat; renderBody(); break;
      case 'close-picker': picking = null; renderBody(); break;
      case 'place': picking = null; renderBody(); SIM.beginPlacement(el.dataset.type); break;
      case 'duplicate': SIM.duplicate(SIM.state.selectedId); break;
      case 'mirror': SIM.mirror(SIM.state.selectedId); break;
      case 'repeat': { const made = SIM.repeatBays(SIM.state.selectedId); toast(made.length ? `Added ${made.length} copies on bays 3–9` : 'Every bay already has one'); break; }
      case 'hide': { const s = SIM.item(SIM.state.selectedId); SIM.update(s.id, { hidden: !s.hidden, on: s.hidden ? true : s.on }); break; }
      case 'delete': { const s = SIM.item(SIM.state.selectedId); if (s) { SIM.remove(s.id); toast('Deleted ' + s.name + ' (Ctrl+Z to undo)'); } break; }
      case 'speed': { const s = SIM.item(SIM.state.selectedId); const v = Number(el.dataset.speed); SIM.update(s.id, v === 0 ? { on: false } : { on: true, speed: v }); break; }
      case 'align': { SIM.alignDelays(); toast('Loudspeakers time-aligned to the talker at the microphone (+12 ms)'); break; }
      case 'overlay': SIM.setOverlay(el.dataset.kind); renderBody(); renderLegend(); break;
      case 'plan-view': window.church.setView('overhead'); window.church.setRoof(false); break;
      case 'perspective-view': window.church.setView('cutaway'); break;
      case 'recompute': SIM.analysis.run(); break;
      case 'select-id': SIM.select(el.dataset.id); SIM.focusItem(el.dataset.id); break;
      case 'export-json': download('thach-bi-simulator-layout.json', JSON.stringify(SIM.exportLayout(), null, 1), 'application/json'); break;
      case 'export-csv': download('thach-bi-fixture-schedule.csv', '﻿' + SIM.exportSchedule(), 'text/csv'); break;
      case 'import-json': body.querySelector('#simImportFile').click(); break;
      case 'screenshot': window.church.exportPNG(); break;
      case 'reset-design': if (confirm('Replace the current layout with the recommended design? (Undo is available.)')) { SIM.resetDesign(); toast('Recommended design restored'); } break;
      case 'clear-storage': if (confirm('Forget the saved layout in this browser and reload?')) { try { localStorage.removeItem('thachbi.simulator.v1'); } catch { /* ignore */ } location.reload(); } break;
    }
  }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.download = name; a.href = URL.createObjectURL(new Blob([text], { type }));
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.act === 'circuit-dim') {
      SIM.batch(() => { for (const it of SIM.state.items) if (it.circuit === t.dataset.circuit && CAT.byId[it.type].light) SIM.update(it.id, { dim: t.value / 100, on: t.value > 0 }, { record: false }); });
      t.title = `Dim level ${t.value} %`;
      return;
    }
    if (t.dataset.setting && t.type === 'range') {
      const v = Number(t.value);
      SIM.setSetting(t.dataset.setting, v);
      const out = t.parentElement.querySelector('output');
      if (out) out.textContent = settingLabel(t.dataset.setting, v);
      return;
    }
    const props = t.closest('.sim-props');
    if (!props || t.type !== 'range') return;
    const it = SIM.item(props.dataset.id);
    const key = t.dataset.prop, v = Number(t.value);
    const patch = {};
    if (key === 'yaw') patch.yaw = v;
    else if (key === 'tilt') patch.tilt = v;
    else if (key === 'lumens') patch.lumens = v;
    else if (key === 'dim') { patch.dim = v / 100; patch.on = v > 0; }
    else if (key === 'level') patch.level = v;
    else if (key?.startsWith('param:')) { patch.params = { ...it.params, [key.slice(6)]: v }; }
    SIM.update(it.id, patch, { record: false });
    const out = t.parentElement.querySelector('output');
    if (out) out.textContent = key === 'yaw' || key === 'tilt' ? v + '°' : key === 'lumens' ? `${Math.round(v)} lm · ${fmt(CAT.byId[it.type].light.watts * v / CAT.byId[it.type].light.lumens)} W` : key === 'dim' ? v + ' %' : key === 'level' ? `${fmt(v, 1)} dB → ${fmt(CAT.byId[it.type].speaker.nominal + v + SIM.state.settings.mixerDb)} dBA @1 m` : String(v);
  }
  function settingLabel(key, v) {
    return { lensDeg: v + '°', eyeHeight: fmt(v, 2) + ' m', walkSpeed: fmt(v, 1) + ' m/s', adaptLux: v + ' lux', halos: fmt(v, 1) + '×', maintenance: fmt(v, 2), occupancy: fmt(v * 100) + ' %', openings: fmt(v * 100) + ' % open', ambientDbA: v + ' dBA' }[key] ?? String(v);
  }
  function onChange(e) {
    const t = e.target;
    if (t.matches('select[data-act=electrical-review-circuit]')) { SIM.electrical?.action(t); return; }
    if (t.id === 'simImportFile') {
      const f = t.files?.[0];
      if (!f) return;
      f.text().then(txt => { const n = SIM.importLayout(txt); toast(`Opened ${n} fixtures from ${f.name}`); renderScenes(); renderBody(); }).catch(err => alert('Could not open this layout: ' + err.message));
      return;
    }
    if (t.dataset.act === 'toggle') { const it = itemFromEvent(e); SIM.update(it.id, { on: t.checked, hidden: t.checked ? false : it.hidden }); return; }
    if (t.dataset.act === 'circuit') {
      SIM.batch(() => { for (const it of SIM.state.items) if (it.circuit === t.dataset.circuit && !it.hidden) SIM.update(it.id, { on: t.checked, ...(t.checked && CAT.byId[it.type].light && !(it.dim > 0) ? { dim: 1 } : {}) }, { record: false }); });
      SIM.commit((t.checked ? 'Switch on ' : 'Switch off ') + (SIM.CIRCUITS[t.dataset.circuit]?.label || t.dataset.circuit));
      return;
    }
    if (t.dataset.act === 'circuit-dim') { SIM.commit('Dim ' + t.dataset.circuit); return; }
    if (t.dataset.setting) {
      const v = t.type === 'checkbox' ? t.checked : t.type === 'number' || t.type === 'range' ? Number(t.value) : t.value;
      SIM.setSetting(t.dataset.setting, v);
      if (['serviceHours', 'servicesPerMonth', 'tariff', 'roofFinish', 'entranceFinish'].includes(t.dataset.setting)) renderBody();
      return;
    }
    const props = t.closest('.sim-props');
    if (!props) return;
    const it = SIM.item(props.dataset.id);
    const fy = SIM.floorY(it.pos[0], it.pos[2]);
    const key = t.dataset.prop;
    if (t.dataset.param) { const v = t.type === 'checkbox' ? t.checked : t.value; SIM.update(it.id, { params: { ...it.params, [t.dataset.param]: v } }); return; }
    if (t.type === 'range') { SIM.commit('Edit ' + it.name); renderKpis(); return; }
    const patch = {};
    if (key === 'name') patch.name = t.value.trim() || it.name;
    else if (key === 'circuit') patch.circuit = t.value;
    else if (key === 'x') patch.pos = [Number(t.value), it.pos[1], it.pos[2]];
    else if (key === 'z') patch.pos = [it.pos[0], it.pos[1], Number(t.value)];
    else if (key === 'h') patch.pos = [it.pos[0], Number(t.value) + (it.mount === 'floor' ? 0 : fy), it.pos[2]];
    else if (key === 'cct') patch.cct = Number(t.value);
    else if (key === 'beam') patch.beam = Number(t.value);
    else if (key === 'shadow') patch.shadow = t.checked;
    else if (key === 'oscillate') patch.oscillate = t.checked;
    else if (key === 'delayMs') patch.delayMs = Math.max(0, Number(t.value));
    if (patch.pos && !patch.pos.every(Number.isFinite)) return;
    SIM.update(it.id, patch);
  }

  /* ----------------------------------------------------------- readouts */
  function showReadout(r) {
    const el = $('simReadout');
    if (!r || r.value === null || r.value === undefined) { el.hidden = true; return; }
    const K = SIM.analysis.KINDS[r.kind];
    const v = r.kind === 'sti' ? `${fmt(r.value, 2)} · ${P.stiRating(r.value)}` : r.kind === 'air' ? `${fmt(r.value, 2)} m/s · feels ≈${fmt(P.coolingEffect(r.value), 1)} °C cooler` : `${fmt(r.value)} ${K.unit}`;
    el.innerHTML = `<strong>${v}</strong><small>${esc(K.label)} · axis ${esc(SIM.axisName(r.x))}, ${fmt(r.z, 1)} m</small>`;
    el.style.left = (r.clientX + 14) + 'px'; el.style.top = (r.clientY + 14) + 'px';
    el.hidden = false;
  }
  function showHere(camera, mode) {
    const el = $('simHere');
    const p = camera.position;
    const local = mode === 'walk';
    const seats = lastAnalysis?.seats;
    // One set of readings: the camera position while walking, seated averages
    // while exploring. Power always describes the whole installation.
    const v = local ? SIM.analysis.pointValues(p.x, p.z, p.y) : {
      lux: seats?.lux?.avg, sti: seats?.sti?.avg, spl: seats?.spl?.avg,
      air: seats?.air?.avg, noise: seats?.noise?.avg
    };
    const floorLight = Number.isFinite(v.floorLux);
    const lux = floorLight ? v.floorLux : v.lux;
    const power = SIM.powerSummary();
    const scope = local ? 'At your position' : 'Church average · seating';
    const cell = (key, label, value, unit, title, ok) => `<div class="sim-stat${ok === false ? ' bad' : ''}" data-stat="${key}" title="${esc(title)}"><div><b>${value}</b><small>${unit}</small></div><span>${label}</span></div>`;
    el.hidden = false;
    $('simNoise').hidden = false;
    el.dataset.scope = local ? 'position' : 'average';
    $('simStatsScope').textContent = `${scope} · ${!local && SIM.analysis.busy ? 'updating estimates' : 'estimates'}`;
    const values =
      cell('light', floorLight ? 'Floor light' : 'Book light', fmt(lux), 'lux', `${scope}: maintained modeled light ${floorLight ? 'on the floor' : 'on a book at 0.8 m'}; excludes daylight`, Number.isFinite(lux) ? floorLight ? lux >= 100 : kpiClass('lux', lux) === 'good' : undefined) +
      cell('sti', 'Clarity', fmt(v.sti, 2), 'STI', `${scope}: speech intelligibility${Number.isFinite(v.sti) ? ' · ' + P.stiRating(v.sti) : ' · no speech source on'}`, Number.isFinite(v.sti) ? v.sti >= 0.6 : undefined) +
      cell('speech', 'Speech', fmt(v.spl), 'dBA', `${scope}: speech level ${local ? `at your ear height (${fmt(p.y - SIM.floorY(p.x, p.z), 2)} m)` : 'at 1.2 m, averaged by acoustic energy'}`) +
      cell('air', 'Air', fmt(v.air, 2), 'm/s', `${scope}: fan air speed at 0.6 m; preferred 0.3–0.8 m/s; excludes natural wind`, Number.isFinite(v.air) ? v.air >= 0.3 && v.air <= 0.8 : undefined) +
      cell('noise', 'Noise', fmt(v.noise), 'dBA', `${scope}: ambient noise plus running fans${local ? '' : ', averaged by acoustic energy'}; preferred ≤ 40 dBA`, Number.isFinite(v.noise) ? v.noise <= 40 : undefined) +
      cell('power', 'Equipment power', fmt(power.total / 1000, 1), 'kW', 'Estimated current load of modeled equipment, including amplifier allowances; excludes other building loads');
    if ($('simHereValues').innerHTML !== values) $('simHereValues').innerHTML = values;
    speechValue = v.spl;
    const noiseText = Number.isFinite(v.noise) ? `${fmt(v.noise)} dBA` : 'Calculating';
    $('simNoiseValue').textContent = noiseText;
    $('simNoiseValue').classList.toggle('hot', v.noise > 45);
    $('simNoiseMeter').title = `${scope}: background noise estimate, 25–85 dBA. Red begins above 45 dBA.`;
    setLevelMeter($('simNoiseMeter'), noiseSegments, v.noise, 25, 85, 45, noiseText);
    updateSoundMeter();
  }

  function setLevelMeter(el, segments, value, min, max, redAt, text, peak) {
    const ratio = v => Math.max(0, Math.min(1, (v - min) / (max - min)));
    const level = Number.isFinite(value) ? ratio(value) : 0;
    const active = Math.ceil(level * segments.length);
    segments.forEach((s, i) => {
      s.classList.toggle('active', i < active);
      s.classList.toggle('hot', value > redAt && min + (i + 1) / segments.length * (max - min) > redAt);
    });
    el.setAttribute('aria-valuemin', String(min));
    el.setAttribute('aria-valuemax', String(max));
    el.setAttribute('aria-valuenow', String(Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : min));
    el.setAttribute('aria-valuetext', text);
    el.querySelector('.sim-level-limit').style.bottom = `${ratio(redAt) * 100}%`;
    const marker = el.querySelector('.sim-level-peak');
    if (marker) {
      marker.hidden = !Number.isFinite(peak) || peak <= min;
      if (!marker.hidden) {
        marker.style.bottom = `${ratio(peak) * 100}%`;
        marker.classList.toggle('hot', peak > redAt);
      }
    }
  }

  function updateSoundMeter() {
    const live = SIM.audio?.outputLevels?.();
    const el = $('simSoundMeter');
    const value = live ? live.rmsDb : speechValue;
    const text = live ? (Number.isFinite(value) && value > -90 ? `${fmt(value, 1)} dBFS` : 'Silence') : (Number.isFinite(value) ? `${fmt(value)} dBA` : value === undefined ? 'Calculating' : 'No source on');
    $('simSoundLabel').textContent = live ? 'Audio output' : 'Sound estimate';
    $('simSoundValue').textContent = text;
    $('simSoundValue').classList.toggle('hot', live ? live.peakDb > -6 : value > 76);
    el.dataset.source = live ? 'output' : 'estimate';
    el.setAttribute('aria-label', live ? 'Audio output level after headphone volume' : 'Speech level estimate');
    el.title = live ? `Actual output: RMS ${text}, peak ${fmt(live.peakDb, 1)} dBFS. Red begins above −6 dBFS.` : 'Estimated speech level, 30–90 dBA. Press Play in Simulator → Sound to measure actual output.';
    setLevelMeter(el, soundSegments, value, live ? -60 : 30, live ? 0 : 90, live ? -6 : 76, text, live?.peakDb);
  }

  /* Fixture markers on the existing minimap (same transform as the viewer). */
  function renderMapMarkers() {
    const svg = $('minimap');
    if (!svg) return;
    let g = svg.querySelector('#simMapMarkers');
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.id = 'simMapMarkers';
      svg.insertBefore(g, $('mapPosition'));
      g.addEventListener('click', e => {
        const id = e.target.dataset?.id;
        if (id) { e.stopPropagation(); setOpen(true); SIM.select(id); }
      });
    }
    const open = document.body.classList.contains('sim-open');
    const cat = TABS.find(t => t.id === tab)?.cat;
    const color = { light: '#e0a826', fan: '#3a9bb5', speaker: '#7a5bb5', decor: '#c0577a' };
    g.innerHTML = open ? SIM.state.items.filter(it => !it.hidden && (!cat || CAT.byId[it.type].cat === cat)).map(it => {
      const x = 90 + it.pos[2] * 4.65, y = 244 - (it.pos[0] + 20) * 3.12;
      const sel = it.id === SIM.state.selectedId;
      return `<circle data-id="${it.id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sel ? 3.6 : 2}" fill="${color[CAT.byId[it.type].cat]}" fill-opacity="${it.on ? 0.9 : 0.35}" stroke="${sel ? '#1d3a28' : '#fff'}" stroke-width="${sel ? 1.2 : 0.5}" style="cursor:pointer"><title>${esc(it.name)}</title></circle>`;
    }).join('') : '';
  }

  SIM.ui = { setOpen, render: () => renderBody(), get tab() { return tab; }, set tab(v) { tab = v; renderBody(); } };
})();
