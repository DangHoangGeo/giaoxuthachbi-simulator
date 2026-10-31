"""Reviewed Vietnamese display text for the electrical drawing exporter.

The source snapshot, IDs and numeric CSVs stay unchanged. New or edited source
prose must receive a translation here; Vietnamese builds fail on missing text
rather than quietly publishing English or inventing engineering information.
"""
from __future__ import annotations

import re
import unicodedata
from pathlib import Path

FONT_DIRECTORY = Path(__file__).resolve().parent / 'fonts'
FONT_FILES = ('NotoSans-Regular.ttf', 'NotoSans-Bold.ttf', 'OFL.txt', 'README.md')


def register_fonts(language='en'):
    """Return (regular, bold); the Vietnamese fonts are local, licensed and embedded."""
    if language == 'en':
        return 'Helvetica', 'Helvetica-Bold'
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    for style in ('Regular', 'Bold'):
        name = 'ThachBiNotoSans-'+style
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name, str(FONT_DIRECTORY / ('NotoSans-'+style+'.ttf'))))
    return 'ThachBiNotoSans-Regular', 'ThachBiNotoSans-Bold'


VI = {
    'Thach Bi Church - Electrical review drawings': 'Nhà thờ Thạch Bi - Bản vẽ rà soát hệ thống điện',
    'Thach Bi Church design-development model': 'Mô hình phát triển thiết kế nhà thờ Thạch Bi',
    'THACH BI CHURCH': 'NHÀ THỜ THẠCH BI',
    'DESIGN DEVELOPMENT': 'PHÁT TRIỂN THIẾT KẾ',
    'NOT FOR CONSTRUCTION': 'KHÔNG DÙNG ĐỂ THI CÔNG',
    'Source commit {commit} + file hashes in manifest | Routing {routing}': 'Bản nguồn {commit} + mã băm tệp trong bảng kê | Phiên bản tuyến {routing}',
    'MODEL TRANSCRIPTION / DERIVED. Metres; displayed decimals are not survey accuracy. Review before installation.': 'CHÉP TỪ MÔ HÌNH / SUY RA. Đơn vị mét; số lẻ hiển thị không thể hiện độ chính xác khảo sát. Rà soát trước khi lắp đặt.',
    'A3 / sheet {page:02}': 'A3 / tờ {page:02}',
    'Print 100% / no fit-to-page': 'In 100% / không co giãn theo trang',
    'Electrical routes / printable review set': 'Tuyến điện / bộ bản vẽ rà soát để in',
    'Default model export - circuit plans, heights, equipment coordinates and route index': 'Xuất mô hình mặc định - mặt bằng mạch, cao độ, tọa độ thiết bị và bảng tuyến',
    'Read the plan, then trace the same ID in 3D': 'Đọc mặt bằng, rồi tra cùng mã trong mô hình 3D',
    '{equipment} connected installed-study equipment / {routes} unique routes / {scopes} drawing scopes. Hidden alternatives and non-electrical furniture are excluded. Shared feeders and trunks repeat as context on circuit sheets; quantities are owned once in the route index.': '{equipment} thiết bị kết nối trong phương án nghiên cứu / {routes} tuyến riêng / {scopes} phạm vi bản vẽ. Không gồm phương án ẩn và nội thất không dùng điện. Tuyến cấp nguồn và tuyến chính dùng chung được vẽ lại để tham chiếu; số lượng chỉ tính một lần trong bảng tuyến.',
    'Print and measure': 'In và đo kiểm',
    'Use A3 landscape at 100%, with no fit-to-page. The line below must measure 100 mm. Plans and height projections have separate stated scales. Never scale from a resized copy.': 'In A3 ngang ở 100%, không co giãn theo trang. Đoạn dưới phải dài 100 mm. Mặt bằng và hình chiếu cao độ ghi tỷ lệ riêng. Không đo theo tỷ lệ trên bản đã đổi kích thước.',
    'Coordinate basis': 'Cơ sở tọa độ',
    'X: axis 1 toward sanctuary. Y: height above nave finished floor. Z: centre between D/E; negative toward B, positive toward H. Grid is a model transcription, not a measured floor plan or installation set-out.': 'X: từ trục 1 về cung thánh. Y: cao độ trên sàn hoàn thiện gian chính. Z: giữa D/E; âm về B, dương về H. Lưới được chép từ mô hình, chưa phải mặt bằng khảo sát hay định vị lắp đặt.',
    'Route reading': 'Cách đọc tuyến',
    'Solid: power/feed. Dashed: loudspeaker audio. Dotted: microphone. Circle: equipment. Square: enclosure. Projection crossings are not junctions. Overlapping vertical paths require the route-vertex CSV and 3D review.': 'Nét liền: cấp điện. Nét đứt: tín hiệu loa. Nét chấm: micro. Tròn: thiết bị. Vuông: tủ/hộp. Giao nhau trên hình chiếu không phải điểm nối. Tuyến đứng chồng nhau cần tra tệp CSV đỉnh tuyến và mô hình 3D.',
    'Length basis': 'Cơ sở chiều dài',
    'Route length = sum of 3D segment lengths. No spare, termination or installation allowances. Audio home run = branch plus its own upstream path; do not add shared bundle lengths again. This is not a conductor/cable take-off.': 'Chiều dài tuyến = tổng chiều dài các đoạn 3D. Chưa gồm dự phòng, đầu nối hay phụ trội lắp đặt. Tuyến âm thanh về tủ = nhánh và đường phía nguồn của chính nhánh đó; không cộng lại bó tuyến dùng chung. Đây chưa phải bảng khối lượng dây/cáp.',
    'Stop before physical work': 'Dừng trước khi thi công',
    'Cable sizes, protection, supply/earthing/fault level, product data, supports, containment and fire stopping, control channels, life-safety functions and commissioning approval are pending. Do not drill timber or close concealed works from these sheets.': 'Tiết diện cáp, bảo vệ, nguồn/nối đất/mức sự cố, dữ liệu sản phẩm, giá đỡ, ống/máng và bịt ngăn cháy, kênh điều khiển, chức năng an toàn và nghiệm thu đều đang chờ. Không khoan gỗ hoặc che kín phần lắp âm theo bộ bản vẽ này.',
    '100 mm print calibration': 'Đoạn kiểm tra tỷ lệ in: 100 mm',
    'Sheet index / circuit lookup': 'Danh mục tờ / tra cứu mạch',
    'After circuit sheets: equipment naming schedule, unique route index and the same nine-stage 3D coordination sequence. PDF bookmarks jump to each sheet.': 'Sau các tờ mạch: bảng tên thiết bị, bảng tuyến riêng và cùng trình tự phối hợp 3D gồm chín bước. Dấu trang PDF dẫn đến từng tờ.',
    'Engineering baseline: feedback and wing speech clarity remain below targets; some seats miss the lighting brief. Fan performance, concealment, emergency design and installation access remain unverified. See docs/engineering/baseline.md and issues.md.': 'Hiện trạng kỹ thuật: biên chống hú và độ rõ lời ở cánh ngang còn dưới mục tiêu; một số ghế chưa đạt yêu cầu chiếu sáng. Hiệu năng quạt, việc che giấu, thiết kế khẩn cấp và tiếp cận lắp đặt chưa được kiểm chứng. Xem docs/engineering/baseline.md và issues.md.',
    'Companion files: drawing-index.json, model-snapshot.json, route-vertices.csv, equipment-coordinates.csv and manifest.json. Hashes bind this print set to its source files. Saved browser layouts are a different configuration.': 'Tệp đi kèm: drawing-index.json, model-snapshot.json, route-vertices.csv, equipment-coordinates.csv và manifest.json. Mã băm liên kết bộ bản in với tệp nguồn. Bố trí lưu trong trình duyệt là cấu hình riêng.',
    'Top plan 1:{plan} / longitudinal height projection 1:{height} at A3 / metres': 'Mặt bằng 1:{plan} / hình chiếu cao độ dọc 1:{height} trên A3 / mét',
    'PLAN / X-Z / +X toward sanctuary >': 'MẶT BẰNG / X-Z / +X về cung thánh >',
    'HEIGHT PROJECTION / X-Y / all Z superimposed': 'HÌNH CHIẾU CAO ĐỘ / X-Y / chồng mọi Z',
    'PLAN CONTEXT: model grid only. Building outlines, support capacity and openings are not certified here. Lines crossing in projection do not establish a connection.': 'THAM CHIẾU: chỉ gồm lưới mô hình. Chưa chứng nhận biên công trình, khả năng chịu lực của giá đỡ hay ô mở. Nét giao nhau trên hình chiếu không xác lập điểm nối.',
    'Trace: equipment ID > branch in route index > shared trunk > feeder. Select that ID in Simulator / Wiring for vertices, height and related controls. Final terminals and control channels: pending.': 'Tra cứu: mã thiết bị > nhánh trong bảng tuyến > tuyến chính chung > tuyến cấp nguồn. Chọn mã trong bộ mô phỏng / mục đi dây để xem đỉnh, cao độ và điều khiển liên quan. Đầu nối và kênh điều khiển cuối cùng: đang chờ.',
    'COORDINATES / X, Y, Z (m)': 'TỌA ĐỘ / X, Y, Z (m)',
    'ID': 'Mã',
    'Branch': 'Nhánh',
    'Related enclosures': 'Tủ/hộp liên quan',
    '{equipment} equipment / {routes} routes including upstream context. Coordinates describe model reference points, not anchor or terminal locations.': '{equipment} thiết bị / {routes} tuyến, gồm đường phía nguồn để tham chiếu. Tọa độ là điểm tham chiếu mô hình, chưa phải vị trí neo hoặc đầu nối.',
    'POWER / SIGNAL: solid / dashed / dotted. Circle: equipment. Square: enclosure. At overlaps, use the coordinate table and the CSV vertices, not a ruler.': 'ĐIỆN / TÍN HIỆU: liền / đứt / chấm. Tròn: thiết bị. Vuông: tủ/hộp. Tại chỗ chồng nhau, tra bảng tọa độ và đỉnh trong CSV; không dùng thước đo.',
    'Equipment naming schedule': 'Bảng tên thiết bị',
    'Circuit': 'Mạch',
    'Board': 'Tủ',
    'Provisional category': 'Loại thiết bị tạm thời',
    'Model equipment name': 'Tên thiết bị trong mô hình',
    'Installed-study items only / product ratings, dimensions and selected manufacturers remain pending': 'Chỉ gồm thiết bị trong phương án nghiên cứu / thông số, kích thước và nhà sản xuất được chọn còn chờ xác nhận',
    'Shared context': 'Tham chiếu dùng chung',
    'Unique route index': 'Bảng tuyến riêng',
    'Ref': 'STT',
    'Stable route ID': 'Mã tuyến ổn định',
    'From': 'Từ',
    'Circuit/zone': 'Mạch/khu',
    'Equipment / context': 'Thiết bị / tham chiếu',
    'Drawn m': 'Dài hình học m',
    'Audio home run m': 'Tuyến âm thanh về tủ m',
    'Geometric centreline lengths only / no cable sizing or installation allowance / each route owned once': 'Chỉ là chiều dài tim tuyến hình học / chưa chọn cáp hay phụ trội lắp đặt / mỗi tuyến chỉ tính một lần',
    '3D installation planning sequence': 'Trình tự dự kiến lắp đặt trong 3D',
    'Same stage text as the local viewer / proposed coordination order / no work or approval recorded': 'Dịch cùng nội dung bước trong bộ xem cục bộ / thứ tự phối hợp dự kiến / chưa ghi nhận thi công hoặc phê duyệt',
    '3D layer: {system} / {mode}': 'Lớp 3D: {system} / {mode}',
    'HOLD / responsible specialist release required': 'ĐANG CHỜ / chuyên gia phụ trách phải xác nhận',
    'all': 'tất cả',
    'distribution': 'phân phối điện',
    'lighting': 'chiếu sáng',
    'sound': 'âm thanh',
    'air': 'không khí',
    'exit': 'thoát nạn',
    'decoration': 'trang trí',
    'building': 'công trình',
    'systems': 'hệ thống',
    'Distribution and feeders': 'Phân phối điện và tuyến cấp nguồn',
    'L3 · Sanctuary': 'L3 / Cung thánh',
    'L1 · Central seating': 'L1 / Ghế ngồi giữa',
    'L1 · Nave · 3 front bays (6–9)': 'L1 / Lòng nhà thờ · 3 gian đầu (6–9)',
    'L2 · Nave · 4 rear bays (2′–6)': 'L2 / Lòng nhà thờ · 4 gian cuối (2′–6)',
    'LD · Wall sconces': 'LD / Đèn gắn tường',
    'L2 · Outer seating': 'L2 / Ghế ngồi biên',
    'L8 · Wings · choir & ministers': 'L8 / Cánh ngang / ca đoàn và người phục vụ',
    'LA · Roof uplight': 'LA / Chiếu hắt lên mái',
    'LD · Chandeliers & sconces': 'LD / Đèn chùm và đèn gắn tường',
    'L4 · Circulation & verandas': 'L4 / Lối đi và hiên',
    'L9 · Front stage & central door': 'L9 / Sân khấu phía trước và cửa giữa',
    'L5 · Steps & paths': 'L5 / Bậc và đường đi',
    'E1 · Exit signs': 'E1 / Biển chỉ dẫn thoát nạn',
    'L6 · Façade & towers': 'L6 / Mặt đứng và tháp',
    'L7 · Festival exterior (strings & tower floods)': 'L7 / Ngoài trời dịp lễ (dây đèn và đèn chiếu tháp)',
    'F1 · Ceiling fans': 'F1 / Quạt trần',
    'F5 · Wing wall fans · held review': 'F5 / Quạt tường cánh ngang / còn chờ duyệt',
    'F2 · Wall fans': 'F2 / Quạt tường',
    'F4 · Entrance circulators (trial)': 'F4 / Quạt tuần hoàn cửa vào (thử nghiệm)',
    'V1 · Exhaust · front gable': 'V1 / Quạt hút / hồi mặt tiền',
    'V2 · Exhaust · wing gables': 'V2 / Quạt hút / hồi hai cánh',
    'V3 · Exhaust · service room': 'V3 / Quạt hút / phòng kỹ thuật',
    'A1 · Main & delay loudspeakers': 'A1 / Loa chính và loa bù trễ',
    'A5 · Rear fill (crowded feasts)': 'A5 / Loa bổ trợ phía sau (lễ đông người)',
    'A2 · Veranda fill': 'A2 / Loa bổ trợ hiên',
    'A3 · Courtyard': 'A3 / Sân ngoài',
    'Microphones': 'Micro',
    '01 · Survey and coordinate': '01 / Khảo sát và phối hợp',
    'Check grid, floor datum, equipment positions and all concealed routes against the measured building. Use the circuit sheets to record corrections.': 'Đối chiếu lưới, mốc sàn, vị trí thiết bị và mọi tuyến đi âm với công trình đã đo khảo sát. Ghi các chỉnh sửa trên tờ bản vẽ mạch.',
    'Survey and coordinated light, sound, air, access and concealment review must precede physical setting-out. This default layout still has unmet targets.': 'Phải khảo sát và rà soát phối hợp ánh sáng, âm thanh, không khí, tiếp cận và che giấu trước khi định vị thực tế. Bố trí mặc định này còn mục tiêu chưa đạt.',
    '02 · Boards and feeder paths': '02 / Tủ điện và đường cấp nguồn',
    'Review DB-1 to DB-2, LC-1, FC-1 and AV-1 paths. Confirm enclosure access and the proposed supply/control separation.': 'Rà soát đường từ DB-1 đến DB-2, LC-1, FC-1 và AV-1. Xác nhận khả năng tiếp cận tủ/hộp và phương án tách nguồn với điều khiển.',
    'Electrical designer: supply, phases, earthing, fault level, protection, cable sizes, board capacity and final single-line diagram are pending. Do not energize from this model.': 'Người thiết kế điện: nguồn, pha, nối đất, mức sự cố, bảo vệ, tiết diện cáp, năng lực tủ và sơ đồ một sợi cuối cùng còn chờ. Không cấp điện theo mô hình này.',
    '03 · Coordinate concealed containment': '03 / Phối hợp ống/máng đi âm',
    'Review all shared corridors and individual branches together. Select each run for its vertices and height; compare with structure and finished surfaces before closing any cover.': 'Rà soát đồng thời mọi hành lang tuyến dùng chung và nhánh riêng. Chọn từng tuyến để xem đỉnh và cao độ; đối chiếu kết cấu và bề mặt hoàn thiện trước khi đóng kín nắp.',
    'Containment size, power/signal separation, fixings, fire stopping, access panels and penetrations require coordinated approval. Coloured routes are enlarged display lines, not cable diameters.': 'Kích thước ống/máng, tách điện/tín hiệu, gá lắp, bịt ngăn cháy, cửa thăm và lỗ xuyên cần được phê duyệt phối hợp. Tuyến màu là nét hiển thị phóng to, không phải đường kính cáp.',
    '04 · Lighting routes and fittings': '04 / Tuyến chiếu sáng và bộ đèn',
    'Review each light circuit and its LC-1 or DB-2 supply. Check chandelier support, aim, driver access, fan-blade interaction and labels against the matching paper sheet.': 'Rà soát từng mạch đèn và nguồn từ LC-1 hoặc DB-2. Kiểm tra đỡ đèn chùm, hướng chiếu, tiếp cận bộ nguồn, tương tác cánh quạt và nhãn theo tờ bản in tương ứng.',
    'Selected-product photometry, support design, control channels, dimming compatibility and installation details remain pending. Review current per-seat lighting failures in the matching calculation report.': 'Quang trắc sản phẩm được chọn, thiết kế giá đỡ, kênh điều khiển, khả năng tương thích giảm sáng và chi tiết lắp đặt còn chờ. Xem các điểm đọc sách chưa đạt chiếu sáng của phương án hiện tại trong báo cáo tính toán cùng phiên bản.',
    '05 · Sound and microphone connections': '05 / Kết nối âm thanh và micro',
    'Trace speaker and microphone lines to AV-1 separately from rack mains. Review polarity, intended zones, furniture/floor interfaces and service access.': 'Tra tuyến loa và micro về AV-1 riêng với điện nguồn của tủ âm thanh. Rà soát cực tính, khu phục vụ dự kiến, tiếp giáp nội thất/sàn và tiếp cận bảo trì.',
    'Amplifier topology, impedance/line voltage, connectors, shielding and separation are pending. Passive speaker ratings are not mains loads; feedback and wing clarity targets remain unmet.': 'Cấu hình bộ khuếch đại, trở kháng/điện áp đường loa, đầu nối, chống nhiễu và phân cách còn chờ. Công suất loa thụ động không phải tải điện lưới; mục tiêu chống hú và độ rõ lời cánh ngang chưa đạt.',
    '06 · Fans and ventilation': '06 / Quạt và thông gió',
    'Review FC-1 and DB-2 routes, motor control compatibility and air paths with the lighting and sound systems. Keep the central processional view clear of visible fans and supports.': 'Rà soát tuyến FC-1 và DB-2, tương thích điều khiển động cơ và đường không khí cùng chiếu sáng và âm thanh. Giữ tầm nhìn trục rước giữa không thấy quạt và giá đỡ.',
    'Current geometry is a study, not an accepted fan installation. Mounting, guards/clearance, duty points, make-up air, noise, concealment and maintenance access need specialist approval.': 'Hình học hiện tại là nghiên cứu, chưa phải phương án lắp quạt được chấp thuận. Gá lắp, lồng bảo vệ/khoảng hở, điểm làm việc, gió bù, tiếng ồn, che giấu và tiếp cận bảo trì cần chuyên gia phê duyệt.',
    '07 · Exit signs and required safety functions': '07 / Biển thoát nạn và chức năng an toàn bắt buộc',
    'Identify E1 separately from discretionary light scenes. Coordinate the required emergency system, operating labels and test access with the responsible designer.': 'Nhận diện E1 riêng với chế độ đèn tùy chọn. Phối hợp hệ thống khẩn cấp bắt buộc, nhãn vận hành và tiếp cận thử nghiệm với người thiết kế phụ trách.',
    'Emergency supply, duration, coverage and failure behavior are not established by the simulator. No scene or walkthrough step authorizes isolation of required safety functions.': 'Bộ mô phỏng chưa xác lập nguồn khẩn cấp, thời gian duy trì, phạm vi phục vụ hay hành vi khi lỗi. Không chế độ hoặc bước xem nào cho phép ngắt chức năng an toàn bắt buộc.',
    '08 · Powered decoration and interfaces': '08 / Trang trí dùng điện và giao tiếp hệ thống',
    'Review decorative loads and concealed feeds, heat dissipation, isolation and replacement access without obstructing worship or other systems.': 'Rà soát tải trang trí, nguồn đi âm, tản nhiệt, cách ly và tiếp cận thay thế, bảo đảm không cản trở phụng vụ hoặc hệ thống khác.',
    'Final products, loads, supports, material/fire compatibility and control interfaces need approval. Empty stages may occur in edited layouts.': 'Sản phẩm cuối cùng, tải, giá đỡ, tương thích vật liệu/cháy và giao tiếp điều khiển cần phê duyệt. Bố trí đã chỉnh sửa có thể có bước không chứa thiết bị.',
    '09 · Inspect, test and hand over': '09 / Kiểm tra, thử nghiệm và bàn giao',
    'After approved installation, the responsible team must record electrical verification, manual/scene and failure tests, light/sound/air measurements, as-built IDs and maintenance instructions.': 'Sau khi lắp đặt được phê duyệt, nhóm phụ trách phải ghi kiểm tra điện, thử điều khiển thủ công/chế độ và khi lỗi, đo ánh sáng/âm thanh/không khí, mã hoàn công và hướng dẫn bảo trì.',
    'No commissioning or construction approval is recorded here. Progress through these review steps does not release a hold or mark any work installed.': 'Chưa ghi nhận nghiệm thu hoặc phê duyệt thi công ở đây. Chuyển qua các bước rà soát không gỡ điểm đang chờ và không đánh dấu công việc đã lắp đặt.',
    # Worker set-out additions, 31 October 2026: building cut, grid set-out, tower risers and installation key.
    'Setting out from the grid': 'Định vị theo lưới trục',
    'Each equipment point and route vertex is also given from its nearest grid axis: 5+1.20/D-0.35 h+2.40 = 1.20 m past axis 5 toward the sanctuary, 0.35 m from axis D toward B, 2.40 m above nave floor +0.000. On the dais (+0.80) or side floors (+0.16), subtract the local floor level. Check the axes on site first.': 'Mỗi điểm thiết bị và mỗi điểm gãy của tuyến cũng được ghi theo trục gần nhất: 5+1.20/D-0.35 h+2.40 = cách trục 5 là 1,20 m về phía cung thánh, cách trục D là 0,35 m về phía B, cao 2,40 m so với sàn lòng nhà thờ +0.000. Trên bục cung thánh (+0.80) hoặc sàn hai bên (+0.16), trừ đi cao độ sàn tại chỗ. Kiểm tra lại các trục ngoài hiện trường trước.',
    'After circuit sheets: TW-01 tower fronts with riser clearances, equipment naming schedule (EQ), unique route index (RI), installation note key (IM), route set-out schedule (RS) and the same nine-stage 3D coordination sequence (SQ). PDF bookmarks jump to each sheet.': 'Sau các tờ mạch: TW-01 mặt trước hai tháp và khoảng hở của ống đứng, bảng tên thiết bị (EQ), bảng tuyến riêng (RI), bảng mã ghi chú lắp đặt (IM), bảng định vị tuyến (RS) và cùng trình tự phối hợp 3D chín bước (SQ). Dấu trang PDF dẫn đến từng tờ.',
    'PLAN CONTEXT: grey lines are a cut through the model walls, piers and columns at +1.00 m, for orientation. They are not a measured survey; support capacity and openings are not certified here. Lines crossing in projection do not establish a connection.': 'THAM CHIẾU MẶT BẰNG: nét xám là mặt cắt qua tường, trụ và cột của mô hình ở cao độ +1.00 m, chỉ để định hướng. Đây không phải số liệu khảo sát; khả năng chịu lực và các lỗ mở không được xác nhận ở đây. Các nét cắt nhau trên hình chiếu không có nghĩa là có điểm nối.',
    'Triangle: vertical run (riser or drop) in a wall, pier or column. Its heights are in the route set-out sheets (RS).': 'Tam giác: đoạn ống đi đứng (lên hoặc xuống) trong tường, trụ hoặc cột. Cao độ của đoạn này ghi trong các tờ định vị tuyến (RS).',
    'Installation notes on this sheet: {codes} (key on sheet IM-01).': 'Ghi chú lắp đặt trên tờ này: {codes} (xem bảng mã ở tờ IM-01).',
    'Grid set-out': 'Định vị theo trục',
    'Grid set-out: nearest axis and offset in metres. 5+1.20 = 1.20 m past axis 5 toward the sanctuary; D-0.35 = 0.35 m from axis D toward B. Height h is above nave floor +0.000.': 'Định vị theo trục: trục gần nhất và khoảng cách tính bằng mét. 5+1.20 = cách trục 5 là 1,20 m về phía cung thánh; D-0.35 = cách trục D là 0,35 m về phía B. Cao độ h tính từ sàn lòng nhà thờ +0.000.',
    'Tower fronts / conduit risers and decoration clearances': 'Mặt trước hai tháp / ống đứng và khoảng hở với trang trí',
    'Front cut at X = +{plane} m (conduit plane) 1:{scale} at A3 / tower routes projected on Z-Y / metres': 'Mặt cắt trước tại X = +{plane} m (mặt phẳng đi ống) 1:{scale} trên A3 / tuyến của tháp chiếu lên Z-Y / mét',
    'Tower {side} / seen from the courtyard': 'Tháp {side} / nhìn từ sân',
    '{side} side: Z {a} to {b}': 'Phía {side}: Z từ {a} đến {b}',
    'RISERS IN THE TOWER FRONT WALL': 'ỐNG ĐỨNG TRONG TƯỜNG MẶT TRƯỚC THÁP',
    'Tower': 'Tháp',
    'From h': 'Từ h',
    'To h': 'Đến h',
    'Clear of arch': 'Cách vòm',
    'Routes': 'Tuyến',
    'board, room face': 'tủ điện, mặt trong phòng',
    'Clear of arch: horizontal distance from the riser to the nearest traced arch envelope (outer moulding ring of the ground or stage arch) over the same height. Negative means inside the arch; louvres, roses and paired openings all lie inside these envelopes.': 'Cách vòm: khoảng cách ngang từ ống đứng đến đường bao vòm gần nhất đã truy từ CAD (vòng phào ngoài cùng của vòm tầng trệt hoặc vòm từng tầng) trong cùng khoảng cao độ. Số âm nghĩa là nằm trong vòm; cửa chớp, hoa hồng và đôi cửa đều nằm trong các đường bao này.',
    'CAD basis (DWG 23 Oct 2026): the tower drawings dimension only the levels -2.080 / +0.000 / +8.390 / +15.840 / +23.140 / +29.090 / +36.920, the 4.900 m tower width and the 5.830 x 4.130 m plan at +15.84. Arch, louvre and rose centres and radii are traced from drawn lines (E01B, E02), not dimensioned. The DWG has no text for decoration sizes, materials or electrical items.': 'Cơ sở CAD (DWG 23/10/2026): bản vẽ tháp chỉ ghi kích thước các cao độ -2.080 / +0.000 / +8.390 / +15.840 / +23.140 / +29.090 / +36.920, bề rộng tháp 4,900 m và mặt bằng 5,830 x 4,130 m tại +15.84. Tâm và bán kính của vòm, cửa chớp và hoa hồng được truy từ nét vẽ (E01B, E02), không có đường kích thước. DWG không có chữ ghi kích thước trang trí, vật liệu hay thiết bị điện.',
    'B / H: the sheet follows model axes (B left, H right seen from the courtyard). The CAD sheets draw H on the left (ENG-027 open). Name towers by grid letter, never left or right.': 'B / H: tờ này theo trục mô hình (nhìn từ sân: B bên trái, H bên phải). Các tờ CAD vẽ H ở bên trái (ENG-027 còn mở). Gọi tháp theo chữ trục, không gọi trái hay phải.',
    'Keep risers in the solid corner piers. Never chase through louvres, roses or arch mouldings. Wall thickness, pier core, reinforcement and chase depth are on ENGINEERING HOLD; confirm on site before cutting.': 'Giữ ống đứng trong các trụ góc đặc. Không đục rãnh qua cửa chớp, hoa hồng hay phào vòm. Bề dày tường, lõi trụ, cốt thép và độ sâu rãnh đang CHỜ XÁC NHẬN KỸ THUẬT; kiểm tra tại hiện trường trước khi đục.',
    'Installation note key': 'Bảng mã ghi chú lắp đặt',
    'One note per distinct model installation method / proposals, not approved installation details': 'Mỗi cách lắp đặt khác nhau trong mô hình một ghi chú / là đề xuất, chưa phải chi tiết lắp đặt đã duyệt',
    'Code': 'Mã',
    'Model installation note': 'Ghi chú lắp đặt trong mô hình',
    'Route set-out schedule': 'Bảng định vị tuyến',
    'Each route once / vertices in order from the board / grid axis + offset (m) / h = height above nave floor +0.000': 'Mỗi tuyến một lần / các điểm gãy theo thứ tự từ tủ điện / trục + khoảng cách (m) / h = cao độ so với sàn lòng nhà thờ +0.000',
    'Note': 'Ghi chú',
    'Vertex set-out from the source end': 'Định vị các điểm gãy từ đầu nguồn',
    'L10 · Façade statues & candles': 'L10 / Tượng và nến mặt tiền',
    'LS · Stations of the Cross candles': 'LS / Nến Đàng Thánh Giá',
    'P1 · Sockets · side B (sanctuary + nave)': 'P1 / Ổ cắm / cạnh B (cung thánh + lòng nhà)',
    'P2 · Sockets · side H (sanctuary + nave)': 'P2 / Ổ cắm / cạnh H (cung thánh + lòng nhà)',
    'P3 · Event power · tower B': 'P3 / Nguồn sự kiện / tháp B',
    'P4 · Event power · tower H': 'P4 / Nguồn sự kiện / tháp H',
    # Model installation notes (simulator/electrical.js); proposals, not approved details.
    'Above beam and covered rear-face return to lamp-body cable entry. Existing canopy/capital contact remains on mounting coordination hold; optical position unchanged.': 'Đi trên dầm rồi vòng che kín ở mặt sau đến lỗ luồn cáp của thân đèn. Chỗ chạm giữa chụp đèn và đầu cột vẫn chờ phối hợp cách gắn; giữ nguyên vị trí quang học.',
    'Above lining / beam tops, short covered joint and rear-face return to fitting. Roof access, rafter/tie interface and removable cover details pending; no timber drilling / notching.': 'Đi trên lớp ốp trần / mặt trên dầm, đoạn nối ngắn có che, vòng ở mặt sau đến thiết bị. Lối lên mái, chỗ giao với kèo/thanh giằng và chi tiết nắp tháo được còn chờ; không khoan hoặc khoét gỗ.',
    'Above lining to a local roof fitting; roof entry / weatherproof termination pending.': 'Đi trên lớp ốp trần đến thiết bị trên mái tại chỗ; chỗ xuyên mái / đầu nối chống nước còn chờ.',
    'Above nave lining / covered soffit route at wings and verandas; cable continues inside the existing pendant stem. Roof build-up, supports and access pending.': 'Đi trên lớp ốp trần lòng nhà / tuyến che dưới mái ở cánh ngang và hiên; cáp đi tiếp trong cần treo đèn có sẵn. Cấu tạo mái, giá đỡ và lối tiếp cận còn chờ.',
    'Above nave lining, then down the outer face of the column-line beam in a removable finish-matched cover to the hanger; cable continues inside the downrod. Hanger, beam section and access pending.': 'Đi trên lớp ốp trần lòng nhà, rồi xuống mặt ngoài dầm trên hàng cột trong nắp che tháo được cùng màu bề mặt đến móc treo; cáp đi tiếp trong cần treo. Móc treo, tiết diện dầm và lối tiếp cận còn chờ.',
    'Above roof lining to solid front gable above terrace; local fan connection.': 'Đi trên lớp ốp mái đến tường hồi đặc phía trước, trên sân trước; nối quạt tại chỗ.',
    'Back-wall band to service space behind chamber lining; local termination behind the fitting / cornice. Removable lining and cable-entry detail pending.': 'Dải tường sau đến khoảng kỹ thuật phía sau lớp ốp gian cung thánh; đầu nối tại chỗ phía sau thiết bị / phào. Lớp ốp tháo được và chi tiết luồn cáp còn chờ.',
    'Buried duct below the entrance-hall floor and tower plinth, rising inside the solid tower pier to the cabinet. Duct size, depth, draw pits, water sealing and separation pending; no chase through the arch mouldings.': 'Ống chôn dưới sàn sảnh cửa vào và bệ tháp, đi lên trong trụ đặc của tháp đến hộp điện. Cỡ ống, độ sâu, hố kéo cáp, chống thấm và khoảng cách tách còn chờ; không đục rãnh qua phào vòm.',
    'Concealed entrance wall band, solid pier and local termination.': 'Đi âm trong dải tường cửa vào, trụ đặc và đầu nối tại chỗ.',
    'Concealed roof route to local roof-mounted fitting; weatherproof cable entry pending.': 'Tuyến đi âm trên mái đến thiết bị gắn trên mái tại chỗ; chỗ luồn cáp chống nước còn chờ.',
    'Concealed solid-pier / wall drop and local termination.': 'Đoạn xuống âm trong trụ đặc / tường và đầu nối tại chỗ.',
    'Covered roof-soffit crossing into outer arcade / wing-gable wall, then concealed pier drop. No exposed crossing at equipment height.': 'Vượt có che dưới mái vào tường hành lang vòm ngoài / tường hồi cánh ngang, rồi đi âm xuống trong trụ. Không có đoạn vượt lộ ở cao độ thiết bị.',
    'Dedicated buried duct from EB-1 (beside DB-2) below the entrance-hall floor to the tower base; duct, depth, draw pits and water sealing pending.': 'Ống chôn riêng từ EB-1 (cạnh DB-2) dưới sàn sảnh cửa vào đến chân tháp; ống, độ sâu, hố kéo cáp và chống thấm còn chờ.',
    'Entrance wall band to solid jamb outside coloured fanlight, fixed transom and local inside-face sign clip. Removable frame cover, fixing and emergency design pending.': 'Dải tường cửa vào đến má cửa đặc bên ngoài ô kính màu trên cửa, thanh ngang cố định và kẹp biển ở mặt trong tại chỗ. Nắp che khung tháo được, cách cố định và thiết kế khẩn cấp còn chờ.',
    'Existing service-room wall tray / local equipment connection': 'Máng tường có sẵn trong phòng phụ trợ / nối thiết bị tại chỗ',
    'Rear-wall band and local termination; gable / weatherproof entry details pending.': 'Dải tường sau và đầu nối tại chỗ; chi tiết hồi / chỗ luồn chống nước còn chờ.',
    'Separate AV-1 home run below floor; central ambo passage through proposed hollow neck, sloped desk and removable microphone socket. Floorbox, furniture bore and access pending.': 'Tuyến riêng về AV-1 dưới sàn; đi qua giữa giảng đài bằng cổ rỗng đề xuất, mặt bàn nghiêng và ổ cắm micro tháo được. Hộp sàn, lỗ khoan đồ gỗ và lối tiếp cận còn chờ.',
    'Separate AV-1 home run below the floor; proposed furniture cable passage to microphone base. Floorbox, floor build-up and furniture access pending.': 'Tuyến riêng về AV-1 dưới sàn; đường luồn cáp đề xuất trong đồ gỗ đến chân micro. Hộp sàn, cấu tạo sàn và lối tiếp cận đồ gỗ còn chờ.',
    'Separate microphone home-run bundle below service-room and sanctuary floors; floor build-up / access pending.': 'Bó tuyến micro riêng về tủ, đi dưới sàn phòng phụ trợ và cung thánh; cấu tạo sàn / lối tiếp cận còn chờ.',
    'Short tray between the two boards on the tower front wall': 'Máng ngắn giữa hai tủ điện trên tường mặt trước tháp',
    'Solid tower corner/piers, stepped behind cornices; local ledge/fitting connection. No riser through louver openings; chase/finish and weathering details pending.': 'Đi trong góc/trụ đặc của tháp, lùi phía sau các phào; nối tại chỗ đến gờ/thiết bị. Không đi ống đứng qua ô cửa chớp; chi tiết rãnh/hoàn thiện và chống mưa còn chờ.',
    'Tower pier to proposed service space behind removable cornice finish, then local fitting lead. Cornice cavity, access, weathering and cable-entry details remain unresolved.': 'Từ trụ tháp đến khoảng kỹ thuật đề xuất phía sau lớp hoàn thiện phào tháo được, rồi dây nối thiết bị tại chỗ. Khoang phào, lối tiếp cận, chống mưa và chi tiết luồn cáp chưa giải quyết.',
    'Wall band to solid jamb beside coloured fanlight, fixed 220 mm door-head band and local sign lead. Frame containment, fixing and emergency design pending.': 'Dải tường đến má cửa đặc cạnh ô kính màu trên cửa, dải đầu cửa cố định 220 mm và dây nối biển tại chỗ. Ống/máng trong khung, cách cố định và thiết kế khẩn cấp còn chờ.',
    'Wall bands above openings; concealed finish-matched soffit crossing over the 9–10 wing opening.': 'Các dải tường phía trên lỗ mở; đoạn vượt âm dưới mặt dưới, cùng màu bề mặt, qua lỗ mở cánh ngang 9–10.',
    'Wall bands, covered wing-roof crossing, entrance wall riser': 'Các dải tường, đoạn vượt có che qua mái cánh ngang, ống đứng ở tường cửa vào',
    'Wall riser beside niche; containment above ceiling top +4.27 m; panel cable entry pending structural coordination.': 'Ống đứng trên tường cạnh hốc; ống/máng phía trên mặt trần +4.27 m; chỗ luồn cáp vào đèn tấm chờ phối hợp kết cấu.',
}

