#!/usr/bin/env python3
"""Verbatim transcription of long audio through the Gemini Files API.

Usage:
    python3 transcribe_audio_gemini.py <file-or-directory> <outdir> \
        [--model gemini-flash-latest] [--lang "português brasileiro"]

Designed for the cloud-IP case where the source platform refuses the player:
prepare the audio first, then transcribe here.

    ffmpeg -y -i source.mp3 -ac 1 -ar 16000 -b:a 24k mono.mp3
    ffmpeg -y -i mono.mp3 -f segment -segment_time 1650 parts/p%02d.mp3
    python3 transcribe_audio_gemini.py parts out --model gemini-flash-latest

Each input file becomes <outdir>/<name>.txt. Re-running skips files whose
.txt already has content, so a failed segment can be retried alone.

Key is read from $GOOGLE_API_KEY, else from the first GOOGLE_API_KEY= line
in /root/.hermes/.env.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

import requests

BASE = "https://generativelanguage.googleapis.com"

# Provider retires model ids; fall back in order instead of failing the job.
MODEL_CHAIN = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-3.1-flash-lite", "gemini-2.5-pro"]


def api_key() -> str:
    key = os.environ.get("GOOGLE_API_KEY", "").strip()
    if key:
        return key
    env = Path("/root/.hermes/.env")
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("GOOGLE_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("GOOGLE_API_KEY not found in env or /root/.hermes/.env")


KEY = api_key()


def upload(path: Path) -> dict:
    size = path.stat().st_size
    r = requests.post(
        f"{BASE}/upload/v1beta/files?key={KEY}",
        headers={
            "X-Goog-Upload-Protocol": "resumable",
            "X-Goog-Upload-Command": "start",
            "X-Goog-Upload-Header-Content-Length": str(size),
            "X-Goog-Upload-Header-Content-Type": "audio/mp3",
            "Content-Type": "application/json",
        },
        data=json.dumps({"file": {"display_name": path.name}}),
        timeout=60,
    )
    r.raise_for_status()
    r2 = requests.post(
        r.headers["x-goog-upload-url"],
        headers={
            "X-Goog-Upload-Command": "upload, finalize",
            "X-Goog-Upload-Offset": "0",
            "Content-Length": str(size),
        },
        data=path.read_bytes(),
        timeout=600,
    )
    r2.raise_for_status()
    return r2.json()["file"]


def wait_active(f: dict) -> dict:
    for _ in range(60):
        st = requests.get(f"{BASE}/v1beta/{f['name']}?key={KEY}", timeout=30).json()
        if st.get("state") == "ACTIVE":
            return st
        time.sleep(4)
    raise RuntimeError(f"file never became ACTIVE: {f.get('name')}")


def prompt(lang: str) -> str:
    return (
        f"Transcreva este áudio VERBATIM em {lang}, sem resumir e sem corrigir ideias.\n"
        "Formato: uma linha por bloco de fala, iniciando com timestamp aproximado "
        "[MM:SS] relativo ao início do áudio.\n"
        "Identifique os falantes (ex.: APRESENTADOR: / CONVIDADO:) quando for possível.\n"
        "Nomes de ferramentas, números, métricas e valores exatamente como foram ditos.\n"
        "Responda apenas a transcrição, sem comentários."
    )


def generate(uri: str, mime: str, lang: str, model: str) -> str | None:
    body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"file_data": {"mime_type": mime, "file_uri": uri}},
                    {"text": prompt(lang)},
                ],
            }
        ],
        "generationConfig": {"temperature": 0, "maxOutputTokens": 60000},
    }
    chain = [model] + [m for m in MODEL_CHAIN if m != model]
    for m in chain:
        for attempt in range(5):
            r = requests.post(
                f"{BASE}/v1beta/models/{m}:generateContent?key={KEY}",
                json=body,
                timeout=900,
            )
            if r.status_code == 200:
                d = r.json()
                cand = (d.get("candidates") or [{}])[0]
                text = "".join(
                    p.get("text", "")
                    for c in d.get("candidates", [])
                    for p in c.get("content", {}).get("parts", [])
                )
                # STOP with empty text is a transient failure, not an empty transcript.
                if text.strip():
                    print(f"  ok via {m} ({cand.get('finishReason')}), {len(text)} chars", flush=True)
                    return text
                print(f"  empty body from {m}, retrying", flush=True)
            else:
                print(f"  {m} -> {r.status_code}, retry {attempt + 1}", flush=True)
                if r.status_code == 404:
                    print(f"  body: {r.text[:300]}", flush=True)
                    break  # retired model id, move to next in chain
            time.sleep(15)
    return None


def transcribe(path: Path, outdir: Path, model: str, lang: str) -> bool:
    out = outdir / (path.stem + ".txt")
    if out.exists() and out.stat().st_size > 0:
        print(f"skip {path.name} (already transcribed)", flush=True)
        return True
    print(f"upload {path.name} ({path.stat().st_size / 1e6:.1f} MB)", flush=True)
    f = wait_active(upload(path))
    text = generate(f["uri"], f.get("mimeType", "audio/mp3"), lang, model)
    if not text:
        print(f"FAILED {path.name}", flush=True)
        return False
    out.write_text(text)
    return True


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("source", help="audio file or directory of segments")
    ap.add_argument("outdir")
    ap.add_argument("--model", default="gemini-flash-latest")
    ap.add_argument("--lang", default="português brasileiro")
    args = ap.parse_args()

    src = Path(args.source)
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    files = sorted(src.glob("*.mp3")) if src.is_dir() else [src]
    if not files:
        sys.exit(f"no mp3 files under {src}")

    results = [transcribe(p, outdir, args.model, args.lang) for p in files]
    print(f"done: {sum(results)}/{len(results)} transcritos em {outdir}")
    return 0 if all(results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
