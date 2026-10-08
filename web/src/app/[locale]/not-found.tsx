"use client";
import { useParams } from "next/navigation";
import { isLocale, localizedPath, words } from "@/lib/locales";
export default function Missing() {
  const candidate = useParams()?.locale;
  const locale = typeof candidate === "string" && isLocale(candidate) ? candidate : "vi";
  const copy = words[locale];
  return (
    <main className="mx-auto max-w-7xl px-8 py-20">
      <h1 className="font-serif text-4xl">{copy.missing}</h1>
      <p className="my-8">{copy.missingBody}</p>
      <a className="nav-link" href={localizedPath(locale)}>
        {copy.home}
      </a>
    </main>
  );
}
