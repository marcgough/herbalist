# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next manually screened uncovered practical-manual widening move after the second family-physician pass under the broader `practical-remedies-reference-2026-06-20` profile.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added broad domestic-medicine and household-surgery witnesses that were stronger uncovered breadth than the remaining selected reserve
- the derived corpus layers were rebuilt again at the new `1304`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the 3 newly landed works surfaced in `thin-work-review`, so the latest widening step improved practical breadth without adding a new thin-reference burden

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-2555050R` - *Domestic medicine, or Poor man's friend : in the hours of affliction, pain and sickness* - `259` chunks, `281` paragraphs
- `nlm-63570340R` - *The families' new guide to health ... together with an exposition of the Thomsonian preparations of medicine ...* - `275` chunks, `382` paragraphs
- `nlm-63360780R` - *The American cyclopaedia of domestic medicine and household surgery ...* - `4104` chunks, `4537` paragraphs

All 3 processed successfully.

## Editorial note on the lane

This pass intentionally continued the manually screened uncovered practical-manual campaign rather than consuming the selected reserve immediately.

That mattered because the reserve still prefers some already represented practical-reference families, while this lane added three book-scale domestic-medicine witnesses with clearer first-witness value for later public retrieval.

It also strengthens the same editorial lesson from the earlier broader-profile checkpoints: even after building a broader selector profile, there are still meaningful uncovered practical manuals sitting outside the currently selected set.

## Thin-work review

None of the 3 newly landed works surfaced in `thin-work-review`.

That keeps the newest trio available as normal retrieval witnesses rather than lower-weight supplements.

## Current corpus totals

- registered works: `2720`
- chunked works: `1304`
- discovered works: `1408`
- failed works: `8`
- chunk records: `1697416`
- paragraph records: `1915889`

### By collection

- NLM Digital Collections: `427` chunked of `696` total, with `263` still discovered and `6` download-failed
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total, with `1145` still discovered and `2` download-failed

### Derived signals

- edition families: `1866`
- actionable frontier families: `911`
- uncovered frontier families: `852`
- depth frontier families: `171`
- failed-only frontier families: `4`
- herb candidates: `84402`
- chunk signals: `1289462`
- graph nodes: `84470`
- graph edges: `485357`
- accepted term families: `79049`
- review term families: `36`
- rejected term families: `3972`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `63290`
- promotion candidates: `175`
- identity-review candidates: `34`
- secondary candidates: `59036`
- deprioritized candidates: `4045`

### Thin-work review totals

- total chunked works reviewed: `1304`
- flagged works: `163`
- severe thin works: `89`
- fragment flags: `23`
- reference flags: `101`
- multi-work-family flags: `80`

### Local footprint

- size: `11.5 GiB`
- files: `11188`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3294`
- `edition-family`: `1866`
- `work-summary`: `1304`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3291` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-2555050R` - total `1`, kind `work-summary`, chunk `259`, paragraph `281`
  - `nlm-63570340R` - total `1`, kind `work-summary`, chunk `275`, paragraph `382`
  - `nlm-63360780R` - total `1`, kind `work-summary`, chunk `4104`, paragraph `4537`

## Selector state after this pass

The refreshed selector is still running under `practical-remedies-reference-2026-06-20`.

Current reserve signals:

- the remaining selected NLM reserve is now `nlm-8206608`, `nlm-101306881`, `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182`
- `nlm-8206608` and `nlm-101306881` are the strongest remaining selected NLM holds if we decide to accept some depth-family reinforcement next
- `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182` remain slower dispensatory, botanic-principles, or generic pharmacopoeia depth holds
- the practical-manual trio in this pass still did not come from the selected reserve, which confirms the broader practical-remedies profile is an improvement but is not yet fully catching the best uncovered manual-widening lane
- the selected Wellcome reserve remains more suitable for deliberate later reference passes than for a blind immediate widening batch

## Recommended next move

Next move should prefer one of these two paths:

1. Continue manual-screening for uncovered practical manuals, family physicians, guide-to-health books, poor-man's-friend shapes, household-surgery books, and remedies references if the uncovered frontier still contains clearly book-scale witnesses.
2. If we want a less manual next pass, take the strongest remaining selected NLM depth pair first:
   - `nlm-8206608`
   - `nlm-101306881`

The raw top uncovered frontier should still not be trusted directly, and `nlm-2561026R`, `nlm-64230310R`, plus `nlm-9717182` should remain slower holds until the broader practical-manual lane becomes less available.
