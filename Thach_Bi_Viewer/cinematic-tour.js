/* Thạch Bi viewer · cinematic guided tour.
 *
 * A five-minute film of the shared model: the camera flies round the outside by
 * day, enters through the central door, travels the nave, the timber roof, the
 * side aisle, the wings and the sanctuary, then returns at night with the roof
 * hidden to look down into the lit interior.
 *
 * Presentation only. The film never edits the design, the saved layout, lamp
 * outputs or any calculation. It changes four display states while it runs
 * (day/evening, roof visibility, door state, lens angle) and puts the door
 * state and lens back when it ends; a film that runs to its end also restores
 * the light and the roof.
 *
 * The organ music is synthesised in the browser (additive pipe tones,
 * artificial reverberation): an original "homeland" theme outside, and the
 * Bach–Gounod "Ave Maria" (public domain) from the church door to the open
 * roof. It is presentation music. It is not routed through the modelled
 * loudspeakers and says nothing about how an organ or the sound system will
 * sound in this church: see simulator/audio.js for the room-based listening
 * preview.
 *
 * Works offline: no files are fetched and nothing is stored.
 */
(() => {
  'use strict';

  /* ------------------------------------------------------------ shot list
   * Model coordinates in metres: X from axis 1 toward the sanctuary, Y up from
   * the nave floor, Z negative toward side B. Each key is
   * [eyeX, eyeY, eyeZ, lookX, lookY, lookZ, lens°]; the lens angle is optional
   * and carries forward. Durations are whole bars of the music (4 s each).
   *   cut   'fade' (chapter, 1.3 s each side) · 'dip' (0.55 s) · 'cut'
   *   ease  [start, end] speed as a share of cruising speed (0 = from rest)
   * Captions state only values held in the model data (church.data); the
   * furnishings, ornament, lighting and sound equipment shown are proposals.
   */
  const BAR = 4;
  const CHAPTERS = {
    outside: { en: 'I · Around the church', vi: 'I · Quanh nhà thờ' },
    inside: { en: 'II · Inside', vi: 'II · Bên trong' },
    night: { en: 'III · Evening', vi: 'III · Buổi tối' }
  };
  const SHOTS = [
    { id: 'opening', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'fade', ease: [0.25, 0.7],
      card: { small: 'Giáo xứ Thạch Bi', title: 'Nhà thờ Thạch Bi', line: 'Một lời mời trở về quê nhà · An invitation to come home' },
      keys: [[-98, 54, 60, 14, 12, 0, 38], [-70, 36, 46, 12, 12.5, 0, 40], [-46, 19, 27, 8, 13, 0, 44]] },
    { id: 'facade', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.3, 0.6],
      en: 'The tower front', vi: 'Mặt tiền hai tháp',
      note: { en: 'Twin bell towers frame three doors, with Our Lady of the Assumption between them. The cross apex is drawn at +36.920 m above the nave floor.', vi: 'Hai tháp chuông ôm lấy ba cửa chính, ở giữa là tượng Đức Mẹ Lên Trời. Đỉnh thánh giá theo bản vẽ ở cao độ +36,920 m so với nền lòng nhà thờ.' },
      keys: [[-27, -0.5, 3.2, 2, 6, 0, 46], [-22, 6.5, 1.6, 2.2, 11, 0, 46], [-21, 17, -0.5, 2.4, 19, 0, 45], [-29, 27, -5, 2.4, 26, -0.5, 44]] },
    { id: 'towers', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.6],
      en: 'Around the bell towers', vi: 'Vòng quanh tháp chuông',
      note: { en: 'Four stages at +8.390, +15.840, +23.140 and +29.090 m, with louvred belfry arches under each dome. Ornament depth is still schematic.', vi: 'Bốn tầng tháp ở +8,390, +15,840, +23,140 và +29,090 m, với các vòm cửa chớp của lầu chuông dưới mỗi mái vòm. Chiều sâu hoa văn còn là sơ phác.' },
      keys: [[-29, 27, -5, 2.4, 26, -0.5, 44], [-15, 33, -21, 2.6, 28.5, -1, 44], [7, 36, -27, 3.5, 28, -1.5, 44], [25, 34, -23, 4.5, 26, -1, 45], [36, 29, -12, 6, 24, 0, 46]] },
    { id: 'side-b', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.6, 0.6],
      en: 'Verandas for shade and breeze', vi: 'Hàng hiên che nắng, đón gió',
      note: { en: 'Open verandas in 4.50 m bays shade the walls and let the air through. The church is planned for fans and open windows, without air conditioning.', vi: 'Hàng hiên mở theo bước gian 4,50 m che nắng cho tường và đón gió. Nhà thờ được tính toán dùng quạt và cửa mở, không dùng điều hòa.' },
      keys: [[-11, 1.4, -19.4, 8, 4.2, -10, 50], [9, 2.1, -18.6, 26, 4.2, -10.5, 50], [29, 3, -18.6, 43, 4.8, -12, 50], [50, 4.6, -18.6, 57, 6, -5, 50]] },
    { id: 'rear', chapter: 'outside', bars: 3, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.6],
      en: 'The altar end', vi: 'Đầu cung thánh',
      note: { en: 'From axis 1 to axis 12 the church measures 53.016 m. A cross crowns the gable above the sanctuary; the vesting room sits behind its wall.', vi: 'Từ trục 1 đến trục 12 nhà thờ dài 53,016 m. Thánh giá trên đỉnh đầu hồi phía cung thánh; phòng áo nằm ngay sau tường.' },
      keys: [[50, 4.6, -18.6, 57, 6, -5, 50], [66, 9, -13, 51, 8, -1, 48], [72, 12, 4, 49, 8.5, 0, 47], [62, 14, 25, 42, 7, 5, 46]] },
    { id: 'return', chapter: 'outside', bars: 5, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.15],
      en: 'A roof of red clay tiles', vi: 'Mái ngói đỏ',
      note: { en: 'Ngói đỏ, fired-clay tiles: the red roof long familiar on Vietnamese village houses, communal halls and churches. A proposed finish, on one continuous roof with its ridge at +12.472 m.', vi: 'Ngói đỏ đất nung, màu mái thân quen của nhà làng, đình và nhà thờ Việt Nam. Đây là vật liệu đề xuất, trên một mái liên tục có nóc ở +12,472 m.' },
      keys: [[62, 14, 25, 42, 7, 5, 46], [38, 22, 32, 27, 8, 0, 46], [10, 28, 28, 13, 10, 0, 45], [-20, 21, 14, 3, 12, 0, 44], [-34, 9, 2, 2.4, 10, 0, 42]] },

    { id: 'enter', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.75],
      en: 'The doors stand open', vi: 'Cánh cửa rộng mở',
      note: { en: 'Up the forecourt steps and in between the towers. The central door is 3.100 m clear, under an arch of coloured glass.', vi: 'Bước lên bậc tiền sảnh, đi vào giữa hai tháp. Cửa giữa rộng thông thủy 3,100 m, phía trên là vòm kính màu.' },
      keys: [[-23, -0.35, 0, 2.4, 4.2, 0, 50], [-13.6, -0.3, 0, 6, 3.4, 0, 50], [-8, 1.2, 0, 14, 3, 0, 52], [-1, 1.25, 0, 26, 3, 0, 54], [3.2, 1.6, 0, 38, 3.2, 0, 56], [9.5, 1.7, 0, 48, 3.5, 0, 56]] },
    { id: 'nave', chapter: 'inside', bars: 5, light: 'day', roof: true, cut: 'cut', ease: [0.75, 0.3],
      en: 'The nave', vi: 'Lòng nhà thờ',
      note: { en: 'Fourteen timber columns in red lacquer carry the roof frames above the pews. Pews, lamps, fans and loudspeakers are a design proposal.', vi: 'Mười bốn cột gỗ sơn son đỡ các vì kèo phía trên hàng ghế. Ghế, đèn, quạt và loa là phương án đề xuất.' },
      keys: [[9.5, 1.7, 0, 48, 3.5, 0, 56], [19, 2.3, 0, 48.5, 3.8, 0, 54], [28.5, 3.3, 0, 48.8, 4.2, 0, 52], [35, 3.9, 0, 48.8, 4.6, 0, 50]] },
    { id: 'timber', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.4],
      en: 'Carved and gilded beams', vi: 'Xà kèo chạm khắc, thếp vàng',
      note: { en: 'Each tie beam carries a gilded bloom between leafy scrolls, under an ivory boarded lining that keeps the roof light. Member sizes and joints remain an engineering hold.', vi: 'Mỗi quá giang mang một bông hoa thếp vàng giữa hai dải lá cuốn, dưới lớp ván lót màu ngà giúp mái sáng và nhẹ. Tiết diện và mối nối còn chờ kỹ sư kết cấu.' },
      keys: [[33.4, 6.4, 1.9, 22, 11.6, -0.6, 62], [25.6, 7, 2, 14, 11.8, -1, 62], [18.6, 7.1, 1.9, 7, 11, -0.6, 60], [12.6, 6.8, 1.5, 3, 8.5, 0, 58]] },
    { id: 'aisle', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.5, 0.5],
      en: 'Light through two layers of windows', vi: 'Ánh sáng qua hai lớp cửa',
      note: { en: 'Inner and outer windows stand either side of the veranda, with coloured glass in the arched heads and timber shutters below.', vi: 'Hai lớp cửa sổ trong và ngoài nằm hai bên hiên, kính màu trên các vòm cửa và cánh cửa gỗ bên dưới.' },
      keys: [[11.5, 2, -4.8, 21, 3, -7.6, 54], [22, 2.2, -4.85, 31, 3.2, -7.6, 54], [33, 2.4, -4.8, 41, 3.3, -9.5, 54]] },
    { id: 'wings', chapter: 'inside', bars: 3, light: 'day', roof: true, cut: 'cut', ease: [0.3, 0.3],
      en: 'The two wings', vi: 'Hai cánh nhà thờ',
      note: { en: 'Between axes 9 and 10 the church widens on both sides, like the arms of a cross. Saint Peter and Saint Paul face each other across the sanctuary steps.', vi: 'Giữa trục 9 và 10 nhà thờ mở rộng sang hai bên như hai cánh thánh giá. Thánh Phêrô và Thánh Phaolô đối diện nhau qua bậc cung thánh.' },
      keys: [[37.4, 2.5, 1.6, 40.6, 3.4, -12.5, 58], [37, 2.6, 0, 48.6, 4, 0, 58], [37.4, 2.5, -1.6, 40.6, 3.4, 12.5, 58]] },
    { id: 'sanctuary', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.2, 0.2],
      en: 'The sanctuary in red and gold', vi: 'Cung thánh sơn son thếp vàng',
      note: { en: 'Red lacquer and gilded carving, in the spirit of sơn son thếp vàng, the timber craft of northern Vietnam, frame the altar under three arches. An art proposal on the drawn +0.750 m platform.', vi: 'Sơn son thếp vàng theo tinh thần nghề mộc truyền thống Bắc Bộ ôm lấy bàn thờ dưới ba vòm cung. Đây là đề xuất mỹ thuật trên bục cung thánh +0,750 m theo bản vẽ.' },
      keys: [[34.6, 2, 0, 48.8, 4.4, 0, 48], [39.2, 2.5, 0, 48.8, 4.7, 0, 43], [41.7, 2.8, 0, 48.8, 5.1, 0, 38]] },
    { id: 'altar-arc', chapter: 'inside', bars: 3, light: 'day', roof: true, cut: 'cut', ease: [0.4, 0.4],
      en: 'Altar, tabernacle and crucifix', vi: 'Bàn thờ, nhà tạm và thánh giá',
      note: { en: 'The carved Christ hangs on a red cross in an azure niche above the gilded tabernacle, with Our Lady and Saint Joseph in the shrines on either side.', vi: 'Tượng Chúa chịu nạn chạm gỗ trên thánh giá đỏ, trong hốc tường xanh thiên thanh phía trên nhà tạm thếp vàng; Đức Mẹ và Thánh Giuse ở hai bàn thờ bên.' },
      keys: [[39.7, 3, -3, 45.6, 2.7, 0.4, 50], [38.7, 3.1, 0, 45.8, 2.6, 0, 50], [39.7, 3, 3, 45.6, 2.7, -0.4, 50]] },
    { id: 'look-back', chapter: 'inside', bars: 3, light: 'day', roof: true, cut: 'cut', ease: [0.25, 0.1],
      en: 'Looking back to the entrance', vi: 'Nhìn về phía cửa chính',
      note: { en: 'From the sanctuary steps, the whole length of the nave back to the doors.', vi: 'Từ bậc cung thánh nhìn suốt lòng nhà thờ về phía cửa chính.' },
      keys: [[40.6, 2.6, 0, 22, 3.8, 0, 56], [39.6, 4.8, 0, 12, 5.2, 0, 58], [38.7, 6.9, 0, 3, 6.4, 0, 60]] },

    { id: 'evening-nave', chapter: 'night', bars: 4, light: 'evening', roof: true, cut: 'fade', ease: [0.15, 0.4],
      en: 'After dark', vi: 'Khi đêm xuống',
      note: { en: 'Evening light: the sanctuary glows at the end of the nave. This is the proposed lighting as the viewer draws it; screen brightness is not a lux measurement.', vi: 'Ánh đèn buổi tối: cung thánh rực sáng cuối lòng nhà thờ. Đây là phương án chiếu sáng đề xuất theo cách hiển thị của mô hình; độ sáng màn hình không phải số đo lux.' },
      keys: [[5.4, 1.9, 0, 48.8, 3.8, 0, 56], [14, 2.3, 0, 48.8, 4, 0, 54], [22.5, 2.9, 0, 48.8, 4.4, 0, 52]] },
    { id: 'roof-off', chapter: 'night', bars: 4, light: 'evening', roof: false, cut: 'fade', ease: [0, 0], up: [0, 0, -1],
      en: 'The roof lifted away', vi: 'Nhấc mái để nhìn từ trên',
      note: { en: 'The whole plan in one view: entrance on the left, sanctuary on the right, the timber frames across the nave.', vi: 'Toàn bộ mặt bằng trong một khung hình: cửa chính bên trái, cung thánh bên phải, các vì kèo gỗ bắc ngang lòng nhà thờ.' },
      keys: [[26.5, 96, 0.6, 26.5, 0, 0, 40], [26.5, 70, 7, 26.5, 1, 0, 42], [26.5, 46, 31, 26.5, 2, 0, 44], [26.5, 38, 42, 26.5, 2.5, 0, 45]] },
    { id: 'night-orbit', chapter: 'night', bars: 6, light: 'evening', roof: false, cut: 'cut', ease: [0, 0.6],
      en: 'Around the open church', vi: 'Vòng quanh nhà thờ mở mái',
      note: { en: 'With the roof hidden, the lit interior shows how nave, wings, verandas and sanctuary fit together.', vi: 'Khi ẩn mái, nội thất sáng đèn cho thấy lòng nhà thờ, hai cánh, hàng hiên và cung thánh gắn kết với nhau thế nào.' },
      keys: [[26.5, 38, 42, 26.5, 2.5, 0, 45], [59, 34, 33, 27, 2.5, 0, 45], [74, 30, 0, 28, 2.5, 0, 45], [59, 27, -33, 27, 2.5, 0, 45], [26.5, 25, -44, 25, 2.5, 0, 46], [-8, 24, -31, 22, 3, 0, 46]] },
    { id: 'over-nave', chapter: 'night', bars: 4, light: 'evening', roof: false, cut: 'cut', ease: [0.6, 0.3],
      en: 'Over the timber frames', vi: 'Bay trên các vì kèo',
      note: { en: 'Frame after frame, from the towers to the sanctuary.', vi: 'Vì kèo nối tiếp vì kèo, từ tháp chuông đến cung thánh.' },
      keys: [[-8, 24, -31, 22, 3, 0, 46], [-14, 26, -8, 14, 2, 0, 50], [1, 26, 0, 22, 0.5, 0, 54], [20, 16.5, 0, 36, 0.8, 0, 56], [38, 15.2, 0, 47, 1.5, 0, 56]] },
    { id: 'closing', chapter: 'night', bars: 5, light: 'evening', roof: true, cut: 'fade', ease: [0.1, 0], end: true,
      en: 'The lights of home', vi: 'Ánh đèn quê nhà',
      note: { en: 'The tower front after dark, with the proposed concealed lighting on the statues and towers.', vi: 'Mặt tiền về đêm với phương án chiếu sáng giấu đèn cho các tượng và hai tháp.' },
      card: { at: 9, small: 'Với tình yêu dành cho giáo xứ và quê hương\nWith love for our parish and our hometown', title: 'Nhà thờ Thạch Bi', line: 'Hẹn gặp lại ở quê nhà · Until we meet again at home',
        foot: ['Design-development model, not a construction-approved design · Mô hình phát triển thiết kế, chưa phải thiết kế được duyệt để thi công',
          'Music generated in the viewer: an original homeland theme and “Ave Maria” (Bach–Gounod) · Nhạc do mô hình tạo ra: giai điệu quê hương và “Ave Maria” (Bach–Gounod)'] },
      keys: [[-12.5, 1.4, 1.2, 2.4, 9, 0, 54], [-22, 3.4, 5, 2.4, 11, 0, 50], [-36, 8, 12, 4, 13, 0, 46], [-50, 14, 22, 8, 13, 0, 44]] }
  ];

  /* --------------------------------------------------------------- maths */
  const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  const lerp = (a, b, t) => a + (b - a) * t;
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  // Centripetal Catmull–Rom through p1 → p2 (no overshoot on uneven spacing).
  function spline(p0, p1, p2, p3, t) {
    const knot = (a, b) => Math.max(1e-4, Math.sqrt(dist(a, b)));
    const t0 = 0, t1 = t0 + knot(p0, p1), t2 = t1 + knot(p1, p2), t3 = t2 + knot(p2, p3);
    const u = lerp(t1, t2, t), out = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      const a1 = lerp(p0[i], p1[i], (u - t0) / (t1 - t0)), a2 = lerp(p1[i], p2[i], (u - t1) / (t2 - t1)), a3 = lerp(p2[i], p3[i], (u - t2) / (t3 - t2));
      const b1 = lerp(a1, a2, (u - t0) / (t2 - t0)), b2 = lerp(a2, a3, (u - t1) / (t3 - t1));
      out[i] = lerp(b1, b2, (u - t1) / (t2 - t1));
    }
    return out;
  }
  function along(points, q) {
    const n = points.length - 1, i = Math.min(n - 1, Math.max(0, Math.floor(q))), f = Math.min(1, Math.max(0, q - i));
    const p1 = points[i], p2 = points[i + 1];
    const p0 = points[i - 1] || p1.map((v, k) => 2 * v - p2[k]), p3 = points[i + 2] || p2.map((v, k) => 2 * v - p1[k]);
    return spline(p0, p1, p2, p3, f);
  }

  // Prepare each shot once: a travel table (so the camera keeps an even pace
  // along the curve) and a timing table for its start and end speeds.
  const STEPS = 40, RAMP = 0.3;
  let filmLength = 0;
  SHOTS.forEach((shot, index) => {
    shot.index = index;
    shot.start = filmLength; shot.duration = shot.bars * BAR; filmLength += shot.duration;
    let lens = 48;
    shot.eye = shot.keys.map(k => k.slice(0, 3));
    shot.look = shot.keys.map(k => k.slice(3, 6));
    shot.lens = shot.keys.map(k => (lens = k[6] ?? lens));
    const segments = shot.keys.length - 1;
    shot.travel = [0];
    let previousEye = shot.eye[0], previousLook = shot.look[0];
    for (let i = 1; i <= segments * STEPS; i++) {
      const q = i / STEPS, eye = along(shot.eye, q), look = along(shot.look, q);
      // A pan with a still camera is paced by the movement of the point it looks at.
      shot.travel.push(shot.travel[i - 1] + dist(eye, previousEye) + 0.3 * dist(look, previousLook) + 1e-5);
      previousEye = eye; previousLook = look;
    }
    const [from, to] = shot.ease || [1, 1];
    const speed = x => x < RAMP ? lerp(from, 1, smooth(x / RAMP)) : x > 1 - RAMP ? lerp(to, 1, smooth((1 - x) / RAMP)) : 1;
    shot.timing = [0];
    for (let i = 1; i <= 120; i++) shot.timing.push(shot.timing[i - 1] + speed((i - 0.5) / 120));
  });
  const table = (values, x) => {
    const f = Math.min(1, Math.max(0, x)) * (values.length - 1), i = Math.min(values.length - 2, Math.floor(f));
    return lerp(values[i], values[i + 1], f - i);
  };

  function shotAt(time) {
    const t = Math.min(filmLength - 1e-4, Math.max(0, time));
    return SHOTS.find(shot => t < shot.start + shot.duration) || SHOTS[SHOTS.length - 1];
  }
  /* Pure function of film time: the same pose for playback, seeking and the
   * clearance audit. */
  function pose(time) {
    const shot = shotAt(time);
    const local = Math.min(1, Math.max(0, (time - shot.start) / shot.duration));
    const done = table(shot.timing, local) / shot.timing[shot.timing.length - 1];
    const wanted = done * shot.travel[shot.travel.length - 1];
    let lo = 0, hi = shot.travel.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (shot.travel[mid] <= wanted) lo = mid; else hi = mid; }
    const q = (lo + (wanted - shot.travel[lo]) / (shot.travel[hi] - shot.travel[lo])) / STEPS;
    const segment = Math.min(shot.keys.length - 2, Math.floor(q));
    return { shot, eye: along(shot.eye, q), look: along(shot.look, q), up: shot.up || [0, 1, 0],
      lens: lerp(shot.lens[segment], shot.lens[segment + 1], smooth(q - segment)) };
  }
  // Black level of the picture: 1 while a transition hides a change of scene.
  function blackAt(time) {
    const shot = shotAt(time), next = SHOTS[shot.index + 1];
    const span = kind => kind === 'fade' ? 1.3 : kind === 'dip' ? 0.55 : 0;
    const into = span(shot.cut), out = shot.end ? 2.6 : span(next?.cut);
    const local = time - shot.start, left = shot.duration - local;
    return Math.max(into ? 1 - smooth(local / into) : 0, out ? 1 - smooth(left / out) : 0);
  }

  /* --------------------------------------------------------------- music
   * 4/4 at 60 beats a minute: one bar for every four seconds of film.
   *
   *  1. "Homeland" (film bars 1–26, outside). An original melody on the five
   *     notes C D E G A, the scale of much Vietnamese folk song, on a flute
   *     stop over warm strings. It quotes no existing song.
   *  2. "Ave Maria" (bars 27–67, from the church door to the open roof).
   *     Charles Gounod's melody of 1853 over J. S. Bach's Prelude in C,
   *     BWV 846, complete in 41 bars. Both are in the public domain. Notes are
   *     transcribed from the Mutopia Project edition no. 2167 (after Heugel,
   *     1856; released into the public domain by its editor). Its "tutta
   *     forza" bar falls where the roof is lifted away.
   *  3. "Homeland" again on full organ (bars 68–77), ending quietly.
   */
  // Homeland: [chords sharing the bar equally, melody as note:beats].
  const HOME_A = [['C', 'E4:1 G4:1 A4:2'], ['Am', 'C5:1.5 A4:.5 G4:2'], ['F', 'A4:1 C5:1 D5:1.5 C5:.5'], ['G', 'D5:4'],
    ['Am', 'E5:1.5 D5:.5 C5:1 A4:1'], ['F', 'C5:1 D5:.5 C5:.5 A4:2'], ['F G', 'G4:1 A4:1 D5:1.5 C5:.5'], ['C', 'C5:4']];
  const HOME_B = [['Am', 'E5:2 G5:1 E5:1'], ['F', 'D5:1 C5:1 A4:2'], ['C/E', 'G4:1 C5:1 E5:1.5 D5:.5'], ['G', 'D5:3 G4:1'],
    ['Am', 'A4:1 C5:1 E5:1 G5:1'], ['F', 'A5:2 G5:1 E5:1'], ['F G', 'C5:1 A4:1 G4:1 D5:1'], ['C', 'C5:4']];
  const HOMELAND = [
    { pad: 'celeste', solo: 'voice', level: 0.52, bars: [['C', ''], ['C', 'r:2 E5:.5 G5:.5 A5:1'], ['Am', 'A5:1 G5:.5 E5:.5 G5:2'], ['F G', 'A4:2 D5:2']] },
    { pad: 'celeste', solo: 'voice', level: 0.62, bars: HOME_A },
    { pad: 'celeste', solo: 'voice', level: 0.7, quavers: true, bars: HOME_B },
    { pad: 'celeste', solo: 'voice', level: 0.6, bars: HOME_A.slice(4) },
    { pad: 'celeste', solo: 'voice', level: 0.46, bars: [['C', 'E5:1 G5:1 A5:2'], ['C', 'G5:4']] }
  ];
  const FINALE = [
    { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 0.74, quavers: true, bars: [['G', 'G4:1 A4:1 C5:1 D5:1']] },
    { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 0.9, quavers: true, doubled: true, bars: HOME_A.slice(0, 4) },
    { pad: 'principals', solo: 'song', pedal: 'pedal', level: 0.78, bars: HOME_A.slice(4) },
    { pad: 'celeste', solo: 'voice', level: 0.5, bars: [['C', 'G4:1 A4:1 C5:2']] }
  ];
  // Ave Maria. Prelude bars 1–37: bass, held second note, and the three notes
  // of the broken chord, played twice in each bar as Bach wrote them. Bar 27 is
  // the bar Gounod's edition adds to Bach's text.
  const PRELUDE = ['C4 E4 G4 C5 E5', 'C4 D4 A4 D5 F5', 'B3 D4 G4 D5 F5', 'C4 E4 G4 C5 E5',
    'C4 E4 G4 C5 E5', 'C4 D4 A4 D5 F5', 'B3 D4 G4 D5 F5', 'C4 E4 G4 C5 E5',
    'C4 E4 A4 E5 A5', 'C4 D4 F#4 A4 D5', 'B3 D4 G4 D5 G5', 'B3 C4 E4 G4 C5',
    'A3 C4 E4 G4 C5', 'D3 A3 D4 F#4 C5', 'G3 B3 D4 G4 B4',
    'G3 Bb3 E4 G4 C#5', 'F3 A3 D4 A4 D5', 'F3 Ab3 D4 F4 B4', 'E3 G3 C4 G4 C5',
    'E3 F3 A3 C4 F4', 'D3 F3 A3 C4 F4', 'G2 D3 G3 B3 F4', 'C3 E3 G3 C4 E4',
    'C3 G3 Bb3 C4 E4', 'F2 F3 A3 C4 E4', 'F#2 C3 A3 C4 Eb4', 'G2 Eb3 B3 C4 Eb4', 'Ab2 F3 B3 C4 D4',
    'G2 F3 G3 B3 D4', 'G2 E3 G3 C4 E4', 'G2 D3 G3 C4 F4', 'G2 D3 G3 B3 F4',
    'G2 Eb3 A3 C4 F#4', 'G2 E3 G3 C4 G4', 'G2 D3 G3 C4 F4', 'G2 D3 G3 B3 F4',
    'C2 C3 G3 Bb3 E4'];
  // Bars 38 and 39: free broken chords over the held bass, after a quaver rest.
  const CADENZA = ['F3 A3 C4 A3 C4 F4 C4 A3 C4 A3 F3 A3 F3 D3', 'G4 B4 D5 F5 D5 B4 D5 B4 G4 B4 D4 F4 E4 D4'];
  // Gounod's melody from bar 5, at the pitch of the violin edition.
  const AVE = ['E5:4', 'F5:4', 'G5:3 D5:1', 'E5:3 r:1',
    'A5:2.5 A4:.5 B4:.5 C5:.5', 'D5:1.75 E5:.25 D5:1 r:1', 'G5:2.5 G4:.5 A4:.5 B4:.5', 'C5:1.75 D5:.25 C5:1 r:1',
    'C6:2.5 C5:.5 D5:.5 E5:.5', 'F#5:1.5 E5:.5 D5:1 A4:1', 'B4:2.5 r:.5 D5:1',
    'E5:2.5 E5:.5 F5:.5 G5:.5', 'A5:2 A4:1 r:1', 'D5:2.5 D5:.5 E5:.5 F5:.5', 'G5:2 G4:1 r:1',
    'C5:2.5 C5:.5 D5:.5 E5:.5', 'F5:2.5 F5:.5 G5:.5 A5:.5', 'B5:1.5 A5:.5 G5:1 D5:1', 'E5:3 r:.75 E5:.25',
    'G5:2 E5:1 r:.75 E5:.25', 'A5:2 A4:1 r:.75 A5:.25', 'A5:2 C5:1 r:.75 A5:.25', 'C6:2 Eb5:1 r:.75 C6:.25', 'C6:2 D5:1 r:.75 D5:.25',
    'D5:2.5 D5:.5 C5:.5 B4:.5', 'G5:1.5 E5:.5 C5:1 r:1', 'F5:2.5 F5:.5 E5:.5 D5:.5', 'D6:1.5 B5:.5 G5:2',
    'A5:2.5 A5:.5 B5:.5 C6:.5', 'E6:2.5 C6:.5 G5:.5 E5:.5', 'D5:2.5 A5:.5 B5:.5 A5:.5', 'A5:.5 G5:.5 F5:.5 D5:.5 B4:.5 G4:.5 F4:.5 D4:.5',
    'C4:8', '', 'G3:8', ''];
  // The edition's dynamics, bar by bar (pp … ff as a share of full organ). The
  // hush at bar 29 is where the film turns to evening.
  const AVE_SWELL = [0.5, 0.5, 0.5, 0.5, 0.54, 0.54, 0.54, 0.54, 0.64, 0.54, 0.64, 0.54, 0.7, 0.62, 0.54, 0.64, 0.56, 0.66, 0.56,
    0.64, 0.74, 0.86, 0.6, 0.64, 0.7, 0.78, 0.84, 0.9, 0.5, 0.6, 0.72, 0.86, 0.94, 1, 0.96, 0.96, 0.8, 0.56, 0.46, 0.42, 0.42];
  const AVE_STARTS = 26; // film bars before the prelude begins

  // Ranks: [tone, pitch (1 = 8 ft, 2 = 4 ft, 0.5 = 16 ft), level, detune in cents].
  const STOPS = {
    celeste: [['string', 1, 0.26, -6], ['string', 1, 0.26, 7], ['flute', 1, 0.16]],
    principals: [['principal', 1, 0.4], ['flute', 1, 0.2], ['principal', 2, 0.15], ['string', 1, 0.1, 5]],
    full: [['principal', 1, 0.42], ['principal', 2, 0.22], ['principal', 4, 0.07], ['flute', 1, 0.18], ['string', 1, 0.12, 5]],
    voice: [['flute', 1, 0.58], ['string', 1, 0.2, 4], ['principal', 1, 0.12]],
    song: [['principal', 1, 0.5], ['flute', 1, 0.32], ['string', 1, 0.2, 4], ['principal', 2, 0.14]],
    reed: [['reed', 1, 0.3], ['principal', 1, 0.44], ['principal', 2, 0.22], ['principal', 4, 0.06]],
    broken: [['flute', 1, 0.36], ['flute', 2, 0.06]],
    held: [['flute', 1, 0.26], ['string', 1, 0.1, -4]],
    quavers: [['flute', 2, 0.17]],
    softPedal: [['flute', 0.5, 0.5], ['flute', 1, 0.26]],
    pedal: [['principal', 0.5, 0.46], ['flute', 0.5, 0.3], ['flute', 1, 0.24]],
    fullPedal: [['principal', 0.5, 0.56], ['reed', 0.5, 0.13], ['principal', 1, 0.3]]
  };
  // Solo stops speak through the tremulant: a slow, shallow wave in loudness.
  const TREMULANT = new Set(['voice', 'song']);
  const TONES = {
    flute: [1, 0.1, 0.3, 0.03, 0.09, 0.01, 0.03],
    principal: [1, 0.62, 0.4, 0.38, 0.16, 0.12, 0.06, 0.1, 0.03],
    string: [1, 0.8, 0.62, 0.5, 0.4, 0.3, 0.22, 0.16, 0.12, 0.08, 0.05],
    reed: [1, 0.9, 0.8, 0.66, 0.5, 0.42, 0.33, 0.26, 0.2, 0.15, 0.11, 0.08, 0.05]
  };
  const STEP = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const pitchClass = name => (STEP[name[0]] + (name[1] === '#' ? 1 : name[1] === 'b' ? -1 : 0) + 12) % 12;
  const midi = name => { const m = name.match(/^([A-G][#b]?)(\d)$/); return 12 * (Number(m[2]) + 1) + STEP[m[1][0]] + (m[1][1] === '#' ? 1 : m[1][1] === 'b' ? -1 : 0); };
  function chord(symbol) {
    const [body, bass] = symbol.split('/'), m = body.match(/^([A-G][#b]?)(m?)(7?)$/);
    const root = pitchClass(m[1]);
    const tones = [root, (root + (m[2] ? 3 : 4)) % 12, (root + 7) % 12];
    if (m[3]) tones.push((root + 10) % 12);
    return { tones, bass: bass ? pitchClass(bass) : root };
  }
  // Nearest placement of a pitch class to a centre note.
  const place = (pc, centre) => pc + 12 * Math.round((centre - pc) / 12);
  const tune = (text, start) => {
    const notes = [];
    let when = start;
    for (const token of text ? text.split(' ') : []) {
      const [name, beats] = token.split(':');
      if (name !== 'r') notes.push({ time: when, length: Number(beats), note: midi(name) });
      when += Number(beats);
    }
    return notes;
  };

  function compose() {
    const events = [];
    const add = (part, voice, time, length, note, stops, level) => {
      const event = { part, voice, time, length, note, stops, level };
      events.push(event);
      return event;
    };
    // Repeated notes in a held part tie, as a key that stays down.
    const held = new Map();
    const tie = (part, voice, key, time, length, note, stops, level) => {
      const last = held.get(key);
      if (last && last.note === note && last.stops === stops && Math.abs(last.time + last.length - time) < 1e-6) { last.length += length; return; }
      held.set(key, add(part, voice, time, length, note, stops, level));
    };

    // Melody with chords: inner parts, pedal and flowing quavers are voiced from the chords.
    function chordal(sections, firstBar) {
      let bar = firstBar;
      for (const section of sections) {
        for (const [chords, melody] of section.bars) {
          const start = bar * BAR, list = chords.split(' '), share = BAR / list.length;
          const sung = tune(melody, start);
          for (const note of sung) {
            add('homeland', 'melody', note.time, note.length - 0.05, note.note, section.solo, section.level);
            // On full organ the melody is doubled at the octave above.
            if (section.doubled) add('homeland', 'melody', note.time, note.length - 0.05, note.note + 12, 'song', section.level * 0.7);
          }
          let top = 96;
          list.forEach((symbol, k) => {
            const c = chord(symbol), time = start + k * share;
            const above = sung.filter(n => n.time < time + share && n.time + n.length > time).map(n => n.note);
            if (above.length) top = Math.min(...above);
            // Inner parts in close position round D4, kept below the melody.
            c.tones.map(pc => place(pc, 62)).map(n => (n > top - 2 ? n - 12 : n))
              .forEach((note, i) => tie('homeland', 'inner', `inner${i}:${note}`, time, share, note, section.pad, section.level * 0.8));
            tie('homeland', 'bass', 'bass', time, share, 36 + c.bass, section.pedal || 'softPedal', section.level);
            if (section.quavers) {
              const ladder = c.tones.map(pc => place(pc, 72)).sort((a, b) => a - b);
              ladder.push(ladder[0] + 12);
              const figure = [0, 1, 2, 3, 2, 1, 2, 1];
              for (let i = 0; i < share * 2; i++) add('homeland', 'quavers', time + i * 0.5, 0.46, ladder[figure[i % 8] % ladder.length], 'quavers', section.level * (i % 4 ? 0.8 : 1));
            }
          });
          bar++;
        }
      }
      return bar;
    }

    let bar = chordal(HOMELAND, 0);
    // Ave Maria.
    const origin = bar * BAR;
    PRELUDE.forEach((text, index) => {
      const [bass, second, ...broken] = text.split(' ').map(midi), level = AVE_SWELL[index], start = origin + index * BAR;
      const forte = index >= 31 && index <= 36; // bars 32–37: principals join, then full organ
      for (const half of [0, 2]) {
        tie('ave', 'bass', 'bass', start + half, 2, bass, forte ? 'fullPedal' : index >= 21 ? 'pedal' : 'softPedal', level);
        tie('ave', 'second', 'second', start + half + 0.25, 1.75, second, 'held', level);
        for (let i = 0; i < 6; i++) add('ave', 'broken', start + half + 0.5 + i * 0.25, 0.27, broken[i % 3], 'broken', level * 0.92);
      }
      if (forte) for (const note of [second, ...broken]) add('ave', 'chord', start, BAR - 0.04, note + (note < 55 ? 12 : 0), index === 31 || index === 36 ? 'principals' : 'full', level * 0.92);
    });
    CADENZA.forEach((text, index) => {
      const bars = PRELUDE.length + index, level = AVE_SWELL[bars], start = origin + bars * BAR;
      tie('ave', 'bass', 'bass', start, BAR, midi('C2'), 'softPedal', level);
      add('ave', 'second', start + 0.25, BAR - 0.25, midi(index ? 'B2' : 'C3'), 'held', level);
      text.split(' ').map(midi).forEach((note, i) => add('ave', 'broken', start + 0.5 + i * 0.25, 0.27, note, 'broken', level * 0.92));
    });
    // Closing chord, bars 40–41, held to the end of the piece.
    const close = origin + (PRELUDE.length + CADENZA.length) * BAR;
    tie('ave', 'bass', 'bass', close, 2 * BAR - 0.6, midi('C2'), 'softPedal', AVE_SWELL[39]);
    for (const name of ['G2', 'C3', 'E4', 'G4', 'C5']) add('ave', 'chord', close, 2 * BAR - 0.6, midi(name), 'held', AVE_SWELL[39]);
    AVE.forEach((text, index) => {
      const number = index + 4, level = AVE_SWELL[number];
      const stops = number >= 32 && number <= 35 ? 'reed' : level >= 0.84 ? 'song' : 'voice';
      for (const note of tune(text, origin + number * BAR)) add('ave', 'melody', note.time, note.length - (note.length > 0.3 ? 0.05 : 0.02), note.note, stops, Math.min(1, level * 1.05));
    });
    bar += AVE_SWELL.length;
    held.clear();
    bar = chordal(FINALE, bar);
    // The last chord rings on under the closing card.
    const end = bar * BAR;
    for (const event of events) if (Math.abs(event.time + event.length - end) < 0.07) event.length = end - event.time + 0.2;
    return { events: events.sort((a, b) => a.time - b.time), bars: bar, aveMaria: { firstBar: AVE_STARTS, bars: AVE_SWELL.length } };
  }
  const score = compose();

  const music = { context: null, on: true, epoch: null, next: 0, zero: 0, synced: false, waking: 0, timer: 0, waves: {} };
  // Resuming sound takes a moment: the picture waits for it instead of running ahead.
  const wake = () => { music.waking = performance.now(); return music.context.resume(); };
  function musicGraph() {
    if (music.context) return music.context;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    const ctx = music.context = new AC({ latencyHint: 'playback' });
    for (const [name, partials] of Object.entries(TONES)) {
      const real = new Float32Array(partials.length + 1), imag = new Float32Array(partials.length + 1);
      partials.forEach((value, i) => { imag[i + 1] = value; });
      music.waves[name] = ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    }
    music.master = ctx.createGain(); music.master.gain.value = 0;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -9; limiter.knee.value = 8; limiter.ratio.value = 8; limiter.attack.value = 0.004; limiter.release.value = 0.3;
    music.meter = ctx.createAnalyser(); music.meter.fftSize = 4096;
    music.master.connect(limiter); limiter.connect(music.meter); music.meter.connect(ctx.destination);
    music.dry = ctx.createGain(); music.dry.gain.value = 0.58; music.dry.connect(music.master);
    // Artificial reverberation: decaying noise, darker as it dies away. A
    // generic large-church tail for the film; not this church's predicted response.
    const seconds = 5.5, rate = ctx.sampleRate, impulse = ctx.createBuffer(2, Math.floor(seconds * rate), rate);
    let seed = 20261009;
    const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2147483648) - 1;
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let low = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate, keep = 0.5 * Math.exp(-t * 0.8) + 0.05;
        low += (random() - low) * keep;
        data[i] = low * Math.exp(-t * 6.9 / 4.4) * Math.min(1, t / 0.014);
      }
    }
    const hall = ctx.createConvolver(); hall.buffer = impulse;
    music.wet = ctx.createGain(); music.wet.gain.value = 0.6;
    music.send = ctx.createGain(); music.send.connect(hall); hall.connect(music.wet); music.wet.connect(music.master);
    // Tremulant for the solo stops.
    music.solo = ctx.createGain(); music.solo.gain.value = 0.94;
    music.solo.connect(music.dry); music.solo.connect(music.send);
    const wave = ctx.createOscillator(), depth = ctx.createGain();
    wave.frequency.value = 5.3; depth.gain.value = 0.085;
    wave.connect(depth); depth.connect(music.solo.gain); wave.start();
    return ctx;
  }
  function musicCut() {
    const ctx = music.context, old = music.epoch;
    if (old) for (const node of old) { node.gain.setTargetAtTime(0, ctx.currentTime, 0.03); setTimeout(() => node.disconnect(), 400); }
    const plain = ctx.createGain(), solo = ctx.createGain();
    plain.connect(music.dry); plain.connect(music.send); solo.connect(music.solo);
    music.epoch = [plain, solo];
  }
  // Start the score at a film time: notes already sounding there come in held.
  function musicSeek(time) {
    const ctx = music.context;
    if (!ctx) return;
    musicCut();
    music.zero = ctx.currentTime + 0.06 - time;
    music.next = 0;
    musicPump();
  }
  function musicPump() {
    const ctx = music.context;
    if (!ctx || ctx.state !== 'running' || !music.synced || !music.epoch) return;
    const now = ctx.currentTime - music.zero, horizon = now + 1.6;
    while (music.next < score.events.length && score.events[music.next].time < horizon) {
      const event = score.events[music.next++];
      const begin = Math.max(ctx.currentTime + 0.01, music.zero + event.time), end = music.zero + event.time + event.length;
      if (end - begin < 0.05) continue;
      const frequency = 440 * Math.pow(2, (event.note - 69) / 12), out = music.epoch[TREMULANT.has(event.stops) ? 1 : 0];
      STOPS[event.stops].forEach(([tone, pitch, level, cents = 0], rank) => {
        const pipe = ctx.createOscillator(), gain = ctx.createGain(), peak = level * event.level * 0.2;
        // Strings speak slowly; flutes and principals promptly.
        const attack = tone === 'string' ? 0.14 : 0.045;
        pipe.setPeriodicWave(music.waves[tone]);
        // Ranks are tuned a hair apart, as real pipes are.
        pipe.frequency.value = frequency * pitch * Math.pow(2, (cents + (rank - 1) * 1.5) / 1200);
        gain.gain.setValueAtTime(0, begin);
        gain.gain.linearRampToValueAtTime(peak, begin + Math.min(attack, (end - begin) * 0.5));
        gain.gain.setValueAtTime(peak, Math.max(begin + Math.min(attack, (end - begin) * 0.5) + 0.005, end - 0.02));
        gain.gain.linearRampToValueAtTime(0, end + 0.1);
        pipe.connect(gain); gain.connect(out);
        pipe.start(begin); pipe.stop(end + 0.13);
      });
    }
  }
  function musicLevel(seconds = 0.25) {
    if (!music.context) return;
    music.master.gain.setTargetAtTime(music.on && film.running ? 0.9 : 0, music.context.currentTime, seconds / 3);
  }

  /* ---------------------------------------------------------------- film */
  const film = { running: false, paused: false, time: 0, shot: null, before: null, church: null, layer: null, lastMove: 0, status: '' };
  const byId = id => document.getElementById(id);

  function buildLayer() {
    if (film.layer) return film.layer;
    const layer = film.layer = document.createElement('div');
    layer.id = 'cinemaLayer'; layer.className = 'cinema-layer'; layer.hidden = true;
    layer.innerHTML = `<div class="cinema-fade"></div>
<div class="cinema-bar cinema-bar-top"></div><div class="cinema-bar cinema-bar-bottom"></div>
<div class="cinema-card"><small></small><h1></h1><p></p><footer></footer></div>
<div class="cinema-caption" aria-live="polite"><span class="cinema-chapter"></span><strong></strong><em></em><p class="cinema-note"></p><p class="cinema-note cinema-note-vi"></p></div>
<div class="cinema-status" role="status"></div>
<div class="cinema-controls" role="toolbar" aria-label="Cinematic tour controls">
<button data-cinema="previous" title="Previous scene (←)" aria-label="Previous scene">⏮</button>
<button data-cinema="pause" title="Pause or play (Space)" aria-label="Pause or play">⏸</button>
<button data-cinema="next" title="Next scene (→)" aria-label="Next scene">⏭</button>
<button data-cinema="music" title="Organ music on or off (M)" aria-pressed="true">♪ Organ</button>
<button data-cinema="full" title="Full screen (F)">⛶ Full screen</button>
<button data-cinema="stop" title="Stop the tour (Esc)">✕ Stop</button>
<span class="cinema-clock"></span></div>
<div class="cinema-progress"><i></i></div>`;
    document.body.append(layer);
    layer.addEventListener('pointermove', () => { film.lastMove = performance.now(); layer.classList.remove('idle'); });
    layer.addEventListener('click', event => {
      const action = event.target.closest('[data-cinema]')?.dataset.cinema;
      if (action === 'previous') skip(-1);
      else if (action === 'next') skip(1);
      else if (action === 'music') setMusic(!music.on);
      else if (action === 'full') fullScreen();
      else if (action === 'stop') film.church.stopTour();
      else if (action === 'pause' || !action) {
        // A first click also unlocks sound when the browser held it back.
        if (music.on && music.context?.state === 'suspended' && !film.paused) void wake();
        else setPaused(!film.paused);
      }
    });
    return layer;
  }
  const part = selector => film.layer.querySelector(selector);

  function applyScene(shot) {
    const church = film.church, ui = church.uiState();
    if (ui.lighting !== shot.light) church.setLighting(shot.light);
    if (ui.roof !== shot.roof) church.setRoof(shot.roof);
  }
  function showShot(shot) {
    film.shot = shot;
    applyScene(shot);
    const caption = part('.cinema-caption');
    part('.cinema-chapter').textContent = `${CHAPTERS[shot.chapter].en} · ${CHAPTERS[shot.chapter].vi}`;
    caption.querySelector('strong').textContent = shot.en || '';
    caption.querySelector('em').textContent = shot.vi || '';
    part('.cinema-note').textContent = shot.note?.en || '';
    part('.cinema-note-vi').textContent = shot.note?.vi || '';
    caption.dataset.empty = String(!shot.en);
    if (shot.card) {
      const card = part('.cinema-card');
      card.querySelector('small').textContent = shot.card.small;
      card.querySelector('h1').textContent = shot.card.title;
      card.querySelector('p').textContent = shot.card.line;
      card.querySelector('footer').replaceChildren(...(shot.card.foot || []).map(text => Object.assign(document.createElement('span'), { textContent: text })));
    }
  }
  function draw() {
    const { church, layer } = film, camera = church.orbitCamera, controls = church.controls;
    const p = pose(film.time);
    if (p.shot !== film.shot) showShot(p.shot);
    camera.up.set(...p.up);
    camera.position.set(...p.eye);
    camera.lookAt(...p.look);
    if (Math.abs(camera.fov - p.lens) > 1e-3) { camera.fov = p.lens; camera.updateProjectionMatrix(); }
    // Kept current so that Explore continues from this exact view when the film stops.
    controls.target.set(...p.look);
    const local = film.time - p.shot.start, left = p.shot.duration - local;
    layer.querySelector('.cinema-fade').style.opacity = blackAt(film.time).toFixed(3);
    const cardFrom = p.shot.card?.at ?? 1.2, cardTo = p.shot.card?.at ? p.shot.duration - 2.4 : 9.5;
    part('.cinema-card').classList.toggle('visible', !!p.shot.card && local > cardFrom && local < cardTo);
    // A caption stays long enough to read both languages, and clears before a title card.
    const captionTo = p.shot.card?.at ? p.shot.card.at - 1.2 : Math.min(p.shot.duration - 1.2, 14.5);
    part('.cinema-caption').classList.toggle('visible', !!p.shot.en && local > 1 && local < captionTo);
    part('.cinema-progress i').style.width = `${(100 * film.time / filmLength).toFixed(2)}%`;
    const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    part('.cinema-clock').textContent = `${clock(film.time)} / ${clock(filmLength)} · scene ${p.shot.index + 1} of ${SHOTS.length}`;
    if (!film.paused && performance.now() - film.lastMove > 2600) layer.classList.add('idle');
    status();
  }
  function status() {
    // "Blocked" only once the browser has clearly declined to start sound.
    const blocked = music.on && film.running && !film.paused && music.context?.state === 'suspended' && performance.now() - music.waking > 1500;
    const text = film.paused ? 'Paused · Space to continue' : blocked ? 'Click once to switch the organ music on' : !music.context && music.on ? 'This browser has no sound output for the organ music' : '';
    const signature = `${text}|${film.paused}|${music.on}`;
    if (signature === film.status) return;
    film.status = signature;
    part('.cinema-status').textContent = text;
    part('[data-cinema="pause"]').textContent = film.paused ? '▶' : '⏸';
    part('[data-cinema="music"]').setAttribute('aria-pressed', String(music.on));
    film.layer.classList.toggle('paused', film.paused);
  }

  /* The viewer's render loop calls this once a frame while the film runs. The
   * sound clock drives the picture when it is available, so the two stay
   * together; otherwise the film runs on frame time. */
  function frame(dt) {
    if (!film.running) return false;
    const ctx = music.context;
    if (!film.paused) {
      if (ctx && ctx.state === 'running') {
        if (!music.synced) { music.synced = true; musicSeek(film.time); }
        film.time = ctx.currentTime - music.zero;
        musicPump();
      } else if (!(ctx && music.synced && performance.now() - music.waking < 700)) {
        if (music.synced) music.synced = false;
        film.time += Math.min(0.1, Math.max(0, dt));
      }
    }
    if (film.time >= filmLength) { finish(); return true; }
    draw();
    return true;
  }

  function start(church) {
    if (film.running || !church?.ready) return false;
    church.setMode('explore');
    film.church = church;
    const ui = church.uiState(), camera = church.orbitCamera;
    film.before = { lighting: ui.lighting, roof: ui.roof, lens: camera.fov, enabled: church.controls.enabled };
    buildLayer().hidden = false;
    document.body.classList.add('cinema');
    church.controls.enabled = false;
    window.CHURCH_REALISM?.setOpenings('open');
    film.running = true; film.paused = false; film.time = 0; film.shot = null; film.lastMove = performance.now(); film.status = '';
    // Keys now belong to the film, not to the button that started it.
    document.activeElement?.blur?.();
    if (musicGraph()) {
      music.synced = false;
      void wake();
      music.timer = setInterval(musicPump, 250);
      musicLevel(0.4);
    }
    window.addEventListener('keydown', keys, true);
    document.addEventListener('visibilitychange', visibility);
    status(); draw();
    return true;
  }
  // Called by the viewer whenever the tour ends, for any reason.
  function stop(completed = false) {
    if (!film.running) return;
    film.running = false; film.paused = false;
    const { church, before } = film, camera = church.orbitCamera;
    window.removeEventListener('keydown', keys, true);
    document.removeEventListener('visibilitychange', visibility);
    clearInterval(music.timer);
    if (music.context) {
      musicLevel(0.5);
      const ctx = music.context;
      setTimeout(() => { if (!film.running) { if (music.epoch) { music.epoch.forEach(node => node.disconnect()); music.epoch = null; } void ctx.suspend(); } }, 900);
    }
    document.body.classList.remove('cinema');
    film.layer.hidden = true;
    film.layer.classList.remove('idle', 'paused');
    camera.up.set(0, 1, 0);
    camera.fov = before.lens; camera.updateProjectionMatrix();
    church.controls.enabled = before.enabled;
    window.CHURCH_REALISM?.setOpenings(byId('openingsMode')?.value || 'auto');
    if (completed) {
      church.setLighting(before.lighting); church.setRoof(before.roof);
      church.goTo('overview', { instant: true });
    } else {
      // Stopped part-way: stay with the picture on screen and continue in Explore.
      const p = pose(film.time), reach = Math.min(30, Math.max(4, dist(p.eye, p.look)));
      const scale = reach / dist(p.eye, p.look);
      church.controls.target.set(...p.eye.map((v, i) => v + (p.look[i] - v) * scale));
      camera.lookAt(church.controls.target);
      church.controls.update();
      const ui = church.uiState(), kept = [];
      if (ui.lighting !== before.lighting) kept.push(`${ui.lighting} light`);
      if (ui.roof !== before.roof) kept.push(ui.roof ? 'roof shown' : 'roof hidden');
      const toast = byId('toast');
      if (toast) {
        toast.textContent = `Tour stopped. Explore from here${kept.length ? ` · ${kept.join(', ')} stays on (View settings)` : ''}.`;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4200);
      }
      church.render();
    }
    if (document.fullscreenElement) void document.exitFullscreen?.();
  }
  function finish() {
    const church = film.church;
    stop(true);
    church.stopTour();
  }

  function setPaused(value) {
    if (!film.running || film.paused === value) return;
    film.paused = value;
    if (music.context) void (value ? music.context.suspend() : wake());
    film.lastMove = performance.now();
    status(); draw();
  }
  function seek(time) {
    if (!film.running) return;
    film.time = Math.min(filmLength - 0.05, Math.max(0, time));
    if (music.synced) musicSeek(film.time);
    draw(); film.church.render();
  }
  function skip(direction) {
    const shot = shotAt(film.time);
    // "Previous" returns to the start of this scene first, as a player does.
    const target = direction > 0 ? SHOTS[shot.index + 1] : film.time - shot.start > 2.5 ? shot : SHOTS[shot.index - 1] || shot;
    if (target) seek(target.start + 0.01); else film.church.stopTour();
  }
  function setMusic(value) {
    music.on = !!value;
    if (music.on && music.context?.state === 'suspended' && !film.paused) void wake();
    musicLevel(0.3); status();
  }
  function fullScreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }
  function keys(event) {
    if (!film.running || document.querySelector('dialog[open]')) return;
    const action = { Space: () => setPaused(!film.paused), ArrowRight: () => skip(1), ArrowLeft: () => skip(-1), KeyM: () => setMusic(!music.on), KeyF: fullScreen, Escape: () => film.church.stopTour() }[event.code];
    // The film owns the keyboard while it plays; browser shortcuts pass through.
    event.stopPropagation();
    if (!action || event.metaKey || event.ctrlKey || event.altKey) return;
    event.preventDefault();
    if (!event.repeat) action();
  }
  // A hidden tab draws no frames: hold the music with the picture.
  function visibility() {
    if (!film.running || film.paused || !music.context) return;
    void (document.hidden ? music.context.suspend() : wake());
  }

  /* --------------------------------------------------------------- audit
   * Clearance of the whole flight from the model in the open browser: rays
   * from each sampled camera position against the architecture and every
   * placed fitting. Run it after moving equipment near the route. */
  function audit({ step = 0.25, reach = 1.5, church = window.church } = {}) {
    const T = window.CHURCH_SIMULATOR?.THREE;
    if (!T || !church) throw new Error('The clearance audit needs the open viewer.');
    const skipped = /^(Display batches of the shared model|Presentation ground|Simulator analysis overlay|Simulator lamp halos|Grid labels|Electrical systems)/;
    const all = [], roofless = [];
    (function walk(node, underRoof) {
      if (skipped.test(node.name)) return;
      if ((node.userData?.doorState && node.userData.doorState !== 'open') || (node.userData?.seatingOption && !node.userData.active)) return;
      underRoof ||= /^Roof assembly/.test(node.name);
      // Hidden fittings and the unused seating layout are not in the picture. The
      // reference root is never drawn itself, and the roof is judged per scene.
      if (node.visible === false && !underRoof && node.name !== 'Single shared architectural reference') return;
      if (node.isMesh) { all.push(node); if (!underRoof) roofless.push(node); }
      node.children.forEach(child => walk(child, underRoof));
    })(church.scene, false);
    // World boxes once, so each sample only tests the parts within reach.
    const box = new T.Box3(), boxes = new Map();
    for (const mesh of all) {
      mesh.geometry.boundingBox || mesh.geometry.computeBoundingBox();
      boxes.set(mesh, box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld).expandByScalar(reach).clone());
    }
    const ray = new T.Raycaster(), origin = new T.Vector3(), direction = new T.Vector3();
    const directions = [];
    for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) if (x || y || z) directions.push([x, y, z]);
    const shots = SHOTS.map(shot => ({ id: shot.id, clearance: Infinity, at: null, nearest: '', fastest: 0 }));
    let previous = null;
    for (let time = 0; time < filmLength; time += step) {
      const p = pose(time), row = shots[p.shot.index];
      if (previous && previous.shot === p.shot) row.fastest = Math.max(row.fastest, dist(previous.eye, p.eye) / step);
      previous = p;
      origin.set(...p.eye);
      const near = (p.shot.roof ? all : roofless).filter(mesh => boxes.get(mesh).containsPoint(origin));
      if (!near.length) continue;
      for (const d of directions) {
        ray.set(origin, direction.set(...d).normalize()); ray.far = reach;
        const hit = ray.intersectObjects(near, false)[0];
        if (hit && hit.distance < row.clearance) { row.clearance = hit.distance; row.at = { time: +time.toFixed(2), eye: p.eye.map(v => +v.toFixed(2)) }; row.nearest = hit.object.name || hit.object.parent?.name || 'unnamed part'; }
      }
    }
    for (const row of shots) { row.clearance = Number.isFinite(row.clearance) ? +row.clearance.toFixed(2) : `> ${reach}`; row.fastest = +row.fastest.toFixed(2); }
    return { seconds: filmLength, bars: score.bars, step, reach, shots };
  }

  // Digital level of the music output (dBFS over the last 93 ms). A check that
  // the mix neither clips nor falls silent; not an acoustic level.
  function musicOutput() {
    if (!music.meter || music.context.state !== 'running') return null;
    const data = new Float32Array(music.meter.fftSize);
    music.meter.getFloatTimeDomainData(data);
    let squares = 0, peak = 0;
    for (const v of data) { squares += v * v; peak = Math.max(peak, Math.abs(v)); }
    const dB = v => +(20 * Math.log10(Math.max(v, 1e-6))).toFixed(1);
    return { rmsDbfs: dB(Math.sqrt(squares / data.length)), peakDbfs: dB(peak) };
  }

  window.CHURCH_CINEMA = {
    start, stop, frame, pose, black: blackAt, seek, skip, audit, setPaused, setMusic, musicOutput,
    shots: SHOTS, score,
    get length() { return filmLength; },
    state: () => ({ running: film.running, paused: film.paused, time: film.time, shot: film.shot?.id || null, music: music.on, sound: music.context?.state || 'none', length: filmLength })
  };
})();
