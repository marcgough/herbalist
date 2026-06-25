# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures two consecutive curated Wellcome passes completed after the experimental, prescriber, and plates checkpoint was written.

Main outcomes:

- 6 additional rights-cleared Wellcome books were acquired and chunked successfully across two clean source-ready slices
- the first slice emphasized plant-centered therapeutics, general lookup depth, and botanical memoir material
- the second slice extended the Phillips therapeutics lane, added one more controlled lexicon witness, and widened the multilingual edge with a Latin botanical materia-medica work
- the derived corpus layers were rebuilt after each pass
- `Corpus Memory` was refreshed and now reflects `1165` work summaries

## Wellcome reference and botanica six completed

The following 6 Wellcome works are now acquired and chunked successfully:

- `wellcome-jd7wwg5w` - *Materia medica and therapeutics : vegetable kingdom* - `1497` chunks
- `wellcome-x9wbqn69` - *Lexicon medicum* - `8801` chunks
- `wellcome-y6chc2az` - *Memoir of the late William Wright, M.D.* - `893` chunks
- `wellcome-je7nxmph` - *Materia medica and therapeutics : vegetable kingdom organic compounds animal kingdom* - `2615` chunks
- `wellcome-zw57j8sb` - *Quincy's Lexicon-medicum* - `5269` chunks
- `wellcome-kptt2h24` - *Materia medica botanica ...* - `467` chunks

All 6 processed successfully through the official Wellcome text path.

## Batch characteristics

Taken together, these two passes broadened the archive along three useful axes:

- deeper public-reference lookup through two controlled dictionary witnesses
- stronger therapeutics continuity through the Phillips materia-medica line
- a wider botanical and multilingual edge without dropping the book-only standard

That kept the corpus growing at broad scale while still steering away from the weaker tract, supplement, administrative, and article-reprint shapes that remain in the queue.

## Current corpus totals

- registered works: `2720`
- chunked works: `1165`
- discovered works: `1548`
- failed works: `7`
- chunk records: `1507939`
- paragraph records: `1710824`

### By collection

- NLM Digital Collections: `374` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `764` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `1013`
- uncovered frontier families: `930`
- depth frontier families: `197`
- herb candidates: `79890`
- high-confidence herb candidates: `5107`
- medium-confidence herb candidates: `22719`
- low-confidence herb candidates: `52064`
- seed-ready herb families: `124`
- supporting families: `136`
- herb profiles: `124`
- seed-review families: `59825`
- promotion candidates: `134`
- identity-review candidates: `26`
- secondary candidates: `55741`
- deprioritized candidates: `3924`
- thin-work review flags: `144`

### Local footprint

- size: `10.38 GiB`
- files: `10033`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3155`
- `edition-family`: `1866`
- `work-summary`: `1165`
- `herb-profile`: `124`

Latest ingest result after these passes:

- received: `3155`
- inserted: `3`
- updated: `3152`
- pruned: `0`

Retrieval checks confirmed via exact work-id queries that the newly added works are visible inside `Corpus Memory`, including:

- `wellcome-jd7wwg5w`
- `wellcome-x9wbqn69`
- `wellcome-y6chc2az`
- `wellcome-je7nxmph`
- `wellcome-zw57j8sb`
- `wellcome-kptt2h24`

## Lane status after these passes

Completed in these passes:

- `wellcome-jd7wwg5w`
- `wellcome-x9wbqn69`
- `wellcome-y6chc2az`
- `wellcome-je7nxmph`
- `wellcome-zw57j8sb`
- `wellcome-kptt2h24`

Manual retry lane still includes:

- `wellcome-bkdvy7wy`
- `wellcome-gj4s5ed2`

Existing separate retry lane:

- `nlm-2661459RX5`
- `nlm-2661459RX6`
- `nlm-64210320R`

## Next move

The next refined Wellcome forward lane now lives at:

- `corpus/review/curated-reference-selector/botanical-forward-shortlist-2026-06-19-after-twenty-third-wellcome-pass.md`

That shortlist now shifts the immediate slice toward one family-physician bridge, one Chinese materia-medica note set, and one German-leading deep reference while continuing to hold back very deep lexicon repeats, tract-like witnesses, supplement-only volumes, current Wellcome `404` text-endpoint cases, and reprinted article bundles that are weaker against the book-only standard.
