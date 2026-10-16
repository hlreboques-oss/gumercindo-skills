---
name: vps-remote-desktop-operations
description: "Use when adding a VNC desktop on the VPS tailnet."
version: 1.0.0
author: Gumercindo
license: MIT
platforms: [linux]
metadata:
  hermes:
    tags: [kasmvnc, vnc, xfce, tailscale, remote-desktop, vps, xdotool]
    related_skills: [remote-browser-login-handoff-carlos, self-hosted-docker-app-operations]
---

# VPS remote desktop operations

## When to use

Carlos asks for a graphical desktop on the server -- "instala kasm vnc", "quero uma tela do servidor", "coloca um desktop e liga no tailscale", or he needs a real browser running *inside* the VPS instead of the containerised remote browser.

This is not the remote browser handoff (one browser in a container): it is a full X desktop, a session that must survive reboots, and a network surface that must not be public.

Also use this skill (the "reach Carlos's own device" section below) when Carlos asks to access or control HIS OWN computer/laptop that is already joined to the tailnet — that is a different target than the VPS desktop above, but the same VNC/noVNC toolchain applies.

## Reaching Carlos's own already-tailscaled computer (not a VPS desktop)

When Carlos wants you to operate his personal PC and it already shows up in `tailscale status` (confirm with `tailscale ping -c 2 <ip>`), do not assume RDP: **Windows Home has no "Enable Remote Desktop" settings page, only the Remote Desktop Connection client** (`mstsc`) to connect OUT to something else. Searching "área de trabalho remota"/"remote desktop" on a Home edition only opens that client, never a toggle to receive connections — don't keep sending him back to Settings; diagnose the edition first (if `nc -zv <ip> 3389` times out, suspect Home before suspecting a misconfigured toggle) and move straight to the VNC alternative:

1. Have Carlos install a VNC **server** on his machine himself (e.g. TightVNC) and set the VNC password in its installer himself; never ask him to paste that password into chat, and you cannot store it in the browser-origin-bound password vault (`browser_vault_*`) because it is not a web login.
2. Verify the server is reachable over the tailnet: `nc -zv -w3 <tailscale-ip> 5900`.
3. On the VPS, bridge VNC to a browser-viewable page with noVNC + websockify (no separate X server needed here, this is relaying to his remote machine, not hosting a desktop):
   ```bash
   pip install websockify
   git clone --depth 1 https://github.com/novnc/noVNC.git /tmp/novnc
   # the proxy launcher is bash despite no .sh suffix; run it with bash explicitly
   bash /tmp/novnc/utils/novnc_proxy --vnc <tailscale-ip>:5900 --listen <local-port> --web /tmp/novnc &
   curl -sSI http://127.0.0.1:<local-port>/vnc.html   # expect 200
   ```
4. Publish `<local-port>` for Carlos to reach from any device (phone or desktop, not just inside the tailnet) using the same nginx+cloudflared quick-tunnel handoff pattern as `remote-browser-login-handoff-carlos` (verify the public URL yourself with `curl -sSI` before sending it, and close/kill the tunnel once the session is done).
5. When he hits the VNC password prompt in the noVNC page, tell him to type it there himself; never relay the password through chat in either direction.
6. **Never let him open the noVNC viewer link on the same machine being controlled.** If he does, the remote screen shows that machine's own browser tab recursively inside itself (an infinite mirror of windows-in-windows) and the session is unusable — always send the link for him to open on a *different* device (phone while the PC is the target, or vice versa).
7. **A stock VNC server only accepts one active viewer**; a second connection (yours and his, or a reconnect) silently kicks the first one, which looks like random drops. Before you and Carlos try to view at once, open noVNC's settings (gear icon, bottom-left) and enable **Shared Mode** so both connections can stay up.
8. **Free `cloudflared tunnel --url` quick tunnels expire/drop on their own** (not a client-side bug) — launch with `--retries 999`, and if the page starts showing "Failed to connect"/blank after working before, kill and relaunch the tunnel for a fresh URL rather than debugging the old one.

## Bypass a broken remote keyboard via CDP (containerised browser targets)

