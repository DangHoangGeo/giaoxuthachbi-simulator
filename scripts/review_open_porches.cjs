/* Comparative open-porch review. Uses every original seat and fixed surface /
 * walking probes on both sides. No changed physics, thresholds or receiver grid.
 * Direct outdoor sound/light are reported separately from the room proxy. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {loadStudyModel,root}=require('./lib/study_model.cjs');
const out=path.join(root,'review/veranda-sound-2026-10-25'),clone=x=>JSON.parse(JSON.stringify(x));
const stats=values=>({n:values.length,min:Math.min(...values),max:Math.max(...values),mean:values.reduce((a,b)=>a+b,0)/values.length});
(async()=>{
 const ctx=loadStudyModel(),{SIM,model,P}=ctx,T=model.THREE;
 try{
  const recommended=clone(SIM.exportLayout()),baseline=JSON.parse(fs.readFileSync(path.join(out,'baseline-layout.json'),'utf8'));
  const B=SIM.GEO.axes,porch=SIM.state.items.filter(i=>i.type==='porchWallSpeaker'),bayList=[["2′","3"],["3","4"],["4","5"],["5","6"],["6","7"],["7","8"],["8","9"],["10","11"],["11","12"]];
  const nodes=[];model.building.traverse(o=>{if(o.isMesh&&o.name==='Porch arch moulding')nodes.push(o)});model.building.updateMatrixWorld(true);
  const arch=[],walk=[];
  for(const s of [-1,1])for(const bay of bayList){
   const mid=(B[bay[0]]+B[bay[1]])/2,half=(B[bay[1]]-B[bay[0]])/2-.18,c=(2.6**2-half**2)/(2*half),radius=half+c,end=Math.atan2(2.6,c);
   for(const edge of [-1,1])for(const frac of [.2,.5,.8]){
    const t=end*frac,x=mid+edge*(-c+radius*Math.cos(t)),y=3+radius*Math.sin(t)+.055;
    const ray=new T.Raycaster(new T.Vector3(x,y,s*15),new T.Vector3(0,0,-s),0,6);
    const hit=ray.intersectObjects(nodes,false)[0];assert(hit,'Surface probe intersects actual arch moulding: '+bay+' '+x+' '+y);
    arch.push({side:s<0?'B':'H',bay:bay.join('–'),p:hit.point.toArray(),normal:[0,0,s]});
   }
   for(const f of [.2,.5,.8])for(const z of [8.0,8.85,9.8])walk.push({side:s<0?'B':'H',bay:bay.join('–'),p:[B[bay[0]]+(B[bay[1]]-B[bay[0]])*f,.88,s*z]});
  }
  const selected=process.argv.find(a=>a.startsWith('--gain='));
  const requested=selected?Number(selected.slice(7)):null;
  assert(!selected||Number.isFinite(requested),'Valid requested gain');
  const results=selected?JSON.parse(fs.readFileSync(path.join(out,'porch-comparison.json'),'utf8')).results.filter(r=>r.gain!==requested):[];
  for(const gain of selected?[requested]:[null,-16,-15,-12,-9]){
   SIM.importLayout(clone(gain===null?baseline:recommended),{record:false});SIM.applyScene('Full service · evening',{record:false});
   if(gain!==null)for(const it of porch)SIM.update(it.id,{level:gain},{record:false});
   SIM.alignDelays({record:false});
   const seats=clone((await ctx.analyse()).seats),sources=SIM.speakers().filter(s=>s.on&&s.item.circuit==='A2'),allLights=SIM.emitters(),lights=allLights.filter(e=>SIM.item(e.id)?.circuit==='L4');
   assert(lights.length>0,'L4 optical sources are included in the direct-light review');
   const directSound=rx=>{
    const arrivals=sources.map(s=>P.sourceArrivals(s.src,s.spec,rx,SIM.room(),SIM.GEO.occluders));
    return P.dbaFromBands(Array.from({length:7},(_,b)=>P.db(arrivals.reduce((sum,a)=>sum+a.direct[b],0))));
   };
   const paths=walk.map(p=>({...p,floorLuxDirect:P.illuminance([p.p[0],-.30,p.p[2]],[0,1,0],lights,SIM.GEO.occluders)*SIM.state.settings.maintenance,floorLuxAllSourcesDirect:P.illuminance([p.p[0],-.30,p.p[2]],[0,1,0],allLights,SIM.GEO.occluders)*SIM.state.settings.maintenance,speechA2Direct:directSound(p.p)}));
   const arches=arch.map(p=>({...p,luxDirect:P.illuminance(p.p,p.normal,lights,SIM.GEO.occluders)*SIM.state.settings.maintenance}));
   const nave=seats.seats.filter(s=>s.block!=='wing'),wing=seats.seats.filter(s=>s.block==='wing');
   const record={id:gain===null?'previous':'new-gain'+gain,gain,nave:{sti:stats(nave.map(s=>s.sti)),goodPct:100*nave.filter(s=>s.sti>=.6).length/nave.length,spl:stats(nave.map(s=>s.spl))},wing:{sti:stats(wing.map(s=>s.sti))},mics:SIM.mics().map(m=>({id:m.id,margin:m.item.feedbackMargin})),paths,arches,
    bySide:Object.fromEntries(['B','H'].map(side=>[side,{pathLuxDirect:stats(paths.filter(p=>p.side===side).map(p=>p.floorLuxDirect)),pathLuxAllSourcesDirect:stats(paths.filter(p=>p.side===side).map(p=>p.floorLuxAllSourcesDirect)),speechA2Direct:stats(paths.filter(p=>p.side===side).map(p=>p.speechA2Direct)),archLuxDirect:stats(arches.filter(p=>p.side===side).map(p=>p.luxDirect))}]))};
   results.push(record);console.log(JSON.stringify({...record,paths:undefined,arches:undefined}));
  }
  fs.writeFileSync(path.join(out,'porch-comparison.json'),JSON.stringify({status:'CONCEPT estimates; direct exterior metrics are not commissioned STI/lux',planes:{porchFloor:-.32,ear:.88,lightPlane:-.30},limitations:['Generic category optics/directivity, no selected IES/LDT or measured sound data','Porch arch probes intersect actual moulding meshes; lux uses existing simplified occluders, not a full ray-traced reflection/glare study','Direct A2 speech excludes the room reverberation proxy, reflected sound, wind and crowd noise','Room STI used only for unchanged indoor receivers; no outdoor STI approval'],results},null,2)+'\n');
 }finally{ctx.dispose()}
})().catch(e=>{console.error(e);process.exitCode=1});
