const $ = (id) => document.getElementById(id);
let state = {
  sheet: "all",
  selected: new Set(),
  svg: null,
  original: null,
  box: null,
  drag: null,
  moved: false,
  serial: 0,
  revision: null,
};
const message = (text) => ($("message").textContent = text);
function buttons(loaded) {
  for (const id of ["fit", "clear", "export-sheet", "zoom-in", "zoom-out", "center", "pan-up", "pan-down", "pan-left", "pan-right"]) $(id).disabled = !loaded;
  $("export-selection").disabled = !loaded || !state.selected.size;
}
function selection() {
  $("selection").textContent = state.selected.size
    ? `${state.selected.size} object${state.selected.size === 1 ? "" : "s"} selected`
    : "No objects selected";
  if (state.svg)
    state.svg
      .querySelectorAll("[data-handle]")
      .forEach((p) =>
        p.classList.toggle("selected", state.selected.has(p.dataset.handle)),
      );
  buttons(!!state.svg);
}
function applyBox() {
  state.svg.setAttribute("viewBox", state.box.join(" "));
}
function fit() {
  if (!state.svg) return;
  state.box = [...state.original];
  applyBox();
}
async function openSheet(id, force = false) {
  if (state.loading && !force) return;
  const serial = ++state.serial;
  state.sheet = id;
  state.selected.clear();
  state.svg = null;
  buttons(false);
  $("empty").hidden = false;
  $("empty").innerHTML =
    "<strong>Rendering drawing…</strong><p>Complex sheets can take a moment.</p>";
  message("Rendering drawing…");
  try {
    const r = await fetch("/drawing/" + encodeURIComponent(id), {
      headers: { "X-Drawing-Revision": state.revision },
    });
    if (!r.ok) throw new Error((await r.json()).error);
    const svg = await r.text();
    if (serial !== state.serial) return;
    $("drawing").innerHTML = svg;
    state.svg = $("drawing").querySelector("svg");
    state.original = state.svg.getAttribute("viewBox").split(/\s+/).map(Number);
    state.box = [...state.original];
    $("empty").hidden = true;
    $("hint").hidden = false;
    document
      .querySelectorAll(".sheet")
      .forEach((b) => b.classList.toggle("active", b.dataset.id === id));
    $("view-title").textContent =
      document.querySelector(".sheet.active").dataset.title;
    selection();
    message("");
  } catch (e) {
    if (serial !== state.serial) return;
    message(e.message);
    $("empty").innerHTML =
      "<strong>Drawing could not be displayed</strong><p>Try another sheet or file.</p>";
  }
}
async function loadFile(file, project = false) {
  if ((!file && !project) || state.loading) return;
  state.loading = true;
  ++state.serial;
  $("file").disabled = true;
  $("project").disabled = true;
  document.querySelector(".open").classList.add("disabled");
  document.querySelectorAll(".sheet").forEach((b) => b.disabled = true);
  message("Opening and indexing drawing… This can take a few minutes.");
  buttons(false);
  try {
    const r = await fetch(project ? "/open-project" : "/open", {
      method: "POST",
      headers: project ? {} : { "X-File-Name": encodeURIComponent(file.name) },
      body: project ? "open" : file,
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error);
    state.revision = data.revision;
    $("filename").textContent = data.name;
    $("sheet-count").textContent = data.sheets.length;
    $("sheet-help").textContent = data.church
      ? "27 inventoried views, 23 enlarged tower details (T01–T23: front, side and cut) and model space."
      : "Model space · sheet inventory is available for the matching church DWG.";
    $("units").textContent = data.church
      ? "Unit hold ISSUE-R06: INSUNITS=1 indicates inches for insertion; drawing chains suggest millimetres. No rescaling. Designer confirmation required."
      : `DXF INSUNITS: ${data.insunits}. Units and scale require verification; no rescaling.`;
    $("detail").textContent =
      `${data.count.toLocaleString()} of ${data.total.toLocaleString()} entities have bounds · ${data.xrefs} XREF definitions · ${data.conversionWarnings ? "converter reported warnings" : "review fidelity limits before use"}`;
    $("sheet-list").replaceChildren(
      ...data.sheets.map((s) => {
        const b = document.createElement("button");
        b.className = "sheet";
        b.dataset.id = s.id;
        b.dataset.title = s.name;
        const code = document.createElement("span");
        code.textContent = s.id === "all" ? "ALL" : s.id;
        const name = document.createElement("div");
        name.textContent = s.name;
        b.append(code, name);
        b.addEventListener("click", () => openSheet(s.id));
        return b;
      }),
    );
    await openSheet(data.church ? "P05" : "all", true);
  } catch (err) {
    message(err.message + (state.svg ? " Previous drawing remains open." : ""));
    buttons(!!state.svg);
  } finally {
    state.loading = false;
    $("file").disabled = false;
    $("project").disabled = false;
    document.querySelector(".open").classList.remove("disabled");
    document.querySelectorAll(".sheet").forEach((b) => b.disabled = false);
  }
}
$("file").addEventListener("change", (e) => {
  loadFile(e.target.files[0]);
  e.target.value = "";
});
$("project").onclick = () => loadFile(null, true);
fetch("/project-available")
  .then((r) => r.json())
  .then((data) => {
    $("project").hidden = !data.available;
  })
  .catch(() => {});

$("fit").onclick = fit;
function zoom(scale, point) {
  if (!state.svg) return;
  const [x, y, width, height] = state.box;
  const targetWidth = Math.max(state.original[2] / 100, Math.min(state.original[2] * 10, width * scale));
  scale = targetWidth / width;
  const anchor = point || { x: x + width / 2, y: y + height / 2 };
  state.box = [anchor.x - (anchor.x - x) * scale, anchor.y - (anchor.y - y) * scale, width * scale, height * scale];
  applyBox();
}
$("zoom-in").onclick = () => zoom(1 / 1.1);
$("zoom-out").onclick = () => zoom(1.1);
$("center").onclick = () => {
  if (!state.svg) return;
  state.box[0] = state.original[0] + (state.original[2] - state.box[2]) / 2;
  state.box[1] = state.original[1] + (state.original[3] - state.box[3]) / 2;
  applyBox();
};
for (const [id, dx, dy] of [["pan-left", -1, 0], ["pan-right", 1, 0], ["pan-up", 0, -1], ["pan-down", 0, 1]]) {
  $(id).onclick = () => {
    if (!state.svg) return;
    state.box[0] += dx * state.box[2] * 0.1;
    state.box[1] += dy * state.box[3] * 0.1;
    applyBox();
  };
}
$("clear").onclick = () => {
  state.selected.clear();
  selection();
};
function drawingPoint(x, y) {
  const point = state.svg.createSVGPoint();
  point.x = x;
  point.y = y;
  return point.matrixTransform(state.svg.getScreenCTM().inverse());
}
$("drawing").addEventListener(
  "wheel",
  (e) => {
    if (!state.svg) return;
    e.preventDefault();
    // Wheel events may report pixels, lines, or pages; cap each event so a
    // high-resolution trackpad or mouse wheel cannot jump across the drawing.
    const pixels = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1);
    const amount = Math.max(-0.06, Math.min(0.06, pixels * 0.0006));
    zoom(Math.exp(amount), drawingPoint(e.clientX, e.clientY));
  },
  { passive: false },
);
$("drawing").addEventListener("pointerdown", (e) => {
  if (!state.svg) return;
  state.drag = {
    x: e.clientX,
    y: e.clientY,
    point: drawingPoint(e.clientX, e.clientY),
    box: [...state.box],
    target: e.target,
    shift: e.shiftKey,
  };
  state.moved = false;
  $("drawing").setPointerCapture(e.pointerId);
});
$("drawing").addEventListener("pointermove", (e) => {
  if (!state.drag || !state.svg) return;
  const dx = e.clientX - state.drag.x,
    dy = e.clientY - state.drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
  if (state.moved) {
    const p = drawingPoint(e.clientX, e.clientY),
      b = state.box;
    state.box = [
      b[0] + state.drag.point.x - p.x,
      b[1] + state.drag.point.y - p.y,
      b[2],
      b[3],
    ];
    applyBox();
  }
});
$("drawing").addEventListener("pointerup", () => {
  if (!state.drag) return;
  if (!state.moved) {
    const h = state.drag.target.dataset.handle;
    if (!state.drag.shift) state.selected.clear();
    if (h) {
      if (state.selected.has(h)) state.selected.delete(h);
      else state.selected.add(h);
    }
    selection();
  }
  state.drag = null;
});
async function exportPDF(selected) {
  message("Preparing vector PDF…");
  try {
    const r = await fetch("/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        revision: state.revision,
        sheet: state.sheet,
        handles: selected ? [...state.selected] : null,
      }),
    });
    if (!r.ok) throw new Error((await r.json()).error);
    const url = URL.createObjectURL(await r.blob()),
      a = document.createElement("a");
    a.href = url;
    a.download = `drawing-${state.sheet}-${selected ? "selection" : "sheet"}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    message("PDF downloaded. Verify it against native CAD.");
  } catch (e) {
    if (serial !== state.serial) return;
    message(e.message);
  }
}
$("export-sheet").onclick = () => exportPDF(false);
$("export-selection").onclick = () => exportPDF(true);
