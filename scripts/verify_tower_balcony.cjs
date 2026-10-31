'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {loadExteriorModel,root}=require('./lib/exterior_model.cjs');
const {model:m,api}=loadExteriorModel(),T=m.THREE,nodes=[];m.building.traverse(o=>{if(o.isMesh)nodes.push(o);});
const source=JSON.parse(fs.readFileSync(path.join(root,'docs/exterior-23102026/tower-balcony-witnesses.json'),'utf8'));
const B=api.CHURCH_TOWERS.spec.balcony,checks=[],rc=new T.Raycaster();
const named=name=>{const a=nodes.filter(o=>o.name===name);assert(a.length,'Missing '+name);return a;};
const bounds=a=>{const b=new T.Box3();a.forEach(o=>b.union(new T.Box3().setFromObject(o)));return b;};
const near=(v,w,label)=>{assert(Math.abs(v-w)<.002,`${label}: ${v} != ${w}`);checks.push({label,actual:v,source:w,residual_mm:(v-w)*1000});};
const removed=new Set(['Balcony corbel','Balcony cornice moulding','Balcony plinth','Balustrade rail','Baluster base','Baluster belly','Baluster neck','Balustrade corner pedestal','Pedestal cap']);
assert(!nodes.some(o=>removed.has(o.name)),'Old vase balcony components removed');
assert.equal(api.CHURCH_TOWERS.stats.balconyFaces,8);assert.equal(api.CHURCH_TOWERS.stats.balconyPiercedHoles,136);
assert.equal(B.structuralThickness,null,'Display band separation is not an approved guard section');
let voidRays=0,solidRays=0,verifiedContourVertices=0,worstVertexM=0;
for(const [side,s] of [['H',1],['B',-1]]){
 const prefix=`Tower ${side} parapet · `,zc=s*10.153;
 const corn=bounds(named(prefix+'lower cornice profile')),rail=bounds(named(prefix+'top rail profile'));
 const FR=source.faces[0],SR=source.faces[1];
 near(corn.max.y,FR.corniceRows[0].y,prefix+'cornice top');near(rail.max.y,FR.topRailRows[0].y,prefix+'rail top');
 near(rail.min.x,SR.topRailRows[0].u[0],prefix+'rail X minimum');near(rail.max.x,SR.topRailRows[0].u[1],prefix+'rail X maximum');
 near(rail.min.z,Math.min(...FR.topRailRows[0].u.map(v=>s*v)),prefix+'rail Z minimum');near(rail.max.z,Math.max(...FR.topRailRows[0].u.map(v=>s*v)),prefix+'rail Z maximum');
 // Independently integrate the source profile widths, then compare signed mesh volume.
 const analyticalVolume=(frontRows,sideRows,innerArea=0)=>{
  const fr=[...frontRows].sort((a,b)=>a.y-b.y),sr=[...sideRows].sort((a,b)=>a.y-b.y);let v=0;
  for(let i=0;i<fr.length-1;i++){
   const dy=fr[i+1].y-fr[i].y,w=sr[i].u[1]-sr[i].u[0],d=fr[i].u[1]-fr[i].u[0],dw=sr[i+1].u[1]-sr[i+1].u[0]-w,dd=fr[i+1].u[1]-fr[i+1].u[0]-d;
   v+=dy*(w*d+(w*dd+d*dw)/2+dw*dd/3-innerArea);
  }return v;
 };
 const signedVolume=list=>{
  let volume=0;const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),cross=new T.Vector3(),centre=bounds(list).getCenter(new T.Vector3());
  for(const o of list){const p=o.geometry.attributes.position,index=o.geometry.index;for(let i=0;i<(index?index.count:p.count);i+=3){
   for(const [v,j] of [[a,0],[b,1],[c,2]])v.fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld).sub(centre);
   volume+=a.dot(cross.crossVectors(b,c))/6;
  }}return volume;
 };
 for(const [name,fr,sr,area] of [['lower cornice profile',FR.corniceRows,SR.corniceRows,0],['top rail profile',FR.topRailRows,SR.topRailRows,(B.rearX-B.frontX-2*B.bandSeparation)*(2*(2.45-B.frontX)-2*B.bandSeparation)]]){
  const expected=analyticalVolume(fr,sr,area),actual=signedVolume(named(prefix+name));
  assert(expected>0&&actual>0&&Math.abs(actual-expected)<.0001,prefix+name+' closed outward winding agrees with analytical volume');
 }
 for(const face of ['front','rear','outer','inner']){
  const panel=named(prefix+face+' pierced panel'),F=face==='front'||face==='rear'?FR:SR;
  const world=(u,y)=>face==='front'?[B.frontX,y,s*u]:face==='rear'?[B.rearX,y,s*u]:[u,y,zc+(face==='outer'?s:-s)*(2.45-B.frontX)];
  const normal=new T.Vector3(...(face==='front'?[-1,0,0]:face==='rear'?[1,0,0]:[0,0,face==='outer'?s:-s]));
  const ray=(u,y,expected)=>{
   const p=new T.Vector3(...world(u,y));rc.set(p.clone().addScaledVector(normal,.5),normal.clone().negate());rc.near=0;rc.far=.8;
   const hits=rc.intersectObjects(panel,false).length;assert(expected?hits===0:hits>0,`${prefix}${face} source stepped opening at ${u},${y}`);
   expected?voidRays++:solidRays++;
  };
  const vertices=[];for(const o of panel){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)vertices.push(new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld));}
  for(const hole of F.holes){
   const c=hole.centreU,y0=hole.bounds[1],y1=hole.bounds[3];
   ray(c,(y0+y1)/2,true);ray(c+.025,y0+.0125,true);ray(c+.045,y0+.0125,false);ray(c+.045,(y0+y1)/2,true);ray(c+.06,(y0+y1)/2,false);
   for(const [u,y] of hole.points){const p=new T.Vector3(...world(u,y)),d=Math.sqrt(Math.min(...vertices.map(v=>v.distanceToSquared(p))));assert(d<.002,prefix+face+' native contour vertex');worstVertexM=Math.max(worstVertexM,d);verifiedContourVertices++;}
  }
 }
 // Decorative post rectangles are solid: a ray at their interior still meets masonry.
 for(const P of FR.decorativeEndPostPanels){const u=(P.points[0][0]+P.points[1][0])/2,y=(P.points[0][1]+P.points[2][1])/2;rc.set(new T.Vector3(-1,y,s*u),new T.Vector3(1,0,0));rc.far=8;assert(rc.intersectObjects(named(prefix+'corner posts'),false).length,'Corner inset is not a through opening');}
}
near(bounds(named('Tower dome · CAD profile')).min.y,source.faces[0].corniceRows[0].y,'Derived hidden drum contacts the source platform level (not a bearing design)');
assert.equal(api.CHURCH_TOWERS.spec.dome.bearingLevel,null);
near(bounds(named('Tower corner pinnacle')).min.y,source.faces[0].topRailRows[0].y,'Corner ornament rests on native top rail');
near(bounds([...named('Tower corner pinnacle'),...named('Tower corner pinnacle fleur-de-lis')]).max.y,source.cornerPinnacleEnvelopesE01B[0].topWitness.y,'Native finial actual apex');
const allGuard=nodes.filter(o=>/parapet · /.test(o.name));
const layoutBytes=fs.readFileSync(path.join(root,'docs/electrical-grid/equipment-layout.json'));
const layout=JSON.parse(layoutBytes),lights=layout.items.filter(it=>it.type==='ledgeFlood'&&it.name.startsWith('Dome front wash ·'));
assert.equal(lights.length,2);
const catalogueContext={window:{}};vm.createContext(catalogueContext);
vm.runInContext(fs.readFileSync(path.join(root,'Thach_Bi_Viewer/simulator/catalog.js'),'utf8'),catalogueContext);
const lightSamples=[];
for(const it of lights){
 const catalogue=catalogueContext.window.CHURCH_SIM_CATALOG.byId[it.type];
 const kit={pivots:{},box(){},glowPoint(){},in(name,fn){fn();}};catalogue.build(kit,{params:it.params});
 const pivot=kit.pivots.head,a=(it.mountYaw||0)*Math.PI/180,yaw=(it.yaw||0)*Math.PI/180,tilt=(it.tilt||0)*Math.PI/180;
 const head=new T.Vector3(it.pos[0]+pivot[0]*Math.cos(a)-pivot[2]*Math.sin(a),it.pos[1]+pivot[1],it.pos[2]+pivot[0]*Math.sin(a)+pivot[2]*Math.cos(a));
 const axis=new T.Vector3(Math.cos(tilt)*Math.cos(yaw),Math.sin(tilt),Math.cos(tilt)*Math.sin(yaw));
 const lateral=new T.Vector3(-Math.sin(yaw),0,Math.cos(yaw)),vertical=new T.Vector3(-Math.sin(tilt)*Math.cos(yaw),Math.cos(tilt),-Math.sin(tilt)*Math.sin(yaw));
 const emitter=catalogue.light.emitters[0];assert(emitter.head,'Use the actual catalogue head emitter');
 const origin=head.clone().addScaledVector(axis,emitter.pos[0]).addScaledVector(vertical,emitter.pos[1]).addScaledVector(lateral,emitter.pos[2]);
 let blocked=0,total=0;const tangent=Math.tan(it.beam*Math.PI/360);
 for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++){if(i*i+j*j>16)continue;const direction=axis.clone().addScaledVector(lateral,tangent*i/4).addScaledVector(vertical,tangent*j/4).normalize();rc.set(origin,direction);rc.near=.005;rc.far=3;const hit=rc.intersectObjects(allGuard,false)[0];total++;if(hit)blocked++;if(i===0&&j===0)assert(!hit,'Registered dome-light centre ray clears native guard opening');}
 lightSamples.push({id:it.id,name:it.name,head:head.toArray(),catalogue_emitter_origin:origin.toArray(),beam_full_angle_degrees:it.beam,sampled_directions:total,blocked_by_guard:blocked,centreline_clear:true,status:blocked?'COORDINATION HOLD: unweighted geometrical cone directions, not blocked luminous-flux fraction':'GEOMETRIC SAMPLE ONLY; PHOTOMETRY UNVERIFIED'});
}
console.log(JSON.stringify({status:'passed',sourceSha256:source.sourceDwgSha256,faces:8,holes:136,voidRays,solidRays,verifiedContourVertices,worstContourResidualMm:worstVertexM*1000,checks,unchangedDomeLightSamples:lightSamples,registered_layout_sha256:crypto.createHash('sha256').update(layoutBytes).digest('hex'),limits:'Projection/profile checks only. Depth/corner closure is derived; unit, guard structure, light photometry, maintenance and construction approval remain held.'},null,2));
