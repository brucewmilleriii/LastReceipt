import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SERIF } from "./theme";
import { PH, PW } from "./Charts";
import { Grain, PaperTexture } from "./Grain";
import { Credit } from "./Stamp";

// G12: a rope between two ideas. The knot drifts to "Protect profits" and stays there.
export const TugOfWar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pull = interpolate(frame, [30, 70, 95, 130], [0, -0.12, 0.08, 0.62], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const jitter = (random(`tw${Math.floor(frame / 2)}`) - 0.5) * 6 * (frame > 30 && frame < 130 ? 1 : 0.2);
  const cx = PW / 2 + pull * 420 + jitter;
  const y = PH / 2 + 30;
  const rope = (x0: number, x1: number) => {
    const sag = 14;
    return `M${x0},${y} Q${(x0 + x1) / 2},${y + sag} ${x1},${y}`;
  };
  const labelA = (at: number) => spring({ frame: frame - at, fps, config: { damping: 200 }, durationInFrames: 18 });
  const loser = interpolate(frame, [110, 140], [1, 0.45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={PW} height={PH} style={{ overflow: "visible", filter: "blur(0.4px)" }}>
      <defs>
        <pattern id="twist" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(55)">
          <rect width="18" height="18" fill="#8a7454" />
          <rect width="7" height="18" fill="#6b5a40" />
        </pattern>
      </defs>
      <line x1={PW / 2} x2={PW / 2} y1={y - 120} y2={y + 120} stroke={C.inkFaded} strokeWidth={2} strokeDasharray="6 10" />
      <path d={rope(90, PW - 90)} stroke="url(#twist)" strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={rope(90, PW - 90)} stroke="#000" strokeOpacity={0.12} strokeWidth={22} fill="none" transform="translate(0,6)" />
      {/* the knot / ribbon */}
      <g transform={`translate(${cx},${y + 7})`}>
        <rect x={-9} y={-6} width={18} height={70} fill={C.red} />
        <rect x={-17} y={-17} width={34} height={34} rx={8} fill={C.red} />
      </g>
      <g opacity={labelA(8) * loser}>
        <text x={90} y={y - 70} fontFamily={MONO} fontWeight={600} fontSize={46} fill={C.blueInk} letterSpacing={3}>
          SPEND TO WIN
        </text>
        <text x={90} y={y + 125} fontFamily={SERIF} fontSize={34} fill={C.inkFaded}>
          John Antioco, CEO
        </text>
      </g>
      <g opacity={labelA(16)}>
        <text x={PW - 90} y={y - 70} textAnchor="end" fontFamily={MONO} fontWeight={600} fontSize={46} fill={C.red} letterSpacing={3}>
          PROTECT PROFITS
        </text>
        <text x={PW - 90} y={y + 125} textAnchor="end" fontFamily={SERIF} fontSize={34} fill={C.inkFaded}>
          Carl Icahn and the board
        </text>
      </g>
    </svg>
  );
};

// G17: a small torn receipt stub rides in at the lower right while Sam keeps talking.
// Transparent background so it sits over the boardroom shot.
export const SubscribeStub: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const s = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 120 } });
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(s, [0, 1], [520, 0]) + out * 520;
  const tick = frame > 34 ? 1 : 0;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          right: 120,
          bottom: 120,
          width: 420,
          padding: "26px 34px 30px",
          background: C.cream,
          transform: `translateX(${x}px) rotate(1.2deg)`,
          boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
          clipPath: `polygon(0 0, 100% 0, 100% calc(100% - 8px), ${Array.from({ length: 21 }, (_, i) => `${100 - i * 5}% calc(100% - ${i % 2 ? 0 : 8}px)`).join(",")})`,
        }}
      >
        <PaperTexture id="sub" opacity={0.3} />
        <div style={{ position: "relative", fontFamily: MONO, color: C.ink, filter: "blur(0.4px)" }}>
          <div style={{ fontSize: 20, letterSpacing: 4, color: C.inkFaded }}>LAST RECEIPT</div>
          <div style={{ height: 2, borderTop: `2px dashed ${C.inkFaded}`, margin: "12px 0 16px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, fontWeight: 600 }}>
            <span>SUBSCRIBE</span>
            <span style={{ color: tick ? C.red : C.inkFaded }}>{tick ? "[x]" : "[ ]"}</span>
          </div>
          <div style={{ fontSize: 20, marginTop: 10, color: C.inkFaded }}>ONE COLLAPSE AT A TIME</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// G18: end screen. Left slot for the W02 Sears video element, right slot for subscribe.
// YouTube draws the elements; we give them a calm page and leave the slots clear.
export const EndScreen: React.FC<{ photo?: string; credit?: string }> = ({ photo, credit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const push = interpolate(frame, [0, durationInFrames], [1.04, 1.1]);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {photo ? (
        <AbsoluteFill style={{ transform: `scale(${push})`, opacity: 0.35 * a }}>
          <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "saturate(0.4) sepia(0.25)" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 70% at 50% 45%, rgba(43,33,24,0.55), ${C.night} 85%)` }} />
      {/* YouTube end-screen slots: video 16:9 at left, subscribe circle at right */}
      <div style={{ position: "absolute", left: 150, top: 300, width: 840, opacity: a }}>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: C.paperShade, marginBottom: 18 }}>NEXT RECEIPT</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, color: C.cream, lineHeight: 1 }}>Sears</div>
        <div style={{ width: 840, height: 472, marginTop: 34, border: `2px dashed rgba(243,238,227,0.18)` }} />
      </div>
      <div style={{ position: "absolute", right: 260, top: 470, width: 300, height: 300, borderRadius: "50%", border: `2px dashed rgba(243,238,227,0.18)`, opacity: a }} />
      {credit ? <Credit text={credit} /> : null}
      <Grain opacity={0.12} vignette={0.5} />
    </AbsoluteFill>
  );
};

// G21: slow, motivated push or pan across an archive still.
export const ArchiveStill: React.FC<{
  photo: string;
  from?: { s: number; x: number; y: number };
  to?: { s: number; x: number; y: number };
  credit?: string;
}> = ({ photo, from = { s: 1.04, x: 0, y: 0 }, to = { s: 1.12, x: -1.5, y: -1 }, credit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.sin) });
  const s = from.s + (to.s - from.s) * t;
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <AbsoluteFill style={{ transform: `scale(${s}) translate(${x}%, ${y}%)` }}>
        <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      {credit ? <Credit text={credit} /> : null}
      <Grain opacity={0.08} vignette={0.35} />
    </AbsoluteFill>
  );
};
