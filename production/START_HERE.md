# Last Receipt: Higgsfield free week pack

Everything for Nov 24, 2026 to Mar 19, 2027: 17 Tuesday documentaries, 1 Friday reserve, and 85 Shorts. Every prompt is written out, named and ready to paste. Nothing has been generated yet.

## What's in this folder

| File or folder | What it is |
|---|---|
| `00_START_HERE.md` | This page: the free-week day plan, the order of work and the realism checklist |
| `00_long_form_calendar.csv` | The 17 Tuesdays plus the reserve: date, title, search phrase, clip counts, folder |
| `00_shorts_calendar.csv` | All 85 Shorts, Monday to Friday at 12:00 ET |
| `00_shared_sets.md` | The two sets that appear in every video (study, boardroom). Make these first |
| `W01_...` to `W17_...`, `R01_...` | One folder per documentary (see below) |
| `SHORTS/` | Prompts and voice-over scripts for all 85 Shorts, plus Sam's five closing clips |

Inside every documentary folder:

| File | Use it for |
|---|---|
| `script.md` | The full script with packaging (titles, thumbnails, description) and the fact-check list |
| `1_elevenlabs_sam_lines.csv` | Every line Sam says on camera, with the file name to save the audio as |
| `2_higgsfield_prompts.md` | Step A stills, Step B Sam clips, Step C recreation clips. Copy and paste from here |
| `2_higgsfield_prompts.csv` | The same prompts as one table, if you prefer a spreadsheet |
| `4_archive_and_graphics.md` | Real archive photos and footage to find (with search links), and the graphics to build in Remotion |
| `credits.csv` | Empty license log. Fill one row for every archive item you use |

## The order of work for each clip

1. **Sam's audio first (ElevenLabs).** Voice "Sam Hollis", speed 1.06, stability about 0.45, similarity about 0.80, style about 0.15. One file per row of `1_elevenlabs_sam_lines.csv`, saved under the name in the first column. Read each line before you generate it: if it states a number, check it against the fact-check list in `script.md`, because changing it later means regenerating the clip.
2. **Stills (Step A).** Nano Banana Pro at 2K (it's on the unlimited list). Generate 2 to 4 options of each and keep the most real-looking one. The still decides the look; a clip can't fix a bad still.
3. **Clips (Step B and C).** Seedance 2.0, std mode, 1080p. Start image = the kept still. For Sam, also attach the ElevenLabs file as the audio reference. Turn native audio off where the toggle exists; real sound is added in the edit.
4. **Save with the exact name** shown in bold (for example `w03_rec_06.mp4`), into a folder named like the documentary folder. The editor matches files by name.

Seedance takes audio up to 15 seconds, so no Sam line is longer than that. If a take drifts in the last seconds, cut it in the edit rather than regenerating.

## Free week day plan (Nov 17 to 23)

There are about 448 documentary clips and 141 Shorts clips, roughly 80 to 90 a day. Do the documentaries in release order, so the earliest uploads are safest.

| Day | Work | About |
|---|---|---|
| Mon Nov 17 | All Sam audio in ElevenLabs. `00_shared_sets.md` plates. Every Sam still (study, boardroom, location) for all videos. Shorts Sam still and 5 closers. Then W01 Blockbuster in full as the test run | 60 stills, 35 clips |
| Tue Nov 18 | W02 Sears, W03 Toys R Us, W04 Kmart | 70 clips |
| Wed Nov 19 | W05 Circuit City, W06 closings list, W07 BlackBerry, W08 Pan Am | 95 clips |
| Thu Nov 20 | W09 Enron, W10 Kodak, W11 Lego, W12 closings so far | 90 clips |
| Fri Nov 21 | W13 RadioShack, W14 Borders, W15 Nokia, W16 Big Lots | 90 clips |
| Sat Nov 22 | W17 1985 Sears walkthrough (31 clips) and R01 Bed Bath & Beyond. Shorts weeks 1 to 8 | 110 clips |
| Sun Nov 23 | Shorts weeks 9 to 17. Retakes of anything that failed the checklist | 70 clips |

If Higgsfield lets you queue several at once, queue a whole video's Step C, then review the batch together.

## Realism checklist (Rule #1: it must not look like AI)

Reject the take and regenerate if you see any of these. Check the still before you animate it, and the clip at 0s, 3s and the last second.

- Skin that looks waxy, plastic or airbrushed; no pores; perfectly even teeth
- Perfect symmetry in faces, rooms or crowds
- Hands with the wrong number of fingers, melted objects, garbled text or logos
- Motion that drifts in slow motion, floats, or keeps moving after the action ends
- Sam's face, glasses, beard, bow tie, pocket square or suit changing between clips
- Light that changes direction between Sam's clips in the same set
- Colours that are glossy and over-saturated compared with the era's film look
- A microphone, a screen, or any on-screen text in Sam's frame
- A real public figure (CEO, founder) with a recognisable generated face. They appear only from behind, in silhouette or out of focus; real photos of them come from the archive

## Archive first

Every documentary has an `4_archive_and_graphics.md` list of real photos and footage to find. Real material beats generated material, so use it wherever the script calls for it, and keep the recreations for gaps. Record the source and license of every item in `credits.csv`; the channel can only use material whose license allows a monetized channel.

## Labels and disclosure

Recreation clips get a small "Recreation" label in a lower corner in the edit, as documentaries do. When uploading, tick YouTube's "altered or synthetic content" box, and keep the AI-host line in every description: "Sam is an AI-presented host. The research, writing and editing are done by real people."

## Script lengths

The narration runs about 11 to 16 minutes per documentary before archive pauses, music beats and the end screen, which usually add a minute or two. W17 is a slow walkthrough with room for ambient sound between lines. Narration over archive and graphics needs no Higgsfield work, so it can still be edited after the free week.

## Two scripts are frames, not finished

W06 (Dec 29) and W12 (Feb 9) are news roundups. Sam's lines and every clip are generic and safe to make now; the store names are written in the weeks before upload. The fact-check list in every script still needs doing before upload: the scripts were written from memory.
