#!/usr/bin/env python3
"""Package the checked full-detail GLB without rewriting a decoded byte.

This authoring command never uploads, publishes, or writes inside web/.
Run from any directory; all inputs and outputs are repository-relative.
"""

import argparse
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import struct
import sys
import tempfile
import zlib


ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / "exports/sharing/Thach-Bi-full-detail-2026-10-08.glb"
DELIVERY = ROOT / "exports/sharing/delivery-2026-10-08.json"
PROVENANCE = ROOT / "exports/sharing/source-manifest-2026-10-08.json"
OUTPUT = ROOT / "exports/private-review"
MANIFEST = OUTPUT / "manifest.json"
BLOCK = 1024 * 1024
JSON_CHUNK = 0x4E4F534A
BIN_CHUNK = 0x004E4942


def fail(message):
    raise ValueError(message)


def relative(path):
    return path.relative_to(ROOT).as_posix()


def digest_file(path):
    sha = hashlib.sha256()
    length = 0
    with path.open("rb") as source:
        while block := source.read(BLOCK):
            sha.update(block)
            length += len(block)
    return {"bytes": length, "sha256": sha.hexdigest()}


def inspect_glb(path):
    """Inspect framing and every URI field, including extension payloads."""
    length = path.stat().st_size
    with path.open("rb") as source:
        header = source.read(12)
        if len(header) != 12:
            fail("Truncated GLB header")
        magic, version, declared_length = struct.unpack("<III", header)
        if magic != 0x46546C67 or version != 2 or declared_length != length:
            fail("Invalid GLB v2 header or length")
        chunks = []
        document = None
        while source.tell() < length:
            chunk_header = source.read(8)
            if len(chunk_header) != 8:
                fail("Truncated GLB chunk header")
            size, kind = struct.unpack("<II", chunk_header)
            if size % 4 or source.tell() + size > length:
                fail("Invalid GLB chunk alignment or bounds")
            if not chunks and kind != JSON_CHUNK:
                fail("GLB does not begin with JSON")
            if kind == JSON_CHUNK:
                if document is not None:
                    fail("Duplicate GLB JSON chunk")
                document = json.loads(source.read(size))
            else:
                source.seek(size, io.SEEK_CUR)
            chunks.append({"type": "JSON" if kind == JSON_CHUNK else "BIN", "bytes": size})
        if document is None or [c["type"] for c in chunks] != ["JSON", "BIN"]:
            fail("Expected exactly one JSON and one embedded BIN chunk")
        # Check actual chunk types too; an unknown type must not be called BIN.
        source.seek(12 + 8 + chunks[0]["bytes"])
        if struct.unpack("<II", source.read(8))[1] != BIN_CHUNK:
            fail("Unexpected GLB chunk type")

    if document.get("asset", {}).get("version") != "2.0":
        fail("Unexpected glTF asset version")

    uri_count = 0

    def check_uris(value):
        nonlocal uri_count
        if isinstance(value, dict):
            for key, child in value.items():
                if key.lower() == "uri":
                    uri_count += 1
                    # This exact source must be completely embedded. Even data:
                    # URIs are unexpected and would need a new reviewed package.
                    fail("Unexpected resource URI in full-detail GLB")
                check_uris(child)
        elif isinstance(value, list):
            for child in value:
                check_uris(child)

    check_uris(document)
    buffers = document.get("buffers", [])
    if len(buffers) != 1:
        fail("Expected one embedded glTF buffer")
    buffer_length = buffers[0].get("byteLength")
    if not isinstance(buffer_length, int) or not 0 <= chunks[1]["bytes"] - buffer_length <= 3:
        fail("Embedded buffer does not match the BIN chunk")
    views = document.get("bufferViews", [])
    for view in views:
        offset, size = view.get("byteOffset", 0), view.get("byteLength")
        if (view.get("buffer") != 0 or not isinstance(offset, int)
                or not isinstance(size, int) or offset < 0 or size < 0
                or offset + size > buffer_length):
            fail("Invalid embedded bufferView")
    for image in document.get("images", []):
        view = image.get("bufferView")
        if (not isinstance(view, int) or not 0 <= view < len(views)
                or image.get("mimeType") != "image/png"):
            fail("Expected every texture image to be embedded PNG data")
    return {
        "version": 2,
        "assetVersion": document["asset"]["version"],
        "generator": document["asset"].get("generator"),
        "chunks": chunks,
        "counts": {key: len(document.get(key, [])) for key in
                   ("scenes", "nodes", "meshes", "materials", "textures", "images",
                    "buffers", "bufferViews", "accessors", "animations")},
        "imageMimeTypes": sorted({image["mimeType"] for image in document.get("images", [])}),
        "extensionsUsed": document.get("extensionsUsed", []),
        "extensionsRequired": document.get("extensionsRequired", []),
        "resourceUriCount": uri_count,
        "embeddedOnly": True,
    }


class DigestSink:
    """A write-only sink for independently replaying the gzip byte stream."""

    def __init__(self):
        self.sha = hashlib.sha256()
        self.length = 0

    def write(self, data):
        self.sha.update(data)
        self.length += len(data)
        return len(data)

    def result(self):
        return {"bytes": self.length, "sha256": self.sha.hexdigest()}


def compress_to(sink):
    # GzipFile rather than gzip.compress fixes OS=255 across supported Python
    # versions. Empty filename omits FNAME; mtime=0 omits wall-clock variation.
    with gzip.GzipFile(filename="", mode="wb", compresslevel=9,
                       fileobj=sink, mtime=0) as compressed:
        with SOURCE.open("rb") as source:
            while block := source.read(BLOCK):
                compressed.write(block)


