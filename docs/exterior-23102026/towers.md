# Đối chiếu hai tháp chuông — phiên bản 23102026

Ngày kiểm tra: 26/10/2026. Phạm vi lần này: các mốc hình học mặt trước của ba tầng trên, vòm trang trí tầng trệt, đường bao chỏm tháp, đèn lồng và thánh giá. Theo phản hồi tiếp theo của chủ đầu tư, cả 18 mặt bên/trong/sau tầng trên cũ đã được thay: sáu mặt ngoài theo E02, mười hai mặt trong/sau lặp mô-típ với trạng thái DERIVED, không coi là cao độ mặt sau đã được xác nhận. **Đây là mô hình đối chiếu thiết kế, không dùng để thi công.**

## Nguồn và phương pháp

Nguồn là DWG lưu 23/10/2026, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`; tờ 1, hình **E01B** (mặt đứng đầy đủ). Đọc ARC, CIRCLE và LINE trực tiếp từ DXF của cùng DWG bằng ezdxf, không đo tỷ lệ PDF. Công thức đổi tọa độ: `Z = -(x_DWG - 1666600.3)/1000`, `Y = (y_DWG + 515946.8)/1000`. Dữ liệu hình học và handle gốc trong [tower-witnesses.json](tower-witnesses.json). Sai số kiểm tra phần mềm 2 mm không phải dung sai thi công hoặc độ chính xác khảo sát.

**ISSUE-R06 giữ nguyên:** DWG có INSUNITS=1, trong khi đơn vị mm/m đang diễn giải từ chuỗi kích thước và nhãn m. Không đổi hệ số 25,4 hoặc giải quyết đơn vị bằng hình đẹp; người thiết kế phải xác nhận trong CAD gốc. Hai nhánh đọc đều dùng LibreDWG, chưa thay thế việc kiểm tra độc lập trong AutoCAD/ODA.

## Những khác biệt đã sửa

Các giá trị dưới đây làm tròn để đọc; tọa độ đầy đủ được giữ trong JSON và `CHURCH_TOWERS.spec`.

| Bộ phận | Mô hình trước | Mốc từ DWG áp dụng |
| --- | --- | --- |
| Vòm lớn tầng 2 | Tâm theo công thức tầng +12,0405 m; dạng cong suy đoán | Tâm +12,846613 m; các bán kính 1,615339–1,955339 m; C44BEF/C44BF2 |
| Vòm lớn tầng 3 | Tâm +19,417 m; dạng cong suy đoán | Tâm +19,973454 m; bán kính 1,615–1,925 m; C44C3F/C44C40 |
| Vòm lớn tầng 4 | Tâm +26,0555 m | Tâm +26,610772 m; bán kính 1,303693–1,493693 m; C44C8A/C44C8C |
| Cửa chớp đôi tầng 2 | Tim hai ô gần nhau theo tỷ lệ bề rộng tầng | Z = +9,257577/+11,048291 m; tâm cung +11,867964 m; bán kính lọt vòm 0,499643 m |
| Cửa chớp đôi tầng 3 | Tim và cung theo tỷ lệ tầng | Z = +9,257934/+11,047934 m; tâm cung +19,317964 m; bán kính 0,500 m |
| Cửa chớp đôi tầng 4 | Tâm cung khoảng +25,6155 m | Z = +9,457112/+10,825806 m; tâm cung +26,149596 m; bán kính 0,399347 m |
| Đáy cửa chớp tầng 2/3/4 | +8,960/+16,410/+23,710 m | +9,049969/+16,499969/+23,799970 m, cao hơn khoảng 90 mm; theo các LINE C43808/C4386F/C4427E |
| Hoa hồng tầng 2/3/4 | Cao độ theo công thức của tầng, thấp khoảng 0,4–0,48 m | +13,277964/+20,612392/+27,191525 m; vòng ngoài 0,540/0,540/0,444213 m |
| Vòm lớn tầng trệt | Tâm +4,0 m, chỉ hai dải bán kính gần đúng | Tâm +3,984770 m; tám biên bán kính 1,385–1,955 m, từ C449B6..C449BD |
| Vòm kín nhỏ tầng trệt | Tâm +2,85 m; bán kính 0,8–1,15 m | Tâm +2,899970 m; bán kính 0,824479/0,974479/1,139479 m; C45764..C45766 |
| Chỏm tháp | Đường ellipse, bán kính chân khoảng 1,7 m; đỉnh +32,75 m | Hai cung tròn lệch tâm R=2,628674 m, C4568C/C45696; đỉnh +32,790457 m; không thay bằng ellipse |
| Hoa hồng chỏm | +31,8 m | +31,699584 m, vòng ngoài 0,444213 m; C44293/C44294 |
| Bệ/đèn lồng | Các mức +32,75/+32,95/+33,05 m gần đúng | Tiếp xúc tại +32,790457; các mốc +32,983342/+33,111065/+33,231658/+33,731658/+33,861658 theo LINE gốc |
| Quả cầu/thánh giá | Cầu +35,3 m; thánh giá ghép thanh và cầu ba múi gần đúng | Cầu +35,212763 m, R≈0,210895 m; đường bao thánh giá truy từ LINE/ARC, tay ngang giữa +36,346670 m, đỉnh +36,919970 m |

Đã đối chiếu các cung và vòng của tháp B với tháp H: chúng là các bản sao gần đối xứng, sai dư do bản sao CAD khoảng 0,1 mm. Mô hình dùng một bộ hình học đối xứng, không diễn giải sai số bản sao dưới độ phân giải sổ thành thiết kế bất đối xứng. Riêng dịch ngang khoảng 11,5 mm của tầng trên cùng và hoa hồng chỏm được giữ theo nguồn.

## Các mặt bên, trong và sau — cập nhật sau phản hồi chủ đầu tư

[Bảng chứng cứ bổ sung](tower-other-faces-witnesses.json) giữ 116 handle E02/ET và các mặt bằng PT15A/PT23/PT29. E02 có hệ X/Y: `X=(x−1404501,3)/1000`, `Y=(y+518026,8)/1000`. Đã đọc lại trực tiếp DXF để kiểm tra từng đối tượng; không suy tọa độ X bằng cách quay số Z của mặt trước.

- **Sáu mặt ngoài tầng trên:** E02 khớp các cao độ/bán kính chính với E01B; tim X tầng 2/3 khoảng 2,450045 m, tầng 4 khoảng 2,438569 m. Dùng đúng các tim đôi cửa X, bậu, cung và tim vòng hoa hồng của E02. Tường có hai lỗ vòm thực, chớp đóng sau lỗ; không còn mặt cửa theo phần trăm chiều cao tầng của bộ dựng cũ.
- **Mười hai mặt trong/sau tầng trên:** bỏ hình cũ và dùng cùng mô-típ đã phối hợp. Các mặt bằng xác lập dạng gần vuông và các góc/trụ lặp, nhưng không chứng minh toàn bộ hoa văn mặt sau. Vì vậy mesh ghi **DERIVED REPEATED PROFILE / CONFIRMATION PENDING**, không ghi DRAWING SHOWN. ET không có tiêu đề/hướng: cung cửa phù hợp, nhưng hoa hồng tầng 2 ở +13,187964 m, thấp hơn E02/E01B 90 mm, và thiếu bộ vòm lớn. Chưa lấy ET làm mặt sau đã duyệt; kiến trúc sư cần xác nhận ENG-040.
- **Hai mặt ngoài tầng trệt:** E02 có vòm lớn chân cung +3,984770 m và tám biên R1,385–1,955 m; vòm nhỏ chân cung **+3,100470 m**, cao hơn mặt trước **200,5 mm**. Cửa sổ giữa rộng **1,000 m**, bậu **+0,849970 m**, đầu thân **+2,950470 m**, chân cung **+3,100470 m**, R0,500 m. Đã cắt lỗ thật trong tường và hai lớp phào, giữ tấm đóng minh họa sau lỗ. Chất liệu, kính, khả năng mở và độ thông thoáng thực chưa được duyệt. Hai mặt trước tầng trệt vẫn kín, cửa vào phòng tháp phía trong được giữ.
- **Phào và thiết bị:** giữ nguyên matrix của mép phào trên cả 24 mặt khi bỏ nhóm cũ, đặc biệt mép đỡ đèn +29,09 m. Không dịch đèn, không làm mới gối đỡ để vượt phép kiểm.

## Những gì được giữ và chưa xác nhận

- Giữ mặt trước tầng trệt kín theo chỉ đạo chủ đầu tư ngày 25/10/2026. Cửa vào phòng tháp, cầu thang khái niệm, chân tháp và chỗ đặt thiết bị không đổi.
- Giữ đúng các mặt phẳng X và bao ngoài của tường tầng trên hiện hành. Bề dày tường, độ sâu phào/vòm, tiết diện kết cấu chưa được coi là số đo thi công. Mặt tường tầng trệt X=0 vẫn là sai khác đã ghi trước với mặt bằng CAD khoảng 0,5 m; lần này không dịch cả tháp hoặc thiết bị để che sai khác đó.
- Cả 24 mặt tầng trên mới có tường và hai lỗ cửa; sáu mặt trước/sáu mặt ngoài theo nguồn, mười hai mặt còn lại là lặp DERIVED; chớp kín đặt sau lỗ cửa. Số đo phía trước không thiết lập độ thông thoáng hữu hiệu hoặc hệ số hút gió. Mô hình phân tích chưa có đầy đủ tường/tháp để kiểm chứng quang học, âm học hoặc thông gió tại đây.
- Giữ lại chất liệu/màu hoa hồng được chọn trước, lấy trực tiếp từ các mesh cũ trước khi thay hình học. CAD cung/vòng không xác định chắc chắn kính màu hay đá đặc; trạng thái vật liệu và lỗ mở vẫn chờ xác nhận.
- Mặt các lá chớp tầng 2/3 theo nét ngang có trong CAD; góc lá, chiều dày, cách vận hành và chế tạo chưa được cho. Mặt lá tầng 4 hiện là nhịp lặp minh họa trong biên cửa đã xác minh, được gắn nhãn riêng. Không dùng các hình này để đặt hàng cửa.
- Chỏm dùng cung tròn nguồn cho bóng đường bao trước; tiếp tục tròn xoay quanh X=2,45 m và phần khuất dưới lan can là diễn giải 3D. Các vòng hoa phía bên/sau và chạm khắc còn minh họa. Độ sâu thánh giá 100 mm là hình dung, không phải quy cách kết cấu.
- Không đổi ID/vị trí/công suất/hướng thiết bị hoặc tuyến điện. Vì vậy sổ điện theo danh mục không bị ghi đè; cần kiểm tra lại độ che sáng/va chạm trên bản mô hình phối hợp cuối. Không giải quyết các mốc cung thánh, mái chính, phào hoặc đơn vị đang giữ chờ.

## Nối với mặt tiền

Đoạn trụ sau phía trong tầng 2 hiện hành bao X=3,71–5,26 m, |Z|=7,103–8,353 m ở thân trụ. Mặt tiền dừng ở |Z|=7,128 m theo CAD sẽ chồng vào trụ khoảng 25 mm ở mặt tường X=4,017–4,936 m. Phần nối kéo dài đến |Z|=7,5 m (D01 của mặt tiền trước) không còn cần để lấp khe kể từ khi trụ tháp đã được bổ sung. Thay đổi phần nối do tác giả mặt tiền xử lý riêng trong cùng đợt phối hợp.

## Kiểm tra

Đã kiểm tra cú pháp JavaScript và nạp bộ dựng hình thực bằng môi trường headless của dự án. Bản ghi kiểm tra kết hợp, ảnh desktop ban ngày/buổi tối, các kiểm tra mô hình/mô phỏng và đối chiếu mesh theo handle được tác giả tích hợp giữ ở bản bàn giao chung của đợt này. Không đưa ảnh CAD gốc/ảnh chồng CAD vào Git vì H1; chúng chỉ được giữ trong thư mục xuất cục bộ. Chưa có xác nhận kết cấu, lắp đặt hoặc hồ sơ thi công của người thiết kế.

## Lan can đã hiệu chỉnh tiếp theo

Sau phản hồi chủ đầu tư và commit `10d84e7`, [hồ sơ lan can](tower-balcony.md) thay toàn bộ con tiện dạng bình bằng 17 ô bậc/mặt, thân đặc ở hai đầu, hàng phào/thanh đỉnh theo E01B/E02 và đỉnh hoa +31,551771 m. Mô-típ hai mặt được xác nhận bằng 487 đối tượng; mặt trong/sau lặp DERIVED. Không còn giữ các thanh lan can cũ chỉ vì chưa giải được PT29; phần đã rõ được dựng, còn chiều sâu/tiết diện/cấu tạo/khép góc và che chùm đèn được giữ chờ riêng ENG-041. Phào đỡ đèn và thiết bị giữ nguyên. Ảnh trong lượt đầu là lịch sử trước hiệu chỉnh lan can; bản kiểm mới được liên kết trong hồ sơ đó.

## Dữ liệu kích thước trang trí trong DWG — rà soát 31/10/2026

Đọc lại DXF của cùng DWG (SHA-256 như trên) trong khung các hình E01A, E01B, E02, ET, PT08, PT10, PT15, PT15A, PT23 và PT29:

- **Có ghi kích thước (DIMENSION/nhãn cao độ):** cao độ −2,080 / ±0,000 / +8,390 / +15,840 / +23,140 / +29,090 / +36,920 m (khớp ký hiệu trong 1 mm), tổng chiều cao 39 000 mm, bề rộng một tháp 4 900 mm (Z 7,703–12,603 m), mặt bằng tháp tại +15,84 m 5 830 × 4 130 mm (PT15A), và tại +8,39 m các đoạn 2 120 / 440 / 680 mm (PT08). E01A/E01B còn ghi chân vòm tầng trệt 3 985 / 3 756 mm.
- **Chỉ có nét vẽ, không có kích thước:** tâm, bán kính, bậu, chân cung của vòm lớn, cửa chớp đôi, hoa hồng, chỏm, đèn lồng, thánh giá và lan can. Các số trong bảng phía trên là đo trên nét vẽ CAD (TRACED), không phải kích thước người thiết kế ghi. E02, ET, PT10, PT23, PT29 không có đối tượng kích thước nào.
- **Không có trong DWG:** chữ ghi kích thước, vật liệu, chiều sâu phào/chạm khắc, bề dày tường tháp, cốt thép, và bất kỳ thông tin điện nào. Không gian mô hình chỉ có chữ trục và tiêu đề; các lớp `LIGHT-FAN` / `thiet bi dien` không có đối tượng; khối thiết bị chỉ là thư viện không được chèn.

Vì vậy vị trí ống điện trên tháp phải lấy từ mô hình phối hợp, và tờ TW-01 của [bộ bản vẽ điện](../electrical-grid/print-drawings.md) chỉ là đối chiếu với đường bao vòm đã truy. Phát hiện khoảng hở 0,06 m ở tầng 3 được ghi ở ENG-042.

## Rà soát chân trụ và trang trí — 31/10/2026

Phương pháp: chồng cạnh của mô hình thật (nạp bằng `scripts/lib/exterior_model.cjs`) lên toàn bộ nét CAD của E01B (mặt trước, Z/Y) và E02 (mặt bên, X/Y), từ sân đến thánh giá; đối chiếu thêm mặt bằng P05. Ảnh chồng là dẫn xuất từ bản vẽ (H1), chỉ giữ ở máy, không commit.

**Khớp, không đổi:** vòm lớn và vòm kín tầng trệt, chân vòm, đầu cột, cột nhỏ, diềm chữ triện, hàng răng cưa, phào +8,39; vòm, cửa chớp đôi, hoa hồng tầng 2–4 ở cả hai mặt; lan can, cột góc hoa huệ; mặt bằng đèn lồng, thân, hạt chuỗi, quả cầu (+35,212763, R 0,210895) và thánh giá (tay ngang +36,346670, đầu tay ±0,573 m, đỉnh +36,919970). Lá chớp tầng 4 vẫn là nhịp minh họa như đã ghi.

**Đã sửa (`towers.js` revision `2026-10-31-cad-towers-5`):**

| Bộ phận | Trước | Theo CAD |
| --- | --- | --- |
| Chân trụ góc tầng trệt | 4 khối: 0–0,35 / 0,35–1,55 / 1,55–1,70 / 1,70–1,85 m | 13 dải theo nét E01B C45432..C45487: bệ 0–0,215 (nhô 0,269 m so với thân), phào chân tới 0,443, thân bệ 0,443–1,032, mũ bệ 1,032–1,368 (nhô tối đa 0,144 m ở 1,092–1,188), thân trên 1,368–1,668 phẳng với thân trụ, dải đỉnh 1,668–**1,848** m. Hai phào cong (0,275–0,383; 1,188–1,284) dựng bằng một bậc trung bình. Cùng cao độ với facade.csv F33–F35 |
| Mặt sau thân trụ trước, nhìn mặt bên | X +1,0 m, che chân vòm lớn E02 | X +0,495 m theo E02 |
| Khung bảng (cartouche) giữa hai vòm trệt | Dải hoa lá minh họa ở +4,55–4,92 m | Đường viền dựng lại từ 22 nét gốc C449B8, C45767..C4577C: rộng ±0,909 m, +4,035 đến +5,000 m; gờ nổi bán kính 22 mm |
| Cụm lá ở góc trên mỗi ô vòm | Một cụm nằm dọc vòm, thấp | Hai cụm hình chữ L, đúng vị trí CAD vẽ (t 0,55–1,85 m, +5,35 đến +6,6 m). Hình lá vẫn minh họa |
| Khung trong vòm kín (mặt trước và mặt bên) | Có khung phẳng trắng viền 0,12 m | Bỏ, vì CAD không vẽ |
| Vương miện đèn lồng | Lá vươn 1,17 m, lõi mảnh 0,3 m, cổ trơn | Lá vươn **0,948 m** ở +34,16 m (đo trên nét); hai tầng lá; lõi bầu tới +34,84; vòng sáu núm bán kính 0,24 m dưới quả cầu |

**Chiều sâu trụ góc — sửa theo ENG-043 (revision `2026-10-31-cad-towers-6`):** trụ góc mọi tầng vuông như E01B/E02 vẽ. Mặt thân trụ đo ở giữa mỗi tầng:

| Tầng | t trên E01B (từ tim tháp 10,153) | Trụ trước, X (E02) | Trụ sau, X (E02) | Trước khi sửa |
| --- | --- | --- | --- | --- |
| Trệt | 1,955–3,165 | −0,715 đến +0,495 | 4,405–5,615 (sau trục 2, như P05) | t 1,95–3,20; X −0,72…1,0 và 3,9…5,1 |
| 2 | 1,955–3,025 | −0,575 đến +0,495 | 4,405–5,475 | t 1,8–3,05; X −0,36…1,19 và 3,71…5,26 |
| 3 | 1,925–2,915 | −0,465 đến +0,525 | 4,375–5,365 | t 1,8–3,05; X −0,26…1,29 và 3,61…5,16 |
| 4 | 1,793–2,603 | −0,153 đến +0,657 | 4,244–5,054 | t 1,75–2,6; X 0,025…1,575 và 3,325…4,875 |

- **Chỗ lệch có chủ ý (DERIVED):**
  - Trụ sau phía trong tầng trệt dừng ở tường sau tháp (X 5,04 m). P05 ép trụ này sát cột hàng trục 2′; trụ vuông đủ sẽ trùm lên cột và quạt tường F-NAVE-B/H-2P.
  - Trụ sau phía trong tầng 2 chồm 25 mm vào ô bên của mặt tiền giữa (facade.csv D01), khuất trong ô.
  - Móng xám có thêm một đoạn từ X 5,4 tới 5,9 m, chỉ dưới trụ sau phía ngoài (|Z| ≥ 11,6 m), để trụ đứng trên đó. Không kéo cả móng ra, vì như vậy móng sẽ nhô 0,32 m trên nền hiên.
- **Thiết bị:** mười hai dây đèn lễ trên mặt trụ tầng 1–3 dời theo, vẫn cách mặt trụ 60 mm. Bố trí đã lưu được chuyển một lần. Lịch điện, sổ Excel, báo cáo tổng và rà soát an toàn đã xuất lại.
- **Ống đứng:** ống đứng của tuyến tháp nay sát mép trong trụ hơn, xem cập nhật trong ENG-042.
- **Còn giữ chờ:** bề rộng mép ngoài trụ tầng trệt nay đúng CAD (13,318). Cụm lá ở góc ô vòm mặt bên chưa thêm. Chiều sâu thật của tháp, hành lang sau tháp, kết cấu và móng chờ kiến trúc sư và kỹ sư.

**Kiểm tra:** `verify_exterior_dwg.cjs` có thêm 9 phép so (và 13 phép so mặt trụ theo ENG-043) (cao độ dải 1,848 / 0,443 / 1,368; độ nhô bệ 0,269; mặt sau trụ 0,495; khung bảng; độ vươn lá vương miện). Đã chạy `verify_model.cjs`, `verify_construction.cjs` và `verify_tower_balcony.cjs`: đều đạt. `verify_simulator.cjs` dừng ở các mục tiêu thiết kế chưa đạt sẵn có: biên chống hú micro giảng đài 0,9 dB và bàn thờ 1,4 dB, 13 % ghế dưới 200 lux. Kết quả giống hệt khi chạy lại với `towers.js` trước sửa, nên không do lần sửa này. Đã xem trong trình xem trên máy tính, ban ngày, buổi tối và chế độ `?visit`; không có lỗi console. Các bộ bản vẽ trong `output/pdf/` và `output/pdf-vi/` vẫn ghi revision tháp cũ `2026-10-26-cad-towers-4`, nên **đã cũ** cho phần tháp cho tới khi dựng lại. Không đổi thiết bị, tuyến điện hay sổ Excel. Không phải hồ sơ thi công.
