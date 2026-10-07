/* Reference-led sanctuary, metres. Carving is modeled relief, not an image plane. */
(() => {
  // The three-lobed frame of section sheet 5 stands on the axis-10 timber columns, in lacquered
  // timber. Behind it a timber-lined chamber runs back to the reredos on axis 11.
  const spec = { revision:'2026-10-07-sanctuary-6-carved', frameAxis:'10', frameX:44.175, centerX:48.12, wingX:44.375, wingZ:5.5, doorHeight:2.2, nicheBase:2.85,
    centralArch:{half:3.3,spring:8.25,shoulder:9.38,crown:10.83}, sideArch:{half:1.575,spring:6.15,shoulder:6.75,crown:7.46},
    chamber:{x0:44.49,x1:48.42,face:3.3,outer:3.75,top:9.45},
    // Crucifix niche: opens through the reredos and the back wall, 1.0 m deep, its blue wall and
    // the cross standing back on a base over the service room. `shell` is the plaster casing
    // seen from the service room; `endX` its rear face.
    niche:{half:1.9,spring:5.85,rise:1.55,floor:2.6,mouthX:47.99,backX:49,lining:.05,shell:.14,endX:49.23} };
  // Underside of the boarded roof lining, as in the simulator.
  const roofY=u=>12.282-.7258*Math.abs(u)-.1;
  const LACQUER='#6b2015';
  window.CHURCH_SANCTUARY = { spec, prepare, roofY };
  function prepare({THREE:T,building,interior,data,mat,palettes}) {
    spec.frameX=data.longitudinal[spec.frameAxis];spec.wingX=spec.frameX+.2;
    const remove=[];
    building.updateMatrixWorld(true);
    const centre=o=>new T.Box3().setFromObject(o).getCenter(new T.Vector3());
    building.traverse(o=>{if(/^(Proposed sanctuary reredos backing|Proposed reredos central timber panel|Fine reredos inlay|Proposed reredos arch surround|Reredos pilaster|Reredos capital|Reredos base)/.test(o.name))remove.push(o);});
    // Sheet 5 draws the sanctuary frame without a tie beam: the lobed arch is the truss on this axis.
    building.traverse(o=>{if(o.isMesh&&/^(Schematic transverse tie|Proposed roof truss diagonal|Proposed truss king post|Proposed truss connection block|Proposed timber knee brace)$/.test(o.name)&&Math.abs(centre(o).x-spec.frameX)<.05)remove.push(o);});
    remove.forEach(o=>o.removeFromParent());
    // The cross and corpus stand inside the niche, just in front of its blue wall
    // (the bundle places the upright at x 48.04).
    const crossShift=spec.niche.backX-.17-48.04;
    building.traverse(o=>{if(o.name.startsWith('Proposed sanctuary crucifix') || o.name.startsWith('Illustrative bronze corpus'))o.position.x+=crossShift;});
    const root=new T.Group();root.name='Reference sanctuary · red lacquer and gilded relief';building.add(root);
    const material=(name,color,metalness=0,roughness=.42)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness});m.name=name;return m;};
    const K=window.CHURCH_CARVING.create(T);
    // Polished lacquer as on the 7 October interior views: a clear coat over a faint long grain.
    const wood=new T.MeshPhysicalMaterial({color:LACQUER,roughness:.26,clearcoat:.7,clearcoatRoughness:.12,map:K.grain()});wood.name='Sanctuary · oxblood lacquer';
    const gold=material('Sanctuary · carved gilding','#c7983f',.72,.3),blue=material('Sanctuary · blue niche','#187eaf',0,.8),stone=material('Sanctuary · pale stone','#e5dbc8'),leafGold=material('Sanctuary · gilded vault boarding','#c9a045',.35,.42);
    // Carved work is left a little lighter and less polished than the turned and planed timber.
    const carve=material('Sanctuary · carved lacquered timber','#6e2415',0,.36),inset=material('Sanctuary · dark marble inset','#56625c',0,.28);
    window.CHURCH_SANCTUARY.materials={wood,gold,carve};
    // Every round column on the D/E lines takes the sanctuary finish, from the entrance to the
    // frame on axis 10; the axis-11 piers close the back corners of the chamber.
    building.traverse(o=>{
      if(!o.isMesh)return;
      if(/^(Central column |Timber shaft foot)/.test(o.name)||/^(Sanctuary plaster pier|Sanctuary pier base)/.test(o.name))o.material=wood;
      else if(o.name==='Sanctuary pier capital')o.material=gold;
      // Between the beams and the rafter the shaft ends in a die with a moulded cap.
      else if(o.name==='Timber capital collar'){o.geometry=new T.BoxGeometry(.56,.27,.56);o.position.y=9.315;o.material=wood;}
      else if(/^Column head \+/.test(o.name)){o.geometry=new T.BoxGeometry(.68,.05,.68);o.position.y=9.475;o.material=wood;}
      // The pedestals under the nave shafts are pale stone with a dark marble panel on each face.
      else if(o.name==='Column base +0.600'&&interior.materials.whiteStone)o.material=interior.materials.whiteStone;
    });
    const leafGeometry=new T.SphereGeometry(1,6,4);
    function mesh(geo,mat,g,name,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
    // The beams and roof timbers take the same lacquer as the columns: tie beams, rafters, purlins,
    // ridge and braces all share this material, as do the members the simulator adds from sheet 4.
    // The earlier natural grain is kept for the simulator's natural timber tones.
    const timber=interior.materials.timber;
    window.CHURCH_SANCTUARY.naturalTimber={color:timber.color.clone(),map:timber.map,bumpMap:timber.bumpMap,roughness:timber.roughness};
    timber.color.copy(wood.color);timber.map=timber.bumpMap=null;timber.roughness=wood.roughness;timber.needsUpdate=true;
    const reference=palettes?.get(timber);if(reference){reference.color.copy(timber.color);reference.map=reference.bump=null;}
    const rafters=[];
    building.traverse(o=>{
      if(!o.isMesh)return;
      if(/^(Schematic transverse tie|Schematic rafter)/.test(o.name))o.material=timber;
      else if(o.name==='Proposed truss connection block')o.material=gold;
      else if(o.name==='Proposed visible principal rafter below roof lining'&&o.position.x<spec.frameX-.5)rafters.push(o);
    });
    // Gilding on the roof timbers of the nave: a line along the soffit of each rafter and of the
    // ridge, and a boss where each pair of rafters meets. (Beyond the frame the vault hides the roof.)
    for(const o of rafters){
      const p=o.geometry.parameters;if(!p?.height)continue;
      const s=mesh(new T.BoxGeometry(.07,p.height-.3,.012),gold,o.parent,'Gilded rafter soffit line');
      s.position.copy(o.position);s.rotation.copy(o.rotation);s.translateZ(Math.sign(o.rotation.x)*(p.depth/2+.004));s.castShadow=false;
    }
    const ridge=building.getObjectByName('Proposed underside ridge member');
    if(ridge?.geometry.parameters?.height){
      const p=ridge.geometry.parameters,under=ridge.position.y-p.width/2,x0=ridge.position.x-p.height/2+.1,x1=spec.frameX-.2;
      mesh(new T.BoxGeometry(x1-x0,.012,.08),gold,ridge.parent,'Gilded ridge soffit line',(x0+x1)/2,under-.004,0).castShadow=false;
      for(const x of new Set(rafters.map(o=>o.position.x)))mesh(leafGeometry,gold,ridge.parent,'Gilded ridge boss',x,under-.03,0).scale.set(.17,.06,.17);
    }
    function box(g,w,h,d,u,y,v,mat,name){return mesh(new T.BoxGeometry(w,h,d),mat,g,name,u,y,v);}
    function line(g,points,r=.025,mat=gold,name='Gilded carved moulding'){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),Math.min(120,Math.max(16,points.length*3)),r,5,false),mat,g,name);}
    function flower(g,u,y,v,s=.1){for(let i=0;i<6;i++){const a=i*Math.PI/3;const p=mesh(leafGeometry,gold,g,'Gilded floral relief',u+Math.cos(a)*s,y+Math.sin(a)*s,v);p.scale.set(s*.8,s*.32,.035);p.rotation.z=a;}const c=mesh(leafGeometry,gold,g,'Flower heart',u,y,v+.02);c.scale.set(s*.35,s*.35,.04);}
    function vine(g,u,y,h,v){line(g,Array.from({length:13},(_,i)=>[u+Math.sin(i*Math.PI/2)*.07,y+i*h/12,v]),.017);for(let i=0;i<12;i++){
      const cy=y+(i+.5)*h/12;flower(g,u+(i%2?-.06:.06),cy,v,.07);
      for(const sign of [-1,1])line(g,Array.from({length:9},(_,k)=>{const a=k*Math.PI*1.6/8,r=.09*(1-k/12);return [u+sign*(.075+Math.cos(a)*r),cy+Math.sin(a)*r,v];}),.012);
    }}
    function archShape(half,spring,rise,bottom){const s=new T.Shape();s.moveTo(-half,bottom);s.lineTo(-half,spring);s.bezierCurveTo(-half,spring+rise*.35,-half*.55,spring+rise*.4,-half*.5,spring+rise*.65);s.bezierCurveTo(-half*.4,spring+rise*.92,-.13,spring+rise,0,spring+rise);s.bezierCurveTo(.13,spring+rise,half*.4,spring+rise*.92,half*.5,spring+rise*.65);s.bezierCurveTo(half*.55,spring+rise*.4,half,spring+rise*.35,half,spring);s.lineTo(half,bottom);s.closePath();return s;}
    function slab(g,shape,from,to,mat,name){return mesh(new T.ExtrudeGeometry(shape,{depth:to-from,bevelEnabled:false,curveSegments:18}),mat,g,name,0,0,from);}
    function arch(g,half,spring,rise,bottom,depth,mat,name,hole){const s=archShape(half,spring,rise,bottom);if(hole)s.holes.push(hole);return slab(g,s,depth,depth+.13,mat,name);}
    function crown(g,w,spring,rise,v){const pts=[[-w,spring,v],[-w*.93,spring+rise*.25,v],[-w*.52,spring+rise*.5,v],[-w*.36,spring+rise*.86,v],[0,spring+rise,v],[w*.36,spring+rise*.86,v],[w*.52,spring+rise*.5,v],[w*.93,spring+rise*.25,v],[w,spring,v]];line(g,pts,.045);const path=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)));for(let i=0;i<=24;i++){const p=path.getPoint(i/24);flower(g,p.x,p.y,p.z,.075);} }
    function border(g,u,y,w,h,v){for(const e of [-1,1]){box(g,.025,h,.035,u+e*w/2,y,v,gold,'Panel gold border');box(g,w,.025,.035,u,y+e*h/2,v,gold,'Panel gold border');}}
    function panel(g,u,y,w,h,v){box(g,w,h,.14,u,y,v,wood,'Carved lacquer panel');border(g,u,y,w*.86,h*.88,v+.09);vine(g,u,y-h*.33,h*.66,v+.1);}
    // Open gilded lattice in front of the lacquer, as on the side screens of the reference.
    function lattice(g,u,y0,w,h,v,step=.2){
      border(g,u,y0+h/2,w,h,v);
      for(const dir of [-1,1])for(let c=-h+step/2;c<w;c+=step){
        const a=Math.max(0,c),b=Math.min(w,h+c);if(b-a<.05)continue;
        const s=box(g,(b-a)*Math.SQRT2,.022,.018,u+dir*((a+b)/2-w/2),y0+(a+b)/2-c,v,gold,'Gilded lattice strip');s.rotation.z=dir*Math.PI/4;
      }
    }
    // Three-lobed line of section sheet 5 (same construction as the plaster frame on axis 11).
    function lobed(cx,half,a){const s=new T.Shape();s.moveTo(cx-half,a.spring);s.quadraticCurveTo(cx-half,a.shoulder-.05,cx-half*.58,a.shoulder);s.bezierCurveTo(cx-half*.5,a.crown,cx-half*.15,a.crown+.04,cx,a.crown+.04);s.bezierCurveTo(cx+half*.15,a.crown+.04,cx+half*.5,a.crown,cx+half*.58,a.shoulder);s.quadraticCurveTo(cx+half,a.shoulder-.05,cx+half,a.spring);return s;}
    function lobedFrame(g,cx,half,a,name,blooms){
      const shape=lobed(cx,half,a),trace=shape.getPoints(12);
      shape.lineTo(cx+half,roofY(cx+half));if(!cx)shape.lineTo(0,roofY(0));shape.lineTo(cx-half,roofY(cx-half));shape.closePath();
      mesh(new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:false,curveSegments:32}),wood,g,name,0,0,-.16);
      for(const v of [-.19,.19])line(g,trace.map(p=>[p.x,p.y,v]),.06);
      const path=new T.CatmullRomCurve3(trace.map(p=>new T.Vector3(p.x,p.y,.2)));
      for(let i=0;i<=blooms;i++){const p=path.getPoint(i/blooms);flower(g,p.x,p.y,p.z,.085);}
      for(const e of [-1,1])box(g,.2,.3,.42,cx+e*(half-.08),a.spring-.13,0,gold,'Gilded arch corbel');
    }
    function group(name,x,z){const g=new T.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=-Math.PI/2;root.add(g);return g;}
    // Niche outline, optionally grown by a casing thickness, as a shape or as a hole.
    // (Holes are wound against their contour, or their reveals would face into the timber.)
    const N=spec.niche,outline=(grow=0)=>archShape(N.half+grow,N.spring,N.rise+grow,N.floor-grow),opening=grow=>new T.Path(outline(grow).getPoints(18).reverse());
    const casing=(outer,inner)=>{const s=outline(outer);s.holes.push(opening(inner));return s;};
    const center=group('Central gilded reredos',spec.centerX,0);
    arch(center,3.26,8.05,2.3,.75,-.23,wood,'Outer carved canopy',opening(N.lining));
    for(let j=0;j<3;j++)crown(center,3.05+j*.075,7.75+j*.23,1.95+j*.09,.03+j*.04);
    for(const e of [-1,1])vine(center,e*3.13,2.65,5.25,.07);
    arch(center,3.14,6.6,2.35,.75,0,wood,'Central carved timber silhouette',opening(N.lining));
    // Deep crucifix niche. Local v runs towards the nave: mouth at the reredos face, blue wall
    // 1.0 m behind it. A lacquered reveal lines it; a plaster casing shows in the service room,
    // boxed out above the boards and standing through the notched ceiling slab.
    const vMouth=spec.centerX-N.mouthX,vBack=spec.centerX-N.backX,vRoom=spec.centerX-(data.longitudinal['11']+.12),vEnd=spec.centerX-N.endX,plaster=mat?.wall||wood;
    slab(center,casing(N.lining,0),vBack,vMouth,wood,'Crucifix niche reveal · lacquered timber');
    slab(center,outline(N.lining),vBack-.05,vBack,blue,'Blue crucifix recess');
    slab(center,casing(N.shell,N.lining+.01),vEnd+.08,vRoom,plaster,'Crucifix niche casing · plaster');
    slab(center,outline(N.shell),vEnd,vEnd+.08,plaster,'Crucifix niche casing · plaster');
    const rim=outline().getPoints(18).slice(0,-1);  // open at the floor: a closed spline would sag below it
    for(const v of [vBack+.03,(vBack+vMouth)/2,vMouth-.03])line(center,rim.map(p=>[p.x*.99,N.floor+(p.y-N.floor)*.995,v]),.028);
    box(center,N.half*2,.04,.07,0,N.floor+.02,vMouth-.035,gold,'Gilded niche sill');
    // The cross stands on a stepped base on the niche floor.
    const vCross=spec.centerX-(N.backX-.17);
    for(const [w,h,d,y] of [[.6,.3,.34,.15],[.42,.28,.28,.44],[.27,.24,.22,.7]]){box(center,w,h,d,0,N.floor+y,vCross,wood,'Crucifix base step');box(center,w+.04,.03,d+.04,0,N.floor+y+h/2,vCross,gold,'Gilded base step edge');}
    for(let i=0;i<3;i++)crown(center,2.02+i*.43,5.9+i*.27,1.55+i*.16,.34+i*.035);
    for(const sign of [-1,1])for(let k=0;k<2;k++){
      const u=sign*(2.15+k*.64);box(center,.33,4.35,.36,u,4.7,.23,wood,'Carved central pilaster');vine(center,u,2.7,4.0,.44);
      for(const y of [2.53,6.87])box(center,.52,.17,.5,u,y,.23,gold,'Gilded pilaster capital');
      mesh(new T.ConeGeometry(.17,.8,6),gold,center,'Carved pinnacle',u,7.36+k*.18,.25);
    }
    for(const y of [.86,1.18,2.25,2.5]){box(center,6.4,.14,.48,0,y,.28,wood,'Reredos cornice');box(center,6.45,.035,.5,0,y+.075,.3,gold,'Gilded cornice edge');for(let u=-3;u<=3;u+=.3)flower(center,u,y,.56,.07);}
    for(let u=-2.7;u<3;u+=.9)panel(center,u,1.72,.78,.86,.4);

    // Front frame on the column line: central lobed arch between the D/E columns and a
    // smaller lobed arch over each shrine, with the spandrels closed up to the roof lining.
    const front=group('Sanctuary front frame · sheet 5 in lacquered timber',spec.frameX,0),A=spec.centralArch,S=spec.sideArch;
    lobedFrame(front,0,A.half,A,'Front frame central spandrel',44);
    for(const sign of [-1,1]){
      lobedFrame(front,sign*spec.wingZ,S.half,S,'Front frame side spandrel',18);
      // Rosette over the shrine and a scroll in the tall spandrel beside the column.
      flower(front,sign*spec.wingZ,S.crown+.4,.19,.15);vine(front,sign*(spec.wingZ-1.3),6.95,1.75,.19);
    }
    // Second gilded band following the central arch.
    line(front,lobed(0,A.half,A).getPoints(12).filter(p=>Math.abs(p.x)<3.05).map(p=>[p.x,p.y+.3,.19]),.035);
    flower(front,0,11.6,.19,.24);
    for(const e of [-1,1]){
      flower(front,e*2.3,10.15,.19,.17);
      line(front,[[e*3.2,roofY(3.2)-.1,.19],[e*.12,roofY(.12)-.1,.19]],.035);
    }
    // Columns of the approved timber concept. Nave shafts stay plain lacquer between a turned
    // base on the stone pedestal and a carved capital under the tie beam; a junction block with
    // carved corners takes the beams, and a die with gilded lotus panels stands under the rafter.
    // The frame axis, which has no tie, keeps gilded bands and a gilded capital under its die.
    const band=new T.CylinderGeometry(.345,.345,.09,24),turnedBase=K.base(.32),head=K.capital({r:.297,h:.8}),framed=K.capital({r:.292,h:.52,flare:.12});
    const frameCapital=K.merge([[framed.core,null],[framed.foliage,null],[framed.gilt,null]]);
    const corner=K.cluster({a:.15,b:.27,c:.09,leaves:9,blooms:1,size:.17}),diePanel=K.panel({w:.4,h:.19});
    const cornerBody=[],headGilt=[],insets=[];
    for(let k=0;k<4;k++){
      const diagonal=K.place(K.TR(0,0,.4),K.RY(Math.PI/4+k*Math.PI/2)),face=K.RY(k*Math.PI/2);
      cornerBody.push([corner.body,diagonal]);
      headGilt.push([corner.accent,diagonal],[diePanel,K.place(K.TR(0,.43,.283),face)]);
      insets.push([new T.BoxGeometry(.5,.34,.014),K.place(K.TR(0,0,.411),face)]);
    }
    const headCarving=K.merge(cornerBody),headGilding=K.merge(headGilt),pedestalInsets=K.merge(insets),junction=new T.BoxGeometry(.6,.59,.6);
    for(const key of ['3','4','5','6','7','8','9','10'])for(const e of [-1,1]){
      const x=data.longitudinal[key],z=e*3.6;
      if(key===spec.frameAxis){
        mesh(turnedBase,wood,root,'Column carving · turned base',x,.97,z);
        for(const y of [3.05,7.95])mesh(band,gold,root,'Gilded column band',x,y,z);
        mesh(frameCapital,gold,root,'Gilded column capital',x,8.66,z);
        mesh(K.merge([[diePanel,K.place(K.TR(0,0,.283),K.RY(-Math.PI/2))]]),gold,root,'Column carving · die panels',x,9.315,z);
        continue;
      }
      mesh(pedestalInsets,inset,root,'Column carving · pedestal inset',x,.32,z);
      mesh(turnedBase,wood,root,'Column carving · turned base',x,.78,z);
      mesh(head.core,wood,root,'Column carving · capital bell',x,7.79,z);
      mesh(head.foliage,carve,root,'Column carving · capital foliage',x,7.79,z);
      mesh(head.gilt,gold,root,'Column carving · capital volutes',x,7.79,z);
      mesh(junction,wood,root,'Column carving · junction block',x,8.885,z);
      mesh(headCarving,carve,root,'Column carving · junction foliage',x,8.885,z);
      mesh(headGilding,gold,root,'Column carving · junction blooms and die panels',x,8.885,z);
    }

    // Chamber from the frame back to the reredos: gilded boarded vault on the arch line,
    // lacquered ribs, and a timber lining over the plaster back wall.
    const depth=spec.frameX-48.52,inner=lobed(0,A.half,A).getPoints(12);
    const outer=lobed(0,A.half+.08,{spring:A.spring,shoulder:A.shoulder+.09,crown:A.crown+.09}).getPoints(12).reverse();
    mesh(new T.ExtrudeGeometry(new T.Shape(inner.concat(outer)),{depth:-depth-.16,bevelEnabled:false}),leafGold,front,'Chamber vault · gilded boarding',0,0,depth);
    for(const v of [-1,-1.85,-2.7,-3.55])line(front,inner.map(p=>[p.x,p.y-.02,v]),.075,wood,'Chamber vault rib · lacquered timber');
    const vaultPath=new T.CatmullRomCurve3(inner.map(p=>new T.Vector3(p.x,p.y,0)));
    for(const t of [.14,.32,.5,.68,.86]){
      const p=vaultPath.getPoint(t);box(front,.09,.09,-depth-.2,p.x,p.y-.03,(depth-.16)/2,wood,'Chamber vault longitudinal rib');
      for(const v of [-1,-1.85,-2.7,-3.55])mesh(leafGeometry,gold,front,'Gilded vault boss',p.x,p.y-.07,v).scale.setScalar(.12);
    }
    const back=lobed(0,A.half,A);back.lineTo(A.half,.75);back.lineTo(-A.half,.75);back.closePath();back.holes.push(opening(N.lining));
    mesh(new T.ExtrudeGeometry(back,{depth:.1,bevelEnabled:false,curveSegments:32}),wood,front,'Chamber back lining · lacquered timber',0,0,spec.frameX-48.5);
    // The plaster back wall on axis 11 opens for the niche in the same outline.
    building.traverse(o=>{
      if(o.name!=='Sanctuary back wall behind the reredos')return;
      const wall=lobed(0,A.half,A);wall.lineTo(A.half,.15);wall.lineTo(-A.half,.15);wall.closePath();wall.holes.push(opening(N.lining));
      o.geometry.dispose();o.geometry=new T.ExtrudeGeometry(wall,{depth:.2,bevelEnabled:false,curveSegments:32});
    });
    // Side walls on the D/E lines. Local +v faces the sanctuary axis.
    const C=spec.chamber,length=C.x1-C.x0,thick=C.outer-C.face,face=thick/2;
    for(const sign of [-1,1]){
      const g=new T.Group();g.name=`Chamber side wall · ${sign<0?'B':'H'}`;g.position.set((C.x0+C.x1)/2,0,sign*(C.face+C.outer)/2);g.rotation.y=sign>0?Math.PI:0;root.add(g);
      box(g,length,C.top-.15,thick,0,(C.top+.15)/2,0,wood,'Chamber side wall · lacquered timber');
      // Reredos cornice lines carried round the chamber.
      for(const y of [.86,1.18,2.25,2.5]){box(g,length,.14,.1,0,y,face+.04,wood,'Chamber cornice');box(g,length,.035,.12,0,y+.075,face+.045,gold,'Gilded cornice edge');}
      for(let i=0;i<4;i++){const u=-length/2+length*(i+.5)/4;border(g,u,1.72,.74,.76,face+.02);flower(g,u,1.72,face+.03,.15);}
      const pitch=(length-.44)/3;
      for(let i=0;i<4;i++){
        const u=-length/2+.22+i*pitch;
        box(g,.26,5.4,.12,u,5.3,face+.05,wood,'Chamber wall pilaster');vine(g,u,2.75,5.0,face+.13);
        for(const y of [2.66,7.94])box(g,.36,.13,.2,u,y,face+.06,gold,'Gilded pilaster capital');
      }
      for(let i=0;i<3;i++){
        const u=-length/2+.22+(i+.5)*pitch;
        lattice(g,u,2.95,pitch-.42,4.3,face+.03);flower(g,u,7.62,face+.03,.17);
        // Plain framed panels on the passage side.
        border(g,u,1.3,pitch-.3,2.0,-face-.02);border(g,u,5.4,pitch-.3,5.6,-face-.02);
      }
      box(g,length,.2,.18,0,A.spring-.05,face+.06,wood,'Vault springing cornice');box(g,length,.04,.2,0,A.spring+.06,face+.07,gold,'Gilded cornice edge');
      for(let u=-length/2+.25;u<length/2;u+=.49)flower(g,u,A.spring-.05,face+.16,.075);
    }

    // Shrines stand in the side arches on the column line; no solid panel across the doorway.
    for(const sign of [-1,1]){
      const g=group(sign<0?'Our Lady forward wing':'Saint Joseph forward wing',spec.wingX,sign*spec.wingZ);
      for(const e of [-1,1]){box(g,.57,2.6,1.25,e*1.03,1.45,-.35,wood,'Service entrance jamb');box(g,.63,.65,1.32,e*1.03,.475,-.35,stone,'Stone doorway base');vine(g,e*1.03,.85,1.85,.31);}
      box(g,2.7,.3,1.35,0,2.7,-.33,wood,'Raised statue shelf above entrance');
      for(const y of [2.55,2.84])box(g,2.75,.05,1.4,0,y,-.32,gold,'Shelf gilded moulding');
      // A lacquered wall behind the shrine closes the whole bay above the shelf, from the
      // chamber wall to the C/G wall and up to the roof lining, so nothing shows through the
      // side arch above the shrine. Gilded band, blooms and rosette fill the head of the arch.
      const bay=new T.Shape(),zc=sign*spec.wingZ,edge=1.75;
      bay.moveTo(-edge,2.85);bay.lineTo(edge,2.85);bay.lineTo(edge,roofY(zc+edge));bay.lineTo(-edge,roofY(zc-edge));bay.closePath();
      slab(g,bay,-.55,-.42,wood,'Shrine bay fill · lacquered timber');
      const head=lobed(0,1.4,{spring:5.95,shoulder:6.5,crown:7.02}).getPoints(12),headPath=new T.CatmullRomCurve3(head.map(p=>new T.Vector3(p.x,p.y,-.38)));
      line(g,head.map(p=>[p.x,p.y,-.385]),.035);
      for(let i=0;i<=16;i++){const p=headPath.getPoint(i/16);flower(g,p.x,p.y,p.z,.07);}
      flower(g,0,7.42,-.38,.13);for(const e of [-1,1])flower(g,e*.62,7.2,-.38,.08);
      arch(g,.89,5.2,1.0,2.95,-.36,blue,'Wing blue niche');
      for(let j=0;j<2;j++)crown(g,1.04+j*.23,5.27+j*.23,1.05+j*.12,.06);
      for(const e of [-1,1]){box(g,.22,2.67,.43,e*1.14,4.2,-.1,wood,'Wing carved pilaster');vine(g,e*1.14,2.96,2.5,.16);mesh(new T.ConeGeometry(.12,.56,6),gold,g,'Wing pinnacle',e*1.14,6.32,.03);}
      // Lacquered returns close the slits beside the D/E column and the C/G pier.
      for(const e of [-1,1]){box(g,.4,S.spring-.15,.12,e*1.55,(S.spring+.15)/2,-.2,wood,'Shrine return panel');box(g,.03,S.spring-.6,.03,e*1.55,(S.spring+.15)/2,-.13,gold,'Panel gold border');}
      // Open paired leaves, folded back behind the frontage; the passage behind links the
      // veranda door and, through the side arch on axis 11, the open service room.
      for(const e of [-1,1]){const hinge=new T.Group();hinge.position.set(e*.72,.15,-.28);hinge.rotation.y=-e*1.5;g.add(hinge);panel(hinge,-e*.35,1.1,.7,2.2,0);box(hinge,.035,.27,.08,-e*.58,1.06,.14,gold,'Service door handle');}
    }
    data.sanctuary={...spec,crossShift,reference:'references/02-sanctuary/concepts/09-sanctuary-approved-concept.png',materials:['oxblood lacquer','carved lacquered timber','gilded carved relief','gilded vault boarding','blue niche','pale stone','dark marble inset'],roofTimber:'oxblood lacquer with gilded soffit lines; natural tones remain a simulator setting',status:'Image-led concept; ornamental profiles and sculpture are approximations'};
    data.assumptions.push('Sanctuary revised from the approved concept and section sheet 5: the three-lobed frame stands on the axis-10 columns in lacquered timber, without a tie beam, and the Marian and Joseph shrines stand in its side arches on the same line, with 2.2 m service entrances below raised niches. A timber-lined chamber with a gilded boarded vault runs from the frame back to the reredos on axis 11, where the crucifix stands in a niche 1.0 m deep that opens through the back wall onto a base over the service room. The bay behind each shrine is closed in lacquered timber above the shelf, and every round column on the D/E lines is lacquered: the nave columns have turned bases on panelled stone pedestals, carved capitals, junction blocks and dies with gilded lotus panels, and the two frame columns keep gilded bands and capitals. The tie beams, side beams, rafters, purlins, ridge and braces take the same lacquer, with gilded lines and bosses on the nave rafters and ridge; the boarded roof lining stays ivory. Member sizes, the roof thrust on axis 10 and the relief are proposals within the retained building grids.');
  }
})();
