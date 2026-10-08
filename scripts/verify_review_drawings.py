#!/usr/bin/env python3
"""Independently check the generated A3 electrical review set without writing it.

Run from the repository root after build_review_drawings.py:
    python3 scripts/verify_review_drawings.py [--output output/pdf]

Requires pypdf, pdfplumber and the builder's reportlab dependency. Counts come
from the snapshot, so adding/removing equipment does not require editing this
check. PDF text/bounding boxes are a screening check, not visual QA, engineering
approval, cable quantities or construction certification.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
import copy
import csv
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import re
import subprocess
import sys
from unittest.mock import patch

try:
    from pypdf import PdfReader
    import pdfplumber
except ImportError as exc:
    raise SystemExit(
        "Install verification dependencies: python3 -m pip install pypdf pdfplumber reportlab"
    ) from exc

ROOT = Path(__file__).resolve().parents[1]
MM = 72 / 25.4
PDF_NAME = "thach-bi-electrical-review-A3.pdf"
EXPECTED_FILES = {
    PDF_NAME, "model-snapshot.json", "drawing-index.json",
    "route-vertices.csv", "equipment-coordinates.csv",
}
HASH_RE = re.compile(r"[0-9a-f]{64}\Z")


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


class Checks:
    def __init__(self):
        self.failed = 0
        self.warnings = []

    def run(self, name, function):
        try:
            detail = function()
        except (AssertionError, ValueError, KeyError, TypeError, OSError) as exc:
            self.failed += 1
            print(f"FAIL {name}: {exc}")
        else:
            print(f"PASS {name}" + (f": {detail}" if detail else ""))

    def warn(self, message):
        self.warnings.append(message)
        print(f"WARN {message}")


def unique_index(rows, label):
    result = {row["id"]: row for row in rows}
    require(len(result) == len(rows), f"Duplicate {label} IDs")
    return result


def compare_ids(actual, expected, label):
    missing, extra = set(expected) - set(actual), set(actual) - set(expected)
    require(not missing and not extra,
            f"{label} missing {sorted(missing)}; unexpected {sorted(extra)}")


def file_checks(output, data, manifest):
    require(manifest.get("schema") == 1 and data.get("schema") == 1,
            "Unsupported manifest/snapshot schema")
    require(data["full"]["units"] == "metres", "Snapshot units must be metres")
    require("not for construction" in manifest["status"].lower(),
            "Manifest does not identify the construction hold")
    compare_ids(manifest["files"], EXPECTED_FILES, "Generated files")
    for name, checksum in manifest["files"].items():
        require(HASH_RE.fullmatch(checksum), f"Invalid file hash: {name}")
        require(digest(output / name) == checksum, f"Stale or altered output: {name}")
    sources = manifest["sourceFiles"]
    require(sources, "Manifest source-file hashes are empty")
    for name, checksum in sources.items():
        path = (ROOT / name).resolve()
        require(path.is_relative_to(ROOT), f"Source path outside repository: {name}")
        require(HASH_RE.fullmatch(checksum), f"Invalid source hash: {name}")
        require(digest(path) == checksum, f"Source changed since export: {name}")
    expected_model_sources = json.loads(subprocess.check_output(
        ["node", "-e",
         "process.stdout.write(JSON.stringify(require('./scripts/lib/study_model.cjs').sources))"],
        cwd=ROOT, text=True,
    ))
    required_sources = set(expected_model_sources) | {
        "scripts/lib/study_model.cjs", "scripts/export_print_model.cjs",
        "scripts/build_review_drawings.py",
    }
    require(required_sources <= set(sources),
            f"Manifest omits dependencies: {sorted(required_sources - set(sources))}")
    require(set(expected_model_sources) <= set(data["sourceFiles"]),
            "Snapshot omits a loaded model dependency")
    for name, checksum in data["sourceFiles"].items():
        require(sources.get(name) == checksum, f"Manifest/snapshot source mismatch: {name}")
    systems_hash = digest(ROOT / "docs/electrical-grid/electrical-systems.json")
    require(manifest["systemsHash"] == data["registerSystemsHash"] == systems_hash,
            "Manifest/snapshot/saved systems hash mismatch")
    require(data["full"] == json.loads(
        (ROOT / "docs/electrical-grid/electrical-systems.json").read_text()),
        "Snapshot is not the matching saved electrical design")
    require(manifest["gitRevision"] == data["gitRevision"],
            "Manifest/snapshot source commit mismatch")
    return f"{len(EXPECTED_FILES)} outputs; {len(sources)} source hashes"


def csv_checks(output, equipment, routes):
    with (output / "route-vertices.csv").open(newline="") as stream:
        reader = csv.DictReader(stream)
        require(reader.fieldnames == ["Route ID", "Vertex (1-based)", "X m", "Y m", "Z m"],
                "Unexpected route CSV columns")
        vertices = {}
        for row in reader:
            key = row["Route ID"], int(row["Vertex (1-based)"])
            require(key not in vertices, f"Repeated route vertex: {key}")
            point = [float(row[k]) for k in ("X m", "Y m", "Z m")]
            require(all(math.isfinite(value) for value in point), f"Invalid vertex: {key}")
            vertices[key] = point
    expected = {(route_id, i): p for route_id, route in routes.items()
                for i, p in enumerate(route["points"], 1)}
    compare_ids(vertices, expected, "CSV route vertices")
    require(vertices == expected, "CSV route coordinates lose precision or differ from snapshot")
    lengths = {}
    for route_id, route in routes.items():
        points = [vertices[(route_id, i)] for i in range(1, len(route["points"]) + 1)]
        require(len(points) >= 2, f"Route has no independent endpoints: {route_id}")
        length = math.fsum(math.sqrt(math.fsum((b[d] - a[d]) ** 2 for d in range(3)))
                           for a, b in zip(points, points[1:]))
        require(abs(length - route["length"]) < 1e-6,
                f"Independent 3D length differs: {route_id}")
        lengths[route_id] = length
    with (output / "equipment-coordinates.csv").open(newline="") as stream:
        reader = csv.DictReader(stream)
        require(reader.fieldnames == ["ID", "Circuit", "Board", "X m", "Y m", "Z m",
                                      "Provisional product category"],
                "Unexpected equipment CSV columns")
        records = list(reader)
    index = {row["ID"]: row for row in records}
    require(len(index) == len(records), "Repeated equipment CSV ID")
    compare_ids(index, equipment, "CSV equipment")
    for item_id, component in equipment.items():
        row = index[item_id]
        require([float(row[k]) for k in ("X m", "Y m", "Z m")] == component["position"],
                f"CSV equipment position loses precision: {item_id}")
        require(row["Circuit"] == component["circuit"] and row["Board"] == component["board"],
                f"CSV circuit/board mismatch: {item_id}")
        require(row["Provisional product category"] == component["product"],
                f"CSV provisional product category mismatch: {item_id}")
    return lengths, len(vertices)


def fragments(page):
    """Use the PDF's independent text operators; each table cell is a text run."""
    result = []

    def visitor(text, cm, tm, font, font_size):
        text = text.strip()
        if not text:
            return
        # PDF text position after the current transformation matrix.
        x = tm[4] * cm[0] + tm[5] * cm[2] + cm[4]
        y = tm[4] * cm[1] + tm[5] * cm[3] + cm[5]
        result.append({"text": text, "x": x, "y": y, "size": font_size})

    page.extract_text(visitor_text=visitor)
    return result


