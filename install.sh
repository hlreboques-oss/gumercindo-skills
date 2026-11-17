#!/usr/bin/env bash
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/skills"
DEST_DIR="${HERMES_SKILLS_DIR:-$HOME/.hermes/skills}"
DRY_RUN=0

usage() {
  cat <<'EOF'
Uso: ./install.sh [--dry-run] [--dest DIRETORIO]

Instala ou atualiza as skills do pacote Gumercindo.
  --dry-run         mostra o que seria copiado
  --dest DIRETORIO  altera o destino (padrão: ~/.hermes/skills)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --dest) DEST_DIR="${2:?Informe o diretório após --dest}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Opção desconhecida: $1" >&2; usage >&2; exit 2 ;;
  esac
done

[[ -d "$SOURCE_DIR" ]] || { echo "Diretório de skills não encontrado: $SOURCE_DIR" >&2; exit 1; }

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo "Origem:  $SOURCE_DIR"
  echo "Destino: $DEST_DIR"
  find "$SOURCE_DIR" -type f -not -path '*/node_modules/*' -not -path '*/__pycache__/*' -printf '%P\n' | sort
  exit 0
fi

mkdir -p "$DEST_DIR"
if command -v rsync >/dev/null 2>&1; then
  rsync -a \
    --exclude node_modules/ \
    --exclude __pycache__/ \
    --exclude '*.pyc' \
    "$SOURCE_DIR/" "$DEST_DIR/"
else
  cp -a "$SOURCE_DIR/." "$DEST_DIR/"
  find "$DEST_DIR" -type d -name node_modules -prune -exec rm -rf {} +
  find "$DEST_DIR" -type d -name __pycache__ -prune -exec rm -rf {} +
  find "$DEST_DIR" -type f -name '*.pyc' -delete
fi

COUNT="$(find "$DEST_DIR" -name SKILL.md -type f | wc -l | tr -d ' ')"
echo "Instalação concluída: $COUNT skills encontradas em $DEST_DIR"
