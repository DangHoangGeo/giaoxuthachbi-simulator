#!/usr/bin/env python3
"""Repeat the approved phase 01 baseline checks and retain local evidence."""
from __future__ import annotations

from datetime import datetime, timezone
import hashlib
import json
import platform
from pathlib import Path
import re
import subprocess
import sys
import time

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
LOGS = OUT / "logs"
LOGS.mkdir(parents=True, exist_ok=True)

COMMANDS = [
    ("verify-model", ["node", "scripts/verify_model.cjs"], "pass"),
    ("verify-estimates", ["node", "scripts/verify_estimates.cjs"], "pass"),
    ("audit-report-1", ["node", "scripts/verify_simulator.cjs", "--report", "--estimates"], "pass"),
    ("audit-report-2", ["node", "scripts/verify_simulator.cjs", "--report", "--estimates"], "pass"),
    ("verify-simulator-strict", ["node", "scripts/verify_simulator.cjs"], "known-target-failure"),
    ("verify-electrical", ["node", "scripts/verify_simulator.cjs", "--electrical"], "pass"),
    ("validate-timber-package", ["python3", "docs/beams-roof-connections/validate.py"], "pass"),
]


def git(*args: str) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True)
    return result.stdout.decode("utf-8", errors="replace").strip()


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def tracked_code_hashes() -> dict[str, str]:
    paths = {
        ROOT / "scripts/verify_model.cjs",
        ROOT / "scripts/verify_estimates.cjs",
        ROOT / "scripts/verify_simulator.cjs",
        ROOT / "scripts/verify_concealed_routes.cjs",
        ROOT / "docs/beams-roof-connections/validate.py",
        ROOT / "docs/beams-roof-connections/requirements.json",
        ROOT / "docs/beams-roof-connections/image-manifest.json",
    }
    paths.update((ROOT / "Thach_Bi_Viewer").rglob("*.js"))
    manifest_path = ROOT / "docs/beams-roof-connections/image-manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    for entry in manifest["files"]:
        paths.add(manifest_path.parent / entry["file"])
    return {str(path.relative_to(ROOT)): sha256(path) for path in sorted(paths) if path.is_file()}


def parse_json_objects(raw: bytes) -> list[object]:
    text = raw.decode("utf-8", errors="replace")
    decoder = json.JSONDecoder()
    objects = []
    index = 0
    while index < len(text):
        start = text.find("{", index)
        if start < 0:
            break
        try:
            value, end = decoder.raw_decode(text, start)
        except json.JSONDecodeError:
            index = start + 1
            continue
        objects.append(value)
        index = end
    return objects


IGNORED_KEYS = {"buildMs", "runtimeMs", "elapsedMs", "durationMs"}


def without_runtime(value: object) -> object:
    if isinstance(value, dict):
        return {
            key: without_runtime(child)
            for key, child in value.items()
            if key not in IGNORED_KEYS and "timestamp" not in key.lower()
        }
    if isinstance(value, list):
        return [without_runtime(child) for child in value]
    return value


