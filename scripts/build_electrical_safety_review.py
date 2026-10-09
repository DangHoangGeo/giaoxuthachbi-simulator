#!/usr/bin/env python3
"""Electrical safety and efficiency review of the default model.

A walk round the church by zone, conditional protection / voltage-drop / earth-fault screens for
every mains circuit, geometric safety screens, supply scenarios and energy use. It loads the actual
model through the two Node exporters, reuses the formulas and tables of electrical_review.py, and
writes a Markdown report plus JSON/CSV evidence.

Every result is a comparison screen on unconfirmed supply, product and installation data. Nothing
here selects or authorises a cable, a protective device, a product or a purchase.

    python3 scripts/build_electrical_safety_review.py            # write report and evidence
    python3 scripts/build_electrical_safety_review.py --check    # recompute and compare with the saved JSON
"""
from __future__ import annotations
import csv, hashlib, json, math, subprocess, sys, tempfile
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from electrical_review import B2, BREAKERS, RHO, REACTANCE, current, vd_bound  # noqa: E402

REPORT = ROOT / 'docs/electrical-grid/safety-efficiency-review.md'
EVIDENCE = ROOT / 'review/electrical-safety-2026-10-09'
INPUTS = ROOT / 'docs/electrical-grid/cable-design-inputs.json'
ISSUE_DATE = '9 October 2026'

# Explicit screen assumptions. None is a confirmed project value.
RESERVE = 1.25             # planning reserve on fixed catalogue load, as in cable-design-inputs.json
BUDGET = {'light': 3.0, 'fan': 5.0, 'power': 5.0}   # % from DB-1 to the load: comparison budgets (SE-VDROP-LIMIT)
FEEDER_SHARE = 1.0         # % of that budget kept for the feeder between DB-1 and the circuit's board
C_MIN = 0.95               # voltage factor for the minimum earth-fault current
TRIP = {'B': 5, 'C': 10}   # upper instantaneous trip multiples of In for MCB types B and C (product convention)
ARM_REACH = 2.5            # m above the local floor, arm's-reach screen
FAN_BLADE = 2.3            # m above the floor, usual product instruction for unguarded ceiling-fan blades
SEPARATION = 0.30          # m, proximity screen between signal lines and mains routes
SAMPLE = 0.25              # m, sampling step along signal routes
FLOOR_AREA = (53.0 - 2.3) * 14.5 + 2 * (43.9 - 37.22) * (12.95 - 7.25)   # hall + wings from engine.js floorY()
MIN_AREA = {'light': 1.5, 'fan': 2.5, 'power': 2.5, 'power32': 6}   # smallest sizes usually pulled for final circuits (32 A sockets: 6 mm²)
TIMBER_METHODS = {'above-main-beam', 'above-side-beam', 'roof-pendant', 'roof-local', 'chamber-lining'}   # along timber beams, roof lining or the timber chamber lining

ZONES = ['Service room and boards', 'Sanctuary', 'Wing B (ministers)', 'Wing H (choir)', 'Nave', 'Entrance hall and DB-2',
         'Verandas and side paths', 'Roof, eaves and gables', 'Towers, façade and front stage']


def in_wing(x, y, z):
    # The wing rooms, with fittings fixed to the inner face of the gable wall (|z| about 13.06).
    return 37.2 < x < 43.95 and 7.3 < abs(z) <= 13.08 and y < 9.6


def zone(item):
    x, y, z = item['position']
    az = abs(z)
    if x < 2.3: return ZONES[8]
    if in_wing(x, y, z): return ZONES[2] if z < 0 else ZONES[3]
    if not item['interior'] and y >= 7.0: return ZONES[7]
    if az > 7.3 or x > 53.0: return ZONES[6]
    if x >= 48.65: return ZONES[0]
    if x >= 39.75: return ZONES[1]
    if x < 6.5: return ZONES[5]
    return ZONES[4]


def exposure(item):
    """Interior, under a roof outside the enclosed rooms, or open to the weather (model envelope only)."""
    x, y, z = item['position']
    az = abs(z)
    if item['interior'] or in_wing(x, y, z): return 'interior'
    covered = 2.3 < x < 53.1 and (az < 10.6 or (37 < x < 44 and az < 13)) and y < 7.0
    return 'covered exterior' if covered else 'open to weather'


def node(script, target):
    subprocess.run(['node', str(ROOT / 'scripts' / script), str(target)], cwd=ROOT, check=True, stdout=subprocess.DEVNULL)


