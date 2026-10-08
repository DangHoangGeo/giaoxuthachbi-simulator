import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, words } from "@/lib/locales";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: { default: words[locale].name, template: `%s | ${words[locale].name}` },
    description: words[locale].introduction,
    robots: { index: false, follow: false },
  };
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
