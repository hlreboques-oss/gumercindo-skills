---
name: video-post-production-operations
description: Use when editing raw footage into a delivered video.
---

# Video post-production (raw footage → delivered edit)

Turn footage the user drops (Drive folder, Telegram, phone recording) into an edited MP4 with opening title,
spoken-word legendas and transitions between people — then deliver it as a Telegram video plus a Drive link.
Recipes: `references/ffmpeg-render-recipes.md`. Starter pipeline to copy: `templates/edit_pipeline.py`.
Getting the source file when the clip lives behind a social/YouTube URL (owned Instagram media, extractor bot
walls): `references/source-media-acquisition-ladder.md`.

## Gate zero: prove the footage is on disk

Before writing a cut plan, confirming a brief or promising a delivery, prove the source exists locally: list
`~/.hermes/cache/{videos,images,audio,documents}` by mtime, grep the gateway log for a cache line belonging to
**that** chat, then `ffprobe` the candidate and look at a frame or two — a cached file can belong to a different
chat, so a timestamp alone is not identification. Chat media fails silently (the send looks normal on the
sender's side, nothing arrives on this one), so "I sent you the video" is not evidence; a probed file on disk is.
Limits, log greps and the ask-the-sender fallback: `references/source-media-acquisition-ladder.md`.

## Cutting one long live into a batch of vertical clips

When the ask is many short clips from a single long recording ("não se limite a cinco, quantos derem"), do not hand-render one clip at a time: select 10-14 non-overlapping excerpts into a `clips.json` manifest
(`id,start,end,title,label,quote,theme`) covering every theme the user named, review it, then let one
self-contained render script process each clip (it refines word timings on the selected window only, burns
captions, overlays the brand badge, asserts duration, decodes the file and appends to `summary.json` as it
finishes). Give each clip a `label` so different themes carry different upper lines, and split large batches
across render workers by ID slice. Caption/title bands, the mascot-badge recipe and the render flags:
`references/vertical-clip-batch-and-branding.md`. In a stacked two-speaker source (host above, guest below)
the captions belong on the seam between the panels, not at the bottom: the bottom band sits on the lower
speaker's face and the badge, composited after the captions, then truncates the text behind it. For Carlos's
split-screen lives, keep the hook/title visible only for the first ~3 seconds, slightly below the top safe/search
area, then remove it for the rest of the clip; a persistent top title wastes space and makes the edit feel less
native.

## Putting a separately recorded narration on the picture (slide sync)

When Carlos sends a silent video (slideshow, motion graphic, screen capture) plus a separate voice
recording and asks to place the narration "em sincronia com o que está aparecendo na tela", do not just mux
the audio at t=0. Transcribe the narration with word timings, find the slide boundaries by frame
differencing (ffmpeg scene detection returns nothing on dark crossfaded slides), map one sentence per
slide, then rebuild the track with `atrim` + `adelay` + `amix … normalize=0` + `apad` while copying the
video stream. Assert each sentence fits inside its slide, and verify with a per-slide RMS check plus a
speech-onset scan of the final mix. Recipe: `references/narration-to-slide-sync.md`.

## Putting footage inside a template frame (moldura)

When he sends a frame with an empty placeholder plus a link ("coloca ele dentro dessa moldura ou aumente o espaço
do vídeo até caber"), treat the attachment as the **target** and the link as the **source**, and use only the band
that plays in the middle of that source. Measure both rectangles instead of eyeballing: the placeholder by dark
row/column fraction restricted to the middle band, the footage band by per-pixel temporal std over ~24 sampled
frames (ffmpeg scene detection returns nothing on crossfaded layouts). Fit by **enlarging the box to the footage
aspect** — not by letterboxing — rebuild the border/glow, mask the footage with a rounded `alphamerge`, and
test-render 3s and look at a frame plus a corner crop before the full render. Recipe, including the
Telegram-photo downscale (720x1280 attachment = 1.5x of a 1080x1920 design) and the encoder fallback:
`references/template-frame-compositing.md`.

## Making a walkthrough video from a floor plan / design-board image

When the user sends a floor plan, wall elevations, or a composite design-board image and asks for a walkthrough,
respect the source-material boundary before styling. If they say to use only what was sent, do **not** create a
new branded/prancha layout, title cards, logos, captions, or explanatory overlay text. Start with the floor plan,
remove or crop out cotas/measurements and labels when requested, then animate a camera path through the plan and
transition to each wall/elevation in sequence as if moving around the room. If separate wall-view files are present,
render: clean plan → move to wall X on the plan → cut/zoom to that wall view → return/continue the plan path → next
wall. If only one composite plan image is available, crop/pan through regions of that same image and state that the
result is a plan-based walkthrough, not a true elevation/tour. Verify by extracting QA frames for the opening clean
plan, at least one wall/detail view, and the final plan; re-render if cotas/texts remain visible or if any added
prancha elements appear.

## Talking head intercut with created scenes ("imagina essa cena")

When someone records a straight-to-camera idea and asks for a cut where the described scene appears ("imagina essa
cena… ela pega uma coisa e senta"), the deliverable is: their **original voice/audio continuous across the whole
video**, their image intercut with the created scene at the moment the narration describes it, burned captions, and
the tail cut — including the self-referential ending (the phone hang-up, the sentence telling the editor what to do).
The asker may be the client herself in a group, not Carlos: same rules, and the cut returns to whoever asked.

- Split the screen time by beat, never by a requested percentage — do not ask "how much do you want to appear?";
  the face carries the setup and the payoff line, the created scene carries the description in the middle of it.
- Ask exactly one question, and only because it moves cost and schedule: created scenes as **AI video** (more
  immersive, slower, paid) or **illustrated/motion stills** (faster and cheap). Everything else is confirm-and-go.
- Build the interleave from the transcript: the scene cue lands on the sentence that starts describing it, and the
  speaker's audio keeps running underneath, so the voice never stops for a cutaway.
- A created scene must match the narrated action, place and wardrobe. A scene that contradicts the narration (wrong
  object, wrong room) reads as stock filler and is a redo, not a detail.
- Before delivering, look at a frame of each created scene, a frame of every return to the speaker, and the captions
  over the scenes; check the interleave points for a gap or doubled audio.

## A deliverable with no audio is not finished

The audio streams are part of ingest: a reposted or screen-recorded source is often **video-only**, and a
composite built from it stays silent. Check `ffprobe -show_entries stream=codec_name` on the source and, when
the clip came from a URL, the `yt-dlp -F` format table plus page metadata (`has_audio`, `music_info`,
`original_sound_info`). If all available formats are `dash-…v`/`acodec=none` and the page says
`has_audio:false`, the upstream post has no recoverable original sound; say that plainly. Do **not** add
external music as the answer when Carlos says “está sem som” unless he has asked for a soundtrack — he may mean
“use the original sound from the source.” If there is no original sound, offer the choices: keep silent, add a
licensed bed (`references/silent-video-music-bed.md`), or create/sync PT-BR narration. Muxing a silent
`anullsrc` track is only a compatibility step, not an audio fix.

## Procedure

1. **Ingest and read the material before cutting.** `ffprobe` for duration/resolution **and for an audio stream**
   (`stream=codec_name` — a repost or screen recording is often video-only, so decide early whether original
   audio exists, whether to stop and explain that it does not, or whether Carlos explicitly wants a music/narration
   replacement) (phone footage is often vertical 1080x1920, ~20 Mbps, variable frame rate — normalize to `fps=30`
   in the first pass). Transcribe with `faster_whisper` (`WhisperModel('small', device='cpu', compute_type='int8')`,
   `language='pt'`, `vad_filter=True`) and keep the segments with timings in JSON: the transcript segments ARE
   the cut plan. For hour-long lives, a fast `tiny`/int8 rough pass is acceptable for finding candidate windows;
   re-transcribe only the selected windows with `small` before burning captions so the final subtitles are cleaner.
2. **Build the cut plan per speaker.** One segment per question and one per answer gives natural "transitions
   between people" for free. Keep the punchiest line as its own segment; drop filler ("Legal", "Não sei").
   Always cut the tail where the client narrates what he wants done with the video ("tô mandando pra ele colocar
   a legenda...") — that is an instruction to you, not content.
3. **Render in stages, each stage its own ffmpeg run:** (a) normalize + trim each segment to identical
   `1080x1920, fps=30, yuv420p, setsar=1, AAC 48k stereo`; (b) chain the transitions; (c) burn legendas;
   (d) draw title/end card. Never merge (b)+(c)+(d) into one command on a small VPS.
4. **Verify with numbers, not with file existence.** Confirm the final `ffprobe` duration equals
   `sum(segment durations) - (n-1) * transition` within ~0.3s; a truncated encode reports "moov atom not found"
   and its duration is short. Then crop frames at 0.5s / middle / end-1s and look at them: cartela over a face,
   legenda cut off at the bottom edge, title too small — all of it only shows up in the image.
5. **Deliver twice:** the MP4 as `MEDIA:` on Telegram (1080x1920, ~30 s at CRF 19 ≈ 28 MB) and the same file
   uploaded to the client's Drive folder. Report the md5 equality of local vs Drive
   (`files().get(fields='md5Checksum')` against a local `md5sum`) so "enviado" is proven, not assumed.
   State plainly which part you cut and offer the concrete adjustments (shorter, no legendas, different colour,
   logo on the end card).
   Pick the link host by file size: tmpfiles.org answers HTTP 413 `Payload Too Large` for large renders, so for
   videos/archives over ~100 MB use catbox (`curl -sS -F 'reqtype=fileupload' -F 'fileToUpload=@final.mp4' https://catbox.moe/user/api.php`
   → `https://files.catbox.moe/<id>.mp4`). Validate by fetching the URL and comparing bytes/md5 to the local
   file before sending, and re-validate a link parked in a manifest or an earlier turn before re-sending it —
   temporary hosts expire and a dead link costs the user a round trip. Send the per-clip links alongside a ZIP,
 not only the ZIP. When the batch is the deliverable, enumerate **every** clip in the hand-over — one `MEDIA:`
 line per file (or the manifest listing each `id` and path) plus the ZIP and a contact sheet. Handing over four
 preview clips makes Carlos answer "aonde estão todos os outros?"; the full list is the deliverable, and the
 previews are only a convenience. If you recommend a posting order, say in one line why that order (themes
 closest to the current offer first, then alternate so consecutive posts are not all the same subject).
   Chat attachments have a hard ceiling (~50 MB on Telegram), so a long audio/video or a large archive is
   delivered two ways: the parts **plus** a link to the whole file. Split media without re-encoding —
   `ffmpeg -v error -y -i full.mp3 -f segment -segment_time 1020 -c copy -reset_timestamps 1 -map 0:a 'parte_%02d.mp3'`
   (~17 min per part ≈ 41 MB at 320 kbps; keep each part under 45 MB and check the sizes before sending) — and
   split archives with Python `zipfile` in `ZIP_STORED` mode (the media is already compressed, and the `zip`
   binary is often missing). Validate a large upload with a Range request (`Content-Range` total == local byte
   size, content-type matches) instead of a full md5 download: re-downloading 100 MB+ stalls the delivery, and a
   host answering HTTP 200 with a different length is exactly the failure a size check catches.

## Pitfalls

- **Never feed N clips into one `xfade` filter_complex.** Each buffered 1080x1920 stream costs hundreds of MB; on a
  box with ~1.5 GB free the encode is OOM-killed mid-write and leaves an MP4 with no usable duration. Chain
  **two inputs per ffmpeg run** (`cur` + next segment → intermediate) and repeat; memory stays flat.
- **A render file that exists is not a finished render.** The killed process leaves the partial file in place, so a
  `[ -f final.mp4 ]` wait loop reports success early. Wait on the *validated* file
  (`ffprobe ... >/dev/null 2>&1`) and on the writer PID, and re-check the duration arithmetic afterwards.
- **Constrain threads and split filters when RAM is tight:** `-threads 1 -filter_threads 1`, `nice -n 5`, and one
  filter per pass (ass-subs pass, then drawtext pass) instead of a single mega `-vf`.
- **Variable fonts:** the Google Fonts CSS API serves woff2 and the google/fonts repo `static/...` raw paths often
  return HTML (a 404 page saved with a `.ttf` name). Download the variable TTF and instantiate a real static bold
  with `fontTools` (`instantiateVariableFont(f, {'wght': 700})`); copy the TTFs to `/usr/local/share/fonts/<proj>/`
  and run `fc-cache -f` so libass and drawtext resolve the family by name.
- **Generated text must never overlap a face.** For split-screen lives, put captions on the panel seam/center division,
  above Carlos's head and away from the guest's face; do not use a bottom subtitle band. Place the opening title in
  the upper band for only the first ~3 seconds and keep the end card out of the middle of the frame (move it to ~20%
  height); check full-size first/middle/end frames before telling Carlos the clips are ready to post.
- **Do not invent anything on screen:** no testimonials, names, promises, or figures that are not in the footage.
  Legenda text comes from the transcript; brand/CTA lines come from what someone actually says in the video.
- Long renders go to `background=true` with `notify=true`; do not block a foreground call for minutes on a 2-CPU box.
- **Never name a scratch script after a stdlib module.** A helper written as `inspect.py` (also `types.py`,
  `copy.py`, `json.py`) inside the working directory shadows the stdlib for every import in that CWD, so a
  third-party package fails on its own import with a message that blames the library, not your file:
  `faster_whisper` → `av` died with `AttributeError: module 'inspect' has no attribute 'CO_OPTIMIZED'`.
  Rename the script (`mv inspect.py inspect_media.py`) or move it into a subdirectory and re-run; fix it with
  a rename, never by deleting caches — a compound `rm -rf` command trips the destructive-command gate and
  stalls the run.
- **Write the media script to a file and run `python script.py`.** Long inline `python - <<'PY'` blocks get
  gated and a retry costs more than the write; a file on disk also survives a failed step and can be re-run
  after fixing one line.
- **Re-run media/ffmpeg work from the project directory, not a scratch one.** `cd /root/<lot>_cuts` keeps the
  transcripts, frames and manifests next to the source they belong to, so a later session can resume instead
  of re-extracting.

## Style that Carlos expects

- Legendas queimadas no vídeo, transcrição fiel da fala, com as **respostas destacadas** numa cor de acento e as
  perguntas em branco; título de abertura curto (3–4 s, com fade) sobre a primeira cena; cartela final com a frase
  mais forte do próprio vídeo; transições suaves (~0,35 s) nas trocas de pessoa, não cortes secos.
- Portuguese, short report: what the edit contains, which trecho foi cortado e por quê, o link, e o menu de ajustes.
  If the render was killed and re-run, say the real reason (memory) — never present a retried render as a first pass.
- Caption that accompanies the clip when he will post it: hook line, one short context line, then the approved CTA
  pointing to the link in bio — and **no hashtags** unless he asks. State the prerequisite he must check himself
  (the link-in-bio/registration page must point to the offer) instead of editing his bios.
- Real, humanized footage is the point: keep the original audio and grain, no artificial voice, no stock overlays.
- When the file never arrived, the reply is not a bare "send it again": one blunt line that it did not arrive plus
the reason the sender can act on, exactly what to send (mention the bot, or a Drive link when it is over the
limit), then the edit plan restated in bullets with the one open creative decision — one round trip unblocks all of it.
- Say what you will cut and keep in the client's own terms ("sua voz correndo do início ao fim", "corto o final,
a parte do telefone") and let the editor decide screen-time balance instead of asking the sender for a percentage;
only the genuinely creative choice (AI scenes vs illustrated scenes) is worth a question.

## Topic factory vs. real footage

- Carlos calls the MoneyPrinterTurbo deployment "a fábrica de imprimir dinheiro" and may ask for its repository link: it is `https://github.com/harry0703/MoneyPrinterTurbo`, installed on this VPS as the published image `ghcr.io/harry0703/moneyprinterturbo:latest` (containers `moneyprinterturbo-webui` on `127.0.0.1:18501` and `moneyprinterturbo-api` on `127.0.0.1:18080`, plus custom `factory/` scripts under `/opt/moneyprinterturbo`) — not a git clone, so answer with the upstream URL plus how it is installed here.
- A running container is not a working factory. Before offering it as a route, look for real output (newest files under `storage/tasks/` and `factory_outputs/`) and read the bot service log: the dedicated Telegram bot can be green and "running" while only logging `loop error: The read operation timed out` and never processing an update.
- The topic factory (stock footage plus synthetic narration) suits generic subject-driven content. No client deliverable in this operation has come from it: when the material is Carlos's own face, voice, brand or event, edit that footage and keep his real audio.
