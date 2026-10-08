import type { ReactNode } from "react";
import { type Locale, localizedPath, words } from "@/lib/locales";

export function SiteShell({
  locale,
  path = "",
  children,
}: {
  locale: Locale;
  path?: string;
  children: ReactNode;
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
          {copy.preview}
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
              aria-current={path === "/about-this-site" ? "page" : undefined}
              href={localizedPath(locale, "/about-this-site")}
            >
              {copy.about}
            </a>
            <a
              className="nav-link border-l border-stone-300 pl-8"
              href={localizedPath(other, path)}
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
        <span>{copy.footer}</span>
      </footer>
    </>
  );
}
