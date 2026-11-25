import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SERIF } from "./theme";
import { Grain, PaperTexture } from "./Grain";

// A printed page lying under a warm desk lamp: every chart and map sits on one of these,
// so the data graphics share the receipt's paper and ink instead of a flat digital panel.
export const Sheet: React.FC<{
  id: string;
  kicker?: string;
  title: string;
  source: string;
  children: React.ReactNode;
  tilt?: number;
}> = ({ id, kicker, title, source, children, tilt = -0.5 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inT = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const outT = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.035]);
  const titleA = interpolate(frame, [6, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.night, opacity: outT }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 65% at 46% 44%, #33271b 0%, ${C.night} 78%)` }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 1640,
            height: 920,
            background: `linear-gradient(100deg, ${C.paperShade} 0%, ${C.cream} 14%, ${C.cream} 80%, ${C.paperShade} 100%)`,
            transform: `translateY(${(1 - inT) * 30}px) rotate(${tilt}deg)`,
            opacity: inT,
            boxShadow: "0 50px 90px rgba(0,0,0,0.65), 0 4px 10px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}
        >
          <PaperTexture id={`sh${id}`} opacity={0.28} />
          {/* lamp falloff across the page */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse 75% 85% at 38% 30%, rgba(255,236,200,0.18) 0%, rgba(60,40,20,0.22) 100%)",
              mixBlendMode: "multiply",
            }}
          />
          <div style={{ position: "absolute", left: 96, top: 70, right: 96, opacity: titleA }}>
            {kicker ? (
              <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 5, color: C.inkFaded, marginBottom: 14 }}>
                {kicker.toUpperCase()}
              </div>
            ) : null}
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 60, color: C.ink, letterSpacing: -0.5, lineHeight: 1.05 }}>
              {title}
            </div>
            <div style={{ height: 2, background: C.ink, opacity: 0.55, marginTop: 26 }} />
          </div>
          <div style={{ position: "absolute", left: 96, right: 96, top: 230, bottom: 110 }}>{children}</div>
          <div
            style={{
              position: "absolute",
              left: 96,
              right: 96,
              bottom: 52,
              fontFamily: MONO,
              fontSize: 20,
              color: C.inkFaded,
              letterSpacing: 0.5,
              opacity: titleA * 0.9,
            }}
          >
            {source}
          </div>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.13} vignette={0.6} />
    </AbsoluteFill>
  );
};

// Ink as it sits on uncoated paper: slightly soft, never a perfect vector edge.
export const inkStyle: React.CSSProperties = { filter: "blur(0.4px)" };