When the target is a **containerised browser** (Selkies/noVNC automation container, not a full VPS desktop) and its virtual keyboard rejects `@`, uppercase, or other characters, do not fight the keyboard and do not rely on clipboard paste (unvalidated, fragile). Instead fill every non-secret field directly through Chrome DevTools Protocol, bypassing the virtual keyboard entirely:

1. From inside the container (`docker exec <container> python3 ...`), list tabs at `http://127.0.0.1:9222/json/list` and grab the target tab's `webSocketDebuggerUrl`.
2. Open a raw websocket to that URL (stdlib `socket` + a hand-rolled WS handshake/frame if the `websockets` package errors out inside the container) and send a `Runtime.evaluate` call.
3. In the evaluated JS, find the *visible* input (`el.offsetWidth || el.offsetHeight || el.getClientRects().length`), set its value with the native property setter (`Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set`), then dispatch `input` and `change` events so the page's framework picks up the change.
   - **When several inputs/textareas match the same tag+visibility filter, do not fill index `[0]` blind.** A page with a floating chat/Copilot widget puts that widget's textarea earlier in DOM order than the real form field you want, so a blind `[0]` fill silently types into the wrong box (the real field then still shows a validation error like "enter at least N characters"). Dump `{value, placeholder, rect}` for every match first, confirm which one is the target by its placeholder/position, then fill that specific index — and clear any wrong box you touched on the retry.
4. This writes real values containing `@`, uppercase, accents — none of it passes through the virtual keyboard, so the keyboard bug is irrelevant. Only hand off to the human for the one field that is genuinely secret (password/2FA); have them type that directly in the live remote screen, using only lowercase+digits if the keyboard bug is confirmed to affect case/symbols.
5. If the task doesn't require the human to watch live at all (e.g. creating a throwaway test account), skip the shared remote screen entirely and drive the real site from the agent's own normal browser session instead — no keyboard bug, no tunnel-stability problem.

### Opening a fresh tab through the CDP HTTP endpoint

To point the container's browser at a new URL without disturbing whatever tab is already on screen (e.g. the one Carlos is watching live), use the CDP HTTP control plane instead of navigating in place: `PUT http://127.0.0.1:9222/json/new?<url-encoded-target-url>` returns the new tab's id, then `PUT http://127.0.0.1:9222/json/activate/<id>` brings it to front. List existing tabs first with `GET /json/list` and filter by URL substring — reuse a matching tab instead of opening a duplicate if one already exists for the target site.

### Clicking buttons reliably through raw CDP (not just filling inputs)

The same `Runtime.evaluate` + `Input.dispatchMouseEvent`/`dispatchKeyEvent` approach above also drives clicks and keyboard shortcuts, but four failure modes are easy to miss:

- **A dialog/modal that is clearly visible on screen can be completely absent from `document.body.innerHTML` and from any `document.querySelectorAll` search.** Some sites render confirmation dialogs through a mechanism that light-DOM queries don't reach. When a leaf-text search for a button you can see in the screenshot returns nothing (and the site isn't an iframe-based widget), stop searching the DOM and fall back to clicking the screenshot's own pixel coordinates — first confirm `window.devicePixelRatio` is `1` and `document.documentElement.clientWidth/clientHeight` match the screenshot's dimensions, then the screenshot pixel coordinates map 1:1 to `Input.dispatchMouseEvent` coordinates.

