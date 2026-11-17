#!/usr/bin/env python
"""Split screen: motion graphics on top, real footage below (validated pipeline).

Usage:
  python compose_split_real.py SOURCE_MP4 INICIO FIM ANIMACAO_MP4 SAIDA_MP4 [LOGO_PNG]

- SOURCE_MP4 : a filmagem real. For a long recording, INICIO/FIM pick the approved window.
- ANIMACAO_MP4: the full 1080x1920 render produced by scripts/render.js. Only its top 960px are used,
               so the cenas.js keeps the safe area of a normal vertical video as-is.
- SAIDA: 1080x1920 with the original audio of SOURCE (loudness-normalised).
- LOGO_PNG (optional): badge in the lower panel, never over the face.

Run with the same python that has cv2/PIL/numpy (e.g. /usr/local/lib/hermes-agent/venv/bin/python).
"""
import cv2, subprocess, sys, math, json
import numpy as np
from pathlib import Path
from PIL import Image, ImageDraw

W, H, FPS = 1080, 1920, 30
src_p, t0, t1, anim_p, out_p = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4], sys.argv[5]
logo_p = sys.argv[6] if len(sys.argv) > 6 else None
t0 = max(0.0, t0); DUR = t1 - t0

work = Path('/tmp/compose_split'); work.mkdir(parents=True, exist_ok=True)
seg = work / 'seg.mp4'
# Normalise the window first: same size, fps and SAR for every clip, so the two halves never drift.
subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(t0), '-i', src_p, '-t', f'{DUR:.3f}',
                '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1',
                '-r', str(FPS), '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', str(seg)], check=True)

cap, anim = cv2.VideoCapture(str(seg)), cv2.VideoCapture(anim_p)
logo = Image.open(logo_p).convert('RGBA') if logo_p else None
if logo:
    logo.thumbnail((190, 190), Image.LANCZOS)


def read(c, t):
    c.set(cv2.CAP_PROP_POS_MSEC, max(0, t) * 1000)
    ok, fr = c.read()
    if not ok:
        c.set(cv2.CAP_PROP_POS_FRAMES, 0); ok, fr = c.read()
    if not ok:
        fr = np.zeros((960, 540, 3), np.uint8)
    return cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)


vis = work / 'visual.mp4'
proc = subprocess.Popen(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                         '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'veryfast',
                         '-crf', '20', '-pix_fmt', 'yuv420p', str(vis)], stdin=subprocess.PIPE)

for i in range(int(math.ceil(DUR * FPS))):
    t = i / FPS
    top = read(anim, t)[0:960, :, :]
    if top.shape[:2] != (960, 1080):
        top = cv2.resize(top, (1080, 960))
    bot = read(cap, t)
    # contain + blurred background: keeps the whole person/roster visible instead of cropping a face
    ih, iw = bot.shape[:2]; s = min(1080 / iw, 960 / ih)
    fg = cv2.resize(bot, (max(1, int(iw * s)), max(1, int(ih * s))), interpolation=cv2.INTER_CUBIC)
    bg = cv2.GaussianBlur(cv2.resize(bot, (1080, 960), interpolation=cv2.INTER_CUBIC), (45, 45), 0)
    bg = (bg.astype(np.float32) * 0.45).astype(np.uint8)
    x, y = (1080 - fg.shape[1]) // 2, (960 - fg.shape[0]) // 2
    bg[y:y + fg.shape[0], x:x + fg.shape[1]] = fg
    canvas = np.zeros((H, W, 3), np.uint8)
    canvas[0:960], canvas[960:1920] = top, bg
    im = Image.fromarray(canvas); d = ImageDraw.Draw(im, 'RGBA')
    d.rectangle((0, 946, W, 974), fill=(61, 255, 92, 240))          # divider in the accent colour
    if logo:
        d.rounded_rectangle((38, 996, 262, 1220), radius=34, fill=(255, 255, 255, 232), outline=(61, 255, 92, 255), width=5)
        im.paste(logo, (38 + (224 - logo.width) // 2, 996 + (224 - logo.height) // 2), logo)
    proc.stdin.write(np.asarray(im).tobytes())

proc.stdin.close(); proc.wait(); cap.release(); anim.release()
if proc.returncode:
    raise SystemExit(proc.returncode)

# Original audio of the filming, treated: never a synthesised track over a real person speaking.
subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', str(vis), '-ss', str(t0), '-i', src_p, '-t', f'{DUR:.3f}',
                '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
                '-af', 'highpass=f=90,loudnorm=I=-15:TP=-1.5:LRA=11,alimiter=limit=0.94',
                '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out_p], check=True)
print(json.dumps({'out': out_p, 'dur': round(DUR, 2)}))
