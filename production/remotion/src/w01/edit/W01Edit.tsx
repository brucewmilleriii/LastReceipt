import React from "react";
import {
  AbsoluteFill,
  Audio,
  CalculateMetadataFunction,
  Composition,
  getStaticFiles,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
} from "remotion";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { C, MONO } from "../../lib/theme";
import { ChapterCard } from "../../lib/ChapterCard";
import { ClosedStamp, RecreationLabel } from "../../lib/Stamp";
import { DocCard, Still } from "../../lib/DocCard";
import { EndScreen, SubscribeStub } from "../../lib/Misc";
import { G01, G04 } from "../W01";
import { G03, G07, G08, G10, G12, G13, G15 } from "../W01Data";
import planJson from "./plan.json";
import { layout, PlanItem, Timeline } from "./layout";

const FPS = 30;
const plan = planJson as PlanItem[];

const has = (p: string) => getStaticFiles().some((f) => f.name === p);

const CHAPTERS: Record<string, { number: number; label: string; question: string }> = {
  G02: { number: 1, label: "Friday night", question: "Why did everyone love a store they hated?" },
  G05: { number: 2, label: "The meeting", question: "Why did Blockbuster say no?" },
  G06: { number: 3, label: "The crack", question: "What was really wrong with Blockbuster?" },
  G09: { number: 4, label: "The comeback", question: "Did Blockbuster almost beat Netflix?" },
  G11: { number: 5, label: "The fight", question: "Who actually killed Blockbuster?" },
  G14: { number: 6, label: "The last store", question: "Why is one Blockbuster still open?" },
};
const GFX: Record<string, React.FC> = { G01, G04, G03, G07, G08, G10, G12, G13, G15 };

const Missing: React.FC<{ what: string }> = ({ what }) => (
  <AbsoluteFill style={{ background: "#1a1714", alignItems: "center", justifyContent: "center" }}>
    <div style={{ fontFamily: MONO, fontSize: 30, color: C.paperShade, opacity: 0.7 }}>MISSING: {what}</div>
  </AbsoluteFill>
);

const Picture: React.FC<{ item: PlanItem }> = ({ item }) => {
  const k = item.kind;
  if (k === "black") return <AbsoluteFill style={{ background: "#000" }} />;
  if (k === "sam" || k === "clip") {
    const src = item.src as string;
    if (!has(src)) return <Missing what={src} />;
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {k === "clip" ? <RecreationLabel /> : null}
      </AbsoluteFill>
    );
  }
  if (k === "still") {
    const photo = item.photo as string;
    if (!has(photo)) return <Missing what={photo} />;
    // later moves on the same photo start tighter so a repeat never looks like a replay
    return (
      <Still
        photo={photo}
        credit={item.credit as string | undefined}
        framed={item.framed as boolean | undefined}
        dir={(item.dir as number) ?? 1}
        name={(item.move as number) ? undefined : (item.name as string | undefined)}
        role={(item.move as number) ? undefined : (item.role as string | undefined)}
      />
    );
  }
  if (k === "doc") return <DocCard date={item.date as string} headline={item.headline as string} sub={item.sub as string | undefined} />;
  if (k === "gfx") {
    const id = item.id as string;
    if (CHAPTERS[id]) return <ChapterCard {...CHAPTERS[id]} />;
    if (id === "G16") {
      const p = "w01/archive/A16a.jpg";
      return has(p) ? <ClosedStamp photo={p} stampAt={30} credit="Photo: angelo Yap, CC BY 2.0" /> : <Missing what={p} />;
    }
    if (id === "G18") return <EndScreen photo={has("w01/archive/sears.jpg") ? "w01/archive/sears.jpg" : undefined} />;
    const G = GFX[id];
    return G ? <G /> : <Missing what={id} />;
  }
  return <Missing what={k} />;
};

const f = (s: number) => Math.round(s * FPS);

export const W01Edit: React.FC<{ timeline: Timeline }> = ({ timeline }) => {
  const spans = timeline.voiceSpans.map(([a, b]) => [f(a), f(b)] as [number, number]);
  const musicVol = (fr: number) => {
    // duck fast (6 frames) under the voice, come back slowly (20 frames)
    let v = 0.22;
    for (const [a, b] of spans) {
      if (fr >= a - 6 && fr <= b + 20) {
        const d = fr < a ? interpolate(fr, [a - 6, a], [0.22, 0.07]) : fr > b ? interpolate(fr, [b, b + 20], [0.07, 0.22]) : 0.07;
        v = Math.min(v, d);
      }
    }
    return v;
  };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {timeline.video.map((v, i) => (
        <Sequence key={`v${i}`} from={f(v.from)} durationInFrames={Math.max(1, f(v.from + v.dur) - f(v.from))} premountFor={30}>
          <Picture item={v.item} />
        </Sequence>
      ))}
      {timeline.overlays.map((v, i) => (
        <Sequence key={`o${i}`} from={f(v.from)} durationInFrames={f(v.dur)}>
          <SubscribeStub />
        </Sequence>
      ))}
      {timeline.audio.map((a, i) =>
        has(a.src) ? (
          <Sequence key={`a${i}`} from={f(a.from)} durationInFrames={f(a.dur) + 2}>
            <Audio src={staticFile(a.src)} />
          </Sequence>
        ) : null,
      )}
      {has("w01/music/bed.mp3") ? <Audio src={staticFile("w01/music/bed.mp3")} loop volume={musicVol} /> : null}
      {timeline.video.map((v, i) => {
        const id = v.item.id as string | undefined;
        const sfx = id === "G16" ? ["w01/sfx/thud.wav", 30] : id === "G01" || id === "G04" ? ["w01/sfx/printer.wav", 6] : null;
        return sfx && has(sfx[0] as string) ? (
          <Sequence key={`s${i}`} from={f(v.from) + (sfx[1] as number)} durationInFrames={f(v.dur)}>
            <Audio src={staticFile(sfx[0] as string)} volume={0.6} />
          </Sequence>
        ) : null;
      })}
    </AbsoluteFill>
  );
};

export const measure = async (): Promise<Record<string, number>> => {
  const out: Record<string, number> = {};
  for (const it of plan) {
    if (it.audio && has(it.audio)) out[it.audio] = await getAudioDurationInSeconds(staticFile(it.audio));
  }
  return out;
};

const calc: CalculateMetadataFunction<{ timeline: Timeline }> = async () => {
  const timeline = layout(plan, await measure());
  return { durationInFrames: Math.ceil(timeline.total * FPS), props: { timeline } };
};

export const W01EditComposition: React.FC = () => (
  <Composition
    id="W01-Edit"
    component={W01Edit}
    fps={FPS}
    width={1920}
    height={1080}
    durationInFrames={FPS * 60}
    defaultProps={{ timeline: { video: [], overlays: [], audio: [], total: 60, voiceSpans: [] } }}
    calculateMetadata={calc}
  />
);
