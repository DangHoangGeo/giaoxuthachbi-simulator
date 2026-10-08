import { spawn } from "node:child_process";

const args = process.argv.slice(2);
if (args.length && !(args.length === 2 && args[0] === "--port"))
  throw new Error("Usage: npm start -- --port 3100");
const port = args[1] ?? process.env.PORT ?? "3000";
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error("Invalid local port");
const child = spawn(process.execPath, [".next/standalone/server.js"], {
  stdio: "inherit",
  env: { ...process.env, HOSTNAME: "127.0.0.1", PORT: port },
});
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (error) => {
  process.stderr.write(String(error));
  process.exit(1);
});
