"""Read-only ZIP/XML inventory. Writes evidence only beside this script.

Run with the bundled Python runtime recorded in inventory-method.json.
No workbook import/export, recalculation, rendering, simulation or network call.
"""

import collections
import csv
import datetime
import hashlib
import json
import pathlib
import posixpath
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
import zipfile

OUT = pathlib.Path(__file__).resolve().parent
ROOT = OUT.parents[2]
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
DIMENSIONS = "docs/layout_design/Thach_Bi_Church_Dimensions.xlsx"
CATEGORIES = ["lighting", "sound", "air-system", "exit-signs", "decoration", "distribution-controls"]
EXPECTED_SHEETS = ["Read me", "Equipment", "Electrical Lines", "Route Points"]
EQ_INPUTS = ["Manufacturer", "Product model", "Approved specs", "Datasheet / approval", "Manual control ID", "Control group", "Proposed X (m)", "Proposed Y (m)", "Proposed Z (m)", "Engineering notes"]
LINE_INPUTS = ["Allowance (m)", "Cable designation", "Core count", "Cross-section (mm2)", "Containment specification", "Manufacturer / product", "Control / terminal reference", "Approval reference", "Engineering notes"]
LAYOUT = "docs/electrical-grid/equipment-layout.json"
SYSTEMS = "docs/electrical-grid/electrical-systems.json"
MANIFEST = "docs/electrical-grid/categories/manifest.json"
SUMMARY = "docs/electrical-grid/summary-report.md"
SOURCE_FILES = [DIMENSIONS, LAYOUT, SYSTEMS, MANIFEST, SUMMARY, "docs/electrical-grid/register.md", "docs/electrical-grid/categories/README.md", "scripts/build_equipment_register.mjs", "scripts/usage_registers.mjs"] + [f"docs/electrical-grid/categories/{c}/register.xlsx" for c in CATEGORIES]


def fingerprint(relative):
    data = (ROOT / relative).read_bytes()
    return {"path": relative, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}


def write_json(name, value):
    if name in {"dimensions-workbook.json", "dimensions-focus.json", "category-register-records.json"}:
        text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    else:
        text = json.dumps(value, ensure_ascii=False, indent=2)
    (OUT / name).write_text(text + "\n", encoding="utf-8")


def write_csv(name, fieldnames, rows):
    with (OUT / name).open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def col_number(address):
    number = 0
    for letter in re.match(r"[A-Z]+", address).group():
        number = 26 * number + ord(letter) - 64
    return number


def col_letter(number):
    letters = ""
    while number:
        number, remainder = divmod(number - 1, 26)
        letters = chr(65 + remainder) + letters
    return letters


def present(value):
    return value is not None and value != ""


def cell_value(sheet, address):
    return sheet["cells"].get(address, {}).get("value")


