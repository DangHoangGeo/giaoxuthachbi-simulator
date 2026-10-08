#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const clone = '/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const web = path.join(clone, 'web');
const evidence = '/private/tmp/thachbi-web01-clean-evidence/corrected-home-run';
const envRoot = '/private/tmp/thachbi-web01-clean-rerun-env';
const runtimeBin = '/private/tmp/thachbi-node22/node-v22.23.3-darwin-arm64/bin';
const safePath = `${runtimeBin}:/usr/bin:/bin:/usr/sbin:/sbin`;
const safeEnv = { PATH:safePath, HOME:process.env.HOME, TMPDIR:path.join(envRoot,'tmp'), CI:'1', NEXT_TELEMETRY_DISABLED:'1' };
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const git = (args) => spawnSync('/usr/bin/git', args, { cwd:clone, encoding:'utf8', env:safeEnv });
const node = process.version;
const npm = spawnSync('npm', ['--version'], { cwd:web, encoding:'utf8', env:safeEnv });
if (npm.status !== 0) throw new Error(`npm --version failed: ${npm.stderr}`);
const manifestPath = path.join(clone,'review/web-framework-2026-10-08/contracts/manifest.json');
const manifestBytes = fs.readFileSync(manifestPath);
const manifest = JSON.parse(manifestBytes.toString('utf8'));
const baselineEngineeringHashes = Object.entries(manifest.unchangedEngineeringSources).map(([relative, expectedSha256]) => {
  const actualSha256 = sha(fs.readFileSync(path.join(clone,relative)));
  return { path:relative, expectedSha256, actualSha256, matches:actualSha256===expectedSha256 };
});
const tracked = git(['ls-files','-z']).stdout.split('\0').filter(Boolean);
function walk(directory) {
  return fs.readdirSync(directory,{withFileTypes:true}).flatMap((entry)=>{
    if(entry.name==='.git') return [];
    const absolute=path.join(directory,entry.name);
    return entry.isDirectory()?walk(absolute):[absolute];
  }).sort();
}
const actualFiles = walk(clone).map((file)=>path.relative(clone,file).split(path.sep).join('/')).sort();
const status = git(['status','--porcelain=v1','--untracked-files=all']);
if (status.status !== 0) throw new Error(`git status failed: ${status.stderr}`);
const missingTracked = tracked.filter((name)=>!actualFiles.includes(name));
const untrackedOnDisk = actualFiles.filter((name)=>!tracked.includes(name));
const metadata = {
  schemaVersion:1,
  capturedAt:new Date().toISOString(),
  clone:{ path:clone, sourceRepository:'/Users/danghoang/Desktop/giaoxuthachbi_work', head:git(['rev-parse','HEAD']).stdout.trim(), tree:git(['rev-parse','HEAD^{tree}']).stdout.trim(), detached:git(['symbolic-ref','--quiet','--short','HEAD']).status!==0, statusPorcelain:status.stdout.trim(), trackedFileCount:tracked.length, actualFileCount:actualFiles.length, missingTracked, untrackedOnDisk, excludedNodeModules:['node_modules','web/node_modules'].filter((relative)=>fs.existsSync(path.join(clone,relative))), excludedNext:['.next','web/.next'].filter((relative)=>fs.existsSync(path.join(clone,relative))), environmentFiles:actualFiles.filter((relative)=>/(^|\/)\.env(?:\.|$)/.test(relative)) },
  host:{ platform:os.platform(), architecture:os.arch(), release:os.release(), version:os.version(), cpuModel:os.cpus()[0]?.model??null, logicalCpuCount:os.cpus().length },
  runtime:{ nodeVersion:node, nodeExecutable:process.execPath, npmVersion:npm.stdout.trim(), npmPackageManager:JSON.parse(fs.readFileSync(path.join(web,'package.json'),'utf8')).packageManager, safeEnvironment:{ PATH:safePath, HOME:'preserved unchanged from process.env.HOME; value omitted', TMPDIR:safeEnv.TMPDIR, CI:'1', NEXT_TELEMETRY_DISABLED:'1' }, homePreservedUnchanged:true, cachePath:'/private/tmp/thachbi-npm-cache' },
  source:{ gitSha:git(['rev-parse','HEAD']).stdout.trim(), gitTree:git(['rev-parse','HEAD^{tree}']).stdout.trim(), lockPath:'web/package-lock.json', lockSha256Before:sha(fs.readFileSync(path.join(web,'package-lock.json'))), baselineEngineeringManifest:'review/web-framework-2026-10-08/contracts/manifest.json', baselineEngineeringManifestSha256:sha(manifestBytes), baselineEngineeringHashCount:baselineEngineeringHashes.length, baselineEngineeringHashesMatched:baselineEngineeringHashes.filter((entry)=>entry.matches).length, baselineEngineeringHashes },
  preconditions:{ cleanDetachedCheckout:status.stdout.trim()===''&&git(['symbolic-ref','--quiet','--short','HEAD']).status!==0, noInheritedNodeModules:!fs.existsSync(path.join(clone,'web/node_modules'))&&!fs.existsSync(path.join(clone,'node_modules')), noInheritedNext:!fs.existsSync(path.join(clone,'web/.next'))&&!fs.existsSync(path.join(clone,'.next')), diskMatchesTrackedFiles:missingTracked.length===0&&untrackedOnDisk.length===0, exactly59EngineeringHashes:baselineEngineeringHashes.length===59, allEngineeringHashesMatch:baselineEngineeringHashes.every((entry)=>entry.matches) },
};
fs.writeFileSync(path.join(evidence,'preflight.json'),JSON.stringify(metadata,null,2)+'\n');
process.stdout.write(JSON.stringify({ path:path.join(evidence,'preflight.json'), head:metadata.clone.head, tree:metadata.clone.tree, npm:metadata.runtime.npmVersion, baselineEngineeringHashes:`${metadata.source.baselineEngineeringHashesMatched}/${metadata.source.baselineEngineeringHashCount}`, preconditions:metadata.preconditions },null,2)+'\n');
if(Object.values(metadata.preconditions).some((value)=>value!==true)) process.exitCode=1;
