# W01 full edit: how to render

The whole video is one Remotion composition, `W01-Edit`. Its order comes from `plan.json` (built from the script),
and its timing from the real length of every voice file, so nothing is placed by hand.

1. Make the narration in ElevenLabs: `higgsfield/W01_2026-11-24_blockbuster/sound/narration_takes.md` (30 takes).
   Put them in one folder with Sam's 15 full takes (`w01_sam_01.mp3` to `w01_sam_15.mp3`).
2. From `production/remotion`:
   ```
   npm install
   npm run w01:fetch -- --audio "C:\path\to\that\folder"
   npm run w01:captions
   npm run w01:render
   ```
   `w01:fetch` downloads the Sam and recreation clips, the archive photos and the music into `public/w01/`
   (not committed). Anything it can't get shows as a "MISSING" frame in the render, so check its last lines.
3. Output: `out/W01_Blockbuster.mp4`, `out/W01_captions.srt`, `out/W01_transcript.txt`.

Optional sound effects, used when present: `public/w01/sfx/thud.wav` (CLOSED stamp), `public/w01/sfx/printer.wav`
(receipts). Music ducks under every voice line automatically.
