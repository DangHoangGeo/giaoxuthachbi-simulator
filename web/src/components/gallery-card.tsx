"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { galleryWords, imageChoices, mediaDate, type PublicMedia } from "@/lib/gallery";
import type { Locale } from "@/lib/locales";

export function GalleryCard({
  media,
  locale,
  priority = false,
}: {
  media: PublicMedia;
  locale: Locale;
  priority?: boolean;
}) {
  const thumbnail = useRef<HTMLImageElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const [failed, setFailed] = useState(false);
  const [enlargedFailed, setEnlargedFailed] = useState(false);
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    // A server-rendered image can fail before React attaches the error listener.
    const image = thumbnail.current;
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);
  const copy = galleryWords[locale];
  const choices = imageChoices(media);
  const caption = media.caption[locale];
  const date = mediaDate(media, locale);
  return (
    <figure className="min-w-0">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider">
        {copy.categories[media.category]}
      </p>
      <a
        ref={opener}
        href={choices.largest.path}
        aria-label={`${copy.enlarge} ${caption}`}
        aria-haspopup="dialog"
        className="block bg-stone-100"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          setOpened(true);
          dialog.current?.showModal();
          close.current?.focus();
        }}
      >
        {failed ? (
          <p className="flex aspect-video items-center p-6 text-sm leading-relaxed">
            {copy.unavailable}
          </p>
        ) : (
          <picture>
            {choices.avif && (
              <source
                type="image/avif"
                srcSet={choices.avif}
                sizes="(min-width: 1024px) 608px, 640px"
              />
            )}
            {choices.webp && (
              <source
                type="image/webp"
                srcSet={choices.webp}
                sizes="(min-width: 1024px) 608px, 640px"
              />
            )}
            <img
              ref={thumbnail}
              src={choices.fallback.path}
              srcSet={choices.srcSet}
              sizes="(min-width: 1024px) 608px, 640px"
              alt={media.alt[locale]}
              width={choices.fallback.width}
              height={choices.fallback.height}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={() => setFailed(true)}
              className="aspect-video w-full object-contain"
            />
          </picture>
        )}
        <span aria-hidden="true" className="block px-3 py-2 text-xs underline underline-offset-4">
          {copy.view} ↗
        </span>
      </a>
      <figcaption className="mt-3">
        <h2 className="text-base font-semibold leading-snug">{caption}</h2>
        <details className="mt-2 text-sm text-stone-600">
          <summary className="cursor-pointer min-h-9 py-2">
            {locale === "vi" ? "Ngày, nguồn và ghi chú" : "Date, source and notes"}
          </summary>
          <p className="mt-2 leading-relaxed">{copy.notes[media.category]}</p>
          <p className="mt-4 text-sm text-stone-600">
            {media.capturedOn ? (
              <>
                {copy.date}: <time dateTime={media.capturedOn.value}>{date}</time>
              </>
            ) : (
              date
            )}
          </p>
          <p className="mt-2 text-sm text-stone-600">
            {copy.credit}: {media.attribution}
          </p>
        </details>
      </figcaption>
      <dialog
        ref={dialog}
        aria-labelledby={`image-title-${media.id}`}
        className="gallery-dialog"
        onKeyDown={(event) => {
          // Close is the dialog's sole interactive control; keep Tab/Shift+Tab inside.
          if (event.key === "Tab") {
            event.preventDefault();
            close.current?.focus();
          }
        }}
        onClose={() => {
          setOpened(false);
          opener.current?.focus();
        }}
      >
        <div className="flex items-start justify-between gap-8 border-b border-stone-300 pb-5">
          <p className="text-sm font-semibold">{copy.categories[media.category]}</p>
          <button
            ref={close}
            type="button"
            onClick={() => dialog.current?.close()}
            className="min-h-11 cursor-pointer border border-current px-5"
          >
            {copy.close} <span aria-hidden="true">×</span>
          </button>
        </div>
        {opened &&
          (enlargedFailed ? (
            <p role="status" className="py-16">
              {copy.unavailable}
            </p>
          ) : (
            <Image
              unoptimized
              src={choices.largest.path}
              width={choices.largest.width}
              height={choices.largest.height}
              alt={media.alt[locale]}
              onError={() => setEnlargedFailed(true)}
              className="mx-auto mt-6 max-h-[60dvh] w-auto max-w-full object-contain"
            />
          ))}
        <h2 id={`image-title-${media.id}`} className="mt-6 text-xl font-semibold">
          {caption}
        </h2>
        <p className="mt-3 text-sm leading-relaxed">{copy.notes[media.category]}</p>
        <p className="mt-3 text-sm">
          {copy.date}: {date} · {copy.credit}: {media.attribution}
        </p>
      </dialog>
    </figure>
  );
}
