#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawn}=require('node:child_process');
const {performance}=require('node:perf_hooks');
const clone='/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web=path.join(clone,'web');
const evidence='/private/tmp/thachbi-web01-clean-evidence/corrected-home-run';
const logDir=path.join(evidence,'logs');
const tmp='/private/tmp/thachbi-web01-clean-rerun-env/tmp';
const runtimeBin='/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
const safePath=`${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`;
if(!process.env.HOME) throw new Error('HOME is absent; refusing to replace or synthesize it');
const baseEnv={PATH:safePath,HOME:process.env.HOME,TMPDIR:tmp,CI:'1',NEXT_TELEMETRY_DISABLED:'1'};
const steps={
  'npm-ci':{command:'npm ci --cache=/private/tmp/thachbi-npm-cache --offline',args:['ci','--cache=/private/tmp/thachbi-npm-cache','--offline'],env:{}},
  'lint':{command:'npm run lint',args:['run','lint'],env:{}},
  'typecheck':{command:'npm run typecheck',args:['run','typecheck'],env:{}},
  'unit-tests':{command:'npm test',args:['test'],env:{}},
  'production-build':{command:'NEXT_TELEMETRY_DISABLED=1 npm run build',args:['run','build'],env:{NEXT_TELEMETRY_DISABLED:'1'}},
  'boundary-scan':{command:'npm run check:boundary',args:['run','check:boundary'],env:{}},
  'headed-browser-tests':{command:'PLAYWRIGHT_CHANNEL=chrome HEADED=1 npm run test:browser',args:['run','test:browser'],env:{PLAYWRIGHT_CHANNEL:'chrome',HEADED:'1'}},
};
const id=process.argv[2];
if(!steps[id]) throw new Error(`Unknown check id: ${id}`);
const step=steps[id];
const resultsPath=path.join(evidence,'check-results.json');
let results=fs.existsSync(resultsPath)?JSON.parse(fs.readFileSync(resultsPath,'utf8')):{schemaVersion:1,startedAt:new Date().toISOString(),clone,workingDirectory:web,safeEnvironment:{PATH:safePath,HOME:'preserved unchanged from process.env.HOME; value omitted',TMPDIR:tmp,CI:'1',NEXT_TELEMETRY_DISABLED:'1'},checks:[]};
if(results.checks.some((item)=>item.id===id)) throw new Error(`Check already recorded; refusing overwrite: ${id}`);
fs.mkdirSync(logDir,{recursive:true});
const logPath=path.join(logDir,`${id}.log`);
const fd=fs.createWriteStream(logPath,{flags:'wx'});
fd.write(`Command: ${step.command}\nWorking directory: ${web}\nStart UTC: ${new Date().toISOString()}\n\n`);
const start=performance.now();
const child=spawn('npm',step.args,{cwd:web,env:{...baseEnv,...step.env},stdio:['ignore','pipe','pipe']});
let spawnError=null;
child.stdout.on('data',(chunk)=>fd.write(chunk));child.stderr.on('data',(chunk)=>fd.write(chunk));
child.on('error',(error)=>{spawnError={name:error.name,message:error.message};fd.write(`\nSPAWN ERROR: ${error.message}\n`);});
child.on('close',(code,signal)=>{
  fd.write(`\nEnd UTC: ${new Date().toISOString()}\nExit code: ${code===null?'null':code}\nSignal: ${signal||''}\n`);
  fd.end(()=>{
    const item={id,command:step.command,log:`logs/${id}.log`,status:code===0?'passed':code===null?'spawn-error':'failed',exitCode:code,signal:signal||null,spawnError,runtimeMs:Math.round((performance.now()-start)*1000)/1000,logBytes:fs.statSync(logPath).size,logSha256:crypto.createHash('sha256').update(fs.readFileSync(logPath)).digest('hex')};
    results.checks.push(item);results.updatedAt=new Date().toISOString();
    fs.writeFileSync(resultsPath,JSON.stringify(results,null,2)+'\n');
    process.stdout.write(JSON.stringify({id,status:item.status,exitCode:item.exitCode,runtimeMs:item.runtimeMs,log:item.log,logSha256:item.logSha256},null,2)+'\n');
    if(code!==0)process.exitCode=1;
  });
});
