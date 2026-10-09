import assert from 'node:assert/strict';

export const categories = [
  { id: 'lighting', name: 'Lighting', usage: 'Reading, sanctuary, circulation, paths, facade and festival exterior lighting.' },
  { id: 'sound', name: 'Sound', usage: 'Loudspeakers, microphones, indoor speech and outdoor overflow.' },
  { id: 'air-system', name: 'Fans and ventilation', usage: 'Ceiling, wall, entrance and exhaust fans for air movement and ventilation.' },
  { id: 'exit-signs', name: 'Exit signs', usage: 'E1 maintained exit-sign group. Emergency supply and duration require separate design.' },
  { id: 'decoration', name: 'Decoration and furnishings', usage: 'Seasonal decorative lighting and non-electrical simulator furnishings.' },
  { id: 'distribution-controls', name: 'Distribution and controls', usage: 'DB1, DB2, LC1, FC1 and AV1 enclosures and their shared supply feeders.' }
];

export function equipmentCategory(row) {
  if (row.Category === 'enclosure') return 'distribution-controls';
  if (row.Circuit === 'E1') return 'exit-signs';
  const category = { light: 'lighting', speaker: 'sound', mic: 'sound', fan: 'air-system', decor: 'decoration' }[row.Category];
  assert(category, `Unclassified equipment ${row['Equipment ID']}: ${row.Category}`);
  return category;
}

export function partitionRegisters(equipment, lines, points) {
  const eqOwner = new Map(equipment.map(r => [r['Equipment ID'], equipmentCategory(r)]));
  assert.equal(eqOwner.size, equipment.length, 'Duplicate equipment IDs across category files');
  const routeOwner = new Map();
  for (const r of lines) {
    const destinations = String(r['Destination IDs'] || '').split('\n').filter(Boolean);
    const owners = new Set(destinations.map(id => {
      assert(eqOwner.has(id), `Route ${r['Route ID']} has unknown equipment ${id}`);
      return eqOwner.get(id);
    }));
    let owner;
    if (r.Role === 'feeder') owner = 'distribution-controls';
    else {
      assert.equal(owners.size, 1, `Route ${r['Route ID']} needs an explicit shared-category design decision`);
      owner = [...owners][0];
    }
    assert(!routeOwner.has(r['Route ID']), `Duplicate route ${r['Route ID']} across category files`);
    routeOwner.set(r['Route ID'], owner);
  }
  const vertexKeys = new Set();
  for (const p of points) {
    assert(routeOwner.has(p['Route ID']), `Unowned route vertex ${p['Route ID']}`);
    const key = `${p['Route ID']}/${p.Vertex}`;
    assert(!vertexKeys.has(key), `Duplicate route vertex ${key}`); vertexKeys.add(key);
  }
  for (const r of lines) if (r['Trunk ID']) {
    assert.equal(routeOwner.get(r['Trunk ID']), routeOwner.get(r['Route ID']), `Home run and trunk must stay together: ${r['Route ID']}`);
  }
  return categories.map(c => ({ ...c,
    equipment: equipment.filter(r => eqOwner.get(r['Equipment ID']) === c.id),
    lines: lines.filter(r => routeOwner.get(r['Route ID']) === c.id),
    points: points.filter(p => routeOwner.get(p['Route ID']) === c.id)
  }));
}

