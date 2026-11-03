# Việc còn lại và quyết định kiến trúc · 01/11/2026

Tài liệu này gom mọi việc còn mở sau đợt rà soát của chủ đầu tư ngày 01/11/2026. Với mỗi vấn đề, phần **Quyết định kiến trúc** là phương án do trợ lý AI đề xuất ở vai kiến trúc sư, theo yêu cầu của chủ đầu tư. Đây là quyết định về **ý đồ thiết kế, hình thức và cách tổ chức không gian**. Nó **không** thay thế tính toán, bản vẽ thi công và chữ ký của kỹ sư có chứng chỉ (AGENTS.md, quy tắc 4 và 10). Mọi mục kết cấu, điện và an toàn vẫn **ENGINEERING HOLD** cho đến khi người có thẩm quyền duyệt. Mô hình là công cụ phát triển thiết kế, **không dùng để thi công**.

Ký hiệu trạng thái: **Làm ngay** = phần mềm/mô hình làm được ngay; **Chờ chủ đầu tư** = cần ý kiến giáo xứ; **Chờ kỹ sư** = cần chuyên môn có chứng chỉ.

## 1. Kiến trúc và hình thức

| # | Vấn đề | Quyết định kiến trúc | Trạng thái và bước tiếp |
| --- | --- | --- | --- |
| A1 | Mái hai cánh ngang nhìn thẳng thấy ngói đỏ (chủ đầu tư 01/11) | Trần hai cánh làm **giống gian giữa**: ván lót màu ngà dưới mặt mái, kèo, xà gồ và đòn nóc sơn son có chỉ vàng, cùng tiết diện minh họa. Không gian ba cánh hình chữ thập đọc thành một khối thống nhất. | **Đang làm** (nhánh `eng/47-wing-roof-and-light`). Kết cấu mái cánh: chờ kỹ sư. |
| A2 | Vòm vàng hai bên chạm khung trục 10, chỉ còn 0,32 m dưới tấm lót mái ở vai ngoài | **Giữ vòm liền** như chủ đầu tư chọn. Khoảng 0,32 m là đủ cho kèo trục 10–11 (sâu 0,20 m) và một máng cáp nhỏ, nhưng không đủ cho người chui. Vì vậy **mở một ô thăm 0,6 × 0,6 m trên ván vòm phía sau mỗi bàn thờ** (giấu sau phù điêu, nắp tháo được) để bảo trì đèn và dây từ bên dưới. Không hạ vòm. | Làm ngay phần mô hình ô thăm. Ô thăm, giá đỡ vòm và đường cáp: chờ kỹ sư. |
| A3 | 4 đèn chiếu tượng L115–L118 vẫn thấy được từ khoảng 28 % điểm nhìn ở lối bên | Thêm **diềm vàng (lam che) cao 0,15 m dọc sườn trước của vòm bên**, chạm cùng kiểu hoa văn. Đầu đèn lùi vào sau diềm. Không giảm độ sáng tượng (giữ khoảng 181 lux, dưới tượng chịu nạn 231 lux). | Làm ngay. Kiểm tra lại: không thấy đầu đèn từ mọi điểm nhìn trong gian giữa. |
| A4 | Lối vào cho người khuyết tật: từ sân trước −0,48 lên nền ±0 cao 0,48 m, chưa có dốc; sân dưới −2,08 lên sân trước cao 1,60 m | **Lối chính cho xe lăn đặt ở phía cửa bên H:** dốc 1:12, rộng 1,5 m, có tay vịn hai bên, chạy song song mặt tiền trên sân trước (khoảng 5,8 m) tới ngưỡng cửa bên H. Từ sân dưới: **dốc gấp khúc dọc sườn H của cầu thang lớn** (hai đoạn 1:12, chiếu nghỉ 1,5 × 1,5 m mỗi 0,75 m cao). Nếu địa hình cho phép, đường xe vào thẳng sân trước sẽ ngắn hơn. Cửa chính giữ nguyên bậc, không làm dốc chen vào hiên. | Chờ khảo sát địa hình, kiến trúc sư và chính quyền. Chủ đầu tư ngày 2/11 yêu cầu dốc cạnh tháp trái theo quy ước bản vẽ (H); theo chỉnh sửa tiếp theo, phương án dốc gấp khúc kết thúc ở phía sau tháp và chỉ có tay vịn ngoài; chưa nối lên nền nhà hoặc xác nhận chiếu nghỉ/cửa. Xem [hồ sơ lối vào](../exterior-23102026/entrance-approach.md). |
| A5 | Hai cửa bên lệch 0,135 m so với P05 | **Đã xử lý:** đặt đúng mép trụ P05 (\|Z\| 4,275–6,42). | Xong. |
| A6 | Nền thấp cung thánh 150 hay 160 mm | **Đã chốt 160 mm** theo mặt cắt (chủ đầu tư xác nhận). Nhãn +0,15 trên mặt bằng giữ ở ISSUE-R04. | Xong. Người thiết kế sửa nhãn khi phát hành bản mới. |
| A7 | Tượng Đức Mẹ và Thánh Giuse: kích thước, bệ, ngách | Tượng cao khoảng 1,6 m (tỷ lệ với vòm bên); ngách màu xanh như ngách tượng chịu nạn; bệ đá trắng cao 0,9 m. Thống nhất ngôn ngữ đỏ, vàng, xanh của cung thánh. | Chờ giáo xứ chọn tượng thật. Mô hình hiện là khái niệm. |
| A8 | Trụ áp tường cạnh tháp (\|Z\| 7,1–7,6) chưa đối chiếu CAD | Đối chiếu E01B/P05 và dựng lại như trụ tầng trệt mặt tiền nếu lệch. | Làm ngay (đợt sau). |
| A9 | Thiết kế ô cửa trục 2: chiều cao cánh, khung đá, ngưỡng | Cánh gỗ sơn dầu nâu như hiện tại; khung đá trắng; ngưỡng đá thấp 20 mm có vát (để xe lăn qua được). | Chờ kiến trúc sư chi tiết hóa. |

