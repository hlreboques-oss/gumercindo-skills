# Mining testimonial excerpts from a batch of meeting recordings

Carlos drops a Drive folder with recordings of meetings he attended and asks for the important excerpts of
people talking about the agent/product (or him talking about it), delivered as **text for approval first** and
only then rendered. The render style is the split screen from `video-animado-js` (real footage below, motion
graphics above).

## Spec of each excerpt

- **Between 1:00 and 1:30** — never shorter than a minute, never longer than a minute and a half. Pick the
  window that holds a complete thought (início, meio e fim); never end mid-sentence and never cut the line of
  reasoning to fit the clock.
- Choose what creates curiosity: what the agent does by itself, concrete results, actions that someone else
  could also have done, objections broken. Numbers and named outcomes beat adjectives.
- One excerpt per recording is normal. When a recording holds two independent strong arcs, split it — each one
  still inside 1:00–1:30.
- Track the speaker of every excerpt and **warn when two or more come from the same person**: Carlos asks for
  variety and reads three clips of the same client as padding.

## Pipeline

1. Inventory the folder with `GOOGLEDRIVE_FIND_FILE` (`q="trashed = false"`, `orderBy=createdTime desc`,
   `pageSize=100`, `includeItemsFromAllDrives`) and freeze a `files.json` (`name`, `id`, `size`). Skip `size=0`
   entries — they are uploads that never finished.
2. **Audio-only ingest.** Download the MP4 into a scratch `raw/`, `ffprobe` its duration, extract
   `ffmpeg -vn -ac 1 -ar 16000 -c:a pcm_s16le`, then **delete the MP4 right away** and append
   `{name, id, duration, wav}` to `manifest.json`.
   WHY: a morning of meeting recordings is several GB (this class of batch ran ~5 GB) and the box sits at ~98%
   disk; only the audio is needed to choose windows. The approved clips get re-downloaded one at a time at
   render time and deleted again after composing.
3. **Triage pass** over every file with `faster_whisper` `small` (CPU/int8, `language='pt'`, `vad_filter=True`,
   `word_timestamps=True`, `condition_on_previous_text=False`) writing one JSON + one TXT per file, with an
   `initial_prompt` seeded with the domain vocabulary ("Gumercindo, agente de IA, Instagram, leads, follow-up,
   implementação, CRM") so the product name survives. Read the TXTs to pick candidate windows.
4. **Refine pass** on each chosen window only: `ffmpeg -ss A -i <wav> -t DUR` then re-transcribe with `medium`.
   The quote shown to Carlos must be exact — `small` turns "Gumercindo" into "Gumecindo"/"CLM", invents words
   and drops whole clauses in fast PT-BR.
5. Only after his approval, download the chosen MP4s (one at a time), compose the split screen, delete the
   source again. Compose it in **one ffmpeg pass** (`scripts/compose_split_ffmpeg.sh` in `video-animado-js`:
   `crop` the band where the speaker appears → `scale` cover to 1080x960 → `vstack` under the animation's top
   960px). A frame-by-frame PIL composer takes tens of minutes on the same window; if one is still running after
   ~5 minutes, kill it and redo the pass in ffmpeg. Screen recordings need the crop; selfies look right with
   cover/contain.

## Identify who is speaking before labelling the excerpt

- Extract a frame at the excerpt time (`ffmpeg -ss <t> -i file.mp4 -frames:v 1 -vf scale=1280:-1`) and look at
  it: a **selfie talking head** (person filling the frame) or a **phone recording of a laptop screen** showing
  the meeting (person tiny, keyboard and taskbar visible, the screen fills the frame).
- The meeting UI carries the participant name tags — read them with vision instead of guessing, and do not
  attribute a quote to Carlos just because the meeting was his.
- Mixing happens: within one batch the selfie recordings sit beautifully in the lower half of a split screen,
  while the screen recordings need a zoom crop on the speaking tile (or the recorded frame itself) as the lower
  panel. Say which is which when presenting the excerpts, because it changes how good the final video looks.

## Checking that transcripts are not misattributed

- Print transcripts **with the file name as a header**, never `cat` several TXT files into one stream:
  consecutive blocks with no separator get read as if they belonged to the file printed first, which puts the
  right words under the wrong source and the wrong speaker. Same rule when summarising: a quote is only usable
  after the file it came from is unambiguous.
- Sanity check before quoting: compare each transcript's **last segment timestamp with that file's `ffprobe`
  duration**. A segment beyond the duration means the blocks were misattributed — re-read the files
  individually.

## Delivery for approval

One block per excerpt: number, duration (`1:08`), origin file, whether the image is selfie or screen recording,
and the text as a quote; then the honest warnings (same speaker repeated, weak image, incomplete thought). Close
by asking which numbers are approved — "pode dizer '1, 3, 5' ou 'todos'" — and state that nothing is rendered
before that answer.
