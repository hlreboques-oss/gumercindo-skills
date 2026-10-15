# Gumercindo modern 3D AI video factory

Use when Carlos says the visuals need to be modern 3D / advanced animation / AI-generated style and explicitly does **not** want the local PIL/card/2D mascot fallback.

## Correction from Carlos

Carlos does not mean “make another local animated drawing.” He wants the **model/style itself** changed: modern AI-generated video that matches what is working in viral AI videos — 3D cinematic mascot, symbolic business scenes, motion, and micro-scenes representing the operation.

Do not keep using the same PIL/FFmpeg card pipeline and only alter the visuals. Treat it as a new production system.

## Research-backed routes checked July 2026

High-signal GitHub/model ecosystem:

- `Wan-Video/Wan2.2` / `Wan-Video/Wan2.1` — open advanced video generation models.
- `lllyasviel/FramePack` — practical video diffusion workflow, good for short controlled clips.
- `Tencent-Hunyuan/HunyuanVideo` — high-quality open video generation framework.
- `Lightricks/LTX-Video` — faster/leaner video generation route.
- `zai-org/CogVideo` — text/image-to-video generation.
- `Comfy-Org/ComfyUI` — graph/API backend for image/video generation workflows.
- `kijai/ComfyUI-WanVideoWrapper` — Wan video in ComfyUI.
- `Kosinkadink/ComfyUI-VideoHelperSuite` — video load/save/helper nodes.
- `Fannovel16/ComfyUI-Frame-Interpolation` — smooth FPS/motion interpolation.
- `cubiq/ComfyUI_IPAdapter_plus` — character/style consistency via reference images.

## Correct architecture

1. **Creative system**: fixed Gumercindo 3D character reference + visual bible.
2. **Storyboard pack**: 6–8 micro-scenes, 3–5 seconds each, each with visual action and provider prompt.
3. **Real generation route**:
   - API route: Kling / Runway / Veo / Luma / Pika / fal.ai / Replicate / RunPod.
   - Self-host route: rented GPU + ComfyUI + Wan/FramePack/LTX/Hunyuan + IPAdapter/reference image.
4. **Post-production**: FFmpeg assembly, narration, SFX, big captions, CTA, QA frames.
5. **Approval** before publishing.

## Gumercindo factory files

Current scaffold lives at:

```text
/root/gumercindo_ai_video_factory
```

Main files:

- `README.md` — research and architecture.
- `creative_bible.md` — 3D character/style rules.
- `scene_schema.json` — micro-scene schema.
- `generate_storyboard_pack.py` — creates prompts/storyboard package.
- `check_routes.py` — checks whether provider keys/GPU/ComfyUI are available.

## Route check reality

If no `FAL_KEY`, `REPLICATE_API_TOKEN`, `RUNPOD_API_KEY`, `RUNWAY_API_KEY`, `KLING_API_KEY`, `LUMA_API_KEY`, or `GEMINI_API_KEY` is available and no NVIDIA GPU is present, do not claim a real 3D AI video can be rendered locally. Produce the storyboard/prompt pack and report the missing route honestly.

## Visual target prompt seed

```text
friendly Brazilian AI employee mascot named Gumercindo, premium 3D animated character, small rounded robot assistant, expressive cyan glowing eyes, warm smile, clean white and cyan body, subtle northeastern Brazilian design accents in gold and turquoise, cinematic 3D animation, Pixar/Unreal-like quality, modern small-business office, holographic business workflow UI, vertical 9:16, high-retention Instagram Reels aesthetic, no logos, no watermark
```

## Free/local Blender fallback discovered July 2026

When Carlos cannot spend on fal/Kling/Runway and the VPS has no NVIDIA GPU, use Blender as the free 3D fallback instead of PIL/cards:

1. Install Blender if needed:
   ```bash
   apt-get update -qq && apt-get install -y blender libegl1 libegl-mesa0 libgl1 libopengl0 libglu1-mesa
   ```
2. Create a real 3D mascot/scene in Blender with robot mascot, business symbols, CRM/funnel/cards, and 9:16 camera.
3. Do **not** attempt full EEVEE animation on this small CPU VPS unless render time is acceptable. In testing, one EEVEE frame took ~37s.
4. Use `BLENDER_WORKBENCH` with material colors for fast 3D key-scene renders. Make sure `material.diffuse_color` is set; otherwise Workbench may render gray.
5. Render 5–8 keyframes from the Blender timeline, then animate them in FFmpeg with `zoompan`/segment concat and add TTS narration.
6. Avoid a single looping image with `zoompan` over the whole audio; render each image as its own segment first, then concat. Otherwise the final MP4 can get stuck on the first scene.
7. QA with contact sheets extracted from the final MP4, not just source images, to verify scenes actually change.

This is not the same as AI-generated Kling/Wan video, but it is genuine local 3D and closer to Carlos’s desired visual language than flat cards.

## Hard rule

Only call it “modern 3D AI-generated video” after actual image/video model generation. If fallback uses local Blender, label it as free/local 3D fallback. If fallback uses local drawing/cards, label it as fallback and do not present it as the requested final style.
