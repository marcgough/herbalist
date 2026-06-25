# Herbalisti Media Generation

Date: 2026-06-15

## Direction

Video should extend the current high-tech Zen health direction:

- Luminous, spacious, futuristic wellness architecture.
- Botanical intelligence, glass interfaces, pale wood, titanium, mist, and precise movement.
- No old apothecary mood, no pills, no syringes, no hospital cues, no pharmaceutical packaging.
- Motion should feel calm and premium, not busy.

## Seedance 2.0 Through Kie.ai

Kie.ai exposes Seedance through an asynchronous task flow:

1. Create a job with `POST /api/media/seedance`.
2. Store the returned `taskId`.
3. Prefer a callback URL in production.
4. Check status with `GET /api/media/seedance-status?taskId=...`.
5. Parse result URLs from Kie task details, including `resultJson` when present.
6. Download and persist accepted videos promptly, ideally into R2, instead of hotlinking provider result URLs.

Kie.ai's public docs describe an asynchronous task model: a successful create call confirms task creation, not completion, and final results should be retrieved by callback or by polling the task-detail endpoint. Their docs also note generated media files are stored for 14 days, so approved outputs should be copied into Herbalisti-owned storage quickly. See `https://docs.kie.ai/` and `https://docs.kie.ai/market/common/get-task-detail`.

The Herbalisti endpoints require:

- `KIE_API_KEY`
- `MEDIA_ADMIN_TOKEN`

Verify the protected endpoint behavior without real provider calls:

```bash
npm run verify:media-endpoints
```

This local verifier checks fail-closed behavior without secrets, admin authentication, prompt validation, Seedance payload sanitising, D1 media-job persistence, and result URL parsing from Kie `resultJson`. It mocks provider responses and does not generate video, upload files, spend credits, or contact Kie.ai.

## Provenance Requirement

All launch media must be recorded before publication:

- Current public provenance: `/data/media-provenance.json`
- Current public motion manifest: `/data/media-manifest.json`
- Human-readable attribution note: `docs/attribution.md`
- Verification command: `npm run verify:attribution`

New OpenAI images or Seedance video loops should not be published until the provenance record includes provider, workflow, prompt summary, usage note, and human review status.

## Frontend Video Slots

The public UI is now video-ready without requiring a video asset for launch:

- Hero slot: `/assets/herbalisti-hero-loop.mp4`
- Research slot: `/assets/herbalisti-research-loop.mp4`
- Poster fallback images stay active at all times.
- Both slots are currently disabled in `/data/media-manifest.json`.

To publish a Seedance loop:

1. Generate candidate video through Kie.ai using the protected admin endpoint.
2. Human-review the output for brand fit, motion calmness, watermark absence, and medical-claim safety.
3. Copy the approved file into Herbalisti-owned storage, ideally R2, then into the public asset path or equivalent owned URL.
4. Add a full provenance record before publication.
5. Set the relevant manifest slot to `enabled: true` only after the local/owned video asset exists.
6. Run `npm run verify:attribution`, `npm run build`, and `npm run verify:release`.

The current launch candidate deliberately avoids external video hotlinks and avoids requesting missing video files.

## Draft Prompt: Hero Loop

```text
Create an 8 second seamless cinematic website background loop for Herbalisti, a futuristic holistic health brand.

Scene: a light, airy Japanese Zen wellness observatory in the near future, with warm white stone, pale hinoki wood, translucent glass, floating botanical data projections, subtle DNA and peptide light patterns, and soft morning light.

Motion: very slow camera drift, gentle holographic shimmer, subtle leaf movement, calm glass reflections, no abrupt motion.

Style: Star Trek meets high-end holistic wellness, elegant, spacious, premium, contemporary, high-tech.

Avoid: old apothecary, rustic herb shop, pills, syringes, hospital, pharmaceutical packaging, people, readable text, logo, watermark, medical claims.
```

Recommended settings:

- Model: `bytedance/seedance-2-fast` for drafts, `bytedance/seedance-2` for final hero candidates.
- Aspect ratio: `16:9`.
- Duration: `8`.
- Resolution: `720p` for draft, `1080p` for final.
- Audio: off.

## Draft Prompt: Research Interface Loop

```text
Create an 8 second seamless cinematic background loop for Herbalisti's research and reference section.

Scene: a serene white research reading room with pale wood, shoji-like glass, open botanical reference books, ceramic vessels, and transparent floating search/data interfaces connecting plant forms, DNA, CRISPR diagrams, peptides, and longevity research signals.

Motion: slow parallax, subtle light pulses along data threads, barely moving leaves, soft morning atmosphere.

Style: high-tech Japanese Zen wellness, precise, quiet, spacious, elegant.

Avoid: readable text, logo, watermark, old library clutter, apothecary jars, pills, syringes, pharma packaging, medical claims.
```

## Admin Endpoint Example

```bash
curl -X POST https://herbalisti.com/api/media/seedance \
  -H "content-type: application/json" \
  -H "x-herbalisti-admin-token: $MEDIA_ADMIN_TOKEN" \
  -d '{
    "model": "bytedance/seedance-2-fast",
    "prompt": "Create an 8 second seamless cinematic website background loop for Herbalisti...",
    "duration": 8,
    "resolution": "720p",
    "aspectRatio": "16:9",
    "generateAudio": false
  }'
```

Check the task:

```bash
curl "https://herbalisti.com/api/media/seedance-status?taskId=$TASK_ID" \
  -H "x-herbalisti-admin-token: $MEDIA_ADMIN_TOKEN"
```
