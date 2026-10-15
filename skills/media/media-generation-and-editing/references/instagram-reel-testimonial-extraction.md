# Instagram Reel testimonial extraction

Use this when Carlos sends Instagram Reel links and asks to extract the best testimonial/quote for a presentation, proposal, or sales proof.

## Goal

Turn the real spoken content into a short, slide-ready testimonial. Do not invent the quote when the Reel cannot be accessed.

## Access workflow

1. Try direct extraction first:
   - `yt-dlp --no-playlist --write-info-json --write-auto-subs --sub-lang 'pt,en' --skip-download <url>`
   - If downloading is needed, download the Reel and transcribe the audio locally.
2. If Instagram returns `empty media response`, `Page Not Found`, 404, or login-only content:
   - Search the shortcode/public URL for mirrored caption/transcript only as a secondary path.
   - If no reliable source appears, stop and ask Carlos for the actual media: Telegram upload, screen recording while playing the Reel, audio, or copied transcript.
3. If a VPS/remote browser is logged into Instagram, it may be used to view the Reel visually, but do not treat that as a transcript unless the audio/text is actually captured or heard/transcribed.

## Extraction standard

For each Reel, produce:

- faithful raw quote or close transcript of the strongest sentence;
- cleaned slide version, preserving meaning;
- one-line context label, e.g. “cliente falando sobre velocidade”, “percepção de profissionalismo”, “facilidade de entender a mensagem”;
- optional combined testimonial if two Reels reinforce the same point.

## Slide-ready formats

Short quote:

```text
“[frase forte em linguagem natural].”
```

Presentation card:

```text
O que o vídeo de IA gerou:
“[depoimento enxuto]”

Impacto percebido: [clareza / profissionalismo / velocidade / autoridade / engajamento].
```

## Pitfalls

- Do not fabricate a testimonial from only the Reel URL.
- Do not summarize generic benefits of AI video when Carlos asked for the best part of a specific video.
- Do not call a blocked/private link “analyzed”; report the exact blocker and request the media.
- Keep the final testimonial short enough for a slide; avoid long transcripts unless Carlos asks.