def roundtrip_digest(path):
    sha = hashlib.sha256()
    length = 0
    # Reading to EOF also validates the gzip CRC32 and ISIZE trailer.
    with gzip.open(path, "rb") as source:
        while block := source.read(BLOCK):
            sha.update(block)
            length += len(block)
    return {"bytes": length, "sha256": sha.hexdigest()}


def check_location():
    # A symlink must not redirect staging into a web build or another checkout.
    if OUTPUT.resolve() != OUTPUT or SOURCE.resolve() != SOURCE:
        fail("Private package/source paths must not be symlinked")
    if OUTPUT.is_relative_to(ROOT / "web"):
        fail("Private model must remain outside web/")


def package(verify):
    check_location()
    original = digest_file(SOURCE)
    delivery = json.loads(DELIVERY.read_text(encoding="utf-8"))
    entries = [entry for entry in delivery.get("files", []) if entry.get("file") == SOURCE.name]
    if len(entries) != 1 or original != {key: entries[0].get(key) for key in ("bytes", "sha256")}:
        fail("GLB does not match the checked delivery manifest")
    provenance = json.loads(PROVENANCE.read_text(encoding="utf-8"))
    if any(original[key] != provenance.get(key) for key in ("bytes", "sha256")):
        fail("GLB does not match the export source manifest")
    revision = provenance.get("sourceCommit")
    if not isinstance(revision, str) or len(revision) != 40 or any(c not in "0123456789abcdef" for c in revision):
        fail("Missing immutable source Git revision")
    inspection = inspect_glb(SOURCE)
    target = OUTPUT / (SOURCE.name + ".gz")
    if verify:
        if not target.is_file() or not MANIFEST.is_file():
            fail("Private package is missing; run without --verify first")
        compressed = digest_file(target)
    else:
        OUTPUT.mkdir(parents=True, exist_ok=True)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=OUTPUT, prefix=".package-", suffix=".glb.gz", delete=False) as sink:
                temporary = Path(sink.name)
                compress_to(sink)
            compressed = digest_file(temporary)
            if roundtrip_digest(temporary) != original:
                fail("Gzip roundtrip changed the decoded GLB")
            # Link creates the final filename exclusively: an earlier delivery
            # is preserved unless its bytes already match the same package.
            try:
                os.link(temporary, target)
            except FileExistsError:
                if digest_file(target) != compressed:
                    fail("Existing gzip differs; preserve it and review a new release")
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)

    with target.open("rb") as source:
        if source.read(10) != bytes.fromhex("1f8b08000000000002ff"):
            fail("Unexpected gzip header: expected level 9, zero time, no filename, OS 255")
    replay = DigestSink()
    compress_to(replay)
    if replay.result() != compressed:
        fail("Independent gzip replay is not byte-for-byte deterministic")
    roundtrip = roundtrip_digest(target)
    if roundtrip != original:
        fail("Packaged GLB fails decoded-length/hash verification")

    manifest = {
        "schemaVersion": 1,
        "releaseId": "private-full-detail-20261008",
        "classification": "private-review",
        "status": "design-development-not-for-construction",
        "sourceCommit": revision,
        "source": {"file": relative(SOURCE), **original},
        "deliveryManifest": {"file": relative(DELIVERY), **digest_file(DELIVERY)},
        "exportSourceManifest": {"file": relative(PROVENANCE), **digest_file(PROVENANCE)},
        "package": {"file": relative(target), "mimeType": "model/gltf-binary",
                    "contentEncoding": "gzip", **compressed},
        "compression": {"method": "gzip", "level": 9, "mtime": 0,
                        "filenameHeader": "", "osHeader": 255, "streamBlockBytes": BLOCK,
                        "pythonVersion": platform.python_version(),
                        "zlibBuildVersion": zlib.ZLIB_VERSION,
                        "zlibRuntimeVersion": zlib.ZLIB_RUNTIME_VERSION},
        "verification": {"deliveryHashMatch": True, "sourceManifestHashMatch": True,
                         "deterministicReplayMatch": True, "roundtripHashMatch": True,
                         "decoded": roundtrip, "glb": inspection},
        "units": provenance.get("units"),
        "axes": provenance.get("axes"),
        "profile": provenance.get("profile"),
        "limitations": [
            "Architectural display model; the engineering simulator and its controls/results are absent.",
            "No decoded-byte, geometry, material, texture, or coordinate changes were made by this package.",
            "Optional EXT_materials_bump requires explicit loader support; generic GLB rendering can differ.",
            "Omitted equipment does not prove concealment; central-view/fan constraints and engineering holds remain.",
            "Lighting, speech/feedback, airflow, mounting/maintenance, route/control and specialist approvals remain unresolved.",
            "Authentication, storage access, cache policy, browser rendering and cloud delivery are separate verification work.",
        ],
    }
    encoded = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    if MANIFEST.exists():
        if MANIFEST.read_bytes() != encoded:
            fail("Existing manifest differs; preserve it and review the inputs/runtime")
    elif verify:
        fail("Private package manifest is missing")
    else:
        with MANIFEST.open("xb") as output:
            output.write(encoded)
    print(json.dumps({"result": "verified" if verify else "packaged",
                      "source": original, "package": compressed,
                      "manifest": relative(MANIFEST),
                      "embeddedOnly": inspection["embeddedOnly"],
                      "resourceUriCount": inspection["resourceUriCount"]}, indent=2))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify", action="store_true", help="Verify the existing package without writing files")
    args = parser.parse_args()
    try:
        package(args.verify)
    except (OSError, ValueError, KeyError, TypeError, struct.error, zlib.error, EOFError) as error:
        print(f"Private model package failed: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
