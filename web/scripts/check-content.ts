import { readFile } from "node:fs/promises";
import { resolvePublicContent } from "../src/lib/server/public-validation.ts";

try {
  const read = async (name: string) =>
    JSON.parse(await readFile(new URL(`../content/${name}`, import.meta.url), "utf8"));
  const result = resolvePublicContent(await read("current.json"), await read("release.json"));
  if (result.state === "unavailable") throw new Error("Invalid content");
  console.log(
    JSON.stringify({
      publicContent: result.state,
      checks: "strict schema, fixture exclusion, release ID, canonical checksum",
    }),
  );
} catch {
  console.error("Public content validation failed; no input details are logged.");
  process.exitCode = 1;
}
