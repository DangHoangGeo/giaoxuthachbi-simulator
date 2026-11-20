/* Headless geometry checks. Runs the actual bundled geometry builders without
   a GPU; the browser is separately checked for rendering and interaction. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const gradient = {addColorStop(){}};
const ctx = new Proxy({
  getImageData(){return {data:new Uint8ClampedArray(512*512*4)}} ,
  createLinearGradient(){return gradient},createRadialGradient(){return gradient},
  measureText(){return {width:120}},
}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
const document = {getElementById(){return null},createElement(){return {width:512,height:512,getContext(){return ctx}}}};
const sandbox = {console,document,location:{search:''},URLSearchParams,Uint8ClampedArray,window:{}};
vm.createContext(sandbox);
for(const file of ['texture-memory.js', 'render-batches.js', 'references.js','glass-art.js','carving.js','exterior-ornament.js','tower-spandrel-profile.js','facade-crest-profile.js','detail-towers-profile.js','detail-front-profile.js','detail-rear-profile.js','detail-sides-profile.js','entrance-approach.js','decoration.js', 'interior-finish.js','sanctuary-furnishings.js','landscape-trees.js','sanctuary.js', 'facade.js', 'marian-art.js','porches.js', 'stations.js', 'towers.js', 'roofline.js','realism.js','planning.js'])vm.runInContext(fs.readFileSync(path.join(root,'Thach_Bi_Viewer',file),'utf8'),sandbox);
let src=fs.readFileSync(path.join(root,'Thach_Bi_Viewer/bundle.js'),'utf8');
const begin=src.indexOf('    Us = document.getElementById("viewport"),');
const end=src.indexOf('  var ce = {};',begin);
assert(begin>0&&end>begin);
src=src.slice(0,begin)+`    ni = {capabilities:{getMaxAnisotropy:()=>8},shadowMap:{},toneMappingExposure:1};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
`+src.slice(end);
const ui=src.lastIndexOf('  z0({');
src=src.slice(0,ui)+`  window.model={THREE:Ec,building:nn,scene:ii,plinth:Ui,exterior:Os,roofs:ei,mat:ce,data:ti,batches:t_,interior:Qo};\n})();`;
vm.runInContext(src,sandbox,{timeout:60000});
const {THREE:T,building,plinth,exterior,roofs,mat,data,batches}=sandbox.window.model;
const realism=sandbox.window.CHURCH_REALISM;
const nodes=[];building.traverse(o=>nodes.push(o));
const near=(actual,expected,msg)=>assert(Math.abs(actual-expected)<.002,`${msg}: ${actual} != ${expected}`);
const bounds=o=>new T.Box3().setFromObject(o);
const dimensions=o=>bounds(o).getSize(new T.Vector3());
// Independent straight-ribbon case catches inward faces on the rolled carving.
// The six-point section has area 1.32*w*h; w and h taper by (1 - 0.72*t).
{
  const source=fs.readFileSync(path.join(root,'Thach_Bi_Viewer/sanctuary.js'),'utf8');
  const start=source.indexOf('    function rolledScroll('),end=source.indexOf('    function carvedRosette(',start);
  assert(start>=0&&end>start,'Rolled-scroll generator is available for the analytical check');
  const make=vm.runInNewContext('(function(T){'+source.slice(start,end)+';return rolledScroll;})(THREE)',{THREE:T});
  const ribbon=make([[0,0,0],[1,0,0]],.1),points=ribbon.attributes.position,index=ribbon.index;
  const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let volume=0;
  for(let i=0;i<index.count;i+=3){
    a.fromBufferAttribute(points,index.getX(i));b.fromBufferAttribute(points,index.getX(i+1));c.fromBufferAttribute(points,index.getX(i+2));
    volume+=a.dot(b.cross(c))/6;
  }
  const expected=1.32*.1*.07*(1-.72+.72*.72/3);
  assert(volume>0&&Math.abs(volume-expected)<1e-7,'Ribbon faces point outward and enclose the analytical tapered volume');
  ribbon.dispose();
}
// Decoration remains within the old station envelope and leaves physical data alone.
{
  assert(sandbox.window.CHURCH_DECORATION.stats.materials>10,'Decoration finishes are applied');
  const outer=bounds(nodes.find(o=>o.name==='Station of the Cross gilded frame'));
  for(const name of ['Station of the Cross raised inner moulding','Station of the Cross foliate carving']) {
    const part=bounds(nodes.find(o=>o.name===name));
    assert(part.min.x>=outer.min.x-.001&&part.max.x<=outer.max.x+.001&&part.min.y>=outer.min.y&&part.max.y<=outer.max.y,'Carving stays inside station outline: '+name);
    assert(Math.max(Math.abs(part.min.z),Math.abs(part.max.z))<=7.251,'Carving stays on nave face of wall');
    assert(Math.min(Math.abs(part.min.z),Math.abs(part.max.z))>=7.165-.001,'Carving remains within existing 85 mm relief projection');
  }
  for(const o of nodes.filter(o=>o.isMesh&&/^Sanctuary · gilded (relief|scrollwork)/.test(o.material.name)))assert(o.material.bumpScale<=.003,'Relief shading does not exaggerate relief depth');
  const stoneWall = nodes.find(o => o.name === 'Central bay upper wall').material;
  const stoneTint = stoneWall.color.clone();
  assert.equal(stoneWall.map, null, 'Continuous stone colour has no block or joint pattern');
  assert.equal(stoneTint.getHexString(), 'c1beb4');
  for (const name of ['Tower corner pier pedestal',
    'Tower corner pier shaft', 'Central ground pier shaft',
    'Tower B stage 2 · wall with paired louvre apertures', 'Tower H stage 2 · wall with paired louvre apertures']) {
    const faces = nodes.filter(o => o.name === name && o.isMesh);
    assert(faces.length && faces.every(o => o.material === stoneWall), name + ' uses the shared stone colour');
  }
  const naveColumn = nodes.find(o => o.name === 'Side column — illustrative shaft width');
  assert.equal(naveColumn.material.color.getHexString(), 'f4e4bd', 'Interior support matches the cream nave paint');
  assert.equal(stoneWall, mat.wall, 'Walls and mineral-finished column shafts share their tint');
  assert.equal(mat.trim.color.getHexString(), 'c5c1b7', 'Mouldings remain in the stone-grey range');
  const finishMap=mat.wall.bumpMap;
  realism.finish(false);assert.equal(mat.wall.bumpMap,null,'Neutral display removes plaster bump');
  assert(!stoneWall.color.equals(stoneTint), 'Drawing colours neutralize the wall tint');
  realism.finish(true);assert.equal(mat.wall.bumpMap,finishMap,'Reference display restores new plaster bump');
  assert.equal(stoneWall.map, null);
  assert(stoneWall.color.equals(stoneTint), 'Drawing-colour toggle restores the wall stone');
  const altar=nodes.find(o=>o.name==='Proposed altar front panel'),relief=nodes.find(o=>o.name==='Altar floral stone relief');
  altar.geometry.computeBoundingBox();
  const panel=altar.geometry.boundingBox.clone().applyMatrix4(altar.matrixWorld),carving=bounds(relief),cross=bounds(nodes.find(o=>o.name==='Altar cross stem'));
  assert(carving.min.y>=panel.min.y&&carving.max.y<=panel.max.y&&carving.min.z>=panel.min.z&&carving.max.z<=panel.max.z,'Altar carving stays inside the existing front panel');
  assert(carving.min.x>=cross.min.x&&carving.max.x<panel.min.x+.002,'Altar carving remains behind the existing cross face, against the panel: '+JSON.stringify({panel:panel.min.x,carving:[carving.min.x,carving.max.x],cross:cross.min.x}));
  assert.equal(relief.parent,altar,'Altar ornament moves with its existing panel');
  const point=new T.Vector3(),positions=relief.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(relief.matrixWorld);assert(Math.abs(point.z)>.33,'Altar cross keeps a clear central field');}
}
near(dimensions(nodes.find(o=>o.name.startsWith('Main plinth below'))).z,22.489,'Main plan width');
const wings=nodes.filter(o=>o.name.startsWith('Side projection plinth'));
near(Math.max(...wings.map(o=>bounds(o).max.z))-Math.min(...wings.map(o=>bounds(o).min.z)),28.158,'Wing plan width');
near(dimensions(nodes.find(o=>o.name==='Entrance forecourt plinth · P05')).z,20.784,'P05 inner forecourt width');
near(data.levels.forecourt-data.levels.courtyard,1.6,'Front stage rise');
near(data.longitudinal['10']-data.longitudinal['9'],7.2,'Wing axis length');
assert.equal(nodes.filter(o=>o.name==='Side landing at −0.320 m').length,6);
assert.equal(nodes.filter(o=>o.name==='Side stair riser').length,96);
assert.equal(nodes.filter(o=>o.name==='Existing tower rear wall at axis 2').length,2);
const bays=nodes.filter(o=>o.name.startsWith('Outer veranda'));
assert.equal(bays.length,20);
for(const sign of [-1,1]) {
  const row=bays.filter(b=>Math.sign(b.position.z)===sign).sort((a,b)=>a.position.x-b.position.x);
  assert.equal(row.map(b=>b.name.endsWith(' 9–10')?'P':/ (4–5|8–9)$/.test(b.name)?'D':'W').join(','),'W,W,D,W,W,W,D,P,W,W');
}
// Porches, parish priest 25 Oct 2026 and owner 8 Nov 2026 (porches.js): the bundle's schematic outer
// wall goes below the cornice outside the 9–10 side bays; the drawn outer wall replaces it with open
// openings (two arches and a rose in window bays, one 2.25 m arch in the stair bays 4–5, 8–9, 10–11),
// a pier on every B/H axis, a cast slab with pointed cross arches, and the side bays closed.
{
  const P=sandbox.window.CHURCH_PORCHES,st=P.stats;
  for(const b of bays.filter(b=>!b.name.endsWith(' 9–10')))b.traverse(o=>{if(o.isMesh)assert(bounds(o).min.y>=P.spec.entablature-.01,'Nothing of the outer porch wall stays below the cornice: '+o.name);});
  assert.equal(st.columns,22,'11 porch columns per side (axes 2′–9 and 10–12)');
  assert.equal(st.doorBays,6,'one 2.25 m arch at the stair landings 4–5, 8–9 and 10–11');assert.equal(st.windowBays,12,'paired openings in the other bays');
  assert.equal(st.openings,30,'12 × 2 window arches + 6 stair arches');assert.equal(st.colonnettes,60,'a colonnette each side of every outer opening');assert.equal(st.roses,12,'a rose window over each window pair');
  const ow=nodes.find(o=>o.name.startsWith('Porch outer wall'));const owb=bounds(ow);
  assert(owb.min.y<=P.spec.floor+.001&&near(owb.max.y,P.spec.entablature,'outer wall up to the entablature')!==false&&near(Math.abs(owb.max.z),P.spec.lineZ+P.spec.column.spandrel,'outer wall face 0.06 outside B/H')!==false,'Drawn outer wall on the porch line');
  const roses=nodes.filter(o=>o.name.startsWith('Porch rose window ·'));assert.equal(roses.length,12,'12 rose glasses');
  for(const r of roses){const b=bounds(r);near((b.min.y+b.max.y)/2,4.645,'rose centre at the E02 roundel');near(b.max.y-b.min.y,.6,'60 cm rose glass');}
  assert.equal(nodes.filter(o=>/^Porch guard/.test(o.name)).length,0,'the 25 Oct guard is withdrawn: the outer wall below the sills guards the window bays');
  assert.equal(nodes.filter(o=>o.name==='Porch arcade column and arch spandrel · cast concrete, plastered').length,0,'no pointed arcade');
  for(const sign of [-1,1]){for(const x of [7.725,25.725,50.8455])assert.equal(realism.walkAllowed(x,sign*P.spec.lineZ),false,'outer wall closes window bay '+x);for(const x of P.spec.stairBays)assert.equal(realism.walkAllowed(x,sign*P.spec.lineZ),true,'stair-bay arch open '+x);}
  assert.equal(st.beams,14,'cross arch C–B / G–H on axes 3–8 and 11 each side');
  const cross=bounds(nodes.find(o=>o.name.startsWith('Porch cross arch')));assert(cross.max.y<P.tileY(7.47)&&Math.abs(cross.min.z)>=7.6&&Math.abs(cross.max.z)<=10.25,'cross arches span from the C/G wall column to the arcade column');
  for(const n of ['C','G'])assert.equal(nodes.filter(o=>o.name.startsWith(`Inner wall ${n} `)).length,9,'inner wall bays named '+n);
  const slab=nodes.find(o=>o.name.startsWith('Porch roof slab'));const sb=bounds(slab);
  assert(sb.max.y<P.tileY(7.47)-.02&&sb.min.y>P.tileY(10.25)-.2,'Slab sits just under the porch tiles');
  const ends=nodes.find(o=>o.name.startsWith('Side-bay end wall to the porch'));const eb=bounds(ends);
  near(eb.min.x,data.longitudinal['9']-.16,'End wall on axis 9');near(eb.max.x,data.longitudinal['10']+.16,'End wall on axis 10');
  assert(eb.min.y<=-.319&&Math.abs(eb.max.z)>10.2,'End walls close the side bays from floor to slab and out to the arcade');
  const rib=bounds(nodes.find(o=>o.name.startsWith('Side-bay arch rib')));
  assert(rib.max.y>8.5&&rib.max.y<8.85&&Math.abs(rib.max.z)<7.6,'Detail-47 arch on the C/G axes of the side bays');
  for(const sign of [-1,1]){assert.equal(realism.walkAllowed(46.425,sign*7.36),false,'No doorway in bay 10–11');for(const x of [36.975,44.175])assert.equal(realism.walkAllowed(x,sign*8.8),false,'Side bay closed to the porch');}
}
assert.equal(nodes.filter(o=>o.name==='Tree trunk').length,16);
// Towers after the CAD file, owner 25 Oct 2026 (towers.js): closed fronts, corner piers on every
// stage, CAD tops, a stair in the B-side tower and no passage through the bases.
{
  const TW=sandbox.window.CHURCH_TOWERS, st=TW.stats;
  assert.equal(st.piers,32,'four corner piers on each of four stages, both towers');assert.equal(st.blindArches,2);assert.equal(st.stairRisers,44,'stair to +8.39 in the B tower');
  assert(!nodes.some(o=>/^(Tower cap profile|Cap pedestal|Urn body|Tower stage 1 wall)/.test(o.name)),'old caps, urns and open stage-1 walls removed');
  const top=Math.max(...nodes.filter(o=>/^Tower cross/.test(o.name)).map(o=>bounds(o).max.y));assert(Math.abs(top-36.92)<.01,'Tower cross top +36.92 (E01B): '+top);
  // E01B offset-centre shoulder arcs C4568C/C45696 meet the lantern at this level.
  const dome=bounds(nodes.find(o=>o.name==='Tower dome · CAD profile'));near(dome.max.y,32.790456676,'Native dome/lantern contact +32.790457');
  const front=nodes.find(o=>o.name.startsWith('Tower base wall · closed front'));assert(front&&!front.geometry.attributes.position.array.some((v,i)=>i%3===1&&v>8.40),'closed front up to +8.39');
  const cornice=nodes.filter(o=>o.name==='Tower base cornice').map(bounds);near(Math.max(...cornice.map(b=>b.max.y)),8.39,'tower cornice top at +8.39');
  for(const sign of [-1,1])for(const x of [-.5,1,2.45,4]) assert.equal(realism.walkAllowed(x,sign*10.15),false,'no passage through the tower base');
  // Below ±0 each corner pier stands on a lower column (E02/E01B, owner 2 Nov 2026); the stone
  // core between them is set back to the tower wall plane.
  for(const p of nodes.filter(o=>o.name==='Tower plinth').map(bounds))assert(p.min.y<=-2.079&&p.max.y>=-.001&&Math.abs(p.min.x+.14)<.002&&Math.max(Math.abs(p.min.z),Math.abs(p.max.z))<12.75,'tower plinth core from the courtyard to +0.00, set back to the wall plane');
  assert(!nodes.some(o=>o.name.startsWith('Tower plinth · under the rear pier')),'solid rear plinth extension replaced by the lower column');
  const lower=nodes.filter(o=>o.name==='Tower lower column · under the corner pier'),lowerBox=lower.map(bounds);assert(lower.length,'lower columns under the corner piers');
  assert(lowerBox.every(c=>Math.abs(c.min.y+2.08)<.002&&Math.abs(c.max.y+.203)<.002),'lower columns from −2.08 to the −0.203 band');
  const core=nodes.filter(o=>o.name==='Tower plinth'),strips=nodes.filter(o=>o.name==='Tower lower column strip'),firstHit=(o,d)=>new T.Raycaster(new T.Vector3(...o),new T.Vector3(...d)).intersectObjects([...lower,...strips,...core],false)[0];
  for(const sign of [-1,1]){
    // Horizontal rays at −1.0 m through the flush corner strips: each column face at its E02/E01B line, the core set back between them.
    for(const t of [-3.32,3.32]){const z=sign*(10.153+t),h=firstHit([-6,-1,z],[1,0,0]);assert(h&&h.object.name.startsWith('Tower lower column')&&Math.abs(h.point.x+1.024)<.002,'front lower column face X −1.024 at Z '+z);}
    const back=firstHit([9,-1,sign*13.47],[-1,0,0]);assert(back&&back.object.name.startsWith('Tower lower column')&&Math.abs(back.point.x-5.924)<.002,'rear outer lower column face X 5.924');
    for(const x of [-.87,5.77]){const h=firstHit([x,-1,sign*20],[0,0,-sign]);assert(h&&h.object.name.startsWith('Tower lower column')&&Math.abs(Math.abs(h.point.z)-13.627)<.002,'outer lower column face |Z| 13.627 at X '+x);}
    const gap=firstHit([-6,-1,sign*11],[1,0,0]);assert(gap&&gap.object.name==='Tower plinth'&&Math.abs(gap.point.x+.14)<.002,'core set back to X −0.14 between the front columns');
    const side=firstHit([2.45,-1,sign*20],[0,0,-sign]);assert(side&&side.object.name==='Tower plinth'&&Math.abs(Math.abs(side.point.z)-12.743)<.002,'core set back to the tower wall between the side columns');
  }
  const band=nodes.filter(o=>o.name==='Tower lower band course').map(bounds);assert(band.length&&Math.abs(Math.max(...band.map(b=>b.max.y)))<.002,'band course up to ±0');
}
// Roofline after the CAD file, 25 Oct 2026 (roofline.js): porch parapets with axis pinnacles,
// stepped 9–10 side gables and the stepped rear gable, each with a crowning cross.
{
  const R=sandbox.window.CHURCH_ROOFLINE.stats;assert.equal(R.crosses,3,'two side gables and the rear gable carry a cross');
  assert(R.balusters===250&&R.pinnacles>=40,'porch parapets with the E02 flat-cut balusters (0.25 m pitch, 0.625 m from each axis) and pinnacles');
  const crossTop=n=>Math.max(...nodes.filter(o=>/^Gable cross/.test(o.name)).map(o=>bounds(o).max.y));assert(Math.abs(crossTop()-17.829)<.01,'rear gable cross top +17.829 (E03)');
  assert(!nodes.some(o=>o.name==='Schematic side ornamental gable'||o.name==='Schematic decorative eave crest'),'old side gables and eave crest removed');
  const rail=bounds(nodes.find(o=>o.name==='Porch parapet top rail'));near(rail.max.y,7.073919332,'Native parapet top (E02 LINE D99C62)');
}
// Stations of the Cross, parish priest 25 Oct 2026 (stations.js): fourteen, one per nave bay
// between the columns, above the openings, on the nave face of the C/G wall; old placeholders gone.
{
  const ST=sandbox.window.CHURCH_STATIONS;assert.equal(ST.stats.stations,14,'fourteen stations');
  assert(!nodes.some(o=>/^Proposed Stations of the Cross placements/.test(o.name)),'pier-face placeholders removed');
  const seen=new Set();for(let n=1;n<=14;n++){const p=ST.spec.place(n,data.longitudinal);seen.add(p.s+':'+p.bay);}
  assert.equal(seen.size,14,'one station per bay and side');
  const frame=bounds(nodes.find(o=>o.name==='Station of the Cross gilded frame'));
  assert(frame.min.y>4.311+.5&&frame.max.y<6.66&&Math.abs(frame.max.z)<=7.26&&Math.abs(frame.min.z)>=7.1,'stations above the door crowns, under the side beams, on the wall face');
}
assert.equal(nodes.filter(o=>o.name==='Outer door fixed fanlight').length,0,'No outer porch doors (open arcade)');
const clearBodies=nodes.filter(o=>/^(Inner|Outer) window clear glass body$/.test(o.name));
const innerBodies=clearBodies.filter(o=>o.name.startsWith('Inner'));
assert.equal(innerBodies.length,12,'One 2.25 m window in the inner wall of six bays per side, incl. bay 10–11 (owner, 8 Nov 2026: the CAD inside elevation); the service room 11–12 has a door (7 Nov 2026)');
for(const o of innerBodies){const b=bounds(o);near(b.min.y,.65,'inner window sill +0.65');near(b.max.y,2.951,'inner window body to the 0.22 m head band');near(Math.max(b.max.x-b.min.x,b.max.z-b.min.z),2.25,'inner window 2.25 m wide');}
assert.equal(clearBodies.filter(o=>o.name.startsWith('Outer')).length,4,'Outer windows only in the 9–10 gables');
assert(!nodes.some(o=>/^Proposed coloured glazing|^Stained-glass window/.test(o.name)),'Full-height decorative glazing must be removed');
const innerHeads=nodes.filter(o=>o.name==='Inner window coloured oval');
assert.equal(innerHeads.length,0,'inner window heads hold the M lunette, not glass');
const lunettes=nodes.filter(o=>/^Inner window M lunette · (porch|nave) face$/.test(o.name));
assert.equal(lunettes.length,24,'silver M lunette on both faces of the 12 inner windows (owner, 8 Nov 2026)');
for(const o of lunettes){const b=bounds(o);near(b.min.y,3.171,'M lunette springs on the head band');near(b.max.y,3.171+1.125,'M lunette semicircle 1.125 m');assert.equal(o.material.userData.status,'CHURCH CONCEPT PICTURE · CONCEPT · PUBLICATION HOLD H8');}
assert.equal(nodes.filter(o=>/doorway coloured oval$/.test(o.name)).length,0,'door fanlights hold the reliefs');
// Nine reliefs over the nine outside doors, owner's mapping of 8 Nov 2026 (marian-art.js).
{
  const reliefs=nodes.filter(o=>/^(Inner doorway|Entrance door) relief lunette$/.test(o.name));
  assert.equal(reliefs.length,9,'a relief over each of the nine outside doors');
  const key=o=>{if(o.name.startsWith('Entrance')){const b=bounds(o),z=(b.min.z+b.max.z)/2;return Math.abs(z)<3?'front main':z>0?'front H':'front B';}let g=o.parent;while(g&&!/^Inner wall [CG] /.test(g.name))g=g.parent;return g.name.replace('Inner wall ','');};
  const D=sandbox.window.CHURCH_MARIAN_ART.DOORS;
  for(const o of reliefs)assert.equal(o.userData.relief,D[key(o)],'relief scene at '+key(o));
  assert.equal(new Set(reliefs.map(o=>o.userData.relief)).size,9,'nine different scenes');
  assert.equal(D['front main'],9,'the Assumption over the main door');
  assert.equal(nodes.filter(o=>/^(Door relief \d · inside face|Entrance door relief lunette · inside face)$/.test(o.name)).length,9,'each relief also faces inside');
  for(const o of reliefs.filter(o=>o.name.startsWith('Entrance'))){const b=bounds(o);assert(b.min.x>5&&b.max.x<5.6,'front reliefs moved with the doors to the axis-2′ wall');}
}
const colouredHeads=nodes.filter(o=>/coloured oval$|fixed fanlight$|stained-glass fanlight$|rose-window infill$/.test(o.name));
assert.equal(colouredHeads.length,28,'glass of the tower cap rosettes (towers.js), of the old side- and rear-gable roses (roofline.js) and of the inner C/G roses removed; since 8 Nov 2026 the 24 inner window fanlights became 12 M lunettes and the 9 door fanlights carry reliefs');
assert(!nodes.some(o=>o.name==='Schematic rose-window infill'&&/^Inner wall /.test(o.parent?.name||'')),'no schematic glass rose on the inner C/G wall');
assert.equal(nodes.filter(o=>o.name==='Inner window carving · E02 capitals and roundel').length,0,'the E02 colonnettes and roundel belong to the outer wall again (owner, 8 Nov 2026)');
assert(!nodes.some(o=>o.name==='Window coloured perimeter light'),'Timber window bodies have no coloured border');
const sashGlass=clearBodies[0].material;
assert.notEqual(sashGlass,mat.glass,'Shutter glass has an independent display material');
assert(sashGlass.isMeshPhysicalMaterial&&sashGlass.transparent&&!sashGlass.depthWrite,'Clear sash bodies use transparent physical glass');
for(const o of clearBodies){
  assert.equal(o.material,sashGlass);assert.equal(o.material.map,null);
  assert(o.material.opacity<.2,'Window bodies must stay transparent by default');
}
{
  const door=nodes.find(o=>o.name==='Exterior timber door leaf').material;
  const doorPanel=nodes.find(o=>o.name==='Recessed carved timber panel').material;
  assert(!nodes.some(o=>/^(Inner window timber (jamb|architrave)|Nave window profiled timber casing|Inner window bronze (arch|jamb) fillet)$/.test(o.name)),'The masonry reveal is exposed');
  assert(nodes.filter(o=>o.name==='Shutter recessed solid field').every(o=>o.material===door),'Solid fields use main door timber');
  const friezes=nodes.filter(o=>o.name==='Inner window carved lotus and vine');
  assert.equal(friezes.length,24,'One frieze on each face of every fixed head band');
  for(const o of friezes){
    const box=bounds(o);
    assert(box.min.y>2.951&&box.max.y<3.171,'Frieze fits the 220 mm head band');
  }
  for(const state of ['open','closed']){
    const group=nodes.find(o=>o.userData.doorState===state), parts=[];
    group.traverse(o=>{if(o.isMesh)parts.push(o);});
    const shutters=parts.filter(o=>o.name==='Shutter inset panel');
    const beads=parts.filter(o=>o.name==='Shutter shaped timber moulding');
    assert.equal(beads.length,32*2,'One moulded lower apron on both faces of all shutters');
    assert.equal(parts.filter(o=>o.name==='Shutter lattice bar').length,32*4,'Two uprights on each face');
    for(const name of ['Shutter diamond moulding','Shutter lancet moulding'])assert.equal(parts.filter(o=>o.name===name).length,64);
    assert.equal(parts.filter(o=>o.name==='Shutter recessed solid field').length,32);
    for(const panel of shutters)assert(panel.geometry.parameters.height<.7,'Only the lower apron is solid');
    assert(shutters.every(o=>o.material===doorPanel),'The shutter inset uses the door panel finish');
    for(const o of beads){
      o.geometry.computeBoundingBox();
      assert(Math.abs(o.position.z)+o.geometry.boundingBox.max.z<=.055,'Shutter trim stays behind its stiles');
    }
  }
}
for(const o of colouredHeads){
  assert(o.material.map,'All curved window and door heads start coloured');
  assert(o.material.isMeshPhysicalMaterial&&o.material.bumpMap&&o.material.roughnessMap,'Glass uses physical reflections and surface maps');
  const uv=o.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)assert(uv.getX(i)>=-.001&&uv.getX(i)<=1.001&&uv.getY(i)>=-.001&&uv.getY(i)<=1.001,'Artwork UVs must fit each opening');
}
for(const kind of ['clear','stained','clear','stained']){
  realism.setGlass(kind);
  for(const o of colouredHeads)assert.equal(!!o.material.map,kind==='stained');
  for(const o of clearBodies)assert.equal(o.material.map,null,'Colour toggle never adds artwork to a window body');
  near(sashGlass.opacity,.006,'Sash transparency stays constant through the glazing modes');
}
assert(nodes.filter(o=>o.name==='Schematic bell louver').every(o=>o.material===mat.wood));
for(const x of [16.725,34.725,46.425])for(const sign of [-1,1])near(realism.floorHeight(x,sign*11.7),-.32,'Side landing navigation height');
// Both directions on the double stair must rise monotonically to the landing.
for(const direction of [1,-1]) {
  const bottom=16.725-direction*5.75;
  let previous=-2.08;
  for(let step=.05;step<4.5;step+=.15) {
    const x=bottom+direction*step,y=realism.floorHeight(x,12);
    assert(y>=previous-.001&&y-previous<.3);assert(realism.walkAllowed(x,12));previous=y;
  }
}
realism.update('walk');
for(const [s,b] of batches)if(s.userData.doorState)assert.equal(b.visible,s.userData.doorState==='open');
realism.update('explore');
for(const [s,b] of batches)if(s.userData.doorState)assert.equal(b.visible,s.userData.doorState==='closed');
realism.lighting('evening');const once=sandbox.window.model.interior.lights.map(l=>l.intensity);
realism.lighting('day');realism.lighting('evening');
assert.deepEqual(sandbox.window.model.interior.lights.map(l=>l.intensity),once);
realism.lighting('day');
const planning = sandbox.window.CHURCH_PLANNING;
const seatingGroups = [...batches.keys()].filter(g=>g.userData.seatingOption);
assert.equal(seatingGroups.length,2);
for(const layout of [2,4,2,4]) {
  const status=planning.setLayout(layout);
  assert.equal(status.pewCount,layout===2?34:92);
  assert.equal(status.pewRows,layout===2?17:23);
  assert.equal(sandbox.window.model.interior.colliders.filter(c=>c.kind==='pew'&&c.active!==false).length,status.pewCount);
  for(const group of seatingGroups){
    assert.equal(batches.get(group).visible,group.userData.seatingOption===layout);
    assert.equal(group.userData.active,group.userData.seatingOption===layout);
  }
}
assert.throws(()=>planning.setLayout(3));
const longBenches=nodes.filter(o=>o.isGroup&&o.userData.seatingLayout===2);
const columnParts=nodes.filter(o=>o.isMesh&&/^(Central column |Column base \+0.600|Carved stone pedestal cap|Timber shaft foot)/.test(o.name));
for(const pew of longBenches){
  near(pew.userData.proposedLengthM,4.65,'Long bench length');
  const box=bounds(pew);
  assert(7.25-Math.max(Math.abs(box.min.z),Math.abs(box.max.z))>=1.2,'Outer aisle must stay clear');
  assert(Math.min(Math.abs(box.min.z),Math.abs(box.max.z))>=1.2,'Centre aisle must stay clear');
  for(const column of columnParts)assert(!box.intersectsBox(bounds(column)),'Long bench must not intersect a structural column/base');
}
const allPews=nodes.filter(o=>o.isGroup&&o.userData.seatingLayout);
for(const layout of [2,4]){
  const pews=allPews.filter(o=>o.userData.seatingLayout===layout);
  for(const {bay,xs} of data.seatingStudy.additions){
    const added=pews.filter(o=>o.userData.addedRowBay===bay);
    assert.equal(added.length,layout*xs.length,`Complete added rows in bay ${bay}, layout ${layout}`);
    assert.deepEqual([...new Set(added.map(o=>o.position.x))].sort((a,b)=>a-b),Array.from(xs));
    const [start,end]=bay.split('–').map(axis=>data.longitudinal[axis]);
    for(const pew of added){const box=bounds(pew);assert(box.min.x>start&&box.max.x<end,'Added rows must be inside the requested bay');}
  }
  for(const pew of pews){
    const box=bounds(pew);
    for(const column of columnParts)assert(!box.intersectsBox(bounds(column)),'Pews must clear columns/bases');
    for(const aisle of data.seatingStudy.crossAisles){
      near(aisle.maxX-aisle.minX,1.2,'Door crossing width');
      assert(box.max.x<=aisle.minX+.001||box.min.x>=aisle.maxX-.001,'Door crossing geometry must stay clear');
    }
  }
  for(const collision of sandbox.window.model.interior.colliders.filter(c=>c.seatingLayout===layout))for(const aisle of data.seatingStudy.crossAisles)assert(collision.maxX<=aisle.minX+.001||collision.minX>=aisle.maxX-.001,'Door crossing collision bounds must stay clear');
  for(let i=0;i<pews.length;i++)for(let j=i+1;j<pews.length;j++)assert(!bounds(pews[i]).intersectsBox(bounds(pews[j])),'Pews must not overlap within a layout');
}

// Extract the actual model's proposed benches and ray-test its structural meshes.
// This study intentionally excludes people, liturgical furniture and decorations.
building.updateMatrixWorld(true);
const blockers=nodes.filter(o=>o.isMesh && /^(Central column |Column base \+0.600|Carved stone pedestal cap|Timber shaft foot|Sanctuary plaster pier)/.test(o.name));
// Targets follow the furniture: the ambo 2.3 m in front of the altar, the corpus in its niche.
// Altar and ambo stand on the dais, which rose from +0.75 to +0.80 (CAD file of 23 Oct 2026).
const targets={altar:[44.24,1.925,0],ambo:[41.3,2.3,-2.62],crucifix:[48.5,5.2,0]};
const pewNodes=nodes.filter(o=>o.name.startsWith('Proposed pew ')&&o.isGroup);
const planPews=pewNodes.map((o,index)=>{
  const p=o.getWorldPosition(new T.Vector3()),length=o.userData.proposedLengthM;
  return {id:index+1,x:p.x,z:p.z,length,layout:o.userData.seatingLayout,block:o.userData.seatingBlock,addedRowBay:o.userData.addedRowBay||null};
}).sort((a,b)=>a.x-b.x||a.z-b.z);
const seats=planPews.flatMap(pew=>Array.from({length:Math.floor((pew.length-.075)/.55)},(_,i)=> (i-(Math.floor((pew.length-.075)/.55)-1)/2)*.55).map((offset,index)=>{
  const origin=new T.Vector3(pew.x+.045,1.15,pew.z+offset),blocked={};
  for(const [key,position] of Object.entries(targets)){
    const destination=new T.Vector3(...position),direction=destination.clone().sub(origin);
    const ray=new T.Raycaster(origin,direction.clone().normalize(),.01,direction.length()-.01);
    blocked[key]=ray.intersectObjects(blockers,false).length>0;
  }
  return {id:`${pew.id}-${index+1}`,pewId:pew.id,x:origin.x,z:origin.z,block:pew.block,layout:pew.layout,blocked};
}));
assert.equal(seats.filter(s=>s.layout===4).length,276);
assert.equal(seats.filter(s=>s.layout===2).length,272);
assert(pewNodes.every(o=>o.position.x>6.49),'Entrance-end row removed from both layouts');
// The row in front of the bay 8–9 crossing is removed: at least 3.1 m stays open before the sanctuary's low platform (x 37.475).
assert(Math.max(...pewNodes.map(o=>bounds(o).max.x))<=34.3,'No bench stands in front of the bay 8–9 crossing');
assert(37.475-Math.max(...pewNodes.map(o=>bounds(o).max.x))>=3.1,'At least 3.1 m clear between the front benches and the sanctuary platform');
assert.equal(seats.filter(s=>s.block==='central'&&s.blocked.altar).length,0);
assert(seats.some(s=>s.block==='outer'&&s.blocked.altar));
const sightlineSummary=Object.fromEntries([2,4].map(blocks=>{
  const selected=seats.filter(s=>s.layout===blocks);
  return [blocks,{pewCount:planPews.filter(p=>p.layout===blocks).length,pewRows:new Set(planPews.filter(p=>p.layout===blocks).map(p=>p.x)).size,sampledSeats:selected.length,blocked:Object.fromEntries(Object.keys(targets).map(k=>[k,selected.filter(s=>s.blocked[k]).length]))}];
}));
if(process.argv.includes('--plan')){
  const planningDir=path.join(root,'Thach_Bi_Viewer/planning');fs.mkdirSync(planningDir,{recursive:true});
  const payload={revision:'2026-11-01-entrance-row',site:{address:'756G+GFV, Nam Đồng, Ninh Bình, Vietnam',front:'East (user confirmed; exact azimuth unmeasured)',airConditioning:false},axes:data.longitudinal,transverse:data.transverse,sideAccess:nodes.filter(o=>o.name==='Side landing at −0.320 m'||o.name==='Stone tread with projecting nosing').map(o=>{const b=bounds(o);return {kind:o.name.startsWith('Side landing')?'landing':'tread',x:b.min.x,z:b.min.z,width:b.max.x-b.min.x,depth:b.max.z-b.min.z};}),pews:planPews,seats,targets,sightlineSummary,seatingStudy:data.seatingStudy,columns:nodes.filter(o=>o.name.startsWith('Central column ')).map(o=>({name:o.name,x:o.position.x,z:o.position.z,radius:.32,baseWidth:.82})),method:'Actual THREE.Raycaster intersections against 18 main shafts, their bases/collars and sanctuary piers. One point per target, seated eye 1.15 m; excludes people and other obstructions. Positions at 0.55 m spacing within bench length minus 0.075 m end thickness: 8 per long bench or 3 per short bench. Not legal capacity.'};
  fs.writeFileSync(path.join(planningDir,'model-plan-data.js'),'window.CHURCH_PLAN_DATA = '+JSON.stringify(payload,null,2)+';\n');
}
let batchCount=0,triangles=0;
for(const b of batches.values())for(const m of b.children){batchCount++;triangles+=(m.geometry.index?.count||m.geometry.attributes.position.count)/3;}
const ray=new T.Raycaster(new T.Vector3(-10,2,.5),new T.Vector3(1,0,0));
const hits=ray.intersectObjects(nodes.filter(o=>o.isMesh),false);
assert(!hits.some(h=>h.object.name==='Source-width centre entry facade'),'Facade must not fill the main door opening');
// Parish priest, 25 Oct 2026: the doors stand on the towers' rear pier line (facade.js).
{
  const EN=sandbox.window.CHURCH_FACADE.spec.entrance;
  assert(hits.some(h=>h.object.name==='Open timber door leaf'&&h.point.x>EN.wall[0]-.1&&h.point.x<EN.wall[1]+.1),'Closed main door stands in the door wall on the rear pier line');
  assert(!hits.some(h=>h.object.name==='Open timber door leaf'&&h.point.x<3),'No door leaf left in the front arch');
  assert(nodes.some(o=>o.name==='Entrance door wall · rear pier line')&&EN.openings.length===3&&EN.moved>=9,'door wall with three doorways; leaves, fanlights and transoms moved');
  for(const o of nodes.filter(o=>o.name==='Entrance door coloured oval'))assert(bounds(o).min.x>EN.wall[0]-.1,'fanlight moved with its door');
  const doorWall=nodes.filter(o=>o.name==='Entrance door wall · rear pier line');
  for(const o of EN.openings)for(const y of [.5,2]){const r=new T.Raycaster(new T.Vector3(3,y,(o.z0+o.z1)/2),new T.Vector3(1,0,0),0,3);assert(!r.intersectObjects(doorWall,false).length,'doorway open through the door wall at z '+((o.z0+o.z1)/2).toFixed(2));}
  assert(realism.walkAllowed((EN.wall[0]+EN.wall[1])/2,0)===true&&realism.walkAllowed((EN.wall[0]+EN.wall[1])/2,3)===false,'walk through the doorways only');
  // Owner, 1 Nov 2026: the doors on the axis-2 line (plan P05 X 5.035–5.475), and the front steps and
  // pier bases of section A-A with no gap between them.
  assert(Math.abs(EN.wall[0]-5.035)<1e-6&&Math.abs(EN.wall[1]-5.475)<1e-6,'door wall on the axis-2 line, X 5.035–5.475');
  const ST=sandbox.window.CHURCH_FACADE.spec.ground.steps;
  const steps=nodes.filter(o=>o.name==='Entrance step · CAD section A-A').map(bounds).sort((a,b)=>a.max.y-b.max.y);
  assert(!nodes.some(o=>o.name.startsWith('Entrance threshold step')),'old 0.12 m entrance steps removed');
  assert(steps.length===3&&steps.every((b,i)=>Math.abs(b.max.y-(-.32+.16*i))<.002&&Math.abs(b.min.x-ST.risers[i])<.002),'three 0.16 m entrance risers at X 1.321, 1.551, 1.781');
  for(const [x,y] of [[1.2,-.48],[1.4,-.32],[1.6,-.16],[1.9,0]])assert(Math.abs(realism.floorHeight(x,0)-y)<.002,`entrance floor ${y} at x ${x}`);
  const plinths=nodes.filter(o=>o.name==='Central ground pier plinth course').map(bounds);
  assert(plinths.length&&plinths.every(b=>Math.abs(b.min.y+.48)<.002&&b.max.y>-.002),'central pier bases run down to the −0.48 forecourt');
  const footing=nodes.filter(o=>o.name.startsWith('Tower lower column')).map(bounds);
  assert(footing.length&&Math.abs(Math.min(...footing.map(b=>b.min.x))+1.024)<.002,'front lower columns 0.04 m proud of the corner-pier plinth at X −0.984');
}
for(const sign of [-1,1]) {
  const sideRay=new T.Raycaster(new T.Vector3(16.725,1.8,sign*18),new T.Vector3(0,0,-sign));
  assert(!sideRay.intersectObjects(bays.flatMap(g=>g.children).filter(o=>o.isMesh&&o.name==='Outer arcade wall with arched openings'),false).some(h=>Math.abs(h.point.z)>10),'Outer wall must leave side doorway clear');
}
// Display buffers retain the full source triangle stream and original vertices.
// Verify transformed position, normal and UV against the previous expanded path.
let displayBytes=0, expandedBytes=0;
for(const [source,display] of batches){
  const parts=new Map();
  source.traverse(o=>{if(o.isMesh&&!Array.isArray(o.material)){if(!parts.has(o.material))parts.set(o.material,[]);parts.get(o.material).push(o);}});
  for(const mesh of display.children){
    const g=mesh.geometry,list=parts.get(mesh.material);let offset=0;
    assert(g.index,'display batches retain indices');
    for(const a of [...Object.values(g.attributes),g.index])displayBytes+=a.array.byteLength;
    expandedBytes+=g.index.count*32;
    for(const object of list){
      const local=object.geometry,expected=local.clone().applyMatrix4(object.matrixWorld);
      const count=local.index?.count||local.attributes.position.count;
      for(const j of new Set([0,Math.floor(count/2),count-1])){
        const a=local.index?local.index.getX(j):j,b=g.index.getX(offset+j);
        for(const name of ['position','normal','uv'])if(expected.attributes[name]){
          const x=expected.attributes[name],y=g.attributes[name];
          for(let k=0;k<x.itemSize;k++)assert(Math.abs(x.array[a*x.itemSize+k]-y.array[b*y.itemSize+k])<1e-5,`batch ${name} preserves source vertex`);
        }
      }
      expected.dispose();offset+=count;
    }
    assert.equal(g.index.count,offset,'all source triangles retained');
  }
}
assert(displayBytes<expandedBytes*.7,'indexed buffers materially reduce memory without removing triangles');
console.log(JSON.stringify({checks:'passed',batchCount,triangles,displayBytes,expandedBytes,seating:planning.state(),sightlineSummary,refinement:data.refinement},null,2));

// Sanctuary geometry regression: sheet-5 frame on the column line, shrines in its
// side arches, the timber-lined chamber behind, and clear routes through it.
assert(data.sanctuary, 'Reference sanctuary loaded');
const S=data.sanctuary, frameX=data.longitudinal['10'];
near(S.frameX,frameX,'Front frame stands on axis 10');
const shrineAxisX=data.longitudinal[S.shrineAxis];
assert.equal(S.shrineAxis,'11','Shrines stand on axis 11 (parish priest, 25 Oct 2026)');
near(S.wingX-.1,S.niche.backX-.17,'Statues stand level with the crucifix');
assert(!nodes.some(o=>o.name==='Schematic transverse tie'&&Math.abs(bounds(o).getCenter(new T.Vector3()).x-frameX)<.05),'Sheet 5: no tie beam under the lobed frame');
for(const o of nodes.filter(o=>/^Front frame (central|side) spandrel$/.test(o.name))){
  const b=bounds(o);near((b.min.x+b.max.x)/2,frameX,'Frame spandrel centred on the columns');
  assert(b.max.y<12.2&&b.max.y<S.chamber.top+2.8,'Frame spandrel stays under the roof lining');
}
assert.equal(nodes.filter(o=>o.name==='Front frame side spandrel').length,2);
for(const name of ['Central column 10/D — illustrative diameter','Central column 10/E — illustrative diameter']){
  const column=nodes.find(o=>o.name===name);assert(column,name);
  near(bounds(column).getCenter(new T.Vector3()).x,frameX,'Structural column stays on its grid');
}
// Every round column on the D/E lines is lacquered. Nave shafts (axes 3–9) are plain between a turned base on a
// panelled stone pedestal and a carved capital under the tie beam, with a junction block at beam level and a die
// under the rafter. The frame axis, which has no tie, keeps two gilded bands and a gilded capital under its die.
const shafts=nodes.filter(o=>o.isMesh&&/^Central column /.test(o.name));
assert.equal(shafts.length,18);
for(const o of shafts)assert.equal(o.material.name,'Sanctuary · oxblood lacquer',`${o.name} is lacquered`);
assert(shafts[0].material.clearcoat>.4&&shafts[0].material.map,'Lacquer is a clear coat over a faint grain');
for(const o of nodes.filter(o=>o.isMesh&&/^(Timber shaft foot|Timber capital collar|Column head \+)/.test(o.name)))assert.equal(o.material.name,'Sanctuary · oxblood lacquer',`${o.name} is lacquered`);
const part=name=>nodes.filter(o=>o.isMesh&&o.name===name),onLine=o=>near(Math.abs(o.getWorldPosition(new T.Vector3()).z),3.6,`${o.name} on the D/E line`);
const bands=part('Gilded column band'),capitals=part('Gilded column capital');
assert.equal(bands.length,4,'Gilded bands on the frame axis only');assert.equal(capitals.length,2,'Gilded capitals on the frame axis only');
for(const o of [...bands,...capitals]){onLine(o);near(bounds(o).getCenter(new T.Vector3()).x,frameX,`${o.name} on the frame axis`);}
for(const name of ['pedestal inset','capital bell','capital foliage','capital volutes','junction block','junction foliage','junction blooms and die panels']){
  const list=part(`Column carving · ${name}`);assert.equal(list.length,14,`${name} on every nave column`);
  for(const o of list){onLine(o);assert(bounds(o).getCenter(new T.Vector3()).x<frameX-5,`${name} belongs to a nave column`);}
}
for(const o of part('Column carving · capital foliage')){assert.equal(o.material.name,'Sanctuary · carved lacquered timber');assert(bounds(o).max.y<=8.59&&bounds(o).min.y>7.7,'Capital leaves stay between the neck and the tie beam');}
for(const o of part('Column carving · capital bell'))near(bounds(o).max.y,8.59,'Capital abacus meets the tie beam soffit');
for(const o of part('Column carving · junction block')){const b=bounds(o);near(b.min.y,8.59,'Junction block at the tie beam soffit');near(b.max.y,9.18,'Junction block at the tie beam top');}
for(const o of part('Timber capital collar')){const b=bounds(o);near(b.min.y,9.18,'Die stands on the beams');assert(b.max.y<9.5,'Die stays under the rafter');}
const turnedBases=part('Column carving · turned base');
assert.equal(turnedBases.length,16,'Turned base on every free-standing shaft');
for(const o of turnedBases){
  const b=bounds(o),c=b.getCenter(new T.Vector3()),framed=Math.abs(c.x-frameX)<.5;onLine(o);
  near(b.min.y,framed?.97:.78,'Turned base stands on its plinth');
  // The base stays inside the 0.84 m pedestal, so walking clearances and sightline blockers are unchanged.
  assert(b.max.x-b.min.x<=.841&&b.max.z-b.min.z<=.841&&b.max.y-b.min.y<.65,'Turned base stays within the pedestal footprint');
}
for(const o of part('Column base +0.600').filter(o=>bounds(o).getCenter(new T.Vector3()).x<frameX-5&&Math.abs(Math.abs(bounds(o).getCenter(new T.Vector3()).z)-3.6)<.01))assert.equal(o.material.name,'Proposed light sanctuary stone','Nave pedestal is pale stone');
{
  // Carving is display geometry: keep it within a budget that the batched viewer can carry.
  let triangles=0;for(const o of nodes)if(o.isMesh&&/^(Column carving|Gilded column)/.test(o.name))triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3;
  assert(triangles<200000,`Column ornament triangle budget: ${triangles}`);
}
// The beams and roof timbers carry the same lacquer; the nave rafters and the ridge are gilded; the lining stays ivory.
const named=name=>nodes.filter(o=>o.isMesh&&o.name===name),timber=named('Proposed underside ridge member')[0].material,lacquer=shafts[0].material;
assert.equal(timber.name,'Proposed exposed roof timber colour');
assert(timber.color.equals(lacquer.color)&&timber.map===null&&timber.bumpMap===null&&timber.roughness===lacquer.roughness,'Roof timber material has the column lacquer');
for(const [name,count] of [['Schematic transverse tie',7],['Schematic rafter; no structural design',18],['Proposed visible principal rafter below roof lining',18],['Proposed longitudinal roof purlin',10],['Proposed truss king post',7],['Proposed roof truss diagonal',14],['Timber knee brace · proposed section',36]]){
  const list=named(name);assert.equal(list.length,count,name);
  for(const o of list)assert.equal(o.material,timber,`${name} is lacquered`);
}
for(const o of named('Proposed truss connection block'))assert.equal(o.material.name,'Sanctuary · carved gilding','Truss connection block is gilded');
const rafters=named('Proposed visible principal rafter below roof lining'),rafterLines=named('Gilded rafter soffit line');
assert.equal(rafterLines.length,14,'Gilded line under each nave rafter (axes 3–9, both slopes)');
for(const line of rafterLines){
  const c=bounds(line).getCenter(new T.Vector3()),rafter=rafters.find(o=>Math.abs(o.position.x-c.x)<.01&&Math.sign(o.position.z)===Math.sign(c.z));
  assert(rafter&&c.x<frameX-.5,'Rafter line belongs to a nave rafter');
  // Half the rafter depth plus 4 mm from the rafter centre line along the soffit normal: lower, and towards the nave axis.
  near(c.distanceTo(rafter.position),(rafter.userData.section||rafter.geometry.parameters).depth/2+.004,'Rafter line lies on the soffit');assert(c.y<rafter.position.y&&Math.abs(c.z)<Math.abs(rafter.position.z),'Rafter line is on the underside');
}
// Owner request, 1 November 2026: heavier roof timbers. Visualization-proxy sections (ENGINEERING HOLD); they grow downward
// from the unmoved lining, never through it. The sections are the minimum the model must keep.
{
  const RT=sandbox.window.CHURCH_SANCTUARY.spec.roofTimber,lining=z=>12.282-.7258*Math.abs(z);
  assert(RT&&RT.revision,'Roof timber sections are declared in the sanctuary spec');
  assert(RT.rafter.w>=.25&&RT.rafter.d>=.32&&RT.rafter.w>=1.4*RT.rafter.before.w&&RT.rafter.d>=1.6*RT.rafter.before.d,'Principal rafters are visibly heavier than 0.17 × 0.20 m');
  assert.equal(rafters.filter(o=>o.position.x<frameX-.5).length,14,'Fourteen nave rafters (axes 3–9, both slopes)');
  for(const o of rafters.filter(o=>o.position.x>=frameX-.5)){const p=o.geometry.parameters;assert(Math.abs(p.width-.17)<1e-9&&Math.abs(p.depth-.20)<1e-9,'Rafters behind the nave (axes 10–11) keep 0.17 × 0.20 m');}
  for(const o of rafters.filter(o=>o.position.x<frameX-.5)){
    const p=o.userData.section||o.geometry.parameters;assert(p.width>=.32&&p.depth>=.42&&o.geometry.type==='ExtrudeGeometry',`Rafter section (rounded, owner 8 Nov 2026) ${p.width} × ${p.depth} m at x ${o.position.x}`);
    assert(o.userData.proxyBefore&&Math.abs(o.userData.proxyBefore.parameters.depth-.20)<1e-9,'Rafter keeps its earlier section on record');
    // Upper face centre stays on the lining (earlier proxy: 0.0235 m above it, vertically); the growth is below.
    const down=new T.Vector3(0,0,Math.sign(o.rotation.x)).applyQuaternion(o.quaternion),top=o.position.clone().addScaledVector(down,-p.depth/2);
    const rise=top.y-lining(top.z);assert(rise>0&&rise<.03,`Rafter upper face stays at the lining (${rise.toFixed(4)} m) at x ${o.position.x}`);
  }
  const ridgeMember=named('Proposed underside ridge member')[0],rb=bounds(ridgeMember);
  assert(rb.max.y-rb.min.y>=.27&&rb.max.z-rb.min.z>=.29,`Ridge member ${(rb.max.z-rb.min.z).toFixed(3)} wide × ${(rb.max.y-rb.min.y).toFixed(3)} deep`);
  assert(Math.abs(rb.max.y-12.23)<.002&&rb.max.y<lining(0),'Ridge member grows downward from its earlier top face and stays under the lining');
  for(const [name,count,w,d] of [['Proposed truss king post',7,.17,.21],['Proposed roof truss diagonal',14,.16,.19],['Proposed timber knee brace',14,.21,.25]]){
    const list=named(name);assert.equal(list.length,count,name);for(const o of list){const p=o.geometry.parameters;assert(p.width>=w&&p.depth>=d,`${name} section ${p.width} × ${p.depth} m`);}
  }
  for(const name of ['Proposed longitudinal roof purlin','Proposed purlin before roof valley','Proposed purlin beyond roof valley'])for(const o of named(name)){
    const p=o.geometry.parameters;assert(p.width>=.16&&p.depth>=.13,`${name} section ${p.width} × ${p.depth} m`);
    const ob=bounds(o);assert(ob.max.y<lining(o.position.z)+.001,`${name} stays under the lining`);
  }
  for(const o of named('Timber knee brace · proposed section'))assert(o.geometry.parameters.radiusTop>=.1,'Knee brace rod radius');
}
const ridgeLine=named('Gilded ridge soffit line')[0],ridgeBox=bounds(named('Proposed underside ridge member')[0]);
assert(ridgeLine,'Gilded ridge line');
{const b=bounds(ridgeLine);assert(b.max.y<=ridgeBox.min.y+.003&&b.min.y>ridgeBox.min.y-.02,'Ridge line hangs under the ridge member');assert(b.min.x>5.4&&b.max.x<frameX,'Ridge line runs along the nave and stops at the frame');}
assert.equal(named('Gilded ridge boss').length,7,'A boss where each pair of nave rafters meets');
const roofLining=named('Proposed timber lining under the source roof planes')[0].material;
assert.equal(roofLining.name,'Proposed warm-ivory timber roof lining finish');assert(roofLining.color.r>.8&&roofLining.color.b>.6,'Boarded roof lining stays ivory');
// The colour toggle must bring the lacquer back, not the earlier natural grain.
realism.finish(false);realism.finish(true);
assert(timber.color.equals(lacquer.color)&&timber.map===null,'Reference palette keeps the lacquered roof timber');
assert(sandbox.window.CHURCH_SANCTUARY.naturalTimber.map,'Natural timber grain kept for the simulator tone setting');
for(const name of ['Our Lady shrine · axis 11','Saint Joseph shrine · axis 11']) {
  const wing=nodes.find(o=>o.name===name);assert(wing,name);
  const shelf=wing.children.find(o=>o.name==='Raised statue shelf above entrance');
  near(bounds(shelf).min.y,2.55,'Shelf clears service door head at 2.35 m');
  const sb=bounds(shelf),inner=Math.min(Math.abs(sb.min.z),Math.abs(sb.max.z)),outer=Math.max(Math.abs(sb.min.z),Math.abs(sb.max.z));
  near(inner,3.965,'Shelf reaches the inner axis-11 pier face with a small gap');
  near(outer,7.065,'Shelf reaches the outer concrete support face with a small gap');
  const b=bounds(wing),z=Math.abs(wing.position.z);
  assert(b.min.x>shrineAxisX-.2&&b.min.x<shrineAxisX&&b.max.x<shrineAxisX+1.4,'Shrine stands in the axis-11 side arch');
  // The axis-10 frame's side arch in front of the shrine is left open.
  const side=nodes.filter(o=>o.name==='Front frame side spandrel').find(o=>Math.sign(bounds(o).getCenter(new T.Vector3()).z)===Math.sign(wing.position.z));
  assert(!nodes.some(o=>o.isMesh&&o.visible!==false&&/^(Raised statue shelf|Service entrance jamb|Shrine bay fill)/.test(o.name)&&bounds(o).min.x<frameX+.5),'Nothing of the shrine is left in the axis-10 frame');
  // The bay behind the shrine is closed in lacquered timber above the shelf, wall to wall and up to the roof lining.
  const fill=wing.children.find(o=>o.name==='Shrine bay fill · lacquered timber');assert(fill,'Shrine bay fill');
  const f=bounds(fill);near(f.min.y,2.85,'Bay fill stands on the shelf');
  near(Math.min(Math.abs(f.min.z),Math.abs(f.max.z)),3.75,'Bay fill meets the chamber wall');near(Math.max(Math.abs(f.min.z),Math.abs(f.max.z)),7.25,'Bay fill meets the C/G wall');
  assert(f.max.y>9.3&&f.max.y<9.6&&f.min.x>shrineAxisX+.25,'Bay fill rises to the roof lining behind the axis-11 arch');
  assert.equal(fill.material.name,'Sanctuary · oxblood lacquer');
  assert(bounds(side).min.y<=S.sideArch.spring+.001,'Side arch springs above the shrine shelf');
  near(z,S.wingZ,'Shrine centred in the C–D / E–G bay');
  assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=3.749&&Math.max(Math.abs(b.min.z),Math.abs(b.max.z))<=7.251,'Shrine and its returns fit between the chamber wall and the C/G wall');
  for(const base of wing.children.filter(o=>o.name==='Stone doorway base')){const c=bounds(base);assert(Math.min(Math.abs(c.min.z),Math.abs(c.max.z))>4.02&&Math.max(Math.abs(c.min.z),Math.abs(c.max.z))<6.94,'Shrine bases clear the D/E column base and the C/G pier base');}
}
const walls=nodes.filter(o=>o.name==='Chamber side lintel · lacquered timber');
assert.equal(walls.length,2,'Chamber keeps two lacquered side lintels');
// Parish priest, 25 Oct 2026: open between the axis-10 and axis-11 columns below the lintel, and
// red lacquer and gilding over the two shrines in the axis-11 side arches.
for(const o of walls)assert(bounds(o).min.y>=S.chamber.lintel-.001,'no lacquered wall below the lintel between columns 10 and 11');
assert(!nodes.some(o=>/^(Chamber cornice|Chamber pilaster relief)$/.test(o.name)),'no low lacquered panels left between the columns');
const over11=nodes.filter(o=>o.name==='Axis-11 side spandrel · lacquer and gilding');assert(over11.length===2&&over11.every(o=>{const b=bounds(o);return b.max.y>8.5&&Math.abs(b.min.x-(S.arch11.x-.16))<.01&&b.min.y>=S.arch11.spring-.01;}),'lacquered and gilded spandrels over both shrines: '+over11.map(o=>JSON.stringify(bounds(o))).join(' '));
for(const [name,count,finish] of [['Sanctuary arch spandrel',2,'Sanctuary · oxblood lacquer, satin'],['Three-lobed sanctuary arch moulding',4,'Sanctuary · carved gilding']]){
  const side=nodes.filter(o=>o.isMesh&&o.name===name&&Math.abs(bounds(o).getCenter(new T.Vector3()).z)>4);
  assert.equal(side.length,count,'The two marked side arches retain their original geometry');
  for(const o of side){assert.equal(o.material.name,finish,'The side arch has the requested finish');assert.equal(o.userData.surfaceFinish.engineeringApproved,false);assert(o.userData.surfaceFinish.originalMaterial,'The underlying proxy material is recorded');}
}
for(const o of walls){const b=bounds(o);assert(b.min.x>=frameX+.31&&b.max.x<=data.longitudinal['11'],'Chamber wall runs from the axis-10 column back to axis 11');assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=3.299,'Chamber keeps the 6.6 m clear width of the arch');}
const vault=nodes.find(o=>o.name==='Chamber vault · gilded boarding'),lining=nodes.find(o=>o.name==='Chamber back lining · lacquered timber');
// Owner, 3 Nov 2026 (centre of the sanctuary): gilded glory inside the niche, gilded architrave, red-and-gold altar and tabernacle.
{
  const one=name=>{const o=nodes.filter(n=>n.isMesh&&n.name===name);assert.equal(o.length,1,name);return o[0];};
  const glory=bounds(one('Crucifix niche · gilded glory')),recess=bounds(one('Blue crucifix recess'));
  assert(glory.min.x<recess.min.x&&glory.max.x<=recess.min.x+.001&&glory.max.x>recess.min.x-.03,'Glory stands on the face of the blue niche wall');
  assert(glory.min.y>=S.niche.floor&&glory.max.y<=S.niche.spring+S.niche.rise-.02&&Math.max(-glory.min.z,glory.max.z)<=S.niche.half-.3,'Glory stays inside the niche outline');
  assert(one('Crucifix niche · gilded architrave'),'Gilded architrave round the niche');
  const lac=nodes.find(n=>n.name==='Crucifix base step').material;
  assert.equal(one('Proposed tabernacle pedestal').material,lac,'Tabernacle pedestal in the red satin lacquer');
  // The altar stays pale stone (owner, 3 Nov 2026: back to the white stone).
  for(const name of ['Proposed altar front panel','Proposed altar stone base'])assert(one(name).material!==lac&&!/lacquer/.test(one(name).material.name),name+' stays pale stone');
  assert.equal(nodes.filter(n=>n.name==='Altar front · gilded panel moulding').length,0,'No gilded panels on the stone altar');
  assert.equal(nodes.filter(n=>n.name==='Reredos · gilded spandrel scroll').length,2,'A gilded scroll over each pair of lowered pilasters');
  assert.equal(nodes.filter(n=>n.name==='Reredos · gilded rosette medallion').length,1,'A gilded medallion above the spray');
  for(const o of nodes.filter(n=>n.name==='Carved central pilaster'))assert(bounds(o).max.y<=S.reredosPilasterTop+.09,'Central pilasters lowered to the niche springing');
  assert.equal(nodes.filter(n=>n.name==='Tabernacle colonnette').length,2,'Two gilded colonnettes on the tabernacle');
}
assert(vault&&lining,'Chamber vault and back lining');
assert(bounds(vault).min.y>=S.centralArch.spring-.001&&bounds(vault).max.y<12.1,'Vault springs at the arch and stays under the roof');
// Owner, 1 Nov 2026: the gilded boarded vault continues over both side passages, from the axis-10 side arch back to the
// axis-11 side arch above each shrine, on the outlines of those arches, under the roof lining and clear of every route.
{
  const V=S.sideVault,boards=nodes.filter(o=>o.isMesh&&o.name==='Side vault · gilded boarding'),roofY=sandbox.window.CHURCH_SANCTUARY.roofY;
  assert.equal(boards.length,2,'One side vault over each passage');
  assert.deepEqual(boards.map(o=>Math.sign(bounds(o).getCenter(new T.Vector3()).z)).sort(),[-1,1],'Side vaults on both sides');
  assert.equal(nodes.filter(o=>o.name==='Side vault springing beam · lacquered timber').length,2,'A lacquered springing beam along the outer edge of each vault');
  // Owner, 3 Nov 2026: gilded boarding runs on from the chamber vault to each side vault, with no lacquered band between.
  const coves=nodes.filter(o=>o.isMesh&&o.name==='Side vault · gilded cove to the chamber vault');
  assert.equal(coves.length,2,'One gilded cove between the chamber vault and each side vault');
  for(const o of coves){
    const b=bounds(o),C=S.chamber;
    assert.equal(o.material,vault.material,'Cove is the same gilded boarding as the chamber vault');
    near(Math.min(Math.abs(b.min.z),Math.abs(b.max.z)),C.face,'Cove face on the chamber face line');
    near(b.max.y,S.centralArch.spring,'Cove starts at the chamber vault springing');
    near(b.min.x,V.x0,'Cove front edge');near(b.max.x,V.x1,'Cove back edge');
    assert(b.min.y>=S.arch11.spring-.1&&Math.max(Math.abs(b.min.z),Math.abs(b.max.z))<C.lintelFace+.6,'Cove ends at the inner springing of the side vault');
  }
  for(const o of walls){const b=bounds(o);assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=S.chamber.lintelFace-.001,'Lintel stands behind the gilded cove');}
  assert(nodes.filter(o=>o.name==='Vault springing cornice').every(o=>o.material===nodes.find(n=>n.name==='Gilded cornice edge').material),'Springing cornice is gilded');
  assert(!nodes.some(o=>/^(Chamber wall pilaster|Chamber lintel soffit moulding)$/.test(o.name)),'no lacquered pilasters or soffit moulding left on the lintel');
  const plumb=nodes.filter(o=>o.name==='Cove grid · plumb lacquer rib');
  assert.equal(plumb.length,8,'Four ribs continue down each plumb cove');
  assert.equal(nodes.filter(o=>o.name==='Cove grid · longitudinal lacquer strip').length,4,'Two red grid lines on each plumb face');
  assert.equal(nodes.filter(o=>o.name==='Cove grid · cornice saddle').length,8,'Red grid joins over each cornice');
  for(const side of [-1,1]){
    const set=plumb.filter(o=>Math.sign(o.position.z)===side);
    assert.deepEqual(set.map(o=>o.position.x),Array.from(S.ceilingGrid.worldStations),'Cove ribs align with the upper ceiling');
    for(const o of set){
      const b=bounds(o);
      near(b.max.y,S.centralArch.spring,'Plumb rib reaches upper vault springing');
      near(b.min.y,S.chamber.coveY,'Plumb rib joins the lower curve');
    }
    const ribs=nodes.filter(o=>o.name==='Side vault rib · lacquered timber'&&Math.sign(bounds(o).getCenter(new T.Vector3()).z)===side);
    assert.deepEqual(ribs.map(o=>+o.geometry.parameters.path.points[0].x.toFixed(3)),Array.from(S.ceilingGrid.worldStations,x=>+x.toFixed(3)),'Side ribs retain the same continuous grid stations');
  }
  assert.equal(nodes.filter(o=>o.name==='Side vault rib · lacquered timber').length,8,'Four lacquered transverse ribs per vault');
  assert.equal(nodes.filter(o=>o.name==='Vault coffer · inset lacquer moulding').length,12,'Twelve inset chamber-vault field borders follow the vault');
  assert.equal(nodes.filter(o=>o.name==='Vault coffer · side inset lacquer moulding').length,18,'Nine inset side-vault borders per side');
  assert.equal(nodes.filter(o=>o.name==='Reredos lower panel · carved lotus').length,7,'Seven carved reredos lower panels');
  assert.equal(nodes.filter(o=>o.name==='Shrine shelf · carved floral panel').length,14,'Seven connected shelf panels per shrine reach toward the supports');
  assert.equal(nodes.filter(o=>o.name==='Side vault longitudinal rib').length,18,'Five lacquered longitudinal ribs per vault, as in the chamber vault, and four on each gilded cove (owner, 3 Nov 2026)');
  // USER CONFIRMED 1 Nov 2026: the vaults meet the frame with no gap, so the front edge is the back face of the axis-10 side spandrels.
  const spandrels=nodes.filter(o=>o.isMesh&&o.name==='Front frame side spandrel');
  assert.equal(spandrels.length,2,'Two side spandrels in the axis-10 frame');
  for(const sp of spandrels)near(bounds(sp).max.x,V.x0,'Side vault front edge meets the back face of the axis-10 frame');
  assert(V.x1<=S.arch11.x-.15&&V.x1>S.arch11.x-.3,'Vault ends against the axis-11 side spandrel');
  for(const o of boards){
    const b=bounds(o),p=o.geometry.attributes.position,v=new T.Vector3();
    assert.equal(o.material,vault.material,'Side vault boarding is the same gilded boarding as the chamber vault');
    near(b.min.x,V.x0,'Side vault front edge');near(b.max.x,V.x1,'Side vault back edge');
    assert(Math.min(Math.abs(b.min.z),Math.abs(b.max.z))>=3.75&&Math.max(Math.abs(b.min.z),Math.abs(b.max.z))<=7.25,'Side vault stays between the chamber lintel and the C/G wall');
    assert(b.min.y>=S.arch11.spring-.1&&b.min.y>2.85+2.2,'Side vault springs high above the shrine shelf, the 2.2 m service doorways and every walking route');
    // Against the frame (1 Nov 2026) the outer shoulders of the outline stand 0.32 m under the lining, which falls towards
    // the C/G wall: the front 0.5 m keeps at least 0.3 m (documented hold: access above the vault), the rest at least 0.4 m.
    let clear=1e9,clearBehind=1e9;for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const c=roofY(v.z)-v.y;clear=Math.min(clear,c);if(v.x>V.x0+.5)clearBehind=Math.min(clearBehind,c);}
    assert(clear>=.3,'Side vault keeps 0.3 m under the roof lining at the frame: '+clear.toFixed(3));
    assert(clearBehind>=.4,'Side vault keeps 0.4 m under the roof lining behind its front 0.5 m: '+clearBehind.toFixed(3));
    // The crown follows the outline of the side arch at the front and of the axis-11 arch at the back.
    const z=Math.sign(b.min.z+b.max.z)*S.wingZ,ray=new T.Raycaster(),crownAt=x=>{ray.set(new T.Vector3(x,3,z),new T.Vector3(0,1,0));const h=ray.intersectObject(o,false);return h.length?h[0].point.y:NaN;};
    for(const x of [V.x0+.01,V.x1-.01]){const t=(x-V.x0)/(S.arch11.x-V.x0),want=S.sideArch.crown+(S.arch11.crown-S.sideArch.crown)*t+.04;assert(Math.abs(crownAt(x)-want)<.03,`Side vault soffit follows the arch outlines at x ${x.toFixed(2)}: ${crownAt(x)} vs ${want}`);}
  }
}
const backWall=nodes.find(o=>o.name==='Sanctuary back wall behind the reredos');
assert(bounds(lining).max.x<=bounds(backWall).min.x+.001,'Timber lining covers the plaster back wall');
const cross=nodes.find(o=>o.name==='Proposed sanctuary crucifix upright');
const blue=nodes.find(o=>o.name==='Blue crucifix recess');
assert(bounds(cross).max.x<bounds(blue).min.x,'Crucifix sits in front of blue backing');
// Deep crucifix niche: blue wall 1.0 m behind the reredos face, cross and corpus inside it on a base,
// plaster casing clear of the service-room boards and standing through the notched ceiling.
const niche=S.niche,reveal=nodes.find(o=>o.name==='Crucifix niche reveal · lacquered timber'),casings=nodes.filter(o=>o.name==='Crucifix niche casing · plaster');
assert(reveal&&casings.length===2,'Niche reveal and casing');
near(bounds(blue).min.x,niche.backX,'Blue wall stands back in the niche');
near(bounds(reveal).min.x,niche.mouthX,'Niche opens at the reredos face');near(bounds(reveal).max.x,niche.backX,'Reveal runs back to the blue wall');
assert(niche.backX-niche.mouthX>=1,'Niche is at least 1.0 m deep');
const corpus=nodes.find(o=>o.name.startsWith('Illustrative bronze corpus'));
assert(bounds(corpus).min.x>niche.mouthX+.3&&bounds(cross).min.x>niche.mouthX+.3,'Cross and corpus stand inside the niche');
// The corpus is one carved figure hung from the crossarm (9 October 2026), not the earlier jointed proxy.
{
  const carved=nodes.filter(o=>o.isMesh&&o.name==='Illustrative corpus · carved figure'),arm=nodes.find(o=>o.name==='Proposed sanctuary crucifix crossarm'),b=bounds(corpus),a=bounds(arm),f=bounds(carved[0]);
  assert.equal(carved.length,1,'one carved corpus');
  assert(!nodes.some(o=>/^Illustrative corpus (head|torso|upper arm|forearm|hand|upper leg|lower leg)$/.test(o.name)),'jointed proxy parts removed');
  assert(carved[0].geometry.attributes.position.count/3>20000,'corpus is modelled in the round');
  assert(f.max.x<=a.min.x+.012&&f.min.x>a.min.x-.45,'corpus hangs on the face of the cross, towards the nave');
  assert(f.max.z-f.min.z>1.6&&f.max.z-f.min.z<a.max.z-a.min.z&&f.max.y-f.min.y>1.9&&f.max.y-f.min.y<2.2,'corpus span and height fit the cross');
  assert(Math.abs(f.max.y-(a.min.y+a.max.y)/2)<.12&&f.min.y>bounds(cross).min.y+.3,'hands at the crossarm, feet above the base');
  for(const [name,material] of [['Illustrative modest draped loincloth','Sanctuary · carved gilding'],['Carved corpus hair, beard and crown of thorns','Sanctuary · carved figure, darker tone'],['Crucifix nails','Sanctuary · forged iron nail'],['Crucifix title board','Sanctuary · carved gilding'],['Crucifix title · INRI','Sanctuary · gilded title board']]){
    const o=nodes.find(o=>o.name===name);assert(o&&o.material.name===material,`${name}: ${material}`);assert(bounds(o).min.x>niche.mouthX+.3&&bounds(o).max.x<bounds(blue).min.x,`${name} inside the niche`);
  }
  // Owner, 9 October 2026: the sanctuary timber is red and gold. Cross, niche boards, base and furniture take the satin red lacquer.
  for(const name of ['Proposed sanctuary crucifix upright','Proposed sanctuary crucifix crossarm','Crucifix niche reveal · lacquered timber','Outer carved canopy','Central carved timber silhouette','Crucifix base step','Proposed sloped ambo desk','Proposed sanctuary chair seat','Chair leg'])
    for(const o of nodes.filter(o=>o.isMesh&&o.name===name))assert.equal(o.material.name,'Sanctuary · oxblood lacquer, satin',`${name} is red lacquer`);
  const satin=cross.material,polished=shafts[0].material;
  assert(satin.color.r>2.2*satin.color.g&&satin.color.r>2.2*satin.color.b&&!satin.map&&satin.clearcoat<polished.clearcoat,'satin lacquer is the column red without the mirror coat');
  assert(satin.roughness>=.55&&satin.clearcoat<=.15,'satin lacquer stays matt: no pale sheen on the cross under the evening accents');
  assert(!nodes.some(o=>o.isMesh&&o.material?.name==='Proposed dark-stained timber joinery'&&bounds(o).min.x>S.frameX-4&&bounds(o).max.x<niche.endX&&Math.abs((bounds(o).min.z+bounds(o).max.z)/2)<7.3),'no brown joinery left in the sanctuary');
}
near(Math.max(...nodes.filter(o=>o.name==='Crucifix base step').map(o=>bounds(o).max.y)),bounds(cross).min.y+.02,'Cross stands on its stepped base');
for(const name of ['Central carved timber silhouette','Reredos carved ground','Outer carved canopy','Chamber back lining · lacquered timber','Sanctuary back wall behind the reredos']){
  const hit=new T.Raycaster(new T.Vector3(47,4.5,.6),new T.Vector3(1,0,0)).intersectObject(nodes.find(o=>o.name===name),false);
  assert.equal(hit.length,0,`${name} is open for the niche`);
}
// Sanctuary relief of the approved concept: gilded scrollwork and relief as tileable finishes on plates and grounds,
// a glowing blue behind the crucifix and the statues, crocketed pinnacles, leaf crestings on the arches, a carved
// wooden corpus with a gilded cloth, and a gilded, domed tabernacle.
{
  const finish=name=>nodes.find(o=>o.isMesh&&o.material?.name===name)?.material;
  for(const name of ['Sanctuary · gilded scrollwork on lacquer','Sanctuary · gilded relief']){
    const m=finish(name);assert(m&&m.map&&m.bumpMap&&m.metalnessMap&&m.roughnessMap===m.metalnessMap,`${name} is a relief finish with gilded metal and lacquered ground`);
    assert(m.map.repeat.x>=1&&m.map.repeat.x<=3,`${name} repeats at a carved scale`);
  }
  for(const [name,count,material] of [['Shrine shelf frieze',2,'Sanctuary · gilded relief'],['Reredos frieze relief',2,'Sanctuary · gilded relief'],['Carved panel relief',11,'Sanctuary · gilded scrollwork on lacquer'],['Shrine bay relief ground',2,'Sanctuary · oxblood lacquer, satin']]){
    const list=part(name);assert.equal(list.length,count,name);
    for(const o of list){
      const expected=name==='Carved panel relief'&&o.parent.name==='Central gilded reredos'?'Sanctuary · oxblood lacquer, satin':material;
      assert.equal(o.material.name,expected,`${name} finish`);
      // Plates carry metre-based texture coordinates, so the carving keeps one scale on every part.
      const uv=o.geometry.attributes.uv,size=dimensions(o);let span=0;for(let i=0;i<uv.count;i++)span=Math.max(span,uv.getX(i),uv.getY(i));
      assert(Math.abs(span-Math.max(size.x,size.y,size.z))<.02,`${name} is mapped in metres`);
    }
  }
  assert.equal(part('Carved panel relief').filter(o=>o.material.name==='Sanctuary · oxblood lacquer, satin').length,7,'Seven lower panels have plain lacquer behind the raised carving');
  // The four central pilasters and the four side-shrine pilasters plus four door jambs
  // use individually bounded, genuinely raised gold carving on red lacquer.
  for(const label of ['Central pilaster','Wing pilaster','Shrine jamb']) {
    const relief=part(label+' · carved foliage'),fields=part(label+' · red lacquer field');
    assert.equal(relief.length,4,label+' has four raised carved faces');
    assert.equal(fields.length,4,label+' has four separate red lacquer fields');
    assert.equal(part(label+' · gilded edge').length,16,label+' retains four edges per panel');
    assert.equal(part(label+' · gilded return').length,8,label+' retains two gilt lines on its red returns');
    for(const o of relief){
      const field=fields.find(f=>f.parent===o.parent&&Math.abs(f.position.x-o.position.x)<.001);
      assert(field,label+' carving has its own field');
      assert.equal(o.material.name,'Sanctuary · carved gilding');
      assert.equal(field.material.name,'Sanctuary · oxblood lacquer, satin');
      assert.equal(o.userData.engineeringApproved,false);
      o.geometry.computeBoundingBox(); const b=o.geometry.boundingBox,w=field.geometry.parameters.width;
      assert(b.min.x>=-w/2-.002&&b.max.x<=w/2+.002,`${label} foliage stays inside its own red field: ${b.min.x},${b.max.x},${w}`);
      assert(b.min.y>=-.002&&b.max.y<=field.geometry.parameters.height+.002,`${label} foliage stays between the panel ends`);
      assert(o.position.z+b.max.z>field.position.z+field.geometry.parameters.depth/2+.02,`${label} carving projects visibly from the lacquer`);
    }
    for(let i=0;i<relief.length;i++)for(let j=i+1;j<relief.length;j++)assert(!bounds(relief[i]).intersectsBox(bounds(relief[j])),label+' reliefs do not collide with each other');
  }
  // Finish the existing outer concrete supports without replacing their cores.
  // Each face is a thin skin on that core and has its own raised, bounded carving.
  const supportGroups=nodes.filter(o=>/^Concrete support cladding · (10|11)\/[BH]$/.test(o.name));
  assert.equal(supportGroups.length,4,'Both outer supports on both sanctuary frames are clad');
  // Owner, 7 Nov 2026: only the faces seen indoors are clad (axis 11: nave face + two side strips; axis 10: nave
  // face, wing face, side strip and the wing part of the porch face); nothing red reaches the porch.
  assert.equal(part('Concrete support cladding · lacquer skin').length,14,'Interior skins per support');
  assert.equal(part('Concrete support · carved foliage').length,8,'Carved nave and wing faces, with breaks for the back-frame speakers');
  for(const o of nodes.filter(o=>o.isMesh&&/^Concrete support/.test(o.name))){const b=bounds(o);
    if(Math.max(Math.abs(b.min.z),Math.abs(b.max.z))>7.255)assert(b.max.x<=44.016,o.name+' reaches past the wall only inside the 9–10 wing');}
  for(const group of supportGroups){
    assert.equal(group.userData.engineeringApproved,false);
    const centre=group.getWorldPosition(new T.Vector3());
    const core=part('Side column — illustrative shaft width').find(o=>{
      const p=bounds(o).getCenter(new T.Vector3());return Math.abs(p.x-centre.x)<.001&&Math.abs(p.z-centre.z)<.001;
    });
    assert(core,group.name+' retains its original concrete support proxy');
    assert.equal(core.material.name,'Interior wall paint · pale yellow cream','Concrete core carries the nave wall paint');
    const faces=group.children.filter(o=>o.name==='Concrete support cladding · face');
    assert.equal(faces.length,group.name.startsWith('Concrete support cladding · 10/')?4:3);
    for(const face of faces){
      const skin=face.children.find(o=>o.name==='Concrete support cladding · lacquer skin');
      const fields=face.children.filter(o=>o.name==='Concrete support · red lacquer field');
      const carvings=face.children.filter(o=>o.name==='Concrete support · carved foliage');
      assert(skin&&fields.length===carvings.length,'Each clad face is finished, and each carved face has its fields');
      assert(bounds(core).expandByScalar(.003).containsBox(bounds(skin)),'Skin follows the existing support face');
      assert.equal(skin.material.name,'Sanctuary · oxblood lacquer, satin');
      for(const carving of carvings){
        const field=fields.find(o=>Math.abs(o.position.y-o.geometry.parameters.height/2-carving.position.y)<.001);
        assert(field,'Each carving belongs to its own field');
        assert.equal(carving.material.name,'Sanctuary · carved gilding');
        carving.geometry.computeBoundingBox();
        const b=carving.geometry.boundingBox;
        assert(b.min.x>=-field.geometry.parameters.width/2-.002&&b.max.x<=field.geometry.parameters.width/2+.002,'Support carving remains inside its field');
        assert(b.min.y>=-.002&&b.max.y<=field.geometry.parameters.height+.002,'Support carving stays between field ends');
      }
    }
  }
  assert.equal(part('Stone doorway base').length,4,'Four underlying doorway-base proxies remain');
  assert.equal(part('Shrine base · lacquer skin').length,16,'All four faces of each doorway base are clad');
  assert.equal(part('Shrine base · carved lotus').length,4,'A raised lotus anchors each jamb to its base');
  for(const base of part('Stone doorway base')){
    assert.equal(base.material.name,'Sanctuary · pale stone','The original base proxy remains under the finish');
    const skins=base.parent.children.filter(o=>o.name==='Shrine base · lacquer skin'&&Math.abs(o.position.x-base.position.x)<.32);
    assert.equal(skins.length,4,'Each doorway base has its own four skins');
    assert(skins.every(o=>bounds(base).expandByScalar(.003).containsBox(bounds(o))),'Base skins follow the existing base without extending the opening');
  }
  assert.equal(part('Reredos carved ground')[0].material.name,'Sanctuary · oxblood lacquer','Plain red ground leaves the raised carving legible');
  assert.equal(part('Reredos · connected foliate spray').length,1,'One connected spray fills the space above the central niche');
  // Test the whole projected carving, including curled leaf tips. A clear centre
  // ray alone would miss a leaf crossing the edge of the blue recess.
  const groundShape=part('Reredos carved ground')[0].geometry.parameters.shapes;
  const contour=groundShape.getPoints(40),hole=groundShape.holes[0].getPoints(40);
  function insidePolygon(x,y,polygon){
    let inside=false;
    for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
      const a=polygon[i],b=polygon[j];
      if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;
    }
    return inside;
  }
  const spray=part('Reredos · connected foliate spray')[0];
  const carvedPoints=spray.geometry.attributes.position;
  for(let i=0;i<carvedPoints.count;i++){
    const x=carvedPoints.getX(i)+spray.position.x,y=carvedPoints.getY(i)+spray.position.y;
    assert(!insidePolygon(x,y,hole),'Raised reredos foliage clears the blue niche at '+x+','+y);
    assert(insidePolygon(x,y,contour),'Raised reredos foliage has lacquer backing at '+x+','+y);
    assert(carvedPoints.getZ(i)+spray.position.z>.134,'Carving stays in front of the reredos ground');
  }
  // Chasing belongs to the actual architrave face, including the lower legs.
  const architrave=part('Crucifix niche · gilded architrave')[0];
  const bandShape=architrave.geometry.parameters.shapes;
  const bandContour=bandShape.getPoints(40),bandHole=bandShape.holes[0].getPoints(40);
  const chasing=part('Crucifix niche · chased foliage band');
  assert.equal(chasing.length,1,'One continuous chased architrave');
  const chasedPoints=chasing[0].geometry.attributes.position;
  for(let i=0;i<chasedPoints.count;i++){
    const x=chasedPoints.getX(i),y=chasedPoints.getY(i);
    assert(insidePolygon(x,y,bandContour)&&!insidePolygon(x,y,bandHole),'Chasing stays on the existing gold face at '+x+','+y);
    assert(chasedPoints.getZ(i)+chasing[0].position.z>.238,'Chasing stands on the architrave face');
  }
  for(const o of part('Reredos lower panel · carved lotus')){
    o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
    assert(b.min.x>=-.31&&b.max.x<=.31&&b.min.y>=-.34&&b.max.y<=.34,'Lower carving stays in its original panel');
    assert(o.position.z+b.min.z>=.472&&o.position.z+b.min.z<.48,'Lower carving is rooted against the existing panel face');
  }
  assert.equal(part('Reredos frieze · running foliate relief').length,2,'Both red friezes have raised running relief');
  for(const o of part('Reredos frieze · running foliate relief')){
    o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
    assert(b.min.x>=-3.2&&b.max.x<=3.2,'Frieze carving clears the cornice ends');
    assert(b.max.y-b.min.y<.15,'Frieze carving stays between its mouldings');
  }
  const reredos=nodes.find(o=>o.name==='Central gilded reredos');
  const upperSpires=reredos.children.filter(o=>o.name==='Carved pinnacle'&&o.position.y>5.5);
  const archParts=reredos.children.filter(o=>['Gilded leaf cresting','Gilded carved moulding','Crucifix niche · outer bead','Reredos · connected foliate spray','Crucifix niche · leaf cresting','Crucifix niche · gilded glory'].includes(o.name));
  assert.equal(upperSpires.length,4,'Four central pilaster pinnacles remain');
  for(const arch of archParts)for(const spire of upperSpires){
    const b=bounds(spire),p=arch.geometry.attributes.position,v=new T.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(arch.matrixWorld);assert(!b.containsPoint(v),`Reredos moulding or cresting enters a pinnacle envelope: ${arch.name}`);}
  }
  assert.equal(part('Crucifix niche · outer bead').length,2,'Two niche beads stop within the inner columns');
  for(const o of part('Crucifix niche · outer bead'))assert(Math.max(Math.abs(bounds(o).min.z),Math.abs(bounds(o).max.z))<1.985,'Central niche beads clear the pilasters');
  assert.equal(part('Shrine niche · outer bead').length,4,'Two beads per side niche');
  assert.equal(part('Shrine niche · leaf cresting').length,2,'A restrained leaf crest crowns each side niche');
  for(const wing of ['Our Lady shrine · axis 11','Saint Joseph shrine · axis 11']) {
    const group=nodes.find(o=>o.name===wing);
    const arches=group.children.filter(o=>/^Shrine niche · (outer bead|leaf cresting)$/.test(o.name));
    for(const arch of arches)for(const column of group.children.filter(o=>o.name==='Wing carved pilaster')){
      const b=bounds(column),p=arch.geometry.attributes.position,v=new T.Vector3();
      for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(arch.matrixWorld);assert(!b.containsPoint(v),'Side niche mouldings clear the pilaster shafts');}
    }
  }
  for(const o of nodes.filter(o=>/^Front frame (central|side) spandrel$/.test(o.name)))assert.equal(o.material.name,'Sanctuary · oxblood lacquer, satin','Front frame has lacquer behind its sculpted gold borders');
  const fitted=nodes.filter(o=>o.userData.reliefMask);
  assert.equal(fitted.length,20,'Sculpted borders on five frames, both shrines and the reredos');
  for(const o of fitted){
    assert(o.userData.repeats>0,'Fitted carving has complete scrolls: '+o.name);
    const mask=o.userData.reliefMask;
    const outer=mask.contour.map(([x,y])=>({x,y})),holes=mask.holes.map(h=>h.map(([x,y])=>({x,y})));
    const backingName=o.name.startsWith('Shrine ·')?'Shrine bay fill · lacquered timber':
      o.name.startsWith('Reredos ·')?'Reredos carved ground':o.name.replace(/ · (rolled scroll border|foliate outer field)$/,'');
    const backing=o.parent.children.find(p=>{
      if(p.name!==backingName)return false;
      const first=p.geometry.parameters.shapes.getPoints(36)[0];
      return Math.abs(first.x-outer[0].x)<1e-6&&Math.abs(first.y-outer[0].y)<1e-6;
    });
    assert(backing,'Carving has its actual backing: '+o.name);
    const shape=backing.geometry.parameters.shapes;
    const contour=shape.getPoints(36),openings=shape.holes.map(h=>h.getPoints(36));
    const vertices=o.geometry.attributes.position;
    for(let i=0;i<vertices.count;i++){
      const x=vertices.getX(i),y=vertices.getY(i);
      assert(insidePolygon(x,y,outer)&&!holes.some(h=>insidePolygon(x,y,h)),'Fitted carving respects the reserved field: '+o.name);
      assert(insidePolygon(x,y,contour)&&!openings.some(h=>insidePolygon(x,y,h)),'Carving remains on its actual supporting face: '+o.name);
      assert(vertices.getZ(i)+o.position.z>=o.userData.face-.006,'Raised scroll stays on the visible side of its backing');
    }
  }
  for(const [name,material] of [['Blue crucifix recess','Sanctuary · blue niche'],['Wing blue niche','Sanctuary · shrine niche blue']])for(const o of part(name)){assert.equal(o.material.name,material);assert(o.material.map,`${name} has its glow`);}
  assert.equal(part('Wing blue niche').length,2);
  assert.equal(part('Carved pinnacle').length,8,'Four spires on the reredos pilasters and four on the gradine');
  assert.equal(part('Wing pinnacle').length,4);
  assert.equal(part('Gilded leaf cresting').length,3,'Three outer canopy crestings remain');
  assert.equal(part('Gilded arch cresting').length,7,'Crestings remain on the three front arches, two shrine heads and two axis-11 arches');
  for(const o of nodes.filter(o=>o.isMesh&&/^Illustrative corpus /.test(o.name)))assert.equal(o.material.name,'Sanctuary · carved figure, natural wood');
  const dome=part('Tabernacle dome')[0],enclosure=part('Proposed tabernacle enclosure')[0];
  assert(dome&&enclosure&&dome.material===enclosure.material&&dome.material.name==='Sanctuary · carved gilding','Tabernacle is gilded under a dome');
  near(bounds(dome).min.y,bounds(enclosure).max.y,'Dome stands on the tabernacle');
}
const casing=casings.reduce((b,o)=>b.union(bounds(o)),new T.Box3());
near(casing.max.x,niche.endX,'Casing rear face');
for(const o of nodes.filter(o=>/^(Wall enclosure · (Main|Lighting|Fans)|Cable tray|19-inch sound rack)/.test(o.name)))assert(bounds(o).max.y<casing.min.y,`Niche casing clears ${o.name}`);
const ceilings=nodes.filter(o=>o.name==='Service room ceiling');
assert.equal(ceilings.length,3,'Service room ceiling is notched round the niche');
for(const o of ceilings)assert(!bounds(o).intersectsBox(casing),'Ceiling slab does not cross the niche');
// The ambo stands well in front of the altar.
const amboFoot=nodes.find(o=>o.name==='Proposed ambo foot'),altarFoot=nodes.find(o=>o.name==='Proposed altar foot');
near(bounds(amboFoot).getCenter(new T.Vector3()).x,41.3,'Ambo position');
assert(bounds(altarFoot).min.x-bounds(amboFoot).max.x>=2,'At least 2 m between the ambo and the altar');
assert(bounds(amboFoot).min.x-39.345>=1,'Ambo stays 1 m back from the head of the sanctuary steps');
// Sanctuary furnishings, design excellence stage 2 (20 Nov 2026): appearance only, footprints kept.
{
  const one=name=>{const list=nodes.filter(o=>o.name===name);assert.equal(list.length,1,name+' exists once');return list[0];};
  const base=bounds(one('Proposed altar stone base')),mensa=bounds(one('Proposed altar mensa'));
  near(base.getCenter(new T.Vector3()).x,44.24,'Altar stays on its drawn centre');
  assert(/marble/.test(one('Proposed altar stone base').material.name)&&!/lacquer/.test(one('Proposed altar stone base').material.name),'Altar base is pale marble, not lacquer');
  const columns=bounds(one('Altar red marble colonnette'));
  assert(columns.min.y>=base.min.y&&columns.max.y<=mensa.min.y,'Altar colonnettes stand under the mensa');
  assert(columns.min.x>=mensa.min.x-.001&&columns.max.x<=mensa.max.x+.001&&Math.abs(columns.min.z)<=Math.abs(mensa.min.z)+.001,'Altar colonnettes stay inside the mensa overhang');
  const lifted=nodes.filter(o=>o.name==='Proposed candle'&&o.userData.liftedBy);
  assert.equal(lifted.length,6,'Six altar candles stand on candlesticks');
  for(const o of lifted)assert(bounds(o).min.y>mensa.max.y+.2,'Altar candle stands on its stick');
  const fall=bounds(one('Ambo fall · green silk')),socket=bounds(one('Proposed ambo microphone socket')),mic=bounds(one('Illustrative ambo microphone'));
  assert(fall.max.x<socket.min.x&&fall.max.x<mic.min.x,'Ambo fall hangs clear in front of the microphone socket and microphone');
  assert(fall.min.y>bounds(one('Ambo cross stem')).max.y,'Ambo fall leaves the ambo cross visible');
  assert.equal(nodes.filter(o=>o.name==='Credence support').length,0,'Credence stone posts replaced by turned legs');
  const top=bounds(one('Proposed credence table top')),legs=bounds(one('Credence turned leg · red lacquer'));
  assert(legs.min.x>=top.min.x&&legs.max.x<=top.max.x&&legs.min.z>=top.min.z&&legs.max.z<=top.max.z,'Credence legs stay inside the table footprint');
  for(const name of ['Credence gilded chalice','Credence gilded ciborium','Credence glass cruet','Credence brass lavabo bowl']){
    const v=bounds(one(name));assert(v.min.y>=top.max.y&&v.min.z>=top.min.z&&v.max.z<=top.max.z,name+' stands on the credence');
  }
}
// Dais and side floors at the levels of the CAD file of 23 Oct 2026 (sections 25 and 45),
// with the free-standing furniture on the dais floor and the cross still on its niche base.
{
  const near=(a,b,t=.002)=>Math.abs(a-b)<=t;
  const platform=nodes.find(o=>o.name==='Sanctuary central platform +0.800');
  assert(platform&&near(bounds(platform).max.y,.8),'dais top at +0.80 m');
  const sides=nodes.filter(o=>o.name==='Sanctuary side platform +0.160');
  assert(sides.length===2&&sides.every(o=>near(bounds(o).max.y,.16)&&near(bounds(o).min.x,44.065)),'side floors at +0.16 m from the axis-10 piers');
  // Plan P05 and section A-A of the CAD file (owner check, 1 Nov 2026): a +0.16 low platform
  // round the dais and one flight 1.90 m wide recessed into the dais front; no full-width steps.
  assert(!nodes.some(o=>o.name.startsWith('Sanctuary step profile')),'old full-width steps removed');
  const pb=bounds(platform),low=nodes.find(o=>o.name==='Sanctuary low platform +0.160'),lb=low&&bounds(low);
  assert(near(pb.min.x,38.475)&&near(pb.max.x,48.65)&&near(pb.max.z,4.5)&&near(pb.min.z,-4.5),'dais outline x 38.475–48.65, z ±4.50');
  assert(lb&&near(lb.max.y,.16)&&near(lb.min.x,37.475)&&near(lb.max.x,44.065)&&near(lb.max.z,5.5)&&near(lb.min.z,-5.5),'low platform +0.16, x 37.475–44.065, z ±5.50');
  const flight=nodes.filter(o=>o.name.startsWith('Sanctuary recessed step')).map(bounds).sort((a,b)=>a.max.y-b.max.y);
  assert(flight.length===3&&flight.every((b,i)=>near(b.max.y,.32+.16*i)&&near(b.min.x,38.475+.29*i)&&near(b.max.x,39.345)&&near(b.max.z-b.min.z,1.9)),'three recessed steps, 1.90 m wide, 0.16 m risers, 0.29 m treads');
  const fy=(x,z)=>realism.floorHeight(x,z);
  for(const [x,z,y,what] of [[37.3,0,null,'nave in front of the platform (left to the nave rules)'],[37.6,4.9,.16,'low platform corner'],[37.6,5.3,0,'outside the rounded corner'],[38.6,0,.32,'first step'],[38.9,.9,.48,'second step'],[39.2,-.9,.64,'third step'],[39.4,0,.8,'head of the steps'],[38.6,2,.8,'dais front beside the steps'],[42,4.4,.8,'dais beside the axis-10 columns'],[42,5.2,.16,'low platform beside the dais'],[42,6.5,0,'wing crossing floor'],[46,6.5,.16,'side floor behind axis 10']])
    assert(y===null?fy(x,z)===null:fy(x,z)!==null&&near(fy(x,z),y),`${what}: floor ${fy(x,z)} at x ${x}, z ${z}, expected ${y}`);
  for(const foot of [amboFoot,altarFoot])assert(near(bounds(foot).min.y,.8),'furniture stands on the dais: '+foot.name);
  const plinths=nodes.filter(o=>o.name==='Carved stone column base on the dais');
  assert(plinths.length===2&&plinths.every(o=>near(bounds(o).min.y,.8)&&near(bounds(o).max.y,1)),'axis-10 plinths +0.80 to +1.00 m');
  const upright=nodes.find(o=>o.name==='Proposed sanctuary crucifix upright');
  assert(upright&&near(bounds(upright).min.y,3.4,.005),'the cross keeps its height on the niche base');
}
assert(!nodes.some(o=>o.name==='Statue plinth'),'Old low statue bases removed');
// Walking: the service entrances and the dais stay open, the lined walls are solid.
for(const sign of [-1,1]){
  // walkAllowed: false blocks, null leaves the decision to the base colliders.
  for(const x of [43.6,44.2,44.9,45.6,46.8,48.2,48.9,49.6,50.4])assert(realism.walkAllowed(x,sign*S.wingZ)!==false,`Side passage and service entrance route open at x ${x}`);
  assert.equal(realism.walkAllowed(S.wingX+.2,sign*(S.wingZ+1.05)),false,'Shrine jamb is solid');
  assert.equal(realism.walkAllowed(46.4,sign*3.5),false,'Chamber wall is solid');
  assert(realism.walkAllowed(46.4,sign*2.9)!==false&&realism.walkAllowed(46.4,sign*4.4)!==false,'Chamber and rear passage stay walkable');
}
// Service room: one open room across the back, without inner partitions, doors or the ochre alcoves.
assert(!nodes.some(o=>/^(Service room (side wall|door)|Statue alcove)/.test(o.name)),'Service room has no inner partition, small door or alcove walls');
assert(!nodes.some(o=>o.isMesh&&/ochre/i.test(o.material?.name||'')),'No ochre alcove plaster remains');
assert.equal(nodes.filter(o=>o.name==='Service room ceiling edge beam').length,2);
for(const sign of [-1,1]){
  for(const [x,z] of [[47.6,5.5],[49.6,5.5],[51.5,5.5],[50.5,3.6],[50.5,1.5]])assert(realism.walkAllowed(x,sign*z)!==false,`Service room route open at ${x}, ${sign*z}`);
  assert.equal(realism.walkAllowed(49.5,sign*7.3),false,'C/G wall bounds the service room');assert.notEqual(realism.walkAllowed(50.8,sign*7.3),false,'service-room doorway to the porch (7 Nov 2026)');
  assert.equal(realism.walkAllowed(52.9,sign*5.5),false,'Rear gable bounds the service room');
}
console.log('Sanctuary: sheet-5 frame, shrine line, chamber lining, lacquered roof timbers, door headroom, routes, open service room passed');

// Central facade between the towers, CAD file of 23 Oct 2026 (facade.js): the traced gables are gone
// above the cut, and the upper storey stands on the drawing's faces and levels.
{
  const F=sandbox.window.CHURCH_FACADE.spec;
  const upper=nodes.find(o=>o.name==='Tower-end upper facade — CAD file 23 Oct 2026');
  assert(upper&&upper.children.length>100,'CAD upper facade built');
  const lower=nodes.find(o=>o.name.startsWith('Tower-end central facade'));
  lower.traverse(o=>{if(o.isMesh)assert(bounds(o).min.y<F.cut,'no traced-gable part above the cut: '+o.name);});
  assert(!nodes.some(o=>/empty shrine with curved crown|Broad central shrine entablature|Detached central ornamental pier/.test(o.name)),'PDF gables and shrines removed');
  const of=name=>{const list=upper.children.filter(o=>o.name===name);assert(list.length,name);const b=new T.Box3();list.forEach(o=>b.union(bounds(o)));return b;};
  near(of('Upper storey terrace slab and plinth top').max.y,9.741,'Plinth top +9.741 (E01B)');
  near(of('Upper entablature crown').max.y,15.84,'Upper entablature +15.840 (E01B level)');
  near(of('Central bay upper wall').min.x,2.936,'Central bay face (plan +10.128)');
  near(of('Side bay upper wall').min.x,4.017,'Side bay face (plan +10.128)');
  near(of('Central aedicule wall').min.x,3.915,'Aedicule face (plan +15.840)');
  near(of('Side bay niche').max.y,12.308+.599,'Side niche crown: springing +12.308, r 0.599');
  near(of('Central aedicule niche').max.y,18.893+.711,'Central niche crown: springing +18.893, r 0.711');
  for(const name of ['Side bay niche','Central aedicule niche']){
    const hood=upper.children.find(o=>o.name===name&&o.material===mat.trim);
    assert(hood,'A cut-stone hood faces into '+name);
    const position=hood.geometry.attributes.position, normal=hood.geometry.attributes.normal;
    const rearX=bounds(hood).max.x;
    let rearFaces=0;
    for(let i=0;i<position.count;i++){
      if(position.getX(i)<rearX-.07)continue;
      assert(normal.getX(i)<-.25,'Niche rear faces the courtyard');
      rearFaces++;
    }
    assert(rearFaces>0,'The hollow includes a visible rear surface');
  }
  const carved=of('Facade carved leaf backs · E01B T12');
  const portalFace=bounds(building.getObjectByName('Source-width centre entry facade')).min.x;
  const outline=of('Facade arch spandrel leaf · E01B T12');
  assert(outline.max.x>=portalFace && outline.min.x>portalFace-.012,'Leaf contours meet the portal wall with shallow relief');
  assert(carved.min.x>portalFace-.010 && Math.abs(carved.max.x-portalFace)<.001,'Carved leaf edges sit flush with the assembled wall');
  near(of('Central bay great arch moulding').max.y,12.677+2.27,'Great arch extrados: centre +12.677, r 2.27');
  const cross=of('Central cross trefoil end').union(of('Central cross'));near(cross.max.y,24.648,'Cross top +24.648');
  const piers=of('Central bay pier shaft');near(piers.max.z,2.979+.435,'Central piers: 621 / 5,958.8 / 621 chain');near(piers.min.z,-2.979-.435,'Central piers symmetric');
  // Since 31 Oct 2026 the group also holds the CAD ground piers, whose plinth stands at X 1.292.
  const all=bounds(upper);assert(all.min.x>1.25&&all.max.x<5.6&&all.max.z<=7.5+1e-6&&all.min.z>=-7.5-1e-6,'upper facade stays between the towers, in front of axis 2′');
  let tris=0;upper.traverse(o=>{if(o.isMesh)tris+=o.geometry.index.count/3;});assert(tris<240000,'facade triangle budget: '+tris); // 150k until 2 Nov 2026; raised for the owner-requested traced T12 leaves and niche crests, then (2 Nov) the traced aedicule pier capitals and shared pinnacle crowns; 240k from 3 Nov 2026 for the traced rose, central pier capitals and the rebuilt E01B cresting (229k), leaving headroom for the shared crown and fleur geometry
  console.log(JSON.stringify({facade:'passed',meshes:upper.children.length,triangles:tris,removedBundleMeshes:upper.userData.removedBundleMeshes}));
}
