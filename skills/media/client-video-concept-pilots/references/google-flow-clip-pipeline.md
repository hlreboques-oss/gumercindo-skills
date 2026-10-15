# Google Flow clip pipeline (Omni) — UI, download, assembly

Flow is a clip factory, not a one-shot renderer: it returns **one ~10s clip per generation** with Omni. A finished vertical piece is N clips generated in Flow, downloaded, and assembled locally with FFmpeg plus TTS narration and burned captions.

## UI path that works

1. `flow.google.com` → **Sign in** with a Google account. The login is done by the user in a browser they can see (`vps-kasmvnc-desktop-operations` for the KasmVNC desktop); never type the password or ask for it in chat.
2. **New project**.
3. Open the prompt-box settings (sliders icon at the right end of the prompt bar). Switch the type **Image → Video**, set aspect **9:16**, model **Omni 1.1 Flash**, duration **10s**, count **x1**. Screenshot and confirm the bar reads e.g. `Video · 720p · 10s · x1` before typing anything — the box defaults to image, and an image-only run produces stills, not clips.
4. Type the prompt (see the prompt rules in SKILL.md), submit, wait ~60–90s.
5. Open the finished thumbnail and use its download icon. The menu offers **270p (animated GIF) / 720p (original size) / 1080p (upscaled) / 4K (paid)** — download **720p** per clip and rename it descriptively as soon as it lands.

Workspace notes: left rail has All media / Videos / Characters / Scenes / Tools / Trash. **Scenes** is for arranging clips you already have, not for generating. A rejected generation leaves a `Failed` card carrying the policy text and a refund note — always open the successful thumbnail, never the failed card, when downloading.

## Assembly

Native clips come out 720x1280. Normalize each to the delivery frame before concat:

```bash
ffmpeg -y -i clip.mp4 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p" \
  -c:v libx264 -preset veryfast -crf 20 -an clip_norm.mp4
```

Concat, then stretch to the narration length by cloning the last frame (`tpad`):

```bash
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy concatenated.mp4
ffmpeg -y -i concatenated.mp4 -vf "tpad=stop_mode=clone:stop_duration=<segundos_faltantes>" extended.mp4
```

Then lay narration + ASS captions + CTA in a single encode, and QA frames at the hook, a mid transition, and the CTA timestamp before delivering.

## CTA text overlay

Split a long CTA into **separate `drawtext` filters, one per line**. A single wide string is cropped at both edges in 9:16 even with `x=(w-text_w)/2`; two shorter lines render whole. Keep the CTA band above the caption band so they never overlap, and verify with a real extracted frame rather than trusting the filter.
