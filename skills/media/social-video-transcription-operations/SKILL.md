---
name: social-video-transcription-operations
description: "Use when quickly transcribing short social videos/Reels."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [media, transcription, instagram, reels, tiktok, shorts, yt-dlp, whisper]
---

# Social Video Transcription Operations

## Trigger

Use this when Carlos Júnior sends a short social-video URL or file and asks for the words, transcript, or what the person said, especially:

- "transcreve"
- "pega o texto desse vídeo"
- "qual é a fala desse vídeo"
- Instagram Reels, TikTok, Shorts, or similar short clips.

## Goal

Deliver the transcript quickly and faithfully. This is **not** a media production, publishing, or analysis workflow unless Carlos explicitly asks.

## Fast Path for Instagram Reels

1. Download audio only into `/tmp`:

```bash
mkdir -p /tmp/ig_transcribe_<shortcode>
cd /tmp/ig_transcribe_<shortcode>
yt-dlp --no-playlist -f 'bestaudio/best' -o 'reel.%(ext)s' '<INSTAGRAM_REEL_URL>'
```

2. Transcribe immediately with `faster_whisper` CPU/int8 Portuguese:

```bash
python - <<'PY'
from faster_whisper import WhisperModel
from pathlib import Path
files=list(Path('.').glob('reel.*'))
A=str(files[0])
model=WhisperModel('small', device='cpu', compute_type='int8')
segments, info = model.transcribe(A, language='pt', vad_filter=True, beam_size=5)
lines=[]
for s in segments:
    t=s.text.strip()
    if t:
        lines.append(t)
Path('transcript_raw.txt').write_text('\n'.join(lines))
print('\n'.join(lines))
PY
```

3. Lightly clean for readability:
   - join broken lines into paragraphs;
   - fix obvious recognition mistakes only when context is clear;
   - preserve the speaker's informal wording and meaning;
   - do not rewrite as copy unless asked.

4. Return the transcript directly.

## YouTube Transcript Fallback

For YouTube links, first try native transcript extraction before downloading audio. If local requests fail due to YouTube anti-bot/cloud-IP blocking, try an authorized metadata/transcript tool or remote sandbox probe when available. Preserve timestamps/segments for later synthesis. If only metadata/description is accessible, say so clearly and do not present it as a full transcript.

## If Download Needs Approval

Some downloads may trigger command approval. Ask once, then rerun the exact fast-path command after approval. Do not switch to a heavier workflow unless download fails.

## If Carlos Asks to Send/Download the Video

Sometimes Carlos sends an Instagram story/reel/highlight URL and asks “me envia esse vídeo” rather than asking for a transcript. In that case, treat the deliverable as the verified media file, not text.

1. Create a short `/tmp` workdir and try best MP4 output:

```bash
mkdir -p /tmp/ig_video_<id>
cd /tmp/ig_video_<id>
yt-dlp --no-playlist -f 'bestvideo+bestaudio/best' --merge-output-format mp4 -o 'instagram_video.%(ext)s' '<INSTAGRAM_URL>'
```

2. If the URL is an Instagram shared highlight/story link like `/s/<base64>?story_media_id=...`, normalize it into the canonical highlight form and retry:

```bash
yt-dlp --no-playlist -f 'bestvideo+bestaudio/best' --merge-output-format mp4 -o 'instagram_video.%(ext)s' 'https://www.instagram.com/stories/highlights/<HIGHLIGHT_ID>/?story_media_id=<MEDIA_ID>_<OWNER_ID>'
```

3. If download succeeds, verify a local media file exists and deliver it with `MEDIA:/absolute/path/to/file.mp4`. Do not say “consegui” until the file is present.

4. If Instagram requires login/rate-limits the environment, do not stop after the first `yt-dlp` failure. Try the fallback ladder below before asking Carlos for a handoff. Do not present a blocked download as unavailable forever, and do not fabricate a file.

## If Instagram Blocks Access

Try, in order:

1. Clean shortcode URL:

```bash
yt-dlp --no-playlist -f 'bestaudio/best' -o 'reel.%(ext)s' 'https://www.instagram.com/reel/<SHORTCODE>/'
```

2. Best combined media:

```bash
yt-dlp --no-playlist -f 'best' -o 'reel.%(ext)s' '<URL>'
```

3. Browser cookies from known local/remote browser profiles if explicitly available and already authorized.

4. Connected Instagram/Meta tools — the cleanest route when the reel/live belongs to an account Carlos manages, and the one that returns the **full-length** media rather than a truncated clip. List the account's media with `INSTAGRAM_GET_IG_USER_MEDIA` (explicit `account` alias) and match the `shortcode` from the URL, then read `media_url` with `INSTAGRAM_GET_IG_MEDIA`. Download that CDN URL immediately with a browser User-Agent: the signature is short-lived, so re-fetch a fresh `media_url` right before every attempt and assert the downloaded file really is an MP4 (an `ftyp` box, non-trivial size). Do not assume the shortcode-decoded integer works as a media ID.

