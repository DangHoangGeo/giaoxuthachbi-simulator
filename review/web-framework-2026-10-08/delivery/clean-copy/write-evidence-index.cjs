'use strict';
const fs=require('node:fs');const path=require('node:path');
const root='/private/tmp/thachbi-web01-clean-evidence';
const home=path.join(root,'corrected-home-run');
const baseline=JSON.parse(fs.readFileSync(path.join(home,'baseline-run.json'),'utf8'));
const top=JSON.parse(fs.readFileSync(path.join(root,'check-results.json'),'utf8'));
const firstCorrection=JSON.parse(fs.readFileSync(path.join(root,'first-run-correction.json'),'utf8'));
const final=JSON.parse(fs.readFileSync(path.join(home,'final-restoration-check.json'),'utf8'));
const correctedCanary=JSON.parse(fs.readFileSync(path.join(home,'canary-correction/canary-probe-corrected.json'),'utf8'));
const firstCanary=JSON.parse(fs.readFileSync(path.join(home,'canary-probe.json'),'utf8'));
const pointer=JSON.parse(fs.readFileSync(path.join(home,'pointer-probe/pointer-probe.json'),'utf8'));
const badClient=JSON.parse(fs.readFileSync(path.join(home,'client-boundary-probe/client-boundary-probe.json'),'utf8'));
const goodClient=JSON.parse(fs.readFileSync(path.join(home,'client-boundary-probe-routable/client-boundary-probe-routable.json'),'utf8'));
const relative=(p)=>path.relative(root,path.join(root,p)).split(path.sep).join('/');
const baselineLogs=baseline.checks.map(x=>({id:x.id,status:x.status,exitCode:x.exitCode,log:relative(`corrected-home-run/${x.log}`),sha256:x.logSha256}));
const firstLogs=top.checks.map(x=>({id:x.id,status:x.status,exitCode:x.exitCode,log:relative(x.log),sha256:x.logSha256}));
const logRows=[];
for(const [id,obj,prefix] of [['canary-first',firstCanary,'corrected-home-run/'],['canary-corrected',correctedCanary,'corrected-home-run/canary-correction/'],['malformed-pointer',pointer,'corrected-home-run/pointer-probe/'],['client-nonroutable',badClient,'corrected-home-run/client-boundary-probe/'],['client-routable',goodClient,'corrected-home-run/client-boundary-probe-routable/']]) {
 const scans=id.startsWith('canary')?[['detected',obj.detectedScan],['clean',obj.cleanScan]]:[['build',obj.build]];
 for(const [kind,s] of scans) logRows.push({id:`${id}-${kind}`,exitCode:s.exitCode,log:relative(prefix+s.log),sha256:s.logSha256});
}
const index={
 schemaVersion:1,
 evidenceRoot:root,
 finalStatus:'complete; corrected clean-clone checks and all three intended negative probes passed; no repository source changes',
 initialAttempt:{status:'superseded/non-authoritative because HOME was redirected and default-sandbox Turbopack build hit EPERM; downstream boundary/browser exits are cascade results',correctionRecord:relative('first-run-correction.json'),checks: firstLogs},
 correctedRun:{status:'authoritative clean clone at detached target commit; process.env.HOME preserved unchanged and its value omitted; TMPDIR task-specific; npm ci offline',preflight:relative('corrected-home-run/preflight.json'),summary:relative('corrected-home-run/baseline-run.json'),results:relative('corrected-home-run/check-results.json'),head:final.clone.head,tree:final.clone.tree,node:baseline.runtime.nodeVersion,npm:baseline.runtime.npmVersion,buildId:baseline.productionBuild.buildId,checks:baselineLogs,allChecksPassed:baseline.allRequestedChecksPassed},
 negativeProbes:[
  {id:'static-canary-first-harness',status:'superseded harness assertion mismatch; scanner correctly reported `.next/static/...`, while harness expected `web/.next/static/...`; removal and clean scan passed',result:relative('corrected-home-run/canary-probe.json'),assertions:firstCanary.assertions},
  {id:'static-canary-corrected',status:'passed',result:relative('corrected-home-run/canary-correction/canary-probe-corrected.json'),assertions:correctedCanary.assertions},
  {id:'malformed-pointer',status:'passed; generic build failure and no canary disclosure; exact pointer bytes restored',result:relative('corrected-home-run/pointer-probe/pointer-probe.json'),assertions:pointer.assertions},
  {id:'client-boundary-nonroutable-fixture',status:'superseded fixture; underscore-prefixed folder was excluded by Next private-folder convention, so build success did not exercise the boundary; probe cleaned',result:relative('corrected-home-run/client-boundary-probe/client-boundary-probe.json'),assertions:badClient.assertions},
  {id:'client-boundary-routable-fixture',status:'passed; production build rejected the client import with server-only/Client Component/protected-content diagnostics; temporary page removed',result:relative('corrected-home-run/client-boundary-probe-routable/client-boundary-probe-routable.json'),assertions:goodClient.assertions}
 ],
 rawLogs:logRows,
 finalRestoration:{record:relative('corrected-home-run/final-restoration-check.json'),gitHead:final.clone.head,gitTree:final.clone.tree,gitStatusPorcelain:final.clone.gitStatusPorcelain,sourceClean:final.restoration.gitSourceClean,lock:{path:'web/package-lock.json',sha256Before:final.baselineChecks.lockSha256Before,sha256After:final.baselineChecks.lockSha256Final,unchanged:final.restoration.lockUnchangedFromBaseline},engineeringSourceHashes:{manifest:'review/web-framework-2026-10-08/contracts/manifest.json',count:final.engineeringSourceHashes.count,matches:final.engineeringSourceHashes.matches,allMatch:final.engineeringSourceHashes.allMatch},pointerRestored:final.restoration.pointerMatchesOriginal,temporaryPagesAbsent:final.restoration.temporaryProbeRoutesAbsent,canaryFilesAbsent:final.restoration.allCanaryFilesAbsent},
 generatedBuildNote:'The successful baseline build ID is recorded. Later negative build probes intentionally affected ignored .next output; current generated build output is not described as a successful final build.'
};
const out=path.join(root,'evidence-index.json');fs.writeFileSync(out,JSON.stringify(index,null,2)+'\n',{flag:'wx'});process.stdout.write(JSON.stringify({path:out,baselineChecks:baselineLogs.length,negativeLogs:logRows.length,sourceClean:index.finalRestoration.sourceClean,lockUnchanged:index.finalRestoration.lock.unchanged,engineering:index.finalRestoration.engineeringSourceHashes},null,2)+'\n');
