/* Verify wing lining planes, coverage and valley seam against the actual generated meshes. */
'use strict';
const assert = require('node:assert/strict');
const {loadStudyModel} = require('./lib/study_model.cjs');
const study = loadStudyModel(), {SIM, model} = study;
try {
  const roof = SIM.GEO.wingRoof, group = roof.group;
  const meshes = group.children.filter(m => m.name === 'Proposed timber lining under the wing roof planes');
  assert.equal(meshes.length, 4, 'one lining per wing and slope');
  const ridge = 40.575, wingY = x => 9.26 - (9.45 - 6.325) / 3.88 * Math.abs(x - ridge);
  const naveY = z => 12.282 - (12.472 - 7.13) / 7.36 * Math.abs(z);
  const apex = (12.472 - 9.45) / ((12.472 - 7.13) / 7.36);
  const cut = (7.25 - apex) * ((12.472 - 7.13) / 7.36) / ((9.45 - 6.325) / 3.88);
  const half = 3.44, end = 13.099;
  for (const m of meshes) {
    const p=m.geometry.attributes.position, idx=m.geometry.index;
    assert.equal(p.count,5); assert.equal(idx.count,9);
    for(let i=0;i<p.count;i++) assert(Math.abs(p.getY(i)-wingY(p.getX(i)))<0.00002,'wing vertex follows analysis plane');
    let area=0;
    for(let k=0;k<idx.count;k+=3) {
      const a=idx.getX(k), b=idx.getX(k+1), c=idx.getX(k+2);
      const x=(p.getX(a)+p.getX(b)+p.getX(c))/3, z=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
      const dx=Math.abs(x-ridge), az=Math.abs(z);
      assert(az>=7.25 || dx <= cut*(az-apex)/(7.25-apex)+1e-5,'triangle must not cross into nave lining');
      area+=Math.abs((p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a))-(p.getX(c)-p.getX(a))*(p.getZ(b)-p.getZ(a)))/2;
    }
    const expected=half*(end-7.25)+cut*(7.25-apex)/2;
    assert(Math.abs(area-expected)<0.0002,'triangles cover outline exactly');
    assert(Math.abs(wingY(ridge+cut)-naveY(7.25))<1e-10,'seam planes meet at eave');
  }
  const naveMeshes = [];
  model.building.traverse(o => { if (o.isMesh && o.name === 'Proposed timber lining under the source roof planes') naveMeshes.push(o); });
  assert.equal(naveMeshes.length, 2, 'both nave lining slopes remain available');
  for (const m of naveMeshes) {
    const p=m.geometry.attributes.position;
    for(const side of [-1,1]) {
      let found=false;
      for(let i=0;i<p.count;i++) if(Math.abs(p.getX(i)-(ridge+side*cut))<0.00002 && Math.abs(Math.abs(p.getZ(i))-7.25)<0.00002 && Math.abs(p.getY(i)-naveY(7.25))<0.00002) found=true;
      assert(found, 'nave mesh shares the exact valley endpoint');
    }
  }
  for(const sign of [-1,1]) for(const t of [-1,1]) for(const z of [4.6,5.5,6.8,7.25,8.8,11.4]) {
    const dx = z<7.25 ? cut*(z-apex)/(7.25-apex)*0.5 : 1.635;
    const x=ridge+t*dx;
    // Above 7.25 the analysis may meet other legitimate supports; sample above those.
    const a=SIM.structureAbove(x,sign*z,7.1);
    assert(a && Math.abs(a.y-wingY(x))<1e-8,`analysis ceiling matches wing plane at ${x}, ${z}`);
  }
  console.log(JSON.stringify({wingRoofLining:'passed', meshes:meshes.length, valleyCutDxM:cut, seamLevelM:naveY(7.25), constructionApproved:false}));
} finally { study.dispose(); }
