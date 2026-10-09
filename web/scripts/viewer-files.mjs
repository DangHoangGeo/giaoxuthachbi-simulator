// The public 3D visit is the project's own viewer (../Thach_Bi_Viewer), copied
// unchanged into public/viewer at build time and opened in visit-only mode.
// This module is the single definition of which files are published.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = fileURLToPath(new URL("..", import.meta.url));
export const viewerSource = path.resolve(webRoot, "../Thach_Bi_Viewer");
export const viewerEntry = "/viewer/OPEN_CHURCH.html";
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const text = /\.(js|css|html)$/;
const image = /references\/[A-Za-z0-9_./-]+\.(?:png|jpe?g|webp)/gi;

async function list(directory, recursive) {
  const names = [];
  for (const entry of await readdir(path.join(viewerSource, directory), { withFileTypes: true })) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (recursive) names.push(...(await list(relative, true)));
    } else if (entry.isFile() && entry.name !== ".DS_Store") names.push(relative);
  }
  return names;
}

// Returns [{ path, bytes, sha256, body }] for every published viewer file.
export async function viewerFiles() {
  const code = [
    ...(await list(".", false)).filter((name) => /\.(js|css)$/.test(name)),
    ...(await list("simulator", false)).filter((name) => /\.(js|css)$/.test(name)),
    ...(await list("planning", true)),
    "OPEN_CHURCH.html",
    "THREE_LICENSE.txt",
  ];
  const files = new Map();
  const images = new Set();
  for (const name of code) {
    let body = await readFile(path.join(viewerSource, name));
    if (name === "OPEN_CHURCH.html") {
      // The website always opens the viewer as a visit: no design simulator.
      const html = body.toString("utf8");
      const marked = html.replace('<html lang="en">', '<html lang="en" class="visit-only">');
      if (marked === html) throw new Error("Viewer entry page changed");
      body = Buffer.from(marked);
    }
    files.set(name, body);
    if (text.test(name))
      for (const match of body.toString("utf8").matchAll(image)) images.add(match[0]);
  }
  for (const name of [...images].sort()) {
    // Older code still names a few images that were moved; the viewer already
    // tolerates their absence, so publish only the ones that exist.
    const body = await readFile(path.join(viewerSource, name)).catch((error) => {
      if (error.code === "ENOENT") return null;
      throw error;
    });
    if (body) files.set(name, body);
  }
  return [...files]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([name, body]) => ({
      path: `/viewer/${name}`,
      bytes: body.length,
      sha256: sha256(body),
      body,
    }));
}
