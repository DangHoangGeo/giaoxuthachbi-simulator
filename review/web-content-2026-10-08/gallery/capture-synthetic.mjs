// Run at this source revision while the isolated test runner serves loopback3120.
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";
const repo = process.cwd();
const require = createRequire(path.join(repo, "web/package.json"));
const { chromium } = require("@playwright/test");
const out = path.join(repo, "review/web-content-2026-10-08/gallery/synthetic");
const browser = await chromium.launch({ channel: "chrome", headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const captures = [];
async function capture(name) {
  await page.screenshot({path: path.join(out, name), fullPage: true});
  captures.push({name, url:page.url(), overflow: await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth), focused: await page.evaluate(()=>({tag: document.activeElement?.tagName, label: document.activeElement?.tagName === "BODY" ? null : document.activeElement?.textContent?.trim().slice(0, 160)}))});
}
for (const locale of ["en", "vi"]) {
  await page.goto(`http://127.0.0.1:3120/${locale}/design`);
  if (!(await page.getByText("SYNTHETIC TEST BUILD — NO CHURCH EVIDENCE", {exact:true}).isVisible())) throw new Error("Test-build marker absent");
  await capture(`${locale}-all.png`);
  await page.locator('figure a').first().focus();
  await page.keyboard.press("Enter");
  await page.getByRole("dialog").waitFor({state:"visible"});
  await capture(`${locale}-dialog-keyboard.png`);
  await page.keyboard.press("Escape");
  await page.goto(`http://127.0.0.1:3120/${locale}/design?category=concept-art`);
  await capture(`${locale}-concept-filter.png`);
}
await browser.close();
await fs.writeFile(path.join(out,"captures.json"), JSON.stringify({kind:"synthetic presentation evidence only",browser:"headed Chrome",viewport:{width:1440,height:900},captures,errors},null,2)+"\n");
if (errors.length || captures.some(c=>c.overflow)) throw new Error("Capture diagnostics failed");
console.log(JSON.stringify({captures:captures.length,errors}));
