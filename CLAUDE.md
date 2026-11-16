# Last Receipt

YouTube channel of business-collapse documentaries hosted by Sam Hollis, an AI presenter
disclosed as AI.

## Rule #1: it must not look like AI

This is the most important rule on the channel and it outranks speed, cost and
convenience. Every frame, voice line, graphic and thumbnail should look as realistic
as possible: real light, real textures, real places, real archive material.

- Before making anything, gather real references (`find-references`) and lock the look
  in numbers (`video-moodboard`). Never prompt with vague words like "cinematic".
- Prefer real, licensed archive photos and footage over generated images wherever the
  story allows. Generate only what cannot be sourced (Sam and his sets).
- Watch for AI tells and reject the take: plastic or waxy skin, perfect symmetry,
  over-smooth motion, slow-motion drift, garbled text or hands, glossy over-saturated
  colour, a face, outfit or light that changes between shots.
- Narration must sound like a person: pauses, breaths, uneven rhythm (`video-sound`).
  Scripts get the AI-sounding-line check in `video-script`.
- Graphics and thumbnails must not look like templates (`impeccable critique`).
- Every render passes `media-judge` before upload. If something looks AI-made, redo it
  rather than ship it.

## How to work in this repo

- Follow the production workflow in `README.md`. Use the skill it names for each step.
- Sam's face comes from his Higgsfield Element. Never describe his face in a prompt.
- Sam's voice is the saved ElevenLabs voice "Sam Hollis" at speed about 1.05 to 1.08.
  Feed that audio to Seedance; never use Seedance's native voice.
- Sets: warm home study (storytelling), empty boardroom (verdict), plus one
  story-specific location per video. No microphone, no screens, no on-screen text in
  generated frames. The verdict is a red CLOSED stamp.
- The vargHQ skills mention varg's paid cloud service. Do not use it or ask for a
  VARG_API_KEY. Run them locally with FFmpeg and Remotion.
- Only use footage, music and images with a license that allows a monetized channel.
  `video-asset-sources` records the license for each source; keep that record.
