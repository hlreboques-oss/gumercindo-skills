---
name: programmatic-video-production
description: Use when producing code-generated motion videos.
version: 1.0.0
author: Gumercindo
license: MIT
tags: [remotion, claude-code, motion, reels, video]
metadata:
  hermes:
    tags: [remotion, claude-code, motion, reels, video]
    related_skills: [media-generation-and-editing, autonomous-coding-agents]
---

# Programmatic Video Production

## When to Use

Use when Carlos wants videos generated in code with Remotion, GSAP, Canvas, Three.js, Claude Code, HyperFrames-style motion, voxel/block scenes, animated dashboards, WhatsApp/CRM mockups, or reference-matched Instagram Reels.

## Core rule

Do not promise that the current pipeline can match a reference Reel until you have inspected the reference and rendered a pilot. Carlos cares about quality parity; answer honestly whether the available resources can match, approximate, or require a pipeline upgrade.

## Reference benchmark workflow

1. Open the reference and capture/read enough frames to classify the visual system.
2. Classify the target before building:
   - **Motion over real video:** Carlos appears on camera; code adds overlays, cards, glow, captions, dashboards, WhatsApp/CRM, step labels, and CTA.
   - **Voxel/3D cinematic:** block/voxel characters, 3D camera, lighting, depth, environment, and scene changes.
   - **Abstract data/motion graphics:** numbers, charts, timeline, symbols, product UI, and sound-driven transitions.
   - **Generative/VFX:** realistic object insertion, character transformation, or photoreal interaction with real footage.
3. Compare the pilot contact sheet against the reference before claiming quality. Report the gap directly.

## Pipeline choices

### Track 1 — motion over real video

Use this first for commercial content when Carlos can provide a real video or audio. It should feel like a premium tutorial Reel, not a static card edit.

Procedure:
1. Keep Carlos's real voice/video as the anchor whenever possible.
2. Cut breathing, long pauses, false starts, and dead air.
3. Build one idea per 1–2 seconds: hook, visual metaphor, process proof, CTA.
4. Add Remotion overlays: neon grid, step badges, tool cards, animated WhatsApp/CRM/dashboard, captions, and CTA.
5. Add sound design: whoosh, click, pop, glitch, riser, and subtle beat transitions. Voice-only motion feels unfinished.
6. Render vertical 1080x1920 MP4, extract a contact sheet, decode the full file, then deliver.

### Track 2 — voxel/3D cinematic

Use when Carlos asks for Minecraft/voxel/block-style videos. A flat block avatar is only a technical proof; the quality target needs camera, lighting, environment, depth, and scene movement.

Procedure:
1. Create an original voxel/block aesthetic; do not use copyrighted Minecraft assets unless licensed.
2. Build a small scene: room, desk, monitor, window, phone, CRM/dashboard, or city blocks.
3. Animate camera and lighting, not only character mouths.
4. Use short captions and visible action, not paragraphs.
5. Render a 10–15s pilot before committing to a series.

### Track 3 — generative/VFX realism

Use when Carlos asks for realistic objects appearing in his hand, transformation into a character, or photoreal interaction with footage. Remotion alone is not enough for realism. Choose one of:

- stylized overlay/compositing when realism is not required;
- tracking/rotoscope plus overlay when the shot is stable;
- AI video/VFX provider when realistic lighting, hands, occlusion, or physical interaction matter.

## Claude Code usage

Claude Code can be used as an implementation lane, but verify it is actually logged in before relying on it. `claude --version` proves installation only. Run a minimal non-interactive model call and require a non-error result before saying Opus/Claude Code is active. If login is pending, guide Carlos through OAuth/device login without asking for passwords.

Hermes/Gumercindo remains the director: decide scope, inspect code/output, run renders, compare frames, and verify before claiming success.

## Messaging pattern for Claude vs Gumercindo videos

Avoid abstract explanations. Use concrete analogies and impact:

- Claude is the motor; Gumercindo is the car running inside the company.
- Claude can be a powerful piece inside Gumercindo; they are allies, not competitors.
- A standalone AI answers; Gumercindo connects tools and delivers work: attend, organize, register, alert, report.

Quantify or visualize impact where possible: less manual work, faster response, CRM updated, report generated, human alerted only when needed.

## Quality checklist

Before delivery, verify:

- MP4 exists, duration/size/codec checked with ffprobe.
- Full decode passes with ffmpeg `-f null` or equivalent.
- Contact sheet inspected for text cropping, weak hierarchy, broken emoji/icons, and dead frames.
- Visual density changes every 1–2 seconds.
- Captions are short and keyword-driven, not paragraphs.
- Sound design exists on major transitions or absence is reported as a limitation.
- The final response states whether the output is a proof, template, or production-ready render.

## Pitfalls

- Do not keep iterating a simple card/PIL edit when Carlos is asking for Claude Code/Remotion reference quality; switch to programmatic motion or say what tool/pipeline is missing.
- Do not treat a basic voxel pilot as the target quality; it validates the render path, not the cinematic style.
- Do not say “we can do it 100%” before seeing the reference and producing a pilot; Carlos explicitly wants certainty before spending time and money.
