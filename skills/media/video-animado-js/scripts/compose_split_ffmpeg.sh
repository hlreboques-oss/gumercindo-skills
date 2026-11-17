#!/bin/bash
# Tela dividida para vídeo de fala real: animação em cima (1080x960) + gravação embaixo (1080x960).
# Caminho RÁPIDO: uma passada de ffmpeg com vstack (~1,5 min para 77s). O compositor em PIL
# (templates/compose_split_real.py) faz a mesma coisa a ~6 quadros/s e leva dezenas de minutos;
# use o PIL só para clipes curtos ou quando precisar do badge/máscara exatos.
#
# uso: ./compose_split_ffmpeg.sh SRC INI DUR ANIM OUT [CROPY CROPH CROPW CROPX HEX]
#   SRC   = gravação real (mp4)
#   INI   = segundo inicial da janela aprovada
#   DUR   = duração da janela (ex. 76.82)
#   ANIM  = animação renderizada cheia, 1080x1920 (só o topo é usado)
#   OUT   = saída 1080x1920 com o áudio original tratado
#   CROPY/CROPH/CROPW/CROPX = recorte da gravação que contém o falante (padrão 220 860 864 0,
#                            medido para uma captura de celular da tela de um notebook)
set -e
SRC="$1"; INI="$2"; DUR="$3"; ANIM="$4"; OUT="$5"
CY="${6:-220}"; CH="${7:-860}"; CW="${8:-864}"; CX="${9:-0}"; AC="${10:-0x3dff5c}"
ffmpeg -y -hide_banner -loglevel error \
  -ss "$INI" -i "$SRC" -i "$ANIM" \
  -filter_complex "\
[1:v]crop=1080:960:0:0,setsar=1[top];\
[0:v]crop=${CW}:${CH}:${CX}:${CY},scale=1080:960:force_original_aspect_ratio=increase,crop=1080:960,setsar=1[bot];\
[top][bot]vstack=inputs=2[v0];\
[v0]drawbox=x=0:y=946:w=1080:h=30:color=${AC}@0.95:t=fill[v]" \
  -map "[v]" -map 0:a -t "$DUR" \
  -af "highpass=f=90,loudnorm=I=-15:TP=-1.5:LRA=11,alimiter=limit=0.94" \
  -c:v libx264 -preset veryfast -crf 21 -pix_fmt yuv420p -r 30 \
  -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT"
echo "OK $OUT"
