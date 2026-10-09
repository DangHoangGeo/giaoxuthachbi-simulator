import type { OccurrenceDate } from "./contracts/common";
import type { PublicRelease } from "./contracts/public-content";
import { type Locale, localizedPath } from "./locales";

export type PublicEvent = PublicRelease["events"][number];
export const PAGE_SIZE = 20;
export function eventPath(locale: Locale, id: string) {
  return localizedPath(locale, `/progress/${encodeURIComponent(id)}`);
}
export function dateLabel(date: OccurrenceDate, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    year: "numeric",
    month: "long",
    ...(date.precision === "day" ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date.value}${date.precision === "month" ? "-01" : ""}T00:00:00Z`));
}
export function instantLabel(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(value));
}
export function eventBasis(event: PublicEvent) {
  return (event.occurredUntil ?? event.occurredOn)?.value ?? event.reportedAsOf ?? "";
}
export function timelineQuery(input: Record<string, string | string[] | undefined>) {
  return {
    sort: input.sort === "oldest" ? ("oldest" as const) : ("newest" as const),
    year: typeof input.year === "string" && /^[1-9]\d{3}$/.test(input.year) ? input.year : "",
    page:
      typeof input.page === "string" && /^[1-9]\d{0,3}$/.test(input.page) ? Number(input.page) : 1,
  };
}
export type TimelineQuery = ReturnType<typeof timelineQuery>;
export function progressQuery(query: TimelineQuery) {
  const params = new URLSearchParams();
  if (query.sort === "oldest") params.set("sort", query.sort);
  if (query.year) params.set("year", query.year);
  if (query.page > 1) params.set("page", String(query.page));
  return params.size ? `?${params}` : "";
}
export function timeline(events: PublicEvent[], query: TimelineQuery) {
  const years = [...new Set(events.map((event) => eventBasis(event).slice(0, 4)).filter(Boolean))]
    .sort()
    .reverse();
  const filtered = events.filter(
    (event) => !query.year || eventBasis(event).startsWith(query.year),
  );
  filtered.sort((a, b) => {
    const ad = eventBasis(a),
      bd = eventBasis(b);
    const order = ad < bd ? -1 : ad > bd ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    return query.sort === "oldest" ? order : -order;
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const groups: { month: string; events: PublicEvent[] }[] = [];
  for (const event of visible) {
    const month = eventBasis(event).slice(0, 7);
    const group = groups.at(-1);
    if (group?.month === month) group.events.push(event);
    else groups.push({ month, events: [event] });
  }
  return { years, groups, page, pageCount, total: filtered.length };
}
export const progressWords = {
  en: {
    title: "Construction updates",
    intro:
      "Dated accounts of the work, with the source and certainty of each update. A gap means no update was published; it does not mean construction stopped.",
    empty: "No reviewed updates have been published for this selection.",
    newest: "Newest first",
    oldest: "Oldest first",
    allYears: "All years",
    filters: "Timeline filters",
    order: "Order",
    year: "Year",
    apply: "Show updates",
    page: "Page",
    previous: "Previous",
    next: "Next",
    read: "Read update",
    back: "All updates",
    occurred: "When it happened",
    unknown: "Exact occurrence date unknown",
    reported: "Reported as of",
    published: "First published",
    updated: "Last corrected",
    zone: "Dates and times use Vietnam time (UTC+7).",
    noPhoto: "No cleared photograph accompanies this update.",
    withdrawn: "Withdrawn update",
    correction: "Correction history",
    latest: "Latest published update",
    planned: "Planned — not completed",
    "owner-reported": "Reported by the owner — not independently verified",
    verified: "Verified against reviewed evidence",
    dateNote:
      "Grouped by occurrence month, or report month when the occurrence is unknown. Order within a month does not establish the exact sequence of undated work.",
    newer: "A different published version is available.",
    refresh: "Load the latest version",
    check: "Last successful check",
    notChecked: "The page shows the version available when it loaded.",
    offline: "Offline. Showing the version already loaded.",
    failed:
      "The latest version could not be checked. Showing the version already loaded; retry is automatic.",
    paused: "Checks pause when this tab is hidden or offline.",
    manual: "Without JavaScript, reload this page to check for updates.",
    unavailable: "The current release is unavailable. The version already loaded remains visible.",
  },
  vi: {
    title: "Tiến trình xây dựng",
    intro:
      "Các ghi nhận có ngày tháng, nguồn tin và mức độ xác minh rõ ràng. Khoảng trống chỉ có nghĩa là chưa có bài được công bố; không có nghĩa là công trường đã dừng.",
    empty: "Chưa có bài cập nhật đã duyệt trong mục này.",
    newest: "Mới trước",
    oldest: "Cũ trước",
    allYears: "Tất cả các năm",
    filters: "Lọc tiến trình",
    order: "Thứ tự",
    year: "Năm",
    apply: "Xem cập nhật",
    page: "Trang",
    previous: "Trước",
    next: "Sau",
    read: "Đọc bài",
    back: "Tất cả cập nhật",
    occurred: "Thời điểm diễn ra",
    unknown: "Chưa rõ ngày diễn ra chính xác",
    reported: "Ghi nhận đến ngày",
    published: "Công bố lần đầu",
    updated: "Sửa đổi gần nhất",
    zone: "Ngày giờ theo giờ Việt Nam (UTC+7).",
    noPhoto: "Bài này chưa có ảnh đã được duyệt để công bố.",
    withdrawn: "Bài đã rút lại",
    correction: "Lịch sử sửa đổi",
    latest: "Cập nhật được công bố gần nhất",
    planned: "Dự kiến — chưa hoàn thành",
    "owner-reported": "Chủ đầu tư ghi nhận — chưa xác minh độc lập",
    verified: "Đã đối chiếu với bằng chứng được duyệt",
    dateNote:
      "Nhóm theo tháng diễn ra, hoặc tháng ghi nhận khi chưa rõ thời điểm. Thứ tự trong tháng không xác nhận trình tự chính xác của công việc chưa rõ ngày.",
    newer: "Có phiên bản công bố khác.",
    refresh: "Tải phiên bản mới nhất",
    check: "Kiểm tra thành công gần nhất",
    notChecked: "Trang đang hiển thị phiên bản tại thời điểm tải.",
    offline: "Đang ngoại tuyến. Giữ nguyên phiên bản đã tải.",
    failed: "Chưa kiểm tra được phiên bản mới nhất. Giữ nguyên nội dung đã tải và sẽ tự thử lại.",
    paused: "Tạm dừng kiểm tra khi ẩn thẻ hoặc mất mạng.",
    manual: "Nếu tắt JavaScript, tải lại trang để kiểm tra cập nhật.",
    unavailable: "Phiên bản hiện tại chưa truy cập được. Giữ nguyên phiên bản đã tải.",
  },
} as const;