PRODUCTS = {
    'Concealed light line · niche arch': 'Dải đèn ẩn / vòm hốc',
    'Concealed light line · niche jamb': 'Dải đèn ẩn / má hốc',
    'Double socket outlet · 16 A · recessed': 'Ổ cắm đôi / 16 A / lắp âm',
    'Event power point · 32 A + 2 × 16 A · lockable': 'Điểm nguồn sự kiện / 32 A + 2 x 16 A / có khóa',
    'Open-porch wall fill · 6" · concept': 'Loa bổ trợ tường hiên thoáng / 6" / ý tưởng',
    'Open-porch wall flood · concept': 'Đèn chiếu rộng tường hiên thoáng / ý tưởng',
    'Station candle light · wall': 'Đèn nến Đàng Thánh Giá / gắn tường',
    'Statue candle light · electric flame': 'Đèn nến bên tượng / ngọn lửa điện',
    'Wing wall fan · 45 cm · extended bracket concept': 'Quạt tường cánh ngang / 45 cm / giá vươn còn chờ duyệt',
    'Nave wall fan · 45 cm · extended bracket concept': 'Quạt tường gian chính / 45 cm / giá vươn còn chờ duyệt',
    'Saint Peter (Thánh Phêrô) · concept picture': 'Tranh Thánh Phêrô / ý tưởng',
    'Saint Paul (Thánh Phaolô) · concept picture': 'Tranh Thánh Phaolô / ý tưởng',
    'Service-room LED panel · 600 × 600 mm': 'Đèn tấm LED phòng phụ trợ / 600 x 600 mm',
    'LED projector · medium 36°': 'Đèn chiếu LED / góc trung bình 36°',
    'Reading projector · side bracket, finish-matched': 'Đèn chiếu đọc sách / giá đỡ bên hông, cùng màu bề mặt',
    'Small brass chandelier + reading optic · concept': 'Đèn chùm đồng thau nhỏ + quang học đọc sách / ý tưởng',
    'Roof uplight · wide flood': 'Đèn hắt lên mái / chiếu rộng',
    'Brass candle chandelier · 8 lamps': 'Đèn chùm nến bằng đồng thau / 8 bóng',
    'Grand chandelier · 12 lamps': 'Đèn chùm lớn / 12 bóng',
    'Brass candle sconce · 2 lamps': 'Đèn tường nến bằng đồng thau / 2 bóng',
    'LED projector · narrow 24°': 'Đèn chiếu LED / góc hẹp 24°',
    'Accent spotlight · 15°': 'Đèn rọi tạo điểm nhấn / 15°',
    'Pendant lantern · opal': 'Đèn lồng thả / trắng đục',
    'Wall lantern': 'Đèn lồng gắn tường',
    'Exit sign (maintained)': 'Biển thoát nạn (sáng liên tục)',
    'Tower floodlight · projecting arm': 'Đèn chiếu rộng tháp / tay đỡ vươn',
    'Façade floodlight': 'Đèn chiếu rộng mặt đứng',
    'Tower ledge light bar · cornice colour': 'Thanh đèn trên gờ tháp / cùng màu phào chỉ',
    'Compact ledge floodlight · cornice colour': 'Đèn chiếu rộng nhỏ trên gờ / cùng màu phào chỉ',
    'Festival bulb string (outdoor)': 'Dây bóng đèn dịp lễ (ngoài trời)',
    'Ceiling fan · 1.42 m (56")': 'Quạt trần / 1.42 m (56")',
    'Wall fan · oscillating 45 cm': 'Quạt tường / đảo hướng 45 cm',
    'Large wall circulator · 90 cm': 'Quạt tuần hoàn tường lớn / 90 cm',
    'Exhaust (ventilation) fan · 50 cm': 'Quạt hút thải (thông gió) / 50 cm',
    'Slim wall column · 0.6 m, wall colour': 'Loa cột mảnh gắn tường / 0.6 m, màu tường',
    'Pendant loudspeaker · 6"': 'Loa thả / 6"',
    'Outdoor horn · 30 W': 'Loa nén ngoài trời / 30 W',
    'Gooseneck microphone (cardioid)': 'Micro cổ ngỗng (hướng thu hình tim)',
}

