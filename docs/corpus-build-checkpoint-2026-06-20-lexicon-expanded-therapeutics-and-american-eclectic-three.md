# Corpus Build Checkpoint - 2026-06-20

## Summary

This checkpoint captures the next source-ready Wellcome trio completed after the London dispensatory and botanical materia-medica follow-up pass.

Main outcomes:

- 3 additional rights-cleared Wellcome works were acquired and chunked successfully
- the trio added one broad lexicon witness, one larger expanded Phillips therapeutics volume, and one American eclectic materia-medica book
- the derived corpus layers were rebuilt again at the new `1259`-work state
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 3 new works
- none of the new works were flagged in `thin-work-review`
- the evidence builder hardening from earlier in the cycle remains in place and is now proven again at the larger signal volume

## Three newly completed Wellcome works

The following 3 works are now acquired and chunked successfully:

- `wellcome-ybfdn8ze` - *Lexicon medicum, or, Medical dictionary* - `8696` chunks, `8784` paragraphs
- `wellcome-xvhvxkhz` - *Materia medica and therapeutics : vegetable kingdom, organic compounds, animal kingdom* - `2613` chunks, `2652` paragraphs
- `wellcome-se3qvyvq` - *The American eclectic materia medica* - `1611` chunks, `1619` paragraphs

All 3 processed successfully.

## Batch characteristics

Taken together, this trio did three useful jobs for the archive:

- added one more large botany-and-materia-medica dictionary witness that remains source-grounded and searchable
- deepened the Charles D.F. Phillips therapeutics lane with a broader companion volume than the earlier vegetable-kingdom witness alone
- added an American eclectic materia-medica witness that keeps the corpus anchored in practical plant-centered reference material rather than only pharmacopoeia administration

## Evidence-layer note

The earlier `build-corpus-evidence.mjs` fix now matters operationally.

The builder streams `chunk-signals.jsonl` records directly to disk instead of accumulating the full signal set in memory first, which removed the heap ceiling that appeared once the evidence layer crossed roughly 1.24 million signal rows.

## Editorial note on thin-work review

None of the 3 newly landed works were flagged in `thin-work-review`.

That matters because this pass added substantial dictionary, materia-medica, and practical-reference weight without increasing the current thin-work burden.

## Current corpus totals

- registered works: `2720`
- chunked works: `1259`
- discovered works: `1454`
- failed works: `7`
- chunk records: `1644807`
- paragraph records: `1857736`

### By collection

- NLM Digital Collections: `396` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `836` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `946`
- uncovered frontier families: `879`
- depth frontier families: `178`
- herb candidates: `83427`
- chunk signals: `1253991`
- graph nodes: `83495`
- graph edges: `478128`
- accepted term families: `78121`
- review term families: `36`
- rejected term families: `3936`
- seed-ready herb families: `124`
- supporting families: `145`
- herb profiles: `124`
- seed-review families: `62534`
- promotion candidates: `166`
- identity-review candidates: `32`
- secondary candidates: `58321`
- deprioritized candidates: `4015`

### Thin-work review

- total chunked works reviewed: `1259`
- flagged works: `153`
- severe thin works: `82`
- fragment flags: `23`
- reference flags: `94`
- multi-work-family flags: `74`

### Local footprint

- size: `11.20 GiB`
- files: `10814`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3249`
- `edition-family`: `1866`
- `work-summary`: `1259`
- `herb-profile`: `124`

Refresh status after this pass:

- `3` work-summary documents were updated into the current archive state
- exact work-id retrieval was re-verified for:
  - `wellcome-ybfdn8ze` - total `1`, kind `work-summary`, chunk `8696`, paragraph `8784`
  - `wellcome-xvhvxkhz` - total `1`, kind `work-summary`, chunk `2613`, paragraph `2652`
  - `wellcome-se3qvyvq` - total `1`, kind `work-summary`, chunk `1611`, paragraph `1619`

Operational note:

- a stale failed ingest process briefly left a write lock on the separate corpus database; stopping only that stale ingest and rerunning `corpus-memory:ingest` cleared the lock and refreshed the archive cleanly without touching the live server

## Selector state after this pass

The refreshed selector remains noisy at the very top, so the next lane should stay manually screened.

Current route-ready reserve:

- `wellcome-z367wx5k`
- `wellcome-xsx7hr3e`
- `wellcome-esx5mvqp`

Current route-bad or route-fragile holds:

- `wellcome-ubh77647` - official text endpoint currently returns `404`
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

## Recommended next move

Next Wellcome-led manually screened lane should prefer:

- `wellcome-xsx7hr3e`
- `wellcome-esx5mvqp`
- optional third slot `wellcome-z367wx5k`

Why this is the cleaner next lane now:

- `wellcome-xsx7hr3e` is source-ready and extends the American lexicon lane without leaning on the already very heavy Hooper lexicon family
- `wellcome-esx5mvqp` is source-ready and adds practical prescription and dose-oriented reference coverage
- `wellcome-z367wx5k` is source-ready but should stay optional because it is another deep repeat inside the already saturated `Lexicon medicum` family
