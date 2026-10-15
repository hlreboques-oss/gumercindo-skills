---
name: media-generation-and-editing
description: "Use when creating or transforming audio/video media: music prompts and generation, spectrograms/features, ASCII video, Manim animations, and talking-head/lipsync clips."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [media, video, audio, music, lipsync, manim, ascii-video, spectrogram, generation]
    related_skills: []
---

# Media Generation and Editing

## Overview

This umbrella covers generated and transformed media outputs. The shared class workflow is: understand the intended audience and platform, choose a generation/editing route, produce a real file or provider prompt, verify the output artifact, and provide a reliable delivery path.

## When to Use

Use this when the user asks to:

- Write lyrics, structure songs, or produce prompts for music-generation tools.
- Generate music/audio with providers or local models such as HeartMuLa/AudioCraft.
- Analyze audio features or create spectrogram/chroma/MFCC visualizations.
- Convert footage or audio into ASCII-style video/GIFs.
- Create math/algorithm explainer animations with Manim.
- Create talking-head or lipsync videos from a portrait and script.

## Workflow

1. **Determine target**: platform, duration, aspect ratio, tone, language, voice/music style, and delivery format.
2. **Choose mode**:
   - Prompt/lyrics only when the user wants input for a generator.
   - Local/provider generation when they want a finished media file.
   - Analysis/visualization when the source audio/video is primary.
   - Animation/lipsync/ASCII transformation when there is a specific visual treatment.
3. **Prepare assets**: validate input paths/URLs, dimensions, duration, codecs, and rights/permission.
4. **Run the toolchain**: use the relevant CLI/provider/script; do not invent media outputs.
5. **Verify output**: check file exists, duration/size/codec, and visually or audibly inspect when practical. For subtitle-burned videos, inspect a contact sheet/frame after render for literal escape artifacts (for example visible `\\` or `\N`), cropped titles, and clipped subtitle lines; re-render before delivery if any appear.
6. **Deliver robustly**: provide the artifact path/link and fallbacks for large files or chat platforms.

## Subsections

### Serial Short-Video Factories

When the user wants to produce videos in series, prefer a split architecture: a render engine does media generation, while n8n/Sheets/Telegram handle queueing, status, approval, and publishing. Start with generate → human approval → publish; only automate posting after voice, subtitles, CTA, and visual style are calibrated. If Carlos Júnior explicitly wants the factory to run without spending the main Gumercindo/Hermes conversation tokens, route Telegram group commands through a **dedicated bot or n8n workflow** that calls local scripts/API endpoints directly; do not use the main assistant bot as the trigger. For HeyGen/avatar/clone video services where a client submits an idea and receives a ready short video, use `references/heygen-ai-clone-video-factory.md`; require explicit clone/voice consent and track approval, render job ID, credits/cost, and delivered artifact. When Carlos sends original footage as a reference for a gêmeo digital, do **not** simply cut/compress/title the original; treat it as avatar reference material and build a split-screen factory output (contextual visuals on top, avatar speaking a new script below) using `references/ai-avatar-split-screen-content-factory.md`. When Carlos provides an original recording as **reference for a digital twin/avatar**, do not treat it as the final clip to trim/title; extract reference frames/clips, write a new script, storyboard the upper-panel visuals, generate/obtain the speaking avatar first, then assemble the split-screen final. Use `references/avatar-split-screen-series-workflow.md`. For MoneyPrinterTurbo specifically, see `references/moneyprinterturbo-n8n.md` for API endpoints, Docker pattern, migration checklist, n8n integration, and a known-good local-material payload; see `references/moneyprinterturbo-video-factory.md` for the dedicated Telegram bot pattern, migration notes, low-cost modes, and split-screen/reaction post-processing upgrades.

When Carlos sends raw/original footage for a digital-twin content series, treat that footage as **avatar/reference material**, not as the final clip to trim and title. The intended output is usually a new scripted split-screen video: top half with coherent visuals/demos/prints and bottom half with Carlos/avatar speaking the generated script. Prefer hosted avatar generation such as HeyGen for the first MVP when VPS storage/GPU is constrained, then local FFmpeg post-processing and approval. See `references/avatar-split-screen-content-factory.md`.

### Fast local vertical social videos

