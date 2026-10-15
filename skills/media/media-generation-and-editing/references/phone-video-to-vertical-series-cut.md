# Phone video to vertical series cut

Use when Carlos sends a large phone-recorded video via Google Drive and asks for a quick social cut for a series episode.

## Pattern proven in session

Input shape:
- Google Drive share link for a large MP4 that could not be uploaded directly to Telegram because it exceeded the chat limit.
- Phone recording with rotation metadata (`displaymatrix: rotation of -90.00 degrees`) and landscape-ish encoded dimensions, but intended as a vertical/social clip.
- User wanted a fast cut, not a full cinematic edit.

## Workflow

1. Download from Drive with `gdown` using the file ID or URL. Newer `gdown` CLI may reject the old `--id` flag; use:

```bash
python3 -m gdown FILE_ID -O original_video
# or
python3 -m gdown 'https://drive.google.com/uc?id=FILE_ID' -O original_video
```

2. Probe before editing:

```bash
ffprobe -v error \
  -show_entries format=duration,size,bit_rate \
  -show_entries stream=index,codec_type,codec_name,width,height,avg_frame_rate:stream_tags=rotate \
  -of json original_video
```

3. Create a 30–60s vertical cut under the platform/chat size limit. For a fast publishable version, use blurred background + centered foreground + top/bottom title bars.

4. Extract a thumbnail frame and visually QA before delivery:

```bash
ffmpeg -y -ss 5 -i final.mp4 -frames:v 1 thumb.jpg
```

Check:
- orientation is correct;
- title is readable;
- subject is not badly cropped;
- bottom text is not too close to platform UI areas;
- output size/duration are verified.

## Example ffmpeg filter

```bash
ffmpeg -y -ss 0 -t 60 -i original_video \
-filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.18:saturation=0.9[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,drawbox=x=0:y=0:w=1080:h=190:color=black@0.55:t=fill,drawbox=x=0:y=1710:w=1080:h=210:color=black@0.55:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='DIA 1':fontcolor=white:fontsize=58:x=60:y=45,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='CRIANDO UMA EMPRESA AUTÔNOMA COM IA':fontcolor=white:fontsize=40:x=60:y=112,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='Acompanhe a construção do zero':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=1760,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='com agentes, vendas e automação':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=1820[v]" \
-map "[v]" -map 0:a? \
-c:v libx264 -preset veryfast -crf 28 -r 30 \
-c:a aac -b:a 96k -movflags +faststart final.mp4
```

In the session, a 328 MB original became a verified 60s 1080x1920 MP4 around 4 MB, suitable for chat delivery/testing.

## Caption pattern for Carlos's AI-business series

```text
Dia 1 criando uma empresa autônoma com IA.

A ideia é documentar, na prática, a construção de uma estrutura que usa agentes de IA para vender, prospectar, produzir conteúdo e operar processos.

Não é sobre brincar de chatbot.
É sobre criar uma empresa que roda com sistemas, agentes e execução diária.

Se você quer acompanhar essa construção, comenta IA ou me chama no direct.
```

## Pitfalls

- Do not stop when Telegram rejects the file as too large; ask for/consume a Drive link and download it.
- Do not deliver a cut without checking `ffprobe` size/duration and a thumbnail/contact-sheet style visual QA.
- If the phone file has rotation metadata, trust the rendered thumbnail over raw encoded width/height when validating orientation.