def xlsx(relative):
    """Preserve decoded source strings, stored XML values and formula text."""
    result = {**fingerprint(relative), "sheets": []}
    with zipfile.ZipFile(ROOT / relative) as archive:
        assert archive.testzip() is None, f"CRC check failed: {relative}"
        result["zip_crc_check"] = "passed"
        strings = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = ET.fromstring(archive.read("xl/sharedStrings.xml"))
            strings = ["".join(node.text or "" for node in si.iter(f"{{{NS['m']}}}t")) for si in shared.findall("m:si", NS)]
        formats = {}
        styles = []
        if "xl/styles.xml" in archive.namelist():
            style_root = ET.fromstring(archive.read("xl/styles.xml"))
            formats = {int(f.attrib["numFmtId"]): f.attrib["formatCode"] for f in style_root.findall("m:numFmts/m:numFmt", NS)}
            styles = [int(f.attrib.get("numFmtId", 0)) for f in style_root.findall("m:cellXfs/m:xf", NS)]
        relationships = {r.attrib["Id"]: r.attrib["Target"] for r in ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))}
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        result["calculation_properties"] = workbook.find("m:calcPr", NS).attrib if workbook.find("m:calcPr", NS) is not None else None
        result["defined_names"] = [{**n.attrib, "text": n.text} for n in workbook.findall("m:definedNames/m:definedName", NS)]
        for sheet_node in workbook.findall("m:sheets/m:sheet", NS):
            target = relationships[sheet_node.attrib[REL_ID]]
            target = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
            xml = ET.fromstring(archive.read(target))
            sheet = {"name": sheet_node.attrib["name"], "state": sheet_node.attrib.get("state", "visible"), "xml_part": target, "cells": {}, "merged_ranges": [m.attrib["ref"] for m in xml.findall("m:mergeCells/m:mergeCell", NS)]}
            dimension = xml.find("m:dimension", NS)
            sheet["declared_dimension"] = dimension.attrib.get("ref") if dimension is not None else None
            for cell in xml.findall("m:sheetData/m:row/m:c", NS):
                address = cell.attrib["r"]
                kind = cell.attrib.get("t", "n")
                raw_node = cell.find("m:v", NS)
                raw = raw_node.text if raw_node is not None else None
                formula = cell.find("m:f", NS)
                value = raw
                if kind == "s" and raw is not None:
                    value = strings[int(raw)]
                elif kind == "inlineStr":
                    value = "".join(node.text or "" for node in cell.findall("m:is//m:t", NS))
                elif kind == "b" and raw is not None:
                    value = raw == "1"
                elif kind == "n" and raw is not None:
                    try:
                        value = int(raw) if re.fullmatch(r"[-+]?\d+", raw) else float(raw)
                    except ValueError:
                        pass
                if not present(value) and formula is None:
                    continue
                item = {"cell": address, "value": value, "xml_type": kind, "stored_xml_value": raw}
                if formula is not None:
                    item["formula"] = formula.text
                    item["formula_attributes"] = formula.attrib
                    item["value_is_saved_formula_cache"] = True
                if "s" in cell.attrib:
                    style = int(cell.attrib["s"])
                    item["style_index"] = style
                    if style < len(styles):
                        item["number_format_id"] = styles[style]
                        item["number_format"] = formats.get(styles[style])
                sheet["cells"][address] = item
            sheet["nonempty_or_formula_cells"] = len(sheet["cells"])
            sheet["formula_cells"] = sum("formula" in c for c in sheet["cells"].values())
            sheet["saved_error_cells"] = [c for c in sheet["cells"].values() if c["xml_type"] == "e"]
            result["sheets"].append(sheet)
    return result


def table(sheet, header_row, id_header):
    headers = {address: item["value"] for address, item in sheet["cells"].items() if int(re.search(r"\d+$", address).group()) == header_row}
    columns = {re.match(r"[A-Z]+", address).group(): value for address, value in headers.items()}
    assert id_header in columns.values(), f"Missing {id_header} in {sheet['name']}"
    id_column = next(c for c, h in columns.items() if h == id_header)
    row_numbers = sorted({int(re.search(r"\d+$", address).group()) for address in sheet["cells"]})
    rows = []
    for row in row_numbers:
        if row <= header_row or not present(cell_value(sheet, f"{id_column}{row}")):
            continue
        fields = {}
        for column, header in columns.items():
            address = f"{column}{row}"
            fields[header] = sheet["cells"].get(address, {"cell": address, "value": None, "xml_type": None, "stored_xml_value": None})
        rows.append({"row": row, "id": fields[id_header]["value"], "id_cell": f"{id_column}{row}", "fields": fields})
    return {"sheet": sheet["name"], "header_row": header_row, "headers": headers, "records": rows}


def value(row, header):
    return row["fields"].get(header, {}).get("value")


def flatten_csv(records, headers):
    output = []
    for row in records:
        item = {"row": row["row"], "id": row["id"], "id_cell": row["id_cell"]}
        for header in headers:
            field = row["fields"][header]
            item[header] = field["value"]
            item[header + " [cell]"] = field["cell"]
            item[header + " [formula]"] = field.get("formula")
            item[header + " [stored XML value]"] = field.get("stored_xml_value")
        output.append(item)
    return output


def loc(relative, sheet, cell):
    return {"path": relative, "sheet": sheet, "cell": cell}


