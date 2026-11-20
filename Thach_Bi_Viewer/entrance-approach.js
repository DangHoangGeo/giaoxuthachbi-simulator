/* P05 approach outline and H-side ramp study, metres. NOT FOR CONSTRUCTION.
   The drawn plan does not establish ramp heights or construction; see
   docs/exterior-23102026/entrance-approach.md. */
(() => {
  const spec = {
    stair: { front: -9.219, side: 10.392, tread: .35, count: 10, lower: -2.08, upper: -.48, backB: -.499, backH: -3.159 },
    ramp: { x: -.9396, z: 13.5423, radius: 2, inner: .18, zStart: 10.392, landingStart: 4.0, xEnd: 5.4, lower: -2.08, upper: -.48 }
  };
  function rampLayout() {
    const r=spec.ramp, run=(r.z-r.zStart)+(r.landingStart-r.x);
    const slope=(r.upper-r.lower)/run;
    return {run,slope,turnY:r.upper-(r.z-r.zStart)*slope};
  }
  function rampHeight(x,z) {
    const r=spec.ramp, {slope,turnY}=rampLayout();
    if(x>=r.x-r.radius && x<=r.x-r.inner && z>=r.zStart && z<=r.z) return r.upper-(z-r.zStart)*slope;
    const distance=Math.hypot(x-r.x,z-r.z);
    if(x<=r.x && z>=r.z && distance>=r.inner && distance<=r.radius) return turnY;
    if(x>=r.x && x<=r.xEnd && z>=r.z+r.inner && z<=r.z+r.radius)
      return x>=r.landingStart ? r.lower : turnY-(x-r.x)*slope;
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
    const r=spec.ramp, {turnY}=rampLayout(), positions=[], topIndices=[], supportIndices=[];
    // P05 curve retained. Owner, 20 Nov 2026: one short ramp near the tower (no switchback). Slope about 1:5.1.
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
    strip([r.x,r.landingStart,r.xEnd].map(x=>{
      const y=x>=r.landingStart?r.lower:rampHeight(x,(r.z+r.inner+r.z+r.radius)/2);
      return [[x,r.z+r.radius,y],[x,r.z+r.inner,y]];
    }));
    function surface(index,material,name) {
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setIndex(index);g.computeVertexNormals();
      const m=new T.Mesh(g,material);m.name=name;m.userData={status:'SHORT RAMP NEAR THE TOWER / CONCEPT / ENGINEERING HOLD',source:'P05 D7CA4E–D7CA6A; owner choice 20 Nov 2026; levels proposed; slope about 1:5.1'};m.receiveShadow=true;m.castShadow=true;group.add(m);
    }
    surface(topIndices,mat.floor,'H tower ramp · short ramp near the tower');
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
    const outerRail=[[r.x-r.radius,r.upper,r.zStart],[r.x-r.radius,turnY,r.z]];
    for(let i=1;i<=12;i++){const a=Math.PI-i*Math.PI/24;outerRail.push([r.x+r.radius*Math.cos(a),turnY,r.z+r.radius*Math.sin(a)]);}
    for(const x of [r.landingStart,r.xEnd])outerRail.push([x,r.lower,r.z+r.radius]);
    handrail(outerRail);
    data.assumptions.push('P05 approach has ten plan nosings and returns on both sides. Riser heights are inferred as 160 mm. At the owner\'s choice (20 November 2026) the H side has one short ramp near the tower, from the P05 curve to the tower rear, with an outside handrail only; its slope is about 1:5.1. Accessible access, the forecourt-to-church connection, handrail, fixing and drainage remain open design items.');
  }
  window.CHURCH_ENTRANCE_APPROACH={spec,prepare,floorHeight,rampLayout};
})();
