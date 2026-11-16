#!/usr/bin/env python3
"""Build the Shorts calendar and Higgsfield prompts (9:16) from production/shorts/shorts_data.py."""
import csv
import datetime as dt
import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).parent))
import build  # noqa: E402

spec = importlib.util.spec_from_file_location("shorts_data", ROOT / "shorts" / "shorts_data.py")
sd = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sd)

OUT = build.OUT / "SHORTS"
START = dt.date(2026, 11, 23)  # Monday before the first documentary
WEEKS = 17
STILL_LOOK = ("Present-day handheld documentary look: 35 mm lens at f/2.8, natural available light, one source family, "
              "true-to-life colour, fine grain, natural skin texture. Ordinary people of mixed ages and backgrounds, unposed, "
              "nobody looking at the camera. No text, no logos, no readable screens or signs (screens are blurred or turned away). 9:16 vertical.")


def rec_index():
    idx = {}
    for p in sorted(build.SCRIPTS.glob("*.md")):
        meta, body, sams, recs, *_ = build.parse(p)
        for r in recs:
            idx[r["id"]] = r
    return idx


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    recs = rec_index()
    scams = list(sd.SCAMS)
    money = list(sd.MONEY)
    teasers = list(sd.TEASERS)
    rows, md, vo = [], [], []
    cal = []
    s_i = m_i = t_i = 0
    for w in range(WEEKS):
        monday = START + dt.timedelta(weeks=w)
        plan = ["S", "T", "M", "T", "S"]
        for d, kind in enumerate(plan):
            day = monday + dt.timedelta(days=d)
            if kind == "S":
                item = scams[s_i]; s_i += 1
            elif kind == "M":
                item = money[m_i]; m_i += 1
            else:
                item = teasers[t_i]; t_i += 1
            if kind in "SM":
                sid, title, hook, script, opener, payoff, closer = item
                cal.append([day.isoformat(), day.strftime("%a"), "12:00 ET", sid, "Scam" if kind == "S" else "Money trap", title, hook, f"Sam closer {closer}"])
                vo.append([f"short_{sid}_vo.mp3", len(script.split()), script])
                md += [f"## {day.isoformat()} ({day.strftime('%a')}) · {sid}: {title}", "",
                       f"**Hook (first second, also on screen):** {hook}", "",
                       f"**Voice-over (ElevenLabs, Sam Hollis, speed 1.06, about {round(len(script.split()) / 155 * 60)} s):** {script}", "",
                       f"Ends on Sam closer {closer}: \"{sd.CLOSERS[closer]}\"", ""]
                for part, scene in (("a", opener), ("b", payoff)):
                    still = f"short_{sid}_{part}_still"
                    sp = f"{scene}. {STILL_LOOK}"
                    mp = f"{scene.split(',')[0]}: the action plays out in real time as described. {build.MOTION_RULES}."
                    md += [f"**{still}.png** (image, 9:16)", "", "```", sp, "```", "",
                           f"**short_{sid}_{part}.mp4** (Seedance 2.0, 9:16, 1080p, 5s, audio off, start `{still}.png`)", "", "```", mp, "```", ""]
                    rows.append([still, "image", "Nano Banana Pro", "9:16", "", "", "", sp])
                    rows.append([f"short_{sid}_{part}", "video", "Seedance 2.0", "9:16", 5, still + ".png", "", mp])
            else:
                tid, vid, title, hook, cut, rec_id = item
                cal.append([day.isoformat(), day.strftime("%a"), "12:00 ET", tid, "Collapse teaser", title, hook, f"cut from {vid.upper()}: {cut}; ends on Sam closer 3"])
                r = recs.get(rec_id)
                md += [f"## {day.isoformat()} ({day.strftime('%a')}) · {tid}: {title} (teaser for {vid.upper()})", "",
                       f"**Hook:** {hook}", "", f"**Cut:** {cut}, reframed to 9:16, under 59 seconds, ending on Sam closer 3.", ""]
                if r:
                    still = f"short_{tid}_opener_still"
                    sp = build.rec_still_prompt(r).replace("16:9.", "9:16 vertical, subject centred.")
                    mp = build.rec_clip_prompt(r)
                    md += [f"**{still}.png** (image, 9:16; same scene as `{rec_id}`)", "", "```", sp, "```", "",
                           f"**short_{tid}_opener.mp4** (Seedance 2.0, 9:16, 1080p, {r['dur']}s, audio off, start `{still}.png`)", "", "```", mp, "```", ""]
                    rows.append([still, "image", "Nano Banana Pro", "9:16", "", "", "", sp])
                    rows.append([f"short_{tid}_opener", "video", "Seedance 2.0", "9:16", r["dur"], still + ".png", "", mp])
                else:
                    md += [f"(No opener: `{rec_id}` not found.)", ""]
    # Sam's five closers
    head = ["# Shorts: Higgsfield prompts (9:16)", "",
            "85 Shorts, Monday to Friday at 12:00 ET, Nov 23 2026 to Mar 19 2027. Pattern each week: Mon scam, Tue teaser for that day's documentary, Wed money trap, Thu second teaser, Fri scam.", "",
            "## Sam's five closing clips (make these first, once, and reuse)", "",
            f"**short_sam_still_916.png** (image, 9:16)", "", "```",
            build.sam_still_prompt({"location": ""}, "study").replace("medium close-up", "medium close-up framed for vertical 9:16, head and shoulders, eyes at 35% from the top") + " 9:16 vertical.",
            "```", ""]
    for n, line in sd.CLOSERS.items():
        s = dict(set="study", action="says the line straight to camera with a small nod at the end", text=line)
        p = build.sam_clip_prompt(s)
        head += [f"**short_sam_closer_{n}.mp4** · 9:16 · 5s · start `short_sam_still_916.png` · audio `short_sam_closer_{n}.mp3`", "", f"> {line}", "", "```", p, "```", ""]
        rows.insert(0, [f"short_sam_closer_{n}", "video", "Seedance 2.0", "9:16", 5, "short_sam_still_916.png", f"short_sam_closer_{n}.mp3", p])
        vo.insert(0, [f"short_sam_closer_{n}.mp3", len(line.split()), line])
    (OUT / "2_higgsfield_prompts.md").write_text("\n".join(head + md), encoding="utf-8")
    with open(OUT / "2_higgsfield_prompts.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["save_as", "type", "model", "aspect", "seconds", "start_image", "audio", "prompt"]); w.writerows(rows)
    with open(OUT / "1_elevenlabs_shorts.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["save_as", "words", "text"]); w.writerows(vo)
    with open(build.OUT / "00_shorts_calendar.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["date", "day", "time", "id", "type", "title", "hook", "notes"]); w.writerows(cal)
    imgs = sum(1 for r in rows if r[1] == "image"); vids = sum(1 for r in rows if r[1] == "video")
    print(f"Shorts: {len(cal)} scheduled, used S{s_i} M{m_i} T{t_i}; {imgs} stills, {vids} Seedance clips")


if __name__ == "__main__":
    main()
