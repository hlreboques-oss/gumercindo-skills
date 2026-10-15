# YouTube live → vertical shorts fallback playbook

Use when Carlos asks for Instagram/TikTok cuts from a YouTube Live and normal `yt-dlp` / transcript APIs are blocked by YouTube bot/login checks.

## Goal

Produce real MP4 cuts, not just timestamp suggestions:

- vertical 9:16, usually 1080x1920;
- max 60 seconds each;
- burned-in readable captions;
- validated duration/codec/size;
- clickable download links plus ZIP.

## Fallback sequence that worked

### 1. Get video metadata/transcript when YouTube blocks direct extraction

If `yt-dlp` says `Sign in to confirm you’re not a bot` and `youtube_transcript_api` is blocked, try DownSub’s public web flow.

DownSub uses encrypted IDs in the front-end. The working pattern:

1. Fetch `https://downsub.com/js/main...js` and inspect if needed.
2. Encode the YouTube URL using CryptoJS-compatible AES/OpenSSL format:
   - passphrase: `zthxw34cdp6wfyxmpad38v52t3hsz6c5`
   - salt: 8 random bytes
   - key/IV derivation: OpenSSL `EVP_BytesToKey` MD5 loop
   - AES-256-CBC + PKCS7 padding
   - output JSON `{ct, iv, s}` base64url-ish (`+` → `-`, `/` → `_`, strip `=`)
3. POST JSON to `https://get.downsub.com/`:

```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "data": "ENCODED_URL_ENCRYPT_TOKEN"
}
```

The response can include:

- title/duration/thumbnail;
- `subtitles[0].url` encrypted timedtext URL;
- auto-translated subtitle options.

Download subtitle formats:

```text
https://subtitle.downsub.com/srt/<encrypted-subtitle-url>/?title=<title>
https://subtitle.downsub.com/vtt/<encrypted-subtitle-url>/?title=<title>
https://subtitle.downsub.com/txt/<encrypted-subtitle-url>/?title=<title>
```

Validate the SRT has real text/timestamps before selecting cuts.

### 2. Download media when `yt-dlp` is blocked

A working downloader fallback was Loader.to:

```text
https://loader.to/ajax/download.php?format=480&url=<encoded-youtube-url>
```

It returns JSON with a `progress_url`. Poll until `success=1` and read `download_url`, then download the MP4. Validate with:

```bash
ffprobe -v error -show_entries format=duration,size:stream=codec_type,codec_name,width,height -of json source.mp4
```

Do not treat a queued downloader job as success until the final MP4 downloads and probes correctly.

### 3. Pick clips from transcript

Select 5–8 high-signal ideas. Prefer complete thoughts with hooks/outcomes:

- identity/positioning statements;
- conflict/responsibility moments;
- concrete sales/marketing lessons;
- quotable lines;
- CTA/offer if useful.

Keep each cut under 60s. If an idea is longer, split it rather than exceeding platform limits.

### 4. Render vertical shorts with subtitles

A practical ffmpeg layout:

- blurred/cropped background: scale/crop to 1080x1920 + blur/darken;
- foreground: original horizontal video centered;
- top title bar with short title;
- burned ASS subtitles near lower third/bottom;
- H.264/AAC MP4 with `+faststart`.

Use `-filter_complex` (not `-vf`) when the graph uses the same input twice for background + foreground.

Example structure:

```bash
ffmpeg -ss START -t DURATION -i source.mp4 \
  -filter_complex "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=24:2,eq=brightness=-0.18:saturation=1.15[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,drawbox=...,drawtext=...,subtitles='clip.ass'[v]" \
  -map '[v]' -map '0:a?' \
  -c:v libx264 -preset veryfast -crf 23 -c:a aac -b:a 128k -movflags +faststart \
  clip.mp4
```

### 5. QA before delivery

For every output:

```bash
ffprobe -v error -show_entries format=duration,size:stream=width,height,codec_name,codec_type -of json clip.mp4
```

Check:

- duration <= 60s;
- dimensions 1080x1920;
- video H.264 and audio AAC;
- reasonable file size;
- `ftyp` present in first bytes if validating uploaded MP4 links.

Create a contact-sheet preview by extracting one frame from each cut and inspect visually for:

- title not cropped;
- vertical layout correct;
- face/video centered;
- subtitles legible and not covering important content.

If a title is too long and crops, shorten it and re-render.

### 6. Delivery

Upload both:

- ZIP with all cuts + summary JSON + contact sheet;
- individual MP4 links for quick preview/download.

Validate direct download links before sending. For MP4 validation, HTTP `200` or `206`, content-type `video/mp4`, and `ftyp` in first bytes are enough.

## Pitfalls

- Do not stop at “YouTube blocked me” if the user expects autonomous resolution; try transcript/download frontends and downloader progress APIs.
- Do not fabricate timestamps if no transcript/media exists. If blocked, state the blocker; if a workaround succeeds, continue to real rendering.
- Auto-generated captions may contain errors; use them for fast cuts but tell Carlos if precision matters.
- Long all-caps titles can crop in 9:16. Shorten or reduce font size after contact-sheet QA.