When Carlos asks to turn a script into a finished Reel-style video and does not explicitly require cinematic/generated footage, use the low-cost local path first: TTS narration, PIL/Pillow concept visuals, ffmpeg assembly, burned-in captions, and frame QA. This produces a real MP4 without video-generation API spend. See `references/local-vertical-social-video-workflow.md` for the repeatable workflow, ffmpeg settings, verification steps, and cost notes. If Carlos says current videos are not getting views and asks for GitHub/skills to make them more attractive or viral, inspect `references/github-short-video-tooling-and-viral-reels-upgrade.md` and rebuild around retention-first structure: sharp 1–2s hook, business proof, fast visual state changes, large mobile captions, and one CTA keyword. If Carlos instead pauses videos because results were poor and the next credible quality upgrades require paid tools he does not want to buy, stop the video routine immediately, pause active cron/jobs, do not keep iterating the same low-cost visual path, and wait for a new skill/tooling route before resuming.

If Carlos clarifies that the problem is the **visual model itself** — modern 3D, advanced animation, generated AI video, mascots/symbols, or scenes that represent what the narration is doing — do **not** keep iterating the local PIL/card/2D drawing path. Treat it as a different production class: research/choose a real video-generation route, create a 3D character/style bible, produce a micro-scene storyboard with provider prompts, and render via a real image/video model or clearly stop at a prompt pack if keys/GPU are missing. See `references/gumercindo-modern-3d-ai-video-factory.md`.

When Carlos provides raw narration/talking-head footage and asks to show the imagined scene/action, do not substitute PIL drawings or old local illustrated cards. Use Google Flow/Veo clips as the reenactment layer: transcribe and timestamp the narration, split it into 8–10s scene beats, generate one Flow clip per beat, download the 720p MP4s, then assemble them with the original voice and intermittent talking-head shots. See `references/gemini-tts-and-flow-video.md` for the Flow workflow, VPS route, download pattern, and final FFmpeg assembly.

When Carlos asks for a low-cost “photo + hyped/reference video + product/script -> finished avatar/product video” system, prefer a staged factory: first benchmark quality with hosted models/APIs, then self-host a batched ComfyUI/Gradio/n8n workflow on rented GPU. The core low-cost stack is LivePortrait for facial motion/expression transfer, MuseTalk or LatentSync for lip sync, and FFmpeg for product overlays/captions/final vertical packaging. Treat internet videos as motion/emotion references only; require client consent for likeness/voice and avoid unlicensed endorsement reuse. See `references/low-cost-portrait-product-video-factory.md`.

### Daily avatar review videos for Gumercindo OS

When Carlos refers to the daily “review do dia”, “interação entre eu e você”, “vídeo com avatar”, or a video narrating what happened between Carlos and Gumercindo, do **not** route to the generic 3-post Instagram content factory. The expected deliverable is one vertical narrated behind-the-scenes/review video: recover the day’s recent conversation, write a first-person Gumercindo script, render a real MP4, verify it with `ffprobe`, and deliver it for approval only.

Carlos corrected the creative standard for this class: an existing avatar clip in a loop with narration over it is not good enough as the main creative. If an avatar is used, it should be a real talking avatar/lipsync render where the mouth/face speaks the exact script. Otherwise, prefer a non-avatar visual story with premium local/generative scenes and state honestly that no lipsync was used. The narrative should be simple and business-facing, not technical: translate tokens, APIs, webhooks, runtimes, and schemas into business outcomes such as “a conexão”, “a esteira de comentários e direct”, “o computador de trabalho do Gumercindo”, and “lista organizada de oportunidades”. Use a hook → tension → action → correction/learning → business value → CTA arc.

For the local visual fallback, avoid stacking two caption systems over the same lower-third. If the PIL/card scene already contains title/body text, do **not** also burn ASS subtitles in that same area; either reserve a separate safe caption band or rely on concise on-card text plus narration. Always extract mid/final QA frames and inspect for overlap/cropping; if text collides, re-render immediately by reducing title font size, increasing vertical spacing, wrapping/centering node labels, or removing the extra subtitle layer before delivery. Avoid decorative emoji glyphs in locally rendered PIL/FFmpeg text unless the exact font is verified in QA; if frames show square boxes or missing icons, re-render with numbered badges, simple geometric icons, or text labels instead. If FFmpeg still-image animation filters such as `zoompan` produce black/blank QA frames with only subtitles visible, do not deliver: re-render using a simpler concat-demuxer/static-scene pipeline or another verified filter chain, then extract QA frames again. For diagram/flow cards, draw connector lines behind nodes or route them around labels so text remains legible.

