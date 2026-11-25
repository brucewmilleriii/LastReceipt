import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO } from "./theme";
import { Grain, PaperTexture } from "./Grain";

export type ReceiptLine = {
  text: string;
  right?: string; // right-aligned amount on the same line
  align?: "left" | "center";
  size?: number; // px
  weight?: 400 | 500 | 600;
  rule?: boolean; // dashed separator instead of text
  gapAfter?: number; // extra px below
};

const PAPER_W = 540;
const PAD = 38;
const LINE_H = 1.35;

// A thermal receipt that feeds out of a printer slot in short steps,
// like a real printer, then optionally gets torn off.
export const Receipt: React.FC<{
  lines: ReceiptLine[];
  startFrame?: number;
  framesPerLine?: number;
  tearAt?: number; // frame when the cashier tears it off
  holdOffset?: number; // extra paper fed after the last line (px)
}> = ({ lines, startFrame = 8, framesPerLine = 9, tearAt, holdOffset = 90 }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();

  // Lay out lines top to bottom.
  let y = PAD;
  const laid = lines.map((l) => {
    const size = l.size ?? 34;
    const h = l.rule ? 30 : size * LINE_H;
    const item = { ...l, size, top: y, h };
    y += h + (l.gapAfter ?? 6);
    return item;
  });
  const paperLen = y + holdOffset;

  // Fed length: steps of one line, each step a quick jerk (thermal stepper).
  const feedFor = (f: number) => {
    const t = f - startFrame;
    if (t <= 0) return 0;
    const step = Math.floor(t / framesPerLine);
    const within = (t % framesPerLine) / framesPerLine;
    const jerk = Math.min(1, within / 0.45); // move in first 45% of the step, then pause
    const eased = Easing.out(Easing.cubic)(jerk);
    const idx = Math.min(step, laid.length);
    const base = idx === 0 ? 0 : laid[idx - 1].top + laid[idx - 1].h + PAD * 0.6;
    if (idx >= laid.length) {
      const extra = interpolate(t - laid.length * framesPerLine, [0, 14], [0, holdOffset], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      });
      return Math.min(paperLen, base + extra);
    }
    const next = laid[idx].top + laid[idx].h + PAD * 0.6;
    return base + (next - base) * eased;
  };
  const fed = feedFor(frame);

  // Tear: paper drops and swings away.
  const tearT = tearAt === undefined ? 0 : interpolate(frame, [tearAt, tearAt + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });
  const tug = tearAt === undefined ? 0 : interpolate(frame, [tearAt - 6, tearAt], [0, 10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const slotY = height - 190;
  // Small camera drift: handheld-free, slow push.
  const push = interpolate(frame, [0, 150], [1.0, 1.05], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.night }}>
      {/* warm practical light falling on the counter */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 70% at 50% 62%, #3a2c1d 0%, ${C.warm} 35%, ${C.night} 80%)`,
        }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`,  transformOrigin: "50% 60%" }}>
        {/* paper, hanging from the slot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: slotY - fed,
            width: PAPER_W,
            height: fed,
            marginLeft: -PAPER_W / 2,
            overflow: "hidden",
            transform: `translateY(${-tug - tearT * height * 1.1}px) rotate(${tearT * 7}deg)`,
            transformOrigin: "50% 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: paperLen,
              background: `linear-gradient(90deg, ${C.paperShade} 0%, ${C.paper} 7%, ${C.cream} 50%, ${C.paper} 93%, ${C.paperShade} 100%)`,
              boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
              clipPath:
                tearAt !== undefined && frame >= tearAt
                  ? `polygon(0% 0%, 100% 0%, ${Array.from({ length: 33 }, (_, i) => `${100 - (i / 32) * 100}% ${fed - (i % 2 ? 0 : 8)}px`).join(",")})`
                  : undefined,
            }}
          >
            <PaperTexture id="rcpt" />
            {laid.map((l, i) => {
              const inkVar = 0.8 + random(`ink${i}`) * 0.2;
              const common: React.CSSProperties = {
                position: "absolute",
                left: PAD,
                right: PAD,
                top: l.top,
                fontFamily: MONO,
                fontSize: l.size,
                fontWeight: l.weight ?? 500,
                color: C.ink,
                opacity: inkVar,
                letterSpacing: 0.5,
                filter: "blur(0.45px)",
                textShadow: "0 0 0.6px rgba(42,38,34,0.6)",
                lineHeight: `${l.size * LINE_H}px`,
                whiteSpace: "pre",
              };
              if (l.rule) {
                return (
                  <div key={i} style={{ ...common, top: l.top + 12, height: 0, borderTop: `3px dashed ${C.inkFaded}` }} />
                );
              }
              return (
                <div key={i} style={{ ...common, display: "flex", justifyContent: l.align === "center" ? "center" : "space-between" }}>
                  <span>{l.text}</span>
                  {l.right ? <span>{l.right}</span> : null}
                </div>
              );
            })}
            {/* thermal head banding: faint lighter streaks running down the paper */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(90deg, rgba(237,232,220,0) 0px, rgba(237,232,220,0) 53px, rgba(237,232,220,0.16) 55px, rgba(237,232,220,0) 58px, rgba(237,232,220,0) 91px, rgba(237,232,220,0.1) 92px, rgba(237,232,220,0) 94px)",
                mixBlendMode: "screen",
              }}
            />
            {/* light falls off toward the printer slot */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: Math.max(0, fed - 160),
                height: 160,
                background: "linear-gradient(180deg, rgba(20,14,8,0) 0%, rgba(20,14,8,0.35) 100%)",
              }}
            />
            {/* curl shading at the free end */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 70,
                background: "linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(60,45,30,0.28) 100%)",
              }}
            />
          </div>
        </div>
        {/* printer body and slot */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: slotY - 8,
            width: PAPER_W + 220,
            marginLeft: -(PAPER_W + 220) / 2,
            height: height - slotY + 40,
            borderRadius: "26px 26px 0 0",
            background: "linear-gradient(180deg, #2f2c29 0%, #232120 30%, #161514 100%)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.6), inset 0 -2px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 90,
              right: 90,
              top: 2,
              height: 12,
              borderRadius: 6,
              background: "#070707",
              boxShadow: "inset 0 3px 6px rgba(0,0,0,0.9)",
            }}
          />
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
