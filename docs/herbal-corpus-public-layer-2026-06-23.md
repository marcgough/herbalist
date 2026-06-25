# Herbalisti herbal corpus public layer

Date: 2026-06-23

## What changed

- Added a build-time herbal corpus generator at `scripts/corpus/build-herbal-corpus.mjs`.
- The generator converts derived herb profiles plus rights-cleared source metadata into a deploy-safe runtime module at `functions/_generated/herbal-corpus.js`.
- Current generated output:
  - `124` corpus-derived herb profiles
  - `193` corpus-derived supporting source works
- The server herbal knowledge layer now merges the original editorial seed records with the larger corpus profile layer so search and chat can surface both cleaner editorial framing and broader archive evidence.

## App wiring

- `functions/_lib/herbal-knowledge.js` now serves merged herb knowledge and merged source records.
- `functions/_lib/search.js` now guarantees a `Herbs` search group even when the separate `Corpus Memory` service is unavailable.
- `scripts/export-public-data.mjs` now exports the merged herbal layer to `public/data/herbal-knowledge.json`.
- Current public herbal export now contains:
  - `124` herb records
  - `198` total source records once the original editorial source set is merged with generated corpus sources

## Frontend behavior

- Search fallback now hydrates herb matches from `/data/herbal-knowledge.json`, not just the tiny local seed.
- The home herbal chat fallback now fetches the herbal export on demand if `/api/herbal-chat` is unavailable, which keeps local static review grounded in the larger public corpus.
- Search-page loading behavior was tightened so direct query URLs no longer briefly report `0 matches from local seed` while the larger review cache is still loading.

## Verification

- `npm run build`
- Direct module verification confirmed:
  - `buildHerbalChatResponse('lemon')` returned a corpus-backed answer with source citations
  - `getHerbalKnowledgePayload({ query: 'aconite' })` returned the expected corpus herb record
- Manual in-app browser verification on `http://127.0.0.1:4173/search?q=aconite` confirmed:
  - immediate first-load state shows corpus-backed herb results
  - settled review state shows `1 matches from static review cache`
  - the `Aconite` card reports `266` supporting works and `956` source-linked passages

## Notes

- This checkpoint stays in the project docs only.
- I did not sync the corpus-layer details into the shared Agent Memory instance, to preserve the boundary between working memory and the separate Herbalisti corpus archive.
