/* Owner 25 Oct 2026: remove nave sconces above wall fans; put E1 signs
 * at door heads below coloured glass. Model coordinates / bracket proxies only. */
(()=>{
 'use strict';
 const revision='2026-10-25-doorheads-no-sconces-1';
 const before={
  "L82":{"id":"L82","type":"sconce2","name":"Sconce · axis 3 · B","circuit":"LD","mount":"wall","pos":[9.975,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L83":{"id":"L83","type":"sconce2","name":"Sconce · axis 3 · H","circuit":"LD","mount":"wall","pos":[9.975,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L84":{"id":"L84","type":"sconce2","name":"Sconce · axis 4 · B","circuit":"LD","mount":"wall","pos":[14.475,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L85":{"id":"L85","type":"sconce2","name":"Sconce · axis 4 · H","circuit":"LD","mount":"wall","pos":[14.475,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L86":{"id":"L86","type":"sconce2","name":"Sconce · axis 5 · B","circuit":"LD","mount":"wall","pos":[18.975,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L87":{"id":"L87","type":"sconce2","name":"Sconce · axis 5 · H","circuit":"LD","mount":"wall","pos":[18.975,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L88":{"id":"L88","type":"sconce2","name":"Sconce · axis 6 · B","circuit":"LD","mount":"wall","pos":[23.475,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L89":{"id":"L89","type":"sconce2","name":"Sconce · axis 6 · H","circuit":"LD","mount":"wall","pos":[23.475,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L90":{"id":"L90","type":"sconce2","name":"Sconce · axis 7 · B","circuit":"LD","mount":"wall","pos":[27.975,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L91":{"id":"L91","type":"sconce2","name":"Sconce · axis 7 · H","circuit":"LD","mount":"wall","pos":[27.975,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L92":{"id":"L92","type":"sconce2","name":"Sconce · axis 8 · B","circuit":"LD","mount":"wall","pos":[32.475,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L93":{"id":"L93","type":"sconce2","name":"Sconce · axis 8 · H","circuit":"LD","mount":"wall","pos":[32.475,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L94":{"id":"L94","type":"sconce2","name":"Sconce · axis 9 · B","circuit":"LD","mount":"wall","pos":[36.975,5,-7.07],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L95":{"id":"L95","type":"sconce2","name":"Sconce · axis 9 · H","circuit":"LD","mount":"wall","pos":[36.975,5,7.07],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L155":{"id":"L155","type":"exitSign","name":"Exit sign · main doors","circuit":"E1","mount":"wall","pos":[5.2,6.95,0],"yaw":0,"tilt":0,"mountYaw":0,"params":{},"shadow":false},
  "L156":{"id":"L156","type":"exitSign","name":"Exit sign · side door 16.7 · B","circuit":"E1","mount":"wall","pos":[16.725,4.6,-7.245],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L157":{"id":"L157","type":"exitSign","name":"Exit sign · side door 16.7 · H","circuit":"E1","mount":"wall","pos":[16.725,4.6,7.245],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false},
  "L158":{"id":"L158","type":"exitSign","name":"Exit sign · side door 34.7 · B","circuit":"E1","mount":"wall","pos":[34.725,4.6,-7.245],"yaw":90,"tilt":0,"mountYaw":90,"params":{},"shadow":false},
  "L159":{"id":"L159","type":"exitSign","name":"Exit sign · side door 34.7 · H","circuit":"E1","mount":"wall","pos":[34.725,4.6,7.245],"yaw":-90,"tilt":0,"mountYaw":-90,"params":{},"shadow":false}
 }; // Frozen immediately preceding default records.
 const geometryCache=new WeakMap();
 function geometry(SIM){
  const scene=SIM.church.scene;
  if(geometryCache.has(scene))return geometryCache.get(scene);
  const T=SIM.THREE,bands=[],transoms=[];
  SIM.church.scene.updateMatrixWorld(true);
  SIM.church.scene.traverse(o=>{
   if(!o.isMesh)return;
   if(o.name==='Inner door head band 220 mm')bands.push(new T.Box3().setFromObject(o));
   if(o.name==='Entrance transom')transoms.push(new T.Box3().setFromObject(o));
  });
  const found={bands,main:transoms.find(b=>Math.abs((b.min.z+b.max.z)/2)<.1)};
  geometryCache.set(scene,found);return found;
 }
 const sconces=it=>/^Sconce · axis [3-9] · [BH]$/.test(it.name);
 function apply(items,GEO,SIM){
  const g=geometry(SIM);
  if(!g.main||g.bands.length!==4)throw new Error('Door-head geometry changed; review sign supports before updating defaults.');
  for(const it of items.filter(it=>it.type==='exitSign')){
   if(it.name==='Exit sign · main doors'){
    const y=g.main.min.y-.095;
    it.pos=[g.main.max.x+.08,y,0];
    it.params={backReach:.08,clipRise:(g.main.min.y+g.main.max.y)/2-y};
    it.note='CONCEPT: inside-face transom clip, case below the coloured fanlight. Lowest edge about 4.68 m; support/door clearance and sign visibility need fire/architectural review. E1 remains maintained from DB-1.';
   }else{
    const s=Math.sign(it.pos[2]),b=g.bands.find(b=>Math.abs((b.min.x+b.max.x)/2-it.pos[0])<.01&&Math.sign(b.min.z+b.max.z)===s);
    if(!b)throw new Error('Missing door-head band for '+it.id);
    it.pos=[it.pos[0],(b.min.y+b.max.y)/2,s<0?b.max.z:b.min.z];
    it.note='CONCEPT: mounted on the 220 mm fixed head band above the door leaves and below the coloured fanlight. E1 remains maintained from DB-1. Product, fixing, visibility and emergency operation require review.';
   }
  }
  for(let n=items.length-1;n>=0;n--)if(sconces(items[n]))items.splice(n,1);
 }
 const angle=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
 const params=p=>Object.fromEntries(Object.entries(p||{}).filter(([k,v])=>!(['backReach','clipRise'].includes(k)&&v===0)).sort(([a],[b])=>a.localeCompare(b)));
 function same(it,old){
  return !!it&&it.id===old.id&&it.type===old.type&&it.name===old.name&&it.mount===old.mount&&it.circuit===old.circuit&&!it.hidden&&
   it.pos.every((v,n)=>Math.abs(v-old.pos[n])<.005)&&angle(it.yaw??0,old.yaw??0)<.01&&angle(it.mountYaw??it.yaw??0,old.mountYaw??old.yaw??0)<.01&&
   Math.abs((it.tilt??0)-(old.tilt??0))<.01&&['lumens','beam','cct','shadow','anchorY'].every(k=>(it[k]??null)===(old[k]??null))&&JSON.stringify(params(it.params))===JSON.stringify(params(old.params));
 }
 function upgrade(items,design){
  const next=new Map(design.map(it=>[it.id,it]));
  return items.flatMap(it=>{
   const old=before[it.id];
   const priorMain=old?.id==='L155'?{...old,pos:[2.65,6.95,0]}:null;
   if(!old||(!same(it,old)&&!same(it,priorMain||old)))return[it];
   if(sconces(old))return[];
   const raw=next.get(it.id);
   return raw?[{...raw,on:it.on,dim:it.dim,hidden:it.hidden,note:it.note||raw.note}]:[it];
  });
 }
 window.CHURCH_DOORHEAD_REVIEW={revision,before,geometry,apply,upgrade};
})();
