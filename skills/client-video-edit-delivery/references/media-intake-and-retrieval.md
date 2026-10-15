# Intake: getting the client's media and proving it is theirs

Use before any edit plan exists. The failure this prevents: planning a cut for a file that never arrived.

## Telegram

- The bot ingests inbound media only when the turn reaches the agent and the file is inside the platform
  size limit (Bot API `getFile` caps around 20 MB; only a self-hosted Bot API server configured with
  `base_url` raises it). Above the ceiling there is no file and no user-facing error.
- In groups the adapter ignores media that does not @mention the bot (unmentioned-group observation is off
  by default), and it caches media from the message the current turn replies to only within the same size
  limit — an oversized replied-to video is skipped *silently*, with no log line at all.
- Diagnose before promising anything:
  - `grep "Cached user video" ~/.hermes/logs/gateway.log`
  - `ls -lat ~/.hermes/cache/videos ~/.hermes/cache/images ~/.hermes/cache/documents`
  - `grep "chat=<chat_id>" ~/.hermes/logs/gateway.log | tail` to see whether that chat ever produced a
    cache entry.
  No cache line for that chat means the file is not here — say so and ask for it, rather than probing
  candidates: the cache is shared with other chats, so a `ffprobe` duration match proves nothing.
- Ask the sender to re-send the file in the same message that mentions the bot, or to upload it to a Drive
  folder. Do not promise a cut before one of those lands.

## Drive folder for big footage

- Create or reuse the folder through the Composio `googledrive` connection (alias `carlos-google-drive`)
  whenever the local Google OAuth refresh answers `invalid_grant`; the folder recipe also lives in
  `external-app-oauth-connection-operations`.
- `COMPOSIO_MULTI_EXECUTE_TOOL` call shape: `{tools:[{tool_slug, arguments, account}], thought,
  sync_response_to_workbench:false, current_step, session_id}`. `account` belongs **inside each item of
  `tools[]`** — a top-level `account` is rejected by schema validation — and `sync_response_to_workbench`
  is required.
- Sequence: `GOOGLEDRIVE_CREATE_FOLDER` -> `GOOGLEDRIVE_CREATE_PERMISSION` (`type: anyone`, `role: writer`)
  -> `GOOGLEDRIVE_LIST_PERMISSIONS` to read the grant back. Hand over
  `https://drive.google.com/drive/folders/<id>`. Tell the sender plainly that a file uploaded from
  another login spends that account's quota, not the owner's.
- See what landed with `GOOGLEDRIVE_FIND_FILE`, `q="'<folder_id>' in parents and trashed = false"`,
  fields `files(id,name,mimeType,size,modifiedTime,webViewLink)`.

## Download and verify

```bash
curl -sL "https://drive.usercontent.google.com/download?id=<file_id>&export=download&confirm=t" -o raw.mp4
md5sum raw.mp4          # must equal the Drive md5Checksum
stat -c %s raw.mp4      # must equal the Drive size
```

- `GOOGLEDRIVE_GET_FILE_METADATA` with `fields=md5Checksum,size` supplies both reference values;
  `md5Checksum` exists for binary files, which is exactly what footage is.
- The `drive.usercontent.google.com/download?...&confirm=t` form works for `anyone`-with-link files and
  skips the virus-scan interstitial that `/uc?export=download` returns for larger files.
- An equal size alone is weak evidence; the md5 match is what lets you call the local copy the client's
  file. Do not claim an edit started on "her video" without it.
