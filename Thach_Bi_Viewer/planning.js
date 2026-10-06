/* Two wide seating blocks or four short-bench blocks. Columns stay on source grids. */
(() => {
  'use strict';
  let context, mode = 4;
  const groups = {}, display = {};
  window.CHURCH_PLANNING = { prepare, bindBatches, setLayout, state };

  function prepare(ctx) {
    context = ctx;
    const { THREE, building, interior, data } = ctx;
    const shortPews = interior.group.getObjectByName('Proposed pews and kneelers — clear aisles');
    groups[4] = shortPews;
    building.add(shortPews);
    shortPews.userData = {seatingOption:4,active:true,status:'CONCEPT FURNITURE'};
    for (const pew of shortPews.children) {
      pew.userData.seatingLayout = 4;
      pew.userData.seatingBlock = Math.abs(pew.position.z)>4 ? 'outer' : 'central';
    }
    for (const collider of interior.colliders) if (collider.kind === 'pew') {
      collider.seatingLayout = 4;
      collider.active = true;
    }
    const longPews = groups[2] = new THREE.Group();
    longPews.name = 'Two wide seating blocks — long benches';
    longPews.userData = {seatingOption:2,active:false,status:'CONCEPT FURNITURE'};
    building.add(longPews);
    // Long benches cross D/E. Rows fit between bases and avoid doorway cross aisles.
    const rowXs = [8.75];
    const columnXs = ['3','4','5','6','7','8','9','10','11'].map(key=>data.longitudinal[key]);
    for (const axis of ['3','4','5','6','7']) for (const offset of [1,2.13,3.26]) {
      rowXs.push(Number((data.longitudinal[axis]+offset).toFixed(3)));
    }
    let rowIndex = 0;
    for (const x of rowXs) {
      if ([16.725,34.725].some(door=>x+.65>door-1.2 && x-.35<door+1.2)) continue;
      if (columnXs.some(col=>x+.615>col-.41-.19 && x-.35<col+.41+.19)) continue;
      for (const side of [-1,1]) {
        const pew = interior.createPew(x,side*3.625,4.65,rowIndex,side<0?'long B':'long H');
        pew.userData.seatingLayout = 2;
        pew.userData.seatingBlock = 'long';
        longPews.add(pew);
        const collider = interior.colliders[interior.colliders.length-1];
        collider.seatingLayout = 2;
        collider.active = false;
      }
      rowIndex++;
    }
    // Two additional complete rows in each requested drawing bay, in both layouts.
    // Door-bay rows flank a 1.20 m crossing; do not silently fill the door route.
    const additions = [
      {bay:'2–3',xs:[6.49,7.62]},
      {bay:'4–5',xs:[15.61,17.79]},
      {bay:'8–9',xs:[33.61,35.79]}
    ];
    const crossAisles = ['4','8'].map(axis=>({bay:axis==='4'?'4–5':'8–9',minX:data.longitudinal[axis]+1.75,maxX:data.longitudinal[axis]+2.95,widthM:1.2}));
    for (const layout of [2,4]) {
      let index = new Set(groups[layout].children.map(pew=>pew.position.x)).size;
      for (const addition of additions) for (const x of addition.xs) {
        for (const side of [-1,1]) {
          const blocks = layout===2 ? [[3.625,4.65,'long']] : [[2.15,1.86,'central'],[5.985,1.73,'outer']];
          for (const [z,length,block] of blocks) {
            const pew = interior.createPew(x,side*z,length,index,`${block} ${side<0?'B':'H'}, added bay ${addition.bay}`);
            Object.assign(pew.userData,{seatingLayout:layout,seatingBlock:block,addedRowBay:addition.bay});
            groups[layout].add(pew);
            Object.assign(interior.colliders[interior.colliders.length-1],{seatingLayout:layout,active:layout===mode});
          }
        }
        index++;
      }
    }
    interior.setSeatingLayout = setLayout;
    interior.seatingState = state;
    data.seatingStudy = {status:'Concept layouts; not approved occupancy',layouts:[2,4],selected:4,longBenchLengthM:4.65,longBenchCentreZ:3.625,additions,crossAisles,note:'Two extra rows in each of bays 2–3, 4–5 and 8–9 for both layouts. Proposed door-bay crossings are 1.20 m. Kneeler clearance requires a mock-up.'};
    setLayout(4);
  }
  function bindBatches(batches) {
    for (const layout of [2,4]) display[layout] = batches.get(groups[layout]);
    setLayout(mode);
  }
  function state() {
    const pews = groups[mode].children;
    return {blocks:mode,pewRows:new Set(pews.map(p=>p.position.x)).size,pewCount:pews.length,benchLengthM:mode===2?4.65:null};
  }
  function setLayout(value) {
    if (![2,4].includes(Number(value))) throw new Error('Choose two or four seating blocks.');
    mode = Number(value);
    for (const layout of [2,4]) {
      groups[layout].visible = layout===mode;
      groups[layout].userData.active = layout===mode;
      if (display[layout]) display[layout].visible = layout===mode;
    }
    for (const collider of context.interior.colliders) if (collider.seatingLayout) collider.active = collider.seatingLayout===mode;
    context.data.seatingStudy.selected = mode;
    context.interior.stats.activePewCount = state().pewCount;
    context.interior.stats.activePewRows = state().pewRows;
    document.getElementById('mapShortPews')?.setAttribute('display',mode===4?'inline':'none');
    document.getElementById('mapLongPews')?.setAttribute('display',mode===2?'inline':'none');
    context.renderer.shadowMap.needsUpdate = true;
    for (const blocks of [2,4]) {
      const button = document.getElementById(`seating${blocks}`);
      button?.setAttribute('aria-pressed',String(mode===blocks));
      button?.classList.toggle('active',mode===blocks);
    }
    const caption = document.getElementById('seatingSummary');
    if(caption) caption.textContent = `${state().pewCount} benches · ${mode===2?'4.65 m long':'1.73–1.86 m long'} · ${state().pewRows} rows · concept`;
    window.CHURCH_SIMULATOR?.refreshSeating();
    return state();
  }
})();
