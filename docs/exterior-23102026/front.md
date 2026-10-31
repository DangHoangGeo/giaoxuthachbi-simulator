# Mặt tiền giữa hai tháp — phiên bản 23102026

Đối chiếu ngày 26/10/2026 với DWG lưu 23/10/2026, hình E01B tờ 1 và các mặt bằng PT10/PT15. Cơ sở là các đối tượng CAD và [bảng chứng cứ](front-witnesses.json), không phải đo tỷ lệ PDF. Đơn vị mm/m vẫn chờ người thiết kế xác nhận theo ISSUE-R06. Đây là mô hình phối hợp thiết kế, không dùng để thi công.

## Các sửa đổi

- **Mối nối hai bên:** tường, bệ và phào phía trên dừng ở |Z| = 7,128 m theo F03/F04/F06. Bỏ phần kéo dài đến 7,500 m trước đây (D01). Trụ sau phía trong của tháp hiện bắt đầu tại |Z| = 7,103 m nên vẫn có 25 mm chồng hình học tại mặt X = 4,017–4,936 m. Đã kiểm tra bằng tia giao với các tam giác thật tại hai mối nối, không chỉ so bảng tham số. Chồng mô hình không xác lập chi tiết liên kết kết cấu.
- **Hoa hồng giữa:** CIRCLE `C49973`–`C49976` cho tâm Y = 13,709352 m và các bán kính 540 / 450 / 418,742 / 394,742 mm. Bản cũ dùng tâm 13,700 m, torus có bán kính tim 520 mm và tiết diện 35 mm, làm biên ngoài thành 555 mm. Các vòng mới dùng biên CAD; phần cánh hoa và chiều sâu đắp nổi vẫn minh họa.
- **Cụm ba cửa tầng trên:** giữ tim Z = −1,190 / 0 / +1,190 m và các vòng vòm 430 / 540 / 650 mm. Thay các thanh chớp lặp theo bước 160 mm bằng tám ô chữ nhật, thanh giữa 80 mm và thanh ngang theo LINE `C49A51`–`C49A85`. Bậu Y = 9,983731 m; bước thanh 277,781746 mm; thanh đều cao 77,781746 mm, thanh ngang trên cùng ở +12,160985 đến +12,240985 m. Vòng khung gỗ trong theo ARC `C49890`, R = 374,997839 mm. Chất liệu gỗ/mặt tối và chiều sâu cửa hiện hành được giữ như cách thể hiện; CAD này chưa xác nhận sản phẩm, kính, vận hành hay diện tích thông gió hữu hiệu.

Không đổi các cao độ và mặt phẳng chính đã khớp: bệ +9,741 m; đỉnh phào tầng trên +15,840 m; mặt tường giữa X = 2,936 m; mặt bên X = 4,017 m; mặt hốc trên X = 3,915 m; đỉnh thánh giá giữa +24,648 m. Các tượng theo chỉ đạo chủ đầu tư và hệ chiếu sáng của chúng giữ nguyên.

## Giới hạn và phối hợp

Cửa chính/cửa bên nằm lùi trên hàng trụ sau theo chỉ đạo ngày 25/10/2026; không tự đưa lại ra mặt trước chỉ để giống mặt đứng hai chiều. Giữ câu hỏi gương B/H (ENG-027), đường xả quạt đầu nhà (ENG-036), kích thước tượng/hốc, thoát nước bệ và cấu tạo chịu lực. Nét CAD không xác nhận chiều sâu phào, chạm khắc, neo hoặc phương án lắp đặt.

Sổ `Thach_Bi_Church_Dimensions.xlsx`, trang **DWG facade**, dòng D01 được cập nhật ba ô J40/K40/L40 từ cùng mốc CAD; các số đo nguồn, công thức và dữ liệu nhập khác giữ nguyên. `facade.csv` giữ ID D01 và ghi lý do bỏ phần kéo dài. Không đổi vị trí/ID thiết bị, mạch, tuyến điện hoặc đầu vào tính toán; các sổ thiết bị điện đã có chỉnh sửa khác được giữ nguyên.

Kiểm tra: `verify_exterior_sources.py`, `verify_exterior_dwg.cjs`, `verify_model.cjs`, các kiểm tra công trường/hệ thống và nhìn desktop ngày/tối. Sai dư số học/tessellation là giới hạn phần mềm, không phải độ chính xác khảo sát hay dung sai thi công.