before = {relative: fingerprint(relative) for relative in SOURCE_FILES}
dimensions_book = xlsx(DIMENSIONS)
dimension_tables = {}
for sheet in dimensions_book["sheets"]:
    assert sheet["name"] in ["Dimensions", "Model grid", "Open items", "Sources"]
    id_header = "Mã / ID" if sheet["name"] in ["Dimensions", "Open items"] else "File" if sheet["name"] == "Sources" else cell_value(sheet, "A7")
    parsed = table(sheet, 7, id_header)
    if sheet["name"] == "Sources":
        # Convention notes share column A but are not drawing-source records.
        # They remain intact in the sheet-level cell inventory.
        parsed["records"] = [r for r in parsed["records"] if isinstance(r["id"], int)]
    dimension_tables[sheet["name"]] = parsed
    csv_name = {"Dimensions": "dimension-records.csv", "Model grid": "model-grid-records.csv", "Open items": "open-items.csv", "Sources": "drawing-sources.csv"}[sheet["name"]]
    headers = list(parsed["headers"].values())
    write_csv(csv_name, ["row", "id", "id_cell"] + [key for header in headers for key in [header, header + " [cell]", header + " [formula]", header + " [stored XML value]"]], flatten_csv(parsed["records"], headers))
dimensions_book["tables"] = dimension_tables
write_json("dimensions-workbook.json", dimensions_book)

patterns = {
    "grid_and_bays": r"grid|axis_spacing|lưới|bay|gian|trục",
    "levels": r"elevation|level|datum|cao độ|cao do|cốt|floor|sàn|sân|court",
    "roof": r"roof|ridge|eave|purlin|truss|tile|mái|nóc|xà gồ|kèo",
    "wall_and_openings": r"wall|window|door|opening|arcade|tường|cửa|vòm",
    "columns_and_supports": r"column|post|support|footing|foundation|pilaster|cột|móng|timber|gỗ",
}
focus = {"source_path": DIMENSIONS, "source_sha256": before[DIMENSIONS]["sha256"], "selection_method": "Case-insensitive literal-source keyword inventory. Groups can overlap; no conflicts are resolved.", "groups": {}}
for name, pattern in patterns.items():
    focus["groups"][name] = [row for row in dimension_tables["Dimensions"]["records"] if re.search(pattern, "\n".join(str(f["value"]) for f in row["fields"].values() if present(f["value"])), re.IGNORECASE)]
focus["model_grid"] = dimension_tables["Model grid"]
focus["open_items"] = dimension_tables["Open items"]
focus["drawing_sources"] = dimension_tables["Sources"]
write_json("dimensions-focus.json", focus)
dimension_stats = {
    "path": DIMENSIONS,
    "sha256": before[DIMENSIONS]["sha256"],
    "record_counts": {name: len(t["records"]) for name, t in dimension_tables.items()},
    "dimension_id_prefix_counts": dict(collections.Counter(re.match(r"[A-Z]+", r["id"]).group() for r in dimension_tables["Dimensions"]["records"])),
    "basis_counts": dict(collections.Counter(value(r, "Cơ sở / Basis") for r in dimension_tables["Dimensions"]["records"])),
    "source_unit_counts": [{"unit": unit, "count": count} for unit, count in collections.Counter(value(r, "ĐVT / Unit") for r in dimension_tables["Dimensions"]["records"]).items()],
    "open_item_status_counts": dict(collections.Counter(value(r, "Trạng thái / Status") for r in dimension_tables["Open items"]["records"])),
    "open_confirmation_value_cells_populated": [r["fields"]["Giá trị xác nhận (mm)"] for r in dimension_tables["Open items"]["records"] if present(value(r, "Giá trị xác nhận (mm)"))],
    "open_new_reference_cells_populated": [r["fields"]["Nguồn xác nhận / New reference"] for r in dimension_tables["Open items"]["records"] if present(value(r, "Nguồn xác nhận / New reference"))],
    "unresolved_dimension_records": [r for r in dimension_tables["Dimensions"]["records"] if value(r, "Cơ sở / Basis") == "Cần xác nhận / Unresolved"],
    "keyword_group_counts": {name: len(rows) for name, rows in focus["groups"].items()},
    "saved_error_cells": [{"sheet": s["name"], **c} for s in dimensions_book["sheets"] for c in s["saved_error_cells"]],
}
write_json("dimensions-summary.json", dimension_stats)
dimension_by_id = {r["id"]: r for r in dimension_tables["Dimensions"]["records"]}
open_item_links = []
for row in dimension_tables["Open items"]["records"]:
    source_text = value(row, "Mã nguồn / Source IDs")
    source_ids = re.findall(r"\b[EPS]\d{3}\b", str(source_text))
    open_item_links.append({"open_item": row, "source_dimension_records": [dimension_by_id[id_] for id_ in source_ids if id_ in dimension_by_id], "source_ids_not_found_in_dimensions": [id_ for id_ in source_ids if id_ not in dimension_by_id], "source_id_text_is_preserved": source_text})
