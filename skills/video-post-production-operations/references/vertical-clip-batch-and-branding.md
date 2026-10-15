# Long live → batch of vertical clips (with brand badge)

Use when one long recording (live, podcast, interview) must become **many** short vertical clips, and the
user wants a brand character/logo inside the frame.

## Batch shape

- Select first, render later. Produce one selection manifest `clips.json`:
  `[{id,start,end,title,label,quote,theme}]`. 10-14 excerpts when the user says "quantos derem"; at least a
  few per theme he named (e.g. him talking about the product/AI vs. the guest's own work).
- `title` = short hook (a rhetorical question works for Carlos), <= ~48 chars, 2 lines max on screen.
  Wrap with `textwrap.wrap(title, 27)` **and assert the line count is <= 2**: slicing the first two lines
  silently drops the closing words of the question and ships a truncated hook that reads like a typo.
- 12-16 clips is a normal batch when Carlos says "não se limite a cinco"; do not pad with weak excerpts to hit a count, and do not stop at five when the material supports more.
- `label` = the upper author line, per clip, so different themes read differently in the same batch
  (e.g. `CARLOS JÚNIOR  •  IA E GUMERCINDO` vs `CARLOS JÚNIOR  •  COM VICTOR HUGO`).
- `quote` = literal transcript line that justifies the cut. Review the manifest before rendering; a clip
  whose quote does not carry the theme is dropped, not padded.
- One self-contained render script reads the manifest and processes one clip per invocation
  (`python render.py clips.json 03,07`), so parallel workers can own ID slices and a timeout never loses
  the whole batch. Append each finished clip to `summary.json` (path, duration, size, md5) as it completes.

## Caption/title timing (bare transcript words → ASS)

- Refine only the selected window with `word_timestamps=True` on a 16 kHz wav extracted with
  `-ss <start> -t <dur>`; the tiny model used for the full-length transcript is not accurate enough to sync.
  `small` int8 with `beam_size=1, condition_on_previous_text=False` is fast enough for a whole batch and syncs
  well; escalate a clip to `medium` only if its captions still read wrong.
- Cache the refined word list per clip (`<id>_refined.json`) and reload it when present: a later layout fix then
  costs ffmpeg only, not another Whisper pass over the batch.
- Repair ASR tokens before writing captions: merge proper nouns the model splits across two words, collapse the
  duplicate the merge leaves behind (`Gumercindo Gumercindo`), and rejoin hyphenated compounds (`e -mail` →
  `e-mail`). Fix names, brands and formatting only — never rewrite arbitrary misheard words.
- Group words until ~41 characters or ~3.4 s, break at sentence end, wrap at 25 characters per line.
- Cap every group's end at the **next** group's start; otherwise the last caption of a sentence overlaps the next.
- Write both ASS (burned) and SRT (`HH:MM:SS,mmm`, correct zero padding) — the SRT is the hand-off artifact.

## Frame bands in 1080x1920

- Title band: dark box `y 95-380` plus an accent rule, title in `Alignment 8`, label above it.
- **Read the geometry from the source before choosing the caption band.** Extract a frame near the start
  (`ffmpeg -ss 300 -i source.mp4 -frames:v 1`) and locate the faces with vision, then pick the band.
- Single-speaker portrait source: the scale fills 1080x1920, captions bottom-aligned `MarginV 345` ending
  ~y 1575, badge in the free strip below (~y 1600-1900).
- **Stacked two-speaker source (host on top, guest below): never bottom-anchor captions.** The lower
  participant's face sits in the bottom third, so `MarginV 345`/`470` puts the subtitle across his eyes and
  Carlos rejects the whole batch. Use a centered block instead (`Alignment 5`, `MarginV 0`), which lands the
  text on the seam between the two panels, clear of both faces. Keep the badge ~180 px wide in the bottom
  corner (`overlay=W-w-30:H-h-18`).
- **The badge is composited after the ASS burn, so it paints over captions.** After moving captions, re-check a
  frame: a caption line reaching the badge corner shows up truncated behind the sticker.
- Re-render only the ids whose layout changed, then re-check frames and rebuild the delivery archives.

## Brand badge (mascot sticker)

1. Crop the character from the client's own promo art; drop any marketing text or claims that fall inside
   the crop (leftover copy inside a badge reads as an accident).
2. `thumbnail((300, 470))`, rounded mask (`rounded_rectangle(radius=34)` on an `L` mask + `putalpha`),
   paste on a padded canvas with a blurred black shadow (rounded rect ~120 alpha, +6 px offset,
   `GaussianBlur(9)`) and a 3 px white hairline. The hairline + shadow is what makes it look designed.
3. Overlay in the same filter graph as the captions:
   `[0:v]scale=1080:1920:...,drawbox=...,ass=...[bg];[1:v]format=rgba[badge];[bg][badge]overlay=W-w-35:H-h-25:format=auto[v]`
   with the badge PNG as a second input, mapping `[v]` plus `0:a`.
4. **Do not flood-fill the badge background away.** A light character on a light promo background matches
   the background within tolerance, so its own body becomes transparent and it renders as a dark silhouette
   with holes on the video. Keep the sticker chip with its own background.
5. Verify: extract a mid frame and confirm the badge touches neither the caption block nor the title panel,
   and that the wordmark is still legible in a downscaled (phone-size) frame.

## Render/verify flags that fit a 2-CPU box

`-preset veryfast -crf 22 -threads 2 -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -movflags +faststart`, audio
`loudnorm=I=-16:TP=-1.5:LRA=11`. Assert `duration <= 60.05`, decode the whole file (`-f null -`), then take
first/middle/end frames and look at them.
