#!/usr/bin/env python3
"""Build Higgsfield upload packs from Last Receipt scripts.

Each script in production/scripts/*.md uses four kinds of marked lines:

  SAM (study|boardroom|location) {small action}: Spoken on-camera line.
  [REC 03 | 1990s | what the start frame shows | what moves in the clip | 6]
  [ARCHIVE: what to find | search words]
  [GFX: graphic built in Remotion]

Everything else is narration (Sam's voice over pictures) or an edit note.

Run:  python3 production/tools/build.py
Out:  production/higgsfield/<video>/ plus production/higgsfield/00_*.md|csv
"""
import csv
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
OUT = ROOT / "higgsfield"

SAM_UI = "@Sam-Hollis"
SAM_ID = "<<<41a6306d-4ac8-488b-918f-36faafe6afb9>>>"
WPM = 155  # Sam at ElevenLabs speed 1.06 reads about 150-160 words a minute

SETS = {
    "study": (
        "a warm home study at dusk: dark walnut desk, floor-to-ceiling shelves of worn cloth "
        "hardbacks 2.5 m behind him, a green-shaded brass banker's lamp on the desk at frame left. "
        "Light: one soft key from a window camera-left at 45 degrees, 3200 K tungsten interior, "
        "cool 5600 K dusk spill on the far shelves, face 1.5 stops brighter than the background, "
        "shadow side camera-right. Lens: 50 mm at f/2, camera at seated eye height (1.2 m), "
        "medium close-up, eyes on the upper third, Sam 10% right of centre"
    ),
    "boardroom": (
        "an empty corporate boardroom at dusk: long dark oak table for 14, empty brown leather "
        "chairs pushed in, floor-to-ceiling windows camera-right showing an overcast city at dusk. "
        "Light: the windows are the only key, soft 5600 K from camera-right at 60 degrees, ceiling "
        "lights off, two warm 3000 K wall sconces at low level deep in the background, face falls "
        "into shadow camera-left. Lens: 35 mm at f/2.8, camera at standing eye height (1.6 m) from "
        "the far end of the table, Sam standing at the head of the table, 30% of frame height"
    ),
}
SET_SHORT = {
    "study": "sits at his walnut desk in the warm home study, banker's lamp at frame left",
    "boardroom": "stands at the head of the long oak table in the empty boardroom at dusk",
    "location": "stands in the story location",
}
TEXTURE = (
    "Shot on ARRI Alexa 35 with Kodak 2383 print emulation, fine 35 mm grain, slight halation on "
    "practical lights, natural skin texture with pores and fine lines, no retouching"
)
SAM_NEVER = "No microphone, no screens, no on-screen text, no logos, no other people"

ERAS = {
    "1890s": "1890s to 1910s glass-plate photograph look turned to motion: black and white, orthochromatic tones (dark reds, bright skies), soft corners, light gate weave, daylight 5600 K, overcast",
    "1900s": "1900s to 1910s black-and-white motion-picture look: orthochromatic tones, slight flicker and gate weave, soft corners, available daylight 5600 K through skylights or windows",
    "1920s": "1920s 35 mm black-and-white newsreel look, Kodak nitrate tones, slight flicker, soft focus, deep blacks, available daylight",
    "1930s": "1930s 35 mm black-and-white newsreel, Plus-X look, mild flicker and dust, available light",
    "1950s": "1950s 16 mm Kodachrome home-movie look: warm saturated reds and blues, fine grain, slightly soft lens, bright daylight 5600 K",
    "1960s": "1960s 16 mm Kodachrome look: warm saturated colour, fine grain, slight vignetting, daylight 5600 K",
    "1970s": "1970s 16 mm Ektachrome TV-news film look: faded warm cast, visible grain, slightly soft focus, mixed tungsten 3200 K and fluorescent green-tinted 4000 K light",
    "1980s": "1980s Betacam SP TV-news video look: slight chroma bleed, soft detail, warm tungsten 3200 K interiors, flat fluorescent 4000 K in stores and offices",
    "1990s": "1990s Hi8 consumer camcorder look: slight softness, auto-exposure breathing, magenta-leaning skin, overhead fluorescent 4000 K or tungsten 3200 K",
    "2000s": "early-2000s miniDV camcorder look: standard-definition softness, slightly blown highlights, cool fluorescent 4200 K interiors",
    "2010s": "2010s DSLR documentary look: 35 mm lens, natural mixed light, LED and fluorescent 4000 K, mild grain",
    "2020s": "2020s handheld smartphone video look: natural available light, slight rolling shutter, true-to-life colour",
    "modern": "present-day documentary look: ARRI Alexa 35, 35 mm lens at f/2.8, Kodak 2383 print emulation, natural available light, fine grain",
}
REC_RULES = (
    "Unposed, like real archival footage: people mid-action, nobody looking at the camera, imperfect "
    "framing. Real public figures only from behind, in silhouette or out of focus. No text, no logos, "
    "no readable signs or labels"
)
MOTION_RULES = (
    "Real-time speed, no slow motion. Keep every face, outfit, object and light exactly as in the "
    "start frame. One camera move only, as written. No text, no logos"
)

