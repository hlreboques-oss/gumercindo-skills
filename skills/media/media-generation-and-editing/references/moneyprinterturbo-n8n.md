# MoneyPrinterTurbo + n8n video factory

Use when Carlos Júnior wants a low-cost, self-hosted engine for serial short-video generation.

## What the repo provides

MoneyPrinterTurbo can generate short videos from a subject or script: script/terms, stock or local materials, TTS narration, subtitles, background music, and final MP4. It exposes:

- WebUI: Streamlit, default container port `8501`.
- API: FastAPI, default container port `8080`.
- CLI: `python cli.py --video-subject "..."`.
- Docker release image: `ghcr.io/harry0703/moneyprinterturbo:latest`.

Important API prefix is `/api/v1`, not `/videos` at root.

Primary endpoints:

- `POST /api/v1/videos` — create video task; returns `data.task_id`.
- `GET /api/v1/tasks/{task_id}` — poll status/progress; at `progress: 100`, output links appear in `videos` and/or `combined_videos`.
- `POST /api/v1/video_materials` — upload local material.
- `GET /api/v1/video_materials` — list local materials.
- `POST /api/v1/musics` — upload BGM.

## Recommended architecture

Do not put video rendering inside n8n. Use n8n as orchestrator and MoneyPrinterTurbo as the render engine:

```text
Google Sheets / form / Telegram request
  -> n8n
  -> MoneyPrinterTurbo API
  -> poll task status
  -> save video to Drive/local/S3
  -> send to Telegram for approval
  -> optionally publish after approval
```

For Carlos Júnior, start with semi-automation: generate -> Telegram approval -> publish manually or via later automation. Avoid fully automatic posting until voice, subtitles, CTA, and visual style are calibrated.

## Minimal Docker pattern

Use a persistent app directory so migration is simple:

```yaml
x-common-volumes: &common-volumes
  - ./config.toml:/MoneyPrinterTurbo/config.toml
  - ./storage:/MoneyPrinterTurbo/storage

services:
  webui:
    image: ghcr.io/harry0703/moneyprinterturbo:latest
    ports:
      - "127.0.0.1:18501:8501"
    command: ["streamlit", "run", "./webui/Main.py", "--server.address=0.0.0.0", "--server.port=8501", "--browser.gatherUsageStats=False", "--server.showEmailPrompt=False"]
    volumes: *common-volumes
    restart: unless-stopped

  api:
    image: ghcr.io/harry0703/moneyprinterturbo:latest
    ports:
      - "127.0.0.1:18080:8080"
    command: ["python3", "main.py"]
    volumes: *common-volumes
    restart: unless-stopped
```

If n8n is a Docker container on the same host, connect it to MoneyPrinterTurbo's network and call by service name:

```bash
docker network connect moneyprinterturbo_default n8n-instagram || true
```

n8n base URL:

```text
http://moneyprinterturbo-api:8080/api/v1
```

## Configuration notes

In `config.toml`, configure at least:

- `llm_provider` and matching API key/model, or use a no-key provider only for demos.
- `pexels_api_keys`, `pixabay_api_keys`, or `coverr_api_keys` for stock materials.
- `subtitle_provider = "edge"` for simple fast subtitle timing.
- `max_concurrent_tasks = 1` or `2` on small VPSes.
- `endpoint` if returned links need to be externally reachable; otherwise local links may point at `127.0.0.1`.

Edge TTS is the default free voice route; higher-quality voice can be added later.

## Known-good local-material payload

Useful for proving the engine works before stock/LLM credentials are ready:

```json
{
  "video_subject": "Funcionário de IA para empresários",
  "video_script": "Você não precisa contratar mais gente para responder clientes, lembrar reuniões e fazer follow-up. Um funcionário de IA pode cuidar das tarefas repetitivas enquanto você foca em vender, atender melhor e ganhar tempo. Comece pequeno: uma dor, um processo, uma automação funcionando.",
  "video_language": "pt-BR",
  "video_aspect": "9:16",
  "video_source": "local",
  "video_materials": [
    {"provider":"local", "url":"demo1.mp4", "duration":0},
    {"provider":"local", "url":"demo2.mp4", "duration":0},
    {"provider":"local", "url":"demo3.mp4", "duration":0},
    {"provider":"local", "url":"demo4.mp4", "duration":0}
  ],
  "video_count": 1,
  "video_clip_duration": 4,
  "video_concat_mode": "sequential",
  "video_transition_mode": "FadeIn",
  "voice_name": "pt-BR-FranciscaNeural-Female",
  "voice_rate": 0.95,
  "bgm_type": "",
  "subtitle_enabled": true,
  "subtitle_position": "bottom",
  "font_size": 64,
  "text_fore_color": "#FFFFFF",
  "stroke_color": "#000000",
  "stroke_width": 2
}
```

## Migration checklist

If installed under `/opt/moneyprinterturbo`, migration is just copying that directory:

```bash
cd /opt
sudo tar -czf /root/moneyprinterturbo-backup-$(date +%F).tar.gz moneyprinterturbo
# copy tarball to new VPS
sudo mkdir -p /opt
sudo tar -xzf moneyprinterturbo-backup-YYYY-MM-DD.tar.gz -C /opt
cd /opt/moneyprinterturbo
docker compose up -d
```

Verify:

```bash
curl http://127.0.0.1:18080/docs
curl http://127.0.0.1:18501
```

Then reconnect n8n to the Docker network if needed.

## Pitfalls

- The API route prefix is `/api/v1`; `POST /videos` returns `Method Not Allowed` because `/videos` is not at root.
- Keep ports bound to `127.0.0.1` unless there is a reverse proxy/auth layer; this app's routers are not authenticated by default in the inspected repo.
- On small VPSes, avoid high concurrency; video rendering is CPU/RAM heavy.
- First prove the render path with local materials and a fixed script before debugging stock providers, LLM keys, or n8n orchestration.
