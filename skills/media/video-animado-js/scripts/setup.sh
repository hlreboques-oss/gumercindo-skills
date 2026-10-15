#!/usr/bin/env bash
# Instala dependências da skill (rodar uma vez). Requer: node >= 18, python3, ffmpeg.
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"; cd "$DIR"
command -v ffmpeg >/dev/null || { echo "ERRO: instale o ffmpeg (ex.: apt install ffmpeg)"; exit 1; }
[ -f package.json ] || npm init -y >/dev/null
npm i --silent playwright @fontsource/archivo @fontsource/archivo-black @fontsource/cinzel
npx playwright install chromium || echo "AVISO: se o Chromium já existir no sistema, defina CHROMIUM_PATH=/caminho/do/chromium"
pip install -q potracer pillow numpy 2>/dev/null || pip install -q --break-system-packages potracer pillow numpy
echo "OK — skill pronta."
