# Compositing footage into a template frame (moldura)

Use when Carlos sends a template image (a frame with an empty placeholder box) plus a link or file and asks
to put the video inside it — his wording is often "coloca ele dentro dessa moldura ou aumente o espaço do
vídeo até caber no tamanho que o próprio vídeo vai ocupar". Two rectangles have to be measured, the box has
to be re-fitted to the footage aspect, and the frame chrome has to be rebuilt before the overlay.

## 1. Resolve what he actually means before building

"Esse vídeo" is ambiguous when he attaches a template *and* a link: the template is the **target**, the link is
the **source**. When the source is a reel of someone else's story card, the video he means is only the band
playing in the middle of it, not the whole card (header, avatar, black bars). If his correction says "o vídeo
que está sendo passado no meio da moldura", crop the footage band out of the reel and use the attached image as
the frame.

## 2. Get the source footage

```bash
python -m yt_dlp --dump-json --no-warnings '<reel-url>'   # uploader/channel -> tell him whose post it is
python -m yt_dlp -F '<reel-url>'                          # audio present or not
python -m yt_dlp --no-playlist -f 'bestvideo+bestaudio/best' --merge-output-format mp4 -o source/reel.mp4 '<url>'
```

A reel reposted from another account is frequently **video only** (only `…v` DASH formats listed). Also inspect the page metadata for `has_audio:false`, `music_info:null`, and `original_sound_info:null`; that combination means the original sound is not recoverable from the provided link. Do not solve “está sem som” by adding outside music unless Carlos asked for a soundtrack. If original sound is absent, say so and offer the next choice. Add a silent stereo track only as a compatibility measure (`-f lavfi -i anullsrc=r=48000:cl=stereo`), and label it as silent.

## 3. Measure both rectangles — never eyeball them

**Placeholder box in the template.** Dark fraction per row/column, **restricted to the middle band** (roughly
`0.30H–0.80H`): the avatar and the dark heading text are near-black too and otherwise drag the bounding box up
into the title. Rows with a dark fraction > 0.75 and columns > 0.90 inside that band give the box.

**Footage band inside the reel.** ffmpeg scene detection (`select=gt(scene\,0.25),showinfo`) returns **nothing**
on these layouts — the transitions are crossfades over a loud background, so nothing crosses the threshold.
Sample ~24 frames across the whole duration at full res and compute the per-pixel temporal std:

```python
stack = np.stack([np.asarray(Image.open(p).convert('L'), np.float32) for p in sampled])
std = stack.std(axis=0)
rowp = (std > 26).mean(axis=1)          # rows where >55% of pixels vary = the footage band
rows = [y for y in range(H) if rowp[y] > 0.55]
```

Then confirm: the row profile must be flat (1.0) across the band and 0.0 outside it, which proves the layout is
stable for the whole video; a single rectangle is only valid if it is. Crop 2–3 timestamps to that rectangle and
look at them before trusting the numbers — the crop must have no black bar and the burned-in subtitle must fall
inside it.

**Screenshot scale.** A template sent as a Telegram *photo* is downscaled to ≤1280px on the long side, so an
attachment that reports 720x1280 is a 1.5x reduction of a 1080x1920 design. Work on the 1080x1920 canvas and
upscale the template with `Image.LANCZOS`; if sharpness matters he can resend it as a **file/document**.

## 4. Fit decision — enlarge the box, do not letterbox

The footage aspect rarely equals the box aspect (detected example: footage 1080x855 = 1.26 vs box 1.94). Keep
the box's width and top and grow its height to the footage aspect (`box_h = round(box_w / footage_aspect)`),
using the empty background below it, then assert the new top/height does not reach the heading text. Painter's
order: glow → black fill + border → footage overlay, so the border survives at the rounded corners.

## 5. Rebuild the chrome, then overlay

The original box carries a thin bright border plus a soft light halo. Draw it oversized and downscale instead of
fighting antialiasing:

```python
SS = 4  # supersample; draw rounded_rectangle at size*SS with radius*SS, then resize(LANCZOS)
glow = rounded((box_w+40, box_h+40), RADIUS+20, outline=(210,240,255,200), width=22)
base = Image.alpha_composite(base, glow.filter(ImageFilter.GaussianBlur(9)))
frame = rounded((box_w, box_h), RADIUS, fill=(0,0,0,255), outline=(236,246,253,255), width=BORDER)
```

Mask for the footage = the **inner** area inside the border, as a grayscale rounded rect, applied with
`alphamerge`; scale the footage to *cover* then crop the 2–3px overflow so nothing is stretched:

```
[1:v]crop=CWf:CHf:CX:CY,scale=iw:cover_h,crop=iw:ih,setsar=1[foot];
[foot][2:v]alphamerge[footm];
[0:v][footm]overlay=ix:iy:shortest=0,format=yuv420p[out]
```

with `-loop 1 -framerate 30 -i moldura.png` for the still frame and `-an` (or the silent track from step 2).

## 6. Test-render 3s before the full render

Same filtergraph, `-t 3`, then pull one frame plus a crop of a bottom corner and look at both: a wrong offset or
radius only shows in the image (a "white artifact" at a corner is usually content of the footage — inspect the
full-res crop before "fixing" a non-bug). Run the full duration in the background with `notify=true`.

## 7. Encoder

`ffmpeg -encoders` listing `h264_nvenc` is **not** proof a GPU is reachable — the long encode can exit 255 on
the filtergraph. Either confirm with a 3s test encode on nvenc, or go straight to
`-c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p` (≈1.1x realtime at 1080x1920 on this VPS).

## 8. Hand-over

Send the MP4 as `MEDIA:` and state: what was cropped out of the source, that the **box was enlarged**, to which
aspect, the output resolution/duration, and whether the result carries audio. If the frame had to be upscaled
from a screenshot, say so and offer the redo from a document-quality original.
