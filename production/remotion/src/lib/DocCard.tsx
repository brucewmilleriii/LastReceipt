import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SERIF } from "./theme";
import { Grain, PaperTexture } from "./Grain";
import { Credit } from "./Stamp";

// A dated clipping on the desk, for moments where no licensed archive exists
// (TV ads, press coverage). States only what the narration states.
export const DocCard: React.FC<{ date: string; headline: string; sub?: string }> = ({ date, headline, sub }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const a = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  return (
    <AbsoluteFill style={{ background: C.night, opacity: out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 65% at 44% 42%, #33271b 0%, ${C.night} 80%)` }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            position: "relative",
            width: 1180,
            padding: "64px 84px 72px",
            background: `linear-gradient(95deg, ${C.paperShade}, ${C.cream} 16%, ${C.cream} 84%, ${C.paperShade})`,
            transform: `translateY(${(1 - a) * 24}px) rotate(0.8deg)`,
            opacity: a,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          <PaperTexture id={`doc${headline.length}`} opacity={0.3} />
          <div style={{ position: "relative", filter: "blur(0.35px)" }}>
            <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 6, color: C.red, marginBottom: 26 }}>{date.toUpperCase()}</div>
            <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 78, lineHeight: 1.08, color: C.ink, letterSpacing: -0.5 }}>{headline}</div>
            {sub ? <div style={{ fontFamily: SERIF, fontSize: 40, lineHeight: 1.3, color: C.inkFaded, marginTop: 28 }}>{sub}</div> : null}
          </div>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.12} vignette={0.6} />
    </AbsoluteFill>
  );
};

// Archive still with a slow move; small or low-res photos sit framed on dark paper instead of being blown up.
export const Still: React.FC<{ photo: string; credit?: string; framed?: boolean; dir?: number; name?: string; role?: string }> = ({
  photo,
  credit,
  framed,
  dir = 1,
  name,
  role,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.sin) });
  const s = 1.04 + 0.07 * t;
  const x = dir * (-1.2 + 2.4 * t);
  const fade = Math.min(
    interpolate(frame, [0, 6], [0, 1], { extrapolateRight: "clamp" }),
    interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }),
  );
  return (
    <AbsoluteFill style={{ background: C.night, opacity: fade }}>
      {framed ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.04 * t})` }}>
          <div style={{ background: C.cream, padding: 18, boxShadow: "0 30px 70px rgba(0,0,0,0.7)", transform: "rotate(-1deg)" }}>
            <Img src={staticFile(photo)} style={{ height: 720, display: "block", filter: "saturate(0.85)" }} />
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ transform: `scale(${s}) translateX(${x}%)` }}>
          <Img src={staticFile(photo)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {name ? <NameCard name={name} role={role} /> : null}
      {credit ? <Credit text={credit} /> : null}
      <Grain opacity={0.08} vignette={0.4} />
    </AbsoluteFill>
  );
};

// Lower-third name card in the receipt style.
export const NameCard: React.FC<{ name: string; role?: string }> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        bottom: 150,
        padding: "20px 30px 22px",
        background: C.cream,
        boxShadow: "0 14px 30px rgba(0,0,0,0.5)",
        opacity: a,
        transform: `translateX(${(1 - a) * -30}px)`,
      }}
    >
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 46, color: C.ink }}>{name}</div>
      {role ? <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: C.inkFaded, marginTop: 6 }}>{role.toUpperCase()}</div> : null}
    </div>
  );
};
