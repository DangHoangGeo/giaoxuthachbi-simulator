# Hướng dẫn xem hệ thống điện trong mô hình 3D

Dành cho cha xứ và kỹ sư địa phương · 9/10/2026 · [English version](electrical-inspection-guide.md)

Tài liệu này chỉ cách xem từng đèn, quạt, loa, micro, ổ cắm và từng tuyến dây trong mô hình nhà thờ, theo từng hệ thống. Không cần cài phần mềm nào.

**Mô hình là gì.** Đây là công cụ phát triển thiết kế. Vị trí, tuyến dây và con số là đề xuất và ước tính để trao đổi. **Đây không phải bản vẽ thi công hay bản vẽ đi dây đã được duyệt.** Mô hình không điều khiển thiết bị thật. Tiết diện cáp, aptomat, nguồn cấp và mọi liên kết vẫn cần kỹ sư điện và kỹ sư kết cấu có trách nhiệm kiểm tra.

Tên nút trên màn hình là tiếng Anh; tài liệu này giữ nguyên tên đó (in đậm) để dễ tìm.

## 1. Mở mô hình

1. Dùng máy tính để bàn hoặc laptop, trình duyệt Chrome hoặc Edge. Không cần internet.
2. Mở thư mục `Thach_Bi_Viewer`, nhấp đúp **`OPEN_CHURCH.html`**. Chờ nhà thờ hiện ra.
3. **Explore** (giữa, phía trên): xoay nhà thờ bằng chuột. **Walk**: đi bộ bên trong bằng các phím mũi tên.
4. Bấm **Simulator** (góc trên bên phải). Bảng mở ra có các thẻ: **Lights** (đèn), **Fans** (quạt), **Sound** (âm thanh), **Décor** (trang trí), **Power** (ổ cắm), **Wiring** (đi dây), **Analysis** (kết quả), **Settings** (cài đặt).
5. Nút **Controls** ở góc dưới bên phải mở bảng công tắc: **Scenes, DB-1, Towers, Fans, Sound**.

Thay đổi được lưu tự động trong trình duyệt của máy này. Muốn giữ hoặc gửi một phương án: **Settings → Save & share → Download layout (.json)**. Xin đừng bấm nút đặt lại (reset) nếu không muốn mất thay đổi.

## 2. Xem nhanh mười phút (dành cho cha)

| Bước | Thao tác | Thấy gì |
| --- | --- | --- |
| 1 | **Controls → Scenes → Full service · evening**, chuyển cảnh sang buổi tối | Nhà thờ khi dâng lễ buổi tối |
| 2 | Thử **Weekday Mass**, **Prayer & adoration**, **Christmas & festivals**, **All off** | Mỗi chế độ nhanh đổi đèn, quạt, âm thanh cùng lúc thế nào |
| 3 | **Controls → Towers** | Mặt tiền nhà thờ: xem mục 6 |
| 4 | **Walk** đến một hàng ghế, mở **Simulator → Sound**, bấm **▶ Play** | Nghe loa từ chỗ ngồi đó (nên dùng tai nghe) |
| 5 | **Simulator → Analysis** | Danh sách **Design checks**: những điểm còn chưa đạt, viết dễ hiểu |

## 3. Xem từng hệ thống

Mỗi thẻ liệt kê thiết bị theo mạch. Bấm vào một dòng để chọn; nút **⌖** chỉ thiết bị đó trong 3D. Công tắc bên trái mỗi dòng bật/tắt riêng thiết bị đó trong mô hình. Công tắc ở tiêu đề nhóm bật/tắt cả mạch.

| Thẻ | Xem gì | Con số hữu ích |
| --- | --- | --- |
| **Lights** | Từng đèn, mạch (L1, L2, L3 …), hướng chiếu, quang thông, mức giảm sáng | lumen, watt, góc chiếu, cao độ |
| **Fans** | Quạt trần, quạt tường, quạt hút; tốc độ Off / 1 / 2 / 3 | lưu lượng gió, watt, độ ồn theo tốc độ |
| **Sound** | Loa và hai micro; mức âm và độ trễ | mức âm ở 1 m, biên độ chống hú của từng micro |
| **Power** | Sáu ổ cắm: xem mục 5 | dòng định mức của mạch, tải thử |
| **Décor** | Tượng, hoa, nến, đồ lễ hội (không có dây trừ loại có đèn) | — |

