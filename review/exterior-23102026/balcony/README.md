# Kiểm tra lan can đỉnh tháp — phiên bản 23102026

Ngày 26/10/2026. Đây là lượt tiếp theo sau `10d84e7`; [hồ sơ kỹ thuật và phạm vi](../../../docs/exterior-23102026/tower-balcony.md). Ảnh trước dùng đúng module tháp của commit đó, các tài sản khác dùng chung. Mô hình hiện tại có tám mặt lan can, mỗi mặt 17 ô thủng bậc, tổng 136 ô; bỏ con tiện bình và dựng lại phào/rail, trụ đặc và giới hạn đỉnh hoa. Các mặt trong/sau và phần khép 3D vẫn DERIVED; không phải hồ sơ thi công.

## Chứng cứ và kiểm tra

| Kiểm tra | Kết quả |
| --- | --- |
| Nguồn gốc | [487 đối tượng](source-check.json) được đối chiếu trực tiếp giữa JSON đọc từ DWG và DXF, cùng hash nguồn `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`; sai dư tọa độ lớn nhất khoảng 4,66×10⁻¹³ m. Cả hai xuất đều dùng LibreDWG, chưa là AutoCAD/ODA độc lập |
| Topology | 17 vòng kín, 12 LINE/vòng trên mỗi E01B/E02; không tính hai nét chữ nhật ở trụ thành lỗ |
| Mesh lắp ráp | [136 ô](mesh-check.json): 408 tia qua ô, 272 tia vào vùng đặc, 1 632 đỉnh biên; sai dư biên lớn nhất khoảng 0,00057 mm. Đây là sai dư số học, không là độ chính xác khảo sát hoặc dung sai thi công |
| Toàn bộ ngoại thất | [118 giới hạn, 50 phép giao tia tường](full-exterior-check.json) vẫn đạt |
| Mô hình / mặt bằng | [verify_model --plan](model-check.log) đạt; dữ liệu mặt bằng không đổi |
| Công trường | [verify_construction](construction-check.log) đạt; dữ liệu hash sổ còn hiện hành; 463 dòng kích thước/28 mục mở trong dữ liệu công trường. ENG-039/040/041 được giữ riêng trong hồ sơ kỹ thuật |
| Hệ thống / điện | [verify_simulator --report --estimates](simulator-check.log) đạt kiểm tra tính toán, gồm gối/đèn/cáp; không xóa các mục tiêu chưa đạt |
| Biển / phim | [Biển](doorhead-check.json), [đường máy quay/phụ đề](cinematic-check.log) đạt |
| Web | `prepare-viewer` và `check:viewer` đạt inventory/byte/hash 75 tệp, 71 288 885 byte ở lần kiểm; [boundary](web-boundary.log) không lỗi trên build hiện có. Không tạo deployment hoặc tuyên bố đã build production mới |
| Bảo toàn dữ liệu | [Hash và bảo toàn](register-preservation.json): sáu workbook điện, đầu vào thiết bị/hệ thống/tuyến và workbook kích thước giữ nguyên. Báo cáo tổng điện chỉ nối thêm ENG-041; các byte có trước được giữ |

Phép kiểm không nới ngưỡng. Các giới hạn về đơn vị ISSUE-R06, hướng ENG-027, mức nền/mái ISSUE-R04/R05, dải cửa/biển ENG-039 và nhận dạng ET/hoa hồng 90 mm ENG-040 còn nguyên. Gối đèn `Cornice cap`, `Tower continuous cornice` và các lớp phào sẵn có được giữ, chỉ gỡ đúng tên các phần balcony/con tiện cũ.

## Desktop trước / sau

[Danh sách 10 ảnh chi tiết, hai ảnh toàn cảnh và trạng thái khung vẽ](browser-captures.json). Mỗi ảnh được chụp sau khi lấy AX state của giao diện và ảnh native; khung vẽ 1 920×960 pixel trong viewport desktop. Không dùng ảnh CAD hoặc ảnh sinh làm bằng chứng mô hình.

| Góc tháp | Trước | Sau |
| --- | --- | --- |
| B trước/bên | [Ảnh](before-B-front-day.png) | [Ảnh](after-B-front-day.png) |
| H trước/bên | [Ảnh](before-H-front-day.png) | [Ảnh](after-H-front-day.png) |
| B sau/bên | [Ảnh](before-B-rear-day.png) | [Ảnh](after-B-rear-day.png) |
| H sau/bên | [Ảnh](before-H-rear-day.png) | [Ảnh](after-H-rear-day.png) |
| Buổi tối | — | [B trước](after-B-front-evening.png), [B sau](after-B-rear-evening.png) |

