import type { ReactNode } from "react";
import { type GalleryCategory, galleryPath, galleryWords } from "@/lib/gallery";
import { type Locale, localizedPath, words } from "@/lib/locales";
import { progressWords } from "@/lib/progress";

export function SiteShell({
  locale,
  path = "",
  children,
  galleryFilter = "all",
  publishedAt,
  equivalentQuery = "",
}: {
  locale: Locale;
  path?: string;
  children: ReactNode;
  galleryFilter?: GalleryCategory;
  publishedAt?: string;
  equivalentQuery?: string;
}) {
  const copy = words[locale];
  const other = locale === "vi" ? "en" : "vi";
  return (
    <>
      <a href="#main" className="skip-link">
        {copy.skip}
      </a>
      <header>
        <div className="border-b border-stone-300 bg-stone-100 px-8 py-2 text-center text-xs tracking-wide">
          {publishedAt ? galleryWords[locale].published : copy.preview}
        </div>
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 border-b border-stone-300 px-8 py-7">
          <a className="text-xl font-semibold tracking-tight" href={localizedPath(locale)}>
            {copy.name}
          </a>
          <nav
            aria-label={locale === "vi" ? "Điều hướng chính" : "Main navigation"}
            className="flex flex-wrap items-center gap-8 text-sm"
          >
            <a
              className="nav-link"
              aria-current={path === "" ? "page" : undefined}
              href={localizedPath(locale)}
            >
              {copy.home}
            </a>
            <a
              className="nav-link"
              aria-current={path === "/design" ? "page" : undefined}
              href={galleryPath(locale)}
            >
              {galleryWords[locale].title}
            </a>
            <a
              className="nav-link"
              aria-current={path.startsWith("/progress") ? "page" : undefined}
              href={localizedPath(locale, "/progress")}
            >
              {progressWords[locale].title}
            </a>
            <a
              className="nav-link"
              aria-current={path === "/about-this-site" ? "page" : undefined}
              href={localizedPath(locale, "/about-this-site")}
            >
              {copy.about}
            </a>
            <a
              className="nav-link border-l border-stone-300 pl-8"
              href={
                path === "/design"
                  ? galleryPath(other, galleryFilter)
                  : `${localizedPath(other, path)}${equivalentQuery}`
              }
              hrefLang={other}
              lang={other}
            >
              {other === "vi" ? "Tiếng Việt" : "English"}
            </a>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="mx-auto min-h-[60dvh] max-w-7xl px-8 py-16">
        {children}
      </main>
      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 border-t border-stone-300 px-8 py-8 text-sm text-stone-600">
        <span>{copy.name}</span>
        <span>
          {publishedAt ? (
            <>
              {galleryWords[locale].published}:{" "}
              <time dateTime={publishedAt}>
                {new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
                  dateStyle: "long",
                  timeZone: "Asia/Ho_Chi_Minh",
                }).format(new Date(publishedAt))}
              </time>
            </>
          ) : (
            copy.footer
          )}
        </span>
      </footer>
    </>
  );
}
