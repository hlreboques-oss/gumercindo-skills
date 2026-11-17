# Getting the source file (long live / reel / YouTube URL / chat attachment)

Before any cut work, the source has to be on disk and probed. When Carlos sends a social or video URL, do not
stop at the first extractor failure — the route that works depends on who owns the media.

## Owned Instagram reels/lives — use the platform API, not scraping

When the reel or live belongs to an account Carlos manages, the connected Instagram tooling returns the
**full-length** media (a 40-60 min live, not a preview clip): list the account's media, match the `shortcode`
from the URL, then read `media_url` for that media id.

- Download that CDN URL immediately (browser `User-Agent`) and assert the result is really an MP4 (an `ftyp`
  box, non-trivial size) before probing with `ffprobe`.
- The signature is short-lived. A stored `media_url` retried later writes a tiny plain-text body
  (`URL signature mismatch`) that a careless size check reads as a successful download: re-fetch a fresh
  `media_url` right before each attempt.
- Do not assume the shortcode-decoded integer is a usable media id.

Verified shape: 432x768, ~46 min, ~190 MB per live — then proceed to frame/geometry inspection and the clip
batch workflow.

## Chat-delivered footage (Telegram) — prove it arrived

A chat send can look successful to the sender while nothing reaches the bot. Check, in this order:

1. Cache dirs by mtime — `ls -lat --time-style=full-iso ~/.hermes/cache/{videos,images,audio,documents}`.
2. The gateway log for the cache line belonging to THAT chat —
   `grep -n "Cached user video\|Cached replied-to\|Cached observed group\|Cached user document" ~/.hermes/logs/gateway.log | tail -20`
   — and the inbound line itself (`inbound message: platform=telegram user=… chat=… reply_to_id=…`). Group
   sessions are keyed per user: `agent:main:telegram:group:<chat_id>:<user_id>`, so the same group shows several
   session keys.
3. `ffprobe` plus a few extracted frames before believing a candidate file is the right material — the cache
   holds files from other chats and other weeks.

Why chat media goes missing (the mechanism, so you neither guess nor retry blindly):

- The bot downloads only what it is handed: `_max_doc_bytes` defaults to **20 MB** (2 GB only when
  `extra.base_url` points at a local Bot API server). Phone video is routinely bigger, so a quoted/replied
  attachment over 20 MB produces **no download and no log line** — the turn simply arrives with no media.
- Media in an **unmentioned** group message is ignored unless `observe_unmentioned_group_messages` is enabled
  (default false). The classic shape: the video is sent as its own message, then a text message replies to it;
  the video was never ingested and the text only carries `reply_to_id=<n>` with empty `reply_to_text`.
- Replied-to media (`_cache_replied_media`) logs on success only, so the *absence* of a "Cached replied-to"
  line is evidence, not noise. Read `reply_to_id=N` + empty `reply_to_text` as "the footage lives in the
  replied-to message" and test that first.

When it is missing, ask for the file in the same reply as the plan — never open a brief conversation instead:

- One blunt line that it did not arrive ("o vídeo não chegou") plus the reason the sender can act on: the bot
  downloads up to ~20 MB and media sent without mentioning the bot is not ingested.
- Exactly one ask: resend **mentioning the bot** or as a reply to your message; if it is over the limit, upload
  to Drive (or shorten/compress it) and send the link.
- Then restate the edit plan in bullets and the single open creative decision, so one reply unblocks everything.

Do not offer a download route you cannot actually run: without a logged-in user session on the box there is no
way to pull a group attachment that the bot never received, so the sender re-sending is the real route.

## Google Drive — direct file link before folder troubleshooting

