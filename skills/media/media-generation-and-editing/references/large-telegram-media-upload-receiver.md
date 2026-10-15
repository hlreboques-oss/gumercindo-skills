# Large Telegram media blocked → temporary VPS upload receiver

Use this when Carlos needs Gumercindo to transcribe or process a phone video/audio but Telegram rejects the upload with a size/verification limit (for example “Maximum: 20 MB”), and Carlos wants Gumercindo to handle the process instead of giving him many manual steps.

## Pattern

1. **Explain the blocker briefly**: Telegram did not deliver the file to the agent; there is no local file to transcribe yet.
2. **Create a temporary upload endpoint on the VPS**:
   - a minimal Python `http.server` with an HTML multipart form is enough;
   - save uploads under a clear directory such as `/root/uploads/carlos-transcricao/`;
   - print a receipt line such as `UPLOAD_RECEIVED /path/file size` so the background process can notify.
3. **Bind privately first** to the Tailscale IP if Carlos is on the tailnet, e.g. `100.105.134.116:8765`.
4. **Verify the page loads** with a real HTTP GET before sending the link.
5. If Carlos cannot access the Tailscale link, start a **temporary Cloudflare quick tunnel** to the same local endpoint and validate the public URL loads:
   - `cloudflared tunnel --url http://100.105.134.116:8765`
   - read logs for the `https://...trycloudflare.com` URL;
   - verify the form text returns over HTTPS;
   - remind Carlos the link is temporary.
6. Keep the receiver running in the background and watch for `UPLOAD_RECEIVED`.
7. After receipt, transcribe/process the uploaded file, then stop the temporary tunnel/receiver when no longer needed.

## UX for Carlos

Send only the link and tiny steps:

```text
Abre este link:
https://...trycloudflare.com/

1. escolhe o vídeo;
2. toca em Enviar arquivo;
3. espera aparecer “Recebi o arquivo”;
4. volta aqui e manda: enviei.
```

Avoid asking him to install tools or manually move files when the whole point is that Gumercindo can provide the upload route.

## Security notes

- Use the temporary route only for the current upload.
- Do not expose tokens or credentials in the upload form/logs.
- If sensitive media is involved, prefer Tailscale/private access over a public tunnel; use the public tunnel only when Carlos cannot access the private link.
