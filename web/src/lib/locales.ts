export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export function isLocale(value: string): value is Locale {
  return locales.some((locale) => locale === value);
}
export function localizedPath(locale: Locale, path = "") {
  if (
    path &&
    (!path.startsWith("/") || path.startsWith("//") || path.includes("..") || /[?#\\]/.test(path))
  ) {
    throw new Error("Unsupported local path");
  }
  return `/${locale}${path}`;
}
export const words = {
  vi: {
    name: "Nhà thờ Thạch Bi",
    home: "Trang chủ",
    about: "Về trang này",
    skip: "Đến nội dung chính",
    preview: "Bản xem trước · Chưa công bố",
    development: "Đang phát triển · Không dùng để thi công",
    developmentDetail:
      "Thiết kế và tính toán đang được kiểm tra. Hình ý tưởng không xác nhận hiện trạng đã xây.",
    limitationsTitle: "Những việc đang tiếp tục kiểm tra",
    limitations:
      "Vị trí và chế độ vận hành của đèn, loa, micro và quạt; khả năng che giấu thiết bị; tuyến điện, tủ điện và điều khiển vẫn đang được phối hợp. Một số mục tiêu về ánh sáng, độ rõ lời nói, chống hú và luồng gió chưa đạt. Chưa có xác nhận thiết kế để thi công.",
    centralView:
      "Trục giữa hướng về cung thánh phải thông thoáng; phương án quạt lộ rõ trên trục giữa đã bị loại. Quạt và loa còn nhìn thấy trong hình ý tưởng cũ không phải phương án lắp đặt đã chốt.",
    eyebrow: "Cùng xây dựng nhà thờ",
    title: "Một nơi để cùng hướng về.",
    introduction:
      "Trang giới thiệu nhà thờ đang được chuẩn bị. Nội dung và hình ảnh sẽ được công bố sau khi giáo xứ duyệt.",
    next: "Tìm hiểu về trang này",
    aside: "Thông tin rõ ràng, dễ tìm.",
    asideBody:
      "Bạn sẽ có thể theo dõi thông tin đã công bố và tìm hiểu thiết kế nhà thờ. Hiện chưa có hình ảnh hoặc thông tin tiến độ được duyệt để hiển thị tại đây.",
    aboutTitle: "Về trang này",
    aboutBody:
      "Đây là bản xem trước trên máy tính. Bạn có thể đọc nội dung và chuyển ngôn ngữ. Thông tin về công trình sẽ được ghi rõ nguồn và ngày cập nhật khi được công bố.",
    aboutPublished:
      "Trang này giới thiệu nội dung đã công bố và hình ảnh có ghi nguồn, loại và ngày đã biết. Bạn có thể đọc nội dung và chuyển ngôn ngữ.",
    aboutDetail:
      "Các chức năng tham quan, xem hồ sơ và theo dõi thi công đang được chuẩn bị. Trang này không điều khiển thiết bị trong nhà thờ.",
    footer: "Nội dung đang chờ giáo xứ duyệt.",
    missing: "Không tìm thấy trang",
    missingBody: "Đường dẫn này chưa có nội dung. Bạn có thể quay lại trang chủ.",
    error: "Chưa thể tải trang",
    errorBody: "Vui lòng thử lại. Không có thay đổi nào được lưu.",
    retry: "Thử lại",
    loading: "Đang tải nội dung",
  },
  en: {
    name: "Thạch Bi Church",
    home: "Home",
    about: "About this site",
    skip: "Skip to main content",
    preview: "Preview · Unpublished",
    development: "In development · Not for construction",
    developmentDetail:
      "Designs and calculations are being checked. Concept images do not establish what has been built.",
    limitationsTitle: "Work still being checked",
    limitations:
      "Light, loudspeaker, microphone and fan positions and operating settings, equipment concealment, electrical routes, boards and controls are still being coordinated. Some lighting, speech clarity, feedback and airflow targets remain unmet. No construction design approval is claimed.",
    centralView:
      "The central view toward the sanctuary must remain clear; exposed centreline fan schemes are excluded. Fans and speakers visible in earlier concept images are not an agreed installation layout.",
    eyebrow: "Building our church together",
    title: "A place to return to, together.",
    introduction:
      "The church website is being prepared. Its stories and images will appear after parish review.",
    next: "About this site",
    aside: "Clear information, easy to find.",
    asideBody:
      "You will be able to follow published updates and explore the church design. No images or construction updates have been cleared for display here yet.",
    aboutTitle: "About this site",
    aboutBody:
      "This is a desktop preview. You can read and switch languages. Published construction information will identify its sources and update dates.",
    aboutPublished:
      "This site presents published stories and images with their sources, categories and known dates. You can read and switch languages.",
    aboutDetail:
      "The visit, document review and construction views are being prepared. This site does not operate equipment in the church.",
    footer: "Content awaits parish review.",
    missing: "Page not found",
    missingBody: "This address has no content yet. You can return to the home page.",
    error: "This page could not load",
    errorBody: "Please try again. No changes have been saved.",
    retry: "Try again",
    loading: "Loading content",
  },
} as const;
