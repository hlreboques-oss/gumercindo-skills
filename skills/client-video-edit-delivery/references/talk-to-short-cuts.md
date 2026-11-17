# Long recording → short vertical clips with burned captions

For a talk/lecture/aula recorded in one long take (10–30 min, phone 4K, speaker on a stage, slides
behind) where the client wants several clips of 30s–1min, varied, each making sense on its own.

## 1. Probe, including rotation

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate:stream_side_data=rotation -of json in.mp4
```

A phone file may report `3840x2160` with `rotation: -90` and be **vertical 2160x3840** in practice.
`ffmpeg` autorotates on decode, so `scale=1080:1920` is correct for such a file; a blurred-background
16:9 layout is the wrong design. Also note the frame rate: 120 fps 4K sources are common and only need
`fps=30` on output.

## 2. Full pass to plan, window pass to caption

```bash
ffmpeg -v error -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le full.wav -y
/usr/local/lib/hermes-agent/venv/bin/python transcribe_words.py full.wav full.json   # small, int8, pt
```

Read the transcript, choose windows that (a) open on a hook — usually a question or a claim, not the
greeting, (b) close on a complete quotable line, (c) need no earlier context.

Then re-transcribe **only the window** and caption from those word times:

```bash
ffmpeg -v error -ss 18.05 -t 64.6 -i in.mp4 -vn -ac 1 -ar 16000 -c:a pcm_s16le clip.wav -y
/usr/local/lib/hermes-agent/venv/bin/python transcribe_words.py clip.wav clip.json
```

Segment times from the full pass are not trustworthy for burning: a coarse VAD pass stretches a
sentence over a pause, so the burned captions drift and the clip starts with seconds of room tone.
Confirm where speech really starts instead of trusting the segment:

```bash
for r in "14.9 3.2" "18.4 3.2"; do set -- $r; ffmpeg -v info -ss $1 -t $2 -i in.mp4 -vn \
  -af volumedetect -f null - 2>&1 | grep mean_volume; done
# mean_volume -26 dB = room tone | -12 dB = speech
```

`transcribe_words.py` is ~15 lines: `WhisperModel("small", device="cpu", compute_type="int8")`,
`transcribe(wav, language="pt", vad_filter=True, beam_size=5, word_timestamps=True,
condition_on_previous_text=False)`, then dump `{"start","end","text","words":[{"w","s","e"}]}` per
segment. Run it with the Hermes venv python — the bundled `python3` can pair an `av` that breaks
faster-whisper's decode.

## 3. Caption rules that read well at 1080x1920

- Block = one spoken phrase, **≤ ~40 characters**, max **2 lines**, max **24 chars per line**,
  2–4 s on screen. Merge any block under 18 chars into its neighbour (a 2-word flash looks like a bug).
- Build blocks from word times, break preferably after punctuation, then balance the two lines.
- Normalise whitespace — whisper word tokens carry leading spaces and produce double spaces.
- Apply ASR corrections **after** chunking, so a fix that straddles two blocks needs its own entry
  (e.g. `"perda, de valor atraso"` and `"de valor atraso"`).
- Persistent PT-BR mishearings to fix by hand: `descobrando` → `te cobrando`, `pode está trazendo` →
  `pode estar trazendo`, `corpoamente` → `corpo, mente e espaços`, redundant `a gente, a gente nem` →
  `a gente nem`, proper names spelled out.
- Style that reads clean on a bright stage shot: Montserrat SemiBold 60, white `&H00FFFFFF`, black
  outline 6 + shadow 3, `MarginV 340` (lower third, below the speaker's torso), no box. Add a box only
  if the background is busy.

ASS header used:

```
[Script Info]
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

Style: Cap,Montserrat SemiBold,60,&H00FFFFFF,&H00B3854D,&H00120F0C,&H96000000,-1,0,0,0,100,100,0.6,0,1,6,3,2,70,70,340,1
```

Builder: `scripts/build_ass_captions.py words.json <t_end> out.ass [fixes.json]`.

## 4. Render

```bash
ffmpeg -ss 18.05 -t 64.2 -i in.mp4 \
  -vf "scale=1080:1920:flags=lanczos,eq=contrast=1.06:saturation=1.08,fps=30,subtitles=clip.ass:fontsdir=/usr/local/share/fonts/gumercindo" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11" \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k \
  -movflags +faststart out.mp4 -y
```

`subtitles=` goes **after** `scale`, or the ASS canvas no longer matches 1080x1920. `-t` should be the
last caption end + ~0.4 s so the closing line is not cut. A 64 s 1080x1920 clip lands near 40 MB, which
still fits a Telegram bot upload; run the encode in the background with notify, 4K120 decode is slow.

## 5. QA before sending

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 out.mp4        # equals -t
ffmpeg -v info -i out.mp4 -af "ebur128=peak=true" -f null - 2>&1 | grep -E "I:|Peak:"   # ≈ -14 LUFS
for t in 0.4 30 55 63; do ffmpeg -v error -ss $t -i out.mp4 -frames:v 1 qa_$t.jpg -y; done
```

Look at the frames: caption legible, not over the face, first frame already captioned, last frame a
finished sentence. A cut that ends mid-phrase ("…muito mais do que um espaço bonito, o espaço") is the
most common defect and no duration/loudness check catches it.

## 6. Delivery

One sample clip first — the client approves format and caption style before the batch. Say what the
format is (vertical, captions burned, audio normalised, opening trimmed) in one or two lines, then stop
and wait. Keep the source in `~/.hermes/workspace/<job>/` for the batch; the 4K original can be large,
so watch free space before rendering more clips.