write_json("open-item-source-links.json", open_item_links)

layout = json.loads((ROOT / LAYOUT).read_text(encoding="utf-8"))
systems = json.loads((ROOT / SYSTEMS).read_text(encoding="utf-8"))
manifest = json.loads((ROOT / MANIFEST).read_text(encoding="utf-8"))
manifest_category = {c["id"]: c for c in manifest["categories"]}
items = {i["id"]: i for i in layout["items"]}
sources = systems["sources"]
routes = {r["id"]: r for r in systems["routes"]}
components = {c["id"]: c for c in systems["components"]}
source_counts = {"layout_items": len(layout["items"]), "layout_unique_ids": len(items), "board_sources": len(sources), "systems_components": len(systems["components"]), "systems_unique_component_ids": len(components), "shown_components": sum(not c.get("hiddenAlternative", False) for c in systems["components"]), "routes": len(systems["routes"]), "unique_route_ids": len(routes), "vertices": sum(len(r["points"]) for r in systems["routes"])}
all_equipment = collections.defaultdict(list)
all_routes = collections.defaultdict(list)
all_vertices = collections.defaultdict(list)
registers = []
register_records = {}
input_column_rows = []
nonempty_inputs = []
comparisons = []
total = collections.Counter()


def comparison(kind, actual, saved, source, location=None):
    record = {"kind": kind, "actual": actual, "saved": saved, "match": actual == saved, "source": source}
    if location is not None:
        record["location"] = location
    comparisons.append(record)


comparison("manifest_layout_fingerprint", before[LAYOUT]["sha256"], manifest["layoutHash"], MANIFEST, "/layoutHash")
comparison("manifest_systems_fingerprint", before[SYSTEMS]["sha256"], manifest["systemsHash"], MANIFEST, "/systemsHash")

