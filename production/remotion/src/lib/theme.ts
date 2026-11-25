import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Last Receipt look: thermal paper, faded ink, one red for verdicts.
export const C = {
  paper: "#EDE8DC",
  paperShade: "#D9D2C2",
  ink: "#2A2622",
  inkFaded: "#5E574E",
  night: "#0F0E0C",
  warm: "#2A1F14",
  red: "#A8261C",
  cream: "#F3EEE3",
};

export const MONO = "Plex Mono";
export const SERIF = "Source Serif";

const fonts: [string, string, string][] = [
  [MONO, "fonts/ibm-plex-mono-latin-400-normal.woff2", "400"],
  [MONO, "fonts/ibm-plex-mono-latin-500-normal.woff2", "500"],
  [MONO, "fonts/ibm-plex-mono-latin-600-normal.woff2", "600"],
  [SERIF, "fonts/source-serif-4-latin-400-normal.woff2", "400"],
  [SERIF, "fonts/source-serif-4-latin-600-normal.woff2", "600"],
];
for (const [family, file, weight] of fonts) {
  loadFont({ family, url: staticFile(file), weight });
}
