---
name: client-video-edit-delivery
description: "Use when editing raw video into a titled, captioned cut."
---

# Client video edit & delivery

Carlos sends raw footage (usually a phone video from Google Drive) and asks for a finished cut:
título, legenda and transitions between the people on screen. The deliverable is a rendered file he
can post, not a plan. Concrete commands: `references/ffmpeg-edit-recipes.md`; getting the raw file and
proving it is the client's: `references/media-intake-and-retrieval.md`; transcription:
`scripts/transcribe_ptbr.py`; long recordings cut into several short captioned clips:
`references/talk-to-short-cuts.md` + `scripts/build_ass_captions.py`.

## Intake

- Create (or reuse) a Drive folder named for the job, set the link permission to **writer** so he can
  upload from any of his accounts, and hand him the folder link. Say plainly that a file uploaded
  from another account counts against that account's quota, not his main one. When the local Google
  token refresh answers `invalid_grant`, create and share the folder through the Composio `googledrive`
  connection (alias `carlos-google-drive`) instead of starting a consent flow the sender cannot complete —
  share as `anyone`/`writer`, read the permissions back, and hand over the `/folders/<id>` URL. Recipe:
  `external-app-oauth-connection-operations`.
- **Say which account owns the folder, and give a fallback route.** Uploading through a shared link needs
  the sender signed into *some* Google account, and opening the link inside Telegram/WhatsApp opens a
  login wall; when the sender answers "não consigo acessar, em qual e-mail você criou?", name the owning
  account (e.g. `editor@example.com`), ask them to open the link in a real browser, and offer the route
  that needs no permission at all: they upload from their own Drive and send the file link, which
  downloads with the `drive.usercontent` curl above.
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

## Long talk → several short vertical clips

When the client sends one long recording (palestra, aula, live — often 10–30 min of 4K phone footage)
and asks for "cortes" of 30s to ~1 min, varied, "que façam sentido", with captions:

1. **Probe including rotation** — `ffprobe -v error -select_streams v:0 -show_entries
   stream=width,height:stream_side_data=rotation -of json in.mp4`. A phone file can be stored
   `3840x2160` with `rotation: -90`, i.e. already vertical; pick the framing and the caption band from
   the rotated dimensions.
2. **Plan from a full-file transcript, caption from a window transcript.** The full pass tells you which
   stretches are self-contained; before burning captions, re-extract that exact window's audio and
   re-transcribe it with `word_timestamps=True` (full-file segment times are coarse and drift).
3. **Pick a window that opens on a hook and closes on a complete, quotable line.** Drop the greeting
   ("boa noite, é uma honra") and the closing housekeeping. Check the cut point with
   `ffmpeg -ss <t> -t 3 -i in.mp4 -vn -af volumedetect -f null -`: room tone ≈ -26 dB mean, speech ≈
   -12 dB; a cut opening on room tone reads as a dead start.
4. **Deliver one sample cut and stop.** The client asked to approve format and caption style before the
   batch — send that one file, name the format in one line, wait for the go-ahead, then reuse the same
   ASS style and render command for the rest.

Recipe, caption rules, ASS style, render and QA commands: `references/talk-to-short-cuts.md`;
caption timing builder: `scripts/build_ass_captions.py`.

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
- **Read `stream_side_data.rotation` before designing a layout.** A 4K phone file often stores
  3840x2160 with `rotation: -90`, so it is already vertical; a blurred-16:9-to-vertical frame built for
  it is wasted work and looks wrong. `ffmpeg` autorotates on decode, so the filter chain sees the
  rotated size — the error happens in the planning, not in the encode.
- **Caption blocks built from a full-file transcript drift.** Long-recording segment times come from a
  coarse VAD pass and stretch the speech, so the burned captions sit early/late and the clip opens on
  silence. Re-extract the exact window (`-ss/-t` to 16k mono wav) and re-transcribe it with
  `word_timestamps=True`; build blocks from word times.
- **Large Drive originals need a disk and retrieval strategy.** When the original exceeds free disk, extract bounded windows through an HTTP-range-capable URL into small local proxies; validate every proxy with ffprobe before transcribing. Repeated remote seeks may exhaust Drive's download quota and return an HTML quota page with HTTP 200, so never treat a zero-exit encode or HTTP 200 as proof of valid video. Preserve finished proxies and use only genuinely downloaded footage if retrieval becomes blocked; do not invent replacement scenes. MP4 sparse-range recovery is possible from moov sample tables, but mark sparse files as incomplete and never mistake them for a verified original.
- **Correct ASR tokens before caption grouping.** Corrections spanning several words can straddle caption blocks; fix the word sequence first, retain its original time span, then group. Merge tiny trailing caption fragments when they would flash for a fraction of a second. Check title frames for newline/tofu glyphs and shorten the title instead of leaving a broken character.
- **The last caption must be a finished sentence.** Step the tail of the render before delivering: a
  cut whose last line stops mid-phrase reads as a broken export even when duration and loudness pass.
- Do not keep the model's raw spelling of the brand, and do not invent quotes the person did not say
  in the footage.
- Do not publish or send the video to third parties; the deliverable goes to Carlos unless he says
  otherwise.
- **The ending the client describes may not be in the file they sent.** Transcribe and pull frames from
  the tail before planning a cut like "remove the part where I hang up the phone"; if that moment is not
  there, report the real last line instead of hunting for it, and never silently drop the request.
