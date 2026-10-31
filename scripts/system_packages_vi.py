"""Vietnamese, plain-language system packages split from the A3 electrical review set.

Each installed circuit belongs to exactly one package; the builder fails when a
new circuit has no package. Text here is written directly in Vietnamese for
parish members and installers without electrical training. It explains the same
model data as the full set and adds no engineering approval or product choice.
"""
from __future__ import annotations

FOLDER = 'theo-he-thong'

# Ordered as the owner asked: sound, air, lights inside / outside / towers, then the rest.
PACKAGES = [
    {
        'key': '01-am-thanh', 'code': 'AT', 'title': 'Hệ thống âm thanh',
        'circuits': ['A1', 'A5', 'A2', 'A3', 'MIC'],
        'purpose': 'Tài liệu này chỉ nói về hệ thống âm thanh: loa trong nhà thờ, loa ngoài hiên và ngoài sân, micro ở giảng đài và bàn thờ. Tất cả dây loa và dây micro đi về tủ âm thanh AV-1 trong phòng phụ trợ sau bàn thờ. Dùng tài liệu để biết mỗi loa, mỗi micro đặt ở đâu, cao bao nhiêu và đường ống dây đi qua chỗ nào.',
        'stop': [
            'Dây loa (nét đứt) và dây micro (nét chấm) là dây tín hiệu. Chưa có quyết định về khoảng cách với dây điện và loại ống; hỏi kỹ sư trước khi cho chung ống hoặc chung máng với dây điện.',
            'Loại loa, công suất và cách treo chưa được chọn. Chưa khoan bắt giá loa vào cột gỗ hoặc phào trang trí.',
        ],
    },
    {
        'key': '02-quat-va-thong-gio', 'code': 'QG', 'title': 'Hệ thống quạt và thông gió',
        'circuits': ['F1', 'F2', 'F4', 'F5', 'V1', 'V2', 'V3'],
        'purpose': 'Tài liệu này chỉ nói về quạt: quạt trần, quạt tường, quạt ở cửa vào, và quạt hút gió ở đầu hồi và phòng phụ trợ. Quạt được điều khiển từ tủ FC-1 trong phòng phụ trợ sau bàn thờ. Dùng tài liệu để biết mỗi quạt đặt ở đâu, cao bao nhiêu và đường ống điện đi qua chỗ nào.',
        'stop': [
            'Quạt phải được giấu khỏi tầm nhìn giữa lòng nhà thờ (từ cửa chính lên bàn thờ). Không treo quạt ở giữa lòng nhà thờ.',
            'Tải treo của quạt lên cột, xà gỗ chưa được kỹ sư kết cấu kiểm tra. Chưa khoan hoặc bắt quạt vào gỗ.',
            'Mạch F4 đang thử nghiệm và F5 còn chờ duyệt: chỉ chuẩn bị, chưa lắp cố định.',
        ],
    },
    {
        'key': '03-den-trong-nha-tho', 'code': 'DT', 'title': 'Đèn bên trong nhà thờ',
        'circuits': ['L1', 'L2', 'L3', 'L8', 'LA', 'LS'],
        'purpose': 'Tài liệu này chỉ nói về đèn bên trong nhà thờ: đèn lòng nhà thờ, đèn cung thánh, đèn hai cánh ngang (ca đoàn), đèn hắt lên mái và đèn nến 14 chặng Đàng Thánh Giá. Các mạch đèn đi về tủ điện chính DB-1 và tủ điều khiển đèn LC-1 trong phòng phụ trợ sau bàn thờ.',
        'stop': [
            'Đèn phải được giấu hoặc cùng màu với chỗ gắn, theo ý chủ đầu tư. Loại đèn, độ sáng và góc chiếu chưa được chọn.',
            'Chưa đục rãnh hoặc khoan xuyên cột, xà và đồ gỗ sơn son thếp vàng.',
        ],
    },
    {
        'key': '04-den-ngoai-troi', 'code': 'DN', 'title': 'Đèn ngoài trời: hiên, lối đi, bậc thềm',
        'circuits': ['L4', 'L5'],
        'purpose': 'Tài liệu này chỉ nói về đèn ngoài nhà thờ ở hai bên: đèn hiên, đèn lối đi, đèn bậc thềm và đèn lồng ở các cửa bên. Các mạch này đi về tủ điện chính DB-1 trong phòng phụ trợ sau bàn thờ. Đèn mặt tiền, đèn tháp và đèn lễ hội nằm trong tài liệu 05.',
        'stop': [
            'Đèn và hộp nối ngoài trời phải chịu mưa. Cấp chống nước và loại ống ngoài trời chưa được chọn.',
            'Không đục phào, gờ cửa hoặc cột hiên trang trí khi chưa có người phụ trách cho phép.',
        ],
    },
    {
        'key': '05-den-mat-tien-thap-va-le-hoi', 'code': 'DM', 'title': 'Đèn mặt tiền, hai tháp và đèn lễ hội',
        'circuits': ['L6', 'L9', 'L10', 'L7'],
        'purpose': 'Tài liệu này chỉ nói về đèn ở mặt tiền và hai tháp chuông: đèn chiếu sáng tháp, đèn cửa chính, đèn tượng và nến ở mặt tiền, và dây đèn lễ hội trên mái, mái hiên và tháp. Các mạch này đi về tủ DB-2 và tủ lễ hội EB-1 ở phòng tầng trệt tháp H. Tờ TW-01 vẽ mặt đứng hai tháp và cho biết ống đứng cách vòm trang trí bao nhiêu.',
        'stop': [
            'Ống đứng từ +15.85 m ở mặt tháp chỉ cách phào vòm tầng 3 khoảng 0.06 m (hồ sơ ENG-042, đang chờ kiến trúc sư và kỹ sư kết cấu). Không đục theo vị trí này.',
            'Không đục qua cửa chớp, hoa hồng, phào vòm hay tượng. Chiều dày tường, lõi trụ và cốt thép tháp chưa biết; phải kiểm tra tại chỗ.',
            'Làm việc trên cao ở tháp cần giàn giáo và biện pháp an toàn riêng; tài liệu này không thay thế biện pháp đó.',
        ],
    },
    {
        'key': '06-den-thoat-hiem', 'code': 'TH', 'title': 'Đèn chỉ dẫn lối thoát hiểm',
        'circuits': ['E1'],
        'purpose': 'Tài liệu này chỉ nói về biển đèn chỉ dẫn lối thoát ở cửa chính và các cửa bên. Mạch đi về tủ điện chính DB-1. Đây là thiết bị an toàn cho người khi có sự cố.',
        'stop': [
            'Đèn thoát hiểm là thiết bị an toàn sinh mạng. Loại đèn, pin dự phòng, thời gian sáng và vị trí cuối cùng phải theo thiết kế phòng cháy được cơ quan có thẩm quyền duyệt. Thiết kế đó chưa có.',
            'Không dùng chung công tắc hoặc chế độ tắt của đèn thường cho đèn thoát hiểm.',
        ],
    },
    {
        'key': '07-o-cam-va-nguon-su-kien', 'code': 'OC', 'title': 'Ổ cắm và nguồn điện sự kiện',
        'circuits': ['P1', 'P2', 'P3', 'P4'],
        'purpose': 'Tài liệu này chỉ nói về ổ cắm hai bên cung thánh và lòng nhà thờ (đi về tủ DB-1), và hai điểm lấy điện cho sự kiện trong hiên tháp B và tháp H (đi về tủ DB-2).',
        'stop': [
            'Thiết bị bảo vệ chống giật, số ổ và công suất cho phép chưa được kỹ sư điện chọn. Không dùng ổ sự kiện cho tải lớn khi chưa có số liệu.',
        ],
    },
    {
        'key': '08-tu-dien-va-duong-cap', 'code': 'TD', 'title': 'Tủ điện và đường cấp nguồn chính',
        'circuits': ['distribution'],
        'purpose': 'Tài liệu này chỉ nói về các tủ điện và đường cáp nối giữa các tủ: tủ điện chính DB-1, tủ DB-2 và tủ lễ hội EB-1 ở tháp H, tủ điều khiển đèn LC-1, tủ điều khiển quạt FC-1 và tủ âm thanh AV-1. Đường cấp từ lưới điện vào tủ DB-1 chưa có trong mô hình.',
        'stop': [
            'Nguồn điện vào, số pha, nối đất, cỡ cáp và aptomat chưa được kỹ sư điện xác nhận. Không mua cáp hoặc tủ theo tài liệu này.',
            'Cáp từ DB-1 sang tháp H đi dọc cả nhà thờ: phải có kỹ sư chọn đường, ống và chỗ bịt chống cháy trước khi thi công.',
        ],
    },
]

