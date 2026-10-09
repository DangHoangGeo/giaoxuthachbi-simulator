// Verifies that public/guide is exactly the copy of ../docs/guides/father-quick-start
// that guide-files.mjs defines: same file list, same bytes, nothing extra.
import { createHash } from "node:crypto";
import { lstat, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideEntry, guideFiles } from "./guide-files.mjs";

const publicRoot = fileURLToPath(new URL("../public", import.meta.url));
async function published(directory, prefix) {
  const names = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = `${prefix}/${entry.name}`;
    if (entry.isDirectory())
      names.push(...(await published(path.join(directory, entry.name), relative)));
    else if (entry.isFile()) names.push(relative);
    else throw new Error(`Unexpected entry ${relative}`);
  }
  return names;
}
const expected = new Map((await guideFiles()).map((file) => [file.path, file]));
if (!expected.has(guideEntry)) throw new Error("Guide entry page missing from the file list");
const actual = await published(path.join(publicRoot, "guide"), "/guide");
const extra = actual.filter((name) => !expected.has(name));
const missing = [...expected.keys()].filter((name) => !actual.includes(name));
if (extra.length || missing.length)
  throw new Error(`Guide copy differs from source. Extra: ${extra}. Missing: ${missing}.`);
let bytes = 0;
for (const [name, file] of expected) {
  const target = path.join(publicRoot, name);
  const stat = await lstat(target);
  if (stat.isSymbolicLink() || stat.size !== file.bytes) throw new Error(`Wrong size: ${name}`);
  if (
    createHash("sha256")
      .update(await readFile(target))
      .digest("hex") !== file.sha256
  )
    throw new Error(`Wrong content: ${name}`);
  bytes += file.bytes;
}
console.log(
  JSON.stringify({ guideFiles: expected.size, bytes, checks: "exact inventory, bytes, hash" }),
);
