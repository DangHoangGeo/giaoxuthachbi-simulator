import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error Build script without type declarations.
import { guideEntry, guideFiles, guideSource } from "../../scripts/guide-files.mjs";

type GuideFile = { path: string; bytes: number; sha256: string; body: Buffer };

describe("published quick-start guide copy", () => {
  it("publishes the guide unchanged and only its page, images, narration and short clips", async () => {
    const files: GuideFile[] = await guideFiles();
    const names = files.map((file) => file.path);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain(guideEntry);
    for (const required of ["scenes.js", "timings.js", "assets/cover.jpg", "audio/intro.m4a"])
      expect(names).toContain(`/guide/${required}`);
    for (const file of files) {
      expect(file.path.startsWith("/guide/")).toBe(true);
      expect(file.path).not.toMatch(/\.\.|\.md$|\.json$|\.DS_Store/);
      // The full narrated video is a large local file; only the three short clips ship.
      if (file.path.endsWith(".mp4")) expect(file.path.startsWith("/guide/clips/")).toBe(true);
      const source = await readFile(path.join(guideSource, file.path.slice("/guide/".length)));
      expect(file.body.equals(source)).toBe(true);
    }
  });

  it("has narration and timings for every scene", async () => {
    const files: GuideFile[] = await guideFiles();
    const text = (name: string) => files.find((f) => f.path === name)?.body.toString("utf8") ?? "";
    const ids = [...text("/guide/scenes.js").matchAll(/\bid: '([\w-]+)'/g)].map((m) => m[1]);
    expect(ids.length).toBeGreaterThan(10);
    const timings = text("/guide/timings.js");
    for (const id of ids) {
      expect(files.map((f) => f.path)).toContain(`/guide/audio/${id}.m4a`);
      expect(timings).toContain(`"${id}": {`);
    }
  });
});
