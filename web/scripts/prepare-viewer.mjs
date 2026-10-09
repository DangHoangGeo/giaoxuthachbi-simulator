// Copies the project's viewer into public/viewer for the 3D visit page.
// public/viewer is generated output: it is ignored by Git and rebuilt here.
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { viewerFiles } from "./viewer-files.mjs";

const publicRoot = fileURLToPath(new URL("../public", import.meta.url));
const files = await viewerFiles();
await rm(path.join(publicRoot, "viewer"), { recursive: true, force: true });
let bytes = 0;
for (const file of files) {
  const target = path.join(publicRoot, file.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, file.body);
  bytes += file.bytes;
}
console.log(JSON.stringify({ viewerFiles: files.length, bytes }));
