/* Tower base and tower tops, metres.
   Owner, 25 October 2026, after the parish priest's meeting (point 5): the tower fronts have no
   opening, only a closed wall with a decorative arch; the tower base, the top and the ornament
   follow the church's CAD file of 23 October 2026. Sources: DWG sheet 1, drawing E01B (front
   elevation; native ARC/CIRCLE/LINE witnesses rechecked 26 Oct 2026 in
   docs/exterior-23102026/tower-witnesses.json) and plan sheet 5. The ground-storey front stays
   closed. Upper-front paired openings, great arches and roses use their own source centres
   and radii instead of fractions of storey height. Offset circular shoulders carry the dome
   to +32.790457; adjoining lantern levels and the trefoil cross outline are traced directly.
   The model keeps the existing rose colour/material choice; CAD outlines do not approve glazing.
   Departure kept on purpose: the stage-1 wall plane stays at X 0 (the plan draws it 0.5 m
   further forward) so the stages above and the fittings on the +8.39 cornice keep their places;
   the piers and the entablature project in front of it as drawn. Moulding profiles, carving and
   depths are illustrative; nothing here implies a structure, a fixing or a construction detail. */
(() => {
  const SOURCE = 'CAD file 23 Oct 2026 · E01B/E02, P05/PT15A/PT23/PT29; rear/inner repeated profiles DERIVED; owner 25/26 Oct 2026';
  const DRAWN = 'TRACED CAD ELEVATION / SCHEMATIC DEPTH';
  const CARVED = 'TRACED CAD ELEVATION / ILLUSTRATIVE CARVING';
  const spec = {
    revision: '2026-10-26-cad-towers-4',
    centre: 10.153, core: 2.45, wall: 0.14, // tower centre |Z|; core half-width; half wall thickness
    top: 8.39,
    pier: { t: [1.95, 3.2], front: [-0.72, 1.0], back: [3.9, 5.1], pedestal: 1.85, shaft: 7.4, capital: 7.85 },
    arch: { spring: 3.984770309, r: [1.385, 1.955], rings: [1.385, 1.555, 1.585, 1.725, 1.755, 1.855, 1.885, 1.955], impost: [1.555, 1.955] },
    blind: { spring: 2.899970309, r: [0.824478702, 1.139478702], rings: [0.824478702, 0.974478702, 1.139478702], colonnette: 1.02, recess: 0.2 },
    // E02 D8DBF9..D8DC00 / D8DF45..D8DF47: the side blind arch is 200.5 mm
    // higher than the street-facing one. It is not a rotated copy of the front base.
    sideBase: { centreX: 2.450044195, greatSpring: 3.984770309,
      greatRings: [1.385, 1.555, 1.585, 1.725, 1.755, 1.855, 1.885, 1.955],
      blindSpring: 3.100470309, blindRings: [0.824478702, 0.974478702, 1.139478702],
      window: { half: .5, sill: .849970309, leafTop: 2.950470309, spring: 3.100470309 },
      pilaster: { radii: [1.385000208, 1.725000208], shaftY: [.443270309, 3.484270309] } },
    entablature: { architrave: [6.95, 7.1], dentils: [7.15, 7.35], frieze: [7.42, 7.78], cornice: [7.85, 8.39] },
    door: { x: [3.4, 4.4], h: 2.3 }, // into each tower from the rear corner of the nave (inner side)
    // E01B C4568C/C45696: circular offset-centre shoulders, not an ellipse.
    // Continuation under the balcony and revolution about X=2.45 are visualization proxies.
    dome: { y0: 29.089970309, bearingLevel: null, wall: 30.512922701, top: 32.790456676, r: 1.979175671,
      arc: { radius: 2.628673654, offset: 0.649346024, y: 30.541187117, start: -0.010752556, end: 1.026838484 },
      rosette: 31.699583764, frontRoseOffset: -0.011541068, roseRings: [0.414212786, 0.444212786], roseInner: 0.345399464 },
    lantern: { plinth: [32.790456676, 32.983342187, 0.756816784], step: [32.983342187, 33.111064968, 0.584190638], base: [33.111064968, 33.231658402, 0.557768729], body: [33.231658402, 33.731658402, 0.557768729], beads: [33.731658402, 33.861658402, 0.582768729], crown: [33.861658402, 35.0, 1.2], ball: 35.212763, ballRadius: 0.210895, cross: [35.409300742, 36.919970309], arm: 36.346670309, crossLobe: 0.0819 },
    // E01B front faces. Centres/radii/levels come from native ARC/CIRCLE/LINE;
    // existing wall depths stay fixed. E02 governs outer sides; repeated inner/rear profiles are DERIVED.
    upperFront: [
      { stage: 2, centre: 10.152934409, sill: 9.049969, great: { y: 12.846612750, rings: [1.615338638, 1.725338638, 1.755338638, 1.855338638, 1.885338638, 1.955338638] }, windows: { centres: [9.257577091, 11.048290635], spring: 11.867964351, rings: [0.499643024, 0.609643024, 0.719643024] }, rose: { y: 13.277964351, rings: [0.45, 0.54], inner: 0.394742245 }, slats: { first: 9.132928638, pitch: 0.277781746, height: 0.2 } },
      { stage: 3, centre: 10.152934409, sill: 16.499969, great: { y: 19.973454138, rings: [1.615, 1.725, 1.75, 1.84, 1.865, 1.925] }, windows: { centres: [9.257934, 11.047934], spring: 19.317964331, rings: [0.5, 0.609643024, 0.719643024] }, rose: { y: 20.612391717, rings: [0.45, 0.54], inner: 0.394742245 }, slats: { first: 16.582928617, pitch: 0.277781746, height: 0.2 } },
      { stage: 4, centre: 10.141458932, sill: 23.799970191, great: { y: 26.610771934, rings: [1.303693158, 1.328693158, 1.418693366, 1.443693366, 1.493693366] }, windows: { centres: [9.457112297, 10.825805559], spring: 26.149595658, rings: [0.399346631, 0.509346631, 0.619346631] }, rose: { y: 27.191525170, rings: [0.414212786, 0.444212786], inner: 0.345399464 }, slats: { first: 23.88293, pitch: 0.27778, height: 0.2, status: 'ILLUSTRATIVE LOUVRE BLADES; HEIGHT/ANGLE NOT SPECIFIED' } },
    ],
    // E02 independent side coordinates (X/Y), see tower-other-faces-witnesses.json.
    upperSide: [{"stage":2,"centreX":2.4500446699580642,"windowCentresX":[1.5546877321228385,3.345401094648987],"roseX":2.4500446881728712},{"stage":3,"centreX":2.450044413367985,"windowCentresX":[1.555044629918877,3.3450446299018806],"roseX":2.4500446881519164},{"stage":4,"centreX":2.438569023472024,"windowCentresX":[1.754222392366035,3.1229156545789447],"roseX":2.4385692107288635}],
    // Native E01B/E02 parapet profiles. Band separation is a display proxy, not structural wall thickness.
    balcony: {
      "front": {
        "drawing": "E01B",
        "centre": 10.141458745,
        "field": [
          [
            8.173758453,
            29.089970309
          ],
          [
            12.109159036,
            29.089970309
          ],
          [
            12.109159036,
            29.980046364
          ],
          [
            8.173758453,
            29.980046364
          ]
        ],
        "posts": [
          [
            [
              7.619158453,
              29.089970309
            ],
            [
              8.173758453,
              29.089970309
            ],
            [
              8.173758453,
              29.980046364
            ],
            [
              7.619158453,
              29.980046364
            ]
          ],
          [
            [
              12.109159036,
              29.089970309
            ],
            [
              12.663759036,
              29.089970309
            ],
            [
              12.663759036,
              29.980046364
            ],
            [
              12.109159036,
              29.980046364
            ]
          ]
        ],
        "insets": [
          [
            [
              7.816458453,
              29.169970309
            ],
            [
              8.106458453,
              29.169970309
            ],
            [
              8.106458453,
              29.900046364
            ],
            [
              7.816458453,
              29.900046364
            ]
          ],
          [
            [
              12.176459036,
              29.169970309
            ],
            [
              12.466459036,
              29.169970309
            ],
            [
              12.466459036,
              29.900046364
            ],
            [
              12.176459036,
              29.900046364
            ]
          ]
        ],
        "holeCentres": [
          8.381458745,
          8.601458745,
          8.821458745000001,
          9.041458745,
          9.261458745,
          9.481458745,
          9.701458745,
          9.921458744999999,
          10.141458745,
          10.361458745,
          10.581458744999999,
          10.801458745,
          11.021458745,
          11.241458745,
          11.461458745,
          11.681458745,
          11.901458745
        ],
        "cornice": [
          {
            "y": 29.089970309,
            "u": [
              7.324290683,
              12.958626807
            ]
          },
          {
            "y": 28.993970309,
            "u": [
              7.324290683,
              12.958626807
            ]
          },
          {
            "y": 28.945970309,
            "u": [
              7.375487769,
              12.907429721
            ]
          },
          {
            "y": 28.825970309,
            "u": [
              7.475598101,
              12.807319388
            ]
          },
          {
            "y": 28.778266564,
            "u": [
              7.475598101,
              12.807319388
            ]
          }
        ],
        "rail": [
          {
            "y": 30.080961566,
            "u": [
              7.538958453,
              12.743959036
            ]
          },
          {
            "y": 30.017889564,
            "u": [
              7.538958453,
              12.743959036
            ]
          },
          {
            "y": 29.980046364,
            "u": [
              7.575051835,
              12.707865654
            ]
          }
        ]
      },
      "side": {
        "drawing": "E02",
        "centre": 2.4385690234685313,
        "field": [
          [
            0.47086873146853137,
            29.089970309
          ],
          [
            4.406269314468531,
            29.089970309
          ],
          [
            4.406269314468531,
            29.980046364
          ],
          [
            0.47086873146853137,
            29.980046364
          ]
        ],
        "posts": [
          [
            [
              -0.0837312685314684,
              29.089970309
            ],
            [
              0.47086873146853137,
              29.089970309
            ],
            [
              0.47086873146853137,
              29.980046364
            ],
            [
              -0.0837312685314684,
              29.980046364
            ]
          ],
          [
            [
              4.406269314468531,
              29.089970309
            ],
            [
              4.960869314468532,
              29.089970309
            ],
            [
              4.960869314468532,
              29.980046364
            ],
            [
              4.406269314468531,
              29.980046364
            ]
          ]
        ],
        "insets": [
          [
            [
              0.11356873146853186,
              29.169970309
            ],
            [
              0.4035687314685319,
              29.169970309
            ],
            [
              0.4035687314685319,
              29.900046364
            ],
            [
              0.11356873146853186,
              29.900046364
            ]
          ],
          [
            [
              4.4735693144685325,
              29.169970309
            ],
            [
              4.763569314468532,
              29.169970309
            ],
            [
              4.763569314468532,
              29.900046364
            ],
            [
              4.4735693144685325,
              29.900046364
            ]
          ]
        ],
        "holeCentres": [
          0.6785690234689974,
          0.8985690234685317,
          1.118569023468066,
          1.338569023468066,
          1.558569023468066,
          1.778569023468066,
          1.998569023468066,
          2.218569023468066,
          2.438569023468066,
          2.6585690234680657,
          2.8785690234680663,
          3.098569023468066,
          3.318569023468066,
          3.538569023468066,
          3.758569023468066,
          3.978569023468066,
          4.198569023468066
        ],
        "cornice": [
          {
            "y": 29.089970309354698,
            "u": [
              -0.3785990383590106,
              5.255737085295841
            ]
          },
          {
            "y": 28.993970309354395,
            "u": [
              -0.3785990383590106,
              5.255737085295841
            ]
          },
          {
            "y": 28.94597030935438,
            "u": [
              -0.3274019524629693,
              5.204539999400964
            ]
          },
          {
            "y": 28.82597030935349,
            "u": [
              -0.2272916199050378,
              5.104429666843033
            ]
          },
          {
            "y": 28.77826656370994,
            "u": [
              -0.2272916199050378,
              5.104429666843033
            ]
          }
        ],
        "rail": [
          {
            "y": 30.080961565534658,
            "u": [
              -0.16393126797606236,
              5.041069314911962
            ]
          },
          {
            "y": 30.017889564282015,
            "u": [
              -0.16393126797606236,
              5.0410693149128925
            ]
          },
          {
            "y": 29.980046363530175,
            "u": [
              -0.12783788575208746,
              5.0049759326870555
            ]
          }
        ]
      },
      "hole": [
        [
          0.054999999999999716,
          29.234970307
        ],
        [
          0.02999999999999936,
          29.234970307
        ],
        [
          0.02999999999999936,
          29.209970307
        ],
        [
          -0.02999999999999936,
          29.209970307
        ],
        [
          -0.02999999999999936,
          29.234970307
        ],
        [
          -0.054999999999999716,
          29.234970307
        ],
        [
          -0.054999999999999716,
          29.905046364
        ],
        [
          -0.02999999999999936,
          29.905046364
        ],
        [
          -0.02999999999999936,
          29.930046364
        ],
        [
          0.02999999999999936,
          29.930046364
        ],
        [
          0.02999999999999936,
          29.905046364
        ],
        [
          0.054999999999999716,
          29.905046364
        ]
      ],
      "frontX": 0.19500543898530304,
      "rearX": 4.704994144713739,
      "bandSeparation": 0.06,
      "structuralThickness": null,
      "finialTop": 31.551770883003535,
      "finialOffset": 2.19
    },
    pinnacle: { at: 2.19, y: 30.080961566, top: 31.551770883, h: 1.470809317,
      status: 'NATIVE APEX OFFSET AND HEIGHT / CARVING AND HIDDEN PLAN PROXY' },
    // Parish priest, 25 Oct 2026: a stair inside the right tower (right on site and in the
    // drawings: the B-side tower, ENG-027), up to a floor at +8.39 m. Concept: a square stair round
    // the room walls, 0.9 m flights, corner landings, 44 risers. Headroom, riser/going limits,
    // guarding, fire separation and the floor structure are on engineering hold.
    stair: { side: -1, width: 0.9, risers: 44, going: 0.28 },
    // Corner piers of the upper stages (E01B): pedestal block, fluted pilaster, foliate capital
    // band, dentils and cornice, the cornice top at the stage level. `u` is the model's stage
    // depth (X); the piers stand 0.45 m in front of and behind it.
    stages: [
      { y: [8.39, 15.84], t: [1.8, 3.05], u: 4.72, cap: [15.0, 15.3] },
      { y: [15.84, 23.14], t: [1.8, 3.05], u: 4.52, cap: [22.35, 22.65] },
      { y: [23.14, 29.09], t: [1.75, 2.6], u: 3.95, cap: [28.4, 28.75] },
    ],
  };
  // Front face of the corner piers of each stage (stage 1 first) and the pier centre, for fittings.
  spec.pierFront = [spec.pier.front[0], ...spec.stages.map(g => 2.45 - g.u / 2 - 0.45)];
  spec.pierCentre = [(spec.pier.t[0] + spec.pier.t[1]) / 2, ...spec.stages.map(g => (g.t[0] + g.t[1]) / 2)];
  window.CHURCH_TOWERS = { spec, prepare, ornament };

  // Carved ornament shared with roofline.js: fleur-de-lis finial, flat foliate pilaster capital,
  // Greek-key frieze and a leaf spray, each built facing +Z with its base at the origin.
  function ornament(T, K) {
    const { TR, RX, RZ, SC, place, merge } = K;
    const fleur = h => {
      const parts = [[K.leaf({ len: h * .62, wid: h * .26, thick: h * .05, curl: .3, lobes: 0, cup: .25, seg: 6, fine: false }), TR(0, h * .34, 0)],
        [new T.BoxGeometry(h * .34, h * .07, h * .12), TR(0, h * .3, 0)], [new T.BoxGeometry(h * .09, h * .3, h * .09), TR(0, h * .15, 0)]];
      const petal = K.stem([[h * .04, h * .32, 0], [h * .2, h * .42, 0], [h * .27, h * .6, 0], [h * .2, h * .74, 0], [h * .11, h * .68, 0]], h * .045, h * .018, 10, 5);
      for (const e of [-1, 1]) parts.push([petal, SC(e, 1, 1)]);
      return merge(parts);
    };
    const capitalCache = new Map();
    const pilasterCapital = (w, h) => {
      const key = w.toFixed(3) + '|' + h.toFixed(3);
      if (capitalCache.has(key)) return capitalCache.get(key);
      const n = Math.max(3, Math.round(w / .2)), parts = [];
      const blade = K.leaf({ len: h * .78, wid: w / n * 1.3, thick: .025, curl: 1.7, lobes: 3, cup: .25, seg: 6 });
      for (let i = 0; i < n; i++) parts.push([blade, place(RX(.12), TR(-w / 2 + (i + .5) * w / n, h * .04, .01))]);
      const volute = K.stem(K.scroll(0, 0, h * .14, 1.2, -Math.PI / 2, 1), .02, .008, 10, 5);
      for (const e of [-1, 1]) parts.push([volute, place(SC(e, 1, 1), TR(e * (w / 2 - h * .1), h * .74, .02))]);
      const g = merge(parts); capitalCache.set(key, g); return g;
    };
    const meanderGeo = (len, h) => {
      const u = .31, t = .035, m = .035, depth = .03, parts = [];
      const bar = (a, b, c, d) => parts.push([new T.BoxGeometry(b - a, d - c, depth), TR((a + b) / 2, (c + d) / 2, depth / 2)]);
      bar(0, len, m, m + t); bar(0, len, h - m - t, h - m);
      for (let x = 0; x + u <= len + 1e-6; x += u) {
        bar(x, x + t, m, h - m); bar(x + .8 * u - t, x + .8 * u, .3 * h, h - m);
        bar(x + .4 * u, x + .8 * u, .3 * h, .3 * h + t); bar(x + .4 * u, x + .4 * u + t, .3 * h, .66 * h);
        bar(x + .4 * u, x + .62 * u, .66 * h - t, .66 * h);
      }
      return merge(parts);
    };
    const spray = h => {
      const parts = [], stemG = K.stem([[0, 0, 0], [h * .35, h * .25, 0], [h * .7, h * .15, 0], [h * .95, h * .32, 0]], .03, .012, 14, 5);
      parts.push([stemG, null], [K.stem(K.scroll(h * .95, h * .42, h * .1, 1.2, 0, 1), .022, .008, 10, 5), null]);
      const blade = K.leaf({ len: h * .32, wid: h * .16, thick: .025, curl: 1.4, lobes: 3, seg: 5, fine: false });
      for (const [u, v, a] of [[h * .2, h * .12, .6], [h * .45, h * .22, 2.3], [h * .62, h * .12, .9], [h * .82, h * .22, 2.1]]) parts.push([blade, place(RZ(-a), TR(u, v, 0))]);
      return merge(parts);
    };
    return { fleur, pilasterCapital, meanderGeo, spray };
  }


  function prepare({ THREE: T, exterior, building, mat, data }) {
    if (!exterior) return;
    exterior.updateMatrixWorld(true);
    const K = window.CHURCH_CARVING.create(T);
    const { TR, RY, RX, RZ, SC, place, merge } = K;
    const towers = [];
    exterior.traverse(o => { if (/^Tower (A–C|G–I) \/ 1–2$/.test(o.name)) towers.push(o); });
    if (towers.length !== 2) return;

    // ---- Superseded bundle parts ----
    let crossMaterial = mat.metal;
    const remove = [], upperFronts = [], upperOtherFaces = [], box3 = new T.Box3();
    const oldBalcony = new Set(['Balcony corbel','Balcony cornice moulding','Balcony plinth','Balustrade rail','Baluster base','Baluster belly','Baluster neck','Balustrade corner pedestal','Pedestal cap']);
    const capNames = /^(Tower cap profile|Schematic cap rib|Cap pedestal|Continuous cap cross support|Cross — apex is source height|Cross transverse arm|Urn (foot|body|shoulder|finial)|Dome drum|Schematic rose-window infill|Schematic rosette (ring|ray))/;
    for (const tower of towers) {
      // The four stage-1 wall groups (front, sides, back); realism.js has already rebuilt the rear one.
      for (const g of tower.children) if (g.children.some(m => m.name === 'Tower stage 1 wall')) remove.push(g);
      // The old upper fronts used fractions of the storey height for arches and roses.
      // Keep actual wall planes/footprints; replace each face assembly and preserve its cornice.
      for (const g of tower.children) {
        const wall = g.children.find(m => /^Tower stage [2-4] wall$/.test(m.name));
        if (!wall) continue;
        const b = new T.Box3().setFromObject(wall);
        let roseMaterial;
        g.traverse(o => { if (o.isMesh && o.name === 'Schematic rose-window infill') roseMaterial = o.material; });
        if (g.position.x < 0) {
          upperFronts.push({ side: Math.sign(tower.position.z), stage: Number(wall.name.match(/stage (\d)/)[1]),
            x: [b.min.x, b.max.x], y: [b.min.y, b.max.y], half: (b.max.z - b.min.z) / 2, roseMaterial });
        } else {
          wall.geometry.computeBoundingBox();
          upperOtherFaces.push({ side: Math.sign(tower.position.z), stage: Number(wall.name.match(/stage (\d)/)[1]),
            kind: g.position.x > 0 ? 'rear' : Math.sign(g.position.z) === Math.sign(tower.position.z) ? 'outer' : 'inner',
            half: wall.geometry.boundingBox.max.x, y: [b.min.y, b.max.y], matrix: g.matrixWorld.clone(), roseMaterial });
        }
        // The face group also owns the continuous top cornice and its corbels.
        // They are not part of the generic window/arch replacement: retain their
        // world transforms and existing light-bearing lip, especially the +29.09 ledge.
        const cornice = [];
        g.traverse(o => { if (o.isMesh && new T.Box3().setFromObject(o).min.y >= b.max.y - .75) cornice.push(o); });
        cornice.forEach(o => tower.attach(o));
        remove.push(g);
      }
      tower.traverse(o => {
        if (!o.isMesh) return;
        if (oldBalcony.has(o.name)) remove.push(o);
        if (o.name === 'Cross — apex is source height') crossMaterial = o.material;
        box3.setFromObject(o);
        if (o.name === 'Tower continuous cornice' && box3.max.y < 8.6) remove.push(o);
        else if (capNames.test(o.name) && box3.min.y > 29.0) remove.push(o);
        else if (!o.name && box3.min.y > 32.5) remove.push(o); // unnamed parts of the old cross
      });
    }
    remove.forEach(o => o.removeFromParent());
    const empty = [];
    towers.forEach(t => t.traverse(o => { if (o !== t && o.type === 'Group' && !o.children.length) empty.push(o); }));
    empty.forEach(o => o.removeFromParent());

    // The grey stone plinth under each tower is widened so that the corner piers stand on it
    // all the way down to the courtyard (owner, 25 Oct 2026: there was a gap under the piers
    // where they overhang the old 5.8 × 6.65 m plinth). New extent: X −1.2 to 5.4, |Z| 6.75 to
    // 13.62 (the outer face of the side projection plinth), −2.08 to 0.
    const footing = { x: [-1.2, 5.4], z: [6.75, 13.62], y: [-2.08, 0] };
    spec.footing = footing;
    (building || exterior).traverse(o => {
      if (!o.isMesh || o.name !== 'Tower plinth') return;
      const s = Math.sign(o.getWorldPosition(new T.Vector3()).z) || 1;
      o.geometry.dispose();
      o.geometry = new T.BoxGeometry(footing.x[1] - footing.x[0], footing.y[1] - footing.y[0], footing.z[1] - footing.z[0]);
      const local = o.parent.worldToLocal(new T.Vector3((footing.x[0] + footing.x[1]) / 2, (footing.y[0] + footing.y[1]) / 2, s * (footing.z[0] + footing.z[1]) / 2));
      o.position.copy(local); o.scale.set(1, 1, 1);
      o.userData.status = 'SOURCE GRID / PLINTH WIDENED UNDER THE CAD CORNER PIERS';
    });
    const root = new T.Group();
    root.name = 'Tower bases and tops — CAD file 23 Oct 2026';
    root.userData = { status: DRAWN, source: SOURCE, revision: spec.revision };
    exterior.add(root);
    const bins = new Map();
    const add = (name, material, geometry, matrix = null, status = DRAWN) => {
      const key = name + '\u0000' + material.uuid;
      if (!bins.has(key)) bins.set(key, { name, material, status, parts: [] });
      bins.get(key).parts.push([geometry, matrix]);
    };
    const W = mat.wall, S = mat.trim, D = mat.darkTrim, CAP = mat.cap || mat.wall;
    const stats = { piers: 0, blindArches: 0, upperFronts: 0, removedBundleMeshes: remove.length };

    // ---- Shared carving (also used by roofline.js) ----
    const { fleur, pilasterCapital, meanderGeo, spray } = ornament(T, K);
    // Each tower face has its own frame: u along the face, v up, w out of the face.
    // face(s, kind) → function mapping (u, v, w) to a world matrix and box helpers.
    const both = fn => { for (const s of [-1, 1]) fn(s); };

    both(s => {
      const zc = s * spec.centre, C = spec.core, P = spec.pier, E = spec.entablature;
      const Z = t => zc + s * t; // t outward from the tower centre
      const block = (name, material, [x0, x1], [y0, y1], [t0, t1], status) => {
        const z0 = Z(t0), z1 = Z(t1);
        add(name, material, new T.BoxGeometry(x1 - x0, y1 - y0, Math.abs(z1 - z0)), TR((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), status);
      };
      // Faces: front (normal −X, u = t), outer side (normal +s·Z, u = X − 2.45), inner side
      // (normal −s·Z), back (normal +X). Local frame: x = u, y = v, z = out of the face.
      const frames = {
        front: (u, v, w) => place(RY(-Math.PI / 2), TR(-spec.wall - w, v, Z(u))),
        outer: (u, v, w) => place(RY(s > 0 ? 0 : Math.PI), TR(C + u, v, Z(C + spec.wall + w))),
        inner: (u, v, w) => place(RY(s > 0 ? Math.PI : 0), TR(C - u, v, Z(-C - spec.wall - w))),
      };
      // The front frame's local x runs along +Z; for the B tower that is inward, so mirror u.
      const at = (face, u, v, w, ...pre) => place(...pre, SC(face === 'front' ? s : 1, 1, 1)).premultiply(frames[face](u, v, w));
      // Slab shape in a face frame, extruded from w0 to w1 out of the face.
      const slab = (name, material, face, shape, w0, w1, status, segments = 24) => {
        const g = new T.ExtrudeGeometry(shape, { depth: w1 - w0, bevelEnabled: false, curveSegments: segments });
        add(name, material, g, at(face, 0, 0, w0), status);
      };
      const ring = (cx, cy, r0, r1, legs = 0) => {
        const sh = new T.Shape();
        sh.moveTo(cx + r1, cy - legs); sh.lineTo(cx + r1, cy); sh.absarc(cx, cy, r1, 0, Math.PI, false); sh.lineTo(cx - r1, cy - legs);
        sh.lineTo(cx - r0, cy - legs); sh.lineTo(cx - r0, cy); sh.absarc(cx, cy, r0, Math.PI, 0, true); sh.lineTo(cx + r0, cy - legs);
        return sh;
      };
      const archHole = (cx, half, y0, spring) => { const p = new T.Path(); p.moveTo(cx - half, y0); p.absarc(cx, spring, half, Math.PI, 0, true); p.lineTo(cx + half, y0); p.lineTo(cx - half, y0); return p; };
      const rect = (u0, u1, v0, v1) => { const sh = new T.Shape(); sh.moveTo(u0, v0); sh.lineTo(u1, v0); sh.lineTo(u1, v1); sh.lineTo(u0, v1); sh.lineTo(u0, v0); return sh; };

      // ---- Stage-1 walls: closed front and outer side, a door in the inner side ----
      block('Tower base wall · closed front (owner 25 Oct 2026)', W, [-spec.wall, spec.wall], [0, spec.top], [-C - spec.wall, C + spec.wall]);
      {
        const SB = spec.sideBase, side = rect(-C - spec.wall, C + spec.wall, 0, spec.top);
        side.holes.push(archHole(SB.centreX - C, SB.window.half, SB.window.sill, SB.window.spring));
        slab('Tower base wall · outer side', W, 'outer', side, -2 * spec.wall, 0);
      }
      {
        const [d0, d1] = spec.door.x, wall = rect(-spec.wall, 2 * C + spec.wall, 0, spec.top);
        const hole = new T.Path(); hole.moveTo(d0, 0); hole.lineTo(d0, spec.door.h); hole.lineTo(d1, spec.door.h); hole.lineTo(d1, 0); hole.lineTo(d0, 0);
        wall.holes.push(hole);
        // Shape x along world X; extruded across the wall thickness on the inner side.
        const g = new T.ExtrudeGeometry(wall, { depth: 2 * spec.wall, bevelEnabled: false });
        add('Tower base wall · inner side with door to the nave', W, g, place(TR(0, 0, -spec.wall), SC(1, 1, s), TR(0, 0, Z(-C))));
        block('Tower room door leaf · timber, closed', mat.wood || D, [d0 + .02, d1 - .02], [0, spec.door.h - .02], [-C - .02, -C + .03]);
      }
      // ---- Corner piers: pedestal, fluted shaft, foliate capital band, cornice ----
      const piers = [[P.front, 1], [P.front, -1], [P.back, 1], [P.back, -1]];
      for (const [[x0, x1], side] of piers) {
        const [t0, t1] = side > 0 ? P.t : [-P.t[1], -P.t[0]];
        const grow = (a, d) => [a[0] - d, a[1] + d];
        block('Tower corner pier plinth', S, grow([x0, x1], .22), [0, .35], grow([t0, t1], .12));
        block('Tower corner pier pedestal', W, grow([x0, x1], .12), [.35, 1.55], grow([t0, t1], .07));
        block('Tower corner pier pedestal cap', S, grow([x0, x1], .17), [1.55, 1.7], grow([t0, t1], .1));
        block('Tower corner pier base moulding', S, grow([x0, x1], .07), [1.7, P.pedestal], grow([t0, t1], .05));
        block('Tower corner pier shaft', W, [x0, x1], [P.pedestal, P.shaft], [t0, t1]);
        // Pilaster strips with three flutes on each exposed face.
        const front = x0 < 0, outer = side > 0;
        if (front) for (const tm of [(t0 + t1) / 2]) {
          block('Tower pier pilaster', W, [x0 - .06, x0], [P.pedestal + .02, P.shaft], [tm - .3, tm + .3]);
          for (const k of [-1, 0, 1]) block('Tower pier flute', D, [x0 - .068, x0 - .055], [P.pedestal + .2, P.shaft - .12], [tm + k * .16 - .022, tm + k * .16 + .022]);
          add('Tower pier capital foliage', S, pilasterCapital(.7, (P.capital - P.shaft) * .9), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(x0 - .07, P.shaft, Z(tm))), CARVED);
        }
        if (outer || !front) {
          const xm = (x0 + x1) / 2, tf = outer ? t1 : t0, dir = outer ? 1 : -1;
          block('Tower pier pilaster', W, [xm - .3, xm + .3], [P.pedestal + .02, P.shaft], [tf, tf + dir * .06].sort((a, b) => a - b));
          for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xm + k * .16 - .022, xm + k * .16 + .022], [P.pedestal + .2, P.shaft - .12], [tf + dir * .055, tf + dir * .068].sort((a, b) => a - b));
          add('Tower pier capital foliage', S, pilasterCapital(.7, (P.capital - P.shaft) * .9), place(RY(dir * s > 0 ? 0 : Math.PI), TR(xm, P.shaft, Z(tf + dir * .07))), CARVED);
        }
        block('Tower pier capital band', S, grow([x0, x1], .04), [P.shaft, P.capital], grow([t0, t1], .04));
        stats.piers++;
      }
      // ---- Entablature round the base: architrave, dentils, Greek-key frieze, cornice ----
      // As drawn, it breaks forward over the piers; between them it stands on the wall.
      const wallFace = -spec.wall;
      const entab = (name, mat_, xs, ys, ts) => block(name, mat_, xs, ys, ts);
      // Front, between the piers.
      entab('Tower base architrave', S, [wallFace - .18, wallFace], E.architrave, [-P.t[0], P.t[0]]);
      for (let t = -P.t[0] + .06; t <= P.t[0] - .05; t += .12) entab('Tower base dentil', S, [wallFace - .16, wallFace], E.dentils, [t, t + .06]);
      entab('Tower base frieze', W, [wallFace - .1, wallFace], [E.dentils[1], E.cornice[0]], [-P.t[0], P.t[0]]);
      add('Tower base Greek-key frieze', S, meanderGeo(2 * P.t[0], E.frieze[1] - E.frieze[0]), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .1, E.frieze[0], Z(-P.t[0]))), CARVED);
      // Cornice over everything, stepping out; its top is the +8.39 ledge the tower floods stand on.
      // Between the piers the cornice keeps the old 0.30 m lip, where the tower floods stand;
      // over the piers it breaks forward with them, as drawn.
      const core = { x: [-spec.wall, 2 * C + spec.wall], t: [-C - spec.wall, C + spec.wall] };
      for (const [dy, out, m] of [[[E.cornice[0], 7.98], .1, S], [[7.98, 8.2], .2, W], [[8.2, spec.top], .24, S]]) { // top lip at the old cornice cap, 0.38 m from the wall centre
        block('Tower base cornice', m, [core.x[0] - out, core.x[1] + out], dy, [core.t[0] - out, core.t[1] + out]);
        for (const [[x0, x1], side] of piers) {
          const [t0, t1] = side > 0 ? P.t : [-P.t[1], -P.t[0]];
          block('Tower base cornice', m, [x0 - out, x1 + out], dy, [t0 - out, t1 + out]);
        }
      }
      // Side faces between piers: architrave, frieze and dentils on the outer side.
      entab('Tower base architrave', S, [P.front[1], P.back[0]], E.architrave, [C + spec.wall, C + spec.wall + .18]);
      for (let x = P.front[1] + .06; x <= P.back[0] - .05; x += .12) entab('Tower base dentil', S, [x, x + .06], E.dentils, [C + spec.wall, C + spec.wall + .16]);
      add('Tower base Greek-key frieze', S, meanderGeo(P.back[0] - P.front[1], E.frieze[1] - E.frieze[0]), place(RY(s > 0 ? 0 : Math.PI), TR(s > 0 ? P.front[1] : P.back[0], E.frieze[0], Z(C + spec.wall + .1))), CARVED);

      // ---- Floor at +8.39 in each tower room; the stair in the B-side tower ----
      {
        const r0 = [spec.wall, 2 * C - spec.wall], q0 = [-C + spec.wall, C - spec.wall], ST = spec.stair, wd = ST.width;
        const floorAt = (xs, ts) => block('Tower room floor +8.39 · concept', W, xs, [spec.top - .2, spec.top - .02], ts, 'CONCEPT · ENGINEERING HOLD');
        if (s !== ST.side) floorAt(r0, q0);
        else {
          floorAt(r0, [q0[0], q0[0] + wd]); floorAt(r0, [q0[1] - wd, q0[1]]);
          floorAt([r0[0], r0[0] + wd], [q0[0] + wd, q0[1] - wd]); floorAt([r0[1] - wd, r0[1]], [q0[0] + wd, q0[1] - wd]);
          // Round the walls: front wall (inner → outer), outer wall (front → back), back wall
          // (outer → inner), inner wall (back → front), arriving over the start.
          const rise = (spec.top - .02) / ST.risers, len = r0[1] - r0[0] - 2 * wd;
          let k = 0;
          const tread = (xs, ts, y) => block('Tower stair tread · concept', S, xs, [y - .05, y], ts, 'CONCEPT · ENGINEERING HOLD');
          // Flight f, tread i of m: its extent along the wall it climbs.
          const flights = [
            (i, g) => [[r0[0], r0[0] + wd], [q0[0] + wd + i * g, q0[0] + wd + (i + 1) * g]],
            (i, g) => [[r0[0] + wd + i * g, r0[0] + wd + (i + 1) * g], [q0[1] - wd, q0[1]]],
            (i, g) => [[r0[1] - wd, r0[1]], [q0[1] - wd - (i + 1) * g, q0[1] - wd - i * g]],
            (i, g) => [[r0[1] - wd - (i + 1) * g, r0[1] - wd - i * g], [q0[0], q0[0] + wd]],
          ];
          const landings = [[[r0[0], r0[0] + wd], [q0[1] - wd, q0[1]]], [[r0[1] - wd, r0[1]], [q0[1] - wd, q0[1]]], [[r0[1] - wd, r0[1]], [q0[0], q0[0] + wd]]];
          const per = (ST.risers - 4) / 4;
          for (let f = 0; f < 4; f++) {
            const m = Math.round(per * (f + 1)) - Math.round(per * f);
            for (let i = 0; i < m; i++) { k++; const [xs, ts] = flights[f](i, len / m); tread(xs, ts, k * rise); }
            if (f < 3) { k++; const [xs, ts] = landings[f]; block('Tower stair landing · concept', S, xs, [k * rise - .12, k * rise], ts, 'CONCEPT · ENGINEERING HOLD'); }
          }
          // Handrail along the open well.
          const well = [[r0[0] + wd, q0[0] + wd], [r0[0] + wd, q0[1] - wd], [r0[1] - wd, q0[1] - wd], [r0[1] - wd, q0[0] + wd]];
          for (let f = 0; f < 4; f++) {
            const [a, b] = [well[f], well[(f + 1) % 4]], y0 = (f * (per + 1) + 1) * rise + .95, y1 = ((f + 1) * (per + 1)) * rise + .9;
            add('Tower stair handrail · concept', S, K.stem([[a[0], y0, Z(a[1])], [b[0], Math.min(y1, spec.top + .95), Z(b[1])]], .03, .03, 2, 6));
          }
          stats.stairRisers = k + 1;
        }
      }

      // ---- Upper front elevations: native E01B arcs, window sills and rose circles ----
      for (const U of spec.upperFront) {
        const F = upperFronts.find(f => f.side === s && f.stage === U.stage);
        if (!F) continue;
        const label = `Tower ${s > 0 ? 'H' : 'B'} stage ${U.stage} · `, xf = F.x[0], xb = F.x[1];
        const cg = U.centre - spec.centre, WI = U.windows;
        const uslab = (name, material, shape, front, back, status = DRAWN) => {
          const geometry = new T.ExtrudeGeometry(shape, { depth: back - front, bevelEnabled: false, curveSegments: 48 });
          add(label + name, material, geometry, place(SC(s, 1, 1), RY(-Math.PI / 2), TR(back, 0, zc)), status);
        };
        const face = rect(-F.half, F.half, F.y[0], F.y[1]);
        for (const centre of WI.centres) face.holes.push(archHole(centre - spec.centre, WI.rings[0], U.sill, WI.spring));
        uslab('wall with paired louvre apertures', W, face, xf, xb);
        // All radial boundaries are source arcs; only relief depths are illustrative.
        for (let i = 0; i < U.great.rings.length - 1; i++)
          uslab('great arch ring', i % 2 ? W : S, ring(cg, U.great.y, U.great.rings[i], U.great.rings[i + 1]), xf - .10 - .012 * i, xf + .01);
        for (const e of [-1, 1]) {
          const r0 = U.great.rings[0], r1 = U.great.rings[1];
          block(label + 'great arch pilaster', S, [xf - .10, xf + .01], [U.sill, U.great.y - .46], [cg + e * r0, cg + e * r1].sort((a, b) => a - b));
          block(label + 'great arch capital', S, [xf - .15, xf + .01], [U.great.y - .46, U.great.y], [Math.min(cg + e * r0, cg + e * r1) - .06, Math.max(cg + e * r0, cg + e * r1) + .06]);
          add(label + 'great arch capital foliage', S, pilasterCapital(.3, .42), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(xf - .16, U.great.y - .44, Z(cg + e * (r0 + r1) / 2))), CARVED);
        }
        for (const centre of WI.centres) {
          const u = centre - spec.centre, r = WI.rings[0];
          for (let i = 0; i < WI.rings.length - 1; i++)
            uslab('paired louvre archivolt', S, ring(u, WI.spring, WI.rings[i], WI.rings[i + 1]), xf - .13 - .025 * i, xf + .01);
          for (const e of [-1, 1]) block(label + 'paired louvre jamb', S, [xf - .11, xf + .01], [U.sill, WI.spring], [u + e * r, u + e * WI.rings[2]].sort((a, b) => a - b));
          const leaf = new T.Shape(); leaf.moveTo(u - r, U.sill); leaf.lineTo(u + r, U.sill);
          leaf.lineTo(u + r, WI.spring); leaf.absarc(u, WI.spring, r, 0, Math.PI, false); leaf.lineTo(u - r, U.sill); leaf.closePath();
          uslab('paired louvre backing', D, leaf, xf + .16, xf + .18, 'TRACED CAD APERTURE / SCHEMATIC CLOSED SHUTTER DEPTH');
          const clear = r * 2 - .03, stop = WI.spring - .14;
          block(label + 'paired louvre timber frame', mat.wood, [xf + .07, xf + .14], [U.sill, stop], [u - r, u - r + .015]);
          block(label + 'paired louvre timber frame', mat.wood, [xf + .07, xf + .14], [U.sill, stop], [u + r - .015, u + r]);
          for (let y = U.slats.first; y < stop - .001; y += U.slats.pitch)
            block(label + 'paired louvre blade', mat.wood, [xf + .075, xf + .13], [y, Math.min(y + U.slats.height, stop)], [u - clear / 2, u + clear / 2], U.slats.status || 'TRACED CAD BLADE FACE / SCHEMATIC DEPTH AND ANGLE');
          block(label + 'paired louvre sill', S, [xf - .12, xb], [U.sill - .05, U.sill], [u - WI.rings[2], u + WI.rings[2]]);
        }
        const RO = U.rose, major = (RO.rings[0] + RO.rings[1]) / 2, minor = (RO.rings[1] - RO.rings[0]) / 2;
        const roseMatrix = place(RY(-Math.PI / 2), TR(xf - .055, RO.y, Z(cg)));
        add(label + 'rose ring', S, new T.TorusGeometry(major, minor, 10, 64), roseMatrix);
        add(label + 'rose-window infill', F.roseMaterial || mat.glass, new T.CircleGeometry(RO.inner, 64), place(RY(-Math.PI / 2), TR(xf - .012, RO.y, Z(cg))), 'TRACED CAD CIRCLE / EXISTING CHOSEN COLOURED FINISH; GLAZING AND OPENING UNCONFIRMED');
        add(label + 'rose carving', S, K.bloom({ r: RO.inner, petals: 12, rings: 2, seg: 3 }), roseMatrix, CARVED);
        stats.upperFronts++;
      }

      // ---- Remaining upper faces: native E02 sides, coordinated repeated rear/inner profiles ----
      for (const F of upperOtherFaces.filter(f => f.side === s)) {
        const U = spec.upperFront.find(u => u.stage === F.stage), WI = U.windows;
        const SP = spec.upperSide.find(u => u.stage === F.stage);
        const cg = F.kind === 'rear' ? U.centre - spec.centre : SP.centreX - C;
        const centres = F.kind === 'rear' ? WI.centres.map(c => cg + c - U.centre) : SP.windowCentresX.map(c => c - C);
        const roseU = F.kind === 'rear' ? cg : SP.roseX - C;
        const status = F.kind === 'outer' ? DRAWN : 'DERIVED REPEATED E01B/E02 PROFILE / REAR-AND-INNER ELEVATION CONFIRMATION PENDING';
        const label = `Tower ${s > 0 ? 'H' : 'B'} stage ${U.stage} ${F.kind} · `;
        const horizontalSign = F.kind === 'rear' ? 1 : F.kind === 'outer' ? s : -s;
        const fm = (u, v, w) => F.matrix.clone().multiply(SC(horizontalSign,1,1)).multiply(TR(u, v, w));
        const fb = (name, material, xs, ys, ws, state = status) => add(label + name, material,
          new T.BoxGeometry(xs[1]-xs[0], ys[1]-ys[0], ws[1]-ws[0]),
          fm((xs[0]+xs[1])/2, (ys[0]+ys[1])/2, (ws[0]+ws[1])/2), state);
        const fs = (name, material, shape, w0, w1, state = status) => add(label + name, material,
          new T.ExtrudeGeometry(shape, { depth: w1-w0, bevelEnabled: false, curveSegments: 48 }), fm(0,0,w0), state);
        const face = rect(-F.half, F.half, F.y[0], F.y[1]);
        centres.forEach(c => face.holes.push(archHole(c, WI.rings[0], U.sill, WI.spring)));
        fs('wall with paired louvre apertures', W, face, -.14, .14);
        for (let i=0; i<U.great.rings.length-1; i++)
          fs('great arch ring', i%2 ? W:S, ring(cg,U.great.y,U.great.rings[i],U.great.rings[i+1]), .13,.24+.012*i);
        for (const e of [-1,1]) {
          const r0=U.great.rings[0], r1=U.great.rings[1], xs=[cg+e*r0,cg+e*r1].sort((a,b)=>a-b);
          fb('great arch pilaster',S,xs,[U.sill,U.great.y-.46],[.13,.24]);
          fb('great arch capital',S,[xs[0]-.06,xs[1]+.06],[U.great.y-.46,U.great.y],[.13,.29]);
          add(label+'great arch capital foliage',S,pilasterCapital(.3,.42),fm(cg+e*(r0+r1)/2,U.great.y-.44,.30),status+' / ILLUSTRATIVE CARVING');
        }
        for (const u of centres) {
          const r=WI.rings[0];
          for(let i=0;i<WI.rings.length-1;i++) fs('paired louvre archivolt',S,ring(u,WI.spring,WI.rings[i],WI.rings[i+1]),.13,.27+.025*i);
          for(const e of [-1,1]) fb('paired louvre jamb',S,[u+e*r,u+e*WI.rings[2]].sort((a,b)=>a-b),[U.sill,WI.spring],[.13,.25]);
          const leaf=new T.Shape();leaf.moveTo(u-r,U.sill);leaf.lineTo(u+r,U.sill);leaf.lineTo(u+r,WI.spring);
          leaf.absarc(u,WI.spring,r,0,Math.PI,false);leaf.lineTo(u-r,U.sill);leaf.closePath();
          fs('paired louvre backing',D,leaf,-.04,-.02,status+' / CLOSED SHUTTER DEPTH PROXY');
          const stop=WI.spring-.14,clear=2*r-.03;
          for(const xs of [[u-r,u-r+.015],[u+r-.015,u+r]]) fb('paired louvre timber frame',mat.wood,xs,[U.sill,stop],[0,.07]);
          for(let y=U.slats.first;y<stop-.001;y+=U.slats.pitch)
            fb('paired louvre blade',mat.wood,[u-clear/2,u+clear/2],[y,Math.min(y+U.slats.height,stop)],[.01,.065],status+' / BLADE ANGLE AND DEPTH PROXY');
          fb('paired louvre sill',S,[u-WI.rings[2],u+WI.rings[2]],[U.sill-.05,U.sill],[-.14,.26]);
        }
        const RO=U.rose,rm=fm(roseU,RO.y,.195);
        add(label+'rose ring',S,new T.TorusGeometry((RO.rings[0]+RO.rings[1])/2,(RO.rings[1]-RO.rings[0])/2,10,64),rm,status);
        add(label+'rose-window infill',F.roseMaterial||mat.glass,new T.CircleGeometry(RO.inner,64),fm(roseU,RO.y,.152),status+' / EXISTING COLOURED FINISH; GLAZING AND OPENING UNCONFIRMED');
        add(label+'rose carving',S,K.bloom({r:RO.inner,petals:12,rings:2,seg:3}),rm,status+' / ILLUSTRATIVE CARVING');
        stats.upperOtherFaces=(stats.upperOtherFaces||0)+1;
      }

      // ---- Corner piers of the upper stages ----
      for (const g of spec.stages) {
        const [y0, y1] = g.y, front = [2.45 - g.u / 2 - .45, 2.45 - g.u / 2 + 1.1], back = [2.45 + g.u / 2 - 1.1, 2.45 + g.u / 2 + .45];
        for (const [xs, side] of [[front, 1], [front, -1], [back, 1], [back, -1]]) {
          const ts = side > 0 ? g.t : [-g.t[1], -g.t[0]], grow = (a, d) => [a[0] - d, a[1] + d];
          block('Tower stage pier pedestal', S, grow(xs, .1), [y0, y0 + .6], grow(ts, .08));
          block('Tower stage pier shaft', W, xs, [y0 + .6, g.cap[0]], ts);
          const tm = (ts[0] + ts[1]) / 2, isFront = xs === front, outer = side > 0;
          if (isFront) {
            for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xs[0] - .013, xs[0] + .002], [y0 + .85, g.cap[0] - .15], [tm + k * .16 - .022, tm + k * .16 + .022]);
            add('Tower pier capital foliage', S, pilasterCapital(.66, (g.cap[1] - g.cap[0]) * .95), place(RY(-Math.PI / 2), TR(xs[0] - .01, g.cap[0], Z(tm))), CARVED);
          }
          if (outer) {
            const xm = (xs[0] + xs[1]) / 2, tf = ts[1];
            for (const k of [-1, 0, 1]) block('Tower pier flute', D, [xm + k * .16 - .022, xm + k * .16 + .022], [y0 + .85, g.cap[0] - .15], [tf - .002, tf + .013]);
            add('Tower pier capital foliage', S, pilasterCapital(.66, (g.cap[1] - g.cap[0]) * .95), place(RY(s > 0 ? 0 : Math.PI), TR(xm, g.cap[0], Z(tf + .01))), CARVED);
          }
          block('Tower pier capital band', S, grow(xs, .03), g.cap, grow(ts, .03));
          for (const [dy, out, m] of [[[g.cap[1], g.cap[1] + .12], .06, S], [[g.cap[1] + .12, y1 - .16], .12, W], [[y1 - .16, y1], .2, S]]) block('Tower stage pier cornice', m, grow(xs, out), dy, grow(ts, out));
          stats.piers++;
        }
      }

      // ---- Front composition: archivolt on impost pilasters, blind arch on colonnettes ----
      const A = spec.arch, B = spec.blind;
      for (const e of [-1, 1]) {
        const [i0, i1] = e > 0 ? A.impost : [-A.impost[1], -A.impost[0]];
        block('Tower front impost pilaster', W, [wallFace - .16, wallFace], [.3, A.spring - .5], [i0, i1]);
        block('Tower front impost base', S, [wallFace - .22, wallFace], [0, .3], [i0 - .04, i1 + .04]);
        block('Tower front impost capital', S, [wallFace - .2, wallFace], [A.spring - .5, A.spring], [i0 - .03, i1 + .03]);
        add('Tower front impost capital foliage', S, pilasterCapital(.4, .42), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .2, A.spring - .48, Z((i0 + i1) / 2))), CARVED);
        // Colonnettes of the blind arch.
        const tcol = e * B.colonnette;
        add('Tower blind-arch colonnette', S, new T.CylinderGeometry(.085, .095, B.spring - .65, 14), TR(wallFace - .14, .3 + (B.spring - .65) / 2, Z(tcol)));
        block('Tower blind-arch colonnette base', S, [wallFace - .26, wallFace], [0, .3], [tcol - .14, tcol + .14]);
        block('Tower blind-arch colonnette capital', S, [wallFace - .27, wallFace], [B.spring - .35, B.spring], [tcol - .16, tcol + .16]);
        add('Tower blind-arch capital foliage', S, pilasterCapital(.3, .3), place(SC(s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .27, B.spring - .33, Z(tcol))), CARVED);
        // Leaf sprays in the spandrels.
        add('Tower front spandrel spray', S, spray(1.1), place(SC(-e * s, 1, 1), RY(-Math.PI / 2), TR(wallFace - .02, 5.55, Z(e * 1.45))), CARVED);
      }
      // Archivolt: three rings, the outer one proud.
      for (let i = 0; i < A.rings.length - 1; i++) slab(i ? 'Tower front archivolt' : 'Tower front archivolt inner ring', i % 2 ? W : S, 'front', ring(0, A.spring, A.rings[i], A.rings[i + 1], 0), 0, .1 + i * .01, DRAWN, 48);
      // Blind arch: its archivolt, then a recessed panel (the wall stays closed behind it).
      for (let i = 0; i < B.rings.length - 1; i++) slab('Tower blind-arch archivolt', S, 'front', ring(0, B.spring, B.rings[i], B.rings[i + 1], 0), 0, .1 + i * .04, DRAWN, 48);
      {
        const sh = new T.Shape(); sh.moveTo(-B.r[0], .3); sh.lineTo(B.r[0], .3); sh.lineTo(B.r[0], B.spring); sh.absarc(0, B.spring, B.r[0], 0, Math.PI, false); sh.lineTo(-B.r[0], .3);
        slab('Tower blind-arch recessed panel', D, 'front', sh, 0, .015, DRAWN, 24);
        const inner = new T.Shape(); inner.moveTo(-B.r[0] + .12, .45); inner.lineTo(B.r[0] - .12, .45); inner.lineTo(B.r[0] - .12, B.spring); inner.absarc(0, B.spring, B.r[0] - .12, 0, Math.PI, false); inner.lineTo(-B.r[0] + .12, .45);
        slab('Tower blind-arch panel', W, 'front', inner, .015, .035, DRAWN, 24);
        stats.blindArches++;
      }
      // Cartouche in the tympanum between the two arches, and the moulded sill of the big arch.
      add('Tower front cartouche', S, K.cartouche({ len: 1.25, r: .13 }), place(RY(-Math.PI / 2), TR(wallFace - .04, 4.72, Z(0))), CARVED);
      block('Tower front arch sill band', S, [wallFace - .12, wallFace], [A.spring - .08, A.spring], [-A.r[0], A.r[0]]);
      // ---- Outer ground face: E02 has its own great arch and higher blind arch ----
      {
        const SB = spec.sideBase, u = SB.centreX - C;
        for (let i = 0; i < SB.greatRings.length - 1; i++)
          slab('Tower side great archivolt · E02', i % 2 ? W : S, 'outer', ring(u, SB.greatSpring, SB.greatRings[i], SB.greatRings[i + 1]), 0, .10 + i * .01, DRAWN, 48);
        for (let i = 0; i < SB.blindRings.length - 1; i++)
          slab('Tower side blind archivolt · E02', S, 'outer', ring(u, SB.blindSpring, SB.blindRings[i], SB.blindRings[i + 1]), 0, .10 + i * .04, DRAWN, 48);
        const r = SB.blindRings[0], panel = new T.Shape();
        panel.moveTo(u - r, .3); panel.lineTo(u + r, .3); panel.lineTo(u + r, SB.blindSpring);
        panel.absarc(u, SB.blindSpring, r, 0, Math.PI, false); panel.lineTo(u - r, .3); panel.closePath();
        panel.holes.push(archHole(u, SB.window.half, SB.window.sill, SB.window.spring));
        slab('Tower side blind recessed panel · E02', D, 'outer', panel, 0, .015, DRAWN, 48);
        const inner = new T.Shape(); inner.moveTo(u - r + .12, .45); inner.lineTo(u + r - .12, .45);
        inner.lineTo(u + r - .12, SB.blindSpring); inner.absarc(u, SB.blindSpring, r - .12, 0, Math.PI, false);
        inner.lineTo(u - r + .12, .45); inner.closePath();
        inner.holes.push(archHole(u, SB.window.half, SB.window.sill, SB.window.spring));
        slab('Tower side blind panel · E02', W, 'outer', inner, .015, .035, DRAWN, 48);
        const SW = SB.window, infill = new T.Shape();
        infill.moveTo(u-SW.half,SW.sill);infill.lineTo(u+SW.half,SW.sill);infill.lineTo(u+SW.half,SW.spring);
        infill.absarc(u,SW.spring,SW.half,0,Math.PI,false);infill.lineTo(u-SW.half,SW.sill);infill.closePath();
        slab('Tower side window closed infill · E02', D, 'outer', infill, -.13, -.11,
          'TRACED CAD APERTURE / CLOSED INFILL VISUALIZATION; MATERIAL AND OPERABILITY UNCONFIRMED', 48);
        // Vertical returns/relief are coordinated visualization proxies; source circles fix the crowns.
        for (const e of [-1, 1]) {
          const x0 = SB.centreX + e * SB.pilaster.radii[0], x1 = SB.centreX + e * SB.pilaster.radii[1];
          const xs = [x0, x1].sort((a,b)=>a-b);
          block('Tower side great impost · E02', W, xs, SB.pilaster.shaftY, [C + spec.wall, C + spec.wall + .1]);
          block('Tower side great capital · E02', S, xs, [SB.pilaster.shaftY[1], SB.greatSpring], [C + spec.wall, C + spec.wall + .14]);
          const x = SB.centreX + e * B.colonnette;
          add('Tower side blind colonnette · E02', S, new T.CylinderGeometry(.085, .095, SB.blindSpring - .65, 14), TR(x, .3 + (SB.blindSpring - .65) / 2, Z(C + spec.wall + .14)));
          block('Tower side blind capital · E02', S, [x - .16, x + .16], [SB.blindSpring - .35, SB.blindSpring], [C + spec.wall, C + spec.wall + .27]);
        }
      }

      // ---- Pierced parapet: 17 native twelve-edge openings per face, not vase balusters ----
      {
        const B = spec.balcony, label = `Tower ${s > 0 ? 'H' : 'B'} parapet · `;
        const status = 'E01B/E02 PROFILE TRANSCRIPTION / DERIVED 3D CLOSURE; GUARD STRUCTURE NOT DESIGNED';
        const depth = B.bandSeparation, halfPlane = 2.45-B.frontX;
        const profileShape = (points,origin) => {
          const sh=new T.Shape();points.forEach(([u,y],i)=>i?sh.lineTo(u-origin,y):sh.moveTo(u-origin,y));sh.closePath();return sh;
        };
        const bounds2 = points => [Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[0]))];
        const xPosts=B.side.posts.map(bounds2), zPosts=B.front.posts.map(p=>bounds2(p).map(v=>s*v).sort((a,b)=>a-b));
        for(const xs of xPosts)for(const zs of zPosts){
          const ys=[B.front.field[0][1],B.front.field[2][1]];
          add(label+'corner posts',W,new T.BoxGeometry(xs[1]-xs[0],ys[1]-ys[0],zs[1]-zs[0]),TR((xs[0]+xs[1])/2,(ys[0]+ys[1])/2,(zs[0]+zs[1])/2),status);
        }
        const frames = [
          {name:'front',profile:B.front,origin:spec.centre,matrix:place(SC(s,1,1),RY(-Math.PI/2),TR(B.frontX,0,zc)),postMatrix:place(SC(s,1,1),RY(-Math.PI/2),TR(xPosts[0][0],0,zc))},
          {name:'rear',profile:B.front,origin:spec.centre,matrix:place(SC(-s,1,1),RY(Math.PI/2),TR(B.rearX,0,zc)),postMatrix:place(SC(-s,1,1),RY(Math.PI/2),TR(xPosts[1][1],0,zc))},
          {name:'outer',profile:B.side,origin:2.45,matrix:place(SC(s,1,1),RY(s>0?0:Math.PI),TR(2.45,0,zc+s*halfPlane)),postMatrix:place(SC(s,1,1),RY(s>0?0:Math.PI),TR(2.45,0,s>0?zPosts[1][1]:zPosts[1][0]))},
          {name:'inner',profile:B.side,origin:2.45,matrix:place(SC(-s,1,1),RY(s>0?Math.PI:0),TR(2.45,0,zc-s*halfPlane)),postMatrix:place(SC(-s,1,1),RY(s>0?Math.PI:0),TR(2.45,0,s>0?zPosts[0][0]:zPosts[0][1]))},
        ];
        for(const F of frames){
          const P=F.profile,sh=profileShape(P.field,F.origin);
          for(const centre of P.holeCentres){
            const hole=new T.Path();B.hole.forEach(([u,y],i)=>i?hole.lineTo(centre+u-F.origin,y):hole.moveTo(centre+u-F.origin,y));hole.closePath();sh.holes.push(hole);
          }
          const g=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:false});
          add(label+F.name+' pierced panel',W,g,F.matrix.clone().multiply(TR(0,0,-depth)),F.name==='front'||F.name==='outer'?status:status+' / REPEATED FACE DERIVED');
          // The two rectangles are decoration on solid corner posts, never extra through holes.
          for(const points of P.insets){
            const outer=profileShape(points,F.origin),a=bounds2(points),y0=points[0][1],y1=points[2][1];
            const hole=new T.Path();hole.moveTo(a[0]-F.origin+.01,y0+.01);hole.lineTo(a[1]-F.origin-.01,y0+.01);hole.lineTo(a[1]-F.origin-.01,y1-.01);hole.lineTo(a[0]-F.origin+.01,y1-.01);hole.closePath();outer.holes.push(hole);
            add(label+F.name+' post inset outline',D,new T.ExtrudeGeometry(outer,{depth:.003,bevelEnabled:false}),F.postMatrix,'DRAWING SHOWN RECTANGLE / CONCEPT 10 MM RELIEF BORDER; SOLID POST');
          }
        }
        // Loft a square profile from both native elevations. Internal closure is derived,
        // not a member section: it joins the retained ledges, posts and display band planes.
        const loft=(frontRows,sideRows,inner=null)=>{
          const fr=[...frontRows].sort((a,b)=>a.y-b.y),sr=[...sideRows].sort((a,b)=>a.y-b.y),v=[];
          const quad=(a,b,c,d)=>v.push(...a,...b,...c,...a,...c,...d);
          const corners=(xs,zs,y)=>[[xs[0],y,zs[0]],[xs[1],y,zs[0]],[xs[1],y,zs[1]],[xs[0],y,zs[1]]];
          const outer=fr.map((r,i)=>corners(sr[i].u,[s*r.u[0],s*r.u[1]].sort((a,b)=>a-b),r.y));
          const inside=inner?fr.map(r=>corners(inner.x,inner.z,r.y)):null;
          for(let j=0;j<outer.length-1;j++)for(let i=0;i<4;i++){
            const n=(i+1)%4;quad(outer[j][n],outer[j][i],outer[j+1][i],outer[j+1][n]);
            if(inside)quad(inside[j][i],inside[j][n],inside[j+1][n],inside[j+1][i]);
          }
          for(const j of [0,outer.length-1]){
            if(inside)for(let i=0;i<4;i++){
              const n=(i+1)%4,points=[outer[j][i],inside[j][i],inside[j][n],outer[j][n]];
              quad(...(j===0?points.reverse():points));
            }
            else quad(...(j===0?outer[j]:[...outer[j]].reverse()));
          }
          const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.computeVertexNormals();return g;
        };
        add(label+'lower cornice profile',S,loft(B.front.cornice,B.side.cornice),null,status+' / LINEAR INTERPOLATION; CURVED CORBELS UNVERIFIED');
        add(label+'top rail profile',S,loft(B.front.rail,B.side.rail,{x:[B.frontX+depth,B.rearX-depth],z:[zc-halfPlane+depth,zc+halfPlane-depth]}),null,status+' / INTERNAL CLOSURE DERIVED');
        stats.balconyFaces=(stats.balconyFaces||0)+4;
        stats.balconyPiercedHoles=(stats.balconyPiercedHoles||0)+4*B.front.holeCentres.length;
      }

      // ---- Top: dome, lantern, crown, cross; pinnacles on the balustrade corners ----
      const DM = spec.dome, LN = spec.lantern, xc = 2.45;
      const profile = [], DA = DM.arc;
      profile.push(new T.Vector2(DM.r, DM.y0));
      for (let i = 0; i <= 64; i++) {
        const a = DA.start + (DA.end - DA.start) * i / 64;
        profile.push(new T.Vector2(DA.radius * Math.cos(a) - DA.offset, DA.y + DA.radius * Math.sin(a)));
      }
      profile.push(new T.Vector2(0.001, DM.top));
      add('Tower dome · CAD profile', CAP, new T.LatheGeometry(profile, 48), TR(xc, 0, zc),
        'NATIVE EXPOSED PROFILE / DERIVED HIDDEN DRUM TO PLATFORM; STRUCTURAL BEARING UNCONFIRMED');
      const rDome = y => y <= DM.wall ? DM.r : Math.sqrt(Math.max(0, DA.radius ** 2 - (y - DA.y) ** 2)) - DA.offset;
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4 + Math.PI / 8;
        const pts = Array.from({ length: 16 }, (_, i) => { const y = DM.wall + (DM.top - .05 - DM.wall) * i / 15, r = rDome(y) + .03; return [xc + Math.cos(a) * r, y, zc + Math.sin(a) * r]; });
        add('Tower dome rib', S, K.stem(pts, .045, .045, 18, 6));
      }
      add('Tower dome base moulding', S, new T.TorusGeometry(DM.r + .02, .06, 8, 48), place(RX(Math.PI / 2), TR(xc, DM.wall, zc)));
      // Rosettes on the four faces, as the drawn rosette at +31.8.
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2, r = rDome(DM.rosette) + .02, n = new T.Vector3(Math.cos(a), 0, Math.sin(a));
        const dz = k === 2 ? s * DM.frontRoseOffset : 0;
        const rot = new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), n));
        add('Tower dome rosette', S, K.bloom({ r: DM.roseInner, petals: 12, rings: 2, seg: 3 }), place(rot, TR(xc + n.x * r, DM.rosette, zc + n.z * r + dz)), CARVED);
        add('Tower dome rosette ring', S, new T.TorusGeometry((DM.roseRings[0] + DM.roseRings[1]) / 2, (DM.roseRings[1] - DM.roseRings[0]) / 2, 8, 64), place(rot, TR(xc + n.x * (r - .02), DM.rosette, zc + n.z * (r - .02) + dz)));
      }
      const sq = (name, m_, [y0, y1, h]) => add(name, m_, new T.BoxGeometry(2 * h, y1 - y0, 2 * h), TR(xc, (y0 + y1) / 2, zc));
      sq('Tower lantern plinth', S, LN.plinth); sq('Tower lantern plinth step', S, LN.step); sq('Tower lantern base', S, LN.base); sq('Tower lantern body', W, LN.body);
      for (const ex of [-1, 1]) for (const ez of [-1, 1]) add('Tower lantern corner post', S, new T.BoxGeometry(.1, LN.body[1] - LN.body[0], .1), TR(xc + ex * LN.body[2], (LN.body[0] + LN.body[1]) / 2, zc + ez * LN.body[2]));
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2, n = new T.Vector3(Math.cos(a), 0, Math.sin(a)), rot = new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), n));
        add('Tower lantern panel rosette', S, K.bloom({ r: .14, petals: 6, rings: 1, seg: 3 }), place(rot, TR(xc + n.x * (LN.body[2] + .01), (LN.body[0] + LN.body[1]) / 2, zc + n.z * (LN.body[2] + .01))), CARVED);
      }
      sq('Tower lantern bead band', S, [LN.beads[0], LN.beads[0] + .05, LN.beads[2]]);
      for (let k = 0; k < 24; k++) {
        const side = Math.floor(k / 6), f = (k % 6 + .5) / 6 * 2 - 1, h = LN.beads[2];
        const [dx, dz] = [[f * h, -h], [h, f * h], [-f * h, h], [-h, -f * h]][side];
        add('Tower lantern beads', S, new T.SphereGeometry(.045, 8, 6), TR(xc + dx, (LN.beads[0] + LN.beads[1]) / 2 + .02, zc + dz));
      }
      // Open crown: eight acanthus leaves rising and curling out, eight smaller between.
      const big = K.leaf({ len: .95, wid: .62, thick: .05, curl: 2.4, lobes: 3, cup: .45, seg: 8, fine: false });
      const small = K.leaf({ len: .7, wid: .4, thick: .04, curl: 2.6, lobes: 3, cup: .35, seg: 6, fine: false });
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        add('Tower lantern acanthus crown', S, big, place(RX(.85), RY(Math.PI / 2 - a), TR(xc + Math.cos(a) * .42, LN.crown[0], zc + Math.sin(a) * .42)), CARVED);
        const a2 = a + Math.PI / 8;
        add('Tower lantern acanthus crown', S, small, place(RX(.45), RY(Math.PI / 2 - a2), TR(xc + Math.cos(a2) * .3, LN.crown[0] + .25, zc + Math.sin(a2) * .36)), CARVED);
      }
      add('Tower lantern crown core', S, new T.CylinderGeometry(.12, .3, .7, 16), TR(xc, LN.crown[0] + .35, zc));
      add('Tower lantern crown neck', S, new T.CylinderGeometry(.09, .12, LN.ball - LN.crown[0] - .7, 12), TR(xc, (LN.crown[0] + .7 + LN.ball) / 2, zc));
      add('Tower lantern ball', S, new T.SphereGeometry(LN.ballRadius, 24, 18), TR(xc, LN.ball, zc));
      // E01B C44709..C4471C: actual 2D trefoil outline, with a proxy 100 mm depth.
      const [c0, c1] = LN.cross, h = LN.crossLobe, ac = LN.arm, lo = ac - h, hi = ac + h;
      const cross = new T.Shape(); cross.moveTo(-h, c0); cross.lineTo(-h, lo); cross.lineTo(-4 * h, lo);
      cross.absarc(-5 * h, lo, h, 0, Math.PI, true);
      cross.absarc(-6 * h, ac, h, -Math.PI / 2, Math.PI / 2, true);
      cross.absarc(-5 * h, hi, h, Math.PI, 0, true);
      cross.lineTo(-h, hi); cross.lineTo(-h, c1 - 3 * h);
      cross.absarc(-h, c1 - 2 * h, h, -Math.PI / 2, Math.PI / 2, true);
      cross.absarc(0, c1 - h, h, Math.PI, 0, true);
      cross.absarc(h, c1 - 2 * h, h, Math.PI / 2, -Math.PI / 2, true);
      cross.lineTo(h, hi); cross.lineTo(4 * h, hi);
      cross.absarc(5 * h, hi, h, Math.PI, 0, true);
      cross.absarc(6 * h, ac, h, Math.PI / 2, -Math.PI / 2, true);
      cross.absarc(5 * h, lo, h, 0, Math.PI, true);
      cross.lineTo(h, lo); cross.lineTo(h, c0); cross.lineTo(-h, c0); cross.closePath();
      add('Tower cross', crossMaterial, new T.ExtrudeGeometry(cross, { depth: .1, bevelEnabled: false, curveSegments: 24 }), place(RY(-Math.PI / 2), TR(xc + .05, 0, zc)), 'TRACED CAD CROSS OUTLINE / SCHEMATIC DEPTH');
      // The existing carving stays a proxy; native base/apex and corner offsets replace old bounds.
      const BP=spec.balcony,pin=K.pinnacle({w:.3,h:.84}),fl=fleur(.32);
      pin.computeBoundingBox();fl.computeBoundingBox();
      const py=-pin.boundingBox.min.y,fy=pin.boundingBox.max.y+py-fl.boundingBox.min.y;
      const total=fy+fl.boundingBox.max.y,base=BP.front.rail[0].y,sy=(BP.finialTop-base)/total;
      for(const ex of [-1,1])for(const ez of [-1,1]){
        const px=BP.side.centre+ex*BP.finialOffset,pz=s*(BP.front.centre+ez*BP.finialOffset);
        const norm=place(SC(1,sy,1),TR(px,base,pz));
        add('Tower corner pinnacle',S,pin,norm.clone().multiply(TR(0,py,0)),CARVED+' / NATIVE BASE/APEX; CORNER PLAN POSITION DERIVED');
        add('Tower corner pinnacle fleur-de-lis',S,fl,norm.clone().multiply(place(RY(Math.atan2(ex,s*ez)),TR(0,fy,0))),CARVED+' / NATIVE APEX; CARVING PROXY');
      }
    });

    // ---- Meshes, with welded indices so the display batches keep their saving ----
    const indexed = g => {
      const pos = g.attributes.position.array, nor = g.attributes.normal.array, uv = g.attributes.uv?.array, n = pos.length / 3;
      const seen = new Map(), index = new Uint32Array(n), P = [], Nn = [], U = [];
      for (let i = 0; i < n; i++) {
        const key = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2], uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0].map(v => Math.round(v * 1e5)).join();
        let k = seen.get(key);
        if (k === undefined) { k = P.length / 3; seen.set(key, k); P.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); Nn.push(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]); U.push(uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0); }
        index[i] = k;
      }
      const out = new T.BufferGeometry();
      out.setAttribute('position', new T.Float32BufferAttribute(P, 3)); out.setAttribute('normal', new T.Float32BufferAttribute(Nn, 3)); out.setAttribute('uv', new T.Float32BufferAttribute(U, 2));
      out.setIndex(new T.BufferAttribute(index, 1)); g.dispose();
      return out;
    };
    let meshes = 0, triangles = 0;
    for (const { name, material, status, parts } of bins.values()) {
      const geometry = indexed(merge(parts));
      const mesh = new T.Mesh(geometry, material);
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.userData = { status, source: SOURCE };
      root.add(mesh);
      meshes++; triangles += geometry.index.count / 3;
    }
    Object.assign(stats, { meshes, triangles: Math.round(triangles) });
    root.userData.stats = stats;
    window.CHURCH_TOWERS.stats = stats;
    data?.assumptions?.push('Tower bases and tops follow the church’s CAD file of 23 October 2026 (E01B, plan sheet 5) at the owner’s direction of 25 October 2026. The 26 October native-entity audit corrects the six upper-front assemblies and the six outer-side assemblies to native arch/window/rose coordinates; twelve inner/rear assemblies repeat that coordinated profile as DERIVED pending elevation confirmation, the ground front arch radii, offset-circle dome shoulders to +32.790457, adjoining lantern levels and the trefoil cross outline to +36.919970. The parapet now has 17 native stepped openings per face, source rail/cornice profile rows and finials to +31.551771; 60 mm plan-band separation is only a display-depth proxy with structural thickness null. Existing coloured rose finish, wall X planes and all equipment positions are retained. The E02 outer ground face has its distinct +3.100470 blind arch and 1 m opening; rear/inner elevation identity, the ET stage-2 rose discrepancy, parapet structural section and corner/depth interpretation, relief depth, hidden dome continuation, revolution, blade angles, glazing and construction sections remain unverified. The stage-1 wall plane stays at X 0; ISSUE-R06 unit confirmation stays open.');
  }
})();
