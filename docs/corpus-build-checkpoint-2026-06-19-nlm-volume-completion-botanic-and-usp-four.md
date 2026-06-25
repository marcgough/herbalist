# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next NLM-led acquisition pass completed after the therapeutics, domestic, hygiene, and repertory four checkpoint.

Main outcomes:

- 4 additional rights-cleared NLM works were acquired and chunked successfully
- the pass deliberately completed two useful companion-volume lanes while still widening the archive with one substantial botanic-medicine witness and one pharmacopoeia key
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works
- the botanical-reference selector profile was then tightened to suppress several known route-bad or low-value Wellcome witnesses and one lecture-shaped phrase before the next manual screen

## NLM volume completion, botanic medicine, and U.S.P. key four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-101509190X2` - *General therapeutics and materia medica : adapted for a medical textbook (Volume 2)* - `1813` chunks
- `nlm-64210120RX2` - *The American practice of medicine ... (Volume 2)* - `2157` chunks
- `nlm-61650830R` - *An improved system of botanic medicine ...* - `1324` chunks
- `nlm-9804174` - *The Era key to the U.S.P. ...* - `149` chunks

All 4 processed successfully through the current official NLM acquisition path.

## Batch characteristics

Taken together, this pass strengthened the archive in four deliberate ways:

- it completed the second volume of a large therapeutics lane already opened in the previous pass
- it completed the second volume of the American practice lane already opened in the previous pass
- it added one full botanic-medicine reference with strong topical overlap for later herb-level retrieval
- it added one compact pharmacopoeia key with common names, synonyms, and dose structure

## Current corpus totals

- registered works: `2720`
- chunked works: `1200`
- discovered works: `1513`
- failed works: `7`
- chunk records: `1539500`
- paragraph records: `1749272`

### By collection

- NLM Digital Collections: `388` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `785` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `985`
- uncovered frontier families: `905`
- depth frontier families: `193`
- herb candidates: `80560`
- high-confidence herb candidates: `5190`
- medium-confidence herb candidates: `22847`
- low-confidence herb candidates: `52523`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60355`
- promotion candidates: `143`
- identity-review candidates: `28`
- secondary candidates: `56245`
- deprioritized candidates: `3939`

### Local footprint

- size: `10.577 GiB`
- files: `10326`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals after the refresh:

- total documents: `3190`
- `edition-family`: `1866`
- `work-summary`: `1200`
- `herb-profile`: `124`

Exact work-id retrieval was re-verified for:

- `nlm-101509190X2`
- `nlm-64210120RX2`
- `nlm-61650830R`
- `nlm-9804174`

## Selector tuning after this pass

The botanical-reference profile was tightened before the next screen:

- several persistent Wellcome route-bad or low-value work IDs were moved into explicit exclusions
- `lecture introductory` was added as a title-phrase exclusion

That tune materially shifted the next shortlist away from some previously recycled lecture-shaped or route-weak witnesses.

## Next move

The refreshed shortlist after this pass still needed manual screening.

The immediate guidance after this checkpoint was:

- continue with a manual screen rather than a blind selector batch
- prefer route-verified Wellcome titles only when the text body is live
- keep the next slice mixed only if the Wellcome side is genuinely source-ready
