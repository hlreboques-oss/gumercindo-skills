#!/usr/bin/env bash
set -euo pipefail

# Create a quick vertical social cut from a phone video.
# Usage:
#   scripts/phone_vertical_series_cut.sh input.mp4 output.mp4 "DIA 1" "CRIANDO UMA EMPRESA AUTÔNOMA COM IA" "Acompanhe a construção do zero" "com agentes, vendas e automação" 0 60

IN="${1:?input video}"
OUT="${2:?output mp4}"
TITLE1="${3:-DIA 1}"
TITLE2="${4:-CRIANDO UMA EMPRESA AUTÔNOMA COM IA}"
BOTTOM1="${5:-Acompanhe a construção do zero}"
BOTTOM2="${6:-com agentes, vendas e automação}"
START="${7:-0}"
DUR="${8:-60}"
FONT="${FONT:-/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf}"

ffmpeg -y -ss "$START" -t "$DUR" -i "$IN" \
-filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=28,eq=brightness=-0.18:saturation=0.9[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,drawbox=x=0:y=0:w=1080:h=190:color=black@0.55:t=fill,drawbox=x=0:y=1710:w=1080:h=210:color=black@0.55:t=fill,drawtext=fontfile=${FONT}:text='${TITLE1}':fontcolor=white:fontsize=58:x=60:y=45,drawtext=fontfile=${FONT}:text='${TITLE2}':fontcolor=white:fontsize=40:x=60:y=112,drawtext=fontfile=${FONT}:text='${BOTTOM1}':fontcolor=white:fontsize=42:x=(w-text_w)/2:y=1760,drawtext=fontfile=${FONT}:text='${BOTTOM2}':fontcolor=white:fontsize=36:x=(w-text_w)/2:y=1820[v]" \
-map "[v]" -map 0:a? \
-c:v libx264 -preset veryfast -crf 28 -r 30 \
-c:a aac -b:a 96k -movflags +faststart "$OUT"

ffprobe -v error -show_entries format=duration,size,bit_rate -of default=noprint_wrappers=1 "$OUT"
