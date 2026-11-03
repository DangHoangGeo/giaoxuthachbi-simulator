/* Conservative AABB screen of wing roof proxies against relevant installed fittings.
 * Not a manufacturer clearance, connection, sweep, service-space or capacity approval. */
'use strict';
const assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const study=loadStudyModel(),{SIM,model}=study,T=model.THREE;
try {
  model.scene.updateMatrixWorld(true);
  const members=SIM.GEO.wingRoof.group.children.filter(m=>m.userData.memberId);
  const fittings=[...SIM.fixtures.values()].filter(f=>f.item.circuit==='F5'||f.item.circuit==='V2'||/^Wing speaker/.test(f.item.name)||/^D-WING-/.test(f.item.id));
  assert.equal(members.length,38); assert(fittings.length>=14,'expected wing fans, speakers, pictures and exhaust fans');
  let comparisons=0;
  for(const m of members) for(const f of fittings) {
    if(Math.sign(m.position.z)!==Math.sign(f.item.pos[2])) continue;
    const a=new T.Box3().setFromObject(m), b=new T.Box3().setFromObject(f.root);
    assert(!a.intersectsBox(b),`${m.userData.memberId} intersects ${f.item.id} in AABB screen`);
    comparisons++;
  }
  const heads=[...SIM.fixtures.values()].filter(f=>/^L-WING-/.test(f.item.id));
  assert.equal(heads.length,8);
  for(const f of heads) {
    const anchor=new T.Vector3(f.item.pos[0],f.item.anchorY,f.item.pos[2]);
    const supports=members.filter(m=>{ if(m.userData.structuralRole!=='wing purlin') return false; const q=m.worldToLocal(anchor.clone()); return Math.abs(q.y + 0.11)<0.005 && Math.abs(q.x)<0.07 && Math.abs(q.z)<m.geometry.parameters.depth/2; });
    assert(supports.length, f.item.id+' canopy anchor must touch a modeled purlin');
  }
  console.log(JSON.stringify({wingRoofFittings:'passed',members:members.length,fittings:fittings.length,comparisons,anchoredHeads:heads.length,constructionApproved:false}));
} finally {study.dispose();}