5. Downloader-service fallback. A working pattern is documented in `references/instagram-saveinsta-workaround.md`: fetch SaveInsta page tokens (`k_exp`, `k_token`), call `/api/userverify`, call `/api/ajaxSearch`, select the returned `Download Video` link (not the thumbnail), download with the site referer, and verify via `file`/`ffprobe`.

6. For highlight/story shared links, try the canonical `/stories/highlights/<HIGHLIGHT_ID>/?story_media_id=...` URL as above.

7. Only after the fallback ladder fails, ask Carlos to upload/forward the video/audio, send a screen recording, or open the logged-in Instagram/WhatsApp browser/VPS and authorize capture. Do not invent the transcript or claim to have the MP4.

## Platform Walkthrough / API Documentation Videos

When Carlos sends a short video walkthrough and asks what platform/API resources can be used in a project, the deliverable is not only a transcript. Use a two-pass extraction:

1. Download the file or fetch it from Drive/link, then verify duration and streams with `ffprobe`.
2. Extract/transcribe audio with Whisper for the narrator's intent, priorities, and missing-context asks.
3. Create sampled screenshots/contact sheets from the video to read visible menus, endpoint names, HTTP methods, params, and webhook/event names:

```bash
mkdir -p /tmp/platform_walkthrough && cd /tmp/platform_walkthrough
ffmpeg -y -i walkthrough.mp4 -vf "fps=1/10,scale=480:-1,tile=4x9" -frames:v 1 contact.jpg
```

4. If the contact sheet is too small to read, create larger still sheets from key timestamps:

```bash
mkdir -p stills
for t in 5 35 60 85 115 140 170 200 230 260 290 320; do
  ffmpeg -y -ss "$t" -i walkthrough.mp4 -frames:v 1 -q:v 2 "stills/t${t}.jpg"
done
```

5. Return a practical integration inventory grouped by project use case, e.g. messages/WhatsApp, contacts/leads, pipeline/funnel, conversations/tickets, agenda, configuration, webhooks. Mark anything visually illegible instead of guessing.

For Google Drive file links that are publicly accessible, direct download often works with:

```text
https://drive.google.com/uc?export=download&id=<FILE_ID>
```

## Speed Rules

- Do **not** create a TODO list for a simple one-video transcription.
- Do **not** generate contact sheets, run video QA, render media, or invoke publishing tools when the user only asked for words.
- Do generate sampled frames/contact sheets when the user asks to extract platform capabilities, visible API docs, screens, resources, or workflows from the video.
- Do **not** summarize before transcribing.
- Use `small` model for speed/accuracy balance; use `tiny` only if Carlos explicitly prioritizes speed over accuracy.
- Keep files under `/tmp/<source>_transcribe_<shortcode>/` or `/tmp/platform_walkthrough_<id>/` for platform walkthrough analysis.

## Output Format

```text
Transcrição:

<cleaned transcript>
```

Only include timestamps if Carlos asks. Mark uncertain words inline as `[inaudível]` or `[palavra incerta]`.

## Chat Attachment Lifetime

- Before extracting audio from a video/audio the user sent in an **earlier turn** ("transcreve o áudio acima"), confirm the cached path still exists with `ls -la <path>`. Attachments live in a swept cache (`~/.hermes/cache/videos/`, `~/.hermes/cache/audio/`) and a file sent days earlier is usually already gone.
- When the file is missing, asking for a resend IS the deliverable: say the cached copy was purged automatically, ask for the video again (better as a document/arquivo so Telegram does not recompress it), and stop. Do not run `ffmpeg`/Whisper against the missing path — tool output floods the chat, the user waits, and nothing is produced.
- Do not spend time mining logs or `state.db` for a Telegram `file_id` to re-download a purged attachment: the incoming `file_id` is not persisted with the message, so a bot cannot re-fetch it. A resend is the only recovery.
- On first touch of an attachment that will be reused across turns, copy it to a persistent workdir (e.g. `/root/media/<client>/`) before processing.

## Telegram Voice Attachments

- When a voice message appears only as an unreliable automatic transcript, check `/root/.hermes/cache/audio/` for the corresponding recent audio before claiming the attachment is missing. Match recency and context; do not transcribe unrelated cached files.
- Retranscribe Portuguese speech with `language='pt'`. If the small model yields unclear names or phrases, retry medium and mark unresolved spans `[inaudível]` rather than translating hallucinated English or inventing names.

## Common Pitfalls

- Treating a transcription request as a social publishing/media-production workflow.
- Spending time on plans, todos, contact sheets, or ffprobe when the user only asked for words.
- Returning a polished rewrite instead of a faithful transcript.
- Claiming a transcript when the platform returned an inaccessible page.
- Chaining extraction onto a cached attachment path from a previous turn without verifying it still exists; swept chat caches mean the source may be gone, and the fix is a resend request, not another pipeline run.
- Keeping a stored Instagram CDN `media_url` in a file and retrying it later: the signature expires and the request writes a tiny plain-text body (`URL signature mismatch`) that looks like a successful download. Re-fetch a fresh `media_url` right before each attempt and check for the `ftyp` box before probing with `ffprobe`.
