/* Browser-only pixel comparisons. Set PLAYWRIGHT_MODULE to an installed Playwright module path. */
const fs=require('node:fs');const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=require('node:path').resolve(__dirname,'..');
const output=process.env.THACHBI_GPU_REPORT || '/tmp/thachbi-gpu-lighting.json';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true,args:['--allow-file-access-from-files']});const page=await b.newPage({viewport:{width:400,height:300}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('file://'+root+'/Thach_Bi_Viewer/OPEN_CHURCH.html');await page.waitForFunction(()=>window.church?.ready,null,{timeout:120000});await page.evaluate(()=>church.pause());
const result=await page.evaluate(code=>{
 const T=CHURCH_SIMULATOR.THREE,P=CHURCH_SIM_PHYSICS;
 const scope={CHURCH_SIMULATOR:{},CHURCH_LIGHT_GRID:window.CHURCH_LIGHT_GRID};new Function('window',code)(scope);
 const persistent=scope.CHURCH_SIMULATOR.persistentLighting,renderer=new T.WebGLRenderer({antialias:false});renderer.setSize(65,65);renderer.toneMapping=T.NoToneMapping;renderer.debug.onShaderError=(gl,p,v,f)=>{throw Error(gl.getProgramInfoLog(p)+' '+gl.getShaderInfoLog(f));};
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(45,1,.1,200),target=new T.WebGLRenderTarget(65,65);target.texture.colorSpace=T.LinearSRGBColorSpace;
 persistent.prepare({THREE:T,scene,building:new T.Group(),renderer});
 const specs=[['plaster',{color:0xeed9b9,roughness:.85}],['lacquer',{color:0x6d331a,roughness:.35,clearcoat:1}],['gold',{color:0xdcb464,metalness:1,roughness:.4}],['sheen',{color:0x806040,roughness:.5,sheen:1,sheenColor:new T.Color(.7,.4,.2)}]];
 const mesh=new T.Mesh(new T.PlaneGeometry(4,4),new T.MeshStandardMaterial());scene.add(mesh);let maxError=0,pixels=0;const cases=[];
 for(const offset of [[0,0,0],[63.7,0,0],[-24,0,-31.8],[66,0,34]]){
  mesh.position.set(...offset);camera.position.set(offset[0],offset[1],offset[2]+6);camera.lookAt(mesh.position);
  const sources=[{id:'point',kind:'point',pos:[offset[0]+1,offset[1]+1,offset[2]+2.5],cd:200,color:[1,.7,.4]}];
  for(let i=0;i<50;i++){const pos=[offset[0]+(i%10-5)*2,offset[1]+Math.floor(i/10)-2,offset[2]+4];const dir=new T.Vector3(...offset).sub(new T.Vector3(...pos)).normalize().toArray();sources.push({id:'s'+i,kind:'spot',pos,dir,cd:50,color:[.6,.8,1],...P.spotCone(10+(i%5)*20)});}
  for(const [name,params] of specs){mesh.material.dispose();mesh.material=new T.MeshPhysicalMaterial(params);persistent.bindMaterial(mesh.material);
   for(const native of [false,true]){const lights=[];const detailed=new Set();if(native){const e=sources[0];const light=new T.PointLight(0xffffff,e.cd*.04,0,2);light.position.set(...e.pos);light.color.setRGB(...e.color);scene.add(light);lights.push(light);detailed.add(e);}
    persistent.update(sources,detailed,.04);const read=enabled=>{persistent.setGridEnabled(enabled);renderer.setRenderTarget(target);renderer.render(scene,camera);const data=new Uint8Array(65*65*4);renderer.readRenderTargetPixels(target,0,0,65,65,data);return data;};const ref=read(false),grid=read(true);let error=0;for(let i=0;i<ref.length;i++){error=Math.max(error,Math.abs(ref[i]-grid[i]));pixels++;}maxError=Math.max(maxError,error);if(error>1)throw Error('GPU grid mismatch '+name+' '+offset+': '+error);cases.push({offset,name,native,error});for(const l of lights){scene.remove(l);l.dispose();}
   }
  }
 }
 return {checks:'passed',cases,maxError,comparedChannels:pixels,grid:persistent.stats()};
},fs.readFileSync(root+'/Thach_Bi_Viewer/simulator/persistent-lighting.js','utf8'));
fs.writeFileSync(output,JSON.stringify({...result,errors},null,2));console.log(JSON.stringify({checks:result.checks,maxError:result.maxError,errors}));await b.close();if(errors.length)process.exitCode=1;})().catch(e=>{console.error(e);process.exit(1)});
