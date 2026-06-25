# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the second broader practical-remedies widening move after the new `practical-remedies-reference-2026-06-20` profile was introduced.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added 3 uncovered family-physician witnesses that the broader profile still was not surfacing directly
- the derived corpus layers were rebuilt again at the new `1301`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the 3 newly landed works surfaced in `thin-work-review`, so the latest widening step improved practical breadth without adding a new thin-reference burden

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-64331080R` - *Family physician : or homoeopathic practice of medicine, adapted to domestic and professional use* - `45` chunks, `81` paragraphs
- `nlm-63620210R` - *The family physician : a description of disease and its treatment, with sixteen medical prescriptions made plain for general use* - `292` chunks, `296` paragraphs
- `nlm-64220260R` - *The family physician , or, The true art of healing the sick in all diseases whatever* - `388` chunks, `462` paragraphs

All 3 processed successfully.

## Editorial note on the lane

This pass intentionally continued the broader practical-remedies campaign rather than consuming the selected reserve immediately.

That mattered because the reserve still prefers some already represented practical-reference families, while this lane added three uncovered family-physician books with clearer first-witness value for later public retrieval.

It also validates the manual-screening hypothesis from the prior checkpoint: even after creating the broader profile, there are still meaningful uncovered practical manuals sitting outside the currently selected set.

## Thin-work review

None of the 3 newly landed works surfaced in `thin-work-review`.

That keeps the newest trio available as normal retrieval witnesses rather than lower-weight supplements.

For context from the immediately preceding broader-profile lane:

- `nlm-101513942` surfaced as `thin-general`
- `nlm-2571039R` stayed out of `thin-work-review`
- `nlm-61820150R` stayed out of `thin-work-review`

## Current corpus totals

- registered works: `2720`
- chunked works: `1301`
- discovered works: `1411`
- failed works: `8`
- chunk records: `1692778`
- paragraph records: `1910689`

### By collection

- NLM Digital Collections: `424` chunked of `696` total, with `266` still discovered and `6` download-failed
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total, with `1145` still discovered and `2` download-failed

### Derived signals

- edition families: `1866`
- actionable frontier families: `913`
- uncovered frontier families: `852`
- depth frontier families: `171`
- failed-only frontier families: `4`
- herb candidates: `84381`
- chunk signals: `1285948`
- graph nodes: `84449`
- graph edges: `485072`
- accepted term families: `79029`
- review term families: `36`
- rejected term families: `3971`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `63290`
- promotion candidates: `174`
- identity-review candidates: `34`
- secondary candidates: `59037`
- deprioritized candidates: `4045`

### Thin-work review totals

- total chunked works reviewed: `1301`
- flagged works: `163`
- severe thin works: `89`
- fragment flags: `23`
- reference flags: `101`
- multi-work-family flags: `80`

### Local footprint

- size: `11.47 GiB`
- files: `11163`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3291`
- `edition-family`: `1866`
- `work-summary`: `1301`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3288` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-64331080R` - total `1`, kind `work-summary`, chunk `45`, paragraph `81`
  - `nlm-63620210R` - total `1`, kind `work-summary`, chunk `292`, paragraph `296`
  - `nlm-64220260R` - total `1`, kind `work-summary`, chunk `388`, paragraph `462`

## Selector state after this pass

The refreshed selector is still running under `practical-remedies-reference-2026-06-20`.

Current reserve signals:

- the remaining selected NLM reserve is now `nlm-8206608`, `nlm-101306881`, `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182`
- `nlm-8206608` and `nlm-101306881` are the strongest remaining selected NLM holds if we decide to accept some depth-family reinforcement next
- `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182` remain slower dispensatory, botanic-principles, or generic pharmacopoeia depth holds
- the practical family-physician trio in this pass still did not come from the selected reserve, which confirms the broader practical-remedies profile is an improvement but is not yet fully catching the best uncovered manual-widening lane
- the selected Wellcome reserve remains more suitable for deliberate later reference passes than for a blind immediate widening batch

## Recommended next move

Next move should prefer one of these two paths:

1. Continue manual-screening for uncovered practical manuals, family physicians, guide-to-health books, and remedies references if the uncovered frontier still contains clearly book-scale witnesses.
2. If we want a less manual next pass, take the strongest remaining selected NLM depth pair first:
   - `nlm-8206608`
   - `nlm-101306881`

The raw top uncovered frontier should still not be trusted directly, and `nlm-2561026R`, `nlm-64230310R`, plus `nlm-9717182` should remain slower holds until the broader practical-manual lane becomes less available.
