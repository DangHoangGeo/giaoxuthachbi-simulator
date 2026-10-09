import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { getBounds } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";
import fs from "node:fs/promises";
await MeshoptDecoder.ready;
const io = new NodeIO()
	.registerExtensions(ALL_EXTENSIONS)
	.registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const [sourcePath, webPath, reportPath] = process.argv.slice(2);
if (!sourcePath || !webPath || !reportPath)
	throw Error("Usage: compare.mjs source.glb web.glb output.json");
const a = await io.read(sourcePath),
	b = await io.read(webPath);
function summary(doc) {
	const root = doc.getRoot();
	return {
		bounds: getBounds(root.listScenes()[0]),
		meshes: root.listMeshes().length,
		materials: root.listMaterials().length,
		textures: root.listTextures().length,
		triangles: root
			.listMeshes()
			.reduce(
				(n, m) =>
					n +
					m
						.listPrimitives()
						.reduce(
							(n, p) =>
								n +
								(p.getIndices()?.getCount() ??
									p.getAttribute("POSITION").getCount()) /
									3,
							0,
						),
				0,
			),
		nodes: root
			.listNodes()
			.filter((n) => n.getMesh())
			.map((n) => ({
				name: n.getName(),
				bounds: getBounds(n),
				primitives: n.getMesh().listPrimitives().length,
			})),
	};
}
const source = summary(a),
	web = summary(b);
let maxBoundsDelta = 0;
if (source.nodes.length !== web.nodes.length) throw Error("Node count changed");
for (let i = 0; i < source.nodes.length; i++) {
	const x = source.nodes[i],
		y = web.nodes[i];
	if (x.name !== y.name || x.primitives !== y.primitives)
		throw Error("Node topology changed");
	for (const key of ["min", "max"])
		for (let k = 0; k < 3; k++)
			maxBoundsDelta = Math.max(
				maxBoundsDelta,
				Math.abs(x.bounds[key][k] - y.bounds[key][k]),
			);
}
if (source.triangles !== web.triangles || maxBoundsDelta > 0.002)
	throw Error("Geometry fidelity check failed");
const report = {
	source,
	web,
	maxBoundsDeltaM: maxBoundsDelta,
	toleranceM: 0.002,
	scope:
		"Per-mesh world bounding boxes, names, primitive and total triangle counts. Not a per-vertex or engineering dimensional certification. 16-bit position quantization only in web display copy.",
};
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + "\n");
console.log(
	JSON.stringify({
		sourceMeshes: source.meshes,
		webMeshes: web.meshes,
		triangles: web.triangles,
		maxBoundsDeltaM: maxBoundsDelta,
	}),
);
