---
name: video-quality-enhancement
description: "Use when improving/upscaling a video clip's quality."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [media, video, ffmpeg, upscale, denoise, sharpen, quality]
---

# Video Quality Enhancement

## Trigger

Use when a user (Carlos, Paula, a client) sends an existing clip and asks to improve it: “melhora a qualidade”, “deixa mais nítido”, “tira o ruído”, “dá uma tratada”, or asks to upscale/clean a phone video already in hand. This is enhancement of an existing file — **not** the avatar/lipsync, cut, or from-scratch generation classes; those have their own workflows.

## Procedure

1. **Verify the source file exists** before anything else: `ls -la <path>`. Chat attachments live in a swept cache (`~/.hermes/cache/videos/`), so a clip referenced as “o vídeo acima” from an earlier turn may already be gone. If it is missing, ask for a resend (as a document/arquivo to avoid Telegram recompression) and stop — do not run the pipeline against a dead path.
2. **Probe the source** to know the ceiling:

```bash
ffprobe -v error -show_streams -show_format -of json in.mp4
```

   Resolution, fps and bitrate bound the result: a ~480p / ~1.4 Mbps phone clip cannot gain real 1080p detail, no matter the filter chain. Read these numbers before promising anything.
3. **Baseline contact sheet** (before):

```bash
ffmpeg -hide_banner -loglevel error -i in.mp4 -vf "fps=1/13,scale=238:424,tile=4x1" -frames:v 1 -update 1 antes.jpg
```

   Inspect it with vision — note exposure, colour cast, noise level, and where captions/burned text sit.
4. **Enhance conservatively**: denoise → tone → lanczos upscale → light sharpen, original audio untouched:

```bash
ffmpeg -hide_banner -loglevel error -i in.mp4 -map 0:v:0 -map 0:a:0 \
  -vf "hqdn3d=1.1:0.9:1.8:1.5,eq=contrast=1.025:brightness=0.003:saturation=1.025,scale=720:-2:flags=lanczos,unsharp=5:5:0.38:3:3:0" \
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart out.mp4
```

   Tune it to the source: raise `scale` to the next sensible height (720/1080) and keep `unsharp` and the `eq` deltas small. Over-sharpening and aggressive saturation look worse than the original on a phone screen — subtle beats punchy.
5. **Validate and QA before delivering**: decode the whole output (`ffmpeg -i out.mp4 -f null -`), rebuild the after contact sheet with the same command, and compare before/after with vision for halos, blown highlights, crushed blacks, shifted skin tones, clipped captions, or reframed edges. Re-render with gentler values if any appear.
6. **Report honestly**: state what was applied (noise reduction, contrast/colour, upscale, sharpening), that audio/captions/framing were preserved, and that the gain is limited by the source (“melhoria sutil, porque o original já veio com pouca definição”). Never imply detail was recovered or that the clip was re-shot/regenerated.
7. **Store the deliverable outside the cache** (e.g. `~/media/<client>/<name>_melhorado.mp4`). `~/.hermes/cache/` is swept automatically — a rendered output left there can vanish before the user asks for it again.

## Delivery

Send the MP4 with `MEDIA:/absolute/path/out.mp4` and keep the message short: what changed, what was preserved, the honest limit. When the source is vertical (9:16), keep the aspect ratio — never letterbox a Reel-style clip into 16:9.

## Pitfalls

- Running the enhancement chain on an attachment path from an earlier turn without checking the file exists; the cache is swept and the command fails after the user has already been kept waiting.
- Leaving the improved file inside `~/.hermes/cache/` and having to redo the work (and ask for the source again) days later.
- Applying heavy sharpening/saturation to a low-bitrate source: it amplifies compression blocks instead of fixing them.
- Re-encoding the audio when no audio change was requested — use `-c:a copy`.
- Promising a quality jump the probe numbers do not support; say the improvement is limited by the original resolution/bitrate.

## Verification Checklist

- [ ] Source file existed and was probed (resolution/fps/bitrate recorded).
- [ ] Before and after contact sheets inspected.
- [ ] Full output decoded without errors; duration matches the source.
- [ ] Audio stream copied, captions and framing intact.
- [ ] Output saved outside the swept cache and delivered via `MEDIA:` path.
