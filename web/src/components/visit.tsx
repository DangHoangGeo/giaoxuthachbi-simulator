"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/locales";

// The 3D visit is the project's own viewer, served unchanged from /viewer in
// visit-only mode. It loads only after the visitor chooses to enter.
export function Visit({ locale, poster, src }: { locale: Locale; poster: string; src: string }) {
  const vi = locale === "vi";
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return (
    <section aria-label={vi ? "Tham quan mô hình" : "Model visit"}>
      <div className="visit-stage">
        {entered ? (
          <iframe
            className="h-full w-full border-0"
            src={src}
            title={vi ? "Mô hình 3D nhà thờ Thạch Bi" : "Thạch Bi Church 3D model"}
            allow="fullscreen; autoplay"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* biome-ignore lint/performance/noImgElement: Reviewed pre-generated poster. */}
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="relative max-w-md bg-[#f7f5ef]/95 p-8 text-center shadow-lg">
              <p className="mb-5 font-serif text-3xl">
                {vi ? "Bước vào không gian nhà thờ" : "Explore the church in 3D"}
              </p>
              <p className="mb-5 text-sm">
                {vi
                  ? "Mô hình thiết kế tương tác · không phải hình ý tưởng"
                  : "Interactive design model · distinct from the concept artwork"}
              </p>
              <button
                type="button"
                className="primary-link disabled:cursor-wait disabled:opacity-60"
                disabled={!hydrated}
                onClick={() => setEntered(true)}
              >
                {vi ? "Mở mô hình 3D" : "Enter 3D"}
              </button>
            </div>
          </div>
        )}
      </div>
      {entered && (
        <>
          <div className="visit-toolbar">
            <a className="nav-link underline" href={src} target="_blank" rel="noopener">
              {vi ? "Mở toàn màn hình trong thẻ mới" : "Open full size in a new tab"} ↗
            </a>
            <button type="button" onClick={() => setEntered(false)}>
              {vi ? "Đóng 3D" : "Close 3D"}
            </button>
          </div>
          <p className="text-xs text-stone-600">
            {vi
              ? "Kéo để xoay · Cuộn để phóng · Chọn Walk để đi bên trong · Controls để bật tắt đèn và quạt trong mô hình. Giao diện mô hình hiện bằng tiếng Anh."
              : "Drag to orbit · Scroll to zoom · Choose Walk to go inside · Controls switches the modelled lights and fans. Nothing here operates equipment in the church."}
          </p>
        </>
      )}
      <div className="mt-4 flex flex-wrap justify-between gap-4 text-sm">
        <a className="nav-link underline" href={`/${locale}/design`}>
          {vi ? "Xem bộ hình ý tưởng" : "Browse the design images"} →
        </a>
        <a className="nav-link underline" href={`/${locale}/about-this-site`}>
          {vi ? "Phạm vi và các việc chưa xác nhận" : "Scope and unverified work"} →
        </a>
      </div>
    </section>
  );
}
