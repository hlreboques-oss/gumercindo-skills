---
name: remote-browser-login-handoff-carlos
description: "Use when Carlos logs into Gumercindo's remote browser."
version: 1.0.0
created_by: agent
tags: [remote-browser, instagram, login, tailscale, cloudflare, selkies, carlos]
---

# Remote Browser Login Handoff — Carlos

## Trigger

Use whenever Carlos asks to connect/login to Instagram, WhatsApp, Meta, ArpChat, or another service **inside Gumercindo's/agent-visible browser**.

## Known recurring issue

Carlos repeatedly hits two blockers:

1. **Wrong/unreachable browser link**
   - Private/Tailscale links often do not open for him from Telegram/mobile.
   - Earlier attempts accidentally sent a link that opened the wrong service (e.g. MoneyPrinterTurbo) instead of the browser.
   - Public Cloudflare quick tunnels usually open, but Carlos correctly notes they are less secure.

2. **Remote keyboard/password input issue**
   - In the remote browser/Selkies page, password typing can fail, especially uppercase/capital letters.
   - Do not assume login failed because of wrong password until the keyboard mapping/case issue is ruled out.

3. **Instagram/Meta IP-reputation block (HTTP 429) from the VPS's datacenter IP**
   - Loading `instagram.com` (including `/accounts/login/` and `/direct/inbox/`) from the VPS browser can return a persistent `HTTP ERROR 429` page ("This page isn't working") that does NOT clear on reload or after waiting 30s+ — this is Meta blocking the VPS's datacenter IP range, not a transient rate limit.
   - Do not keep reloading/retrying on the VPS browser when you see this; it will not resolve itself. Switch immediately to a residential-IP path instead: operate through Carlos's own Windows notebook (see `windows-hermes-mcp-worker-operations`'s "Ad-hoc Windows GUI control over SSH" section) for any Instagram login or DM automation.
   - This is specific to the VPS's IP, not to this login-handoff flow in general — WhatsApp Web and other services may still work fine from the same VPS browser.

## Required workflow before sending Carlos any login link

1. **Do not send a Tailscale/private IP first** unless you have verified Carlos's device can reach it.
   - Avoid sending `100.x`, `10.x`, `192.168.x`, `127.x`, or `localhost` as the first link on Telegram/mobile.

2. **Verify the exact destination yourself before sending.**
   - Open the link with `browser_navigate` or `curl`.
   - Confirm the page title/content is the remote browser, not another service.
   - If using Selkies/linuxserver browser, expected title may be like `Automacao WhatsApp Instagram` or the configured browser title.
   - If it opens MoneyPrinterTurbo or any unrelated app, stop and fix the proxy/tunnel.

3. **Use a clean public HTTPS handoff when private access fails.**
   - Prefer a temporary Cloudflare tunnel to a local proxy that points to the correct browser container/port.
   - If the upstream browser has Basic Auth, do **not** send a `https://user:pass@...` URL and do **not** use a minimal Python HTTP proxy for Selkies: it can load HTML but break video/input because Selkies needs WebSocket upgrade support.
   - Use an nginx reverse proxy that injects the upstream Basic Auth header and preserves WebSocket upgrade headers, then expose nginx with Cloudflare:
     ```nginx
     map $http_upgrade $connection_upgrade { default upgrade; '' close; }
     server {
       listen 127.0.0.1:18011;
       location / {
         proxy_pass http://100.105.134.116:3010;
         proxy_http_version 1.1;
         proxy_set_header Host 100.105.134.116:3010;
         proxy_set_header Authorization "Basic <base64-user-pass>";
         proxy_set_header X-Forwarded-Proto https;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection $connection_upgrade;
         proxy_read_timeout 3600s;
         proxy_send_timeout 3600s;
         proxy_buffering off;
       }
     }
     ```
     Commands used live: `nginx -t -c /tmp/selkies_nginx.conf && nginx -c /tmp/selkies_nginx.conf -p /tmp/selkies_nginx_run/`, then `cloudflared tunnel --url http://127.0.0.1:18011`.
   - Test the public URL from the agent side and confirm `HTTP 200` plus expected title before sending it. For Selkies, title should match the browser container title, e.g. `Automacao WhatsApp Instagram`, and the page should expose buttons like `Enable/Disable Video Stream`.

4. **Prepare the browser before Carlos logs in.**
   - Use CDP/container access to navigate the agent-visible browser tab to the target login page (`instagram.com`, `business.facebook.com`, etc.).
   - Close or move away unrelated tabs if they confuse the handoff.
   - Re-check active tabs and page title.

5. **Give Carlos short instructions only.**
   - Open link.
   - Click/tap into the remote browser.
   - Login manually.
   - If password typing fails, stop and report; do not keep retrying.
   - Then say `logado`.

## Keyboard/password mitigation

If Carlos says uppercase/capital letters are not accepted or password typing fails:

1. Do not ask him to send the password.
2. Try Selkies clipboard panel/paste route if available:
   - Ask Carlos to paste/type the password into the remote clipboard himself only if the clipboard stays local to his browser session.
   - Never ask him to paste the password into Telegram/chat.
3. If clipboard is unreliable, try switching the remote browser input mode/gaming mode off, or open a simpler noVNC/Selenium viewer if available.
4. If still blocked, abandon the remote-browser login and use an official OAuth/Composio login link or a token handoff flow that does not require typing a password into Selkies.
5. Never type or store Carlos's password/2FA/recovery codes.

## Verification before claiming success

After Carlos says `logado`:

1. Verify the agent-visible browser session via CDP/screenshot/page text.
2. Confirm the correct account username/profile is logged in.
3. Run a harmless authenticated read if an API/tool route exists.
4. Only then proceed with social actions, posting, WhatsApp operations, or account changes.

## Safety notes

- Public Cloudflare quick tunnels are temporary and less secure than Tailscale. Use only for short login handoffs and close/kill the tunnel when done.
- Do not leave unnecessary public tunnels running after the handoff.
- Stop immediately on Instagram/Meta checkpoint, suspicious-login, 2FA, password prompt, or security warning; Carlos must handle secrets manually.
