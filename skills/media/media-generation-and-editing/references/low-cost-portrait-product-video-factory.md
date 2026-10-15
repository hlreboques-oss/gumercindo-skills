# Low-cost portrait/product video factory

Use when Carlos wants a low-cost workflow where a client portrait is animated using a reference/trending video motion/emotion and combined with a product/script into a short marketing clip.

## Recommended architecture

Start with a two-stage MVP:

1. **Validation path (fast):** test 2–3 clips on hosted models/APIs before building infrastructure. Use Replicate/HuggingFace Spaces or vendor APIs to compare quality quickly.
2. **Scale path (cheap):** self-host an open-source workflow on rented GPU (RunPod or similar) with a simple UI/queue.

## Core model options

- **LivePortrait** — portrait + driving/reference video -> facial expression/head-motion reenactment. Good for “use this hyped video emotion/movement with my client’s face.” Repo: `KlingAIResearch/LivePortrait`.
- **MuseTalk** — generated/input video + audio -> lip sync. README notes commercial-friendly code/model terms; low VRAM mode exists, but quality/speed depend heavily on GPU. Repo: `TMElyralab/MuseTalk`.
- **LatentSync** — higher-quality lip sync option but often needs more VRAM; better for quality tests than cheapest MVP. Repo: `bytedance/LatentSync`.
- **SadTalker/EchoMimic** — alternatives for audio-driven talking portraits; test if LivePortrait+MuseTalk quality is insufficient.
- **FFmpeg** — product overlay, split-screen, captions, CTA, vertical crop, music, final packaging.

## UI / automation pattern

Build the “quadradinho entra, vídeo sai” interface with one of:

- **Gradio** for the fastest local web UI.
- **ComfyUI** when visual node workflows and reusable templates matter.
- **n8n + ComfyUI/RunPod API** when Carlos wants queueing, client intake, approval, status, and later publishing.

Suggested form fields:

- Client face/photo or approved avatar reference.
- Driving/reference video for expression/motion.
- Product image/video and offer/CTA text.
- Script or audio voiceover.
- Output preset: Reels/TikTok 9:16, duration, caption style.

## Cost framing

Use these as sanity checks, not fixed quotes:

- Premium video APIs can be dollars per finished clip when billed per output second; they are useful for first-quality benchmarks but can eat margin.
- Self-hosted rented GPU can push cost down to cents per clip once batched. Estimate cost from: `GPU hourly price / successful videos per hour`, then add allowance for failed generations, storage, and manual QA.
- For package pricing, budget conservatively with retries; do not promise per-video cost based on perfect throughput.

## Rights and safety

When the user says “pegar vídeo hypado da internet,” treat it as **motion/emotion reference**, not permission to impersonate or reuse a third party’s likeness/voice/brand. For client work:

- Prefer client-provided/owned reference videos, licensed stock, or non-identifiable motion references.
- Get explicit consent to use the client’s face/voice/product images.
- Avoid claiming a real-person endorsement unless the person approved the exact video.

## Verification before delivery

- Probe final MP4 with `ffprobe` for duration, resolution, streams, and codec.
- Inspect at least one frame/contact sheet for face artifacts, product visibility, captions, and CTA cropping.
- Track model/settings per approved output so a batch can reproduce the same look.