Đã nối phần trụ khuất của vỏ chỏm xuống sàn hiển thị để bỏ khoảng trống khoảng 510 mm, giữ `bearingLevel=null`; đây là phần nối DERIVED, không thiết kế gối chịu lực. Phào/thanh đỉnh còn được kiểm chiều mặt ngoài và thể tích có dấu của mesh khép kín đối chiếu tích phân hình học độc lập, không dùng làm khối lượng vật liệu.

[Toàn cảnh phía tháp](overall-front-day.png) và [đầu cung thánh](overall-rear-day.png) lưu mô hình mới nhất, với hash module trong danh sách ảnh.

Đã xem các góc nối, lỗ bậc, trụ có nét trang trí, chỗ tiếp xúc phào/hoa góc và vùng đèn chỏm. Chế độ `?visit` không có nút Mô phỏng; mở viewer trực tiếp ở chế độ bình thường có nút đó và dựng đúng mô hình mới. [Console](browser-console.json) không có warning/error mới sau lần reload trực tiếp được ghi; hai lỗi `MutationObserver.observe` trước đó khi tháo/nạp iframe được giữ trong log, không quy thành lỗi của lần reload mới và không tuyên bố toàn bộ trang thử không lỗi.

Lượt chụp nhanh ban đầu có ảnh chưa kịp đổi khung. Đã chụp lại cả 22 ảnh của [lượt trước](../README.md) sau AX state bằng snapshot module `10d84e7`; giữ đúng phiên bản trước hiệu chỉnh lan can, không dùng model mới để thay lịch sử. Các ảnh CAD/chồng nét vẫn ở thư mục xuất cục bộ, không đưa vào Git.

## Giữ chờ chiếu sáng mới

L164/L175 không thay vị trí/hướng/đầu đèn: tia tim đi qua ô giữa, nhưng **30/49 hướng mẫu** trong nón hình học 36° gặp lan can ở mỗi tháp. Tọa độ/hướng/nón được đọc từ layout đăng ký (hash trong kết quả), pivot/điểm phát đọc từ bộ dựng catalogue thực; không đọc layout tùy chỉnh trong trình duyệt. Phép mẫu không có trọng số, không là tỷ lệ quang thông hoặc số lux sau che; ảnh GPU cũng không xác nhận IES/LDT. Engine hiện hành không có đầy đủ vật cản tháp trong tính lux. [ENG-041](../../../docs/engineering/issues.md#lan-can-tháp-và-che-chùm-đèn-chỏm--eng-041) giữ quang học, tiết diện, gá, chống ngã, thoát nước và tiếp cận bảo trì cho các kỹ sư/kiến trúc sư, cần thử ban đêm. Không tăng lumens hoặc dời đèn để làm báo cáo đẹp hơn.

Các mục tiêu trước vẫn chưa đạt: biên chống hú 0,9/1,4 dB; 13% ghế dưới 200 lux; 74% ghế STI≥0,60; STI thấp nhất 0,411; thông gió khoảng 3,5 ACH và gió thấp nhất 0,05 m/s. Kết quả tính toán đạt không có nghĩa thiết kế đạt.

## Tái lập và bàn giao

Chuẩn bị thư viện trong `scripts/requirements-dwg.txt` và bản JSON đọc trực tiếp theo [quy trình kiểm nguồn](../../dwg-vietnamese-23102026/README.md). Chạy từ gốc dự án:

```bash
python3 scripts/verify_tower_balcony_source.py
node scripts/verify_tower_balcony.cjs
node scripts/verify_exterior_dwg.cjs
node scripts/verify_model.cjs --plan
node scripts/verify_construction.cjs
node scripts/verify_simulator.cjs --report --estimates
node scripts/verify_cinematic.cjs
```

H1 vẫn giữ các tệp CAD gốc/ảnh nguồn cục bộ. Các ảnh và xuất GLB cũ chưa có lan can mới là bản cũ. Công việc cửa lùi, mô phỏng, điện/Excel và việc di chuyển PDF/PNG có trước được giữ ngoài vùng stage của lượt này. Chỉ commit cục bộ, không push/merge/deploy. Hình học 3D phía khuất, chạm khắc và tiết diện chịu lực chưa xác nhận; trường chiều dày chịu lực của lan can vẫn `null`.
