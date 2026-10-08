import { spawnSync } from "node:child_process";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { publicReleaseSchema } from "../../src/lib/contracts/public-content";
import { publicReleaseHash, resolvePublicContent } from "../../src/lib/server/public-validation";
import { syntheticRelease } from "../fixtures/public-release";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const cliFiles = [
  "scripts/prepare-content.ts",
  "scripts/check-content.ts",
  "src/lib/contracts/common.ts",
  "src/lib/contracts/public-content.ts",
  "src/lib/contracts/public-history.ts",
  "src/lib/server/public-validation.ts",
];
const unpublishedPointer =
  '{"schemaVersion":1,"state":"unpublished","releaseId":null,"sha256":null}\n';

let scratchRoot: string;

beforeAll(async () => {
  scratchRoot = await mkdtemp(path.join(os.tmpdir(), "thach-bi-content-staging-tests-"));
});

afterAll(async () => {
  await rm(scratchRoot, { recursive: true, force: true });
});

async function temporaryApp() {
  const root = await mkdtemp(path.join(scratchRoot, "isolated-app-"));
  const app = path.join(root, "web");
  await mkdir(path.join(app, "content"), { recursive: true });
  for (const filename of cliFiles) {
    const destination = path.join(app, filename);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(path.join(webRoot, filename), destination);
  }
  await writeFile(path.join(app, "package.json"), '{"type":"module"}\n');
  await symlink(path.join(webRoot, "node_modules"), path.join(app, "node_modules"), "dir");
  await writeFile(path.join(app, "content/current.json"), unpublishedPointer);
  await writeFile(path.join(app, "content/release.json"), "null\n");
  return { root, app };
}

// Public-shaped synthetic data exists only in memory or in temporary directories.
function candidateRelease() {
  const candidate = syntheticRelease();
  candidate.fixtureOnly = false;
  return candidate;
}

async function jsonFile(root: string, name: string, value: unknown) {
  const filename = path.join(root, name);
  await writeFile(filename, `${JSON.stringify(value, null, 2)}\n`);
  return filename;
}

