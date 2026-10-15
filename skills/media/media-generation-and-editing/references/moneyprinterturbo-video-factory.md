# MoneyPrinterTurbo Video Factory Pattern

Use this reference when Carlos Júnior wants a low-cost short-video factory that runs independently from the main Gumercindo/Hermes conversation.

## Architecture

Recommended MVP:

```text
Dedicated Telegram group
→ dedicated lightweight Telegram bot or n8n workflow
→ local script/API call
→ MoneyPrinterTurbo API
→ optional FFmpeg post-processing
→ MP4 returned to the same group for approval
```

Keep this separate from the main Hermes Telegram bot when the user wants to avoid spending main-assistant tokens. A dedicated bot can poll Telegram, parse commands such as `GERAR: ...`, run local scripts, and send video files back without invoking the Hermes LLM.

## MoneyPrinterTurbo setup notes

- Run MoneyPrinterTurbo as the rendering engine, preferably via Docker.
- Persist the whole app under one migratable directory such as `/opt/moneyprinterturbo`.
- Keep these files/directories together for migration:
  - `docker-compose.yml`
  - `config.toml`
  - `storage/`
  - custom factory scripts/templates
- Use non-conflicting host ports if the VPS already has services on 8080/8501, e.g. `127.0.0.1:18080->8080` and `127.0.0.1:18501->8501`.
- If n8n is on the same Docker host, connect it to the MoneyPrinterTurbo network and call `http://moneyprinterturbo-api:8080/api/v1`.

## Useful API endpoints

- `POST /api/v1/videos` — create video task.
- `GET /api/v1/tasks/{task_id}` — poll progress/status.
- Returned `videos[]` URLs under `/tasks/.../final-1.mp4` map to files under the persisted `storage/tasks/` directory.

## Low-cost operation modes

1. **Script-ready mode:** user supplies full script; no LLM needed for script generation.
2. **Template mode:** use fixed hooks/CTA structures and interpolate the user’s topic.
3. **Smart mode:** call LLM for better scripts during calibration; later convert winning patterns into templates to cut cost.

## Visual quality upgrades

MoneyPrinterTurbo can generate the base video: narration, captions, stock/local footage, and music. For more premium outputs, post-process with FFmpeg:

- split-screen layouts;
- reaction video window using Carlos’s own clip;
- image/print panel plus generated video panel;
- branded side panel;
- zoom/crop/pan;
- whoosh/pop/riser SFX between sections;
- intro/outro CTA.

Pattern:

```text
MoneyPrinterTurbo base MP4
→ FFmpeg layout/effects pass
→ verified final MP4
→ approval group
```

## Migration pattern

Do not rebuild from scratch if the VPS changes. Archive and restore the persistent directory:

```bash
cd /opt
sudo tar -czf /root/moneyprinterturbo-backup-$(date +%F).tar.gz moneyprinterturbo
# On new VPS:
sudo tar -xzf moneyprinterturbo-backup-YYYY-MM-DD.tar.gz -C /opt
cd /opt/moneyprinterturbo
docker compose up -d
```

Then reconnect n8n or the Telegram bot as needed.

## Pitfalls

- Do not use the main Hermes/Gumercindo bot for the automated video factory if the user’s goal is avoiding main assistant token usage. Use a dedicated bot or n8n-triggered workflow.
- Do not enable fully automatic posting at first. Start with generation → group approval → manual/semi-automatic posting while quality is being calibrated.
- Avoid hard-coding secrets in scripts; keep Telegram/LLM/media API keys in `.env` or config files.
- Keep generated artifacts verified with `ffprobe` or a file stat before saying the video was created.