If a cron/job only produced a text draft, say that clearly and update the job to render video rather than claiming a video was generated. Do not imply new lipsync/avatar generation happened if it did not.

### Composio/Gemini realistic avatar clips

When Carlos asks for an avatar “with Gumercindo’s appearance” or a realistic AI presenter, use Composio tool discovery first and prefer Gemini/Veo if available. Veo clips are short (typically 4/6/8 seconds) and text-to-video only, so create the avatar/background motion with Veo, then assemble the final social clip locally: generate a concise Portuguese TTS narration, loop/trim the Veo MP4 as needed, burn captions with FFmpeg/ASS, and verify duration, streams, and frames. Do not claim it is Carlos’s real clone unless an avatar/clone platform with explicit consent is connected; describe generic Gumercindo-style avatars as AI-generated presenters. Avoid emoji glyphs in local rendered text unless the font is verified — broken emoji boxes on QA frames should trigger re-render with text badges/icons instead.

When Carlos asks for a digital twin/avatar split-screen video, treat his uploaded original recording as a reference asset unless he explicitly asks for a simple cut. The expected output is usually a newly scripted avatar/clone speaking in one half of the frame with contextual visuals in the other half, not a title overlay on the original. See `references/carlos-split-screen-avatar-video-factory.md`.

For Google Flow/Veo campaign clips, use structured JSON prompts with a reusable character bible when continuity matters. Define the named character’s face, hair, beard, clothes, watch, body type, and a strict “do not substitute actor” rule in every clip. Vary camera language deliberately (orbit, top-down, dolly in/out, lateral tracking, macro, whip pan) so sequences do not feel like one static angle. Keep scene descriptions visual and avoid writing area names into the visual action; if the prompt says “CRM”, “follow-up”, or “customer service”, Veo may literalize those words as bad on-screen labels. Represent areas with abstract icons/motion and reserve all readable CTA text for post-production: leave a clean lower-third and add text like “TOQUE E SAIBA MAIS ↓↓↓” in editing. If Flow voice continuity or pacing is weak, generate/assemble the video clips as visuals, strip or lower their audio, and overlay one continuous narration track from the approved script; then trim silent gaps with `silencedetect`/FFmpeg and QA with a contact sheet plus exact frames for character consistency and unwanted text.

When Carlos sends a large phone video through a Drive link because Telegram cannot accept the original, download it, probe it, create a 30–60s vertical social cut with blurred background/title bars if speed matters, extract a thumbnail for visual QA, verify file size/duration, then deliver the MP4. See `references/phone-video-to-vertical-series-cut.md`; the helper script `scripts/phone_vertical_series_cut.sh` reproduces the fast ffmpeg cut pattern.

### YouTube Live / podcast clipping into Shorts

When Carlos sends a YouTube Live/podcast URL and asks for Instagram/TikTok cuts, the deliverable is **real rendered MP4 clips**, not only timestamps. If `yt-dlp` or transcript APIs are blocked by YouTube bot/login checks, keep trying fallback routes before asking Carlos: DownSub-style subtitle extraction, public downloader progress APIs, YouTube frontends, or browser routes. Once transcript/media is available, select complete high-signal moments under 60s, render vertical 9:16 clips with burned captions, create a contact-sheet preview, visually QA title/subtitle legibility, validate every MP4 with `ffprobe`, and deliver both a ZIP and individual links. See `references/youtube-live-short-clips-fallbacks.md` for the exact fallback playbook that worked, including DownSub AES token flow, Loader.to progress polling, ffmpeg layout, and validation checklist.

