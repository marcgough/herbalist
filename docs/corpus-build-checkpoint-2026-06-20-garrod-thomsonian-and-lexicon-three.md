# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next source-ready Wellcome trio completed after the American medical lexicon, book of prescriptions, and Hooper lexicon follow-up pass.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the trio added one practical materia-medica and therapeutics manual, one Thomsonian-principles medicine and materia-medica bridge, and one further broad lexicon witness
- the derived corpus layers were rebuilt again at the new `1265`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the new works were flagged in `thin-work-review`
- the refresh cycle exposed and then resolved a stale-writer lock pattern without interrupting the live `Corpus Memory` server

## Three newly completed Wellcome works

The following 3 works are now acquired and chunked successfully:

- `wellcome-bjnepyda` - *The essentials of materia medica and therapeutics* - `1357` chunks, `1375` paragraphs
- `wellcome-bkhg7djn` - *The practice of medicine on Thomsonian principles : and a materia medica, adapted to the work* - `1612` chunks, `1627` paragraphs
- `wellcome-gy79dgeq` - *Lexicon medicum; or medical dictionary* - `8120` chunks, `8213` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this trio did three useful jobs for the archive:

- added a practical materia-medica and therapeutics manual with strong reference density
- added a Thomsonian-principles bridge that keeps the corpus connected to botanic and reform-medicine traditions rather than only institutional pharmacopoeia lanes
- added one further lexicon witness as a broad searchable reference anchor after the two more practice-facing titles were secured

## Editorial note on thin-work review

None of the 3 newly landed works were flagged in `thin-work-review`.

That matters because this pass added substantial practical-reference weight without increasing the current thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1265`
- discovered works: `1448`
- failed works: `7`
- chunk records: `1668178`
- paragraph records: `1881393`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `842` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `942`
- uncovered frontier families: `878`
- depth frontier families: `175`
- herb candidates: `83671`
- chunk signals: `1269805`
- graph nodes: `83739`
- graph edges: `479631`
- accepted term families: `78342`
- review term families: `36`
- rejected term families: `3954`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62715`
- promotion candidates: `169`
- identity-review candidates: `32`
- secondary candidates: `58486`
- deprioritized candidates: `4028`

### Thin-work review

- total chunked works reviewed: `1265`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `11.334 GiB`
- files: `10864`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3255`
- `edition-family`: `1866`
- `work-summary`: `1265`
- `herb-profile`: `124`

Refresh status after this pass:

- the refreshed archive state already contained the 3 new work summaries when checked after the timed-out ingest window
- exact work-id retrieval was re-verified for:
  - `wellcome-bjnepyda` - total `1`, kind `work-summary`, chunk `1357`, paragraph `1375`
  - `wellcome-bkhg7djn` - total `1`, kind `work-summary`, chunk `1612`, paragraph `1627`
  - `wellcome-gy79dgeq` - total `1`, kind `work-summary`, chunk `8120`, paragraph `8213`
- a timed-out ingest left two stale writer processes holding the database lock; stopping only those two writers cleared the lock while the live `Corpus Memory` server continued running normally

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-aw843fyz`
- `wellcome-ac4j48ht`
- optional fallback `wellcome-gecedbpt`

Current route-bad or route-fragile holds:

- `wellcome-ubh77647` - official text endpoint still returns `404`
- `wellcome-takhmyez`
- `wellcome-kw7su3cf`
- `wellcome-jkjv35ym`
- `wellcome-f6f97kmm`
- `wellcome-ww8gtwfv`
- `wellcome-xtum85vk`
- `wellcome-bn68mk4f`
- `wellcome-n2yp92tq`
- `wellcome-vs9d8y7g`
- `wellcome-x9vpr68y`
- `wellcome-kpjgpmdd`
- `wellcome-j98e5bzy`

Cross-collection follow-up candidate:

- `nlm-101526713` - official NLM OCR route is present and the title remains a broad botany and materia-medica dictionary witness if we want a non-Wellcome lane in parallel

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-aw843fyz`
- `wellcome-ac4j48ht`
- optional third slot `wellcome-gecedbpt`

Why this is the cleaner next lane now:

- `wellcome-aw843fyz` is source-ready and strongly aligned with botanic and reform-medicine family-reference use
- `wellcome-ac4j48ht` is source-ready and adds a compact pharmacopoeia witness that can enrich formula and preparation coverage
- `wellcome-gecedbpt` is source-ready, but it is older and Latin-leading, so it should stay optional behind the two more immediately practical titles
