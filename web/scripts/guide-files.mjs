// The public quick-start guide for opening the model on a computer is the page
// ../docs/guides/father-quick-start, copied unchanged into public/guide at build time.
// This module is the single definition of which files are published.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
export const guideSource = path.resolve(webRoot, "../docs/guides/father-quick-start");
export const guideEntry = "/guide/index.html";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
// Pages, scripts, images, narration and the three short screen clips. The full
// narrated video is a large local file and is not published with the site.
const published =
  /^(?:index\.html|scenes\.js|timings\.js|(?:assets\/[\w.-]+\.jpg)|(?:audio\/[\w.-]+\.m4a)|(?:clips\/[\w.-]+\.mp4))$/;

async function list(directory) {
  const names = [];
  for (const entry of await readdir(path.join(guideSource, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) names.push(...(await list(relative)));
    else if (entry.isFile()) names.push(relative);
  }
  return names;
}

// Returns [{ path, bytes, sha256, body }] for every published guide file.
export async function guideFiles() {
  const files = [];
  for (const name of (await list(".")).filter((n) => published.test(n)).sort()) {
    const body = await readFile(path.join(guideSource, name));
    files.push({ path: `/guide/${name}`, bytes: body.length, sha256: sha256(body), body });
  }
  return files;
}
