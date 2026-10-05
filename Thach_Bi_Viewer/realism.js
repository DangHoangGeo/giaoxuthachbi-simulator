/* Drawing-led refinement, 2026-10-05. Loaded before bundle.js; lengths in metres.
 * Plans govern grids/levels. Finish, stair tread counts and ornamental profiles
 * remain proposals. Keep this readable layer separate from the legacy bundle.
 */
(() => {
  'use strict';
  const stairs = [];
  let context;
  const doorGroups = {};
  const api = window.CHURCH_REALISM = { prepare, lighting, finish, floorHeight, walkAllowed, bindBatches, update, setOpenings, setGlass };
  let doorBatches, lastMode, openings = 'auto', glassKind = 'clear', lightMode = 'day';
  function bindBatches(batches) {
    doorBatches = {closed:batches.get(doorGroups.closed), open:batches.get(doorGroups.open)};
    // Glass passes daylight: no glazed batch casts a shadow.
    for(const group of batches.values())group.traverse(o=>{if(o.isMesh&&context.artGlass.some(a=>a.m===o.material))o.castShadow=false;});
    update('explore');
    document.getElementById('openingsMode')?.addEventListener('change',event=>setOpenings(event.target.value));
    document.getElementById('glassMode')?.addEventListener('change',event=>setGlass(event.target.value));
    const landscape=[...batches.entries()].find(([group])=>group.name==='Two rows of courtyard trees')?.[1];
    document.getElementById('treesToggle')?.addEventListener('change',event=>{
      landscape.visible=event.target.checked;
      context.renderer.shadowMap.needsUpdate=true;
    });
  }
  // Doors and window shutters: 'auto' opens them while walking.
  function setOpenings(mode) {
    openings = ['open','closed'].includes(mode) ? mode : 'auto';
    const m = lastMode; lastMode = null; update(m || 'explore');
    return openings;
  }
  function update(mode) {
    if (!doorBatches || mode === lastMode) return;
    lastMode = mode;
    const open = openings === 'auto' ? mode === 'walk' : openings === 'open';
    for (const [state,group] of Object.entries(doorBatches)) {
      group.visible = state === (open ? 'open' : 'closed');
      doorGroups[state].userData.active = group.visible;
    }
    context.renderer.shadowMap.needsUpdate = true;
  }
  function floorHeight(x, z) {
    if (x >= -13.219 && x <= 0.99 && Math.abs(z) <= 13.35) {
      if (x < -8.099) return -2.08 + Math.min(16, Math.max(1, Math.floor((x + 13.219) / .32) + 1)) * .1;
      return -.48;
    }
    const height = stairHeight(x, z);
    if (height !== null) return height;
    for (const zone of stairs) {
      if (!zone.direction) continue;
      const bottom = zone.direction > 0 ? zone.minX : zone.maxX;
      if (Math.abs(x - bottom) < .8 && Math.abs(z) > zone.maxZ && Math.abs(z) <= 21) return -2.08;
    }
    return null;
  }
  function walkAllowed(x,z) {
    const az=Math.abs(z);
    // Sanctuary fit-out: service-room walls (door gaps at x 50.65), side benches, furniture.
    if (x >= 48.6 && x <= 53.1 && az >= 3.42 && az <= 3.8 && Math.abs(x - 49.6) > .36) return false;
    if (x >= 49.95 && x <= 53.2 && az > 3.42 && az < 7.6) return false;
    if (x >= 49.2 && x <= 50.1 && Math.abs(az - 5.25) < .75) return false;
    if (x >= 48.7 && x <= 50.1 && az > 7.1 && az < 7.6) return false;
    if (x >= 40.3 && x <= 45.15 && az >= 4.25 && az <= 6.8) return false;
    if (x >= 52.1 && x <= 53.1 && az < 3.1) return false;
    if (x >= 48.7 && x <= 49.8 && z >= 1.0 && z <= 1.8) return false;
    if (x >= -13.219 && x <= -.38 && Math.abs(z) <= 13.05) return true;
    if (stairAllowed(x,z)) return true;
    return null;
  }

  function stairHeight(x, z) {
    for (const zone of stairs) {
      if (x < zone.minX || x > zone.maxX || Math.abs(z) < zone.minZ || Math.abs(z) > zone.maxZ) continue;
      if (!zone.direction) return -0.32;
      const progress = zone.direction > 0 ? x - zone.minX : zone.maxX - x;
      return -2.08 + Math.min(12, Math.max(1, Math.floor(progress / zone.run * 12) + 1)) * (1.76 / 12);
    }
    // Short, level approaches allow access from the existing courtyard route.
    if ([16.725, 34.725, 46.425].some(c => Math.abs(x - c) < 1.05) && Math.abs(z) >= 9.9 && Math.abs(z) <= 11.5) return -0.32;
    return null;
  }

  function stairAllowed(x, z) {
    if ([16.725, 34.725, 46.425].some(c => Math.abs(x - c) < 1.02) && Math.abs(z) >= 9.9 && Math.abs(z) <= 12.95) return true;
    for (const zone of stairs) {
      if (x >= zone.minX && x <= zone.maxX && Math.abs(z) >= zone.minZ + .18 && Math.abs(z) <= zone.maxZ - .18) return true;
      if (zone.direction && Math.abs(z) >= zone.minZ + .18 && Math.abs(z) <= 14.65) {
        const bottom = zone.direction > 0 ? zone.minX : zone.maxX;
        if (Math.abs(x - bottom) < .75) return true;
      }
    }
    return false;
  }

  function prepare(ctx) {
    context = ctx;
    const { THREE: T, building, scene, roofs, structure, plinth, floors, exterior, mat, interior, renderer, data, sun } = ctx;
    const lightGraphics = new URLSearchParams(location.search).get('graphics') === 'light';
    let seed = 4012026;
    const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
    const anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const materialScale = new Map();

    function texture(kind, dataMap = false) {
      const c = document.createElement('canvas');
      c.width = c.height = 512;
      const g = c.getContext('2d');
      if (kind === 'roof') {
        g.fillStyle = dataMap ? '#454545' : '#583024'; g.fillRect(0, 0, 512, 512);
        for (let row = 0; row < 8; row++) for (let col = 0; col < 12; col++) {
          const x = col * 512 / 12, y = row * 64;
          const tone = rand() * 22;
          const grad = g.createLinearGradient(x, 0, x + 42, 0);
          if (dataMap) { grad.addColorStop(0, '#545454'); grad.addColorStop(.42, '#c5c5c5'); grad.addColorStop(1, '#787878'); }
          else { grad.addColorStop(0, `rgb(${112+tone},${49+tone*.6},${29+tone*.35})`); grad.addColorStop(.42, `rgb(${183+tone},${83+tone*.7},${47+tone*.3})`); grad.addColorStop(1, `rgb(${143+tone},${60+tone*.6},${34+tone*.3})`); }
          g.fillStyle = grad; g.fillRect(x + 1.1, y + 2, 40.7, 60);
          g.fillStyle = dataMap ? '#e5e5e5' : 'rgba(240,161,96,.35)'; g.fillRect(x+2,y+59,39,2);
          g.fillStyle = dataMap ? '#333' : 'rgba(54,23,13,.45)'; g.fillRect(x,y+62,43,2);
        }
      } else if (kind === 'ashlar') {
        // Periodic jittered cells make irregular rubble with recessed mortar.
        g.fillStyle = dataMap ? '#444' : '#696a61'; g.fillRect(0,0,512,512);
        const points=[];
        for(let row=0;row<7;row++)for(let col=0;col<7;col++)points.push({x:(col+.15+rand()*.7)*512/7,y:(row+.15+rand()*.7)*512/7,tone:rand()});
        const sites=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)for(const p of points)sites.push({...p,x:p.x+dx*512,y:p.y+dy*512});
        for(const p of sites) {
          if(p.x < -100 || p.x > 612 || p.y < -100 || p.y > 612)continue;
          let poly=[[-160,-160],[672,-160],[672,672],[-160,672]];
          for(const q of sites) {
            if(q===p||Math.hypot(q.x-p.x,q.y-p.y)>190)continue;
            const nx=q.x-p.x,ny=q.y-p.y,c=(q.x*q.x+q.y*q.y-p.x*p.x-p.y*p.y)/2;
            const out=[];
            for(let i=0;i<poly.length;i++) {
              const a=poly[i],b=poly[(i+1)%poly.length],da=a[0]*nx+a[1]*ny-c,db=b[0]*nx+b[1]*ny-c;
              if(da<=0)out.push(a);
              if((da<=0)!==(db<=0)){const t=da/(da-db);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
            }
            poly=out;if(!poly.length)break;
          }
          if(!poly.length)continue;
          const v=115+p.tone*54,warm=p.tone>.72;
          g.beginPath();poly.forEach((v,i)=>{const x=p.x+(v[0]-p.x)*.93,y=p.y+(v[1]-p.y)*.93;i?g.lineTo(x,y):g.moveTo(x,y);});g.closePath();
          g.fillStyle=dataMap?'#bbb':`rgb(${v*(warm?1.13:.94)},${v},${v*(warm?.83:1.02)})`;g.fill();
          g.strokeStyle=dataMap?'#999':'rgba(224,223,204,.35)';g.lineWidth=2;g.stroke();
        }
      } else if (kind === 'wood') {
        g.fillStyle=dataMap?'#888':'#806143';g.fillRect(0,0,512,512);
        for(let i=0;i<650;i++) {
          const x=rand()*512, shade=rand();
          g.strokeStyle=dataMap?`rgba(${shade>.5?'230,230,230':'20,20,20'},.16)`:`rgba(${shade>.5?'242,191,118':'46,18,6'},${.07+rand()*.18})`;
          g.lineWidth=.25+rand()*2;g.beginPath();g.moveTo(x,0);
          g.bezierCurveTo(x+Math.sin(i)*9,160,x+Math.cos(i)*6,340,x,512);g.stroke();
        }
      } else if (kind === 'marble' || kind === 'paving') {
        g.fillStyle=dataMap?'#999':kind==='marble'?'#ded7c7':'#b7b4a9';g.fillRect(0,0,512,512);
        for(let row=0;row<4;row++)for(let col=0;col<4;col++) {
          let v=rand()*10;
          g.fillStyle=dataMap?'#c9c9c9':kind==='marble'?`rgb(${218+v},${210+v},${193+v})`:`rgb(${174+v},${174+v},${165+v})`;
          g.fillRect(col*128+1,row*128+1,126,126);
        }
        if(kind==='marble'&&!dataMap) for(let i=0;i<52;i++) {
          const x=rand()*512,y=rand()*512;
          g.strokeStyle='rgba(110,105,93,.09)';g.lineWidth=.4+rand();g.beginPath();g.moveTo(x,y);
          g.bezierCurveTo(x+40,y-20,x-30,y+100,x+90,y+140);g.stroke();
        }
      } else { g.fillStyle=dataMap?'#aaa':'#f4efe4';g.fillRect(0,0,512,512); }
      const pixels=g.getImageData(0,0,512,512);
      for(let i=0;i<pixels.data.length;i+=4) {
        const noise=(rand()-.5)*(kind==='ashlar'?20:kind==='plaster'?9:7);
        for(let j=0;j<3;j++)pixels.data[i+j]=clamp(pixels.data[i+j]+noise,0,255);
      }
      g.putImageData(pixels,0,0);
      const map=new T.CanvasTexture(c);map.wrapS=map.wrapT=T.RepeatWrapping;map.anisotropy=anisotropy;
      map.colorSpace=dataMap?T.NoColorSpace:T.SRGBColorSpace;
      map.name=`Reference finish ${kind}${dataMap?' relief':''}`;
      return map;
    }
    const textures = {};
    for(const type of ['roof','wood','ashlar','marble','paving','plaster'])textures[type]={map:texture(type),bump:texture(type,true)};
    function surface(m, kind, scale, color, roughness, bump=.02) {
      m.map=textures[kind].map;m.bumpMap=textures[kind].bump;m.bumpScale=bump;
      m.color.set(color);m.roughness=roughness;m.envMapIntensity=.45;m.needsUpdate=true;
      materialScale.set(m,{kind,scale}); return m;
    }
    surface(mat.wall,'plaster',3,'#faf3e1',.83,.012);
    surface(mat.trim,'plaster',2,'#efe2c8',.67,.008);
    surface(mat.darkTrim,'plaster',2,'#b69b73',.65,.008);
    surface(mat.roof,'roof',2.8,'#ffffff',.84,.055);
    surface(mat.cap,'plaster',2,'#efdfbd',.64,.01);
    surface(mat.foundation,'ashlar',2.4,'#dadcdd',.85,.028);
    surface(mat.floor,'marble',3.6,'#c3c2bc',.48,.008);
    surface(mat.ground,'paving',4.8,'#e5e5dd',.65,.012);
    surface(mat.wood,'wood',1.8,'#b38d68',.39,.009);
    mat.recess.color.set('#302319');
    // Glazing has two options: clear float glass, or stained glass. In the
    // stained option each opening carries its own painted artwork
    // (glass-art.js); the shared glass material becomes a quiet cathedral
    // glass of pale leaded quarries for the remaining openings.
    const art=window.CHURCH_GLASS_ART;
    function glassTexture(canvas,name,repeat){
      const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.anisotropy=anisotropy;t.name=name;
      if(repeat){t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(...repeat);}
      return t;
    }
    const cathedral=(()=>{
      const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
      const tints=['#efe3bf','#e8dcb0','#f2e9cc','#e3dcc0','#ece0b8'];
      for(let row=0;row<4;row++)for(let col=0;col<4;col++){g.fillStyle=tints[(row*3+col*2)%tints.length];g.fillRect(col*64,row*64,64,64);}
      g.strokeStyle='#2a241c';g.lineWidth=3;
      for(let k=0;k<=4;k++){g.beginPath();g.moveTo(k*64,0);g.lineTo(k*64,256);g.moveTo(0,k*64);g.lineTo(256,k*64);g.stroke();}
      return glassTexture(c,'Cathedral glass quarries',[3,2.2]);
    })();
    const artGlass=[{m:mat.glass,map:cathedral}];
    function artMaterial(canvas,name){
      const m=mat.glass.clone();m.name=name;artGlass.push({m,map:glassTexture(canvas,name)});return m;
    }
    ctx.artGlass=artGlass;
    const fanCache=new Map();
    function fanMaterial(index,dims){
      const key=`${index}|${dims.width}`;
      if(!fanCache.has(key))fanCache.set(key,artMaterial(art.fanlight(art.FAN_DESIGNS[index%art.FAN_DESIGNS.length],dims),`Stained-glass fanlight ${index+1}`));
      return fanCache.get(key);
    }
    // Twelve saints for the nave-wall arches: left (C, −z) and right (G, +z), front to back.
    const glazing=[];interior.group.traverse(o=>{if(o.isMesh&&/^Proposed coloured glazing/.test(o.name))glazing.push(o);});
    for(const [side,list] of [[-1,art.SAINTS.left],[1,art.SAINTS.right]]){
      glazing.filter(o=>Math.sign(o.position.z)===side).sort((p,q)=>p.position.x-q.position.x).forEach((o,i)=>{
        const spec=list[i%list.length];o.material=artMaterial(art.saintPanel(spec),`Stained glass · ${spec.name}`);o.name=`Stained-glass window · ${spec.name}`;
      });
    }
    let roseMat=null;
    building.traverse(o=>{if(o.isMesh&&o.name==='Schematic rose-window infill'){roseMat??=artMaterial(art.rose(),'Stained-glass rose');o.material=roseMat;}});
    applyGlass();
    mat.metal.color.set('#927043');mat.metal.metalness=.72;mat.metal.roughness=.29;
    mat.wall.name='Ivory mineral plaster · reference finish';mat.roof.name='Terracotta tile · reference finish';
    mat.foundation.name='Gray stone plinth · reference finish';
    const im=interior.materials;
    surface(im.wood,'wood',1.6,'#b38d68',.4,.009);
    surface(im.woodInset,'wood',1.6,'#987553',.45,.008);
    surface(im.timber,'wood',2.1,'#ab8d6f',.5,.012);
    surface(im.lining,'plaster',3,'#fcf2d8',.88,.008);
    surface(im.whiteStone,'marble',3.2,'#fff9eb',.28,.007);
    surface(im.stone,'marble',3.6,'#f0e5d1',.4,.01);
    im.brass.color.set('#c59646');im.brass.metalness=.8;im.brass.roughness=.25;
    im.redStone.color.set('#68635d');

    const details = new T.Group();details.name='Reference refinements · stairs, joinery and mouldings';exterior.add(details);
    function mesh(geometry, material, parent, name) {
      const m=new T.Mesh(geometry,material);m.name=name;m.castShadow=true;m.receiveShadow=true;
      m.userData={status:'REFERENCE PROPOSAL / UNDIMENSIONED PROFILE',source:'Original plan and new reference images'};
      parent.add(m);return m;
    }
    function box(w,h,d,x,y,z,material,parent=details,name='Reference moulding') {
      const m=mesh(new T.BoxGeometry(w,h,d),material,parent,name);m.position.set(x,y,z);return m;
    }
    function rod(a,b,r,material,parent=details,name='Reference handrail') {
      const from=new T.Vector3(...a),to=new T.Vector3(...b),v=to.clone().sub(from);
      const m=mesh(new T.CylinderGeometry(r,r,v.length(),10),material,parent,name);
      m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;
    }
    const balusterGeo=new T.LatheGeometry([[.07,0],[.09,.05],[.066,.13],[.052,.24],[.086,.35],[.079,.43],[.047,.52],[.05,.64],[.084,.69]].map(p=>new T.Vector2(...p)),12);
    function baluster(x,y,z,parent) {const m=mesh(balusterGeo,mat.trim,parent,'Turned stone baluster');m.position.set(x,y,z);}
    function post(x,y,z,parent) {
      box(.4,.12,.4,x,y+.06,z,mat.trim,parent);box(.27,.73,.27,x,y+.46,z,mat.trim,parent);
      box(.39,.1,.39,x,y+.875,z,mat.trim,parent);
      const ball=mesh(new T.SphereGeometry(.13,12,8),mat.trim,parent,'Stone newel finial');ball.position.set(x,y+1.05,z);
    }
    function rail(a,b,parent) {
      rod([a[0],a[1]+.89,a[2]],[b[0],b[1]+.89,b[2]],.075,mat.trim,parent);
      rod([a[0],a[1]+.09,a[2]],[b[0],b[1]+.09,b[2]],.065,mat.trim,parent);
      const length=Math.hypot(b[0]-a[0],b[2]-a[2]),count=Math.max(1,Math.floor(length/.29));
      for(let j=1;j<count;j++){const f=j/count;baluster(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f+.15,a[2]+(b[2]-a[2])*f,parent);}
      post(...a,parent);post(...b,parent);
    }
    // Keep the grid lines fixed; use plan outer witnesses for the supporting base.
    const all=[];building.traverse(o=>all.push(o));
    for(const o of all) {
      if(o.name.startsWith('Main plinth below'))o.scale.z=22.489/o.geometry.parameters.depth;
      if(o.name.startsWith('Side projection plinth')){
        o.scale.x=9.188/o.geometry.parameters.width;
        o.scale.z=(14.079-7.25)/o.geometry.parameters.depth;
        o.position.z=Math.sign(o.position.z)*(14.079+7.25)/2;
      }
      if(o.name.startsWith('Entrance forecourt'))o.scale.z=27.254/o.geometry.parameters.depth;
      if(o.name.startsWith('Schematic approach riser'))o.scale.z=26.55/o.geometry.parameters.depth;
    }
    for(const state of ['closed','open']){
      const group=new T.Group();group.name=`Entrance joinery · ${state}`;group.userData.doorState=state;building.add(group);doorGroups[state]=group;
    }
    // Reuse each traced main-door hinge, preserving its exact facade transform.
    building.updateMatrixWorld(true);
    for(const hinge of all.filter(o=>o.name==='Open entry door leaf')) {
      const angle=hinge.rotation.y;
      for(const state of ['closed','open']) {
        hinge.rotation.y=state==='closed'?0:angle;hinge.updateWorldMatrix(true,true);
        const copy=hinge.clone(true);copy.matrix.copy(hinge.matrixWorld);copy.matrix.decompose(copy.position,copy.quaternion,copy.scale);
        doorGroups[state].add(copy);
        copy.traverse(o=>{if(o.isMesh&&/Door panel|door leaf/.test(o.name))o.material=mat.wood;});
      }
      hinge.removeFromParent();
    }
    // At each tower the front/side passages remain open. Repair the existing
    // rear wall plane at axis 2, several metres behind the front portal.
    for(const tower of all.filter(o=>o.name.startsWith('Tower ')&&o.type==='Group'&&o.name.includes('/ 1'))){
      const back=tower.children.find(o=>o.type==='Group'&&o.position.x>2&&o.position.y===0&&o.children.some(m=>m.name==='Tower stage 1 wall'));
      if(back){
        back.clear();box(4.9,8.39,.28,0,4.195,0,mat.wall,back,'Existing tower rear wall at axis 2');
        box(4.4,.16,.12,0,.68,.18,mat.trim,back,'Rear passage dado');
      }
    }
    // Outer openings share one joinery plane. The C/G inner doorways remain
    // open circulation; no duplicate leaves across the veranda.
    for(const leaf of all.filter(o=>o.name.startsWith('Open side door leaf')))leaf.parent.removeFromParent();
    const sideBays=all.filter(o=>o.name.startsWith('Outer veranda'));
    function pane(shape,parent,material,name){const m=mesh(new T.ShapeGeometry(shape,24),material,parent,name);m.position.z=.10;return m;}
    // A pane whose UVs run 0–1 across the opening, for the artwork.
    let fanIndex=0;
    function fanPane(shape,parent,material,name,x,bottom,width,height){
      const m=pane(shape,parent,material,name),uv=m.geometry.attributes.uv,pos=m.geometry.attributes.position;
      for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)-(x-width/2))/width,(pos.getY(i)-bottom)/height);
      uv.needsUpdate=true;return m;
    }
    function arch(x,bottom,width,spring,rise){const s=new T.Shape();s.moveTo(x-width/2,bottom);s.lineTo(x+width/2,bottom);s.lineTo(x+width/2,spring);s.absellipse(x,spring,width/2,rise,0,Math.PI,false);s.lineTo(x-width/2,bottom);return s;}
    function panels(leaf,width,height) {
      for(const face of [-1,1])for(let row=0;row<3;row++) {
        const y=height*(.18+row*.31),pw=width*.74,ph=height*.255;
        box(pw,ph,.026,0,y,face*.058,im.woodInset,leaf,'Recessed carved timber panel');
        for(const sign of [-1,1]){
          box(pw+.04,.04,.044,0,y+sign*ph/2,face*.083,mat.wood,leaf,'Raised panel horizontal frame');
          box(.04,ph,.044,sign*pw/2,y,face*.083,mat.wood,leaf,'Raised panel vertical frame');
        }
        const relief=mesh(new T.TorusGeometry(Math.min(width*.20,ph*.27),.022,6,20),mat.wood,leaf,'Timber rosette relief');relief.position.set(0,y,face*.089);
        for(let k=0;k<6;k++){const a=k*Math.PI/3;rod([0,y,face*.09],[Math.cos(a)*width*.16,y+Math.sin(a)*width*.16,face*.09],.018,mat.wood,leaf,'Carved rosette petal');}
      }
    }
    for(const state of ['closed','open'])for(const hinge of doorGroups[state].children) {
      const leaf=hinge.children.find(o=>o.name==='Open timber door leaf');
      if(!leaf)continue;
      const carving=new T.Group();carving.position.set(leaf.position.x,0,leaf.position.z);hinge.add(carving);
      panels(carving,leaf.geometry.parameters.width,leaf.geometry.parameters.height);
    }
    for(const bay of sideBays) {
      const door=/ (4–5|8–9|10–11)$/.test(bay.name),wing=bay.name.endsWith(' 9–10');
      if(door) {
        fanPane(arch(0,3.04,2.25,3.101,1.14),bay,fanMaterial(fanIndex++,{width:2.25,bottom:3.04,spring:3.101,rise:1.14,sectors:8}),'Outer door fixed fanlight',0,3.04,2.25,1.201);
        box(2.25,.11,.16,0,3.04,.13,mat.wood,bay,'Outer doorway timber transom');
        for(let k=1;k<8;k++){const a=k*Math.PI/8;rod([0,3.08,.13],[Math.cos(a)*1.06,3.101+Math.sin(a)*1.07,.13],.022,mat.metal,bay,'Fanlight radial bronze bar');}
        for(const state of ['closed','open']) {
          const frame=new T.Group();frame.position.copy(bay.position);frame.rotation.copy(bay.rotation);doorGroups[state].add(frame);
          for(const sign of [-1,1]) {
            const hinge=new T.Group();hinge.position.set(sign*1.125,-.32,.10);hinge.rotation.y=state==='closed'?0:sign*1.45;frame.add(hinge);
            const leaf=new T.Group();leaf.position.x=-sign*.551;hinge.add(leaf);
            box(1.102,3.305,.095,0,1.6525,0,mat.wood,leaf,'Exterior timber door leaf');panels(leaf,1.102,3.305);
            rod([-sign*.40,1.3,.12],[-sign*.40,1.65,.12],.025,mat.metal,leaf,'Bronze door pull');
          }
        }
      } else {
        // Half-round glazed fanlight over a timber transom, like the doors;
        // the shutter pair below swings out with the doors.
        for(const x of wing?[-2.4,2.4]:[-1,1]) {
          fanPane(arch(x,3.0,1,3.101,.507),bay,fanMaterial(fanIndex++,{width:1,bottom:3.0,spring:3.101,rise:.507,sectors:6}),'Window stained-glass fanlight',x,3.0,1,.608);
          box(1,.085,.15,x,3.0,.13,mat.wood,bay,'Window timber transom');
          for(let k=1;k<6;k++){const a=k*Math.PI/6;rod([x,3.04,.13],[x+Math.cos(a)*.47,3.101+Math.sin(a)*.475,.13],.016,mat.metal,bay,'Fanlight radial bronze bar');}
          rod([x-.49,3.101,.13],[x+.49,3.101,.13],.012,mat.metal,bay,'Fanlight spring bar');
          for(const state of ['closed','open']) {
            const frame=new T.Group();frame.position.copy(bay.position);frame.rotation.copy(bay.rotation);doorGroups[state].add(frame);
            for(const sign of [-1,1]) {
              const hinge=new T.Group();hinge.position.set(x+sign*.5,.85,.10);hinge.rotation.y=state==='closed'?0:sign*1.5;frame.add(hinge);
              const leaf=new T.Group();leaf.position.x=-sign*.25;hinge.add(leaf);
              box(.49,2.1,.06,0,1.05,0,mat.wood,leaf,'Window timber shutter leaf');
              for(const face of [-1,1]){
                for(const sx of [-1,1])box(.04,2.1,.03,sx*.225,1.05,face*.04,mat.wood,leaf,'Shutter stile');
                for(const y of [.04,.72,1.38,2.06])box(.49,.05,.03,0,y,face*.04,mat.wood,leaf,'Shutter rail');
                for(const y of [.38,1.05,1.72])box(.33,.5,.012,0,y,face*.033,im.woodInset,leaf,'Shutter inset panel');
              }
            }
          }
        }
      }
    }
    // Side access: paired flights at axes 4–5, single flights flanking 9–10.
    const stairGroup=new T.Group();stairGroup.name='Plan-led side stairs · six landings, eight flights';plinth.add(stairGroup);
    const configurations=[{x:16.725,dir:[1,-1]},{x:34.725,dir:[1]},{x:46.425,dir:[-1]}];
    for(const sign of [-1,1])for(const {x,dir} of configurations) {
      const minZ=10.28,maxZ=13.20,z=sign*(minZ+maxZ)/2;
      box(2.5,1.76,2.92,x,-1.2,z,mat.foundation,stairGroup,'Side stair landing support');
      box(2.5,.10,2.92,x,-.37,z,mat.floor,stairGroup,'Side landing at −0.320 m');
      if(sign===1)stairs.push({minX:x-1.25,maxX:x+1.25,minZ,maxZ,direction:0});
      rail([x-1.25,-.32,sign*maxZ],[x+1.25,-.32,sign*maxZ],stairGroup);
      for(const direction of dir) {
        const top=x-direction*1.25,run=4.5,bottom=top-direction*run;
        if(sign===1)stairs.push({minX:Math.min(bottom,top),maxX:Math.max(bottom,top),minZ,maxZ,direction,run});
        for(let j=0;j<12;j++) {
          const height=(j+1)*1.76/12,stepX=bottom+direction*(j+.5)*run/12;
          box(run/12+.008,height,2.92,stepX,-2.08+height/2,z,mat.foundation,stairGroup,'Side stair riser');
          box(run/12+.022,.038,2.97,stepX,-2.08+height-.019,z,mat.floor,stairGroup,'Stone tread with projecting nosing');
        }
        rail([bottom,-2.08,sign*maxZ],[top,-.32,sign*maxZ],stairGroup);
      }
      // A closed end on each single-flight landing, matching the new side view.
      if(dir.length===1)rail([x+dir[0]*1.25,-.32,sign*minZ],[x+dir[0]*1.25,-.32,sign*maxZ],stairGroup);
    }
    // Replace the old thin approach railing with continuous stone balustrades.
    const removals=[];
    plinth.traverse(o=>{if(/Schematic approach handrail|Schematic baluster/.test(o.name))removals.push(o);});
    removals.forEach(o=>o.removeFromParent());
    for(const sign of [-1,1]) {
      rail([-13.219,-2.08,sign*13.38],[-8.099,-.48,sign*13.38],plinth);
      rail([-8.099,-.48,sign*13.38],[-.55,-.48,sign*13.38],plinth);
    }
    // Reference timber shafts on the existing column grids, no grid changes.
    structure.traverse(o=>{
      if(!o.isMesh)return;
      if(o.name.startsWith('Central column'))o.material=im.timber;
      if(o.name.startsWith('Column head'))o.material=im.timber;
    });
    for(const key of ['3','4','5','6','7','8','9','10','11'])for(const sign of [-1,1]) {
      const x=data.longitudinal[key],z=sign*3.6;
      box(.84,.095,.84,x,.63,z,im.whiteStone,structure,'Carved stone pedestal cap');
      box(.72,.10,.72,x,.73,z,im.timber,structure,'Timber shaft foot');
      box(.70,.12,.70,x,9.27,z,im.timber,structure,'Timber capital collar');
      for(const axis of [-1,1])rod([x,8.92,z],[x+axis*.8,9.16,z],.075,im.timber,roofs,'Timber knee brace · proposed section');
    }
    // Section sheet 5: a three-lobed opening under the sanctuary roof.
    // The plaster frame closes the sanctuary at axis 11 (its back wall), so the
    // timber columns on axis 10 stand free in front of it, as in the reference
    // interior. Curve radii and depth remain provisional.
    const SX=data.longitudinal['11'];
    const sanctuaryFrame=new T.Group();sanctuaryFrame.name='Sanctuary three-lobed frame · section sheet 5';
    sanctuaryFrame.position.x=SX;sanctuaryFrame.rotation.y=-Math.PI/2;structure.add(sanctuaryFrame);
    const obsoleteTies=[];
    roofs.traverse(o=>{
      if(o.isMesh&&Math.abs(o.position.x-SX)<.01&&/transverse tie|knee brace|truss diagonal|king post|connection block/i.test(o.name))obsoleteTies.push(o);
    });
    obsoleteTies.forEach(o=>o.removeFromParent());
    floors.traverse(o=>{if(o.name.startsWith('Sanctuary separation'))obsoleteTies.push(o);});
    obsoleteTies.forEach(o=>o.removeFromParent());
    function lobedLine(cx,half,spring,shoulder,crown){
      const line=new T.Shape();line.moveTo(cx-half,spring);
      line.quadraticCurveTo(cx-half,shoulder-.05,cx-half*.58,shoulder);
      line.bezierCurveTo(cx-half*.50,crown,cx-half*.15,crown+.04,cx,crown+.04);
      line.bezierCurveTo(cx+half*.15,crown+.04,cx+half*.50,crown,cx+half*.58,shoulder);
      line.quadraticCurveTo(cx+half,shoulder-.05,cx+half,spring);
      return line;
    }
    function lobedFrame(cx,half,spring,shoulder,crown,roofEnd,roofCrown) {
      const line=lobedLine(cx,half,spring,shoulder,crown);
      const trace=line.getPoints(48);
      line.lineTo(cx+half,roofEnd);line.lineTo(cx,roofCrown);line.lineTo(cx-half,roofEnd);line.closePath();
      const wall=mesh(new T.ExtrudeGeometry(line,{depth:.32,bevelEnabled:false,curveSegments:32}),mat.wall,sanctuaryFrame,'Sanctuary arch spandrel');wall.position.z=-.16;
      for(const depth of [-.19,.19]) {
        const path=new T.CatmullRomCurve3(trace.map(p=>new T.Vector3(p.x,p.y,depth)));
        mesh(new T.TubeGeometry(path,96,.055,8,false),mat.trim,sanctuaryFrame,'Three-lobed sanctuary arch moulding');
      }
    }
    lobedFrame(0,3.3,8.25,9.38,10.83,9.82,12.18);
    for(const sign of [-1,1]) {
      lobedFrame(sign*5.48,1.58,5.55,6.05,6.8,7.1,7.6);
      box(.72,9.25,.72,sign*3.6,4.775,0,mat.wall,sanctuaryFrame,'Sanctuary plaster pier on D/E grid · axis 11');
      box(.9,.18,.9,sign*3.6,9.42,0,mat.trim,sanctuaryFrame,'Sanctuary pier capital');
      box(.96,.9,.96,sign*3.6,.6,0,mat.trim,sanctuaryFrame,'Sanctuary pier base');
    }
    // Axis-10 timber columns now stand on the dais: a stone collar at +0.75.
    for(const sign of [-1,1])box(.84,.22,.84,data.longitudinal['10'],.86,sign*3.6,im.whiteStone,structure,'Carved stone column base on the dais');

    const fit=new T.Group();fit.name='Sanctuary seating and service room · proposal';building.add(fit);
    const fit0=fit;
    // Back wall inside the central lobed arch, behind the reredos (plain).
    const back=lobedLine(0,3.3,8.25,9.38,10.83);
    back.lineTo(3.3,.15);back.lineTo(-3.3,.15);back.closePath();
    const backWall=mesh(new T.ExtrudeGeometry(back,{depth:.2,bevelEnabled:false,curveSegments:32}),mat.wall,sanctuaryFrame,'Sanctuary back wall behind the reredos');
    backWall.position.z=-.12;
    // Side alcoves behind the two smaller lobed arches, as in the reference
    // interior: deep, warm-lit bays with Our Lady (left, B) and Saint Joseph
    // (right, H) on stone plinths. A door in each alcove's inner side wall
    // leads to the service room.
    const alcove={x0:SX+.16,x1:50.1,zIn:3.6,zOut:7.2,top:6.95,plinth:{z:5.25,w:1.25,d:.75,h:.6}};
    const warm=mat.wall.clone();warm.name='Warm ochre alcove plaster · proposal';warm.color.set('#f1d9a8');
    for(const sign of [-1,1]){
      const zc=(alcove.zIn+alcove.zOut)/2,width=alcove.zOut-alcove.zIn,depth=alcove.x1-alcove.x0;
      box(.2,alcove.top-.15,width,alcove.x1+.1,(alcove.top+.15)/2,sign*zc,warm,fit0,'Statue alcove back wall');
      box(depth+.2,.15,width+.1,(alcove.x0+alcove.x1)/2+.1,alcove.top+.075,sign*zc,warm,roofs,'Statue alcove ceiling');
      // Outer side: closes the alcove against the C/G wall line.
      box(depth,alcove.top-.15,.16,(alcove.x0+alcove.x1)/2,(alcove.top+.15)/2,sign*(alcove.zOut+.08),warm,fit0,'Statue alcove outer wall');
      // Stone plinth with a carved panel and a moulded cap.
      const pl=alcove.plinth,px=alcove.x1-pl.d/2-.02;
      box(pl.d,pl.h,pl.w,px,.15+pl.h/2,sign*pl.z,im.whiteStone,fit0,'Statue plinth');
      box(pl.d+.1,.08,pl.w+.1,px,.15+pl.h+.04,sign*pl.z,im.stone,fit0,'Statue plinth cap');
      box(.02,pl.h*.55,pl.w*.62,px-pl.d/2-.01,.15+pl.h/2,sign*pl.z,mat.darkTrim,fit0,'Plinth carved panel');
      // Arched halo moulding on the back wall behind the statue.
      const pts=[];for(let k=0;k<=28;k++){const a=Math.PI-k*Math.PI/28;pts.push(new T.Vector3(alcove.x1-.01,3.6+Math.sin(a)*1.35,sign*pl.z+Math.cos(a)*.95));}
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),64,.05,8,false),mat.trim,fit0,'Alcove arch moulding');
      for(const e of [-1,1])box(.06,2.85,.1,alcove.x1-.03,.15+.6+2.85/2,sign*pl.z+e*.95,mat.trim,fit0,'Alcove pilaster strip');
    }
    // Seating beside the altar on the +0.15 side platforms: the choir on the
    // right (H, +z) with three stepped rows and a keyboard; servers and
    // ministers on the left (B, −z). Benches face the altar across the dais.
    function sideBench(x0,x1,z,y,face,name){
      const len=x1-x0,cx=(x0+x1)/2,out=-face;
      box(len,.07,.42,cx,y+.44,z,im.wood,fit,`${name} seat`);
      box(len,.5,.06,cx,y+.84,z+out*.22,im.wood,fit,`${name} back`);
      box(len,.12,.07,cx,y+.13,z+out*.17,im.wood,fit,`${name} rail`);
      for(const x of [x0+.03,cx,x1-.03]){
        box(.06,.42,.4,x,y+.21,z,im.wood,fit,`${name} support`);
      }
      for(const x of [x0,x1])box(.07,.95,.5,x,y+.47,z+out*.03,im.wood,fit,`${name} end panel`);
    }
    const choirRows=[{z:4.55,y:.15},{z:5.42,y:.33},{z:6.29,y:.51}];
    choirRows.forEach((r,i)=>{
      if(i)box(3.95,r.y-.15,.9,43.075,.15+(r.y-.15)/2,r.z,im.woodInset,fit,'Choir riser');
      sideBench(41.1,45.05,r.z,r.y,-1,`Choir bench row ${i+1}`);
    });
    for(const [i,z] of [-4.55,-5.42].entries())sideBench(41.1,45.05,z,.15,1,`Ministers bench row ${i+1}`);
    // Choir keyboard at the front of the choir, facing the singers.
    box(.42,.08,1.32,40.68,.98,5.42,im.wood,fit,'Choir keyboard case');
    box(.16,.03,1.22,40.62,1.035,5.42,im.whiteStone,fit,'Keyboard keys');
    box(.06,.72,1.32,40.86,.51,5.42,im.wood,fit,'Keyboard stand panel');
    for(const z of [4.82,6.02])box(.36,.82,.06,40.68,.56,z,im.wood,fit,'Keyboard stand side');

    // Service room (nhà áo / sacristy) behind the altar between the D and E
    // grids: vesting furniture and the church's electrical and sound control.
    const room={x0:SX+.12,x1:53.0,half:3.6,h:4.15,door:{x:49.6,w:.82,h:2.2}};
    for(const sign of [-1,1]){
      const wall=new T.Shape();wall.moveTo(room.x0,.15);wall.lineTo(room.x1,.15);wall.lineTo(room.x1,room.h);wall.lineTo(room.x0,room.h);wall.closePath();
      const d=room.door,hole=new T.Path();hole.moveTo(d.x-d.w/2,.15);hole.lineTo(d.x+d.w/2,.15);hole.lineTo(d.x+d.w/2,.15+d.h);hole.lineTo(d.x-d.w/2,.15+d.h);hole.closePath();wall.holes.push(hole);
      const w=mesh(new T.ExtrudeGeometry(wall,{depth:.2,bevelEnabled:false}),mat.wall,fit,'Service room side wall');w.position.z=sign*room.half-.1;
      box(d.w+.2,.12,.26,d.x,.15+d.h+.06,sign*room.half,mat.trim,fit,'Service room door head');
      for(const e of [-1,1])box(.08,d.h,.26,d.x+e*(d.w/2+.04),.15+d.h/2,sign*room.half,mat.trim,fit,'Service room door frame');
      const hinge=new T.Group();hinge.position.set(d.x-d.w/2+.02,.15,sign*(room.half-.12));hinge.rotation.y=sign*1.25;fit.add(hinge);
      box(d.w-.04,d.h-.04,.05,(d.w-.04)/2,(d.h-.04)/2,0,mat.wood,hinge,'Service room door leaf (open)');
    }
    box(room.x1-room.x0,.12,room.half*2+.2,(room.x0+room.x1)/2,room.h+.06,0,mat.wall,roofs,'Service room ceiling');
    const panelLight=new T.MeshStandardMaterial({color:'#fffaf0',emissive:'#fff3dc',emissiveIntensity:.9});panelLight.name='Service room ceiling panel';
    for(const x of [50.0,51.9])box(.6,.03,.6,x,room.h-.01,0,panelLight,fit,'Service room LED ceiling panel');
    // Vesting wardrobe and vesting counter along the rear wall.
    box(.62,2.15,2.6,52.55,.15+1.075,-1.75,im.wood,fit,'Vestment wardrobe');
    for(const z of [-2.4,-1.75,-1.1])box(.02,1.95,.02,52.23,1.225,z,mat.metal,fit,'Wardrobe door joint');
    box(.62,.9,2.2,52.55,.6,1.45,im.wood,fit,'Vesting counter with drawers');
    box(.68,.05,2.28,52.53,1.075,1.45,im.whiteStone,fit,'Vesting counter top');
    for(const y of [.4,.7])box(.02,.02,2.0,52.23,y,1.45,mat.metal,fit,'Drawer line');
    box(.05,.55,.04,52.95,2.1,1.45,im.wood,fit,'Vesting crucifix upright');box(.05,.04,.32,52.95,2.25,1.45,im.wood,fit,'Vesting crucifix arm');
    box(.8,.04,.8,50.9,.88,0,im.wood,fit,'Service room table');
    for(const dx of [-.33,.33])for(const dz of [-.33,.33])box(.05,.73,.05,50.9+dx,.515,dz,im.wood,fit,'Table leg');
    // Electrical and sound control on the back of the sanctuary wall.
    function label(text,w,h,x,y,z){
      const c=document.createElement('canvas');c.width=512;c.height=Math.round(512*h/w);const g=c.getContext('2d');
      g.fillStyle='#f4f1e8';g.fillRect(0,0,c.width,c.height);g.fillStyle='#2b3a36';g.font=`bold ${Math.round(c.height*.42)}px sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,c.width/2,c.height/2);
      const m=new T.MeshBasicMaterial({map:new T.CanvasTexture(c)});m.map.colorSpace=T.SRGBColorSpace;m.name=`Label · ${text}`;
      const plane=mesh(new T.PlaneGeometry(w,h),m,fit,`Label · ${text}`);plane.position.set(x,y,z);plane.rotation.y=Math.PI/2;plane.castShadow=false;return plane;
    }
    const steel=new T.MeshStandardMaterial({color:'#c9ccc8',roughness:.45,metalness:.55});steel.name='Powder-coated steel enclosure';
    const dark=new T.MeshStandardMaterial({color:'#1d2124',roughness:.5,metalness:.3});dark.name='Equipment rack black';
    const wx=SX+.12; // room face of the back wall
    const boards=[
      {z:-1.55,w:.8,h:1.1,y:1.75,text:'Main board (MSB)'},
      {z:-.55,w:.8,h:.9,y:1.85,text:'Lighting L1–L7 · scenes'},
      {z:.4,w:.6,h:.7,y:1.95,text:'Fans · speed control'},
    ];
    for(const b of boards){
      box(.2,b.h,b.w,wx+.1,b.y,b.z,steel,fit,`Wall enclosure · ${b.text}`);
      box(.01,b.h-.08,.01,wx+.205,b.y,b.z+b.w*.32,mat.metal,fit,'Enclosure handle');
      label(b.text,b.w*.92,.12,wx+.206,b.y+b.h/2+.09,b.z);
    }
    box(.05,.05,3.1,wx+.04,2.42,-.55,steel,fit,'Cable tray');
    // Sound rack: amplifiers, DSP, wireless microphone receivers.
    box(.8,1.6,.62,wx+.48,.95,1.4,dark,fit,'19-inch sound rack');
    const ledMat=new T.MeshBasicMaterial({color:'#5df08a'});ledMat.name='Status LEDs';
    for(let k=0;k<6;k++){box(.02,.16,.52,wx+.885,.45+k*.2,1.4,steel,fit,'Rack unit face');box(.02,.025,.025,wx+.9,.45+k*.2,1.62,ledMat,fit,'Rack status LED');}
    label('Sound · amps · DSP · mics',.56,.1,wx+.882,1.68,1.4);
    label('Phòng đồ lễ · Service room',.9,.14,52.98-.01,2.85,0).rotation.y=-Math.PI/2;
    const nodes=[];building.traverse(o=>{if(o.isMesh)nodes.push(o);});
    // Warm plaster window reveals, bronze rosettes, richer door-leaf panels.
    for(const o of nodes) {
      if(/rosette ring|rosette ray|cap rib|cross support|cross arm|cross shaft/i.test(o.name))o.material=mat.darkTrim;
      if(o.name==='Schematic bell louver'){o.material=mat.wood;o.rotation.x=.18;}
      if(/Open side door leaf|Open entrance door leaf|Door leaf panel/.test(o.name)&&o.geometry.type==='BoxGeometry') {
        const {width:w,height:h,depth:d}=o.geometry.parameters;
        if(w>.65&&h>2) {
          for(const face of [-1,1])for(let row=0;row<3;row++) {
            const panel=box(w*.71,h*.22,.023,0,-h*.31+row*h*.31,face*(d/2+.015),im.woodInset,o,'Raised timber door panel');
            panel.userData.source='New exterior and interior references · proposed joinery';
          }
        }
      }
      if(o.name==='Proposed limestone paving grid'||o.material?.name==='Proposed limestone paving grid')surface(o.material,'marble',3.6,'#faf4e7',.32,.007);
    }
    // Add flowing brass arms to the retained candle positions.
    const chandeliers=[];interior.group.traverse(o=>{if(o.name.startsWith('Proposed nave chandelier'))chandeliers.push(o);});
    for(const chandelier of chandeliers) {
      const obsolete=chandelier.children.filter(o=>/ring|radial support|candle arm/.test(o.name));obsolete.forEach(o=>o.removeFromParent());
      for(let j=0;j<8;j++) {
        const a=j*Math.PI/4,points=[[.05,.25],[.22,-.12],[.58,-.20],[.9,-.08],[1.02,.25]].map(([r,y])=>new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));
        mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),24,.024,8,false),im.brass,chandelier,'Curved brass chandelier arm');
      }
      const orb=mesh(new T.SphereGeometry(.19,20,12),im.brass,chandelier,'Turned chandelier body');orb.scale.y=1.45;orb.position.y=.08;
    }
    // Continuous tile ridge caps give a real silhouette without thousands of tile meshes.
    for(let x=5;x<53.35;x+=.42) {
      const cap=mesh(new T.CylinderGeometry(.145,.145,.43,10,1,true,0,Math.PI),mat.roof,roofs,'Terracotta half-round ridge cap');
      cap.rotation.z=Math.PI/2;cap.position.set(x,12.48,0);
    }
    // Low, simple planting: exactly two rows, clear of the facade and steps.
    // All foliage is deterministic geometry; no remote images or extra scenery.
    const landscape=new T.Group();landscape.name='Two rows of courtyard trees';building.add(landscape);
    const bark=new T.MeshStandardMaterial({color:'#66513a',roughness:1});
    const foliage=['#344a26','#496230','#627846'].map(color=>new T.MeshStandardMaterial({color,roughness:1,side:T.DoubleSide}));
    const crownGeo=new T.IcosahedronGeometry(1,1);
    const leafShape=new T.Shape();leafShape.moveTo(0,-.5);leafShape.quadraticCurveTo(.35,0,0,.5);leafShape.quadraticCurveTo(-.35,0,0,-.5);
    const leafGeo=new T.ShapeGeometry(leafShape,3);
    for(const sign of [-1,1])for(let tree=0;tree<8;tree++) {
      const x=4+tree*6.9,z=sign*23.2,h=3.8+rand()*.7;
      const trunk=mesh(new T.CylinderGeometry(.13,.23,h,9),bark,landscape,'Tree trunk');trunk.position.set(x,-2.08+h/2,z);
      const treeGroup=new T.Group();treeGroup.name=`Tree ${tree+1} · ${sign<0?'left':'right'} row`;landscape.add(treeGroup);
      for(let b=0;b<5;b++) {
        const a=b*Math.PI*2/5;rod([x,.2,z],[x+Math.cos(a)*1.2,h-2.1,z+Math.sin(a)*1.2],.055,bark,treeGroup,'Tree branch');
      }
      for(let j=0;j<80;j++) {
        const a=rand()*Math.PI*2,r=Math.sqrt(rand())*1.8,y=rand()*2.4;
        const leaf=mesh(crownGeo,foliage[Math.floor(rand()*3)],treeGroup,'Foliage cluster');
        leaf.position.set(x+Math.cos(a)*r,h-2.6+y,z+Math.sin(a)*r);
        leaf.scale.set(.22+rand()*.3,.25+rand()*.4,.22+rand()*.3);leaf.rotation.set(rand(),rand()*6,rand());
        for(let k=0;k<12;k++) {
          const blade=mesh(leafGeo,foliage[k%3],treeGroup,'Individual foliage leaf');
          blade.position.copy(leaf.position).add(new T.Vector3((rand()-.5)*1.1,(rand()-.5)*1.1,(rand()-.5)*1.1));
          blade.scale.set(.7,.7,.7);blade.rotation.set(rand()*6,rand()*6,rand()*6);
        }
      }
      const curb=mesh(new T.TorusGeometry(.72,.07,6,24),mat.trim,landscape,'Tree bed stone edging');curb.rotation.x=Math.PI/2;curb.position.set(x,-2.045,z);
    }
    // Project maps in metres before the legacy renderer merges material batches.
    const p=new T.Vector3(),normal=new T.Vector3(),normalMatrix=new T.Matrix3();
    building.updateMatrixWorld(true);scene.updateMatrixWorld(true);
    function projectUV(o) {
      if(!o.isMesh||!materialScale.has(o.material))return;
      const config=materialScale.get(o.material),g=o.geometry.clone(),pos=g.attributes.position,norm=g.attributes.normal,uv=new Float32Array(pos.count*2);
      normalMatrix.getNormalMatrix(o.matrixWorld);
      for(let j=0;j<pos.count;j++) {
        p.fromBufferAttribute(pos,j);normal.fromBufferAttribute(norm,j);
        if(config.kind==='wood') {
          // Grain follows the longest local member direction.
          const dim=g.parameters||{},width=dim.width||0,height=dim.height||0,depth=dim.depth||0;
          if(width>height&&width>depth){uv[j*2]=p.z/config.scale;uv[j*2+1]=p.x/config.scale;}
          else if(depth>height){uv[j*2]=p.x/config.scale;uv[j*2+1]=p.z/config.scale;}
          else {uv[j*2]=(Math.abs(normal.z)>.5?p.x:p.z)/config.scale;uv[j*2+1]=p.y/config.scale;}
        } else {
          p.applyMatrix4(o.matrixWorld);normal.applyMatrix3(normalMatrix).normalize();
          if(config.kind==='roof'){uv[j*2]=p.x/config.scale;uv[j*2+1]=p.z*1.24/config.scale;}
          else if(Math.abs(normal.y)>.6){uv[j*2]=p.x/config.scale;uv[j*2+1]=p.z/config.scale;}
          else {uv[j*2]=(Math.abs(normal.z)>.5?p.x:p.z)/config.scale;uv[j*2+1]=p.y/config.scale;}
        }
      }
      g.setAttribute('uv',new T.BufferAttribute(uv,2));o.geometry=g;
    }
    building.traverse(projectUV);
    scene.children.forEach(o=>{if(o.name==='Presentation ground'){o.scale.set(6,1,6);o.position.y=-2.16;o.updateMatrixWorld();projectUV(o);}});
    // Sky reflection, kept local and deterministic for file:// use and GLB export.
    const sky=document.createElement('canvas');sky.width=1024;sky.height=512;
    const sg=sky.getContext('2d'),gradient=sg.createLinearGradient(0,0,0,512);
    gradient.addColorStop(0,'#6393b9');gradient.addColorStop(.43,'#c8deed');gradient.addColorStop(.5,'#ede6d6');gradient.addColorStop(.56,'#a7a99c');gradient.addColorStop(1,'#797b6e');
    sg.fillStyle=gradient;sg.fillRect(0,0,1024,512);
    const glow=sg.createRadialGradient(210,130,1,210,130,85);glow.addColorStop(0,'rgba(255,244,209,1)');glow.addColorStop(1,'rgba(255,244,209,0)');sg.fillStyle=glow;sg.fillRect(0,0,1024,512);
    const environment=new T.CanvasTexture(sky);environment.mapping=T.EquirectangularReflectionMapping;environment.colorSpace=T.SRGBColorSpace;
    scene.environment=environment;scene.environmentIntensity=.6;
    scene.fog=new T.Fog('#d9e4e9',120,380);
    sun.position.set(-35,48,-48);sun.target.position.set(20,9,0);
    sun.shadow.mapSize.set(lightGraphics?1024:4096,lightGraphics?1024:4096);
    Object.assign(sun.shadow.camera,{left:-48,right:48,top:47,bottom:-39,near:.5,far:180});sun.shadow.camera.updateProjectionMatrix();sun.shadow.normalBias=.035;sun.shadow.bias=-.00008;
    // Restrained facade illumination: four static spot lights in evening only.
    ctx.facadeLights=[];
    for(const z of [-10.153,10.153]) {
      const lamp=new T.SpotLight('#ffd098',0,65,.25,.55,1.5);lamp.position.set(-9,1.1,z);lamp.target.position.set(2.45,19,z);lamp.castShadow=false;scene.add(lamp,lamp.target);ctx.facadeLights.push(lamp);
    }
    for(const sign of [-1,1]) {
      const lamp=new T.SpotLight('#ffce96',0,50,.75,.8,1.5);lamp.position.set(27,1,sign*18);lamp.target.position.set(30,5,sign*10.4);lamp.castShadow=false;scene.add(lamp,lamp.target);ctx.facadeLights.push(lamp);
    }
    const centralWash=new T.SpotLight('#ffd49e',0,65,.85,.85,1.5);
    centralWash.position.set(-12,2,0);centralWash.target.position.set(2.4,9,0);scene.add(centralWash,centralWash.target);ctx.facadeLights.push(centralWash);
    data.revision='REFERENCE-REALISM-2026-10-05';
    data.refinement={date:'2026-10-05',mainOuterPlinthWidth:22.489,wingOuterPlinthWidth:28.158,frontPlatformWidth:27.254,frontPlatformRise:1.6,sideLandings:6,sideFlights:8,rearStairs:0,sideDoorPlane:10.414,stairRisersPerFlight:12,stairRiserHeight:1.76/12,treeRows:2,treeCount:16,stairCountStatus:'Proposed; measured floor levels retained',references:window.CHURCH_REFERENCES.map(r=>r.url)};
    data.assumptions=data.assumptions.filter(s=>!s.startsWith('The broad supporting plinth')&&!s.startsWith('Neutral and warm colors'));
    data.assumptions.push('Main plinth 22.489 m and projecting wing plinth 28.158 m use the plan overall witnesses. Structural axes and the 2.835 m projection per side remain fixed. Front stage stays within 27.254 m tower facade width and 1.600 m above courtyard. Detailed face offsets remain provisional.');
    data.assumptions.push('Exterior side doors now occupy the same outer wall plane as the windows, following the latest user correction. Doors open in Walk mode. Tower front arches remain open with the existing rear wall plane visible beyond.');
    data.assumptions.push('The sanctuary frame uses the three-lobed central and side arch silhouettes from section sheet 5. Curvature, relief depth and placement at axis 10 remain visual reconstructions pending a detailed longitudinal section.');
    data.assumptions.push('Side access follows the plan and the corrected side reference: paired flights at the first doorway, single flights flanking the projecting bay. Stair count, tread run, balustrade profiles and exact landing edges are proposed.');
    data.assumptions.push('Ivory plaster, stone trim, terracotta tiles, rubble plinth and timber shafts follow the selected images. All maps are generated locally at physical scale; these are proposed finishes. Two rows of eight trees are landscaping proposals.');
    ctx.palettes=new Map();for(const m of materialScale.keys())ctx.palettes.set(m,{color:m.color.clone(),map:m.map,bump:m.bumpMap});
    api.stats={sideFlights:8,sideLandings:6,texturedMaterials:materialScale.size,lightGraphics};
    api.measurements=data.refinement;
    building.userData.refinement=data.refinement;
    building.userData.assumptions=data.assumptions;
    finish(true);
  }

  function finish(reference=true) {
    if(!context)return;
    for(const [material,original] of context.palettes) {
      material.color.copy(reference?original.color:new context.THREE.Color('#dfded7'));
      material.map=reference?original.map:null;material.bumpMap=reference?original.bump:null;material.needsUpdate=true;
    }
  }
  function applyGlass(){
    if(!context?.artGlass)return;
    const T=context.THREE,night=lightMode==='evening';
    for(const {m,map} of context.artGlass){
      m.transparent=true;m.depthWrite=false;m.side=T.DoubleSide;m.metalness=0;
      if(glassKind==='stained'){
        m.map=m.emissiveMap=map;m.color.set('#ffffff');m.emissive.set('#ffffff');
        m.emissiveIntensity=night?.05:.62;m.opacity=.96;m.roughness=.35;
      }else{
        m.map=m.emissiveMap=null;m.color.set('#cfe2e6');m.emissive.set('#eaf4f6');
        m.emissiveIntensity=night?0:.05;m.opacity=.22;m.roughness=.04;
      }
      m.needsUpdate=true;
    }
  }
  function setGlass(kind){
    glassKind=kind==='stained'?'stained':'clear';
    if(context){applyGlass();context.renderer.shadowMap.needsUpdate=true;}
    return glassKind;
  }
  function lighting(mode) {
    if(!context)return;
    lightMode=mode==='evening'?'evening':'day';applyGlass();
    const {scene,sun,fill,hemisphere,renderer,interior,facadeLights}=context,night=mode==='evening';
    scene.background.set(night?'#17283c':'#d9e4e9');scene.fog.color.copy(scene.background);
    scene.environmentIntensity=night?.18:.6;
    hemisphere.color.set(night?'#9bb1cf':'#d9edff');hemisphere.groundColor.set(night?'#4c4038':'#b4a28a');hemisphere.intensity=night?.22:1.15;
    sun.color.set(night?'#adbedc':'#fff0d5');sun.intensity=night?.09:3.15;
    fill.color.set(night?'#a5bada':'#d2e3f4');fill.intensity=night?.1:.45;
    renderer.toneMappingExposure=night?1.12:1;
    // Reset from the interior's registered values, so repeated toggles never compound.
    interior.setLighting(mode);
    interior.lights.forEach(light=>{light.intensity*=night?1.9:.95;});
    facadeLights.forEach((light,index)=>{light.intensity=night?(index<2?430:index===4?450:230):0;});
    renderer.shadowMap.needsUpdate=true;
  }
})();
