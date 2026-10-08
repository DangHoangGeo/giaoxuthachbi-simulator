import { describe, expect, it } from "vitest";
import { isLocale, localizedPath } from "../../src/lib/locales";

describe("locale routes", () => {
  it("preserves an equivalent deep link", () => {
    expect(localizedPath("en", "/about-this-site")).toBe("/en/about-this-site");
    expect(localizedPath("vi")).toBe("/vi");
    expect(isLocale("fr")).toBe(false);
  });
  it.each(["//evil.example", "/../private", "/x?token=secret", "/x#fragment", "/a\\b"])(
    "rejects unsafe path %s",
    (path) => {
      expect(() => localizedPath("en", path)).toThrow("Unsupported local path");
    },
  );
});
