import React from "react";
import { Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SERIF } from "./theme";
import { inkStyle } from "./Sheet";

// Plot area inside a Sheet.
export const PW = 1448;
export const PH = 580;

export type Pt = [number, number];
export type Series = {
  name: string;
  color: string;
  width?: number;
  points: Pt[];
  // label placed at the pen tip once the line has finished drawing
  endLabel?: string;
};
export type Note = { x: number; y: number; text: string; at: number; dx?: number; dy?: number; color?: string };

const ease = Easing.inOut(Easing.cubic);

// Cut a polyline at x = cut, so the pen tip moves along the data.
const cutLine = (pts: Pt[], cut: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p[0] <= cut) {
      out.push(p);
      continue;
    }
    const q = pts[i - 1];
    if (q) {
      const t = (cut - q[0]) / (p[0] - q[0]);
      out.push([cut, q[1] + (p[1] - q[1]) * t]);
    }
    break;
  }
  return out;
};

export const LineChart: React.FC<{
  series: Series[];
  x: [number, number];
  y: [number, number];
  xTicks: { v: number; label: string }[];
  yTicks: { v: number; label: string }[];
  // the line draws from xFrom to xTo between these frames
  drawFrames: [number, number];
  xFrom?: number;
  xTo?: number;
  notes?: Note[];
}> = ({ series, x, y, xTicks, yTicks, drawFrames, xFrom, xTo, notes = [] }) => {
  const frame = useCurrentFrame();
  const L = 110;
  const B = 56;
  const w = PW - L - 60;
  const h = PH - B - 10;
  const sx = (v: number) => L + ((v - x[0]) / (x[1] - x[0])) * w;
  const sy = (v: number) => 10 + h - ((v - y[0]) / (y[1] - y[0])) * h;
  const cut = interpolate(frame, drawFrames, [xFrom ?? x[0], xTo ?? x[1]], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: ease,
  });
  const axisA = interpolate(frame, [8, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={PW} height={PH} style={{ overflow: "visible", fontVariantNumeric: "tabular-nums", ...inkStyle }}>
      {yTicks.map((t, i) => (
        <g key={`y${i}`} opacity={axisA}>
          <line x1={L} x2={L + w} y1={sy(t.v)} y2={sy(t.v)} stroke={C.inkFaded} strokeOpacity={t.v === y[0] ? 0.8 : 0.22} strokeWidth={t.v === y[0] ? 2 : 1.2} strokeDasharray={t.v === y[0] ? undefined : "2 7"} />
          <text x={L - 18} y={sy(t.v) + 8} textAnchor="end" fontFamily={MONO} fontSize={24} fill={C.inkFaded}>
            {t.label}
          </text>
        </g>
      ))}
      {xTicks.map((t, i) => (
        <text key={`x${i}`} x={sx(t.v)} y={10 + h + 42} textAnchor="middle" fontFamily={MONO} fontSize={24} fill={C.inkFaded} opacity={axisA}>
          {t.label}
        </text>
      ))}
      {series.map((s, si) => {
        const pts = cutLine(s.points, cut);
        if (pts.length < 1) return null;
        const d = pts.map((p, i) => `${i ? "L" : "M"}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(" ");
        const tip = pts[pts.length - 1];
        const done = cut >= s.points[s.points.length - 1][0] - 1e-6;
        const labelA = done ? 1 : 0.0;
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={s.width ?? 6} strokeLinejoin="round" strokeLinecap="round" />
            {s.points
              .filter((p) => p[0] <= cut + 1e-6)
              .map((p, i) => (
                <circle key={i} cx={sx(p[0])} cy={sy(p[1])} r={(s.width ?? 6) * 1.25} fill={C.cream} stroke={s.color} strokeWidth={3.5} />
              ))}
            <circle cx={sx(tip[0])} cy={sy(tip[1])} r={(s.width ?? 6) * 0.9} fill={s.color} />
            <text
              x={sx(tip[0]) + 22}
              y={sy(tip[1]) + 9 + si * 0}
              fontFamily={MONO}
              fontWeight={600}
              fontSize={28}
              fill={s.color}
              opacity={labelA}
            >
              {s.name}
              {s.endLabel ? <tspan fontWeight={400}>{`  ${s.endLabel}`}</tspan> : null}
            </text>
            {!done ? (
              <text x={sx(tip[0]) + 18} y={sy(tip[1]) - 18} fontFamily={MONO} fontWeight={600} fontSize={26} fill={s.color}>
                {s.name}
              </text>
            ) : null}
          </g>
        );
      })}
      {notes.map((n, i) => {
        const a = interpolate(frame, [n.at, n.at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const px = sx(n.x);
        const py = sy(n.y);
        const dx = n.dx ?? 0;
        const dy = n.dy ?? -70;
        return (
          <g key={`n${i}`} opacity={a}>
            <line x1={px} y1={py} x2={px + dx} y2={py + dy + (dy < 0 ? 18 : -30)} stroke={n.color ?? C.ink} strokeWidth={2} />
            <text x={px + dx} y={py + dy} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={34} fill={n.color ?? C.ink}>
              {n.text}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// Two bars and a count-up: the debt Blockbuster carried out of the Viacom split.
export const DebtBars: React.FC<{
  bars: { label: string; value: number; display: (v: number) => string; accent?: boolean; at: number }[];
  max: number;
  note?: { text: string; at: number };
}> = ({ bars, max, note }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const base = PH - 70;
  const barW = 300;
  const gap = 160;
  const left = 120;
  return (
    <svg width={PW} height={PH} style={{ overflow: "visible", fontVariantNumeric: "tabular-nums", ...inkStyle }}>
      <line x1={60} x2={PW - 60} y1={base} y2={base} stroke={C.ink} strokeWidth={2.5} strokeOpacity={0.8} />
      {bars.map((b, i) => {
        const s = spring({ frame: frame - b.at, fps, config: { damping: 200 }, durationInFrames: 40 });
        const v = b.value * s;
        const bh = (v / max) * (base - 70);
        const x0 = left + i * (barW + gap);
        const col = b.accent ? C.red : C.inkFaded;
        // hand-inked bar: a few uneven hatch strokes inside a solid fill
        return (
          <g key={b.label}>
            <rect x={x0} y={base - bh} width={barW} height={Math.max(bh, b.value > 0 && s > 0 ? 3 : 0)} fill={col} fillOpacity={b.accent ? 0.92 : 0.7} />
            {Array.from({ length: 6 }, (_, k) => (
              <line
                key={k}
                x1={x0 + 6 + random(`h${i}${k}`) * (barW - 12)}
                x2={x0 + 6 + random(`h${i}${k}`) * (barW - 12) + (random(`j${i}${k}`) - 0.5) * 6}
                y1={base - 2}
                y2={base - bh + 4}
                stroke="#000"
                strokeOpacity={bh > 10 ? 0.06 : 0}
                strokeWidth={3}
              />
            ))}
            <text x={x0 + barW / 2} y={base - bh - 26} textAnchor="middle" fontFamily={SERIF} fontWeight={600} fontSize={b.accent ? 76 : 54} fill={b.accent ? C.red : C.ink} opacity={s > 0.02 ? 1 : 0}>
              {b.display(v)}
            </text>
            <text x={x0 + barW / 2} y={base + 48} textAnchor="middle" fontFamily={MONO} fontSize={28} fill={C.inkFaded}>
              {b.label}
            </text>
          </g>
        );
      })}
      {note ? (
        <foreignObject x={PW - 520} y={120} width={480} height={320}>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 36,
              lineHeight: 1.25,
              color: C.ink,
              borderLeft: `4px solid ${C.red}`,
              paddingLeft: 26,
              opacity: interpolate(frame, [note.at, note.at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}
          >
            {note.text}
          </div>
        </foreignObject>
      ) : null}
    </svg>
  );
};
