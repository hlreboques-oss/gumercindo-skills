# GitHub short-video tooling + viral Reels upgrade notes

Use this when Carlos says current Gumercindo videos are not getting views and asks for better-quality, attractive/viral short videos, especially if he asks to search GitHub.

## GitHub repos worth inspecting first

These were useful discovery targets for a better short-video stack:

- `ali-abassi/remotion-templates` — curated Remotion templates and references for captions, visualizers, effects, transitions and agent-created videos.
- `itsjwill/vanta` — larger Remotion-based AI video engine concept: avatars, animated captions, transitions, voice/video integrations. Treat as inspiration/inspection target before adopting because it is broad/heavy.
- `mehbul/chopify` — local Opus Clip/Submagic-style long-video-to-short pipeline: faster-whisper, scoring, auto reframe, word-by-word captions, ffmpeg.
- `nikhil-reddy05/auto-captions` — focused Python/ASS/ffmpeg per-word burned-caption implementation; good for CapCut-style captions.
- `GabrielLaxy/TikTokAIVideoGenerator` — vertical script/image/TTS/caption/video generator; useful for faceless/scripted AI videos but requires API-key review.
- `trykimu/videoeditor` and `openvideodev/react-video-editor` — richer browser/editor foundations; likely too heavy for a first Gumercindo content iteration but useful for future editor/SaaS direction.

## Creative correction for Gumercindo videos

When views are weak, do not only make a prettier version of the same slow explanatory video. Rebuild around retention:

1. Hook in first 1–2 seconds: name a misconception, leak, or sharp contrast.
2. Translate technical work into business proof: comments, direct, CRM, follow-up, content, lead capture, meeting route.
3. Use simple words for entrepreneurs; avoid leading with API/token/webhook/runtime.
4. Make captions large and central enough for mobile viewing.
5. Change visual state every ~3–6 seconds: scene change, object motion, card transition, phone/CRM/owner/IA metaphor.
6. Include proof language: “erro real, correção real, prova real”.
7. End with one CTA keyword, usually `GUMERCINDO`.

## Practical first implementation path

For a fast verified MVP before installing a heavy repo:

1. Write a 45–60s script with a stronger hook.
2. Generate TTS narration.
3. Render a local 1080x1920 MP4 with animated cards, phone/CRM/lead metaphors and large burned captions.
4. `ffprobe` the final file for duration, codecs and size.
5. Extract QA frames/contact sheet and inspect text contrast/legibility before delivery.
6. Only after the direction is approved, graduate the same story format to Remotion + animated captions + richer transitions.

## QA pitfalls from the session

- A white or translucent text card on a bright background can look washed out in a contact sheet. Use either dark text on an opaque light card or white text on a dark opaque card.
- If the QA contact sheet accidentally shows the same scene in every tile, re-check the frame extraction command or timestamps before assuming the entire video lacks variation.
- Keep final MP4 under the chat/platform limits when possible; otherwise provide a validated file/link path.

## Suggested Gumercindo narrative skeleton

```text
[Hook] Eu passei três dias testando um funcionário de IA na prática.
[Contrast] Não um chatbot bonito. Um operador.
[Conflict] A Meta travou, a página certa não aparecia, a conexão não enxergava a conta.
[Action] Mesmo assim ele criou cortes, legendou vídeos, programou Reels, montou CRM e preparou mensagens.
[Business value] Eu penso a estratégia; a IA executa o operacional.
[Proof] Erro real, correção real, prova real.
[CTA] Se sua empresa perde oportunidade no WhatsApp, Instagram ou follow-up, comenta GUMERCINDO.
```
