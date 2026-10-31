/* Geometry and fixture-envelope screen; not a construction or access approval. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path');
const {loadStudyModel,root} = require('./lib/study_model.cjs');
const study = loadStudyModel(), {model, SIM} = study, T = model.THREE;
try {
  model.scene.updateMatrixWorld(true);
  const nodes=[]; model.building.traverse(o=>{if(o.isMesh)nodes.push(o);});
  const named = name => {const found=nodes.filter(o=>o.name===name);assert.equal(found.length,1,name);return found[0];};
  const shafts={wing:named('Wing lower pilaster shaft'), rear:named('Rear lower pilaster shaft')};
  assert.equal(model.building.getObjectByName('Roofline ornament — CAD file 23 Oct 2026').userData.stats.removedLegacyLower,32,'only the eight legacy lower pilasters are replaced');
  const source=JSON.parse(fs.readFileSync(path.join(root,'docs/exterior-23102026/lower-pilaster-witnesses.json'),'utf8'));
  for(const [handle,expected] of [['DAC697',3.59],['DAC682',4.26],['D969DF',7.025012],['D969C5',7.695012],['D967B5',10.239012],['D967A0',10.909012]]) {
    const row=source.witnesses.find(w=>w.handle===handle);assert(row,`source ${handle}`);
    assert(Math.abs(row.elevation_m[0][0]-expected)<.00001,`${handle}: source face`);
  }
  const boxes=[];
  for (const side of [-1,1]) for (const edge of [-1,1]) {
    const range=edge<0?[40.575-4.26,40.575-3.59]:[40.575+3.59,40.575+4.26];
    const z=side*13.56;
    boxes.push({name:`wing ${side}/${edge}`,kind:'wing',box:new T.Box3(new T.Vector3(range[0]-.04,-.4,Math.min(z,z+side*.22)),new T.Vector3(range[1]+.04,6.323919,Math.max(z,z+side*.22)))});
  }
  for (const side of [-1,1]) for (const [lo,hi] of [[7.025012,7.695012],[10.239012,10.909012]]) {
    const [z0,z1]=side<0?[-hi,-lo]:[lo,hi];
    boxes.push({name:`rear ${side}/${lo}`,kind:'rear',box:new T.Box3(new T.Vector3(53.24,-.4,z0-.04),new T.Vector3(53.46,6.323919,z1+.04))});
  }
  assert.equal(boxes.length,8);
  const foundations=nodes.filter(o=>/^(Main plinth below|Side projection plinth below)/.test(o.name)).map(o=>({name:o.name,box:new T.Box3().setFromObject(o)}));
  assert.equal(foundations.length,3,'main and both wing plinths are available');
  for(const p of boxes){
    const base=foundations.find(f=>p.kind==='rear'?f.name.startsWith('Main plinth'):f.name.startsWith('Side projection') && Math.sign(f.box.min.z+f.box.max.z)===Math.sign(p.box.min.z+p.box.max.z));
    assert(base && Math.abs(base.box.max.y+.4)<.002,`${p.name}: modeled plinth level`);
    assert(p.box.min.x>=base.box.min.x-.002 && p.box.max.x<=base.box.max.x+.002 && p.box.min.z>=base.box.min.z-.002 && p.box.max.z<=base.box.max.z+.002,`${p.name}: pedestal footprint remains above modeled plinth`);
  }
  for(const p of boxes) if(p.kind==='wing') {
    for(const [a,b] of [[37.675,38.675],[42.475,43.475]]) assert(p.box.max.x<a||p.box.min.x>b,`${p.name}: wing window stays clear`);
  } else for(const z of [-8.887,-5.48,0,5.48,8.887])
    assert(p.box.max.z<z-.65||p.box.min.z>z+.65,`${p.name}: rear window stays clear`);
  const ray=new T.Raycaster();
  for (const {name,kind,box} of boxes) {
    const p=box.getCenter(new T.Vector3());p.y=3;
    const dir=kind==='wing'?new T.Vector3(0,0,-Math.sign(p.z)):new T.Vector3(-1,0,0);
    const origin=p.clone().addScaledVector(dir,-2);ray.set(origin,dir);
    assert(ray.intersectObject(shafts[kind],false).length,`${name}: actual shaft face exists`);
    for(const y of [1.529970,5.622216]) {
      const attr=shafts[kind].geometry.attributes.position;let seen=false;
      for(let i=0;i<attr.count;i++){
        const v=new T.Vector3().fromBufferAttribute(attr,i).applyMatrix4(shafts[kind].matrixWorld);
        if(Math.abs(v.y-y)<.002 && box.containsPoint(v)){seen=true;break;}
      }
      assert(seen,`${name}: shaft endpoint ${y} retained`);
    }
  }
  // Full fixture AABBs are a conservative screen, not a service-clearance approval.
  const clashes=[];
  for(const f of SIM.fixtures.values()) {
    const b=new T.Box3().setFromObject(f.root);if(b.isEmpty())continue;
    for(const p of boxes)if(b.intersectsBox(p.box))clashes.push({fixture:f.item.id,pier:p.name});
  }
  assert.deepEqual(clashes,[],`Fixture envelopes intersect new pilasters: ${JSON.stringify(clashes)}`);
  const segmentHits=(a,b,box)=>{
    let lo=0,hi=1;
    for(let k=0;k<3;k++){
      const min=box.min.getComponent(k),max=box.max.getComponent(k),d=b[k]-a[k];
      if(Math.abs(d)<1e-10){if(a[k]<min||a[k]>max)return false;continue;}
      let p=(min-a[k])/d,q=(max-a[k])/d;if(p>q)[p,q]=[q,p];
      lo=Math.max(lo,p);hi=Math.min(hi,q);if(lo>hi)return false;
    }
    return true;
  };
  const routeClashes=[];
  for(const route of SIM.electrical.routes) for(const p of boxes)
    if(route.points.slice(1).some((point,i)=>segmentHits(route.points[i],point,p.box)))routeClashes.push({route:route.id,pier:p.name});
  assert.deepEqual(routeClashes,[],`Modeled route centrelines intersect new pilasters: ${JSON.stringify(routeClashes)}`);
  console.log(JSON.stringify({lowerPilasters:'passed',shaftFaces:boxes.length,fixtureEnvelopes:SIM.fixtures.size,clashes,
    routeCentrelines:SIM.electrical.routes.length,routeClashes,
    limits:'Axis-aligned fixture and route-centreline screen only; cable thickness, brackets, lamp aims, access and construction require specialist coordination.'}));
} finally {study.dispose();}
