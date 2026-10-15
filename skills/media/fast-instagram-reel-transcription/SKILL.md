---
name: fast-instagram-reel-transcription
description: "Use when Carlos asks to transcribe an Instagram Reel fast."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [media, instagram, reels, transcription, yt-dlp, whisper]
---

# Fast Instagram Reel Transcription

## Trigger

Use this when Carlos Júnior sends an Instagram Reel URL and asks to transcribe it, especially with phrases like:

- "transcreve"
- "transcreve esse reels"
- "pega o texto desse vídeo"
- "qual é a fala desse vídeo"

## Goal

Deliver the transcript quickly and faithfully. Do **not** overbuild a media workflow, create todos, generate contact sheets, or analyze the content unless Carlos asks.

## Fast Path

1. **Download audio only** with `yt-dlp` into a temp directory:

```bash
mkdir -p /tmp/ig_transcribe_<shortcode>
cd /tmp/ig_transcribe_<shortcode>
yt-dlp --no-playlist -f 'bestaudio/best' -o 'reel.%(ext)s' '<INSTAGRAM_REEL_URL>'
```

2. **Decode to 16 kHz mono WAV, then transcribe** with `faster_whisper` (CPU/int8, Portuguese). Feed the model a decoded numpy array, never the downloaded file path — `model.transcribe('<file>')` decodes through faster-whisper's own PyAV binding, which dies with `exit 1` and zero text when that binding mismatches the installed FFmpeg, and the failure is silent (no traceback line in the tool output). `ffmpeg` + stdlib `wave` + numpy removes that dependency entirely and prints only the text:

```bash
ffmpeg -hide_banner -loglevel error -i reel.m4a -ar 16000 -ac 1 -f wav reel16k.wav -y   # use the reel.* file that was actually downloaded
python - <<'PY'
import wave, numpy as np
from faster_whisper import WhisperModel
w = wave.open('reel16k.wav','rb')
data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
model = WhisperModel('small', device='cpu', compute_type='int8')
segments, info = model.transcribe(data, language='pt', vad_filter=True, beam_size=5)
lines=[s.text.strip() for s in segments if s.text.strip()]
open('transcript_raw.txt','w').write('\n'.join(lines))
print('\n'.join(lines))
PY
```

3. **Clean lightly for readability**:
   - join broken lines into paragraphs;
   - fix obvious Whisper mistakes only when context is clear;
   - preserve informal phrasing and meaning;
   - do not rewrite as marketing copy unless asked.

4. **Return only the transcript**, unless there was a blocker.

## If `yt-dlp` Requires Approval

- Ask Carlos once: "Pode tentar baixar o áudio do Reels para transcrever?"
- After approval, rerun the same command.
- Do not switch to a heavier route unless download fails.

## If Download Fails

Try, in order:

1. remove URL query params and retry:

```bash
yt-dlp --no-playlist -f 'bestaudio/best' -o 'reel.%(ext)s' 'https://www.instagram.com/reel/<SHORTCODE>/'
```

2. try best video/audio:

```bash
yt-dlp --no-playlist -f 'best' -o 'reel.%(ext)s' '<URL>'
```

3. If Instagram blocks/login-gates, ask Carlos to upload the video/audio or provide a screen recording. Do not invent the transcript.

## Speed Rules

- Do not create a TODO list for simple one-Reel transcription.
- Do not use contact sheets, ffprobe, publishing tools, or video rendering.
- Do not summarize first; transcribe first.
- Use `small` model for accuracy/speed balance; use `tiny` only if speed matters more than accuracy.
- Keep all files under `/tmp/ig_transcribe_<shortcode>/`.

## Output Format

Preferred final answer:

```text
Transcrição:

<cleaned transcript>
```

If uncertain words exist, mark them inline as `[inaudível]` or `[palavra incerta]`.

## Pitfalls

- Passing the downloaded media file straight to `model.transcribe()`: faster-whisper decodes it with its own PyAV binding, and a PyAV/FFmpeg version mismatch kills the script with `exit 1` and no text. Always decode with `ffmpeg` first and pass a float32 numpy array.
- Spending time on social publishing workflows when the user only asked for transcription.
- Returning timestamps unless Carlos asks; timestamps make the answer longer.
- Over-polishing the speaker's words into a new script.
- Claiming transcription when Instagram returned an inaccessible page.