function runCli(app: string, name: "prepare-content" | "check-content", args: string[] = []) {
  const result = spawnSync(process.execPath, [path.join(app, `scripts/${name}.ts`), ...args], {
    cwd: app,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    timeout: 15_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error,
  };
}

function expectPrivateFailure(
  result: ReturnType<typeof runCli>,
  root: string,
  secretStrings: string[] = [],
) {
  expect(result.error).toBeUndefined();
  expect(result.status).toBe(1);
  expect(result.stdout).toBe("");
  expect(result.stderr).toContain("failed");
  const output = `${result.stdout}${result.stderr}`;
  for (const secret of [root, ...secretStrings]) expect(output).not.toContain(secret);
}

async function expectInactive(app: string) {
  expect(await readFile(path.join(app, "content/current.json"), "utf8")).toBe(unpublishedPointer);
  expect(await readFile(path.join(app, "content/release.json"), "utf8")).toBe("null\n");
  expect((await readdir(path.join(app, "content"))).sort()).toEqual([
    "current.json",
    "release.json",
  ]);
}

describe("maintainer content staging CLI", () => {
  it("stages a first candidate with a matching pointer without activating web/content", async () => {
    const { root, app } = await temporaryApp();
    const candidate = candidateRelease();
    const input = await jsonFile(root, "candidate.json", candidate);
    const inputBefore = await readFile(input);
    const output = path.join(root, "private-staging");

    const result = runCli(app, "prepare-content", ["--first", input, output]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
    expect(JSON.parse(result.stdout)).toEqual({
      state: "staged-for-review",
      releaseId: candidate.releaseId,
      events: candidate.events.length,
      activated: false,
    });
    expect((await readdir(output)).sort()).toEqual(["current.json", "release.json"]);
    const release = JSON.parse(await readFile(path.join(output, "release.json"), "utf8"));
    const pointer = JSON.parse(await readFile(path.join(output, "current.json"), "utf8"));
    expect(release).toEqual(candidate);
    expect(pointer).toEqual({
      schemaVersion: 1,
      state: "published",
      releaseId: candidate.releaseId,
      sha256: publicReleaseHash(candidate),
    });
    expect(resolvePublicContent(pointer, release)).toEqual({ state: "published", release });
    expect(await readFile(input)).toEqual(inputBefore);
    await expectInactive(app);
  });

  it.each(["candidate", "previous"])("rejects a fixtureOnly %s", async (fixtureInput) => {
    const { root, app } = await temporaryApp();
    const candidate = candidateRelease();
    let previous = "--first";
    if (fixtureInput === "candidate") candidate.fixtureOnly = true;
    else {
      previous = await jsonFile(root, "fixture-previous.json", syntheticRelease());
      candidate.releaseId = "synthetic-release-two";
      candidate.publishedAt = "2026-03-03T01:00:00Z";
    }
    const input = await jsonFile(root, "fixture-candidate.json", candidate);
    const output = path.join(root, "rejected-staging");

    const result = runCli(app, "prepare-content", [previous, input, output]);
    expectPrivateFailure(result, root, [input]);
    await expect(lstat(output)).rejects.toMatchObject({ code: "ENOENT" });
    await expectInactive(app);
  });

  it.each(["reused release ID", "removed event", "unannounced event edit"])(
    "rejects invalid history: %s",
    async (conflict) => {
      const { root, app } = await temporaryApp();
      const previous = candidateRelease();
      const candidate = candidateRelease();
      candidate.releaseId = "synthetic-release-two";
      candidate.publishedAt = "2026-03-03T01:00:00Z";
      if (conflict === "reused release ID") candidate.releaseId = previous.releaseId;
      else if (conflict === "removed event") candidate.events = [];
      else candidate.events[0].body = { vi: "Ví dụ đã thay đổi", en: "Unannounced change" };
      // Both releases are valid individually: rejection must concern their history.
      expect(publicReleaseSchema.safeParse(previous).success).toBe(true);
      expect(publicReleaseSchema.safeParse(candidate).success).toBe(true);
      const prior = await jsonFile(root, "previous.json", previous);
      const input = await jsonFile(root, "candidate.json", candidate);
      const before = await Promise.all([readFile(prior), readFile(input)]);
      const output = path.join(root, "invalid-history");

      const result = runCli(app, "prepare-content", [prior, input, output]);
      expectPrivateFailure(result, root, [prior, input]);
      await expect(lstat(output)).rejects.toMatchObject({ code: "ENOENT" });
      expect(await Promise.all([readFile(prior), readFile(input)])).toEqual(before);
      await expectInactive(app);
    },
  );

  it("preserves all files in an existing output directory", async () => {
    const { root, app } = await temporaryApp();
    const input = await jsonFile(root, "candidate.json", candidateRelease());
    const output = path.join(root, "existing-staging");
    await mkdir(output);
    const files = ["current.json", "release.json", "keep-private.txt"];
    const before = files.map((filename) => Buffer.from(`Preserve ${filename}\n`));
    await Promise.all(
      files.map((filename, i) => writeFile(path.join(output, filename), before[i])),
    );

    const result = runCli(app, "prepare-content", ["--first", input, output]);
    expectPrivateFailure(result, root, ["keep-private.txt"]);
    expect((await readdir(output)).sort()).toEqual([...files].sort());
    expect(
      await Promise.all(files.map((filename) => readFile(path.join(output, filename)))),
    ).toEqual(before);
    await expectInactive(app);
  });

  it("refuses staging inside the temporary web application", async () => {
    const { root, app } = await temporaryApp();
    const input = await jsonFile(root, "candidate.json", candidateRelease());
    const output = path.join(app, "content/private-staging");

    const result = runCli(app, "prepare-content", ["--first", input, output]);
    expectPrivateFailure(result, root, [input, output]);
    await expect(lstat(output)).rejects.toMatchObject({ code: "ENOENT" });
    await expectInactive(app);
  });
});

describe("public content CLI preflight", () => {
  it.each(["invalid schema", "checksum mismatch", "fixtureOnly"])(
    "fails on %s without echoing secret input strings",
    async (invalid) => {
      const { root, app } = await temporaryApp();
      const secret = "synthetic-private-body-canary-never-log";
      const release = candidateRelease();
      release.events[0].body = { vi: secret, en: secret };
      if (invalid === "fixtureOnly") release.fixtureOnly = true;
      const pointer = {
        schemaVersion: 1,
        state: "published",
        releaseId: release.releaseId,
        sha256: publicReleaseHash(release),
      };
      if (invalid === "checksum mismatch") pointer.sha256 = "b".repeat(64);
      const input = invalid === "invalid schema" ? { ...release, privateSource: secret } : release;
      await jsonFile(path.join(app, "content"), "current.json", pointer);
      await jsonFile(path.join(app, "content"), "release.json", input);
      const before = await Promise.all([
        readFile(path.join(app, "content/current.json")),
        readFile(path.join(app, "content/release.json")),
      ]);

      const result = runCli(app, "check-content");
      expectPrivateFailure(result, root, [secret, "privateSource"]);
      expect(result.stderr).toContain("Public content validation failed");
      expect(
        await Promise.all([
          readFile(path.join(app, "content/current.json")),
          readFile(path.join(app, "content/release.json")),
        ]),
      ).toEqual(before);
    },
  );
});