for category in CATEGORIES:
    relative = f"docs/electrical-grid/categories/{category}/register.xlsx"
    book = xlsx(relative)
    sheets = {s["name"]: s for s in book["sheets"]}
    assert list(sheets) == EXPECTED_SHEETS, f"Unexpected sheets in {relative}"
    tables = {name: table(sheets[name], 6, "Equipment ID" if name == "Equipment" else "Route ID") for name in EXPECTED_SHEETS[1:]}
    equipment = tables["Equipment"]["records"]
    lines = tables["Electrical Lines"]["records"]
    points = tables["Route Points"]["records"]
    readme = [{"label": cell_value(sheets["Read me"], f"A{row}"), "label_cell": f"A{row}", "value": cell_value(sheets["Read me"], f"B{row}"), "cell": f"B{row}"} for row in range(1, 27) if present(cell_value(sheets["Read me"], f"A{row}"))]
    current_equipment = [r for r in equipment if value(r, "Record state") == "Current"]
    current_lines = [r for r in lines if value(r, "Record state") == "Current"]
    current_points = [r for r in points if value(r, "Record state") == "Current"]
    stats = {"category": category, "equipment": len(current_equipment), "routes": len(current_lines), "vertices": len(current_points), "total_equipment_records": len(equipment), "total_route_records": len(lines), "total_vertex_records": len(points), "retiredEquipment": sum(value(r, "Record state") == "Retired" for r in equipment), "retiredRoutes": sum(value(r, "Record state") == "Retired" for r in lines), "retiredVertices": sum(value(r, "Record state") == "Retired" for r in points), "shown": sum(value(r, "Visibility") == "Shown" for r in current_equipment), "hidden": sum(value(r, "Visibility") == "Hidden alternative" for r in current_equipment), "connected": sum(r["id"] in components and not components[r["id"]].get("hiddenAlternative", False) for r in current_equipment), "commandedOn": sum(r["id"] in items and value(r, "Visibility") == "Shown" and value(r, "Command state") == "On" for r in current_equipment)}
    stats["specsDocumented"] = sum(present(value(r, "Approved specs")) and present(value(r, "Datasheet / approval")) for r in current_equipment)
    stats["controlsDocumented"] = sum(r["id"] in components and not components[r["id"]].get("hiddenAlternative", False) and (present(value(r, "Manual control ID")) or present(value(r, "Control group"))) for r in current_equipment)
    stats["cableDocumented"] = sum(present(value(r, "Cable designation")) and present(value(r, "Approval reference")) for r in current_lines)
    stats["allowancesEntered"] = sum(value(r, "Length basis") != "Shared bundle" and isinstance(value(r, "Allowance (m)"), (int, float)) and not isinstance(value(r, "Allowance (m)"), bool) for r in current_lines)
    stats["allowancePopulation"] = sum(value(r, "Length basis") != "Shared bundle" for r in current_lines)
    stats["proposedComplete"] = sum(all(present(value(r, h)) for h in ["Proposed X (m)", "Proposed Y (m)", "Proposed Z (m)"]) for r in equipment)
    stats["proposedPartial"] = sum(any(present(value(r, h)) for h in ["Proposed X (m)", "Proposed Y (m)", "Proposed Z (m)"]) and not all(present(value(r, h)) for h in ["Proposed X (m)", "Proposed Y (m)", "Proposed Z (m)"]) for r in equipment)
    for key, number in stats.items():
        if key != "category":
            total[key] += number
    column_counts = []
    for sheet_name, inputs, rows in [("Equipment", EQ_INPUTS, equipment), ("Electrical Lines", LINE_INPUTS, lines)]:
        for header in inputs:
            header_address = next(a for a, h in tables[sheet_name]["headers"].items() if h == header)
            column = re.match(r"[A-Z]+", header_address).group()
            populated = []
            for row in rows:
                field = row["fields"][header]
                if present(field["value"]) or "formula" in field:
                    populated.append({"category": category, "path": relative, "sheet": sheet_name, "record_id": row["id"], "id_cell": row["id_cell"], "record_state": value(row, "Record state"), "header": header, **field})
            record = {"category": category, "path": relative, "sheet": sheet_name, "header": header, "header_cell": header_address, "data_range": f"{column}{rows[0]['row']}:{column}{rows[-1]['row']}" if rows else None, "population": len(rows), "nonempty_values": sum(present(p["value"]) for p in populated), "formula_cells": sum("formula" in p for p in populated)}
            column_counts.append(record)
            input_column_rows.append(record)
            nonempty_inputs.extend(populated)
    for row in equipment:
        all_equipment[row["id"]].append({"category": category, **loc(relative, "Equipment", row["id_cell"]), "state": value(row, "Record state")})
    for row in lines:
        all_routes[row["id"]].append({"category": category, **loc(relative, "Electrical Lines", row["id_cell"]), "state": value(row, "Record state")})
    for row in points:
        all_vertices[(row["id"], value(row, "Vertex"))].append({"category": category, **loc(relative, "Route Points", row["id_cell"]), "vertex_cell": row["fields"]["Vertex"]["cell"], "state": value(row, "Record state")})
    comparison(f"{category}_workbook_fingerprint", before[relative]["sha256"], manifest_category[category]["sha256"], MANIFEST, f"/categories/{CATEGORIES.index(category)}/sha256")
    for key in ["equipment", "routes", "vertices"]:
        comparison(f"{category}_{key}_manifest_count", stats[key], manifest_category[category][key], MANIFEST, f"/categories/{CATEGORIES.index(category)}/{key}")
    comparison(f"{category}_readme_layout_hash", before[LAYOUT]["sha256"], cell_value(sheets["Read me"], "B14"), relative, "'Read me'!B14")
    comparison(f"{category}_readme_systems_hash", before[SYSTEMS]["sha256"], cell_value(sheets["Read me"], "B15"), relative, "'Read me'!B15")
    comparison(f"{category}_readme_equipment_count", stats["equipment"], cell_value(sheets["Read me"], "B5"), relative, "'Read me'!B5")
    comparison(f"{category}_readme_route_count", stats["routes"], cell_value(sheets["Read me"], "B6"), relative, "'Read me'!B6")
    registers.append({"category": category, "path": relative, "sha256": before[relative]["sha256"], "bytes": before[relative]["bytes"], "sheets": [{k: v for k, v in s.items() if k != "cells"} for s in book["sheets"]], "readme": readme, "counts": stats, "input_columns": column_counts, "saved_error_cells": [{"sheet": s["name"], **c} for s in book["sheets"] for c in s["saved_error_cells"]], "zip_crc_check": book["zip_crc_check"]})
    register_records[category] = {"path": relative, "sha256": before[relative]["sha256"], "tables": tables}