def numeric_leaves(value: object, prefix: str = "$") -> list[dict[str, object]]:
    leaves: list[dict[str, object]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            if key in IGNORED_KEYS or "timestamp" in key.lower():
                continue
            leaves.extend(numeric_leaves(child, f"{prefix}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            leaves.extend(numeric_leaves(child, f"{prefix}[{index}]"))
    elif isinstance(value, (int, float)) and not isinstance(value, bool):
        leaves.append({"field": prefix, "value": value})
    return leaves


def command_record(label: str, argv: list[str], expected: str) -> dict[str, object]:
    started_at = datetime.now(timezone.utc).isoformat()
    start = time.perf_counter()
    completed = subprocess.run(argv, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
    elapsed = time.perf_counter() - start
    finished_at = datetime.now(timezone.utc).isoformat()
    log_path = LOGS / f"{label}.log"
    log_path.write_bytes(completed.stdout)
    return {
        "label": label,
        "command": argv,
        "cwd": str(ROOT),
        "startedAt": started_at,
        "finishedAt": finished_at,
        "runtimeSeconds": round(elapsed, 6),
        "exitCode": completed.returncode,
        "expected": expected,
        "log": str(log_path.relative_to(OUT)),
        "logSha256": sha256(log_path),
        "jsonObjects": parse_json_objects(completed.stdout),
        "rawOutput": completed.stdout,
    }


node_version = subprocess.run(["node", "--version"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
python_version = subprocess.run(["python3", "--version"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, check=False)
source_before = tracked_code_hashes()
metadata: dict[str, object] = {
    "baseline": "approved engineering phase01 repeated checks",
    "capturedAtUtc": datetime.now(timezone.utc).isoformat(),
    "repository": str(ROOT),
    "gitHead": git("rev-parse", "HEAD"),
    "gitTree": git("rev-parse", "HEAD^{tree}"),
    "gitStatusBeforeRuns": git("status", "--short"),
    "runtimeEnvironment": {
        "platform": platform.platform(),
        "system": platform.system(),
        "release": platform.release(),
        "machine": platform.machine(),
        "python": python_version.stdout.decode("utf-8", errors="replace").strip(),
        "pythonExecutable": sys.executable,
        "node": node_version.stdout.decode("utf-8", errors="replace").strip(),
    },
    "sourceSha256BeforeRuns": source_before,
    "runs": [],
    "stoppedEarly": False,
    "stopReason": None,
}

runs: list[dict[str, object]] = []
for label, argv, expected in COMMANDS:
    record = command_record(label, argv, expected)
    runs.append(record)
    # Stop on an unexpected invariant failure. The strict simulator invocation
    # may fail only at its known warning gate; later independent checks still run.
    if expected == "pass" and record["exitCode"] != 0:
        metadata["stoppedEarly"] = True
        metadata["stopReason"] = f"{label} exited {record['exitCode']}; stopped after unexpected invariant failure."
        break
    if expected == "known-target-failure":
        text = record["rawOutput"].decode("utf-8", errors="replace")
        known = record["exitCode"] != 0 and "AssertionError [ERR_ASSERTION]: No design warnings:" in text
        record["knownFailureConfirmed"] = known
        if record["exitCode"] != 0 and not known:
            metadata["stoppedEarly"] = True
            metadata["stopReason"] = "Strict simulator failed outside the documented No design warnings target gate."
            break

metadata["runs"] = [{key: value for key, value in r.items() if key != "rawOutput"} for r in runs]
metadata["gitStatusAfterRuns"] = git("status", "--short")
source_after = tracked_code_hashes()
metadata["sourceSha256AfterRuns"] = source_after
metadata["sourceHashesStable"] = source_before == source_after

reports = [r for r in runs if r["label"] in ("audit-report-1", "audit-report-2")]
comparison: dict[str, object] = {
    "fieldsCompared": "All JSON objects emitted by both --report --estimates runs; every leaf except runtime fields and timestamp-named keys.",
    "ignoredFields": sorted(IGNORED_KEYS) + ["any key containing 'timestamp' (case-insensitive)"],
    "numericTolerance": 0,
    "interpretation": "Exact equality of emitted numeric values (which the verifier rounds before printing); no numeric tolerance applied.",
}
if len(reports) == 2:
    left_objects = reports[0]["jsonObjects"]
    right_objects = reports[1]["jsonObjects"]
    left_normalized = without_runtime(left_objects)
    right_normalized = without_runtime(right_objects)
    comparison.update({
        "audit1JsonObjectCount": len(left_objects),
        "audit2JsonObjectCount": len(right_objects),
        "numericFieldCount": sum(len(numeric_leaves(obj)) for obj in left_objects),
        "numericFields": [leaf for obj in left_objects for leaf in numeric_leaves(obj)],
        "reproducible": left_normalized == right_normalized,
    })
    (OUT / "audit-report-1.json").write_text(json.dumps(left_objects, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (OUT / "audit-report-2.json").write_text(json.dumps(right_objects, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
else:
    comparison.update({"reproducible": None, "reason": "Both repeated report runs did not complete."})
metadata["auditComparison"] = comparison

for record in runs:
    record.pop("rawOutput", None)

(OUT / "summary.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

# Human-readable index mirrors the machine-readable record without replacing logs.
lines = [
    "Approved engineering phase01 baseline check capture",
    f"Repository HEAD: {metadata['gitHead']}",
    f"Repository tree: {metadata['gitTree']}",
    f"Runtime: {metadata['runtimeEnvironment']['node']}; {metadata['runtimeEnvironment']['python']}; {metadata['runtimeEnvironment']['platform']}",
    "",
    "Runs:",
]
for record in runs:
    lines.append(f"- {record['label']}: exit {record['exitCode']} in {record['runtimeSeconds']} s; log `{record['log']}`")
    if "knownFailureConfirmed" in record:
        lines.append(f"  Known strict-target failure confirmed: {record['knownFailureConfirmed']}")
lines.extend([
    "",
    f"Repeated audit reproducible: {comparison.get('reproducible')}",
    f"Numeric leaves compared: {comparison.get('numericFieldCount', 0)}; emitted-value tolerance: 0; runtime/timestamp fields ignored.",
    f"Source hashes stable: {metadata['sourceHashesStable']}",
    f"Stopped early: {metadata['stoppedEarly']}; reason: {metadata['stopReason']}",
    "",
    "Unmet design targets remain recorded by the audit and are not treated as passed by calculation checks.",
])
(OUT / "README.txt").write_text("\n".join(lines) + "\n", encoding="utf-8")

print(json.dumps({
    "head": metadata["gitHead"],
    "runs": [{"label": r["label"], "exitCode": r["exitCode"], "runtimeSeconds": r["runtimeSeconds"], "log": r["log"]} for r in runs],
    "auditReproducible": comparison.get("reproducible"),
    "sourceHashesStable": metadata["sourceHashesStable"],
    "stoppedEarly": metadata["stoppedEarly"],
    "stopReason": metadata["stopReason"],
}, indent=2))
