---
name: code-generated-video-production
description: Use when producing videos generated in code.
version: 1.0.0
author: Hermes Curator
license: MIT
tags: [remotion, video, motion, code-generated, reels]
metadata:
  hermes:
    tags: [remotion, video, motion, code-generated, reels]
    related_skills: [media-generation-and-editing, autonomous-coding-agents]
---

# Code-Generated Video Production

## When to Use

Use when Carlos wants higher-quality videos generated in code rather than simple FFmpeg/card edits: Remotion, GSAP/HTML/CSS/JS, Claude Code-assisted implementation, motion-over-real-video, voxel/Minecraft-like dialogue, animated dashboards, WhatsApp, CRM, GitHub repo demos, and Gumercindo explainer Reels.

## Core rule

Inspect the reference video or uploaded clip before promising quality. Classify the request, then make a short pilot or renderable composition and QA frames before claiming a repeatable factory.

## Classify the target

1. **Motion over real video** — Carlos appears on camera and premium overlays animate around him. This is the fastest commercial upgrade and should be tried first when the goal is selling Gumercindo.
2. **Voxel/3D cinematic** — Minecraft-like room, character, computer, dramatic lighting, and camera motion. Requires a 3D/voxel scene plan, not flat square characters.
3. **Prompted motion graphic** — numbers, charts, cards, kinetic type, and sound design; usually achievable with Remotion/GSAP/Canvas.
4. **Photoreal VFX** — an object realistically appears in Carlos's hand with shadows/contact/occlusion; Remotion alone is not enough. Use tracking/rotoscoping or a video/VFX provider.

Do not treat a simple technical pilot as final reference quality. Say plainly when a render proves the engine but not the target style.

## Procedure

1. **Reference intake**
   - Open and inspect the reference if a link is supplied.
   - Extract visible style details: camera, motion, typography, overlays, scene depth, colors, sound/caption style.
   - If access is blocked, ask for the downloaded video or screen recording rather than guessing.

2. **Script and message**
   - Keep Carlos's natural voice if he sends audio; use the Telegram OGG as the Carlos line.
   - For Claude-vs-Gumercindo content, explain that Claude and Gumercindo are allies, not competitors:
     - Claude is the motor / intelligence.
     - Gumercindo is the complete car / operation inside the business.
     - Gumercindo can use Claude, OpenAI, WhatsApp, CRM, browser, spreadsheets, and automations.
     - The business impact is fewer manual tasks, faster responses, organized records, reports, and human handoff only when needed.
   - Avoid jargon such as “follow-up” for general audiences; say “avisar de novo”, “retomar conversa”, “organizar”, “registrar”, and “entregar resultado”.

3. **Storyboard**
   - Convert spoken directions into visual beats with timing.
   - Separate programmatic/stylized beats from photoreal VFX beats.
   - Keep the hook readable in the first 1–2 seconds for Reels.

4. **Implementation**
   - Create a Remotion project/composition or use an existing lab.
   - Use frame-based timing, `spring`, `interpolate`, reusable components, and mobile-safe large text.
   - For motion-over-real-video, build: real-video panel, neon/dashed frame, technical grid, step badges, analogy card, tool orbit/cards, highlighted captions, and CTA/end card.
   - For narrative scene intercuts, keep the original voice as the full audio track and let the transcript drive the visuals: concrete verbs/objects get created scenes, reflective or interpretive lines return to the speaker, and reframes/questions become text cards. Do not force a fixed speaker/scene ratio; use the speaker only where it makes sense.
   - For voxel style, build environment depth: room, desk/computer, window/city/night background, character staging, simple mouth/arm movement, camera moves, light/glow/shadow.
   - Trim explicitly unwanted handling/end-recording moments after the last useful phrase before muxing the final audio.

5. **Render and QA**
   - Render a real MP4.
   - Run `ffprobe` for duration and size.
   - Decode the whole MP4 with ffmpeg; the error log should be empty.
   - Extract a contact sheet from first/middle/end frames and every visual mode used.
   - Inspect for text hierarchy, mobile readability, cropped captions, object placement, and whether the output matches the selected class.
   - For long Portuguese narration in vertical videos, use rolling word-window subtitles from word timestamps instead of full phrase captions; full phrases often clip or become unreadable on 1080×1920.
   - Check the final seconds in QA when the user asks to remove a phone/off-camera ending; do not assume trimming worked because the duration changed.
   - Re-render if the output is only a prototype while Carlos asked for the polished reference style.

## Validated local Remotion pattern

A known-good starting pattern on the VPS:

```bash
mkdir -p /root/gumercindo-remotion-lab/src /root/gumercindo-remotion-lab/public
cd /root/gumercindo-remotion-lab
npm init -y
npm install remotion @remotion/cli react react-dom
# create src/Root.tsx and src/index.ts
npx remotion render src/index.ts CompositionId out/video.mp4 --codec=h264 --crf=20
ffprobe -v error -show_entries format=duration,size -of default=nw=1 out/video.mp4
ffmpeg -v error -i out/video.mp4 -f null -
ffmpeg -y -i out/video.mp4 -vf "select='eq(n,30)+eq(n,270)+eq(n,480)+eq(n,720)',scale=270:-1,tile=4x1" -frames:v 1 qa/contact.jpg
```

For dialogue, copy Carlos's Telegram OGG into `public/carlos.ogg`, generate Gumercindo TTS into `public/gumercindo.ogg`, then align audio with Remotion `<Audio src={staticFile(...)}/>` and `<Sequence>`.

## Claude Code access rule

Do not claim Claude/Opus is available just because the binary exists. Verify a real logged-in call first. If Claude Code says login is required, report that authorization is needed and continue with Hermes/Remotion where possible.

## Guardrails

- Do not promise 100% match to a reference before inspecting it and producing a pilot.
- Do not claim Remotion alone can do photoreal generative video.
- Do not deliver only a script if Carlos asked for a video; render a file or state the blocker.
- For Instagram/Direct strategy, generate videos and response scripts, but do not automate spammy engagement.