## 2. Chiếu sáng

| # | Vấn đề | Quyết định kiến trúc | Trạng thái |
| --- | --- | --- | --- |
| L1 | Hai cánh ngang còn tối (chủ đầu tư 01/11) | Mục tiêu **≥ 350 lux trung bình** trên ghế cánh ngang, đều sáng. Tăng đèn chiếu từ trên xuống gắn vào kèo của trần mới, hắt nhẹ lên trần ván ngà cho không gian sáng sủa. Giữ mạch L8 và nút bấm hiện có. | **Đang làm** (cùng nhánh với A1). |
| L2 | Ước tính chiếu sáng dùng dữ liệu catalog, chưa có IES/LDT thật | Chọn sản phẩm đèn trước (ưu tiên hãng có file IES, CRI ≥ 90, 2700 K, không nhấp nháy), rồi tính lại bằng phần mềm chuyên dụng. | Chờ kỹ sư chiếu sáng. |
| L3 | Đèn thoát hiểm và chiếu sáng sự cố | Thiết kế riêng theo QCVN, không gộp với đèn trang trí. | Chờ kỹ sư điện. |
| L4 | Độ chói trên sơn mài và vàng thếp ban đêm | Thử mẫu tại chỗ (mock-up) một khoang trước khi đặt hàng. | Chờ thi công thử. |

## 3. Âm thanh

| # | Vấn đề | Quyết định kiến trúc | Trạng thái |
| --- | --- | --- | --- |
| S1 | Biên chống hú micro bục giảng 0,9 dB, bàn thờ 1,4 dB (mục tiêu ≥ 6 dB) | Đổi sang **micro cổ ngỗng siêu cardioid** ở bục giảng và bàn thờ. Lùi loa chính khỏi trục micro, thêm bộ chống hú tự động trong bàn trộn. Cha đọc gần micro 15–20 cm. | Làm ngay phần mô hình (đổi loại micro, hướng loa), rồi tính lại. Thử thực tế khi lắp. |
| S2 | Độ rõ lời ở hai cánh ngang (STI tối thiểu 0,41, mục tiêu 0,45) | Thêm **2 loa bù trễ nhỏ mỗi cánh**, giấu trong kèo trần mới (A1), đặt độ trễ theo khoảng cách tới loa chính. | Làm ngay sau khi trần cánh xong. |
| S3 | Trần ván mới ở hai cánh đổi âm học | Ván gỗ có khe hở và lớp bông khoáng phía trên để hút âm. Dải tần trung cần giữ thời gian vang khoảng 1,2–1,5 s khi đầy người. | Chờ kỹ sư âm học. |

## 4. Điện và điều khiển

| # | Vấn đề | Quyết định kiến trúc | Trạng thái |
| --- | --- | --- | --- |
| E1 | Công cụ ngân sách cáp tính sai mạch ổ cắm (cable-load-review.md) | Đổi phương pháp: **mạch ổ cắm tính theo dòng định mức của mạch (16 A) và hệ số đồng thời**, không cộng dồn công suất dự phòng như đèn. Sửa xong mới dựng lại `output/electrical-review/`. | Làm ngay phần mã. Kỹ sư điện kiểm tra độc lập trước khi dùng. |
| E2 | Nguồn cấp, số pha, tiếp địa, dòng ngắn mạch | Hỏi điện lực và đo tại chỗ. Thiết kế tủ DB-1/DB-2 theo kết quả. | Chờ giáo xứ cung cấp và kỹ sư điện. |
| E3 | Ống đứng tháp sát phào vòm, ống tầng 4 ra ngoài trụ (ENG-042) | **Đưa ống đứng vào góc trong của phòng tháp**, đi thẳng đứng trong hộp kỹ thuật cạnh cầu thang (tháp B) hoặc cạnh tủ điện (tháp H). Không đi trong trụ. | Làm ngay phần mô hình tuyến. Chờ kỹ sư điện. |
| E4 | Chiều cao ổ cắm cung thánh | **0,40 m trên sàn hoàn thiện tại chỗ.** Mặt ổ màu sơn tường hoặc màu gỗ. | Làm ngay (dời trong mô hình). |
| E5 | Điều khiển tại chỗ khi mất mạng | Mỗi khu có nút bấm cơ tại tủ. Chế độ nhanh (lễ, cầu nguyện, dọn dẹp) chạy không cần internet. | Đã có trong thiết kế điều khiển; chờ thiết kế phần cứng. |

