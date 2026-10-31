/* Fresh default model snapshot for the Python drawing builder; never reads browser storage. */
'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),cp=require('node:child_process');
const {loadStudyModel,sources}=require('./lib/study_model.cjs');

// Building context for the paper set: plane cuts through the actual viewer meshes.
// Furniture, trees, joinery leaves and glass are left out so walls, piers and columns read clearly.
const SECTION_GROUPS=[/^Exterior and openings/,/^Grid driven structure/,/^Timber frame · as drawn/,/^Reference sanctuary/,/^Sanctuary seating and service room/];
const SECTION_SKIP=/glass|shutter|leaf|handle|chair|seat|pew|kneeler|planter|statue|figure/i;
function section(T,root,axis,value,keep){
  const v=[0,1,2].map(()=>new T.Vector3()),box=new T.Box3(),out=new Set(),A='xyz'[axis];
  const [u,w]=axis===1?['x','z']:['z','y'];
  for(const group of root.children) {
    if(!SECTION_GROUPS.some(r=>r.test(group.name))) continue;
    group.traverse(m=>{
      if(!m.isMesh||SECTION_SKIP.test(m.name)) return;
      const g=m.geometry; if(!g.boundingBox) g.computeBoundingBox();
      box.copy(g.boundingBox).applyMatrix4(m.matrixWorld);
      if(box.min[A]>value||box.max[A]<value) return;
      const pos=g.attributes.position,idx=g.index,n=idx?idx.count:pos.count;
      for(let i=0;i<n;i+=3) {
        for(let k=0;k<3;k++) v[k].fromBufferAttribute(pos,idx?idx.getX(i+k):i+k).applyMatrix4(m.matrixWorld);
        const pts=[];
        for(let k=0;k<3;k++) {
          const p=v[k],q=v[(k+1)%3],dp=p[A]-value,dq=q[A]-value;
          if((dp>0)!==(dq>0)) { const t=dp/(dp-dq); pts.push([p[u]+(q[u]-p[u])*t,p[w]+(q[w]-p[w])*t]); }
        }
        if(pts.length!==2||!keep(pts)) continue;
        const r=pts.map(p=>p.map(x=>Math.round(x*1000)/1000)).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
        if(r[0][0]!==r[1][0]||r[0][1]!==r[1][1]) out.add(JSON.stringify(r));
      }
    });
  }
  return [...out].sort().map(s=>JSON.parse(s));
}

const study=loadStudyModel();
try {
  const E=study.SIM.electrical, full=E.exportData();
  const circuits=[...new Set(full.components.filter(c=>!c.hiddenAlternative).map(c=>c.circuit))];
  const sheets=[];
  for(const circuit of ['distribution',...circuits]) {
    E.setReviewFilter({system:circuit==='distribution'?'distribution':'all',circuit:circuit==='distribution'?'all':circuit,board:'all',item:'all'});
    sheets.push({id:circuit,label:circuit==='distribution'?'Distribution and feeders':study.SIM.CIRCUITS[circuit].label,...E.reviewExport()});
  }
  const T=study.model.THREE; study.model.scene.updateMatrixWorld(true);
  const root=study.model.scene.children.find(c=>c.name.startsWith('Single shared'));
  const tower=study.towers?.spec||null;
  const sections={
    basis:'Plane cuts through the default viewer meshes (walls, piers, columns, sanctuary and tower fabric). MODEL TRANSCRIPTION / DERIVED; not a measured survey.',
    plan:{axes:['X','Z'],level:1.0,segments:section(T,root,1,1.0,()=>true)},
    towerFront:{axes:['Z','Y'],plane:0.05,segments:section(T,root,0,0.05,p=>Math.min(Math.abs(p[0][0]),Math.abs(p[1][0]))>6.3)}
  };
  const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
  const payload={schema:1,basis:'Fresh default model, not saved browser layout',gitRevision:cp.execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceFiles:Object.fromEntries([...sources,'scripts/lib/study_model.cjs'].map(p=>[p,hash(p)])),grid:study.model.data,full,sheets,steps:study.SIM.installationReview.steps,registerSystemsHash:hash('docs/electrical-grid/electrical-systems.json'),sections,towers:tower&&{revision:tower.revision,centre:tower.centre,core:tower.core,arch:tower.arch,blind:tower.blind,upperFront:tower.upperFront}};
  // One section segment per line keeps the tracked snapshot readable without a line per number.
  const segments={};
  for(const key of Object.keys(sections)) if(sections[key].segments) { segments[key]=sections[key].segments; sections[key].segments=`@@segments:${key}@@`; }
  const text=JSON.stringify(payload,null,2).replace(/"@@segments:(\w+)@@"/g,(_,key)=>'[\n'+segments[key].map(s=>'        '+JSON.stringify(s)).join(',\n')+'\n      ]');
  for(const key of Object.keys(segments)) sections[key].segments=segments[key];
  fs.writeFileSync(process.argv[2],text+'\n');
  console.log(`Exported ${full.components.filter(c=>!c.hiddenAlternative).length} installed components, ${full.routes.length} routes, ${sheets.length} drawing scopes, ${sections.plan.segments.length}/${sections.towerFront.segments.length} section segments.`);
} finally {study.dispose();}
