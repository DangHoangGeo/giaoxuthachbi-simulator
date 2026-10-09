import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";

const root = await realpath(process.cwd());
const within = (target) => target === root || target.startsWith(`${root}${path.sep}`);
const failures = [];
const checked = new Set();
let bytes = 0;
let traceReferences = 0;
const fixture = JSON.parse(await readFile("tests/fixtures/private-canary.json", "utf8"));
const forbidden = [
  ["synthetic-private-canary", fixture.privateCanary],
  ["synthetic-private-path", fixture.storageKey],
  ["synthetic-unpublished-title", fixture.unpublishedTitle],
  ["legacy-viewer-directory", "Thach_Bi_Viewer/"],
  ["engineering-source-directory", "docs/electrical-grid/"],
  ["dimension-source-directory", "docs/layout_design/"],
  ["synthetic-gallery-build", "SYNTHETIC TEST BUILD"],
  ["synthetic-gallery-credit", "Synthetic test generator; no parish image"],
  ["private-test-fixture", "tests/fixtures/private-canary.json"],
].map(([label, value]) => [label, Buffer.from(value)]);
const sourceDirectoryMarkers = new Set([
  "legacy-viewer-directory",
  "engineering-source-directory",
  "dimension-source-directory",
]);

async function inspect(file) {
  const actual = await realpath(file);
  const relative = path.relative(root, file);
  if (!within(actual)) {
    failures.push(`Outside web root: ${relative}`);
    return;
  }
  if (checked.has(actual)) return;
  checked.add(actual);
  const info = await stat(actual);
  if (info.isDirectory()) {
    for (const child of await readdir(actual)) await inspect(path.join(actual, child));
    return;
  }
  const buffer = await readFile(actual);
  bytes += buffer.length;
  // The published viewer copy is the project's own public source, so its files may
  // name repository directories. Application code may not, and canaries apply everywhere.
  const viewerCopy = relative
    .split(path.sep)
    .join("/")
    .startsWith(".next/standalone/public/viewer/");
  for (const [label, needle] of forbidden) {
    if (viewerCopy && sourceDirectoryMarkers.has(label)) continue;
    if (buffer.includes(needle)) failures.push(`${label}: ${relative}`);
  }
  if (file.endsWith(".nft.json")) {
    const trace = JSON.parse(buffer.toString("utf8"));
    for (const reference of trace.files) {
      traceReferences++;
      const target = path.resolve(path.dirname(actual), reference);
      if (!within(target) || !within(await realpath(target))) {
        failures.push(`Trace outside web root: ${relative}`);
      }
    }
  }
}
for (const directory of [".next/static", ".next/server", ".next/standalone"]) {
  await inspect(path.resolve(directory));
}
// Top-level framework traces are not beneath the three deliverable directories.
for (const name of await readdir(".next")) {
  if (name.endsWith(".nft.json")) await inspect(path.resolve(".next", name));
}
console.log(
  JSON.stringify(
    {
      schemaVersion: 1,
      buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(),
      inspectedEntries: checked.size,
      inspectedBytes: bytes,
      traceReferences,
      forbiddenMarkers: forbidden.map(([label]) => label),
      failures,
      limits:
        "Exact byte/path canaries and trace containment only; not a universal secret detector or authorization test.",
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;
