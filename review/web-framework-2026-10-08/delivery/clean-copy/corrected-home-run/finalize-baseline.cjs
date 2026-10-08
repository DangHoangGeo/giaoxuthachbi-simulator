#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {spawnSync}=require('node:child_process');
const clone='/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web=path.join(clone,'web');
const evidence='/private/tmp/thachbi-web01-clean-evidence/corrected-home-run';
const runtimeBin='/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
const env={PATH:`${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`,HOME:process.env.HOME,TMPDIR:'/private/tmp/thachbi-web01-clean-rerun-env/tmp',CI:'1',NEXT_TELEMETRY_DISABLED:'1'};
const run=(args)=>spawnSync('/usr/bin/git',args,{cwd:clone,encoding:'utf8',env});
const sha=(data)=>crypto.createHash('sha256').update(data).digest('hex');
const pre=JSON.parse(fs.readFileSync(path.join(evidence,'preflight.json'),'utf8'));
const checks=JSON.parse(fs.readFileSync(path.join(evidence,'check-results.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(clone,'review/web-framework-2026-10-08/contracts/manifest.json'),'utf8'));
const engineering=Object.entries(manifest.unchangedEngineeringSources).map(([relative,expectedSha256])=>{
 const actualSha256After=sha(fs.readFileSync(path.join(clone,relative)));
 const prior=pre.source.baselineEngineeringHashes.find((item)=>item.path===relative);
 return {path:relative,expectedSha256,actualSha256Before:prior?.actualSha256??null,actualSha256After,matchesBefore:prior?.matches??false,matchesAfter:actualSha256After===expectedSha256};
});
const head=run(['rev-parse','HEAD']).stdout.trim();
const tree=run(['rev-parse','HEAD^{tree}']).stdout.trim();
const status=run(['status','--porcelain=v1','--untracked-files=all']).stdout.trim();
const lockShaAfter=sha(fs.readFileSync(path.join(web,'package-lock.json')));
const buildId=fs.readFileSync(path.join(web,'.next','BUILD_ID'),'utf8').trim();
const resultsPath=path.join(evidence,'baseline-run.json');
if(fs.existsSync(resultsPath))throw new Error('Refusing to overwrite baseline-run.json');
const data={
 schemaVersion:1,
 capturedAt:new Date().toISOString(),
 clone:{path:clone,head,tree,gitStatusPorcelain:status,sourceClean:status==='',nodeModulesPresent:fs.existsSync(path.join(web,'node_modules')),nextOutputPresent:fs.existsSync(path.join(web,'.next'))},
 source:{lockPath:'web/package-lock.json',lockSha256Before:pre.source.lockSha256Before,lockSha256After:lockShaAfter,lockUnchanged:pre.source.lockSha256Before===lockShaAfter,baselineManifest:'review/web-framework-2026-10-08/contracts/manifest.json',baselineManifestBaseCommit:manifest.baseCommit,baselineEngineeringHashCount:engineering.length,baselineEngineeringHashMatchesBefore:engineering.filter((x)=>x.matchesBefore).length,baselineEngineeringHashMatchesAfter:engineering.filter((x)=>x.matchesAfter).length,baselineEngineeringHashes:engineering},
 host:pre.host,
 runtime:pre.runtime,
 environmentCorrection:{firstRun:'HOME was temporarily redirected; first run preserved unchanged in parent evidence as non-authoritative.',correctedRun:'process.env.HOME was passed unchanged to each child; HOME value omitted from output. TMPDIR remained task-specific. Child variables were limited to PATH, HOME, TMPDIR, CI, NEXT_TELEMETRY_DISABLED, plus the two explicitly requested headed-browser variables.',npmCiOffline:true},
 productionBuild:{command:'NEXT_TELEMETRY_DISABLED=1 npm run build',exitCode:checks.checks.find((x)=>x.id==='production-build')?.exitCode,buildId,buildIdPath:'web/.next/BUILD_ID'},
 checks:checks.checks,
 allRequestedChecksPassed:checks.checks.length===7&&checks.checks.every((item)=>item.exitCode===0&&item.status==='passed'),
 initialClonePath:'/private/tmp/thachbi-web01-clean-0a5Kpc',
 initialAttemptNote:'See ../first-run-correction.json; its default-sandbox Turbopack EPERM failure was not counted as authoritative.'
};
fs.writeFileSync(resultsPath,JSON.stringify(data,null,2)+'\n');
process.stdout.write(JSON.stringify({path:resultsPath,head,tree,checks:checks.checks.map((x)=>({id:x.id,exitCode:x.exitCode})),allPassed:data.allRequestedChecksPassed,lockUnchanged:data.source.lockUnchanged,engineeringHashes:`${data.source.baselineEngineeringHashMatchesAfter}/${data.source.baselineEngineeringHashCount}`,sourceClean:data.clone.sourceClean,buildId},null,2)+'\n');
if(!data.allRequestedChecksPassed||!data.source.lockUnchanged||!data.clone.sourceClean||data.source.baselineEngineeringHashMatchesAfter!==59)process.exitCode=1;
