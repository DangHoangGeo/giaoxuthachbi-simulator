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
 * Four shorter technical tours (lighting, fans and air, sound, electrical
 * grid) use the same player. Each shows the equipment where it is placed and
 * one of the simulator's own views at a time: an analysis map, or the wiring
 * on its own, with figures read from the open model. They switch those views
 * like the other display states and put back what was showing; they change no
 * fitting, scene or setting of the design.
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

  /* ------------------------------------------------------ technical tours
   * Four separate tours of 1 min 52 s each (28 bars): lighting, fans and air,
   * sound, electrical grid. Each shows the equipment where it is placed, then
   * the simulator's own view of it (an analysis map with the roof hidden, or
   * the wiring with the building hidden), then what is still open.
   * Camera routes are those of the film above, or stay in the same clear zones.
   * A scene may also set
   *   overlay  the simulator's analysis map to show: 'lux', 'air', 'spl', 'sti'
   *   systems  the simulator's wiring-only view, filtered to one system:
   *            'all', 'lighting', 'air' or 'sound'
   *   mark     { circuits, sources, en, vi }: rings on the placed fittings of
   *            those circuits and on those boards or control enclosures
   * Text in braces is filled from the open model as the scene starts, so the
   * figures follow the layout and the scene that are open. `plain` is the
   * wording used when the simulator has no value for one of them. All of them
   * are simulator estimates of a design proposal, and the cards say so.
   */
  const TOUR = { en: 'Technical tour', vi: 'Tham quan kỹ thuật' };
  const TOUR_STATUS = 'Design-development model, not a construction-approved design · Mô hình phát triển thiết kế, chưa phải thiết kế được duyệt để thi công';
  const TOUR_SCENE = { foot: ['Figures are simulator estimates for the scene that is open: “{scene}”', 'Số liệu là ước tính của mô phỏng cho chế độ đang mở: “{scene}”'],
    plain: ['Figures are simulator estimates', 'Số liệu là ước tính của mô phỏng'] };
  const TOUR_CLOSE = { title: 'Estimates, not measurements', line: 'Số liệu là ước tính của mô phỏng, chưa phải số đo thực tế' };
  // The plan from almost straight above with side B at the top, held in the upper part
  // of the picture so that the caption does not cover it; then down toward the
  // wings and the sanctuary, still with side B at the top, as on a map.
  const MAP_UP = [0, 0, -1];
  const PLAN_KEYS = [[26.5, 84, 10.6, 26.5, 0, 10, 41], [26.5, 74, 10.6, 26.5, 0, 10, 41.5], [26.5, 66, 10.6, 26.5, 0, 10, 42]];
  const WING_KEYS = [[26.5, 66, 10.6, 26.5, 0, 10, 42], [31, 52, 15, 31, 0, 11, 42], [35, 40, 21, 35, 0, 12, 42]];

  const LIGHTING_SHOTS = [
    { id: 'light-intro', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'fade', ease: [0.15, 0.4],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Lighting · Chiếu sáng',
        line: '{lights} light fittings on {lightCircuits} circuits: a design proposal', second: '{lights} bộ đèn trên {lightCircuits} mạch điện: một phương án đề xuất', foot: TOUR_SCENE.foot,
        plain: { line: 'The proposed lighting, circuit by circuit', second: 'Phương án chiếu sáng, theo từng mạch điện', foot: TOUR_SCENE.plain } },
      keys: [[5.4, 1.9, 0, 48.8, 3.8, 0, 56], [11.5, 2.2, 0, 48.8, 3.9, 0, 55], [18, 2.6, 0, 48.8, 4.2, 0, 54]] },
    { id: 'light-reading', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.4],
      en: 'Light for reading', vi: 'Ánh sáng để đọc sách',
      note: { en: '{L1} LED projectors on circuit L1 light the central pews and {L2} on circuit L2 the outer pews. They are mounted high at the roof frames and aim down at the page. In the model each circuit switches and dims on its own.',
        vi: '{L1} đèn chiếu LED thuộc mạch L1 chiếu sáng các dãy ghế giữa, {L2} đèn thuộc mạch L2 chiếu các dãy ghế phía ngoài. Đèn gắn trên cao ở các vì kèo và chiếu xuống trang sách. Trong mô hình, mỗi mạch bật tắt và chỉnh độ sáng riêng.' },
      plain: { en: 'LED projectors on circuits L1 and L2 light the central and outer pews from the roof frames. In the model each circuit switches and dims on its own.',
        vi: 'Đèn chiếu LED thuộc mạch L1 và L2 chiếu sáng các dãy ghế giữa và phía ngoài từ các vì kèo. Trong mô hình, mỗi mạch bật tắt và chỉnh độ sáng riêng.' },
      mark: { circuits: ['L1', 'L2'], en: 'Reading projectors · L1, L2', vi: 'Đèn chiếu đọc sách · L1, L2' },
      keys: [[12.6, 6.8, 1.5, 27, 9.4, -1, 60], [18.6, 7.1, 1.9, 33, 9.5, -1.4, 60], [25.6, 7, 2, 40, 9.2, -1.6, 60]] },
    { id: 'light-map', chapter: 'tour', bars: 4, light: 'evening', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'lux',
      en: 'The simulator’s light map', vi: 'Bản đồ ánh sáng của mô phỏng',
      note: { en: 'Estimated light on an open book, 0.8 m above the floor, without daylight. The seats average {luxAvg} lux; {luxOk} % of the {seats} seats have 200 lux or more, the aim for a full service, and the lowest has {luxMin} lux.',
        vi: 'Ước tính độ rọi trên trang sách mở, cao 0,8 m so với nền, không tính ánh sáng ban ngày. Trung bình tại chỗ ngồi là {luxAvg} lux; {luxOk} % trong {seats} chỗ ngồi đạt từ 200 lux trở lên, mục tiêu cho thánh lễ đầy đủ, và chỗ thấp nhất là {luxMin} lux.' },
      plain: { en: 'Estimated light on an open book, 0.8 m above the floor, without daylight. The project aims for 200 lux or more at every seat in a full service.',
        vi: 'Ước tính độ rọi trên trang sách mở, cao 0,8 m so với nền, không tính ánh sáng ban ngày. Dự án hướng tới 200 lux trở lên ở mọi chỗ ngồi trong thánh lễ đầy đủ.' },
      keys: PLAN_KEYS },
    { id: 'light-wings', chapter: 'tour', bars: 4, light: 'evening', roof: false, cut: 'cut', ease: [0, 0.2], up: MAP_UP, overlay: 'lux',
      en: 'The wings on the map', vi: 'Hai cánh trên bản đồ',
      note: { en: 'In the wings the seats average {wingLux} lux and the lowest has {wingLuxMin} lux, against an average of {naveLux} lux in the nave. Seats below 200 lux remain an open item for the lighting designer.',
        vi: 'Ở hai cánh, chỗ ngồi trung bình {wingLux} lux, chỗ thấp nhất {wingLuxMin} lux, so với trung bình {naveLux} lux ở lòng nhà thờ. Những chỗ dưới 200 lux còn để ngỏ cho kỹ sư chiếu sáng.' },
      plain: { en: 'On the map, blue and teal mean less than 200 lux. Seats below 200 lux in a full service remain an open item for the lighting designer.',
        vi: 'Trên bản đồ, màu xanh lam và xanh ngọc là dưới 200 lux. Những chỗ dưới 200 lux trong thánh lễ đầy đủ còn để ngỏ cho kỹ sư chiếu sáng.' },
      keys: WING_KEYS },
    { id: 'light-sanctuary', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.2, 0.2],
      en: 'Accent light on the sanctuary', vi: 'Ánh sáng nhấn cho cung thánh',
      note: { en: 'Circuit L3 has {L3} fittings, most of them for the sanctuary: key lights on the altar and the ambo, narrow accents on the crucifix, the tabernacle and the statues. On its own circuit, the sanctuary stays bright while the nave is dimmed.',
        vi: 'Mạch L3 có {L3} bộ đèn, phần lớn cho cung thánh: đèn chính cho bàn thờ và giảng đài, đèn rọi góc hẹp cho thánh giá, nhà tạm và các tượng. Nhờ có mạch riêng, cung thánh vẫn sáng khi lòng nhà thờ giảm sáng.' },
      plain: { en: 'Circuit L3 serves the sanctuary: key lights on the altar and the ambo, narrow accents on the crucifix, the tabernacle and the statues.',
        vi: 'Mạch L3 phục vụ cung thánh: đèn chính cho bàn thờ và giảng đài, đèn rọi góc hẹp cho thánh giá, nhà tạm và các tượng.' },
      mark: { circuits: ['L3'], en: 'Sanctuary lights · L3', vi: 'Đèn cung thánh · L3' },
      keys: [[34.6, 2, 0, 48.8, 4.4, 0, 48], [39.2, 2.5, 0, 48.8, 4.7, 0, 43], [41.7, 2.8, 0, 48.8, 5.1, 0, 38]] },
    { id: 'light-warm', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'dip', ease: [0.25, 0.1],
      en: 'Chandeliers and candle sconces', vi: 'Đèn chùm và đèn nến gắn tường',
      note: { en: '{chandeliers} brass chandeliers and {sconces} wall sconces on circuit LD give the warm glow people see, and {LA} uplights on circuit LA wash the roof lining. The light for reading comes from the projectors.',
        vi: '{chandeliers} đèn chùm đồng và {sconces} đèn nến gắn tường thuộc mạch LD tạo ánh sáng ấm mà mọi người nhìn thấy, còn {LA} đèn hắt thuộc mạch LA chiếu lên lớp ván trần. Ánh sáng để đọc sách đến từ các đèn chiếu.' },
      plain: { en: 'Brass chandeliers and wall sconces on circuit LD give the warm glow people see. The light for reading comes from the projectors.',
        vi: 'Đèn chùm đồng và đèn nến gắn tường thuộc mạch LD tạo ánh sáng ấm mà mọi người nhìn thấy. Ánh sáng để đọc sách đến từ các đèn chiếu.' },
      mark: { circuits: ['LD'], en: 'Chandeliers and sconces · LD', vi: 'Đèn chùm và đèn nến tường · LD' },
      keys: [[40.6, 2.6, 0, 22, 3.8, 0, 56], [39.6, 4.8, 0, 12, 5.2, 0, 58], [38.7, 6.9, 0, 3, 6.4, 0, 60]] },
    { id: 'light-outside', chapter: 'tour', bars: 6, light: 'evening', roof: true, cut: 'fade', ease: [0.1, 0], end: true,
      en: 'Towers, façade and quick scenes', vi: 'Tháp, mặt tiền và các chế độ nhanh',
      note: { en: 'A second board, DB-2, inside the main doors feeds the tower floodlights (L6), the entrance (L9) and the concealed light at the three statues (L10). {scenes} quick scenes set all the circuits together, from a full service to night security.',
        vi: 'Tủ điện thứ hai, DB-2, đặt phía trong cửa chính, cấp điện cho đèn pha tháp (L6), lối vào (L9) và đèn giấu quanh ba tượng (L10). {scenes} chế độ nhanh đặt tất cả các mạch cùng lúc, từ thánh lễ đầy đủ đến bảo vệ ban đêm.' },
      plain: { en: 'A second board, DB-2, inside the main doors feeds the tower floodlights (L6), the entrance (L9) and the concealed light at the three statues (L10). Quick scenes set all the circuits together.',
        vi: 'Tủ điện thứ hai, DB-2, đặt phía trong cửa chính, cấp điện cho đèn pha tháp (L6), lối vào (L9) và đèn giấu quanh ba tượng (L10). Các chế độ nhanh đặt tất cả các mạch cùng lúc.' },
      card: { at: 15, hold: true, small: 'Lighting · Chiếu sáng', ...TOUR_CLOSE,
        foot: [TOUR_STATUS, 'Still open: selected lamps and their photometric files, glare, daylight, emergency lighting, circuits and controls', 'Còn để ngỏ: chọn đèn và tệp trắc quang, độ chói, ánh sáng ban ngày, chiếu sáng sự cố, mạch điện và điều khiển'] },
      keys: [[-12.5, 1.4, 1.2, 2.4, 9, 0, 54], [-22, 3.4, 5, 2.4, 11, 0, 50], [-36, 8, 12, 4, 13, 0, 46]] }
  ];

  const AIR_SHOTS = [
    { id: 'air-intro', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.6],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Fans and air · Quạt và thông gió',
        line: 'No air conditioning: open windows, verandas and {fans} modelled fans', second: 'Không dùng điều hòa: cửa mở, hàng hiên và {fans} quạt trong mô hình', foot: TOUR_SCENE.foot,
        plain: { line: 'No air conditioning: open windows, verandas and fans', second: 'Không dùng điều hòa: cửa mở, hàng hiên và quạt', foot: TOUR_SCENE.plain } },
      keys: [[-11, 1.4, -19.4, 8, 4.2, -10, 50], [9, 2.1, -18.6, 26, 4.2, -10.5, 50], [22, 2.7, -18.6, 38, 4.6, -11.5, 50]] },
    { id: 'air-ceiling', chapter: 'tour', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.3],
      en: 'Ceiling fans over the pews', vi: 'Quạt trần trên các dãy ghế',
      note: { en: '{F1} ceiling fans, {F1size} m across, hang at least {F1side} m to either side of the centre line, so the view down the nave to the altar stays clear. {F1on} of them are running in this scene.',
        vi: '{F1} quạt trần đường kính {F1size} m treo cách trục giữa ít nhất {F1side} m về mỗi bên, nên tầm nhìn dọc lòng nhà thờ lên bàn thờ vẫn thông thoáng. Trong chế độ này có {F1on} quạt đang chạy.' },
      plain: { en: 'Ceiling fans on circuit F1 hang over the pews.', vi: 'Quạt trần thuộc mạch F1 treo phía trên các dãy ghế.' },
      mark: { circuits: ['F1'], en: 'Ceiling fans · F1', vi: 'Quạt trần · F1' },
      keys: [[9.5, 1.7, 0, 48, 3.5, 0, 56], [19, 2.3, 0, 48.5, 3.8, 0, 54], [28.5, 3.3, 0, 48.8, 4.2, 0, 52]] },
    { id: 'air-map', chapter: 'tour', bars: 4, light: 'day', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'air',
      en: 'The simulator’s air-speed map', vi: 'Bản đồ tốc độ gió của mô phỏng',
      note: { en: 'Estimated air speed at seated height, 0.6 m above the floor, from the {fansOn} fans that are running. The seats average {airAvg} m/s; {airOk} % of them lie within 0.3 to 0.8 m/s, the aim for comfort without lifting pages.',
        vi: 'Ước tính tốc độ gió ở tầm người ngồi, cao 0,6 m so với nền, do {fansOn} quạt đang chạy tạo ra. Trung bình tại chỗ ngồi là {airAvg} m/s; {airOk} % chỗ ngồi nằm trong khoảng 0,3 đến 0,8 m/s, mục tiêu để mát mà không lật trang sách.' },
      plain: { en: 'Estimated air speed at seated height, 0.6 m above the floor, from the fans that are running. The project aims for 0.3 to 0.8 m/s at the seats.',
        vi: 'Ước tính tốc độ gió ở tầm người ngồi, cao 0,6 m so với nền, do các quạt đang chạy tạo ra. Dự án hướng tới 0,3 đến 0,8 m/s tại chỗ ngồi.' },
      keys: PLAN_KEYS },
    { id: 'air-wings', chapter: 'tour', bars: 4, light: 'day', roof: false, cut: 'cut', ease: [0, 0.2], up: MAP_UP, overlay: 'air',
      en: 'The wings on the map', vi: 'Hai cánh trên bản đồ',
      note: { en: 'In the wings the seats average {wingAir} m/s and the stillest has {wingAirMin} m/s, against an average of {naveAir} m/s in the nave. {F5} wall fans on circuit F5 serve the wings; their positions and brackets are still under review.',
        vi: 'Ở hai cánh, chỗ ngồi trung bình {wingAir} m/s, chỗ lặng gió nhất {wingAirMin} m/s, so với trung bình {naveAir} m/s ở lòng nhà thờ. {F5} quạt tường thuộc mạch F5 phục vụ hai cánh; vị trí và giá đỡ còn đang được xem xét.' },
      plain: { en: 'On the map, grey means almost no air movement from the fans. Wall fans on circuit F5 serve the wings; their positions and brackets are still under review.',
        vi: 'Trên bản đồ, màu xám là gần như không có gió từ quạt. Quạt tường thuộc mạch F5 phục vụ hai cánh; vị trí và giá đỡ còn đang được xem xét.' },
      mark: { circuits: ['F5'], en: 'Wing wall fans · F5', vi: 'Quạt tường hai cánh · F5' },
      keys: WING_KEYS },
    { id: 'air-wall', chapter: 'tour', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.5, 0.5],
      en: 'Wall fans held in reserve', vi: 'Quạt tường để dự phòng',
      note: { en: '{F2idle} small wall fans on circuit F2 line the side walls of the nave. They stay switched off in every built-in scene while their airflow, their noise during speech, the brackets and the maintenance access are reviewed.',
        vi: '{F2idle} quạt tường nhỏ thuộc mạch F2 gắn dọc hai tường bên của lòng nhà thờ. Chúng được để tắt trong mọi chế độ có sẵn, trong khi lưu lượng gió, tiếng ồn lúc giảng, giá đỡ và lối bảo trì còn được xem xét.' },
      plain: { en: 'Small wall fans on circuit F2 line the side walls of the nave. Their airflow, their noise during speech, the brackets and the maintenance access are under review.',
        vi: 'Quạt tường nhỏ thuộc mạch F2 gắn dọc hai tường bên của lòng nhà thờ. Lưu lượng gió, tiếng ồn lúc giảng, giá đỡ và lối bảo trì còn được xem xét.' },
      mark: { circuits: ['F2'], en: 'Nave wall fans · F2', vi: 'Quạt tường lòng nhà thờ · F2' },
      keys: [[12, 2.2, 0.8, 22, 4.6, -7.1, 58], [20, 2.4, 0.8, 30, 4.6, -7.1, 58], [27, 2.6, 0.8, 37, 4.6, -7.1, 58]] },
    { id: 'air-exhaust', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'dip', ease: [0.25, 0.1],
      en: 'Exhaust fans high in the gables', vi: 'Quạt hút trên cao ở các đầu hồi',
      note: { en: '{V1on} exhaust fans move about {exhaust} m³/h, close to {ach} air changes an hour of the modelled volume. The project aim with people inside is 4 to 6. Air through open doors and windows is not counted.',
        vi: '{V1on} quạt hút đẩy khoảng {exhaust} m³/h, gần {ach} lần trao đổi không khí mỗi giờ theo thể tích mô hình. Mục tiêu của dự án khi có người là 4 đến 6 lần. Gió tự nhiên qua cửa mở chưa được tính.' },
      plain: { en: 'Exhaust fans on circuit V1 draw the hot air out high in the building. The project aim with people inside is 4 to 6 air changes an hour; air through open doors and windows is not counted.',
        vi: 'Quạt hút thuộc mạch V1 đưa khí nóng ra ngoài ở trên cao. Mục tiêu của dự án khi có người là 4 đến 6 lần trao đổi không khí mỗi giờ; gió tự nhiên qua cửa mở chưa được tính.' },
      mark: { circuits: ['V1'], en: 'Exhaust fans · V1', vi: 'Quạt hút · V1' },
      keys: [[40.6, 2.6, 0, 22, 3.8, 0, 56], [39.6, 4.8, 0, 12, 5.2, 0, 58], [38.7, 6.9, 0, 3, 6.4, 0, 60]] },
    { id: 'air-outside', chapter: 'tour', bars: 6, light: 'day', roof: true, cut: 'fade', ease: [0.5, 0.1], end: true,
      en: 'Cooling against quiet', vi: 'Làm mát và giữ yên tĩnh',
      note: { en: 'With {fansOn} fans running the simulator estimates {noise} dBA of background noise at the seats, against {ambient} dBA assumed with everything off. More fan speed cools more and makes speech harder to follow, so fans and sound are set together in each scene.',
        vi: 'Khi {fansOn} quạt đang chạy, mô phỏng ước tính tiếng ồn nền tại chỗ ngồi là {noise} dBA, so với {ambient} dBA giả định khi tắt hết. Quạt chạy nhanh hơn thì mát hơn nhưng khó nghe lời hơn, nên quạt và âm thanh được đặt cùng nhau trong từng chế độ.' },
      plain: { en: 'More fan speed cools more and makes speech harder to follow, so fans and sound are set together in each scene.',
        vi: 'Quạt chạy nhanh hơn thì mát hơn nhưng khó nghe lời hơn, nên quạt và âm thanh được đặt cùng nhau trong từng chế độ.' },
      card: { at: 15, hold: true, small: 'Fans and air · Quạt và thông gió', ...TOUR_CLOSE,
        foot: [TOUR_STATUS, 'Still open: selected fans and their data, brackets and fixings, noise during speech, comfort in the hottest season', 'Còn để ngỏ: chọn quạt và thông số, giá đỡ và liên kết, tiếng ồn lúc giảng, tiện nghi vào mùa nóng nhất'] },
      keys: [[38, 22, 32, 27, 8, 0, 46], [10, 28, 28, 13, 10, 0, 45], [-20, 21, 14, 3, 12, 0, 44]] }
  ];

  const SOUND_SHOTS = [
    { id: 'sound-intro', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.6],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Sound · Âm thanh',
        line: 'Speech from the ambo and the altar to every seat: {speakers} loudspeakers and {mics} microphones', second: 'Đưa lời từ giảng đài và bàn thờ đến mọi chỗ ngồi: {speakers} loa và {mics} micro', foot: TOUR_SCENE.foot,
        plain: { line: 'Speech from the ambo and the altar to every seat', second: 'Đưa lời từ giảng đài và bàn thờ đến mọi chỗ ngồi', foot: TOUR_SCENE.plain } },
      keys: [[-8, 1.2, 0, 14, 3, 0, 52], [-1, 1.25, 0, 26, 3, 0, 54], [4.5, 1.6, 0, 40, 3.2, 0, 56]] },
    { id: 'sound-mics', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.4],
      en: 'The microphones', vi: 'Các micro',
      note: { en: '{mics} gooseneck microphones on the sanctuary pick up the voice. The simulator assumes a speaker {micDistance} m from the microphone, talking at an ordinary level of {talker} dBA at 1 m.',
        vi: '{mics} micro cổ ngỗng trên cung thánh thu tiếng nói. Mô phỏng giả định người nói cách micro {micDistance} m, nói ở mức bình thường {talker} dBA tại 1 m.' },
      plain: { en: 'Gooseneck microphones on the sanctuary pick up the voice.', vi: 'Các micro cổ ngỗng trên cung thánh thu tiếng nói.' },
      mark: { circuits: ['MIC'], en: 'Microphones', vi: 'Micro' },
      keys: [[39.7, 3, -3, 45.6, 2.7, 0.4, 50], [38.7, 3.1, 0, 45.8, 2.6, 0, 50], [39.7, 3, 3, 45.6, 2.7, -0.4, 50]] },
    { id: 'sound-columns', chapter: 'tour', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.3],
      en: 'Slim loudspeakers along the walls', vi: 'Loa cột mảnh dọc theo tường',
      note: { en: '{A1} slim column loudspeakers in zone A1, painted the wall colour, cover the nave and the wings from the side walls. In the model each one is delayed, so that its sound arrives together with the voice from the front.',
        vi: '{A1} loa cột mảnh thuộc vùng A1, sơn cùng màu tường, phủ âm cho lòng nhà thờ và hai cánh từ các tường bên. Trong mô hình mỗi loa được làm trễ, để âm thanh đến cùng lúc với tiếng nói từ phía trước.' },
      plain: { en: 'Slim column loudspeakers in zone A1, painted the wall colour, cover the nave and the wings from the side walls.',
        vi: 'Loa cột mảnh thuộc vùng A1, sơn cùng màu tường, phủ âm cho lòng nhà thờ và hai cánh từ các tường bên.' },
      mark: { circuits: ['A1'], en: 'Wall loudspeakers · A1', vi: 'Loa gắn tường · A1' },
      keys: [[10, 2, 0, 40, 3.2, 0, 58], [20, 2.4, 0, 46, 3.4, 0, 58], [29, 2.8, 0, 48, 3.6, 0, 56]] },
    { id: 'sound-level', chapter: 'tour', bars: 4, light: 'day', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'spl',
      en: 'The simulator’s speech-level map', vi: 'Bản đồ mức âm lời nói của mô phỏng',
      note: { en: 'Estimated speech level at ear height, 1.2 m above the floor. The seats average {splAvg} dBA, and nine seats in ten lie within {splSpread} dB of each other: an even level matters more than a loud one.',
        vi: 'Ước tính mức âm lời nói ở tầm tai, cao 1,2 m so với nền. Trung bình tại chỗ ngồi là {splAvg} dBA, và chín trên mười chỗ ngồi chênh nhau không quá {splSpread} dB: âm đều quan trọng hơn âm to.' },
      plain: { en: 'Estimated speech level at ear height, 1.2 m above the floor. The project aims for 68 to 76 dBA, even from seat to seat.',
        vi: 'Ước tính mức âm lời nói ở tầm tai, cao 1,2 m so với nền. Dự án hướng tới 68 đến 76 dBA, đồng đều giữa các chỗ ngồi.' },
      keys: PLAN_KEYS },
    { id: 'sound-clarity', chapter: 'tour', bars: 4, light: 'day', roof: false, cut: 'cut', ease: [0, 0.6], up: MAP_UP, overlay: 'sti',
      en: 'The speech-clarity map', vi: 'Bản đồ độ rõ lời nói',
      note: { en: 'The speech transmission index, STI, runs from 0 to 1, and 0.60 or more counts as good. {stiOk} % of the seats reach 0.60; the average is {stiAvg}. Reverberation and fan noise are included.',
        vi: 'Chỉ số truyền đạt lời nói STI chạy từ 0 đến 1; từ 0,60 trở lên được xem là tốt. {stiOk} % chỗ ngồi đạt 0,60; trung bình là {stiAvg}. Đã tính cả độ vang và tiếng ồn của quạt.' },
      plain: { en: 'The speech transmission index, STI, runs from 0 to 1, and 0.60 or more counts as good. Reverberation and fan noise are included.',
        vi: 'Chỉ số truyền đạt lời nói STI chạy từ 0 đến 1; từ 0,60 trở lên được xem là tốt. Đã tính cả độ vang và tiếng ồn của quạt.' },
      keys: [[26.5, 66, 10.6, 26.5, 0, 10, 42], [28.7, 59, 12.5, 28.7, 0, 10.5, 42], [31, 52, 15, 31, 0, 11, 42]] },
    { id: 'sound-open', chapter: 'tour', bars: 4, light: 'day', roof: false, cut: 'cut', ease: [0.6, 0.2], up: MAP_UP, overlay: 'sti',
      en: 'The wings and the margin before feedback', vi: 'Hai cánh và độ dự trữ chống hú',
      note: { en: 'Wing seats average {wingSti} and the lowest seat in the church has {stiMin}. The margin before feedback at the microphones is {fbLow} to {fbHigh} dB; the project aims for 3 dB or more. Open points go to the sound designer and to tests on site.',
        vi: 'Chỗ ngồi ở hai cánh trung bình {wingSti}, chỗ thấp nhất trong nhà thờ là {stiMin}. Độ dự trữ trước khi hú ở các micro là {fbLow} đến {fbHigh} dB; dự án hướng tới 3 dB trở lên. Các điểm còn để ngỏ dành cho kỹ sư âm thanh và thử nghiệm tại chỗ.' },
      plain: { en: 'Clarity in the wings and the margin before feedback at the microphones are the points to settle with the sound designer and with tests on site.',
        vi: 'Độ rõ ở hai cánh và độ dự trữ chống hú ở các micro là những điểm cần giải quyết cùng kỹ sư âm thanh và thử nghiệm tại chỗ.' },
      mark: { circuits: ['MIC'], en: 'Microphones', vi: 'Micro' },
      keys: [[31, 52, 15, 31, 0, 11, 42], [33, 46, 18, 33, 0, 11.5, 42], [35, 40, 21, 35, 0, 12, 42]] },
    { id: 'sound-outside', chapter: 'tour', bars: 6, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.1], end: true,
      en: 'Verandas, courtyard and levels', vi: 'Hàng hiên, sân và mức âm',
      note: { en: '{A2} pendant loudspeakers serve the verandas (zone A2). {A3} courtyard horns (zone A3) are for crowded feasts only, because their sound returns late through the open windows. Each zone has its own level and mute.',
        vi: '{A2} loa treo phục vụ hàng hiên (vùng A2). {A3} loa nén ngoài sân (vùng A3) chỉ dùng trong các dịp lễ đông người, vì âm thanh dội lại muộn qua các cửa mở. Mỗi vùng có mức âm và nút tắt tiếng riêng.' },
      plain: { en: 'Pendant loudspeakers serve the verandas (zone A2). Courtyard horns (zone A3) are for crowded feasts only, because their sound returns late through the open windows. Each zone has its own level and mute.',
        vi: 'Loa treo phục vụ hàng hiên (vùng A2). Loa nén ngoài sân (vùng A3) chỉ dùng trong các dịp lễ đông người, vì âm thanh dội lại muộn qua các cửa mở. Mỗi vùng có mức âm và nút tắt tiếng riêng.' },
      mark: { circuits: ['A2', 'A3'], en: 'Veranda and courtyard loudspeakers · A2, A3', vi: 'Loa hàng hiên và sân · A2, A3' },
      card: { at: 15, hold: true, small: 'Sound · Âm thanh', ...TOUR_CLOSE,
        foot: [TOUR_STATUS, 'Still open: selected loudspeakers and their data, the margin before feedback, clarity in the wings, tuning and measurements on site', 'Còn để ngỏ: chọn loa và thông số, độ dự trữ chống hú, độ rõ ở hai cánh, cân chỉnh và đo tại chỗ',
          'The background music is not the modelled sound system · Nhạc nền không phải là hệ thống âm thanh trong mô hình'] },
      keys: [[-11, 1.4, 19.4, 8, 4.2, 10, 50], [9, 2.1, 18.6, 26, 4.2, 10.5, 50], [29, 3, 18.6, 43, 4.8, 12, 50]] }
  ];

  const GRID_SHOTS = [
    { id: 'grid-intro', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'fade', ease: [0.5, 0.5],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Electrical grid · Hệ thống điện',
        line: '{routes} cable routes from two boards to {wired} connected fittings: a routing study', second: '{routes} tuyến cáp từ hai tủ điện đến {wired} thiết bị: một nghiên cứu đi dây', foot: TOUR_SCENE.foot,
        plain: { line: 'Cable routes from two boards to every connected fitting: a routing study', second: 'Tuyến cáp từ hai tủ điện đến từng thiết bị: một nghiên cứu đi dây', foot: TOUR_SCENE.plain } },
      keys: [[-60, 25, 37, 9, 12.5, 0, 42], [-50, 20, 30, 8, 12.5, 0, 43], [-40, 15, 22, 6, 13, 0, 44]] },
    { id: 'grid-boards', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.3, 0.3],
      en: 'The main board and the controls', vi: 'Tủ điện chính và các tủ điều khiển',
      note: { en: 'In the service room behind the altar: the main board DB-1, the lighting and scene controls LC-1, the fan controls FC-1 and the sound rack AV-1. One feeder, about {feederM} m of route, runs from here to DB-2 inside the main doors, which serves the towers, the façade and the entrance.',
        vi: 'Trong phòng kỹ thuật sau bàn thờ: tủ điện chính DB-1, tủ điều khiển đèn và chế độ LC-1, tủ điều khiển quạt FC-1 và tủ âm thanh AV-1. Một tuyến cáp nguồn dài khoảng {feederM} m chạy từ đây đến DB-2 phía trong cửa chính, nơi cấp điện cho tháp, mặt tiền và lối vào.' },
      plain: { en: 'In the service room behind the altar: the main board DB-1, the lighting and scene controls LC-1, the fan controls FC-1 and the sound rack AV-1. One feeder runs from here to DB-2 inside the main doors.',
        vi: 'Trong phòng kỹ thuật sau bàn thờ: tủ điện chính DB-1, tủ điều khiển đèn và chế độ LC-1, tủ điều khiển quạt FC-1 và tủ âm thanh AV-1. Một tuyến cáp nguồn chạy từ đây đến DB-2 phía trong cửa chính.' },
      mark: { sources: ['DB1', 'LC1', 'FC1', 'AV1'], en: 'DB-1, LC-1, FC-1, AV-1', vi: 'Tủ điện và tủ điều khiển' },
      keys: [[51.9, 1.9, 0.9, 48.9, 1.8, 0, 64], [51.7, 1.9, -0.2, 48.9, 1.8, -0.6, 63], [51.5, 1.9, -1.2, 48.9, 1.8, -1.1, 62]] },
    { id: 'grid-all', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'fade', ease: [0.3, 0.6], systems: 'all',
      en: 'The wiring on its own', vi: 'Riêng hệ thống dây',
      note: { en: 'The simulator hides the building and leaves the boards, the cable routes and the connected fittings: {routes} routes, about {km} km of drawn route, as {trunks} shared trunks and {drops} individual drops. The lines are drawn thick to be seen; they are not cable sizes.',
        vi: 'Mô phỏng ẩn công trình, chỉ để lại tủ điện, tuyến cáp và thiết bị được nối: {routes} tuyến, khoảng {km} km chiều dài tuyến vẽ, gồm {trunks} tuyến trục dùng chung và {drops} nhánh riêng. Đường dây được vẽ to cho dễ nhìn, không phải tiết diện cáp.' },
      plain: { en: 'The simulator hides the building and leaves the boards, the cable routes and the connected fittings. The lines are drawn thick to be seen; they are not cable sizes.',
        vi: 'Mô phỏng ẩn công trình, chỉ để lại tủ điện, tuyến cáp và thiết bị được nối. Đường dây được vẽ to cho dễ nhìn, không phải tiết diện cáp.' },
      mark: { sources: ['DB1', 'DB2'], en: 'Boards DB-1 and DB-2', vi: 'Tủ điện DB-1 và DB-2' },
      keys: [[26.5, 38, 42, 26.5, 2.5, 0, 45], [52, 34, 35, 27, 3, 0, 45], [68, 30, 14, 28, 3.5, 0, 45]] },
    { id: 'grid-lighting', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.4], systems: 'lighting',
      en: 'Lighting circuits', vi: 'Các mạch chiếu sáng',
      note: { en: 'Each lighting circuit leaves the lighting controls LC-1, or DB-2 at the front, as a shared trunk along the wall bands above the openings, and every fitting has its own drop from it. The exit signs leave DB-1 directly, so that no scene control stands in their way.',
        vi: 'Mỗi mạch chiếu sáng đi từ tủ điều khiển đèn LC-1, hoặc từ DB-2 ở phía trước, thành một tuyến trục dùng chung dọc dải tường phía trên các ô cửa; mỗi bộ đèn có một nhánh riêng từ tuyến đó. Đèn thoát hiểm đi thẳng từ DB-1, để không chế độ nào chặn chúng.' },
      plain: { en: 'Each lighting circuit leaves the lighting controls LC-1, or DB-2 at the front, as a shared trunk along the wall bands above the openings, and every fitting has its own drop from it. The exit signs leave DB-1 directly, so that no scene control stands in their way.',
        vi: 'Mỗi mạch chiếu sáng đi từ tủ điều khiển đèn LC-1, hoặc từ DB-2 ở phía trước, thành một tuyến trục dùng chung dọc dải tường phía trên các ô cửa; mỗi bộ đèn có một nhánh riêng từ tuyến đó. Đèn thoát hiểm đi thẳng từ DB-1, để không chế độ nào chặn chúng.' },
      keys: [[8, 3, 0, 40, 6.5, 0, 62], [20, 3.4, 0, 46, 6.5, 0, 62], [34, 3.9, 0, 48.6, 6, 0, 60]] },
    { id: 'grid-fans', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'dip', ease: [0.5, 0.5], systems: 'air',
      en: 'Fan circuits', vi: 'Các mạch quạt',
      note: { en: 'The {fans} fans are fed through the fan controls FC-1: ceiling fans, wall fans and exhaust fans on separate circuits, so that each group has its own speed. The two entrance circulators are fed from DB-2.',
        vi: '{fans} quạt được cấp điện qua tủ điều khiển quạt FC-1: quạt trần, quạt tường và quạt hút đi các mạch riêng, để mỗi nhóm có tốc độ riêng. Hai quạt lớn ở lối vào lấy điện từ DB-2.' },
      plain: { en: 'The fans are fed through the fan controls FC-1: ceiling fans, wall fans and exhaust fans on separate circuits, so that each group has its own speed.',
        vi: 'Các quạt được cấp điện qua tủ điều khiển quạt FC-1: quạt trần, quạt tường và quạt hút đi các mạch riêng, để mỗi nhóm có tốc độ riêng.' },
      keys: [[10, 22, -30, 24, 4, 0, 48], [26, 22, -32, 27, 4, 0, 48], [42, 22, -30, 30, 4, 0, 48]] },
    { id: 'grid-sound', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.3], systems: 'sound',
      en: 'Sound lines', vi: 'Các đường âm thanh',
      note: { en: 'The {speakers} loudspeakers and {mics} microphones connect to the sound rack AV-1 by separate audio cable bundles. They carry sound from the amplifiers, not mains power; the microphone lines run below the sanctuary floor. Amplifiers, line type and cable sizes are still to be designed.',
        vi: '{speakers} loa và {mics} micro nối về tủ âm thanh AV-1 bằng các bó cáp âm thanh riêng. Chúng truyền tín hiệu từ ampli, không phải điện lưới; dây micro đi dưới nền cung thánh. Ampli, kiểu đường dây và tiết diện cáp còn chờ thiết kế.' },
      plain: { en: 'Loudspeakers and microphones connect to the sound rack AV-1 by separate audio cable bundles. They carry sound from the amplifiers, not mains power. Amplifiers, line type and cable sizes are still to be designed.',
        vi: 'Loa và micro nối về tủ âm thanh AV-1 bằng các bó cáp âm thanh riêng. Chúng truyền tín hiệu từ ampli, không phải điện lưới. Ampli, kiểu đường dây và tiết diện cáp còn chờ thiết kế.' },
      mark: { sources: ['AV1'], en: 'Sound rack AV-1', vi: 'Tủ âm thanh AV-1' },
      keys: [[18, 30, 36, 24, -5, 2, 46], [30, 29, 34, 30, -5, 2, 46], [42, 28, 30, 36, -5, 2, 46]] },
    { id: 'grid-loads', chapter: 'tour', bars: 6, light: 'evening', roof: true, cut: 'fade', ease: [0.5, 0.1], end: true,
      en: 'Loads, and what needs an engineer', vi: 'Phụ tải và những việc cần kỹ sư',
      note: { en: 'In the scene that is open the model draws about {kwNow} kW; all fixed equipment switched on together would be about {kwFixed} kW, with the socket outlets as a separate allowance. Still for the electrical engineer: supply and earthing, cable sizes and voltage drop, protection, surge and lightning protection, emergency lighting.',
        vi: 'Trong chế độ đang mở, mô hình tiêu thụ khoảng {kwNow} kW; nếu bật hết thiết bị cố định cùng lúc sẽ vào khoảng {kwFixed} kW, còn ổ cắm được tính riêng. Phần còn lại dành cho kỹ sư điện: nguồn cấp và nối đất, tiết diện cáp và sụt áp, bảo vệ, chống sét và xung, chiếu sáng sự cố.' },
      plain: { en: 'Still for the electrical engineer: supply and earthing, cable sizes and voltage drop, protection, surge and lightning protection, emergency lighting.',
        vi: 'Phần còn lại dành cho kỹ sư điện: nguồn cấp và nối đất, tiết diện cáp và sụt áp, bảo vệ, chống sét và xung, chiếu sáng sự cố.' },
      card: { at: 15, hold: true, small: 'Electrical grid · Hệ thống điện', title: 'A routing study, not a wiring design', line: 'Đây là nghiên cứu đi dây, chưa phải thiết kế điện',
        foot: [TOUR_STATUS, 'Still open: supply, phases and earthing, cable types and sizes, protective devices, containment and fire stopping, board layouts and control hardware', 'Còn để ngỏ: nguồn cấp, số pha và nối đất, loại và tiết diện cáp, thiết bị bảo vệ, máng ống và chống cháy lan, bố trí tủ và thiết bị điều khiển'] },
      keys: [[59, 27, -33, 27, 2.5, 0, 45], [26.5, 25, -44, 25, 2.5, 0, 46], [-8, 24, -31, 22, 3, 0, 46]] }
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
  function prepare(reel) {
    reel.length = 0;
    reel.shots.forEach((shot, index) => {
      shot.index = index;
      shot.start = reel.length; shot.duration = shot.bars * reel.bar; reel.length += shot.duration;
      // A technical caption stays for the whole scene: it is the explanation.
      shot.stay = !!reel.technical;
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
    return reel;
  }
  // The films by name. `reel` is the one being played.
  const FILMS = {
    full: prepare({ id: 'full', name: 'Cinematic tour', file: 'cinematic-tour', bar: BAR, shots: SHOTS, chapters: CHAPTERS }),
    lighting: prepare({ id: 'lighting', name: 'Lighting tour', file: 'lighting-tour', technical: true, bar: BAR, shots: LIGHTING_SHOTS, chapters: { tour: { en: 'Lighting', vi: 'Chiếu sáng' } } }),
    air: prepare({ id: 'air', name: 'Fans and air tour', file: 'fans-and-air-tour', technical: true, bar: BAR, shots: AIR_SHOTS, chapters: { tour: { en: 'Fans and air', vi: 'Quạt và thông gió' } } }),
    sound: prepare({ id: 'sound', name: 'Sound tour', file: 'sound-tour', technical: true, bar: BAR, shots: SOUND_SHOTS, chapters: { tour: { en: 'Sound', vi: 'Âm thanh' } } }),
    // `wiring`: the boards and cable routes are part of every picture of this tour.
    grid: prepare({ id: 'grid', name: 'Electrical grid tour', file: 'electrical-grid-tour', technical: true, wiring: true, bar: BAR, shots: GRID_SHOTS, chapters: { tour: { en: 'Electrical grid', vi: 'Hệ thống điện' } } })
  };
  let reel = FILMS.full;
  const table = (values, x) => {
    const f = Math.min(1, Math.max(0, x)) * (values.length - 1), i = Math.min(values.length - 2, Math.floor(f));
    return lerp(values[i], values[i + 1], f - i);
  };

  function shotAt(time, of = reel) {
    const t = Math.min(of.length - 1e-4, Math.max(0, time));
    return of.shots.find(shot => t < shot.start + shot.duration) || of.shots[of.shots.length - 1];
  }
  /* Pure function of film time: the same pose for playback, seeking and the
   * clearance audit. */
  function pose(time, of = reel) {
    const shot = shotAt(time, of);
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
  function blackAt(time, of = reel) {
    const shot = shotAt(time, of), next = of.shots[shot.index + 1];
    const span = kind => kind === 'fade' ? 1.3 : kind === 'dip' ? 0.55 : 0;
    const into = span(shot.cut), out = shot.end ? 2.6 : span(next?.cut);
    const local = time - shot.start, left = shot.duration - local;
    return Math.max(into ? 1 - smooth(local / into) : 0, out ? 1 - smooth(left / out) : 0);
  }
  // When a scene's caption and title card are on screen.
  function showing(shot, local) {
    const timed = shot.card?.at !== undefined;
    const cardFrom = shot.card?.at ?? 1.2, cardTo = shot.card?.hold ? shot.duration + 1 : timed ? shot.duration - 2.4 : 9.5;
    // A caption stays long enough to read, and clears before a title card.
    const captionTo = timed ? shot.card.at - 1.2 : shot.stay ? shot.duration - 1.2 : Math.min(shot.duration - 1.2, 14.5);
    return { card: !!shot.card && local >= cardFrom && local < cardTo, caption: !!shot.en && local > 1 && local < captionTo };
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
    sparkle: [['principal', 2, 0.17], ['flute', 1, 0.2]],
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

  // The voices a score is written with: single notes, held notes that tie, and
  // a melody whose chords are voiced into inner parts, pedal and quavers.
  function voices() {
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
    function chordal(sections, firstBar, part = 'homeland') {
      let bar = firstBar;
      for (const section of sections) {
        for (const [chords, melody] of section.bars) {
          const start = bar * BAR, list = chords.split(' '), share = BAR / list.length;
          const sung = tune(melody, start);
          for (const note of sung) {
            add(part, 'melody', note.time, note.length - 0.05, note.note, section.solo, section.level);
            // On full organ the melody is doubled at the octave above.
            if (section.doubled) add(part, 'melody', note.time, note.length - 0.05, note.note + 12, 'song', section.level * 0.7);
          }
          let top = 96;
          list.forEach((symbol, k) => {
            const c = chord(symbol), time = start + k * share;
            const above = sung.filter(n => n.time < time + share && n.time + n.length > time).map(n => n.note);
            if (above.length) top = Math.min(...above);
            // Inner parts in close position round D4, kept below the melody.
            c.tones.map(pc => place(pc, 62)).map(n => (n > top - 2 ? n - 12 : n))
              .forEach((note, i) => tie(part, 'inner', `inner${i}:${note}`, time, share, note, section.pad, section.level * 0.8));
            tie(part, 'bass', 'bass', time, share, 36 + c.bass, section.pedal || 'softPedal', section.level);
            if (section.quavers) {
              const ladder = c.tones.map(pc => place(pc, 72)).sort((a, b) => a - b);
              ladder.push(ladder[0] + 12);
              const figure = [0, 1, 2, 3, 2, 1, 2, 1];
              for (let i = 0; i < share * 2; i++) add(part, 'quavers', time + i * 0.5, 0.46, ladder[figure[i % 8] % ladder.length], 'quavers', section.level * (i % 4 ? 0.8 : 1));
            }
          });
          bar++;
        }
      }
      return bar;
    }
    return { events, held, add, tie, chordal };
  }

  function compose() {
    const { events, held, add, tie, chordal } = voices();
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

  /* Technical tours: the homeland melody once more, quietly on strings and one
   * flute, so that it stays behind the explanation. Two bars of introduction,
   * the melody in four-bar phrases, two bars to close. Original; it quotes no
   * existing piece. */
  function composeQuiet(bars) {
    const { events, chordal } = voices();
    const phrases = [HOME_A.slice(0, 4), HOME_A.slice(4), HOME_B.slice(0, 4), HOME_B.slice(4)];
    const sections = [{ pad: 'celeste', solo: 'voice', level: 0.36, bars: [['C', ''], ['C', 'r:2 E5:.5 G5:.5 A5:1']] }];
    for (let i = 0; i < (bars - 4) / 4; i++) sections.push({ pad: 'celeste', solo: 'voice', level: 0.42, bars: phrases[i % 4] });
    sections.push({ pad: 'celeste', solo: 'voice', level: 0.34, bars: [['C', 'E5:1 G5:1 A5:2'], ['C', 'G5:4']] });
    const end = chordal(sections, 0, 'quiet');
    // The last chord stops a second before the end, leaving its echo for the fade.
    for (const event of events) event.length = Math.min(event.length, end * BAR - 1 - event.time);
    return { events: events.sort((a, b) => a.time - b.time), bars: end };
  }

  FILMS.full.score = score;
  for (const tour of [FILMS.lighting, FILMS.air, FILMS.sound, FILMS.grid]) tour.score = composeQuiet(tour.length / BAR);

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
    const events = reel.score.events;
    while (music.next < events.length && events[music.next].time < horizon) {
      const event = events[music.next++];
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
  const film = { running: false, paused: false, time: 0, shot: null, before: null, church: null, layer: null, lastMove: 0, status: '', text: null, key: null, marks: [], points: [] };
  // What the next start plays: set by the buttons, used once.
  const wanted = { film: 'full', record: false, save: true };
  const byId = id => document.getElementById(id);

  function buildLayer() {
    if (film.layer) return film.layer;
    const layer = film.layer = document.createElement('div');
    layer.id = 'cinemaLayer'; layer.className = 'cinema-layer'; layer.hidden = true;
    layer.innerHTML = `<div class="cinema-marks"></div><div class="cinema-fade"></div>
<div class="cinema-bar cinema-bar-top"></div><div class="cinema-bar cinema-bar-bottom"></div>
<div class="cinema-card"><small></small><h1></h1><p></p><p class="cinema-second"></p><footer></footer></div>
<div class="cinema-caption" aria-live="polite"><span class="cinema-chapter"></span><strong></strong><em></em><p class="cinema-note"></p><p class="cinema-note cinema-note-vi"></p></div>
<div class="cinema-key"><div class="cinema-key-map"><strong></strong><em></em><div class="cinema-scale"></div><small></small></div><div class="cinema-key-mark"><i></i><span><b></b><em></em></span></div></div>
<div class="cinema-status" role="status"></div>
<div class="cinema-controls" role="toolbar" aria-label="Cinematic tour controls">
<button data-cinema="previous" title="Previous scene (←)" aria-label="Previous scene">⏮</button>
<button data-cinema="pause" title="Pause or play (Space)" aria-label="Pause or play">⏸</button>
<button data-cinema="next" title="Next scene (→)" aria-label="Next scene">⏭</button>
<button data-cinema="music" title="Organ music on or off (M)" aria-pressed="true">♪ Organ</button>
<button data-cinema="full" title="Full screen (F)">⛶ Full screen</button>
<button data-cinema="record" title="Play from the start and save the film as a video file">● Save as video</button>
<button data-cinema="stop" title="Stop the tour (Esc)">✕ Stop</button>
<span class="cinema-clock"></span></div>
<div class="cinema-progress"><i></i></div>`;
    document.body.append(layer);
    layer.addEventListener('pointermove', () => { film.lastMove = performance.now(); layer.classList.remove('idle'); });
    layer.addEventListener('click', event => {
      const action = event.target.closest('[data-cinema]')?.dataset.cinema;
      // While recording, only Stop responds: a pause or a jump would be in the file.
      if (tape.on) { if (action === 'stop') film.church.stopTour(); return; }
      if (action === 'record') play(reel.id, { record: true });
      else if (action === 'previous') skip(-1);
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

  /* ---------------------------------------------- figures, maps and marks
   * What the technical tours read from the simulator. Nothing here changes it.
   */
  // The simulator's maps as the tours name them. Colours and steps are the simulator's own.
  const MAPS = {
    lux: { en: 'Light on an open book · lux', vi: 'Độ rọi trên trang sách · lux', aim: 'Project aim: 200 or more · Mục tiêu dự án: từ 200 trở lên' },
    air: { en: 'Air speed at the seats · m/s', vi: 'Tốc độ gió tại chỗ ngồi · m/s', aim: 'Project aim: 0.3 to 0.8 · Mục tiêu dự án: 0,3 đến 0,8' },
    spl: { en: 'Speech level · dBA', vi: 'Mức âm lời nói · dBA', aim: 'Project aim: 68 to 76, even · Mục tiêu dự án: 68 đến 76, đồng đều' },
    sti: { en: 'Speech clarity · STI', vi: 'Độ rõ lời nói · STI', aim: 'Project aim: 0.60 or more · Mục tiêu dự án: từ 0,60 trở lên' }
  };
  // The wiring-only view as the tour names it. Colours are those of the simulator's routes.
  const WIRES = { en: 'Cable routes by system', vi: 'Tuyến cáp theo hệ thống', aim: 'Drawn thick to be seen; not cable sizes · Vẽ to cho dễ nhìn; không phải tiết diện cáp',
    kinds: { feeder: ['Feeder', 'cáp nguồn'], light: ['Light', 'đèn'], fan: ['Fan', 'quạt'], audio: ['Audio', 'loa'], mic: ['Mic', 'micro'], power: ['Socket', 'ổ cắm'], decor: ['Decor', 'trang trí'] } };
  /* Figures quoted in the captions, read from the open model and from the
   * simulator's latest analysis of it. A figure that cannot be read is left
   * out, and a caption that needs it falls back to its plain wording. */
  function modelFigures() {
    const sim = window.CHURCH_SIMULATOR, out = {};
    const put = (key, value, digits = 0) => { if (Number.isFinite(value)) out[key] = value.toFixed(digits); };
    try {
      const shown = sim.state.items.filter(item => !item.hidden), kind = item => sim.typeOf(item) || {};
      const count = test => shown.filter(test).length;
      for (const circuit of new Set(shown.map(item => item.circuit))) put(circuit, count(item => item.circuit === circuit));
      put('lights', count(item => kind(item).cat === 'light'));
      put('lightCircuits', new Set(shown.filter(item => kind(item).cat === 'light').map(item => item.circuit)).size);
      put('chandeliers', count(item => item.circuit === 'LD' && /^chandelier/.test(item.type)));
      put('sconces', count(item => item.circuit === 'LD' && /^sconce/.test(item.type)));
      put('fans', count(item => kind(item).cat === 'fan'));
      put('speakers', count(item => !!kind(item).speaker));
      put('mics', count(item => !!kind(item).mic));
      put('scenes', Object.keys(sim.SCENES).length);
      if (sim.state.scene) out.scene = sim.state.scene;
      // Wall fans that no built-in scene switches on.
      if (Object.values(sim.SCENES).every(scene => !scene.F2)) put('F2idle', count(item => item.circuit === 'F2'));
      const fans = sim.fans(), ceiling = fans.filter(fan => fan.item.circuit === 'F1'), fansOn = fans.filter(fan => fan.running).length;
      // Left out when no fan is running: the air and noise captions then use their plain wording.
      if (fansOn) put('fansOn', fansOn);
      if (ceiling.length) {
        put('F1on', ceiling.filter(fan => fan.running).length); put('F1size', ceiling[0].diameter, 2);
        // Quoted only while every ceiling fan is clear of the central view.
        const side = Math.min(...ceiling.map(fan => Math.abs(fan.pos[2])));
        if (side >= 2) put('F1side', Math.floor(side * 10) / 10, 1);
      }
      const exhaust = fans.filter(fan => fan.kind === 'exhaust' && fan.running), flow = exhaust.reduce((sum, fan) => sum + fan.flow, 0) * 3600;
      if (exhaust.length) {
        put('V1on', exhaust.length); put('ach', flow / sim.room().V, 1);
        out.exhaust = String(Math.round(flow / 100) * 100).replace(/\B(?=(\d{3})+$)/g, ',');
      }
      // Wiring: drawn route lengths, not installed cable lengths; modelled loads, not a supply calculation.
      const routes = sim.electrical?.routes || [];
      if (routes.length) {
        const role = name => routes.filter(route => route.role === name).length;
        put('routes', routes.length); put('km', routes.reduce((sum, route) => sum + route.length, 0) / 1000, 1);
        put('trunks', role('trunk')); put('drops', role('drop') + role('local')); put('wired', new Set(routes.flatMap(route => (route.role === 'trunk' ? [] : route.itemIds))).size);
        put('feederM', routes.find(route => route.id === 'feeder:DB2')?.length);
      }
      const power = sim.powerSummary();
      put('kwNow', power.total / 1000, 1); put('kwFixed', (power.rated - power.outletRated) / 1000, 1);
      const settings = sim.state.settings;
      put('ambient', settings.ambientDbA); put('talker', settings.talkerDbA); put('micDistance', settings.micDistance, 1);
      const margins = sim.mics().map(mic => mic.item.feedbackMargin).filter(Number.isFinite).sort((a, b) => a - b);
      if (margins.length > 1) { put('fbLow', margins[0], 1); put('fbHigh', margins[margins.length - 1], 1); }
      const seats = sim.analysis?.results?.seats;
      if (seats?.n) {
        const mean = (list, key) => { const values = list.map(seat => seat[key]).filter(Number.isFinite); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN; };
        const nave = seats.seats.filter(seat => seat.block !== 'wing'), wing = seats.blocks?.wing;
        put('seats', seats.n);
        // Light and air figures are quoted only while some lamp is lit or some fan is running.
        if (seats.lux?.avg >= 0.5) {
          put('luxAvg', seats.lux.avg); put('luxMin', seats.lux.min); put('luxOk', seats.luxOk); put('naveLux', mean(nave, 'lux'));
          put('wingLux', wing?.lux?.avg); put('wingLuxMin', wing?.lux?.min);
        }
        if (fansOn) {
          put('airAvg', seats.air?.avg, 2); put('airOk', seats.airOk); put('naveAir', mean(nave, 'air'), 2);
          put('wingAir', wing?.air?.avg, 2); put('wingAirMin', wing?.air?.min, 2);
          put('noise', seats.noise?.avg);
        }
        put('splAvg', seats.spl?.avg); put('splSpread', seats.splSpread, 1);
        put('stiAvg', seats.sti?.avg, 2); put('stiMin', seats.sti?.min, 2); put('stiOk', seats.stiOk); put('wingSti', wing?.sti?.avg, 2);
      }
    } catch { /* figures read so far are used; the rest fall back to plain wording */ }
    return out;
  }
  // Vietnamese writes the decimal comma: 0,33 m/s and 25.900 m³/h.
  const viNumber = value => /^-?[\d.,]+$/.test(value) ? value.replace(/[.,]/g, mark => (mark === '.' ? ',' : '.')) : value;
  // Text with its figures in place, or the plain wording when one is missing.
  function say(text, plain, figures, vi) {
    if (!text || !text.includes('{')) return text || '';
    let missing = false;
    const out = text.replace(/\{(\w+)\}/g, (all, key) => {
      const value = figures?.[key];
      if (value === undefined) { missing = true; return ''; }
      return vi ? viNumber(value) : value;
    });
    return missing ? plain || '' : out;
  }
  // The map and the marked fittings of a scene, with the words that explain them.
  function sceneKey(shot) {
    const sim = window.CHURCH_SIMULATOR, wiring = sim?.electrical, key = { map: null, mark: null };
    const map = shot.overlay && sim?.analysis?.KINDS?.[shot.overlay];
    if (map) key.map = { ...MAPS[shot.overlay], stops: map.stops.map(([value, colour]) => [String(value), colour]) };
    if (shot.systems && wiring) {
      // The systems that have a route in this view, each in the colour the simulator draws it.
      const shown = new Set(wiring.reviewSelection().routeIds), colours = new Map();
      for (const route of wiring.routes) if (shown.has(route.id) && !colours.has(route.kind)) colours.set(route.kind, route.color);
      const kinds = Object.keys(WIRES.kinds).filter(kind => colours.has(kind));
      if (kinds.length) key.map = { en: WIRES.en, vi: `${WIRES.vi}: ${kinds.map(kind => WIRES.kinds[kind][1]).join(' · ')}`, aim: WIRES.aim, stops: kinds.map(kind => [WIRES.kinds[kind][0], colours.get(kind)]) };
    }
    const fittings = shot.mark?.circuits && sim ? sim.state.items.filter(item => !item.hidden && shot.mark.circuits.includes(item.circuit)) : [];
    const boards = (shot.mark?.sources || []).map(id => wiring?.SOURCES[id]).filter(Boolean);
    film.marks = [...fittings, ...boards];
    if (film.marks.length) key.mark = { en: shot.mark.en, vi: shot.mark.vi };
    return key;
  }
  // Where the marked fittings are in the picture, as [x, y] from −1 to 1:
  // those in front of the camera, inside the frame and not behind a wall or a
  // column of the simulator's own geometry.
  function markPoints(eye) {
    const sim = window.CHURCH_SIMULATOR, out = [];
    if (!film.marks.length || !sim?.THREE) return out;
    const camera = film.church.orbitCamera, solids = sim.GEO?.occluders, point = film.point ||= new sim.THREE.Vector3();
    camera.updateMatrixWorld();
    for (const item of film.marks) {
      point.set(...item.pos).project(camera);
      if (!(Math.abs(point.x) <= 1 && Math.abs(point.y) <= 1 && Math.abs(point.z) <= 1)) continue;
      // Tested from just in front of the fitting, so that the wall or column it is fixed to does not hide it.
      // With the building hidden nothing stands in the way.
      const reach = dist(eye, item.pos), near = item.pos.map((v, i) => v + (eye[i] - v) * Math.min(0.5, 0.35 / reach));
      if (!film.shot?.systems && (solids?.blockedByWall(eye, near) || solids?.blockedByColumn(eye, near))) continue;
      out.push([point.x, point.y]);
    }
    return out;
  }
  function applyScene(shot) {
    const church = film.church, ui = church.uiState(), sim = window.CHURCH_SIMULATOR, wiring = sim?.electrical;
    // The wiring-only view remembers what was visible when it was switched on,
    // so it is left before the light or the roof changes and entered again after.
    if (wiring?.view.mode === 'systems' && (!shot.systems || ui.lighting !== shot.light || ui.roof !== shot.roof)) wiring.setMode('building');
    if (ui.lighting !== shot.light) church.setLighting(shot.light);
    if (ui.roof !== shot.roof) church.setRoof(shot.roof);
    // A technical tour shows one analysis map at a time, or none.
    if (reel.technical && sim?.setOverlay) {
      const overlay = shot.overlay && sim.analysis?.KINDS?.[shot.overlay] ? shot.overlay : 'none';
      if (sim.state.settings.overlay !== overlay) sim.setOverlay(overlay);
    }
    // The electrical tour shows the boards and routes throughout, one system at a time in the wiring-only scenes.
    if (reel.wiring && wiring) {
      wiring.view.visible = true;
      wiring.setReviewFilter({ system: shot.systems || 'all', circuit: 'all', item: 'all', board: 'all' });
      if (shot.systems && wiring.view.mode !== 'systems') wiring.setMode('systems');
    }
  }
  // The wiring view as it was before a film: layer, filters, selection and, last, the wiring-only view.
  function restoreWiring(wiring, was) {
    const view = wiring.view;
    if (['visible', 'system', 'circuit', 'item', 'board', 'kind', 'selected'].some(name => view[name] !== was[name])) {
      view.visible = was.visible;
      wiring.setReviewFilter({ system: was.system, circuit: was.circuit, item: was.item, board: was.board });
      if (view.kind !== was.kind || view.selected !== was.selected) { view.kind = was.kind; view.selected = was.selected; wiring.rebuild(); }
    }
    if (view.mode !== was.mode) wiring.setMode(was.mode);
  }
  function showShot(shot) {
    film.shot = shot;
    applyScene(shot);
    const chapter = reel.chapters[shot.chapter], figures = reel.technical ? modelFigures() : null, card = shot.card;
    const text = film.text = { chapter: `${chapter.en} · ${chapter.vi}`, en: shot.en || '', vi: shot.vi || '',
      note: say(shot.note?.en, shot.plain?.en, figures), noteVi: say(shot.note?.vi, shot.plain?.vi, figures, true),
      card: card ? { ...card, line: say(card.line, card.plain?.line, figures), second: say(card.second, card.plain?.second, figures, true),
        foot: (card.foot || []).map((line, i) => say(line, card.plain?.foot?.[i], figures)) } : null };
    const key = film.key = sceneKey(shot);
    part('.cinema-key-map').hidden = !key.map;
    part('.cinema-key-mark').hidden = !key.mark;
    if (key.map) {
      const box = part('.cinema-key-map');
      box.querySelector('strong').textContent = key.map.en;
      box.querySelector('em').textContent = key.map.vi;
      box.querySelector('small').textContent = key.map.aim;
      part('.cinema-scale').replaceChildren(...key.map.stops.map(([value, colour]) => {
        const step = document.createElement('span');
        step.style.background = colour; step.dataset.value = value;
        return step;
      }));
    }
    if (key.mark) { part('.cinema-key-mark b').textContent = key.mark.en; part('.cinema-key-mark em').textContent = key.mark.vi; }
    tape.fx.caption = tape.fx.card = 0;
    const caption = part('.cinema-caption');
    part('.cinema-chapter').textContent = text.chapter;
    caption.querySelector('strong').textContent = text.en;
    caption.querySelector('em').textContent = text.vi;
    part('.cinema-note').textContent = text.note;
    part('.cinema-note-vi').textContent = text.noteVi;
    caption.dataset.empty = String(!shot.en);
    if (text.card) {
      const box = part('.cinema-card');
      box.querySelector('small').textContent = text.card.small;
      box.querySelector('h1').textContent = text.card.title;
      box.querySelector('p').textContent = text.card.line;
      part('.cinema-second').textContent = text.card.second || '';
      box.querySelector('footer').replaceChildren(...text.card.foot.map(line => Object.assign(document.createElement('span'), { textContent: line })));
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
    const on = showing(p.shot, film.time - p.shot.start), black = blackAt(film.time);
    layer.querySelector('.cinema-fade').style.opacity = black.toFixed(3);
    part('.cinema-card').classList.toggle('visible', on.card);
    part('.cinema-caption').classList.toggle('visible', on.caption);
    // The map key and the rings belong to the picture: they leave with it and with the closing card.
    part('.cinema-key').classList.toggle('visible', !!(film.key?.map || film.key?.mark) && black < 0.5 && !on.card);
    const points = film.points = on.card ? [] : markPoints(p.eye), rings = part('.cinema-marks');
    while (rings.children.length < points.length) rings.append(document.createElement('i'));
    [...rings.children].forEach((ring, i) => {
      ring.hidden = i >= points.length;
      if (!ring.hidden) { ring.style.left = `${((points[i][0] + 1) * 50).toFixed(2)}%`; ring.style.top = `${((1 - points[i][1]) * 50).toFixed(2)}%`; }
    });
    part('.cinema-progress i').style.width = `${(100 * film.time / reel.length).toFixed(2)}%`;
    const clock = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    part('.cinema-clock').textContent = `${clock(film.time)} / ${clock(reel.length)} · scene ${p.shot.index + 1} of ${reel.shots.length}`;
    if (!film.paused && performance.now() - film.lastMove > 2600) layer.classList.add('idle');
    status();
  }
  function status() {
    // "Blocked" only once the browser has clearly declined to start sound.
    const blocked = music.on && film.running && !film.paused && music.context?.state === 'suspended' && performance.now() - music.waking > 1500;
    const text = tape.on ? '● Recording · keep this window in front until the film ends' : tape.error ? tape.error : film.paused ? 'Paused · Space to continue' : blocked ? 'Click once to switch the organ music on' : !music.context && music.on ? 'This browser has no sound output for the organ music' : '';
    const signature = `${text}|${film.paused}|${music.on}|${tape.on}`;
    if (signature === film.status) return;
    film.status = signature;
    part('.cinema-status').textContent = text;
    part('[data-cinema="pause"]').textContent = film.paused ? '▶' : '⏸';
    part('[data-cinema="music"]').setAttribute('aria-pressed', String(music.on));
    film.layer.classList.toggle('paused', film.paused);
    film.layer.classList.toggle('recording', tape.on);
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
    if (film.time >= reel.length) { finish(); return true; }
    draw();
    return true;
  }

  function start(church) {
    if (film.running || !church?.ready) return false;
    church.setMode('explore');
    film.church = church;
    reel = FILMS[wanted.film] || FILMS.full;
    const recording = wanted.record;
    tape.save = wanted.save; tape.error = '';
    Object.assign(wanted, { film: 'full', record: false, save: true });
    const ui = church.uiState(), camera = church.orbitCamera, sim = window.CHURCH_SIMULATOR;
    film.before = { lighting: ui.lighting, roof: ui.roof, lens: camera.fov, enabled: church.controls.enabled,
      wiring: sim?.electrical ? { ...sim.electrical.view } : null, overlay: sim?.state.settings.overlay };
    // The film shows the building: the wiring-only view is left while it plays.
    if (film.before.wiring?.mode === 'systems') sim.electrical.setMode('building');
    buildLayer().hidden = false;
    document.body.classList.add('cinema');
    church.controls.enabled = false;
    window.CHURCH_REALISM?.setOpenings('open');
    film.running = true; film.paused = false; film.time = 0; film.shot = null; film.lastMove = performance.now(); film.status = '';
    film.key = null; film.marks = []; film.points = [];
    // Keys now belong to the film, not to the button that started it.
    document.activeElement?.blur?.();
    if (musicGraph()) {
      music.synced = false;
      void wake();
      music.timer = setInterval(musicPump, 250);
      musicLevel(0.4);
    }
    if (recording) tapeStart();
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
    tapeStop(); soften();
    film.marks = []; film.points = [];
    document.body.classList.remove('cinema');
    film.layer.hidden = true;
    film.layer.classList.remove('idle', 'paused', 'recording');
    // A wiring-only scene is left first: it holds what was visible when it was entered.
    const sim = window.CHURCH_SIMULATOR, wiring = sim?.electrical;
    if (wiring?.view.mode === 'systems') wiring.setMode('building');
    // The analysis map returns to what it was.
    if (sim && before.overlay !== undefined && sim.state.settings.overlay !== before.overlay) sim.setOverlay(before.overlay);
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
      notify(`Tour stopped. Explore from here${kept.length ? ` · ${kept.join(', ')} stays on (View settings)` : ''}.`);
      church.render();
    }
    // The wiring view returns to what it was, after the light and the roof.
    if (wiring && before.wiring) restoreWiring(wiring, before.wiring);
    if (document.fullscreenElement) void document.exitFullscreen?.();
  }
  function finish() {
    const church = film.church;
    stop(true);
    church.stopTour();
  }
  function notify(message, milliseconds = 4200) {
    const toast = byId('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove('visible'), milliseconds);
  }
  // Start a film by name. With record, it is saved as a video.
  function play(id = 'full', { record = false, save = true } = {}) {
    const church = film.church || window.church;
    if (!church?.ready || !FILMS[id]) return false;
    if (film.running) church.stopTour();
    Object.assign(wanted, { film: id, record, save });
    return church.startTour();
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
    film.time = Math.min(reel.length - 0.05, Math.max(0, time));
    if (music.synced) musicSeek(film.time);
    draw(); film.church.render();
  }
  function skip(direction) {
    const shot = shotAt(film.time);
    // "Previous" returns to the start of this scene first, as a player does.
    const target = direction > 0 ? reel.shots[shot.index + 1] : film.time - shot.start > 2.5 ? shot : reel.shots[shot.index - 1] || shot;
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
    const action = tape.on ? { Escape: () => film.church.stopTour() }[event.code] : { Space: () => setPaused(!film.paused), ArrowRight: () => skip(1), ArrowLeft: () => skip(-1), KeyM: () => setMusic(!music.on), KeyF: fullScreen, Escape: () => film.church.stopTour() }[event.code];
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

  /* ----------------------------------------------------------- recording
   * "Save as video" plays the film from the start and records it for sharing:
   * the 3D picture cropped to 16:9 at 1920 × 1080, with the fades, captions and
   * cards drawn into the picture, and the music. The browser records in real
   * time, so a slow computer gives fewer frames a second; the sound is not
   * affected. MP4 (H.264 + AAC) where the browser offers it, otherwise WebM.
   * The file is made in the browser and handed to the user; nothing is sent
   * anywhere.
   */
  const VIDEO = { width: 1920, height: 1080, fps: 30, bits: 14e6 };
  const tape = { on: false, canvas: null, g: null, recorder: null, chunks: [], type: '', ratio: 0, fx: { caption: 0, card: 0, key: 0 }, last: 0, result: null, save: true, error: '' };
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
  function tapeCanvas() {
    if (!tape.canvas) {
      tape.canvas = Object.assign(document.createElement('canvas'), { width: VIDEO.width, height: VIDEO.height });
      tape.g = tape.canvas.getContext('2d');
    }
    tape.g.fillStyle = '#000'; tape.g.fillRect(0, 0, VIDEO.width, VIDEO.height);
    tape.fx.caption = tape.fx.card = tape.fx.key = 0; tape.last = 0;
    return tape.canvas;
  }
  // Enough pixels behind the 16:9 crop for a 1920 × 1080 picture; put back when the film stops.
  function sharpen() {
    if (tape.ratio) return;
    const renderer = film.church.renderer, view = renderer.domElement;
    tape.ratio = renderer.getPixelRatio();
    const wide = view.clientWidth / view.clientHeight >= VIDEO.width / VIDEO.height;
    const needed = wide ? VIDEO.height / view.clientHeight : VIDEO.width / view.clientWidth;
    if (needed > tape.ratio) renderer.setPixelRatio(Math.min(3, needed));
  }
  function soften() {
    if (!tape.ratio) return;
    const renderer = film.church.renderer;
    if (Math.abs(renderer.getPixelRatio() - tape.ratio) > 1e-3) { renderer.setPixelRatio(tape.ratio); window.CHURCH_PERFORMANCE?.refresh(); }
    tape.ratio = 0;
  }
  function videoType() {
    if (!window.MediaRecorder) return '';
    return ['video/mp4;codecs="avc1.640028,mp4a.40.2"', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type)) || '';
  }
  function tapeStart() {
    tape.result = null; tape.error = '';
    const type = videoType();
    if (!type) { tape.error = 'This browser cannot record video.'; return false; }
    const canvas = tapeCanvas();
    const stream = canvas.captureStream(VIDEO.fps);
    if (music.context) {
      if (!music.tap) { music.tap = music.context.createMediaStreamDestination(); music.meter.connect(music.tap); }
      for (const track of music.tap.stream.getAudioTracks()) stream.addTrack(track);
    }
    try { tape.recorder = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: VIDEO.bits, audioBitsPerSecond: 192000 }); }
    catch (error) { tape.error = `Recording could not start: ${error.message}`; return false; }
    sharpen();
    tape.chunks = []; tape.type = type.split(';')[0];
    const file = reel.file, length = reel.length, recorder = tape.recorder;
    recorder.ondataavailable = event => { if (event.data.size) tape.chunks.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(tape.chunks, { type: tape.type });
      const name = `thach-bi-${file}-${new Date().toISOString().slice(0, 10)}.${tape.type === 'video/mp4' ? 'mp4' : 'webm'}`;
      // soundLead: seconds of recording before film time zero (the sound takes a moment to start).
      tape.result = { blob, name, type: tape.type, megabytes: +(blob.size / 1048576).toFixed(1), filmSeconds: length, soundLead: tape.lead };
      if (tape.save && blob.size) {
        const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(link.href), 60000);
        notify(`Video saved: ${name} (${tape.result.megabytes} MB)${tape.type === 'video/mp4' ? '' : '. Convert WebM to MP4 before posting to X or Instagram'}.`, 9000);
      }
      window.dispatchEvent(new CustomEvent('church-cinema-video', { detail: tape.result }));
    };
    recorder.start(1000);
    tape.began = music.context?.currentTime ?? 0; tape.lead = null;
    tape.on = true;
    return true;
  }
  function tapeStop() {
    if (!tape.on) return;
    tape.on = false;
    tape.lead = music.context && music.synced ? +(music.zero - tape.began).toFixed(3) : null;
    const recorder = tape.recorder;
    // A moment for the last frames and the tail of the sound to reach the file.
    setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 350);
  }
  // Word wrap for the text drawn into the recorded picture.
  function wrap(g, text, width) {
    const lines = [];
    for (const paragraph of String(text).split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const longer = line ? `${line} ${word}` : word;
        if (line && g.measureText(longer).width > width) { lines.push(line); line = word; } else line = longer;
      }
      lines.push(line);
    }
    return lines;
  }
  function paintCaption(g, text, alpha) {
    const W = VIDEO.width, H = VIDEO.height, x = 96, width = 1080;
    const rows = [];
    const row = (value, font, height, colour, spacing = '0px') => {
      if (!value) return;
      g.font = font; g.letterSpacing = spacing;
      for (const line of wrap(g, value, width)) rows.push({ line, font, height, colour, spacing });
    };
    row(text.chapter.toUpperCase(), `600 21px ${SANS}`, 38, '#e6cf93', '5px');
    row(text.en, `400 66px ${SERIF}`, 78, '#f6f2e6');
    row(text.vi, `italic 400 37px ${SANS}`, 52, '#f6f2e6');
    if (text.note) rows.push({ gap: 12 });
    row(text.note, `400 32px ${SANS}`, 45, '#f6f2e6ee');
    row(text.noteVi, `400 29px ${SANS}`, 41, '#f6f2e6cc');
    const height = rows.reduce((sum, r) => sum + (r.gap || r.height), 0), top = H - 84 - height;
    g.save(); g.globalAlpha = alpha;
    const shade = g.createLinearGradient(x - 30, 0, x + width + 150, 0);
    shade.addColorStop(0, 'rgba(13,18,16,.78)'); shade.addColorStop(0.72, 'rgba(13,18,16,.5)'); shade.addColorStop(1, 'rgba(13,18,16,0)');
    g.fillStyle = shade; g.fillRect(x - 30, top - 26, width + 180, height + 52);
    g.fillStyle = '#d9b96a'; g.fillRect(x - 30, top - 26, 4, height + 52);
    g.textBaseline = 'top'; g.textAlign = 'left'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 12;
    let y = top;
    for (const r of rows) {
      if (r.gap) { y += r.gap; continue; }
      g.font = r.font; g.letterSpacing = r.spacing; g.fillStyle = r.colour;
      g.fillText(r.line, x, y + (r.height - parseInt(r.font.match(/(\d+)px/)[1], 10)) / 2);
      y += r.height;
    }
    g.restore();
  }
  function paintCard(g, card, alpha) {
    const W = VIDEO.width, H = VIDEO.height, width = W * 0.8;
    g.save(); g.globalAlpha = alpha;
    const shade = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.55);
    shade.addColorStop(0, 'rgba(0,0,0,.66)'); shade.addColorStop(0.6, 'rgba(0,0,0,.36)'); shade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = '#f6f2e6'; g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = 22;
    const rows = [];
    const row = (value, font, height, spacing = '0px', gap = 0) => {
      if (!value) return;
      g.font = font; g.letterSpacing = spacing;
      wrap(g, value, width).forEach((line, i) => rows.push({ line, font, height, spacing, gap: i ? 0 : gap }));
    };
    row(card.small.toUpperCase(), `500 24px ${SANS}`, 42, '6px');
    let size = 128;
    g.letterSpacing = '2px';
    do { g.font = `400 ${size}px ${SERIF}`; size -= 6; } while (g.measureText(card.title).width > width && size > 60);
    rows.push({ line: card.title, font: g.font, height: size * 1.32, spacing: '2px', gap: 14 });
    row(card.line, `400 40px ${SANS}`, 58, '1px', 22);
    row(card.second, `400 36px ${SANS}`, 52, '0.5px', 16);
    let y = (H - rows.reduce((sum, r) => sum + r.height + r.gap, 0)) / 2 - 20;
    for (const r of rows) {
      y += r.gap; g.font = r.font; g.letterSpacing = r.spacing;
      g.fillText(r.line, W / 2, y + (r.height - parseInt(r.font.match(/(\d+)px/)[1], 10)) / 2);
      y += r.height;
    }
    g.font = `400 23px ${SANS}`; g.letterSpacing = '0.5px'; g.shadowBlur = 8;
    const foot = (card.foot || []).flatMap(text => wrap(g, text, width));
    foot.forEach((line, i) => {
      const top = H - 56 - (foot.length - i) * 40, w = g.measureText(line).width + 30;
      g.fillStyle = 'rgba(0,0,0,.62)'; g.fillRect(W / 2 - w / 2, top - 5, w, 36);
      g.fillStyle = '#f6f2e6dd'; g.fillText(line, W / 2, top + 2);
    });
    g.restore();
  }
  // The map key and the meaning of the rings, at the lower right of the recorded picture.
  function paintKey(g, key, alpha) {
    const W = VIDEO.width, H = VIDEO.height, width = 600, right = W - 96, left = right - width;
    const rows = [];
    const row = (value, font, height, colour) => { g.font = font; for (const line of wrap(g, value, width)) rows.push({ line, font, height, colour }); };
    if (key.map) {
      row(key.map.en, `600 27px ${SANS}`, 38, '#f6f2e6'); row(key.map.vi, `italic 400 24px ${SANS}`, 34, '#f6f2e6dd');
      rows.push({ scale: key.map.stops, height: 74 });
      row(key.map.aim, `400 22px ${SANS}`, 32, '#e6cf93');
    }
    if (key.map && key.mark) rows.push({ height: 14 });
    if (key.mark) {
      rows.push({ line: key.mark.en, font: `600 25px ${SANS}`, height: 36, colour: '#f6f2e6', ring: true, inset: 44 });
      rows.push({ line: key.mark.vi, font: `italic 400 23px ${SANS}`, height: 32, colour: '#f6f2e6dd', inset: 44 });
    }
    const height = rows.reduce((sum, r) => sum + r.height, 0), top = H - 84 - height;
    g.save(); g.globalAlpha = alpha; g.letterSpacing = '0px';
    g.fillStyle = 'rgba(13,18,16,.74)'; g.fillRect(left - 26, top - 22, width + 52, height + 44);
    g.textBaseline = 'top'; g.textAlign = 'left';
    let y = top;
    for (const r of rows) {
      if (r.scale) {
        const step = width / r.scale.length;
        g.font = `400 20px ${SANS}`; g.textAlign = 'center';
        r.scale.forEach(([value, colour], i) => {
          g.fillStyle = colour; g.fillRect(left + i * step, y + 8, step + 0.5, 26);
          g.fillStyle = '#f6f2e6'; g.fillText(value, left + (i + 0.5) * step, y + 42);
        });
        g.textAlign = 'left';
      } else if (r.line) {
        g.font = r.font; g.fillStyle = r.colour;
        g.fillText(r.line, left + (r.inset || 0), y + (r.height - parseInt(r.font.match(/(\d+)px/)[1], 10)) / 2);
        if (r.ring) ring(g, left + 15, y + r.height / 2, 11);
      }
      y += r.height;
    }
    g.restore();
  }
  function ring(g, x, y, radius) {
    g.beginPath(); g.arc(x, y, radius, 0, 2 * Math.PI);
    g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke();
    g.lineWidth = 3; g.strokeStyle = '#ffd76a'; g.stroke();
  }
  // The viewer calls this straight after it has drawn a frame of the film.
  function rendered(source) {
    if (tape.on && film.running) paint(source);
  }
  /* One finished frame of the paused film at a given time: for exporting the
   * film frame by frame at an exact frame rate, however slow the computer. The
   * caller steps the time evenly (1/30 s) and collects the canvas each step. */
  function still(time) {
    if (!film.running || !film.paused || tape.on) return null;
    if (!tape.ratio) { tapeCanvas(); sharpen(); }
    film.time = Math.min(reel.length - 1e-3, Math.max(0, time));
    draw();
    const church = film.church;
    window.CHURCH_REALISM?.update('explore');
    window.CHURCH_SIMULATOR?.frame(1 / VIDEO.fps, 'explore', church.camera);
    church.renderer.render(church.scene, church.camera);
    paint(church.renderer.domElement);
    return tape.canvas;
  }
  function paint(source) {
    const g = tape.g, W = VIDEO.width, H = VIDEO.height, target = W / H;
    let w = source.width, h = w / target;
    if (h > source.height) { h = source.height; w = h * target; }
    g.drawImage(source, (source.width - w) / 2, (source.height - h) / 2, w, h, 0, 0, W, H);
    const p = pose(film.time), on = showing(p.shot, film.time - p.shot.start);
    // Text fades in and out, except in the film's first moments, where it is simply there.
    const step = film.time < 0.3 ? 1 : Math.min(1, Math.abs(film.time - tape.last) / 0.4); tape.last = film.time;
    tape.fx.caption += ((on.caption ? 1 : 0) - tape.fx.caption) * step;
    tape.fx.card += ((on.card ? 1 : 0) - tape.fx.card) * step;
    // Rings on the marked fittings, in the cropped picture and under the fades.
    for (const [x, y] of film.points) {
      const px = ((x + 1) / 2 * source.width - (source.width - w) / 2) / w * W, py = ((1 - y) / 2 * source.height - (source.height - h) / 2) / h * H;
      if (px > 0 && px < W && py > 0 && py < H) ring(g, px, py, 15);
    }
    const black = blackAt(film.time), keyed = !!(film.key?.map || film.key?.mark) && black < 0.5 && !on.card;
    tape.fx.key += ((keyed ? 1 : 0) - tape.fx.key) * step;
    if (black > 0.004) { g.globalAlpha = black; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    if (tape.fx.key > 0.01 && film.key) paintKey(g, film.key, tape.fx.key);
    if (tape.fx.caption > 0.01 && film.text?.en) paintCaption(g, film.text, tape.fx.caption);
    if (tape.fx.card > 0.01 && film.text?.card) paintCard(g, film.text.card, tape.fx.card);
  }

  /* --------------------------------------------------------------- audit
   * Clearance of the whole flight from the model in the open browser: rays
   * from each sampled camera position against the architecture and every
   * placed fitting. Run it after moving equipment near the route. */
  function audit({ step = 0.25, reach = 1.5, church = window.church, film: id = 'full' } = {}) {
    const of = FILMS[id];
    const T = window.CHURCH_SIMULATOR?.THREE;
    if (!T || !church) throw new Error('The clearance audit needs the open viewer.');
    const skipped = /^(Display batches of the shared model|Presentation ground|Sky dome|Simulator analysis overlay|Simulator lamp halos|Grid labels|Electrical systems)/;
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
    const shots = of.shots.map(shot => ({ id: shot.id, clearance: Infinity, at: null, nearest: '', fastest: 0 }));
    let previous = null;
    for (let time = 0; time < of.length; time += step) {
      const p = pose(time, of), row = shots[p.shot.index];
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
    return { film: id, seconds: of.length, bars: of.score.bars, step, reach, shots };
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

  // The technical tours' buttons in the Discover menu name their film.
  for (const button of document.querySelectorAll?.('[data-film]') || []) button.addEventListener('click', () => play(button.dataset.film));

  window.CHURCH_CINEMA = {
    start, stop, frame, rendered, still, play, pose, black: blackAt, seek, skip, audit, setPaused, setMusic, musicOutput, figures: modelFigures, maps: MAPS, wires: WIRES,
    shots: SHOTS, score, films: FILMS,
    get length() { return FILMS.full.length; },
    get video() { return tape.result; },
    state: () => ({ running: film.running, paused: film.paused, film: reel.id, time: film.time, shot: film.shot?.id || null, music: music.on,
      sound: music.context?.state || 'none', length: reel.length, recording: tape.on, recordingError: tape.error })
  };
})();
