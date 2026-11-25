import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

// Moving film grain plus a soft vignette, so flat colour never looks digital.
export const Grain: React.FC<{ opacity?: number; vignette?: number }> = ({
  opacity = 0.12,
  vignette = 0.55,
}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(random(`g${frame}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", opacity, mixBlendMode: "overlay" }}>
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,${vignette}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Fibre texture for thermal paper.
export const PaperTexture: React.FC<{ id: string; opacity?: number }> = ({ id, opacity = 0.35 }) => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity, mixBlendMode: "multiply" }}>
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.6" numOctaves="3" seed={7} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0.5 0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);
