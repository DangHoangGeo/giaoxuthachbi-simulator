# Kiểm tra DWG và bộ PDF tiếng Việt - Phiên bản 23102026

Chủ đầu tư yêu cầu ngày 26/10/2026: một tập tổng quan, các tập nhỏ theo bộ phận, PDF sắc khi phóng lớn, ghi chú kích thước rõ ràng bằng tiếng Việt, nhãn **Phiên bản 23102026**, bỏ dòng “Đang phát triển”, và kiểm tra kỹ dữ liệu gốc trước khi dùng ngoài công trường. Bộ cuối dùng nét vector; bản ảnh trong `exports/23102026/` đã bị thay thế. Các giữ chờ kỹ thuật và dòng “Không dùng để thi công” vẫn cần thiết vì những mâu thuẫn nguồn dưới đây chưa được người thiết kế giải quyết.

## Nguồn và cách kiểm tra

DWG gốc được giữ nguyên, SHA-256 `2dc33f5dd0f9aa07cf9cf8b7867a55e214caf2d042df3b3c5dd9eebb48f7d4ae`. Tệp đúng tên chủ đầu tư yêu cầu và bản `source/thach-bi-church-2026-10-23.dwg` có cùng nội dung. Đọc lại trực tiếp bằng LibreDWG 0.14 `dwgread -O JSON`, chuyển DXF mới bằng `dwg2dxf`, rồi dùng ezdxf 1.4.5 và phép tính riêng từ tọa độ để kiểm tra. Không dùng các ảnh thu nhỏ để suy ra số đo.

- **726 đối tượng kích thước:** đối chiếu handle, hai đầu đo, số đo lưu trong DWG, phép tính theo góc chiếu hoặc khoảng cách hai đầu, DXF mới, CSV và Excel. Đầu đo DWG/DXF khớp; sai khác tính toán lớn nhất khoảng `1e-9` đơn vị CAD. CSV làm tròn 0,1 đơn vị; không xem số chữ số phần mềm là độ chính xác khảo sát.
- **726 chữ số kích thước:** đọc TEXT/MTEXT lưu trong khối kích thước của DWG, đối chiếu DXF và cột số ghi. Không có chữ thay thế hoặc DIMLFAC khác 1 trong tập đã chọn. Phát hiện **23 ô số ghi sai 1 đơn vị** do làm tròn số thực nhị phân gần x,5. Ví dụ DWG0251: hình học 2100,5; CAD ghi 2101; bản cũ ghi 2100. Đã sửa theo CAD, không sửa hình học để ép khớp số ghi. Hàm `stored_dimension_number()` ngăn tái diễn.
- **137 bản ghi trục:** đối chiếu trực tiếp LINE gốc và DXF, phép đổi hệ tọa độ theo khung bản vẽ và CSV.
- **79 nhãn cao độ:** nội dung trực tiếp DWG khớp DXF/CSV. Tìm được **58 đỉnh ký hiệu** từ các đoạn hình học thực, thay cho ước lượng theo chiều cao chữ. Hai đỉnh mái S24/S25 khoảng +12,3964 m khác nhãn +12,472 m khoảng 75,6 mm. Các nhãn còn lại chưa có đỉnh đo được không được coi là đã xác minh hình học.
- **32 hàng mặt tiền:** kiểm lại trên DXF mới bằng phương pháp nét vẽ `facade_check`, trong giới hạn 1,5 mm của phép truy nét phần mềm. Đây không phải dung sai thi công hoặc khảo sát.
- **Phạm vi:** 729 DIMENSION trong model space: 726 thuộc 27 khung, ba ngoài khung được liệt kê rõ trong báo cáo. Không có INSERT trong model space. 1915 DIMENSION còn lại của toàn tệp thuộc định nghĩa khối không được chèn. Toàn bộ 148675 handle hình học của model space có trong DXF; hai handle BLOCK/ENDBLK chỉ là dấu giới hạn. Kiểm tra handle không tự chứng minh mọi thuộc tính CAD đã chuyển đúng.