# Every package repeats these, in this order, after its own warnings.
STOP_COMMON = [
    'Đây là bản vẽ đang phát triển, KHÔNG dùng để thi công. Chỉ dùng để xem, góp ý và chuẩn bị.',
    'Cỡ dây, aptomat, loại ống, hộp nối và giá đỡ chưa được chọn. Không mua vật tư theo tài liệu này.',
    'Kiểm tra lại các trục ngoài công trình trước khi đánh dấu. Con số lấy từ mô hình máy tính, không phải số đo thực tế.',
    'Thấy ống vướng tường, cửa, tượng, hoặc khác với thực tế: dừng lại, chụp ảnh, ghi mã thiết bị và báo người phụ trách.',
]

# Plain names for the circuits; the drawing labels keep the shorter register names.
CIRCUITS = {
    'A1': 'Loa chính trong nhà thờ và loa bù trễ cho các hàng ghế phía sau',
    'A5': 'Loa bổ trợ cuối nhà thờ, chỉ dùng khi lễ đông người',
    'A2': 'Loa ngoài hiên hai bên',
    'A3': 'Loa ngoài sân trước, sân bên và ở tháp',
    'MIC': 'Micro ở giảng đài và bàn thờ',
    'F1': 'Quạt trần',
    'F2': 'Quạt tường trong lòng nhà thờ',
    'F4': 'Quạt ở cửa vào (đang thử nghiệm)',
    'F5': 'Quạt tường ở hai cánh ngang (còn chờ duyệt)',
    'V1': 'Quạt hút gió ở đầu hồi mặt tiền',
    'V2': 'Quạt hút gió ở đầu hồi hai cánh ngang',
    'V3': 'Quạt hút gió phòng phụ trợ',
    'L1': 'Đèn lòng nhà thờ, 3 gian phía cung thánh (trục 6 đến 9)',
    'L2': 'Đèn lòng nhà thờ, 4 gian phía cửa chính (trục 2′ đến 6)',
    'L3': 'Đèn cung thánh',
    'L8': 'Đèn hai cánh ngang: ca đoàn và người phục vụ',
    'LA': 'Đèn hắt lên mái, dọc giữa nhà thờ',
    'LS': 'Đèn nến 14 chặng Đàng Thánh Giá',
    'L4': 'Đèn hiên và lối đi hai bên',
    'L5': 'Đèn bậc thềm, đường đi và đèn lồng cửa bên',
    'L6': 'Đèn chiếu sáng mặt tiền và hai tháp',
    'L9': 'Đèn lồng cửa chính và đèn chiếu ở cao độ +8.39 của hai tháp',
    'L10': 'Đèn tượng và nến ở mặt tiền',
    'L7': 'Dây đèn lễ hội trên mái, mái hiên, tháp và đèn chiếu tháp dịp lễ',
    'E1': 'Biển đèn chỉ dẫn lối thoát',
    'P1': 'Ổ cắm phía B (cung thánh và lòng nhà thờ)',
    'P2': 'Ổ cắm phía H (cung thánh và lòng nhà thờ)',
    'P3': 'Nguồn điện sự kiện ở hiên tháp B',
    'P4': 'Nguồn điện sự kiện ở hiên tháp H',
    'distribution': 'Cáp nối giữa các tủ điện',
}

