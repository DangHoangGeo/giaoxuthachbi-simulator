import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error Build script without type declarations.
import { viewerEntry, viewerFiles, viewerSource } from "../../scripts/viewer-files.mjs";

type ViewerFile = { path: string; bytes: number; sha256: string; body: Buffer };

describe("published viewer copy", () => {
  it("publishes the viewer unchanged except for the visit-only entry page", async () => {
    const files: ViewerFile[] = await viewerFiles();
    const names = files.map((file) => file.path);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain(viewerEntry);
    for (const required of ["bundle.js", "simulator/engine.js", "simulator/ui.js", "viewer.css"])
      expect(names).toContain(`/viewer/${required}`);
    for (const file of files) {
      expect(file.path.startsWith("/viewer/")).toBe(true);
      expect(file.path).not.toMatch(/\.\.|\.md$|\.json$|\.DS_Store/);
      const source = await readFile(path.join(viewerSource, file.path.slice("/viewer/".length)));
      if (file.path === viewerEntry) {
        expect(file.body.toString("utf8")).toBe(
          source
            .toString("utf8")
            .replace('<html lang="en">', '<html lang="en" class="visit-only">'),
        );
        expect(file.body.toString("utf8")).toContain('class="visit-only"');
      } else expect(file.body.equals(source)).toBe(true);
    }
  });
});
