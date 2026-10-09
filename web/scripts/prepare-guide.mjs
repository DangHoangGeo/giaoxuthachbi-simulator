// Copies the quick-start guide into public/guide for the website.
// public/guide is generated output: it is ignored by Git and rebuilt here.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { guideFiles } from "./guide-files.mjs";

const publicRoot = fileURLToPath(new URL("../public", import.meta.url));
const files = await guideFiles();
await rm(path.join(publicRoot, "guide"), { recursive: true, force: true });
let bytes = 0;
for (const file of files) {
  const target = path.join(publicRoot, file.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, file.body);
  bytes += file.bytes;
}
console.log(JSON.stringify({ guideFiles: files.length, bytes }));