BOARDS = {
    'DB1': 'Tủ điện chính DB-1, phòng phụ trợ sau bàn thờ',
    'DB2': 'Tủ điện DB-2, phòng tầng trệt tháp H',
    'EB1': 'Tủ lễ hội EB-1, phòng tầng trệt tháp H, cạnh DB-2',
    'LC1': 'Tủ điều khiển đèn LC-1, phòng phụ trợ',
    'FC1': 'Tủ điều khiển quạt FC-1, phòng phụ trợ',
    'AV1': 'Tủ âm thanh AV-1 (bàn trộn, âm ly), phòng phụ trợ',
}

# Floor and ground levels for converting h (above nave floor) to a height above the local floor.
LEVELS = [
    ('floor', 'Sàn lòng nhà thờ'),
    ('altar', 'Sàn cung thánh (bậc bàn thờ)'),
    ('sideSanctuary', 'Sàn hai bên cung thánh'),
    ('veranda', 'Sàn hiên'),
    ('forecourt', 'Sân trước sát nhà thờ'),
    ('courtyard', 'Sân dưới'),
]

CIRCUIT_SHEET_NOTES = [
    'Hình trên: nhìn từ trên xuống (mặt bằng). Đường xám nhạt là tường, trụ và cột, cắt ngang ở độ cao 1 m, để biết ống đi theo tường nào.',
    'Hình dưới: nhìn từ bên hông nhà thờ, để thấy độ cao (số mét bên trái).',
    'Hình tròn: thiết bị. Hình vuông: tủ điện hoặc tủ điều khiển. Hình tam giác: chỗ ống đi thẳng đứng trong tường, trụ hoặc cột.',
    'Hai đường cắt nhau trên bản vẽ không có nghĩa là nối với nhau. Đường cáp chung từ tủ điện cũng được vẽ, để biết dây đi về đâu.',
]

TABLE_NOTES = [
    'Mỗi dòng là một thiết bị. Ngoài công trình, đo theo cột "Định vị theo trục" (cách đọc ở tờ HD-02). X, Y, Z là tọa độ trong máy tính, dùng để tra cứu.',
    'Số thập phân viết bằng dấu chấm: 1.20 = 1 mét 20.',
]


def package_for(circuit):
    for package in PACKAGES:
        if circuit in package['circuits']:
            return package
    raise ValueError(f'Circuit {circuit} has no Vietnamese system package; add it to scripts/system_packages_vi.py')
