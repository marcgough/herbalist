# Herbalisti Corpus Build Checkpoint

Date: 2026-06-23

## Objective

Resume the separated corpus-first goal after the `Corpus Memory` split by:

1. verifying the isolated NLM `nlm-0061627` acquisition propagated cleanly
2. repairing stale NLM archive metadata caused by a successful-retry bookkeeping bug
3. adding another small practical domestic-medicine pass from the local Wellcome registry

## What changed

### 1. The isolated NLM `Botanic family physician` work was confirmed end to end

Verified work:

- `nlm-0061627`
- *New guide to health , or, Botanic family physician*

Confirmed state:

- registry row is `chunked`
- local normalized text and chunk files exist
- `Corpus Memory` retrieves the work by exact work ID
- the edition family now uses `nlm-0061627` as the canonical witness for:
  - `family-new-guide-to-health-or-botanic-family-physician--c26ccab365`

Acquisition summary for that work:

- `52` chunks
- `69` paragraphs
- topic family: `domestic-medicine`

### 2. NLM retry bookkeeping was repaired

Two NLM consistency issues were fixed:

1. successful retries could leave stale `NLM OCR acquisition error` notes on rows that were already `chunked`
2. NLM `work.md` files were being written before the final status flipped to `chunked`

Files updated:

- `scripts/corpus/build-nlm-corpus.mjs`
- `scripts/corpus/repair-nlm-success-metadata.mjs`

Repair pass results:

- `19` chunked NLM rows had stale failure-note residue removed
- all `438` chunked NLM `work.md` files were regenerated from current registry state
- stale NLM `work.md` count fell from `419` to `0`

This keeps the public archive metadata and the local bibliographic record pages aligned with the real ingest state.

### 3. Three more Wellcome practical-reference works were added

Landed works:

1. `wellcome-aw2c3dda`
   - *The family physician : a manual of domestic medicine*
   - `4279` chunks
   - `4304` paragraphs
   - topic family: `domestic-medicine`

2. `wellcome-g5yuddfe`
   - *New guide to health, or, Botanic family physician*
   - `798` chunks
   - `819` paragraphs
   - topic family: `domestic-medicine`

3. `wellcome-wmnzs2cr`
   - *New guide to health, or, Botanic family physician*
   - `860` chunks
   - `894` paragraphs
   - topic family: `domestic-medicine`

These were all processed from the local Wellcome registry using explicit official work IDs only.

### 4. The targeted derived layers were refreshed

Instead of waiting on the full all-layer refresh path, the layers needed for public archive use were refreshed directly:

- edition families
- reference catalog
- herbal corpus export
- public `data` JSON exports
- separated `Corpus Memory` refresh

The broad `npm run corpus:refresh -- --run-status=false` command still appears to be heavier than the current command window and timed out repeatedly before completion, so this pass refreshed the required downstream layers explicitly and verified them directly.

## Current state

### Archive totals

- total works: `2720`
- chunked works: `1328`
- discovered works: `1384`
- failed works: `8`

### By collection

- NLM Digital Collections: `438` chunked of `696`
- Wellcome Collection: `863` chunked of `1997`
- Project Gutenberg: `27` chunked of `27`

### Public export totals

From `public/data/reference-books.json` and `verify:data-exports`:

- reference-book records: `1328`
- remedies: `21`
- herbal-knowledge records: `124`
- citation notes: `10`
- sources: `6`

### Corpus Memory totals

From `corpus-memory/state.json` and `npm run corpus-memory:refresh`:

- total retrieval documents: `3318`
- `edition-family`: `1866`
- `work-summary`: `1328`
- `herb-profile`: `124`

## Retrieval verification

Exact `Corpus Memory` retrieval passed for:

- `nlm-0061627`
- `wellcome-aw2c3dda`
- `wellcome-g5yuddfe`
- `wellcome-wmnzs2cr`

That confirms the new NLM and Wellcome witnesses are present in the separated retrieval layer, not only on disk.

## What this means

The corpus is in a better state than it was at the start of this pass:

- the separated retrieval store is larger and up to date
- the public reference export grew from `1325` to `1328`
- the `Botanic family physician` lane is materially deeper
- the local NLM archive pages now tell the truth about ingest state

## Best next move

The next intake should continue with hand-picked practical witnesses rather than raw frontier bulk.

Best immediate directions:

1. continue the `family physician` / `botanic family physician` depth lane with more explicit Wellcome witnesses already present in the local registry
2. isolate one or two of the remaining failed NLM works and test whether they need alternate official OCR routing logic
3. improve `scripts/corpus/refresh-corpus-state.mjs` so it can either stream progress or run a lighter post-acquisition subset without appearing to hang

## Verification

Passed in this pass:

- `node scripts/corpus/build-nlm-corpus.mjs --work-ids=nlm-0061627 --retry-failed=true`
- `node scripts/corpus/repair-nlm-success-metadata.mjs`
- `node scripts/corpus/build-wellcome-corpus.mjs --work-ids=wellcome-aw2c3dda,wellcome-g5yuddfe,wellcome-wmnzs2cr`
- `node scripts/corpus/build-edition-families.mjs`
- `npm run export:data`
- `npm run corpus-memory:refresh`
- `npm run verify:data-exports`
- `npm run corpus:status`
- `npm run lint`
