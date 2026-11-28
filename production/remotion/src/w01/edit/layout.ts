// Turns the W01 edit plan (script order) plus measured audio lengths into a timeline.
// Pure functions, no imports: the Remotion composition and the caption script both use it.
//
// Rules:
// - Standalone visuals (chapter cards, intro receipt, beats of black, end screen) play on their own, no voice.
// - Sam's on-camera pieces are pinned to the part of his take where he is on camera.
// - Everything between two pinned moments is a "window": its voice-over plays in order with a breath between
//   lines, and its pictures (recreations, graphics, archive stills, cards) share the window's time.
//   Clips keep their own length, stills stretch to fill, and if the pictures need more time than the
//   voice the window grows (the music carries the gap).

export type PlanItem = {
  kind: string;
  secs?: number;
  standalone?: boolean;
  audio?: string;
  text?: string;
  camText?: string;
  pos?: string;
  n?: number;
  pieces?: { src: string; secs: number }[];
  [k: string]: unknown;
};

export type Placed = { item: PlanItem; from: number; dur: number };
export type AudioPlaced = { src: string; from: number; dur: number; text: string; kind: string };
export type Timeline = { video: Placed[]; overlays: Placed[]; audio: AudioPlaced[]; total: number; voiceSpans: [number, number][] };

const GAP = 0.45; // breath between lines
const STILL_MIN = 2.6;
const STILL_MAX = 7;

const estimate = (text = "") => Math.max(1.5, text.split(/\s+/).length / 2.55 + 0.4);

export const layout = (plan: PlanItem[], durations: Record<string, number>): Timeline => {
  const video: Placed[] = [];
  const overlays: Placed[] = [];
  const audio: AudioPlaced[] = [];
  const dur = (it: PlanItem) => (it.audio && durations[it.audio]) || estimate(it.text);
  let t = 0.5;
  let vis: PlanItem[] = [];
  // voice segments waiting in the current window: either whole lines, or the voice-over part of a Sam take
  type V = { len: number; place: (at: number) => void };
  let voice: V[] = [];
  let preSpoken = 0; // voice already running at window start (the tail of a Sam take)
  let lastStill: PlanItem | null = null;

  const flush = (endWithVoTail?: { len: number; place: (at: number) => void }) => {
    let voiceLen = preSpoken;
    for (const v of voice) voiceLen += v.len + GAP;
    if (endWithVoTail) voiceLen += endWithVoTail.len;
    const fixed = vis.filter((v) => v.kind !== "still").reduce((s, v) => s + (v.secs ?? 4), 0);
    const stills = vis.filter((v) => v.kind === "still");
    if (vis.length === 0 && voiceLen > 0.01 && lastStill) {
      vis = [{ ...lastStill, dir: -((lastStill.dir as number) ?? 1) }];
      stills.push(vis[0]);
    }
    const minVis = fixed + stills.length * STILL_MIN;
    const L = Math.max(voiceLen, minVis);
    // pictures: clips keep their length; graphics and cards may stretch up to 30%;
    // what is left goes to slow moves on the stills, never longer than STILL_MAX each,
    // cycling through the window's stills (or the last one shown) with new directions.
    let R = L - fixed;
    const flex = vis.filter((v) => v.kind === "gfx" || v.kind === "doc").reduce((s, v) => s + (v.secs ?? 4), 0);
    let stretch = 1;
    if (R > 0 && flex > 0) {
      const wantStill = stills.length ? stills.length * 4.5 : 0;
      const give = Math.max(0, Math.min(flex * 0.3, R - wantStill));
      stretch = 1 + give / flex;
      R -= give;
    }
    const pool = stills.length ? stills : lastStill && R > 0.3 ? [lastStill] : [];
    const k = pool.length ? Math.max(pool.length, Math.ceil(R / STILL_MAX)) : 0;
    const moves: PlanItem[] = Array.from({ length: k }, (_, i) => ({
      ...pool[i % pool.length],
      dir: (i % 2 ? -1 : 1) * (((pool[i % pool.length].dir as number) ?? 1) as number),
      move: Math.floor(i / pool.length),
    }));
    const moveLen = k ? R / k : 0;
    const order: PlanItem[] = [];
    let mi = 0;
    for (const v of vis) {
      if (v.kind === "overlay") continue;
      if (v.kind === "still") {
        // this still's share of moves sits where the still was in the script
        const share = Math.round(k / Math.max(1, stills.length));
        for (let j = 0; j < share && mi < k; j++) order.push(moves[mi++]);
      } else order.push(v);
    }
    while (mi < k) order.push(moves[mi++]);
    let p = t;
    for (const v of order) {
      const d = v.kind === "still" ? moveLen : (v.secs ?? 4) * (v.kind === "clip" ? 1 : stretch);
      video.push({ item: v, from: p, dur: d });
      p += d;
      if (v.kind === "still") lastStill = v;
    }
    for (const v of vis) if (v.kind === "overlay") overlays.push({ item: v, from: t, dur: v.secs ?? 5 });
    // voice
    let a = t + preSpoken + (preSpoken ? GAP : 0);
    for (const v of voice) {
      v.place(a);
      a += v.len + GAP;
    }
    if (endWithVoTail) endWithVoTail.place(t + L - endWithVoTail.len);
    t += L;
    vis = [];
    voice = [];
    preSpoken = 0;
  };

  for (const it of plan) {
    if (it.kind === "nar") {
      const d = dur(it);
      voice.push({ len: d, place: (at) => audio.push({ src: it.audio!, from: at, dur: d, text: it.text ?? "", kind: "nar" }) });
    } else if (it.kind === "sam") {
      const full = dur(it);
      const cam = (it.pieces ?? []).reduce((s, p) => s + p.secs, 0);
      const vo = Math.max(0, full - cam);
      const pinCam = (at: number) => {
        let q = at;
        for (const pc of it.pieces ?? []) {
          video.push({ item: { kind: "sam", src: pc.src }, from: q, dur: pc.secs });
          q += pc.secs;
        }
      };
      if (it.pos === "end" && vo > 0.05) {
        // voice-over first (over the window's pictures), then Sam on camera
        let start = 0;
        flush({ len: vo, place: (at) => (start = at) });
        audio.push({ src: it.audio!, from: start, dur: full, text: it.text ?? "", kind: "sam" });
        pinCam(t);
        t += cam + GAP;
      } else {
        flush();
        audio.push({ src: it.audio!, from: t, dur: full, text: it.text ?? "", kind: "sam" });
        pinCam(t);
        t += cam;
        if (it.pos === "start" && vo > 0.05) preSpoken = vo; // his voice continues over the next pictures
        else t += GAP;
      }
    } else if (it.standalone) {
      flush();
      video.push({ item: it, from: t, dur: it.secs ?? 3 });
      t += it.secs ?? 3;
    } else {
      vis.push(it);
    }
  }
  flush();
  const voiceSpans = audio.map((a) => [a.from, a.from + a.dur] as [number, number]);
  return { video, overlays, audio, total: t + 0.5, voiceSpans };
};
