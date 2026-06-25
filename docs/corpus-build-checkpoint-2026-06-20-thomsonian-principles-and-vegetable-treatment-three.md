# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next NLM lane completed after the manual botanic-principles frontier pass and the tuned practical-reference selector refresh.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added one Thomsonian historical bridge, one explicit Thomsonian guide-to-health manual, and one vegetable-treatment family physician witness
- the tuned profile `botanical-practical-reference-2026-06-20` successfully rescued one of those works back into the selected reserve before acquisition
- the derived corpus layers were rebuilt again at the new `1292`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- only 1 of the 3 newly landed works surfaced in `thin-work-review`, while the other 2 landed as full-scale uncovered practical witnesses

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-2575001R` - *Historical sketch of the Thomsonian system of the practice of medicine on botanical principles* - `21` chunks, `28` paragraphs
- `nlm-64210710R` - *A guide to health* - `258` chunks, `462` paragraphs
- `nlm-63570030R` - *The Indian doctor's practice of medicine* - `464` chunks, `800` paragraphs

All 3 processed successfully.

## Editorial note on thin-work review

The 3 newly landed works split into one lighter witness and two full-scale anchors:

- `nlm-2575001R` was flagged as `severe-thin-reference` with `keep-but-review-retrieval-weight`
- `nlm-64210710R` was not flagged
- `nlm-63570030R` was not flagged

That matters because the historical Thomsonian bridge should stay available for retrieval and citation, but the heavier Colby and Daily books now carry most of the practical retrieval weight from this pass.

## Current corpus totals

- registered works: `2720`
- chunked works: `1292`
- discovered works: `1420`
- failed works: `8`
- chunk records: `1689755`
- paragraph records: `1906676`

### By collection

- NLM Digital Collections: `415` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `921`
- uncovered frontier families: `858`
- depth frontier families: `173`
- failed-only frontier families: `4`
- herb candidates: `84271`
- chunk signals: `1283496`
- graph nodes: `84339`
- graph edges: `483487`
- accepted term families: `78919`
- review term families: `36`
- rejected term families: `3971`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `63142`
- promotion candidates: `171`
- identity-review candidates: `34`
- secondary candidates: `58895`
- deprioritized candidates: `4042`

### Thin-work review

- total chunked works reviewed: `1292`
- flagged works: `162`
- severe thin works: `89`
- fragment flags: `23`
- reference flags: `101`
- multi-work-family flags: `79`

### Local footprint

- size: `11.46 GiB`
- files: `11088`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3282`
- `edition-family`: `1866`
- `work-summary`: `1292`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3279` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-2575001R` - total `1`, kind `work-summary`, chunk `21`, paragraph `28`
  - `nlm-64210710R` - total `1`, kind `work-summary`, chunk `258`, paragraph `462`
  - `nlm-63570030R` - total `1`, kind `work-summary`, chunk `464`, paragraph `800`

## Selector state after this pass

The refreshed selector is now running under `botanical-practical-reference-2026-06-20`.

Current reserve signals:

- the tuned profile did rescue `nlm-2575001R` into the selected reserve before acquisition, which confirmed the earlier suspicion that the stricter botanical profile was suppressing useful botanic-principles material too aggressively
- after consuming that lane, the remaining selected NLM reserve is now `nlm-64230310R`, `nlm-2561026R`, and `nlm-9717182`
- `nlm-64230310R` is still best treated as same-family depth rather than immediate breadth
- `nlm-2561026R` remains a repeat-heavy Edinburgh dispensatory witness
- `nlm-9717182` remains a generic pharmacopoeia hold rather than a compelling practical widening move
- the selected Wellcome reserve remains dominated by route-bad, no-text, or editorial-hold material and was not reopened in this pass

## Recommended next move

Next manual-screening move should prefer one of these two paths:

- continue hand-screening uncovered NLM botanic-principles, Thomsonian, medicinal-plants, and vegetable-treatment families under the tuned profile
- or tighten the tuned profile again so it keeps the practical rescues but pushes more aggressively against repeat dispensatories and the still-noisy domestic-medicine top frontier

Do not trust the raw top uncovered frontier list yet. It is still dominated by Aristotle master-piece variants, sexual-physiology material, and other off-mission domestic-medicine noise when read without the curated selector lens.

