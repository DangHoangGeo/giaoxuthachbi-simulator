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

  /* ---------------------------------------------------------- short film
   * A two-minute cut for sharing (X allows 2 min 20 s): the church by day, then
   * the building systems at night, the wiring on its own, and a request for
   * engineering advice. Twelve scenes of four bars at 2.5 s a bar. Camera
   * routes are taken from the long film, travelled faster. Text in braces is
   * filled from the open model when the film starts; `plain` is used without it.
   */
  const SHORT_BAR = 2.5;
  const SHORT_CHAPTERS = {
    church: { en: 'Nhà thờ Thạch Bi', vi: 'Ninh Bình · Việt Nam' },
    systems: { en: 'The building systems', vi: 'Hệ thống kỹ thuật' }
  };
  const SHORT_SHOTS = [
    { id: 'bells', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'fade', ease: [0.5, 0.8],
      card: { at: 1, small: 'Ninh Bình · Việt Nam', title: 'Nhà thờ Thạch Bi', line: 'A 3D design model of our parish church · Mô hình 3D nhà thờ giáo xứ' },
      keys: [[-29, 27, -5, 2.4, 26, -0.5, 44], [-15, 33, -21, 2.6, 28.5, -1, 44], [7, 36, -27, 3.5, 28, -1.5, 44]] },
    { id: 'whole', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.8, 0.6],
      en: 'Twin towers, 36.9 m to the cross', vi: 'Hai tháp chuông, cao 36,9 m',
      note: { en: 'Modelled from the architect’s drawings: 53 m long under one continuous roof.' },
      keys: [[-84, 44, 54, 13, 12, 0, 40], [-64, 31, 42, 11, 12.5, 0, 42], [-46, 19, 27, 8, 13, 0, 44]] },
    { id: 'roof', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.7, 0.6],
      en: 'A roof of red clay tiles', vi: 'Mái ngói đỏ',
      note: { en: 'Ngói đỏ, the fired-clay roof of Vietnamese villages. A proposed finish.' },
      keys: [[52, 19, 31, 34, 8, 0, 46], [22, 26, 30, 17, 9.5, 0, 45], [-14, 22, 17, 4, 11.5, 0, 44]] },
    { id: 'enter', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'dip', ease: [0.5, 0.7],
      en: 'Come inside', vi: 'Mời bạn vào',
      note: { en: 'Timber columns in red lacquer above the pews.' },
      keys: [[-13.6, -0.3, 0, 6, 3.4, 0, 52], [-8, 1.2, 0, 14, 3, 0, 52], [-1, 1.25, 0, 26, 3, 0, 54], [3.2, 1.6, 0, 38, 3.2, 0, 56], [9.5, 1.7, 0, 48, 3.5, 0, 56], [21, 2.5, 0, 48.6, 3.9, 0, 54]] },
    { id: 'timber', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.5, 0.5],
      en: 'Carved and gilded timber', vi: 'Gỗ chạm khắc, thếp vàng',
      keys: [[33.4, 6.4, 1.9, 22, 11.6, -0.6, 62], [25.6, 7, 2, 14, 11.8, -1, 62], [18.6, 7.1, 1.9, 7, 11, -0.6, 60]] },
    { id: 'sanctuary', chapter: 'church', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.3, 0.2],
      en: 'A sanctuary in red and gold', vi: 'Cung thánh sơn son thếp vàng',
      note: { en: 'An art proposal in the spirit of northern Vietnamese lacquer craft.' },
      keys: [[34.6, 2, 0, 48.8, 4.4, 0, 48], [39.2, 2.5, 0, 48.8, 4.7, 0, 43], [41.7, 2.8, 0, 48.8, 5.1, 0, 38]] },
    { id: 'evening', chapter: 'systems', bars: 4, light: 'evening', roof: true, cut: 'fade', ease: [0.2, 0.5],
      en: 'Then the hard part: light, sound, air, power', vi: 'Phần khó: ánh sáng, âm thanh, thông gió, điện',
      note: { en: '{lights} lamps, {fans} fans and {speakers} loudspeakers are placed in the model. No air conditioning: fans and open windows.' },
      plain: 'Lamps, fans and loudspeakers are placed in the model. No air conditioning: fans and open windows.',
      keys: [[5.4, 1.9, 0, 48.8, 3.8, 0, 56], [14, 2.3, 0, 48.8, 4, 0, 54], [22.5, 2.9, 0, 48.8, 4.4, 0, 52]] },
    { id: 'roof-off', chapter: 'systems', bars: 4, light: 'evening', roof: false, cut: 'dip', ease: [0.2, 0], up: [0, 0, -1],
      en: 'The roof lifted away', vi: 'Nhấc mái để nhìn từ trên',
      note: { en: 'Every fitting in the model has a position and a circuit.' },
      keys: [[26.5, 96, 0.6, 26.5, 0, 0, 40], [26.5, 70, 7, 26.5, 1, 0, 42], [26.5, 46, 31, 26.5, 2, 0, 44], [26.5, 38, 42, 26.5, 2.5, 0, 45]] },
    { id: 'wiring', chapter: 'systems', bars: 4, light: 'evening', roof: false, systems: true, cut: 'dip', ease: [0.3, 0.7],
      en: 'The electrical model', vi: 'Mô hình hệ thống điện',
      note: { en: '{routes} cable routes, about {km} km · {circuits} circuits · two distribution boards · {kw} kW connected. Model estimates, not a checked design.' },
      plain: 'Cable routes, circuits and two distribution boards. Model estimates, not a checked design.',
      keys: [[26.5, 38, 42, 26.5, 2.5, 0, 45], [52, 34, 35, 27, 3, 0, 45], [68, 30, 14, 28, 3.5, 0, 45]] },
    { id: 'wiring-nave', chapter: 'systems', bars: 4, light: 'evening', roof: false, systems: true, cut: 'cut', ease: [0.6, 0.5],
      en: 'What needs an engineer', vi: 'Những việc cần kỹ sư',
      note: { en: 'Supply and earthing · cable sizes and voltage drop · protection and discrimination · surge and lightning protection · emergency lighting.' },
      keys: [[8, 3, 0, 40, 6.5, 0, 62], [20, 3.4, 0, 46, 6.5, 0, 62], [34, 3.9, 0, 48.6, 6, 0, 60]] },
    { id: 'boards', chapter: 'systems', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.3, 0.3],
      en: 'The main board, DB-1', vi: 'Tủ điện chính DB-1',
      note: { en: 'In the service room behind the sanctuary, with the lighting, fan and sound controls. DB-2 serves the towers and entrance. Nothing here is approved for construction.' },
      keys: [[51.9, 1.9, 0.9, 48.9, 1.8, 0, 58], [51.7, 1.9, -0.2, 48.9, 1.8, -0.6, 57], [51.5, 1.9, -1.2, 48.9, 1.8, -1.1, 56]] },
    { id: 'ask', chapter: 'systems', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.2, 0], end: true,
      card: { at: 0.8, hold: true, small: 'Nhà thờ Thạch Bi · Ninh Bình, Việt Nam', title: 'Can you advise us?',
        line: 'I built this model to help my home parish. I am not an electrical engineer.',
        second: 'Electrical, lighting and sound engineers: please reply or send a message.',
        foot: ['Design-development model, not approved for construction · Organ and bells generated by the viewer', 'Xin cảm ơn · Thank you'] },
      keys: [[-12.5, 1.4, 1.2, 2.4, 9, 0, 54], [-22, 3.4, 5, 2.4, 11, 0, 50], [-36, 8, 12, 4, 13, 0, 46]] }
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
  // The two films. `reel` is the one being played.
  const FILMS = {
    full: prepare({ id: 'full', name: 'Cinematic tour', bar: BAR, shots: SHOTS, chapters: CHAPTERS }),
    short: prepare({ id: 'short', name: 'Short film', bar: SHORT_BAR, shots: SHORT_SHOTS, chapters: SHORT_CHAPTERS })
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
    const cardFrom = shot.card?.at ?? 1.2, cardTo = shot.card?.hold ? shot.duration + 1 : shot.card?.at ? shot.duration - 2.4 : 9.5;
    // A caption stays long enough to read, and clears before a title card.
    const captionTo = shot.card?.at ? shot.card.at - 1.2 : Math.min(shot.duration - 1.2, 14.5);
    return { card: !!shot.card && local > cardFrom && local < cardTo, caption: !!shot.en && local > 1 && local < captionTo };
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

  /* Short film: the bells of the two towers, then a toccata on the homeland
   * theme. 4/4 at 96 beats a minute, one bar for every 2.5 s of film, 48 bars.
   * Original; it quotes no existing piece. The melody is the homeland melody of
   * the long film, here on the reeds under running semiquavers. */
  function composeShort() {
    const bar = SHORT_BAR, beat = bar / 4, events = [];
    const add = (voice, time, length, note, stops, level) => { const event = { part: 'short', voice, time, length, note, stops, level }; events.push(event); return event; };
    const held = new Map();
    const tie = (voice, key, time, length, note, stops, level) => {
      const last = held.get(key);
      if (last && last.note === note && last.stops === stops && Math.abs(last.time + last.length - time) < 1e-6) { last.length += length; return; }
      held.set(key, add(voice, time, length, note, stops, level));
    };
    // Two bells a fifth apart, each swinging at its own pace, as from twin towers.
    function peal(from, to, level) {
      for (const [note, period, offset] of [[midi('A3'), 2.3, 0], [midi('E4'), 1.7, 0.9]]) {
        for (let b = from * 4 + offset; b < to * 4 - 0.2; b += period) add('bell', b * beat, 5, note, 'bell', level);
      }
    }
    function block(first, sections) {
      let index = first;
      for (const section of sections) {
        const opening = index;
        for (const [chords, melody] of section.bars) {
          const start = index * bar, list = chords.split(' '), share = bar / list.length;
          const level = Math.min(1, section.level + (section.swell || 0) * (index - opening));
          const sung = tune(melody, 0).map(n => ({ note: n.note, time: start + n.time * beat, length: n.length * beat }));
          for (const n of sung) {
            add('melody', n.time, n.length - 0.04, n.note, section.solo, level);
            if (section.doubled && n.note + 12 <= 88) add('melody', n.time, n.length - 0.04, n.note + 12, 'song', level * 0.7);
          }
          let top = 96;
          list.forEach((symbol, k) => {
            const c = chord(symbol), time = start + k * share;
            const above = sung.filter(n => n.time < time + share && n.time + n.length > time).map(n => n.note);
            if (above.length) top = Math.min(...above);
            c.tones.map(pc => place(pc, 62)).map(n => (n > top - 2 ? n - 12 : n))
              .forEach((note, i) => tie('inner', `inner${i}:${note}`, time, share, note, section.pad, level * (section.running ? 0.6 : 0.8)));
            tie('bass', 'bass', time, share, 36 + c.bass, section.pedal || 'softPedal', level);
            const ladder = c.tones.map(pc => place(pc, 76)).sort((a, b) => a - b);
            // Running semiquavers: top, middle, bottom, middle of the chord.
            if (section.running) for (let i = 0; i < Math.round(share / beat * 4); i++) add('running', time + i * beat / 4, beat / 4 - 0.01, ladder[[2, 1, 0, 1][i % 4] % ladder.length], 'sparkle', level * (i % 4 ? 0.78 : 1));
            // A quiet pulse of quavers on the top of the chord.
            if (section.pulse) for (let i = 0; i < Math.round(share / beat * 2); i++) add('pulse', time + i * beat / 2, beat / 2 - 0.03, ladder[ladder.length - 1], 'quavers', level * (i % 2 ? 0.7 : 1));
          });
          index++;
        }
      }
      return index;
    }
    // Bars 1–4: the bells alone; the organ creeps in beneath them.
    peal(0, 4.4, 1);
    add('bass', 2 * bar, 2 * bar, midi('A2'), 'softPedal', 0.6);
    for (const name of ['A3', 'C4', 'E4']) add('inner', 3 * bar, bar, midi(name), 'celeste', 0.5);
    let next = block(4, [
      // Bars 5–8: fanfare.
      { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 0.72, swell: 0.07, bars: [['Am', 'A4:1 C5:1 E5:2'], ['F', 'F5:1 A5:1 C6:2'], ['Dm', 'D5:1 F5:1 A5:2'], ['G', 'G5:2 B5:1 D6:1']] },
      // Bars 9–24: toccata on the homeland theme.
      { pad: 'principals', solo: 'reed', pedal: 'pedal', level: 0.82, running: true, doubled: true, bars: HOME_A },
      { pad: 'principals', solo: 'reed', pedal: 'pedal', level: 0.88, running: true, doubled: true, bars: HOME_B },
      // Bars 25–32: evening. Strings, a single voice, a quiet pulse.
      { pad: 'celeste', solo: 'voice', level: 0.52, swell: 0.012, pulse: true, bars: [['Am', 'E5:2 D5:1 C5:1'], ['Am', 'A4:4'], ['F', 'C5:2 A4:1 C5:1'], ['F', 'F5:3 E5:1'],
        ['Dm', 'D5:2 F5:1 E5:1'], ['Dm', 'D5:4'], ['E', 'B4:2 E5:2'], ['E', 'G#5:3 B5:1']] },
      // Bars 33–36: the wiring revealed; the organ gathers.
      { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 0.7, swell: 0.08, running: true, bars: [['Am', 'A4:1 C5:1 E5:2'], ['F', 'F5:1 A5:1 C6:2'], ['G', 'D5:1 G5:1 B5:2'], ['G', 'D6:4']] },
      // Bars 37–44: the theme on full organ, with the bells.
      { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 1, running: true, doubled: true, bars: HOME_A },
      // Bars 45–47: close; bar 48 is left to the bells.
      { pad: 'full', solo: 'reed', pedal: 'fullPedal', level: 0.94, bars: [['F/C', 'A5:2 C6:2'], ['C', 'C6:8'], ['C', '']] }
    ]);
    peal(34, 47.4, 0.72);
    // Nothing sounds past the last bar: the final bell rings into the fade.
    const end = (next + 1) * bar;
    for (const event of events) event.length = Math.min(event.length, end - event.time + 0.2);
    return { events: events.sort((a, b) => a.time - b.time), bars: next + 1, bar };
  }
  FILMS.full.score = score;
  FILMS.short.score = composeShort();

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
      if (event.stops === 'bell') {
        // A bell is struck once: one already ringing at a seek is not struck again.
        if (music.zero + event.time > ctx.currentTime - 0.08) strike(ctx, begin, event);
        continue;
      }
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
  /* A cast bell: hum, prime, minor-third tierce, quint, nominal and upper
   * partials, each dying away at its own rate. Synthesised; it is not a
   * recording of the church's bells. */
  const BELL = [[0.5, 0.45, 3.2], [1, 0.7, 2.4], [1.2, 0.55, 1.8], [1.5, 0.3, 1.2], [2, 0.75, 1.5], [2.5, 0.25, 0.9], [3, 0.3, 0.7], [4.2, 0.18, 0.4], [5.4, 0.1, 0.25]];
  function strike(ctx, begin, event) {
    const frequency = 440 * Math.pow(2, (event.note - 69) / 12);
    for (const [ratio, level, fade] of BELL) {
      const partial = ctx.createOscillator(), gain = ctx.createGain();
      partial.frequency.value = frequency * ratio;
      gain.gain.setValueAtTime(0, begin);
      gain.gain.linearRampToValueAtTime(level * event.level * 0.13, begin + 0.004);
      gain.gain.setTargetAtTime(0, begin + 0.004, fade / 3);
      partial.connect(gain); gain.connect(music.epoch[0]);
      partial.start(begin); partial.stop(begin + fade * 2.4);
    }
  }
  function musicLevel(seconds = 0.25) {
    if (!music.context) return;
    music.master.gain.setTargetAtTime(music.on && film.running ? 0.9 : 0, music.context.currentTime, seconds / 3);
  }

  /* ---------------------------------------------------------------- film */
  const film = { running: false, paused: false, time: 0, shot: null, before: null, church: null, layer: null, lastMove: 0, status: '', stats: null, text: null };
  // What the next start plays: set by the buttons, used once.
  const wanted = { film: 'full', record: false, save: true };
  const byId = id => document.getElementById(id);

  function buildLayer() {
    if (film.layer) return film.layer;
    const layer = film.layer = document.createElement('div');
    layer.id = 'cinemaLayer'; layer.className = 'cinema-layer'; layer.hidden = true;
    layer.innerHTML = `<div class="cinema-fade"></div>
<div class="cinema-bar cinema-bar-top"></div><div class="cinema-bar cinema-bar-bottom"></div>
<div class="cinema-card"><small></small><h1></h1><p></p><p class="cinema-second"></p><footer></footer></div>
<div class="cinema-caption" aria-live="polite"><span class="cinema-chapter"></span><strong></strong><em></em><p class="cinema-note"></p><p class="cinema-note cinema-note-vi"></p></div>
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

  // Numbers quoted in the short film come from the model that is open.
  function modelStats() {
    const sim = window.CHURCH_SIMULATOR;
    try {
      const power = sim.powerSummary(), routes = sim.electrical.routes, count = { light: 0, fan: 0, speaker: 0 };
      for (const item of sim.state.items) { const cat = sim.typeOf(item)?.cat; if (!item.hidden && cat in count) count[cat]++; }
      return { lights: count.light, fans: count.fan, speakers: count.speaker, routes: routes.length,
        km: (routes.reduce((sum, route) => sum + (route.length || 0), 0) / 1000).toFixed(1),
        circuits: Object.keys(power.byCircuit).length, kw: (power.rated / 1000).toFixed(1) };
    } catch { return null; }
  }
  const fill = (text, plain) => !text || !text.includes('{') ? text || '' : film.stats ? text.replace(/\{(\w+)\}/g, (all, key) => film.stats[key]) : plain || '';
  function applyScene(shot) {
    const church = film.church, wiring = window.CHURCH_SIMULATOR?.electrical, ui = church.uiState();
    const change = ui.lighting !== shot.light || ui.roof !== shot.roof;
    // The wiring-only view remembers what was visible when it was switched on,
    // so it is left before the light or the roof changes and entered after.
    if (wiring?.view.mode === 'systems' && (change || !shot.systems)) wiring.setMode('building');
    if (ui.lighting !== shot.light) church.setLighting(shot.light);
    if (ui.roof !== shot.roof) church.setRoof(shot.roof);
    if (shot.systems && wiring && wiring.view.mode !== 'systems') wiring.setMode('systems');
  }
  function showShot(shot) {
    film.shot = shot;
    applyScene(shot);
    const chapter = reel.chapters[shot.chapter];
    const text = film.text = { chapter: `${chapter.en} · ${chapter.vi}`, en: shot.en || '', vi: shot.vi || '',
      note: fill(shot.note?.en, shot.plain), noteVi: shot.note?.vi || '', card: shot.card || null };
    tape.fx.caption = tape.fx.card = 0;
    const caption = part('.cinema-caption');
    part('.cinema-chapter').textContent = text.chapter;
    caption.querySelector('strong').textContent = text.en;
    caption.querySelector('em').textContent = text.vi;
    part('.cinema-note').textContent = text.note;
    part('.cinema-note-vi').textContent = text.noteVi;
    caption.dataset.empty = String(!shot.en);
    if (shot.card) {
      const card = part('.cinema-card');
      card.querySelector('small').textContent = shot.card.small;
      card.querySelector('h1').textContent = shot.card.title;
      card.querySelector('p').textContent = shot.card.line;
      part('.cinema-second').textContent = shot.card.second || '';
      card.querySelector('footer').replaceChildren(...(shot.card.foot || []).map(line => Object.assign(document.createElement('span'), { textContent: line })));
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
    const on = showing(p.shot, film.time - p.shot.start);
    layer.querySelector('.cinema-fade').style.opacity = blackAt(film.time).toFixed(3);
    part('.cinema-card').classList.toggle('visible', on.card);
    part('.cinema-caption').classList.toggle('visible', on.caption);
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
      wiring: sim?.electrical?.view.mode, overlay: sim?.state.settings.overlay };
    film.stats = modelStats();
    // The films show the building; the wiring-only view is entered scene by scene.
    if (film.before.wiring === 'systems') sim.electrical.setMode('building');
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
    document.body.classList.remove('cinema');
    film.layer.hidden = true;
    film.layer.classList.remove('idle', 'paused', 'recording');
    // The wiring-only view and the analysis overlay return to what they were.
    const sim = window.CHURCH_SIMULATOR;
    if (sim?.electrical && before.wiring && sim.electrical.view.mode !== before.wiring) sim.electrical.setMode(before.wiring);
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
  // Start a film by name: 'full' or 'short'. With record, it is saved as a video.
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
  const tape = { on: false, canvas: null, g: null, recorder: null, chunks: [], type: '', ratio: 0, fx: { caption: 0, card: 0 }, last: 0, result: null, save: true, error: '' };
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
  function tapeCanvas() {
    if (!tape.canvas) {
      tape.canvas = Object.assign(document.createElement('canvas'), { width: VIDEO.width, height: VIDEO.height });
      tape.g = tape.canvas.getContext('2d');
    }
    tape.g.fillStyle = '#000'; tape.g.fillRect(0, 0, VIDEO.width, VIDEO.height);
    tape.fx.caption = tape.fx.card = 0; tape.last = 0;
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
    const reelId = reel.id, length = reel.length, recorder = tape.recorder;
    recorder.ondataavailable = event => { if (event.data.size) tape.chunks.push(event.data); };
    recorder.onstop = () => {
      const blob = new Blob(tape.chunks, { type: tape.type });
      const name = `thach-bi-${reelId === 'short' ? 'short-film' : 'cinematic-tour'}-${new Date().toISOString().slice(0, 10)}.${tape.type === 'video/mp4' ? 'mp4' : 'webm'}`;
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
    const step = Math.min(1, Math.abs(film.time - tape.last) / 0.4); tape.last = film.time;
    tape.fx.caption += ((on.caption ? 1 : 0) - tape.fx.caption) * step;
    tape.fx.card += ((on.card ? 1 : 0) - tape.fx.card) * step;
    const black = blackAt(film.time);
    if (black > 0.004) { g.globalAlpha = black; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
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

  // The short film's own button in the Discover menu.
  byId('shortFilmButton')?.addEventListener('click', () => play('short'));

  window.CHURCH_CINEMA = {
    start, stop, frame, rendered, still, play, pose, black: blackAt, seek, skip, audit, setPaused, setMusic, musicOutput,
    shots: SHOTS, score, films: FILMS,
    get length() { return FILMS.full.length; },
    get video() { return tape.result; },
    state: () => ({ running: film.running, paused: film.paused, film: reel.id, time: film.time, shot: film.shot?.id || null, music: music.on,
      sound: music.context?.state || 'none', length: reel.length, recording: tape.on, recordingError: tape.error })
  };
})();
