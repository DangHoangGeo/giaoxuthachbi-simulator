/* Physical routing regressions, called from verify_simulator.cjs after SIM.start.
   These checks protect the concealment study; they do not approve containment,
   timber attachments, floorboxes, cable sizes or a construction installation. */
const assert = require('node:assert/strict');

module.exports = function verifyConcealedRoutes({ SIM, T, CAT, building }) {
  const E = SIM.electrical, eps = 1e-5, radius = 0.003;
  const near = (a, b) => Math.hypot(...a.map((v, k) => v - b[k])) < eps;
  const segments = points => points.slice(1).map((b, i) => [points[i], b]);
  const horizontal = (a, b) => Math.hypot(a[0] - b[0], a[2] - b[2]);
  const pointOnSegment = (p,a,b) => {
    const d=b.map((v,k)=>v-a[k]), length2=d.reduce((sum,v)=>sum+v*v,0);
    const t=length2?Math.max(0,Math.min(1,d.reduce((sum,v,k)=>sum+v*(p[k]-a[k]),0)/length2)):0;
    return Math.hypot(...p.map((v,k)=>v-a[k]-t*d[k]))<eps;
  };
  const sample = (a, b, visit) => {
    // A different spacing from the route generator, including both endpoints.
    const n = Math.max(1, Math.ceil(horizontal(a, b) / 0.037));
    for (let i = 0; i <= n; i++) visit(a.map((v, k) => v + (b[k] - v) * i / n));
  };
  // Exact segment clipping, rather than point sampling, catches narrow timber
  // cores and diagonal crossings. Expanded boxes include the cable envelope.
  const interval = (a, b, box, expansion = 0) => {
    let lo = 0, hi = 1;
    for (let k = 0; k < 3; k++) {
      const low = box.min[k] - expansion, high = box.max[k] + expansion, d = b[k] - a[k];
      if (Math.abs(d) < 1e-12) { if (a[k] < low || a[k] > high) return null; }
      else {
        const u = (low - a[k]) / d, v = (high - a[k]) / d;
        lo = Math.max(lo, Math.min(u, v)); hi = Math.min(hi, Math.max(u, v));
        if (lo > hi) return null;
      }
    }
    return [lo, hi];
  };
  const cores = [
    ...SIM.GEO.mainBeams.map((b, i) => ({ name: `main beam ${i}`, min: [b.x-b.w/2,b.y0,-b.zHalf], max: [b.x+b.w/2,b.y1,b.zHalf] })),
    ...SIM.GEO.sideBeams.map((b, i) => ({ name: `side beam ${i}`, min: [b.x-b.w/2,b.y0,Math.min(b.side*b.zIn,b.side*b.zOut)], max: [b.x+b.w/2,b.y1,Math.max(b.side*b.zIn,b.side*b.zOut)] })),
    ...SIM.GEO.longBeams.map(b => ({ name: b.id, min: [b.x0,b.y0,b.z-b.w/2], max: [b.x1,b.y1,b.z+b.w/2] }))
  ];
  assert(cores.length >= 35, 'main, side and longitudinal timber cores are included');
  building.updateMatrixWorld(true);
  const slabs = [], linings = [], capitals = [], roofs = [], rafters = [], roofLinings = [], cornices = [];
  const furniture = new Map();
  function worldTriangles(o) {
    const attr=o.geometry.attributes.position, index=o.geometry.index, triangles=[];
    for(let i=0;i<(index?index.count:attr.count);i+=3) triangles.push([0,1,2].map(k=>
      new T.Vector3().fromBufferAttribute(attr,index?index.getX(i+k):i+k).applyMatrix4(o.matrixWorld)));
    return triangles;
  }
  building.traverse(o => {
    if (!o.isMesh) return;
    if (o.name === 'Service room ceiling') slabs.push(new T.Box3().setFromObject(o));
    if (/^(Proposed ambo foot|Proposed ambo pedestal|Proposed sloped ambo desk|Proposed ambo service neck|Proposed ambo microphone socket)$/.test(o.name)) furniture.set(o.name,o);
    if(o.name==='Tower continuous cornice')cornices.push(new T.Box3().setFromObject(o));
    if(o.name==='Proposed timber lining under the source roof planes')roofLinings.push({box:new T.Box3().setFromObject(o),triangles:worldTriangles(o)});
    if(/^(Schematic rafter; no structural design|Proposed visible principal rafter below roof lining)$/.test(o.name)) {
      const box=new T.Box3().setFromObject(o);
      rafters.push({name:o.name,min:box.min.toArray(),max:box.max.toArray(),triangles:worldTriangles(o)});
    }
    if (o.name === 'Chamber side wall · lacquered timber') {
      const box=new T.Box3().setFromObject(o), v=o.userData.serviceVoid, sign=Math.sign(box.min.z+box.max.z);
      assert(o.userData.engineeringApproved===false && /^CONCEPT/.test(o.userData.status)
        && /pending/i.test(o.userData.source),'chamber lining remains a documented, unapproved construction proposal');
      assert(v && Object.values(v).every(Number.isFinite) && v.x0<v.x1 && v.y0<v.y1 && v.zInner<v.zOuter,
        'chamber shell declares a finite service void');
      const bounds={min:[v.x0,v.y0,sign<0?-v.zOuter:v.zInner],max:[v.x1,v.y1,sign<0?-v.zInner:v.zOuter]};
      assert(bounds.min.every((n,k)=>n>box.min.getComponent(k)) && bounds.max.every((n,k)=>n<box.max.getComponent(k)),
        'declared service void is inside the actual lining envelope');
      const triangles=worldTriangles(o), centre=new T.Vector3(...bounds.min.map((n,k)=>(n+bounds.max[k])/2));
      // Prove that the source geometry actually has the declared cavity, rather
      // than trusting metadata attached to a solid timber slab.
      for(let axis=0;axis<3;axis++) for(const direction of [-1,1]) {
        const d=new T.Vector3().setComponent(axis,direction), ray=new T.Ray(centre,d), hit=new T.Vector3();let distance=Infinity;
        for(const triangle of triangles)if(ray.intersectTriangle(...triangle,false,hit))distance=Math.min(distance,centre.distanceTo(hit));
        const expected=direction>0?bounds.max[axis]-centre.getComponent(axis):centre.getComponent(axis)-bounds.min[axis];
        assert(Math.abs(distance-expected)<eps,'actual chamber skins bound the declared service void');
      }
      linings.push({box,bounds});
    }
    if (/^(Continuous principal roof, valley clipped|Veranda roof (before|beyond) side projection|Planar side-gable roof meeting main valley)$/.test(o.name))
      roofs.push({box:new T.Box3().setFromObject(o),triangles:worldTriangles(o)});
    // Only the solid bell/abacus core; foliage envelopes would produce false
    // clashes in empty space between leaves. Retain the actual source triangles.
    if (o.name === 'Column carving · capital bell') {
      const box=new T.Box3().setFromObject(o);
      capitals.push({name:o.name, min:box.min.toArray(),max:box.max.toArray(),triangles:worldTriangles(o)});
    }
  });
  assert(slabs.length && linings.length === 2, 'actual service slab and both chamber linings found');
  assert(capitals.length>=12,'actual nave capital bell/abacus cores are tested');
  assert(roofs.length>=10,'actual main, veranda and wing roof source meshes are tested');
  assert(new Set(rafters.map(o=>o.name)).size===2 && roofLinings.length>=2,'both actual rafter families and roof lining are included');
  assert(furniture.size===5,'actual ambo foot, pedestal, desk, neck and socket are included');
  const ceilingTop = Math.max(...slabs.map(b => b.max.y));
  assert(Math.abs(ceilingTop - 4.27) < 0.002, 'service slab datum matches the current model');
  const original = JSON.stringify(SIM.state.items.map(it => [it.id,it.pos,it.anchorY]));
  const initialRoutes = JSON.stringify(E.routes.map(r => [r.id,r.points]));
  const summary = { concealedRouting: 'passed', routes: 0, microphoneHomeRuns: 0, beamFeeds: 0,
    roofFeeds: 0, coveredRoofSpans: 0, chamberFeeds: 0, chamberVoidSegments: 0, serviceCrossings: 0, openWingCrossings: 0, proposedCovers: 0,
    timberCores: cores.length, capitalCores: capitals.length, sourceRoofs: roofs.length,
    explicitLampEntries: 0, roofSamples: 0, rafterCores: rafters.length, mainRoofApproaches: 0,
    amboFurnitureConnections: 0, towerCapCrossings: 0, movedMicrophone: false, constructionApproved: false };

  function surfaceHeight(layers,p) {
    const ray=new T.Ray(new T.Vector3(p[0],100,p[2]),new T.Vector3(0,-1,0)), hit=new T.Vector3();let top=-Infinity;
    for(const layer of layers) {
      if(p[0]<layer.box.min.x-eps||p[0]>layer.box.max.x+eps||p[2]<layer.box.min.z-eps||p[2]>layer.box.max.z+eps)continue;
      for(const triangle of layer.triangles)if(ray.intersectTriangle(...triangle,false,hit))top=Math.max(top,hit.y);
    }
    return top;
  }

  function checkRoofPoint(r,p) {
    // Intersect the source geometry; do not duplicate the routing roof formula.
    const top=surfaceHeight(roofs,p);
    assert(Number.isFinite(top),`${r.id}: roof span has an actual source roof above ${p.join(',')}`);
    const gap=top-p[1];
    assert(gap>=-0.002 && gap<=0.25,`${r.id}: roof span gap ${gap.toFixed(4)} m stays near the actual source surface at ${p.join(',')}`);
    summary.roofSamples++;
  }

  function checkMicRoutes(runs) {
    const mics = SIM.state.items.filter(it => !it.hidden && CAT.byId[it.type].mic);
    assert(mics.length >= 2, 'both worship microphone feeds are tested');
    for (const it of mics) {
      const drop = runs.find(r => r.role === 'drop' && r.itemIds.includes(it.id));
      assert(drop && drop.method === 'underfloor-microphone', `${it.id}: microphone stays underfloor after editing`);
      assert(near(drop.points.at(-1), it.pos), `${it.id}: exact edited microphone endpoint`);
      const trunk = runs.find(r => r.id === drop.trunkId);
      assert(trunk && trunk.method === 'underfloor-microphone' && trunk.source === 'AV1', `${it.id}: separate AV rack home run`);
      let buried;
      if(drop.furnitureConnection==='ambo') {
        const fp=drop.furniturePoints;
        assert(Array.isArray(fp)&&fp.length>=4&&near(fp.at(-1),it.pos),'ambo furniture passage keeps the exact microphone endpoint');
        const entry=drop.points.findIndex(p=>near(p,fp[0]));
        assert(entry>=0 && JSON.stringify(drop.points.slice(entry))===JSON.stringify(fp),'furniture metadata describes the actual local route vertices');
        buried=segments(drop.points.slice(0,entry+1));
        const desk=furniture.get('Proposed sloped ambo desk');
        const inside=(o,p)=>{
          o.geometry.computeBoundingBox();
          return o.geometry.boundingBox.clone().expandByScalar(eps).containsPoint(o.worldToLocal(new T.Vector3(...p)));
        };
        for(const name of ['Proposed ambo service neck','Proposed ambo microphone socket']) {
          const o=furniture.get(name);
          assert(o.userData.engineeringApproved===false && /^CONCEPT/.test(o.userData.status)
            && o.userData.serviceBoreRadius>radius,'ambo hollow fittings remain unapproved proposals with usable service bores');
          const box=new T.Box3().setFromObject(o), centre=new T.Vector3(o.position.x,(box.min.y+box.max.y)/2,o.position.z),triangles=worldTriangles(o);
          for(const d of [[1,0,0],[-1,0,0],[0,0,1],[0,0,-1]]) {
            const ray=new T.Ray(centre,new T.Vector3(...d)),hit=new T.Vector3();let distance=Infinity;
            for(const triangle of triangles)if(ray.intersectTriangle(...triangle,false,hit))distance=Math.min(distance,centre.distanceTo(hit));
            assert(Math.abs(distance-o.userData.serviceBoreRadius)<eps,`${name}: actual source geometry has the declared open service bore`);
          }
        }
        for(const [a,b] of segments(fp)) {
          const changing=a.filter((v,k)=>Math.abs(v-b[k])>eps).length;
          if(changing>1)assert(inside(desk,a)&&inside(desk,b)&&Math.hypot(...a.map((v,k)=>v-b[k]))<.4,
            'a short diagonal is allowed only inside the actual rotated ambo desk');
          const n=Math.max(1,Math.ceil(Math.hypot(...a.map((v,k)=>v-b[k]))/.017));
          for(let i=0;i<=n;i++) {
            const p=a.map((v,k)=>v+(b[k]-v)*i/n);
            if(p[1]<=SIM.floorY(p[0],p[2]))continue;
            const enclosed=[...furniture].some(([name,o])=>{
              if(!inside(o,p))return false;
              if(/neck|socket/.test(name))return Math.hypot(p[0]-o.position.x,p[2]-o.position.z)+radius
                <o.userData.serviceBoreRadius*Math.cos(Math.PI/16);
              return true;
            });
            assert(enclosed,`${it.id}: local microphone cable is inside actual furniture/bore at ${p.join(',')}`);
          }
        }
        summary.amboFurnitureConnections++;
      } else {
        assert(!drop.furnitureConnection&&!drop.furniturePoints,'a microphone away from the socket has no furniture concealment claim');
        const last=drop.points.at(-2);
        assert(Math.abs(last[0]-it.pos[0])<eps&&Math.abs(last[2]-it.pos[2])<eps,`${it.id}: generic final ascent remains vertical at the microphone`);
        assert(last[1]+radius<SIM.floorY(it.pos[0],it.pos[2]),`${it.id}: ascent starts beneath finished floor`);
        buried=segments(drop.points).slice(0,-1);
      }
      for (const [a,b] of [...segments(trunk.points).slice(1), ...buried]) {
        assert(a.filter((v,k) => Math.abs(v-b[k]) > eps).length <= 1, `${it.id}: no diagonal microphone shortcut`);
        sample(a,b,p => assert(p[1]+radius < SIM.floorY(p[0],p[2]),
          `${it.id}: no exposed tabletop-height crossing at ${p.join(',')}`));
      }
    }
    return mics.length;
  }

  function checkDefault() {
    const runs = E.routes;
    const exported=E.exportData();
    assert(/not installation documentation/.test(exported.status),'routing export remains a proposed study');
    assert.equal(exported.routes.length,runs.length,'every live route appears in the electrical export');
    for(const r of runs) {
      const copy=exported.routes.find(c=>c.id===r.id);
      assert(copy && JSON.stringify([copy.points,copy.method,copy.coverPaths,copy.coordinationStatus,copy.termination,copy.furnitureConnection,copy.furniturePoints])
        ===JSON.stringify([r.points,r.method,r.coverPaths,r.coordinationStatus,r.termination,r.furnitureConnection,r.furniturePoints]), `${r.id}: export retains concealment geometry and status`);
      assert.equal(copy.buildingDrawnDiameter,2*radius,`${r.id}: small display diameter exports separately from cable sizing`);
    }
    summary.routes = runs.length;
    summary.microphoneHomeRuns = checkMicRoutes(runs);
    for (const r of runs) {
      assert(/CONCEPT|REVIEW REQUIRED/.test(r.coordinationStatus), `${r.id}: engineering status stays explicit`);
      const it = ['drop','local'].includes(r.role) ? SIM.item(r.itemIds[0]) : null;
      if (it) {
        if(r.termination) {
          const end=r.termination.position, head=SIM.fixtures.get(it.id)?.head;
          assert(Array.isArray(end)&&end.length===3&&end.every(Number.isFinite)&&near(r.points.at(-1),end),
            `${r.id}: cable ends at its explicitly exported physical entry`);
          assert(head && Math.hypot(...end.map((v,k)=>v-it.pos[k]))<.3,`${r.id}: entry remains local to the existing lamp head`);
          head.updateWorldMatrix(true,true);
          const point=new T.Vector3(...end), parts=[];
          head.traverse(o=>{if(o.isMesh&&o.geometry?.attributes?.position)parts.push(new T.Box3().setFromObject(o));});
          assert(parts.some(box=>box.expandByScalar(eps).containsPoint(point)),`${r.id}: physical entry is inside an actual head mesh envelope`);
          assert(r.reviewRequired===true && /^REVIEW REQUIRED/.test(r.coordinationStatus)
            && /mounting.*hold/i.test(r.installation) && /pending/i.test(r.termination.basis),
          `${r.id}: lamp-body entry retains the existing mounting hold and pending connector specification`);
          summary.explicitLampEntries++;
        } else assert(near(r.points.at(-1),it.pos), `${r.id}: route does not move its fixture or termination`);
      }
      if (/^above-(main|side)-beam$/.test(r.method)) summary.beamFeeds++;
      if(r.method==='above-main-beam') {
        let approaches=0;
        for(const [i,[a,b]] of segments(r.points).entries()) {
          for(const core of rafters) {
            if(!interval(a,b,core,radius))continue;
            const start=new T.Vector3(...a), delta=new T.Vector3(...b).sub(start), distance=delta.length(), direction=delta.divideScalar(distance);
            for(const shift of [[0,0,0],[radius,0,0],[-radius,0,0],[0,radius,0],[0,-radius,0],[0,0,radius],[0,0,-radius]]) {
              const origin=start.clone().add(new T.Vector3(...shift)), ray=new T.Ray(origin,direction),hit=new T.Vector3();
              for(const triangle of core.triangles)if(ray.intersectTriangle(...triangle,false,hit))assert(origin.distanceTo(hit)>distance+eps,
                `${r.id}: segment ${i} enters actual ${core.name} core`);
            }
          }
          if(horizontal(a,b)>.1&&Math.abs(a[1]-b[1])>eps&&Math.min(a[1],b[1])>6.8) {
            sample(a,b,p=>{
              checkRoofPoint(r,p);
              const lining=surfaceHeight(roofLinings,p);
              if(Number.isFinite(lining))assert(p[1]-radius>lining,`${r.id}: roof approach stays above the actual nave lining`);
            });approaches++;
          }
        }
        assert(approaches>0,`${r.id}: main-beam feed includes a source-roof approach`);summary.mainRoofApproaches++;
      }
      if(it&&r.method==='tower-cornice'&&it.pos[1]>29.09) {
        assert(r.reviewRequired===true&&/^REVIEW REQUIRED/.test(r.coordinationStatus)&&/cornice.*unresolved/i.test(r.installation),
          `${r.id}: tower cap service space retains its engineering hold`);
        const top=cornices.filter(c=>c.max.y>29&&c.max.y<29.2&&Math.sign(c.min.z+c.max.z)===Math.sign(it.pos[2]));
        assert(top.length,'actual top tower cornice is available for the cap routing check');
        let crossings=0;
        for(const [a,b] of segments(r.points))if(horizontal(a,b)>.5&&Math.min(a[1],b[1])>28.5) {
          assert(Math.abs(a[1]-b[1])<eps&&top.some(c=>a[1]-radius>c.min.y&&a[1]+radius<c.max.y),
            `${r.id}: long cap span stays behind actual top cornice height, not exposed at +29.26`);crossings++;
        }
        assert(crossings>0,`${r.id}: dome wash cap crossing is exercised`);summary.towerCapCrossings+=crossings;
      }
      for (const [i,[a,b]] of segments(r.points).entries()) for (const core of cores) {
        const hit = interval(a,b,core,radius-eps);
        if (!hit) continue;
        // A top-mounted uplight may touch its support face at its terminal
        // point. No other penetration or travel along the core is excused.
        const terminal = it && i === r.points.length-2 && near(b,it.pos);
        const topContact = terminal && Math.abs(b[1]-core.max[1]) < eps && a[1] > b[1]
          && Math.abs(a[0]-b[0]) < eps && Math.abs(a[2]-b[2]) < eps
          && hit[0] >= 1-(radius+eps)/Math.abs(a[1]-b[1]);
        assert(topContact, `${r.id}: segment ${i} intersects ${core.name} (including 3 mm cable envelope)`);
      }
      for(const [i,[a,b]] of segments(r.points).entries()) for(const capital of capitals) {
        if(!interval(a,b,capital,radius))continue;
        const start=new T.Vector3(...a), direction=new T.Vector3(...b).sub(start), distance=direction.length();
        const ray=new T.Ray(start,direction.divideScalar(distance)), hit=new T.Vector3();
        for(const triangle of capital.triangles) if(ray.intersectTriangle(...triangle,false,hit)) {
          assert(start.distanceTo(hit)>distance+eps,
            `${r.id}: segment ${i} crosses actual solid capital/abacus triangles near ${hit.toArray().join(',')}`);
        }
      }
      if (r.method === 'service-ceiling' || r.role === 'trunk' || r.id === 'feeder:DB2') {
        for (const [a,b] of segments(r.points)) if (horizontal(a,b)>eps && Math.abs(a[1]-b[1])<eps
          && Math.max(a[0],b[0])>48.795 && Math.min(a[0],b[0])<53.001
          && Math.max(Math.abs(a[2]),Math.abs(b[2]))<=3.7+eps && a[1]>3.9) {
          assert(a[1]-radius > ceilingTop, `${r.id}: service crossing clears the actual slab, not the +4.02 edge-beam band`);
          summary.serviceCrossings++;
        }
      }
      if (r.role === 'trunk' || r.id === 'feeder:DB2') for (const [a,b] of segments(r.points)) {
        if (Math.abs(Math.abs(a[2])-7.36)>eps || Math.abs(a[2]-b[2])>eps) continue;
        const low=Math.max(37.22,Math.min(a[0],b[0])), high=Math.min(43.9,Math.max(a[0],b[0]));
        if (high-low<=eps) continue;
        assert(Math.min(a[1],b[1])>6.8, `${r.id}: no wall-band span over the missing C/G wing wall`);
        sample(a,b,p=>checkRoofPoint(r,p));
        summary.openWingCrossings++;
      }
      if (['roof-pendant','outer-wall','roof-local'].includes(r.method)) {
        summary.roofFeeds++;
        if (r.method === 'roof-pendant') {
          const a=r.points.at(-2), p=it.pos;
          assert(Math.abs(a[0]-p[0])<eps && Math.abs(a[2]-p[2])<eps,
            `${r.id}: final pendant connection stays inside its local vertical stem`);
        }
        for (const [i,[a,b]] of segments(r.points).entries()) if (horizontal(a,b)>.3) {
          if(r.method==='outer-wall' && i===r.points.length-2) {
            assert(horizontal(a,b)<.5,`${r.id}: final outer-wall lead remains local to the fixture`);
            continue;
          }
          sample(a,b,p=>checkRoofPoint(r,p));
          if(Math.max(Math.abs(a[2]),Math.abs(b[2]))<=7.4)continue;
          const covered=r.coverPaths.flatMap(c=>segments(c.points));
          sample(a,b,p=>assert(covered.some(([u,v])=>pointOnSegment(p,u,v)),
            `${r.id}: unlined roof span needs a continuous proposed cover, including its start`));
          summary.coveredRoofSpans++;
        }
      }
      if (r.method === 'chamber-lining' && CAT.byId[it.type].light) {
        const wall=linings.find(w=>Math.sign(w.box.min.z+w.box.max.z)===Math.sign(it.pos[2])), bounds=wall.bounds;
        const p=r.points.at(-2);
        assert(p.every((n,k)=>n-radius>bounds.min[k] && n+radius<bounds.max[k]),
          `${r.id}: concealed termination lead lies inside the actual chamber service void`);
        for (const [a,b] of segments(r.points).slice(0,-1)) {
          // The back-wall/end-panel entry and final fitting connection are
          // pending penetrations. Inside the enclosure, the entire horizontal
          // and vertical cable envelope must occupy the void between skins.
          const portion=interval(a,b,{min:[bounds.min[0]+radius,-100,-100],max:[bounds.max[0]-radius,100,100]});
          if(!portion)continue;
          for(const t of portion) {
            const point=a.map((v,k)=>v+(b[k]-v)*t);
            assert([1,2].every(k=>point[k]-radius>bounds.min[k] && point[k]+radius<bounds.max[k]),
              `${r.id}: chamber traversal is inside its service void, clear of the timber skins`);
          }
          summary.chamberVoidSegments++;
        }
        summary.chamberFeeds++;
      }
      assert(Array.isArray(r.coverPaths), `${r.id}: removable cover proposals export explicitly`);
      for (const c of r.coverPaths) {
        assert(['timber','soffit'].includes(c.finish) && /^CONCEPT/.test(c.status)
          && c.points.length>=2 && c.points.every(p=>p.length===3&&p.every(Number.isFinite)), `${r.id}: cover remains a finite, unapproved proposal`);
      }
    }
    for (const key of ['beamFeeds','roofFeeds','roofSamples','coveredRoofSpans','chamberFeeds','chamberVoidSegments','serviceCrossings','openWingCrossings','explicitLampEntries','amboFurnitureConnections','mainRoofApproaches','towerCapCrossings'])
      assert(summary[key]>0, `${key}: regression exercised actual default routes`);
    const meshes=[];
    E.layer.traverse(o=>{if(o.isMesh&&o.userData.routeShape)meshes.push(o);if(o.userData.routeCover){
      assert(o.userData.engineeringApproved===false && /^CONCEPT/.test(o.userData.status), 'rendered covers cannot imply engineering approval');
      assert(o.userData.routeIds.length>0,'each proposed cover identifies its owning routes');summary.proposedCovers++;
    }});
    assert(summary.proposedCovers>0,'concealment includes modeled removable covers, not visibility alone');
    assert.equal(meshes.length,runs.length,'every exported run has a building-mode cable mesh');
    // Inspect actual GPU vertices, independent of pipeGeometry's implementation.
    for (const mesh of meshes) {
      const r=runs.find(r=>r.id===mesh.userData.electricalId), p=mesh.geometry.attributes.position, v=new T.Vector3();
      const lines=segments(r.points).map(([a,b])=>new T.Line3(new T.Vector3(...a),new T.Vector3(...b)));
      let maximum=0;
      for(let i=0;i<p.count;i++) {
        v.fromBufferAttribute(p,i);
        maximum=Math.max(maximum,Math.min(...lines.map(line=>line.closestPointToPoint(v,true,new T.Vector3()).distanceTo(v))));
      }
      assert(maximum<=radius+eps && maximum>=radius-eps, `${r.id}: actual building cable radius is 3 mm, not the exaggerated systems display`);
    }
  }

  const mode=E.view.mode;
  let moved=null, saved=null;
  try {
    if(mode!=='building') E.setMode('building');
    checkDefault();
    moved=SIM.state.items.find(it=>!it.hidden&&CAT.byId[it.type].mic);
    saved={pos:moved.pos.slice(),anchorY:moved.anchorY};
    // Off the modeled ambo/table, above 1.6 m, and across the sanctuary steps
    // into the nave: height must never switch a microphone to an aerial feed.
    SIM.update(moved.id,{pos:[22.5,2.25,-2.25]},{record:false}); E.rebuild();
    assert(near(SIM.item(moved.id).pos,[22.5,2.25,-2.25]),'routing preserves the arbitrary microphone edit');
    checkMicRoutes(E.routes);
    summary.movedMicrophone=true;
    // A small edit can leave the socket bore even though it remains on the
    // ambo. Do not claim that such an edited cable still uses the fixed bore.
    SIM.update(moved.id,{pos:[saved.pos[0]+.02,saved.pos[1],saved.pos[2]]},{record:false}); E.rebuild();
    assert(!E.routes.find(r=>r.role==='drop'&&r.itemIds.includes(moved.id)).furnitureConnection,
      'a microphone outside the socket bore loses the fixed furniture-passage claim');
    checkMicRoutes(E.routes);
  } finally {
    if(moved&&saved) {SIM.update(moved.id,saved,{record:false});E.rebuild();}
    if(mode!=='building') E.setMode(mode);
  }
  assert.equal(JSON.stringify(SIM.state.items.map(it=>[it.id,it.pos,it.anchorY])),original,
    'routing and microphone regression preserve every fixture position and mounting anchor');
  assert.equal(JSON.stringify(E.routes.map(r=>[r.id,r.points])),initialRoutes,
    'microphone restoration recovers the exact default route identities and vertices');
  console.log(JSON.stringify(summary));
  return summary;
};