def load_model():
    with tempfile.TemporaryDirectory() as tmp:
        loads, facts = Path(tmp) / 'loads.json', Path(tmp) / 'facts.json'
        node('export_electrical_loads.cjs', loads)   # also asserts model == exports == registers
        node('export_electrical_safety.cjs', facts)
        return json.loads(loads.read_text()), json.loads(facts.read_text())


def seg_dist(p, a, b):
    ab = [b[i] - a[i] for i in range(3)]
    ap = [p[i] - a[i] for i in range(3)]
    d = sum(v * v for v in ab)
    t = 0 if d == 0 else max(0, min(1, sum(ab[i] * ap[i] for i in range(3)) / d))
    return math.dist(p, [a[i] + ab[i] * t for i in range(3)])


def samples(points, step):
    for a, b in zip(points, points[1:]):
        n = max(1, math.ceil(math.dist(a, b) / step))
        for k in range(n):
            yield [a[i] + (b[i] - a[i]) * (k + .5) / n for i in range(3)], math.dist(a, b) / n


def analyse(loads, facts):
    inputs = json.loads(INPUTS.read_text())
    cases = inputs['comparison_cases']
    assert inputs['planning_reserve_factor'] == RESERVE
    load_item = {i['id']: i for i in loads['items']}
    item = {i['id']: {**i, **{k: load_item[i['id']][k] for k in ('electricalKind', 'maximumMainsProxyW', 'operatingModelW')}} for i in facts['items']}
    routes = loads['full']['routes']
    circuits_meta = facts['circuits']
    full = facts['scenes'][facts['defaultScene']]
    feeders = {r['board'] if r['id'] == 'feeder:DB2' else r['id'].split(':')[1]: r for r in routes if r['role'] == 'feeder'}
    feeder_len = {'DB1': 0.0, 'DB2': feeders['DB2']['length'], 'LC1': feeders['LC1']['length'], 'FC1': feeders['FC1']['length'], 'AV1': feeders['AV1']['length']}
    mains = [r for r in routes if r['kind'] in ('light', 'fan', 'power')]

    # ------------------------------------------------------------------ circuits
    by_circuit = defaultdict(list)
    for r in mains: by_circuit[r['circuit']].append(r)
    circuits = []
    for cid, rs in sorted(by_circuit.items()):
        members = sorted({i for r in rs for i in r['itemIds']})
        kind, source = rs[0]['kind'], rs[0]['source']
        outlet = circuits_meta[cid]['outlet']
        least = MIN_AREA['power32' if outlet and outlet['ratingA'] > 16 else kind]
        connected = sum(item[i]['maximumMainsProxyW'] or 0 for i in members)
        paths = [(r.get('upstreamLength', 0) + r['length'], r['id']) for r in rs if r['role'] in ('drop', 'local')]
        longest, far_route = max(paths)
        row = {'circuit': cid, 'label': circuits_meta[cid]['label'], 'kind': kind, 'source': source, 'board': rs[0]['board'], 'points': len(members),
               'socket_rating_a': outlet['ratingA'] if outlet else None, 'connected_w': None if outlet else connected, 'socket_allowance_w': connected if outlet else None,
               'full_service_w': sum(full['items'][i]['watts'] for i in members), 'longest_path_m': longest, 'farthest_route': far_route,
               'feeder_from_db1_m': feeder_len[source], 'route_m': sum(r['length'] for r in rs),
               'exterior_points': sum(1 for i in members if exposure(item[i]) != 'interior'), 'open_weather_points': sum(1 for i in members if exposure(item[i]) == 'open to weather'),
               'reach_points': sum(1 for i in members if item[i]['position'][1] - item[i]['floorY'] < ARM_REACH), 'cases': []}
        for case in cases:
            u, pf, k = case['voltage_v'], case['power_factor'], case['temperature_factor'] * case['grouping_factor']
            ib = outlet['ratingA'] if outlet else current(connected, u, pf)
            plan = ib if outlet else ib * RESERVE
            breaker = outlet['ratingA'] if outlet else next(b for b in BREAKERS if b >= plan)
            budget = (BUDGET[kind] - FEEDER_SHARE) * u / 100
            per_trunk = defaultdict(list)
            for r in rs:
                if r['role'] in ('drop', 'local'):
                    per_trunk[r.get('trunkId')].append((r.get('upstreamLength', 0), r['length'], RESERVE * current(sum(item[i]['maximumMainsProxyW'] or 0 for i in r['itemIds']), u, pf)))

            def worst_drop(a):
                # Fixed equipment: the trunk current falls at each tap. Sockets: the whole rating at the far outlet.
                if outlet: return vd_bound(plan, longest, a)
                worst = 0.0
                for taps in per_trunk.values():
                    taps = sorted(taps); downstream, prev, along = sum(t[2] for t in taps), 0.0, 0.0
                    for up, length, amps in taps:
                        along += vd_bound(downstream, up - prev, a); prev = up
                        worst = max(worst, along + vd_bound(amps, length, a)); downstream -= amps
                return worst
            area = next((a for a, base in B2.items() if a >= least and breaker <= base * k and worst_drop(a) <= budget + 1e-10), None)
            res = {'case_id': case['id'], 'design_current_a': ib, 'planning_current_a': plan, 'comparison_breaker_a': breaker, 'loading_percent': 100 * ib / breaker,
                   'circuit_budget_percent': BUDGET[kind] - FEEDER_SHARE, 'comparison_area_mm2': area,
                   'vdrop_percent_at_area': None if area is None else 100 * worst_drop(area) / u,
                   'vdrop_percent_at_minimum_area': 100 * worst_drop(least) / u, 'minimum_area_mm2': least,
                   'far_end_bound_percent_at_minimum_area': 100 * vd_bound(plan, longest, least) / u,
                   'minimum_area_ampacity_ok': breaker <= B2[least] * k}
            # Earth fault at the far point: line and protective conductor of the same area, circuit only.
            # Supply and feeder impedance are left out, so the real current is lower than this.
            for label, a in (('area', area), ('minimum', least)):
                if a is None: res[f'fault_a_at_{label}'] = None; continue
                loop = 2 * RHO / a * longest / 1000
                res[f'fault_a_at_{label}'] = C_MIN * u / loop
                res[f'fault_clears_type_c_at_{label}'] = C_MIN * u / loop >= TRIP['C'] * breaker
                res[f'fault_clears_type_b_at_{label}'] = C_MIN * u / loop >= TRIP['B'] * breaker
                # What is left for the supply, the feeder and the board before a type C device stops tripping at once.
                res[f'loop_allowance_ohm_type_c_at_{label}'] = C_MIN * u / (TRIP['C'] * breaker) - loop
            row['cases'].append(res)
        circuits.append(row)
    circuit = {c['circuit']: c for c in circuits}

    # ------------------------------------------------------------------ zones
    wired = [i for i in item.values() if i['wired']]
    zones = []
    for name in ZONES:
        here = [i for i in wired if zone(i) == name]
        cats = Counter(i['category'] for i in here)
        low = min(here, key=lambda i: i['position'][1] - i['floorY']) if here else None
        high = max(here, key=lambda i: i['position'][1]) if here else None
        zones.append({'zone': name, 'wired_points': len(here), **{c: cats.get(c, 0) for c in ('light', 'fan', 'loudspeaker', 'microphone', 'socket', 'exit sign')},
                      'circuits': sorted({i['circuit'] for i in here}),
                      'connected_fixed_w': sum(i['maximumMainsProxyW'] or 0 for i in here if i['category'] != 'socket'),
                      'full_service_w': sum(full['items'][i['id']]['watts'] for i in here),
                      'within_reach': sum(1 for i in here if i['position'][1] - i['floorY'] < ARM_REACH and i['category'] not in ('microphone',)),
                      'open_to_weather': sum(1 for i in here if exposure(i) == 'open to weather'), 'covered_exterior': sum(1 for i in here if exposure(i) == 'covered exterior'),
                      'lowest': None if not low else {'id': low['id'], 'name': low['name'], 'height_above_floor_m': low['position'][1] - low['floorY']},
                      'highest': None if not high else {'id': high['id'], 'name': high['name'], 'level_m': high['position'][1]}})
    assert sum(z['wired_points'] for z in zones) == len(wired)

    # ------------------------------------------------------------------ geometric screens
    fans = []
    for i in wired:
        if not i['fan']: continue
        f = i['fan']
        lowest = i['position'][1] - (f['rotorDrop'] or 0) if f['kind'] == 'ceiling' else i['position'][1] - f['diameter'] / 2
        fans.append({'id': i['id'], 'name': i['name'], 'type': i['type'], 'circuit': i['circuit'], 'zone': zone(i), 'lowest_moving_part_above_floor_m': lowest - i['floorY'],
                     'diameter_m': f['diameter'], 'mount': i['mount'], 'drop_from_anchor_m': None if i['anchorY'] is None else i['anchorY'] - i['position'][1]})
    reach = sorted(({'id': i['id'], 'name': i['name'], 'category': i['category'], 'circuit': i['circuit'], 'zone': zone(i), 'height_above_floor_m': i['position'][1] - i['floorY'],
                     'exposure': exposure(i)} for i in wired if i['position'][1] - i['floorY'] < ARM_REACH), key=lambda r: (r['zone'], r['category'], r['id']))
    weather = Counter((i['circuit'], exposure(i)) for i in wired)
    exposed = [{'circuit': c, 'label': circuits_meta[c]['label'], 'open_to_weather': weather.get((c, 'open to weather'), 0), 'covered_exterior': weather.get((c, 'covered exterior'), 0),
                'interior': weather.get((c, 'interior'), 0), 'highest_point_m': max(i['position'][1] for i in wired if i['circuit'] == c)}
               for c in sorted({i['circuit'] for i in wired}) if weather.get((c, 'open to weather'), 0) or weather.get((c, 'covered exterior'), 0)]

    # Signal lines near mains routes.
    mains_segments = [(a, b, r['id'], [min(a[i], b[i]) - SEPARATION for i in range(3)], [max(a[i], b[i]) + SEPARATION for i in range(3)])
                      for r in routes if r['kind'] in ('light', 'fan', 'power', 'feeder') for a, b in zip(r['points'], r['points'][1:])]
    separation = []
    for r in routes:
        if r['kind'] not in ('mic', 'audio'): continue
        near = touching = 0.0
        partners = Counter()
        for p, w in samples(r['points'], SAMPLE):
            best, who = SEPARATION, None
            for a, b, rid, lo, hi in mains_segments:
                if any(p[i] < lo[i] or p[i] > hi[i] for i in range(3)): continue
                d = seg_dist(p, a, b)
                if d < best: best, who = d, rid
            if who:
                near += w; partners[who] += w
                if best < .05: touching += w
        separation.append({'route_id': r['id'], 'kind': r['kind'], 'role': r['role'], 'circuit': r['circuit'], 'length_m': r['length'], 'within_0_30_m': near, 'within_0_05_m': touching,
                           'closest_mains_routes': [k for k, _ in partners.most_common(3)]})
    sep_total = {k: {'routes': sum(1 for s in separation if s['kind'] == k), 'length_m': sum(s['length_m'] for s in separation if s['kind'] == k),
                     'within_0_30_m': sum(s['within_0_30_m'] for s in separation if s['kind'] == k), 'within_0_05_m': sum(s['within_0_05_m'] for s in separation if s['kind'] == k)} for k in ('mic', 'audio')}

    methods = defaultdict(float)
    for r in mains: methods[r.get('method') or r['role']] += r['length']
    timber_m = sum(v for k, v in methods.items() if k in TIMBER_METHODS)
    buried = [{'route_id': r['id'], 'circuit': r['circuit'], 'length_m': r['length']} for r in routes if r.get('method') == 'underfloor-event']

    exit_scenes = {name: sc['byCircuit'].get('E1', {}).get('on', 0) for name, sc in facts['scenes'].items()}
    life_safety = {'exit_signs': sum(1 for i in wired if i['category'] == 'exit sign'), 'on_in_every_scene': len(set(exit_scenes.values())) == 1 and min(exit_scenes.values()) > 0,
                   'scene_counts': exit_scenes, 'source': sorted({r['source'] for r in routes if r['circuit'] == 'E1'}),
                   'emergency_luminaires_modelled': 0, 'indoor_sockets_live_in_all_off': facts['scenes']['All off']['byCircuit']['P1']['on'] > 0,
                   'event_points_on_in_any_scene': any(sc['byCircuit'][c]['on'] for sc in facts['scenes'].values() for c in ('P3', 'P4'))}

    # ------------------------------------------------------------------ supply scenarios
    fixed = sum(c['connected_w'] or 0 for c in circuits)
    sockets_in = sum(c['socket_rating_a'] for c in circuits if c['socket_rating_a'] and c['board'] == 'DB1')
    sockets_ev = sum(c['socket_rating_a'] for c in circuits if c['socket_rating_a'] and c['board'] == 'DB2')
    db2_fixed = sum(c['connected_w'] or 0 for c in circuits if c['board'] == 'DB2')
    supply = []
    for case in cases:
        u, pf = case['voltage_v'], case['power_factor']
        base = current(fixed * RESERVE, u, pf)
        # Three phases: place the largest circuits first on the lightest phase.
        phases = [0.0, 0.0, 0.0]
        placed = {}
        for c in sorted(circuits, key=lambda c: -(c['socket_rating_a'] or current((c['connected_w'] or 0) * RESERVE, u, pf))):
            amps = c['socket_rating_a'] or current(c['connected_w'] * RESERVE, u, pf)
            k = phases.index(min(phases)); phases[k] += amps; placed[c['circuit']] = 'L' + str(k + 1)
        a, b, c3 = phases
        db2 = current(db2_fixed * RESERVE, u, pf)
        feeder = []
        for area in (10, 16, 25, 35, 50):
            L = feeder_len['DB2']
            feeder.append({'area_mm2': area, 'ampacity_a': B2[area] * case['temperature_factor'] * case['grouping_factor'],
                           'single_phase_fixed_percent': 100 * vd_bound(db2, L, area) / u, 'single_phase_with_events_percent': 100 * vd_bound(db2 + sockets_ev, L, area) / u,
                           # Balanced three-phase: no neutral current, so one conductor length instead of two.
                           'three_phase_with_events_percent': 100 * vd_bound((db2 + sockets_ev) / 3, L, area) / 2 / u})
        supply.append({'case_id': case['id'], 'voltage_v': u, 'power_factor': pf, 'fixed_known_w': fixed, 'fixed_planning_a': base,
                       'indoor_socket_rating_a': sockets_in, 'event_socket_rating_a': sockets_ev,
                       'single_phase_fixed_a': base, 'single_phase_fixed_plus_indoor_a': base + sockets_in, 'single_phase_everything_a': base + sockets_in + sockets_ev,
                       'three_phase_a': phases, 'three_phase_neutral_a': math.sqrt(max(0, a * a + b * b + c3 * c3 - a * b - b * c3 - c3 * a)), 'three_phase_allocation': placed,
                       'db2_fixed_planning_a': db2, 'db2_with_events_a': db2 + sockets_ev, 'db2_feeder_m': feeder_len['DB2'], 'db2_feeder': feeder})

    # ------------------------------------------------------------------ energy and efficiency
    s = facts['settings']
    hours, per_month, tariff = s['serviceHours'], s['servicesPerMonth'], s['tariff']
    scenes = [{'scene': name, 'watts': sc['totalW'], 'kwh_per_service': sc['totalW'] * hours / 1000, 'kwh_per_month': sc['totalW'] * hours * per_month / 1000,
               'cost_per_month_at_model_tariff': sc['totalW'] * hours * per_month / 1000 * tariff, 'interior_lumens': sc['interiorLumens'], 'exterior_lumens': sc['exteriorLumens'],
               'by_category_w': {k: sum(v['watts'] for c, v in sc['byCircuit'].items() if (circuits_meta.get(c) or {}).get('cat') == k) for k in ('light', 'fan', 'sound', 'decor', 'power')}}
              for name, sc in facts['scenes'].items()]
    full_scene = next(x for x in scenes if x['scene'] == facts['defaultScene'])
    lights = [i for i in wired if i['category'] == 'light']
    interior_light_w = sum(full['items'][i['id']]['watts'] for i in lights if i['interior'] or i['inWing'])
    efficacy = []
    for cid in sorted({i['circuit'] for i in lights}):
        group = [i for i in lights if i['circuit'] == cid and i['light']['itemLumens']]
        lumens, watts = sum(i['light']['itemLumens'] for i in group), sum(i['ratedW'] for i in group)
        if watts: efficacy.append({'circuit': cid, 'label': circuits_meta[cid]['label'], 'fittings': len(group), 'lumens': lumens, 'watts': watts, 'lm_per_w': lumens / watts})
    fan_types = {}
    for i in wired:
        if i['fan'] and i['type'] not in fan_types:
            fan_types[i['type']] = {'type': i['type'], 'product': i['product'], 'count': sum(1 for j in wired if j['type'] == i['type']),
                                    'speeds': [{'speed': n + 1, 'flow_m3_s': sp['flow'], 'watts': sp['watts'], 'dba': sp['dBA'], 'm3_h_per_w': sp['flow'] * 3600 / sp['watts']} for n, sp in enumerate(i['fan']['speeds'])]}
    # Resistive loss in the final circuits at full-service currents, with the tapped trunk current.
    case = cases[0]; u, pf = case['voltage_v'], case['power_factor']
    losses = []
    for c in circuits:
        res = c['cases'][0]
        for label, area in (('comparison', res['comparison_area_mm2']), ('minimum', res['minimum_area_mm2'])):
            if area is None: continue
            r_per_m = RHO / area / 1000
            # Two trunks (B and H) leave the board for most circuits; each tap list is cumulative per trunk.
            loss, per_trunk = 0.0, defaultdict(list)
            for r in by_circuit[c['circuit']]:
                if r['role'] in ('drop', 'local'): per_trunk[r.get('trunkId')].append((r.get('upstreamLength', 0), r['length'], sum(full['items'][i]['watts'] for i in r['itemIds']) / (u * pf)))
            for taps in per_trunk.values():
                taps.sort(key=lambda t: t[0]); downstream, prev = sum(t[2] for t in taps), 0.0
                for up, length, amps in taps:
                    loss += 2 * r_per_m * (up - prev) * downstream ** 2 + 2 * r_per_m * length * amps ** 2
                    prev, downstream = up, downstream - amps
            c.setdefault('full_service_loss_w', {})[label] = loss
        losses.append({'circuit': c['circuit'], 'full_service_w': c['full_service_w'], **{f'loss_w_{k}': v for k, v in c.get('full_service_loss_w', {}).items()}})
    db2_now = sum(c['full_service_w'] for c in circuits if c['board'] == 'DB2') / (u * pf)
    feeder_loss = [{'area_mm2': a, 'loss_w': 2 * RHO / a / 1000 * feeder_len['DB2'] * db2_now ** 2} for a in (10, 16, 25, 35, 50)]
    total_w = sum(c['full_service_w'] for c in circuits)
    loss_comparison = sum(l.get('loss_w_comparison', 0) for l in losses)
    loss_minimum = sum(l.get('loss_w_minimum', 0) for l in losses)
    exit_w = sum(i['ratedW'] for i in wired if i['category'] == 'exit sign')
    facade = sum(c['full_service_w'] for c in circuits if c['circuit'] in ('L6', 'L9', 'L10'))
    energy = {'service_hours': hours, 'services_per_month': per_month, 'tariff_setting': tariff, 'scenes': scenes,
              'floor_area_m2': FLOOR_AREA, 'interior_lighting_w_full_service': interior_light_w, 'lighting_power_density_w_m2': interior_light_w / FLOOR_AREA,
              'seat_lux': facts['seatLux'], 'lux_per_w_m2': facts['seatLux']['mean'] / (interior_light_w / FLOOR_AREA), 'efficacy': efficacy,
              'overall_lm_per_w': sum(e['lumens'] for e in efficacy) / sum(e['watts'] for e in efficacy), 'fans': list(fan_types.values()),
              'final_circuit_mains_w_full_service': total_w, 'loss_w_comparison_areas': loss_comparison, 'loss_w_minimum_areas': loss_minimum,
              'loss_percent_comparison_areas': 100 * loss_comparison / total_w, 'loss_percent_minimum_areas': 100 * loss_minimum / total_w, 'circuit_losses': losses,
              'db2_feeder_full_service_a': db2_now, 'db2_feeder_loss': feeder_loss,
              'annual_service_hours': hours * per_month * 12, 'annual_service_kwh_full_scene': full_scene['watts'] * hours * per_month * 12 / 1000,
              'exit_sign_w': exit_w, 'exit_sign_kwh_per_year_continuous': exit_w * 8760 / 1000,
              'facade_w_full_service': facade, 'facade_kwh_per_year_if_4_h_nightly': facade * 4 * 365 / 1000}

    return {'schema': 1, 'status': 'DERIVED / CONCEPT / ENGINEERING HOLD · comparison screens only',
            'model_git_revision': loads['gitRevision'], 'source_sha256': loads['sourceSha256'], 'default_scene': facts['defaultScene'],
            'assumptions': {'planning_reserve': RESERVE, 'budget_percent_from_db1': BUDGET, 'feeder_share_percent': FEEDER_SHARE, 'voltage_factor_c_min': C_MIN, 'mcb_instantaneous_multiples': TRIP,
                            'copper_resistivity_ohm_mm2_per_km': RHO, 'reactance_ohm_per_km': REACTANCE, 'ampacity_table': 'B2 PVC copper, three loaded conductors (SE-CABLE)',
                            'arm_reach_m': ARM_REACH, 'fan_blade_height_m': FAN_BLADE, 'separation_screen_m': SEPARATION, 'minimum_area_mm2': MIN_AREA, 'comparison_cases': cases},
            'counts': {'shown_items': len(item), 'wired_points': len(wired), 'routes': len(routes), 'mains_routes': len(mains), 'mains_circuits': len(circuits)},
            'zones': zones, 'circuits': circuits, 'fans': fans, 'within_reach': reach, 'exterior_circuits': exposed, 'separation': {'totals': sep_total, 'routes': separation},
            'route_methods_m': dict(sorted(methods.items())), 'timber_roof_and_lining_mains_m': timber_m, 'mains_route_m': sum(r['length'] for r in mains), 'buried_routes': buried,
            'life_safety': life_safety, 'supply': supply, 'energy': energy}


