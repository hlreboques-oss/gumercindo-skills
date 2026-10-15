---
name: gumercindo-remotion-video
description: Use when Carlos wants code-generated Remotion videos.
version: 1.0.0
author: Gumercindo
license: MIT
tags: [remotion, video, motion, claude-code, reels, gumercindo]
metadata:
  hermes:
    tags: [remotion, video, motion, claude-code, reels, gumercindo]
    related_skills: [media-generation-and-editing, autonomous-coding-agents]
---

# Gumercindo Remotion Video

## When to Use

Use when Carlos wants videos created in code rather than simple FFmpeg/card edits: animated WhatsApp, dashboards, GitHub repo demos, Minecraft/block avatars, money/objects appearing, UI motion, graphic explanations, and 30-second practical tips.

## Principle

Do not promise photoreal VFX from Remotion alone. Remotion is a programmable video/compositing engine: excellent for text, UI, graphics, mockups, charts, object overlays, stylized scenes, Minecraft-like block worlds, and synchronized motion. For realistic object insertion into real footage, such as a money bag appearing in Carlos's hand, choose one of:

1. Stylized overlay/compositing in Remotion/FFmpeg when realism is not required.
2. Rotoscope/mask plus tracked overlay when the shot is stable enough.
3. AI video/VFX provider when photoreal hand-object interaction is required.

Be explicit about which mode is being used before claiming capability.

## Production pipeline

1. Reference intake
   - Ask for the reference video/link when Carlos wants to match a style.
   - Ask for the raw source clip if Carlos wants himself on camera.
   - If no reference is provided, make a 10-15s pilot first.

2. Decupagem
   - Remove breathing, long pauses, false starts, and repeated phrases.
   - Keep Carlos's natural delivery unless he asks for a more polished script.
   - Extract exact timestamps and select a 30s arc: hook -> useful tip -> proof/demo -> CTA.

3. Storyboard
   - Convert Carlos's spoken directions into scene instructions.
   - Example: “coloca aqui na palma da minha mão um saco de dinheiro” becomes a VFX beat with timing, asset style, tracking/position, shadow, pop/glow, and camera motion.
   - Separate impossible/photoreal beats from programmatic/stylized beats.

4. HyperFrames/skills-first implementation for premium references
   - When Carlos references the Opus/Skillry/HyperFrames style, do not start from raw Remotion only.
   - Install/update HyperFrames skills first with `npx --yes hyperframes skills update` and use the installed Claude/agent skills: hyperframes, hyperframes-animation, hyperframes-audio, hyperframes-keyframes, hyperframes-creative, hyperframes-cli, hyperframes-studio, and media-use.
   - Use HyperFrames for website-like animated compositions, promptable motion scenes, audio/sound-design gates, keyframes, snapshots, inspection, and MP4 rendering.
   - Treat the prompt library pattern as: reference -> reusable scene recipe -> remake/QA -> adapt to Carlos's niche/project.

5. Remotion implementation
   - Create a React/Remotion project or composition when Remotion is the selected renderer, or compose with HyperFrames when the reference expects HyperFrames-style output.
   - Use frame-based timing, spring/ease motion, and reusable components.
   - Components to prefer: WhatsAppMock, DashboardCard, FunnelFlow, GitHubRepoCard, MoneyBagOverlay, MinecraftAvatar, CTAEndCard, CaptionWordHighlight.
   - Use vertical 1080x1920 for Reels by default; horizontal 1920x1080 only when requested.

6. Claude Code usage
   - Claude Code may be used as an implementation lane for the Remotion code.
   - Hermes/Gumercindo remains responsible for direction, scope, visual QA, and final verification.
   - Inspect files and render output before saying the video is ready.

7. Render and QA
   - Render a real MP4.
   - Run ffprobe for duration/codec/size.
   - Extract first/middle/end frames or contact sheet.
   - For HyperFrames projects, also run `hyperframes check`, `hyperframes inspect`, and `hyperframes snapshot` when available.
   - Visually inspect text, overlays, object placement, captions, transitions, sound-design timing, and CTA.
   - Re-render if captions crop, objects drift badly, or the shot does not match the stated beat.

## Visual identity for Carlos/Gumercindo

Default style: premium AI/business, dark base, white text, gold accent, teal/blue technical glow. Use sharp typography, high contrast, fast but readable motion, and practical business proof.

## Content formats

### 30-second GitHub/practical-tip video
- Hook: what changed or why the repo matters.
- Demo: animated repo card plus 2-3 feature callouts.
- Application: how a company uses it to reduce cost or increase revenue.
- CTA: “comenta IA”, “manda direct”, or “quer esse funcionário de IA na sua empresa?”

### Case video
- Start with result number.
- Show animated workflow: customer messages -> IA reply -> transfer/resolve -> report.
- End with business promise and CTA.

### Minecraft/block avatar format
- Use stylized block avatars and blocky UI, not literal copyrighted Minecraft assets unless licensed.
- Create voxel-inspired characters/worlds with original textures.

## Guardrails

- Do not guarantee 100% match to a reference before seeing it and producing a pilot render.
- Do not claim Remotion alone can do photoreal generative video. Use provider/VFX path for realism.
- Do not deliver only a script if Carlos asked for a video; render a file or state the blocker.
- For Instagram/Direct strategy, generate videos and response scripts, but do not automate spammy engagement.
