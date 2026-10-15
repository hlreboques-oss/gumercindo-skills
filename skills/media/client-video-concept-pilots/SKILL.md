---
name: client-video-concept-pilots
description: "Use when making short client video pilots from references."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [video, client-preview, google-flow, healthcare, prompts, short-form]
created_by: agent
---

# Client Video Concept Pilots

Use this skill when Carlos needs to create a **short approval pilot** for a client video before producing the final 60–90s or campaign version. Typical inputs are client photos, logo, practitioner/team images, room/environment references, and sometimes a short real video used as visual reference.

## Core workflow

1. **Confirm the pilot purpose**
   - Treat this as a concept preview: validate visual mood, message, and direction.
   - Keep the first version short, usually 20–35 seconds.
   - Tell Carlos how to frame it to the client: “prévia conceitual para validar caminho visual e mensagem”.

2. **Inventory references**
   - Logo and brand colors.
   - Environment photos: reception, rooms, equipment, decor.
   - Main person/character reference: owner, practitioner, presenter, mascot, etc.
   - Real action/procedure video if available.

3. **Transform references into ad-safe scenes**
   - Preserve recognizable layout, colors, furniture, equipment, clothing style and face impression.
   - Use real procedure clips as movement/equipment reference, not necessarily as the hero visual.
   - Avoid visuals that create fear, disgust, confusion, or legal/medical overclaim risk.

4. **Split into generator-sized takes**
   - For Google Flow or similar tools, assume each video generation is usually 7–10 seconds.
   - Build 4–6 takes, then combine in CapCut/Canva/Premiere.
   - Each take should have one job: arrival, welcome, explanation, technology/process, result, CTA.

5. **Write deliverables Carlos can paste**
   - Narration script.
   - Text-on-screen list.
   - One global style/identity prompt.
   - Per-take prompts.
   - Client-facing approval message.
   - Optional TTS draft if helpful.

## Modeling a reference Reel into a Gumercindo/client implementation video

When Carlos sends an Instagram post/Reel as a model, download/probe the reference, extract a contact sheet, and transcribe the audio before writing. Copy the **structure**, not the brand: pacing, sequence of claims, text hierarchy, camera energy, icon/card rhythm, CTA shape, and color mood are fair to model; logos, exact event names, distinctive taglines, and proprietary visual assets are not. For Gumercindo implementation videos, convert the reference into an original offer arc: hook for IA/implementation, agents by department, process mapping/automation, decision/dashboard layer, and a direct CTA. If generating locally with PIL/FFmpeg, render a real MP4 with TTS/audio, then inspect a contact sheet for black frames, unreadable small labels, text overlap, and brand leakage; re-render before delivery when any label collides.

### Premium dev/Claude-style implementation pieces

When Carlos asks for the same quality as a polished Claude/dev Reel, do **not** deliver a simple talking-head cut with subtitles, and do not leave cards/images sitting in front of his face for the whole video. Treat the raw clip as a talking-head layer and build a premium composite: hook from the speaker, kinetic captions with highlighted words, screen/code/terminal or agent UI scenes, cursor motion, process cards, zooms, sound design, and a clear transformation from “manual IA prompting” to “Gumercindo executing”. Model the reference's scene grammar: alternate full talking-head, full-screen motion/text, screen or terminal UI, picture-in-picture face in a corner, split-screen face + concept card, and return-to-face payoff. Preserve exact user-supplied headline copy on the first screen. Prefer using existing local motion/video infrastructure first (for example Hyperframes/HTML/Python/FFmpeg assets already present) and create a new repository only if the existing tooling cannot support the required look. If the raw footage is visually weak but the message is strong, keep the audio/face as authority moments and carry the perceived quality with animated Gumercindo screens, diagrams, and UI simulations.

For handheld close-up footage, QA the PIP crop across every PIP timestamp before delivery. If a circular PIP cuts the forehead/mouth or fails to center the face, switch to a rounded vertical rectangle and crop lower/wider so the head and shoulders stay visible. Do not let the PIP cover title text; move titles left or stack them before shrinking the face into a corner.

## Google Flow prompt rules

- Ask for vertical 9:16 unless Carlos says otherwise.
- Ask the model to use uploaded references as identity/environment references.
- Use “modern premium 3D animated family advertising style” rather than direct copyrighted studio imitation.
- Include camera movement: smooth dolly, gentle pan, close-ups, soft depth of field.
- Include negative constraints: do not deform faces/hands, do not add extra fingers, avoid scary or unsafe elements.
- **Never name a real person, client, or public figure in the prompt.** Flow rejects it with `This prompt might violate our policies about generating prominent people. Please try a different prompt` and refunds the credit. Describe a fictional subject instead (“a fictional small business owner”) and the same shot renders — re-submitting a reworded prompt is the fix, not a dead end. Append `no real person likeness, no celebrity, no readable text` so the model stops inventing on-screen text and faces.
- Confirm the generator is set to **video** before submitting: the prompt box defaults to image (type **Image → Video**, aspect **9:16**, model **Omni 1.1 Flash**, duration **10s**, count **x1**). Generate → download → generate the next take; one prompt yields one ~10s clip.

The full clip pipeline — settings path, 720p download, the normalize/concat/`tpad` assembly and the CTA line rule — is in `references/google-flow-clip-pipeline.md`.

## Healthcare / clinic pilot pattern

For clinics, especially dentistry or pediatric care:

- Lead with prevention, safety, comfort and trust.
- Show parent reassurance and patient comfort.
- Do not make invasive procedure close-ups the emotional center of the ad.
- For technologies such as nitrous oxide, phrase as comfort support: “ajuda a criança a ficar mais calma e confortável durante o atendimento.”
- Avoid absolute claims like “sem dor garantido” unless the client explicitly approves and it is legally/clinically safe.

Suggested 30s narration structure:

```text
Cuidar [do problema/benefício] desde cedo faz toda a diferença.

Na [Nome da Clínica], o atendimento é pensado para ser leve, seguro e acolhedor.

As visitas periódicas ajudam a prevenir problemas, acompanhar o desenvolvimento e criar uma relação mais tranquila com o cuidado.

E para deixar esse momento mais confortável, a clínica conta com [tecnologia], que ajuda o paciente a ficar mais calmo durante o atendimento.

[Nome da Clínica]. Cuidado, tecnologia e carinho para [benefício final].
```

## Verification checklist

- [ ] Pilot duration and take count fit the generator’s practical limits.
- [ ] Prompts include actual reference details from the user’s photos/videos.
- [ ] Medical/technical claims are conservative and approval-safe.
- [ ] The real procedure content was softened into client-friendly scenes when needed.
- [ ] Final delivery includes copy/paste prompts and a client approval message.
- [ ] For premium reference-mode edits, the QA contact sheet proves layout alternation, exact first-screen headline, readable text, PIP face centered at every sampled timestamp, PIP/title separation, and no persistent overlays blocking the speaker’s face.

## Pitfalls

- Do not keep asking for perfect assets when Carlos says to make a pilot now; use available references and label it as a concept.
- Do not over-focus on tools inside mouths, blood, needles, pain, fear, or procedure intensity for family/healthcare ads.
- Do not promise the final video is generated if only prompts/scripts were produced.
- If a Flow run only produced stills, say so plainly — do not animate a still or hand back a PIL concept card as if it were a Flow-generated video.
- If producing actual files, verify they exist and attach them; if producing prompt packs, label them as prompt/script deliverables.
- Do not copy the reference brand or logo when Carlos asks to model a post; reproduce the content mechanics in an original Gumercindo/client identity and QA the rendered frames for legibility before sending.