NAME_PARTS = {
    'Assumption of Our Lady': 'Đức Mẹ Lên Trời',
    'Saint Peter': 'Thánh Phêrô',
    'Saint Paul': 'Thánh Phaolô',
    'B side': 'phía B',
    'H side': 'phía H',
    'Event power': 'Nguồn sự kiện',
    'Socket': 'Ổ cắm',
    'Hidden arch light': 'Đèn ẩn ở vòm',
    'Hidden jamb light': 'Đèn ẩn ở má',
    'Porch arch wash': 'Đèn hắt vòm hiên',
    'Porch fill': 'Loa bổ trợ hiên',
    'Porch path light': 'Đèn lối đi hiên',
    'Station candle': 'Nến Đàng Thánh Giá',
    'Statue candle light': 'Đèn nến bên tượng',
    'axis 10 pier': 'trụ trục 10',
    'inside the porch': 'phía trong hiên',
    'mid-nave side B': 'giữa lòng nhà phía B',
    'mid-nave side H': 'giữa lòng nhà phía H',
    'sanctuary side B': 'cung thánh phía B',
    'sanctuary side H': 'cung thánh phía H',
    # Station numbers and statue letters keep their form.
    **{n: n for n in 'A I II III IV V VI VII VIII IX X XI XII XIII XIV'.split()},
    'Saint Peter picture': 'Tranh Thánh Phêrô',
    'Saint Paul picture': 'Tranh Thánh Phaolô',
    'toward entrance': 'hướng về cửa vào',
    'concept': 'ý tưởng',
    'Service-room ceiling panel': 'Đèn tấm trần phòng phụ trợ',
    'Reading light': 'Đèn đọc sách',
    'Rear rows light': 'Đèn hàng ghế sau',
    'Rear centre light': 'Đèn giữa phía sau',
    'Wing light': 'Đèn cánh ngang',
    'Roof uplight': 'Đèn hắt lên mái',
    'Chandelier': 'Đèn chùm',
    'Grand chandelier': 'Đèn chùm lớn',
    'Sconce': 'Đèn gắn tường',
    'Altar key light': 'Đèn chính bàn thờ',
    'Ambo key light': 'Đèn chính giảng đài',
    'Sanctuary step fill': 'Đèn bổ trợ bậc cung thánh',
    'Presider chair light': 'Đèn ghế chủ tế',
    'Sanctuary frame wash': 'Đèn chiếu đều khung cung thánh',
    'Crucifix accent': 'Đèn nhấn thánh giá',
    'Reredos wash': 'Đèn chiếu đều hậu bàn thờ',
    'Reredos base wash': 'Đèn chiếu đều chân hậu bàn thờ',
    'Sanctuary vault uplight': 'Đèn hắt lên vòm cung thánh',
    'Tabernacle accent': 'Đèn nhấn nhà tạm',
    'Statue accent': 'Đèn nhấn tượng',
    'Shrine wash': 'Đèn chiếu đều tòa tượng',
    'Veranda lantern': 'Đèn lồng hiên',
    'Central front door lantern': 'Đèn lồng cửa trước giữa',
    'Side door lantern': 'Đèn lồng cửa bên',
    'Service door lantern': 'Đèn lồng cửa phòng phụ trợ',
    'Exit sign': 'Biển thoát nạn',
    'Tower lower front wash': 'Đèn chiếu đều mặt trước chân tháp',
    'Tower stage 2 flood': 'Đèn chiếu rộng tầng 2 tháp',
    'Tower stage 3 flood': 'Đèn chiếu rộng tầng 3 tháp',
    'Belfry front wash': 'Đèn chiếu đều mặt trước lầu chuông',
    'Dome front wash': 'Đèn chiếu đều mặt trước vòm',
    'Belfry glow': 'Đèn hắt lầu chuông',
    'Tower lower side wash': 'Đèn chiếu đều mặt bên chân tháp',
    'Tower stage 2 side wash': 'Đèn chiếu đều mặt bên tầng 2 tháp',
    'Tower stage 3 side wash': 'Đèn chiếu đều mặt bên tầng 3 tháp',
    'Belfry side wash': 'Đèn chiếu đều mặt bên lầu chuông',
    'Façade wash': 'Đèn chiếu đều mặt đứng',
    'Stage flood': 'Đèn chiếu rộng sân khấu',
    'Path light': 'Đèn đường đi',
    'Festival lights': 'Đèn dịp lễ',
    'Festival flood': 'Đèn chiếu rộng dịp lễ',
    'Central gable flood': 'Đèn chiếu rộng đầu hồi giữa',
    'Central crown wash': 'Đèn chiếu đều đỉnh trang trí giữa',
    'Ceiling fan': 'Quạt trần',
    'Wall fan': 'Quạt tường',
    'Entrance circulator': 'Quạt tuần hoàn cửa vào',
    'Exhaust fan': 'Quạt hút thải',
    'Wall speaker': 'Loa gắn tường',
    'Wing speaker': 'Loa cánh ngang',
    'Veranda fill': 'Loa bổ trợ hiên',
    'Courtyard horn': 'Loa nén sân ngoài',
    'Tower horn': 'Loa nén tháp',
    'Side courtyard horn': 'Loa nén sân bên',
    'Ambo microphone': 'Micro giảng đài',
    'Altar microphone': 'Micro bàn thờ',
    'twin': 'đèn đôi',
    'front block': 'cụm trước',
    'rear block': 'cụm sau',
    'back rows': 'hàng sau',
    'front rows': 'hàng trước',
    'entrance façade': 'mặt đứng cửa vào',
    'sanctuary pier': 'trụ cung thánh',
    'front': 'phía trước',
    'rear': 'phía sau',
    'inner': 'phía trong',
    'outer': 'phía ngoài',
    'inner corner': 'góc trong',
    'outer corner': 'góc ngoài',
    'roof ridge': 'đỉnh mái',
    'nave': 'gian chính',
    'sanctuary': 'cung thánh',
    'front terrace between the towers': 'sân trước giữa hai tháp',
    'front gable': 'đầu hồi trước',
    'service room': 'phòng phụ trợ',
    'entrance hall': 'sảnh cửa vào',
    'main doors': 'cửa chính',
    'held review': 'còn chờ duyệt',
    'held': 'còn chờ xác minh kỹ thuật',
}


