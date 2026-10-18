/* Site view: the shared model organised for checking and sequencing construction.
 *
 * Grid lines on the floors with axis bubbles, dimension chains and a level
 * staff; construction layers that can be shown, ghosted or hidden; a proposed
 * phase sequence with the open records that gate each phase; a part inspector
 * (size, levels, grid reference, evidence status); point-to-point measuring;
 * plan and section cuts; and the drawing dimension register with a check of
 * the model's grid against it.
 *
 * Display only. It never moves geometry, equipment or routes, never changes a
 * calculation and never writes the simulator layout. Site records (phase
 * status, measured values) are stored under their own key and only outside the
 * public visit. Not for construction: the phase plan is a proposal and model
 * shapes marked SCHEMATIC or CONCEPT must not be measured for setting out.
 */
(() => {
  'use strict';
  const DATA = window.CHURCH_CONSTRUCTION_DATA || { phases: { phases: [], engineering: {} }, dimensions: [], issues: [], grid: [] };
  const VISIT = document.documentElement.classList.contains('visit-only');
  const STORE = 'thachbi.construction.v1';
  // Display language: one at a time, Vietnamese by default. The shared viewer
  // preference (i18n.js, one switch for the whole viewer) is read here and kept
  // in step with it, so the site view and the header switch always agree.
  let LANG = window.THACH_I18N ? window.THACH_I18N.get() : 'vi';
  const tr = (en, vi) => LANG === 'vi' ? vi : en;
  const pickText = text => { const parts = String(text || '').split(' / '); return parts.length > 1 ? (LANG === 'vi' ? parts[0] : parts[parts.length - 1]) : String(text || ''); };
  const pickLines = text => { const lines = String(text || '').split('\n'); return LANG === 'vi' ? lines[0] : lines[lines.length - 1]; };
  const snapName = s => ({ surface: tr('surface', 'bề mặt'), corner: tr('corner', 'góc'), 'grid crossing': tr('grid crossing', 'giao trục'), grid: tr('grid', 'trục') })[s] || s;
  const READY = ['Click a part to inspect it', 'Bấm vào một bộ phận để xem chi tiết'];
  function setLang(v) { if (window.THACH_I18N) window.THACH_I18N.set(v === 'en' ? 'en' : 'vi'); else { LANG = v === 'en' ? 'en' : 'vi'; chrome(); render(); } }
  window.THACH_I18N?.onChange(value => { LANG = value; chrome(); render(); if (lastInspected) inspectObject(lastInspected.object, lastInspected.point); });
  const LAYERS = [
    { id: 'plinth', en: 'Plinth, approach and stairs', vi: 'Nền bệ, bậc, cầu thang', color: '#9a8a6c' },
    { id: 'floors', en: 'Floor slabs and platforms', vi: 'Sàn và bục', color: '#b9ab8f' },
    { id: 'columns', en: 'Columns and piers', vi: 'Cột và trụ', color: '#a3402f' },
    { id: 'walls', en: 'Walls, towers and facade body', vi: 'Tường, tháp, thân mặt tiền', color: '#cdbf9f' },
    { id: 'frame', en: 'Timber frame and roof structure', vi: 'Khung gỗ, kết cấu mái', color: '#8c3b25' },
    { id: 'roof', en: 'Roof covering and ceilings', vi: 'Mái lợp và trần', color: '#9b5a3c' },
    { id: 'openings', en: 'Doors, windows and glass', vi: 'Cửa đi, cửa sổ, kính', color: '#5f7f8f' },
    { id: 'routes', en: 'Cable routes and boards', vi: 'Tuyến cáp và tủ điện', color: '#d0752b', special: true },
    { id: 'ornament', en: 'Mouldings, carving and gilding', vi: 'Phào chỉ, chạm khắc, thếp vàng', color: '#c49a3a' },
    { id: 'finishes', en: 'Floor finishes and inlays', vi: 'Lát sàn, hoa văn sàn', color: '#a8a39a' },
    { id: 'sanctuary', en: 'Sanctuary reredos and altar', vi: 'Cung thánh, bàn thờ', color: '#9e2f2a' },
    { id: 'equipment', en: 'Lights, fans, sound, outlets, statues', vi: 'Đèn, quạt, âm thanh, ổ cắm, tượng', color: '#3f7a5a', special: true },
    { id: 'furniture', en: 'Pews and furniture', vi: 'Ghế và nội thất', color: '#7a5a3a' },
    { id: 'site', en: 'Courtyard trees', vi: 'Cây sân', color: '#5b7d4a' },
  ];
  const LAYER = Object.fromEntries(LAYERS.map(l => [l.id, l]));
  const STATUS = [
    ['unknown', 'Not recorded', 'Chưa ghi nhận'], ['not-started', 'Not started', 'Chưa bắt đầu'],
    ['in-progress', 'In progress', 'Đang thi công'], ['built', 'Built', 'Đã xong'], ['checked', 'Checked on site', 'Đã kiểm tra'],
  ];

  // ---- Classification (also used by render-batches.js before start-up) ----
  const ORNAMENT = /gild|relief|foliage|rosette|finial|corbel|crest|fleur|pinnacle|dentil|flute|boss|cartouche|haunch|volute|bloom|lattice|ornament|moulding|molding|carving ·|carved (?!stone)|cap rib|cornice|canopy|round profile|baluster|^capital$|^column base$|statue|soffit line|scroll|abacus band/i;
  const OPENING = /window|door|glass|glazing|fanlight|shutter|opening infill|rose-window|louver|louvre|joinery|transom|grille|leaf\b|stile|inset panel|raised panel|door pull|handle/i;
  const TRUSS = /queen post|king post|king strut|strut|tie\b|collar beam|upper collar|brace|purlin|rafter|beam|truss|plate|bracket|member|connection block/i;
  const COLUMN = /column|shaft|pedestal|post\b|capital|plinth|base\b|foot\b|head\b|bolster/i;
  function layerOf(object, source) {
    const name = object.name || '', group = source?.name || '', status = object.userData?.status || '';
    if (/courtyard trees/i.test(group)) return 'site';
    if (/pews and kneelers|long benches|sanctuary seating and service room/i.test(group)) return 'furniture';
    if (/^Reference sanctuary/i.test(group)) return 'sanctuary';
    if (/^Entrance joinery/i.test(group)) return 'openings';
    if (/^Floor and altar zones/i.test(group)) return 'floors';
    if (/^Plinth and approach/i.test(group)) return 'plinth';
    if (/truss bracing and purlins/i.test(group)) return 'frame';
    if (/^Interior proposal/i.test(group)) {
      if (/floor finish|inlay|border|medallion/i.test(name)) return 'finishes';
      if (/altar|credence|tabernacle|ambo|crucifix|reredos/i.test(name)) return 'sanctuary';
      return 'furniture';
    }
    if (/CONCEPT ORNAMENT/i.test(status) || ORNAMENT.test(name)) return 'ornament';
    // Beams first ("column-line beam"), then post/capital parts ("capital bolster under the plate"), then truss words.
    if (/^Timber frame/i.test(group)) return /beam|purlin|rafter|truss|brace/i.test(name) ? 'frame' : /column|capital|shaft|pedestal|plinth|bolster/i.test(name) ? 'columns' : TRUSS.test(name) ? 'frame' : COLUMN.test(name) ? 'columns' : 'frame';
    if (/^Grid driven structure/i.test(group)) return /wall|spandrel/i.test(name) ? 'walls' : 'columns';
    if (/^Roof assembly/i.test(group)) {
      if (/terrace|gable wall|side return|gable corner/i.test(name)) return 'walls';
      return TRUSS.test(name) ? 'frame' : 'roof';
    }
    if (/parapet|pilaster/i.test(name)) return 'walls';
    if (OPENING.test(name)) return 'openings';
    if (/roof|ridge|eave/i.test(name)) return 'roof';
    return 'walls';
  }
  function evidenceClass(status) {
    const s = String(status || '').toUpperCase();
    if (!s) return 'unlabelled';
    if (/HOLD/.test(s)) return 'hold';
    if (/AS DRAWN|EXPLICIT|SOURCE|TRACED|USER CONFIRMED|GRID|LEVEL/.test(s)) return /SCHEMATIC|PROXY|ILLUSTRATIVE|PROPOSED/.test(s) ? 'mixed' : 'drawn';
    if (/SCHEMATIC/.test(s)) return 'schematic';
    return 'concept';
  }
  const EVIDENCE = {
    drawn: ['From the drawings', 'Theo bản vẽ', 'Position or size is taken from the supplied drawings. Confirm on site before setting out.', 'Vị trí hoặc kích thước lấy theo bản vẽ được cung cấp. Kiểm tra lại tại công trường trước khi định vị.'],
    mixed: ['Drawn position, schematic shape', 'Vị trí theo bản vẽ, hình dạng minh hoạ', 'Its grid position or level is from the drawings; its outline or thickness is illustrative.', 'Vị trí trục hoặc cao độ theo bản vẽ; đường bao hoặc chiều dày chỉ để minh hoạ.'],
    schematic: ['Schematic', 'Sơ đồ', 'Illustrative shape. Do not take dimensions from the model for this part.', 'Hình dạng minh hoạ. Không lấy kích thước từ mô hình cho bộ phận này.'],
    concept: ['Concept proposal', 'Đề xuất ý tưởng', 'A proposal, not in the drawings. Not a construction dimension.', 'Đề xuất, không có trong bản vẽ. Không phải kích thước thi công.'],
    hold: ['Engineering hold', 'Chờ thiết kế kỹ thuật', 'Waiting for a checked engineering design.', 'Đang chờ thiết kế kỹ thuật được kiểm tra.'],
    unlabelled: ['No status recorded', 'Chưa có trạng thái', 'Treat as illustrative until a source is recorded.', 'Xem là minh hoạ cho đến khi ghi được nguồn.'],
  };

  let T, ctx, church, SIM, batches, building;
  const meshes = [], layerByMesh = new Map(), sourceByMesh = new Map(), displays = [];
  const counts = Object.fromEntries(LAYERS.map(l => [l.id, { parts: 0, drawn: 0, mixed: 0, schematic: 0, concept: 0, hold: 0, unlabelled: 0 }]));
  const view = {
    open: false, tool: 'inspect', styles: Object.fromEntries(LAYERS.map(l => [l.id, 'show'])), phase: 0, future: 'ghost',
    grid: { floor: true, xray: false, labels: true, tags: true, levels: true }, plan: null, section: null, drawing: null,
    axis: null, level: null, selected: null, measures: [], pending: null, tab: 'grid', query: '', filter: 'grid', playing: null,
  };
  let record = { version: 1, phases: {}, checks: {}, toleranceMm: null };
  let saved = null; // viewer state saved on entry and restored on exit
  let lastInspected = null; // the part last inspected, read again when the language changes
  let annotations, axisSheet, levelSheet, selection, measureGroup, highlightMat, ghostMat, ribbonMat, ribbonXray;
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtM = (v, d = 3) => (v < 0 ? '−' : v > 0 ? '+' : '±') + Math.abs(v).toFixed(d);
  const fmtMm = v => Math.round(v).toLocaleString('en-US').replace(/,/g, ' ');

  window.CHURCH_CONSTRUCTION = {
    layerOf, LAYERS, prepare, bindBatches, start, setOpen, setLayer, setPhase, setTool, setCut, selectAxis, selectLevel,
    inspectObject, gridReference, modelCheck, setLang, lang: () => LANG, state: () => ({ open: view.open, tool: view.tool, styles: { ...view.styles }, phase: view.phase, plan: view.plan, section: view.section, counts }),
  };

  function prepare(c) { ctx = c; T = c.THREE; building = c.building; }
  function bindBatches(map) {
    batches = map;
    for (const [source, display] of map) for (const mesh of display.children) {
      if (!mesh.isMesh || !mesh.userData.layerRanges) continue;
      displays.push({ mesh, source, display, base: mesh.material, twin: null });
    }
    building.traverse(object => {
      if (!object.isMesh) return;
      let source = object; while (source.parent && source.parent !== building) source = source.parent;
      const layer = layerOf(object, source);
      meshes.push(object); layerByMesh.set(object, layer); sourceByMesh.set(object, source);
      counts[layer].parts++; counts[layer][evidenceClass(object.userData?.status)]++;
    });
  }

  // ---- Start-up: header button, panel, toolbar, inspector ----
  function start(c) {
    church = c; SIM = window.CHURCH_SIMULATOR;
    if (!building || !T) return;
    if (!VISIT) try { const r = JSON.parse(localStorage.getItem(STORE) || 'null'); if (r?.version === 1) record = { ...record, ...r }; } catch { /* storage unavailable */ }
    highlightMat = new T.MeshStandardMaterial({ color: '#f0a33a', emissive: '#6b3a00', emissiveIntensity: .35, roughness: .7 });
    ghostMat = new T.MeshStandardMaterial({ color: '#a9bccd', transparent: true, opacity: .13, depthWrite: false, roughness: 1 });
    ribbonMat = new T.MeshBasicMaterial({ color: '#c8321f', transparent: true, opacity: .92, toneMapped: false, fog: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: T.DoubleSide });
    ribbonXray = new T.MeshBasicMaterial({ color: '#d43a22', transparent: true, opacity: .5, depthTest: false, toneMapped: false, fog: false, side: T.DoubleSide });
    buildDom();
    if (new URLSearchParams(location.search).has('site')) { const wait = () => church.ready ? setOpen(true) : setTimeout(wait, 300); wait(); }
  }

  function buildDom() {
    const actions = document.querySelector('.header-actions');
    const button = document.createElement('button');
    button.id = 'siteButton'; button.className = 'text-button'; button.setAttribute('aria-expanded', 'false');
    // Label and title are written by chrome(), once the elements exist.
    button.addEventListener('click', () => setOpen(!view.open));
    actions?.prepend(button);

    const panel = document.createElement('aside');
    panel.id = 'sitePanel'; panel.className = 'site-panel'; panel.hidden = true;
    panel.setAttribute('aria-label', 'Site view');
    panel.innerHTML = `<div class="site-head"></div>
      <p class="site-status"></p>
      <div class="site-tabs" role="tablist"></div>
      <div id="siteBody" class="site-body"></div>`;
    document.body.append(panel);
    panel.addEventListener('click', onPanelClick);
    panel.addEventListener('input', onPanelInput);
    panel.addEventListener('change', onPanelChange);

    const bar = document.createElement('div');
    bar.id = 'siteToolbar'; bar.className = 'site-toolbar'; bar.hidden = true;
    bar.innerHTML = `<div class="site-tools" role="group"></div>
      <div class="site-views" role="group"></div>
      <div id="siteReadout" class="site-readout" aria-live="polite"></div>`;
    document.body.append(bar);
    bar.addEventListener('click', onPanelClick);

    const card = document.createElement('aside');
    card.id = 'siteInspector'; card.className = 'site-inspector'; card.hidden = true;
    document.body.append(card);
    card.addEventListener('click', onPanelClick);

    chrome();

    window.addEventListener('resize', refit);
    const canvas = church.renderer.domElement;
    let down = null;
    canvas.addEventListener('pointerdown', e => { if (view.open && e.button === 0) down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    canvas.addEventListener('pointerup', e => {
      if (!view.open || !down || e.button !== 0) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y), quick = performance.now() - down.t < 450;
      down = null;
      if (moved < 5 && quick) onCanvasClick(e);
    });
    document.addEventListener('keydown', e => {
      if (!view.open || e.target.closest?.('input,textarea,select')) return;
      if (e.key === 'Escape' && (view.pending || view.selected)) { view.pending = null; clearSelection(); renderMeasures(); e.stopPropagation(); }
    }, true);
  }

  // Writes every label that depends on the language. Runs at start-up and when
  // the language changes. The containers and #siteBody / #siteReadout stay as
  // elements; only their contents are rewritten.
  function chrome() {
    const button = $('siteButton');
    if (button) {
      button.title = tr('Site view: grid, layers, construction phases, measuring and dimension checks', 'Công trường: lưới trục, lớp, giai đoạn thi công, đo và kiểm tra kích thước');
      button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17h18M5 17v-3a7 7 0 0 1 14 0v3M12 7V4m-3 4 .8-3h4.4l.8 3M2 20h20"/></svg><span>${tr('Site', 'Công trường')}</span>`;
    }
    const panel = $('sitePanel');
    if (panel) {
      const langStyle = v => `border:1px solid #cfd8c6;background:#fff;border-radius:6px;padding:3px 7px;font-size:10px;font-weight:700;margin-right:3px${LANG === v ? ';background:#2f5b43;color:#fff' : ''}`;
      panel.querySelector('.site-head').innerHTML = `<div><span class="site-eyebrow">${tr('Site view', 'Công trường')}</span><strong>${tr('Check and sequence the work', 'Kiểm tra và sắp xếp thi công')}</strong></div>
        <div style="display:flex;align-items:center;gap:4px"><div class="site-lang" role="group" aria-label="${tr('Language', 'Ngôn ngữ')}"><button data-lang="vi" class="${LANG === 'vi' ? 'on' : ''}" style="${langStyle('vi')}">VI</button><button data-lang="en" class="${LANG === 'en' ? 'on' : ''}" style="${langStyle('en')}">EN</button></div><button class="close-button" data-site="close" aria-label="${tr('Close site view', 'Đóng công trường')}">×</button></div>`;
      panel.querySelector('.site-status').textContent = tr('Proposed sequence and drawing data. Not for construction', 'Trình tự đề xuất và dữ liệu bản vẽ. Không dùng để thi công');
      panel.querySelector('.site-tabs').innerHTML = [['grid', 'Grid', 'Lưới trục'], ['layers', 'Layers', 'Lớp'], ['phases', 'Phases', 'Giai đoạn'], ['check', 'Check', 'Kiểm tra']].map(([id, en, vi]) => `<button role="tab" data-tab="${id}"><span>${tr(en, vi)}</span></button>`).join('');
    }
    const bar = $('siteToolbar');
    if (bar) {
      const tools = bar.querySelector('.site-tools'), views = bar.querySelector('.site-views');
      tools.setAttribute('aria-label', tr('Tools', 'Công cụ'));
      views.setAttribute('aria-label', tr('Views', 'Góc nhìn'));
      tools.innerHTML = `<button data-tool="inspect" title="${tr('Click a part: size, levels, grid position and source', 'Bấm một bộ phận: kích thước, cao độ, vị trí trục và nguồn')}">${tr('Inspect', 'Xem chi tiết')}</button>
        <button data-tool="measure" title="${tr('Click two points; snaps to corners and grid crossings', 'Bấm hai điểm; tự bắt vào góc và giao trục')}">${tr('Measure', 'Đo')}</button>
        <button data-site="clear" title="${tr('Clear measurements and selection', 'Xoá số đo và phần đang chọn')}">${tr('Clear', 'Xoá')}</button>`;
      views.innerHTML = `<button data-site-view="plan" title="${tr('Plan from above, cut at 1.20 m', 'Mặt bằng nhìn từ trên, cắt ở 1.20 m')}">${tr('Plan', 'Mặt bằng')}</button>
        <button data-site-view="front" title="${tr('Elevation from the tower end', 'Mặt đứng nhìn từ đầu tháp')}">${tr('Front', 'Mặt trước')}</button>
        <button data-site-view="right" title="${tr('Side B elevation', 'Mặt đứng bên B')}">${tr('Side B', 'Bên B')}</button>
        <button data-site-view="left" title="${tr('Side H elevation', 'Mặt đứng bên H')}">${tr('Side H', 'Bên H')}</button>
        <button data-site-view="3d" title="${tr('3D view without cuts', 'Nhìn 3D không cắt')}">3D</button>`;
      const readout = $('siteReadout');
      if (readout && (!readout.textContent.trim() || READY.includes(readout.textContent.trim()))) readout.textContent = tr(READY[0], READY[1]);
    }
  }

  // ---- Open / close ----
  function setOpen(open) {
    open = !!open;
    if (open === view.open || !church?.ready && open) return view.open;
    view.open = open;
    document.body.classList.toggle('site-open', open);
    $('sitePanel').hidden = !open; $('siteToolbar').hidden = !open;
    $('siteButton').classList.toggle('active', open); $('siteButton').setAttribute('aria-expanded', String(open));
    if (open) {
      SIM?.ui?.setOpen?.(false);
      $('settingsPanel')?.setAttribute('hidden', '');
      const E = SIM?.electrical;
      saved = { grid: ctx.labels?.visible ?? false, simVisible: simGroup()?.visible ?? true, routes: E?.view?.visible ?? false, clipping: church.renderer.clippingPlanes };
      if (ctx.labels) ctx.labels.visible = false;
      if (ctx.grids) ctx.grids.visible = false;
      ensureAnnotations();
      applyLayers(); applyGrid(); render();
      if (church.camera?.isPerspectiveCamera && church.mode !== 'walk') fitFree();
    } else {
      stopPlay();
      for (const d of displays) { d.mesh.material = Array.isArray(d.mesh.material) ? d.base : d.mesh.material; d.mesh.geometry.clearGroups(); if (d.twin) d.twin.visible = false; }
      church.renderer.clippingPlanes = [];
      clearOffsets();
      view.plan = view.section = null;
      if (annotations) annotations.visible = false;
      clearSelection(); view.pending = null; clearMeasures();
      if (saved) {
        if (ctx.labels) ctx.labels.visible = saved.grid;
        if (ctx.grids) ctx.grids.visible = saved.grid;
        const g = simGroup(); if (g) g.visible = saved.simVisible;
        const E = SIM?.electrical; if (E?.view && E.view.visible !== saved.routes) { E.view.visible = saved.routes; E.rebuild?.(); }
      }
      $('siteInspector').hidden = true;
    }
    window.dispatchEvent(new Event('resize'));
    redraw();
    return view.open;
  }
  function simGroup() { let g = null; church.scene.children.forEach(o => { if (o.name === 'Simulator fixtures — switchable') g = o; }); return g; }
  function redraw() {
    church.renderer.shadowMap.needsUpdate = true;
    window.CHURCH_PERFORMANCE?.invalidate?.();
    try { church.render?.(); } catch { /* render resumes on the next frame */ }
  }

  // ---- Layers ----
  function effectiveStyle(layer) { return view.styles[layer] || 'show'; }
  function setLayer(layer, style) {
    if (layer === 'all') { for (const l of LAYERS) view.styles[l.id] = style || 'show'; view.phase = 0; }
    else if (LAYER[layer] && ['show', 'ghost', 'hide', 'focus'].includes(style)) view.styles[layer] = style;
    else return false;
    applyLayers(); render(); redraw(); return true;
  }
  function isolate(layer) {
    for (const l of LAYERS) view.styles[l.id] = l.id === layer ? 'show' : (l.special ? 'hide' : 'ghost');
    view.phase = 0; applyLayers(); render(); redraw();
  }
  function applyLayers() {
    if (!view.open) return;
    for (const d of displays) {
      const main = [], ghost = [];
      for (const r of d.mesh.userData.layerRanges) {
        const style = effectiveStyle(r.layer);
        if (style === 'show') main.push([r.start, r.count, 0]);
        else if (style === 'focus') main.push([r.start, r.count, 1]);
        else if (style === 'ghost') ghost.push([r.start, r.count, 0]);
      }
      d.mesh.material = [d.base, highlightMat];
      setGroups(d.mesh.geometry, main);
      if (ghost.length && !d.twin) {
        const g = new T.BufferGeometry();
        for (const [name, attribute] of Object.entries(d.mesh.geometry.attributes)) g.setAttribute(name, attribute);
        g.setIndex(d.mesh.geometry.index); g.boundingBox = d.mesh.geometry.boundingBox; g.boundingSphere = d.mesh.geometry.boundingSphere;
        d.twin = new T.Mesh(g, [ghostMat]); d.twin.name = 'Site view ghost'; d.twin.matrixAutoUpdate = false;
        d.twin.castShadow = d.twin.receiveShadow = false; d.twin.renderOrder = 2; d.display.add(d.twin);
      }
      if (d.twin) { setGroups(d.twin.geometry, ghost); d.twin.visible = ghost.length > 0; }
    }
    const g = simGroup(); if (g) g.visible = effectiveStyle('equipment') !== 'hide' && effectiveStyle('equipment') !== 'ghost';
    const E = SIM?.electrical, routes = ['show', 'focus'].includes(effectiveStyle('routes'));
    if (E?.view && E.view.visible !== routes) { E.view.visible = routes; E.rebuild?.(); }
  }
  function setGroups(geometry, list) {
    geometry.clearGroups();
    let last = null;
    for (const [start, count, index] of list.sort((a, b) => a[0] - b[0])) {
      if (last && last.materialIndex === index && last.start + last.count === start) last.count += count;
      else { geometry.addGroup(start, count, index); last = geometry.groups[geometry.groups.length - 1]; }
    }
  }

  // ---- Phases ----
  const PHASES = DATA.phases.phases;
  function setPhase(n, future) {
    n = Math.max(0, Math.min(PHASES.length, Number(n) || 0));
    if (future) view.future = future === 'hide' ? 'hide' : 'ghost';
    view.phase = n;
    if (n === 0) for (const l of LAYERS) view.styles[l.id] = 'show';
    else PHASES.forEach((p, i) => p.layers.forEach(l => { view.styles[l] = i + 1 < n ? 'show' : i + 1 === n ? 'focus' : view.future; }));
    applyLayers(); render(); redraw();
    return n;
  }
  function phaseStatus(id) { return record.phases[id]?.status || 'unknown'; }
  function nextPhase() {
    const i = PHASES.findIndex(p => !['built', 'checked'].includes(phaseStatus(p.id)));
    return i < 0 ? null : i;
  }
  function play() {
    stopPlay();
    let n = 0;
    const step = () => { n = n % PHASES.length + 1; setPhase(n); view.playing = setTimeout(step, 2200); if (n === PHASES.length) { stopPlay(); render(); } };
    step();
  }
  function stopPlay() { clearTimeout(view.playing); view.playing = null; }
  function saveRecord() {
    if (VISIT) return;
    try { localStorage.setItem(STORE, JSON.stringify(record)); } catch { toast(tr('This browser cannot save site records here.', 'Trình duyệt này không lưu được hồ sơ công trường.')); }
  }

  // ---- Grid, levels and annotations ----
  const LONG = () => ctx.data.longitudinal, TRANS = () => ctx.data.transverse;
  const floorY = (x, z) => { try { const y = church.floorHeight(x, z); return Number.isFinite(y) ? y : -2.08; } catch { return -2.08; } };
  function ensureAnnotations() {
    if (annotations) { annotations.visible = true; return; }
    annotations = new T.Group(); annotations.name = 'Site view annotations'; church.scene.add(annotations);
    annotations.userData.floor = new T.Group(); annotations.userData.labels = new T.Group(); annotations.userData.tags = new T.Group(); annotations.userData.levels = new T.Group();
    annotations.add(annotations.userData.floor, annotations.userData.labels, annotations.userData.tags, annotations.userData.levels);
    // alongX: bubbles and chain of axes 1–12 (read in plan and side views);
    // alongZ: bubbles and chain of axes A–I (read in plan and end views).
    const alongX = annotations.userData.alongX = new T.Group(), alongZ = annotations.userData.alongZ = new T.Group();
    annotations.userData.labels.add(alongX, alongZ);
    const L = LONG(), Tz = TRANS();
    // Axes closer than a bubble (2 and 2′ are 0.575 m apart) get their bubble
    // pushed one step further out, with a leader line back to the axis.
    const staggered = entries => { let prev = -Infinity, out = 0; return Object.fromEntries(entries.sort((a, b) => a[1] - b[1]).map(([n, v]) => { out = v - prev < 1.9 && !out ? 1 : 0; prev = v; return [n, out]; })); };
    const outL = staggered(Object.entries(L)), outT = staggered(Object.entries(Tz));
    for (const [name, x] of Object.entries(L)) {
      annotations.userData.floor.add(floorRibbon([x, -18.2], [x, 18.2], .07));
      for (const side of [-1, 1]) {
        const z = side * (19.4 + outL[name] * 1.9);
        if (outL[name]) alongX.add(flatLine([x, floorY(x, z) + .03, side * 18.2], [x, floorY(x, z) + .03, z - side * .85], .05));
        alongX.add(bubble(name, x, floorY(x, z) + 1.1, z));
      }
    }
    for (const [name, z] of Object.entries(Tz)) {
      annotations.userData.floor.add(floorRibbon([-15.5, z], [57.5, z], .07));
      for (const x of [-16.8 - outT[name] * 1.9, 58.8 + outT[name] * 1.9]) alongZ.add(bubble(name, x, floorY(x, z) + 1.1, z));
    }
    // Dimension chains, millimetres between consecutive axes (from the model grid).
    const lx = Object.entries(L).sort((a, b) => a[1] - b[1]);
    const chainZ = -17.2, chainY = floorY(20, chainZ) + .03;
    alongX.add(flatLine([lx[0][1], chainY, chainZ], [lx[lx.length - 1][1], chainY, chainZ], .05));
    lx.forEach(([, x], i) => {
      alongX.add(flatLine([x, chainY, chainZ - .45], [x, chainY, chainZ + .45], .05));
      if (i) { const span = (x - lx[i - 1][1]) * 1000, small = span < 1500; alongX.add(textSprite(fmtMm(span), (x + lx[i - 1][1]) / 2, chainY + .6, chainZ + (small ? 1.25 : 0), { h: .95 })); }
    });
    alongX.add(textSprite(`${fmtMm((lx[lx.length - 1][1] - lx[0][1]) * 1000)} · ${lx[0][0]}–${lx[lx.length - 1][0]}`, (lx[0][1] + lx[lx.length - 1][1]) / 2, chainY + .6, chainZ + 2.6, { h: 1.0, bold: true }));
    const tz = Object.entries(Tz).sort((a, b) => a[1] - b[1]);
    const chainX = 56.6, cy = floorY(chainX, 0) + .03;
    alongZ.add(flatLine([chainX, cy, tz[0][1]], [chainX, cy, tz[tz.length - 1][1]], .05));
    tz.forEach(([, z], i) => {
      alongZ.add(flatLine([chainX - .45, cy, z], [chainX + .45, cy, z], .05));
      if (i) alongZ.add(textSprite(fmtMm((z - tz[i - 1][1]) * 1000), chainX, cy + .6, (z + tz[i - 1][1]) / 2, { h: .95 }));
    });
    // Crossing tags painted on the floor inside the building.
    for (const [ln, x] of lx) for (const [tn, z] of tz) {
      const y = floorY(x, z);
      if (y < -0.5) continue;
      annotations.userData.tags.add(floorTag(`${ln}·${tn}`, x, y, z));
    }
    // Level staff beside the tower end, from the workbook's model-grid levels.
    const levels = levelRows(), staff = new T.Group(); staff.name = 'Level staff';
    annotations.userData.levels.add(staff); annotations.userData.staff = staff;
    const sx = 0, sz = 0, base = -2.08;
    const pole = new T.Mesh(new T.BoxGeometry(.09, levels[levels.length - 1].m - base, .09), new T.MeshBasicMaterial({ color: '#2d3d33', toneMapped: false }));
    pole.position.set(sx, (levels[levels.length - 1].m + base) / 2, sz); staff.add(pole);
    let lastY = -Infinity;
    for (const level of levels) {
      const tick = new T.Mesh(new T.BoxGeometry(.7, .035, .035), pole.material); tick.position.set(sx + .3, level.m, sz); staff.add(tick);
      const y = Math.max(level.m, lastY + .62); lastY = y;
      staff.add(textSprite(`${fmtM(level.m)}  ${level.names.join(' / ')}`, sx + .8, y, sz, { h: .5, anchorLeft: true }));
    }
    axisSheet = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: '#d0452f', transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    axisSheet.visible = false; axisSheet.renderOrder = 3; annotations.add(axisSheet);
    levelSheet = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: '#2f6fb0', transparent: true, opacity: .16, depthWrite: false, side: T.DoubleSide, toneMapped: false }));
    levelSheet.rotation.x = -Math.PI / 2; levelSheet.visible = false; levelSheet.renderOrder = 3; annotations.add(levelSheet);
    selection = new T.Group(); selection.name = 'Site view selection'; annotations.add(selection);
    measureGroup = new T.Group(); measureGroup.name = 'Site view measurements'; annotations.add(measureGroup);
  }
  function levelRows() {
    const rows = DATA.grid.filter(r => r.axis3d === 'Y' && Number.isFinite(r.m)).sort((a, b) => a.m - b.m);
    const out = [];
    for (const r of rows) {
      const near = out.find(o => Math.abs(o.m - r.m) < .0005);
      if (near) near.names.push(r.name); else out.push({ m: r.m, names: [r.name], sourceIds: r.sourceIds });
    }
    return out;
  }
  function applyGrid() {
    if (!annotations) return;
    const g = view.grid;
    annotations.userData.floor.visible = g.floor;
    annotations.userData.floor.children.forEach(m => { m.material = g.xray ? ribbonXray : ribbonMat; m.renderOrder = g.xray ? 9 : 1; });
    annotations.userData.labels.visible = g.labels;
    // In an elevation or section the set running along the line of sight would
    // stack into one spot: show the other set, dropped below the ground line.
    const { alongX, alongZ } = annotations.userData, d = view.drawing;
    alongX.visible = d !== 'end'; alongZ.visible = d !== 'side';
    for (const [group, drop] of [[alongX, d === 'side'], [alongZ, d === 'end']]) for (const c of group.children) {
      c.userData.y0 ??= c.position.y;
      c.position.y = c.userData.y0 + (drop ? (c.userData.bubble ? -5.2 : -3.0) : 0);
    }
    if (axisSheet) axisSheet.visible = !!view.axis && view.section?.axis !== view.axis;
    annotations.userData.tags.visible = g.tags;
    // The staff stands beside the tower end, or just beyond an active section cut so it reads with it.
    const staff = annotations.userData.staff, sec = view.section;
    if (sec && sec.axis in LONG()) staff.position.set(LONG()[sec.axis] + (sec.flip ? -.08 : .08), 0, -15.8);
    else if (sec) staff.position.set(-6.2, 0, TRANS()[sec.axis] + (sec.flip ? -.08 : .08));
    else staff.position.set(-6.2, 0, -15.8);
    annotations.userData.levels.visible = g.levels && (view.plan === null || !!sec);
    redraw();
  }
  function floorRibbon(a, b, width) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.ceil(len / .25));
    const dx = (b[0] - a[0]) / len, dz = (b[1] - a[1]) / len, px = -dz * width / 2, pz = dx * width / 2;
    const pos = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const x = a[0] + (b[0] - a[0]) * i / n, z = a[1] + (b[1] - a[1]) * i / n, y = floorY(x, z) + .012;
      pos.push(x + px, y, z + pz, x - px, y, z - pz);
      if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
    const mesh = new T.Mesh(geo, ribbonMat); mesh.name = 'Grid line on the floor'; return mesh;
  }
  function flatLine(a, b, width) {
    const dx = b[0] - a[0], dz = b[2] - a[2], len = Math.hypot(dx, dz);
    const mesh = new T.Mesh(new T.PlaneGeometry(len, width), new T.MeshBasicMaterial({ color: '#2d3d33', toneMapped: false, side: T.DoubleSide }));
    mesh.rotation.set(-Math.PI / 2, 0, -Math.atan2(dz, dx)); mesh.position.set((a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2);
    return mesh;
  }
  const textures = new Map();
  function canvasLabel(text, { circle = false, bold = false, color = '#24342b', ring = '#c8321f', bg = 'rgba(252,251,246,.95)' } = {}) {
    const key = [text, circle, bold, color, ring, bg].join('|');
    if (textures.has(key)) return textures.get(key);
    const size = 64, canvas = document.createElement('canvas'), g = canvas.getContext('2d');
    g.font = `${bold || circle ? 700 : 600} ${size}px Arial, sans-serif`;
    const w = circle ? size * 2 : Math.ceil(g.measureText(text).width) + size * .8, h = circle ? size * 2 : Math.round(size * 1.45);
    canvas.width = w; canvas.height = h;
    g.font = `${bold || circle ? 700 : 600} ${size}px Arial, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    if (circle) {
      g.fillStyle = bg; g.beginPath(); g.arc(w / 2, h / 2, size - 5, 0, Math.PI * 2); g.fill();
      g.lineWidth = 8; g.strokeStyle = ring; g.stroke();
      g.fillStyle = color; g.font = `700 ${text.length > 1 ? size * .78 : size * .95}px Arial, sans-serif`; g.fillText(text, w / 2, h / 2 + 3);
    } else {
      g.fillStyle = bg; g.beginPath(); g.roundRect?.(2, 2, w - 4, h - 4, 14); g.fill();
      g.fillStyle = color; g.fillText(text, w / 2, h / 2 + 2);
    }
    const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; texture.anisotropy = 4;
    const out = { texture, aspect: w / h };
    textures.set(key, out); return out;
  }
  function textSprite(text, x, y, z, { h = .6, bold = false, anchorLeft = false, color, ring } = {}) {
    const { texture, aspect } = canvasLabel(text, { bold, color });
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: texture, depthTest: false, transparent: true, toneMapped: false, fog: false }));
    sprite.scale.set(h * aspect, h, 1); sprite.position.set(x, y, z); sprite.renderOrder = 20;
    if (anchorLeft) sprite.center.set(0, .5);
    return sprite;
  }
  function bubble(text, x, y, z) {
    const { texture } = canvasLabel(text, { circle: true });
    const sprite = new T.Sprite(new T.SpriteMaterial({ map: texture, depthTest: false, transparent: true, toneMapped: false, fog: false }));
    sprite.scale.set(1.7, 1.7, 1); sprite.position.set(x, y, z); sprite.renderOrder = 21; sprite.name = 'Grid bubble ' + text; sprite.userData.bubble = true;
    return sprite;
  }
  function floorTag(text, x, y, z) {
    const { texture, aspect } = canvasLabel(text, { bold: true, color: '#9b2a19', bg: 'rgba(252,251,246,.82)' });
    const h = .42, mesh = new T.Mesh(new T.PlaneGeometry(h * aspect, h), new T.MeshBasicMaterial({ map: texture, transparent: true, toneMapped: false, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
    mesh.rotation.x = -Math.PI / 2; mesh.position.set(x + .42, y + .014, z + .3); mesh.renderOrder = 2; mesh.name = 'Grid crossing ' + text;
    return mesh;
  }
  function selectAxis(name) {
    ensureAnnotations();
    const L = LONG(), Tz = TRANS();
    view.axis = name in L || name in Tz ? name : null;
    if (!view.axis) { axisSheet.visible = false; render(); redraw(); return null; }
    const height = 14.5, bottom = -2.1;
    if (name in L) { axisSheet.scale.set(36.4, height, 1); axisSheet.rotation.set(0, Math.PI / 2, 0); axisSheet.position.set(L[name], bottom + height / 2, 0); }
    else { axisSheet.scale.set(73, height, 1); axisSheet.rotation.set(0, 0, 0); axisSheet.position.set(21, bottom + height / 2, Tz[name]); }
    axisSheet.visible = view.section?.axis !== name; render(); redraw();
    return view.axis;
  }
  function selectLevel(m) {
    ensureAnnotations();
    view.level = Number.isFinite(m) ? m : null;
    levelSheet.visible = view.level !== null;
    if (levelSheet.visible) { levelSheet.scale.set(58, 30, 1); levelSheet.position.set(26.5, view.level + .002, 0); }
    render(); redraw(); return view.level;
  }

  // ---- Cuts and views ----
  function setCut(kind, value) {
    if (kind === 'plan') view.plan = Number.isFinite(value) ? value : null;
    if (kind === 'section') view.section = value && (value.axis in LONG() || value.axis in TRANS()) ? { axis: value.axis, flip: !!value.flip } : null;
    const planes = [];
    if (view.plan !== null) planes.push(new T.Plane(new T.Vector3(0, -1, 0), view.plan));
    if (view.section) {
      const { axis, flip } = view.section, s = flip ? -1 : 1;
      if (axis in LONG()) planes.push(new T.Plane(new T.Vector3(s, 0, 0), -s * LONG()[axis]));
      else planes.push(new T.Plane(new T.Vector3(0, 0, s), -s * TRANS()[axis]));
    }
    church.renderer.clippingPlanes = planes;
    applyGrid(); render(); redraw();
    return { plan: view.plan, section: view.section };
  }
  function siteView(name) {
    view.drawing = ['front', 'rear'].includes(name) ? 'end' : ['left', 'right'].includes(name) ? 'side' : null;
    applyGrid();
    if (name === '3d') { setCut('plan', null); setCut('section', null); church.setView?.('front-right'); fitFree(); return; }
    if (name === 'plan') { if (view.plan === null) setCut('plan', 1.2); church.setView?.('overhead'); fitFree({ x: [-18, 60], z: [-21, 21] }); return; }
    church.setView?.(name);
    const tall = view.section ? [-2.6, 15] : [-2.6, 38];
    fitFree(['front', 'rear'].includes(name) ? { z: [-21, 21], y: tall } : { x: [-18, 60], y: tall });
  }
  // Fit a drawing view into the part of the canvas that the panel and toolbar
  // leave free. The camera and orbit target stay where the viewer put them; only
  // the projection window is offset (and an orthographic view zoomed), so the
  // orbit controls keep working and nothing persists after the site view closes.
  const offsetCameras = new Set();
  let lastFit = null;
  function fitFree(span) {
    const cam = church.camera, canvas = church.renderer.domElement, target = church.controls.target;
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const left = Math.min(W * .6, ($('sitePanel')?.getBoundingClientRect().right || 0) + 12), top = 84, bottom = 78;
    const freeW = W - left - 16, freeH = H - top - bottom, fx = left + freeW / 2, fy = top + freeH / 2;
    cam.updateMatrixWorld();
    const right = new T.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new T.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    let dx = 0, dy = 0;
    if (cam.isOrthographicCamera && span) {
      const corners = [];
      for (const x of span.x || [target.x, target.x]) for (const y of span.y || [target.y, target.y]) for (const z of span.z || [target.z, target.z]) corners.push(new T.Vector3(x, y, z));
      const centre = corners.reduce((a, c) => a.add(c), new T.Vector3()).multiplyScalar(1 / corners.length);
      const sx = Math.max(...corners.map(c => c.dot(right))) - Math.min(...corners.map(c => c.dot(right)));
      const sy = Math.max(...corners.map(c => c.dot(up))) - Math.min(...corners.map(c => c.dot(up)));
      const perPx = Math.max(sx / freeW, sy / freeH);
      cam.zoom = (cam.right - cam.left) / (W * perPx);
      const d = centre.sub(target);
      dx = d.dot(right) / perPx; dy = d.dot(up) / perPx;
    }
    cam.setViewOffset(W, H, W / 2 + dx - fx, H / 2 - dy - fy, W, H);
    offsetCameras.add(cam); lastFit = { cam, span };
    redraw();
  }
  function clearOffsets() {
    for (const cam of offsetCameras) { cam.clearViewOffset(); cam.updateProjectionMatrix(); }
    offsetCameras.clear(); lastFit = null;
  }
  function refit() {
    if (!view.open || !lastFit) return;
    if (lastFit.cam !== church.camera) { clearOffsets(); fitFree(); return; }
    requestAnimationFrame(() => view.open && lastFit && fitFree(lastFit.span));
  }

  // ---- Picking, inspector, measuring ----
  const raycaster = () => (pick.ray ||= new T.Raycaster());
  function pick(event) {
    const rect = church.renderer.domElement.getBoundingClientRect();
    const ndc = new T.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    const ray = raycaster(); ray.setFromCamera(ndc, church.camera);
    const planes = church.renderer.clippingPlanes || [];
    const visibleMesh = m => {
      const layer = layerByMesh.get(m);
      if (!['show', 'focus'].includes(effectiveStyle(layer))) return false;
      const display = batches.get(sourceByMesh.get(m));
      return !display || display.visible;
    };
    const targets = meshes.filter(visibleMesh);
    const g = simGroup();
    if (g?.visible) g.children.forEach(o => { if (o.visible) targets.push(o); });
    const hits = ray.intersectObjects(targets, true).filter(h => planes.every(p => p.distanceToPoint(h.point) >= -1e-4) && visibleChain(h.object));
    return hits[0] || null;
  }
  function visibleChain(o) {
    for (let p = o; p; p = p.parent) { if (p === building) return true; if (!p.visible) return false; }
    return true;
  }
  function onCanvasClick(event) {
    const hit = pick(event);
    if (view.tool === 'measure') return measureClick(hit);
    if (!hit) { clearSelection(); return; }
    inspectObject(hit.object, hit.point);
  }
  function fixtureOf(object) {
    for (let p = object; p; p = p.parent) if (p.userData?.simId) return p;
    return null;
  }
  function gridReference(x, z) {
    const near = (entries, v) => {
      const sorted = entries.sort((a, b) => a[1] - b[1]);
      let best = sorted[0];
      for (const e of sorted) if (Math.abs(e[1] - v) < Math.abs(best[1] - v)) best = e;
      const d = v - best[1];
      if (Math.abs(d) < .0005) return { text: `${tr('on', 'trên trục')} ${best[0]}`, axis: best[0], offset: 0 };
      const i = sorted.indexOf(best), toward = sorted[i + Math.sign(d)]?.[0];
      return { text: `${best[0]} ${d > 0 ? '+' : '−'} ${Math.abs(d).toFixed(3)} m${toward ? ` ${tr('toward', 'về phía')} ${toward}` : ''}`, axis: best[0], offset: d };
    };
    return { x: near(Object.entries(LONG()), x), z: near(Object.entries(TRANS()), z) };
  }
  function inspectObject(object, point) {
    lastInspected = { object, point };
    ensureAnnotations();
    const fixture = fixtureOf(object), target = fixture || object;
    target.updateWorldMatrix?.(true, true);
    const box = new T.Box3().setFromObject(target, true);
    const size = box.getSize(new T.Vector3()), centre = box.getCenter(new T.Vector3());
    clearSelection();
    lastInspected = { object, point }; // clearSelection() has just cleared it
    const helper = new T.Box3Helper(box, new T.Color('#f08a24')); helper.material.depthTest = false; helper.material.toneMapped = false; helper.renderOrder = 30;
    selection.add(helper);
    const label = (t, x, y, z) => selection.add(textSprite(t, x, y, z, { h: .38, bold: true }));
    if (size.x > .05) label(`${(size.x).toFixed(3)} m`, centre.x, box.max.y + .25, box.min.z);
    if (size.z > .05) label(`${(size.z).toFixed(3)} m`, box.max.x, box.max.y + .25, centre.z);
    if (size.y > .05) label(`${(size.y).toFixed(3)} m`, box.min.x - .2, centre.y, box.min.z);
    const item = fixture ? SIM?.state?.items?.find(i => i.id === fixture.userData.simId) : null;
    const layer = fixture ? 'equipment' : layerByMesh.get(object) || layerOf(object, sourceByMesh.get(object));
    const status = fixture ? (item?.status || 'Simulator proposal · CONCEPT') : object.userData?.status || '';
    const ev = fixture ? EVIDENCE.concept : EVIDENCE[evidenceClass(status)];
    const ref = gridReference(centre.x, centre.z), pRef = point ? gridReference(point.x, point.z) : null;
    view.selected = { name: fixture ? (item?.label || item?.name || fixture.name) : object.name, id: item?.id || null, layer, status, size: size.toArray(), min: box.min.toArray(), max: box.max.toArray(), centre: centre.toArray(), ref };
    const rows = [
      [tr('Length along X (toward sanctuary)', 'Chiều dài theo X (về phía cung thánh)'), `${size.x.toFixed(3)} m`], [tr('Width along Z (across)', 'Chiều rộng theo Z (ngang)'), `${size.z.toFixed(3)} m`], [tr('Height', 'Chiều cao'), `${size.y.toFixed(3)} m`],
      [tr('Bottom level', 'Cao độ đáy'), `${fmtM(box.min.y)} m`], [tr('Top level', 'Cao độ đỉnh'), `${fmtM(box.max.y)} m`],
      [tr('Centre, longitudinal', 'Tâm theo chiều dọc'), `X ${centre.x.toFixed(3)} · ${ref.x.text}`], [tr('Centre, across', 'Tâm theo chiều ngang'), `Z ${fmtM(centre.z)} · ${ref.z.text}`],
    ];
    if (point) rows.push([tr('Clicked point', 'Điểm đã bấm'), `X ${point.x.toFixed(3)} · Y ${fmtM(point.y)} · Z ${fmtM(point.z)}<br><small>${esc(pRef.x.text)} · ${esc(pRef.z.text)}</small>`]);
    if (item?.circuit) rows.push([tr('Circuit', 'Mạch điện'), esc(item.circuit)]);
    const card = $('siteInspector');
    card.innerHTML = `<div class="site-head"><div><span class="site-eyebrow">${esc(tr(LAYER[layer]?.en || layer, LAYER[layer]?.vi || layer))}</span><strong>${esc(view.selected.name || tr('Part', 'Bộ phận'))}</strong></div><button class="close-button" data-site="deselect" aria-label="${tr('Close', 'Đóng')}">×</button></div>
      <p class="site-evidence ev-${fixture ? 'concept' : evidenceClass(status)}"><b>${esc(tr(ev[0], ev[1]))}</b><br>${esc(tr(ev[2], ev[3]))}</p>
      <table class="site-facts">${rows.map(([k, v]) => `<tr><th>${esc(k)}</th><td>${v.includes('<') ? v : esc(v)}</td></tr>`).join('')}</table>
      <p class="site-note">${status ? `${tr('Model status', 'Trạng thái mô hình')}: ${esc(status)}. ` : ''}${object.userData?.source ? `${tr('Source', 'Nguồn')}: ${esc(object.userData.source)}. ` : ''}${tr("Sizes are the part's bounding box in the model, rounded to 1 mm. The model is not a survey; check the drawing sheet and site before building.", 'Kích thước là khung bao của bộ phận trong mô hình, làm tròn đến 1 mm. Mô hình không phải là khảo sát đo đạc; hãy kiểm tra tờ bản vẽ và công trường trước khi thi công.')}</p>
      <div class="site-actions"><button data-site="isolate-layer" data-layer="${esc(layer)}">${tr('Isolate this layer', 'Chỉ hiện lớp này')}</button><button data-site="ghost-layer" data-layer="${esc(layer)}">${tr('Ghost this layer', 'Làm mờ lớp này')}</button></div>`;
    card.hidden = false;
    $('siteReadout').textContent = `${view.selected.name}: ${size.x.toFixed(3)} × ${size.z.toFixed(3)} × ${size.y.toFixed(3)} m · ${tr('base', 'đáy')} ${fmtM(box.min.y)} · ${ref.x.text} / ${ref.z.text}`;
    redraw();
    return view.selected;
  }
  function clearSelection() {
    view.selected = null; lastInspected = null;
    if (selection) { for (const o of [...selection.children]) { selection.remove(o); o.geometry?.dispose?.(); if (o.isSprite) o.material.dispose(); } }
    const card = $('siteInspector'); if (card) card.hidden = true;
    redraw();
  }
  function snapPoint(hit) {
    if (!hit) return null;
    const p = hit.point.clone();
    let snapped = 'surface';
    if (hit.face && hit.object.geometry?.attributes?.position) {
      const pos = hit.object.geometry.attributes.position;
      let best = null;
      for (const i of [hit.face.a, hit.face.b, hit.face.c]) {
        const v = new T.Vector3().fromBufferAttribute(pos, i).applyMatrix4(hit.object.matrixWorld);
        const d = v.distanceTo(hit.point);
        if (d < .15 && (!best || d < best.d)) best = { v, d };
      }
      if (best) { p.copy(best.v); snapped = 'corner'; }
    }
    if (snapped === 'surface') {
      const L = Object.values(LONG()), Z = Object.values(TRANS());
      const x = L.find(v => Math.abs(v - p.x) < .2), z = Z.find(v => Math.abs(v - p.z) < .2);
      if (x !== undefined && z !== undefined) { p.x = x; p.z = z; snapped = 'grid crossing'; }
    }
    return { p, snapped };
  }
  function measureClick(hit) {
    const s = snapPoint(hit);
    if (!s) return;
    if (!view.pending) { view.pending = s; renderMeasures(); $('siteReadout').textContent = `${tr('First point', 'Điểm thứ nhất')} (${snapName(s.snapped)}) X ${s.p.x.toFixed(3)} Y ${fmtM(s.p.y)} Z ${fmtM(s.p.z)} · ${tr('click the second point', 'bấm điểm thứ hai')}`; return; }
    const a = view.pending.p, b = s.p, d = b.clone().sub(a);
    view.measures.push({ a: a.toArray(), b: b.toArray(), d: d.length(), dx: d.x, dy: d.y, dz: d.z, h: Math.hypot(d.x, d.z), snaps: [view.pending.snapped, s.snapped] });
    view.pending = null; renderMeasures();
    const m = view.measures[view.measures.length - 1];
    $('siteReadout').textContent = `${tr('Distance', 'Khoảng cách')} ${m.d.toFixed(3)} m · ${tr('horizontal', 'ngang')} ${m.h.toFixed(3)} · ΔX ${m.dx.toFixed(3)} · ΔZ ${m.dz.toFixed(3)} · ${tr('height', 'chiều cao')} ${m.dy.toFixed(3)}`;
    render();
  }
  function renderMeasures() {
    if (!measureGroup) return;
    for (const o of [...measureGroup.children]) { measureGroup.remove(o); o.geometry?.dispose?.(); }
    const dot = p => { const m = new T.Mesh(new T.SphereGeometry(.07, 12, 8), new T.MeshBasicMaterial({ color: '#1b5fae', depthTest: false, toneMapped: false })); m.position.fromArray(p); m.renderOrder = 31; measureGroup.add(m); };
    for (const m of view.measures) {
      dot(m.a); dot(m.b);
      const a = new T.Vector3().fromArray(m.a), b = new T.Vector3().fromArray(m.b), len = a.distanceTo(b);
      const rod = new T.Mesh(new T.CylinderGeometry(.025, .025, len, 8), new T.MeshBasicMaterial({ color: '#1b5fae', depthTest: false, toneMapped: false }));
      rod.position.copy(a).add(b).multiplyScalar(.5); rod.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()); rod.renderOrder = 31;
      measureGroup.add(rod);
      const mid = a.clone().add(b).multiplyScalar(.5);
      measureGroup.add(textSprite(`${m.d.toFixed(3)} m`, mid.x, mid.y + .3, mid.z, { h: .42, bold: true }));
    }
    if (view.pending) dot(view.pending.p.toArray());
    redraw();
  }
  function clearMeasures() { view.measures = []; view.pending = null; renderMeasures(); }
  function setTool(tool) {
    view.tool = tool === 'measure' ? 'measure' : 'inspect'; view.pending = null; renderMeasures();
    $('siteReadout').textContent = view.tool === 'measure' ? tr('Measure: click the first point. Snaps to corners within 15 cm and grid crossings within 20 cm.', 'Đo: bấm điểm thứ nhất. Tự bắt vào góc trong phạm vi 15 cm và giao trục trong phạm vi 20 cm.') : tr(READY[0], READY[1]);
    render(); return view.tool;
  }

  // ---- Dimension register checks ----
  function axisPair(text) {
    const last = String(text || '').split('\n').pop().replace(/Grid /g, '').trim();
    const m = last.match(/^([0-9A-Z]+′?)\s*→\s*([0-9A-Z]+′?)$/);
    if (!m) return null;
    const L = LONG(), Tz = TRANS();
    if (m[1] in L && m[2] in L) return { dir: 'X', a: m[1], b: m[2], model: Math.abs(L[m[2]] - L[m[1]]) * 1000 };
    if (m[1] in Tz && m[2] in Tz) return { dir: 'Z', a: m[1], b: m[2], model: Math.abs(Tz[m[2]] - Tz[m[1]]) * 1000 };
    return null;
  }
  function modelCheck(row) {
    const pair = axisPair(row.axes);
    if (!pair || !Number.isFinite(row.mm)) return null;
    return { ...pair, drawing: row.mm, diff: pair.model - row.mm };
  }
  function showRecord(row) {
    const pair = axisPair(row.axes);
    if (pair) {
      selectAxis(pair.a);
      clearSelection();
      const L = LONG(), Tz = TRANS(), y = 1.6;
      const [a, b] = pair.dir === 'X' ? [[L[pair.a], y, 0], [L[pair.b], y, 0]] : [[22, y, Tz[pair.a]], [22, y, Tz[pair.b]]];
      view.measures.push({ a, b, d: Math.abs(pair.model / 1000), dx: b[0] - a[0], dy: 0, dz: b[2] - a[2], h: Math.abs(pair.model / 1000), snaps: ['grid', 'grid'], record: row.id });
      renderMeasures();
      toast(`${row.id}: ${tr('drawing', 'bản vẽ')} ${fmtMm(row.mm)} mm · ${tr('model', 'mô hình')} ${fmtMm(pair.model)} mm ${tr('between axes', 'giữa trục')} ${pair.a} ${tr('and', 'và')} ${pair.b}`);
      return;
    }
    if (/^Model: Y/.test(row.axes) && Number.isFinite(row.m) && row.parameter.includes('elevation')) { selectLevel(row.m); toast(`${row.id}: ${tr('level', 'cao độ')} ${fmtM(row.m)} m ${tr('shown as a blue plane', 'hiển thị bằng mặt phẳng xanh')}`); return; }
    toast(`${row.id} ${tr('is a drawing witness without model end points; read it on', 'là số liệu bản vẽ không có điểm đầu cuối trong mô hình; đọc tại')} ${row.sheet.replace(/\n/g, ' · ')}`);
  }

  // ---- Panel rendering ----
  function render() {
    if (!view.open) return;
    document.querySelectorAll('#sitePanel [data-tab]').forEach(b => { b.classList.toggle('active', b.dataset.tab === view.tab); b.setAttribute('aria-selected', String(b.dataset.tab === view.tab)); });
    document.querySelectorAll('#siteToolbar [data-tool]').forEach(b => b.classList.toggle('active', b.dataset.tool === view.tool));
    const body = $('siteBody');
    const scroll = body.scrollTop;
    body.innerHTML = view.tab === 'layers' ? layersHtml() : view.tab === 'phases' ? phasesHtml() : view.tab === 'check' ? checkHtml() : gridHtml();
    body.scrollTop = scroll;
  }
  const toggle = (key, label) => `<label class="site-switch"><input type="checkbox" data-grid="${key}" ${view.grid[key] ? 'checked' : ''}><span>${label}</span></label>`;
  function gridHtml() {
    const L = Object.entries(LONG()).sort((a, b) => a[1] - b[1]), Z = Object.entries(TRANS()).sort((a, b) => a[1] - b[1]);
    const axisRows = (list, coord) => list.map(([n, v], i) => `<tr class="${view.axis === n ? 'active' : ''}"><td><button class="axis-chip" data-axis="${esc(n)}">${esc(n)}</button></td><td>${coord} ${fmtM(v)}</td><td>${i ? fmtMm((v - list[i - 1][1]) * 1000) : '—'}</td><td><button class="link" data-section="${esc(n)}">${tr('Section', 'Mặt cắt')}</button></td></tr>`).join('');
    const levels = levelRows();
    return `<section><h3>${tr('Show on the model', 'Hiển thị trên mô hình')}</h3><div class="site-switches">
        ${toggle('floor', tr('Grid lines on the floors', 'Đường trục trên sàn'))}${toggle('xray', tr('See grid through walls', 'Nhìn xuyên tường'))}
        ${toggle('labels', tr('Axis bubbles and dimension chains', 'Ký hiệu trục, chuỗi kích thước'))}${toggle('tags', tr('Crossing tags (e.g. 5·D)', 'Nhãn giao trục (ví dụ 5·D)'))}
        ${toggle('levels', tr('Level staff', 'Thước cao độ'))}</div></section>
      <section><h3>${tr('Cuts', 'Mặt cắt')}</h3>
        <label class="site-range"><span>${tr('Plan cut', 'Cắt mặt bằng')} <b>${view.plan === null ? tr('off', 'tắt') : fmtM(view.plan, 2) + ' m'}</b></span><input type="range" min="-2" max="38" step=".05" value="${view.plan ?? 38}" data-cut="plan"></label>
        <div class="site-row"><button data-site="plan-cut" data-h="1.2">${tr('Floor plan +1.20', 'Mặt bằng sàn +1.20')}</button><button data-site="plan-cut" data-h="8">${tr('Above eaves +8.00', 'Trên mái hiên +8.00')}</button><button data-site="plan-cut" data-h="off">${tr('No plan cut', 'Không cắt mặt bằng')}</button></div>
        <p class="site-hint">${view.section ? `${tr('Section on axis', 'Mặt cắt trên trục')} <b>${esc(view.section.axis)}</b>${view.section.flip ? tr(', looking back', ', nhìn ngược lại') : ''}. <button class="link" data-site="flip-section">${tr('Look the other way', 'Nhìn theo hướng khác')}</button> · <button class="link" data-site="section-off">${tr('Remove', 'Bỏ')}</button>` : tr('Choose “Section” beside an axis to cut the model on it.', 'Chọn “Mặt cắt” bên cạnh một trục để cắt mô hình theo trục đó.')}</p></section>
      <section><h3>${tr('Longitudinal axes (1–12, X)', 'Trục dọc (1–12, X)')}</h3><table class="site-table"><thead><tr><th>${tr('Axis', 'Trục')}</th><th>${tr('Model X (m)', 'X mô hình (m)')}</th><th>${tr('Spacing (mm)', 'Khoảng cách (mm)')}</th><th></th></tr></thead><tbody>${axisRows(L, 'X')}</tbody></table></section>
      <section><h3>${tr('Transverse axes (A–I, Z)', 'Trục ngang (A–I, Z)')}</h3><table class="site-table"><thead><tr><th>${tr('Axis', 'Trục')}</th><th>${tr('Model Z (m)', 'Z mô hình (m)')}</th><th>${tr('Spacing (mm)', 'Khoảng cách (mm)')}</th><th></th></tr></thead><tbody>${axisRows(Z, 'Z')}</tbody></table>
        <p class="site-hint">${tr('X starts at axis 1 and increases toward the sanctuary; Z is 0 midway between D and E, negative toward B. Y is height from the nave finished floor ±0.000.', 'X bắt đầu từ trục 1 và tăng về phía cung thánh; Z = 0 ở giữa D và E, âm về phía B. Y là chiều cao tính từ cao độ hoàn thiện sàn lòng nhà thờ ±0.000.')}</p></section>
      <section><h3>${tr('Levels', 'Cao độ')}</h3><table class="site-table"><tbody>${levels.map(l => `<tr class="${view.level === l.m ? 'active' : ''}"><td><button class="link" data-level="${l.m}">${fmtM(l.m)}</button></td><td>${esc(l.names.join(' / '))}</td><td><button class="link" data-site="plan-cut" data-h="${(l.m + 1.2).toFixed(3)}">${tr('Cut +1.2', 'Cắt +1.2')}</button></td></tr>`).join('')}</tbody></table>
        <p class="site-hint">${tr("Levels from the workbook's Model grid sheet. Nearby values that differ by 1 mm (for example +6.324 and +6.325) are separate drawing witnesses; both are kept.", 'Cao độ lấy từ trang Model grid của bảng tính. Các giá trị gần nhau chênh 1 mm (ví dụ +6.324 và +6.325) là hai số liệu bản vẽ riêng; cả hai được giữ lại.')}</p></section>`;
  }
  function layersHtml() {
    const total = l => counts[l.id].parts;
    const bar = c => { const t = Math.max(1, c.parts); return ['drawn', 'mixed', 'schematic', 'concept', 'hold', 'unlabelled'].map(k => c[k] ? `<i class="ev-${k}" style="width:${(c[k] / t * 100).toFixed(1)}%" title="${tr(EVIDENCE[k][0], EVIDENCE[k][1])}: ${c[k]}"></i>` : '').join(''); };
    return `<section><div class="site-row"><button data-site="layers-all">${tr('Show all', 'Hiện tất cả')}</button><button data-site="layers-structure">${tr('Structure only', 'Chỉ kết cấu')}</button><button data-site="layers-shell">${tr('Shell without ornament', 'Vỏ công trình, không trang trí')}</button></div>
      <ul class="site-layers">${LAYERS.map(l => `<li class="${view.styles[l.id]}"><span class="swatch" style="background:${l.color}"></span><div class="layer-name"><b>${esc(tr(l.en, l.vi))}</b><small>${l.special ? tr('simulator items', 'thiết bị mô phỏng') : `${total(l)} ${tr('parts', 'bộ phận')}`}</small>${l.special ? '' : `<span class="evbar">${bar(counts[l.id])}</span>`}</div>
        <div class="seg" role="group" aria-label="${esc(tr(l.en, l.vi))}">${['show', 'ghost', 'hide'].map(s => `<button data-layer="${l.id}" data-style="${s}" class="${view.styles[l.id] === s || (s === 'show' && view.styles[l.id] === 'focus') ? 'on' : ''}" ${l.special && s === 'ghost' ? 'disabled' : ''}>${{ show: tr('Show', 'Hiện'), ghost: tr('Ghost', 'Mờ'), hide: tr('Hide', 'Ẩn') }[s]}</button>`).join('')}<button data-isolate="${l.id}" title="${tr('Show only this layer', 'Chỉ hiện lớp này')}">${tr('Only', 'Chỉ lớp này')}</button></div></li>`).join('')}</ul>
      <p class="site-legend">${['drawn', 'mixed', 'schematic', 'concept'].map(k => `<span><i class="ev-${k}"></i>${tr(EVIDENCE[k][0], EVIDENCE[k][1])}</span>`).join('')}</p>
      <p class="site-hint">${tr('Bars show how many parts in each layer come from the drawings and how many are schematic or concept shapes. Foundations and reinforcement are not modelled.', 'Thanh màu cho biết mỗi lớp có bao nhiêu bộ phận lấy từ bản vẽ và bao nhiêu là hình minh hoạ hoặc đề xuất. Móng và cốt thép chưa được mô hình hoá.')}</p></section>`;
  }
  function phasesHtml() {
    const next = nextPhase(), issues = Object.fromEntries(DATA.issues.map(i => [i.id, i])), eng = DATA.phases.engineering || {}, engVi = DATA.phases.engineering_vi || {};
    const gate = id => `<li><button class="link" data-gate="${esc(id)}">${esc(id)}</button> ${esc(issues[id] ? pickText(issues[id].issue) : tr(eng[id] || '', engVi[id] || eng[id] || ''))}</li>`;
    const anyRecorded = PHASES.some(p => phaseStatus(p.id) !== 'unknown');
    const openCount = next === null ? 0 : PHASES[next].gates.length;
    return `<section class="site-next"><span class="site-eyebrow">${anyRecorded ? tr('Next to build', 'Việc tiếp theo') : tr('Progress not recorded yet', 'Chưa ghi tiến độ')}</span>
        ${next === null ? `<strong>${tr('All phases recorded as built.', 'Mọi giai đoạn đều ghi là đã xong.')}</strong>` : `<strong>${esc(PHASES[next].id)} · ${esc(tr(PHASES[next].en, PHASES[next].vi))}</strong>
        <p>${openCount} ${tr(`open record${openCount === 1 ? '' : 's'} affect this phase. Resolve or accept each with the responsible designer before starting.`, 'hồ sơ còn mở ảnh hưởng đến giai đoạn này. Giải quyết hoặc chấp nhận từng hồ sơ với nhà thiết kế phụ trách trước khi bắt đầu.')}</p><button data-phase-show="${next + 1}">${tr('Show it on the model', 'Hiện trên mô hình')}</button>`}</section>
      <section><h3>${tr('Build sequence', 'Trình tự thi công')}</h3>
        <label class="site-range"><span>${tr('Show the church up to', 'Hiện nhà thờ đến')} <b>${view.phase ? PHASES[view.phase - 1].id : tr('all, as designed', 'tất cả, theo thiết kế')}</b></span><input type="range" min="0" max="${PHASES.length}" step="1" value="${view.phase}" data-phase-range></label>
        <div class="site-row"><button data-site="play">${view.playing ? tr('Playing…', 'Đang chạy…') : tr('▶ Play the sequence', '▶ Chạy trình tự')}</button><label class="site-inline">${tr('Later phases', 'Giai đoạn sau')} <select data-future><option value="ghost" ${view.future === 'ghost' ? 'selected' : ''}>${tr('ghosted', 'làm mờ')}</option><option value="hide" ${view.future === 'hide' ? 'selected' : ''}>${tr('hidden', 'ẩn')}</option></select></label></div>
        <p class="site-hint">${esc(tr(DATA.phases.status || '', DATA.phases.status_vi || DATA.phases.status || ''))}. ${tr('Earlier phases show normally, the chosen phase in amber.', 'Các giai đoạn trước hiện bình thường, giai đoạn đã chọn có màu hổ phách.')}</p></section>
      <ol class="site-phases">${PHASES.map((p, i) => `<li class="${view.phase === i + 1 ? 'current' : ''} ${next === i ? 'next' : ''}"><div class="phase-head"><button class="phase-num" data-phase-show="${i + 1}" title="${tr('Show on the model', 'Hiện trên mô hình')}">${esc(p.id)}</button><div><b>${esc(tr(p.en, p.vi))}</b></div>
          <select data-status="${esc(p.id)}" ${VISIT ? `disabled title="${tr('Public visit: records are not saved', 'Xem công khai: hồ sơ không được lưu')}"` : ''}>${STATUS.map(([v, en, vi]) => `<option value="${v}" ${phaseStatus(p.id) === v ? 'selected' : ''}>${tr(en, vi)}</option>`).join('')}</select></div>
          <p>${esc(tr(p.check, p.check_vi))}</p><p class="site-layers-inline">${p.layers.length ? p.layers.map(l => `<span style="--c:${LAYER[l].color}">${esc(tr(LAYER[l].en, LAYER[l].vi))}</span>`).join('') : `<span>${tr('Grid and levels', 'Lưới trục và cao độ')}</span>`}</p>
          <details><summary>${p.gates.length} ${tr('open records to resolve', 'hồ sơ cần giải quyết')}</summary><ul class="site-gates">${p.gates.map(gate).join('')}</ul></details></li>`).join('')}</ol>
      <section class="site-record">${VISIT ? `<p class="site-hint">${tr('Public visit: phase records are not saved or read here.', 'Xem công khai: hồ sơ giai đoạn không được lưu hay đọc tại đây.')}</p>` : `<p class="site-hint">${tr('Records are kept in this browser only. Export them to keep a copy or share with the engineer.', 'Hồ sơ chỉ được lưu trong trình duyệt này. Xuất hồ sơ để giữ bản sao hoặc gửi cho kỹ sư.')}</p><div class="site-row"><button data-site="export-json">${tr('Export record (JSON)', 'Xuất hồ sơ (JSON)')}</button><button data-site="export-csv">${tr('Export checks (CSV)', 'Xuất kiểm tra (CSV)')}</button><label class="file-button">${tr('Import record', 'Nhập hồ sơ')}<input type="file" accept="application/json,.json" data-import></label></div>`}</section>`;
  }
  function checkHtml() {
    const q = view.query.trim().toLowerCase(), f = view.filter;
    const rows = DATA.dimensions.filter(r => {
      if (f === 'grid' && !/axis_spacing|axis_span/.test(r.parameter)) return false;
      if (f === 'levels' && !/^Model: Y/.test(r.axes)) return false;
      if (f === 'unresolved' && !/Unresolved/.test(r.basis)) return false;
      if (f === 'checked' && !record.checks[r.id]) return false;
      return !q || [r.id, r.part, r.parameter, r.axes, r.label, r.sheet, r.locator, r.notes].join(' ').toLowerCase().includes(q);
    });
    const shown = rows.slice(0, 150);
    const gridChecks = DATA.dimensions.map(modelCheck).filter(Boolean), agree = gridChecks.filter(c => Math.abs(c.diff) < .5).length;
    const tol = record.toleranceMm;
    const row = r => {
      const check = modelCheck(r), site = record.checks[r.id], diff = site && Number.isFinite(site.measuredMm) && Number.isFinite(r.mm) ? site.measuredMm - r.mm : null;
      const verdict = diff === null ? '' : tol === null ? `Δ ${diff > 0 ? '+' : ''}${fmtMm(diff)} mm` : Math.abs(diff) <= tol ? `${tr('Within', 'Trong phạm vi')} ±${tol} mm (Δ ${fmtMm(diff)})` : `${tr('Outside', 'Ngoài phạm vi')} ±${tol} mm (Δ ${fmtMm(diff)})`;
      return `<li class="${/Unresolved/.test(r.basis) ? 'unresolved' : ''}"><div class="dim-head"><button class="link dim-id" data-record="${esc(r.id)}" title="${tr('Show in the model', 'Hiện trên mô hình')}">${esc(r.id)}</button><b>${Number.isFinite(r.mm) ? fmtMm(r.mm) + ' mm' : esc(r.source || '—')}</b><span>${esc(pickText(r.basis))}</span></div>
        <p>${esc(pickLines(r.part))} · ${esc(r.parameter)} · ${esc(r.axes.split('\n').pop())}</p>
        <small>${esc(r.sheet.replace(/\n/g, ' · '))} · ${esc(r.locator)}${r.notes ? ' · ' + esc(r.notes) : ''}</small>
        ${check ? `<small class="${Math.abs(check.diff) < .5 ? 'ok' : 'warn'}">${tr('Model grid', 'Lưới mô hình')} ${fmtMm(check.model)} mm · ${Math.abs(check.diff) < .5 ? tr('agrees with the drawing', 'khớp với bản vẽ') : `${tr('differs by', 'chênh')} ${fmtMm(check.diff)} mm`}</small>` : ''}
        ${VISIT || !Number.isFinite(r.mm) ? '' : `<div class="site-measure"><label>${tr('Measured on site (mm)', 'Đo tại công trường (mm)')} <input type="number" step="1" inputmode="numeric" value="${site?.measuredMm ?? ''}" data-measured="${esc(r.id)}"></label><label>${tr('Date', 'Ngày')} <input type="date" value="${esc(site?.date || '')}" data-date="${esc(r.id)}"></label>${verdict ? `<span class="verdict ${tol !== null && Math.abs(diff) > tol ? 'bad' : ''}">${verdict}</span>` : ''}</div>`}</li>`;
    };
    return `<section><p class="site-hint"><b>${agree} ${tr('of', 'trong số')} ${gridChecks.length}</b> ${tr('grid spacings in the workbook agree with the model grid to the millimetre.', 'khoảng cách trục trong bảng tính khớp với lưới mô hình đến từng mm.')} ${DATA.dimensions.length} ${tr('dimension records from', 'bản ghi kích thước từ')} ${DATA.drawings?.length || 9} ${tr('drawing files;', 'tệp bản vẽ;')} ${DATA.dimensions.filter(r => /Unresolved/.test(r.basis)).length} ${tr('are marked unresolved.', 'được đánh dấu chưa xác nhận.')}</p>
        <input class="site-search" type="search" placeholder="${tr('Search ID, part, axis, sheet…', 'Tìm mã, bộ phận, trục, tờ bản vẽ…')}" value="${esc(view.query)}" data-query>
        <div class="site-row chips">${[['grid', 'Grid spacings', 'Khoảng cách trục'], ['levels', 'Levels', 'Cao độ'], ['unresolved', 'Unresolved', 'Chưa xác nhận'], ['checked', 'Measured on site', 'Đo tại công trường'], ['all', 'All', 'Tất cả']].map(([k, en, vi]) => `<button data-filter="${k}" class="${f === k ? 'on' : ''}">${tr(en, vi)}</button>`).join('')}</div>
        ${VISIT ? '' : `<label class="site-inline">${tr('Check tolerance (mm)', 'Dung sai kiểm tra (mm)')} <input type="number" min="0" step="1" value="${tol ?? ''}" placeholder="${tr('set by the engineer', 'do kỹ sư đặt')}" data-tolerance></label>`}</section>
      <ul class="site-dims">${shown.map(row).join('')}</ul>${rows.length > shown.length ? `<p class="site-hint">${rows.length - shown.length} ${tr('more. Refine the search.', 'mục nữa. Hãy thu hẹp tìm kiếm.')}</p>` : ''}
      <section><h3>${tr('Open dimension items', 'Kích thước cần xác nhận')}</h3><ul class="site-issues">${DATA.issues.map(i => `<li id="issue-${esc(i.id)}"><b>${esc(i.id)}</b> ${esc(pickText(i.issue))}<small>${esc(i.evidence)}</small><small class="warn">${esc(pickText(i.status))} · ${esc(pickText(i.required))}</small></li>`).join('')}</ul>
        <p class="site-hint">${tr('From', 'Từ')} ${esc(DATA.phases.sources?.workbook || tr('the dimension workbook', 'bảng tính kích thước'))} ${tr('(sheets Dimensions and Open items). Confirmation cells are blank in the workbook; nothing here resolves them.', '(trang Dimensions và Open items). Các ô xác nhận để trống trong bảng tính; nội dung ở đây không giải quyết chúng.')}</p></section>`;
  }

  // ---- Panel events ----
  function onPanelClick(event) {
    const t = event.target.closest('button');
    if (!t) return;
    const d = t.dataset;
    if (d.tab) { view.tab = d.tab; render(); return; }
    if (d.lang) { setLang(d.lang); return; }
    if (d.tool) { setTool(d.tool); return; }
    if (d.siteView) { siteView(d.siteView); return; }
    if (d.axis) { selectAxis(view.axis === d.axis ? null : d.axis); return; }
    if (d.section) { selectAxis(d.section); view.plan = null; setCut('section', { axis: d.section }); siteView(d.section in LONG() ? 'front' : 'right'); return; }
    if (d.level) { const m = Number(d.level); selectLevel(view.level === m ? null : m); return; }
    if (d.layer && d.style) { setLayer(d.layer, d.style); return; }
    if (d.isolate) { isolate(d.isolate); return; }
    if (d.phaseShow) { setPhase(Number(d.phaseShow)); return; }
    if (d.gate) { const issue = DATA.issues.find(i => i.id === d.gate); if (issue) { view.tab = 'check'; render(); $('issue-' + d.gate)?.scrollIntoView({ block: 'center' }); $('issue-' + d.gate)?.classList.add('flash'); } else toast(`${d.gate}: ${tr(DATA.phases.engineering[d.gate], (DATA.phases.engineering_vi || {})[d.gate] || DATA.phases.engineering[d.gate])} (${tr('see', 'xem')} ${DATA.phases.sources.engineering})`); return; }
    if (d.record) { const r = DATA.dimensions.find(x => x.id === d.record); if (r) showRecord(r); return; }
    if (d.filter) { view.filter = d.filter; render(); return; }
    switch (d.site) {
      case 'close': setOpen(false); break;
      case 'clear': clearMeasures(); clearSelection(); selectAxis(null); selectLevel(null); break;
      case 'deselect': clearSelection(); break;
      case 'plan-cut': setCut('plan', d.h === 'off' ? null : Number(d.h)); break;
      case 'flip-section': if (view.section) { setCut('section', { axis: view.section.axis, flip: !view.section.flip }); siteView(view.section.axis in LONG() ? (view.section.flip ? 'rear' : 'front') : (view.section.flip ? 'left' : 'right')); } break;
      case 'section-off': setCut('section', null); break;
      case 'layers-all': setLayer('all', 'show'); break;
      case 'layers-structure': for (const l of LAYERS) view.styles[l.id] = ['plinth', 'floors', 'columns', 'walls', 'frame'].includes(l.id) ? 'show' : l.special ? 'hide' : 'ghost'; view.phase = 0; applyLayers(); render(); redraw(); break;
      case 'layers-shell': for (const l of LAYERS) view.styles[l.id] = ['ornament', 'finishes', 'furniture', 'site', 'equipment', 'routes', 'sanctuary'].includes(l.id) ? 'hide' : 'show'; view.phase = 0; applyLayers(); render(); redraw(); break;
      case 'isolate-layer': isolate(d.layer); break;
      case 'ghost-layer': setLayer(d.layer, 'ghost'); clearSelection(); break;
      case 'play': if (view.playing) { stopPlay(); render(); } else play(); break;
      case 'export-json': download('thach-bi-site-record.json', JSON.stringify({ ...record, exportedAt: new Date().toISOString(), note: 'Site record from the Thạch Bi viewer. Not an approval.' }, null, 2), 'application/json'); break;
      case 'export-csv': download('thach-bi-site-checks.csv', checksCsv(), 'text/csv'); break;
    }
  }
  function onPanelInput(event) {
    const t = event.target;
    if (t.matches('[data-query]')) { view.query = t.value; const pos = t.selectionStart; render(); const s = document.querySelector('#siteBody [data-query]'); s?.focus(); s?.setSelectionRange(pos, pos); }
    else if (t.matches('[data-cut="plan"]')) { const v = Number(t.value); setCut('plan', v >= 37.95 ? null : v); }
    else if (t.matches('[data-phase-range]')) { stopPlay(); setPhase(Number(t.value)); }
  }
  function onPanelChange(event) {
    const t = event.target;
    if (t.matches('[data-grid]')) { view.grid[t.dataset.grid] = t.checked; applyGrid(); }
    else if (t.matches('[data-future]')) setPhase(view.phase, t.value);
    else if (t.matches('[data-status]') && !VISIT) { record.phases[t.dataset.status] = { status: t.value, date: new Date().toISOString().slice(0, 10) }; saveRecord(); render(); }
    else if (t.matches('[data-measured]') && !VISIT) { const v = t.value === '' ? null : Number(t.value); const c = record.checks[t.dataset.measured] ||= {}; c.measuredMm = Number.isFinite(v) ? v : null; if (c.measuredMm === null && !c.date) delete record.checks[t.dataset.measured]; saveRecord(); render(); }
    else if (t.matches('[data-date]') && !VISIT) { const c = record.checks[t.dataset.date] ||= {}; c.date = t.value || null; saveRecord(); render(); }
    else if (t.matches('[data-tolerance]') && !VISIT) { const v = t.value === '' ? null : Number(t.value); record.toleranceMm = Number.isFinite(v) && v >= 0 ? v : null; saveRecord(); render(); }
    else if (t.matches('[data-import]') && !VISIT && t.files?.[0]) {
      t.files[0].text().then(text => {
        const r = JSON.parse(text);
        if (r?.version !== 1 || typeof r.phases !== 'object' || typeof r.checks !== 'object') throw new Error(tr('not a site record', 'không phải hồ sơ công trường'));
        record = { version: 1, phases: r.phases, checks: r.checks, toleranceMm: Number.isFinite(r.toleranceMm) ? r.toleranceMm : null };
        saveRecord(); render(); toast(tr('Site record imported.', 'Đã nhập hồ sơ công trường.'));
      }).catch(e => toast(tr('Could not import: ', 'Không nhập được: ') + e.message));
    }
  }
  function checksCsv() {
    const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lines = [['id', 'part', 'parameter', 'axes', 'drawing_mm', 'basis', 'sheet', 'measured_mm', 'difference_mm', 'tolerance_mm', 'date'].join(',')];
    for (const r of DATA.dimensions) {
      const c = record.checks[r.id]; if (!c) continue;
      const diff = Number.isFinite(c.measuredMm) && Number.isFinite(r.mm) ? c.measuredMm - r.mm : '';
      lines.push([r.id, r.part.split('\n').pop(), r.parameter, r.axes.split('\n').pop(), r.mm, r.basis, r.sheet.replace(/\n/g, ' '), c.measuredMm, diff, record.toleranceMm ?? '', c.date].map(q).join(','));
    }
    for (const p of PHASES) lines.push(['phase:' + p.id, p.en, 'status', '', '', '', '', phaseStatus(p.id), '', '', record.phases[p.id]?.date].map(q).join(','));
    return lines.join('\n') + '\n';
  }
  function download(name, text, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function toast(text) {
    const t = $('toast'); if (!t) return;
    t.textContent = text; t.classList.add('visible');
    clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('visible'), 4200);
  }
})();
