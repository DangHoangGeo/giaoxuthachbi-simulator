// Maintainer-only staging. Does not activate content or deploy a website.
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { publicReleaseSchema } from "../src/lib/contracts/public-content.ts";
import { validatePublicHistory } from "../src/lib/contracts/public-history.ts";
import { publicReleaseHash } from "../src/lib/server/public-validation.ts";

try {
  if (process.argv.length !== 5) throw new Error("Arguments");
  const [previousPath, candidatePath, outputPath] = process.argv.slice(2);
  const read = async (filename: string) => {
    const bytes = await readFile(filename);
    if (bytes.length > 50_000_000) throw new Error("Oversize input");
    return JSON.parse(bytes.toString("utf8"));
  };
  const previous =
    previousPath === "--first" ? null : publicReleaseSchema.parse(await read(previousPath));
  const next = publicReleaseSchema.parse(await read(candidatePath));
  if (next.fixtureOnly || previous?.fixtureOnly || Date.parse(next.publishedAt) > Date.now())
    throw new Error("Not a public candidate");
  const issues = validatePublicHistory(previous, next);
  if (issues.length) throw new Error("History conflict");
  const web = await realpath(fileURLToPath(new URL("..", import.meta.url)));
  const output = path.join(
    await realpath(path.dirname(path.resolve(outputPath))),
    path.basename(outputPath),
  );
  if (output === web || output.startsWith(`${web}${path.sep}`))
    throw new Error("Staging must be private and outside web");
  await mkdir(output); // Existing output is an error; never overwrite review input or prior releases.
  await writeFile(path.join(output, "release.json"), `${JSON.stringify(next, null, 2)}\n`, {
    flag: "wx",
  });
  await writeFile(
    path.join(output, "current.json"),
    `${JSON.stringify({ schemaVersion: 1, state: "published", releaseId: next.releaseId, sha256: publicReleaseHash(next) }, null, 2)}\n`,
    { flag: "wx" },
  );
  console.log(
    JSON.stringify({
      state: "staged-for-review",
      releaseId: next.releaseId,
      events: next.events.length,
      activated: false,
    }),
  );
} catch {
  console.error(
    "Content staging failed. Use: node scripts/prepare-content.ts <previous-release.json|--first> <candidate.json> <new-private-directory>. Check schemas, history and permissions; no source data was activated.",
  );
  process.exitCode = 1;
}
