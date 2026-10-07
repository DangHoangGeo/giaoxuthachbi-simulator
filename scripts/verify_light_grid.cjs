/* Independent geometric coverage cases: no contributing source may disappear. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const sandbox = { window: {} }; vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../Thach_Bi_Viewer/simulator/light-grid.js'), 'utf8'), sandbox);
const grid = sandbox.window.CHURCH_LIGHT_GRID;
let seed = 812736;
const rand = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const sources = [{kind:'point',pos:[500,500,500]}];
for(let i=0;i<45;i++){
  const dir = [rand()-.5,rand()-.5,rand()-.5],len=Math.hypot(...dir);
  sources.push({kind:'spot',pos:[rand()*120-40,rand()*60-10,rand()*100-50],dir:dir.map(v=>v/len),cosOuter:Math.cos((2+rand()*86)*Math.PI/180)});
}
// Apex, narrow cone, near-hemispherical beam and exactly tangent configurations.
sources.push({kind:'spot',pos:[0,0,0],dir:[1,0,0],cosOuter:Math.cos(Math.PI/4)});
sources.push({kind:'spot',pos:[-24,-4,-32],dir:[0,1,0],cosOuter:Math.cos(89*Math.PI/180)});
const table=grid.build(sources,64),stride=table.width*4;
let checks=0;
for(let cell=0;cell<grid.cells;cell++){
  const x=cell%grid.dimensions[0],y=Math.floor(cell/grid.dimensions[0])%grid.dimensions[1],z=Math.floor(cell/(grid.dimensions[0]*grid.dimensions[1]));
  const n=table.data[cell*stride],indices=Array.from(table.data.slice(cell*stride+1,cell*stride+1+n));
  assert(indices.includes(0),'all point sources retain infinite reach');
  for(let sample=0;sample<10;sample++){
    const p=[x,y,z].map((v,k)=>grid.min[k]+(v+(sample<8?((sample>>k)&1)*.999999:rand()))*grid.step);
    assert.equal(grid.cellAt(p),cell);
    for(let i=1;i<sources.length;i++){
      const s=sources[i],delta=p.map((v,k)=>v-Math.fround(s.pos[k])),len=Math.hypot(...delta);
      const alignment=delta.reduce((a,v,k)=>a+v*Math.fround(s.dir[k]),0)/(len||1);
      if(alignment>Math.fround(s.cosOuter))assert(indices.includes(i),'contributing spot excluded');
      checks++;
    }
  }
}
assert.equal(grid.cellAt([-24.0001,0,0]),-1);
assert.equal(grid.cellAt([64,0,0]),-1);
assert.equal(grid.cellAt([0,40,0]),-1);
assert.equal(grid.cellAt([0,0,32]),-1);
assert(grid.intersects({kind:'spot',pos:[0,0,0],dir:[1,0,0],cosOuter:.5},[0,0,0]),'apex included');
assert(!grid.intersects({kind:'spot',pos:[0,0,0],dir:[1,0,0],cosOuter:.5},[-10,0,0]),'behind cone excluded');
console.log(JSON.stringify({checks:'passed',coverageCases:checks,cells:grid.cells,sources:sources.length,averageCandidates:table.average,maxCandidates:table.max}));

const tangent={kind:'spot',pos:[0,0,0],dir:[1,0,0],cosOuter:Math.SQRT1_2};
const radius=Math.sqrt(3)*2;
assert(grid.intersects(tangent,[10,10+radius*Math.SQRT2,0]),'tangent sphere retained');
assert(!grid.intersects(tangent,[10,10+(radius+.1)*Math.SQRT2,0]),'separated sphere excluded');
