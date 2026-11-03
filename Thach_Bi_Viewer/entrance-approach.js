/* P05 approach outline and H-side ramp study, metres. NOT FOR CONSTRUCTION.
   The drawn plan does not establish ramp heights or construction; see
   docs/exterior-23102026/entrance-approach.md. */
(() => {
  const spec = {
    stair: { front: -9.219, side: 10.392, tread: .35, count: 10, lower: -2.08, upper: -.48, backB: -.499, backH: -3.159 },
    ramp: { x: -.9396, z: 13.5423, radius: 2, inner: .18, zStart: 10.392, xStart: .4604, xTurn: 4.0, xEnd: 5.4, width: 1.4, lower: -2.08, upper: -.48 }
  };
  function rampLayout() {
    const r=spec.ramp, first=r.z+r.inner, zStarts=[first, first+2, first+3.5, first+5, first+6.5];
    const initial=r.z-r.zStart, transition=r.xStart-r.x, length=r.xTurn-r.xStart;
    const slope=(r.upper-r.lower)/(initial+transition+5*length);
    const turnY=r.upper-initial*slope, startY=turnY-transition*slope;
    const lanes=zStarts.map((z,i)=>({z0:z,z1:z+r.width, from:startY-i*length*slope, to:startY-(i+1)*length*slope, forward:i%2===0}));
    return {slope,turnY,lanes};
  }
  function rampHeight(x,z) {
    const r=spec.ramp, {slope,turnY,lanes}=rampLayout();
    if(x>=r.x-r.radius && x<=r.x-r.inner && z>=r.zStart && z<=r.z) return r.upper-(z-r.zStart)*slope;
    const distance=Math.hypot(x-r.x,z-r.z);
    if(x<=r.x && z>=r.z && distance>=r.inner && distance<=r.radius) return turnY;
    if(x>=r.x && x<=r.xStart){
      const t=(x-r.x)/(r.xStart-r.x), outer=(r.z+r.radius)+(lanes[0].z1-(r.z+r.radius))*t;
      if(z>=lanes[0].z0 && z<=outer) return turnY-(x-r.x)*slope;
    }
    for(let i=0;i<lanes.length;i++) {
      const lane=lanes[i];
      if(x>=r.xStart && x<=r.xTurn && z>=lane.z0 && z<=lane.z1) {
        const t=lane.forward?(x-r.xStart)/(r.xTurn-r.xStart):(r.xTurn-x)/(r.xTurn-r.xStart);
        return lane.from+(lane.to-lane.from)*t;
      }
      if(i<lanes.length-1) {
        const end=lane.forward?x>=r.xTurn&&x<=r.xEnd:x>=r.x&&x<=r.xStart;
        if(end && z>=lane.z0 && z<=lanes[i+1].z1)return lane.to;
      } else if(x>=r.xTurn && x<=r.xEnd && z>=lane.z0 && z<=lane.z1)return r.lower;
    }
    return null;
  }
  function stairHeight(x,z) {
    const s=spec.stair, az=Math.abs(z), n=Math.max(0,Math.ceil((s.front-x)/s.tread-1e-7),Math.ceil((az-s.side)/s.tread-1e-7));
    if(n>=s.count || x>s.backB || x<s.front-(s.count-1)*s.tread-.001) return null;
    if(z>0 && az>s.side && x>s.backH) return null;
    if(z<0 && az>s.side && x>s.backB) return null;
    return s.upper - n*(s.upper-s.lower)/s.count;
  }
  function floorHeight(x,z) { return rampHeight(x,z) ?? stairHeight(x,z); }
  function prepare({THREE:T,building,plinth,mat,data}) {
    const old=[];
    building.traverse(o=>{if(o.isMesh&&(/^(Entrance forecourt|Schematic approach riser|Schematic approach handrail|Schematic baluster)/.test(o.name)))old.push(o);});
    old.forEach(o=>o.removeFromParent());
    const group=new T.Group();group.name='P05 entrance approach · drawing and ramp study';plinth.add(group);
    const s=spec.stair;
    function box(name,x0,x1,z0,z1,top,material,status) {
      if(x1<=x0||z1<=z0||top<=s.lower)return;
      const m=new T.Mesh(new T.BoxGeometry(x1-x0,top-s.lower,z1-z0),material);
      m.position.set((x0+x1)/2,(s.lower+top)/2,(z0+z1)/2);m.name=name;
      m.userData={status,source:'P05 sheet 5; 23102026, ISSUE-R06 open'};m.castShadow=m.receiveShadow=true;group.add(m);
    }
    box('Entrance forecourt plinth · P05',s.front,2.445,-s.side,s.side,s.upper-.12,mat.foundation,'MODEL TRANSCRIPTION / DEPTH CONCEPT');
    const deck=new T.Mesh(new T.BoxGeometry(2.445-s.front,.12,2*s.side),mat.floor);
    deck.name='Entrance forecourt · P05 top'; deck.position.set((2.445+s.front)/2,s.upper-.06,0);
    deck.userData={status:'P05 PLAN / FINISH CONCEPT',source:'P05 sheet 5'};deck.receiveShadow=true;group.add(deck);
    // Ten P05 U-shaped nosings, with heights inferred from the 1.60 m level change.
    for(let i=0;i<s.count;i++){
      const x=s.front-i*s.tread, edge=s.side+i*s.tread, top=s.upper-i*(s.upper-s.lower)/s.count;
      if(i===0)continue;
      box('Approach step · P05 front',x,s.front,-edge,edge,top,mat.floor,'P05 PLAN / RISER INFERRED / ACCESS HOLD');
      box('Approach step · P05 side B',s.front,s.backB,-edge,-s.side,top,mat.floor,'P05 PLAN / RISER INFERRED / ACCESS HOLD');
      box('Approach step · P05 side H',s.front,s.backH,s.side,edge,top,mat.floor,'P05 PLAN / RISER INFERRED / ACCESS HOLD');
    }
    const r=spec.ramp, {slope,turnY,lanes}=rampLayout(), positions=[], topIndices=[], supportIndices=[];
    // P05 source curve is retained; five short switchback runs and all levels
    // are a reversible circulation concept, awaiting coordinated design.
    function strip(rows) {
      const start=positions.length/3;
      for(const row of rows)for(const [x,z,y] of row)positions.push(x,y,z);
      for(let i=0;i<rows.length-1;i++){const a=start+2*i,b=a+1,c=a+2,d=a+3;topIndices.push(a,d,b,a,c,d);}
      const bottom=positions.length/3;
      for(const row of rows)for(const [x,z] of row)positions.push(x,s.lower-.12,z);
      for(let i=0;i<rows.length-1;i++) {
        const a=start+2*i,b=a+1,c=a+2,d=a+3,A=bottom+2*i,B=A+1,C=A+2,D=A+3;
        supportIndices.push(A,B,D,A,D,C,a,A,C,a,C,c,b,d,D,b,D,B);
      }
    }
    strip([[[r.x-r.radius,r.zStart,r.upper],[r.x-r.inner,r.zStart,r.upper]],[[r.x-r.radius,r.z,turnY],[r.x-r.inner,r.z,turnY]]]);
    const turn=[];for(let i=0;i<=24;i++){const a=Math.PI-i*Math.PI/48;turn.push([[r.x+r.radius*Math.cos(a),r.z+r.radius*Math.sin(a),turnY],[r.x+r.inner*Math.cos(a),r.z+r.inner*Math.sin(a),turnY]]);}strip(turn);
    strip([[[r.x,r.z+r.radius,turnY],[r.x,lanes[0].z0,turnY]],[[r.xStart,lanes[0].z1,lanes[0].from],[r.xStart,lanes[0].z0,lanes[0].from]]]);
    for(let i=0;i<lanes.length;i++){
      const lane=lanes[i], y0=lane.forward?lane.from:lane.to, y1=lane.forward?lane.to:lane.from;
      strip([[[r.xStart,lane.z1,y0],[r.xStart,lane.z0,y0]],[[r.xTurn,lane.z1,y1],[r.xTurn,lane.z0,y1]]]);
      const back=lane.forward, x0=back?r.xTurn:r.x, x1=back?r.xEnd:r.xStart, z1=i<lanes.length-1?lanes[i+1].z1:lane.z1;
      strip([[[x0,z1,lane.to],[x0,lane.z0,lane.to]],[[x1,z1,lane.to],[x1,lane.z0,lane.to]]]);
    }
    function surface(index,material,name) {
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(index);g.computeVertexNormals();
      const m=new T.Mesh(g,material);m.name=name;m.userData={status:'COMPACT SWITCHBACK / CONCEPT / ENGINEERING HOLD',source:'P05 D7CA4E–D7CA6A upper curve; switchbacks and levels proposed'};m.receiveShadow=true;m.castShadow=true;group.add(m);
    }
    surface(topIndices,mat.floor,'H tower ramp · compact switchback concept');
    surface(supportIndices,mat.foundation,'H ramp support · concept');
    const rails=new T.Group();rails.name='H ramp outside handrail · concept / engineering hold';group.add(rails);
    function rod(a,b,name) {
      const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av),length=delta.length();if(length<1e-6)return;
      const part=new T.Mesh(new T.CylinderGeometry(.03,.03,length,8),mat.trim);part.position.copy(av).add(bv).multiplyScalar(.5);part.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());part.name=name;part.userData={status:'CONCEPT / HANDRAIL AND FIXINGS NOT DESIGNED'};part.castShadow=true;rails.add(part);
    }
    function handrail(path){
      let toNext=0;
      for(let i=0;i<path.length-1;i++){
        const a=path[i],b=path[i+1];rod([a[0],a[1]+.9,a[2]],[b[0],b[1]+.9,b[2]],'Ramp outside handrail · concept');
        const length=Math.hypot(b[0]-a[0],b[2]-a[2]);
        while(toNext<length){const t=toNext/length,p=a.map((v,j)=>v+(b[j]-v)*t);rod(p,[p[0],p[1]+.9,p[2]],'Ramp outside handrail post · concept');toNext+=1.2;}toNext-=length;
      }
      const end=path[path.length-1];rod(end,[end[0],end[1]+.9,end[2]],'Ramp outside handrail post · concept');
    }
    const upperRail=[[r.x-r.radius,r.upper,r.zStart],[r.x-r.radius,turnY,r.z]];
    for(let i=1;i<=12;i++){const a=Math.PI-i*Math.PI/24;upperRail.push([r.x+r.radius*Math.cos(a),turnY,r.z+r.radius*Math.sin(a)]);}handrail(upperRail);
    const last=lanes[lanes.length-1];handrail([[r.xStart,last.from,last.z1],[r.xTurn,last.to,last.z1],[r.xEnd,last.to,last.z1]]);
    // Disconnected exterior-only visual rails deliberately do not claim a safe
    // continuous guard: inner edges and intermediate drops remain on hold.
    data.assumptions.push('P05 approach has ten plan nosings and returns on both sides. Riser heights are inferred as 160 mm and may conflict with accessibility requirements. H-side ramp includes a compact five-run switchback concept ending at the tower rear. It connects the lower courtyard to the forecourt only. Church-floor connection, turn clearance, internal edge protection, handrail continuity, fixing and drainage remain unapproved.');
  }
  window.CHURCH_ENTRANCE_APPROACH={spec,prepare,floorHeight,rampLayout};
})();
