#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { performance } = require('node:perf_hooks');
const clone='/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web=path.join(clone,'web');
const evidence='/private/tmp/thachbi-web01-clean-evidence/corrected-home-run';
const logDir=path.join(evidence,'logs');
const envRoot='/private/tmp/thachbi-web01-clean-rerun-env';
const runtimeBin='/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
const safePath=`${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`;
const baseEnv={PATH:safePath,HOME:process.env.HOME,TMPDIR:path.join(envRoot,'tmp'),CI:'1',NEXT_TELEMETRY_DISABLED:'1'};
const steps=[
  { id:'npm-ci', command:'npm ci --cache=/private/tmp/thachbi-npm-cache --offline', args:['ci','--cache=/private/tmp/thachbi-npm-cache','--offline'], env:{} },
  { id:'lint', command:'npm run lint', args:['run','lint'], env:{} },
  { id:'typecheck', command:'npm run typecheck', args:['run','typecheck'], env:{} },
  { id:'unit-tests', command:'npm test', args:['test'], env:{} },
  { id:'production-build', command:'NEXT_TELEMETRY_DISABLED=1 npm run build', args:['run','build'], env:{NEXT_TELEMETRY_DISABLED:'1'} },
  { id:'boundary-scan', command:'npm run check:boundary', args:['run','check:boundary'], env:{} },
  { id:'headed-browser-tests', command:'PLAYWRIGHT_CHANNEL=chrome HEADED=1 npm run test:browser', args:['run','test:browser'], env:{PLAYWRIGHT_CHANNEL:'chrome',HEADED:'1'} },
];
fs.mkdirSync(logDir,{recursive:true});
const state={schemaVersion:1,startedAt:new Date().toISOString(),clone,workingDirectory:web,safeEnvironment:{PATH:safePath,HOME:'preserved unchanged from process.env.HOME; value omitted',TMPDIR:baseEnv.TMPDIR,CI:'1',NEXT_TELEMETRY_DISABLED:'1'},checks:steps.map((step)=>({id:step.id,command:step.command,log:`logs/${step.id}.log`,status:'pending',exitCode:null}))};
const statePath=path.join(evidence,'check-results.json');
const save=()=>fs.writeFileSync(statePath,JSON.stringify(state,null,2)+'\n');
save();
function hashFile(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function runStep(step,index){
  return new Promise((resolve)=>{
    const logPath=path.join(logDir,`${step.id}.log`);
    const fd=fs.createWriteStream(logPath,{flags:'wx'});
    fd.write(`Command: ${step.command}\nWorking directory: ${web}\nStart UTC: ${new Date().toISOString()}\n\n`);
    const started=performance.now();
    const env={...baseEnv,...step.env};
    const child=spawn('npm',step.args,{cwd:web,env,stdio:['ignore','pipe','pipe']});
    let spawnError=null;
    child.stdout.on('data',(chunk)=>fd.write(chunk));
    child.stderr.on('data',(chunk)=>fd.write(chunk));
    child.on('error',(error)=>{spawnError={name:error.name,message:error.message};fd.write(`\nSPAWN ERROR: ${error.message}\n`);});
    child.on('close',(code,signal)=>{
      fd.write(`\nEnd UTC: ${new Date().toISOString()}\nExit code: ${code===null?'null':code}\nSignal: ${signal||''}\n`);
      fd.end(()=>{
        const result=state.checks[index];
        result.status=code===0?'passed':code===null?'spawn-error':'failed';
        result.exitCode=code;
        result.signal=signal||null;
        result.spawnError=spawnError;
        result.runtimeMs=Math.round((performance.now()-started)*1000)/1000;
        result.logBytes=fs.statSync(logPath).size;
        result.logSha256=hashFile(logPath);
        state.updatedAt=new Date().toISOString();
        save();
        process.stdout.write(`${step.id}: exit=${code===null?'null':code} runtimeMs=${result.runtimeMs} log=${path.basename(logPath)}\n`);
        resolve(result);
      });
    });
  });
}
(async()=>{
  for(let index=0;index<steps.length;index++){
    const result=await runStep(steps[index],index);
    if(index===0&&result.exitCode!==0){
      for(let remaining=index+1;remaining<steps.length;remaining++) state.checks[remaining].status='not-run: npm ci failed';
      state.finishedAt=new Date().toISOString();
      save();
      process.exitCode=1;
      return;
    }
  }
  state.finishedAt=new Date().toISOString();
  state.allCommandExitCodesZero=state.checks.every((item)=>item.exitCode===0);
  save();
  process.stdout.write(`allCommandExitCodesZero=${state.allCommandExitCodesZero}\n`);
  if(!state.allCommandExitCodesZero)process.exitCode=1;
})().catch((error)=>{state.runnerError={name:error.name,message:error.message};state.finishedAt=new Date().toISOString();save();process.stderr.write(`${error.stack||error}\n`);process.exitCode=1;});