If DownSub returns no subtitles but Loader.to can download the video, proceed with local transcription instead of stopping. For long lives, avoid loading a large Whisper model over the entire file at once: extract or chunk audio into ~10-minute WAV chunks, use `faster_whisper` tiny/int8 with VAD on CPU, merge segment offsets, and select clips from that transcript. During render QA, contact sheets should be inspected for title cropping, subtitle legibility, and literal escape artifacts. If long all-caps titles crop, re-render with shorter/two-line titles. Avoid `drawtext=textfile` with embedded newlines if it produces square glyphs; use separate `drawtext` filters for each title line. For ASS subtitles generated from Python, do not over-escape the line break: the event text should contain ASS `\N` as the line-break marker, and QA must catch any visible `\` or `\N` in rendered frames. See `references/youtube-live-carlos-cuts-local-transcription.md` for the local transcription + Carlos-centered promo cut workflow.

When Carlos specifically asks for **“somente minhas partes / Carlos Júnior falando”**, do not select generic guest highlights. Use the transcript turn markers and context to isolate Carlos's speaking segments (intro, questions, personal story, offer/CTA, closing). Keep each cut at or below 60 seconds; if a selected segment exceeds the limit after render/probe, shorten and re-render rather than delivering a >60s clip. After contact-sheet QA, shorten long top titles that crop in 9:16 (for example, replace verbose titles with punchier hooks) and re-render before uploading.

If Carlos specifies **“pegue só minhas partes / só Carlos Júnior falando”**, filter the transcript for host turns before rendering: use intro/outro lines, first-person references to Carlos’s story/book/AI work, his questions, and his CTA/networking segments; avoid guest monologues even when they contain strong content. It is acceptable to include a brief guest acknowledgment only when needed for context, but the clip’s value and speaking time should be Carlos-centered. Keep every selected segment under 60 seconds and re-render any accidental overrun before delivery.

For additional event-focused cuts from an already clipped live, load the previous interval manifest and assert no overlap before rendering. Select actual invitation, access/format clarification, and practical attendee benefits rather than repeating generic teaching. Refine only selected audio with medium Whisper; retain source claims as source claims, not newly verified offer availability. Omit uncertain venue-name audio instead of inventing its spelling. For ASS/SRT captions, cap every group end at the next group's start, format SRT timestamps explicitly as HH:MM:SS,mmm, and use `veryfast` for bounded CPU renders. Save each clip's ffprobe/checksum manifest as soon as it finishes, then inspect first/middle/end frames and decode the whole MP4 before delivery.

### Songwriting and Music Prompts

Separate craft decisions (theme, hook, structure, lyrics, genre tags) from provider-specific prompt syntax. Make prompts concise enough to paste into the target generator.

### Audio Generation

For local/model generation, confirm dependencies and hardware. For provider-backed generation, report job IDs/URLs and verify downloads before claiming success.

### Audio Analysis / Spectrograms

Use analysis outputs to answer the user's question, not just produce charts. Label axes/features and explain what the visualization shows.

### Locating the user's own footage when he references it vaguely

When Carlos says he already sent/has a video "in the folder" without a precise name or link, search his connected Google Drive before asking him to re-send: use `GOOGLEDRIVE_FIND_FILE` (via `COMPOSIO_MULTI_EXECUTE_TOOL`, tool_slug `GOOGLEDRIVE_FIND_FILE`, not a direct `mcp__composio__GOOGLEDRIVE_*` call — Composio Drive/Gmail tools only exist behind the multi-execute executor) filtered by `mimeType contains 'video/'` and a recent `modifiedTime`, ordered `modifiedTime desc`; `GOOGLEDRIVE_GET_FILE_METADATA` on a result's `parents[0]` confirms the folder name so you can match it to what he described. `GOOGLEDRIVE_DOWNLOAD_FILE` returns a presigned S3 URL that **expires in about 1 hour** — `curl` it to local disk immediately in the same turn rather than holding the link for later.

### Downloading a video from a short link (Pinterest, etc.)

`yt-dlp` resolves Pinterest `pin.it/...` short links (and most mainstream short-link video platforms) directly — it follows the redirect, pulls the pin JSON, and downloads the HLS stream with audio muxed in: `python3 -m yt_dlp -o 'name_%(id)s.%(ext)s' '<short-link>'`. No special flags needed; verify the result with `ffprobe` (duration/resolution) before using it as a style reference or asset.

### Local faster-whisper transcription: PyAV decode fails on this box

`faster_whisper`'s default audio loader calls `av.open(..., metadata_errors="ignore")`, which breaks against the PyAV build installed here (`TypeError: open() got an unexpected keyword argument 'metadata_errors'`) and pinning an older `av` fails to build (`pkg-config is required for building PyAV`). Bypass the internal decoder entirely: decode with `ffmpeg` to a raw PCM buffer and hand `WhisperModel.transcribe()` a numpy float32 array instead of a file path:
```python
import numpy as np, subprocess
def load_audio(path, sr=16000):
    cmd = ["ffmpeg","-i",path,"-f","s16le","-acodec","pcm_s16le","-ac","1","-ar",str(sr),"-"]
    out = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL).stdout
    return np.frombuffer(out, np.int16).astype(np.float32) / 32768.0
