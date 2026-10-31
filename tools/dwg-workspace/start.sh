#!/bin/sh
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
VENV="$ROOT/exports/dwg-workspace-venv"
if [ ! -x "$VENV/bin/python" ]; then
  echo 'Creating local Python environment and installing drawing dependencies...'
  python3 -m venv "$VENV"
  "$VENV/bin/python" -m pip install -r "$ROOT/scripts/requirements-dwg.txt"
fi
if ! command -v dwg2dxf >/dev/null 2>&1; then
  echo 'DWG conversion needs LibreDWG: brew install libredwg (DXF opening is still available).'
fi
exec "$VENV/bin/python" "$ROOT/tools/dwg-workspace/server.py"
