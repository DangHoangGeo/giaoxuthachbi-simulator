#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const clone='/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web=path.join(clone,'web');
const evidence='/private/tmp/thachbi-web01-clean-evidence/corrected-home-run';
const logDir=path.join(evidence,'logs');
const runtimeBin='/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
const env={PATH:`${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`,HOME:process.env.HOME,TMPDIR:'/private/tmp/thachbi-web01-clean-rerun-env/tmp',CI:'1',NEXT_TELEMETRY_DISABLED:'1'};
if(!process.env.HOME)throw new Error('HOME is absent; refusing to replace or synthesize it');
const resultPath=path.join(evidence,'canary-probe.json');
if(fs.existsSync(resultPath))throw new Error('Refusing to overwrite canary-probe.json');
const fixture=JSON.parse(fs.readFileSync(path.join(web,'tests/fixtures/private-canary.json'),'utf8'));
const marker=fixture.privateCanary;
const directory=path.join(web,'.next/static');
const file=path.join(directory,`synthetic-private-canary-probe-${crypto.randomUUID()}.txt`);
if(!fs.existsSync(directory))throw new Error('Built .next/static directory is missing');
if(fs.existsSync(file))throw new Error('Generated canary path unexpectedly exists');
const runScanner=(name)=>{
 const child=spawnSync('npm',['run','check:boundary'],{cwd:web,env,encoding:'utf8',maxBuffer:32*1024*1024});
 const output=(child.stdout||'')+(child.stderr||'');
 const logPath=path.join(logDir,`${name}.log`);
 fs.writeFileSync(logPath,`Command: npm run check:boundary\nWorking directory: ${web}\nExit code: ${child.status}\n\n${output}`,{flag:'wx'});
 return {exitCode:child.status,signal:child.signal||null,spawnError:child.error?.message||null,log:`logs/${name}.log`,logBytes:fs.statSync(logPath).size,logSha256:crypto.createHash('sha256').update(fs.readFileSync(logPath)).digest('hex'),output};
};
let detection=null, clean=null, cleanup={path:path.relative(clone,file).split(path.sep).join('/'),before:'absent',inserted:false,removed:false,afterExists:null,insertedBytes:null,insertedSha256:null};
let failure=null;
try {
 const bytes=Buffer.from(`${marker}\n`,'utf8');
 fs.writeFileSync(file,bytes,{flag:'wx'});
 cleanup.inserted=true;cleanup.insertedBytes=bytes.length;cleanup.insertedSha256=crypto.createHash('sha256').update(bytes).digest('hex');
 detection=runScanner('canary-detected');
} catch(error) { failure={name:error.name,message:error.message}; }
finally {
 if(cleanup.inserted && fs.existsSync(file)) { fs.unlinkSync(file);cleanup.removed=true; }
 cleanup.afterExists=fs.existsSync(file);
 clean=runScanner('canary-clean');
}
const requiredRelative=cleanup.path;
const detectionFoundMarker=Boolean(detection?.output.includes('synthetic-private-canary:'));
const detectionNamedInsertedFile=Boolean(detection?.output.includes(requiredRelative));
const data={schemaVersion:1,capturedAt:new Date().toISOString(),test:'inject only one synthetic canary file in .next/static; scanner must name the marker; remove injected file; clean scanner must pass',markerLabel:'synthetic-private-canary',markerValueRecorded:false,changedPath:cleanup,detectedScan:detection?{exitCode:detection.exitCode,signal:detection.signal,spawnError:detection.spawnError,log:detection.log,logBytes:detection.logBytes,logSha256:detection.logSha256,containsRequiredMarkerLabel:detectionFoundMarker,containsInjectedRelativePath:detectionNamedInsertedFile}:null,cleanScan:clean?{exitCode:clean.exitCode,signal:clean.signal,spawnError:clean.spawnError,log:clean.log,logBytes:clean.logBytes,logSha256:clean.logSha256}:null,cleanupFailure:failure,assertions:{detectedNonzero:detection?.exitCode!==0&&detection?.exitCode!==null,detectedNamesMarker:detectionFoundMarker,detectedNamesFile:detectionNamedInsertedFile,removedOnlyInjectedFile:cleanup.inserted&&cleanup.removed&&cleanup.afterExists===false,cleanScannerPasses:clean?.exitCode===0},interpretation:'Scanner negative detection is expected evidence; the clean follow-up confirms removal and restored baseline scan.'};
fs.writeFileSync(resultPath,JSON.stringify(data,null,2)+'\n');
process.stdout.write(JSON.stringify({path:resultPath,assertions:data.assertions,logs:[detection?.log,clean?.log]},null,2)+'\n');
if(failure||Object.values(data.assertions).some((value)=>value!==true))process.exitCode=1;
