# Syncing a separately recorded narration to what is on screen

Use when Carlos sends a silent video (slideshow, motion graphic, screen capture, institutional piece)
plus a voice recording and asks to place the narration "em sincronia com o que está aparecendo na tela".
Muxing the voice at t=0 is not the deliverable: each sentence must land on the slide it talks about.

## 0. Inventory both files first

```
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,sample_rate,channels -of json FILE
```

A slideshow assembled in a presentation tool often has **no audio stream at all** — that is expected and is
not a broken file; the narration recording is the audio track you are adding. Note the video's exact
duration, because the rebuilt track has to end with it.

## 1. Transcribe the narration (word timestamps)

`faster_whisper` `WhisperModel('small', device='cpu', compute_type='int8')`, `language='pt'`,
`vad_filter=True`, `word_timestamps=True`, on the OGG/WAV converted to 16 kHz mono. Keep the segment
start/end in JSON — those timings are the source cuts.

## 2. Find the slide boundaries

`ffmpeg -vf select='gt(scene\,0.25),showinfo' -f null -` returns **nothing** on the dark, low-contrast
slides typical of these pieces: the cuts are crossfades, not hard cuts. Use frame differencing instead:

1. `ffmpeg -i VIDEO -vf scale=160:90,fps=4 frames/f_%04d.jpg`
2. Load each frame as grayscale with numpy and take `mean(abs(frame[i] - frame[i-1]))`.
3. A slide change is a burst; on a 0–255 scale, inside-a-slide motion sits around 5–7 while a fade
   transition spikes to 35–42 over 2–3 sampled frames. Threshold at ~3.0 and take the midpoint of each
   burst as the slide change time.

Then read the slide text: extract one frame per interval, tile them into a contact sheet with the
timestamp drawn on each tile, and run a vision pass asking for the literal on-screen text per slide.

## 3. Map sentences to slides

The narration is usually one sentence per slide, in slide order — confirm it by reading the slide text
alongside the transcript rather than assuming. Kick-off line → logo/title slide, pain slide → the sentence
that names the pain, bullet/list slide → the sentence that enumerates the bullets, closing slide → the
CTA sentence(s).

## 4. Place each sentence (assert before rendering)

Cut each sentence from the narration with a small pad (~0.15 s before, ~0.2 s after, never overlapping the
next sentence) and target `slide_start + 0.15…0.25 s`, so the visual change is seen first and the voice
follows. Chain the 2–3 sentences that share the closing slide (last slide start + previous sentence end).

Assert that every padded sentence fits entirely inside its slide window; print the table and fail loudly on
overflow instead of eyeballing it:

```
seg3: cut 10.25-16.66 (6.41s) -> t=10.68..17.09 slide[2] 10.6-17.1 OK
```

## 5. Build the track without re-encoding the picture

One `filter_complex`: per sentence
`[1:a]atrim=A:B,asetpts=PTS-STARTPTS,aformat=channel_layouts=stereo,adelay=MS|MS[aN]`,
then `amix=inputs=N:duration=longest:normalize=0,apad=whole_dur=TOTAL,atrim=0:TOTAL`.

- `normalize=0` is required: plain `amix` attenuates every input to 1/N.
- `adelay` needs one value per channel — force the voice to stereo first.
- `apad=whole_dur=<video duration>` + `-shortest` makes the track end with the picture.
- `-map 0:v -c:v copy` — only a track is being added, so the picture is copied untouched.

## 6. Verify placement, not just file existence

1. Extract the mixed audio (`-ac 1 -ar 16000`) and compute RMS per slide window with `audioop.rms` on
   16-bit frames: **every slide must carry speech** (no scene left mute).
2. Run an onset scan in numpy: RMS per 20 ms frame, threshold at ~6 % of the max, sentence start = first
   active frame after a silent gap, merging onsets closer than ~0.45 s. Print the delta between each
   sentence start and the nearest slide boundary; each should be within ~0.25 s.
3. Do **not** verify with a second Whisper pass: its VAD-trimmed segment times are quantized to the chunk
   and report starts up to 0.7 s earlier than the real speech onset. Onset detection on the final mix is
   the accurate check.

## Pitfalls specific to this job

- If sentence starts already track the slides within ~0.7 s, a **single uniform delay** is the best fix:
it preserves the natural delivery with zero artifacts. Retime per sentence only where a sentence would
spill past its slide, and avoid `atempo` unless a sentence genuinely overflows (0.9–1.15 stays natural).
- Do not invent or replace lines: the recording is Carlos's (or the client's) own voice, including any
instruction-like closing line he chose to keep.
- Keep the original resolution and aspect ratio unless he asks for a social format; offer the vertical
version in the hand-over instead of silently cropping a 16:9 institutional piece.