for key in ["equipment", "shown", "hidden", "connected", "commandedOn", "retiredEquipment", "retiredRoutes", "routes", "vertices", "specsDocumented", "controlsDocumented", "cableDocumented", "allowancesEntered", "allowancePopulation"]:
    comparison(f"total_{key}_manifest_count", total[key], manifest["totals"][key], MANIFEST, f"/totals/{key}")
comparison("equipment_count_matches_layout_plus_enclosures", total["equipment"], source_counts["layout_items"] + source_counts["board_sources"], LAYOUT + " + " + SYSTEMS)
comparison("route_count_matches_saved_systems", total["routes"], source_counts["routes"], SYSTEMS, "/routes")
comparison("vertex_count_matches_saved_systems", total["vertices"], source_counts["vertices"], SYSTEMS, "/routes/*/points")

summary_lines = (ROOT / SUMMARY).read_text(encoding="utf-8").splitlines()
summary_hashes = [{"line": index + 1, "text": text, "sha256": re.search(r"SHA-256: ([a-f0-9]{64})", text).group(1)} for index, text in enumerate(summary_lines) if re.search(r"SHA-256: ([a-f0-9]{64})", text)]
for saved in summary_hashes:
    kind = "layout" if "equipment-layout.json" in saved["text"] else "systems" if "electrical-systems.json" in saved["text"] else "unidentified"
    actual_path = LAYOUT if kind == "layout" else SYSTEMS
    comparison(f"summary_{kind}_fingerprint", before[actual_path]["sha256"], saved["sha256"], SUMMARY, f"line {saved['line']}")
summary_quantity_rows = []
for index, text in enumerate(summary_lines):
    if not text.startswith("| "):
        continue
    fields = [f.strip() for f in text.strip().strip("|").split("|")]
    if len(fields) == 8 and all(re.fullmatch(r"\d+", f) for f in fields[1:]):
        names = {"Lighting": "lighting", "Sound": "sound", "Fans and ventilation": "air-system", "Exit signs": "exit-signs", "Decoration and furnishings": "decoration", "Distribution and controls": "distribution-controls", "**Total**": "total"}
        if fields[0] not in names:
            continue
        category = names[fields[0]]
        summary_record = {"category": category, "source_line": index + 1, "source_text": text}
        counts = total if category == "total" else next(r["counts"] for r in registers if r["category"] == category)
        for key, stored in zip(["equipment", "shown", "hidden", "connected", "commandedOn", "routes", "vertices"], fields[1:]):
            summary_record[key] = int(stored)
            comparison(f"summary_{category}_{key}", counts[key], int(stored), SUMMARY, f"line {index + 1}")
        summary_quantity_rows.append(summary_record)

