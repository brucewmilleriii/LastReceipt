# Last Receipt: production skills

Business-collapse documentaries hosted by Sam Hollis (an AI presenter, disclosed as AI).
This repo holds the Claude skills used to make each video. Any Claude session that opens
this repo picks them up automatically from `.claude/skills/`.

The skills are arranged below as the order a video is actually made in. Each step names
the skill to use, what to ask for, and what comes out. Two skills used here live on your
Claude account rather than in this repo: `last-receipt-packaging` and
`last-receipt-scriptwriter`.

---

## The production workflow

### Step 0. Channel identity (once, then revisit monthly)

| Skill | Ask Claude | You get |
|---|---|---|
| `video-moodboard` | "Build the Last Receipt look bible: warm home study, empty boardroom, one story location per video." | A moodboard of numbers (Kelvin, lens mm, palette hex, film stock, fonts) that Seedance and image models follow. Prove it on stills before spending video credits. |
| `character-passport` | "Write Sam Hollis's passport: wardrobe, props, six expressions, voice line." | Continuity notes for Sam. **His face comes from the Higgsfield Element, never from a written description**, so use the passport for wardrobe, expressions, props and voice only. |
| `impeccable` | "/impeccable init" then "/impeccable document" | `PRODUCT.md` and `DESIGN.md`: the channel's design system (type, colour, red CLOSED stamp) that every graphic and thumbnail is checked against. |

### Step 1. Research and references (per video)

| Skill | Ask Claude | You get |
|---|---|---|
| `find-references` | "Find real references for the Sears episode: archive photos, store interiors, 1990s catalog type." | A reference pack of real, human-made images with who made them. This is the strongest guard against the AI look. |
| `video-asset-sources` | "Find licensed B-roll, archival footage and music for this episode." | Sources that are legal to use on a monetized channel (archive.org, Wikimedia, LOC, Pathé, CC0 music) with the license for each. |

### Step 2. Packaging before scripting

| Skill | Ask Claude | You get |
|---|---|---|
| `last-receipt-packaging` (account) | "Package the Sears episode." | Titles, thumbnail concepts and a description, decided before the script is written. |

### Step 3. Script

| Skill | Ask Claude | You get |
|---|---|---|
| `last-receipt-scriptwriter` (account) | "Write the Sears script in Sam's voice." | The full script. |
| `video-script` | "Run the video-script check on this script." | A beat table (time, line, on-screen text, visual, sound) and a check for hook timing, pace, unsourced numbers and AI-sounding lines. |

### Step 4. Voice and sound

| Skill | Ask Claude | You get |
|---|---|---|
| `video-sound` | "Direct Sam's narration for this script and plan the music and SFX." | Narration written for the ear (pauses, breaths), ElevenLabs tags, a music plan with a quiet part, and mix levels. Sam's voice is the saved ElevenLabs voice at speed about 1.05 to 1.08. |

### Step 5. Thumbnail

| Skill | Ask Claude | You get |
|---|---|---|
| `canvas-design` | "Design thumbnail concept 2 at 1280x720." | A composed thumbnail as a PNG or PDF. |
| `impeccable` | "/impeccable critique this thumbnail" | A ranked list of what makes it read as generic or AI-made, and what to fix first. |

Then score the finalists with the vidIQ connector (`score_thumbnail`) before upload.

### Step 6. Sam on camera

