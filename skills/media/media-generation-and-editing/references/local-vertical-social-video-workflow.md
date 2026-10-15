# Local vertical social-video workflow

Use this when Carlos asks for a quick Instagram/Reels/TikTok-style creative from a script and does not require cinematic/generated footage. The goal is a real MP4 with narration, captions, and concept visuals, produced mostly locally to avoid video-generation API cost.

## Pattern

1. Confirm/choose platform defaults if not specified:
   - Vertical 9:16.
   - 1080x1920 MP4.
   - H.264 video + AAC audio.
   - Burned-in captions for social viewing.
2. Create narration first with the configured TTS provider.
   - Save a durable audio file under the project folder.
   - Probe duration with `ffprobe`.
3. Build visuals locally when speed/cost matters:
   - Use PIL/Pillow to generate branded scene cards.
   - Use simple icons/metaphors that match the narration: leads, WhatsApp, money escaping, CRM/agenda, owner, growth, CTA.
   - Keep titles short and high-contrast; avoid dense paragraphs on screen.
4. Allocate scene durations based on audio length and scene text weight.
5. Render with ffmpeg:
   - Concatenate scene PNGs into a vertical MP4.
   - Combine with narration audio.
   - Use `-pix_fmt yuv420p`, `libx264`, `aac`, and `-movflags +faststart` for Telegram/Instagram compatibility.
6. Add burned-in captions:
   - Generate ASS/SRT chunks from the narration text.
   - Keep 1–2 short lines per caption.
   - Place captions safely above the lower UI area.
7. Verify before delivery:
   - `ffprobe` width/height, streams, duration, size.
   - Extract one mid-video frame and one CTA/final frame.
   - Inspect frames for legibility, no cuts, no overlap, and CTA clarity.
   - If using PIL/Pillow text overlays, avoid emoji unless a tested color-emoji font is available; missing glyphs render as square boxes in the final MP4. Prefer simple text badges/icons (`IA`, `500+`, `REC`, `GO`) or verify frames with vision and re-render before delivery.
8. Deliver the MP4 as a native media attachment when possible.

## Notes for Carlos/Gumercindo creatives

- If Carlos asks for “imagens dando a entender o que está sendo falado”, do **not** stop at pretty title cards. His preferred improvement is representational visual storytelling: mascot/character scenes, 3D/cartoon-style symbols, WhatsApp/Instagram/CRM/funnel/business-owner objects, and figures that visibly show what the narration says.
- Local concept cards are acceptable only as a fast fallback/MVP test; label them honestly and do not imply they are photorealistic/generated footage.
- For higher-retention Gumercindo Reels, design each scene as a visual metaphor before rendering: lead freezing, comment bubble waiting, views failing to become conversation, Gumercindo operating a conveyor of content/CRM tasks, owner thinking while IA executes, CTA as an action card.
- For local mascot/symbol animation when image/video generation APIs are unavailable: use PIL/Pillow layered shapes with shadows/highlights to simulate 3D; animate mascot bob/wave, floating bubbles, progress bars, cards, phones, CRM boards, arrows, checkmarks, and scene transitions. Avoid plain static cards unless the user explicitly wants a low-effort draft.
- For Carlos’s “bonecos de massinha” videos, avoid a few long static scenes. Prefer many short micro-scenes (roughly 3–6 seconds each), with simple puppet motion, arm waving, walking/bobbing, object handoffs, speech bubbles, checkmarks/gears/products appearing, and characters visibly interacting.
- If the source benchmark is ~90 seconds but the narration style is slow/clear, explain that a 430-word script may become ~2.5–3 minutes. Offer a shorter cut if they want to preserve the exact tempo.
- Track cost honestly: local PIL/ffmpeg rendering uses no video-generation API; external calls are mainly TTS, any vision QA, and the conversation/model calls. If an image/video generation provider is missing credentials, capture that as a setup blocker and switch to local mascot/symbol animation instead of asking Carlos to accept a text-card video.

## Common ffmpeg settings

```bash
ffmpeg -y -f concat -safe 0 -i concat.txt \
  -vf 'fps=30,format=yuv420p' \
  -c:v libx264 -preset medium -crf 23 visual.mp4

ffmpeg -y -i visual.mp4 -i narracao.ogg \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 128k -shortest -movflags +faststart final.mp4

ffmpeg -y -i final.mp4 \
  -vf "subtitles=captions.ass:force_style='Fontsize=58,Alignment=2,MarginV=240'" \
  -c:v libx264 -preset medium -crf 22 -c:a copy \
  -movflags +faststart final_legendas.mp4
```
