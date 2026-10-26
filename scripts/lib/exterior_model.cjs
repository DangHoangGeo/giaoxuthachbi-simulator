/* Architecture-only adapter for source-coordinate exterior verification.
 * Runs the real builders, with browser/GPU services stubbed as in verify_model.
 * It never reads/writes a saved engineering layout or starts the simulator. */
'use strict';
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
function loadExteriorModel({baselineDir} = {}) {
  const gradient = {addColorStop(){}};
  const ctx = new Proxy({getImageData(){return {data:new Uint8ClampedArray(512*512*4)}},createLinearGradient(){return gradient},createRadialGradient(){return gradient},measureText(){return {width:120}}},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
  const document = {getElementById(){return null},createElement(){return {width:512,height:512,getContext(){return ctx}}}};
  const sandbox = {console,document,location:{search:''},URLSearchParams,Uint8ClampedArray,window:{}};
  vm.createContext(sandbox);
  const files=['texture-memory.js','render-batches.js','references.js','glass-art.js','carving.js','decoration.js','sanctuary.js','facade.js','porches.js','stations.js','towers.js','roofline.js','realism.js','planning.js'];
  for (const file of files) {
    const candidate=baselineDir&&path.join(baselineDir,file);
    const source=candidate&&fs.existsSync(candidate)?candidate:path.join(root,'Thach_Bi_Viewer',file);
    vm.runInContext(fs.readFileSync(source,'utf8'),sandbox,{filename:file});
  }
  let source=fs.readFileSync(path.join(root,'Thach_Bi_Viewer/bundle.js'),'utf8');
  const begin=source.indexOf('    Us = document.getElementById("viewport"),');
  const end=source.indexOf('  var ce = {};',begin);
  assert(begin>0&&end>begin,'Renderer adapter anchors changed');
  source=source.slice(0,begin)+`    ni={capabilities:{getMaxAnisotropy:()=>8},shadowMap:{},toneMappingExposure:1};
    var ii=new Ti(),xn=new Cs(),Fp=new Cs(),X0=new xr();ii.background=new De('#d9e4e9');ii.add(xn,Fp,X0);
  `+source.slice(end);
  const ui=source.lastIndexOf('  z0({');
  assert(ui>0,'UI adapter anchor changed');
  source=source.slice(0,ui)+'window.model={THREE:Ec,building:nn,scene:ii,plinth:Ui,exterior:Os,roofs:ei,mat:ce,data:ti,batches:t_,interior:Qo};\n})();';
  vm.runInContext(source,sandbox,{timeout:120000,filename:'bundle.js'});
  sandbox.window.model.building.updateMatrixWorld(true);
  return {model:sandbox.window.model,api:sandbox.window};
}
module.exports={loadExteriorModel,root};
