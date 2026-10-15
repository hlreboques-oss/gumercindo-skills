#!/usr/bin/env bash
# Pipeline completo: cenas.js -> HTML -> MP4 com trilha.
# uso: bash make_video.sh <cenas.js> <nome_saida> [logo.js] "<cortes>" "<impactos>"
#  ex.: bash make_video.sh cenas.js meu_video assets/logo.js "4.2,8.2,13.2" "19.25"
set -e
S="$(cd "$(dirname "$0")" && pwd)"; SC="$1"; NAME="$2"; LOGO="$3"; CUTS="$4"; HITS="$5"
node "$S/build.js" "$SC" "$NAME.html" $LOGO
node "$S/render.js" "$NAME.html" "$NAME.mudo.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$NAME.mudo.mp4")
DUR=$(node -e "console.log(Math.ceil($DUR))")
node "$S/music.js" "$NAME.wav" --dur "$DUR" --cuts "$CUTS" --hits "$HITS"
ffmpeg -v error -y -i "$NAME.mudo.mp4" -i "$NAME.wav" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$NAME.mp4"
rm -f "$NAME.mudo.mp4" "$NAME.wav"; echo "PRONTO: $NAME.mp4 (e $NAME.html para ver no navegador)"
