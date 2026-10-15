# YouTube Live → Carlos-centered promo cuts with local transcription

Use this when Carlos asks for cuts from his own speaking parts in a YouTube Live and normal YouTube transcript/subtitle routes fail or are incomplete.

## Durable pattern from session

1. **Acquire source video**
   - Try `yt-dlp` first.
   - If YouTube blocks with bot/login, try DownSub for subtitles.
   - If DownSub returns no subtitles, use Loader.to 480p fallback:
     - `https://loader.to/ajax/download.php?format=480&url=<youtube-url>`
     - poll `progress_url` until `success=1`
     - download `download_url`
   - Validate with `ffprobe` before cutting.

2. **Transcribe locally when subtitles fail**
   - Long lives can kill larger Whisper models if transcribed as one file.
   - Safer CPU route:
     - split/extract 10-minute WAV chunks: `ffmpeg -ss START -t 600 -i source.mp4 -vn -ac 1 -ar 16000 chunks/chunk_START.wav`
     - load `faster_whisper.WhisperModel('tiny', device='cpu', compute_type='int8')`
     - transcribe each chunk with `language='pt'`, `vad_filter=True`, `beam_size=1`, `best_of=1`
     - add the chunk start offset back to every segment.
   - Tiny is less accurate, so use transcript for discovery and write polished/short subtitles for the selected clip rather than blindly burning raw transcript.

3. **Select Carlos-centered moments**
   - Prioritize identity/authority, sales philosophy, IA-as-augmentation, prospecting, automation, and time-saving claims.
   - Keep cuts under 60s.
   - If user asks to promote his work, favor clips with clear offer/value:
     - IA finds/qualifies clients;
     - IA personalizes messages;
     - IA removes repetitive work from salespeople;
     - automation frees the entrepreneur for strategy/networking.

4. **Render vertical MP4s**
   - If source is already 9:16, scale/crop to 1080x1920.
   - Use a dark top title bar and burned ASS captions near the bottom.
   - For long all-caps titles, manually split into two lines.
   - Avoid `drawtext=textfile` with newlines if square glyphs appear; use two separate `drawtext` filters, one per title line.

5. **QA before delivery**
   - `ffprobe` each MP4: duration <= 60s, 1080x1920, H.264/AAC.
   - Build a contact sheet and inspect visually for:
     - title not cropped;
     - no square newline glyphs;
     - subtitles readable;
     - face/video centered.
   - Re-render if title or subtitle legibility is off.
   - ASS subtitle pitfall: when generating `.ass` files from Python, preserve the ASS hard line break as the literal command `\N` in the file, but do **not** over-escape it into visible text. A safe pattern is to escape `{`/`}` in text chunks, join chunks with `r'\N'`, then inspect a contact sheet for visible backslashes. If a `\` or `\N` appears in the rendered subtitle, re-render before delivery.
   - Contact sheet pitfall: ffmpeg `tile` can be awkward when clip frame sizes or input counts differ. A reliable fallback is to extract one QA JPG per clip with ffmpeg, then assemble the sheet with Python/PIL into a grid.

For portrait Instagram two-person split-screen lives, preserve the complete source instead of cropping to one face. At 720×1280, scale the source to 540×960 and pad at x=90,y=150; reserve the top 150px for a two-line hook/speaker label and the bottom 170px for timed subtitles. Inspect both faces and first/middle/end caption frames. Use tiny for long-source discovery and medium only for selected excerpts; trim opening dependent comparisons when the example itself is self-contained. For public-source Catbox delivery, persist every returned URL before validation. If Python requests gets disconnected during range verification, retry using curl with a browser user agent and verify MP4/ZIP magic bytes rather than reuploading blindly.

6. **Delivery**
   - Zip all cuts + `summary.json` + contact sheet.
   - Upload individual MP4s and ZIP.
   - If tmpfiles simple `/dl/<id>/<filename>` returns HTML, parse the landing page for the signed `a.download` href and validate that direct link.