SAM_RE = re.compile(r"^SAM \((study|boardroom|location)\)\s*(?:\{(.+?)\})?\s*:\s*(.+)$")
REC_RE = re.compile(r"^\[REC (\d+) \| ([^|]+?) \| ([^|]+?) \| ([^|\]]+?)(?: \| (\d+))?\]$")
ARC_RE = re.compile(r"^\[ARCHIVE: ([^|]+?) \| ([^\]]+?)\]$")
GFX_RE = re.compile(r"^\[GFX: (.+)\]$")


def front_matter(text):
    m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    meta = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                meta[k.strip()] = v.strip().strip('"')
        text = text[m.end():]
    return meta, text


def search_links(q):
    e = urllib.parse.quote_plus(q)
    return (
        f"[Commons](https://commons.wikimedia.org/w/index.php?search={e}&title=Special:MediaSearch&type=image) · "
        f"[LOC](https://www.loc.gov/search/?q={e}&fa=online-format:image) · "
        f"[archive.org](https://archive.org/search?query={e}) · "
        f"[Openverse](https://openverse.org/search/?q={e})"
    )


def parse(path):
    meta, body = front_matter(path.read_text(encoding="utf-8"))
    sams, recs, arcs, gfx = [], [], [], []
    words = 0
    problems = []
    for raw in body.splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or line.startswith("|") or line.startswith(">"):
            continue
        if m := SAM_RE.match(line):
            setname, action, spoken = m.groups()
            spoken = spoken.strip().strip('"')
            n = len(spoken.split())
            words += n
            sid = f"{meta['id']}_sam_{len(sams)+1:02d}"
            secs = round(n / WPM * 60 + 0.8, 1)
            if secs > 15:
                problems.append(f"{sid} is about {secs}s; Seedance audio max is 15s. Split it.")
            sams.append(dict(id=sid, set=setname, action=(action or "talks to camera, one small hand gesture on the key word"), text=spoken, words=n, secs=secs))
            continue
        if m := REC_RE.match(line):
            num, era, scene, motion, dur = m.groups()
            era = era.strip()
            if era not in ERAS:
                problems.append(f"REC {num}: unknown era '{era}'")
            recs.append(dict(id=f"{meta['id']}_rec_{int(num):02d}", era=era, scene=scene.strip(), motion=motion.strip(), dur=int(dur or 6)))
            continue
        if m := ARC_RE.match(line):
            arcs.append(dict(desc=m.group(1).strip(), q=m.group(2).strip()))
            continue
        if m := GFX_RE.match(line):
            gfx.append(m.group(1).strip())
            continue
        if line.startswith("["):
            continue
        words += len(line.split())
    return meta, body, sams, recs, arcs, gfx, words, problems


def sam_still_prompt(meta, setname):
    where = SETS.get(setname) or (
        f"{meta['location']}. Light: natural available light from the existing windows or one practical, "
        f"one source family, soft, face 1 stop brighter than the background. Lens: 35 mm at f/2.8, "
        f"camera at standing eye height (1.6 m), medium shot, Sam 30% of frame height, left third"
    )
    pose = {"study": "seated, forearms resting on the desk, hands relaxed", "boardroom": "standing, one hand resting on the back of a leather chair"}.get(setname, "standing, hands relaxed at his sides")
    return f"{SAM_UI} in {where}. He is {pose}, looking into the lens, neutral warm expression, mouth closed. {TEXTURE}. {SAM_NEVER}."