- **A coordinate click below the current scroll position silently does nothing.** `Input.dispatchMouseEvent` coordinates are viewport-relative; a button whose `getBoundingClientRect()` is below `window.innerHeight` is outside the clickable area even though it has valid coordinates. Always `element.scrollIntoView({block:'center'})` (or compute the needed `scrollBy` first) and re-read the rect *after* scrolling, then click — never click at a y-coordinate you only know from a dump taken before scrolling.
- **Label text often lives on a leaf span two levels inside the `<button>`, not on the button's own `textContent.trim()` in a simple way some sites style around.** When `Array.from(document.querySelectorAll('button')).filter(b => b.textContent.trim()===X)` returns nothing or the wrong element, search ALL elements for a true leaf node instead: `Array.from(document.querySelectorAll('*')).filter(el => el.children.length===0 && el.textContent.trim()===X)`, then click that leaf's own `getBoundingClientRect()` center — the click still bubbles up to the real button handler, so you don't need to find the `<button>` ancestor at all.
- **`Input.dispatchKeyEvent` modifier bitmask: Ctrl is `2`, not `4`.** `4` is Meta/Cmd, which does nothing on a Linux Chrome target, so a "select all" (Ctrl+A) built with `modifiers: 4` silently fails and a careless script can end up inserting new text into a non-empty field, mangling it. Use `modifiers: 2` for Ctrl+<key> shortcuts, and verify the field's content with a screenshot or an `el.value`/`el.innerText` read immediately after the clear step, before typing the real text.

## Non-negotiables

1. **Bind the desktop to the Tailscale IP, never `0.0.0.0`.** A desktop running as root, reachable on the VPS's public interface, is the highest-risk artifact available here. `interface: <tailscale-ip>` in `kasmvnc.yaml` keeps it inside WireGuard and still reachable from the host itself. Nothing is lost: the tailnet is the tunnel he asked for. If the tailnet IP ever changes, edit that one line and restart the unit.
2. **Check swap before adding a desktop to a shared box.** These VPSes also run client n8n; a desktop plus Chrome on a swap-less machine invites the OOM killer into client services. Create a 2 GB swapfile with an fstab entry *before* installing the desktop, and mention it in the handoff.
3. **Prove it with the X server, not with HTTP alone.** A listening port and a 401 only prove the web layer. The desktop is proven by grabbing the X display and by listing the session's clients -- and by sending him the screenshot.
4. **Report where the password lives, never the password.** Generate a random one, write it to a root-only secrets file, tell him the path, and offer to let him set his own. Never paste a credential into chat.
5. **State what the desktop does not include.** No browser by default, no clipboard over plain http, root-owned session. He should not discover the limits after inviting someone to use it.

## Install and configure

