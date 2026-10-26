# Đối chiếu ngoại thất nhà thờ — phiên bản 23102026

Yêu cầu chủ đầu tư ngày 26/10/2026: kiểm từng phần mô hình theo DWG mới, bắt đầu từ tháp, mặt tiền, hai bên rồi đầu nhà phía cung thánh; ưu tiên độ chính xác và dùng các tác giả phụ để rà soát độc lập. Ba nhánh rà soát được tổng hợp với kiểm tra nguồn và mô hình thực. Đây là lượt hiệu chỉnh ngoại thất; **không ghi toàn bộ nhà thờ đã trùng tuyệt đối hoặc đã đủ điều kiện thi công**.

Nguồn DWG: SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Dùng tọa độ và handle từ DXF đã đối chiếu trực tiếp DWG ở lượt trước. Không dùng hình sinh hay kích thước đo trên ảnh để thay chứng cứ CAD. Các phần dưới đây phân biệt hình học đã chép, chỉ đạo của chủ đầu tư, chi tiết minh họa và giữ chờ.

| Khu vực | Đã hiệu chỉnh | Phần còn cần phối hợp |
| --- | --- | --- |
| [Hai tháp](towers.md) | 24 mặt tầng trên (6 trước + 6 ngoài theo CAD, 12 trong/sau lặp DERIVED): tâm/bán kính vòm, tim đôi cửa, bậu, hoa hồng; hai mặt ngoài trệt với cửa sổ 1 m và chân vòm riêng; vòm kín tầng trệt; chỏm cung tròn lệch tâm, các mức đèn lồng, quả cầu/thánh giá; lan can 17 ô bậc/mặt và đỉnh hoa +31,551771 m | Nhận dạng mặt ET và hoa hồng lệch 90 mm (ENG-040), xác nhận mô-típ mặt trong/sau, tiết diện lan can, các phần khép góc/độ sâu, che chùm đèn ENG-041, mặt phẳng tầng trệt còn lệch CAD 0,5 m; chiều sâu, cấu tạo và khả năng chịu lực chưa xác nhận |
| [Giữa hai tháp](front.md) | Bỏ phần nối thừa 372 mm mỗi bên; biên hoa hồng giữa; tám ô và các thanh ngang/đứng của ba cửa trên | Chiều sâu chạm, vật liệu cửa, thông gió sau mặt tiền, kích thước tượng, thoát nước và neo |
| [Hai bên nhà](sides.md) | 28 kính vòm và lỗ tường theo cung tròn R500, cao độ và phào đúng loại cửa đã chọn; vòm D47 dùng bốn cung tròn và gờ chân thật | Hiên thoáng/cặp cửa là chỉ đạo riêng; trụ giữa 1 000/1 030 mm, cửa đơn phía trong 1 760/2 250 mm chưa thống nhất; loại cửa đi CAD mới giữ chờ vì biển thoát hiểm |
| [Đầu cánh và đầu cung thánh](rear-and-roofline.md) | Các góc vát/phào nghiêng, hốc nhiều tâm, vòng hoa hồng, đỉnh trụ, quả cầu và biên thánh giá; lan can hiên theo E02 | Mặt sau đầu nhà còn lệch mặt P14 khoảng 59 mm; chiều sâu, phần chạm và các liên kết còn minh họa |

Các phào ngang sẵn có ở đầu tầng tháp được giữ nguyên khi thay mặt cửa. Một lượt kiểm tra hệ thống phát hiện việc bỏ cả nhóm cửa cũ đã bỏ nhầm mép phào đỡ đèn chỏm; đã khôi phục chính hình học phào/matrix cũ, giữ vị trí đèn và kiểm lại giao với bề mặt. Không tạo gối lắp mới hoặc di chuyển thiết bị để che lỗi.

## Giữ chờ quan trọng

