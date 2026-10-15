#!/usr/bin/env python
"""PT-BR transcription with timestamps (faster-whisper).

Usage:
    /usr/local/lib/hermes-agent/venv/bin/python transcribe_ptbr.py <video|audio> <out.json> [model]

The interpreter matters: faster-whisper needs an `av` build it can call, and the `python3` first on
PATH can carry a newer av that raises
`TypeError: open() got an unexpected keyword argument 'metadata_errors'`. The Hermes venv is the
environment whose av matches, so run this script with it.

Run it from the job workspace (~/.hermes/workspace/<job>/), never from the scratch cache: scratch is
pruned after 24h and the script disappears mid-job. The JSON sidecar is the caption source *and* the
cut plan for the edit.
"""

import json
import sys

from faster_whisper import WhisperModel


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    src, out = sys.argv[1], sys.argv[2]
    model_size = sys.argv[3] if len(sys.argv) > 3 else "small"

    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, _info = model.transcribe(
        src,
        language="pt",
        vad_filter=True,
        beam_size=5,
        condition_on_previous_text=False,
    )

    rows = []
    for seg in segments:
        text = seg.text.strip()
        rows.append({"start": round(seg.start, 2), "end": round(seg.end, 2), "text": text})
        print(f"[{seg.start:7.2f} - {seg.end:7.2f}] {text}", flush=True)

    with open(out, "w", encoding="utf-8") as fh:
        json.dump(rows, fh, ensure_ascii=False, indent=1)
    print(f"SEGMENTS: {len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
