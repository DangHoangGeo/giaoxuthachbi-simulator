import type { PublicRelease } from "./contracts/public-content";
import { type Locale, localizedPath } from "./locales";

export type PublicMedia = PublicRelease["media"][number];
export const galleryCategories = [
  "all",
  "site-photo",
  "design-render",
  "concept-art",
  "reference",
] as const;
export type GalleryCategory = (typeof galleryCategories)[number];
export function galleryCategory(value: unknown): GalleryCategory {
  return galleryCategories.find((category) => category === value) ?? "all";
}
export function galleryPath(locale: Locale, category: GalleryCategory = "all") {
  return `${localizedPath(locale, "/design")}${category === "all" ? "" : `?category=${category}`}`;
}
export function mediaDate(media: Pick<PublicMedia, "capturedOn">, locale: Locale) {
  if (media.capturedOn === null) return galleryWords[locale].unknownDate;
  const { precision, value } = media.capturedOn;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    year: "numeric",
    month: "long",
    ...(precision === "day" ? { day: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}${precision === "month" ? "-01" : ""}T00:00:00Z`));
}
export function imageChoices(media: PublicMedia) {
  const sorted = [...media.derivatives].sort((a, b) => a.width - b.width);
  const fallback = sorted.filter((item) => /\.(jpg|png)$/.test(item.path));
  const base = fallback.length ? fallback : sorted;
  const webp = sorted.filter((item) => item.path.endsWith(".webp"));
  const avif = sorted.filter((item) => item.path.endsWith(".avif"));
  const srcSet = (items: typeof sorted) =>
    [...new Map(items.map((item) => [item.width, item])).values()]
      .map((item) => `${item.path} ${item.width}w`)
      .join(", ");
  return {
    fallback: base[0],
    largest: base[base.length - 1],
    srcSet: srcSet(base),
    webp: srcSet(webp),
    avif: srcSet(avif),
  };
}
export const galleryWords = {
  vi: {
    title: "Hình ảnh và thiết kế",
    introduction:
      "Phân biệt ảnh công trường, mô hình thiết kế, ý tưởng và tư liệu tham khảo. Mỗi hình ảnh đều ghi rõ loại, nguồn và ngày đã biết.",
    filter: "Lọc hình ảnh",
    empty: "Chưa có hình ảnh đã duyệt trong mục này.",
    pending: "Hình ảnh sẽ xuất hiện sau khi được giáo xứ duyệt để công bố.",
    count: "hình ảnh",
    enlarge: "Xem lớn:",
    close: "Đóng hình ảnh",
    unavailable: "Chưa thể tải hình ảnh. Chú thích và nguồn vẫn hiển thị bên dưới.",
    unknownDate: "Chưa rõ ngày chụp / tạo",
    date: "Ngày chụp / tạo",
    credit: "Tác giả / nguồn",
    view: "Xem lớn",
    published: "Công bố",
    categories: {
      all: "Tất cả",
      "site-photo": "Ảnh công trường",
      "design-render": "Mô hình thiết kế",
      "concept-art": "Ý tưởng",
      reference: "Tư liệu tham khảo",
    },
    notes: {
      "site-photo": "Ảnh ghi nhận tại công trường.",
      "design-render": "Hình từ mô hình; không xác nhận hiện trạng thi công.",
      "concept-art": "Hình ý tưởng; không phải ảnh công trình đã xây.",
      reference: "Tư liệu tham khảo; không phải hiện trạng nhà thờ.",
    },
  },
  en: {
    title: "Images and design",
    introduction:
      "Explore site photographs, design models, concepts and references. Each image identifies its category, source and known date.",
    filter: "Filter images",
    empty: "No cleared images in this category yet.",
    pending: "Images will appear after parish publication review.",
    count: "images",
    enlarge: "Enlarge:",
    close: "Close image",
    unavailable: "The image could not load. Its caption and source remain below.",
    unknownDate: "Capture / creation date unknown",
    date: "Captured / created",
    credit: "Creator / source",
    view: "Enlarge",
    published: "Published",
    categories: {
      all: "All",
      "site-photo": "Site photographs",
      "design-render": "Design models",
      "concept-art": "Concepts",
      reference: "References",
    },
    notes: {
      "site-photo": "Photograph recorded on site.",
      "design-render": "Model image; does not establish what has been built.",
      "concept-art": "Concept image; not a photograph of completed work.",
      reference: "Reference material; does not show the current church.",
    },
  },
} as const;
