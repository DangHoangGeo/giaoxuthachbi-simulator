# Bản ghi đối chiếu ngoại thất — phiên bản 23102026

**Bản ghi lượt đầu, commit `10d84e7`, trước hiệu chỉnh lan can.** Xem [lượt lan can tiếp theo](balcony/README.md) cho mô hình mới hơn; các ảnh/kết quả bên dưới giữ làm lịch sử có phiên bản.

Ngày 26/10/2026. Phạm vi và các mốc theo nguồn nằm ở [hồ sơ ngoại thất](../../docs/exterior-23102026/README.md). DWG gốc giữ nguyên, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Đây là kiểm tra chép hình học và phần mềm, không phải xác nhận khảo sát, kết cấu hoặc thi công.

## Hình học và dữ liệu

| Phép kiểm | Kết quả / chứng cứ |
| --- | --- |
| Đọc lại nguồn tháp/mặt tiền/hai bên | [217 bản ghi](source-check.json), sai dư chép lớn nhất khoảng 4,95×10⁻¹⁰ m; đây là sai dư phần mềm, không phải độ chính xác công trường |
| Đọc lại nguồn đầu hồi/đường mái | [85 đối tượng](roofline-source-check.json), tọa độ CAD trùng; chưa có bộ máy CAD độc lập thứ hai |
| Mesh lắp ráp thực | [118 giới hạn, 50 giao tia lỗ tường](mesh-check.json), sai dư giới hạn lớn nhất khoảng 0,00182 mm; gồm 24 mặt tầng trên của hai tháp |
| Vòm D47 và cửa sổ | [Bốn cung thật, 14 cặp cửa, 28 kính vòm](side-check.json); dây cung chia 48 đoạn, độ võng lớn nhất khoảng 0,167 mm |
| Mô hình và xuất mặt bằng | [verify_model --plan](model-check.log) đạt; tạo lại mặt bằng, không phát sinh thay đổi dữ liệu mặt bằng |
| Công trường và sổ kích thước | [verify_construction](construction-check.log) đạt; 463 dòng kích thước, 28 mục mở trong dữ liệu công trường. ENG-039/040 được ghi riêng ở hồ sơ kỹ thuật, không xóa các mục mở cũ |
| Mô phỏng và tính toán | [--report --estimates](simulator-check.log) đạt kiểm tra tính toán, giữ các mục tiêu chưa đạt bên dưới |
| Điện, biển và phim | [Điện](electrical-check.log), [biển](doorhead-check.json), [đường máy quay/phụ đề](cinematic-check.log) đạt. Kiểm tra điện cuối cũng nằm trong báo cáo mô phỏng đầy đủ |
| Bảo toàn Excel | [Sổ kích thước](register-preservation.json): chỉ DWG facade!J40:L40, D01; các giá trị/công thức khác giữ nguyên. [Sáu sổ điện và bốn tệp nguồn điện](electrical-preservation.json) trùng hash lúc bắt đầu |

`construction-data.js` được tạo lại theo hash sổ mới; `facade.csv` và dấu kiểm nguồn của bộ PDF được cập nhật cùng bản ghi D01. Mốc CAD I40 không thay đổi. Không di chuyển/đổi hướng thiết bị, không đổi ID, công suất hoặc tuyến điện, không ghi đè các sổ điện đang có công việc khác. Mô hình phân tích vẫn thiếu đầy đủ tường tháp/mặt tiền: phép kiểm mô phỏng không xác nhận che sáng/âm học hoặc diện tích thông gió mới tại tháp.

Các kiểm tra web đã chạy từ `web/`: `node scripts/prepare-viewer.mjs`, `npm run check:viewer`, `npm run check:boundary`. Bộ sao viewer có 75 tệp, kiểm inventory/byte/hash đạt; boundary không có lỗi trong bản build hiện có. Không chạy triển khai hoặc tuyên bố bản build production mới.

## Kiểm tra desktop

Ảnh cuối được chụp từ mô hình thật trên desktop, chế độ xem đầy đủ, ngày/tối, qua trang đối chiếu cục bộ. [Danh sách góc nhìn và trạng thái ảnh](browser-captures.json) ghi 22 ảnh: 8 trước, 8 sau ban ngày và 6 sau buổi tối. Ảnh trước dùng chính năm module kiến trúc lưu lúc bắt đầu; các tài sản/hệ thống còn lại giữ cùng phiên làm việc. Không dùng hình CAD hoặc ảnh sinh làm bằng chứng nhìn mô hình.

