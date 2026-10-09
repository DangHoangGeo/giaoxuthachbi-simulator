// Single source for the Vietnamese quick-start guide: the web page (index.html) and the
// video (scripts/father_guide/build.sh) are both generated from these scenes.
// Sentences are both the spoken narration and the on-screen captions: **bold** marks a button or file name.
// Screenshot coordinates are in the source image's own pixels (1920 x 1080).
window.GUIDE = {
  repoUrl: 'github.com/DangHoangGeo/giaoxuthachbi-simulator',
  viewerPath: 'giaoxuthachbi-simulator-dev / Thach_Bi_Viewer / OPEN_CHURCH.html',
  steps: {
    0: 'Giới thiệu',
    1: 'Bước 1 · Mở trang dự án',
    2: 'Bước 2 · Tải tệp ZIP',
    3: 'Bước 3 · Giải nén',
    4: 'Bước 4 · Mở mô hình',
    5: 'Bước 5 · Khám phá mô hình 3D',
    6: 'Tranh minh họa đề xuất',
    7: 'Lưu ý',
  },
  scenes: [
    { id: 'intro', step: 0, kind: 'cover', bg: 'assets/cover.jpg',
      title: 'Xem mô hình 3D nhà thờ Thạch Bi', sub: 'Hướng dẫn từng bước cho Cha · 5 bước · không cần cài phần mềm',
      sentences: [
        'Kính chào Cha.',
        'Đây là video hướng dẫn ngắn, giúp Cha tải về và xem mô hình 3D của nhà thờ Thạch Bi ngay trên máy tính.',
        'Chỉ cần năm bước, không phải cài thêm phần mềm nào.'] },

    { id: 's1', step: 1, kind: 'browser', img: 'assets/gh-repo.jpg', url: 'github.com/DangHoangGeo/giaoxuthachbi-simulator',
      urlSpot: true,
      sentences: [
        'Bước một: mở trình duyệt **Chrome** hoặc **Edge**.',
        'Gõ địa chỉ đang hiện trên màn hình rồi nhấn Enter.',
        'Đây là trang lưu toàn bộ dự án.'] },

    { id: 's2a', step: 2, kind: 'browser', img: 'assets/gh-repo.jpg', url: 'github.com/DangHoangGeo/giaoxuthachbi-simulator',
      spots: [{ rect: [1141, 259, 121, 44], label: 'Bấm nút Code', side: 'below' }],
      sentences: [
        'Bước hai: bấm vào nút màu xanh lá có chữ **Code**.',
        'Nút này nằm phía trên bên phải danh sách tệp.'] },

    { id: 's2b', step: 2, kind: 'browser', img: 'assets/gh-code-menu.jpg', url: 'github.com/DangHoangGeo/giaoxuthachbi-simulator',
      spots: [{ rect: [868, 536, 376, 40], label: 'Bấm Download ZIP', side: 'left' }],
      sentences: [
        'Một bảng nhỏ hiện ra.',
        'Bấm vào dòng **Download ZIP**, nghĩa là tải tệp nén.',
        'Tệp khá nặng, khoảng 500 megabyte, nên Cha hãy tải khi mạng tốt và chờ vài phút.'] },

    { id: 's3', step: 3, kind: 'extract',
      sentences: [
        'Bước ba: tìm tệp vừa tải trong thư mục Downloads, tức là Tải xuống.',
        'Trên máy Mac, nhấp đúp vào tệp để giải nén.',
        'Trên máy Windows, bấm chuột phải, chọn **Extract All**, rồi bấm **Extract**.',
        'Xin nhớ: phải giải nén ra thư mục. Đừng mở trực tiếp bên trong tệp ZIP.'] },

    { id: 's4', step: 4, kind: 'folder',
      sentences: [
        'Bước bốn: mở thư mục vừa giải nén, rồi vào thư mục **Thach_Bi_Viewer**.',
        'Nhấp đúp vào tệp **OPEN_CHURCH.html**.',
        'Tệp sẽ mở bằng trình duyệt. Chờ vài giây để nhà thờ hiện ra.',
        'Mô hình chạy ngay trên máy, không cần internet.'] },

    { id: 's5a', step: 5, kind: 'clip', clip: 'clips/orbit.mp4', poster: 'assets/orbit.jpg',
      labels: [{ text: 'Kéo chuột trái: xoay · Lăn chuột: phóng to, thu nhỏ · Chuột phải: dịch chuyển', x: 240, y: 112 }],
      sentences: [
        'Bước năm: khám phá mô hình.',
        'Giữ chuột trái và kéo để xoay quanh nhà thờ.',
        'Lăn con lăn chuột để phóng to hoặc thu nhỏ.',
        'Giữ chuột phải và kéo để dịch chuyển.'] },

    { id: 's5b', step: 5, kind: 'app', img: 'assets/v-start.jpg',
      spots: [{ rect: [26, 392, 156, 50], label: 'Go inside: đi vào trong', side: 'right' },
              { rect: [22, 148, 164, 232], label: 'Chọn nơi muốn đến', side: 'right', dy: -70 }],
      sentences: [
        'Bấm nút **Go inside**, nghĩa là đi vào bên trong.',
        'Hoặc chọn nơi muốn đến ở bảng **Discover** bên trái, như **Nave** là gian giữa, **Sanctuary** là cung thánh.'] },

    { id: 's5c', step: 5, kind: 'clip', clip: 'clips/walk.mp4', poster: 'assets/walk.jpg',
      labels: [{ text: 'W A S D hoặc phím mũi tên: đi · Kéo chuột: nhìn quanh · Esc: thoát', x: 240, y: 112 }],
      sentences: [
        'Dùng các phím W, A, S, D hoặc phím mũi tên để đi.',
        'Kéo chuột để nhìn quanh.',
        'Nhấn phím Esc để thoát chế độ đi bộ.'] },

    { id: 's5g', step: 5, kind: 'app', img: 'assets/v-settings.jpg',
      spots: [{ rect: [1856, 21, 37, 37], label: 'Settings: cài đặt', side: 'left' },
              { rect: [1625, 177, 251, 38], label: 'Day: ban ngày · Evening: buổi tối', side: 'left' }],
      sentences: [
        'Muốn đổi giữa ban ngày và ban đêm, bấm nút **Settings** hình thanh trượt ở góc trên bên phải.',
        'Trong mục **Atmosphere**, chọn **Day** là ban ngày, hoặc **Evening** là buổi tối.'] },

    { id: 's5i', step: 5, kind: 'compare',
      imgs: [{ src: 'assets/v-start.jpg', label: 'Day · ban ngày' }, { src: 'assets/v-evening.jpg', label: 'Evening · buổi tối' }],
      sentences: [
        'Đây là cùng một nơi: bên trái là ban ngày, bên phải là buổi tối.',
        'Ban đêm, đèn bên trong và bên ngoài nhà thờ sẽ sáng lên.'] },

    { id: 's5j', step: 5, kind: 'app', cap: 'top', img: 'assets/v-settings.jpg',
      spots: [{ rect: [1625, 787, 251, 36], label: 'Seating layout: số khối ghế', side: 'left' }],
      sentences: [
        'Kéo xuống mục **Seating layout** để chọn số cột ghế.',
        '**2 blocks** là hai khối ghế dài. **4 blocks** là bốn khối ghế ngắn.'] },

    { id: 's5h', step: 5, kind: 'compare',
      imgs: [{ src: 'assets/v-plan2.jpg', label: '2 blocks · 2 khối ghế dài' }, { src: 'assets/v-plan4.jpg', label: '4 blocks · 4 khối ghế ngắn' }],
      sentences: [
        'Hình nhìn từ trên xuống, đã tắt mái bằng mục **Show roof**.',
        'Hai cách xếp ghế chỉ là đề xuất để so sánh.'] },

    { id: 's5l', step: 5, kind: 'app', cap: 'top', img: 'assets/v-start.jpg',
      spots: [{ rect: [650, 990, 620, 70], label: 'Các số ước tính', side: 'above' },
              { rect: [20, 843, 168, 217], label: 'Mức ồn và âm thanh', side: 'right' }],
      sentences: [
        'Dải số ở giữa phía dưới cho biết các ước tính của mô hình.',
        '**Book light** là độ sáng trên trang sách, tính bằng lux. **Clarity** là độ rõ của tiếng nói, càng gần 1 càng rõ.',
        '**Speech** và **Noise** là mức tiếng nói và tiếng ồn. **Air** là tốc độ gió của quạt. **Equipment power** là công suất thiết bị.',
        'Số màu cam hoặc đỏ là nằm ngoài mục tiêu thiết kế. Khi Cha đi bộ, dải này đổi thành số liệu tại chỗ Cha đứng.'] },

    { id: 's5k', step: 5, kind: 'app', cap: 'top', img: 'assets/v-controls.jpg',
      spots: [{ rect: [1676, 575, 224, 485], label: 'Controls: điều khiển nhanh', side: 'left', dy: -120 }],
      sentences: [
        'Ở góc dưới bên phải có bảng **Controls**, gồm các nút điều khiển nhanh.',
        'Thẻ **Scenes** đặt đèn, quạt và âm thanh cùng lúc. Ví dụ **Weekday Mass** là lễ ngày thường, **Prayer & adoration** là cầu nguyện và chầu.',
        'Các thẻ **DB-1**, **Towers**, **Fans**, **Sound** bật tắt từng nhóm: bảng điện, tháp chuông, quạt và âm thanh.',
        'Bảng này chỉ điều khiển trong mô hình, không điều khiển thiết bị thật.'] },

    { id: 's5d', step: 5, kind: 'app', img: 'assets/v-simulator.jpg',
      spots: [{ rect: [1586, 17, 104, 46], label: 'Simulator', side: 'below' },
              { rect: [18, 92, 378, 738], label: 'Bật tắt từng thiết bị', side: 'right', dy: 120 }],
      sentences: [
        'Nút **Simulator** ở góc trên bên phải mở bảng mô phỏng đèn, quạt, âm thanh và điện.',
        'Cha có thể bật tắt từng thiết bị để xem.',
        'Mọi thay đổi chỉ lưu trong trình duyệt của máy Cha, không ảnh hưởng đến dự án trên GitHub.',
        'Các con số chỉ là ước tính để nghiên cứu thiết kế.'] },

    { id: 's5e', step: 5, kind: 'app', img: 'assets/v-start.jpg',
      spots: [{ rect: [26, 442, 156, 82], label: 'Phim giới thiệu', side: 'right' }],
      sentences: [
        'Trong bảng **Discover** còn có **Cinematic tour**: bộ phim năm phút đi quanh và vào trong nhà thờ, kèm nhạc đàn organ.'] },

    { id: 's5f', step: 5, kind: 'clip', clip: 'clips/tour.mp4', poster: 'assets/tour.jpg',
      sentences: [
        '**Short film** là bản ngắn, hai phút mười lăm giây.',
        'Nhấn phím cách để tạm dừng, phím Esc để dừng phim.'] },

    { id: 's6a', step: 6, kind: 'app', img: 'assets/v-start.jpg',
      spots: [{ rect: [1700, 20, 104, 40], label: 'References: hình minh họa', side: 'below' }],
      sentences: [
        'Phần cuối: tranh minh họa đề xuất.',
        'Bấm nút **References** để xem các hình minh họa kiến trúc.'] },

    { id: 's6b', step: 6, kind: 'app', img: 'assets/v-references.jpg',
      sentences: [
        'Đó là những hình do máy tạo ra từ mô hình, để hình dung vật liệu, ánh sáng và chi tiết chạm khắc.'] },

    { id: 's6c', step: 6, kind: 'browser', img: 'assets/gallery.jpg',
      url: 'Thach_Bi_Viewer / references / 00-overview / 2026-10-07 / index.html', local: true,
      sentences: [
        'Muốn xem đủ mười sáu góc nhìn, nét hơn, hãy mở tệp **index.html** trong thư mục **references**, **00-overview**, **2026-10-07**.',
        'Đây là hình minh họa thiết kế, không phải ảnh chụp công trình.'] },

    { id: 'outro', step: 7, kind: 'outro',
      sentences: [
        'Xin nhắc Cha: mô hình và hình minh họa chỉ là bản nghiên cứu thiết kế, đang phát triển.',
        'Chưa dùng để thi công. Kích thước và kết cấu thực tế luôn theo bản vẽ và kỹ sư.',
        'Cha thấy chỗ nào chưa đúng ý nhà thờ, xin góp ý để chỉnh lại.',
        'Xin cảm ơn Cha.'] },
  ],
};
