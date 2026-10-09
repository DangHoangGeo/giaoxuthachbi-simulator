# Bản yêu cầu hồ sơ và báo giá để rà soát — Thạch Bi

**Bản nháp, chưa gửi. Chưa chọn thiết bị, chưa phê duyệt mua hoặc thi công.** Dùng cùng một yêu cầu cho các ứng viên trong [shortlist](supplier-shortlist.json); yêu cầu trả lời bằng tài liệu đúng mã sản phẩm, không chỉ catalogue chung. [CSV khối lượng](../../output/electrical-review/equipment-budget.csv) giữ từng ID/vị trí/thông số mô hình; [bộ bản vẽ](../electrical-grid/print-drawings.md) là nguồn phối hợp. Không thay đổi thiết kế chỉ để khớp sản phẩm rẻ đang bán.

## Phạm vi để nhà cung cấp đề xuất

- **Đèn:** 220 mục/cụm mô hình chiếu sáng đang hiển thị theo sổ hiện tại; các phương án trang trí ẩn thuộc mục riêng và bị loại khỏi khối lượng cơ sở. Cụm đèn chùm đồng phải có thân, bóng/driver, optic đọc sách đã tính, phụ kiện và khả năng thay thế; đèn chùm nhỏ hai cánh có tám cụm đang nghiên cứu. Nộp IES/LDT, quang thông duy trì, CCT/CRI, dimming/flicker, kích thước/nhiệt/IP và photometry của cả cụm. Không lấy thông số bóng nến thay cho optic hướng xuống.
- **Thoát nạn:** năm biển chỉ dẫn đang hiển thị; nguồn/duration khẩn cấp, đèn chiếu sáng sự cố và yêu cầu tiếp cận/đọc được còn chờ thiết kế riêng. Không coi số biển mô hình là một hệ an toàn hoàn chỉnh.
- **Âm thanh:** 14 loa cột, tám loa treo, tám horn và hai micro đang hiển thị; đây là số lượng mô hình cần xem xét lại bằng directivity/phản hồi ghế. Nộp EASE/GLL hoặc dữ liệu tương đương, đáp tuyến/tap/trở kháng, giá đỡ, rack ampli/mixer/DSP, mains cực đại/standby và thiết bị trợ thính đề xuất. Giá micro cần tách chân đế, cáp/XLR và nguồn phantom.
- **Quạt:** 14 quạt trần bên, 14 quạt tường, hai quạt tường lớn và chín quạt hút đang hiển thị, gồm thiết bị thường tắt; không đặt quạt trên đường nhìn trục giữa. Nộp đường áp suất–lưu lượng, watts từng cấp, ồn, vùng quét/clearance, tải neo, điều tốc, khả năng vệ sinh và điểm làm việc sau lớp che/ống/louver. Quạt free-air và quạt dân dụng nhỏ không thay cho giải pháp giấu thiết bị đã tính.
- **Tủ/điều khiển:** năm vỏ mô hình DB-1/DB-2/LC-1/FC-1/AV-1; số thiết bị bên trong chưa biết. Cần đề xuất sau khi kỹ sư xác nhận nguồn, pha, earthing, dòng sự cố và sơ đồ điều khiển thủ công. Không coi năm vỏ là năm tủ hoàn chỉnh hoặc là khối lượng ampli.
- **Cáp/ống/máng:** 343 tuyến là đường mô hình; bảng so sánh giữ mọi cáp chính thức chờ duyệt. Nhà cung cấp cung cấp thông số ruột dẫn theo mm², số lõi, điện trở/nhiệt/đường kính, ampacity theo điều kiện lắp đặt, fire performance, phụ kiện và quy cách cuộn. Chưa phát hành mét/tiết diện để đặt hàng. Không dùng cuộn VVF hai lõi đường kính 2.0 mm cho bảng cáp ba lõi theo mm².

## Báo giá phải tách rõ

| Mục | Thông tin yêu cầu |
| --- | --- |
| Sản phẩm | Hãng/mã/phiên bản, xuất xứ, cấu hình/gói, phụ kiện kèm và loại trừ, tài liệu kiểm chứng |
| Điện và hiệu năng | Nhãn điện áp/tần số, mains cực đại/inrush, driver/điều khiển và dữ liệu hiệu năng đúng phiên bản |
| Giá | JPY hoặc tiền báo giá bản địa được ghi rõ; đơn vị/cụm/gói, VAT, hạn hiệu lực và số lượng từng ID/nhóm |
| Giao Việt Nam | Tồn kho/thời gian cung cấp, vận chuyển, nhập khẩu/thuế, điều kiện bán, hư hỏng/đổi trả |
| Hỗ trợ | Xác thực đại lý, bảo hành có hiệu lực tại Việt Nam, đơn vị sửa chữa, phụ tùng và thời gian cung ứng bằng văn bản |
| Vận hành | Thay thế/cô lập/thủ công khi mất mạng, cấu hình/bản sao lưu và người chịu trách nhiệm |
| Thử nghiệm | Hỗ trợ mẫu thật/commissioning, đo lux/STIPA/gió/ồn với quạt hoạt động, hồ sơ kết quả và giới hạn |
| Chi phí còn thiếu | Neo/giàn giáo/containment/fire stopping/nhân công/đo kiểm/đào tạo/phụ tùng; không gộp thành giá mơ hồ |

Yêu cầu nhà cung cấp ghi mọi ngoại lệ: không dim được, điện áp nội địa Nhật, bảo hành ngoài Nhật bị loại, chỉ bán thân đèn, chênh đường kính/độ cao/directivity, thiếu đường đặc tính hoặc không có phụ tùng. Đối chiếu [40 câu hỏi mở](../engineering/questions-for-parish-and-designers.json) và [kết quả cánh ngang còn thiếu](../engineering/wing-review.md). Kỹ sư chọn và tính lại sản phẩm phù hợp trước khi cập nhật sổ Excel; giáo xứ xác nhận hình thức không thay thế việc kiểm tra kỹ thuật.
