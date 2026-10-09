"use client";
import { useEffect, useState } from "react";
import { Visit } from "@/components/visit";
import type { Locale } from "@/lib/locales";
import type { VisitAsset } from "@/lib/viewer/scene";
export function PrivateReview({
  locale,
  asset,
  poster,
}: {
  locale: Locale;
  asset: VisitAsset;
  poster: string;
}) {
  const [available, setAvailable] = useState(true);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const check = async () => {
      if (document.hidden) return;
      try {
        const response = await fetch(`/${locale}/review/access`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) setAvailable(false);
      } catch {
        if (!controller.signal.aborted) setAvailable(false);
      }
    };
    const hide = () => setGeneration((value) => value + 1);
    const resume = () => {
      if (document.hidden) hide();
      else void check();
    };
    const timer = setInterval(check, 60000);
    window.addEventListener("pagehide", hide);
    window.addEventListener("pageshow", check);
    document.addEventListener("visibilitychange", resume);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", check);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [locale]);
  return available ? (
    <Visit key={generation} locale={locale} asset={asset} poster={poster} />
  ) : (
    <p role="alert" className="my-8 border p-8">
      {locale === "vi"
        ? "Phiên xem đã đóng vì chưa xác nhận được quyền truy cập. Tải lại trang để đăng nhập lại."
        : "Review closed because access could not be confirmed. Reload the page to sign in again."}
    </p>
  );
}
