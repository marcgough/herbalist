# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next mixed Wellcome and NLM lane completed after the studying-physick and family-physician pass.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully across Wellcome and NLM
- the lane added one route-proven botanical excursion witness, one practical family guide, and one deliberate lexicon-repeat fallback
- the derived corpus layers were rebuilt again at the new `1280`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- the 3 newly landed works split cleanly across retrieval weight: one unflagged Wellcome witness, one `thin-reference` NLM witness, and one `severe-thin-reference` lexicon witness
- `nlm-101125242` failed on the same run and is now parked in an explicit manual-retry lane

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `wellcome-aqkb26gx` - *Account of a botanical excursion to the Mull of Cantyre, and the island of Islay* - `87` chunks, `89` paragraphs
- `nlm-61840770R` - *Dr. John Williams' last legacy, and useful family guide* - `46` chunks, `56` paragraphs
- `nlm-101526718` - *Lexicon medicum, or, Medical dictionary* - `36` chunks, `68` paragraphs

All 3 processed successfully.

## Manual retry lane

One intended NLM candidate did not land:

- `nlm-101125242` - *Futsugo Yakushitsu hokan, [Tokyo]*

Registry status now records:

- ingest status: `download_failed`
- review status: `manual_retry_required`

The registry notes the exact acquisition error as:

- `NLM OCR page did not expose a <pre> block: https://collections.nlm.nih.gov/ocr/nlm:nlmuid-101125242-bk`

Same-turn live probes showed challenge-shaped responses and blank or minimal OCR-page bodies, which makes the missing `<pre>` look more consistent with upstream access variance than with a simple parser mismatch. This work should stay in importer-recovery and manual retry, not in the normal next-batch lane.

## Editorial note on thin-work review

The 3 newly landed works split into one stronger anchor and two lighter witnesses:

- `wellcome-aqkb26gx` was not flagged
- `nlm-61840770R` was flagged as `thin-reference` with `keep-but-review-retrieval-weight`
- `nlm-101526718` was flagged as `severe-thin-reference` with `keep-but-review-retrieval-weight`

That matters because this pass still improved the archive, but only the Wellcome botanical excursion should be treated as a full-strength new anchor.

## Current corpus totals

- registered works: `2720`
- chunked works: `1280`
- discovered works: `1432`
- failed works: `8`
- chunk records: `1675798`
- paragraph records: `1889599`

### By collection

- NLM Digital Collections: `403` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `930`
- uncovered frontier families: `865`
- depth frontier families: `175`
- failed-only frontier families: `4`
- herb candidates: `83965`
- chunk signals: `1273561`
- graph nodes: `84033`
- graph edges: `481045`
- accepted term families: `78626`
- review term families: `36`
- rejected term families: `3959`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62941`
- promotion candidates: `170`
- identity-review candidates: `32`
- secondary candidates: `58702`
- deprioritized candidates: `4037`

### Thin-work review

- total chunked works reviewed: `1280`
- flagged works: `158`
- severe thin works: `85`
- fragment flags: `23`
- reference flags: `97`
- multi-work-family flags: `77`

### Local footprint

- size: `11.38 GiB`
- files: `10989`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3270`
- `edition-family`: `1866`
- `work-summary`: `1280`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3267` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-aqkb26gx` - total `1`, kind `work-summary`, chunk `87`, paragraph `89`
  - `nlm-61840770R` - total `1`, kind `work-summary`, chunk `46`, paragraph `56`
  - `nlm-101526718` - total `1`, kind `work-summary`, chunk `36`, paragraph `68`

## Selector state after this pass

The refreshed selector moved again after this lane.

Current reserve signals:

- `wellcome-yss258s7` is now the selected Wellcome replacement after `wellcome-aqkb26gx` was consumed, but the official text endpoint still does not provide a usable current body in live checks
- `wellcome-gpp79sus` remains source-ready but should stay held back for dental drift
- `wellcome-qk5mzrqw` remains source-ready but should stay held back for trade, seamen-health, and travel-station drift
- `wellcome-ubh77647` still returns `404` on the official text endpoint
- the remaining selected NLM reserve is now more repeat-heavy than the cleaner practical family-medicine frontier leads
- `nlm-101125242` should stay outside the normal batch lane until the OCR-route variance is handled

## Recommended next move

Next manual-screening lane should prefer:

- `nlm-64230300R` - *The sick man's friend* - strong vegetable and botanical domestic-medicine fit
- `nlm-2578017R` - *Wright's Family medicine* - strong uncovered family-medicine witness from the live frontier
- `nlm-2557010R` - *Quincy's Lexicon-medicum* - optional third slot only if we deliberately want one more lexicon-family witness

Keep these as separate holds or retry lanes:

- `nlm-101125242` as importer-recovery and manual retry
- `wellcome-yss258s7` until the official text route serves a usable body
- `wellcome-gpp79sus` as a dental hold
- `wellcome-qk5mzrqw` as a travel and seamen-health hold
- `wellcome-ubh77647` as a `404` hold