1. Resolve the exact supplied filename or `/file/d/<FILE_ID>/view` link; a folder's public HTML listing may be incomplete, so absence from that listing is not proof that the upload is missing. If discovery cannot identify the requested file, ask for **the file's own Share → Copy link**, not another upload or the folder link again.
2. For an already shared, downloadable native video, use the file ID directly without requiring OAuth or a browser login:
   ```bash
   curl -L --fail --max-time 180 -o source.mp4 \
     'https://drive.usercontent.google.com/download?id=<FILE_ID>&export=download&confirm=t'
   ffprobe -v error -show_entries format=duration,size:stream=codec_type,width,height -of json source.mp4
   ```
   Create a project-specific directory first and retain the source filename and Drive ID in its manifest. This route was exercised on a large phone MP4; still validate every result because a permission or virus-scan page can return HTML instead of media. If the file is not shared for download, use an authorized connection or request access; do not bypass permissions.
3. Answer a duration-confirmation question from the probe, with minutes and seconds computed by a tool; do not infer duration from the filename, upload size, or the user's estimate. Also verify the original audio stream before starting the edit.
4. Keep ingestion separate from publishing: obtaining a video and permission to edit it does not authorize posting or resuming paused social automations.

## YouTube / generic URLs — extractor ladder

1. `yt-dlp -x`/`-f bestvideo+bestaudio` as usual.
2. On "Sign in to confirm you're not a bot": retry with **`-4`** (force IPv4) — the same host can pass on IPv4
   while the IPv6 range is flagged — then with alternate player clients via `--extractor-args`.
3. A remote sandbox or different egress is **not** proof of reachability: metadata (title/duration) can come
   back fine while every media URL 403s, because the signed media URL is bound to the IP that requested it.
   Test with a byte-range fetch of the media, not by listing formats.
4. When the CDN refuses this host entirely, a converter **progress API** returns a hosted file — the route that
   actually worked: submit the URL, poll the `progress_url` returned in the response (never a hardcode a host
   name; it is a different domain from the submit endpoint), take the final download URL, then verify locally.
5. A front-end/mirror is only usable if the bytes are media: HTTP 200 with `text/html` or a ~20-byte body is the
   classic fake success.

### Proven converter and transcript recipe

- Before inventing converter endpoints, look for an existing local acquisition script. The proven Loader route is `GET https://loader.to/ajax/download.php` with query `format=480` and `url=<YouTube URL>` (browser User-Agent and Loader Referer). Read its returned `progress_url`, poll that exact URL, then stream the final `download_url` to disk. The media endpoint may omit Content-Length: `ffprobe` the completed download and require real video plus original audio. Use 480p/720p on a nearly full disk rather than downloading an unnecessary high-resolution master.
- Probe and decode the converter output before trusting its requested quality or soundtrack. A `format=480` request can return an actual 240x426 file, and an apparently valid AAC stream can fail with scalefactor-band decode errors. Preserve that source for visual reference, acquire `format=mp3` separately through the same progress-URL flow, and transcribe the verified MP3 instead of calling an empty ASR result a silent reference. Never present the low-resolution reference as a production master.
- The existing `/root/process_youtube_xx3s.py` contains the working encrypted DownSub request and subtitle fetch recipe. Select `language == 'pt'` explicitly: the first subtitle track can be English, even for Portuguese speech. If `Crypto` is unavailable but `cryptography` is installed, use its AES-CBC encryptor and PKCS#7 padding instead of changing environments or installing another package blindly.
- Make render scripts rerunnable: preserve the original ASR window start separately from the final editorial start. Shift caption word times from the immutable ASR origin on every run; using a start field already rewritten by a previous render silently misaligns the second render.
- Preserve the complete source picture over a darkened blurred vertical background when the edit alternates wide two-person shots and single-camera shots; inspect opening/middle/end frames and keep captions outside the picture, not over a face.

## Always probe before cutting

```bash
ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height -of json source.mp4
```

Record duration and dimensions in the workdir notes; layout decisions (see
`references/vertical-clip-batch-and-branding.md`), caption bands and the number of audio chunks all derive from
them. A file that only *exists* (a text error body, a partial download) must never reach the render step.
