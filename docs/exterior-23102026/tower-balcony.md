# Lan can đỉnh tháp — phiên bản 23102026

Hiệu chỉnh ngày 26/10/2026, sau commit đối chiếu ngoại thất `10d84e7`. Thay con tiện dạng bình trong bộ dựng cũ bằng lan can ô bậc theo DWG gốc SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Các bản vẽ E01B/E02 được đọc trực tiếp theo handle, không đo ảnh; [chứng cứ nguồn](tower-balcony-witnesses.json). ISSUE-R06 về đơn vị còn nguyên; đây là mô hình phát triển thiết kế, không dùng để thi công.

| Bộ phận | Mốc dùng trong mô hình | Trạng thái |
| --- | --- | --- |
| Ô thủng mỗi mặt | **17 ô**, mỗi ô có 12 cạnh LINE khép kín; nhịp 220 mm, thân 110 mm, cổ 60 mm, bậc 25 mm | DRAWING SHOWN: E01B và E02 trùng hình sau chuẩn hóa; áp dụng 8 mặt, tổng 136 ô |
| Cao độ ô | +29,209970 đến +29,930046 m | Chép tọa độ; không là dung sai công trường |
| Thân giữa và trụ góc | +29,089970 đến +29,980046 m; hai hình chữ nhật ở trụ là nét trang trí trên phần đặc | Không cắt hai hình chữ nhật thành lỗ; khép khối trụ 3D từ hai hình chiếu là DERIVED |
| Thanh đỉnh | +29,980046 / +30,017890 / **+30,080962 m**; bề rộng chiếu ngoài 5,205001 m | Các hàng cao độ/biên theo CAD; khép mặt khuất và tiết diện trong là DERIVED |
| Phào dưới | Các hàng +28,778267 / +28,825970 / +28,945970 / +28,993970 / +29,089970 m | Chép biên theo E01B/E02; nội suy tuyến tính giữa hàng, chưa dựng chính xác các cung đỡ |
| Hoa góc | Chân tiếp xúc thanh đỉnh +30,080962; đỉnh **+31,551771 m**; lệch tim mặt đứng ±2,190 m | Vị trí chiếu/đỉnh có chứng cứ; giữ dạng chạm minh họa và chuẩn hóa giới hạn thật của mesh, không gọi chạm khắc đã khớp CAD |
| Dải mặt bằng PT29 | X mặt trước 0,195005 m, mặt sau 4,704994 m; dải kế tiếp cách 60 mm | Dùng 60 mm làm chiều sâu lớp đồ họa; **chiều dày chịu lực vẫn null/chưa thiết kế** |

Mặt trước và mặt ngoài lấy E01B/E02. Mặt trong/sau lặp mô-típ với trạng thái DERIVED vì chưa có mặt đứng độc lập định hướng rõ. Tọa độ X của hình chiếu bên được dùng riêng, không quay số Z rồi gọi là chứng cứ bên. Hai mặt đứng có tim lệch trục khoảng 11,4–11,5 mm; không tự chỉnh về tim trục. Bao phào dưới của hình chiếu rộng khoảng 5,634336 m, khác bao PT29 khoảng 4,3 mm; PT29 ở chân +29,09, thanh đỉnh là một mặt khác ở +30,080962. Không dùng số 5,63 của chân thay cho 5,205 của thanh đỉnh, không lấy trung bình các biên.

Phần chân trống của vỏ chỏm trước đây bắt đầu ở +29,600 m, cách sàn hiển thị khoảng 510 mm. Đã kéo phần trụ khuất minh họa xuống +29,089970 m để chạm mặt sàn/phào; phần lộ và các cung gốc không đổi. Đây là nối hình DERIVED để không để vỏ treo trong không khí; `bearingLevel` vẫn null, không thiết lập gối chịu lực hoặc chiều dày trống tháp.

