# Long audio: segmentation, resume, and delivery

## Choose a durable execution unit

Probe source duration first:

```bash
ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$SOURCE"
```

Use a task directory under `$TMPDIR` or `/root/.hermes/cache/scratch`, not a hard-coded system temporary directory. For local Whisper, decode through ffmpeg to a numpy array as described in SKILL.md, and write each finished segment immediately. Choose a segment length that fits the observed processing speed and call deadline; do not extrapolate completion from a single short benchmark.

For the configured Gemini transcription route, 660-second MP3 segments have been exercised successfully:

```bash
mkdir -p "$WORK/parts" "$WORK/texts"
ffmpeg -v error -y -i "$SOURCE" -ac 1 -ar 16000 -b:a 32k \
  -f segment -segment_time 660 "$WORK/parts/part%02d.mp3"
python /root/.hermes/skills/media/social-video-transcription-operations/scripts/transcribe_audio_gemini.py \
  "$WORK/parts" "$WORK/texts"
```

The script uploads audio to the configured provider. Respect applicable privacy constraints; public file hosting is not necessary to run this route or deliver the result.

## Resume without repeating successful work

The script writes one transcript per audio basename and skips existing nonempty outputs. If a call times out, inspect which output files exist and rerun the same command to resume missing segments. Do not rerun the entire recording through another local model first. A nonempty output is only a resume checkpoint, not proof of full coverage: inspect it for truncation before accepting it.

For a recording longer than the foreground execution budget, use a tracked background job with completion notification or process a bounded batch per call. Preserve outputs on disk either way.

## Merge in source order

1. Enumerate source segments and output transcripts programmatically. Require exactly one nonempty transcript for each source segment; reject missing or unexpected basenames.
2. Probe segment durations and verify that their sum covers the original within encoding tolerance.
3. Offset each segment-local timestamp by that segment's actual start. For a fixed 660-second split, part index `i` has an approximate offset of `i * 660`; use actual starts when available.
4. Normalize speaker labels across segments to neutral `HOMEM` / `MULHER` or `FALANTE 1` / `FALANTE 2` unless identities are established. Do not inherit guessed professional roles as facts.
5. Read all transcript outputs. Inspect opening and closing text, and both sides of each join for omissions, duplicates, or abrupt truncation. Compare questionable spans with the corresponding source audio using a second transcription pass when needed; mark unresolved spans instead of repairing them from context alone.
6. Produce one UTF-8 text file, with a brief automatic-transcription note if appropriate. Deliver the full file natively for long conversations, without flooding chat or substituting a summary. Do not post sensitive transcripts to public temporary hosts without explicit permission.

Timestamps are approximate navigation aids, not evidence that every second was transcribed. Silence or a final spoken timestamp before the file's end can be legitimate; inspect coverage rather than requiring an exact timestamp match.
