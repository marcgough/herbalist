# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next mixed Wellcome and NLM lane completed after the pharmaceutical-formulae and family-physician pass.

Main outcomes:

- 3 additional rights-cleared works were acquired and chunked successfully across Wellcome and NLM
- the lane added one broad study-of-physick bridge, one strong hydropathic family physician, and one lighter modern family physician witness
- the derived corpus layers were rebuilt again at the new `1277`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- 2 of the 3 newly landed works stayed out of `thin-work-review`, while one lighter family-physician witness surfaced a new `thin-general` flag
- the refreshed selector removed `wellcome-yhv25daq` from reserve and introduced `wellcome-aqkb26gx` as the next selected Wellcome replacement

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `wellcome-yhv25daq` - *A method of studying physick* - `530` chunks, `549` paragraphs
- `nlm-63950560R` - *The hydropathic family physician* - `145` chunks, `181` paragraphs
- `nlm-2672001R` - *The modern family physician* - `42` chunks, `54` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this lane widened the corpus in a useful but mixed way:

- `wellcome-yhv25daq` adds a broad practical bridge across botany, pharmacy, and general medical study
- `nlm-63950560R` adds another strong domestic-medicine and family-physician witness with book-scale density
- `nlm-2672001R` adds a real but much lighter family-physician witness that still helps coverage, though not at the same retrieval weight as the stronger two

## Editorial note on thin-work review

The 3 newly landed works split into two stronger anchors and one lighter witness:

- `wellcome-yhv25daq` was not flagged
- `nlm-63950560R` was not flagged
- `nlm-2672001R` was flagged as `thin-general` with `manual-review`

That matters because this pass still improved the archive, but the third title should stay visible as a supporting domestic-medicine witness rather than a full-strength anchor.

## Current corpus totals

- registered works: `2720`
- chunked works: `1277`
- discovered works: `1436`
- failed works: `7`
- chunk records: `1675629`
- paragraph records: `1889386`

### By collection

- NLM Digital Collections: `401` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `849` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `931`
- uncovered frontier families: `868`
- depth frontier families: `174`
- herb candidates: `83960`
- chunk signals: `1273475`
- graph nodes: `84028`
- graph edges: `480993`
- accepted term families: `78621`
- review term families: `36`
- rejected term families: `3959`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62936`
- promotion candidates: `170`
- identity-review candidates: `32`
- secondary candidates: `58698`
- deprioritized candidates: `4036`

### Thin-work review

- total chunked works reviewed: `1277`
- flagged works: `156`
- severe thin works: `84`
- fragment flags: `23`
- reference flags: `95`
- multi-work-family flags: `75`

### Local footprint

- size: `11.38 GiB`
- files: `10964`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3267`
- `edition-family`: `1866`
- `work-summary`: `1277`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new work-summary documents were inserted
- `3264` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `wellcome-yhv25daq` - total `1`, kind `work-summary`, chunk `530`, paragraph `549`
  - `nlm-63950560R` - total `1`, kind `work-summary`, chunk `145`, paragraph `181`
  - `nlm-2672001R` - total `1`, kind `work-summary`, chunk `42`, paragraph `54`

## Selector state after this pass

The refreshed selector moved again after this lane.

Current selected reserve signals:

- `wellcome-aqkb26gx` is now the new selected Wellcome replacement after `wellcome-yhv25daq` was consumed, and its official Wellcome text endpoint returns `200 text/plain`
- `wellcome-gpp79sus` remains source-ready but should stay held back for dental drift
- `wellcome-qk5mzrqw` remains source-ready but should stay held back for trade, seamen-health, and travel-station drift
- `wellcome-ubh77647` still returns `404` on the official text endpoint
- `nlm-61840770R` and `nlm-101125242` both remain viable NLM OCR-route candidates for the next manual screen
- `nlm-101526718` remains present as an optional browser-assisted lexicon repeat rather than a must-take next slot

## Recommended next move

Next manual-screening lane should prefer:

- `wellcome-aqkb26gx`
- `nlm-61840770R`
- `nlm-101125242`

Keep these as optional or held:

- `nlm-101526718` only if we deliberately want one more lexicon-family repeat
- `wellcome-gpp79sus` as a dental hold
- `wellcome-qk5mzrqw` as a travel and seamen-health hold
