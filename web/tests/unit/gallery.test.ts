import { describe, expect, it } from "vitest";
import {
  galleryCategory,
  galleryPath,
  imageChoices,
  mediaDate,
  type PublicMedia,
} from "../../src/lib/gallery";
import { syntheticRelease } from "../fixtures/public-release";

function mediaWithDerivatives(derivatives: PublicMedia["derivatives"]): PublicMedia {
  return { ...syntheticRelease().media[0], derivatives };
}

function derivative(name: string, width: number, extension: string) {
  return {
    path: `/media/${name}.${extension}`,
    sha256: "a".repeat(64),
    width,
    height: Math.round((width * 3) / 4),
    bytes: 128,
  };
}

describe("gallery URL state", () => {
  const invalidCategories: Array<{ caseName: string; value: unknown }> = [
    { caseName: "undefined", value: undefined },
    { caseName: "null", value: null },
    { caseName: "array", value: ["reference"] },
    { caseName: "empty array", value: [] },
    { caseName: "unknown string", value: "unknown-category" },
    { caseName: "wrong case", value: "SITE-PHOTO" },
    { caseName: "custom string coercion", value: { toString: () => "reference" } },
    { caseName: "primitive coercion", value: { [Symbol.toPrimitive]: () => "reference" } },
  ];

  it.each(["all", "site-photo", "design-render", "concept-art", "reference"] as const)(
    "accepts the known category %s",
    (category) => {
      expect(galleryCategory(category)).toBe(category);
    },
  );

  it.each(invalidCategories)("defaults $caseName category input to all", ({ value }) => {
    expect(() => galleryCategory(value)).not.toThrow();
    expect(galleryCategory(value)).toBe("all");
  });

  it("builds local language links and preserves known filters", () => {
    expect(galleryPath("en")).toBe("/en/design");
    expect(galleryPath("vi", "all")).toBe("/vi/design");
    expect(galleryPath("en", "site-photo")).toBe("/en/design?category=site-photo");
    expect(galleryPath("vi", "reference")).toBe("/vi/design?category=reference");
  });
});

describe("gallery dates", () => {
  it("displays month, day and unknown precision consistently across host time zones", () => {
    const month = { capturedOn: { precision: "month" as const, value: "2026-02" } };
    const day = { capturedOn: { precision: "day" as const, value: "2026-03-04" } };
    const unknown = { capturedOn: null };
    const originalTimezone = process.env.TZ;
    try {
      for (const timezone of ["UTC", "Pacific/Honolulu", "Asia/Ho_Chi_Minh"]) {
        process.env.TZ = timezone;
        expect(mediaDate(month, "en")).toBe("February 2026");
        expect(mediaDate(day, "en")).toBe("4 March 2026");
        expect(mediaDate(unknown, "en")).toBe("Capture / creation date unknown");
      }
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = originalTimezone;
    }
  });
});

describe("responsive image choices", () => {
  it("chooses sorted fallback sources and unique width descriptors without mutating media", () => {
    const derivatives = [
      derivative("avif-1280", 1280, "avif"),
      derivative("jpg-640", 640, "jpg"),
      derivative("webp-640-first", 640, "webp"),
      derivative("webp-640-duplicate", 640, "webp"),
      derivative("png-2048", 2048, "png"),
      derivative("avif-640", 640, "avif"),
      derivative("webp-1920", 1920, "webp"),
    ] as PublicMedia["derivatives"];
    const media = mediaWithDerivatives(derivatives);
    const originalOrder = media.derivatives.map((item) => item.path);

    const choices = imageChoices(media);

    expect(choices.fallback.path).toBe("/media/jpg-640.jpg");
    expect(choices.largest.path).toBe("/media/png-2048.png");
    expect(choices.srcSet).toBe("/media/jpg-640.jpg 640w, /media/png-2048.png 2048w");
    const webpEntries = choices.webp.split(", ");
    expect(webpEntries).toHaveLength(2);
    expect(webpEntries[0]).toMatch(/^\/media\/webp-640-(first|duplicate)\.webp 640w$/);
    expect(webpEntries[1]).toBe("/media/webp-1920.webp 1920w");
    expect(choices.avif).toBe("/media/avif-640.avif 640w, /media/avif-1280.avif 1280w");
    expect(media.derivatives.map((item) => item.path)).toEqual(originalOrder);
  });

  it("falls back to the sorted available format when JPEG and PNG are absent", () => {
    const media = mediaWithDerivatives([
      derivative("webp-1280", 1280, "webp"),
      derivative("avif-640", 640, "avif"),
    ]);

    const choices = imageChoices(media);

    expect(choices.fallback.path).toBe("/media/avif-640.avif");
    expect(choices.largest.path).toBe("/media/webp-1280.webp");
    expect(choices.srcSet).toBe("/media/avif-640.avif 640w, /media/webp-1280.webp 1280w");
  });
});