def baseline_rows(runs):
    groups = defaultdict(list)
    for run in runs:
        groups[round(run["y"], 2)].append(run)
    return [sorted(row, key=lambda run: run["x"])
            for _, row in sorted(groups.items(), reverse=True)]


def table_rows(runs, header):
    rows = baseline_rows(runs)
    headers = [row for row in rows if [r["text"] for r in row] == header]
    require(len(headers) == 1, f"Missing or ambiguous PDF table header: {header}")
    y_header = headers[0][0]["y"]
    body = [row for row in rows if 20 * MM < row[0]["y"] < y_header - 1]
    require(all(len(row) == len(header) for row in body),
            "Table row has missing, overlapping or unexpected cells")
    return body


def pdf_checks(output, data, manifest, index, equipment, routes, lengths, checks):
    reader = PdfReader(str(output / PDF_NAME))
    require(not reader.is_encrypted, "Review PDF is encrypted")
    require(len(reader.pages) == len(index) == manifest["counts"]["pages"],
            "PDF/index/manifest page count differs")
    require([row["page"] for row in index] == list(range(1, len(index) + 1)),
            "Drawing index page numbers are not contiguous")
    require(len({row["sheet"] for row in index}) == len(index), "Drawing sheet IDs repeat")
    for key, expected in [("equipment", len(equipment)), ("routes", len(routes)),
                          ("vertices", sum(len(r["points"]) for r in routes.values()))]:
        require(manifest["counts"][key] == expected, f"Manifest {key} count differs")
    pages, all_runs = [], []
    for number, (page, entry) in enumerate(zip(reader.pages, index), 1):
        require(abs(float(page.mediabox.width) - 420 * MM) < .1 and
                abs(float(page.mediabox.height) - 297 * MM) < .1,
                f"Page {number} is not landscape A3")
        require(int(page.get("/Rotate", 0)) % 360 == 0, f"Page {number} has unexpected rotation")
        runs = fragments(page)
        text = "\n".join(run["text"] for run in runs)
        for label in [entry["sheet"], "NOT FOR CONSTRUCTION", "DESIGN DEVELOPMENT",
                      "MODEL TRANSCRIPTION / DERIVED.", "Print 100% / no fit-to-page",
                      f"A3 / sheet {number:02}", data["gitRevision"][:10],
                      data["full"]["routingRevision"]]:
            require(label in text, f"Page {number} omits its title/footer/hold: {label}")
        require(any(run["text"] == entry["sheet"] and run["y"] > 250 * MM for run in runs),
                f"Page {number} sheet code is not in its title block")
        pages.append(text)
        all_runs.append(runs)

    eq_rows, route_rows, plan_ids = [], [], []
    refs = {route_id: f"R{n:03}" for n, route_id in enumerate(routes, 1)}
    for entry, runs in zip(index, all_runs):
        if entry["sheet"].startswith("EQ-"):
            eq_rows += table_rows(runs, ["ID", "Circuit", "Board", "Provisional category",
                                          "Model equipment name"])
        elif entry["sheet"].startswith("RI-"):
            route_rows += table_rows(runs, ["Ref", "Stable route ID", "From", "Circuit/zone",
                                              "Equipment / context", "Drawn m", "Audio home run m"])
        elif re.fullmatch(r"E-\d{3}(?:-\d+)?", entry["sheet"]) and entry["sheet"] != "E-000":
            # Right-hand coordinate table: use its printed ID/X/Y/Z headings,
            # rather than accidentally counting a label elsewhere in the plan.
            rows = baseline_rows(runs)
            headers = [row for row in rows if [r["text"] for r in row[:4]] == ["ID", "X", "Y", "Z"]]
            require(len(headers) == 1, f"Coordinate headings missing on {entry['sheet']}")
            positions = [r["x"] for r in headers[0][:4]]
            for row in rows:
                cells = [r for r in row if r["x"] >= positions[0] - .1]
                if not cells or cells[0]["text"] not in equipment:
                    continue
                require(len(cells) >= 4 and all(abs(cells[d]["x"] - positions[d]) < .1 for d in range(4)),
                        f"Equipment coordinate columns do not align: {cells[0]['text']}")
                item_id = cells[0]["text"]
                for actual, expected in zip(cells[1:4], equipment[item_id]["position"]):
                    require(abs(float(actual["text"]) - expected) <= .0005001,
                            f"Printed equipment coordinate differs: {item_id}")
                plan_ids.append(item_id)
    compare_ids([r[0]["text"] for r in eq_rows], equipment, "PDF equipment schedule IDs")
    require(Counter(r[0]["text"] for r in eq_rows) == Counter({key: 1 for key in equipment}),
            "PDF equipment schedule repeats or omits an installed item")
    for row in eq_rows:
        item = equipment[row[0]["text"]]
        require(row[1]["text"] == item["circuit"] and row[2]["text"] == item["board"],
                f"PDF equipment circuit/board differs: {item['id']}")
    compare_ids(plan_ids, equipment, "PDF plan coordinate table IDs")
    require(Counter(plan_ids) == Counter({key: 1 for key in equipment}),
            "Plan coordinate tables repeat or omit an installed item")
    compare_ids([r[1]["text"] for r in route_rows], routes, "PDF stable route IDs")
    require(Counter(r[1]["text"] for r in route_rows) == Counter({key: 1 for key in routes}),
            "PDF unique route index repeats or omits a run")
    for row in route_rows:
        values = [run["text"] for run in row]
        route_id = values[1]
        route = routes[route_id]
        require(values[0] == refs[route_id], f"PDF route reference differs: {route_id}")
        require(values[2] == route["source"] and values[3] == route["circuit"],
                f"PDF route source/circuit differs: {route_id}")
        expected_endpoint = ",".join(route["itemIds"]) if route["role"] in ("drop", "local") else "Shared context"
        require(values[4] == expected_endpoint, f"PDF endpoint/context differs: {route_id}")
        require(abs(float(values[5]) - lengths[route_id]) <= .0050001,
                f"Printed geometric length differs: {route_id}")
        if route.get("homeRun"):
            require(abs(float(values[6]) - lengths[route_id] - route.get("upstreamLength", 0)) <= .0050001,
                    f"Printed audio home-run length differs: {route_id}")
        else:
            require(values[6] == "-", f"Non-home-run has an audio cable quantity: {route_id}")
    require(len({s["id"] for s in data["sheets"]}) == len(data["sheets"]), "Drawing scopes repeat")
    expected_circuits = {item["circuit"] for item in equipment.values()}
    require({s["id"] for s in data["sheets"]} == expected_circuits | {"distribution"},
            "Drawing scopes do not dynamically cover current circuits")
    return f"{len(reader.pages)} A3 pages; exact ID coverage; coordinates and 3D lengths"


