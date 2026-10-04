/* Drawing-led refinement. Loaded before bundle.js; all lengths are metres.
 * Plans govern grids/levels. Finish, stair tread counts and ornamental profiles
 * remain proposals. Keep this readable layer separate from the legacy bundle.
 */
(() => {
  'use strict';
  const stairs = [];
  let context;
  const api = window.CHURCH_REALISM = { prepare, lighting, finish, stairHeight, stairAllowed };

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
        if (Math.abs(x - bottom) < .6) return true;
      }
    }
    return false;
  }

  function prepare(ctx) {
    context = ctx;
    const { THREE: T, building, scene, roofs, structure, plinth, exterior, mat, interior, renderer, data, sun } = ctx;
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
        g.fillStyle = dataMap ? '#444' : '#6c706e'; g.fillRect(0,0,512,512);
        for (let row=0;row<4;row++) for(let col=-1;col<4;col++) {
          const x=col*170.67+(row%2)*85.33, y=row*128, v=135+rand()*28;
          g.fillStyle=dataMap?'#b8b8b8':`rgb(${v*.96},${v},${v*1.03})`;g.fillRect(x+2,y+2,166.5,124);
          g.strokeStyle=dataMap?'#d5d5d5':'rgba(237,232,213,.4)';g.lineWidth=1;g.strokeRect(x+4,y+4,162.5,120);
        }
      } else if (kind === 'wood') {
        g.fillStyle=dataMap?'#888':'#93633e';g.fillRect(0,0,512,512);
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
    surface(mat.trim,'plaster',2,'#f2dfb3',.67,.008);
    surface(mat.darkTrim,'plaster',2,'#bc8746',.58,.008);
    surface(mat.roof,'roof',2.8,'#ffffff',.84,.055);
    surface(mat.cap,'plaster',2,'#efdfbd',.64,.01);
    surface(mat.foundation,'ashlar',2.4,'#dadcdd',.85,.028);
    surface(mat.floor,'marble',3.6,'#f3f1e9',.37,.008);
    surface(mat.ground,'paving',4.8,'#e5e5dd',.65,.012);
    surface(mat.wood,'wood',1.8,'#785536',.39,.009);
    mat.glass.color.set('#454238');mat.glass.roughness=.3;mat.recess.color.set('#29231c');
    mat.metal.color.set('#927043');mat.metal.metalness=.72;mat.metal.roughness=.29;
    mat.wall.name='Ivory mineral plaster · reference finish';mat.roof.name='Terracotta tile · reference finish';
    mat.foundation.name='Gray stone plinth · reference finish';
    const im=interior.materials;
    surface(im.wood,'wood',1.6,'#946540',.32,.009);
    surface(im.woodInset,'wood',1.6,'#705039',.42,.008);
    surface(im.timber,'wood',2.1,'#8c613c',.5,.012);
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
      rail([-13.219,-2.08,sign*10.56],[-8.099,-.48,sign*10.56],plinth);
      rail([-8.099,-.48,sign*10.56],[-.55,-.48,sign*10.56],plinth);
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
    const nodes=[];building.traverse(o=>{if(o.isMesh)nodes.push(o);});
    // Warm plaster window reveals, bronze rosettes, richer door-leaf panels.
    for(const o of nodes) {
      if(/rosette ring|rosette ray|cap rib|cross support|cross arm|cross shaft/i.test(o.name))o.material=mat.darkTrim;
      if(o.name==='Schematic bell louver'){o.material=im.woodInset;o.rotation.x=.18;}
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
    data.revision='REFERENCE-REALISM-03';
    data.refinement={date:'2026-10-04',sideLandings:6,sideFlights:8,stairRisersPerFlight:12,stairRiserHeight:1.76/12,stairCountStatus:'Proposed; measured floor levels retained',references:['exterior-front-new.png','exterior-day-45.png','exterior-side-correct-stairs.png','interior-day.png','interior-evening.png']};
    data.assumptions.push('Side access follows the plan and the corrected side reference: paired flights at the first doorway, single flights flanking the projecting bay. Stair count, tread run, balustrade profiles and exact landing edges are proposed.');
    data.assumptions.push('Ivory plaster, ochre highlights, terracotta tiles, stone plinth and timber shafts follow the new visual references. All maps are generated locally at physical scale; these are proposed finishes, not measured material specifications.');
    ctx.palettes=new Map();for(const m of materialScale.keys())ctx.palettes.set(m,{color:m.color.clone(),map:m.map,bump:m.bumpMap});
    api.stats={sideFlights:8,sideLandings:6,texturedMaterials:materialScale.size,lightGraphics};
    finish(true);
  }

  function finish(reference=true) {
    if(!context)return;
    for(const [material,original] of context.palettes) {
      material.color.copy(reference?original.color:new context.THREE.Color('#dfded7'));
      material.map=reference?original.map:null;material.bumpMap=reference?original.bump:null;material.needsUpdate=true;
    }
  }
  function lighting(mode) {
    if(!context)return;
    const {scene,sun,fill,hemisphere,renderer,interior,facadeLights}=context,night=mode==='evening';
    scene.background.set(night?'#17283c':'#d9e4e9');scene.fog.color.copy(scene.background);
    scene.environmentIntensity=night?.18:.6;
    hemisphere.color.set(night?'#9bb1cf':'#d9edff');hemisphere.groundColor.set(night?'#4c4038':'#b4a28a');hemisphere.intensity=night?.22:1.15;
    sun.color.set(night?'#adbedc':'#fff0d5');sun.intensity=night?.09:3.15;
    fill.color.set(night?'#a5bada':'#d2e3f4');fill.intensity=night?.1:.45;
    renderer.toneMappingExposure=night?1.12:1;
    interior.lights.forEach(light=>{light.intensity*=night?1.9:.95;});
    facadeLights.forEach((light,index)=>{light.intensity=night?(index<2?180:100):0;});
    renderer.shadowMap.needsUpdate=true;
  }
})();