**Analysis** cho kết quả. Ở **Show on the plan** chọn **Light, Speech level, Clarity (STI), Air speed** hoặc **Noise** để tô màu mặt sàn. **Plan view (roof off)** nhìn từ trên xuống. Bảng **At the sampled seats** so kết quả với yêu cầu. **Service electricity estimate** liệt kê công suất các mạch đang bật.

## 4. Lần theo dây (thẻ Wiring)

1. **Simulator → Wiring → Systems only.** Công trình ẩn đi, chỉ còn tủ điện, dây và thiết bị. **Restore building** hiện lại công trình.
2. Ở **Review layers** chọn một hệ: **Lights**, **Sound & microphones**, **Fans & ventilation**, **Socket outlets** (ổ cắm), **Exit signs**, **Powered decoration** hoặc **Distribution only** (chỉ cấp nguồn giữa các tủ).
3. Chọn một **mạch** để chỉ xem mạch đó cùng nguồn cấp. Chọn một **thiết bị** để lần riêng thiết bị đó về tủ.
4. Bấm vào một tuyến dây trong 3D, trên mặt bằng hoặc trong danh sách. Tuyến chuyển sang màu xanh lá và hiện **nguồn, điểm đến, mạch, chiều dài, khoảng cao độ** và **X / Y / Z của từng điểm gãy**.
5. **Fit review** đưa toàn bộ phần đang chọn vào khung nhìn. **Show route** đưa tuyến đang chọn vào khung nhìn.
6. **Controls · mạch** mở đúng công tắc trong bảng Controls. Nút này không tự bật tắt gì.
7. **Start 3D walkthrough** đi qua chín bước xem xét lắp đặt, mỗi bước kèm câu hỏi còn mở.
8. **Export systems JSON**, **Export schedule CSV**, **Export this review** lưu phần đang xem.

Các tủ: **DB-1** tủ chính, **LC-1** điều khiển đèn, **FC-1** điều khiển quạt, **AV-1** tủ âm thanh, đều ở phòng phục vụ sau bàn thờ; **DB-2** ở bên trong cửa chính, cấp cho tháp, mặt tiền và sân trước. Một cáp cấp nguồn nối DB-1 với DB-2.

Màu chỉ hệ thống, không phải màu vỏ dây: vàng hổ phách là đèn, nâu là quạt, xanh dương là âm thanh, tím là micro, xanh ngọc là ổ cắm, đỏ là cáp cấp nguồn. Độ dày dây trên màn hình được phóng to để dễ nhìn, không phải tiết diện cáp. Chiều dài tuyến đo theo tim tuyến, chưa tính dự phòng và đầu nối.

## 5. Ổ cắm (thẻ Power)

| Mã | Vị trí | Mạch và tủ | Định mức tạm tính |
| --- | --- | --- | --- |
| P-SANCT-B, P-SANCT-H | Hai bên cung thánh, trên trụ trục 10, cao 0,70 m so với bục bên | P1 (bên B), P2 (bên H) · DB-1 | ổ đôi 16 A trên mạch 16 A |
| P-NAVE-B, P-NAVE-H | Giữa nhà thờ, tường hai bên cạnh trụ trục 6, cao 0,45 m so với sàn | P1 (bên B), P2 (bên H) · DB-1 | ổ đôi 16 A trên mạch 16 A |
| P-TOWER-B, P-TOWER-H | Bên trong hiên mỗi tháp, trên trụ phía trước, cao 1,3 m so với sàn tháp | P3, P4 · DB-2 | tủ ngoài trời có khóa: một ổ 32 A và hai ổ 16 A, mạch riêng 32 A |