def sam_clip_prompt(s):
    return (
        f"{SAM_UI} {SET_SHORT[s['set']]}, speaking directly to camera in sync with the attached audio. "
        f"{s['action'][0].upper() + s['action'][1:]}. Natural blinks, small unplanned head movements, breathing visible in the shoulders, "
        f"lips match every syllable. Camera locked off on a tripod, no movement. {MOTION_RULES}. {SAM_NEVER}."
    )


def rec_still_prompt(r):
    return f"{r['scene']}. {ERAS.get(r['era'], ERAS['modern'])}. {REC_RULES}. 16:9."


def rec_clip_prompt(r):
    return f"{r['motion']}. {MOTION_RULES}."


def build_video(path, calendar_rows):
    meta, body, sams, recs, arcs, gfx, words, problems = parse(path)
    vid = meta["id"]
    folder = OUT / f"{vid.upper()}_{meta['date']}_{meta['slug']}"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "script.md").write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    mins = round(words / WPM, 1)
    sam_words = sum(s["words"] for s in sams)
    sets_used = sorted({s["set"] for s in sams}, key=["study", "location", "boardroom"].index)

    # 1. ElevenLabs lines
    with open(folder / "1_elevenlabs_sam_lines.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["save_as", "set", "seconds_est", "text"])
        for s in sams:
            w.writerow([s["id"] + ".mp3", s["set"], s["secs"], s["text"]])

    # 2+3. Higgsfield prompts
    rows = []
    md = [f"# {meta['title']}: Higgsfield prompts", "",
          f"Publish {meta['date']} · about {mins} min · {len(sams)} Sam clips · {len(recs)} recreation clips · {len(arcs)} archive items to source.", "",
          "Work top to bottom. Every prompt below is ready to paste. Save each result under the name in bold so the editor can find it.", "",
          "**Step A, stills (image model: Nano Banana Pro or Seedream 4.5, 16:9, 2K).** These are the start frames. Approve each still against the realism checklist in `00_START_HERE.md` before animating it; a still costs far less than a clip.", ""]
    for st in sets_used:
        sid = f"{vid}_still_sam_{st}"
        p = sam_still_prompt(meta, st)
        if st != "location":
            p += f" Attach `shared/set_{st}.png` as an image reference so the set matches every video."
        md += [f"**{sid}.png**", "", "```", p, "```", ""]
        rows.append([sid, "image", "Nano Banana Pro", "16:9", "", "", "", p])
    for r in recs:
        sid = r["id"].replace("_rec_", "_still_rec_")
        p = rec_still_prompt(r)
        md += [f"**{sid}.png** ({r['era']})", "", "```", p, "```", ""]
        rows.append([sid, "image", "Nano Banana Pro", "16:9", "", "", "", p])
    md += ["", "**Step B, Sam clips (Seedance 2.0, 16:9, 1080p, mode std).** Start image = the Sam still for that set. Audio reference = the ElevenLabs file with the same name. Turn native audio off if the toggle is shown; the ElevenLabs file is laid back over the clip in the edit either way.", ""]
    for s in sams:
        p = sam_clip_prompt(s)
        dur = max(4, min(15, int(s["secs"] + 1.5)))
        md += [f"**{s['id']}.mp4** · {dur}s · start `{vid}_still_sam_{s['set']}.png` · audio `{s['id']}.mp3`", "",
               f"> {s['text']}", "", "```", p, "```", ""]
        rows.append([s["id"], "video", "Seedance 2.0", "16:9", dur, f"{vid}_still_sam_{s['set']}.png", s["id"] + ".mp3", p])
    md += ["", "**Step C, recreation clips (Seedance 2.0, 16:9, 1080p, audio off).** Start image = the still with the same number. Write only the motion; the still carries the look.", ""]
    for r in recs:
        p = rec_clip_prompt(r)
        st = r["id"].replace("_rec_", "_still_rec_") + ".png"
        md += [f"**{r['id']}.mp4** · {r['dur']}s · start `{st}`", "", "```", p, "```", ""]
        rows.append([r["id"], "video", "Seedance 2.0", "16:9", r["dur"], st, "", p])
    (folder / "2_higgsfield_prompts.md").write_text("\n".join(md), encoding="utf-8")
    with open(folder / "2_higgsfield_prompts.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["save_as", "type", "model", "aspect", "seconds", "start_image", "audio", "prompt"])
        w.writerows(rows)

    # 4. Archive list
    am = [f"# {meta['title']}: real archive to source", "",
          "Real photos and footage beat anything generated (Rule #1). Find each item, check the license allows a monetized channel, and log it in `credits.csv` (source URL, author, license). Public domain, CC0, CC BY and CC BY-SA are fine with credit; US federal government works (SEC filings, NARA, NASA) are public domain. TV news clips and press photos need a license or a clear fair-use reason (short, commented on, transformed); prefer the free sources first.", "",
          "| # | What to find | Search links |", "|---|---|---|"]
    for i, a in enumerate(arcs, 1):
        am.append(f"| A{i:02d} | {a['desc']} | {search_links(a['q'])} |")
    am += ["", "## Graphics to build in Remotion (no AI)", ""] + [f"- {g}" for g in gfx]
    (folder / "4_archive_and_graphics.md").write_text("\n".join(am), encoding="utf-8")
    with open(folder / "credits.csv", "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(["item", "file", "source_url", "author", "license", "notes"])

    report = [f"{vid}: {meta['title']} | {words} words, ~{mins} min | Sam {len(sams)} clips ({round(sam_words / max(words,1) * 100)}% on camera) | REC {len(recs)} | ARCHIVE {len(arcs)} | GFX {len(gfx)}"]
    report += ["   ! " + p for p in problems]
    calendar_rows.append(dict(id=vid, date=meta["date"], title=meta["title"], search=meta.get("search", ""), mins=mins,
                              sam=len(sams), rec=len(recs), arc=len(arcs), folder=folder.name, status=meta.get("status", "script ready")))
    return report


def write_shared_sets():
    """Empty set plates made once and attached to every study/boardroom still, so the room never changes."""
    lines = ["# Shared sets: make these first", "",
             "Two empty rooms that Sam appears in across every video. Generate each once (Nano Banana Pro, 2K, 16:9), "
             "make 4 options, keep the most real-looking one and save it under the name in bold. Every Sam still in the study "
             "or boardroom attaches this plate as a reference, so the room, props and light stay identical from week to week.", ""]
    for name, desc in SETS.items():
        room = desc.split(". Lens:")[0].replace(" behind him", " behind the desk").replace(", shadow side camera-right", "").replace(", face 1.5 stops brighter than the background", "").replace(", face falls into shadow camera-left", "")
        lens = desc.split(". Lens:")[1].split(", Sam")[0].split(", medium close-up")[0]
        prompt = (f"Empty plate, no people: {room}. Lens:{lens}, framed so a person can later be placed "
                  f"{'seated behind the desk, slightly right of centre' if name == 'study' else 'standing at the head of the table'}. "
                  f"{TEXTURE.split(', natural skin')[0]}. "
                  + ("Real wear: scuffs on the desk edge, uneven book spines, dust in the lamp light. " if name == "study"
                     else "Real wear: faint rings and scratches on the table, chairs slightly out of line, smudges on the glass. ")
                  + "No text, no logos, no screens, no microphone. 16:9.")
        lines += [f"## set_{name}.png", "", "```", prompt, "```", ""]
    (OUT / "shared").mkdir(exist_ok=True)
    (OUT / "00_shared_sets.md").write_text("\n".join(lines), encoding="utf-8")
    start = ROOT / "START_HERE.md"
    if start.exists():
        (OUT / "00_START_HERE.md").write_text(start.read_text(encoding="utf-8"), encoding="utf-8")


def main():
    OUT.mkdir(exist_ok=True)
    cal = []
    reports = []
    for p in sorted(SCRIPTS.glob("*.md")):
        reports += build_video(p, cal)
    with open(OUT / "00_long_form_calendar.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(cal[0].keys()))
        w.writeheader()
        w.writerows(cal)
    write_shared_sets()
    print("\n".join(reports))
    tot_sam = sum(c["sam"] for c in cal)
    tot_rec = sum(c["rec"] for c in cal)
    print(f"TOTAL: {len(cal)} videos, {tot_sam} Sam clips, {tot_rec} recreation clips, {tot_sam + tot_rec} Seedance clips")


if __name__ == "__main__":
    sys.exit(main())
