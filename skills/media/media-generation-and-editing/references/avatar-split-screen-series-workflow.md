# Avatar + split-screen short-video series workflow

Use when Carlos wants to build a high-volume short-video series where an original recording is a **reference for his digital twin/avatar**, not the final clip.

## Correct interpretation

If Carlos says the source video should be used to create an avatar/gêmeo digital, do **not** simply trim the original and add a title. The source video should be treated as reference material for:

- face/appearance, posture, outfit, and energy;
- a still frame or short clip for avatar/lipsync tools;
- voice/style reference if authorized and technically supported;
- optional B-roll only if it helps the final story.

The requested final artifact is usually:

```text
script written for the episode
→ avatar/digital twin of Carlos speaking that script
→ coherent upper-panel visuals matching the spoken points
→ split-screen vertical 9:16
→ subtitles/captions + CTA
→ final MP4 for approval/posting
```

## Required workflow

1. **Confirm avatar intent.** State that the original video is reference material, not the final video.
2. **Extract reference assets:** contact sheet, several good face/torso frames, one short reference clip, and optionally clean audio.
3. **Write the new script** for the episode before rendering.
4. **Storyboard upper-panel visuals** time-aligned with the speech: demo, CRM, flow diagram, dashboard, screenshots, B-roll, or generated visual cards.
5. **Generate or obtain the speaking avatar** via an authorized route:
   - HeyGen/D-ID/Synthesia or similar for fast commercial quality;
   - SadTalker/LivePortrait/Wav2Lip/Hallo/MuseTalk on a GPU-capable environment;
   - another approved avatar/lipsync API.
6. **Only after avatar video exists**, assemble the final split-screen with FFmpeg.
7. Verify duration, resolution, file size, audio sync, subtitles, and legibility before saying it is ready.

## Layout pattern

For 1080x1920:

- upper panel: 1080x960 for coherent visuals;
- lower panel: 1080x960 for Carlos/avatar talking;
- subtitles should not cover the mouth when lipsync quality matters;
- use large text only; avoid tiny UI text that becomes unreadable in Reels/TikTok.

## Pitfalls

- **Do not deliver a trimmed original as the final output** when the user asked for a digital-twin/avatar video. That misses the product.
- Do not claim the avatar was generated unless an actual avatar/lipsync render exists.
- If image/video generation tools are not configured, still produce useful assets: script, storyboard, reference frames, upper-panel placeholder video/cards, and an explicit render handoff.
- Do not automate posting until Carlos approves avatar likeness, voice, subtitles, CTA, and overall quality.

## Deliverables to prepare before final render

- `episode_script.md` — exact spoken script;
- `storyboard.md` — time-aligned upper-panel visual plan;
- `contact_sheet.jpg` — source-frame overview;
- `avatar_reference_frame.jpg` or short clip;
- `upper_panel.mp4` — coherent visual track;
- `avatar_talking.mp4` — generated speaking avatar;
- `final_split_screen.mp4` — verified final output.
