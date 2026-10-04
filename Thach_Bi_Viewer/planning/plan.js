(() => {
  'use strict';
  const data = window.CHURCH_PLAN_DATA;
  const $ = id => document.getElementById(id);
  const ns = 'http://www.w3.org/2000/svg';
  const scale = 14, px = x => 230 + x * scale, py = z => 280 - z * scale;
  let blocks = 4, layer = 'sight', target = 'altar';
  let selected = data.seats.find(s => s.block === 'outer' && s.blocked.altar);
  const names = {altar:'altar centre', ambo:'ambo speaker', crucifix:'crucifix'};
  const layers = {
    sight: {title:'Longer benches still need a sightline check',description:'Two wide blocks use long benches between column bays. Four blocks use short benches. Both layouts contain seats whose views cross a structural column row.',details:['Columns remain on the source grid. Their current diameters are illustrative.','Green: no column hit for this one target point. Red: structural obstruction.','A clear ray does not mean the whole sanctuary is visible.'],legend:[['#3f775b','No column hit'],['#ba5745','Column hit'],['#665c49','Main columns']]},
    light: {title:'Light each task separately',description:'Use measured fixture photometry and independent control zones. These coloured areas are zone boundaries, not predicted light coverage.',details:['L1 central / L2 outer seating: reading light.','L3 sanctuary: task surfaces and faces. L4: circulation.','L5: entrance and stairs. L6 façade accents are separately timed; emergency lighting has its own design.'],legend:[['#a7c8ae','L1 central'],['#a2bcc9','L2 outer'],['#dab977','L3 sanctuary'],['#d6c7b1','L4 / L5 routes']]},
    sound: {title:'Clear speech in every occupied block',description:'Study directional sanctuary sources and individually delayed fills. Symbols identify candidate study areas, not specified products or guaranteed coverage.',details:['Measure reverberation and background noise with fans operating.','Aim toward people and away from reflective roof surfaces and microphones.','Proposed commissioning brief: STI ≥0.60 at the agreed seat grid, checked point by point.'],legend:[['#587898','Main source study'],['#91a6b5','Optional fill study']]},
    air: {title:'Fans cool people. Ventilation renews air.',description:'No air conditioning. Coordinate roof heat gain, outdoor-air openings and quiet local air movement. Arrows show a study path, not a measured wind direction.',details:['F1–F6 are trial zones, not six specified fan locations or air-speed contours.','Confirm usable window/door free area, rainy-day operation and high-level discharge.','Trial occupied-seat air speeds, noise and comfort together; reserve mechanical exhaust if natural flow is insufficient.'],legend:[['#73a79c','Fan trial zone'],['#387f83','Outdoor-air study path']]},
    power: {title:'Meter the loads before optimizing them',description:'Main metering plus separate lighting, fan/ventilation, AV and other-load channels feed a local dashboard.',details:['M0: main meter. M1/M2: inside/outside lights. M3: fans and ventilation. M4: AV. M5: other loads.','Controller, panel and cable routing locations need an electrical design.','Sensors: occupied-zone temperature, RH and CO₂; separate light/presence sensors. No live devices are connected.'],legend:[['#a77444','Meter/control study'],['#7a8e56','Environmental sensor study']]}
  };
  function node(tag, attrs = {}, text = '', parent = $('plan')) {
    const el = document.createElementNS(ns,tag);
    for (const [key,value] of Object.entries(attrs)) el.setAttribute(key,String(value));
    if (text) el.textContent = text;
    parent.append(el);return el;
  }
  function rect(x,z,w,d,fill,stroke='#c9d0c4',extra={}) {return node('rect',{x:px(x),y:py(z+d),width:w*scale,height:d*scale,fill,stroke,'stroke-width':1,...extra});}
  function line(x,z,xx,zz,color='#c9d0c4',extra={}){return node('line',{x1:px(x),y1:py(z),x2:px(xx),y2:py(zz),stroke:color,'stroke-width':1,...extra});}
  function label(x,z,text,extra={}){return node('text',{x:px(x),y:py(z),fill:'#536659','font-size':10,'text-anchor':'middle',...extra},text);}
  function zone(x,z,w,d,text,fill){rect(x,z,w,d,fill,'none',{opacity:.5});label(x+w/2,z+d/2,text,{'font-size':10,'font-weight':650});}
  function marker(x,z,text,color){node('circle',{cx:px(x),cy:py(z),r:10,fill:color,stroke:'#fff','stroke-width':2});label(x,z-.24,text,{'font-size':8,fill:'white','font-weight':700});}
  function render() {
    const plan = $('plan');plan.replaceChildren();
    const defs=node('defs');const arrow=node('marker',{id:'arrow',viewBox:'0 0 10 10',refX:8,refY:5,markerWidth:5,markerHeight:5,orient:'auto-start-reverse'},'',defs);node('path',{d:'M0 0L10 5L0 10Z',fill:'#387f83'},'',arrow);
    // Source grid, envelope and floor projections. Small profiles are omitted.
    rect(-13.219,-13.627,15.664,27.254,'#eee9da');
    rect(-13.219,-10.4,5.12,20.8,'#e1d9c7');
    for(let i=1;i<16;i++)line(-13.219+i*.32,-10.4,-13.219+i*.32,10.4,'#c8bcaa');
    rect(5.475,-10.414,47.541,20.828,'#eeeede','#a2afa0',{'stroke-width':2});
    for(const side of [-1,1])rect(36.975,side>0?7.36:-13.249,7.2,5.889,'#e3e9dc','#849b80',{'stroke-width':2});
    for(const part of data.sideAccess || [])rect(part.x,part.z,part.width,part.depth,part.kind==='landing'?'#e9e5d6':'#ece8db','#b7bba9',{'stroke-width':.6});
    rect(2.445,-7.36,50.571,14.72,'#faf9f0','#a2afa0',{'stroke-width':2});
    for(const side of [-1,1])rect(0,side>0?7.36:-13.249,4.9,5.889,'#dddcca','#87957f',{'stroke-width':2});
    rect(39.75,-3.6,8.925,7.2,'#e9dfc9','#b9aa89');
    for(const [axis,x] of Object.entries(data.axes)) {
      if(axis==='2′')continue;
      line(x,-14.8,x,15.1,'#adb8a6',{'stroke-dasharray':'3 5',opacity:.45});
      label(x,16.2,axis,{fill:['9','10'].includes(axis)?'#99642e':'#6d7b6e','font-size':11,'font-weight':700});
    }
    label(-6,-.5,'EAST',{'font-size':10,'font-weight':700});label(-6,-1.65,'ENTRANCE',{'font-size':8});
    label(49.9,-.5,'WEST',{'font-size':9});
    label(40.575,14.1,'WIDER 9–10',{'font-size':9,fill:'#8d652f','font-weight':700});
    label(23,9,'SIDE H VERANDA',{'font-size':8});label(23,-9.6,'SIDE B VERANDA',{'font-size':8});
    label(22,17.9,'Numbered drawing axes · metres in model',{'font-size':8,fill:'#879480'});
    label(22,-.22,'CENTRE AISLE',{'font-size':8,fill:'#a7ad9b'});
    for(const doorX of [16.725,34.725,46.425])for(const side of [-1,1]) {
      line(doorX-1.1,side*10.414,doorX+1.1,side*10.414,'#527358',{'stroke-width':5});
      label(doorX,side>0?11.3:-12,'DOOR',{'font-size':7});
    }
    if(layer==='light') {
      for(const sign of [-1,1]){
        zone(7.8,sign>0?1.2:-3.1,25.8,1.9,'L1','#a7c8ae');
        zone(7.8,sign>0?5.1:-6.9,25.8,1.8,'L2','#a2bcc9');
        zone(6,sign>0?7.4:-10.4,29.8,3,'L4','#d6c7b1');
      }
      zone(39.75,-3.6,8.925,7.2,'L3','#dab977');zone(-8,-7,10,14,'L5','#d6c7b1');
      for(const x of [16.725,34.725,46.425])for(const sign of [-1,1])zone(x-1.25,sign>0?10.42:-13.2,2.5,2.78,'L5','#d6c7b1');
    }
    const pews=data.pews.filter(p=>p.layout===blocks);
    for(const aisle of data.seatingStudy.crossAisles){
      rect(aisle.minX,-7.25,aisle.widthM,14.5,'#e5ece0','#91a68e',{'stroke-dasharray':'3 3',opacity:.7});
      label((aisle.minX+aisle.maxX)/2,-.15,'1.20 m',{'font-size':7,fill:'#536659'});
    }
    for(const p of pews){
      const bench=rect(p.x-.35,p.z-p.length/2,.965,p.length,layer==='sight'?'#d3c3a3':'#dcd6c4',p.addedRowBay?'#a77444':'none',{rx:1,opacity:layer==='sight'?.85:.55,'data-added-bay':p.addedRowBay||'','stroke-width':p.addedRowBay?1.5:0});
      if(p.addedRowBay)node('title',{},`Added row in bay ${p.addedRowBay}`,bench);
    }
    for(const col of data.columns){rect(col.x-.41,col.z-.41,.82,.82,'#b7ae9b','#7b715d');node('circle',{cx:px(col.x),cy:py(col.z),r:.32*scale,fill:'#665c49'});}
    rect(43.675,-1.525,1.13,3.05,'#cbb17f','#aa905f');label(44.24,2.1,'ALTAR',{'font-size':8});
    rect(42.18,-3.02,.8,.8,'#b8a37e');
    if(layer==='sight') {
      const visible=data.seats.filter(s=>s.layout===blocks);
      if(!visible.some(s=>s.id===selected.id))selected=visible[Math.floor(visible.length/2)];
      const destination=data.targets[target];
      line(selected.x,selected.z,destination[0],destination[2],selected.blocked[target]?'#b85040':'#315f4d',{'stroke-width':2,'stroke-dasharray':selected.blocked[target]?'6 4':'none'});
      for(const seat of visible){
        const blocked=seat.blocked[target];
        const circle=node('circle',{cx:px(seat.x),cy:py(seat.z),r:3.5,fill:blocked?'#ba5745':'#3f775b',class:'seat',tabindex:0,role:'button','aria-label':`Seat ${seat.id}, ${seat.block} block, ${blocked?'blocked':'no column hit'} to ${names[target]}`});
        node('title',{},`Seat ${seat.id} · ${seat.block} block · ${blocked?'structurally blocked':'no column hit'} to ${names[target]}` ,circle);
        const choose=()=>{selected=seat;render();};circle.addEventListener('click',choose);circle.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();const focused=plan.querySelector(`[aria-label^="Seat ${seat.id},"]`);focused?.focus();}});
      }
      node('circle',{cx:px(selected.x),cy:py(selected.z),r:6.5,fill:'none',stroke:'#162d24','stroke-width':2,'pointer-events':'none'});
      marker(destination[0],destination[2],'T','#315f4d');
    }
    if(layer==='sound') {
      for(const sign of [-1,1]){
        line(36.5,sign*3.1,22,sign*2.1,'#587898',{'stroke-dasharray':'6 4','stroke-width':2});marker(36.5,sign*3.1,'S','#587898');
        line(24,sign*6.2,12,sign*6.2,'#91a6b5',{'stroke-dasharray':'3 4','stroke-width':2});marker(24,sign*6.2,'F','#91a6b5');
      }
      label(17,-14.8,'S = main-source study · F = optional delayed-fill study',{'font-size':10});
    }
    if(layer==='air') {
      let index=0;
      for(const x of [12.2,23.5,32.4])for(const sign of [-1,1]){
        node('ellipse',{cx:px(x),cy:py(sign*4),rx:42,ry:30,fill:'#73a79c',opacity:.25,stroke:'#488b7b','stroke-dasharray':'5 4'});
        label(x,sign*4-.15,`F${++index}`,{'font-size':10,fill:'#285e54','font-weight':700});
      }
      for(const x of [18,29])line(x,-12.6,x,12.6,'#387f83',{'stroke-width':2,'stroke-dasharray':'5 4','marker-start':'url(#arrow)','marker-end':'url(#arrow)'});
      label(45,7.9,'HIGH-LEVEL OUTLET STUDY',{'font-size':7});
    }
    if(layer==='power') {
      marker(50,6,'M','#a77444');label(48,8,'PANEL LOCATION TBD',{'font-size':8});
      for(const x of [11,24,34])for(const sign of [-1,1]){
        line(50,6,x,sign*6.8,'#b5a58b',{'stroke-dasharray':'3 5'});marker(x,sign*6.8,'Q','#7a8e56');
      }
      label(20,-14.8,'Q = occupied-zone sensor study · M = metering/control provision',{'font-size':10});
    }
    line(0,-17,10,-17,'#51624e',{'stroke-width':2});line(0,-16.75,0,-17.25,'#51624e');line(10,-16.75,10,-17.25,'#51624e');label(5,-18,'10 m',{'font-size':9});
    label(44,-18,'Diagram orientation: entrance east → sanctuary west',{'font-size':8});
    const seats=data.seats.filter(s=>s.layout===blocks);
    $('layoutDescription').textContent=blocks===2
      ? `2 wide blocks · 4.65 m long benches · ${data.sightlineSummary[2].pewRows} rows with breaks around columns · centre aisle ≥2.40 m, outer aisles ≥1.20 m in this model`
      : `4 blocks · 1.73–1.86 m short benches · ${data.sightlineSummary[4].pewRows} rows · centre aisle and routes between blocks; outer wall gaps are not circulation aisles`;
    $('benchCount').textContent=pews.length;$('seatCount').textContent=seats.length;$('blockedCount').textContent=seats.filter(s=>s.blocked[target]).length;$('blockedLabel').textContent=`${names[target]} obstructions`;
    for(const n of [2,4])$(n===2?'two':'four').setAttribute('aria-pressed',String(blocks===n));
    for(const button of document.querySelectorAll('[data-layer]'))button.setAttribute('aria-pressed',String(button.dataset.layer===layer));
    $('target').disabled=layer!=='sight';
    const info=layers[layer];$('layerTitle').textContent=info.title;$('layerDescription').textContent=info.description;$('layerNumber').textContent=layer==='sight'?'SIGHTLINE STUDY':'PROPOSED SYSTEM ZONES';
    $('layerDetails').replaceChildren();const ul=document.createElement('ul');info.details.forEach(text=>{const li=document.createElement('li');li.textContent=text;ul.append(li);});$('layerDetails').append(ul);
    $('legend').replaceChildren();info.legend.forEach(([color,text])=>{const span=document.createElement('span'),dot=document.createElement('i');dot.style.background=color;span.append(dot,document.createTextNode(text));$('legend').append(span);});
    $('selection').replaceChildren();
    if(layer==='sight'){
      const strong=document.createElement('strong');strong.textContent=`Seat ${selected.id} · ${selected.block} block`;
      const status=document.createElement('p');status.textContent=`${selected.blocked[target]?'Structural obstruction':'No column hit'} to the ${names[target]} point.`;if(selected.blocked[target])status.className='blocked';
      const note=document.createElement('p');note.textContent=`Model position x ${selected.x.toFixed(2)} m / z ${selected.z.toFixed(2)} m. Eye height 1.15 m.`;$('selection').append(strong,status,note);
    }else $('selection').textContent='Use the full plan for design targets, research sources, coordination checks and acceptance gates.';
  }
  $('two').addEventListener('click',()=>{blocks=2;render();});$('four').addEventListener('click',()=>{blocks=4;render();});
  $('target').addEventListener('change',e=>{target=e.target.value;render();});
  document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{layer=button.dataset.layer;render();}));
  const loads=[['Interior reading / routes','L1 / L2 / L4',900,120],['Sanctuary','L3',300,80],['Exterior lighting','L5 / L6',400,150],['Circulation fans','FAN',800,120],['Ventilation allowance','VENT · need to confirm',300,80],['Sound system','AV',350,80],['Controls / standby','CTRL',40,720]];
  const fields=[];
  for(const [name,id,watts,hours] of loads){
    const tr=document.createElement('tr'),nameCell=document.createElement('td');nameCell.textContent=name;const small=document.createElement('small');small.textContent=id;nameCell.append(small);tr.append(nameCell);const inputs=[];
    for(const [label,value,max] of [['active watts',watts,100000],['hours per month',hours,744]]){
      const td=document.createElement('td'),input=document.createElement('input');input.type='number';input.min=0;input.max=max;input.step=1;input.value=value;input.setAttribute('aria-label',`${name} ${label}`);input.addEventListener('input',energy);td.append(input);tr.append(td);inputs.push(input);
    }
    const output=document.createElement('td');tr.append(output);$('loads').append(tr);fields.push({name,id,watts:inputs[0],hours:inputs[1],output});
  }
  const validValue=input=>Math.min(Number(input.max)||Infinity,Math.max(0,Number(input.value)||0));
  function energy(){let total=0,operating=0;for(const row of fields){const w=validValue(row.watts),h=validValue(row.hours),kwh=w*h/1000;row.output.textContent=kwh.toFixed(1);total+=kwh;operating+=w;}
    $('totalEnergy').textContent=total.toFixed(1);const tariff=Number($('tariff').value);$('cost').textContent=$('tariff').value!==''&&tariff>=0?`${Math.round(total*tariff).toLocaleString('en-US')} VND / month, energy only`:'Cost awaits the actual tariff.';
    $('operatingPower').textContent=`Sum of entered operating loads: ${(operating/1000).toFixed(2)} kW. This is not measured peak demand or a supply-sizing calculation.`;
  }
  $('tariff').addEventListener('input',energy);
  $('download').addEventListener('click',()=>{
    const rows=[['CONCEPT WORKSHEET — replace example inputs with measured data'],['System','Zone','Average active W','Hours per month','kWh per month'],...fields.map(f=>[f.name,f.id,validValue(f.watts),validValue(f.hours),(validValue(f.watts)*validValue(f.hours)/1000).toFixed(3)])];
    const csv=rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='thach-bi-energy-worksheet.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  render();energy();
})();