- **ISSUE-R06:** `INSUNITS=1` khác cách diễn giải hình học mm/m. Người thiết kế xác nhận trong CAD gốc; không đổi hệ số 25,4.
- **ENG-027:** hướng gương B/H chưa được xác nhận ngoài hiện trường; không đảo Z toàn bộ mô hình hoặc di chuyển thiết bị bất đối xứng.
- **ISSUE-R04/R05:** nền cung thánh 750/800 mm, mái vẽ khoảng +12,3964 m và nhãn +12,472 m vẫn mở. Giữ các mốc mô hình đã được chủ đầu tư chọn, không lấy trung bình.
- **ENG-039:** cửa đi CAD có dải ngang 150 mm trong khi hộp biển thoát hiểm đang mô phỏng cao 170 mm. Phương án CAD thử không đạt kiểm tra biển; tạm giữ cửa đi trước đây (dải 220 mm, chân vòm +3,171 m, đỉnh +4,311 m). Không gọi phần này là đã khớp CAD. Cần thống nhất sản phẩm/vị trí/gối lắp rồi mới cập nhật cùng sổ điện và tuyến dây.
- **ENG-040:** ET chưa có hướng/tên mặt và hoa hồng tầng 2 lệch 90 mm với E02/E01B; mặt trong/sau mới là lặp DERIVED, cần kiến trúc sư xác nhận.
- [Lan can tháp](tower-balcony.md): đã thay con tiện bằng 17 ô bậc/mặt theo E01B/E02; thanh đỉnh rộng 5,205 m ở +30,080962, khác bao chân PT29 khoảng 5,63 m. Tiết diện/khép góc/chạm còn minh họa và ENGINEERING HOLD. 30/49 hướng mẫu của nón đèn chỏm gặp lan can; không phải tỷ lệ quang thông (ENG-041).

Các giữ chờ kết cấu, sản phẩm, lối thoát, bảo trì, chiếu sáng, âm học và thông gió trong [issues.md](../engineering/issues.md) còn hiệu lực. Các số rất nhiều chữ số là tọa độ phần mềm, không phải độ chính xác thi công.

## Kiểm tra và bàn giao

Chứng cứ hình học: [tháp trước/chỏm](tower-witnesses.json), [các mặt còn lại](tower-other-faces-witnesses.json), [mặt tiền](front-witnesses.json), [hai bên](side-witnesses.json), [đường mái/đầu nhà](roofline-witnesses.json). Chạy từ gốc dự án:

```bash
python3 scripts/verify_exterior_sources.py
python3 scripts/measure_roofline_dwg.py --verify
node scripts/verify_exterior_dwg.cjs
node scripts/verify_side_dwg.cjs
node scripts/verify_model.cjs --plan
node scripts/verify_doorhead_signs.cjs
node scripts/verify_construction.cjs
node scripts/verify_simulator.cjs --report --estimates
node scripts/verify_simulator.cjs --electrical
node scripts/verify_cinematic.cjs
```

Các kiểm tra hình học nạp bộ dựng thật và giao tia với lỗ tường/trụ. Kiểm tra nguồn đọc lại 217 bản ghi tháp/mặt tiền/hai bên và 85 bản ghi đường mái; hai nhánh vẫn dùng LibreDWG, chưa là kiểm chứng bằng hai bộ máy CAD độc lập. Đối chiếu lan can tiếp theo đọc thêm 487 đối tượng bằng `verify_tower_balcony_source.py`, kiểm mesh bằng `verify_tower_balcony.cjs`; xem [hồ sơ lan can](tower-balcony.md). Ảnh desktop ngày/tối và kết quả lượt đầu nằm trong [bản ghi tích hợp](../../review/exterior-23102026/README.md). Ảnh mô hình không thay cho ảnh CAD hay xác nhận hiện trường.

Không thay ID/vị trí/hướng/công suất thiết bị và tuyến cáp. Dấu kiểm các sổ điện so với lúc bắt đầu được kiểm lại để tránh ghi đè công việc khác. Chỉ bản ghi mối nối D01 trong sổ kích thước được cập nhật; số đo CAD khác giữ nguyên. Dữ liệu công trường và xuất mặt bằng được tạo lại từ cùng phiên bản. Bản vẽ/PDF gốc và ảnh chồng CAD tiếp tục giữ cục bộ theo H1; không đẩy mã, công bố hoặc triển khai website trong lượt này.
