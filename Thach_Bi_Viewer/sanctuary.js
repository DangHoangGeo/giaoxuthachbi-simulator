/* Reference-led sanctuary, metres. Carving is modeled relief, not an image plane. */
(() => {
  // The three-lobed frame of section sheet 5 stands on the axis-10 timber columns, in lacquered
  // timber. Behind it a timber-lined chamber runs back to the reredos on axis 11.
  // Parish priest, 25 October 2026: the Our Lady and Saint Joseph shrines stand back on the
  // axis-11 line, level with the crucifix, in the side arches of the axis-11 frame (wingX is
  // the shrine group's origin; the statues stand 0.10 m in front of it, on the crucifix's x).
  const spec = { revision:'2026-10-07-sanctuary-7-carved', serviceRevision:'2026-10-07-concealed-1', frameAxis:'10', frameX:44.175, centerX:48.12, shrineAxis:'11', wingX:48.93, wingZ:5.5, doorHeight:2.2, nicheBase:2.85,
    centralArch:{half:3.3,spring:8.25,shoulder:9.38,crown:10.83}, // Owner, 3 Nov 2026: the side arches of the frame spring, shoulder and crown at the levels of the axis-11
    // arches over the shrines (spec.arch11), so the side vaults between them run level. Sheet 5 draws them at
    // spring 6.15, shoulder 6.75, crown 7.46 (DRAWING SHOWN; this is a recorded owner departure).
    sideArch:{half:1.575,spring:5.55,shoulder:6.3,crown:6.85,drawn:{spring:6.15,shoulder:6.75,crown:7.46}},
    // Side arches of axis 11 round the shrines (bundle plaster arch, Z 3.85–7.11, spring +5.55).
    arch11:{x:48.34,z:5.48,half:1.55,spring:5.55,shoulder:6.3,crown:6.85},
    // Shelf finish spans between the existing axis-11 pier faces, not merely
    // between the narrower decorative shrine jambs. The 5 mm end gaps are a
    // visualization allowance, not a designed bearing or tolerance.
    shrineShelf:{half:1.55,offset:.015},
    // Gilded boarded vaults over the two side passages (owner, 1 Nov 2026, USER CONFIRMED): the vault of the
    // chamber continues to both sides, on the outline of the axis-10 side arch at the front (x0 profile
    // interpolated from spec.sideArch) and the axis-11 side arch at the back (x1, spec.arch11).
    // x0 is the back face of the axis-10 frame (frameX + 0.16): the vault meets the lacquered spandrel with
    // no gap. The four shrine lights (L115–L118) hang from its soffit instead of from the frame (design.js).
    // x1 butts the lacquered spandrel of axis 11.
    // CONCEPT visual proxy: it is not an occluder in the simulator, like the chamber vault.
    sideVault:{x0:44.335,x1:48.16,thick:.09,status:'CONCEPT · gilded boarded vault over each side passage; boarding, ribs, springing beams and fixings pending'},
    // Owner, 3 Nov 2026: the gilded boarding runs on from the chamber vault to each side vault. It drops
    // plumb on the face line from the springing to coveY, where the chamber lights keep their place, then
    // curves out to the inner springing of the side vault. The lintel stays as hidden structure and cable
    // void behind it, its inner face at lintelFace.
    chamber:{x0:44.49,x1:48.42,face:3.3,outer:3.75,top:9.45,lintel:7.0,lintelFace:3.4,coveY:6.85,serviceLining:0.04},
    // Crucifix niche: opens through the reredos and the back wall, 1.0 m deep, its blue wall and
    // the cross standing back on a base over the service room. `shell` is the plaster casing
    // seen from the service room; `endX` its rear face.
    niche:{half:1.9,spring:5.85,rise:1.55,floor:2.6,mouthX:47.99,backX:49,lining:.05,shell:.14,endX:49.23},
    // Capital centre of the four pilasters beside the crucifix niche (owner, 3 Nov 2026; was 6.87).
    reredosPilasterTop:6.15,
    // Floor outline of the sanctuary front from the CAD file of 23 Oct 2026, ground plan P05
    // (handles D7BF11–D7BF2B) and section A-A S45 (D7E205–D7E211), checked with the owner on
    // 1 Nov 2026. A low platform at +0.16 runs round the dais; the dais rises 0.64 m from it to
    // +0.80; the only steps are a flight 1.90 m wide recessed into the dais front on the axis.
    // `front`/`half`: front edge and its half-width; each front corner steps back 0.10 m into a
    // 0.40 m quarter round, so the sides stand at half + 0.50. The dais keeps its back edge at the
    // chamber (48.65); the plan line runs to 48.565. Side floors continue from the platform's
    // back edge at the axis-10 piers to the bay behind the shrines.
    floor:{revision:'2026-11-01-sanctuary-floor-cad-1',
      apron:{front:37.475,half:5,back:44.065},dais:{front:38.475,half:4,back:48.65},
      stair:{x0:38.475,x1:39.345,half:.95,tread:.29},side:{x0:44.065,x1:52.63,inner:3.63,outer:7.11}} };
  // Owner, 7 Nov 2026: one red grid from chamber ceiling through the cove
  // to both side vaults. These are display-finish sections, not member sizing.
  spec.ceilingGrid={revision:'2026-11-07-continuous-cove-grid-1',
    localStations:[-1,-1.85,-2.7,-3.55],plumbWidth:.095,plumbDepth:.018};
  spec.ceilingGrid.worldStations=spec.ceilingGrid.localStations.map(v=>spec.frameX-v);
  // Owner request, 1 November 2026: the roof timbers looked flimsy. These are VISUALIZATION PROXY sections
  // (metres) for the exposed roof members; none is a structural design (ENGINEERING HOLD). Every member
  // grows downward or inward from the unmoved boarded lining and never through it, so the tie and
  // column-line beam soffits, the fittings hung from them and the cable routes are untouched. The measured
  // 'as drawn' tie and side beams and the 0.24 x 0.45 m column-line beams keep their sections.
  // `before` is the earlier proxy section; `w` is across the member's width and `d` its depth.
  spec.roofTimber = {
    revision:'2026-11-08-roof-timbers-rounded-1',
    rafter:{before:{w:.17,d:.20},w:.32,d:.42,round:.07},   // owner 8 Nov 2026: thicker, rounded arrises (was 0.26 × 0.34 square, 1 Nov)          // nave principal rafters (axes 3-9) below the lining; d perpendicular to the slope, lining face kept; axes 10-11 unchanged
    ridge:{before:{w:.21,d:.16},w:.30,d:.28},           // underside ridge member; w across, d vertical, top face kept
    purlin:{before:{w:.09,d:.12},w:.14,d:.22},          // drawn purlins: w along the slope, d perpendicular to it (now square to the lining)
    proposedPurlin:{before:{w:.11,d:.095},w:.14,d:.17}, // earlier visual proposal, shown only with 'Show truss'
    kingPost:{before:{w:.11,d:.14},w:.18,d:.22},
    diagonal:{before:{w:.11,d:.13},w:.17,d:.20},
    kneeBrace:{before:{w:.15,d:.17},w:.22,d:.26},
    kneeBraceRod:{before:{r:.075},r:.105},
    referenceFrame:{queenPost:.24,collar:{w:.34,d:.42},upperCollar:{w:.30,d:.30},kingStrut:.24,archBraceR:.14,plateBracketR:.10}
  };
  // Owner feedback, 1 November 2026 (second round): the beams and the boarded lining were finished on both nave
  // slopes, but looking up in the two 9-10 wings one saw the bare tile roof. The wings now take the same
  // ivory boarded lining, lacquered rafters, purlins and ridge as the nave (built in simulator/engine.js from
  // these numbers), with the nave section sizes of `roofTimber`. SOURCE LEVELS: the side-gable roof planes of
  // the bundle ("Planar side-gable roof meeting main valley"): ridge top +9.45 on X 40.575, eaves +6.325 at
  // 3.88 m from the ridge, valley apex on the nave roof at Z 4.164 (the same +9.45). The lining lies 0.19 m
  // under the tile planes exactly as the nave's does. All members are VISUALIZATION PROXIES on ENGINEERING HOLD:
  // no wing roof section exists in the drawings, and no tie, collar or valley rafter is modelled.
  spec.wingRoof = {
    revision:'2026-11-01-wing-roof-1',
    ridgeX:40.575, top:9.45, eaveY:6.325, eaveRun:3.88, liningDrop:.19,
    slope:(9.45-6.325)/3.88,                    // rise per metre across the wing (the nave: 0.7258)
    naveRidge:12.472, naveSlope:(12.472-7.13)/7.36, // nave tile planes the wing roof meets in its valleys
    valleyEnd:{dx:null,z:7.25},                // end of the nave lining's V cut on the nave eave line
    half:3.44,                                   // the lining stops at the inner faces of the return and closing walls (X 37.135 / 44.015)
    gableFace:13.099,                            // inner face of the gable wall
    frames:[7.9,10.3,12.7],                      // |Z| of the three principal rafter pairs (2.4 m bays)
    purlinDx:[.635,1.135,null,2.135,2.635,3.135], // nominal 0.5 m spacing; the third line is adjusted to put its soffit under the light anchor
    rafterEndDx:3.40,                            // the rafters stop 4 cm short of the wall faces at the lining
    fixtureDx:1.635                              // downlights hang from the purlins at this distance from the ridge
  };
  {
    const W=spec.wingRoof;
    W.apexZ=(W.naveRidge-W.top)/W.naveSlope;     // 4.164
    W.valleyEnd.dx=(W.valleyEnd.z-W.apexZ)*W.naveSlope/W.slope; // true intersection of the two lining planes
    // The purlin hangs normal to the slope. Offset its top contact outwards so the centre of its
    // lower face is directly over the fixture at fixtureDx, instead of leaving the canopy in air.
    W.purlinDx[2]=W.fixtureDx+(spec.roofTimber.purlin.d+.004)*W.slope/Math.sqrt(1+W.slope*W.slope);
    // Underside of the wing lining at X (the sloping plane, valid for |X - ridge| <= half).
    W.liningY=x=>W.top-W.liningDrop-W.slope*Math.abs(x-W.ridgeX);
    // Plan position of the nave/wing valley at a distance dx from the wing ridge (the line the bundle clips the roofs on).
    W.valleyZ=dx=>dx<=2.88?W.apexZ+dx*(7.36-W.apexZ)/2.88:7.36+(dx-2.88)*(10.98-7.36)/(3.88-2.88);
    // Vertical drop from the lining to the soffit of a purlin at the same X (depth d square to the slope, 4 mm gap).
    W.purlinDrop=d=>(d+.004)*Math.sqrt(1+W.slope*W.slope);
    // True inside the triangular opening of the nave lining that looks into a wing, and over the wing itself.
    // Continuous main-nave lining owns the crossing; the wing lining starts beyond its edge.
    W.covers=(x,z)=>{const dx=Math.abs(x-W.ridgeX),az=Math.abs(z);
      return az>W.valleyEnd.z&&dx<=W.half&&az<=W.gableFace;};
  }
  // Floor levels from the church's CAD file of 23 October 2026 (sections 25 and 45), adopted
  // by the owner on 24 October 2026: dais +0.80 (the PDF set had +0.75) and side floors +0.16
  // (+0.15). The bundle still places its furnishings on +0.75, so prepare() lifts that group.
  // Section A-A draws the low platform at +0.16 and four 0.16 m risers above it (the plan label
  // reads +0,15; the owner kept the drawn 160 mm on 1 Nov 2026). Treads 0.29 m.
  const DAIS=.8,SIDE=.16,BUNDLE_DAIS=.75,RISER=.16;
  // Inside a platform outline, in plan; az is |z|.
  const inside=(o,x,az)=>{
    if(x<o.front||x>o.back||az>o.half+.5)return false;
    if(az<=o.half||x>=o.front+.5)return true;
    return x>=o.front+.1&&(x-o.front-.5)**2+(az-o.half)**2<=.16;
  };
  const onDais=(x,z)=>inside(spec.floor.dais,x,Math.abs(z));
  // Finished floor of the sanctuary front, or null where the rest of the church decides.
  function floorY(x,z){
    const F=spec.floor,S=F.stair,az=Math.abs(z);
    if(inside(F.dais,x,az))return x<S.x1&&az<=S.half?Math.min(DAIS,SIDE+RISER*(1+Math.floor((x-S.x0)/S.tread))):DAIS;
    if(inside(F.apron,x,az))return SIDE;
    if(x>=F.side.x0&&x<=F.side.x1&&az>3.6&&az<=7.25)return SIDE;
    // Round the low platform, up to the axis-10 piers, the floor stays at nave level.
    if(x>=F.apron.front&&x<F.side.x0&&az<=7.2)return 0;
    return null;
  }
  // Plan outline (x, z) of a platform, with the stepped quarter-round front corners and an
  // optional recess in the middle of its front edge.
  function planOutline(o,recess){
    const pts=[[o.back,-o.half-.5],[o.front+.5,-o.half-.5]];
    for(let i=0;i<=8;i++){const a=-Math.PI/2-i*Math.PI/16;pts.push([o.front+.5+.4*Math.cos(a),-o.half+.4*Math.sin(a)]);}
    pts.push([o.front,-o.half]);
    if(recess)pts.push([o.front,-recess.half],[recess.x1,-recess.half],[recess.x1,recess.half],[o.front,recess.half]);
    pts.push([o.front,o.half]);
    for(let i=0;i<=8;i++){const a=Math.PI+i*Math.PI/16;pts.push([o.front+.5+.4*Math.cos(a),o.half-.4*Math.sin(a)]);}
    pts.push([o.front+.5,o.half+.5],[o.back,o.half+.5]);
    return pts;
  }
  // Underside of the boarded roof lining, as in the simulator.
  const roofY=u=>12.282-.7258*Math.abs(u)-.1;
  // Owner-selected brighter red, 8 October 2026. Display finish, not measured reflectance.
  const LACQUER='#853125';
  const SATIN_TONE=.84;
  window.CHURCH_SANCTUARY = { spec, prepare, roofY, floorY, onDais, wingLiningY: spec.wingRoof.liningY, wingCovers: spec.wingRoof.covers };
  function prepare({THREE:T,building,interior,data,mat,palettes}) {
    spec.frameX=data.longitudinal[spec.frameAxis];spec.wingX=data.longitudinal[spec.shrineAxis]+.255;
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
    // Free-standing furnishings stand on the dais and rise with it; the cross and corpus stand
    // on their own base in the niche, so they keep their height.
    const lift=DAIS-BUNDLE_DAIS;
    building.traverse(o=>{if(o.name.startsWith('Proposed sanctuary furnishings'))o.position.y+=lift;});
    building.traverse(o=>{if(o.name.startsWith('Proposed sanctuary crucifix') || o.name.startsWith('Illustrative bronze corpus'))o.position.y-=lift;});
    rebuildFloor();
    building.updateMatrixWorld(true);
    const root=new T.Group();root.name='Reference sanctuary · red lacquer and gilded relief';building.add(root);
    const tabernacle=[];
    const material=(name,color,metalness=0,roughness=.42)=>{const m=new T.MeshStandardMaterial({color,metalness,roughness});m.name=name;return m;};
    const K=window.CHURCH_CARVING.create(T);
    // Polished lacquer as on the 7 October interior views: a clear coat over a faint long grain.
    const wood=new T.MeshPhysicalMaterial({color:LACQUER,roughness:.26,clearcoat:.7,clearcoatRoughness:.12,map:K.grain()});wood.name='Sanctuary · oxblood lacquer';
    const gold=material('Sanctuary · carved gilding','#c7983f',.72,.3),blue=material('Sanctuary · blue niche','#187eaf',0,.8),stone=material('Sanctuary · pale stone','#e5dbc8'),leafGold=material('Sanctuary · gilded vault boarding','#c9a045',.35,.42);
    // Carved work is left a little lighter and less polished than the turned and planed timber.
    const carve=material('Sanctuary · carved lacquered timber','#8b3827',0,.36),inset=material('Sanctuary · dark marble inset','#56625c',0,.28),figure=material('Sanctuary · carved figure, natural wood','#c49a6c',0,.5);
    // Flat boards, the cross and the furniture take a satin coat of the same red. A polished clear
    // coat on a flat board mirrors the daylight at a glancing angle, and with the long grain it
    // read as brown wood beside the red columns (owner, 9 October 2026: the sanctuary is red and gold).
    // The polished lacquer is darkened a little by its grain map; the plain satin coat is toned to match it.
    // It is kept matt enough that the crucifix accents do not raise a pale sheen on the cross at night:
    // at roughness .4 the highlight alone read as salmon and the cross was lost against the lit recess.
    const satin=new T.MeshPhysicalMaterial({color:new T.Color(LACQUER).multiplyScalar(SATIN_TONE),roughness:.62,clearcoat:.12,clearcoatRoughness:.5,envMapIntensity:.45});satin.name='Sanctuary · oxblood lacquer, satin';
    // Broad reredos fields need the lacquer film to read before the timber grain.
    // Blend the existing local map toward a uniform coat, without changing columns.
    const reredosLacquer=wood.clone();
    const lacquerCanvas=document.createElement('canvas');lacquerCanvas.width=lacquerCanvas.height=512;
    const lacquerContext=lacquerCanvas.getContext('2d');
    lacquerContext.fillStyle='#ffffff';lacquerContext.fillRect(0,0,512,512);
    lacquerContext.globalAlpha=.18;lacquerContext.drawImage(wood.map.image,0,0,512,512);
    reredosLacquer.map=K.texture(lacquerCanvas,true);
    reredosLacquer.roughness=.36;reredosLacquer.clearcoat=.45;
    const velvet=material('Sanctuary · crimson upholstery','#7c1f24',0,.82);
    window.CHURCH_SANCTUARY.materials={wood,gold,carve,satin,leafGold};
    building.getObjectByName('Proposed sanctuary furnishings \u2014 layout to confirm')?.traverse(o=>{
      if(!o.isMesh)return;
      if(o.material.name==='Proposed dark-stained timber joinery')o.material=satin;
      else if(/^(Altar|Ambo|Tabernacle) cross (arm|stem)$/.test(o.name))o.material=gold;
      else if(/^Chair (cushion|back inset)$/.test(o.name))o.material=velvet;
    });
    // The corpus is carved in the round (carving.js) and takes the place of the bundle's jointed
    // proxy in the same group, hung from the same crossarm. Its hair, beard and crown of thorns
    // are a darker tone of the same wood, the cloth is gilded and the three nails are iron. The
    // gilded title board follows the approved concept; the cross itself is lacquered red.
    const proxy=building.getObjectByName('Illustrative bronze corpus — sculpture proxy'),crossarm=building.getObjectByName('Proposed sanctuary crucifix crossarm'),upright=building.getObjectByName('Proposed sanctuary crucifix upright');
    if(proxy&&crossarm&&upright){
      for(const o of [...proxy.children]){o.geometry?.dispose();o.removeFromParent();}
      const carved=K.corpus(),faceX=crossarm.position.x-crossarm.geometry.parameters.width/2,x=faceX-proxy.position.x,y=crossarm.position.y;
      const tone=material('Sanctuary · carved figure, darker tone','#7d5532',0,.62),iron=material('Sanctuary · forged iron nail','#3b3733',.55,.5);
      for(const [geometry,finish,name] of [[carved.figure,figure,'Illustrative corpus · carved figure'],[carved.hair,tone,'Carved corpus hair, beard and crown of thorns'],[carved.cloth,gold,'Illustrative modest draped loincloth'],[carved.nails,iron,'Crucifix nails']]){
        const part=new T.Mesh(geometry,finish);part.name=name;part.position.set(x,y,0);part.castShadow=part.receiveShadow=true;proxy.add(part);
      }
      spec.corpus={status:'CONCEPT · generated carving; sculptor\'s design, size, timber and fixings pending',nailLineY:y,faceX,height:carved.height,span:carved.span};
      const [c,g]=K.canvas(256);
      g.fillStyle='#d2a94e';g.fillRect(0,0,256,256);g.strokeStyle='#853125';g.lineWidth=10;g.strokeRect(9,71,238,114);
      g.fillStyle='#7a2219';g.font='bold 86px Georgia, "Times New Roman", serif';g.textAlign='center';g.textBaseline='middle';g.fillText('INRI',128,131);
      const lettering=K.texture(c,true);lettering.repeat.set(1,.5);lettering.offset.set(0,.25);
      const boardY=upright.position.y+upright.geometry.parameters.height/2-.33,board=new T.Mesh(new T.BoxGeometry(.03,.17,.36),gold),title=new T.Mesh(new T.PlaneGeometry(.34,.17),new T.MeshStandardMaterial({map:lettering,roughness:.4,metalness:.45}));
      board.name='Crucifix title board';board.position.set(x-.015,boardY,0);title.name='Crucifix title · INRI';title.material.name='Sanctuary · gilded title board';title.position.set(x-.0305,boardY,0);title.rotation.y=-Math.PI/2;
      board.castShadow=board.receiveShadow=title.receiveShadow=true;proxy.add(board,title);
    }
    // Concealed ambo service passage: the original visual pedestal stops below
    // its sloped desk and the retained microphone base sits above that desk.
    // Small hollow furniture fittings close those gaps without moving the mic.
    const desk=building.getObjectByName('Proposed sloped ambo desk'),pedestal=building.getObjectByName('Proposed ambo pedestal');
    if(desk && pedestal) {
      const c=centre(desk),pedTop=new T.Box3().setFromObject(pedestal).max.y;
      const socket=[c.x-.22,1.9+DAIS-BUNDLE_DAIS,c.z];  // the ambo microphone, on the +0.80 dais
      spec.amboService={x:c.x,z:c.z,deskY:c.y,deskSlope:desk.rotation.z,socket,socketRadius:.07,
        status:'CONCEPT · removable furniture passage; section and fixing design pending'};
      const sleeve=(name,x,z,bottom,top,r,finish)=>{
        const profile=[[.014,bottom],[r,bottom],[r,top],[.014,top],[.014,bottom]].map(p=>new T.Vector2(...p));
        const part=new T.Mesh(new T.LatheGeometry(profile,16),finish);part.name=name;part.position.set(x,0,z);
        part.userData={status:spec.amboService.status,engineeringApproved:false,serviceBoreRadius:.014};root.add(part);
      };
      sleeve('Proposed ambo service neck',c.x,c.z,pedTop-.01,c.y+.01,.095,pedestal.material);
      sleeve('Proposed ambo microphone socket',socket[0],socket[2],c.y+Math.tan(desk.rotation.z)*(socket[0]-c.x),socket[1],.07,desk.material);
    }
    // Parcel-gilt relief of the approved concept: gilded scrollwork on red lacquer for grounds
    // and friezes, and on a gilt ground for the retained shelves and friezes. The
    // revised pilasters use distinct red lacquer and raised gold geometry instead.
    const reliefFinish=(name,ground,tile)=>{
      const r=K.relief({ground}),m=new T.MeshStandardMaterial({map:r.map,bumpMap:r.bumpMap,bumpScale:.4,metalnessMap:r.surface,roughnessMap:r.surface,metalness:1,roughness:1});
      for(const t of [r.map,r.bumpMap,r.surface])t.repeat.set(1/tile,1/tile);
      m.name=name;return m;
    };
    const scrollwork=reliefFinish('Sanctuary · gilded scrollwork on lacquer','#74281e',1),gilded=reliefFinish('Sanctuary · gilded relief','#7a5218',.4);
    // The niche walls glow behind the figures and deepen towards their edges, as on the concept.
    const glowing=(m,texture,half,bottom,height)=>{texture.repeat.set(.5/half,1/height);texture.offset.set(.5,-bottom/height);m.map=texture;m.color.set('#ffffff');return m;};
    const wingBlue=material('Sanctuary · shrine niche blue','#ffffff',0,.8);
    // Every round column on the D/E lines takes the sanctuary finish, from the entrance to the
    // frame on axis 10; the axis-11 piers close the back corners of the chamber.
    building.traverse(o=>{
      if(!o.isMesh)return;
      if(/^(Central column |Timber shaft foot)/.test(o.name)||/^(Sanctuary plaster pier|Sanctuary pier base)/.test(o.name))o.material=wood;
      else if(o.name==='Sanctuary pier capital')o.material=gold;
      // Finish the two white axis-11 side arches the owner marked. Keep their
      // existing concrete/plaster proxy geometry; only its visible finish and
      // the decorative moulding change. The central arch is not affected.
      else if((o.name==='Sanctuary arch spandrel'||o.name==='Three-lobed sanctuary arch moulding')&&Math.abs(centre(o).z)>4){
        o.userData={...o.userData,surfaceFinish:{status:'CONCEPT · red and gold finish; substrate and attachment pending',originalMaterial:o.material.name,engineeringApproved:false}};
        o.material=o.name==='Sanctuary arch spandrel'?satin:gold;
      }
      // Between the beams and the rafter the shaft ends in a die with a moulded cap.
      else if(o.name==='Timber capital collar'){o.geometry=new T.BoxGeometry(.56,.27,.56);o.position.y=9.315;o.material=wood;}
      else if(/^Column head \+/.test(o.name)){o.geometry=new T.BoxGeometry(.68,.05,.68);o.position.y=9.475;o.material=wood;}
      // The corpus is carved wood with a gilded cloth; the tabernacle is gilded.
      else if(/^Illustrative corpus /.test(o.name))o.material=figure;
      else if(o.name==='Illustrative modest draped loincloth'||/^Proposed tabernacle (enclosure|door)$/.test(o.name)){o.material=gold;if(/enclosure/.test(o.name))tabernacle.push(o);}
      // The pedestals under the nave shafts are pale stone with a dark marble panel on each face.
      else if(o.name==='Column base +0.600'&&interior.materials.whiteStone)o.material=interior.materials.whiteStone;
    });
    const leafGeometry=new T.SphereGeometry(1,6,4);
    for(const o of tabernacle){
      const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3()),r=Math.min(b.max.x-b.min.x,b.max.z-b.min.z)*.5;
      const dome=new T.Mesh(new T.SphereGeometry(r,16,8,0,Math.PI*2,0,Math.PI/2),gold);dome.name='Tabernacle dome';dome.position.set(c.x,b.max.y,c.z);dome.scale.y=.8;dome.castShadow=dome.receiveShadow=true;o.parent.attach(dome);
    }
    function mesh(geo,mat,g,name,x=0,y=0,z=0){const o=new T.Mesh(geo,mat);o.name=name;o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;g.add(o);return o;}
    // The beams and roof timbers take the same lacquer as the columns: tie beams, rafters, purlins,
    // ridge and braces all share this material, as do the members the simulator adds from sheet 4.
    // The earlier natural grain is kept for the simulator's natural timber tones.
    const timber=interior.materials.timber;
    window.CHURCH_SANCTUARY.naturalTimber={color:timber.color.clone(),map:timber.map,bumpMap:timber.bumpMap,roughness:timber.roughness};
    timber.color.copy(wood.color);timber.map=timber.bumpMap=null;timber.roughness=wood.roughness;timber.needsUpdate=true;
    const reference=palettes?.get(timber);if(reference){reference.color.copy(timber.color);reference.map=reference.bump=null;}
    // Heavier roof timbers (spec.roofTimber). Only the geometry is replaced: names, positions, member
    // order and the lining stay, so the soffit lines and bosses below, the simulator and the schedules
    // follow the new sections. The earlier box is kept on userData.proxyBefore for the record.
    {
      const RT=spec.roofTimber,reshape=(o,geometry,key)=>{o.userData.proxyBefore=o.userData.proxyBefore||{section:key,parameters:{...o.geometry.parameters}};o.geometry.dispose();o.geometry=geometry;o.userData.roofTimberRevision=RT.revision;};
      building.traverse(o=>{
        if(!o.isMesh||o.geometry.type!=='BoxGeometry'&&o.geometry.type!=='CylinderGeometry')return;
        const p=o.geometry.parameters;
        switch(o.name){
          case 'Proposed visible principal rafter below roof lining':{
            // Deeper and wider; the upper face stays on the lining and the extra depth hangs below it.
            // The two pairs behind the nave (axes 10 and 11) keep their section: sheet 5 gives that line a lobed
            // arch instead of a truss, the vault hides them, and the shrine washes sit against the lining there.
            if(o.position.x>=spec.frameX-.5)break;
            // Owner, 8 Nov 2026: the trusses looked stiff and thin as square boxes; rounded arrises and a heavier section.
            const R=RT.rafter,sh=new T.Shape(),a=R.w/2,b=R.d/2,r=R.round;
            sh.moveTo(-a+r,-b);sh.lineTo(a-r,-b);sh.quadraticCurveTo(a,-b,a,-b+r);sh.lineTo(a,b-r);sh.quadraticCurveTo(a,b,a-r,b);
            sh.lineTo(-a+r,b);sh.quadraticCurveTo(-a,b,-a,b-r);sh.lineTo(-a,-b+r);sh.quadraticCurveTo(-a,-b,-a+r,-b);
            const g=new T.ExtrudeGeometry(sh,{depth:p.height,bevelEnabled:false,curveSegments:5});g.translate(0,0,-p.height/2);g.rotateX(-Math.PI/2);
            const was=p.depth;reshape(o,g,'rafter');o.userData.section={width:R.w,height:p.height,depth:R.d};
            o.translateZ(Math.sign(o.rotation.x)*(R.d-was)/2);break;}
          case 'Proposed underside ridge member':{
            // Rotated about Z: width is vertical here. Top face stays put, the extra depth hangs below.
            const R=RT.ridge;reshape(o,new T.BoxGeometry(R.d,p.height,R.w),'ridge');
            o.position.y-=(R.d-p.width)/2;break;}
          case 'Proposed longitudinal roof purlin':case 'Proposed purlin before roof valley':case 'Proposed purlin beyond roof valley':{
            const R=RT.proposedPurlin;reshape(o,new T.BoxGeometry(R.d,p.height,R.w),'proposedPurlin');break;}
          case 'Proposed truss king post':reshape(o,new T.BoxGeometry(RT.kingPost.w,p.height,RT.kingPost.d),'kingPost');break;
          case 'Proposed roof truss diagonal':reshape(o,new T.BoxGeometry(RT.diagonal.w,p.height,RT.diagonal.d),'diagonal');break;
          case 'Proposed timber knee brace':reshape(o,new T.BoxGeometry(RT.kneeBrace.w,p.height,RT.kneeBrace.d),'kneeBrace');break;
          case 'Timber knee brace · proposed section':reshape(o,new T.CylinderGeometry(RT.kneeBraceRod.r,RT.kneeBraceRod.r,p.height,p.radialSegments,p.heightSegments,p.openEnded),'kneeBraceRod');break;
          default:
        }
      });
    }
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
      const p=o.userData.section||o.geometry.parameters;if(!p?.height)continue;
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
    // Use the same rooted, layered carving throughout, rather than separate floating
    // ellipsoids. The small flowers share a geometry and sit against their supporting surface.
    const floralRelief=K.bloom({r:1,petals:8,rings:2,seg:4});
    function flower(g,u,y,v,s=.1){mesh(floralRelief,gold,g,'Gilded floral relief',u,y,v).scale.setScalar(s*1.3);}
    // A low-relief rosette at each vault crossing; this is decorative concept geometry,
    // not a description of the concealed connection or a selected gilding process.
    function vaultBoss(g,x,y,z){
      const boss=new T.Group();boss.name='Gilded vault boss · floral relief';boss.position.set(x,y,z);g.add(boss);
      const heart=mesh(leafGeometry,gold,boss,'Vault rosette heart');heart.scale.set(.055,.028,.055);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4,p=mesh(leafGeometry,gold,boss,'Vault rosette petal',Math.cos(a)*.072,0,Math.sin(a)*.072);
        p.scale.set(.065,.018,.026);p.rotation.y=-a;
      }
    }
    function vine(g,u,y,h,v){line(g,Array.from({length:13},(_,i)=>[u+Math.sin(i*Math.PI/2)*.07,y+i*h/12,v]),.017);for(let i=0;i<12;i++){
      const cy=y+(i+.5)*h/12;flower(g,u+(i%2?-.06:.06),cy,v,.07);
      for(const sign of [-1,1])line(g,Array.from({length:9},(_,k)=>{const a=k*Math.PI*1.6/8,r=.09*(1-k/12);return [u+sign*(.075+Math.cos(a)*r),cy+Math.sin(a)*r,v];}),.012);
    }}
    // A single continuous parcel-gilt composition on an inset red field. The
    // stems and leaves are real relief, not a second pattern laid over a texture.
    // Each blade starts on its branch; the shared stem ties the whole panel together.
    // Sanctuary-only carving. Folded blades and their tapered midribs share the same
    // curved axis, so veins stay on the leaf instead of floating above its tip.
    function mergeRelief(parts){
      const identity=new T.Matrix4();
      return window.CHURCH_BATCHES.merge(T,parts.map(([geo,matrix])=>({geo,matrix:matrix||identity})));
    }

    function carvedBlade(len,wid,curl=.85,lobes=5,segments=14) {
      const blade=K.leaf({len,wid,thick:len*.085,curl,lobes,cup:.32,seg:segments});
      const vein=[];
      let y=0,z=0;
      for(let i=0;i<=segments;i++){
        const t=i/segments;
        if(i){
          const a=curl*Math.pow((i-.5)/segments,2.5);
          y+=len/segments*Math.cos(a);z+=len/segments*Math.sin(a);
        }
        const a=curl*Math.pow(t,2.5),ridge=len*.085*(1-.55*t);
        vein.push([0,y-Math.sin(a)*ridge,z+Math.cos(a)*ridge]);
      }
      return mergeRelief([[blade,null],[K.stem(vein,len*.018,len*.002,segments,4),null]]);
    }

    // A running vine with alternating curled leaves, rooted side scrolls and small
    // buds. Its path and leaf sizes are authored in metres for each red field.
    function carvedVine(points,{size=.18,count=12,mirror=1}={}) {
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
      const parts=[[K.stem(points,size*.085,size*.025,count*5,7),null]];
      const blade=carvedBlade(size,size*.5),small=carvedBlade(size*.62,size*.28,1.15);
      const bud=K.bloom({r:size*.22,petals:7,rings:2,seg:6});
      for(let i=0;i<count;i++){
        const t=(i+.45)/count,p=curve.getPointAt(t),d=curve.getTangentAt(t);
        const side=(i%2?1:-1)*mirror,angle=Math.atan2(d.y,d.x)-Math.PI/2;
        const scale=.82+.18*Math.sin(t*Math.PI),turn=angle-side*.85;
        const place=K.place(K.SC(scale,scale,1),K.RZ(turn),K.TR(p.x,p.y,p.z));
        parts.push([blade,place]);
        // A small counter-leaf attaches to the same stem junction.
        parts.push([small,K.place(K.RZ(angle+side*.95),K.TR(p.x,p.y,p.z+.004))]);
        // The spiral begins at this very junction and curls back into the red field.
        const scroll=K.scroll(0,size*.22,size*.22,1.05,-Math.PI/2,side,22);
        parts.push([K.stem(scroll,size*.04,size*.008,26,5),
          K.place(K.RZ(angle),K.TR(p.x,p.y,p.z+.002))]);
        if(i%3===1)parts.push([bud,K.TR(p.x,p.y,p.z+.009)]);
      }
      return mergeRelief(parts);
    }

    // A solid rolled ribbon gives each scroll a broad carved shoulder and
    // recessed return. It keeps indexed vertices and a closed cross-section.
    function rolledScroll(points,width){
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
      const positions=[],uv=[],indices=[],steps=32;
      const section=[[-1,0],[-.72,.42],[0,1],[.72,.42],[1,0],[0,-.18]];
      for(let i=0;i<=steps;i++){
        const t=i/steps,p=curve.getPointAt(t),d=curve.getTangentAt(t);
        const taper=1-.72*t,w=width*taper,h=width*.7*taper;
        for(let j=0;j<section.length;j++){
          const [across,rise]=section[j];
          positions.push(p.x-d.y*across*w,p.y+d.x*across*w,p.z+rise*h);
          uv.push(t,j/section.length);
          if(i<steps){
            const a=i*6+j,b=i*6+(j+1)%6,c=a+6,e=b+6;
            indices.push(a,c,b,b,c,e);
          }
        }
      }
      for(let j=1;j<5;j++)indices.push(0,j,j+1,steps*6,steps*6+j+1,steps*6+j);
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
      geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
      geometry.setIndex(indices);geometry.computeVertexNormals();
      return geometry;
    }

    function carvedRosette(radius){
      const pieces=[];
      for(const [n,scale,tilt] of [[12,1,.22],[9,.68,.56],[7,.38,.88]]){
        const petal=K.leaf({len:radius*scale,wid:radius*scale*.83,thick:radius*.08,curl:1.05,lobes:0,cup:.55,seg:8});
        for(let i=0;i<n;i++)pieces.push([petal,K.place(K.RX(tilt),K.RZ((i+.35*scale)/n*Math.PI*2))]);
      }
      pieces.push([new T.SphereGeometry(radius*.15,10,6),K.TR(0,0,radius*.07)]);
      return mergeRelief(pieces);
    }

    // Paired volutes carry broad overlapping fronds. This is a complete
    // carved repeat with a shared root, rather than separate leaf sprigs.
    const scrollRepeats=new Map();
    function scrollRepeat(w,h){
      const key=w+'/'+h;
      if(scrollRepeats.has(key))return scrollRepeats.get(key);
      const pieces=[],size=Math.min(w,h),flower=carvedRosette(size*.22);
      pieces.push([flower,K.TR(0,-h*.24,.008)]);
      for(const side of [-1,1]){
        const spiral=K.scroll(w*.22,0,w*.22,1.25,-Math.PI/2,1,40)
          .map(([x,y])=>[side*x,y*h/(w*.64),.008]);
        const root=[[0,-h*.42,0],[side*w*.12,-h*.40,0],spiral[0]];
        pieces.push([rolledScroll([...root,...spiral.slice(1)],size*.048),null]);
        const curve=new T.CatmullRomCurve3(spiral.map(p=>new T.Vector3(...p)));
        for(let i=0;i<7;i++){
          const t=.08+i*.115,p=curve.getPointAt(t),d=curve.getTangentAt(t);
          const length=size*(.36-.16*t),angle=Math.atan2(d.y,d.x)-Math.PI/2+side*.85;
          const blade=carvedBlade(length,length*.64,1.05,3,10);
          pieces.push([blade,K.place(K.RZ(angle),K.TR(p.x,p.y,p.z+.005))]);
          const small=carvedBlade(length*.55,length*.34,1.25,2,8);
          pieces.push([small,K.place(K.RZ(angle-side*1.45),K.TR(p.x,p.y,p.z+.009))]);
        }
      }
      const geometry=mergeRelief(pieces);
      scrollRepeats.set(key,geometry);return geometry;
    }

    function insideReliefShape(x,y,shape){
      const inside=polygon=>{
        let hit=false;
        for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
          const a=polygon[i],b=polygon[j];
          if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)hit=!hit;
        }
        return hit;
      };
      return inside(shape.contour)&&!shape.holes.some(inside);
    }

    // Whole repeats are fitted to the actual supporting shape. A repeat is
    // omitted at a tight corner instead of cutting leaves across an opening.
    function reliefBand(g,shape,points,{name,face,offset,w,h,count}){
      const mask={contour:shape.getPoints(36),holes:shape.holes.map(hole=>hole.getPoints(36))};
      const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(p.x,p.y,0)));
      const repeat=scrollRepeat(w,h),parts=[],p=new T.Vector3();
      for(let i=0;i<count;i++){
        const t=(i+.5)/count,at=curve.getPointAt(t),d=curve.getTangentAt(t);
        const x=at.x-d.y*offset,y=at.y+d.x*offset;
        const matrix=K.place(K.RZ(Math.atan2(d.y,d.x)),K.TR(x,y,0));
        const vertices=repeat.attributes.position;
        let fits=true;
        for(let v=0;v<vertices.count;v++){
          p.fromBufferAttribute(vertices,v).applyMatrix4(matrix);
          if(!insideReliefShape(p.x,p.y,mask)){fits=false;break;}
        }
        if(fits)parts.push([repeat,matrix]);
      }
      const relief=mesh(mergeRelief(parts),gold,g,name,0,0,face);
      relief.userData={status:'CONCEPT · fitted rolled-scroll and layered foliage relief',
        engineeringApproved:false,source:'Approved sanctuary concept; owner review, 7 Nov 2026',
        repeats:parts.length,reliefMask:{contour:mask.contour.map(p=>[p.x,p.y]),holes:mask.holes.map(hole=>hole.map(p=>[p.x,p.y]))},face};
      return relief;
    }

    function pilasterRelief(g,{u,y0,y1,w,face,depth,name}){
      const h=y1-y0,mid=(y0+y1)/2,fieldW=w*.88,front=face+.030;
      box(g,fieldW,h,.018,u,mid,face+.004,satin,name+' · red lacquer field');
      for(const e of [-1,1]){
        box(g,.011,h,.012,u+e*(fieldW/2-.006),mid,front,gold,name+' · gilded edge');
        // Red lacquer remains visible on the returns, with one small gilded line.
        box(g,.012,h,.012,u+e*(w/2+.002),mid,face-depth*.52,gold,name+' · gilded return');
      }
      for(const y of [y0+.006,y1-.006])box(g,fieldW,.012,.012,u,y,front,gold,name+' · gilded edge');
      const pieces=[];
      if(name==='Central pilaster'||name==='Wing pilaster'){
        const repeat=scrollRepeat(w*.82,w*1.35);
        repeat.computeBoundingBox();
        const bounds=repeat.boundingBox,size=bounds.getSize(new T.Vector3()),middle=bounds.getCenter(new T.Vector3());
        const count=Math.max(4,Math.round(h/(w*1.45))),pitch=(h-.14)/count;
        pieces.push([K.stem([[0,.06,0],[0,h-.06,0]],.008,.006,20,6),null]);
        for(let i=0;i<count;i++){
          const matrix=K.place(K.TR(-middle.x,-middle.y,-bounds.min.z),
            K.SC(w*.75/size.x,pitch*.90/size.y,.72),K.TR(0,.07+pitch*(i+.5),0));
          pieces.push([repeat,matrix]);
        }
      }else{
        const amp=w*.04,n=Math.max(3,Math.round(h/.36)),stemX=t=>amp*Math.sin(t*Math.PI*2);
        pieces.push([K.stem(Array.from({length:25},(_,i)=>{const t=i/24;return [stemX(t),h*t,0];}),.011,.007,48,7),null]);
        const leaf=K.leaf({len:w*.34,wid:w*.22,thick:.022,curl:.85,lobes:3,seg:8});
        const bloom=K.bloom({r:w*.12,petals:7,rings:2,seg:4});
        for(let i=0;i<n;i++){
          const t=(i+.5)/n,y=h*t,x=stemX(t);
          for(const e of [-1,1]){
            const branchX=e*w*.065;
            pieces.push([K.stem([[x,y,0],[x+e*w*.035,y+.015,.002],[branchX,y+.035,.003]],.007,.005,8,6),null]);
            pieces.push([leaf,K.place(K.RZ(-e*.9),K.TR(branchX,y+.035,.003))]);
          }
          if(i%2===0)pieces.push([bloom,K.place(K.SC(1,1,.8),K.TR(x,y,.006))]);
        }
      }
      const relief=mesh(mergeRelief(pieces),gold,g,name+' · carved foliage',u,y0,front+.004);
      relief.userData={status:'CONCEPT · parcel-gilt relief on lacquer; artisan, material and fixing pending',engineeringApproved:false,source:'Approved sanctuary concept; owner detail review, 7 Nov 2026; docs/sanctuary-model.md'};
      return relief;
    }
    function archShape(half,spring,rise,bottom){const s=new T.Shape();s.moveTo(-half,bottom);s.lineTo(-half,spring);s.bezierCurveTo(-half,spring+rise*.35,-half*.55,spring+rise*.4,-half*.5,spring+rise*.65);s.bezierCurveTo(-half*.4,spring+rise*.92,-.13,spring+rise,0,spring+rise);s.bezierCurveTo(.13,spring+rise,half*.4,spring+rise*.92,half*.5,spring+rise*.65);s.bezierCurveTo(half*.55,spring+rise*.4,half,spring+rise*.35,half,spring);s.lineTo(half,bottom);s.closePath();return s;}
    function slab(g,shape,from,to,mat,name){return mesh(new T.ExtrudeGeometry(shape,{depth:to-from,bevelEnabled:false,curveSegments:18}),mat,g,name,0,0,from);}
    function arch(g,half,spring,rise,bottom,depth,mat,name,hole){const s=archShape(half,spring,rise,bottom);if(hole)s.holes.push(hole);return slab(g,s,depth,depth+.13,mat,name);}
    function crown(g,w,spring,rise,v,crestHalf=null){
      const pts=[[-w,spring,v],[-w*.93,spring+rise*.25,v],[-w*.52,spring+rise*.5,v],[-w*.36,spring+rise*.86,v],[0,spring+rise,v],[w*.36,spring+rise*.86,v],[w*.52,spring+rise*.5,v],[w*.93,spring+rise*.25,v],[w,spring,v]];
      line(g,pts,.045);
      // On the lowest central crown, stop the leaves before the outer pinnacles;
      // the continuous underlying moulding still carries the shape of the arch.
      const trace=crestHalf===null?pts:new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))).getPoints(120).filter(p=>Math.abs(p.x)<=crestHalf).map(p=>[p.x,p.y]);
      crest(g,trace,v+.01,.17,Math.round(w*14*(crestHalf===null?1:crestHalf/w)),-1);
    }
    // Relief plate on a face: metre-based texture coordinates, a few millimetres proud of the timber.
    function plate(g,w,h,u,y,v,finish,name,upright){const o=mesh(K.plate(w,h,1,upright),finish,g,name,u,y,v);o.castShadow=false;return o;}
    function crest(g,points,v,size,count,out=1,name='Gilded leaf cresting'){return mesh(K.cresting(points,{size,count,out}),gold,g,name,0,0,v);}
    function border(g,u,y,w,h,v){for(const e of [-1,1]){box(g,.025,h,.035,u+e*w/2,y,v,gold,'Panel gold border');box(g,w,.025,.035,u,y+e*h/2,v,gold,'Panel gold border');}}
    function panel(g,u,y,w,h,v,finish=scrollwork){box(g,w,h,.14,u,y,v,wood,'Carved lacquer panel');plate(g,w*.84,h*.86,u,y,v+.073,finish,'Carved panel relief');border(g,u,y,w*.86,h*.88,v+.09);}
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
      mesh(new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:false,curveSegments:32}),satin,g,name,0,0,-.16);
      for(const v of [-.19,.19])line(g,trace.map(p=>[p.x,p.y,v]),.06);
      crest(g,trace.map(p=>[p.x,p.y]),.2,half>2?.22:.15,blooms,-1,'Gilded arch cresting');
      const large=half>2;
      reliefBand(g,shape,trace,{name:name+' · rolled scroll border',face:.166,offset:large?.30:.20,w:large?.43:.29,h:large?.27:.20,count:large?30:20});
      reliefBand(g,shape,trace,{name:name+' · foliate outer field',face:.166,offset:large?.72:.51,w:large?.53:.33,h:large?.37:.27,count:large?24:17});

      // A fine inner bead and individually modelled floral relief make the arch read as
      // layered carving at eye level. Keep it on the spandrel face, outside the opening.
      line(g,trace.map(p=>[cx+(p.x-cx)*.985,p.y+.11,.185]),.014,gold,'Arch inner gilded bead');
      for(const e of [-1,1]){
        const u=cx+e*(half-.08);
        box(g,.2,.3,.42,u,a.spring-.13,0,gold,'Gilded arch corbel');
        box(g,.25,.035,.43,u,a.spring-.01,0,wood,'Lacquered corbel cap');
        flower(g,u,a.spring-.13,.225,.045);
      }
    }
    function group(name,x,z){const g=new T.Group();g.name=name;g.position.set(x,0,z);g.rotation.y=-Math.PI/2;root.add(g);return g;}
    // The four outer concrete-column proxies at the front and back of the side
    // passages stay intact. A thin, removable-looking lacquer skin carries the
    // same bounded gold carving onto their exposed faces; it is a finish study,
    // not an assumed fixing or a change to the structural core.
    const supportCores=[];
    building.updateMatrixWorld(true);
    building.traverse(o=>{
      if(!o.isMesh||o.name!=='Side column — illustrative shaft width')return;
      const b=new T.Box3().setFromObject(o),c=b.getCenter(new T.Vector3());
      const axis=['10','11'].find(a=>Math.abs(c.x-data.longitudinal[a])<.01);
      if(axis&&Math.abs(Math.abs(c.z)-7.36)<.05)supportCores.push({axis,c,b});
    });
    // Owner, 7 Nov 2026: the supports stand in the C/G wall line and reach 0.18 m into the porch,
    // where the red and gold read as a fault. Only what is seen indoors is clad: the nave-facing
    // face and, at axis 10, the face toward the wing carry the carving; the side faces are clad
    // from the inner face to the wall (|Z| 7.25), the axis-10 porch face only inside the wing up to
    // its closing wall; the porch faces stay in the plaster of the wall.
    const wallInside=7.25,wingWallWest=(window.CHURCH_PORCHES?.spec.wingEnds?.[1]??44.175)-(window.CHURCH_PORCHES?.spec.wingWall??.32)/2;
    for(const {axis,c,b} of supportCores){
      const side=c.z<0?'B':'H',sz=Math.sign(c.z),g=group(`Concrete support cladding · ${axis}/${side}`,c.x,c.z);
      g.userData={status:'CONCEPT · lacquered finish over existing concrete support, interior faces only; fire performance, substrate, fixing and access pending',engineeringApproved:false,source:'Owner clarifications, 3 and 7 Nov 2026; docs/sanctuary-model.md'};
      const size=b.getSize(new T.Vector3()),half=size.x/2,skin=.002;
      for(let face=0;face<4;face++){
        // The group turns −90° about Y: face 0 looks to −X, 1 to +Z, 2 to +X, 3 to −Z; local u runs along (cos θ, 0, −sin θ).
        const th=(face-1)*Math.PI/2,nx=Math.round(Math.sin(th)),nz=Math.round(Math.cos(th)),ux=Math.round(Math.cos(th)),uz=-Math.round(Math.sin(th));
        let span=[-size.z/2,size.z/2],carve=true;
        const clip=(o,d,limit)=>{const u=(limit-o)/d;return d>0?[span[0],Math.min(span[1],u)]:[Math.max(span[0],u),span[1]];};
        if(nz===sz){if(axis!=='10')continue;span=clip(c.x,ux,wingWallWest);carve=false;}
        else if(nx!==0&&!(axis==='10'&&nx<0)){span=clip(c.z*sz,uz*sz,wallInside);carve=false;}
        if(span[1]-span[0]<.02)continue;
        const panel=new T.Group();panel.name='Concrete support cladding · face';panel.rotation.y=face*Math.PI/2;g.add(panel);
        box(panel,span[1]-span[0],size.y,skin,(span[0]+span[1])/2,c.y,half+skin/2,satin,'Concrete support cladding · lacquer skin');
        if(!carve)continue;
        // The porch speakers at the back frame sit against the nave-facing
        // surface. Reserve a clear red panel around each rather than forcing
        // carving through a speaker or moving a coordinated fixture.
        const inside=side==='B'?1:3;
        const spans=axis==='11'&&face===0?[[.84,1.98],[3.42,5.34]]:
          axis==='11'&&face===inside?[[.84,2.44],[2.96,5.34]]:[[.84,5.34]];
        for(const [y0,y1] of spans)pilasterRelief(panel,{u:0,y0,y1,w:.46,face:half+skin,depth:skin,name:'Concrete support'});
      }
    }
    // Niche outline, optionally grown by a casing thickness, as a shape or as a hole.
    // (Holes are wound against their contour, or their reveals would face into the timber.)
    const N=spec.niche,outline=(grow=0)=>archShape(N.half+grow,N.spring,N.rise+grow,N.floor-grow),opening=grow=>new T.Path(outline(grow).getPoints(18).reverse());
    const casing=(outer,inner)=>{const s=outline(outer);s.holes.push(opening(inner));return s;};
    const center=group('Central gilded reredos',spec.centerX,0);
    arch(center,3.26,8.05,2.3,DAIS,-.23,satin,'Outer carved canopy',opening(N.lining));
    for(let j=0;j<3;j++)crown(center,3.05+j*.075,7.75+j*.23,1.95+j*.09,.03+j*.04,j===0?2.35:null);
    arch(center,3.14,6.6,2.35,DAIS,0,satin,'Central carved timber silhouette',opening(N.lining));
    // The first two canopy mouldings enclose a narrow running frieze. Author
    // its stems along that architectural curve instead of scattering ornaments.
    const canopyPath=[[-2.95,8.02,0],[-2.78,8.40,0],[-1.58,8.86,0],[-1.07,9.56,0],[0,9.82,0],[1.07,9.56,0],[1.58,8.86,0],[2.78,8.40,0],[2.95,8.02,0]];
    const canopyFrieze=mesh(carvedVine(canopyPath,{size:.055,count:92}),gold,center,'Canopy · running foliate frieze',0,0,-.095);
    canopyFrieze.userData={status:'CONCEPT · fine relief between existing canopy mouldings',engineeringApproved:false,source:'Approved sanctuary concept; owner detail review, 7 Nov 2026'};
    // A paired crown scroll fills the upper red lunette. Its backing is the
    // outer canopy, behind the separate lower reredos ground.
    const crownParts=[[K.bloom({r:.14,petals:11,rings:3,seg:7}),K.TR(0,9.20,.008)]];
    for(const e of [-1,1])crownParts.push([carvedVine([[0,9.20,0],[e*.34,9.32,0],[e*.72,9.04,0],[e*1.16,8.83,0],[e*1.31,8.99,0],[e*1.05,9.17,0],[e*.90,9.02,0]],{size:.16,count:16,mirror:e}),null]);
    const crownScroll=mesh(mergeRelief(crownParts),gold,center,'Canopy · paired crown scroll',0,0,-.085);
    crownScroll.userData={status:'CONCEPT · raised crown scroll on the existing canopy',engineeringApproved:false,source:'Approved sanctuary concept; owner detail review, 7 Nov 2026'};

    // Deep crucifix niche. Local v runs towards the nave: mouth at the reredos face, blue wall
    // 1.0 m behind it. A lacquered reveal lines it; a plaster casing shows in the service room,
    // boxed out above the boards and standing through the notched ceiling slab.
    const vMouth=spec.centerX-N.mouthX,vBack=spec.centerX-N.backX,vRoom=spec.centerX-(data.longitudinal['11']+.12),vEnd=spec.centerX-N.endX,plaster=mat?.wall||wood;
    slab(center,casing(N.lining,0),vBack,vMouth,satin,'Crucifix niche reveal · lacquered timber');
    slab(center,outline(N.lining),vBack-.05,vBack,glowing(blue,K.glow('#d7ecfb','#4aa0e6','#1c6fc6'),N.half+N.lining,N.floor-N.lining,N.rise+N.spring-N.floor+2*N.lining),'Blue crucifix recess');
    slab(center,casing(N.shell,N.lining+.01),vEnd+.08,vRoom,plaster,'Crucifix niche casing · plaster');
    slab(center,outline(N.shell),vEnd,vEnd+.08,plaster,'Crucifix niche casing · plaster');
    const rim=outline().getPoints(18).slice(0,-1);  // open at the floor: a closed spline would sag below it
    for(const v of [vBack+.03,(vBack+vMouth)/2,vMouth-.03])line(center,rim.map(p=>[p.x*.99,N.floor+(p.y-N.floor)*.995,v]),.028);
    box(center,N.half*2,.04,.07,0,N.floor+.02,vMouth-.035,gold,'Gilded niche sill');
    // The cross stands on a stepped base on the niche floor.
    const vCross=spec.centerX-(N.backX-.17);
    for(const [w,h,d,y] of [[.6,.3,.34,.15],[.42,.28,.28,.44],[.27,.24,.22,.7]]){box(center,w,h,d,0,N.floor+y,vCross,satin,'Crucifix base step');box(center,w+.04,.03,d+.04,0,N.floor+y+h/2,vCross,gold,'Gilded base step edge');}
    // Frame the niche without carrying the mouldings across the four pilasters.
    // The two beads follow its real opening, leaving the deeper reveal legible.
    for(const grow of [.025,.055]){
      const curve=outline(grow).getPoints(28).filter(p=>p.y>=N.spring-1e-6);
      line(center,curve.map(p=>[p.x,p.y,.25]),.012,gold,'Crucifix niche · outer bead');
    }
    // Owner, 3 Nov 2026 (centre of the sanctuary): a gilded glory of carved rays on the blue wall behind the
    // cross, centred on the crossing of the cross, long and short rays alternating, inside the niche outline.
    {
      const C={y:5.88,r0:.24,long:1.32,short:.92,count:36},rays=[];
      for(let k=0;k<C.count;k++){
        const a=k/C.count*Math.PI*2,L=k%2?C.short:C.long,w0=k%2?.035:.05,ray=new T.Shape();
        ray.moveTo(C.r0,-w0);ray.lineTo(L,-.004);ray.lineTo(L,.004);ray.lineTo(C.r0,w0);ray.closePath();
        const g=new T.ExtrudeGeometry(ray,{depth:.014,bevelEnabled:false});
        rays.push([g,K.place(K.RZ(a),K.TR(0,C.y,0))]);
      }
      const glory=mesh(K.merge(rays),gold,center,'Crucifix niche · gilded glory',0,0,vBack+.002);
      glory.castShadow=false;
      glory.userData={status:'CONCEPT · carved gilded rays on the niche wall; artisan, substrate and fixing pending',engineeringApproved:false,source:'Owner request 3 Nov 2026 (centre of the sanctuary); docs/sanctuary-model.md'};
      // A carved gilded architrave round the niche opening, from the floor over the lobed head, with leaf
      // cresting outside the arch and a rosette at each springing. The beads above sit on its face.
      const band=outline(.14);band.holes.push(opening(N.lining));
      const frame=mesh(new T.ExtrudeGeometry(band,{depth:.104,bevelEnabled:false,curveSegments:24}),gilded,center,'Crucifix niche · gilded architrave',0,0,.134);
      frame.userData={status:'CONCEPT · carved gilded architrave; artisan, substrate and fixing pending',engineeringApproved:false,source:'Owner request 3 Nov 2026 (centre of the sanctuary); docs/sanctuary-model.md'};
      // Chased foliage stays on the existing 90 mm face of the architrave.
      // The broad leaf cresting outside it remains a separate scale of carving.
      const chasedHead=outline(.095).getPoints(36).filter(p=>p.y>=N.spring-.001).map(p=>[p.x,p.y,0]);
      const chasing=[[carvedVine(chasedHead,{size:.024,count:70}),null]];
      for(const e of [-1,1])chasing.push([carvedVine([[e*(N.half+.095),N.floor+.12,0],[e*(N.half+.095),N.spring-.04,0]],{size:.024,count:28,mirror:e}),null]);
      const chased=mesh(mergeRelief(chasing),gold,center,'Crucifix niche · chased foliage band',0,0,.245);
      chased.userData={status:'CONCEPT · shallow foliate chasing on the existing architrave',engineeringApproved:false,source:'Owner detail review, 7 Nov 2026; docs/sanctuary-model.md'};

      const head=outline(.15).getPoints(28).filter(p=>p.y>=N.spring+.05&&Math.abs(p.x)<=1.8).map(p=>[p.x,p.y]);
      crest(center,head,.24,.1,26,-1,'Crucifix niche · leaf cresting');
      for(const e of [-1,1])flower(center,e*(N.half+.095),N.spring,.245,.06);
    }
    const spire=K.pinnacle({w:.3,h:1.15}),smallSpire=K.pinnacle({w:.2,h:.95});
    // Owner, 3 Nov 2026: the four pilasters beside the crucifix are lower, their capitals at the niche
    // springing (+6.15, were +6.87), so the gilded niche head and the carving above it read clearly.
    const PT=spec.reredosPilasterTop;
    for(const sign of [-1,1])for(let k=0;k<2;k++){
      const u=sign*(2.15+k*.64),foot=2.525,top=PT+.085;box(center,.33,top-foot,.36,u,(foot+top)/2,.23,wood,'Carved central pilaster');
      pilasterRelief(center,{u,y0:2.7,y1:PT-.17,w:.33,face:.41,depth:.36,name:'Central pilaster'});
      for(const y of [2.53,PT]){
        box(center,.52,.17,.5,u,y,.23,wood,'Pilaster lacquer capital');
        for(const e of [-1,1])box(center,.52,.024,.52,u,y+e*.07,.23,gold,'Pilaster capital · gilded moulding');
        flower(center,u,y,.49,.035);
        mesh(carvedVine([[-.22,0,0],[.22,0,0]],{size:.045,count:9}),gold,center,'Pilaster capital · carved frieze',u,y,.493);
      }
      mesh(spire,gold,center,'Carved pinnacle',u,top,.25);
    }
    // The carved ground round the niche, between the pilasters and above them.
    {
      const ground=archShape(3.1,6.6,2.3,2.3);ground.holes.push(opening(N.lining+.1));
      mesh(new T.ShapeGeometry(ground,18),reredosLacquer,center,'Reredos carved ground',0,0,.134).castShadow=false;
      const carvingField=ground.clone();
      for(const sign of [-1,1])for(const u of [sign*2.15,sign*2.79]){
        const reserve=new T.Path();
        reserve.moveTo(u-.21,2.4);reserve.lineTo(u+.21,2.4);reserve.lineTo(u+.21,7.48);reserve.lineTo(u-.21,7.48);reserve.closePath();
        carvingField.holes.push(reserve);
      }
      const crownReserve=new T.Path();
      crownReserve.moveTo(-.27,7.60);crownReserve.lineTo(.27,7.60);crownReserve.lineTo(.27,8.80);crownReserve.lineTo(-.27,8.80);crownReserve.closePath();
      carvingField.holes.push(crownReserve);
      const carvingArc=outline(.14).getPoints(32).filter(p=>p.y>=N.spring-.001);
      reliefBand(center,carvingField,carvingArc,{name:'Reredos · rolled arch scrolls',face:.155,offset:.25,w:.36,h:.27,count:24});
      reliefBand(center,carvingField,carvingArc,{name:'Reredos · layered shoulder carving',face:.155,offset:.58,w:.41,h:.30,count:22});

      // A connected, mirrored foliate spray fills the clear field above the niche.
      // It stops inside the pilasters and below the outer canopy instead of crossing them.
      const ornament=mesh(mergeRelief([
        [carvedVine([[-1.76,6.42,0],[-1.52,6.91,0],[-1.10,7.18,0],[-.69,7.58,0],[0,7.82,0]],{size:.22,count:13,mirror:-1}),null],
        [carvedVine([[1.76,6.42,0],[1.52,6.91,0],[1.10,7.18,0],[.69,7.58,0],[0,7.82,0]],{size:.22,count:13}),null],
        [K.bloom({r:.21,petals:11,rings:3,seg:7}),K.TR(0,7.85,.012)],
        ...[-1,1].map(e=>[carvedVine([[0,7.85,0],[e*.34,7.98,0],[e*.80,7.74,0],[e*1.12,7.85,0],[e*.98,8.08,0],[e*.82,8.25,0],[e*.60,8.10,0],[e*.70,7.96,0]],{size:.18,count:16,mirror:e}),null]),
        [carvedVine([[0,7.85,0],[-.22,8.08,0],[-.38,8.29,0],[0,8.55,0]],{size:.17,count:8,mirror:-1}),null],
        [carvedVine([[0,7.85,0],[.22,8.08,0],[.38,8.29,0],[0,8.55,0]],{size:.17,count:8}),null]
      ]),gold,center,'Reredos · connected foliate spray',0,0,.155);
      ornament.userData={status:'CONCEPT · raised carving on the reredos; artisan, substrate and fixing pending',engineeringApproved:false,source:'Approved sanctuary concept; owner detail review, 7 Nov 2026; docs/sanctuary-model.md'};
      // Owner, 3 Nov 2026: more gold on the red. Above the lowered pilasters a gilded scroll cartouche
      // follows the canopy crown on each side of the niche head, and a gilded rosette medallion with a ring
      // of leaves fills the red ground above the spray.
      const status={status:'CONCEPT · raised gilded carving on the red reredos; artisan, substrate and fixing pending',engineeringApproved:false,source:'Owner requests, 3 and 7 Nov 2026; approved sanctuary concept; docs/sanctuary-model.md'};
      for(const e of [-1,1]){
        const scroll=mesh(mergeRelief([
          [carvedVine([[-.42,-.08,0],[-.28,.16,0],[0,.23,0],[.28,.16,0],[.42,-.08,0]],{size:.16,count:9,mirror:e}),null],
          [K.bloom({r:.13,petals:9,rings:3,seg:6}),K.TR(0,.23,.008)]
        ]),gold,center,'Reredos · gilded spandrel scroll',e*2.45,8.02,-.085);
        scroll.rotation.z=e*-.36;scroll.userData=status;
      }
      const leafRing=[],blade=carvedBlade(.13,.065,.9);
      for(let k=0;k<12;k++){const a=k/12*Math.PI*2;leafRing.push([blade,K.place(K.RZ(a-Math.PI/2),K.TR(Math.cos(a)*.2,Math.sin(a)*.2,0))]);}
      leafRing.push([K.bloom({r:.13,petals:10,rings:3,seg:7}),null],[new T.TorusGeometry(.17,.014,6,40),null]);
      const medallion=mesh(K.merge(leafRing),gold,center,'Reredos · gilded rosette medallion',0,8.55,.15);medallion.userData=status;
    }
    for(const y of [.86,1.18,2.25,2.5]){box(center,6.4,.14,.48,0,y,.28,wood,'Reredos cornice');box(center,6.45,.035,.5,0,y+.075,.3,gold,'Gilded cornice edge');}
    // Friezes between the cornices, and small spires on the gradine either side of the tabernacle.
    plate(center,6.4,.18,0,1.02,.521,gilded,'Reredos frieze relief');plate(center,6.4,.11,0,2.375,.521,gilded,'Reredos frieze relief');
    // Fine running relief on the two friezes gives the gilding a carved edge
    // under grazing light while keeping clear of the cornice mouldings.
    for(const [y,size,count] of [[1.02,.055,64],[2.375,.034,80]]){
      const frieze=mesh(carvedVine([[-3.1,y,0],[3.1,y,0]],{size,count}),gold,center,'Reredos frieze · running foliate relief',0,0,.533);
      frieze.userData={status:'CONCEPT · shallow relief on the existing frieze',engineeringApproved:false,source:'Owner detail review, 7 Nov 2026; docs/sanctuary-model.md'};
    }
    for(const u of [-2.95,-1.6,1.6,2.95])mesh(smallSpire,gold,center,'Carved pinnacle',u,2.59,.42);
    // Rooted lotus-and-leaf carving on the existing lower panels: each motif has its
    // own inner moulding and stays within the existing panel outline.
    // A rooted floral composition in each lower red panel, with rolled leaves
    // and fine inner mouldings. All seven panels reuse this one relief buffer.
    const lowerParts=[
      [K.bloom({r:.13,petals:11,rings:3,seg:7}),K.TR(0,.16,.01)],
      [carvedVine([[0,-.25,0],[0,-.06,0],[0,.12,0]],{size:.10,count:5}),null]
    ];
    for(const e of [-1,1]){
      lowerParts.push([carvedVine([[0,-.24,0],[e*.14,-.16,0],[e*.19,-.01,0],[e*.12,.08,0],[e*.06,.01,0]],{size:.08,count:9,mirror:e}),null]);
      lowerParts.push([new T.BoxGeometry(.008,.62,.008),K.TR(e*.29,0,0)],
        [new T.BoxGeometry(.58,.008,.008),K.TR(0,e*.31,0)]);
    }
    const lowerCarving=mergeRelief(lowerParts);
    for(let u=-2.7;u<3;u+=.9){
      panel(center,u,1.72,.78,.86,.4,satin);
      mesh(lowerCarving,gold,center,'Reredos lower panel · carved lotus',u,1.72,.482);
    }


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
    // On axis 9 the ambo key light and the presider light hang beside the capital: its nave face has no fleuron.
    const bareHead={[-1]:K.capital({r:.297,h:.8,bare:0}).gilt,1:K.capital({r:.297,h:.8,bare:2}).gilt};
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
      mesh(key==='9'?bareHead[e]:head.gilt,gold,root,'Column carving · capital volutes',x,7.79,z);
      mesh(junction,wood,root,'Column carving · junction block',x,8.885,z);
      mesh(headCarving,carve,root,'Column carving · junction foliage',x,8.885,z);
      mesh(headGilding,gold,root,'Column carving · junction blooms and die panels',x,8.885,z);
    }

    // Chamber from the frame back to the reredos: gilded boarded vault on the arch line,
    // lacquered ribs, and a timber lining over the plaster back wall.
    const depth=spec.frameX-48.52,inner=lobed(0,A.half,A).getPoints(12);
    const outer=lobed(0,A.half+.08,{spring:A.spring,shoulder:A.shoulder+.09,crown:A.crown+.09}).getPoints(12).reverse();
    mesh(new T.ExtrudeGeometry(new T.Shape(inner.concat(outer)),{depth:-depth-.16,bevelEnabled:false}),leafGold,front,'Chamber vault · gilded boarding',0,0,depth);
    for(const v of spec.ceilingGrid.localStations)line(front,inner.map(p=>[p.x,p.y-.02,v]),.075,wood,'Chamber vault rib · lacquered timber');
    const vaultPath=new T.CatmullRomCurve3(inner.map(p=>new T.Vector3(p.x,p.y,0)));
    for(const t of [.14,.32,.5,.68,.86]){
      const p=vaultPath.getPoint(t);box(front,.09,.09,-depth-.2,p.x,p.y-.03,(depth-.16)/2,wood,'Chamber vault longitudinal rib');
      for(const v of spec.ceilingGrid.localStations)vaultBoss(front,p.x,p.y-.07,v);
    }
    // Thin inset lacquer lines trace the existing coffer fields, following the
    // actual vault curve and stopping short of the structural-looking ribs.
    // Their shallow projection is appearance only, with no changed vault shell.
    const vaultBands=[.14,.32,.5,.68,.86], vaultStations=[-3.55,-2.7,-1.85,-1];
    for(let i=0;i<vaultBands.length-1;i++)for(let j=0;j<vaultStations.length-1;j++){
      const t0=vaultBands[i]+.018,t1=vaultBands[i+1]-.018,v0=vaultStations[j]+.10,v1=vaultStations[j+1]-.10;
      const at=(t,v)=>{const p=vaultPath.getPoint(t);return [p.x,p.y-.018,v];};
      const edge=[];
      for(let k=0;k<=8;k++)edge.push(at(t0+(t1-t0)*k/8,v0));
      edge.push(at(t1,v1));
      for(let k=8;k>=0;k--)edge.push(at(t0+(t1-t0)*k/8,v1));
      edge.push(at(t0,v0));
      line(front,edge,.010,wood,'Vault coffer · inset lacquer moulding');
      // A single connected stem and paired curved leaves sit on the same surface.
      const mid=(v0+v1)/2,dt=t1-t0;
      line(front,Array.from({length:9},(_,k)=>at(t0+dt*(.2+.6*k/8),mid)),.007,wood,'Vault coffer · foliate stem');
      for(const e of [-1,1])for(const q of [.36,.62]){
        const t=t0+dt*q;
        line(front,[at(t,mid),at(t+dt*.05,mid+e*.07),at(t+dt*.16,mid+e*.11),at(t+dt*.12,mid+e*.04),at(t,mid)],.006,wood,'Vault coffer · foliate leaf');
      }
    }
    const back=lobed(0,A.half,A);back.lineTo(A.half,DAIS);back.lineTo(-A.half,DAIS);back.closePath();back.holes.push(opening(N.lining));
    mesh(new T.ExtrudeGeometry(back,{depth:.1,bevelEnabled:false,curveSegments:32}),wood,front,'Chamber back lining · lacquered timber',0,0,spec.frameX-48.5);
    // The plaster back wall on axis 11 opens for the niche in the same outline.
    building.traverse(o=>{
      if(o.name!=='Sanctuary back wall behind the reredos')return;
      const wall=lobed(0,A.half,A);wall.lineTo(A.half,.15);wall.lineTo(-A.half,.15);wall.closePath();wall.holes.push(opening(N.lining));
      o.geometry.dispose();o.geometry=new T.ExtrudeGeometry(wall,{depth:.2,bevelEnabled:false,curveSegments:32});
    });
    // Lintels on the D/E lines, hidden behind the gilded cove (owner, 3 Nov 2026). Local +v faces the sanctuary axis.
    const C=spec.chamber,length=C.x1-C.x0,thick=C.outer-C.lintelFace,face=thick/2,toFace=(C.lintelFace+C.outer)/2-C.face;
    for(const sign of [-1,1]){
      const g=new T.Group();g.name=`Chamber side wall · ${sign<0?'B':'H'}`;g.position.set((C.x0+C.x1)/2,0,sign*(C.lintelFace+C.outer)/2);g.rotation.y=sign>0?Math.PI:0;root.add(g);
      // The chamber enclosure is a lining proposal, not a 450 mm structural
      // timber slab. Reserve an explicit service void between removable skins
      // without changing either visible face or the acoustic/light boundary.
      // Skin section, backing, access panels and terminations require design.
      // Parish priest, 25 Oct 2026: the lacquered and gilded walls between the axis-10 and
      // axis-11 columns are removed. What stays is a lintel from +7.0 m (spec.chamber.lintel)
      // to the vault top: it carries the gilded vaults on each side and keeps the cable void.
      // Since 3 Nov 2026 it stands behind the gilded cove and shows no lacquer.
      const skin=C.serviceLining,y0=C.lintel,height=C.top-y0,parts=[];
      for(const e of [-1,1]) {
        parts.push([new T.BoxGeometry(length,height,skin),K.TR(0,0,e*(thick-skin)/2)]);
        parts.push([new T.BoxGeometry(skin,height,thick-2*skin),K.TR(e*(length-skin)/2,0,0)]);
        parts.push([new T.BoxGeometry(length-2*skin,skin,thick-2*skin),K.TR(0,e*(height-skin)/2,0)]);
      }
      const shell=mesh(K.merge(parts),wood,g,'Chamber side lintel · lacquered timber',0,(C.top+y0)/2,0);
      shell.userData={status:'CONCEPT · removable lining with reserved service void',engineeringApproved:false,
        serviceVoid:{x0:C.x0+skin,x1:C.x1-skin,y0:y0+skin,y1:C.top-skin,zInner:C.lintelFace+skin,zOuter:C.outer-skin},
        source:'docs/electrical-grid/routing.md · concealed-routing review; lintel span, skin/backing/fire/access specification pending'};
      // Gilded springing cornice on the cove face, under the chamber vault; the two vault uplights stand on it.
      box(g,length,.2,.18,0,A.spring-.05,toFace+.06,gold,'Vault springing cornice');box(g,length,.04,.2,0,A.spring+.06,toFace+.07,gold,'Gilded cornice edge');
      for(let u=-length/2+.25;u<length/2;u+=.49)flower(g,u,A.spring-.05,toFace+.16,.075);
    }

    // Shrines stand in the side arches of axis 11, level with the crucifix (parish priest,
    // 25 October 2026); the side arches of the axis-10 frame in front of them stay open.
    // No solid panel across the doorway.
    const wingGlow=K.glow('#d3e7f6','#7fb2e0','#4d8dca'),wingSpire=K.pinnacle({w:.2,h:1});
    for(const sign of [-1,1]){
      const g=group(sign<0?'Our Lady shrine · axis 11':'Saint Joseph shrine · axis 11',spec.wingX,sign*spec.wingZ);
      for(const e of [-1,1]){
        const u=e*1.03;
        box(g,.57,2.75-SIDE,1.25,u,(2.75+SIDE)/2,-.35,wood,'Service entrance jamb');
        box(g,.63,.8-SIDE,1.32,u,(.8+SIDE)/2,-.35,stone,'Stone doorway base');
        // The white base in the owner's close-up is a provisional stone proxy,
        // not an identified structural column. Cover its faces while retaining
        // the proxy below, so the jamb's red and gold finish reaches the floor.
        const baseMid=(.8+SIDE)/2,baseHeight=.8-SIDE,skin=.002;
        for(const side of [-1,1]){
          box(g,.63,baseHeight,skin,u,baseMid,-.35+side*(.66+skin/2),satin,'Shrine base · lacquer skin');
          box(g,skin,baseHeight,1.32,u+side*(.315+skin/2),baseMid,-.35,satin,'Shrine base · lacquer skin');
        }
        border(g,u,baseMid,.49,baseHeight-.16,.316);
        mesh(K.panel({w:.40,h:.38}),gold,g,'Shrine base · carved lotus',u,baseMid,.318);
        box(g,.63,.018,1.32,u,.794,-.35,gold,'Shrine base · gilded cap');
        pilasterRelief(g,{u,y0:.85,y1:2.65,w:.50,face:.275,depth:1.25,name:'Shrine jamb'});
      }
      const shelf=spec.shrineShelf,shelfMid=sign*shelf.offset,shelfWidth=2*shelf.half;
      box(g,shelfWidth,.3,1.35,shelfMid,2.7,-.33,wood,'Raised statue shelf above entrance');plate(g,shelfWidth-.04,.2,shelfMid,2.7,.349,gilded,'Shrine shelf frieze');
      // Joined floral panels give the shelf a carved face beneath the niche;
      // the detail is inside the existing shelf footprint and clears the doors.
      const shelfCarving=K.panel({w:.39,h:.145});
      line(g,[[shelfMid-1.46,2.7,.352],[shelfMid+1.46,2.7,.352]],.008,gold,'Shrine shelf · linking stem');
      for(const u of [-1.32,-.88,-.44,0,.44,.88,1.32])mesh(shelfCarving,gold,g,'Shrine shelf · carved floral panel',shelfMid+u,2.7,.357);
      for(const y of [2.55,2.84])box(g,shelfWidth,.05,1.4,shelfMid,y,-.32,gold,'Shelf gilded moulding');
      // A lacquered wall behind the shrine closes the whole bay above the shelf, from the
      // pier line to the C/G wall and up to the roof lining, so the service room behind does
      // not show through the side arch above the shrine. Gilded band, blooms and rosette fill the head of the arch.
      const bay=new T.Shape(),zc=sign*spec.wingZ,edge=1.75;
      bay.moveTo(-edge,2.85);bay.lineTo(edge,2.85);bay.lineTo(edge,roofY(zc+edge));bay.lineTo(-edge,roofY(zc-edge));bay.closePath();
      slab(g,bay,-.55,-.42,wood,'Shrine bay fill · lacquered timber');plate(g,3.3,4.2,0,5.0,-.416,satin,'Shrine bay relief ground');
      const head=lobed(0,1.4,{spring:5.95,shoulder:6.5,crown:7.02}).getPoints(12),headPath=new T.CatmullRomCurve3(head.map(p=>new T.Vector3(p.x,p.y,-.38)));
      line(g,head.map(p=>[p.x,p.y,-.385]),.035);
      crest(g,head.map(p=>[p.x,p.y]),-.38,.13,16,-1,'Gilded arch cresting');
      flower(g,0,7.42,-.38,.13);for(const e of [-1,1])flower(g,e*.62,7.2,-.38,.08);
      arch(g,.89,5.2,1.0,2.95,-.36,glowing(wingBlue,wingGlow,.89,2.95,3.25),'Wing blue niche');
      const shrineField=bay.clone();
      shrineField.holes.push(new T.Path(archShape(.98,5.2,1.08,2.89).getPoints(32).reverse()));
      // Reserve the four pilaster faces and their pinnacles as holes in the mask.
      for(const e of [-1,1]){
        const reserved=new T.Path();
        reserved.moveTo(e*1.14-.17,2.88);reserved.lineTo(e*1.14+.17,2.88);
        reserved.lineTo(e*1.14+.17,6.60);reserved.lineTo(e*1.14-.17,6.60);reserved.closePath();
        shrineField.holes.push(reserved);
      }
      const shrineArc=archShape(.89,5.2,1,2.95).getPoints(32).filter(p=>p.y>=5.2-.001);
      reliefBand(g,shrineField,shrineArc,{name:'Shrine · carved arch scrolls',face:-.410,offset:.36,w:.35,h:.25,count:16});
      const outerArc=lobed(0,1.4,{spring:5.95,shoulder:6.5,crown:7.02}).getPoints(32);
      reliefBand(g,shrineField,outerArc,{name:'Shrine · carved canopy scrolls',face:-.410,offset:.22,w:.36,h:.27,count:18});
      for(const e of [-1,1]){
        const strip=[new T.Vector2(e*1.48,3.05),new T.Vector2(e*1.48,5.75)];
        reliefBand(g,shrineField,strip,{name:'Shrine · carved side screen',face:-.410,offset:0,w:.35,h:.24,count:7});
      }

      // Keep the niche arch on the opening side of the two pilasters. The
      // previous wider crowns crossed their shafts and pinnacles.
      for(const grow of [.025,.075]){
        const arc=archShape(.89+grow,5.2,1.0+grow,2.95).getPoints(22).filter(p=>p.y>=5.2-1e-6);
        line(g,arc.map(p=>[p.x,p.y,.06]),.012,gold,'Shrine niche · outer bead');
        if(grow===.075)crest(g,arc.map(p=>[p.x,p.y]),.07,.045,18,-1,'Shrine niche · leaf cresting');
      }
      for(const e of [-1,1]){
        const u=e*1.14;
        box(g,.22,2.67,.43,u,4.2,-.1,wood,'Wing carved pilaster');
        pilasterRelief(g,{u,y0:2.96,y1:5.46,w:.22,face:.115,depth:.43,name:'Wing pilaster'});
        mesh(wingSpire,gold,g,'Wing pinnacle',u,5.535,.03);
      }
      // Lacquered returns close the slits beside the D/E column and the C/G pier.
      for(const e of [-1,1]){box(g,.4,S.spring-SIDE,.12,e*1.55,(S.spring+SIDE)/2,-.2,wood,'Shrine return panel');box(g,.03,S.spring-.6,.03,e*1.55,(S.spring+SIDE)/2,-.13,gold,'Panel gold border');}
      // Open paired leaves, folded back behind the frontage: the doorway under the shrine
      // links the side passage behind the frame with the open service room.
      for(const e of [-1,1]){const hinge=new T.Group();hinge.position.set(e*.72,SIDE,-.28);hinge.rotation.y=-e*1.5;g.add(hinge);panel(hinge,-e*.35,1.1,.7,2.2,0);box(hinge,.035,.27,.08,-e*.58,1.06,.14,gold,'Service door handle');}
    }
    // Shallow stone foliate carving, following the pale carved altar in the
    // approved sanctuary concept. The centre cross stays clear. All parts lie
    // inside the panel outline and behind the existing cross's front plane.
    const altarFront=building.getObjectByName('Proposed altar front panel');
    if(altarFront){
      const pieces=[];
      for(const sign of [-1,1]){
        pieces.push([K.bloom({r:.065,petals:8,rings:2,seg:4}),K.place(K.SC(1,1,.4),K.TR(sign*.77,0,0))]);
        for(const [u,y,angle] of [[.47,-.19,-.65],[.57,-.1,-.9],[.87,-.19,.55],[.98,.045,.8]]){
          pieces.push([K.leaf({len:.14,wid:.065,thick:.004,curl:.25,lobes:3,seg:8}),K.place(K.RZ(sign*angle),K.TR(sign*u,y,0))]);
        }
        pieces.push([K.stem([[sign*.4,-.2,0],[sign*.59,-.16,.001],[sign*.72,-.06,.001],[sign*.94,.02,0]],.005,.002,20,6),null]);
      }
      const finish=altarFront.material.clone();finish.name='Sanctuary · shallow altar stone carving';
      finish.map=finish.bumpMap=null;finish.roughness=.62;
      palettes?.set(finish,{color:finish.color.clone(),map:null,bump:null});
      const relief=new T.Mesh(K.merge(pieces),finish);relief.name='Altar floral stone relief';
      relief.rotation.y=-Math.PI/2;relief.position.x=-altarFront.geometry.parameters.width/2-.0045;
      relief.castShadow=relief.receiveShadow=true;
      relief.userData={status:'CONCEPT · applied shallow carving; artist, stone and fixing pending',source:'Approved sanctuary concept; docs/decoration-finishes.md',revision:'2026-10-25-sculpture-detail-1'};
      altarFront.add(relief);
    }
    // Tabernacle (owner, 3 Nov 2026): a red lacquered pedestal with gilded mouldings, slender gilded
    // colonnettes either side of the door and a gilded cross on the dome. World coordinates (the
    // furnishings group carries no rotation; positions are converted into the sanctuary root).
    {
      const enc=building.getObjectByName('Proposed tabernacle enclosure'),ped=building.getObjectByName('Proposed tabernacle pedestal'),dome=building.getObjectByName('Tabernacle dome');
      if(enc&&ped&&dome){
        building.updateMatrixWorld(true);
        const g=new T.Group();g.name='Tabernacle · gilded colonnettes, mouldings and cross';root.add(g);
        const put=(geo,name,x,y,z)=>{const o=mesh(geo,gold,g,name);o.position.copy(root.worldToLocal(new T.Vector3(x,y,z)));return o;};
        ped.material=satin;
        const e=new T.Box3().setFromObject(enc),p=new T.Box3().setFromObject(ped),d=new T.Box3().setFromObject(dome),h=e.max.y-e.min.y;
        for(const z of [-1,1]){
          put(new T.CylinderGeometry(.026,.03,h-.08,12),'Tabernacle colonnette',e.min.x-.03,(e.min.y+e.max.y)/2,z*(e.max.z-.035));
          for(const y of [e.min.y+.025,e.max.y-.025])put(new T.BoxGeometry(.075,.05,.075),'Tabernacle colonnette capital',e.min.x-.03,y,z*(e.max.z-.035));
        }
        for(const y of [p.min.y+.06,p.max.y-.04])put(new T.BoxGeometry(p.max.x-p.min.x+.03,.04,p.max.z-p.min.z+.03),'Tabernacle pedestal · gilded moulding',(p.min.x+p.max.x)/2,y,0);
        put(new T.BoxGeometry(.03,.2,.03),'Tabernacle cross',(d.min.x+d.max.x)/2,d.max.y+.1,0);
        put(new T.BoxGeometry(.03,.03,.12),'Tabernacle cross',(d.min.x+d.max.x)/2,d.max.y+.14,0);
        g.userData={status:'CONCEPT · tabernacle ornament; maker, metal and security pending',engineeringApproved:false,source:'Owner request 3 Nov 2026 (centre of the sanctuary); docs/sanctuary-model.md'};
      }
    }
    // Parish priest, 25 Oct 2026: above Our Lady and Saint Joseph the axis-11 side arches take the
    // red lacquer and gilding of the front frame: a lacquered spandrel with gilded relief, mouldings
    // and cresting from the lobed arch up to the roof lining, just in front of the plaster arch.
    const rear11=group('Axis-11 side arches · red lacquer and gilding',spec.arch11.x,0);
    for(const sign of [-1,1])lobedFrame(rear11,sign*spec.arch11.z,spec.arch11.half,spec.arch11,'Axis-11 side spandrel · lacquer and gilding',14);
    // Gilded boarded vaults over the side passages (owner, 1 Nov 2026): the vault of the chamber
    // continues out to Our Lady and Saint Joseph. Each is lofted between the outline of the axis-10
    // side arch and that of the axis-11 side arch above the shrine, so its outline follows both
    // arches, with the same boarding, lacquered ribs and gilded bosses as the chamber vault.
    // Display proxy, world axes (not the rotated frame group).
    {
      const V=spec.sideVault,g=new T.Group();g.name='Side vaults · gilded boarding over the shrine passages';root.add(g);
      const profile=x=>{
        const t=(x-V.x0)/(spec.arch11.x-V.x0),L=k=>S[k]+(spec.arch11[k]-S[k])*t,a={spring:L('spring'),shoulder:L('shoulder'),crown:L('crown')},cx=spec.wingZ+(spec.arch11.z-spec.wingZ)*t,half=L('half');
        return {inner:lobed(cx,half,a).getPoints(12),outer:lobed(cx,half+.08,{spring:a.spring,shoulder:a.shoulder+V.thick,crown:a.crown+V.thick}).getPoints(12)};
      };
      const steps=8,xs=Array.from({length:steps+1},(_,i)=>V.x0+(V.x1-V.x0)*i/steps),rows=xs.map(profile);
      for(const sign of [-1,1]){
        const P=(x,p,dy=0)=>new T.Vector3(x,p.y+dy,sign*p.x),positions=[];
        // A quad a-b-c-d, wound so that its face looks along `want` (the shell's own outside).
        const quad=(a,b,c,d,want)=>{
          const n=new T.Vector3().subVectors(c,a).cross(new T.Vector3().subVectors(d,b)),m=a.clone().add(c).multiplyScalar(.5);
          if(n.dot(want(m))<0)[b,d]=[d,b];
          positions.push(a,b,c,a,c,d);
        };
        const below=m=>new T.Vector3(0,3,sign*spec.wingZ).sub(m),above=m=>below(m).negate(),down=()=>new T.Vector3(0,-1,0);
        for(let i=0;i<steps;i++){
          const A0=rows[i],A1=rows[i+1],x0=xs[i],x1=xs[i+1],m=A0.inner.length;
          for(let k=0;k<m-1;k++){
            quad(P(x0,A0.inner[k]),P(x1,A1.inner[k]),P(x1,A1.inner[k+1]),P(x0,A0.inner[k+1]),below);
            quad(P(x0,A0.outer[k]),P(x1,A1.outer[k]),P(x1,A1.outer[k+1]),P(x0,A0.outer[k+1]),above);
          }
          for(const k of [0,m-1])quad(P(x0,A0.inner[k]),P(x1,A1.inner[k]),P(x1,A1.outer[k]),P(x0,A0.outer[k]),down);
        }
        for(const [i,dir] of [[0,-1],[steps,1]]){
          const R=rows[i],x=xs[i];
          for(let k=0;k<R.inner.length-1;k++)quad(P(x,R.inner[k]),P(x,R.inner[k+1]),P(x,R.outer[k+1]),P(x,R.outer[k]),()=>new T.Vector3(dir,0,0));
        }
        const geometry=new T.BufferGeometry().setFromPoints(positions);geometry.computeVertexNormals();
        const board=mesh(geometry,leafGold,g,'Side vault · gilded boarding');
        board.userData={status:V.status,engineeringApproved:false,source:'Owner request 1 Nov 2026; docs/sanctuary-model.md'};
        // Springing beam along the outer edge, where the vault would rest on the corbels of the two arches.
        // The inner edge meets the gilded cove instead (owner, 3 Nov 2026).
        const m=rows[0].inner.length,inEdge=rows[0].inner[0].x<rows[0].inner[m-1].x?0:m-1,outEdge=m-1-inEdge;
        line(g,xs.map((x,i)=>{const p=rows[i].inner[outEdge];return [x,p.y-.05,sign*p.x];}),.07,wood,'Side vault springing beam · lacquered timber');
        // Gilded cove (owner, 3 Nov 2026): the same boarding drops plumb from the chamber vault springing on the
        // face line to coveY (the chamber lights hang on this face), then a quarter ellipse carries it out to the
        // inner springing of the side vault, so the gold runs on with no lacquered band between.
        const Cv=spec.chamber,arc=10,cove=rows.map(R=>{
          const end=R.inner[inEdge],dz=end.x-Cv.face,dy=Cv.coveY-end.y,inner=[{x:Cv.face,y:A.spring}],outer=[{x:Cv.face+V.thick,y:A.spring}];
          for(let k=0;k<=arc;k++){
            const t=k/arc*Math.PI/2,p={x:Cv.face+dz*(1-Math.cos(t)),y:Cv.coveY-dy*Math.sin(t)},n=new T.Vector2(dy*Math.cos(t),dz*Math.sin(t)).normalize();
            inner.push(p);outer.push({x:p.x+V.thick*n.x,y:p.y+V.thick*n.y});
          }
          return {inner,outer};
        });
        const covePositions=positions.length,room=m=>new T.Vector3(m.x,4,sign*3).sub(m),out=m=>room(m).negate();
        for(let i=0;i<steps;i++){
          const A0=cove[i],A1=cove[i+1],x0=xs[i],x1=xs[i+1],n=A0.inner.length;
          for(let k=0;k<n-1;k++){
            quad(P(x0,A0.inner[k]),P(x1,A1.inner[k]),P(x1,A1.inner[k+1]),P(x0,A0.inner[k+1]),room);
            quad(P(x0,A0.outer[k]),P(x1,A1.outer[k]),P(x1,A1.outer[k+1]),P(x0,A0.outer[k+1]),out);
          }
          quad(P(x0,A0.inner[0]),P(x1,A1.inner[0]),P(x1,A1.outer[0]),P(x0,A0.outer[0]),()=>new T.Vector3(0,1,0));
          quad(P(x0,A0.inner[n-1]),P(x1,A1.inner[n-1]),P(x1,A1.outer[n-1]),P(x0,A0.outer[n-1]),()=>new T.Vector3(0,-1,0));
        }
        for(const [i,dir] of [[0,-1],[steps,1]]){
          const R=cove[i],x=xs[i];
          for(let k=0;k<R.inner.length-1;k++)quad(P(x,R.inner[k]),P(x,R.inner[k+1]),P(x,R.outer[k+1]),P(x,R.outer[k]),()=>new T.Vector3(dir,0,0));
        }
        const coveGeometry=new T.BufferGeometry().setFromPoints(positions.splice(covePositions));coveGeometry.computeVertexNormals();
        const coveBoard=mesh(coveGeometry,leafGold,g,'Side vault · gilded cove to the chamber vault');
        coveBoard.userData={status:'CONCEPT · gilded boarding from the chamber vault springing to the side vault; boarding, framing and fixings pending',engineeringApproved:false,source:'Owner request 3 Nov 2026; docs/sanctuary-model.md'};
        // Owner, 7 Nov 2026: align the four transverse ribs with the chamber
        // ceiling, continue across the plumb cove, and retain the side-vault grid.
        // Shrine-light bearing ribs and all equipment positions stay at their
        // recorded coordinates. Fixing, access and glare remain engineering holds.
        const stations=spec.ceilingGrid.worldStations;
        const sample=(x,at)=>{
          const f=(x-V.x0)/(V.x1-V.x0)*steps,i=Math.min(steps-1,Math.floor(f)),t=f-i;
          const a=at(i),b=at(i+1);
          return new T.Vector2(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);
        };
        const profiles=rows.map((R,i)=>cove[i].inner.slice(1).concat(R.inner.slice(1)));
        for(const x of stations){
          const points=profiles[0].map((_,k)=>{const p=sample(x,i=>profiles[i][k]);return [x,p.y-.02,sign*p.x];});
          line(g,points,.045,wood,'Side vault rib · lacquered timber');
          // A shallow red finish on the plumb face leaves the fixture canopies
          // in front. Its width aligns exactly with the chamber's transverse rib.
          const skin=mesh(new T.BoxGeometry(spec.ceilingGrid.plumbWidth,A.spring-Cv.coveY,spec.ceilingGrid.plumbDepth),wood,g,'Cove grid · plumb lacquer rib',x,(A.spring+Cv.coveY)/2,sign*(Cv.face-spec.ceilingGrid.plumbDepth/2));
          skin.userData={status:'CONCEPT · shallow lacquer grid finish; substrate and fixing pending',engineeringApproved:false,gridStation:x};
          // Follow the existing cornice surface to join the upper rib visibly.
          line(g,[[x,A.spring-.02,sign*Cv.face],[x,A.spring+.03,sign*Cv.face],[x,A.spring+.03,sign*(Cv.face-.20)],[x,A.spring-.18,sign*(Cv.face-.20)],[x,A.spring-.18,sign*(Cv.face-.01)]],.018,wood,'Cove grid · cornice saddle');
        }
        for(const y of [Cv.coveY+(A.spring-Cv.coveY)/3,Cv.coveY+2*(A.spring-Cv.coveY)/3]){
          mesh(new T.BoxGeometry(V.x1-V.x0,.065,spec.ceilingGrid.plumbDepth),wood,g,'Cove grid · longitudinal lacquer strip',(V.x0+V.x1)/2,y,sign*(Cv.face-spec.ceilingGrid.plumbDepth/2));
        }
        const paths=rows.map(R=>new T.CatmullRomCurve3(R.inner.map(p=>new T.Vector3(p.x,p.y,0))));
        const ribLines=[...[1,1+arc/3,1+2*arc/3,1+arc].map(k=>i=>cove[i].inner[Math.round(k)]),...[.14,.32,.5,.68,.86].map(t=>i=>paths[i].getPoint(t))];
        for(const at of ribLines){
          line(g,xs.map((x,i)=>{const p=at(i);return [x,p.y-.03,sign*p.x];}),.045,wood,'Side vault longitudinal rib');
          for(const x of stations){const p=sample(x,at);vaultBoss(g,x,p.y-.046,sign*p.x);}
        }
        // Inset lines continue the chamber's coffer vocabulary over the outer
        // side-vault fields. The inner strip carries the shrine lights and stays clear.
        const bands=[.32,.5,.68,.86];
        for(let j=0;j<stations.length-1;j++)for(let k=0;k<bands.length-1;k++){
          const x0=stations[j]+.10,x1=stations[j+1]-.10,t0=bands[k]+.018,t1=bands[k+1]-.018;
          const at=(x,t)=>{const p=new T.CatmullRomCurve3(profile(x).inner.map(q=>new T.Vector3(q.x,q.y,0))).getPoint(t);return [x,p.y-.018,sign*p.x];};
          const edge=[];
          for(let n=0;n<=6;n++)edge.push(at(x0,t0+(t1-t0)*n/6));
          edge.push(at(x1,t1));
          for(let n=6;n>=0;n--)edge.push(at(x1,t0+(t1-t0)*n/6));
          edge.push(at(x0,t0));
          line(g,edge,.009,wood,'Vault coffer · side inset lacquer moulding');
        }
      }
    }
    // The bundle's dais ran the full 7.20 m between the column lines and was reached by five
    // full-width steps from x 38.2. It is replaced by the CAD outline (spec.floor).
    function rebuildFloor(){
      const old=[];
      building.traverse(o=>{if(/^(Sanctuary central platform|Sanctuary side platform|Sanctuary step profile)/.test(o.name))old.push(o);});
      const first=old.find(o=>o.name.startsWith('Sanctuary central platform'));
      if(!first)return;
      const parent=first.parent,floorMat=first.material;
      for(const o of old){o.removeFromParent();o.geometry.dispose();}
      const F=spec.floor,S=F.stair,status='SOURCE OUTLINE AND LEVELS (DWG 2026-10-23 P05, S45, S25) / FINISH SCHEMATIC';
      const add=(geometry,y,name,source)=>{const o=new T.Mesh(geometry,floorMat);o.name=name;o.userData={status,source};o.position.y=y;o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
      // Extruded downwards from the top: the shape's (x, z) map to model x and z.
      const slab=(pts,top,name,source)=>{const g=new T.ExtrudeGeometry(new T.Shape(pts.map(([x,z])=>new T.Vector2(x,z))),{depth:top,bevelEnabled:false});g.rotateX(Math.PI/2);return add(g,top,name,source);};
      slab(planOutline(F.dais,S),DAIS,'Sanctuary central platform +0.800','Plan P05 outline (D7BF11, D7BF14, D7BF18, D7BF21, D7BF24, D7BF27); level S25 800 mm, S45 platform line');
      slab(planOutline(F.apron),SIDE,'Sanctuary low platform +0.160','Plan P05 outline (D7BF13, D7BF16, D7BF1B, D7BF23, D7BF26, D7BF2A); S45 riser D7E205 and top D7E20F');
      for(const sign of [-1,1]){const b=F.side,w=b.outer-b.inner;add(new T.BoxGeometry(b.x1-b.x0,SIDE,w),SIDE/2,'Sanctuary side platform +0.160','Section 25 level; plan P05 edge D7BF17/D7BF2B at the axis-10 piers').position.set((b.x0+b.x1)/2,SIDE/2,sign*(b.inner+w/2));}
      for(let k=1;k<=3;k++){const x0=S.x0+(k-1)*S.tread,top=SIDE+k*RISER;add(new T.BoxGeometry(S.x1-x0,top-SIDE,2*S.half),0,`Sanctuary recessed step +${top.toFixed(3)}`,'Plan P05 D7BF1C–D7BF20 (1.90 m wide); S45 D7E206–D7E20C, 160 mm risers, 290 mm treads').position.set((x0+S.x1)/2,(SIDE+top)/2,0);}
    }
    data.sanctuary={...spec,crossShift,reference:'references/02-sanctuary/concepts/09-sanctuary-approved-concept.png',materials:['oxblood lacquer','oxblood lacquer, satin (cross, niche boards, furniture)','carved lacquered timber','gilded carved relief','gilded scrollwork on lacquer','gilded relief','gilded vault boarding','blue niche','shrine niche blue','carved figure, natural wood','carved figure, darker tone','crimson upholstery','forged iron nail','pale stone','dark marble inset'],roofTimber:'oxblood lacquer with gilded soffit lines; natural tones remain a simulator setting',status:'Image-led concept; ornamental profiles, relief textures and sculpture are generated approximations'};
    data.assumptions.push('Sanctuary revised from the approved concept and section sheet 5: the three-lobed frame stands on the axis-10 columns in lacquered timber, without a tie beam, and its side arches open into passages, and the Marian and Joseph shrines stand at the back of those passages in the side arches of axis 11, level with the crucifix (parish priest, 25 October 2026), with 2.2 m service entrances below raised niches. A timber-lined chamber with a gilded boarded vault runs from the frame back to the reredos on axis 11, where the crucifix stands in a niche 1.0 m deep that opens through the back wall onto a base over the service room. The bay behind each shrine is closed in lacquered timber above the shelf, and every round column on the D/E lines is lacquered: the nave columns have turned bases on panelled stone pedestals, carved capitals, junction blocks and dies with gilded lotus panels, and the two frame columns keep gilded bands and capitals. The tie beams, side beams, rafters, purlins, ridge and braces take the same lacquer, with gilded lines and bosses on the nave rafters and ridge; the boarded roof lining stays ivory. The reredos, chamber, shrines and front frame carry generated gilded relief, crocketed pinnacles and leaf crestings after the 7 October interior views; the niches are blue with a soft glow, the corpus is carved wood with a gilded cloth and the tabernacle is gilded under a dome. Member sizes, the roof thrust on axis 10 and the relief are proposals within the retained building grids.');
  }
})();
