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

## Trang trí hai cánh ngang theo EW · 3/11/2026

Chủ đầu tư yêu cầu hai đầu cánh ngang "giống hệt trang trí thiết kế". Các đường nét chạm được vẽ lại từ mặt đứng ngoài EW (u = x_CAD − 1543735,591, v = cao độ thế giới) vào `facade-crest-profile.js` (11 bộ, 1.232 dòng cung/đoạn; `scripts/verify_facade_crest_source.py` đối chiếu từng dòng với DXF) và thể hiện bằng ống đường viền T12 (độ nổi CONCEPT).

- **Tầng trệt:** cột góc theo `drawnPier()`; diềm EW (răng cưa, gờ, chữ Vạn, mũ) thay gờ mái bundle; hoa lá góc cạnh cột (`wingSpandrel`); cửa sổ dời về tâm vẽ ±2,45 (trước ±2,4), vòm theo bán kính E26 (realism.js), cột nhỏ hai bên có thân tròn r 0,065, trụ tựa, chân, đầu cột chạm (`windowCapital`), bàn đầu cột, gờ chân vòm; ô panô dưới cửa với hoa thị (`windowRosette`) thay lan can thấp và rãnh của bundle.
- **Tầng hồi:** đầu cột chạm theo EW (trong/ngoài), mũ cột +0,312; cột trong có bệ +9,795–11,191 (thân có trán tam giác, các đai, tấm biển nhỏ, mũ); chân cột ngoài có trán tam giác giữa hai khối (+6,324–6,577); răng cưa dài/ngắn xen kẽ dưới dải đỉnh (0,387/0,221) và dưới các mái dốc (0,387/0,27); hoa văn ô hồng vẽ lại (`wingRose`).
- **Khám đỉnh:** gờ chân và gờ đầu trụ theo EW; tháp nhỏ Gothic (thân có ô cửa nhọn, mái hiên, trán, chóp, vòng cổ, hoa huệ) thay chóp chung; công-xôn lá ô-rô (`wingVolute`) trên tấm nền có biên DERIVED thay thanh cuộn; hoa văn cuộn quanh quả cầu (`wingCrest`), chân quả cầu tiện theo EW, tia quanh thánh giá (`wingRays`).
- Đầu hồi phía cung thánh (E03) dùng cùng các bộ phận nên cũng được cập nhật theo EW; E03 chưa được đối chiếu riêng từng chi tiết.
- **Giấy phép:** yêu cầu ngày 3/11 được ghi nhận là chỉ đạo của chủ đầu tư; việc công bố các đường nét EW/E02 nằm trong **PUBLICATION HOLD H1** cho tới khi chủ đầu tư xác nhận phạm vi như đã làm với E01B.

## Đầu hồi phía cung thánh đối chiếu riêng với E03 · 3/11/2026

Lượt này so từng chi tiết E03 (u = (x − 1587256,3)/1000 = Z mô hình phía H, v = (y + 518026,8)/1000) với mô hình và với EW. Cách so: đổi các LINE/ARC của một vùng E03 sang khung của EW rồi tìm đối tượng trùng trong 1 mm. Kết quả cho phép dùng lại nét EW ở những chỗ trùng và chỉ vẽ lại riêng những chỗ E03 khác. Mọi phần dùng chung trong `roofline.js` được tham số hóa để hai cánh ngang không đổi: dấu vân tay hình học của toàn bộ phần mái-diềm có X < 50 m (273.016 tam giác) giữ nguyên trước/sau.

**Trùng EW (dùng lại, DRAWN theo E03):**

- Trụ tầng trệt C/G và góc: trùng trụ EW trong 1 mm (483/496 đối tượng ở trụ góc; phần lệch là cung cửa sổ bên cạnh); giữ `drawnPier()`.
- Đầu cột trụ góc tầng hồi (+7,409277–7,754277): trùng `wingCapOuter` dịch −0,453 m (233/257).
- Hoa hồng: 204/204 đối tượng trùng `wingRose` dịch −2,417 m. Khám đỉnh (tháp nhỏ, công-xôn, hoa văn quanh quả cầu, chân quả cầu, thánh giá): 1.069/1.120 trùng EW dịch −2,642 m; phần lệch là chóp hoa của diềm dốc ở chân khám và vài tia thánh giá lệch dưới 0,3 mm.
- Răng cưa dưới hai mái dốc: cùng độ dốc 0,7496 và cùng răng 66,3 mm dài/ngắn như EW; lệch pha khoảng 3 mm, chưa chỉnh.

**Khác EW, đã sửa theo E03:**

