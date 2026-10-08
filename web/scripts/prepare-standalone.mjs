import { access, cp } from "node:fs/promises";

await cp(".next/static", ".next/standalone/.next/static", { recursive: true });
try {
  await access("public");
} catch {
  process.exit(0);
}
await cp("public", ".next/standalone/public", { recursive: true });