## 5. Kết cấu và vật liệu (chỉ nêu ý đồ, kỹ sư quyết định)

| # | Vấn đề | Ý đồ kiến trúc | Trạng thái |
| --- | --- | --- | --- |
| K1 | Tiết diện gỗ mái (kèo 0,26 × 0,34 m, xà gồ 0,14 × 0,22 m, đòn nóc 0,30 × 0,28 m) chỉ là minh họa | Giữ **vẻ đậm, chắc** như hiện tại. Kích thước thật theo tính toán. Ưu tiên gỗ chống mối (lim, đinh), xử lý chống mối, sơn son nhiều lớp. | Chờ kỹ sư kết cấu. |
| K2 | Vòm vàng, ván vòm, giá treo đèn dưới sườn vòm | Khung gỗ nhẹ treo vào kèo trục 10–11, ván dán chống ẩm thếp vàng. Không đặt tải lên khung chạm. | Chờ kỹ sư kết cấu. |
| K3 | Tấm đế quạt trục 2′, móc đèn chùm vào đòn nóc, giá đèn cánh ngang | Bu lông neo hóa chất vào tường và cột. Móc đèn chùm qua bản thép ôm đòn nóc. | Chờ kỹ sư kết cấu. |
| K4 | Bục cung thánh, nền thấp, bậc khoét | Sàn bê tông cốt thép trên tường xây, mặt đá. Mép bậc có rãnh chống trơn. | Chờ kỹ sư kết cấu. |
| K5 | Trụ góc tháp, chân trụ đi xuống −0,48, móng tháp | Theo CAD. Móng và cốt thép theo khảo sát địa chất. | Chờ khảo sát địa chất và kỹ sư. |

## 6. Hồ sơ, bản vẽ và công bố

| # | Vấn đề | Quyết định | Trạng thái |
| --- | --- | --- | --- |
| D1 | Xác nhận bản CAD 23/10/2026 là bản thiết kế chính thức (ISSUE-R01) | Giáo xứ ký xác nhận bằng văn bản với người thiết kế. | Chờ chủ đầu tư. |
| D2 | Đơn vị trong file DWG (ISSUE-R06: INSUNITS = inch) | Người thiết kế mở file gốc và xác nhận đơn vị mm. | Chờ người thiết kế. |
| D3 | Mặt trong và mặt sau tháp, hoa hồng ET (ENG-040) | Xin bản vẽ mặt cắt tháp từ người thiết kế. Trong lúc chờ, mô hình giữ như hiện tại. | Chờ người thiết kế. |
| D4 | Ảnh bản vẽ và ảnh nhà thờ khác (H1, H2) | Không công bố bản vẽ gốc. Xin giấy phép bằng văn bản hoặc xóa khỏi lịch sử Git. | Chờ chủ đầu tư. |
| D5 | Bài kiểm tra cũ `verify_wing_review.cjs` (chụp nhanh ngày 9/10) | Giữ làm bằng chứng lịch sử, không chạy như kiểm tra hiện hành. Các kiểm tra mới thay thế. | Xong (đã ghi trong wing-review.md). |
| D6 | Dải chữ có thể chồng nhau ở trang 3 bộ bản vẽ A3 | Xem trang 3, dời nhãn nếu chồng thật. | Làm ngay. |

## Thứ tự làm đề xuất

1. **Đang làm:** trần và khung gỗ mái hai cánh, tăng đèn cánh ngang (A1, L1).
2. **Đợt tiếp theo:**
   - Phần làm ngay trên phần mềm: diềm che đèn tượng (A3), ô thăm vòm (A2), micro và loa (S1), loa bù trễ cánh (S2), ống đứng tháp (E3), chiều cao ổ cắm (E4), sửa phương pháp ngân sách cáp (E1), trụ áp tường cạnh tháp (A8), trang 3 bản vẽ (D6).
   - Mỗi mục một commit có kiểm tra, rồi mở PR vào `dev`.
3. **Gửi giáo xứ:** D1, D2, D4, lối xe lăn (A4), chọn tượng (A7), nguồn điện (E2).
4. **Gửi kỹ sư:** toàn bộ mục 5, các mục L2–L4, E2, S3, cùng hồ sơ câu hỏi trong `questions-for-parish-and-designers.json`.

Các kiểm tra hiện tại (01/11/2026, `dev` cục bộ `648bb93`): mô hình, công trường, mặt ngoài, ước tính, khoảng hở quạt, chuyển đổi bố trí đã lưu, web và bộ bản vẽ A3 đều đạt. Trình mô phỏng chỉ còn dừng ở biên chống hú micro (S1). Các con số chiếu sáng và âm thanh là ước tính mô phỏng, chưa đo thực tế.
