# HeyGen / AI clone video factory for Carlos

Use this when Carlos Júnior asks about a video-production service where a client submits an idea and receives a ready or near-ready short video using an authorized avatar/clone.

## Operating principle

Treat the video factory as a second product/accelerator for the sales machine, not the first core MVP. The sales machine creates leads and meetings; video generation supplies content, proof, and a scalable service offer.

## Consent and rights

Only create or use a digital clone/avatar/voice with explicit authorization from the person/company. Keep avatar/voice assets separated by client. Do not suggest cloning third parties without consent.

## Two implementation paths

### Fast browser-assisted path

Use when Carlos already has a HeyGen subscription and wants a quick pilot:

1. Client/Carlos submits idea.
2. Agent creates script, hook, CTA, caption, and platform adaptation.
3. Carlos/client approves script.
4. Generate manually or semi-manually in HeyGen web UI with existing avatar/template.
5. Download video.
6. Add captions/CTA/editing if needed.
7. Deliver and log status in CRM.

This is fastest but less scalable.

### API/n8n scalable path

Use when moving from pilot to productized queue:

1. Intake via Typebot/form/panel/Telegram: idea, offer, audience, platform, desired style, avatar, CTA.
2. Agent writes script and short-video variant.
3. Approval gate changes CRM status to `approved_for_render`.
4. n8n calls HeyGen API with selected avatar/voice/template or audio.
5. Poll job status until video is ready; do not treat job submission as completion.
6. Download final video, verify file/duration/codec.
7. Optional post-process: subtitles, cover/title, CTA screen, watermark/brand kit.
8. Deliver link/file and update CRM to `ready`.

## CRM fields for video tasks

- client/company
- idea/prompt
- product/offer
- target platform
- video type: educational, sales, invite, proof, behind-the-scenes
- avatar/voice
- script
- CTA
- status: idea, scripting, awaiting approval, rendering, editing, ready, delivered
- HeyGen job/video ID
- final URL/file
- cost/credits
- publish status and metrics

## Recommended first offer

For Carlos's current commercial direction, test: "Transforme suas ideias em vídeos com seu clone digital, sem precisar gravar todo dia." Use a quiz to qualify:

- business/segment
- current content frequency
- biggest content bottleneck
- wants own clone or avatar presenter
- desired videos per week
- platform priority
- interest in a demo or sales call

## Guardrails

- Keep human approval before render until voice, style, CTA, and legal consent are calibrated.
- Verify generated video exists before claiming delivery.
- Track provider credits/cost per video.
- If using API, return provider job/video IDs and poll/download artifacts.
- Separate this from publishing automation; only auto-post after approval and brand style are proven.