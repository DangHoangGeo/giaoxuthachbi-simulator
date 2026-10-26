# Hai bên nhà thờ: đối chiếu bản vẽ 23102026

Kiểm tra ngày 26/10/2026. Bản DWG lưu 23/10/2026, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Các trị số CAD đang được diễn giải theo mm/m; `INSUNITS=1` còn chờ người thiết kế xác nhận (**ISSUE-R06**). Đây là bản chép hình học để phối hợp mô hình, **không dùng để thi công**.

## Đã sửa: lòng vòm C/G của gian 9–10

`porches.js` trước đây dùng đường Bézier tự dựng, đi thẳng từ mép cột rộng thông thủy 6,606 m lên vai vòm rồi đến đỉnh. Công thức cộng thêm 40 mm tại đỉnh và không có đoạn gối ngang của bản vẽ. Bản vẽ chi tiết **D47, tờ in 47** dùng bốn cung tròn thực, có hai đoạn ngang ngắn tại chân cung. Mô hình nay dùng đúng các cung và các đoạn gối ấy. Phần rìa vòm dày 250 mm và chiều đùn 300 mm được giữ để hiển thị nhưng ghi rõ là hình học tạm, không được coi là tiết diện do D47 quy định.

| Mốc | Số liệu chép từ CAD | Chứng cứ |
| --- | ---: | --- |
| Nhịp trục 9–10 | 7 200 mm | DWG0715, DIMENSION `DA5CE2` |
| Khoảng giữa hai mặt cột | 6 606 mm | DWG0717, `DA5CDC` |
| Cao chân cung từ chân cột D47 | khoảng 5 474,155 mm | DWG0726, `DA5CEE` |
| Cao vai cung từ cùng mốc | khoảng 7 147,420 mm | DWG0725, `DA5CF1`, và các đầu cung tròn |
| Cao đỉnh lòng vòm | khoảng 8 503,190 mm | DWG0724, `DA5CF4`, và đỉnh cung `DA5B34`/`DA5B43` |
| Đoạn gối ngang mỗi bên | khoảng 99,996 mm | LINE `DA5B36`/`DA5B45` |
| Hai cung dưới | bán kính khoảng 1 726,438 mm | ARC `DA5B35`/`DA5B44` |
| Hai cung trên | bán kính khoảng 2 088,624 mm | ARC `DA5B34`/`DA5B43` |

Các tâm, góc, đầu cung và phép đổi tọa độ nằm trong [side-witnesses.json](side-witnesses.json). Tâm vòm lấy từ trung điểm hai trục được ghi kích thước; mốc cao lấy từ đầu dưới của đường kích thước `DA5CEE`. Mô hình đặt tâm tại X = 40,575 m và Z = ±7,360 m. Việc gán chân cột D47 vào Y = 0 là cách đọc hiện hành của mô hình, không phải xác nhận cao độ ngoài hiện trường; D47 không có nhãn cao độ tuyệt đối riêng.

Mỗi cung chia 48 đoạn để dựng lưới. Độ võng dây cung lớn nhất dưới 0,20 mm là giới hạn tái hiện bằng lưới của phần mềm, không phải độ chính xác khảo sát hay dung sai thi công. Các điểm đầu, vai và đỉnh của cung đều được giữ. Hai bên C/G dùng cùng bản chép; các trục, sàn, cột, lối đi, thiết bị và tuyến điện không di chuyển.

## Đã sửa: cặp cửa sổ theo loại phía ngoài được chủ đầu tư chọn

Loại cửa sổ phía ngoài E26/D29 đã được chủ đầu tư chuyển vào tường C/G được sửa đồng bộ cả **lỗ tường, kính dưới, ô kính vòm, thanh ngang và cánh chớp**. Bản trước dùng vòm elip cao 507 mm và cắt kính dưới ở +3,000 m. CAD dùng cung tròn bán kính 500 mm, với dải ngang 150 mm. Mô hình nay giữ các mốc sau:

| Mốc của loại cửa sổ đã chọn | Giá trị mô hình theo CAD | Nguồn |
| --- | ---: | --- |
| Bậu cửa | +0,850 m | DWG0255, `DA3D35` |
| Đầu cánh/kính đứng | +2,9505 m | 850 + 2 100,5 mm; DWG0251, `DA3D38` |
| Chân cung | +3,1005 m | Thêm 150 mm; DWG0252, `DA3D51` |
| Đỉnh lỗ cửa và kính vòm | +3,6005 m | R500; ARC `DA3D3D`/`DA3D44` |
| Các bán kính phào quanh vòm | 500 / 610 / 688 / 708 / 778 / 793 / 828 mm | ARC `DA3D3D`–`DA3D43` |

28 ô kính vòm tại 14 gian cửa sổ của hai tường C/G được sửa; bảy gian mỗi bên. Vị trí các gian và khoảng cách tim cặp cửa ±1,015 m được giữ theo phương án đã chọn; chênh trụ giữa 1 000/1 030 mm vẫn được nêu dưới đây. Bốn cửa sổ ở mặt ngoài cánh 9–10 thuộc mặt đứng EW được giữ riêng, chưa gán số đo E26 cho chúng. Chiều sâu phào và vật liệu thanh ngang còn là cách thể hiện, không phải chi tiết chế tạo được duyệt.

## Giữ chờ: loại cửa đi mới và biển thoát hiểm

CAD E31/D34 ghi cửa đi loại ngoài rộng 2 250 mm, đầu cánh +2,9505 m (`DWG0288`), chân cung +3,1005 m (`DWG0636`), cung tròn R1125 (`DA308E`/`DAD2CC`), nên đỉnh lòng vòm +4,2255 m. Dải ngang theo đó chỉ cao 150 mm. Khi thử gán đồng bộ hình học này, phép kiểm tra thật `verify_doorhead_signs.cjs` phát hiện biển **L156–L159** không còn nằm dưới kính vòm.

- Hộp biển đang mô phỏng cao 170 mm. Đặt giữa dải 150 mm sẽ chạm vùng cánh và vùng kính vòm 10 mm mỗi phía; đây không phải vị trí lắp phù hợp đã được kiểm tra.
- Bộ gán biển tự lấy tâm dải ngang sẽ hạ tâm từ +3,061 xuống +3,0255 m. Không chấp nhận việc tự dời này trong thay đổi kiến trúc.
- Nếu giữ nguyên tâm +3,061 m, đỉnh hộp biển khoảng +3,146 m sẽ cao hơn chân kính mới +3,1005 m khoảng 45,5 mm.

Vì vậy **chưa áp dụng loại cửa đi CAD mới**. Mô hình tạm giữ nguyên loại cửa trước: rộng 2,250 m, đầu cánh +2,951 m, dải ngang 220 mm tới +3,171 m, vòm elip cao 1,140 m tới +4,311 m. Đây là phần khác bản DWG mới được giữ có chủ ý, không ghi là đã đúng CAD. Các biển L156–L159 giữ tâm Y = +3,061 m, chân/đỉnh hộp khoảng +2,976/+3,146 m, dưới chân kính hiện hành +3,171 m. ID, vị trí, kích thước, mạch E1 và tuyến dây của biển không đổi.

Cần phối hợp kiến trúc sư, người thiết kế điện/thoát hiểm và sản phẩm biển cụ thể để chọn vị trí/gối lắp rồi kiểm tra và cập nhật sổ thiết bị/tuyến điện. Không thu nhỏ hộp biển hoặc tự dời thiết bị để che xung đột. Số liệu loại cửa CAD được lưu ở `openings.doorCandidate` và [bảng chứng cứ](side-witnesses.json), trạng thái **ENGINEERING HOLD · NOT APPLIED**. Bộ nhận dạng/gán biển hiện hành được giữ nguyên cùng dải 220 mm; không thêm cơ chế tự dời biển theo dải 150 mm. Phép kiểm tra khe hở không bị nới.