duplicates = {"equipment": [{"id": key, "locations": values} for key, values in all_equipment.items() if len(values) > 1], "routes": [{"id": key, "locations": values} for key, values in all_routes.items() if len(values) > 1], "vertices": [{"route_id": key[0], "vertex": key[1], "locations": values} for key, values in all_vertices.items() if len(values) > 1]}
retired = {"equipment": [v for values in all_equipment.values() for v in values if v["state"] == "Retired"], "routes": [v for values in all_routes.values() for v in values if v["state"] == "Retired"], "vertices": [v for values in all_vertices.values() for v in values if v["state"] == "Retired"]}
sets = {"equipment_in_register_only": sorted(set(all_equipment) - set(items) - set(sources)), "equipment_in_saved_sources_only": sorted((set(items) | set(sources)) - set(all_equipment)), "routes_in_register_only": sorted(set(all_routes) - set(routes)), "routes_in_saved_systems_only": sorted(set(routes) - set(all_routes))}
write_json("category-registers.json", {"registers": registers, "totals": dict(total), "duplicates": duplicates, "retired": retired, "id_set_comparisons": sets, "nonempty_engineering_inputs": nonempty_inputs})
write_json("category-register-records.json", register_records)
id_index = []
for category, register in register_records.items():
    for sheet_name, parsed in register["tables"].items():
        for row in parsed["records"]:
            id_index.append({"category": category, "sheet": sheet_name, "id": row["id"], "vertex": value(row, "Vertex"), "row": row["row"], "id_cell": row["id_cell"], "record_state": value(row, "Record state")})
write_csv("register-id-index.csv", ["category", "sheet", "id", "vertex", "row", "id_cell", "record_state"], id_index)
write_csv("category-counts.csv", list(registers[0]["counts"]), [r["counts"] for r in registers])
write_csv("engineering-input-columns.csv", list(input_column_rows[0]), input_column_rows)
write_json("snapshot-comparison.json", {"source_counts": source_counts, "layout_metadata": {k: layout.get(k) for k in ["schema", "savedAt", "designVersion", "settings"]}, "systems_metadata": {k: systems.get(k) for k in ["schema", "savedAt", "designVersion"]}, "manifest_generatedAt": manifest.get("generatedAt"), "summary_fingerprints": summary_hashes, "summary_quantity_rows": summary_quantity_rows, "comparisons": comparisons, "mismatches": [c for c in comparisons if not c["match"]], "id_set_comparisons": sets, "duplicates": duplicates})
after = {relative: fingerprint(relative) for relative in SOURCE_FILES}
unchanged = before == after
assert unchanged, "Source files changed during extraction; repeat against a stable snapshot."
write_json("source-fingerprints.json", {"before": list(before.values()), "after": list(after.values()), "all_unchanged": unchanged})
write_json("inventory-method.json", {"generated_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(), "repository_root": str(ROOT), "python_executable": sys.executable, "python_version": sys.version, "method": "Python standard-library zipfile and XML reads. Preserve source strings, cells, XML values, saved caches and formulas. No rendering/edit/export/recalculation or simulations.", "source_workbooks": 7, "zip_crc_checks": "passed for all seven", "formula_cache_limit": "Saved caches are recorded and were not recalculated; no claim of current native-Excel results.", "source_fingerprints_unchanged": unchanged, "git_branch_at_read": subprocess.check_output(["git", "branch", "--show-current"], cwd=ROOT, text=True).strip(), "git_head_at_read": subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True).strip(), "git_mutations": "none", "engineering_review": "none; source inventory and saved-file comparison only"})
print(json.dumps({"dimensions_records": {name: len(t["records"]) for name, t in dimension_tables.items()}, "register_totals": dict(total), "comparison_count": len(comparisons), "comparison_mismatches": [c for c in comparisons if not c["match"]], "duplicate_counts": {k: len(v) for k, v in duplicates.items()}, "nonempty_engineering_input_cells": len(nonempty_inputs), "sources_unchanged": unchanged}, ensure_ascii=False, indent=2))
