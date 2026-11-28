import React from "react";
import { Composition } from "remotion";
import { C } from "../lib/theme";
import { Sheet } from "../lib/Sheet";
import { DebtBars, LineChart, Series } from "../lib/Charts";
import { StoreMap } from "../lib/StoreMap";
import { EndScreen, SubscribeStub, TugOfWar } from "../lib/Misc";

// Every number below is sourced in higgsfield/W01_2026-11-24_blockbuster/7_graphics_facts.md
const FPS = 30;
const W = 1920;
const H = 1080;

const MAP_SRC = "Illustration: dots are not exact store sites. Map: US Census Bureau via us-atlas.";

export const G03 = () => (
  <Sheet id="g03" kicker="1985 to 1994" title="One store in Dallas, then everywhere" source={MAP_SRC}>
    <StoreMap mode="spread" years={[1985, 1994]} run={[20, 160]} />
  </Sheet>
);

export const G15 = () => (
  <Sheet id="g15" kicker="2004 to 2019" title="Thousands of stores, then one" source={MAP_SRC}>
    <StoreMap mode="shrink" years={[2004, 2019]} run={[20, 170]} />
  </Sheet>
);

export const G07 = () => (
  <Sheet
    id="g07"
    kicker="Share of US homes"
    title="Homes with a DVD player"
    source="Sources: Nielsen Media Research (1999, 2006); VSDA via FCC media ownership study, 2006 (2000, 2004)."
  >
    <LineChart
      x={[1998.6, 2007.2]}
      y={[0, 100]}
      drawFrames={[22, 120]}
      xTicks={[1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006].map((v) => ({ v, label: String(v) }))}
      yTicks={[0, 25, 50, 75, 100].map((v) => ({ v, label: v === 100 ? "100%" : String(v) }))}
      series={[
        {
          name: "",
          color: C.blueInk,
          width: 6,
          points: [
            [1999, 6.7],
            [2000, 8.8],
            [2004, 73],
            [2006.75, 81.2],
          ],
          endLabel: "81%",
        },
      ]}
      notes={[
        { x: 2000, y: 8.8, text: "2000: 9%", at: 46, dx: 40, dy: -110, color: C.red },
        { x: 2004, y: 73, text: "73%", at: 100, dx: -70, dy: -40 },
      ]}
    />
  </Sheet>
);

export const G08 = () => (
  <Sheet
    id="g08"
    kicker="Long-term debt, year end"
    title="Out of Viacom, into debt"
    source="Source: Blockbuster Inc. 10-K for 2007 (SEC EDGAR); Viacom and Blockbuster press release, June 2004."
  >
    <DebtBars
      max={1200}
      bars={[
        { label: "2003", value: 75.1, at: 20, display: (v) => `$${Math.round(v)}M` },
        {
          label: "2004",
          value: 1119.7,
          at: 44,
          accent: true,
          display: (v) => (v >= 1000 ? `$${(v / 1000).toFixed(2)}B` : `$${Math.round(v)}M`),
        },
      ]}
      note={{ text: "It borrowed to pay a $905 million one-time dividend on the way out, mostly to Viacom.", at: 80 }}
    />
  </Sheet>
);

// Quarter ends: Dec 2006 = 2007.0, then +0.25 a quarter.
const NETFLIX: Series["points"] = [
  [2007.0, 6.316],
  [2007.25, 6.797],
  [2007.5, 6.742],
  [2007.75, 7.028],
  [2008.0, 7.479],
];
const BBO: Series["points"] = [
  [2007.0, 2.2],
  [2007.25, 3.0],
  [2007.5, 3.6],
  [2007.75, 3.1],
];
const subsTicks = [
  { v: 2007.0, label: "DEC 06" },
  { v: 2007.25, label: "MAR 07" },
  { v: 2007.5, label: "JUN 07" },
  { v: 2007.75, label: "SEP 07" },
  { v: 2008.0, label: "DEC 07" },
];
const subsY = [0, 2, 4, 6, 8].map((v) => ({ v, label: v === 8 ? "8M" : String(v) }));
const SUBS_SRC = "Sources: Netflix and Blockbuster SEC filings; Forbes, Jul 2007; AP, 2007. Subscribers at quarter end.";

export const G10 = () => (
  <Sheet id="g10" kicker="Subscribers, millions" title="Blockbuster Online closes in" source={SUBS_SRC}>
    <LineChart
      x={[2006.95, 2008.4]}
      y={[0, 8]}
      xFrom={2007.0}
      xTo={2007.5}
      drawFrames={[22, 120]}
      xTicks={subsTicks}
      yTicks={subsY}
      series={[
        { name: "Netflix", color: C.inkFaded, width: 3, points: NETFLIX.slice(0, 3) },
        { name: "Blockbuster Online", color: C.blueInk, width: 6, points: BBO.slice(0, 3) },
      ]}
      notes={[{ x: 2007.5, y: 6.742, text: "−55,000", at: 128, dx: 0, dy: -60, color: C.red }]}
    />
  </Sheet>
);

export const G13 = () => (
  <Sheet id="g13" kicker="Subscribers, millions" title="Then the lines split" source={SUBS_SRC}>
    <LineChart
      x={[2006.95, 2008.4]}
      y={[0, 8]}
      xFrom={2007.5}
      xTo={2008.0}
      drawFrames={[22, 120]}
      xTicks={subsTicks}
      yTicks={subsY}
      series={[
        { name: "Netflix", color: C.inkFaded, width: 3, points: NETFLIX, endLabel: "7.5M" },
        { name: "Blockbuster Online", color: C.blueInk, width: 6, points: BBO, endLabel: "3.1M" },
      ]}
    />
  </Sheet>
);

export const G12 = () => (
  <Sheet id="g12" kicker="2005 to 2007" title="One company, two plans" source="">
    <TugOfWar />
  </Sheet>
);

export const W01DataGraphics: React.FC = () => (
  <>
    <Composition id="W01-G03-MapSpread" component={G03} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G07-DvdHomes" component={G07} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G08-Debt" component={G08} durationInFrames={5 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G10-SubsRace" component={G10} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G12-TugOfWar" component={G12} durationInFrames={5 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G13-SubsSplit" component={G13} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G15-MapShrink" component={G15} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G17-Subscribe" component={SubscribeStub} durationInFrames={5 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="W01-G18-EndScreen" component={EndScreen} durationInFrames={20 * FPS} fps={FPS} width={W} height={H} defaultProps={{}} />
  </>
);
