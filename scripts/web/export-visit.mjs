// Trusted authoring tool. Builds the existing geometry with real Canvas textures;
// publishes neither legacy code nor its metadata. Output must be outside web/.
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { gzipSync } from "node:zlib";
const full = process.argv[3] === "full";
const root = path.resolve(import.meta.dirname, "../..");
const output = path.resolve(
	process.argv[2] || "/private/tmp/thachbi-visit-export",
);
if (
	output === path.join(root, "web") ||
	output.startsWith(path.join(root, "web") + "/")
)
	throw Error("Use private staging outside web");
await fs.mkdir(output); // No overwrite of prior evidence.
const require = createRequire(path.join(root, "web/package.json"));
const { chromium } = require("playwright");
const files = [
	"texture-memory.js",
	"render-batches.js",
	"glass-art.js",
	"carving.js",
	"sanctuary.js",
	"realism.js",
	"planning.js",
	"bundle.js",
];
const sources = {};
for (const f of files) {
	const b = await fs.readFile(path.join(root, "Thach_Bi_Viewer", f));
	sources[f] = {
		sha256: createHash("sha256").update(b).digest("hex"),
		bytes: b.length,
	};
}
let src = await fs.readFile(
	path.join(root, "Thach_Bi_Viewer/bundle.js"),
	"utf8",
);
const begin = src.indexOf('    Us = document.getElementById("viewport"),');
const end = src.indexOf("  var ce = {};", begin);
if (begin < 0 || end < begin)
	throw Error("Source initialization anchor changed");
src =
	src.slice(0, begin) +
	`    ni = {capabilities:{getMaxAnisotropy:()=>8},shadowMap:{},toneMappingExposure:1};
  var ii = new Ti(), xn = new Cs(), Fp = new Cs(), X0 = new xr();
  ii.background = new De('#d9e4e9'); ii.add(xn,Fp,X0);
` +
	src.slice(end);
const ui = src.lastIndexOf("  z0({");
if (ui < 0) throw Error("Source UI anchor changed");
src =
	src.slice(0, ui) +
	`window.exportStudy={T:Ec,building:nn,batches:t_,display:Bp,roofs:ei,Exporter:Ls};})();`;
const browser = await chromium.launch({
	channel: process.env.PLAYWRIGHT_CHANNEL || "chrome",
	headless: process.env.HEADED !== "1",
});
const page = await browser.newPage();
const diagnostics = [];
page.on("console", (m) => {
	if (["warning", "error"].includes(m.type()))
		diagnostics.push({ type: m.type(), text: m.text() });
});
try {
	await page.goto("about:blank");
	await page.evaluate(() => {
		let seed = 186;
		Math.random = () =>
			(seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
		window.CHURCH_REFERENCES = [];
	});
	const started = Date.now();
	for (const f of files.filter((f) => f !== "bundle.js"))
		await page.addScriptTag({
			content: await fs.readFile(path.join(root, "Thach_Bi_Viewer", f), "utf8"),
		});
	await page.addScriptTag({ content: src });
	const buildMs = Date.now() - started;
	const info = await page.evaluate(async (full) => {
		const { T, building, batches, display, roofs, Exporter } =
			window.exportStudy;
		window.CHURCH_REALISM.setOpenings("open");
		const group = display.clone(true);
		group.name = "church";
		group.visible = true;
		const mapping = [];
		let i = 0;
		for (const [source, batch] of batches) {
			const child = group.children[i];
			child.name = source === roofs ? "roof" : `part-${i}`;
			mapping.push({
				publicName: child.name,
				sourceName: source.name,
				visible: child.visible,
			});
			i++;
		}
		const mats = new Set(),
			textures = new Set();
		let meshes = 0,
			vertices = 0,
			triangles = 0;
		group.traverse((o) => {
			o.userData = {};
			if (o.isMesh) {
				o.name = "surface";
				meshes++;
				vertices += o.geometry.attributes.position.count;
				triangles +=
					(o.geometry.index?.count ?? o.geometry.attributes.position.count) / 3;
				o.geometry.userData = {};
				o.geometry.name = "";
				for (const m of [o.material].flat()) {
					mats.add(m);
					m.name = "";
					m.userData = {};
					for (const v of Object.values(m))
						if (v?.isTexture) {
							v.name = "";
							v.userData = {};
							textures.add(v);
						}
				}
			}
		});
		let textureBytes = 0;
		for (const t of textures)
			textureBytes += (t.image?.width ?? 0) * (t.image?.height ?? 0) * 4;
		const bounds = new T.Box3().setFromObject(group);
		const start = performance.now();
		window.visitGLB = await new Exporter().parseAsync(group, {
			binary: true,
			onlyVisible: true,
			maxTextureSize: full ? Infinity : 512,
		});
		const exportMs = performance.now() - start;
		return {
			revision: T.REVISION,
			buildRootMeshes: meshes,
			buildRootVertices: vertices,
			buildRootTriangles: triangles,
			materials: mats.size,
			textures: textures.size,
			sourceTextureRgbaBytes: textureBytes,
			bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
			mapping,
			exportMs,
			bytes: window.visitGLB.byteLength,
		};
	}, full);
	const base64 = await page.evaluate(() => {
		const b = new Uint8Array(window.visitGLB);
		let s = "";
		for (let i = 0; i < b.length; i += 32768)
			s += String.fromCharCode(...b.subarray(i, i + 32768));
		return btoa(s);
	});
	const bytes = Buffer.from(base64, "base64");
	await fs.writeFile(path.join(output, "church.glb"), bytes);
	const jsonLength = bytes.readUInt32LE(12);
	const gltf = JSON.parse(
		bytes
			.subarray(20, 20 + jsonLength)
			.toString()
			.trim(),
	);
	for (const key of ["nodes", "materials", "meshes", "textures", "images"])
		for (const v of gltf[key] || [])
			if (v.extras) throw Error(`Unexpected metadata ${key}`);
	for (const image of gltf.images || [])
		if (image.uri) throw Error("Unexpected external image");
	for (const buffer of gltf.buffers || [])
		if (buffer.uri) throw Error("Unexpected external buffer");
	const manifest = {
		schemaVersion: 1,
		sourceCommit: execFileSync("git", ["rev-parse", "HEAD"], {
			cwd: root,
			encoding: "utf8",
		}).trim(),
		sources,
		units: "metres",
		axes: "X toward sanctuary; Y up from nave FFL; Z centered D/E, negative B positive H",
		profile:
			"visible display batches, four pew blocks, doors open; no simulator equipment, private metadata, editors, source drawings or reference originals",
		texturePolicy: full
			? "Original Canvas texture resolution, no quantization; architectural sharing export."
			: "Export maximum512px; original generated maps retained in offline source. Display approximation only.",
		buildMs,
		...info,
		gzipBytes: gzipSync(bytes).length,
		sha256: createHash("sha256").update(bytes).digest("hex"),
		diagnostics,
	};
	await fs.writeFile(
		path.join(output, "manifest.json"),
		JSON.stringify(manifest, null, 2) + "\n",
	);
	console.log(
		JSON.stringify({
			output,
			bytes: bytes.length,
			gzipBytes: manifest.gzipBytes,
			buildMs,
			exportMs: info.exportMs,
			meshes: info.buildRootMeshes,
			diagnostics: diagnostics.length,
		}),
	);
} finally {
	await browser.close();
}
