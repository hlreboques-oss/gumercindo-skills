# Generative reframing of an existing recording

## Identify the actual operation

1. Download the supplied reference and source separately; probe duration, dimensions and audio, then inspect a contact sheet and transcribe the reference's explanation. Read demonstrated app/model names from full-size UI frames rather than trusting phonetic ASR spellings.
2. Classify each requested shot:
   - **Crop/punch-in:** reuses the recorded perspective; local editing can do it, subject to source resolution.
   - **Tracked overlay/motion graphic:** adds designed elements; it does not reveal hidden geometry.
   - **Generated viewpoint:** invents a lateral, overhead, reverse or other unrecorded view; needs a generative model with appropriate reference-video/editing support.
3. When Carlos says previous work was only similar, compare the transformation class against the reference before iterating. More cards, zooms or decorative movement will not repair a missing generative-camera capability.

## Explain the integration without conflating layers

- Separate the **orchestrator/model**, the **app or browser interface**, and the **generation service**. A workflow demonstrated inside ChatGPT may use an external service for the image/video transformation; the chat model's presence does not establish access to that service.
- Explain that Hermes can call an authenticated service directly when the necessary operation is exposed. Using ChatGPT or Claude in a browser is an alternative interface, not automatically a prerequisite or an equivalent capability.
- Discover the service tools, load their complete schemas, authenticate the intended account, and inspect the live models' input roles, duration constraints and cost before choosing a route. Catalog discovery, authenticated model lookup, a completed generation and an accepted output are four different milestones.
- A Higgsfield connector can be discovered through tool search. `connectors__higgsfield_mcp__MODELS_EXPLORE` supports model discovery, but discovery alone is not proof of an authorized account or supported video-to-video operation. If authorization is requested, use the connection flow and have the user complete it; do not describe an unexecuted generation route as tested.
- Do not promise free generation because a chat subscription or model login is available. Read the generation service's actual entitlement and quote the bounded test cost separately. Do not persist temporary authorization URLs or account balances in the skill.
- When an authorization screenshot reports a billing or card-verification gate, read that message before restarting OAuth: account sign-in, payment/trial activation, and connector authorization are separate states. Adding a card is not proof that any of them completed. State only what the provider confirms about trial activation or charges, let the user handle billing privately, and recheck connector status after they finish; do not churn authorization links to repair a payment failure.

## Direct one bounded test before a batch

1. Preserve the untouched original video and original audio in a durable project folder. Confirm consent to transform the visible person; do not attach an unrelated avatar.
2. Write a shot manifest: `source_in`, `source_out`, spoken phrase, purpose, requested viewpoint, camera movement, continuity constraints and status. Place angle changes at meaningful phrase/action beats rather than equal-duration intervals.
3. Choose one short, representative window and verify that the selected model supports the supplied video as reference/edit input. If it accepts only a still, label the result as still-conditioned reconstruction, not preservation of the recorded performance.
4. Request the same identity, wardrobe, room layout, props, lighting, action and timing. Use only the desired camera change; avoid contradictory movement directions or additional actors. Such instructions improve conditioning but do not guarantee fidelity.
5. Generate one test within the approved budget. Download the actual output and compare first/middle/last frames and normal-speed motion against the same source interval. Inspect facial identity, hands, prop geometry, room consistency, action continuity and visible mouth timing.
6. Keep the original voice continuous in the final edit. Replacing generated speech with the recording preserves the soundtrack, not lip synchronization; reject visibly mismatched mouth/action rather than claiming exact reproduction from a matching transcript.
7. Show the test for acceptance before purchasing a full set of new viewpoints. Keep rejected takes out of continuation anchors and the final montage.

## Assemble and make the method reusable

- Intercut accepted generated shots with the original at their source timecodes; retain useful original-camera beats instead of replacing every frame for spectacle.
- If requested, deliver an original-versus-edited comparison with matching intervals and labels so the new angles are assessable.
- Verify the final export's own audio, duration, complete decode, caption safe zones and every camera junction. Disclose generated viewpoints as reconstructions, not additional cameras that actually recorded the event.
- Save the approved camera vocabulary, shot rhythm, continuity prompt, input-binding method and rejection criteria as the reusable recipe. Keep service/model constraints and runnable helpers alongside it when verified; leave authentication, pricing and untested model support as live checks.
- A skill stores the directing procedure; it does not supply missing service permissions, model capabilities or generation credits.
