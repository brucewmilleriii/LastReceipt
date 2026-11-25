import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { geoAlbersUsa, geoBounds, geoContains, geoPath } from "d3-geo";
import { feature, mesh } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
// US Census Bureau cartographic boundaries, via us-atlas (ISC). Public-domain data.
import states10m from "us-atlas/states-10m.json";
import { C, MONO, SERIF } from "./theme";
import { PH, PW } from "./Charts";

// Rough 2000 Census population by state (millions). Only used to place illustrative dots.
const POP: Record<string, number> = {
  Alabama: 4.4, Arizona: 5.1, Arkansas: 2.7, California: 33.9, Colorado: 4.3, Connecticut: 3.4, Delaware: 0.8,
  "District of Columbia": 0.6, Florida: 16.0, Georgia: 8.2, Idaho: 1.3, Illinois: 12.4, Indiana: 6.1, Iowa: 2.9,
  Kansas: 2.7, Kentucky: 4.0, Louisiana: 4.5, Maine: 1.3, Maryland: 5.3, Massachusetts: 6.3, Michigan: 9.9,
  Minnesota: 4.9, Mississippi: 2.8, Missouri: 5.6, Montana: 0.9, Nebraska: 1.7, Nevada: 2.0, "New Hampshire": 1.2,
  "New Jersey": 8.4, "New Mexico": 1.8, "New York": 19.0, "North Carolina": 8.0, "North Dakota": 0.6, Ohio: 11.4,
  Oklahoma: 3.5, Oregon: 3.4, Pennsylvania: 12.3, "Rhode Island": 1.0, "South Carolina": 4.0, "South Dakota": 0.8,
  Tennessee: 5.7, Texas: 20.9, Utah: 2.2, Vermont: 0.6, Virginia: 7.1, Washington: 5.9, "West Virginia": 1.8,
  Wisconsin: 5.4, Wyoming: 0.5,
};

const DALLAS: [number, number] = [-96.797, 32.777];
const BEND: [number, number] = [-121.315, 44.058];

const topo = states10m as unknown as Parameters<typeof feature>[0] & { objects: { states: never } };
const states = (feature(topo, topo.objects.states) as unknown as FeatureCollection<Geometry, { name: string }>).features.filter(
  (f) => POP[f.properties.name] !== undefined,
);
const borders = mesh(topo, topo.objects.states, (a: unknown, b: unknown) => a !== b);

// Map drawn to fit the plot area.
const MAP_W = 1000;
const MAP_H = 600;
const projection = geoAlbersUsa().scale(1240).translate([MAP_W / 2, MAP_H / 2 + 10]);
const path = geoPath(projection);

type Dot = { x: number; y: number; order: number; r: number };

const N_DOTS = 640;

const buildDots = (): Dot[] => {
  const total = states.reduce((s, f) => s + POP[f.properties.name], 0);
  const out: Dot[] = [];
  const dallasXY = projection(DALLAS)!;
  states.forEach((f: Feature<Geometry, { name: string }>, si) => {
    const n = Math.max(1, Math.round((POP[f.properties.name] / total) * N_DOTS));
    const [[x0, y0], [x1, y1]] = geoBounds(f);
    let made = 0;
    for (let k = 0; made < n && k < n * 60; k++) {
      const lon = x0 + random(`lon${si}-${k}`) * (x1 - x0);
      const lat = y0 + random(`lat${si}-${k}`) * (y1 - y0);
      if (!geoContains(f, [lon, lat])) continue;
      const p = projection([lon, lat]);
      if (!p) continue;
      const dist = Math.hypot(p[0] - dallasXY[0], p[1] - dallasXY[1]);
      out.push({ x: p[0], y: p[1], r: 3.6 + random(`r${si}-${k}`) * 2.2, order: dist / 700 + random(`o${si}-${k}`) * 0.55 });
      made++;
    }
  });
  const maxO = Math.max(...out.map((d) => d.order));
  return out.map((d) => ({ ...d, order: d.order / maxO }));
};
const DOTS = buildDots();
const bendXY = projection(BEND)!;
const dallasXY = projection(DALLAS)!;

// mode "spread": dots appear outward from Dallas. mode "shrink": they go out until only Bend remains.
export const StoreMap: React.FC<{
  mode: "spread" | "shrink";
  years: [number, number];
  run: [number, number];
}> = ({ mode, years, run }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, run, [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const year = Math.round(interpolate(t, [0, 1], years));
  const mapA = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scale = Math.min(PW / MAP_W, PH / MAP_H) * 0.98;
  const ox = (PW - MAP_W * scale) / 2 - 120;
  const bendA = mode === "shrink" ? interpolate(frame, [run[1] - 6, run[1] + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const pulse = mode === "shrink" && frame > run[1] ? 1 + 0.25 * Math.max(0, Math.sin((frame - run[1]) / 7)) : 1;
  return (
    <svg width={PW} height={PH} style={{ overflow: "visible", filter: "blur(0.35px)" }}>
      <g transform={`translate(${ox},0) scale(${scale})`} opacity={mapA}>
        {states.map((f, i) => (
          <path key={i} d={path(f) ?? ""} fill={C.paperShade} fillOpacity={0.55} stroke="none" />
        ))}
        <path d={path(borders) ?? ""} fill="none" stroke={C.inkFaded} strokeOpacity={0.55} strokeWidth={0.9} />
        <path d={path({ type: "Sphere" } as never) ?? ""} fill="none" />
        {DOTS.map((d, i) => {
          let a: number;
          let s: number;
          if (mode === "spread") {
            const local = (t - d.order * 0.92) / 0.08;
            a = Math.max(0, Math.min(1, local));
            s = a < 1 ? 0.6 + 0.4 * a + 0.35 * Math.sin(a * Math.PI) : 1;
          } else {
            // reverse order: the far-flung stores close first, the dense ones last
            const local = (t - (1 - d.order) * 0.92) / 0.08;
            a = 1 - Math.max(0, Math.min(1, local));
            s = 1;
          }
          if (a <= 0.001) return null;
          return <circle key={i} cx={d.x} cy={d.y} r={d.r * s} fill={C.red} fillOpacity={0.78 * a} style={{ mixBlendMode: "multiply" }} />;
        })}
        {mode === "spread" ? (
          <g opacity={interpolate(frame, [run[0], run[0] + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
            <circle cx={dallasXY[0]} cy={dallasXY[1]} r={9} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <text x={dallasXY[0] + 16} y={dallasXY[1] + 34} fontFamily={MONO} fontWeight={600} fontSize={22} fill={C.ink} stroke={C.cream} strokeWidth={5} paintOrder="stroke">
              DALLAS
            </text>
          </g>
        ) : (
          <g opacity={bendA}>
            <circle cx={bendXY[0]} cy={bendXY[1]} r={7 * pulse} fill={C.red} />
            <circle cx={bendXY[0]} cy={bendXY[1]} r={16} fill="none" stroke={C.ink} strokeWidth={2.5} />
            <text x={bendXY[0] + 26} y={bendXY[1] + 7} fontFamily={MONO} fontWeight={600} fontSize={22} fill={C.ink} stroke={C.cream} strokeWidth={5} paintOrder="stroke">
              BEND, OREGON
            </text>
          </g>
        )}
      </g>
      <text x={PW - 20} y={PH - 30} textAnchor="end" fontFamily={SERIF} fontWeight={600} fontSize={150} fill={C.ink} fillOpacity={0.85} style={{ fontVariantNumeric: "tabular-nums" }}>
        {year}
      </text>
    </svg>
  );
};
