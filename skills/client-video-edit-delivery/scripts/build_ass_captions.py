#!/usr/bin/env python3
"""Build burned-in ASS subtitles from faster-whisper word timestamps.

Input JSON: [{"start":..,"end":..,"text":..,"words":[{"w":"word","s":1.2,"e":1.4}, ...]}, ...]
(produced by transcribing the EXACT cut window with word_timestamps=True).

usage: build_ass_captions.py words.json t_end out.ass [fixes.json]

fixes.json: {"old text": "new text"} applied per block after chunking, so a correction that straddles
two blocks needs an entry for each fragment.

Rules encoded: blocks <= ~40 chars, <= 2 lines of ~24 chars, short blocks merged, whitespace
normalised, timeline clamped so blocks never overlap.
"""
import json
import re
import sys

MAX_CHARS = 40
MAX_LINE = 24
MIN_BLOCK_CHARS = 18
FONT = "Montserrat SemiBold"
SIZE = 60
MARGIN_V = 340  # lower third at 1080x1920

HEADER = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT},{SIZE},&H00FFFFFF,&H00B3854D,&H00120F0C,&H96000000,-1,0,0,0,100,100,0.6,0,1,6,3,2,70,70,{MARGIN_V},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def ass_time(t):
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def normalise(text, fixes):
    for old, new in fixes.items():
        text = text.replace(old, new)
    return re.sub(r"\s+", " ", text).strip()


def all_words(data, t_end):
    words = []
    for seg in data:
        for w in seg.get("words") or []:
            if w["e"] <= t_end:
                words.append({"w": w["w"].strip(), "s": w["s"], "e": w["e"]})
    words.sort(key=lambda x: x["s"])
    return words


def chunk(words):
    blocks, cur = [], []
    for w in words:
        cur.append(w)
        txt = " ".join(x["w"] for x in cur)
        punct = bool(re.search(r"[,.…?!;:]$", w["w"]))
        if len(txt) >= MAX_CHARS or (punct and len(txt) >= MAX_CHARS * 0.65):
            blocks.append(cur)
            cur = []
    if cur:
        blocks.append(cur)

    merged = []
    for b in blocks:
        txt = " ".join(x["w"] for x in b)
        prev = " ".join(x["w"] for x in merged[-1]) if merged else ""
        if merged and len(txt) < MIN_BLOCK_CHARS and len(prev) + len(txt) < 64:
            merged[-1].extend(b)
        else:
            merged.append(b)
    return merged


def two_lines(text):
    words = text.split()
    if len(text) <= MAX_LINE or len(words) <= 2:
        return [text]
    best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if len(a) > MAX_LINE + 3 or len(b) > MAX_LINE + 3:
            continue
        score = abs(len(a) - len(b))
        if best is None or score < best[0]:
            best = (score, a, b)
    if best:
        return [best[1], best[2]]
    cut = text.rfind(" ", 0, len(text) // 2 + 6)
    if cut <= 0:
        return [text]
    return [text[:cut].strip(), text[cut:].strip()]


def main():
    words_json, t_end, out_path = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    fixes = {}
    if len(sys.argv) > 4:
        fixes = json.load(open(sys.argv[4], encoding="utf-8"))

    data = json.load(open(words_json, encoding="utf-8"))
    blocks = chunk(all_words(data, t_end))

    events = []
    for b in blocks:
        events.append([b[0]["s"], b[-1]["e"] + 0.12, normalise(" ".join(x["w"] for x in b), fixes)])
    for i in range(len(events) - 1):
        events[i][1] = min(events[i][1], events[i + 1][0] - 0.03)

    lines = [HEADER]
    for start, end, text in events:
        end = max(end, start + 0.7)
        body = "\\N".join(two_lines(text))
        lines.append(f"Dialogue: 0,{ass_time(start)},{ass_time(end)},Cap,,0,0,0,,{body}")

    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines) + "\n")
    print(f"{len(events)} blocks -> {out_path}")


if __name__ == "__main__":
    main()
