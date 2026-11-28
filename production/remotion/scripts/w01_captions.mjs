// Write the W01 captions (SRT) from the same timeline the edit uses.
// Usage: node scripts/w01_captions.mjs   (after the audio is in public/w01/audio)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { layout } from "../src/w01/edit/layout.ts";
const root = path.resolve(import.meta.dirname, "..");
const plan = JSON.parse(fs.readFileSync(path.join(root, "src/w01/edit/plan.json"), "utf8"));
const durations = {};
for (const it of plan) {
  if (!it.audio) continue;
  const f = path.join(root, "public", it.audio);
  if (!fs.existsSync(f)) continue;
  const out = execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], { cwd: root, shell: process.platform === "win32" }).toString();
  durations[it.audio] = parseFloat(out);
}
const tl = layout(plan, durations);
const ts = (s) => {
  const ms = Math.max(0, Math.round(s * 1000));
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
// split each line into caption-sized pieces (max ~84 characters, two lines of 42), timed by character share
const cues = [];
for (const a of tl.audio) {
  const words = a.text.split(/\s+/);
  const chunks = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > 84 || (/[.?!]$/.test(cur) && cur.length > 30)) { chunks.push(cur.trim()); cur = ""; }
    cur += " " + w;
  }
  if (cur.trim()) chunks.push(cur.trim());
  const total = chunks.reduce((s, c) => s + c.length, 0);
  let t = a.from + 0.1;
  const span = a.dur - 0.2;
  for (const c of chunks) {
    const d = (span * c.length) / total;
    cues.push([t, t + d - 0.04, c]);
    t += d;
  }
}
const srt = cues.map(([s, e, c], i) => `${i + 1}\n${ts(s)} --> ${ts(e)}\n${c}\n`).join("\n");
fs.mkdirSync(path.join(root, "out"), { recursive: true });
fs.writeFileSync(path.join(root, "out/W01_captions.srt"), srt);
fs.writeFileSync(path.join(root, "out/W01_transcript.txt"), tl.audio.map((a) => a.text).join("\n\n"));
console.log(`${cues.length} captions, ${Object.keys(durations).length} measured audio files, runtime ${(tl.total / 60).toFixed(1)} min`);
