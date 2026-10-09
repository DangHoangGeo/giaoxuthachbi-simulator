/* Read-only installation planning sequence. No switching, layout edits or approval state. */
(function () {
  'use strict';
  const SIM = window.CHURCH_SIMULATOR;
  const steps = [
    {id:'survey', title:'01 · Survey and coordinate', system:'all', mode:'building', task:'Check grid, floor datum, equipment positions and all concealed routes against the measured building. Use the circuit sheets to record corrections.', hold:'Survey and coordinated light, sound, air, access and concealment review must precede physical setting-out. This default layout still has unmet targets.'},
    {id:'distribution', title:'02 · Boards and feeder paths', system:'distribution', mode:'systems', task:'Review DB-1 to DB-2, LC-1, FC-1 and AV-1 paths. Confirm enclosure access and the proposed supply/control separation.', hold:'Electrical designer: supply, phases, earthing, fault level, protection, cable sizes, board capacity and final single-line diagram are pending. Do not energize from this model.'},
    {id:'containment', title:'03 · Coordinate concealed containment', system:'all', mode:'systems', task:'Review all shared corridors and individual branches together. Select each run for its vertices and height; compare with structure and finished surfaces before closing any cover.', hold:'Containment size, power/signal separation, fixings, fire stopping, access panels and penetrations require coordinated approval. Coloured routes are enlarged display lines, not cable diameters.'},
    {id:'lighting', title:'04 · Lighting routes and fittings', system:'lighting', mode:'systems', task:'Review each light circuit and its LC-1 or DB-2 supply. Check chandelier support, aim, driver access, fan-blade interaction and labels against the matching paper sheet.', hold:'Selected-product photometry, support design, control channels, dimming compatibility and installation details remain pending. Review current per-seat lighting failures in the matching calculation report.'},
    {id:'sound', title:'05 · Sound and microphone connections', system:'sound', mode:'systems', task:'Trace speaker and microphone lines to AV-1 separately from rack mains. Review polarity, intended zones, furniture/floor interfaces and service access.', hold:'Amplifier topology, impedance/line voltage, connectors, shielding and separation are pending. Passive speaker ratings are not mains loads; feedback and wing clarity targets remain unmet.'},
    {id:'air', title:'06 · Fans and ventilation', system:'air', mode:'systems', task:'Review FC-1 and DB-2 routes, motor control compatibility and air paths with the lighting and sound systems. Keep the central processional view clear of visible fans and supports.', hold:'Current geometry is a study, not an accepted fan installation. Mounting, guards/clearance, duty points, make-up air, noise, concealment and maintenance access need specialist approval.'},
    {id:'exit', title:'07 · Exit signs and required safety functions', system:'exit', mode:'systems', task:'Identify E1 separately from discretionary light scenes. Coordinate the required emergency system, operating labels and test access with the responsible designer.', hold:'Emergency supply, duration, coverage and failure behavior are not established by the simulator. No scene or walkthrough step authorizes isolation of required safety functions.'},
    {id:'decoration', title:'08 · Powered decoration and interfaces', system:'decoration', mode:'systems', task:'Review decorative loads and concealed feeds, heat dissipation, isolation and replacement access without obstructing worship or other systems.', hold:'Final products, loads, supports, material/fire compatibility and control interfaces need approval. Empty stages may occur in edited layouts.'},
    {id:'commission', title:'09 · Inspect, test and hand over', system:'all', mode:'building', task:'After approved installation, the responsible team must record electrical verification, manual/scene and failure tests, light/sound/air measurements, as-built IDs and maintenance instructions.', hold:'No commissioning or construction approval is recorded here. Progress through these review steps does not release a hold or mark any work installed.'}
  ].map(s=>Object.freeze(s));
  let index = -1, saved = null;
  const esc = s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function go(n) {
    if (!Number.isInteger(n) || n < 0 || n >= steps.length) return false;
    const E=SIM.electrical;
    if (!saved) saved={...E.view};
    index=n;
    E.setReviewFilter({system:steps[n].system,board:'all',circuit:'all',item:'all'});
    E.view.selected=null; E.view.visible=true;
    E.setMode(steps[n].mode); E.focusReview(); SIM.emit('electrical');
    return true;
  }
  function stop() {
    if (!saved) return false;
    const E=SIM.electrical, prior=saved; saved=null; index=-1;
    Object.assign(E.view,prior); E.setMode(prior.mode); SIM.emit('electrical'); return true;
  }
  function render() {
    const s=steps[index];
    return `<div class="sim-card installation-review"><span class="sim-eyebrow">Installation planning · read-only</span><h3>Step-by-step 3D review</h3><p class="sim-hint">Proposed coordination sequence. Not instructions authorizing construction. Steps change the view only.</p>${s ? `<p class="sim-hint">Review step ${index+1} of ${steps.length}</p><h3>${esc(s.title)}</h3><p>${esc(s.task)}</p><p class="electrical-hold">HOLD · ${esc(s.hold)}</p><div class="electrical-actions"><button data-act="electrical-step" data-step="${index-1}" ${index===0?'disabled':''}>Previous</button><button data-act="electrical-step" data-step="${index}">Reset stage view</button><button data-act="electrical-step" data-step="${index+1}" ${index===steps.length-1?'disabled':''}>Next review step</button><button data-act="electrical-step-stop">End walkthrough</button></div>` : '<button class="sim-primary" data-act="electrical-step" data-step="0">Start 3D walkthrough</button>'}<p class="sim-hint">Paper sheets: run <code>python3 scripts/build_review_drawings.py</code> from the project folder. The PDF represents the default model; saved browser layouts are separate.</p></div>`;
  }
  SIM.installationReview={steps:Object.freeze(steps),go,stop,render,get index(){return index;}};
})();