Bằng chứng: [báo cáo sau sửa](kiem-tra-so-lieu.json), [báo cáo trước sửa](kiem-tra-truoc-khi-sua.json), [726 kích thước](doi-chieu-kich-thuoc.csv), [137 trục](doi-chieu-luoi-truc.csv), [79 cao độ](doi-chieu-cao-do.csv). Các dump JSON/DXF và log gốc có metadata của bản vẽ nên chỉ giữ trong thư mục xuất cục bộ, nén gzip và kiểm dấu kiểm sau giải nén; không đưa vào Git.

## Excel, dữ liệu mô hình và giới hạn sử dụng

Artifact Tool tạo các sửa đổi; bộ áp dụng có dấu kiểm nguồn và sửa đúng phần XML trong ZIP để giữ những phần còn lại. Sổ chính sửa 23 ô F của `DWG dimensions`, chú thích đơn vị `DWG sheets!A4`, thêm `Open items!A35:I35` (**ISSUE-R06**). Sổ kích thước chính sửa hai chú thích A4/A5. Danh sách chính xác: [register-edits.json](register-edits.json); [báo cáo bảo toàn](register-preservation.json). Giá trị hình học, đầu đo, công thức/cache và ô không liên quan giữ nguyên; các ZIP part ngoài phạm vi sửa giống từng byte. Hàng mới dùng kiểu ngắt dòng của hàng giữ chờ trước, cao 140 điểm. Đã kết xuất lại sổ lưu cuối để xem số ghi và hàng giữ chờ.

`construction-data.js` được tạo lại từ cùng sổ: 463 kích thước, 28 vấn đề mở, 51 trục/cao độ, 12 giai đoạn. Chỉ thêm vấn đề đơn vị và đổi dấu kiểm sổ, không đổi hình học 3D, thiết bị, tuyến điện hoặc dữ liệu mô phỏng. Những thay đổi mô hình/điện và việc di chuyển tài liệu cũ đã có sẵn khi bắt đầu được giữ nguyên, không đưa vào commit này. Vì không đổi thiết bị/tuyến điện, không ghi lại các sổ điện đang được chỉnh sửa ở công việc khác.

