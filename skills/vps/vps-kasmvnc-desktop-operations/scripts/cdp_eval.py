"""Minimal raw-CDP JS evaluator for a Chrome started with --remote-debugging-port.

Use this instead of xdotool pixel clicks when the remote-desktop page is a dense
single-page app (Bubble.io, React dashboards) where overlapping/invisible elements
make coordinate clicks land on the wrong node even though the screenshot looks right.

Setup:
1. Clone the already-logged-in profile so the debug Chrome keeps the session:
   cp -a /root/.config/google-chrome/. /root/.config/google-chrome-debug/
2. Launch a dedicated Chrome on the same X display with debugging enabled
   (use terminal(background=true) — 'nohup'/'&' wrappers are rejected):
   env DISPLAY=:1 XAUTHORITY=/root/.Xauthority HOME=/root /opt/google/chrome/chrome \\
     --no-sandbox --test-type --no-first-run --password-store=basic \\
     --remote-debugging-port=9222 --user-data-dir=/root/.config/google-chrome-debug '<url>'
3. Wait a few seconds, then confirm it's up: curl http://127.0.0.1:9222/json/version
   A FIRST run against a brand-new/default user-data-dir often fails silently with
   "DevTools remote debugging requires a non-default data directory" — always pass
   an explicit --user-data-dir, never omit it.

Usage: pipe a JS expression (an IIFE is easiest) on stdin; it runs via
Runtime.evaluate against the first tab whose URL matches TAB_MATCH (env var,
default: any non-devtools http(s) tab) and prints the raw result JSON.

    export TAB_MATCH=aros.com.br/dashboard
    python3 cdp_eval.py <<'JS'
    (() => Array.from(document.querySelectorAll('button,input,textarea'))
        .map(el => {const r = el.getBoundingClientRect();
          return {tag: el.tagName, text: (el.innerText||el.value||'').trim().slice(0,80),
                  rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
                  visible: !!(r.width && r.height)};})
        .filter(x => x.visible))()
    JS

Workflow: first dump elements + rects to find the right node (filter by text or
position), then evaluate a second expression that does
`el.click()` / `el.value = '...'; el.dispatchEvent(new Event('input', {bubbles:true}))`,
and finally re-read `document.body.innerText` to confirm the UI actually changed.
Simulating raw mouse events (mousedown/mouseup/click dispatched at the same
coordinates) also works when a plain `.click()` is swallowed by the framework.
"""
import base64, json, os, socket, struct, sys, urllib.parse, urllib.request


def get_ws_url():
    match = os.environ.get('TAB_MATCH')
    tabs = json.load(urllib.request.urlopen('http://127.0.0.1:9222/json'))
    for t in tabs:
        url = t.get('url', '')
        if match:
            if match in url:
                return t['webSocketDebuggerUrl']
        elif url.startswith('http') and 'devtools' not in url:
            return t['webSocketDebuggerUrl']
    raise SystemExit(f'no matching tab (TAB_MATCH={match!r}); tabs={[t.get("url") for t in tabs]}')


def ws_connect(url):
    u = urllib.parse.urlparse(url)
    host = u.hostname; port = u.port or 80; path = u.path + (('?' + u.query) if u.query else '')
    s = socket.create_connection((host, port), timeout=10)
    key = base64.b64encode(os.urandom(16)).decode()
    req = (f'GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\n'
           f'Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n')
    s.sendall(req.encode())
    resp = b''
    while b'\r\n\r\n' not in resp:
        resp += s.recv(4096)
    if b'101' not in resp.split(b'\r\n', 1)[0]:
        raise RuntimeError(resp[:500])
    return s


def send_frame(s, data):
    payload = data.encode()
    header = bytearray([0x81])
    n = len(payload)
    if n < 126:
        header.append(0x80 | n)
    elif n < 65536:
        header.append(0x80 | 126); header.extend(struct.pack('!H', n))
    else:
        header.append(0x80 | 127); header.extend(struct.pack('!Q', n))
    mask = os.urandom(4); header.extend(mask)
    masked = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    s.sendall(header + masked)


def recv_frame(s):
    b = s.recv(2)
    if not b:
        raise EOFError
    opcode = b[0] & 0xf; n = b[1] & 0x7f
    if n == 126:
        n = struct.unpack('!H', s.recv(2))[0]
    elif n == 127:
        n = struct.unpack('!Q', s.recv(8))[0]
    masked = b[1] & 0x80
    mask = s.recv(4) if masked else b''
    data = b''
    while len(data) < n:
        data += s.recv(n - len(data))
    if masked:
        data = bytes(x ^ mask[i % 4] for i, x in enumerate(data))
    if opcode == 8:
        raise EOFError('closed')
    return data.decode(errors='ignore')


class CDP:
    def __init__(self):
        self.s = ws_connect(get_ws_url()); self.i = 0

    def call(self, method, params=None):
        self.i += 1
        msg = {'id': self.i, 'method': method, 'params': params or {}}
        send_frame(self.s, json.dumps(msg))
        while True:
            r = json.loads(recv_frame(self.s))
            if r.get('id') == self.i:
                return r


def main():
    expr = sys.stdin.read()
    c = CDP()
    c.call('Runtime.enable')
    res = c.call('Runtime.evaluate', {'expression': expr, 'awaitPromise': True, 'returnByValue': True})
    print(json.dumps(res, ensure_ascii=False, indent=2)[:20000])


if __name__ == '__main__':
    main()
