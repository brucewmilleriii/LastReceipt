// Fetch W01 media into public/w01 (run on a computer that can reach the hosts).
// Usage: node scripts/w01_fetch.mjs --audio "C:\path\to\folder\with\mp3s"
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public");
const assets = JSON.parse(fs.readFileSync(path.join(root, "src/w01/edit/assets.json"), "utf8"));
const UA = { "User-Agent": "LastReceiptAssetFetcher/1.0 (video edit; contact via channel)" };
let ok = 0, fail = 0;
for (const group of Object.values(assets)) {
  for (const [rel, url] of Object.entries(group)) {
    const out = path.join(pub, rel);
    if (fs.existsSync(out) && fs.statSync(out).size > 1000) { ok++; continue; }
    fs.mkdirSync(path.dirname(out), { recursive: true });
    try {
      const r = await fetch(url, { headers: UA, redirect: "follow" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      fs.writeFileSync(out, Buffer.from(await r.arrayBuffer()));
      ok++; console.log("got", rel);
    } catch (e) { fail++; console.log("FAILED", rel, url, String(e)); }
    await new Promise((res) => setTimeout(res, 400));
  }
}
const i = process.argv.indexOf("--audio");
if (i > 0) {
  const src = process.argv[i + 1];
  const dest = path.join(pub, "w01/audio");
  fs.mkdirSync(dest, { recursive: true });
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  const want = /^w01_(sam|nar)_\d\d\.mp3$/i;
  let n = 0;
  for (const f of walk(src)) if (want.test(path.basename(f))) { fs.copyFileSync(f, path.join(dest, path.basename(f).toLowerCase())); n++; }
  console.log(`copied ${n} audio files (expected 45: 15 Sam takes + 30 narration takes)`);
}
console.log(`media: ${ok} ready, ${fail} failed`);
