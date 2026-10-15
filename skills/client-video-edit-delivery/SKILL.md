---
name: client-video-edit-delivery
description: "Use when editing raw video into a titled, captioned cut."
---

# Client video edit & delivery

Carlos sends raw footage (usually a phone video from Google Drive) and asks for a finished cut:
título, legenda and transitions between the people on screen. The deliverable is a rendered file he
can post, not a plan. Concrete commands: `references/ffmpeg-edit-recipes.md`; getting the raw file and
proving it is the client's: `references/media-intake-and-retrieval.md`; transcription:
`scripts/transcribe_ptbr.py`.

## Intake

- Create (or reuse) a Drive folder named for the job, set the link permission to **writer** so he can
  upload from any of his accounts, and hand him the folder link. Say plainly that a file uploaded
  from another account counts against that account's quota, not his main one. When the local Google
  token refresh answers `invalid_grant`, create and share the folder through the Composio `googledrive`
  connection (alias `carlos-google-drive`) instead of starting a consent flow the sender cannot complete —
  share as `anyone`/`writer`, read the permissions back, and hand over the `/folders/<id>` URL. Recipe:
  `external-app-oauth-connection-operations`.
- **"I recorded this video" is not evidence it arrived.** Before promising a cut, prove the file is on
  disk: list `~/.hermes/cache/{videos,images,audio,documents}` by mtime, grep the gateway log for a
  cache line belonging to *that* chat, then `ffprobe` the candidate — the cache also holds other chats'
  files. A client's video sent in a group without mentioning the bot is never ingested, and anything over
  ~20 MB (the bot's download ceiling) produces no file and no log line; the only real route is asking the
  sender to re-send mentioning the bot or to upload to the Drive folder.
- Download from Drive and prove identity before editing: for an `anyone`-with-link folder the fastest
  route is `curl -sL "https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t" -o raw.mp4`
  (the plain `/uc?export=download` endpoint answers with an HTML confirm page for larger files), then
  require the local `md5sum` to equal the Drive `md5Checksum` and the byte count to equal `size`
  (`GOOGLEDRIVE_GET_FILE_METADATA`, fields `md5Checksum,size`). Recipe and the Composio call shape:
  `references/media-intake-and-retrieval.md`. Before asking the sender for the file again, list the
  folder — uploads routinely sit there for days unnoticed.
- If a video is already in the folder, start immediately — do not ask again what he wants; the ask
  (title, captions, transitions) is already in his message.

## Pipeline

1. **Probe first**: duration, resolution, fps, audio channels (`ffprobe`). A phone recording is
   usually vertical 1080x1920 with variable frame rate.
2. **Transcribe in PT-BR** with faster-whisper (small, int8, `vad_filter=True`, `language='pt'`) and
   keep the segments with timestamps — they are the caption source AND the cut plan. Fix the model's
   mis-hearings of the brand and of people's names; never leave a wrong brand name on screen.
   Run `scripts/transcribe_ptbr.py` with the Hermes venv interpreter
   (`/usr/local/lib/hermes-agent/venv/bin/python`): the `python3` first on PATH can pair a newer `av`
   that makes faster-whisper die with `open() got an unexpected keyword argument 'metadata_errors'`,
   and the venv is the environment whose `av` matches. Keep the script and every job file in a per-job
   directory (`~/.hermes/workspace/<job>/`) — `~/.hermes/cache/scratch` is pruned after 24h and the
   script vanishes mid-job.
3. **Cut per person, not per camera move**: build one segment per question/answer from the transcript
   boundaries, so each caption is one complete line. Scene-change scores
   (`select='gt(scene,0.09)',metadata=print`) parsed in Python give the camera-move moments when the
   transcript is ambiguous.
4. **Normalise every segment** (same size, fps 30, `yuv420p`, `setsar=1`, AAC 48k) and verify each
   segment's duration with `ffprobe` before joining.
5. **Join with `xfade` + `acrossfade`, one transition per pass** (see Pitfalls). Use a short dissolve
   (~0.35s) at each speaker change.
6. **Caption with ASS on the retimed timeline**: segment i starts at the running accumulated offset,
   not at its original time. White, outlined, bottom-centred; give the punchline/answers a second
   highlight style so the edit reads as deliberate.
7. **Burn captions and titles in two separate ffmpeg passes** — one heavy filter graph is what gets
   the process killed by the memory limit.
8. **Titles**: opening title over the first seconds (name big, context small) and an end card with the
   strongest line of the footage, in the upper third. Fade with a `drawtext` alpha expression and pass
   long text through `textfile=` to dodge escaping.
9. **Cut his own note to the editor**: when the footage ends with him explaining what he wants done to
   the video, that is a message to the editor, not content — end the cut on the best real line.

## YouTube source + logo watermark cuts

When Carlos sends a YouTube URL plus a company logo image and asks for a single cut with captions/watermark, deliver a vertical MP4, not timestamps. Probe/list the YouTube metadata and formats first. If local YouTube access is blocked by bot/429 checks, try a remote sandbox route; if progressive HTTPS formats return 403, prefer HLS/m3u8 formats with `yt-dlp --download-sections '*MM:SS-MM:SS' --force-keyframes-at-cuts -f 'video_hls+audio_hls'`, because HLS segments can fetch when signed progressive URLs fail. If the remote sandbox cannot return files directly, upload the raw cut to a temporary host, download it locally, and continue the edit.

For the final edit, use the supplied logo as the watermark asset: remove dark background/convert to transparent if needed, scale it modestly, place it top-right, and keep it visible without covering faces. Use Whisper on the actual cut when subtitles are absent or bad, manually correct obvious short ASR errors, burn ASS captions in a lower safe band, and build a blurred 9:16 background with the original horizontal video centered. Verify with `ffprobe` and a contact sheet; check logo visibility, subtitle readability, and face coverage before delivery.

## Always

- The render is not done until the output duration equals the expected duration
  (sum of segments minus `n × transition`). A short or `moov atom not found` file is a killed encode.
- Look at the result before delivering: pull frames at the title, mid-video and end card and inspect
  them with vision. Text over a face is a fix, not a detail.
- Deliver the file itself (Telegram `MEDIA:<path>`) **and** the Drive link in the same reply, plus a
  one-line list of what was edited. Prove the Drive copy is the delivered copy by comparing the local
  md5 against the Drive `md5Checksum`.
- Offer the concrete next adjustments (shorter cut, no captions, smaller caption, logo on the end
  card) instead of asking open questions.
- Give an honest time estimate when he asks, and say what is delaying it (memory limit, render passes).

## Pitfalls

- **Never chain many clips into one `filter_complex` on this VPS.** Ten inputs of 1080x1920 exhaust
  the available RAM and the kernel kills ffmpeg mid-encode, leaving a truncated MP4. Join one
  transition per pass, use `-threads 1 -filter_threads 1`, and run long renders in the background with
  notify instead of a foreground wait.
- A killed encode is silent: always `ffprobe` the finished file, never infer success from the exit code.
- Inspect frames, not a poster: only a still shows text sitting on someone's face, which no duration
  check catches.
- Do not keep the model's raw spelling of the brand, and do not invent quotes the person did not say
  in the footage.
- Do not publish or send the video to third parties; the deliverable goes to Carlos unless he says
  otherwise.
- **The ending the client describes may not be in the file they sent.** Transcribe and pull frames from
  the tail before planning a cut like "remove the part where I hang up the phone"; if that moment is not
  there, report the real last line instead of hunting for it, and never silently drop the request.
