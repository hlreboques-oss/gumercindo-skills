# Reference-led hybrid explainers

Use when the request is to follow an existing explainer's order and visual teaching style while mixing motion with real imagery.

## 1. Extract the teaching structure

1. Download the reference, run `ffprobe`, transcribe with timestamps, and inspect both a contact sheet and full-size frames of its interfaces.
2. Build a beat manifest: `reference_in/out`, narrative role, spoken idea, visible action, visual language, target adaptation, evidence source, and estimated duration.
3. Extract roles rather than copy: problem → identity → setup → task in action → connections → report/control → benefit → invitation is one useful sequence, not a mandatory template for unrelated references.
4. Preserve the causal bridges between roles. A new title and orb in each scene are not enough if the viewer cannot see how a request becomes an action and then a result.
5. Record what is actually being matched: light/dark palette, typography scale, whitespace, interface density, footage treatment, camera/frame format and transition rhythm. Compare the final film with the reference, not merely with a weaker previous attempt.

## 2. Adapt claims and source real imagery

1. Write an original target-specific script in the same functional order. Do not inherit the advertiser's name, guarantees, telephone capability or integration coverage.
2. Inventory the user's authorized footage before sourcing stock. Select footage by meaning: a person giving a command, a real browser operation, or an implementation participant supports different claims.
3. Store provenance per asset: original path, source in/out, rights/authorization basis, narrative use, and privacy treatment. Preserve raw sources outside the delivery archive.
4. Separate three visual states explicitly: recorded real operation, illustrative interface, and AI-generated imagery. Never label a designed dashboard as evidence that a task executed.
5. An anonymized real capture must remain informative. Prefer masking specific names, contact fields or account details while preserving the action. If privacy requires obscuring the whole view, use it only as contextual footage; explain the task with a separately labeled illustration instead of presenting an unreadable capture as proof.

## 3. Build picture around measured speech

1. Generate or obtain the continuous narration first, measure it, and derive phrase-level scene boundaries. Keep original supplied speech unchanged when requested; synthetic narration must not be described as the client's real voice.
2. Implement one explanatory action per beat: populate an instruction, connect a tool, move an item into a calendar, or update a report. Reveal elements sequentially and synchronize the result with the relevant spoken word.
3. For clean UI motion, use a deterministic HTML/CSS/JS or React composition with an explicit seekable timeline. Await fonts before capturing frames. Use the requested framework/service when specified; disclose an actual fallback renderer rather than calling every code render Claude or HyperFrames.
4. Prepare real-footage windows separately, then composite them at explicit output timestamps. Normalize frame rate and aspect, preserve faces and essential UI, and avoid caption-on-caption when the source is already edited.
5. Give the CTA a complete spoken phrase and a readable final hold. Do not shorten the argument to a clip-count budget or extend the film through loops of rejected footage.

## 4. Verify the final artifact

- Check the manifest has a supporting visual for every narrated action and that all claims have the intended real/illustrative status.
- Inspect a full-size frame from every real-footage window, every interface step, and the ending. Check text, platform-safe zones, faces and privacy masks.
- After audio normalization, explicitly resample to the intended rate before sample-sensitive padding/delay. Assert narration slot and concatenated durations before muxing; inspect the final export's CTA, not just the source narration.
- Decode the complete MP4 and read back its duration, dimensions and audio streams. Transcribe the exported narration to catch missing connector phrases or clipped ending words.
- Deliver the actual video with a short note about any meaningful limitation, such as an anonymized unreadable capture or an illustrative UI. Keep the source archive free of unmasked private recordings and credentials.
