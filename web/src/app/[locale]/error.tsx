"use client";
import { useParams } from "next/navigation";
import { isLocale, words } from "@/lib/locales";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const candidate = useParams()?.locale;
  const locale = typeof candidate === "string" && isLocale(candidate) ? candidate : "vi";
  const copy = words[locale];
  return (
    <main className="mx-auto max-w-7xl px-8 py-20">
      <h1 className="font-serif text-4xl">{copy.error}</h1>
      <p role="alert" className="my-8">
        {copy.errorBody}
      </p>
      <button
        type="button"
        className="min-h-12 cursor-pointer border border-current px-6"
        onClick={reset}
      >
        {copy.retry}
      </button>
    </main>
  );
}
