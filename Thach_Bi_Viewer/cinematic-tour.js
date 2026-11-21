/* Thạch Bi viewer · cinematic guided tour.
 *
 * A film of about eight and a half minutes of the shared model, at two paces: a
 * slow camera crane that rises up the bell towers, circles a belfry and comes
 * down the front, and a person walking at eye height, with the small sway of
 * each step, up the forecourt steps, along the veranda, in through the central
 * door, up the nave and the side aisle to the sanctuary. It pauses to look up at
 * the timber roof and close at the altar, and returns after dark to walk up to
 * the lit front, along the veranda, round the altar end and back inside.
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
 * Four technical tours (lighting, fans and air, sound, electrical grid) use the
 * same player. Each demonstrates how its system works: circuits are switched
 * on and off, dimmed or cut from their feeder in the simulator, and a live
 * panel shows the figures it calculates again after every switch, beside its
 * own analysis maps and wiring-only view. The switching is a rehearsal in
 * memory (CHURCH_SIMULATOR.rehearsal): nothing is saved, and every switch, the
 * scene, the feeder and the borrowed settings are put back when the tour ends,
 * however it ends. The display states (day or evening, roof, map, wiring view)
 * are put back as well.
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
   *   cut   'fade' (chapter, 1.3 s each side, through black) · 'dissolve'
   *         (the last picture of the scene before melts into this one over
   *         1.6 s; never across a change of light or roof) · 'dip' (0.55 s
   *         through black) · 'cut'
   *   ease  [start, end] speed as a share of cruising speed (0 = from rest)
   *   pan   how much a turn of the camera counts against travel in pacing a
   *         flight (0.3 if not given); more makes a tilt or pan slower
   *   walk  a person walking: eye keys are 1.60 m above the modelled floor
   *         (courtyard −2.080, forecourt −0.480, veranda −0.320, nave 0,
   *         side sanctuary +0.160, platform +0.800 m), at 1.3 m/s or less, and
   *         the eye rises, falls and sways a little with each step
   * Captions state only values held in the model data (church.data); the
   * furnishings, ornament, lighting and sound equipment shown are proposals.
   */
  const BAR = 4;
  // A cross-dissolve: the last picture of the scene before, held and faded out over this one.
  const DISSOLVE = 1.6;
  // A chapter opens on its number and name, before the first caption.
  const CHAPTER_CARD = { from: 0.9, to: 5.2 };
  const CHAPTERS = {
    outside: { en: 'I · Around the church', vi: 'I · Quanh nhà thờ' },
    inside: { en: 'II · Inside', vi: 'II · Bên trong' },
    night: { en: 'III · Evening', vi: 'III · Buổi tối' }
  };
  const SHOTS = [
    // I · Around the church by day: towers, front, forecourt and veranda.
    { id: 'opening', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'fade', ease: [0.2, 0.5],
      card: { small: 'Giáo xứ Thạch Bi', title: 'Nhà thờ Thạch Bi', line: 'Một lời mời trở về quê nhà · An invitation to come home', until: 5.6 },
      keys: [[-50, 2.4, 13, 2, 15, 0, 40], [-45, 8.5, 11.5, 3, 15.5, 0, 41], [-39, 15, 9.5, 4, 15, 0, 43]] },
    { id: 'towers', chapter: 'outside', bars: 7, light: 'day', roof: true, cut: 'dissolve', ease: [0.2, 0.6],
      en: 'The bell towers', vi: 'Hai tháp chuông',
      note: { en: 'Rising stage by stage up the tower on side H: four stages at +8.390, +15.840, +23.140 and +29.090 m above the nave floor.', vi: 'Đi lên từng tầng của tháp phía H: bốn tầng tháp ở +8,390, +15,840, +23,140 và +29,090 m so với nền lòng nhà thờ.' },
      keys: [[-15, 4.5, 13.5, 1.5, 8.4, 10.15, 46], [-14, 11, 12.5, 1.5, 14.5, 10.15, 44], [-13.5, 18, 11.5, 1.8, 21.5, 10.15, 42], [-14, 25, 10.8, 2.2, 28, 10.15, 40], [-16, 30, 9.5, 2.45, 32, 10.15, 40]] },
    { id: 'belfry', chapter: 'outside', bars: 6, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.3],
      en: 'Belfry and dome', vi: 'Lầu chuông và mái vòm',
      note: { en: 'Louvred belfry arches under each dome let the bells ring out over the village. Ornament depth is still schematic.', vi: 'Các vòm cửa chớp của lầu chuông dưới mỗi mái vòm để tiếng chuông vang khắp làng. Chiều sâu hoa văn còn là sơ phác.' },
      keys: [[-16, 30, 9.5, 2.45, 32, 10.15, 40], [-11, 30, 20.5, 2.45, 32.3, 10.15, 44], [0, 29.8, 25.8, 2.45, 32.6, 10.15, 46], [11, 30, 22.5, 2.45, 32.4, 10.15, 46], [17, 30, 13, 2.45, 31.8, 8, 46]] },
    { id: 'facade', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'dissolve', ease: [0.3, 0.3],
      en: 'The tower front', vi: 'Mặt tiền hai tháp',
      note: { en: 'Twin bell towers frame three doors, with Our Lady of the Assumption between them. The cross apex is drawn at +36.920 m above the nave floor.', vi: 'Hai tháp chuông ôm lấy ba cửa chính, ở giữa là tượng Đức Mẹ Lên Trời. Đỉnh thánh giá theo bản vẽ ở cao độ +36,920 m so với nền lòng nhà thờ.' },
      keys: [[-17, 21, 1.5, 2.4, 21, 0, 40], [-16, 15, 0.8, 2.4, 14.5, 0, 42], [-15, 9, 0, 2.4, 8.5, 0, 44], [-15.5, 4, -0.8, 2.4, 4, 0, 46]] },
    { id: 'forecourt', chapter: 'outside', bars: 5, light: 'day', roof: true, cut: 'dissolve', ease: [0.4, 0.2], walk: true,
      en: 'Up the forecourt steps', vi: 'Bước lên sân trước',
      note: { en: 'At walking pace, as a parishioner arrives: from the courtyard at −2.080 m up the steps to the forecourt at −0.480 m, with the three doors ahead.', vi: 'Theo nhịp bước của người giáo dân đến nhà thờ: từ sân ở cao độ −2,080 m bước lên sân trước ở −0,480 m, ba cửa chính ở ngay phía trước.' },
      keys: [[-22, -0.48, -2.6, 2.4, 9, 0, 58], [-16.5, -0.48, -2.2, 2.4, 7, 0, 58], [-12.4, -0.42, -1.9, 2.4, 5.5, 0, 58], [-9.2, 1.12, -1.6, 2.4, 4.5, 0, 58], [-6, 1.12, -2.4, 2.4, 3.4, -6, 60]] },
    { id: 'veranda', chapter: 'outside', bars: 7, light: 'day', roof: true, cut: 'dissolve', ease: [0.4, 0.2], walk: true,
      en: 'Verandas for shade and breeze', vi: 'Hàng hiên che nắng, đón gió',
      note: { en: 'Open verandas in 4.50 m bays shade the walls and let the air through, their floor 0.320 m below the nave. The church is planned for fans and open windows, without air conditioning.', vi: 'Hàng hiên mở theo bước gian 4,50 m che nắng cho tường và đón gió, nền thấp hơn lòng nhà thờ 0,320 m. Nhà thờ được tính toán dùng quạt và cửa mở, không dùng điều hòa.' },
      keys: [[7, 1.28, -9.55, 20, 1.6, -9.3, 58], [12.5, 1.28, -9.55, 17, 2.2, -7.5, 58], [18.5, 1.28, -9.6, 30, 1.7, -9.3, 58], [24, 1.28, -9.55, 27, 2.1, -10.6, 58], [30, 1.28, -9.55, 42, 1.7, -9.4, 58]] },
    { id: 'roof', chapter: 'outside', bars: 5, light: 'day', roof: true, cut: 'dissolve', ease: [0.3, 0.6],
      en: 'A roof of red clay tiles', vi: 'Mái ngói đỏ',
      note: { en: 'Ngói đỏ, fired-clay tiles: the red roof long familiar on Vietnamese village houses, communal halls and churches. A proposed finish, on one continuous roof with its ridge at +12.472 m.', vi: 'Ngói đỏ đất nung, màu mái thân quen của nhà làng, đình và nhà thờ Việt Nam. Đây là vật liệu đề xuất, trên một mái liên tục có nóc ở +12,472 m.' },
      keys: [[12, 3, -25, 18, 4, -10, 50], [24, 8, -29, 30, 6, -8, 48], [38, 13, -28, 42, 7, -4, 46]] },
    { id: 'rear', chapter: 'outside', bars: 6, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.6],
      en: 'The altar end', vi: 'Đầu cung thánh',
      note: { en: 'From axis 1 to axis 12 the church measures 53.016 m. A cross crowns the gable above the sanctuary; the vesting room sits behind its wall.', vi: 'Từ trục 1 đến trục 12 nhà thờ dài 53,016 m. Thánh giá trên đỉnh đầu hồi phía cung thánh; phòng áo nằm ngay sau tường.' },
      keys: [[38, 13, -28, 42, 7, -4, 46], [60, 13, -24, 50, 8, -1, 48], [76, 12, -4, 51, 8.5, 0, 48], [70, 12, 16, 47, 8, 3, 48]] },
    { id: 'side-h', chapter: 'outside', bars: 4, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.1],
      en: 'Widening like a cross', vi: 'Mở rộng như cây thánh giá',
      note: { en: 'Between axes 9 and 10 the church widens on both sides like the arms of a cross; that bay is 7.20 m, against the typical 4.50 m.', vi: 'Giữa trục 9 và 10 nhà thờ mở rộng sang hai bên như hai cánh thánh giá; gian này rộng 7,20 m, các gian thường 4,50 m.' },
      keys: [[70, 12, 16, 47, 8, 3, 48], [54, 10, 25, 42, 5, 9, 48], [38, 7.5, 27, 38, 4, 10, 48]] },

    // II · Inside by day, at walking pace with a few still pauses.
    { id: 'enter', chapter: 'inside', bars: 5, light: 'day', roof: true, cut: 'fade', ease: [0.2, 0.6], walk: true,
      en: 'The doors stand open', vi: 'Cánh cửa rộng mở',
      note: { en: 'In through the central door, 3.100 m clear, under an arch of coloured glass.', vi: 'Bước qua cửa giữa rộng thông thủy 3,100 m, phía trên là vòm kính màu.' },
      keys: [[-7.5, 1.12, 0, 2.4, 3.8, 0, 56], [-3.5, 1.12, 0, 2.4, 4.6, 0, 56], [0.5, 1.15, 0, 14, 3, 0, 56], [4, 1.6, 0, 30, 2.4, 0, 58], [7, 1.6, 0, 42, 2.4, 0, 58]] },
    { id: 'nave', chapter: 'inside', bars: 6, light: 'day', roof: true, cut: 'cut', ease: [0.6, 0.2], walk: true,
      en: 'The nave', vi: 'Lòng nhà thờ',
      note: { en: 'Fourteen timber columns in red lacquer carry the roof frames above the pews. Pews, lamps, fans and loudspeakers are a design proposal.', vi: 'Mười bốn cột gỗ sơn son đỡ các vì kèo phía trên hàng ghế. Ghế, đèn, quạt và loa là phương án đề xuất.' },
      keys: [[7, 1.6, 0, 42, 2.4, 0, 58], [12, 1.6, 0.2, 24, 2.8, -4.5, 58], [17.5, 1.6, 0, 42, 2.6, 0, 58], [22.5, 1.6, -0.2, 32, 2.4, 4.5, 58], [27, 1.6, 0, 46, 2.8, 0, 58]] },
    { id: 'timber', chapter: 'inside', bars: 6, light: 'day', roof: true, cut: 'dissolve', ease: [0, 0.3], pan: 0.8,
      en: 'Carved and gilded beams', vi: 'Xà kèo chạm khắc, thếp vàng',
      note: { en: 'Each tie beam carries a gilded bloom between leafy scrolls, under an ivory boarded lining that keeps the roof light. Member sizes and joints remain an engineering hold.', vi: 'Mỗi quá giang mang một bông hoa thếp vàng giữa hai dải lá cuốn, dưới lớp ván lót màu ngà giúp mái sáng và nhẹ. Tiết diện và mối nối còn chờ kỹ sư kết cấu.' },
      keys: [[24, 1.6, 0, 36, 3, 0, 60], [24.2, 1.65, 0, 28, 8.5, 0, 64], [24.8, 4.2, 0.3, 21, 10.5, -0.6, 64], [25.6, 7, 0.4, 14, 11.8, -0.8, 62], [18.6, 7.1, 0.4, 7, 11, -0.4, 60]] },
    { id: 'aisle', chapter: 'inside', bars: 5, light: 'day', roof: true, cut: 'dissolve', ease: [0.4, 0.2], walk: true,
      en: 'Light through two layers of windows', vi: 'Ánh sáng qua hai lớp cửa',
      note: { en: 'Inner and outer windows stand either side of the veranda, with coloured glass in the arched heads and timber shutters below.', vi: 'Hai lớp cửa sổ trong và ngoài nằm hai bên hiên, kính màu trên các vòm cửa và cánh cửa gỗ bên dưới.' },
      keys: [[11, 1.6, -4.7, 22, 2.4, -4.8, 58], [16, 1.6, -4.7, 19, 2.8, -7.2, 58], [21.5, 1.6, -4.6, 32, 2.4, -5, 58], [26.5, 1.6, -4.7, 40, 2.8, -6.5, 58]] },
    { id: 'wings', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'dissolve', ease: [0.2, 0.2],
      en: 'The two wings', vi: 'Hai cánh nhà thờ',
      note: { en: 'Saint Peter and Saint Paul face each other across the sanctuary steps, one in each wing.', vi: 'Thánh Phêrô và Thánh Phaolô đối diện nhau qua bậc cung thánh, mỗi vị ở một cánh.' },
      keys: [[36.5, 1.65, 1.4, 40.6, 3, -12.5, 58], [37, 1.7, 0, 46, 3, 0, 58], [37.5, 1.75, -1.4, 40.6, 3, 12.5, 58]] },
    { id: 'sanctuary', chapter: 'inside', bars: 6, light: 'day', roof: true, cut: 'dissolve', ease: [0.3, 0], walk: true,
      en: 'The sanctuary in red and gold', vi: 'Cung thánh sơn son thếp vàng',
      note: { en: 'Red lacquer and gilded carving, in the spirit of sơn son thếp vàng, the timber craft of northern Vietnam, frame the altar under three arches. An art proposal on the drawn +0.800 m platform.', vi: 'Sơn son thếp vàng theo tinh thần nghề mộc truyền thống Bắc Bộ ôm lấy bàn thờ dưới ba vòm cung. Đây là đề xuất mỹ thuật trên bục cung thánh +0,800 m theo bản vẽ.' },
      keys: [[35, 1.65, 0, 48.8, 4.4, 0, 56], [37.5, 1.76, 0, 48.8, 4.5, 0, 54], [39.6, 2.2, 0, 48.8, 4.4, 0, 52], [41.2, 2.4, 0, 48.8, 4.2, 0, 50]] },
    { id: 'altar', chapter: 'inside', bars: 5, light: 'day', roof: true, cut: 'cut', ease: [0, 0.3],
      en: 'Altar, tabernacle and crucifix', vi: 'Bàn thờ, nhà tạm và thánh giá',
      note: { en: 'The carved Christ hangs on a red cross in an azure niche above the gilded tabernacle, with Our Lady and Saint Joseph in the shrines on either side.', vi: 'Tượng Chúa chịu nạn chạm gỗ trên thánh giá đỏ, trong hốc tường xanh thiên thanh phía trên nhà tạm thếp vàng; Đức Mẹ và Thánh Giuse ở hai bàn thờ bên.' },
      keys: [[41.2, 2.4, 0, 48.8, 4.2, 0, 50], [41.3, 2.45, 0.6, 47, 2.4, -3.6, 50], [41.5, 2.55, 0, 47.5, 2.6, 0, 44], [41.6, 2.6, 0, 47.5, 4.6, 0, 38], [41.3, 2.45, -0.6, 47, 2.4, 3.6, 50]] },
    { id: 'look-back', chapter: 'inside', bars: 4, light: 'day', roof: true, cut: 'dissolve', ease: [0.25, 0.1],
      en: 'Looking back to the entrance', vi: 'Nhìn về phía cửa chính',
      note: { en: 'From the sanctuary steps, the whole length of the nave back to the doors.', vi: 'Từ bậc cung thánh nhìn suốt lòng nhà thờ về phía cửa chính.' },
      keys: [[40.6, 2.6, 0, 22, 3.8, 0, 56], [39.6, 4.8, 0, 12, 5.2, 0, 58], [38.7, 6.9, 0, 3, 6.4, 0, 60]] },

    // III · Evening: walking up to the lit front, round the outside, and in.
    { id: 'evening', chapter: 'night', bars: 6, light: 'evening', roof: true, cut: 'fade', ease: [0.2, 0.1], walk: true,
      en: 'Coming home after dark', vi: 'Về nhà khi trời tối',
      note: { en: 'The tower front in the evening, with the proposed concealed lighting on the statues and towers. Screen brightness is not a lux measurement.', vi: 'Mặt tiền về đêm với phương án chiếu sáng giấu đèn cho các tượng và hai tháp. Độ sáng màn hình không phải số đo lux.' },
      keys: [[-34, -0.48, 4.5, 2.4, 11, 0, 52], [-27, -0.48, 3.2, 2.4, 12, 0, 52], [-20, -0.48, 2, 2.4, 13.5, 0, 50], [-16.5, -0.48, 1.4, 2.4, 15, 0, 48]] },
    { id: 'night-towers', chapter: 'night', bars: 5, light: 'evening', roof: true, cut: 'dissolve', ease: [0.2, 0.5],
      en: 'The towers at night', vi: 'Tháp chuông về đêm',
      note: { en: 'Concealed lights wash the tower stages from below. Fittings, aiming and outputs remain a proposal until product photometry is chosen.', vi: 'Đèn giấu kín hắt sáng các tầng tháp từ bên dưới. Loại đèn, hướng chiếu và công suất vẫn là đề xuất cho đến khi chọn được số liệu quang học của sản phẩm.' },
      keys: [[-20, 3, -3, 2.4, 11, 0, 48], [-22, 12, -11, 2.45, 19, -10.15, 46], [-20, 22, -15, 2.45, 27, -10.15, 44], [-18, 29, -16, 2.45, 31, -10.15, 44]] },
    { id: 'night-veranda', chapter: 'night', bars: 6, light: 'evening', roof: true, cut: 'dissolve', ease: [0.4, 0.2], walk: true,
      en: 'Along the veranda at night', vi: 'Dọc hàng hiên về đêm',
      note: { en: 'Path lights guide the way along the veranda, and the windows glow from the nave inside. The lighting is the proposal as the viewer draws it.', vi: 'Đèn lối đi dẫn bước dọc hàng hiên, các cửa sổ sáng lên từ lòng nhà thờ bên trong. Ánh sáng là phương án đề xuất theo cách hiển thị của mô hình.' },
      keys: [[7, 1.28, 9.55, 20, 1.6, 9.3, 58], [13, 1.28, 9.55, 17.5, 2.2, 7.5, 58], [19.5, 1.28, 9.6, 30, 1.7, 9.3, 58], [26, 1.28, 9.55, 40, 1.8, 9.4, 58]] },
    { id: 'night-around', chapter: 'night', bars: 6, light: 'evening', roof: true, cut: 'dissolve', ease: [0.6, 0.6],
      en: 'Around the church at night', vi: 'Vòng quanh nhà thờ về đêm',
      note: { en: 'From the courtyard round toward the altar end: the lit towers, the glowing windows and the long red roof against the night sky.', vi: 'Từ sân trước vòng về phía cung thánh: hai tháp sáng đèn, những ô cửa ấm áp và mái ngói đỏ dài trên nền trời đêm.' },
      keys: [[-14, 14, 34, 14, 8, 0, 48], [10, 17, 44, 22, 6, 0, 48], [36, 18, 44, 26, 6, 0, 48], [60, 16, 30, 30, 6, 0, 48]] },
    { id: 'evening-nave', chapter: 'night', bars: 5, light: 'evening', roof: true, cut: 'dissolve', ease: [0.3, 0.1], walk: true,
      en: 'Inside after dark', vi: 'Bên trong khi đêm xuống',
      note: { en: 'Evening light: the sanctuary glows at the end of the nave. This is the proposed lighting as the viewer draws it; screen brightness is not a lux measurement.', vi: 'Ánh đèn buổi tối: cung thánh rực sáng cuối lòng nhà thờ. Đây là phương án chiếu sáng đề xuất theo cách hiển thị của mô hình; độ sáng màn hình không phải số đo lux.' },
      keys: [[5, 1.6, 0, 48.8, 3.8, 0, 56], [10.5, 1.6, 0, 48.8, 3.9, 0, 55], [16, 1.6, 0, 48.8, 4.1, 0, 54]] },
    { id: 'closing', chapter: 'night', bars: 10, light: 'evening', roof: true, cut: 'fade', ease: [0.1, 0], end: true,
      en: 'The lights of home', vi: 'Ánh đèn quê nhà',
      note: { en: 'The church from the courtyard as the organ plays the homeland theme once more.', vi: 'Nhà thờ nhìn từ sân trong khi đàn organ ngân lại giai điệu quê hương.' },
      card: { at: 24, small: 'Với tình yêu dành cho giáo xứ và quê hương\nWith love for our parish and our hometown', title: 'Nhà thờ Thạch Bi', line: 'Hẹn gặp lại ở quê nhà · Until we meet again at home',
        foot: ['Design-development model, not a construction-approved design · Mô hình phát triển thiết kế, chưa phải thiết kế được duyệt để thi công',
          'Music generated in the viewer: an original homeland theme and “Ave Maria” (Bach–Gounod) · Nhạc do mô hình tạo ra: giai điệu quê hương và “Ave Maria” (Bach–Gounod)'] },
      keys: [[-12.5, 1.4, 1.2, 2.4, 9, 0, 54], [-21, 2.8, 4.2, 2.4, 13, 0, 50], [-30, 5.2, 7, 2.4, 18, 0, 46], [-40, 7.8, 9.5, 2.6, 22, 0, 44]] }
  ];

  /* ------------------------------------------------------ technical tours
   * Four separate tours: lighting, fans and air, sound, electrical grid. Each
   * shows how its system works with the simulator itself: scenes switch
   * circuits on and off, dim them, change the mixer level or cut the feeder to
   * DB-2, and a live panel lists the circuits and the figures the simulator
   * calculates again after every switch. The switching is a rehearsal in memory
   * (CHURCH_SIMULATOR.rehearsal): nothing is saved, and every switch, the scene
   * and the feeder return as they were when the tour ends.
   * Camera routes are those of the film above, or stay in the same clear zones.
   * A scene may also set
   *   overlay  the simulator's analysis map to show: 'lux', 'air', 'spl', 'sti'
   *   systems  the simulator's wiring-only view, filtered to one system:
   *            'all', 'lighting', 'air', 'sound' or 'distribution'
   *   board    'DB1' or 'DB2': only the routes of that board in that view
   *   mark     { circuits, sources, en, vi }: rings on the placed fittings of
   *            those circuits and on those boards or control enclosures
   *   demo     { title, rows, stats, steps, foot, breaker }: the live panel.
   *            rows   circuits ('L1'), systems ('@light', '@fan', '@sound') or
   *                   { setting: 'mixerDb', en, vi, unit }
   *            stats  up to four figures, see STATS
   *            steps  at (seconds into the scene, 7 s or more apart so that each
   *                   can be read) with feeder (true/false), scene, set { circuit:
   *                   value: lights 0–1, fans 1–3, others 0 or 1 } or setting
   *                   { key: value }, applied in that order; then say (the
   *                   action), note (the explanation, 32 words or fewer) and
   *                   plain (the note when a figure is missing). Figures in
   *                   {braces} are those of the step; {d_x} is the change from the
   *                   step before, {p_x} the value before it.
   * Text in braces elsewhere is filled from the open model as the scene starts.
   * All of it is simulator estimates of a design proposal, and the cards say so.
   */
  const TOUR = { en: 'Technical tour', vi: 'Tham quan kỹ thuật' };
  const TOUR_STATUS = 'Design-development model, not a construction-approved design · Mô hình phát triển thiết kế, chưa phải thiết kế được duyệt để thi công';
  const TOUR_SCENE = { foot: ['Figures are simulator estimates for the scene that is open: “{scene}”', 'Số liệu là ước tính của mô phỏng cho chế độ đang mở: “{scene}”'],
    plain: ['Figures are simulator estimates', 'Số liệu là ước tính của mô phỏng'] };
  const TOUR_VIRTUAL = 'Switching is a rehearsal in memory: nothing is saved, and your layout returns when the tour ends · Việc bật tắt chỉ diễn ra trong bộ nhớ: không lưu gì, bố cục của bạn trở lại như cũ khi tour kết thúc';
  const TOUR_CLOSE = { title: 'Estimates, not measurements', line: 'Số liệu là ước tính của mô phỏng, chưa phải số đo thực tế' };
  // One language on screen at a time (i18n.js). The data keeps each pair; the screen shows the chosen half.
  const viewVi = () => window.THACH_I18N?.get() === 'vi';
  const VI_MARK = /[ăâđêôơưáàảãạắằẳẵặấầẩẫậéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ]/i;
  // A line written as "English · Vietnamese", or a one-language line: the chosen text, or '' when it is the other language.
  const forView = line => {
    if (!line) return '';
    const parts = String(line).split(' · ');
    if (parts.length === 2 && VI_MARK.test(parts[1]) && !VI_MARK.test(parts[0])) return viewVi() ? parts[1] : parts[0];
    return VI_MARK.test(line) === viewVi() ? line : '';
  };
  // The plan from almost straight above with side B at the top, held in the upper part
  // of the picture so that the caption does not cover it, then down toward the
  // wings and the sanctuary, still with side B at the top, as on a map. The look
  // point is east of the church so that the plan stays in the left two thirds,
  // clear of the live panel.
  const MAP_UP = [0, 0, -1];
  const PLAN_KEYS = [[42, 92, 10.6, 42, 0, 10, 41], [42, 86, 10.6, 42, 0, 10, 41.5], [42, 80, 10.6, 42, 0, 10, 42]];
  const WING_KEYS = [[42, 80, 10.6, 42, 0, 10, 42], [45, 62, 14, 45, 0, 10.5, 42], [47, 46, 18, 47, 0, 11, 42]];
  // Camera routes inside and outside the building, shared by several scenes.
  const NAVE_DOLLY = [[5.4, 1.9, 0, 48.8, 3.8, 0, 56], [11.5, 2.2, 0, 48.8, 3.9, 0, 55], [18, 2.6, 0, 48.8, 4.2, 0, 54]];
  const NAVE_LONG = [[5.4, 1.9, 0, 48.8, 3.8, 0, 56], [14, 2.3, 0, 48.8, 4, 0, 55], [22, 2.8, 0, 48.8, 4.2, 0, 54]];
  const ROOF_FRAMES = [[12.6, 6.8, 1.5, 27, 9.4, -1, 60], [18.6, 7.1, 1.9, 33, 9.5, -1.4, 60], [25.6, 7, 2, 40, 9.2, -1.6, 60]];
  const FACADE = [[-12.5, 1.4, 1.2, 2.4, 9, 0, 54], [-22, 3.4, 5, 2.4, 11, 0, 50], [-36, 8, 12, 4, 13, 0, 46]];
  const CEILING_FANS = [[9.5, 1.7, 0, 48, 3.5, 0, 56], [19, 2.3, 0, 48.5, 3.8, 0, 54], [28.5, 3.3, 0, 48.8, 4.2, 0, 52]];
  const WALL_FANS = [[12, 2.2, 0.8, 22, 4.6, -7.1, 58], [20, 2.4, 0.8, 30, 4.6, -7.1, 58], [27, 2.6, 0.8, 37, 4.6, -7.1, 58]];
  const GABLES = [[40.6, 2.6, 0, 22, 3.8, 0, 56], [39.6, 4.8, 0, 12, 5.2, 0, 58], [38.7, 6.9, 0, 3, 6.4, 0, 60]];
  const MICROPHONES = [[39.7, 3, -3, 45.6, 2.7, 0.4, 50], [38.7, 3.1, 0, 45.8, 2.6, 0, 50], [39.7, 3, 3, 45.6, 2.7, -0.4, 50]];
  const AERIAL = [[26.5, 38, 42, 26.5, 2.5, 0, 45], [52, 34, 35, 27, 3, 0, 45], [68, 30, 14, 28, 3.5, 0, 45]];
  // A step of a demonstration: when, what is switched, what is said, and the explanation.
  const S = (at, change, say, note, plain) => ({ at, ...change, say, note: note && { en: note[0], vi: note[1] }, plain: plain && { en: plain[0], vi: plain[1] } });
  const FULL = 'Full service · evening';
  // Exhaust fans by zone: front gable, wing gables, service room.
  const EXHAUST = ['V1', 'V2', 'V3'], exhaust = value => Object.fromEntries(EXHAUST.map(circuit => [circuit, value]));
  const DB_FOOT = ['Breaker: the smallest standard size that carries the full rated load at 80 % or less. A planning allowance, not a protection design.', 'Cầu dao: cỡ chuẩn nhỏ nhất chịu được toàn tải định mức ở mức không quá 80 %. Chỉ là con số tạm tính, chưa phải thiết kế bảo vệ.'];

  const LIGHTING_SHOTS = [
    { id: 'light-intro', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'fade', ease: [0.15, 0.4],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Lighting · Chiếu sáng',
        line: 'Switch the circuits and watch the simulator recalculate the light on every seat', second: 'Bật tắt từng mạch điện và xem mô phỏng tính lại ánh sáng tại từng chỗ ngồi', foot: [TOUR_VIRTUAL, ...TOUR_SCENE.foot],
        plain: { foot: [TOUR_VIRTUAL, ...TOUR_SCENE.plain] } },
      keys: NAVE_DOLLY },
    { id: 'light-chain', chapter: 'tour', bars: 5, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.4],
      en: 'How the lights are organised', vi: 'Đèn được tổ chức thế nào',
      note: { en: 'Every fitting is wired to one circuit, and a circuit is the smallest part that can be switched or dimmed. {lightCircuits} lighting circuits serve {lights} fittings from two boards, DB-1 inside and DB-2 at the front. The panel lists the main interior circuits and what each draws now.',
        vi: 'Mỗi bộ đèn được nối vào một mạch điện, và mạch là phần nhỏ nhất có thể bật tắt hoặc chỉnh độ sáng. {lightCircuits} mạch chiếu sáng cấp điện cho {lights} bộ đèn từ hai tủ điện: DB-1 bên trong và DB-2 ở phía trước. Bảng bên phải liệt kê các mạch chính bên trong và công suất mỗi mạch đang dùng.' },
      plain: { en: 'Every fitting is wired to one circuit, and a circuit is the smallest part that can be switched or dimmed. The panel lists the main interior circuits and what each draws now.',
        vi: 'Mỗi bộ đèn được nối vào một mạch điện, và mạch là phần nhỏ nhất có thể bật tắt hoặc chỉnh độ sáng. Bảng bên phải liệt kê các mạch chính bên trong và công suất mỗi mạch đang dùng.' },
      mark: { circuits: ['L1', 'L2'], en: 'Reading projectors · L1, L2', vi: 'Đèn chiếu đọc sách · L1, L2' },
      demo: { title: ['Lighting circuits', 'Các mạch chiếu sáng'], rows: ['L1', 'L2', 'L8', 'L3', 'LA', 'LD'], stats: ['luxAvg', 'kw'], steps: [S(0, { scene: FULL })] },
      keys: ROOF_FRAMES },
    { id: 'light-build', chapter: 'tour', bars: 10, light: 'evening', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'lux',
      en: 'Switch the circuits on, one at a time', vi: 'Bật từng mạch, từng bước một',
      demo: { title: ['Lighting circuits', 'Các mạch chiếu sáng'], rows: ['L1', 'L2', 'L8', 'LA', 'LD', 'L3'], stats: ['luxAvg', 'luxOk', 'kw'], steps: [
        S(0, { scene: 'All off' }, ['Everything off', 'Tắt tất cả'],
          ['The roof is hidden. The map shows the light on an open book, 0.8 m above the floor, at all {seats} seats. With no lamp lit: {luxAvg} lux.',
            'Mái được ẩn. Bản đồ cho thấy ánh sáng trên trang sách mở, cao 0,8 m so với nền, tại cả {seats} chỗ ngồi. Khi chưa bật đèn nào: {luxAvg} lux.'],
          ['The roof is hidden. The map shows the light on an open book, 0.8 m above the floor, at every seat.', 'Mái được ẩn. Bản đồ cho thấy ánh sáng trên trang sách mở, cao 0,8 m so với nền, tại mọi chỗ ngồi.']),
        S(8, { set: { L1: 1 } }, ['Switch on L1 · central pews', 'Bật mạch L1 · các dãy ghế giữa'],
          ['L1 is {L1} projectors high over the central pews. The seats average {luxAvg} lux and {luxOk} % reach the aim. The outer pews and the wings stay dark.',
            'Mạch L1 gồm {L1} đèn chiếu gắn cao phía trên các dãy ghế giữa. Chỗ ngồi trung bình {luxAvg} lux và {luxOk} % đạt mục tiêu. Các dãy ghế ngoài và hai cánh vẫn tối.'],
          ['L1 is projectors high over the central pews. The outer pews and the wings stay dark.', 'Mạch L1 gồm các đèn chiếu gắn cao phía trên các dãy ghế giữa. Các dãy ghế ngoài và hai cánh vẫn tối.']),
        S(16, { set: { L2: 1 } }, ['Switch on L2 · outer pews', 'Bật mạch L2 · các dãy ghế ngoài'],
          ['L2 adds {L2} projectors over the outer pews: {d_luxAvg} lux more on average, and {luxOk} % of seats at the aim. Each circuit lights the block it is aimed at.',
            'Mạch L2 thêm {L2} đèn chiếu phía trên các dãy ghế ngoài: trung bình tăng {d_luxAvg} lux, và {luxOk} % chỗ ngồi đạt mục tiêu. Mỗi mạch chiếu sáng khối ghế mà nó hướng tới.'],
          ['L2 adds projectors over the outer pews. Each circuit lights the block it is aimed at.', 'Mạch L2 thêm các đèn chiếu phía trên các dãy ghế ngoài. Mỗi mạch chiếu sáng khối ghế mà nó hướng tới.']),
        S(24, { set: { L8: 1 } }, ['Switch on L8 · wings', 'Bật mạch L8 · hai cánh'],
          ['L8 is only {L8} fittings, but they serve the wings, the darkest seats: the lowest seat in the church rises from {p_luxMin} to {luxMin} lux.',
            'Mạch L8 chỉ có {L8} bộ đèn, nhưng phục vụ hai cánh, nơi tối nhất: chỗ thấp nhất trong nhà thờ tăng từ {p_luxMin} lên {luxMin} lux.'],
          ['L8 is only a few fittings, but they serve the wings, the darkest seats.', 'Mạch L8 chỉ có vài bộ đèn, nhưng phục vụ hai cánh, nơi tối nhất.']),
        S(32, { set: { LA: 1, LD: 1, L3: 1 } }, ['Switch on LA, LD and L3 · roof, sconces, sanctuary', 'Bật LA, LD và L3 · trần, đèn tường, cung thánh'],
          ['LA and LD (roof uplights, wall sconces) and L3 (sanctuary, chandelier) add only {d_luxAvg} lux on the pews but {d_kw} kW more: atmosphere and focus. The projectors give the reading light.',
            'LA và LD (đèn hắt trần, đèn tường) và L3 (cung thánh và đèn chùm) chỉ thêm {d_luxAvg} lux trên các dãy ghế nhưng tốn thêm {d_kw} kW: tạo không khí và điểm nhấn. Ánh sáng đọc sách đến từ các đèn chiếu.'],
          ['LA, LD and L3 give atmosphere and focus; the projectors give the reading light.', 'LA, LD và L3 tạo không khí và điểm nhấn; ánh sáng đọc sách đến từ các đèn chiếu.'])] },
      keys: PLAN_KEYS },
    { id: 'light-dim', chapter: 'tour', bars: 7, light: 'evening', roof: true, cut: 'fade', ease: [0.2, 0.3],
      en: 'Dimming: less light, less power', vi: 'Giảm sáng: ít ánh sáng hơn, ít điện hơn',
      demo: { title: ['Seating circuits', 'Các mạch chiếu sáng ghế'], rows: ['L1', 'L2', 'L8'], stats: ['luxAvg', 'luxOk', 'kw'], steps: [
        S(0, { scene: FULL }, ['Full output', 'Công suất đầy đủ'],
          ['All circuits at full output: {luxAvg} lux and {kw} kW. Now L1, L2 and L8, the seating circuits, are dimmed together.',
            'Mọi mạch ở công suất đầy đủ: {luxAvg} lux và {kw} kW. Giờ L1, L2 và L8, các mạch chiếu sáng ghế, được giảm sáng cùng lúc.'],
          ['All circuits at full output. Now L1, L2 and L8, the seating circuits, are dimmed together.', 'Mọi mạch ở công suất đầy đủ. Giờ L1, L2 và L8, các mạch chiếu sáng ghế, được giảm sáng cùng lúc.']),
        S(7, { set: { L1: 0.5, L2: 0.5, L8: 0.5 } }, ['Dim to 50 %', 'Giảm xuống 50 %'],
          ['At half output the light falls to {luxAvg} lux but the power only by {d_kw} kW: in the model a dimmed LED still draws 6 % plus a share of its output.',
            'Ở nửa công suất, ánh sáng giảm còn {luxAvg} lux nhưng công suất chỉ giảm {d_kw} kW: trong mô hình, đèn LED đã giảm sáng vẫn tiêu thụ 6 % cộng một phần theo độ sáng.'],
          ['At half output the light falls, but the power falls by less: in the model a dimmed LED still draws 6 % plus a share of its output.', 'Ở nửa công suất, ánh sáng giảm nhưng công suất giảm ít hơn: trong mô hình, đèn LED đã giảm sáng vẫn tiêu thụ 6 % cộng một phần theo độ sáng.']),
        S(14, { set: { L1: 0.25, L2: 0.25, L8: 0.25 } }, ['Dim to 25 %', 'Giảm xuống 25 %'],
          ['At a quarter: {luxAvg} lux and {luxOk} % at the aim. That suits prayer, not reading; the scenes trade light against power in the same way.',
            'Ở một phần tư: {luxAvg} lux và {luxOk} % đạt mục tiêu. Mức này hợp để cầu nguyện, không hợp để đọc sách; các chế độ nhanh cũng đánh đổi ánh sáng với điện năng như vậy.'],
          ['At a quarter the light suits prayer, not reading; the scenes trade light against power in the same way.', 'Ở một phần tư, ánh sáng hợp để cầu nguyện, không hợp để đọc sách; các chế độ nhanh cũng đánh đổi ánh sáng với điện năng như vậy.']),
        S(21, { set: { L1: 1, L2: 1, L8: 1 } }, ['Back to full output', 'Trở lại công suất đầy đủ'],
          ['Back to full output: {luxAvg} lux, {kw} kW. Dimmers and drivers that reach these levels without flicker are for the lighting designer.',
            'Trở lại công suất đầy đủ: {luxAvg} lux, {kw} kW. Bộ điều sáng và nguồn đèn đạt các mức này mà không nhấp nháy là việc của kỹ sư chiếu sáng.'],
          ['Dimmers and drivers that reach these levels without flicker are for the lighting designer.', 'Bộ điều sáng và nguồn đèn đạt các mức này mà không nhấp nháy là việc của kỹ sư chiếu sáng.'])] },
      keys: NAVE_DOLLY },
    { id: 'light-scenes', chapter: 'tour', bars: 7, light: 'evening', roof: true, cut: 'dip', ease: [0.2, 0.3],
      en: 'Quick scenes set every circuit together', vi: 'Các chế độ nhanh đặt mọi mạch cùng lúc',
      demo: { title: ['Scene · circuits', 'Chế độ · các mạch'], rows: ['L1', 'L2', 'L3', 'LD', 'L4', 'L5'], stats: ['luxAvg', 'kw', 'kwh'], steps: [
        S(0, { scene: FULL }, null,
          ['A scene sets every circuit at once. Full service: {luxAvg} lux at the books, {luxOk} % of seats at the aim of {luxAim} lux, and {kw} kW.',
            'Mỗi chế độ đặt mọi mạch cùng lúc. Thánh lễ đầy đủ: {luxAvg} lux trên sách, {luxOk} % chỗ ngồi đạt mục tiêu {luxAim} lux, và {kw} kW.'],
          ['A scene sets every circuit at once, lights, fans and sound together.', 'Mỗi chế độ đặt mọi mạch cùng lúc, cả đèn, quạt và âm thanh.']),
        S(7, { scene: 'Weekday Mass' }, null,
          ['Weekday Mass dims the nave and leaves the festival lights off: aim {luxAim} lux, found {luxAvg}. {kw} kW, or {kwh} kWh for a service of {hours} hours.',
            'Thánh lễ ngày thường giảm sáng lòng nhà thờ và tắt đèn lễ hội: mục tiêu {luxAim} lux, tính được {luxAvg}. {kw} kW, tức {kwh} kWh cho một buổi lễ {hours} giờ.'],
          ['Weekday Mass dims the nave and leaves the festival lights off.', 'Thánh lễ ngày thường giảm sáng lòng nhà thờ và tắt đèn lễ hội.']),
        S(14, { scene: 'Prayer & adoration' }, null,
          ['Prayer and adoration keeps the sanctuary lit and the nave low: aim {luxAim} lux, found {luxAvg}, for {kw} kW.',
            'Cầu nguyện và chầu Thánh Thể giữ cung thánh sáng và lòng nhà thờ dịu: mục tiêu {luxAim} lux, tính được {luxAvg}, với {kw} kW.'],
          ['Prayer and adoration keeps the sanctuary lit and the nave low.', 'Cầu nguyện và chầu Thánh Thể giữ cung thánh sáng và lòng nhà thờ dịu.']),
        S(21, { scene: 'Night security' }, null,
          ['Night security: only the path and step lights, the exit signs and the entrance light. {luxAvg} lux inside, {kw} kW.',
            'An ninh ban đêm: chỉ còn đèn lối đi và bậc thềm, đèn thoát hiểm và đèn lối vào. Bên trong {luxAvg} lux, {kw} kW.'],
          ['Night security leaves only the path and step lights, the exit signs and the entrance light.', 'An ninh ban đêm chỉ để đèn lối đi và bậc thềm, đèn thoát hiểm và đèn lối vào.'])] },
      keys: NAVE_LONG },
    { id: 'light-feeder', chapter: 'tour', bars: 8, light: 'evening', roof: true, cut: 'fade', ease: [0.1, 0], end: true,
      en: 'Two boards, one feeder', vi: 'Hai tủ điện, một tuyến nguồn',
      mark: { circuits: ['L6', 'L9', 'L10'], en: 'Towers, entrance and statues · L6, L9, L10', vi: 'Tháp, lối vào và các tượng · L6, L9, L10' },
      demo: { title: ['Towers and façade · DB-2', 'Tháp và mặt tiền · DB-2'], rows: ['L6', 'L9', 'L10', 'L1'], stats: ['kwDb2', 'kw', 'luxAvg'], steps: [
        S(0, { scene: FULL }, null,
          ['DB-2, in the base of a tower, feeds the tower floodlights (L6), the entrance (L9) and the hidden light at the three statues (L10): {kwDb2} kW. DB-1 feeds the nave.',
            'DB-2, trong chân tháp, cấp điện cho đèn pha tháp (L6), lối vào (L9) và đèn giấu quanh ba tượng (L10): {kwDb2} kW. DB-1 cấp điện cho lòng nhà thờ.'],
          ['DB-2, in the base of a tower, feeds the tower floodlights (L6), the entrance (L9) and the hidden light at the three statues (L10). DB-1 feeds the nave.', 'DB-2, trong chân tháp, cấp điện cho đèn pha tháp (L6), lối vào (L9) và đèn giấu quanh ba tượng (L10). DB-1 cấp điện cho lòng nhà thờ.']),
        S(7, { feeder: false }, ['Switch the DB-1 → DB-2 feeder off', 'Ngắt tuyến nguồn DB-1 → DB-2'],
          ['One feeder cable from DB-1 carries all of DB-2’s power. Off, the towers, entrance and statues go dark ({kwDb2} kW), while the nave stays lit: {luxAvg} lux.',
            'Một tuyến cáp nguồn từ DB-1 mang toàn bộ điện của DB-2. Khi ngắt, tháp, lối vào và các tượng tối đi ({kwDb2} kW), trong khi lòng nhà thờ vẫn sáng: {luxAvg} lux.'],
          ['One feeder cable from DB-1 carries all of DB-2’s power. Off, the towers, entrance and statues go dark, while the nave stays lit.', 'Một tuyến cáp nguồn từ DB-1 mang toàn bộ điện của DB-2. Khi ngắt, tháp, lối vào và các tượng tối đi, trong khi lòng nhà thờ vẫn sáng.']),
        S(14, { feeder: true, scene: FULL }, ['Switch the feeder back on', 'Đóng lại tuyến nguồn'],
          ['Feeder back on: the DB-2 circuits restart from the scene, {kwDb2} kW.',
            'Đóng lại tuyến nguồn: các mạch DB-2 khởi động lại theo chế độ, {kwDb2} kW.'],
          ['Feeder back on: the DB-2 circuits restart from the scene.', 'Đóng lại tuyến nguồn: các mạch DB-2 khởi động lại theo chế độ.'])] },
      card: { at: 22, hold: true, small: 'Lighting · Chiếu sáng', ...TOUR_CLOSE,
        foot: [TOUR_STATUS, 'Still open: selected lamps and their photometric files, glare, daylight, emergency lighting, circuits and controls', 'Còn để ngỏ: chọn đèn và tệp trắc quang, độ chói, ánh sáng ban ngày, chiếu sáng sự cố, mạch điện và điều khiển'] },
      keys: FACADE }
  ];

  const AIR_SHOTS = [
    { id: 'air-intro', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.6],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Fans and air · Quạt và thông gió',
        line: 'No air conditioning: switch the fans and watch the simulator recalculate the air at every seat', second: 'Không dùng điều hòa: bật quạt và xem mô phỏng tính lại gió tại từng chỗ ngồi', foot: [TOUR_VIRTUAL, ...TOUR_SCENE.foot],
        plain: { foot: [TOUR_VIRTUAL, ...TOUR_SCENE.plain] } },
      keys: [[-11, 1.4, -19.4, 8, 4.2, -10, 50], [9, 2.1, -18.6, 26, 4.2, -10.5, 50], [22, 2.7, -18.6, 38, 4.6, -11.5, 50]] },
    { id: 'air-chain', chapter: 'tour', bars: 5, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.3],
      en: 'Fans in groups, each on its own circuit', vi: 'Quạt theo nhóm, mỗi nhóm một mạch điện',
      note: { en: '{F1} ceiling fans, {F1size} m across, hang at least {F1side} m to either side of the centre line, so the view to the altar stays clear. Ceiling (F1), wing wall (F5) and nave wall fans (F2) each have a circuit, and the exhaust fans one per zone (V1–V3), so each group has its own speed: Low, Normal or High.',
        vi: '{F1} quạt trần đường kính {F1size} m treo cách trục giữa ít nhất {F1side} m về mỗi bên, nên tầm nhìn lên bàn thờ vẫn thông thoáng. Quạt trần (F1), quạt tường hai cánh (F5) và quạt tường lòng nhà thờ (F2) mỗi nhóm có một mạch điện, quạt hút mỗi khu một mạch (V1–V3), nên mỗi nhóm có tốc độ riêng: Thấp, Vừa hoặc Cao.' },
      plain: { en: 'Ceiling (F1), wing wall (F5) and nave wall fans (F2) each have a circuit, and the exhaust fans one per zone (V1–V3), so each group has its own speed: Low, Normal or High.',
        vi: 'Quạt trần (F1), quạt tường hai cánh (F5) và quạt tường lòng nhà thờ (F2) mỗi nhóm có một mạch điện, quạt hút mỗi khu một mạch (V1–V3), nên mỗi nhóm có tốc độ riêng: Thấp, Vừa hoặc Cao.' },
      mark: { circuits: ['F1'], en: 'Ceiling fans · F1', vi: 'Quạt trần · F1' },
      demo: { title: ['Fan circuits', 'Các mạch quạt'], rows: ['F1', 'F5', 'F2', ...EXHAUST], stats: ['airAvg', 'kwFan'], steps: [S(0, { scene: FULL })] },
      keys: CEILING_FANS },
    { id: 'air-speeds', chapter: 'tour', bars: 7, light: 'day', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'air',
      en: 'Ceiling fans: speed against comfort', vi: 'Quạt trần: tốc độ và sự dễ chịu',
      demo: { title: ['Ceiling fans · F1', 'Quạt trần · F1'], rows: ['F1'], stats: ['airAvg', 'airOk', 'noise', 'kwFan'], steps: [
        S(0, { scene: 'All off' }, ['All fans off', 'Tắt hết quạt'],
          ['The map shows air speed at seated height, 0.6 m above the floor, at all {seats} seats; air through open doors is not counted. Fans off: {airAvg} m/s.',
            'Bản đồ cho thấy tốc độ gió ở tầm người ngồi, cao 0,6 m so với nền, tại cả {seats} chỗ ngồi; gió qua cửa mở không được tính. Khi tắt quạt: {airAvg} m/s.'],
          ['The map shows air speed at seated height, 0.6 m above the floor, at every seat; air through open doors is not counted.', 'Bản đồ cho thấy tốc độ gió ở tầm người ngồi, cao 0,6 m so với nền, tại mọi chỗ ngồi; gió qua cửa mở không được tính.']),
        S(7, { set: { F1: 1 } }, ['Ceiling fans on Low', 'Quạt trần ở tốc độ Thấp'],
          ['Ceiling fans on Low: {airAvg} m/s on average; only {airOk} % of seats are in the comfort band of 0.3 to 0.8 m/s. About {cool} °C of cooling.',
            'Quạt trần ở tốc độ Thấp: trung bình {airAvg} m/s; chỉ {airOk} % chỗ ngồi nằm trong khoảng dễ chịu 0,3 đến 0,8 m/s. Làm mát khoảng {cool} °C.'],
          ['On Low only a few seats are in the comfort band of 0.3 to 0.8 m/s.', 'Ở tốc độ Thấp chỉ một số ít chỗ ngồi nằm trong khoảng dễ chịu 0,3 đến 0,8 m/s.']),
        S(14, { set: { F1: 2 } }, ['Ceiling fans on Normal', 'Quạt trần ở tốc độ Vừa'],
          ['Normal: {airAvg} m/s, {airOk} % in the band and about {cool} °C of cooling, for {kwFan} kW and {noise} dBA at the seats.',
            'Tốc độ Vừa: {airAvg} m/s, {airOk} % trong khoảng dễ chịu và làm mát khoảng {cool} °C, với {kwFan} kW và {noise} dBA tại chỗ ngồi.'],
          ['On Normal most seats are in the comfort band of 0.3 to 0.8 m/s.', 'Ở tốc độ Vừa phần lớn chỗ ngồi nằm trong khoảng dễ chịu 0,3 đến 0,8 m/s.']),
        S(21, { set: { F1: 3 } }, ['Ceiling fans on High', 'Quạt trần ở tốc độ Cao'],
          ['High: {airAvg} m/s and {airOk} %, a little better, but noise rises to {noise} dBA and power to {kwFan} kW. Faster is not always better.',
            'Tốc độ Cao: {airAvg} m/s và {airOk} %, tốt hơn chút ít, nhưng tiếng ồn lên {noise} dBA và công suất lên {kwFan} kW. Nhanh hơn chưa chắc đã tốt hơn.'],
          ['On High the comfort improves only a little, but the noise and the power rise. Faster is not always better.', 'Ở tốc độ Cao sự dễ chịu chỉ tăng chút ít, nhưng tiếng ồn và công suất tăng lên. Nhanh hơn chưa chắc đã tốt hơn.'])] },
      keys: PLAN_KEYS },
    { id: 'air-wings', chapter: 'tour', bars: 6, light: 'day', roof: false, cut: 'cut', ease: [0, 0.2], up: MAP_UP, overlay: 'air',
      en: 'The wings and the wall fans', vi: 'Hai cánh và các quạt tường',
      mark: { circuits: ['F5'], en: 'Wing wall fans · F5', vi: 'Quạt tường hai cánh · F5' },
      demo: { title: ['Wall fans', 'Quạt tường'], rows: ['F1', 'F5', 'F2'], stats: ['wingAir', 'airAvg', 'noise', 'kwFan'], steps: [
        S(0, { scene: 'All off', set: { F1: 2 } }, ['Ceiling fans only', 'Chỉ có quạt trần'],
          ['With only the ceiling fans on Normal, the wing seats average {wingAir} m/s against {naveAir} m/s in the nave: almost still.',
            'Chỉ với quạt trần ở tốc độ Vừa, chỗ ngồi ở hai cánh trung bình {wingAir} m/s so với {naveAir} m/s ở lòng nhà thờ: gần như lặng gió.'],
          ['With only the ceiling fans, the wings are almost still.', 'Chỉ với quạt trần, hai cánh gần như lặng gió.']),
        S(7, { set: { F5: 2 } }, ['Add the wing wall fans · F5', 'Thêm quạt tường hai cánh · F5'],
          ['{F5} wall fans on circuit F5 serve the wings: {wingAir} m/s there now, but {d_noise} dBA more noise. Their positions are still under review.',
            '{F5} quạt tường thuộc mạch F5 phục vụ hai cánh: giờ ở đó {wingAir} m/s, nhưng ồn thêm {d_noise} dBA. Vị trí của chúng còn đang được xem xét.'],
          ['Wall fans on circuit F5 serve the wings. Their positions are still under review.', 'Quạt tường thuộc mạch F5 phục vụ hai cánh. Vị trí của chúng còn đang được xem xét.']),
        S(14, { set: { F2: 2 } }, ['Add the nave wall fans · F2', 'Thêm quạt tường lòng nhà thờ · F2'],
          ['The {F2} nave wall fans (F2) add air, but the noise reaches {noise} dBA and the power {kwFan} kW. They stay off in every built-in scene while this is reviewed.',
            '{F2} quạt tường lòng nhà thờ (F2) thêm gió, nhưng tiếng ồn lên tới {noise} dBA và công suất {kwFan} kW. Chúng được để tắt trong mọi chế độ có sẵn trong khi việc này được xem xét.'],
          ['The nave wall fans (F2) add air but also noise. They stay off in every built-in scene while this is reviewed.', 'Quạt tường lòng nhà thờ (F2) thêm gió nhưng cũng thêm tiếng ồn. Chúng được để tắt trong mọi chế độ có sẵn trong khi việc này được xem xét.'])] },
      keys: WING_KEYS },
    { id: 'air-exhaust', chapter: 'tour', bars: 6, light: 'day', roof: true, cut: 'dip', ease: [0.25, 0.1],
      en: 'Exhaust fans: air changes', vi: 'Quạt hút: số lần trao đổi không khí',
      mark: { circuits: EXHAUST, en: 'Exhaust fans · V1–V3', vi: 'Quạt hút · V1–V3' },
      demo: { title: ['Exhaust fans · V1–V3', 'Quạt hút · V1–V3'], rows: EXHAUST, stats: ['ach', 'flow', 'kwFan'], steps: [
        S(0, { scene: FULL, set: exhaust(0) }, ['Exhaust fans off', 'Tắt quạt hút'],
          ['The {exhaustFans} exhaust fans draw hot air out, on three circuits: front gable, wing gables, service room. Off: no mechanical air change; open doors and windows give some, not counted.',
            '{exhaustFans} quạt hút đưa khí nóng ra ngoài, trên ba mạch: hồi mặt tiền, hồi hai cánh, phòng kỹ thuật. Khi tắt: không có trao đổi không khí cơ học; cửa mở vẫn cho một ít, không được tính.'],
          ['The exhaust fans draw hot air out, on three circuits: front gable, wing gables, service room. Open doors and windows give some air, not counted.', 'Quạt hút đưa khí nóng ra ngoài, trên ba mạch: hồi mặt tiền, hồi hai cánh, phòng kỹ thuật. Cửa mở vẫn cho một ít gió, không được tính.']),
        S(7, { set: exhaust(1) }, ['Exhaust on Low', 'Quạt hút ở tốc độ Thấp'],
          ['On Low: about {flow} m³/h, {ach} air changes an hour of the modelled volume.',
            'Ở tốc độ Thấp: khoảng {flow} m³/h, tức {ach} lần trao đổi không khí mỗi giờ theo thể tích mô hình.'],
          ['On Low the fans move part of the air of the building every hour.', 'Ở tốc độ Thấp, các quạt đẩy một phần không khí của công trình mỗi giờ.']),
        S(14, { set: exhaust(2) }, ['Exhaust on Normal', 'Quạt hút ở tốc độ Vừa'],
          ['On Normal: {ach} air changes an hour, within the project aim of 4 to 6 with people inside, for {d_kwFan} kW more.',
            'Ở tốc độ Vừa: {ach} lần trao đổi không khí mỗi giờ, nằm trong mục tiêu 4 đến 6 của dự án khi có người, tốn thêm {d_kwFan} kW.'],
          ['On Normal the air changes an hour approach the project aim of 4 to 6 with people inside.', 'Ở tốc độ Vừa số lần trao đổi không khí mỗi giờ tiến gần mục tiêu 4 đến 6 của dự án khi có người.'])] },
      keys: GABLES },
    { id: 'air-scenes', chapter: 'tour', bars: 7, light: 'day', roof: true, cut: 'dip', ease: [0.5, 0.5],
      en: 'Scenes set every fan together', vi: 'Các chế độ đặt mọi quạt cùng lúc',
      demo: { title: ['Scene · fan circuits', 'Chế độ · các mạch quạt'], rows: ['F1', 'F5', ...EXHAUST], stats: ['airAvg', 'noise', 'kwFan', 'ach'], steps: [
        S(0, { scene: FULL }, null,
          ['Full service: {airAvg} m/s on average at the seats, {airOk} % in the comfort band, {noise} dBA of noise and {kwFan} kW for the fans.',
            'Thánh lễ đầy đủ: trung bình {airAvg} m/s tại chỗ ngồi, {airOk} % trong khoảng dễ chịu, tiếng ồn {noise} dBA và quạt dùng {kwFan} kW.'],
          ['Full service sets ceiling fans on Normal, wing fans on Low and exhaust on Low.', 'Thánh lễ đầy đủ đặt quạt trần ở tốc độ Vừa, quạt hai cánh ở tốc độ Thấp và quạt hút ở tốc độ Thấp.']),
        S(7, { scene: 'Christmas & festivals' }, null,
          ['Christmas and festivals runs the exhaust faster for the crowd: {ach} air changes an hour, {noise} dBA of noise, {kwFan} kW.',
            'Giáng sinh và lễ hội cho quạt hút chạy nhanh hơn vì đông người: {ach} lần trao đổi không khí mỗi giờ, tiếng ồn {noise} dBA, quạt dùng {kwFan} kW.'],
          ['Christmas and festivals runs the exhaust faster for the crowd.', 'Giáng sinh và lễ hội cho quạt hút chạy nhanh hơn vì đông người.']),
        S(14, { scene: 'Cleaning' }, null,
          ['Cleaning runs the ceiling fans on Low and the exhaust on Normal: {airAvg} m/s at the seats, with no one sitting there, and {kwFan} kW.',
            'Chế độ dọn dẹp cho quạt trần chạy tốc độ Thấp và quạt hút chạy tốc độ Vừa: {airAvg} m/s tại chỗ ngồi, khi không có ai ngồi, và quạt dùng {kwFan} kW.'],
          ['Cleaning runs the ceiling fans on Low and the exhaust on Normal.', 'Chế độ dọn dẹp cho quạt trần chạy tốc độ Thấp và quạt hút chạy tốc độ Vừa.']),
        S(21, { scene: 'Prayer & adoration' }, null,
          ['Prayer and adoration keeps the fans low and quiet: {noise} dBA at the seats, {airAvg} m/s, {kwFan} kW.',
            'Cầu nguyện và chầu Thánh Thể giữ quạt ở tốc độ thấp và êm: {noise} dBA tại chỗ ngồi, {airAvg} m/s, quạt dùng {kwFan} kW.'],
          ['Prayer and adoration keeps the fans low and quiet.', 'Cầu nguyện và chầu Thánh Thể giữ quạt ở tốc độ thấp và êm.'])] },
      keys: WALL_FANS },
    { id: 'air-outside', chapter: 'tour', bars: 6, light: 'day', roof: true, cut: 'fade', ease: [0.5, 0.1], end: true,
      en: 'Cooling against quiet', vi: 'Làm mát và giữ yên tĩnh',
      note: { en: 'More fan speed cools more and makes speech harder to follow, so fans and sound are set together in each scene. In hot weather the fans are the only cooling; the model cannot say yet how the seats feel in the hottest season.',
        vi: 'Quạt chạy nhanh hơn thì mát hơn nhưng khó nghe lời hơn, nên quạt và âm thanh được đặt cùng nhau trong từng chế độ. Khi trời nóng, quạt là cách làm mát duy nhất; mô hình chưa thể nói người ngồi sẽ cảm thấy thế nào vào mùa nóng nhất.' },
      card: { at: 15, hold: true, small: 'Fans and air · Quạt và thông gió', ...TOUR_CLOSE,
        foot: [TOUR_STATUS, 'Still open: selected fans and their data, brackets and fixings, noise during speech, comfort in the hottest season', 'Còn để ngỏ: chọn quạt và thông số, giá đỡ và liên kết, tiếng ồn lúc giảng, tiện nghi vào mùa nóng nhất'] },
      keys: [[38, 22, 32, 27, 8, 0, 46], [10, 28, 28, 13, 10, 0, 45], [-20, 21, 14, 3, 12, 0, 44]] }
  ];

  const SOUND_SHOTS = [
    { id: 'sound-intro', chapter: 'tour', bars: 3, light: 'day', roof: true, cut: 'fade', ease: [0.3, 0.6],
      card: { small: `${TOUR.en} · ${TOUR.vi}`, title: 'Sound · Âm thanh',
        line: 'Switch the loudspeakers, the mixer and the fans and watch speech at every seat', second: 'Bật tắt loa, mixer và quạt và xem lời nói đến từng chỗ ngồi', foot: [TOUR_VIRTUAL, ...TOUR_SCENE.foot],
        plain: { foot: [TOUR_VIRTUAL, ...TOUR_SCENE.plain] } },
      keys: [[-8, 1.2, 0, 14, 3, 0, 52], [-1, 1.25, 0, 26, 3, 0, 54], [4.5, 1.6, 0, 40, 3.2, 0, 56]] },
    { id: 'sound-chain', chapter: 'tour', bars: 5, light: 'day', roof: true, cut: 'dip', ease: [0.4, 0.4],
      en: 'From the voice to every seat', vi: 'Từ tiếng nói đến từng chỗ ngồi',
      note: { en: '{mics} gooseneck microphones on the sanctuary pick up the voice; the mixer and amplifier rack AV-1 feeds the loudspeaker zones A1 to A5. Each zone is its own circuit with its own level and mute. The panel lists them and what each draws now.',
        vi: '{mics} micro cổ ngỗng trên cung thánh thu tiếng nói; tủ mixer và ampli AV-1 cấp tín hiệu cho các vùng loa từ A1 đến A5. Mỗi vùng là một mạch riêng, có mức âm và nút tắt tiếng riêng. Bảng bên phải liệt kê các vùng và công suất mỗi vùng đang dùng.' },
      plain: { en: 'Gooseneck microphones on the sanctuary pick up the voice; the mixer and amplifier rack AV-1 feeds the loudspeaker zones A1 to A5. Each zone is its own circuit with its own level and mute.',
        vi: 'Các micro cổ ngỗng trên cung thánh thu tiếng nói; tủ mixer và ampli AV-1 cấp tín hiệu cho các vùng loa từ A1 đến A5. Mỗi vùng là một mạch riêng, có mức âm và nút tắt tiếng riêng.' },
      mark: { circuits: ['MIC'], en: 'Microphones', vi: 'Micro' },
      demo: { title: ['Sound circuits', 'Các mạch âm thanh'], rows: ['MIC', 'A1', 'A4', 'A2', 'A3', 'A5'], stats: ['splAvg', 'stiAvg', 'fbLow'], steps: [S(0, { scene: FULL })] },
      keys: MICROPHONES },
    { id: 'sound-zones', chapter: 'tour', bars: 10, light: 'day', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'spl',
      en: 'Loudspeaker zones, one at a time', vi: 'Từng vùng loa, từng bước một',
      demo: { title: ['Loudspeaker zones', 'Các vùng loa'], rows: ['A1', 'MIC', 'A2', 'A3', 'A5'], stats: ['splAvg', 'stiAvg', 'stiOk', 'fbLow'], steps: [
        S(0, { scene: 'All off' }, ['Everything off', 'Tắt tất cả'],
          ['The map shows speech level at ear height, 1.2 m above the floor, at all {seats} seats. With no loudspeaker on there is no level or clarity to calculate.',
            'Bản đồ cho thấy mức âm lời nói ở tầm tai, cao 1,2 m so với nền, tại cả {seats} chỗ ngồi. Khi chưa bật loa nào thì không có mức âm hay độ rõ để tính.'],
          ['The map shows speech level at ear height, 1.2 m above the floor, at every seat.', 'Bản đồ cho thấy mức âm lời nói ở tầm tai, cao 1,2 m so với nền, tại mọi chỗ ngồi.']),
        S(8, { set: { A1: 1 } }, ['Switch on A1 · wall loudspeakers', 'Bật vùng A1 · loa gắn tường'],
          ['The {A1} slim column loudspeakers of A1 give {splAvg} dBA, nine seats in ten within {splSpread} dB, and a clarity (STI) of {stiAvg}: {stiOk} % of seats reach 0.60.',
            '{A1} loa cột mảnh của vùng A1 cho {splAvg} dBA, chín trên mười chỗ ngồi chênh nhau không quá {splSpread} dB, và độ rõ (STI) {stiAvg}: {stiOk} % chỗ ngồi đạt 0,60.'],
          ['The slim column loudspeakers of A1 cover the nave and the wings from the side walls.', 'Các loa cột mảnh của vùng A1 phủ âm cho lòng nhà thờ và hai cánh từ các tường bên.']),
        S(16, { set: { MIC: 1 } }, ['Switch on the microphones', 'Bật các micro'],
          ['With the microphones live, the simulator also finds how far gain can rise before feedback: {fbLow} dB, against an aim of 3 dB or more.',
            'Khi micro đang bật, mô phỏng cũng tính được độ khuếch đại có thể tăng bao nhiêu trước khi hú: {fbLow} dB, so với mục tiêu từ 3 dB trở lên.'],
          ['With the microphones live, the simulator also finds how far gain can rise before feedback. The project aims for 3 dB or more.', 'Khi micro đang bật, mô phỏng cũng tính được độ khuếch đại có thể tăng bao nhiêu trước khi hú. Dự án hướng tới từ 3 dB trở lên.']),
        S(24, { set: { A2: 1 } }, ['Add A2 · veranda loudspeakers', 'Thêm vùng A2 · loa hàng hiên'],
          ['A2 serves the verandas. Inside the nave it changes almost nothing: {splAvg} dBA, clarity {stiAvg}.',
            'Vùng A2 phục vụ hàng hiên. Trong lòng nhà thờ nó hầu như không đổi gì: {splAvg} dBA, độ rõ {stiAvg}.'],
          ['A2 serves the verandas. Inside the nave it changes almost nothing.', 'Vùng A2 phục vụ hàng hiên. Trong lòng nhà thờ nó hầu như không đổi gì.']),
        S(32, { set: { A3: 1, A5: 1 } }, ['Add A3 and A5 · courtyard horns, rear fill', 'Thêm A3 và A5 · loa sân, loa phụ phía sau'],
          ['Courtyard horns and rear fill send sound back through the open windows late: clarity falls to {stiAvg}, {echo} seats flag echo, the margin drops to {fbLow} dB. For crowds outside only.',
            'Loa nén ngoài sân và loa phụ phía sau làm âm thanh dội lại muộn qua cửa mở: độ rõ giảm còn {stiAvg}, {echo} chỗ ngồi bị đánh dấu vang vọng, độ dự trữ tụt xuống {fbLow} dB. Chỉ dùng khi đông người ngoài sân.'],
          ['Courtyard horns and rear fill send sound back through the open windows late and blur speech inside. For crowds outside only.', 'Loa nén ngoài sân và loa phụ phía sau làm âm thanh dội lại muộn qua cửa mở và làm nhòe lời nói bên trong. Chỉ dùng khi đông người ngoài sân.'])] },
      keys: PLAN_KEYS },
    { id: 'sound-level', chapter: 'tour', bars: 7, light: 'day', roof: false, cut: 'fade', ease: [0, 0], up: MAP_UP, overlay: 'spl',
      en: 'Mixer level against feedback', vi: 'Mức mixer và hiện tượng hú',
      mark: { circuits: ['MIC'], en: 'Microphones', vi: 'Micro' },
      demo: { title: ['Mixer level', 'Mức mixer'], rows: [{ setting: 'mixerDb', en: 'Mixer level', vi: 'Mức mixer', unit: 'dB' }, 'A1', 'MIC'], stats: ['splAvg', 'fbLow', 'stiAvg', 'stiOk'], steps: [
        S(0, { scene: FULL, setting: { mixerDb: 0 } }, ['Nominal level', 'Mức danh định'],
          ['Wall loudspeakers, veranda fill and choir monitors, both microphones on: {splAvg} dBA at the seats, {fbLow} dB of margin before feedback.',
            'Loa gắn tường, loa hàng hiên và loa ca đoàn, cả hai micro đang bật: {splAvg} dBA tại chỗ ngồi, {fbLow} dB dự trữ trước khi hú.'],
          ['Wall loudspeakers, veranda fill and choir monitors, both microphones on.', 'Loa gắn tường, loa hàng hiên và loa ca đoàn, cả hai micro đang bật.']),
        S(7, { setting: { mixerDb: -6 } }, ['Mixer 6 dB lower', 'Giảm mixer 6 dB'],
          ['Mixer 6 dB down: speech {splAvg} dBA, margin {fbLow} dB. Clarity does not improve: {stiOk} % of seats reach 0.60.',
            'Giảm mixer 6 dB: lời nói {splAvg} dBA, dự trữ {fbLow} dB. Độ rõ không tốt hơn: {stiOk} % chỗ ngồi đạt 0,60.'],
          ['Turning the mixer down lowers the speech and widens the margin before feedback.', 'Giảm mixer hạ mức lời nói và nới độ dự trữ trước khi hú.']),
        S(14, { setting: { mixerDb: 6 } }, ['Mixer 6 dB higher', 'Tăng mixer 6 dB'],
          ['Mixer 6 dB up: {splAvg} dBA, but the margin falls to {fbLow} dB; below zero, the microphones howl. Louder is not clearer: clarity stays {stiAvg}.',
            'Tăng mixer 6 dB: {splAvg} dBA, nhưng độ dự trữ tụt xuống {fbLow} dB; dưới 0 thì micro hú. To hơn không có nghĩa là rõ hơn: độ rõ vẫn {stiAvg}.'],
          ['Turning it up gives more level, but the margin falls below zero and the microphones howl. Louder is not clearer.', 'Tăng lên cho mức âm lớn hơn, nhưng độ dự trữ tụt xuống dưới 0 và micro hú. To hơn không có nghĩa là rõ hơn.']),
        S(21, { setting: { mixerDb: 0 } }, ['Back to the nominal level', 'Trở lại mức danh định'],
          ['At the nominal level the margin is {fbLow} dB, short of 3 dB. Closing the gap means moving loudspeakers or using headset microphones: for the sound designer.',
            'Ở mức danh định, độ dự trữ là {fbLow} dB, chưa đạt 3 dB. Muốn đạt phải dời loa hoặc dùng micro đeo đầu: việc của kỹ sư âm thanh.'],
          ['Closing a gap in the margin means moving loudspeakers or using headset microphones: for the sound designer.', 'Muốn tăng độ dự trữ phải dời loa hoặc dùng micro đeo đầu: việc của kỹ sư âm thanh.'])] },
      keys: PLAN_KEYS },
    { id: 'sound-fans', chapter: 'tour', bars: 9, light: 'day', roof: false, cut: 'fade', ease: [0.2, 0.2], up: MAP_UP, overlay: 'sti',
      en: 'Fan noise against speech', vi: 'Tiếng ồn của quạt và lời nói',
      demo: { title: ['Fans against speech', 'Quạt và lời nói'], rows: ['F1', 'F5', 'F2', ...EXHAUST], stats: ['noise', 'stiAvg', 'stiOk', 'kwFan'], steps: [
        S(0, { scene: FULL, set: { F1: 0, F5: 0, ...exhaust(0) } }, ['Fans off', 'Tắt quạt'],
          ['Does fan noise get in the way of speech? Fans off: {noise} dBA at the seats, the ambient level assumed, and clarity {stiAvg}.',
            'Tiếng ồn của quạt có làm khó nghe lời không? Khi tắt quạt: {noise} dBA tại chỗ ngồi, mức nền giả định, và độ rõ {stiAvg}.'],
          ['Does fan noise get in the way of speech? The map shows the clarity of speech at every seat.', 'Tiếng ồn của quạt có làm khó nghe lời không? Bản đồ cho thấy độ rõ của lời nói tại mọi chỗ ngồi.']),
        S(9, { scene: FULL }, ['Fans at the scene settings', 'Quạt theo thiết lập của chế độ'],
          ['Fans as the Full service scene sets them: noise {noise} dBA, clarity {stiAvg}.',
            'Quạt theo thiết lập của chế độ Thánh lễ đầy đủ: tiếng ồn {noise} dBA, độ rõ {stiAvg}.'],
          ['With the fans as the Full service scene sets them, the noise rises and the clarity falls a little.', 'Với quạt theo thiết lập của chế độ Thánh lễ đầy đủ, tiếng ồn tăng và độ rõ giảm đôi chút.']),
        S(18, { set: { F1: 3, F5: 3, ...exhaust(2) } }, ['Ceiling, wing and exhaust fans on High', 'Quạt trần, quạt hai cánh và quạt hút ở tốc độ Cao'],
          ['On High: noise {noise} dBA, and only {stiOk} % of seats keep a clarity of 0.60: speech is harder to follow.',
            'Ở tốc độ Cao: tiếng ồn {noise} dBA, và chỉ {stiOk} % chỗ ngồi giữ được độ rõ 0,60: lời nói khó nghe hơn.'],
          ['On High the noise rises and fewer seats keep a clarity of 0.60: speech is harder to follow.', 'Ở tốc độ Cao tiếng ồn tăng và ít chỗ ngồi giữ được độ rõ 0,60: lời nói khó nghe hơn.']),
        S(27, { set: { F2: 3 } }, ['Add the nave wall fans on High', 'Thêm quạt tường lòng nhà thờ ở tốc độ Cao'],
          ['With the nave wall fans too: {noise} dBA, clarity {stiAvg}, {stiOk} % of seats at 0.60. Cooling and clear speech compete, so each scene sets both.',
            'Thêm cả quạt tường lòng nhà thờ: {noise} dBA, độ rõ {stiAvg}, {stiOk} % chỗ ngồi đạt 0,60. Làm mát và nghe rõ tranh nhau, nên mỗi chế độ đặt cả hai.'],
          ['With the nave wall fans too the clarity falls further. Cooling and clear speech compete, so each scene sets both.', 'Thêm cả quạt tường lòng nhà thờ thì độ rõ giảm thêm. Làm mát và nghe rõ tranh nhau, nên mỗi chế độ đặt cả hai.'])] },
      keys: WING_KEYS },
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
        line: 'What each switch draws, and the cable routes behind it: a routing study', second: 'Mỗi công tắc tiêu thụ bao nhiêu điện, và các tuyến cáp phía sau: một nghiên cứu đi dây', foot: [TOUR_VIRTUAL, ...TOUR_SCENE.foot],
        plain: { foot: [TOUR_VIRTUAL, ...TOUR_SCENE.plain] } },
      keys: [[-60, 25, 37, 9, 12.5, 0, 42], [-50, 20, 30, 8, 12.5, 0, 43], [-40, 15, 22, 6, 13, 0, 44]] },
    { id: 'grid-boards', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.3, 0.3],
      en: 'The main board and the controls', vi: 'Tủ điện chính và các tủ điều khiển',
      note: { en: 'In the service room behind the altar: the main board DB-1, the lighting and scene controls LC-1, the fan controls FC-1 and the sound rack AV-1. One feeder, about {feederM} m of route, runs from here to DB-2 in the base of a tower, which serves the towers, the façade and the entrance.',
        vi: 'Trong phòng kỹ thuật sau bàn thờ: tủ điện chính DB-1, tủ điều khiển đèn và chế độ LC-1, tủ điều khiển quạt FC-1 và tủ âm thanh AV-1. Một tuyến cáp nguồn dài khoảng {feederM} m chạy từ đây đến DB-2 trong chân tháp, nơi cấp điện cho tháp, mặt tiền và lối vào.' },
      plain: { en: 'In the service room behind the altar: the main board DB-1, the lighting and scene controls LC-1, the fan controls FC-1 and the sound rack AV-1. One feeder runs from here to DB-2 in the base of a tower.',
        vi: 'Trong phòng kỹ thuật sau bàn thờ: tủ điện chính DB-1, tủ điều khiển đèn và chế độ LC-1, tủ điều khiển quạt FC-1 và tủ âm thanh AV-1. Một tuyến cáp nguồn chạy từ đây đến DB-2 trong chân tháp.' },
      mark: { sources: ['DB1', 'LC1', 'FC1', 'AV1'], en: 'DB-1, LC-1, FC-1, AV-1', vi: 'Tủ điện và tủ điều khiển' },
      keys: [[51.9, 1.9, 0.9, 48.9, 1.8, 0, 64], [51.7, 1.9, -0.2, 48.9, 1.8, -0.6, 63], [51.5, 1.9, -1.2, 48.9, 1.8, -1.1, 62]] },
    { id: 'grid-all', chapter: 'tour', bars: 3, light: 'evening', roof: true, cut: 'fade', ease: [0.3, 0.6], systems: 'all',
      en: 'The wiring on its own', vi: 'Riêng hệ thống dây',
      note: { en: 'The simulator hides the building: the boards, {routes} cable routes (about {km} km as drawn) and the connected fittings remain. The lines are drawn thick to be seen; they are not cable sizes.',
        vi: 'Mô phỏng ẩn công trình: còn lại tủ điện, {routes} tuyến cáp (khoảng {km} km theo bản vẽ) và các thiết bị được nối. Đường dây được vẽ to cho dễ nhìn, không phải tiết diện cáp.' },
      plain: { en: 'The simulator hides the building and leaves the boards, the cable routes and the connected fittings. The lines are drawn thick to be seen; they are not cable sizes.',
        vi: 'Mô phỏng ẩn công trình, chỉ để lại tủ điện, tuyến cáp và thiết bị được nối. Đường dây được vẽ to cho dễ nhìn, không phải tiết diện cáp.' },
      mark: { sources: ['DB1', 'DB2'], en: 'Boards DB-1 and DB-2', vi: 'Tủ điện DB-1 và DB-2' },
      keys: AERIAL },
    { id: 'grid-scenes', chapter: 'tour', bars: 8, light: 'evening', roof: true, cut: 'fade', ease: [0.3, 0.3], systems: 'all',
      en: 'What each scene draws', vi: 'Mỗi chế độ tiêu thụ bao nhiêu',
      demo: { title: ['Load by scene', 'Phụ tải theo chế độ'], rows: ['@light', '@fan', '@sound'], stats: ['kw', 'amps', 'kwDb1', 'kwDb2'], steps: [
        S(0, { scene: 'Night security' }, null,
          ['The simulator adds up what the equipment switched on draws, and the current at 230 V with an assumed power factor of 0.9. Night security: {kw} kW, {amps} A.',
            'Mô phỏng cộng công suất của các thiết bị đang bật, và dòng điện ở 230 V với hệ số công suất giả định 0,9. An ninh ban đêm: {kw} kW, {amps} A.'],
          ['The simulator adds up what the equipment switched on draws, and the current at 230 V with an assumed power factor of 0.9.', 'Mô phỏng cộng công suất của các thiết bị đang bật, và dòng điện ở 230 V với hệ số công suất giả định 0,9.']),
        S(8, { scene: 'Weekday Mass' }, null,
          ['Weekday Mass: {kw} kW, {amps} A; {kwLight} kW of it in lighting and {kwFan} kW in fans.',
            'Thánh lễ ngày thường: {kw} kW, {amps} A; trong đó {kwLight} kW cho chiếu sáng và {kwFan} kW cho quạt.'],
          ['Weekday Mass draws more than night security, mostly in lighting and fans.', 'Thánh lễ ngày thường tiêu thụ nhiều hơn an ninh ban đêm, chủ yếu cho chiếu sáng và quạt.']),
        S(16, { scene: FULL }, null,
          ['Full service: {kw} kW, {amps} A, of which {kwDb2} kW passes through the DB-1 → DB-2 feeder.',
            'Thánh lễ đầy đủ: {kw} kW, {amps} A, trong đó {kwDb2} kW đi qua tuyến nguồn DB-1 → DB-2.'],
          ['Full service: part of the load passes through the DB-1 → DB-2 feeder.', 'Thánh lễ đầy đủ: một phần phụ tải đi qua tuyến nguồn DB-1 → DB-2.']),
        S(24, { scene: 'Christmas & festivals' }, null,
          ['Christmas and festivals adds the festival lights: {kw} kW, {amps} A. Whether the supply can carry it is for the electrical engineer: the model has not been given the supply.',
            'Giáng sinh và lễ hội thêm đèn lễ hội: {kw} kW, {amps} A. Nguồn cấp có chịu nổi hay không là việc của kỹ sư điện: mô hình chưa được cho biết nguồn cấp.'],
          ['Christmas and festivals adds the festival lights. Whether the supply can carry it is for the electrical engineer: the model has not been given the supply.', 'Giáng sinh và lễ hội thêm đèn lễ hội. Nguồn cấp có chịu nổi hay không là việc của kỹ sư điện: mô hình chưa được cho biết nguồn cấp.'])] },
      keys: [[26.5, 38, 42, 26.5, 2.5, 0, 45], [40, 36, 40, 27, 3, 0, 45], [52, 34, 35, 27, 3, 0, 45]] },
    { id: 'grid-lighting', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.4], systems: 'lighting',
      en: 'Lighting circuits', vi: 'Các mạch chiếu sáng',
      note: { en: 'Each lighting circuit leaves LC-1, or DB-2 at the front, as a shared trunk along the wall bands above the openings; each fitting has its own drop. The panel gives each circuit’s current and breaker.',
        vi: 'Mỗi mạch chiếu sáng đi từ LC-1, hoặc từ DB-2 ở phía trước, thành một tuyến trục dùng chung dọc dải tường phía trên các ô cửa; mỗi bộ đèn có một nhánh riêng. Bảng bên phải cho biết dòng điện và cầu dao của từng mạch.' },
      plain: { en: 'Each lighting circuit leaves LC-1, or DB-2 at the front, as a shared trunk along the wall bands above the openings; each fitting has its own drop.',
        vi: 'Mỗi mạch chiếu sáng đi từ LC-1, hoặc từ DB-2 ở phía trước, thành một tuyến trục dùng chung dọc dải tường phía trên các ô cửa; mỗi bộ đèn có một nhánh riêng.' },
      demo: { title: ['Lighting circuits · current', 'Mạch chiếu sáng · dòng điện'], rows: ['L1', 'L2', 'L3', 'L8', 'L4', 'LD'], stats: ['kwLight', 'ampsLight'], breaker: true, foot: DB_FOOT, steps: [S(0, { scene: FULL })] },
      keys: [[8, 3, 0, 40, 6.5, 0, 62], [20, 3.4, 0, 46, 6.5, 0, 62], [34, 3.9, 0, 48.6, 6, 0, 60]] },
    { id: 'grid-fans', chapter: 'tour', bars: 6, light: 'evening', roof: true, cut: 'dip', ease: [0.5, 0.5], systems: 'air',
      en: 'Fan circuits: current follows speed', vi: 'Các mạch quạt: dòng điện theo tốc độ',
      demo: { title: ['Fan circuits · current', 'Mạch quạt · dòng điện'], rows: ['F1', 'F5', ...EXHAUST], stats: ['kwFan', 'ampsFan'], breaker: true, foot: DB_FOOT, steps: [
        S(0, { scene: 'All off', set: { F1: 1, F5: 1, ...exhaust(1) } }, ['All fan circuits on Low', 'Mọi mạch quạt ở tốc độ Thấp'],
          ['Ceiling, wing and exhaust fans leave FC-1 on their own circuits, each with its own speed; the entrance fans come from DB-2. On Low: {kwFan} kW, {ampsFan} A.',
            'Quạt trần, quạt hai cánh và quạt hút đi từ FC-1 trên các mạch riêng, mỗi nhóm một tốc độ; quạt lối vào lấy điện từ DB-2. Ở tốc độ Thấp: {kwFan} kW, {ampsFan} A.'],
          ['Ceiling, wing and exhaust fans leave FC-1 on their own circuits, each with its own speed; the entrance fans come from DB-2.', 'Quạt trần, quạt hai cánh và quạt hút đi từ FC-1 trên các mạch riêng, mỗi nhóm một tốc độ; quạt lối vào lấy điện từ DB-2.']),
        S(8, { set: { F1: 2, F5: 2, ...exhaust(2) } }, ['All on Normal', 'Tất cả ở tốc độ Vừa'],
          ['On Normal: {kwFan} kW, {ampsFan} A. A fan motor draws more as it speeds up.',
            'Ở tốc độ Vừa: {kwFan} kW, {ampsFan} A. Động cơ quạt tốn điện hơn khi quay nhanh hơn.'],
          ['On Normal the same circuits draw more: a fan motor draws more as it speeds up.', 'Ở tốc độ Vừa, các mạch đó dùng nhiều điện hơn: động cơ quạt tốn điện hơn khi quay nhanh hơn.']),
        S(16, { set: { F1: 3, F5: 3, ...exhaust(2) } }, ['Ceiling and wing fans on High', 'Quạt trần và quạt hai cánh ở tốc độ Cao'],
          ['On High the ceiling circuit F1 draws {A_F1} A, its most, against its breaker. Motor starting current and fan controls are for the electrical engineer.',
            'Ở tốc độ Cao, mạch quạt trần F1 dùng {A_F1} A, mức cao nhất, so với cầu dao của nó. Dòng khởi động của động cơ và bộ điều khiển quạt là việc của kỹ sư điện.'],
          ['Motor starting current and the fan controls are for the electrical engineer.', 'Dòng khởi động của động cơ và bộ điều khiển quạt là việc của kỹ sư điện.'])] },
      keys: [[10, 22, -30, 24, 4, 0, 48], [26, 22, -32, 27, 4, 0, 48], [42, 22, -30, 30, 4, 0, 48]] },
    { id: 'grid-sound', chapter: 'tour', bars: 4, light: 'evening', roof: true, cut: 'dip', ease: [0.4, 0.3], systems: 'sound',
      en: 'Sound lines', vi: 'Các đường âm thanh',
      note: { en: 'The {speakers} loudspeakers and {mics} microphones reach the sound rack AV-1 on separate audio cable bundles: signal, not mains power. The panel shows the mains power drawn per zone. Cable and amplifier choices are still to design.',
        vi: '{speakers} loa và {mics} micro nối về tủ âm thanh AV-1 bằng các bó cáp âm thanh riêng: tín hiệu, không phải điện lưới. Bảng bên phải cho biết điện lưới dùng cho từng vùng. Việc chọn cáp và ampli còn chờ thiết kế.' },
      plain: { en: 'Loudspeakers and microphones reach the sound rack AV-1 on separate audio cable bundles: signal, not mains power. Cable and amplifier choices are still to design.',
        vi: 'Loa và micro nối về tủ âm thanh AV-1 bằng các bó cáp âm thanh riêng: tín hiệu, không phải điện lưới. Việc chọn cáp và ampli còn chờ thiết kế.' },
      mark: { sources: ['AV1'], en: 'Sound rack AV-1', vi: 'Tủ âm thanh AV-1' },
      demo: { title: ['Sound zones · mains power', 'Vùng âm thanh · điện lưới'], rows: ['A1', 'A4', 'A2', 'A3', 'A5'], stats: ['kwSound'], breaker: true, foot: DB_FOOT, steps: [S(0, { scene: FULL })] },
      keys: [[18, 30, 36, 24, -5, 2, 46], [30, 29, 34, 30, -5, 2, 46], [42, 28, 30, 36, -5, 2, 46]] },
    { id: 'grid-feeder', chapter: 'tour', bars: 6, light: 'evening', roof: true, cut: 'fade', ease: [0.4, 0.4], systems: 'all', board: 'DB2',
      en: 'The feeder to DB-2', vi: 'Tuyến nguồn đến DB-2',
      mark: { sources: ['DB1', 'DB2'], en: 'Boards DB-1 and DB-2', vi: 'Tủ điện DB-1 và DB-2' },
      demo: { title: ['DB-2 · towers and façade', 'DB-2 · tháp và mặt tiền'], rows: ['L6', 'L9', 'L10', 'F4'], stats: ['kwDb2', 'ampsDb2', 'kw'], steps: [
        S(0, { scene: FULL }, null,
          ['Only DB-2 and what it feeds are drawn: the feeder from DB-1, the façade and tower circuits, the event sockets. DB-2 carries {kwDb2} kW, {ampsDb2} A.',
            'Chỉ vẽ DB-2 và những gì nó cấp điện: tuyến nguồn từ DB-1, các mạch mặt tiền và tháp, ổ cắm cho sự kiện. DB-2 mang {kwDb2} kW, {ampsDb2} A.'],
          ['Only DB-2 and what it feeds are drawn: the feeder from DB-1, the façade and tower circuits, the event sockets.', 'Chỉ vẽ DB-2 và những gì nó cấp điện: tuyến nguồn từ DB-1, các mạch mặt tiền và tháp, ổ cắm cho sự kiện.']),
        S(8, { feeder: false }, ['Switch the feeder off', 'Ngắt tuyến nguồn'],
          ['Feeder off: everything beyond DB-2 loses power, {kwDb2} kW. The nave stays on: DB-1 feeds it directly.',
            'Ngắt tuyến nguồn: mọi thứ sau DB-2 mất điện, {kwDb2} kW. Lòng nhà thờ vẫn sáng: DB-1 cấp điện trực tiếp cho nó.'],
          ['Feeder off: everything beyond DB-2 loses power. The nave stays on: DB-1 feeds it directly.', 'Ngắt tuyến nguồn: mọi thứ sau DB-2 mất điện. Lòng nhà thờ vẫn sáng: DB-1 cấp điện trực tiếp cho nó.']),
        S(16, { feeder: true, scene: FULL }, ['Switch the feeder back on', 'Đóng lại tuyến nguồn'],
          ['Feeder on: the DB-2 circuits restart from the scene, {kwDb2} kW, {ampsDb2} A.',
            'Đóng lại tuyến nguồn: các mạch DB-2 khởi động lại theo chế độ, {kwDb2} kW, {ampsDb2} A.'],
          ['Feeder on: the DB-2 circuits restart from the scene.', 'Đóng lại tuyến nguồn: các mạch DB-2 khởi động lại theo chế độ.'])] },
      keys: [[59, 27, -33, 27, 2.5, 0, 45], [40, 26, -40, 26, 2.5, 0, 45], [20, 25, -40, 18, 2.5, 0, 46]] },
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
  // along the curve), the distance walked, and a timing table for its start
  // and end speeds.
  const STEPS = 40, RAMP = 0.3;
  // A walking person: a 0.72 m step, the eye 25 mm higher in mid-stride than
  // at heel strike and 15 mm to either side over a pair of steps, both fading
  // out as the walker slows to a stop.
  const STRIDE = 0.72, BOB = 0.025, SWAY = 0.015, WALKING = 0.6;
  function prepare(reel) {
    reel.length = 0;
    reel.shots.forEach((shot, index) => {
      shot.index = index;
      shot.start = reel.length; shot.duration = shot.bars * reel.bar; reel.length += shot.duration;
      // A technical caption stays for the whole scene: it is the explanation.
      shot.stay = !!reel.technical;
      // The first scene of each later chapter of the film opens on a chapter card.
      shot.opens = !reel.technical && index > 0 && !shot.card && reel.shots[index - 1].chapter !== shot.chapter;
      let lens = 48;
      shot.eye = shot.keys.map(k => k.slice(0, 3));
      shot.look = shot.keys.map(k => k.slice(3, 6));
      shot.lens = shot.keys.map(k => (lens = k[6] ?? lens));
      const segments = shot.keys.length - 1;
      shot.travel = [0]; shot.walked = [0];
      let previousEye = shot.eye[0], previousLook = shot.look[0];
      for (let i = 1; i <= segments * STEPS; i++) {
        const q = i / STEPS, eye = along(shot.eye, q), look = along(shot.look, q);
        // A pan with a still camera is paced by the movement of the point it
        // looks at; a walker keeps an even step while glancing about.
        shot.travel.push(shot.travel[i - 1] + dist(eye, previousEye) + (shot.walk ? 0.03 : shot.pan ?? 0.3) * dist(look, previousLook) + 1e-5);
        shot.walked.push(shot.walked[i - 1] + Math.hypot(eye[0] - previousEye[0], eye[2] - previousEye[2]));
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
  // Where along the keys (in key segments) the camera is at a share of the shot.
  function placeAt(shot, local) {
    const done = table(shot.timing, Math.min(1, Math.max(0, local))) / shot.timing[shot.timing.length - 1];
    const wanted = done * shot.travel[shot.travel.length - 1];
    let lo = 0, hi = shot.travel.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (shot.travel[mid] <= wanted) lo = mid; else hi = mid; }
    return (lo + (wanted - shot.travel[lo]) / (shot.travel[hi] - shot.travel[lo])) / STEPS;
  }
  function pose(time, of = reel) {
    const shot = shotAt(time, of);
    const local = Math.min(1, Math.max(0, (time - shot.start) / shot.duration));
    const q = placeAt(shot, local);
    const segment = Math.min(shot.keys.length - 2, Math.floor(q));
    const eye = along(shot.eye, q), look = along(shot.look, q);
    if (shot.walk) {
      // The step follows the distance walked, so it slows and stops with the walker.
      const walked = q => table(shot.walked, q / (shot.keys.length - 1));
      const span = 0.25 / shot.duration, metres = walked(q);
      const pace = Math.abs(walked(placeAt(shot, local + span)) - walked(placeAt(shot, local - span))) / 0.5;
      const amount = smooth(pace / WALKING), phase = Math.PI * metres / STRIDE;
      const heading = Math.atan2(look[2] - eye[2], look[0] - eye[0]);
      eye[1] += amount * BOB * (0.5 - 0.5 * Math.cos(2 * phase));
      const sway = amount * SWAY * Math.sin(phase);
      eye[0] -= sway * Math.sin(heading); eye[2] += sway * Math.cos(heading);
    }
    return { shot, eye, look, up: shot.up || [0, 1, 0],
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
    // A title clears at `until` when it has one, so that the picture behind it has the screen to itself.
    const cardFrom = shot.card?.at ?? 1.2, cardTo = shot.card?.until ?? (shot.card?.hold ? shot.duration + 1 : timed ? shot.duration - 2.4 : 9.5);
    // The first scene of a chapter opens on the chapter's number and name; its caption follows.
    const chapter = !!shot.opens && local >= CHAPTER_CARD.from && local < CHAPTER_CARD.to;
    const captionFrom = shot.opens ? CHAPTER_CARD.to + 0.6 : 1;
    // A caption stays long enough to read, and clears before a title card.
    const captionTo = timed ? shot.card.at - 1.2 : shot.stay ? shot.duration - 1.2 : Math.min(shot.duration - 1.2, captionFrom + 13.5);
    const caption = !!shot.en && local > captionFrom && local < captionTo;
    // In the film the heading comes first and its note a moment later; a technical tour shows both at once.
    return { card: !!shot.card && local >= cardFrom && local < cardTo, chapter, caption, note: caption && (shot.stay || local > captionFrom + 1.1) };
  }
  // How much of the scene before still shows through a dissolve (1 at the cut, 0 when it has melted away).
  function heldAt(time, of = reel) {
    const shot = shotAt(time, of), local = time - shot.start;
    return shot.cut === 'dissolve' && shot.index > 0 && local < DISSOLVE ? 1 - smooth(local / DISSOLVE) : 0;
  }

  /* --------------------------------------------------------------- music
   * 4/4 at 60 beats a minute: one bar for every four seconds of film.
   *
   *  1. "Homeland" (film bars 1–48, outside). An original melody on the five
   *     notes C D E G A, the scale of much Vietnamese folk song. It quotes no
   *     existing song. It grows as the camera goes round: an open fifth under
   *     the bells, the flute alone over a drone with the small slides of folk
   *     singing, the strings joining, the melody in the tenor under flowing
   *     flutes, full organ at the roof and the altar end, then the flute again.
   *  2. "Ave Maria" (bars 49–89, inside, from the church door to the look
   *     back from the sanctuary). Charles Gounod's melody of 1853 over
   *     J. S. Bach's Prelude in C, BWV 846, complete in 41 bars. Both are in
   *     the public domain. Notes are transcribed from the Mutopia Project
   *     edition no. 2167 (after Heugel, 1856; released into the public domain
   *     by its editor). Its "tutta forza" bar falls on the close view of the
   *     altar and crucifix.
   *  3. "Homeland" quietly in the evening (bars 90–117), first the flute
   *     over a drone as in the morning, then on full organ for the closing
   *     view (bars 118–127), ending quietly.
   * Sections may set: drone (an open fifth C–G under the melody instead of the
   * chords), folk (long notes slide up into pitch, as a voice does), tenor
   * (the melody an octave lower, under the quavers), doubled (the melody also
   * an octave higher, or 'below').
   */
  // Homeland: [chords sharing the bar equally, melody as note:beats].
  const HOME_A = [['C', 'E4:1 G4:1 A4:2'], ['Am', 'C5:1.5 A4:.5 G4:2'], ['F', 'A4:1 C5:1 D5:1.5 C5:.5'], ['G', 'D5:4'],
    ['Am', 'E5:1.5 D5:.5 C5:1 A4:1'], ['F', 'C5:1 D5:.5 C5:.5 A4:2'], ['F G', 'G4:1 A4:1 D5:1.5 C5:.5'], ['C', 'C5:4']];
  const HOME_B = [['Am', 'E5:2 G5:1 E5:1'], ['F', 'D5:1 C5:1 A4:2'], ['C/E', 'G4:1 C5:1 E5:1.5 D5:.5'], ['G', 'D5:3 G4:1'],
    ['Am', 'A4:1 C5:1 E5:1 G5:1'], ['F', 'A5:2 G5:1 E5:1'], ['F G', 'C5:1 A4:1 G4:1 D5:1'], ['C', 'C5:4']];
  const HOMELAND = [
    // Under the bells: the open fifth, then the flute's first call.
    { pad: 'celeste', solo: 'voice', level: 0.46, drone: true, folk: true, bars: [['C', ''], ['C', 'r:2 E5:.5 G5:.5 A5:1'], ['Am', 'A5:1 G5:.5 E5:.5 G5:2'], ['F G', 'A4:2 D5:2']] },
    // Up the tower: the flute alone over the drone.
    { pad: 'celeste', solo: 'voice', level: 0.62, drone: true, folk: true, bars: HOME_A },
    // Belfry and front: the strings join with the chords.
    { pad: 'celeste', solo: 'voice', level: 0.62, folk: true, bars: HOME_B },
    // Forecourt and veranda: the melody in the tenor, flutes flowing above.
    { pad: 'celeste', solo: 'song', level: 0.62, quavers: true, tenor: true, bars: HOME_A },
    // Roof: fuller organ, the melody doubled an octave below.
    { pad: 'principals', solo: 'song', pedal: 'pedal', level: 0.72, quavers: true, doubled: 'below', bars: HOME_B },
    // Round the altar end: the flute again, quieter.
    { pad: 'celeste', solo: 'voice', level: 0.56, folk: true, bars: HOME_A },
    { pad: 'celeste', solo: 'voice', level: 0.46, folk: true, bars: [['F', 'A4:2 C5:2'], ['G', 'D5:4'], ['C', 'E5:1 G5:1 A5:2'], ['C', 'G5:4']] }
  ];
  // Evening, before the finale: the same melody quietly, as the camera walks in the dark.
  const NOCTURNE = [
    { pad: 'celeste', solo: 'voice', level: 0.38, drone: true, folk: true, bars: [['C', ''], ['C', 'r:2 E5:.5 G5:.5 A5:1']] },
    { pad: 'celeste', solo: 'voice', level: 0.44, drone: true, folk: true, bars: HOME_A },
    { pad: 'celeste', solo: 'voice', level: 0.5, bars: HOME_B },
    { pad: 'celeste', solo: 'voice', level: 0.44, bars: HOME_A },
    { pad: 'celeste', solo: 'voice', level: 0.4, bars: [['Am', 'E5:2 D5:2'], ['F', 'C5:2 A4:2']] }
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
  // hush at bar 29 falls as the walker steps up toward the altar.
  const AVE_SWELL = [0.5, 0.5, 0.5, 0.5, 0.54, 0.54, 0.54, 0.54, 0.64, 0.54, 0.64, 0.54, 0.7, 0.62, 0.54, 0.64, 0.56, 0.66, 0.56,
    0.64, 0.74, 0.86, 0.6, 0.64, 0.7, 0.78, 0.84, 0.9, 0.5, 0.6, 0.72, 0.86, 0.94, 1, 0.96, 0.96, 0.8, 0.56, 0.46, 0.42, 0.42];
  const AVE_STARTS = 48; // film bars before the prelude begins

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
          const sung = tune(melody, start).map(note => (section.tenor ? { ...note, note: note.note - 12 } : note));
          for (const note of sung) {
            const event = add(part, 'melody', note.time, note.length - 0.05, note.note, section.solo, section.level);
            // A long note slides up into its pitch, as a folk singer's voice does.
            if (section.folk && note.length >= 1.5) event.slide = -45;
            // On full organ the melody is doubled at the octave above.
            if (section.doubled) add(part, 'melody', note.time, note.length - 0.05, note.note + (section.doubled === 'below' ? -12 : 12), 'song', section.level * 0.7);
          }
          let top = 96;
          list.forEach((symbol, k) => {
            const c = chord(symbol), time = start + k * share;
            if (section.drone) {
              // An open fifth held under the melody, and the low C in the pedal.
              for (const note of [48, 55]) tie(part, 'inner', `drone:${note}`, time, share, note, 'held', section.level * 0.8);
              tie(part, 'bass', 'bass', time, share, 36, 'softPedal', section.level * 0.9);
              return;
            }
            const above = sung.filter(n => n.time < time + share && n.time + n.length > time).map(n => n.note);
            if (above.length) top = Math.min(...above);
            // Inner parts in close position round D4, kept below the melody; none
            // under a tenor melody, which the quavers above accompany alone.
            if (!section.tenor) c.tones.map(pc => place(pc, 62)).map(n => (n > top - 2 ? n - 12 : n))
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
    bar = chordal(NOCTURNE, bar);
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

  /* ------------------------------------------------------------ ambience
   * The sounds of the place under the music of the film (the technical tours
   * have none): a swinging bell ringing for Mass from the opening, up the
   * tower and round the belfry, then handing over to the organ; birds and a breeze outside by day; footsteps at the walker's
   * own pace (stone outside, tiles on the veranda and inside, where the room
   * answers them); a quiet room tone inside; crickets after dark, faint
   * through the open doors once inside. Synthesised here from a fixed seed,
   * so every playing is the same. Presentation sound only: it predicts
   * nothing about this church's acoustics or noise (see simulator/audio.js
   * and the sound tour for the room-based estimates).
   */
  const INSIDE = new Set(['nave', 'timber', 'aisle', 'wings', 'sanctuary', 'altar', 'look-back', 'evening-nave']);
  const VERANDA = new Set(['veranda', 'night-veranda']);
  // One cast-bronze bell swung by its rope, struck at A4 (a note of the music's five-note scale), with
  // the long, wavering ring (ngân) of a bronze bell. Modelled on a recording of a swinging tower bell
  // the owner supplied on 21 November 2026 (measured there: strike note about 436 Hz, a stroke every
  // 1.17 s, the clapper alternating between a bright side, "ding", and a duller side, "dong").
  const BELL = 440;
  // Partials as fractions of the strike note, as measured: [ratio, level, seconds to die away, bright].
  // Hum, strike note and minor-third tierce ring longest (the recording: about 10, 7 and 7 s; a little
  // longer here for the owner's "độ vang, ngân") and come as close pairs whose slow beat makes the
  // ring waver; the nominal an octave up and the upper partials are quick. "bright" is how much a
  // partial loses on the duller side of the swing (the recording: the nominal 10 to 15 dB weaker).
  const BELL_PARTIALS = [[0.5, 0.3, 12, 0.35], [0.5021, 0.16, 12, 0.35], [1, 0.36, 8.5, 0], [1.0034, 0.16, 8.5, 0], [1.179, 0.36, 8, 0], [1.1825, 0.14, 8, 0],
    [1.5, 0.07, 2.6, 0.3], [2.007, 0.4, 3.5, 0.75], [2.587, 0.14, 1.6, 0.5], [3.03, 0.2, 3.7, 0.5], [3.13, 0.12, 1.8, 0.5], [4.21, 0.16, 2.8, 0.5], [5.52, 0.06, 3, 0.6]];
  const BELL_RING = Math.max(...BELL_PARTIALS.map(partial => partial[2]));
  // Where the bells ring: from the first picture up the tower and round the belfry.
  const BELL_SCENES = ['opening', 'towers', 'belfry'];
  function composeSounds(of) {
    let seed = 20261121;
    const random = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296;
    const between = (a, b) => a + (b - a) * random();
    const out = [];
    const inside = (shot, time) => INSIDE.has(shot.id) || (shot.id === 'enter' && pose(time, of).eye[0] > 1);
    // The bell rings from the first picture, up the tower and round the belfry (owner, 21 November
    // 2026: keep the bell while the tower is shown; "Ding Dong Ding Dong" with "độ vang, ngân", and a
    // recording of a swinging bell as the model). Swung evenly and without a break, the clapper
    // striking the bright side and the duller side in turn, a little sooner after the bright side, as
    // in the recording; quieter under the tower's caption, fuller beside the belfry. Then the ringer
    // lets go: the swing dies, the strokes soften, the clapper reaches only the bright side twice
    // more, and the bell rings on. The last strokes are damped so that nothing still rings as the
    // front comes into view. (Superseded the same day: two bells at a fixed 1.3 s in phrases of eight,
    // "like a clock"; four swinging bells, "a mess"; a tune and a ringing pattern in time with the
    // music, "not like a music melody like that".)
    const bellScenes = BELL_SCENES.map(id => of.shots.find(shot => shot.id === id));
    const towers = bellScenes[1], belfry = bellScenes[2], silent = belfry.start + belfry.duration - 0.5, letGo = belfry.start + 6;
    const swell = time => time < towers.start - 1 ? 1
      : time < towers.start + 3 ? 1 - 0.4 * (time - towers.start + 1) / 4
      : time < belfry.start - 2 ? 0.6
      : time < belfry.start + 4 ? 0.6 + 0.3 * (time - belfry.start + 2) / 6
      : 0.9;
    const ring = time => Math.min(1, (silent - time) / BELL_RING);
    const strike = (time, bright, force) => {
      const damped = ring(time);
      out.push({ time, length: BELL_RING * damped, ring: damped, kind: 'bell', nominal: BELL, bright, level: Math.min(1, 0.58 * force * swell(time) * between(0.9, 1.06)), pan: bright ? -0.08 : 0.08, wet: 0.5 });
    };
    let time = 0.15, bright = true;
    // The rope pulled evenly: a stroke every 1.14 s after the bright side and 1.21 s after the dull.
    while (time < letGo) {
      strike(time, bright, bright ? 1 : 0.9);
      time += (bright ? 1.14 : 1.21) + between(-0.025, 0.025); bright = !bright;
    }
    // Let go: five strokes softening a little, then the bright side alone, once a full swing, still
    // strong enough for its ring to carry.
    for (const force of [0.95, 0.9, 0.84, 0.78, 0.72]) { strike(time, bright, force); time += (bright ? 1.14 : 1.21) + between(-0.02, 0.02); bright = !bright; }
    if (!bright) time += 1.14;
    for (const force of [0.66, 0.56]) { strike(time, true, force); time += 2.36; }
    for (const shot of of.shots) {
      const night = shot.light === 'evening', end = shot.start + shot.duration, indoor = INSIDE.has(shot.id);
      // A bed of air under each scene, overlapping its neighbours so that they cross-fade.
      const from = Math.max(0, shot.start - 0.8), to = Math.min(of.length, end + 0.8);
      out.push({ time: from, length: to - from, kind: 'bed', bed: indoor ? 'room' : night ? 'night' : 'breeze', level: 1, fade: shot.index ? 0.8 : 2.5 });
      // Birds by day: near outside, rare and muffled inside.
      if (!night) {
        const every = indoor ? 8 : 2.8;
        for (let time = shot.start + between(0.8, every); time < end - 0.6; time += between(0.5, 1.5) * every) out.push(bird(time, inside(shot, time), between));
      }
      // Footsteps where the camera walks: one at each step of 0.72 m, at the walker's pace.
      if (shot.walk) {
        const segments = shot.keys.length - 1, metresAt = local => table(shot.walked, placeAt(shot, Math.min(1, Math.max(0, local))) / segments);
        const samples = Math.round(shot.duration * 60);
        let step = Math.floor(metresAt(0) / STRIDE), foot = 0;
        for (let i = 1; i <= samples; i++) {
          const local = i / samples, metres = metresAt(local);
          if (Math.floor(metres / STRIDE) <= step) continue;
          step = Math.floor(metres / STRIDE);
          const time = shot.start + local * shot.duration, span = 0.25 / shot.duration;
          const pace = (metresAt(local + span) - metresAt(local - span)) / 0.5;
          if (pace < 0.2 || time > end - 0.05) continue;
          const roofed = inside(shot, time), veranda = VERANDA.has(shot.id);
          out.push({ time, length: 0.3, kind: 'step', surface: roofed || veranda ? 'tile' : 'stone', level: Math.min(1, pace / 0.9) * between(0.82, 1),
            pan: foot++ % 2 ? 0.06 : -0.06, wet: roofed ? 0.5 : veranda ? 0.14 : 0.03 });
        }
      }
    }
    // Crickets from dusk to the end: a few singers, each at its own steady rate and pitch, faint once inside.
    const dusk = of.shots.find(shot => shot.light === 'evening')?.start;
    if (dusk !== undefined) for (let v = 0; v < 4; v++) {
      const period = between(0.45, 0.95), pitch = between(4300, 5300), pan = between(-0.75, 0.75), level = between(0.55, 1);
      for (let time = dusk + between(0, period); time < of.length - 0.2; time += period * between(0.97, 1.03)) {
        const shot = shotAt(time, of), indoor = inside(shot, time);
        if (indoor && v > 1) continue;
        out.push({ time, length: 0.12, kind: 'cricket', pitch, pulses: 3 + (v % 2), level: level * (indoor ? 0.22 : 1), pan, cutoff: indoor ? 2400 : 0 });
      }
    }
    return out.filter(event => event.time >= 0 && event.time < of.length).sort((a, b) => a.time - b.time);
  }
  // A bird's call: two to twelve syllables, each a quick slide in pitch. Muffled when heard from inside.
  function bird(time, indoor, between) {
    const kind = between(0, 3), notes = [];
    let at = 0;
    if (kind < 1) { // a whistle of two or three slow slides
      const base = between(1700, 2600);
      for (let i = 0, n = 2 + Math.round(between(0, 1)); i < n; i++) { const length = between(0.12, 0.24), rise = between(0.82, 1.35); notes.push([at, length, base, base * rise, between(0.7, 1)]); at += length + between(0.05, 0.12); }
    } else if (kind < 2) { // quick falling chirps
      for (let i = 0, n = 3 + Math.round(between(0, 3)); i < n; i++) { const high = between(3600, 5000), length = between(0.035, 0.07); notes.push([at, length, high, high * between(0.62, 0.8), between(0.6, 1)]); at += length + between(0.04, 0.09); }
    } else { // a trill
      const pitch = between(3200, 4400);
      for (let i = 0, n = 8 + Math.round(between(0, 4)); i < n; i++) { notes.push([at, 0.026, pitch * (1 + i * 0.006), pitch * (1.05 + i * 0.006), 0.75 + 0.25 * Math.sin(i)]); at += 0.042; }
    }
    return { time, length: at + 0.05, kind: 'bird', notes, level: between(0.45, 1) * (indoor ? 0.3 : 1), pan: between(-0.8, 0.8), cutoff: indoor ? 1900 : 0, wet: indoor ? 0.4 : 0.06 };
  }
  FILMS.full.sounds = composeSounds(FILMS.full);

  // Output level: the film's mix sat near −26 dBFS; this brings it to about −22, peaks held by the limiter.
  const MASTER = 1.4;
  const music = { context: null, on: true, ambienceOn: true, epoch: null, next: 0, nextSound: 0, zero: 0, synced: false, waking: 0, timer: 0, waves: {} };
  // Some sound is wanted: the organ, or the sounds of the place in a film that has them.
  const soundOn = () => music.on || (music.ambienceOn && !!reel.sounds?.length);
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
    // Artificial reverberation: a few early reflections, then decaying noise,
    // darker as it dies away, a little different in each ear. A generic
    // large-church tail for the film; not this church's predicted response.
    const seconds = 5.5, rate = ctx.sampleRate, impulse = ctx.createBuffer(2, Math.floor(seconds * rate), rate);
    let seed = 20261009;
    const random = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 2147483648) - 1;
    for (let ch = 0; ch < 2; ch++) {
      const data = impulse.getChannelData(ch);
      let low = 0;
      for (let i = 0; i < data.length; i++) {
        const t = i / rate, keep = 0.5 * Math.exp(-t * 0.8) + 0.05;
        low += (random() - low) * keep;
        data[i] = low * Math.exp(-t * 6.9 / 4.4) * Math.min(1, t / 0.03);
      }
      for (let k = 0; k < 14; k++) {
        const t = 0.006 + (k / 14) * 0.075 + Math.abs(random()) * 0.006;
        data[Math.floor(t * rate)] += random() * 0.9 * Math.exp(-t * 14);
      }
    }
    const hall = ctx.createConvolver(); hall.buffer = impulse;
    const gap = ctx.createDelay(0.1); gap.delayTime.value = 0.022;
    music.wet = ctx.createGain(); music.wet.gain.value = 0.6;
    music.send = ctx.createGain(); music.send.connect(gap); gap.connect(hall); hall.connect(music.wet); music.wet.connect(music.master);
    // The organ and the sounds of the place each have a switch.
    music.organ = ctx.createGain(); music.organ.gain.value = music.on ? 1 : 0;
    music.organ.connect(music.dry); music.organ.connect(music.send);
    music.ambience = ctx.createGain(); music.ambience.gain.value = music.ambienceOn ? 1 : 0; music.ambience.connect(music.master);
    music.ambienceWet = ctx.createGain(); music.ambienceWet.gain.value = music.ambienceOn ? 1 : 0; music.ambienceWet.connect(music.send);
    // The bells open the music as well as the scene: they ring when either switch is on.
    music.bells = ctx.createGain(); music.bells.gain.value = music.on || music.ambienceOn ? 1 : 0; music.bells.connect(music.master);
    music.bellsWet = ctx.createGain(); music.bellsWet.gain.value = music.bells.gain.value; music.bellsWet.connect(music.send);
    music.ambienceMeter = ctx.createAnalyser(); music.ambienceMeter.fftSize = 4096; music.ambience.connect(music.ambienceMeter); music.bells.connect(music.ambienceMeter);
    // Tremulant for the solo stops.
    music.solo = ctx.createGain(); music.solo.gain.value = 0.94;
    music.solo.connect(music.organ);
    const wave = ctx.createOscillator(), depth = ctx.createGain();
    wave.frequency.value = 5.3; depth.gain.value = 0.085;
    wave.connect(depth); depth.connect(music.solo.gain); wave.start();
    // Three seconds of noise for wind, footsteps, the clapper and the breath of the pipes.
    music.noise = ctx.createBuffer(1, 3 * rate, rate);
    const noise = music.noise.getChannelData(0);
    for (let i = 0; i < noise.length; i++) noise[i] = random();
    return ctx;
  }
  function musicCut() {
    const ctx = music.context, old = music.epoch;
    if (old) for (const node of old) { node.gain.setTargetAtTime(0, ctx.currentTime, 0.03); setTimeout(() => node.disconnect(), 400); }
    const plain = ctx.createGain(), solo = ctx.createGain(), place = ctx.createGain(), placeWet = ctx.createGain(), bells = ctx.createGain(), bellsWet = ctx.createGain();
    plain.connect(music.organ); solo.connect(music.solo); place.connect(music.ambience); placeWet.connect(music.ambienceWet);
    bells.connect(music.bells); bellsWet.connect(music.bellsWet);
    music.epoch = [plain, solo, place, placeWet, bells, bellsWet];
  }
  // Start the score at a film time: notes already sounding there come in held.
  function musicSeek(time) {
    const ctx = music.context;
    if (!ctx) return;
    musicCut();
    music.zero = ctx.currentTime + 0.06 - time;
    music.next = 0; music.nextSound = 0;
    musicPump();
  }
  // Organ pipes stand on two chests, C side and C♯ side: neighbouring notes come from either side.
  const organPan = event => (event.voice === 'bass' ? 0 : (event.note % 2 ? -1 : 1) * (event.voice === 'melody' ? 0.1 : 0.16 + 0.3 * Math.min(1, Math.max(0, (event.note - 48) / 36))));
  // A short breath of noise: the "chiff" of a pipe as it speaks, a clapper, a footfall.
  function breath(ctx, into, at, seconds, frequency, q, level) {
    const source = ctx.createBufferSource(), band = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = music.noise;
    band.type = 'bandpass'; band.frequency.value = Math.min(9000, frequency); band.Q.value = q;
    gain.gain.setValueAtTime(0, at); gain.gain.linearRampToValueAtTime(level, at + 0.003); gain.gain.setTargetAtTime(0, at + 0.003, seconds / 3);
    source.connect(band); band.connect(gain); gain.connect(into);
    source.start(at, (at * 0.7919) % 2.5); source.stop(at + seconds * 2 + 0.05);
  }
  // Where a sound of the place goes: placed left or right, with some of it into the room's echo.
  function placed(ctx, event, cutoff) {
    const pan = ctx.createStereoPanner();
    pan.pan.value = event.pan || 0;
    const bell = event.kind === 'bell' ? 2 : 0;
    pan.connect(music.epoch[2 + bell]);
    if (event.wet) { const send = ctx.createGain(); send.gain.value = event.wet; pan.connect(send); send.connect(music.epoch[3 + bell]); }
    if (!cutoff) return pan;
    const muffle = ctx.createBiquadFilter(); muffle.type = 'lowpass'; muffle.frequency.value = cutoff; muffle.connect(pan);
    return muffle;
  }
  const SOUNDS = {
    bell(ctx, event, begin) {
      const out = placed(ctx, event, 6500);
      for (let [ratio, amp, seconds, side] of BELL_PARTIALS) {
        // The duller side of the swing takes some of the upper partials away.
        const tone = ctx.createOscillator(), gain = ctx.createGain(), peak = amp * event.level * 1.05 * (event.bright === false ? 1 - side * 0.7 : 1);
        seconds *= event.ring ?? 1;
        tone.frequency.value = event.nominal * ratio;
        gain.gain.setValueAtTime(0, begin); gain.gain.linearRampToValueAtTime(peak, begin + 0.004);
        gain.gain.setTargetAtTime(0, begin + 0.004, seconds / 6.9);
        tone.connect(gain); gain.connect(out); tone.start(begin); tone.stop(begin + seconds + 0.1);
      }
      // The clapper on bronze: a hard click and a short metallic clang.
      const clang = event.bright === false ? 0.6 : 1;
      breath(ctx, out, begin, 0.025, 3200, 0.9, event.level * 0.3 * clang);
      breath(ctx, out, begin, 0.12, event.nominal * 2.587, 6, event.level * 0.22 * clang);
    },
    bird(ctx, event, begin) {
      const out = placed(ctx, event, event.cutoff), voice = ctx.createOscillator(), gain = ctx.createGain(), level = event.level * 0.05;
      voice.frequency.setValueAtTime(event.notes[0][2], begin); gain.gain.setValueAtTime(0, begin);
      for (const [at, length, from, to, amp] of event.notes) {
        const t = begin + at;
        voice.frequency.setValueAtTime(from, t); voice.frequency.exponentialRampToValueAtTime(to, t + length);
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(amp * level, t + Math.min(0.01, length / 3));
        gain.gain.setValueAtTime(amp * level, t + length * 0.7); gain.gain.linearRampToValueAtTime(0, t + length);
      }
      voice.connect(gain); gain.connect(out); voice.start(begin); voice.stop(begin + event.length + 0.05);
    },
    cricket(ctx, event, begin) {
      const out = placed(ctx, event, event.cutoff), voice = ctx.createOscillator(), gain = ctx.createGain(), level = event.level * 0.018;
      voice.frequency.value = event.pitch; gain.gain.setValueAtTime(0, begin);
      for (let i = 0; i < event.pulses; i++) {
        const t = begin + i * 0.026;
        gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(level, t + 0.003); gain.gain.setValueAtTime(level, t + 0.012); gain.gain.linearRampToValueAtTime(0, t + 0.016);
      }
      voice.connect(gain); gain.connect(out); voice.start(begin); voice.stop(begin + event.pulses * 0.026 + 0.03);
    },
    step(ctx, event, begin) {
      const out = placed(ctx, event), stone = event.surface === 'stone', level = event.level * 0.2;
      // Heel, then the ball of the foot; on stone, a soft thud under it.
      breath(ctx, out, begin, 0.05, stone ? 950 : 1700, stone ? 0.8 : 1.1, level);
      breath(ctx, out, begin + 0.065, 0.035, stone ? 1300 : 2400, 1.2, level * 0.45);
      if (stone) {
        const thud = ctx.createOscillator(), gain = ctx.createGain();
        thud.frequency.value = 78; gain.gain.setValueAtTime(0, begin); gain.gain.linearRampToValueAtTime(level * 0.35, begin + 0.004); gain.gain.setTargetAtTime(0, begin + 0.004, 0.02);
        thud.connect(gain); gain.connect(out); thud.start(begin); thud.stop(begin + 0.2);
      }
    },
    bed(ctx, event, begin, end) {
      const shape = { breeze: [['bandpass', 480, 0.5], 0.05, 0.4], room: [['lowpass', 210, 0.7], 0.035, 0], night: [['lowpass', 360, 0.7], 0.03, 0.25] }[event.bed];
      const [[type, frequency, q], level, sway] = shape, out = placed(ctx, event);
      const source = ctx.createBufferSource(), tone = ctx.createBiquadFilter(), gust = ctx.createGain(), gain = ctx.createGain();
      source.buffer = music.noise; source.loop = true;
      tone.type = type; tone.frequency.value = frequency; tone.Q.value = q;
      // The breeze rises and falls slowly.
      if (sway) {
        const swell = ctx.createOscillator(), depth = ctx.createGain();
        swell.frequency.value = 0.06 + (event.time % 7) * 0.008; depth.gain.value = sway;
        swell.connect(depth); depth.connect(gust.gain); swell.start(begin); swell.stop(end + 0.1);
      }
      const fade = Math.min(event.fade, (end - begin) / 2);
      gain.gain.setValueAtTime(0, begin); gain.gain.linearRampToValueAtTime(level * event.level, begin + fade);
      gain.gain.setValueAtTime(level * event.level, end - fade); gain.gain.linearRampToValueAtTime(0, end);
      source.connect(tone); tone.connect(gust); gust.connect(gain); gain.connect(out);
      source.start(begin, (event.time * 0.37) % 2.5); source.stop(end + 0.05);
    }
  };
  function musicPump() {
    const ctx = music.context;
    if (!ctx || ctx.state !== 'running' || !music.synced || !music.epoch) return;
    const now = ctx.currentTime - music.zero, horizon = now + 1.6;
    const events = reel.score.events;
    while (music.next < events.length && events[music.next].time < horizon) {
      const event = events[music.next++];
      const begin = Math.max(ctx.currentTime + 0.01, music.zero + event.time), end = music.zero + event.time + event.length;
      if (end - begin < 0.05) continue;
      // A hair of drift in each note's tuning, the same every time it is played.
      const drift = ((event.note * 7919 + Math.round(event.time * 1000)) % 13 - 6) * 0.25;
      const frequency = 440 * Math.pow(2, (event.note - 69) / 12 + drift / 1200);
      const pan = ctx.createStereoPanner();
      pan.pan.value = organPan(event); pan.connect(music.epoch[TREMULANT.has(event.stops) ? 1 : 0]);
      let loudest = 0;
      STOPS[event.stops].forEach(([tone, pitch, level, cents = 0], rank) => {
        const pipe = ctx.createOscillator(), gain = ctx.createGain(), peak = level * event.level * 0.2;
        loudest += peak;
        // Strings speak slowly; flutes and principals promptly.
        const attack = tone === 'string' ? 0.14 : 0.045;
        pipe.setPeriodicWave(music.waves[tone]);
        // Ranks are tuned a hair apart, as real pipes are.
        const hz = frequency * pitch * Math.pow(2, (cents + (rank - 1) * 1.5) / 1200);
        // A sung note slides up into pitch (folk sections only).
        if (event.slide && begin - (music.zero + event.time) < 0.02) { pipe.frequency.setValueAtTime(hz * Math.pow(2, event.slide / 1200), begin); pipe.frequency.exponentialRampToValueAtTime(hz, begin + 0.2); } else pipe.frequency.value = hz;
        gain.gain.setValueAtTime(0, begin);
        gain.gain.linearRampToValueAtTime(peak, begin + Math.min(attack, (end - begin) * 0.5));
        gain.gain.setValueAtTime(peak, Math.max(begin + Math.min(attack, (end - begin) * 0.5) + 0.005, end - 0.02));
        gain.gain.linearRampToValueAtTime(0, end + 0.1);
        pipe.connect(gain); gain.connect(pan);
        pipe.start(begin); pipe.stop(end + 0.13);
      });
      // Flue pipes speak with a little breath of wind.
      if (event.length >= 0.2 && event.stops !== 'held' && !/Pedal$/.test(event.stops) && event.stops !== 'celeste' && begin - (music.zero + event.time) < 0.02) breath(ctx, pan, begin, 0.04, frequency * 3, 3, loudest * 0.3);
    }
    // The sounds of the place, on the same clock.
    const sounds = reel.sounds || [];
    while (music.nextSound < sounds.length && sounds[music.nextSound].time < horizon) {
      const event = sounds[music.nextSound++], at = music.zero + event.time;
      const begin = Math.max(ctx.currentTime + 0.01, at), end = at + event.length;
      // A short sound already under way when the film was joined is left out; a bed comes in where it is.
      if (end - begin < 0.05 || (event.kind !== 'bed' && begin - at > 0.03)) continue;
      SOUNDS[event.kind](ctx, event, begin, end);
    }
  }
  function musicLevel(seconds = 0.25) {
    if (!music.context) return;
    const now = music.context.currentTime, ambience = music.ambienceOn ? 1 : 0;
    music.master.gain.setTargetAtTime(soundOn() && film.running ? MASTER : 0, now, seconds / 3);
    music.organ.gain.setTargetAtTime(music.on ? 1 : 0, now, seconds / 3);
    music.ambience.gain.setTargetAtTime(ambience, now, seconds / 3); music.ambienceWet.gain.setTargetAtTime(ambience, now, seconds / 3);
    const bells = music.on || music.ambienceOn ? 1 : 0;
    music.bells.gain.setTargetAtTime(bells, now, seconds / 3); music.bellsWet.gain.setTargetAtTime(bells, now, seconds / 3);
  }

  /* ---------------------------------------------------------------- film */
  const film = { running: false, paused: false, time: 0, shot: null, before: null, church: null, layer: null, lastMove: 0, status: '', text: null, key: null, marks: [], points: [], live: null, states: [], dirty: false, rehearsing: false, livePainted: null,
    // The picture held for a dissolve: `of` is the scene it dissolves into, `want` the scene whose picture is being kept now.
    hold: { of: -1, want: -1 } };
  // What the next start plays: set by the buttons, used once.
  const wanted = { film: 'full', record: false, save: true };
  const byId = id => document.getElementById(id);

  function buildLayer() {
    if (film.layer) return film.layer;
    const layer = film.layer = document.createElement('div');
    layer.id = 'cinemaLayer'; layer.className = 'cinema-layer'; layer.hidden = true;
    layer.innerHTML = `<canvas class="cinema-hold" hidden></canvas><div class="cinema-vignette"></div><div class="cinema-marks"></div><div class="cinema-fade"></div>
<div class="cinema-chapter-card"><span></span><h2></h2></div>
<div class="cinema-bar cinema-bar-top"></div><div class="cinema-bar cinema-bar-bottom"></div>
<div class="cinema-card"><small></small><h1></h1><p></p><p class="cinema-second"></p><footer></footer></div>
<div class="cinema-caption" aria-live="polite"><span class="cinema-chapter"></span><strong></strong><em></em><p class="cinema-note"></p><p class="cinema-note cinema-note-vi"></p></div>
<div class="cinema-live"></div>
<div class="cinema-key"><div class="cinema-key-map"><strong></strong><em></em><div class="cinema-scale"></div><small></small></div><div class="cinema-key-mark"><i></i><span><b></b><em></em></span></div></div>
<div class="cinema-status" role="status"></div>
<div class="cinema-controls" role="toolbar" aria-label="Cinematic tour controls">
<button data-cinema="previous" title="Previous scene (←)" aria-label="Previous scene">⏮</button>
<button data-cinema="pause" title="Pause or play (Space)" aria-label="Pause or play">⏸</button>
<button data-cinema="next" title="Next scene (→)" aria-label="Next scene">⏭</button>
<button data-cinema="music" title="Organ music on or off (M)" aria-pressed="true">♪ Organ</button>
<button data-cinema="ambience" title="Sounds of the place on or off: birds, footsteps, crickets; the tower bell rings while the organ or the ambience is on (N)" aria-pressed="true">◌ Ambience</button>
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
      else if (action === 'ambience') setAmbience(!music.ambienceOn);
      else if (action === 'full') fullScreen();
      else if (action === 'stop') film.church.stopTour();
      else if (action === 'pause' || !action) {
        // A first click also unlocks sound when the browser held it back.
        if (soundOn() && music.context?.state === 'suspended' && !film.paused) void wake();
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
      put('exhaustFans', count(item => !!kind(item).fan?.exhaust));
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
        put('exhaustOn', exhaust.length); put('ach', flow / sim.room().V, 1);
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
    return (missing ? plain || '' : out).replace(/(^|[\s(])-(?=\d)/g, '$1−');
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
  /* ------------------------------------------------------ demonstrations
   * The live panel of a scene that has `demo`. Each step switches circuits
   * through the simulator's rehearsal (see the technical tours above), runs its
   * analysis again and reads the result, so that the numbers on screen are the
   * simulator's own for the switches as they are at that moment. A step is
   * applied from the base state when the scene starts or the film is moved
   * back, and one after another while the film plays.
   */
  const CIRCUIT_EN = { L1: 'Front three bays', L2: 'Rear four bays', L3: 'Sanctuary', L4: 'Circulation', LA: 'Roof uplight', LD: 'Column up/down lights', L5: 'Steps and paths', L8: 'Wings',
    L6: 'Façade and towers', L9: 'Entrance', L7: 'Festival exterior', L10: 'Statues and candles', E1: 'Exit signs',
    F1: 'Ceiling fans', F2: 'Wall fans', F3: 'Portable fans', F4: 'Entrance fans', F5: 'Wing wall fans', V1: 'Exhaust · front', V2: 'Exhaust · wings', V3: 'Exhaust · service',
    A1: 'Main loudspeakers', A2: 'Veranda', A3: 'Courtyard', A4: 'Choir monitors', A5: 'Rear fill', MIC: 'Microphones' };
  const CIRCUIT_VI = { L1: 'Ba gian đầu', L2: 'Bốn gian cuối', L3: 'Cung thánh', L4: 'Lối đi và hàng hiên', LA: 'Đèn hắt trần', LD: 'Đèn tường', L5: 'Bậc và lối đi', L8: 'Hai cánh',
    L6: 'Mặt tiền và tháp', L9: 'Sân khấu trước và cửa chính', L7: 'Đèn lễ hội ngoài trời', L10: 'Tượng và nến mặt tiền', E1: 'Đèn thoát hiểm',
    F1: 'Quạt trần', F2: 'Quạt tường', F3: 'Quạt di động', F4: 'Quạt lối vào', F5: 'Quạt tường hai cánh', V1: 'Quạt hút · hồi mặt tiền', V2: 'Quạt hút · hồi hai cánh', V3: 'Quạt hút · phòng kỹ thuật',
    A1: 'Loa chính và loa trễ', A2: 'Loa hàng hiên', A3: 'Loa sân', A4: 'Loa ca đoàn', A5: 'Loa phụ phía sau', MIC: 'Micro' };
  const SCENE_VI = { 'Full service · evening': 'Thánh lễ đầy đủ · buổi tối', 'Weekday Mass': 'Thánh lễ ngày thường', 'Prayer & adoration': 'Cầu nguyện và chầu Thánh Thể', 'Christmas & festivals': 'Giáng sinh và lễ hội',
    'Festival · courtyard overflow': 'Lễ hội · tràn ra sân', 'Cleaning': 'Dọn dẹp', 'Night security': 'An ninh ban đêm', 'All off': 'Tắt tất cả' };
  const SYSTEM_ROWS = { '@light': { en: 'Lighting', vi: 'Chiếu sáng', cat: 'light' }, '@fan': { en: 'Fans', vi: 'Quạt', cat: 'fan' }, '@sound': { en: 'Sound', vi: 'Âm thanh', cat: 'speaker' } };
  const SPEED_WORD = [['Low', 'Thấp'], ['Normal', 'Vừa'], ['High', 'Cao']];
  // The figures the live panel shows. `ok` marks a value that meets the project aim, as the simulator's own maps do.
  const STATS = {
    luxAvg: { en: 'Light on the books', vi: 'Độ rọi trên sách', unit: 'lux', digits: 0, aim: 'light', ok: v => v >= 200 },
    luxMin: { en: 'Darkest seat', vi: 'Chỗ tối nhất', unit: 'lux', digits: 0 },
    luxOk: { en: 'Seats at the aim', vi: 'Chỗ ngồi đạt mục tiêu', unit: '%', digits: 0 },
    kw: { en: 'Power drawn', vi: 'Công suất đang dùng', unit: 'kW', digits: 2 },
    kwh: { en: 'Energy per service', vi: 'Điện năng mỗi buổi lễ', unit: 'kWh', digits: 1 },
    kwLight: { en: 'Lighting power', vi: 'Công suất chiếu sáng', unit: 'kW', digits: 2 },
    kwFan: { en: 'Fan power', vi: 'Công suất quạt', unit: 'kW', digits: 2 },
    kwSound: { en: 'Sound power', vi: 'Công suất âm thanh', unit: 'kW', digits: 2 },
    kwDb1: { en: 'Load on DB-1', vi: 'Phụ tải DB-1', unit: 'kW', digits: 2 },
    kwDb2: { en: 'Load on DB-2', vi: 'Phụ tải DB-2', unit: 'kW', digits: 2 },
    amps: { en: 'Current at 230 V', vi: 'Dòng điện ở 230 V', unit: 'A', digits: 1 },
    ampsLight: { en: 'Lighting current', vi: 'Dòng điện chiếu sáng', unit: 'A', digits: 1 },
    ampsFan: { en: 'Fan current', vi: 'Dòng điện quạt', unit: 'A', digits: 1 },
    ampsDb2: { en: 'Current on DB-2', vi: 'Dòng điện trên DB-2', unit: 'A', digits: 1 },
    airAvg: { en: 'Air speed at the seats', vi: 'Tốc độ gió tại chỗ ngồi', unit: 'm/s', digits: 2, aim: ['Aim: 0.3 to 0.8', 'Mục tiêu: 0,3 đến 0,8'], ok: v => v >= 0.3 && v <= 0.8 },
    airOk: { en: 'Seats in the comfort band', vi: 'Chỗ ngồi trong khoảng dễ chịu', unit: '%', digits: 0 },
    wingAir: { en: 'Air speed in the wings', vi: 'Tốc độ gió ở hai cánh', unit: 'm/s', digits: 2, aim: ['Aim: 0.3 to 0.8', 'Mục tiêu: 0,3 đến 0,8'], ok: v => v >= 0.3 && v <= 0.8 },
    cool: { en: 'Cooling effect', vi: 'Hiệu quả làm mát', unit: '°C', digits: 1 },
    noise: { en: 'Noise at the seats', vi: 'Tiếng ồn tại chỗ ngồi', unit: 'dBA', digits: 1, aim: ['Aim: 40 or less', 'Mục tiêu: không quá 40'], ok: v => v <= 40 },
    ach: { en: 'Air changes per hour', vi: 'Số lần trao đổi không khí mỗi giờ', unit: '/h', digits: 1, aim: ['Aim: 4 to 6', 'Mục tiêu: 4 đến 6'], ok: v => v >= 4 && v <= 6 },
    flow: { en: 'Exhaust airflow', vi: 'Lưu lượng quạt hút', unit: 'm³/h', digits: 0, group: true },
    splAvg: { en: 'Speech level', vi: 'Mức âm lời nói', unit: 'dBA', digits: 1, aim: ['Aim: 68 to 76', 'Mục tiêu: 68 đến 76'], ok: v => v >= 68 && v <= 76 },
    stiAvg: { en: 'Speech clarity (STI)', vi: 'Độ rõ lời nói (STI)', unit: '', digits: 2, aim: ['Aim: 0.60 or more', 'Mục tiêu: từ 0,60'], ok: v => v >= 0.6 },
    stiOk: { en: 'Seats at STI 0.60', vi: 'Chỗ ngồi đạt STI 0,60', unit: '%', digits: 0 },
    fbLow: { en: 'Margin before feedback', vi: 'Dự trữ trước khi hú', unit: 'dB', digits: 1, aim: ['Aim: 3 or more', 'Mục tiêu: từ 3'], ok: v => v >= 3 }
  };
  const groups = value => String(value).replace(/\B(?=(\d{3})+$)/g, ',');
  const formatStat = (spec, value) => Number.isFinite(value) ? (spec.group ? groups(Math.round(value / 100) * 100) : value.toFixed(spec.digits)) : '–';
  const average = (list, key) => { const values = list.map(item => item[key]).filter(Number.isFinite); return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null; };

  // Everything the panel and the captions need, from the simulator as it is now.
  function measure(demo, step, previous) {
    const sim = window.CHURCH_SIMULATOR;
    sim.analysis.run(undefined, { now: true });
    const k = sim.analysis.results.seats || {}, power = sim.powerSummary(), settings = sim.state.settings;
    const list = power.byCircuit, watts = (test, key = 'watts') => list.filter(test).reduce((sum, c) => sum + c[key], 0);
    const cat = c => sim.CIRCUITS[c.circuit]?.cat, board = c => sim.CIRCUITS[c.circuit]?.board;
    // The aim for light is that of the scene while a scene was the last thing set; 200 lux otherwise.
    let aim = step.scene ? sim.sceneLuxTarget?.() : previous?.aim;
    if (aim === undefined || (aim === null && !step.scene)) aim = 200;
    const seats = k.seats || [], wing = k.blocks?.wing, running = sim.fans().filter(fan => fan.running);
    const exhaust = running.filter(fan => fan.kind === 'exhaust'), flow = exhaust.reduce((sum, fan) => sum + fan.flow, 0) * 3600;
    // Margins are updated only for microphones that are on, with a loudspeaker on.
    const margins = sim.speakers().some(speaker => speaker.on) ? sim.mics().filter(mic => mic.on).map(mic => mic.item.feedbackMargin).filter(Number.isFinite) : [];
    const kwDb2 = watts(c => board(c) === 'DB2') / 1000;
    const value = {
      luxAvg: k.lux?.avg, luxMin: k.lux?.min, luxOk: aim && seats.length ? 100 * seats.filter(seat => seat.lux >= aim).length / seats.length : null,
      kw: power.total / 1000, kwh: power.kWhService,
      kwLight: watts(c => cat(c) === 'light') / 1000, kwFan: watts(c => cat(c) === 'fan') / 1000, kwSound: watts(c => cat(c) === 'speaker') / 1000,
      kwDb1: watts(c => board(c) === 'DB1') / 1000, kwDb2,
      amps: power.amps, ampsLight: watts(c => cat(c) === 'light', 'amps'), ampsFan: watts(c => cat(c) === 'fan', 'amps'), ampsDb2: kwDb2 * 1000 / (230 * 0.9),
      airAvg: k.air?.avg, airOk: k.airOk, wingAir: wing?.air?.avg, naveAir: average(seats.filter(seat => seat.block !== 'wing'), 'air'), cool: k.cooling?.avg,
      noise: k.noise?.avg, ach: exhaust.length ? flow / sim.room().V : 0, flow: exhaust.length ? flow : 0,
      splAvg: k.spl?.avg, splSpread: k.splSpread, stiAvg: k.sti?.avg, stiOk: k.sti ? k.stiOk : null, fbLow: margins.length ? Math.min(...margins) : null, echo: k.echoSeats
    };
    const fed = settings.db2Feed !== false;
    const rows = (demo.rows || []).map(row => {
      if (row.setting) {
        const level = settings[row.setting] || 0;
        return { name: [row.en, row.vi], chip: [`${level > 0 ? '+' : level < 0 ? '−' : ''}${Math.abs(level)} ${row.unit}`, ''], tone: level ? 'on' : 'off' };
      }
      if (SYSTEM_ROWS[row]) {
        const system = SYSTEM_ROWS[row], mine = c => cat(c) === system.cat;
        return { name: [system.en, system.vi], chip: ['', ''], tone: 'system', watts: watts(mine), amps: watts(mine, 'amps') };
      }
      const circuit = list.find(c => c.circuit === row);
      if (!circuit) return null;
      const items = sim.state.items.filter(item => item.circuit === row && !item.hidden), lit = items.filter(item => item.on), type = lit[0] && sim.typeOf(lit[0]);
      let chip = ['On', 'Bật'], tone = 'on';
      if (!fed && board(circuit) === 'DB2') { chip = ['No power', 'Mất điện']; tone = 'dead'; }
      else if (!lit.length) { chip = ['Off', 'Tắt']; tone = 'off'; }
      else if (type?.fan) { const ratio = lit[0].speed / type.fan.speeds.length; chip = SPEED_WORD[ratio <= 0.4 ? 0 : ratio <= 0.8 ? 1 : 2]; }
      else if (type?.light && Number.isFinite(lit[0].dim) && lit[0].dim < 0.995) { const percent = `${Math.round(lit[0].dim * 100)} %`; chip = [percent, percent]; }
      const name = CIRCUIT_EN[row] || sim.CIRCUITS[row].label.replace(/^\w+ · /, '');
      return { id: row, name: [`${row} · ${name}`, CIRCUIT_VI[row] || ''], chip, tone, watts: circuit.watts, amps: circuit.amps, mcb: circuit.mcb };
    }).filter(Boolean);
    const say = step.say || (step.scene ? [step.scene, SCENE_VI[step.scene] || ''] : null);
    return { value, previous: previous?.value || null, aim, rows, say, scene: sim.state.scene, amps: Object.fromEntries(list.map(c => [c.circuit, c.amps])) };
  }
  // Figures of a state for the captions: its values, the change from the step before ({d_x}) and the value before ({p_x}).
  function stateFigures(state, settings) {
    const out = {};
    for (const [key, spec] of Object.entries(STATS)) {
      const value = state.value[key];
      if (!Number.isFinite(value)) continue;
      out[key] = formatStat(spec, value);
      const before = state.previous?.[key];
      if (Number.isFinite(before)) { out[`d_${key}`] = formatStat(spec, Math.abs(value - before)); out[`p_${key}`] = formatStat(spec, before); }
    }
    for (const key of ['splSpread', 'naveAir']) if (Number.isFinite(state.value[key])) out[key] = state.value[key].toFixed(key === 'naveAir' ? 2 : 1);
    if (Number.isFinite(state.value.echo)) out.echo = String(state.value.echo);
    if (Number.isFinite(state.aim)) out.luxAim = String(state.aim);
    if (Number.isFinite(settings?.serviceHours)) out.hours = String(settings.serviceHours);
    for (const [circuit, amps] of Object.entries(state.amps)) out[`A_${circuit}`] = amps.toFixed(1);
    return out;
  }
  const noteFor = (shot, step, state, language) => {
    const figures = { ...modelFigures(), ...(state ? stateFigures(state, window.CHURCH_SIMULATOR?.state.settings) : {}) };
    const vi = language === 'vi', text = (step?.note || shot.note)?.[language], plain = (step?.note ? step.plain : shot.plain)?.[language];
    return say(text, plain, figures, vi);
  };
  function applyStep(step) {
    const rehearsal = window.CHURCH_SIMULATOR.rehearsal;
    if (step.feeder !== undefined) rehearsal.feeder(step.feeder);
    if (step.scene) rehearsal.scene(step.scene);
    if (step.set) rehearsal.circuits(step.set);
    for (const [key, value] of Object.entries(step.setting || {})) rehearsal.setting(key, value);
  }
  // Brings the simulator and the panel to the step the film has reached in a scene. Returns true when the step changed.
  function followDemo(shot, local) {
    const sim = window.CHURCH_SIMULATOR, rehearsal = sim?.rehearsal;
    if (!rehearsal?.active) return false;
    if (!shot.demo) {
      // A scene without a demonstration shows the design as it is open.
      if (film.dirty) { rehearsal.reset(); film.dirty = false; film.live = null; sim.analysis?.run(undefined, { now: true }); return true; }
      return false;
    }
    const steps = shot.demo.steps || [];
    let target = 0;
    steps.forEach((step, index) => { if (local >= step.at) target = index; });
    const live = film.live;
    if (live && live.shot === shot && live.index === target) return false;
    const forward = live && live.shot === shot && live.index < target;
    if (!forward) { rehearsal.reset(); film.dirty = true; if (live?.shot !== shot) film.states = []; }
    for (let index = forward ? live.index + 1 : 0; index <= target; index++) {
      applyStep(steps[index]);
      // A step already measured is not measured again, except the one that stays on screen.
      if (index === target || !film.states[index]) film.states[index] = measure(shot.demo, steps[index], film.states[index - 1]);
    }
    film.live = Object.assign({ shot, index: target, begin: shot.start + steps[target].at }, film.states[target]);
    return true;
  }
  /* Every step of every demonstration of a tour, one after another against the
   * simulator that is open, with the figures and the explanation each one shows
   * and the figures it quotes but cannot read. For checks and for review: the
   * switches are put back when it ends. */
  function rehearseAll(id) {
    const tour = FILMS[id], sim = window.CHURCH_SIMULATOR, out = [];
    if (!tour?.technical || !sim?.rehearsal?.begin()) return null;
    try {
      for (const shot of tour.shots) {
        if (!shot.demo) continue;
        sim.rehearsal.reset();
        let previous = null;
        shot.demo.steps.forEach((step, index) => {
          applyStep(step);
          const state = measure(shot.demo, step, previous);
          previous = state;
          const figures = { ...modelFigures(), ...stateFigures(state, sim.state.settings) }, raw = step.note || shot.note;
          const missing = [...new Set([...`${raw?.en} ${raw?.vi}`.matchAll(/\{(\w+)\}/g)].map(match => match[1]))].filter(key => !(key in figures));
          out.push({ shot: shot.id, index, at: step.at, say: state.say, value: state.value, rows: state.rows, aim: state.aim, scene: state.scene,
            note: noteFor(shot, step, state, 'en'), noteVi: noteFor(shot, step, state, 'vi'), missing });
        });
      }
    } finally { sim.rehearsal.end(); }
    return out;
  }
  // Shown value of a figure of the panel at film time: it moves to its new value over a moment.
  function shownStat(state, key) {
    const spec = STATS[key], now = state.value[key], before = state.previous?.[key];
    if (!Number.isFinite(now)) return { text: '–', value: null, ok: null };
    const moving = Number.isFinite(before) ? smooth((film.time - state.begin) / 0.9) : 1;
    const shown = lerp(before ?? now, now, moving);
    const change = Number.isFinite(before) && Math.abs(now - before) >= 0.5 * 10 ** -spec.digits ? now - before : 0;
    return { text: formatStat(spec, shown), value: now, ok: spec.ok ? spec.ok(now) : null,
      change: change && moving > 0.2 ? `${change > 0 ? '+' : '−'}${formatStat(spec, Math.abs(change))}` : '' };
  }
  const aimOf = (spec, state) => spec.aim === 'light' ? (state.aim ? (state.aim === 200 ? [`Aim: ${state.aim} or more`, `Mục tiêu: từ ${state.aim}`] : [`Scene aim: ${state.aim} or more`, `Mục tiêu của chế độ: từ ${state.aim}`]) : ['', '']) : spec.aim || ['', ''];
  const wattText = value => value >= 1000 ? `${(value / 1000).toFixed(2)} kW` : `${Math.round(value)} W`;
  function buildLive() {
    const box = part('.cinema-live'), live = film.live, demo = live.shot.demo;
    const el = (tag, className, text) => Object.assign(document.createElement(tag), className ? { className } : {}, text !== undefined ? { textContent: text } : {});
    const head = el('header'); head.append(el('b', '', demo.title[0]), el('em', '', demo.title[1]));
    const action = el('p', 'cinema-live-say'); action.hidden = !live.say; if (live.say) action.append(el('b', '', live.say[0]), el('em', '', live.say[1]));
    const rows = el('div', 'cinema-live-rows');
    for (const row of live.rows) {
      const line = el('div', 'cinema-live-row'); line.dataset.tone = row.tone;
      const name = el('span', 'n'); name.append(el('b', '', row.name[0]), el('em', '', row.name[1]));
      const load = el('span', 'w', row.watts === undefined ? '' : wattText(row.watts));
      const current = el('span', 'a', row.amps === undefined ? '' : `${row.amps.toFixed(1)} A${demo.breaker && row.mcb ? ` · ${row.mcb} A` : ''}`);
      line.append(name, el('span', 's', row.chip[0]), load, current);
      rows.append(line);
    }
    const tiles = el('div', 'cinema-live-tiles');
    for (const key of demo.stats) {
      const spec = STATS[key], tile = el('div', 'cinema-live-tile'); tile.dataset.key = key;
      const aim = aimOf(spec, live);
      const number = el('strong'); number.append(el('span', 'v'), el('i', '', spec.unit));
      const label = el('span', 'l'); label.append(el('b', '', spec.en), el('em', '', spec.vi));
      tile.append(label, number, el('span', 'd'), el('small', '', aim[0]));
      tiles.append(tile);
    }
    const foot = el('p', 'cinema-live-foot', demo.foot ? demo.foot[viewVi() ? 1 : 0] : ''); foot.hidden = !demo.foot;
    box.replaceChildren(head, action, rows, tiles, foot);
    box.querySelector('.cinema-live-rows').hidden = !live.rows.length;
    box.dataset.legend = demo.breaker ? 'breaker' : '';
    film.livePainted = live;
  }
  function drawLive(visible) {
    const box = part('.cinema-live'), live = film.live;
    box.classList.toggle('visible', !!live && visible);
    if (!live) return;
    if (film.livePainted !== live) buildLive();
    for (const tile of box.querySelectorAll('.cinema-live-tile')) {
      const shown = shownStat(live, tile.dataset.key);
      tile.querySelector('.v').textContent = shown.text;
      tile.querySelector('.d').textContent = shown.change || '';
      tile.dataset.ok = String(shown.ok);
    }
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
      wiring.setReviewFilter({ system: shot.systems || 'all', circuit: 'all', item: 'all', board: shot.board || 'all' });
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
  const liveOf = shot => film.live?.shot === shot ? film.live : null;
  const stepNow = shot => liveOf(shot) ? shot.demo.steps[film.live.index] : null;
  // The explanation changes with the step of a demonstration.
  function refreshNote(shot) {
    film.text.note = noteFor(shot, stepNow(shot), liveOf(shot), 'en'); film.text.noteVi = noteFor(shot, stepNow(shot), liveOf(shot), 'vi');
    part('.cinema-note').textContent = film.text.note; part('.cinema-note-vi').textContent = film.text.noteVi;
  }
  function showShot(shot) {
    film.shot = shot;
    applyScene(shot);
    // A demonstration brings the simulator to its step before the figures of the scene are read.
    if (reel.technical) followDemo(shot, Math.max(0, film.time - shot.start));
    const chapter = reel.chapters[shot.chapter], figures = reel.technical ? modelFigures() : null, card = shot.card;
    const text = film.text = { chapter: viewVi() ? chapter.vi : chapter.en, en: shot.en || '', vi: shot.vi || '',
      note: reel.technical ? noteFor(shot, stepNow(shot), liveOf(shot), 'en') : shot.note?.en || '', noteVi: reel.technical ? noteFor(shot, stepNow(shot), liveOf(shot), 'vi') : shot.note?.vi || '',
      card: card ? { ...card, small: forView(card.small), title: forView(card.title), line: say(card.line, card.plain?.line, figures), second: say(card.second, card.plain?.second, figures, true),
        foot: (card.foot || []).map((line, i) => forView(say(line, card.plain?.foot?.[i], figures))).filter(Boolean) } : null };
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
    tape.fx.caption = tape.fx.card = tape.fx.chapter = tape.fx.note = 0;
    if (shot.opens) {
      // "II · Inside": the number above, the name below, in the language on screen.
      const [number, ...name] = text.chapter.split(' · ');
      text.chapterCard = { number, name: name.join(' · ') };
      part('.cinema-chapter-card span').textContent = number;
      part('.cinema-chapter-card h2').textContent = text.chapterCard.name;
    }
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
    else if (reel.technical && followDemo(p.shot, film.time - p.shot.start)) refreshNote(p.shot);
    camera.up.set(...p.up);
    camera.position.set(...p.eye);
    camera.lookAt(...p.look);
    if (Math.abs(camera.fov - p.lens) > 1e-3) { camera.fov = p.lens; camera.updateProjectionMatrix(); }
    // Kept current so that Explore continues from this exact view when the film stops.
    controls.target.set(...p.look);
    const on = showing(p.shot, film.time - p.shot.start), black = blackAt(film.time);
    layer.querySelector('.cinema-fade').style.opacity = black.toFixed(3);
    // A dissolve: the held last picture of the scene before, fading out over this one.
    const held = film.hold.of === p.shot.index ? heldAt(film.time) : 0, hold = part('.cinema-hold');
    hold.hidden = held <= 0.002;
    if (!hold.hidden) hold.style.opacity = held.toFixed(3);
    // While the end of a scene that dissolves into the next is drawn, each frame is kept (see rendered).
    const next = reel.shots[p.shot.index + 1];
    film.hold.want = next?.cut === 'dissolve' && p.shot.start + p.shot.duration - film.time < 0.5 ? next.index : -1;
    part('.cinema-card').classList.toggle('visible', on.card);
    part('.cinema-chapter-card').classList.toggle('visible', on.chapter);
    part('.cinema-caption').classList.toggle('visible', on.caption);
    part('.cinema-caption').classList.toggle('noted', on.note);
    drawLive(on.caption && black < 0.5 && !on.card);
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
    const blocked = soundOn() && film.running && !film.paused && music.context?.state === 'suspended' && performance.now() - music.waking > 1500;
    const text = tape.on ? '● Recording · keep this window in front until the film ends' : tape.error ? tape.error : film.paused ? 'Paused · Space to continue' : blocked ? 'Click once to switch the sound on' : !music.context && soundOn() ? 'This browser has no sound output for the organ music' : '';
    const signature = `${text}|${film.paused}|${music.on}|${music.ambienceOn}|${tape.on}`;
    if (signature === film.status) return;
    film.status = signature;
    part('.cinema-status').textContent = text;
    part('[data-cinema="pause"]').textContent = film.paused ? '▶' : '⏸';
    part('[data-cinema="music"]').setAttribute('aria-pressed', String(music.on));
    part('[data-cinema="ambience"]').setAttribute('aria-pressed', String(music.ambienceOn));
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
    film.key = null; film.marks = []; film.points = []; film.live = null; film.states = []; film.dirty = false; film.livePainted = null;
    film.hold = { of: -1, want: -1 };
    film.layer.classList.toggle('feature', !reel.technical);
    film.layer.classList.toggle('no-ambience', !reel.sounds?.length);
    // The switches of a technical tour are borrowed from the simulator and given back when it ends.
    film.rehearsing = !!(reel.technical && sim?.rehearsal?.begin());
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
    // The borrowed switches, the scene and the feeder go back first.
    if (film.rehearsing) { window.CHURCH_SIMULATOR.rehearsal.end(); film.rehearsing = false; }
    film.live = null; film.states = []; film.dirty = false; film.livePainted = null;
    film.layer.querySelector('.cinema-live')?.classList.remove('visible');
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
    film.hold = { of: -1, want: -1 };
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
    if (soundOn() && music.context?.state === 'suspended' && !film.paused) void wake();
    musicLevel(0.3); status();
  }
  function setAmbience(value) {
    music.ambienceOn = !!value;
    if (soundOn() && music.context?.state === 'suspended' && !film.paused) void wake();
    musicLevel(0.3); status();
  }
  function fullScreen() {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }
  function keys(event) {
    if (!film.running || document.querySelector('dialog[open]')) return;
    const action = tape.on ? { Escape: () => film.church.stopTour() }[event.code] : { Space: () => setPaused(!film.paused), ArrowRight: () => skip(1), ArrowLeft: () => skip(-1), KeyM: () => setMusic(!music.on), KeyN: () => setAmbience(!music.ambienceOn), KeyF: fullScreen, Escape: () => film.church.stopTour() }[event.code];
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
  const tape = { on: false, canvas: null, g: null, recorder: null, chunks: [], type: '', ratio: 0, fx: { caption: 0, note: 0, card: 0, chapter: 0, key: 0, live: 0 }, last: 0, result: null, save: true, error: '' };
  const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', SERIF = 'Georgia, "Times New Roman", serif';
  function tapeCanvas() {
    if (!tape.canvas) {
      tape.canvas = Object.assign(document.createElement('canvas'), { width: VIDEO.width, height: VIDEO.height });
      tape.g = tape.canvas.getContext('2d');
    }
    tape.g.fillStyle = '#000'; tape.g.fillRect(0, 0, VIDEO.width, VIDEO.height);
    tape.fx.caption = tape.fx.note = tape.fx.card = tape.fx.chapter = tape.fx.key = tape.fx.live = 0; tape.last = 0;
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
  function paintCaption(g, text, alpha, noteAlpha = alpha) {
    const W = VIDEO.width, H = VIDEO.height, x = 96, width = 1080;
    const rows = [];
    const row = (value, font, height, colour, spacing = '0px') => {
      if (!value) return;
      g.font = font; g.letterSpacing = spacing;
      for (const line of wrap(g, value, width)) rows.push({ line, font, height, colour, spacing });
    };
    row(text.chapter.toUpperCase(), `600 21px ${SANS}`, 38, '#e6cf93', '5px');
    const vi = viewVi();
    row(vi ? '' : text.en, `400 66px ${SERIF}`, 78, '#f6f2e6');
    row(vi ? text.vi : '', `italic 400 37px ${SANS}`, 52, '#f6f2e6');
    if (text.note) rows.push({ gap: 12 });
    const notes = rows.length;
    row(vi ? '' : text.note, `400 32px ${SANS}`, 45, '#f6f2e6ee');
    row(vi ? text.noteVi : '', `400 29px ${SANS}`, 41, '#f6f2e6cc');
    rows.slice(notes).forEach(r => { r.note = true; });
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
      g.globalAlpha = alpha * (r.note ? Math.min(1, noteAlpha / Math.max(alpha, 1e-3)) : 1);
      g.fillText(r.line, x, y + (r.height - parseInt(r.font.match(/(\d+)px/)[1], 10)) / 2);
      y += r.height;
    }
    g.restore();
  }
  // The chapter's number and name, centred, as the chapter opens.
  function paintChapter(g, card, alpha) {
    const W = VIDEO.width, H = VIDEO.height;
    g.save(); g.globalAlpha = alpha;
    // Dark enough behind the words to read them over white stone in daylight.
    const shade = g.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, W * 0.4);
    shade.addColorStop(0, 'rgba(0,0,0,.66)'); shade.addColorStop(0.55, 'rgba(0,0,0,.4)'); shade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.9)'; g.shadowBlur = 24;
    g.font = `400 44px ${SERIF}`; g.letterSpacing = '18px'; g.fillStyle = '#e6cf93'; g.fillText(card.number, W / 2 + 9, H / 2 - 66);
    g.fillStyle = '#d9b96a'; g.shadowBlur = 0; g.fillRect(W / 2 - 40, H / 2 - 30, 80, 3); g.shadowBlur = 24;
    g.font = `400 96px ${SERIF}`; g.letterSpacing = '3px'; g.fillStyle = '#f6f2e6'; g.fillText(card.name, W / 2, H / 2 + 36);
    g.restore();
  }
  // A soft darkening toward the corners of the picture, as a lens gives.
  function paintVignette(g) {
    const W = VIDEO.width, H = VIDEO.height, shade = tape.vignette ||= (() => {
      const v = g.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, W * 0.62);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.30)');
      return v;
    })();
    g.fillStyle = shade; g.fillRect(0, 0, W, H);
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
    row(viewVi() ? '' : card.line, `400 40px ${SANS}`, 58, '1px', 22);
    row(viewVi() ? card.second : '', `400 36px ${SANS}`, 52, '0.5px', 16);
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
    const vi = viewVi();
    const row = (value, font, height, colour) => { if (!value) return; g.font = font; for (const line of wrap(g, value, width)) rows.push({ line, font, height, colour }); };
    if (key.map) {
      row(vi ? '' : key.map.en, `600 27px ${SANS}`, 38, '#f6f2e6'); row(vi ? key.map.vi : '', `italic 400 24px ${SANS}`, 34, '#f6f2e6dd');
      rows.push({ scale: key.map.stops, height: 74 });
      row(key.map.aim, `400 22px ${SANS}`, 32, '#e6cf93');
    }
    if (key.map && key.mark) rows.push({ height: 14 });
    if (key.mark) {
      if (!vi) rows.push({ line: key.mark.en, font: `600 25px ${SANS}`, height: 36, colour: '#f6f2e6', ring: true, inset: 44 });
      if (vi) rows.push({ line: key.mark.vi, font: `italic 400 23px ${SANS}`, height: 32, colour: '#f6f2e6dd', inset: 44 });
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
  // The live panel of a demonstration at the upper right of the recorded picture.
  function paintLive(g, live, alpha) {
    const W = VIDEO.width, width = 640, right = W - 80, left = right - width, demo = live.shot.demo, pad = 22, rowH = 44, tileH = 52;
    const tones = { on: '#9fdc8f', off: '#f6f2e699', dead: '#ff8a7a', system: '#f6f2e6', neutral: '#f6f2e6' };
    const foot = demo.foot ? (g.font = `400 16px ${SANS}`, wrap(g, demo.foot[viewVi() ? 1 : 0], width - 2 * pad)) : [];
    const height = pad + 40 + (live.say ? 54 : 0) + live.rows.length * rowH + (live.rows.length ? 8 : 0) + demo.stats.length * tileH + (foot.length ? foot.length * 21 + 8 : 0) + pad;
    const top = 126;
    g.save(); g.globalAlpha = alpha; g.textBaseline = 'top'; g.textAlign = 'left'; g.letterSpacing = '0px';
    g.fillStyle = 'rgba(13,18,16,.8)'; g.fillRect(left, top, width, height);
    g.fillStyle = '#d9b96a'; g.fillRect(left, top, 4, height);
    const x = left + pad + 4, inner = width - 2 * pad - 4;
    let y = top + pad - 4;
    g.font = `600 27px ${SANS}`; g.fillStyle = '#e6cf93'; g.fillText(demo.title[0], x, y);
    const titleWidth = g.measureText(demo.title[0]).width;
    g.font = `italic 400 20px ${SANS}`; g.fillStyle = '#f6f2e6cc'; g.fillText(demo.title[1], x + titleWidth + 16, y + 5);
    y += 40;
    if (live.say) {
      g.font = `700 25px ${SANS}`; g.fillStyle = '#ffe9a8'; g.fillText(live.say[0], x, y);
      g.font = `italic 400 20px ${SANS}`; g.fillStyle = '#f6f2e6ee'; g.fillText(live.say[1], x, y + 28);
      y += 54;
    }
    for (const row of live.rows) {
      if (!viewVi()) { g.font = `500 21px ${SANS}`; g.fillStyle = '#f6f2e6'; g.fillText(row.name[0], x, y); }
      else { g.font = `italic 400 16px ${SANS}`; g.fillStyle = '#f6f2e6b3'; g.fillText(row.name[1], x, y); }
      g.font = `600 19px ${SANS}`; g.fillStyle = tones[row.tone] || tones.neutral; g.fillText(row.chip[0], x + 330, y + 2);
      g.textAlign = 'right'; g.font = `400 19px ${SANS}`; g.fillStyle = '#f6f2e6e6';
      if (row.watts !== undefined) g.fillText(wattText(row.watts), x + inner - (demo.breaker ? 112 : 70), y + 2);
      if (row.amps !== undefined) g.fillText(`${row.amps.toFixed(1)} A${demo.breaker && row.mcb ? ` · ${row.mcb} A` : ''}`, x + inner, y + 2);
      g.textAlign = 'left';
      y += rowH;
    }
    if (live.rows.length) { g.fillStyle = 'rgba(246,242,230,.2)'; g.fillRect(x, y - 4, inner, 1); y += 8; }
    for (const key of demo.stats) {
      const spec = STATS[key], shown = shownStat(live, key), aim = aimOf(spec, live);
      if (!viewVi()) { g.font = `500 20px ${SANS}`; g.fillStyle = '#e6cf93'; g.fillText(spec.en, x, y); }
      else { g.font = `italic 400 16px ${SANS}`; g.fillStyle = '#f6f2e6b3'; g.fillText(spec.vi, x, y); }
      g.textAlign = 'right';
      g.font = `700 34px ${SANS}`; g.fillStyle = shown.ok === null ? '#f6f2e6' : shown.ok ? '#9fdc8f' : '#f2b869';
      const unit = spec.unit ? ` ${spec.unit}` : '';
      g.font = `400 19px ${SANS}`; const unitWidth = g.measureText(unit).width;
      g.font = `700 34px ${SANS}`; g.fillText(shown.text, x + inner - unitWidth, y - 4);
      g.font = `400 19px ${SANS}`; g.fillStyle = '#f6f2e6cc'; g.fillText(unit, x + inner, y + 8);
      if (shown.change) { g.font = `600 19px ${SANS}`; g.fillStyle = '#ffd76a'; g.fillText(shown.change, x + inner - unitWidth - 150, y + 6); }
      if (aim[0]) { g.font = `400 14px ${SANS}`; g.fillStyle = '#e6cf93cc'; g.fillText(aim[0], x + inner, y + 34); }
      g.textAlign = 'left';
      y += tileH;
    }
    if (foot.length) { g.font = `400 16px ${SANS}`; g.fillStyle = '#e6cf93'; foot.forEach((line, i) => g.fillText(line, x, y + 4 + i * 21)); }
    g.restore();
  }
  function ring(g, x, y, radius) {
    g.beginPath(); g.arc(x, y, radius, 0, 2 * Math.PI);
    g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.6)'; g.stroke();
    g.lineWidth = 3; g.strokeStyle = '#ffd76a'; g.stroke();
  }
  // The viewer calls this straight after it has drawn a frame of the film.
  function rendered(source) {
    if (!film.running) return;
    keep(source);
    if (tape.on) paint(source);
  }
  // Copy the frame just drawn into the dissolve's canvas while the end of a scene that dissolves is on screen.
  function keep(source) {
    if (film.hold.want < 0 || !source.width) return;
    const canvas = part('.cinema-hold');
    if (canvas.width !== source.width || canvas.height !== source.height) { canvas.width = source.width; canvas.height = source.height; }
    canvas.getContext('2d').drawImage(source, 0, 0);
    film.hold.of = film.hold.want;
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
    keep(church.renderer.domElement);
    paint(church.renderer.domElement);
    return tape.canvas;
  }
  function paint(source) {
    const g = tape.g, W = VIDEO.width, H = VIDEO.height, target = W / H;
    let w = source.width, h = w / target;
    if (h > source.height) { h = source.height; w = h * target; }
    g.drawImage(source, (source.width - w) / 2, (source.height - h) / 2, w, h, 0, 0, W, H);
    const p = pose(film.time), on = showing(p.shot, film.time - p.shot.start);
    const held = film.hold.of === p.shot.index ? heldAt(film.time) : 0, hold = part('.cinema-hold');
    if (held > 0.002 && hold.width === source.width && hold.height === source.height) {
      g.globalAlpha = held; g.drawImage(hold, (source.width - w) / 2, (source.height - h) / 2, w, h, 0, 0, W, H); g.globalAlpha = 1;
    }
    if (!reel.technical) paintVignette(g);
    // Text fades in and out, except in the film's first moments, where it is simply there.
    const step = film.time < 0.3 ? 1 : Math.min(1, Math.abs(film.time - tape.last) / 0.4); tape.last = film.time;
    tape.fx.caption += ((on.caption ? 1 : 0) - tape.fx.caption) * step;
    tape.fx.note += ((on.note ? 1 : 0) - tape.fx.note) * step;
    tape.fx.card += ((on.card ? 1 : 0) - tape.fx.card) * step;
    tape.fx.chapter += ((on.chapter ? 1 : 0) - tape.fx.chapter) * step;
    // Rings on the marked fittings, in the cropped picture and under the fades.
    for (const [x, y] of film.points) {
      const px = ((x + 1) / 2 * source.width - (source.width - w) / 2) / w * W, py = ((1 - y) / 2 * source.height - (source.height - h) / 2) / h * H;
      if (px > 0 && px < W && py > 0 && py < H) ring(g, px, py, 15);
    }
    const black = blackAt(film.time), keyed = !!(film.key?.map || film.key?.mark) && black < 0.5 && !on.card;
    tape.fx.key += ((keyed ? 1 : 0) - tape.fx.key) * step;
    if (black > 0.004) { g.globalAlpha = black; g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
    const shown = !!film.live && on.caption && black < 0.5 && !on.card;
    tape.fx.live += ((shown ? 1 : 0) - tape.fx.live) * step;
    if (tape.fx.key > 0.01 && film.key) paintKey(g, film.key, tape.fx.key);
    if (tape.fx.live > 0.01 && film.live) paintLive(g, film.live, tape.fx.live);
    if (tape.fx.caption > 0.01 && film.text?.en) paintCaption(g, film.text, tape.fx.caption, tape.fx.note);
    if (tape.fx.chapter > 0.01 && film.text?.chapterCard) paintChapter(g, film.text.chapterCard, tape.fx.chapter);
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
    const read = meter => {
      const data = new Float32Array(meter.fftSize);
      meter.getFloatTimeDomainData(data);
      let squares = 0, peak = 0;
      for (const v of data) { squares += v * v; peak = Math.max(peak, Math.abs(v)); }
      const dB = v => +(20 * Math.log10(Math.max(v, 1e-6))).toFixed(1);
      return { rmsDbfs: dB(Math.sqrt(squares / data.length)), peakDbfs: dB(peak) };
    };
    // The whole mix, and the sounds of the place alone (before the master level and the echo).
    return { ...read(music.meter), ambience: read(music.ambienceMeter) };
  }

  // The technical tours' buttons in the Discover menu name their film.
  for (const button of document.querySelectorAll?.('[data-film]') || []) button.addEventListener('click', () => play(button.dataset.film));

  window.CHURCH_CINEMA = {
    start, stop, frame, rendered, still, play, pose, black: blackAt, held: heldAt, seek, skip, audit, setPaused, setMusic, setAmbience, musicOutput, showing, figures: modelFigures, maps: MAPS, wires: WIRES,
    shots: SHOTS, score, sounds: FILMS.full.sounds, films: FILMS,
    get length() { return FILMS.full.length; },
    get video() { return tape.result; },
    stats: STATS, rehearseAll,
    state: () => ({ running: film.running, paused: film.paused, film: reel.id, time: film.time, shot: film.shot?.id || null, music: music.on,
      sound: music.context?.state || 'none', length: reel.length, recording: tape.on, recordingError: tape.error,
      // The step of a demonstration on screen: its action, scene, figures and rows.
      live: film.live && { shot: film.live.shot.id, index: film.live.index, say: film.live.say, scene: film.live.scene, aim: film.live.aim, value: film.live.value, rows: film.live.rows.map(row => ({ name: row.name[0], chip: row.chip[0], tone: row.tone })) },
      rehearsing: film.rehearsing })
  };
})();
