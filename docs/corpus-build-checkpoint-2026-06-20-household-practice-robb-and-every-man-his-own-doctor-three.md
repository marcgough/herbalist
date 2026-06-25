# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next manually screened uncovered practical-manual widening move after the domestic-medicine and household-surgery trio.

Main outcomes:

- 3 additional rights-cleared NLM works were acquired and chunked successfully
- the lane added one large household-practice witness and two substantial family-physician books from uncovered families
- the derived corpus layers were rebuilt again at the new `1307`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the 3 newly landed works surfaced in `thin-work-review`, so the latest widening step improved practical breadth without adding a new thin-reference burden

## Three newly completed works

The following 3 works are now acquired and chunked successfully:

- `nlm-63620760R` - *Wood's household practice of medicine, hygiene and surgery : a practical treatise for the use of families, travelers, seamen, miners, and others* - `5057` chunks, `5115` paragraphs
- `nlm-63611310R` - *Robb & Co.'s family physician : a work on domestic medicines, designed to show how to have health, which is equivalent to time and money* - `3081` chunks, `3664` paragraphs
- `nlm-63620740R` - *The family physician, or, Every man his own doctor : in three parts : together with the history, causes, symptoms and treatment of Asiatic cholera, a glossary, explaining the most difficult words that occur in medical science, and a copious index and appendix* - `1498` chunks, `2151` paragraphs

All 3 processed successfully.

## Editorial note on the lane

This pass intentionally continued the manually screened uncovered practical-manual campaign rather than consuming the selected reserve immediately.

That mattered because it added one full-scale household-practice reference and two uncovered family-physician witnesses that remain easier to justify as first-witness breadth than the current selected reserve.

At the same time, this pass also suggests the remaining uncovered lane is getting lighter and more mixed. The cleaner uncovered leftovers now lean more toward almanac, receipt-book, conduct, or housekeeping-adjacent shapes than to another obvious trio of large practical medical books.

## Thin-work review

None of the 3 newly landed works surfaced in `thin-work-review`.

That keeps the newest trio available as normal retrieval witnesses rather than lower-weight supplements.

## Current corpus totals

- registered works: `2720`
- chunked works: `1307`
- discovered works: `1405`
- failed works: `8`
- chunk records: `1707052`
- paragraph records: `1926819`

### By collection

- NLM Digital Collections: `430` chunked of `696` total, with `260` still discovered and `6` download-failed
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `850` chunked of `1997` total, with `1145` still discovered and `2` download-failed

### Derived signals

- edition families: `1866`
- actionable frontier families: `908`
- uncovered frontier families: `848`
- depth frontier families: `170`
- failed-only frontier families: `4`
- herb candidates: `84507`
- chunk signals: `1296598`
- graph nodes: `84575`
- graph edges: `486264`
- accepted term families: `79049`
- review term families: `36`
- rejected term families: `3972`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `63309`
- promotion candidates: `113`
- identity-review candidates: `23`
- secondary candidates: `58772`
- deprioritized candidates: `4401`

### Thin-work review totals

- total chunked works reviewed: `1307`
- flagged works: `163`
- severe thin works: `89`
- fragment flags: `23`
- reference flags: `101`
- multi-work-family flags: `80`

### Local footprint

- size: `11.53 GiB`
- files: `11213`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3297`
- `edition-family`: `1866`
- `work-summary`: `1307`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` new retrieval documents were inserted
- `3294` existing retrieval documents were updated during the full refresh
- exact work-id retrieval was re-verified for:
  - `nlm-63620760R` - total `1`, kind `work-summary`, chunk `5057`, paragraph `5115`
  - `nlm-63611310R` - total `1`, kind `work-summary`, chunk `3081`, paragraph `3664`
  - `nlm-63620740R` - total `1`, kind `work-summary`, chunk `1498`, paragraph `2151`

## Selector state after this pass

The refreshed selector is still running under `practical-remedies-reference-2026-06-20`.

Current reserve signals:

- the remaining selected NLM reserve is still `nlm-8206608`, `nlm-101306881`, `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182`
- `nlm-8206608` and `nlm-101306881` are the strongest remaining selected NLM holds if we decide to accept some deliberate depth-family reinforcement next
- `nlm-2561026R`, `nlm-64230310R`, and `nlm-9717182` remain slower dispensatory, botanic-principles, or generic pharmacopoeia depth holds
- the latest practical-manual trio still did not come from the selected reserve, which confirms the broader practical-remedies profile is useful but still not catching the best uncovered manual-widening lane automatically
- the selected Wellcome reserve remains more suitable for deliberate later reference passes than for a blind immediate widening batch

## Recommended next move

Next move should prefer one of these two paths:

1. Continue manual-screening for one more uncovered practical-manual lane from the cleaner remaining NLM cluster, centered on lighter but still legitimate witnesses such as `nlm-101178768`, `nlm-2702091R`, `nlm-101172762`, and `nlm-2484057R`.
2. If we want a less manual next pass, take the strongest remaining selected NLM depth pair first:
   - `nlm-8206608`
   - `nlm-101306881`

The raw top uncovered frontier should still not be trusted directly, and the noisier Aristotle, sexual-physiology, veterinary-mixed, and occult-leaning titles should continue to stay out of the immediate lane.
