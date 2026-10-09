"use client";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/locales";
import {
  ATMOSPHERE_PREFERENCE_KEY,
  type AtmosphereMode,
  resolveAtmosphere,
} from "@/lib/viewer/atmosphere";
import type { createVisit, Viewpoint, VisitAsset } from "@/lib/viewer/scene";

type Scene = Awaited<ReturnType<typeof createVisit>>;
export function Visit({
  locale,
  asset,
  poster,
}: {
  locale: Locale;
  asset: VisitAsset;
  poster: string;
}) {
  const vi = locale === "vi";
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<Scene | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [entered, setEntered] = useState(false),
    [status, setStatus] = useState<"poster" | "loading" | "ready" | "failed">("poster"),
    [percent, setPercent] = useState(0);
  const [mode, setMode] = useState<AtmosphereMode>("auto"),
    [period, setPeriod] = useState<"day" | "night">("day"),
    [clock, setClock] = useState("");
  const [view, setView] = useState<Viewpoint>("exterior"),
    [roof, setRoof] = useState(true),
    [low, setLow] = useState(false);
  useEffect(() => {
    setHydrated(true);
    try {
      const saved = localStorage.getItem(ATMOSPHERE_PREFERENCE_KEY);
      if (saved === "day" || saved === "night" || saved === "auto") setMode(saved);
    } catch {}
  }, []);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      clearTimeout(timer);
      let zone: string | null = null;
      try {
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {}
      const now = new Date();
      const current = resolveAtmosphere(mode, now, zone);
      setPeriod(current.period);
      setClock(
        current.fallback
          ? vi
            ? "Không xác định giờ · dùng ban ngày"
            : "Time unavailable · daytime fallback"
          : `${current.timeZone ?? ""} · ${now.toLocaleTimeString(vi ? "vi-VN" : "en-GB", { hour: "2-digit", minute: "2-digit" })}`,
      );
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 30);
    };
    tick();
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [mode, vi]);
  useEffect(() => {
    if (!entered || !host.current) return;
    let cancelled = false;
    const controller = new AbortController();
    const target = host.current;
    setStatus("loading");
    setPercent(0);
    import("@/lib/viewer/scene")
      .then(({ createVisit }) => {
        if (cancelled) return null;
        return createVisit(
          target,
          asset,
          controller.signal,
          (p) => {
            if (!cancelled) setPercent(p);
          },
          () => {
            setStatus("failed");
            setEntered(false);
          },
        );
      })
      .then((api) => {
        if (!api) return;
        if (cancelled) {
          api.dispose();
          return;
        }
        scene.current = api;
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("failed");
          setEntered(false);
        }
      });
    return () => {
      cancelled = true;
      controller.abort();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [entered, asset]);
  useEffect(() => {
    if (status === "ready") {
      scene.current?.atmosphere(period === "night");
      scene.current?.roof(roof);
      scene.current?.quality(low);
    }
  }, [period, roof, low, status]);
  useEffect(() => {
    if (status === "ready") scene.current?.viewpoint(view);
  }, [view, status]);
  const selectMode = (value: AtmosphereMode) => {
    setMode(value);
    try {
      localStorage.setItem(ATMOSPHERE_PREFERENCE_KEY, value);
    } catch {}
  };
  const move = (direction: number) => {
    if (view !== "nave") setView("nave");
    else scene.current?.move(direction);
  };
  const leave = () => {
    setEntered(false);
    setStatus("poster");
  };
  return (
    <section aria-label={vi ? "Tham quan mô hình" : "Model visit"}>
      <div className="visit-stage">
        <div
          ref={host}
          className="h-full w-full"
          tabIndex={status === "ready" ? 0 : -1}
          role="application"
          aria-label={
            vi
              ? "Mô hình 3D. Kéo để xoay, cuộn để phóng. Mũi tên lên xuống di chuyển dọc lối giữa."
              : "3D model. Drag to orbit, scroll to zoom. Up and down arrows move along the central aisle."
          }
          onKeyDown={(event) => {
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              move(event.key === "ArrowUp" ? 1 : -1);
            }
            if (event.key === "Escape") event.currentTarget.blur();
          }}
        />
        {status !== "ready" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* biome-ignore lint/performance/noImgElement: Reviewed pre-generated poster. */}
            <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="relative max-w-md bg-[#f7f5ef]/95 p-8 text-center shadow-lg">
              <p className="mb-5 font-serif text-3xl">
                {vi ? "Bước vào không gian nhà thờ" : "Explore the church in 3D"}
              </p>
              {status === "loading" ? (
                <>
                  <p role="status">
                    {vi ? "Đang tải mô hình" : "Loading the model"} · {percent}%
                  </p>
                  <button className="nav-link mt-4 underline" type="button" onClick={leave}>
                    {vi ? "Hủy" : "Cancel"}
                  </button>
                </>
              ) : (
                <>
                  <p className="mb-5 text-sm">
                    {status === "failed"
                      ? vi
                        ? "Chưa mở được 3D. Bạn có thể thử lại hoặc xem bộ hình."
                        : "3D could not open. Try again or browse the images."
                      : vi
                        ? "Mô hình thiết kế tương tác · không phải hình ý tưởng"
                        : "Interactive design model · distinct from the concept artwork"}
                  </p>
                  <button
                    type="button"
                    className="primary-link disabled:cursor-wait disabled:opacity-60"
                    disabled={!hydrated}
                    onClick={() => setEntered(true)}
                  >
                    {status === "failed"
                      ? vi
                        ? "Thử lại"
                        : "Retry"
                      : vi
                        ? "Mở mô hình 3D"
                        : "Enter 3D"}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {status === "ready" && (
        <>
          <fieldset
            className="visit-toolbar"
            aria-label={vi ? "Điều khiển góc nhìn" : "View controls"}
          >
            {(["exterior", "nave", "sanctuary", "overhead"] as const).map((key, i) => (
              <button
                key={key}
                type="button"
                aria-pressed={view === key}
                onClick={() => {
                  setView(key);
                  scene.current?.viewpoint(key);
                }}
              >
                {
                  (vi
                    ? ["Toàn cảnh", "Gian chính", "Cung thánh", "Từ trên cao"]
                    : ["Exterior", "Nave", "Sanctuary", "Overhead"])[i]
                }
              </button>
            ))}
            <button type="button" aria-pressed={!roof} onClick={() => setRoof(!roof)}>
              {vi ? "Ẩn mái" : "Hide roof"}
            </button>
            <button type="button" onClick={() => move(-2)}>
              {vi ? "Lùi dọc lối giữa" : "Back along aisle"}
            </button>
            <button type="button" onClick={() => move(2)}>
              {vi ? "Tiến dọc lối giữa" : "Forward along aisle"}
            </button>
            <label className="text-sm">
              {vi ? "Không khí" : "Atmosphere"}{" "}
              <select value={mode} onChange={(e) => selectMode(e.target.value as AtmosphereMode)}>
                <option value="auto">Auto</option>
                <option value="day">{vi ? "Ban ngày" : "Day"}</option>
                <option value="night">{vi ? "Buổi tối" : "Night"}</option>
              </select>
            </label>
            <button type="button" aria-pressed={low} onClick={() => setLow(!low)}>
              {vi ? "Đồ họa nhẹ" : "Low graphics"}
            </button>
            <button type="button" onClick={leave}>
              {vi ? "Đóng 3D" : "Close 3D"}
            </button>
          </fieldset>
          <p className="text-xs text-stone-600">
            {clock} ·{" "}
            {vi
              ? "Kéo để xoay · Cuộn để phóng · Chọn Gian chính để đi dọc lối giữa"
              : "Drag to orbit · Scroll to zoom · Choose Nave to move along the central aisle"}
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
