/* Open-porch light/sound review, owner 25 Oct 2026. Metres; model-only concepts.
 * Geometry basis: porches.js. No product, fixing, glare or commissioning approval.
 * A scoped migration preserves moved, deleted, hidden and retuned user records. */
(() => {
  'use strict';
  const revision='2026-10-25-open-porch-light-sound-1';
  const bays=[['2′','3'],['3','4'],['4','5'],['5','6'],['6','7'],['7','8'],['8','9'],['10','11'],['11','12']];
  const side=s=>s<0?'B':'H',code=b=>b.join('-').replace('′','P');
  const aim=(from,to)=>{const x=to[0]-from[0],y=to[1]-from[1],z=to[2]-from[2];return{yaw:Math.atan2(z,x)*180/Math.PI,tilt:Math.atan2(y,Math.hypot(x,z))*180/Math.PI};};
  const floodHead=(p,s)=>[p[0],p[1]+.035,p[2]+s*.15];
  const before={
    "L119":{"id":"L119","type":"lantern","name":"Veranda lantern · B · axis 3","pos":[9.975,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L120":{"id":"L120","type":"lantern","name":"Veranda lantern · B · axis 4","pos":[14.475,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L121":{"id":"L121","type":"lantern","name":"Veranda lantern · B · axis 5","pos":[18.975,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L122":{"id":"L122","type":"lantern","name":"Veranda lantern · B · axis 6","pos":[23.475,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L123":{"id":"L123","type":"lantern","name":"Veranda lantern · B · axis 7","pos":[27.975,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L124":{"id":"L124","type":"lantern","name":"Veranda lantern · B · axis 8","pos":[32.475,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L125":{"id":"L125","type":"lantern","name":"Veranda lantern · B · axis 9","pos":[36.375,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":6.638660220994475,"params":{}},
    "L126":{"id":"L126","type":"lantern","name":"Veranda lantern · B · axis 10","pos":[44.775,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":6.638660220994475,"params":{}},
    "L127":{"id":"L127","type":"lantern","name":"Veranda lantern · B · axis 11","pos":[48.675,4.55,-8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L128":{"id":"L128","type":"lantern","name":"Veranda lantern · H · axis 3","pos":[9.975,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L129":{"id":"L129","type":"lantern","name":"Veranda lantern · H · axis 4","pos":[14.475,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L130":{"id":"L130","type":"lantern","name":"Veranda lantern · H · axis 5","pos":[18.975,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L131":{"id":"L131","type":"lantern","name":"Veranda lantern · H · axis 6","pos":[23.475,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L132":{"id":"L132","type":"lantern","name":"Veranda lantern · H · axis 7","pos":[27.975,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L133":{"id":"L133","type":"lantern","name":"Veranda lantern · H · axis 8","pos":[32.475,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "L134":{"id":"L134","type":"lantern","name":"Veranda lantern · H · axis 9","pos":[36.375,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":6.638660220994475,"params":{}},
    "L135":{"id":"L135","type":"lantern","name":"Veranda lantern · H · axis 10","pos":[44.775,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":6.638660220994475,"params":{}},
    "L136":{"id":"L136","type":"lantern","name":"Veranda lantern · H · axis 11","pos":[48.675,4.55,8.85],"yaw":0,"tilt":0,"mount":"pendant","mountYaw":0,"circuit":"L4","lumens":2000,"shadow":false,"anchorY":4.717598931983812,"params":{}},
    "S261":{"id":"S261","type":"slimColumn","name":"Wall speaker · axis 4 · B","pos":[14.045,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":87,"params":{}},
    "S262":{"id":"S262","type":"slimColumn","name":"Wall speaker · axis 4 · H","pos":[14.045,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":88.7,"params":{}},
    "S263":{"id":"S263","type":"slimColumn","name":"Wall speaker · axis 5 · B","pos":[18.545,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":74.1,"params":{}},
    "S264":{"id":"S264","type":"slimColumn","name":"Wall speaker · axis 5 · H","pos":[18.545,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":76.1,"params":{}},
    "S265":{"id":"S265","type":"slimColumn","name":"Wall speaker · axis 6 · B","pos":[23.045,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":61.2,"params":{}},
    "S266":{"id":"S266","type":"slimColumn","name":"Wall speaker · axis 6 · H","pos":[23.045,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":63.5,"params":{}},
    "S267":{"id":"S267","type":"slimColumn","name":"Wall speaker · axis 7 · B","pos":[27.545,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":48.3,"params":{}},
    "S268":{"id":"S268","type":"slimColumn","name":"Wall speaker · axis 7 · H","pos":[27.545,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":51.2,"params":{}},
    "S269":{"id":"S269","type":"slimColumn","name":"Wall speaker · axis 8 · B","pos":[32.045,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":35.5,"params":{}},
    "S270":{"id":"S270","type":"slimColumn","name":"Wall speaker · axis 8 · H","pos":[32.045,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":39.1,"params":{}},
    "S271":{"id":"S271","type":"slimColumn","name":"Wall speaker · axis 9 · B","pos":[36.545,3.45,-7.25],"yaw":140,"tilt":-22,"mount":"wall","mountYaw":90,"circuit":"A1","level":-6,"delayMs":22.7,"params":{}},
    "S272":{"id":"S272","type":"slimColumn","name":"Wall speaker · axis 9 · H","pos":[36.545,3.45,7.25],"yaw":-140,"tilt":-22,"mount":"wall","mountYaw":-90,"circuit":"A1","level":-6,"delayMs":27.8,"params":{}},
    "S273":{"id":"S273","type":"slimColumn","name":"Wall speaker · entrance hall · B","pos":[5.205,3.6,-3.05],"yaw":-13.476847157206873,"tilt":-45.481658665527036,"mount":"wall","mountYaw":0,"circuit":"A5","level":-9,"delayMs":100.9,"params":{}},
    "S274":{"id":"S274","type":"slimColumn","name":"Wall speaker · entrance hall · H","pos":[5.205,3.6,3.05],"yaw":13.476847157206873,"tilt":-45.481658665527036,"mount":"wall","mountYaw":0,"circuit":"A5","level":-9,"delayMs":102.5,"params":{}},
    "S279":{"id":"S279","type":"pendantSpeaker","name":"Veranda fill · B · 12.2","pos":[12.225,3.9,-8.85],"yaw":0,"tilt":-90,"mount":"pendant","mountYaw":0,"circuit":"A2","level":-7,"delayMs":88.8,"anchorY":6.638660220994475,"params":{}},
    "S280":{"id":"S280","type":"pendantSpeaker","name":"Veranda fill · B · 25.7","pos":[25.725,3.9,-8.85],"yaw":0,"tilt":-90,"mount":"pendant","mountYaw":0,"circuit":"A2","level":-7,"delayMs":50.9,"anchorY":6.638660220994475,"params":{}},
    "S281":{"id":"S281","type":"pendantSpeaker","name":"Veranda fill · H · 12.2","pos":[12.225,3.9,8.85],"yaw":0,"tilt":-90,"mount":"pendant","mountYaw":0,"circuit":"A2","level":-7,"delayMs":92.3,"anchorY":6.638660220994475,"params":{}},
    "S282":{"id":"S282","type":"pendantSpeaker","name":"Veranda fill · H · 25.7","pos":[25.725,3.9,8.85],"yaw":0,"tilt":-90,"mount":"pendant","mountYaw":0,"circuit":"A2","level":-7,"delayMs":56.8,"anchorY":6.638660220994475,"params":{}}
  };
  function apply(items,GEO){
    const A=GEO.axes,P=window.CHURCH_PORCHES.spec;
    for(const s of [-1,1]){
      const oldLights=items.filter(it=>it.name.startsWith(`Veranda lantern · ${side(s)} ·`));
      const oldSpeakers=items.filter(it=>it.name.startsWith(`Veranda fill · ${side(s)} ·`));
      bays.forEach((bay,n)=>{
        const x0=A[bay[0]],x1=A[bay[1]],mid=(x0+x1)/2,B=side(s),tag=code(bay);
        const path=[x1-.43,3.1,s*P.innerFace];
        Object.assign(oldLights[n],{type:'porchFlood',name:`Porch path light · ${B} · bay ${bay.join('–')}`,mount:'wall',pos:path,anchorY:path[1],mountYaw:s*90,...aim(floodHead(path,s),[mid,P.floor+.02,s*8.85]),lumens:900,beam:90,shadow:false,
          note:'CONCEPT: compact wall flood for the open porch walking surface, on the inner masonry beside its pier. Product photometry, shielding, weather protection, driver access and fixing pending.'});
        for(const [end,key] of [[0,'A'],[1,'B']]){
          const p=[(end?x1:x0)+(end?-.075:.075),2.6,s*(P.lineZ+P.column.half+P.column.pilaster)];
          items.push({id:`L-ARCH-${B}-${tag}-${key}`,type:'porchFlood',name:`Porch arch wash · ${B} · bay ${bay.join('–')} · ${key}`,circuit:'L4',mount:'wall',pos:p,anchorY:p[1],mountYaw:s*90,...aim(floodHead(p,s),[mid+(end ? .45 : -.45),5.35,s*(P.lineZ+P.column.half+.05)]),lumens:750,beam:45,shadow:false,
            note:'CONCEPT: outside face of the arcade column, cross-aimed upward onto its pointed arch. Not a ground obstruction. Final beam, shielding/spill, weather protection, fixing and safe access require review.'});
        }
        const p=[x1-.43,2.7,s*P.innerFace],target=[mid,P.floor+1.2,s*8.85];
        const old=n===1?oldSpeakers[0]:n===4?oldSpeakers[1]:null;
        const next={id:old?.id||`S-PORCH-${B}-${tag}`,type:'porchWallSpeaker',name:`Porch fill · ${B} · bay ${bay.join('–')}`,circuit:'A2',mount:'wall',pos:p,anchorY:p[1],mountYaw:s*90,...aim([p[0],p[1],p[2]+s*.14],target),level:-16,delayMs:0,
          note:'CONCEPT: low-level wall fill, one per open porch bay including 10–12. Passive speaker rating is not mains demand. Outdoor enclosure/directivity, fixings, delay, spill and commissioning pending.'};
        if(old)Object.assign(old,next);else items.push(next);
      });
    }
    for(const it of items){
      if(/^Wall speaker · axis/.test(it.name)){it.pos=[it.pos[0],2.5,it.pos[2]];it.anchorY=2.5;it.tilt=-14;}
      else if(/^Wall speaker · entrance hall/.test(it.name)){it.pos=[it.pos[0],2.5,it.pos[2]];it.anchorY=2.5;Object.assign(it,aim(it.pos,[7.5,1.2,Math.sign(it.pos[2])*3.6]));}
    }
  }
  const angle=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
  function same(it,old){
    return it&&old&&it.type===old.type&&it.mount===old.mount&&it.circuit===old.circuit&&it.name===old.name&&!it.hidden&&
      Array.isArray(it.pos)&&it.pos.every((v,i)=>Math.abs(v-old.pos[i])<.005)&&angle(it.yaw??0,old.yaw??0)<.01&&Math.abs((it.tilt??0)-(old.tilt??0))<.01&&
      Math.abs((it.level??0)-(old.level??0))<.01&&Math.abs((it.delayMs??0)-(old.delayMs??0))<.11&&
      angle(it.mountYaw??it.yaw??0,old.mountYaw??old.yaw??0)<.01&&
      ['lumens','beam','cct','shadow','anchorY'].every(k=>(it[k]??null)===(old[k]??null))&&
      JSON.stringify(it.params??{})===JSON.stringify(old.params??{});
  }
  // Recorded entrance-wall defaults before the separate door relocation. This
  // height review keeps their X/Z rather than adopting another wall revision.
  const earlierEntrance={
    S273:{...before.S273,pos:[2.655,3.6,-3.05],yaw:-6.476440087185079,tilt:-26.206172946093037,delayMs:95},
    S274:{...before.S274,pos:[2.655,3.6,3.05],yaw:6.476440087185079,tilt:-26.206172946093037,delayMs:96.5}
  };
  function upgrade(items,design){
    const next=new Map(design.map(it=>[it.id,it])),have=new Map(items.map(it=>[it.id,it])),replace=new Map(),extra=[];
    for(const s of [-1,1]){
      const old=Object.values(before).filter(it=>/^Veranda (lantern|fill) ·/.test(it.name)&&Math.sign(it.pos[2])===s);
      // A missing or customised record keeps the entire side as its user's layout.
      if(!old.every(it=>same(have.get(it.id),it)||same(have.get(it.id),next.get(it.id))))continue;
      for(const it of old)replace.set(it.id,next.get(it.id));
      for(const it of design)if((it.id.startsWith(`L-ARCH-${side(s)}-`)||it.id.startsWith(`S-PORCH-${side(s)}-`))&&!have.has(it.id)){
        const primary=it.circuit==='L4'?design.find(p=>p.name.startsWith(`Porch path light · ${side(s)} ·`)&&it.name.includes(p.name.split(' · ').at(-1))):null;
        const reference=have.get(primary?.id)||have.get(old.find(p=>p.circuit===it.circuit)?.id);
        extra.push({...it,on:reference?.on??it.on,dim:reference?.dim??it.dim});
      }
    }
    for(const old of Object.values(before).filter(it=>/^Wall speaker · (axis|entrance hall)/.test(it.name))){
      const it=have.get(old.id);
      if(!same(it,old)&&!same(it,earlierEntrance[old.id]))continue;
      const raw=next.get(old.id);
      if(earlierEntrance[old.id]){
        const pos=[it.pos[0],2.5,it.pos[2]];
        replace.set(old.id,{...raw,pos,...aim(pos,[7.5,1.2,Math.sign(pos[2])*3.6])});
      }else replace.set(old.id,raw);
    }
    return items.map(it=>{
      const raw=replace.get(it.id);return raw?{...raw,on:it.on??raw.on,dim:it.dim??raw.dim,hidden:it.hidden??raw.hidden,note:it.note||raw.note}:it;
    }).concat(extra);
  }
  window.CHURCH_VERANDA_REVIEW={revision,bays,before,apply,upgrade};
})();