const present = x => x !== null && x !== undefined && String(x).trim() !== '';
const sum = (rows, fn) => rows.reduce((n, r) => n + fn(r), 0);
const fixed = (n, decimals = 1) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function summarizeRegisters(groups, layout, systems, sim) {
  const itemById = new Map(layout.items.map(it => [it.id, it]));
  const installed = new Set(systems.components.filter(c => !c.hiddenAlternative).map(c => c.id));
  const rows = groups.map(g => {
    const equipment = g.equipment.filter(r => r['Record state'] === 'Current');
    const lines = g.lines.filter(r => r['Record state'] === 'Current');
    const items = equipment.map(r => itemById.get(r['Equipment ID'])).filter(Boolean);
    const connected = equipment.filter(r => installed.has(r['Equipment ID']));
    const watts = sum(items, it => sim.itemWatts(it));
    assert(Number.isFinite(watts), `Invalid power estimate for ${g.id}`);
    return { id: g.id, name: g.name, usage: g.usage,
      equipment: equipment.length, shown: equipment.filter(r => r.Visibility === 'Shown').length,
      hidden: equipment.filter(r => r.Visibility === 'Hidden alternative').length,
      connected: connected.length, commandedOn: items.filter(it => it.on && !it.hidden).length,
      retiredEquipment: g.equipment.length - equipment.length, retiredRoutes: g.lines.length - lines.length,
      routes: lines.length, vertices: g.points.filter(p => p['Record state'] === 'Current').length,
      routeMetres: sum(lines, r => r['Route length (m)']),
      homeRunMetres: sum(lines.filter(r => r['Length basis'] === 'Full home run'), r => r['Route length (m)'] + r['Upstream length (m)']),
      bundleMetres: sum(lines.filter(r => r['Length basis'] === 'Shared bundle'), r => r['Route length (m)']),
      segmentMetres: sum(lines.filter(r => r['Length basis'] === 'Route segment'), r => r['Route length (m)']),
      watts, kWhService: watts / 1000 * layout.settings.serviceHours,
      kWhMonth: watts / 1000 * layout.settings.serviceHours * layout.settings.servicesPerMonth,
      specsDocumented: equipment.filter(r => present(r['Approved specs']) && present(r['Datasheet / approval'])).length,
      controlsDocumented: connected.filter(r => present(r['Manual control ID']) || present(r['Control group'])).length,
      cableDocumented: lines.filter(r => present(r['Cable designation']) && present(r['Approval reference'])).length,
      allowancesEntered: lines.filter(r => r['Length basis'] !== 'Shared bundle' && typeof r['Allowance (m)'] === 'number').length,
      allowancePopulation: lines.filter(r => r['Length basis'] !== 'Shared bundle').length,
      circuits: [...new Set(equipment.map(r => r.Circuit).filter(Boolean))].sort().join(', ') || 'Shared board feeders'
    };
  });
  const total = Object.fromEntries(Object.keys(rows[0]).filter(k => typeof rows[0][k] === 'number').map(k => [k, sum(rows, r => r[k])]));
  assert.equal(total.equipment, layout.items.length + Object.keys(systems.sources).length);
  assert.equal(total.routes, systems.routes.length);
  assert.equal(total.vertices, sum(systems.routes, r => r.points.length));
  assert.equal(total.connected, installed.size);
  assert(Math.abs(total.watts - sim.powerSummary().total) < 1e-8, 'Category operating load does not reconcile with simulator');
  return { rows, total };
}

