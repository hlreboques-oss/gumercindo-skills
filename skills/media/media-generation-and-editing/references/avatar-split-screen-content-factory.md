# Avatar split-screen content factory

Use when Carlos wants a serial video factory where his original footage is used as **reference** for a digital twin/avatar, not as the final cut.

## Key workflow correction

If Carlos sends a raw/selfie/original video and says he wants an AI video/avatar:

- Do **not** simply trim the original and add a fixed title.
- Treat the original as reference material for: face, posture, clothing, voice/energy, and optional B-roll.
- The final target is usually a new scripted video:

```text
new script approved by Carlos
→ avatar/digital twin speaks the script
→ top half shows coherent visuals/demos/prints/B-roll
→ bottom half shows Carlos/avatar speaking
→ captions/CTA
→ approval before posting
```

## Recommended architecture for low VPS footprint

Prefer hosted avatar generation plus local post-production:

```text
HeyGen/D-ID/Synthesia/manual or API avatar render
→ local FFmpeg/Python split-screen assembly
→ Telegram/group approval
→ manual or semi-automatic posting
```

For Carlos's current product direction, default recommendation:

- **HeyGen/manual first** to calibrate clone quality and avoid local GPU/model setup.
- **API later** when the style converts and volume justifies automation.
- API is usually for automation, not necessarily lower cost; paid plans may be needed to remove watermark or unlock API.
- Avoid promising that API bypasses free-plan watermark; watermark is normally a plan/credit limitation.

## Open-source local alternatives

Useful projects: SadTalker, LivePortrait, Wav2Lip, MuseTalk, Hallo/Hallo2. Use only when there is enough GPU/storage/time to install and maintain models. They can reduce per-video provider spend but increase setup, maintenance, and instability.

## Minimum factory folders

```text
ai-video-factory/
  queue/              job JSON per video
  scripts/            render and provider scripts
  assets/avatar_refs/ reference frames/clips
  assets/top_visuals/ top-half videos/cards/demos
  output/             final MP4s
  logs/               provider/render logs
  templates/          env/n8n templates
```

## Job status pattern

```text
idea
→ script_ready_waiting_avatar
→ avatar_render_submitted
→ avatar_ready
→ rendered_waiting_approval
→ approved_for_posting
→ published
```

## Rendering pattern

Use local FFmpeg to create a 1080x1920 final:

- top visual: scale/crop to 1080x960;
- avatar video: scale/crop to 1080x960;
- stack with `vstack`;
- use avatar audio as master;
- verify final with `ffprobe`.

## Verification

Before claiming the factory works:

- render at least one real split-screen MP4, even with a placeholder avatar if provider setup is pending;
- verify resolution, duration, codec, and file size;
- state clearly when the avatar generation step is pending provider login/API key/paid plan;
- deliver the final MP4 only after inspecting or probing it.