Phần góc được dựng thành khối đặc theo hai khoảng trụ chiếu; thân ô đặt trên các mặt phẳng dải PT29. Thanh đỉnh khép vòng giữa biên ngoài theo mặt đứng và mặt trong của lớp đồ họa. Đây là khép hình 3D để các phần chạm nhau; không xác lập tiết diện chịu lực, cấu tạo cốt thép/neo, tải lan can hay cách chống nước. Các phào sẵn có `Cornice cap`, `Tower continuous cornice` và gối/đèn giữ nguyên. Chỉ gỡ đúng các mesh lan can/con tiện cũ, không xóa toàn bộ phào tháp.

## Đèn và phối hợp kỹ thuật

L164/L175 giữ chân [0,14;29,09;±10,153] m và đầu [0,02;29,165;±10,153] m; hướng, mục tiêu, nón 36°, 4 000 lm và tuyến không đổi. Kiểm tra gối, chiều cao, khoảng vươn và khoảng trống quang học của fixture vẫn đạt. Các tia lấy vị trí/hướng/nón từ `equipment-layout.json` và pivot/điểm phát từ bộ dựng `catalog.js`, không từ tọa độ chép cứng; điểm phát mô hình khoảng [0,038202;29,200619;±10,153] m. Tia tim đi qua ô giữa; **30/49 hướng thử** gặp hình học lan can mới. Đây là tập tia góc không có trọng số, không phải phần quang thông bị mất hoặc dự đoán lux. Engine lux chưa có đầy đủ tường/lan can tháp làm vật cản; ảnh sáng trên màn hình không xóa giới hạn đó.

[ENG-041](../engineering/issues.md#lan-can-tháp-và-che-chùm-đèn-chỏm--eng-041) giữ việc chọn quang học thật IES/LDT, tiết diện, gá, thoát nước, chống ngã, khe bảo trì và thử ban đêm cho kiến trúc sư/người thiết kế chiếu sáng/kết cấu. Không di chuyển đèn, tăng công suất hoặc thêm gối để làm phép kiểm đạt. Các mục tiêu chống hú, lux, STI và thông gió chưa đạt của dự án vẫn còn.

## Kiểm tra và dữ liệu đi kèm

Cần thư viện trong `scripts/requirements-dwg.txt` và JSON đọc trực tiếp theo [quy trình nguồn](../../review/dwg-vietnamese-23102026/README.md); cả hai nhánh đọc dùng LibreDWG, không thay xác nhận CAD độc lập của người thiết kế.

- `python3 scripts/verify_tower_balcony_source.py`: đọc trực tiếp JSON DWG và DXF để đối chiếu 487 đối tượng nguồn, 34 vòng/408 LINE của E01B/E02, hàng phào/thanh đỉnh, mặt bằng và đỉnh hoa.
- `node scripts/verify_tower_balcony.cjs`: 136 ô, giao tia vùng thân/cổ/bậc và phần đặc; so 1 632 đỉnh biên với mesh thật; hai hình trang trí vẫn có trụ đặc phía sau; giới hạn phào và đỉnh hoa; tia đèn được giữ nguyên và báo giữ chờ.
- Kiểm tra mô hình/mặt bằng, công trường, toàn bộ mốc ngoại thất, mô phỏng tính toán/điện, đường phim, sao viewer và biên build; ảnh desktop trước/sau ngày/tối được ghi ở [bản kiểm tra lan can](../../review/exterior-23102026/balcony/README.md).

Không đổi workbook kích thước hoặc sáu sổ điện vì không sửa số đo nguồn/ID/vị trí/tuyến thiết bị. Đã kiểm tra bảng kích thước, `facade.csv` và hồ sơ đèn ẩn; chỉ thêm giữ chờ mới vào báo cáo tổng hợp điện, không ghi đè số liệu có sẵn. Xuất mặt bằng/công trường được kiểm lại; các ảnh/GLB cũ chưa có lan can mới là bản cũ. Hình CAD/chồng nét chỉ lưu cục bộ theo H1, không đưa vào Git.
