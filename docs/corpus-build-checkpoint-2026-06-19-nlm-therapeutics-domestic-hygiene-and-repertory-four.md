# Corpus Build Checkpoint - 2026-06-19

## Summary

This checkpoint captures the next NLM-led acquisition pass completed after the Merck, botanic, and practice four checkpoint.

Main outcomes:

- 4 additional rights-cleared NLM works were acquired and chunked successfully
- the pass stayed NLM-led because the previously checked Wellcome direct text routes were still unstable
- the batch broadened the archive with therapeutics, domestic physician, hygiene, and repertory coverage
- the derived corpus layers were rebuilt after the pass
- `Corpus Memory` was refreshed and exact work-id retrieval was re-verified for all 4 new works

## NLM therapeutics, domestic, hygiene, and repertory four completed

The following 4 works are now acquired and chunked successfully:

- `nlm-101509190X1` - *General therapeutics and materia medica : adapted for a medical textbook (Volume 1)* - `2111` chunks
- `nlm-2555010R` - *The domestic physician, and family assistant ...* - `283` chunks
- `nlm-07221330R` - *Optimistic medicine ...* - `623` chunks
- `nlm-64311130R` - *Repertory to Hering's Condensed materia medica* - `824` chunks

All 4 processed successfully through the current official NLM acquisition path.

## Batch characteristics

Taken together, this pass broadened the archive along four useful axes:

- one substantial therapeutics and materia-medica companion volume
- one practical domestic physician and family assistant reference with explicit medicinal-vegetable and pharmacy sections
- one hygiene-leaning practical health guide
- one specialized materia-medica repertory that can later help retrieval, indexing, and cross-reference work

This kept the archive moving into practical and reference-heavy medical territory without reopening the weaker route-quality question on the current Wellcome reserve.

## Current corpus totals

- registered works: `2720`
- chunked works: `1196`
- discovered works: `1517`
- failed works: `7`
- chunk records: `1534057`
- paragraph records: `1741888`

### By collection

- NLM Digital Collections: `384` chunked of `696` total
- Project Gutenberg: `27` chunked of `27` total
- Wellcome Collection: `785` chunked of `1997` total

### Derived signals

- edition families: `1866`
- actionable frontier families: `987`
- uncovered frontier families: `905`
- depth frontier families: `195`
- herb candidates: `80523`
- high-confidence herb candidates: `5185`
- medium-confidence herb candidates: `22826`
- low-confidence herb candidates: `52512`
- seed-ready herb families: `124`
- supporting families: `138`
- herb profiles: `124`
- seed-review families: `60319`
- promotion candidates: `142`
- identity-review candidates: `27`
- secondary candidates: `56211`
- deprioritized candidates: `3939`

### Local footprint

- size: `10.548 GiB`
- files: `10293`

## Corpus Memory status

`Corpus Memory` remains live and separate at `127.0.0.1:8766`.

Current semantic archive totals:

- total documents: `3186`
- `edition-family`: `1866`
- `work-summary`: `1196`
- `herb-profile`: `124`

Refresh status after this pass:

- the full refresh completed successfully
- `4` new work-summary documents were inserted
- exact work-id retrieval was re-verified for:
  - `nlm-101509190X1`
  - `nlm-2555010R`
  - `nlm-07221330R`
  - `nlm-64311130R`

## Lane status after this pass

Completed in this pass:

- `nlm-101509190X1`
- `nlm-2555010R`
- `nlm-07221330R`
- `nlm-64311130R`

Selector shift after this pass:

- `nlm-101509190X2` now rises as the natural companion follow-up to the newly landed therapeutics volume
- `nlm-64210120RX2` now rises as the companion follow-up to the newly landed American practice volume
- deeper repeat dictionary and dispensatory families remain present and still need active restraint

## Next move

The refreshed selector still offers usable NLM-led growth, but the ranking is now more visibly split between:

- worthwhile companion volumes
- useful uncovered practical works
- repeat-heavy dictionary and dispensatory families

That means the next campaign should:

- stay manually screened
- prefer one or two worthwhile companion volumes only when they materially complete a newly opened family
- keep uncovered practical health or materia-medica works in the slice
- continue holding Wellcome reserve titles behind route verification or an explicit fallback decision
