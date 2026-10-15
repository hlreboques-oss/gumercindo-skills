# Instagram Reel download fallback: SaveInsta token flow

Use when `yt-dlp` fails with Instagram empty media response and no browser cookies are available, but the public Reel page can still be processed by downloader services.

## Observed working flow

1. Fetch `https://saveinsta.to/` with a normal browser User-Agent.
2. Parse the page for:
   - `k_exp="..."`
   - `k_token="..."`
   - `k_url_search`, usually `https://saveinsta.to/api/ajaxSearch`
3. Call local verification endpoint:

```python
POST https://saveinsta.to/api/userverify
Content-Type: application/x-www-form-urlencoded
url=<instagram reel url>
```

Response shape:

```json
{"success": true, "token": "JWT..."}
```

4. Call search endpoint:

```python
POST https://saveinsta.to/api/ajaxSearch
Content-Type: application/x-www-form-urlencoded
k_exp=<parsed>
k_token=<parsed>
q=<instagram reel url>
t=media
lang=en
v=v2
cftoken=<JWT from userverify>
html=
```

5. Parse the returned HTML links. Do **not** blindly download the first link: SaveInsta often returns a thumbnail first. Select the `<a>` whose text/title contains `Download Video`.
6. Download that URL with `Referer: https://saveinsta.to/` and save as `.mp4`.
7. Verify with `file` and `ffprobe` before delivering.

## Pitfalls

- The first `dl.snapcdn.app/saveinsta?...` link may be `Download Thumbnail` and returns JPEG even if saved as `.mp4`.
- Some downloader mirrors are Cloudflare-blocked or permanently unavailable; if one fails, try another, but do not loop indefinitely.
- This is a fallback for user-requested download/capture, not a claim that Instagram API access is generally available.