- Chọn một ổ cắm và kéo **Plugged-in load to test (W)** để thử một thiết bị, ví dụ 1 500 W cho máy lau sàn. **Test load now** cho biết số ampe của mạch và chuyển màu đỏ nếu mạch quá tải.
- Hai tủ ở tháp dùng cho sự kiện ngoài trời (âm thanh sân khấu, ánh sáng, gian hàng). Trong mô hình chúng **mặc định tắt**; ngoài lúc có sự kiện nên cắt điện và khóa lại.
- Mọi mạch ổ cắm được dự kiến có thiết bị chống dòng rò 30 mA. Định mức là giá trị quy hoạch, chưa phải thiết kế hoàn chỉnh. Nguồn cấp cho nhà thờ, aptomat tổng và cáp DB-1 → DB-2 **chưa** được tính cho hai tủ ở tháp: xem [hồ sơ kỹ thuật](engineering/outlets-and-facade-statues.md).

## 6. Mặt tiền nhà thờ: ba công tắc riêng

Mở **Controls → Towers**. Mỗi nút là một công tắc riêng tại DB-2:

| Công tắc | Chiếu sáng gì |
| --- | --- |
| **L10 · Façade statues & candles** | Tượng Đức Mẹ Hồn Xác Lên Trời giữa hai tháp và hai tượng thánh: dải sáng giấu trong mỗi hốc tượng và hai đèn nến trên mỗi bệ |
| **L6 · Façade & towers** | Đèn pha chiếu hai tháp và mặt tiền |
| **L9 · Front stage & central door** | Khoảng sân trống trước nhà thờ và cửa chính |
| **L7 · Festival exterior** | Dây đèn và đèn pha lễ hội, dùng dịp lễ lớn |
| **P3 / P4 · Event power** | Hai tủ ổ cắm ở tháp |

**Off / Evening / Festival** đặt nhiều công tắc cùng lúc; sau đó vẫn đổi riêng từng công tắc được. Nếu cáp cấp cho DB-2 đang tắt tại **Controls → DB-1 → Tower board power** thì không bật được gì ở mặt tiền.

## 7. Danh mục kiểm tra cho kỹ sư địa phương

1. Trong **Wiring → Review layers**, xem lần lượt từng hệ và từng mạch. So vị trí và cao độ của từng thiết bị với công trình.
2. Mở các [sổ Excel](electrical-grid/categories/README.md), mỗi hệ một tệp. Mỗi tệp có các trang **Equipment**, **Electrical Lines**, **Route Points**, cùng mã với mô hình. **Các cột màu hổ phách** dành cho kỹ sư ghi: sản phẩm chọn, thông số được duyệt, cáp, nhãn điều khiển. Để trống nghĩa là chưa quyết định.
3. Đọc [báo cáo tổng hợp](electrical-grid/summary-report.md) để biết tổng số, và [ghi chú đi dây](electrical-grid/routing.md) để biết từng loại tuyến dự kiến giấu thế nào.
4. Đọc [các câu hỏi còn mở](engineering/questions-for-parish-and-designers.json). Các câu đầu hỏi về nguồn: điện áp, số pha, nối đất, dòng ngắn mạch. Chưa có câu trả lời thì chưa chọn được cáp và aptomat.
5. Đọc chữ ghi trên từng thiết bị và tuyến dây: **CONCEPT** là ý tưởng cần xem xét; **ENGINEERING HOLD** là chưa thi công, chưa mua cho đến khi kỹ sư kiểm tra; **REVIEW REQUIRED** là đã biết có xung đột.
6. Những kết quả chưa đạt yêu cầu nằm ở **Analysis → Design checks**, gồm một số ghế thiếu sáng, độ rõ lời ở hai cánh và biên độ chống hú của micro còn thấp.
7. Ghi số đo và chỉnh sửa tại hiện trường theo mã thiết bị và mã tuyến, để mô hình và sổ Excel được cập nhật cùng nhau.

## 8. Những điều mô hình không trả lời được

- Tường, dầm hay trụ có chịu được thiết bị không, và được đục, khoan ở đâu.
- Ánh sáng, âm thanh và gió thật: cần số liệu của sản phẩm được chọn và đo tại hiện trường.
- Chiếu sáng sự cố, chống sét, nối đất và ngăn cháy: mỗi hạng mục cần thiết kế riêng.
- Bản vẽ A3 và các báo cáo cáp, dự toán trong `output/` được lập trước khi thêm ổ cắm và đèn tượng mặt tiền. Với các hạng mục này, chúng chưa cập nhật cho đến khi được lập lại.
