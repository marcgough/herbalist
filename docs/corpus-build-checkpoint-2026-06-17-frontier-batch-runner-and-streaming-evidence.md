# Herbalisti Corpus Build Checkpoint

Date: 2026-06-17

## Objective

Make frontier-guided corpus expansion repeatable as a single sequential workflow, then recover the semantic rebuild path after the evidence layer hit a corpus-scale output limit.

## New automation added

This step added a reusable frontier batch runner:

- `scripts/corpus/run-frontier-batch.mjs`
- `npm run corpus:frontier-batch`

The runner now:

- reads `corpus/derived/acquisition-frontier/frontier.csv`
- selects the next requested work IDs by collection
- runs NLM first and Wellcome second
- reconciles `registry/works.csv`
- rebuilds edition families, the acquisition frontier, the evidence layer, term families, and the seed catalog
- writes a machine-readable run summary to `corpus/exports/frontier-batch-summary.json`

It also now writes partial summaries on failure and records `failedCommand`, so successful acquisition work is not hidden by a later downstream rebuild error.

## Batch acquired

Processed: 12

Failures during source acquisition: 0

### NLM Digital Collections

Processed: 6

- `nlm-63580090R` - `The family physician and guide to health`
- `nlm-63570560R` - `Family physician`
- `nlm-63580630R` - `The American family physician, or, Domestic guide to health`
- `nlm-63560930R` - `Domestic medicine, or, Medical vade mecum`
- `nlm-101136237` - `The Indian vegetable family instructer`
- `nlm-63580340R` - `Supplement to Howard's Domestic medicine`

### Wellcome Collection

Processed: 6

- `wellcome-cjcrasa9` - `English physician; and complete herbal`
- `wellcome-dn7yrsvs` - `The complete herbal ... with the English physician enlarged`
- `wellcome-cczct9kx` - `Culpeper's English physician ; and complete herbal`
- `wellcome-h56bk3ec` - `Pharmacopoeia officinalis et extemporanea`
- `wellcome-gtpbv42a` - `Pharmacopoeia officinalis et extemporanea`
- `wellcome-q3jme7ef` - `Pharmacopoeia officinalis et extemporanea`

## Failure encountered and fixed

The first real `corpus:frontier-batch` acquisition run succeeded through source collection, but the rebuild failed in the evidence layer with:

- `RangeError: Invalid string length`

Cause:

- `writeJsonLines(...)` in `scripts/corpus/lib.mjs` built one giant in-memory string for the full JSONL output

Fix:

- rewrote `writeJsonLines(...)` to stream line-by-line with backpressure

Result:

- a follow-up rebuild-only frontier batch completed successfully
- the corpus can now emit large evidence outputs without the previous string-size failure mode

## Current corpus totals after the successful rebuild

- 2,720 registered works
- 467 locally acquired and chunked works
- 2,253 discovered works still queued
- 0 failed works overall

Current chunked works by collection:

- 27 Project Gutenberg works
- 296 Wellcome Collection works
- 144 NLM Digital Collections works

Current chunk totals from disk:

- 660,596 total chunk records
- 14,221 Project Gutenberg chunks
- 454,575 Wellcome chunks
- 191,800 NLM chunks

## Current frontier state after rebuild

- 1,641 actionable family recommendations remain
- 1,574 uncovered families remain
- 67 depth families remain
- 0 failed-only families remain
- 1,992 discovered works still sit in uncovered families
- 261 discovered works still sit in depth families

Collection worklist balance:

- NLM: 382 frontier candidates remaining
- Wellcome: 1,259 frontier candidates remaining

## Current semantic totals after rebuild

Evidence layer:

- 467 chunked works
- 525,554 chunk-signal records
- 41,685 herb candidates
- 2,392 high-confidence herb candidates
- 12,436 medium-confidence herb candidates
- 26,857 low-confidence herb candidates
- 41,753 graph nodes
- 236,851 graph edges

Term-family layer:

- 41,084 canonical families
- 38,757 accepted families
- 38,588 accepted plant-like families
- 169 accepted broader materia medica families
- 31 review families
- 2,296 rejected families

Seed-catalog layer:

- 103 curated seed-ready families
- 67 supporting families
- 30,886 review families
- 7,532 excluded noise families

## Why this matters

This step improved both the collection workflow and the semantic archive:

1. it turned frontier-guided acquisition into a repeatable one-command workflow
2. it added another 12 rights-cleared works with no new source failures
3. it fixed the first genuine corpus-scale evidence serialization bottleneck
4. it kept the corpus aligned to the no-scrape, no-key, official-source-only goal while still increasing semantic coverage meaningfully

## Recommended next move

1. continue `corpus:frontier-batch` in modest sequential slices
2. keep prioritizing uncovered families over repeated edition depth until the frontier mix changes materially
3. begin a targeted review pass over high-volume plant-family candidates so more of the large accepted layer can be promoted into seed-ready herbal records without lowering quality
