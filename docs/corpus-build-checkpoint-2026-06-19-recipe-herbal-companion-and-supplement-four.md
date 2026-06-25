# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next mixed acquisition pass completed after the route-screened practical, pharmacopoeia, and flora four checkpoint.

Main outcomes:

- 4 additional rights-cleared works were acquired and chunked successfully
- the pass widened the corpus with one uncovered recipe-book witness, one family-oriented herbal reference, one third companion volume in the American practice lane, and one large route-proven pharmacopoeia supplement
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works
- one newly added work, `nlm-101232588`, was immediately surfaced by the thin-work review as a thin general witness, which is useful editorial context rather than a hidden retrieval surprise

## Recipe, herbal, companion, and supplement four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-101232588` - *[Medical recipe book]* - `47` chunks
- `nlm-7703236` - *The Indian vegetable family instructer ...* - `297` chunks
- `nlm-64210120RX3` - *The American practice of medicine ... (Volume 3)* - `724` chunks
- `wellcome-nhx2ne6y` - *Gray's supplement to the pharmacopoeia ...* - `3473` chunks

All 4 processed successfully.

## Batch characteristics

Taken together, this pass did four different jobs for the archive:

- added one uncovered recipe-book witness with direct practical-remedy relevance
- strengthened the herbal household-reference side with a medicinal-qualities and recipes book
- deliberately continued the already-open American practice companion lane into Volume 3
- added one route-proven Wellcome pharmacopoeia supplement with strong dispensatory and formula coverage

## Editorial note on thin-work review

The new recipe-book witness `nlm-101232588` was immediately flagged in the thin-work review:

- review class: `thin-general`
- chunk count: `47`
- paragraph count: `67`
- recommendation: `manual-review`

That does not make it a bad acquisition. It means the witness is valuable enough to keep, but should later be weighted or presented with more care than a large full-scale manual.

## Current corpus totals

- registered works: `2720`
- chunked works: `1208`
- discovered works: `1505`
- failed works: `7`
- chunk records: `1553308`
- paragraph records: `1764575`

### By collection

- NLM Digital Collections: `393` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `788` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `980`
- uncovered frontier families: `902`
- depth frontier families: `190`
- herb candidates: `80919`
- high-confidence herb candidates: `5209`
- medium-confidence herb candidates: `23138`
- low-confidence herb candidates: `52572`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60611`
- promotion candidates: `145`
- identity-review candidates: `28`
- secondary candidates: `56500`
- deprioritized candidates: `3938`

### Local footprint

- size: `10.656 GiB`
- files: `10391`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3198`
- `edition-family`: `1866`
- `work-summary`: `1208`
- `herb-profile`: `124`

Refresh status after this pass:

- `4` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `nlm-101232588`
  - `nlm-7703236`
  - `nlm-64210120RX3`
  - `wellcome-nhx2ne6y`

## Selector state after this pass

The refreshed botanical-reference selector now shows a different shape than the earlier recipe-and-herbal shortlist:

- the NLM side has narrowed back toward repeat-heavy pharmacopoeia, dictionary, and dispensatory witnesses, plus one foreign-language-leading uncovered herbal work
- the Wellcome side now includes another route-proven reserve candidate, `wellcome-ydxpwjpa`
- the known no-text Wellcome holds remain unchanged for `wellcome-takhmyez`, `wellcome-kw7su3cf`, and `wellcome-ww8gtwfv`

## Next move

The next lane should remain manually screened.

The strongest current shape is likely:

- one route-proven Wellcome reference witness
- one standards-oriented NLM pharmacopoeia witness
- optional third slot only if it deepens a family we still actively want rather than merely padding repeat depth