| Góc nhìn | Trước | Sau |
| --- | --- | --- |
| Tháp B trước/bên | [Ảnh](before-tower-B-front-day.png) | [Ảnh](after-tower-B-front-day.png) |
| Tháp H trước/bên | [Ảnh](before-tower-H-front-day.png) | [Ảnh](after-tower-H-front-day.png) |
| Tháp B sau/bên | [Ảnh](before-tower-B-rear-day.png) | [Ảnh](after-tower-B-rear-day.png) |
| Tháp H sau/bên | [Ảnh](before-tower-H-rear-day.png) | [Ảnh](after-tower-H-rear-day.png) |
| Hai bên | [B](before-side-B-day.png), [H](before-side-H-day.png) | [B](after-side-B-day.png), [H](after-side-H-day.png) |
| Đầu cung thánh | [Ảnh](before-rear-perspective-day.png) | [Ảnh phối cảnh](after-rear-perspective-day.png) |
| Mặt tiền | [Ảnh](before-front-day.png) | [Ảnh](after-front-day.png) |

Đã xem các mặt tháp từ phía trước, sau và hai phía; hiên/cửa/vòm, đầu cung thánh và tiếp xúc phào–đèn. [Tháp B buổi tối](after-tower-B-rear-evening.png) cho thấy đèn trên mép phào vẫn ở vị trí cũ. Các ảnh tối còn lại theo cùng quy tắc tên tệp. Ảnh đối chiếu sau cùng giữ thông báo phiên bản rõ ràng.

Chế độ bình thường có bảng Mô phỏng; `?visit` giấu nút đó. Hai lần mở trực tiếp không có console error/warning trong khoảng quan sát. Trang thử có iframe từng báo `MutationObserver.observe` khi tháo/nạp iframe; không tái hiện ở viewer mở trực tiếp, nên không tuyên bố trang thử hoàn toàn không có lỗi console. Không có sửa chữa máy quay/render phỏng đoán. Góc đầu cung thánh cuối được đối chiếu thêm bằng phối cảnh để phân biệt rõ đầu hồi năm cửa với mặt tiền ba cửa; không dựa vào nhãn nút đơn thuần.

## Giới hạn còn lại

- Mười hai mặt tháp trong/sau mới là **DERIVED**; ET chưa nhận dạng hướng và hoa hồng tầng 2 lệch 90 mm. Sáu mặt trước và sáu mặt ngoài tầng trên dùng nguồn E01B/E02. Hai cửa sổ ngoài tầng trệt có biên theo E02, nhưng tấm đóng và chất liệu chỉ minh họa.
- Ban công tháp còn dùng thanh con tiện cũ, trong khi nguồn thể hiện ô thủng dạng bậc; kích thước/độ sâu chưa được cập nhật. Không gọi toàn bộ hai tháp là đã trùng CAD. Mặt tường tầng trệt vẫn lệch mặt bằng khoảng 0,5 m; mặt sau đầu nhà còn lệch khoảng 59 mm.
- ISSUE-R06 đơn vị, ENG-027 hướng B/H, ISSUE-R04/R05 cao độ, ENG-039 cửa/biển, ENG-040 mặt tháp vẫn mở. Giữ nguyên mọi yêu cầu kết cấu, liên kết, kính/cửa, thoát nước, thoát hiểm, bảo trì và commissioning.
- Báo cáo tính toán vẫn có biên chống hú 0,9/1,4 dB; 13% ghế dưới 200 lux; chỉ 74% ghế STI≥0,60; độ rõ thấp nhất 0,411; thông gió khoảng 3,5 ACH, gió thấp nhất 0,05 m/s. Không sửa ngưỡng hoặc công thức để che các mục tiêu chưa đạt.

Cây làm việc đã có thay đổi về cửa lùi, mô phỏng, điện/Excel và việc di chuyển/bổ sung PDF/PNG trước lượt này. Chỉ phần sửa ngoại thất cùng tài liệu/dữ liệu/chứng cứ tương ứng được đưa vào commit; công việc có sẵn được giữ ngoài vùng stage. Ảnh/tệp CAD gốc và ảnh chồng nguồn ở thư mục xuất cục bộ, không đưa vào Git theo H1. Các ảnh/GLB cũ ngoài bộ này không được cập nhật và không xác nhận hình học phiên bản hiện hành. Chỉ commit cục bộ; không push hoặc merge.
