# Putting a licensed music bed under a silent video

Use when the edit has no audio at all — a reposted/screen-recorded source is usually video-only — and Carlos
says "está sem som, resolve por favor".

## 1. Prove the source is silent before reporting it

- `ffprobe -v error -show_entries stream=codec_name,width,height,channels -of json <file>` → a single video
  stream means the file genuinely has no audio.
- For a social/YouTube URL, `python -m yt_dlp -F <url>`: if every row is `video only`, the upstream post carries
  no sound. Do not re-download hoping for audio, and do not silently ship a silent file — tell him the source was
  mute and that you are adding a bed.
- A `anullsrc` silent track added for player compatibility is **not** sound. Only real audio counts as resolved.

## 2. Pick a track that is safe for a commercial post

- **Mixkit** exposes direct CDN files and its licence is free for commercial use with no attribution:
  `https://assets.mixkit.co/music/<id>/<id>.mp3`. Harvest ids from the page HTML (`music/<id>/<id>.mp3`) and the
  track names from the tag pages (e.g. `/free-stock-music/tag/technology/`, `/tag/corporate/`), which read fine
  through plain page extraction.
- Pixabay music pages answer an automated browser with a Cloudflare `Just a moment…` interstitial; prefer a
  source that hands out direct file URLs instead of spending turns there.
- Openverse (`https://api.openverse.org/v1/audio/?q=<terms>&license=cc0,pdm&page_size=20`, add `&source=jamendo`)
  returns licence metadata, but its Jamendo corpus is mostly `by-nc-nd` — non-commercial, no derivatives — which
  is unusable for a client post. Only `license=by` (or cc0/pdm) is commercial-safe, and a `by` track obliges an
  attribution line in the caption. Query the API from a script file on disk, not an inline heredoc.

## 3. Choose without being able to listen

Download 4–6 candidates, then measure instead of guessing:

- **Duration** ≥ the video length, otherwise one loop with a crossfade covers it.
- **Per-10s RMS profile** — the decisive test. A track with a breakdown leaves a 10-second hole: an ambient
  candidate measured `min/mean = 0.23`, the chosen minimal-techno one `0.91`. Require ≳ 0.85.
- **Crude tempo** (autocorrelation of the onset envelope) and **spectral centroid** to separate calm/dark
  (low centroid) from driving/bright, so the bed matches the subject.
- Keep the ids of the runners-up in the note you hand over so a swap is one command.

```python
# measurement that fits in a script file: load mono 22.05 kHz via ffmpeg, then
# rms per 20 ms frame; onset env = max(0, diff(rms)); tempo = 60 / (best autocorr lag in s)
# centroid = sum(spec * freqs) / sum(spec) over an rfft of each frame
```

## 4. Loop, fade, normalise, mux

```bash
ffmpeg -y -i track.mp3 -i track.mp3 -filter_complex \
 "[0:a][1:a]acrossfade=d=4:c1=tri:c2=tri[loop];\
  [loop]atrim=0:<DUR>,asetpts=PTS-STARTPTS,\
  afade=t=in:st=0:d=1.2,afade=t=out:st=<DUR-3>:d=3,\
  loudnorm=I=-14:TP=-1.5:LRA=11[aout]" \
 -map "[aout]" -c:a aac -b:a 192k -ar 48000 bed.m4a

ffmpeg -y -i video.mp4 -i bed.m4a -map 0:v -map 1:a \
 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart final.mp4
```

`acrossfade` length 4 s is enough that the seam is inaudible across two copies of a ~2-minute track.
`-c:v copy` keeps the picture byte-identical to the version he already approved — say so in the report.

## 5. Verify with numbers, then deliver

- `ffmpeg -v info -i final.mp4 -af volumedetect -f null -` → `mean_volume` near -14 dB and `max_volume` a few dB
  under 0. Silence reports about -91 dB, clipping reports 0.0 dB: both are visible here.
- Scan the final mix in 10-second blocks (mono 8 kHz decode + RMS in numpy): no block near zero and
  `min/mean ≳ 0.85` proves the music covers the whole video, fades included.
- `ffprobe` the output: audio stream present, `format=duration` equals the video duration, resolution unchanged.

## 6. Report and offer the alternatives

One short block: the licence position (free for commercial use, no credit needed, or the attribution owed),
the loop/fade/normalise facts, the verification numbers, and the two options — PT-BR narration synchronised
sentence-by-sentence (`references/narration-to-slide-sync.md`) or another mood of track.