| Bộ phận | Trước | Sau | Chứng cứ E03 |
| --- | --- | --- | --- |
| Trụ D/E tầng trệt | Trụ giả hình của bundle rộng 0,30 m, cao tới +8,575 | Trụ vẽ chung: chân, bệ hoa thị và thân như EW, thân và rãnh kéo lên tới +7,8737 / +7,7487; đầu cột EW và gờ nâng 2,251448 m (+7,8737–8,575367) | LINE `D90722`, các đường ngang +7,9137–8,5754 |
| Diềm tầng trệt | Chỉ một thanh giả hình giữa C/G và góc; không có diềm giữa D/E và C/G | `drawnEntablature()` từ mặt trụ D/E (|Z| 3,935) tới tim trụ góc (10,574), hai bên; răng dài tâm tại ±(4,08245 + k·0,1326) | LINE `D90581`, `D9674E`–`D96751`, `D9681E`, `D968AB`–`D968AD`, `D96BA7`–`D96BBE` |
| Dải giữa giữa hai trụ D/E | Khối phẳng, chữ Vạn và răng tự đặt | Chính diềm trên, nâng 2,251448 m: răng +7,6737–7,8737 tâm tại u 0, chữ Vạn +8,0137–8,2637, mũ tới +8,575367 | LINE `D96CDF`–`D96CE1`, `D9848F`–`D98491` |
| Trụ C/G tầng hồi | Đầu cột lá (lấy theo EW) +8,876–9,301 | E03 không vẽ đầu cột: thân có rãnh tới +8,875933, ba gờ, khối có tấm biển, hai gờ, khối thứ hai, mũ tới +9,822633 | 12 hàng ngang +8,875929–9,822633 |
| Trụ D/E tầng hồi | Đầu cột `wingCapInner`, bệ năm tầng EW co theo chiều cao | Chân như chân trụ trệt (+8,575367–9,115367); đầu cột EW trụ trệt nâng 5,863261 m (+11,485477–11,875477), gờ tới +12,18718; khối có trán tam giác và ô lõm, mũ tới +13,192991 | 20 hàng ngang +8,575367–13,192991 |

Các hàng trụ ghi trong `spec.rear.cg/de.rows` theo `[v0, v1, nửa bề rộng, loại]`; `scripts/verify_detail_rear_source.py` kiểm từng mức có đường E03 đi qua trụ (sai khác lớn nhất 0,016 mm) và nửa bề rộng do một đường E03 đạt tới (2 mm). Gờ cong (loại C) lấy nửa bề rộng trung bình của hai mép vẽ; lõi chuông đầu cột (B) là DERIVED như `drawnPier()`. Độ nhô ra khỏi tường đều là DERIVED/CONCEPT.

Gỡ khỏi nhóm bundle đầu nhà: hai trụ giả hình D/E (cả đoạn trên +6,324–11,25), thanh `Schematic beam` (cả dải tối chạy theo mái dốc), các khối chóp góc và hàng `Schematic end eave ornament`. Tường, năm cửa và phần cửa của bundle giữ nguyên.

**Va chạm cần phối hợp (không dời thiết bị):** đèn lối đi `L188`/`L195` tại (53,20; 5,20; ±4,50) nằm ngay dưới răng diềm mới (đáy +5,422, nhô tới X ≈ 53,40); khoảng hở đứng khoảng 0,2 m, cần kiểm bằng kích thước đèn thật. Dây đèn lễ `L201`/`L212` tại X 53,72 chạy trước mặt diềm dốc dưới (mặt diềm X 53,66).

**Nét chạm riêng của E03 (`detail-rear-profile.js`, `CHURCH_DETAIL_PROFILE_REAR`):** các dòng giữ handle gốc, u tuyệt đối phía H (đối xứng sang B), v là cao độ thế giới, chiều tay +1; `scripts/verify_detail_rear_source.py` đọc lại từng handle (sai khác lớn nhất 5·10⁻¹⁰). Bộ lọc là hộp u–v, bỏ đoạn dài, và với khám đỉnh bỏ các đối tượng trùng EW.

| Khóa | Nội dung | Vùng lọc | Dòng | Thay cho |
| --- | --- | --- | --- | --- |
| `rearPorchCrest` | Diềm hoa lá cuộn và hàng hoa đầu đỉnh trên lan can đầu hiên, cùng hàng hạt tròn/hình thoi của dải | u 7,645–10,235; v 6,94–7,62; đoạn ≤ 1 m | 922 | Chữ Vạn và hàng hoa huệ minh họa |
| `rearRakeCrestLow`, `rearRakeCrestUp` | Các cung lượn và chóp hoa đứng trên hai mái dốc | Trên mặt trên diềm dốc (−3 mm đến +1,3 m); u 4,0–6,875 và 1,43–3,055; bỏ nét khám trùng EW | 427 + 155 | Hoa huệ chung của `rake()` (truyền `crest=false` cho đầu nhà; cánh ngang không đổi) |
| `rearLunette` | Quạt một phần tư sát trụ D/E trên diềm trệt, vòng ngoài r 1,2317 | u 3,935–5,2; v 6,3239–7,57 | 60 | Chưa có |
| `rearArchLeaf` | Lá góc trên vòm giữa | u 1,75–3,26; v 6,42–7,6; bỏ cung vòm lớn | 73 | Chưa có |
| `rearBayLeaves` | Bốn lá góc dưới diềm trệt ở hai gian cửa sổ | u 3,94–10,235; v 4,25–5,38 | 300 | Chưa có |

Dải lan can đầu hiên dùng ba mức vẽ +6,875776 / 6,935776 / 7,015776 / 7,055776 (LINE `D90C8E`–`D90C92`). Quạt có tấm nền một phần tư đĩa dày 30 mm (DERIVED). Nét vẽ được thể hiện bằng ống đường viền (độ nổi CONCEPT); tam giác thêm khoảng 84 nghìn. Lá góc gian cửa sổ phía trong nằm ngay quanh đèn lối đi `L188`/`L195` (Z ±4,50; Y 5,20): đèn không đổi, cần bên chiếu sáng quyết định đèn ẩn hoặc dời trong bước phối hợp.
