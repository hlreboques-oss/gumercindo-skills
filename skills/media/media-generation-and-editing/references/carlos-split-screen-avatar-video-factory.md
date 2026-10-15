# Carlos split-screen avatar video factory

Use when Carlos wants short-form videos where a digital twin/avatar speaks in one half of the screen while contextual visuals play in the other half.

## Critical interpretation

When Carlos sends an original recording for this workflow, do **not** assume he wants the original clipped with a fixed title. Often the recording is a **reference asset** for:

- avatar/digital-twin appearance;
- voice/posture/energy reference;
- extracting frames for avatar setup;
- optionally B-roll only if it supports the final concept.

The expected deliverable is usually a **new scripted video**:

```text
new script → avatar/clone speaks it → contextual top visuals → split-screen edit → captions/CTA → approval before posting
```

## Recommended MVP stack

- HeyGen or similar for authorized avatar/clone when quality matters and the VPS has no GPU.
- Local Python/Pillow/FFmpeg for top visual cards, captions, layout, compression, and QA.
- n8n or a dedicated Telegram bot for queueing, approval, and status.
- Avoid heavy local SadTalker/LivePortrait/Wav2Lip setup unless a suitable GPU/runtime is available and quality/cost justify it.

## Split-screen layout

Default vertical 9:16:

- canvas: 1080×1920;
- top: 1080×960 contextual proof/demo/cards/prints/video;
- bottom: 1080×960 avatar speaking;
- captions must be readable and should reinforce the spoken points;
- CTA should be explicit, e.g. “chama AGENTE”.

## Workflow

1. Confirm whether the user's media is reference, B-roll, or final footage.
2. Extract a contact sheet and one or more portrait/reference frames if the media is for avatar setup.
3. Write a fresh short script with hook, proof, transformation, CTA.
4. Build a storyboard mapping each spoken segment to top-screen visuals.
5. Generate avatar video via approved provider/account.
6. Generate or collect top visuals.
7. Use FFmpeg to stack top and avatar videos, using avatar audio as master.
8. Verify output with ffprobe and a visual thumbnail/contact sheet before delivery.

## Common failure to avoid

Do not deliver a simple crop/title overlay of Carlos's source video when he asked for a digital twin/avatar workflow. If unsure, ask/confirm: “Este vídeo é referência para avatar ou é o material final a cortar?”
