"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/locales";
import { instantLabel, progressWords } from "@/lib/progress";
import {
  POLL_MS,
  type PublicVersion,
  parsePublicVersion,
  retryDelay,
  versionKey,
} from "@/lib/public-version-shape";

export function Freshness({ locale, initial }: { locale: Locale; initial: PublicVersion }) {
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "offline" | "failed" | "changed">("idle");
  const key = versionKey(initial),
    copy = progressWords[locale];
  useEffect(() => {
    let disposed = false,
      timer: ReturnType<typeof setTimeout> | undefined,
      controller: AbortController | undefined,
      failures = 0,
      etag: string | null = null;
    let known: PublicVersion = initial;
    const active = () => !document.hidden && navigator.onLine;
    const clear = () => {
      clearTimeout(timer);
      controller?.abort();
      controller = undefined;
    };
    const check = async () => {
      if (disposed || !active()) return;
      const request = new AbortController();
      controller = request;
      const timeout = setTimeout(() => request.abort(), 10_000);
      try {
        const response = await fetch("/api/public/version", {
          cache: "no-store",
          headers: etag ? { "If-None-Match": etag } : {},
          signal: request.signal,
        });
        if (response.status !== 304) {
          if (!response.ok) throw new Error("Version unavailable");
          const text = await response.text();
          if (text.length > 4096) throw new Error("Oversized version");
          const next = parsePublicVersion(JSON.parse(text));
          if (!next) throw new Error("Invalid version");
          known = next;
          etag = response.headers.get("ETag");
        } else if (!etag) throw new Error("Unexpected not-modified");
        if (disposed || controller !== request || !active()) return;
        failures = 0;
        setLastCheck(new Date().toISOString());
        setStatus(versionKey(known) === key ? "idle" : "changed");
      } catch {
        if (disposed || controller !== request || !active()) return;
        failures++;
        setStatus("failed");
      } finally {
        clearTimeout(timeout);
        if (!disposed && controller === request && active()) {
          controller = undefined;
          timer = setTimeout(check, failures ? retryDelay(failures) : POLL_MS);
        }
      }
    };
    const resume = () => {
      clear();
      if (!navigator.onLine) setStatus("offline");
      if (active()) void check();
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("online", resume);
    window.addEventListener("offline", resume);
    resume();
    return () => {
      disposed = true;
      clear();
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("online", resume);
      window.removeEventListener("offline", resume);
    };
    // initial's immutable key identifies the server-rendered release. No content is swapped by a poll.
  }, [key, initial]);
  return (
    <aside
      aria-label={copy.check}
      className="mt-7 border-l-2 border-stone-300 pl-5 text-sm leading-relaxed text-stone-600"
    >
      <p>
        {lastCheck ? (
          <>
            {copy.check}: <time dateTime={lastCheck}>{instantLabel(lastCheck, locale)}</time>
          </>
        ) : (
          copy.notChecked
        )}
      </p>
      <p role="status" className="mt-2 min-h-6">
        {status === "changed"
          ? copy.newer
          : status === "offline"
            ? copy.offline
            : status === "failed"
              ? copy.failed
              : ""}
      </p>
      <div className="min-h-11">
        {status === "changed" && (
          <button
            type="button"
            className="nav-link cursor-pointer underline"
            onClick={() => window.location.reload()}
          >
            {copy.refresh}
          </button>
        )}
      </div>
      <p className="mt-2">{copy.paused}</p>
      <noscript>
        <p>{copy.manual}</p>
      </noscript>
    </aside>
  );
}