def text(value, language='en', **fields):
    if language == 'vi':
        try:
            value = VI[value]
        except KeyError as exc:
            raise ValueError(f'Missing Vietnamese drawing translation: {value!r}') from exc
    return value.format(**fields) if fields else value


def product(value, language='en'):
    if language == 'en':
        return value
    try:
        return PRODUCTS[value]
    except KeyError as exc:
        raise ValueError(f'Missing Vietnamese product description: {value!r}') from exc


def equipment_name(value, language='en'):
    if language == 'en':
        return value
    parts = value.split(' · ')
    return ' / '.join('phía ngoài '+part[0] if parts[0] == 'Exhaust fan' and part in ('B outer','H outer')
                      else name_part(part) for part in parts)


def name_part(part):
    if part in NAME_PARTS:
        return NAME_PARTS[part]
    # Grid letters, measured/source numbers and unit symbols retain their form.
    if re.fullmatch(r'[BH]|[0-9.]+(?: m)?', part):
        return part
    for pattern, target in [
        (r'axis (\d+(?:′)?)', 'trục {0}'),
        (r'bay ([0-9]+(?:′)?[–-][0-9]+)', 'khoang {0}'),
        (r'crossing ([0-9]+[–-][0-9]+)', 'giao cắt {0}'),
        (r'([BH]) central', 'dãy giữa {0}'),
        (r'([BH]) outer', 'dãy biên {0}'),
        (r'([BH]) inner', 'phía trong {0}'),
        (r'([BH]) aisle', 'lối bên {0}'),
        (r'wing ([BH])', 'cánh ngang {0}'),
        (r'wing gable ([BH])', 'đầu hồi cánh ngang {0}'),
        (r'rear gable ([BH])', 'đầu hồi sau {0}'),
        (r'tower ([BH])', 'tháp {0}'),
        (r'main eave ([BH])', 'mái đua chính {0}'),
        (r'veranda eave ([BH])', 'mái đua hiên {0}'),
        (r'stage (\d+)', 'tầng {0}'),
        (r'side door ([0-9.]+)', 'cửa bên {0}'),
    ]:
        match = re.fullmatch(pattern, part)
        if match:
            return target.format(*match.groups())
    raise ValueError(f'Missing Vietnamese equipment-name part: {part!r}')


def printable(value, language='en'):
    """Preserve the old English ASCII behavior; keep Vietnamese accents in NFC."""
    value = str(value).replace('→', ' > ').replace('·', ' / ').replace('×', ' x ')
    value = value.replace('−', '-').replace('–', '-').replace('—', '-').replace('′', "'")
    if language == 'en':
        value = value.replace('đ', 'd').replace('Đ', 'D')
        return unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode()
    return unicodedata.normalize('NFC', value)


def pdf_name(language='en'):
    return 'thach-bi-electrical-review-A3'+('-vi' if language == 'vi' else '')+'.pdf'
