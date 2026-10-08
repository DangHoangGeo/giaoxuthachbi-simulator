#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const clone = '/private/tmp/thachbi-web01-clean-rerun-xLc8CE';
const evidence = '/private/tmp/thachbi-web01-clean-evidence';
const corrected = path.join(evidence, 'corrected-home-run');
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git = (...args) => {
  const result = spawnSync('git', args, { cwd: clone, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
};
const baseline = JSON.parse(fs.readFileSync(path.join(corrected, 'baseline-run.json'), 'utf8'));
const checks = JSON.parse(fs.readFileSync(path.join(corrected, 'check-results.json'), 'utf8'));
const canary = JSON.parse(fs.readFileSync(path.join(corrected, 'canary-correction/canary-probe-corrected.json'), 'utf8'));
const pointer = JSON.parse(fs.readFileSync(path.join(corrected, 'pointer-probe/pointer-probe.json'), 'utf8'));
const badClient = JSON.parse(fs.readFileSync(path.join(corrected, 'client-boundary-probe/client-boundary-probe.json'), 'utf8'));
const goodClient = JSON.parse(fs.readFileSync(path.join(corrected, 'client-boundary-probe-routable/client-boundary-probe-routable.json'), 'utf8'));
const manifestPath = path.join(clone, 'review/web-framework-2026-10-08/contracts/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const expectedHashes = manifest.unchangedEngineeringSources;
const engineering = Object.entries(expectedHashes).map(([relative, expectedSha256]) => {
  const actualSha256 = hash(path.join(clone, relative));
  return { path: relative, expectedSha256, actualSha256, matches: actualSha256 === expectedSha256 };
});
const pointerPath = path.join(clone, 'web/content/current.json');
const originalPointerSha = pointer.changedPath.originalSha256;
const pointerNowSha = hash(pointerPath);
const initialCanaryRel = JSON.parse(fs.readFileSync(path.join(corrected, 'canary-probe.json'), 'utf8')).changedPath.path;
const correctedCanaryRel = canary.changedPath.path;
const removedCanaryFiles = [initialCanaryRel, correctedCanaryRel].map((relative) => ({ path: relative, absent: !fs.existsSync(path.join(clone, relative)) }));
const badPrivateDir = path.join(clone, 'web/src/app/[locale]/(public)/__server_boundary_canary');
const routeableFile = path.join(clone, 'web/src/app/[locale]/boundary-canary/page.tsx');
const routeableDir = path.dirname(routeableFile);
const head = git('rev-parse', 'HEAD');
const tree = git('rev-parse', 'HEAD^{tree}');
const status = git('status', '--porcelain');
const currentBuildIdPath = path.join(clone, 'web/.next/BUILD_ID');
const currentBuildId = fs.existsSync(currentBuildIdPath) ? fs.readFileSync(currentBuildIdPath, 'utf8').trim() : null;
const data = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  evidenceRoot: evidence,
  environmentHandling: {
    firstRun: JSON.parse(fs.readFileSync(path.join(evidence, 'first-run-correction.json'), 'utf8')),
    correctedRun: baseline.runtime.safeEnvironment,
    correctedHomePreservedUnchanged: baseline.runtime.homePreservedUnchanged,
    homeValueRecorded: false
  },
  clone: {
    path: clone, expectedHead: '07c06b6b6911b1898f4f32e5132375b004cfda83', head,
    expectedTree: '9e1348bfa86103b1df6d542ab0be1dfc80b64e63', tree,
    gitStatusPorcelain: status, sourceClean: status === ''
  },
  baselineChecks: {
    commandExitCodes: checks.checks.map(({ id, exitCode, log, logSha256 }) => ({ id, exitCode, log, logSha256 })),
    allRequestedChecksPassed: baseline.allRequestedChecksPassed,
    node: baseline.runtime.nodeVersion,
    npm: baseline.runtime.npmVersion,
    lockSha256Before: baseline.source.lockSha256Before,
    lockSha256AfterBaseline: baseline.source.lockSha256After,
    lockSha256Final: hash(path.join(clone, 'web/package-lock.json')),
    successfulBaselineBuildId: baseline.productionBuild.buildId,
    currentGeneratedBuildIdAfterNegativeProbes: currentBuildId
  },
  engineeringSourceHashes: { count: engineering.length, matches: engineering.filter((item) => item.matches).length, allMatch: engineering.every((item) => item.matches), entries: engineering },
  negativeProbes: {
    canary: { correctedAttempt: canary.assertions, detectedScan: canary.detectedScan, cleanScan: canary.cleanScan, supersededHarnessAttempt: { assertions: JSON.parse(fs.readFileSync(path.join(corrected, 'canary-probe.json'), 'utf8')).assertions, note: 'The scanner reported `.next/static/...`; the first harness compared against `web/.next/static/...`. The scanner behavior itself was correct, and the separately preserved corrected attempt passes.' }, injectedFilesAbsent: removedCanaryFiles },
    malformedPointer: { assertions: pointer.assertions, build: pointer.build, pointerRestoredFromProbe: pointer.changedPath.restoredByteForByte, originalSha256: originalPointerSha, currentSha256: pointerNowSha, currentMatchesOriginal: pointerNowSha === originalPointerSha },
    clientBoundary: { supersededNonRoutableFixture: { assertions: badClient.assertions, note: 'Leading-underscore route folder was excluded by Next.js private-folder convention, so this attempt did not exercise the boundary.' }, routableFixture: { assertions: goodClient.assertions, build: goodClient.build } }
  },
  restoration: {
    pointerMatchesOriginal: pointerNowSha === originalPointerSha,
    temporaryProbeRoutesAbsent: !fs.existsSync(badPrivateDir) && !fs.existsSync(routeableFile) && !fs.existsSync(routeableDir),
    allCanaryFilesAbsent: removedCanaryFiles.every((item) => item.absent),
    gitSourceClean: status === '',
    lockUnchangedFromBaseline: hash(path.join(clone, 'web/package-lock.json')) === baseline.source.lockSha256After,
    engineeringHashesUnchanged: engineering.every((item) => item.matches)
  },
  interpretation: 'The successful baseline build ID is retained from the clean pre-probe baseline. Later intentionally negative build probes may have changed ignored .next output; the current BUILD_ID is recorded separately and is not represented as a successful final build. No repository source/tests/thresholds were edited.'
};
const required = [data.clone.sourceClean, data.baselineChecks.allRequestedChecksPassed, data.negativeProbes.canary.correctedAttempt.detectedNonzero, data.negativeProbes.canary.correctedAttempt.detectedNamesMarker, data.negativeProbes.canary.correctedAttempt.detectedNamesFile, data.negativeProbes.canary.correctedAttempt.removedOnlyInjectedFile, data.negativeProbes.canary.correctedAttempt.cleanScannerPasses, ...Object.values(data.negativeProbes.malformedPointer.assertions), ...Object.values(data.negativeProbes.clientBoundary.routableFixture.assertions), data.restoration.pointerMatchesOriginal, data.restoration.temporaryProbeRoutesAbsent, data.restoration.allCanaryFilesAbsent, data.restoration.gitSourceClean, data.restoration.lockUnchangedFromBaseline, data.restoration.engineeringHashesUnchanged];
data.allFinalAssertionsPass = required.every(Boolean) && data.engineeringSourceHashes.allMatch && engineering.length === 59;
const output = path.join(corrected, 'final-restoration-check.json');
fs.writeFileSync(output, JSON.stringify(data, null, 2) + '\n', { flag: 'wx' });
process.stdout.write(JSON.stringify({ output, allFinalAssertionsPass: data.allFinalAssertionsPass, clone: data.clone, baselineChecks: { allRequestedChecksPassed: data.baselineChecks.allRequestedChecksPassed, exitCodes: data.baselineChecks.commandExitCodes.map((item) => [item.id,item.exitCode]) }, negativeProbes: { canary: data.negativeProbes.canary.correctedAttempt, malformedPointer: data.negativeProbes.malformedPointer.assertions, clientBoundary: data.negativeProbes.clientBoundary.routableFixture.assertions }, restoration: data.restoration, engineeringHashes: { count: data.engineeringSourceHashes.count, matches: data.engineeringSourceHashes.matches } }, null, 2) + '\n');
if (!data.allFinalAssertionsPass) process.exitCode = 1;