model.transcribe(load_audio("in.wav"), language="pt", vad_filter=True)
```
This sidesteps PyAV completely and works with `small`/`int8` on CPU for transcript-driven clip selection.

### Transcription of user-recorded audio/video

When Carlos asks to transcribe what he said in an audio/video, prioritize a faithful transcript over a polished rewrite: keep his wording, repetitions, informal phrasing, and natural pauses unless he explicitly asks for an edited script. When Carlos sends Instagram Reel links and asks for the best testimonial/quote for a presentation, extract from the real accessible media/transcript only; if Instagram returns empty media/Page Not Found/login-only content, do not invent a quote — ask for the uploaded video, screen recording, audio, or copied transcript. See `references/instagram-reel-testimonial-extraction.md`. If Telegram rejects the upload because the document is too large or size cannot be verified, do not keep asking him to do the same failed resend. First offer a Drive link path; if Carlos says “faz você” or asks Gumercindo to handle the process, create a simple temporary upload route on the VPS (private Tailscale URL first; if he cannot access it, a temporary Cloudflare quick tunnel), verify the form loads, send him only the upload link and minimal steps, then watch for receipt. Once the file arrives, probe the media, extract audio if needed, transcribe faithfully, and clearly label any uncertain words. See `references/large-telegram-media-upload-receiver.md` for the temporary receiver/tunnel pattern.

### ASCII Video

Prioritize readable source material, contrast, font/character density, and output codec. Test a short segment before long renders when feasible.

### Manim Animations

Write scene code, render, inspect logs, and deliver the resulting MP4/GIF. Keep mathematical notation and pacing legible.

### Anderson / user-recorded retention edits

For Carlos's Anderson edits, retain the approved simple vertical style: readable burned captions, normalized original speech, restrained punch-ins and transitions. Choose the most impactful authentic ~3-second spoken excerpt as a cold open, then resume the edited narrative in its natural order; keep that same excerpt when its original position arrives. Remove greetings, tangents, unnecessary names and repeated phrases without changing meaning. Target 30–60 seconds, using up to one minute only when needed for the message. Verify the hook actually repeats in the main timeline and total rendered duration stays under 60s. Transcribe before selecting; inspect word boundaries, rendered caption frames, and the finished audio transcript for clipped phrases. Save the approved edit to the user's media Drive folder and verify checksum/size. Editing authorization alone is not publication authorization.

### Birthday and testimonial compilations

When assembling user-provided greetings, inventory and probe every uploaded clip rather than assuming the approximate requested count. Preserve original speech: add short frozen-frame/silent handles before fading between clips, instead of overlapping speakers or trimming messages to an arbitrary limit. If the user approves dropping the avatar, render a narrated title-card opening with the approved wording; never imply lip sync. Edge TTS word-boundary offsets can align changing title-card phrases with one continuous narration. Normalize audio consistently and verify all source clips appear in the final timeline. Decode the complete MP4, inspect an opening/source contact sheet, then verify the uploaded Drive file's parent, size and MD5 against the local artifact before delivery.

### Reference-style event testimonial reels

When Carlos gives a reference Reel and asks for an implementation/event montage, analyze the reference before rendering: download it when possible, create a contact sheet, infer the rhythm, framing, transition language, music/SFX pattern, whether captions are present, and how long each speaker is kept. Then select short, complete spoken fragments from every distinct participant with a usable line, not only the three strongest testimonials; use room, screen, support, and Carlos-ministering shots as visual bridges over those audio fragments. If the first version feels bruto, make the cut denser and shorter: prefer 2–7s statements, then intercut Carlos explaining/teaching and proof shots so it feels like an event film rather than a raw testimonial roll. For this class, target roughly 60–90 seconds unless Carlos explicitly asks for a longer documentary cut; if a render lands near two minutes, tighten the speaker ranges before delivery.

For Gumercindo implementation/event pieces, avoid adding large kinetic words, title cards, or burned captions by default once Carlos asks for the clean reference-style montage; those overlays can fight the perception he wants. Prefer clean image, continuous music bed from start to finish, restrained cinematic grade, b-roll inserts, whip/flash/cross-blur transitions, and SFX hits tied to visible cuts. Use a fast opening burst of 1s environment/proof shots when the piece needs energy, then settle into coherent ~3s visual holds; 1–2s holds feel too abrupt for testimonial context unless they are only the intro burst. Keep each spoken testimonial fragment as a complete thought with a clear beginning, middle, and end; do not cut a sentence at the point where the reasoning is still open. If a participant's audio continues while the visual changes, cut only to neutral environment, screens, Carlos teaching/supporting, or the same participant — never to another participant's face, because it reads as if the wrong person is speaking. If he asks for the same music as a reference, reuse the exact track only when permission/scope is clear; otherwise create or source a similar mood bed and describe it as similar, not copied. During QA, if a contact sheet shows a black/dark tile, extract the exact output frame at that timestamp before re-rendering; contact-sheet sampling or vignette/fade timing can mislead, while the actual frame may be normal.

### Split-screen local business talking-head videos

When Carlos sends a short local-business talking-head video and a logo/image, and asks for split-screen animation representing the speech, produce a real vertical edit rather than a plan. First persist the Telegram video to a workdir, probe it, create a contact sheet, and transcribe the original speech. Build the edit with the original speaker video on top and a branded animated panel below; keep the original audio, normalize it, and avoid adding unreliable ASR captions unless Carlos specifically asks for subtitles. Use the brand logo/colors from the supplied image, but correct obvious ASR/visual text mistakes manually instead of displaying mistranscribed words. Represent speech beats with simple readable icons/cards: storefront for introduction, shelves/products for inventory, house for home needs, lightning/drop/wrench for elétrica/hidráulica/manutenção, and checkmark/CTA for solução/localização. QA the final contact sheet for split-screen balance, logo visibility, animation coherence, and text not crowding the face; then verify with `ffprobe`, measure audio loudness/peak, upload a validated link, and also attach `MEDIA:`.

### Screen/poster replacement in social videos

When Carlos asks to replace an image on a wall screen, poster, monitor, or in-scene billboard inside a short video, treat it as a tracked compositing task rather than a simple overlay. Download/probe the source, create a contact sheet, then extract representative frames before, during, and after the target appears. Estimate the replacement rectangle from a frame where the target is fully visible, excluding separate UI/lamp/switch elements that should remain untouched. Start the replacement at the first frame where the screen/poster is perceived as active, not merely when the old artwork is fully visible; if an activation cue such as a green switch/light appears first, the new image must appear with that cue so the original/blank screen never flashes before the replacement. Avoid starting so early that the reveal transition is still forming, because fragmented blue/white artifacts appear on the wall and look broken. Preserve foreground people by building a mask from the difference between the current ROI and a clean background/old-poster frame after the person exits, then composite the new image behind the mask. Fit square creative into tall screen areas with a blurred cover background plus the full image centered, instead of cropping away event details. QA by extracting exact frames around the reveal start and a contact sheet of the final video; if the QA contact sheet suggests an artifact, inspect the exact frame before deciding whether to re-render. If the downloaded reference has no audio stream, deliver a video-only MP4 unless Carlos explicitly asks to add music.

### Talking-Head / Lipsync

Validate portrait suitability, script length, target voice/audio, and content rights. Verify the final clip plays and that audio/video are synchronized.

## Common Pitfalls

1. Delivering only a prompt when the user requested a generated file.
2. Skipping codec/duration verification on video outputs.
3. Starting a long render without first checking input dimensions and dependencies.
4. Forgetting platform constraints such as vertical aspect ratio or maximum file size.
5. Treating provider job submission as completion before the artifact is available.
6. For YouTube/podcast clipping, stopping at the first YouTube bot/login block instead of trying the established fallback chain.
7. Delivering a clip slightly over the requested maximum duration; trim and re-render before upload.
8. When Carlos asks for only his parts, selecting guest monologues because they are high-signal; keep the cuts Carlos-centered.
9. When Carlos provides an original recording for a digital-twin/avatar workflow, delivering a simple cut with a fixed title instead of using the recording as avatar reference, writing a new script, creating coherent upper visuals, and rendering the avatar-led split-screen final.

## Verification Checklist

- [ ] Input assets and permissions/scope are clear.
- [ ] Generation/editing command or provider job actually ran.
- [ ] Output file/link exists and basic media properties were checked.
- [ ] Final response includes path/link, duration/format when relevant, and any limitations.
