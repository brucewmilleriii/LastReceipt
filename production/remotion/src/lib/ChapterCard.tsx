import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SERIF } from "./theme";
import { Grain, PaperTexture } from "./Grain";

// Chapter card: a torn receipt stub pinned on a dark wall, the question set in serif.
export const ChapterCard: React.FC<{ number: number; label: string; question: string }> = ({
  number,
  label,
  question,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inT = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const outT = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const words = question.split(" ");
  const push = interpolate(frame, [0, durationInFrames], [1, 1.04]);
  return (
    <AbsoluteFill style={{ background: C.night, opacity: outT }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(ellipse 55% 60% at 50% 48%, #2b2118 0%, ${C.night} 75%)` }}
      />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 1240,
            padding: "70px 90px 80px",
            background: `linear-gradient(90deg, ${C.paperShade}, ${C.cream} 12%, ${C.cream} 88%, ${C.paperShade})`,
            transform: `translateY(${(1 - inT) * 40}px) rotate(-0.6deg)`,
            opacity: inT,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            clipPath: `polygon(0% 10px, ${Array.from({ length: 41 }, (_, i) => `${(i / 40) * 100}% ${i % 2 ? random(`t${number}${i}`) * 3 : 6 + random(`u${number}${i}`) * 7}px`).join(",")}, 100% calc(100% - 10px), ${Array.from({ length: 41 }, (_, i) => `${100 - (i / 40) * 100}% calc(100% - ${i % 2 ? random(`b${number}${i}`) * 3 : 6 + random(`v${number}${i}`) * 7}px)`).join(",")})`,
          }}
        >
          <PaperTexture id={`cc${number}`} />
          <div
            style={{
              position: "relative",
              fontFamily: MONO,
              fontWeight: 500,
              fontSize: 34,
              letterSpacing: 6,
              color: C.inkFaded,
              display: "flex",
              justifyContent: "space-between",
              borderBottom: `3px dashed ${C.inkFaded}`,
              paddingBottom: 22,
              marginBottom: 46,
            }}
          >
            <span>CHAPTER {String(number).padStart(2, "0")}</span>
            <span>{label.toUpperCase()}</span>
          </div>
          <div
            style={{
              position: "relative",
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 92,
              lineHeight: 1.08,
              color: C.ink,
              letterSpacing: -1,
            }}
          >
            {words.map((w, i) => {
              const a = interpolate(frame, [10 + i * 3, 18 + i * 3], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <span key={i} style={{ opacity: a }}>
                  {w}{" "}
                </span>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
      <Grain />
    </AbsoluteFill>
  );
};
