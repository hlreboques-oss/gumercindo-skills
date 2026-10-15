# ffmpeg recipes for a client video edit

Copy-paste commands, verified on ffmpeg 8.x / 2 CPUs. `SRC` = raw footage, `WORK/` = intermediates, `D` = transition seconds (0.35).

## 0. Probe + transcribe

```bash
ffprobe -v error -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,channels -of default=noprint_wrappers=1 "$SRC"
```

```python
from faster_whisper import WhisperModel
m = WhisperModel('small', device='cpu', compute_type='int8')
segs, info = m.transcribe(SRC, language='pt', vad_filter=True, beam_size=5)
# -> [{'ini': s.start, 'fim': s.end, 'txt': s.text.strip()}]
```

Scene-change peaks help place cuts when the transcript is thin (lower the threshold until you get hits):

```bash
ffmpeg -hide_banner -nostats -i "$SRC" -vf "select='gt(scene,0.08)',metadata=print" -an -f null - 2>&1 \
  | grep -E 'pts_time|scene_score' | paste - - | sed 's/.*pts_time://; s/.*scene_score=//'
```

## 1. Stage A — trim + normalize every segment to the same format

```bash
ffmpeg -v error -y -ss $INI -to $FIM -i "$SRC" \
  -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,format=yuv420p,setsar=1" \
  -af 'aresample=48000,asetpts=N/SR/TB' \
  -c:v libx264 -preset veryfast -crf 19 -c:a aac -b:a 160k -shortest "$WORK/seg$i.mp4"
```

Probe each output and store the real durations — the transition offsets depend on them, not on the nominal cut times.

## 2. Stage B — transitions, two inputs per run (memory-safe)

```bash
ffmpeg -v error -y -i cur.mp4 -i seg_i.mp4 -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.35:offset=$OFF[v];[0:a][1:a]acrossfade=d=0.35:c1=tri:c2=tri[a]" \
  -map '[v]' -map '[a]' -c:v libx264 -preset veryfast -crf 19 -threads 2 -pix_fmt yuv420p \
  -c:a aac -b:a 160k -movflags +faststart out.mp4
```

Offset arithmetic — `xfade` starts the blend `D` seconds before the end of the accumulated timeline:

```python
acc = dur[0]
for i in range(1, n):
    off = acc - D          # transition offset for this join
    acc = acc + dur[i] - D # accumulated length after the join
```

Total final length = `sum(dur) - (n-1)*D`. Use it as the assertion for verification.

## 3. Stage C1 — legendas (ASS, burned in)

```python
header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: fala,Montserrat,54,&H00FFFFFF,&H00FFFFFF,&H00202020,&H96000000,-1,0,0,0,100,100,0.5,0,1,3.6,1.6,2,60,60,300,1
Style: fala_hi,Montserrat,58,&H0038D0FF,&H00FFFFFF,&H00202020,&H96000000,-1,0,0,0,100,100,0.5,0,1,3.8,1.8,2,60,60,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
# tempos remapeados: cada trecho comeca em `acc` e termina em acc + dur (menos D na juncao)
# quebra de linha dentro da legenda: \N
```

```bash
ffmpeg -v error -y -i base.mp4 -vf "ass=legenda.ass" -threads 1 -filter_threads 1 \
  -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart com_legenda.mp4
```

ASS colours are `&HAABBGGRR` (BGR order): `&H0038D0FF` is amber, `&H00FFFFFF` white. Vertical video subtitles sit well
with `Alignment 2`, `MarginV 300`.

## 4. Stage C2 — título de abertura e cartela final (drawtext)

Write each text to its own file and pass `textfile=` — escaping quotes/commas inside `drawtext` is a trap.

```bash
ffmpeg -v error -y -i com_legenda.mp4 -vf \
 "drawtext=fontfile=$FONT:textfile=titulo1.txt:fontsize=96:fontcolor=white:borderw=3:bordercolor=black@0.55:shadowy=3:shadowcolor=black@0.5:x=(w-text_w)/2:y=h*0.20:alpha='if(lt(t,0.5),t/0.5,if(lt(t,3.4),1,max(0,(3.9-t)/0.5)))',\
drawtext=fontfile=$FONT:textfile=fim.txt:fontsize=64:fontcolor=white:borderw=3:bordercolor=black@0.6:x=(w-text_w)/2:y=h*0.20:alpha='if(lt(t,$END0),0,if(lt(t,$END1),(t-$END0)/0.7,1))':enable='gte(t,$END)'" \
 -threads 1 -filter_threads 1 -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart final.mp4
```

Anti-`cara de IA` placement: título na faixa superior (`y=h*0.20`), cartela final também acima do centro
(`h*0.20`–`0.26`) — no meio do quadro ela cai sobre o rosto. Legenda na base, com contorno.

## 5. Fontes

```bash
curl -sL -o 'fonts/Montserrat[wght].ttf' 'https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf'
pip install fonttools -q
```

```python
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
instantiateVariableFont(TTFont('fonts/Montserrat[wght].ttf'), {'wght': 700}).save('fonts/Montserrat-Bold.ttf')
```

Then `cp fonts/*.ttf /usr/local/share/fonts/<projeto>/ && fc-cache -f` (write the file name the ASS style references:
`Style: fala,Montserrat,...` needs the family installed, not just the path used by `drawtext=fontfile=`).

## 6. Verificação (nada de "o arquivo existe")

```bash
for f in work/base.mp4 com_legenda.mp4 final.mp4; do printf '%s: ' $f; ffprobe -v error -show_entries format=duration -of csv=p=0 $f; done
ffmpeg -v error -y -i final.mp4 -vf "select='eq(n\,15)+eq(n\,640)+eq(n\,735)',scale=380:-1,tile=3x1" -frames:v 1 /tmp/check.jpg
```

- `moov atom not found` na saída = encode morto no meio; refaça (a causa costuma ser memória, não o filtro).
- Duração final confere com `sum(dur) - (n-1)*D`.
- Olhe o frame final cropado: título legível, legenda sem corte, cartela fora do rosto.
- Integridade da entrega: `md5sum` local vs `files().get(fileId=..., fields='md5Checksum')` no Drive.
