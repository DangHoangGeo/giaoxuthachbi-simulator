/* Check the continuous nave lining and purlins across the crossing, plus non-overlapping wing linings.
 * This checks the display model only, not the design or capacity of the roof junction. */
'use strict';
const assert=require('node:assert/strict');
const {loadStudyModel}=require('./lib/study_model.cjs');
const study=loadStudyModel(), {SIM,model}=study, T=model.THREE;
try {
  model.scene.updateMatrixWorld(true);
  const ridge=40.575, half=3.44, edge=7.25, end=13.099;
  const mainY=z=>12.282-(12.472-7.13)/7.36*Math.abs(z);
  const wingY=x=>9.26-(9.45-6.325)/3.88*Math.abs(x-ridge);
  const wing=SIM.GEO.wingRoof.group.children.filter(o=>o.name==='Proposed timber lining under the wing roof planes');
  assert.equal(wing.length,4,'both slopes on both wings');
  for(const m of wing) {
    const p=m.geometry.attributes.position,idx=m.geometry.index; assert.equal(p.count,4);assert.equal(idx.count,6);
    let area=0;
    for(let i=0;i<p.count;i++){assert(Math.abs(p.getZ(i))>=edge-0.00002,'wing lining stays outside main ceiling');assert(Math.abs(p.getY(i)-wingY(p.getX(i)))<0.00002,'wing lining follows its roof plane');}
    for(let k=0;k<idx.count;k+=3){const a=idx.getX(k),b=idx.getX(k+1),c=idx.getX(k+2);area+=Math.abs((p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a))-(p.getX(c)-p.getX(a))*(p.getZ(b)-p.getZ(a)))/2;}
    assert(Math.abs(area-half*(end-edge))<0.0002,'wing plane covers its entire intended outline');
  }
  const nave=[];model.building.traverse(o=>{if(o.isMesh&&o.name==='Proposed timber lining under the source roof planes')nave.push(o);});
  assert.equal(nave.length,2,'both main lining slopes');
  for(const sign of [-1,1]) for(const x of [37,39,40.575,42,44]) for(const z of [4.5,5.5,6.5,7.0]) {
    const ray=new T.Raycaster(new T.Vector3(x,20,sign*z),new T.Vector3(0,-1,0));
    const hits=ray.intersectObjects(nave,false);assert(hits.length,`main lining missing at ${x}, ${sign*z}`);
    assert(Math.abs(hits[0].point.y-mainY(z))<0.001,'main surface follows its analytical ceiling');
    const ceiling=SIM.structureAbove(x,sign*z,7.1); if(mainY(z)>7.1)assert(ceiling&&Math.abs(ceiling.y-mainY(z))<1e-8,'analysis uses the same main ceiling');
  }
  const purlins=[];model.scene.traverse(o=>{if(o.isMesh&&o.name==='Purlin · as drawn spacing ~0.50 m')purlins.push(o);});
  assert.equal(purlins.length,28,'fourteen purlins on each slope');
  for(const p of purlins){const box=new T.Box3().setFromObject(p);assert(box.min.x<5.5&&box.max.x>52.8,'visual purlin continues across the 9–10 crossing');}
  console.log(JSON.stringify({continuousNaveLining:'passed',navePurlins:purlins.length,wingPlanes:wing.length,constructionApproved:false}));
} finally {study.dispose();}
