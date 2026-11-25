import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO } from "./theme";
import { Grain } from "./Grain";

// The verdict: a red CLOSED stamp lands on a real archive storefront photo.
export const ClosedStamp: React.FC<{ photo: string; stampAt?: number; credit?: string }> = ({
  photo,
  stampAt = 30,
  credit,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const push = interpolate(frame, [0, durationInFrames], [1.02, 1.1]);
  const desat = interpolate(frame, [stampAt, stampAt + 20], [0.35, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const s = spring({ frame: frame - stampAt, fps, config: { damping: 14, stiffness: 260, mass: 0.6 } });
  const scale = interpolate(s, [0, 1], [2.4, 1]);
  const shake = frame >= stampAt && frame < stampAt + 6 ? (frame % 2 ? 5 : -5) * (1 - (frame - stampAt) / 6) : 0;
  return (
    <AbsoluteFill style={{ background: C.night, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Img
          src={staticFile(photo)}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: `saturate(${desat}) contrast(1.05) brightness(0.92)` }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            opacity: frame >= stampAt ? interpolate(s, [0, 0.3], [0, 0.92], { extrapolateRight: "clamp" }) : 0,
            transform: `scale(${scale}) rotate(-11deg)`,
            border: `14px solid ${C.red}`,
            borderRadius: 18,
            padding: "18px 70px 10px",
            fontFamily: MONO,
            fontWeight: 600,
            fontSize: 210,
            letterSpacing: 22,
            color: C.red,
            mixBlendMode: "multiply",
            // uneven ink: mask with noise so the stamp is patchy like real rubber
            WebkitMaskImage:
              "radial-gradient(circle at 30% 40%, #000 55%, rgba(0,0,0,0.55) 70%), radial-gradient(circle at 75% 65%, #000 50%, rgba(0,0,0,0.7) 80%)",
          }}
        >
          CLOSED
        </div>
      </AbsoluteFill>
      {credit ? <Credit text={credit} /> : null}
      <Grain opacity={0.1} vignette={0.5} />
    </AbsoluteFill>
  );
};

// G22: small source credit, lower left.
export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div
    style={{
      position: "absolute",
      left: 60,
      bottom: 46,
      fontFamily: MONO,
      fontSize: 22,
      color: "rgba(243,238,227,0.78)",
      textShadow: "0 1px 3px rgba(0,0,0,0.8)",
      letterSpacing: 0.5,
    }}
  >
    {text}
  </div>
);

// G19: "Recreation" label on every recreation clip.
export const RecreationLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  return (
    <div
      style={{
        position: "absolute",
        right: 70,
        bottom: 56,
        opacity: a * 0.85,
        fontFamily: MONO,
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: 6,
        color: C.cream,
        padding: "6px 14px",
        border: `2px solid rgba(243,238,227,0.6)`,
        background: "rgba(15,14,12,0.35)",
      }}
    >
      RECREATION
    </div>
  );
};
