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
   - Download/probe the reference, transcribe its explanation, and inspect before/after frames and any demonstrated tool UI before choosing a renderer.
   - Classify the target before building: motion-over-real-video, code/UI-first, voxel/3D scene, or generative/VFX. Distinguish cropping/zooming existing pixels from generating an unseen camera viewpoint; a lateral or overhead reconstruction is not a motion-graphics substitute.
   - State which class is being attempted. Do not judge quality only against the previous local attempt; compare the contact sheet against the reference class.
   - Honor an explicitly requested generation platform such as Google Flow. Do not deliver a local illustrated/code render as its replacement without approval, even when the narration and topic match. Treat a named Claude skill, actual Claude execution, and the visual generation service as separate facts.
   - For new camera angles from an existing recording, follow `references/generative-reframing.md`; do not promise the reference's result merely because a connector or model appears in the catalog.
   - For a didactic reference combining product UI motion and real images, follow `references/reference-led-explainers.md`. Extract the reference's ordered argument and shot functions before writing the adaptation; copying only its colors or adding generic cards misses the requested structure.

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
   - Bind each spoken claim to its corresponding visible action and evidence source in the storyboard. When Carlos requests real images, include actual relevant footage or captures, not photorealistic generated substitutes; label designed interfaces as illustrative and separate them from recorded operation.
   - Keep explanation length subordinate to coherence: use roughly a minute when a causal example needs it rather than forcing a short ad or slowing a rejected cut. Preserve the connecting clauses between setup, action, result and invitation; approve duration from the measured narration, not a fixed count of clips.
   - Adapt the reference's narrative roles, not unsupported product claims: verify each capability against the target operation and replace unverified telephony, universal integrations or guaranteed outcomes with demonstrated authorized tasks.
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

## Approved clean didactic explainer

For Carlos's approved clean didactic style, use a white/off-white base, high-contrast black typography, restrained aqua/lilac accents, concrete step-by-step interface motion and relevant real operational footage. Preserve the order problem → identity → configuration → task in action → integrations → report → benefit → invitation; synchronize each visible action with its spoken explanation, anonymize real captures, and label reconstructed interfaces as illustrative. Do not replace this look with generic neon cards or inherit another product's unsupported promises. Load `references/clean-didactic-real-footage.md` for production and implementation details. Approval of this style does not authorize publication of future videos.

## Carlos/Gumercindo style

Default look: premium AI/business, dark base, white text, gold accent, teal technical glow, sharp typography, high contrast, practical proof. Prefer business outcomes over technical jargon: less manual work, faster response, organized CRM, report delivered, human alerted only when needed.

For Carlos's editorial raw-footage Reel workflow, use the approved light palette unless he changes it: `#F4F4F0` background, `#24261B` dark olive, `#FFE579` yellow, `#272727` secondary dark, `#1A1A1A` text, `#FFFFFF` light text, Outfit 400/700/900. Favor large typography, few elements, strong hierarchy, clean motion, and mobile readability over decorative template effects.

## Pitfalls

- Do not say a video is “closer to the reference” merely because it improved locally; identify the remaining mismatch against the actual reference.
- Do not keep iterating the same simple local-card/placeholder path after Carlos says it still does not match the Claude Code examples; switch class or pipeline.
- Do not promise photoreal VFX from Remotion alone; separate stylized overlay, tracked compositing, and generative/VFX provider paths.
- For financial waterfalls, verify both arithmetic and geometric scale in code: every bar uses the same pixels-per-currency ratio, and subtraction bars bridge the correct intermediate balances. Include taxes explicitly or label a pre-tax result.
- For separately generated narration slots, transcribe each normalized slot independently and offset word timestamps by its exact scene start. Whole-file ASR can drift across silent joins; verify the final CTA ends before the render boundary.
- After FFmpeg loudnorm, explicitly `aresample=48000` before `adelay`, `apad=whole_dur=...`, and `atrim=duration=...`; loudnorm can change the internal sample rate. Probe every normalized slot and the concatenated narration against exact storyboard durations before rendering or muxing. If a finished picture is correct but narration joins drift, pad each slot independently to its exact duration and remux audio without re-encoding video.
- When an installed HyperFrames CLI cannot execute the supported workflow, a deterministic HTML/CSS/JS `seek(t)` composition captured by local Playwright and encoded via FFmpeg is a practical fallback for clean UI explainers. Render motion separately and overlay prepared real footage at explicit timeline timestamps; keep footage provenance and illustrative UI labels. Name this renderer honestly, not as a HyperFrames or Claude execution.
- If an installed HyperFrames CLI lacks a documented command or workflow, preserve its exact error, check supported help, and name any actual fallback renderer honestly. Loading a Claude-tagged skill does not mean the Claude provider executed.
- Do not place cards or captions over a talking-head subject's face, mouth, mic, or active hands; these areas carry trust, speech, and gesture information, and covering them makes the edit feel amateur.
