# KasmVNC SaaS OTP handoff

Use this when a SaaS login needs a one-time code and the secure code prompt is unavailable.

## Flow

1. Open the SaaS login inside the agent-controlled browser first. If the site accepts email OTP, fill the account email and request the code.
2. Treat the OTP as a credential. Never ask Carlos to paste or say the code in Telegram/chat.
3. If `browser_vault_enter_code` cannot prompt for the code, hand Carlos the KasmVNC desktop instead:
   - verify `kasmvnc.service` is active and `http://100.105.134.116:6901` returns Basic Auth / `401`;
   - expose a short-lived route only if the private Tailscale route is unreachable;
   - deliver KasmVNC credentials by MEDIA file, never chat text;
   - open the SaaS login page in Chrome on display `:1` with `google-chrome --no-sandbox --test-type --no-first-run --password-store=basic <url>`;
   - have Carlos type the OTP directly into the remote screen.
4. After Carlos says he is in, verify from the same controlled session with a screenshot/page title/dashboard text before operating the SaaS.
5. Kill temporary public tunnels after the login handoff.

## Aros note

Aros uses `/login/pt` with a six-digit email one-time code. Fill the account email, click `Enviar código`, then route the code entry through the secure prompt or KasmVNC handoff. Do not receive the Aros code in chat.
