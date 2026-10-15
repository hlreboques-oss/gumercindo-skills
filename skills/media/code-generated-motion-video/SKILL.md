---
name: code-generated-motion-video
description: Use when creating code-generated motion Reels.
version: 1.0.0
author: Gumercindo
license: MIT
tags: [remotion, claude-code, motion-design, reels, video]
metadata:
  hermes:
    tags: [remotion, claude-code, motion-design, reels, video]
    related_skills: [media-generation-and-editing, autonomous-coding-agents]
---

# Code-Generated Motion Video

## When to Use

Use when Carlos asks for videos made in code, Remotion/Claude Code/HyperFrames-style Reels, premium motion over real speech, voxel/Minecraft scenes, animated WhatsApp/CRM/dashboard demos, or short practical tips with programmed visual motion.

## Workflow

1. **Inspect the reference first**
   - Classify the target before building: motion-over-real-video, code/UI-first, voxel/3D scene, or generative/VFX.
   - State which class is being attempted. Do not judge quality only against the previous local attempt; compare the contact sheet against the reference class.

2. **Choose the correct visual substrate**
   - Motion-over-real-video: real Carlos footage plus overlays, or a premium presenter/device slot until footage arrives.
   - Code/UI-first: terminal/editor panels, kinetic cards, numbers, diagrams, scanlines, parallax, and rapid UI transitions.
   - Voxel/Minecraft: true voxel/3D scene with camera, lighting, environment, and character motion.
   - Photoreal object insertion or hand interaction: Remotion is only the compositor; use tracking/VFX or generative-video tools when realism is required.

3. **Avoid cheap placeholders**
   - Do not draw a crude cartoon Carlos placeholder in premium motion explainer videos; it makes the piece look cheap even when surrounding UI improves.
   - If Carlos has not sent footage, use an intentional premium PresenterSlot/device frame: dark masked insert, 1px border, soft drop shadow, subtle grain/scanlines, waveform or audio bars reacting to his voice, and a label that real footage drops in later.
   - Use blocky avatars only for deliberately voxel/Minecraft scenes, not as a generic stand-in.

4. **Storyboard for motion density**
   - Use one idea per screen.
   - Make something change every 1-2 seconds: camera push, card swap, progress bar, count-up, path animation, UI panel transition, or metric reveal.
   - Show the operation happening, not just a concept: model/tool -> WhatsApp/browser/CRM/sheet -> report/result.
   - For raw talking-head Reels, do a staged plan before coding: transcribe with word-level timestamps, classify each short idea block by meaning, extract contact-sheet/gesture frames, then write a text-only scene table with `time | speech | meaning | concrete animation | position | display mode | trigger word | timestamp`.
   - Do not implement the raw-footage scene table until Carlos approves it; for this workflow, approval is a hard creative gate, not a courtesy.

5. **Implement and render**
   - Build Remotion compositions with reusable components such as PresenterSlot, EngineCore, OperationPipeline, PhoneMock, ReportCard, MetricCard, CTAEndCard, and KineticCaption.
   - Use vertical 1080x1920 at 30fps for Reels unless the user asks otherwise.
   - For approved raw-footage edits, render only the first 15 seconds first and stop for visual approval before continuing the full Reel.
   - Keep overlays away from the face, mouth, microphone, active hand gestures, and platform UI zones; use side cards, safe lower captions, subtle punch-ins, and short full-screen impact beats instead.
   - Use `.tsx` for Remotion entrypoints containing JSX; `.ts` entrypoints with React markup fail during bundling.
   - Claude Code/Opus can be used as an implementation lane, but Gumercindo/Hermes must inspect files, render, and QA before claiming completion.

6. **Sound and QA**
   - Plan sound design: whoosh, click, glitch, pop, riser, and subtle bed music. Voice plus visuals alone often feels unfinished.
   - Render a real MP4, run ffprobe, decode the video, and extract a contact sheet.
   - Inspect legibility, hierarchy, motion density, placeholder quality, and whether the result actually matches the reference class.
   - Re-render if captions crop, a presenter slot looks like a cheap placeholder, the scene is mostly static, or a claimed VFX beat is not visible.

## Carlos/Gumercindo style

Default look: premium AI/business, dark base, white text, gold accent, teal technical glow, sharp typography, high contrast, practical proof. Prefer business outcomes over technical jargon: less manual work, faster response, organized CRM, report delivered, human alerted only when needed.

For Carlos's editorial raw-footage Reel workflow, use the approved light palette unless he changes it: `#F4F4F0` background, `#24261B` dark olive, `#FFE579` yellow, `#272727` secondary dark, `#1A1A1A` text, `#FFFFFF` light text, Outfit 400/700/900. Favor large typography, few elements, strong hierarchy, clean motion, and mobile readability over decorative template effects.

## Pitfalls

- Do not say a video is “closer to the reference” merely because it improved locally; identify the remaining mismatch against the actual reference.
- Do not keep iterating the same simple local-card/placeholder path after Carlos says it still does not match the Claude Code examples; switch class or pipeline.
- Do not promise photoreal VFX from Remotion alone; separate stylized overlay, tracked compositing, and generative/VFX provider paths.
- Do not place cards or captions over a talking-head subject's face, mouth, mic, or active hands; these areas carry trust, speech, and gesture information, and covering them makes the edit feel amateur.
