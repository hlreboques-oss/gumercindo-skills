# Video edit recipes (ffmpeg + helpers)

Verified against a vertical phone clip edited into a ~25s cut with titles, burned-in PT-BR captions
and crossfades on a 2-vCPU VPS.

## 1. Probe

```bash
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,channels \
  -of default=noprint_wrappers=1 input.mp4
```

## 2. Transcribe (PT-BR) for captions and cut points

```python
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')   # models are cached locally
segs, info = m.transcribe(src, language='pt', vad_filter=True, beam_size=5)
```

Dump `[{ini, fim, txt}]` to JSON: the same list is the caption text and the segment plan.

## 3. Candidate speaker-change moments (when the transcript is not enough)

```bash
ffmpeg -hide_banner -nostats -i input.mp4 \
  -vf "select='gt(scene,0.09)',metadata=print" -an -f null -
```

Parse `pts_time:` and `scene_score=` pairs in Python, keep local peaks at least ~1.2s apart.

## 4. Cut + normalise one segment

```bash
ffmpeg -v error -y -ss 4.20 -to 8.30 -i input.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p,setsar=1" \
  -af "aresample=48000,asetpts=N/SR/TB" -shortest \
  -c:v libx264 -preset veryfast -crf 19 -c:a aac -b:a 160k seg01.mp4
```

`-ss`/`-to` go **before** `-i` (input-side trim). Check each output duration with `ffprobe`; the
requested range and the produced duration must match before joining.

## 5. Join — one transition per pass (memory-safe)

```python
D = 0.35                     # transition seconds
cur, acc = segs[0], dur[0]
for i in range(1, n):
    off = acc - D            # xfade offset lives in the FIRST input's timeline
    # ffmpeg -i cur -i segs[i] -filter_complex
    #   "[0:v][1:v]xfade=transition=fade:duration=D:offset=off[v];
    #    [0:a][1:a]acrossfade=d=D:c1=tri:c2=tri[a]"
    #   -map [v] -map [a] -c:v libx264 -preset veryfast -crf 19 -threads 1
    #   -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart chain_%02d.mp4
    acc = acc + dur[i] - D

# expected final duration = sum(dur) - (n - 1) * D
```

An all-at-once `filter_complex` with every input fails here: peak RAM kills ffmpeg and the output is
truncated (`moov atom not found`).

## 6. Captions (ASS) with a retimed timeline

Headers matter: `PlayResX/PlayResY` = the video size, one style for speech and one for the highlighted
lines, `Alignment=2` (bottom centre), `MarginV` around 300 for a 1080x1920 frame.

```python
def ts(x):
    h = int(x // 3600); m = int((x % 3600) // 60); s = x % 60
    return f'{h}:{m:02d}:{s:05.2f}'

acc = 0.0
for i, seg in enumerate(segs):
    start = acc
    end = acc + seg['dur'] - (D if i < len(segs) - 1 else 0)
    text = seg['txt'].replace('\n', '\\N')      # real newline -> ASS line break
    line = f"Dialogue: 0,{ts(start)},{ts(end)},{style},,0,0,0,,{text}"
    acc += seg['dur'] - D
```

## 7. Two light render passes

```bash
# pass 1 — captions only
ffmpeg -v error -y -i base.mp4 -vf "ass=legenda.ass" -threads 1 -filter_threads 1 \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy com_legenda.mp4

# pass 2 — opening title + end card (text via textfile to avoid escaping)
ffmpeg -v error -y -i com_legenda.mp4 -vf \
 "drawtext=fontfile=/path/Montserrat-Bold.ttf:textfile=titulo1.txt:fontsize=96:fontcolor=white:\
borderw=3:bordercolor=black@0.55:shadowy=3:shadowcolor=black@0.5:x=(w-text_w)/2:y=h*0.20:\
alpha='if(lt(t,0.5),t/0.5,if(lt(t,3.4),1,max(0,(3.9-t)/0.5)))',\
drawtext=fontfile=/path/Montserrat-Bold.ttf:textfile=fim.txt:fontsize=64:fontcolor=white:\
borderw=3:bordercolor=black@0.6:x=(w-text_w)/2:y=h*0.20:\
alpha='if(lt(t,T-2.1),0,if(lt(t,T-1.4),(t-(T-2.1))/0.7,1))':enable='gte(t,T-2.4)'" \
 -threads 1 -filter_threads 1 -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p \
 -c:a copy -movflags +faststart final.mp4
```

Replace `T` with the final duration. Place any end card in the upper third (`y=h*0.20`): mid-frame
lands on the subject's face.

## 8. Fonts

`fonts.googleapis.com` serves woff2, and the `google/fonts` repo has no static Montserrat Bold (that
URL returns an HTML 404 page — check with `file`). Instantiate the variable font instead:

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
out = instantiateVariableFont(TTFont('Montserrat[wght].ttf'), {'wght': 700}, inplace=False)
out.save('Montserrat-Bold.ttf')
```

Install with `pip install fonttools` if missing, copy the TTFs into `/usr/local/share/fonts/<project>/`
and run `fc-cache -f` so libass resolves the family by name.

## 9. Delivery

```bash
md5sum final.mp4                      # compare with Drive files().get(md5Checksum)
```

Upload to the job's Drive folder (`MediaFileUpload`, `resumable=True`), read the file back
(`size`, `md5Checksum`), and send the file in chat with `MEDIA:/abs/path`. Keep the working folder
(`work/` segments, `segs.json`, `transcricao.json`, `legenda.ass`) — adjustments reuse all of it
without re-transcribing.

## 10. Same asset, story format

For a 9:16 story from a 3:4 photo: blurred darkened copy of the photo filling 1080x1920, the intact
photo scaled to fit on top, hairline border. Never crop people out to fill the frame.
