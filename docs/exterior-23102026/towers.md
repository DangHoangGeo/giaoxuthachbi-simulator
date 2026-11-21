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

## Tower-front leaf outline · 2 November 2026

The H-front spandrel leaf corner profiles were transcribed separately from E01B T12 into a reusable component; the B-front repeat is derived. See the [source, permission, verification and 3D-relief limitations](tower-spandrel-review.md). The contour radius is illustrative (8 mm at first, 18 mm since the owner's request below), and the existing PDF/model exports are stale for this change. No equipment or routes changed.

## Lower columns, side leaves and side capitals · 2 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.** Revision `2026-11-02-tower-lower-columns-1`, owner request: below ±0 the tower stands on columns balanced with the piers above, not on a solid block.

- **Source (DRAWING SHOWN).** E02 side elevation, lines D8DE56–D8DE77 and D8DE5C–D8DE62, and E01B lines C454ED–C454F9 draw, under each corner pier, a column from the −0.203 band down to the −2.08 courtyard. Its face runs 0.309 m beyond the pier's corner edge and 0.224 m beyond the other edge (front X −1.024 to 0.719, rear X 4.181 to 5.924, |Z| 6.679–8.422 and 11.884–13.627), with strip lines 0.305 / 0.22 / 0.22 m wide. A band in two steps (0 to −0.13 and −0.13 to −0.203) runs over the columns, 0.113 m and 0.05 m proud. Nothing is drawn between the columns. Raw vector PDFs `exports/23102026_vector/_vector_raw/E02.pdf` and `E01B.pdf` were inspected zoomed out for this reading; they stay local under H1.
- **Model.** Each corner pier stands on a cream lower column, built as a body plus three strips 0, 15 and 40 mm proud (relief **DERIVED**). The grey stone core between the columns is set back to the tower wall plane above (front X −0.14, outer face |Z| 12.743). This set-back is **DERIVED**: the drawing shows no infill line, and it does not establish whether the bays are open, closed or of stone. The core keeps X 5.4 at the rear (veranda) and |Z| 6.75 on the inner side. The former solid plinth (X −0.984 to 5.4, |Z| 6.75–13.62) and its rear extension under the outer rear pier (ENG-043) are replaced; the outer rear column now reaches X 5.924 as E02 draws it.
- **Side spandrel leaves.** E02 draws the T12 leaf pair round the side great arch: all 150 arc centres, radii and end points of both profiles agree within 0.1 mm about X 2.450. The same reusable component now stands on the outer side of both towers (`Tower side spandrel spray · E02`); relief is **CONCEPT**. The earlier hold in this record ("Cụm lá ở góc ô vòm mặt bên chưa thêm") is resolved for the outer face; the inner and rear faces have no great arch.
- **Side capitals.** E02 draws the same acanthus capitals as the front on the side great-arch imposts and blind colonnettes. They reuse `pilasterCapital` (`Tower side great capital foliage · E02`, `Tower side blind capital foliage · E02`); carving is illustrative.
- **Bolder leaves.** At the owner's request the leaf contour radius is 18 mm (was 8 mm), with arcs tessellated to a 1 mm chord tolerance (was 0.2 mm). Source end points are unchanged.
- **Open.** The lower storey's structure, foundations, drainage, whether the bays between the columns are open or filled, and their material remain with the architect and structural engineer. The wall-plane discrepancy at stage 1 is unchanged. The uncommitted H-side ramp study runs beside the outer face (inner edge |Z| 13.72; columns end at 13.627, band at 13.74 above the ramp).

**Checks:** `verify_model.cjs` (ray hits on each column face at its CAD line and on the set-back core; facade triangle budget 144,152 < 150,000), `verify_tower_spandrel.cjs` (600 front and 600 side end points within the 18 mm stroke), `verify_construction.cjs` and the simulator calculation audit. Desktop day views captured headless (front corner, both outer sides, side spandrels and the B-tower base). `verify_entrance_approach.cjs` fails at its first ramp lookup because the uncommitted ramp study renamed that mesh; this predates the change. Exports in `output/pdf*` are stale for the towers. No equipment, circuits or routes changed.

## Traced tower decoration · 3 November 2026

**In development / Đang phát triển · Not for construction / Không dùng để thi công.** Revision `2026-11-03-tower-traced-decoration-1`, owner direction of 3 November 2026: make the tower decoration follow the CAD drawing as closely as possible. Outlines are stored in `Thach_Bi_Viewer/detail-towers-profile.js` (`window.CHURCH_DETAIL_PROFILE_TOWERS`) and checked row by row against the DXF by `scripts/verify_detail_towers_source.py`, which also measures every drawn repeat that the viewer renders from the same rows. Source DWG and SHA-256 as above; publication hold H1 applies to the outlines.

### Pier capitals and flute position

- **Capitals (DRAWN outline, CONCEPT relief).** The generic `pilasterCapital` foliage on the corner piers is replaced by the drawn acanthus band of each storey: `pierCapital1` (ground, E01B Z 7.32–8.27, +7.50–7.80; the Greek-key LINE pieces D10AB5–D10AC2 and C482F7 in the same band are left out), `pierCapital2` (+15.00–15.34), `pierCapital3` (+22.36–22.64) and `pierCapital4` (+28.51–28.78; the abacus edge lines C4411D/C44123/C4412D are left out). Each key is the E01B inner pier, u = Z − 10.153, ARC/LINE only, arcs ≤ 0.3 m, lines ≤ 0.19 m. The outer pier is its mirror about the tower centre, and E02 draws the same outline on the side faces (front pier as traced, rear pier mirrored): all three copies lie within 0.13 mm of the traced points. Rendered as an 8 mm contour tube just proud of the capital band (`capitalStroke`), on the front and outer side faces of all four storeys of both towers. Meshes `Tower pier capital foliage · traced E01B` and `· traced E02`.
- **Kept illustrative.** The nave-side face of the truncated ground inner rear pier (ENG-043) keeps the old `pilasterCapital`, because the drawn band is wider than that pier.
- **Flute position (DRAWN).** The drawn flutes are not on the pier centre. The middle flute (r 25 mm end arcs) is at t 2.450 / 2.390 / 2.330 / 2.199 m from the tower centre on E01B (Z 7.703/12.603, 7.763/12.543, 7.823/12.483, 7.954/12.351) and at X 0.00 / 0.06 / 0.12 / 0.252 (front pier) and 4.90 / 4.84 / 4.78 / 4.649 (rear pier) on E02. On storeys 1–3 that is 0.09–0.11 m in from the pier centre, toward the face centre; storey 4 is centred. The fluted fields (2 Nov form unchanged) and the ground pilaster strips now stand on those lines (`spec.flutes[].t/x`), so the capital's central fleuron sits over the middle flute as drawn. Pier widths, bands and depths are unchanged.

**Checks:** `verify_detail_towers_source.py` (805 rows exact to 5e-10; copies ≤ 0.13 mm), `verify_model.cjs`, `verify_construction.cjs`, `verify_simulator.cjs --report --estimates` (exit 0; the known unmet targets for wing clarity and feedback margins are unchanged), `verify_tower_balcony.cjs`, `verify_tower_spandrel.cjs`, `verify_exterior_dwg.cjs`. Desktop day views captured headless (stage-3 capital close-up, outer side, full front). Tower triangles 493,048 → 630,536 (+137,488): the traced bands are far finer than the old generic leaves. No equipment, circuits or routes changed; the festival light strings on the pier faces are unchanged. Exports in `output/pdf*` are stale for the towers.

### Roses, window heads, imposts and lantern rose

Revision `2026-11-03-tower-traced-decoration-1`, second step. All keys in `detail-towers-profile.js`; u and v are stored from the origin given, E01B, ARC/LINE only.

| Key | Source (E01B) and origin | Drawn repeats checked (largest gap) | Replaces in the model |
| --- | --- | --- | --- |
| `rose` (201 rows) | Stage-3 front rose tracery: twelve interlaced lobes, radial bars, hub and the r 0.3947 inner circle; origin Z 10.152934, +20.612392; arcs < 0.395 m so the drawn r 0.45/0.54 rings stay the existing torus | Stage-2 front rose (0.0 mm); E02 stage-2/3 side roses (0.0 mm) | `K.bloom` rose carving on the 16 stage-2/3 rose faces |
| `roseSmall` (200) | Stage-4 front rose; origin Z 10.141459, +27.191525 | Dome rosette at +31.699584 (0.0 mm); E02 stage-4 side rose (0.0 mm) | `K.bloom` on the 8 stage-4 roses and the 8 dome rosettes |
| `windowHead` (67) | Tympanum tracery of the paired louvre openings: cross with trefoil ends over a three-lobed arch; origin = B-side stage-3 opening Z 9.257934, springing +19.317964; the springing lines at v 0 are left out | Other stage-3 opening (0.7 mm); stage-2 openings (15 and 25 mm, their radius is 0.4996 not 0.5); E02 stage-3 openings (0.7 mm) | nothing (heads were plain) |
| `windowHead4` (54) | Stage-4 tympanum; origin Z 9.457112, +26.149596 | Other stage-4 opening and E02 stage-4 openings (0.0 mm) | nothing |
| `lanternRose` (153) | Rose with leaves in the lantern's middle panel; origin Z 10.141459, +33.481658 | — (E02 draws the same panel; not checked) | `K.bloom` lantern panel rosettes |
| `greatCapital` (80) | Ground great-arch impost capital, inner (B) side, Z 8.20–8.86, v from the +3.984770 springing; the abacus and astragal LINEs are left out | Outer side mirrored (0.13 mm); E02 both sides (0.07 mm) | `pilasterCapital` on front and E02 side imposts |
| `blindCapital` (54) | Ground blind-arch colonnette capital, Z 8.95–9.27, v from +2.899970; two abacus LINEs left out | Mirrored (0.13 mm); E02 at its +3.100470 springing (0.07 mm) | `pilasterCapital` on front and E02 side colonnettes |

- **Placement.** Front roses 25 mm proud of the wall face over the existing coloured infill; window-head tracery 40 mm inside the opening, over the dark shutter backing (whether the tympanum is open, glazed or solid is not drawn; CONCEPT). Stage-2 roses, the stage-2 heads, the B/outer repeats and all inner/rear faces carry `DERIVED REPEAT` status; the inner and rear faces keep their existing **DERIVED REPEATED PROFILE / CONFIRMATION PENDING** label (ENG-040).
- **Upper great-arch imposts (DRAWN).** E01B and E02 draw a plain pilaster with a necking band, a lower and an upper abacus, and no foliage (C43850..C44C48 stage 2, C438A0..C438B0 stage 3, C44263..C44290 stage 4). The illustrative foliage and the solid 0.46 m capital block are removed on all 24 upper faces; the bands are at −0.46…−0.39 (stage 4 −0.295…−0.225), −0.14…−0.07 and −0.07…0 m from the springing, 0.03 / 0.03 / 0.08 m beyond the shaft (on stages 2–3 the drawn bands also run back across the wall to the corner pier; that return is not modelled yet). On stage 4 the shaft spans all five arch rings (E01B Z 8.648–8.838) instead of the first 25 mm ring. Band depths are DERIVED.
- **Ground great-arch impost (DRAWN width).** E01B draws three orders down to the base (Z 8.43 / 8.60 / 8.77) and the capital over all three, t 1.293–1.955. The inner order (r 1.385–1.555) is added as a 0.10 m pilaster and the capital block widened to t 1.293 on the front and the E02 side. Depths DERIVED.
- **Dome rosettes.** The rosette and its ring now lean back to the dome slope at +31.70 (DERIVED) so the lower half is no longer buried in the dome.
- ~~**Not changed, open.** The model's eight dome ribs are not drawn on E01B or E02.~~ Resolved on 3 November 2026: see *Tower top after the drawing* below.

**Checks:** `verify_detail_towers_source.py` (1,614 rows exact to 5e-10; all repeats listed above), `verify_model.cjs`, `verify_construction.cjs`, `verify_simulator.cjs --report --estimates` (exit 0; known unmet targets unchanged), `verify_tower_balcony.cjs`, `verify_tower_spandrel.cjs`, `verify_exterior_dwg.cjs`, `verify_side_dwg.cjs`. Headless desktop day views: stage-3 and stage-4 fronts, ground front and E02 side, dome, rear diagonal. Tower triangles 630,536 → 804,520 (+173,984); together with the capitals +311,472 over the 2 November model (scene 2.90 M). The tubes use the light setting of `towerSpandrel` (3 sides, 30° arc steps); the remaining budget lever is the 12 DERIVED inner/rear faces (about 79,000 triangles of roses and heads). No equipment, circuits or routes changed. Exports in `output/pdf*` are stale for the towers.

### False doors in the blind arches · 3 November 2026

Owner, 3 Nov 2026: the towers' false doors should look like the main timber doors without being real doors. The front blind arch (radius 0.824, +0.30 to the springing +2.900) and the E02 side opening (±0.5, sill +0.850, springing +3.100) now carry a fixed timber facing. It has a frame, a transom, two leaves with three raised panels each, carved rosettes and a timber fan of seven ribs in the arched head, in the main doors' wood with a darker inset. The wall stays closed behind; nothing opens, and walking and analysis geometry are unchanged. The side blind panel takes the wall finish instead of the dark trim, so the door stands out. Sizes follow the drawn arches; joinery and depths are CONCEPT.

### Tower top after the drawing · 3 November 2026

The owner asked that the tower tops look like the design (E01B elevation, sent as an image). Rebuilt in `towers.js` for both towers:

- **Four-faced dome, not a round ribbed one.** The +29.09 plan (PT29) draws the dome as a square: diagonal arris lines from the corners to the centre and a diamond corner rib at ±1.7266 m. E01B's double inner line is therefore the margin of each face, not a rib.
  - Each face follows the traced outline: arc `C4568C`/`C45696`, r 2.628674 about an offset centre (±0.649346, +30.541187).
  - It has a 0.18 m margin at full height, a 0.06 m fillet (concentric arcs r 2.448674 / 2.388674, `C4568D/E`, `C45697/8`) and the field within. The tops are flat at +32.6405 / +32.5805 (`C4568F`–`C45692`, ends at ±0.611 / ±0.5945).
  - The margin meets the next face on the arris. The fillet and field are set back 0.05 / 0.12 m (**DERIVED**). PT29's 0.24 m face step at the drum level is not modelled. The eight ribs and the round base torus are removed.
  - The four dome rosettes sit on the fields. The mesh keeps the name `Tower dome · CAD profile`, and its contact with the lantern stays at +32.790457.
- **Lantern after E01B** (LINEs about u 10.1529):
  - a quarter-round step r 0.1278 on the plinth;
  - a base (±0.5577, +33.1111–33.2317) breaking forward over ±0.3163;
  - a body ±0.4878 (was ±0.5578, with corner posts the drawing does not show) with a projecting middle bay ±0.2464;
  - the traced rose in a framed panel ±0.1963, between two sunk side panels (±0.2463–0.4377, +33.2817–33.6817);
  - the bead band with eleven beads per face and its cap (±0.5827), both breaking forward like the base.

  Projections are **DERIVED**.
- **Crown traced** (`crown`, 153 ARCs, origin the ball centre Z 10.152933; E02 draws the same crown within 0.04 mm; checked by `verify_detail_towers_source.py`).
  - The traced front is wrapped onto a bowl of revolution on each of the four faces, so each elevation shows the drawn leaves and scrolls. The bowl's silhouette (r 0.50 at +33.86, 0.70 at +34.35, 0.15 at +35.0) is **DERIVED** from the trace.
  - Strokes outside the bowl (the flared tips reaching 0.948 m at +34.17, the outer leaves and the top bosses) stand as 60 mm solid flat-cut leaves on each face's centre plane (`Tower lantern acanthus crown`).
  - Each face's wrap stops at 55° from its centre, so the four faces do not overlap.
  - The free-modelled acanthus leaves, the bulb and the six-knob collar are removed. Relief and thickness are **CONCEPT**.
- **Cross:** the traced trefoil now takes the trim finish like the gable crosses, instead of the brown cross material. Four leftover brown cap pieces from the old cross (`Schematic round profile` above +35.5 m) are removed.
- Not changed: the pierced parapet, corner pinnacles and the entablature below already follow the drawing.

**Checks:** `verify_detail_towers_source.py` (with the new `crown` key), `verify_model`, `verify_exterior_dwg`, `verify_tower_balcony`, `verify_tower_spandrel`, `verify_construction`, `verify_side_dwg`, `verify_simulator --report --estimates`. Headless captures (light graphics) were reviewed: front, diagonal, close crown and cross. No equipment, circuits or routes changed.

### Sandstone accent on the tower carving — 3 November 2026

Owner, 3 Nov 2026: the carving on the towers was hard to see because it had the same colour as the surface behind it. Every carved part used the cream trim finish (`#efe2c8`) against the cream dome (`#efdfbd`, contrast about 1.03 : 1) and the ivory walls and lantern (`#faf3e1`, about 1.16 : 1). The owner chose **warm sandstone**, first for the tops, then for all stages and the central façade. The carving now uses the existing dark trim finish (`mat.darkTrim`, `#b69b73`, about 2.4 : 1 against the walls), as the old bundle cap's rosettes did:

- **Tops:** the dome rosette tracery and rings, the lantern panel roses and beads, and the crown carving and acanthus crown.
- **Every stage:** the pier capital foliage (traced E01B/E02 and the illustrative inner rear), the great-arch impost and blind-arch capital foliage, the front and side spandrel sprays, the rose rings and rose tracery, the front cartouche frame and the base Greek-key frieze.

Owner, 4 Nov 2026: the corner pinnacle crowns go back to cream, like the pinnacle crowns on the façade. Mouldings, cornices, bands, dentils, colonnettes, the louvre-head tracery (over the dark shutter backing), the dome, the lantern body and frames, the crown bowl, neck and ball stay cream. The cross also keeps the trim finish, like the gable crosses. The central façade follows the same rule; see [facade-model.md](../facade-model.md#sandstone-accent-on-the-carving--3-november-2026). Only the material changed: geometry, names, placement and the analysis model are unchanged. The colour is **CONCEPT** (appearance only; the stone or paint specification, weathering and maintenance are not chosen). In the drawing (no-colour) view the accent turns grey like the other finishes.

### Tower wall and shutter colour · 20 November 2026

The base enclosures and upper wall faces on both towers use the church-wide continuous stone-grey colour. The piers share the wall tint. The mouldings and caps use closely related stone tones, with a muted sandstone accent on the designated carved work. Each paired shutter backing now uses the timber finish of its frame and blades, including the outer, inner and rear faces. [Courtyard and tower comparisons](../../review/wall-stone-2026-11-20/README.md)

### Belfry openings, base course and great-arch colonnettes · 21 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.** Owner feedback, 21 November 2026, on a desktop view of a tower stage:

- the columns under the great arch were too faint to see and did not come down to a base;
- the louvre timber looked flat;
- the arched head over the louvres looked as if it floated.

Each point had a cause in the model:

- The supports under the great arch were 0.11 m strips, 0.10 m proud, starting at the sill with nothing under them.
- The blades were upright boxes in one plane, 5 cm in front of a timber backing of the same finish.
- The traced head tracery stood 40 mm inside the wall face, with a 0.22 m empty gap between it and the louvres.

All twelve upper faces of each tower (front, outer, inner, rear × stages 2–4) now use one shared assembly, `belfry()` in `towers.js`:

| Part | Basis | Model |
| --- | --- | --- |
| Base course under each upper sill | E01B DRAWN: a 0.20 m band at +8.85–9.05, +16.30–16.50, +23.60–23.80, with torus returns at the stepped supports (stage 2 also at the great-arch support) | Band 0.05 m proud plus a 0.065 m half-round torus, between the corner piers. Profile and projection CONCEPT |
| Great-arch supports | E01B draws a shaft with a necking band and two abaci. Plan +10.128 (PT10) draws a rectangular step 0.11 m wide, 0.10 m proud (Z 8.434–8.544) | Owner-directed departure **DX-07**: an engaged round colonnette (r 0.085, stage 4 r 0.095) on a square plinth and torus base sitting on the course. The drawn step stays behind it as a 0.05 m dosseret. The traced impost bands now stand 0.03–0.05 m proud of the colonnette |
| Window jambs | E01B DRAWN: a band (+11.42–11.50 on stage 2) and a capital (+11.75–11.87) under each archivolt | Band and capital added at the same offsets from each springing on every stage |
| Louvres | Blade face height 0.20 m and pitch 0.278 m TRACED (stage 4 illustrative). The angle is not drawn | Blades raked 50°, front edge down, between timber stiles 0.16 m deep. Each still shows the drawn 0.20 m face height. A dark belfry-interior panel at the back of the 0.28 m wall shows between the blades. Rake, depth and finish CONCEPT |
| Arched head | Tracery TRACED (`windowHead`, `windowHead4`) | A timber transom at the springing, 0.08 m high, carries a timber tympanum 0.175–0.20 m inside the face. The tracery is set on the tympanum, so nothing floats. Whether the head is open, glazed or boarded is not drawn: CONCEPT |

The inner, outer and rear faces now share the front's deep reveal (their louvres were 7–18 cm inside the face). The great-arch rings and window archivolts keep their earlier depths on each face. Levels, arch radii, window centres, sills and blade pitch are unchanged, and `verify_exterior_dwg.cjs` still checks them against the drawing.

**Not designed:** louvre product, timber species and treatment, bird and rain screens, sound transmission of the bells through the raked blades, colonnette material (cast stone or rendered), fixings and drainage of the base course. These stay on engineering hold. [Before and after](../../review/belfry-niche-2026-11-21/README.md)

### Stone on the lower columns · 21 November 2026

**CONCEPT · In development / Đang phát triển · Not for construction / Không dùng để thi công.** At the owner's request (21 November 2026), the eight lower columns under the corner piers, which are plastered with drawn strips, now carry the rock-faced granite blocks of the plinth (departure DX-08 in [design excellence](../design-excellence.md#departures-from-the-drawings)). The blocks are laid on their exposed faces in the plinth courses, so each tower stands on one stone foot. `towers.js` publishes the column boxes (`CHURCH_TOWERS.lowerColumns`); `site-stone.js` lays the stones. The traced column outlines, strips and band course are unchanged underneath, and the band course stays visible above the stones. [Before and after](../../review/plinth-stone-2026-11-21/README.md)
