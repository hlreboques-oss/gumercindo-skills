# AI avatar split-screen content factory

Use when Carlos wants a repeatable short-video factory where his original footage is a **reference for a digital twin/avatar**, not the final edited clip.

## Critical interpretation rule

If Carlos sends a phone video while discussing avatar/gêmeo digital production, do **not** assume he wants a simple cut, title overlay, or compression of the original. First treat the video as:

- visual reference for Carlos's avatar/gêmeo digital;
- posture, clothes, scenery, and energy reference;
- optional B-roll/reference material;
- source for still frames/contact sheets.

The intended final artifact is usually:

```text
top half: contextual visuals, demos, screenshots, workflow cards, B-roll
bottom half: Carlos's avatar/digital twin speaking a newly written script
vertical 9:16, captions, CTA, approval before posting
```

## Recommended architecture for low-VPS footprint

Prefer a hosted avatar provider (HeyGen first choice for cost/quality balance) plus local lightweight assembly:

```text
idea/form/Telegram
→ script + storyboard
→ Carlos approves script
→ HeyGen creates authorized avatar video
→ local Python/FFmpeg creates/loads top visual
→ FFmpeg stacks top visual + avatar video
→ preview delivered to approval group
→ manual/semi-auto publish after approval
```

Avoid starting with heavy local SadTalker/LivePortrait/Wav2Lip unless GPU/storage/maintenance are explicitly available. Open-source local models may be cheaper per video but can cost more in setup, disk, GPU, and reliability.

## Minimum local factory structure

```text
ai-video-factory/
  queue/              JSON jobs per video
  scripts/            renderers and visual generators
  assets/avatar_refs/ extracted Carlos/client references
  assets/top_visuals/ screenshots, cards, B-roll, generated visuals
  output/             rendered MP4s
  templates/          env/n8n/job templates
  logs/
```

Job JSON should track: id, series, day, title, status, script, screen captions, post caption, avatar provider/reference/generated video path, top visual path, render output path, approval state, publish state.

## Practical workflow

1. Extract a contact sheet and a few reference frames from the user's original footage.
2. Write the new short script and a time-coded storyboard for the top half.
3. Generate or collect top visuals that directly correspond to the spoken points.
4. Send/queue the script for Carlos approval before spending avatar/render credits.
5. Generate avatar video with explicit authorization and track job/video ID/cost.
6. Render 1080x1920 split-screen with FFmpeg: top 1080x960, bottom 1080x960, avatar audio as master.
7. Verify output with `ffprobe` for width, height, duration, codec, and file size.
8. Deliver preview for approval; do not auto-post until the format is calibrated.

## FFmpeg split-screen pattern

```bash
ffmpeg -y \
  -stream_loop -1 -i top_visual.mp4 \
  -i avatar.mp4 \
  -filter_complex "[0:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[top];[1:v]scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[bottom];[top][bottom]vstack=inputs=2[v]" \
  -map "[v]" -map 1:a? \
  -c:v libx264 -preset veryfast -crf 22 \
  -c:a aac -b:a 128k -movflags +faststart \
  -shortest output.mp4
```

## Guardrails

- Keep clone/avatar assets separated per person/client.
- Require explicit consent before creating/using a clone.
- Track provider credits/cost per video.
- Do not claim the avatar/final video exists until the provider artifact is downloaded and local render is verified.
- For Carlos, use a dedicated bot/n8n workflow for the factory rather than the main Gumercindo chat when the goal is autonomous high-volume production and token savings.