def rounded(value, digits=6):
    if isinstance(value, float): return round(value, digits)
    if isinstance(value, dict): return {k: rounded(v, digits) for k, v in value.items()}
    if isinstance(value, list): return [rounded(v, digits) for v in value]
    return value


def main():
    loads, facts = load_model()
    result = rounded(analyse(loads, facts))
    target = EVIDENCE / 'safety-efficiency-review.json'
    if '--check' in sys.argv:
        saved = json.loads(target.read_text())
        for key in ('model_git_revision', 'source_sha256'): saved.pop(key, None); result.pop(key, None)
        if saved != result: sys.exit('Saved review differs from the current model: rebuild it')
        print('Electrical safety review matches the current model.'); return
    from electrical_safety_report import write_report   # prose kept apart from the calculations
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=1) + '\n')
    with open(EVIDENCE / 'circuit-screens.csv', 'w', newline='') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['circuit', 'label', 'kind', 'board', 'source', 'points', 'connected_w', 'socket_rating_a', 'full_service_w', 'longest_path_m', 'case', 'design_current_a', 'comparison_breaker_a',
                    'loading_percent', 'comparison_area_mm2', 'vdrop_percent_at_area', 'minimum_area_mm2', 'vdrop_percent_at_minimum_area', 'fault_a_at_minimum', 'type_c_instantaneous_a', 'fault_clears_type_c_at_minimum', 'status'])
        for c in result['circuits']:
            for k in c['cases']:
                w.writerow([c['circuit'], c['label'], c['kind'], c['board'], c['source'], c['points'], c['connected_w'], c['socket_rating_a'], c['full_service_w'], c['longest_path_m'], k['case_id'], k['design_current_a'],
                            k['comparison_breaker_a'], k['loading_percent'], k['comparison_area_mm2'], k['vdrop_percent_at_area'], k['minimum_area_mm2'], k['vdrop_percent_at_minimum_area'], k['fault_a_at_minimum'],
                            TRIP['C'] * k['comparison_breaker_a'], k['fault_clears_type_c_at_minimum'], 'ENGINEERING HOLD · comparison screen'])
    with open(EVIDENCE / 'zone-walk.csv', 'w', newline='') as f:
        w = csv.writer(f, lineterminator='\n')
        w.writerow(['zone', 'wired_points', 'lights', 'fans', 'loudspeakers', 'microphones', 'sockets', 'exit_signs', 'circuits', 'connected_fixed_w', 'full_service_w', 'within_reach', 'covered_exterior', 'open_to_weather'])
        for z in result['zones']:
            w.writerow([z['zone'], z['wired_points'], z['light'], z['fan'], z['loudspeaker'], z['microphone'], z['socket'], z['exit sign'], ' '.join(z['circuits']), z['connected_fixed_w'], z['full_service_w'], z['within_reach'], z['covered_exterior'], z['open_to_weather']])
    REPORT.write_text(write_report(result, ISSUE_DATE))
    digest = hashlib.sha256(target.read_bytes()).hexdigest()
    print(f"Electrical safety review: {result['counts']['mains_circuits']} mains circuits, {result['counts']['wired_points']} wired points, {len(result['zones'])} zones. JSON sha256 {digest[:12]}…")


if __name__ == '__main__':
    main()
