// usage: node shoot.mjs PREVIEW_DIR OUT_DIR [scale]
import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
const [dir, out, scale = "0.5"] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  const m = html.match(/width:(\d+)px;height:(\d+)px;background:#fff/);
  const [w, h] = [Number(m[1]), Number(m[2])];
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: Number(scale) });
  await p.goto("file://" + path.resolve(dir, f));
  await p.waitForTimeout(150);
  await p.screenshot({ path: path.join(out, f.replace(".html", ".png")), fullPage: false });
  await p.close();
}
await b.close();
