# Đầu nhà phía cung thánh, đầu cánh ngang và đường diềm mái — phiên bản 23102026

Đối chiếu ngày 26/10/2026, theo yêu cầu chủ đầu tư dùng DWG lưu ngày 23/10/2026 làm cơ sở mô hình. **Bản mô hình phục vụ phối hợp thiết kế; không dùng để thi công.** Các giữ chờ ISSUE-R05 về mái, ISSUE-R06 về đơn vị và các giữ chờ kết cấu vẫn còn nguyên.

## Nguồn và cách đối chiếu

- DWG có SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`, bản chuyển DXF cục bộ đã được lượt kiểm tra số liệu trước đối chiếu với DWG. Đọc trực tiếp đối tượng LINE/ARC/CIRCLE bằng handle, không đo tỷ lệ trên ảnh hay PDF.
- **E03, tờ 3:** mặt đứng đầu nhà đối diện hai tháp, phía cung thánh. Đổi tọa độ CAD mm sang mô hình: `Z = (x − 1587256,3)/1000`, `Y = (y + 518026,8)/1000`.
- **EW, hình phía ngoài bên trái:** mặt đứng đầu cánh ngang. Dùng tâm hoa hồng CIRCLE `DAB82A` tại `x = 1543735,591446434` làm `u = 0`; `Y = (y + 518026,8)/1000`. Hình phía trong ở bên phải là nguồn khác, không dùng đường kết cấu phía trong làm trang trí phía ngoài. `u` là tọa độ cục bộ của mặt đứng, không đổi dấu Z của toàn mô hình.
- **E02:** mặt đứng bên. `X = (x − 1404501,3)/1000`, cùng mốc Y nêu trên. Hoa hồng của cánh nằm ở `X ≈ 40,575045 m`, khớp tâm gian 9–10 của mô hình trong 0,1 mm; giữ tim mô hình `X = 40,575 m`.
- [Bảng chứng cứ](roofline-witnesses.json) giữ 85 đối tượng, handle, tọa độ CAD gốc và tọa độ mặt đứng đã đổi đơn vị. `scripts/measure_roofline_dwg.py --verify` đọc lại DXF, kiểm tọa độ/radius/góc và tính các cực trị từ đường tròn/cung tròn. Hai nhánh đọc vẫn phụ thuộc LibreDWG; chưa có xác nhận AutoCAD/ODA độc lập hay khảo sát thực tế.

Đơn vị mm/m được diễn giải từ chuỗi kích thước và nhãn cao độ. `INSUNITS=1` của tệp gốc vẫn phải được người thiết kế xác nhận; không tự nhân hoặc chia hình học theo 25,4.

## Các sai khác đã sửa

Các giá trị dưới đây là số đọc hình học, không phải độ chính xác khảo sát.

| Bộ phận | Trước | Sau đối chiếu | Chứng cứ |
| --- | --- | --- | --- |
| Đỉnh lan can trên mái hiên | +7,050 m | +7,073919 m | E02 LINE `D99C62`; bốn đường ngang `D99C5F`–`D99C62` |
| Chân/đầu con tiện lan can | +6,470 đến +6,950 m | +6,373919 đến +6,923919 m | E02 LINE `D99258`, `D99C5F`; bệ 50 mm, dải tay vịn 150 mm |
| Đỉnh chóp trên từng trục hiên | +8,000 m | +8,026327 m | E02 ARC `D9B1A6` |
| Hoa hồng đầu cánh ngang | Tâm +7,550 m; bán kính vòng ngoài thực tế 0,850 m | Tâm +7,571529 m; vòng ngoài 0,810 m | EW CIRCLE `DAB82A`; E02 `D954E0` đối chiếu độc lập theo hình khác |
| Hoa hồng đầu nhà phía cung thánh | Tâm +10,000 m; vòng ngoài thực tế 0,850 m | Tâm +9,988501 m; vòng ngoài 0,810 m | E03 CIRCLE `D902FD` |
| Đường diềm mái dốc đầu nhà | Hai đoạn dốc và bề dày cộng thêm 450 mm theo dạng gần đúng; mép trên tại gian giữa lên +12,900 m | Tứ giác có bốn góc đúng trên CAD; đầu dải ngang ở +12,471822 m | E03 LINE `D907AD`, `D907B9`, `D907B0`, `D907BA`, `D9017F` |
| Đường diềm mái dốc cánh ngang | Đầu trên của một đoạn lên +10,070 m | Góc vát theo CAD, nối dải ngang ở +9,829529 m | EW LINE `DAC46A`, `DAC465`, `DAC4DF`, `DAC4E4`, `DAB42C` |
| Hốc trang trí trên hai đầu hồi | Đường cong bậc hai gần đúng; nửa bề rộng 620 mm | Ba cung tròn theo tâm/bán kính/góc CAD; nửa bề rộng trong khoảng 520 mm | E03 `D9016B`, `D90172`, `D90178`; EW `DAB425`, `DAB41F`, `DAB418` |
| Điểm bắt đầu cung hốc đầu nhà | +14,400 m | +14,617703 m | E03 ARC `D9016B`, LINE `D9017D` |
| Điểm bắt đầu cung hốc cánh ngang | +11,900 m | +11,975410 m | EW ARC `DAB425` |
| Tâm quả cầu dưới thánh giá đầu nhà | +16,050 m | +16,240109 m | E03 ARC `D8FFBC`; CIRCLE `D8FFBD` là vòng trang trí phía trong, không phải biên ngoài |
| Tâm quả cầu dưới thánh giá cánh ngang | +13,400 m | +13,597816 m | EW ARC `DAB269` |
| Thánh giá đầu nhà | Các hộp và ba đầu cầu minh họa | Biên chữ thập ba thùy bằng các cung tròn bán kính 71,735280 mm; đỉnh +17,829188 m | E03 LINE `D900F8`, `D90107`, ARC `D90102`–`D90111` |
| Thánh giá cánh ngang | Đỉnh +15,200 m | Cùng dạng ba thùy; đỉnh +15,186895 m | EW ARC `DAB3A8`; đối chiếu nhãn +15,187 m |
| Chóp trụ D/E trên đầu nhà | +14,650 m | +14,895398 m | E03 ARC `D908C1` |
| Chóp trụ C/G trên đầu nhà | +11,500 m | +11,525040 m | E03 ARC `D90AC6` |
| Chóp trụ góc trên đầu nhà | +10,200 m | +10,240527 m | E03 ARC `D90684` |
| Chóp trụ ngoài trên cánh ngang | +10,750 m | +10,693644 m | EW ARC `DAC5F5` |
| Chóp trụ trong trên cánh ngang | +12,900 m | +12,893105 m | EW ARC `DAB7D7` |

Bề ngang các thân trụ cũng được sửa theo đường đứng CAD: đầu nhà tại |Z| = 10,239012–10,909012; 7,080012–7,640012; 3,265012–3,935012 m; cánh ngang tại |u| = 3,590–4,260 và 2,055–2,725 m. Đầu/thân/bệ trên trụ D/E được tách để thân trên bắt đầu đúng +9,115368 m, không kéo một thân liên tục xuyên qua dải phào giữa.

Các vòng hoa hồng hiện dùng biên vòng đúng: 810/675 mm và 628,113/592,113 mm. Bán kính tham số của TorusGeometry là tim vòng; bản cũ dùng 800 mm làm tim vòng rồi cộng tiết diện 50 mm, gây phình biên ngoài thành 850 mm. Đã sửa cách dựng để biên ngoài thực tế khớp hình CAD.

## Phần chưa thể coi là trùng hoàn toàn

- Chiều sâu đắp nổi, mặt cắt phào, hoa văn lá, thân chóp, cuộn hoa, phần cánh hoa hồng và cấu tạo sau mặt trang trí còn là hình minh họa. Chỉ các đường biên, cung tròn, tâm, cao độ và các mốc đã chỉ nguồn ở trên được chép từ CAD. Mặt phẳng đỡ sau hốc dùng bao cung CAD nhưng phần nối bị che và chiều sâu vẫn là giả hình học.
- Mặt phẳng trang trí đầu nhà hiện giữ `X = 53,240 m`. P14 LINE `D7CB0D` cho mặt tường trên khoảng `X = 53,180970 m`. Sai khác khoảng 59 mm và các phần nhô trụ chưa được đổi ở lượt này: cần phối hợp bề dày tường, phào, mái, đèn hắt và bảo trì, thay vì dịch một mặt trang trí riêng lẻ rồi coi chiều sâu là đã xác nhận.
- Hai mặt đứng không cung cấp đủ chi tiết 3D cho đường ghép, neo, thoát nước, gờ chống thấm, cốt thép hoặc độ dày chạm khắc. Không suy ra khả năng chịu lực hay cấu tạo thi công từ mô hình.
- Mái thân nhà vẫn giữ mốc mô hình đã chọn +12,472 m. Hình học E02/S24/S25 còn đỉnh khoảng +12,3964 m. Không ép các đường mái về trung bình hoặc đổi mái chỉ để khớp trang trí. ISSUE-R05 còn mở.
- Không thay đổi vị trí đèn, quạt, loa, tủ điện, tuyến cáp hoặc ID bố trí. Các thay đổi đắp nổi vẫn cần kiểm va chạm/độ che khuất tại bước phối hợp chung. Giới hạn hình học che sáng/âm của bộ mô phỏng không được coi là đã giải quyết.

## Mối nối mái với đầu hồi · 30/10/2026

Khi xem hai cánh và đầu cung thánh, các tấm mái cũ nhô quá mặt đầu hồi đang dùng trong mô hình: mái cánh đến `|Z| 13,620 m` trong khi mặt trang trí cánh ở `|Z| 13,560 m`; mái chính và mái hiên đến `X 53,400 m` trong khi mặt đầu hồi cung thánh ở `X 53,240 m`. `roofline.js` cắt phần nhô này cùng đỉnh ngói và diềm mái liên quan về đúng các mặt mô hình hiện có, trước khi chiếu kết cấu và gộp mesh. Cao độ, độ dốc, các thung mái, hình mặt đứng, lưới trục và vị trí thiết bị giữ nguyên. Bài kiểm [roof end faces](../../scripts/verify_roof_end_faces.cjs) kiểm mesh dựng thật ở cả hai phía và các mốc mái giữ lại.

Đây là **MODEL TRANSCRIPTION / CONCEPT junction**, không phải xác nhận chiều dài mái hay cấu tạo mép mái; 59 mm sai khác P14, ISSUE-R05, ISSUE-R06, kết cấu, chống thấm và thoát nước vẫn mở. Một phần mái đỏ vẫn nhìn thấy *phía sau* lan can đầu nhà theo góc nhìn: không tuyên bố mọi chồng hình đã được giải quyết. Mặt dưới đầu hồi và chạm ở cả hai cánh còn đơn giản so với EW/E03; hình hiện tại không phải bản chạm hoàn chỉnh. Không thêm/đổi thiết bị, dây, phân tích hoặc dữ liệu mặt bằng; `verify_model.cjs --plan` tạo lại mà không đổi dữ liệu. Các sổ điện đang sửa dở được giữ nguyên. Kiểm tra nhìn ngày/tối và tình trạng cây làm việc được ghi trong [hồ sơ kiểm tra](../../review/exterior-roof-ends-2026-10-30/README.md).

## Trụ tầng dưới hai cánh và đầu cung thánh · 30/10/2026

Theo yêu cầu tiếp tục đối chiếu mặt dưới, mô hình thay tám trụ giả hình cũ: hai đầu mỗi cánh ngang (bốn trụ), và hai cặp tại trục C/G và góc của đầu cung thánh (bốn trụ). Hai trụ D/E còn giữ nguyên. Tại cánh, thân mới theo EW `|u| 3,590–4,260 m`, thay thân cũ rộng 250 mm có tâm tại trục 9/10; thân mới nằm dưới trụ hồi phía trên. Tại đầu cung thánh, E03 cho thân C/G `|Z| 7,025012–7,695012 m` và góc `|Z| 10,239012–10,909012 m`, thay thân cũ rộng 300 mm. Cả hai mặt cho mép đứng thân từ `Y +1,529970` đến `+5,622216 m`; các đường rãnh nguồn chạy từ `+1,654970` đến `+5,497216 m`. Số dùng là tọa độ mô hình, không phải dung sai khảo sát. [20 chứng cứ đường CAD](lower-pilaster-witnesses.json) giữ handle và hai đầu, kể cả hai phía; các chênh lệch làm tròn dưới milimét không phải xác nhận thi công.

**DRAWING SHOWN / MODEL TRANSCRIPTION:** bề ngang và cao độ thân theo các đường nêu trên. **CONCEPT / ENGINEERING HOLD:** chiều dày nhô ra, hình rãnh và màu, chân đế, đầu trụ, chuyển tiếp về đỉnh bệ cũ `Y −0,400 m`, tiếp xúc thực, liên kết và chịu lực là giả hình phối cảnh. Các chân đế đặt trọn trên bao bệ đang mô hình và phần đầu gặp mốc chân trụ trên; điều này không chứng minh bệ hay tường chịu được tải. Không thay cửa, mặt bằng, cao độ mái, thiết bị, công suất, hướng, dây hoặc điều khiển. Bộ kiểm [hình học và bao thiết bị](../../scripts/verify_lower_pilasters.cjs) kiểm tám mặt, các lỗ cửa, tiếp xúc bao bệ, 409 bao thiết bị tĩnh và tim của 429 tuyến đang mô phỏng, không giao với bao trụ mới; không xác nhận bề dày cáp, khoảng bảo trì, độ che ánh sáng/âm, chống thấm hay kết cấu. Phép đọc nguồn và ảnh bốn phía nằm trong [hồ sơ](../../review/lower-facades-2026-10-30/README.md). Mọi giữ chờ ISSUE-R05/R06, ENG-027, ENG-039–041 và thiết kế kỹ thuật khác vẫn mở; chi tiết chạm còn thiếu, không gọi toàn bộ mặt đứng đã khớp CAD.

## Thực hiện và kiểm tra

`Thach_Bi_Viewer/roofline.js` giữ nhóm và tên bộ phận phục vụ phân lớp. Cung CAD được chia đoạn với sai số dây cung tối đa **0,5 mm trong mô hình**; đây là sai số hiển thị so với cung nguồn, không phải dung sai thi công. Đường tròn vòng hoa hồng được chia 96 đoạn; độ võng dây cung của vòng ngoài khoảng 0,43 mm. Thánh giá là hình đùn từ biên mặt đứng; bề dày 100 mm vẫn là giả định hiển thị.

Đã kiểm cú pháp JS/Python và đọc lại chứng cứ CAD bằng trình kiểm nêu trên. Phần kiểm hình học thực tế, mô hình/công trường/mô phỏng/website và nhìn ngày–tối trên desktop được tổng hợp trong bản ghi tích hợp của lượt sửa ngoài nhà. Bản vẽ/ảnh chồng CAD giữ ở thư mục `exports/` cục bộ theo H1; không đưa bản vẽ của đơn vị thiết kế vào Git.