## Giữ theo chỉ đạo chủ đầu tư, cần người thiết kế phối hợp

[Quyết định cuộc họp ngày 25/10/2026](../engineering/parish-meeting-2026-10-25.md) quy định hiên B–C/G–H thoáng, chỉ có cột ngoài và vòm nhọn; cửa đi/cửa sổ ở tường C/G phía trong; không có cửa từ hai bên gian thánh ra hiên. Những quyết định đó được giữ:

- 11 cột, 9 vòm dọc mỗi bên trên các đoạn trục 2′–9 và 10–12; bậc đi lên và chỗ mở lan can theo bố trí đã chọn. Kích thước cột, vòm dọc, vòm ngang, lan can và gối tựa còn là đề xuất.
- Hai cửa sổ rộng 1 000 mm mỗi gian ở tường C/G, thay cho lỗ cửa đơn của mặt đứng phía trong CAD. Đây là quyết định bố trí của chủ đầu tư, không phải hai bản vẽ đã hoàn toàn khớp nhau.
- Bản mặt bằng P28 ghi trụ giữa cặp cửa 1 030 mm (`DWG0081`/`DAD594`); mặt đứng E26 lại ghi 1 000 mm (`DWG0247`/`DA3D29`). Mô hình đang giữ 1 030 mm. Không tự gộp hai trị số.
- Mặt đứng phía trong E26 ghi lỗ đơn 1 760 mm (`DWG0243`/`DA35E1`), còn mặt bằng P28 ghi lỗ đơn 2 250 mm (`DWG0091`/`DAD57F`). Việc chuyển cặp cửa ngoài vào tường trong cần được kiến trúc sư phát hành lại chi tiết thống nhất cả hai mặt tường.
- Cao mái vẽ và cao ghi +12,3964/+12,472 m, phào 6 324/6 325 mm và các mốc chiều dài khác nhau vẫn giữ chờ như sổ gốc. Không dùng phần sửa vòm này để coi những mâu thuẫn đó đã giải quyết.

## Phạm vi còn thiếu và kiểm tra

Phần vòm hẹp hiển thị trong mô hình chưa phải toàn bộ khung bê tông có cạnh trên theo mái của D47. Chiều dày theo phương Z, lớp hoàn thiện, cốt thép, liên kết, tải và đường truyền lực chưa được thiết kế. Các chi tiết hoa văn, mặt cắt cột, bậc và lan can còn là hình học minh họa. Cần kiến trúc sư/kỹ sư giải quyết các mặt cấu tạo và mốc còn khác nhau trước chế tạo hay thi công.

Kiểm tra tập trung: `node scripts/verify_side_dwg.cjs` đối chiếu tham số và các đầu cung theo bảng chứng cứ độc lập, các điểm trên đường tròn, nhịp mặt cột, chuỗi cao và sai số chia cung; kiểm tra đúng lỗ tường/kính vòm được dựng của 14 gian cửa sổ. `node scripts/verify_doorhead_signs.cjs` xác nhận biển giữ nguyên sau khi giữ chờ loại cửa mới; phép thử với loại cửa mới không đạt và được lưu làm bằng chứng xung đột. `node scripts/verify_model.cjs` chạy mô hình thật và kiểm tra các cột/vòm/hiên, cửa, lối đi cùng các phần hiện hành. Cú pháp JavaScript và `git diff --check` cũng đã kiểm tra. Việc xem trên desktop và các kiểm tra mô hình/hệ thống tổng hợp do lượt tích hợp chung thực hiện.

Không có thay đổi thiết bị/tuyến điện hoặc dữ liệu nhập Excel trong phần sửa này. Hình CAD/ảnh chồng nguồn giữ cục bộ theo **PUBLICATION HOLD H1**; chỉ chứng cứ hình học dẫn xuất và mã mô hình được lưu cùng thay đổi.
