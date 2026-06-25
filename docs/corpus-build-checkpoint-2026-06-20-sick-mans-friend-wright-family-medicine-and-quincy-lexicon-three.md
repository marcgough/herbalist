# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next NLM-heavy lane completed after the botanical-excursion, family-guide, and lexicon-replacement pass.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added one botanical family-use manual, one large family-medicine witness, and one major lexicon anchor
- the derived corpus layers were rebuilt again at the new `1283`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- only 1 of the 3 newly landed works surfaced in `thin-work-review`, while the other 2 landed as full-scale reference witnesses
- the refreshed selector is now even more NLM-repeat-heavy, so the next manual lane should stay selective

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-64230300R` - *The sick man's friend* - `25` chunks, `71` paragraphs
- `nlm-2578017R` - *Wright's Family medicine* - `609` chunks, `947` paragraphs
- `nlm-2557010R` - *Quincy's Lexicon-medicum* - `5308` chunks, `5590` paragraphs

All 3 processed successfully.

## Editorial note on thin-work review

The 3 newly landed works split into one lighter witness and two full-scale anchors:

- `nlm-64230300R` was flagged as `severe-thin-reference` with `keep-but-review-retrieval-weight`
- `nlm-2578017R` was not flagged
- `nlm-2557010R` was not flagged

That matters because the botanical manual still helps coverage, but the heavier Wright and Quincy witnesses now carry most of the retrieval weight from this pass.

## Current corpus totals

- registered works: `2720`
- chunked works: `1283`
- discovered works: `1429`
- failed works: `8`
- chunk records: `1681740`
- paragraph records: `1896207`

### By collection

- NLM Digital Collections: `406` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `929`
- uncovered frontier families: `864`
- depth frontier families: `175`
- failed-only frontier families: `4`
- herb candidates: `84123`
- chunk signals: `1277518`
- graph nodes: `84191`
- graph edges: `481954`
- accepted term families: `78778`
- review term families: `36`
- rejected term families: `3965`
- seed-ready herb families: `124`
- supporting families: `144`
- herb profiles: `124`
- seed-review families: `63075`
- promotion candidates: `171`
- identity-review candidates: `33`
- secondary candidates: `58831`
- deprioritized candidates: `4040`

### Thin-work review

- total chunked works reviewed: `1283`
- flagged works: `159`
- severe thin works: `86`
- fragment flags: `23`
- reference flags: `98`
- multi-work-family flags: `78`

### Local footprint

- size: `11.41 GiB`
- files: `11014`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3273`
- `edition-family`: `1866`
- `work-summary`: `1283`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3270` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-64230300R` - total `1`, kind `work-summary`, chunk `25`, paragraph `71`
  - `nlm-2578017R` - total `1`, kind `work-summary`, chunk `609`, paragraph `947`
  - `nlm-2557010R` - total `1`, kind `work-summary`, chunk `5308`, paragraph `5590`

## Selector state after this pass

The refreshed selector moved again after this lane.

Current reserve signals:

- the selected NLM reserve is now `nlm-2566033RX2`, `nlm-61740710RX2`, `nlm-2561024R`, `nlm-9717182`, and `nlm-64230310R`
- `nlm-64230310R` is best treated as same-family depth after the new `nlm-64230300R` acquisition
- `nlm-9717182` remains a generic pharmacopoeia hold rather than a compelling immediate batch slot
- the Wellcome reserve still contains mostly no-text or editorial-hold cases, with `wellcome-yss258s7` still not yielding a usable live body
- `nlm-101125242` remains an importer-recovery and manual-retry lane

## Recommended next move

Next manual-screening lane should prefer:

- `nlm-2561024R` - *The Edinburgh new dispensatory* - strong practical pharmacopoeia and dispensatory witness
- `nlm-61740710RX2` - *Pharmacologia (Volume 2)* - strong deep reference and chemistry bridge
- `nlm-2566033RX2` - *The London medical dictionary (Volume 2)* - optional third slot only if we deliberately want another deep dictionary witness

Keep these as separate holds or slower lanes:

- `nlm-64230310R` as same-family depth
- `nlm-9717182` as a generic pharmacopoeia hold
- `nlm-101125242` as importer-recovery and manual retry
- `wellcome-yss258s7` until the official text route serves a usable body
- `wellcome-gpp79sus` as a dental hold
- `wellcome-qk5mzrqw` as a travel and seamen-health hold
- `wellcome-ubh77647` as a `404` hold
