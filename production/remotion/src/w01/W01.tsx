import React from "react";
import { Composition, Folder } from "remotion";
import "../lib/theme";
import { Receipt } from "../lib/Receipt";
import { ChapterCard } from "../lib/ChapterCard";
import { ClosedStamp } from "../lib/Stamp";
import { W01DataGraphics } from "./W01Data";

const FPS = 30;
const W = 1920;
const H = 1080;

export const G01 = () => (
  <Receipt
    framesPerLine={9}
    startFrame={6}
    lines={[
      { text: "BLOCKBUSTER VIDEO", align: "center", size: 42, weight: 600, gapAfter: 4 },
      { text: "STORE #0001  DALLAS TX", align: "center", size: 26, gapAfter: 10 },
      { text: "", rule: true },
      { text: "OPENED", right: "1985" },
      { text: "STORES AT PEAK", right: "~9,000" },
      { text: "STORES TODAY", right: "1", weight: 600 },
      { text: "", rule: true },
      { text: "THANK YOU. BE KIND, REWIND.", align: "center", size: 24 },
    ]}
  />
);

export const G04 = () => (
  <Receipt
    framesPerLine={8}
    startFrame={6}
    tearAt={118}
    lines={[
      { text: "BLOCKBUSTER VIDEO", align: "center", size: 42, weight: 600, gapAfter: 10 },
      { text: "", rule: true },
      { text: "RENTAL  1 x VHS", right: "$3.99" },
      { text: "DUE BACK", right: "FRI 12PM" },
      { text: "RETURNED", right: "MON 6PM" },
      { text: "", rule: true },
      { text: "LATE FEE", right: "$4.99", size: 52, weight: 600 },
    ]}
  />
);

export const W01Graphics: React.FC = () => (
  <Folder name="W01-Blockbuster">
    <Composition id="W01-G01-ReceiptIntro" component={G01} durationInFrames={4 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G04-LateFee" component={G04} durationInFrames={5 * FPS} fps={FPS} width={W} height={H} />
    <Composition
      id="W01-G02-Chapter1"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 1, label: "Friday night", question: "Why did everyone love a store they hated?" }}
    />
    <Composition
      id="W01-G05-Chapter2"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 2, label: "The meeting", question: "Why did Blockbuster say no?" }}
    />
    <Composition
      id="W01-G06-Chapter3"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 3, label: "The crack", question: "What was really wrong with Blockbuster?" }}
    />
    <Composition
      id="W01-G09-Chapter4"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 4, label: "The comeback", question: "Did Blockbuster almost beat Netflix?" }}
    />
    <Composition
      id="W01-G11-Chapter5"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 5, label: "The fight", question: "Who actually killed Blockbuster?" }}
    />
    <Composition
      id="W01-G14-Chapter6"
      component={ChapterCard}
      durationInFrames={3 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ number: 6, label: "The last store", question: "Why is one Blockbuster still open?" }}
    />
    <Composition
      id="W01-G16-ClosedStamp"
      component={ClosedStamp}
      durationInFrames={5 * FPS}
      fps={FPS}
      width={W}
      height={H}
      defaultProps={{ photo: "w01/archive/A16a.jpg", stampAt: 30, credit: "Photo: angelo Yap, CC BY 2.0" }}
    />
    <W01DataGraphics />
  </Folder>
);
