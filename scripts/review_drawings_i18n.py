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
    'V1 · Exhaust ventilation': 'V1 / Thông gió hút thải',
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
}

PRODUCTS = {
    'Wing wall fan · 45 cm · extended bracket concept': 'Quạt tường cánh ngang / 45 cm / giá vươn còn chờ duyệt',
    'Saint Peter (Thánh Phêrô) · concept picture': 'Tranh Thánh Phêrô / ý tưởng',
    'Saint Paul (Thánh Phaolô) · concept picture': 'Tranh Thánh Phaolô / ý tưởng',
    'Service-room LED panel · 600 × 600 mm': 'Đèn tấm LED phòng phụ trợ / 600 x 600 mm',
    'LED projector · medium 36°': 'Đèn chiếu LED / góc trung bình 36°',
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
        (r'axis (\d+)', 'trục {0}'),
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