def layout_checks(output, checks):
    tiny = Counter()
    collisions, offpage = [], []
    with pdfplumber.open(output / PDF_NAME) as pdf:
        for number, page in enumerate(pdf.pages, 1):
            for char in page.chars:
                if not char["text"].strip():
                    continue
                if min(char["x0"], char["top"]) < -.1 or char["x1"] > page.width + .1 or char["bottom"] > page.height + .1:
                    offpage.append((number, char["text"], round(char["x0"], 1), round(char["top"], 1)))
                if char["size"] < 5.5 - .01:
                    tiny[number] += 1
            # Char boxes are fonts' bounding boxes. Ignore touching boundaries;
            # report material overlap between separate baselines or text runs.
            chars = [c for c in page.chars if c["text"].strip()]
            by_band = defaultdict(list)
            for c in chars:
                band = int(c["top"] // 20)
                for b in range(band - 1, band + 2):
                    by_band[b].append(c)
            seen = set()
            for c in chars:
                for other in by_band[int(c["top"] // 20)]:
                    pair = tuple(sorted((id(c), id(other))))
                    if c is other or pair in seen:
                        continue
                    seen.add(pair)
                    dx = min(c["x1"], other["x1"]) - max(c["x0"], other["x0"])
                    dy = min(c["bottom"], other["bottom"]) - max(c["top"], other["top"])
                    if dx > .75 and dy > min(c["height"], other["height"]) * .25:
                        collisions.append((number, c["text"] + "/" + other["text"],
                                           round(max(c["x0"], other["x0"]), 1),
                                           round(max(c["top"], other["top"]), 1)))
    require(not offpage, f"Off-page text: {offpage[:12]}")
    require(not tiny, f"Unreadably small text below 5.5 pt: {dict(tiny)}")
    if collisions:
        checks.warn(f"Text-box overlap candidates {len(collisions)}; inspect pages "
                    f"{sorted({r[0] for r in collisions})}; examples {collisions[:8]}")
    return "No off-page text or text below 5.5 pt; overlaps remain a visual-screening concern"


def refusal_checks(output, data):
    # Import only the validator. Suppress bytecode files and do not call generate.
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location("review_drawing_builder", ROOT / "scripts/build_review_drawings.py")
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    builder.validate(data)
    before = {p.name: digest(p) for p in output.iterdir() if p.is_file()}
    rejected = []

    def refuses(name, probe):
        try:
            builder.validate(probe)
        except (AssertionError, ValueError):
            rejected.append(name)
        else:
            raise ValueError(f"Builder accepts invalid snapshot: {name}")

    probe = copy.deepcopy(data)
    probe["full"]["routes"][0]["points"][0][0] += .25
    refuses("stale route vertex", probe)
    probe = copy.deepcopy(data)
    next(c for c in probe["full"]["components"] if not c["hiddenAlternative"])["position"][0] += .25
    refuses("stale equipment position", probe)
    probe = copy.deepcopy(data)
    probe["sourceFiles"][next(iter(probe["sourceFiles"]))] = "0" * 64
    refuses("source hash mismatch", probe)
    probe = copy.deepcopy(data)
    probe["registerSystemsHash"] = "0" * 64
    refuses("snapshot systems hash mismatch", probe)
    probe = copy.deepcopy(data)
    probe["schema"] = 999
    refuses("unsupported schema", probe)
    probe = copy.deepcopy(data)
    probe["full"]["units"] = "millimetres"
    refuses("unsupported units", probe)

    category_path = ROOT / "docs/electrical-grid/categories/manifest.json"
    original_read = Path.read_text
    for field in ("systemsHash", "layoutHash", "workbook hash"):
        def altered_read(path, *args, **kwargs):
            result = original_read(path, *args, **kwargs)
            if path.resolve() == category_path:
                manifest = json.loads(result)
                if field == "workbook hash":
                    manifest["categories"][0]["sha256"] = "0" * 64
                else:
                    manifest[field] = "0" * 64
                return json.dumps(manifest)
            return result

        with patch.object(Path, "read_text", altered_read):
            refuses("category manifest " + field, data)
    require(before == {p.name: digest(p) for p in output.iterdir() if p.is_file()},
            "Validator altered a delivered output file")
    return f"{len(rejected)} invalid inputs rejected; delivered files untouched"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT / "output/pdf")
    args = parser.parse_args()
    output = args.output.resolve()
    checks = Checks()
    try:
        before = {name: digest(output / name) for name in EXPECTED_FILES | {"manifest.json"}}
        data = json.loads((output / "model-snapshot.json").read_text())
        manifest = json.loads((output / "manifest.json").read_text())
        index = json.loads((output / "drawing-index.json").read_text())
        equipment = unique_index([c for c in data["full"]["components"] if not c["hiddenAlternative"]], "equipment")
        routes = unique_index(data["full"]["routes"], "route")
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(f"FAIL Read review set: {exc}")
        return 1
    checks.run("File integrity and source freshness", lambda: file_checks(output, data, manifest))
    csv_result = {}

    def verify_csv():
        lengths, count = csv_checks(output, equipment, routes)
        csv_result["lengths"] = lengths
        return f"{count} lossless vertices/endpoints; {len(equipment)} equipment positions"

    checks.run("CSV reconciliation and independent lengths", verify_csv)
    if "lengths" in csv_result:
        checks.run("PDF geometry, identifiers and schedules", lambda: pdf_checks(
            output, data, manifest, index, equipment, routes, csv_result["lengths"], checks))
    checks.run("Text bounding-box screening", lambda: layout_checks(output, checks))
    checks.run("Builder stale-data refusal", lambda: refusal_checks(output, data))
    checks.run("Read-only delivered set", lambda: require(
        before == {name: digest(output / name) for name in EXPECTED_FILES | {"manifest.json"}},
        "Output files changed during verification; regenerate completed set and retry"))
    print(f"Result: {checks.failed} failed checks; {len(checks.warnings)} layout screening warnings.")
    print("These checks do not replace rendered-page inspection or qualified engineering approval.")
    return 1 if checks.failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