export function summaryMarkdown(summary, layout, hashes, createdDate) {
  const { rows, total: t } = summary;
  const quantityRow = r => `| ${r.name || '**Total**'} | ${r.equipment} | ${r.shown} | ${r.hidden} | ${r.connected} | ${r.commandedOn} | ${r.routes} | ${r.vertices} |`;
  return `# Equipment quantities, usage and quality report

Generated ${createdDate} from the category registers and their matched model snapshots. [Category files](categories/README.md) share the same four-sheet structure. Each equipment ID, route ID and route vertex belongs to exactly one category. This report is a saved snapshot; refresh it after changing the workbooks.

## Total quantities

| Usage category | Equipment/enclosures | Shown | Hidden alternatives | Connected components | Shown items commanded on | Routes | Route points |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.map(quantityRow).join('\n')}
${quantityRow(t)}

Shown includes non-electrical furnishings and the five enclosures. Connected components excludes hidden alternatives and non-electrical objects. Commanded on is a saved switch state, not measured operation; it excludes enclosures but includes non-electrical objects with a model switch. Retired records retained: **${t.retiredEquipment} equipment, ${t.retiredRoutes} routes**.

## Usage and energy estimate

Saved scene: **${layout.scene}**. Service duration **${layout.settings.serviceHours} h**, **${layout.settings.servicesPerMonth} services/month**. These are model assumptions, not recorded attendance or utility consumption. DB2 feeder setting: **${layout.settings.db2Feed === false ? 'unavailable; commanded loads below do not prove energization' : 'available in the saved model'}**.

| Usage category | Operating estimate (W) | kWh/service | Service-only kWh/month | Circuits / scope |
| --- | ---: | ---: | ---: | --- |
${rows.map(r => `| ${r.name} | ${fixed(r.watts)} | ${fixed(r.kWhService, 3)} | ${fixed(r.kWhMonth, 2)} | ${r.circuits} |`).join('\n')}
| **Total modeled usage** | **${fixed(t.watts)}** | **${fixed(t.kWhService, 3)}** | **${fixed(t.kWhMonth, 2)}** | Same saved configuration |

Calculated by the simulator's itemWatts method, including dimming, fan speed and amplifier allowances. Passive-speaker ratings are not summed as mains watts. The five boards do not add duplicate downstream consumption; their own parasitic/control loads are not separately modeled. A zero is the model's result, not a verified zero product rating. Standby, between-service use, continuous exit-sign operation outside these service hours, other building loads and distribution losses are excluded. These totals cannot size a supply, protective device or cable. See [methods and limitations](../simulator/methods-and-limitations.md).

## Route lengths

| Usage category | All drawn route segments (m) | Ordinary route segments (m) | Full audio/mic home runs (m) | Shared home-run bundle paths (m) |
| --- | ---: | ---: | ---: | ---: |
${rows.map(r => `| ${r.name} | ${fixed(r.routeMetres, 3)} | ${fixed(r.segmentMetres, 3)} | ${fixed(r.homeRunMetres, 3)} | ${fixed(r.bundleMetres, 3)} |`).join('\n')}
| **Total by length basis** | **${fixed(t.routeMetres, 3)}** | **${fixed(t.segmentMetres, 3)}** | **${fixed(t.homeRunMetres, 3)}** | **${fixed(t.bundleMetres, 3)}** |

Drawn route lengths sum each route once but may share physical corridors. Full home runs already include their upstream shared paths. Do not add the bundle column to full home runs or add these columns together as a purchasing total. Installed cable/conduit quantities require the approved topology and allowances. ${t.allowancesEntered}/${t.allowancePopulation} non-bundle routes have an entered allowance; a justified explicit zero counts as entered.

## Data quality and engineering completeness

The build verified unique equipment/route IDs, unique ordered vertices, complete category coverage, home-run/trunk ownership, matched layout/component positions and circuits, and Excel lengths against 3D geometry. Category totals reconcile to the source model. These are data checks; they do not establish construction readiness.

| Usage category | Specification + source fields filled / equipment | Physical control mapping filled / connected components | Cable designation + approval reference filled / routes |
| --- | ---: | ---: | ---: |
${rows.map(r => `| ${r.name} | ${r.specsDocumented}/${r.equipment} | ${r.controlsDocumented}/${r.connected} | ${r.cableDocumented}/${r.routes} |`).join('\n')}
| **Total** | **${t.specsDocumented}/${t.equipment}** | **${t.controlsDocumented}/${t.connected}** | **${t.cableDocumented}/${t.routes}** |

These counts measure field completeness only; filled fields still require source and engineering review. A 0/0 population is not applicable. Product selection, protection, final cable/containment specifications, actual control channels and commissioning evidence remain pending where fields are blank. No overall quality score is invented.

The held wing review of 9 October 2026 retains four small brass chandeliers (L63/L65/L67/L69), four F5 above-window wall fans (F240–F243, extended bracket proxy), and two entrance-facing wing wall speakers (S276/S278). Four light IDs, four appended fan IDs and S275/S277 are retired; sixteen F2 nave wall fans (eight per side, extended bracket proxy) remain shown/OFF. Four unpowered Peter/Paul pictures are decoration records with no electrical routes. Task lighting, airflow, noise, speech/feedback, glare, concealment, product and mounting holds remain; see [wing comparison](../engineering/wing-review.md). The seating-cache correction is independently verified, not design approval. Register refresh does not resolve performance failures. See [simulator validation status](../simulator/README.md) and [control requirements](controls.md). Status: **design development**.

## Sources and refresh

- [Layout snapshot](equipment-layout.json), SHA-256: ${hashes.layout}.
- [Electrical snapshot](electrical-systems.json), SHA-256: ${hashes.systems}.
- [Register workflow](register.md); usage formulas: [simulator engine](../../Thach_Bi_Viewer/simulator/engine.js).
- [Build manifest](categories/manifest.json) records workbook fingerprints for this report. A later Excel edit requires a refresh before these totals are current.

Run \`node scripts/build_equipment_register.mjs --verify-workflow\` to preserve category inputs and refresh all six files and this report. Re-export matched model snapshots first when geometry changes.
`;
}
