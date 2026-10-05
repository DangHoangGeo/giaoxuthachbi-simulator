/* Stained-glass artwork for the coloured-glass option, 2026-10-10.
 * Painted on canvases at load time: leaded pieces of mottled glass with
 * grisaille (painted line) detail, in the tradition of church windows.
 *  - saintPanel: a standing figure under a Gothic canopy with a name band,
 *    for the tall nave-wall arches (UV 0–1 over a 2.25 × 3.66 m arch).
 *  - fanlight: a half-round sunburst with a symbol medallion, for the
 *    window and door fanlights.
 *  - rose: a twelve-petal rose for the round façade windows.
 * Designs are proposals for the parish to replace with commissioned art.
 */
(() => {
  'use strict';
  const LEAD = '#1d1813';
  let seed = 7302026;
  const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

  function canvas(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    return [c, c.getContext('2d')];
  }
  // Shade a hex colour by f (−1 darker … +1 lighter).
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16), ch = [n >> 16 & 255, n >> 8 & 255, n & 255];
    const out = ch.map(v => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f));
    return `rgb(${out[0]},${out[1]},${out[2]})`;
  }
  // One leaded piece: mottled glass inside the path, a lead came around it.
  function piece(g, path, color, { lead = 3, mottle = 1 } = {}) {
    g.save(); g.beginPath(); path(g); g.closePath();
    g.fillStyle = color; g.fill();
    if (mottle) {
      g.clip();
      for (let i = 0; i < 6 * mottle; i++) {
        g.fillStyle = shade(color, (rand() - .5) * .5); g.globalAlpha = .18 + rand() * .2;
        g.beginPath(); g.arc(rand() * g.canvas.width, rand() * g.canvas.height, 10 + rand() * 60, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    }
    g.restore();
    if (lead) { g.beginPath(); path(g); g.closePath(); g.lineWidth = lead; g.strokeStyle = LEAD; g.lineJoin = 'round'; g.stroke(); }
  }
  // Grisaille: dark painted lines on the glass (folds, faces, hair).
  function paint(g, draw, width = 2, alpha = .55) {
    g.save(); g.strokeStyle = `rgba(45,25,12,${alpha})`; g.lineWidth = width; g.lineCap = 'round';
    g.beginPath(); draw(g); g.stroke(); g.restore();
  }
  const ellipse = (g, x, y, rx, ry, a0 = 0, a1 = Math.PI * 2, ccw = false) => g.ellipse(x, y, rx, ry, 0, a0, a1, ccw);
  const poly = pts => g => pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));

  /* ------------------------------------------------------- saint panels */
  // Panel geometry follows the arch UVs: spring at v 0.689, so on a 512×832
  // canvas the arch is an ellipse centred (256, 259) with radii 256 × 259.
  const W = 512, H = 832, SPRING = 259;
  function archPath(inset) {
    return g => {
      g.moveTo(inset, H - inset); g.lineTo(inset, SPRING);
      ellipse(g, W / 2, SPRING, W / 2 - inset, SPRING - inset, Math.PI, Math.PI * 2);
      g.lineTo(W - inset, H - inset);
    };
  }
  function border(g) {
    piece(g, archPath(0), '#8e1b22', { lead: 0, mottle: 2 });
    // Pearled border: gold beads along the band.
    const beads = [];
    for (let y = H - 34; y > SPRING; y -= 38) beads.push([17, y], [W - 17, y]);
    for (let k = 1; k < 20; k++) {
      const a = Math.PI + k * Math.PI / 20;
      beads.push([W / 2 + Math.cos(a) * (W / 2 - 17), SPRING + Math.sin(a) * (SPRING - 17)]);
    }
    for (let x = 52; x < W - 40; x += 38) beads.push([x, H - 17]);
    for (const [x, y] of beads) piece(g, gg => gg.arc(x, y, 8, 0, Math.PI * 2), '#e3b341', { lead: 2, mottle: 0 });
    g.lineWidth = 4; g.strokeStyle = LEAD; g.beginPath(); archPath(0)(g); g.closePath(); g.stroke();
  }
  function background(g, hue) {
    g.save(); g.beginPath(); archPath(32)(g); g.closePath(); g.clip();
    const blues = hue === 'red' ? ['#7c1820', '#93212a', '#6a141b', '#a32b2f'] : ['#1d3f8f', '#24489c', '#183679', '#2c56ad', '#20428a'];
    for (let y = 0; y < H; y += 46) for (let x = (y / 46) % 2 ? -23 : 0; x < W; x += 46)
      piece(g, poly([[x, y], [x + 46, y], [x + 46, y + 46], [x, y + 46]]), blues[Math.floor(rand() * blues.length)], { lead: 2.2, mottle: .4 });
    g.restore();
    g.lineWidth = 4; g.strokeStyle = LEAD; g.beginPath(); archPath(32)(g); g.closePath(); g.stroke();
  }
  // Gothic canopy over the figure, with side shafts and pinnacles.
  function canopy(g) {
    const straw = '#eadba8', shadow = '#c9b26e';
    for (const x of [92, 400]) {
      piece(g, poly([[x, 700], [x + 20, 700], [x + 20, 250], [x + 10, 214], [x, 250]]), straw);
      paint(g, gg => { for (let y = 300; y < 690; y += 48) { gg.moveTo(x + 3, y); gg.lineTo(x + 17, y); } }, 1.5, .45);
    }
    // Pointed arch band and gable with crockets.
    piece(g, gg => { gg.moveTo(112, 300); gg.quadraticCurveTo(118, 196, 256, 150); gg.quadraticCurveTo(394, 196, 400, 300); gg.lineTo(382, 300); gg.quadraticCurveTo(376, 214, 256, 172); gg.quadraticCurveTo(136, 214, 130, 300); }, straw);
    piece(g, poly([[150, 196], [256, 84], [362, 196], [330, 190], [256, 116], [182, 190]]), shadow);
    piece(g, poly([[248, 92], [256, 54], [264, 92]]), straw);
    for (let k = 0; k < 4; k++) {
      const t = (k + 1) / 5;
      for (const s of [-1, 1]) piece(g, gg => gg.arc(256 + s * 106 * (1 - t), 196 - 112 * t, 7, 0, 7), '#e3b341', { lead: 2, mottle: 0 });
    }
    // Ruby cloth of honour behind the figure.
    piece(g, gg => { gg.moveTo(130, 700); gg.lineTo(130, 300); gg.quadraticCurveTo(136, 214, 256, 172); gg.quadraticCurveTo(376, 214, 382, 300); gg.lineTo(382, 700); }, '#7e1a22', { mottle: 2 });
    paint(g, gg => { for (let y = 330; y < 690; y += 44) for (let x = 160; x < 370; x += 44) { gg.moveTo(x + 6, y); gg.arc(x, y, 6, 0, 7); } }, 1.2, .35);
  }
  function figure(g, s) {
    const cx = 256, skin = '#f1d9bf';
    if (s.wings) for (const d of [-1, 1]) {
      piece(g, poly([[cx + d * 40, 400], [cx + d * 120, 330], [cx + d * 118, 420], [cx + d * 96, 520], [cx + d * 52, 470]]), '#e7ecf3');
      paint(g, gg => { for (let k = 0; k < 4; k++) { gg.moveTo(cx + d * (56 + k * 14), 470 - k * 30); gg.lineTo(cx + d * (108 - k * 4), 360 + k * 28); } }, 1.6, .4);
    }
    // Halo, then crown of twelve stars for Our Lady.
    piece(g, gg => gg.arc(cx, 328, 54, 0, Math.PI * 2), '#e6b23a', { mottle: 1 });
    paint(g, gg => { for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8; gg.moveTo(cx + Math.cos(a) * 36, 328 + Math.sin(a) * 36); gg.lineTo(cx + Math.cos(a) * 50, 328 + Math.sin(a) * 50); } }, 1.4, .35);
    if (s.stars) for (let k = 0; k < 12; k++) { const a = Math.PI + k * Math.PI / 11; piece(g, gg => gg.arc(cx + Math.cos(a) * 62, 330 + Math.sin(a) * 62, 5, 0, 7), '#fff3c4', { lead: 1.5, mottle: 0 }); }
    // Robe and mantle.
    const robe = s.robe, mantle = s.mantle;
    piece(g, gg => { gg.moveTo(cx - 52, 380); gg.quadraticCurveTo(cx - 70, 540, cx - 96, 688); gg.lineTo(cx + 96, 688); gg.quadraticCurveTo(cx + 70, 540, cx + 52, 380); gg.quadraticCurveTo(cx, 360, cx - 52, 380); }, robe, { mottle: 2 });
    paint(g, gg => { for (const x of [-34, -10, 14, 38]) { gg.moveTo(cx + x * .7, 470); gg.quadraticCurveTo(cx + x * 1.1, 590, cx + x * 1.45, 684); } }, 2, .45);
    if (mantle) {
      piece(g, gg => { gg.moveTo(cx - 56, 382); gg.quadraticCurveTo(cx - 92, 520, cx - 100, 650); gg.quadraticCurveTo(cx - 20, 600, cx + 70, 520); gg.quadraticCurveTo(cx + 40, 470, cx + 54, 384); gg.quadraticCurveTo(cx + 10, 372, cx - 56, 382); }, mantle, { mottle: 2 });
      paint(g, gg => { gg.moveTo(cx - 70, 450); gg.quadraticCurveTo(cx - 60, 540, cx - 80, 620); gg.moveTo(cx - 40, 440); gg.quadraticCurveTo(cx - 20, 520, cx - 30, 590); gg.moveTo(cx + 10, 450); gg.quadraticCurveTo(cx + 20, 500, cx + 50, 520); }, 2, .45);
    }
    if (s.cord) paint(g, gg => { gg.moveTo(cx - 46, 520); gg.quadraticCurveTo(cx, 530, cx + 46, 520); gg.moveTo(cx + 10, 526); gg.lineTo(cx + 6, 640); }, 3, .6);
    if (s.armour) { piece(g, poly([[cx - 44, 392], [cx + 44, 392], [cx + 40, 520], [cx - 40, 520]]), '#c8ced6'); paint(g, gg => { for (let y = 420; y < 520; y += 22) { gg.moveTo(cx - 38, y); gg.lineTo(cx + 38, y); } }, 1.5, .4); }
    if (s.heart) {
      piece(g, gg => { gg.moveTo(cx, 470); gg.bezierCurveTo(cx - 40, 440, cx - 20, 410, cx, 428); gg.bezierCurveTo(cx + 20, 410, cx + 40, 440, cx, 470); }, '#c3121e', { mottle: 0 });
      piece(g, poly([[cx - 6, 418], [cx, 392], [cx + 6, 418]]), '#f2a31b', { mottle: 0 });
    }
    // Head, hair and beard, painted face.
    if (s.hair) piece(g, gg => { gg.moveTo(cx - 30, 360); gg.quadraticCurveTo(cx - 40, 300, cx, 292); gg.quadraticCurveTo(cx + 40, 300, cx + 30, 360); }, s.hair, { mottle: 0 });
    if (s.veil) piece(g, gg => { gg.moveTo(cx - 38, 392); gg.quadraticCurveTo(cx - 44, 296, cx, 290); gg.quadraticCurveTo(cx + 44, 296, cx + 38, 392); }, s.veil, { mottle: 1 });
    piece(g, gg => ellipse(gg, cx, 330, 24, 30), skin, { mottle: 0 });
    if (s.beard) piece(g, gg => { gg.moveTo(cx - 22, 336); gg.quadraticCurveTo(cx, 386, cx + 22, 336); gg.quadraticCurveTo(cx, 352, cx - 22, 336); }, s.hair || '#6b4a2b', { mottle: 0 });
    paint(g, gg => { gg.moveTo(cx - 13, 324); gg.lineTo(cx - 5, 323); gg.moveTo(cx + 5, 323); gg.lineTo(cx + 13, 324); gg.moveTo(cx, 326); gg.lineTo(cx - 2, 340); gg.moveTo(cx - 6, 347); gg.lineTo(cx + 6, 347); gg.moveTo(cx - 14, 316); gg.quadraticCurveTo(cx - 9, 312, cx - 4, 316); gg.moveTo(cx + 4, 316); gg.quadraticCurveTo(cx + 9, 312, cx + 14, 316); }, 1.6, .7);
    // Hands.
    const hands = s.hands || 'joined';
    if (hands === 'joined') piece(g, gg => ellipse(gg, cx, 452, 11, 18), skin, { mottle: 0 });
    else for (const d of [-1, 1]) piece(g, gg => ellipse(gg, cx + d * 40, 462, 10, 12), skin, { mottle: 0 });
    // Ground and attributes.
    piece(g, poly([[130, 688], [382, 688], [382, 704], [130, 704]]), '#3f6b2a');
    for (const a of s.attrs || []) ATTRS[a](g, cx);
  }
  const ATTRS = {
    staff(g, cx) { piece(g, poly([[cx + 58, 300], [cx + 64, 300], [cx + 64, 688], [cx + 58, 688]]), '#7a5530', { mottle: 0 }); piece(g, gg => { gg.moveTo(cx + 61, 300); gg.quadraticCurveTo(cx + 60, 262, cx + 84, 270); gg.quadraticCurveTo(cx + 92, 290, cx + 76, 300); gg.lineTo(cx + 72, 296); gg.quadraticCurveTo(cx + 80, 282, cx + 70, 280); gg.lineTo(cx + 64, 300); }, '#7a5530', { mottle: 0 }); },
    lambShoulders(g, cx) { piece(g, gg => ellipse(gg, cx, 388, 66, 20), '#f5f1e6', { mottle: 0 }); piece(g, gg => ellipse(gg, cx + 70, 380, 14, 11), '#f5f1e6', { mottle: 0 }); paint(g, gg => { for (let k = -50; k < 50; k += 14) { gg.moveTo(cx + k + 6, 388); gg.arc(cx + k, 388, 6, 0, 7); } }, 1.2, .35); },
    lily(g, cx) { paint(g, gg => { gg.moveTo(cx + 40, 462); gg.lineTo(cx + 46, 300); }, 4, .9); for (const [dx, y] of [[0, 300], [-14, 330], [14, 344], [-10, 372]]) piece(g, poly([[cx + 46 + dx, y - 18], [cx + 56 + dx, y], [cx + 46 + dx, y + 8], [cx + 36 + dx, y]]), '#fbfaf2', { lead: 2, mottle: 0 }); },
    keys(g, cx) { for (const [d, c] of [[-1, '#e6b23a'], [1, '#d7dbe0']]) { piece(g, poly([[cx + 36 + d * 8, 470], [cx + 44 + d * 8, 470], [cx + 44 + d * 8, 600], [cx + 36 + d * 8, 600]]), c, { mottle: 0 }); piece(g, gg => gg.arc(cx + 40 + d * 8, 462, 12, 0, 7), c, { mottle: 0 }); piece(g, poly([[cx + 44 + d * 8, 580], [cx + 62 + d * 8, 580], [cx + 62 + d * 8, 598], [cx + 44 + d * 8, 598]]), c, { mottle: 0 }); } },
    sword(g, cx) { piece(g, poly([[cx + 52, 330], [cx + 62, 320], [cx + 72, 330], [cx + 68, 600], [cx + 56, 600]]), '#d9dee5', { mottle: 0 }); piece(g, poly([[cx + 40, 600], [cx + 84, 600], [cx + 84, 612], [cx + 40, 612]]), '#e6b23a', { mottle: 0 }); piece(g, poly([[cx + 58, 612], [cx + 66, 612], [cx + 66, 650], [cx + 58, 650]]), '#7a5530', { mottle: 0 }); },
    book(g, cx) { piece(g, poly([[cx - 74, 470], [cx - 26, 462], [cx - 22, 520], [cx - 70, 528]]), '#9b1d23', { mottle: 0 }); paint(g, gg => { gg.moveTo(cx - 64, 482); gg.lineTo(cx - 34, 477); }, 1.5, .6); },
    chalice(g, cx) { piece(g, gg => { gg.moveTo(cx - 22, 420); gg.quadraticCurveTo(cx, 470, cx + 22, 420); }, '#e6b23a', { mottle: 0 }); piece(g, poly([[cx - 4, 452], [cx + 4, 452], [cx + 4, 480], [cx + 16, 490], [cx - 16, 490], [cx - 4, 480]]), '#e6b23a', { mottle: 0 }); piece(g, gg => gg.arc(cx, 404, 13, 0, 7), '#fbf6e4', { lead: 2, mottle: 0 }); },
    roses(g, cx) { piece(g, poly([[cx - 3, 400], [cx + 3, 400], [cx + 3, 490], [cx - 3, 490]]), '#5b3a1e', { mottle: 0 }); piece(g, poly([[cx - 16, 420], [cx + 16, 420], [cx + 16, 426], [cx - 16, 426]]), '#5b3a1e', { mottle: 0 }); for (let k = 0; k < 7; k++) piece(g, gg => gg.arc(cx - 36 + k * 12, 498 + (k % 2) * 8, 8, 0, 7), k % 2 ? '#d43a4f' : '#f08aa0', { lead: 1.5, mottle: 0 }); },
    palm(g, cx) { paint(g, gg => { gg.moveTo(cx + 42, 470); gg.quadraticCurveTo(cx + 60, 380, cx + 52, 300); }, 4, .9); for (let k = 0; k < 7; k++) { const y = 316 + k * 22; for (const d of [-1, 1]) piece(g, poly([[cx + 54 - k, y], [cx + 54 + d * 30, y - 16], [cx + 54 + d * 24, y + 2]]), '#3e8a3a', { lead: 1.5, mottle: 0 }); } },
    reedCross(g, cx) { piece(g, poly([[cx + 58, 280], [cx + 64, 280], [cx + 64, 688], [cx + 58, 688]]), '#7a5530', { mottle: 0 }); piece(g, poly([[cx + 46, 304], [cx + 76, 304], [cx + 76, 310], [cx + 46, 310]]), '#7a5530', { mottle: 0 }); },
    shell(g, cx) { piece(g, gg => { gg.moveTo(cx - 70, 470); gg.arc(cx - 54, 470, 16, Math.PI, 0); }, '#f4ead0', { lead: 2, mottle: 0 }); },
    crucifix(g, cx) { piece(g, poly([[cx - 52, 420], [cx - 46, 420], [cx - 46, 500], [cx - 52, 500]]), '#5b3a1e', { mottle: 0 }); piece(g, poly([[cx - 64, 436], [cx - 34, 436], [cx - 34, 442], [cx - 64, 442]]), '#5b3a1e', { mottle: 0 }); },
    flames(g, cx) { for (const d of [-1, 1]) piece(g, poly([[cx + d * 40, 690], [cx + d * 52, 650], [cx + d * 60, 690]]), '#f08a1b', { lead: 2, mottle: 0 }); },
  };
  function caption(g, text) {
    piece(g, poly([[130, 714], [382, 714], [382, 770], [130, 770]]), '#f3ecd2', { mottle: 1 });
    g.save(); g.fillStyle = 'rgba(40,24,12,.88)'; g.textAlign = 'center'; g.textBaseline = 'middle';
    let size = 26; g.font = `bold ${size}px Georgia, 'Times New Roman', serif`;
    while (size > 12 && g.measureText(text).width > 236) { size -= 1; g.font = `bold ${size}px Georgia, 'Times New Roman', serif`; }
    g.fillText(text, 256, 743); g.restore();
  }
  function saintPanel(spec) {
    const [c, g] = canvas(W, H);
    g.fillStyle = '#101010'; g.fillRect(0, 0, W, H);
    border(g); background(g); canopy(g); figure(g, spec); caption(g, spec.name);
    return c;
  }
  // Twelve figures for the nave-wall arches, left (C) then right (G), front to back.
  const SAINTS = {
    left: [
      { name: 'THÁNH MICAE', robe: '#c8ced6', mantle: '#b0182a', hair: '#a8752f', wings: true, armour: true, hands: 'open', attrs: ['sword'] },
      { name: 'THÁNH ANTÔN', robe: '#6f4a2c', hair: '#5a3c22', cord: true, hands: 'open', attrs: ['lily', 'book'] },
      { name: 'THÁNH PHÊRÔ', robe: '#2a5aa8', mantle: '#d9a52c', hair: '#d9d6cf', beard: true, hands: 'open', attrs: ['keys'] },
      { name: 'THÁNH GIOAN TÔNG ĐỒ', robe: '#2f7a3d', mantle: '#b51c2b', hair: '#b8803a', hands: 'joined', attrs: ['chalice'] },
      { name: 'ĐỨC MẸ MARIA', robe: '#f4f0e4', mantle: '#2350b5', veil: '#2350b5', stars: true, hands: 'joined', attrs: [] },
      { name: 'THÁNH TÊRÊSA', robe: '#6a4a30', mantle: '#efe6cf', veil: '#2b2522', hands: 'open', attrs: ['roses', 'crucifix'] },
    ],
    right: [
      { name: 'THÁNH ANRÊ DŨNG LẠC', robe: '#b51c2b', mantle: '#e8dcc0', hair: '#2a2420', hands: 'open', attrs: ['palm'] },
      { name: 'THÁNH GIOAN BAOTIXITA', robe: '#8a6438', mantle: '#b51c2b', hair: '#5a3c22', beard: true, hands: 'open', attrs: ['reedCross', 'shell'] },
      { name: 'THÁNH PHAOLÔ', robe: '#2f7a3d', mantle: '#b51c2b', hair: '#4a3324', beard: true, hands: 'open', attrs: ['sword', 'book'] },
      { name: 'THÁNH GIUSE', robe: '#3c7d4a', mantle: '#a8722c', hair: '#5a3c22', beard: true, hands: 'open', attrs: ['lily'] },
      { name: 'THÁNH TÂM CHÚA GIÊSU', robe: '#f4f0e4', mantle: '#b51c2b', hair: '#6b4a2b', beard: true, heart: true, hands: 'open', attrs: [] },
      { name: 'CHÚA CHIÊN LÀNH', robe: '#f4f0e4', mantle: '#b51c2b', hair: '#6b4a2b', beard: true, hands: 'open', attrs: ['lambShoulders', 'staff'] },
    ],
  };

  /* ------------------------------------------------- fanlights and roses */
  const SYMBOLS = {
    dove(g, x, y, r) { piece(g, gg => ellipse(gg, x, y, r * .5, r * .22), '#fbfaf2', { lead: 2, mottle: 0 }); for (const d of [-1, 1]) piece(g, poly([[x, y - r * .05], [x + d * r * .85, y - r * .45], [x + d * r * .55, y + r * .05]]), '#fbfaf2', { lead: 2, mottle: 0 }); piece(g, gg => gg.arc(x, y - r * .3, r * .14, 0, 7), '#fbfaf2', { lead: 2, mottle: 0 }); },
    chalice(g, x, y, r) { piece(g, gg => { gg.moveTo(x - r * .4, y - r * .35); gg.quadraticCurveTo(x, y + r * .25, x + r * .4, y - r * .35); }, '#e6b23a', { lead: 2, mottle: 0 }); piece(g, poly([[x - r * .07, y], [x + r * .07, y], [x + r * .07, y + r * .35], [x + r * .3, y + r * .5], [x - r * .3, y + r * .5], [x - r * .07, y + r * .35]]), '#e6b23a', { lead: 2, mottle: 0 }); piece(g, gg => gg.arc(x, y - r * .6, r * .22, 0, 7), '#fbf6e4', { lead: 2, mottle: 0 }); },
    cross(g, x, y, r) { piece(g, poly([[x - r * .1, y - r * .75], [x + r * .1, y - r * .75], [x + r * .1, y - r * .35], [x + r * .45, y - r * .35], [x + r * .45, y - r * .15], [x + r * .1, y - r * .15], [x + r * .1, y + r * .5], [x - r * .1, y + r * .5], [x - r * .1, y - r * .15], [x - r * .45, y - r * .15], [x - r * .45, y - r * .35], [x - r * .1, y - r * .35]]), '#e6b23a', { lead: 2, mottle: 0 }); },
    letters(text) { return (g, x, y, r) => { g.save(); g.fillStyle = '#7e1a22'; g.strokeStyle = LEAD; g.lineWidth = 2; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.round(r * .62)}px Georgia, serif`; g.fillText(text, x, y - r * .1); g.restore(); }; },
    heart(g, x, y, r) { piece(g, gg => { gg.moveTo(x, y + r * .4); gg.bezierCurveTo(x - r * .7, y - r * .1, x - r * .3, y - r * .6, x, y - r * .25); gg.bezierCurveTo(x + r * .3, y - r * .6, x + r * .7, y - r * .1, x, y + r * .4); }, '#c3121e', { lead: 2, mottle: 0 }); piece(g, poly([[x - r * .05, y - r * .3], [x, y - r * .75], [x + r * .05, y - r * .3]]), '#f2a31b', { lead: 2, mottle: 0 }); },
  };
  const FAN_DESIGNS = [SYMBOLS.dove, SYMBOLS.chalice, SYMBOLS.letters('IHS'), SYMBOLS.letters('XP'), SYMBOLS.cross, SYMBOLS.letters('AΩ'), SYMBOLS.heart, SYMBOLS.letters('M')];
  // A half-round fanlight. bottom/spring/rise in metres (UV 0–1 over the
  // opening's bounding box); bars = number of radial lead bars.
  function fanlight(design, { width = 1, bottom = 3.0, spring = 3.101, rise = .507, sectors = 6 } = {}) {
    const total = spring + rise - bottom, w = 512, h = Math.round(512 * total / width);
    const [c, g] = canvas(w, h);
    const cy = h * (1 - (spring - bottom) / total), rx = w / 2, ry = h * rise / total;
    g.fillStyle = '#e8d9a6'; g.fillRect(0, 0, w, h);
    // Sunburst rays alternating gold and amber, a blue outer band with beads.
    for (let k = 0; k < sectors; k++) {
      const a0 = Math.PI + k * Math.PI / sectors, a1 = a0 + Math.PI / sectors;
      piece(g, gg => { gg.moveTo(rx, cy); ellipse(gg, rx, cy, rx * .8, ry * .8, a0, a1); }, k % 2 ? '#e3a72f' : '#f1cf63', { mottle: 1.5 });
    }
    piece(g, gg => { ellipse(gg, rx, cy, rx, ry, Math.PI, Math.PI * 2); gg.lineTo(rx * 1.8, cy); ellipse(gg, rx, cy, rx * .8, ry * .8, 0, Math.PI, true); }, '#1f4a9a', { mottle: 2 });
    for (let k = 1; k < 14; k++) { const a = Math.PI + k * Math.PI / 14; piece(g, gg => gg.arc(rx + Math.cos(a) * rx * .9, cy + Math.sin(a) * ry * .9, Math.min(rx, ry) * .045, 0, 7), '#e6b23a', { lead: 1.5, mottle: 0 }); }
    // Medallion with the symbol.
    const mr = Math.min(rx, ry) * .42;
    piece(g, gg => { gg.moveTo(rx - mr * 1.1, cy); gg.arc(rx, cy, mr * 1.1, Math.PI, 0); }, '#9b1d23', { mottle: 1 });
    piece(g, gg => { gg.moveTo(rx - mr * .92, cy); gg.arc(rx, cy, mr * .92, Math.PI, 0); }, '#f6efd8', { mottle: 1 });
    design(g, rx, cy - mr * .38, mr * .7);
    piece(g, poly([[0, cy], [w, cy], [w, h], [0, h]]), '#e8d9a6', { mottle: 1 });
    return c;
  }
  function rose() {
    const [c, g] = canvas(512, 512), x = 256, y = 256;
    g.fillStyle = '#1f4a9a'; g.fillRect(0, 0, 512, 512);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6, b = a + Math.PI / 6;
      piece(g, gg => { gg.moveTo(x + Math.cos(a) * 120, y + Math.sin(a) * 120); gg.arc(x, y, 250, a, b); gg.lineTo(x + Math.cos(b) * 120, y + Math.sin(b) * 120); gg.arc(x, y, 120, b, a, true); }, k % 2 ? '#1f4a9a' : '#2c5fb8', { mottle: 1.5 });
      const m = a + Math.PI / 12;
      piece(g, gg => ellipse(gg, x + Math.cos(m) * 185, y + Math.sin(m) * 185, 34, 34), k % 2 ? '#b51c2b' : '#e3a72f', { mottle: 1 });
      piece(g, gg => ellipse(gg, x + Math.cos(m) * 185, y + Math.sin(m) * 185, 14, 14), '#f6efd8', { lead: 2, mottle: 0 });
    }
    piece(g, gg => gg.arc(x, y, 120, 0, Math.PI * 2), '#9b1d23', { mottle: 1.5 });
    piece(g, gg => gg.arc(x, y, 92, 0, Math.PI * 2), '#f6efd8', { mottle: 1 });
    SYMBOLS.dove(g, x, y + 10, 90);
    return c;
  }
  window.CHURCH_GLASS_ART = { saintPanel, fanlight, rose, SAINTS, FAN_DESIGNS };
})();