Generate Sam's clips in Higgsfield Seedance with his Element and the ElevenLabs audio
(never Seedance's own voice). Use the `character-passport` notes and the `video-moodboard`
sets for every prompt. No microphone, no screens, no on-screen text in the frame.

### Step 7. On-screen graphics (built in code with Remotion)

| Skill | Ask Claude | You get |
|---|---|---|
| `remotion-best-practices` | "Set up a Remotion project for Last Receipt graphics." | The project and the rules for building video in React. |
| `title-design` | "Make the chapter cards and a lower third for 'Sears, 1893 to 2018'." | Lower thirds, chapter cards and the channel bumper, with safe areas and hold times. |
| `maps-and-data-motion` | "Animate Sears store count from 3,500 to 15, and a map of closures." | Count-ups, falling line charts, versus timelines and map dives. This is the channel's signature graphic. |

### Step 8. Edit and assembly

| Skill | Ask Claude | You get |
|---|---|---|
| `edit-footage-with-code` | "Assemble the cut from the narration, Sam clips and B-roll." | An edit list you can review, with graphics placed on the spoken word. |
| `varg-video-edit-library` | "Add a J-cut into the verdict and a slow push on the store photo." | Named edits (J-cut, match cut, speed ramp, push-ins) built in FFmpeg or Remotion. |
| `caption-styles` | "Add subtle captions for the long-form cut." | Caption presets with exact fonts, sizes and timing. |

### Step 9. Quality check (before every upload)

| Skill | Ask Claude | You get |
|---|---|---|
| `media-judge` | "Judge the final render." | Timestamped defects: broken frames, banding after YouTube compression, jittery numbers, spelling, a face or outfit that drifts. |
| `impeccable` | "/impeccable audit the graphics" | A check of the graphics against the design system. |

### Step 10. Shorts and other platforms

| Skill | Ask Claude | You get |
|---|---|---|
| `short-form-ffmpeg-cookbook` | "Cut three 9:16 Shorts from the Sears episode." | 1080x1920 MP4s with burned-in captions and music ducked under the voice. |
| `caption-styles` | "Use the active-word pop preset for the Shorts." | Short-form caption styling. |
| `social` | "Write the TikTok and Instagram captions for these Shorts." | Platform posts without AI tells. |

---

## Skills in this repo

| Skill | Source | License | Use on this channel |
|---|---|---|---|
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) @ b4bff16 | Apache-2.0 | Design system, critique and anti-slop audit for thumbnails and graphics |
| `canvas-design` | [anthropics/skills](https://github.com/anthropics/skills) @ 2c5958e | Apache-2.0 | Thumbnails, title cards, posters |
| `remotion-best-practices` | [remotion-dev/skills](https://github.com/remotion-dev/skills) @ 7e541aa | Remotion License (free for individuals and companies of up to 3 people) | Building graphics and edits in code |
| `find-references` | [vargHQ/skills](https://github.com/vargHQ/skills) @ 87bae24 | MIT | Real, human-made references |
| `video-asset-sources` | vargHQ/skills | MIT | Licensed B-roll, archive footage, music |
| `video-moodboard` | vargHQ/skills | MIT | Look bible for Sam's sets |
| `character-passport` | vargHQ/skills | MIT | Sam's continuity (not his face) |
| `video-script` | vargHQ/skills | MIT | Script beat table and AI-line check |
| `video-sound` | vargHQ/skills | MIT | Voice direction, music, SFX, mix |
| `title-design` | vargHQ/skills | MIT | Lower thirds, chapter cards, bumper |
| `maps-and-data-motion` | vargHQ/skills | MIT | Charts, count-ups, maps |
| `edit-footage-with-code` | vargHQ/skills | MIT | Assembly edit |
| `varg-video-edit-library` | vargHQ/skills | MIT | Named edit techniques |
| `caption-styles` | vargHQ/skills | MIT | Captions for long-form and Shorts |
| `media-judge` | vargHQ/skills | MIT | Final render QA |
| `short-form-ffmpeg-cookbook` | vargHQ/skills | MIT | Shorts, Reels, TikTok exports |
| `social` | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) @ 1f83744 | MIT | Captions and posts for other platforms |

License texts are in [`licenses/`](licenses/).

**About the vargHQ skills.** They mention varg's paid cloud service as one way to run
them. We do not use it. Everything runs locally with FFmpeg and Remotion, and AI
generation goes through Higgsfield and ElevenLabs, which are already connected.
Two varg skills were left out because they only work with that service.

**Safety review.** Every SKILL.md and reference file was scanned for prompt injection
and hidden characters before being added, and the scripts were checked for where they
connect (only public archives and image libraries). Nothing was run.

## Recommended but not installed

- **Frontend Design** and **Superdesign**: already enabled on your Claude account.
- [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) (Apache-2.0): an
  HTML-based alternative to Remotion. Worth adding only if Remotion feels heavy.
- [heygen-com/skills](https://github.com/heygen-com/skills) (MIT): HeyGen avatar video.
  Not needed while Sam is made in Higgsfield.
- varg `kinetic-type-art`: bold animated type. Too loud for this channel's tone, but
  good for a channel trailer.
- Anthropic `theme-factory` and `algorithmic-art`: colour themes and generative
  textures, if channel art needs them.

## Updating a skill

Copy the skill's folder again from its source repo at a newer commit, update the commit
in the table above, and review the diff before merging.