1. **Recon first**: `. /etc/os-release` (codename), `free -m`, `nproc`, `df -h /`, `dpkg -l | grep -iE 'vnc|xfce'`, `tailscale ip -4`, `ss -ltn | grep -E ':(6901|8443|7900)'` (pick a free port; 6901 is KasmVNC's default).
2. **Swap**, if absent: `fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile`, plus `/swapfile none swap sw 0 0` in `/etc/fstab`.
3. **Pick the KasmVNC package by closest distro.** Releases ship per-distro debs (`noble`, `jammy`, `bookworm`, `trixie`...). A newer Ubuntu than any package listed still installs the closest LTS deb; let apt resolve deps instead of using `dpkg -i`. Fetch the asset URL from the GitHub release API and install with `DEBIAN_FRONTEND=noninteractive apt-get install -y /root/kasmvncserver_<distro>_<ver>_amd64.deb`.
4. **Desktop environment**: `xfce4 xfce4-terminal dbus-x11` in the same apt command. XFCE runs comfortably in ~125 MB and gives him a panel, terminal and file manager.
5. **Config**: see `templates/kasmvnc.yaml`. Write it to `/etc/kasmvnc/kasmvnc.yaml` **and** `~/.vnc/kasmvnc.yaml` (the per-user copy is what the session reads). The `write_file` tool refuses `/etc`, so stage the file in `/tmp` and `install -m 644 /tmp/kasmvnc.yaml /etc/kasmvnc/kasmvnc.yaml`.
6. **Session script**: `~/.vnc/xstartup`, mode 755 -- see `templates/xstartup-kasmvnc`. KasmVNC ships no `~/.vnc/xstartup` until you create it.
7. **Password**: `SENHA=$(openssl rand -base64 12 | tr -d '/+=' | cut -c1-14); printf '%s\n%s\n' "$SENHA" "$SENHA" | vncpasswd -u root -w`. KasmVNC writes `~/.kasmpasswd`; `~/.vnc/passwd` stays an 8-byte stub, which is expected. Store the password in `~/.secrets/kasmvnc.env` with mode 600.
8. **Start**: `vncserver :1 -select-de manual -geometry 1600x900 -depth 24 -desktop "VPS | Carlos"`.
9. **Service**: see `templates/kasmvnc.service` (`Type=forking`, `ExecStartPre=-... -kill :1`, `ExecStop=... -kill :1`), then `systemctl daemon-reload && systemctl enable --now kasmvnc.service`.

## Verify (all four, in this order)

```bash
ss -ltn | grep 6901                                    # escuta no IP do tailscale, nao em 0.0.0.0
curl -s -o /dev/null -w '%{http_code}\n' http://<ip>:6901/                       # 401 sem credencial
. ~/.secrets/kasmvnc.env; curl -s -o /dev/null -w '%{http_code}\n' -u "$KASMVNC_USER:$KASMVNC_PASSWORD" http://<ip>:6901/   # 200 com credencial
DISPLAY=:1 XAUTHORITY=/root/.Xauthority ffmpeg -hide_banner -loglevel error -f x11grab -i :1 -frames:v 1 -y /root/desktop.png
DISPLAY=:1 XAUTHORITY=/root/.Xauthority xlsclients | sort -u   # xfce4-session, xfwm4, xfce4-panel...
```

Then look at the PNG with vision and send it. 401-without / 200-with is the auth proof; the screenshot plus `xlsclients` is the desktop proof.

## Browser inside the desktop

- Ubuntu's `chromium` is a **snap stub** and does nothing on a VPS. Install Google's official `.deb`: `curl -sL -o /root/google-chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && apt-get install -y /root/google-chrome.deb`.
- **Chrome refuses to start as root without `--no-sandbox`** -- the menu icon then silently does nothing. Patch every `Exec=` line of `/usr/share/applications/google-chrome.desktop` to `... --no-sandbox --password-store=basic`, and copy the file to `~/.local/share/applications/`.
- **First run blocks on dialogs** ("Additional Terms of Service", then "Welcome to Chrome"). Drive them with `xdotool` (`apt-get install -y xdotool`): enumerate windows, activate, then press **Return on the default button**.
- Launch long-lived GUI apps through the terminal tool's `background=true`; a shell `setsid ... &` is rejected by the harness.
- Tell him **not to sign a personal Google account into a server desktop** (it syncs passwords and history); offer a separate profile for social logins instead.

## Handoff

- URL: `http://<host>.<tailnet>.ts.net:6901` (MagicDNS) or `http://<tailnet-ip>:6901`; confirm the name resolves with `getent hosts <host>.<tailnet>.ts.net`.
- User `root`; password path as above.
- http is acceptable because WireGuard already encrypts the hop; browsers only expose full clipboard in a secure context, so offer KasmVNC's own TLS (certificate warning) as a follow-up instead of promising clipboard on day one.
- Say what the box can take: 2 vCPU / ~7.9 GB with n8n co-located means a desktop plus Chrome leaves little headroom, and more RAM is the real fix if he wants a workstation.

## Pitfalls

- **Bare `vncserver :1` stops on an interactive desktop-environment prompt** and dies with `Failed to execute /usr/lib/kasmvncserver/select-de.sh`. Always pass `-select-de manual` so `~/.vnc/xstartup` (and therefore XFCE) is used non-interactively.
- **A system-level `systemctl list-units | grep kasm` shows nothing before the unit exists** under `/etc/systemd/system/`; do not conclude the install failed.
- **Clicking a dialog by coordinates on an unfocused window does not work.** Activate the window first (`xdotool windowactivate --sync <id>`), and prefer Return on the default button; verify the dialog closed by re-enumerating windows rather than trusting the click.
- **Writing to `/etc`, touching systemd, or generating a credential triggers an approval prompt.** If it times out the command did **not** run: stop and ask, never rephrase to slip past the filter. Batch those steps into one clearly-labelled command and tell him a prompt is coming.
- **A screenshot that looks unchanged after an action** may be the *old* file: write each capture to a new filename and check its mtime before judging the result.