**Đơn vị chưa được người thiết kế xác nhận:** DWG và DXF đều `INSUNITS=1` (inch cho chèn tự động theo [Autodesk](https://help.autodesk.com/cloudhelp/2026/ENU/AutoCAD-Core/files/GUID-A58A87BB-482B-4042-A00A-EEF55A2B4FD8.htm)). Câu cũ “INSUNITS unset” là sai và đã sửa trong tài liệu, metadata và trình xuất. Hình học mm/m đang suy từ chuỗi 4500/7200 và nhãn m. Không tự nhân/chia tọa độ theo 25,4. ISSUE-R06 yêu cầu người thiết kế xác nhận đơn vị hình học, đơn vị chèn và cách ghi kích thước trong phần mềm CAD gốc.

Hai nhánh đọc dùng cùng LibreDWG, **chưa phải kiểm chứng bằng hai bộ máy CAD độc lập**. Log chuyển có 3 ERROR (bảng sắp xếp/bản xem trước) và 4933 Warning (gồm lớp vật liệu, liên kết kích thước, tô mặt). ezdxf không báo lỗi/sửa tự động cho DXF mới; điều đó không xóa cảnh báo nguồn. Chưa có đối chiếu native AutoCAD/ODA, chữ ký người thiết kế hoặc khảo sát hiện trường.

Các cặp **750/800 mm** nền cung thánh, **+12,3964/+12,472 m** mái, **6324/6325 mm** phào, **67063,6/67149,4 mm** chiều dài theo mốc khác nhau vẫn mở. Không lấy trung bình, không chọn ngầm một giá trị thi công. Kiến trúc sư/kỹ sư cần giải quyết chúng và phát hành hồ sơ phối hợp được kiểm tra trước khi bố trí/chế tạo/thi công.

## Bộ PDF cuối

Thư mục cục bộ `exports/23102026_vector/`, được Git bỏ qua. Tất cả các trang có nhãn phiên bản và ghi chú tiếng Việt; không có dòng “Đang phát triển”. Có 79 mã số đo, 21 tọa độ trục và đủ 27 bản vẽ. Mỗi hình có ghi chú kích thước của phần đang xem, nêu nguồn khác khi dùng tham chiếu cùng bộ phận; không trình bày tham chiếu như số đo riêng của chi tiết đó.

| Tập | Nội dung | Trang | MB thập phân |
| --- | --- | ---: | ---: |
| 00 | Tổng quan và danh mục liên kết | 8 | 6,28 |
| 01 | Mặt bằng và lưới trục | 6 | 3,39 |
| 02 | Mặt tiền trung tâm | 8 | 2,51 |
| 03 | Hai tháp chuông | 9 | 4,26 |
| 04 | Lòng nhà, cột và mái | 7 | 3,99 |
| 05 | Cung thánh và phòng phụ | 8 | 6,22 |
| 06 | Hai cánh ngang | 4 | 0,41 |
| 07 | Cửa sổ | 7 | 0,68 |
| 08 | Cửa đi | 7 | 0,66 |
| 09 | Khung vòm cánh ngang | 7 | 0,22 |
| 10 | Kết quả kiểm tra DWG, 23 ô sửa và mốc chờ xác nhận | 3 | 0,09 |

Dấu kiểm PDF/ZIP, 132 liên kết đã kiểm tra và số trang: [kiểm tra gói](kiem-tra-goi-pdf.json). Có thêm **49 PDF một trang** trong `tung_trang/`, mỗi trang có số đo, nhãn phiên bản và liên kết về tổng quan. `Nha_tho_Thach_Bi_23102026.zip` chứa 11 tập và hướng dẫn (khoảng 28,40 MB); `Tung_trang_23102026.zip` chứa 49 trang riêng, tổng quan và hướng dẫn (khoảng 42,20 MB). Tập tổng quan mở liên kết tới bộ phận; giải nén và giữ cấu trúc thư mục để dùng liên kết.

Giữ vector, không nhúng ảnh vào PDF. Nguồn nét 27 trang giữ nguyên tại `exports/dwg-review-2026-10-26/_raw/`. Bộ tối ưu thay các đoạn nét đứt thẳng lặp lại bằng mẫu nét đứt PDF khi từng đầu/cuối sai không quá 0,0003 **điểm PDF**; không làm trơn đường cong, không sửa CAD. So ảnh từng trang nguồn/kết quả tại 144 điểm/in, ngưỡng cố định MAE <= 0,3/255 và tỷ lệ pixel lệch >32 <=0,003; trang không đạt dùng lại PDF gốc. Cả 27 trang đạt, MAE lớn nhất khoảng 0,194; sai đầu đoạn lớn nhất khoảng 0,000185 điểm. Đây là kiểm tra tái hiện đồ họa, không phải dung sai xây dựng. Dung lượng 27 trang nét giảm 63,17 xuống 13,93 MB; phóng lớn vẫn là đường vector. [Bằng chứng từng trang](kiem-tra-net-vector.json); [Poppler](kiem-tra-poppler.json).

Đã xem ảnh thu nhỏ mọi trang, xem lớn mặt tiền, nền cung thánh, cửa sổ và bảng kiểm. Chữ tiếng Việt đầy đủ, không có phần ghi chú tràn khung. Poppler phát hiện lỗi kiểu toán hạng nối nét ở bản trung gian; đã sửa thành số nguyên theo cú pháp PDF và tạo lại toàn bộ. Cả 27 trang nét cuối được Poppler kết xuất không lỗi/cảnh báo, bên cạnh so ảnh MuPDF. Nét nguồn là bản xuất ezdxf; đối chiếu trực quan trong CAD gốc vẫn chưa thực hiện. PDF được xếp vừa trang, không có tỷ lệ in đã hiệu chuẩn; chỉ tra số ghi và mốc đo, không đo từ bản in.

## Tái tạo và kiểm tra

Dùng LibreDWG và thư viện trong `scripts/requirements-dwg.txt`; môi trường lần này là `/tmp/thachbi-cad-export-20261026`. Từ gốc dự án, với DWG/PDF nguồn giữ cục bộ:

```bash
mkdir -p exports/23102026/_audit
dwgread -O JSON -o exports/23102026/_audit/original-dwg.json docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg
dwg2dxf -o exports/23102026/_audit/fresh.dxf docs/layout_design/dwg-2026-10-23/source/thach-bi-church-2026-10-23.dwg > exports/23102026/_audit/dwg2dxf.log 2>&1
python3 scripts/audit_dwg_source_23102026.py
python3 scripts/optimize_dwg_pdf_vectors.py
python3 scripts/build_dwg_vietnamese_23102026.py
```

Trình audit sau sửa cần báo cáo trước sửa đã lưu trong Git. Có thể dùng `.json.gz` và `.dxf.gz` thay các dump chưa nén. Dấu kiểm CSV/sổ được ghi trong `dau_vao_sha256`; trình xuất từ chối nếu dữ liệu thay đổi sau audit. Trình xuất dùng dữ liệu lựa chọn/sổ từ lượt xuất trước (`exports/dwg-review-2026-10-26/register-data.json`), kiểm tra dấu kiểm nguồn và dấu kiểm PDF tối ưu. Để tái tạo từ đầu cần tạo lại gói dữ liệu/nét nguồn bằng [quy trình xuất gốc](../../docs/layout_design/dwg-2026-10-23/README.md), trên một bản sao sổ, không chạy các bộ áp dụng lịch sử lên sổ đang làm việc.

Hai script `author_dwg_audit_register.mjs` / `apply_dwg_audit_register.py` ghi lại bước sửa Excel một lần. Chúng dùng [manifest sửa](register-edits.json), kiểm SHA-256 của hai sổ trước sửa và từ chối nếu sổ đã đổi hoặc đã áp dụng. Không chạy lại trên sổ hiện tại. Muốn phát lại, dùng bản sao sổ trước commit này trong checkout riêng, chạy bộ tác giả bằng Node đi kèm Artifact Tool, sau đó bộ áp dụng; không khôi phục đè lên dữ liệu người khác.

Kiểm tra phần mềm đã chạy: `node scripts/verify_construction.cjs` (đạt); `web/scripts/prepare-viewer.mjs`, `npm run check:viewer`, `npm run check:boundary` (đạt; boundary kiểm tra bản dựng có sẵn, không tạo bản dựng sản xuất mới). Đã xem ISSUE-R06 trên desktop trong `OPEN_CHURCH.html?visit`, không có lỗi console; không thay đổi bố cục giao diện. Kiểm tra cú pháp các Python/JS mới, JSON, đường dẫn liên kết, số trang, không ảnh raster, phiên bản mỗi trang, liên kết PDF tương đối, dấu kiểm và CRC hai ZIP; `git diff --check`. Các mô phỏng vật lý không chạy lại vì không đổi đầu vào phân tích. Các kiểm tra này không chứng nhận công trình.

H1 về quyền công bố bản vẽ vẫn giữ nguyên: bản vẽ/PDF chỉ xuất cục bộ, không tải lên, không đưa hình CAD vào Git. Công việc kế tiếp thuộc người thiết kế: mở đúng DWG, xác nhận đơn vị và mốc đo, giải quyết các điểm khác nhau, kiểm tra hiện trường và phát hành hồ sơ thi công thống nhất.
