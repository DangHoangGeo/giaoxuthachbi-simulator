import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../..", import.meta.url));
const parent = await mkdtemp(path.join(os.tmpdir(), "thachbi-gallery-harness-"));
const target = path.join(parent, "app");
let child;
let ending = false;
async function cleanup() {
  if (ending) return;
  ending = true;
  if (child && child.exitCode === null) {
    const stopped = new Promise((resolve) => child.once("exit", resolve));
    child.kill("SIGTERM");
    await stopped;
  }
  await rm(parent, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGTERM", cleanup);
process.on("SIGINT", cleanup);
const run = (args, cwd) =>
  new Promise((resolve, reject) => {
    child = spawn(process.execPath, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 || ending ? resolve() : reject(new Error(`Test harness process exited ${code}`)),
    );
  });
try {
  await run(["tests/harness/prepare-gallery.mjs", target], web);
  // Webpack permits linked local test dependencies without widening the production trace root.
  await run([path.join(web, "node_modules/next/dist/bin/next"), "build", "--webpack"], target);
  await run(
    [
      path.join(web, "node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3120",
    ],
    target,
  );
} finally {
  await rm(parent, { recursive: true, force: true });
}
